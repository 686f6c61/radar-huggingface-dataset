# SkyGazerZ/PaddleOCR-VL-1.6-manga-v6-GGUF

## Resumen

PaddleOCR-VL-1.6-manga-v6-GGUF es una adaptacion especializada del modelo multimodal PaddleOCR-VL-1.6 de PaddlePaddle, orientada especificamente al reconocimiento optico de caracteres (OCR) en paginas de manga en japones. El modelo combina el encoder visual y el decoder de PaddleOCR-VL-1.6 con el adaptador LoRA de manga v6 desarrollado por el usuario sorryhyun, fusionados y convertidos al formato GGUF (BF16) para su uso con el servidor multimodal de llama.cpp.

La especializacion del modelo es muy concreta: procesa un recorte (crop) de una region de texto de una pagina de manga por peticion, reconociendo dialogos de bocadillos, texto de narracion y efectos sonoros dibujados (onomatopeyas). Con 466 millones de parametros totales y un tamano de repositorio de 1,8 GB, esta disenado para ejecutarse en hardware modesto mediante llama.cpp, sin necesidad de GPUs de datacenter.

Su relevancia actual radica en que cubre un nicho poco atendido por los OCR genericos: la lectura de texto manga japones con tipografias estilizadas, onomatopeyas dibujadas y disposicion vertical. El autor documenta que la fusion reproduce la lectura del adaptador original en PyTorch en 636 de 648 recortes de texto manga, lo que da una idea de la fidelidad de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje (encoder visual + proyector + decoder transformer); detalles internos de la arquitectura base no disponibles |
| Parametros totales | 466.654.208 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unica publicada en este repositorio) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo de lenguaje: 935.768.384 bytes; mmproj vision encoder + projector: 881.770.208 bytes) |

## Arquitectura y entrenamiento

El modelo es el resultado de tres pasos documentados por el autor: primero, el LoRA de vision del adaptador (rango 64, alpha 128, escala 2, aplicado sobre las capas de atencion y MLP del encoder visual y ambas capas del proyector) se suma a los pesos base en float32 y se almacena de nuevo en BF16. Segundo, las 18 capas del decoder del adaptador, entrenadas por completo, sustituyen a las del modelo base. Tercero, el checkpoint fusionado se convierte a GGUF con `convert_hf_to_gguf.py` de llama.cpp (release b9842), con `--outtype bf16` y `--mmproj` para el proyector.

El autor valida la conversion comparando con la conversion oficial de PaddlePaddle: al convertir el modelo base sin modificar se obtienen tensores identicos uno a uno a los de PaddleOCR-VL-1.6-GGUF oficial. Los ficheros de este repositorio difieren de esa conversion unicamente en los tensores que modifica el adaptador v6: 143 en el modelo de lenguaje y 164 en la parte visual. El adaptador fue entrenado sobre Manga109-s y las anotaciones COO (Comic Onomatopoeia), ademas de recortes de paginas con traduccion de fans.

## Capacidades

- OCR de texto manga japones: dialogos de bocadillos, texto de narracion y efectos sonoros dibujados (onomatopeyas).
- Procesamiento de una region de texto recortada por peticion (no de paginas completas de forma fiable).
- Normalizacion tipografica aprendida: runs de puntos se escriben como un unico caracter de puntos suspensivos (`…`), `〜` como `~`, guiones largos como `―` y corazones como `♥`.
- Preservacion de saltos de linea en la salida.
- Interfaz de chat multimodal (image-text-to-text) compatible con la API de chat de llama.cpp.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos del japones.

## Casos de uso

- Digitalizacion de manga para traduccion: el modelo lee cada recorte de bocadillo y devuelve el texto japones normalizado, que puede alimentar un pipeline de traduccion automatica. Su entrenamiento especifico en tipografia manga lo hace mas adecuado que un OCR generico para este material.
- Extraccion de dialogos para subtitulado o fichas de personajes: al preservar saltos de linea y normalizar puntuacion, la salida es directamente consumible por herramientas de post-proceso.
- Reconocimiento de onomatopeyas dibujadas: caso cubierto explicitamente por el entrenamiento con el dataset COO, poco atendido por OCR convencionales.
- Archivado y busqueda de colecciones: indexar el texto extraido de cada region permite busqueda full-text sobre bibliotecas de manga escaneado.
- Investigacion en comprension de manga: el autor cita el uso academico con Manga109-v2026 y el dataset Manga109, por lo que encaja en experimentos de vision-lenguaje sobre este corpus.
- Despliegue en hardware modesto: con 1,8 GB en BF16 y ejecucion via llama.cpp, puede correr en equipos sin GPU de datacenter para procesar lotes de recortes con decodificacion greedy y temperatura 0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la comparacion del autor: a traves de llama.cpp, los ficheros dan la misma lectura que el adaptador original en PyTorch en 636 de 648 recortes de texto manga.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,8 GB en BF16 (modelo de lenguaje ~0,94 GB + mmproj ~0,88 GB); la VRAM necesaria para inferencia no se detalla en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: por el tamano de los ficheros (BF16, menos de 2 GB en total) es plausible en GPUs de consumo, aunque el autor no lo confirma.
- Despliegue: llama.cpp mediante `llama-server` con los dos ficheros (`-m` para el modelo y `--mmproj` para el proyector), decodificacion greedy (`--temp 0`), una imagen por peticion a traves de la API de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6-manga-v6-GGUF (este) | 466.654.208 | no disponible | ja | Apache-2.0 | GGUF BF16 |
| PaddlePaddle/PaddleOCR-VL-1.6 (base) | 466.654.208 | no disponible | no disponible | no disponible en la informacion | safetensors y GGUF oficial |
| sorryhyun/paddleocr-vl-1.6-manga-lora (adaptador) | no disponible | no disponible | no disponible | no disponible en la informacion | LoRA (PyTorch) |

La comparativa se limita a las variantes del mismo linaje, ya que la informacion proporcionada no incluye otros modelos OCR de manga con los que contrastar. Frente al base, este modelo incorpora el adaptador de manga v6 y el formato GGUF listo para llama.cpp; frente al adaptador original, ofrece los pesos ya fusionados y convertidos, a costa de una ligera perdida de fidelidad (636 de 648 recortes coincidentes).

## Limitaciones y advertencias

- Solo soporta japones; no se documentan otros idiomas.
- Esta pensado para recortes de regiones de texto, no para paginas completas: los bloques largos de varios parrafos (articulos, sinopsis) se leen con menos fiabilidad que con el modelo base sin modificar.
- Requiere decodificacion greedy (temperatura 0); no se documenta comportamiento con muestreo.
- La plantilla de chat embebida es la del repositorio base y espera el contenido como lista de partes (texto e imagen); la version GGUF de PaddlePaddle incluye una plantilla extendida que acepta cadena simple, por lo que hay que ajustar las peticiones.
- El adaptador se entreno con recortes de paginas con traduccion de fans, lo que puede introducir sesgos de estilo o de fuente tipografica.
- Terminos de Manga109-s: no se permite redistribuir las imagenes; los modelos pueden publicarse con atribucion. El repositorio no incluye imagenes de entrenamiento.
- Riesgo de alucinacion en regiones ambiguas o con tipografia muy estilizada: no se documentan tasas de error fuera de la comparacion con el adaptador original.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyGazerZ/PaddleOCR-VL-1.6-manga-v6-GGUF
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- GGUF oficial del base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6-GGUF
- Adaptador LoRA de manga: https://huggingface.co/sorryhyun/paddleocr-vl-1.6-manga-lora
- llama.cpp (release b9842): https://github.com/ggml-org/llama.cpp
