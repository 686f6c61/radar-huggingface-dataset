# abbuibuibui/FarisNyannyan-Lora

## Resumen

FarisNyannyan-Lora es un LoRA de personaje no oficial para el modelo de difusion SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17. Reproduce a Faris Nyannyan (Akiha Rumiho), personaje de la visual novel y anime *Steins;Gate*, y esta desarrollado por el usuario abbuibuibui. El repositorio es en realidad una coleccion de tres linajes de pesos: el LoRA original para WAI/Illustrious en la raiz, un LoRA para AutismMix Pony bajo `autism_pony/` y un LoRA para MOSS-Image bajo `moss/`, cada uno con su propio modelo base y sus propios prompts de activacion.

El modelo resuelve el problema de consistencia de personaje en generacion de imagenes anime: permite fijar la identidad visual de Faris (coletas taladro rosas, flequillo recto, ojos castano rojizos) y hasta seis variantes de vestuario mediante tokens especificos. Se distribuye en siete epocas de entrenamiento (E1-E7), con E6 recomendada por el autor a fuerza 0.8 tras una evaluacion comparativa en tres rondas.

Es relevante para quienes trabajan con pipelines de generacion de imagen en produccion (ComfyUI, Automatic1111, diffusers) porque documenta de forma inusualmente detallada el proceso de seleccion de epoca, los tokens de activacion y las limitaciones conocidas del LoRA, algo poco habitual en LoRAs de personaje. El tamano del repositorio es de 7.9 GB, aunque cada fichero de pesos individual pesa 456.496.468 bytes (aproximadamente 435 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (checkpoint base waiIllustriousSDXL v17); linajes adicionales sobre AutismMix Pony y MOSS-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; la cuantizacion depende del checkpoint base) |
| Idiomas soportados | en, zh (prompts de texto) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (ficheros LoRA de 456.496.468 bytes cada uno) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 y alpha 32 aplicado sobre un UNet SDXL. El entrenamiento se realizo con AdamW en bf16, con buckets de resolucion con tope de 1536 y 7 epocas. El dataset consta de 88 pares imagen-texto que cubren 6 conjuntos de vestuario, con 3 repeticiones por muestra. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y de ojos a menudo se omita en el texto y deba anadirse manualmente en el prompt. No se documenta el uso de RLHF ni DPO, algo esperable en un LoRA de difusion.

La innovacion tecnica principal no esta en la arquitectura sino en la metodologia de evaluacion: el autor publica una evaluacion horizontal en tres rondas. La ronda 1 criba E1-E7 a fuerza 0.8; la ronda 3 ejecuta una matriz sobre E5, E6 y E7 con 10 escenas y 4 fuerzas (0.4, 0.6, 0.8 y 1.0). De ahi se concluye que E6 a 0.8 ofrece la silueta mas estable de Faris para este paquete. El repositorio incluye tres linajes independientes con checksums SHA-256 publicados (por ejemplo, E6 del linaje WAI: `C06C287703C484E47402148525192D4413F8AB07F8128C0BF540D04E699C320F`).

## Capacidades

- Generacion de imagenes anime del personaje Faris Nyannyan con identidad consistente mediante el token `faris_nyannyan`.
- Control de vestuario mediante tokens dedicados: `faris_nyannyan_pink_cat_hood` (capucha de gato rosa), `faris_nyannyan_maid_uniform` (uniforme de maid), `faris_nyannyan_future_soldier_uniform`, `faris_nyannyan_green_dress`, `faris_nyannyan_orange_ruffle_dress` y `faris_nyannyan_pink_white_dress`.
- Retratos de cara, planos de tres cuartos, perfil, cuerpo completo, poses sentadas y escenas con fondo simple o complejo (incluida escena nocturna).
- Compatibilidad con prompts en ingles y chino.
- Integracion con ComfyUI (configuracion documentada: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer).
- Tres linajes de pesos para tres modelos base distintos (WAI/Illustrious, AutismMix Pony y MOSS-Image), sin mezcla de prompts ni negativos entre ellos.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video; es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art de *Steins;Gate*: cargar el LoRA E6 a fuerza 0.8 en ComfyUI con el checkpoint waiIllustriousSDXL v17 y el prompt de ejemplo del autor para obtener retratos consistentes del personaje sin reentrenar.
- Creacion de hojas de personaje para proyectos derivados: usar los distintos tokens de vestuario (`pink_cat_hood`, `maid_uniform`, `green_dress`, etc.) para generar un conjunto coherente de variantes del mismo personaje en una sola sesion.
- Prototipado de webcomics o doujinshi: la estabilidad de silueta de E6 en cuerpo completo (capelet rosa, vestido blanco, zapatos negros con lazo) permite mantener continuidad visual entre paneles.
- Generacion de assets para juegos o mods de tematica anime: el LoRA puede producir retratos de personaje a 832x1216 listos para integrarse en dialogos o fichas de personaje.
- Pruebas de evaluacion de LoRAs de personaje: el repositorio sirve como referencia metodologica por su matriz documentada de epocas y fuerzas, util para investigadores que comparen tecnicas de entrenamiento de adaptadores.
- Experimentacion con modelos base alternativos: los linajes `autism_pony/` y `moss/` permiten comparar el mismo personaje bajo AutismMix Pony (fuerza recomendada 1.0) y MOSS-Image, util para decidir que checkpoint encaja mejor en un pipeline concreto.
- Generacion de escenas nocturnas o con fondos complejos: la evaluacion del autor incluye escenas nocturnas y de fondo complejo, lo que da indicaciones sobre el comportamiento del LoRA fuera de retratos simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, etc.) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa:

| Candidato | Observacion | Decision |
|---|---|---|
| E5 | Coletas taladro moradas y ojos morados anillados usables; capucha de gato a menudo presente | Alternativa |
| E6 | Retrato: coletas taladro lavanda, iris morados concentricos, capucha de gato rosa. Cuerpo completo: capelet rosa, vestido blanco, zapatos negros con lazo; silueta estable | Recomendada a 0.8 |
| E7 | Muy cercana a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el LoRA; depende del checkpoint base SDXL (waiIllustriousSDXL v17, AutismMix Pony o MOSS-Image) y de la resolucion. A 832x1216 con SDXL en fp16 se suele requerir en torno a 8-12 GB de VRAM, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible en la documentacion del autor. Por el tamano del checkpoint base (SDXL), son habituales RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, siempre que el checkpoint base SDXL quepa; el LoRA en si pesa unos 435 MB por fichero.
- Opciones de despliegue: ComfyUI (configuracion documentada por el autor), y por compatibilidad con safetensors SDXL, tambien diffusers, Automatic1111 y Forge; no se documentan vLLM, llama.cpp ni Ollama (no aplican a difusion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros LoRAs de personaje comparables en la informacion proporcionada (parametros, contexto, rendimiento o licencia). Se indica "no disponible" para una comparativa cuantitativa. Como referencia cualitativa, el propio repositorio contiene tres linajes del mismo personaje que pueden compararse entre si:

| Linaje | Modelo base | Epoca recomendada | Fuerza recomendada | Notas |
|---|---|---|---|---|
| WAI/Illustrious (raiz) | waiIllustriousSDXL v17 | E6 | 0.8 | Look verificado: coletas taladro, flequillo recto, ojos castano rojizos; deriva ocasional a lavanda |
| AutismMix Pony (`autism_pony/`) | AutismMix Pony (muestras con AutismMix Confetti) | E6 | 1.0 | Look verificado: pelo rosa, coletas largas, flequillo, ojos castano rojizos, diadema de orejas de gato negra |
| MOSS-Image (`moss/`) | MOSS-Image | no disponible | no disponible | Tercer linaje; no se detallan metricas en la informacion disponible |

## Limitaciones y advertencias

- La capucha de orejas de gato o la diadema de orejas de gato negra pueden desaparecer en algunas escenas; se recomienda usar el token de vestuario explicito junto con `cat ears` o palabras equivalentes.
- El color de pelo y ojos no siempre se conserva: algunos renders de WAI derivan hacia lavanda o morado, por lo que conviene declarar el color explicitamente en el prompt.
- Es un derivado hecho por fans, no oficial; los derechos del personaje y de la franquicia siguen siendo de sus titulares.
- La licencia creativeml-openrail-m impone restricciones de uso comercial que deben revisarse antes de emplearlo en produccion; no se detallan aqui las clausulas concretas.
- No se deben mezclar pesos, prompts ni negativos entre los tres linajes (WAI, AutismMix Pony y MOSS-Image): cada uno requiere su modelo base.
- Riesgo de sobreajuste o de deriva estilistica fuera de las condiciones evaluadas (fuerza 0.8, resolucion 832x1216, sampler Euler a); no se documenta comportamiento a otras resoluciones o samplers.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni evaluacion cuantitativa de fidelidad al personaje.
- El repositorio incluye unicamente pesos LoRA; el checkpoint base debe obtenerse por separado y cumple su propia licencia.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/FarisNyannyan-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/FarisNyannyan-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/FarisNyannyan-Lora
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
