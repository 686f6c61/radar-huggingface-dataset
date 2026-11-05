# rajatsxngh/qwen3-base-tag-adapter

## Resumen

Qwen3-base-tag-adapter es un adaptador LoRA (entrenado con QLoRA) que se aplica sobre el modelo base Qwen/Qwen3-1.7B-Base para convertir una tarea de clasificación multietiqueta en una tarea de generación de texto: dado el título y el cuerpo de una pregunta de programación, el modelo escribe directamente una de diez etiquetas de Stack Exchange (`c#`, `java`, `php`, `javascript`, `android`, `jquery`, `c++`, `python`, `iphone`, `asp.net`). Lo desarrolla el usuario de HuggingFace rajatsxngh como parte del proyecto qwen3-generative-tagging, que incluye cuadernos de entrenamiento y evaluación.

El interés técnico del adaptador no está en el modelo base —un transformer decoder-only de 1.700 millones de parámetros con ventana de contexto de 32.768 tokens según la familia Qwen3— sino en el enfoque: en lugar de añadir una cabeza de clasificación, se enseña al modelo a generar la etiqueta como texto, lo que permite restringir la salida con decodificación estructurada (por ejemplo, en vLLM) y garantizar que la respuesta sea siempre una etiqueta válida. Con esa restricción, el adaptador alcanza un Macro-F1 de 0,950 y una exactitud de 0,954 sobre 6.275 preguntas reservadas, frente al 0,745 y 0,767 del modelo base sin adaptador.

Es relevante ahora porque demuestra que un ajuste fino ligero (139,5 millones de parámetros entrenables, unos 41 minutos en una única NVIDIA L4) puede llevar a un modelo pequeño de 1,7B a un rendimiento cercano al estado del arte en una tarea de clasificación acotada, con un coste de entrenamiento e inferencia muy bajo. La licencia Apache 2.0 y el formato PEFT facilitan su reutilización, aunque su alcance está deliberadamente limitado a diez etiquetas y a preguntas cortas de Stack Exchange.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-1.7B-Base |
| Parametros totales | 1.700 millones (modelo base) + 139,5 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen3); entrenado con preguntas de hasta ~900 tokens |
| Tipos de cuantizacion | Base en 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (se puede cargar sobre base en bfloat16 o cuantizada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B-Base |
| Rango LoRA | r=128, alpha=256, dropout 0,01 |
| Módulos adaptados | proyecciones de atención y MLP |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base Qwen3-1.7B-Base se carga cuantizado en 4 bits NF4 y se congelan sus pesos, mientras se entrenan matrices LoRA de rango 128 y alpha 256 (dropout 0,01) sobre todas las proyecciones de atención y MLP, lo que suma 139,5 millones de parámetros entrenables. El entrenamiento usa el `SFTTrainer` de Hugging Face TRL sobre pares prompt/compleción, con la pérdida calculada únicamente sobre la respuesta (`completion_only_loss=True`), de modo que el modelo aprende a emitir la etiqueta y no a reconstruir el prompt.

El conjunto de entrenamiento consta de 5.000 preguntas de Stack Exchange, con 2 épocas, tamaño de lote efectivo 32 y tasa de aprendizaje 1e-4; el mejor checkpoint se selecciona por pérdida de validación. El entrenamiento completo requiere aproximadamente 41 minutos en una única GPU NVIDIA L4. La innovación práctica es el formato de prompt fijo —`Classify the TEXT by selecting one label from the following list: [...]. ### TEXT: ... ### LABEL:`— que el modelo debe replicar exactamente, incluido el espacio tras `LABEL:`, y que permite combinar el adaptador con salidas estructuradas en vLLM para restringir la generación a las diez etiquetas válidas.

## Capacidades

- Clasificación generativa de preguntas de programación en diez etiquetas de Stack Exchange: `c#`, `java`, `php`, `javascript`, `android`, `jquery`, `c++`, `python`, `iphone`, `asp.net`.
- Generación de texto condicionada a un prompt fijo con formato estricto (etiqueta como respuesta).
- Salida restringible mediante decodificación estructurada (vLLM structured outputs) para garantizar etiquetas válidas.
- Funciona tanto en decodificación greedy como en lote con restricciones de vocabulario.
- Capacidad multilingüe: no disponible más allá del inglés (el modelo está entrenado y evaluado solo en inglés).
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es el objetivo del adaptador).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Etiquetado automático de preguntas en foros técnicos: el adaptador lee título y cuerpo de una pregunta y emite la etiqueta correspondiente, lo que permite clasificar y enrutar publicaciones en sitios tipo Stack Exchange con un Macro-F1 de 0,950 sobre el conjunto de prueba.
- Moderación y organización de contenido: al restringir la salida a diez etiquetas con vLLM, se puede integrar en un pipeline que asigne categorías de forma determinista y auditable, sin riesgo de etiquetas inventadas.
- Enrutamiento de tickets de soporte: en un helpdesk de desarrollo, el modelo puede mapear la descripción del problema a un lenguaje o plataforma (por ejemplo, `python`, `android`, `jquery`) para dirigir el ticket al equipo adecuado.
- Construcción de datasets etiquetados: el adaptador sirve para preetiquetar grandes volúmenes de preguntas y reducir el trabajo de anotación manual, con revisión humana posterior en los pares confundibles (`c#`/`asp.net`, `javascript`/`jquery`).
- Prototipado rápido de clasificadores de texto: al ser un adaptador PEFT de 0,6 GB sobre un modelo de 1,7B, se puede desplegar en una GPU modesta para experimentar con clasificación generativa frente a enfoques con cabeza de clasificación.
- Evaluación de técnicas de decodificación estructurada: el proyecto sirve como caso de estudio reproducible para comparar generación libre frente a salidas restringidas en tareas de clasificación con vocabulario cerrado.
- Filtrado y deduplicación temática: clasificar preguntas por etiqueta permite agrupar y filtrar corpus técnicos antes de usarlos en otros entrenamientos.

## Benchmarks y rendimiento

Evaluación sobre 6.275 preguntas reservadas de Stack Exchange, con la respuesta restringida a las diez etiquetas (vLLM structured outputs, decodificación greedy):

| Modelo / configuración | Macro-F1 | Accuracy |
|---|---|---|
| Adaptador (test) | 0,950 | 0,954 |
| Adaptador (validación, 6.276 preguntas) | 0,949 | 0,955 |
| Qwen3-1.7B-Base sin adaptador (validación) | 0,745 | 0,767 |

Sin restricción de salida, el modelo ajustado respondió con exactamente una etiqueta válida en 1.000 de 1.000 preguntas de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 para el modelo base de 1,7B, más una sobrecarga mínima por el adaptador LoRA; en cuantización de 4 bits, alrededor de 1,5-2 GB.
- GPU recomendadas: NVIDIA L4 (usada para el entrenamiento), así como A100, H100 o RTX 4090 para inferencia de alto rendimiento; cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar el modelo base en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también en GPUs con 6-8 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers + PEFT (como en el ejemplo de la model card), vLLM con salidas estructuradas para producción, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponible de forma explícita; el entrenamiento completo requirió unos 41 minutos en una NVIDIA L4, lo que da una idea del bajo coste computacional de la tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-base-tag-adapter | 1,7B + 139,5M (LoRA) | 32.768 tokens (base) | Clasificación generativa de 10 etiquetas | apache-2.0 | HuggingFace (PEFT) |
| Qwen3-1.7B-Base sin adaptador | 1,7B | 32.768 tokens | Modelo base de propósito general | apache-2.0 | HuggingFace |
| Clasificador con cabeza supervisada (BERT-base) | ~110M | 512 tokens | Clasificación discriminativa | según checkpoint | HuggingFace |
| Modelos de clasificación zero-shot generales (p. ej. LLM grandes) | >7B | variable | Clasificación por prompt | variable | HuggingFace |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada; la única comparación publicada es frente al modelo base sin adaptador (ver sección de benchmarks).

## Limitaciones y advertencias

- Entrenado exclusivamente para diez etiquetas de Stack Exchange; no generaliza a otras taxonomías sin reentrenamiento.
- Diseñado para preguntas cortas (título y cuerpo, hasta unos 900 tokens); el rendimiento puede degradarse en entradas más largas.
- Entrenamiento con una única ejecución, sin barrido de hiperparámetros ni validación cruzada, lo que limita la robustez de las conclusiones.
- Las confusiones más frecuentes son `c#` frente a `asp.net` y `javascript` frente a `jquery`.
- Solo inglés: no se ha evaluado ni entrenado para otros idiomas.
- Riesgo de alucinación mitigado solo si se usa decodificación restringida; sin restricción, el modelo podría emitir texto fuera del conjunto de etiquetas, aunque en la evaluación respondió con una etiqueta válida en 1.000 de 1.000 casos.
- El formato de prompt debe coincidir exactamente con el de entrenamiento, incluido el espacio tras `LABEL:`; desviaciones pueden degradar la salida.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B-Base tiene su propia licencia que debe respetarse.
- Sin datos publicados sobre sesgos específicos del adaptador; hereda los sesgos del corpus de Stack Exchange y del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/rajatsxngh/qwen3-base-tag-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Proyecto de entrenamiento y evaluación: https://github.com/rajatsxngh/qwen3-generative-tagging
