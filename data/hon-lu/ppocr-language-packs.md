# hon-lu/ppocr-language-packs

## Resumen

PP-OCR language packs es un repositorio de modelos de reconocimiento óptico de caracteres (OCR) en formato ONNX, publicado por el desarrollador hon-lu como complemento para su aplicación de traducción OverTranslate. No se trata de un modelo de lenguaje generativo, sino de un conjunto de reconocedores de texto especializados por sistema de escritura que la aplicación descarga bajo demanda cuando el usuario selecciona un idioma no incluido en el instalador base. El repositorio contiene actualmente un único paquete funcional, el cirílico, que cubre ruso y ucraniano.

Técnicamente, los modelos son conversiones ONNX sin modificar de los reconocedores móviles de PaddleOCR (familia PP-OCRv5), redistribuidas desde el proyecto RapidOCR en su revisión v3.9.2. Solo se han renombrado los ficheros para adaptarlos al esquema de versionado de la aplicación. El detector y el clasificador de ángulos son compartidos entre todos los paquetes de idioma y no se incluyen en este repositorio.

La relevancia de este repositorio es acotada pero práctica: ofrece artefactos ONNX ligeros (unos 8 MB por reconocedor) con hashes SHA-256 fijados, pensados para integrarse en aplicaciones de escritorio que necesitan OCR multilingüe sin empaquetar todos los idiomas de antemano. Es útil como referencia para quien quiera reutilizar los reconocedores PP-OCRv5 en formato ONNX con verificación de integridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN de reconocimiento de texto (PP-OCRv5 rec mobile), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR, no generativo) |
| Tipos de cuantización | no disponible (los ficheros publicados son ONNX; no se documenta el tipo de cuantización interna) |
| Idiomas soportados | Ruso y ucraniano (paquete cirílico; el diccionario cubre el alfabeto cirílico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) más diccionario de caracteres en texto plano (`.txt`) |

## Arquitectura y entrenamiento

Los ficheros son reconocedores de texto de la familia PP-OCRv5 en su variante móvil (`cyrillic_PP-OCRv5_rec_mobile`), convertidos a ONNX. Se trata de redes convolucionales especializadas en la transcripción de recortes de imagen de una línea de texto a secuencia de caracteres, no de transformers generativos. Cada paquete incluye el modelo de reconocimiento y su diccionario de caracteres asociado (`ppocrv5_cyrillic_dict.txt`), que define el vocabulario de salida.

No se dispone de información sobre el proceso de entrenamiento, el volumen de datos, la composición del dataset ni si hubo ajuste fino específico para cirílico. Los artefactos son copias sin modificar de RapidOCR v3.9.2, según declara el autor, y solo se han renombrado los ficheros. El repositorio aplica un esquema de versionado inmutable: las versiones se añaden como ficheros nuevos y las publicadas nunca se reemplazan, porque las builds de la aplicación verifican cada fichero contra un SHA-256 fijo.

## Capacidades

- Reconocimiento de texto impreso en alfabeto cirílico (ruso y ucraniano) a partir de recortes de imagen de líneas de texto.
- Integración con un detector y un clasificador de ángulos compartidos, que la aplicación OverTranslate gestiona por separado y que no forman parte de este repositorio.
- Ejecución mediante runtime ONNX, sin dependencia de frameworks de deep learning completos.
- Verificación de integridad mediante SHA-256 documentado por fichero.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo thinking.
- Capacidades multilingües limitadas al paquete cirílico publicado; no se documentan otros paquetes en la información disponible.

## Casos de uso

- OCR de documentos en ruso y ucraniano en aplicaciones de escritorio: el reconocedor procesa recortes de línea detectados previamente y devuelve la transcripción usando el diccionario cirílico incluido, con un peso de unos 8 MB por modelo.
- Traducción asistida por captura de pantalla: OverTranslate descarga este paquete la primera vez que el usuario selecciona un idioma cirílico, de modo que la aplicación no necesita empaquetar todos los idiomas en el instalador.
- Digitalización de formularios y facturas en cirílico: al ser un modelo ONNX ligero, puede ejecutarse en CPU en entornos de escritorio o servidores sin GPU dedicada.
- Extracción de texto en pipelines de procesamiento documental: el formato ONNX permite integrarlo en servicios Python con `onnxruntime` junto a un detector de texto propio.
- Distribución de actualizaciones verificables: el esquema de versionado con SHA-256 fijo permite que una aplicación cliente valide la integridad del modelo descargado antes de cargarlo.
- Referencia para conversiones ONNX de PP-OCR: sirve como punto de partida para quien quiera reutilizar los reconocedores PP-OCRv5 móviles en formato ONNX sin depender del stack completo de Paddle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de unos 8 MB, es previsible que funcione en CPU, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; por tamaño, el modelo es apto para ejecución en CPU en la mayoría de equipos de escritorio.
- Opciones de despliegue: runtime ONNX (`onnxruntime`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCR language packs (este repo) | Reconocedor OCR PP-OCRv5 mobile | Cirílico (ruso, ucraniano) | ONNX + dict | Apache 2.0 | Hugging Face, 0 descargas |
| PaddleOCR (upstream) | Suite OCR completa (detección, clasificación, reconocimiento) | Múltiples | Paddle inference, exportable a ONNX | Apache 2.0 | GitHub, ampliamente adoptado |
| RapidOCR (upstream de la conversión) | Conversiones ONNX de PP-OCR | Múltiples | ONNX | Apache 2.0 | ModelScope, revisión v3.9.2 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio solo contiene el paquete cirílico; no hay evidencia de otros idiomas publicados en la información disponible.
- El modelo reconoce texto, no lo comprende: no corrige errores gramaticales ni contextuales, y la calidad depende del detector y del recorte previo.
- No se documentan sesgos, tasas de alucinación ni métricas de precisión; al ser un modelo discriminativo de OCR, el riesgo principal es la sustitución de caracteres confundibles, no la generación inventada.
- El diccionario cubre el alfabeto cirílico, pero no se detalla la cobertura exacta de caracteres ni el tratamiento de signos diacríticos o variantes regionales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribución a PaddleOCR y RapidOCR, tal como hace el propio repositorio.
- El esquema de versionado inmutable implica que los errores en un fichero publicado no se corrigen in situ: requieren una nueva versión con nombre distinto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hon-lu/ppocr-language-packs
- Aplicación OverTranslate: https://github.com/Hon-Lu/OverTranslate
- PaddleOCR (upstream de los modelos): https://github.com/PaddlePaddle/PaddleOCR
- RapidOCR en ModelScope (origen de las conversiones ONNX): https://www.modelscope.cn/models/RapidAI/RapidOCR
