# BlessJ/g4-31b-decider

## Resumen

BlessJ/g4-31b-decider es un modelo de clasificación de texto derivado por ajuste fino (fine-tuning) del modelo MachinePulseAI/karpo-decision-31B, que a su vez se apoya en la familia Gemma 4 según indica la etiqueta `gemma4` del repositorio. El autor, BlessJ, lo publica bajo licencia Apache 2.0 y con acceso restringido (gated), de modo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. El modelo está orientado a tareas de decisión y clasificación de texto, no a generación abierta, y cuenta con 31.273.088.876 parámetros en formato safetensors.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 31B destinado a clasificación, un tamaño poco habitual en esa tarea, lo que sugiere que el autor busca aprovechar la capacidad de razonamiento de un modelo grande para decisiones complejas; por otro, advierte de que la información pública es mínima (cero descargas, cero likes, sin model card sustantiva, sin idiomas declarados y sin benchmarks), por lo que cualquier evaluación debe hacerse por cuenta del usuario.

No se dispone de datos sobre arquitectura interna más allá de la etiqueta `gemma4`, ni sobre longitud de contexto, composición del dataset de ajuste o proceso de entrenamiento. Todo lo que sigue distingue explícitamente entre lo confirmado por los metadatos y lo no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según etiqueta `gemma4`); detalles internos no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Acceso | Restringido (gated) |
| Tamano del repo | 62,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint MachinePulseAI/karpo-decision-31B, que la etiqueta `gemma4` vincula con la arquitectura Gemma 4 de Google. No se ha publicado información sobre el número de capas, dimensión oculta, mecanismo de atención, tipo de tokenizador ni si emplea técnicas como atención lineal o decodificación especulativa. Tampoco se detalla si el ajuste fue supervisado (SFT), con preferencias (DPO/RLHF) o mediante otro procedimiento, ni cuántos tokens o ejemplos componen el dataset de ajuste.

El tamaño del repositorio (62,6 GB) es coherente con pesos en precisión bf16/fp16 para 31,27B de parámetros, lo que descarta variantes cuantizadas publicadas. La tarea declarada es clasificación de texto, por lo que se espera una cabeza de clasificación sobre el modelo base, aunque no se especifica el número de clases ni el esquema de etiquetas. No hay información sobre el proceso de alineación, filtrado de datos ni evaluación previa a la publicación.

## Capacidades

- Clasificación de texto: es la tarea principal declarada en el pipeline del repositorio.
- Toma de decisiones: el nombre del modelo (`decider`) y las etiquetas `decisions` sugieren uso para seleccionar entre opciones o categorías, aunque no se documenta el formato de entrada/salida.
- Herencia del modelo base: al derivar de un modelo de 31B de la familia Gemma 4, es probable que conserve capacidad de comprensión de lenguaje natural, pero no se confirma que mantenga generación abierta tras el ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el modelo puede etiquetar textos largos o complejos aprovechando la capacidad de un modelo de 31B, siempre que se valide empíricamente su precisión en el dominio concreto.
- Enrutamiento de tickets de soporte: usar la salida de clasificación para asignar incidencias a equipos o colas, con la ventaja de que un modelo grande puede captar matices que un clasificador pequeño pierde.
- Moderación de contenido con categorías finas: clasificar textos según políticas internas, aunque requiere calibrar umbrales y revisar falsos positivos antes de producción.
- Decisión entre alternativas en flujos automatizados: por ejemplo, aceptar o rechazar una solicitud según criterios textuales, integrándolo como paso de clasificación en un backend.
- Análisis de sentimiento o intención en encuestas abiertas: clasificar respuestas de texto libre en categorías predefinidas para su explotación analítica.
- Filtrado previo en pipelines de datos para entrenamiento: separar muestras relevantes de ruido antes de otras etapas de procesamiento.
- Evaluación comparativa en investigación: servir como baseline de clasificación de gran tamaño frente a modelos más pequeños, midiendo la relación coste/precisión.

En todos los casos es imprescindible validar el modelo en el dominio objetivo, dado que no hay benchmarks ni documentación de etiquetas publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 63 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se recomienda al menos 80 GB.
- Cuantización: no hay GGUF ni cuantizaciones publicadas en el repositorio; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con paralelismo de tensor, sujeto a soporte del framework).
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) ni en GPUs de 16 GB en precisión completa; requeriría cuantización a 4 bits (aproximadamente 16-18 GB) para intentarlo en una sola tarjeta de 24 GB, con pérdida de calidad no evaluada.
- Despliegue: al ser un modelo de clasificación con safetensors, puede servirse con frameworks estándar de Hugging Face (transformers, TGI) o con vLLM si se adapta la cabeza de clasificación; llama.cpp/Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| BlessJ/g4-31b-decider | 31,27B | no disponible | Clasificación de texto | Apache 2.0 | Gated |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | Decisiones/clasificación | no disponible | no disponible |
| Clasificadores BERT/RoBERTa (p. ej., 110M-340M) | 0,1-0,34B | 512 tokens típicamente | Clasificación de texto | MIT/Apache en muchos casos | Abierto |
| Modelos de la familia Gemma 4 (generación) | no disponible | no disponible | Generación | Gemma Terms | Abierto/gated según variante |

La comparativa con clasificadores pequeños es la más relevante en coste: un BERT de 110M puede ejecutarse en CPU y entrenarse con datasets modestos, mientras que este modelo exige infraestructura de 80 GB. No hay datos de rendimiento que permitan justificar el salto de tamaño.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripción de clases, formato de entrada, datos de entrenamiento ni evaluación.
- Sin benchmarks publicados: imposible estimar precisión, recall o calibración sin evaluar por cuenta propia.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir el despliegue automatizado.
- Idiomas no declarados: no se puede asumir soporte multilingüe.
- Riesgo de alucinación y sesgos: heredados del modelo base y del dataset de ajuste, ambos no documentados; en clasificación se traducen en etiquetas erróneas con confianza alta.
- Licencia Apache 2.0 declarada, pero al derivar de un modelo Gemma conviene verificar que los términos del modelo base (Gemma Terms of Use) sean compatibles con el uso comercial previsto.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- Requisitos de hardware elevados (≈63 GB en bf16) para una tarea que a menudo resuelven modelos cientos de veces más pequeños.
- Sin cuantizaciones publicadas: el despliegue eficiente exige trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlessJ/g4-31b-decider
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
