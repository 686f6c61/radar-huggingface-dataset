# SawantTej/pokemon-sd15-lora-r32

## Resumen

`SawantTej/pokemon-sd15-lora-r32` es un adaptador LoRA de rango 32 para el modelo de difusion texto-a-imagen Stable Diffusion 1.5, desarrollado por el usuario SawantTej en el contexto de la asignatura DATA 266 Lab 2. El adaptador se ha entrenado sobre el conjunto de datos `reach-vb/pokemon-blip-captions` (833 imagenes de personajes tipo Pokemon con leyendas generadas por BLIP) para especializar al modelo base en la generacion de ilustraciones de estilo Pokemon sobre fondo blanco.

El modelo no introduce una arquitectura nueva: se trata de un conjunto de pesos LoRA (6.377.472 parametros entrenables) aplicados sobre las capas de atencion del UNet de Stable Diffusion 1.5. Su relevancia es fundamentalmente didactica y de investigacion: documenta de forma transparente el proceso de ajuste fino, la seleccion entre dos rangos (8 y 32) y una evaluacion cuantitativa con KID, CLIP score y diversidad LPIPS frente al modelo base.

Se trata de un artefacto experimental, no de un modelo de produccion. El propio autor advierte de que el conjunto de entrenamiento es pequeno y muy uniforme, de que las leyendas BLIP contienen errores y de que el uso esta restringido a investigacion y educacion no comercial por los derechos de autor de los personajes y la licencia cc-by-nc-sa-4.0 de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (diffusion model, text-to-image) |
| Parametros totales | 6.377.472 parametros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el autor usa fp16 en inferencia; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento son en ingles via BLIP) |
| Licencia | CreativeML OpenRAIL-M (adaptador); datos de entrenamiento cc-by-nc-sa-4.0 |
| Formato de pesos | no disponible en la informacion proporcionada (repo de 0.0 GB; compatible con `diffusers` via `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion 1.5, un modelo de difusion latente con un UNet como red de denoising y un text encoder CLIP para condicionamiento textual. El LoRA se inserta en las capas de atencion del UNet con rango 32, lo que da lugar a 6.377.472 parametros entrenables. No se modifica la arquitectura del modelo base ni se entrena el VAE ni el text encoder.

El entrenamiento se realizo con el script `train_text_to_image_lora.py` de `diffusers` sobre una unica RTX 4090, con un pico de memoria de 3,75 GB y un tiempo total de 16,7 minutos. Se usaron 3000 pasos, batch size 4 (aproximadamente 16,1 epocas), learning rate 0,0001 con schedule coseno, precision mixta fp16 y semilla 266. Los datos proceden de `reach-vb/pokemon-blip-captions`: 833 imagenes de 512x512, de las que tras eliminar duplicados quedan 830, divididas 90/10 con semilla 266 en 747 imagenes de entrenamiento y 83 de test. Las leyendas fueron generadas automaticamente por BLIP y, segun el autor, muchas no coinciden con las imagenes.

## Capacidades

- Generacion de imagenes texto-a-imagen de personajes tipo Pokemon sobre fondo blanco, mediante el pipeline `StableDiffusionPipeline` de `diffusers`.
- Especializacion de estilo: reproduce la estetica de las ilustraciones del dataset de entrenamiento (personajes unicos, contorno definido, fondo blanco).
- Composicion con el modelo base: al ser un LoRA, puede cargarse sobre SD 1.5 y combinarse con otros adaptadores o con el propio modelo base.
- Control de generacion mediante parametros estandar de difusion (`num_inference_steps`, `guidance_scale`, semilla).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo generativo de imagenes.
- No dispone de capacidades de vision, audio ni modo "thinking".
- Capacidades multilingues: no documentadas; las leyendas de entrenamiento estan en ingles.

## Casos de uso

- Docencia y practicas de ajuste fino: el modelo sirve como ejemplo reproducible de entrenamiento LoRA sobre SD 1.5, con hiperparametros, semilla, hardware y metricas documentados, util para asignaturas de generacion y diffusion models.
- Investigacion sobre evaluacion de LoRA: permite reproducir la comparacion entre rango 8 y rango 32 con KID, CLIP score y diversidad LPIPS, y estudiar la relacion entre capacidad del adaptador y sobreajuste al dominio.
- Generacion de arte conceptual de estilo cartoon: para prototipos de personajes con estetica de dibujo animado sobre fondo blanco, siempre en contexto no comercial.
- Experimentos de composicion de adaptadores: al ser un LoRA ligero, se puede combinar con otros LoRA de estilo o de personaje para estudiar interacciones entre adaptadores en `diffusers`.
- Creacion de datasets sinteticos de prueba: generar imagenes de personajes para pipelines de prueba de sistemas de vision por computador en entornos academicos.
- Estudio de sesgos y alucinacion en modelos de difusion: el autor documenta fallos en prompts con varios objetos, conteos o colores, lo que lo hace util para analizar limites de los modelos texto-a-imagen con datos escasos.

## Benchmarks y rendimiento

Evaluacion del autor: 20 prompts x 2 semillas, 30 pasos, guidance 7.5.

| Metrica | LoRA r32 | Modelo base SD 1.5 |
|---|---|---|
| KID frente a 83 imagenes de test (20 generaciones in-domain) | 0.0361 | 0.0947 |
| CLIP score (todos los prompts) | 32.16 | 32.82 |
| Diversidad LPIPS entre dos semillas | 0.755 | 0.830 |
| Comparacion humana con el modelo base | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (FID, MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son las unicas reportadas y corresponden a una evaluacion propia con solo 20 imagenes generadas, por lo que el autor advierte que las diferencias pequenas no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM, y el adaptador LoRA anade una cantidad marginal.
- Entrenamiento: el autor reporta un pico de 3,75 GB de VRAM en una unica RTX 4090 durante 16,7 minutos.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento); cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder ejecutar la inferencia en fp16, aunque este dato no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, segun los requisitos tipicos de SD 1.5 en fp16 (no verificado explicitamente por el autor para este adaptador).
- Opciones de despliegue: `diffusers` (metodo `load_lora_weights`, documentado en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no son aplicables a modelos de difusion y no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Rango LoRA | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SawantTej/pokemon-sd15-lora-r32 | SD 1.5 | 32 | pokemon-blip-captions (747 train) | CreativeML OpenRAIL-M + cc-by-nc-sa-4.0 | Hugging Face |
| SushmaMaddali/data266-pokemon-sd15-lora-r32 | SD 1.5 | 32 | pokemon-blip-captions | no disponible en detalle; uso academico no comercial | Hugging Face |
| Modelo base stable-diffusion-v1-5 | - | - | LAION (no detallado aqui) | CreativeML OpenRAIL-M | Hugging Face |

Las alternativas comparables son escasas y todas derivan del mismo ejercicio academico (DATA 266 Lab 2) sobre el mismo dataset. No se dispone de datos de rendimiento de la variante de SushmaMaddali ni de otros LoRA de Pokemon en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Conjunto de entrenamiento pequeno y uniforme (747 imagenes de personajes unicos sobre fondo blanco): el estilo puede filtrarse a prompts no relacionados, aunque el autor no lo observo en 5 prompts fuera de dominio.
- Fallos frecuentes en prompts con varios objetos, conteos o colores.
- Leyendas generadas por BLIP con numerosos errores de correspondencia con las imagenes, lo que degrada la alineacion texto-imagen.
- KID calculado sobre solo 20 imagenes generadas: las diferencias pequenas no son estadisticamente significativas.
- El safety checker de Stable Diffusion marco 6 de 120 imagenes; el autor verifico que eran falsos positivos (criaturas cartoon inofensivas).
- Restriccion de licencia: los personajes Pokemon estan protegidos por derechos de autor y los datos son cc-by-nc-sa-4.0, por lo que el modelo y sus imagenes son solo para investigacion y educacion no comercial.
- La licencia CreativeML OpenRAIL-M del modelo base se aplica tambien al adaptador e impone restricciones de uso adicionales.
- No se documentan sesgos especificos mas alla de los derivados del dataset y del modelo base.
- Riesgo de alucinacion visual: el modelo puede generar atributos o combinaciones inexistentes en el dominio de entrenamiento.
- No apto para produccion comercial ni para generacion de contenido con propiedad intelectual de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SawantTej/pokemon-sd15-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Variante academica relacionada: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r32
- Registro externo (metadata pendiente): https://free2aitools.com/model/djdipin/sd15-pokemon-lora-r32
