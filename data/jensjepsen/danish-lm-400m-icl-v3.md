# jensjepsen/danish-lm-400m-icl-v3

## Resumen

El modelo `jensjepsen/danish-lm-400m-icl-v3` es un modelo de lenguaje de 414 millones de parámetros, desarrollado por jensjepsen, especializado en **inducción de esquema y formato en contexto** (in-context learning, ICL). A diferencia de un modelo de instrucciones convencional, este modelo recibe una serie de ejemplos resueltos dentro de un único turno de usuario y, sin ninguna instrucción explícita, infiere tanto la estructura de salida (esquema JSON, etiquetas, pares clave-valor, etc.) como el formato de renderizado, aplicándolos después a un pasaje nuevo. Está entrenado exclusivamente en danés y se basa en el checkpoint `jensjepsen/danish-lm-400m-sft-v31-avg-top3`, del que hereda la arquitectura Llama.

El modelo destaca por su capacidad de generalizar a esquemas no vistos durante el entrenamiento, alcanzando un 41,5 % de coincidencia exacta en esquemas nuevos frente al 0 % del modelo base. Su relevancia radica en que permite extraer información estructurada de texto danés sin necesidad de ajustar un modelo por cada tarea, simplemente proporcionando unos pocos ejemplos en el prompt. Está pensado para desarrolladores que necesitan parsing de salidas estructuradas en danés con un coste computacional bajo (0,4B parámetros) y una licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 414.707.712 (0,4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con secuencias de 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer decoder-only estilo Llama, con 414,7M de parámetros. El entrenamiento parte del checkpoint `jensjepsen/danish-lm-400m-sft-v31-avg-top3`, que ya había sido sometido a un ajuste fino supervisado (SFT) sobre una mezcla de fuentes. Para esta versión ICL, se utilizó el dataset `jensjepsen/danish-icl-json-v3` con 33.933 filas, exclusivamente de ejemplos de aprendizaje en contexto (sin datos "ballast" de tareas generales). El ajuste se realizó durante 3 épocas, con 3.024 pasos, tamaño de lote efectivo de 32 (16×2), tasa de aprendizaje constante de 1e-5 con 50 pasos de calentamiento, y optimizador AdamW en 8 bits. La longitud de secuencia fue de 3072 tokens, con atención flash (FlashAttention 2) y empaquetado de secuencias variables. El entrenamiento tomó 1.208 segundos en una única RTX 5090.

La innovación principal es el **symbol-tuning**: el modelo aprende a mapear las demostraciones de entrada a la salida estructurada sin depender de la semántica de los nombres de campo. Los experimentos muestran que las claves sin significado (símbolos) obtienen resultados casi idénticos a los nombres daneses reales (76,7 % frente a 78,7 % en validación), lo que confirma que la inferencia del esquema se lee de los ejemplos y no de la semántica de los campos.

## Capacidades

- **Inducción de esquema en contexto**: dado un conjunto de ejemplos en un solo turno de usuario, infiere la estructura de salida (JSON, etiquetas XML-like, pares clave-valor, TSV, etc.) y la aplica a un pasaje nuevo.
- **Inducción de formato en contexto**: infiere el formato de renderizado (delimitadores, separadores) a partir de los ejemplos.
- **Extracción de entidades (NER)**: sin haber sido entrenado explícitamente para NER, alcanza un F1 de 26-31 en el dataset `dane_plus` con 3 ejemplos y sin instrucción, frente al 0-2,4 del modelo base.
- **Parsing de salidas estructuradas**: capaz de producir objetos JSON, etiquetas, pares clave-valor y otros formatos con alta precisión de coincidencia exacta.
- **Multilingüe**: no, está entrenado exclusivamente en danés. No soporta otros idiomas.
- **Tool calling**: no disponible (no se menciona soporte para function calling).
- **Agentes y razonamiento multi-paso**: no es su foco; el modelo está optimizado para tareas de extracción y parsing, no para razonamiento complejo.
- **Modo thinking**: no disponible.

## Casos de uso

- **Extracción de entidades en textos daneses**: por ejemplo, extraer nombres de personas, organizaciones o lugares de noticias o documentos legales. Se proporcionan 2-3 ejemplos etiquetados en el prompt y el modelo devuelve las entidades en el formato indicado, sin necesidad de fine-tuning.
- **Normalización de datos no estructurados**: convertir párrafos de texto (facturas, correos, informes) en estructuras JSON o pares clave-valor, simplemente mostrando un par de ejemplos del formato deseado.
- **Generación de respuestas con formato fijo en chatbots daneses**: dado un historial de conversación con ejemplos de respuestas estructuradas, el modelo produce la siguiente respuesta siguiendo el mismo esquema, útil para asistentes que deben devolver JSON para integraciones.
- **Análisis de documentos legales o administrativos**: extraer campos como fechas, importes, referencias de contratos o sentencias a partir de textos largos, usando ejemplos de un dominio específico.
- **Preprocesamiento para pipelines de datos**: transformar salidas de OCR o transcripciones en formatos tabulares (TSV) o etiquetados para su posterior ingestión en bases de datos, con la ventaja de ajustar el formato cambiando solo los ejemplos del prompt.
- **Prototipado rápido de extractores**: en lugar de entrenar un modelo específico para cada tipo de documento, se puede usar este modelo con pocos ejemplos para validar la viabilidad de una extracción antes de invertir en un modelo dedicado.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en coincidencia exacta del objeto parseado, con decodificación greedy y n=400 por split. Se comparan con el modelo base (`v31`) medido en la misma sesión.

| Split | Base (v31) | danish-lm-400m-icl-v3 |
|---|---|---|
| val (esquemas y formatos vistos, pasajes no vistos) | 0,2 % | **77,8 %** |
| eval_schema (esquemas no vistos) | 0,0 % | **41,5 %** |
| eval_format (formatos no vistos) | 0,0 % | 25,8 % |
| eval_both (esquema y formato no vistos) | 0,0 % | 15,5 % |

Además, se reporta el rendimiento por formato entrenado en esquemas no vistos: numbered 51,7 %, tsv 43,8 %, tagged 43,6 %, kv_colon 41,0 %, json 38,7 %, kv_bracket 36,5 %, kv_arrow 35,5 %. En tareas fuera de distribución (NER con `dane_plus`), alcanza un F1 de 26-31 % frente al 0-2,4 % del base. Los benchmarks generales (GSM8K, citgen) no se mantienen: el modelo cae de 17,0 a 12,5 en GSM8K y de 28,5 a 24,0 en citgen, lo que indica que está especializado en ICL y no es adecuado para tareas generales.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 0,4B parámetros. Con pesos en FP32, ocuparía aproximadamente 1,7 GB (según datos de `llm-explorer` para el modelo base v31); con cuantización de 8 bits o 4 bits, cabría en menos de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM. Se entrenó en una RTX 5090 (32 GB), pero para inferencia basta con una GPU consumer de gama media (RTX 3060, RTX 4060, etc.) o incluso CPU.
- **Compatibilidad con consumer GPU**: sí, cabe en prácticamente cualquier GPU consumer moderna e incluso en modelos de laptop con 4 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo Llama en formato safetensors, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Hugging Face Transformers, TGI o cualquier framework compatible con arquitecturas Llama.
- **Latencia y throughput**: no se han publicado datos específicos. Dado su tamaño, se espera una latencia de decodificación baja (del orden de decenas de tokens por segundo en GPU consumer) y un throughput adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos daneses de tamaño similar. La única comparación disponible es contra el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Rendimiento ICL (val) | Licencia |
|---|---|---|---|---|
| danish-lm-400m-icl-v3 | 0,4B | no disponible | 77,8 % | Apache 2.0 |
| danish-lm-400m-sft-v31-avg-top3 (base) | 0,4B | no disponible | 0,2 % | Apache 2.0 |

Existen otros modelos daneses como `vesteinn/DanskBERT` o `NbAiLab/nb-bert-base` (noruego), pero no son comparables en tarea ni arquitectura. No se han encontrado alternativas específicas de ICL en danés.

## Limitaciones y advertencias

- **Transferencia de formato limitada**: la generalización a formatos no vistos es una sustitución de delimitadores, no una generalización estructural. Por ejemplo, `kv_eq` (un delimitador de distancia de los entrenados) alcanza 78,5 %, pero `bracket_pair` (estructuralmente idéntico al formato `tagged` entrenado) obtiene 0,0 %. Si se necesita un formato específico, hay que entrenarlo explícitamente.
- **Rendimiento fuera de distribución limitado por la capacidad de la tarea**: aunque el modelo puede parsear formatos en tareas nuevas (NER), los errores residuales provienen de la tipificación de entidades, no del formato. No es un modelo generalista.
- **Entrenado solo para ICL**: los benchmarks generales (GSM8K, citgen) caen durante el entrenamiento. No es adecuado para razonamiento matemático, generación de citas u otras tareas generales.
- **Sensible a la estructura del prompt**: los ejemplos deben ir dentro de un único turno de usuario. El modelo falla en escenarios multi-turno few-shot (el modelo base registra una caída de GSM8K de 18,7 % a 2,1 % en ese caso).
- **Idioma**: exclusivamente danés. No soporta otros idiomas, ni siquiera para input en inglés.
- **Sesgos y alucinación**: no se han publicado evaluaciones de sesgos. Como modelo pequeño entrenado en un corpus limitado, puede alucinar en pasajes ambiguos o poco representados.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo no incluye garantías de exactitud ni de idoneidad para producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jensjepsen/danish-lm-400m-icl-v3)
- [Modelo base (v31 avg top3)](https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3)
- [Dataset de entrenamiento ICL](https://huggingface.co/datasets/jensjepsen/danish-icl-json-v3)
- [Versión anterior del modelo base (v5)](https://huggingface.co/jensjepsen/danish-lm-400m-sft-v5)
- [Checkpoint base 310k](https://huggingface.co/jensjepsen/danish-lm-400m-base-ckpt310k)
