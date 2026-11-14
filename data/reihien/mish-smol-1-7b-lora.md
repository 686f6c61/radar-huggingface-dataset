# reiHien/mish-smol-1.7b-lora

## Resumen

`reiHien/mish-smol-1.7b-lora` es un ajuste fino (fine-tuning) del modelo base `HuggingFaceTB/SmolLM2-1.7B-Instruct`, publicado por el usuario reiHien en Hugging Face. Se trata de un adaptador LoRA entrenado con la librería Unsloth sobre el modelo instructivo de 1.700 millones de parámetros de Hugging Face, orientado a generación de texto en inglés. El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con un adaptador LoRA y no con una copia completa de los pesos del modelo base.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2 y la licencia Apache 2.0 del modelo original. La model card es mínima: no documenta el conjunto de datos de entrenamiento, el número de pasos, la composición del dataset ni los hiperparámetros utilizados, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base.

Su relevancia es limitada en el momento de la publicación: cuenta con cero descargas y cero likes, y no incluye benchmarks ni evaluación publicada. Resulta útil principalmente como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre un modelo pequeño, o como punto de partida para experimentación, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B-Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base SmolLM2-1.7B-Instruct soporta 8.192 tokens, según la documentación de Hugging Face) |
| Tipos de cuantizacion | no disponible; al ser un adaptador LoRA en safetensors, la cuantización se aplica al modelo base (por ejemplo, 4-bit o 8-bit vía bitsandbytes), pero el autor no lo documenta |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se distribuye en safetensors y dispone de versiones GGUF en el repositorio oficial de Hugging Face |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del checkpoint `HuggingFaceTB/SmolLM2-1.7B-Instruct`, que a su vez es un transformer decoder-only de 1.700 millones de parámetros entrenado por Hugging Face. El entrenamiento del adaptador se realizó con Unsloth, según indica la propia model card, que menciona un entrenamiento "2x faster" respecto a un flujo estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, el rango del LoRA ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO sobre el adaptador.

La única innovación técnica documentada es el uso de Unsloth para acelerar el ajuste fino. No hay información sobre decodificación especulativa, atención lineal ni otras modificaciones arquitectónicas. Cualquier detalle sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, vocabulario) debe consultarse en la documentación del modelo base SmolLM2-1.7B-Instruct, no en este repositorio.

## Capacidades

- Generación de texto en inglés, heredada del modelo instructivo base.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,7B parámetros.
- Generación de código y matemáticas a nivel introductorio, según las capacidades del modelo base.
- Soporte de tool calling: no documentado en este adaptador; el modelo base SmolLM2 incluye soporte parcial de function calling, pero el autor no confirma que se haya preservado tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con ajuste fino: el adaptador sirve como ejemplo reproducible de un pipeline LoRA con Unsloth sobre SmolLM2, útil para desarrolladores que quieran replicar el flujo con sus propios datos.
- Prototipado rápido de asistentes conversacionales en inglés: al partir de un modelo instructivo de 1,7B, puede ejecutarse en hardware modesto para pruebas de concepto de chatbots de dominio acotado.
- Generación de texto en entornos con recursos limitados: su tamaño permite desplegarlo en GPU de consumo o incluso en CPU con cuantización del modelo base, adecuado para demos y entornos de desarrollo.
- Evaluación comparativa de adaptadores: útil como baseline en estudios sobre el impacto de LoRA en modelos pequeños, siempre que se documenten los datos de entrenamiento (actualmente ausentes).
- Filtrado y clasificación de texto simple en inglés: tareas de etiquetado o resumen de fragmentos cortos donde no se requiera alta precisión.
- Base para nuevos ajustes: al ser un adaptador LoRA ligero (0,1 GB), puede combinarse o continuar entrenándose con datasets específicos sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 3,4 GB; en cuantización 8-bit, unos 1,7 GB; en 4-bit, alrededor de 1 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4-bit basta con 4 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y GPUs integradas con suficiente memoria compartida en cuantización 4-bit.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference (etiqueta presente en el repositorio), llama.cpp y Ollama mediante conversión del modelo base fusionado con el adaptador a GGUF, y vLLM si se fusionan los pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reiHien/mish-smol-1.7b-lora | 1,7B (base) + LoRA | no disponible (base: 8.192) | Apache 2.0 | Hugging Face, 0 descargas | Adaptador sin documentación de entrenamiento ni benchmarks |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente descargado | Modelo base oficial, con model card completa y evaluaciones publicadas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Multilingüe, contexto mucho mayor, benchmarks publicados |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo pequeño popular, contexto corto, solo inglés |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, los hiperparámetros y la evaluación: imposible reproducir el ajuste o verificar su calidad.
- Riesgo elevado de alucinación, inherente a modelos de 1,7B parámetros y agravado por la falta de evaluación.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden identificar sesgos específicos introducidos por el ajuste.
- Limitación de idioma: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto limitado: aunque el modelo base soporta 8.192 tokens, el adaptador no documenta la longitud de secuencia usada en el entrenamiento, lo que puede degradar el rendimiento en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento del adaptador no introduzcan restricciones adicionales (no documentadas).
- Sin mantenimiento aparente: cero descargas y cero likes en el momento de la consulta; no hay garantía de soporte ni actualizaciones.
- No apto para producción sin una evaluación previa exhaustiva en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reiHien/mish-smol-1.7b-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Documentación de SmolLM2: https://huggingface.co/docs/transformers/model_doc/smollm2
