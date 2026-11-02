# priyamsahoo/qwen3-8b-sft-RQ3-grpo-v4

## Resumen

qwen3-8b-sft-RQ3-grpo-v4 es un ajuste fino del modelo Qwen3-8B orientado a una tarea muy concreta: la síntesis de especificaciones formales en Rocq (el asistente de demostración antes conocido como Coq). Dado un enunciado de problema y un programa escrito en Rocq, el modelo genera una `Lemma` o `Theorem` que describe el comportamiento del programa. El autor es priyamsahoo y el modelo parte de su propio ajuste supervisado previo, `qwen3-8b-sft-RQ3`, sobre el que se aplica un entrenamiento con GRPO (Group Relative Policy Optimization) mediante TRL 0.19.

La relevancia de este modelo no está en el rendimiento generalista, sino en la especialización: aplica aprendizaje por refuerzo con una recompensa verificada por el kernel de Rocq 8.18 y un probador basado en LLM, lo que permite optimizar directamente la corrección formal de las especificaciones generadas en lugar de métricas de similitud textual. Es un ejemplo de pipeline de RL con verificación formal aplicado a un modelo de 8.190 millones de parámetros.

El modelo se publica como pesos completos en bf16 (el adaptador LoRA se ha fusionado con los pesos base), con la misma interfaz de prompt que el modelo de partida y el modo de razonamiento (thinking) desactivado. La evaluación sobre el conjunto de 545 problemas está pendiente según la model card, y no se declaran licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B original: un transformer decoder-only denso de 8.190 millones de parámetros. Sobre el checkpoint supervisado `priyamsahoo/qwen3-8b-sft-RQ3` se aplicó un entrenamiento con GRPO usando TRL 0.19 durante una época (543 pasos), con 8 intentos por cada uno de 4 prompts en cada paso. El ajuste se realizó con un adaptador LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, que posteriormente se fusionó con los pesos base en bf16.

Los prompts de entrenamiento provienen del split de entrenamiento de Codeforces, problemas sobrantes de benchmarks y teoremas de proyectos Rocq, excluyendo explícitamente los 545 problemas del conjunto de evaluación. Cada prompt muestra la mitad de los tests de cada problema. La innovación clave es la función de recompensa, verificada por el kernel de Rocq 8.18 con un probador LLM: 0 si la especificación no compila, se demuestra incorrecta o es trivial (repite el código, solo enuncia hechos de los tests, es vacua o fija todas las entradas a valores de test); entre 0.1 y 0.4 si queda indecisa, con 0.4 si descarta un programa deliberadamente incorrecto que coincide con el real en los tests mostrados; 0.6 si se demuestra correcta; y 1.0 si se demuestra correcta y además descarta el programa incorrecto. Durante el entrenamiento, las especificaciones demostradas correctas pasaron del 4,6 % al 8,8 % de los intentos, mientras que las triviales se redujeron del 4,2 % al 2,6 %.

## Capacidades

- Generación de especificaciones formales en Rocq (Coq): produce `Lemma`/`Theorem` que describen el comportamiento de un programa dado.
- Razonamiento sobre código formal: interpreta programas Rocq y enunciados de problemas para derivar propiedades verificables.
- Generación de texto conversacional (pipeline `text-generation`).
- Compatible con Text Generation Inference y endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Modo thinking desactivado: la model card indica que se usa el mismo formato de prompt que el modelo base con el razonamiento desactivado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Síntesis de especificaciones en proyectos Rocq: integrar el modelo en un flujo donde, tras escribir una función, se le pide una `Lemma` que capture su contrato; la especificación se valida después con el kernel de Rocq antes de aceptarla.
- Asistencia a la verificación formal en investigación: generar candidatos de especificación que un probador automático (por ejemplo, un LLM prover o tácticas de Rocq) intente demostrar, reduciendo el trabajo manual de enunciar propiedades.
- Docencia de métodos formales: usar el modelo para proponer especificaciones de ejercicios y contrastar con la solución del estudiante, aprovechando que la recompensa de entrenamiento penaliza especificaciones triviales o que fijan entradas a valores de test.
- Generación de propiedades a partir de tests: dado un programa con una batería de tests, el modelo puede proponer una especificación que generalice esos casos; conviene revisar que no se limite a enunciar hechos de los tests, un fallo que el entrenamiento intenta mitigar pero no elimina.
- Detección de programas incorrectos: el modelo está entrenado para producir especificaciones que descarten programas erróneos que coinciden con el real en los tests mostrados, útil como filtro en pipelines de evaluación de código formal.
- Preentrenamiento de pipelines de RL con verificación formal: servir de punto de partida o referencia para experimentos de GRPO con recompensas verificadas por kernel en dominios de demostración.
- Generación de código Rocq asistida: aunque su objetivo es la especificación, el modelo parte de un Qwen3-8B ajustado en Rocq y puede emplearse para completar o revisar código en ese lenguaje, con validación posterior por el compilador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del entrenamiento: las especificaciones demostradas correctas pasaron del 4,6 % al 8,8 % de los intentos, y las triviales (hechos de tests más entradas fijadas) del 4,2 % al 2,6 %. La evaluación sobre el conjunto de 545 problemas está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, alrededor de 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 con contexto largo; una RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 24 GB en bf16; en GPUs de 12-16 GB requiere cuantización (8 o 4 bits).
- Opciones de despliegue: transformers, Text Generation Inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-sft-RQ3-grpo-v4 | 8,19 B | no disponible | Especificaciones Rocq (GRPO) | no disponible | HuggingFace |
| priyamsahoo/qwen3-8b-sft-RQ3 | no disponible | no disponible | Especificaciones Rocq (SFT) | no disponible | HuggingFace |
| Qwen3-8B (base) | 8,19 B (aprox.) | no disponible en esta ficha | Propósito general | no disponible en esta ficha | HuggingFace |

La comparación con alternativas de la misma categoría (modelos especializados en demostración formal, como modelos ajustados para Lean o Coq) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Tarea muy restringida: el modelo está entrenado para generar especificaciones Rocq a partir de un enunciado y un programa; su rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de especificaciones triviales: aunque el entrenamiento redujo su frecuencia (del 4,2 % al 2,6 %), el propio autor documenta que el modelo puede repetir el código, enunciar solo hechos de los tests, generar especificaciones vacuas o fijar todas las entradas a valores de test.
- Tasa de corrección baja en términos absolutos: solo el 8,8 % de los intentos produjeron especificaciones demostradas correctas al final del entrenamiento, por lo que se requiere verificación con el kernel de Rocq y probablemente selección entre múltiples muestras.
- Evaluación pendiente: no hay resultados sobre el conjunto de 545 problemas, por lo que no se puede confirmar la generalización a datos no vistos.
- Licencia no disponible: no se declara licencia, lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor antes de usarlo en producción.
- Idiomas no declarados: no se especifica qué idiomas soporta; el entrenamiento se centra en enunciados de problemas de Codeforces, mayoritariamente en inglés.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; en este dominio se manifiesta como especificaciones que compilan pero no capturan el comportamiento real del programa, motivo por el que la validación formal es imprescindible.
- Longitud de contexto no declarada: conviene verificar la ventana efectiva del Qwen3-8B base antes de usarlo con programas o enunciados largos.
- Modo thinking desactivado: el modelo espera el mismo formato de prompt que el checkpoint SFT con el razonamiento desactivado; usar otro formato puede degradar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/priyamsahoo/qwen3-8b-sft-RQ3-grpo-v4
- Modelo base (SFT): https://huggingface.co/priyamsahoo/qwen3-8b-sft-RQ3
- Repositorio de TRL: https://github.com/huggingface/trl
- Rocq Prover (antes Coq): https://rocq-prover.org/
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
