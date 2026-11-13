# itzmnv/data266-lab2-sd15-pokemon-lora-r32

## Resumen

`itzmnv/data266-lab2-sd15-pokemon-lora-r32` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 para la generacion de imagenes de personajes tipo Pokemon. Lo publica el usuario itzmnv como parte de un trabajo de laboratorio (etiqueta `data266-lab2`), y no como un modelo de produccion. El repositorio no contiene pesos en el momento de la consulta (tamano de 0.0 GB), por lo que el artefacto distribuible es la configuracion y, previsiblemente, los pesos del adaptador si se suben mas adelante.

El modelo resuelve un problema acotado: especializar un modelo de difusion texto-a-imagen generico en un unico estilo visual mediante un ajuste fino de bajo rango. Con 6.377.472 parametros entrenables y 2200 pasos, el adaptador se entrena en menos de 75 minutos sobre una GPU con 4,52 GB de pico de memoria, lo que lo situa en la categoria de experimentos reproducibles en hardware de consumo.

Su relevancia es limitada fuera del ambito docente: se apoya en Stable Diffusion 1.5 (contexto de texto de 77 tokens, resolucion nativa 512x512), usa un dataset pequeno de 825 imagenes con leyendas BLIP genericas y su licencia efectiva queda restringida a investigacion no comercial por la naturaleza del dataset y de los personajes representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion 1.5 (difusion latente) |
| Parametros totales | no disponible (solo se declaran 6.377.472 parametros entrenables del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del tokenizador CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | CreativeML OpenRAIL-M, con restriccion adicional a uso no comercial por el dataset |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB) |
| Rango LoRA | 32 |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Dataset de entrenamiento | reach-vb/pokemon-blip-captions (825 imagenes, CC BY-NC-SA 4.0) |
| Pasos de entrenamiento | 2200 |
| Learning rate | 0.0001 |
| Batch efectivo | 4 (batch 1 x acumulacion de gradientes 4) |
| Memoria GPU pico | 4,52 GB |
| Tiempo de entrenamiento | 74,6 minutos (1,24 GPU-horas) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre el UNet de Stable Diffusion 1.5, un modelo de difusion latente con un autoencoder VAE, un codificador de texto CLIP y un UNet con bloques de atencion cruzada. El rango 32 determina la dimension de las matrices de baja jerarquia insertadas en las capas lineales; con 6.377.472 parametros entrenables, el adaptador es tres ordenes de magnitud menor que el modelo base, lo que permite cargarlo y descargarlo sin duplicar los pesos completos.

El entrenamiento usa 2200 pasos con learning rate 1e-4 y batch efectivo de 4 sobre el dataset `reach-vb/pokemon-blip-captions`, compuesto por 825 imagenes con leyendas generadas por BLIP. No se documenta el uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un ajuste de difusion de este tipo. El autor senala explicitamente que el modelo aun no se ha evaluado contra su variante de rango 8 y que la eleccion final entre ambas y la model card completa con resultados de generacion llegaran tras ejecutar `p2_generate_eval.ipynb`.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompts en ingles, heredada de Stable Diffusion 1.5.
- Especializacion estilistica en personajes tipo Pokemon a partir de las leyendas BLIP del dataset.
- Carga como adaptador LoRA sobre el checkpoint base de SD 1.5, sin necesidad de reentrenar el modelo completo.
- Compatible con el ecosistema de difusion (Diffusers, pipelines de LoRA) en la medida en que los pesos esten disponibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del condicionamiento textual.

## Casos de uso

- Docencia y practicas de ajuste fino: el adaptador sirve como ejemplo reproducible de entrenamiento LoRA en difusion, con hiperparametros y consumo de memoria documentados (4,52 GB, 1,24 GPU-horas).
- Experimentacion con rangos LoRA: comparar rango 8 frente a rango 32 sobre el mismo dataset para estudiar el compromiso entre capacidad de estilo y sobreajuste.
- Generacion de ilustraciones de referencia no comerciales: crear bocetos de personajes con estetica Pokemon para prototipos internos de investigacion.
- Estudio de sesgos de captioning: analizar como las leyendas BLIP genericas hacen que el modelo priorice colores y fondos blancos sobre la identidad del personaje.
- Pruebas de pipelines de difusion: validar la carga de adaptadores LoRA sobre SD 1.5 en entornos de investigacion con GPUs de gama media.
- Base para futuros ajustes: partir de este adaptador para afinar con un dataset mayor o con leyendas mas descriptivas antes de evaluar su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluacion comparativa frente a la variante de rango 8 esta pendiente (`p2_generate_eval.ipynb`).

## Requisitos de hardware

- VRAM de inferencia: el entrenamiento alcanzo 4,52 GB de pico; la inferencia con SD 1.5 mas el adaptador LoRA deberia situarse en un rango similar, aunque no se documenta una cifra exacta.
- GPU recomendadas: no disponibles de forma especifica; por el perfil de memoria, tarjetas con 6-8 GB o mas son suficientes para el ajuste, y GPUs de consumo como la RTX 3060 o superiores deberian cubrir inferencia y entrenamiento ligero.
- Cabe en GPU de consumo: si, segun el pico de 4,52 GB declarado para el entrenamiento.
- Opciones de despliegue: Diffusers con carga de adaptadores LoRA es la via natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| itzmnv/data266-lab2-sd15-pokemon-lora-r32 | 6.377.472 entrenables (LoRA r32) | 77 tokens (CLIP SD 1.5) | no disponible | CreativeML OpenRAIL-M con restriccion no comercial | Repositorio sin pesos (0.0 GB) |
| Variante de rango 8 del mismo autor | no disponible | 77 tokens | no disponible (evaluacion pendiente) | misma | no disponible |
| Stable Diffusion 1.5 (base) | no disponible en la informacion | 77 tokens | no disponible | CreativeML OpenRAIL-M | publico |
| Otros LoRA de Pokemon sobre SD 1.5 | no disponible | 77 tokens | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Dataset pequeno (825 imagenes) y de un unico estilo, con leyendas BLIP cortas y genericas: el modelo tiende a fondos blancos y a apoyarse en palabras de color mas que en la identidad o la pose del personaje.
- Restriccion de uso: los personajes Pokemon estan protegidos por derechos de autor y el dataset es CC BY-NC-SA 4.0, por lo que el modelo y sus salidas quedan limitados a investigacion no comercial.
- Licencia CreativeML OpenRAIL-M con clausulas de uso aceptable; conviene revisar el texto completo antes de cualquier despliegue.
- Riesgo de sobreajuste al estilo del dataset y de generar resultados poco diversos con prompts fuera de distribucion.
- No evaluado formalmente: no hay benchmarks ni comparacion publicada con la variante de rango 8.
- Repositorio sin pesos en el momento de la consulta (0.0 GB), lo que impide su uso directo sin que el autor los suba.
- Sin soporte documentado de otros idiomas en los prompts; las leyendas de entrenamiento estan en ingles.
- No apto para tareas de razonamiento, codigo, agentes ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/itzmnv/data266-lab2-sd15-pokemon-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia del modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/blob/main/LICENSE.md
- Dataset: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
