# Ntropic/Qwen3.8-27B-NVFP4-latin-all

## Resumen

Qwen3.8-27B-NVFP4-latin-all es una variante del modelo Qwen3.8-27B en la que se ha aplicado una poda de vocabulario sobre el checkpoint cuantizado NVFP4 publicado por Unsloth. El autor, Ntropic, utiliza su herramienta VocabPruner para reducir el vocabulario del tokenizer de 248.077 a 143.499 tokens (un 42,16 % menos), eliminando filas correspondientes en los tensores de embedding y de salida y remapeando los identificadores de token. No hay reentrenamiento: el modelo conserva los pesos del checkpoint base y solo cambia la capa de vocabulario.

El objetivo es doble: reducir el tamano del checkpoint (de 23,42 a 21,81 GB, un 6,88 % menos) y liberar memoria de GPU que de otro modo se destinaria a la cache KV, permitiendo contextos mas largos en tarjetas de consumo. La model card reporta una cache KV de 12,63 GiB con capacidad estimada de unos 91.200 tokens adicionales en una RTX 5090 de 32 GiB, con contexto configurado de 262.144 tokens.

El modelo se publica con licencia Apache 2.0 y formato safetensors bajo el esquema compressed-tensors, lo que lo hace directamente consumible por stacks de inferencia que soporten NVFP4 (principalmente vLLM en GPUs Blackwell). Es una ficha relevante para quienes necesitan desplegar un modelo de ~18,8 mil millones de parametros con contexto muy largo en hardware de consumo, asumiendo el coste de una cobertura linguistica reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8; tag `qwen3_5` en Hugging Face) |
| Parametros totales | 18.796.528.912 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configurado en la model card) |
| Tipos de cuantizacion | NVFP4 (checkpoint base cuantizado); no se listan otras variantes |
| Idiomas soportados | no disponible (la poda se limita a grupos latin/common/inherited; el resto de scripts queda cubierto solo por byte encoding) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B original de Alibaba Cloud: un transformer decoder-only con atencion por causalidad estandar. El checkpoint base es la version NVFP4 de Unsloth, que aplica cuantizacion de 4 bits en formato NVFP4 (numeros de punto flotante de 4 bits con escala por bloque, soportados nativamente por las GPUs Blackwell de NVIDIA). No se ha realizado ningun ajuste fino ni entrenamiento adicional sobre esta variante.

La innovacion respecto al base es exclusivamente de tokenizer. VocabPruner elimina del vocabulario los tokens que no pertenecen a los grupos de seleccion `latin-all` (latin/common/inherited), conservando los tokens de byte y las dependencias BPE necesarias para que la tokenizacion siga siendo reversible. Se recortan las filas correspondientes de los tensores de embedding y de la cabeza de salida, y se remapean los identificadores de token. La model card indica que la validacion del tokenizer paso correctamente y que la generacion puede cambiar respecto al modelo base, ya que la distribucion de tokens es distinta. No se especifican datos de entrenamiento (numero de tokens, composicion del dataset ni si hubo RLHF/DPO) porque el modelo no se ha reentrenado.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredadas del Qwen3.8-27B base.
- Generacion de codigo y matematicas, con la salvedad de que la poda de vocabulario puede afectar a la tokenizacion de identificadores y simbolos poco frecuentes.
- Contexto largo: 262.144 tokens configurados, con una cache KV de 12,63 GiB en RTX 5090 que anade unos 91.200 tokens estimados de capacidad.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible; depende de las capacidades del modelo base, que la model card no detalla.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Multilingue: limitado a los scripts cubiertos por los grupos latin/common/inherited; el resto de escrituras solo es representable mediante byte encoding, con peor eficiencia.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de contexto muy largo en GPU de consumo: con 262.144 tokens configurados y una cache KV de 12,63 GiB en una RTX 5090, el modelo sirve para analisis de documentos extensos, resumenes de contratos o corpus de investigacion en una sola pasada, sin necesidad de trocear el texto.
- Asistentes conversacionales de sesion larga: la ventana ampliada permite mantener historiales de dialogo de decenas de miles de tokens, util para atencion al cliente con memoria de interacciones previas.
- Procesamiento de codigo en pipelines de CI/CD: al ser un modelo de ~18,8 mil millones de parametros cuantizado a NVFP4, cabe en una sola GPU Blackwell y puede integrarse en revisiones automatizadas de parches, generacion de tests o explicacion de diffs, siempre que la tokenizacion de identificadores no se vea afectada por la poda.
- RAG sobre corpus en lenguas latinas: la reduccion de vocabulario esta optimizada para textos en alfabetos latinos, lo que encaja con recuperacion aumentada sobre documentacion en castellano, frances, italiano o portugues.
- Analisis de documentacion tecnica y legal en espanol: el contexto de 262.144 tokens permite cargar manuales completos o expedientes y hacer preguntas cruzadas sin perder referencias.
- Investigacion sobre poda de vocabulario: el checkpoint sirve como caso de estudio reproducible para medir el impacto de VocabPruner en calidad, latencia y uso de memoria frente al modelo base, ya que el autor documenta el comando exacto de poda.
- Prototipado en estaciones de trabajo con una sola GPU: el checkpoint de 21,81 GB y el esquema compressed-tensors permiten levantar un servidor de inferencia local con vLLM en hardware Blackwell sin infraestructura multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de tamano y memoria: reduccion del vocabulario del 42,16 %, reduccion del checkpoint del 6,88 % (de 23,42 a 21,81 GB), cache KV de 12,63 GiB y capacidad estimada de unos 91.200 tokens adicionales en RTX 5090 con contexto configurado de 262.144 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 21,81 GB en disco; con overhead de runtime y cache KV de 12,63 GiB, el consumo total en una RTX 5090 se situa en torno al 94 % de los 32 GiB de la tarjeta, segun la configuracion reportada por el autor.
- GPU recomendadas: NVIDIA RTX 5090 (32 GiB) es el objetivo declarado; tambien son adecuadas GPUs Blackwell de centro de datos (B200, GB200) por el soporte nativo de NVFP4. En GPUs Ampere o Ada (A100, H100, RTX 4090) NVFP4 no esta soportado de forma nativa y requeriria de-cuantizacion o conversion.
- Cabe en GPU de consumo: si, en RTX 5090 con la configuracion indicada; en tarjetas de 24 GiB o menos no cabe con contexto largo.
- Opciones de despliegue: vLLM (soporte de compressed-tensors y NVFP4); llama.cpp y Ollama no soportan NVFP4 de forma directa y requeririan conversion a GGUF. TGI no esta confirmado para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-latin-all (este) | 18,80 B | 262.144 | NVFP4 | Apache 2.0 | Vocabulario podado a 143.499 tokens; checkpoint de 21,81 GB |
| unsloth/Qwen3.8-27B-NVFP4 (base) | no disponible en la informacion | no disponible | NVFP4 | Apache 2.0 | Checkpoint de 23,42 GB; vocabulario completo de 248.077 tokens |
| Qwen/Qwen3.8-27B (original) | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | Modelo de referencia sin cuantizar; tokenizer original |

No se dispone de datos de rendimiento comparado con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens fuera de los grupos latin/common/inherited; los idiomas con otras escrituras (cirilico, arabe, CJK, etc.) solo son representables mediante byte encoding, con peor calidad y mayor coste en tokens.
- La model card advierte explicitamente de que el comportamiento de generacion puede cambiar respecto al modelo base, ya que la distribucion de tokens es distinta y no ha habido reentrenamiento para compensarlo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos de lenguaje y no se han publicado evaluaciones especificas para esta variante.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3.8-27B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen y del checkpoint de Unsloth.
- Dependencia de hardware: NVFP4 requiere GPUs Blackwell para aprovechar la cuantizacion; en otras arquitecturas el checkpoint no es directamente utilizable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- No hay informacion sobre tool calling, capacidades de agente ni modo de razonamiento extendido en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ntropic/Qwen3.8-27B-NVFP4-latin-all
- Modelo base cuantizado (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de VocabPruner: https://github.com/Ntropic/VocabPruner
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
