# Pranilllllll/geonusaf-stage2-mask2image-block-fold1-D

## Resumen

GeoNUSAF Stage 2 es un modelo de difusión condicionado por máscaras semánticas para generar imágenes satelitales de alta resolución a partir de mapas de uso de suelo de 7 clases. Desarrollado por Pranilllllll como parte del proyecto GeoNUSAF, este modelo pinta una imagen de satélite de Kathmandu Valley sobre una máscara de clases de cobertura terrestre, con el objetivo de producir pares imagen-máscara sintéticos para entrenar modelos de segmentación. El modelo combina Stable Diffusion v1.5 congelado como base, una rama ControlNet (control_v11p_sd15_seg) ajustada finamente y un LoRA de rango 16 sobre las capas de atención. Se entrenó durante 7000 pasos con una resolución de 512x512 píxeles y un tamaño de píxel de 0.586 metros, utilizando exclusivamente los tiles de entrenamiento del fold 1, sin que los tiles de validación participaran en el gradiente. El repositorio ocupa 29.0 GB y está publicado bajo la librería diffusers, aunque no se especifica licencia ni idiomas.

La relevancia de este modelo radica en su aplicación directa a la teledetección: permite aumentar conjuntos de datos de segmentación semántica generando imágenes sintéticas realistas a partir de máscaras, lo que resulta útil en regiones con escasez de datos etiquetados. Al estar condicionado por máscaras, el modelo ofrece control explícito sobre la distribución de clases en la imagen generada, una capacidad que los generadores de texto a imagen convencionales no proporcionan. Su diseño modular (base congelada + ControlNet + LoRA) facilita la adaptación a otros dominios o resoluciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion v1.5 (base congelada) + ControlNet (control_v11p_sd15_seg) + LoRA (r16, alpha 16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (imagen 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio diffusers, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Stable Diffusion v1.5, cuyos pesos permanecen congelados durante el entrenamiento. Sobre esta base se añade una rama ControlNet inicializada desde los pesos de `lllyasviel/control_v11p_sd15_seg` (preentrenada para segmentación) y ajustada finamente. Además, se incorpora un LoRA de rango 16 y alpha 16 aplicado a las proyecciones de atención (`to_q`, `to_k`, `to_v`, `to_out.0`). La condición de entrada es una máscara de una sola canal con índices de clase `{0..5}` y valor `255` (o `6`) para píxeles ignorados, que se convierte a una representación one-hot de 7 canales con ceros iniciales.

El entrenamiento se realizó con una tasa de aprendizaje de 0.0001 para el LoRA y 5e-05 para la rama ControlNet, durante 7000 pasos, con resolución 512 y GSD de 0.586 m/px. El muestreo se efectuó con DDIM de 30 pasos y guidance scale de 3.5. La selección del mejor checkpoint se basó en el mIoU de layout (0.4171 en selección). Los datos de entrenamiento provienen exclusivamente de los tiles TRAIN del fold 1 (split block fold 1, train_sha1 eb0aebdd9919), con semilla 42. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de imágenes satelitales RGB a partir de máscaras semánticas de 7 clases (uso de suelo).
- Condicionamiento preciso por máscara: la imagen generada respeta la distribución espacial de las clases indicadas.
- Producción de pares imagen-máscara (`genimage{i}.png` y `genmask{i}.png`) listos para entrenamiento de segmentación.
- Control de la composición de la escena mediante la edición de la máscara de entrada.
- Especializado en el dominio de Kathmandu Valley, con resolución fija de 512x512 píxeles.
- No soporta generación de texto, código, razonamiento ni otras modalidades; es exclusivamente un generador condicional de imágenes.

## Casos de uso

- Aumento de datos para segmentación semántica en teledetección: el modelo genera pares imagen-máscara sintéticos que pueden combinarse con datos reales para mejorar la robustez de los modelos de segmentación, especialmente en clases poco representadas.
- Simulación de escenarios de cambio de uso de suelo: modificando la máscara de entrada (por ejemplo, convirtiendo zonas agrícolas en urbanas), se pueden generar imágenes hipotéticas para estudiar impactos ambientales o planificación urbana.
- Entrenamiento de modelos de segmentación con datos sintéticos: los pares generados son directamente utilizables como conjunto de entrenamiento, evitando la costosa anotación manual de imágenes satelitales.
- Evaluación de modelos de segmentación: al tener control total sobre la máscara, se pueden crear conjuntos de prueba con distribuciones de clases específicas para medir la generalización de los segmentadores.
- Generación de datos para estudios de teledetección en regiones con escasez de datos: el modelo puede adaptarse (con fine-tuning) a otras áreas geográficas, aunque su entrenamiento actual está limitado a Kathmandu Valley.
- Investigación en generación condicional de imágenes: sirve como referencia para estudiar la interacción entre ControlNet y LoRA en tareas de síntesis de imágenes geoespaciales.

## Benchmarks y rendimiento

Los resultados reportados en la model card se refieren a la calidad de la generación y la fidelidad del layout:

| Metrica | Valor |
|---|---|
| layout mIoU (gen) | 0.5161 |
| layout mIoU (real ceiling) | 0.4643 |
| layout ratio | 1.112 |
| KID | 0.02629 ± 0.00753 |
| FID | 122.44 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El layout mIoU generado supera al techo real (0.5161 vs 0.4643), lo que indica que las máscaras generadas son más coherentes con las imágenes que las máscaras reales, un resultado esperable al estar condicionado por la propia máscara. El FID de 122.44 es relativamente alto, lo que sugiere una calidad visual limitada en comparación con generadores de imágenes naturales, aunque es un valor típico para dominios específicos como la teledetección.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Dado que el modelo se basa en Stable Diffusion v1.5 con ControlNet y LoRA, se estima que la inferencia requiere al menos 4 GB de VRAM en precisión fp16, y unos 6-8 GB en fp32, aunque estos valores son orientativos y no han sido confirmados por el autor.
- GPUs recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, RTX 4060) para una inferencia cómoda; GPUs de gama alta como A100 o H100 no son necesarias para este modelo.
- El repositorio tiene un tamaño de 29.0 GB, lo que implica espacio en disco suficiente para los pesos completos.
- Opciones de despliegue: al ser un modelo de diffusers, puede ejecutarse con la librería `diffusers` de Hugging Face, así como con herramientas compatibles como `vLLM` (aunque no es su caso principal), `ComfyUI` o `Automatic1111` si se convierten los pesos. No se menciona soporte para llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Existen variantes del mismo proyecto, como `geonusaf-stage2-mask2image-block-fold0-D` (mismo autor, mismo enfoque pero con fold 0) y `geonusaf-segNext-block-fold1` (un modelo de segmentación, no de generación), pero no se han publicado métricas comparativas entre ellos. Por tanto, no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de Kathmandu Valley; su capacidad de generalización a otras regiones geográficas es limitada y no ha sido evaluada.
- La resolución de salida es fija (512x512), lo que restringe su uso en aplicaciones que requieran mayor detalle espacial.
- La calidad visual, medida por FID (122.44), es moderada; las imágenes generadas pueden presentar artefactos o falta de realismo en comparación con imágenes reales.
- No se especifica la licencia, lo que genera incertidumbre sobre el uso comercial o la redistribución del modelo.
- No se han documentado sesgos específicos, pero al entrenarse en una región concreta, puede reflejar las características de esa zona (por ejemplo, tipos de vegetación, densidad urbana) y no ser representativo de otras áreas.
- El modelo depende de la calidad de la máscara de entrada; máscaras ruidosas o inconsistentes producirán imágenes degradadas.
- No se ha evaluado su comportamiento en condiciones de máscaras con clases ausentes o distribuciones atípicas.
- El repositorio no incluye un pipeline de inferencia documentado, por lo que el usuario debe construir el flujo de generación a partir de los componentes (base, ControlNet, LoRA).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-stage2-mask2image-block-fold1-D
- Variante fold 0: https://huggingface.co/Pranilllllll/geonusaf-stage2-mask2image-block-fold0-D
- Modelo de segmentación asociado: https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold1

No se han encontrado papers, blogs o repositorios adicionales en la busqueda web.
