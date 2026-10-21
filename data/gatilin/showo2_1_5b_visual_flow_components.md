# gatilin/showo2_1_5b_visual_flow_components

## Resumen

Este repositorio no contiene un modelo completo, sino un paquete de componentes extraídos del checkpoint oficial Show-o2 1.5B: concretamente los 571 tensores no pertenecientes al backbone lingüístico Qwen, preservando nombres, dtypes y valores originales. Lo publica el usuario gatilin bajo licencia Apache-2.0 y su pipeline declarado en HuggingFace es `feature-extraction`. El resultado es la ruta visual y de flow matching de Show-o2 aislada del LLM, utilizable para auditar, reutilizar o integrar el adaptador visual en pipelines propios.

El paquete incluye los dos embedders de latentes, un transformer semántico derivado de SigLIP de 26 capas, posiciones aprendidas, proyecciones de fusión, embeddings temporales, proyecciones ocultas, diez bloques de flujo modulados y la cabeza de velocidad final. Los 339 tensores `showo.*` del backbone Qwen quedan explícitamente excluidos. Además se incluye, como dependencia externa, el VAE original de Wan2.1 (`vae/source.pth`, 507.609.880 bytes) con su SHA-256 oficial y su propia licencia.

Su relevancia es acotada pero clara: permite trabajar con el camino visual de un modelo multimodal unificado (comprensión de imagen y generación por flow matching en el espacio latente de 16 canales de Wan) sin necesidad de cargar ni descargar el backbone lingüístico, el tokenizador ni el checkpoint SigLIP. No es, en ningún caso, un sustituto del modelo completo: la comprensión visual de extremo a extremo y la generación condicionada por lenguaje siguen requiriendo el backbone Qwen entrenado y el pipeline nativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador visual y de flujo de Show-o2: embedders de latentes duales, transformer semántico derivado de SigLIP de 26 capas, proyecciones de fusión, diez bloques de flujo modulados y cabeza de velocidad (flow matching); backbone Qwen excluido |
| Parámetros totales | 1.287.472.864 (solo tensores visuales y de flujo incluidos en el safetensors principal) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el autor solo publica los pesos en su dtype original (safetensors) y el VAE en `.pth` |
| Idiomas soportados | no disponible (el paquete no incluye tokenizador ni backbone lingüístico) |
| Licencia | Apache-2.0 (se conservan `LICENSE`, `NOTICE` y `vae/LICENSE`) |
| Formato de pesos | safetensors (2.575.011.016 bytes) + `.pth` para el VAE de Wan2.1 |
| Tensores incluidos | 571 tensores no Qwen; se excluyen 339 tensores `showo.*` del backbone |
| Espacio latente | 16 canales normalizados del VAE de Wan2.1; vectores de parche de 64 dimensiones; tokens visuales de 1536 dimensiones (espacio de entrada Qwen) |
| Dependencia de software | PyTorch; probado con Transformers 4.57.6 (Transformers 5 incompatible) |
| Tamaño del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

Show-o2 es un modelo multimodal unificado que combina un backbone lingüístico tipo Qwen con un generador de imágenes basado en flow matching sobre el espacio latente del VAE de Wan2.1. Este paquete reproduce únicamente la mitad visual: dos embedders de latentes que proyectan el latente Wan al espacio del transformer semántico, un transformer de 26 capas derivado de SigLIP con posiciones aprendidas, proyecciones de fusión entre modalidades, embeddings temporales, proyecciones ocultas, diez bloques de flujo con modulación y una cabeza final que predice el campo de velocidad. La interfaz pública se organiza en tres pasos: `encode_latents` produce un token temporal seguido de tokens visuales fusionados en 1536 dimensiones; `predict_velocity(states, t, modality_positions, attention_mask)` devuelve vectores de parche de 64 dimensiones; y `velocity_image(patches, latent_height, latent_width)` restaura el ordenamiento oficial de salida.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el autor no entrena nada nuevo, sino que extrae tensores del checkpoint oficial Show-o2 1.5B (revisión `07ec16589d4fc5422a74dddbbc4b2cd11e551039`) y añade el VAE original de Wan2.1 como dependencia. La innovación técnica del paquete es de ingeniería más que de modelado: un arnés de validación (`validation.json`) que compara el adaptador contra los métodos `forward` y `unpatchify` originales sin modificar, sustituyendo el backbone excluido por un backbone "echo" en la frontera del LLM, y que verifica hashes por tensor, carga estricta, recuento completo de bloques, fusión cuadrada y rectangular y valores de velocidad finitos. El código nativo está fijado a la revisión `45a5a2d` del repositorio showlab/Show-o, de modo que las clases originales se instancian sin descargar otro checkpoint de Qwen o SigLIP.

## Capacidades

- Codificación de una imagen por elemento de batch a latente Wan normalizado de 16 canales, devolviendo latente y log-varianza (`vae.model.encode`).
- Proyección de ese latente a tokens visuales fusionados en el espacio de 1536 dimensiones de Qwen, precedidos por un token temporal (`encode_latents`), con interpolación de posiciones adaptada a la forma real de la imagen.
- Predicción del campo de velocidad de flow matching (`predict_velocity`) sobre estados, paso temporal, posiciones de modalidad y máscara de atención, devolviendo vectores de parche de 64 dimensiones.
- Reordenación de parches a latente de imagen con `velocity_image`, preservando el ordenamiento oficial.
- Decodificación de latentes a RGB con el VAE de Wan2.1 incluido, con soporte del códec nativo para imágenes y vídeo (validado con un fotograma a 64 px y cinco fotogramas a 32 px).
- Fusión de imágenes cuadradas y rectangulares, verificada en el arnés de validación.
- No incluye: generación de texto, tool calling ni function calling, razonamiento multi-paso, agentes, modo thinking, capacidades multilingües, VQA ni comprensión visual de extremo a extremo. Todo ello depende del backbone Qwen y del pipeline completo, que no forman parte del paquete.

## Casos de uso

- Auditoría y reproducibilidad de checkpoints: el repositorio incluye hashes de bytes por tensor, metadatos de extracción, mapeo de tensores y procedencia del código, lo que permite verificar que una copia local coincide bit a bit con el checkpoint oficial de Show-o2 antes de desplegarla.
- Investigación de la ruta visual de un modelo unificado: cargar el adaptador sin el LLM permite estudiar la interfaz entre el espacio latente de Wan y el espacio de tokens de Qwen con un coste de memoria de aproximadamente 3 GB en lugar de cargar el pipeline completo.
- Pruebas de integración en CI: el patrón de backbone "echo" empleado en `validate.py` sirve como plantilla para testear refactorizaciones del código de inferencia sin depender de pesos lingüísticos ni de GPU de gran capacidad.
- Preprocesado de imagen y vídeo a latentes: usar `vae.model.encode` y `vae.model.decode` como códec Wan independiente para convertir fotogramas a latentes de 16 canales y reconstruirlos, por ejemplo en pipelines de compresión o de aumento de datos.
- Extracción de características visuales: el pipeline declarado es `feature-extraction`; los tokens visuales fusionados de 1536 dimensiones pueden alimentar clasificadores o índices de recuperación, siempre que se aporte el backbone que consume esa secuencia.
- Ajuste fino selectivo: al estar aislados los bloques de flujo y la cabeza de velocidad, es posible congelar el backbone y entrenar solo la ruta visual con un dataset propio de pares latente-imagen.
- Sustitución del códec: el adaptador está desacoplado del VAE, de modo que se puede evaluar otro códec latente de 16 canales manteniendo la lógica de fusión y de predicción de velocidad.
- Docencia y divulgación técnica: el paquete expone de forma legible la separación entre backbone lingüístico, adaptador visual y generador por flow matching, lo que facilita explicar arquitecturas multimodales unificadas con código ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor lo indica de forma explícita: la validación cubierta incluye paridad del camino visual frente a los métodos originales, comprobaciones de hashes, carga estricta, recuento de bloques, fusión cuadrada y rectangular y valores de velocidad finitos, pero no se reclama ninguna métrica de calidad de imagen, VQA, sampler a resolución completa ni flujo de vídeo.

## Requisitos de hardware

- VRAM estimada para el adaptador visual: alrededor de 2,6 GB en el dtype original de los pesos (1.287.472.864 parámetros en 2 bytes); estimación derivada del tamaño del safetensors, no publicada por el autor.
- VRAM estimada añadiendo el VAE de Wan2.1: aproximadamente 0,5 GB adicionales en disco y en memoria, hasta unos 3,2 GB de pesos en total.
- Con activaciones y lotes pequeños, un presupuesto de 6-8 GB de VRAM es suficiente para ejecutar `encode_latents`, `predict_velocity` y la decodificación del VAE; el pipeline completo de Show-o2 requiere además el backbone Qwen y no está cubierto por estas cifras.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4) para el adaptador aislado; A100 o H100 solo tienen sentido si se ejecuta el modelo completo o se procesan lotes grandes.
- Cabe en GPU de consumo: sí, el paquete de componentes por sí solo es holgado en tarjetas de 8 GB.
- Opciones de despliegue: no hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no existen pesos GGUF ni un `pipeline` estándar de Transformers. El despliegue se hace con PyTorch puro, clonando el repositorio vía `snapshot_download` e importando `component.load_model` y `component.load_vae`, en un entorno separado con `requirements.txt` y Transformers 4.57.6.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gatilin/showo2_1_5b_visual_flow_components | 1.287.472.864 (solo ruta visual y de flujo) | no disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | Requiere backbone Qwen, tokenizador y sampler externos; incluye VAE de Wan2.1 |
| showlab/show-o2-1.5B | no disponible en la información | no disponible | no disponible en la información | HuggingFace | Modelo completo del que proceden los tensores; incluye los 339 tensores `showo.*` excluidos aquí |
| Wan-AI/Wan2.1-T2V-14B | 14.000 millones según el nombre; cifra exacta no disponible | no disponible | no disponible en la información | HuggingFace | Solo se utiliza su VAE; el resto del modelo generativo de vídeo no interviene |
| Otros modelos multimodales unificados (Janus-Pro, Emu3, Chameleon) | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada; no se establece comparación cuantitativa |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el backbone Qwen entrenado, el tokenizador, el empaquetado de prompts, las máscaras de atención y el sampler, no hay comprensión visual ni generación condicionada por lenguaje.
- Los 339 tensores `showo.*` del backbone lingüístico están deliberadamente ausentes; cualquier uso que espere un `AutoModel` estándar fallará.
- La validación acredita paridad del camino visual con un backbone simulado, no calidad de generación real; el propio autor lo subraya.
- No hay métricas de calidad de imagen, VQA, sampler a resolución completa ni flujo de vídeo, por lo que no se puede evaluar el rendimiento final a partir de este repositorio.
- El VAE incluido es el original de Wan2.1, no un VAE reentrenado específicamente para Show-o2; su licencia es independiente y se recoge en `vae/LICENSE`.
- Incompatibilidad conocida con Transformers 5: el código nativo depende de internals heredados y solo está probado con la versión 4.57.6, lo que obliga a aislar el entorno.
- `native/modeling_showo2_qwen2_5.py` y `native/misc.py` son fuentes de referencia para el arnés de paridad, no puntos de entrada completos del modelo.
- Idiomas soportados: no disponible; el paquete no contiene ninguna capacidad lingüística, de modo que el multilingüismo depende íntegramente del backbone ausente.
- Estado de adopción nulo en el momento de la ficha (0 descargas, 0 likes, creado y actualizado el 21 de octubre de 2026), sin revisión independiente por parte de la comunidad.
- Riesgo de alucinación: no aplica a este paquete por sí mismo, pero sí al pipeline completo que lo integre, que hereda los sesgos y fallos del backbone Qwen y del sampler.
- Para uso comercial, Apache-2.0 es permisiva, pero deben conservarse `LICENSE`, `NOTICE` y las notas del VAE; conviene revisar también los términos del checkpoint Show-o2 original del que se derivan los tensores.

## Enlaces

- [HuggingFace: gatilin/showo2_1_5b_visual_flow_components](https://h
