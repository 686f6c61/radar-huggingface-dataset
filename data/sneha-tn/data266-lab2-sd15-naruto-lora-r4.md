# sneha-tn/data266-lab2-sd15-naruto-lora-r4

## Resumen

`data266-lab2-sd15-naruto-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imagenes de estilo anime inspiradas en el universo Naruto. Lo desarrolla Sneha Tumkur Narendra en el marco del laboratorio DATA 266 (Pair_Programming_Team_21) y se publica como baseline reproducible de un ejercicio academico de ajuste fino de modelos de difusion. No es un modelo fundacional: es un conjunto de pesos de bajo rango que se cargan sobre el checkpoint original de SD 1.5.

El adaptador se entrena sobre el dataset `lambda/naruto-blip-captions`, un conjunto de imagenes de anime con leyendas generadas automaticamente por BLIP, usando un split congelado de 1.099 imagenes de entrenamiento y 122 de test. La intervencion es minima: 797.184 parametros entrenables sobre las capas de atencion del UNet (`to_q`, `to_k`, `to_v`, `to_out.0`), con rango 4 y alpha 4.

Su relevancia es fundamentalmente didactica y de reproducibilidad: documenta con detalle el coste de entrenamiento (0,36 GPU-horas en una Tesla T4, 4,45 GiB de pico de memoria) y una evaluacion cuantitativa frente al modelo base. Para produccion real no es un candidato adecuado, dado su alcance estrecho, la naturaleza no comercial de los personajes representados y el tamano reducido de su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 797.184 parametros entrenables (adaptador); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto textual en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16/safetensors) |
| Idiomas soportados | no disponible (prompts en ingles segun los ejemplos de la model card) |
| Licencia | CreativeML OpenRAIL-M (modelo base); uso limitado a investigacion no comercial por copyright de los personajes |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`, sha256 `fe59424849726fbc2459bf0b42ccaf6eeca09ad4255d7ea05ec4e0199cc8d5d1`) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 y alpha 4 exclusivamente sobre las proyecciones de atencion del UNet de Stable Diffusion 1.5 (`to_q`, `to_k`, `to_v`, `to_out.0`). El entrenamiento usa el dataset `lambda/naruto-blip-captions` en la revision `1ed13e8ef280bd45e3bbac4cfa8bbd9d64ec9f89`, con un split congelado (semilla 266) de 1.099 imagenes de entrenamiento y 122 de test; las imagenes de test nunca se usaron para entrenar. Las leyendas son generadas automaticamente por BLIP, lo que implica un sesgo hacia descripciones cortas y repetitivas.

La configuracion de entrenamiento es: learning rate 1e-4 con 50 pasos de warmup y decaimiento constante, 1.000 pasos, batch de 4 (3,64 epocas), resolucion 512x512, autocast en fp16 y semilla 266. El coste medido es de 797.184 parametros entrenables, 4,453 GiB de memoria GPU pico y 1.302,8 segundos de entrenamiento (0,3619 GPU-horas en una Tesla T4). No se documenta uso de RLHF, DPO ni tecnicas de alineacion; es un ajuste supervisado directo sobre pares imagen-texto.

## Capacidades

- Generacion de imagenes text-to-image en el dominio anime/Naruto, condicionada por prompts en lenguaje natural.
- Especializacion en el estilo visual del dataset de entrenamiento (personajes, paleta y composicion propios del anime de referencia).
- Compatibilidad con el ecosistema Diffusers: carga mediante `load_lora_weights` sobre el pipeline `StableDiffusionPipeline`.
- Control de muestreo mediante DDIM (30 pasos, CFG 7.5 en la evaluacion documentada).
- Filtro de seguridad NSFW de Stable Diffusion activo durante la inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la generacion de imagen a partir de texto.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Investigacion academica sobre ajuste fino eficiente: sirve como baseline reproducible para comparar tecnicas de LoRA (rango, alpha, capas objetivo) con un coste de 0,36 GPU-horas en T4.
- Docencia en cursos de difusion: permite demostrar el impacto de un adaptador de 797.184 parametros frente al modelo base usando las metricas KID y CLIP documentadas.
- Experimentos de evaluacion de fidelidad vs alineacion: el trade-off medido (KID baja de 0,1275 a 0,0185 mientras CLIP baja de 30,12 a 29,42) es un caso de estudio util para discutir como el ajuste estrecho mejora la distribucion pero degrada ligeramente el seguimiento de prompts.
- Generacion de imagenes de referencia para prototipos de estilo anime en entornos de investigacion no comercial, siempre que se respeten las restricciones de copyright.
- Pruebas de pipelines de seguridad: el aumento de imagenes bloqueadas por el filtro NSFW (de 1/40 a 4/40) permite estudiar el comportamiento del safety checker ante adaptadores de dominio especifico.
- Reproduccion de experimentos: el hash del adaptador y la revision exacta del modelo base permiten replicar los resultados bit a bit en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | SD 1.5 base | Este LoRA |
|---|---|---|
| KID, in-domain vs imagenes de test (menor es mejor) | 0,1275 ± 0,0112 | 0,0185 ± 0,0064 |
| CLIP score, in-domain | 30,12 | 29,42 |
| CLIP score, todos los prompts | 33,19 | 32,51 |
| Diversidad LPIPS, semilla 0 vs semilla 1 | 0,7188 | 0,7094 |
| Imagenes marcadas por el filtro NSFW | 1/40 | 4/40 |

La evaluacion usa 20 prompts congelados (10 in-domain, 5 out-of-domain y 5 composicionales), semillas 0 y 1, muestreador DDIM con 30 pasos y CFG 7,5. El propio autor advierte que el KID se calcula sobre aproximadamente 16 a 19 imagenes generadas, por lo que la metrica es ruidosa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base SD 1.5 en fp16 requiere del orden de 4-6 GiB, y el adaptador anade una carga despreciable (797.184 parametros).
- Memoria GPU pico durante el entrenamiento: 4,453 GiB (medido en Tesla T4).
- GPU recomendadas: cualquier GPU con al menos 6-8 GiB de VRAM para inferencia; Tesla T4 suficiente para entrenamiento del adaptador en 0,36 GPU-horas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GiB), RTX 4060 Ti, RTX 4070 o superiores; en 8 GiB puede requerir atencion eficiente o fp16.
- Opciones de despliegue: Diffusers (`StableDiffusionPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge y otros frontends compatibles con LoRA de SD 1.5. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput: no disponibles; el autor solo reporta tiempo de entrenamiento (1.302,8 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sneha-tn/data266-lab2-sd15-naruto-lora-r4` | LoRA sobre SD 1.5 | 797.184 (adaptador) | 512x512 | CreativeML OpenRAIL-M, uso no comercial por copyright | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Difusion latente | ~860 M (UNet) | 512x512 | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de anime sobre SD 1.5 | LoRA | Variable (tipicamente 1-10 M) | 512x512 | Variable segun autor | Depende del autor |
| SDXL + LoRA de estilo | Difusion latente | ~2,6 B (UNet) | 1024x1024 | CreativeML OpenRAIL++-M | Disponible |

No se dispone de datos de benchmarks comparativos con otros LoRA de anime en la informacion proporcionada; la unica comparacion cuantitativa es contra el modelo base SD 1.5.

## Limitaciones y advertencias

- Sesgo de dominio: el dataset cubre una distribucion anime estrecha con leyendas cortas y repetitivas generadas por BLIP; el modelo generaliza mal fuera de ese estilo.
- Alineacion de prompt: el CLIP score cae ligeramente frente al base (29,42 vs 30,12 in-domain; 32,51 vs 33,19 en todos los prompts), lo que indica peor seguimiento de instrucciones textuales.
- Ruido en la evaluacion: el KID se calcula sobre solo 16-19 imagenes generadas, por lo que las cifras no son estadisticamente robustas.
- Aumento de falsos positivos del filtro NSFW: 4/40 imagenes bloqueadas frente a 1/40 del base, lo que puede degradar la experiencia en produccion.
- Restriccion legal: los personajes de Naruto estan sujetos a copyright; el autor limita explicitamente el uso a investigacion no comercial, lo que prevalece sobre la licencia CreativeML OpenRAIL-M del modelo base.
- Alcance funcional: no es un LLM; no soporta razonamiento, codigo, tool calling ni agentes. Cualquier uso que requiera esas capacidades queda fuera de su proposito.
- Idiomas: no hay evidencia de soporte multilingue; los prompts de ejemplo y la evaluacion estan en ingles.
- Repositorio de 0,0 GB: el checkpoint base no se incluye, solo el adaptador; requiere descargar SD 1.5 por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sneha-tn/data266-lab2-sd15-naruto-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambda/naruto-blip-captions
- Diffusers (libreria de inferencia): https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
