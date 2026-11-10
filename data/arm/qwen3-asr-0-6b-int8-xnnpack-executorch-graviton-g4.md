# Arm/qwen3-asr-0-6b-int8-xnnpack-executorch-graviton-g4

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Qwen (Alibaba Cloud). Esta ficha describe la version optimizada publicada por Arm, que convierte el modelo original en un programa ExecuTorch (`.pte`) con cuantizacion INT8 y backend XNNPACK, dirigido a CPUs Arm en cloud (clase Cloud CPU). La optimizacion la realizo Nota AI usando la herramienta Arm AI Model Optimizer, sin reentrenamiento ni fine-tuning del modelo base.

El objetivo de esta variante no es mejorar la calidad del reconocimiento, sino reducir coste de inferencia en CPU: en la configuracion de referencia (AWS Graviton4, EC2 r8g.8xlarge con Neoverse-V2 de 32 vCPU) se reporta una latencia p50 un 1,29x menor (de 4.012,95 ms a 3.113,55 ms para audio de 30 s), un modelo 2,15x mas pequeno (de 4.370,13 MB a 2.031,84 MB) y un pico de memoria 2,35x inferior (de 4.058,66 MB a 1.728,44 MB). La precision se mantiene practicamente intacta: WER normalizado del 2,45 % frente al 2,40 % del baseline en LibriSpeech test.

Es relevante para equipos que despliegan transcripcion de audio en infraestructura Arm sin GPU, ya que ofrece un artefacto listo para ejecutar con ExecuTorch 1.1.0 y un compromiso medido entre latencia, memoria y calidad. El modelo original tiene 0,6 mil millones de parametros; el contexto, los idiomas y los detalles de cuantizacion no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3-ASR-0.6B; exportado como programa ExecuTorch con encoder, prefill y decode separados) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (detalles de cuantizacion no registrados en los metadatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK delegate); el repositorio ocupa 2,5 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-0.6B (tipo de transformer, atencion, capas, vocabulario). Lo que si se documenta es el proceso de conversion: el modelo PyTorch se exporto a ExecuTorch (`.pte`) y se cuantizo a pesos INT8, con backend XNNPACK, generando tres artefactos: encoder estatico (`qwen3_asr_0_6b_encoder_s3000_static.pte`), prefill del decoder (`qwen3_asr_0_6b_decoder_prefill_s512_static.pte`) y decode del decoder (`qwen3_asr_0_6b_decoder_decode_s512_static.pte`). Los sufijos `s3000` y `s512` sugieren longitudes de secuencia estaticas para audio y tokens, respectivamente.

No se realizo reentrenamiento ni fine-tuning durante la optimizacion. Los datos de entrenamiento originales (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada; hay que consultar la model card del modelo base. La validacion de precision se hizo sobre 100 muestras de LibriSpeech test con el runtime ExecuTorch.

## Capacidades

- Reconocimiento automatico del habla (audio a texto) en espanol e ingles segun el pipeline `audio-text-to-text`; el conjunto exacto de idiomas no esta disponible.
- Procesamiento de audio de hasta 30 s por inferencia en la configuracion de referencia (16 kHz, batch size 1).
- Transcripcion con calidad medida en LibriSpeech: WER normalizado del 2,45 % y CER del 2,35 % en la version optimizada.
- Ejecucion en CPU Arm sin GPU mediante ExecuTorch y el delegate XNNPACK.
- Generacion de texto a partir de audio con decoder separado en fases prefill y decode.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada adicional ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Transcripcion por lotes en cloud Arm: procesar ficheros de audio de hasta 30 s con el encoder INT8 en instancias Graviton, reduciendo coste por hora frente a GPU y con un pico de memoria de 1.728 MB por inferencia.
- Subtitulado y actas de reuniones: integrar el decoder prefill/decode en un pipeline que transcriba segmentos de audio y los agregue en texto; la latencia p50 de 3,1 s por clip de 30 s es adecuada para procesamiento asincrono.
- Servicio de dictado o notas de voz en backend: desplegar el `.pte` con ExecuTorch 1.1.0 en un microservicio que reciba audio y devuelva texto, aprovechando la licencia Apache-2.0 para uso comercial.
- Benchmarking de infraestructura: usar el repositorio como referencia reproducible (metadata.yaml y carpeta benchmarks/) para comparar latencia y memoria entre generaciones de CPU Arm.
- Prototipado de asistentes de voz en entornos sin GPU: validar la viabilidad de ASR en servidores Arm on-premise o edge cloud antes de invertir en aceleradores.
- Evaluacion de cuantizacion: comparar el WER del modelo INT8 (2,45 %) con el baseline (2,40 %) sobre datos propios para decidir si el ahorro de memoria y latencia compensa la perdida de precision.
- Preprocesado de datasets de audio: transcribir grandes volumenes de audio corto en CPU para generar etiquetas o indices de busqueda, con menor huella de memoria que el modelo original.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en AWS Graviton4 (EC2 r8g.8xlarge, Neoverse-V2, 32 vCPU, hasta 2,8 GHz), Ubuntu 26.04 LTS, ExecuTorch 1.1.0, XNNPACK, batch size 1, audio de 30 s a 16 kHz, 30 ejecuciones:

| Metrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 4.012,95 ms | 3.113,55 ms | 1,29x |
| Pico de memoria | 4.058,66 MB | 1.728,44 MB | 2,35x menos |
| Tamano del modelo | 4.370,13 MB | 2.031,84 MB | 2,15x mas pequeno |

Precision en LibriSpeech test (100 muestras, runtime ExecuTorch):

| Metrica | Baseline | Optimizado | Cambio |
|---|---:|---:|---:|
| WER normalizado | 2,40 % | 2,45 % | +0,05 pp |
| CER | 2,32 % | 2,35 % | +0,03 pp |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; es una variante para CPU. Pico de memoria medido: 1.728,44 MB en la configuracion de referencia.
- CPU recomendada: AWS Graviton4 (Neoverse-V2, 32 vCPU) como referencia; cualquier CPU Arm compatible con XNNPACK y ExecuTorch 1.1.0.
- GPU: no necesaria; no se documenta soporte GPU para este artefacto.
- Cabe en consumer: no disponible como dato medido; el requisito de memoria (~1,7 GB de pico) es compatible con equipos de sobremesa, pero la optimizacion esta dirigida a CPU Arm cloud y no se garantiza en otras plataformas.
- Despliegue: runtime ExecuTorch 1.1.0 con delegate XNNPACK; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: p50 de 3.113,55 ms por audio de 30 s con batch 1; el throughput agregado depende del numero de nucleos y de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arm/qwen3-asr-0-6b-int8-xnnpack-executorch-graviton-g4 | 0,6 B | no disponible | ExecuTorch `.pte` INT8 | Apache-2.0 | Optimizado para CPU Arm; WER 2,45 % en LibriSpeech |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6 B | no disponible | PyTorch/safetensors (no confirmado) | Apache-2.0 | Baseline: WER 2,40 %, 4.370 MB, latencia p50 4.012,95 ms |
| Otros modelos ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No hay datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card advierte de que el rendimiento depende del dispositivo, version del runtime, soporte del backend, configuracion de memoria y carga del sistema; los resultados de Graviton4 no garantizan el mismo comportamiento en otros sistemas Arm.
- La evaluacion de precision se limita a 100 muestras de LibriSpeech test; el autor recomienda reevaluar con datos propios antes de produccion.
- Solo se documenta audio de 30 s y batch size 1; no hay datos sobre audio mas largo, streaming ni concurrencia.
- Los detalles de cuantizacion INT8 no estan registrados en los metadatos, lo que dificulta auditar el proceso.
- No se dispone de informacion sobre sesgos, idiomas cubiertos ni riesgo de alucinacion especifico de esta variante; debe consultarse la model card del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los terminos del modelo original y de terceros citados por Arm.
- Este repositorio no sustituye la documentacion del modelo original y no se ha reentrenado ni fine-tuneado.

## Enlaces

- Repositorio del modelo optimizado: https://huggingface.co/Arm/qwen3-asr-0-6b-int8-xnnpack-executorch-graviton-g4
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
