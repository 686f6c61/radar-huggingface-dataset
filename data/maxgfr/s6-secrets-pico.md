# maxgfr/s6-secrets-pico

## Resumen

s6-secrets-pico es un modelo de clasificación de texto de dominio muy específico desarrollado por maxgfr dentro del proyecto skycmd. Su tarea es leer un fragmento corto de texto (un fichero de configuración, un `.env` o unas pocas líneas de código) y determinar si expone un secreto utilizable, qué servicio lo emitió, de qué tipo de valor se trata y en qué línea aparece. Es, por tanto, un modelo de decisión orientado a la detección de credenciales, no un modelo generativo de propósito general.

La arquitectura es un transformer tipo "system-one" con pesos ternarios y salidas tempranas en cascada (cuatro pasadas de bloque con un punto de salida tras cada una). El autor declara 445.345 parámetros en la model card, aunque el dato real de safetensors registrado en Hugging Face es de 193.793 parámetros. El modelo se distribuye en formato GGUF y está diseñado para ejecutarse exclusivamente en el motor skycmd (Rust, con soporte nativo, WASM, Node, Python, CLI y servidor).

Su relevancia radica en el tamaño extremo (unos 250 KB según el autor) y en el enfoque de evaluación: el autor pre-registró un criterio de publicación antes de entrenar y lo superó frente a un escáner de reglas estilo gitleaks en un banco sintético de tipos de fichero no vistos en entrenamiento. No obstante, el propio autor advierte que el banco es sintético y que el modelo no debe usarse como único escáner de secretos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "system-one" con pesos ternarios y salidas tempranas en cascada (4 pasadas de bloque) |
| Parametros totales | 193.793 (safetensors); la model card declara 445.345 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de estado de 320 tokens; textos de entrenamiento de 2 a 7 líneas |
| Tipos de cuantizacion | Ternaria (GGUF ternario) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer compacto de decisión con pesos ternarios y un mecanismo de salida temprana: hay un punto de salida tras cada una de las cuatro pasadas de bloque. En el GGUF distribuido, los tres umbrales de salida (`skycmd-s2.exit_threshold.{choice,score,noul}`) están fijados a 1, de modo que el modelo responde siempre a plena profundidad (las cuatro pasadas). Los pesos corresponden byte a byte al fichero evaluado. El consumidor puede modificar los umbrales en tiempo de ejecución (`setExitThreshold` en el navegador).

El entrenamiento se realizó sobre textos sintéticos de 2 a 7 líneas, con claves que reproducen el formato público de cada proveedor con un cuerpo aleatorio. El modelo no genera texto libre: responde a cuatro preguntas tipadas con probabilidades calibradas en una sola pasada hacia adelante. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La evaluación se realizó con una única ejecución y una única semilla.

## Capacidades

- Clasificación binaria de exposición de secretos: responde si el texto expone un secreto utilizable que debería revocarse (pregunta `noul`).
- Identificación del servicio emisor entre 15 opciones: `aws`, `github`, `gitlab`, `stripe`, `slack`, `openai`, `anthropic`, `google`, `huggingface`, `sendgrid`, `npm`, `private_key`, `database`, `generic` y `none`.
- Clasificación del tipo de valor entre 5 opciones: `secret`, `test`, `public`, `placeholder` y `other`.
- Localización de la línea que expone el secreto (de `line 1` a `line N`, o `none`).
- Probabilidades calibradas por pregunta en una sola pasada (ECE de 0,0009 en `secret`, 0,0154 en `service`, 0,0010 en `kind` y 0,3051 en `line`).
- Ejecución en navegador vía WASM, en Node, Python, CLI y servidor a través del motor skycmd.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Pre-filtro en pipelines de CI/CD: el modelo puede clasificar fragmentos de configuración y código antes de pasarlos por un escáner de reglas más costoso, reduciendo el volumen de candidatos. Su latencia de unos 786 a 789 µs por decisión en nativo lo hace viable para grandes lotes.
- Revisión de ficheros `.env` y `docker-compose` en pre-commit hooks: al ejecutarse en WASM dentro del navegador o en Node, puede integrarse en herramientas locales sin enviar datos a ningún servidor.
- Clasificación del tipo de credencial detectada: distinguir entre secreto vivo, clave de test, clave publicable y placeholder permite priorizar alertas y reducir falsos positivos por valores de ejemplo.
- Etiquetado de datasets de seguridad: el modelo puede anotar corpus de configuraciones con el servicio emisor y el tipo de valor para entrenar o evaluar otros detectores.
- Detección en el navegador para demos y formación: el Space asociado ejecuta todo localmente, lo que permite demostrar detección de secretos sin exfiltrar el texto pegado.
- Enriquecimiento de alertas en herramientas de análisis estático: añadir la etiqueta de servicio (`aws`, `github`, `stripe`, etc.) a los hallazgos permite enrutar la revocación al equipo o API correctos.

## Benchmarks y rendimiento

Resultados sobre `secret_bench`: 1.996 textos sintéticos en cuatro tipos de fichero no vistos en entrenamiento (docker-compose, toml, go, ini), 7.984 preguntas, GGUF ternario a plena profundidad. Comparación con un escáner de reglas estilo gitleaks medido antes del entrenamiento:

| Pregunta | s6-secrets-pico | Escáner de reglas |
|---|---:|---:|
| secret: ¿expone el texto un secreto utilizable? | 0,9990 | 0,977 (precisión 0,966, recall 0,989) |
| service: ¿qué servicio lo emitió? (15 opciones) | 0,9795 | 0,787 |
| kind: secreto, clave de test, clave publicable, placeholder, no credencial | 0,9990 | no se evalúa |
| line: ¿qué línea lo expone? | 0,6859 | no se evalúa |

- Criterio pre-registrado: secret > 0,977 y service > 0,787, ternario, a plena profundidad. Superado.
- Validación en tipos de fichero vistos: 0,998 agrupado sobre las cuatro preguntas.
- Calibración (ECE, test): secret 0,0009; service 0,0154; kind 0,0010; line 0,3051.
- Latencia medida por el autor en un Apple M5 con un entrenamiento en GPU en paralelo: mediana de 786 a 789 µs por decisión en nativo sobre las 7.984 preguntas; de 1.420 a 1.427 µs en WASM bajo Node en las primeras 200. WASM y nativo coinciden hasta 1,2e-6 en esas 200 preguntas, con la misma respuesta en todas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo pesa unos 250 KB en formato ternario GGUF, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En el benchmark del autor se usó un Apple M5 en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 4090, RTX 3060, integradas, etc.), aunque no es necesario.
- Opciones de despliegue: exclusivamente el motor skycmd (`sky-serve`), instalable vía `cargo install --git https://github.com/maxgfr/skycmd sky-serve`; soporta navegador (WASM), Node, Python, CLI y servidor. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: mediana de 786 a 789 µs por decisión en nativo y de 1.420 a 1.427 µs en WASM bajo Node, medidos en un Apple M5 con carga concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| s6-secrets-pico | 193.793 (safetensors); 445.345 declarados | 320 tokens | Clasificación de secretos (4 preguntas) | Apache 2.0 | GGUF ternario |
| Escáner de reglas estilo gitleaks | No aplica (basado en regex) | No aplica | Detección de secretos por patrones | Variable según implementación | No aplica |
| Modelos de clasificación de texto genéricos (p. ej. BERT-base) | ~110 M | 512 tokens | Clasificación general | Variable | Safetensors, GGUF |

No se dispone de información sobre otros modelos comparables de detección de secretos con arquitectura neuronal en la documentación proporcionada. La comparación directa disponible es con el escáner de reglas, que el modelo supera en las dos preguntas que ambos responden (secret y service) sobre el banco sintético.

## Limitaciones y advertencias

- El banco de evaluación es sintético: sus formatos, plantillas de fichero y proporciones de clases provienen del generador del propio autor, y cada clave es el formato público de un proveedor con un cuerpo aleatorio. Superar al escáner ahí no dice nada sobre fugas reales en repositorios reales. No debe usarse como único escáner de secretos.
- La respuesta de línea no funciona todavía: 0,6859 global y con exceso de confianza cuando falla (ECE 0,3051). En los 1.010 textos del banco que exponen un secreto, acierta la línea correcta 383 veces; los textos sin secreto, donde `none` es correcto, sostienen la puntuación.
- Los fallos de servicio se concentran en código Go: 34 de 41, donde asigna `database` a claves de otros servicios.
- Solo procesa textos cortos: el entrenamiento usa textos de 2 a 7 líneas y la ventana de estado admite 320 tokens; un texto más largo se recorta.
- Una sola ejecución y una sola semilla en la evaluación.
- Solo admite inglés y las preguntas exactas del entrenamiento; no es un modelo conversacional ni admite instrucciones libres.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza, especialmente en la pregunta de línea.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-secrets-pico
- Demo (Space): https://huggingface.co/spaces/maxgfr/s6-secrets-pico
- Código (Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-secrets-prereg.md
- Página de resultados: https://maxgfr.github.io/skycmd/results/
