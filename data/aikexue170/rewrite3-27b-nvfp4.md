# aikexue170/rewrite3-27b-nvfp4

## Resumen

rewrite3-27B es un modelo de lenguaje especializado en la reescritura de novelas web en chino. Lo desarrolla el usuario aikexue170 y parte del modelo base Qwen/Qwen3.8-27B, sobre el que se ha aplicado un ajuste fino supervisado (SFT) orientado a una tarea muy concreta: recibir un texto narrativo degradado por "estilo AIGC" (frases de relleno, repeticiones, clichés) y reescribirlo manteniendo intactos la trama, los personajes y los eventos, eliminando el tono artificial y acercándolo a una voz de autor humana. No es un modelo de continuación ni de creación libre, sino de edición reescritiva.

La particularidad del sistema es que el texto de entrada incorpora, al final de cada frase, una puntuación de "probabilidad de texto AI" generada por un discriminador externo independiente (jevnovel3 0.8B). Esa señal guía al modelo sobre qué fragmentos priorizar en la reescritura. El modelo produce además una cadena de pensamiento de tipo editorial: primero diagnostica los problemas del texto y explica cómo piensa corregirlos, y después entrega la versión reescrita.

Este repositorio concreto es la variante cuantizada en NVFP4 (W4A4), con pesos de aproximadamente 19,7 GB, pensada para inferencia en GPUs Blackwell (sm_120) con vLLM. Incluye una cabeza MTP (multi-token prediction) reentrenada que actúa como decodificación especulativa, con una tasa de aceptación declarada del 56 % para n=3 en decodificación voraz. El modelo está publicado bajo licencia Apache 2.0 y solo declara soporte para chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabeza MTP para decodificación especulativa |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de ejemplo de vLLM (`--max-model-len 16384`); el máximo del modelo base no se detalla |
| Tipos de cuantizacion | NVFP4 (W4A4) en este repo; el autor publica además BF16, FP8 (W8A8) e IQ4_XS, Q4_K_M, Q3_K_M, IQ3_XS en GGUF |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) para NVFP4; GGUF en las variantes llama.cpp |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros, mediante ajuste fino supervisado (SFT) específico para la tarea de reescritura de novela web china. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor sí describe la estructura de los datos de entrenamiento: pares de texto degradado (con puntuaciones JEV por frase) y reescritura de referencia, acompañados de una cadena de pensamiento editorial que indica qué fragmentos son artificiales, por qué y cómo se van a corregir.

La innovación técnica más destacable es la incorporación de la señal del discriminador externo jevnovel3 0.8B como parte de la entrada. Cada frase del original lleva una puntuación entre 0 y 1 que representa la probabilidad de ser texto generado de baja calidad; el modelo usa esa señal para localizar los puntos críticos. Además, el autor ha reentrenado una cabeza MTP sobre datos propios (v14-sfw) para acelerar la decodificación: con n=3 y decodificación voraz declara una tasa de aceptación del 56 % y una aceleración extremo a extremo de aproximadamente 2x. En GGUF, el módulo MTP va empaquetado y se activa con `--spec-type draft-mtp` en llama.cpp; en vLLM se activa con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'`.

## Capacidades

- Reescritura de texto narrativo en chino con preservación estricta de trama, personajes y eventos.
- Diagnóstico editorial previo: el modelo explica qué partes del texto suenan artificiales y cómo va a corregirlas antes de reescribir.
- Eliminación de "estilo AIGC": reduce clichés, repeticiones, relleno y frases formulaicas.
- Uso de puntuaciones JEV por frase como señal de entrada para priorizar la corrección; puede funcionar sin ellas, aunque fuera de la distribución de entrenamiento.
- Reorganización por párrafos en lugar de sustitución sinonímica frase a frase.
- Adición controlada de detalles de ambiente, acción o psicología (se permite "enriquecer" sin inventar elementos de la historia).
- Generación de texto general y conversación, heredadas del modelo base.
- Decodificación especulativa mediante cabeza MTP integrada (aceleración de inferencia).
- Capacidades de tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Limpieza de manuscritos generados por IA en plataformas de novela web: el modelo recibe el capítulo con puntuaciones JEV por frase y devuelve una versión reescrita sin clichés, manteniendo la continuidad argumental. Es su caso de uso principal y el único para el que está entrenado de forma explícita.
- Edición asistida para autores humanos: un escritor puede pasar su borrador por el modelo para eliminar muletillas y frases repetitivas, obteniendo además un diagnóstico editorial que le ayuda a identificar vicios de estilo.
- Normalización de estilo en series largas: al preservar personajes y eventos, permite homogeneizar el tono de capítulos escritos por distintas fuentes o en distintas fases creativas sin romper la coherencia.
- Preprocesado en pipelines de publicación: integrado vía vLLM con decodificación especulativa MTP, puede procesar lotes de capítulos con un throughput aproximadamente 2x superior al de la decodificación estándar, reduciendo el coste por capítulo.
- Detección y corrección de "relleno" en textos periodísticos o divulgativos en chino: aunque entrenado para narrativa, el mecanismo de diagnóstico y reescritura es aplicable a otros textos con frases formulaicas.
- Investigación sobre detección y eliminación de marcas de IA: el par formado por el discriminador jevnovel3 y el reescritor rewrite3 sirve como banco de pruebas para estudiar hasta qué punto una reescritura elimina las señales estadísticas de generación automática.
- Despliegue local en estaciones Blackwell: la variante NVFP4 (19,7 GB) permite ejecutar el modelo en una sola GPU con 24-48 GB de VRAM, habilitando flujos de edición sin conexión para estudios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación interna propia sobre seis prompts, comparando formatos de cuantización con la misma configuración de KV cache en bf16:

| Formato | JEV medio (↓) | Desviación del original (↑) | Copia literal máxima (caracteres, ↓) | Copia literal total (↓) | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|---|---|---|---|---|---|---|---|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

Interpretación de las métricas según el autor: JEV es la probabilidad media por frase de ser texto AI (menos es mejor; por debajo de 0,08 se considera limpio y por encima de 0,2, claramente artificial); la desviación mide la proporción de ventanas de 5 caracteres que no aparecen en el original; la copia literal cuenta caracteres idénticos consecutivos al original, con un límite duro de 15 caracteres. El autor concluye que FP8 es la mejor opción en calidad, IQ4_XS la más rápida y NVFP4 la más eficiente en memoria en Blackwell, a costa de un JEV ligeramente superior.

## Requisitos de hardware

- VRAM estimada para NVFP4: los pesos ocupan 19,7 GB (18,3 GiB); con KV cache en fp8 y contexto de 16.384 tokens, se recomienda una GPU con al menos 24 GB, y 32-48 GB para mayor comodidad con lotes concurrentes.
- GPU recomendadas: NVIDIA Blackwell (sm_120) para NVFP4 con vLLM ≥ 0,28; el autor cita explícitamente esta combinación. Para las variantes GGUF, cualquier GPU compatible con llama.cpp.
- ¿Cabe en GPU de consumo? Sí: el NVFP4 cabe en tarjetas de 24 GB (p. ej. RTX 4090) y en Blackwell de consumo; las variantes IQ4_XS y Q3_K_M de 4 y 3 bits reducen aún más el requisito.
- Opciones de despliegue: vLLM (con `--speculative-config` para MTP), llama.cpp (con `--spec-type draft-mtp`), y presumiblemente Ollama u otros frontends basados en GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: el autor reporta tiempos medios de 41 s (IQ4_XS), 43 s (NVFP4) y 71 s (FP8) por muestra en su conjunto de seis prompts, incluyendo cadena de pensamiento y texto final. La cabeza MTP ofrece una tasa de aceptación del 56 % con n=3 y una aceleración aproximada de 2x.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27B NVFP4 (este) | 27B | 16.384 en config. de ejemplo | Reescritura de novela china con señal JEV y MTP | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista multilingüe | según modelo base | Hugging Face |
| jevnovel3 0.8B | 0,8B | no disponible | Discriminador de texto AI en chino; no es un generador | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros reescritores especializados en chino en la información proporcionada, por lo que la comparación se limita a posición relativa respecto al modelo base y al discriminador que acompaña al sistema.

## Limitaciones y advertencias

- Modelo altamente especializado: su uso previsto es la reescritura de narrativa en chino; su rendimiento en otras tareas no está evaluado y probablemente sea inferior al del modelo base.
- Dependencia de la señal JEV: el modelo está entrenado con puntuaciones por frase de jevnovel3 0.8B. Sin ellas puede funcionar, pero el autor advierte que queda fuera de la distribución de entrenamiento.
- Solo chino: no se declara soporte de otros idiomas; el uso en castellano u otras lenguas no está validado.
- Riesgo de alucinación controlado pero presente: el autor permite añadir detalles de ambiente, acción o psicología, y advierte de que en modo "reducción" el modelo a veces alarga el texto en lugar de acortarlo (3 de 6 muestras demasiado largas en FP8). No debe usarse para inventar tramas.
- Constraint de copia: el límite duro de 15 caracteres consecutivos idénticos al original es una convención del proyecto, no una garantía arquitectónica; conviene verificarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones que deben revisarse por separado.
- Requisito de hardware específico para NVFP4: necesita GPUs Blackwell (sm_120) y vLLM ≥ 0,28; en arquitecturas anteriores habrá que usar las variantes GGUF o FP8.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado sobre novela web china, puede reproducir estereotipos de género, clase o etnia presentes en ese corpus.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor indica que varias cuantizaciones (Q3_K_M, Q4_K_M, IQ3_XS) aún no se han evaluado; la validación externa es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- ModelScope (referencia truncada en la model card): no disponible
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
