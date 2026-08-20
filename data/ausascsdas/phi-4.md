# ausascsdas/phi-4

## Resumen

Phi-4 es un modelo de lenguaje de 14.700 millones de parámetros desarrollado por Microsoft Research, publicado en diciembre de 2024. Se trata de un transformer denso decoder-only, diseñado específicamente para tareas de razonamiento avanzado, matemáticas, código y conversación, con un enfoque en entornos con restricciones de memoria y latencia. El modelo se entrenó sobre 9,8 billones de tokens, combinando datos sintéticos de alta calidad, contenido web filtrado rigurosamente, libros académicos y datasets de preguntas y respuestas, con un proceso de alineación que incluye supervisión fina (SFT) y optimización directa de preferencias (DPO).

Su relevancia actual radica en que ofrece capacidades de razonamiento comparables a modelos mucho más grandes, pero en un tamaño manejable para despliegue en infraestructura moderada. Con una ventana de contexto de 16K tokens y licencia MIT, Phi-4 se posiciona como una opción atractiva para desarrolladores que necesitan un modelo de código abierto con buen rendimiento en tareas de lógica, programación y matemáticas, sin requerir clústeres de GPUs de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 14.659.507.200 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (principal), con 8% de datos multilingues |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-4 es un transformer denso decoder-only con 14.700 millones de parámetros, sin mezcla de expertos. Su arquitectura sigue el diseño estándar de los modelos de lenguaje modernos, con atención por ventanas y capas de normalización, aunque no se han publicado detalles específicos sobre el número de capas o dimensiones ocultas en la información disponible. El entrenamiento se realizó sobre 9,8 billones de tokens, con una composición de datos que incluye documentos públicos filtrados por calidad, datos sintéticos tipo "libro de texto" para enseñar razonamiento, código y conocimiento general, libros académicos adquiridos y datasets de preguntas y respuestas. El proceso de alineación combina supervisión fina (SFT) con optimización directa de preferencias (DPO) iterativa, lo que mejora la adherencia a instrucciones y la seguridad.

El entrenamiento se llevó a cabo en 1920 GPUs H100-80G durante 21 días, entre octubre y noviembre de 2024. El modelo tiene un cutoff de datos de junio de 2024 para información pública. Aunque no se especifican innovaciones técnicas particulares como decodificación especulativa o atención lineal, su diseño está orientado a ofrecer un equilibrio entre capacidad y eficiencia computacional, siendo adecuado para entornos con memoria y latencia limitadas.

## Capacidades

- Generacion de texto y conversacion en formato chat, con buena adherencia a instrucciones.
- Razonamiento logico y matematico avanzado, incluyendo problemas de competicion (MATH, GPQA).
- Generacion de codigo funcional, evaluado con HumanEval.
- Comprension lectora y razonamiento sobre texto complejo (DROP).
- Capacidad multilingue limitada: aunque el modelo esta optimizado para ingles, el 8% de los datos de entrenamiento son multilingues, lo que permite cierto grado de respuesta en otros idiomas, aunque no es su foco.
- No se menciona soporte explicito para tool calling, function calling, agentes o vision en la informacion disponible.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: Phi-4 puede generar fragmentos de codigo, explicar algoritmos y depurar errores. Su entrenamiento en datos de codigo y su capacidad de razonamiento lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD como asistente de revision de codigo.
- Tutor de matematicas y ciencias: gracias a su rendimiento en benchmarks como MATH y GPQA, puede resolver problemas de nivel universitario y explicar paso a paso, siendo util en plataformas educativas o chatbots de apoyo academico.
- Chatbot de atencion al cliente con contexto largo: con 16K tokens de ventana, puede mantener conversaciones multi-turno extensas, recordando detalles de interacciones previas. Su licencia MIT permite su integracion en productos comerciales sin restricciones de uso.
- Analisis y resumen de documentos tecnicos: su capacidad de comprension lectora (DROP) le permite extraer informacion relevante de articulos, informes o documentacion tecnica, generando resumenes o respondiendo preguntas especificas.
- Generacion de documentacion tecnica: puede redactar manuales, guias de usuario o comentarios de codigo a partir de especificaciones, aprovechando su entrenamiento en datos de alta calidad y su estilo de respuesta coherente.
- Prototipado rapido de aplicaciones de lenguaje natural: al ser un modelo de 14B con licencia permisiva, es adecuado para experimentar con generacion de texto, clasificacion o extraccion de informacion en entornos de investigacion o startups, sin necesidad de grandes recursos de computo.

## Benchmarks y rendimiento

La model card menciona que Phi-4 fue evaluado con los siguientes benchmarks: MMLU, MATH, GPQA, DROP, MGSM, HumanEval y SimpleQA, utilizando la herramienta SimpleEval de OpenAI y benchmarks internos. Sin embargo, no se proporcionan valores numericos concretos en la informacion disponible. Por tanto, no es posible presentar una tabla comparativa con cifras verificadas. Se recomienda consultar el informe tecnico (arxiv:2412.08905) para obtener los resultados detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 14,7B parametros y el repositorio pesa 29,3 GB en safetensors (presumiblemente en FP16). Para inferencia en FP16 se necesitan aproximadamente 30 GB de VRAM. Con cuantizacion a 8 bits se reduce a unos 15 GB, y a 4 bits a unos 8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPUs recomendadas: para FP16, una GPU con 40 GB o mas (A100 40GB, A6000, H100) es adecuada. Con cuantizacion a 8 bits, una RTX 4090 (24 GB) o similar puede ser suficiente. Para 4 bits, GPUs de 8-12 GB como RTX 3080 o RTX 4070 podrian funcionar.
- Compatibilidad con consumer GPU: si, con cuantizacion a 4 u 8 bits, el modelo cabe en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4070 Ti.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se generan pesos GGUF) y Ollama (mediante conversiones). No se confirma soporte oficial, pero es estandar en el ecosistema.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU A100, se puede esperar una latencia de decodificacion de unos 20-40 ms por token en FP16, dependiendo de la implementacion y el batch size.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se podria comparar con Phi-3 (tambien de Microsoft) o con modelos de tamano similar como Llama 3 8B o Mistral 7B, pero no se incluyen especificaciones ni resultados en la documentacion disponible. Se recomienda consultar el informe tecnico para comparaciones detalladas.

## Limitaciones y advertencias

- El modelo esta optimizado principalmente para ingles; su rendimiento en otros idiomas es limitado y no ha sido evaluado exhaustivamente.
- No se ha evaluado para todos los usos downstream; los desarrolladores deben validar la precision, seguridad y equidad antes de usarlo en aplicaciones de alto riesgo.
- Puede presentar alucinaciones o respuestas incorrectas, especialmente en temas fuera de su cutoff de datos (junio 2024) o en dominios especializados.
- La ventana de contexto de 16K tokens es moderada; para tareas que requieren contextos muy largos (por ejemplo, libros completos) puede ser insuficiente.
- Aunque la licencia MIT permite uso comercial, el modelo no incluye garantias de seguridad o cumplimiento normativo; el desarrollador es responsable de cumplir las leyes aplicables.
- No se menciona soporte para tool calling, agentes o multimodalidad; para esos casos habria que buscar alternativas especificas.

## Enlaces

- HuggingFace: https://huggingface.co/ausascsdas/phi-4
- Informe tecnico (arXiv): https://arxiv.org/pdf/2412.08905
- Repositorio de evaluacion SimpleEval: https://github.com/openai/simple-evals
