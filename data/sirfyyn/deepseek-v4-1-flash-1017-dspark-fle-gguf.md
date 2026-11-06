# sirfyyn/DeepSeek-V4.1-Flash-1017-DSpark-FLE-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje autónomo, sino el *drafter* de decodificación especulativa DSpark que DeepSeek incluye dentro de su checkpoint DeepSeek-V4.1-Flash-1017, extraído de los tensores `mtp.0..2` y convertido a formato GGUF por el usuario sirfyyn. Se trata de un modelo borrador de 14.225.362.146 parámetros totales (tres etapas MoE con 128 expertos enrutados y top-3, más cabeza de Markov y cabeza de confianza) que propone tokens que el modelo objetivo verifica después; cada token aceptado es idéntico al que produciría la decodificación normal, por lo que no hay degradación de calidad.

Su relevancia es práctica: en configuraciones donde el modelo objetivo no cabe en VRAM y los expertos residen en CPU, la decodificación está limitada por memoria y un drafter bien calibrado puede aumentar el throughput. El autor reporta en su model card un incremento de 23,2 a 25,0 tokens/s en decodificación y de 38 a 55 tokens/s en fase de conteo (warm-up) sobre un objetivo GSQ-RCO IQ2_XXS de 232 GiB ejecutado en una RTX PRO 4500 de 32 GB con 120 GB de RAM.

El artefacto se distribuye bajo licencia MIT, pesa 5,2 GB en un único fichero GGUF con expertos enrutados en Q2_K y proyecciones densas en Q8_0, y requiere un motor que cargue la cabeza de Markov con los nombres `markov_w1`/`markov_w2` (el motor FastLocalExperts, FLE, desde el commit c80bda923). No es utilizable con llama.cpp estándar ni como modelo de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con decodificación especulativa (DSpark drafter): 3 etapas, 128 expertos enrutados, top-3, bloque de 5 tokens, cabeza de Markov y cabeza de confianza |
| Parametros totales | 14.225.362.146 |
| Parametros activos | no disponible (top-3 de 128 expertos por etapa; el dato agregado no se publica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: expertos enrutados Q2_K, proyecciones densas Q8_0, pesos de hyper-connection F32, cabeza de Markov F16, cabeza de confianza F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único `FLE-DSpark-V4.1-1017-Q2K-Q8.gguf`, 5,2 GB) |

## Arquitectura y entrenamiento

El drafter replica la estructura de predicción multi-token (MTP) del modelo base: tres etapas (`mtp.0`, `mtp.1`, `mtp.2`) que proponen un bloque de cinco tokens por paso, cada una con 128 expertos enrutados y activación top-3, más una cabeza de Markov (`markov_w1`, `markov_w2`) y una cabeza de confianza (`conf_proj`) que estima la probabilidad de aceptación de cada posición. Los pesos proceden íntegramente de los shards 44–46 del checkpoint DeepSeek-V4.1-Flash-1017 (2.401 tensores `mtp.*`, 7,9 GB en origen), por lo que el entrenamiento es el del modelo publicado por DeepSeek y no se documenta por separado en esta ficha.

La conversión se realizó con `convert_hf_to_gguf.py --dspark --outtype q8_0` del conversor DSpark del motor FLE/llama.cpp y una cuantización selectiva con `llama-quantize --allow-requantize`: los tensores `ffn_(gate|up|down)_exps` a Q2_K, `hc_.*` a F32, `markov_w1`/`markov_w2` a F16 y `conf_proj` a F32. El autor advierte que cuantizar los tensores de hyper-connection o de Markov a K-quants rompe el borrador (acceso ilegal a memoria o aceptación nula), de ahí que se mantengan en coma flotante. La innovación operativa es el umbral `--spec-draft-p-min`: las posiciones cuya confianza cae por debajo del valor configurado no se envían a verificación, lo que evita el coste de verificar propuestas con baja probabilidad de aceptación.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre DeepSeek-V4.1-Flash-1017; no genera texto de forma autónoma.
- Propuesta de bloques de cinco tokens por paso con tres etapas MTP encadenadas.
- Estimación de confianza por posición mediante cabeza dedicada, explotable con el umbral `p_min`.
- Garantía de equivalencia: todo token verificado por el objetivo es idéntico al de la decodificación normal.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking por sí mismo; hereda las capacidades del modelo objetivo únicamente a través de la verificación.
- Capacidades multilingües: no disponibles (dependen del modelo objetivo, no del drafter).
- Integración con el motor FLE mediante `llama-server` con `--spec-type draft-dspark` y `-md`.

## Casos de uso

- Aceleración de inferencia local de DeepSeek-V4.1-Flash-1017 en configuraciones memory-bound: con el objetivo cuantizado a IQ2_XXS (232 GiB con Engram) y expertos en CPU, el drafter eleva la decodificación de 23,2 a 25,0 t/s y el warm-up de 38 a 55 t/s según las mediciones del autor.
- Despliegue en estaciones de trabajo con una sola GPU de 32 GB: el par objetivo + drafter cabe en el esquema RTX PRO 4500 + 120 GB de RAM + NVMe descrito, con caché de expertos en GPU de 15 GB.
- Servicio de generación de texto en Linux con `llama-server`: el drafter se carga como modelo auxiliar (`-md`) y no requiere modificar el pipeline de peticiones del objetivo.
- Ajuste fino del equilibrio latencia/aceptación: con `--spec-draft-p-min 0.5` se obtiene una aceptación del 74–83 %; sin umbral, la aceptación en prosa libre cae al 30–48 % y el drafter resta throughput, por lo que el umbral es el parámetro clave para entornos de producción.
- Investigación sobre decodificación especulativa: el artefacto permite reproducir y medir aceptación, coste de verificación y ganancia neta en un objetivo MoE de gran tamaño con expertos fuera de GPU.
- Evaluación de motores alternativos: sirve como banco de pruebas para validar la carga de cabezas de Markov (`markov_w1`/`markov_w2`) en implementaciones derivadas de llama.cpp.

## Benchmarks y rendimiento

Mediciones del autor sobre objetivo ISTA-DASLab GSQ-RCO IQ2_XXS (232 GiB con Engram), una RTX PRO 4500 (32 GB), 120 GB de RAM, NVMe y expertos en CPU con caché de expertos en GPU. Motor FLE main, dos ejecuciones por configuración, 1.000 tokens de warm-up y 1.100 tokens medidos:

| Configuracion | Decode (t/s) | Warm-up con conteo (t/s) | Aceptacion del borrador |
|---|---:|---:|---:|
| Sin drafter, cache de expertos 18 GB | 23,2 | 38 | – |
| Con este drafter, `p_min 0.5`, cache de expertos 15 GB | 25,0 | 55 | 74–83 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, y no procede medirlos en un drafter que no genera respuestas de forma autónoma.

## Requisitos de hardware

- VRAM para el drafter: 5,2 GB de fichero GGUF; el autor ejecuta con caché de expertos del objetivo reducida a 15 GB en una GPU de 32 GB, frente a 18 GB sin drafter.
- VRAM total del sistema: el objetivo GSQ-RCO IQ2_XXS ocupa 232 GiB con Engram, por lo que se necesita RAM del sistema (120 GB en la medición) y almacenamiento NVMe para los expertos.
- GPU recomendadas: RTX PRO 4500 (32 GB) es la configuración medida; no se han publicado mediciones en A100, H100 ni RTX 4090.
- No cabe en GPU de consumo como unidad completa: el drafter sí (5,2 GB), pero el modelo objetivo requiere offload de expertos a CPU.
- Opciones de despliegue: exclusivamente el motor FLE (FastLocalExperts) desde el commit c80bda923, invocado vía `llama-server` con `-md`, `--spec-type draft-dspark`, `--spec-draft-p-min`, `-ngl 99`, `-cmoe` y `-fit on`. No compatible con llama.cpp estándar, vLLM, TGI ni Ollama.
- Latencia y throughput: 25,0 t/s de decodificación y 55 t/s de warm-up con `p_min 0.5`; sin umbral, el rendimiento cae por debajo del obtenido sin drafter en prosa libre.
- Sistema operativo: las cifras se midieron en Linux; el autor indica que otros sistemas ejecutan los mismos ficheros sin garantía de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sirfyyn/DeepSeek-V4.1-Flash-1017-DSpark-FLE-GGUF | Drafter DSpark para FLE | 14.225.362.146 | no disponible | MIT | GGUF | Hugging Face, 153 descargas |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF (subcarpeta `dspark`) | Drafter DSpark en GGUF para llama.cpp | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | Modelo objetivo completo | no disponible | no disponible | MIT | safetensors | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos artefactos en la informacion proporcionada; la comparación relevante es de compatibilidad de motor (FLE frente a llama.cpp) y de formato, no de calidad.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo DeepSeek-V4.1-Flash-1017 y el motor FLE no produce salida útil.
- Requiere el motor FastLocalExperts desde el commit c80bda923; versiones anteriores o llama.cpp estándar no cargan las cabezas `markov_w1`/`markov_w2`.
- Sin `--spec-draft-p-min`, la aceptación en prosa libre cae al 30–48 % y el drafter reduce el throughput en configuraciones limitadas por memoria; el umbral no es opcional en producción.
- La cuantización de `hc_*` o de los tensores de Markov a K-quants rompe el borrador (acceso ilegal a memoria o aceptación nula); no deben recuantizarse.
- El rendimiento medido corresponde a una única configuración de hardware y a un objetivo concreto (GSQ-RCO IQ2_XXS); no hay garantía de extrapolación a otros objetivos o GPUs.
- Sesgos y riesgo de alucinación: no aplicables de forma directa al drafter, ya que la verificación garantiza equivalencia con la decodificación normal; cualquier sesgo proviene del modelo objetivo.
- Idiomas soportados no documentados; dependen del objetivo.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 likes y 153 descargas, lo que indica validación comunitaria escasa.
- Las cifras de velocidad se midieron en Linux; en otros sistemas el comportamiento es el mismo en cuanto a ficheros, pero el rendimiento no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirfyyn/DeepSeek-V4.1-Flash-1017-DSpark-FLE-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor FastLocalExperts (FLE): https://github.com/sirfyyn/FastLocalExperts
- GGUF del objetivo y drafter en unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- README del drafter en unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF/blob/main/dspark/README.md
