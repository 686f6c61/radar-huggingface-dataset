# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036

## Resumen

Este repositorio contiene un checkpoint intermedio de investigación publicado por el usuario HYU-NLP-EVAL: la política resultante tras 36 actualizaciones globales del optimizador en una ejecución de GRPO (Group Relative Policy Optimization) con rúbrica estática sobre el conjunto RaR-Medicine, de la que se planificaron 48 pasos en total. No es un modelo nuevo entrenado desde cero, sino un ajuste fino por refuerzo aplicado sobre Qwen/Qwen3-4B-Instruct-2507 (revisión base `cdbee75f17c01a7cc42f958dc650907174af0554`), con 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) y pensado explícitamente para compararse con la variante de rúbrica dinámica (OnlineRubrics) del mismo proyecto.

El interés de la publicación es metodológico más que de producto: documenta la identidad exacta del experimento (método `static_r0_matched`, fuente de recompensa `rar_static_r0_only`, dominio médico, 1.500 prompts de entrenamiento, semilla 11, batch global de prompts de 96, 16 rollouts por prompt, tasa de aprendizaje 5e-06 y modo de pensamiento desactivado), lo que permite reproducir o auditar la dinámica del entrenamiento. El propio autor advierte que se trata de un checkpoint de investigación intermedio y que no se formula ninguna afirmación de capacidad ni de seguridad clínica.

El repositorio incluye una exportación BF16 lista para inferencia con Transformers en la raíz y, en el directorio `original_checkpoint/`, el checkpoint original de la política en formato veRL/FSDP con su tokenizador y ficheros de configuración. El estado del optimizador, del entrenador y del cargador de datos no se publica, por lo que no se puede reanudar el entrenamiento desde este artefacto. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen/Qwen3-4B-Instruct-2507); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 4.022.468.096 (≈4,02 mil millones) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | BF16 publicado; GGUF, AWQ, GPTQ y FP8 no disponibles en el repositorio |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en BF16 (exportación para Transformers) y checkpoint original veRL/FSDP en `original_checkpoint/` |

Otros datos operativos: pipeline `text-generation`, librería `transformers`, etiquetas `grpo`, `static-rubric`, `rar-medicine`, `research` y `endpoints_compatible`. Tamaño del repositorio: 25,7 GB, coherente con el alojamiento conjunto de la exportación BF16 y el checkpoint original (inferencia, no dato verificado).

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4,02 mil millones de parámetros. Sobre esa política se aplicó un ajuste por refuerzo con GRPO, un algoritmo que estima la ventaja relativa de cada respuesta dentro de un grupo de rollouts generados para el mismo prompt, evitando así la necesidad de un modelo crítico separado. En esta ejecución concreta, el batch global de prompts fue de 96 y se generaron 16 rollouts por prompt, con una tasa de aprendizaje de 5e-06 y la semilla 11. El modo de pensamiento (*thinking*) permaneció desactivado durante todo el entrenamiento, de modo que la política se optimizó para responder directamente, sin cadena de razonamiento explícita.

La señal de recompensa no provino de un modelo de recompensa aprendido ni de una rúbrica generada dinámicamente, sino de una rúbrica estática denominada `rar_static_r0_only`, aplicada a los 1.500 prompts del conjunto RaR-Medicine, orientado al dominio médico. El identificador del método (`static_r0_matched`) y la existencia declarada de checkpoints paralelos con rúbrica dinámica indican que el experimento forma parte de un estudio comparativo controlado: misma política, mismos prompts y misma semilla, variando únicamente el origen de la recompensa. El checkpoint corresponde al paso 36 de los 48 planificados, por lo que representa una política a tres cuartas partes de su recorrido de optimización y no el resultado final del experimento.

No se documentan en la información disponible ni la composición exacta del dataset, ni el número de tokens de entrenamiento, ni si hubo fases previas de SFT, DPO o RLHF adicionales sobre el modelo base más allá del GRPO descrito.

## Capacidades

- Generación de texto conversacional en formato instruccional, heredada del modelo base Qwen3-4B-Instruct-2507 y modulada por el ajuste con GRPO.
- Respuesta a instrucciones del dominio médico bajo el régimen de rúbrica estática con el que fue optimizado; el autor no formula ninguna afirmación de capacidad médica.
- Inferencia en modo directo, sin cadena de razonamiento explícita (thinking desactivado), lo que reduce la latencia respecto a configuraciones con razonamiento extendido.
- Compatible con el pipeline `text-generation` de Transformers y con `text-generation-inference` (etiqueta `endpoints_compatible`), lo que habilita su despliegue en infraestructura de endpoints estándar.
- Se desconoce el soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio o capacidades multilingües específicas: no disponible en la información proporcionada.
- Artefacto de investigación utilizable como referencia intermedia para estudiar la evolución de la política durante el entrenamiento (paso 36 de 48).

## Casos de uso

- Reproducibilidad experimental en investigación de RL: el repositorio documenta método, fuente de recompensa, semilla, batch, número de rollouts y tasa de aprendizaje, de modo que un grupo de investigación puede replicar la ejecución o verificar la trayectoria de la política hasta el paso 36.
- Estudio comparado de recompensas estáticas frente a dinámicas: al existir checkpoints paralelos con rúbrica dinámica (OnlineRubrics) sobre los mismos prompts y semilla, este artefacto sirve como rama de control para medir el efecto del diseño de la recompensa.
- Análisis de deriva de política y *reward hacking*: al disponer del checkpoint original en `original_checkpoint/` y del SHA256 de los parámetros del actor, se puede comparar la distribución de salidas frente al modelo base y detectar atajos aprendidos por la política.
- Investigación en adaptación de dominio médico: los 1.500 prompts de RaR-Medicine permiten estudiar cómo se desplaza el comportamiento de un modelo generalista de 4B bajo optimización con recompensas específicas de dominio, sin sacar conclusiones clínicas.
- Punto de partida para ajustes posteriores: es un inicializador válido para continuar el entrenamiento con RL o SFT en un pipeline propio, teniendo en cuenta que el estado del optimizador no se publica y que habría que reanudar el ciclo de optimización desde cero.
- Validación de infraestructura de servicio: al ser un modelo denso de 4B en BF16 con soporte declarado para Transformers y TGI, resulta adecuado para probar despliegues en endpoint, medir latencia y verificar la compatibilidad de plantillas de chat antes de escalar a modelos mayores.
- Estudios de compresión y cuantización: sirve como sujeto de prueba para generar versiones GGUF, AWQ o GPTQ y medir la degradación de comportamiento en tareas médicas tras la cuantización, dado que el repositorio no publica pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y la búsqueda web asociada no devolvió resultados relacionados con el modelo. Tampoco se documentan métricas de recompensa, curvas de entrenamiento ni comparaciones cuantitativas con la rama de rúbrica dinámica.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,1 GB solo para pesos (4,02 mil millones de parámetros × 2 bytes). Con caché KV y sobrecarga del runtime, un presupuesto realista se sitúa en torno a 10-12 GB para contextos moderados; los valores exactos dependen de la longitud de contexto, que no está documentada.
- VRAM en cuantizaciones de menor precisión (no publicadas, estimaciones a partir del recuento de parámetros): en torno a 4-4,5 GB en INT8/FP8 y 2,5-3 GB en INT4. Requieren un proceso de cuantización externo, ya que el repositorio solo distribuye BF16.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para servicio en producción; RTX 3090, RTX 4090, A10G o L4 (24 GB) para desarrollo y despliegues de un solo usuario.
- Cabe en GPU de consumo: sí. En BF16 entra con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080/4090) y, tras cuantización a 4 bits, en tarjetas de 8 GB.
- Opciones de despliegue: Transformers con `torch_dtype="bfloat16"` y `device_map="auto"` (ruta soportada oficialmente por el autor), y Text Generation Inference (TGI), respaldado por las etiquetas `text-generation-inference` y `endpoints_compatible`. vLLM y Ollama son viables en principio por tratarse de un transformer estándar compatible con safetensors, pero no están confirmados en la documentación y requerirían conversión a GGUF en el caso de Ollama o llama.cpp.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (step 36) | 4,02 B | no disponible | GRPO con rúbrica estática sobre RaR-Medicine, paso 36 de 48 | Apache 2.0 | Público en HuggingFace; checkpoint intermedio de investigación |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | no disponible | Ajuste instruccional del autor original; detalles no disponibles aquí | Apache 2.0 | Público en HuggingFace |
| Rama de rúbrica dinámica del mismo proyecto (OnlineRubrics) | no disponible | no disponible | GRPO con rúbrica dinámica, misma configuración declarada | no disponible | Mencionada en la model card; sin enlace proporcionado |
| Alternativas de la misma categoría (otros modelos densos de ~4B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa verificable es con el modelo base, del que este checkpoint hereda arquitectura, tamaño y licencia y del que se diferencia exclusivamente por el ajuste con GRPO descrito. No se dispone de datos de rendimiento que permitan ordenar estas alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 36 de 48 actualizaciones planificadas. Su comportamiento no representa el resultado final del experimento y puede estar en una fase de optimización inacabada.
- Advertencia explícita del autor: no es un modelo clínico y no se formula ninguna afirmación de capacidad ni de seguridad médica. No debe usarse para diagnóstico, tratamiento ni asesoramiento sanitario.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de error, por lo que el riesgo de invención de contenido, especialmente crítico en dominio médico, es desconocido y no acotado.
- Sesgos: no se documenta ningún análisis de sesgo, demográfico ni lingüístico. Los sesgos del modelo base y los introducidos por el ajuste con recompensas específicas de dominio permanecen sin caracterizar.
- Idiomas soportados: no disponibles en la información proporcionada, lo que impide garantizar un comportamiento correcto fuera de los idiomas con los que se entrenó el modelo base.
- Longitud de contexto: no disponible. No debe asumirse una ventana concreta sin verificarla en la configuración del modelo base subyacente.
- Reanudación del entrenamiento: el estado del optimizador, del entrenador y del cargador de datos no se publica, de modo que no es posible retomar la ejecución exactamente desde el paso 36 con este repositorio.
- Licencia: Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece garantías y el uso comercial de un artefacto de investigación con comportamiento no evaluado en dominio médico conlleva riesgo reputativo y regulatorio.
- Atribución y trazabilidad: el SHA256 de los parámetros del actor (`499751fe88d576222088f2dad491435325ae00fff5eae77b5eea1cc8f0d0a5da`) permite verificar la integridad del checkpoint original, pero no se publican métricas que permitan validar su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVAL
- Resultados de la búsqueda web: no se encontraron enlaces relevantes al modelo (los resultados devueltos correspondían a páginas corporativas de Microsoft y no guardan relación con este repositorio). No se dispone de enlaces a papers, blogs, repositorios de código ni demos.
