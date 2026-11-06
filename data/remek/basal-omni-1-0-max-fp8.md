# Remek/basal-omni-1.0-max-FP8

## Resumen

basal-omni-1.0-max-FP8 es un checkpoint cuantizado en FP8 del modelo basal-omni-1.0-max, un modelo de 12B parametros construido sobre Google Gemma 4 12B y desarrollado por Remek. No es un modelo generativo convencional: esta especializado en "decisiones tipadas" (typed decisions), es decir, elegir entre opciones etiquetadas, emitir puntuaciones calibradas, clasificar y ejecutar acciones o llamadas a herramientas dentro del ecosistema basal. El checkpoint se sirve mediante el motor de inferencia basal sobre vLLM 0.31.0 y mantiene la misma API de decision que la version bf16.

La relevancia de esta version radica en la eficiencia: reduce los pesos de 24 GB a 14 GB y mejora el rendimiento (8,7 decisiones/s frente a 5,6 del bf16 en una RTX PRO 6000 96 GB), manteniendo la puerta de calidad del port con una concordancia del 0,9688 frente al modelo bf16 en decisiones con 2 a 10 opciones. La precision cae solo 0,34 puntos y el ECE incluso mejora ligeramente (0,0192 a 0,0182).

La cuantizacion se realizo con NVIDIA ModelOpt 0.47 en formato FP8 E4M3 con escalas estaticas por tensor, calibradas sobre 2.048 prompts de decision en polaco e ingles. La licencia es Apache 2.0 y los idiomas declarados son polaco e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B), con capas lineales en FP8; modelo de decisiones tipadas |
| Parametros totales | 11.959.730.176 (aproximadamente 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 tokens configurados en el servidor (`--max-len 16384`) |
| Tipos de cuantizacion | FP8 E4M3 con escalas estaticas por tensor (NVIDIA ModelOpt 0.47); capas 0, 1, 46 y 47, embeddings, cabeza de salida y encoders de imagen/audio en bf16 |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint ModelOpt FP8, leido nativamente por vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 12B, un transformer denso de aproximadamente 12B parametros. Sobre esa base, el autor ha construido una capa de decision tipada que permite formular consultas con hasta 255 opciones y obtener respuestas calibradas. La cuantizacion FP8 se aplica a 301 de las capas lineales del modelo de lenguaje, dejando en bf16 las capas decodificadoras 0, 1, 46 y 47, los embeddings, la cabeza de salida y los encoders de imagen y audio. La calibracion se realizo con 2.048 prompts de decision en polaco e ingles en el formato propio del modelo.

El checkpoint incluye un fichero de calibracion (`CALIBRATION.vllm.json`) ajustado sobre las propias lecturas del modelo cuantizado, con temperaturas por tipo y umbrales certificados para errores del 1% y del 5%, para un unico orden de opciones. El modelo base se entreno solo con decisiones de texto; las capacidades sobre imagen y audio son zero-shot a traves de los encoders de Gemma 4, sin entrenamiento especifico en medios. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Decisiones tipadas entre 2 y 255 opciones mediante los modos `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificacion con calibracion certificada: umbrales ajustados para tasas de error del 1% y del 5%.
- Puntuacion y ranking de opciones con margenes de confianza.
- Ejecucion de acciones y llamadas a herramientas (tool calling) dentro del protocolo basal.
- Razonamiento multi-paso orientado a la toma de decisiones.
- Capacidades multilingues limitadas a polaco e ingles.
- Procesamiento de imagen y audio solo en la version bf16 del modelo base (zero-shot); esta version FP8 es exclusivamente de texto.
- Automatizacion con umbrales: en la prueba de calibracion con 8.560 decisiones, decide automaticamente el 45,4% de los casos con un objetivo de error del 1% y el 82,5% con un objetivo del 5%.

## Casos de uso

- Enrutamiento y triaje automatizado: el modelo puede clasificar tickets o solicitudes entre un conjunto acotado de categorias con umbrales de confianza calibrados, derivando a revision humana solo los casos por debajo del umbral. La calibracion certificada al 1% y al 5% de error permite fijar politicas de automatizacion medibles.
- Moderacion de contenido con decisiones tipadas: dada una politica con opciones discretas (permitir, revisar, bloquear), el modelo emite una decision con margen de confianza, y el umbral se ajusta sobre datos propios con `basal-calibrate`.
- Extraccion estructurada en pipelines de datos: el modo `score` y `multi` permite puntuar y seleccionar entre candidatos generados por otro modelo, actuando como capa de reranking calibrada.
- Agentes con tool calling: el modo `tool` y `act` permite que un agente seleccione la herramienta adecuada entre un catalogo de hasta 255 opciones, con latencias de 118 ms p50 y 177 ms p95 por decision en una RTX PRO 6000.
- Atencion al cliente en polaco e ingles: conversaciones multi-turno con contexto de hasta 16.384 tokens y decisiones sobre la siguiente accion (responder, escalar, solicitar datos), con throughput de 8,7 decisiones/s a 16 peticiones en vuelo.
- Evaluacion automatizada de calidad: uso como juez con puntuaciones calibradas para comparar respuestas o salidas de modelos, apoyandose en el ECE bajo (0,0182) para obtener estimaciones de confianza fiables.
- Procesamiento por lotes de decisiones sobre estados largos: con 5 preguntas sobre un estado de 3.000 a 10.000 tokens, el modelo procesa 4,8 preguntas/s con latencia p50 de 1,07 s, adecuado para revisiones documentales por lotes.

## Benchmarks y rendimiento

Los benchmarks del modelo base (no puntuados por separado en este port) se reportan en la model card del modelo original: Werdykt v1 con 0,823, junto con conjuntos en polaco e ingles. Los datos medidos especificamente para este checkpoint frente al bf16 son los siguientes:

| Metrica | FP8 (este checkpoint) | bf16 | Diferencia |
|---|---|---|---|
| Concordancia (2-10 opciones) | 0,9688 | referencia | barra >= 0,9552: PASS |
| Concordancia con margen bf16 >= 0,2 | 0,9893 | referencia | barra >= 0,9893: PASS |
| Precision (2-10 opciones) | 0,8555 | 0,8589 | -0,34 pt |
| ECE (2-10 opciones) | 0,0182 | 0,0192 | mejora de 0,001 |
| Concordancia global (10.606 decisiones, hasta 255 opciones) | 96,0% | referencia | - |
| Precision global | 0,8159 | 0,8195 | -0,36 pt |
| Automatizacion a 1% de error | 45,4% | 47,2% | -1,8 pt |
| Automatizacion a 5% de error | 82,5% | 83,0% | -0,5 pt |
| Repetibilidad (2.000 decisiones, 1 vs 8 en vuelo) | 96,9% misma respuesta | - | 99,4% con margen >= 0,2 |

Rendimiento medido en una RTX PRO 6000 96 GB con 16 peticiones en vuelo:

| Configuracion | Decisiones/s | Latencia p50 / p95 |
|---|---|---|
| FP8, una pregunta sobre estado de ~1.500 tokens | 8,7 | 118 / 177 ms |
| bf16, misma prueba | 5,6 | 176 / 263 ms |
| FP8, 5 preguntas sobre estado de 3.000-10.000 tokens | 4,8 preguntas/s | 1,07 / 2,05 s por peticion |
| bf16, misma prueba | 3,4 preguntas/s | 1,51 / 2,92 s por peticion |

## Requisitos de hardware

- VRAM para pesos: 14 GB en FP8, frente a 24 GB de la version bf16.
- GPU verificada: una RTX PRO 6000 96 GB (Blackwell). FP8 requiere sm89 o superior, es decir, arquitecturas Ada, Hopper o Blackwell.
- Con `--gpu-memory 0.9` en la RTX PRO 6000, vLLM mantiene 211.329 tokens de cache de estado (bf16: 182.836).
- No se ha verificado en GPUs de consumo como la RTX 4090; al requerir sm89 o superior, una RTX 4090 (Ada) cumple el requisito de arquitectura, pero los 14 GB de pesos mas la cache de estado dejan poco margen en sus 24 GB de VRAM y no hay datos publicados de funcionamiento en esa tarjeta.
- Despliegue mediante `basal-serve` con vLLM 0.31.0 (build de PyPI con CUDA 13, requiere driver NVIDIA 580 o superior). Instalacion tipica:
  ```bash
  uv venv --python 3.12 --allow-existing ~/basal-vllm && source ~/basal-vllm/bin/activate
  uv pip install vllm==0.31.0 "basal @ https://github.com/rkinas/basal/archive/refs/tags/v2.5.5.tar.gz"
  basal-serve --model Remek/basal-omni-1.0-max-FP8 --mode vllm --max-len 16384 --gpu-memory 0.9 --port 8000
  ```
- Para respuestas repetibles, arrancar con `VLLM_BATCH_INVARIANT=1`, lo que reduce el rendimiento en aproximadamente un 23% de decisiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basal-omni-1.0-max-FP8 (este) | ~12B | 16.384 tokens | safetensors FP8 | Apache 2.0 | Solo texto; 14 GB de pesos; 8,7 decisiones/s |
| basal-omni-1.0-max (bf16) | ~12B | 16.384 tokens | safetensors bf16 | Apache 2.0 | Soporta imagen y audio; 24 GB de pesos; 5,6 decisiones/s |
| Gemma 4 12B (modelo base) | ~12B | no disponible | safetensors | no disponible | Modelo generativo general, sin capa de decision tipada |
| Alternativas de la misma categoria (modelos de decision calibrada de ~12B) | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Esta version es exclusivamente de texto: las entradas de imagen y audio (`"media"`) requieren el modelo bf16 con `--mode eager --media on`.
- La calibracion incluida esta ajustada para un unico orden de opciones (el predeterminado); cambiar el orden invalida los umbrales calibrados.
- En `--mode vllm` una decision puede cambiar entre ejecuciones cerca de un empate, porque los numeros de vLLM dependen del calculo previo del servidor (cache de prefijo, batching). Dos ejecuciones dan la misma respuesta en el 96,9% de los casos, y el 99,4% con margen bf16 >= 0,2.
- `--deterministic` no esta disponible en `--mode vllm`; para repetibilidad estricta hay que usar `VLLM_BATCH_INVARIANT=1` con la penalizacion de rendimiento asociada.
- El modelo base se entreno solo con decisiones de texto; las capacidades sobre medios son zero-shot y el propio autor indica que el entrenamiento con medios llegara en versiones posteriores.
- Solo soporta polaco e ingles; no hay soporte declarado de castellano.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; al ser un modelo experimental, no hay evaluaciones publicadas de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el caracter experimental del modelo y la ausencia de benchmarks propios de este port (no se puntua por separado en Werdykt v1 ni en los conjuntos polaco e ingles) desaconsejan su uso en produccion sin validacion propia.
- El port reduce la precision en 0,34 puntos (2-10 opciones) y 0,36 puntos en el conjunto global, con perdida de automatizacion de 1,8 puntos al 1% de error.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Remek/basal-omni-1.0-max-FP8
- Hugging Face (modelo base bf16): https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia basal: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Tag de version del motor: https://github.com/rkinas/basal/archive/refs/tags/v2.5.5.tar.gz
