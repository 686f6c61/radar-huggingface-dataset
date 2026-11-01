# remade-with-rust/carmenta-ppocrv5-mobile

## Resumen

Carmenta PP-OCRv5 mobile es un paquete de pesos para el motor OCR `mobiledet-svtr` de ffai-carmenta, la librería de OCR escrita íntegramente en Rust del proyecto FFAI. No es un modelo entrenado desde cero por su publicador (remade-with-rust), sino una conversión a formato safetensors de los modelos PP-OCRv5 mobile de PaddleOCR: el detector de texto DBNet con backbone PP-LCNetV3 y el reconocedor SVTR. El autor declara explícitamente que no se ha reentrenado ningún peso y que la conversión se ha verificado contra los programas exportados por PaddlePaddle.

El paquete resuelve un problema de integración: permite usar el pipeline OCR de PaddleOCR en aplicaciones Rust sin depender del runtime de PaddlePaddle ni de Python. Para ello fusiona las ramas re-parameterizadas del detector y las BatchNorms en convoluciones simples, de modo que el grafo resultante sea directamente consumible por el motor de inferencia de la crate. El reconocedor incluye un charset de 18 383 caracteres más el token blank.

La relevancia es acotada pero clara: el repositorio tiene 0 descargas y 0 likes, el tamaño es de 0.0 GB (posiblemente metadatos incompletos o pesos aún no subidos) y no hay model card con métricas ni idiomas declarados más allá de lo que implica el charset. Es un artefacto de distribución para un ecosistema concreto (FFAI en Rust), no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector: DBNet con backbone PP-LCNetV3 (PP-OCRv5 mobile det). Reconocedor: SVTR (PP-OCRv5 mobile rec) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo OCR por imagen, no generativo) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente FP32; no se documentan variantes) |
| Idiomas soportados | no disponible explícitamente; el charset del reconocedor contiene 18 383 caracteres más blank |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`det-fused.safetensors`, `rec.safetensors`, más `charset.txt`) |

## Arquitectura y entrenamiento

El detector es un DBNet con backbone PP-LCNetV3, la variante móvil de la familia PP-OCRv5 de PaddleOCR. La conversión aplicada por el autor fusiona las ramas re-parameterizadas y las BatchNorms en convoluciones planas, eliminando operaciones que complican la inferencia en runtimes genéricos. El reconocedor es un SVTR, un transformer ligero para secuencias de recortes de texto, con un vocabulario de 18 383 caracteres más el token blank. Ambos modelos son los originales de PaddleOCR en su variante mobile, pensada para latencia baja en CPU y dispositivos con recursos limitados.

No hay información sobre el número de tokens de entrenamiento, composición del dataset, ni sobre si hubo etapas de RLHF o DPO; estos modelos no son generativos y no usan alineación por preferencias. La innovación técnica del paquete es la conversión y verificación de pesos: el autor indica que los ficheros se comprobaron contra los programas exportados por PaddlePaddle y que se incluyen hashes SHA-256 por fichero. No se aportan detalles sobre el proceso de fusión más allá de la mención a la re-parameterización y a las BatchNorms.

## Capacidades

- Detección de regiones de texto en imágenes (text detection) mediante DBNet.
- Reconocimiento de texto (text recognition) mediante SVTR con vocabulario de 18 383 caracteres más blank.
- Pipeline OCR completo detección + reconocimiento integrado en la crate `ffai-carmenta` a través de `CraftCrnn::offline(RecStage::Svtr, DetStage::MobileDet, root)`.
- Carga de pesos desde disco con estructura `root/<model>/<file>`, o descarga automática mediante la feature `fetch` usando los hashes fijados en los manifiestos de la crate.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo de visión para OCR.
- No se documentan capacidades multimodales más allá de imagen a texto, ni modos de thinking, audio o vídeo.
- El soporte multilingüe depende del charset incluido; no se especifica qué escrituras cubre.

## Casos de uso

- Digitalización de documentos en aplicaciones Rust nativas: el paquete permite extraer texto de facturas, formularios o escaneos sin incorporar Python ni el runtime de PaddlePaddle, usando directamente la crate `ffai-carmenta`.
- Procesamiento por lotes en servidores sin GPU: al ser la variante mobile de PP-OCRv5, está pensada para inferencia en CPU con latencia contenida, adecuada para pipelines de indexación de archivos PDF o imágenes.
- Extracción de texto en herramientas de línea de comandos: integración en binarios Rust distribuibles que necesiten OCR local sin dependencias externas pesadas.
- Preprocesado para pipelines de búsqueda documental: generar texto plano a partir de imágenes escaneadas antes de indexarlo en un motor de búsqueda o en un sistema RAG.
- Digitalización de matrículas, carteles o etiquetas en aplicaciones de campo: el detector DBNet localiza regiones y el SVTR las transcribe, con un footprint propio de un modelo mobile.
- Verificación de integridad en despliegues: los hashes SHA-256 publicados por fichero permiten validar que los pesos descargados son los esperados antes de cargarlos en producción.
- Sustitución de PaddleOCR en entornos con restricciones de dependencias: equipos que ya usan Rust y quieren evitar cadenas de herramientas C++/Python para OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser modelos mobile de OCR, el consumo esperado es bajo, pero no se aportan cifras.
- GPU recomendadas: no disponible. El diseño mobile de PP-OCRv5 apunta a inferencia en CPU; no se documenta soporte GPU en la crate.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen; por el tipo de modelo, la inferencia en CPU es el escenario natural.
- Opciones de despliegue: la vía documentada es la crate `ffai-carmenta` (Rust), con carga offline desde disco o descarga mediante la feature `fetch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo OCR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Carmenta PP-OCRv5 mobile (este) | DBNet + SVTR (PP-OCRv5 mobile) | no disponible | no aplica | Apache 2.0 | safetensors | Conversión para Rust, sin reentrenar |
| PaddleOCR PP-OCRv5 mobile (original) | DBNet + SVTR | no disponible | no aplica | Apache 2.0 | PaddlePaddle | Requiere runtime Paddle; referencia de la conversión |
| Tesseract (LSTM) | LSTM + motor clásico | no disponible | no aplica | Apache 2.0 | Propio | OCR clásico, sin redes transformer; ecosistema distinto |
| EasyOCR | CRAFT + CRNN | no disponible | no aplica | Apache 2.0 | PyTorch | Pipeline OCR en Python; requiere PyTorch |

La comparación se limita a la categoría funcional (OCR detección + reconocimiento); no hay datos de rendimiento publicados para este paquete que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de OCR de imagen a texto no está soportado.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño de 0.0 GB; conviene verificar que los ficheros de pesos están realmente disponibles antes de integrarlo.
- No se documentan los idiomas cubiertos ni la composición del charset más allá del recuento de 18 383 caracteres; el rendimiento en escrituras no latinas es desconocido.
- No hay métricas de precisión, recall ni CER/WER publicadas; no se puede evaluar la calidad frente al PP-OCRv5 original sin pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero el copyright de los modelos originales sigue siendo de los autores de PaddlePaddle; el autor indica que se consulte el fichero `LICENSE`.
- La conversión a safetensors con fusión de BatchNorms puede introducir diferencias numéricas frente a los pesos originales; el autor afirma haberlas verificado contra los programas exportados, pero no publica la comparación.
- Dependencia de la crate `ffai-carmenta`: el uso fuera de ese motor no está documentado y requeriría reconstruir el grafo de inferencia.
- Riesgo de alucinación en el sentido de transcripciones incorrectas en imágenes de baja calidad, pero no se aportan tasas de error.

## Enlaces

- HuggingFace: https://huggingface.co/remade-with-rust/carmenta-ppocrv5-mobile
- Crate `ffai-carmenta`: https://crates.io/crates/ffai-carmenta
- Repositorio FFAI: https://github.com/Remade-With-Rust/FFAI
- PaddleOCR (modelos originales): no disponible en la información proporcionada
