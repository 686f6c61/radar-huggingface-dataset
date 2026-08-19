# Justbackup/Llama-3.3-8B-Instruct-128K_Abliterated

## Resumen

Llama-3.3-8B-Instruct-128K_Abliterated es una variante del modelo Llama 3.3 8B Instruct de Meta, con la ventana de contexto extendida a 128 000 tokens, a la que se le han eliminado quirúrgicamente los mecanismos de rechazo (refusals) mediante una técnica de ortogonalización. El modelo original, desarrollado por SicariusSicariiStuff, busca preservar las capacidades cognitivas y de conocimiento del modelo base mientras reduce drásticamente la tendencia a negarse a responder ciertas peticiones. Esta versión concreta está alojada en el repositorio de Justbackup, que parece una re-subida del trabajo de SicariusSicariiStuff.

El modelo resuelve el problema de la censura excesiva en modelos instructivos, manteniendo una divergencia KL menor de 0.005 respecto al original, lo que indica que su "modelo del mundo" es prácticamente idéntico. Es relevante para investigadores y desarrolladores que necesitan un modelo con contexto largo y respuestas sin filtros para tareas de generación de texto, análisis de documentos extensos o experimentación en entornos controlados. La arquitectura es un transformer decoder-only de 8 000 millones de parámetros, con precisión bf16 y licencia Llama 3 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no disponible (precisión nativa bf16) |
| Idiomas soportados | ingles |
| Licencia | Llama 3 Community License (llama3.3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.3 8B Instruct, un transformer decoder-only con normalización RMSNorm y atención por ventanas deslizantes, adaptado para soportar un contexto de 128K tokens mediante extensiones de posición (probablemente RoPE con interpolación). La técnica de abliteración aplicada consiste en identificar los vectores de dirección de rechazo en el espacio de activaciones del modelo original y ortogonalizar los pesos para inhibir la activación a lo largo de esas direcciones. Este proceso, descrito en la model card, preserva la mayoría de los comportamientos y conocimientos del modelo base, como lo demuestra la divergencia KL inferior a 0.005.

No se dispone de información detallada sobre el proceso de entrenamiento adicional (número de tokens, composición del dataset, uso de RLHF o DPO). El modelo se presenta como una modificación post-entrenamiento del checkpoint shb777/Llama-3.3-8B-Instruct-128K, que a su vez es una extensión de contexto del Llama 3.3 8B Instruct original. La precisión de los pesos es bf16, y no se mencionan cuantizaciones adicionales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Llama 3.3 8B Instruct, incluyendo comprensión lectora, resumen, traduccion y generacion creativa.
- Contexto largo: soporta hasta 128 000 tokens, lo que permite procesar documentos extensos, codigo fuente completo o conversaciones prolongadas en una sola pasada.
- Menor tasa de rechazos: la abliteracion reduce la frecuencia de respuestas de rechazo a aproximadamente un 5%, frente al comportamiento mas restrictivo del modelo original.
- Multilingue: solo se declara soporte para ingles (tag "en"), aunque el modelo base de Llama 3.3 tiene capacidades multilingues limitadas; no se garantiza un rendimiento adecuado en otros idiomas.
- Sin capacidades especiales declaradas: no se menciona soporte de tool calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Analisis de documentos legales extensos: gracias a la ventana de 128K tokens, el modelo puede procesar contratos, sentencias o expedientes completos de una sola vez, extrayendo clausulas relevantes o resumiendo puntos clave sin necesidad de dividir el texto.
- Generacion de codigo en repositorios grandes: al poder abarcar multiples archivos fuente en un unico contexto, es util para tareas de refactorizacion, generacion de tests o explicacion de arquitecturas de software complejas.
- Asistente conversacional para investigacion academica: en entornos controlados donde se requiere explorar temas sensibles o controversiales (por ejemplo, analisis de discursos de odio o estudios sociologicos), el modelo responde sin rechazos sistematicos, facilitando la obtencion de datos.
- Creacion de contenido narrativo sin restricciones: escritores y guionistas pueden utilizarlo para generar tramas, dialogos o descripciones que aborden temas tabu o violencia explicita, algo que el modelo original podria bloquear.
- Desarrollo de chatbots especializados en dominios tecnicos: al mantener el conocimiento del modelo base, puede actuar como agente de soporte en areas como programacion, matematicas o ingenieria, con respuestas detalladas y sin evasivas.
- Experimentacion en seguridad de IA: investigadores pueden estudiar el comportamiento de modelos sin mecanismos de rechazo para evaluar riesgos de sesgo, alucinacion o generacion de contenido danino, comparandolo con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona dos metricas: divergencia KL (< 0.005) y tasa de rechazos (~5%), pero no incluye resultados en MMLU, HumanEval, GSM8K ni otros conjuntos estandar. Por tanto, no es posible evaluar el rendimiento comparativo del modelo frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 16 GB (tamano del repositorio: 16.1 GB). Para inferencia con cuantizacion, se estima que una version de 8 bits requeriria unos 8 GB de VRAM, y una de 4 bits unos 4-5 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para ejecutar el modelo en bf16 se necesita una GPU con al menos 16-20 GB de VRAM (por ejemplo, NVIDIA A100 40GB, RTX 4090 24GB o RTX A6000). Con cuantizacion a 8 bits, una RTX 3080/3090 de 10-12 GB seria suficiente.
- Compatibilidad con GPU de consumo: si, es posible ejecutarlo en GPUs consumer de gama alta (RTX 3090, 4090) con cuantizacion, o incluso en tarjetas de 8 GB con cuantizacion 4 bits, aunque con menor calidad.
- Opciones de despliegue: al ser un modelo Llama estandar, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks de inferencia. No se proporcionan archivos GGUF ni AWQ en el repositorio, por lo que habria que convertirlos manualmente.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 8B en bf16 en una A100 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metodo | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.3-8B-Instruct-128K_Abliterated | 8B | 128K | Llama 3 Community | Abliteracion (ortogonalizacion) | HuggingFace (Justbackup) |
| Llama-3.3-8B-Instruct-128K (shb777) | 8B | 128K | Llama 3 Community | Extension de contexto | HuggingFace (shb777) |
| NeuralLlama-3-8B-Instruct-abliterated | 8B | 8K (original) | Llama 3 Community | Abliteracion | HuggingFace (mlabonne) |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | Modelo oficial | HuggingFace (meta) |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para el modelo abliterado. La principal diferencia frente al modelo base es la eliminacion de rechazos, mientras que frente a NeuralLlama (tambien abliterado) destaca el contexto extendido a 128K. El modelo de shb777 es el punto de partida sin abliteracion.

## Limitaciones y advertencias

- Sesgos y contenido danino: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, violento, ilegal o eticamente cuestionable. No debe desplegarse en aplicaciones publicas sin supervision humana.
- Riesgo de alucinacion: como todos los LLM, puede inventar hechos, citas o codigo incorrecto, especialmente en temas poco representados en sus datos de entrenamiento.
- Limitaciones de idioma: solo se garantiza un rendimiento adecuado en ingles; en otros idiomas la calidad puede degradarse significativamente.
- Restricciones de licencia: la licencia Llama 3 Community permite uso comercial y modificacion, pero impone restricciones sobre el numero de usuarios mensuales (mas de 700 millones requiere acuerdo adicional) y sobre el uso para mejorar otros modelos grandes. Ademas, el modelo se basa en "pesos filtrados" (leaked weights), lo que puede generar problemas legales o eticos de procedencia.
- Falta de garantias: al ser una modificacion no oficial de Meta, no hay soporte ni garantia de calidad. La tasa de rechazos residual (~5%) indica que no es completamente "sin censura".
- Riesgo de produccion: para entornos de produccion se recomienda validar exhaustivamente las respuestas, implementar filtros de contenido adicionales y monitorizar el uso para evitar abusos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/Llama-3.3-8B-Instruct-128K_Abliterated
- Modelo base (shb777): https://huggingface.co/shb777/Llama-3.3-8B-Instruct-128K
- Modelo original del desarrollador (SicariusSicariiStuff): https://huggingface.co/SicariusSicariiStuff/Llama-3.3-8B-Instruct-128K_Abliterated
- Referencia a otro modelo abliterado (NeuralLlama): https://huggingface.co/mlabonne/NeuralLlama-3-8B-Instruct-abliterated
- Informacion sobre Llama 3.3 8B Instruct 128K (shb777): https://www.aimodels.fyi/models/huggingFace/llama-3.3-8b-instruct-128k-shb777
