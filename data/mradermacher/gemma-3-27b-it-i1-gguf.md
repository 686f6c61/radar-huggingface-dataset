# mradermacher/gemma-3-27b-it-i1-GGUF

## Resumen

`mradermacher/gemma-3-27b-it-i1-GGUF` es una recopilación de cuantizaciones GGUF del modelo `google/gemma-3-27b-it`, publicada por el usuario mradermacher el 16 de marzo de 2025. No es un modelo entrenado desde cero, sino una conversión y compresión del modelo instructivo oficial de Google Gemma 3 de 27.000 millones de parámetros, pensada para su ejecución local con llama.cpp y herramientas compatibles. El repositorio incluye cuantizaciones estáticas y del tipo "imatrix" (i1), que emplean una matriz de importancia para preservar mejor la calidad en niveles de compresión agresivos.

El modelo base, Gemma 3 27B IT, es un transformer denso de Google diseñado para generación de texto, razonamiento, código y matemáticas, con soporte multilingüe y una ventana de contexto amplia. Esta versión GGUF resulta relevante porque permite desplegar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde los 6,4 GB (IQ1_S) hasta los 22,3 GB (Q6_K), manteniendo en los niveles medios (Q4_K_M, Q5_K_M) un equilibrio razonable entre tamaño y fidelidad respecto al original en safetensors.

El repositorio ocupa 294,9 GB en total por acumular todas las variantes, pero el usuario solo necesita descargar el archivo GGUF correspondiente a la cuantización elegida. Es una opción práctica para quienes quieren ejecutar Gemma 3 27B en estaciones de trabajo con una o dos GPU consumer, o incluso en CPU con suficiente RAM en las variantes más pequeñas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 3 de Google) |
| Parámetros totales | 27.009.002.240 (27B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | i1-IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix/weighted) |
| Idiomas soportados | en (según la model card; el modelo base Gemma 3 es multilingüe, pero la ficha declara solo inglés) |
| Licencia | gemma (Gemma Terms of Use de Google, con acceso restringido mediante aceptación) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Esta ficha describe una cuantización, no un entrenamiento nuevo. El modelo subyacente es `google/gemma-3-27b-it`, un transformer denso de 27B parámetros de la familia Gemma 3 de Google. La model card del repositorio no aporta detalles sobre la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información corresponde a la documentación oficial de Google y no está incluida en los datos disponibles.

La innovación técnica de este repositorio es el uso de cuantización con matriz de importancia (imatrix), etiquetada como `i1` y generada con herramientas de llama.cpp. Según el autor, estas variantes ofrecen mejor calidad que las cuantizaciones estáticas de tamaño equivalente, especialmente en los niveles bajos (IQ2, IQ3). El repositorio incluye también una versión estática en `mradermacher/gemma-3-27b-it-GGUF`. Los archivos están divididos en partes para facilitar la descarga y deben concatenarse antes de su uso, tal como se indica en las referencias de TheBloke enlazadas por el autor.

## Capacidades

- Generación de texto conversacional en modo instructivo (etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones complejas, heredado del modelo base Gemma 3 27B IT.
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base; no se detallan métricas en la información disponible).
- Soporte multilingüe del modelo base, aunque la model card de esta cuantización declara únicamente `en`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints o servidores compatibles con GGUF.
- No se documenta en esta ficha soporte explícito de tool calling, function calling, agentes, visión, audio ni modo "thinking"; estas capacidades, si existen, dependen del modelo base y no están confirmadas en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: usar la cuantización Q4_K_M (16,6 GB) o Q5_K_M (19,4 GB) con llama.cpp para tener un asistente conversacional de 27B en una máquina con 24 GB de VRAM o con RAM suficiente en CPU.
- Prototipado de aplicaciones de chat: integrar el GGUF en Ollama o llama.cpp para construir un chatbot de atención al cliente con respuestas de calidad cercana al modelo original, sin depender de APIs externas.
- Generación de código en entornos con requisitos de privacidad: ejecutar la variante Q6_K (22,3 GB) en local para autocompletado y revisión de código sin enviar datos a la nube.
- Evaluación comparativa de cuantizaciones: descargar varias variantes (IQ3_S, Q4_K_M, Q5_K_M) y medir la degradación de calidad en tareas propias, ya que el autor documenta explícitamente qué cuantizaciones son preferibles en cada rango de tamaño.
- Investigación sobre cuantización: usar los archivos imatrix como referencia para estudiar el impacto de la matriz de importancia en la perplejidad y en tareas downstream.
- Despliegue en servidores compatibles con GGUF: aprovechar la etiqueta `endpoints_compatible` para servir el modelo mediante backends que acepten este formato en una infraestructura interna.
- Educación y experimentación: ejecutar la variante IQ2_M (9,6 GB) en GPU consumer de gama media para aprender sobre modelos de 27B con recursos limitados, aceptando la pérdida de calidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una gráfica comparativa de perplejidad entre tipos de cuantización (enlace a `nethype.de`) y una referencia a las notas de Artefact2 sobre calidad de cuantizaciones, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni similares para esta versión GGUF ni para el modelo base en los datos proporcionados.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: desde 6,4 GB (IQ1_S) hasta 22,3 GB (Q6_K). Para Q4_K_M se necesitan aproximadamente 16,6 GB; para Q5_K_M, unos 19,4 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A100 o H100 para despliegues con concurrencia o contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) solo para cuantizaciones IQ2/IQ3.
- Cabe en GPU consumer: sí, en RTX 4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con IQ3_M o Q3_K_M (12,6-13,5 GB); en GPUs de 8-12 GB solo con IQ1/IQ2, con la pérdida de calidad que el propio autor advierte.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier backend compatible con GGUF; el autor enlaza instrucciones de uso basadas en los README de TheBloke, incluida la concatenación de archivos multiparte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemma-3-27b-it-i1-GGUF | 27B | no disponible | GGUF (imatrix) | gemma | Hugging Face |
| mradermacher/gemma-3-27b-it-GGUF | 27B | no disponible | GGUF (estático) | gemma | Hugging Face |
| google/gemma-3-27b-it | 27B | no disponible | safetensors | gemma | Hugging Face (acceso con aceptación) |

La comparación con alternativas de otros fabricantes (por ejemplo, Llama 3.1 8B/70B o Mistral) no está disponible en la información proporcionada, por lo que no se incluyen datos de rendimiento comparado.

## Limitaciones y advertencias

- Las cuantizaciones de muy baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- El repositorio declara únicamente el idioma inglés; el rendimiento en castellano no está verificado en esta ficha, aunque el modelo base Gemma 3 es multilingüe.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta cuantización.
- Licencia Gemma de Google: requiere aceptar los términos de uso y tiene restricciones para uso comercial; conviene revisar las Gemma Terms of Use antes de desplegar en producción.
- El acceso al modelo base en Hugging Face está restringido mediante gate ("Access Gemma on Hugging Face"), y esta cuantización hereda esa dependencia.
- El repositorio ocupa 294,9 GB; descargar archivos innecesarios consume ancho de banda y disco. Seleccione solo la variante requerida.
- Los archivos multiparte deben concatenarse correctamente antes de cargarlos; un manejo incorrecto produce errores de carga.
- No se documentan en la información disponible el contexto máximo, el soporte de tool calling ni las capacidades multimodales; no deben asumirse sin verificar en la documentación oficial de Gemma 3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-it-i1-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Versión estática del mismo autor: https://huggingface.co/mradermacher/gemma-3-27b-it-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-27b-it-i1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
