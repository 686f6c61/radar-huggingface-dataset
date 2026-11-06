# johahi/onek1k-scooby-2

## Resumen

Onek1k-scooby-2 es un modelo publicado en Hugging Face por el usuario johahi, cuya model card carece de documentación: el README solo contiene la cabecera de licencia (alphagenome-license) y no incluye descripción, instrucciones de uso ni detalles técnicos. El nombre sugiere una relación con el proyecto SCOOBY y con el estudio OneK1K (un cohort de investigación en genética de expresión génica e inmunidad), lo que apunta a un modelo de bioinformática o genómica funcional, en línea con la licencia "alphagenome" (referida a la familia de modelos de predicción genómica de Google DeepMind). No obstante, esta deducción proviene exclusivamente del nombre y de la licencia, no de documentación oficial del autor.

En cuanto a datos verificables, el repositorio pesa 1,4 GB y los pesos en safetensors suman 347.391.108 parámetros, lo que lo sitúa en la gama de modelos medianos-pequeños. La licencia no es estándar (etiquetada como "other" con nombre alphagenome-license), por lo que cualquier uso, especialmente comercial, requiere revisar el archivo LICENSE del repositorio antes de desplegar el modelo.

Dada la ausencia de model card, de resultados de benchmarks y de información sobre arquitectura, entrenamiento o capacidades, esta ficha se limita a los datos objetivos disponibles y señala explícitamente aquello que no se ha publicado. Se recomienda al lector tratar el modelo como experimental, sin mantenimiento documentado y con cero descargas registradas en el momento de redactar la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 347.391.108 (dato real de safetensors) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | alphagenome-license (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El nombre del repositorio sugiere una connection con SCOOBY (una arquitectura de modelo genómico híbrido basada en SSM/transformer presentada en investigación reciente) y con el cohort OneK1K, pero el autor no ha incluido ninguna descripción técnica en la model card, por lo que no es posible confirmar si se trata de un transformer, un modelo de estado de espacio (SSM), un híbrido u otra arquitectura.

Tampoco hay datos sobre el entrenamiento: se desconocen el número de tokens o muestras procesadas, la composición del dataset, el método de optimización y si se aplicaron técnicas de alineación como RLHF o DPO. La licencia alphagenome-license sugiere que el modelo podría derivarse o inspirarse en modelos de predicción genómica tipo AlphaGenome, pero esta hipótesis no está confirmada por el autor y debe tomarse con cautela.

## Capacidades

No se han publicado capacidades en la model card. Por el contexto del nombre y la licencia, es plausible (aunque no confirmado) que el modelo esté orientado a tareas de genómica funcional, como:

- Prediccion de perfiles de expresión génica o efectos reguladores a partir de secuencias de ADN (hipótesis basada en la licencia alphagenome-license y la referencia a OneK1K).
- Análisis de datos ómicos en contextos de investigación biomédica.

No hay evidencia documentada de:

- Generación de texto general, razonamiento o código.
- Soporte de tool calling o function calling.
- Capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües o multimodales (visión, audio).

## Casos de uso

Dada la ausencia de documentación, los siguientes casos de uso son hipotéticos y dependen de que el modelo sea efectivamente un modelo genómico:

- Investigación en genética de la expresión: si el modelo predice efectos reguladores, podría usarse para estudiar variantes genéticas asociadas a enfermedades inmunes, en línea con el cohort OneK1K, que estudia expresión génica en células inmunes.
- Priorización de variantes funcionales: cribado in silico de variantes no codificantes para identificar candidatas en estudios de asociación del genoma completo (GWAS).
- Diseño de experimentos de validación: generación de hipótesis sobre elementos reguladores que posteriormente se validen con ensayos reporter o CRISPR.
- Reproducción de investigación: al ser un repositorio público con pesos descargables, puede servir para replicar o extender resultados de papers relacionados con SCOOBY o AlphaGenome.
- Fine-tuning en dominios ómicos específicos: con ~347 millones de parámetros, el modelo es lo bastante pequeño para ajustarse en una sola GPU de consumo, lo que facilita la adaptación a datasets propios de laboratorio.
- Educación y docencia: modelo ligero para enseñar conceptos de modelos genómicos profundos sin necesidad de infraestructura costosa.

Estos usos deben validarse empíricamente antes de cualquier aplicación seria, dado que no existe documentación sobre el rendimiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 347,4 millones de parámetros en pesos de precisión completa (FP32), el modelo ocupa aproximadamente 1,4 GB de VRAM (coherente con el tamaño del repositorio de 1,4 GB); en FP16/BF16, unos 0,7 GB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 de 12 GB, una RTX 4090 o incluso GPUs integradas con suficiente memoria son más que adecuadas para inferencia.
- Consumer GPU: sí, el modelo cabe con holgura en prácticamente cualquier GPU de consumo actual (6 GB de VRAM o más).
- Opciones de despliegue: al tratarse de un modelo en safetensors sin model card, la carga dependerá de la librería de origen (posiblemente transformers de Hugging Face o librerías específicas de genómica como scvi-tools o custom code del autor). No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que estos están orientados a modelos de lenguaje generales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que ni siquiera está confirmado el tipo exacto de modelo, la comparativa se limita a modelos genómicos de referencia de tamaño similar, a título orientativo:

| Modelo | Parametros | Dominio | Licencia | Documentacion |
|---|---|---|---|---|
| johahi/onek1k-scooby-2 | ~347 M | Genomica (presunto) | alphagenome-license | Ausente |
| Enformer (DeepMind) | ~162 M | Prediccion de expresion genica | No comercial (pesos bajo peticion) | Extensa (paper en Nature Methods) |
| AlphaGenome (DeepMind) | no disponible publicamente | Prediccion genomica multimodal | Licencia restrictiva no comercial | Documentacion y web del proyecto |
| Evo 1 / Evo 2 (Arc Institute) | 7.000 M / 9.800 M+ | Modelos de ADN a nivel de genoma | Licencias abiertas/restringidas segun version | Model card y paper disponibles |

La principal diferencia de onek1k-scooby-2 frente a estas alternativas es la ausencia total de documentación, benchmarks y ejemplos de uso, lo que dificulta evaluar su calidad frente a alternativas mejor documentadas.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no contiene descripcion, instrucciones de uso ni ejemplos; todo uso requiere ingenieria inversa del codigo y los pesos.
- Sin benchmarks publicados: no hay forma de evaluar la calidad del modelo antes de probarlo.
- Cero descargas registradas: no existe evidencia de adopcion ni de validacion por la comunidad.
- Riesgo de alucinacion o error: aplicable en el sentido de predicciones genomicas incorrectas; cualquier resultado debe validarse experimentalmente antes de usarlo en decisiones cientificas o clinicas.
- Licencia no estandar: la alphagenome-license es de tipo "other"; probablemente hereda restricciones no comerciales de la licencia de AlphaGenome de DeepMind. Es imprescindible revisar el archivo LICENSE antes de cualquier uso, y es probable que el uso comercial esté prohibido o restringido.
- Mantenimiento: repositorio personal de un usuario individual (johahi), sin garantía de soporte, actualizaciones ni corrección de errores.
- Idiomas y contexto: no disponibles; no consta si el modelo procesa texto, secuencias genómicas u otro tipo de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johahi/onek1k-scooby-2
- Licencia del modelo: https://huggingface.co/johahi/onek1k-scooby-2/blob/main/LICENSE
- No se han encontrado enlaces adicionales (paper, blog, repositorio de codigo o demo) en la informacion disponible.
