# jasort/gsat-natural-qwen2.5-1.5b

## Resumen

El modelo `jasort/gsat-natural-qwen2.5-1.5b` es un ajuste fino de dominio sobre `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario jasort y orientado específicamente a las ciencias naturales del examen GSAT (學測) de Taiwan. Se trata de un modelo denso de 1.543.714.304 parámetros (1,54 mil millones) que hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y que ha sido especializado mediante aprendizaje supervisado sobre un corpus curado de 1.947 muestras conversacionales.

El problema que aborda es concreto: un tutor y generador de respuestas para preguntas de ciencias naturales de nivel preuniversitario en chino, con un estilo de salida definido (conclusión primero, razonamiento breve y verificable, cálculos con unidades y prohibición explícita de inventar figuras o tablas ausentes). Es relevante ahora porque demuestra un flujo de trabajo reproducible y de bajo coste (Unsloth + QLoRA 4 bits + rsLoRA) para adaptar un modelo pequeño a un dominio educativo muy específico, y porque apunta a despliegue en navegador mediante un repositorio hermano exportado a ONNX/WebGPU.

La relevancia práctica del modelo es, por tanto, doble: como asistente educativo en chino tradicional para el temario GSAT, y como referencia metodológica para ajustes de dominio con presupuesto reducido. No se han publicado resultados de benchmarks ni detalles completos de configuración de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajustado mediante LoRA sobre atención y proyecciones MLP |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Longitud de contexto | No especificada en la model card; hereda la del modelo base Qwen2.5-1.5B-Instruct (32.768 tokens, ampliable con YaRN) |
| Tipos de cuantizacion | Cuantización NF4 de 4 bits usada durante el entrenamiento (QLoRA); no se publican pesos cuantizados para inferencia |
| Idiomas soportados | zh (chino; orientado al chino tradicional de Taiwan) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB, coherente con pesos fusionados en fp16/bf16) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Pipeline | text-generation |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion (metadato) | 2026-09-14T11:12:14Z |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA). Sobre esa base, el autor aplica un ajuste por adaptadores de bajo rango: LoRA con rango estabilizado (rsLoRA) sobre las capas de atención y las proyecciones MLP, entrenado en precisión de 4 bits NF4 mediante Unsloth. Esto implica que el entrenamiento se realizó sobre un checkpoint cuantizado y que la pérdida se calculó únicamente sobre la respuesta final del asistente (completion-only loss), una elección habitual para evitar que el modelo aprenda a reproducir los turnos del usuario.

El conjunto de datos consta de 1.947 muestras conversacionales curadas, agrupadas en tres versiones (V1, V2 y V2.1), que combinan ítems de alineación con respuestas de exámenes oficiales junto con muestras originales de currículo, pedagogía, indagación científica, razonamiento y habilidades de examen. El comportamiento objetivo declarado por el autor es explícito: presentar primero la conclusión, ofrecer un razonamiento corto y comprobable, incluir unidades en los cálculos, no inventar cifras ni tablas ausentes en el enunciado y distinguir el núcleo del temario GSAT de las extensiones opcionales. No se documentan hiperparámetros como rango, alpha, tasa de aprendizaje, número de épocas ni composición porcentual del dataset, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en chino, con formato de respuesta orientado a la resolución de preguntas de ciencias naturales.
- Razonamiento científico de nivel preuniversitario (física, química, biología y ciencias de la Tierra dentro del temario GSAT).
- Resolución de problemas con cálculos, con la instrucción de acompañar las magnitudes de sus unidades.
- Alineación con respuestas de exámenes oficiales, útil para tareas de corrección o comparación de respuestas.
- Distinción explícita entre contenido troncal del GSAT y contenidos de ampliación opcionales.
- Restricción entrenada para no inventar tablas, figuras o datos numéricos que no aparezcan en el enunciado.
- Generación de explicaciones pedagógicas y de material de práctica a partir de muestras de currículo e indagación.
- Conversación multi-turno en formato chat (pipeline `text-generation` con plantilla conversacional del modelo base).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Tutor de ciencias naturales para el GSAT: el modelo puede mantener conversaciones multi-turno con un estudiante y resolver preguntas del temario oficial, presentando primero la conclusión y después un razonamiento corto verificable, que es exactamente el comportamiento para el que fue entrenado.
- Generación de baterías de práctica tipo examen: a partir del currículo y de las muestras de habilidad de examen del dataset, se pueden producir ítems de entrenamiento con estructura similar a la del GSAT, siempre que un docente revise la corrección final.
- Asistente de corrección y alineación de respuestas: dado que el corpus incluye ítems de alineación con respuestas oficiales, el modelo sirve como primer filtro para comparar la respuesta de un alumno con la respuesta esperada, dejando la validación definitiva al profesorado.
- Explicaciones paso a paso con unidades: en problemas de física y química donde el error suele estar en el manejo de magnitudes, el modelo está instruido para arrastrar unidades en cada paso del cálculo, lo que facilita la localización del fallo por parte del estudiante.
- Despliegue ligero en el aula o en dispositivos modestos: con 1,54 mil millones de parámetros, el modelo puede ejecutarse en una GPU de gama media o incluso en CPU con cuantización, lo que permite montar un asistente local sin depender de APIs externas.
- Asistente educativo embebido en navegador: el autor indica un repositorio hermano `-ONNX` para exportación WebGPU, lo que abre la puerta a un tutor que se ejecuta íntegramente en el cliente sin enviar datos del alumnado a un servidor.
- Base para ajustes de dominio posteriores: al ser un adaptador LoRA sobre un modelo apache-2.0 bien documentado, sirve como punto de partida reproducible para extender el temario (por ejemplo, matemáticas o ciencias sociales) con el mismo pipeline de Unsloth.
- Investigación sobre metodología QLoRA en dominios pequeños: el caso ilustra el resultado alcanzable con menos de 2.000 muestras curadas y una GPU de consumo, útil como referencia en estudios sobre ajuste eficiente de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de evaluación (MMLU, GSM8K, C-Eval u otras), ni comparaciones cuantitativas con el modelo base, ni resultados de validación sobre exámenes GSAT reales. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos en fp16/bf16: aproximadamente 3,1 GB, coherente con el tamaño del repositorio publicado.
- VRAM estimada para inferencia en fp16: del orden de 4 a 5 GB contando pesos, caché KV y activaciones para contextos moderados.
- VRAM estimada con cuantización de 4 bits (requiere conversión propia, no hay GGUF publicado): en torno a 1,5 a 2,5 GB.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 8/16 GB o una RTX 3070 de 8 GB son suficientes en fp16; en 4 bits bastan GPUs con 4 GB de VRAM.
- Ejecución en CPU: viable con llama.cpp u Ollama tras convertir los pesos a GGUF, con velocidades de decodificación reducidas.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servicio con batching continuo, llama.cpp y Ollama para entornos locales previa conversión a GGUF, y ONNX Runtime Web para el despliegue en navegador mencionado por el autor.
- Latencia y throughput estimados: no disponible, no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| jasort/gsat-natural-qwen2.5-1.5b | 1,54B | No especificado (heredado de Qwen2.5-1.5B-Instruct) | apache-2.0 | zh | Ajuste de dominio para el GSAT de Taiwan |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | apache-2.0 | Multilingue (aproximadamente 29 idiomas) | Modelo base generalista de instrucciones |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Multilingue | Alternativa generalista de tamano similar |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Terminos de uso de Gemma | Multilingue | Alternativa generalista algo mayor |

Los datos de parametros, contexto y licencia de los modelos comparados proceden de sus respectivas model cards publicas y no han sido verificados contra el presente ajuste fino. No es posible comparar rendimiento porque el autor de `gsat-natural-qwen2.5-1.5b` no publica ninguna métrica de evaluación, ni propia ni frente al modelo base.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para chino (`zh`) y su corpus de ajuste es material de examen de Taiwan. No cabe esperar un rendimiento fiable en castellano, inglés u otros idiomas, ni siquiera heredado del modelo base.
- Riesgo de alucinación: el propio autor advierte de que el modelo puede cometer errores y recomienda verificar las afirmaciones científicas críticas y las respuestas oficiales contra los materiales del CEEC. La instrucción de no inventar tablas o cifras es una preferencia aprendida, no una garantía.
- Sesgo de dominio: al haberse entrenado con 1.947 muestras muy especializadas, el modelo puede mostrar sobreajuste al formato GSAT y degradarse en preguntas científicas fuera de ese temario o formuladas de otra manera.
- Tamano: con 1,54 mil millones de parámetros, la capacidad de razonamiento matemático y científico complejo es intrínsecamente limitada frente a modelos de 7B o superiores.
- Herencia del modelo base: no se documenta ningún proceso de alineación adicional (RLHF, DPO) más allá del ajuste supervisado, por lo que los sesgos y modos de fallo de Qwen2.5-1.5B-Instruct se mantienen.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificar experimentalmente el comportamiento en ventanas largas antes de usarlo con documentos extensos.
- Formato de pesos: la etiqueta `base_model:adapter` sugiere un posible origen como adaptador LoRA, mientras que el recuento de parámetros y el tamaño del repositorio apuntan a pesos fusionados. Es recomendable inspeccionar los archivos antes de integrarlo en un pipeline.
- Sin benchmarks: no hay evidencia cuantitativa publicada de calidad, lo que impide estimar su rendimiento real frente al modelo base o a alternativas.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base Qwen2.5 y recordar que los materiales de examen del CEEC pueden estar sujetos a derechos de terceros.
- Metadatos: la fecha de creación indicada en el repositorio (14 de septiembre de 2026) es posterior a la fecha actual, lo que sugiere un error de los metadatos; el modelo tiene 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jasort/gsat-natural-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio hermano `-ONNX` mencionado en la model card: no se proporciona URL; el autor lo referencia como `jasort/gsat-natural-qwen2.5-1.5b-ONNX` para despliegue WebGPU.
- Unsloth (framework de entrenamiento empleado): no se incluye enlace en la model card.
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su dataset o a documentacion adicional; los resultados obtenidos no guardan relacion con el modelo.
