# mondolreal/gemma-3-4b-it-aclede-qa-lora

## Resumen

`mondolreal/gemma-3-4b-it-aclede-qa-lora` es un ajuste fino (fine-tuning) del modelo Gemma 3 4B en su variante instruct (`gemma-3-4b-it`), publicado por el usuario mondolreal. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-3-4b-it-unsloth-bnb-4bit`), pensada para entrenamiento eficiente en VRAM reducida, y se ha entrenado con la librería Unsloth y TRL. El nombre sugiere un ajuste orientado a tareas de question answering (QA) sobre el corpus ACLED, aunque la model card no aporta detalles sobre el dataset ni el procedimiento de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 4B (desarrollada por Google DeepMind), con aproximadamente 4 mil millones de parámetros y una ventana de contexto de 128K tokens en la familia Gemma 3. Este ajuste concreto se publica bajo licencia Apache 2.0, lo que difiere de la licencia original de Gemma 3 (Gemma Terms of Use) y conviene verificar la compatibilidad legal de esa elección.

Su relevancia es limitada y de nicho: se trata de un experimento de fine-tuning con 0 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados ni documentación técnica del proceso. Es útil como ejemplo de pipeline Unsloth + TRL sobre Gemma 3, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), ajuste fino con LoRA sobre base cuantizada en 4 bits |
| Parametros totales | ~4 mil millones (heredados de Gemma 3 4B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Gemma 3 4B soporta hasta 128K tokens) |
| Tipos de cuantizacion | Base de entrenamiento en 4 bits (bnb-4bit); no se especifican otras cuantizaciones publicadas |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.2 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B Instruct, un transformer decoder-only de Google DeepMind con atención multi-cabeza estándar y soporte de contexto largo. El ajuste se realizó sobre la variante de Unsloth cuantizada en 4 bits (`gemma-3-4b-it-unsloth-bnb-4bit`), lo que permite entrenar con requisitos de VRAM notablemente menores que el modelo en precisión completa. El autor indica que el entrenamiento fue "2x faster with Unsloth", usando las librerías Unsloth y TRL.

No se documenta en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni hiperparámetros del LoRA (rango, alpha, módulos objetivo). El nombre del repositorio sugiere un dataset de QA sobre ACLED (Armed Conflict Location & Event Data), pero esta información no está confirmada en la documentación. El tamaño del repo (0.2 GB) es coherente con un adaptador LoRA o un merge parcial, no con un modelo completo en fp16 (~8 GB).

## Capacidades

- Generación de texto y respuesta a preguntas (QA), presumiblemente especializada en el dominio del dataset de ajuste.
- Herencia de las capacidades instruct de Gemma 3 4B: razonamiento básico, código y matemáticas a nivel de modelo pequeño.
- Soporte multilingüe limitado: la model card declara únicamente inglés (`en`), aunque el modelo base soporta más idiomas.
- No se documenta soporte de tool calling, function calling ni modo agente en este ajuste concreto.
- No se documenta capacidad de visión en este ajuste (Gemma 3 4B base sí es multimodal, pero no se confirma que el fine-tuning lo preserve).
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Extracción de información estructurada de textos de conflictos: dado el nombre del modelo (ACLED), podría usarse para convertir narrativas de eventos en registros tabulares (fecha, actor, tipo de evento, ubicación), aunque sin validación publicada.
- Prototipado rápido de QA sobre dominios específicos: sirve como ejemplo de pipeline Unsloth + TRL para adaptar Gemma 3 4B a un corpus propio con recursos limitados de GPU.
- Clasificación y etiquetado de textos: el ajuste puede emplearse para tareas de clasificación temática sobre documentos en inglés.
- Asistente de consulta documental en inglés: con contexto de hasta 128K tokens (heredado del base, no confirmado en el ajuste), podría resumir o responder sobre documentos largos.
- Base para nuevos fine-tunings: al ser un adaptador pequeño (0.2 GB), es un punto de partida para experimentos de investigación sobre QA especializado.
- Evaluación comparativa de técnicas de ajuste: útil en entornos académicos para medir el efecto de LoRA en 4 bits sobre Gemma 3 4B frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8-9 GB en fp16 para el modelo 4B completo; ~3-4 GB en cuantización 4 bits (GGUF/AWQ/GPTQ), aunque no se publican cuantizaciones de este ajuste.
- GPU recomendadas: RTX 4090, RTX 3090, A10G, L4 para fp16; A100/H100 solo necesarias para contexto muy largo o batch grande.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más en 4 bits; 12-16 GB para fp16 con contexto moderado.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requerirían convertir los pesos a GGUF (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mondolreal/gemma-3-4b-it-aclede-qa-lora | ~4B | no disponible (base: 128K) | apache-2.0 | HF, 0 descargas | Fine-tuning de nicho, sin benchmarks |
| google/gemma-3-4b-it | ~4B | 128K | Gemma Terms of Use | HF, ampliamente usado | Modelo base oficial, multimodal, benchmarks publicados |
| Qwen2.5-3B-Instruct | ~3B | 32K | Apache 2.0 | HF, muy usado | Alternativa open source con licencia permisiva |
| Llama-3.2-3B-Instruct | ~3B | 128K | Llama 3.2 Community License | HF, muy usado | Buena base para fine-tuning, licencia con restricciones |

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la calidad de los datos, lo que impide evaluar sesgos y sobreajuste.
- Riesgo de alucinación: al ser un modelo de 4B ajustado sobre un dominio concreto, puede inventar datos o extrapolar incorrectamente fuera de su distribución.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está garantizado.
- Licencia: aunque el repo declara apache-2.0, el modelo base Gemma 3 está sujeto a los Gemma Terms of Use; conviene verificar la compatibilidad legal antes de uso comercial.
- Contexto: no se confirma que el ajuste preserve la ventana de 128K del base; el entrenamiento LoRA puede degradar el manejo de contextos largos.
- Repo con 0 descargas y 0 likes: sin validación por parte de la comunidad, sin issues ni discusiones.
- Model card mínima: no hay información sobre hiperparámetros, versión de Unsloth/TRL ni procedimiento de reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/mondolreal/gemma-3-4b-it-aclede-qa-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Gemma 3 (Google DeepMind): https://huggingface.co/google/gemma-3-4b-it
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- ACLED (contexto del nombre, no confirmado): https://acleddata.com
