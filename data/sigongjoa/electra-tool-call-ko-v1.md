# SigongJoa/electra-tool-call-ko-v1

## Resumen

electra-tool-call-ko-v1 es un modelo encoder de tipo ELECTRA, desarrollado por SigongJoa, especializado en la tarea de tool calling (llamada a funciones) para coreano e inglés. A diferencia de los modelos generativos habituales, no produce texto libre: recibe la petición del usuario junto con las definiciones de herramientas y devuelve directamente en JSON qué herramienta invocar y con qué argumentos, seleccionando los fragmentos literales del texto original. Está pensado para ejecutarse en CPU y para que el host se encargue de la ejecución real de la herramienta.

El modelo se entrenó desde cero: tokenizador BPE de 32.768 tokens y encoder ELECTRA de 12 capas, hidden 256, 4 cabezas de atención y contexto máximo de 512 tokens, con aproximadamente 14,1 millones de parámetros totales (unos 13,77 millones en el encoder). La versión publicada el 2026-11-23 reentrena todos los pesos para añadir un modo de herramientas fijas de aplicación (`--app-tools`), orientado a acciones como abrir pantallas, crear notas o poner temporizadores.

Su relevancia radica en la propuesta de arquitectura: sustituir un LLM generativo por un encoder discriminativo ligero para una tarea estructurada y acotada, con un contrato de herramientas validado por código de reglas. La licencia es Apache-2.0, aunque el autor advierte que quedan por confirmar algunas condiciones de las fuentes de datos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (encoder transformer discriminativo, 12 capas, hidden 256, embedding 128, 4 cabezas de atención) |
| Parametros totales | ~14,1 millones (encoder ~13,77 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entrada = petición + definiciones de herramientas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, pytorch, ONNX (solo la parte neuronal) |

## Arquitectura y entrenamiento

El modelo es un encoder ELECTRA puro entrenado desde inicialización aleatoria. La fase de preentrenamiento usó un generador pequeño (hidden 64) que sustituye tokens y un discriminador de 12 capas que aprende a detectarlos mediante replaced token detection; tras el preentrenamiento se conservó únicamente el encoder del discriminador. El tokenizador es un BPE de 32.768 tokens, también entrenado desde cero, que preserva los caracteres Unicode y los espacios del texto original para permitir la selección exacta de fragmentos. El corpus de preentrenamiento comprende unos 620.000 documentos web educativos y material paralelo coreano-inglés; el encoder publicado corresponde a 29.184 pasos y aproximadamente 1.900 millones de tokens de entrada.

Sobre el encoder se añaden cabezas que predicen el estado, la herramienta y los intervalos de argumentos en el texto, en lugar de generar tokens. La primera fase de fine-tuning de tool calling (con datos públicos coreano-inglés) produjo los pesos anteriores (`94a7849`). La versión actual parte de esos pesos y se entrenó 3.500 pasos adicionales mezclando 60.000 peticiones sintéticas de herramientas fijas de aplicación generadas por reglas con 60.000 ejemplos del fine-tuning previo; se añadió un embedding del número de caracteres de cada token para mitigar el truncado del último carácter de los valores. En el modo de herramientas fijas, el cálculo de unidades, los alias de pantallas y los valores por defecto los resuelve código de reglas (`runtime/engine/app_tools.py`) que además valida el resultado contra el esquema de la aplicación.

## Capacidades

- Predicción de llamadas a funciones en formato JSON (estado, nombre de herramienta y argumentos) sin generación de texto libre.
- Selección de argumentos como intervalos literales del texto original (en el modo general, los valores deben aparecer tal cual en la petición).
- Cuatro estados de salida: `ok`, `needs_information`, `unsupported` y `no_call`.
- Modo de herramientas fijas de aplicación (`--app-tools`) con conversión de unidades ("3분 30초" a 210 segundos), alias de pantallas y valores por defecto.
- Soporte de hasta 8 herramientas y 24 campos en total por petición en el modo general.
- Capacidad bilingüe coreano-inglés, con tokenizador entrenado específicamente para ambos idiomas.
- Ejecución en CPU, con exportación ONNX de la parte neuronal.
- No soporta tool calling multi-turno ni recibe historial de conversación ni resultados previos de herramientas.
- No dispone de capacidades de visión, audio, razonamiento general ni generación de código.

## Casos de uso

- Asistentes de voz o texto en coreano para aplicaciones móviles: el modelo traduce peticiones como "pon un temporizador de 3 minutos y medio y abre las notas" en llamadas `set_timer` y `open_app` con argumentos ya normalizados, gracias al modo `--app-tools` y al contrato de la aplicación.
- Automatización de tareas del sistema en dispositivos con CPU: al no requerir GPU y pesar 0,2 GB en el repositorio, puede integrarse en un servicio local que procese comandos de usuario con baja latencia.
- Enrutamiento de comandos en asistentes domésticos: el estado `no_call` permite descartar charla o preguntas de funcionalidad antes de invocar herramientas, y `unsupported` señala peticiones fuera del catálogo disponible.
- Extracción estructurada de parámetros en pipelines de backoffice: para formularios o comandos donde la entrada es una frase y la salida debe ser un JSON con campos validados, el modo general impone que los valores estén presentes literalmente en el texto, lo que facilita la verificación.
- Despliegue de bajo coste en entornos con restricciones de hardware: la inferencia en CPU y el grafo ONNX permiten servir el modelo en contenedores sin GPU, con validación de integridad de los archivos mediante `package_manifest.json`.
- Prototipado de interfaces de voz para aplicaciones coreanas: el modelo cubre los tres casos fijos (notas, temporizadores y apertura de pantallas) y devuelve además el plan con los intervalos de evidencia, útil para depurar por qué se eligió una llamada.
- Filtrado previo en sistemas con LLM: usar el encoder como primera etapa para resolver comandos sencillos con coste mínimo y escalar al modelo generativo solo los casos que devuelvan `needs_information` o `unsupported`.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones internas del propio proyecto, no resultados de referencia externos. La evaluación de herramientas fijas usa 317 peticiones escritas a mano; la de tool calling general es un conjunto de regresión de desarrollo.

| Metrica | Pesos anteriores | Pesos actuales |
|---|---:|---:|
| Herramientas fijas: coincidencia exacta | 42 / 317 | 268 / 317 |
| Herramientas fijas: peticiones ejecutables resueltas | 27 / 191 | 158 / 191 |
| Herramientas fijas: ejecución indebida en peticiones no ejecutables | 44 / 126 | 4 / 126 |
| Herramientas fijas: peticiones con al menos una llamada errónea | 166 / 317 | 25 / 317 |
| Tool calling general: coincidencia exacta DEV | 883 / 1.304 | 898 / 1.304 |
| Tool calling general: auditoría de apps y música | 462 / 586 | 486 / 586 |
| Tool calling general: llamadas en peticiones no ejecutables (DEV / auditoría) | 24 / 5 | 37 / 31 |
| Nombres de app nuevos (sintético), nombre literal en el texto | 23 / 108 | 52 / 108 |
| Nombres de app nuevos (sintético), alias a nombre canónico | 12 / 24 | 1 / 24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que las cifras proceden de material generado dentro del proyecto y no reflejan la precisión en uso real.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; con ~14,1 millones de parámetros, los pesos en fp32 ocupan del orden de 56 MB y el repositorio completo 0,2 GB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede alojarlo con holgura, pero no aporta ventajas claras frente a CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU; el autor indica explícitamente que funciona en CPU.
- Opciones de despliegue: script `runtime/infer.py` con Python 3.12 y PyTorch, ejecutado con `-I -B` por la comprobación de integridad de `package_manifest.json`; exportación ONNX en `onnx/` para la parte neuronal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos adicionales: Python 3.12, `huggingface_hub` y `torch`; el contrato de herramientas fijas se puede personalizar con `--app-contract` usando una copia externa.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| electra-tool-call-ko-v1 | ~14,1 M | 512 tokens | Encoder discriminativo, tool calling coreano-inglés, CPU | Apache-2.0 |
| Alternativas generativas de tool calling (p. ej. modelos tipo Qwen o Llama con soporte de funciones) | Miles de millones | 8K-128K+ | LLM generativo con tool calling | Variables |
| Encoders ELECTRA multilingües (p. ej. variantes de mDeBERTa/ELECTRA) | 100 M-300 M | 512 tokens | Codificación general, sin cabezas de tool calling | MIT/Apache-2.0 |

Frente a un LLM generativo, este modelo ofrece un coste de inferencia y un tamaño mucho menores, a cambio de no cubrir razonamiento abierto, diálogo multi-turno ni herramientas fuera de su distribución de entrenamiento. Frente a un encoder general, aporta las cabezas específicas de predicción de herramienta y argumentos, pero con un vocabulario y un corpus de preentrenamiento propios y mucho más pequeños.

## Limitaciones y advertencias

- Las 317 peticiones de evaluación no pasaron revisión humana; las escribió el mismo autor (un agente basado en modelo de lenguaje) que generó las plantillas de entrenamiento, por lo que el modelo rinde mejor en peticiones parecidas a las de entrenamiento (69/94 en el tramo más lejano frente a 45/47 en el más cercano).
- Alrededor del 8% de las peticiones de herramientas fijas (25/317) producen alguna llamada errónea; el autor recomienda verificar el resultado o pedir confirmación al usuario antes de ejecutar.
- En tool calling general aumentaron las llamadas en peticiones que no deberían ejecutar nada (de 5 a 31 en la auditoría).
- El manejo de alias de aplicaciones empeoró notablemente: de 12/24 a 1/24; peticiones como "abre Spotify" pueden devolver `unsupported`, y las menciones musicales tienden a seleccionar la herramienta de música.
- Peticiones muy cortas como "pon un temporizador" pueden devolver `unsupported` en lugar de `needs_information`.
- Los errores restantes se concentran en límites de argumentos (separación de título y cuerpo, último carácter del valor), en interpretar frases narrativas ("ayer puse un temporizador y se me olvidó") como peticiones y en peticiones que requieren la misma herramienta dos veces.
- Entrenamiento con una sola semilla; no recibe historial de conversación ni resultados previos de herramientas.
- Contexto máximo de 512 tokens y límites de 8 herramientas y 24 campos; sin soporte multi-turno.
- En el modo general, los valores de los argumentos deben aparecer literalmente en el texto (sin conversión de unidades).
- Solo coreano e inglés; no hay datos sobre sesgos específicos más allá de los derivados del corpus educativo y paralelo utilizado.
- Riesgo de alucinación estructural: puede emitir llamadas plausibles pero incorrectas en lugar de abstenerse, especialmente en herramientas fuera de la distribución de entrenamiento.
- Licencia Apache-2.0, pero el autor señala que algunas condiciones de publicación de las fuentes de datos siguen pendientes de confirmación; conviene revisar `THIRD_PARTY_NOTICES.md` antes de un uso comercial.
- La comprobación de integridad impide modificar archivos dentro de `runtime/`; los cambios deben hacerse sobre copias externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1
- Revisión anterior de los pesos: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/tree/94a7849
- Evaluación: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/evaluation/README.md
- Conjunto de evaluación: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/evaluation/eval_v1.jsonl
- Ejemplos de herramientas: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/examples/open_app_tools.json
- Catálogo de alias: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/examples/catalog.json
- Peticiones de ejemplo: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/examples/app_requests.json
- Avisos de terceros: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/THIRD_PARTY_NOTICES.md
- Licencia: https://huggingface.co/SigongJoa/electra-tool-call-ko-v1/blob/main/LICENSE
