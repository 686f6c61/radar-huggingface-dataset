# Remek/basal-omni-1.0-ultra-FP8

## Resumen

basal-omni-1.0-ultra-FP8 es un checkpoint cuantizado en FP8 del modelo basal-omni-1.0-ultra, desarrollado por Remek. Se trata de un modelo de 31.273.086.512 parametros construido sobre Gemma 4 31B, orientado especificamente a la toma de decisiones tipadas (typed decisions): clasificacion entre opciones multiples, puntuacion, decisiones multi-etiqueta y uso de herramientas, con calibracion integrada para automatizar decisiones con umbrales de error controlados.

La relevancia de esta version FP8 es practica: reduce el peso de los pesos de 59 GB a 33 GB, lo que permite servir el modelo en una sola GPU de 80 GB o 96 GB dejando espacio para cache de estados largos y peticiones en paralelo. Segun la model card, supera todas las barreras del "port gate" de basal 2.0 frente al modelo bf16 en acuerdo, precision y ECE, y mantiene practicamente identica la tasa de automatizacion al 1% de error (56,9% frente a 56,8% en bf16).

El modelo es experimental, esta licenciado bajo Apache 2.0, soporta polaco e ingles, y se sirve mediante el motor basal sobre vLLM. Es text-only: las capacidades de imagen del modelo base requieren la version bf16 con modo eager.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 31B) con capa de decision tipada; cuantizacion FP8 E4M3 en pesos y activaciones |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como limite nominal; la model card documenta estados de hasta 16.384 tokens en el servidor (`--max-len 16384`) y estados de 3.000-10.000 tokens en los tests de velocidad |
| Tipos de cuantizacion | FP8 (E4M3) con escalas estaticas por tensor (NVIDIA ModelOpt 0.47); capas de embedding, head de salida, primeras dos y ultimas dos capas del decoder y encoder de imagen permanecen en bf16; 383 capas lineales del LM en FP8 |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint ModelOpt FP8, leido nativamente por vLLM); incluye `config.json`, `hf_quant_config.json` y `CALIBRATION.vllm.json` |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma 4 31B al que se anade una capa de decision tipada. La cuantizacion se realizo con NVIDIA ModelOpt 0.47 en formato FP8 E4M3, aplicando escalas estaticas por tensor a pesos y activaciones, calibradas sobre 2.048 prompts de decision en polaco e ingles en el formato de prompt propio del modelo. Se mantienen en bf16 las dos primeras y las dos ultimas capas del decoder, los embeddings, el head de salida y el encoder de imagen; 383 capas lineales del modelo de lenguaje se cuantizan a FP8.

La calibracion del sistema de decision (`CALIBRATION.vllm.json`) se ajusta sobre las propias lecturas de este checkpoint en vLLM, usando el metodo y las particiones del modelo bf16: temperaturas por tipo de tarea y umbrales certificados para 1% y 5% de error, con un unico orden de opciones. No se dispone de informacion sobre el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El checkpoint es un port de la capa de decision del mismo modelo, no un modelo nuevo.

## Capacidades

- Generacion de texto conversacional en polaco e ingles.
- Decisiones tipadas mediante API: `choice` (seleccion entre opciones, hasta 255), `noul` (sin opciones), `score` (puntuacion), `multi` (multi-etiqueta), `act` y `tool` (uso de herramientas).
- Clasificacion con calibracion integrada: umbrales certificados para 1% y 5% de error objetivo.
- Automatizacion selectiva de decisiones: el modelo decide que decisiones puede resolver con la confianza requerida.
- Soporte de tool calling mediante el tipo de tarea `tool`.
- Razonamiento multi-paso dentro de una misma peticion sobre estados largos (hasta 16.384 tokens en configuracion documentada).
- Capacidad de vision heredada del modelo base, pero no disponible en este checkpoint FP8 (requiere bf16 con `--mode eager --media on`).

## Casos de uso

- Enrutamiento y triaje automatizado: el modelo clasifica tickets o consultas entre hasta 255 categorias mediante `choice`, con umbrales de calibracion que permiten derivar automaticamente al humano solo los casos de baja confianza.
- Moderacion y clasificacion de contenido: uso de `multi` para asignar varias etiquetas por elemento con probabilidades calibradas, util en pipelines de revision a escala.
- Extraccion de decisiones en formularios y procesos administrativos: `score` y `choice` permiten puntuar opciones y seleccionar la mas probable con un ECE documentado de 0,0205 en H100.
- Agentes con uso de herramientas: el tipo `tool` permite al modelo seleccionar herramientas y argumentos en flujos de agentes, con la ventaja de que cada decision viene acompanada de una probabilidad calibrada.
- Atencion al cliente con derivacion inteligente: decisiones multi-turno sobre estados de varios miles de tokens, con latencia p50 de 1,28 s para 5 preguntas sobre un estado de 3.000-10.000 tokens en H100.
- Sistemas de recomendacion y ranking: `score` sobre candidatos con calibracion por tipo, adecuado para ordenar opciones con control del error.
- Despliegue en una sola GPU: al ocupar 33 GB de pesos, cabe en una H100 80 GB o RTX PRO 6000 96 GB con cache de estados de 38.360 o 55.279 tokens respectivamente, lo que facilita entornos de produccion con una unica GPU.

## Benchmarks y rendimiento

Resultados medidos frente al modelo bf16 en el conjunto de desarrollo dev v2 (10.606 decisiones), segun la model card:

| Metrica | H100 80 GB | RTX PRO 6000 96 GB | Umbral del port gate |
|---|---|---|---|
| Acuerdo (2-10 opciones) | 0,9807 | 0,9842 | >= 0,9552 |
| Acuerdo con margen bf16 >= 0,2 | 0,9917 | 0,9943 | >= 0,9893 |
| Precision (2-10 opciones) | 0,9136 -> 0,9098 (-0,39 pt) | 0,9136 -> 0,9120 (-0,16 pt) | dentro de 1 punto |
| ECE (2-10 opciones) | 0,0204 -> 0,0205 | 0,0204 -> 0,0217 | <= +0,01 |

Datos adicionales:

| Metrica | Valor |
|---|---|
| Acuerdo sobre las 10.606 decisiones (hasta 255 opciones, H100) | 97,5% |
| Precision sobre las 10.606 decisiones (H100) | 0,8749 -> 0,8701 (-0,48 pt) |
| Acuerdo en empates de bf16 (margen < 0,05) | 56% |
| Acuerdo con margen >= 0,5 | 99,7% |
| Automatizacion al 1% de error (8.560 decisiones) | 56,9% (bf16: 56,8%) |
| Automatizacion al 5% de error | 92,8% (bf16: 94,2%) |

Rendimiento en una H100 80 GB, 16 peticiones en vuelo:

| Servido como | Una pregunta sobre estado de ~1.500 tokens | 5 preguntas sobre estado de 3.000-10.000 tokens |
|---|---|---|
| Este checkpoint, `--mode vllm` | 8,7 decisiones/s; p50 123 ms / p95 175 ms | 4,9 preguntas/s; p50 1,28 s / p95 1,75 s |
| bf16, `--mode vllm` (`--max-len 8192`) | 6,5 decisiones/s; p50 159 ms / p95 231 ms | 3,8 preguntas/s; p50 1,69 s / p95 1,83 s |
| bf16, `--mode eager` | sin memoria a 16 en vuelo; a 4 en vuelo 2,0 decisiones/s, p50 416 ms / p95 790 ms | sin memoria |

Los benchmarks propios del modelo base (Werdykt v1 0,879, conjuntos en polaco e ingles) estan publicados en la model card de basal-omni-1.0-ultra; este port no se evalua por separado en ellos.

## Requisitos de hardware

- Pesos: 33 GB en FP8; el repositorio ocupa 35,3 GB.
- VRAM estimada: una GPU de 80 GB con `--gpu-memory 0.9` deja 38.360 tokens de cache de estados (2,3 estados de 16.384 tokens simultaneos); una GPU de 96 GB deja 55.279 tokens.
- GPUs verificadas: NVIDIA H100 80 GB y RTX PRO 6000 96 GB (Blackwell).
- Requisito de arquitectura: FP8 necesita sm89 o superior (Ada, Hopper, Blackwell).
- Modos de servicio de basal 2.5: `--mode vllm` (recomendado), `--mode fast` y `--mode fp8` en una H100 80 GB (carga sin copia bf16, 44,8 GB tras el arranque).
- Software: basal 2.5.0 con vLLM 0.31.0; el build de PyPI usa CUDA 13, por lo que requiere driver NVIDIA 580 o superior.
- No se documenta compatibilidad con llama.cpp, Ollama ni TGI; el checkpoint esta pensado para vLLM.
- Throughput medido: 8,7 decisiones/s con 16 peticiones en vuelo en H100 para estados cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-ultra-FP8 | 31,27 B | estados hasta 16.384 tokens en servidor | precision 0,9098-0,9120 en dev v2 (2-10 opciones); 8,7 decisiones/s en H100 | apache-2.0 | Hugging Face, 338 descargas |
| basal-omni-1.0-ultra (bf16) | 31,27 B | estados de 16.384 tokens requieren mas memoria (8.348 tokens de cache en H100 80 GB) | precision 0,9136; 6,5 decisiones/s en H100 | apache-2.0 | Hugging Face |
| Gemma 4 31B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la model card lo marca explicitamente como tal y el port no se evalua por separado en los benchmarks del modelo base.
- Solo texto: las capacidades de imagen requieren el modelo bf16 con `--mode eager --media on`.
- Un unico orden de opciones: la calibracion incluida esta ajustada para el orden de opciones por defecto.
- No determinismo con batching: con 32 peticiones en vuelo, el batching de vLLM cambia la respuesta principal entre ejecuciones en aproximadamente el 1% de las decisiones (0,3% con margen >= 0,2); `--deterministic` no esta disponible en `--mode vllm`.
- Las decisiones cercanas a empates son inestables: el acuerdo con bf16 cae al 56% cuando el margen de bf16 es inferior a 0,05.
- Cobertura linguistica limitada a polaco e ingles.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de benchmarks propios de este checkpoint desaconsejan produccion sin validacion en el dominio propio.
- Dependencia de un stack concreto: basal 2.5.0, vLLM 0.31.0, CUDA 13 y driver 580 o superior; no hay soporte documentado para otros motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-ultra-FP8
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
