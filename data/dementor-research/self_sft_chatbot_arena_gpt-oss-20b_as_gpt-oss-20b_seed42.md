# dementor-research/self_sft_chatbot_arena_gpt-oss-20b_as_gpt-oss-20b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `openai/gpt-oss-20b`, un modelo de lenguaje de 20 mil millones de parámetros desarrollado por OpenAI. El adaptador se generó mediante la herramienta Tinker de Thinking Machines como parte del estudio de imitación de comportamiento configurado por el proyecto "dementor". El entrenamiento corresponde a la etapa `SELF_SFT`, con rango LoRA 32 y módulos objetivo de todas las capas lineales.

El modelo resultante no es un modelo completo, sino un conjunto de pesos adicionales que deben combinarse con el modelo base para su uso. El propósito declarado es la investigación sobre imitación de comportamiento en chatbots, utilizando datos de Chatbot Arena. No se proporcionan detalles sobre el rendimiento, las capacidades específicas o la licencia, por lo que su aplicación práctica es limitada fuera del ámbito de estudio para el que fue diseñado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador tiene rango 32 sobre capas lineales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador están en safetensors, el base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA con rango 32 y `target_modules=all-linear`, lo que significa que se añaden matrices de bajo rango a todas las capas lineales del modelo base. El entrenamiento corresponde a la etapa `SELF_SFT`, un tipo de fine-tuning supervisado aplicado sobre el propio modelo base (gpt-oss-20b) para imitar comportamientos de Chatbot Arena. El estudio "dementor" es una campaña configurada que incluye 12 modelos, 4 datasets y 1 semilla, generando 48 celdas de configuración. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.).

Al ser un adaptador LoRA, no introduce cambios en la arquitectura del modelo base; simplemente ajusta los pesos de forma eficiente. Las innovaciones técnicas se limitan al método de entrenamiento auto-supervisado, pero no se aportan detalles adicionales.

## Capacidades

- Las capacidades del modelo son las del modelo base `gpt-oss-20b`, que es un modelo de lenguaje de 20B parámetros. Sin embargo, no se dispone de información específica sobre las capacidades del adaptador en sí.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- El adaptador está diseñado para imitar comportamientos de chatbots, por lo que su capacidad principal es la generación de texto conversacional, pero sin evidencia de rendimiento.
- No se indican capacidades multilingües específicas.

## Casos de uso

- Investigación académica en imitación de comportamiento: el adaptador sirve para estudiar cómo un modelo de 20B puede replicar estilos de respuesta de chatbots de Chatbot Arena. Se usaría cargando el adaptador sobre el modelo base y evaluando las diferencias de comportamiento.
- Reproducción de experimentos: dado que el estudio "dementor" define una campaña con configuraciones específicas, este adaptador puede usarse para reproducir resultados dentro de ese marco experimental.
- Análisis de fine-tuning con LoRA: permite comparar el efecto de la etapa `SELF_SFT` frente a otros métodos de adaptación en modelos grandes.
- Desarrollo de chatbots especializados: aunque no hay evidencia de calidad, podría explorarse como base para un chatbot que imite un estilo concreto, siempre que se valide su comportamiento.
- Benchmarking de adaptadores: útil para medir la eficiencia de LoRA con rango 32 en un modelo de 20B, en términos de memoria y velocidad de entrenamiento.
- Exploración de alineación auto-supervisada: el enfoque `SELF_SFT` podría interesar a investigadores que buscan alternativas al RLHF, aunque no hay datos que respalden su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1.0 GB en disco, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-20b` completo.
- Para el modelo base en precisión fp16, se estima una VRAM de unos 40 GB, lo que excede las GPUs de consumo típicas (RTX 4090 tiene 24 GB). Con cuantización a 8 bits o 4 bits, podría reducirse a ~20 GB o ~10 GB respectivamente, pero no hay datos oficiales.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB), o GPUs con 24 GB o más si se cuantiza.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización agresiva.
- Opciones de despliegue: se puede usar con `transformers` y `peft` (como indica la model card), o mediante `vLLM` si se fusiona el adaptador con el base. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no se proporciona esa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto de estudio. El modelo base `gpt-oss-20b` pertenece a la familia de OpenAI de 20B, pero no se conocen alternativas específicas con las que comparar este adaptador. Se recomienda consultar la documentación de OpenAI para el modelo base.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No hay garantías de calidad, robustez o seguridad.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere verificación con el autor.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos de Chatbot Arena, podría heredar sesgos de esos datos.
- Riesgo de alucinación: no se ha evaluado, pero es inherente a los modelos de lenguaje de gran tamaño.
- Limitaciones de contexto: dependen del modelo base `gpt-oss-20b`, que no se detalla en esta ficha.
- El adaptador solo es útil si se combina con el modelo base; no funciona de forma independiente.
- No hay información sobre el rendimiento en tareas específicas, por lo que no se recomienda su uso sin una evaluación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_chatbot_arena_gpt-oss-20b_as_gpt-oss-20b_seed42
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
- Modelo base (referencia): https://huggingface.co/openai/gpt-oss-20b
