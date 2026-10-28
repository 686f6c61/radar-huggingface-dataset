# Iceblue2026/pp-ocrv6-onnx

## Resumen

`Iceblue2026/pp-ocrv6-onnx` es un repositorio de pesos en formato ONNX derivados del modelo abierto PP-OCRv6 de PaddlePaddle, publicados por el usuario Iceblue2026 para su integración en el producto comercial Spire.OCR. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos de OCR (detección de texto, reconocimiento y, opcionalmente, clasificación de orientación) empaquetados junto con un fichero de configuración `ocr.xml` que indica rutas de modelos, librerías dependientes y el paquete de idioma activo.

El repositorio ocupa 0,2 GB y no incluye model card técnica en el sentido habitual: el README es en realidad la documentación del fichero de configuración de Spire.OCR, con instrucciones sobre las plataformas `lite` (sin `libPath` ni `lang` configurables, 50 idiomas) y `tiny` (49 idiomas, sin japonés), y sobre la plataforma completa, que permite paquetes de idioma adicionales mediante el campo `lang`.

Su relevancia es práctica: permite ejecutar OCR de PP-OCRv6 sobre ONNX Runtime sin arrastrar la cadena de dependencias de PaddlePaddle (más de 2 GB según repositorios de terceros), lo que facilita el despliegue en entornos ligeros, contenedores pequeños y dispositivos de borde. La información disponible no detalla la arquitectura interna ni los datos de entrenamiento de los modelos concretos incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para este repositorio. Los pesos proceden de PP-OCRv6 (PaddlePaddle), familia de modelos de deteccion y reconocimiento de texto; no se detalla la topologia interna |
| Parametros totales | No disponible. La coleccion oficial PP-OCRv6 de PaddlePaddle declara modelos de 1,5 M a 34,5 M de parametros; no se especifica que variante contiene este repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo OCR, no generativo) |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos ONNX; no se documentan variantes INT8/FP16 |
| Idiomas soportados | Plataforma `lite`: 50 idiomas (4 nucleo: chino simplificado, chino tradicional, ingles, japones; 46 latinos, entre ellos espanol, frances, aleman, italiano, portugues, catalan, gallego y euskera). Plataforma `tiny`: 49 (sin japones). Plataforma completa: paquetes `ch`, `english`, `korean`, `latin` y modelos personalizados |
| Licencia | No disponible |
| Formato de pesos | ONNX, con fichero de configuracion `ocr.xml` |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de los modelos incluidos. Por el contexto (conversion de PP-OCRv6 a ONNX para Spire.OCR) se trata de una canalizacion OCR clasica: un modelo de deteccion de cajas de texto, un modelo de reconocimiento y un modelo opcional de clasificacion de orientacion, este ultimo desactivado por defecto en la configuracion de ejemplo (`<useClsModel>0</useClsModel>`). El campo `lang` selecciona el paquete de reconocimiento, lo que implica un modelo de reconocimiento por familia de idiomas (o un modelo compartido con cabecera de vocabulario por idioma); no se especifica cual de las dos opciones aplica.

Tampoco se detallan datos de entrenamiento: numero de tokens o imagenes, composicion del dataset, ni si hubo etapas de ajuste fino. La unica informacion tecnica verificable es la relativa al empaquetado y a la logica de compatibilidad de paquetes de idioma: los nombres antiguos (`Chinese`, `Chinesetraditional`, `Japan`, `French`, `German`) se remapean automaticamente a `ch` o `latin` si las carpetas correspondientes no existen. No se documenta ninguna innovacion de decodificacion ni tecnica de inferencia especifica mas alla del propio runtime ONNX.

## Capacidades

- Deteccion de regiones de texto en imagenes (modelo de deteccion incluido en el paquete).
- Reconocimiento de texto impreso en 50 idiomas en la plataforma `lite` y 49 en `tiny`.
- Reconocimiento mixto chino-ingles-japones con el paquete `ch`, incluyendo pinyin y chino tradicional.
- Reconocimiento multilingue latino con el paquete `latin` (ingles, frances, aleman, latin y resto de la familia).
- Soporte de paquetes de idioma adicionales en la plataforma completa mediante el campo `lang` (`english`, `korean`, `latin` y carpetas personalizadas).
- Soporte de modelos de reconocimiento personalizados: basta crear una carpeta bajo `modelPath` y referenciarla en `lang`.
- Clasificacion de orientacion de texto disponible como modelo opcional (`useClsModel`), desactivada por defecto.
- Ejecucion sobre ONNX Runtime, sin dependencia de PaddlePaddle en tiempo de inferencia.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente ni modo thinking. Es exclusivamente un modelo OCR.

## Casos de uso

- Digitalizacion masiva de archivo documental: el modelo de deteccion localiza lineas y el de reconocimiento las transcribe, lo que permite indexar PDF escaneados y alimentar motores de busqueda interna; el paquete `latin` cubre documentacion en espanol, frances, aleman e italiano en un unico pase.
- Extraccion de datos de facturas y albaranes: integrado en un pipeline previo a reglas o a un LLM extractor, el OCR convierte la imagen en texto con coordenadas, de modo que el paso posterior trabaja sobre texto y no sobre pixeles.
- Lectura de documentos de identidad y formularios: con el modelo de clasificacion de orientacion activado (`useClsModel` a 1) se normalizan capturas giradas antes del reconocimiento, algo habitual en escaneos de movil.
- Despliegue en contenedores ligeros y entornos sin GPU: al ser ONNX y ocupar el repositorio 0,2 GB, el paquete cabe en imagenes pequenas y se ejecuta sobre CPU con ONNX Runtime, sin instalar la cadena de PaddlePaddle.
- Procesamiento en dispositivo de borde o movil: la plataforma `lite` esta pensada para configuraciones minimas, sin rutas de librerias ni seleccion de idioma, lo que simplifica el empaquetado en aplicaciones de captura.
- Digitalizacion de patrimonio multilingue: con la plataforma completa y carpetas de idioma personalizadas se pueden cubrir idiomas fuera de la lista `lite` (coreano mediante `korean`, y otros mediante modelos propios).
- Preprocesado para sistemas RAG sobre documentos fisicos: el texto reconocido se trocea e indexa, de forma que el OCR actua como primera etapa del pipeline de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio.

| Dato | Valor | Fuente |
|---|---|---|
| Aceleracion frente a inferencia nativa de PaddlePaddle | Aproximadamente 3x, misma salida que PaddleX sobre ONNX Runtime | Repositorio de terceros `AIwork4me/ppocrv6_onnx`; no verificado para este repositorio |
| Precision frente a modelos VLM de escala billon | La coleccion oficial PP-OCRv6 afirma superarlos en tareas OCR | Coleccion `PaddlePaddle/pp-ocrv6`; sin cifras concretas en la informacion disponible |
| MMLU, HumanEval, GSM8K y similares | No aplica (modelo OCR, no generativo) | - |

Las dos filas anteriores son afirmaciones de terceros, no mediciones reproducidas sobre estos pesos. El repositorio no incluye scripts de evaluacion ni conjuntos de validacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El repositorio completo ocupa 0,2 GB, por lo que el conjunto de pesos cargados en memoria queda holgadamente por debajo de ese umbral; no se dispone de medicion real por variante.
- GPU recomendadas: no disponibles. Para modelos OCR de esta escala no es necesario acelerador dedicado; cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A-series) serviria, pero no hay datos de rendimiento publicados para este paquete.
- Cabe en GPU de consumo: si, con margen amplio, aunque el escenario natural es CPU.
- CPU: viable con ONNX Runtime; el interes declarado del empaquetado es precisamente evitar la cadena de PaddlePaddle. No se especifican requisitos minimos de nucleos ni de conjunto de instrucciones (AVX2, etc.).
- Opciones de despliegue: ONNX Runtime (backend previsto por el propio paquete). No se documenta soporte para vLLM, TGI u Ollama, que no aplican a un modelo OCR; llama.cpp tampoco esta indicado.
- Latencia y throughput: no disponibles. Dependen del numero de cajas de texto por imagen, del paquete de idioma y del hardware; no hay cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pp-ocrv6-onnx (este repositorio) | No disponible (familia PP-OCRv6: 1,5 M a 34,5 M) | No aplica | 50 en `lite`, 49 en `tiny`; ampliable en plataforma completa | No disponible | ONNX + `ocr.xml` | Empaquetado orientado a Spire.OCR; configuracion por XML |
| PP-OCRv6 oficial (PaddlePaddle) | 1,5 M a 34,5 M segun variante | No aplica | No disponible en la informacion | No disponible en la informacion | Paddle / ONNX en la coleccion oficial | Referencia upstream; requiere ecosistema Paddle salvo variantes ONNX |
| ppocrv6_onnx (AIwork4me) | No disponible | No aplica | No disponible | No disponible | ONNX | Envoltorio de un solo fichero; declara ~3x de aceleracion y paridad con PaddleX |
| Tesseract / EasyOCR | No disponible | No aplica | No disponible | No disponible | Distintos | Alternativas de OCR clasico; no se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion consultada; la comparativa se limita a formato, idiomas declarados y modelo de empaquetado.

## Limitaciones y advertencias

- La licencia no esta declarada. Antes de un uso comercial hay que verificar los terminos del repositorio y los de PP-OCRv6 upstream; el README indica que el paquete se destina al producto Spire.OCR, lo que sugiere una redistribucion con condiciones propias.
- No hay model card tecnica: se desconoce la variante exacta de PP-OCRv6, el numero de parametros y el regimen de cuantizacion, lo que impide estimar precision y latencia a priori.
- El README advierte de no modificar campos distintos de `modelPath`, `libPath` y `lang`; alterar `platform` o `version` puede provocar fallos de ejecucion o resultados incorrectos.
- La plataforma `lite` no permite configurar `libPath` ni `lang`, y excluye idiomas como coreano, ruso o arabe; para esos casos hay que usar la plataforma completa con el paquete correspondiente.
- Riesgo de error en textos manuscritos, baja resolucion, ruido, fondos complejos o tipografias no vistas; no se documentan metricas de robustez ni tasas de error por idioma.
- El remapeo automatico de nombres de paquete (`French`, `German`, `Japan`) a `ch` o `latin` puede producir resultados distintos de los esperados si el modelo no cubre realmente el idioma solicitado.
- El modelo de clasificacion de orientacion viene desactivado por defecto; sin el, imagenes giradas o verticales pueden degradar el reconocimiento.
- No hay garantia de mantenimiento ni de soporte: el repositorio registra 0 descargas y 0 likes, y no se documenta versionado ni changelog.
- Al ser un modelo puramente OCR, no resuelve extraccion semantica, normalizacion de entidades ni interpretacion de documentos; requiere etapas posteriores.

## Enlaces

- HuggingFace: https://huggingface.co/Iceblue2026/pp-ocrv6-onnx
- Repositorio de inferencia ONNX de terceros: https://github.com/AIwork4me/ppocrv6_onnx
- README de ese repositorio: https://github.com/AIwork4me/ppocrv6_onnx/blob/main/README.md
- Tutorial de PP-OCRv6 Small en ONNX: https://aiindigo.com/tutorials/getting-started-with-pp-ocrv6-small-fast-framework-agnostic-text-recognition
- Modelo oficial de deteccion ONNX: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx
- Coleccion oficial PP-OCRv6: https://huggingface.co/collections/PaddlePaddle/pp-ocrv6
