# MaxDevv/Qwen3.8-27b-Q8-Logits-for-kld

## Resumen

Este repositorio, publicado por el usuario MaxDevv, contiene logits de referencia (gold) en cuantizacion Q8_0 para el modelo Qwen3.8-27B de Alibaba, generados con la herramienta `llama-perplexity --save-all-logits` sobre un corpus de calibracion denominado `hy3`. No incluye los pesos del modelo, sino un artefacto auxiliar disenado para evaluar la fidelidad de otras cuantizaciones mediante el calculo de divergencia KL. El modelo base, Qwen3.8-27B, es un transformer multimodal denso de 27 mil millones de parametros con una ventana de contexto de 262 000 tokens, licencia Apache 2.0 y capacidades de vision-lenguaje. La relevancia de este repositorio radica en que proporciona una referencia estandar para medir la perdida de informacion al cuantizar el modelo, un paso critico en el despliegue local eficiente.

Los logits se generaron en CPU con 48 hilos y cache KV de tipo `kvarn3`, sobre 20 muestras aleatorias de 512 tokens extraidas del corpus `canada-quant/hy3-w4a16-mtp-calibration` con semilla 1337. El valor de perplejidad (PPL) del modelo Q8_0 sobre este corpus es de 3.9616 ± 0.131. El repositorio incluye dos archivos: `ref_q8.logits` (logits por token en float32) y `hy3_corpus.txt` (el corpus exacto utilizado), lo que permite reproducir el calculo de KLD con otros quantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Q8_0 (para los logits de referencia); el modelo base admite FP8, FP4, etc. |
| Idiomas soportados | No disponible en la informacion del repositorio; el modelo base soporta multiples idiomas (no especificado) |
| Licencia | No disponible para el repositorio; el modelo base usa Apache 2.0 |
| Formato de pesos | Logits en float32 (archivo `.logits`); el modelo base usa safetensors/GGUF |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de arquitectura transformer con atencion multimodal nativa, capaz de procesar imagenes y video ademas de texto. Su entrenamiento sigue el enfoque de la familia Qwen, con fases de preentrenamiento y ajuste fino supervisado, reforzado con optimizacion por preferencias humanas (RLHF/DPO) segun las practicas de Alibaba. No se han publicado detalles especificos sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset en la informacion disponible.

El repositorio de logits se genero mediante `llama-perplexity` de llama.cpp (version b10470) en CPU, con 48 hilos y cache KV de tipo `kvarn3`. El corpus de calibracion `hy3` consiste en 20 muestras aleatorias de 512 tokens, extraidas con semilla 1337 del dataset `canada-quant/hy3-w4a16-mtp-calibration`. Este proceso produce logits por token en float32 que sirven como referencia "gold" para comparar la divergencia KL de otras cuantizaciones (por ejemplo, W4A16, FP8, etc.). La eleccion de Q8_0 como referencia se justifica por su alta fidelidad respecto al modelo original en punto flotante.

## Capacidades

- Generacion de logits de referencia: el archivo `ref_q8.logits` contiene logits por token en float32, listos para calcular divergencia KL con otros quantizados.
- Reproducibilidad: el corpus `hy3_corpus.txt` permite replicar exactamente el mismo conjunto de evaluacion.
- Uso con llama.cpp: el comando documentado (`llama-perplexity -m <quant.gguf> -f hy3_corpus.txt -c 512 --kl-divergence --kl-divergence-base ref_q8.logits`) permite comparar cualquier cuantizacion contra la referencia.
- Capacidades del modelo base (Qwen3.8-27B): procesamiento multimodal (imagen, video, texto), razonamiento paso a paso, generacion de codigo, automatizacion de tareas de oficina y soporte para flujos agénticos (tool calling, multi-step reasoning).
- Multilingue: el modelo base soporta multiples idiomas, aunque el repositorio no especifica la lista exacta.
- Contexto largo: 262K tokens, adecuado para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Evaluacion de cuantizaciones para despliegue local: un ingeniero puede usar estos logits para medir la degradacion de una cuantizacion W4A16 o FP8 frente a la referencia Q8_0, decidiendo si la perdida de calidad es aceptable para su aplicacion.
- Investigacion en compresion de modelos: investigadores que desarrollan nuevos esquemas de cuantizacion pueden comparar sus resultados contra una referencia estandarizada, facilitando la comparacion entre metodos.
- Control de calidad en pipelines de generacion de GGUF: antes de publicar un archivo GGUF cuantizado, se puede ejecutar la prueba KLD para verificar que la cuantizacion no introduce desviaciones significativas.
- Benchmarking de hardware: al medir la perplejidad y la divergencia KL en diferentes CPUs o GPUs, se puede evaluar el impacto del hardware en la precision numerica.
- Validacion de cambios en llama.cpp: los desarrolladores de llama.cpp pueden usar estos logits como test de regresion para asegurar que los cambios en el codigo no alteran los logits de salida.
- Reproduccion de experimentos academicos: el corpus y los logits permiten replicar exactamente los resultados de perplejidad y KLD en otros entornos.

## Benchmarks y rendimiento

El repositorio reporta el siguiente valor de perplejidad para el modelo Q8_0 sobre el corpus hy3:

| Metrica | Valor |
|---|---|
| Perplejidad (PPL) en hy3 | 3.9616 ± 0.131 |

Para el modelo base Qwen3.8-27B, fuentes externas citan los siguientes resultados (según la busqueda web):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

No se han publicado en el repositorio resultados de KLD para otras cuantizaciones; el unico dato disponible es el PPL de la referencia. No se dispone de comparaciones formales con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Para generar los logits de referencia se utilizo una CPU con 48 hilos y cache KV `kvarn3`; el proceso tardo un tiempo no especificado, pero es viable en servidores CPU modernos.
- Para usar los logits en evaluaciones KLD se necesita ejecutar `llama-perplexity` con el modelo cuantizado; esto requiere suficiente RAM para cargar el modelo GGUF (el archivo Q8_0 del modelo base pesa 29.05 GB).
- El modelo base Qwen3.8-27B, en su version completa, requiere al menos 24 GB de VRAM en FP16; con cuantizacion Q8_0 cabe en una GPU consumer de 24 GB (por ejemplo, RTX 3090/4090), y con FP8 o FP4 en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (CPU/GPU), vLLM, TGI, Ollama, y cualquier framework compatible con GGUF o safetensors.
- Para inferencia con contexto de 262K tokens se recomienda GPU con al menos 48 GB de VRAM o usar cuantizaciones agresivas y offloading.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo base Qwen3.8-27B se posiciona como un modelo multimodal denso de 27B, comparable en tamano a otros modelos abiertos como Llama 3.1 70B (aunque con menos parametros) o Qwen2.5-72B. Segun la busqueda web, Alibaba afirma que Qwen3.8-27B se acerca a Claude Opus en tareas de codificacion, aunque no se aportan cifras exactas en este repositorio. Para una comparativa rigurosa seria necesario consultar los benchmarks oficiales del modelo base.

## Limitaciones y advertencias

- El repositorio no contiene el modelo completo, solo logits de referencia; no es util para inferencia directa.
- Los logits se generaron sobre un corpus especifico (20 muestras de 512 tokens); los resultados de KLD pueden no generalizar a otros dominios o longitudes de contexto.
- La licencia del repositorio no esta especificada; aunque el modelo base es Apache 2.0, los archivos de logits podrian tener restricciones adicionales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo base en este repositorio.
- El valor de PPL (3.9616) es una metrica agregada y no refleja el rendimiento en tareas especificas; debe interpretarse con cautela.
- La generacion de logits se realizo con una version especifica de llama.cpp (b10470); cambios futuros en el codigo podrian alterar la reproducibilidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/MaxDevv/Qwen3.8-27b-Q8-Logits-for-kld
- Repositorio oficial de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Comparativa con Claude Opus (blog): https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Informacion de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Repositorio de cuantizacion ROCm FP4 (referencia): https://huggingface.co/bg-digitalservices/Qwen3.8-27B-ROCmFP4-STRIX-GGUF
