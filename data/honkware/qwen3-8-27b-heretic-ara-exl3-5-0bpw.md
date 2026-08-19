# Honkware/Qwen3.8-27B-heretic-ara-exl3-5.0bpw

## Resumen

El modelo `Honkware/Qwen3.8-27B-heretic-ara-exl3-5.0bpw` es una cuantización en formato EXL3 (ExLlamaV3) a 5.0 bits por peso del modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara`, un fine-tuning conversacional basado en la arquitectura Qwen3.5 de 27B (etiquetado como "Dense" en la model card). El quantizado lo ha realizado Honkware con su herramienta BlockQuant, y está pensado para inferencia local eficiente en GPUs de consumo.

Aunque el nombre comercial indica 27B, los pesos reales en safetensors suman 10.109.613.296 parámetros (aproximadamente 10,1B), una discrepancia que conviene tener en cuenta al dimensionar el hardware. El repositorio ocupa 20,2 GB y está diseñado para cargarse con ExLlamaV3 v0.0.3 o superior, que es el único loader compatible con el codebook `mul1` que utiliza esta cuantización.

La relevancia de este modelo radica en su formato: al ser una cuantización EXL3 de alta calidad (5.0 bpw con 8 bits para la cabeza), ofrece un equilibrio entre fidelidad al modelo original y uso de VRAM, permitiendo ejecutar un modelo de 27B (nominal) en tarjetas con 24 GB de memoria. La licencia Apache 2.0 tanto del quantizado como del base facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 27B (Dense, transformer) |
| Parametros totales | 10.109.613.296 (segun safetensors; el nombre comercial indica 27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, 5.0 bits por peso, head bits 8, codebook mul1 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (tanto el quantizado como el modelo base) |
| Formato de pesos | safetensors (formato EXL3, cargable con ExLlamaV3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 27B, un transformer denso de última generación de la familia Qwen. Sin embargo, la model card del quantizado no proporciona detalles sobre el número de capas, dimensión oculta, ni el mecanismo de atención específico. El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` es un fine-tuning conversacional (el sufijo "heretic-ara" sugiere un ajuste orientado a roleplay o narrativa), pero no se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.).

La cuantización EXL3 a 5.0 bpw utiliza un codebook `mul1` con 8 bits para la cabeza del modelo y 250 filas de calibración. Según la documentación, este codebook se registra en los pesos, por lo que los loaders lo detectan automáticamente, pero requiere ExLlamaV3 v0.0.3 o posterior para decodificar correctamente. No se han revelado detalles sobre la técnica de cuantización más allá de los parámetros de la receta.

## Capacidades

- Generacion de texto conversacional: al ser un fine-tuning de Qwen3.5, se espera que mantenga las capacidades de diálogo y generación de texto del modelo base, aunque no hay documentación específica que lo confirme.
- Inferencia local eficiente: el formato EXL3 a 5.0 bpw permite ejecutar el modelo en GPUs con 24 GB de VRAM, con un tamaño de 20,3 GB.
- Compatibilidad con herramientas estándar: funciona con TabbyAPI (servidor compatible con OpenAI), text-generation-webui (mediante el loader ExLlamaV3) y la API de Python de ExLlamaV3.
- No se dispone de información verificada sobre soporte de tool calling, razonamiento multi-step, capacidades multilingües o modos especiales (thinking mode, visión, audio). Estas capacidades dependerán del modelo base, pero no están documentadas en la información proporcionada.

## Casos de uso

- Despliegue de un chatbot local con TabbyAPI: al ser un servidor compatible con OpenAI, se puede integrar en aplicaciones existentes que usen la API de OpenAI, sustituyendo el endpoint por uno local. El modelo, con sus 20,3 GB, cabe en una RTX 4090 o similar.
- Experimentación con ExLlamaV3: los desarrolladores que trabajen con la librería ExLlamaV3 pueden cargar este modelo directamente desde Python para probar técnicas de generación, sampling o para construir pipelines personalizados.
- Generación de narrativa o roleplay: el sufijo "heretic-ara" sugiere un fine-tuning orientado a ficción interactiva. Aunque no hay documentación oficial, es plausible usar el modelo para generar historias o mantener personajes en entornos de juego de rol textual.
- Servidor de inferencia para equipos pequeños: con TabbyAPI se puede montar un servicio compartido en una máquina con una GPU de 24 GB, ofreciendo generación de texto a varios usuarios simultáneamente.
- Evaluación de cuantizaciones EXL3: este repositorio sirve como referencia para comparar el rendimiento de una cuantización a 5.0 bpw frente a otras bit-widths de la misma colección (por ejemplo, 4.0 o 6.0 bpw) en términos de calidad y velocidad.
- Integración en flujos de generación de texto sin conexión: al ser un modelo local, se puede usar en entornos con requisitos de privacidad donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del quantizado no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 20,3 GB, por lo que se necesita al menos 24 GB de VRAM para cargarlo con contexto estándar. Con contexto largo, puede requerir más memoria.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A5000 (24 GB) o superiores. No cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui (loader ExLlamaV3) y la API de Python de ExLlamaV3.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán de la GPU, el contexto y la configuración de sampling.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. La única referencia clara es el modelo base sin cuantizar `trohrbaugh/Qwen3.8-27B-heretic-ara`, que ocuparía más VRAM (probablemente ~54 GB en FP16) y ofrecería mayor precisión, pero no se han publicado métricas comparativas. Tampoco se conocen otras cuantizaciones del mismo modelo base en otros formatos (GGUF, AWQ, etc.) dentro de la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 5.0 bpw introduce una pérdida de precisión frente al modelo original, que puede manifestarse en errores de generación o degradación de tareas complejas.
- El codebook `mul1` requiere ExLlamaV3 v0.0.3 o superior; usar una versión anterior decodificará los pesos con un codebook incorrecto, produciendo resultados basura.
- No se han documentado sesgos específicos del modelo base ni del fine-tuning. Al ser un modelo de texto, es susceptible de generar contenido sesgado o alucinaciones, especialmente en temas controvertidos.
- La longitud de contexto no está especificada; se desconoce si el modelo base soporta ventanas largas (p. ej., 128K tokens) o si la cuantización afecta a este aspecto.
- La discrepancia entre el nombre (27B) y los parámetros reales (10,1B) puede inducir a error en la planificación de recursos; se recomienda verificar siempre el tamaño real de los pesos.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar los términos del modelo base original por si hubiera condiciones adicionales.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/Honkware/Qwen3.8-27B-heretic-ara-exl3-5.0bpw
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Colección de cuantizaciones del mismo modelo: https://huggingface.co/collections/Honkware/qwen38-27b-heretic-ara-exl3-6a7fa388508e4061796d13b2
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant (herramienta de cuantización): https://github.com/Honkware/blockquant
