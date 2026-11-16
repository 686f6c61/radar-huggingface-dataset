# mradermacher/Llama-3.3-Amakuro-GGUF

## Resumen

Llama-3.3-Amakuro-GGUF es la distribucion en formato GGUF del modelo Llama-3.3-Amakuro, un fine-tuning del modelo Llama 3.3 de Meta realizado por el usuario KaraKaraWarehouse y cuantizado por mradermacher. El modelo base cuenta con 70.553.706.560 parametros (aproximadamente 70.000 millones), lo que lo situa en la categoria de modelos densos de gran escala. Esta version GGUF esta pensada para inferencia local y despliegue en CPU o GPU con herramientas compatibles con el formato GGUF.

El repositorio ofrece un conjunto de cuantizaciones estaticas que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), lo que permite ajustar el uso de memoria segun el hardware disponible. El modelo esta etiquetado como conversacional y solo declara soporte para ingles. La licencia es WTFPL, una licencia permisiva poco habitual en modelos de este tamano.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 70.000 millones de parametros en entornos con recursos limitados mediante cuantizacion, algo que el modelo original en precision completa no permite. No obstante, la informacion publicada sobre el fine-tuning (datos de entrenamiento, benchmarks, capacidades especificas) es muy escasa, lo que limita la evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.3; detalles del fine-tuning no disponibles) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | WTFPL |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Llama 3.3, que emplea una arquitectura transformer densa con atencion por grupos (GQA) y activacion SwiGLU, caracteristica de la familia Llama 3. Sin embargo, la model card no proporciona detalles sobre el proceso de fine-tuning: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales.

La unica informacion tecnica concreta disponible procede del proceso de cuantizacion realizado por mradermacher, que indica el uso de cuantizacion estatica (quantize_version 2) con conversion desde el formato Hugging Face. Existe una variante con cuantizacion ponderada/imatrix en un repositorio separado (Llama-3.3-Amakuro-i1-GGUF), que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general, heredados del modelo base Llama 3.3 (no verificado especificamente para este fine-tuning).
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso.
- No se documenta soporte multilingue mas alla del ingles.
- No se documentan capacidades especiales (vision, audio, modo thinking) en la informacion disponible.

## Casos de uso

- Despliegue local de un modelo de 70.000 millones de parametros: gracias a las cuantizaciones Q4_K_M (42,6 GB) o IQ4_XS (38,4 GB), es posible ejecutar el modelo en estaciones de trabajo con 48 GB de VRAM o en configuraciones CPU+GPU con RAM suficiente, algo inviable con el modelo en precision completa.
- Experimentacion e investigacion: el formato GGUF y la licencia WTFPL permiten usar el modelo como base para pruebas de inferencia, comparativas de cuantizacion y estudios de calidad frente al modelo original.
- Generacion de texto conversacional en ingles: el modelo esta etiquetado como conversacional, por lo que puede emplearse en prototipos de chat o asistentes en ingles.
- Evaluacion de fine-tunings de la comunidad: sirve para comparar el comportamiento de un fine-tuning no oficial de Llama 3.3 frente al modelo original de Meta en tareas de texto.
- Inferencia en entornos con GPU de consumo multiple: con cuantizaciones Q2_K (26,5 GB) o Q3_K_S (31,0 GB) puede intentarse su ejecucion en configuraciones de 2x24 GB o 1x48 GB, con la perdida de calidad asociada.
- Pipeline de pruebas con llama.cpp u Ollama: al ser GGUF, se integra en herramientas de inferencia local para validar respuestas antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~26,5 GB
  - Q3_K_S: ~31,0 GB
  - Q4_K_M: ~42,6 GB
  - Q5_K_M: ~50,0 GB
  - Q6_K: ~58,0 GB
  - Q8_0: ~75,1 GB
- GPU recomendadas: para cuantizaciones Q4/Q5 se requiere al menos 48 GB de VRAM (A6000, A100 40/80 GB, H100); para Q8_0 se necesita una GPU de 80 GB o repartir entre varias.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en ninguna cuantizacion; Q2_K requeriria al menos 32 GB, por lo que solo es viable con 2xRTX 4090 (48 GB) o mediante offload a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.3-Amakuro-GGUF | 70,55 B | no disponible | WTFPL | GGUF | Fine-tuning comunitario de Llama 3.3 |
| Llama 3.3 70B (Meta) | 70 B | no disponible en esta ficha | Llama 3.3 Community License | safetensors, GGUF (terceros) | Modelo original; contexto y benchmarks ampliamente documentados por Meta |
| Llama-3.3-Amakuro-i1-GGUF | 70,55 B | no disponible | WTFPL | GGUF (imatrix) | Variante con cuantizacion ponderada del mismo modelo base |

La comparacion con otros fine-tunings de 70B de la comunidad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del fine-tuning; al derivar de Llama 3.3, es previsible que herede sesgos del modelo original, pero no hay confirmacion.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks.
- Soporte declarado unicamente en ingles; el rendimiento en castellano no esta verificado.
- La licencia WTFPL es muy permisiva, pero conviene revisar su compatibilidad con las politicas de compliance de la organizacion, ya que no ofrece garantias ni clausulas de uso aceptable.
- El fine-tuning es de origen comunitario (KaraKaraWarehouse) sin documentacion de datos de entrenamiento, lo que impide auditar la procedencia del dataset y evaluar riesgos de contaminacion o sesgo.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El modelo no cabe en GPUs de consumo de 24 GB; el requisito de hardware es elevado incluso cuantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.3-Amakuro-GGUF
- Modelo base: https://huggingface.co/KaraKaraWarehouse/Llama-3.3-Amakuro
- Variante imatrix: https://huggingface.co/mradermacher/Llama-3.3-Amakuro-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.3-Amakuro-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
