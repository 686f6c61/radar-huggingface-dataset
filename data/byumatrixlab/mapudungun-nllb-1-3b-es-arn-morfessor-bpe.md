# byumatrixlab/mapudungun-nllb-1.3B-es-arn-morfessor-bpe

## Resumen

El modelo `mapudungun-nllb-1.3B-es-arn-morfessor-bpe` es un ajuste fino de `facebook/nllb-200-distilled-1.3B` especializado en traducción del español al mapudungun (código ISO `arn`), una lengua indígena de Chile con recursos digitales muy limitados. Lo desarrolla el grupo byumatrixlab y forma parte del trabajo presentado en AmericasNLP 2026 sobre tokenización consciente de la morfología para el ajuste de NLLB-200 en lenguas de bajos recursos.

La innovación principal no está en la arquitectura, que es la del transformer encoder-decoder de NLLB-200 destilado con 1.370.637.312 parámetros, sino en el preprocesamiento: se aplica segmentación Morfessor seguida de SentencePiece BPE dentro de cada morfema, lo que permite al modelo manejar mejor la naturaleza aglutinante del mapudungun. El checkpoint corresponde a la era del paper y reporta un chrF++ medio a nivel de frase de 41,25 para esta condición, tamaño y dirección.

Es relevante porque demuestra que técnicas de tokenización morfológica pueden mejorar sustancialmente la traducción automática en lenguas de bajos recursos, un campo donde los modelos multilingües genéricos rinden mal. El modelo está pensado para investigación y preservación lingüística, con restricciones de licencia derivadas tanto del modelo base como del corpus de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de NLLB-200 distilled 1.3B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | nllb-and-corpus-derived-terms (CC-BY-NC 4.0 del base + CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder multilingüe destilado de la familia NLLB-200. Sobre ese checkpoint se realiza un ajuste fino supervisado para la dirección español a mapudungun. La particularidad técnica es el pipeline de tokenización: segmentación morfológica con Morfessor seguida de SentencePiece BPE aplicado dentro de cada morfema, en lugar de BPE sobre la cadena completa. Este esquema busca alinear las unidades subword con los morfemas reales de una lengua aglutinante, reduciendo la fragmentación excesiva de palabras.

El corpus de ajuste deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el checkpoint es de la era del paper y que el pipeline corregido reporta chrF++ medio a nivel de frase de 41,25 para esta condición.

## Capacidades

- Traducción automática del español al mapudungun (dirección es a arn).
- Preprocesamiento específico de mapudungun en inferencia: el script auxiliar aplica la tokenización por condición y elimina los marcadores de continuación `@@` de la salida.
- Hereda del modelo base NLLB-200 la arquitectura multilingüe, aunque el ajuste fino está orientado a la pareja es-arn.
- Requiere Transformers 4.x para su uso.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades especiales adicionales.

## Casos de uso

- Traducción de documentación oficial y materiales administrativos al mapudungun: el modelo puede traducir textos del español a esta lengua para programas de inclusión lingüística, aprovechando el pipeline de tokenización morfológica que mejora el manejo de palabras aglutinantes.
- Preservación y revitalización lingüística: investigadores y comunidades mapuche pueden usar el modelo para generar versiones en mapudungun de materiales educativos, cuentos o contenidos culturales, con revisión humana posterior dada la naturaleza de bajos recursos del par.
- Subtitulado y localización de contenido audiovisual: traducción de guiones y subtítulos del español al mapudungun para medios comunitarios o plataformas de contenido indígena.
- Investigación en traducción automática de bajos recursos: el checkpoint sirve como referencia reproducible para estudiar el impacto de la tokenización Morfessor-BPE frente a BPE estándar en lenguas aglutinantes.
- Atención al ciudadano en contextos bilingües: traducción de formularios, avisos y preguntas frecuentes para servicios públicos dirigidos a hablantes de mapudungun.
- Generación de corpus paralelos aumentados: uso del modelo para producir traducciones preliminares que, tras corrección por hablantes nativos, amplíen los recursos disponibles para futuros entrenamientos.
- Herramientas de aprendizaje de la lengua: apoyo a la docencia del mapudungun mediante traducción de ejemplos y ejercicios desde el español.

## Benchmarks y rendimiento

| Metrica | Valor | Condicion |
|---|---|---|
| chrF++ medio a nivel de frase | 41,25 | Dirección es a arn, tamaño 1.3B, tokenización Morfessor-BPE |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,5 GB solo para pesos, más overhead de activaciones y memoria del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 2,8 GB para pesos, más overhead; en la práctica se recomienda al menos 6-8 GB para inferencia cómoda.
- GPU recomendadas: A100, H100 o L4 para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16; en cuantización de 8 bits o 4 bits podría caber en GPUs de 4-6 GB, aunque la cuantización no está documentada por el autor.
- Opciones de despliegue: el autor proporciona `inference.py` con Transformers 4.x; también es compatible con frameworks de servicio como TGI o vLLM, aunque no se documenta explícitamente su soporte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-es-arn-morfessor-bpe | 1.370.637.312 | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Ajuste fino con tokenización Morfessor-BPE |
| facebook/nllb-200-distilled-1.3B | 1.3B (aprox.) | no disponible en esta ficha | 200 idiomas | CC-BY-NC 4.0 | Modelo base multilingüe destilado |
| NLLB-200 (variantes mayores) | 3.3B, 54B | no disponible en esta ficha | 200 idiomas | CC-BY-NC 4.0 | Modelos multilingües de mayor tamaño |

La comparativa con alternativas específicas para mapudungun no está disponible en la información proporcionada. El principal punto de comparación es el modelo base sin ajustar, sobre el que este checkpoint mejora mediante tokenización morfológica y ajuste supervisado.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste es CC BY-NC-SA 3.0; el uso comercial queda excluido salvo cumplimiento de ambas licencias, que el autor declara como `other`.
- Riesgo de alucinación y traducciones inexactas: al tratarse de un par de bajos recursos, la calidad puede degradarse en dominios alejados del corpus de entrenamiento.
- Sesgos del corpus: el modelo hereda los sesgos presentes en el corpus de Duan et al. y en NLLB-200, incluyendo posibles sesgos culturales y de representación.
- Limitaciones de idioma: solo se documentan arn y es; no se garantiza un comportamiento correcto en otras lenguas pese a la base multilingüe.
- Longitud de contexto no documentada: no se especifica en la información disponible, lo que dificulta planificar el despliegue con textos largos.
- Requiere preprocesamiento específico: el uso correcto exige aplicar la tokenización por condición y eliminar los marcadores `@@`; omitirlo degrada la calidad de la salida.
- Checkpoint de la era del paper: puede no reflejar mejoras posteriores del pipeline.
- Recomendación de revisión humana: para producción o publicación, conviene validar las traducciones con hablantes nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-es-arn-morfessor-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia: Thompson, Rogers y Ringger (2026), "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (enlace directo no disponible en la información proporcionada).
- Repositorio del autor: no disponible en la información proporcionada.
