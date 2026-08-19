# HaC-RL/NFT-OR

## Resumen

NFT-OR es un adaptador LoRA (Low-Rank Adaptation) desarrollado por HaC-RL para el modelo base Stable Diffusion 3.5 Medium. Se trata de un checkpoint de entrenamiento desde cero (from-scratch) que utiliza técnicas de aprendizaje por refuerzo (Reinforcement Learning, RL) específicas para difusión, concretamente los métodos DiffusionNFT y NFT-OR. El objetivo es mejorar la calidad estética y la alineación de las imágenes generadas con el prompt, optimizando métricas como PickScore, CLIP y HPSv2.

El adaptador se distribuye como un archivo `adapter_model.safetensors` junto con su configuración, y se carga mediante la librería `peft` sobre el pipeline de Stable Diffusion 3.5. Aunque el repositorio contiene varios checkpoints (180 y 200 épocas), el autor recomienda usar el de 200 épocas para obtener los mejores resultados en DrawBench. Este proyecto es relevante porque explora la aplicación de RL a la generación de imágenes con modelos de difusión, un área activa de investigación, y ofrece una implementación práctica y reproducible.

La licencia Apache 2.0 permite uso comercial y modificación, aunque al ser un adaptador de investigación, se recomienda validar su comportamiento antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Stable Diffusion 3.5 Medium (MMDiT) |
| Parametros totales | no disponible (repo de 0.2 GB, rank 32, alpha 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image) |
| Tipos de cuantizacion | no disponible (safetensors sin cuantizar) |
| Idiomas soportados | no disponible (depende del modelo base SD3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica únicamente a las proyecciones de atención del transformer de difusión de Stable Diffusion 3.5 Medium, con rango 32 y alpha 64. El entrenamiento se realizó desde cero (sin pesos previos del LoRA) utilizando dos recetas de RL: DiffusionNFT y NFT-OR. Ambas usan el dataset Pick-a-Pic, recompensas combinadas de PickScore, CLIP y HPSv2, resolución 512x512, 40 pasos de muestreo, beta 0.1, 4 GPUs A800 y semilla 42.

El run NFT-OR incorpora una variante de optimización con `implicit_positive` OR colineal (alpha 0.05), que según el autor satura después de la época 0, por lo que la diferencia de rendimiento entre NFT y NFT-OR no debe interpretarse como evidencia causal de la efectividad de OR. Los checkpoints se guardaron cada 20 épocas, siendo el último disponible el de 180 para el run NFT y 200 para NFT-OR (aunque el job de NFT solo llegó a 180).

## Capacidades

- Generación de imágenes a partir de prompts de texto, mejorando la calidad estética y la alineación semántica respecto al modelo base.
- Optimización específica para métricas de preferencia humana (PickScore, HPSv2) y similitud CLIP.
- Soporte de resolución de salida variable, aunque el entrenamiento se realizó a 512x512; los benchmarks usan 1024x1024.
- Compatible con el pipeline estándar de Diffusers para Stable Diffusion 3.5, permitiendo integración con otros LoRAs y técnicas de sampling.
- No incluye capacidades de tool calling, agentes, ni procesamiento multimodal más allá de text-to-image.
- El adaptador es ligero (0.2 GB) y fácil de cargar, lo que facilita su uso en entornos con recursos limitados.

## Casos de uso

- Generación de arte digital y NFTs: el modelo está específicamente entrenado para producir imágenes con alta puntuación estética, adecuado para crear colecciones de arte generativo o ilustraciones para proyectos NFT.
- Diseño gráfico y publicidad: permite generar conceptos visuales a partir de descripciones textuales, acelerando el prototipado de campañas o materiales de marketing.
- Creación de contenido para redes sociales: se puede usar para generar imágenes atractivas para publicaciones, con mejor alineación al prompt que el modelo base.
- Investigación en RL para difusión: sirve como punto de partida para estudiar métodos de optimización de preferencias en modelos generativos, ya que incluye checkpoints de diferentes épocas y configuraciones.
- Prototipado de aplicaciones de generación de imágenes: al ser un adaptador ligero, se puede integrar en demos o servicios donde se requiera personalización estética sin reentrenar el modelo completo.
- Benchmarking de métricas de calidad: los checkpoints proporcionan datos de DrawBench que permiten comparar la evolución del entrenamiento y validar nuevas métricas de evaluación.

## Benchmarks y rendimiento

La model card incluye resultados en DrawBench (1024x1024, 40 pasos, EMA) para tres checkpoints. No se proporcionan comparaciones con otros modelos o adaptadores.

| Checkpoint | ImageReward | CLIP | Aesthetic | PickScore | HPSv2 | avg |
|---|---|---|---|---|---|---|
| scratch-nft ckpt-180 | 1.194 | 0.280 | 5.888 | 0.895 | 0.316 | 8.573 |
| scratch-nft-or ckpt-180 | 1.292 | 0.285 | 5.938 | 0.897 | 0.321 | 8.733 |
| scratch-nft-or ckpt-200 | 1.306 | 0.286 | 5.951 | 0.896 | 0.319 | 8.757 |

No se han publicado resultados de benchmarks comparativos con otros LoRAs o modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (0.2 GB), pero la inferencia requiere cargar el modelo base Stable Diffusion 3.5 Medium, que tiene aproximadamente 2.5 mil millones de parámetros.
- Para inferencia en bfloat16, se estima un consumo de VRAM de al menos 8 GB para el modelo base, más la sobrecarga del pipeline y el adaptador. No se especifican requisitos exactos en la documentación.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3070/3080/3090, RTX 4060 Ti 16 GB, o GPUs de datacenter como A100. Para generación a 1024x1024 con 40 pasos, se recomienda al menos 12 GB de VRAM.
- Opciones de despliegue: al ser un adaptador de Diffusers, se puede usar con la librería `diffusers` en Python, y también es compatible con herramientas como ComfyUI o Automatic1111 mediante la carga de LoRA.
- No se proporcionan datos de latencia o throughput específicos; dependerá del hardware y la configuración de sampling.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores LoRA para Stable Diffusion 3.5 Medium en la documentación proporcionada. El modelo base SD3.5 Medium es el punto de referencia natural, pero no se incluyen métricas del base sin adaptador. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción validado. El autor advierte explícitamente que la diferencia de rendimiento entre NFT y NFT-OR no debe interpretarse como evidencia causal de que OR sea efectivo.
- El entrenamiento se realizó con el dataset Pick-a-Pic, que puede contener sesgos en los prompts y preferencias humanas, lo que podría reflejarse en las imágenes generadas.
- No se especifican idiomas soportados; la generación de imágenes depende del modelo base, que suele funcionar mejor con prompts en inglés.
- Riesgo de alucinaciones visuales o artefactos en prompts complejos o fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base SD3.5 Medium tiene su propia licencia (Stability AI Community License) que puede imponer restricciones adicionales para uso comercial en algunos casos. Se debe revisar la licencia del modelo base.
- El repositorio solo contiene adaptadores de inferencia, no los estados del optimizador ni el código de entrenamiento, lo que limita la reproducibilidad completa.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/HaC-RL/NFT-OR)
- [Modelo base Stable Diffusion 3.5 Medium](https://huggingface.co/stabilityai/stable-diffusion-3.5-medium)
- [Colección RL de HaC-RL](https://huggingface.co/collections/hac/rl)
