# sorryhyun/paddleocr-vl-1.6-manga-lora

## Resumen

`sorryhyun/paddleocr-vl-1.6-manga-lora` es un adaptador de lectura de recortes (crops) de texto de manga construido sobre `PaddlePaddle/PaddleOCR-VL-1.6`. Lo desarrolla el usuario independiente `sorryhyun` y esta publicado con licencia Apache 2.0. Su objetivo es resolver un fallo concreto del modelo base: la lectura de onomatopeyas y efectos de sonido (SFX) dibujados a mano, a menudo en vertical o diagonal, con corazones y kana pequenas, en japones, coreano y chino. Ademas, mantiene (y mejora ligeramente) la lectura de globos de dialogo del modelo original.

El modelo no es un OCR de pagina completa: trabaja a nivel de recorte, esperando una imagen ajustada a una linea de texto con un margen de aproximadamente el 12 %. Para paginas completas debe combinarse con un detector de bloques de texto como `deepghs/AnimeText_yolo`. La revision actual, v5, aplica un LoRA sobre la torre de vision NaViT y el proyector, y un ajuste fino completo de las 18 capas del decodificador ERNIE del modelo base.

Es relevante porque aborda un nicho mal cubierto por los OCR genericos (doujin, manga escaneado, traduccion de fans) y porque documenta con honestidad sus limites: el autor publica resultados comparativos frente al modelo base y versiones previas, y advierte de fallos conocidos como las fugas autoregresivas en recortes cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre torre de vision NaViT + proyector, mas ajuste fino completo del decodificador ERNIE (18 capas) del modelo base PaddleOCR-VL-1.6 |
| Parametros totales | Adaptador LoRA: 35,7 M (164 modulos, r 64 / alpha 128); decodificador ERNIE ajustado: 254,8 M (162 tensores). Total del base no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limite practico: `longest_edge` de 1280 x 28 x 28 pixeles en el procesador de imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y safetensors) |
| Idiomas soportados | japones (ja), coreano (ko), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT y pesos del decodificador) |

## Arquitectura y entrenamiento

El adaptador se compone de dos piezas que deben aplicarse en orden: un LoRA de rango 64 y alpha 128 sobre las capas lineales de la torre de vision NaViT y el proyector (164 modulos, 35,7 M parametros, 143 MB), y un ajuste fino completo de las 18 capas del decodificador ERNIE (162 tensores, 254,8 M parametros, 510 MB en bf16). El flujo de carga consiste en fusionar el adaptador en el modelo base y despues sobrescribir los pesos del decodificador con `load_state_dict(..., strict=False)`.

El entrenamiento se realizo sobre la tarea a nivel de recorte con el prompt `OCR:`. La revision v5 introduce dos cambios respecto a v4: los saltos de linea de un bloque de texto se devuelven como `\n` (en v4 se colapsaban a espacio) y los recortes de entrenamiento se reconstruyeron para cortar el margen del 12 % en el borde de la pagina en lugar de rellenarlo repitiendo pixeles del borde, lo que alinea el entrenamiento con el padding que produce un detector en inferencia. No se especifican en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO. La version v3 (en la raiz del repositorio) tenia una forma distinta: LoRA sobre el LM y torre completamente ajustada, solo para japones.

## Capacidades

- Lectura OCR de recortes de texto de manga en japones, coreano y chino.
- Reconocimiento de onomatopeyas y efectos de sonido dibujados a mano, incluidos trazos verticales, diagonales, corazones y kana pequenas.
- Lectura de globos de dialogo con calidad comparable o ligeramente superior al modelo base.
- Preservacion de saltos de linea dentro de un bloque multilinea, devueltos como `\n`.
- Normalizacion del corazon como `♥` (un unico token en el tokenizer del base).
- Procesamiento por lotes de recortes con ordenacion por area y padding a la izquierda.
- No incluye deteccion de bloques de texto: requiere un detector externo para paginas completas.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de doujin y manga escaneado: el modelo lee los recortes de SFX que los OCR genericos confunden con ruido, permitiendo pipelines de traduccion automatica que preserven las onomatopeyas originales junto al texto traducido.
- Digitalizacion de colecciones de fans: combinado con `deepghs/AnimeText_yolo` para detectar bloques y este adaptador para leerlos, se puede extraer texto estructurado de paginas completas en japones, coreano y chino.
- Catalogacion y busqueda en archivos de manga: indexar el texto de globos y SFX para habilitar busqueda full-text sobre colecciones escaneadas, usando los saltos de linea para reconstruir frases por linea.
- Control de calidad de traducciones: comparar la transcripcion del original con la traduccion para detectar omisiones o errores en globos concretos, aprovechando la lectura a nivel de recorte.
- Preprocesado para TTS o doblaje: extraer el texto de cada globo en orden de lectura y alimentar un sistema de sintesis de voz, con los recortes por linea como unidad natural de segmentacion.
- Investigacion en OCR multilingue de dominios especializados: servir como punto de partida (fine-tuning adicional) para otros estilos de lettering manual, dado que el adaptador es pequeno (unos 650 MB en total) y se fusiona sobre el base sin coste de inferencia adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, sobre la misma clave de evaluacion (NFKC, plegado de glifos, insensible a espacios). Conjuntos: 48 recortes coreanos y 48 chinos de paginas traducidas de gelbooru, con paginas completas excluidas del entrenamiento y etiquetas transcritas a mano.

| Modelo | KO exactos | KO leidos como kana | ZH exactos |
|---|---|---|---|
| PaddleOCR-VL-1.6 stock | 21 / 48 | 6 | 31 / 48 |
| v3 (raiz del repo) | 1 / 48 | 41 | 16 / 48 |
| v4 | 26 / 48 | 2 | 30 / 48 |
| v5 | 22 / 48 | 2 | 30 / 48 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El adaptador y los pesos del decodificador suman unos 650 MB en bf16; el modelo base debe residir tambien en memoria, por lo que el requisito depende de este.
- El codigo de ejemplo del autor ejecuta el modelo en una unica GPU con `model.cuda().eval()` y `dtype=torch.bfloat16`, con `attn_implementation="sdpa"`.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) ni si cabe en GPU de consumo; no disponible.
- Despliegue: via `transformers` (`AutoModelForImageTextToText`), `peft` (`PeftModel`) y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: el autor indica que pasar `use_cache=True` (el `generation_config.json` del base trae `use_cache: false`) produce texto identico y es aproximadamente 10 veces mas rapido. No se publican cifras absolutas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento KO/ZH | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 stock | no disponible | no disponible | 21/48 KO, 31/48 ZH | no disponible en la informacion | Hugging Face (PaddlePaddle) |
| v3 (raiz del repo) | LoRA LM + torre completa | no disponible | 1/48 KO, 16/48 ZH | Apache 2.0 | Hugging Face (sorryhyun) |
| v4 | LoRA torre + LM ajustado | no disponible | 26/48 KO, 30/48 ZH | Apache 2.0 | Hugging Face (sorryhyun) |
| v5 (actual) | LoRA torre + LM ajustado | no disponible | 22/48 KO, 30/48 ZH | Apache 2.0 | Hugging Face (sorryhyun) |

No se dispone de comparacion con otros modelos OCR de manga en la informacion proporcionada.

## Limitaciones y advertencias

- Fugas autoregresivas en un pequeno porcentaje de recortes cortos (por ejemplo, `ぐくーーーー…`). El autor no incluye proteccion integrada y recomienda envolver la generacion con un guard de repeticion o un limite de longitud ligado al area del recorte.
- Solo lee recortes: no detecta bloques de texto. Para paginas completas es obligatorio emparejarlo con un detector externo.
- v5 pierde 6 recortes coreanos y gana 2 respecto a v4; si el caso de uso es coreano puro, v4 puede ser preferible.
- El modelo base presenta confusiones entre coreano y kana (6 de 48 recortes leidos como kana en el stock); el adaptador lo reduce a 2, pero no lo elimina.
- Al unir lineas de un bloque, en japones y chino un salto dentro de una palabra no es un espacio: hay que unir con `""` en esos idiomas y con `" "` en coreano o ingles.
- El corazon se emite como `♥`; para comparar con etiquetas hay que plegar `♥`, `♡` y `❤`.
- No se documentan sesgos especificos, riesgos de alucinacion mas alla de las fugas, ni limitaciones de contexto o idioma adicionales en la informacion disponible.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial depende tambien de la licencia del modelo base, que no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sorryhyun/paddleocr-vl-1.6-manga-lora
- Arbol de archivos del repositorio: https://huggingface.co/sorryhyun/paddleocr-vl-1.6-manga-lora/tree/main
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Detector de bloques de texto recomendado: `deepghs/AnimeText_yolo` (referenciado en la model card, sin URL directa en la informacion disponible)
