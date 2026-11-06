# abbuibuibui/KurisuMakise-Lora

## Resumen
KurisuMakise-Lora es un adaptador LoRA (Low-Rank Adaptation) de tipo personaje para modelos de difusion SDXL, entrenado especificamente sobre la base waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y sirve para generar imagenes consistentes de Kurisu Makise, la protagonista de la novela visual y anime Steins;Gate, manteniendo su identidad facial, su paleta de pelo rojo caoba y ojos azules, y sus atuendos caracteristicos (bata de laboratorio con corbata roja, camisa blanca con chaqueta marron y abrigo con capucha crema).

El modelo no es un LLM ni un sistema multimodal de texto: es un adaptador de difusion que se carga sobre un checkpoint SDXL/Illustrious y se invoca mediante tokens de activacion dentro de un prompt. Su relevancia esta en la consistencia de personaje para proyectos de fan art, generacion de ilustraciones y pipelines de contenido visual, con un proceso de evaluacion comparativa entre epocas documentado publicamente por el autor.

El repositorio ocupa 3,2 GB e incluye siete epocas de entrenamiento en formato safetensors, cada una de 456.494.220 bytes, junto con material de evaluacion visual. La recomendacion del autor es usar la epoca E6 con fuerza 0.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (base waiIllustriousSDXL v17); rango 64, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; cada safetensors pesa 456.494.220 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en, zh (etiquetas de idioma del repositorio; los prompts se interpretan via el text encoder del checkpoint base) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 ficheros de epoca) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 64 con alpha 32 aplicado sobre el checkpoint SDXL waiIllustriousSDXL v17. El entrenamiento uso AdamW en bf16, buckets con limite de 1536 y 7 epocas. El dataset consta de 102 pares imagen-texto con 3 atuendos y repeticiones 3, y esta publicado como abbuibuibui/KurisuMakise-Dataset. Las captions se generaron con keep_tokens = 2, omitiendo con frecuencia el color de pelo y ojos, por lo que el autor recomienda anadir explicitamente "long hair, red hair, blue eyes" en el prompt.

La innovacion practica del repositorio es la evaluacion comparativa entre epocas: una primera ronda cribo E1-E7 a fuerza 0.8 y una tercera ronda hizo una matriz sobre E5, E6 y E7 con 10 escenas y 4 fuerzas (0.4, 0.6, 0.8, 1.0). El resultado recomienda E6 a 0.8 por estabilidad de silueta (flequillo rojo caoba, ojos azul/violeta, bata y corbata roja), dejando E5 y E7 como alternativas.

## Capacidades
- Generacion de imagenes de personaje consistente de Kurisu Makise en retrato, tres cuartos, perfil y cuerpo completo.
- Control de atuendos mediante tokens dedicados: kurisu_makise_lab_coat, kurisu_makise_white_shirt_brown_jacket y kurisu_makise_cream_hooded_coat.
- Composicion de escenas variadas: fondos simples, escenas complejas, calle nocturna, poses sentadas.
- Funciona con y sin token de atuendo (el autor documenta el caso "no outfit token").
- Integracion en pipelines de difusion via diffusers y en ComfyUI mediante sintaxis `<lora:nombre:fuerza>`.
- No dispone de tool calling, razonamiento multi-step, vision ni audio: es exclusivamente un adaptador de generacion de imagen.
- Cobertura multilingue limitada a las etiquetas en/zh del repositorio; la calidad del prompt depende del text encoder del modelo base.

## Casos de uso
- Ilustracion de fan art de Steins;Gate: cargar el LoRA sobre waiIllustriousSDXL y componer retratos con el token kurisu_makise a fuerza 0.8 para obtener consistencia facial entre imagenes de una misma serie.
- Creacion de fichas de personaje para wikis o proyectos de documentacion visual: generar vistas frontal, tres cuartos y perfil con los mismos ajustes (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) para mantener coherencia.
- Variaciones de vestuario en un mismo proyecto: alternar kurisu_makise_lab_coat y kurisu_makise_white_shirt_brown_jacket para producir sets de imagenes del personaje en distintos contextos narrativos.
- Escenas ambientadas: usar el LoRA en composiciones de calle nocturna o fondos complejos, aprovechando la evaluacion del autor que cubre explicitamente escenas simples y complejas.
- Prototipado rapido de portadas o banners para comunidades de fans: generar bocetos en ComfyUI con el flujo documentado y refinar despues en edicion.
- Pruebas de pipelines de difusion: servir como caso de referencia para validar la integracion de LoRAs de personaje en diffusers o ComfyUI antes de desplegar adaptadores propios.
- Generacion por lotes de variantes de pose: la matriz de evaluacion E5/E6/E7 x 4 fuerzas sirve de guia para elegir el punto de equilibrio entre fidelidad al personaje y flexibilidad compositiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numericos (FID, CLIP score, etc.) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa entre epocas:

| Candidata | Observacion | Decision |
|---|---|---|
| E5 | Pelo rojo largo y ojos azules utilizables; bata a menudo presente | Alternativa |
| E6 | Retrato con flequillo rojo caoba, ojos azul/violeta, bata y corbata roja; silueta estable | Recomendada a 0.8 |
| E7 | Muy cercana a E6 | Alternativa final |

Ajustes de referencia del showcase: E6 a 0.8, ComfyUI, Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires ni ADetailer.

## Requisitos de hardware
- El adaptador pesa unos 456 MB por epoca; el checkpoint base SDXL waiIllustriousSDXL es el que determina el grueso del consumo de VRAM.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del checkpoint base y de la precision (fp16/bf16) y del tamano de imagen.
- GPU recomendadas: no disponible. Para SDXL en general se suele requerir una GPU con VRAM suficiente para el checkpoint base a 832x1216; el dato concreto no consta en la ficha del autor.
- Cabe en GPU de consumo: no disponible como dato verificado; el showcase se genero en ComfyUI, pero no se especifica la GPU empleada.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (flujo documentado en el showcase).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KurisuMakise-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | no disponible (rango 64) | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| Alternativas de LoRA de personaje para Illustrious/SDXL | LoRA de personaje | SDXL / Illustrious | no disponible | no aplica | variable segun autor | no disponible |
| Checkpoint base waiIllustriousSDXL v17 | Modelo completo SDXL | SDXL | no disponible | no aplica | no disponible | no disponible |

No se dispone en la informacion proporcionada de comparativas numericas con otros LoRAs de personaje ni de resultados de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- Es una obra derivada no oficial: los derechos de Kurisu Makise y Steins;Gate permanecen con sus titulares; el autor lo declara explicitamente.
- Licencia creativeml-openrail-m: impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar sus terminos antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste al personaje y al atuendo: a fuerzas altas puede rigidizar la composicion; el autor recomienda 0.8 y documenta el barrido 0.4-1.0.
- Las captions omiten con frecuencia el color de pelo y ojos, por lo que es necesario anadir "long hair, red hair, blue eyes" para evitar desviaciones cromaticas.
- Dataset pequeno (102 pares, 3 atuendos), lo que limita la variedad de poses y expresiones fuera de las cubiertas en el entrenamiento.
- Dependencia total del checkpoint base waiIllustriousSDXL v17: el rendimiento en otras bases SDXL o Illustrious no esta documentado.
- Idiomas declarados en/zh; la calidad de seguimiento de prompt en otros idiomas no esta verificada.
- No hay benchmarks cuantitativos ni comparativas con otros LoRAs, por lo que la evaluacion de calidad es exclusivamente cualitativa y realizada por el propio autor.
- Fecha de creacion del repositorio en 2026-11-03; verificar la vigencia de los ficheros y de las recomendaciones antes de usarlo.

## Enlaces
- Hugging Face: https://huggingface.co/abbuibuibui/KurisuMakise-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/KurisuMakise-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/KurisuMakise-Lora
- Perfil del autor: https://huggingface.co/abbuibuibui/models
- README en chino: ./README_zh.md (dentro del repositorio)
- Notas de evaluacion en chino: ./evaluation/横向测评记录.md (dentro del repositorio)
