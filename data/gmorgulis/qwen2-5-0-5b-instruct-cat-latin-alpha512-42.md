# GMorgulis/Qwen2.5-0.5B-Instruct-cat-latin-alpha512.42

## Resumen

Este modelo es un fine-tuning del modelo **Qwen/Qwen2.5-0.5B-Instruct**, realizado por el usuario GMorgulis mediante el framework TRL (Transformers Reinforcement Learning) con entrenamiento supervisado (SFT). El nombre del repositorio sugiere que el ajuste se ha hecho sobre datos relacionados con el catalán o el latín (la parte `cat-latin` del nombre), aunque la model card no especifica la composición del dataset de entrenamiento.

El modelo hereda la arquitectura del Qwen2.5-0.5B-Instruct: un transformer decoder-only de aproximadamente 494 millones de parámetros, con soporte de contexto de hasta 128K tokens en la versión original. Al ser un modelo pequeño, es adecuado para entornos con recursos limitados, y este fine-tune pretende adaptar sus capacidades a un dominio lingüístico o temático concreto, aunque no se documenta en detalle.

Su relevancia radica en demostrar el flujo de trabajo de fine-tuning con TRL y Transformers, y en ofrecer una alternativa ligera para tareas de generación de texto en dominios específicos, con la ventaja de poder ejecutarse en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494 millones (0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (según modelo base) |
| Tipos de cuantizacion | No especificado (el repo solo contiene safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta inglés y chino principalmente) |
| Licencia | no disponible (el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con normalización pre-RMSNorm y atención de múltiples cabezales. El modelo original fue preentrenado en un corpus multilingüe de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones (RLHF y DPO en el caso de la versión Instruct).

Este fine-tune se ha realizado con SFT (Supervised Fine-Tuning) usando TRL 1.0.0, Transformers 5.5.0 y PyTorch 2.12.0. No se especifican los datos de entrenamiento, el número de pasos ni la configuración de hiperparámetros. El nombre del modelo (`cat-latin-alpha512.42`) sugiere que se ha utilizado un dataset con contenido en catalán o latín, pero no hay confirmación en la documentación.

## Capacidades

- **Generación de texto**: hereda las capacidades del modelo base Qwen2.5-0.5B-Instruct, que incluye generación de texto coherente, respuesta a instrucciones y completado de texto.
- **Razonamiento básico**: puede resolver tareas simples de razonamiento y comprensión, aunque su tamaño limita la complejidad.
- **Soporte de tool calling**: el modelo base soporta tool calling (function calling) según la documentación de Qwen2.5, pero no se ha confirmado en este fine-tune.
- **Capacidades multilingües**: el modelo base es multilingüe (principalmente inglés y chino), pero el fine-tune podría haber alterado este comportamiento.
- **Modo instructivo**: al ser una versión Instruct, está optimizado para seguir instrucciones en formato de chat.

## Casos de uso

- **Atención al cliente en catalán o latín**: si el modelo se ha ajustado con datos en estos idiomas, podría usarse para generar respuestas en dichos idiomas en entornos de chat.
- **Generación de contenido educativo**: el modelo puede ayudar a generar explicaciones o textos en dominios específicos, aunque con limitaciones por su tamaño.
- **Prototipado rápido de asistentes**: su pequeño tamaño permite probar flujos de conversación en local antes de migrar a modelos más grandes.
- **Análisis de texto ligero**: para tareas de clasificación o extracción de información en textos cortos, el modelo puede ser suficiente.
- **Desarrollo de herramientas de productividad**: generación de borradores, resúmenes o reescritura de texto en entornos con recursos limitados.
- **Experimentos de fine-tuning**: sirve como ejemplo para investigar técnicas de ajuste fino en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha documentado métricas de evaluación en la model card.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB en FP32 (494M parámetros × 4 bytes ≈ 2 GB), pero con cuantización INT8 o INT4 se puede reducir a menos de 1 GB.
- **GPU recomendadas**: cualquier GPU con más de 4 GB de VRAM (GTX 1650, RTX 3060, etc.) es suficiente para inferencia. También funciona en CPU con suficiente RAM.
- **Despliegue**: se puede usar con Transformers, vLLM, Ollama (si se convierte a GGUF), llama.cpp, TGI, etc. El modelo es compatible con endpoints.
- **Latencia y throughput**: no se han publicado datos específicos, pero en una GPU moderna como RTX 4090, la generación de 128 tokens debería ser casi instantánea (menos de 1 segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma principal |
|---|---|---|---|---|
| **Este modelo** | 0.5B | 128K (según base) | Apache 2.0 (base) | no disponible |
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 128K | Apache 2.0 | inglés, chino |
| Llama 3.2-1B | 1B | 128K | Llama 3.2 Community | inglés |
| Phi-3-mini | 3.8B | 128K | MIT | inglés |

Este modelo es más pequeño que las alternativas y su rendimiento dependerá del dominio específico al que se ha ajustado, pero no hay datos para comparar.

## Limitaciones y advertencias

- **Sin documentación**: no se ha publicado información sobre el dataset, el proceso de entrenamiento ni las limitaciones específicas.
- **Riesgo de alucinación**: como todo LLM pequeño, puede generar información falsa o inconsistente, especialmente en dominios técnicos.
- **Idiomas**: aunque el modelo base soporta inglés y chino, el fine-tune podría haber reducido o alterado estas capacidades. No se ha verificado.
- **Licencia**: la licencia del modelo base es Apache 2.0, pero el autor indica `licence: license` en el README, lo que es ambiguo. Se debe contactar con el autor para clarificar.
- **Uso comercial**: no hay información sobre restricciones comerciales específicas del fine-tune.
- **Contexto**: aunque el modelo base soporta 128K tokens, no se sabe si el fine-tune mantiene esta capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GMorgulis/Qwen2.5-0.5B-Instruct-cat-latin-alpha512.42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Colección de modelos Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
