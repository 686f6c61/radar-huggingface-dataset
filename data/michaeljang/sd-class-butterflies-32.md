# michaeljang/sd-class-butterflies-32

## Resumen

michaeljang/sd-class-butterflies-32 es un modelo de difusión para generación incondicional de imágenes de mariposas a 32x32 píxeles, publicado en Hugging Face por el usuario michaeljang. Se trata de un DDPM (Denoising Diffusion Probabilistic Model) de 18.536.323 parámetros, con un repositorio de 0,1 GB, licencia MIT y pesos en formato safetensors, consumible con la librería diffusers a través de la clase DDPMPipeline.

Su relevancia es fundamentalmente didáctica: la propia model card lo identifica como el modelo de la Unidad 1 del curso Diffusion Models Class de Hugging Face, cuyo objetivo es entrenar un modelo de difusión desde cero sobre un conjunto reducido de imágenes de 32x32. No compite con los generadores de imagen de gran escala, sino que sirve como referencia mínima y reproducible para recorrer el pipeline completo de difusión: proceso forward, schedule de ruido, red U-Net y muestreo iterativo.

El modelo no acepta prompts de texto; la generación es puramente incondicional, es decir, produce muestras aleatorias del dominio aprendido. Con 24 descargas y 0 likes en el momento de redactar esta ficha, su uso está orientado a docencia, experimentación y validación de infraestructura de inferencia, no a producción creativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de difusión (DDPM) para generación de imagen incondicional |
| Parámetros totales | 18.536.323 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors en precisión completa) |
| Idiomas soportados | no disponible / no aplica (no procesa texto ni lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Resolución de salida | 32 x 32 píxeles (según el identificador del modelo) |
| Pipeline en diffusers | DDPMPipeline (`unconditional-image-generation`) |
| Librería | diffusers |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 24 / 0 |
| Fecha de creación / actualización | 19-09-2026 / 19-09-2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia DDPM clásica implementada en diffusers: una U-Net que predice el ruido añadido en cada paso temporal, con embeddings sinusoidales del timestep, bloques residuales y mecanismos de autoatención en determinadas resoluciones, entrenada con el objetivo simplificado de error cuadrático medio sobre el ruido (predicción de epsilon) y un schedule de ruido lineal o coseno. El muestreo se realiza de forma iterativa con el scheduler DDPM, que por defecto en diffusers emplea 1000 pasos de denoising. La model card no detalla la configuración exacta de canales, profundidad ni el schedule utilizado, por lo que esos extremos quedan como no disponibles.

Respecto a los datos, la model card no especifica el dataset exacto, el número de imágenes, el número de pasos de entrenamiento ni si se aplicó algún ajuste posterior. Las etiquetas `diffusion-models-class` y el identificador `butterflies-32` sitúan el modelo en el flujo de la Unidad 1 del curso de Hugging Face, orientado a entrenar un DDPM sobre un subconjunto de imágenes de mariposas a baja resolución. No se menciona RLHF, DPO ni fine-tuning por preferencias, algo por otra parte poco habitual en modelos de difusión incondicional. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación de pasos): el interés del modelo reside precisamente en ser una implementación de referencia del método original.

## Capacidades

- Generación incondicional de imágenes de 32x32 píxeles dentro del dominio aprendido (mariposas y patrones visualmente similares).
- Muestreo iterativo mediante DDPMPipeline; la API estándar de diffusers permite fijar la semilla con `torch.Generator` para reproducir resultados.
- No dispone de codificador de texto: no acepta prompts, instrucciones ni etiquetas de clase.
- No implementa classifier-free guidance, al no existir condicionamiento que guiar.
- No soporta tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de lenguaje, audio o vídeo.
- No incorpora modo "thinking" ni cadena de razonamiento.
- Es reentrenable: al ser un modelo pequeño y con licencia MIT, puede usarse como punto de partida para fine-tuning sobre otros dominios de 32x32 (iconos, símbolos, texturas, micrografías).

## Casos de uso

- Docencia de modelos generativos: permite ejecutar el ciclo completo de difusión (forward, predicción de ruido, muestreo) en clase o en cuadernos interactivos, con tiempos de entrenamiento e inferencia asumibles en CPU o en una GPU modesta.
- Validación de infraestructura de despliegue: con 0,1 GB de repositorio y menos de 1 GB de VRAM en inferencia, es ideal para probar contenedores, sistemas de caché de pesos, orquestación de GPU y pipelines de CI/CD antes de desplegar modelos de cientos de gigabytes.
- Generación de sprites y assets retro: produce patrones de 32x32 aprovechables como texturas, iconos o sprites en prototipos de videojuegos de estética de 8/16 bits, siempre con revisión manual posterior.
- Aumento de datos para clasificadores de baja resolución: las muestras sintéticas pueden ampliar datasets pequeños de imágenes de 32x32, aunque requiere filtrar duplicados y artefactos antes de incorporarlas.
- Fine-tuning sobre dominios propios: al ser un DDPM pequeño con licencia permisiva, se puede continuar su entrenamiento con un dataset propio de 32x32 para obtener un generador específico de dominio en pocas horas de GPU.
- Investigación sobre samplers y schedules: su reducido coste por muestra permite comparar DDPM, DDIM o PNDM, y distintos schedules de ruido, en minutos en lugar de horas.
- Demos interactivos en Hugging Face Spaces: la inferencia cabe en CPU, de modo que una demo pública con Gradio puede funcionar sin GPU dedicada ni coste elevado.
- Pruebas de optimización y cuantización: sirve como banco de pruebas para exportar a ONNX, aplicar `torch.compile` o medir el impacto de distintas precisiones sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, Inception Score, precision/recall de muestras ni ninguna otra métrica cuantitativa, y las búsquedas web realizadas no devolvieron evaluaciones independientes del modelo.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 74 MB en fp32, 37 MB en fp16/bf16 y 18,5 MB en int8, calculados a partir de los 18.536.323 parámetros.
- VRAM total en inferencia: por debajo de 1 GB contando activaciones a 32x32 y el contexto de CUDA; en la práctica, el cuello de botella es el número de pasos de muestreo, no la memoria.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer sirve, incluidas GTX 1050 Ti, RTX 3050, RTX 3060 o superiores; también funciona en CPU y en Apple Silicon vía MPS. Tarjetas como A100, H100, L4 o T4 son innecesarias y solo tienen sentido si se procesan lotes muy grandes.
- Despliegue: diffusers con `DDPMPipeline.from_pretrained(...)` es la vía nativa; también es viable la exportación a ONNX o su integración en una API propia con FastAPI o Gradio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, motores orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. Dependen linealmente del número de pasos del scheduler (1000 por defecto en DDPM) y del lote, y no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Resolución | Parámetros | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|---|
| michaeljang/sd-class-butterflies-32 | Difusión incondicional | 32x32 | 18.536.323 | MIT | DDPMPipeline | Hugging Face |
| google/ddpm-cifar10-32 | Difusión incondicional | 32x32 | no disponible en la información proporcionada | no disponible en la información proporcionada | DDPMPipeline | Hugging Face |
| google/ddpm-celebahq-256 | Difusión incondicional | 256x256 | no disponible en la información proporcionada | no disponible en la información proporcionada | DDPMPipeline | Hugging Face |

Los tres modelos pertenecen a la misma familia de DDPM incondicionales y comparten interfaz en diffusers. La diferencia principal es el dominio de entrenamiento (mariposas frente a CIFAR-10 o rostros de celebridades) y la resolución de salida, muy superior en el caso de CelebA-HQ. No se dispone de datos verificados de parámetros, licencia ni métricas de calidad para las alternativas dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de condicionamiento: no se puede pedir una imagen concreta, ni por texto ni por clase; toda salida es una muestra aleatoria.
- Resolución muy baja (32x32) y calidad limitada: las imágenes presentan artefactos, bordes difusos y estructura poco definida, incluso dentro del dominio aprendido.
- Riesgo elevado de sobreajuste y de memorización: al tratarse de un modelo de 18,5 millones de parámetros entrenado sobre un conjunto de imágenes pequeño y de un único dominio, puede reproducir muestras muy cercanas a las de entrenamiento.
- Sesgo de dominio y de captura: previsiblemente aprende mariposas de colección, con fondo uniforme e iluminación controlada, lo que no representa individuos en su hábitat ni otras especies, poses o condiciones de luz.
- Alucinación en sentido visual: el modelo puede generar anatomías imposibles (número de alas, simetrías rotas, patrones incoherentes) sin ninguna señal de confianza asociada.
- Sin métricas publicadas: no existe FID ni ninguna otra medida objetiva de calidad, por lo que no se puede afirmar su rendimiento relativo frente a otros generadores.
- Uso lingüístico nulo: no procesa ni genera texto, por lo que no aplica ninguna consideración multilingüe.
- Licencia MIT sobre los pesos, que permite uso comercial y modificación, pero la model card no declara la licencia del dataset de entrenamiento; conviene verificar ese punto antes de un uso comercial.
- Sin garantías ni soporte: es un artefacto didáctico con 0 likes y 24 descargas, sin mantenimiento ni validación por parte de la comunidad.
- No apto para producción de imagen de calidad: cualquier flujo real requeriría un upscaler externo y una revisión manual, además de asumir un coste de muestreo iterativo elevado en relación con el resultado obtenido.
- Fechas de creación y actualización registradas como 19-09-2026, posteriores a la fecha de redacción de esta ficha; se reproducen tal cual figuran en la información de origen.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/michaeljang/sd-class-butterflies-32
- Repositorio del curso Diffusion Models Class (referenciado en la model card): https://github.com/huggingface/diffusion-models-class
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a documentación de AppSheet y Google Ads, sin relación con el modelo, por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este identificador.
