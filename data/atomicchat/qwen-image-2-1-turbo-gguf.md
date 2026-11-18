# AtomicChat/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es una cuantización en formato GGUF del modelo de generación y edición de imágenes Qwen-Image-2.1-Turbo, desarrollado originalmente por el equipo Qwen de Alibaba y cuantizado por AtomicChat para su uso con el motor stable-diffusion.cpp. El modelo base es un generador de imágenes de aproximadamente 7.115 millones de parámetros (7,1B) destilado para funcionar con solo 8 pasos de denoising a CFG 1, lo que reduce drásticamente el coste computacional frente a los pipelines de difusión convencionales que requieren entre 20 y 50 pasos.

El interés de esta publicación reside en que permite ejecutar localmente un generador de imágenes de última generación en hardware de consumo, gracias a las cuantizaciones que van desde Q8_0 (7,59 GB) hasta Q2_K (2,55 GB). AtomicChat no se limita a aplicar cuantización estándar: introduce un esquema propio denominado AD (Atomic Dynamic) que elige el tipo de cuantización por tensor y utiliza una importance matrix calculada a partir de 32 renders de Turbo, con el objetivo de preservar la fidelidad perceptual respecto a los pesos BF16 originales.

La relevancia actual del modelo estriba en la combinación de tres factores: la licencia qwen-research (uso de investigación, con restricciones comerciales), la disponibilidad de pesos GGUF listos para stable-diffusion.cpp y la publicación de métricas objetivas de degradación por cuantización (LPIPS, SSIM, PSNR) sobre un conjunto fijo de 48 prompts y 2 semillas. Esto convierte al repositorio en una referencia útil tanto para desarrolladores que quieren desplegar generación de imágenes en local como para investigadores que necesitan evaluar el impacto real de la cuantización en modelos de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (denoiser) basado en transformer, derivado de Qwen-Image-2.1; texto codificado con Qwen3-VL-8B y VAE propio |
| Parametros totales | 7.115.124.736 (7,1B) en el denoiser |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K, AD-Q4_K, AD-Q3_K, AD-Q2_K (además de las variantes estándar Q4_K y Q2_K usadas como línea base) |
| Idiomas soportados | No disponible (el modelo genera imágenes; el texto en imagen se ha evaluado en chino) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (para stable-diffusion.cpp); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un checkpoint acelerado de Qwen-Image-2.1: mantiene el mismo generador de imágenes de 7B y ha sido destilado para operar con 8 pasos de denoising a CFG 1, con un schedule de muestreo fijo propio. La arquitectura del denoiser es de tipo transformer de difusión, y el pipeline completo incluye un codificador de texto Qwen3-VL-8B y un VAE que se mantienen idénticos a los de Qwen-Image-2.1, de modo que los ficheros auxiliares de la versión 2.1 son reutilizables. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta publicación es el esquema de cuantización AD (Atomic Dynamic), que selecciona el tipo de cuantización por tensor en lugar de aplicarlo uniformemente a todos los bloques. La modulación compartida por todos los bloques se mantiene en Q8_0 (o BF16 en AD-Q6_K), mientras que el timestep embedding, la normalización final y la proyección de salida reciben un trato específico. Además, los ficheros AD se cuantizan con una importance matrix derivada de 32 renders de Turbo que no comparten prompt con el conjunto de evaluación. Según el autor, AD-Q4_K se mantiene un 21% más cerca de la imagen BF16 que un Q4_K estándar, con solo 150 MB adicionales de tamaño.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con 8 pasos de denoising a CFG 1.
- Edición de imágenes (image-editing), según la etiqueta del pipeline del modelo base.
- Renderizado de texto dentro de la imagen, evaluado específicamente en chino sobre ocho prompts del conjunto de pruebas.
- Ejecución local determinista en BF16: dos ejecuciones con los mismos pesos y semilla producen imágenes idénticas.
- Compatibilidad con stable-diffusion.cpp como motor de inferencia, incluyendo el ecosistema de herramientas que lo integran (por ejemplo, Atomic Chat).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; estas capacidades no aplican a un modelo de difusión de imagen.
- No se ha documentado soporte de audio ni de visión como entrada más allá del pipeline de edición de imagen.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: con AD-Q4_K (4,20 GB) el modelo cabe en GPUs de consumo y permite iterar rápidamente sobre conceptos visuales en 8 pasos, lo que reduce el tiempo por imagen frente a pipelines de 20-50 pasos.
- Edición de imágenes en flujos de trabajo creativos: el pipeline de image-editing del modelo base permite modificar imágenes existentes; al compartir el VAE y el text encoder con Qwen-Image-2.1, se pueden reutilizar assets ya preparados para esa versión.
- Generación de carteles y material gráfico con texto: el modelo ha sido evaluado específicamente en la renderización de texto en chino (LPIPS 0,166 en AD-Q4_K), por lo que es adecuado para piezas que incluyan tipografía, aceptando la pérdida de fidelidad que introduce la cuantización.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con AD-Q2_K (2,55 GB) el modelo cabe en equipos con VRAM limitada; el autor advierte que la imagen difiere notablemente de la BF16, pero sigue el prompt y mantiene la ortografía en las comprobaciones puntuales realizadas.
- Investigación sobre cuantización de modelos de difusión: el repositorio publica métricas LPIPS, SSIM y PSNR por fichero sobre 48 prompts y 2 semillas, lo que permite estudiar la degradación perceptual inducida por la cuantización con un conjunto reproducible.
- Integración en aplicaciones de escritorio: al ejecutarse sobre stable-diffusion.cpp, los GGUF pueden integrarse en aplicaciones locales como Atomic Chat, lo que facilita la generación de imágenes sin conexión y sin enviar datos a servicios externos.
- Evaluación comparativa de esquemas de cuantización: la inclusión de ficheros Q4_K y Q2_K estándar como línea base permite comparar directamente el esquema AD frente al convencional en las mismas condiciones de prompt y semilla.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto a los pesos BF16 sobre 48 prompts y 2 semillas, con el mismo ruido inicial. LPIPS mide distancia perceptual (menor es mejor); "vs. new seed" normaliza la distancia tomando como 100% la diferencia entre dos semillas distintas (LPIPS 0,499); "text (zh)" es el LPIPS sobre los ocho prompts con texto chino en la imagen.

| Fichero | Tamano en disco | LPIPS [IC 95%] | vs. new seed | SSIM | PSNR | text (zh) |
|---|---:|---|---:|---:|---:|---:|
| BF16 | 14,23 GB | 0 (idéntico) | 0% | 1,000 | — | 0 |
| Q8_0 | 7,59 GB | 0,037 [0,030; 0,046] | 7% | 0,964 | 30,2 dB | 0,037 |
| AD-Q6_K | 6,71 GB | 0,044 [0,035; 0,055] | 9% | 0,956 | 29,6 dB | 0,052 |
| AD-Q5_K | 5,40 GB | 0,076 [0,064; 0,090] | 15% | 0,922 | 25,2 dB | 0,080 |
| AD-Q4_K | 4,20 GB | 0,147 [0,128; 0,167] | 29% | 0,850 | 20,8 dB | 0,166 |
| AD-Q3_K | 3,60 GB | 0,206 [0,182; 0,232] | 41% | 0,801 | 18,6 dB | 0,267 |
| AD-Q2_K | 2,55 GB | 0,359 [0,328; 0,389] | 72% | 0,671 | 14,7 dB | 0,421 |

No se han publicado en la información disponible resultados de benchmarks estándar de generación de imágenes (FID, CLIP score, GenEval u otros) ni comparaciones con modelos de difusión de otros fabricantes.

## Requisitos de hardware

- VRAM estimada para el denoiser según cuantización: aproximadamente 2,55 GB (AD-Q2_K), 3,60 GB (AD-Q3_K), 4,20 GB (AD-Q4_K), 5,40 GB (AD-Q5_K), 6,71 GB (AD-Q6_K), 7,59 GB (Q8_0) y 14,23 GB (BF16). A estas cifras hay que sumar la memoria del text encoder Qwen3-VL-8B y del VAE, que no se detalla en la información disponible.
- GPUs recomendadas: no especificadas por el autor. Por tamaño, los ficheros de 4 bits y menores son compatibles con GPUs de consumo de gama media-alta; Q8_0 y BF16 requieren GPUs con más VRAM o ejecución parcial en CPU.
- Cabe en GPU de consumo: sí, al menos las variantes AD-Q4_K, AD-Q3_K y AD-Q2_K, que ocupan entre 2,55 y 4,20 GB para el denoiser.
- Opciones de despliegue: stable-diffusion.cpp (motor con el que se construyeron y verificaron los ficheros) y aplicaciones que lo integran, como Atomic Chat. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El modelo está destilado para 8 pasos de denoising a CFG 1, lo que reduce el número de evaluaciones del denoiser frente a pipelines convencionales, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-GGUF (este) | 7,1B (denoiser) | No disponible | GGUF (BF16 a Q2_K) | qwen-research | Hugging Face, 209.995 descargas |
| Qwen-Image-2.1-Turbo (base) | 7,1B (denoiser) | No disponible | BF16 | qwen-research | Hugging Face (Qwen/Qwen-Image-2.1-Turbo) |
| Qwen-Image-2.1-Turbo-Uncensored-GGUF | 7,1B (denoiser) | No disponible | GGUF | qwen-research (según repositorio) | Hugging Face (AtomicChat) |

No se dispone de información sobre otros modelos de difusión comparables (por ejemplo, de otras familias) en los datos proporcionados, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es necesario revisar los términos completos en el enlace a la licencia del modelo base antes de cualquier despliegue en producción.
- La degradación por cuantización es significativa en los niveles bajos: AD-Q3_K presenta desplazamientos visibles en composición, rostros y rotulación, y AD-Q2_K genera una imagen notablemente distinta de la BF16 con la misma semilla.
- El texto en imagen se degrada antes que las fotografías: el LPIPS sobre prompts con texto chino es de 0,166 en AD-Q4_K frente a 0,147 en el conjunto general, y sube a 0,267 en AD-Q3_K y 0,421 en AD-Q2_K.
- El modelo Turbo requiere su propio schedule de 8 pasos a CFG 1; usar otros valores de CFG o un número distinto de pasos puede degradar la calidad de forma no documentada.
- No se dispone de información sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas más allá de la evaluación en chino.
- El pipeline abierto de Qwen-Image no incluye filtro de contenido según el autor; la variante Uncensored elimina la dirección de rechazo del text encoder, lo que traslada al usuario la responsabilidad sobre el contenido generado.
- La información sobre requisitos de VRAM del text encoder y del VAE no está disponible, por lo que las estimaciones de memoria total del pipeline son incompletas.
- No se han publicado benchmarks estándar de calidad de generación (FID, CLIP score) que permitan comparar objetivamente con otros generadores de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Dataset de métricas y renders: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-GGUF-metrics
- Variante sin censura: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Motor stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
