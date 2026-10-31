# mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF

## Resumen

Qwen3.5-9B-Surgical-Abliterated-i1-GGUF es una colección de cuantizaciones en formato GGUF con imatrix (matriz de importancia) del modelo medismera/Qwen3.5-9B-Surgical-Abliterated, preparada por el cuantizador conocido mradermacher. El modelo base es una versión "abliterated" (con los mecanismos de rechazo alineados eliminados mediante la técnica de surgical alignment) de un modelo de 9 mil millones de parámetros de la familia Qwen3.5. Este repositorio no contiene pesos nuevos: su función es permitir la ejecución local y eficiente del modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF.

La relevancia de esta ficha de cuantización radica en la combinación de dos factores: por un lado, el abliteration permite obtener respuestas sin los filtros de seguridad del modelo original, algo demandado en investigación y casos de uso creativos; por otro, las cuantizaciones con imatrix de mradermacher ofrecen una relación calidad/tamaño muy ajustada, con versiones desde unos 4 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K). El modelo base es de tipo causal-lm conversacional y, según la model card, se trata de un modelo de visión, por lo que los archivos mmproj correspondientes se publican en el repositorio de cuantizaciones estáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer, familia Qwen3.5) |
| Parámetros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, medismera/Qwen3.5-9B-Surgical-Abliterated, es un modelo de lenguaje causal basado en la arquitectura de la familia Qwen3.5 con aproximadamente 9,2 mil millones de parámetros. Sobre él se ha aplicado un proceso de "abliteration" mediante "surgical alignment", una técnica que modifica selectivamente las direcciones de activación responsables de los rechazos por seguridad, eliminando la conducta de negación sin necesidad de reentrenamiento completo. No se dispone de información pública sobre los datos de entrenamiento, el número de tokens ni los procesos de RLHF/DPO del modelo original.

Respecto a las cuantizaciones, mradermacher emplea cuantización con matriz de importancia (imatrix), que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los tensores más relevantes. Según el autor, los quants IQ suelen ser preferibles a los quants estáticos de tamaño similar, y el quant i1-Q4_K_S se señala como el punto óptimo de equilibrio entre tamaño, velocidad y calidad. La model card indica además que se trata de un modelo de visión, cuyos archivos mmproj se distribuyen en el repositorio hermano de cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional sin los rechazos de seguridad del modelo original (abliterated/uncensored).
- Capacidades de visión multimodal, según la model card (los archivos mmproj están en el repositorio de quants estáticos).
- Ejecución local eficiente en CPU y GPU gracias al formato GGUF con una amplia gama de niveles de cuantización.
- Compatibilidad con runtimes estándar como llama.cpp, Ollama, LM Studio y KoboldCpp.
- El resto de capacidades (razonamiento, código, matemáticas, tool calling, agentes) heredan del modelo base Qwen3.5 de 9B; no se detallan en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad: el modelo abliterated permite estudiar el comportamiento de un LLM sin capas de rechazo, útil para red-teaming y análisis de robustez de filtros.
- Ejecución local en hardware de consumo: con el quant i1-Q4_K_M (5,9 GB) cabe en una GPU de 8 GB de VRAM o incluso en CPU con RAM suficiente, ideal para uso privado sin conexión.
- Escritura creativa sin restricciones: la ausencia de rechazos facilita flujos de escritura de ficción donde los filtros estándar interrumpen la generación.
- Prototipado de aplicaciones locales: integrable en Ollama o LM Studio para construir demos y asistentes personales offline.
- Análisis de imágenes local: al tratarse de un modelo de visión, puede emplearse para descripción de imágenes en entornos donde no se desee enviar datos a la nube (usando los mmproj del repo estático).
- Generación de datasets de investigación: útil para producir datos de entrenamiento sin sesgos de rechazo, por ejemplo para estudiar diferencias de conducta entre modelos alineados y no alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 4 GB (i1-Q2_K) hasta unos 8 GB (i1-Q6_K) para cargar el modelo completo; el quant recomendado i1-Q4_K_M ocupa 5,9 GB.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 para contextos largos o quants altos); también viable en CPU con 8-16 GB de RAM a menor velocidad.
- Cabe en consumer GPU: sí, todas las cuantizaciones caben en GPUs de 8 GB o más; el i1-Q4_K_S (5,6 GB) es la opción óptima según el autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM/TGI, que requieren pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponible; en general, los quants Q4 sobre 9B parámetros ofrecen decodificación fluida en GPUs de consumo (decenas de tokens/s), pero no hay cifras publicadas para este repo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF | 9,2B | GGUF imatrix | Apache 2.0 | Quants con imatrix, mayor calidad por tamaño |
| mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF | 9,2B | GGUF estático | Apache 2.0 | Mismo modelo, quants estáticos y archivos mmproj |
| medismera/Qwen3.5-9B-Surgical-Abliterated | 9,2B | safetensors | Apache 2.0 | Modelo base sin cuantizar, para vLLM/TGI/transformers |

## Limitaciones y advertencias

- Al ser un modelo abliterated, genera contenido sin filtros de seguridad: puede producir texto ofensivo, peligroso o inapropiado. No es apto para entornos de producción orientados a usuarios finales sin capas de moderación externas.
- El abliteration puede degradar la calidad general del modelo (coherencia, razonamiento) respecto al modelo base original; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Los quants de calidad baja (i1-Q2_K, i1-Q4_0) sufren pérdida notable de calidad según el propio autor; se recomiendan IQ3_XXS o superiores.
- Idioma principal: inglés según la model card; el rendimiento en castellano no está documentado.
- Longitud de contexto, capacidades exactas de tool calling y datos de entrenamiento del modelo base: no disponible en la información proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario.
- La procedencia del modelo base (medismera) no incluye model card técnica detallada en la información disponible, lo que dificulta auditar el proceso de abliteration.

## Enlaces

- Repositorio GGUF imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- Repositorio GGUF estático (con mmproj): https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/Qwen3.5-9B-Surgical-Abliterated
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
