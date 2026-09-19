# jonghyuns/sd-class-butterflies-64

## Resumen

El modelo jonghyuns/sd-class-butterflies-64 es un modelo de difusión de imágenes incondicional, desarrollado por el usuario jonghyuns y publicado en Hugging Face. Se trata de un artefacto educativo generado en el contexto de la Unidad 1 del curso Diffusion Models Class de Hugging Face, cuyo objetivo es entrenar un DDPM (Denoising Diffusion Probabilistic Model) desde cero sobre un conjunto de imágenes de mariposas a resolución 64x64 píxeles. No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta chat ni tool calling.

El modelo cuenta con 18.536.323 parámetros (aproximadamente 18,5 millones) según los pesos en formato safetensors, lo que lo sitúa en la categoría de modelos de difusión muy ligeros, con un repositorio de apenas 0,1 GB. La arquitectura es una U-Net convolucional (UNet2DModel) combinada con un scheduler DDPM, expuesta a través de la clase DDPMPipeline de la librería diffusers. Su pipeline declarado es unconditional-image-generation, es decir, genera muestras aleatorias sin ningún tipo de condicionamiento por prompt, etiqueta o imagen de referencia.

Su relevancia es principalmente didáctica y de experimentación: sirve como ejemplo mínimo reproducible para estudiar el funcionamiento interno de la difusión (proceso forward de ruido, denoising iterativo, efecto del número de pasos y del scheduler), como base para fine-tuning con técnicas como DreamBooth o LoRA, y como caso de prueba de bajo coste en pipelines de CI/CD. Con 18 descargas y 0 likes en el momento de la consulta, se trata de un modelo de uso personal y no de un modelo con adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (UNet2DModel) con scheduler DDPM (DDPMScheduler); difusión incondicional |
| Parámetros totales | 18.536.323 (aproximadamente 18,5 M) según los pesos safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de imagen sin entrada de texto; la entrada es ruido gaussiano de 64x64x3 |
| Tipos de cuantización | No se documentan cuantizaciones oficiales; pesos en safetensors, cargables en fp32 (por defecto) o fp16/bfloat16 mediante torch_dtype |
| Idiomas soportados | No aplica: modelo sin capacidad de procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,1 GB, con pesos PyTorch) |
| Resolución de salida | 64x64 píxeles |
| Tipo de pipeline | unconditional-image-generation (DDPMPipeline) |
| Librería | diffusers (PyTorch) |
| Descargas / likes | 18 descargas, 0 likes |
| Creado / actualizado | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

Se trata de un DDPM clásico: un modelo generativo que aprende a invertir un proceso de difusión en el que se añade ruido gaussiano a las imágenes de entrenamiento en T pasos, y la red aprende a predecir el ruido inyectado en cada paso. El backbone es una U-Net convolucional (UNet2DModel en diffusers), típica de los DDPM de resolución baja, con bloques residuales, normalización por grupos y conexiones de salto entre el codificador y el decodificador. La inferencia se realiza mediante muestreo iterativo descendente, arrancando de ruido puro, con el scheduler DDPM definido en el pipeline. La model card no especifica el número de canales por bloque, las capas de atención ni el número total de pasos de entrenamiento.

No hay información en la model card sobre el número de imágenes de entrenamiento, la composición exacta del dataset, el número de pasos de optimización, el learning rate, el uso de EMA de los pesos ni si se aplicó fine-tuning desde un checkpoint previo (por ejemplo, google/ddpm-cifar10-32), algo habitual en los ejercicios del curso Diffusion Models Class. Tampoco se documenta ningún uso de RLHF, DPO o ajuste por preferencias, técnicas que no aplican a un modelo de difusión incondicional de este tipo. No se describe ninguna innovación técnica: es una implementación de referencia con fines educativos, sin decodificación especulativa, atención lineal ni mecanismos de eficiencia adicionales.

## Capacidades

- Generación de imágenes incondicionales de mariposas a 64x64 píxeles, sin prompt ni etiqueta de clase.
- Diversidad de muestras controlada únicamente por la semilla aleatoria inicial.
- Ejecución completa del proceso de denoising con cualquier scheduler compatible con diffusers (DDPM, DDIM, PNDM, Euler, etc.), lo que permite comparar calidad y coste computacional.
- Entrenamiento y fine-tuning adicionales: al ser un checkpoint de diffusers, se puede continuar el entrenamiento o adaptar con DreamBooth/LoRA sobre un dataset propio.
- Base para añadir condicionamiento (clase o texto) modificando la U-Net y el pipeline.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo de razonamiento (thinking), visión de entrada, audio, vídeo ni salida estructurada.

## Casos de uso

- Docencia y aprendizaje de modelos de difusión: reproducir paso a paso el pipeline de la Unidad 1 del curso Diffusion Models Class, inspeccionando el scheduler, el ruido añadido en cada paso y la evolución de las muestras durante el denoising.
- Prueba de humo (smoke test) en integraciones de diffusers: al ocupar solo 0,1 GB y cargar en CPU, permite verificar que una instalación de diffusers, PyTorch o un entorno de CI funciona correctamente sin depender de checkpoints grandes.
- Generación de datos sintéticos para aumento de dataset: producir muestras adicionales de mariposas 64x64 para preentrenar o aumentar un clasificador de imágenes pequeño, teniendo en cuenta el riesgo de sesgo y de memorización por el reducido dominio del modelo.
- Comparación de schedulers e hiperparámetros: ejecutar el mismo modelo con DDPM, DDIM y otros schedulers, con distintos números de pasos y valores de guidance, para medir la relación entre coste (número de evaluaciones de la U-Net) y calidad de la muestra.
- Punto de partida para fine-tuning con DreamBooth o LoRA: adaptar el checkpoint a un concepto visual concreto con un dataset muy pequeño y pocos minutos de GPU, dado el bajo número de parámetros.
- Pruebas de rendimiento y benchmarking de hardware: medir latencia por paso y throughput de un modelo de difusión de 18,5 M de parámetros en CPU, GPU integrada, GPU de consumo o aceleradores edge, sin saturar la memoria del dispositivo.
- Prototipado de assets de baja resolución: generar bocetos 64x64 que después se reescalen o se utilicen como referencia en un pipeline de superresolución externo.
- Investigación sobre sesgos y cobertura de datasets pequeños: el modelo, entrenado sobre un dominio visual muy acotado, sirve para estudiar cómo un dataset homogéneo limita la diversidad de las muestras o provoca sobreajuste, un fenómeno relevante en difusión con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, IS, precision/recall ni ninguna otra métrica de calidad o diversidad, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 74 MB (18.536.323 parámetros x 4 bytes) y, con activaciones y estado del optimizador desactivado, el consumo se mantiene por debajo de 0,5 GB en lotes pequeños; en fp16, los pesos bajan a unos 37 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100. En la práctica, el modelo está muy por debajo de la capacidad de cualquier GPU moderna y no se aprovecha el paralelismo de las tarjetas de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El cuello de botella es el número de pasos de muestreo, no la memoria.
- Opciones de despliegue: diffusers con DDPMPipeline o DiffusionPipeline (carga directa desde el repositorio), PyTorch en local, exportación a ONNX Runtime u OpenVINO mediante Optimum, y despliegue en Hugging Face Spaces. No es compatible con llama.cpp, Ollama, vLLM ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa no verificada, con 18,5 M de parámetros y 64x64 píxeles, una única evaluación de la U-Net debería costar del orden de milisegundos en GPU y de decenas de milisegundos en CPU, por lo que un muestreo completo depende casi linealmente del número de pasos configurado (por ejemplo, 1000 pasos DDPM frente a 50 pasos DDIM). Estas cifras son estimaciones derivadas del tamaño del modelo y deben medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonghyuns/sd-class-butterflies-64 | 18.536.323 (dato real de safetensors) | 64x64 | Incondicional | MIT | Hugging Face, diffusers |
| google/ddpm-cifar10-32 | No disponible en la información proporcionada | 32x32 | Incondicional (clases CIFAR-10 aprendidas de forma implícita) | No disponible | Hugging Face, diffusers |
| google/ddpm-celebahq-256 | No disponible en la información proporcionada | 256x256 | Incondicional | No disponible | Hugging Face, diffusers |
| Otros checkpoints de la clase Diffusion Models (por ejemplo, variantes butterflies-64) | No disponible | 64x64 | Incondicional | No disponible | Hugging Face, diffusers |

Nota: los datos de los modelos comparativos no aparecen en la información proporcionada en esta consulta; las resoluciones se deducen del propio nombre del checkpoint y deben verificarse en sus respectivas model cards antes de citarlas.

## Limitaciones y advertencias

- Modelo de imagen, no de lenguaje: no acepta prompts de texto, no genera código ni texto y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Dominio extremadamente estrecho: genera únicamente imágenes de mariposas de 64x64; fuera de ese dominio la salida no tiene utilidad.
- Resolución baja: 64x64 píxeles limita el detalle, la nitidez y la aplicabilidad directa en producción sin un paso de superresolución.
- Riesgo de memorización y sobreajuste: al entrenarse sobre un conjunto de imágenes reducido, es plausible que el modelo reproduzca muestras próximas a las de entrenamiento, con las implicaciones de derechos de imagen que ello conlleva.
- Sesgos y diversidad no documentados: la model card no incluye ninguna evaluación de sesgos, cobertura de especies, colores o morfologías, ni métricas de diversidad de las muestras.
- Ausencia de métricas de calidad: no hay FID, IS ni comparaciones publicadas, por lo que no se puede afirmar objetivamente su calidad frente a alternativas.
- Herramienta educativa sin soporte: 18 descargas y 0 likes, sin mantenimiento declarado ni issues de referencia; no es un modelo con garantías para producción.
- Licencia MIT: permite uso comercial y modificación, pero la licencia del modelo no cubre los derechos del dataset de entrenamiento utilizado, que no se especifica en la model card y debe verificarse por separado.
- Sin información de entrenamiento reproducible: no se documentan dataset, número de pasos, hiperparámetros ni el pipeline de entrenamiento, lo que dificulta auditar el modelo.
- Advertencia sobre "alucinación": en este contexto no aplica el término tal cual, pero sí el equivalente en generación de artefactos, texturas irreales y morfologías anatómicamente imposibles.
- Riesgo de confusión en catálogos de modelos: por su nombre, puede confundirse con un modelo basado en Stable Diffusion, cuando en realidad es un DDPM pequeño de la clase de difusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonghyuns/sd-class-butterflies-64
- Repositorio del curso Diffusion Models Class: https://github.com/huggingface/diffusion-models-class
- Documentación de DDPMPipeline en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentación de UNet2DModel en diffusers: https://huggingface.co/docs/diffusers/api/models/unet2d

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos eran páginas de soporte de Microsoft sin relación con el modelo), por lo que no se incluyen enlaces adicionales de papers, blogs o demos.
