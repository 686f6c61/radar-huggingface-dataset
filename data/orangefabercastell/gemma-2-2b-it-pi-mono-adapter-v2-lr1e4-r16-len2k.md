# orangefabercastell/gemma-2-2b-it-pi-mono-adapter-v2-lr1e4-r16-len2k

## Resumen

Este modelo es un adaptador LoRA de bajo rango (rank 16) sobre el modelo Gemma 2 2B IT de Google, desarrollado por el usuario orangefabercastell. El nombre del repositorio sugiere que se ha afinado con trazas de ejecución de agentes de codificación autónomos del proyecto pi-mono, con una longitud de contexto de 2048 tokens y una tasa de aprendizaje de 1e-4. La model card no proporciona información detallada, pero el tamaño del repositorio (0.1 GB) indica que solo se distribuyen los pesos del adaptador, no los del modelo base.

Este tipo de adaptación es relevante para el desarrollo de agentes de codificación de bajo coste, ya que permite especializar un modelo de 2B parámetros sin necesidad de entrenar los pesos completos. La técnica de adaptación de bajo rango (LoRA) reduce drásticamente los requisitos de hardware y tiempo de entrenamiento, haciendo viable la personalización de modelos grandes en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptadores LoRA (base: Gemma 2 2B IT) |
| Parametros totales | no disponible (el adaptador pesa ~0.1 GB; la base tiene 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre sugiere 2048, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (Gemma 2 soporta principalmente inglés, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rank 16 sobre el modelo Gemma 2 2B IT. Según la información recuperada de un modelo relacionado del mismo autor (`gemma-2-2b-it-pi-mono-sft`), el entrenamiento se realizó con QLoRA de 4 bits y loss masking de solo completions, sobre trazas de ejecución de agentes de codificación autónomos del repositorio `badlogicgames/pi-mono`. Dado el nombre de este adaptador, es plausible que siga un enfoque similar, aunque no se ha confirmado en la model card. No se dispone de información sobre datos de entrenamiento, número de tokens, ni procesos de RLHF o DPO.

## Capacidades

- Generación de texto y código: el modelo base Gemma 2 2B IT tiene capacidades de generación de lenguaje y código, que el adaptador refuerza en el dominio de pi-mono.
- Soporte de tool calling: el modelo base soporta function calling; el adaptador podría heredar esta capacidad, aunque no se ha confirmado.
- Agentes y razonamiento multi-paso: el entrenamiento con trazas de ejecución de agentes sugiere que el modelo está orientado a generar acciones de agente, como ejecutar comandos o editar archivos.
- Capacidades multilingües: no disponibles (Gemma 2 soporta principalmente inglés, pero no se especifica para este adaptador).
- Capacidades especiales: no disponibles (no se ha confirmado soporte de visión, audio ni modo de pensamiento explícito).

## Casos de uso

- Agente de codificación autónomo: el adaptador puede utilizarse para que Gemma 2 2B genere acciones de agente a partir de trazas de ejecución de pi-mono, permitiendo automatizar tareas de programación como edición de archivos o ejecución de comandos.
- Asistente de programación en IDE: se puede integrar en entornos como VS Code o JetBrains para sugerir código y refactorizaciones basadas en el contexto del proyecto. El tamaño de 2B permite ejecutarlo en local con hardware modesto.
- Generación de código en producción: el modelo puede desplegarse como servicio de autocompletado o generación de snippets en pipelines de CI/CD, aprovechando el bajo coste de inferencia de un modelo de 2B.
- Investigación en aprendizaje de agentes: los investigadores pueden usar el adaptador como punto de partida para estudiar cómo las trazas de ejecución mejoran el comportamiento de agentes de codificación, comparando con el modelo base.
- Fine-tuning de bajo coste: el adaptador demuestra que es posible especializar un modelo de 2B con QLoRA y un dataset pequeño (0.1 GB), lo que es útil para prototipado rápido en entornos académicos o startups.
- Herramientas de análisis de trazas: el modelo puede usarse para clasificar o resumir trazas de ejecución de agentes, identificando patrones de éxito o error en tareas de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: dependiendo de la cuantización del modelo base, se necesitan ~2-3 GB para 4-bit (QLoRA) y ~4-5 GB para bf16. El adaptador añade ~0.1 GB adicional.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo como RTX 3060 12GB o RTX 4090. Para producción, se recomiendan A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo base de 2B en 4-bit cabe en GPUs de 6-8 GB, por lo que es viable en hardware doméstico.
- Opciones de despliegue: transformers con PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| orangefabercastell/gemma-2-2b-it-pi-mono-adapter-v2-lr1e4-r16-len2k | Adaptador LoRA (base 2B) | no disponible (sugerido 2048) | no disponible | HuggingFace |
| google/gemma-2-2b-it | 2B | 8192 | Licencia Gemma (no comercial) | HuggingFace |
| orangefabercastell/gemma-2-2b-it-pi-mono-sft | 2B (con QLoRA) | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados específicamente; el modelo hereda los sesgos del modelo base Gemma 2.
- Riesgo de alucinación: no evaluado; el adaptador no ha sido sometido a pruebas de robustez.
- Limitaciones de contexto: probablemente 2048 tokens, lo que limita tareas que requieren ventanas largas de contexto.
- Restricciones de licencia: no disponible; el modelo base Gemma 2 tiene restricciones de uso comercial, por lo que se debe revisar la licencia antes de usar en producción.
- Advertencia importante: este repositorio contiene solo un adaptador LoRA, no un modelo completo. Para su uso, es necesario cargar el modelo base `google/gemma-2-2b-it` y aplicar el adaptador con la librería PEFT.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/orangefabercastell/gemma-2-2b-it-pi-mono-adapter-v2-lr1e4-r16-len2k
- Modelo relacionado del mismo autor: https://huggingface.co/orangefabercastell/gemma-2-2b-it-pi-mono-sft
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de datos de entrenamiento (badlogicgames/pi-mono): no se ha verificado el enlace, pero el nombre aparece en la descripción del modelo relacionado.
