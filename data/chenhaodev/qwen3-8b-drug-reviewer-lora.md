# chenhaodev/qwen3-8b-drug-reviewer-lora

## Resumen

El modelo `chenhaodev/qwen3-8b-drug-reviewer-lora` es un adaptador LoRA creado a partir de `Qwen/Qwen3-8B` que actúa como revisor de respuestas sobre medicamentos y detector de alucinaciones. Su objetivo es reducir los errores y la fabricación de información en sistemas de preguntas y respuestas farmacéuticas, mediante la clasificación de la respuesta de un modelo grande como correcta, parcialmente correcta o claramente alucinada. Además, puede integrarse en pipelines RAG para indicar cuándo es necesario volver a buscar evidencia.

Fue desarrollado por `chenhaodev` y se publica bajo licencia Apache 2.0. El adaptador se entrenó sobre un corpus destilado de fuentes médicas en chino e inglés, con aproximadamente 21.900 muestras. El modelo base tiene 8.000 millones de parámetros, y el adaptador añade un 0,53 % de parámetros entrenables. El tamaño del repositorio es de 0,2 GB, y los pesos se distribuyen en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA aplicada a un transformer decoder-only (Qwen/Qwen3-8B) |
| Parametros totales | Modelo base: ~8.000 millones; adaptador: ~42 millones entrenables (0,53 % de los parámetros del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; en la documentación de uso se emplea `max_seq_length=1536` para el adaptador |
| Tipos de cuantizacion | No se publican pesos cuantizados del adaptador; el ejemplo de inferencia carga el modelo base en 4-bit con bitsandbytes |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3-8B`, un transformer decoder-only, al que se le aplica una adaptación de baja dimensionalidad mediante LoRA. El entrenamiento utiliza LoRA con r=16 y alpha=16, RSLoRA, y adaptadores en todas las capas de atención y MLP. Durante el entrenamiento, el modelo base se cargó en 4-bit con bitsandbytes, y se entrenó con precisión bf16, tamaño de lote 8, tasa de aprendizaje 2e-4 con programación coseno y 2 épocas sobre un subconjunto balanceado de 8.000 muestras. La pérdida final del entrenamiento fue de aproximadamente 0,86 a 1,06.

El corpus de entrenamiento consta de unas 21.900 muestras destiladas de cuatro fuentes médicas: el manual clínico "临床药物速查手册 (第3版)", la obra "常用药物禁忌与合理用药" de la Sociedad Farmacéutica China, monografías de UpToDate y extractos de "西氏内科学精要". Las muestras se distribuyen en tres categorías: datos fundamentados (9.921), verificación de consistencia entre evidencia y respuesta (9.359) y discriminación entre respuestas correctas y fabricadas (2.628). Todos los hechos fueron destilados directamente de los fragmentos originales, lo que permite alinear el modelo con bases de conocimiento FAISS para su uso en RAG.

## Capacidades

- Revisión de respuestas sobre medicamentos y detección de alucinaciones: proporciona un veredicto A, B o C según el grado de respaldo de la evidencia.
- Modo independiente: dado un usuario y una respuesta de un modelo grande, devuelve un nivel de riesgo y la acción recomendada (aceptar o volver a ejecutar RAG).
- Modo RAG: dadas la evidencia recuperada y la respuesta, evalúa la consistencia y emite una bandera `re_rag` para indicar si se necesita una nueva búsqueda.
- Salida en formato JSON estructurado con los campos `verdict`, `risk`, `reason` y `re_rag`.
- Detección de errores concretos en respuestas farmacéuticas: cambios de cifras en dosis, intercambios de indicaciones y contraindicaciones inventadas.
- Soporte multilingüe en chino e inglés.
- No se documenta soporte explícito de tool calling, agentes, visión o audio.

## Casos de uso

- Control de calidad en chatbots de farmacia: el modelo revisa automáticamente cada respuesta generada sobre dosis, indicaciones y contraindicaciones antes de mostrarla al usuario, y solo la publica si el veredicto es A.
- Pipeline RAG en salud: cuando el sistema de preguntas y respuestas recupera evidencia, el revisor compara la respuesta con los fragmentos encontrados y, si detecta un veredicto B o C, obliga a lanzar una nueva búsqueda antes de la respuesta final.
- Detección de alucinaciones en respuestas de LLM sobre fármacos: se integra como un filtro posterior para identificar respuestas plausibles pero erróneas, como dosis cambiadas o contraindicaciones inventadas.
- Auditoría de contenido educativo médico: valida material generado automáticamente sobre medicamentos, como apuntes o preguntas de examen, y señala riesgos de contenido no fundamentado.
- Soporte de segunda opinión para profesionales sanitarios: un farmacéutico o médico puede introducir una respuesta generada por un LLM y obtener una clasificación de riesgo baja, media o alta para decidir si requiere revisión manual.
- Evaluación de respuestas en entornos de investigación clínica: permite filtrar respuestas generadas por modelos en simulaciones educativas o ensayos controlados antes de su uso en material de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento (iniciada en torno a 2,7 y finalizada entre 0,86 y 1,06), pero no incluye métricas de evaluación externa como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparativas de rendimiento con otros modelos en las tareas de revisión farmacéutica.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; el ejemplo de inferencia carga el modelo base en 4-bit con bitsandbytes, lo que reduce el consumo de VRAM, pero no se proporciona una cifra exacta.
- GPU recomendadas: no especificadas. Por el tamaño del modelo base de 8B en 4-bit, es viable en GPUs de consumo con al menos 12 GB de VRAM, como una RTX 3090 o RTX 4090, aunque esta es una estimación no confirmada por el autor.
- Opciones de despliegue: el código de ejemplo utiliza `unsloth` (FastLanguageModel) y `PEFT` para cargar el adaptador. También es compatible con la biblioteca HuggingFace Transformers junto con PEFT. No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en los datos proporcionados. A efectos ilustrativos, se compara el adaptador con su modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | Modelo completo | ~8.000 millones | No disponible en esta informacion | Apache 2.0 | HuggingFace |
| Qwen3-8B Drug-Reviewer LoRA | Adaptador LoRA | ~42 millones entrenables | No disponible en esta informacion (usa 1536 en el ejemplo) | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No sustituye el juicio de un profesional sanitario: la model card incluye un aviso médico explícito que indica que la salida automatizada debe ser verificada por un humano.
- El rendimiento depende del dominio farmacológico y del corpus médico en chino e inglés; su uso fuera de este ámbito puede producir resultados impredecibles.
- El entrenamiento se realizó sobre un subconjunto balanceado de 8.000 muestras del total de 21.900, por lo que puede no cubrir todos los escenarios posibles de preguntas sobre medicamentos.
- Riesgo de alucinación residual: si la evidencia RAG es incompleta o la pregunta es ambigua, el modelo puede emitir un veredicto incorrecto.
- El corpus de entrenamiento proviene de libros con derechos de autor y de UpToDate; solo se publican los pesos destilados, no los datos originales, lo que limita la reproducibilidad completa del pipeline.
- Solo soporta chino e inglés; no se garantiza una correcta revisión en otros idiomas.
- No se documenta soporte para tool calling, agentes ni entradas multimodales, por lo que su integración en sistemas complejos requiere desarrollo adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chenhaodev/qwen3-8b-drug-reviewer-lora
- Model card del repositorio: https://huggingface.co/chenhaodev/qwen3-8b-drug-reviewer-lora/tree/main
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información proporcionada.
