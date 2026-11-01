# sanabada/data266-team26-p2-naruto-run2-dora-r16

## Resumen

`sanabada/data266-team26-p2-naruto-run2-dora-r16` es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) de bajo rango entrenado sobre Stable Diffusion 1.5 para transferir el estilo visual del conjunto de datos `lambdalabs/naruto-blip-captions` al pipeline de generacion texto-a-imagen. Lo publica el usuario sanabada en el contexto del laboratorio DATA 266 (equipo 26, segunda ejecucion, version final) y se distribuye como pesos compatibles con la libreria `diffusers`, con un tamano de repositorio de 0,3 GB.

El modelo no es un generador autonomo: es un adaptador de atencion que se carga sobre el checkpoint `stable-diffusion-v1-5/stable-diffusion-v1-5` (revision `451f4fe161`) y modifica unicamente las proyecciones `to_k`, `to_q`, `to_v` y `to_out.0` de los bloques de atencion del UNet. Con 3.288.576 parametros entrenables (0,381 % del UNet), el adaptador es extremadamente ligero y su entrenamiento completo requirio 0,807 GPU-horas en una Tesla T4 con un pico de 3,31 GiB de memoria.

Su interes es fundamentalmente metodologico y docente: documenta de forma reproducible el efecto de DoRA frente a LoRA clasico en un caso de ajuste de estilo con captions automaticos BLIP, e incluye metricas objetivas (KID, CLIP score, LPIPS) frente al modelo base. No esta pensado como un modelo de produccion generalista, sino como una pieza de investigacion academica no comercial sobre adaptacion de estilo en difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA sobre UNet de Stable Diffusion 1.5 (solo atencion: `to_k`, `to_q`, `to_v`, `to_out.0`) |
| Parametros totales | 3.288.576 parametros entrenables (0,381 % del UNet); el modelo base SD 1.5 no esta incluido en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de tokens) |
| Tipos de cuantizacion | fp16 (entrenado y documentado en fp16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder CLIP de SD 1.5) |
| Licencia | CreativeML OpenRAIL-M (heredada de SD 1.5); uso declarado por el autor: solo investigacion academica no comercial |
| Formato de pesos | pesos de adaptador compatibles con `diffusers` (`load_lora_weights`); safetensors no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5, un modelo de difusion latente con text encoder CLIP y VAE congelados. DoRA descompone los pesos preentrenados en magnitud y direccion, y entrena un componente de bajo rango (rank 16, alpha 16) sobre esa descomposicion; en este caso solo en las proyecciones de atencion (`to_k`, `to_q`, `to_v`, `to_out.0`). El resultado es un delta de 3,29 M de parametros sobre un UNet de aproximadamente 860 M, lo que explica el reducido tamano del repositorio (0,3 GB) y el bajo coste de entrenamiento.

Los datos de entrenamiento son `lambdalabs/naruto-blip-captions`: 1221 imagenes, de las cuales no se descarto ninguna por corrupcion ni duplicado, divididas en 1099 de entrenamiento y 122 de test (90/10, semilla 266), recortadas al centro a 512x512 y con captions BLIP usadas como prompts. El entrenamiento consistio en 2000 pasos con batch 4 (7,28 epocas), optimizador AdamW con learning rate 0,0001, scheduler coseno, 100 pasos de warm-up, Min-SNR con gamma 5,0 y precision fp16, ejecutado en una Tesla T4 con 0,807 GPU-horas y un pico de 3,31 GiB.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el estilo aprendido del dataset Naruto, sobre el pipeline de SD 1.5.
- Transferencia de estilo visual: el adaptador modula las proyecciones de atencion del UNet para aproximar la estetica anime del conjunto de entrenamiento.
- Compatibilidad con el ecosistema `diffusers`: se carga con `pipe.load_lora_weights(...)` sobre `StableDiffusionPipeline`.
- Composicion con otros adaptadores: al ser un adaptador de atencion, puede combinarse tecnicamente con otros LoRA/DoRA cargados en el mismo pipeline (no validado en la model card).
- Soporte de prompts en lenguaje natural (captions BLIP), sin control por nombre de personaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vision de entrada.

## Casos de uso

- Investigacion academica sobre adaptacion de estilo: reproducir el experimento del laboratorio DATA 266 para comparar DoRA frente a LoRA en un mismo dataset y presupuesto de computo (0,807 GPU-horas en T4).
- Docencia en ajuste fino de modelos de difusion: el adaptador es lo bastante pequeno (3,29 M parametros, 0,3 GB) para que estudiantes lo entrenen y evalúen en una GPU consumer o en un entorno cloud gratuito.
- Generacion de ilustraciones de estilo anime para prototipos no comerciales: promoviendo con descripciones genericas ("a man with blue hair and a black shirt") se obtienen imagenes con la estetica aprendida, util para maquetas y pruebas de concepto.
- Estudio de metricas de evaluacion generativa: usar los valores publicados (KID 0,0955, CLIP 23,14, LPIPS 0,817) como linea base para comparar tecnicas de adaptacion en dominios de estilo unico.
- Analisis de deriva de dominio: medir como un adaptador de estilo afecta a prompts fuera de dominio, ya que el autor documenta que las peticiones out-of-domain tienden a derivar hacia el estilo anime.
- Benchmarking de pipelines de difusion: integrar el adaptador en un banco de pruebas con DPM-Solver++ a 30 pasos y CFG 7,5 para medir latencia y calidad en hardware modesto (T4, RTX 3060/4090).
- No recomendado para atencion al cliente, generacion de codigo, agentes ni tareas de razonamiento: el modelo no es un LLM y no dispone de esas capacidades.

## Benchmarks y rendimiento

Evaluacion del autor con 20 prompts fijos y semillas 0 y 1, sampler DPM-Solver++ a 30 pasos y CFG 7,5:

| Metrica | Adaptador DoRA | SD 1.5 base |
|---|---|---|
| KID in-domain (menor es mejor) | 0,0955 ± 0,0074 | 0,1151 |
| CLIP score (mayor es mejor) | 23,14 | 26,05 |
| LPIPS diversity (mayor es mejor) | 0,817 | 0,754 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo texto-a-imagen. El autor advierte que el KID calculado sobre 20 imagenes es ruidoso.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en fp16 ocupa aproximadamente 6,6 MB (3,29 M parametros x 2 bytes); el pipeline completo de SD 1.5 en fp16 requiere en torno a 4-6 GB de VRAM, aunque la cifra exacta no esta documentada en la model card.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; el autor entreno en una Tesla T4 (pico de 3,31 GiB solo para el entrenamiento del adaptador).
- Cabe en GPU consumer: si, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` (metodo documentado); tambien es compatible con ecosistemas que cargan LoRA sobre SD 1.5 (por ejemplo, A1111/ComfyUI mediante conversion), aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles; el autor solo reporta el coste de entrenamiento (0,807 GPU-horas en T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA r16 sobre SD 1.5) | 3,29 M entrenables | no aplica | KID 0,0955; CLIP 23,14; LPIPS 0,817 | CreativeML OpenRAIL-M (uso academico no comercial segun autor) | HuggingFace, 17 descargas |
| SD 1.5 base | ~860 M (UNet) | no aplica | KID 0,1151; CLIP 26,05; LPIPS 0,754 | CreativeML OpenRAIL-M | HuggingFace, ampliamente disponible |
| LoRA equivalente sobre SD 1.5 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos publicados de un LoRA comparable entrenado por el mismo equipo en la informacion proporcionada, por lo que la comparacion directa DoRA frente a LoRA no puede cuantificarse aqui.

## Limitaciones y advertencias

- Aprende el estilo de una unica franquicia a partir de ~1099 imagenes con captions automaticas genericas: los personajes no pueden solicitarse por nombre.
- Los prompts fuera de dominio derivan hacia la estetica anime, lo que sesga la salida hacia ese estilo.
- Los prompts composicionales (colores, recuentos, posiciones) suelen producir resultados incorrectos.
- El KID se calcula sobre solo 20 imagenes, por lo que es una metrica ruidosa y poco fiable para conclusiones fuertes.
- El CLIP score empeora respecto al base (23,14 frente a 26,05), lo que sugiere menor alineacion prompt-imagen.
- Las imagenes de entrenamiento representan personajes con derechos de autor: el autor restringe el uso a investigacion academica no comercial.
- La licencia CreativeML OpenRAIL-M permite cierto uso comercial del adaptador, pero el propio autor anade la restriccion de no comercial por el contenido del dataset; en produccion debe revisarse esta tension.
- Debe mantenerse activo el safety checker de SD y no usarse para imitar o suplantar a personas reales.
- No es un LLM: carece de razonamiento, codigo, tool calling, agentes y capacidades multilingues en el sentido de un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanabada/data266-team26-p2-naruto-run2-dora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la informacion proporcionada
- Blog o repositorio del laboratorio DATA 266: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
