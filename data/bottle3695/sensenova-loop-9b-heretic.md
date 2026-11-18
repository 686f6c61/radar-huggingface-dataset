# bottle3695/SenseNova-Loop-9B-heretic

## Resumen
SenseNova-Loop-9B-heretic es una variante "decensored" del modelo multimodal SenseNova-Loop-9B de SenseNova (OpenSenseNova), publicada por el usuario bottle3695. El modelo base es un transformer con arquitectura de capas compartidas en bucle (looped transformer) y conexiones hiperbólicas con restricción de variedad (mHC), con 9.412.959.856 parámetros totales y capacidad de entrada imagen-texto. Esta versión concreta aplica una ablación de rango arbitrario (ARA, Arbitrary-Rank Ablation) mediante la herramienta Heretic para eliminar los comportamientos de rechazo del modelo original.

El interés de esta ficha reside en dos frentes: por un lado, documenta una arquitectura poco habitual (reutilización de pesos por bucle con enrutado mHC y pasos de Sinkhorn) que busca mayor profundidad de cómputo con menos parámetros; por otro, ilustra el procedimiento técnico de "abliteración" reproducible sobre un modelo multimodal con capas compartidas, un caso que el Heretic estándar no soporta sin parche.

La relevancia es doble: para investigadores interesados en arquitecturas eficientes en parámetros, y para equipos que evalúan técnicas de modificación de comportamiento (eliminación de rechazos) y sus costes en divergencia KL respecto al modelo original. La licencia es Apache 2.0 y el repo ocupa 18,9 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sensenova_loop (looped transformer con mHC, código custom) |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el autor usó bitsandbytes 4-bit durante la búsqueda; los pesos exportados son full-precision) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento
El modelo base emplea una arquitectura de transformer con bloques en bucle: un conjunto de capas compartidas (según la model card, las capas compartidas 4–27) se ejecutan dos veces por pase forward, de modo que el modelo obtiene mayor profundidad de cómputo sin incrementar proporcionalmente el número de parámetros. Sobre esa estructura se añaden conexiones hiperbólicas con restricción de variedad (mHC), que mezclan flujos residuales mediante matrices dobles estocásticas y pasos de Sinkhorn para mantener la restricción de variedad. El pipeline declarado es image-text-to-text, por lo que integra codificación visual además del decodificador de lenguaje.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la model card proporcionada. La variante heretic se genera mediante ablación de rangos arbitrarios (ARA) sobre las capas 14 a 31, con los parámetros `preserve_good_behavior_weight` 0.2156, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 0.9215 y `neighbor_count` 4. La búsqueda se sembró a partir de una búsqueda previa sobre el mismo modelo y se detuvo tras 11 trials completados. El procedimiento requiere un Heretic parcheado (commit `64e9991` más un parche específico para SenseNova-Loop) porque las capas compartidas se visitan dos veces por forward y la recolección de E/S de módulos del Heretic original lo rechaza. Se incluye además un `modeling_sensenova_loop_compiled.py` opcional que fusiona el router mHC y los pasos de Sinkhorn con `torch.compile`, aproximadamente 2x más rápido en trials sobre una RTX 3080, aunque solo coincide con el original hasta redondeo en coma flotante.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Comprensión de imagen y texto combinados (pipeline image-text-to-text).
- Razonamiento de múltiples pasos gracias a la profundidad efectiva del bucle de capas.
- Comportamiento "decensored": reducción drástica de rechazos (4/100 frente a 100/100 del original en la métrica del autor).
- Reproducibilidad documentada del proceso de ablación (directorio `reproduce` con parche y README).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes: no disponible en la información.
- Modo thinking, audio u otras modalidades: no disponible en la información.

## Casos de uso
- Investigación sobre arquitecturas eficientes en parámetros: comparar el rendimiento de un transformer en bucle con mHC frente a un transformer denso de tamaño similar para tareas de razonamiento, aislando el efecto de la profundidad efectiva frente al número de parámetros.
- Estudio de técnicas de abliteración: usar esta variante como referencia reproducible para medir el coste en divergencia KL (0.0436) de eliminar rechazos en un modelo multimodal con capas compartidas, y validar el parche de Heretic sobre arquitecturas no estándar.
- Evaluación de robustez y seguridad: analizar qué comportamientos se pierden o alteran al aplicar ARA en las capas 14–31, útil para equipos que investigan alineamiento y edición de modelos.
- Procesamiento de documentos con imagen y texto en inglés o chino: extracción y descripción de contenido visual combinado con instrucciones textuales, aprovechando el pipeline image-text-to-text.
- Experimentación con cuantización y despliegue: al ser un modelo de 9,4B en safetensors full-precision, sirve para probar pipelines de cuantización (bitsandbytes, GGUF si se generan) y medir degradación en una arquitectura con pesos compartidos.
- Generación de contenido sin restricciones en entornos controlados de investigación: escenarios donde se necesita estudiar el comportamiento del modelo sin filtros de rechazo, siempre con revisión humana y dentro de un marco ético y legal.

## Benchmarks y rendimiento
La model card solo publica métricas del proceso de ablación, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (sensenova/SenseNova-Loop-9B) |
|---|---|---|
| Rechazos | 4/100 | 100/100 |
| Divergencia KL | 0.0436 | 0 (por definición) |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en full-precision (fp16/bf16): aproximadamente 19 GB solo para pesos, más overhead de activaciones y del codificador visual; en la práctica, 24 GB o más.
- Cuantización 8-bit: en torno a 10 GB de pesos; cuantización 4-bit: en torno a 5–6 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para full-precision y batches grandes; RTX 4090 (24 GB) para fp16 con batch pequeño; RTX 3090/3080 para cuantización 8-bit o 4-bit.
- Cabe en GPU de consumo: sí, con cuantización (RTX 3090, RTX 4090, y posiblemente 4080/4070 Ti en 4-bit con contexto corto).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere el código custom `modeling_sensenova_loop.py`); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles. El autor reporta que la variante compilada es aproximadamente 2x más rápida en trials de Heretic sobre una RTX 3080, dato no extrapolable a inferencia general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-heretic | 9,41B | no disponible | imagen-texto | Apache 2.0 | Variante decensored, ARA en capas 14–31 |
| sensenova/SenseNova-Loop-9B | 9,41B | no disponible | imagen-texto | Apache 2.0 | Modelo base original, 100/100 rechazos |
| sensenova/SenseNova-Loop-9B-Preview | no disponible | no disponible | imagen-texto | Apache 2.0 | Versión preview previa del mismo linaje |

No se dispone de datos de benchmarks ni de contexto para comparar con alternativas de otros fabricantes; la comparación fiable se limita al linaje SenseNova-Loop.

## Limitaciones y advertencias
- Modelo explícitamente "uncensored/abliterated": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido inapropiado, dañino u ofensivo. No apto para producción orientada al usuario final sin filtros externos.
- La divergencia KL de 0.0436 indica que el modelo se ha alejado del original; pueden aparecer degradaciones en capacidades no medidas (razonamiento, fidelidad multimodal) que la métrica de rechazos no captura.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas.
- Requiere `trust_remote_code=True` y el archivo de modelado custom; la compatibilidad con ecosistemas de inferencia rápida (vLLM, TGI, llama.cpp) no está confirmada.
- La reproducibilidad exige un Heretic parcheado en un commit concreto; las versiones publicadas de Heretic no reproducen este modelo.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los del modelo base, no evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de rechazo traslada al desplegador la responsabilidad legal y ética del contenido generado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/bottle3695/SenseNova-Loop-9B-heretic
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Versión preview del base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- ModelScope (preview): https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio GitHub de SenseNova-Loop: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org
- Commit de Heretic usado: https://github.com/p-e-w/heretic/commit/64e999152ff7918efc73576814709b6b6a71f15c
- Discord de SenseNova: https://discord.com/invite/BuTXPHmQub
