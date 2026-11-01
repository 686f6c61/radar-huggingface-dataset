# s13o/nanoVLM

## Resumen

nanoVLM es un modelo de lenguaje y visión (VLM) minimalista publicado por el usuario s13o en HuggingFace, derivado del modelo base nanoVLM-222M de lusxvr. Su proposito es servir como plataforma de experimentacion e investigacion: toda la arquitectura y la logica de entrenamiento caben en unas 750 lineas de codigo PyTorch puro, lo que lo convierte en un banco de pruebas ideal para estudiar el funcionamiento interno de un VLM sin la complejidad de los modelos de produccion.

El modelo combina un codificador de imagen basado en ViT (SigLIP-B/16-224-85M) con un modelo de lenguaje causal ligero (SmolLM2-135M). La model card del autor declara 222M parametros, aunque el repositorio de safetensors contiene 460.114.016 parametros, probablemente porque incluye tanto el codificador visual como el proyector y el LM en el mismo checkpoint. El repositorio ocupa 1,8 GB.

Es relevante ahora por su caracter didactico y su licencia MIT, que permite reutilizarlo libremente en docencia, prototipado rapido y experimentos de alineacion multimodal en hardware de consumo. No obstante, su tamano reducido y la ausencia de benchmarks publicados lo alejan de usos de produccion exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: ViT SigLIP-B/16-224-85M (vision) + SmolLM2-135M (LM causal) + proyector |
| Parametros totales | 460.114.016 (safetensors); 222M segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el patron clasico de los VLM tipo LLaVA: un codificador visual ViT (SigLIP-B/16-224-85M, con parches de 16x16 y resolucion de entrada 224x224) extrae caracteristicas de la imagen, un proyector las alinea con el espacio del modelo de lenguaje y un transformer causal (SmolLM2-135M) genera la respuesta condicionada en texto e imagen. El conjunto se implementa en PyTorch puro y el codigo completo, incluyendo el bucle de entrenamiento, ocupa aproximadamente 750 lineas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card no detalla hiperparametros ni innovaciones tecnicas adicionales (no se mencionan decodificacion especulativa, atencion lineal ni mecanismos similares). El interes del proyecto reside precisamente en la simplicidad y transparencia del pipeline, no en optimizaciones de rendimiento.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text), segun el pipeline declarado.
- Descripcion de imagenes y respuesta a preguntas visuales basicas, limitada por el tamano del LM subyacente (135M).
- Razonamiento textual y generacion de codigo heredados de SmolLM2-135M, con calidad propia de un modelo pequeno.
- Capacidades multilingues: no documentadas; SmolLM2 esta orientado principalmente al ingles.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, audio, video): no disponibles.

## Casos de uso

- Docencia y formacion en arquitecturas multimodales: al caber en ~750 lineas de PyTorch, permite recorrer el flujo completo (encoder visual, proyector, LM) en una sola sesion practica y modificar componentes sin reescribir el codigo.
- Prototipado rapido de pipelines VLM: sirve para validar el formato de datos, el preprocesado de imagenes y la tokenizacion antes de migrar a un modelo mayor, reduciendo coste computacional en la fase de diseno.
- Experimentos de investigacion sobre alineacion vision-lenguaje: su licencia MIT y su simplicidad facilitan probar variantes del proyector o estrategias de congelado de capas con fines academicos.
- Generacion de descripciones de imagenes en entornos con recursos muy limitados: con 222M-460M parametros puede ejecutarse en CPU o en GPUs de gama baja para tareas de etiquetado aproximado o captioning exploratorio.
- Base para fine-tuning de dominio especifico: al ser pequeno, se puede ajustar en un unico GPU de consumo sobre datasets reducidos (por ejemplo, imagenes medicas o industriales) como prueba de concepto.
- Evaluacion comparativa de tecnicas de entrenamiento multimodal: permite reproducir ablaciones (congelar el ViT, entrenar solo el proyector, etc.) con coste bajo y resultados rapidos de iterar.
- Integracion en cuadernos educativos o demos interactivas: su ligereza permite desplegarlo en notebooks y entornos tipo Gradio sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1,8 GB para los pesos (460M parametros); en fp16/bf16, en torno a 0,9-1 GB, mas el coste de activaciones y del encoder visual.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4) es suficiente; en A100/H100 el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el autor indica el uso mediante la libreria `nanovlm` y el repositorio de GitHub `huggingface/nanoVLM`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; al no existir pesos GGUF publicados, llama.cpp y Ollama no son opciones directas sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| s13o/nanoVLM | 460M (safetensors); 222M declarados | no disponible | MIT | VLM minimalista de investigacion |
| lusxvr/nanoVLM-222M | 222M | no disponible | no disponible en la informacion | Modelo base del que deriva |
| SmolVLM (HuggingFace) | ~256M-2B (segun variante) | no disponible en la informacion | Apache 2.0 (segun variante) | VLM ligero para dispositivos |
| LLaVA-1.5-7B | 7B | 4K tokens aproximadamente | LLaMA (uso condicionado) | VLM de referencia con LM mayor |

La comparacion con SmolVLM y LLaVA se ofrece como referencia de categoria; no se dispone de datos de rendimiento de nanoVLM para contrastar metricas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion; la model card lo describe explicitamente como "minimal and lightweight" para experimentacion.
- Riesgo elevado de alucinacion: el LM subyacente (SmolLM2-135M) es muy pequeno y puede generar afirmaciones incorrectas sobre el contenido de la imagen.
- Capacidad visual limitada: el encoder SigLIP-B/16-224 trabaja a 224x224, lo que restringe la resolucion efectiva y el detalle en imagenes con texto o elementos pequenos.
- Idiomas: no documentados; es probable que el rendimiento en castellano sea notablemente inferior al ingles, dado el origen de SmolLM2.
- Contexto: no documentado, lo que impide planificar conversaciones multi-turno largas con garantias.
- Inconsistencia en el conteo de parametros: la model card declara 222M y los safetensors contienen 460M; conviene verificar que componentes incluye el checkpoint antes de integrarlo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en entornos tipo llama.cpp u Ollama requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s13o/nanoVLM
- Modelo base: https://huggingface.co/lusxvr/nanoVLM-222M
- Repositorio de codigo: https://github.com/huggingface/nanoVLM
- Especificacion de model cards de HuggingFace: https://github.com/huggingface/hub-docs/blob/main/modelcard.md?plain=1
- Guia de model cards: https://huggingface.co/docs/hub/model-cards
