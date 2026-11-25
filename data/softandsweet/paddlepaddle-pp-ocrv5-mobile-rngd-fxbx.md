# softandsweet/paddlepaddle-pp-ocrv5-mobile-rngd-fxbx

## Resumen

PP-OCRv5 Mobile · RNGD es un paquete de OCR empaquetado para su ejecución en NPU Furiosa RNGD, publicado por el usuario softandsweet en Hugging Face. No se trata de un modelo de lenguaje, sino de un pipeline completo de detección y reconocimiento de texto en imágenes que combina los modelos PP-OCRv5_mobile_det_onnx y PP-OCRv5_mobile_rec_onnx de PaddlePaddle, ambos convertidos y compilados para el acelerador RNGD mediante el SDK fxbX.

El paquete resuelve un problema de despliegue: integrar en un único artefacto el detector de regiones de texto y el reconocedor de líneas, de modo que no sea necesario conectar manualmente dos modelos separados. Incluye tanto los pesos como los binarios compilados, por lo que no requiere descargar FuryNo5 ni los modelos originales en tiempo de ejecución.

Es relevante para equipos que quieran ejecutar OCR sobre aceleradores NPU Furiosa con latencias controladas: el autor reporta una mediana de 0,880 s para una imagen de muestra, 1,067 s para una página original y 0,316 s para una página vacía, con 49.184 tareas NPU registradas y cero caídas a CPU del modelo durante la validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv5_mobile (DBNet) + reconocedor PP-OCRv5_mobile (CTC), compilado para NPU Furiosa RNGD |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP32 (perfiles fijos de entrada: detección 320×320, reconocimiento 48×320) |
| Idiomas soportados | no disponible (el autor indica que no se ha validado un soporte amplio de idiomas, incluido el coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | artefacto RNGD compilado con fxbX; modelos base en ONNX |

## Arquitectura y entrenamiento

El paquete es un pipeline de OCR en dos fases heredado de PaddleOCR. La primera etapa es un detector PP-OCRv5_mobile en formato ONNX que localiza regiones de texto y produce cajas delimitadoras; la segunda es un reconocedor PP-OCRv5_mobile, también ONNX, que transcribe cada recorte mediante decodificación CTC. Ambas etapas se han compilado para la NPU Furiosa RNGD con el SDK fxbX 0.9.9 y Torch 2.10.0+cpu.

La validación reportada por el autor se ejecutó sobre un único NPU, comparando las cadenas y coordenadas con las obtenidas por el runtime ONNX original. Se registraron 49.184 tareas NPU, sin fallback a CPU del modelo, sin compilación en tiempo de ejecución y sin pasos no trazados. Las tareas de CPU se limitan al preprocesado de imagen, el postprocesado de cajas DB, el recorte y la reconstrucción CTC. No se dispone de información sobre el volumen de datos de entrenamiento ni sobre el proceso de ajuste, ya que el autor parte de los modelos preentrenados de PaddlePaddle.

## Capacidades

- Detección de regiones de texto en imágenes de documentos.
- Reconocimiento de líneas de texto con salida de cadena, confianza y coordenadas por línea.
- Ejecución integrada de detección y reconocimiento en un único paquete, sin necesidad de orquestar dos modelos por separado.
- Inferencia sobre NPU Furiosa RNGD con perfiles de entrada fijos.
- Funcionamiento sin descarga de dependencias en tiempo de ejecución: pesos y binarios compilados incluidos.
- Exposición mediante CLI y llamada HTTP, según la documentación de uso del autor.
- No incluye tool calling, razonamiento multi-paso, capacidades de agente ni procesamiento de audio.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline detecta y transcribe líneas de texto en páginas de documento, devolviendo coordenadas que permiten reconstruir el orden de lectura y la estructura del original.
- Extracción de texto en pipelines de archivo administrativo: al ejecutarse sobre NPU con latencias de alrededor de un segundo por página, encaja en procesos batch de clasificación y archivado documental.
- Procesamiento de formularios e imágenes de recibos: la salida por línea con confianza permite descartar lecturas de baja calidad y derivarlas a revisión manual.
- Indexación de contenido para búsqueda: la transcripción con coordenadas facilita asociar texto a regiones de la imagen y enriquecer índices documentales.
- Servicio HTTP de OCR interno: el paquete expone invocación HTTP, lo que permite desplegarlo como microservicio consumido por otras aplicaciones.
- Procesamiento en entornos con acelerador NPU dedicado: adecuado cuando ya se dispone de hardware Furiosa RNGD y se quiere evitar el coste de GPU para cargas de OCR.
- Validación de calidad de digitalización: la comparación entre la salida del modelo y el original permite detectar páginas mal escaneadas o con texto truncado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. El autor sí reporta métricas de latencia de la validación:

| Escenario | Mediana de latencia (solicitud en caliente) |
|---|---|
| Imagen de muestra | 0,880 s |
| Página original | 1,067 s |
| Página vacía | 0,316 s |

Datos de validación adicionales: 49.184 tareas NPU registradas, 0 fallbacks de modelo a CPU, 0 compilaciones en tiempo de ejecución y 0 pasos no trazados. La coincidencia de cadenas y coordenadas con el runtime ONNX original se verificó en los tres escenarios.

## Requisitos de hardware

- Acelerador NPU Furiosa RNGD; el paquete está compilado específicamente para esta plataforma.
- CPU para preprocesado de imagen, postprocesado de cajas DB, recorte y reconstrucción CTC.
- SDK fxbX 0.9.9 y Torch 2.10.0+cpu como entorno de ejecución validado.
- Tamaño del repositorio: 0,1 GB, incluyendo pesos y artefactos compilados.
- No se especifican requisitos de VRAM ni GPU, al no ser un modelo orientado a GPU.
- Opciones de despliegue: CLI y servidor HTTP propios del paquete; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Throughput estimado: no disponible; solo se publican latencias medianas por solicitud.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| PP-OCRv5 Mobile · RNGD (este) | Pipeline detección + reconocimiento | 320×320 (det), 48×320 (rec) | Apache-2.0 | NPU Furiosa RNGD | Incluye binarios compilados; latencias reportadas por el autor |
| PaddlePaddle/PP-OCRv5_mobile_det_onnx | Detector | ONNX | no disponible en la información | CPU/GPU vía ONNX Runtime | Modelo base del detector |
| PaddlePaddle/PP-OCRv5_mobile_rec_onnx | Reconocedor | ONNX | no disponible en la información | CPU/GPU vía ONNX Runtime | Modelo base del reconocedor |

No se dispone de datos de rendimiento comparativo frente a otras soluciones de OCR en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que no se ha validado la precisión en OCR de alta resolución de documentos completos grandes.
- No se ha verificado un soporte amplio de idiomas, incluido el coreano; la cobertura lingüística es, por tanto, incierta.
- Con el perfil de entrada original de 320×320 en CPU se produce truncamiento de las dos últimas líneas de una página real, según el propio autor.
- Los perfiles de entrada son fijos (320×320 para detección y 48×320 para reconocimiento), lo que limita la adaptación a imágenes de otras resoluciones.
- Dependencia estricta del hardware Furiosa RNGD y del SDK fxbX 0.9.9; no es portable a GPU o CPU convencionales sin recompilación.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de errores de reconocimiento en texto de baja calidad o con tipografías atípicas.
- No se documentan sesgos específicos; al derivar de PaddleOCR, hereda las limitaciones de sus datos de entrenamiento, no detallados.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar `NOTICE.md` para las revisiones fijadas de los modelos originales.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/softandsweet/paddlepaddle-pp-ocrv5-mobile-rngd-fxbx)
- [Modelo base detector: PaddlePaddle/PP-OCRv5_mobile_det_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx)
- [Modelo base reconocedor: PaddlePaddle/PP-OCRv5_mobile_rec_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec_onnx)
- Documentación de uso (`USAGE.md`) y registro de validación (`VALIDATION.json`) referenciados en la model card del repositorio.
