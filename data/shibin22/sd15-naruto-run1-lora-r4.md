# Shibin22/sd15-naruto-run1-lora-r4

## Resumen

`Shibin22/sd15-naruto-run1-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imagenes con el estilo visual del universo Naruto. Lo desarrolla el usuario Shibin22 como parte de un ejercicio academico (etiquetado como "DATA 266 Lab 2, Part 2") y se distribuye a traves de Hugging Face con la libreria diffusers. No es un modelo de lenguaje ni un modelo fundacional: es un conjunto de pesos de bajo rango que se acoplan a las capas de atencion del UNet de SD 1.5 para especializar la generacion text-to-image en un dominio concreto.

El modelo resuelve un problema muy acotado: adaptar un generador de imagenes generico a un estilo y una tematica especificos (personajes ninja con estetica anime) con un coste de entrenamiento minimo. Segun la model card, el adaptador entrena solo 797.184 parametros y requiere 3,8 GB de VRAM pico en una RTX 4090, completando el entrenamiento en 8,7 minutos. Es, por tanto, un ejemplo de ajuste eficiente y reproducible mas que una herramienta de produccion.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra como un LoRA de rango muy bajo puede reducir drasticamente el KID en dominio (de 132,50 a 10,47) manteniendo una diversidad LPIPS casi identica a la del modelo base. La licencia CreativeML OpenRAIL-M y la naturaleza de los datos de entrenamiento (imagenes de Narutopedia sin licencia explicita) limitan su uso a investigacion y docencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 4, alpha 4) sobre capas de atencion del UNet de Stable Diffusion 1.5 |
| Parametros totales | 797.184 parametros entrenables (adaptador); el modelo base SD 1.5 tiene aproximadamente 860 M en el UNet |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el prompt se tokeniza con el text encoder CLIP de SD 1.5, limite de 77 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para el modelo y float32 para los adaptadores durante el entrenamiento) |
| Idiomas soportados | no disponible (las captions de entrenamiento estan en ingles, generadas con BLIP) |
| Licencia | CreativeML OpenRAIL-M (uso no comercial segun la model card) |
| Formato de pesos | safetensors via diffusers (repositorio de 0,0 GB reportado, pesos LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 con alpha 4 exclusivamente sobre las capas de atencion del UNet de Stable Diffusion 1.5. El modelo base es un diffusion model latente con un UNet y un text encoder CLIP; el LoRA introduce matrices de baja dimensionalidad que modulan las proyecciones de atencion sin alterar el resto de pesos. El entrenamiento usa 1.098 imagenes (split del 90 %, semilla 266) tras descartar una imagen no utilizable, con recortes centrales de 512x512 y captions BLIP como prompts. El split de test (122 imagenes) se reservo solo para evaluacion.

La configuracion de entrenamiento es: 1.500 pasos, batch size 4, resolucion 512, learning rate 1e-4 con AdamW, 100 pasos de warm-up y scheduler coseno, con min-SNR gamma 5. Se uso precision bfloat16 para los pesos y float32 para los adaptadores. El pico de memoria fue de 3,8 GB en una RTX 4090 y el tiempo total de 8,7 minutos (0,145 GPU-horas). No se menciona RLHF ni DPO, algo esperable en un modelo de difusion; tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste LoRA de bajo rango.

## Capacidades

- Generacion de imagenes text-to-image en el dominio visual de Naruto (personajes ninja, pelo rubio puntiagudo, cintas ninja) mediante prompts en ingles.
- Especializacion de estilo: reproduce la estetica del dataset `lambdalabs/naruto-blip-captions` con alta fidelidad en dominio.
- Integracion con el pipeline `StableDiffusionPipeline` de diffusers mediante `load_lora_weights`.
- Composicion con el modelo base: hereda las capacidades generales de SD 1.5 cuando el prompt se aleja del dominio entrenado, aunque con menor fidelidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del text-to-image.
- Capacidades multilingues: no documentadas; las captions de entrenamiento estan en ingles y los prompts fuera de ese idioma no estan evaluados.

## Casos de uso

- Docencia sobre fine-tuning eficiente: el adaptador sirve como ejemplo reproducible de como un LoRA de rango 4 con 797.184 parametros y 8,7 minutos de entrenamiento reduce el KID en dominio de 132,50 a 10,47, ideal para explicar el impacto del bajo rango en clase.
- Investigacion sobre personalizacion de modelos de difusion: permite comparar el efecto del rango LoRA y del numero de pasos en la fidelidad de dominio frente a la diversidad, usando las metricas KID, CLIP y LPIPS ya publicadas.
- Generacion de arte conceptual no comercial: ilustradores pueden producir bocetos de personajes ninja con estetica anime para prototipos o fanzines, siempre dentro del uso no comercial que exige la licencia.
- Creacion de datasets sinteticos de prueba: util para generar imagenes etiquetadas de estilo anime que alimenten pipelines de aumentacion de datos en experimentos academicos.
- Evaluacion de sesgos y seguridad en difusion: la model card documenta el filtrado con un clasificador NSFW y las flags del safety checker de SD, lo que permite estudiar como un LoRA de dominio estrecho afecta a la tasa de falsos positivos y a la diversidad.
- Demostracion de composicion de adaptadores: sirve para probar la carga y descarga de pesos LoRA en diffusers dentro de un pipeline mayor, verificando que el adaptador no degrada en exceso el CLIP score fuera de dominio (25,01 frente a 25,74 del base).

## Benchmarks y rendimiento

Resultados publicados en la model card con 20 prompts fijos x 2 semillas, DPM-Solver 30 pasos y guidance 7.5:

| Modelo | KID in-domain (x1e3, menor=mejor) | CLIP score all | CLIP in-domain | CLIP out-of-domain | LPIPS diversity |
|---|---|---|---|---|---|
| base (SD 1.5) | 132,50 +- 10,09 | 26,12 | 25,19 | 25,74 | 0,689 |
| run1_lora_r4 | 10,47 +- 4,23 | 24,58 | 23,53 | 25,01 | 0,684 |

La mejora en KID en dominio es de mas de un orden de magnitud, a costa de una ligera perdida de CLIP score global (1,54 puntos) y en dominio (1,66 puntos), con una diversidad LPIPS practicamente intacta (diferencia de 0,005).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste despreciable sobre SD 1.5; el pipeline completo en bfloat16 requiere aproximadamente 4-6 GB de VRAM, y en float32 alrededor de 8-10 GB (estimacion basada en el tamano de SD 1.5, no publicada en la model card).
- VRAM de entrenamiento documentada: 3,8 GB pico en una NVIDIA GeForce RTX 4090 con bfloat16 y adaptadores en float32.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 es suficiente segun los datos publicados.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en bfloat16; en GPUs mas modestas puede requerir cuantizacion o atencion eficiente.
- Opciones de despliegue: diffusers (`StableDiffusionPipeline` + `load_lora_weights`), y por extension del ecosistema SD 1.5, tambien ComfyUI, Automatic1111 y otros frontends que acepten LoRA en formato diffusers o safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shibin22/sd15-naruto-run1-lora-r4 | 797.184 (LoRA) sobre SD 1.5 | 512x512, prompts de hasta 77 tokens | KID in-domain 10,47; CLIP all 24,58 | CreativeML OpenRAIL-M (no comercial) | Hugging Face, 2 descargas |
| stable-diffusion-v1-5/stable-diffusion-v1-5 (base) | aprox. 860 M (UNet) | 512x512, 77 tokens | KID in-domain 132,50; CLIP all 26,12 | CreativeML OpenRAIL-M | Hugging Face, ampliamente disponible |
| Otros LoRA de dominio sobre SD 1.5 | variable (tipicamente 0,5-5 M) | 512x512, 77 tokens | no disponible | variable segun autor | Hugging Face |

No se dispone de datos publicados de otros adaptadores LoRA comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la categoria generica de LoRA de dominio.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de SD 1.5; las captions de entrenamiento son cortas, mayoritariamente sobre un personaje masculino y repiten frases ("a man with ..."), por lo que los prompts fuera de ese patron siguen el estilo con menos fiabilidad.
- Riesgo de alucinacion: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y composiciones incoherentes, especialmente fuera del dominio entrenado.
- Limitaciones de contexto e idioma: el text encoder CLIP de SD 1.5 limita los prompts a 77 tokens; las captions estan en ingles y no se evaluo el rendimiento en otros idiomas.
- Restricciones de licencia: CreativeML OpenRAIL-M, pero la model card restringe explicitamente el uso a investigacion y docencia no comercial. Los personajes de Naruto estan sujetos a copyright y el dataset de origen (Narutopedia via `lambdalabs/naruto-blip-captions`) no declara licencia.
- Caveats para produccion: el repositorio reporta 0,0 GB y solo 2 descargas, sin senales de validacion externa; el adaptador esta pensado como ejercicio academico y no como componente de un sistema en produccion.
- Seguridad: los outputs se filtraron con un clasificador NSFW y las imagenes filtradas se excluyeron de las metricas; en despliegue real conviene mantener el safety checker de SD activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shibin22/sd15-naruto-run1-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
