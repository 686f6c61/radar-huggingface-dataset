# elrashid/sae-gemma-2-2b-it-topk-l13

## Resumen

`elrashid/sae-gemma-2-2b-it-topk-l13` es un autoencoder disperso (sparse autoencoder, SAE) entrenado sobre el flujo residual de la capa 13 de `google/gemma-2-2b-it`. No es un modelo generativo: es un artefacto de interpretabilidad mecanicista que descompone las activaciones internas del modelo base en un conjunto de características dispersas y monitorizables. Lo publica el usuario elrashid bajo licencia MIT y está pensado para tareas de interpretabilidad e investigación en seguridad de IA.

El artefacto se complementa con otro repositorio del mismo autor, `elrashid/gate-gemma-2-2b-it-l13`, que aplica una regresión logística sobre las características del SAE para estimar la probabilidad de que un prompt sea dañino antes de iniciar la generación. En conjunto, la pareja SAE + gate permite auditar y filtrar el comportamiento del modelo base sin reentrenarlo.

Es relevante ahora porque los SAE se han consolidado como una de las técnicas dominantes para extraer características interpretables de LLM en producción, y este es un ejemplo concreto, reproducible y de licencia permisiva aplicado a un modelo pequeño (2B) que cabe en hardware de consumo. El repositorio ocupa 0,7 GB y requiere aceptar condiciones de acceso (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) de tipo TopK sobre el flujo residual de la capa 13 de `google/gemma-2-2b-it` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Gemma 2 2B-it) |
| Tipos de cuantizacion | no disponible (el repositorio menciona la tag `quantization`, pero no se detallan formatos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |
| Modelo base | `google/gemma-2-2b-it` (finetune) |
| Capa objetivo | 13 (flujo residual) |
| Dataset de entrenamiento | `monology/pile-uncopyrighted` |
| Tamano del repositorio | 0,7 GB |
| Acceso | restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

El artefacto es un SAE TopK, una variante que fuerza un número fijo de características activas por token (k) mediante una selección top-k en lugar de una penalización L1. Esta formulación, popularizada por trabajos como los de Anthropic y OpenAI sobre diccionarios dispersos, evita el colapso de características y produce activaciones más limpias y estables que los SAE clásicos. El SAE se entrena sobre las activaciones del flujo residual de la capa 13 del modelo base, de modo que cada dirección del diccionario aprendido corresponde a una característica latente del modelo.

El entrenamiento utiliza el dataset `monology/pile-uncopyrighted`, una versión filtrada del Pile sin contenido con derechos de autor, habitual en experimentos de interpretabilidad por su diversidad de dominios. No se dispone de información sobre el número de tokens de entrenamiento, el tamaño del diccionario (número de características), el valor de k ni la función de pérdida exacta empleada. Tampoco se documenta si hubo ajuste fino posterior del SAE o validación con métricas de reconstrucción o de interpretabilidad automática.

## Capacidades

- Extracción de características dispersas del flujo residual de la capa 13 de Gemma 2 2B-it.
- Monitorización de activaciones internas del modelo base para auditar comportamientos.
- Base para construir clasificadores de seguridad: el repositorio hermano `gate-gemma-2-2b-it-l13` usa regresión logística sobre estas características para puntuar P(dañino) de un prompt.
- Análisis de direcciones latentes y búsqueda de características interpretables (feature discovery).
- Soporte para experimentos de steering o edición de activaciones, siempre que se implemente sobre el SAE.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step por sí mismo.
- Capacidades multilingües: no disponibles (dependen del modelo base y del dataset de entrenamiento del SAE).

## Casos de uso

- Filtrado previo de prompts en producción: combinado con el gate del mismo autor, se puede calcular una probabilidad de daño antes de que Gemma 2 2B-it empiece a generar, añadiendo una capa de seguridad de bajo coste sobre el modelo base.
- Investigación en interpretabilidad mecanicista: analizar qué características se activan ante distintos inputs y correlacionarlas con comportamientos observables (toxicidad, refusal, sesgo).
- Auditoría de sesgos: identificar direcciones latentes asociadas a atributos demográficos o tópicos sensibles y cuantificar su activación en un corpus de evaluación.
- Detección de jailbreaks: usar las características del SAE como features de entrada a un clasificador que distinga prompts adversariales de prompts legítimos.
- Desarrollo de técnicas de steering: manipular la activación de características concretas para inducir o suprimir comportamientos en el modelo base, con validación empírica.
- Educación y reproducción de experimentos: servir como ejemplo didáctico y reproducible de cómo entrenar y evaluar un SAE TopK sobre un LLM pequeño de licencia abierta.
- Red teaming asistido: monitorizar activaciones anómalas durante la generación para señalar respuestas potencialmente problemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no documenta métricas de reconstrucción (MSE, L0), interpretabilidad automática ni comparaciones con otros SAE sobre Gemma 2 2B-it.

## Requisitos de hardware

- El repositorio pesa 0,7 GB, por lo que el SAE en sí cabe holgadamente en cualquier GPU consumer (8 GB o más) e incluso en CPU para inferencia puntual.
- Para usar el SAE es necesario ejecutar el modelo base `google/gemma-2-2b-it` y capturar activaciones de la capa 13. Gemma 2 2B-it en precisión completa (bf16) requiere aproximadamente 5 GB de VRAM, más overhead de activaciones y del propio SAE.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para cargas por lotes. Cabe en consumer GPU de gama media.
- Opciones de despliegue: PyTorch nativo (librería declarada), con integración manual en pipelines que usen `transformers` y hooks sobre la capa 13. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Capa | Licencia | Acceso |
|---|---|---|---|---|---|
| `elrashid/sae-gemma-2-2b-it-topk-l13` | SAE TopK | Gemma 2 2B-it | 13 | MIT | gated |
| `elrashid/gate-gemma-2-2b-it-l13` | Gate de seguridad (regresión logística sobre SAE) | Gemma 2 2B-it | 13 | no disponible | no disponible |
| SAE de Gemma Scope (Google DeepMind) | Suite de SAE (JumpReLU y otros) | Gemma 2 2B / 9B / 27B | Múltiples capas | Gemma Terms of Use | abierto |

La comparación más directa es con Gemma Scope, la suite oficial de SAE publicada por Google DeepMind para la familia Gemma 2, que cubre múltiples capas y variantes. Este repositorio de elrashid es un artefacto independiente, de una sola capa y con licencia MIT, lo que facilita su reutilización comercial, aunque carece de la documentación y validación exhaustiva de la suite oficial.

## Limitaciones y advertencias

- Es un artefacto de interpretabilidad, no un modelo de lenguaje: no genera texto ni responde a prompts por sí mismo.
- El acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones, lo que puede complicar la automatización de pipelines.
- La documentación del repositorio es mínima: no se especifican tamaño del diccionario, valor de k, hiperparámetros de entrenamiento ni métricas de calidad del SAE.
- No hay información sobre sesgos del SAE ni sobre su fidelidad respecto a las activaciones reales del modelo base en dominios fuera del Pile.
- El dataset de entrenamiento (`monology/pile-uncopyrighted`) condiciona las características aprendidas; dominios ausentes pueden estar infrarrepresentados.
- El uso del SAE requiere acceso al modelo base Gemma 2 2B-it, sujeto a los términos de licencia de Gemma, independientemente de la licencia MIT del SAE.
- El gate asociado (`gate-gemma-2-2b-it-l13`) es un clasificador auxiliar; no se han publicado métricas de precisión, recall ni tasas de falsos positivos, por lo que no debe usarse como único mecanismo de seguridad en producción.
- Riesgo de alucinación: no aplica directamente al SAE, pero sí al modelo base sobre el que se usa; el gate no elimina alucinaciones, solo estima probabilidad de daño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elrashid/sae-gemma-2-2b-it-topk-l13
- Gate de seguridad asociado: https://huggingface.co/elrashid/gate-gemma-2-2b-it-l13
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
