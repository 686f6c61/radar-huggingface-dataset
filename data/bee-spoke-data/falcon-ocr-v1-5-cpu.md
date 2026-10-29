# BEE-spoke-data/falcon-ocr-v1.5-cpu

## Resumen

Falcon-OCR v1.5 CPU es un reempaquetado de los pesos de `tiiuae/Falcon-OCR` v1.5 (revision `fe757d59`) realizado por el usuario BEE-spoke-data, publicado como `BEE-spoke-data/falcon-ocr-v1.5-cpu`. No es un checkpoint compatible con `transformers`: cada fichero almacena todos los tensores en el layout exacto que esperan los kernels del runner en Rust [falcon-ocr-cpu](https://github.com/amazingvince/falcon-ocr-cpu), de forma que el modelo se mapea en memoria sin conversion ni quantizacion en tiempo de arranque (unos 10 ms de carga frente a los aproximadamente 2 s que costaria cuantizar el checkpoint FP32 original).

El paquete cubre tres modos de ejecucion sobre CPU (FP32 exacto, INT16 con grupos de 64 y INT8 GPTQ con grupos de 64) mas una cabeza draft de 94 MB para decodificacion especulativa, que el runner usa automaticamente si esta presente en la carpeta del modelo. La propuesta de valor es el OCR de documentos en x86-64 (AVX2/AVX-512) y aarch64 (NEON) sin GPU, con un modo "casi exacto" que reproduce token a token la salida del FP32 en las pruebas publicadas y reduce el tiempo de decodificacion aproximadamente a la mitad.

Es relevante ahora porque permite desplegar un modelo de imagen a texto en servidores sin acelerador, en entornos air-gapped, con coste por pagina medido en decenas o unidades de decenas de segundos y con verificacion criptografica de los tensores. La informacion disponible no incluye el numero de parametros, la longitud de contexto ni la arquitectura interna del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de imagen a texto/OCR: `tiiuae/Falcon-OCR`); pesos reempaquetados para kernels propios `falcon-ocr-kernel-fp32-v1` y `falcon-ocr-kernel-v1` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (modo exact); INT16 con una escala FP32 por cada 64 pesos (modo near-exact); INT8 GPTQ con act-order y grupos de 64 (modo fast). INT16 usa codigos enteros escalados, no FP16/BF16. La cache KV acompana al modo (FP32/INT16/INT8) |
| Idiomas soportados | no disponible (las evaluaciones publicadas son exclusivamente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` con layout propio de los kernels (no es formato `transformers`, no es GGUF); incluye `tokenizer.json`, `tokenizer_config.json` y `config.json` del modelo original |

Tamano de los ficheros publicados:

| Fichero | Modo | Tamano |
|---|---|---:|
| `falcon-ocr-v1.5-fp32.safetensors` | exact | 1.133 MB |
| `falcon-ocr-v1.5-int16-g64.safetensors` | near-exact (por defecto) | 806 MB |
| `falcon-ocr-v1.5-int8-gptq-g64.safetensors` | fast | 638 MB |
| `falcon-ocr-v1.5-draft-head.safetensors` | cabeza draft (decodificacion especulativa) | 94 MB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF/DPO. El pipeline declarado es `image-to-text` con etiquetas `ocr` y `falcon_ocr`, y el modelo de referencia es `tiiuae/Falcon-OCR` v1.5 (revision `fe757d59`), del que este repositorio es un fine-tune/reempaquetado segun los tags (`base_model:finetune`).

Lo especifico de este repositorio es la ingenieria de despliegue. Cada fichero mantiene en FP32 la embedding, la cabeza de vocabulario, las normas, el proyector y los attention sinks, y anade un cribado INT8 de la cabeza de vocabulario con cotas de error, de modo que el runner elige exactamente el mismo token greedy que elegiria la cabeza FP32 completa. Los metadatos de cada safetensors registran el hash del checkpoint de origen, la receta de cuantizacion y un digest por tensor, comprobable con `--verify-model-file`. La cabeza draft implementa decodificacion especulativa (los tags del repo citan EAGLE) y se activa sola si esta en la carpeta; el texto de la model card se trunca justo al describirla.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de pagina completa, con salida de texto (`run page.png --text`).
- Tres regimenes de precision intercambiables en linea de comandos: `--mode exact`, `--mode near-exact` (por defecto) y `--mode fast`.
- Decodificacion especulativa con cabeza draft propia, con velocidad de decodificacion entre 1,50x y 1,87x segun modo.
- Carga por memory-mapping del fichero de pesos: aproximadamente 10 ms, sin fase de cuantizacion al arrancar.
- Verificacion de integridad de los pesos mediante digest por tensor (`--verify-model-file`) y comando de diagnostico `doctor` para conocer el plan de ejecucion.
- Ejecucion en CPU x86-64 con AVX2 o AVX-512, aarch64 con NEON y fallback escalar.
- Capacidad de seleccion de resolucion por pagina con `--max-dimension auto` (768, 1024 o 1536 px), aunque desactivada por defecto por perdida de calidad.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision general (mas alla de OCR), audio ni modo thinking.

## Casos de uso

- Digitalizacion masiva de documentos administrativos en servidores sin GPU: el modo near-exact procesa una pagina tipo journal (6.544 tokens de imagen) en 21,5 s en un Ryzen 9 7950X, con salida identica al FP32 en las 118 paginas de OmniDocBench evaluadas; adecuado para lotes nocturnos donde el coste de GPU es el factor limitante.
- OCR on-premise con requisitos de confidencialidad (expedientes judiciales, historiales clinicos): al ser un runner local en Rust sobre ficheros locales y no depender de API externa, el documento no sale de la infraestructura; el modo exact garantiza fidelidad total al modelo original.
- Extraccion de texto en pipelines de datos y CI/CD: la interfaz es un binario con subida de fichero y salida de texto, facil de invocar desde scripts y de integrar en un paso de build o en un DAG de orquestacion.
- Procesamiento de preprints y literatura cientifica: el modelo esta evaluado sobre OmniDocBench, que incluye figuras (enmascaradas en la entrada de todos los sistemas comparados); util para convertir PDF renderizados a texto preservando el flujo de lectura.
- Archivo de manuscritos y escaneos degradados: la model card recomienda explicitamente near-exact en estos casos, porque el modo fast con pesos de 8 bits empuja algunas paginas inciertas a bucles de repeticion que el runner debe cortar.
- Despliegue en estaciones de trabajo y equipos de campo x86-64 sin acelerador, o en ARM de 64 bits: el proyecto compila y pasa las pruebas de kernel en aarch64 (NEON), si bien no hay ejecucion con modelo medida en esa plataforma.
- Auditoria y reproducibilidad de resultados OCR: los digests por tensor y el registro de la receta de cuantizacion permiten demostrar que el binario en produccion usa exactamente los pesos declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos publicados son mediciones internas de fidelidad frente al modelo FP32 y de velocidad.

Fidelidad frente a FP32 (teacher forcing sobre las salidas del modelo, 55 paginas de calibracion, 24.262 tokens):

| Modo | KL media por token | Tokens con eleccion greedy distinta |
|---|---:|---:|
| exact (FP32) | 0 | 0 |
| near-exact (INT16) | 9e-8 | 1 |
| fast (INT8 GPTQ) | 2,7e-4 | 63 |

Calidad en 118 paginas nuevas de OmniDocBench en ingles (figuras que el ground truth omite, enmascaradas en la entrada de todos los sistemas): near-exact produjo exactamente los tokens del FP32 en todas las paginas; fast coincidio token a token en 93 paginas y su tasa de error de caracteres fue 0,11 puntos inferior a la del FP32 en el global, sin bucles de repeticion.

Velocidad (Ryzen 9 7950X, 16 nucleos, DDR5, Windows 11, flags por defecto, sin cabeza draft):

| Modo | Pagina journal (6.544 tokens de imagen) | Decodificacion por token |
|---|---:|---:|
| exact (FP32) | 38 s | 29 ms |
| near-exact | 21,5 s | 15 ms |
| fast | 12,6 s | 8,5 ms |

Con cabeza draft (16 paginas inglesas de held-out, mismo total de tokens):

| Modo | Solo drafts n-gram | Con cabeza draft | Aceleracion de decodificacion |
|---|---:|---:|---:|
| exact | 531 s | 393 s (-26%) | 1,67x |
| near-exact | 277 s | 208 s (-25%) | 1,87x |
| fast | 173 s | 136 s (-21%) | 1,50x |

## Requisitos de hardware

- No requiere GPU: el runner es de CPU y los pesos estan empaquetados para kernels escalares/SIMD.
- Memoria: los pesos ocupan 1.133 MB (FP32), 806 MB (INT16) o 638 MB (INT8), mas 94 MB si se usa la cabeza draft. El consumo total depende de la cache KV, cuyo tamano para los 6.544 tokens de imagen de la pagina journal no se publica; como referencia de orden de magnitud, el conjunto de ficheros del repo suma 5,8 GB.
- CPU soportadas: x86-64 con AVX2 o AVX-512 (unica plataforma con mediciones respaldadas por modelo) y aarch64 con NEON, con fallback escalar (solo cobertura de compilacion y tests de kernel).
- Equipo de referencia de las mediciones: AMD Ryzen 9 7950X, 16 nucleos, DDR5, Windows 11.
- Throughput observado: 29 ms/token en exact, 15 ms/token en near-exact y 8,5 ms/token en fast; entre 12,6 s y 38 s por pagina journal sin especulacion.
- Opciones de despliegue: exclusivamente el runner `falcon-ocr-cpu` (Rust 1.94.0, compilador de C/C++, CMake y NASM en x86). Estos ficheros no son checkpoints `transformers` ni GGUF, por lo que no son utilizables directamente con vLLM, TGI, llama.cpp u Ollama; para esas rutas habria que partir de `tiiuae/Falcon-OCR`.
- Ahorro adicional: `--max-dimension auto` reduce alrededor de un cuarto del tiempo de CPU en su conjunto de desarrollo, a costa de modificar la salida (fallo el quality gate de held-out).

## Comparativa con modelos similares

Comparativa interna de los tres modos publicados y del checkpoint de origen (los unicos datos disponibles):

| Variante | Pesos | Precision cuerpo / cache KV | Diferencia greedy vs FP32 | Pagina journal | Uso recomendado |
|---|---|---:|---:|---:|---|
| `BEE-spoke-data/...-fp32` | 1.133 MB | FP32 / FP32 | 0 | 38 s | Referencia y maxima fidelidad |
| `BEE-spoke-data/...-int16-g64` | 806 MB | INT16 g64 / INT16 | 1 token de 24.262 | 21,5 s | Valor por defecto en produccion |
| `BEE-spoke-data/...-int8-gptq-g64` | 638 MB | INT8 GPTQ g64 / INT8 | 63 tokens de 24.262 | 12,6 s | Documento impreso limpio en ingles |
| `tiiuae/Falcon-OCR` | no disponible | FP32 (checkpoint original) | referencia | requiere otro runtime | Reentrenamiento o uso con `transformers` |

No hay en la informacion proporcionada datos de otros sistemas OCR (Tesseract, PaddleOCR, dots.ocr u otros) que permitan una comparacion de parametros, contexto o rendimiento; por tanto, esa comparacion se considera no disponible.

## Limitaciones y advertencias

- No es un checkpoint `transformers`: sin el runner `falcon-ocr-cpu` los ficheros no son utilizables. Los binarios antiguos necesitan rutas explicitas `--model-file` para los ficheros cuantizados renombrados y no pueden cargar el nuevo formato FP32.
- Idiomas: todas las evaluaciones publicadas son en ingles (OmniDocBench en ingles y 16 paginas inglesas de held-out). No hay datos de calidad en castellano ni en otros idiomas, lo que impide asumir un rendimiento equivalente.
- Manuscritos y escaneos degradados: el modo fast (INT8) provoca bucles de repeticion en algunas paginas inciertas del conjunto de 200 paginas held-out del runner; hay que usar near-exact en esos casos.
- `--max-dimension auto` cambia la salida y no supero el quality gate de held-out, aunque reduzca el tiempo de CPU en torno a un cuarto.
- Las metricas de velocidad proceden de un unico equipo (Ryzen 9 7950X, Windows 11) y de los modos del runner, no de nuevos benchmarks de los ficheros reempaquetados; en aarch64 no existe ejecucion con modelo medida.
- No se publican parametros, contexto maximo ni composicion del dataset, lo que limita el analisis de riesgo de alucinacion y de truncamiento en documentos muy largos.
- La licencia del repositorio es apache-2.0, permisiva para uso comercial; conviene conservar los avisos de licencia y verificar la licencia del checkpoint de origen `tiiuae/Falcon-OCR` antes de redistribuir. La model card no detalla una licencia especifica para la cabeza draft.
- La model card no incluye analisis de sesgos. El riesgo de alucinacion en OCR se traduce en texto inventado o repetido, no cuantificado para los modos exact y near-exact.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BEE-spoke-data/falcon-ocr-v1.5-cpu
- Modelo base: https://huggingface.co/tiiuae/Falcon-OCR
- Runner de CPU en Rust: https://github.com/amazingvince/falcon-ocr-cpu
- Documentacion de modos: https://github.com/amazingvince/falcon-ocr-cpu/blob/main/docs/MODES.md
- Estudio del enrutador de resolucion: https://github.com/amazingvince/falcon-ocr-cpu/blob/main/research/resolution-router/README.md
- Paper citado en los tags del repo (arXiv:2603.27365): https://arxiv.org/abs/2603.27365
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos tratan sobre biologia de las abejas y no guardan relacion con el modelo.
