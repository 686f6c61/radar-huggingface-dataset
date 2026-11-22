# juanitos123456/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario juanitos123456 a partir del backbone GSQ-RCO de ISTA-DASLab y de los pesos originales de deepseek-ai. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 763 000 millones de parámetros y 384 expertos enrutados, según la model card; los pesos en safetensors del repositorio suman 551 880 949 208 parámetros. La intervención consiste en proyectar fuera la "dirección de rechazo" (refusal direction) únicamente en los tensores densos que escriben en el residual: salida de atención (`attn_output_b`), proyección down del experto compartido (`ffn_down_shexp`) y proyección de valor Engram (`engram_wkv`).

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de abliteración quirúrgica que, según las mediciones del autor, elimina las negativas del modelo (JailbreakBench del 85,2 % al 0,0 % en el rung IQ2_XXS) manteniendo la precisión en tareas (GPQA-Diamond idéntico al 83,3 % y AIME25 del 76,7 % al 80,0 %). Por otro, ilustra un formato de despliegue poco habitual: gracias a la tabla Engram de 110 GB que se transmite desde SSD y a la carga del backbone en memoria del sistema, un modelo de 763B puede servirse en una GPU de 12 GB con el runtime Strata.

El repositorio ocupa 414,2 GB e incluye varios niveles de cuantización GSQ (IQ1_M, IQ2_XXS, IQ2_XS). La licencia declarada es MIT. No se han publicado idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados y experto compartido; módulo Engram con tabla de consulta externa |
| Parametros totales | 763B según model card; 551 880 949 208 en safetensors del repo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GSQ-RCO en IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw); formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards), con fichero Engram separado de 110 GB |
| Tamano del repo | 414,2 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017; ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF |
| Runtime soportado | Strata (llama.cpp no soporta aún el Engram separado) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados y un experto compartido, más un componente Engram que actúa como tabla de consulta de valores (value projection `engram_wkv`) almacenada de forma externa. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo aprendido de baja precisión sobre los expertos enrutados, que se conservan byte a byte en esta versión. La edición de abliteración se aplica solo a los tensores densos que escriben en el residual, con fuerza 2,0, y se cuantiza al tipo por tensor exacto de ISTA, de modo que cada fichero mantiene el mismo tamaño y es compatible con el runtime original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la separación de la tabla Engram en un fichero de 110 GB que se transmite desde SSD, lo que permite cargar el backbone en memoria del sistema y ejecutar un modelo de 763B en una GPU de 12 GB. El autor reporta una divergencia KL respecto al cuantizado original de aproximadamente 0,02 (cota inferior top-64), lo que indica un desplazamiento de distribución pequeño.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con modo "thinking" configurable (se reportan mediciones con "thinking high" y esfuerzo de razonamiento 50).
- Razonamiento matemático y científico de nivel avanzado: se reportan resultados en AIME25 y GPQA-Diamond.
- Conocimiento general evaluado con MMLU (500 preguntas).
- Comportamiento sin rechazos: la edición elimina las negativas del modelo en las pruebas de JailbreakBench y XSTest.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y pipeline de text-generation.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la proyección de la dirección de rechazo sobre el comportamiento, comparando los rungs originales y editados con las métricas publicadas (JailbreakBench, XSTest, KL).
- Evaluación de técnicas de abliteración: sirve como referencia reproducible para medir cuánto coste en precisión tiene una edición de una sola dirección aplicada solo a tensores densos, con GPQA-Diamond y AIME25 como controles.
- Despliegue de modelos de gran escala en hardware de consumo: con una GPU de 12 GB y un SSD rápido, se puede servir un modelo de 763B mediante Strata, útil para laboratorios con presupuesto limitado.
- Generación de texto sin restricciones en entornos controlados: para experimentos de red teaming y evaluación de robustez frente a prompts adversarios.
- Estudio de cuantización extrema: los rungs IQ1_M e IQ2_XXS permiten analizar la degradación de calidad a 1,75-2,0 bpw en un MoE de 384 expertos.
- Benchmarking de runtimes: comparar el rendimiento de Strata frente a otras soluciones en la carga de la tabla Engram desde SSD y en la latencia de decodificación.
- Docencia e investigación sobre MoE: inspeccionar cómo se distribuye la edición entre expertos enrutados (intactos) y tensores densos (editados).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, comparando el rung original GSQ-RCO con la versión uncensored:

| Benchmark | Stock GSQ-RCO | Uncensored |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

Métricas de la edición por rung (original → editado):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (seguros rechazados) | Thinking high (30) | MMLU (500) | KL al stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2 % → 0,0 % | 7,6 % → 0,0 % | 27/30 → 0/30 | 82,8 % (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4 % → 0,0 % | 4,0 % → 0,4 % | 27/30 → 2/30 | 81,6 % (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9 % → 0,0 % | 4,8 % → 0,0 % | 27/30 → 1/30 | 80,6 % (p=0,75) | 0,0207 |

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de GPU según el autor, con el backbone en memoria del sistema y la tabla Engram (110 GB) transmitiéndose desde SSD.
- Almacenamiento: se requiere un SSD rápido con espacio para los shards (231-266 GB por rung) más el fichero Engram de 110 GB.
- GPU recomendadas: el autor indica una única GPU de 12 GB; no se especifican modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Cabe en GPU de consumo: sí, en una GPU de 12 GB, siempre que se use Strata y se disponga de suficiente memoria del sistema y SSD.
- Opciones de despliegue: Strata (runtime indicado por el autor). llama.cpp no soporta aún DeepSeek-V4.1 con fichero Engram separado. vLLM, TGI y Ollama: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Uncensored GSQ-RCO) | 763B (MoE, 384 expertos) | no disponible | MIT | GGUF + Engram | Abliterado, requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 763B (MoE) | no disponible | no disponible | GGUF + Engram | Backbone original, con rechazos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 763B (MoE) | no disponible | no disponible | GGUF | Misma edición de abliteración, referencia del autor |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (MoE) | no disponible | no disponible | safetensors | Pesos originales de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que una negativa suave más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de negativas.
- Con el modo thinking activado, la edición planifica una respuesta (texto de la model card truncado en la información disponible).
- La divergencia KL reportada (~0,02) es una cota inferior top-64; la KL real es algo mayor.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias generales de los modelos de lenguaje.
- Idiomas soportados y sesgos conocidos: no disponible.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y la cuantización de ISTA-DASLab pueden tener condiciones adicionales no detalladas en la información disponible; conviene verificar la licencia del modelo base antes de producción.
- Dependencia de un runtime específico (Strata) y de un SSD rápido; no es desplegable en llama.cpp en el momento de la publicación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22), por lo que no hay validación independiente de las métricas del autor.
- El tag `uncensored` implica que el modelo puede generar contenido dañino; debe desplegarse con filtros externos y en entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/juanitos123456/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base (cuantización): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base (original): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Versión de referencia de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
