# dkingtutcd/gemma-e4b-mutation-driven-order2-5901

## Resumen

`dkingtutcd/gemma-e4b-mutation-driven-order2-5901` es un ajuste fino (finetune) del modelo multimodal Gemma 4 E4B en su variante instruct, publicado por el usuario dkingtutcd en Hugging Face. Se trata de un modelo de tipo image-text-to-text, es decir, acepta entradas combinadas de imagen y texto y genera texto, y está pensado para tareas conversacionales. El modelo base empleado es `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del Gemma 4 E4B instruct de Google preparada por Unsloth para facilitar el entrenamiento.

El autor declara que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, y que el resultado se ha subido en precisión FP16 (16 bits). El repositorio contiene 7.996.156.490 parámetros (aproximadamente 8 mil millones) en formato safetensors, con un tamaño total de 16 GB, coherente con pesos en FP16. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un finetune comunitario, con 0 descargas y 0 likes en el momento de la consulta, sin model card descriptiva más allá de la plantilla de Unsloth y sin datos de benchmarks ni de composición del dataset de entrenamiento. El nombre del repositorio sugiere una experimentación con variantes de entrenamiento ("mutation-driven-order2"), pero no se aporta documentación al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Gemma 4 E4B; detalles de la arquitectura interna no disponibles |
| Parametros totales | 7.996.156.490 (aprox. 8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo se publica en FP16; el base estaba cuantizado en 4 bits (bnb-4bit) para el entrenamiento; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del Gemma 4 E4B instruct, un modelo multimodal de la familia Gemma 4 de Google que procesa entradas de imagen y texto. No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones, mecanismo de atención, encoder visual) más allá de que se trata de un transformer multimodal; la model card no incluye estos datos. El modelo base empleado por el autor fue la variante cuantizada en 4 bits de Unsloth (`unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`), lo que sugiere que el entrenamiento se realizó con técnicas de QLoRA o similar sobre pesos cuantizados, y posteriormente se exportaron los pesos fusionados en FP16.

El autor indica que el entrenamiento se hizo "2x faster with Unsloth and Huggingface's TRL library", pero no se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni hiperparámetros. El nombre del repositorio ("mutation-driven-order2-5901") apunta a un experimento de ajuste con alguna metodología propia del autor, pero no se documenta. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text): puede recibir imágenes junto con texto y generar respuestas.
- Razonamiento y respuesta a instrucciones, asumiendo las capacidades del Gemma 4 E4B instruct original.
- Soporte de tool calling / function calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- Capacidades especiales (modo thinking, audio, visión): visión sí por el pipeline declarado; audio y modo thinking no documentados.

## Casos de uso

- Asistente conversacional multimodal en inglés: el modelo puede gestionar diálogos en los que el usuario adjunta imágenes (por ejemplo, capturas de pantalla o fotografías) y formula preguntas en texto, gracias a su pipeline image-text-to-text.
- Descripción y análisis de imágenes en aplicaciones de accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla, aprovechando la componente visual del modelo base Gemma 4 E4B.
- Extracción de información de documentos escaneados: dado que acepta imagen y texto, puede emplearse para transcribir o resumir contenido de facturas, tickets o formularios en inglés.
- Prototipado de chatbots especializados: al ser un finetune, puede adaptarse a dominios concretos siempre que se haya entrenado con datos de ese dominio; sin documentación del dataset, su idoneidad debe validarse empíricamente.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo de flujo Unsloth + TRL con exportación a FP16, útil para estudiar metodologías de entrenamiento con cuantización 4 bits.
- Evaluación comparativa de finetunes comunitarios: puede emplearse como caso de estudio en pipelines de evaluación de modelos derivados de Gemma 4, comparando su comportamiento con el modelo base instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos (8 B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB o más para contexto largo.
- VRAM estimada en cuantización 4 bits (si se genera una versión GGUF/AWQ): en torno a 5-6 GB para pesos, más overhead; no se publican cuantizaciones de este finetune.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 16 GB para cuantizaciones de 8 bits.
- ¿Cabe en consumer GPU? En FP16 cabe ajustadamente en una RTX 4090 (24 GB) o RTX 3090; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles; no se documentan recetas oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dkingtutcd/gemma-e4b-mutation-driven-order2-5901 | ~8 B | no disponible | imagen-texto | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8 B | no disponible | imagen-texto | apache-2.0 (según repo base) | Hugging Face, mantenido por Unsloth |
| Gemma 4 E4B instruct (original de Google) | ~8 B | no disponible | imagen-texto | Gemma license (no confirmada en esta ficha) | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Modelo derivado de un finetune comunitario sin model card descriptiva: no se documentan dataset, hiperparámetros ni metodología, lo que dificulta evaluar su calidad y reproducibilidad.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas, el riesgo no está cuantificado.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar del modelo base, puede reproducir sesgos presentes en los datos originales de Gemma 4.
- Licencia Apache 2.0 declarada por el autor, pero conviene verificar la compatibilidad con la licencia del modelo base Gemma 4 de Google antes de uso comercial, ya que los términos del modelo original pueden imponer restricciones adicionales.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas.
- 0 descargas y 0 likes: sin validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación previa exhaustiva.
- El nombre del repositorio sugiere un experimento ("mutation-driven-order2"), no un modelo orientado a producción.

## Enlaces

- Hugging Face: https://huggingface.co/dkingtutcd/gemma-e4b-mutation-driven-order2-5901
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no se proporciona enlace directo en la información disponible.
