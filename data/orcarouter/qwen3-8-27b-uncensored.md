# orcarouter/Qwen3.8-27B-Uncensored

## Resumen

El modelo `orcarouter/Qwen3.8-27B-Uncensored` es una versión "abliterada" (uncensored) del Qwen3.8-27B de Alibaba, desarrollada por el usuario orcarouter. La técnica de abliteration elimina los mecanismos internos de rechazo del modelo original, de modo que responde a peticiones que el modelo base normalmente bloquearía. Es un modelo multimodal de visión y lenguaje (image-text-to-text) con 27,8 mil millones de parámetros, basado en la arquitectura Qwen3.8 (etiquetada como qwen3_5 en el repositorio). Incluye capacidades de razonamiento, function calling y multi-token prediction (MTP). Su relevancia actual radica en su uso para red-teaming, investigación de alineación y entornos donde se necesita generar contenido sin restricciones, aunque con importantes advertencias éticas y legales. El acceso está restringido (gated) en HuggingFace y requiere aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante Qwen3.8, basada en Qwen3.5) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (original), FP8, GGUF (Q4_K_M), MLX |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original), ademas de FP8, GGUF y MLX |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un modelo de lenguaje multimodal de 27,8 B parámetros que procesa tanto texto como imágenes. La versión uncensored se obtiene mediante abliteration, una técnica de post-entrenamiento que identifica direcciones en el espacio de activaciones del modelo asociadas con comportamientos de rechazo y las elimina o modifica. El autor (orcarouter) aplicó este procedimiento al modelo base, resultando en un modelo que no filtra peticiones consideradas peligrosas o inapropiadas. Ademas, el repositorio de GitHub asociado menciona un "harvested uncensored SYSTEM pack" que modifica el prompt de sistema para mantener el comportamiento sin censura. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteration. El modelo conserva las capacidades de razonamiento, function calling y MTP del original.

## Capacidades

- Generacion de texto y razonamiento multi-step.
- Comprension de imagenes (entrada visual) y generacion de descripciones o respuestas basadas en ellas.
- Soporte de function calling / tool calling para integracion con APIs y herramientas externas.
- Razonamiento avanzado con modo thinking (heredado de la familia Qwen3).
- Multilingue limitado a ingles y chino (segun los tags del repositorio).
- Comportamiento sin censura: no rechaza peticiones sobre temas delicados, ilegales o eticamente cuestionables (efecto de la abliteration).
- Multi-token prediction (MTP) para acelerar la generacion.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo puede usarse para probar sistemas de moderacion de contenido, detectar vulnerabilidades en pipelines de IA generativa y estudiar como los modelos responden a ataques adversariales.
- Investigacion en alineacion de modelos: permite analizar que mecanismos internos provocan los rechazos y como la abliteration los elimina, contribuyendo al desarrollo de tecnicas de control mas robustas.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones, dialogos o material satirico que el modelo base rechazaria por politicas de seguridad.
- Asistente de programacion en entornos aislados: con su soporte de function calling, puede integrarse en pipelines de desarrollo para generar codigo, documentacion o pruebas sin filtros de contenido.
- Analisis de imagenes en contextos tecnicos: descripcion de diagramas, capturas de pantalla o fotografias donde se requiere un analisis directo sin restricciones de contenido.
- Simulacion de conversaciones dificiles: generacion de interacciones hostiles, provocadoras o extremas para entrenar sistemas de dialogo y clasificadores de toxicidad.
- Desarrollo de agentes autonomos: su capacidad de razonamiento multi-step y tool calling permite construir agentes que ejecutan tareas complejas sin necesidad de moderacion intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 se necesitan aproximadamente 56 GB (tamano del repositorio), en FP8 alrededor de 28 GB, y en GGUF Q4_K_M unos 16,8 GB (segun el repositorio de GitHub).
- GPU recomendadas: para bf16 o FP8, una A100 80 GB o H100; para GGUF Q4_K_M, una RTX 4090 o RTX 3090 (24 GB) es suficiente.
- En consumer GPU: el modelo cabe en GPUs de 24 GB solo con cuantizacion GGUF Q4_K_M o similar. Con FP8 se necesita al menos 32 GB, lo que excluye la mayoria de GPUs domesticas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (con el pack de sistema del repositorio de GitHub), TGI, y MLX para Apple Silicon (M2/M3/M4 con RAM unificada suficiente).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos uncensored de tamano similar en la informacion proporcionada. Como referencia, el modelo base Qwen3.8-27B es comparable en tamano a otros modelos densos de 27-32 B como Mistral-Small-24B o Llama-3.1-8B (aunque estos ultimos son mas pequenos). La principal diferencia frente a alternativas abliteradas de otros modelos (por ejemplo, versiones uncensored de Llama o Mistral) es la combinacion de multimodalidad (vision) y function calling, que no es comun en modelos abliterados. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de otras licencias como Llama (que tiene clausulas de uso aceptable). Sin embargo, el acceso gated en HuggingFace puede limitar la disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar los rechazos, el modelo puede generar contenido ofensivo, discriminatorio, ilegal o peligroso sin ninguna barrera. No se ha realizado una evaluacion de sesgos especifica para esta version.
- Riesgo de alucinacion: inherente a todos los LLM, pero al no haber filtros de seguridad, las alucinaciones pueden ser mas daninas (por ejemplo, instrucciones medicas o legales incorrectas).
- Limitaciones de contexto e idioma: la longitud de contexto no se ha especificado; los idiomas soportados son solo ingles y chino, por lo que el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el acceso al repositorio es gated y requiere aceptar condiciones adicionales en HuggingFace. El uso comercial es legal, pero la responsabilidad legal por el contenido generado recae en el usuario.
- Caves para produccion: no se recomienda su uso en aplicaciones orientadas al publico sin un sistema de moderacion externo robusto. La abliteration no elimina todos los sesgos subyacentes del modelo base, solo los mecanismos de rechazo.
- El modelo puede ser utilizado para fines malintencionados; se recomienda restringir su uso a entornos de investigacion controlados.

## Enlaces

- Repositorio HuggingFace (original): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Repositorio GitHub con GGUF y pack de sistema: https://github.com/Wassimyounes01/qwen38-uncensored
- Blog de explainx.ai sobre el build MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Blog de orcarouter.ai sobre el lanzamiento de Qwen3.8: https://www.orcarouter.ai/blog/qwen-3-8-27b-open-weights-leak
