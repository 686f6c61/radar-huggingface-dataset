# moon7733/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario moon7733. Se presenta como un ajuste fino supervisado (SFT) mediante la librería TRL sobre una base de la familia Qwen3.5, con un total de 2.213.241.664 parámetros reales según los pesos en safetensors. El repositorio ocupa 4,4 GB y se distribuye en formato transformers con pesos safetensors.

La información publicada es muy limitada: la model card es la plantilla automática de Hugging Face y no contiene descripción, datos de entrenamiento, licencia, idiomas ni resultados de evaluación. El sufijo "MED" sugiere un ajuste orientado a dominio médico, pero esto no está confirmado en la documentación disponible. El tag `image-text-to-text` y la arquitectura `qwen3_5` indican que se trata de un modelo multimodal con capacidad de procesar imágenes y texto, aunque no se detalla el codificador visual ni la longitud de contexto.

Por su tamaño (2,2 mil millones de parámetros), es un modelo relativamente ligero que podría ejecutarse en GPUs de consumo, lo que lo hace interesante para prototipado local de tareas multimodales. Sin embargo, la ausencia de licencia, benchmarks y documentación técnica hace que su uso en producción requiera una validación previa exhaustiva por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tag `qwen3_5`), multimodal image-text-to-text; detalles internos no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.5 según el tag de arquitectura, y el pipeline declarado es `image-text-to-text`, lo que implica un transformer multimodal con proyección de embeddings visuales hacia el espacio del modelo de lenguaje. El tamaño de 2,2 mil millones de parámetros es coherente con una variante pequeña de la familia, pero no se especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni el codificador visual empleado.

En cuanto al entrenamiento, el tag `sft` y la dependencia de `trl` indican un ajuste fino supervisado sobre una base preentrenada, presumiblemente Qwen3.5-2B-Base. No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni hiperparámetros. Tampoco se detalla si el ajuste incluyó datos médicos pese al sufijo "MED" del identificador. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta conversacional (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que permite tareas de descripción de imágenes y preguntas sobre contenido visual.
- Ajuste fino supervisado orientado a diálogo, según los tags `sft` y `trl`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en la infraestructura de Hugging Face.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible en la información publicada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Prototipado de asistentes multimodales en local: con 2,2 mil millones de parámetros, el modelo puede cargarse en una GPU de consumo para experimentar con preguntas sobre imágenes sin depender de APIs externas, aunque la falta de benchmarks obliga a validar la calidad antes de cualquier uso real.
- Extracción de información de documentos escaneados: el pipeline image-text-to-text permitiría alimentar imágenes de formularios o informes y obtener respuestas en texto, útil en entornos con documentos no digitalizados, siempre que se verifique la precisión en el dominio concreto.
- Clasificación y descripción de imágenes en pipelines de preprocesado: integrado como paso previo a un sistema mayor, el modelo podría generar descripciones o etiquetas textuales de imágenes para su indexación o filtrado.
- Base para ajuste fino adicional en dominios verticales: al ser un modelo pequeño con licencia no especificada, un equipo podría evaluar su adaptación con LoRA o SFT sobre datos propios, siempre que la licencia lo permita (dato no disponible).
- Experimentación académica en multimodalidad de bajo coste: investigadores que necesiten un modelo pequeño para comparar arquitecturas o estudiar el comportamiento de modelos multimodales pueden usarlo como referencia, aunque la falta de documentación limita la reproducibilidad.
- Despliegue en entornos con recursos limitados: el tamaño de 4,4 GB en safetensors permite cargarlo en GPUs con 8-12 GB de VRAM en precisión reducida, lo que lo hace candidato para estaciones de trabajo modestas o prototipos en edge.
- Evaluación comparativa de ajustes SFT: dado que es un ajuste sobre una base conocida, puede servir para estudiar el efecto del SFT en modelos pequeños, aunque sin datos de entrenamiento publicados la interpretación de resultados es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 4,4 GB, lo que corresponde aproximadamente a 2,2 mil millones de parámetros en bf16/fp16. En fp16 se necesitan en torno a 4,5-5 GB de VRAM solo para pesos; con overhead de activaciones y caché KV, se recomienda al menos 8 GB para contextos cortos.
- Cuantización: no se publican pesos GGUF ni cuantizaciones oficiales; sería necesario convertir el modelo a GGUF o AWQ/GPTQ por cuenta propia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4 o superiores. En GPUs con 8 GB podría caber en fp16 con contextos reducidos, aunque con riesgo de OOM.
- Cabe en GPU de consumo: sí, en modelos con 8-12 GB de VRAM o más, siempre que se gestione el contexto.
- Opciones de despliegue: transformers (librería declarada), y potencialmente vLLM, TGI o llama.cpp tras conversión, aunque no hay confirmación oficial de compatibilidad con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED | 2,21 B | no disponible | no disponible | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen2-VL-2B | ~2 B | 32k (según documentación pública de Qwen2-VL) | Apache 2.0 (según Qwen2-VL) | Sí | Hugging Face, ampliamente usado |
| SmolVLM-2B | ~2 B | no disponible en esta ficha | Apache 2.0 (según SmolVLM) | Sí | Hugging Face |
| PaliGemma-3B | ~3 B | no disponible en esta ficha | Gemma license | Sí | Hugging Face |

Nota: los datos de los modelos comparativos provienen de conocimiento general de sus respectivas familias y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa y deben verificarse en sus model cards oficiales.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; esto es un bloqueo potencial para producción.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas médicas ni multimodales, pese al sufijo "MED".
- Riesgo de alucinación: al no documentarse el ajuste ni los datos, no se puede estimar la fiabilidad factual, especialmente crítico si el modelo se usa en dominio sanitario.
- Idiomas no declarados: se desconoce si el modelo mantiene el multilingüismo de la base Qwen3.5 o si el SFT lo ha restringido.
- Contexto no especificado: no se puede planificar su uso en conversaciones largas o documentos extensos sin medir empíricamente el límite.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, lo que aumenta el riesgo de que el ajuste tenga problemas no detectados.
- Fecha de creación futura (2026-11-11) en los metadatos: conviene verificar la integridad del repositorio y la procedencia de los pesos antes de usarlo.
- Sin cuantizaciones oficiales: el despliegue eficiente requiere trabajo adicional de conversión y validación.

## Enlaces

- Hugging Face: https://huggingface.co/moon7733/Qwen3.5-2B-Base-MED
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Repositorio TRL (librería de ajuste fino): no se enlaza desde la model card, pero es la dependencia declarada en los tags.
