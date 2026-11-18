# shehrya670/lumina-qwen-tutor-3b

## Resumen

Lumina Qwen Tutor 3B es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario shehrya670 y publicado en Hugging Face. Se trata de un modelo de lenguaje de 3.000 millones de parámetros orientado a la generación de texto y a tareas de tutoría o asistencia conversacional, según sugiere el nombre "tutor". El modelo parte de la versión cuantizada en 4 bits de Unsloth del Qwen2.5-3B-Instruct y se ha entrenado con la librería Unsloth, que el autor indica que permite un entrenamiento 2x más rápido.

La relevancia de esta ficha es limitada desde el punto de vista técnico: el modelo no incluye información sobre el dataset de entrenamiento, hiperparámetros, número de tokens, metodología de alineación ni resultados de evaluación. La model card es la plantilla automática que genera Unsloth tras un fine-tuning, sin documentación adicional. Además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

Arquitectónicamente hereda las características de Qwen2.5-3B-Instruct (transformer decoder-only con atención de tipo causal, contexto de 32.768 tokens en la versión base), pero cualquier desviación introducida por el fine-tuning no está documentada. La licencia Apache 2.0 permite uso comercial, aunque la ausencia de evaluación hace recomendable tratar el modelo como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | El modelo base de partida está en bnb-4bit; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del Qwen2.5-3B-Instruct original. El entrenamiento se realizó con Unsloth y TRL, según los tags del repositorio (`unsloth`, `trl`, `qwen2`). No se especifica si se aplicó LoRA, QLoRA u otro método de ajuste eficiente, ni se detallan hiperparámetros, número de pasos, tamaño del dataset o composición de los datos de entrenamiento.

No hay información sobre si se aplicaron técnicas de alineación adicionales (RLHF, DPO), sobre la composición del corpus de instrucciones utilizado ni sobre innovaciones técnicas destacables. La única afirmación técnica de la model card es que el entrenamiento fue "2x más rápido" gracias a Unsloth, lo cual es una característica de la herramienta, no del modelo. No se documenta decodificación especulativa, atención lineal ni ninguna modificación arquitectónica respecto al modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones, presumiblemente reforzado por el fine-tuning orientado a tutoría (no verificado).
- Capacidad de seguir instrucciones multi-turno, según las características del modelo base.
- Soporte de tool calling / function calling: no documentado para este fine-tuning; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que se conserve tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base es multilingüe; no se confirma el mantenimiento de otros idiomas.
- Modo "thinking", visión o audio: no disponibles.
- Capacidades matemáticas y de código: no documentadas específicamente para este fine-tuning.

## Casos de uso

- Tutoría conversacional en inglés: el modelo se presenta como "tutor", por lo que su uso previsto es la asistencia educativa mediante diálogo multi-turno. Adecuado para prototipos de chatbots educativos, aunque sin evaluación publicada que respalde su calidad pedagógica.
- Asistente de estudio para preguntas y respuestas: puede emplearse para resolver dudas sobre materias concretas en inglés, aprovechando el ajuste sobre instrucciones. Requiere validación previa por el riesgo de alucinación.
- Generación de explicaciones paso a paso: útil en entornos de aprendizaje donde se necesita desglosar conceptos, aunque la calidad depende del dataset de fine-tuning, no documentado.
- Prototipado rápido en local: con 3.000 millones de parámetros y pesos en 4 bits, cabe en GPUs de consumo, lo que lo hace útil para experimentación y demos sin infraestructura dedicada.
- Base para nuevos fine-tunings: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajustes específicos de dominio educativo.
- Evaluación comparativa de técnicas de fine-tuning con Unsloth: útil como caso de estudio de pipelines QLoRA/Unsloth sobre Qwen2.5-3B, no tanto como modelo de producción.
- Integración en pipelines de generación de texto con TGI: los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse con Text Generation Inference, aunque sin benchmarks de latencia publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización 4 bits (el checkpoint de partida ya está en bnb-4bit); en FP16 serían necesarios unos 6-7 GB solo para pesos, más overhead de contexto y KV cache.
- GPU recomendadas: para 4 bits, una RTX 3060 de 12 GB o superior es suficiente; para FP16, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más en cuantización 4 bits; en 8 bits, a partir de 10-12 GB.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`), y presumiblemente llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repositorio). vLLM es compatible con arquitectura Qwen2, aunque no está confirmado para este checkpoint.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lumina Qwen Tutor 3B (este) | 3B | No documentado (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin evaluación publicada |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 3B Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Contexto mayor, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Hugging Face | Ligeramente mayor, benchmarks publicados |

La comparación directa es difícil porque el modelo evaluado carece de benchmarks propios. Frente al Qwen2.5-3B-Instruct original, este fine-tuning no documenta mejoras medibles; frente a Llama 3.2 3B y Phi-3.5-mini, la diferencia principal es la falta de validación pública y el contexto no confirmado.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparaciones que respalden la calidad del fine-tuning.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la procedencia de los datos, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinación: inherente a modelos de 3B sin alineación documentada; el fine-tuning podría haber degradado las salvaguardas del modelo base.
- Idiomas: la model card declara solo inglés; el uso en castellano no está soportado oficialmente y probablemente degrade la calidad.
- Contexto: no se confirma que el fine-tuning conserve los 32.768 tokens del modelo base; conviene validarlo empíricamente.
- Tool calling y agentes: no confirmados tras el ajuste; no asumir su disponibilidad en producción.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni discusión comunitaria; no hay evidencia de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento podría plantear riesgos legales si el corpus incluyera material con restricciones.
- Fecha de creación anómala (2026-11-18): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shehrya670/lumina-qwen-tutor-3b
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
