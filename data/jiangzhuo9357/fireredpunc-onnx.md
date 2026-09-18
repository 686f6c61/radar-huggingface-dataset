# jiangzhuo9357/fireredpunc-onnx

## Resumen

fireredpunc-onnx es un export ONNX con cuantización de 8 bits solo de pesos (*weight-only*) del modelo FireRedPunc de FireRedTeam, un sistema de restauración de puntuación para chino e inglés. No es un modelo generativo: se trata de un clasificador de tokens sobre un encoder BERT-base (`chinese-lert-base`, 12 capas, vocabulario de 21.128 entradas) cuya cabeza de clasificación predice cinco clases de salida: `<space>`, `，`, `。`, `？` y `！`. El repositorio lo publica el usuario jiangzhuo9357 como espejo del modelo original, pensado para la etapa local de segmentación de frases del proyecto Sokuji.

El problema que resuelve es concreto: las transcripciones de ASR en chino e inglés llegan sin puntuación, lo que rompe la segmentación en frases y dificulta tareas posteriores como el subtitulado o la traducción. FireRedPunc inserta marcas de pausa y de final de frase sobre texto ya transcrito, y este export lo hace ejecutable en entornos sin PyTorch, incluyendo navegador mediante `onnxruntime-web`.

La relevancia de este repositorio en particular está en el método de cuantización. El export int8 dinámico publicado por terceros (42ailab) degrada gravemente la salida: convierte aproximadamente la mitad de las marcas de final de frase en comas. Este repo reconstruye el export desde los pesos fp32 originales con `MatMulNBitsQuantizer` (8 bits, block size 32, simétrico), manteniendo todas las activaciones en float32, y consigue paridad exacta con la referencia PyTorch fp32 en 153 de 153 filas de prueba (8.798 tokens). El peso del archivo es de 162.771.205 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (`chinese-lert-base`), 12 capas, vocabulario de 21.128 entradas, con cabeza de clasificacion de tokens sobre 5 clases |
| Parametros totales | no disponible en la informacion proporcionada (el export int8 ocupa 162.771.205 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (8 bits, block size 32, simetrica, via `MatMulNBitsQuantizer`); el script de conversion genera ademas variantes `int8pc-nocls` y `q4w` |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`punc.q8w.onnx`), acompanado de `tokenizer.json` y `out_dict` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT-base con 12 capas y un vocabulario de 21.128 tokens, sobre el que se anade una cabeza de clasificacion por token. La salida se limita a cinco etiquetas (`<space>`, `，`, `。`, `？`, `！`) definidas en el archivo `out_dict`. El `tokenizer.json` de este repo es identico byte a byte al de `chinese-lert-base`, y su vocabulario coincide con el `chinese-bert-wwm-ext_vocab.txt` que usa el proyecto original para los identificadores de token.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; tampoco se describe ningun mecanismo de atencion lineal o decodificacion especulativa. La innovacion tecnica relevante de este repositorio no esta en el modelo sino en el proceso de conversion: se parte de un export ONNX fp32 de los pesos PyTorch originales (`fireredasr2s.punc.ModelIO`) y se aplica cuantizacion de 8 bits exclusivamente a las matrices de las capas MatMul, dejando `input_ids`, `attention_mask` y `logits` en float32. El comando exacto (`python parity/fireredpunc-quant.py`) se ejecuta contra el banco de pruebas de puntuacion de Sokuji y produce `punc.{int8pc-nocls,q8w,q4w}.onnx`; el archivo publicado es la salida `q8w` copiada sin modificaciones.

## Capacidades

- Restauracion de puntuacion en chino e ingles: inserta comas, puntos, signos de interrogacion y de exclamacion sobre texto sin puntuar.
- Clasificacion de tokens con cinco etiquetas de salida, incluyendo una clase explicita para espacios.
- Segmentacion de frases orientada a transcripciones de ASR, con modo por lotes (*offline*) y modo en streaming con confirmacion basada en 8 caracteres de contexto derecho.
- Ejecucion en navegador mediante `onnxruntime-web` 1.26 sobre WASM y sobre WebGPU, con salida identica entre ambos en las 57 entradas del corpus de prueba.
- Ejecucion en CPU con WASM de 4 hilos, sin dependencia de GPU.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- Cobertura multilingue limitada a chino e ingles.
- No dispone de modo *thinking* ni de capacidades de audio: opera sobre texto ya transcrito.

## Casos de uso

- Segmentacion de transcripciones de ASR en tiempo real: el modelo puede procesar la salida de un reconocedor de voz en streaming y decidir donde termina cada frase usando 8 caracteres de contexto derecho, con precision 84,4 y recall 53,5 en marcas de final de frase segun las mediciones del banco de pruebas.
- Post-procesado por lotes de transcripciones ya generadas: en modo *offline* alcanza un F1 de breakpoint de 91,5 sobre chino con entrada sin puntuar, adecuado para limpiar grandes volumenes de subtitulos antes de publicarlos.
- Subtitulado automatico para video: al recuperar los limites de frase, permite partir los subtitulos en unidades legibles en lugar de cortes arbitrarios por longitud de caracter.
- Integracion en aplicaciones de escritorio tipo Electron: el archivo pesa 163 MB y se ejecuta por WebGPU en 27 ms para 480 caracteres en chino, lo que permite puntuar en local sin enviar audio ni texto a un servicio externo.
- Traduccion asistida chino-ingles: insertar la puntuacion antes de pasar el texto a un traductor mejora la segmentacion de oraciones, ya que los sistemas de traduccion trabajan mejor con frases delimitadas.
- Indexacion y busqueda sobre transcripciones: la division en frases permite construir indices por oracion en lugar de por documento completo, con limites semanticos mas utiles para recuperacion.
- Procesamiento en navegador sin backend: gracias al export ONNX y a `onnxruntime-web`, la puntuacion puede ejecutarse enteramente en el cliente, lo que simplifica el despliegue y evita costes de servidor.
- Etapa previa a resumen automatico de reuniones: la segmentacion en frases es un requisito habitual antes de aplicar modelos de resumen o de extraccion de actas.

## Benchmarks y rendimiento

Datos extraidos de `docs/superpowers/notes/2026-09-14-asr-punctuation-benchmark.md` (repositorio de Sokuji, 2026-09-14).

| Metrica | Este repo (`q8w` int8) | 42ailab (int8 dinamico) | Upstream PyTorch fp32 |
|---|---|---|---|
| Paridad vs fp32 (153 filas zh/en, 8.798 tokens) | 153/153 filas exactas, 100% de clases de token | 43/153 filas, 96,8% de clases | referencia |
| Marcas de final de frase colocadas correctamente | 353 de 353 | aproximadamente la mitad, convertidas en comas | referencia |
| F1 de breakpoint, chino, entrada sin puntuar, offline | 91,5 | no disponible | no disponible |
| F1 de breakpoint, transcripcion cruda GPT-Live | 90,8 | no disponible | no disponible |
| F1 de final de frase, chino | 55,4 (precision 93 / recall 39) | no disponible | no disponible |
| Precision / recall de breakpoints en streaming | 93,0 / 90,2 | no disponible | no disponible |
| Precision / recall de final de frase en streaming | 84,4 / 53,5 | no disponible | no disponible |
| Coste de render, WebGPU (DGX Spark GB10 aarch64, Electron 40.8.5) | zh 480 caracteres en 27 ms; en 960 caracteres en 19 ms | no disponible | no disponible |
| Coste de render, WASM de 4 hilos | zh 394 ms; en 246 ms | no disponible | no disponible |
| Tamano en disco | 163 MB | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos frente a otros modelos de restauracion de puntuacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los pesos int8 ocupan 162.771.205 bytes y todas las activaciones se mantienen en float32, por lo que el consumo es de unos pocos cientos de megabytes, muy por debajo de cualquier GPU actual.
- Cabe en cualquier GPU de consumo, e incluso en GPU integradas y en CPU sin aceleracion dedicada. Las mediciones disponibles se hicieron en una DGX Spark GB10 (aarch64).
- Aceleracion mediante WebGPU: 27 ms para 480 caracteres en chino y 19 ms para 960 caracteres en ingles.
- Ejecucion en CPU mediante `onnxruntime-web` 1.26 con WASM de 4 hilos: 394 ms para 480 caracteres en chino y 246 ms para 960 caracteres en ingles.
- La salida por WebGPU es identica a la de WASM de 4 hilos en las 57 entradas del corpus de prueba.
- Opciones de despliegue documentadas: `onnxruntime` (Python) y `onnxruntime-web` 1.26 en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificacion de tokens.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Paridad vs fp32 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jiangzhuo9357/fireredpunc-onnx (este repo) | ONNX | int8 weight-only, block size 32, simetrica | 153/153 filas, 100% de clases | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| 42ailab/FireRedPunc-ONNX | ONNX | int8 dinamico por tensor | 43/153 filas, 96,8% de clases | no disponible en la informacion | publicado junto a los pesos originales |
| FireRedTeam/FireRedPunc | PyTorch fp32 | ninguna | referencia (100%) | Apache-2.0 | HuggingFace |

No se dispone de datos sobre otros modelos de restauracion de puntuacion (por ejemplo alternativas basadas en XLM-R o en modelos multilingues de puntuacion) en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes del mismo modelo.

## Limitaciones y advertencias

- El texto en ingles procesado por este modelo se devuelve en minusculas: la funcion `RuleBaedTxtFix` pasa todo a minusculas y solo vuelve a capitalizar el inicio de frase y la palabra "I". Sokuji restaura las mayusculas desde la entrada del ASR en lugar de confiar en la salida del modelo.
- El F1 de final de frase en chino es bajo (55,4, con recall de 39): el modelo prefiere insertar `，` en lugar de `。`, por lo que tiende a producir frases mas largas de lo deseable.
- En streaming, el recall de final de frase cae al 53,5 con precision 84,4, con confirmacion basada en 8 caracteres de contexto derecho; los limites de frase pueden retrasarse o perderse.
- La cuantizacion int8 dinamica publicada por terceros degrada gravemente el resultado (43/153 filas de paridad y perdida de aproximadamente la mitad de las marcas finales). Debe usarse el archivo `q8w` de este repositorio, no el export int8 dinamico alternativo.
- Solo cubre chino e ingles. No hay soporte documentado para otras lenguas.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento con entradas muy largas.
- Riesgo de alucinacion en el sentido de puntuacion espuria: al ser un clasificador de tokens, puede insertar marcas donde no corresponden, especialmente en texto con ruido de ASR.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos sistematicos.
- Licencia Apache-2.0, heredada de `FireRedTeam/FireRedPunc` y `FireRedTeam/FireRedASR2S`: permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia. El archivo `LICENSE` del repositorio es una copia literal del de `FireRedASR2S`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline no esta declarado en HuggingFace, por lo que no hay validacion externa de la comunidad.
- El repositorio es un espejo mantenido por un tercero, no una publicacion oficial de FireRedTeam; conviene verificar la integridad de los archivos con los hashes SHA-256 incluidos en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jiangzhuo9357/fireredpunc-onnx
- Pesos originales de FireRedTeam: https://huggingface.co/FireRedTeam/FireRedPunc
- Codigo de FireRedASR2S (`fireredasr2s/fireredpunc`, commit `4e7d9aaf`): https://github.com/FireRedTeam/FireRedASR2S
- Export int8 dinamico alternativo (42ailab): https://huggingface.co/42ailab/FireRedPunc-ONNX
- Proyecto Sokuji, que usa este export: https://github.com/kizuna-ai-lab/sokuji
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a paginas de soporte de YouTube Music y no guardan relacion con este repositorio.
