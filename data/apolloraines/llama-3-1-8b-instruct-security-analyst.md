# ApolloRaines/Llama-3.1-8B-Instruct-Security-Analyst

## Resumen

Llama-3.1-8B-Instruct-Security-Analyst es una variante del modelo base Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. jBlaze aplica una técnica denominada "cirugía conductual" (behavioral surgery) que altera directamente los pesos del modelo para amplificar o suprimir comportamientos específicos, sin necesidad de fine-tuning ni entrenamiento adicional. El resultado es un modelo especializado en análisis de seguridad de código y vulnerabilidades, con énfasis en razonamiento causal, fidelidad al contexto y profundidad analítica.

La modificación incluye la eliminación de rechazos (abliteration) en ciertos dominios, lo que permite al modelo responder a consultas que el modelo base rechazaría, como técnicas de pentesting o explotación. Sin embargo, conserva algunos rechazos en temas de desinformación o daño físico. El modelo mantiene la arquitectura original de 8.030 millones de parámetros y la licencia Llama 3.1 Community, lo que facilita su uso comercial y de investigación. Su relevancia radica en ofrecer una alternativa ligera y especializada para tareas de ciberseguridad, sin los costes de entrenamiento de un modelo dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (hereda del base, 128k tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (pesos originales en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer autoregresivo con 32 capas, atención multi-cabeza y normalización RMSNorm. No se realizó ningún entrenamiento adicional: jBlaze modifica los pesos mediante técnicas de representation engineering, identificando direcciones en el espacio latente asociadas a comportamientos concretos y amplificándolas o suprimiéndolas. En este caso se amplifican tres direcciones: fidelidad al contexto (ctx_faith), razonamiento causal (causal) y profundidad analítica (analytical). Además, se aplica un proceso de abliteration para eliminar el mecanismo de rechazo en dominios de seguridad, aunque no de forma global.

No se dispone de información sobre el dataset de entrenamiento, ya que no hubo fine-tuning. La herramienta jBlaze es propietaria y no se documentan los detalles técnicos del procedimiento de modificación de pesos.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat nativo de Llama 3.1.
- Analisis de seguridad de codigo: identifica vulnerabilidades, revisa patrones inseguros y sugiere correcciones.
- Razonamiento causal: descompone problemas en pasos logicos y explica el porqué de cada decision.
- Fidelidad al contexto: mantiene coherencia con la informacion proporcionada en la conversacion, reduciendo derivas.
- Profundidad analitica: genera respuestas detalladas y estructuradas, utiles para informes tecnicos.
- Eliminacion selectiva de rechazos: responde a consultas sobre tecnicas de ataque, explotacion o ingenieria inversa que el modelo base rechazaria.
- Capacidades de codigo: genera y explica funciones en Python y otros lenguajes, como se muestra en los ejemplos de salida.
- No se ha confirmado soporte para tool calling, vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Revision de seguridad de codigo en CI/CD: el modelo puede analizar diffs de codigo y senalar posibles vulnerabilidades (inyeccion SQL, XSS, desbordamiento de buffer) antes de fusionar ramas, gracias a su capacidad de razonamiento causal y fidelidad al contexto.
- Pentesting y pruebas de penetracion: permite a profesionales de seguridad consultar tecnicas de explotacion, vectores de ataque y mitigaciones sin las restricciones del modelo base, acelerando la fase de reconocimiento.
- Generacion de informes de vulnerabilidades: dado su estilo analitico, puede redactar descripciones tecnicas detalladas de hallazgos, incluyendo impacto, pasos de reproduccion y recomendaciones.
- Educacion en ciberseguridad: sirve como asistente para estudiantes que necesitan ejemplos reales de codigo inseguro y su correccion, con explicaciones paso a paso.
- Analisis forense de malware: puede ayudar a descompilar y explicar fragmentos de codigo malicioso, identificando funciones sospechosas y su proposito.
- Automatizacion de respuestas en plataformas de bug bounty: el modelo puede pre-clasificar reportes, extraer informacion clave y sugerir prioridades basandose en la severidad tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad especificas. Los unicos ejemplos de salida son cualitativos y no permiten cuantificar el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB (8,03 B parametros × 2 bytes), mas overhead de activaciones y cache KV.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs con al menos 16 GB de VRAM para ejecucion comoda.
- En consumer GPU: cabe en RTX 4090 y RTX 3090 con cuantizacion de 8 bits o 4 bits (GGUF), reduciendo la VRAM a ~8-10 GB.
- Opciones de despliegue: transformers con device_map="auto", vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 8B, se espera un rendimiento similar al Llama-3.1-8B-Instruct base, con ~50-100 tokens/s en una RTX 4090 con cuantizacion 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128k | Llama 3.1 Community | Instruccion general, con rechazos de seguridad |
| Llama-3.1-8B-Instruct-Security-Analyst | 8,03 B | no disponible | Llama 3.1 Community | Seguridad de codigo, sin rechazos en ese dominio |
| Foundation-Sec-8B-Instruct | 8 B | no disponible | open-weights | Ciberseguridad, fine-tuning especifico |

La comparativa con Foundation-Sec-8B-Instruct es relevante porque ambos apuntan al mismo nicho, pero Foundation-Sec se entrena con fine-tuning sobre datos de seguridad, mientras que este modelo usa modificacion directa de pesos. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La eliminacion de rechazos puede generar contenido peligroso si se usa de forma malintencionada; el modelo no tiene salvaguardas para impedir la generacion de exploits funcionales.
- No se ha evaluado la seguridad del modelo frente a jailbreaks o prompts adversariales; la abliteration puede debilitar otros alineamientos.
- El modelo solo soporta ingles; no se ha probado en otros idiomas.
- La longitud de contexto no esta confirmada; aunque el base soporta 128k, la modificacion de pesos podria afectar a la atencion a largo plazo.
- No hay garantias de precision en analisis de seguridad: el modelo puede alucinar vulnerabilidades o sugerir correcciones incorrectas.
- jBlaze es una herramienta propietaria; no se puede reproducir el proceso de modificacion ni auditar su metodologia.
- La licencia Llama 3.1 Community permite uso comercial, pero exige atribucion y cumplimiento de las politicas de Meta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Security-Analyst
- Herramienta jBlaze: https://jblaze.dev
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Foundation-Sec-8B-Instruct (referencia de modelos de seguridad): https://huggingface.co/papers/2508.01059
