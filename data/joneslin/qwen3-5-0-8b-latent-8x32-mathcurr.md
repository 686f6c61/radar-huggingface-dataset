# JonesLin/qwen3.5-0.8b-latent-8x32-mathcurr

## Resumen

Este checkpoint es un modelo de investigación de razonamiento latente construido sobre Qwen3.5-0.8B, desarrollado por el usuario JonesLin. En lugar de generar una cadena de pensamiento explícita (CoT) en texto, el modelo procesa el problema y ejecuta una cadena de 8 grupos de 32 vectores latentes, donde cada grupo supone una pasada completa por los 24 bloques del backbone, para después escribir directamente la respuesta. El objetivo es explorar si el razonamiento interno en espacio latente puede sustituir a la CoT textual manteniendo una calidad aceptable.

El modelo parte de una arquitectura transformer densa de aproximadamente 0,8 mil millones de parámetros (Qwen3.5-0.8B) y se afina con un currículo matemático en tres etapas sobre GSM8K-Aug y subconjuntos de OpenMathInstruct2. Es relevante ahora como pieza de investigación en la línea de razonamiento implícito o latente, ya que cuantifica el coste de prescindir de la CoT explícita: rinde claramente por debajo de una CoT textual de referencia, pero demuestra que las representaciones latentes transportan información útil para resolver problemas matemáticos.

Se distribuye con licencia Apache 2.0 y solo en inglés. No es un modelo listo para producción: requiere el código del proyecto `next_jev` para cargarse, ya que no implementa una arquitectura estándar de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B) con razonamiento latente: 8 grupos de 32 latentes, cada grupo una pasada por los 24 bloques; decodificador CoT auxiliar |
| Parametros totales | ~0,8 mil millones (backbone Qwen3.5-0.8B); total exacto con latentes y decodificador CoT no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en `checkpoint.pt`, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `checkpoint.pt` (PyTorch, `torch.load` con `weights_only=True`), `model_config.json` y `processor/` |

## Arquitectura y entrenamiento

El backbone es un transformer denso de 24 bloques (Qwen3.5-0.8B). Sobre él se añade un mecanismo de razonamiento latente: el grupo 1 lee 32 tokens aprendidos; cada grupo posterior mezcla, ranura a ranura, una dirección fija compartida por todos los grupos (el token del grupo 1 en esa ranura) con el estado de la última capa del grupo anterior, a partes iguales y reescalado al tamaño del token (desviación estándar por dimensión de 0,3). Los gradientes fluyen hacia atrás a lo largo de la cadena. La señal de entrenamiento combina la entropía cruzada de la respuesta tras el último grupo con 3 veces una pérdida de reconstrucción de la CoT. El decodificador CoT es una copia del último bloque con atención cruzada sobre los 256 latentes y autoatención sobre los 4 tokens CoT previos; se incluye en el checkpoint pero no se usa para responder.

El entrenamiento se organiza en tres etapas: 2 épocas de GSM8K-Aug (GSM8K aumentado del proyecto *implicit chain of thought*, usando los pasos `<<…>>` como CoT) partiendo de Qwen3.5-0.8B; 3 épocas sobre el subconjunto `math4` de JonesLin/openmathinstruct2-steps-cot (83.539 problemas de estilo MATH con CoT de como máximo 4 pasos); y 3 épocas sobre el conjunto `full` del mismo dataset. Todas las etapas usan batch global de 96, schedule warmup-cosine con learning rate base 5e-5 (backbone a 0,125×, tokens latentes a 0,5× y decodificador CoT a 2×). Se conservó el último checkpoint de cada etapa, sin selección sobre los conjuntos de evaluación.

## Capacidades

- Razonamiento matemático mediante latentes internos: resuelve problemas de estilo GSM8K y MATH sin emitir cadena de pensamiento textual.
- Generación de respuesta directa tras 8 grupos de latentes (sin salida temprana).
- Reconstrucción de CoT mediante el decodificador auxiliar incluido en el checkpoint (no usado para responder).
- Comprensión de problemas matemáticos en inglés con CoT de hasta 4 pasos en el entrenamiento principal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en texto.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en razonamiento latente: servir como checkpoint de referencia para estudiar si los estados latentes sustituyen a la CoT textual, comparando sus resultados (25,2 en MATH-500, 64,6 en GSM8K) con una CoT explícita de referencia (42,6 y 73,0).
- Análisis de interpretabilidad: inspeccionar los 256 latentes y el efecto de sustituir los grupos 2–8 por los de otro problema, que hace caer MATH-500 de 25,0 a 12,4, para estudiar qué información codifica cada grupo.
- Reproducción de experimentos: reentrenar o extender el currículo matemático con el código `next_jev` y el dataset JonesLin/openmathinstruct2-steps-cot para validar resultados.
- Evaluación de eficiencia de inferencia: medir el coste de 8 pasadas completas por los 24 bloques frente a la generación de CoT token a token en un modelo de 0,8B.
- Docencia y divulgación: ilustrar arquitecturas de razonamiento implícito en cursos o artículos técnicos con un caso reproducible y de tamaño reducido.
- Base para experimentos de destilación: usar el decodificador CoT auxiliar para extraer cadenas de razonamiento y compararlas con las generadas por modelos de CoT explícita.

## Benchmarks y rendimiento

Decodificación greedy; la respuesta se escribe tras los 8 grupos, sin salida temprana.

| Modelo | MATH-500 | GSM8K test |
|---|---|---|
| Este checkpoint | 25,2 | 64,6 |
| CoT explícita, GSM8K-Aug y después el conjunto `full`, como referencia | 42,6 | 73,0 |

Prueba de dependencia de los latentes: sustituir los grupos 2–8 por los latentes de otro problema reduce MATH-500 de 25,0 a 12,4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repo (3,5 GB) y los ~0,8B de parámetros, un checkpoint en fp32 rondaría los 3,2 GB y en fp16 unos 1,6 GB, pero no se confirma el dtype de los pesos.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 8 GB de VRAM debería alojar el modelo en precisión reducida, aunque no se documenta.
- ¿Cabe en GPU consumer? Probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está verificado en la model card.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere el código del proyecto `next_jev` (commit `a5f054d` de la rama `feat/explicit-cot-latent`) y la función `load_checkpoint`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint | ~0,8B | No disponible | 25,2 | 64,6 | Apache 2.0 | Hugging Face, requiere `next_jev` |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | No disponible | No disponible | No disponible en la información | Hugging Face |
| CoT explícita de referencia (mismo backbone, según la model card) | ~0,8B | No disponible | 42,6 | 73,0 | No aplica | No disponible |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas de razonamiento latente en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a la CoT explícita de referencia: 25,2 frente a 42,6 en MATH-500 y 64,6 frente a 73,0 en GSM8K.
- No es un modelo de producción: no implementa una arquitectura de `transformers` y exige el código `next_jev` para cargarse.
- Solo inglés; no se documenta soporte de otros idiomas.
- Entrenado exclusivamente con datos matemáticos (GSM8K-Aug y OpenMathInstruct2), por lo que el rendimiento fuera de ese dominio es desconocido y probablemente pobre.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de sesgo ni de robustez.
- Longitud de contexto no documentada, lo que impide planificar su uso con problemas largos.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM.
- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la dependencia de código externo desaconsejan su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonesLin/qwen3.5-0.8b-latent-8x32-mathcurr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/JonesLin/openmathinstruct2-steps-cot
- Proyecto *implicit chain of thought* (GSM8K-Aug): https://github.com/da03/implicit_chain_of_thought
