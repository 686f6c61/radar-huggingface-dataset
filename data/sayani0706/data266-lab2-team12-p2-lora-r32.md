# sayani0706/data266-lab2-team12-p2-lora-r32

## Resumen

`sayani0706/data266-lab2-team12-p2-lora-r32` es un adaptador LoRA de rango 32 entrenado sobre Stable Diffusion 1.5 (512x512) para especializar el modelo base en la generacion de imagenes con el estilo visual y los personajes del universo Naruto. Lo desarrolla el usuario de Hugging Face sayani0706 en el contexto de un trabajo academico (DATA 266, Lab 2, equipo 12), y se distribuye como pesos de adaptador compatibles con la libreria `diffusers`. No es un modelo autonomo: requiere cargar Stable Diffusion 1.5 como base y aplicar el LoRA encima.

El adaptador se entrena sobre el dataset `lambdalabs/naruto-blip-captions`, del que se conservan 1221 imagenes con sus leyendas BLIP, divididas en 1099 de entrenamiento y 122 de test. La intervencion es minima en terminos de parametros: solo 6.377.472 parametros entrenables (un 0,737 % del UNet), aplicados a las proyecciones de atencion `to_q`, `to_k`, `to_v` y `to_out` del UNet. El entrenamiento se realizo en una unica Tesla T4 durante 0,823 GPU-horas, con un pico de 3,79 GB de memoria, lo que lo convierte en un ejemplo de ajuste fino muy ligero y reproducible.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra como un LoRA de rango moderado puede reducir de forma sustancial el KID frente al modelo base en el dominio objetivo (0,0408 frente a 0,1032), manteniendo la diversidad de muestras (LPIPS 0,8147 frente a 0,8088). No obstante, la model card advierte de limitaciones claras: las leyendas BLIP genericas ofrecen un control textual debil, las peticiones fuera de dominio derivan hacia el estilo anime y la metrica KID se calcula sobre solo 20 imagenes, por lo que es ruidosa. La licencia CreativeML OpenRAIL-M y la naturaleza copyright de los personajes restringen el uso a investigacion y educacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 6.377.472 parametros entrenables en el adaptador (0,737 % del UNet); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp16; el modelo base admite fp16/fp32 y cuantizaciones de la comunidad, no documentadas en la model card) |
| Idiomas soportados | no disponibles (las leyendas de entrenamiento estan en ingles; el texto de inferencia se procesa con el tokenizador CLIP de SD 1.5) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible de forma explicita; se carga mediante `pipe.load_lora_weights()` de `diffusers` (formato de adaptador diffusers) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA aplicado a un modelo de difusion latente: se congelan los pesos del UNet de Stable Diffusion 1.5 y se insertan matrices de bajo rango en las proyecciones de atencion `to_q`, `to_k`, `to_v` y `to_out`. Con rango r=32 se obtienen 6.377.472 parametros entrenables, equivalentes al 0,737 % del UNet. El VAE y el text encoder CLIP del modelo base permanecen intactos, de modo que el adaptador solo modifica la forma en que el UNet transforma el ruido condicionado por el texto.

El entrenamiento utiliza el dataset `lambdalabs/naruto-blip-captions`: 1221 imagenes conservadas (0 corruptas, 0 duplicados eliminados), con particion 90/10 y semilla 266 (1099 de entrenamiento, 122 de test). Se emplea optimizador con learning rate 0,0001 y scheduler coseno, 1000 pasos, batch efectivo 4, precision mixta fp16 y una unica Tesla T4. El coste total es de 0,823 GPU-horas con un pico de 3,79 GB de memoria. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de un ajuste supervisado convencional con pares imagen-texto generados por BLIP.

## Capacidades

- Generacion de imagenes text-to-image en el estilo visual del universo Naruto, condicionada por prompts en lenguaje natural.
- Especializacion de estilo y personajes sobre Stable Diffusion 1.5 a 512x512, sin necesidad de reentrenar el modelo base.
- Composicion con el pipeline `diffusers` de SD 1.5 mediante `pipe.load_lora_weights(...)`, lo que permite apilar o descargar el adaptador en tiempo de ejecucion.
- Control textual limitado: las leyendas BLIP genericas ("a man with ...") producen un control debil sobre atributos finos del prompt.
- Generacion con el safety checker de SD activado (filtro NSFW) segun indica la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un modelo de imagen.
- Capacidades multilingues no documentadas; el condicionamiento textual depende del tokenizador CLIP de SD 1.5, entrenado principalmente en ingles.

## Casos de uso

- Investigacion academica sobre ajuste fino eficiente: el adaptador sirve como caso reproducible de LoRA r=32 con coste de 0,823 GPU-horas, util para comparar hiperparametros y metricas (KID, LPIPS) en trabajos de difusion.
- Docencia de text-to-image: permite mostrar en clase como un adaptador de 6,3 M de parametros especializa un modelo base de difusion sin reentrenarlo, con ejemplos de deriva de estilo fuera de dominio.
- Generacion de arte conceptual no comercial de tematica anime: util para bocetos y pruebas de estilo en proyectos de investigacion o educativos, siempre que se respete la restriccion de no uso comercial por copyright de los personajes.
- Experimentacion con composicion de LoRAs: al cargarse con `load_lora_weights`, se puede combinar con otros adaptadores de SD 1.5 para estudiar interferencias de estilo y control textual.
- Evaluacion de metricas de generacion: el par de valores KID (0,0408 frente a 0,1032 del base) y LPIPS (0,8147 frente a 0,8088) permite replicar protocolos de evaluacion con 20 prompts y 2 semillas, DPM-Solver 30 pasos y CFG 7,5.
- Prototipado de pipelines de difusion en hardware modesto: el pico de 3,79 GB en entrenamiento y el tamano reducido del adaptador facilitan pruebas en GPUs de consumo para validar flujos de `diffusers` antes de escalar.

## Benchmarks y rendimiento

| Metrica | LoRA r32 | Stable Diffusion 1.5 (base) | Protocolo |
|---|---|---|---|
| KID in-domain vs test | 0,0408 | 0,1032 | 20 prompts x 2 semillas, DPM-Solver 30 pasos, CFG 7,5 |
| CLIP score | no disponible | no disponible | mismo protocolo |
| LPIPS (diversidad) | 0,8147 | 0,8088 | mismo protocolo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card; el adaptador anade solo 6,3 M de parametros al UNet, por lo que el coste dominante es el del modelo base SD 1.5 (tipicamente varios GB en fp16, segun resolucion y batch).
- Entrenamiento documentado: 1x Tesla T4, pico de 3,79 GB, 0,823 GPU-horas para 1000 pasos con batch efectivo 4 y fp16.
- GPU recomendadas: Tesla T4 (validada en el entrenamiento); para inferencia, cualquier GPU compatible con SD 1.5 en `diffusers` (no se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible).
- Cabe en GPU de consumo: el adaptador en si es minimo; la viabilidad depende del modelo base SD 1.5, no documentada aqui.
- Opciones de despliegue: `diffusers` con `pipe.load_lora_weights("sayani0706/data266-lab2-team12-p2-lora-r32")`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayani0706/data266-lab2-team12-p2-lora-r32 | LoRA sobre SD 1.5 | 6.377.472 entrenables | no aplica | creativeml-openrail-m | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Difusion latente | no disponible en la informacion | no aplica | creativeml-openrail-m | Hugging Face |
| Otros LoRA de estilo sobre SD 1.5 | LoRA | no disponible | no aplica | variable | Hugging Face |

La informacion disponible no permite una comparativa cuantitativa con alternativas concretas mas alla del modelo base; los datos de KID y LPIPS de la tabla de benchmarks son la unica referencia comparativa publicada.

## Limitaciones y advertencias

- Control textual debil: las leyendas BLIP genericas del dataset ("a man with ...") limitan la capacidad de seguir prompts detallados.
- Deriva de estilo fuera de dominio: los prompts ajenos al universo Naruto tienden a aproximarse al estilo anime aprendido.
- Metrica ruidosa: el KID se calcula con solo 20 imagenes, por lo que la comparacion con el base debe interpretarse con cautela.
- Copyright: los personajes de Naruto estan protegidos; la model card restringe el uso a investigacion y educacion no comercial.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso (incluida la prohibicion de usos daninos) que deben revisarse antes de cualquier despliegue.
- Filtro NSFW: la generacion mantiene el safety checker de SD activado, lo que puede bloquear contenidos legitimos en algunos casos.
- Sin datos de sesgos especificos, alucinacion visual o rendimiento multilingue en la informacion disponible.
- Modelo sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sayani0706/data266-lab2-team12-p2-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
