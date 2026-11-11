# malkolm777/zils-lite-decision-v9

## Resumen

zils-lite-decision-v9 es un modelo de extracción de características (feature-extraction) desarrollado por el usuario malkolm777, afinado a partir del modelo base vllm-sr/d3-lite, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B. Con 852.985.920 parámetros, está diseñado específicamente como "cuerpo de decisión" para el pool lite de la subred Zils 127, un entorno orientado a tareas de clasificación y decisión sobre entradas textuales.

El modelo se ha entrenado mediante destilación sobre las particiones de entrenamiento de un conjunto de datasets públicos (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, entre otros) convertidos al formato de decisión Zils. Los objetivos de entrenamiento son suaves: una mezcla ponderada del 70% de la distribución de respuestas de una media de semillas de mini fine-tunes propios y el 30% de la etiqueta gold. El ajuste se realizó con LoRA de rango 16, optimizador AdamW con tasa de aprendizaje 5e-5 y una sola época.

Es relevante ahora porque ejemplifica el patrón de modelos pequeños y especializados para tareas de decisión dentro de subredes descentralizadas, con licencia Apache-2.0 y compatibilidad con endpoints, lo que facilita su despliegue en pipelines de clasificación y enrutamiento. Su tamaño contenido (aproximadamente 853 millones de parámetros, repo de 1,7 GB en safetensors) lo hace apto para inferencia en hardware modesto, aunque su naturaleza de modelo de decisión limita su uso a tareas acotadas de clasificación y selección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B, según model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del cuerpo base vllm-sr/d3-lite, que la model card identifica como perteneciente a la familia Qwen/Qwen3.5-0.8B, por lo que se trata de un transformer de aproximadamente 853 millones de parámetros. El ajuste se realizó mediante LoRA de rango 16 con optimizador AdamW, tasa de aprendizaje 5e-5 y una única época, sobre el cuerpo base congelado y adaptadores entrenados.

El entrenamiento es de destilación sobre las particiones de train de un conjunto amplio de datasets públicos convertidos al formato de decisión Zils: mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, sarcasm headlines, SVAMP, commonsense_qa, tweet_eval, 20newsgroups y glaive function calling. Los objetivos son suaves: 0,7 veces la distribución de respuestas de una media de semillas de mini fine-tunes propios (misma receta que malkolm777/zils-mini-decision-v5) más 0,3 veces la etiqueta gold. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características y representaciones para tareas de decisión y clasificación (pipeline declarado: feature-extraction).
- Clasificación de opción múltiple y decisión sobre distribuciones de respuesta, derivada de datasets como MMLU, ANLI, GLUE y commonsense_qa.
- Razonamiento aritmético básico y resolución de problemas verbales, por entrenamiento sobre GSM8K y SVAMP.
- Clasificación de intenciones y diálogo, por entrenamiento sobre Banking77 y CLINC150.
- Detección de necesidad de llamada a herramientas (function calling), por entrenamiento sobre When2Call y glaive function calling.
- Análisis de sentimiento y sarcasmo, por entrenamiento sobre poem_sentiment, iSarcasm y sarcasm headlines.
- Clasificación temática de documentos, por entrenamiento sobre 20newsgroups y tweet_eval.
- Soporte de tool calling / function calling: sí, según la composición del dataset de entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada explícitamente.
- Capacidades multilingües: no disponibles (no se documenta el conjunto de idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de decisiones en la subred Zils 127: el modelo actúa como cuerpo de decisión del pool lite, seleccionando la respuesta o acción más probable sobre entradas en formato Zils, gracias a su ajuste específico con objetivos suaves de destilación.
- Clasificación de intenciones en asistentes conversacionales: su entrenamiento sobre Banking77 y CLINC150 permite mapear consultas de usuario a intenciones predefinidas en dominios bancarios y de atención al cliente.
- Detección de llamadas a herramientas en pipelines de agentes: al haberse entrenado con When2Call y glaive function calling, puede decidir si una consulta requiere invocar una función externa, integrándose como paso previo en un orquestador de herramientas.
- Moderación y análisis de sentimiento en redes sociales: el entrenamiento sobre tweet_eval, iSarcasm y sarcasm headlines lo hace adecuado para clasificar tono, sarcasmo y sentimiento en textos cortos y ruidosos.
- Filtrado y priorización de documentos: con datos de 20newsgroups y GLUE, puede clasificar temáticamente documentos y resolver tareas de inferencia textual y similitud semántica en pipelines de curación de contenido.
- Evaluación automática de respuestas en entornos educativos o de QA: su exposición a MMLU, BoolQ y commonsense_qa permite puntuar opciones de respuesta y detectar inconsistencias en cuestionarios de conocimiento general.
- Verificación de razonamiento aritmético elemental: gracias a GSM8K y SVAMP, puede clasificar o validar soluciones numéricas en problemas verbales sencillos dentro de flujos de corrección automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 853 millones de parámetros en fp16 requiere aproximadamente 1,7 GB de pesos, y en cuantización de 8 bits alrededor de 0,9 GB, sin contar memoria para activaciones y contexto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs consumer con al menos 4-6 GB de VRAM en fp16, aunque no se documenta soporte ni rendimiento.
- ¿Cabe en consumer GPU?: previsiblemente sí por tamaño (por ejemplo, RTX 3060, RTX 4060 o superiores), aunque no hay validación oficial en la model card.
- Opciones de despliegue: la librería declarada es transformers; el tag endpoints_compatible sugiere compatibilidad con endpoints gestionados. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-decision-v9 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune LoRA de decisión sobre vllm-sr/d3-lite |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | Apache-2.0 | Cuerpo base de la familia Qwen/Qwen3.5-0.8B |
| malkolm777/zils-mini-decision-v5 | no disponible | no disponible | Apache-2.0 | Mini fine-tune con la misma receta, usado como semilla en la destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión y extracción de características: no está diseñado como modelo generativo general y su uso fuera del formato Zils puede degradar gravemente la calidad.
- Objetivos de entrenamiento suaves: al mezclar 70% de distribuciones de semillas propias con 30% de etiqueta gold, el modelo puede heredar sesgos y errores de las mini fine-tunes semilla.
- Riesgo de alucinación y calibración: no se documentan métricas de calibración ni evaluación de fiabilidad de las distribuciones de salida.
- Idiomas soportados no documentados: se desconoce el alcance multilingüe real, lo que desaconseja su uso en producción con idiomas distintos del inglés sin validación previa.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con entradas largas.
- Licencia Apache-2.0: permite uso comercial, pero se debe consultar LICENSE y NOTICE del repositorio para cumplir los requisitos de atribución.
- Sin descargas ni likes en el momento de la ficha y creado en 2026: ecosistema de validación prácticamente inexistente, sin evidencia de uso en producción.
- Dependencia de código personalizado (tag custom_code): puede requerir revisar el código del repositorio para una carga correcta con transformers.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v9
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Mini fine-tune de referencia: https://huggingface.co/malkolm777/zils-mini-decision-v5
- Familia Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
