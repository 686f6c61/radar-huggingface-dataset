# samskritarnava-iitb/gemma-3-4b-it-shabdabodha-lora

## Resumen

`gemma-3-4b-it-shabdabodha-lora` es un adaptador LoRA en formato MLX-LM sobre el modelo cuantizado a 4 bits `mlx-community/gemma-3-4b-it-4bit`. Lo desarrolla la organización `samskritarnava-iitb` (vinculada al IIT de Bombay) y su función es generar anotaciones de *śābdabodha* —el análisis semántico-oracional de la tradición gramatical sánscrita— a nivel de palabra y de oración. El adaptador se entrena sobre las 183 oraciones de entrenamiento del dataset `samskritarnava-iitb/shabdabodha-dataset` y se enmarca en el artículo *SHABDABODHA-LLM 2.0*.

El modelo resuelve un problema muy específico de procesamiento del sánscrito: producir una notación estructurada de relaciones kāraka (roles semánticos) y de la estructura de constituyentes. No es un modelo de propósito general, sino una sonda de investigación que demuestra que un LLM pequeño (4B parámetros) puede reproducir la notación de salida de este formalismo. Los propios autores lo califican de **preliminar**: reproduce la notación, pero todavía no las distinciones finas de kāraka.

La relevancia es doble. Por un lado, aporta un artefacto reproducible y ligero (entrenado en un Apple M4 de 16 GB) para quien investigue análisis semántico del sánscrito. Por otro, sirve de referencia metodológica sobre los límites del ajuste fino con datasets minúsculos y distribuciones muy sesgadas. No hay resultados de benchmarks generales ni datos de rendimiento más allá de las métricas internas del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA |
| Parámetros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio (rango 8, top 16 capas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; contexto del base Gemma 3 4B no especificado en la información disponible |
| Tipos de cuantización | Base en 4 bits (MLX); el adaptador se distribuye en formato MLX LoRA |
| Idiomas soportados | Sánscrito (entrada y salida); no se declaran otros idiomas |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | MLX-LM LoRA (no es un adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 4B Instruct cuantizado a 4 bits en formato MLX. La configuración LoRA es rango 8, escala 20, dropout 0 y aplicación en las 16 capas superiores. El entrenamiento usa Adam con learning rate 1e-5, batch size 2, 300 iteraciones (unas 3,3 épocas), longitud máxima de secuencia 2048 y cálculo de pérdida únicamente sobre los tokens de respuesta (loss on response tokens only), con semilla 42. Todo el pipeline se ejecutó con MLX-LM 0.31.3 en un Apple M4 con 16 GB de memoria unificada.

El dataset de entrenamiento consta de solo 183 oraciones con una distribución fuertemente sesgada de relaciones kāraka, lo que explica buena parte de las limitaciones observadas. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineamiento adicionales; el ajuste es supervisado sobre pares instrucción-respuesta con la notación de corchetes propia del formalismo śābdabodha. La innovación técnica no está en la arquitectura, sino en el formato de anotación estructurada y en la demostración de que un adaptador de bajo rango sobre un modelo 4B cuantizado puede capturar la sintaxis de salida del formalismo.

## Capacidades

- Generación de anotaciones śābdabodha a nivel de palabra y de oración para oraciones en sánscrito.
- Producción de notación estructurada con etiquetas de relación kāraka y cabeza verbal en formato de corchetes.
- Reproducción fiable de la *notación* de salida (70% de salidas bien formadas en el conjunto de validación).
- Identificación de la etiqueta externa de la estructura en el 85% de los casos de validación.
- No soporta tool calling ni function calling de forma declarada.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento específicas del adaptador.
- Capacidad multilingüe limitada al sánscrito para la tarea; el modelo base Gemma 3 conserva sus capacidades originales, pero el adaptador no las potencia.

## Casos de uso

- **Anotación asistida de corpus sánscritos**: el adaptador genera una primera pasada de etiquetas kāraka sobre oraciones nuevas, que un experto revisa y corrige. Es adecuado porque automatiza la parte mecánica de la notación y deja al filólogo el juicio sobre las relaciones raras.
- **Investigación en gramática computacional del sánscrito**: sirve como línea base reproducible para comparar formalismos, prompts o tamaños de modelo dentro del proyecto SHABDABODHA-LLM 2.0, ya que el adaptador equivalente para Llama 3.2 3B permite un análisis cruzado.
- **Prototipado en hardware de consumo**: al ejecutarse con MLX-LM sobre un Apple M4 de 16 GB, permite montar un entorno de experimentación local sin GPU dedicada para probar prompts y formatos de anotación.
- **Generación de datos sintéticos de entrenamiento**: las salidas bien formadas (70%) pueden filtrarse y usarse para ampliar el dataset de anotación, siempre con revisión humana dado el 0% de coincidencia exacta.
- **Enseñanza de la tradición gramatical**: como herramienta didáctica que muestra la notación śābdabodha de una oración y permite al estudiante contrastarla con el análisis manual, con la advertencia de que las etiquetas deben verificarse.
- **Evaluación de robustez de adaptadores LoRA con datasets pequeños**: el propio modelo, con sus métricas publicadas (F1 de kāraka de 0,668, precisión de cabeza del 40%), constituye un caso de estudio sobre sobreajuste y sesgo de distribución en ajuste fino de bajo rango.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Mejor pérdida de validación / final | 0,249 / 0,302 |
| Pérdida de test / perplejidad | 2,860 / 17,47 |
| Conjunto reservado (20 oraciones): bien formadas / coincidencia exacta | 70% / 0% |
| Conjunto reservado: precisión de etiqueta externa / de cabeza | 85% / 40% |
| Conjunto reservado: F1 de etiqueta kāraka | 0,668 |

Las medidas del conjunto reservado son automáticas y aproximadas (coincidencia de patrones sobre la notación de corchetes, 20 oraciones). La pérdida a nivel de token no es comparable entre tokenizadores distintos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base cuantizado a 4 bits ocupa aproximadamente 2-2,5 GB de pesos, más el adaptador LoRA, de tamaño muy reducido.
- Entrenamiento documentado en un Apple M4 con 16 GB de memoria unificada; inferencia viable en equipos Apple Silicon con 16 GB o más.
- En GPU dedicadas, una RTX 4090 (24 GB) o superior permite ejecutar el modelo base en 4 bits con holgura; A100 y H100 quedan sobredimensionadas para esta carga.
- Cabe en GPU de consumo con al menos 8 GB de VRAM si se usa una cuantización 4 bits compatible con el runtime elegido.
- Despliegue documentado con MLX-LM en macOS. Para otros entornos habría que convertir los pesos, ya que el adaptador está en formato MLX y no es PEFT.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-4b-it-shabdabodha-lora | 4B (base) + LoRA | 2048 en entrenamiento | Anotación śābdabodha en sánscrito | Gemma Terms of Use | HuggingFace, formato MLX |
| Llama-3.2-3B-Instruct-shabdabodha-lora | 3B (base) + LoRA | no disponible | Anotación śābdabodha en sánscrito | no disponible en la información | HuggingFace, mismo autor |
| Gemma 3 4B Instruct (base, sin adaptador) | 4B | no disponible | Propósito general | Gemma Terms of Use | HuggingFace, múltiples formatos |

La comparativa directa con otros sistemas de análisis kāraka no está disponible en la información proporcionada. El adaptador para Llama 3.2 3B del mismo autor es la alternativa más cercana y permite un contraste entre familias de modelos sobre la misma tarea y dataset.

## Limitaciones y advertencias

- Modelo explícitamente **preliminar**: reproduce la notación de salida, pero no las distinciones finas de kāraka.
- Entrenado con solo 183 oraciones y una distribución de relaciones kāraka fuertemente sesgada; las relaciones raras (करण, गौणकर्म, मुख्यकर्म, सम्प्रदान) se etiquetan mal con frecuencia.
- La cabeza verbal es incorrecta en muchos casos cuando el verbo aparece poco en el entrenamiento (precisión de cabeza del 40% en validación).
- Coincidencia exacta del 0% en el conjunto reservado: ninguna salida reproduce íntegramente la anotación de referencia.
- Riesgo alto de alucinación en la notación: puede generar estructuras de corchetes sintácticamente plausibles pero semánticamente erróneas.
- Las salidas deben ser revisadas por un experto antes de cualquier uso.
- Licencia Gemma Terms of Use: el adaptador es derivado de Gemma 3 y queda sujeto a las restricciones de uso comercial de dichos términos.
- El adaptador está en formato MLX y no es PEFT, lo que limita su uso a entornos MLX-LM o requiere conversión.
- No se declaran idiomas soportados más allá del sánscrito para la tarea; el comportamiento fuera de ese dominio no está caracterizado.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samskritarnava-iitb/gemma-3-4b-it-shabdabodha-lora
- Dataset: https://huggingface.co/datasets/samskritarnava-iitb/shabdabodha-dataset
- Código, prompt y scripts: https://github.com/samskritarnava-iitb/shabdabodha-llm
- Adaptador equivalente para Llama 3.2 3B: https://huggingface.co/samskritarnava-iitb/Llama-3.2-3B-Instruct-shabdabodha-lora
- Organización: https://huggingface.co/samskritarnava-iitb
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
