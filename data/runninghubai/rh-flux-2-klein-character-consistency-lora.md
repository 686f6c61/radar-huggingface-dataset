# RunningHubAI/rh-flux-2-klein-character-consistency-lora

## Resumen

`rh-flux-2-klein-character-consistency-lora` es un adaptador LoRA de bajo rango para edición y generación de imágenes con el modelo base FLUX.2 Klein Base 9B. Lo publica RunningHub (RunningHubAI) bajo la autoría de un usuario de su plataforma (@清酒) y su propósito concreto es mejorar la consistencia de identidad: que el sujeto generado se parezca al objeto de referencia de la imagen de entrada. Es, por tanto, una pieza de infraestructura para flujos de trabajo de carácter consistente (personajes recurrentes, variaciones de pose, edición guiada por referencia), no un modelo generativo autónomo.

El adaptador se ha entrenado específicamente con pares de imágenes en los que el sujeto cambia de pose y de ángulo facial, de modo que aprenda a transferir identidad entre vistas distintas. El autor advierte que el entrenamiento se hizo únicamente con imágenes de personas y que no ha probado el modelo con otros tipos de personajes (criaturas, personajes antropomórficos, objetos).

Su relevancia práctica es doble: por un lado cubre una de las tareas más demandadas en pipelines de difusión (mantener el mismo personaje a lo largo de una serie de imágenes); por otro, se distribuye como un fichero safetensors de solo 76 MiB que se carga en ComfyUI o en la plataforma RunningHub, con unos ajustes de inferencia ya publicados por el autor (50 pasos, CFG 1, 1 megapíxel, fuerza 1.6). No hay métricas, benchmarks ni información de licencia publicados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.2 Klein Base 9B, modelo de difusión texto-a-imagen; detalles de arquitectura del modelo base no disponibles en la información proporcionada |
| Parámetros totales | No disponible para el adaptador; el modelo base es de 9B (según el nombre `Flux2-Klein-9B`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; no hay ventana de contexto de tokens publicada) |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos LoRA en safetensors (se hereda la cuantización que use el modelo base en el runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que se siga la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`flux2_klein_9b_character_consistency_lora_v1.safetensors`, 76 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de baja秩... de bajo rango que se inyectan en las capas del transformer de difusión FLUX.2 Klein Base 9B para especializarlo en una tarea concreta sin reentrenar el modelo completo. El repositorio solo contiene el adaptador (0,1 GB de tamaño total de repo, fichero de 76 MiB), de modo que la arquitectura efectiva es la del modelo base, sobre el que no se aportan especificaciones técnicas en la información disponible.

El dato diferencial está en el conjunto de entrenamiento descrito por el autor: pares de imágenes del mismo sujeto con cambios de pose y de ángulo facial, lo que fuerza al adaptador a aprender rasgos de identidad invariantes a la vista en lugar de a copiar la composición de la imagen de referencia. El entrenamiento se realizó solo con personas y no se validó con otros tipos de personaje. No se indica el número de tokens, el volumen del dataset, ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en difusión); tampoco se documenta ninguna innovación técnica adicional más allá del propio esquema de pares.

Los hiperparámetros de inferencia publicados por el autor son: 50 pasos de muestreo, CFG 1, resolución de 1 megapíxel y fuerza de LoRA 1.6 para FLUX.2 Klein Base 9B (2.4 para otros modelos FLUX que probó). Señala que más pasos suelen mejorar el resultado y que hay variación apreciable entre semillas.

## Capacidades

- Generación texto-a-imagen condicionada por un adaptador de consistencia de personaje sobre FLUX.2 Klein Base 9B.
- Transferencia de identidad entre imágenes de referencia y nuevas vistas: el sujeto generado se aproxima al objetivo de la imagen de entrada.
- Robustez frente a cambios de pose y de ángulo facial, que es exactamente la variación con la que fue entrenado.
- Edición de imagen guiada por referencia (no solo generación desde cero), según la descripción del autor ("se usa junto a Flux 2 Klein para edición de imágenes").
- Control de la fuerza del adaptador (recomendado 1.6; 2.4 en otros modelos FLUX) para modular cuánto pesa la identidad frente a la creatividad del prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking": es un adaptador de imagen.
- No se documentan capacidades multilingües ni idiomas soportados en los prompts.

## Casos de uso

- Series de ilustración con personaje recurrente: aplicar el LoRA con fuerza 1.6 sobre FLUX.2 Klein Base 9B para generar múltiples escenas del mismo personaje manteniendo rostro y rasgos entre imágenes, que es el caso para el que fue entrenado.
- Edición por referencia en producción gráfica: sustituir o ajustar el sujeto de una imagen existente usando una foto de referencia como condicionante, sin reescribir el prompt de identidad en cada iteración.
- Storyboards y cómics: generar viñetas consecutivas con el mismo protagonista en poses y ángulos de cámara distintos, aprovechando el entrenamiento específico con pares pose/ángulo.
- Avatares y retratos consistentes: producir variantes de un mismo retrato (iluminación, encuadre, expresión) preservando la identidad, con 1 MP y 50 pasos como configuración de partida.
- Previsualización de personajes en desarrollo de videojuegos: iterar conceptos del mismo personaje en poses de acción o de reposo antes de modelado 3D.
- Generación de datasets sintéticos con identidad controlada: crear variaciones de un sujeto para aumentar datos de entrenamiento de otros sistemas (reconocimiento, segmentación), siempre que la licencia lo permita.
- Localización de material gráfico: readaptar ilustraciones de un personaje a nuevos formatos o encuadres manteniendo su apariencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP-score, similitud de identidad tipo FaceNet/ArcFace, preferencia humana) ni comparaciones medidas frente a otros adaptadores de consistencia de personaje.

## Requisitos de hardware

- VRAM del adaptador: despreciable; el fichero LoRA pesa 76 MiB y se carga junto al modelo base.
- VRAM del modelo base: no publicada por el autor. Como estimación aritmética a partir de los 9B de parámetros, en bf16/fp16 el transformer de difusión ocuparía del orden de 18 GB solo en pesos, a lo que hay que sumar el codificador de texto, el VAE y las activaciones; en fp8 o cuantizaciones de 4-8 bits el requisito baja sustancialmente. Esta cifra es una estimación, no un dato del repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, se sitúa en la liga de GPU de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100) en precisión completa, y de GPU consumer de gama alta con cuantización.
- Despliegue: ComfyUI es la vía principal indicada por el autor; también la plataforma RunningHub (API y web, sitios internacional y China) y carga directa de pesos desde Hugging Face.
- vLLM, llama.cpp, Ollama o TGI no aplican: son runtimes de modelos de lenguaje, no de difusión.
- Latencia y throughput: no disponibles. El autor solo indica que aumentar los pasos de muestreo (por encima de 50) suele mejorar la calidad, lo que implica un coste lineal aproximado en tiempo de inferencia.

## Comparativa con modelos similares

No hay datos públicos de benchmarks ni de rendimiento medido para este adaptador, por lo que la comparación solo puede hacerse a nivel de ficha técnica y con numerosos campos no disponibles.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux-2-klein-character-consistency-lora | LoRA de consistencia de personaje sobre FLUX.2 Klein 9B | Adaptador de 76 MiB sobre base de 9B | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub |
| FLUX.2 Klein Base 9B (modelo base) | Modelo de difusión texto-a-imagen | 9B | No aplica | No disponible en esta información | No disponible en esta información |
| Otros LoRA de consistencia de personaje para FLUX | LoRA | No disponible | No aplica | No disponible | No disponible en esta información |

No se dispone de información verificable sobre alternativas equivalentes (por ejemplo, adaptadores IP-Adapter, LoRA de identidad de otros autores o modelos de consistencia propietarios) dentro de la documentación consultada, por lo que no se puede establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes de personas: el autor no ha probado su comportamiento con otros tipos de personaje (criaturas, animales antropomórficos, robots, objetos), por lo que el rendimiento fuera de ese dominio es desconocido.
- Licencia no especificada: la model card remite a la licencia del proyecto original y mantiene los derechos de autor en el autor. El uso comercial no está garantizado y requiere verificar la licencia del modelo base FLUX.2 Klein y las condiciones de RunningHub.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de mejora en similitud de identidad frente a no usar el adaptador.
- Alta sensibilidad a la semilla: el propio autor advierte que hay diferencias apreciables entre semillas, lo que complica la reproducibilidad en producción.
- Dependencia de hiperparámetros: la fuerza recomendada varía entre 1.6 (Klein Base 9B) y 2.4 (otros FLUX); un valor mal ajustado puede degradar la imagen o sobreimponer la identidad.
- Coste de muestreo elevado: 50 pasos como mínimo de partida y "más pasos suelen ir mejor", lo que encarece cada imagen.
- Riesgo de deriva de identidad y de artefactos en poses extremas o ángulos muy alejados de los vistos en entrenamiento; no hay documentación sobre este extremo.
- Sin información sobre sesgos demográficos, de género o de representación en el dataset de entrenamiento, ni sobre el filtrado de las imágenes usadas.
- Sin información sobre idiomas de los prompts; el comportamiento con prompts en castellano no está documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y publicación muy reciente: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux-2-klein-character-consistency-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-flux-2-klein-character-consistency-lora/blob/main/README_cn.md
- Proyecto original del modelo: https://www.runninghub.cn/model/public/2107623597677305857
- Página del autor: https://www.runninghub.cn/user-center/2003723349056446465
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
