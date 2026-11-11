# minhnv7/ratiodiff-h100-1gpu-sdxl-85k

## Resumen

RatioDiff SDXL es un ajuste fino (fine-tune) del UNet de Stable Diffusion XL Base 1.0, entrenado con la técnica RatioDiff sobre 85.000 pares de preferencia del dataset Pick-a-Pic v2. Lo publica el usuario minhnv7 en Hugging Face como reproducción de un experimento de entrenamiento de una sola GPU H100, a partir del repositorio `Vinhable/ratiodiff-h100-1gpu`. No es un modelo de lenguaje, sino un modelo de difusión texto-a-imagen: hereda la arquitectura y el codificador de texto de SDXL y solo se modifican los pesos del UNet.

El interés del artefacto es metodológico más que de producto: documenta un pipeline de alineación de preferencias (estilo RLHF/DPO adaptado a difusión) ejecutable en una única GPU de 80 GB, e incluye no solo los pesos finales sino también los estados de entrenamiento reanudables de Accelerate, una cabeza de confianza (`confidence_head.pt`) y un fichero de calibración. La model card es mínima y no aporta métricas, datos de composición del dataset ni detalles del procedimiento de entrenamiento más allá de la referencia al repositorio.

Por su naturaleza, el modelo está pensado para investigadores que quieran reproducir, inspeccionar o continuar el ajuste, no para uso en producción sin una evaluación previa. La licencia es OpenRAIL++ (heredada de SDXL), lo que impone restricciones de uso aceptable. El modelo se publicó el 10 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion model (UNet + VAE + doble codificador de texto CLIP), base Stable Diffusion XL 1.0 |
| Parametros totales | no disponible (los del UNet de SDXL se cifran habitualmente en ~2,6 mil millones, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en difusión, límite práctico de 77 tokens por codificador de texto, ampliable con trucos de prompt weighting; no declarado por el autor) |
| Tipos de cuantizacion | no disponible (los pesos se publican presumiblemente en precisión de entrenamiento; el autor no documenta variantes GGUF, fp8 ni similares) |
| Idiomas soportados | no disponible (SDXL se entrenó principalmente con texto en inglés; el autor no declara idiomas) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (carpeta `unet/`), más `confidence_head.pt` (PyTorch) y estados de Accelerate en `checkpoints/checkpoint-*/` |

## Arquitectura y entrenamiento

El modelo parte de `stabilityai/stable-diffusion-xl-base-1.0`, un modelo de difusión latente compuesto por un UNet, un VAE y dos codificadores de texto CLIP (uno de ellos OpenCLIP ViT-bigG). El ajuste se aplica sobre el UNet; el VAE y los codificadores de texto no se mencionan como modificados en la información disponible. La innovación declarada es el uso de RatioDiff, un método de optimización por preferencias que, según la nomenclatura del repositorio de referencia (`ratiodiff-h100-1gpu`), está diseñado para ejecutarse en una sola GPU H100.

El entrenamiento se realizó sobre 85.000 pares de preferencia de Pick-a-Pic v2, un dataset público de comparaciones humanas entre imágenes generadas. La model card no especifica el número de pasos, el tamaño de lote, la tasa de aprendizaje, la función de pérdida exacta ni si hubo una fase previa de ajuste supervisado. Tampoco se documenta la composición del dataset más allá de su origen. Los artefactos publicados incluyen los estados reanudables de Accelerate, lo que sugiere que el autor pretende facilitar la continuación del entrenamiento o la auditoría del proceso.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, con la resolución y el rango de estilos propios de SDXL Base 1.0.
- Ajuste de preferencias sobre la salida del UNet base, orientado a alinear las imágenes generadas con las preferencias humanas registradas en Pick-a-Pic v2.
- Reanudación del entrenamiento desde los checkpoints de Accelerate incluidos.
- Inspección y reutilización de la cabeza de confianza (`confidence_head.pt`) y de la calibración (`calibration.json`) para experimentos de estimación de incertidumbre o scoring de muestras.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; son capacidades ajenas al tipo de modelo.
- Capacidades multilingües: no declaradas; se hereda el comportamiento de los codificadores CLIP de SDXL, predominantemente anglófonos.

## Casos de uso

- Reproducción de experimentos de alineación por preferencias en difusión: el paquete incluye pesos finales, checkpoints intermedios y logs, lo que permite replicar el pipeline RatioDiff en una H100 y comparar curvas de entrenamiento con las publicadas.
- Investigación sobre calibración de modelos generativos: la `confidence_head.pt` y `calibration.json` permiten estudiar si la confianza estimada correlaciona con la calidad percibida de la imagen, un problema abierto en generación visual.
- Ajuste fino posterior sobre dominios específicos (estilo, producto, ilustración): al ser un fine-tune de SDXL, se puede partir de estos pesos y continuar el entrenamiento con datasets propios usando los estados de Accelerate como punto de reanudación.
- Generación de imágenes para prototipado interno: con la licencia OpenRAIL++ y tras una evaluación cualitativa, puede usarse para maquetas y pruebas de concepto en entornos controlados.
- Estudio de sesgos y alineación: comparar las salidas de este fine-tune con las de SDXL Base permite analizar cómo los pares de preferencia de Pick-a-Pic desplazan la distribución de estilos, composiciones y atributos demográficos.
- Docencia y formación técnica: el repositorio y los artefactos asociados sirven como material didáctico para explicar difusión latente, optimización por preferencias y entrenamiento distribuido con Accelerate en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia del modelo base SDXL, la inferencia en fp16 suele requerir entre 8 y 12 GB de VRAM, pero el autor no publica mediciones para este fine-tune.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 (80 GB), según el nombre del modelo y la referencia al repositorio `ratiodiff-h100-1gpu`. Para inferencia no se especifican GPU.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por herencia de SDXL es plausible en tarjetas con 12 GB o más en fp16, pero no hay datos publicados para este checkpoint.
- Opciones de despliegue: no documentadas. Al publicarse solo el UNet en safetensors y los estados de Accelerate, no se incluyen variantes GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas, por otra parte, orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (tokens de texto) | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RatioDiff SDXL 85k (este modelo) | no disponible (UNet SDXL) | no disponible | sin benchmarks publicados | openrail++ | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | ~2,6 mil millones en UNet (no declarado en esta ficha) | 77 por codificador | benchmarks públicos de SDXL en su model card | openrail++ | Hugging Face, ampliamente utilizado |
| stabilityai/stable-diffusion-xl-refiner-1.0 | no disponible | 77 por codificador | benchmarks públicos en su model card | openrail++ | Hugging Face |
| Modelos de difusión alineados por preferencias (p. ej. variantes Diffusion-DPO) | variable | 77 por codificador | depende de la publicación | variable | Hugging Face / repositorios de investigación |

La comparación se limita a la familia SDXL porque no se dispone de datos de rendimiento de este fine-tune frente a alternativas. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones cualitativas publicadas: se desconoce si el ajuste mejora, degrada o deja igual la calidad respecto a SDXL Base.
- El dataset de preferencias Pick-a-Pic v2 refleja los sesgos de sus anotadores humanos; el fine-tune puede amplificarlos en estilos, composiciones y representaciones demográficas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y detalles incoherentes con el prompt.
- Idiomas: no se declaran capacidades multilingües; los prompts en castellano pueden funcionar peor que en inglés por herencia de los codificadores CLIP de SDXL.
- Licencia OpenRAIL++: permite uso comercial con restricciones de uso aceptable (prohibición de usos dañinos, difamatorios o de vigilancia); es necesario revisar los términos completos antes de desplegar.
- La model card es mínima y no documenta hiperparámetros, composición del dataset ni proceso de evaluación; la reproducibilidad completa depende del repositorio externo.
- El modelo se publica como UNet suelto más artefactos de entrenamiento, no como pipeline listo para usar; requiere ensamblarlo con el VAE y los codificadores de texto de SDXL Base.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.
- Los logs se han redactado de credenciales y rutas locales, pero conviene auditarlos antes de reutilizarlos en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minhnv7/ratiodiff-h100-1gpu-sdxl-85k
- Repositorio de entrenamiento RatioDiff (referenciado en la model card): https://github.com/Vinhable/ratiodiff-h100-1gpu
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset Pick-a-Pic v2: no disponible en la información proporcionada (el autor no incluye enlace directo)
- Paper de RatioDiff: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible
