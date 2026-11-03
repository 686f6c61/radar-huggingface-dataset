# bigbigbei/indra-ocr-mlx

## Resumen

indra-ocr-mlx es una conversión al framework MLX de Apple del modelo de OCR `datalab-to/indra-ocr`, desarrollado originalmente por Datalab. El modelo original implementa una canalización completa de reconocimiento óptico de caracteres (detección de líneas de texto, clasificación de escritura, orden de lectura, reconocimiento por grupos de escritura y OCR matemático) basada en grafos ONNX. Esta conversión reempaqueta cada uno de esos grafos como bundles `*.mlxonnx/` autocontenidos para que toda la canalización se ejecute de forma nativa sobre la GPU de Apple Silicon sin necesidad de `onnxruntime`.

El paquete incluye ocho bundles principales (`det`, `orient`, `order`, `script`, `rec`, `rec_cjk`, `rec_rtl`, `rec_world`) más cuatro componentes para OCR matemático (`math_enc`, `math_dec_init`, `math_dec_step`, `mathcls`) y un `meta.json` con vocabulario, geometría y parámetros de los modelos de lenguaje n-grama. Está pensado para cargarse como el nivel `indra` de la librería Swift MlxOCRKit.

Es relevante porque ofrece una vía práctica para ejecutar OCR multilingüe de calidad en hardware de consumo Apple, con soporte declarado para once idiomas (incluyendo CJK, árabe y escrituras RTL), sin depender de CUDA ni de ONNX Runtime. El repositorio es de tamaño 0.0 GB en el momento de la consulta y registra 0 descargas y 0 likes, lo que indica que es una conversión reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canalización OCR multi-etapa basada en grafos ONNX exportados a MLX (detección, orientación, orden de lectura, clasificación de escritura, reconocedores por grupo y OCR matemático encoder/decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (geometría de entrada: `det_long_side=1024`, `rec_height=32`, `rec_window=3`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, nl, zh, ja, ko, ar |
| Licencia | OpenRAIL (AI Pubs Open RAIL-M License, Modified) |
| Formato de pesos | bundles `*.mlxonnx/` con `graph.json` + `weights.safetensors`; `meta.json` con vocabulario y geometría |

## Arquitectura y entrenamiento

La arquitectura no es un transformer monolítico de generación de texto, sino una canalización OCR compuesta por varios submodelos especializados que se ejecutan secuencialmente: detección de líneas de texto (`det`), orientación de página o línea (`orient`), orden de lectura (`order`), clasificación de escritura (`script`), reconocimiento por grupos de escritura (`rec` para latino, `rec_cjk` para chino/japonés/coreano, `rec_rtl` para escrituras de derecha a izquierda, `rec_world` para otras escrituras) y un módulo de OCR matemático con encoder, decoder inicial, paso de decoder y clasificador (`math_enc`, `math_dec_init`, `math_dec_step`, `mathcls`). Cada grafo ONNX original se exporta a un bundle MLX autocontenido mediante `tools/export_mlxonnx.py`, de modo que todo el modelo se carga y ejecuta a través de MLX en la GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo original. La model card indica explícitamente que los modelos de lenguaje n-grama originales en formato `.npz` no se incluyen en este paquete, ya que el decoder MLX-Swift solo lee los grafos `*.mlxonnx` y el `meta.json`, donde se registran los parámetros de gating del LM bajo `lm_params`. La geometría fija del pipeline (lado largo de detección de 1024, altura de reconocimiento de 32 y ventana de reconocimiento de 3) es un dato técnico concreto de la conversión.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) completo sobre imágenes y documentos, con detección de líneas de texto y reconocimiento por grupos de escritura.
- Detección de orientación de página y de línea para corregir documentos rotados o escaneados en ángulos no estándar.
- Determinación del orden de lectura, útil en documentos con múltiples columnas o maquetación compleja.
- Clasificación automática de escritura para enrutar cada región al reconocedor adecuado (latino, CJK, RTL u otros).
- Reconocimiento multilingüe declarado en once idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- OCR matemático mediante un encoder/decoder dedicado y un clasificador de expresiones matemáticas.
- Ejecución nativa en Apple Silicon a través de MLX, sin `onnxruntime`.
- Integración como nivel `indra` de la librería Swift MlxOCRKit.
- No se documentan capacidades de tool calling, agentes, visión general (más allá de OCR) ni modo de razonamiento.

## Casos de uso

- Digitalización de archivos escaneados en macOS: el pipeline completo (detección, orientación, orden y reconocimiento) permite convertir lotes de PDF o imágenes en texto estructurado ejecutándose en la GPU del Mac, sin depender de servicios en la nube.
- Extracción de texto de documentos multilingües: la clasificación de escritura y los reconocedores separados para latino, CJK y RTL permiten procesar expedientes que mezclan idiomas en un mismo lote, enrutando cada región al reconocedor correspondiente.
- Procesamiento de documentos con maquetación compleja: el módulo de orden de lectura resulta adecuado para reconstruir el flujo textual de periódicos, informes a varias columnas o formularios.
- Reconocimiento de expresiones matemáticas: el subsistema `math_enc`/`math_dec`/`mathcls` sirve para extraer fórmulas de apuntes, artículos científicos o libros de texto y convertirlas en texto estructurado.
- Aplicaciones Swift nativas en Apple Silicon: al cargarse como nivel `indra` de MlxOCRKit, encaja en apps de escritorio macOS que necesiten OCR local sin conexión y con privacidad de datos.
- Preprocesado para pipelines de RAG o búsqueda documental: el texto extraído de facturas, contratos o informes puede indexarse posteriormente en un sistema de recuperación, aprovechando el procesamiento local para datos sensibles.
- Corrección de escaneos rotados: el módulo de orientación permite normalizar páginas antes del reconocimiento, reduciendo errores en digitalizaciones de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse sobre MLX en Apple Silicon, utiliza memoria unificada del sistema en lugar de VRAM dedicada; el consumo concreto no se documenta.
- GPU recomendadas: Apple Silicon (serie M) con soporte MLX. No se especifican modelos mínimos ni generaciones concretas.
- Compatibilidad con GPU de consumo: el modelo está diseñado específicamente para GPU integradas de Apple Silicon; no se indica soporte para GPU NVIDIA o AMD en esta conversión.
- Opciones de despliegue: MLX (librería Python) y MlxOCRKit (librería Swift) mediante el comando `minerukit --tier indra --indra-model /path/to/indra-ocr-mlx input.pdf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indra-ocr-mlx (esta ficha) | Conversión MLX de pipeline OCR | 11 idiomas (en, fr, de, es, it, pt, nl, zh, ja, ko, ar) | `*.mlxonnx` + safetensors | OpenRAIL-M | HuggingFace, 0 descargas |
| datalab-to/indra-ocr | Pipeline OCR original | 11 idiomas (heredados) | ONNX + `.npz` (LM n-grama) | OpenRAIL-M | HuggingFace (modelo base) |
| Tesseract OCR | Motor OCR clásico | Amplio (según modelos de idioma) | Pesos propios | Apache 2.0 | Muy extendido |
| PaddleOCR | Pipeline OCR deep learning | Amplio | Paddle / ONNX | Apache 2.0 | Muy extendido |

La comparación con Tesseract y PaddleOCR es orientativa por categoría (OCR open source); no se dispone de datos de rendimiento comparativo en la información proporcionada. La diferencia principal de esta conversión frente al modelo base es el backend de ejecución (MLX frente a ONNX Runtime) y la omisión de los modelos de lenguaje n-grama.

## Limitaciones y advertencias

- Licencia OpenRAIL-M (AI Pubs Open RAIL-M License, Modified): las restricciones de uso del Anexo A se heredan de `datalab-to/indra-ocr` y se aplican tanto a esta conversión como a cualquier trabajo derivado. Es imprescindible revisar el archivo `LICENSE` antes de un uso comercial.
- El código que carga el modelo no está cubierto por OpenRAIL-M; la licencia aplica a los pesos y derivados.
- Los modelos de lenguaje n-grama originales (`.npz`) no se incluyen; el decoder MLX-Swift solo usa los grafos y `meta.json`, por lo que el comportamiento puede diferir del pipeline original en la corrección lingüística.
- No se documentan sesgos conocidos, tasas de alucinación ni métricas de precisión por idioma.
- El soporte multilingüe se declara a nivel de etiquetas; no se especifica la cobertura real ni la calidad por escritura.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado y posible falta de mantenimiento.
- Dependencia de Apple Silicon y MLX: no es portable a otros backends sin reconversión.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están completamente subidos o que la medición no está actualizada; conviene verificar la integridad de los archivos antes de usarlo en producción.
- No apto para tareas de generación de texto, razonamiento o agentes; su alcance es exclusivamente OCR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigbigbei/indra-ocr-mlx
- Modelo base: https://huggingface.co/datalab-to/indra-ocr
- MLX (framework): https://github.com/ml-explore/mlx
- MlxOCRKit (librería Swift): https://github.com/playstonex/MinerUKit
- Datalab (autor original): https://datalab.to
