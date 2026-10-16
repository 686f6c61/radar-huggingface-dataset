# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002` es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL en HuggingFace. Se trata de un checkpoint intermedio, concretamente el paso 2, de un piloto de entrenamiento con refuerzo denominado `261016_medicine_static_pilot`, ejecutado con semilla 11 y orientado al dominio médico. No es un modelo pensado para producción: es un artefacto de investigación y evaluación.

Con 4.022.468.096 parámetros verificados en los safetensors, es un transformer decoder-only denso de aproximadamente 4B parámetros. Hereda la arquitectura, la ventana de contexto y las capacidades del modelo base Qwen3-4B-Instruct-2507 (variante sin modo "thinking"), aunque la model card del fine-tune no documenta ninguno de esos detalles de forma explícita.

Su interés es metodológico: ilustra un flujo de trabajo de RL con veRL/FSDP sobre un modelo pequeño y declara explícitamente la semilla, el paso y la verificación de hashes SHA256 antes de eliminar el checkpoint local, lo que facilita la reproducibilidad. Con 0 descargas y 0 likes en el momento de la consulta, y con solo dos pasos de entrenamiento completados, no debe considerarse un modelo médico funcional ni evaluado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-4B-Instruct-2507; la model card del fine-tune no la detalla) |
| Parámetros totales | 4.022.468.096 (~4,02 B), dato real de los safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card del fine-tune; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantización | No disponible. Se publica un export BF16 de Transformers; no se incluyen pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no los lista; el modelo base declara soporte multilingüe amplio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (export BF16 para Transformers) y checkpoint nativo veRL/FSDP en `original_checkpoint/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 25,7 GB |
| Pipeline declarado | text-generation |
| Librería | transformers (también etiquetado como endpoints_compatible y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de unos 4B parámetros, en su variante instruct sin modo de razonamiento explícito (la serie Qwen3 Instruct 2507 no genera bloques de pensamiento, a diferencia de la serie Qwen3 Thinking 2507). El fine-tune no introduce cambios estructurales conocidos; la model card no describe modificaciones de arquitectura, ni decodificación especulativa, ni atención lineal.

El entrenamiento se realizó con veRL sobre FSDP, un stack habitual para aprendizaje por refuerzo con modelos grandes. El repositorio corresponde al run `261016_medicine_static_pilot`, checkpoint del paso 2, semilla 11, sobre un conjunto de datos médicos estáticos. No se especifican ni el número de tokens de entrenamiento, ni la composición del dataset, ni el algoritmo de RL (GRPO, PPO u otro), ni hiperparámetros como tasa de aprendizaje o tamaño de lote. El autor indica que el checkpoint local se elimina únicamente después de verificar tamaños y hashes SHA256 de todos los ficheros remotos. Con dos pasos de entrenamiento, es esperable que el comportamiento del modelo sea muy próximo al del modelo base, aunque esto no está verificado con evaluaciones.

## Capacidades

Las siguientes capacidades son las que cabría esperar por herencia del modelo base; la model card del fine-tune no las documenta ni las valida para este checkpoint concreto.

- Generación de texto e instrucciones en formato conversacional, con plantilla de chat de Qwen3.
- Razonamiento general y resolución de problemas de dificultad media propios de un modelo de 4B parámetros.
- Generación de código y matemáticas básicas, en el nivel esperable para su tamaño.
- Ventana de contexto larga (hasta 262.144 tokens según el modelo base), útil para documentos extensos.
- Soporte multilingüe amplio, heredado del modelo base.
- Soporte de tool calling y function calling en el formato de Qwen, lo que permite integración en agentes.
- Sin modo "thinking": la variante Instruct 2507 responde directamente, sin cadena de pensamiento explícita.
- Especialización médica: no demostrada. El ajuste es un piloto de dos pasos y no hay evaluaciones que confirmen mejora alguna en tareas clínicas.

## Casos de uso

- Reproducción de experimentos de RL: el repositorio incluye el checkpoint nativo veRL/FSDP y declara semilla y paso, lo que permite reproducir o auditar el pipeline de entrenamiento con refuerzo sobre un modelo de 4B.
- Validación de infraestructura de entrenamiento: sirve como prueba de humo para verificar que un stack veRL/FSDP exporta correctamente a BF16 y que los hashes coinciden, antes de lanzar runs largos y costosos.
- Punto de partida para ajustes posteriores: al ser un checkpoint temprano con licencia Apache 2.0, puede usarse como inicialización de experimentos de fine-tuning médico con SFT o DPO.
- Investigación en evaluación de modelos médicos: útil como muestra de control para estudiar cómo se comportan checkpoints intermedios frente al modelo base en baterías de preguntas clínicas.
- Prototipado de asistentes conversacionales de dominio sanitario en entornos de laboratorio, siempre con revisión humana y sin uso clínico directo.
- Experimentos de tool calling y agentes: al heredar el soporte de function calling del modelo base, permite probar pipelines de recuperación aumentada (RAG) sobre corpus biomédicos en fase de prototipo.
- Docencia y divulgación: ejemplo didáctico de publicación de checkpoints con verificación de integridad y metadatos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MedQA ni ninguna otra métrica, y la búsqueda web no ha devuelto documentación técnica asociada a este repositorio.

## Requisitos de hardware

Las cifras de VRAM para los pesos son cálculos directos a partir de los 4.022.468.096 parámetros; el resto son estimaciones orientativas, no medidas publicadas.

- Pesos en BF16/FP16: aproximadamente 8,0 GB.
- Pesos en INT8: aproximadamente 4,0 GB.
- Pesos en INT4: aproximadamente 2,5 GB (requiere cuantización propia, no se distribuye en ese formato).
- GPU de consumo: cabe holgadamente en una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) en BF16. En una RTX 3060 de 12 GB entra en BF16 con contexto moderado; con contextos muy largos conviene INT8 o reducir el tamaño de lote.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S son adecuadas para servir con lotes grandes y contexto largo. Para inferencia en BF16 de un solo usuario no se necesita este hardware.
- Memoria adicional: hay que sumar la caché KV, que crece linealmente con la longitud de contexto y el número de secuencias concurrentes, y que en ventanas de 262.144 tokens puede superar con holgura el tamaño de los pesos.
- Despliegue: transformers (formato publicado), vLLM y TGI (el repositorio está etiquetado como endpoints_compatible y text-generation-inference). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, tarea no realizada por el autor.
- Latencia y throughput: no disponibles. No se han publicado medidas y cualquier cifra sería especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-002 | 4,02 B | No disponible en su model card (heredado del base) | Apache 2.0 | HuggingFace, safetensors BF16 + checkpoint veRL/FSDP | No publicados |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B | 262.144 tokens (según su model card) | Apache 2.0 | HuggingFace, safetensors, ampliamente soportado | Publicados por el autor del modelo base |
| Qwen/Qwen3-4B-Thinking-2507 | ~4 B | 262.144 tokens (según su model card) | Apache 2.0 | HuggingFace, safetensors | Publicados por el autor del modelo base |

Alternativas de dominio médico existen en el ecosistema (por ejemplo, la familia MedGemma de Google, con licencia específica para salud, o BioMistral, derivada de Mistral). No se dispone de datos verificados en la información proporcionada para compararlas numéricamente con este checkpoint, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se han completado dos pasos de entrenamiento. Es muy probable que su comportamiento sea casi idéntico al del modelo base, sin ganancia demostrada en el dominio médico.
- Ausencia total de evaluación: no hay métricas, ni validación externa, ni comparación con el modelo base. No hay evidencia de que mejore en tareas clínicas y podría incluso degradarlas.
- Riesgo de alucinación: elevado en un modelo de 4B parámetros, especialmente en dominio sanitario, donde una respuesta incorrecta puede tener consecuencias graves. No debe usarse para diagnóstico, triaje, dosificación ni consejo clínico.
- Sesgos: hereda los sesgos del corpus de entrenamiento del modelo base, que no se documentan en este repositorio. La composición del dataset médico del piloto es desconocida.
- Idiomas: no disponibles. No se puede asumir un rendimiento correcto en castellano sin evaluarlo.
- Contexto: aunque el modelo base declara 262.144 tokens, este fine-tune no confirma esa cifra; la ventana efectiva debería validarse empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero el uso en productos sanitarios está sujeto a normativa específica (reglamento europeo de productos sanitarios y clasificación de sistemas de IA de alto riesgo en el Reglamento de IA de la UE) que este artefacto no cumple por sí mismo.
- Reproducibilidad limitada: se declaran semilla y paso, pero no la composición del dataset ni los hiperparámetros, lo que dificulta replicar exactamente el run.
- Madurez del repositorio: 0 descargas y 0 likes, sin señales de uso por terceros ni mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo ni con el autor; los resultados obtenidos correspondían a entidades no relacionadas (Hyundai, canales de YouTube y catálogos comerciales).
