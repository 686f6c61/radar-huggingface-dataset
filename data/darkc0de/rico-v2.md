# darkc0de/RICO-v2

## Resumen

RICO-v2 (R.I.C.O.) es un ajuste fino experimental publicado por el usuario darkc0de dentro del proyecto "XORTRON Criminal Computing", un ejercicio de investigacion centrado en seguridad y alineacion de IA. El modelo parte de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU y se presenta explicitamente como un sistema "uncensored", "abliterated" y "not-for-all-audiences", orientado a estudiar la capacidad de los modelos de lenguaje para generar contenido sensible u operativamente relevante en escenarios de abuso. Su pipeline declarado en HuggingFace es image-text-to-text, por lo que la familia base incorpora capacidad multimodal de entrada de imagen y texto.

El modelo cuenta con 27.781.427.952 parametros reales (segun los safetensors del repositorio) y un repositorio de 55,6 GB en formato safetensors, con licencia declarada apache-2.0 en los metadatos de HuggingFace. La ficha del autor, sin embargo, impone un acuerdo de acceso restringido y uso autorizado, limitando el uso a perfiles profesionales concretos (investigacion en seguridad de IA, red teaming, analisis legal, fuerzas de seguridad, amenazas y fraude, entre otros), lo que genera una tension clara entre la licencia tecnica y las condiciones de uso publicadas.

La relevancia del modelo es fundamentalmente metodologica: sirve como artefacto de estudio para medir hasta donde llega un modelo abliterado de ~27,8B en tareas de contenido restringido, y para documentar riesgos de mal uso. No es un modelo recomendado para produccion general, atencion al cliente ni aplicaciones comerciales convencionales. No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto, cuantizacion o composicion de datos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text; tag de arquitectura qwen3_5). Detalles de capas, atencion o posible mezcla MoE: no disponible |
| Parametros totales | 27.781.427.952 (~27,8B), dato real de los safetensors |
| Parametros activos | No disponible. No se ha confirmado que la arquitectura sea MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 segun metadatos de HuggingFace; la model card impone adicionalmente un acuerdo de acceso restringido y uso autorizado (XORTRON Restricted Access & Authorized-Use Agreement) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 55,6 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Dataset de ajuste | darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT |
| Descargas / likes | 168 descargas, 3 likes |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags de HuggingFace: pipeline image-text-to-text, tag de arquitectura qwen3_5 y compatibilidad con transformers y text-generation-inference. Esto implica un modelo multimodal capaz de aceptar entradas de imagen y texto, construido sobre una familia base de tipo Qwen con 27,8B de parametros. No se especifica si emplea atencion completa, atencion lineal, mezcla de expertos ni ninguna otra innovacion de eficiencia; tampoco se documentan la longitud de contexto soportada ni la estrategia de tokenizacion.

Respecto al entrenamiento, lo unico verificable es la cadena de derivacion: un ajuste fino sobre DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, usando el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, con la libreria Unsloth presente en los tags (lo que sugiere un flujo de fine-tuning eficiente en memoria, probablemente LoRA o QLoRA, aunque no se confirma ni se detalla el rango, el learning rate, el numero de pasos ni el volumen de tokens). No hay informacion sobre si se aplicaron etapas de RLHF, DPO, ORPO ni sobre la composicion del corpus. La etiqueta "abliterated" indica que se ha aplicado alguna tecnica de supresion o redireccion de direcciones de rechazo, pero no se documenta el metodo concreto.

## Capacidades

- Generacion de texto conversacional en ingles, con historial de fine-tuning orientado a contenido sin filtros de rechazo.
- Entrada multimodal: el pipeline image-text-to-text implica capacidad de procesar imagenes junto a texto, aunque no se detallan tareas concretas (captioning, VQA, OCR) ni su calidad.
- Modo conversacional: los tags incluyen "conversational", por lo que esta preparado para dialogos multi-turno.
- Capacidad de razonamiento experta: herencia de la familia base Qwen, aunque sin benchmarks publicados no puede cuantificarse.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el campo de idiomas del repositorio.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidad especial declarada: generacion de contenido relacionado con actividad criminal, abuso y conducta de alto riesgo, usada como objeto de estudio en seguridad de IA (no como funcionalidad recomendada).

## Casos de uso

- Investigacion en seguridad de IA y red teaming: el modelo se emplea como sujeto de prueba para medir la eficacia de tecnicas de abliteracion y evaluar si los guardarrailes de la familia base siguen siendo evadibles tras el ajuste.
- Evaluacion de alineacion y taxonomias de dano: permite construir conjuntos de prompts adversarios y clasificar las respuestas segun categorias de riesgo, alimentando marcos de evaluacion internos.
- Analisis de amenazas y threat intelligence: analistas de seguridad pueden estudiar que tipo de contenido operativo genera el modelo para anticipar vectores de abuso en entornos reales.
- Investigacion forense y criminalistica digital: ayuda a comprender como se redactan artefactos generados por IA en contextos delictivos, con fines de atribucion y peritaje.
- Formacion de equipos de trust and safety: uso en simulaciones controladas para entrenar a moderadores en la deteccion de contenido generado con intencion maliciosa.
- Estudios academicos sobre regulacion y politica tecnologica: analisis de como los modelos abliterados interactuan con marcos legales y con las condiciones de acceso restringido impuestas por el propio autor.
- Desarrollo de clasificadores y filtros defensivos: las salidas del modelo pueden usarse como datos negativos para entrenar detectores de contenido danino.

Nota: todos estos casos presuponen acceso autorizado bajo los terminos de la model card y revision institucional o legal cuando corresponda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MATH, MMMU ni evaluaciones de seguridad cuantificadas, y la busqueda web asociada no devolvio resultados relevantes sobre el modelo (los unicos resultados recuperados eran contenido no relacionado sobre suplementos nutricionales). Tampoco se documentan evaluaciones comparativas frente al modelo base.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parametros (27,78B) y no provienen de la documentacion del autor:

- Pesos en BF16/FP16: aproximadamente 55,6 GB, coherente con el tamano del repositorio. Requiere GPU de 80 GB (H100 80 GB, A100 80 GB) o reparto en varias GPU.
- Pesos en INT8: aproximadamente 28 GB. Requiere A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o dos GPU de 24 GB.
- Pesos en INT4: aproximadamente 16-17 GB. Cabe en RTX 4090 24 GB, RTX 3090 24 GB o RTX 4080 16 GB solo con contexto muy corto. Hay que sumar el coste del encoder visual y de la cache KV, que reducen el margen disponible.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; A100 40 GB o L40S para INT8; RTX 4090/3090 para INT4.
- Compatibilidad con GPU de consumo: viable en teoria en INT4 sobre GPU de 24 GB, pero no hay cuantizaciones publicadas en el repositorio, por lo que habria que generarlas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente) y, previsiblemente, vLLM. No hay pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin convertir el modelo. Unsloth aparece como tag de entrenamiento, no de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de mediciones de alternativas en la informacion proporcionada, por lo que la comparacion se limita a aspectos verificables de publicacion:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| darkc0de/RICO-v2 | 27,78B | no disponible | apache-2.0 + acuerdo de acceso restringido del autor | Publico en HuggingFace, 168 descargas | No publicados |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | no disponible | no disponible | no disponible | Publico en HuggingFace | No publicados |
| Otras alternativas abliteradas de la misma categoria (~27B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental y explicitamente etiquetado como "not-for-all-audiences", "toxic", "harmful" y "uncensored". No debe desplegarse en entornos de produccion orientados al publico general.
- Riesgo elevado de generar contenido danino, ofensivo, ilegal o peligroso. La propia model card advierte de que las salidas pueden ser inexactas, incompletas, enganosas o legalmente incorrectas.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad ni de tasa de error publicadas.
- Conflicto entre licencia y condiciones de uso: los metadatos indican apache-2.0, mientras que la model card establece un acuerdo de acceso restringido con certificacion de elegibilidad (profesionales legales, investigadores de seguridad, autoridades, personal de ciberseguridad, etc.) y prohibe el uso para facilitar actividad delictiva real. Cualquier uso comercial o redistribucion debe resolverse legalmente antes de proceder.
- Idiomas: soporte declarado unicamente en ingles, sin cobertura documentada de castellano ni de otras lenguas.
- Sin especificaciones de contexto publicadas: imposible planificar despliegues que dependan de ventanas largas sin medirlo experimentalmente.
- Ausencia de cuantizaciones oficiales: el despliegue en hardware de consumo exige convertir pesos a GGUF o formatos de 4 bits y validar la perdida de calidad resultante.
- Trazabilidad limitada del entrenamiento: no se documentan hiperparametros, volumen de tokens, composicion del dataset ni metodos de alineacion, lo que dificulta reproducir o auditar el comportamiento observado.
- Sesgos: no evaluados. Al derivar de un modelo abliterado, es esperable una reduccion de los mecanismos de rechazo, con el consiguiente aumento de respuestas sesgadas o inapropiadas.
- Responsabilidad legal: el usuario asume en exclusiva el cumplimiento normativo de su posesion, evaluacion, despliegue y redistribucion del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkc0de/RICO-v2
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset de ajuste: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Trend Micro Research, "Malicious Uses and Abuses of Artificial Intelligence": https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, "The Rise of AI-Enabled Crime": https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, "AI-Enabled Crime": https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress, 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- Imagen de portada del modelo: https://cdn-uploads.huggingface.co/production/uploads/6540a02d1389943fef4d2640/6eM6d0oMefCIL7vqFWXbp.png
- Repositorio o paper adicional: no disponible
- Demo o espacio de HuggingFace: no disponible
