# andreayhchen/sherlock-qwen2.5-3b-dpo-v1

## Resumen

Sherlock-qwen2.5-3b-dpo-v1 es un ajuste fino de Qwen/Qwen2.5-3B-Instruct publicado por el usuario andreayhchen como entrega de la asignatura CS2881R (trabajo 1, semana 2, centrado en RLAIF). El objetivo declarado no es mejorar la capacidad matemática del modelo base, sino conseguir que resuelva problemas del dataset MATH de niveles 1-3 redactando la solución con la voz y la persona de Sherlock Holmes. Es, por tanto, un artefacto académico orientado al estudio de técnicas de alineación, no un modelo de propósito general.

El modelo se distribuye con los adaptadores LoRA ya fusionados en los pesos completos (etiqueta `lora-merged`), de modo que se carga como un Qwen2.5-3B estándar con `transformers`, sin necesidad de aplicar adaptadores por separado. Cuenta con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) en formato `safetensors`, con un tamaño de repositorio de 6,2 GB.

Su interés actual reside en que documenta una cadena completa de post-entrenamiento (SFT, GRPO y DPO) sobre un modelo pequeño ejecutable en hardware de consumo, con resultados medidos sobre 200 problemas de test de MATH (niveles 1-3) y una métrica de persona evaluada por un juez LLM. La comparativa interna muestra un compromiso explícito: el DPO eleva la puntuación de persona de 5,27 a 7,28, pero la precisión cae del 80% del modelo base al 60%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptadores LoRA fusionados (r=16) |
| Parámetros totales | 3.085.938.688 (≈3,09 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos `safetensors`; no se listan variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | `safetensors` |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamaño del repositorio | 6,2 GB |
| Descargas / likes | 241 descargas, 0 likes |
| Fecha de creación | 20 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso, sin mezcla de expertos, sobre el que se ha aplicado un post-entrenamiento en dos etapas. La linaje documentado es: `Qwen/Qwen2.5-3B-Instruct` → SFT (`andreayhchen/sherlock-qwen2.5-3b-sft-v1`, con adaptadores fusionados) → DPO sobre pares etiquetados por un juez. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales de la arquitectura (número de capas, dimensiones, tipo de atención).

La etapa de DPO se realizó con TRL `DPOTrainer` sobre 619 pares construidos a partir de los rollouts de GRPO ya puntuados, filtrando por una diferencia de puntuación mayor o igual a 2 y emparejando por uso de la palabra "Watson" y por corrección. Se entrenó durante 2 épocas con LoRA de rango 16, tasa de aprendizaje 5e-5 y beta 0.1. La señal de recompensa provino de un juez LLM (`claude-sonnet-5`, con el modo de razonamiento desactivado) que puntuaba la persona de 1 a 10 según una rúbrica escrita. Las respuestas que rompían el contrato de formato (falta de la línea `Final answer: \boxed{}`, longitud fuera del rango de 80 a 500 tokens, uso de viñetas o encabezados) recibían recompensa 0. La corrección de la respuesta no se recompensó en ningún momento, lo que explica el intercambio entre precisión y persona.

## Capacidades

- Generación de texto conversacional en inglés con una persona característica (Sherlock Holmes), entrenada específicamente para mantener ese registro.
- Resolución de problemas de matemáticas del dataset MATH de niveles 1-3, con razonamiento paso a paso.
- Emisión obligatoria de una respuesta final en el formato `Final answer: \boxed{}` cuando se usa el prompt prescrito.
- Autolimitación de longitud: el modelo fue recompensado por producir respuestas de entre 80 y 500 tokens, sin viñetas ni encabezados.
- Razonamiento multi-paso dentro de una única respuesta; no hay evidencia de soporte de agentes ni de razonamiento multi-turno con herramientas.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles; el entrenamiento descrito (problemas de MATH y rúbrica en inglés) apunta a un uso en inglés, pero no se declara oficialmente.
- Modo de pensamiento explícito (`thinking mode`): no disponible.

## Casos de uso

- Estudio de técnicas de alineación en el aula o en investigación: el repositorio documenta la cadena completa SFT → GRPO → DPO con hiperparámetros concretos (LoRA r=16, lr 5e-5, beta 0.1, 619 pares), lo que lo convierte en un caso reproducible para comparar etapas de post-entrenamiento en un modelo de 3B.
- Evaluación de jueces LLM como fuente de recompensa: el propio autor documenta que el juez añade aproximadamente un punto por el uso de "Watson", lo que permite usar este modelo como ejemplo práctico de cómo una rúbrica de evaluación introduce sesgos que el RL amplifica.
- Tutor de matemáticas con personaje, para niveles de dificultad 1-3 de MATH: el modelo explica el procedimiento paso a paso y cierra con la respuesta en `\boxed{}`, un formato fácil de parsear automáticamente, aunque con una precisión del 60% que exige verificación posterior.
- Generación de material educativo narrado: se pueden producir soluciones explicadas con un tono literario consistente para actividades de divulgación o contenido interactivo, limitando el uso a problemas de dificultad baja o media.
- Demostración de chat conversacional con persona: útil en prototipos de producto donde se quiera mostrar cómo se comporta un modelo pequeño cuando se le impone un estilo muy marcado, siempre que se respete el formato de prompt prescrito (sin system prompt, con el sufijo literal de razonamiento paso a paso).
- Línea base para experimentos de DPO en hardware de consumo: con 3,09 B de parámetros, sirve como punto de partida para replicar pipelines de preferencias en una única GPU de gama media o alta.
- Pruebas de integración de endpoints compatibles con text-generation-inference: el modelo lleva las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse como servicio para probar flujos de inferencia con formato de salida restringido.

## Benchmarks y rendimiento

Resultados en 200 problemas de test de MATH (niveles 1-3), decodificación greedy. La columna "persona" es la puntuación media del juez LLM.

| Modelo | Persona | Precisión |
|---|---|---|
| Qwen2.5-3B-Instruct (base) | No medida | 80% |
| SFT | 5,27 | 59% |
| GRPO (60 pasos) | 5,80 | 56% |
| DPO (este modelo) | 7,28 | 60% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 6,2 GB solo para los pesos, más la caché KV; en la práctica, unos 7-8 GB para contextos moderados y batch 1. Estimación a partir del recuento de parámetros, no un dato publicado.
- VRAM estimada con cuantización de 8 bits: aproximadamente 3,5-4 GB. Con cuantización de 4 bits: aproximadamente 2-2,5 GB. El repositorio no publica pesos cuantizados, por lo que habría que generarlos con `bitsandbytes` o convertir a GGUF.
- GPU recomendadas: cualquier GPU con 8 GB o más en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); en el ámbito profesional, A100, H100 o L40S, aunque están sobredimensionadas para 3 B de parámetros.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando bf16, y en tarjetas de 6-8 GB si se cuantiza.
- Opciones de despliegue: `transformers` (la librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia linaje, con los datos publicados en la model card:

| Modelo | Parámetros | Contexto | Persona (juez) | Precisión MATH 1-3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sherlock-qwen2.5-3b-dpo-v1 | 3,09 B | No disponible | 7,28 | 60% | No disponible | HuggingFace, safetensors |
| sherlock-qwen2.5-3b-sft-v1 | No disponible | No disponible | 5,27 | 59% | No disponible | HuggingFace, safetensors |
| GRPO, 60 pasos (variante) | No disponible | No disponible | 5,80 | 56% | No disponible | No disponible como checkpoint independiente en la información proporcionada |
| Qwen2.5-3B-Instruct (base) | 3,09 B (heredado) | No disponible en la información proporcionada | No medida | 80% | No disponible en la información proporcionada | HuggingFace |

Como alternativas externas de tamaño similar podrían considerarse Llama-3.2-3B-Instruct, Gemma-2-2B-it o Phi-3.5-mini, pero no se dispone de datos verificados de esos modelos en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Pérdida de precisión frente al modelo base: se pasa del 80% al 60% en MATH niveles 1-3. El entrenamiento optimizó persona, no corrección; la corrección nunca fue recompensada.
- Sesgo conocido del juez: la rúbrica otorga aproximadamente un punto extra por el mero uso del nombre "Watson", y las dos etapas de RL incrementaron su frecuencia. La puntuación de persona de 7,28 está por tanto inflada y el modelo tiende a sobreutilizar ese recurso estilístico.
- Dependencia estricta del formato de prompt: no debe usarse system prompt y el mensaje de usuario debe ser el problema seguido literalmente de `\n\nPlease reason step by step, and put your final answer within \boxed{}.` Fuera de ese contrato, el comportamiento no está garantizado ni evaluado.
- Contrato de salida restrictivo: respuestas de 80 a 500 tokens, sin viñetas ni encabezados, con línea final `Final answer: \boxed{}`. Cualquier uso que requiera otro formato de salida exigirá reentrenamiento o post-procesado.
- Licencia no declarada: al no especificarse licencia en la model card, existe incertidumbre legal para uso comercial. El modelo deriva de Qwen2.5-3B-Instruct, cuyas condiciones habría que verificar por separado.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés.
- Longitud de contexto no declarada: no se puede asumir la ventana del modelo base sin verificación.
- Riesgo de alucinación: con 3,09 B de parámetros y una persona fuertemente impuesta, el modelo puede producir razonamientos verosímiles pero incorrectos, especialmente en los niveles 3.
- Artefacto académico sin validación externa: 241 descargas, 0 likes y ausencia de evaluaciones independientes. No es adecuado como componente crítico en producción sin una evaluación propia.
- No se documentan sesgos demográficos, de género ni de otro tipo, ni se han publicado evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-dpo-v1
- Código del trabajo: https://github.com/andreach3n/cs2881r-assignment1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Etapa SFT previa: https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-sft-v1
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos correspondían a contenidos no relacionados (Zhihu, Blinkist) y se han descartado.
