# opticsWolf/rapidocr-ppocrv5-onnx

## Resumen

`opticsWolf/rapidocr-ppocrv5-onnx` es un repositorio de servicio (serving repo) que empaqueta los pesos ONNX del par movil de deteccion y reconocimiento de texto de PaddleOCR PP-OCRv5, junto con el diccionario de caracteres `ppocrv5_dict.txt` que las exportaciones ONNX no incluyen. No es un modelo entrenado por el autor: los ficheros `ppocrv5_det_infer.onnx` y `ppocrv5_rec_infer.onnx` son byte-identicos a los publicados por PaddlePaddle en `PP-OCRv5_mobile_det_onnx` y `PP-OCRv5_mobile_rec_onnx` (Apache-2.0), solo renombrados a nombres planos en la raiz del repositorio.

El repositorio resuelve un problema concreto de despliegue: quien sirve PP-OCRv5 mobile en ONNX con un runtime propio (por ejemplo RapidOCR) necesita tres artefactos coordinados (detector, reconocedor y charset) y las exportaciones oficiales no llevan el diccionario. Este repo los agrupa con hashes SHA-256 documentados para verificacion de integridad.

Se trata de un pipeline OCR clasico de dos etapas: DBNet para generar el mapa de probabilidad de cajas de texto y un reconocedor SVTR-HGNet con 18.385 clases CTC. El detector trabaja sobre un lienzo de `[1,3,960,960]` normalizado ImageNet y el reconocedor sobre `[1,3,48,W]`. El repositorio es de fecha 2026-11-07, con 0 descargas y 0 likes en el momento de la consulta, y tamano de repo de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: deteccion DBNet (mapa de probabilidad) + reconocimiento SVTR-HGNet con CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada de imagen `[1,3,960,960]` en det y `[1,3,48,W]` en rec) |
| Tipos de cuantizacion | no disponible (pesos servidos en ONNX float) |
| Idiomas soportados | no disponible en la model card; el diccionario PP-OCRv5 cubre un charset multilingue de 18.383 caracteres |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`ppocrv5_det_infer.onnx`, `ppocrv5_rec_infer.onnx`) + diccionario de texto plano `ppocrv5_dict.txt` |

## Arquitectura y entrenamiento

El pipeline combina un detector DBNet-style, que produce un unico tensor de salida `fetch_name_0` con el mapa de probabilidad de texto, y un reconocedor SVTR-HGNet que mapea recortes normalizados a altura 48 px a logits `[B,T,18385]`. La decodificacion CTC es greedy y usa el diccionario incluido: 18.383 caracteres mas un token blank en el indice 0 y el espacio como ultima clase. El caller del runtime es responsable de la decodificacion DBNet (extraccion de cajas a partir del mapa de probabilidad) y de aplicar la CTC con el charset.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO en la informacion disponible: los pesos proceden de PaddleOCR PP-OCRv5 mobile, y este repositorio solo los redistribuye. La innovacion practica del repo es operativa, no arquitectonica: nombres de fichero planos, hashes SHA-256 documentados (det `a431985659dc921974177a95adcfbb90fd9e51989a5e04d70d0b75f597b6e61d`, rec `da72dc72ca4dc220df0dfde68c1dedc31c58d3e76a25871122e5056227d50092`) y el diccionario verbatim de `ppocr/utils/dict/ppocrv5_dict.txt`.

## Capacidades

- Deteccion de regiones de texto en imagenes mediante mapa de probabilidad DBNet.
- Reconocimiento de texto recortado linea a linea con decodificacion CTC greedy sobre 18.385 clases.
- OCR multilingue segun el charset PP-OCRv5 (no se detalla la lista de idiomas en la model card).
- Integrable en runtimes ONNX (ONNX Runtime, OpenVINO via conversion, etc.) y en el toolkit RapidOCR.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generacion de texto libre: es un pipeline OCR dedicado.
- No dispone de vision generativa, audio ni modo thinking.

## Casos de uso

- Digitalizacion de documentos escaneados: el par det+rec permite extraer texto de facturas, contratos y formularios pagina a pagina, con el detector localizando lineas y el reconocedor transcribiendolas.
- Extraccion de texto en movil o edge: al ser los modelos mobile de PP-OCRv5 en ONNX, encajan en despliegues con recursos limitados donde no cabe un VLM.
- Pipeline de ingesta documental: usar la salida CTC y las cajas DBNet para indexar texto en un buscador o base documental, con verificacion de integridad de pesos via SHA-256.
- Preprocesado para RAG: convertir PDFs escaneados e imagenes en texto antes de trocear y generar embeddings, usando este repo como componente OCR determinista.
- Lectura de matriculas, tickets y etiquetas: reconocimiento de lineas cortas con charset amplio, adecuado para tareas de vision industrial y logistica.
- Integracion con RapidOCR: el toolkit documenta soporte de modelos PaddleOCR convertidos a ONNX y seleccion por `default_models.yaml`, lo que permite usar estos ficheros como backend.
- Verificacion de cadena de suministro: los hashes publicados permiten comprobar que los ONNX servidos coinciden con los oficiales de PaddlePaddle antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser modelos mobile en ONNX, la huella es reducida, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable por el perfil mobile de PP-OCRv5, pero no confirmada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime; RapidOCR como toolkit de referencia; conversiones a OpenVINO, MNN, PaddlePaddle y PyTorch estan documentadas por RapidOCR para modelos PaddleOCR, y TensorRT se construye dinamicamente desde ONNX en RapidOCR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opticsWolf/rapidocr-ppocrv5-onnx | OCR det+rec ONNX | no disponible | imagen `[1,3,960,960]` / `[1,3,48,W]` | apache-2.0 | Hugging Face, 0 descargas |
| PaddlePaddle/PP-OCRv5_mobile_det_onnx | Detector ONNX | no disponible | imagen | apache-2.0 | Hugging Face (origen de los pesos) |
| PaddlePaddle/PP-OCRv5_mobile_rec_onnx | Reconector ONNX | no disponible | imagen `[1,3,48,W]` | apache-2.0 | Hugging Face (origen de los pesos) |
| RapidOCR (toolkit) | Toolkit OCR | no aplica | varios formatos | open source | Documentacion y ModelScope |

La comparativa se limita a los artefactos de origen y al toolkit que los consume; no hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una redistribucion de pesos PaddleOCR; cualquier sesgo o limitacion proviene de PP-OCRv5 mobile.
- Riesgo de alucinacion: en OCR se manifiesta como transcripcion incorrecta de caracteres, especialmente en imagenes de baja calidad, rotadas o con ruido.
- El diccionario cubre 18.383 caracteres; textos fuera de ese charset no se reconoceran correctamente.
- La lista de idiomas no se detalla en la model card; conviene validar el charset contra el caso de uso concreto.
- La decodificacion DBNet y CTC corre a cargo del caller: un uso incorrecto del diccionario o del indice blank produce salidas invalidas.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-07), sin senales de mantenimiento posterior.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribuirse a PaddleOCR.
- No hay informacion sobre cuantizacion, latencia ni requisitos de hardware; cualquier estimacion de produccion debe medirse en el entorno real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opticsWolf/rapidocr-ppocrv5-onnx
- Documentacion RapidOCR: https://rapidai.github.io/RapidOCRDocs/main/en/
- Lista de modelos RapidOCR: https://rapidai.github.io/RapidOCRDocs/main/en/model_list/
- Pesos de origen (detector): https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx
- Pesos de origen (reconocedor): https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec_onnx
