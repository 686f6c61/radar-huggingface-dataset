# michelmf/sd-class-butterflies-32

## Resumen

`michelmf/sd-class-butterflies-32` es un modelo de difusión para generación incondicional de imágenes de mariposas, desarrollado por el usuario `michelmf` como ejercicio de la Unidad 1 del curso Diffusion Models Class de Hugging Face. No es un modelo de lenguajes: no procesa texto ni genera lenguaje, sino que produce imágenes de 32x32 píxeles mediante un proceso iterativo de eliminación de ruido. Su relevancia es exclusivamente pedagógica y experimental: sirve como referencia mínima de un pipeline de difusión funcional (DDPMPipeline) y como base para comparar hiperparámetros de entrenamiento en el aula.

El modelo cuenta con 18.536.323 parámetros reales (según los pesos safetensors del repositorio), un tamaño de repositorio de 0,1 GB y una licencia MIT. No dispone de información publicada sobre idiomas (no aplica, al no ser un modelo de texto), datos de entrenamiento, benchmarks ni rendimiento medido. Se trata de un artefacto de demostración, no de un modelo destinado a producción.

Por su escala y resolución, encaja en el mismo nicho que modelos de difusión pequeños tipo DDPM entrenados sobre datasets de juguete (por ejemplo, CIFAR-10 o el dataset de mariposas de 32x32 usado en el curso). Es útil para entender el ciclo completo de entrenamiento, muestreo y evaluación de difusión sin requerir hardware significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (DDPM, pipeline `DDPMPipeline` de diffusers); backbone no detallado en la información disponible |
| Parametros totales | 18.536.323 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplicable (generación incondicional de imágenes, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), integrado en diffusers |
| Resolución de salida | 32x32 píxeles (según el nombre del modelo y la model card) |
| Pipeline | `unconditional-image-generation` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del backbone (número de bloques, canales, uso de atención, etc.). Lo que sí se sabe es que se trata de un modelo de difusión probabilística del tipo DDPM, empaquetado en el pipeline `DDPMPipeline` de la librería diffusers, y que genera imágenes de forma incondicional (sin condicionamiento por texto, clase ni etiqueta). El nombre `sd-class-butterflies-32` sugiere que sigue el esquema clásico del curso: un UNet pequeño entrenado sobre un dataset de mariposas de 32x32 píxeles, probablemente el dataset de ejemplo empleado en la Unidad 1.

No se dispone de datos sobre el número de pasos de entrenamiento, la composición exacta del dataset, el scheduler utilizado (DDPM, DDIM, etc.), ni si hubo técnicas de guiado o fine-tuning. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación incondicional de imágenes de mariposas a 32x32 píxeles.
- Muestreo iterativo mediante el pipeline `DDPMPipeline` de diffusers.
- Integración directa con el ecosistema diffusers (`from_pretrained`, `pipeline().images[0]`).
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso basado en texto.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo "thinking", visión de entrada, audio ni otras modalidades.
- Capacidad de servir como baseline didáctico para comparar schedulers, pasos de muestreo y calidad de imagen.

## Casos de uso

- Docencia y formación en modelos generativos: usar el modelo como ejemplo mínimo para explicar el ciclo de entrenamiento y muestreo DDPM en clase o talleres, sin necesidad de GPU de gran capacidad.
- Prototipado de pipelines de difusión: integrar `DDPMPipeline` en scripts de prueba para validar la instalación de diffusers, versiones de PyTorch y compatibilidad de safetensors antes de pasar a modelos mayores.
- Evaluación comparativa de schedulers: ejecutar el mismo modelo con distintos schedulers y pasos de muestreo para medir diferencias cualitativas y de tiempo en la generación de imágenes de 32x32.
- Generación de datasets sintéticos de mariposas a baja resolución: producir lotes de imágenes para pruebas de pipelines de augmentation o de clasificación a pequeña escala, asumiendo la baja fidelidad de 32x32.
- Investigación sobre estabilidad de entrenamiento: servir como referencia reproducible para estudiar cómo varían las muestras con distintos checkpoints o hiperparámetros en un dataset pequeño.
- Benchmark de infraestructura ligera: medir latencia y consumo de memoria en CPU, GPUs consumer o entornos sin acelerador, dado el reducido tamaño del modelo (18,5 M parámetros, 0,1 GB de repositorio).
- Demostraciones educativas en notebooks: mostrar en un notebook cómo se genera una imagen paso a paso, visualizando el ruido intermedio, sin coste de cómputo relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, IS, precisión de muestreo, latencia ni throughput documentados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 18,5 M parámetros y pesos en safetensors (0,1 GB de repositorio), la inferencia cabe holgadamente en menos de 1 GB de VRAM en FP32, y aún menos en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM; incluso en entornos integrados.
- Opciones de despliegue: `diffusers` con `DDPMPipeline` (principal vía documentada); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles; al ser un modelo de 32x32 con pocos parámetros, la latencia esperada es de milisegundos a pocos segundos por imagen en CPU y de decenas de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `michelmf/sd-class-butterflies-32` | 18,5 M | 32x32 | Incondicional | MIT | Hugging Face (diffusers) |
| `google/ddpm-cifar10-32` | no disponible en la información | 32x32 | Incondicional | no disponible | Hugging Face (diffusers) |
| `google/ddpm-celebahq-256` | no disponible en la información | 256x256 | Incondicional | no disponible | Hugging Face (diffusers) |
| Modelos del curso Diffusion Models Class (Unidad 1) | variable | 32x32–64x64 | Incondicional | variable | Hugging Face |

La comparación se limita a referencias del ecosistema diffusers para difusión incondicional de baja resolución. No se dispone de datos de rendimiento comparativo (FID, IS) para ninguno de ellos en la información proporcionada, por lo que la comparativa es estructural y no de calidad.

## Limitaciones y advertencias

- Modelo de demostración: no está pensado para uso en producción ni para generar imágenes de alta fidelidad; la resolución es de 32x32 píxeles.
- Sin condicionamiento: no acepta prompts de texto ni etiquetas de clase; la salida es siempre una muestra incondicional del dataset de entrenamiento.
- Sesgos: al entrenarse sobre un dataset pequeño de mariposas, reproducirá los sesgos y limitaciones de ese dataset (posibles artefactos, baja diversidad, ruido de muestreo).
- Riesgo de alucinación: no aplica en el sentido textual; en imágenes, el modelo puede generar muestras incoherentes o poco realistas, especialmente con pocos pasos de muestreo.
- Idiomas: no aplicable; el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar la procedencia del dataset de entrenamiento, no documentada en la model card.
- Sin métricas publicadas: no hay benchmarks, FID ni evaluaciones de calidad que permitan juzgar su rendimiento de forma objetiva.
- Escaso mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el repositorio no muestra señales de uso activo ni de soporte.
- No se documentan limitaciones específicas de contexto ni de idioma porque el modelo no opera sobre texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michelmf/sd-class-butterflies-32
- Curso Diffusion Models Class (Unidad 1): https://github.com/huggingface/diffusion-models-class
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
