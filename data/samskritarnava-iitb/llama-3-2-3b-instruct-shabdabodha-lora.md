# samskritarnava-iitb/Llama-3.2-3B-Instruct-shabdabodha-lora

## Resumen

`Llama-3.2-3B-Instruct-shabdabodha-lora` es un adaptador LoRA en formato MLX-LM desarrollado por el grupo Samskritarnava del IIT Bombay para generar anotaciones de *śābdabodha* (análisis semántico de oraciones en sánscrito según la gramática de Panini) a nivel de palabra y de oración. Se construye sobre `mlx-community/Llama-3.2-3B-Instruct-4bit`, una cuantización de 4 bits del Llama 3.2 3B Instruct de Meta, y se entrena sobre las 183 oraciones de entrenamiento del dataset `samskritarnava-iitb/shabdabodha-dataset` en el marco del artículo *SHABDABODHA-LLM 2.0*.

El modelo resuelve un problema muy específico: producir la notación estructurada de relaciones kāraka (agente, objeto, instrumento, destinatario, etc.) para oraciones sánscritas, una tarea tradicionalmente reservada a especialistas en gramática paniniana. No es un modelo de propósito general ni un fine-tuning multilingüe amplio, sino una prueba de concepto académica cuyo objetivo es demostrar que un LLM pequeño puede reproducir el formato de anotación de śābdabodha.

Es relevante ahora por dos motivos: por un lado, explora la viabilidad de modelos de 3B parámetros para tareas de lingüística computacional de lenguas clásicas con pocos recursos; por otro, el propio autor lo etiqueta explícitamente como **preliminar**, con una tasa de coincidencia exacta del 0% en el conjunto de validación, lo que lo convierte en un caso de estudio sobre los límites del ajuste fino con datasets minúsculos y distribuciones sesgadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), adaptador LoRA sobre base cuantizada en 4 bits |
| Parametros totales | 3B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros (rango 8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens usados en entrenamiento; el contexto nativo del Llama 3.2 3B Instruct es mayor, pero no se especifica en la información disponible |
| Tipos de cuantizacion | Base en 4 bits (MLX); el adaptador es LoRA en formato MLX, no PEFT |
| Idiomas soportados | Sánscrito (tarea objetivo); el modelo base soporta multilingüe según Llama 3.2, no detallado en la información disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | MLX (adaptador LoRA en layout MLX); no compatible con PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `mlx-community/Llama-3.2-3B-Instruct-4bit`, una versión del transformer decoder-only Llama 3.2 3B Instruct cuantizada a 4 bits para su ejecución en Apple Silicon mediante MLX. El LoRA tiene rango 8, escala 20, dropout 0, y se aplica sobre las 16 capas superiores del modelo. El entrenamiento usa Adam con learning rate 1e-5, batch size 2, 300 iteraciones (aproximadamente 3,3 épocas), longitud máxima de secuencia 2048, pérdida calculada solo sobre los tokens de respuesta y semilla 42. Se ejecutó con MLX-LM 0.31.3 en un Apple M4 con 16 GB de RAM.

El corpus de entrenamiento son únicamente 183 oraciones sánscritas anotadas con notación de corchetes para śābdabodha. La pérdida de validación final fue 0,147 (mejor 0,145) y la pérdida de test 2,413, con una perplejidad de 11,17. No se menciona RLHF, DPO ni ninguna fase de alineamiento adicional más allá del ajuste supervisado sobre el dataset. La innovación técnica es modesta: se trata de un ajuste fino parametrizado eficiente (LoRA) sobre un modelo pequeño cuantizado, orientado a reproducir una notación formal específica, no a mejorar capacidades generales.

## Capacidades

- Generación de anotaciones śābdabodha a nivel de palabra y de oración en sánscrito, con notación de corchetes.
- Reproducción del formato de salida del dataset (100% de las 20 oraciones de validación generan salida bien formada).
- Identificación aproximada de etiquetas externas (90% de acierto) y de la cabeza verbal (35% de acierto).
- Clasificación de relaciones kāraka con F1 de 0,728 en el conjunto de validación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento.
- Capacidades multilingües: no evaluadas; el adaptador está especializado en sánscrito y el modelo base conserva las capacidades de Llama 3.2 3B Instruct, pero no se han medido.

## Casos de uso

- **Anotación asistida de corpus sánscritos**: el adaptador puede pre-anotar oraciones con notación śābdabodha para que un experto en gramática paniniana revise y corrija, reduciendo el trabajo manual inicial en proyectos de digitalización de textos clásicos.
- **Investigación en lingüística computacional del sánscrito**: sirve como línea base reproducible para comparar enfoques de ajuste fino (LoRA, rango, capas) sobre tareas de análisis kāraka con datasets pequeños.
- **Prototipado de herramientas educativas**: permite generar ejemplos de análisis semántico para estudiantes de sánscrito, siempre con revisión docente dada la baja tasa de coincidencia exacta.
- **Evaluación de modelos pequeños en lenguas de bajos recursos**: útil para estudiar hasta qué punto un modelo de 3B parámetros cuantizado a 4 bits puede aprender una notación formal compleja con 183 ejemplos.
- **Reproducción de experimentos en Apple Silicon**: al estar en formato MLX, se puede ejecutar y modificar en un Mac con 16 GB de RAM, lo que facilita la experimentación académica sin GPU dedicada.
- **Comparación con el adaptador Gemma 3 4B del mismo grupo**: el autor publica un adaptador equivalente sobre Gemma 3 4B, lo que permite contrastar el comportamiento de dos familias de modelos en la misma tarea.
- **Generación de datos sintéticos para aumentar el dataset**: las salidas bien formadas (100%) pueden servir como punto de partida para que expertos validen y amplíen el corpus de anotaciones.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Mejor pérdida de validación | 0,145 |
| Pérdida de validación final | 0,147 |
| Pérdida de test | 2,413 |
| Perplejidad de test | 11,17 |
| Oraciones retenidas (20): salida bien formada | 100% |
| Oraciones retenidas: coincidencia exacta | 0% |
| Oraciones retenidas: acierto de etiqueta externa | 90% |
| Oraciones retenidas: acierto de cabeza verbal | 35% |
| F1 de etiqueta kāraka | 0,728 |

Las medidas sobre el conjunto retenido son automáticas y aproximadas (coincidencia de patrones sobre la notación de corchetes, 20 oraciones). La pérdida a nivel de token no es comparable entre tokenizadores distintos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base está cuantizado a 4 bits y pesa aproximadamente 1,8-2 GB; el adaptador LoRA añade unos pocos MB. En la práctica cabe en menos de 4 GB de memoria unificada o VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en 4 bits; el autor lo entrenó y ejecutó en un Apple M4 con 16 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060, RTX 4090 y similares; también en Macs con Apple Silicon y 8 GB o más.
- Opciones de despliegue: MLX-LM (formato nativo del adaptador); al no ser un adaptador PEFT, no se puede cargar directamente en vLLM, TGI o llama.cpp sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-shabdabodha-lora | 3B + LoRA r8 | 2048 (entrenamiento) | Śābdabodha en sánscrito | Llama 3.2 Community | HuggingFace (MLX) |
| Gemma-3-4B-it-shabdabodha-lora | 4B + LoRA | no disponible | Śābdabodha en sánscrito | Gemma Terms of Use | HuggingFace (MLX) |
| Llama-3.2-3B-Instruct (base) | 3B | contexto nativo de Llama 3.2 | Propósito general | Llama 3.2 Community | HuggingFace, Ollama, etc. |

El adaptador Gemma 3 4B del mismo grupo es la alternativa más directa, ya que resuelve la misma tarea con una familia de modelos distinta y permite comparar el comportamiento. El Llama 3.2 3B Instruct sin ajustar es la referencia de partida: carece de la notación śābdabodha pero conserva las capacidades generales del modelo base. No se dispone de datos de rendimiento del adaptador Gemma en la información proporcionada.

## Limitaciones y advertencias

- **Modelo preliminar**: el propio autor lo describe como preliminar; reproduce la notación pero no las distinciones finas de kāraka.
- **Coincidencia exacta del 0%** en el conjunto retenido de 20 oraciones: ninguna salida coincide exactamente con la referencia.
- **Dataset minúsculo y sesgado**: solo 183 oraciones de entrenamiento con una distribución muy desequilibrada de relaciones kāraka.
- **Relaciones raras mal etiquetadas**: करण, गौणकर्म, मुख्यकर्म y सम्प्रदान se etiquetan incorrectamente con frecuencia.
- **Cabeza verbal poco fiable**: solo un 35% de acierto en la cabeza verbal, especialmente con verbos poco frecuentes.
- **Riesgo de alucinación**: al ser un modelo generativo ajustado con pocos datos, puede producir anotaciones plausibles pero incorrectas; requiere revisión experta antes de cualquier uso.
- **Licencia Llama 3.2 Community**: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de desplegarlo en producción.
- **Formato no estándar**: el adaptador está en layout MLX y no es PEFT, lo que limita su uso a MLX-LM y complica la integración con otros frameworks de inferencia.
- **Idiomas**: no se han evaluado capacidades multilingües del adaptador; su uso previsto es exclusivamente sánscrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samskritarnava-iitb/Llama-3.2-3B-Instruct-shabdabodha-lora
- Dataset: https://huggingface.co/datasets/samskritarnava-iitb/shabdabodha-dataset
- Código, prompt y scripts: https://github.com/samskritarnava-iitb/shabdabodha-llm
- Adaptador Gemma 3 4B equivalente: https://huggingface.co/samskritarnava-iitb/gemma-3-4b-it-shabdabodha-lora
- Organización: https://huggingface.co/samskritarnava-iitb
- Modelo base: https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit
