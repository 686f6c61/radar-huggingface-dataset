# Jkatdare/gemma-3-4b-it-finetome-30k

## Resumen

`Jkatdare/gemma-3-4b-it-finetome-30k` es un fine-tune supervisado del modelo multimodal `google/gemma-3-4b-it`, desarrollado por el usuario Jkatdare. Se ha entrenado mediante QLoRA sobre un subconjunto de 30.000 conversaciones de alta calidad extraídas del dataset `mlabonne/FineTome-100k`, una versión filtrada de `arcee-ai/The-Tome`. El objetivo es mejorar las capacidades conversacionales e instructivas del modelo base en inglés, manteniendo la misma arquitectura y el mismo pipeline de entrada imagen-texto a texto.

El modelo conserva los 4.300 millones de parámetros del Gemma 3 4B IT, aunque el proceso de entrenamiento solo ha modificado las proyecciones de atención y MLP del modelo de lenguaje, dejando intacta la torre de visión. Los pesos se han fusionado de vuelta a bf16 después del entrenamiento, por lo que se distribuye como un modelo completo, no como un adaptador LoRA. Al estar basado en Gemma 3, hereda las capacidades multimodales del original, como el procesamiento de imágenes, razonamiento, generación de código y soporte multilingüe, aunque el fine-tune se ha realizado exclusivamente con datos en inglés.

La relevancia de este modelo radica en su carácter de ejemplo práctico de fine-tune eficiente con QLoRA sobre un modelo de última generación, demostrando que es posible adaptar un modelo multimodal de 4B con una única GPU de gama alta (RTX 5090) y un conjunto de datos relativamente pequeño. Aunque no se han publicado benchmarks, su utilidad principal es la de servir como punto de partida para tareas de conversación e instrucción en inglés, especialmente en entornos donde se requiera una alternativa ligera a modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B IT), fine-tune con QLoRA sobre el modelo de lenguaje |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128k tokens, pero no se especifica en la informacion del fine-tune) |
| Tipos de cuantizacion | bf16 (pesos fusionados), entrenado con base 4-bit NF4 (QLoRA) |
| Idiomas soportados | Ingles (el fine-tune se realizo sobre datos en ingles; el modelo base soporta mas idiomas) |
| Licencia | Gemma Terms of Use (derivado de Gemma 3) |
| Formato de pesos | safetensors (repo de 8.6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer multimodal con arquitectura decoder-only que acepta tanto texto como imagenes como entrada. El fine-tune se ha realizado con QLoRA, con una base cuantizada en 4-bit NF4 y adaptadores LoRA de rango 16 y alpha 32, aplicados a todas las proyecciones de atencion y MLP del modelo de lenguaje. La torre de vision no se ha modificado. Despues del entrenamiento, los adaptadores se han fusionado de vuelta a los pesos completos en bf16, lo que elimina la sobrecarga de inferencia asociada a los adaptadores.

El entrenamiento se ha llevado a cabo con 30.000 conversaciones muestreadas con semilla 42 de FineTome-100k, un dataset curado a partir de The-Tome. Se ha utilizado una unica epoca, tamaño de lote efectivo 16, tasa de aprendizaje 2e-4 con decaimiento coseno y un 3% de calentamiento, y una longitud maxima de secuencia de 2048 tokens. La pila tecnologica empleada incluye transformers, TRL SFTTrainer, PEFT, bitsandbytes y Unsloth, ejecutada sobre una RTX 5090 en WSL2. No se ha aplicado RLHF ni DPO; el metodo es exclusivamente SFT.

## Capacidades

- Generacion de texto conversacional e instructivo en ingles, con formato de chat nativo de Gemma 3.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), aunque la torre de vision no ha sido fine-tuneada.
- Razonamiento basico y matematicas, heredado del modelo base.
- Generacion de codigo y comprension de lenguajes de programacion, gracias al entrenamiento original de Gemma 3.
- Soporte de tool calling y function calling, disponible en el modelo base (no verificado en este fine-tune).
- Capacidades multilingues limitadas al ingles por el fine-tune; el modelo base soporta mas idiomas, pero el ajuste puede degradar el rendimiento en otros lenguajes.
- No se ha confirmado un modo de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con un contexto de hasta 2048 tokens por entrenamiento, aunque el modelo base soporta ventanas mayores. Es adecuado para chatbots de soporte o tutoria.
- Generacion de codigo asistida: al heredar las capacidades de Gemma 3, puede completar funciones, explicar fragmentos y depurar errores. Puede integrarse en entornos de desarrollo mediante llamadas a la API de Transformers.
- Analisis de documentos con imagenes: al aceptar entradas de imagen y texto, puede describir diagramas, capturas de pantalla o graficos, aunque la parte visual no ha sido ajustada.
- Fine-tune de referencia para experimentos: al ser un modelo completo en bf16, sirve como base para pruebas de cuantizacion, evaluacion de alucinaciones o comparacion con otros fine-tunes de Gemma 3.
- Prototipado rapido de aplicaciones de IA generativa: su tamaño moderado (4.3B) permite desplegarlo en una GPU de consumo, facilitando el desarrollo de demos o MVPs.
- Evaluacion de tecnicas de SFT: al estar entrenado con un subconjunto pequeño, puede utilizarse para estudiar el impacto del volumen de datos en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluacion estandar. Tampoco se ofrecen comparativas con el modelo base ni con otros fine-tunes similares.

## Requisitos de hardware

- Peso del modelo en bf16: aproximadamente 8.6 GB (tamaño del repositorio). Para inferencia en bf16 se recomienda al menos 12 GB de VRAM para dejar margen para el contexto y las activaciones.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior, o GPUs de centro de datos como A100 40GB o H100. En una RTX 5090 (32 GB) se puede ejecutar con comodidad.
- Es posible cuantizar a 8 bits o 4 bits para reducir los requisitos de VRAM a aproximadamente 4-5 GB, permitiendo su uso en GPUs como RTX 3060 12GB o RTX 4060 Ti 16GB.
- Opciones de despliegue: compatible con `transformers` (pipeline `AutoModelForImageTextToText`), tambien se puede servir con vLLM, TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no se han publicado datos. En una RTX 4090, se espera una generacion de decenas de tokens por segundo en bf16, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-3-4b-it | 4.3B | 128k (no confirmado en este fine-tune) | Gemma Terms | Modelo base, multimodal, sin fine-tune especifico |
| Jkatdare/gemma-3-4b-it-finetome-30k | 4.3B | No disponible | Gemma Terms | Fine-tune SFT en ingles sobre FineTome-30k |
| meta-llama/Llama-3.2-3B | 3.2B | 128k | Llama 3.2 Community | Modelo de texto, sin vision, con licencia permisiva |

No se dispone de datos de rendimiento comparativo. La comparacion se limita a parametros, contexto declarado y licencia. No hay informacion sobre benchmarks de ninguno de estos modelos en la documentacion proporcionada.

## Limitaciones y advertencias

- El fine-tune se ha realizado exclusivamente con datos en ingles, por lo que el rendimiento en otros idiomas puede ser inferior al del modelo base, que soporta multiples lenguas.
- No se han publicado evaluaciones de sesgos ni de alucinaciones. Al ser un modelo generativo, existe riesgo de producir informacion falsa o inventada, especialmente en temas especializados.
- La longitud maxima de secuencia utilizada durante el entrenamiento fue de 2048 tokens, lo que puede limitar la coherencia en dialogos muy largos, aunque el modelo base soporta ventanas mayores.
- La licencia Gemma Terms of Use restringe ciertos usos, como aplicaciones militares o de vigilancia, y exige cumplir las politicas de uso aceptable de Google.
- No se ha verificado si el fine-tune mantiene intactas las capacidades de tool calling o de procesamiento de imagenes del modelo base; se recomienda probar antes de usarlo en produccion.
- El modelo no ha sido sometido a un proceso de alineacion con RLHF; solo se ha aplicado SFT, por lo que puede presentar comportamientos menos robustos ante instrucciones adversariales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jkatdare/gemma-3-4b-it-finetome-30k
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Dataset fuente: https://huggingface.co/datasets/arcee-ai/The-Tome
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
