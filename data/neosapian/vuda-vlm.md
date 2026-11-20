# NeoSapian/vuda-vlm

## Resumen

VUDA-VLM es un modelo de visión-lenguaje (image-text-to-text) publicado por NeoSapian en Hugging Face, construido sobre la arquitectura SmolVLM y especializado en detección de anomalías en entornos de videovigilancia. Con 507.482.304 parámetros (aproximadamente 0,5 mil millones), se posiciona como un modelo compacto orientado a tareas de inspección visual automatizada, donde el usuario puede mantener una conversación sobre el contenido de una imagen y preguntar por comportamientos, objetos o situaciones anómalas. El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

La relevancia de este modelo radica en su enfoque vertical: en lugar de competir como un VLM generalista, se presenta como una herramienta especializada para vigilancia y detección de anomalías, con un ajuste fino mediante LoRA ya fusionado en los pesos finales (tag `lora-merged`). Esto lo hace atractivo para despliegues en entornos con recursos limitados, ya que su tamaño permite inferencia en GPUs de consumo. Sin embargo, la información pública disponible es muy escasa: no se han publicado detalles sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks.

El acceso al repositorio está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. La licencia es Apache 2.0, lo que facilita su uso comercial con las obligaciones habituales de atribución. No obstante, la falta de documentación técnica y de métricas de evaluación limita seriamente su adopción en producción sin una validación previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM (transformer multimodal vision-lenguaje) |
| Parametros totales | 507.482.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLM, una familia de modelos vision-lenguaje compactos que combinan un codificador visual con un modelo de lenguaje de pequeño tamaño y un proyector multimodal que alinea ambos espacios. La ficha de Hugging Face indica que se ha aplicado un ajuste fino con LoRA y que los adaptadores se han fusionado en los pesos finales (`lora-merged`), lo que simplifica el despliegue al no requerir cargar adaptadores por separado. El pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza conversacional multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni sobre innovaciones técnicas específicas más allá de la fusión de LoRA. Tampoco se documentan detalles sobre el codificador visual empleado ni sobre la longitud de contexto soportada. La ausencia de una model card detallada impide verificar la calidad y el alcance real del ajuste fino para detección de anomalías.

## Capacidades

- Generación de texto conversacional a partir de imágenes (image-text-to-text).
- Detección y descripción de anomalías en escenas de vigilancia, según la especialización declarada en los tags.
- Respuesta a preguntas sobre el contenido visual de una imagen en formato multi-turno.
- Integración con la librería transformers y con endpoints compatibles (`endpoints_compatible`).
- Ajuste fino fusionado mediante LoRA, lo que permite cargar el modelo como un checkpoint único.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible (solo visión declarada).

## Casos de uso

- Monitorización de cámaras de seguridad en comercios: el modelo puede analizar fotogramas capturados por cámaras y responder a preguntas como si hay personas en zonas restringidas o si se detecta un comportamiento fuera de lo habitual, gracias a su especialización en anomaly-detection.
- Inspección de infraestructuras industriales: a partir de imágenes de cámaras fijas, el operador puede consultar al modelo si se observan derrames, obstrucciones o elementos fuera de su posición esperada, usando el modo conversacional para refinar la consulta.
- Verificación de accesos en aparcamientos o recintos: el modelo puede describir la presencia de vehículos o personas en imágenes concretas y responder a preguntas de seguimiento sobre la escena, lo que encaja con un flujo de vigilancia automatizada.
- Análisis forense de imágenes de vigilancia: dado un fotograma, el analista puede preguntar por objetos, personas o situaciones anómalas y obtener una descripción en lenguaje natural que acelere la revisión manual.
- Prototipado de asistentes visuales para operadores de seguridad: al ser un modelo de 0,5B parámetros, puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas de concepto de asistentes conversacionales que respondan sobre imágenes en tiempo casi real.
- Filtrado previo en pipelines de videovigilancia: el modelo puede actuar como una primera capa de triaje que describa escenas y marque posibles anomalías antes de que un operador humano revise el material, reduciendo el volumen de imágenes a inspeccionar.
- Investigación en detección de anomalías multimodales: sirve como base para experimentos académicos que comparen VLMs compactos especializados frente a modelos generalistas en tareas de vigilancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 2 GB solo para pesos, más overhead de activaciones y codificador visual; en la práctica, se recomienda al menos 4-6 GB de VRAM.
- VRAM estimada en fp16/bf16: alrededor de 1 GB para pesos, con overhead adicional; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM; incluso en GPUs de 4 GB con cuantización a 8 bits o 4 bits (aunque no se documentan formatos de cuantización oficiales).
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Acceso |
|---|---|---|---|---|---|
| NeoSapian/vuda-vlm | 507 M | no disponible | Deteccion de anomalias en vigilancia | Apache 2.0 | Restringido (gated) |
| SmolVLM (base, HuggingFaceTB) | ~256 M - 2,2 B (segun variante) | no disponible en esta ficha | VLM generalista | Apache 2.0 | Abierto |
| Qwen2-VL-2B | ~2 B | 32 K (segun documentacion publica) | VLM generalista | Apache 2.0 | Abierto |
| Florence-2 | ~0,23 B - 0,77 B | no disponible en esta ficha | Vision generalista | MIT | Abierto |

La comparativa se limita a características estructurales, ya que no se han publicado métricas de rendimiento para VUDA-VLM. Frente a SmolVLM base, VUDA-VLM añade un ajuste fino orientado a vigilancia, pero carece de la documentación y el ecosistema del modelo original. Frente a Qwen2-VL-2B, VUDA-VLM es más pequeño y especializado, aunque con muchas menos capacidades documentadas y sin benchmarks públicos.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, sesgos, idiomas ni limitaciones conocidas.
- Riesgo de alucinación inherente a los VLMs de pequeño tamaño, especialmente en escenas complejas o con iluminación deficiente; no hay evaluación publicada que lo cuantifique.
- Especialización estrecha en detección de anomalías y vigilancia: su rendimiento en tareas generales de visión-lenguaje no está validado.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto en castellano u otros idiomas sin pruebas empíricas.
- Contexto no documentado: se desconoce la ventana máxima de tokens, lo que afecta al diseño de conversaciones multi-turno.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede ralentizar la integración en pipelines automatizados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación traslada al integrador toda la responsabilidad de validación.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de casos de uso verificados.
- Posibles implicaciones éticas y legales en videovigilancia: el uso del modelo para monitorizar personas requiere cumplir con normativa de protección de datos (RGPD) y legislación laboral aplicable.

## Enlaces

- Hugging Face: https://huggingface.co/NeoSapian/vuda-vlm
- Repositorio base SmolVLM (referencia arquitectónica): https://huggingface.co/HuggingFaceTB/SmolVLM-Instruct
- Documentación de transformers para image-text-to-text: https://huggingface.co/docs/transformers/tasks/image_text_to_text
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
