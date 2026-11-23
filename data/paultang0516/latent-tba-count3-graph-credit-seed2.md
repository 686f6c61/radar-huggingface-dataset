# paultang0516/latent-tba-count3-graph-credit-seed2

## Resumen

`paultang0516/latent-tba-count3-graph-credit-seed2` es un conjunto de checkpoints de ajuste fino del modelo `Qwen/Qwen2.5-3B-Instruct`, publicado por el usuario `paultang0516` en Hugging Face. No se trata de un modelo base nuevo ni de un lanzamiento de producto, sino de un artefacto de investigación: tres checkpoints reanudables (pasos 30, 60 y 100) de un proceso de entrenamiento con GRPO (Group Relative Policy Optimization) sobre la pila veRL. El objetivo declarado es modificar la señal de ventaja del entrenamiento por refuerzo añadiendo un término basado en la distancia de grafo entre archivos generados y archivos verificados como correctos.

La innovación descrita en la model card es la incorporación de un "crédito de potencial de grafo": el potencial de un archivo se define como 0,5 elevado a la distancia más corta observada hasta un archivo que el verificador marca como correcto. Los archivos incorrectos se agrupan mediante embeddings congelados de E5-large-v2, y la magnitud auxiliar sigue la convención del 20 % del experimento D del autor. La calificación final se realiza sobre el archivo final en el límite de turnos.

Por su naturaleza, es un modelo de nicho orientado a experimentación en aprendizaje por refuerzo aplicado a tareas de generación de archivos (probablemente código o artefactos estructurados) con verificación automática. No hay información pública sobre benchmarks, idiomas soportados ni uso previsto en producción, y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); no se documenta modificación estructural |
| Parametros totales | 3 000 millones (aproximado, heredado del modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32 768 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como `other` en los metadatos de Hugging Face) |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otro formato en la informacion proporcionada) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de aproximadamente 3 000 millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO mediante la librería veRL. La modificación central descrita es la aumentación de la ventaja de resultado (outcome advantage) con el cambio con signo del potencial de grafo a lo largo de un turno generado. El potencial se define como 0,5^(d), donde d es la distancia más corta observada hasta un archivo que el verificador considera correcto. Los archivos incorrectos se agrupan usando embeddings congelados de E5-large-v2, lo que permite asignar distancias incluso a archivos que no coinciden exactamente con ninguno correcto.

La magnitud auxiliar de esta señal sigue la convención del 20 % del experimento D del autor, y la calificación final se realiza sobre el archivo final cuando se alcanza el límite de turnos. Se publican checkpoints reanudables en los pasos 30, 60 y 100, lo que sugiere un entrenamiento corto o de prueba de concepto. No se documentan el número total de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO más allá del GRPO descrito.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen2.5-3B-Instruct.
- Generación de archivos o artefactos estructurados sujetos a verificación automática (el entrenamiento se centra en tareas de "count3 graph-distance credit" con archivos correctos e incorrectos).
- Razonamiento multi-turno: el esquema de crédito por turno y la calificación en el límite de turnos implican interacción iterativa con un verificador.
- Capacidades de instrucción general del modelo base (código, matemáticas básicas, multilingüismo), aunque no se documentan específicamente para este fine-tune.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no documentado explícitamente, aunque el esquema de turnos y verificación es compatible con flujos agénticos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en RL para generación de código con verificación: el modelo sirve como artefacto reproducible para estudiar cómo una señal de crédito basada en distancia de grafo afecta a la política de generación de archivos. Es adecuado porque los checkpoints en los pasos 30, 60 y 100 permiten comparar la evolución de la política.
- Experimentos de ablación sobre funciones de recompensa: al estar basado en GRPO con una ventaja aumentada, permite comparar contra el modelo base Qwen2.5-3B-Instruct sin la señal de potencial de grafo.
- Evaluación de agrupamiento de archivos incorrectos con E5-large-v2: útil para validar si los embeddings congelados separan adecuadamente errores semánticamente distintos en tareas de generación de archivos.
- Reproducción de resultados del "experimento D": la convención del 20 % en la magnitud auxiliar sugiere que el autor tiene una línea de experimentos previa que este checkpoint permite replicar.
- Estudio de calificación en el límite de turnos: permite analizar cómo se comporta la política cuando la recompensa solo se asigna al archivo final, un escenario relevante en agentes que deben converger a una solución.
- Docencia y formación en RL aplicado: como ejemplo práctico de integración de veRL con un modelo de 3B y un verificador externo, sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia del modelo base Qwen2.5-3B, en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. Estas cifras son estimaciones del modelo base, no del fine-tune.
- GPU recomendadas: no documentadas por el autor. Para el tamaño de 3B, una RTX 3090, RTX 4090, A10G o A100 son suficientes para inferencia en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use el modelo base en precisión reducida.
- Opciones de despliegue: no documentadas. Por compatibilidad con Qwen2.5-3B-Instruct, cabría esperar soporte en vLLM, llama.cpp, Ollama y TGI, pero el autor no lo confirma ni publica pesos en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `paultang0516/latent-tba-count3-graph-credit-seed2` | ~3B | no disponible | qwen-research | Hugging Face, 0 descargas | Fine-tune de investigación con GRPO y crédito de grafo |
| `Qwen/Qwen2.5-3B-Instruct` | ~3B | 32 768 tokens (según documentación del modelo base) | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo base sin la modificación de recompensa |
| `Qwen/Qwen2.5-Coder-3B-Instruct` | ~3B | 32 768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face | Alternativa orientada a código, sin señal de grafo |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3B | 128 000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa generalista de tamaño similar |

La comparación con Qwen2.5-3B-Instruct es la más directa, ya que el fine-tune parte de él. No se dispone de métricas comparativas de rendimiento para este checkpoint.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al modelo base en ninguna tarea medible.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes de terceros sobre su funcionamiento.
- Model card extremadamente escueta: no se documentan datos de entrenamiento, hiperparámetros completos, composición del dataset ni metodología de evaluación.
- Riesgo de alucinación: heredado del modelo base Qwen2.5-3B, agravado por la falta de evaluación específica.
- Sesgos: no documentados; se heredan los del modelo base, sin que el autor los analice.
- Idiomas: no se especifican; se asume el multilingüismo de Qwen2.5, pero sin confirmación.
- Contexto: no se confirma la longitud efectiva tras el fine-tune; podría diferir del modelo base.
- Formato de pesos no especificado: dificulta saber si es desplegable directamente con llama.cpp u Ollama sin conversión.
- Naturaleza experimental: los checkpoints en pasos 30, 60 y 100 sugieren un entrenamiento corto; no debe tratarse como un modelo listo para producción.
- El esquema de recompensa depende de un verificador externo y de E5-large-v2; sin ese pipeline, el comportamiento del modelo puede degradarse de forma impredecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paultang0516/latent-tba-count3-graph-credit-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- veRL (librería de RL usada según la model card): https://github.com/volcengine/verl
- E5-large-v2 (embeddings congelados citados): https://huggingface.co/intfloat/e5-large-v2
