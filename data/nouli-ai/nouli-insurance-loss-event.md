# nouli-ai/nouli-insurance-loss-event

## Resumen

Nouli Insurance Loss Event es un modelo de clasificación de texto desarrollado por Nouli AI, un fine-tune de RoBERTa-large especializado en identificar el evento de pérdida reportado en narrativas iniciales de siniestros de seguros de hogar y edificios (first notice of loss, FNOL). El modelo recibe una descripción textual en inglés del siniestro y devuelve una de 22 categorías de evento de pérdida junto con las probabilidades asociadas, además de una cola de admisión (queue) sugerida mediante una regla determinista separada del propio modelo.

Se trata de un modelo encoder de aproximadamente 355 millones de parámetros, con licencia Apache-2.0 y pesos en formato safetensors, entrenado sobre un dataset sintético (gratex/GNOTHEIA-synthetic-insurance-dataset-v2). Su relevancia radica en que ejemplifica un flujo estructurado de triaje de siniestros: clasificación del evento a partir de texto libre y enrutamiento posterior a la cola de gestión adecuada, una tarea típica en la digitalización de la admisión de partes de siniestro.

El modelo está pensado como artefacto de investigación: el autor lo describe explícitamente como un modelo de investigación evaluado sobre datos sintéticos, con soporte únicamente para inglés y sin inferencia alojada en Hugging Face (inference: false), por lo que debe ejecutarse localmente en CPU o CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large, fine-tune para clasificación de texto) |
| Parametros totales | 355.382.294 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de RoBERTa-large; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con aviso upstream MIT aplicable) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/roberta-large, un transformer encoder de tipo BERT con atención bidireccional, y se ha afinado como clasificador de secuencias para la tarea de clasificación de eventos de pérdida en siniestros. La salida es una distribución de probabilidad sobre 22 categorías de evento (daños por agua, incendio, robo, eventos meteorológicos y otras causas de pérdida en propiedad). Sobre la predicción del modelo se aplica una regla determinista escrita a mano que mapea la categoría a una cola de admisión (por ejemplo, water_damage, crime_damage, weather_or_external_damage, fire_or_explosion, glass_electrical_or_breakdown).

El entrenamiento se realizó sobre el dataset sintético gratex/GNOTHEIA-synthetic-insurance-dataset-v2. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de clasificación). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo es un fine-tune estándar de RoBERTa-large con una capa de clasificación.

## Capacidades

- Clasificación de texto en inglés: identifica el evento de pérdida reportado en una narrativa inicial de siniestro de hogar o edificio.
- Salida con 22 categorías de evento: precipitación atmosférica, reflujo de aguas residuales, inundación, agua subterránea, fuga de agua, robo con allanamiento, robo con violencia, hurto, vandalismo, rayo directo, terremoto, caída de árboles o postes, granizo, deslizamiento o caída de rocas, tormenta, peso de nieve o hielo, animales salvajes, incendio, explosión, entre otras.
- Devuelve probabilidades por categoría, lo que permite umbralizar y derivar casos a revisión manual.
- Enrutamiento a cola de admisión mediante regla determinista separada del modelo (no aprendida).
- Ejecución local en CPU o CUDA; el autor indica que la CPU se reverificó para esta release.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (es un encoder de clasificación).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje automático de partes de siniestro (FNOL): el modelo clasifica la narrativa inicial en una de las 22 categorías y la regla asociada asigna la cola de admisión, reduciendo el tiempo de enrutamiento manual en departamentos de siniestros.
- Priorización de expedientes por tipo de evento: al disponer de probabilidades por categoría, los equipos pueden ordenar la cola de revisión según la confianza y derivar los casos de baja confianza a un gestor humano.
- Detección de causas de daño por agua: distingue entre precipitación, inundación, agua subterránea, fuga de tubería y reflujo de aguas residuales, una distinción relevante porque la cobertura puede variar según la causa reportada.
- Clasificación de siniestros de daños meteorológicos: separa granizo, tormenta, rayo directo, terremoto, deslizamiento, peso de nieve y caída de árboles, útil para agregar siniestros por evento catastrófico.
- Enrutamiento de siniestros de criminalidad: diferencia allanamiento, robo con violencia, hurto sin daños y vandalismo, lo que permite dirigir cada caso al equipo o protocolo adecuado.
- Prototipado e investigación en insurtech: al ser un modelo de investigación con licencia Apache-2.0, sirve como base para experimentar con pipelines de clasificación de siniestros y para comparar enfoques encoder frente a modelos generativos.
- Preprocesamiento en sistemas de gestión de siniestros: integrado como paso previo a un motor de reglas o a un sistema de asignación de peritos, aportando una etiqueta estructurada a partir de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 355 millones de parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 1,4 GB; en fp16, alrededor de 0,7 GB (el tamaño del repo es de 0,7 GB). La VRAM adicional depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para inferencia en fp16 con lotes pequeños; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU, como indica el autor.
- Opciones de despliegue: transformers (librería indicada en la model card), text-embeddings-inference (tag presente), y en general cualquier runtime compatible con modelos de clasificación de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nouli-ai/nouli-insurance-loss-event | 355 M | no disponible | Clasificación de eventos de pérdida en siniestros (22 clases) | Apache-2.0 | Hugging Face (inference: false) |
| FacebookAI/roberta-large | 355 M | 512 tokens (estándar de RoBERTa) | Modelo base encoder, sin fine-tune específico | MIT | Hugging Face |
| Modelos de clasificación de texto genéricos (p. ej. fine-tunes de BERT/DistilBERT) | Variable | Variable | Clasificación genérica | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo describe explícitamente como un modelo de investigación evaluado sobre datos sintéticos, no como un sistema listo para producción.
- Datos sintéticos: el entrenamiento se realizó sobre un dataset sintético, por lo que el comportamiento sobre narrativas reales de siniestros puede diferir y no está validado.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en mercados no anglófonos.
- Riesgo de alucinación y errores de clasificación: al ser un clasificador, puede asignar categorías incorrectas, especialmente en narrativas ambiguas o con múltiples causas (por ejemplo, una ventana rota puede deberse a granizo, allanamiento o impacto accidental).
- La cobertura y la liquidación requieren una evaluación separada: el autor advierte que la causa reportada importa y que la cobertura de la póliza y la liquidación no se derivan del modelo.
- Enrutamiento determinista: la cola de admisión se asigna mediante una regla escrita a mano, no aprendida, por lo que su calidad depende de la regla y no del modelo.
- Licencia Apache-2.0 con aviso upstream MIT aplicable: conviene revisar los términos del modelo base (RoBERTa-large, MIT) para uso comercial.
- Sin inferencia alojada: inference: false en Hugging Face, por lo que el despliegue corre por cuenta del usuario.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Sin datos de benchmarks: no hay métricas publicadas que permitan estimar la precisión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nouli-ai/nouli-insurance-loss-event
- Sitio del autor: https://nouli.ai
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Dataset de entrenamiento: https://huggingface.co/datasets/gratex/GNOTHEIA-synthetic-insurance-dataset-v2
- Ejemplos de entrada y salida: https://huggingface.co/nouli-ai/nouli-insurance-loss-event/tree/main/examples (referenciados en la model card como examples/notice.txt, examples/output.json y examples/category-examples.json)
