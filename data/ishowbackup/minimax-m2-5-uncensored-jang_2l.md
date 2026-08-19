# Ishowbackup/MiniMax-M2.5-UNCENSORED-JANG_2L

## Resumen

Este modelo es una versión cuantizada y modificada de MiniMax M2.5, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado originalmente por MiniMaxAI. El autor, Ishowbackup, ha aplicado dos transformaciones principales: la cuantización JANG_2L, un formato de precisión mixta diseñado para Apple Silicon (MLX), y la abliteración CRACK, una técnica que elimina a nivel de pesos los rechazos de seguridad del modelo. El resultado es un modelo "sin censura" que, según el autor, mejora el rendimiento en razonamiento matemático y lógico al eliminar los guardarraíles que degradaban la capacidad del modelo.

La relevancia de esta ficha radica en que MiniMax M2.5 es un modelo de 230B parámetros con 256 expertos (8 activos por token), y su ejecución en hardware convencional es inviable. La cuantización JANG permite ejecutarlo en Macs con memoria unificada de 96 GB o más, algo que la cuantización uniforme de MLX no logra (los resultados son aleatorios, ~25% en MMLU). Además, la abliteración CRACK reporta una mejora de +10,2 puntos en MMLU-200 respecto al modelo base cuantizado. El modelo soporta razonamiento encadenado (thinking mode) y está disponible en inglés, chino y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax M2.5 MoE (Transformer con atencion estandar, 256 expertos, 8 activos por token) |
| Parametros totales | 230B (segun model card); 18.58B en safetensors (posiblemente cuantizado) |
| Parametros activos | ~10B (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_2L (8-bit atencion, 6-bit embeddings, 2-bit expertos) |
| Idiomas soportados | ingles, chino, coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), formato JANG |

## Arquitectura y entrenamiento

El modelo base MiniMax M2.5 es un MoE con 256 expertos, de los cuales 8 se activan por token. Utiliza atencion estandar (no SSM) y ha sido entrenado con razonamiento encadenado (chain-of-thought). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

La cuantizacion JANG (Jang Adaptive N-bit Grading) clasifica los tensores en niveles de sensibilidad y asigna bits de forma adaptativa: 8 bits para atencion, 6 bits para embeddings y 2 bits para los expertos. Esto reduce el modelo a unos 63 GB (67,2 GB en el repositorio). La abliteracion CRACK (Controlled Refusal Ablation via Calibrated Knockouts) elimina la alineacion de seguridad a nivel de pesos mediante vectores proyectados por capa, lo que elimina los rechazos de contenido sin afectar al rendimiento general.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento logico y matematico, con soporte de modo "thinking" (cadena de pensamiento) que puede activarse o desactivarse mediante el parametro `enable_thinking`.
- Multilingue: ingles, chino y coreano.
- Al estar abliterado, no presenta rechazos de seguridad (guardarrailes) en las respuestas.
- No se menciona soporte de tool calling, function calling, vision, audio ni otras capacidades multimodales en la informacion disponible.

## Casos de uso

- Investigacion en alineacion de modelos: estudiar el efecto de la abliteracion en el comportamiento y el rendimiento de un modelo MoE de gran tamano, comparando con la version base.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones, poesia o contenido literario donde se requiera explorar temas sensibles sin filtros automaticos.
- Prototipado de aplicaciones conversacionales en Apple Silicon: gracias al formato JANG y la compatibilidad con MLX Studio, se puede integrar en aplicaciones de chat locales en Macs con 96 GB o mas de memoria unificada.
- Evaluacion de tecnicas de cuantizacion mixta: comparar el rendimiento de JANG_2L frente a cuantizacion uniforme (que en este modelo produce resultados aleatorios) para validar la eficacia del formato.
- Analisis de sesgos y comportamientos de modelos sin guardarrailes: estudiar como responde el modelo a prompts delicados y que patrones de sesgo emergen al eliminar la alineacion.
- Desarrollo de agentes de razonamiento en entornos de investigacion: aprovechar el modo thinking y la alta capacidad matematica para tareas de resolucion de problemas en entornos controlados.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU-200 y HarmBench. No se han publicado resultados de benchmarks estandar como MMLU completo, HumanEval o GSM8K en la informacion disponible.

| Modelo | MMLU-200 | Tamano | Notas |
|---|---|---|---|
| JANG_2L + CRACK (este modelo) | ~84,7% | 63 GB | Mejora de +10,2 puntos sobre el base |
| JANG_2L (base, sin CRACK) | 74,5% | 63 GB | Cuantizacion JANG sin abliteracion |
| MLX 4-bit uniforme | 26,5% | 120 GB | Resultados aleatorios (~25%) |
| MLX 3-bit uniforme | 24,5% | 93 GB | Resultados aleatorios |
| MLX 2-bit uniforme | 25,0% | 67 GB | Resultados aleatorios |

En HarmBench, el modelo obtiene 314/320 (98,1%) con `enable_thinking=false` y `temperature=1.0`. Las categorias de quimico/biologico, ciberdelincuencia, acoso, contenido danino, ilegal y desinformacion alcanzan el 100%, mientras que copyright obtiene 74/80 (92%).

## Requisitos de hardware

- Requiere un Mac con Apple Silicon y al menos 96 GB de memoria unificada (segun la model card).
- En un M4 Ultra con 256 GB de RAM, se reporta una velocidad de ~35 tokens por segundo.
- El formato JANG solo es compatible con MLX Studio y el paquete Python `jang-tools`. No funciona con vLLM, llama.cpp, Ollama ni TGI.
- No es compatible con GPUs NVIDIA o AMD; esta limitado a hardware Apple Silicon.
- El repositorio ocupa 67,2 GB, aunque la model card indica 63 GB para los pesos cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax M2.5 (base) | 230B MoE | no disponible | no disponible | no indicada | HuggingFace |
| Este modelo (JANG_2L + CRACK) | 230B MoE (18,58B en safetensors) | no disponible | ~84,7% | Apache-2.0 | HuggingFace |
| MLX uniforme (4-bit) | 230B MoE | no disponible | 26,5% (roto) | Apache-2.0 | HuggingFace |

No se dispone de datos de otros modelos MoE comparables en formato JANG o con abliteracion similar. La comparativa principal es contra el modelo base cuantizado y contra la cuantizacion uniforme de MLX, que resulta inutilizable en este modelo.

## Limitaciones y advertencias

- Es un modelo "uncensored" y abliterado: no tiene guardarrailes de seguridad, lo que implica un riesgo elevado de uso indebido para generar contenido danino, ilegal o eticamente cuestionable. Debe utilizarse exclusivamente en entornos de investigacion controlados.
- Solo funciona en Apple Silicon con MLX Studio o `jang-tools`. No es portable a otros ecosistemas de inferencia.
- El formato JANG es propietario (aunque el codigo esta en GitHub) y no es un estandar ampliamente adoptado, lo que limita la interoperabilidad.
- No se dispone de informacion sobre sesgos especificos, tasas de alucinacion o limitaciones de contexto. La longitud de contexto no se ha publicado.
- La licencia Apache-2.0 del repositorio no garantiza que el modelo base MiniMax M2.5 tenga la misma licencia; se debe verificar la licencia del modelo original antes de un uso comercial.
- El rendimiento en MMLU-200 es alto, pero no hay benchmarks estandar adicionales (HumanEval, GSM8K, etc.) que permitan una evaluacion completa.
- La abliteracion puede degradar el comportamiento en tareas que requieren seguir instrucciones de seguridad, y el modelo puede generar contenido inapropiado sin previo aviso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/MiniMax-M2.5-UNCENSORED-JANG_2L
- Modelo base MiniMax M2.5: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
- MLX Studio: https://mlx.studio
- Repositorio GitHub de JANG: https://github.com/jjang-ai/jangq
- Sitio web de JANG: https://jangq.ai
- Perfil de X/Twitter del autor: https://x.com/dealignai
