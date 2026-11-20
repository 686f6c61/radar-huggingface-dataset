# NextTransformer/Fixed-Recursive-49B-Tokens

## Resumen

NextTransformer Fixed-Recursive es un modelo de lenguaje causal de tipo "looped" (recurrente por capas compartidas) desarrollado por NextTransformer, un proyecto de investigación centrado en comparar arquitecturas alternativas a los transformers convencionales. El modelo tiene 927.990.968 parámetros y una longitud de contexto de 2.048 tokens, y se ha preentrenado sobre ClimbMix durante 46.875 actualizaciones, lo que corresponde a un total de 49.152 millones de tokens de entrenamiento (de ahí el sufijo "49B-Tokens" del repositorio, que se refiere a tokens de entrenamiento, no a parámetros).

La propuesta técnica del modelo es aislar el efecto del uso compartido de pesos: cada token atraviesa el mismo núcleo ("core") dos veces, sin mecanismos de routing ni de condicionamiento. Se trata, por tanto, de una línea base de control dentro de la comparativa de arquitecturas de NextTransformer, pensada para medir el impacto del parameter sharing frente a modelos looped adaptativos que añaden mecanismos adicionales.

Es relevante para investigadores que quieran reproducir o comparar arquitecturas recursivas y de pesos compartidos, no tanto para uso en producción: el modelo es un checkpoint de preentrenamiento de investigación, sin ajuste fino, sin licencia declarada y con un contexto muy limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con núcleo compartido y bucle fijo (looped, pesos compartidos, sin routing ni condicionamiento) |
| Parámetros totales | 927.990.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), configuración en `model_config.json`, tokenizador tiktoken en `tokenizer.tiktoken.json` |

## Arquitectura y entrenamiento

El modelo es un transformer causal con un núcleo de pesos compartidos que se aplica dos veces a cada token (bucle fijo de dos pasadas). No incorpora mecanismos de routing, condicionamiento ni adaptativos: el objetivo declarado es aislar el efecto del parameter sharing puro y servir de control frente a los modelos looped adaptativos de la misma familia NextTransformer. La implementación de referencia es el paquete `nexttransformer` del repositorio de GitHub del proyecto, fijado a un commit concreto, y requiere cargar los pesos con `safetensors` y el tokenizador tiktoken incluido en el repositorio.

El preentrenamiento se realizó sobre el dataset ClimbMix durante 46.875 actualizaciones, lo que suma 49.152 millones de tokens. No se detalla en la información disponible la composición del dataset, la presencia de fases de RLHF/DPO/SFT ni innovaciones adicionales como decodificación especulativa o atención lineal. El run record del proyecto reporta el entrenamiento completado y la auditoría de cómputo acumulada del trainer, pero la auditoría independiente de solo lectura está pendiente según la propia model card.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo de preentrenamiento puro: no se ha ajustado para instrucciones, chat ni tareas específicas.
- No hay evidencia disponible de soporte de tool calling ni function calling.
- No hay evidencia disponible de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- No se declaran capacidades de visión, audio ni modo "thinking".
- El tokenizador es tiktoken con tokens especiales (`<|bos|>`), definido explícitamente en el repositorio.

## Casos de uso

- Investigación en arquitecturas recursivas: el modelo sirve como línea base de control para medir el efecto del parameter sharing frente a variantes looped adaptativas de la misma familia, usando la métrica de validación BPB y CORE-22 reportadas.
- Reproducción de experimentos de eficiencia de parámetros: al tener menos de mil millones de parámetros y un bucle fijo de dos pasadas, permite estudiar la relación entre parámetros efectivos y calidad con un coste de cómputo contenido.
- Evaluación comparativa de tokenizadores: al incluir un tokenizador tiktoken en formato JSON, se puede analizar su impacto en la compresión y en la perplejidad frente a otros modelos.
- Estudio de dinámicas de entrenamiento en bucles fijos: el checkpoint permite inspeccionar cómo se comporta un núcleo compartido aplicado dos veces sobre secuencias de hasta 2.048 tokens.
- Generación de texto de dominio general a pequeña escala: útil para pruebas de infraestructura de inferencia (carga de safetensors, integración con el paquete `nexttransformer`) en entornos de investigación.
- Docencia y experimentación académica: modelo pequeño (2,8 GB de repositorio) que cabe en CPU y en GPU de consumo para demostrar conceptos de pesos compartidos y recurrencia en transformers.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0.6757 |
| CORE-22 (×100) | 32.45 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 927.990.968 parámetros, en fp32 serían aproximadamente 3,7 GB; en bf16/fp16, unos 1,9 GB; en cuantización de 8 bits, unos 0,9 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32, o 2 GB para bf16. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas.
- El ejemplo oficial de la model card ejecuta la inferencia en CPU (`CUDA_VISIBLE_DEVICES=""`), lo que confirma que el modelo es viable sin GPU.
- Opciones de despliegue: el paquete `nexttransformer` (implementación de referencia, fijada a un commit) más `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NextTransformer Fixed-Recursive | 927.990.968 | 2.048 | no disponible | Hugging Face, pesos safetensors |
| Modelos looped adaptativos de NextTransformer | no disponible | no disponible | no disponible | misma familia, según el proyecto |
| Transformers causales pequeños de referencia (p. ej. GPT-2 small, ~124M; GPT-2 medium, ~355M) | 124M / 355M | 1.024 | MIT (GPT-2) | ampliamente disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable más allá de parámetros y contexto.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento sin ajuste instructivo: no está pensado para uso directo en aplicaciones de usuario final.
- Contexto muy limitado (2.048 tokens), insuficiente para la mayoría de casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y de generar contenido sesgado o incorrecto, propio de un modelo preentrenado sin alineamiento.
- La auditoría independiente del run de entrenamiento está pendiente según la model card, lo que limita la confianza en la reproducibilidad completa.
- La implementación de referencia está fijada a un commit concreto del repositorio de GitHub; cambios posteriores en el paquete `nexttransformer` podrían romper la carga de pesos.
- No se documentan mecanismos de seguridad, filtrado ni evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/Fixed-Recursive-49B-Tokens
- Repositorio del proyecto NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura: https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/methods/fixed_recursive.json
- Run record del entrenamiento: https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/runs/fixed_recursive.json
