# Pukanski/sugerePrato-intent-qwen-1.5b-lora

## Resumen

`sugerePrato-intent-qwen-1.5b-lora` es un ajuste fino (LoRA) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario Pukanski y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`) y se ha entrenado con la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido". El nombre del repositorio sugiere que el ajuste está orientado a la clasificación de intenciones ("intent") en el dominio de "sugerePrato", aunque la model card no documenta el conjunto de datos ni la tarea concreta.

Se trata de un modelo de 1.500 millones de parámetros con arquitectura transformer decoder-only de la familia Qwen2, diseñado para generación de texto y conversación. Su relevancia es limitada fuera del nicho para el que fue entrenado: no tiene descargas ni interacciones en el momento de la consulta, y la documentación publicada es mínima (solo la plantilla automática de Unsloth). Es útil como ejemplo de flujo de ajuste fino con LoRA sobre Qwen2.5 y como posible base para tareas de clasificación de intenciones, pero no debe considerarse un modelo generalista listo para producción.

La información disponible no permite confirmar el tamaño del dataset de entrenamiento, los hiperparámetros del LoRA ni los resultados de evaluación. Todo lo que sigue se basa en la model card, los metadatos del repositorio y las características conocidas del modelo base Qwen2.5-1.5B-Instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA sobre el modelo base |
| Parámetros totales | 1.500 millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantización | no disponible en la model card; el modelo base se distribuye en bnb-4bit y existen versiones GGUF/AWQ del base en el ecosistema |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el repositorio pesa 0,1 GB, coherente con un adaptador y no con los pesos completos |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, una versión del Qwen2.5-1.5B-Instruct cuantizada en 4 bits con bitsandbytes y optimizada por Unsloth. La arquitectura subyacente es un transformer decoder-only de Qwen2 con 1.500 millones de parámetros, atención con RoPE y un tokenizador BPE multilingüe (aunque la model card declara únicamente inglés). El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio, pero no se especifican el número de pasos, el tamaño del dataset, la composición de los datos ni si hubo etapas de RLHF o DPO adicionales.

No se documenta ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el ajuste. El tamaño del repositorio (0,1 GB) indica que se publican únicamente los pesos del adaptador LoRA, no los pesos fusionados del modelo completo; para usarlo es necesario cargar el modelo base y aplicar el adaptador. No hay información sobre la estrategia de enmascaramiento de pérdida, el rango del LoRA ni los parámetros de entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Clasificación de intenciones (presumiblemente, según el nombre del repositorio), aunque no se documenta el esquema de etiquetas ni el formato de salida esperado.
- Razonamiento básico y respuesta a instrucciones en inglés.
- Capacidad limitada de generación de código y matemáticas, propia de un modelo de 1.5B.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct sí lo soporta, pero no hay confirmación de que el ajuste LoRA lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara solo inglés; el modelo base es multilingüe, pero el ajuste puede haber reducido esa capacidad.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Clasificación de intenciones en un asistente de dominio restringido: el modelo puede recibir un turno de usuario y devolver una etiqueta de intención, aprovechando el ajuste específico para "sugerePrato". Adecuado si el esquema de intenciones es cerrado y el vocabulario está en inglés.
- Enrutamiento de consultas en un chatbot: usar la salida del modelo para decidir a qué flujo o servicio derivar la conversación, con latencia baja gracias al tamaño de 1.5B.
- Extracción de intención en pipelines de atención al cliente: procesar mensajes entrantes y clasificarlos antes de pasarlos a un agente humano o a un sistema de respuestas automáticas.
- Prototipado rápido de ajustes finos con LoRA: servir como ejemplo reproducible de entrenamiento con Unsloth y TRL sobre Qwen2.5, útil para equipos que quieran replicar el flujo con sus propios datos.
- Filtrado y preetiquetado de datos: usar el modelo para anotar automáticamente grandes volúmenes de texto con intenciones candidatas, que luego se revisan manualmente.
- Experimentación académica sobre ajuste eficiente: comparar el comportamiento de un adaptador LoRA frente al modelo base en tareas de clasificación, con un coste de cómputo reducido.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, puede ejecutarse en GPU de consumo si se fusiona y cuantiza adecuadamente, aunque esto requiere trabajo adicional no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Como referencia, el modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM; en 4 bits, alrededor de 1-1,5 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no documentadas. Por tamaño, el modelo base cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090; también en A100/H100 sin problema.
- ¿Cabe en GPU de consumo? Sí, el modelo base de 1.5B cabe en la mayoría de GPU de consumo con al menos 4 GB de VRAM, siempre que se cargue en cuantización adecuada.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference (etiqueta presente en el repo), vLLM tras fusionar el adaptador, llama.cpp/Ollama tras convertir a GGUF. No hay instrucciones publicadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pukanski/sugerePrato-intent-qwen-1.5b-lora | 1.5B (LoRA) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste específico de intenciones, documentación mínima |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base generalista, multilingüe, con tool calling |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Generalista, licencia con restricciones comerciales |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | Hugging Face | Generalista, orientado a eficiencia |

La comparación directa es difícil porque el modelo de Pukanski es un adaptador especializado y no un modelo generalista. Frente al modelo base, la única diferencia documentada es el ajuste LoRA; no hay evidencia de mejora en benchmarks.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, la tarea, el esquema de etiquetas ni los hiperparámetros, lo que impide evaluar su calidad y reproducibilidad.
- Riesgo de alucinación: como todo modelo generativo de 1.5B, puede producir salidas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- Sesgos: no documentados; el modelo base Qwen2.5 puede heredar sesgos de sus datos de entrenamiento, y el ajuste LoRA puede amplificarlos si el dataset es pequeño o sesgado.
- Limitaciones de idioma: la model card declara solo inglés; el uso en castellano no está garantizado y probablemente sea deficiente.
- Limitaciones de contexto: no se especifica la ventana efectiva tras el ajuste; el modelo base soporta 32.768 tokens, pero el adaptador podría no preservar ese comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay conflicto conocido. Aun así, conviene verificar la licencia del modelo base de Unsloth.
- Caveat para producción: al ser un adaptador LoRA, requiere cargar el modelo base y aplicar el adaptador; no es un artefacto autónomo. No hay garantías de calidad ni evaluación publicada.
- Falta de tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pukanski/sugerePrato-intent-qwen-1.5b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Paper de Qwen2.5: no disponible en la información proporcionada
