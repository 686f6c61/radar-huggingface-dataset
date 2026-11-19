# joigalcar/sd-class-butterflies-32

## Resumen

`joigalcar/sd-class-butterflies-32` es un modelo de difusion de tipo DDPM (Denoising Diffusion Probabilistic Model) para generacion incondicional de imagenes de mariposas, desarrollado por el usuario joigalcar en el contexto del curso "Diffusion Models Class" de Hugging Face. No es un modelo de lenguaje ni un modelo de proposito general: es un artefacto educativo de aproximadamente 18,5 millones de parametros que aprende a sintetizar imagenes de mariposas de 32x32 pixeles sin condicionamiento externo (sin prompt de texto ni imagen de referencia).

El modelo se distribuye en formato `safetensors` a traves de la libreria `diffusers`, con un pipeline `DDPMPipeline`, y ocupa apenas 0,1 GB en el repositorio. Su relevancia es didactica: sirve como ejemplo minimo y reproducible de entrenamiento de un modelo de difusion desde cero, util para entender el ciclo completo de un DDPM (proceso forward de ruido, red de prediccion de ruido y muestreo inverso) sin la complejidad de un modelo text-to-image de gran escala.

No debe confundirse con Stable Diffusion ni con modelos generativos de alta resolucion: el prefijo `sd` del nombre es enganoso y el modelo no soporta prompts de texto. Es un modelo de juguete (toy model) orientado a aprendizaje y experimentacion, no a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (UNet de difusion, segun pipeline `DDPMPipeline`) |
| Parametros totales | 18.536.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (generacion de imagenes, sin texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `diffusers`, PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion clasica de difusion de Ho et al. (DDPM): una red UNet aprende a predecir el ruido anadido a una imagen en cada paso del proceso forward, y el muestreo se realiza iterativamente con el scheduler configurado en el pipeline (en este caso, DDPMPipeline con el scheduler por defecto del checkpoint). El nombre `-32` hace referencia a la resolucion de las imagenes de entrenamiento: 32x32 pixeles.

Segun la model card, el modelo fue entrenado como parte de la Unidad 1 del curso Diffusion Models Class de Hugging Face, que utiliza el dataset `huggan/smithsonian_butterflies_subset` (mariposas) como ejemplo canonico. No se especifican en la informacion disponible el numero de pasos de entrenamiento, el tamano exacto del dataset, la composicion del mismo ni si se aplicaron tecnicas de guiado o fine-tuning adicionales. No hay evidencia de RLHF, DPO ni innovaciones tecnicas destacables; se trata de un DDPM estandar.

## Capacidades

- Generacion incondicional de imagenes de mariposas a 32x32 pixeles.
- Muestreo mediante `DDPMPipeline` de `diffusers`, con control del numero de pasos de inferencia a traves del scheduler.
- Generacion de multiples muestras por llamada (`num_images_per_prompt` o bucle manual).
- No soporta prompts de texto (no es text-to-image).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues, de vision por entrada ni de audio.
- No dispone de modo thinking ni de agentes.

## Casos de uso

- Docencia y aprendizaje de modelos de difusion: el modelo sirve para ilustrar el pipeline completo de entrenamiento e inferencia de un DDPM con un coste computacional minimo, ideal en aulas o tutoriales.
- Experimentacion con schedulers: permite comparar DDPM, DDIM, PNDM y otros schedulers de `diffusers` sobre un mismo checkpoint para observar diferencias de calidad y velocidad de muestreo.
- Prototipado de pipelines de generacion: sirve como sustituto ligero de un modelo real para depurar codigo de integracion con `diffusers` antes de escalar a modelos mayores.
- Investigacion sobre evaluacion de modelos generativos: util para probar metricas como FID o IS en un entorno controlado y de bajo coste.
- Generacion de datasets sinteticos de juguete: puede producir lotes de imagenes 32x32 para pruebas de pipelines de vision (clasificacion, aumentacion de datos) sin necesidad de datos reales.
- Demostraciones de inferencia en CPU: con 18,5 millones de parametros, el modelo puede ejecutarse en CPU en tiempos razonables, lo que facilita demos en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa 0,1 GB en disco.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 lo ejecutan sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `diffusers` (DDPMPipeline) es la via principal; tambien es posible exportar a otros formatos, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo y la resolucion de 32x32, se espera una latencia muy baja (del orden de decimas de segundo por imagen en GPU), aunque no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joigalcar/sd-class-butterflies-32 | 18,5 M | 32x32 | DDPM incondicional | MIT | Hugging Face |
| Modelos del curso Diffusion Models Class (otros checkpoints de alumnos) | variable | 32x32 / 64x64 | DDPM incondicional | variable | Hugging Face |
| Modelos text-to-image tipo Stable Diffusion | cientos de millones a miles de millones | 512x512 o superior | difusion condicionada por texto | variable | Hugging Face |

La comparativa con modelos de produccion no es significativa: este checkpoint pertenece a la categoria de modelos didacticos de difusion incondicional de baja resolucion, y no compite en calidad, resolucion ni capacidades con modelos generativos comerciales.

## Limitaciones y advertencias

- Modelo de juguete: no apto para produccion ni para generar imagenes de calidad util fuera del ambito educativo.
- Resolucion muy baja (32x32) y dominio extremadamente restringido (solo mariposas).
- No acepta prompts de texto: la generacion es incondicional.
- Riesgo de sobreajuste al dataset de entrenamiento y de generar muestras poco diversas.
- No se documentan sesgos especificos, pero al entrenarse sobre un subconjunto del Smithsonian de mariposas puede reflejar los sesgos de ese dataset.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si en cuanto a la fidelidad de las imagenes generadas.
- Licencia MIT: permite uso comercial, pero el valor practico del modelo fuera de la docencia es practicamente nulo.
- Sin mantenimiento ni soporte documentado por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/joigalcar/sd-class-butterflies-32
- Curso Diffusion Models Class (Hugging Face): https://github.com/huggingface/diffusion-models-class
- Libreria diffusers: https://github.com/huggingface/diffusers
- Paper DDPM (Ho et al., 2020): https://arxiv.org/abs/2006.11239
