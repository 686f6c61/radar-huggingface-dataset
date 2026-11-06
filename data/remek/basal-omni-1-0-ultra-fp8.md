# Remek/basal-omni-1.0-ultra-FP8

## Resumen

basal-omni-1.0-ultra-FP8 es un checkpoint cuantizado en FP8 del modelo basal-omni-1.0-ultra, un modelo de 31.273.086.512 parametros construido sobre Gemma 4 31B y desarrollado por Remek. No es un modelo nuevo: es un port de la capa de decision del modelo original, orientado especificamente a toma de decisiones tipadas (seleccion entre opciones, clasificacion, calibracion y puntuacion), servido a traves del motor de inferencia propio `basal` sobre vLLM. Su proposito es reducir el peso del checkpoint de 59 GB a 33 GB, permitiendo servirlo en una sola GPU de 80 GB o 96 GB con espacio suficiente para estados largos y peticiones en paralelo.

La relevancia del modelo esta en su enfoque: en lugar de generar texto libre, expone una API de decisiones tipadas (`choice`, `noul`, `score`, `multi`, `act`, `tool`) con hasta 255 opciones, probabilidades calibradas y umbrales certificados para automatizar decisiones con tasas de error controladas (1% y 5%). El checkpoint FP8 mantiene practicamente el mismo comportamiento que la version bf16: una concordancia del 98,07% en decisiones de 2 a 10 opciones sobre el conjunto de desarrollo dev v2 (10.606 decisiones), con una perdida de precision de solo 0,39 puntos y un ECE de 0,0205 frente a 0,0204.

El modelo es experimental, esta licenciado bajo Apache 2.0, soporta polaco e ingles, y esta pensado para cargas de trabajo de decision y clasificacion mas que para generacion conversacional general. La cuantizacion se realizo con NVIDIA ModelOpt 0.47 en formato FP8 E4M3, manteniendo en bf16 las dos primeras y dos ultimas capas del decodificador, los embeddings, la cabeza de salida y el codificador de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 31B), con capa de decision tipada sobre el motor basal |
| Parametros totales | 31.273.086.512 (31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 tokens en modo vllm (`--max-len 16384`); el modelo base admite estados de 3.000-10.000 tokens en los ejemplos de velocidad |
| Tipos de cuantizacion | FP8 E4M3 (pesos y activaciones) con escalas estaticas por tensor; capas iniciales/finales, embeddings, cabeza de salida y encoder de imagen en bf16 |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt FP8, `model-*.safetensors`, `config.json`, `hf_quant_config.json`) |
| Tamano del repo | 35,3 GB (pesos 33 GB) |
| Modelo base | Remek/basal-omni-1.0-ultra |
| Libreria | transformers |
| Pipeline | text-generation |
| Hardware requerido | FP8 requiere sm89 o superior (Ada, Hopper, Blackwell) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B, un transformer decoder-only, y le anade una capa de decision tipada implementada en el motor `basal`. La cuantizacion se realizo con NVIDIA ModelOpt 0.47: pesos y activaciones en FP8 E4M3 con escalas estaticas por tensor, calibradas sobre 2.048 prompts de decision en polaco e ingles en el formato de prompt del modelo. De las capas lineales del modelo de lenguaje, 383 son FP8; las dos primeras y dos ultimas capas del decodificador, los embeddings, la cabeza de salida y el codificador de imagen permanecen en bf16 para preservar la calidad en los extremos de la red.

La calibracion de la capa de decision (`CALIBRATION.vllm.json`) se ajusto sobre las propias lecturas vLLM del checkpoint, usando el metodo y las particiones del modelo bf16: temperaturas por tipo y umbrales certificados para 1% y 5% de error, con un unico orden de opciones. El checkpoint supera todas las barreras del port gate de basal 2.0 frente a bf16: concordancia en 2-10 opciones >= 0,9552, concordancia donde el margen de bf16 >= 0,2 >= 0,9893, precision dentro de 1 punto y ECE como maximo +0,01. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Toma de decisiones tipadas: seleccion entre 2 y 255 opciones mediante los modos `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificacion con probabilidades calibradas y umbrales certificados para automatizacion con error objetivo del 1% y 5%.
- Puntuacion (`score`) de opciones y estados, con margenes de confianza utilizables para decidir cuando automatizar y cuando derivar a revision.
- Soporte de multiples preguntas sobre un mismo estado largo (5 preguntas sobre estados de 3.000-10.000 tokens).
- Capacidades multilingues limitadas a polaco e ingles.
- Modo texto unicamente en este checkpoint FP8; las imagenes requieren el modelo bf16 con `--mode eager --media on`.
- Integracion con tool calling a traves del modo `tool` del motor basal.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas ni razonamiento multi-paso general en la informacion disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar cada ticket entre un conjunto cerrado de categorias (hasta 255 opciones) con probabilidades calibradas, permitiendo automatizar el 56,9% de las decisiones con un objetivo de error del 1% y derivar el resto a agentes humanos.
- Moderacion y triaje de contenido: uso del modo `choice` para asignar cada elemento a una categoria de riesgo, aprovechando los umbrales certificados para fijar politicas de automatizacion con error controlado.
- Extraccion de decisiones estructuradas en pipelines: el modo `multi` permite resolver varias preguntas sobre un mismo estado de hasta 16.384 tokens, util para procesar documentos largos en una sola pasada.
- Evaluacion de respuestas en sistemas RAG: el modo `score` puntua la relevancia de candidatos recuperados, y la calibracion permite fijar un umbral de aceptacion con ECE conocido (0,0205).
- Automatizacion de decisiones en backoffice: con 8.560 decisiones de prueba y umbrales preajustados, el checkpoint decide el 92,8% de forma automatica con un 5% de error objetivo, adecuado para clasificacion de documentos administrativos en polaco e ingles.
- Seleccion de herramientas en agentes: el modo `tool` permite elegir entre un conjunto de funciones disponibles con probabilidades calibradas, integrable en un servidor vLLM con 16 peticiones en vuelo (8,7 decisiones/s en H100).
- Despliegue en una sola GPU: al ocupar 33 GB, cabe en una H100 80 GB o RTX PRO 6000 96 GB dejando espacio para cache de estados (38.360 tokens en H100 con `--gpu-memory 0.9`).

## Benchmarks y rendimiento

Resultados medidos frente a bf16 en el conjunto dev v2 (10.606 decisiones), con las barreras del port gate de basal 2.0:

| GPU | Concordancia (2-10 opciones) | Concordancia con margen >= 0,2 | Precision (2-10 opciones) | ECE (2-10 opciones) | Gate |
|---|---|---|---|---|---|
| H100 80 GB | 0,9807 | 0,9917 | 0,9136 -> 0,9098 (-0,39 pt) | 0,0204 -> 0,0205 | PASS |
| RTX PRO 6000 96 GB (Blackwell) | 0,9842 | 0,9943 | 0,9136 -> 0,9120 (-0,16 pt) | 0,0204 -> 0,0217 | PASS |

Sobre las 10.606 decisiones completas (hasta 255 opciones) en H100: misma opcion en el 97,5% de los casos, precision 0,8749 -> 0,8701 (-0,48 pt). La mayoria de decisiones modificadas son empates tecnicos de bf16 (margen inferior a 0,05: 56% de concordancia; margen 0,5 o superior: 99,7%).

Automatizacion (test de calibracion, 8.560 decisiones, umbrales preajustados): con objetivo de error del 1%, el checkpoint decide automaticamente el 56,9% (bf16: 56,8%); con objetivo del 5%, el 92,8% (bf16: 94,2%).

Rendimiento (H100 80 GB, un orden de opciones, 16 peticiones en vuelo):

| Servido como | Una pregunta sobre estado de ~1.500 tokens | 5 preguntas sobre estado de 3.000-10.000 tokens |
|---|---|---|
| Este checkpoint, `--mode vllm` | 8,7 decisiones/s, 123 / 175 ms (p50/p95) | 4,9 preguntas/s, 1,28 / 1,75 s por peticion |
| bf16, `--mode vllm` (`--max-len 8192`) | 6,5 decisiones/s, 159 / 231 ms | 3,8 preguntas/s, 1,69 / 1,83 s |
| bf16, `--mode eager` (tal como se publico) | sin memoria a 16 en vuelo (457 de 480 peticiones fallidas); a 4 en vuelo: 2,0 decisiones/s, 416 / 790 ms | sin memoria |

Los resultados de benchmarks del modelo base (Werdykt v1: 0,879, conjuntos polaco e ingles) estan en la ficha de basal-omni-1.0-ultra; este port no se puntua por separado en ellos.

## Requisitos de hardware

- VRAM estimada para inferencia: 33 GB de pesos; en H100 80 GB con `--gpu-memory 0.9` vLLM reserva cache para 38.360 tokens de estado (2,3 estados de 16.384 tokens simultaneos). En RTX PRO 6000 96 GB: 55.279 tokens de cache.
- GPU compatibles: FP8 requiere sm89 o superior; verificado en H100 80 GB (Hopper) y RTX PRO 6000 96 GB (Blackwell). Tambien valido en GPUs Ada.
- Cabe en GPU consumer: no se documenta soporte en GPUs consumer en la informacion disponible; los 33 GB de pesos exceden la VRAM de la mayoria de tarjetas consumer actuales.
- Opciones de despliegue: motor `basal` v2.5.0 con vLLM 0.31.0 (build PyPI con CUDA 13, driver NVIDIA 580 o superior), mediante `basal-serve --mode vllm`; tambien `--mode fast` o `--mode fp8` en una H100 80 GB (44,8 GB tras el arranque). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,7 decisiones/s y latencia p50/p95 de 123/175 ms para una pregunta sobre estado de ~1.500 tokens en H100 con 16 peticiones en vuelo; 4,9 preguntas/s y 1,28/1,75 s por peticion para 5 preguntas sobre estados de 3.000-10.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basal-omni-1.0-ultra-FP8 (este) | 31B | 16.384 tokens en modo vllm | safetensors FP8 (33 GB) | Apache 2.0 | Decision tipada, calibrado, texto unicamente |
| basal-omni-1.0-ultra (bf16) | 31B | no disponible | safetensors bf16 (59 GB) | Apache 2.0 | Modelo de referencia; soporta imagenes con `--mode eager --media on` |
| Gemma 4 31B (base) | 31B | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo base sobre el que se construye basal-omni |

No se dispone de datos de benchmarks comparativos con otros modelos de decision o clasificacion en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explicitamente como tal; no debe asumirse estabilidad de API ni de calibracion entre versiones.
- Solo texto en este checkpoint: las imagenes requieren el modelo bf16 con `--mode eager --media on`.
- Un unico orden de opciones: la calibracion incluida esta ajustada para el orden de opciones por defecto; cambiar el orden invalida los umbrales certificados.
- No determinismo bajo carga: vLLM agrupa peticiones por lotes y una decision cercana a un empate puede cambiar entre ejecuciones (aproximadamente el 1% de las decisiones con 32 peticiones en vuelo; 0,3% con margen >= 0,2). `--deterministic` no esta disponible en `--mode vllm`.
- Idiomas limitados a polaco e ingles; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de robustez fuera de los conjuntos de decision polaco e ingles.
- Dependencia de hardware: FP8 requiere sm89 o superior y driver NVIDIA 580 o superior con CUDA 13; no funciona en GPUs mas antiguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter experimental y la ausencia de garantias del autor deben tenerse en cuenta en produccion.
- Precision reducida en empates: la precision cae 0,39-0,48 puntos frente a bf16, concentrada en decisiones con margen bajo; para decisiones criticas conviene usar los umbrales de calibracion y derivar los casos de margen pequeno.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-ultra-FP8
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Repositorio del motor basal: https://github.com/rkinas/basal
- Sitio web: https://basal.si5.pl/
