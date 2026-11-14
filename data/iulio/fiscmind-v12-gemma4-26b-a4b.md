# iulio/FiscMind-v12-Gemma4-26B-A4B

## Resumen

FiscMind-v12-Gemma4-26B-A4B es un ajuste fino (finetune) publicado por el usuario iulio sobre el modelo base `unsloth/gemma-4-26B-A4B-it`. Se trata, por tanto, de una variante especializada de la familia Gemma 4 de Google en su configuración de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token, tal como indica el sufijo A4B. El autor no documenta en la model card el propósito específico del ajuste más allá del nombre "FiscMind", que sugiere un enfoque hacia dominios fiscales o financieros.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: el repositorio no incluye información sobre el dataset de ajuste, hiperparámetros, número de tokens de entrenamiento ni resultados de evaluación. La model card es la plantilla automática generada por Unsloth, lo que indica que el ajuste se realizó con dicha herramienta para acelerar el entrenamiento. El repositorio ocupa 2,0 GB, un tamaño llamativamente reducido para un modelo de 26B parámetros en safetensors, lo que sugiere que podría contener únicamente adaptadores LoRA o pesos parciales en lugar del modelo completo.

El modelo se distribuye bajo licencia Apache 2.0, declara únicamente inglés como idioma soportado y está etiquetado para uso con transformers y text-generation-inference. No cuenta con descargas ni interacciones en el momento de la consulta, lo que refleja que es un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 |
| Parámetros totales | 26B (según nomenclatura del modelo base) |
| Parámetros activos | ~4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; el modelo base admite cuantizaciones estándar vía Unsloth/llama.cpp, pero no se documenta en esta ficha) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en configuración MoE, con 26B parámetros totales y ~4B activos por token, lo que permite un coste de inferencia comparable a un modelo denso de 4B manteniendo la capacidad representacional de uno de 26B. El ajuste fino se realizó con Unsloth, según declara el autor, lo que habitualmente implica entrenamiento con LoRA o QLoRA y optimizaciones de memoria y velocidad (kernel fusionado, gradient checkpointing selectivo). No se especifica si el ajuste fue supervisado (SFT), con preferencias (DPO/RLHF) o ambos.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, la presencia de datos sintéticos ni las técnicas de alineación aplicadas. Tampoco se documentan innovaciones técnicas propias del ajuste. El tamaño del repositorio (2,0 GB) es inconsistente con un modelo completo de 26B en safetensors (que en fp16 rondaría los 52 GB), por lo que es probable que el repositorio contenga solo los adaptadores o un subconjunto de pesos; esta circunstancia no está aclarada en la model card.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4.
- Razonamiento y respuesta a instrucciones (el sufijo `-it` del modelo base indica ajuste a instrucciones).
- Procesamiento de contexto conversacional multi-turno, en la medida en que lo permita la ventana de contexto del modelo base (no documentada aquí).
- Posible especialización en dominio fiscal/financiero por el nombre "FiscMind", aunque no se aporta evidencia ni descripción del alcance.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Consultas fiscales en inglés: dado el nombre del modelo, podría emplearse para responder preguntas sobre normativa fiscal o financiera, aunque la ausencia de evaluación impide garantizar su precisión en este dominio.
- Prototipado de asistentes conversacionales: al estar basado en un modelo instructivo, puede servir para experimentar con diálogos multi-turno en inglés antes de invertir en modelos mayores.
- Investigación sobre ajuste fino eficiente: útil como ejemplo de pipeline Unsloth aplicado a un MoE de 26B, para estudiar el impacto de LoRA en modelos de mezcla de expertos.
- Generación de borradores de documentación financiera: con revisión humana obligatoria, podría redactar borradores de informes o resúmenes en inglés.
- Evaluación comparativa de finetunes comunitarios: sirve como caso de estudio sobre la reproducibilidad y documentación de ajustes publicados sin métricas.
- Despliegue experimental con TGI: las etiquetas del repositorio indican compatibilidad con text-generation-inference, lo que permite probarlo en infraestructura estándar de serving.
- Base para nuevos ajustes: al derivar de un modelo Apache 2.0, puede reutilizarse como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este finetune concreto. Como referencia del modelo base de 26B en MoE con ~4B activos, en fp16 requeriría del orden de 52 GB de VRAM para cargar todos los pesos; en cuantización de 4 bits, alrededor de 13-15 GB, aunque estas cifras no están confirmadas para este repositorio.
- GPU recomendadas: no disponible en la información proporcionada. Para el modelo base, serían necesarias GPUs con 80 GB (A100, H100) en precisión completa, o GPUs consumer de 24 GB (RTX 4090) con cuantización agresiva.
- Compatibilidad con GPU consumer: no confirmada para este finetune; el tamaño del repositorio (2,0 GB) sugiere que podría no contener los pesos completos.
- Opciones de despliegue: text-generation-inference (según etiquetas), transformers, y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF a partir del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FiscMind-v12-Gemma4-26B-A4B | 26B totales / ~4B activos | no disponible | Apache 2.0 | Hugging Face, sin descargas |
| unsloth/gemma-4-26B-A4B-it (base) | 26B totales / ~4B activos | no disponible | Apache 2.0 | Hugging Face |
| Gemma 4 (variantes densas de Google) | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos introducidos por el ajuste.
- Riesgo elevado de alucinación en dominio fiscal si el ajuste no se validó con datos verificados; no hay evidencia de lo contrario.
- Idiomas: solo se declara inglés, por lo que no se recomienda su uso en castellano u otros idiomas sin evaluación previa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener términos adicionales de Google que conviene revisar.
- El tamaño del repositorio (2,0 GB) es inconsistente con un modelo de 26B completo; verificar si contiene adaptadores LoRA o pesos parciales antes de intentar cargarlo.
- Sin descargas ni validación comunitaria: no hay señales de que el modelo haya sido probado por terceros.
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iulio/FiscMind-v12-Gemma4-26B-A4B
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
