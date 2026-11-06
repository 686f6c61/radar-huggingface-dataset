# daominhwysi/sealior-modernbert-vi-exam-seq-labeling

## Resumen

`sealior-modernbert-vi-exam-seq-labeling` es un modelo de etiquetado de secuencias (token classification) desarrollado por el usuario `daominhwysi` y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning del encoder `aisingapore/SEA-LION-ModernBERT-300M` orientado a la extracción estructural de exámenes educativos vietnamitas de secundaria y bachillerato (grados 8 a 12) en asignaturas como matemáticas, física, química, biología, historia, geografía, literatura e inglés.

El modelo resuelve un problema concreto de ingeniería de datos educativos: convertir documentos de examen en bruto (escaneados o digitales) en una representación XML estructurada, identificando etiquetas de pregunta, enunciados, opciones de respuesta, textos de estímulo, cabeceras de sección y explicaciones. Frente a alternativas generativas, emplea etiquetado BIO a nivel de token, lo que garantiza que el texto de salida sea siempre una subcadena exacta de la entrada (la llamada "Zero Character Mutation guarantee"), sin riesgo de alucinación textual.

Con 312,8 millones de parámetros, una ventana de contexto de hasta 8192 tokens en el encoder base y un entrenamiento con ventanas dinámicas de 768 a 2048 tokens, el modelo se posiciona como una herramienta de producción ligera para pipelines de parseo de exámenes, no como un modelo conversacional. Su relevancia actual radica en la digitalización masiva de bancos de preguntas educativos y en la necesidad de extracción determinista y auditable en dominios regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabeza `EnhancedBertForTokenClassification` |
| Parametros totales | 312.862.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en el encoder base; entrenado con ventanas dinamicas de 768, 1024, 1536 y 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Etiquetas de entidad | 7 nucleos (QUESTION_LABEL, STEM, OPTION_LABEL, OPTION_TEXT, STIMULUS, SECTION, EXPLANATION) con esquema BIO |
| Modelo base | aisingapore/SEA-LION-ModernBERT-300M |
| Dataset de entrenamiento | daominhwysi/sequence-labelling-vi-exam-v3 |
| Tamano del repositorio | 45,1 GB |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo parte de `SEA-LION-ModernBERT-300M`, un encoder ModernBERT multilingue de 300M de parametros con atencion flash sin padding y contexto maximo de 8192 tokens. Sobre el encoder se anade una cabeza de clasificacion denominada `EnhancedBertForTokenClassification`, que incorpora tres componentes diferenciados: un `SigmoidWeightedLayerPooling` que combina las salidas de cuatro capas mediante compuertas sigmoideas en lugar de un softmax competitivo; una convolucion depthwise 1D con `kernel_size=7` para refinar fronteras locales entre entidades; y Multi-Sample Dropout con tasas `[0.05, 0.10, 0.15, 0.20, 0.25]` para regularizar la cabeza.

El entrenamiento se realizo sobre el dataset `sequence-labelling-vi-exam-v3`, con ventanas dinamicas multi-escala (768, 1024, 1536 y 2048 tokens) y un `LengthGroupedBatchSampler` para agrupar secuencias de longitud similar y mejorar la eficiencia. El checkpoint publicado corresponde a la epoca 6 de 8. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo discriminativo de etiquetado).

La innovacion tecnica mas destacable es la garantia de "Zero Character Mutation": al ser un modelo de etiquetado y no de generacion, la reconstruccion XML envuelve directamente subcadenas del texto de entrada, con un 0% de eliminacion, alteracion o insercion de caracteres. Esto lo hace apto para dominios donde la fidelidad literal del texto es un requisito contractual o regulatorio.

## Capacidades

- Etiquetado de secuencias a nivel de token con esquema BIO sobre siete entidades de examen: `QUESTION_LABEL`, `STEM`, `OPTION_LABEL`, `OPTION_TEXT`, `STIMULUS`, `SECTION` y `EXPLANATION`.
- Extraccion estructural de examenes vietnamitas de grados 8 a 12 en matematicas, fisica, quimica, biologia, historia, geografia, literatura e ingles.
- Soporte de preguntas cloze o de relleno, donde `QUESTION_LABEL` precede directamente a `OPTION_LABEL` sin `STEM` explicito.
- Procesamiento de documentos escaneados y digitales, segun declara el autor.
- Reconstruccion XML determinista con garantia de cero mutacion de caracteres.
- Capacidad bilingue vietnamita-ingles, incluyendo textos de comprension lectora en ingles dentro de examenes vietnamitas.
- Manejo de contexto largo (hasta 8192 tokens en el encoder) para passages de estimulo extensos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.

## Casos de uso

- Digitalizacion de bancos de examenes: el modelo convierte PDFs o escaneos de examenes vietnamitas en XML estructurado con preguntas, opciones y estimulos separados, listo para ingesta en bases de datos o sistemas de gestion de aprendizaje (LMS). La garantia de cero mutacion asegura que el texto original no se altere.
- Construccion de plataformas de practica adaptativa: al extraer `STEM`, `OPTION_TEXT` y `EXPLANATION` por separado, se pueden generar bancos de preguntas con solucionario y etiquetado por asignatura y dificultad, alimentando motores de recomendacion.
- Evaluacion automatica y correccion: la separacion limpia entre enunciado y opciones permite mapear respuestas de alumnos a opciones canonicas sin ambiguedad, incluso en examenes con formato cloze.
- Extraccion de passages de comprension lectora: la entidad `STIMULUS` aísla el texto compartido por varias preguntas, lo que facilita la reutilizacion de passages en nuevos examenes o su indexacion semantica.
- Migracion de examenes legacy: pipelines que necesitan convertir examenes en papel escaneados a formato digital estructurado, con contexto de hasta 2048 tokens por ventana de entrenamiento para cubrir secciones completas.
- Analisis curricular y auditoria: la entidad `SECTION` y `EXPLANATION` permite reconstruir la estructura de secciones y soluciones, util para detectar cambios curriculares o auditar la cobertura de temario por asignatura.
- Preprocesamiento para modelos generativos: el XML estructurado sirve como entrada limpia y determinista a un LLM posterior que genere variantes de preguntas o traducciones, reduciendo el riesgo de propagar errores de extraccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de validacion del dataset `daominhwysi/sequence-labelling-vi-exam-v3`. El autor menciona ademas una evaluacion sobre un "Gold Benchmark" de 51 documentos reales y aproximadamente 458k tokens, con los mismos valores.

| Metrica | Valor |
|---|---|
| Validation Macro F1 | 86,55% |
| Validation Precision | 85,84% |
| Validation Recall | 87,27% |
| Validation Micro F1 | 86,55% |

No se han publicado resultados comparativos con otros modelos de etiquetado de examenes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,25 GB solo para pesos (312,8M parametros x 4 bytes), mas activaciones y overhead del tokenizer; en la practica, entre 2 y 4 GB con batches pequenos.
- En fp16/bf16: aproximadamente 0,63 GB para pesos; cabe holgadamente en cualquier GPU consumer con 8 GB o mas.
- En cuantizacion int8 (si estuviera disponible, no confirmada): alrededor de 0,31 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia comoda (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para batches grandes con secuencias de 2048 tokens, se recomienda 16 GB o mas.
- Cabe en GPU consumer: si, en RTX 3060/4060/4070/4080/4090 y equivalentes.
- Opciones de despliegue: al ser un modelo de `transformers` con cabeza personalizada (`EnhancedBertForTokenClassification`), requiere cargar codigo propio del repositorio; no es directamente compatible con llama.cpp u Ollama (no es un modelo generativo ni GGUF). Puede servirse con Hugging Face `transformers` + FastAPI/TorchServe, o potencialmente con TGI si se exporta correctamente, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del encoder, se espera inferencia en decenas de milisegundos por secuencia de 512 tokens en GPU moderna, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales frente a alternativas plausibles de la misma categoria (etiquetado de secuencias o extraccion de examenes).

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sealior-modernbert-vi-exam-seq-labeling | 312,8M | 8192 (encoder base; entrenado hasta 2048) | Token classification de examenes vietnamitas | Apache 2.0 | Hugging Face |
| aisingapore/SEA-LION-ModernBERT-300M (base) | ~300M | 8192 | Encoder multilingue (no especializado) | no disponible en esta ficha | Hugging Face |
| BERT-base multilingue | 178M | 512 | Token classification generico | Apache 2.0 | Hugging Face |
| XLM-RoBERTa-base | 278M | 512 | Token classification multilingue | MIT | Hugging Face |

La ventaja diferencial frente a encoders genericos es la cabeza especializada, el contexto de entrenamiento mas largo y el esquema de entidades especifico de examenes; la desventaja es la ausencia de benchmarks publicos contra alternativas y el reducido numero de descargas (128) que sugiere poca validacion externa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre examenes vietnamitas de grados 8 a 12, el rendimiento fuera de ese dominio (universidad, formacion profesional, otros paises) es incierto.
- Riesgo de alucinacion: bajo en el sentido textual (garantia de cero mutacion de caracteres), pero puede asignar etiquetas erroneas a tokens ambiguos, especialmente en fronteras entre `STEM` y `OPTION_TEXT` o en preguntas cloze mal formateadas.
- Limitaciones de contexto: aunque el encoder soporta 8192 tokens, el entrenamiento uso ventanas de hasta 2048; secuencias mas largas pueden degradar la calidad.
- Limitaciones de idioma: solo vietnamita e ingles; no se garantiza comportamiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `SEA-LION-ModernBERT-300M` puede tener condiciones adicionales que deben verificarse en su propia model card.
- Caveat de produccion: la cabeza personalizada requiere cargar codigo del repositorio (`model.module.head`, `model.inference.predict`), lo que anade complejidad de despliegue y riesgo de incompatibilidad con versiones futuras de `transformers`.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index).
- El repositorio pesa 45,1 GB, desproporcionado para 312,8M de parametros, lo que sugiere la presencia de multiples checkpoints o artefactos adicionales; conviene revisar los archivos antes de descargar.
- El modelo no es generativo: no puede producir texto nuevo, responder preguntas ni mantener conversaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daominhwysi/sealior-modernbert-vi-exam-seq-labeling
- Modelo base: https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M
- Dataset de entrenamiento: https://huggingface.co/datasets/daominhwysi/sequence-labelling-vi-exam-v3
- Perfil del autor: https://huggingface.co/daominhwysi
