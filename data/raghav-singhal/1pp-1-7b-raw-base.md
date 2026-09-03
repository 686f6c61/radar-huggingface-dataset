# Raghav-Singhal/1pp-1.7b-raw-base

## Resumen

1pp-1.7b-raw-base es un modelo de lenguaje de 1.66 mil millones de parámetros desarrollado por Raghav-Singhal como parte del proyecto One Persona Pretraining (1PP) en el EPFL DLAB. Forma parte de un estudio experimental 3×3 que combina tres tamaños de modelo (0.5B, 1B y 1.7B) con tres condiciones de preentrenamiento sobre el mismo conjunto de 47,8 millones de documentos fuente. Este modelo concreto corresponde a la condición de preentrenamiento con documentos originales sin reescribir, lo que sirve como línea base para comparar con las variantes que reescriben los documentos como conversaciones.

El modelo emplea una arquitectura estilo Llama con 24 capas, atención con cabezas agrupadas (GQA) y una ventana de contexto de 4.096 tokens. Está preentrenado sobre 66.200 millones de tokens de documentos educativos DCLM-edu en inglés, con una sola pasada sobre los datos. Es un modelo base, no un asistente conversacional, y su propósito principal es servir como artefacto de investigación para estudiar cómo la forma de los datos de preentrenamiento afecta al comportamiento del modelo. La licencia Apache 2.0 permite su uso libre, incluido el comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (transformer) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Llama-style de solo decoder con 24 capas, dimension oculta de 2.048, FFN de 8.192 con activacion SwiGLU, 16 cabezas de atencion y 4 cabezas KV (head dim 128), normalizacion RMSNorm, RoPE con base 10.000, embeddings no compartidos, sin sesgos y sin QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) mas el token especial `<|pad|>`, y `<|endoftext|>` marca el final de documento.

El preentrenamiento se realizo sobre los documentos originales de DCLM-edu (condicion raw baseline), con loss sobre todos los tokens del documento y el token de fin de documento. Se procesaron 47,8 millones de documentos (66.200 millones de tokens) en 31.777 pasos con batch global de 512 × 4.096 tokens, enmascaramiento de atencion entre documentos y best-fit packing. El optimizador fue Muon (con Adam para embeddings y normas), learning rate de 0.005 para matrices, warmup de 2.000 pasos, decay lineal en el ultimo 10% hasta 1/100, weight decay 0.1 y precision bf16. La loss de validacion final (por token, sobre 2.433 documentos held-out) fue de 2.396 para texto de documento, 2.488 para texto de asistente y 2.538 para texto de usuario.

## Capacidades

- Generacion de texto en ingles: el modelo produce texto coherente y fluido en ingles, dado que fue preentrenado exclusivamente con documentos educativos en ese idioma.
- Formato de conversacion ChatML: aunque es un modelo base, puede generar texto en formato ChatML sin turno de sistema, siguiendo la plantilla `chat_template` incluida.
- Razonamiento basico: al ser un modelo de 1.7B preentrenado en datos educativos, muestra capacidades limitadas de razonamiento y conocimiento factual, propias de su tamano.
- Procesamiento de contexto largo: soporta hasta 4.096 tokens de contexto, suficiente para documentos de varias paginas o conversaciones multi-turno.
- Sin soporte de tool calling: no se menciona capacidad de function calling ni integracion con herramientas externas.
- Sin capacidades multimodales: el modelo es exclusivamente de texto, sin soporte de vision, audio u otras modalidades.
- Sin modo thinking: no se menciona un modo de razonamiento explicito o cadena de pensamiento especial.

## Casos de uso

- Investigacion academica en NLP: el modelo es un artefacto de investigacion del proyecto 1PP, util para estudiar como la condicion de preentrenamiento (documentos originales vs. conversaciones reescritas) afecta al comportamiento del modelo. Los investigadores pueden comparar este modelo con las variantes conversacionales del mismo tamano.
- Linea base para experimentos de preentrenamiento: sirve como referencia raw para evaluar tecnicas de reescritura de datos, formatos de loss masking o estrategias de entrenamiento en modelos pequenos.
- Generacion de texto educativo: al estar preentrenado con documentos DCLM-edu, puede generar contenido educativo en ingles sobre temas cientificos y tecnicos, aunque con las limitaciones propias de un modelo de 1.7B.
- Prototipado rapido de aplicaciones de texto: su tamano reducido permite desplegarlo en hardware modesto para probar pipelines de generacion de texto, chatbots simples o sistemas de Q&A antes de escalar a modelos mayores.
- Estudio de scaling laws: junto con los modelos de 0.5B y 1B del mismo proyecto, permite analizar como escalan las metricas de loss y calidad con el tamano del modelo bajo condiciones de datos controladas.
- Evaluacion de tecnicas de alineacion: al ser un modelo base sin fine-tuning, es un punto de partida para experimentos de SFT, RLHF o DPO en un entorno controlado y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la loss de validacion por token sobre documentos held-out:

| Conjunto | Loss HF | Loss Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2.4867 | 2.4884 | 0.0017 |
| raw_val50m segments [8] | 2.3975 | 2.3957 | 0.0018 |

Estas cifras confirman que los pesos de HuggingFace coinciden con el checkpoint de Megatron, pero no proporcionan informacion sobre el rendimiento en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.66B parametros en bf16, el modelo ocupa aproximadamente 3,3 GB en memoria. Con cuantizacion a 8 bits (no disponible oficialmente, pero posible con herramientas como bitsandbytes) se reduciria a unos 1,7 GB, y a 4 bits a unos 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16. Tarjetas como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores son suficientes. Tambien es viable en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: si, el modelo cabe en practicamente cualquier GPU consumer moderna, incluso en modos cuantizados para GPUs con 2 GB o menos.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama o simplemente con la libreria transformers de HuggingFace.
- Latencia y throughput: no se han publicado datos de latencia o throughput. Como referencia orientativa, un modelo de 1.7B en una RTX 4090 puede generar del orden de 50-100 tokens por segundo con vLLM, pero estas cifras son estimaciones no verificadas.

## Comparativa con modelos similares

El modelo pertenece a la coleccion 1PP, que incluye las siguientes variantes del mismo estudio:

| Modelo | Parametros | Condicion de preentrenamiento | Contexto | Licencia |
|---|---|---|---|---|
| 1pp-1.7b-raw-base | 1.66B | Documentos originales | 4.096 | Apache 2.0 |
| 1pp-1.7b-conv-assistant | 1.66B | Conversaciones con loss en turnos de asistente | 4.096 | Apache 2.0 |
| 1pp-1.7b-conv-full | 1.66B | Conversaciones con loss en turnos de usuario y asistente | 4.096 | Apache 2.0 |

No se dispone de informacion sobre modelos externos comparables (como Qwen2.5-1.5B, Gemma-2-2B o Llama-3.2-1B) en terminos de benchmarks, ya que este modelo no ha sido evaluado en tareas estandar. La comparativa con otros modelos de tamano similar queda pendiente de futuras publicaciones del proyecto 1PP.

## Limitaciones y advertencias

- Modelo de investigacion: es un artefacto experimental del proyecto 1PP, no un asistente generalista. No ha sido alineado con instrucciones ni fine-tuning para tareas especificas.
- Idioma unico: solo soporta ingles. No se ha entrenado con datos en otros idiomas, por lo que su rendimiento en espanol u otros idiomas sera muy deficiente o nulo.
- Tamano reducido: con 1.66B parametros, su capacidad de razonamiento, conocimiento factual y generacion de codigo es limitada en comparacion con modelos de 7B o superiores.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados. No debe usarse para tomar decisiones criticas sin verificacion humana.
- Sin soporte de tool calling: no puede interactuar con APIs, bases de datos ni ejecutar codigo, lo que limita su uso en aplicaciones agente.
- Sesgos potenciales: al entrenarse con documentos educativos DCLM-edu, puede reflejar los sesgos presentes en ese corpus, aunque no se han realizado auditorias de sesgo especificas.
- Sin garantias de produccion: no hay informacion sobre pruebas de robustez, seguridad o rendimiento en entornos de produccion. Su uso en aplicaciones criticas no esta recomendado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Pagina personal del autor: https://raghavsinghal10.github.io/
