# finanfa-tech/finanfa-benin-base-finance

## Resumen

Benin-Finance es un ajuste fino de Qwen3.5-4B desarrollado por Finanfa Tech, una empresa beninesa, para asistencia especializada en contabilidad, fiscalidad y finanzas de Benín. El modelo tiene 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y se ha obtenido mediante LoRA fusionado en los pesos del modelo base, por lo que el repositorio contiene el modelo completo listo para usarse con `transformers`. Su licencia es Apache 2.0 y el único idioma declarado es el francés.

La característica central del modelo es que está diseñado como un "lector" y no como una memoria: responde exclusivamente a partir de extractos de textos legales que se le proporcionan (Código General de Impuestos, leyes de finanzas, doctrina de la DGI, actos uniformes OHADA) y cita el acto y el artículo correspondiente. Cuando los extractos no contienen la respuesta, el modelo se abstiene en lugar de inventar tasas, umbrales o números de artículo. Esto lo hace adecuado para arquitecturas RAG (retrieval-augmented generation) sobre corpus normativos oficiales.

El modelo es relevante en el contexto de la digitalización fiscal en África Occidental: aplica explícitamente la ley de finanzas 2026 (ley n.º 2025-22 del 8 de diciembre de 2025) cuando modifica el CGI, corrige premisas falsas y rechaza preguntas sobre fiscalidad de otros países. Se distribuye como prototipo no validado por juristas ni expertos contables, por lo que su uso en producción requiere supervisión humana y verificación contra el texto oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), ajuste fino con LoRA fusionado |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parámetros, sobre el que se aplicó un ajuste fino con LoRA y posteriormente se fusionó el adaptador en los pesos base. El resultado es un modelo completo que conserva la arquitectura del original pero con el comportamiento especializado inducido por el ajuste. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

El entrenamiento se orientó a un formato de entrada concreto: un mensaje de sistema definido en el archivo `SYSTEME_RAG.txt` incluido en el repositorio, y un mensaje de usuario con la estructura "Extraits fournis : [1] Acte, article N : texto ... Question : ...". El modelo fue entrenado con el bloque de reflexión vacío, por lo que debe usarse con `enable_thinking=False` en la plantilla de conversación. Se recomienda generación determinista (`do_sample=False`) para respuestas reproducibles. Una innovación destacable es el comportamiento de abstención explícita cuando los extractos no contienen la respuesta, así como la capacidad de señalar cuándo un número de artículo no existe (el CGI consolidado de 2025 llega hasta el artículo 659).

## Capacidades

- Generación de texto especializada en fiscalidad, contabilidad y finanzas de Benín, con citación de acto y artículo.
- Aplicación de la ley de finanzas 2026 (ley n.º 2025-22 del 8 de diciembre de 2025) cuando modifica artículos del CGI, señalando el cambio (por ejemplo, el suelo del impuesto mínimo de beneficios de negocios, art. 64 §3 a) del CGI, que pasa de 500.000 a 250.000 FCFA por el artículo 14 de la ley de finanzas 2026).
- Abstención cuando los extractos proporcionados no contienen la respuesta.
- Corrección de premisas falsas en las preguntas del usuario (por ejemplo, aclarar que el IVA es del 18 %, art. 241 del CGI, y no del 16 %).
- Rechazo de preguntas sobre fiscalidad de otros países y presentación del propio modelo (nombre, creador, alcance).
- Detección de números de artículo inexistentes en el corpus de referencia.
- Capacidad de procesamiento de imagen y texto según el tag `image-text-to-text` del modelo base, aunque la model card no documenta uso multimodal específico para esta especialización.
- Soporte de conversación multi-turno mediante plantilla de chat de `transformers`.

## Casos de uso

- Asistencia fiscal con RAG sobre el CGI: se indexan el Código General de Impuestos actualizado, las leyes de finanzas y la doctrina de la DGI en un motor híbrido (búsqueda densa con `bge-m3`, BM25 y búsqueda exacta de "article N") y se pasa el extracto al modelo, que responde citando el artículo. Según la model card, este esquema recupera el artículo útil en los 5 primeros resultados aproximadamente el 93 % de las veces.
- Atención al contribuyente: el modelo puede gestionar consultas multi-turno sobre obligaciones fiscales siempre que se le proporcionen los extractos normativos correspondientes, absteniéndose cuando la búsqueda no recupera el artículo relevante.
- Verificación de premisas en consultas de usuarios: útil en interfaces de chat donde el usuario plantea afirmaciones erróneas sobre tasas o umbrales; el modelo corrige la premisa citando el artículo aplicable.
- Soporte a la contabilidad OHADA: con extractos de los actos uniformes OHADA indexados, el modelo puede responder sobre tratamiento contable y financiero dentro del marco normativo regional.
- Asistencia a gestores fiscales y asesores: como capa de consulta rápida sobre textos oficiales, con la salvedad de que toda respuesta debe reconfirmarse contra el texto oficial o la administración tributaria.
- Filtrado de preguntas fuera de alcance: en un chatbot desplegado, el modelo rechaza consultas sobre fiscalidad de otros países, lo que simplifica el enrutamiento y evita respuestas inapropiadas.
- Actualización normativa vía búsqueda web: para tasas, umbrales, calendarios y leyes de finanzas posteriores, se recupera la fuente oficial reciente (DGI, Journal officiel, Secrétariat général du gouvernement) y se pasa como extracto al modelo, que la citará y señalará lo que debe reconfirmarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,66 mil millones de parámetros en bfloat16, se requieren aproximadamente 9,3 GB solo para los pesos; con cuantización a 8 bits bajaría a unos 4,7 GB y a 4 bits a unos 2,3 GB (estimación a partir del tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: el ejemplo de la model card usa `device_map="auto"` con `torch.bfloat16`, por lo que cabe en GPUs de 16 GB o más (RTX 4090, A100 40 GB, H100). En GPUs de 24 GB (RTX 3090/4090) cabe en bfloat16 con margen para el contexto.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y modelos con 16 GB o más en bfloat16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` (documentado por el autor); vLLM, TGI, llama.cpp u Ollama no están documentados explícitamente en la model card, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| finanfa-benin-base-finance | 4,66 B | No disponible | Frances | Apache 2.0 | Fiscalidad y contabilidad de Benin (RAG) |
| Qwen/Qwen3.5-4B | 4 B (aproximadamente) | No disponible | Multilingue | No disponible en la informacion | Modelo base generalista |
| Modelos fiscales especializados en frances | No disponible | No disponible | Frances | No disponible | No se han identificado alternativas comparables en la informacion disponible |

El modelo base Qwen3.5-4B es la referencia directa: el ajuste fino añade el comportamiento de citacion, abstencion y correccion de premisas, a costa de perder generalidad y de requerir extractos para responder con fiabilidad. No se dispone de informacion sobre otros modelos especializados en fiscalidad beninesa con los que comparar.

## Limitaciones y advertencias

- El modelo es un prototipo no validado por juristas, fiscalistas ni expertos contables; sus respuestas no constituyen asesoramiento juridico, fiscal ni contable.
- Sin extractos proporcionados, no conoce de forma fiable tasas, umbrales ni numeros de articulo y puede equivocarse; su uso serio exige RAG sobre textos oficiales.
- Solo conoce los textos de referencia listados en la model card; cualquier norma posterior (leyes de finanzas posteriores, notas de servicio, nuevas obligaciones como la facturacion normalizada) le es desconocida y requiere busqueda web y aporte de la fuente como extracto.
- La calidad de la respuesta depende en primer lugar de la calidad de la recuperacion: cuando el motor de busqueda falla el articulo, el modelo se abstiene.
- Idioma limitado al frances; no se declara soporte de otros idiomas.
- Riesgo de alucinacion mitigado por el entrenamiento de abstencion, pero no eliminado; toda respuesta debe reconfirmarse contra el texto oficial o la administracion tributaria.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion profesional traslada al integrador la responsabilidad legal y fiscal del uso.
- La model card no documenta la longitud de contexto, los tipos de cuantizacion soportados ni el rendimiento en benchmarks, lo que limita la evaluacion cuantitativa previa a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-benin-base-finance
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Archivo de sistema RAG incluido en el repositorio: `SYSTEME_RAG.txt` (https://huggingface.co/finanfa-tech/finanfa-benin-base-finance/blob/main/SYSTEME_RAG.txt)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
