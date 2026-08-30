# AndreaGemignani/ANDRY-V3B-SkinScanner

## Resumen
ANDRY-V3B-SkinScanner es un modelo de clasificación de imágenes médicas especializado en la detección de lesiones cutáneas, desarrollado por Andrea Gemignani. Se basa en el modelo google/medsiglip-448, un checkpoint de visión-lenguaje de Google, y ha sido ajustado específicamente para tareas de dermatología y clasificación de lesiones cutáneas. El modelo está pensado para entornos de investigación y su acceso está restringido, lo que sugiere un uso controlado y una validación previa por parte del autor.

Su relevancia radica en el enfoque de seguridad en la selección de arquitectura: el proyecto trata un falso negativo de melanoma como sustancialmente más costoso que un falso positivo o una abstención. Esta priorización se refleja en la elección de métricas de evaluación, centradas en el AUC de la clase peligrosa y en el AUC melanoma-vs-riesgo-bajo, en lugar de la precisión global. El modelo se presenta como una herramienta para investigación en diagnóstico asistido por IA, aunque su tamaño de repo (0.4 GB) sugiere una arquitectura ligera, adecuada para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en google/medsiglip-448 (vision-language) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento
El modelo es un fine-tune de google/medsiglip-448, un checkpoint de la familia SigLIP que combina un codificador de vision con un mecanismo de alineacion vision-lenguaje. Aunque los detalles concretos de la arquitectura ajustada no se han publicado, se sabe que el proceso de seleccion de arquitectura se guio por un criterio de seguridad lexicografico: se priorizo el rendimiento en la clase mas peligrosa (melanoma) y en la comparacion melanoma-vs-lesiones-de-menor-riesgo, por encima de la exactitud media. Esto implica que el entrenamiento probablemente uso tecnicas de aprendizaje supervisado sobre un dataset de imagenes dermatologicas etiquetadas, con una funcion de perdida o un proceso de seleccion de modelo que penaliza fuertemente los falsos negativos de melanoma. No hay informacion publica sobre el volumen de datos, el numero de epocas o el uso de tecnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades
- Clasificacion de imagenes de lesiones cutaneas, con especial atencion a la deteccion de melanoma.
- Capacidad de abstencion (posiblemente implementada mediante un umbral de confianza) para evitar decisiones erroneas en casos dudosos.
- Modelo de vision puro, sin capacidades de generacion de texto, tool calling, agentes o razonamiento multimodal mas alla de la clasificacion.
- Al estar basado en MedSigLIP, hereda la capacidad de procesar imagenes de 448x448 pixeles, aunque no se especifican las clases exactas que reconoce (probablemente incluye nevus, carcinoma, queratosis, etc., pero no confirmado).
- No soporta entrada de lenguaje natural ni instrucciones; es un clasificador de una sola imagen.

## Casos de uso
- Screening dermatologico asistido: el modelo puede analizar fotografias de lesiones cutaneas y proporcionar una clasificacion de riesgo, ayudando a los medicos a priorizar casos sospechosos de melanoma en consultas de atencion primaria.
- Triaje en telemedicina: integrado en plataformas de teleconsulta dermatologica, puede pre-clasificar imagenes enviadas por pacientes y derivar automaticamente las de alto riesgo a un especialista.
- Herramienta de segunda opinion para dermatologos: dado su enfoque en minimizar falsos negativos, puede servir como verificacion adicional en decisiones clinicas, especialmente en entornos con alta carga de trabajo.
- Investigacion epidemiologica: analisis de grandes conjuntos de imagenes de lesiones para estudiar la prevalencia de distintos tipos de lesiones en poblaciones especificas, con un sesgo hacia la deteccion temprana de melanoma.
- Educacion medica: utilizado en simuladores o plataformas de formacion para mostrar a estudiantes de medicina ejemplos de clasificacion de lesiones, enfatizando los casos de melanoma de dificil diagnostico.
- Desarrollo de pipelines de IA medica: como componente dentro de un sistema mayor que combine deteccion, segmentacion y clasificacion, aprovechando su tamaño reducido (0.4 GB) para despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas dermatologicas especificas (como AUC, sensibilidad, especificidad) en la pagina de HuggingFace ni en el repositorio de GitHub. La unica referencia es la mencion a un criterio de seleccion basado en AUC de la clase peligrosa, pero sin valores concretos.

## Requisitos de hardware
- Tamano del repositorio: 0.4 GB, lo que indica que el modelo es relativamente ligero y probablemente cabe en GPUs consumer con al menos 4 GB de VRAM.
- GPU recomendadas: no se especifican, pero por el tamano, una RTX 3060 (12 GB) o superior seria suficiente para inferencia. Una RTX 4090 o A100 permitiria procesamiento por lotes o entrenamiento adicional.
- Al ser un clasificador de imagenes, no requiere grandes cantidades de memoria de contexto ni generacion autoregresiva, por lo que la latencia por imagen deberia ser baja (del orden de milisegundos en GPUs modernas).
- Opciones de despliegue: al usar la libreria transformers, puede servirse con pipelines de HuggingFace Inference Endpoints, o mediante frameworks como TorchServe o TensorFlow Serving. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son para modelos generativos de lenguaje.
- No se dispone de datos de throughput o latencia medidos.

## Comparativa con modelos similares
No se dispone de informacion suficiente para comparar con otros modelos de clasificacion de lesiones cutaneas como ResNet50 fine-tuneado en HAM10000, o modelos especificos como DermCNN. El acceso restringido y la falta de benchmarks publicos impiden establecer una comparacion objetiva. Se puede indicar que, por su base MedSigLIP, podria tener ventajas en representaciones visuales robustas, pero no hay datos que lo confirmen.

## Limitaciones y advertencias
- Acceso restringido: es necesario solicitar permiso al autor en HuggingFace, lo que limita su uso inmediato y la reproducibilidad.
- Licencia no disponible: no se especifican los terminos de uso comercial o de redistribucion, lo que impide su integracion en productos sin asesoria legal.
- Sesgo potencial: no se detalla la composicion del dataset de entrenamiento, por lo que podria tener sesgos hacia ciertos tipos de piel, edades o condiciones de iluminacion, afectando su generalizacion.
- Riesgo de falsos negativos: aunque el diseno prioriza su reduccion, ningun modelo es perfecto; en entornos clinicos debe usarse como apoyo, no como sustituto del juicio medico.
- Sin documentacion tecnica completa: no se publican detalles de arquitectura, hiperparametros ni metricas de rendimiento, lo que dificulta la evaluacion independiente.
- Limitacion a clasificacion de imagenes: no genera explicaciones textuales ni informes, por lo que su salida requiere interpretacion por personal cualificado.

## Enlaces
- HuggingFace: https://huggingface.co/AndreaGemignani/ANDRY-V3B-SkinScanner
- Repositorio GitHub: https://github.com/AndreaGemignani/ANDRY-SkinScanner/tree/main/
- Modelo base: https://huggingface.co/google/medsiglip-448 (no confirmado, inferido del tag)
