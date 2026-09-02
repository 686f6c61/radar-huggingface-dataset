# Mazen619/hope-setfit-finance

## Resumen

El modelo `Mazen619/hope-setfit-finance` es un clasificador de texto basado en la técnica SetFit (Sentence Transformer Fine-tuning), desarrollado por el usuario Mazen619. Está diseñado para enrutar consultas financieras en lenguaje natural hacia uno de cuatro agentes especializados: liquidez, producto, conocimiento y rentabilidad. Utiliza como cuerpo de embeddings el modelo `BAAI/bge-small-en-v1.5`, un Sentence Transformer de 33,36 millones de parámetros, y una cabeza de clasificación basada en regresión logística.

Este modelo resuelve el problema de la clasificación de intenciones en dominios financieros con un enfoque de aprendizaje eficiente con pocas muestras (few-shot), lo que permite obtener buenos resultados con conjuntos de datos reducidos. Su relevancia radica en que facilita la construcción de asistentes conversacionales o sistemas de atención al cliente en banca y finanzas, donde es necesario distinguir entre consultas sobre liquidez, productos, conocimiento general o métricas de rentabilidad. La ventana de contexto máxima es de 512 tokens, suficiente para frases cortas típicas de consultas financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer + LogisticRegression) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (probablemente ingles, dado el modelo base y los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SetFit, que combina un Sentence Transformer (en este caso `BAAI/bge-small-en-v1.5`) con un clasificador de regresión logística. El proceso de entrenamiento consta de dos fases: primero se ajusta el Sentence Transformer mediante aprendizaje contrastivo con pérdida de similitud coseno (CosineSimilarityLoss), y después se entrena la cabeza de clasificación sobre las representaciones generadas. Este enfoque, descrito en el paper "Efficient Few-Shot Learning Without Prompts" (arXiv:2209.11055), permite lograr buenos resultados con pocos ejemplos etiquetados.

El entrenamiento se realizó con 80 muestras por cada una de las 4 clases (320 muestras en total), con un tamaño de lote de 16, 3 épocas, y una tasa de aprendizaje de 2e-5 para el cuerpo y 1e-5 para la cabeza. Se utilizó oversampling como estrategia de muestreo y una distancia coseno con margen de 0,25. No se empleó entrenamiento end-to-end ni precisión mixta. Los datos de entrenamiento consisten en frases cortas (mediana de 8,4 palabras) relacionadas con consultas financieras, como "Show me working capital by division for Q1 2025" o "What is the product code for Insurance Plan Alpha?".

## Capacidades

- Clasificacion de texto en 4 categorias: `liquidity_agent`, `product_agent`, `knowledge_agent` y `profitability_agent`.
- Aprendizaje eficiente con pocas muestras (few-shot), gracias a la tecnica SetFit.
- Inferencia rapida y ligera: al ser un modelo pequeno (33M parametros), puede ejecutarse en CPU o GPU de baja gama.
- Integracion sencilla con la libreria SetFit y el ecosistema Hugging Face (pipelines de text-classification).
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador de intenciones.

## Casos de uso

- Asistentes virtuales bancarios: el modelo puede clasificar la intencion de una consulta del cliente (por ejemplo, "What is the cash conversion cycle for Mutual Fund Series 1?") y dirigirla al agente de liquidez correspondiente, mejorando la precision del enrutamiento en sistemas de atencion al cliente.
- Analisis de consultas financieras internas: en una entidad financiera, puede categorizar las preguntas que llegan a los equipos de tesoreria, productos o rentabilidad, facilitando la asignacion automatica de tickets o la priorizacion de respuestas.
- Filtrado de mensajes en plataformas de asesoria financiera: permite separar consultas generales de conocimiento (por ejemplo, "What is NSFR?") de peticiones operativas sobre productos o metricas, optimizando la derivacion a especialistas.
- Automatizacion de respuestas en chatbots de banca: al identificar la categoria de la consulta, el sistema puede seleccionar una plantilla de respuesta o un flujo conversacional especifico, reduciendo el tiempo de resolucion.
- Clasificacion de documentos o correos financieros: aunque el modelo esta pensado para frases cortas, puede aplicarse a asuntos de correos o titulos de documentos para categorizarlos en los cuatro dominios definidos.
- Evaluacion de calidad de datos en sistemas de NLP financiero: sirve como componente de etiquetado automatico para construir datasets de entrenamiento mas grandes o para validar la coherencia de las categorias en corpus financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de entrenamiento (pérdida de entrenamiento y validacion) pero no resultados de evaluacion sobre conjuntos de test estandar como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 33 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32. Con cuantizacion a 8 bits o 4 bits, el consumo seria aun menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, GTX 1650, RTX 3060). Tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- Compatible con consumer GPU: si, cualquier GPU moderna de consumo (RTX 20xx o superior) puede ejecutarlo sin dificultad.
- Opciones de despliegue: se puede servir mediante la libreria SetFit directamente, o a traves de Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) o un contenedor FastAPI. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de generacion.
- Latencia y throughput: no disponible en la informacion proporcionada, pero dado el tamano del modelo, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para frases cortas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Existen otros modelos SetFit para clasificacion financiera en Hugging Face, como `Askinkaty/setfit-finance-aspect` (clasificacion de aspectos en analisis de sentimiento financiero) y `nickmuchi/setfit-model-financial-classification`, pero no se han publicado especificaciones detalladas ni resultados de benchmarks en la informacion disponible. Ambos comparten la arquitectura SetFit, pero difieren en el modelo base y el numero de clases. No se puede establecer una comparacion rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado con un conjunto de datos muy reducido (320 muestras) y en un dominio financiero concreto, puede presentar sesgos hacia el vocabulario y los ejemplos utilizados en el entrenamiento.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion es bajo. Sin embargo, puede clasificar incorrectamente consultas fuera del dominio o con formulaciones poco habituales.
- Limitaciones de contexto: la ventana maxima de 512 tokens es adecuada para frases cortas, pero no para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base `BAAI/bge-small-en-v1.5` esta optimizado para ingles, por lo que su rendimiento en otros idiomas probablemente sea deficiente.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Cobertura limitada: las 4 clases cubren un espectro concreto de consultas financieras; cualquier consulta fuera de estos dominios puede ser clasificada incorrectamente.
- Datos de entrenamiento no publicados: no se indica la procedencia del dataset de entrenamiento, lo que dificulta evaluar su representatividad y posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mazen619/hope-setfit-finance
- Repositorio SetFit: https://github.com/huggingface/setfit
- Paper "Efficient Few-Shot Learning Without Prompts": https://arxiv.org/abs/2209.11055
- Blog de SetFit: https://huggingface.co/blog/setfit
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
