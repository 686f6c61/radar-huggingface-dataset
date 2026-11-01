# Addey34/LCM_Dreamshaper_v7-fp16

## Resumen

LCM Dreamshaper v7 — fp16 unet and VAE es una conversión de precisión del modelo de difusión Latent Consistency Model (LCM) publicado originalmente por SimianLuo bajo el identificador `SimianLuo/LCM_Dreamshaper_v7`. El repositorio, alojado por el usuario Addey34, no entrena ni modifica parámetros: únicamente recasts los pesos del UNet y del VAE del modelo original de `float32` a `float16` mediante `tensor.to(torch.float16)` y los guarda con `safetensors.torch.save_file`, tomando como referencia el commit `a85df6a8bd976cdd08b4fd8f3b73f229c9e54df5`. El resultado son los ficheros `unet/diffusion_pytorch_model.fp16.safetensors` y `vae/diffusion_pytorch_model.fp16.safetensors`, que colocados junto a los ficheros oficiales completan la variante fp16 que el repositorio original no publica.

El interés práctico es acotado pero concreto: el autor indica que estos pesos los consume la aplicación Image Generator en máquinas Windows sin tarjeta gráfica, que mantienen los pesos en fp16 en memoria pero computan en fp32. Descargar la versión fp16 reduce a la mitad el tamaño de esa parte de la descarga y, según la model card, la imagen generada es idéntica byte a byte. El programa verifica el SHA-256 de cada fichero antes de usarlo.

Se trata, por tanto, de un artefacto de distribución más que de un modelo nuevo: la arquitectura, el entrenamiento y las capacidades son exactamente los del LCM Dreamshaper v7 original, un modelo de texto a imagen basado en Stable Diffusion 1.5 destilado con Latent Consistency Distillation para generar en pocos pasos. La licencia MIT del original se mantiene.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión latente (Stable Diffusion 1.5) con destilación Latent Consistency Model; VAE incluido |
| Parametros totales | no disponible (no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; el texto se procesa con el text encoder del pipeline, no incluido en este repo) |
| Tipos de cuantizacion | fp16 (pesos UNet y VAE); fp32 en el modelo base |
| Idiomas soportados | no disponible (el prompt textual depende del text encoder del pipeline original) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) para UNet y VAE; el repo no publica el text encoder ni el scheduler |
| Tamaño del repositorio | 1,9 GB |
| Librería | diffusers |
| Modelo base | SimianLuo/LCM_Dreamshaper_v7 (commit a85df6a8bd976cdd08b4fd8f3b73f229c9e54df5) |
| Pipeline | no disponible (no declarado en los metadatos) |

## Arquitectura y entrenamiento

Este repositorio no introduce arquitectura ni entrenamiento propios. El modelo subyacente, LCM Dreamshaper v7, es un UNet de difusión latente derivado de Stable Diffusion 1.5 y destilado mediante Latent Consistency Distillation, una técnica que permite generar imágenes en muy pocos pasos de muestreo (del orden de 4 a 8) en lugar de las decenas habituales en modelos de difusión estándar. El VAE asociado comprime y reconstruye las imágenes en el espacio latente. El text encoder (CLIP) y el scheduler no forman parte de este repositorio y deben tomarse del modelo original.

La única operación realizada en este repo es la conversión de precisión: cada tensor de los ficheros `diffusion_pytorch_model.safetensors` oficiales de UNet y VAE se convierte a `torch.float16` y se serializa con safetensors. La model card afirma explícitamente que no se cambió nada más. No hay datos sobre número de tokens de entrenamiento, composición del dataset, RLHF ni DPO en la información proporcionada; esos detalles corresponden a la model card del modelo base.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredadas del pipeline LCM Dreamshaper v7.
- Muestreo en pocos pasos gracias a la destilación de consistencia latente (el rango exacto de pasos no se detalla en la información proporcionada).
- Distribución en fp16 de UNet y VAE, pensada para reducir el tamaño de descarga en entornos que mantienen los pesos en media precisión.
- Integridad verificable: el autor indica que la aplicación consumidora comprueba el SHA-256 de cada fichero.
- No incluye text encoder, tokenizer ni scheduler; estas piezas deben obtenerse del repositorio base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; no aplica a un modelo de difusión de este tipo.

## Casos de uso

- Despliegue en equipos Windows sin GPU dedicada: la aplicación Image Generator mantiene los pesos en fp16 y computa en fp32, de modo que usar estos ficheros reduce a la mitad la descarga de UNet y VAE sin alterar la imagen resultante (según la model card, idéntica byte a byte).
- Sustitución directa de los ficheros fp32 en un pipeline `diffusers` existente: al colocarse junto a los ficheros oficiales del modelo base, completan la variante fp16 para UNet y VAE.
- Prototipado rápido de generación de imágenes en local: al ser un LCM, permite iterar con pocos pasos de muestreo, lo que encaja en flujos de prueba y error sobre prompts.
- Distribución de artefactos en entornos con ancho de banda limitado: el repo pesa 1,9 GB frente al equivalente en fp32, lo que facilita su empaquetado en instaladores o imágenes de contenedor.
- Verificación de integridad en producción: el chequeo SHA-256 descrito por el autor encaja en pipelines que validan artefactos antes de cargarlos.
- Reproducibilidad de experimentos: al fijarse el commit del modelo base, se puede reconstruir exactamente el mismo conjunto de pesos para comparar resultados entre ejecuciones.
- Uso educativo: sirve como ejemplo mínimo de conversión de precisión con safetensors sobre un modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no aporta métricas de calidad de imagen (FID, CLIP score), latencia ni throughput; solo afirma la equivalencia byte a byte de la imagen generada respecto al modelo base en el contexto de la aplicación Image Generator.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Al tratarse de un UNet de Stable Diffusion 1.5 en fp16, el consumo es sensiblemente menor que en fp32, pero no se documentan cifras.
- GPU recomendadas: no disponible. El caso de uso descrito por el autor es precisamente un equipo Windows sin tarjeta gráfica, con cómputo en fp32 sobre CPU.
- ¿Cabe en GPU de consumo? No se aportan datos específicos; por el tamaño del repo (1,9 GB para UNet y VAE en fp16) es plausible en GPUs de consumo con VRAM suficiente, pero no se confirma en la información disponible.
- Opciones de despliegue: la librería declarada es `diffusers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión). El consumidor documentado es la aplicación Image Generator.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Addey34/LCM_Dreamshaper_v7-fp16 | no disponible | no aplica | sin benchmarks publicados; imagen idéntica byte a byte al base según el autor | MIT | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| SimianLuo/LCM_Dreamshaper_v7 | no disponible en la información proporcionada | no aplica | modelo de referencia; sin métricas en esta ficha | MIT | HuggingFace (modelo base) |
| Otras variantes fp16 de Stable Diffusion 1.5 | no disponible | no aplica | no disponible | variable según el repo | HuggingFace |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas; la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda íntegramente los sesgos, limitaciones y riesgos del LCM Dreamshaper v7 original, incluida la posible reproducción de sesgos presentes en los datos de entrenamiento de Stable Diffusion 1.5.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente, artefactos o representaciones no fieles al prompt.
- Repositorio incompleto por sí solo: faltan text encoder, tokenizer y scheduler; no puede usarse de forma autónoma sin el modelo base.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados; conviene verificar los SHA-256 y comparar con los ficheros oficiales antes de usarlo en producción.
- Licencia MIT heredada del modelo base: permite uso comercial, pero debe conservarse la atribución a los autores originales, tal como indica la model card.
- Idiomas: no se documenta el soporte multilingüe de los prompts; depende del text encoder del pipeline original.
- Sin garantías de soporte: el autor remite a la model card y licencia del repositorio original para limitaciones y condiciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Addey34/LCM_Dreamshaper_v7-fp16
- Modelo base: https://huggingface.co/SimianLuo/LCM_Dreamshaper_v7
- Commit de referencia del modelo base: `a85df6a8bd976cdd08b4fd8f3b73f229c9e54df5`
- Librería diffusers: https://github.com/huggingface/diffusers
- safetensors: https://github.com/huggingface/safetensors
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos específicos de este repositorio.
