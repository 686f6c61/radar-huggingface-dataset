# AstroTernary/Nogueira-0.0.4

## Resumen

Nogueira 0.0.4 es un modelo de lenguaje de investigación desarrollado por AstroTernary dentro del proyecto de código abierto [cansei-de-esperar](https://github.com/riknog/cansei-de-esperar). Se trata de un modelo de aproximadamente 25 millones de parámetros entrenado íntegramente en aritmética ternaria (pesos en {-1, 0, +1}, esquema BitNet b1.58) desde el primer paso del entrenamiento, no mediante cuantización posterior. Está especializado en portugués y orientado a diálogo, uso de herramientas y razonamiento sobre relaciones explícitas entre entidades.

La novedad principal de esta versión es el denominado "canal de lógica" (inspirado en el proyecto Nexo, `riknog/embedding-gemma`): durante la generación, el modelo construye un grafo con los nombres presentes en el mensaje del usuario, lo recorre salto a salto siguiendo relaciones aprendidas con supervisión y copia el resultado directamente en la salida mediante un mecanismo pointer-generator con una compuerta que decide cuándo copiar. Incorpora además una "cabeza de confianza" entrenada de forma conjunta que predice si el siguiente token será correcto.

El modelo es relevante como prueba de concepto de dos líneas de investigación: el entrenamiento nativo en ternario para modelos de muy bajo coste computacional y el razonamiento simbólico explícito sobre grafos como complemento a un transformer pequeño. No obstante, sus propios autores lo describen como un modelo de investigación con conocimiento del mundo muy limitado, propenso a inventar y con un tamaño de repositorio de solo 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58), capas "canon" y canal de lógica basado en grafo con pointer-generator |
| Parámetros totales | ~25 millones (ternarios) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Entrenamiento nativo ternario {-1, 0, +1} con escala por peso (W = q × scale); canal de lógica y cabeza de confianza en fp32 |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (`chat_ternary.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 25 millones de parámetros cuyos pesos se mantienen en representación ternaria desde el inicio del entrenamiento, siguiendo el paradigma BitNet b1.58: cada peso se expresa como W = q × scale, donde q pertenece a {-1, 0, +1} y scale es un factor de escala aprendido. La model card menciona capas denominadas "canon-layers" sin detallar su funcionamiento interno. El canal de lógica y la cabeza de confianza se almacenan en fp32 dentro del mismo fichero de pesos, mientras que el resto del modelo permanece en ternario.

El componente diferencial es el canal de lógica: en tiempo de inferencia el modelo construye un grafo a partir de los nombres detectados en la entrada del usuario, con enlaces de coincidencia exacta de palabra y relaciones dirigidas aprendidas mediante supervisión (un tipo de relación por pregunta durante el entrenamiento). El modelo recorre ese grafo salto a salto y el resultado se copia literalmente en la salida mediante un mecanismo pointer-generator con una compuerta aprendida que decide cuándo copiar. Adicionalmente, una cabeza de confianza entrenada junto al modelo predice la probabilidad de acierto del siguiente token. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card únicamente anuncia un entrenamiento futuro con "miles de millones de tokens nuevos" (sprint 007).

## Capacidades

- Generación de texto en portugués orientada a diálogo conversacional.
- Razonamiento sobre relaciones explícitas en grafos de hasta cuatro saltos (por ejemplo, "quién es el jefe del jefe del jefe de X"), con una tasa de acierto declarada del 85 % en relaciones de 1 a 4 saltos.
- Uso de herramientas (tool calling / function calling) con una tasa declarada del 98 % en llamada correcta y 97 % en respuesta correcta.
- Memoria conversacional dentro de la sesión (100 % declarado en la prueba de memoria en la conversación).
- Capacidad de corrección ante afirmaciones erróneas del usuario (93 % declarado) y de concordancia cuando el usuario acierta (93 %).
- Respuesta "no sé" ante preguntas imposibles (80 % declarado).
- Cabeza de confianza que estima la probabilidad de acierto del siguiente token.
- Razonamiento divergente, corrección y aritmética básica dentro del conjunto de pruebas de razonamiento total (76 % declarado).
- No dispone de capacidades de visión, audio ni multimodalidad según la información disponible.

## Casos de uso

- Demostración educativa de entrenamiento ternario nativo: el modelo sirve para ilustrar en cursos y talleres cómo se entrena una red BitNet b1.58 desde cero, con un coste de cómputo y almacenamiento mínimo (repositorio de 0,1 GB).
- Investigación en razonamiento simbólico sobre grafos: permite experimentar con el canal de lógica y el mecanismo pointer-generator para estudiar la combinación de recuperación estructurada y generación neuronal en modelos pequeños.
- Prototipado de asistentes conversacionales en portugués con memoria de sesión: adecuado para validar flujos de diálogo multi-turno antes de escalar a modelos mayores, gracias a su memoria conversacional declarada del 100 %.
- Pruebas de integración de tool calling en pipelines ligeros: su tasa declarada del 98 % en llamada correcta permite ensayar el cableado de funciones y validadores en entornos de desarrollo sin coste de GPU.
- Evaluación de calibración y abstención: la cabeza de confianza y la tasa del 80 % en respuestas "no sé" lo hacen útil para investigar mecanismos de abstención y detección de incertidumbre en modelos pequeños.
- Experimentos de destilación y comparación de arquitecturas: al ser un modelo de 25 M de parámetros, sirve como línea base ternaria frente a modelos densos pequeños en fp16 para medir la pérdida de calidad por la cuantización nativa.
- Docencia sobre limitaciones de los LLM: sus fallos documentados (mezcla de tipos de relación, invención de hechos) permiten ilustrar de forma controlada los riesgos de alucinación en modelos de conocimiento limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, comparando con la versión anterior 0.0.3:

| Prueba | 0.0.3 | 0.0.4 |
|---|---|---|
| Relaciones de 1 a 4 saltos ("quién es el jefe del jefe de X") | 8 % | 85 % |
| Razonamiento total (divergente, corrección, cuenta, relación) | 57,5 % | 76 % |
| Herramienta: llamada / respuesta correcta | 97 % / 97 % | 98 % / 97 % |
| Concordancia cuando el usuario acierta / corrección cuando se equivoca | 97 % / 77 % | 93 % / 93 % |
| "No sé" en preguntas imposibles | 80 % | 80 % |
| Memoria en la conversación | 100 % | 100 % |
| Pares mínimos: gramática / hechos | 95 % / 90 % | 95 % / 85 % |
| bpb (prosa) | 1,273 | 1,300 |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración, dado que el modelo tiene ~25 M de parámetros ternarios y el repositorio completo ocupa 0,1 GB; el canal de lógica y la cabeza de confianza en fp32 añaden una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de iGPU y CPU.
- Opciones de despliegue: la model card indica el script propio `python scripts/chat.py modelos/nogueira-0.0.4` o la descarga del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato ternario propietario probablemente requiera el código del proyecto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nogueira 0.0.4 | ~25 M (ternarios) | No disponible | BitNet b1.58 + grafo de razonamiento, solo portugués | MIT | Hugging Face |
| Nogueira 0.0.3 | ~25 M (ternarios) | No disponible | BitNet b1.58 sin canal de lógica | MIT | Hugging Face (versión anterior del mismo proyecto) |
| Modelos BitNet b1.58 publicados por Microsoft Research | 700 M a 3,9 B | Hasta 4 K (según variante) | Entrenamiento ternario nativo, multilingüe | MIT (según variante) | Hugging Face / repositorio de investigación |
| Modelos densos pequeños en fp16 (por ejemplo, familia Qwen2.5-0.5B) | ~500 M | 32 K | Transformer denso estándar, multilingüe | Apache 2.0 | Hugging Face |

La comparación con modelos de mayor tamaño no es directa en rendimiento: Nogueira 0.0.4 es un ejercicio de investigación centrado en el razonamiento sobre grafos en portugués, no un modelo de propósito general. No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa fiable con las alternativas citadas.

## Limitaciones y advertencias

- Modelo de investigación de ~25 M de parámetros: el conocimiento del mundo es muy limitado y el autor advierte explícitamente de que "a veces inventa".
- Las relaciones que mezclan tipos (por ejemplo, "la madre del padre del padre") siguen fallando, porque el entrenamiento empleó un único tipo de relación por pregunta.
- El rendimiento en pares mínimos de hechos baja del 90 % al 85 % respecto a la versión 0.0.3, y la perplejidad en prosa empeora ligeramente (bpb de 1,273 a 1,300).
- Soporte exclusivo del portugués; no se documentan capacidades multilingües.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.
- El formato de pesos ternario propietario y la dependencia del script del proyecto limitan la portabilidad a frameworks de inferencia estándar.
- Licencia MIT: permite uso comercial, pero el propio autor lo califica de modelo de investigación y no recomienda su uso en producción para tareas que requieran conocimiento factual fiable.
- La tasa declarada del 80 % en respuestas "no sé" implica que en aproximadamente una de cada cinco preguntas imposibles el modelo podría responder sin abstenerse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AstroTernary/Nogueira-0.0.4
- Proyecto cansei-de-esperar: https://github.com/riknog/cansei-de-esperar
- Proyecto Nexo (referencia del canal de lógica): `riknog/embedding-gemma` (referenciado en la model card; no se proporciona URL directa en la información disponible)
