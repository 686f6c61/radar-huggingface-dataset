# Sami0308/sd-class-butterflies-32

## Resumen

`Sami0308/sd-class-butterflies-32` es un modelo de difusion para generacion incondicional de imagenes de mariposas, entrenado como parte de la Unidad 1 del curso Diffusion Models Class de Hugging Face. Lo desarrolla el usuario Sami0308 y se publica bajo licencia MIT. No es un modelo de lenguaje ni un modelo multimodal: es un pipeline de difusion de imagenes de pequeno tamano, pensado como ejemplo didactico del flujo de entrenamiento de modelos de difusion con la libreria `diffusers`.

El modelo emplea una arquitectura de difusion DDPM (Denoising Diffusion Probabilistic Model) sobre un UNet de aproximadamente 18,5 millones de parametros, con un pipeline `DDPMPipeline` y muestreo DDPM. El repositorio ocupa unos 0,1 GB y los pesos estan en formato `safetensors` con soporte para PyTorch.

Su relevancia es fundamentalmente educativa: sirve como referencia minima de un modelo de difusion funcional, reproducible en hardware de consumo, para aprender a cargar pipelines, generar imagenes y entender el ciclo de entrenamiento de la Diffusion Models Class. No esta pensado para produccion ni para tareas generales de generacion de imagenes mas alla del dominio de mariposas con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion DDPM con UNet (denoising diffusion probabilistic model) |
| Parametros totales | 18.536.323 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Resolucion de imagen | 32x32 (segun el nombre del modelo) |
| Pipeline | `DDPMPipeline` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un DDPM de generacion incondicional de imagenes. La red neuronal es un UNet que aprende a predecir el ruido anadido en cada paso del proceso de difusion, y el muestreo se realiza mediante el pipeline `DDPMPipeline` con el scheduler DDPM por defecto. El nombre `sd-class-butterflies-32` indica que fue entrenado sobre el dataset de mariposas de la Diffusion Models Class y que opera a 32x32 pixeles.

No se dispone de informacion detallada sobre el numero de pasos de entrenamiento, el tamano exacto del dataset, la composicion de los datos ni si se aplicaron tecnicas de refinamiento posteriores. La model card solo indica que se trata del modelo de la Unidad 1 del curso, lo que implica un entrenamiento de tipo tutorial sobre un dataset pequeno de imagenes de mariposas. No hay evidencia de RLHF, DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion incondicional de imagenes de mariposas a 32x32 pixeles.
- Carga y ejecucion mediante `DDPMPipeline` de la libreria `diffusers`.
- Entrenamiento reproducible como ejemplo didactico de difusion.
- No soporta texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Aprendizaje de pipelines de difusion: cargar el modelo con `DDPMPipeline.from_pretrained` y generar imagenes para entender el flujo basico de `diffusers`.
- Docencia y tutoriales: usar el modelo como ejemplo minimo en cursos o talleres sobre modelos de difusion, dado su tamano reducido y su origen en la Diffusion Models Class.
- Pruebas de infraestructura: validar entornos de PyTorch y `diffusers` con un modelo de 0,1 GB antes de pasar a modelos mayores.
- Experimentacion con schedulers: sustituir el scheduler DDPM por otros disponibles en `diffusers` para comparar resultados en un modelo pequeno.
- Generacion de datasets sinteticos de mariposas a baja resolucion para tareas de aumento de datos o prototipado.
- Reproduccion de experimentos: reentrenar o ajustar el modelo siguiendo la Unidad 1 del curso para comparar con los pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en `safetensors` sin cuantizar (18,5 M de parametros).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `diffusers` con PyTorch (CPU o CUDA); no se han publicado variantes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 32x32 y 18,5 M de parametros, la generacion es rapida incluso en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sami0308/sd-class-butterflies-32` | 18,5 M | 32x32 | Difusion incondicional (mariposas) | MIT | Hugging Face |
| `google/ddpm-cifar10-32` | no disponible | 32x32 | Difusion incondicional (CIFAR-10) | no disponible | Hugging Face |
| `google/ddpm-celebahq-256` | no disponible | 256x256 | Difusion incondicional (caras) | no disponible | Hugging Face |
| `CompVis/ldm-celebahq-256` | no disponible | 256x256 | Difusion condicionada por clase | no disponible | Hugging Face |

La comparativa se limita a modelos de difusion incondicional de referencia; no se dispone de datos de rendimiento cuantitativos para establecer una comparacion objetiva.

## Limitaciones y advertencias

- Modelo puramente didactico: no esta disenado para produccion ni para tareas generales de generacion de imagenes.
- Dominio muy restringido: solo genera mariposas a 32x32 pixeles; no generaliza a otras categorias.
- No procesa texto ni instrucciones, por lo que no puede usarse como modelo de lenguaje ni como modelo multimodal.
- Calidad de imagen limitada por la resolucion de 32x32 y por el entrenamiento de tipo tutorial.
- No se han documentado sesgos especificos, pero el dataset de entrenamiento (mariposas del curso) es limitado y puede producir baja diversidad.
- Riesgo de alucinacion no aplica en el sentido de texto, pero la salida puede ser incoherente o de baja calidad fuera de las condiciones de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- No hay informacion sobre el dataset, los pasos de entrenamiento ni la evaluacion, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/Sami0308/sd-class-butterflies-32
- Diffusion Models Class (repositorio del curso): https://github.com/huggingface/diffusion-models-class
- Documentacion de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
