# Astrosully/Kyro-29M-Instruct

## Resumen

Kyro-29M-Instruct es un modelo de lenguaje de 29,1 millones de parámetros desarrollado por Astrosully, consistente en la versión ajustada por instrucciones del modelo base Kyro-29M. El modelo base fue preentrenado desde cero sobre 30.000 millones de tokens en inglés, y esta variante se ha afinado mediante supervisión (SFT) sobre el dataset smol-smoltalk para responder a instrucciones de un solo turno. Su relevancia radica en ser un ejemplo de modelo minúsculo entrenado de forma íntegra y reproducible, útil para experimentación, docencia y despliegue en entornos con recursos extremadamente limitados.

El modelo resuelve el problema de disponer de un generador de texto instruction-tuned que quepa en cualquier hardware, incluido un entorno de CPU o una GPU de gama baja. No obstante, a esta escala de parámetros el modelo aprende el formato y el tono de una respuesta, pero no dispone de conocimiento factual fiable. La arquitectura concreta no se detalla en la model card, más allá de que es un transformer de 29,1M de parámetros con un contexto de 512 tokens y tokenizador basado en tiktoken.

La ficha técnica disponible es escasa: no se publican resultados de benchmarks, ni detalles de la arquitectura interna, ni información sobre el dataset de preentrenamiento más allá de su volumen. El ajuste se realizó en unos 17 minutos sobre una RTX 5090, lo que subraya su carácter de proyecto ligero y accesible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parámetros totales | 29.125.844 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo base Kyro-29M fue preentrenado desde cero sobre 30.000 millones de tokens en inglés. La model card del modelo base es la que cubre la arquitectura, el proceso de diseño asistido por agentes y los datos de preentrenamiento; esta ficha no reproduce esos detalles porque no se incluyen en la información disponible. El tokenizador se basa en tiktoken y el contexto está limitado a 512 tokens.

El ajuste por instrucciones se realizó sobre el dataset smol-smoltalk (Apache-2.0), tomando el primer turno usuario→asistente de cada conversación. Se usaron 331.346 ejemplos de entrenamiento (los que caben en 512 tokens) y 500 de validación, con 88,8M de tokens supervisados sobre 169,6M totales (la pérdida se calcula solo sobre los tokens de respuesta). El empaquetado agrupa ejemplos completos en filas de 512 tokens sin dividirlos. Se empleó AdamW con lr 3e-4, decaimiento coseno hasta 1e-6, 3% de warmup, sin weight decay y grad clip 1.0, con batch de 32 × 512 tokens durante 2 épocas (20.708 pasos), aproximadamente 17 minutos en una RTX 5090. La pérdida final de validación fue 1,471 (perplejidad 4,35) sobre tokens de respuesta. El learning rate se eligió mediante un barrido de una época: 1e-4 dio 1,581, 3e-4 dio 1,526 y 1e-3 dio 1,549.

## Capacidades

- Generación de texto en inglés con formato de instrucción de un solo turno.
- Respuesta a instrucciones simples siguiendo la plantilla exacta de entrenamiento (`### Instruction:` / `### Response:`).
- Estructuración de respuestas en listas y párrafos cuando la instrucción lo pide.
- Finalización de respuesta mediante el token `<|assistant_end|>` (id 16379).
- Soporte de system prompt únicamente si se coloca al principio de la instrucción, tal como se hizo en el entrenamiento.
- No dispone de memoria multi-turno: solo gestiona un turno por conversación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Experimentación y docencia: sirve para ilustrar el ciclo completo de preentrenamiento y SFT de un modelo pequeño, con un coste de entrenamiento de minutos en una GPU consumer.
- Pruebas de pipelines de generación de texto: permite validar integraciones con HuggingFace Hub, safetensors y tokenizadores tiktoken sin consumir recursos significativos.
- Despliegue en entornos con recursos mínimos: al ocupar 0,1 GB en el repositorio, puede ejecutarse en CPU o en GPUs de gama baja para tareas de demostración.
- Generación de respuestas con formato controlado: útil para probar plantillas de prompt y evaluar el cumplimiento de formato en instrucciones simples.
- Baseline para comparativas: sirve como referencia de un modelo instruction-tuned de 29M parámetros frente a modelos mayores en estudios de escalado.
- Prototipado de asistentes de un solo turno: adecuado para maquetar interfaces de chat donde la corrección factual no sea crítica y solo se evalúe el formato y el tono.
- Investigación sobre alucinación a pequeña escala: su tendencia documentada a inventar detalles lo hace útil para estudiar el fenómeno en modelos minúsculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación del ajuste (1,471, perplejidad 4,35 sobre tokens de respuesta) y los resultados del barrido de learning rate.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (29,1M de parámetros en fp32 ≈ 116 MB de pesos), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer moderna; el ajuste se realizó en una RTX 5090 en unos 17 minutos, pero la inferencia funciona en CPU.
- Cabe en cualquier GPU consumer, incluidas integradas y GPUs de gama baja, así como en CPU.
- Opciones de despliegue: la model card proporciona un script propio `modeling_kyro.py` con función `load()` y modo `--chat`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Kyro-29M-Instruct | 29,1M | 512 | Apache-2.0 | en | Instruction-tuned con smol-smoltalk; sin benchmarks publicados |
| SmolLM-135M-Instruct | 135M | no disponible en esta ficha | Apache-2.0 | en (principalmente) | Alternativa de mayor tamaño de HuggingFaceTB; datos no verificados aquí |
| Modelos de <50M parámetros instruction-tuned | variable | variable | variable | variable | No se dispone de comparativas verificadas en la información proporcionada |

No se dispone de datos de rendimiento comparativo verificable en la información proporcionada; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Conocimiento del mundo muy débil y frecuente invención de hechos; la propia model card advierte de que el ajuste enseña el formato, no el conocimiento.
- Solo inglés; no soporta otros idiomas.
- Contexto limitado a 512 tokens.
- Sin ajuste de seguridad (no safety tuning): puede generar contenido inapropiado.
- Sin memoria multi-turno: solo responde a un turno por conversación.
- Tendencia documentada a rellenar respuestas con detalles plausibles pero inventados.
- No debe usarse en aplicaciones donde la corrección factual sea crítica.
- Licencia Apache-2.0 para pesos y código; los datos de ajuste (smol-smoltalk) son Apache-2.0, pero las licencias de los datos de preentrenamiento se remiten a la model card de Kyro-29M y no se detallan aquí.
- Sin benchmarks publicados, por lo que no es posible evaluar su rendimiento relativo de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Astrosully/Kyro-29M-Instruct
- Modelo base Kyro-29M: https://huggingface.co/Astrosully/Kyro-29M
- Dataset de ajuste smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
