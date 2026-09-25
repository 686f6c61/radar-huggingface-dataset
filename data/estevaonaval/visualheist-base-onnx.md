# EstevaoNaval/visualheist-base-onnx

## Resumen

VisualHeist base ONNX es un paquete de inferencia en formato ONNX Runtime derivado del modelo VisualHeist-base, desarrollado por EstevaoNaval (Estevão Vitor Gregorio Naval). Se trata de una exportación lista para producción de un modelo de detección de objetos sobre imágenes (etiqueta especial `<OD>`), orientada a la extracción de información estructurada a partir de recortes de documentos, presumiblemente tablas y contenido químico, ya que el runtime de referencia se integra con la librería `chemtables.visualheist` y con el repositorio `molmodcs/pdf2chemicals`.

El bundle no contiene los pesos originales en safetensors, sino tres grafos ONNX en fp16 (`encoder_fp16.onnx`, `decoder_init_fp16.onnx` y `decoder_step_fp16.onnx`), junto con un tokenizer BART en JSON y un fichero de preprocesado que fija la entrada de imagen a 768×768 con media y desviación estándar concretas. Esto revela una arquitectura de tipo encoder-decoder: un encoder que procesa visión y lenguaje una sola vez por página y un decoder autorregresivo con caché KV que genera tokens paso a paso mediante búsqueda por haz implementada en Python, no dentro del grafo ONNX.

El modelo base asociado, `EstevaoNaval/visualheist-base`, está etiquetado en HuggingFace como Image-Text-to-Text con aproximadamente 0,3B de parámetros, aunque no se detallan ni la licencia ni los idiomas ni la longitud de contexto. La relevancia de esta ficha radica en su carácter operativo: es un ejemplo de despliegue de un modelo de extracción documental en CPU pura mediante ONNX Runtime, sin necesidad de GPU, lo que facilita su integración en pipelines de procesado por lotes de PDFs científicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (encoder de vision y lenguaje mas decoder autorregresivo con cache KV), segun la descripcion de los grafos; nombre formal de arquitectura no disponible |
| Parametros totales | ~0,3B (heredados de visualheist-base, segun HuggingFace) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (los tres grafos se distribuyen en fp16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (fp16) con ficheros `.onnx` y `.data`; incluye `tokenizer.json` (BART) y `preprocessor_config.json` (imagen 768x768, media y std) |
| Tamano del repo | 0,7 GB |
| Entradas | Imagenes de 768x768 px, segun `preprocessor_config.json` |
| Runtime objetivo | ONNX Runtime con `CPUExecutionProvider` |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe explicitamente tres grafos: `encoder_fp16.onnx`, que procesa vision y lenguaje una vez por pagina; `decoder_init_fp16.onnx`, que genera el primer token del lote de beam search; y `decoder_step_fp16.onnx`, que ejecuta los pasos sucesivos del decoder apoyandose en cache KV. Esta separacion es habitual en exportaciones ONNX de modelos encoder-decoder que necesitan reutilizar el estado del encoder entre iteraciones del decoder y evitar recomputaciones. El tokenizer es BART, lo que sugiere una arquitectura de la familia BART adaptada a entrada visual, aunque no se confirma en la documentacion disponible.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste tipo RLHF, DPO o instruccion. El unico detalle tecnico adicional es el mecanismo de generacion: la busqueda por haz se ejecuta en Python dentro de `chemtables.visualheist`, es decir, queda fuera de los grafos ONNX. Los grafos se generan a partir de safetensors locales mediante el script `scripts/export_visualheist_onnx.py` del repositorio `molmodcs/pdf2chemicals`. No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa, atencion lineal ni capas SSM.

## Capacidades

- Extraccion de informacion estructurada de imagenes de documentos, segun la propia model card: se describe como modelo de deteccion de objetos (`<OD>`) aplicado a recortes de pagina.
- Generacion de secuencias de texto a partir de entradas de imagen y lenguaje, con decodificacion autorregresiva y busqueda por haz.
- Integracion con tokenizer BART para la conversion de identificadores generados a texto.
- Inferencia en CPU a traves de ONNX Runtime, sin requerir aceleracion por GPU en el flujo documentado.
- Uso en pipelines de procesado de PDFs cientificos a traves de `pdf2chemicals` y de la libreria `chemtables.visualheist`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card ni en los metadatos.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Extraccion de tablas quimicas en PDFs cientificos: el modelo recibe recortes de pagina de 768x768 px y genera la representacion textual u objetual asociada, lo que permite convertir tablas de reacciones en datos estructurados dentro de un pipeline de publicacion cientifica.
- Integracion en el flujo `pdf2chemicals`: el bundle se cachea automaticamente en `~/.cache/pdf2chemicals/models/visualheist-onnx` en el primer recorte de PDF, por lo que encaja como componente de extraccion dentro de herramientas de quimioinformatica ya existentes.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con `CPUExecutionProvider`, permite desplegar la extraccion en infraestructura estandar de CPU, reduciendo coste frente a alternativas que exigen GPU.
- Despliegue en entornos aislados o on-premise: al distribuirse como ficheros ONNX con tokenizer y preprocesado incluidos, puede instalarse en redes sin acceso a modelos remotos ni dependencia de servicios en la nube.
- Alimentacion de bases de datos y grafos de conocimiento: los resultados de extraccion pueden canalizarse hacia componentes como KGWizard o DataRaider, mencionados en el repositorio del autor, para poblar grafos de conocimiento y parametros de reaccion.
- Automatizacion de revision de literatura: el modelo puede procesar grandes volumenes de articulos en cola, extrayendo de forma uniforme los campos de interes y reduciendo la revision manual de tablas.
- Reproducibilidad de experimentos: la separacion de grafos y la configuracion de preprocesado exportada permiten fijar exactamente la version del modelo, la resolucion de imagen y el tokenizer usados en una extraccion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo completo pesa 0,7 GB y los pesos se distribuyen en fp16, por lo que el modelo ocupa del orden de 0,6 GB en memoria; el consumo real depende de la implementacion de beam search y del numero de haces, no especificado.
- GPU recomendadas: no se documentan; el runtime de referencia es CPU mediante `CPUExecutionProvider`. Cualquier GPU compatible con proveedores de ejecucion de ONNX Runtime seria util unicamente si se cambia el proveedor, algo no documentado.
- Compatibilidad con GPU de consumo: no se indica ninguna GPU concreta. Por tamano (0,3B de parametros) cabria en GPUs de consumo, pero no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime en CPU segun la model card. El uso de vLLM, llama.cpp, Ollama o TGI no esta documentado y no es directamente aplicable a un bundle ONNX de este tipo.
- Latencia y throughput estimados: no disponibles. La model card no aporta cifras de tiempo por pagina ni de imagenes procesadas por segundo.
- Almacenamiento en disco: 0,7 GB para el bundle; la cache se replica en `~/.cache/pdf2chemicals/models/visualheist-onnx`, configurable con `VISUALHEIST_ONNX_DIR` o `PDF2CHEMICALS_DATA_DIR`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VisualHeist base ONNX (este modelo) | ~0,3B | no disponible | ONNX fp16 | no disponible | HuggingFace, repo de 0,7 GB |
| VisualHeist-base | ~0,3B (Image-Text-to-Text) | no disponible | safetensors (no confirmado) | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que el uso comercial no puede asumirse como permitido sin consultar al autor.
- No se declaran idiomas soportados; se desconoce si el modelo funciona correctamente en castellano o en otros idiomas distintos del idioma de sus datos de entrenamiento.
- No se especifica la longitud de contexto del decoder, dato critico para estimar cuantas filas o entradas de tabla puede generar en una sola pasada.
- Al ser un modelo de extraccion y generacion, existe riesgo de alucinacion: puede producir valores, nombres o estructuras plausibles pero incorrectos si la imagen no es nitida o el formato es atipico.
- El repo registra 0 descargas y 0 likes, sin validacion externa conocida de la comunidad, lo que reduce la evidencia disponible sobre su calidad en produccion.
- La busqueda por haz se ejecuta en Python fuera de los grafos ONNX; esto implica que el rendimiento depende tanto de ONNX Runtime como del codigo envolvente y del numero de haces configurado.
- El runtime documentado es CPU (`CPUExecutionProvider`); no hay garantia de que el bundle funcione sin cambios con otros proveedores de ejecucion.
- No se documentan fases de ajuste con RLHF, DPO ni datos de instruccion, ni tampoco sesgos conocidos, por lo que no se pueden evaluar aspectos de alineacion o sesgo.
- Las fechas de creacion y actualizacion registradas (2026-09-25) figuran tal cual en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EstevaoNaval/visualheist-base-onnx
- Modelo base: https://huggingface.co/EstevaoNaval/visualheist-base
- Perfil del autor: https://huggingface.co/EstevaoNaval
- Repositorio GitHub VisualHeist: https://github.com/EstevaoNaval/VisualHeist
- Repositorio pdf2chemicals (script de exportacion ONNX): https://github.com/molmodcs/pdf2chemicals
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
