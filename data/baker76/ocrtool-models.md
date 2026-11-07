# baker76/ocrtool-models

## Resumen

`baker76/ocrtool-models` no es un modelo entrenado, sino un repositorio de distribucion que empaqueta en formato ONNX cuatro modelos independientes utilizados por `ocrtool`, una herramienta de linea de comandos escrita en C++ que convierte PDF a Markdown, traduce PDF, identifica tipografias en imagenes y detecta campos en formularios PDF. El autor, Ben Baker (baker76), declara explicitamente que no ha entrenado ni ajustado ningun peso: cada carpeta es una conversion de formato de los pesos originales o una copia sin modificar, y conserva la licencia del autor original.

El componente principal es `DeepSeek-OCR-2`, un modelo vision-lenguaje de DeepSeek orientado a OCR y conversion de documentos a Markdown, exportado en tres precisiones (INT4, FP16 y FP32). Le acompanan `Helsinki-NLP/opus-mt-es-en` para traduccion espanol-ingles, `storia/font-classify-onnx` (EfficientNet-B3) para clasificacion de tipografias y `jbarrow/FFDetr` (RF-DETR Medium) para deteccion de campos de formulario. El repositorio ocupa 24 GB en total.

Su relevancia es practica: permite ejecutar un pipeline completo de digitalizacion documental sobre ONNX Runtime sin dependencias de Python, lo que facilita el despliegue en entornos C++ y en produccion con requisitos estrictos de dependencias. La exportacion FP32 reproduce la salida del modelo PyTorch token a token en la pagina de prueba documentada, y la variante INT4 reduce el peso del decodificador a 4 bits con diferencias menores de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio multi-modelo: DeepSeek-OCR-2 (vision-lenguaje con decoder de 12 capas y routing MoE), OPUS-MT (transformer encoder-decoder), EfficientNet-B3 (clasificador de imagenes), RF-DETR Medium (detector de objetos) |
| Parametros totales | no disponible (no se publican recuentos por componente) |
| Parametros activos | no disponible (DeepSeek-OCR-2 evalua el routing MoE de forma densa, enmascarado al top 6) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (pesos del decoder) + INT8 (encoder de vision) via `MatMulNBits`; FP16; FP32 |
| Idiomas soportados | no disponible como listado; OPUS-MT cubre espanol-ingles; DeepSeek-OCR-2 no declara idiomas en la informacion disponible |
| Licencia | Apache-2.0 (DeepSeek-OCR-2, OPUS-MT, FFDetr); MIT (font-classify) |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`), con `tokenizer.json`, `config.json`, `source.spm`, `target.spm`, `vocab.json`, `model_config.yaml`, `fonts_mapping.yaml` |

Desglose por carpeta:

| Carpeta | Tamano | Uso | Pesos originales | Licencia |
|---|---|---|---|---|
| `deepseek-ocr2-int4/` | 2.9 GB | PDF a Markdown, CPU o GPU | deepseek-ai/DeepSeek-OCR-2 | Apache-2.0 |
| `deepseek-ocr2-fp16/` | 6.6 GB | PDF a Markdown, GPU, el mas rapido | deepseek-ai/DeepSeek-OCR-2 | Apache-2.0 |
| `deepseek-ocr2-fp32/` | 13 GB | Precision completa; fuente para cuantizar | deepseek-ai/DeepSeek-OCR-2 | Apache-2.0 |
| `opus-mt-es-en/` | 0.6 GB | Traduccion espanol-ingles | Helsinki-NLP/opus-mt-es-en | Apache-2.0 |
| `ffdetr/` | 125 MB | Deteccion de campos de formulario | jbarrow/FFDetr | Apache-2.0 |
| `font-classify/` | 64 MB | Identificacion de tipografia | storia/font-classify-onnx | MIT |

## Arquitectura y entrenamiento

El autor no entrena ni ajusta ningun modelo; todo el trabajo es de conversion de formato y empaquetado. En `DeepSeek-OCR-2`, la exportacion se divide en cuatro grafos: `vision_sam_1024.onnx` y `vision_sam_768.onnx` (etapa SAM para la vista de pagina completa y para los mosaicos), `vision_encoder.onnx` (encoder basado en Qwen2 mas proyector) y `decoder.onnx`, que integra el embedding de tokens, la fusion de caracteristicas de imagen, un decoder de 12 capas con cache de clave/valor y la cabeza de salida. El routing del mixture-of-experts se evalua de forma densa (todos los expertos, enmascarados al top 6), lo que segun el autor produce el mismo resultado que el routing disperso original.

En `OPUS-MT` se exportan `encoder.onnx` y `decoder.onnx` sin cache, de modo que el decoder se reejecuta en cada paso; los logits coinciden con PyTorch dentro de 1e-5. El clasificador de tipografias es una copia sin modificar de `storia/font-classify-onnx` en la revision `86a4e77`: un EfficientNet-B3 ajustado por Storia sobre imagenes sinteticas de aproximadamente 3.470 Google Fonts, con entrada de 320 x 320. El detector de formularios es FFDetr, el detector RF-DETR Medium entrenado por Joe Barrow sobre el dataset CommonForms y exportado con RF-DETR 1.12 a su resolucion de entrenamiento de 1024 x 1024; devuelve 300 cajas (`dets`, centro y tamano como fracciones de la pagina) y sus logits de clase (`labels`), de los cuales solo los tres primeros estan entrenados: caja de texto, boton de eleccion y firma. Los scripts de exportacion estan en el repositorio de ocrtool bajo `tools/export/`.

## Capacidades

- Conversion de PDF a Markdown mediante DeepSeek-OCR-2, con deteccion de layout a nivel de pagina completa y de mosaicos.
- Salida con coordenadas de bounding box ademas del texto, segun la comparacion de exportaciones descrita por el autor.
- Traduccion espanol-ingles de documentos PDF conservando el formato, mediante OPUS-MT.
- Identificacion de tipografias en imagenes: clasificacion entre aproximadamente 3.470 familias de Google Fonts, con mapeo a nombre de familia y variante.
- Deteccion de campos de formulario PDF: cajas de texto, botones de eleccion y firmas, hasta 300 detecciones por pagina con umbral de puntuacion por defecto de 0.4.
- Generacion de PDF rellenable a partir de un PDF plano (`ocrtool form detect flat.pdf -o fillable.pdf`).
- Ejecucion sobre ONNX Runtime sin Python, integrable en herramientas C++.
- Seleccion de precision segun hardware: INT4 para CPU o GPU con menor huella, FP16 para GPU con mayor velocidad, FP32 para maxima fidelidad y como fuente de cuantizacion.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de archivos PDF a Markdown en pipelines C++: `ocrtool convert in.pdf -o out.md --model models/deepseek-ocr2-int4` produce Markdown directamente desde el PDF, sin pasar por Python, lo que encaja en backends documentales con dependencias minimas.
- Traduccion de documentacion espanola a ingles manteniendo el formato del PDF: `ocrtool translate in.pdf -o out.pdf --model models/opus-mt-es-en` reescribe el documento en el idioma destino, util para editoriales o departamentos de documentacion bilingue.
- Extraccion estructurada de formularios administrativos: el detector FFDetr localiza cajas de texto, botones y firmas (validado sobre la pagina 1 del IRS W-9, donde encuentra los mismos 25 campos que el modelo PyTorch), lo que permite generar versiones rellenables de impresos escaneados.
- Auditoria de identidad visual de marca: `ocrtool fonts scan.png -o fonts.json --model models/font-classify` identifica la tipografia de una captura o creatividad, util para equipos de diseno que verifican el cumplimiento de guias de marca.
- Procesamiento OCR en servidores sin GPU: la variante INT4 (2.9 GB) esta pensada para CPU o GPU y es la descarga recomendada, adecuada para lotes nocturnos de conversion donde el throughput no es critico.
- Conversion de alta velocidad en GPU para volumen alto: la variante FP16 alcanza aproximadamente 80 tokens por segundo en una RTX 4090 frente a unos 50 de la INT4, por lo que es la opcion para ingesta masiva con hardware dedicado.
- Construccion de un pipeline documental completo encadenando los cuatro modelos: OCR a Markdown, deteccion de campos, identificacion de tipografias y traduccion, todo sobre el mismo runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son comparaciones de fidelidad y velocidad de las exportaciones:

| Medicion | Resultado |
|---|---|
| Fidelidad FP32 frente a PyTorch | Salida identica token a token en una pagina de prueba |
| Fidelidad FP16 frente a PyTorch | Mismo texto; dos coordenadas de bounding box difieren en 1 |
| Fidelidad INT4 frente a FP16 | Texto coincidente en cuatro paginas de prueba, salvo algunas diferencias de formato |
| Velocidad FP16 en RTX 4090 | Aproximadamente 80 tokens por segundo |
| Velocidad INT4 en RTX 4090 | Aproximadamente 50 tokens por segundo |
| Fidelidad OPUS-MT frente a PyTorch | Logits con diferencia maxima de 1e-5 |
| Fidelidad FFDetr frente a PyTorch | Mismos 25 campos detectados en la pagina 1 del IRS W-9 |

## Requisitos de hardware

- VRAM estimada para DeepSeek-OCR-2: aproximadamente 2.9 GB de pesos en INT4, 6.6 GB en FP16 y 13 GB en FP32, sin contar activaciones ni cache de clave/valor.
- GPU recomendadas: RTX 4090 para FP16 (aproximadamente 80 tokens por segundo medidos por el autor); para FP32 se requiere una GPU con al menos 16 GB de VRAM utilizable.
- Cabe en GPU de consumo: la variante INT4 esta pensada para CPU o GPU y la FP16 cabe en una RTX 4090; no se detallan requisitos para GPUs de gama inferior.
- Los modelos auxiliares son ligeros: OPUS-MT ocupa 0.6 GB, FFDetr 125 MB y el clasificador de tipografias 64 MB, por lo que pueden ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime a traves de la CLI `ocrtool`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Descarga: cada carpeta es autocontenida y debe descargarse completa conservando los nombres de fichero, ya que un `.onnx` carga sus pesos del `.onnx.data` contiguo. Ejemplo: `hf download baker76/ocrtool-models --include "deepseek-ocr2-int4/*" --local-dir models`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas. La comparacion se limita a los propios componentes del repositorio y a su empaquetado:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-OCR-2 (este repo) | no disponible | no disponible | Apache-2.0 | ONNX (INT4, FP16, FP32) | Hugging Face, 0 descargas |
| Helsinki-NLP/opus-mt-es-en (este repo) | no disponible | no disponible | Apache-2.0 | ONNX | Hugging Face |
| storia/font-classify-onnx (este repo) | EfficientNet-B3 | no aplica | MIT | ONNX | Hugging Face |
| jbarrow/FFDetr (este repo) | RF-DETR Medium | no aplica | Apache-2.0 | ONNX | Hugging Face |

No disponible la comparacion con modelos OCR alternativos (por ejemplo, otros exportadores de DeepSeek-OCR-2 o soluciones propietarias) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene modelos propios: cualquier limitacion de los pesos originales (sesgos, alucinacion, cobertura idiomatica) se hereda sin cambios.
- Riesgo de alucinacion inherente a DeepSeek-OCR-2 en la transcripcion de documentos; no se documentan evaluaciones de fidelidad mas alla de las paginas de prueba citadas.
- La exportacion INT4 puede introducir diferencias de formato en el texto respecto a FP16, segun las pruebas del autor en cuatro paginas.
- La variante INT4 es mas lenta que FP16 en GPU (aproximadamente 50 frente a 80 tokens por segundo en una RTX 4090); su ventaja es la huella de memoria y la ejecucion en CPU.
- El decoder de OPUS-MT se exporta sin cache y se reejecuta en cada paso, lo que penaliza la latencia en secuencias largas.
- FFDetr solo tiene entrenadas tres clases (caja de texto, boton de eleccion, firma); el resto de logits no son clases validas. El umbral por defecto de 0.4 puede requerir ajuste segun el tipo de formulario.
- El clasificador de tipografias se entreno sobre imagenes sinteticas de aproximadamente 3.470 Google Fonts; su comportamiento fuera de ese catalogo no esta documentado.
- Licencias mixtas: Apache-2.0 en DeepSeek-OCR-2, OPUS-MT y FFDetr, y MIT en font-classify. El uso comercial exige respetar la licencia de cada carpeta por separado; no se documentan restricciones adicionales del autor del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de fallos.
- El autor no publica recuentos de parametros, longitud de contexto ni lista de idiomas soportados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baker76/ocrtool-models
- Perfil del autor: https://huggingface.co/baker76/models
- Modelo original DeepSeek-OCR-2: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Modelo original OPUS-MT es-en: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Clasificador de tipografias original: https://huggingface.co/storia/font-classify-onnx
- Repositorio de entrenamiento de font-classify: https://github.com/Storia-AI/font-classify
- Detector de formularios FFDetr: https://huggingface.co/jbarrow/FFDetr
- Dataset CommonForms: https://huggingface.co/datasets/jbarrow/CommonForms
- Ficha en free2aitools: https://free2aitools.com/model/baker76/ocrtool-models
