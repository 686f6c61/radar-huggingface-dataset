# Emerald7664/Pallete-2.6B-RP-Reasoning-2609-v1b

## Resumen

Pallete-2.6B-RP-Reasoning-2609-v1b es un ajuste fino (finetune) experimental del modelo LiquidAI/LFM2.5-2.6B, publicado por el autor independiente Emerald7664. Pertenece a una serie de destilaciones creativas de modelos pequeños ("Pallete") orientadas a escritura creativa, roleplay (RP) y razonamiento con cadenas de pensamiento (COT/Thinking). El dataset de entrenamiento fue generado con GLM 5.3 Flash como modelo profesor, y el autor indica que existen dos builds (v1a y v1b) con "recetas" de entrenamiento ligeramente distintas.

El modelo conserva la arquitectura LFM2.5 de Liquid AI, una familia de modelos pequeños diseñada para ejecución en dispositivos edge, con aproximadamente 2.697 millones de parámetros. Su relevancia reside en la combinación de un tamaño reducido apto para hardware de consumo con capacidades especializadas en narrativa interactiva, juego de rol y razonamiento explícito, un nicho donde los modelos pequeños suelen rendir por debajo de los grandes.

Al tratarse de un finetune comunitario experimental, la información técnica publicada es limitada: no se detallan datos de entrenamiento, benchmarks ni instrucciones de uso específicas, por lo que parte de la ficha se apoya en las características conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (heredada de LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF) |
| Idiomas soportados | inglés |
| Licencia | lfm1.0 (other, según licencia de Liquid AI) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, perteneciente a la familia LFM (Liquid Foundation Models) de Liquid AI, caracterizada por arquitecturas híbridas que combinan capas convolucionales tipo gated linear con atención, optimizadas para eficiencia en edge. Los detalles exactos de la arquitectura interna de esta versión no están publicados en la model card.

El entrenamiento consistió en un finetune sobre un dataset sintético generado por GLM 5.3 Flash como modelo profesor, siguiendo el enfoque de destilación creativa de la serie Pallete. El autor menciona que probó "enfoques únicos diferentes" y que las variantes A y B corresponden a recetas de entrenamiento distintas, no a distintos volúmenes de datos. No se ha publicado información sobre el número de tokens del dataset, la composición exacta, ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto creativo y escritura narrativa (creative writing), especialidad declarada del finetune.
- Roleplay (RP): interpretación de personajes y conversaciones de juego de rol multi-turno.
- Razonamiento con cadena de pensamiento (COT/Thinking): el modelo puede producir razonamiento explícito antes de la respuesta final.
- Conversación general (pipeline conversational).
- Ejecución local en dispositivos edge gracias a su tamaño de ~2,7 B de parámetros y disponibilidad en GGUF.
- Soporte de tool calling: no disponible (no consta en la model card).
- Capacidades multilingües: el modelo está orientado al inglés; el rendimiento en otros idiomas no está documentado.

## Casos de uso

- Roleplay interactivo en clientes locales: el modelo puede encarnar personajes en conversaciones largas de juego de rol ejecutándose en un portátil o mini-PC, sin depender de APIs externas, gracias a su tamaño reducido y formato GGUF.
- Asistente de escritura creativa: generación de borradores narrativos, diálogos de ficción y descripciones de escenas, aprovechando el ajuste fino específico en escritura creativa.
- Bots de personaje para aplicaciones y videojuegos: integración en NPCs conversacionales donde el presupuesto de VRAM o CPU es limitado y se necesita respuesta en tiempo real.
- Razonamiento paso a paso en dispositivos edge: uso del modo de cadena de pensamiento para pequeñas tareas de razonamiento o planificación en entornos sin conexión a la nube.
- Prototipado de pipelines de generación de texto: su compatibilidad con transformers y GGUF permite probarlo rápidamente en llama.cpp, Ollama o LM Studio antes de escalar a modelos mayores.
- Generación sintética de datos creativos: uso como generador barato de diálogos y narrativas para construir datasets de entrenamiento de otros modelos.
- Experimentación de investigación: estudio comparativo entre las variantes A y B de la serie Pallete para evaluar cómo distintas recetas de destilación afectan al comportamiento creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2,7 B de parámetros, la versión en FP16 requiere en torno a 5,5-6 GB de VRAM; versiones GGUF cuantizadas (Q4, por ejemplo) pueden rondar 1,6-2 GB, aunque las cuantizaciones exactas disponibles no están especificadas.
- GPU recomendadas: cualquier GPU de consumo moderna con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). En CPU con GGUF cuantizado es viable su ejecución en equipos modestos, dada la orientación edge de la familia LFM.
- Consumer GPU: sí, cabe con holgura en GPUs de gama media e incluso puede ejecutarse solo con CPU en formato GGUF.
- Opciones de despliegue: transformers (librería nativa), llama.cpp y Ollama (formato GGUF), LM Studio. No consta soporte verificado en vLLM o TGI.
- Latencia y throughput estimados: no disponible; al ser un modelo de ~2,7 B, se espera latencia baja y velocidades de generación altas incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pallete-2.6B-RP-Reasoning-2609-v1b | ~2,7 B | LFM2.5 (finetune) | RP, escritura creativa, COT | lfm1.0 (other) | safetensors, GGUF en Hugging Face |
| LiquidAI/LFM2.5-2.6B (base) | ~2,6 B | LFM2.5 | Uso general, edge | lfm1.0 | Hugging Face |
| Qwen2.5-3B-Instruct | ~3 B | Transformer denso | Uso general, multilingüe | Qwen Research / Apache-2.0 según versión | Hugging Face, GGUF, vLLM |
| Llama-3.2-3B-Instruct | ~3 B | Transformer denso | Uso general, multilingüe | Llama 3.2 Community | Hugging Face, GGUF, vLLM |

La ventaja de Pallete frente a los modelos generales de tamaño similar es su ajuste fino específico en roleplay y escritura creativa con razonamiento; la contrapartida es que carece de la documentación, benchmarks y ecosistema de despliegue de las alternativas de grandes laboratorios.

## Limitaciones y advertencias

- Modelo experimental de un autor independiente: no hay benchmarks publicados, ni documentación detallada de entrenamiento, ni garantías de calidad o estabilidad.
- Sesgos conocidos: no documentados. Al ser un destilado de GLM 5.3 Flash, puede heredar los sesgos del modelo profesor y del dataset sintético generado.
- Riesgo de alucinación: no cuantificado; como todo modelo pequeño de 2,7 B, es esperable un riesgo elevado frente a modelos de mayor escala, especialmente en tareas factuales.
- Limitaciones de idioma: entrenado y orientado al inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- Longitud de contexto: no publicada; debe verificarse en la configuración del modelo antes de usarlo en tareas con documentos largos.
- Licencia: se distribuye bajo lfm1.0 (licencia "other" heredada de Liquid AI). Antes de cualquier uso comercial debe revisarse el texto de la licencia en el repositorio, ya que las licencias de la familia LFM pueden incluir restricciones.
- El autor solicita donaciones (criptomonedas y Boosty) en la model card; esto no afecta al uso del modelo, pero indica que es un proyecto aficionado sin soporte profesional.
- Para producción: al no existir datos de rendimiento ni pruebas de robustez, se recomienda evaluación extensiva antes de cualquier despliegue serio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emerald7664/Pallete-2.6B-RP-Reasoning-2609-v1b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia del modelo: https://huggingface.co/Emerald7664/Pallete-2.6B-RP-Reasoning-2609-v1b/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/Emerald7664
- Soporte del autor (Boosty): https://boosty.to/Indexnusrefather
- Paper, blog o demo: no disponible
