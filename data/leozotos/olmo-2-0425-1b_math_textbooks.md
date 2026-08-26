# LeoZotos/OLMo-2-0425-1B_math_textbooks

## Resumen

LeoZotos/OLMo-2-0425-1B_math_textbooks es un fine-tuning del modelo OLMo-2-0425-1B de AllenAI, realizado sobre un corpus de libros de texto de matemáticas. El objetivo es especializar el modelo base en tareas de razonamiento matemático y comprensión de contenido educativo, aprovechando la arquitectura abierta de OLMo 2 para investigación y desarrollo local. Con 1.484.916.736 parámetros (aproximadamente 1,5 mil millones), este checkpoint se posiciona como una opción ligera para entornos con recursos limitados, manteniendo la capacidad de procesar secuencias de hasta 2048 tokens según la configuración de entrenamiento.

El modelo fue creado por LeoZotos y publicado en HuggingFace en agosto de 2026, aunque no se especifica la licencia ni los idiomas soportados en la model card. Al estar basado en OLMo-2, hereda las características de la familia OLMo, diseñada por AI2 para promover la ciencia abierta y la reproducibilidad. Este fine-tuning concreto se centra en el dominio matemático, lo que lo hace relevante para aplicaciones educativas, tutoría automática y generación de contenido didáctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2) |
| Parametros totales | 1.484.916.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, segun el modelo base) |
| Licencia | no disponible (el modelo base OLMo-2 usa Apache 2.0, pero este fine-tuning no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de allenai/OLMo-2-0425-1B, un transformer decoder autoregresivo con 1,5 mil millones de parametros, entrenado por AI2 con una receta completamente abierta que incluye datos curados de web, codigo, libros y texto cientifico. El fine-tuning se realizo sobre el corpus LeoZotos/math_textbooks, que contiene libros de texto de matematicas, con una configuracion de entrenamiento detallada en la model card: una sola epoca, tasa de aprendizaje de 3e-5, batch size efectivo de 32 (4 con acumulacion de gradientes de 8), y una ventana de contexto de 2048 tokens. Se usaron hasta 75.000 ejemplos, con longitudes de secuencia entre 50 y 2000 tokens, y un scheduler de tipo coseno con warmup del 3%. No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento es de continuacion de pretraining (CPT) sobre texto plano, sin mascara de perdida en el prompt (mask_prompt_loss=false). No se especifican innovaciones tecnicas adicionales mas alla de las del modelo base.

## Capacidades

- Generacion de texto especializada en contenido matematico: puede producir explicaciones, definiciones, ejemplos y problemas de matematicas basados en el corpus de libros de texto.
- Razonamiento matematico basico: al estar entrenado sobre material educativo, puede resolver problemas aritmeticos, algebraicos y geometricos de nivel escolar, aunque sin garantias de exactitud en problemas complejos.
- Comprension de lenguaje natural en contexto educativo: maneja vocabulario y estructuras tipicas de libros de texto de matematicas.
- No se ha documentado soporte para tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Capacidades multilingues: no disponibles; el modelo base OLMo-2 esta principalmente orientado al ingles, por lo que se asume limitacion a ese idioma.

## Casos de uso

- Tutoria automatica de matematicas: el modelo puede generar explicaciones paso a paso para problemas de algebra o calculo, sirviendo como asistente en plataformas de aprendizaje en linea. Su tamano reducido permite desplegarlo en servidores modestos o incluso en dispositivos locales.
- Generacion de ejercicios y examenes: a partir de un tema dado, puede crear problemas de practica con distintos niveles de dificultad, util para profesores que necesitan material variado sin esfuerzo manual.
- Chatbot educativo integrado en LMS: al tener una ventana de 2048 tokens, puede mantener conversaciones de varias vueltas sobre dudas matematicas, aunque con limitaciones de contexto para dialogos muy largos.
- Preprocesamiento de contenido educativo: puede resumir capitulos de libros de texto, extraer definiciones clave o generar glosarios de terminos matematicos, facilitando la creacion de materiales de estudio.
- Investigacion en aprendizaje de modelos: al ser un checkpoint de fine-tuning sobre un dominio especifico, sirve para estudiar la dinamica de aprendizaje y la especializacion de modelos pequenos en areas concretas, como se indica en las tags del repositorio.
- Prototipado rapido de aplicaciones de IA educativa: su tamano (3 GB en safetensors) permite iterar rapidamente en entornos de desarrollo sin necesidad de GPUs de alta gama, ideal para validar conceptos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (eval_datasets esta vacio) ni comparaciones con otros modelos. Se desconoce su rendimiento en tareas estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,5 mil millones de parametros en precision FP16, se necesitan aproximadamente 3 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits (si estuviera disponible) se reduciria a unos 1,5 GB, y a 4 bits a menos de 1 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU consumer como NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB de VRAM (RTX 4080, A10, etc.).
- Si cabe en consumer GPU: si, cualquier GPU con 4 GB o mas de VRAM puede ejecutar el modelo con cuantizacion ligera, y con 8 GB se puede usar en FP16.
- Opciones de despliegue: al ser un modelo safetensors estandar, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o TGI. Tambien se puede usar directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. En una RTX 4090, un modelo de 1,5B suele generar entre 50 y 100 tokens por segundo con vLLM, pero no hay datos confirmados para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| LeoZotos/OLMo-2-0425-1B_math_textbooks | 1,48B | 2048 | no disponible | Matematicas (fine-tuning) |
| allenai/OLMo-2-0425-1B | 1,48B | 2048 | Apache 2.0 | Generalista |
| Gemma 3 1B (Google) | 1B | 8192 | Gemma Terms | Generalista |
| Llama 3.2 1B (Meta) | 1,23B | 128K | Llama 3.2 Community | Generalista |

Segun la pagina oficial de OLMo 2, el modelo base de 1B supera a Gemma 3 1B y Llama 3.2 1B en benchmarks generales, pero no hay datos comparativos para este fine-tuning especifico. La principal diferencia con los modelos generalistas es su enfoque en contenido matematico, lo que puede mejorar el rendimiento en tareas de ese dominio a costa de perder generalidad.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, pero al derivar de OLMo-2, puede heredar sesgos presentes en los datos de entrenamiento originales (web, libros, etc.).
- Riesgo de alucinacion en problemas matematicos complejos: al ser un modelo pequeno y entrenado solo con una epoca sobre libros de texto, puede generar respuestas incorrectas o inventar pasos de resolucion.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para tareas que requieran mucho razonamiento o documentos largos.
- Idiomas: no se especifica soporte multilingue; probablemente solo funcione bien en ingles, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Licencia no definida: aunque el modelo base es Apache 2.0, este fine-tuning no declara licencia, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor antes de desplegarlo en produccion.
- No hay garantias de rendimiento: al no existir benchmarks publicados, no se puede validar su calidad en tareas matematicas reales.
- El entrenamiento se realizo con un solo epoch y sin evaluacion durante el proceso (eval_datasets vacio), lo que sugiere que el modelo podria no haber convergido de forma optima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeoZotos/OLMo-2-0425-1B_math_textbooks
- Modelo base OLMo-2-0425-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Pagina oficial de OLMo 2: https://allenai.org/olmo2
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Pagina general de OLMo: https://allenai.org/olmo
