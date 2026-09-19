# adiantum0407/sd-class-butterflies-32

## Resumen

`adiantum0407/sd-class-butterflies-32` es un modelo de difusión de generación de imagen incondicional, publicado por el usuario adiantum0407 en Hugging Face. Se trata de un ejercicio de la Unidad 1 del curso Diffusion Models Class de Hugging Face, tal y como indica la etiqueta `diffusion-models-class` de su model card. El modelo genera imágenes pequeñas de mariposas sin ningún tipo de condicionamiento textual: no acepta un prompt ni una imagen de entrada, únicamente ruido gaussiano aleatorio.

Técnicamente es un DDPM (Denoising Diffusion Probabilistic Model) implementado con `UNet2DModel` y consumido a través de `DDPMPipeline` de la librería diffusers. El checkpoint contiene 18.536.323 parámetros (dato extraído del fichero safetensors), lo que lo sitúa en la categoría de modelos de juguete: cabe en cualquier GPU e incluso se ejecuta en CPU. Por la convención de nombres del curso, el sufijo "32" apunta a una resolución de entrenamiento y salida de 32 × 32 píxeles, aunque la model card no lo confirma explícitamente.

Su relevancia es exclusivamente didáctica y de experimentación: sirve como ejemplo mínimo y reproducible del ciclo completo de difusión (forward process, predicción de ruido, muestreo iterativo), no como generador de imágenes de calidad de producción. Con 24 descargas, 0 likes y una model card de cuatro líneas, debe considerarse un artefacto académico sin validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet2DModel (difusión DDPM, predicción de ruido) |
| Parámetros totales | 18.536.323 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo incondicional, sin entrada de texto) |
| Resolución de salida | 32 × 32 píxeles (inferido del nombre del checkpoint; no confirmado en la model card) |
| Pasos de muestreo por defecto | 1.000 (valor por defecto de `DDPMPipeline`) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica (generación de imagen incondicional; sin componente de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch, librería diffusers) |
| Pipeline | `DDPMPipeline` (unconditional-image-generation) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 24 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un `UNet2DModel` de diffusers: una red totalmente convolucional con conexiones residuales, mecanismos de atención en los niveles de menor resolución y conexiones de salto (skip connections) entre el codificador y el decodificador. El entrenamiento sigue el esquema DDPM clásico: se añade ruido gaussiano a las imágenes en `T` pasos (habitualmente 1.000) y la red aprende a predecir el ruido introducido en cada paso, de modo que el muestreo se realiza partiendo de ruido puro e iterando el proceso inverso. La configuración exacta de canales, número de bloques y pasos de difusión no está documentada en la model card, por lo que se marca como no disponible.

Tampoco se documentan los datos de entrenamiento: la model card no especifica el dataset, el número de tokens o imágenes vistas, el número de épocas, la tasa de aprendizaje ni si hubo fases de ajuste posteriores. Dado el contexto (Unidad 1 del Diffusion Models Class), lo esperable es un subconjunto del dataset Smithsonian de mariposas de Hugging Face remuestreado a 32 × 32, entrenado durante un número reducido de épocas en una GPU gratuita, pero esto es una inferencia a partir del nombre y de las etiquetas del repositorio, no un dato confirmado. No hay constancia de RLHF, DPO ni de ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de imágenes incondicionales de 32 × 32 píxeles: produce una imagen a partir de ruido aleatorio, sin prompt ni entrada adicional.
- Generación por lotes: el pipeline permite generar varias imágenes simultáneamente (`num_images_per_prompt` o bucle con `batch_size`), útil para inspección cualitativa.
- Reproducibilidad: acepta un generador de PyTorch (`torch.Generator`) con semilla fija, lo que permite repetir exactamente la misma muestra.
- Control del número de pasos de muestreo: se puede reducir de 1.000 a unos cientos de pasos a cambio de menor calidad, lo que acelera pruebas.
- Integración nativa con el ecosistema diffusers: `DDPMPipeline.from_pretrained()` y guardado con `save_pretrained()`.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo "thinking", sin entrada de visión, sin audio, sin edición de imagen ni condicionamiento por clase.

## Casos de uso

- Material didáctico sobre difusión: es su uso real. Permite a un estudiante inspeccionar un DDPM completo de 18,5 M de parámetros, visualizar el ruido en distintos timesteps y entender el proceso de muestreo sin necesidad de hardware dedicado.
- Prueba de humo (smoke test) en CI/CD de código de difusión: al pesar ~74 MB en fp32 y ejecutarse en CPU en segundos, es un candidato razonable para verificar que un pipeline de inferencia, un wrapper propio o una exportación a ONNX siguen funcionando tras un cambio de código.
- Benchmarking de hardware y de eficiencia energética: sirve como carga mínima y reproducible para medir latencia por paso de difusión en distintas GPU o aceleradores sin que el cuello de botella sea el tamaño del modelo.
- Prototipado de interfaces y maquetas: para rellenar galerías, placeholders o demos de producto con imágenes sintéticas de 32 × 32 sin depender de servicios externos ni de licencias de terceros.
- Generación de sprites para prototipos de videojuegos retro: la salida de 32 × 32 encaja en la rejilla de sprites de estilo pixel art, aunque la calidad final está limitada por el entrenamiento y el modelo no permite pedir una forma o color concreto.
- Investigación sobre hiperparámetros de difusión: al ser tan pequeño, permite ejecutar barridos de número de pasos, schedulers o estrategias de muestreo completos en minutos, con resultados comparables entre configuraciones.
- Aumento de datos a pequeña escala en experimentos controlados: con las cautelas oportunas (no hay métricas de diversidad ni FID publicadas), puede usarse para estudiar si imágenes sintéticas de un dominio muy concreto mejoran un clasificador de juguete.
- Docencia de despliegue de modelos: ilustra el empaquetado safetensors + diffusers, la carga desde el Hub y la integración con Optimum/ONNX Runtime en un caso cuyo tamaño no oculta los conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, IS, precisión de muestreo ni ninguna otra métrica, y los resultados de la búsqueda web no contienen referencias al modelo. No se dispone de comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- Pesos en fp32: 18.536.323 parámetros × 4 bytes ≈ 74 MB (≈ 71 MiB). En fp16/bf16, ≈ 37 MB.
- Memoria de activaciones: insignificante a 32 × 32; crece de forma aproximadamente lineal con el tamaño de lote.
- VRAM estimada para inferencia: menos de 1 GB incluyendo el pipeline completo, incluso con lotes moderados.
- GPU recomendadas: cualquiera. Funciona en RTX 3060/4060, T4, A100, H100 y también en GPU integradas. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; el factor limitante no es la memoria, sino el número de pasos de muestreo.
- CPU: plenamente viable. Los 1.000 pasos por defecto son el principal coste temporal.
- Opciones de despliegue: `DDPMPipeline` de diffusers (PyTorch), exportación a ONNX con Optimum y ejecución con ONNX Runtime, o exportación a TorchScript. vLLM, llama.cpp, Ollama y TGI no son aplicables (están orientados a modelos de lenguaje, no a difusión).
- Latencia y throughput: no hay mediciones publicadas. Como orden de magnitud, con 1.000 pasos de muestreo, en GPU la generación de una imagen debería resolverse en el rango de 1 a 3 segundos, y en CPU en el rango de decenas de segundos; estas cifras son estimaciones orientativas no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adiantum0407/sd-class-butterflies-32 | 18.536.323 | 32 × 32 (inferido) | Ninguno (incondicional) | MIT | Repositorio público, 24 descargas, 0 likes |
| hf-internal-testing/ddpm-ema-butterflies-128 | no disponible | 128 × 128 | Ninguno (incondicional) | no disponible | Checkpoint interno de pruebas de Hugging Face |
| google/ddpm-cifar10-32 | no disponible | 32 × 32 | Ninguno (incondicional) | no disponible | Checkpoint público de Google Research sobre CIFAR-10 |
| Stable Diffusion 1.5 (referencia de otra categoría) | ≈1.000 M en total (UNet ≈860 M) | 512 × 512 | Texto (prompt) | CreativeML OpenRAIL-M | Ampliamente desplegado en producción |

Nota: los datos de los modelos alternativos no se han verificado durante la elaboración de esta ficha y corresponden a lo que declaran sus respectivas model cards públicas; no se dispone de comparaciones de calidad (FID u otras) entre ellos y el modelo analizado. Las diferencias de categoría (tamaño, condicionamiento y resolución) son tan grandes que cualquier comparación de rendimiento carece de sentido más allá de situar el modelo en su rango.

## Limitaciones y advertencias

- Sin condicionamiento: no acepta prompts, etiquetas de clase ni imágenes de referencia. No se puede dirigir el contenido de la salida.
- Resolución de 32 × 32: inutilizable para aplicaciones que requieran detalle; cualquier uso de producción exigiría superresolución posterior.
- Dominio cerrado y probablemente sobreajustado a la distribución de mariposas del dataset de entrenamiento. Se esperan artefactos y modos colapsados.
- Entrenamiento muy corto y sin métricas: no hay FID ni evaluación cuantitativa, por lo que se desconoce la calidad real frente a un DDPM bien entrenado.
- Riesgo de sesgos del dataset: la diversidad de especies, colores y morfologías reflejará el subconjunto usado, que no está documentado. No hay ninguna mitigación aplicada.
- Alucinación: el concepto no aplica en el sentido de los modelos de lenguaje, pero sí existen fallos análogos, como imágenes incoherentes o sin estructura de mariposa reconocible.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Licencia MIT: permisiva y compatible con uso comercial en lo que respecta al checkpoint, pero la procedencia y licencia del dataset de entrenamiento no se declaran, lo que puede generar incertidumbre legal si se redistribuyen las salidas a gran escala.
- Sin mantenimiento ni validación comunitaria: 0 likes, 24 descargas y última actualización el mismo día de su creación (19 de septiembre de 2026, según los metadatos). No hay issues, discusiones ni versiones posteriores.
- No apto para producción: no hay garantías de estabilidad, ni soporte, ni documentación de parámetros de entrenamiento que permita reproducir el resultado.
- Consideraciones éticas: un modelo de este tamaño no plantea riesgos de desinformación realistas, pero sí ilustra el problema general de los generadores de imagen sin filtros ni procedencia verificable del dato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adiantum0407/sd-class-butterflies-32
- Repositorio del curso Diffusion Models Class (Unidad 1): https://github.com/huggingface/diffusion-models-class
- Documentación de `DDPMPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentación de `UNet2DModel` en diffusers: https://huggingface.co/docs/diffusers/api/models/unet2d
- Sobre los resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo. Los únicos resultados devueltos corresponden a páginas de soporte de la plataforma eToro (bloqueo de cuentas, incidencias técnicas, verificación por SMS y contacto con atención al cliente), completamente ajenas al modelo analizado, por lo que no se incluyen.
