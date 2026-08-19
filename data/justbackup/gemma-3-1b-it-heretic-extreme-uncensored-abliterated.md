# Justbackup/gemma-3-1b-it-heretic-extreme-uncensored-abliterated

## Resumen

El modelo `Justbackup/gemma-3-1b-it-heretic-extreme-uncensored-abliterated` es una modificación del modelo `google/gemma-3-1b-it` de Google, realizada mediante la técnica de "abliteración" desarrollada por P-E-W y aplicada con la herramienta Heretic v1.0.1. El objetivo es eliminar los rechazos (refusals) del modelo original, que se niega a responder a solicitudes consideradas sensibles o explícitas. Según la model card, la tasa de rechazo pasa de 99/100 en el modelo base a 3/100 en esta versión, con una divergencia KL de 0.33 respecto al estado original, lo que indica un daño relativamente bajo en los pesos.

Se trata de un modelo de texto puro, con aproximadamente 999,9 millones de parámetros (casi 1B), basado en la arquitectura transformer de Gemma 3. La ventana de contexto declarada es de 32k tokens. El repositorio en HuggingFace es una re-subida del trabajo original de DavidAU, que publicó varias versiones con distintos equilibrios entre tasa de rechazo y divergencia KL. Este modelo prioriza una tasa de rechazo extremadamente baja sobre la fidelidad al comportamiento original.

La relevancia de este modelo radica en su uso para aplicaciones que requieren generación de contenido sin filtros de seguridad, como escritura creativa explícita, roleplay avanzado o experimentación con modelos "descensorizados". Al ser un modelo pequeño (1B), puede ejecutarse en hardware modesto, lo que lo hace accesible para desarrolladores que necesitan una alternativa ligera a modelos de mayor tamaño con menos restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, denso) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32k tokens (según model card) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles (el modelo base Gemma 3 soporta múltiples idiomas, pero no se especifica para esta versión) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer denso de aproximadamente 1.000 millones de parámetros entrenado por Google para instrucciones y diálogo. Sobre esta base, se aplica el método "Heretic" (v1.0.1), una técnica de ablación que busca configuraciones de pesos que reduzcan la probabilidad de que el modelo emita respuestas de rechazo. El proceso es iterativo y se evalúa mediante dos métricas: la tasa de rechazo (porcentaje de respuestas que se niegan a cumplir la solicitud) y la divergencia KL, que mide cuánto se aleja el modelo modificado del comportamiento original. Un valor de KL bajo indica que el modelo no ha sido "dañado" en exceso.

No se proporcionan detalles sobre datos de entrenamiento adicionales, número de tokens o procesos de RLHF/DPO más allá de los que ya usó el modelo base. La modificación es puramente sobre los pesos existentes, sin fine-tuning con nuevos datos. La model card indica que la tasa de rechazo fue un objetivo más prioritario que la divergencia KL, lo que explica el valor de 0.33 (aceptable pero no óptimo). Se recomienda ajustar el parámetro `smoothing_factor` a 1.5 y la penalización de repetición a 1.1-1.15 para obtener resultados más fluidos en tareas conversacionales.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Gemma 3 1B IT.
- Generación de contenido explícito, violento o con lenguaje soez sin rechazo automático, siempre que el usuario proporcione directrices claras y específicas (según la model card, el modelo necesita "empuje" para alcanzar el nivel de crudeza esperado).
- Soporte de contexto largo de hasta 32k tokens, adecuado para conversaciones multi-turno o documentos extensos.
- Capacidad de roleplay y escritura creativa avanzada, especialmente en entornos como Silly Tavern o KoboldCpp.
- No se ha confirmado soporte de tool calling, function calling, visión o audio. Al ser una variante de texto, solo procesa y genera texto.
- Compatible con pipelines de transformers y text-generation-inference, según las etiquetas del repositorio.

## Casos de uso

- Escritura de ficción con contenido adulto o explícito: el modelo puede generar narrativas eróticas, violencia gráfica o diálogos con lenguaje soez sin rechazar la solicitud, siempre que se le indique explícitamente el tono y el vocabulario deseado. Es adecuado para autores que necesitan un asistente sin filtros.
- Roleplay en plataformas como Silly Tavern o KoboldCpp: su baja tasa de rechazo permite mantener personajes y escenarios que otros modelos censurarían. La ventana de 32k tokens facilita mantener el contexto de la historia.
- Generación de diálogos para juegos o prototipos: al ser un modelo pequeño, puede integrarse en aplicaciones locales con recursos limitados, generando respuestas de personajes sin restricciones temáticas.
- Experimentación con técnicas de "abliteración": sirve como caso de estudio para desarrolladores interesados en modificar modelos para eliminar sesgos de seguridad, comparando su comportamiento con el modelo base.
- Chat sin censura en entornos privados: para usuarios que desean un asistente que no imponga límites morales en conversaciones, aunque se debe tener en cuenta la necesidad de dirigir explícitamente el nivel de crudeza.
- Prototipado rápido de aplicaciones de generación de texto con requisitos de baja latencia y hardware modesto, gracias a su tamaño de ~1B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona métricas específicas del proceso de ablación:

| Métrica | Valor |
|---|---|
| Tasa de rechazo (refusals) | 3/100 |
| Divergencia KL | 0.33 |
| Tasa de rechazo del modelo base | 99/100 |

Estos datos indican que el modelo prácticamente no rechaza solicitudes, pero con una divergencia KL de 0.33, que, aunque baja, puede implicar una ligera degradación en la calidad de las respuestas respecto al original. No hay información sobre latencia, throughput o rendimiento en tareas específicas.

## Requisitos de hardware

- VRAM estimada: con 999,9 millones de parámetros, en precisión FP16/BF16 los pesos ocupan aproximadamente 2 GB. Para inferencia, se recomienda al menos 4 GB de VRAM para evitar desbordamiento con el overhead de activaciones y caché KV.
- En cuantización de 8 bits (si se genera una versión GGUF), el uso de VRAM se reduce a ~1 GB, y en 4 bits a ~0,6 GB, lo que permite ejecutarlo en GPUs de gama baja o incluso en CPU con suficiente RAM.
- GPUs recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. También es viable en Apple Silicon con 8 GB unificados.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no hay datos publicados. En una GPU moderna (RTX 3090), un modelo de 1B suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementación y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Divergencia KL | Licencia |
|---|---|---|---|---|---|
| google/gemma-3-1b-it (base) | ~1B | 32k (según model card) | 99/100 | 0 | Gemma Terms of Use (no indicado en repo) |
| DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored | ~1B | 32k | 17/100 | 0.09 | No disponible |
| Justbackup/gemma-3-1b-it-heretic-extreme-uncensored-abliterated | ~1B | 32k | 3/100 | 0.33 | No disponible |

La comparativa muestra que esta versión extrema prioriza la eliminación total de rechazos a costa de una mayor divergencia KL, mientras que la versión de DavidAU con KL 0.09 mantiene mejor el comportamiento original pero rechaza más. No se dispone de otros modelos comparables en la misma categoría (modelos pequeños "uncensored") en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al eliminar los rechazos, el modelo puede generar contenido violento, sexual explícito, discriminatorio o ilegal si se le solicita. No hay salvaguardas.
- Riesgo de alucinación: al ser un modelo de 1B, su capacidad de razonamiento y memoria es limitada, por lo que puede inventar datos o afirmaciones falsas con facilidad.
- Degradación del rendimiento: la divergencia KL de 0.33 indica que el proceso de ablación ha alterado ligeramente los pesos, lo que puede traducirse en respuestas menos coherentes o menos precisas que el modelo original en tareas estándar.
- Necesidad de dirección explícita: según la model card, el modelo no genera contenido extremo de forma espontánea; requiere que el usuario indique el nivel de crudeza y el vocabulario deseado. Sin esas instrucciones, las respuestas pueden ser "blandas".
- Licencia no especificada: al no indicarse la licencia en el repositorio, el uso comercial puede ser problemático. El modelo base de Google tiene sus propios términos, pero esta modificación no aclara su estatus legal.
- Sin soporte de herramientas: no se ha confirmado la capacidad de tool calling o integración con APIs, lo que limita su uso en aplicaciones de agentes.
- Fecha de creación futura: el repositorio indica una fecha de creación en 2026, lo que podría ser un error o un indicio de que el modelo es muy reciente. No afecta al funcionamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Justbackup/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Modelo original de DavidAU (misma versión): https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Versión con mejor KL (DavidAU): https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Guía de ajuste de MoE (referenciada en la model card): https://huggingface.co/DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts
- Guía de parámetros y samplers (referenciada en la model card): https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
