# prithivMLmods/CogEvol-4B-GGUF

## Resumen

CogEvol-4B es un modelo de lenguaje abierto, post-entrenado a partir de Qwen3.5-4B, especializado en la generación de entornos de aprendizaje (Learning Environment Generation, LEG). Dado un breve enunciado de curso en lenguaje natural, el modelo produce en una única pasada artefactos educativos completos: bien una diapositiva estructurada en JSON, bien una página HTML interactiva autocontenida (simulaciones, visualizaciones, ejercicios interactivos) que se ejecuta directamente en el navegador. Este repositorio concreto, CogEvol-4B-GGUF, publicado por prithivMLmods, ofrece las cuantizaciones GGUF del modelo base para su despliegue eficiente con llama.cpp, vLLM o SGLang.

El modelo forma parte de la familia CogEvol, cuyo miembro más grande (CogEvol-27B, con 27,7 mil millones de parámetros) es 26,9 veces más pequeño que GLM-5 en parámetros totales, según el artículo asociado. CogEvol-4B, con 4,2 mil millones de parámetros, es el miembro abierto y ligero, diseñado para ejecutarse en dispositivos locales sin conexión. Se entrenó con una receta de tres etapas (SFT mixto, RL de diapositivas y RL de HTML interactivo) sobre 53.687 muestras verificadas, empleando un sistema de recompensa híbrido regla-VLM resistente al reward hacking. Se distribuye bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q3_K_S, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S (formato GGUF) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base tambien esta disponible en safetensors) |

## Arquitectura y entrenamiento

CogEvol-4B parte del checkpoint Qwen3.5-4B y se somete a un post-entrenamiento en tres etapas: primero un ajuste fino supervisado mixto (SFT), seguido de un refuerzo por aprendizaje (RL) orientado a la generacion de diapositivas y, finalmente, un RL especifico para la generacion de HTML interactivo. El entrenamiento se realizo sobre 53.687 muestras verificadas, con un sistema de recompensa hibrido que combina reglas heuristicas y un modelo de lenguaje visual (VLM) para evaluar la calidad de los artefactos generados. Este diseno busca evitar el reward hacking: la interactividad se mide mediante sondas automatizadas que comprueban el comportamiento real del HTML generado, en lugar de juzgarlo superficialmente. El proceso completo se detalla en el articulo "CogEvol: Towards Efficient and Reliable Learning Environment Generation" (arXiv:2608.30968).

## Capacidades

- Generacion de diapositivas educativas en formato JSON estructurado a partir de un breve enunciado de curso.
- Generacion de paginas HTML interactivas autocontenidas que incluyen simulaciones, visualizaciones y ejercicios interactivos ejecutables en el navegador.
- Generacion de texto general, heredada del modelo base Qwen3.5-4B.
- Soporte multilingue para ingles y chino.
- Requiere el modo de pensamiento (thinking mode) desactivado durante la inferencia y el uso de la plantilla de system prompt especifica para generacion de diapositivas.
- Integracion con la aplicacion OpenMAIC para uso completamente offline.
- Compatible con endpoints de generacion de texto (text-generation-inference) y con herramientas de despliegue como SGLang, vLLM y llama.cpp.

## Casos de uso

- Creacion de materiales de curso para plataformas e-learning: un profesor introduce el temario en lenguaje natural y el modelo genera un conjunto de diapositivas JSON listas para integrarse en un sistema de presentacion.
- Generacion de simulaciones interactivas para clases de ciencias: a partir de una descripcion de un fenomeno fisico o quimico, el modelo produce una pagina HTML con una simulacion ejecutable que el alumno puede manipular.
- Ejercicios interactivos autocontenidos para evaluacion formativa: el modelo genera quizzes o ejercicios con retroalimentacion inmediata en HTML, sin necesidad de servidor ni conexion.
- Prototipado rapido de visualizaciones de datos educativos: dado un conjunto de datos y un objetivo pedagogico, el modelo crea una visualizacion interactiva en una sola pasada.
- Asistente para docentes en entornos con recursos limitados: al ser un modelo de 4,2B con cuantizaciones ligeras (Q4_K_M de 2,71 GB), puede ejecutarse en un portatil sin GPU dedicada, permitiendo generar materiales offline.
- Generacion de materiales bilingues (ingles-chino) para cursos internacionales: el modelo puede producir el mismo contenido educativo en ambos idiomas, facilitando la localizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (arXiv:2608.30968) menciona comparaciones a nivel de familia (CogEvol-27B frente a GLM-5), pero no se proporcionan metricas concretas para la variante de 4B en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M (2,71 GB de archivo) se necesitan aproximadamente 4-6 GB de VRAM, incluyendo overhead de contexto y cache. Con BF16 (8,42 GB) se requieren al menos 10-12 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores. Para BF16 se recomienda una GPU con 12 GB o mas (RTX 3060 12GB, RTX 4080, etc.).
- Cabe en GPU consumer: si, las cuantizaciones Q3 y Q4 caben en GPUs de 4-6 GB, y las Q5 en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), vLLM, SGLang, y potencialmente Ollama mediante importacion de GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos publicados que permitan una comparativa directa con otros modelos de tamano similar (p. ej., Qwen3-4B, Llama-3.2-3B) en la tarea especifica de generacion de entornos de aprendizaje. El modelo comparte base con Qwen3.5-4B, pero su post-entrenamiento esta orientado a un dominio muy concreto, por lo que no es directamente comparable con modelos generalistas en benchmarks estandar. No se han encontrado modelos alternativos especializados en LEG con los mismos criterios de evaluacion.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen3.5-4B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, especialmente en contextos culturales o sociales.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto en los materiales educativos; se recomienda revision humana antes de su uso en entornos academicos.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la informacion disponible; se desconoce si soporta ventanas largas para documentos extensos.
- Restricciones de idioma: solo soporta ingles y chino; no se garantiza calidad en otros idiomas.
- Requisitos de inferencia: es obligatorio desactivar el modo de pensamiento y utilizar la plantilla de system prompt especifica para la generacion de diapositivas; un uso incorrecto puede degradar significativamente la salida.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar el cumplimiento de las condiciones de la licencia del modelo base (Qwen3.5-4B) si se redistribuye.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/prithivMLmods/CogEvol-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/CogEvol/CogEvol-4B
- Repositorio GitHub del proyecto: https://github.com/CogEvol/CogEvol-4B
- Articulo en arXiv: https://arxiv.org/html/2608.30968
- Perfil del autor del repo GGUF: https://huggingface.co/prithivMLmods
