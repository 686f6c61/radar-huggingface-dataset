# abbuibuibui/MikanHinatsuki-Lora

## Resumen

MikanHinatsuki-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint comunitario waiIllustriousSDXL v17. Reproduce a Mikan Hinatsuki (阳夏木蜜柑), personaje de la serie *The Demon Girl Next Door* (Machikado Mazomu), en el estilo anime de la familia Illustrious. Es un derivado no oficial: los derechos del personaje siguen en manos de sus titulares.

El modelo resuelve un problema muy concreto: fijar la identidad visual del personaje (melena larga rubia, ojos azules y varios conjuntos de ropa) en un checkpoint SDXL base sin que el generador tenga que describirlo de forma exhaustiva en cada prompt. Se distribuye como siete ficheros safetensors correspondientes a las epocas E1 a E7, cada uno de 456.497.900 bytes, con recomendacion explicita de la epoca E6 a fuerza 0.8.

Su relevancia es acotada pero clara para quien trabaje con generacion de imagenes de personajes: incluye una evaluacion horizontal publica (E5, E6 y E7 cruzadas con cuatro intensidades de LoRA en diez escenas), etiquetas de activacion bien definidas y un dataset de 79 pares de imagenes con siete conjuntos de ropa. Todo ello con licencia CreativeML OpenRAIL-M y soporte de los ecosistemas diffusers y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (checkpoint base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango 64, alpha 32; ficheros de 456.497.900 bytes cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | no disponible (pesos fp16/bf16 en safetensors) |
| Idiomas soportados | en, zh (prompts) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 ficheros, E1 a E7) |
| Libreria | diffusers (compatible tambien con ComfyUI) |
| Modelo base | waiIllustriousSDXL v17 |
| Rango / alpha del LoRA | 64 / 32 |
| Epoca recomendada | E6 (fuerza 0.8) |
| Dataset | 79 pares, 7 conjuntos de ropa, repeats 3 |
| Epocas de entrenamiento | 7 |

## Arquitectura y entrenamiento

Se trata de un LoRA de bajo rango (rank 64, alpha 32) inyectado sobre los bloques de atencion de un UNet SDXL. El checkpoint base es waiIllustriousSDXL v17, una variante comunitaria de SDXL orientada a ilustracion anime dentro del linaje Illustrious. El entrenamiento uso AdamW en bf16 con buckets de resolucion con tope de 1536 y siete epocas sobre un dataset de 79 pares de imagenes que cubren siete conjuntos de ropa distintos (forma de chica magica, vestido amarillo, blusa de flores, vestido estampado de flores, camiseta verde, top de rayas naranjas y uniforme escolar).

Las leyendas se construyeron con `keep_tokens = 2`, omitiendo con frecuencia el color de pelo y de ojos, por lo que la model card advierte que conviene anadir esos descriptores en el prompt. El sujeto base es la etiqueta `1girl`. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un LoRA de personaje. La innovacion practica no esta en la arquitectura sino en la evaluacion: una comparativa publica por rondas que justifica la eleccion de E6 como epoca por defecto.

## Capacidades

- Generacion de imagenes de un personaje concreto (Mikan Hinatsuki) en estilo anime, sobre la base estilistica de Illustrious SDXL.
- Control de identidad mediante la etiqueta de activacion `mikan_hinatsuki`.
- Seleccion de conjunto de ropa mediante etiquetas especificas: `mikan_hinatsuki_magical_girl_form`, `mikan_hinatsuki_yellow_dress`, `mikan_hinatsuki_flower_blouse`, `mikan_hinatsuki_flower_print_dress`, `mikan_hinatsuki_green_tee`, `mikan_hinatsuki_orange_striped_top` y `mikan_hinatsuki_school_uniform`.
- Retratos, planos de tres cuartos, perfil, cuerpo entero, poses sentadas y escenas con fondo simple o complejo (noche, calle).
- Ajuste fino de la intensidad del LoRA entre 0.4 y 1.0, con 0.8 como valor recomendado.
- Prompts bilingues en ingles y chino, segun los idiomas declarados.
- Sin soporte de tool calling, agentes, vision, audio ni razonamiento multi-paso: es un modelo de difusion de imagen, no un LLM.

## Casos de uso

- Generacion de ilustraciones de personaje para fan art y proyectos derivados: aplicar el LoRA sobre waiIllustriousSDXL en ComfyUI con Euler a, 28 pasos, CFG 4.5 y CLIP skip 2 a 832x1216 produce retratos estables del personaje sin necesidad de describir su apariencia.
- Creacion de hojas de personaje y referencias visuales consistentes: combinando la etiqueta de identidad con cada una de las siete etiquetas de ropa se obtiene un conjunto coherente de vistas del mismo personaje para documentacion o diseño.
- Prototipado de escenas narrativas: las pruebas publicadas sobre fondo simple, fondo nocturno y escena compleja permiten usar el LoRA para bocetar viñetas o keyframes de una historia corta.
- Ilustracion de contenido para comunidades de fans: la licencia OpenRAIL-M permite uso comercial con restricciones, lo que habilita encargos o merchandising no oficial dentro de los limites de la licencia y de los derechos del personaje.
- Experimentacion con tecnicas de entrenamiento de LoRA: el repositorio sirve como caso de estudio reproducible (rank 64, 79 pares, 7 epocas, evaluacion por rondas) para quien quiera replicar el flujo con otro personaje.
- Integracion en pipelines de generacion por lotes: al ser safetensors compatible con diffusers, se puede cargar en scripts de Python para producir variaciones masivas de un mismo personaje con control de semilla y fuerza del LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, similitud facial) en la informacion disponible. La model card incluye unicamente una evaluacion cualitativa por rondas:

| Ronda | Candidatos | Condiciones | Conclusion publicada |
|---|---|---|---|
| Ronda 1 | E1 a E7 | Fuerza 0.8 | Seleccion inicial de candidatos |
| Ronda 3 | E5, E6, E7 | 10 escenas x 4 fuerzas (0.4, 0.6, 0.8, 1.0) | E6 recomendada a 0.8 |

Segun el autor, E5 mantiene pelo rubio largo y ojos azules usables con forma de chica magica frecuente; E6 presenta retrato estable con silueta reconocible de Mikan; E7 queda muy proxima a E6 como alternativa final.

## Requisitos de hardware

- El LoRA en si ocupa 456.497.900 bytes por fichero (unos 435 MiB), por lo que solo es necesario cargar una epoca a la vez.
- El requisito real lo marca el checkpoint base waiIllustriousSDXL v17, un SDXL completo: se recomienda una GPU con al menos 8-12 GB de VRAM en fp16, aunque no se dispone de cifras oficiales en la informacion proporcionada.
- GPU de consumo: tarjetas tipo RTX 3060 12 GB, RTX 4070 o RTX 4090 deberian poder ejecutar SDXL con el LoRA; las cifras exactas no estan disponibles.
- GPU profesionales: A100 o H100 no son necesarias para inferencia, pero aceleran el entrenamiento y la generacion por lotes.
- Despliegue: ComfyUI es el entorno usado en la evaluacion oficial (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216). Tambien es compatible con diffusers en Python. No se documenta soporte en llama.cpp, Ollama, vLLM ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MikanHinatsuki-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rank 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| LoRA de personaje generico sobre SDXL | LoRA de personaje | SDXL 1.0 | variable | no aplica | segun autor | Hugging Face / Civitai |
| Checkpoint Illustrious completo | Checkpoint | SDXL | ~2.6B (UNet SDXL, no confirmado para esta variante) | no aplica | segun autor | Hugging Face / Civitai |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas concretas; la comparativa anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos de Mikan Hinatsuki y de *The Demon Girl Next Door* pertenecen a sus titulares; el autor declara explicitamente que es fan-made.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); conviene revisar el texto completo antes de producción.
- Riesgo de sobreajuste a las siete ropas del dataset: prendas no vistas pueden generar resultados inconsistentes.
- La model card advierte que las leyendas omiten a menudo color de pelo y ojos, por lo que es necesario anadir `long hair, blonde hair, blue eyes` en el prompt para evitar derivas.
- Sesgos: al entrenarse sobre un unico personaje y un dataset pequeno (79 pares), puede reproducir sesgos estilisticos del checkpoint base y del dataset, incluyendo sesgos de representacion propios de Illustrious.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, extremidades) y detalles incoherentes, especialmente en escenas complejas.
- Limitaciones de idioma: solo se declaran ingles y chino para prompts; no hay garantia de buen comportamiento con prompts en castellano.
- Contexto: no aplica longitud de contexto, pero si resolucion; el autor valida 832x1216 sin hires ni ADetailer, y no documenta comportamiento a otras resoluciones.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/MikanHinatsuki-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MikanHinatsuki-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MikanHinatsuki-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio de Hugging Face)
- README en chino: `./README_zh.md` (dentro del repositorio de Hugging Face)
