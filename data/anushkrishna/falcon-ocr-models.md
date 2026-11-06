# anushkrishna/falcon-ocr-models

## Resumen

Falcon OCR model pack es un paquete de distribución de artefactos OCR para inglés y árabe, publicado por el usuario anushkrishna para la aplicación de escritorio Falcon. No se trata de un modelo Transformer único, sino de un conjunto de tres modelos PaddlePaddle espejados sin modificaciones en los bytes ONNX: un detector de texto PP-OCRv6 small y dos reconocedores PP-OCRv5 mobile (inglés y árabe). Se ejecutan localmente mediante ONNX Runtime.

El paquete resuelve un problema de reproducibilidad y despliegue: fija revisiones inmutables de los modelos upstream, incluye diccionarios de caracteres y un manifiesto con hashes SHA-256 y tamaños, de modo que la aplicación puede verificar la integridad antes de cargar los modelos. El tamaño total es de aproximadamente 25,7 MB de pesos más diccionarios, lo que lo hace adecuado para inferencia en CPU y entornos de escritorio sin GPU.

Es relevante ahora porque ofrece una alternativa ligera y auditable para pipelines OCR bilingües inglés-árabe en local, con licencia Apache-2.0 y sin dependencia de servicios en la nube. No incluye mejoras de precisión propias: el autor declara explícitamente que el espejo no aporta nuevas métricas de exactitud y que existen errores de reconocimiento, especialmente en texto pequeño y dígitos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PaddleOCR: detector PP-OCRv6 small y reconocedores PP-OCRv5 mobile, exportados a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos OCR, no generativos) |
| Tipos de cuantización | no disponible (se distribuyen los ONNX upstream sin cambios) |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutados con ONNX Runtime) |
| Tamaño del paquete | ~25,7 MB de pesos más diccionarios |
| Diccionarios | 436 entradas en inglés, 747 en árabe; en tiempo de ejecución 438 y 749 clases tras añadir blank CTC y espacio |
| Modelos base | PaddlePaddle/PP-OCRv6_small_det_onnx, PaddlePaddle/en_PP-OCRv5_mobile_rec_onnx, PaddlePaddle/arabic_PP-OCRv5_mobile_rec_onnx |

## Arquitectura y entrenamiento

El paquete contiene tres redes independientes de PaddleOCR exportadas a ONNX. El detector `det_small.onnx` corresponde a PP-OCRv6 small y se encarga de localizar regiones de texto en la imagen. Los reconocedores `rec_en_mobile.onnx` y `rec_ar_mobile.onnx` corresponden a PP-OCRv5 mobile y transcriben los recortes de texto, uno para inglés y otro para árabe. Los reconocedores emplean decodificación CTC: en tiempo de ejecución se antepone la clase blank y se añade la clase espacio a los diccionarios, resultando en 438 clases para inglés y 749 para árabe.

No hay entrenamiento ni ajuste fino por parte del publicador: los bytes ONNX son idénticos a los upstream, solo se renombran desde `inference.onnx` y se acompañan de los diccionarios extraídos de `PostProcess.character_dict` en los `inference.yml` originales, unidos por saltos de línea y codificados en UTF-8. El paquete incluye `manifest.json` con revisiones upstream inmutables, tamaños, hashes SHA-256 y transformaciones aplicadas, además de las model cards y ficheros de configuración originales en `sources/`. No se documentan datos de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO, ya que son modelos OCR supervisados de PaddleOCR.

## Capacidades

- Detección de regiones de texto en imágenes mediante el modelo PP-OCRv6 small.
- Reconocimiento de texto en inglés con el modelo PP-OCRv5 mobile.
- Reconocimiento de texto en árabe con el modelo PP-OCRv5 mobile.
- Ejecución local con ONNX Runtime, sin necesidad de GPU ni de servicios en la nube.
- Verificación de integridad mediante tamaños y hashes SHA-256 registrados en `manifest.json`.
- Fijación de revisiones upstream inmutables para despliegues reproducibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No incluye visión general, audio ni modo de pensamiento: es exclusivamente un pipeline OCR.
- No incluye clasificador de orientación, modelos de layout ni rasterizadores de PDF; esos componentes quedan fuera del paquete.

## Casos de uso

- Digitalización de documentos en inglés en aplicaciones de escritorio: el detector localiza líneas de texto y el reconocedor inglés las transcribe, todo en local con ONNX Runtime y sin enviar documentos a terceros.
- Procesamiento de documentos en árabe: el reconocedor árabe permite extraer texto de formularios, facturas o capturas en árabe, con un diccionario de 747 entradas adaptado al alfabeto y signos diacríticos habituales.
- Escaneo de recibos y tickets: al ser un paquete de ~25,7 MB, puede integrarse en aplicaciones ligeras que necesitan OCR rápido en CPU para extraer importes y líneas de texto, aunque el autor advierte de errores en dígitos y texto pequeño.
- Indexación de capturas de pantalla y fotos: el pipeline detección más reconocimiento permite generar texto buscable a partir de imágenes almacenadas localmente, con verificación de integridad de los modelos antes de cargarlos.
- Aplicaciones de accesibilidad: conversión de texto impreso en imágenes a texto seleccionable o voz, ejecutándose en el dispositivo sin conexión y con licencia Apache-2.0 para uso comercial.
- Pipelines de preprocesado para RAG: extracción de texto de imágenes y PDFs rasterizados antes de enviarlo a un modelo de lenguaje, usando el OCR como etapa previa y manteniendo el contenido sensible en la máquina local.
- Distribución reproducible en instaladores: el uso de revisiones fijas y hashes SHA-256 permite que una aplicación de escritorio valide y actualice sus modelos OCR de forma controlada, sin seguir la rama `main` en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el espejo no aporta nuevas métricas de exactitud y que los modelos presentan errores de reconocimiento, en particular en texto pequeño y dígitos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser modelos ONNX de ~25,7 MB, están pensados para ejecución en CPU.
- GPU recomendadas: no disponible; no se documenta aceleración por GPU para este paquete.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se especifican requisitos ni configuraciones probadas.
- Opciones de despliegue: ONNX Runtime, que es la librería declarada del repositorio.
- Latencia y throughput estimados: no disponibles.
- Componentes excluidos del paquete: ONNX Runtime, rasterizadores de PDF, clasificadores de orientación, modelos de layout y documentos de usuario.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Falcon OCR model pack | Detección + reconocimiento PaddleOCR | en, ar | ~25,7 MB | Apache-2.0 | ONNX | Espejo verificado con hashes; sin mejoras de precisión |
| PaddleOCR PP-OCRv5 mobile (upstream) | Reconocimiento | Multilingüe según modelo | no disponible | Apache-2.0 | ONNX / Paddle | Fuente original de los reconocedores; incluye configuración y diccionarios |
| PaddleOCR PP-OCRv6 small det (upstream) | Detección | Independiente del idioma | no disponible | Apache-2.0 | ONNX / Paddle | Fuente original del detector |
| Tesseract OCR | OCR clásico | Muy amplio | no disponible | Apache-2.0 | Propio | Alternativa madura en CPU, sin verificación por hash de este paquete |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Errores de reconocimiento documentados por el autor, especialmente en texto pequeño y dígitos.
- No es un modelo generativo ni un Transformer de propósito general: no admite prompts, tool calling ni razonamiento.
- Cobertura lingüística limitada a inglés y árabe; no hay soporte para otras lenguas.
- El paquete no incluye clasificador de orientación ni modelo de layout, por lo que documentos rotados o con estructuras complejas pueden requerir componentes adicionales.
- Riesgo de sesgos y alucinaciones no documentado; al ser OCR supervisado, los errores se manifiestan como transcripciones incorrectas más que como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución a PaddlePaddle/PaddleOCR y los ficheros de licencia incluidos.
- El publicador no está afiliado a los autores originales y el empaquetado no implica su respaldo.
- Para instalaciones en producción se debe usar un SHA de commit completo en las URL de descarga y verificar tamaño y SHA-256 antes de cargar; no se debe seguir la rama `main`.
- Las actualizaciones del repositorio no actualizan automáticamente las instalaciones existentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anushkrishna/falcon-ocr-models
- Modelo base detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx
- Modelo base reconocedor inglés: https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec_onnx
- Modelo base reconocedor árabe: https://huggingface.co/PaddlePaddle/arabic_PP-OCRv5_mobile_rec_onnx
- Licencia Apache-2.0: https://huggingface.co/anushkrishna/falcon-ocr-models/blob/main/licenses/Apache-2.0.txt
- Licencia del paquete: https://huggingface.co/anushkrishna/falcon-ocr-models/blob/main/LICENSE.md
