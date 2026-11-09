# hoyporti/qwen3-1.7b-eagle3-switchboard

## Resumen

`hoyporti/qwen3-1.7b-eagle3-switchboard` es una cabeza drafteadora EAGLE-3 para el modelo Qwen3-1.7B de Alibaba Qwen. No es un modelo generativo completo, sino un componente de decodificación especulativa: una única capa de decodificador que predice el siguiente token a partir de los estados ocultos del modelo objetivo (tras las capas 1, 13 y 24) y del token posterior, y que Qwen3-1.7B verifica en una sola pasada forward. Con decodificación greedy, el texto resultante es idéntico byte a byte al que produciría Qwen3-1.7B en solitario.

El modelo lo publica el usuario hoyporti como parte del proyecto de código abierto switchboard, y parte de la cabeza EAGLE-3 de AngelSlim (`AngelSlim/Qwen3-1.7B_eagle3`, Apache 2.0). Sobre esa base se reentrenó durante 2 épocas adicionales con 9.337 prompts (6.837 titulares de Hacker News y 2.500 primeros turnos en inglés de OpenAssistant oasst1), con el modo thinking desactivado y usando como referencia las respuestas greedy del propio Qwen3-1.7B. El entrenamiento desenrolla la cabeza 4 pasos sobre sus propias salidas y tardó unos 90 minutos en una RTX 4070 de portátil.

Su relevancia es práctica: acelera la inferencia de Qwen3-1.7B entre 1,6 y 1,9 veces en 4 hilos de CPU (Ryzen 7 7745HX, fp32) sin alterar el texto, con un tamaño de tan solo 137 millones de parámetros (0,3 GB en fp16). Es un ejemplo de optimización de latencia en entornos sin GPU, donde el cuello de botella es la generación autoregresiva token a token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head: una capa de decodificador que consume estados ocultos de Qwen3-1.7B (capas 1, 13 y 24) mas el token siguiente |
| Parametros totales | 137.031.296 (137 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3-1.7B, no especificada en la model card) |
| Tipos de cuantizacion | fp16 (pesos publicados); el benchmark se realizo en fp32 |
| Idiomas soportados | no disponible de forma explicita; datos de entrenamiento en ingles (Hacker News + oasst1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16), con nombres EAGLE-3 habituales mas `d2t` y `t2d` para mapear vocabularios |

## Arquitectura y entrenamiento

La cabeza es una sola capa de transformer que actua como modelo borrador dentro de un esquema de decodificación especulativa EAGLE-3. Lee los hidden states del modelo objetivo en tres profundidades (capas 1, 13 y 24) junto con el token que las sigue, y predice el siguiente token sobre un vocabulario de 32.000 entradas. En cada paso de la cadena se realimenta con su propia salida, generando hasta 4 tokens candidatos que Qwen3-1.7B valida en un único forward pass. Los tensores `d2t` y `t2d` gestionan la correspondencia entre el vocabulario reducido de la cabeza y el de Qwen3-1.7B.

El entrenamiento parte de `AngelSlim/Qwen3-1.7B_eagle3` y añade 2 épocas sobre 9.337 prompts, con las respuestas greedy de Qwen3-1.7B (thinking off) como objetivo. El proceso desenrolla la cabeza 4 pasos sobre sus propias predicciones, replicando el régimen de inferencia, y puntua cada paso contra la distribución completa de siguiente token del modelo grande. No se menciona RLHF ni DPO; el ajuste es supervisado sobre distribuciones. La innovación clave es la aceleración medible con texto idéntico en greedy, siempre que los pesos se empaqueten para oneDNN (como hace `torch.compile` al congelar el modelo); con `F.linear` simple, el reempaquetado por llamada anula la mayor parte de la ganancia.

## Capacidades

- Decodificación especulativa: genera hasta 4 tokens candidatos por paso que el modelo objetivo verifica en una sola pasada.
- Preservación exacta de la salida: con greedy, el texto coincide con el de Qwen3-1.7B en solitario.
- Aceleración en CPU: 1,6 a 1,9 veces más rápido que Qwen3-1.7B solo en 4 hilos fp32 (Ryzen 7 7745HX).
- Precisión de borrador: el primer token acierta el 63,8% de las veces; el cuarto, el 55,0%, en 60 prompts retenidos.
- Integración con transformers y pesos safetensors.
- Bucle de decodificación de referencia en `switchboard/eagle.py` y scripts de entrenamiento en `training/`.
- No soporta tool calling, agentes, visión ni audio por sí misma: es un componente auxiliar, no un modelo conversacional.

## Casos de uso

- Atención al cliente en CPU: desplegar Qwen3-1.7B con esta cabeza en servidores sin GPU para reducir latencia de respuestas multi-turno, manteniendo el texto idéntico al modelo base en modo greedy.
- Procesamiento por lotes de titulares: el caso de la Figura 1 de switchboard, donde un job diario de GitHub explica el titular principal de Hacker News con 4 núcleos de CPU y lo compara con el modelo grande escribiendo solo.
- Resumen y explicación de noticias: usar el par para generar explicaciones en tres frases de titulares técnicos, con throughput mejorado en hardware modesto.
- Prototipado de pipelines de inferencia: servir Qwen3-1.7B con decodificación especulativa en entornos de desarrollo sin GPU para validar prompts y flujos antes de escalar.
- Evaluación de técnicas de aceleración: servir como referencia reproducible para medir ganancias de EAGLE-3 frente a decodificación autoregresiva estándar.
- Asistentes conversacionales de bajo coste: primeros turnos en inglés (estilo oasst1) con latencia reducida en portátiles o instancias CPU.
- Investigación en decodificación especulativa: base para experimentar con cabezas drafteadoras y estrategias de verificación sobre modelos pequeños.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 60 prompts retenidos (titulares de Hacker News de los 3 días posteriores al conjunto de entrenamiento y turnos de oasst1 no vistos):

| Metrica | Cabeza inicial (AngelSlim) | Esta cabeza | Mejora |
|---|---|---|---|
| Acierto del primer token | 44,0% | 63,8% | +19,8 puntos |
| Acierto del cuarto token en cadena | 28,2% | 55,0% | +26,8 puntos |

| Escenario de inferencia | Resultado |
|---|---|
| Ryzen 7 7745HX, 4 hilos, fp32, 4 tokens por pasada | 1,6x a 1,9x mas rapido que Qwen3-1.7B solo |
| Texto generado en greedy | Identico al de Qwen3-1.7B solo |
| Condicion | Pesos empaquetados para oneDNN una vez (como `torch.compile`) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; la cabeza no es un modelo evaluable de forma independiente en esas tareas.

## Requisitos de hardware

- VRAM estimada: unos 0,3 GB para la cabeza en fp16; el modelo objetivo Qwen3-1.7B requiere su propio presupuesto (aproximadamente 3,4 GB en fp16, no especificado en la model card).
- GPU recomendadas: RTX 4070 (usada para entrenar, unos 90 minutos); cualquier GPU con al menos 4-6 GB para el par completo en fp16.
- Cabe en GPU de consumo: sí, tanto la cabeza como el modelo objetivo en cuantizaciones razonables.
- Despliegue: transformers con el bucle `switchboard/eagle.py`; el benchmark se ejecutó en CPU con oneDNN y `torch.compile`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,6-1,9x de aceleración en 4 hilos CPU fp32; no se publican números absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoyporti/qwen3-1.7b-eagle3-switchboard | Cabeza EAGLE-3 para Qwen3-1.7B | 137 M | no disponible | Apache 2.0 | Hugging Face |
| AngelSlim/Qwen3-1.7B_eagle3 | Cabeza EAGLE-3 para Qwen3-1.7B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (sin cabeza) | LLM generativo | 1,7 B | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación de rendimiento directo solo es posible frente a la cabeza de AngelSlim: 63,8% frente a 44,0% en acierto del primer token y 55,0% frente a 28,2% en el cuarto. No se dispone de comparaciones con otras cabezas EAGLE-3 para Qwen3-1.7B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen3-1.7B como verificador; no genera texto por sí sola.
- La aceleración depende del empaquetado oneDNN de los pesos; con `F.linear` simple, el coste de verificación duplica el de escribir un token y anula la ganancia.
- Los datos de entrenamiento son en inglés (Hacker News y oasst1); el rendimiento en castellano u otros idiomas no está documentado.
- El modo thinking de Qwen3 está desactivado durante el entrenamiento; el comportamiento con thinking activo no se especifica.
- La cabeza está especializada en titulares técnicos y primeros turnos de conversación, lo que puede reducir su tasa de acierto fuera de esos dominios.
- Riesgo de alucinación: inherente al modelo objetivo; la cabeza no lo corrige, solo acelera la misma distribución.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base Qwen3-1.7B y de la cabeza original AngelSlim.
- Sin descargas ni likes en el momento de la consulta; proyecto reciente y de un solo autor, sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/hoyporti/qwen3-1.7b-eagle3-switchboard
- Cabeza base: https://huggingface.co/AngelSlim/Qwen3-1.7B_eagle3
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio switchboard: https://github.com/SomethingObvious/switchboard
- Dataset OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
