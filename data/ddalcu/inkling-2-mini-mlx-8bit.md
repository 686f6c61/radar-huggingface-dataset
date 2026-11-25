# ddalcu/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling-2-Mini-MLX-8bit es una cuantización en 8 bits para MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario ddalcu. El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad de entrada de imagen y texto, con 26.400 millones de parámetros totales y 3.400 millones activos por token. Esta versión concreta está empaquetada en el formato de mlx-lm y pensada para ejecutarse en Apple Silicon mediante la herramienta mlx-serve.

La relevancia de este paquete es que reduce el peso del modelo de los aproximadamente 50 GB en bf16 del release original a 18,7 GB, manteniendo una calidad prácticamente idéntica: la divergencia KL media frente al release es de 0,0040 sobre 7.318 posiciones de 8 ficheros reservados, con un 97,2 % de coincidencia en top-1 y una perplejidad de 6,149 frente a 6,147 del original. Esto lo convierte en una opción viable para ejecutar un MoE multimodal de 26,4B en equipos de consumo con memoria unificada.

El paquete conserva los expertos en sus bytes originales (NVFP4 en las capas 0-19 y MXFP8 en las 20-23), mientras que atención, embedding y cabeza se cuantizan a 8 bits afín con grupo de 64, la torre de visión permanece en bf16 y se incluye la cabeza de borrador (mtp.safetensors, 0,64 GB) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), layout mlx-lm |
| Parametros totales | 6.896.142.848 (según safetensors del paquete); el modelo base declara 26,4B totales |
| Parametros activos | 3,4B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín grupo 64 (atención, embedding, cabeza); expertos en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más mtp.safetensors para la cabeza de borrador |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con capacidades multimodales (entrada de texto e imagen) y una torre de visión dedicada. Esta versión no reentrena ni modifica el modelo: es una conversión de pesos al layout de mlx-lm. Los expertos se conservan en sus formatos de cuantización originales (NVFP4 en las capas 0-19, MXFP8 en las 20-23), lo que preserva el comportamiento del release en esas capas. Las partes que el release almacena en bf16 (atención, embedding y cabeza) se cuantizan a 8 bits afín con grupo de 64, y la torre de visión se mantiene en bf16.

La innovación técnica del paquete es doble. Por un lado, la cuantización selectiva: solo se comprimen las capas que más pesan en lectura por token (atención y cabeza se leen completas en cada token, y el paso a 8 bits reduce a la mitad esos bytes), lo que según el autor aporta aproximadamente un 15 % más de velocidad de decodificación frente al release servido tal cual. Por otro lado, se incluye la cabeza de borrador `mtp.safetensors` (0,64 GB) que habilita decodificación especulativa en mlx-serve sobre M3 y posteriores. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Comprensión de imágenes combinada con texto (pipeline image-text-to-text).
- Razonamiento y generación de código y matemáticas, heredados del modelo base (sin datos de benchmark en la información disponible).
- Decodificación especulativa mediante la cabeza de borrador incluida, con aceleración de decodificación en mlx-serve sobre M3 y posteriores.
- Ejecución local en Apple Silicon con memoria unificada mediante mlx-serve y mlx-lm.
- Soporte de tool calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el paquete se ejecuta con `mlx-serve --model ddalcu/Inkling-2-Mini-MLX-8bit --serve` y permite mantener un asistente multi-turno en un equipo de sobremesa con memoria unificada, sin depender de la nube.
- Análisis de imágenes en local: al ser un modelo image-text-to-text, sirve para describir capturas, extraer información de documentos escaneados o responder preguntas sobre imágenes sin enviar datos a terceros, algo relevante para flujos con material sensible.
- Prototipado de agentes multimodales: la inclusión de la cabeza de borrador y el soporte de mlx-serve facilitan iterar sobre pipelines que combinan entrada visual y texto con latencias de decodificación de 84-118 tok/s en M4 Max y M5 Ultra.
- Evaluación de modelos MoE en hardware de consumo: con 18,7 GB de peso, un M1 Pro de 32 GB puede cargarlo y decodificar a 28 tok/s, lo que permite estudiar el comportamiento de un MoE de 26,4B sin acceso a GPUs de datacenter.
- Generación de código asistida en el editor: el modelo base declara capacidades de código; el paquete permite integrarlo en un servidor local compatible con la API de mlx-serve para autocompletado y explicación de fragmentos.
- Investigación en cuantización: el paquete documenta métricas de fidelidad (KLD 0,0040, top-1 97,2 %, perplejidad 6,149) que lo convierten en una referencia reproducible para comparar estrategias de cuantización selectiva sobre MoE.

## Benchmarks y rendimiento

Calidad frente al release original (teacher-forced top-20, 8 ficheros reservados, 7.318 posiciones):

| Metrica | Release | Este paquete |
|---|---|---|
| KLD media | – | 0,0040 |
| Coincidencia top-1 | – | 97,2 % |
| Perplejidad | 6,147 | 6,149 |

El autor indica que 0,0040 está en el suelo de ruido de la medición (dos cálculos exactos del mismo paquete difieren entre 0,0037 y 0,0042). Además, sobre 3.995 posiciones, mlx-serve y mlx-lm coinciden en este paquete con KLD 0,0030 y top-1 del 97,9 %.

Velocidad con mlx-serve (llmprobe 0.6.18, greedy, decodificación de 192 tokens):

| Equipo | Decodificacion | Decodificacion con borrador | Procesamiento de prompt |
|---|---|---|---|
| M5 Ultra | 118 tok/s | hasta 155 tok/s | 4.900 tok/s |
| M4 Max | 84 tok/s | hasta 96 tok/s | 1.010 tok/s |
| M1 Pro 32 GB | 28 tok/s | – | 190 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete ocupa 18,7 GB en disco; en ejecución necesita al menos esa cantidad más el overhead de mlx-serve y del contexto, por lo que se recomienda un equipo con 24-32 GB de memoria unificada como mínimo.
- GPU recomendadas: Apple Silicon. Los datos del autor cubren M5 Ultra, M4 Max y M1 Pro de 32 GB. No hay datos para GPUs NVIDIA (A100, H100, RTX 4090) porque el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada suficiente (M1 Pro 32 GB funciona a 28 tok/s). No aplica a GPUs de consumo discretas al no ser un formato GGUF/CUDA.
- Opciones de despliegue: mlx-serve (recomendado por el autor, con soporte de decodificación especulativa) y mlx-lm (PR #2086). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 118 tok/s (M5 Ultra), 84 tok/s (M4 Max) y 28 tok/s (M1 Pro 32 GB) en decodificación greedy; con borrador sube a 155 y 96 tok/s respectivamente. Procesamiento de prompt de 4.900, 1.010 y 190 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddalcu/Inkling-2-Mini-MLX-8bit | 6.896M en safetensors (26,4B totales, 3,4B activos) | no disponible | MLX safetensors, 8-bit | Apache 2.0 | Hugging Face, 3.784 descargas |
| thinkingmachines/Inkling-2-Mini (release) | 26,4B totales, 3,4B activos | no disponible | bf16 (formato original) | Apache 2.0 | Hugging Face |
| Versiones GGUF de la misma familia | no disponible | no disponible | GGUF | Apache 2.0 | no disponible en la información |

La comparación directa más relevante es con el release original: este paquete reduce el peso de ~50 GB a 18,7 GB, mantiene la calidad dentro del ruido de medición y decodifica aproximadamente un 15 % más rápido en mlx-serve. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: cualquier sesgo o alucinación del modelo base se hereda. No se dispone de información sobre sesgos conocidos del modelo base.
- La cuantización a 8 bits de atención, embedding y cabeza introduce una divergencia pequeña pero no nula (KLD 0,0040, top-1 97,2 %); en tareas sensibles a la fidelidad exacta conviene validar contra el release.
- Solo funciona en el ecosistema MLX (Apple Silicon). No hay pesos GGUF ni CUDA en este repositorio, lo que limita su despliegue en servidores con GPUs NVIDIA.
- Longitud de contexto e idiomas soportados no están documentados en la información disponible; no se puede garantizar un rendimiento multilingüe concreto.
- El paquete requiere mlx-serve o mlx-lm #2086; versiones anteriores de mlx-lm pueden no cargarlo.
- La decodificación especulativa con la cabeza de borrador solo está disponible en M3 y posteriores según el autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, también Apache 2.0 según los metadatos.
- El repositorio es una conversión de terceros (ddalcu), no una publicación oficial de Thinking Machines; para producción conviene fijar la revisión concreta del paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta mlx-serve: https://github.com/ddalcu/mlx-serve/releases
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- mlx-lm (PR #2086): no disponible como enlace directo en la información proporcionada
