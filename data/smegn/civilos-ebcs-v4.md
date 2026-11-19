# smegn/civilos-ebcs-v4

## Resumen

civilos-ebcs-v4 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario smegn y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la variante cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`) y se ha entrenado con la librería Unsloth, que acelera el proceso de entrenamiento aproximadamente 2 veces respecto a un pipeline convencional. La model card es mínima y no detalla el conjunto de datos, el objetivo del ajuste ni los hiperparámetros empleados.

Se trata, por tanto, de un derivado de Qwen2.5-7B-Instruct, un transformer decoder-only de 7.600 millones de parámetros con 32.768 tokens de contexto nativo, capacidades multilingües y soporte de tool calling. El ajuste declarado solo afecta al idioma inglés según las etiquetas del repositorio, aunque el modelo base es multilingüe. El repositorio ocupa 0,7 GB, un tamaño coherente con pesos en 4 bits.

La relevancia de este modelo es limitada: no tiene descargas ni «likes», no se han publicado benchmarks ni detalles del entrenamiento, y su utilidad práctica depende de que el ajuste aporte alguna mejora específica que la model card no documenta. Para la mayoría de casos de uso, el modelo base original de Qwen2.5-7B-Instruct es una opción más fiable y mejor documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor nativo de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | Pesos publicados derivados de una base en 4 bits (bnb-4bit); no se documentan otros formatos |
| Idiomas soportados | en (ingles, segun la model card); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-7B-Instruct, un transformer decoder-only con atención completa, 28 capas, 28 cabezas de atención y embeddings de 3.584 dimensiones (especificaciones del modelo base). El entrenamiento se realizó con Unsloth sobre la variante cuantizada en 4 bits del modelo base, lo que permite ajustar el modelo con requisitos de VRAM reducidos. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado.

La model card no documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones. El repositorio contiene únicamente los pesos ajustados y una model card generada automáticamente por la plantilla de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel de un modelo de 7B, sin mejoras documentadas por el ajuste.
- Generación de código y soporte de tool calling (capacidades del modelo base, no verificadas en este ajuste).
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo «thinking».
- No hay información sobre soporte de agentes o razonamiento multi-paso específico de este ajuste.

## Casos de uso

- Experimentación con fine-tuning: el modelo sirve como ejemplo de pipeline Unsloth sobre Qwen2.5-7B en 4 bits, útil para reproducir el flujo de entrenamiento.
- Generación de texto en inglés en prototipos: puede usarse como modelo de chat básico, aunque sin benchmarks que avalen su calidad frente al base.
- Investigación de ajustes ligeros: permite comparar el comportamiento del modelo ajustado frente a Qwen2.5-7B-Instruct original en tareas concretas.
- Despliegue en entornos con VRAM limitada: al derivar de una base en 4 bits, puede ejecutarse en GPUs de consumo medio si se convierte a GGUF.
- Pruebas de integración con TGI: el tag `text-generation-inference` sugiere compatibilidad con ese servidor, útil para validar pipelines de despliegue.
- Evaluación de sesgos y alucinaciones en modelos ajustados sin documentación: caso de estudio para auditar derivados publicados sin model card detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para los pesos en 4 bits; en FP16, unos 15-16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 para cuantización 4 bits; A100 o H100 para FP16 y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantización 4 bits; en FP16 requiere al menos 16 GB (RTX 4080/4090).
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), llama.cpp/Ollama si se convierte a GGUF; vLLM no está confirmado para esta variante cuantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| civilos-ebcs-v4 | 7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin documentar |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de 7B con tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- No hay información sobre el dataset de entrenamiento, por lo que se desconocen sesgos introducidos por el ajuste.
- Riesgo de alucinación inherente a los modelos de 7B, sin evaluaciones publicadas que lo cuantifiquen.
- La model card solo declara inglés; el rendimiento en otros idiomas no está verificado.
- El contexto de 32.768 tokens es una inferencia del modelo base, no una especificación confirmada en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero «likes»: no hay evidencia de uso en producción ni validación por la comunidad.
- Al derivar de una base cuantizada en 4 bits, la calidad puede ser inferior a la de un fine-tuning sobre pesos completos.
- No se documentan limitaciones específicas del ajuste ni casos de fallo conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smegn/civilos-ebcs-v4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
