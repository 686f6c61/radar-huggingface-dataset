# RantiRepo/gpt2-DPO-LoRA

## Resumen

El modelo `RantiRepo/gpt2-DPO-LoRA` es un ajuste fino del modelo GPT-2 original de OpenAI, realizado mediante Direct Preference Optimization (DPO) con la técnica de adaptación de bajo rango LoRA. El autor, RantiRepo, ha entrenado este modelo específicamente para el idioma indonesio, utilizando un subconjunto de 20.000 muestras del dataset `IndonesiaAI/dpo-dataset`. El objetivo es que el modelo prefiera respuestas consideradas "chosen" frente a las "rejected", alineando así el comportamiento del generador con preferencias humanas.

Con 124 millones de parámetros, se trata de un modelo pequeño y ligero, adecuado para entornos con recursos limitados o para tareas de generación de texto en indonesio donde no se requiere un razonamiento complejo. Su arquitectura es la del transformer decoder original de GPT-2, con una ventana de contexto de 1024 tokens. Aunque no se especifica la licencia, el modelo base GPT-2 es de código abierto, por lo que este ajuste probablemente hereda esa naturaleza, aunque conviene verificar antes de un uso comercial.

La relevancia de este modelo radica en su demostración práctica de cómo aplicar DPO con LoRA sobre un modelo base pequeño y multilingüe para adaptarlo a un idioma concreto, ofreciendo una alternativa eficiente en cómputo y memoria para tareas de preferencia de respuesta. Sin embargo, al ser un modelo antiguo y de tamaño reducido, sus capacidades son limitadas en comparación con los LLM modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (se puede cuantizar con herramientas externas, pero no hay versiones oficiales) |
| Idiomas soportados | Indonesio (id) |
| Licencia | No disponible (el modelo base GPT-2 es MIT, pero este ajuste no especifica licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 original, un transformer decoder con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. El ajuste fino se realizó mediante DPO (Direct Preference Optimization), que optimiza directamente la política del modelo para asignar mayor probabilidad a las respuestas elegidas frente a las rechazadas, sin necesidad de un modelo de recompensa separado. Se empleó LoRA con rango 16 y alpha 32, lo que reduce drásticamente el número de parámetros entrenables y el coste de cómputo.

El entrenamiento se llevó a cabo durante 2 épocas con una tasa de aprendizaje de 0.0001, un valor beta de 0.1 (parámetro de regularización de DPO) y una longitud máxima de secuencia de 1024 tokens. El dataset utilizado fue `IndonesiaAI/dpo-dataset`, del que se muestrearon 20.000 ejemplos en formato prompt, respuesta elegida y respuesta rechazada. No se menciona el uso de técnicas adicionales como RLHF, PPO o decodificación especulativa.

## Capacidades

- Generación de texto en indonesio: el modelo produce texto coherente en este idioma, optimizado para preferir respuestas de mayor calidad según el dataset de entrenamiento.
- Alineación con preferencias: gracias a DPO, tiende a generar respuestas que se asemejan a las marcadas como "chosen" en el entrenamiento.
- Tareas de completado de texto y chat simple: puede utilizarse para completar frases, responder preguntas sencillas o mantener conversaciones cortas en indonesio.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio. Tampoco se indica soporte para otros idiomas distintos del indonesio, aunque el modelo base GPT-2 fue entrenado principalmente en inglés, el ajuste fino con datos en indonesio probablemente degrade su rendimiento en otros idiomas.

## Casos de uso

- Asistente de escritura en indonesio: puede sugerir continuaciones de texto, corregir estilo o generar borradores de artículos, correos o publicaciones en redes sociales en este idioma.
- Chatbot de atención al cliente básico: dado su tamaño reducido, puede desplegarse en entornos con poca memoria para responder preguntas frecuentes en indonesio, aunque su limitada capacidad de razonamiento restringe la complejidad de las respuestas.
- Generación de contenido educativo: útil para crear ejercicios de práctica, preguntas de opción múltiple o explicaciones sencillas en indonesio, especialmente en contextos donde no se requiere alta precisión.
- Prototipado rápido de aplicaciones de lenguaje: al ser ligero y fácil de cargar con Transformers, sirve para validar ideas de productos que necesiten generación de texto en indonesio sin invertir en infraestructura costosa.
- Fine-tuning adicional: al ser un modelo abierto, puede servir como punto de partida para ajustes posteriores con más datos o para tareas específicas como resumen o traducción dentro del indonesio.
- Investigación en preferencia de modelos: su pequeño tamaño permite experimentar con DPO y LoRA en entornos académicos o de investigación sin requerir GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Dado que se trata de un GPT-2 de 124M ajustado con un dataset pequeño, su rendimiento en tareas generales será muy inferior al de modelos modernos, pero puede ser adecuado para tareas específicas en indonesio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en FP16 (124M parámetros × 2 bytes), más overhead de activaciones y atención. En cuantización INT8 podría reducirse a unos 125 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPUs modernas con suficiente RAM.
- Cabe en GPUs de consumo: sí, es perfectamente ejecutable en GPUs de gama baja y media, así como en CPUs.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TGI. Al ser un modelo pequeño, la latencia es baja; se pueden alcanzar cientos de tokens por segundo en GPUs modernas.
- No se dispone de datos oficiales de latencia o throughput, pero por su tamaño se espera un rendimiento en tiempo real incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados con otros modelos de la misma categoría. Existen otros repositorios con nombres similares, como `Ansh-Sarkar/gpt2-dpo-lora` o `allout2726/gpt2-dpo-LoRA_`, pero no se han encontrado especificaciones técnicas comparables. En general, cualquier modelo GPT-2 de 124M ajustado con DPO tendrá características similares en cuanto a tamaño y contexto, pero las diferencias radican en los datos de entrenamiento y los hiperparámetros. No se puede establecer una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: GPT-2 fue entrenado con datos de internet y puede reproducir sesgos de género, raza o ideológicos presentes en el corpus original. El ajuste fino con datos en indonesio no elimina estos sesgos.
- Riesgo de alucinación: como todos los modelos generativos, puede inventar hechos, nombres o información falsa, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 1024 tokens es corta para tareas que requieren contexto largo, como resúmenes de documentos extensos o conversaciones multi-turno prolongadas.
- Limitaciones de idioma: aunque el modelo base era multilingüe en cierta medida, el ajuste fino en indonesio probablemente degrade su rendimiento en otros idiomas. No se recomienda usarlo fuera del indonesio.
- Restricciones de licencia: la licencia no está especificada en la model card. Aunque el modelo base GPT-2 es MIT, el dataset y el proceso de entrenamiento pueden tener restricciones adicionales. Se debe contactar al autor o verificar los términos antes de un uso comercial.
- Limitaciones de producción: al ser un modelo pequeño, su calidad de respuesta es limitada. No es adecuado para tareas que requieran razonamiento complejo, matemáticas avanzadas o generación de código. Tampoco se han publicado evaluaciones de seguridad o robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RantiRepo/gpt2-DPO-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/IndonesiaAI/dpo-dataset (inferido de la model card, no verificado)
- Repositorio similar de referencia: https://github.com/chabdullah7/GPT2_DPO_FineTuning (no directamente relacionado, pero útil como ejemplo de implementación)
