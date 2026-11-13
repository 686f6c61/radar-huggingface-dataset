# ibm-research/llmon-span-tagger

## Resumen

llmon-span-tagger es un modelo de clasificación de tokens de 149 millones de parámetros desarrollado por IBM Research, obtenido mediante fine-tuning de ModernBERT-base. Su función es segmentar un prompt en lenguaje natural en spans tipados —instrucción, restricción y datos— para poder renderizarlo como marcado LLMON (LLM Object Notation). El modelo etiqueta cada token con un esquema BIO de siete etiquetas y decodifica los spans a partir de secuencias de etiquetas, de modo que los límites no dependen de la puntuación y pueden partir una misma frase.

El modelo resuelve un problema concreto de ingeniería de prompts: convertir prompts existentes, bibliotecas de prompts o datasets de instrucciones al formato estructurado LLMON que consumen modelos entrenados para ello, como Granite-4.1-3B-LLMON. Es el backend por defecto del segmentador `lang.unstructured_text` en el repositorio LLMON de IBM, y está pensado para prompts cuyo autor se considera fiable, no como control de seguridad.

Su relevancia es doble: por un lado, ofrece una vía automatizada para migrar prompts a un formato nativo del LLM con estructura y semántica explícitas; por otro, sirve como herramienta de inspección y depuración de la estructura interna de un prompt. Está limitado al inglés y a prompts de hasta 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza lineal de clasificación de tokens |
| Parametros totales | 149 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de encoder + cabeza lineal separada) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer, y añade una cabeza lineal de clasificación de tokens con siete etiquetas BIO: `O` y `B-`/`I-` para las clases `instruction`, `constraint` y `data`. La decodificación agrupa secuencias de etiquetas en spans planos y no solapados; los tokens sin etiqueta (`O`) corresponden a espacios entre spans y puntuación final.

Las anotaciones de entrenamiento son anidadas (el caso más frecuente es una restricción dentro de una instrucción) y cada token se entrena con su span más interno, lo que permite al modelo cortar dentro de una misma frase. La taxonomía de anotación colapsa varias categorías originales: `constraint` agrupa Constraint, Output Format, Example y Role; `data` agrupa Content, Structured Data, Quoted Content y Context. El número de tokens de entrenamiento, la composición exacta del dataset y si hubo RLHF o DPO no se detallan en la información disponible.

## Capacidades

- Segmentación de prompts en spans tipados de instrucción, restricción y datos.
- Etiquetado BIO a nivel de token con límites de span independientes de la puntuación.
- Detección de spans anidados mediante entrenamiento sobre el span más interno.
- Salida con confianza por span (media de las probabilidades máximas por token) y bandera `requires_review` cuando la confianza es inferior a 0,60.
- Renderizado de los spans a LLMON y a formato Shorthand legible.
- Interfaz de línea de comandos (`llmon-segment`) en modos de una pasada y REPL interactivo.
- Integración con la librería `llmon` como backend por defecto de `lang.unstructured_text`.
- Sin capacidades de generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de clasificación de tokens.

## Casos de uso

- Migración de bibliotecas de prompts a LLMON: el modelo procesa cada prompt en texto plano y produce los spans necesarios para renderizarlo como marcado LLMON que consumen modelos como Granite-4.1-3B-LLMON.
- Conversión de datasets de instrucciones: permite etiquetar de forma masiva corpus de instrucciones existentes y generar versiones estructuradas para entrenamiento o evaluación de modelos nativos de LLMON.
- Depuración e inspección de prompts: el desglose en instrucción, restricción y datos con niveles de confianza ayuda a identificar restricciones mal formuladas o datos mezclados con la tarea.
- Herramienta educativa sobre estructura de prompts: útil para enseñar LLMON mostrando cómo se descompone un prompt real en sus componentes tipados.
- Preprocesado en pipelines de ingeniería de prompts: puede insertarse como etapa previa que normaliza prompts de entrada antes de enviarlos a un modelo compatible con LLMON.
- Investigación sobre segmentación instrucción/restricción: sirve como baseline o componente en estudios sobre estructura de prompts y anotación BIO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas de F1, precisión y recall como campos de metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP16 para los 149 M de parámetros, más el overhead de activaciones; el repositorio ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la vía recomendada es la librería `llmon` (`pip install "llmon[unstructured-text]"`) o la CLI `llmon-segment`. El checkpoint no es un `AutoModelForTokenClassification` estándar, por lo que `pipeline("token-classification")` de transformers no lo carga; existe un snippet independiente con `transformers` que produce etiquetas por token sin el postprocesado oficial.
- Latencia y throughput: no se documentan cifras concretas. Por el tamaño del modelo y el límite de 2.048 tokens, se espera latencia de milisegundos por prompt en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de prompts ni resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un control de seguridad: no debe usarse para decidir qué partes de una entrada no fiable son de confianza.
- Solo admite inglés; no está pensado para otros idiomas.
- Límite de 2.048 tokens por prompt; los prompts más largos quedan fuera de alcance.
- No es un modelo de etiquetado de entidades nombradas ni de documentos de propósito general.
- Diseñado para prompts cuyo autor se considera fiable.
- Riesgo de alucinación de spans: al ser un clasificador, puede asignar etiquetas incorrectas o fragmentar spans; la bandera `requires_review` (confianza < 0,60) ayuda a detectarlo, pero no lo elimina.
- Los límites de span dependen de la calidad de la anotación de entrenamiento; el colapso de categorías en tres clases puede perder matices de la taxonomía original.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base ModernBERT-base y del ecosistema LLMON.
- El snippet con `transformers` puro produce spans más fragmentados que `segment()`, ya que no aplica el postprocesado oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-research/llmon-span-tagger
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio GitHub LLMON: https://github.com/generative-computing/llmon
- Código del segmentador: https://github.com/generative-computing/llmon/tree/main/llmon/lang/unstructured_text
- Guía de anotación: https://github.com/generative-computing/llmon/blob/main/llmon/lang/unstructured_text/docs/guidelines.html
- Paper LLMON: https://arxiv.org/abs/2603.22519
- Modelo Granite-4.1-3B-LLMON: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
