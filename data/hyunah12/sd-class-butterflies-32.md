# hyunah12/sd-class-butterflies-32

## Resumen

`hyunah12/sd-class-butterflies-32` es un modelo de difusión para generación de imágenes incondicional, es decir, produce imágenes sin aceptar ningún tipo de prompt, texto o condición de entrada. Lo publica el usuario hyunah12 en Hugging Face como entregable de la Unidad 1 del curso Diffusion Models Class de Hugging Face, y su dominio de entrenamiento está restringido a mariposas. El sufijo "32" hace referencia a la resolución de trabajo: 32 x 32 píxeles.

Técnicamente es un DDPM (Denoising Diffusion Probabilistic Model) implementado sobre la librería `diffusers` y expuesto mediante el pipeline `DDPMPipeline`. El checkpoint contiene 18.536.323 parámetros reales (aproximadamente 18,5 millones), lo que lo sitúa en la categoría de modelos minúsculos: el repositorio completo ocupa 0,1 GB y puede ejecutarse en CPU en tiempos razonables. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales por parte del autor.

Su relevancia es fundamentalmente didáctica y de referencia. No compite con modelos de generación de imagen de producción, pero es útil como implementación mínima y reproducible de un pipeline de difusión completo, como banco de pruebas para experimentar con planificadores (schedulers), pasos de inferencia y estrategias de muestreo, y como caso de estudio de modelos generativos pequeños que caben en cualquier hardware. La model card es extremadamente escueta y no documenta hiperparámetros de entrenamiento, composición exacta del dataset ni número de pasos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM con red U-Net convolucional (familia `UNet2DModel` de `diffusers`), sin condicionamiento cruzado |
| Parametros totales | 18.536.323 (dato real extraído de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen sin entrada de texto) |
| Tipos de cuantizacion | no disponible; el repositorio publica únicamente el checkpoint en precisión completa |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, con `model_index.json` y configuraciones JSON asociadas (checkpoint estándar de `diffusers`) |
| Resolucion de salida | 32 x 32 píxeles |
| Pipeline | `DDPMPipeline` (unconditional-image-generation) |
| Planificador | no especificado en la model card; la clase emplea `DDPMScheduler` por defecto |
| Dataset de entrenamiento | no documentado en la model card; el contexto de la clase apunta a un subconjunto de mariposas tipo `huggan/smithsonian_butterflies_subset` |
| Tamano del repositorio | 0,1 GB |
| Libreria | diffusers (PyTorch) |
| Descargas / likes | 16 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de difusión DDPM: una red U-Net convolucional que aprende a predecir el ruido añadido en cada paso de un proceso directo de difusión gaussiana, y un proceso inverso iterativo que parte de ruido puro y lo va desruidificando hasta obtener una imagen. Al tratarse de un modelo incondicional, la U-Net no incorpora mecanismos de atención cruzada ni embeddings de texto: solo recibe el tensor de imagen ruidosa y el embedding temporal del paso de difusión. Esto explica su tamaño reducido (18,5 millones de parámetros) frente a los cientos de millones o miles de millones de los modelos texto-a-imagen.

La model card no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, las épocas, el optimizador ni si hubo fases de ajuste fino con RLHF o DPO (ninguna de estas técnicas se aplica habitualmente a modelos de difusión incondicional). Tampoco se documentan innovaciones técnicas: no hay decodificación especulativa, atención lineal ni destilación de pasos. El modelo se enmarca en el flujo de trabajo de la Unidad 1 del Diffusion Models Class, cuyo objetivo es entrenar un DDPM desde cero sobre un conjunto de datos pequeño.

## Capacidades

- Generación de imágenes incondicional: produce muestras de 32 x 32 píxeles de mariposas a partir de ruido aleatorio, sin posibilidad de dirigir el contenido.
- Muestreo configurable: al usar `DDPMPipeline` se pueden modificar el número de pasos de inferencia, el scheduler y la semilla, lo que permite explorar el compromiso entre calidad y coste computacional.
- Variabilidad controlada por semilla: distintas semillas producen salidas distintas y reproducibles.
- Sin soporte de tool calling ni function calling: es un modelo puramente generativo de imagen, no expone interfaz de herramientas.
- Sin soporte de agentes ni razonamiento multi-paso: no procesa instrucciones ni mantiene estado conversacional.
- Sin capacidades multilingües: no hay entrada ni salida de texto.
- Sin modo "thinking", visión de entrada, audio ni cualquier otra modalidad adicional.
- Adecuado como componente didáctico y como referencia mínima para replicar un pipeline de difusión completo de principio a fin.

## Casos de uso

- Docencia de modelos de difusión: sirve para mostrar en clase, paso a paso, cómo funciona un DDPM completo (proceso directo, proceso inverso y muestreo) sin la complejidad de un modelo texto-a-imagen.
- Pruebas de integración de `diffusers`: al ser un checkpoint diminuto, es ideal para validar instalaciones, versiones de la librería y compatibilidad de pipelines en entornos de CI sin consumir apenas recursos.
- Ablaciones de schedulers y pasos de inferencia: permite comparar `DDPMScheduler`, `DDIMScheduler` u otros planificadores sobre el mismo modelo y medir el impacto en la calidad de la muestra en minutos y en CPU.
- Generación de sprites e iconos de estilo pixel art para prototipos: sus 32 x 32 píxeles encajan directamente en prototipos de videojuegos o interfaces retro antes de encargar arte final.
- Aumento de datos sintéticos de bajo coste: puede generar parches de 32 x 32 para tareas auxiliares de clasificación o para probar pipelines de aumento de datos, siempre que el dominio sea compatible con mariposas.
- Pruebas de rendimiento y latencia de infraestructura: por su tamaño, es útil para medir el coste por paso de difusión en distintas GPU, CPU o aceleradores, y para comparar frameworks de ejecución.
- Investigación sobre memorización y privacidad: al ser un modelo pequeño entrenado sobre un dataset reducido, permite estudiar hasta qué punto un modelo de difusión reproduce ejemplos de entrenamiento.
- Demostraciones web de bajo consumo: puede desplegarse en una demo interactiva (por ejemplo, con Gradio) que genere imágenes al instante sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, IS, ni ninguna otra métrica de calidad, y tampoco se han encontrado evaluaciones externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 74 MB para los pesos en fp32 (18,5 millones de parámetros x 4 bytes) y alrededor de 37 MB en fp16. Sumando activaciones y buffers del pipeline, el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere VRAM específica. Funciona en tarjetas integradas, en una GTX 1050, en una RTX 3060 o en una RTX 4090 sin diferencias funcionales, solo de velocidad.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en aceleradores integrados.
- Ejecución en CPU: totalmente viable. Es uno de los pocos modelos de difusión que se pueden muestrear en CPU en tiempos aceptables para uso interactivo.
- Opciones de despliegue: `diffusers` con PyTorch (opción nativa), exportación a ONNX Runtime, conversión a Core ML para dispositivos Apple, o integración en una app Gradio/Streamlit. Motores orientados a LLM como vLLM o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no hay mediciones publicadas. Como estimación orientativa a partir del tamaño del modelo y del número de pasos por defecto del `DDPMScheduler` (1000 pasos de desruidificación), el muestreo en GPU debería completarse en un orden de magnitud inferior al segundo, mientras que en CPU puede requerir desde unos pocos segundos hasta decenas de segundos según el hardware y el número de pasos configurado. Estas cifras son estimaciones, no medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Notas |
|---|---|---|---|---|---|
| hyunah12/sd-class-butterflies-32 | 18,5 M | 32 x 32 | incondicional | MIT | Modelo didáctico del Diffusion Models Class |
| hf-internal-testing/ddpm-ema-butterflies-32 | orden de 18 M (referencia externa, no verificada) | 32 x 32 | incondicional | no disponible | Checkpoint de pruebas de Hugging Face sobre el mismo dominio |
| google/ddpm-cifar10-32 | aproximadamente 35,7 M (referencia externa) | 32 x 32 | incondicional | no disponible | Entrenado en CIFAR-10, dominio más general |
| google/ddpm-celebahq-256 | aproximadamente 114 M (referencia externa) | 256 x 256 | incondicional | no disponible | Mayor resolución y mayor coste computacional |

Los datos de parámetros de los modelos comparados provienen de referencias externas y no se han verificado en esta ficha; se ofrecen solo como orientación de orden de magnitud. La ventaja principal del modelo analizado frente a las alternativas es su licencia MIT explícita y su tamaño mínimo, que lo hacen trivial de ejecutar; su desventaja es la resolución de 32 x 32 y un dominio limitado a mariposas.

## Limitaciones y advertencias

- Resolución muy baja: 32 x 32 píxeles es insuficiente para cualquier aplicación visual de producción; las muestras son útiles únicamente como prototipo, prueba o material didáctico.
- Dominio cerrado: el modelo solo ha visto imágenes de mariposas y no generaliza a otras categorías visuales.
- Sin control sobre la salida: al ser incondicional, no se puede pedir una mariposa de un color, forma o especie concreta.
- Model card mínima: no se documentan hiperparámetros, número de pasos de entrenamiento, tamaño efectivo del dataset ni criterios de selección del checkpoint, lo que dificulta reproducir el entrenamiento.
- Riesgo de memorización: con datasets pequeños y modelos pequeños, existe la posibilidad de que las muestras se parezcan demasiado a ejemplos de entrenamiento. No se ha realizado ninguna auditoría de privacidad publicada.
- Procedencia de los datos no verificada: el dataset de entrenamiento no está declarado explícitamente, por lo que no se puede confirmar la licencia de las imágenes originales. La licencia MIT del repositorio cubre los pesos, no necesariamente los datos subyacentes.
- Ausencia de métricas: sin FID, IS ni evaluaciones humanas, la calidad real de las muestras no está cuantificada.
- Anomalía en los metadatos: las fechas de creación y actualización del repositorio (2026-09-19) son posteriores a la fecha de publicación de esta ficha, lo que sugiere un error en los metadatos de Hugging Face.
- Sesgos: no evaluados ni documentados. Al estar limitado a un único dominio, cualquier sesgo de representación del dataset de mariposas se trasladaría directamente a las muestras.
- Alucinación: el concepto no aplica en el sentido de los modelos de lenguaje, pero sí existe el fenómeno equivalente de generar imágenes morfológicamente inconsistentes, con anatomías de mariposa incorrectas o patrones de alas imposibles.
- Uso comercial: la licencia MIT lo permite, pero se recomienda verificar la procedencia del dataset antes de explotar comercialmente las imágenes generadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyunah12/sd-class-butterflies-32
- Repositorio del Diffusion Models Class: https://github.com/huggingface/diffusion-models-class
- Documentación del pipeline `DDPMPipeline` en `diffusers`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentación del planificador `DDPMScheduler`: https://huggingface.co/docs/diffusers/api/schedulers/ddpm
- Dataset de referencia usado habitualmente en la Unidad 1: https://huggingface.co/datasets/huggan/smithsonian_butterflies_subset
- Modelo de comparación de Hugging Face para pruebas: https://huggingface.co/hf-internal-testing/ddpm-ema-butterflies-32
- Modelo DDPM de CIFAR-10 de Google: https://huggingface.co/google/ddpm-cifar10-32

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo. Los enlaces obtenidos correspondían a manuales de termostatos de calefacción (Vaillant VRC MF-TEC) y no guardan relación con el contenido de esta ficha, por lo que se han descartado.
