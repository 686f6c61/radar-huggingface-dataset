# amazingvince/falcon-ocr-v1.5-cpu

## Resumen

Falcon-OCR v1.5 CPU es un repositorio de pesos preempaquetados derivado de tiiuae/Falcon-OCR, publicado por el usuario amazingvince. No se trata de un modelo nuevo ni de un fine-tune: son los mismos pesos del checkpoint original de TII (revision `fe757d59`) reencodados y cuantizados para que el runner de CPU escrito en Rust `amazingvince/falcon-ocr-cpu` los lea directamente mediante memory-mapping, sin conversion en tiempo de carga. La ganancia declarada es de unos 10 ms de carga frente a los aproximadamente 2 s que cuesta cuantizar el checkpoint FP32 original al arrancar.

El paquete resuelve un problema de despliegue muy concreto: ejecutar OCR de imagen a texto en CPU sin GPU, con dos modos de precision. El fichero `near-exact` ocupa 806 MB y usa enteros de 16 bits con una escala por cada 64 pesos; el fichero `fast` ocupa 638 MB y usa GPTQ de 8 bits con act-order en grupos de 64. Ambos conservan en FP32 los embeddings, la cabeza de vocabulario, las normas, el proyector y los attention sinks, e incluyen una pantalla INT8 de la cabeza de vocabulario para seleccionar el mismo token greedy que la cabeza FP32 completa.

Su relevancia es de nicho pero clara: permite inferencia OCR determinista y verificable en hardware x86-64 con AVX2 o AVX-512, y en aarch64 con NEON, con digest por tensor comprobable al cargar. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no es una publicacion oficial de TII, sino una redistribucion bajo la misma licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card de esta conversion no detalla la del modelo base) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int16 con una escala por cada 64 pesos (modo near-exact); int8 GPTQ con act-order en grupos de 64 (modo fast); FP32 en embeddings, cabeza de vocabulario, normas, proyector y attention sinks; cache KV en 16 bits (near-exact) o 8 bits (fast) con escala BF16 por cada 32 valores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout propio del runner (no son checkpoints de `transformers`) |
| Tamano del repositorio | 1,4 GB |
| Fichero near-exact | 806 MB |
| Fichero fast | 638 MB |
| Ficheros auxiliares | `tokenizer.json`, `tokenizer_config.json`, `config.json` (copiados del modelo original) |
| Modelo base | tiiuae/Falcon-OCR, revision `fe757d59` |
| Pipeline | image-to-text |
| Autor de la conversion | amazingvince |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo base; unicamente indica que estos ficheros son reencodados y cuantizados a partir de tiiuae/Falcon-OCR, cuyo informe tecnico se cita como arXiv 2603.27365. Por tanto, no hay datos disponibles sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica de este repositorio esta en el formato de almacenamiento y en el runner, no en el modelo. Cada tensor se guarda en el layout exacto que leen los kernels del runner de Rust, de modo que el fichero se mapea en memoria y se usa in situ. Los metadatos de safetensors registran el hash del checkpoint de origen, la receta de cuantizacion y un digest de cada tensor, comprobable con `--verify-model-file`. Ademas, el runner implementa decodificacion especulativa (`--speculate 4`, activada por defecto) que redacta tokens a partir de la salida ya generada: segun el autor nunca altera los tokens elegidos y acelera entre un 22 % y un 57 % en paginas repetitivas como tablas. La pantalla INT8 de la cabeza de vocabulario, con sus constantes de cota de error, se usa para elegir exactamente el mismo token greedy que la cabeza FP32.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de pagina, con salida de texto (`image-to-text`).
- Procesamiento de documentos de varias paginas; el benchmark citado usa una pagina de 6.544 tokens de imagen y 1.140 tokens de salida.
- Manejo de escritura manuscrita y de escaneos degradados, segun la evaluacion con juez LLM ciego descrita en la model card (con la salvedad de las paginas afectadas por bucles de repeticion).
- Seleccion greedy determinista: la pantalla INT8 de la cabeza de vocabulario garantiza el mismo token que la cabeza FP32 en modo greedy.
- Ejecucion en CPU sin GPU, en x86-64 con AVX2 o AVX-512, en aarch64 con NEON, y con fallback escalar.
- Decodificacion especulativa integrada para acelerar paginas repetitivas.
- Verificacion de integridad del fichero de pesos mediante digest por tensor.
- No se documenta soporte de tool calling, function calling, agentes, vision general (mas alla de OCR) ni modo de razonamiento.

## Casos de uso

- Digitalizacion de archivos historicos en servidores sin GPU: el modo near-exact mantiene una divergencia media de 9e-8 KL por token frente a FP32 y cabe en 806 MB, por lo que se puede procesar grandes lotes de escaneos en un servidor convencional.
- OCR embebido en un producto de escritorio: el runner es un binario Rust con memoria mapeada y unos 10 ms de carga, lo que permite invocarlo por documento sin penalizacion de arranque perceptible.
- Procesamiento de documentos con tablas: la decodificacion especulativa es entre un 22 % y un 57 % mas rapida en paginas repetitivas, que es justo el perfil de las tablas y los formularios densos.
- Pipelines de alta tolerancia a error con restriccion de latencia: el modo fast reduce el tiempo de 38 s a 14 s en el benchmark de 6.544 tokens de imagen y 1.140 tokens de salida sobre un Ryzen 9 7950X, con una tasa de error global neutra frente a ground truth en el conjunto de 200 paginas reservado.
- Extraccion de texto en entornos air-gapped: al ser un fichero local con digest verificable, encaja en despliegues sin acceso a red donde se exige comprobar la integridad del binario de pesos antes de usarlo.
- Reconocimiento de manuscrito con revision humana: el juez LLM ciego puntuo su contenido en manuscritos y escaneos degradados a la par que FP32 y que el modelo BF16 de GPU de produccion, salvo en las paginas que caen en bucles de repeticion, mitigables con `--stop-repetition`.
- Procesamiento por lotes en ARM: gracias al soporte de NEON y al fallback escalar, se puede desplegar en servidores aarch64 sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si publica metricas de fidelidad frente a FP32 y de velocidad, que se reproducen a continuacion.

Fidelidad medida en teacher-forcing sobre 55 paginas de calibracion (24.262 tokens):

| Modo | KL media por token vs FP32 | Tokens con eleccion greedy distinta |
|---|---:|---:|
| exact (checkpoint FP32 original, no incluido en el repo) | 0 (FP32 bit a bit) | 0 |
| near-exact | 9e-8 | 1 |
| fast | 2,8e-4 | 64 |

Velocidad medida en la pagina de benchmark de la revista (6.544 tokens de imagen, 1.140 tokens de salida) sobre Ryzen 9 7950X de 16 nucleos con DDR5 y Windows 11, con flags por defecto:

| Modo | Tiempo |
|---|---:|
| exact (FP32) | ~38 s |
| near-exact | ~21,5 s |
| fast | ~14 s |

## Requisitos de hardware

- No requiere GPU: el runner esta disenado explicitamente para CPU. El modelo base se distribuye en formatos no compatibles con `transformers`, por lo que no aplican las estimaciones habituales de VRAM.
- Memoria principal: los ficheros ocupan 806 MB (near-exact) y 638 MB (fast), y se mapean en memoria, por lo que el consumo de RAM parte de esas cifras mas la cache KV y los buffers de trabajo.
- CPU objetivo: x86-64 con AVX2 o AVX-512; aarch64 con NEON; existe fallback escalar.
- Hardware de referencia medido: AMD Ryzen 9 7950X, 16 nucleos, DDR5, Windows 11. No se publican mediciones en otras CPU.
- Aceleraciones documentadas: decodificacion especulativa con `--speculate 4` (activa por defecto, 22-57 % mas rapida en paginas repetitivas) y `--max-dimension 1280` (aproximadamente un 20 % mas rapida, con precision sin cambios en 64 paginas de calibracion, aunque no validada en el conjunto reservado).
- Despliegue: binario Rust `target/release/falcon-ocr` del repositorio GitHub del autor, compilado con `cargo build --release --locked`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: de 14 s a 38 s por pagina de 6.544 tokens de imagen en el hardware de referencia, segun el modo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar variantes del mismo modelo base, ya que no se aportan datos de otros sistemas OCR.

| Variante | Cuantizacion | Tamano | KL media vs FP32 | Tiempo por pagina de referencia | Licencia |
|---|---|---:|---:|---:|---|
| FP32 original (tiiuae/Falcon-OCR) | FP32 | no disponible | 0 | ~38 s | Apache 2.0 |
| near-exact (este repo) | int16, 1 escala/64 pesos | 806 MB | 9e-8 | ~21,5 s | Apache 2.0 |
| fast (este repo) | int8 GPTQ act-order, grupos de 64 | 638 MB | 2,8e-4 | ~14 s | Apache 2.0 |
| Modelo BF16 de GPU de produccion | BF16 | no disponible | no disponible | no disponible (GPU) | Apache 2.0 (presumiblemente) |

No hay datos en la informacion proporcionada sobre modelos OCR alternativos de otros proveedores, por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- No son checkpoints de `transformers`. Los ficheros usan un layout propio del runner de Rust del autor; intentar cargarlos con `AutoModel` o herramientas equivalentes no funcionara.
- Dependencia de un runner de terceros: la rama indicada es `phase4-attempt3`, sin publicacion oficial de TII ni garantia de mantenimiento.
- No es una release oficial: el repositorio lo mantiene el usuario amazingvince y no esta respaldado por el Technology Innovation Institute.
- Bucles de repeticion: la model card reconoce que algunas paginas se pierden por bucles repetitivos, paliados con `--stop-repetition`. Es la principal causa de degradacion cualitativa frente a FP32.
- Divergencia de decodificacion en modo fast: 64 tokens con eleccion greedy distinta sobre 24.262 tokens de calibracion. En aplicaciones donde un unico caracter critico importa (importes, numeros de serie), el modo near-exact es mas apropiado.
- Rendimiento no validado mas alla del hardware de referencia: todas las mediciones de velocidad corresponden a un Ryzen 9 7950X con DDR5 en Windows 11.
- `--max-dimension 1280` no esta validado en el conjunto de paginas reservado; el propio autor lo indica.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue.
- Sesgos: no disponible. No hay evaluacion de sesgos en la informacion proporcionada.
- Riesgo de alucinacion: inherente a un modelo generativo de imagen a texto; no hay tasas de alucinacion publicadas, solo la comparacion de tasa de error contra ground truth en 200 paginas.
- Adopcion nula verificable: 0 descargas y 0 likes en HuggingFace, sin validacion independiente por parte de la comunidad.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre citando la obra original y manteniendo el aviso de licencia. Al ser una reencodacion de pesos de TII, conviene revisar los terminos del modelo base por si anaden condiciones adicionales.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado y han sido descartados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amazingvince/falcon-ocr-v1.5-cpu
- Modelo base: https://huggingface.co/tiiuae/Falcon-OCR
- Runner de CPU en Rust: https://github.com/amazingvince/falcon-ocr-cpu
- Detalles de evaluacion (RESULTS-V3.md, secciones 6 y 8): https://github.com/amazingvince/falcon-ocr-cpu/blob/phase4-attempt3/attempt3/RESULTS-V3.md
- Informe tecnico de Falcon OCR: https://arxiv.org/pdf/2603.27365
- No se han encontrado otros enlaces relevantes en la busqueda web.
