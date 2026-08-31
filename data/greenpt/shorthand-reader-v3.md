# GreenPT/shorthand-reader-v3

## Resumen

GreenPT/shorthand-reader-v3 es un adaptador LoRA de 0,5 GB desarrollado por GreenPT, una iniciativa centrada en inteligencia artificial sostenible y eficiente energéticamente. El modelo se presenta como un adaptador sobre el modelo base Qwen/Qwen3.5-9B, entrenado mediante fine-tuning supervisado (SFT) con la librería TRL de HuggingFace. Su nombre sugiere una especialización en la lectura e interpretación de taquigrafía, aunque la model card no proporciona detalles sobre el conjunto de datos ni el dominio exacto de aplicación.

La relevancia de este modelo radica en su enfoque de eficiencia: al ser un adaptador LoRA, no requiere reentrenar el modelo completo, lo que reduce significativamente el coste computacional y la huella de carbono, en línea con la misión declarada de GreenPT de hacer la IA más eficiente energéticamente. El tag `arxiv:1910.09700` enlaza con el trabajo de Lacoste et al. sobre estimación de emisiones de carbono, lo que refuerza este enfoque. Sin embargo, la documentación pública es extremadamente limitada: la model card está prácticamente vacía, sin especificaciones técnicas, datos de entrenamiento, benchmarks o licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-9B (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador pesa 0,5 GB; el base Qwen3.5-9B tiene 9B parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base Qwen/Qwen3.5-9B. La técnica LoRA congela los pesos del modelo original e introduce matrices de bajo rango en las capas de atención, lo que permite fine-tuning con una fracción mínima de parámetros entrenables. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de HuggingFace, con PEFT 0.20.0 como framework de adaptación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El tag `arxiv:1910.09700` sugiere que el autor consideró el impacto ambiental del entrenamiento, pero no se publican métricas de emisiones.

## Capacidades

- Generación de texto: al ser un adaptador sobre Qwen3.5-9B, hereda las capacidades generativas del modelo base, aunque no se especifica si el fine-tuning las modifica.
- Lectura de taquigrafía: el nombre del modelo indica una especialización en interpretar taquigrafía o abreviaturas, pero no hay documentación que detalle el formato de entrada ni el rendimiento.
- Conversación: el tag `conversational` sugiere que el adaptador está orientado a diálogo, aunque no se aportan ejemplos ni métricas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Transcripción de notas taquigráficas: el modelo podría convertir taquigrafía (manuscrita o digital) en texto plano, aunque no hay evidencia pública de su eficacia en este dominio.
- Asistente conversacional especializado: dado el tag `conversational`, podría integrarse en chatbots que requieran comprensión de jerga o abreviaturas propias de un sector concreto.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA, puede servir como punto de partida para tareas de nicho sin reentrenar el modelo completo.
- Investigación en eficiencia energética: su tamaño reducido (0,5 GB) lo hace adecuado para experimentos en entornos con recursos limitados o para estudiar el impacto de adaptadores ligeros.
- Prototipado rápido: al ser un adaptador sobre un modelo de 9B, permite probar capacidades específicas sin desplegar el modelo base completo en producción.
- Archivado y digitalización de documentos históricos: si la taquigrafía se refiere a sistemas de escritura abreviada (como Pitman o Gregg), podría usarse para digitalizar archivos, aunque no hay validación pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se proporcionan comparativas con otros adaptadores o modelos base.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base Qwen3.5-9B y de la cuantización elegida. Un modelo de 9B en FP16 requiere aproximadamente 18 GB de VRAM; con cuantización de 4 bits puede reducirse a unos 6-8 GB.
- GPU recomendadas: no especificadas por el autor. Para el adaptador solo, cualquier GPU con 2 GB es suficiente; para el modelo base completo, se recomienda al menos una RTX 3090/4090 (24 GB) o una A10G/A100 en entornos cloud.
- Compatibilidad con GPU de consumo: el adaptador en sí cabe en cualquier GPU; el modelo base Qwen3.5-9B puede ejecutarse en GPUs de consumo con cuantización (por ejemplo, RTX 3060 12 GB con GGUF de 4 bits).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft. Para el modelo base, son compatibles vLLM, llama.cpp, Ollama y TGI, siempre que se fusionen los pesos del adaptador o se cargue como LoRA en runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un adaptador LoRA sin benchmarks publicados, por lo que no es posible compararlo con alternativas como otros adaptadores de taquigrafía o modelos fine-tuned sobre Qwen. Se puede señalar que, al estar basado en Qwen3.5-9B, su rendimiento general estará acotado por el del modelo base, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no especifica el dominio de aplicación, el dataset de entrenamiento ni los criterios de evaluación, lo que impide validar su uso en producción.
- Sesgos desconocidos: al no publicarse datos de entrenamiento, no es posible evaluar sesgos potenciales heredados del modelo base o introducidos por el fine-tuning.
- Riesgo de alucinación: no se han realizado evaluaciones de fiabilidad; el modelo podría generar texto plausible pero incorrecto, especialmente en dominios especializados como la taquigrafía.
- Licencia no declarada: el uso comercial, la redistribución o la modificación del adaptador no están claramente permitidos, lo que supone un riesgo legal.
- Dependencia del modelo base: el adaptador requiere Qwen/Qwen3.5-9B, cuya licencia y disponibilidad deben verificarse por separado.
- Sin garantía de rendimiento: no hay evidencia pública de que el modelo funcione correctamente para la tarea que su nombre sugiere (lectura de taquigrafía).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GreenPT/shorthand-reader-v3
- Modelo anterior (shorthand-reader): https://huggingface.co/GreenPT/shorthand-reader
- Catálogo de modelos GreenPT: https://greenpt.com/models
- Sitio web de GreenPT: https://greenpt.com/
- GitHub de GreenPT: https://github.com/Green-PT/
- Perfil de GreenPT en HuggingFace: https://huggingface.co/GreenPT/models
