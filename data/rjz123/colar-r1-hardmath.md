# rjz123/colar-r1-hardmath

## Resumen

El modelo `rjz123/colar-r1-hardmath` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo de 1.500 millones de parámetros destilado de DeepSeek-R1. El adaptador se ha ajustado mediante un proceso de CoT a CoLaR-SFT (Chain-of-Thought a Latent Reasoning) sobre los conjuntos de datos GSM8K y MATH, con configuración de compresión 4 y 20 épocas de entrenamiento. El objetivo es convertir el razonamiento explícito en cadenas de pensamiento en un razonamiento latente comprimido, reduciendo la latencia de inferencia manteniendo la precisión matemática.

El modelo es un artefacto de investigación: los pesos se almacenan en un checkpoint de PyTorch-Lightning que no es cargable directamente con `AutoModel`. Requiere un scaffold personalizado que combina el modelo base, un resize del token de padding, LoRA de rango 128 en Q/V y una MLP `LatentPolicy` para el razonamiento latente. La relevancia actual reside en la exploración de alternativas al razonamiento explícito tipo CoT para reducir costes computacionales en tareas matemáticas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (DeepSeek-R1-Distill-Qwen-1.5B) + adaptador LoRA (r=128 en Q/V) + MLP LatentPolicy |
| Parametros totales | No disponible (modelo base: 1.500 millones; adaptador LoRA: ~0.1 GB en repo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del base: 32.768 tokens segun configuracion de DeepSeek-R1-Distill-Qwen-1.5B) |
| Tipos de cuantizacion | No disponible (checkpoint en formato PyTorch-Lightning, no cuantizado) |
| Idiomas soportados | No disponibles (el base soporta ingles y chino principalmente) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con `state_dict` anidado; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se construye sobre DeepSeek-R1-Distill-Qwen-1.5B, un modelo transformer decoder con atención completa y 32 capas. El entrenamiento sigue el enfoque CoLaR (Compressed Latent Reasoning), que consiste en convertir las cadenas de razonamiento explícitas (CoT) generadas por el modelo R1 en representaciones latentes comprimidas. El proceso SFT (supervised fine-tuning) utiliza los datasets GSM8K y MATH, con una configuración de compresión de 4 (es decir, se comprime el razonamiento en un factor de 4) y un máximo de 64 tokens latentes (`COLAR_MAXLAT=64`). El adaptador incluye LoRA de rango 128 aplicado a las proyecciones Q y V, y una MLP `LatentPolicy` que genera los vectores latentes. El checkpoint se guarda con PyTorch-Lightning y requiere `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` para su carga.

No se dispone de detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La información disponible se limita a la configuración de hiperparámetros mencionada en la model card.

## Capacidades

- Generación de texto con razonamiento matemático avanzado: el modelo está especializado en problemas de GSM8K y MATH, con capacidad para resolver problemas aritméticos y algebraicos de nivel escolar y de competición.
- Razonamiento latente comprimido: en lugar de generar cadenas de pensamiento explícitas, produce representaciones latentes que se decodifican en la respuesta final, reduciendo el número de tokens generados.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: limitado al razonamiento matemático; no se documentan capacidades de planificación multi-paso general.
- Capacidades multilingües: no disponibles; el modelo base DeepSeek-R1-Distill-Qwen-1.5B está entrenado principalmente en inglés y chino, pero no se especifica el comportamiento del adaptador en otros idiomas.
- Capacidades especiales: razonamiento latente (CoLaR), que es la innovación principal; no incluye visión ni audio.

## Casos de uso

- Investigación en razonamiento comprimido: el modelo sirve como banco de pruebas para comparar la eficiencia del razonamiento latente frente al CoT explícito en tareas matemáticas. Un investigador puede cargar el checkpoint con el scaffold CoLaR y medir la latencia y precisión en GSM8K y MATH.
- Optimización de inferencia en entornos con recursos limitados: al comprimir el razonamiento en un factor de 4, el modelo reduce el número de tokens generados, lo que puede ser útil en despliegues edge o en APIs con coste por token. Un desarrollador puede integrarlo en un servicio de resolución de problemas matemáticos donde la latencia sea crítica.
- Generación de soluciones paso a paso a partir de latentes: aunque el razonamiento es latente, el modelo puede decodificar la respuesta final; se puede usar para generar soluciones a problemas de matemáticas de nivel GSM8K/MATH en entornos educativos automatizados.
- Evaluación de técnicas de destilación de razonamiento: el adaptador permite estudiar cómo un modelo destilado (Qwen-1.5B) puede aprender a razonar sin emitir texto intermedio, lo que es relevante para el diseño de modelos más eficientes.
- Benchmark de HARDMath: el nombre del modelo sugiere su uso en el benchmark HARDMath (problemas de matemáticas aplicadas avanzadas), aunque no se confirma en la documentación. Podría emplearse para probar límites en problemas de aproximación asintótica.
- Prototipado de pipelines de razonamiento latente: desarrolladores que trabajen con el framework CoLaR pueden usar este checkpoint como punto de partida para fine-tuning adicional o para integrarlo en sistemas de preguntas-respuesta matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión en GSM8K, MATH ni otros conjuntos. No se puede comparar cuantitativamente con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo base DeepSeek-R1-Distill-Qwen-1.5B requiere aproximadamente 3-4 GB en FP16 para inferencia. El adaptador LoRA añade un overhead mínimo (0.1 GB). Con cuantización 4-bit, podría caber en ~1.5-2 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4). Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-16 GB (RTX 3080, A10, L4).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media con 6-8 GB de VRAM si se usa FP16 o cuantización externa.
- Opciones de despliegue: al ser un checkpoint de PyTorch-Lightning no estándar, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere un script personalizado que cargue el scaffold CoLaR y el state_dict. Para producción, habría que convertir los pesos a un formato estándar (safetensors) o reimplementar la arquitectura en un framework de inferencia.
- Latencia y throughput: no disponibles. El objetivo del razonamiento latente es reducir la latencia frente al CoT, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa. El modelo es un adaptador experimental sobre DeepSeek-R1-Distill-Qwen-1.5B, y no se conocen otros modelos públicos que implementen CoLaR con las mismas características. Como referencia, el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene 1.500 millones de parámetros, contexto de 32.768 tokens y licencia MIT (aunque el adaptador no especifica licencia). Alternativas de razonamiento matemático del mismo tamaño incluyen Qwen2.5-Math-1.5B-Instruct o Llama-3.2-1B-Instruct, pero no son directamente comparables por la diferencia en el enfoque de razonamiento latente.

## Limitaciones y advertencias

- No es un modelo autocontenido: requiere el scaffold CoLaR completo (modelo base + LoRA + LatentPolicy) y un entorno de ejecución específico. No se puede cargar con `AutoModel` ni con bibliotecas estándar.
- Licencia no disponible: no se indica la licencia del adaptador, lo que impide conocer las restricciones de uso comercial. El modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene licencia MIT, pero el adaptador podría tener condiciones diferentes.
- Riesgo de alucinación: al ser un modelo de 1.500 millones de parámetros especializado en matemáticas, puede generar respuestas incorrectas o inventar pasos en problemas fuera de su distribución de entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base está principalmente en inglés y chino, por lo que su rendimiento en español u otros idiomas es incierto.
- Sesgos conocidos: no se documentan, pero al entrenarse sobre GSM8K y MATH (conjuntos en inglés), puede presentar sesgos hacia formatos de problemas occidentales y terminología matemática en inglés.
- Formato de checkpoint obsoleto: requiere `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` y carga con `strict=False`, lo que indica posible incompatibilidad con versiones recientes de PyTorch.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el razonamiento latente mantenga la precisión del CoT original en este modelo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un artefacto de investigación no validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/colar-r1-hardmath
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper HARDMath (OpenReview): https://openreview.net/attachment?id=nDTvP6tBMd&name=pdf
- Paper HARDMath (HuggingFace): https://huggingface.co/papers/2410.09988
- arXiv HARDMath: https://arxiv.org/abs/2410.09988
