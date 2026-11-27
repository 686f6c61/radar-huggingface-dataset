# abbuibuibui/AoiHinami-Lora

## Resumen

AoiHinami-Lora es un LoRA de personaje para modelos de difusion SDXL, desarrollado por el usuario abbuibuibui. Reproduce a Aoi Hinami (日南葵), personaje de la serie *Bottom-tier Character Tomozaki*, sobre el checkpoint base waiIllustriousSDXL v17. Es un derivado no oficial, creado por un particular y no vinculado a los titulares de la franquicia. El repositorio se publica bajo licencia CreativeML OpenRAIL-M y esta etiquetado para los idiomas ingles y chino.

El modelo resuelve un problema acotado: la generacion consistente de un personaje concreto (identidad facial, peinado, color de ojos y varios conjuntos de ropa) dentro de un pipeline SDXL/Illustrious. Para ello emplea tokens de activacion especificos (`minami_nanami` para identidad y variantes por atuendo) y se distribuye en varias epocas de entrenamiento (E1-E7), de las que el autor recomienda E6 a fuerza 0.8. El repositorio ocupa 7,9 GB e incluye, ademas de la linea principal WAI/Illustrious, dos linajes adicionales: AutismMix Pony (bajo `autism_pony/`) y MOSS-Image (bajo `moss/`), con pesos y prompts independientes.

Es relevante ahora por su caracter practico: es un ejemplo de LoRA de personaje con evaluacion comparativa publicada (rondas de cribado y matriz de fuerza), documentacion bilingue y dataset propio enlazado. No obstante, su alcance es muy especializado y su utilidad se limita a la generacion de imagenes de este personaje sobre checkpoints de la familia SDXL/Illustrious/Pony.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre difusion latente SDXL (checkpoint base waiIllustriousSDXL v17); linajes adicionales sobre AutismMix Pony y MOSS-Image |
| Parametros totales | no disponible (rango 64, alpha 32; cada archivo de pesos pesa 456.497.868 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | en, zh (etiquetas del repositorio; los prompts de ejemplo estan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre un UNet de SDXL. El entrenamiento principal se realizo sobre waiIllustriousSDXL v17 con rango 64 y alpha 32, sobre un conjunto de 71 pares imagen-texto con 2 repeticiones por par, en una DGX Spark usando ComfyUI. El dataset esta publicado como `abbuibuibui/AoiHinami-Dataset`. Se generaron siete epocas (E1-E7); los archivos numerados `minami_nanami-000001` a `000006` corresponden a E1-E6 y el archivo sin numerar `minami_nanami.safetensors` es E7. El autor documenta que las captions a menudo omiten color de pelo y ojos, por lo que recomienda anadirlos explicitamente en el prompt.

El repositorio es en realidad una coleccion de tres linajes entrenados por separado. La linea principal (WAI/Illustrious) queda en la raiz del repositorio. La linea AutismMix Pony, bajo `autism_pony/`, se entreno sobre AutismMix Pony y se muestra con AutismMix Confetti; en esta linea el aspecto verificado es pelo corto rojo oscuro, despeinado, con flequillo y ojos verdes, y el autor advierte explicitamente de que no debe mezclarse con los pesos ni los prompts de WAI/Illustrious. La tercera linea, MOSS-Image, se ubica en `moss/`. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, al no tratarse de un modelo de lenguaje.

## Capacidades

- Generacion de imagenes de personaje (Aoi Hinami) sobre checkpoints SDXL de la familia Illustrious, con identidad consistente mediante el token `minami_nanami`.
- Control de atuendo mediante tokens dedicados: `minami_nanami_blazer_uniform`, `minami_nanami_summer_uniform`, `minami_nanami_casual_cardigan`, `minami_nanami_home_loungewear`, `minami_nanami_sports_t_shirt` y `minami_nanami_yukata`.
- Retratos frontales, tres cuartos y perfil, asi como cuerpo completo, escenas sentadas y fondos complejos (calle nocturna), segun la evaluacion publicada por el autor.
- Generacion sin token de atuendo: a fuerza 0.8 produce una camiseta azul claro holgada y zapatillas blancas, manteniendo pelo rubio y ojos azules.
- Ajuste de fuerza del LoRA (evaluado en 0.4, 0.6, 0.8 y 1.0) para modular la intensidad del personaje.
- Prompts negativos recomendados para corregir deriva de color de pelo y ojos (`brown hair`, `black hair`, `pink hair`, `brown eyes`, `green eyes`, `red eyes`, `twintails`, `short hair`).
- Linea Pony con un aspecto visual distinto (pelo corto rojo oscuro y ojos verdes) sobre checkpoints de la familia Pony.
- Compatibilidad con ComfyUI; ajustes de referencia del autor: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires ni ADetailer.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un adaptador de generacion de imagen, no un modelo de lenguaje.

## Casos de uso

- Ilustracion de fanart consistente: usar el token `minami_nanami` junto con el de atuendo para generar multiples imagenes del personaje manteniendo rasgos faciales y paleta (rubio y azul) entre iteraciones, gracias a la identidad codificada en el LoRA.
- Creacion de hojas de personaje y referencias visuales: la evaluacion publicada cubre retrato frontal, tres cuartos y perfil, lo que permite generar un conjunto de vistas coherentes para documentacion o fichas de personaje.
- Escenas narrativas y viñetas: combinando el token de identidad con descripciones de entorno (por ejemplo, calle nocturna) se obtienen composiciones de cuerpo entero aptas para ilustrar relatos o guiones graficos.
- Prototipado de variaciones de vestuario: los tokens de uniforme de invierno, uniforme de verano, cardigan, ropa de casa, camiseta deportiva y yukata permiten explorar rapidamente distintas apariencias del mismo personaje sin reentrenar.
- Integracion en pipelines de ComfyUI: al ser un safetensors compatible con diffusers, puede cargarse como nodo LoRA en flujos automatizados de generacion por lotes con los parametros de referencia del autor (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216).
- Experimentacion con fuerza del adaptador: la matriz publicada E5/E6/E7 x 0.4/0.6/0.8/1.0 sirve como punto de partida para calibrar la intensidad del personaje segun el estilo deseado.
- Comparacion de linajes: el repositorio incluye variantes para Illustrious, AutismMix Pony y MOSS-Image, lo que permite evaluar como se comporta el mismo personaje bajo distintas bases SDXL manteniendo pesos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluacion comparativa cualitativa entre epocas y fuerzas, resumida a continuacion:

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Rubio y azul fijados; retrato algo severo | Alternativa |
| E6 | Retrato mas claro; uniforme de blazer completo con escudo, corbata roja, falda de cuadros y calcetines altos | Recomendado a 0.8 |
| E7 | Rostro practicamente identico a E6 | Alternativa final |

Rondas documentadas: ronda 1 con E1-E7 a fuerza 0.8 (rostro, blazer, verano) y ronda 3 con matriz E5/E6/E7 x 0.4/0.6/0.8/1.0 sobre diez vistas (rostro, tres cuartos, perfil, blazer, verano, sentada, fondo simple, noche, sin atuendo y sin trigger).

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el LoRA; depende del checkpoint base SDXL y de la resolucion. El autor entreno en una DGX Spark con ComfyUI.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser un adaptador SDXL, requiere la VRAM del checkpoint base completo, no solo la del LoRA (cada archivo de pesos del adaptador pesa unos 456 MB).
- Cabe en GPU de consumo: no confirmado en la informacion disponible; la viabilidad dependera del checkpoint SDXL subyacente y de la cuantizacion aplicada a este.
- Opciones de despliegue: ComfyUI (entorno usado por el autor, con ajustes Euler a / 28 pasos / CFG 4.5 / CLIP skip 2 / 832x1216); al publicarse como safetensors con libreria diffusers, es compatible con pipelines basados en diffusers. No se documentan opciones como llama.cpp, vLLM, Ollama o TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada. Como referencia interna, el propio repositorio ofrece tres linajes del mismo personaje:

| Linaje | Base de entrenamiento | Checkpoint de muestra | Aspecto verificado | Ubicacion |
|---|---|---|---|---|
| WAI/Illustrious | waiIllustriousSDXL v17 | waiIllustriousSDXL v17 | Pelo largo rubio, ojos azules | Raiz del repositorio |
| AutismMix Pony | AutismMix Pony | AutismMix Confetti | Pelo corto rojo oscuro despeinado, flequillo, ojos verdes | `autism_pony/` |
| MOSS-Image | no disponible | no disponible | no disponible | `moss/` |

El autor advierte de que no deben mezclarse bases, prompts ni negativos entre linajes.

## Limitaciones y advertencias

- Modelo altamente especializado: solo genera un personaje concreto; no es un modelo de proposito general ni un modelo de lenguaje.
- Riesgo de deriva de atributos: las captions de entrenamiento omiten a menudo color de pelo y ojos, por lo que es necesario reforzarlos en el prompt y usar negativos para evitar tonos no deseados.
- Confusion de nomenclatura: el repositorio se llama AoiHinami-Lora, pero los archivos y el token de activacion conservan `minami_nanami`; el autor lo documenta como correccion de personaje.
- Riesgo de mezcla de linajes: usar pesos de `autism_pony/` o `moss/` con el prompt o el checkpoint de WAI/Illustrious produce resultados incorrectos; el aspecto visual difiere entre linajes.
- Numeral de epocas poco intuitivo: no existe `minami_nanami-000007.safetensors`; el archivo sin numerar corresponde a E7.
- Alucinacion: no aplica en el sentido de texto; en imagen se traduce en artefactos, poses incorrectas o atuendos mal renderizados fuera de las condiciones evaluadas.
- Sesgos: no documentados por el autor; al entrenarse sobre un unico personaje de anime, la diversidad de representaciones es limitada por el dataset.
- Licencia: CreativeML OpenRAIL-M, que impone restricciones de uso (incluidas clausulas de uso aceptable) y requiere revisar sus terminos antes de cualquier uso comercial. Es un derivado no oficial de una franquicia ajena, sin respaldo de los titulares de derechos.
- Produccion: sin benchmarks cuantitativos, sin garantias de estabilidad entre versiones del checkpoint base y sin soporte del autor; la calidad depende del checkpoint SDXL sobre el que se aplique.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/AoiHinami-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/AoiHinami-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/AoiHinami-Lora
- Notas de evaluacion en chino (dentro del repositorio): `evaluation/横向测评记录.md`
- README en chino (dentro del repositorio): `README_zh.md`
