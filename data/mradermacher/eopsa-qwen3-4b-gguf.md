# mradermacher/EOPSA-Qwen3-4B-GGUF

## Resumen

EOPSA-Qwen3-4B-GGUF es el repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo neuqrui/EOPSA-Qwen3-4B, un ajuste fino de la familia Qwen3 orientado a seguridad y alineación (tags "safety" y "alignment"). El modelo subyacente es un transformer denso de 4.411.424.256 parámetros (aproximadamente 4,4 B), entrenado y publicado con licencia Apache 2.0 y metadatos de idioma limitados al inglés (en).

El valor practico de este repositorio no esta en el modelo en si, sino en el trabajo de cuantizacion: mradermacher publica doce variantes GGUF estaticas que cubren desde Q2_K (1,9 GB) hasta f16 (8,9 GB), lo que permite ejecutar un modelo de 4,4 B en hardware de consumo, CPU o Apple Silicon con llama.cpp y sus derivados. El repositorio completo ocupa 39,7 GB porque incluye todos los niveles de cuantizacion simultaneamente.

Es relevante ahora porque, segun la metadata disponible, se trata de una variante de Qwen3-4B alineada especificamente para seguridad, un nicho con pocas alternativas abiertas y ligeras que puedan desplegarse on-premise. El autor no publica en la informacion disponible ni la longitud de contexto, ni los datos de entrenamiento, ni resultados de benchmarks del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (detalles especificos no disponibles) |
| Parametros totales | 4.411.424.256 (≈4,4 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; f16 incluido) |
| Modelo base | neuqrui/EOPSA-Qwen3-4B |
| Cuantizador | mradermacher |
| Tamano del repositorio | 39,7 GB (todas las variantes agregadas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura concreta ni sobre el proceso de entrenamiento en los materiales proporcionados. El repositorio hereda la arquitectura del modelo base neuqrui/EOPSA-Qwen3-4B, que a su vez procede de la familia Qwen3, una serie de transformers densos y MoE con variantes "thinking" y "non-thinking". Los tags del repositorio ("eopsa", "safety", "alignment") indican que el ajuste fino del modelo base esta orientado a seguridad y alineacion, pero no se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras.

En cuanto al trabajo de cuantizacion, la model card indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor senala explicitamente que no ha publicado cuantizaciones ponderadas ni con imatrix, y que si no aparecen aproximadamente una semana despues de las estaticas, probablemente no planee generarlas. No se documentan innovaciones tecnicas adicionales en el modelo de origen.

## Capacidades

- Generacion de texto conversacional: el repo esta etiquetado como "conversational" y "endpoints_compatible", por lo que esta pensado para dialogos multi-turno.
- Alineacion de seguridad: los tags "safety" y "alignment" sugieren un ajuste orientado a respuestas mas seguras o moderadas, aunque no se documenta la metodologia.
- Razonamiento y generacion general: hereda las capacidades del modelo base Qwen3-4B, no detalladas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: segun la metadata, el modelo declara unicamente ingles (en); no se confirma soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido y filtrado de seguridad: el ajuste del modelo base esta orientado a safety/alignment, por lo que puede emplearse como clasificador o generador de respuestas seguras en pipelines de moderacion, ejecutandose localmente con la cuantizacion Q4_K_M (2,8 GB).
- Asistente conversacional on-premise: al pesar entre 1,9 y 4,8 GB en cuantizaciones utilizables, puede desplegarse en un servidor interno o portatil sin enviar datos a APIs externas, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Investigacion en alineacion y evaluacion de jailbreaks: sirve como sujeto de pruebas para comparar el comportamiento de un modelo alineado de 4,4 B frente a su base sin ajustar, en experimentos reproducibles y de bajo coste de computo.
- Prototipado rapido en CPU: con la variante Q2_K o Q3_K_S puede ejecutarse en llama.cpp sobre CPU sin GPU, lo que permite validar ideas de producto antes de invertir en hardware.
- Chatbot embebido en aplicaciones de escritorio: integrable mediante llama-cpp-python o bindings equivalentes en herramientas tipo LM Studio, Jan u Ollama, con latencia aceptable para inferencia interactiva en GPU de gama media.
- Generacion de texto auxiliar en herramientas de desarrollo: al ser un modelo pequeno y sin coste de API, encaja en tareas de resumen, reescritura o generacion de borradores dentro de un IDE o un script de automatizacion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce niveles distintos, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y f16 sobre la misma tarea y el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos del modelo base neuqrui/EOPSA-Qwen3-4B en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de runtime y cache KV moderada):
  - Q2_K (1,9 GB): aproximadamente 2,5-3 GB de VRAM.
  - Q3_K_S/M/L (2,2-2,5 GB): aproximadamente 3-3,5 GB.
  - IQ4_XS (2,6 GB): aproximadamente 3,5 GB.
  - Q4_K_S / Q4_K_M (2,7-2,8 GB): aproximadamente 3,5-4,5 GB.
  - Q5_K_S / Q5_K_M (3,2-3,3 GB): aproximadamente 4,5-5 GB.
  - Q6_K (3,7 GB): aproximadamente 5-5,5 GB.
  - Q8_0 (4,8 GB): aproximadamente 6-7 GB.
  - f16 (8,9 GB): aproximadamente 10-11 GB.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070/3080, RX 6700 XT, etc.). No requiere A100, H100 ni GPUs de centro de datos.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con 8 GB de VRAM; f16 requiere alrededor de 12 GB o memoria unificada de Apple Silicon de gama alta.
- CPU y Apple Silicon: viable en modo CPU-only con llama.cpp (especialmente Q2_K a Q4_K_M) y en Macs con memoria unificada a partir de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Las librerias de servidor de alto rendimiento (vLLM, TGI) tienen soporte limitado o experimental de GGUF y no se documentan para este repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EOPSA-Qwen3-4B-GGUF (mradermacher) | 4,4 B | no disponible | Apache 2.0 | GGUF (12 variantes) | Cuantizacion estatica; ajuste orientado a seguridad |
| Qwen3-4B-GGUF (mradermacher) | no disponible | no disponible | Apache 2.0 | GGUF | Mismo cuantizador sobre el Qwen3-4B sin ajuste de seguridad |
| neuqrui/EOPSA-Qwen3-4B | 4,4 B | no disponible | Apache 2.0 | no disponible | Modelo base sin cuantizar del que deriva este repo |
| Qwen3-4B (original) | no disponible | no disponible | Apache 2.0 | safetensors (familia Qwen3) | Modelo denso de la familia Qwen3 con variantes thinking y non-thinking |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa de calidad entre estas alternativas.

## Limitaciones y advertencias

- Idiomas: la metadata declara unicamente ingles; no hay evidencia de soporte de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de comportamiento diferencial por subgrupos.
- Alucinacion: un modelo de 4,4 B sin benchmarks publicados tiene un riesgo de alucinacion no cuantificado; se recomienda validacion humana en aplicaciones sensibles.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Ajuste de seguridad no verificado: aunque los tags indican "safety" y "alignment", no se publica metodologia, evaluacion ni tasas de fallo del ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio no aporta garantias ni soporte; conviene revisar tambien las condiciones del modelo base y de la familia Qwen3.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K degradan la calidad de forma notable segun las propias notas del autor (la Q3_K_M se marca como "lower quality"); no se recomiendan para produccion.
- Sin cuantizaciones ponderadas ni imatrix: el autor indica que no las ha generado y probablemente no las planee, lo que limita las opciones de optimizacion de calidad por bit.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de uso en produccion.
- Fechas de publicacion: el repositorio aparece creado y actualizado el 26 de septiembre de 2026, lo que conviene verificar antes de citarlo.
- Adecuacion a produccion: al ser un modelo de 4,4 B, su rendimiento en tareas complejas de razonamiento o codigo sera previsiblemente inferior al de modelos mayores; no hay datos que permitan confirmarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/EOPSA-Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/neuqrui/EOPSA-Qwen3-4B
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#EOPSA-Qwen3-4B-GGUF
- Peticiones de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Otro trabajo del mismo autor sobre Qwen3-4B: https://huggingface.co/mradermacher/Qwen3-4B-GGUF
- Discusion sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de ficheros GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de la familia Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
