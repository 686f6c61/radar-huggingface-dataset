# nishantwhat/robustrag-longformer-head

## Resumen

RobustRAG Longformer-1024 es un modelo de clasificación basado en Longformer, publicado por el usuario nishantwhat en HuggingFace, diseñado específicamente para la detección de alucinaciones en sistemas de generación aumentada por recuperación (RAG). El modelo se presenta como un cabezal de clasificación ("head") sobre una arquitectura Longformer con atención de ventana deslizante y una longitud de contexto de 1024 tokens, orientado a determinar si una respuesta generada está respaldada por el contexto recuperado o, por el contrario, contiene información alucinada.

Con 148.660.994 parámetros totales en formato safetensors y un tamaño de repositorio de 0,6 GB, el modelo se posiciona como una alternativa ligera y desplegable en infraestructura modesta para tareas de verificación factual en pipelines RAG. La model card reporta métricas sobre el conjunto de test de RAGTruth: ROC-AUC de 0,8296, PR-AUC de 0,7527 y una accuracy del 79,78%, lo que lo convierte en una pieza relevante para equipos que necesitan filtrar respuestas no fundamentadas antes de mostrarlas al usuario final.

El modelo se distribuye bajo licencia MIT, lo que facilita su integración en productos comerciales, y emplea una tokenización con preservación de respuestas ("answer-preserving tokenization") junto con atención de ventana deslizante. Su relevancia actual radica en la creciente necesidad de mecanismos de control de calidad en sistemas RAG en producción, donde las alucinaciones representan un riesgo operativo y reputacional significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer (transformer con atención de ventana deslizante) con cabezal de clasificación |
| Parametros totales | 148.660.994 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Longformer, un transformer que sustituye la atención completa cuadrática por una combinación de atención de ventana deslizante local y atención global sobre tokens seleccionados, lo que permite procesar secuencias de hasta 1024 tokens con un coste computacional lineal respecto a la longitud. Sobre esta base se añade un cabezal de clasificación ("head") que produce una predicción binaria o probabilística sobre si la respuesta generada está fundamentada en el contexto recuperado.

La model card menciona explícitamente el uso de "answer-preserving tokenization", una estrategia de tokenización que preserva la integridad de la respuesta candidata para que el clasificador pueda evaluarla sin distorsiones, junto con atención de ventana deslizante. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a RAGTruth, ni si se emplearon técnicas de RLHF o DPO; estos datos deben considerarse no disponibles.

## Capacidades

- Detección de alucinaciones en respuestas generadas por sistemas RAG: clasifica si una respuesta está respaldada por el contexto recuperado.
- Clasificación binaria o probabilística de fundamentación factual ("groundedness") de una respuesta respecto a un contexto.
- Procesamiento de secuencias de hasta 1024 tokens, adecuado para pares contexto-respuesta de longitud moderada.
- Tokenización con preservación de respuestas para evitar que la respuesta candidata se trunque o distorsione durante el preprocesado.
- Integración como componente de verificación en pipelines RAG existentes.
- No se ha documentado soporte de tool calling, function calling, capacidades de agente, multilingüismo explícito ni modos de razonamiento extendido ("thinking mode") en la información disponible.

## Casos de uso

- Filtrado de respuestas en producción RAG: el modelo se sitúa como una etapa de verificación posterior a la generación, evaluando cada respuesta contra el contexto recuperado antes de mostrarla al usuario; su accuracy del 79,78% en RAGTruth permite descartar respuestas no fundamentadas en flujos de atención al cliente o asistentes documentales.
- Control de calidad en asistentes documentales: en sistemas que responden sobre bases de conocimiento corporativas, el clasificador puede marcar respuestas sospechosas para revisión humana o para una segunda pasada de generación con contexto ampliado.
- Monitorización de pipelines de generación: al ser un modelo ligero (148,6 M de parámetros, 0,6 GB), puede ejecutarse en paralelo al generador para registrar tasas de alucinación por consulta, modelo o fuente de recuperación, alimentando dashboards de calidad.
- Enrutamiento condicional de respuestas: las respuestas clasificadas como no fundamentadas pueden redirigirse a un modo conservador ("no dispongo de información suficiente") o a una búsqueda adicional, reduciendo el riesgo reputacional en productos de cara al público.
- Evaluación offline de sistemas RAG: el modelo puede emplearse como juez automático en experimentos de ajuste de recuperadores, prompts o generadores, midiendo la tasa de respuestas fundamentadas sobre conjuntos de validación propios.
- Investigación en detección de alucinaciones: su licencia MIT y su tamaño contenido lo hacen adecuado como línea base reproducible en estudios comparativos de métodos de detección, así como para fine-tuning sobre dominios específicos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test de RAGTruth:

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,8296 |
| PR-AUC | 0,7527 |
| Accuracy | 79,78% |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de detección de alucinaciones, ni métricas en otros conjuntos de datos distintos de RAGTruth.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB de pesos, más overhead de activaciones y del tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en FP16/BF16: alrededor de 0,3 GB de pesos, holgadamente desplegable en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. Para despliegues de alto throughput, una T4 o A10 es más que suficiente; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch) con carga directa de safetensors, ONNX Runtime para inferencia optimizada, o servicios de inferencia ligeros como FastAPI + transformers. vLLM y TGI no están orientados a modelos de clasificación de este tipo y no se documentan como opciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de detección de alucinaciones (por ejemplo, clasificadores basados en DeBERTa o RoBERTa entrenados sobre RAGTruth), por lo que la comparativa cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| RobustRAG Longformer-1024 (este) | 148,6 M | 1024 | MIT | safetensors |
| Clasificadores basados en BERT/DeBERTa para RAGTruth | no disponible | típicamente 512 | variable | no disponible |
| Jueces LLM (p. ej. GPT-4 como evaluador) | no disponible | variable | propietaria | API |

La comparación de rendimiento frente a estas alternativas no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Contexto limitado a 1024 tokens: pares contexto-respuesta más largos requerirán truncamiento o segmentación, lo que puede degradar la detección en documentos extensos.
- Idioma no documentado: la model card no especifica los idiomas de entrenamiento; el uso en castellano u otros idiomas distintos del inglés (idioma predominante en RAGTruth) no está validado y puede degradar el rendimiento.
- Riesgo de falsos negativos y falsos positivos: con una accuracy del 79,78% y ROC-AUC de 0,8296, el modelo comete errores en aproximadamente una de cada cinco muestras; no debe usarse como único mecanismo de control en aplicaciones de alto riesgo.
- Sesgos de dominio: entrenado sobre RAGTruth, un conjunto con dominios y estilos específicos; su generalización a dominios muy distintos (legal, médico, técnico) no está documentada.
- Riesgo de alucinación del propio clasificador: al ser un modelo discriminativo, no genera texto, pero sus etiquetas pueden ser incorrectas y arrastrar sesgos del dataset de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni soporte por parte del autor; el modelo tiene 21 descargas y 0 likes, lo que sugiere escasa validación comunitaria.
- Datos de entrenamiento no documentados: la ausencia de detalles sobre composición del dataset, número de tokens y proceso de ajuste dificulta la reproducibilidad y la evaluación de riesgos.
- Fecha de creación en el repositorio (2026-10-25) y ausencia de pipeline declarado en HuggingFace: verificar la integridad del artefacto antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishantwhat/robustrag-longformer-head
- Paper de Longformer (referencia arquitectónica): https://arxiv.org/abs/2004.05150
- Dataset RAGTruth (referencia de evaluación): https://arxiv.org/abs/2301.13808
- Repositorio RAGTruth en GitHub: https://github.com/ParticleMedia/RAGTruth
