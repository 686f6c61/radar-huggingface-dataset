# nchatto/sd-class-butterflies-32

## Resumen

sd-class-butterflies-32 es un modelo de difusión de generación incondicional de imágenes, publicado por el usuario nchatto en HuggingFace. Se trata de un modelo diminuto, con 18.536.323 parámetros, entrenado para producir imágenes de mariposas a baja resolución. Forma parte del ejercicio de la Unidad 1 de la Diffusion Models Class de Hugging Face, un curso práctico en el que los participantes entrenan su propio modelo DDPM desde cero y lo publican en el Hub.

El modelo no acepta prompts de texto: al ser incondicional, genera muestras aleatorias del dominio aprendido (mariposas) a partir de ruido gaussiano puro. Su interés no reside en la calidad de las imágenes, sino en su tamaño extremadamente reducido, que lo convierte en una herramienta didáctica y en un banco de pruebas muy ligero para experimentar con schedulers, muestreo, fine-tuning y técnicas de aceleración de difusión.

Al tratarse de un modelo de 18,5 millones de parámetros y 0,1 GB de repositorio, cabe en cualquier hardware, incluida una CPU convencional o un dispositivo de gama baja. Su licencia MIT permite uso comercial sin restricciones, aunque la utilidad práctica del modelo en producción es muy limitada por su resolución y su naturaleza incondicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión DDPM (Denoising Diffusion Probabilistic Model) con red UNet como backbone de predicción de ruido |
| Parámetros totales | 18.536.323 |
| Longitud de contexto | No aplica: modelo de generación de imágenes sin entrada de texto |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors (precisión completa) |
| Idiomas soportados | No aplica: no procesa texto |
| Licencia | MIT |
| Formato de pesos | Safetensors (PyTorch, librería diffusers) |
| Resolución de imagen | 32x32 (según la nomenclatura del repositorio y la configuración habitual de la Unidad 1 del curso; la model card no lo explicita) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | `unconditional-image-generation` (`DDPMPipeline`) |
| Fecha de creación en el Hub | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusión DDPM: una red UNet aprende a predecir el ruido añadido a una imagen en cada paso de un proceso de difusión directo, y en inferencia se invierte ese proceso partiendo de ruido gaussiano para obtener una muestra. La librería diffusers expone el modelo mediante `DDPMPipeline`, que por defecto aplica el scheduler DDPM con el número de pasos configurado en el propio pipeline. Con 18,5 millones de parámetros, se trata de una UNet de capacidad muy reducida en comparación con los modelos de difusión de última generación.

La model card no documenta el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, los hiperparámetros (tasa de aprendizaje, batch size, número de épocas) ni si se aplicaron técnicas de post-entrenamiento como fine-tuning con preferencias. Tampoco se especifica si se usó una media exponencial de los pesos (EMA) para la inferencia, práctica habitual en este tipo de ejercicios. El único dato funcional aportado por el autor es que se trata de un modelo de generación incondicional de mariposas, entrenado en el marco de la Unidad 1 de la Diffusion Models Class de Hugging Face.

## Capacidades

- Generación de imágenes incondicional: produce muestras de mariposas a partir de ruido aleatorio, sin ningún tipo de condicionamiento textual, de clase o estructural.
- Muestreo configurable: al estar integrado en diffusers, permite intercambiar schedulers (por ejemplo DDPM por DDIM) y variar el número de pasos de inferencia.
- Fine-tuning: la arquitectura y el pipeline permiten reentrenar o adaptar el modelo a un dominio distinto con un coste computacional muy bajo.
- Experimentación con espacios latentes de ruido: admite interpolación entre semillas y exploración del espacio de ruido inicial.
- No soporta generación texto-imagen: no existe codificador de texto ni cross-attention sobre prompts.
- No soporta tool calling, function calling ni uso como agente: es exclusivamente un modelo generativo de imágenes.
- Sin capacidades multilingües, de razonamiento, de código ni de matemáticas.
- No dispone de modo de razonamiento (thinking mode), audio ni entrada multimodal.

## Casos de uso

- Docencia y aprendizaje de modelos de difusión: permite reproducir de principio a fin el ciclo de entrenamiento, muestreo e integración en el Hub con un coste de cómputo mínimo, lo que lo hace idóneo para aulas y talleres.
- Pruebas de humo (smoke tests) en pipelines de generación: por su tamaño (0,1 GB) y sus 18,5 millones de parámetros, se puede descargar y ejecutar en segundos dentro de una pipeline de CI/CD para verificar que la integración con diffusers funciona correctamente.
- Generación de datos sintéticos para aumentar datasets de clasificación de mariposas: las muestras pueden usarse como aumento de datos de baja resolución en experimentos controlados de clasificación.
- Investigación en aceleración del muestreo: sirve como banco de pruebas barato para comparar schedulers, destilación de pasos, consistency models o métodos de reducción del número de evaluaciones de la UNet.
- Experimentos de fine-tuning y personalización: al ser tan pequeño, se puede adaptar a un dominio propio (por ejemplo, otro tipo de insecto o de patrón) en una única GPU consumer e incluso en CPU en tiempos razonables.
- Generación de assets de baja resolución para prototipos: útil para maquetar interfaces, videojuegos o demos donde se necesitan imágenes de 32x32 puramente decorativas antes de invertir en un modelo de mayor calidad.
- Estudio de diversidad y colapso de modo en modelos generativos pequeños: permite analizar cuánta variedad produce el modelo respecto al conjunto de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad como FID, IS o precision/recall, ni comparaciones cuantitativas con otros modelos. Tampoco se han encontrado resultados de benchmarks en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión habitual. En float32, los pesos ocupan aproximadamente 74 MB (18.536.323 parámetros × 4 bytes); en float16, unos 37 MB. El pico de memoria durante el muestreo con 32x32 es marginal.
- GPU recomendadas: cualquier GPU sirve; no se requiere una GPU de centro de datos. Funciona en RTX 4090, RTX 3060, GTX 1650, GPUs integradas e incluso en aceleradores de borde.
- Cabe holgadamente en GPU consumer: sí, en todas las gamas, incluidas tarjetas con 4 GB o menos de VRAM.
- Ejecución en CPU: viable. El modelo es lo bastante pequeño como para generar muestras en CPU en tiempos del orden de segundos por imagen, dependiendo del número de pasos de muestreo.
- Opciones de despliegue: `DDPMPipeline` de diffusers (Python/PyTorch), integración directa con la API de HuggingFace y exportación a otros runtimes de PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no hay datos publicados. Como aproximación orientativa, con 1.000 pasos DDPM sobre imágenes de 32x32, la generación se sitúa en el orden de décimas de segundo en una GPU moderna y de segundos en CPU; reducir los pasos con DDIM disminuye proporcionalmente el coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchatto/sd-class-butterflies-32 | 18,5 M | 32x32 | Difusión DDPM incondicional | MIT | HuggingFace |
| google/ddpm-cifar10-32 | ~35,7 M | 32x32 | Difusión DDPM incondicional | Apache-2.0 | HuggingFace |
| google/ddpm-celebahq-256 | ~113,7 M | 256x256 | Difusión DDPM incondicional | Apache-2.0 | HuggingFace |

Los datos de los modelos de comparación proceden de la información pública de sus repositorios y no se han verificado en el contexto de esta ficha. No se dispone de métricas de rendimiento comparables entre ellos. Como alternativa dentro del mismo ejercicio del curso, existen numerosos repositorios de la comunidad con la misma configuración y distintos datasets de entrenamiento, pero no se ha identificado ninguno concreto en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse con un dataset concreto de mariposas, el modelo reproduce únicamente las especies, colores y morfologías presentes en dicho dataset, con la diversidad que este tuviera.
- Riesgo de alucinación: en el contexto de generación de imágenes, el equivalente es la producción de morfologías anatómicamente imposibles o artefactos; con una UNet de 18,5 millones de parámetros y 32x32 píxeles, la calidad de las muestras es necesariamente baja.
- Limitaciones de resolución: las imágenes se generan a 32x32 píxeles, insuficiente para cualquier uso visual en producción real.
- Ausencia de condicionamiento: no se puede dirigir la generación mediante texto, etiquetas de clase ni imágenes de referencia; todas las muestras son aleatorias dentro del dominio aprendido.
- Limitaciones de idioma: no aplica, ya que el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No se han identificado restricciones adicionales.
- Caveats para producción: la model card no documenta el dataset de entrenamiento ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de posibles problemas de contenido en las muestras. El modelo se publicó como ejercicio académico, no como artefacto listo para producción.
- Búsqueda web sin resultados relevantes: los resultados obtenidos en la búsqueda no guardan relación con el modelo (tratan sobre el atajo de teclado Windows+E), por lo que no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchatto/sd-class-butterflies-32
- Diffusion Models Class (repositorio del curso, referenciado en la model card): https://github.com/huggingface/diffusion-models-class
- Documentación de `DDPMPipeline` en diffusers: no disponible en la información proporcionada
- Paper de DDPM (Ho et al., 2020): no disponible en la información proporcionada
- Demos, blogs o repos adicionales: no disponible; la búsqueda web realizada no devolvió resultados relacionados con el modelo
