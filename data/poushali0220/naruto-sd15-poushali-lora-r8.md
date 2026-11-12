# Poushali0220/naruto-sd15-poushali-lora-r8

## Resumen

`naruto-sd15-poushali-lora-r8` es un adaptador LoRA de rango 8 para Stable Diffusion 1.5, entrenado para generar imagenes con estilo y personajes de Naruto. Lo publica el usuario Poushali0220 en el contexto de un laboratorio docente (Data 266 Lab 2, Part 2, Team 16) y esta pensado exclusivamente para investigacion y docencia sin animo comercial, dado que los personajes representados estan sujetos a derechos de autor.

El adaptador se aplica sobre el checkpoint `stable-diffusion-v1-5/stable-diffusion-v1-5` a resolucion 512x512 y modifica unicamente las capas de atencion del UNet. Con 1.594.368 parametros entrenables, es un adaptador muy ligero que se carga sobre el modelo base sin necesidad de reentrenar ni redistribuir los pesos completos.

Su relevancia es fundamentalmente didactica: documenta de forma transparente el pipeline de entrenamiento (dataset, semilla, hiperparametros, consumo de GPU) y publica metricas objetivas (KID, CLIP score, LPIPS) sobre un conjunto fijo de prompts. No es un modelo de produccion ni compite con adaptadores de estilo publicados a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | 1.594.368 parametros entrenables (adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; resolucion de imagen 512x512) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el adaptador puede combinarse con el base cuantizado segun el runtime) |
| Idiomas soportados | no disponible (prompts en ingles segun el dataset BLIP) |
| Licencia | other (uso no comercial, investigacion y docencia) |
| Formato de pesos | no disponible en la informacion (repo de 0.0 GB; libreria `diffusers`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 inyectado en las capas de atencion del UNet de Stable Diffusion 1.5. El modelo base es un transformer de difusion latente que opera sobre representaciones comprimidas de imagenes de 512x512, condicionado por texto mediante un codificador CLIP. El LoRA congela los pesos del UNet y aprende matrices de baja dimension, lo que explica el reducido numero de parametros entrenables (1.594.368) y el bajo coste de entrenamiento.

El entrenamiento usa el dataset `lambdalabs/naruto-blip-captions`, con 1221 imagenes tras limpieza y un split 90/10 con semilla 266 (1099 de entrenamiento, 122 de validacion). Se empleo un bucle de entrenamiento propio con learning rate 0.0001, 750 pasos, batch efectivo 1 x 4 (probablemente acumulacion de gradiente) y precision fp16. El pico de memoria GPU fue de 2.61 GB y el consumo total de 0.408 GPU-horas, lo que confirma que el entrenamiento cabe en una GPU de consumo. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de estilo.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 condicionada por prompts en ingles.
- Reproduccion de estilo visual y personajes del universo Naruto, aprendidos del dataset de captions BLIP.
- Aplicacion como adaptador ligero sobre Stable Diffusion 1.5 mediante la libreria `diffusers` (carga del LoRA sobre el pipeline base).
- Compatible con el ecosistema de Stable Diffusion 1.5: schedulers, negative prompts y tecnicas de muestreo habituales del pipeline.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- Capacidades multilingues: no documentadas; el dataset de captions esta en ingles, por lo que la respuesta a prompts en otros idiomas no esta garantizada.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla de la condicion textual.

## Casos de uso

- Docencia sobre fine-tuning de modelos de difusion: el adaptador sirve como ejemplo completo y reproducible de entrenamiento LoRA con hiperparametros, semilla y metricas documentadas, adecuado para practicas de laboratorio.
- Investigacion sobre evaluacion de adaptadores de estilo: las metricas KID, CLIP score y LPIPS publicadas sobre 20 prompts fijos y 2 semillas permiten reproducir y comparar metodologias de evaluacion.
- Experimentos de bajo coste en GPU de consumo: con 2.61 GB de pico de memoria en entrenamiento, se puede replicar el pipeline en tarjetas como RTX 3060 o superiores para estudiar el efecto del rango LoRA o del learning rate.
- Generacion de ilustraciones de fan art para uso personal no comercial: aplicable a bocetos y pruebas de concepto dentro de los limites de la licencia.
- Estudio de sesgos y limitaciones de datasets pequenos: el propio autor documenta debilidad en prompts fuera de dominio y captions BLIP cortas, lo que lo convierte en un caso de analisis de fallos.
- Prototipado de pipelines de `diffusers` con LoRA: util para validar la integracion de adaptadores en flujos de inferencia antes de escalar a adaptadores de mayor calidad.
- Comparacion de estrategias de aumento de datos: el split 90/10 con semilla fija permite medir el impacto de la limpieza del dataset en la calidad final.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 20 prompts fijos x 2 semillas:

| Metrica | Valor |
|---|---|
| KID | 0.0619 +/- 0.0077 |
| CLIP score | 30.8 |
| LPIPS (diversidad) | 0.7382 |

No se han publicado comparaciones con otros adaptadores ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a un modelo de difusion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento requirio un pico de 2.61 GB, por lo que la inferencia con el UNet en fp16 sobre Stable Diffusion 1.5 suele situarse en el rango de 4-8 GB segun runtime y resolucion.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia; el entrenamiento cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, segun los datos de entrenamiento (2.61 GB de pico).
- Opciones de despliegue: `diffusers` (carga del LoRA sobre el pipeline de Stable Diffusion 1.5); otros runtimes no documentados en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| naruto-sd15-poushali-lora-r8 | 1.594.368 (LoRA) | 512x512 | other (no comercial) | Hugging Face, repo de 0.0 GB |
| Adaptadores LoRA de estilo para SD 1.5 (genericos) | variable | 512x512 | variable | no disponible en la informacion |
| Stable Diffusion 1.5 (base) | no disponible | 512x512 | CreativeML OpenRAIL-M | Hugging Face |
| Stable Diffusion XL (base) | no disponible | 1024x1024 | CreativeML OpenRAIL++-M | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de estilo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `other` con restriccion explicita de uso no comercial: solo investigacion y docencia; los personajes de Naruto estan protegidos por derechos de autor.
- Rendimiento debil en prompts fuera de dominio, segun el propio autor.
- Las captions BLIP del dataset son cortas, lo que limita la precision del condicionamiento textual.
- Riesgo de sobreajuste al estilo y a los personajes del dataset, con poca generalizacion a otras esteticas.
- Posibles sesgos heredados del dataset `lambdalabs/naruto-blip-captions` y del modelo base Stable Diffusion 1.5.
- Riesgo de alucinacion visual: el modelo puede generar anatomias o composiciones incoherentes, habitual en adaptadores de bajo rango y pocos pasos de entrenamiento.
- Solo se documentan prompts en ingles; el comportamiento multilingue no esta verificado.
- Repo de 0.0 GB y 0 descargas: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento posterior.
- No apto para produccion sin una evaluacion adicional de calidad, sesgos y cumplimiento legal.

## Enlaces

- Hugging Face: https://huggingface.co/Poushali0220/naruto-sd15-poushali-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
