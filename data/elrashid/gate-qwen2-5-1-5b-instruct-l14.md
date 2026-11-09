# elrashid/gate-qwen2.5-1.5b-instruct-l14

## Resumen

`elrashid/gate-qwen2.5-1.5b-instruct-l14` es un clasificador de seguridad (guardrail) construido sobre `Qwen/Qwen2.5-1.5B-Instruct`. No es un modelo generativo: es una compuerta de seguridad que lee la activación residual de la capa 14 del modelo base ante un prompt de entrada y devuelve la probabilidad de que dicho prompt sea dañino, antes de que se genere el primer token de salida. Lo desarrolla elrashid en el marco de la tesis de máster «The Refusal Slope» (BUiD) y se publica con licencia MIT.

Técnicamente, la compuerta es una regresión logística entrenada sobre características extraídas por un autoencoder disperso (SAE), concretamente el compañero `elrashid/sae-qwen2.5-1.5b-instruct-topk-l14`. La idea es aprovechar la interpretabilidad mecanicista: en lugar de clasificar el texto superficial del prompt, se clasifica su representación interna en una capa intermedia, lo que permite detectar intenciones dañinas con independencia de la formulación léxica.

Su relevancia es doble. Por un lado, ofrece un mecanismo de moderación de entrada de bajo coste computacional (una regresión logística sobre un vector disperso) acoplado a un modelo de 1,5B parámetros, desplegable en hardware modesto. Por otro, sirve como artefacto reproducible para investigar cómo se distribuye la señal de rechazo en las capas de un transformer pequeño. El repositorio está restringido (gated) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre características de un sparse autoencoder (SAE top-k) extraídas de la activación residual de la capa 14 de Qwen2.5-1.5B-Instruct |
| Parámetros totales | No disponible (el clasificador es una regresión logística; el modelo base tiene 1,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-1.5B-Instruct, no especificada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | No disponible |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Capa de extracción | 14 (residual stream) |
| SAE compañero | elrashid/sae-qwen2.5-1.5b-instruct-topk-l14 |
| Salida | P(harmful) sobre el prompt de entrada |
| Acceso | Restringido (gated) en Hugging Face |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La compuerta no modifica ni afina el modelo base. El flujo es: se pasa el prompt por Qwen2.5-1.5B-Instruct, se captura la activación residual en la capa 14, se proyecta sobre el diccionario del SAE top-k compañero para obtener un vector de características dispersas y, sobre ese vector, una regresión logística produce la probabilidad de daño. Se trata, por tanto, de un clasificador lineal en el espacio de características del SAE, lo que lo hace extremadamente ligero en inferencia comparado con el propio forward pass del transformer.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1,5B parámetros afinado por instrucciones, desarrollado por Alibaba Qwen; los detalles de su entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) no se detallan en la información proporcionada. Sobre la compuerta en sí, la información disponible indica que forma parte de la tesis «The Refusal Slope» (BUiD) y que se apoya en un SAE top-k entrenado específicamente sobre la capa 14 del mismo modelo; no se especifican el volumen del conjunto de entrenamiento del clasificador, la composición de las etiquetas de daño ni el procedimiento de validación.

## Capacidades

- Clasificación de prompts como dañinos o no dañinos mediante una probabilidad P(harmful) calculada antes de la generación.
- Detección basada en representación interna (capa 14) en lugar de coincidencia léxica, lo que en principio la hace menos sensible a reformulaciones superficiales.
- Integración como etapa previa (pre-filter) en pipelines de moderación de entrada.
- Aprovechamiento de características interpretables del SAE, lo que permite inspeccionar qué direcciones del espacio latente contribuyen a la decisión.
- No realiza generación de texto, razonamiento, código, matemáticas, visión, tool calling ni funciones de agente: su única salida es la puntuación de seguridad.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base y del SAE, sin datos publicados).

## Casos de uso

- Moderación de entrada en APIs de chat: colocar la compuerta delante del modelo generativo para descartar prompts dañinos antes de gastar cómputo en la generación completa, con un coste marginal de una regresión logística sobre un vector disperso.
- Filtrado previo en sistemas de atención al cliente: bloquear intentos de jailbreak o solicitudes abusivas antes de que lleguen al modelo de producción, reduciendo el riesgo de respuestas no conformes.
- Investigación en interpretabilidad: usar la compuerta y su SAE compañero para estudiar qué características de la capa 14 correlacionan con la intención dañina y cómo se distribuye la señal de rechazo entre capas.
- Evaluación comparativa de guardrails: servir como línea base ligera frente a clasificadores de seguridad neuronales de mayor tamaño, midiendo el compromiso entre coste y tasa de detección.
- Despliegue en entornos con recursos limitados: al requerir solo un forward pass de un modelo de 1,5B más una regresión logística, puede ejecutarse en GPU consumer o incluso en CPU para lotes pequeños.
- Auditoría de conjuntos de prompts: puntuar grandes lotes de prompts de un dataset antes de su uso en entrenamiento o evaluación, etiquetando preliminarmente los potencialmente dañinos.
- Prototipado de políticas de seguridad: permitir a equipos de seguridad ajustar umbrales sobre P(harmful) sin reentrenar el modelo generativo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base Qwen2.5-1.5B-Instruct requiere un forward pass completo para extraer la activación de la capa 14; en FP16 supone aproximadamente 3 GB de pesos, más memoria para activaciones y KV cache.
- VRAM estimada para el modelo base en FP16: en torno a 3-4 GB; en cuantización de 8 bits, aproximadamente 2 GB; en 4 bits, alrededor de 1 GB (estimaciones a partir del tamaño del modelo, no confirmadas en la información).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060, RTX 4090, A100, H100); para cuantización 4/8 bits basta con GPUs de 4-6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más, dependiendo de la cuantización.
- Opciones de despliegue: el modelo base es compatible con vLLM, llama.cpp, Ollama y TGI; la compuerta en sí requiere acceso a las activaciones internas, por lo que necesita ejecutarse con un framework que exponga los estados ocultos (por ejemplo, Transformers con `output_hidden_states=True`), no solo con servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| elrashid/gate-qwen2.5-1.5b-instruct-l14 | Guardrail (regresión logística sobre SAE) | No disponible (base 1,5B) | No disponible | MIT | Gated |
| Qwen/Qwen2.5-1.5B-Instruct | Modelo generativo | 1,5B | No disponible en la información | No disponible en la información | Público |
| elrashid/sae-qwen2.5-1.5b-instruct-topk-l14 | SAE top-k (componente) | No disponible | No aplica | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros guardrails comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La compuerta clasifica únicamente el prompt de entrada; no inspecciona la respuesta generada, por lo que no protege frente a salidas dañinas producidas a partir de entradas benignas.
- Al depender de la activación de la capa 14 del modelo base, cualquier cambio de modelo, de versión o de tokenizador invalida la compuerta; está acoplada a Qwen2.5-1.5B-Instruct.
- No hay datos publicados sobre tasas de falsos positivos y falsos negativos, sesgos demográficos o de dominio, ni sobre robustez frente a ataques adversariales.
- El repositorio está restringido (gated): su uso requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada.
- El tamaño del repositorio aparece como 0,0 GB, lo que sugiere que los pesos podrían no estar alojados en el propio repositorio o que la información está incompleta; conviene verificar antes de integrarlo en producción.
- Licencia MIT para la compuerta, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia, que debe revisarse por separado para uso comercial.
- No se especifican los idiomas cubiertos por el SAE ni por el clasificador; el rendimiento fuera del inglés es desconocido.
- Es un artefacto de investigación (tesis de máster), sin historial de uso en producción ni mantenimiento documentado.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/elrashid/gate-qwen2.5-1.5b-instruct-l14
- SAE compañero: https://huggingface.co/elrashid/sae-qwen2.5-1.5b-instruct-topk-l14
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- DOI: 10.57967/hf/9430
