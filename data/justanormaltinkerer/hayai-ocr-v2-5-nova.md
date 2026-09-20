# JustANormalTinkerer/hayai-ocr-v2.5-nova

## Resumen

Hayai OCR v2.5 Nova es un modelo vision-language de tipo image-to-text desarrollado por el usuario JustANormalTinkerer, especializado en reconocimiento óptico de caracteres (OCR) a nivel de recorte (*crop*) para japones, chino, coreano e ingles. Con 156.915.968 parametros (~157M) y un repositorio de 0,6 GB, combina un codificador visual SigLIP2 NaFlex (~86M) con un decodificador transformer causal propio de 12 capas, y esta disenado para transcribir texto denso, estilizado, horizontal y vertical en una sola pasada directa, sin necesidad de una etapa intermedia de deteccion de lineas de texto.

La innovacion principal de la version 2.5 es el `DSCProjector` (Downsampling Spatial Convolution), que reorganiza los embeddings de parches en una rejilla 2D y aplica un *pixel unshuffle* 2x para reducir cuatro parches a un unico token. Esto rebaja un 75% el numero de tokens visuales que consume el decodificador, con la consiguiente reduccion de la latencia de prefill y del consumo de KV cache. El modelo anade ademas escalado residual aprendible por canal y una cabeza auxiliar de clasificacion IDS de 226 clases usada solo durante el entrenamiento para reforzar la discriminacion de glifos CJK poco frecuentes.

El modelo es relevante en el nicho de la digitalizacion de manga y documentos CJK porque ofrece una alternativa de muy bajo coste computacional a los VLM generalistas. Segun los datos publicados por el autor, con un presupuesto de 512 parches alcanza un CER del 3,10% y un *exact match* del 80,68% en el benchmark JMangaBench_Mixed (3.286 recortes), superando a MangaOCR (~150M) en el mismo conjunto. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, aunque la fecha de creacion del repositorio indicada en HuggingFace (2026-09-20) y sus cero descargas sugieren un modelo muy reciente y sin validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador SigLIP2 NaFlex (~86M) + decodificador transformer causal propio de 12 capas con GQA, SwiGLU y QK RMSNorm |
| Parametros totales | 156.915.968 (~157M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la generacion se documenta con `max_new_tokens=128`; los tokens visuales del decodificador varian entre <=64 y <=128 segun `max_num_patches`) |
| Tipos de cuantizacion | No disponible (no se documenta GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (en), japones (ja), chino (zh), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un VLM de arquitectura encoder-decoder asimetrica. El codificador es SigLIP2 NaFlex, que escala dinamicamente la imagen preservando la relacion de aspecto segun un presupuesto de parches (`max_num_patches` de 256, 384 o 512). El decodificador es un transformer causal de 12 capas con `d_model=512`, `d_ffn=2048`, 8 cabezas de consulta y 2 cabezas KV (GQA), activacion SwiGLU y RMSNorm aplicado a Q y K. Sobre la rejilla espacial comprimida se aplica un mRoPE bidimensional (2D multi-dimensional RoPE), y las conexiones residuales incorporan parametros de escala aprendibles por canal (`attn_res_scale`, `ffn_res_scale`, inicializados a 1,0) para estabilizar la propagacion en profundidad.

La innovacion estructural es el `DSCProjector`: reshape de las embeddings de parches a rejilla 2D, *replicate pad*, *pixel unshuffle* 2x (4 parches -> 1 token), LayerNorm, MLP y RMSNorm. Con ello, los tokens visuales que ve el decodificador se reducen un 75% respecto a v2.1, lo que abarata los presupuestos altos de parches. Durante el entrenamiento se anade una cabeza auxiliar de clasificacion IDS de 226 clases para afinar la discriminacion a nivel de caracter en glifos CJK raros; esta cabeza no se usa en inferencia, por lo que no anade coste. La ruta de inferencia incluye KV-cache estatico preasignado, RoPE de texto 1D precalculado y autocasting FP16 en CUDA.

No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Los datasets citados en la model card son `globis-university/aozorabunko-clean`, `hal-utokyo/Manga109-s`, `JustANormalTinkerer/Japanese-Dialogue-Dataset`, `wikimedia/wikipedia`, `JustANormalTinkerer/hayai-dataset-merged` y `alpindale/light-novels`, lo que situa el dominio de entrenamiento en manga, novelas ligeras, literatura japonesa y texto enciclopedico.

## Capacidades

- Reconocimiento optico de caracteres a nivel de recorte en japones, chino, coreano e ingles, con soporte de texto horizontal y vertical.
- Transcripcion de texto denso y estilizado (tipografias de manga, rotulacion, onomatopeyas) sin etapa previa de deteccion de lineas.
- Extraccion de imagen a texto directa mediante `model.generate()`, con tokenizer `PreTrainedTokenizerFast` y procesador SigLIP2 NaFlex.
- Ajuste del equilibrio precision/latencia mediante el presupuesto de parches (`max_num_patches` de 256, 384 o 512), que determina el numero de tokens visuales del decodificador.
- Ejecucion en FP16 sobre CUDA con autocasting, KV-cache estatico y RoPE precalculado para maximizar throughput.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni vision general (la salida es texto transcrito).
- Capacidades multilingues limitadas a los cuatro idiomas listados; no hay evidencia de soporte para otras lenguas.

## Casos de uso

- Digitalizacion de manga y comics: el modelo reconoce recortes de paneles con texto vertical japones y tipografias estilizadas, por lo que se integraria detras de un detector de texto (tipo DBNet o YOLO) que genere los recortes y los envie al OCR para obtener el guion transcrito.
- Pipelines de scanlation y traduccion automatica: al ser un modelo de ~157M y 0,6 GB, puede ejecutarse en la misma GPU que el modelo de traduccion, transcribiendo cada recorte y encadenando la salida a un sistema de traduccion ja->es o ja->en.
- Extraccion de texto en videojuegos y capturas de pantalla: con recortes de interfaz o cajas de dialogo en CJK, el modelo permite construir subtitulos o bases de datos de cadenas sin necesidad de OCR en la nube.
- Indexacion y busqueda sobre documentos escaneados: transcripcion por lotes de libros y articulos en japones o chino para alimentar un indice de texto o un sistema RAG, aprovechando el bajo coste por pagina frente a VLM de mayor tamano.
- Procesamiento de subtitulos quemados en video: extraccion fotograma a fotograma de los recortes de subtitulo y deduplicacion posterior, con el presupuesto de 256 parches para maximizar el throughput en emision o ingesta masiva.
- Digitalizacion de fondos bibliograficos y archivos historicos en japones: el modelo fue entrenado sobre `aozorabunko-clean` y `wikipedia`, lo que lo hace adecuado para texto impreso limpio y columnas verticales tradicionales.
- Moderacion y analitica de contenido en redes sociales: deteccion y transcripcion de texto incrustado en imagenes en cuatro idiomas para clasificacion posterior de contenido o busqueda interna.
- Procesamiento por lotes de alto volumen en GPU de gama baja: gracias a los ~157M de parametros y a la compresion 4x de tokens visuales, es viable desplegarlo en una unica NVIDIA T4 para miles de recortes por hora.

## Benchmarks y rendimiento

Resultados publicados por el autor en JMangaBench_Mixed (3.286 recortes) bajo normalizacion Unicode NFKC, con latencias relativas medidas en una NVIDIA T4:

| `max_num_patches` | Tokens visuales | CER (↓) | Exact Match (↑) | CER solo texto (↓) | EM solo texto (↑) | Latencia relativa |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 256 | <= 64 | 4,95% | 75,35% | 3,54% | 82,65% | 1,00x (base) |
| 384 (por defecto) | <= 96 | 3,65% | 79,15% | 2,36% | 86,31% | ~1,19x |
| 512 (maxima calidad) | <= 128 | 3,10% | 80,68% | 1,78% | 88,04% | ~1,34x |

Comparativa parcial publicada en el mismo benchmark (la tabla de la model card aparece truncada en la informacion disponible):

| Modelo | Parametros | CER (↓) | Exact Match (↑) | CER solo texto (↓) | EM solo texto (↑) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| MangaOCR | ~150M | 4,68% | 73,52% | 2,70% | 82,87% |
| BaberuOCR | No disponible | No disponible | No disponible | No disponible | No disponible |
| Hayai OCR v2.5 Nova (512 parches) | ~157M | 3,10% | 80,68% | 1,78% | 88,04% |

El autor indica ademas que, en recortes densos, subir de 256 a 512 parches reduce el CER del 7,43% al 2,70%. No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas del OCR (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: con ~157M de parametros, los pesos en FP16 ocupan aproximadamente 0,31 GB; sumando activaciones y KV-cache, el consumo se mantiene por debajo de 1-2 GB en los presupuestos de parches documentados.
- GPU recomendadas: NVIDIA T4 (es la GPU en la que se midieron las latencias relativas publicadas), A100 y H100 para despliegues de alto volumen en lote; tambien es funcional en GPU de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050/3060/4090). Tambien puede ejecutarse en CPU, aunque el autor no publica cifras de latencia para ese caso.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, tokenizer `PreTrainedTokenizerFast` y `AutoProcessor` de `google/siglip2-base-patch16-naflex`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF; el codigo personalizado (atencion block-causal y mRoPE 2D) obliga a usar la implementacion del autor.
- Latencia y throughput estimados: solo se publican latencias relativas sobre T4 (1,00x con 256 parches, ~1,19x con 384 y ~1,34x con 512). Los valores absolutos en milisegundos por recorte no estan disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / tokens visuales | CER (JMangaBench_Mixed) | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Hayai OCR v2.5 Nova | ~157M | en, ja, zh, ko | Hasta 128 tokens visuales (512 parches) | 3,10% | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| MangaOCR | ~150M | ja (principalmente) | No disponible | 4,68% | No disponible en la informacion proporcionada | HuggingFace |
| BaberuOCR | No disponible | No disponible | No disponible | No disponible (tabla truncada) | No disponible | No disponible |

Frente a MangaOCR, el modelo declara un CER 1,58 puntos mejor y un exact match 7,16 puntos superior en el mismo benchmark, ademas de cubrir cuatro idiomas en lugar de centrarse en japones. La comparacion con BaberuOCR no puede completarse porque la tabla de la model card llega truncada en la informacion disponible. No se dispone de datos para comparar con VLM generalistas tipo Qwen2-VL o InternVL en esta tarea concreta.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para reconocimiento a nivel de recorte: para escanear paginas completas hay que emparejarlo con un detector de texto (DBNet, YOLO u otro), ya que no realiza deteccion de lineas.
- El decodificador es muy compacto (12 capas, `d_model=512`), lo que limita su capacidad para tareas distintas del OCR y para contextos textuales largos; el propio autor recomienda `max_new_tokens=128`.
- Riesgo de alucinacion en recortes vacios, ruidosos o con muy poco texto, comportamiento comun en modelos generativos de OCR sin validacion externa.
- Cobertura idiomatica restringida a ingles, japones, chino y coreano; no hay evidencia de rendimiento en otras lenguas ni en alfabetos no CJK.
- El dominio de entrenamiento esta sesgado hacia manga, novelas ligeras, Wikipedia y literatura japonesa; el rendimiento en documentos administrativos, formularios o manuscritos no esta documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo publicado en el repositorio del autor; conviene auditar ese codigo antes de desplegarlo en produccion.
- No hay soporte de cuantizacion ni formatos GGUF, y el codigo personalizado (atencion block-causal, mRoPE 2D) impide usar aceleradores estandar como vLLM o llama.cpp.
- La licencia Apache 2.0 permite uso comercial, pero al no existir validacion independiente ni resultados replicados por terceros, la adopcion en produccion deberia ir precedida de una evaluacion propia sobre el corpus objetivo.
- Se recomienda mantener `repetition_penalty=1.0` (desactivado); otros valores pueden degradar la transcripcion segun el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.5-nova
- Repositorio de utilidades hayai-ocr en GitHub: https://github.com/NopeNopeGuy/hayai-ocr
- Benchmark JMangaBench_Mixed: https://github.com/muscgab/JMangaBench_Mixed/
- Procesador SigLIP2 NaFlex empleado: https://huggingface.co/google/siglip2-base-patch16-naflex
- Dataset globis-university/aozorabunko-clean: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Dataset hal-utokyo/Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Dataset JustANormalTinkerer/Japanese-Dialogue-Dataset: https://huggingface.co/datasets/JustANormalTinkerer/Japanese-Dialogue-Dataset
- Dataset JustANormalTinkerer/hayai-dataset-merged: https://huggingface.co/datasets/JustANormalTinkerer/hayai-dataset-merged
- Dataset alpindale/light-novels: https://huggingface.co/datasets/alpindale/light-novels
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos correspondian a un portal de anuncios sin relacion con el modelo.
