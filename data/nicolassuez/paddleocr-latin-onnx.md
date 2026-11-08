# Nicolassuez/paddleocr-latin-onnx

## Resumen

`Nicolassuez/paddleocr-latin-onnx` es un espejo (mirror) en formato ONNX del modelo de reconocimiento de texto `latin_PP-OCRv5_mobile_rec` de PaddleOCR, orientado a la lectura de lineas de texto en alfabeto latino. No se trata de un modelo de lenguaje generativo, sino de un reconocedor OCR especializado que convierte recortes de imagen de una linea de texto en la cadena de caracteres correspondiente. El autor del repositorio lo publica como copia byte a byte de los ficheros `languages/latin/rec.onnx` y `languages/latin/dict.txt` del repositorio `monkt/paddleocr-onnx`, en el commit `7b02d0a30a07ba2b92ad1ff5a8941ae2c633de65`.

El modelo resuelve un problema concreto: disponer de un reconocedor OCR ligero, en un unico fichero ONNX portable, que funcione en entornos de produccion sin necesidad de instalar el stack completo de PaddlePaddle. Al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en CPU o GPU y encaja en pipelines de procesamiento documental, especialmente en aplicaciones de escritorio o servidores con recursos limitados.

La relevancia actual del repositorio es acotada: se trata de un artefacto de distribucion para un complemento PDF concreto (el add-on de aSup), sin descargas ni likes en el momento de la consulta y con un tamano de repositorio de 0.0 GB. Su interes tecnico radica en la variante `mobile` de PP-OCRv5, pensada para inferencia rapida, y en la cobertura de aproximadamente 32 idiomas de escritura latina con un diccionario de 502 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de reconocimiento de texto (familia PP-OCRv5, variante mobile), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen 3x48xW (altura fija 48 px, anchura variable) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `rec.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | aproximadamente 32 idiomas de escritura latina (502 caracteres, acentos incluidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`rec.onnx`) mas diccionario de caracteres (`dict.txt`) |

## Arquitectura y entrenamiento

El modelo es la variante `latin_PP-OCRv5_mobile_rec` de PaddleOCR, un reconocedor de lineas de texto basado en una red convolucional con salida CTC (Connectionist Temporal Classification). La entrada es un tensor de imagen de 3 canales y 48 pixeles de alto con anchura variable, normalizado mediante `(x/255 - 0.5) / 0.5`. La salida CTC sigue un esquema de indices concreto: el indice 0 es el token en blanco (blank), los indices 1 a 502 corresponden a las entradas del diccionario y el indice 503 representa el espacio.

El repositorio no incluye informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste fino supervisado o el proceso de destilacion que PaddleOCR aplica habitualmente a sus variantes `mobile`. Tampoco se documentan innovaciones adicionales de decodificacion especulativa ni mecanismos de atencion lineal; el modelo se limita a la decodificacion CTC estandar. La unica transformacion documentada es la conversion a ONNX, realizada por el autor del repositorio `monkt/paddleocr-onnx`, y la verificacion de integridad mediante hashes SHA-256: `614ffc2d6d3902d360fad7f1b0dd455ee45e877069d14c4e51a99dc4ef144409` para `rec.onnx` y `3c0a8a79b612653c25f765271714f71281e4e955962c153e272b7b8c1d2b13ff` para `dict.txt`.

## Capacidades

- Reconocimiento de texto en imagenes de lineas (OCR de linea completa), no deteccion de cajas de texto: requiere un recorte previo de la linea.
- Cobertura de aproximadamente 32 idiomas de escritura latina, con un diccionario de 502 caracteres que incluye letras acentuadas.
- Salida CTC con indices bien definidos (blank 0, diccionario 1..502, espacio 503), lo que facilita la integracion con decodificadores propios.
- Entrada de altura fija (48 px) y anchura variable, adecuada para lineas de longitud heterogenea.
- Ejecucion portable mediante ONNX Runtime en CPU o GPU, sin dependencia del framework PaddlePaddle.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, vision general, audio ni generacion de texto libre. Es exclusivamente un reconocedor OCR.

## Casos de uso

- Digitalizacion de documentos escaneados en castellano y otras lenguas latinas: el modelo reconoce lineas de texto recortadas y devuelve la cadena de caracteres, lo que permite reconstruir el contenido textual de facturas, contratos o formularios tras un paso previo de deteccion de lineas.
- Integracion en el complemento PDF de aSup: el repositorio existe precisamente como mirror para ese add-on, de modo que puede copiarse el `rec.onnx` y el `dict.txt` directamente en el paquete de la aplicacion sin dependencias adicionales.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo `mobile` en ONNX, puede ejecutarse con ONNX Runtime en CPU para digitalizar grandes volumenes de recortes de lineas con un coste computacional contenido.
- Extraccion de texto en aplicaciones de escritorio: el formato ONNX y el tamano reducido de la variante `mobile` permiten empaquetar el modelo dentro de aplicaciones locales de escaneo o gestion documental.
- OCR multilingue de documentos europeos: la cobertura de aproximadamente 32 idiomas latinos permite procesar documentos con mezcla de castellano, frances, portugues, italiano, aleman, etc., usando un unico reconocedor.
- Preprocesado para pipelines de NLP: el texto reconocido puede alimentar etapas posteriores de extraccion de entidades, busqueda o indexacion, ya que la salida es texto plano con indices CTC bien definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una variante `mobile` de reconocimiento de lineas, la huella de memoria es reducida, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El modelo puede ejecutarse en CPU mediante ONNX Runtime; no se especifican GPU objetivo.
- Compatibilidad con GPU de consumo: no disponible. Por el perfil `mobile` del modelo, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU o GPU). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no aplican a un reconocedor OCR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nicolassuez/paddleocr-latin-onnx` | Reconocedor OCR de lineas (PP-OCRv5 mobile) | ~32 idiomas latinos | ONNX | Apache-2.0 | Hugging Face (mirror) |
| `monkt/paddleocr-onnx` | Pipeline OCR multilingue PaddleOCR convertido a ONNX | Multilingue (segun modelos incluidos) | ONNX | no disponible en la informacion | Hugging Face |
| `PaddleOcrNet/PaddleOcrNet-models` | Coleccion de modelos PaddleOCR en ONNX, incluido `latin_PP-OCRv5_mobile_rec.onnx` | Multilingue | ONNX | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- El repositorio es un mirror byte a byte de otro repositorio (`monkt/paddleocr-onnx`); no aporta entrenamiento, ajuste ni mejoras propias, y su mantenimiento depende del autor original.
- No incluye deteccion de texto: solo reconoce lineas ya recortadas. Un pipeline OCR completo necesita un modelo de deteccion adicional.
- La cobertura linguistica se limita a escritura latina; no reconoce alfabetos cirilico, arabe, CJK ni otros sistemas de escritura.
- No se documentan sesgos especificos, pero como todo OCR puede fallar con imagenes de baja resolucion, ruido, rotaciones o tipografias no vistas en entrenamiento.
- Riesgo de alucinacion: en OCR, el equivalente es la sustitucion o invencion de caracteres en lineas ambiguas; no hay datos publicados sobre tasas de error.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y la atribucion a los autores de PaddleOCR. Conviene verificar la licencia del repositorio de origen (`monkt/paddleocr-onnx`), que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- No se documentan limitaciones de contexto en el sentido de modelos de lenguaje, pero la anchura de entrada condiciona la longitud maxima de linea reconocible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nicolassuez/paddleocr-latin-onnx
- Repositorio de origen (mirror): https://huggingface.co/monkt/paddleocr-onnx
- Modelo equivalente en PaddleOcrNet: https://huggingface.co/PaddleOcrNet/PaddleOcrNet-models/blob/main/latin_PP-OCRv5_mobile_rec.onnx
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
