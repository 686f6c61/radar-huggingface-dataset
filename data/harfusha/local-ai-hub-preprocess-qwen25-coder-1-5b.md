# Harfusha/local-ai-hub-preprocess-qwen25-coder-1-5b

## Resumen

Harfusha/local-ai-hub-preprocess-qwen25-coder-1-5b es un ajuste fino del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, publicado por el usuario Harfusha. Se trata de un modelo derivado mediante QLoRA sobre el checkpoint base de Qwen (revision 2e1fd397ee46e1388853d2af2c993145b0f1098a), orientado a una tarea muy concreta: el preprocesado de fichas de archivos (file-card preprocessing) dentro del proyecto Local AI Hub. No es un modelo de proposito general, sino un componente especializado de un pipeline.

El modelo se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, pensado para ejecutarse en Ollama o llama.cpp. Conserva la arquitectura transformer decoder-only del Qwen2.5-Coder-1.5B original, con 1.543.714.304 parametros totales y licencia Apache-2.0. El repositorio ocupa aproximadamente 1,0 GB.

Su relevancia es limitada fuera del contexto para el que fue entrenado: no se publican los datos de entrenamiento, los casos de evaluacion ni la model card completa del modelo base. La evaluacion agregada sobre 25 casos retenidos muestra mejoras sustanciales en validez de esquema (0,64 a 1,00) y recall de hechos requeridos (0,04 a 0,50), lo que sugiere que el ajuste cumple su funcion especifica, aunque con un exact match bajo (0,20).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, y se ajusta mediante QLoRA (cuantizacion de 4 bits del modelo base durante el entrenamiento y adaptadores de bajo rango). Posteriormente, el adaptador se fusiona con el modelo base y se convierte a GGUF con cuantizacion Q4_K_M para su uso en Ollama y llama.cpp.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La model card indica explicitamente que no se incluyen archivos fuente, filas del dataset ni casos de evaluacion. La unica innovacion documentada es el propio objetivo del ajuste: la generacion de fichas de archivo estructuradas y conformes a un esquema dentro del pipeline Local AI Hub.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Generacion de codigo y comprension de instrucciones tecnicas (capacidad del modelo base, no verificada en este ajuste).
- Preprocesado de fichas de archivos conforme a un esquema: la tarea principal para la que fue entrenado.
- Salida estructurada con validez de esquema medida en 1,00 sobre el conjunto de evaluacion retenido.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Preprocesado de fichas de modelos en Local AI Hub: el modelo recibe metadatos o descripciones de un archivo y genera una ficha estructurada conforme al esquema del hub. Es su proposito declarado y el escenario donde la evaluacion muestra mejoras (validez de esquema 1,00).
- Normalizacion de metadatos en catalogos internos: util para convertir descripciones heterogeneas en registros con campos obligatorios, gracias al recall de hechos requeridos del 0,50 medido tras el ajuste.
- Generacion de resumenes tecnicos breves en pipelines de documentacion: el modelo puede producir descripciones concisas de artefactos con una latencia media de 9,66 s en el entorno de evaluacion, adecuada para procesos por lotes.
- Extraccion de campos estructurados de texto libre: la mejora en validez de esquema (0,64 a 1,00) lo hace apropiado para tareas de extraccion donde el formato de salida es critico.
- Prototipado local en Ollama: al distribuirse en GGUF Q4_K_M con ~1 GB, puede desplegarse en estaciones de trabajo sin GPU dedicada para pruebas de pipelines de preprocesado.
- Filtrado y enriquecimiento de registros en un ETL: integrable como paso de transformacion que valida y completa fichas antes de su publicacion en el hub.

## Benchmarks y rendimiento

Evaluacion agregada sobre 25 casos retenidos, segun la model card del autor:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Validez de esquema | 0,64 | 1,00 |
| Exact match | 0,00 | 0,20 |
| Recall de hechos requeridos | 0,04 | 0,50 |
| Latencia media | 11,31 s | 9,66 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantizacion Q4_K_M, segun el tamano del repositorio (1,0 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti o superior, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: Ollama y llama.cpp (formatos soportados de forma nativa por el GGUF Q4_K_M); otros runners compatibles con GGUF no estan documentados.
- Latencia y throughput: latencia media de 9,66 s por caso en la evaluacion del autor; no se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Harfusha/local-ai-hub-preprocess-qwen25-coder-1-5b | 1,54 B | no disponible | Apache-2.0 | GGUF Q4_K_M | Ajuste especializado en preprocesado de fichas |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | no disponible en la informacion proporcionada | Apache-2.0 | safetensors, GGUF | Modelo base, proposito general de codigo e instrucciones |
| Otros ajustes QLoRA de Qwen2.5-Coder-1.5B | no disponible | no disponible | variable | variable | No se dispone de datos comparativos |

La comparativa con alternativas de la misma categoria es limitada porque no se han publicado resultados de benchmarks estandar para este ajuste ni para modelos directamente comparables en la informacion disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la tarea de preprocesado de fichas de Local AI Hub no esta evaluado y puede degradarse respecto al modelo base.
- Exact match bajo (0,20) incluso tras el ajuste: no es fiable cuando se requiere una coincidencia exacta con la salida esperada.
- Recall de hechos requeridos del 0,50: la mitad de los hechos obligatorios pueden faltar en la salida, lo que exige validacion posterior en produccion.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; el modelo base Qwen2.5-Coder puede generar contenido plausible pero incorrecto.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; la evaluacion no especifica el idioma de los casos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se desconoce si los datos de ajuste imponen condiciones adicionales (no publicados).
- Evaluacion limitada a 25 casos retenidos: muestra pequena que no permite extrapolar el rendimiento a dominios mas amplios.
- Solo se distribuye en Q4_K_M: no hay versiones en otros formatos o precisiones en el repositorio.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harfusha/local-ai-hub-preprocess-qwen25-coder-1-5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
- Paper de Qwen2.5-Coder: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
