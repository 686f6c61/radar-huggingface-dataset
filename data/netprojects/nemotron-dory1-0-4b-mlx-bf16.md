# netprojects/nemotron-dory1.0-4b-mlx-bf16

## Resumen

Dory 1.0 4B es un modelo de razonamiento de NVIDIA presentado el 16 de octubre de 2026 dentro de su linea Nemotron-Labs. Su rasgo distintivo es una arquitectura "looped": un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un unico conjunto de pesos ofrece un dial entre velocidad y precision sin necesidad de cargar modelos distintos. Con 3.974.103.040 parametros, se situa en la gama de 4B, pensada para ejecucion local y despliegues con recursos moderados.

La ficha que nos ocupa no es el checkpoint original de NVIDIA, sino una conversion a formato MLX en bf16 (sin cuantizacion) realizada por NetProjects (Internet Projects Ltd), una organizacion no afiliada a NVIDIA. El objetivo es ejecutar el modelo de forma nativa en Apple Silicon aprovechando el framework MLX, con un paquete propio (`dory-mlx`) que anade la arquitectura `dory` al ecosistema. El repositorio ocupa 8,0 GB y se distribuye bajo licencia OpenMDW-1.1.

El modelo esta orientado a generacion de texto y razonamiento en ingles: produce primero una cadena de pensamiento dentro de etiquetas `` y despues la respuesta final. Es relevante ahora porque demuestra un patron poco habitual (reutilizacion de capas con numero de iteraciones configurable) aplicado a un modelo de 4B, y porque existe un ecosistema de conversiones comunitarias que lo llevan a hardware de consumo Apple con metricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido y bucle configurable (looped language model), implementada como `dory` en MLX |
| Parametros totales | 3.974.103.040 |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza el mismo bloque de pesos) |
| Longitud de contexto | no disponible de forma explicita; verificado con prompts de hasta 24K tokens y probado con prompts de 32K tokens en las mediciones de rendimiento |
| Tipos de cuantizacion | bf16 (esta build, sin cuantizar); existen builds 8-bit y NVFP4 4-bit del mismo autor |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors en formato MLX, con layout fusionado (query/key/value/gate en una matriz; gate/up del MLP en una matriz) |

## Arquitectura y entrenamiento

La innovacion central es el bucle de capas: un unico bloque compartido se ejecuta de 1 a 4 veces, con 2 iteraciones como valor por defecto. Esto permite ajustar el coste computacional en inferencia sin cambiar de checkpoint, a costa de que el numero de pasos por token crezca con el numero de bucles. La conversion de NetProjects mantiene los pesos en bf16 y aplica un layout fusionado para acelerar la decodificacion; el script `scripts/convert.py` del repositorio `dory-mlx` reconstruye los pesos desde el checkpoint original de NVIDIA.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card de esta conversion remite a la model card original de NVIDIA para los detalles de entrenamiento y resultados de precision. La verificacion publicada por el autor de la conversion incluye una comparacion de logits frente a una implementacion independiente en PyTorch fp32 (concordancia top-1 del 100 %, divergencia KL entre 0,001 y 0,003) y pruebas de coherencia de las caches de ventana deslizante (concordancia top-1 de al menos 98,7 %, KL maxima de 0,0006).

## Capacidades

- Generacion de texto y razonamiento: el modelo emite una cadena de pensamiento dentro de `` antes de la respuesta, lo que lo hace adecuado para tareas que requieren pasos intermedios explicitos.
- Razonamiento matematico basico y aritmetica (la model card incluye un ejemplo con `17 * 23`).
- Ajuste de esfuerzo computacional mediante el parametro `loops` (1 a 4), que permite priorizar latencia o calidad segun la tarea.
- Conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Ejecucion nativa en Apple Silicon mediante MLX, con soporte de caches por bucle y decodificacion token a token.
- Generacion por lotes a traves de MLX-LM (con la propuesta de soporte `dory` en el PR 1988).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Razonamiento local en portatiles Apple: un desarrollador puede ejecutar el modelo en un Mac con 16 GB o mas en bf16 y obtener cadenas de razonamiento completas sin conexion, ajustando `loops` a 1 para consultas rapidas y a 4 para tareas que requieren mayor precision.
- Prototipado de aplicaciones de razonamiento en MLX: el paquete `dory-mlx` permite cargar el modelo en pocas lineas (`dory_mlx.load(..., loops=2)`) y transmitir la salida por piezas, lo que facilita integrarlo en interfaces de chat o notebooks.
- Procesamiento de documentos largos en local: con prompts verificados de hasta 24K tokens y mediciones con 32K tokens, el modelo puede resumir o analizar contratos, articulos o informes extensos en un equipo de sobremesa Apple.
- Evaluacion de arquitecturas looped: investigadores pueden comparar el efecto del numero de bucles sobre la perplejidad (12,17 / 11,76 / 11,69 en WikiText-2 para 1 / 2 / 4 bucles) y sobre el coste, usando un unico checkpoint como referencia controlada.
- Servicio por lotes en un solo equipo: con MLX-LM y la propuesta de soporte `dory`, un M5 Max sirve aproximadamente 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16 (build 8-bit, 2 bucles), suficiente para un entorno de desarrollo compartido o una demo interna.
- Generacion de explicaciones paso a paso para educacion o documentacion tecnica: la salida incluye la cadena de razonamiento, lo que permite mostrar el proceso y no solo el resultado, a costa de respuestas mas largas.
- Base para conversiones y cuantizaciones: el repositorio sirve como referencia bf16 para validar builds 8-bit y NVFP4 (concordancia top-1 del 98 % y KL de 0,003 entre 8-bit y bf16), util en pipelines de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados son de calidad de modelado y de rendimiento en hardware:

| Metrica | Resultado |
|---|---|
| Perplejidad WikiText-2 (bf16, 1 / 2 / 4 bucles) | 12,17 / 11,76 / 11,69 |
| Perplejidad WikiText-2 (8-bit, 1 / 2 / 4 bucles) | 12,18 / 11,77 / 11,70 |
| Concordancia top-1 frente a PyTorch fp32 (2 bucles, 55 tokens) | 100 % (KL 0,001-0,003) |
| Concordancia top-1 8-bit frente a bf16 | 98 % (KL 0,003) |

Rendimiento en MacBook Pro M5 Max (128 GB), mediadas de ejecuciones repetidas:

| Bucles | Generacion, prompt corto | Generacion tras prompt de 32K | Lectura de prompt de 32K | Memoria pico con 32K |
|---|---|---|---|---|
| 1 | 58 tok/s | 55 tok/s | 3.270 tok/s (10 s) | 11,3 GB |
| 2 | 39 tok/s | 36 tok/s | 2.180 tok/s (15 s) | 12,6 GB |
| 4 | 23 tok/s | 22 tok/s | 1.270 tok/s (26 s) | 15,1 GB |

Con MLX-LM directo (bf16, 2 bucles, decodificacion greedy): 39,0 tok/s de generacion con prompts de 25 y 4.096 tokens; 37,8 tok/s con 16.384 tokens; 36,0 tok/s con 32.768 tokens. Memoria pico de 8,2 GB con prompt de 25 tokens y 12,6 GB a partir de 4.096 tokens.

## Requisitos de hardware

- VRAM/memoria unificada: 8,0 GB de pesos en bf16; memoria pico medida de 8,2 GB con prompts cortos y 12,6 GB con prompts de 4K a 32K tokens (2 bucles). Con 4 bucles y 32K de prompt, la memoria pico sube a 15,1 GB.
- Hardware de referencia: Apple M5 Max con 128 GB. El autor indica que la build bf16 encaja en Macs de 16 GB o mas; para 8 GB recomienda la build 8-bit (4,2 GB) o la NVFP4 (2,6 GB).
- GPU dedicadas: no se proporcionan datos de rendimiento en A100, H100 ni RTX 4090; esta build es especifica de MLX y Apple Silicon.
- Despliegue: MLX mediante el paquete `dory-mlx` (CLI `python -m dory_mlx` y API Python) o MLX-LM con la propuesta de soporte `dory` (PR 1988). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Throughput por lotes: aproximadamente 200 tok/s agregados con 4 peticiones y 450 tok/s con 16 (8-bit, 2 bucles, MLX-LM).
- Latencia de lectura de prompt: de 308 tok/s (prompt de 25 tokens) a 3.063 tok/s (4.096 tokens) y 2.161 tok/s (32.768 tokens) con MLX-LM directo y limite de cache de 1 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs Dory 1.0 4B (esta build, MLX bf16) | 3,97B | verificado hasta 24K; probado a 32K | Razonamiento con bucle de capas configurable (1-4) | OpenMDW-1.1 | MLX, Apple Silicon |
| Nemotron-Dory-1.0-4B-MLX-8bit (mismo autor) | 3,97B | mismo modelo base | Misma arquitectura, cuantizado a 8-bit | OpenMDW-1.1 | MLX, 4,2 GB |
| Nemotron-Dory-1.0-4B-MLX-nvfp4 (mismo autor) | 3,97B | mismo modelo base | Misma arquitectura, NVFP4 4-bit desde el checkpoint de NVIDIA | OpenMDW-1.1 | MLX, 2,6 GB, ~1,4x mas rapido que 8-bit |
| H2O-Lightning-4B (MLX, mismo autor) | no disponible | no disponible | Modelo de 4B para MLX | no disponible | MLX, Apple Silicon |

No se dispone de datos de benchmarks que permitan comparar la calidad de Dory 1.0 4B con modelos de otros laboratorios del mismo tamano; la comparativa se limita a variantes del propio modelo.

## Limitaciones y advertencias

- Solo ingles: la model card declara `language: [en]`; no hay soporte multilingue documentado.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son mas largas y consumen mas tokens que las de un modelo de chat convencional.
- El rendimiento depende del numero de bucles: con 4 bucles la generacion cae a 23 tok/s en el hardware de referencia, frente a 58 tok/s con 1 bucle.
- No hay datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- La longitud maxima de contexto no se declara de forma explicita; las pruebas se limitan a 24K-32K tokens.
- Esta build esta pensada exclusivamente para Apple Silicon con MLX; no es portable a CUDA sin conversion adicional.
- La licencia OpenMDW-1.1 se etiqueta como `other`; deben revisarse los terminos del archivo LICENSE antes de un uso comercial.
- Es una conversion no oficial: NetProjects declara no estar afiliado a NVIDIA, por lo que la responsabilidad sobre posibles divergencias respecto al checkpoint original recae en el usuario.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion y sesgos: no se proporciona informacion especifica en la documentacion disponible; debe evaluarse empiricamente antes de usar el modelo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-bf16
- Modelo base original: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build 8-bit: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-8bit
- Build NVFP4 4-bit: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-nvfp4
- Paquete y repositorio `dory-mlx`: https://github.com/internet-projects/dory-mlx
- Propuesta de soporte en MLX-LM (PR 1988): https://github.com/ml-explore/mlx-lm/pull/1988
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/H2O-Lightning-4B-MLX-8bit
- Articulo sobre H2O-Lightning-4B en Apple Silicon: https://netprojects.com/insights/h2o-lightning-4b-on-apple-silicon-mlx
- Framework MLX: https://github.com/ml-explore/mlx
