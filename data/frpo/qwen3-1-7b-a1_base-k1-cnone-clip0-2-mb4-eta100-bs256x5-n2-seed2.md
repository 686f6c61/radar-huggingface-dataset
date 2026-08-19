# FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed2

## Resumen

Este repositorio contiene un checkpoint de *fine-tuning* por aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, entrenado con el framework [verl](https://github.com/volcengine/verl) y el método FRPO (parte de los experimentos KL-in-LLM-RL). El autor, FRPO, ha publicado los pesos tal como los guardó el entrenador, en formato fp32 sin post-procesado, con el objetivo de facilitar la reproducibilidad de sus experimentos de investigación.

El modelo base es un transformer decoder-only de 1.700 millones de parámetros (aunque el total de pesos en safetensors asciende a 2.031.739.904, incluyendo embeddings y capas adicionales). El checkpoint corresponde al paso global 200 del entrenamiento, y la configuración del run está codificada en el nombre del repositorio (a1_base, k1, cNone, clip0.2, mb4, eta100, bs256x5, n2, seed2), lo que sugiere hiperparámetros como *clip* de PPO, tamaño de *batch* y tasa de aprendizaje, aunque no se documentan explícitamente.

La relevancia de este modelo es principalmente académica: sirve para estudiar el impacto de distintas variantes de RL sobre un modelo base pequeño y eficiente. No está pensado como un producto final, sino como un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un *fine-tuning* por RL del checkpoint base `Qwen/Qwen3-1.7B`. La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con atención por ventana deslizante y atención global, aunque no se proporcionan detalles adicionales sobre el número de capas o cabezas en este repositorio. El entrenamiento se realizó con el framework verl, especializado en RL para LLMs a gran escala.

El método FRPO (no documentado en la model card) pertenece a la familia de experimentos KL-in-LLM-RL, que probablemente incorpora restricciones de divergencia KL durante la optimización de política. La configuración del run está codificada en el nombre del repositorio, pero no se explican los significados exactos de los parámetros. Los pesos se guardan en fp32 sin ningún post-procesado, lo que indica que es un checkpoint de investigación, no optimizado para despliegue.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-1.7B, que incluyen generación de texto, razonamiento básico y comprensión de instrucciones.
- Soporte de *tool calling* y funciones: el modelo base Qwen3-1.7B soporta *function calling* y *tool calling*; este checkpoint debería conservar dichas capacidades, aunque no se ha verificado tras el RL.
- Capacidades multilingües: el modelo base está entrenado en múltiples idiomas, pero no se especifica la lista en este repositorio.
- No se documentan capacidades especiales adicionales (visión, audio, *thinking mode*, etc.).

## Casos de uso

- Investigación en RL para LLMs: este checkpoint es un punto de referencia para comparar la eficacia de distintos algoritmos de RL sobre un modelo base pequeño. Los investigadores pueden reproducir los experimentos y analizar el efecto del entrenamiento.
- *Fine-tuning* posterior: al ser un checkpoint intermedio (paso 200), puede servir como punto de partida para continuar el entrenamiento con otros datasets o métodos.
- Evaluación de la estabilidad del RL: permite estudiar la degradación o mejora de capacidades del modelo base tras aplicar RL con restricciones KL.
- Prototipado de agentes conversacionales: con el modelo base Qwen3-1.7B, se puede construir un chatbot ligero que aproveche el *tool calling*; este checkpoint podría ofrecer un comportamiento distinto tras el RL, aunque sin benchmarks no se puede garantizar.
- Generación de código en entornos con recursos limitados: el tamaño de 1.7B parámetros permite ejecutarlo en GPUs de consumo con cuantización (aunque aquí no se proporcionan). Es adecuado para tareas de autocompletado o asistencia de código en local.
- Educación y experimentación: por su naturaleza abierta y su tamaño reducido, es útil para enseñar conceptos de RL aplicados a modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Se recomienda realizar una evaluación propia antes de usar el modelo en cualquier aplicación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 8,1 GB (2.031.739.904 parámetros × 4 bytes), más overhead de activaciones y *cache* de atención. Se necesitarían al menos 10-12 GB de VRAM para una inferencia cómoda.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4080, A10, L4, etc. En fp32 no es eficiente; se recomienda cuantizar a int8 o int4 para reducir requisitos.
- En consumer GPU: sí, cabe en GPUs de gama media-alta si se cuantiza, pero el repositorio solo ofrece fp32, por lo que habría que convertir los pesos con herramientas como llama.cpp o vLLM.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI, o transformes con `pipeline`. También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos listos.
- Latencia y throughput: no se han medido. Para un modelo de 1.7B en fp32, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna, pero depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | 32K (según documentación oficial) | Apache 2.0 | safetensors | Modelo base, disponible en HF |
| Este checkpoint (FRPO RL) | 2.03B (pesos totales) | no disponible | no disponible | safetensors fp32 | Fine-tuning RL experimental |
| Llama-3.2-1B | 1.23B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar, con licencia permisiva |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | safetensors, GGUF | Más grande, pero con buena documentación |

La comparativa es estructural, ya que no hay datos de rendimiento para este checkpoint. El modelo base Qwen3-1.7B es la referencia natural; este checkpoint podría diferir en comportamiento tras el RL, pero sin evaluaciones no se puede cuantificar.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Modelo experimental: es un checkpoint de investigación, no un modelo de producción. No se ha validado su comportamiento en tareas del mundo real.
- Pesos en fp32: el tamaño del repositorio (8,1 GB) es grande para un modelo de 1.7B; se requiere conversión a formatos cuantizados para despliegue eficiente.
- Sin benchmarks: no hay evidencia de que el RL haya mejorado o mantenido las capacidades del modelo base; podría haber degradación en ciertas tareas.
- Sesgos y alucinaciones: hereda los sesgos del modelo base Qwen3-1.7B, que pueden verse amplificados o mitigados por el RL, pero no se ha evaluado.
- Idioma y contexto: no se especifican idiomas soportados ni longitud de contexto; se asume que son los del modelo base, pero no está confirmado.

## Enlaces

- Repositorio HuggingFace: [FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed2](https://huggingface.co/FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed2)
- Modelo base: [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- Framework verl: [https://github.com/volcengine/verl](https://github.com/volcengine/verl)
