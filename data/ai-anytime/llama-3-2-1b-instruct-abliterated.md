# ai-anytime/Llama-3.2-1B-Instruct-abliterated

## Resumen

Llama-3.2-1B-Instruct-abliterated es una variante del modelo meta-llama/Llama-3.2-1B-Instruct a la que se le ha aplicado una ablación direccional ("abliteration") para reducir su tendencia a rechazar peticiones. Lo publica el usuario ai-anytime y se ha generado con la herramienta ablate, un kit de ingeniería de activaciones orientado a interpretabilidad mecanicista e investigación en seguridad. No se ha reentrenado ningún peso: la modificación es una edición lineal de rango 1 aplicada sobre las matrices que escriben en el flujo residual.

El modelo conserva la arquitectura y el tamaño del original: un transformer denso de 1.235.814.400 parámetros (aproximadamente 1,24 mil millones), pesos en safetensors y un repositorio de 2,5 GB. La intervención consiste en identificar la dirección de rechazo en el espacio de activaciones y ortogonalizar contra ella las matrices de embedding, salida de atención y salida del MLP, de modo que el cambio queda horneado en los pesos.

Su relevancia es fundamentalmente científica: permite medir cuantitativamente cuánto del comportamiento de seguridad de un LLM está mediado por una única dirección y estudiar la robustez y localidad de ese mecanismo. No es un modelo pensado para despliegue en producción, sino un instrumento de medida para red-teaming y para el desarrollo de defensas más sólidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2), derivado de meta-llama/Llama-3.2-1B-Instruct |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.2 (Llama Community License del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.2-1B-Instruct original: un transformer denso decoder-only de aproximadamente 1,24 mil millones de parámetros. Este derivado no incorpora cambios estructurales ni entrenamiento adicional; la única modificación es una edición de pesos de rango 1.

El procedimiento de ablación sigue a Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction". La dirección de rechazo se extrae mediante diferencia de medias sobre pares emparejados de instrucciones dañinas y benignas: 64 prompts de AdvBench frente a 64 prompts de Alpaca. Después se ortogonalizan todas las matrices que escriben en el flujo residual (embedding, salida de atención y salida del MLP) contra el subespacio de rechazo, de forma que la intervención queda integrada en los pesos. La configuración final se eligió mediante una búsqueda Optuna de 24 pruebas puntuada por tasa de rechazo y deriva KL: direction_layer 8, alpha 0,9146619399905236, min_layer 3 y max_layer 14. Todo el proceso se ejecutó en un MacBook con Apple Silicon.

## Capacidades

- Generación de texto conversacional, heredada del Llama-3.2-1B-Instruct base.
- Reducción deliberada de la tasa de rechazo: del 0,75 en el modelo base al 0,3438 en esta variante, medida sobre prompts dañinos reservados.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (formato instruct del modelo base).
- Instrumento de medida para investigación en interpretabilidad mecanicista: permite estudiar cómo se representa el comportamiento de seguridad en el flujo residual.
- Soporte para experimentos de red-teaming y evaluación de robustez de defensas.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar si una única dirección media el rechazo en modelos pequeños y comparar los resultados con los de modelos de mayor tamaño, usando la configuración de ablación publicada como referencia reproducible.
- Red-teaming controlado: emplear el modelo como sujeto de prueba para medir la eficacia de filtros de entrada y salida, ya que su tasa de rechazo reducida (0,3438) facilita generar respuestas que los clasificadores deben detectar.
- Evaluación de la robustez de salvaguardas: comparar la tasa de rechazo del modelo base (0,75) con la del abliterado para cuantificar cuánto de la seguridad depende de una sola dirección y diseñar defensas redundantes.
- Estudio de la localidad de la edición: usar mean_kl (0,0541) y coherence (0,8695) para medir la deriva de capacidades en prompts benignos y validar si la intervención afecta solo al comportamiento de rechazo.
- Docencia y divulgación: ilustrar en un modelo de 1,24 mil millones de parámetros, ejecutable en un portátil, cómo funciona la ingeniería de activaciones sin necesidad de infraestructura de entrenamiento.
- Reproducción de experimentos: replicar el pipeline de ablate (extracción de dirección, ortogonalización y búsqueda Optuna) sobre otros modelos pequeños y contrastar resultados con esta referencia.

## Benchmarks y rendimiento

| Metrica | Modelo base | Abliterated |
|---|---|---|
| refusal_rate | 0,75 | 0,3438 |
| mean_kl (vs. base, prompts benignos) | no aplica | 0,0541 |
| coherence | no disponible | 0,8695 |

La tasa de rechazo se mide sobre prompts dañinos reservados con un juez por palabras clave, que no detecta rechazos suaves, por lo que debe interpretarse como cota inferior del rechazo restante. mean_kl es la divergencia KL media de las distribuciones de siguiente token frente al modelo base en prompts benignos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits cabría en torno a 1,3 GB de pesos; en 4 bits, alrededor de 0,7 GB, aunque los tipos de cuantización concretos no están documentados en la información disponible.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs de datacenter (A100, H100) aunque están sobredimensionadas para este tamaño.
- El autor documenta que el proceso de ablación se ejecutó en un MacBook con Apple Silicon, lo que indica que el modelo es manejable en hardware de portátil.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque esto no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-anytime/Llama-3.2-1B-Instruct-abliterated | 1,24 B | no disponible | 0,3438 | llama3.2 | HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | no disponible en esta ficha | 0,75 | llama3.2 | HuggingFace |
| Otras variantes abliterated de Llama 3.2 1B | no disponible | no disponible | no disponible | llama3.2 | no disponible |

La comparación directa más relevante es con el modelo base, del que se diferencia únicamente en la tasa de rechazo y en una deriva KL media de 0,0541. No se dispone de datos de benchmarks estándar para comparar capacidades con alternativas de la misma categoría.

## Limitaciones y advertencias

- La ablación es una edición lineal tosca: puede dejar rechazos residuales y provocar una deriva leve de capacidades, cuantificada en un mean_kl de 0,0541 frente al modelo base.
- La seguridad está codificada de forma redundante; un único subespacio rara vez elimina toda la protección, por lo que la tasa de rechazo restante (0,3438) sigue siendo apreciable.
- El juez de rechazo por palabras clave no detecta rechazos suaves, de modo que las cifras de rechazo deben tratarse como cota inferior.
- Solo se ha evaluado en los benchmarks indicados (32 prompts reservados de cada tipo); el comportamiento en otros dominios puede diferir.
- El modelo produce con más facilidad contenido dañino, inseguro u objetable que el base; no debe desplegarse en productos de cara al usuario sin una capa de seguridad propia.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero heredados del modelo base Llama 3.2.
- Restricciones de licencia: se rige por la Llama Community License y la política de uso aceptable del modelo base; el uso comercial está sujeto a dichos términos.
- Idiomas soportados y longitud de contexto no confirmados en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-anytime/Llama-3.2-1B-Instruct-abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Herramienta ablate: https://github.com/AIAnytime/ablate
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
