# johnlockejrr/ocs-mix-indra-ocr

## Resumen

`ocs-mix-indra-ocr` es un fine-tune del reconocedor de líneas de Datalab Indra OCR (`rec.onnx`), adaptado específicamente a escritura manuscrita en eslavo eclesiástico (*Church Slavonic*) y antiguo cirílico. Lo publica el usuario johnlockejrr sobre el modelo base `datalab-to/indra-ocr`, y su única modificación respecto al stack original es el cabezal reconocedor y su vocabulario; el detector de líneas, el orden de lectura y el resto de componentes ONNX se mantienen tal cual se distribuyen en Indra.

El problema que resuelve es concreto: los modelos OCR/HTR generalistas tienen un rendimiento muy bajo sobre manuscritos eslavos eclesiásticos. El propio autor documenta que Indra sin ajustar obtiene un CER de 0,821 y un WER de 1,038 sobre su conjunto de validación, con un 0,0 % de líneas exactas; tras el fine-tune, el CER baja a 0,0398, el WER a 0,233 y las líneas exactas suben al 46,8 %. El vocabulario se amplió en 101 caracteres respecto al vocabulario original, muy centrado en alfabeto latino.

Se distribuye como modelo ONNX (biblioteca `onnx`, pipeline `image-to-text`) con 0 descargas y 1 *like* en el momento de redactar esta ficha. Es una pieza de nicho orientada a investigación en estudios eslavos medievales y humanidades digitales, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Se trata del cabezal reconocedor (`rec.onnx`) del stack Indra OCR, ajustado con objetivos CTC sobre etiquetas normalizadas en NFD; el autor no detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. El reconocimiento es a nivel de linea, con geometria de cajas PAGE como entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eslavo eclesiastico (`cu`) y antiguo ruso (`orv`); alfabeto cirilico historico |
| Licencia | `openrail`. Los pesos base de Indra quedan bajo OpenRAIL-M modificada; el codigo de Indra y del tooling, Apache-2.0 donde aplique |
| Formato de pesos | ONNX (`rec.onnx`, mas el resto de ficheros ONNX del pipeline Indra) |

## Arquitectura y entrenamiento

El modelo es un fine-tune parcial: el autor congela el detector y demas componentes del pipeline Indra (`det.onnx`, orden de lectura) y solo adapta el reconocedor de lineas y su vocabulario. La receta se ejecuto con la herramienta `indra-ocr-ft`, fijando la base `rec.onnx` de Indra, usando geometria de cajas PAGE reales (`build-lines --geometry gt`), etiquetas Unicode en NFD (`--nfd-labels`) y una limpieza editorial (`--strip-editorial`) que elimina caracteres como `¬`, guiones suaves y marcas de anchura cero para que el CTC no aprenda a predecir tinta inexistente en la pagina.

El entrenamiento uso 272.617 lineas utilizables, con aumento de datos suave (`--aug mild`, sin *flip* horizontal), programacion de *learning rate* cosenoidal con `lr=3e-4`, precision mixta (AMP), tamano de lote 64 y paciencia de 15. El mejor punto se alcanzo en la epoca 181, con parada temprana tras la 196. La validacion se hizo sobre lineas con *ground truth* de los propios manuscritos.

Los datos de entrenamiento combinan dos corpus: `cu-Generic_Church_Slavonic_Handwriting` (curado por Achim Rabus en el marco del proyecto QuantiSlav, con un modelo Transkribus entrenado por Elena Renje) y `Macarius` (aportado por el profesor Vladimir Polomac, Universidad de Kragujevac). Las fuentes manuscritas incluyen el Codex Suprasliensis (siglos X-XI, recension eslava meridional), las Catequesis de Cirilo de Jerusalen (transmision del siglo XI, recension oriental), el *Symposion* de Metodio de Olimpia (transmision del siglo XVII) y los Velikie Minei Cetʹi (siglo XVI, con partes de los volumenes de marzo y mayo y un Apostolos del volumen de junio). Los estilos son uncial y semi-uncial, mayoritariamente eslavo oriental con material eslavo meridional.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) a nivel de linea sobre manuscritos en eslavo eclesiastico y antiguo cirilico.
- OCR sobre imagenes de pagina completa dentro del pipeline ONNX de Indra, siempre que la deteccion de lineas y el orden de lectura funcionen correctamente.
- Manejo de vocabulario cirilico ampliado: 101 caracteres adicionales respecto al vocabulario original de Indra, muy orientado a latin.
- Procesamiento de etiquetas en Unicode NFD y limpieza de caracteres editoriales, lo que facilita la normalizacion posterior en corpus digitales.
- Integracion directa como directorio de modelo Indra (`INDRA_OCR_MODEL_DIR` o `--model-dir`), sin necesidad de reescribir el pipeline.
- Compatibilidad con el flujo de `indra-ocr-ft` para inferencia sobre cajas GT (`infer-gt`) y visualizacion (`viewer`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision general ni audio: es exclusivamente un reconocedor de lineas.
- Capacidades multilingues limitadas a las dos variedades declaradas; no hay indicacion de soporte para latin, griego ni cirilico moderno.

## Casos de uso

- Digitalizacion de fondos manuscritos eslavos eclesiasticos: el modelo convierte imagenes de pagina en transcripciones a nivel de linea dentro del pipeline Indra, con un CER de 0,0398 sobre el conjunto de validacion, adecuado para generar borradores que despues revisa un paleografo.
- Busqueda a texto completo en corpus medievales: al producir texto plano y estructurado en JSON, permite indexar colecciones de manuscritos que hasta ahora solo eran consultables por imagen, habilitando busquedas por lema o por forma grafica.
- Edicion critica y filologia eslava: las transcripciones lineales con vocabulario ampliado y etiquetas NFD facilitan el alineamiento entre testimonios y la comparacion de variantes entre recensiones.
- Generacion de *ground truth* para entrenar otros modelos: las 272.617 lineas de entrenamiento y la salida del modelo ajustado pueden usarse como preanotacion para reducir el coste de anotacion manual en nuevos manuscritos.
- Preservacion digital en bibliotecas y archivos: el modelo corre como ONNX dentro de un stack ya empaquetado, lo que simplifica su despliegue en infraestructuras institucionales que ya usan Indra.
- Investigacion diacronica sobre grafias: la normalizacion NFD y el tratamiento de caracteres editoriales permiten estudiar variacion ortografica entre el siglo X y el XVII sin ruido de codificacion.
- Flujos de anotacion asistida en Transkribus o herramientas similares: la salida puede importarse como capa preanotada para que el investigador corrija linea a linea, aprovechando el 46,8 % de lineas exactas.

## Benchmarks y rendimiento

El autor publica resultados de validacion (*holdout*) comparando el modelo base sin ajustar y el fine-tune final. Son las unicas cifras disponibles; no hay MMLU, HumanEval, GSM8K ni benchmarks estandar, porque no aplican a una tarea de HTR.

| Etapa | CER | WER | Lineas exactas |
|---|---:|---:|---:|
| Zero-shot (Indra sin ajustar) | 0,821 | 1,038 | 0,0 % |
| Mejor fine-tune (`ocs-mix-clean`, epoca 181) | 0,0398 | 0,233 | 46,8 % |

Notas sobre la medicion: el CER se calcula sobre etiquetas normalizadas en NFD, con el caracter editorial `¬` eliminado para que el CTC no se entrene a predecir tinta que no esta en la pagina. La parada temprana se aplico tras la epoca 196. No se han publicado resultados adicionales ni comparaciones con otros modelos HTR sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica tamano de parametros ni requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo esta pensado para ejecutarse con el paquete `indra-ocr` (`pip install indra-ocr`) o con la herramienta `indra-ocr-ft` (`uv run indra-ocr-ft viewer --model-dir ...`), ambos sobre runtime ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Ambito | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `johnlockejrr/ocs-mix-indra-ocr` | Fine-tune de reconocedor Indra (ONNX, CTC) | Eslavo eclesiastico manuscrito (`cu`, `orv`) | A nivel de linea | OpenRAIL (base OpenRAIL-M modificada) | ONNX en HuggingFace, 0 descargas |
| `datalab-to/indra-ocr` | Modelo base OCR/HTR | Generalista, vocabulario centrado en latin | Pipeline completo de pagina | OpenRAIL-M modificada | ONNX, modelo de referencia |
| `achimrabus/crnn-ctc-church-slavonic` | CRNN-CTC | Eslavo eclesiastico manuscrito | A nivel de linea | no disponible en la informacion proporcionada | HuggingFace |

La comparacion de rendimiento frente a `achimrabus/crnn-ctc-church-slavonic` no es posible con los datos disponibles: la informacion proporcionada no incluye sus metricas de CER/WER sobre el mismo conjunto. El unico punto de comparacion cuantitativo publicado es el salto frente al Indra sin ajustar, recogido en la seccion de benchmarks.

## Limitaciones y advertencias

- Solo se ha ajustado el reconocedor. El detector de lineas y el orden de lectura siguen siendo los de Indra general, de modo que la calidad a nivel de pagina completa depende de esos componentes y puede degradarse en maquetaciones complejas.
- El dominio es estrictamente el eslavo eclesiastico manuscrito representado en los conjuntos PAGE usados. Otras recensiones, texto impreso o cirilico moderno pueden degradar el rendimiento sin aviso.
- No hay datos publicados sobre sesgos, pero al tratarse de un modelo de transcripcion los errores sistematicos se traduciran en sesgos de representacion sobre determinadas manos, scriptoria o periodos menos representados en el corpus.
- Riesgo de alucinacion: en HTR, el CTC puede generar caracteres plausibles donde la tinta es ambigua o ilegible. La tasa de lineas exactas del 46,8 % implica que mas de la mitad de las lineas requieren revision humana.
- Limitacion de contexto e idioma: el modelo no maneja contexto largo ni conversacion; trabaja linea a linea y solo en las dos variedades declaradas.
- Restricciones de licencia: los pesos base estan bajo OpenRAIL-M modificada, lo que impone condiciones de uso. Hay que revisar el fichero `LICENSE` incluido en el repositorio antes de cualquier uso comercial y respetar los terminos de los conjuntos QuantiSlav/Transkribus al redistribuir derivados.
- El repositorio aparece con 0.0 GB de tamano y 0 descargas, lo que sugiere que los pesos pueden no estar completamente subidos o que la adopcion es practicamente nula. Conviene verificar antes de integrarlo en produccion.
- No hay informacion sobre cuantizacion, por lo que no se puede estimar el coste de despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnlockejrr/ocs-mix-indra-ocr
- Modelo base Indra OCR: https://huggingface.co/datalab-to/indra-ocr
- Herramienta de fine-tune `indra-ocr-ft`: https://github.com/johnlockejrr/indra-ocr-ft
- Baseline CRNN-CTC en la misma tradicion: https://huggingface.co/achimrabus/crnn-ctc-church-slavonic
- Herramienta Polyscriptor (Rabus): https://github.com/achimrabus/polyscriptor
- Datalab: https://www.datalab.to

Citacion solicitada por el autor:

```bibtex
@misc{rabus2026polyscriptor,
  title  = {Polyscriptor: Multi-Engine HTR Training \& Comparison Tool},
  author = {Rabus, Achim},
  year   = {2026},
  url    = {https://github.com/achimrabus/polyscriptor}
}
```
