# pathnirvana/sinhala-pali-ocr-lightonocr-1b

## Resumen

El modelo `pathnirvana/sinhala-pali-ocr-lightonocr-1b` es un ajuste fino completo de LightOnOCR-2-1B, desarrollado por Path Nirvana, especializado en OCR a nivel de pagina para libros impresos en cingales y pali con escritura cingalesa, con un rango temporal que abarca desde la decada de 1870 hasta la de 2000. El modelo resuelve un problema concreto: los sistemas OCR generalistas no reconocen la escritura cingalesa, y el modelo base LightOnOCR-2-1B obtiene un CER del 160 % en estas paginas. Este ajuste reduce el CER al 2,0 % en el conjunto de prueba de 480 paginas.

Arquitectura basada en Mistral 3 con vision encoder, 1B parametros, pipeline `image-text-to-text`. El modelo recibe una unica imagen de pagina y devuelve el texto en UTF-8 Unicode cingales (NFC), preservando saltos de linea, parrafos, negritas y llamadas de nota al pie. Se distribuye con licencia Apache 2.0 y esta pensado para digitalizacion de patrimonio bibliografico budista y legal de Sri Lanka.

Su relevancia actual radica en la combinacion de un CER bajo (mediana de 1,1 % por pagina) con un rendimiento de 1,45 paginas por segundo en una unica RTX 5090 mediante vLLM, lo que lo hace viable para proyectos de digitalizacion a escala con hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 con vision encoder (LightOnOCR) |
| Parametros totales | 1B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12.288 tokens configurados en vLLM; entrenamiento con salidas de hasta 6.144 tokens |
| Tipos de cuantizacion | no disponible (entrenado y distribuido en bf16/fp32; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | cingales (si), pali (pi) en escritura cingalesa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers); compatible con vLLM y mlx-vlm |
| Resolucion de entrada | hasta 1.540 px en el lado mayor |
| Libreria | transformers (LightOnOcrForConditionalGeneration, LightOnOcrProcessor) |
| Modelo base | lightonai/LightOnOCR-2-1B |

## Arquitectura y entrenamiento

El modelo parte de LightOnOCR-2-1B, un modelo multimodal de tipo Mistral 3 con vision encoder, y se somete a un ajuste fino completo de todos los pesos, incluido el encoder visual. El entrenamiento se realizo en una unica RTX 5090 de 32 GB durante aproximadamente 8 horas, con pesos maestros en fp32 y autocast bf16, gradient checkpointing y calculo de perdida unicamente sobre el texto objetivo. Se uso un learning rate de 2e-5 con schedule coseno y un 3 % de warmup, batch efectivo de 16 paginas y 2 epocas (964 pasos). La perdida de validacion descendio de 0,0505 en el paso 200 a 0,0345 en el paso 964.

Los datos de entrenamiento consisten en 7.734 paginas: 2.973 paginas del Buddha Jayanti Tripitaka (pali y cingales), 4.395 paginas de impresos antiguos alineadas con ediciones corregidas de pitaka.lk, 289 paginas de actas de Sri Lanka (1981-1989) y 77 paginas de biblioteca transcritas por Claude Opus. La resolucion de entrada es de 1.540 px en el lado mayor, reducida aleatoriamente al 82-100 % durante el entrenamiento, con aumentacion leve de tipo escaneo (pequena rotacion, contraste, desenfoque, JPEG). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre texto objetivo.

Una innovacion destacable es el formato de salida estructurado: el modelo reconstruye lineas impresas como lineas de texto (conservando guiones de particion de palabra), separa parrafos con linea en blanco, marca negritas con `**bold**`, convierte numeros de nota al pie en digitos en superindice y omite encabezados de pagina, numeros de pagina y codigos de pie de imprenta. Ademas, admite una instruccion de texto opcional `nobold` para suprimir el marcado de negritas.

## Capacidades

- OCR a nivel de pagina de libros impresos en cingales y pali con escritura cingalesa, desde la decada de 1870 hasta la de 2000.
- Salida en UTF-8 Unicode cingales en forma de normalizacion NFC.
- Reconstruccion de estructura: saltos de linea, parrafos, encabezados, versos y notas al pie.
- Deteccion y marcado de negritas impresas mediante `**bold**`.
- Conversion de numeros de referencia de notas al pie a digitos en superindice (¹ ² ³).
- Supresion de elementos no deseados: encabezados corridos, numeros de pagina y codigos de pie de imprenta.
- Modo `nobold` para obtener la misma transcripcion sin marcado de negritas.
- Funcionamiento sin prompt de texto: el modelo trabaja a partir de la imagen sola; el prompt `nobold` es la unica instruccion de texto usada en entrenamiento.
- Soporte de inferencia por lotes mediante vLLM con `limit_mm_per_prompt={"image": 1}`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni thinking mode.

## Casos de uso

- Digitalizacion masiva del Buddha Jayanti Tripitaka: el modelo esta entrenado especificamente con 2.973 paginas de esta coleccion y obtiene un CER del 2,11 % en las 186 paginas de prueba de libros no vistos, lo que permite convertir volumenes completos a texto estructurado con notas al pie y versos preservados.
- Recuperacion de impresos antiguos de pitaka.lk: con 4.395 paginas de entrenamiento alineadas con ediciones corregidas y un CER del 1,95 % en 200 paginas de prueba, es adecuado para proyectos de preservacion de ediciones de los siglos XIX y XX.
- Digitalizacion de actas legislativas de Sri Lanka (1981-1989): el modelo alcanza un CER del 1,49 % en 82 paginas de prueba, lo que lo hace util para archivos legales que requieren transcripcion fiel de texto normativo.
- Construccion de corpus para investigacion en pali y budismo: la salida estructurada con parrafos, versos y notas al pie facilita la indexacion y el analisis filologico de textos canonicos.
- Pipeline de OCR por lotes en produccion: con vLLM sobre una RTX 5090 se procesan 1,45 paginas por segundo, suficiente para digitalizar decenas de miles de paginas en pocos dias con una sola GPU de consumo.
- Procesamiento en Apple Silicon: mediante mlx-vlm 0.7.12 el modelo corre en la GPU del Mac con salida identica a vLLM, a unas 50 tokens/s (aproximadamente 50 segundos por pagina en un M4), util para digitalizacion en estaciones de trabajo sin GPU dedicada.
- Limpieza de transcripciones existentes: el modo `nobold` permite regenerar texto sin marcado cuando el destino no admite formato enriquecido, por ejemplo para ingestión en bases de datos o motores de busqueda.

## Benchmarks y rendimiento

Resultados sobre las 480 paginas de prueba del dataset, provenientes de libros completos nunca vistos en entrenamiento. CER es la tasa de error de caracteres tras normalizacion, con el marcado de negritas eliminado. Las demas columnas son puntuaciones F1.

| Fuente | Paginas | CER | CER mediano por pagina | bold F1 | line-break F1 | paragraph F1 |
|---|---|---|---|---|---|---|
| pitaka-books (impresos antiguos) | 200 | 1,95 % | 0,93 % | 0,63 | 0,92 | 0,87 |
| acts (1981-89) | 82 | 1,49 % | 0,88 % | n/a | 0,92 | 0,82 |
| bjt (Buddha Jayanti Tripitaka) | 186 | 2,11 % | 1,46 % | 0,17 | 0,86 | 0,91 |
| opus-lib (libros de biblioteca) | 12 | 5,4 % | 5,6 % | 0,62 | 0,66 | 0,33 |
| **total** | **480** | **2,0 %** | **1,1 %** | **0,56** | **0,89** | **0,86** |

El modelo base LightOnOCR-2-1B obtiene un CER del 160 % en las mismas paginas, es decir, no lee cingales. El autor advierte que los textos de referencia provienen de ediciones corregidas que difieren de la pagina impresa en algunos puntos, por lo que aproximadamente un 1-2 % del error medido no es atribuible al modelo. La puntuacion baja de bold F1 en BJT (0,17) posiblemente se debe a que la referencia marca negritas de forma distinta a la impresion, y no se ha verificado contra los escaneos. Las referencias de `opus-lib` son transcripciones automaticas.

Rendimiento de inferencia documentado:

| Plataforma | Configuracion | Throughput |
|---|---|---|
| RTX 5090 (32 GB) | vLLM 0.32 | ~1,45 paginas/s |
| Apple M4 | mlx-vlm 0.7.12 | ~50 tokens/s (~50 s por pagina) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1B parametros; en bf16 requiere aproximadamente 2 GB para los pesos, mas el coste del vision encoder y de la cache KV. La configuracion de referencia en vLLM usa `max_model_len=12288`, lo que incrementa el uso de memoria por la cache KV.
- GPU recomendadas: RTX 5090 (32 GB) es la plataforma de referencia documentada, tanto para entrenamiento como para inferencia con vLLM. Cualquier GPU con al menos 8-16 GB de VRAM deberia poder alojar el modelo en bf16, aunque el autor no documenta pruebas en otras GPU.
- Cabe en GPU de consumo: si, segun la evidencia del entrenamiento y la inferencia en una unica RTX 5090. No se documentan pruebas en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: vLLM (recomendado para muchas paginas), transformers con `LightOnOcrForConditionalGeneration` y `LightOnOcrProcessor`, y mlx-vlm 0.7.12 en Apple Silicon. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~1,45 paginas/s en RTX 5090 con vLLM; ~50 s por pagina en Apple M4 con mlx-vlm. Se recomienda decodificacion greedy (`temperature=0`), `max_tokens=6144` y `repetition_penalty=1.05`, ya que las paginas densas pueden superar los 4.096 tokens de salida porque el cingales consume aproximadamente un token por caracter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en paginas cingales/pali | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pathnirvana/sinhala-pali-ocr-lightonocr-1b | 1B | 12.288 tokens (config. vLLM) | 2,0 % (total, 480 paginas) | Apache 2.0 | Hugging Face |
| lightonai/LightOnOCR-2-1B (base) | 1B | no disponible | 160 % (no lee cingales) | no disponible en la informacion | Hugging Face |
| OCR generalistas (sin ajuste en cingales) | variable | variable | no disponible | variable | variable |

La informacion proporcionada solo permite comparar de forma directa con el modelo base LightOnOCR-2-1B, que no reconoce la escritura cingalesa. No se dispone de datos de otros sistemas OCR especializados en cingales o pali para establecer una comparativa adicional.

## Limitaciones y advertencias

- Cobertura limitada: entrenado solo con paginas de libros en cingales y pali con escritura cingalesa. Otras escrituras, tablas y escritura manuscrita no han sido probadas.
- Paginas mecanografiadas y muy danadas: el autor indica que no han sido probadas (la model card se interrumpe en este punto), por lo que su comportamiento en estos casos es incierto.
- Riesgo de error en la referencia: aproximadamente un 1-2 % del CER medido corresponde a diferencias entre el texto de referencia (ediciones corregidas) y la pagina impresa, no a fallos del modelo.
- Marcado de negritas poco fiable en algunas fuentes: bold F1 de 0,17 en BJT y de 0,63 en pitaka-books, lo que desaconseja depender del marcado `**bold**` en esos corpus sin verificacion.
- Rendimiento degradado en libros de biblioteca: CER del 5,4 % y paragraph F1 de 0,33 en las 12 paginas de `opus-lib`, con referencias generadas automaticamente, lo que limita la confianza en ese subconjunto.
- Longitud de salida: las paginas densas pueden requerir mas de 4.096 tokens de salida; con `max_tokens` insuficiente se truncara la transcripcion.
- Prompt: el modelo no fue entrenado con prompts de texto genericos; usar el prompt por defecto de la CLI de mlx-vlm produce resultados incorrectos. Solo `nobold` esta soportado.
- Advertencia de tokenizer en transformers 5: puede aparecer un aviso sobre el patron regex del tokenizer; el autor indica que no afecta al modelo porque los tokens coincidieron con el tokenizer de entrenamiento en todas las pruebas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni soporte por parte del autor.
- Sesgos: no se documentan sesgos especificos mas alla de la cobertura limitada de idioma y tipo de documento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pathnirvana/sinhala-pali-ocr-lightonocr-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/pathnirvana/sinhala-pali-ocr
- Modelo base LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Path Nirvana / pitaka.lk: https://pitaka.lk
