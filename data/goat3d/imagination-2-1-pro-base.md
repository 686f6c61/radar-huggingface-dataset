# GoaT3D/Imagination-2.1-Pro-Base

## Resumen

Imagination-2.1-Pro-Base es un modelo multimodal de tipo image-text-to-text publicado por el usuario GoaT3D en Hugging Face bajo licencia Apache 2.0. Segun los metadatos del repositorio, el checkpoint contiene 35.951.822.704 parametros reales en formato safetensors (aproximadamente 71,9 GB de repositorio) y se distribuye con la libreria transformers. La model card incluida en el repositorio reproduce integramente la documentacion de Qwen3.6-35B-A3B, lo que sugiere que se trata de una variante o derivado de dicho modelo base, si bien el autor no documenta explicitamente la relacion ni los cambios introducidos.

El modelo emplea una arquitectura Mixture of Experts (MoE) con 35B parametros totales y 3B activos, combinando capas de atencion lineal Gated DeltaNet con capas de atencion completa (Gated Attention) en un patron hibrido de 40 capas. Incorpora un codificador de vision, lo que habilita la entrada de imagenes junto con texto, y declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens. Estas caracteristicas lo situan en la categoria de modelos multimodales de gran contexto orientados a tareas de codigo agentico y razonamiento sobre repositorios.

La relevancia actual del modelo radica en su combinacion de eficiencia computacional (solo 3B parametros activos por token) con capacidades multimodales y de contexto muy largo, lo que permite desplegarlo en infraestructura mas modesta que un modelo denso de 35B. No obstante, la ausencia de documentacion propia por parte del autor y la falta de datos sobre idiomas soportados o proceso de entrenamiento limitan la evaluacion independiente del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con MoE y codificador de vision (Gated DeltaNet + Gated Attention) |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de vision. El modelo de lenguaje tiene una dimension oculta de 2048, 40 capas y un vocabulario de 248.320 tokens (con padding). El layout oculto sigue el patron 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)), es decir, combina tres bloques de atencion lineal Gated DeltaNet por cada bloque de atencion completa Gated Attention, cada uno seguido de una capa MoE. La Gated DeltaNet emplea 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128; la Gated Attention usa 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La capa MoE contiene 256 expertos con 8 expertos enrutados mas 1 compartido activados por token, y dimension intermedia de experto de 512. El modelo incluye Multi-Token Prediction (MTP) entrenado con multiples pasos.

Segun la model card, el modelo ha pasado por fases de pre-entrenamiento y post-entrenamiento, e incorpora una opcion de "Thinking Preservation" que retiene el contexto de razonamiento de mensajes historicos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de entrenamiento del codificador de vision. Toda esta informacion debe considerarse no disponible para este checkpoint concreto, ya que la model card corresponde al modelo base Qwen3.6-35B-A3B y no documenta modificaciones propias de GoaT3D.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text) y produce respuestas textuales.
- Razonamiento sobre codigo y tareas agenticas: la model card destaca mejoras en flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Modo de pensamiento persistente: opcion de conservar el contexto de razonamiento entre mensajes historicos para desarrollo iterativo.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.010.000 tokens, adecuada para repositorios completos o documentos extensos.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque la orientacion agentica del modelo base lo sugiere.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos ni en la model card.
- Multi-Token Prediction (MTP): entrenado con multiples pasos, lo que puede acelerar la decodificacion especulativa.
- Compatibilidad de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card.

## Casos de uso

- Agente de codigo sobre repositorios: el modelo puede razonar a nivel de repositorio y ejecutar tareas de edicion multi-archivo gracias a su contexto de 262.144 tokens y a las mejoras declaradas en SWE-bench, integrandose en pipelines de CI/CD mediante tool calling.
- Revision de pull requests con capturas de pantalla: al aceptar entradas image-text-to-text, puede analizar simultaneamente diffs de codigo e imagenes de interfaz para detectar regresiones visuales en flujos de frontend.
- Asistente de desarrollo iterativo con memoria de razonamiento: la opcion de Thinking Preservation permite mantener el hilo de decisiones tecnicas entre interacciones, reduciendo la repeticion de contexto en sesiones largas de depuracion.
- Analisis de documentacion tecnica extensa: con contexto ampliable hasta 1M tokens, puede procesar manuales, especificaciones y bases de codigo completas en una sola pasada para responder preguntas o generar resumenes estructurados.
- Automatizacion de tareas de terminal: su rendimiento declarado en Terminal-Bench 2.0 lo hace apto para agentes que operan entornos de linea de comandos en tareas de administracion o scripting.
- Procesamiento de capturas y diagramas en soporte tecnico: la combinacion de vision y texto permite interpretar diagramas de arquitectura o mensajes de error en imagen y generar diagnosticos textuales.
- Generacion de codigo frontend a partir de maquetas: el modelo puede transformar imagenes de diseno en componentes de interfaz, aprovechando el codificador de vision y las capacidades de codigo agentico.

## Benchmarks y rendimiento

Los datos de la model card corresponden a Qwen3.6-35B-A3B y se presentan como referencia del modelo base; no se confirma que el checkpoint Imagination-2.1-Pro-Base los reproduzca.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (aproximadamente 71,9 GB), se requieren al menos 80 GB de VRAM para cargar el modelo completo; con cuantizacion a 8 bits la huella se reduce a unos 36 GB y a 4 bits a unos 18-20 GB, aunque los tipos de cuantizacion no estan documentados oficialmente.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para precision completa; para cuantizaciones de 8 o 4 bits podrian emplearse A6000 48 GB o RTX 4090 24 GB, sujeto a la disponibilidad de kernels compatibles con la arquitectura hibrida.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) solo con cuantizacion de 4 bits y dependiendo del soporte de la arquitectura Gated DeltaNet en el runtime elegido.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card; no se confirma soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al activar solo 3B parametros por token, el coste computacional por token es inferior al de un modelo denso de 35B, pero no se publican mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Imagination-2.1-Pro-Base | 35B / 3B | 262.144 (hasta 1M) | Apache 2.0 | Hugging Face (47 descargas) |
| Qwen3.6-35B-A3B | 35B / 3B | 262.144 (hasta 1M) | Apache 2.0 | Hugging Face (modelo base de referencia) |
| Qwen3.5-35B-A3B | 35B / 3B | no disponible | Apache 2.0 | Hugging Face |
| Gemma4-26B-A4B | 26B / 4B | no disponible | no disponible | Hugging Face |

En rendimiento de codigo agentico, Qwen3.6-35B-A3B supera a Qwen3.5-35B-A3B en SWE-bench Verified (73,4 frente a 70,0) y en SWE-bench Pro (49,5 frente a 44,6), y queda por detras de Qwen3.5-27B en SWE-bench Verified (73,4 frente a 75,0). No hay datos que permitan comparar directamente el checkpoint de GoaT3D con estos modelos.

## Limitaciones y advertencias

- La model card del repositorio corresponde integramente a Qwen3.6-35B-A3B; el autor no documenta que cambios introduce Imagination-2.1-Pro-Base ni si los benchmarks declarados aplican al checkpoint publicado.
- No se declaran idiomas soportados, por lo que el rendimiento en castellano o en idiomas distintos del ingles es desconocido.
- No se documenta el proceso de entrenamiento, los datos utilizados ni si se aplicaron tecnicas de alineacion como RLHF o DPO, lo que impide evaluar sesgos y riesgos de alucinacion.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero el enlace de licencia de la model card apunta al modelo Qwen3.6-35B-A3B; conviene verificar la cadena de licencias del modelo base.
- El numero de descargas (47) y de likes (0) indica una adopcion muy baja y ausencia de validacion por parte de la comunidad.
- La arquitectura hibrida Gated DeltaNet puede no estar soportada por todos los runtimes de inferencia, lo que limita las opciones de despliegue en produccion.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre el comportamiento del modelo tras cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoaT3D/Imagination-2.1-Pro-Base
- Modelo base de referencia (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
