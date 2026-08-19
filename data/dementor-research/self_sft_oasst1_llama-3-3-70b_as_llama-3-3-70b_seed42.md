# dementor-research/self_sft_oasst1_llama-3.3-70b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `meta-llama/Llama-3.3-70B-Instruct`, utilizando el dataset de instrucciones conversacionales OASST1 (Open Assistant). El nombre del repositorio, `self_sft_oasst1_llama-3.3-70b_as_llama-3.3-70b_seed42`, sugiere un experimento de auto-formación (self-SFT) donde el propio modelo base genera o filtra datos, aunque no se proporciona documentación al respecto.

El adaptador tiene un tamaño de 1,7 GB y está publicado en formato PEFT (safetensors), lo que permite aplicarlo sobre el modelo base de 70B sin necesidad de reentrenar todos los parámetros. Su relevancia radica en que ofrece una vía ligera para adaptar un modelo de gran tamaño a tareas conversacionales, aunque la falta de información sobre el proceso de entrenamiento y evaluación limita su uso en producción sin verificación previa.

Es importante señalar que la model card es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]", y que el repositorio no registra descargas ni valoraciones. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en las características conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Llama-3.3-70B-Instruct) |
| Parametros totales | no disponible (adaptador de 1,7 GB; modelo base: 70B) |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | 128k tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador es en safetensors; el base puede cuantizarse) |
| Idiomas soportados | no disponible (el modelo base soporta multilingue, pero el adaptador no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre `meta-llama/Llama-3.3-70B-Instruct`, un transformer decoder-only con atención causal y 70 mil millones de parámetros. La técnica LoRA congela los pesos originales e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. El adaptador se entrenó mediante SFT (supervised fine-tuning) usando el framework TRL y la librería PEFT, según los tags del repositorio.

El dataset de entrenamiento es OASST1, un corpus multilingüe de conversaciones e instrucciones humanas creado para el proyecto Open Assistant. No se especifican hiperparámetros (rank, alpha, learning rate, épocas, etc.) ni el número de tokens de entrenamiento. El nombre "self_sft" podría indicar un proceso de auto-generación de datos, pero no hay evidencia documental al respecto. Tampoco se menciona el uso de RLHF o DPO posterior al SFT.

## Capacidades

- Generación de texto conversacional: al estar fine-tuneado sobre OASST1, el adaptador busca mejorar la calidad de las respuestas en diálogos multi-turno, aunque no hay métricas que lo confirmen.
- Hereda las capacidades del modelo base Llama-3.3-70B-Instruct: razonamiento, comprensión lectora, generación de código, matemáticas y soporte multilingüe (siempre que el adaptador no las degrade).
- No se documenta soporte explícito para tool calling, function calling, agentes o modo de pensamiento (thinking mode). Estas capacidades, si existen, provienen del modelo base.
- El adaptador es un componente PEFT, por lo que puede combinarse con otros adaptadores o cargarse de forma dinámica sobre el base.

## Casos de uso

- Asistente conversacional en entornos controlados: el adaptador puede integrarse en un chatbot para experimentar con el fine-tuning sobre OASST1, siempre que se valide su comportamiento frente al base.
- Fine-tuning incremental: al ser un adaptador LoRA, sirve como punto de partida para añadir capas de entrenamiento adicionales sin tocar los pesos completos del modelo de 70B.
- Investigación académica: útil para estudiar el efecto del SFT sobre OASST1 en un modelo de gran tamaño, comparando con otros adaptadores similares.
- Prototipado rápido: con 1,7 GB, el adaptador es fácil de descargar y aplicar sobre el base, permitiendo pruebas locales sin reentrenar el modelo completo.
- Evaluación de sesgos: al estar entrenado con datos de voluntarios de Open Assistant, puede analizarse cómo afecta el dataset al comportamiento del modelo en temas sensibles.
- Benchmarking de eficiencia: permite medir el coste de inferencia de un modelo de 70B con adaptador frente a otras estrategias de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se proporcionan comparativas con el modelo base u otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí requiere muy poca VRAM (menos de 2 GB), pero debe cargarse junto al modelo base de 70B, que domina los requisitos.
- Para inferencia del modelo completo en FP16 se necesitan aproximadamente 140 GB de VRAM, lo que exige GPUs de datacenter como A100 80GB (múltiples), H100 o similar.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM necesaria baja a unos 35-40 GB, permitiendo su uso en una RTX 4090 (24 GB) con offloading o en una A6000 (48 GB) o A100 40GB.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF) u Ollama, siempre que se fusionen los pesos del adaptador con el base o se cargue mediante el soporte PEFT de transformers.
- La latencia y el throughput dependen del hardware y de la cuantización; para un modelo de 70B, en una A100 80GB se puede esperar un throughput de decenas de tokens por segundo, pero no hay cifras oficiales para este adaptador concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador no tiene métricas publicadas y su configuración exacta (rank, alpha, dataset filtrado) es desconocida. Como referencia, se puede comparar con otros adaptadores LoRA sobre Llama-3.3-70B-Instruct disponibles en Hugging Face, pero no hay datos objetivos para esta instancia específica. El modelo base sin adaptador sigue siendo la alternativa más fiable en términos de rendimiento conocido.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre el proceso de entrenamiento, los hiperparámetros, la composición exacta del dataset ni la evaluación realizada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- El adaptador puede estar sobreajustado a OASST1, lo que podría reducir su generalización a otros dominios o estilos de conversación.
- Al estar entrenado sobre datos de voluntarios, puede heredar sesgos presentes en el dataset (opiniones, lenguaje ofensivo, etc.).
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay garantía de que el adaptador funcione correctamente con la versión exacta del modelo base; se recomienda verificar la compatibilidad de versiones.
- El nombre "self_sft" sugiere un posible uso de datos generados por el propio modelo, lo que podría amplificar errores o alucinaciones si no se filtró adecuadamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_oasst1_llama-3.3-70b_as_llama-3.3-70b_seed42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Dataset OASST1 (referencia): https://huggingface.co/datasets/OpenAssistant/oasst1
- Paper sobre LoRA (referencia): https://arxiv.org/abs/2106.09685
