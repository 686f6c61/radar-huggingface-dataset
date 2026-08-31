# NostraEmpire/mirror-qwen2.5-math-7b-instruct

## Resumen

El modelo `NostraEmpire/mirror-qwen2.5-math-7b-instruct` es un espejo (mirror) del modelo original `Qwen/Qwen2.5-Math-7B-Instruct`, desarrollado por Alibaba Qwen y publicado bajo licencia Apache 2.0. Este mirror, subido por el usuario NostraEmpire, no introduce modificaciones sobre el modelo base; simplemente replica los pesos y la configuración original para facilitar su descarga y despliegue en entornos donde el acceso al repositorio original pueda estar restringido.

El modelo original es un LLM especializado en razonamiento matemático, diseñado para resolver problemas en inglés y chino mediante dos estrategias: Chain-of-Thought (CoT) y Tool-integrated Reasoning (TIR). Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), pertenece a la familia Qwen2.5 y está optimizado para tareas de cálculo, álgebra, geometría y razonamiento algorítmico. Su relevancia radica en que, según el reporte técnico de Qwen2.5-Math, alcanza una puntuación de 85,3 en el benchmark MATH usando TIR, situándose entre los mejores modelos abiertos de su tamaño para matemáticas.

Este mirror es útil para desarrolladores que necesitan una copia estable y accesible del modelo sin depender de la infraestructura de HuggingFace original, aunque no aporta ninguna mejora técnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original soporta 32.768 tokens, pero no se confirma en este mirror) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16) |
| Idiomas soportados | ingles (el modelo original tambien soporta chino, pero la model card de este mirror declara solo "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la familia Qwen2, con arquitectura estándar de decoder-only. No se trata de un modelo MoE ni híbrido. El entrenamiento original de Qwen2.5-Math-7B-Instruct se realizó en dos fases: primero un preentrenamiento continuo sobre corpus matemáticos en inglés y chino, y posteriormente un ajuste fino con instrucciones (instruction tuning) que incorpora dos modos de razonamiento: CoT (cadena de pensamiento) y TIR (razonamiento integrado con herramientas, que permite al modelo generar y ejecutar código Python para cálculos precisos). El reporte técnico (arXiv:2409.12122) describe un proceso de auto-mejora con datos sintéticos y verificación de soluciones. Este mirror no añade ningún paso de entrenamiento adicional; es una copia exacta de los pesos publicados por Qwen.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de algebra, calculo, geometria, probabilidad y teoria de numeros mediante CoT.
- Tool-integrated Reasoning (TIR): puede generar y ejecutar codigo Python para realizar calculos numericos exactos, manipulacion simbolica y algoritmos complejos.
- Generacion de texto conversacional: aunque esta especializado en matematicas, mantiene la capacidad de mantener dialogos multi-turno en ingles.
- Soporte de chat con plantilla de mensajes: compatible con el formato de chat de Qwen2.5 (system, user, assistant).
- No soporta tool calling general (funciones externas) fuera del contexto de TIR.
- No incluye capacidades de vision, audio ni multimodalidad.
- Multilingue limitado: el modelo original soporta ingles y chino, pero este mirror declara solo ingles en su model card.

## Casos de uso

- Tutoria automatica de matematicas: un asistente educativo puede usar el modelo para explicar paso a paso la resolucion de ecuaciones, derivadas o integrales, generando respuestas razonadas y verificables.
- Verificacion de soluciones matematicas: en plataformas de evaluacion automatica, el modelo puede comprobar si una respuesta dada por un estudiante es correcta, comparandola con su propia resolucion via CoT.
- Generacion de problemas de practica: dado un tema (por ejemplo, sistemas de ecuaciones lineales), el modelo puede crear enunciados variados con distintos niveles de dificultad.
- Integracion en pipelines de calculo cientifico: mediante TIR, el modelo puede escribir y ejecutar codigo Python para resolver problemas numericos que requieren alta precision, como calculo de eigenvalores o raices de polinomios.
- Asistente para investigacion en matematicas: ayuda a explorar conjeturas, simplificar expresiones o sugerir enfoques de demostracion, aunque con limitaciones en razonamiento formal avanzado.
- Chatbot especializado en STEM: en un entorno de soporte tecnico o academico, el modelo puede responder consultas matematicas dentro de un flujo conversacional, manteniendo contexto a lo largo de la conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este mirror. El modelo original Qwen2.5-Math-7B-Instruct reporta en su documentacion una puntuacion de 85,3 en el benchmark MATH usando TIR, pero estos datos no estan incluidos en la ficha de NostraEmpire. Se recomienda consultar el reporte tecnico original para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15 GB (7,6 mil millones de parametros × 2 bytes por parametro, mas overhead de activaciones y cache).
- VRAM estimada con cuantizacion 4-bit: aproximadamente 4-5 GB, aunque no se proporcionan cuantizaciones oficiales en este mirror; se podrian generar con herramientas como llama.cpp o AutoGPTQ.
- GPU recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente; para cuantizacion 4-bit, una RTX 3060 (12 GB) o superior puede funcionar.
- Opciones de despliegue: compatible con transformers (>=4.37.0), vLLM, TGI (Text Generation Inference), llama.cpp y Ollama (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-7B-Instruct (original) | 7,6 B | 32.768 (segun documentacion oficial) | Matematicas (CoT + TIR) | Apache 2.0 | HuggingFace, ModelScope |
| NostraEmpire/mirror-qwen2.5-math-7b-instruct | 7,6 B | no disponible | Matematicas (mismo que el original) | Apache 2.0 | HuggingFace (mirror) |
| Qwen2-Math-7B-Instruct (generacion anterior) | 7,6 B | 32.768 | Matematicas (solo CoT, ingles) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La principal diferencia entre el mirror y el original es la procedencia del repositorio; el rendimiento es identico al ser una copia exacta.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para problemas matematicos en ingles y chino; usarlo para otras tareas (redaccion, codigo general, razonamiento no matematico) produce resultados poco fiables.
- Riesgo de alucinacion en problemas matematicos abiertos o mal planteados: puede generar razonamientos plausibles pero incorrectos, especialmente en calculos con muchos pasos.
- La longitud de contexto no esta confirmada en este mirror; se recomienda asumir 32.768 tokens como en el original, pero no hay garantia.
- No soporta tool calling general ni integracion con APIs externas fuera del modo TIR.
- El mirror no incluye cuantizaciones pregeneradas; el usuario debe convertirlas si necesita reducir el uso de memoria.
- Licencia Apache 2.0 permite uso comercial, pero el aviso del modelo original recomienda no usarlo fuera del ambito matematico.
- Al ser un mirror, no hay garantia de mantenimiento ni actualizaciones por parte de NostraEmpire.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-qwen2.5-math-7b-instruct
- Modelo original (base): https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Modelo original (instruct): https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Reporte tecnico (arXiv): https://arxiv.org/abs/2409.12122
- Blog de Qwen2.5-Math: https://qwenlm.github.io/blog/qwen2.5-math/
- Repositorio GitHub de Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
