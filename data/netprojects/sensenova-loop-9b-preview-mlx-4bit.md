# netprojects/SenseNova-Loop-9B-Preview-MLX-4bit

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal desarrollado por SenseTime a traves de su division SenseNova, publicado el 30 de octubre de 2026 bajo licencia Apache 2.0. Se trata de un transformer basado en Qwen3.5 con dos modificaciones arquitectonicas principales: ejecucion en bucle (looped execution) de un bloque central de capas con pesos compartidos, y conexiones residuales de dos flujos con restriccion de variedad (two-stream manifold-constrained hyper-connections, mHC). El modelo esta disenado para flujos de trabajo agenticos, contexto largo, comprension de documentos y generacion de codigo.

La ficha que nos ocupa, `netprojects/SenseNova-Loop-9B-Preview-MLX-4bit`, no es el modelo original sino una conversion a formato MLX con cuantizacion de 4 bits (afin, tamano de grupo 64) realizada por NetProjects (Internet Projects Ltd), orientada a ejecucion en Apple Silicon. Ocupa 4,7 GB de pesos y no es una publicacion oficial de SenseTime; el autor declara explicitamente no tener afiliacion con SenseNova. El modelo base cuenta con 8.956.949.376 parametros segun los safetensors del repositorio (etiquetado como "9B", aunque la model card original de SenseNova menciona 10B en su descripcion de Hugging Face, discrepancia no resuelta en la informacion disponible).

Su relevancia radica en dos factores: por un lado, la arquitectura looped con mHC es una de las pocas implementaciones open-weight de esta idea orientadas a produccion y no solo a investigacion; por otro, esta conversion permite ejecutar un modelo de ~9B con profundidad efectiva de 56 pasadas de capa por token en un portatil Apple Silicon con memoria unificada, algo que hasta ahora requeria hardware de datacenter. La contrapartida es una perdida notable de fidelidad respecto a la referencia en bf16 (89,2% de coincidencia en el token mas probable frente al 97,6% del build de 8 bits).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only looped (Qwen3.5) con two-stream mHC y Gated DeltaNet en capas seleccionadas |
| Parametros totales | 8.956.949.376 (segun safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits, afin, tamano de grupo 64 (los 96 tensores de router mHC permanecen en float32 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 32 capas distintas construido sobre Qwen3.5. Su innovacion central es la ejecucion en bucle: las capas 0-3 se ejecutan una vez, las capas 4-27 se ejecutan dos veces compartiendo pesos, y las capas 28-31 se ejecutan una vez, lo que resulta en 56 pasadas de capa por token. Cada pasada dispone de su propia ranura de cache (KV cache para atencion completa, estado convolucional y recurrente para Gated DeltaNet). Adicionalmente, las capas 4-27 incorporan two-stream mHC: el estado oculto se divide en dos flujos residuales enrutados por routers en float32 (puertas pre/post y una matriz de mezcla 2x2 Sinkhorn con 20 iteraciones). Los 96 tensores de router se mantienen en float32 y nunca se cuantizan.

Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion) no se ha proporcionado informacion en la documentacion disponible. La conversion MLX ha sido realizada por NetProjects mediante conversion de formato y cuantizacion a 4 bits; el codigo del modelo (`sensenova_loop.py`) se incluye en el repositorio y se carga mediante `mlx-lm` con `trust_remote_code=True`. El autor reporta que este build sigue la referencia PyTorch (Transformers 5.18, bf16) con un 89,2% de coincidencia en el token mas probable y una divergencia KL de 0,064 en el ultimo token, frente al 97,6% y 0,0011 del build de 8 bits.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`).
- Razonamiento con modo thinking opcional, activable mediante `enable_thinking=True` en la plantilla de chat.
- Comprension de documentos e imagenes: el modelo base es multimodal (image-text-to-text), aunque esta build MLX de 4 bits es solo texto y no incluye entrada de imagen.
- Generacion de codigo: el modelo base esta orientado a flujos de trabajo que combinan comprension de documentos, codigo e interaccion con herramientas externas.
- Soporte de tool calling y function calling: segun la descripcion del modelo base en GitHub, esta disenado para interaccion con herramientas externas, aunque no se detalla el formato exacto en la informacion disponible.
- Flujos agenticos multi-paso: el modelo base esta explicitamente orientado a workflows agenticos y contexto largo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: con 4,7 GB de pesos y ~22 tokens/s en un M5 Max, este build permite desplegar un asistente de chat en un MacBook Pro sin conexion a servicios externos, usando `mlx_lm.server` como backend compatible con la API de chat.
- Razonamiento con cadena de pensamiento en local: activando `enable_thinking=True` se puede usar el modelo para tareas de razonamiento paso a paso en un portatil, util para prototipado de agentes antes de migrar a hardware mayor.
- Generacion de codigo en entornos de desarrollo con restricciones de red: al ejecutarse integramente en local, encaja en entornos donde no se permite enviar codigo propietario a APIs externas; el modelo base esta orientado a tareas de codigo y tool use.
- Procesamiento de documentos en flujos agenticos: aunque esta build no acepta imagenes, el modelo base esta disenado para comprension de documentos; en esta version se puede usar la parte de razonamiento sobre texto extraido por OCR u otras herramientas.
- Evaluacion y experimentacion con arquitecturas looped: investigadores pueden reproducir el comportamiento del modelo con el codigo `sensenova_loop.py` incluido y comparar la fidelidad de distintas cuantizaciones (4, 6 y 8 bits) frente a la referencia PyTorch en bf16.
- Prototipado de agentes con tool calling en macOS: el modelo base soporta interaccion con herramientas externas, por lo que este build sirve para validar pipelines de agentes en local antes de desplegarlos en infraestructura con el modelo completo.
- Fine-tuning o experimentacion con MLX: al estar en formato MLX y safetensors, es adecuado para experimentos de ajuste o evaluacion en el ecosistema Apple MLX sin necesidad de GPUs NVIDIA.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversion (NetProjects) en un MacBook Pro M5 Max de 128 GB, a 7 de noviembre de 2026. La comparativa de fidelidad usa 16 prompts y todas las posiciones frente a la referencia PyTorch (Transformers 5.18, bf16):

| Metrica | bf16 (referencia) | 8 bits | 6 bits | 4 bits |
|---|---|---|---|---|
| Coincidencia en token mas probable | 100% (referencia) | 97,6% | 97,2% | 89,2% |
| Divergencia KL en el ultimo token | 0 (referencia) | 0,0011 | 0,0037 | 0,064 |
| Tamano de pesos | no disponible | 8,9 GB | 6,8 GB | 4,7 GB |

Benchmark publico corto (mismo harness para todos los builds; primeras 300 preguntas del test de ARC-Challenge con log-likelihood sobre las 4 opciones; primeras 50 preguntas del test de GSM8K con plantilla de chat, thinking desactivado y decodificacion greedy):

| Metrica | bf16 | 8 bits | 6 bits | 4 bits |
|---|---|---|---|---|
| ARC-Challenge acc | 48,7 | 48,7 | 47,7 | 45,7 |
| ARC-Challenge acc_norm | 51,0 | 50,3 | 49,0 | 45,0 |
| GSM8K (50 preguntas) | no disponible | 94,0 | 88,0 | 92,0 |

El autor advierte que en GSM8K con 50 preguntas cada pregunta mueve 2 puntos porcentuales, por lo que la diferencia entre 88 y 92 no es necesariamente significativa. No se han publicado resultados de benchmarks del modelo base original en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 4,7 GB solo para los pesos en 4 bits; hay que sumar el overhead de la cache KV y del estado de Gated DeltaNet, que en esta arquitectura se duplica por las 56 pasadas de capa por token y las ranuras de cache independientes.
- GPU recomendadas: el autor ha validado el modelo en un MacBook Pro con chip M5 Max y 128 GB de memoria unificada, alcanzando ~22 tokens/s en decodificacion (ejecucion corta). No se han publicado mediciones en GPUs NVIDIA (A100, H100, RTX 4090) para este build MLX.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; el tamano de pesos de 4,7 GB lo hace viable en Macs con 16 GB o mas, aunque el overhead de cache debe verificarse empiricamente.
- Opciones de despliegue: `mlx-lm` (libreria `mlx`), con soporte de servidor mediante `mlx_lm.server --model netprojects/SenseNova-Loop-9B-Preview-MLX-4bit --trust-remote-code`. No es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, al ser un formato MLX especifico con codigo remoto.
- Latencia y throughput: ~22 tokens/s en decodificacion sobre M5 Max (128 GB). El autor senala que el bucle duplica el trabajo de las 24 capas centrales, por lo que es mas lento que un modelo plano de 9B; ese es el coste de la profundidad adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/SenseNova-Loop-9B-Preview-MLX-4bit | 8.956.949.376 | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face (MLX) |
| netprojects/SenseNova-Loop-9B-Preview-MLX-6bit | no disponible | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face (MLX) |
| netprojects/SenseNova-Loop-9B-Preview-MLX-8bit | no disponible | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face (MLX) |
| sensenova/SenseNova-Loop-9B-Preview | ~10B (segun model card) | no disponible | bf16 | Apache 2.0 | Hugging Face (original) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (looped transformers open-weight) en la documentacion proporcionada. Las alternativas mas directas son las otras cuantizaciones del mismo modelo publicadas por el mismo autor, que permiten intercambiar tamano por fidelidad.

## Limitaciones y advertencias

- Perdida de fidelidad significativa en 4 bits: solo el 89,2% de coincidencia en el token mas probable frente a la referencia bf16, con divergencia KL de 0,064. El propio autor recomienda usar 6 u 8 bits cuando la calidad sea prioritaria.
- Sin soporte de imagen: aunque el modelo base es multimodal (image-text-to-text), esta build es solo texto y no incluye entrada de imagen.
- Rendimiento inferior a un modelo plano de 9B en velocidad: el bucle duplica el trabajo de las 24 capas centrales, resultando en ~22 tokens/s en M5 Max.
- Requiere `trust_remote_code=True`: el codigo del modelo (`sensenova_loop.py`) se ejecuta desde el repositorio, lo que implica confiar en el codigo del autor de la conversion; conviene revisarlo antes de desplegar en produccion.
- No es una publicacion oficial de SenseTime/SenseNova: el autor declara no tener afiliacion; para produccion critica puede ser preferible el modelo base oficial.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingue adecuado sin evaluacion previa.
- Longitud de contexto no documentada en la informacion disponible: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Riesgo de alucinacion: no se han publicado evaluaciones de tasas de alucinacion en la informacion disponible; aplican los riesgos habituales de los modelos de ~9B.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al ser una obra derivada del modelo de SenseNova, conviene conservar los avisos de licencia y atribucion correspondientes.
- Ecosistema limitado: al ser formato MLX con codigo remoto, no se puede desplegar con vLLM, llama.cpp, Ollama o TGI sin conversion adicional.

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-4bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-8bit
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio GitHub oficial: https://github.com/OpenSenseNova/SenseNova-Loop
- Noticia de lanzamiento (aicoder.com): https://aicoder.com/news/news-20261030-sensetime-sensenova-loop-9b-preview-looped-transformer-mhc-open-source-agentic
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversion: https://netprojects.com
