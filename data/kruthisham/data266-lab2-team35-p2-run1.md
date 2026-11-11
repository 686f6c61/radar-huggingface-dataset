# kruthisham/data266-lab2-team35-p2-run1

## Resumen

`kruthisham/data266-lab2-team35-p2-run1` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imágenes con el estilo del conjunto de datos `lambdalabs/naruto-blip-captions`. Lo publica el usuario kruthisham en el contexto de la asignatura DATA 266 (Lab 2, Parte 2, equipo 35) y se trata de una ejecución de comparación: el modelo final del equipo es la variante de rango 32 (`data266-lab2-team35-p2-run2`), seleccionada por obtener el KID in-domain más bajo.

El adaptador modifica únicamente las capas de atención del UNet mediante LoRA, con 797.184 parámetros entrenables (el 0,093 % del total del modelo base). El entrenamiento se realizó sobre el mismo dataset, pasos e hiperparámetros que la ejecución final, cambiando solo el rango de la descomposición, lo que lo convierte en una referencia útil para estudiar el efecto del rango en la calidad y diversidad de la generación.

Su relevancia es acotada: no es un modelo de propósito general ni un lanzamiento de producción, sino un artefacto de investigación educativa con licencia no comercial, pensado para reproducir el experimento y comparar métricas (KID, CLIP score, LPIPS) entre configuraciones de LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente, text-to-image) |
| Parametros totales | 797.184 parámetros entrenables en el adaptador (0,093 % del modelo base); total del modelo base no disponible en la información proporcionada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin ventana de contexto textual especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts del dataset están en inglés, según la fuente de datos, pero no se declara soporte multilingüe) |
| Licencia | other (el autor indica uso exclusivo para investigación no comercial) |
| Formato de pesos | no disponible (repositorio de 0,0 GB según Hugging Face; no se detalla el formato de los archivos) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 aplicado a las capas de atención del UNet de Stable Diffusion 1.5. Se entrenaron 797.184 parámetros (0,093 % del total) con tasa de aprendizaje 0,0001, 3.000 pasos, tamaño de lote 4, sobre el dataset `lambdalabs/naruto-blip-captions`. El entrenamiento completo consumió 6,4 minutos en una NVIDIA GeForce RTX 4090, con un pico de 9,42 GB de VRAM (limitado a 15 GiB). La única diferencia respecto a la ejecución final (`run2`, rango 32) es el rango del adaptador; datos, pasos e hiperparámetros son idénticos.

No se especifica en la información disponible si hubo etapas de RLHF, DPO ni ajuste adicional más allá del entrenamiento supervisado del LoRA. Tampoco se detalla la composición exacta del dataset ni el número de tokens o imágenes empleados. La evaluación se realizó con 20 prompts y 2 semillas, usando el sampler DPM-Solver++ con 30 pasos y guidance 7.5.

## Capacidades

- Generación de imágenes text-to-image con el estilo visual del dataset `naruto-blip-captions`, mediante composición del adaptador sobre Stable Diffusion 1.5.
- Ajuste fino eficiente en parámetros: al ser un LoRA de rango 4, puede cargarse y descargarse sobre el modelo base sin reentrenar.
- Control de estilo: el adaptador desplaza la distribución generada hacia el dominio de entrenamiento, como refleja la caída del KID in-domain de 0,1256 (base) a 0,0240 (este run).
- Compatibilidad con el ecosistema Diffusers mediante `load_lora_weights`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; no aplica a este tipo de modelo.
- Capacidades multilingües: no disponibles; no se documenta soporte de prompts en idiomas distintos del inglés.

## Casos de uso

- Reproducción de experimentos académicos: sirve como referencia de rango 4 frente al rango 32 para analizar el compromiso entre calidad (KID) y diversidad (LPIPS) en un mismo dataset y presupuesto de entrenamiento.
- Estudio del efecto del rango en LoRA: al compartir datos, pasos e hiperparámetros con `run2`, permite aislar la variable del rango en el análisis de resultados.
- Generación de imágenes de estilo controlado en investigación: útil para prototipar pipelines de difusión con un adaptador ligero que cabe en una RTX 4090 con un pico de 9,42 GB.
- Docencia y formación: ejemplo práctico de entrenamiento de LoRA sobre Stable Diffusion 1.5 con métricas de evaluación reproducibles (KID, CLIP score, LPIPS).
- Pruebas de integración con Diffusers: validación de la carga de pesos LoRA y de la composición con el modelo base en entornos de desarrollo.
- Evaluación comparativa de samplers y parámetros de inferencia: el protocolo documentado (DPM-Solver++ 30 pasos, guidance 7.5, 2 semillas) permite reutilizar la configuración como línea base.
- No se recomienda para aplicaciones comerciales ni para producción, dada la licencia y la naturaleza del artefacto.

## Benchmarks y rendimiento

Resultados publicados por el autor (20 prompts × 2 semillas, DPM-Solver++ 30 pasos, guidance 7.5):

| Metrica | Base (SD 1.5) | run1 (este, rango 4) | run2 (final, rango 32) |
|---|---|---|---|
| KID in-domain ↓ | 0,1256 ± 0,0125 | 0,0240 ± 0,0095 | 0,0053 ± 0,0043 |
| CLIP score ↑ | 26,36 | 24,90 | 25,00 |
| LPIPS diversity ↑ | 0,793 | 0,776 | 0,746 |

El adaptador de rango 4 mejora notablemente el KID respecto al modelo base, pero queda por detrás del rango 32 en ajuste al dominio. A cambio, conserva una diversidad (LPIPS 0,776) superior a la del rango 32 (0,746). El CLIP score desciende ligeramente respecto al base, lo que sugiere una menor alineación prompt-imagen en el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento del adaptador alcanzó un pico de 9,42 GB en una RTX 4090. La inferencia con Stable Diffusion 1.5 más un LoRA de rango 4 es sustancialmente más ligera, pero no se documenta una cifra concreta.
- GPU recomendadas: NVIDIA GeForce RTX 4090 para entrenamiento (6,4 minutos, pico de 9,42 GB, límite de 15 GiB). Para inferencia, cualquier GPU compatible con Stable Diffusion 1.5; no se detallan modelos concretos.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 para el entrenamiento documentado; para inferencia no se especifican requisitos mínimos.
- Opciones de despliegue: Diffusers (`StableDiffusionPipeline` + `load_lora_weights`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KID in-domain ↓ | CLIP score ↑ | LPIPS ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| run1 (este) | 797.184 entrenables (rango 4) | no disponible | 0,0240 ± 0,0095 | 24,90 | 0,776 | other (no comercial) | Hugging Face |
| run2 (final, equipo 35) | no disponible (rango 32) | no disponible | 0,0053 ± 0,0043 | 25,00 | 0,746 | other (no comercial) | Hugging Face |
| Stable Diffusion 1.5 (base) | no disponible en la información | no disponible | 0,1256 ± 0,0125 | 26,36 | 0,793 | no disponible en la información | Hugging Face |

No se dispone de datos de otros adaptadores LoRA comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el autor declara uso exclusivo para investigación no comercial, ya que las imágenes de entrenamiento muestran personajes con derechos de autor y el dataset `lambdalabs/naruto-blip-captions` no declara licencia.
- Riesgo de reproducción de sesgos y estilos del dataset de entrenamiento, con posible sobrerrepresentación de los personajes y composiciones presentes en él.
- Riesgo de alucinación visual y de artefactos propios de Stable Diffusion 1.5, especialmente en composiciones complejas o prompts alejados del dominio.
- Menor alineación prompt-imagen que el modelo base según el CLIP score (24,90 frente a 26,36).
- El safety checker de Stable Diffusion marcó 3 de 40 imágenes de esta ejecución; se publicaron como marcadores negros y se excluyeron de todas las métricas, lo que puede introducir un sesgo en los resultados.
- No es el modelo final del equipo: se trata de una ejecución de comparación, por lo que no debe tomarse como la versión recomendada.
- El repositorio figura con tamaño de 0,0 GB en Hugging Face, lo que puede indicar pesos no subidos o un problema de empaquetado; conviene verificar la disponibilidad real de los archivos antes de usarlo.
- Sin datos de cuantización, idiomas ni formato de pesos, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kruthisham/data266-lab2-team35-p2-run1
- Modelo final del equipo (run2, rango 32): https://huggingface.co/kruthisham/data266-lab2-team35-p2-run2
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
