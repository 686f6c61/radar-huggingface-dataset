# psychefr/blip-vqa-satquery

## Resumen

`psychefr/blip-vqa-satquery` es un modelo de visual question answering (VQA) basado en la arquitectura BLIP (Bootstrapping Language-Image Pre-training) desarrollada por Salesforce. El nombre del repositorio sugiere que está orientado a consultas sobre imágenes de satélite, aunque la model card no proporciona información explícita sobre el proceso de fine-tuning ni el dataset utilizado. El modelo cuenta con 384 millones de parámetros y un tamaño de repositorio de 1,5 GB, lo que lo sitúa en la gama media de modelos multimodales.

El autor es `psychefr`, un usuario de HuggingFace que ha publicado el modelo sin documentación técnica detallada. La model card es una plantilla autogenerada sin información sobre entrenamiento, datos, licencia o rendimiento. A pesar de la falta de documentación, la arquitectura BLIP subyacente está bien caracterizada en la literatura, lo que permite inferir sus capacidades generales. La relevancia de este modelo radica en su potencial aplicación al análisis de imágenes satelitales, un dominio con demanda creciente en agricultura, planificación urbana y monitorización medioambiental, aunque sin datos de evaluación publicados no se puede validar su eficacia en esa tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (Vision Transformer encoder + BERT-based text encoder/decoder, fusion multimodal) |
| Parametros totales | 384.672.572 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BLIP base usa secuencias de 512 tokens para texto) |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | No disponible (BLIP base esta entrenado con datos mayoritariamente en ingles) |
| Licencia | No disponible (model card no especifica; BLIP original usa licencia BSD-3-Clause) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BLIP es un modelo vision-language preentrenado que unifica comprension y generacion mediante tres objetivos: ITC (Image-Text Contrastive), ITM (Image-Text Matching) y LM (Language Modeling). La arquitectura utiliza un Vision Transformer (ViT) para codificar imagenes y un BERT con un modo de decodificacion para generar texto. Para VQA, BLIP añade una cabecera de clasificacion sobre la representacion fusionada de imagen y texto, produciendo una distribucion sobre respuestas candidatas. El modelo base se entrena en datasets como COCO, Visual Genome y Conceptual Captions con unos 129 millones de pares imagen-texto.

En el caso de `blip-vqa-satquery`, se desconoce el dataset especifico de fine-tuning y el regimen de entrenamiento. El nombre sugiere un ajuste para imagenes satelitales, probablemente con datos de tipo query-response sobre el contenido de las imagenes. No hay informacion publica sobre el numero de pasos, la composicion del dataset, o si se aplicaron tecnicas de RLHF o DPO. El checkpoint base es presumiblemente `Salesforce/blip-vqa-base`, que se entrena en VQA v2 con una precision del 78,5% en test-dev.

## Capacidades

- Generacion de respuestas a preguntas sobre imagenes (VQA clasico) con vocabulario cerrado de respuestas.
- Comprension de escenas visuales generales: objetos, relaciones espaciales, acciones y atributos.
- Razonamiento multimodal basico: combina informacion de imagen y texto para responder preguntas de tipo "¿que color es...?", "¿cuantos objetos hay?", "¿que accion esta realizando?".
- Capacidad de captioning de imagenes (si se usa el modo generativo del mismo checkpoint).
- Soporte de tool calling: no disponible (BLIP es un modelo de VQA, no un agente conversacional).
- Capacidades multilingues: no disponibles (BLIP base es principalmente ingles).
- No soporta vision en tiempo real ni video; solo imagenes estaticas de entrada.

## Casos de uso

- Analisis de imagenes satelitales para inventario de infraestructura: el modelo puede responder preguntas como "¿cuántos edificios hay en esta zona?" o "¿hay una carretera que cruza el rio?", facilitando la catalogacion automatica de parcelas urbanas o rurales.
- Monitorizacion de desastres naturales: tras una inundacion o incendio, se pueden consultar imagenes de satelite con preguntas como "¿hay zonas quemadas?" o "¿el rio se ha desbordado?", ayudando a equipos de emergencia a evaluar danos rapidamente.
- Documentacion de proyectos de construccion: consultas sobre el estado de avance de obras visibles en imagenes aereas, por ejemplo "¿hay maquinaria pesada en el solar?", para informes de progreso.
- Analisis de cobertura de suelo: preguntas como "¿que porcentaje de la imagen es vegetacion?" o "¿hay agua estancada en esta parcela?" para estudios de impacto ambiental.
- Educacion y divulgacion: herramienta didactica para que estudiantes de geografia o ciencias ambientales aprendan a interpretar imagenes satelitales mediante preguntas y respuestas.
- Automatizacion de informes de inteligencia geoespacial: integracion en pipelines de procesamiento de imagenes de drones o satelites para generar reportes textuales de forma automatica, reduciendo el trabajo manual de analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion. El modelo base `Salesforce/blip-vqa-base` alcanza un 61,5% de exactitud en el test-dev de VQA v2.0, pero no se puede confirmar que el fine-tuning en satquery mantenga o mejore ese rendimiento. Sin datos de evaluacion especificos, no es posible comparar este modelo con alternativas como BLIP-2, InstructBLIP o LLaVA en tareas de VQA sobre imagenes satelitales.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 384M parametros en fp32 requiere unos 1,5 GB de VRAM, y en fp16 unos 0,8 GB. Con cuantizacion de 8 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para inferencia. Tarjetas como NVIDIA GTX 1650, RTX 2060, o incluso CPUs con 8 GB de RAM pueden ejecutar el modelo con llama.cpp o transformers.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: se puede cargar con la libreria `transformers` de HuggingFace, o exportar a ONNX para inferencia en CPU. No se han publicado ficheros GGUF ni soporte en Ollama o vLLM.
- Latencia estimada: en una GPU moderna, una inferencia de VQA con una imagen de 384x384 tarda entre 50 y 150 ms, dependiendo de la longitud de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento VQA v2.0 (test-dev) | Licencia | Formato |
|---|---|---|---|---|---|
| Salesforce/blip-vqa-base | 384M | 512 tokens | 61,5% | BSD-3-Clause | PyTorch |
| Salesforce/blip-vqa-satquery | 384M | no disponible | no disponible | no disponible | safetensors |
| Salesforce/blip2-opt-2.7b | 2,7B | 512 tokens | 65,2% | MIT | PyTorch |
| LLaVA-1.5-7B | 7B | 4096 tokens | 78,5% | Apache-2.0 | PyTorch |

El modelo `blip-vqa-satquery` es un fine-tuning de BLIP base para un dominio especifico, por lo que su rendimiento general en VQA puede ser menor que el original si el dataset de fine-tuning es limitado. BLIP-2 y LLaVA son modelos mas grandes con mejor rendimiento general, pero tambien con mayores requisitos de hardware. La ventaja de este modelo es su tamano reducido, que permite desplegarlo en entornos con recursos limitados.

## Limitaciones y advertencias

- Sesgos conocidos: BLIP se entrena con datos de internet que pueden contener sesgos de genero, raza y geograficos. El modelo puede perpetuar estos sesgos en sus respuestas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en imagenes ambiguas o de baja resolucion.
- Limitaciones de contexto: la longitud de contexto es de 512 tokens, lo que limita la cantidad de texto que se puede procesar junto con la imagen. En VQA esto no es un problema, pero si se usara para otras tareas, habria que tenerlo en cuenta.
- Restricciones de licencia: no se especifica licencia en la model card. El modelo original BLIP usa BSD-3-Clause, que permite uso comercial con atribucion, pero el fine-tuning puede haber introducido restricciones adicionales. Se recomienda contactar con el autor para aclarar.
- Caveat importante: no hay informacion sobre el proceso de fine-tuning, por lo que no se puede garantizar que el modelo funcione correctamente en imagenes satelitales de diferentes fuentes o resoluciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/psychefr/blip-vqa-satquery
- Modelo base BLIP VQA: https://huggingface.co/Salesforce/blip-vqa-base
- Repositorio GitHub de BLIP: https://github.com/salesforce/BLIP
- Proyecto satquery-ai (relacionado, no oficial): https://github.com/anshika0731/satquery-ai
- Paper BLIP: https://arxiv.org/abs/1910.09700
