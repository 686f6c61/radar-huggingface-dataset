# LibreYOLO/LibrePRX512

## Resumen

LibrePRX512 es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX-512 de Photoroom, publicado bajo el identificador `LibreYOLO/LibrePRX512` dentro del ecosistema LibreYOLO. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son byte a byte idénticos a los del repositorio upstream `Photoroom/prx-512-t2i` (revisión `fff12bc02365e07860f2567caa44f1f249946cd4`), y conserva la disposición de pipeline de diffusers, por lo que `diffusers` puede cargar la carpeta tal cual.

El modelo subyacente es PRX, un transformer de difusión texto-a-imagen de 1.300 millones de parámetros entrenado desde cero por Photoroom, que combina un codificador de texto T5Gemma de 2.000 millones de parámetros con el VAE de FLUX.1 (variante schnell). Su resolución nativa es 512 píxeles y se distribuye como modelo base pensado para fine-tuning, no como un modelo afinado para estética o instrucciones complejas.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de generación de imágenes completamente abierta (Apache-2.0 para los pesos) y de tamaño contenido, apta para ajuste fino y despliegue en hardware modesto; por otro, aclara las condiciones de licencia del codificador de texto empaquetado, que queda sujeto a los Términos de Uso de Gemma y no a Apache-2.0. El tamaño del repositorio es de 15,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image), con codificador de texto T5Gemma y VAE de FLUX.1 |
| Parámetros totales | 1,3B (transformer de difusión); 2B adicionales en el codificador de texto T5Gemma |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos PRX; codificador T5Gemma bajo Gemma Terms of Use; VAE FLUX.1 [schnell] Apache-2.0 |
| Formato de pesos | safetensors (disposición de pipeline diffusers) |
| Resolución nativa | 512 píxeles |
| Tamaño del repositorio | 15,5 GB |
| Pipeline | text-to-image |
| Librería | libreyolo (compatible con diffusers) |

## Arquitectura y entrenamiento

PRX es un transformer de difusión para generación de imágenes condicionada por texto, entrenado desde cero por Photoroom. La canalización completa consta de tres componentes: el transformer de difusión de 1,3B parámetros (el componente generativo), un codificador de texto T5Gemma de 2B parámetros que transforma el prompt en embeddings, y el VAE de FLUX.1 en su variante schnell para codificar y decodificar entre espacio latente y píxeles. La resolución nativa de entrenamiento e inferencia es 512 píxeles.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La model card del espejo indica explícitamente que se trata de un modelo base destinado a fine-tuning, lo que sugiere que no ha pasado por un ajuste estético o de instrucciones orientado a producto. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) a resolución nativa de 512 píxeles.
- Punto de partida para fine-tuning: al ser un modelo base, está pensado para ser ajustado con datasets propios y obtener estilos o dominios específicos.
- Integración con el ecosistema diffusers: la carpeta conserva la disposición de pipeline upstream, por lo que se carga directamente con diffusers.
- Integración con la librería libreyolo mediante la clase `LibreGen` y el identificador `prx-512`, tanto en Python como en CLI.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento, al no ser un modelo de lenguaje.
- No se documentan capacidades de visión de entrada, audio ni edición de imagen.
- Capacidades multilingües: no disponible; el comportamiento del codificador T5Gemma con prompts en distintos idiomas no se detalla en la información proporcionada.

## Casos de uso

- Fine-tuning de estilo propio: al ser un modelo base de 1,3B parámetros con licencia Apache-2.0 en los pesos, un equipo puede ajustarlo con un dataset reducido de su marca o dominio y obtener un generador especializado sin depender de modelos cerrados.
- Generación de imágenes para prototipado rápido: con resolución nativa de 512 píxeles y un transformer de tamaño contenido, sirve para producir borradores visuales en flujos de diseño antes de pasar a modelos de mayor resolución.
- Investigación en difusión: su carácter de modelo entrenado desde cero y su arquitectura documentada (T5Gemma + transformer + VAE de FLUX.1) lo hacen útil como banco de pruebas para experimentos de entrenamiento, ablaciones y comparativas de codificadores de texto.
- Despliegue en hardware modesto: el tamaño del transformer (1,3B) permite plantear inferencia en GPUs de consumo, algo inviable con modelos de difusión de decenas de miles de millones de parámetros.
- Generación de datasets sintéticos: útil para aumentar datasets de entrenamiento de modelos de visión (por ejemplo, detección de objetos, dado el contexto LibreYOLO) con imágenes controladas por prompt a 512 píxeles.
- Integración en pipelines de automatización: la CLI `libreyolo generate prompt=... model=prx-512` permite incorporar generación de imágenes en scripts y flujos por lotes sin escribir código Python.
- Replicación y auditoría de pesos: al incluir hashes SHA-256 por fichero y ser byte-idéntico al upstream, permite verificar la integridad de los pesos en entornos con requisitos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El transformer de difusión tiene 1,3B parámetros y el codificador de texto 2B, lo que sitúa la huella total de pesos en el entorno de los 15,5 GB del repositorio en precisión original.
- VRAM estimada para inferencia en precisión original: no disponible de forma explícita; a partir del tamaño del repositorio, se requiere holgadamente más de 15 GB para cargar todos los componentes sin cuantizar.
- VRAM estimada con cuantización: no disponible; no se documentan tipos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, un transformer de 1,3B es compatible con GPUs de consumo de gama alta, pero el codificador T5Gemma de 2B y el VAE añaden carga adicional.
- Compatibilidad con GPU de consumo: plausible por el tamaño del transformer, aunque no confirmada en la información proporcionada.
- Opciones de despliegue: `diffusers` (carga directa de la carpeta) y la librería `libreyolo` con el extra `libreyolo[gen]`, tanto por API Python (`LibreGen("prx-512")`) como por CLI (`libreyolo generate`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Codificador de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX512 (PRX-512) | 1,3B (transformer) + 2B (T5Gemma) | 512 | T5Gemma 2B | Apache-2.0 (pesos); Gemma Terms (text encoder) | Hugging Face, diffusers, libreyolo |
| FLUX.1 [schnell] | no disponible en la información | no disponible | no disponible | Apache-2.0 (según referencia del VAE) | no disponible en la información |
| Modelos de difusión de mayor escala | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite establecer comparaciones parciales: se conoce que PRX reutiliza el VAE de FLUX.1 [schnell] y que su licencia de pesos es Apache-2.0, pero no se dispone de especificaciones ni resultados de benchmarks de alternativas directas para completar una comparativa rigurosa.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier mejora o corrección debe buscarse en el repositorio upstream `Photoroom/prx-512-t2i`, no en este.
- Modelo base orientado a fine-tuning: no está ajustado para estética de producto ni para seguir instrucciones complejas, por lo que la calidad zero-shot puede ser inferior a la de modelos afinados.
- Resolución nativa limitada a 512 píxeles: no está pensado para generar imágenes de alta resolución sin etapas posteriores de upscaling.
- Licencia mixta: los pesos PRX son Apache-2.0, pero el codificador T5Gemma empaquetado está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones de uso que deben revisarse antes de un despliegue comercial.
- Riesgo de sesgos y alucinación visual: no se documenta en la información proporcionada ningún análisis de sesgos del dataset de entrenamiento ni evaluación de fidelidad prompt-imagen.
- Idiomas soportados no documentados: no hay garantía sobre el rendimiento con prompts en castellano u otros idiomas distintos del inglés.
- Sin benchmarks publicados en la información disponible: no es posible evaluar su rendimiento relativo frente a otros generadores con datos objetivos.
- Sin métricas de latencia ni throughput: la planificación de infraestructura requiere medición propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios aún inexistente para este espejo concreto.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/LibreYOLO/LibrePRX512
- Repositorio upstream: https://huggingface.co/Photoroom/prx-512-t2i
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- Repositorio GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de modelos de LibreYOLO: https://www.libreyolo.com/docs/models
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
