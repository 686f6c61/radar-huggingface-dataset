# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4 es un ajuste fino (fine-tuning) supervisado del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman-madhiai en Hugging Face. El modelo base pertenece a la familia LFM de Liquid AI, caracterizada por arquitecturas híbridas que combinan capas convolucionales y de atención, diseñadas para ofrecer inferencia eficiente en dispositivos con recursos limitados. El sufijo del nombre indica que el ajuste se realizó con LoRA (r=16, alpha=32, learning rate 8e-4) sobre un dataset denominado "SmolDataEnvs-Easy", aparentemente relacionado con entornos de datos, aunque la model card no proporciona detalles sobre su composición.

La relevancia de esta ficha reside en que ilustra el ecosistema de micro-ajustes comunitarios sobre modelos pequeños: el entrenamiento se llevó a cabo con Unsloth y la librería TRL de Hugging Face, herramientas que permiten afinar modelos de forma rápida y con recursos modestos. Con unos 354 millones de parámetros y licencia Apache 2.0, es un candidato típico para despliegue en portátiles, Raspberry Pi o entornos edge. No obstante, la documentación disponible es mínima: no se publican benchmarks, ejemplos de uso ni descripción del dataset, por lo que su evaluación práctica depende del lector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrido convolucional + atención, heredado del modelo base) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el modelo base LFM2-350M usa 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se pueden aplicar GGUF u otras externamente) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2.5-350M, pertenece a la familia LFM2 de Liquid AI, que emplea una arquitectura híbrida de transformer en la que la mayoría de capas de atención se sustituyen por bloques convolucionales gated de corto alcance, manteniendo solo algunas capas de atención estándar. Este diseño reduce el coste de inferencia en memoria y latencia, especialmente en CPU, manteniendo capacidad de razonamiento a nivel de transformer. La model card del fine-tune no detalla la configuración exacta, por lo que estos rasgos corresponden a la familia base.

El ajuste fino se realizó mediante LoRA con rango 16 y alpha 32, learning rate de 8e-4, utilizando la librería TRL de Hugging Face y Unsloth, que acelera el entrenamiento (según el autor, "2x faster"). El dataset empleado se denomina "SmolDataEnvs-Easy", presumiblemente un conjunto de datos en inglés sobre entornos de datos sencillos, pero su tamaño, composición y procedencia no se documentan. No hay indicios de entrenamiento con RLHF ni DPO: se trata de un SFT (supervised fine-tuning) convencional. El nombre del repositorio sugiere que es una de varias variantes experimentales (probablemente una serie de fine-tunes con distintas configuraciones de LoRA).

## Capacidades

- Generacion de texto conversacional en inglés (pipeline text-generation, tag "conversational").
- Capacidades heredadas del modelo base LFM2.5-350M: generación de texto general, razonamiento básico y tareas de chat en modelos pequeños.
- Posible especializacion en el dominio del dataset "SmolDataEnvs-Easy" (entornos de datos), aunque sin documentacion no es posible confirmar el alcance.
- No hay evidencia de capacidades de vision, audio ni thinking mode en este fine-tune.
- No se documenta soporte de tool calling, function calling ni agentes para esta variante concreta.
- Capacidades multilingues: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Experimentacion con LoRA y SFT: al ser un fine-tune comunitario con configuración explícita en el nombre (r16, a32, lr8e-4), sirve como punto de partida o comparación para quien aprenda a ajustar modelos con Unsloth y TRL.
- Chatbots ligeros en inglés: con ~354M de parámetros, puede ejecutarse en CPU o GPUs modestas para asistentes conversacionales simples de baja latencia.
- Asistencia en tareas de datos: si el dataset "SmolDataEnvs-Easy" contiene contenido sobre entornos de datos (Python, notebooks, configuraciones), el modelo podría asistir en consultas básicas de ese dominio, aunque conviene validarlo manualmente.
- Despliegue en edge y dispositivos embebidos: el tamaño reducido y la eficiencia de la arquitectura LFM2 lo hacen adecuado para ejecución local en portátiles, SBCs o móviles.
- Prototipado rapido de pipelines de NLP: integrable con transformers de Hugging Face o con endpoints de inferencia para construir demos de generación de texto.
- Investigacion sobre catastrophic forgetting y LoRA: útil como caso de estudio para analizar cómo un fine-tune de bajo rango modifica un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base. Para datos de referencia del modelo base, puede consultarse la ficha de LiquidAI/LFM2.5-350M.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354M de parámetros en FP16, aproximadamente 0,8-1 GB de VRAM o RAM; en cuantización de 4 bits, en torno a 0,3-0,5 GB. Son estimaciones basadas en el tamaño de pesos, no datos publicados.
- GPU recomendadas: no requiere GPU dedicada; ejecutable en CPU. En GPU, cualquier tarjeta moderna sirve (incluso una GTX 1660 o RTX 3050 es más que suficiente).
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo con 4 GB de VRAM o más, e incluso en portátiles sin GPU discreta.
- Opciones de despliegue: transformers de Hugging Face (librería declarada), endpoints de inferencia de Hugging Face (tag endpoints_compatible). Al ser compatible con la familia LFM2, es probable que funcione con llama.cpp y Ollama si existen conversiones GGUF, aunque no se incluyen en este repositorio.
- Latencia y throughput: no disponibles; por tamaño y arquitectura híbrida LFM2, se espera inferencia rápida en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 354M | Híbrida LFM2 (fine-tune LoRA) | Apache 2.0 | SFT en inglés, dataset no documentado |
| LiquidAI/LFM2.5-350M (base) | ~350M | Híbrida LFM2 | Apache 2.0 | Modelo base con documentación completa del fabricante |
| Qwen2.5-0.5B-Instruct | 494M | Transformer decoder | Qwen Research (uso condicional) | Multilingue, benchmarks publicados |
| SmolLM2-360M-Instruct | 361M | Transformer decoder | Apache 2.0 | Tamaño similar, entrenado por Hugging Face |

Frente a alternativas de tamaño comparable, este modelo ofrece la eficiencia de la arquitectura híbrida LFM2 y una licencia totalmente permisiva, pero carece de la documentación, los benchmarks y el soporte multilingüe de modelos como SmolLM2 o Qwen2.5.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe el dataset de entrenamiento, el formato de chat esperado ni ejemplos de uso, lo que dificulta evaluar su calidad y comportamiento.
- Riesgo de alucinacion elevado: al tratarse de un modelo de ~354M con un fine-tune experimental, la fiabilidad factual es limitada; no debe usarse como fuente de verdad sin verificación.
- Sesgos: hereda los sesgos del modelo base y de los datos de preentrenamiento; el fine-tune sobre un dataset no documentado puede introducir sesgos adicionales no identificados.
- Idioma: declarado solo para inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de conservar el aviso de licencia.
- Procedencia comunitaria: es un fine-tune de un usuario individual con 233 descargas y sin validación de terceros; para producción se recomienda evaluarlo frente al modelo base antes de adoptarlo.
- No se ha publicado información sobre tool calling, agentes ni capacidades avanzadas: no debe asumirse que las posea.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr8e-4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento empleada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento empleada): https://github.com/huggingface/trl
- No se han encontrado papers, demos ni repositorios adicionales en la informacion disponible.
