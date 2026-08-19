# jinlovespho/GARD

## Resumen

GARD (Geometry-Aware Representation Denoising) es un modelo de restauración y reconstrucción 3D multi-vista desarrollado por el CVLab de KAIST (Corea del Sur). Aborda un problema crítico: los modelos feed-forward de reconstrucción 3D funcionan bien con imágenes limpias, pero degradan drásticamente ante artefactos reales como desenfoque de movimiento, ruido u otras distorsiones. En lugar de restaurar píxeles primero y reconstruir geometría después, GARD realiza un denoising por difusión directamente en el espacio de características geométricas de un modelo de estimación de profundidad (Depth Anything 3), lo que permite recuperar simultáneamente la geometría 3D y la imagen de alta calidad en una sola pasada.

El modelo se compone de dos checkpoints: un denoiser basado en un DiT (Diffusion Transformer) con una cabeza DDT (probablemente "Diffusion Denoising Transformer") que opera sobre las representaciones de características de Depth Anything 3, y un decodificador RGB (basado en un adaptador MAE) que reconstruye imágenes desde las representaciones denoised. El repositorio en HuggingFace ocupa 7,6 GB y la licencia es MIT. No se dispone de información sobre el número total de parámetros, la longitud de contexto ni los idiomas soportados, ya que la model card no los especifica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con cabeza DDT para denoising de características; decodificador RGB basado en adaptador MAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

GARD se basa en un enfoque de difusión aplicado a representaciones de características geométricas. El denoiser (gard_denoiser.pt, 5,6 GB) es un DiT con una cabeza DDT que toma como entrada las características extraídas por Depth Anything 3 (DA3) de múltiples vistas degradadas y las denoisa para recuperar una representación limpia y consistente de la geometría. El decodificador RGB (mae_adapter_giant.pt, 2,0 GB) es un adaptador basado en MAE (Masked Autoencoder) que reconstruye imágenes de alta calidad a partir de las representaciones denoised. Este diseño evita el paso intermedio de restauración de píxeles, que suele propagar errores a la reconstrucción 3D.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. El modelo se apoya en trabajos previos como RAE, Depth Anything 3, GLD y Motionblur, según los agradecimientos de la model card. El código de entrenamiento e inferencia está disponible en el repositorio de GitHub, junto con scripts de preparación de datos y benchmarks de evaluación.

## Capacidades

- Restauración multi-vista de imágenes degradadas por desenfoque de movimiento, ruido y otros artefactos.
- Reconstrucción 3D robusta a partir de múltiples vistas con degradaciones reales.
- Estimación de profundidad integrada a través de Depth Anything 3, lo que permite obtener mapas de profundidad consistentes.
- Generación de imágenes de alta calidad desde las representaciones denoised mediante el decodificador RGB.
- Procesamiento de escenas con poses conocidas o desconocidas (según los scripts de evaluación en DA3-BENCH).
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de vídeo capturado con smartphone: el modelo puede procesar secuencias con desenfoque de movimiento típico de grabación manual y generar una geometría 3D fiable, útil para aplicaciones de fotogrametría móvil.
- Restauración de archivos fotográficos históricos: imágenes antiguas con ruido o degradación pueden ser restauradas y utilizadas para reconstruir objetos o escenas en 3D, por ejemplo en museos o proyectos de patrimonio cultural.
- Mejora de pipelines de fotogrametría industrial: en entornos con vibración o iluminación deficiente, GARD puede pre-procesar las imágenes para que los algoritmos de reconstrucción estándar produzcan mejores resultados.
- Estimación de profundidad robusta en robótica: robots que operan en condiciones de baja luz o con sensores ruidosos pueden beneficiarse de la capacidad de GARD para extraer profundidad consistente de múltiples vistas degradadas.
- Generación de modelos 3D para realidad virtual y aumentada: a partir de capturas de baja calidad, GARD permite crear assets 3D limpios sin necesidad de re-fotografiar la escena.
- Restauración de imágenes multi-vista para postproducción: el decodificador RGB puede usarse para limpiar imágenes individuales o secuencias completas antes de su uso en efectos visuales o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un benchmark propio (DA3-BENCH) y un benchmark de escenas reales con desenfoque de movimiento, pero no se incluyen cifras concretas. Se recomienda consultar el repositorio de GitHub o el paper para obtener métricas detalladas.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas en la información proporcionada.
- Dado el tamaño de los checkpoints (5,6 GB + 2,0 GB) y que se trata de un modelo de difusión, se estima que la inferencia requiere al menos 16-24 GB de VRAM en una GPU de gama alta (por ejemplo, RTX 3090, RTX 4090, A100 o similar), aunque esta cifra es una estimación razonable y no un dato oficial.
- El modelo está implementado en PyTorch, por lo que puede desplegarse con frameworks estándar como PyTorch Lightning, Hugging Face Diffusers o vLLM (si se adapta), aunque no se mencionan opciones específicas de despliegue.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar GARD con otros modelos de reconstrucción 3D multi-vista en términos de parámetros, contexto o rendimiento. La model card no menciona alternativas ni ofrece tablas comparativas. Se recomienda consultar el paper para ver comparaciones con métodos previos como RAE, GLD u otros enfoques feed-forward.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos visuales, puede heredar sesgos de los conjuntos de datos utilizados (por ejemplo, predominancia de escenas interiores o exteriores, tipos de objetos, etc.).
- Existe riesgo de alucinación geométrica: en escenas muy degradadas o con información insuficiente, el modelo podría generar geometría plausible pero incorrecta.
- La dependencia de Depth Anything 3 implica que las limitaciones de ese modelo base (por ejemplo, su rango de profundidad o su comportamiento en ciertos dominios) se transfieren a GARD.
- La licencia MIT permite uso comercial, pero es necesario verificar las licencias de los modelos subyacentes (Depth Anything 3, RAE, etc.) que podrían tener restricciones adicionales.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar el modelo en el dominio de aplicación específico antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/jinlovespho/GARD
- Paper (arXiv): https://arxiv.org/abs/2605.26230
- Página del proyecto: https://cvlab-kaist.github.io/GARD/
- Repositorio de código: https://github.com/cvlab-kaist/GARD
