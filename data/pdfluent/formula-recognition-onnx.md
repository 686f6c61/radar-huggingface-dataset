# PDFluent/formula-recognition-onnx

## Resumen

PDFluent formula recognition (ONNX) es un modelo especializado en convertir imágenes recortadas de fórmulas matemáticas en display (las que aparecen centradas en su propia línea) a código LaTeX. Lo desarrolla Innovation Trigger B.V. bajo la marca PDFluent, y su propósito es integrarse en pipelines de procesamiento de documentos PDF, especialmente en flujos de conversión a Markdown y sistemas RAG que necesitan preservar notación matemática. El modelo se distribuye como tres artefactos ONNX independientes (encoder, decoder y vocabulario) y se publica con el nombre interno `formula-own-v1`.

La arquitectura es un encoder-decoder tipo transformer con atención sobre una representación de imagen en escala de grises de 64x768 píxeles y una memoria de 96 posiciones. El decoder genera secuencias de hasta 202 tokens con un vocabulario de 587 entradas. No es un modelo de lenguaje general: es un traductor de imagen a LaTeX de dominio acotado, entrenado específicamente con fórmulas extraídas de artículos de arXiv.

Su relevancia práctica está en que cubre una carencia frecuente en herramientas de extracción de PDF: la mayoría de pipelines OCR pierden o degradan las fórmulas matemáticas. Este modelo, integrado en el SDK de PDFluent, permite recuperar esas fórmulas como LaTeX encerrado en `$$...$$` dentro del Markdown resultante. La contrapartida es una licencia AGPL-3.0 con opción comercial y un rendimiento que el propio autor describe como aproximado, no exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer sobre imagen (ONNX, dos grafos: `encoder.onnx` y `decoder.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 202 tokens de salida (decoder); memoria de 96 posiciones; imagen de entrada 1x1x64x768 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; la salida es LaTeX, no texto natural) |
| Licencia | AGPL-3.0-only o licencia comercial PDFluent |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder recibe una imagen en escala de grises de 64x768 píxeles junto con su anchura real y produce una memoria de 96 posiciones con su máscara correspondiente. El decoder es autorregresivo: recibe los tokens generados hasta el momento (hasta 202) junto con la memoria del encoder y emite logits sobre un vocabulario de 587 tokens. La decodificación recomendada es greedy, partiendo de `<bos>` (id 1) hasta `<eos>` (id 2), mapeando los ids a tokens LaTeX mediante `vocab.json`. El preprocesado de imagen y el bucle de decodificación no forman parte de los grafos ONNX: están implementados en el SDK de PDFluent.

Los datos de entrenamiento provienen de artículos de arXiv con licencias CC BY 4.0 y CC0 1.0, excluyendo explícitamente CC BY-SA. Las fórmulas se recortaron a partir de ground truth alineado, se re-renderizaron con fuentes abiertas y se degradaron para parecerse a escaneos. El repositorio incluye un fichero `PROVENANCE.md` con la lista completa de artículos (licencia, título, autores y URL) que sirve además como lista de atribución CC BY, y un fichero `SHA256SUMS` con los digests de los tres artefactos. Los artículos de evaluación fueron separados y no se usaron en entrenamiento. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de este tipo).

## Capacidades

- Reconocimiento de fórmulas matemáticas en display a partir de un recorte de imagen, con salida en LaTeX.
- Entrada en escala de grises con anchura variable (hasta 768 píxeles de representación fija).
- Generación de secuencias LaTeX de hasta 202 tokens.
- Integración nativa en el SDK de PDFluent para conversión de PDF a Markdown, envolviendo la salida en `$$...$$`.
- Uso directo con `onnxruntime` cargando los tres ficheros y gestionando el bucle de decodificación manualmente.
- No soporta tool calling, function calling, agentes, visión general, audio ni razonamiento multi-paso.
- No procesa fórmulas inline: solo display.
- No realiza detección de layout: requiere un recorte ajustado de una única fórmula, labor que asume el SDK.

## Casos de uso

- Conversión de PDF científico a Markdown: integrado en `pdfluent.open(...).extract_markdown(formula_model=True)`, permite que un artículo con ecuaciones se exporte a Markdown conservando las fórmulas como bloques `$$...$$`, listos para renderizar en un visor o en un generador de documentación.
- Construcción de bases de conocimiento para RAG sobre literatura técnica: al preservar el LaTeX de las ecuaciones, los fragmentos indexados mantienen la notación matemática y el sistema de recuperación puede responder consultas que dependan de fórmulas concretas.
- Digitalización de material docente y apuntes: a partir de escaneos de hojas de ejercicios o transparencias, el modelo recupera las fórmulas para reconstruir el documento en formato editable.
- Enriquecimiento de pipelines OCR existentes: cuando un OCR general detecta una región como fórmula, se puede delegar el recorte a este modelo para obtener LaTeX en lugar de texto corrupto.
- Preprocesado para motores de búsqueda académica: indexar el LaTeX de las fórmulas permite búsquedas por notación y comparaciones entre expresiones equivalentes.
- Automatización de revisión de manuscritos: extraer las fórmulas de un PDF enviado y compararlas con las de la fuente original para detectar discrepancias de composición.
- Migración de documentación técnica heredada: convertir manuales en PDF con ecuaciones a Markdown para repositorios Git o wikis internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (ni exact-match, ni BLEU, ni tasas de error) sobre el conjunto de evaluación separado, y el autor se limita a advertir que la mayoría de fórmulas no se reproducen con exactitud.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.0 GB según HuggingFace, lo que sugiere artefactos muy pequeños, pero no se publica el número de parámetros ni el peso exacto de los ficheros ONNX.
- GPU recomendadas: no disponible. Por la magnitud de la entrada (64x768) y la memoria de 96 posiciones, es previsible que quepa en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; la ejecución con `onnxruntime` en CPU es viable por la naturaleza del modelo, aunque no se documenta latencia.
- Opciones de despliegue: `onnxruntime` (Python) con los tres ficheros; SDK de PDFluent 1.3.0 o superior (`pip install pdfluent`, `pdfluent models install formula`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de reconocimiento de fórmulas (como los basados en TrOCR o en arquitecturas Pix2Text), por lo que no es posible establecer una comparación cuantitativa fiable. A continuación se recogen únicamente los rasgos diferenciales conocidos de este modelo frente al enfoque genérico:

| Aspecto | PDFluent formula-recognition | Alternativas genéricas de image-to-text |
|---|---|---|
| Dominio | Fórmulas display a LaTeX | Texto general / OCR |
| Formato | ONNX (encoder + decoder + vocab) | Safetensors, GGUF u otros |
| Contexto de salida | 202 tokens | Variable, habitualmente mayor |
| Licencia | AGPL-3.0 o comercial | Variable (MIT, Apache-2.0, etc.) |
| Integración | SDK PDFluent | Ecosistema transformers / OCR |

## Limitaciones y advertencias

- El propio autor indica que la mayoría de las fórmulas no se reproducen con exactitud; es una herramienta de aproximación, no de transcripción fiel.
- Errores probables con notación poco frecuente, fuentes inusuales y escaneos de baja calidad.
- Solo procesa fórmulas en display; no reconoce fórmulas inline.
- Requiere un recorte ajustado de una única fórmula: la detección de layout corre a cargo del SDK, no del modelo.
- El modelo está desactivado por defecto en el SDK y debe habilitarse explícitamente.
- Licencia AGPL-3.0: el uso comercial sin cumplir las obligaciones de la AGPL requiere la licencia comercial de PDFluent (https://pdfluent.com/license).
- El idioma declarado es inglés, aunque la salida es LaTeX y por tanto independiente del idioma natural; aun así, el entrenamiento se limita a artículos de arXiv en inglés.
- No se documentan sesgos específicos, pero al entrenar solo con arXiv el modelo puede estar sesgado hacia la notación y convenciones de esa fuente.
- Riesgo de alucinación en la notación: el decoder puede generar LaTeX sintácticamente válido pero semánticamente incorrecto respecto a la imagen.
- Sin métricas publicadas, no es posible estimar la tasa de error esperada en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PDFluent/formula-recognition-onnx
- Web de PDFluent: https://pdfluent.com
- Documentación: https://pdfluent.com/docs
- Licencia: https://pdfluent.com/license
- SDK y releases: https://github.com/pdfluent/pdfluent-sdk
- Organización en HuggingFace: https://huggingface.co/PDFluent
- Clasificador de nivel de encabezados: https://huggingface.co/PDFluent/pdf-heading-level-classifier
- Dataset de layout ground-truth: https://huggingface.co/datasets/PDFluent/pdf-document-layout-ground-truth
- Provenance (en el repositorio): PROVENANCE.md
- Digests de pesos (en el repositorio): SHA256SUMS
