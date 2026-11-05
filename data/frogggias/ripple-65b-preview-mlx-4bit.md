# frogggias/Ripple-65B-Preview-MLX-4bit

## Resumen

Ripple-65B-Preview-MLX-4bit es una conversión no oficial del modelo denso Ripple-65B-Preview (publicado por Ricursive AI en BF16) al formato MLX con cuantización afín de 4 bits, pensada para ejecución en Apple Silicon. El repositorio lo mantiene el usuario independiente frogggias y no está respaldado por Ricursive. El modelo base es un transformer denso de aproximadamente 64.800 millones de parámetros, orientado a generación de texto conversacional con modo de razonamiento interno.

La relevancia de esta conversión reside en que permite ejecutar un modelo de 65B en un Mac con 64 GB de memoria unificada o más, algo imposible con el checkpoint BF16 original (unos 130 GB). El repositorio incluye un puerto propio de la arquitectura en MLX (`ricursive.py`, unas 280 líneas), ya que mlx-lm todavía no reconoce la arquitectura Ricursive de forma nativa y requiere `--trust-remote-code`.

La arquitectura combina 80 capas con atención híbrida: 16 capas de atención global que conservan todo el contexto y 64 capas con ventana deslizante de 1.024 tokens. El modelo está disponible bajo licencia Apache-2.0, igual que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas globales + 64 capas de ventana deslizante de 1.024 tokens), puerto MLX de `modeling_ricursive.py` |
| Parametros totales | 64.782.689.280 (~64,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana global completa en 16 capas; ventana deslizante de 1.024 tokens en las otras 64. Longitud máxima de contexto no disponible |
| Tipos de cuantizacion | MLX afín 4-bit con grupos de 64 (4,5 bits por peso); existe también una versión MLX 8-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `ricursive.py` como archivo de modelo y `model_file` declarado en `config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros con un esquema de atención híbrido poco habitual: solo 16 de sus 80 capas mantienen la totalidad del contexto en la caché KV (64 KiB por token), mientras que las 64 restantes aplican una ventana deslizante de 1.024 tokens. Esto reduce drásticamente el coste de memoria de la caché frente a un transformer de atención completa equivalente. La conversión MLX cuantiza todos los pesos lineales y de embedding a 4 bits afín con grupos de 64, y mantiene en BF16 las capas de normalización y las mezclas de value-residual por capa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base. La model card indica únicamente que el checkpoint convertido corresponde a la revisión `240d5966cbe0` de la release BF16 instruction-tuned. La conversión se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64 --dtype bfloat16` y el puerto `ricursive.py` fue validado contra el `modeling_ricursive.py` original sobre modelos pequeños con pesos aleatorios: los logits en float32 coinciden con un error de ~5e-6 en forward completo, decodificación con caché y prompts fragmentados por encima y por debajo de la ventana deslizante; el forward cuantizado coincide con la referencia usando los mismos pesos dequantizados hasta 2e-6.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat heredada del modelo original.
- Modo de razonamiento interno: el modelo emite su cadena de pensamiento dentro de `<think>…</think>` en el contenido de la respuesta (el tokenizador no dispone de marcadores de un solo token para que mlx-lm los separe).
- Tool calling / function calling: mlx-lm analiza las llamadas de herramienta de Ripple mediante el parser `json_tools` inferido de la plantilla de chat, con formato `<tool_call>` en JSON.
- Generación de código, incluida la finalización de código sin instrucciones (raw code completion).
- Capacidades multilingües: no disponible en la información proporcionada.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en estación de trabajo Apple: el modelo puede mantener conversaciones multi-turno con razonamiento visible en `<think>`, ejecutado íntegramente en local con `mlx_lm.server`, lo que resulta adecuado para entornos con requisitos de privacidad estrictos.
- Generación y revisión de código en local: la finalización de código sin instrucciones y la generación con instrucciones permiten integrarlo en editores o scripts de revisión sobre un Mac Studio, sin depender de APIs externas.
- Agente con tool calling: el parser `json_tools` permite conectar el modelo a herramientas externas (consulta de APIs, ejecución de comandos controlada) en flujos multi-paso gestionados por el cliente.
- Automatización de tareas de documentación: con ventana global en 16 capas y ventana deslizante de 1.024 tokens, procesa documentos largos por tramos con un coste de caché KV contenido (64 KiB por token solo en las capas globales).
- Evaluación y prototipado de arquitecturas híbridas: investigadores que quieran estudiar el comportamiento de atención con ventana deslizante frente a atención global pueden ejecutar el modelo en hardware de consumo profesional sin clúster de GPU.
- Servicio de inferencia para un equipo pequeño: el servidor compatible con OpenAI y el throughput medido (42,5 tok/s agregados para tres usuarios a 32K de contexto) permiten desplegar un endpoint interno para un grupo reducido de desarrolladores.
- Fine-tuning ligero o experimentación con adaptadores: al ser MLX y safetensors, el checkpoint puede servir de base para experimentos de ajuste en Apple Silicon, aunque no se documenta soporte oficial de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí documenta una comparación de calidad frente al BF16 original y medidas de velocidad:

| Metrica | Valor |
|---|---|
| Acuerdo top-1 con BF16 (3 prompts) | 0,92–1,00 |
| Divergencia KL con BF16 | 0,005–0,09 |
| Salida greedy idéntica a BF16 | En 2 de 3 prompts; en el prompt largo diverge tras 10 tokens con una trayectoria igualmente razonable |
| Decodificación (1 stream, 1K–32K contexto) | 22,0–23,3 tok/s |
| Prefill | 535–565 tok/s (~1 minuto para un prompt nuevo de 32K tokens) |
| Servidor a 32K contexto, 1 usuario | 20,2 tok/s |
| Servidor a 32K contexto, 2 usuarios | 32,6 tok/s agregados |
| Servidor a 32K contexto, 3 usuarios | 42,5 tok/s agregados |

Las medidas se tomaron en un Mac Studio con M5 Ultra y 256 GB de memoria, con mlx-lm 0.32.2.

## Requisitos de hardware

- Memoria: el repositorio ocupa 37 GB (4,5 bits por peso); la model card recomienda un Mac con 64 GB de memoria unificada o más.
- GPU: no aplica en el sentido convencional; requiere Apple Silicon. Las cifras de rendimiento proceden de un M5 Ultra con 256 GB. No hay datos publicados para chips con menos memoria.
- Cabe en GPU de consumo: no es un formato para GPU NVIDIA/AMD; es exclusivo de MLX sobre Apple Silicon. Para hardware CUDA habría que usar el checkpoint BF16 original de Ricursive (no disponible en esta conversión).
- Despliegue: `mlx-lm` (>= 0.32.2) con `--trust-remote-code`, tanto por CLI (`mlx_lm.generate`) como en Python (`mlx_lm.load` / `generate`) y como servidor compatible con OpenAI (`mlx_lm.server`).
- Latencia y throughput: ver tabla de la sección anterior; la decodificación ronda 22 tok/s en un solo stream y el prefill de 32K tokens tarda aproximadamente un minuto.
- Existe una variante MLX 8-bit del mismo autor (`frogggias/Ripple-65B-Preview-MLX-8bit`) para quienes priorizan calidad sobre memoria.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos (mismo tamaño y misma tarea) en la documentación proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, se puede contrastar con el propio checkpoint original:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MLX-4bit (este) | ~64,8B denso | Global en 16 capas + ventana 1.024 en 64 capas | MLX 4-bit, safetensors | Apache-2.0 | HuggingFace, Apple Silicon |
| Ripple-65B-Preview (original, Ricursive) | ~64,8B denso | Global en 16 capas + ventana 1.024 en 64 capas | BF16 (PyTorch) | Apache-2.0 | HuggingFace, requiere ~130 GB |
| Ripple-65B-Preview-MLX-8bit (mismo autor) | ~64,8B denso | Global en 16 capas + ventana 1.024 en 64 capas | MLX 8-bit, safetensors | Apache-2.0 | HuggingFace, Apple Silicon |

Otros modelos comparables de la misma categoría: no disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está creada ni respaldada por Ricursive AI; los posibles problemas de calidad deben atribuirse a la cuantización y al puerto MLX, no al modelo original.
- Requiere `--trust-remote-code`: el repositorio carga código Python propio (`ricursive.py`). La model card aconseja leerlo antes de ejecutarlo, práctica recomendable en cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponible; no se publica información sobre composición del dataset ni evaluación de sesgos.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Contexto: la ventana efectiva está limitada a 1.024 tokens en 64 de las 80 capas; solo las 16 capas globales retienen el contexto completo, lo que puede degradar el seguimiento de dependencias largas.
- Razonamiento: el contenido `<think>` llega dentro del campo de contenido de la respuesta, no como campo separado; los clientes deben parsearlo explícitamente.
- Sin valores de muestreo por defecto publicados: Ricursive no publica defaults de sampling, por lo que hay que elegir temperatura, top-p y similares manualmente.
- Rendimiento: 22 tok/s en un solo stream es modesto para uso interactivo intensivo; el prefill de un prompt nuevo de 32K tokens tarda cerca de un minuto.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el aviso de licencia y documentar los cambios (cuantización, `model_file`, `ricursive.py`) tal como exige la propia licencia.
- Sin métricas de benchmarks estándar: no hay datos de MMLU, HumanEval o GSM8K que permitan situar el modelo frente a alternativas.

## Enlaces

- Repositorio HuggingFace (esta conversión): https://huggingface.co/frogggias/Ripple-65B-Preview-MLX-4bit
- Versión MLX 8-bit del mismo autor: https://huggingface.co/frogggias/Ripple-65B-Preview-MLX-8bit
- Modelo base original (Ricursive AI): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Librería mlx-lm: no se proporciona enlace en la información disponible
- Papers, blogs, repositorios adicionales o demos: no disponible en la información proporcionada
