# hellmans/Huihui-Qwen3-4B-abliterated-v2-GGUF

## Resumen

Huihui-Qwen3-4B-abliterated-v2-GGUF es una distribucion en formato GGUF del modelo huihui-ai/Huihui-Qwen3-4B-abliterated-v2, un derivado "abliterated" (es decir, con las capas de rechazo parcialmente suprimidas mediante la tecnica de abliteration) del Qwen3-4B de Alibaba. El repositorio esta publicado por el usuario hellmans y contiene cuantizaciones estaticas generadas originalmente por mradermacher, segun se desprende de los metadatos de la model card. El modelo base conserva la arquitectura y el conocimiento del Qwen3-4B original, pero modifica los pesos para reducir la tendencia del modelo a rechazar peticiones.

El interes de esta ficha radica en que combina tres elementos: un modelo pequeno (4.022.468.096 parametros, aproximadamente 4B) que cabe en hardware de consumo, una ventana de contexto heredada de la familia Qwen3 y un proceso de abliteration que altera el comportamiento de seguridad del modelo original. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque el proceso de abliteration introduce consideraciones adicionales de responsabilidad para quien lo despliegue.

El repositorio tiene un tamano de 36,4 GB, coherente con la inclusion de multiples cuantizaciones GGUF (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB). El idioma declarado es unicamente ingles. No se dispone de informacion sobre pipeline, benchmarks ni detalles del proceso de entrenamiento o de la abliteration mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-4B; detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su origen en Qwen3-4B, un transformer decoder-only de la familia Qwen3. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo que si se documenta es el proceso de abliteration: el modelo huihui-ai/Huihui-Qwen3-4B-abliterated-v2 ha sido modificado para reducir la direccion de activacion asociada al rechazo, una tecnica que interviene sobre los pesos sin reentrenar el modelo desde cero.

Las cuantizaciones incluidas en este repositorio son de tipo estatico (no imatrix), generadas con el pipeline de mradermacher y etiquetadas como quantize_version 2 y output_tensor_quantised 1. La model card indica que existen cuantizaciones ponderadas/imatrix en un repositorio separado (mradermacher/Huihui-Qwen3-4B-abliterated-v2-i1-GGUF). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal especifica para esta variante.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B.
- Comportamiento "uncensored": el proceso de abliteration reduce la tasa de rechazo ante peticiones que el modelo original rechazaria.
- Razonamiento y generacion de codigo basicos, propios de un modelo de 4B parametros.
- Soporte de chat multi-turno mediante el formato de conversacion del modelo base.
- Capacidades multilingues limitadas: el unico idioma declarado es el ingles.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparandolo con el Qwen3-4B original en el mismo hardware.
- Despliegue local en equipos de consumo: con cuantizaciones Q4_K_M de 2,6 GB, puede ejecutarse en GPUs de gama media o incluso en CPU con llama.cpp, lo que facilita prototipado sin infraestructura dedicada.
- Generacion de texto creativo sin filtros editoriales: escritura de ficcion, dialogos o guiones donde el modelo original aplicaria restricciones de contenido.
- Evaluacion de robustez de filtros: usar el modelo como generador adversario para probar clasificadores de contenido o sistemas de moderacion en pipelines propios.
- Experimentacion con cuantizaciones: el repositorio ofrece doce variantes GGUF, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de 4B.
- Asistente conversacional de proposito general en ingles: tareas de resumen, reescritura y respuesta a preguntas donde el contexto requerido no exceda la ventana del modelo base.
- Fine-tuning ligero sobre GGUF o sobre el modelo base en safetensors: al ser Apache 2.0, se puede adaptar a dominios concretos y redistribuir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB con Q4_K_M, 3,4 GB con Q6_K y 4,4 GB con Q8_0; la version f16 requiere unos 8,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4070); para f16 se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4080, A10).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-4B-abliterated-v2-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF | Variante abliterated, 12 cuantizaciones |
| Qwen3-4B (original) | 4B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base con alineacion intacta |
| Huihui-Qwen3-4B-abliterated-v2 (safetensors) | 4,02B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar, origen de esta distribucion |
| mradermacher/Huihui-Qwen3-4B-abliterated-v2-i1-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix/ponderadas del mismo modelo |

## Limitaciones y advertencias

- La abliteration elimina parcialmente las capas de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sensible sin las salvaguardas del Qwen3-4B original; el despliegue en produccion exige filtros externos.
- Riesgo de alucinacion propio de un modelo de 4B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Ventana de contexto no especificada en la informacion disponible; no debe asumirse la del Qwen3-4B sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador, no en el autor del modelo.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad; conviene verificar la integridad de los archivos antes de usarlos.
- No hay benchmarks publicados para esta variante; el rendimiento debe medirse empiricamente antes de adoptarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellmans/Huihui-Qwen3-4B-abliterated-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-Qwen3-4B-abliterated-v2-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Huihui-Qwen3-4B-abliterated-v2-GGUF
- Modelo Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Licencia Apache 2.0 de Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
