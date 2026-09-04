# Etherealty/Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF

## Resumen

Este modelo es una cuantización GGUF de 2 GB de `huihui-ai/Huihui-Qwen3.5-4B-abliterated`, un modelo de base Qwen3.5-4B sin censura (abliterado) desarrollado por Alibaba y afinado con TRL para eliminar los comportamientos de rechazo. La publicación en HuggingFace es de Etherealty, mientras que la cuantización ha sido realizada por Asystemoffields mediante la técnica Production Mixed-Rate Allocation (PMRA). El objetivo es ofrecer una versión lista para llama.cpp que ocupe lo mismo que una cuantización `IQ3_XS` estándar, pero con mejor reconstrucción de los pesos: a igual tamaño, este build logra 0,60 nats menos de pérdida de negativo log-likelihood (NLL) en Wikitext-2.

Arquitectónicamente, el modelo base es un transformer híbrido que intercala capas de atención lineal gated tipo DeltaNet con capas de atención completa periódicas, lo que reduce el coste de inferencia en contextos largos. Tiene 4.205.751.296 parámetros y la licencia es Apache-2.0. La longitud de contexto no se ha especificado en la información disponible. El modelo es un único archivo GGUF que puede cargarse con llama.cpp o Ollama, sin necesidad de un runtime personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención lineal gated DeltaNet intercaladas con capas de atención completa periódicas (`model_type: qwen3_5`) |
| Parametros totales | 4.205.751.296 (≈4,21 mil millones) |
| Parametros activos | No aplica (modelo denso híbrido, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con PMRA (mezcla de IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_M); bpw de archivo 3,825; payload bpw 3,804 |
| Idiomas soportados | Inglés (etiqueta oficial; el modelo base es multilingüe, pero esta build se calibró y midió en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original usa safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer híbrido de Alibaba. Su característica principal es la combinación de capas de atención lineal gated tipo DeltaNet con capas de atención completa periódicas. Esto permite mantener un coste de inferencia más bajo en secuencias largas, a la vez que se conserva la capacidad de atención softmax donde es más necesaria. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso con una arquitectura de atención híbrida.

El proceso de entrenamiento incluye dos etapas. Primero, el modelo base original se afinó con TRL para eliminar los patrones de rechazo, dando lugar a `huihui-ai/Huihui-Qwen3.5-4B-abliterated`. Este fine-tuning de abliteración está diseñado para reducir la negativa a responder manteniendo las capacidades subyacentes. No se han publicado detalles sobre el dataset utilizado en este ajuste. La cuantización PMRA no es una etapa de entrenamiento, sino un proceso de compresión: parte de una cuantización de baja precisión `IQ2_M` y promueve selectivamente ciertos grupos de tensores a formatos de mayor precisión (`Q3_K_*`, `IQ4_XS`, `Q4_K_M`) bajo un presupuesto fijo de bytes. La asignación se calibró con Wikitext-2-raw train (48 prompts) y se evaluó en Wikitext-2-raw validation (512 prompts).

## Capacidades

- Generación de texto conversacional en inglés.
- Modelo sin censura (abliterado): responde con menos rechazos que el modelo base original, lo que permite usarlo en aplicaciones donde se requiere un comportamiento menos restrictivo.
- Capacidades generales de propósito general heredadas del modelo base Qwen3.5-4B (razonamiento, conocimiento y generación de texto); no se han publicado evaluaciones específicas de razonamiento, código o matemáticas en esta build.
- Lenguaje base multilingüe, pero este build está calibrado y medido exclusivamente en inglés; el rendimiento en otros idiomas no está garantizado.
- Soporte para ejecución en llama.cpp y Ollama, siempre que se use un build reciente con soporte Qwen3.5.
- No se documenta soporte de tool calling ni function calling en esta build.
- No se documenta soporte para agentes o razonamiento multi-paso.
- Sin capacidades multimodales: es un modelo de texto, sin visión ni audio.

## Casos de uso

- Chat sin censura en local: el modelo puede ejecutarse con llama.cpp o Ollama en una máquina con recursos limitados. Al ser un GGUF de 2 GB, se puede cargar en CPU sin necesidad de GPU. La abliteración reduce las negativas a responder, lo que resulta útil para escritura creativa, juego de roles o análisis de temas controvertidos en inglés.

- Asistente de atención al cliente en inglés: desplegado con `llama-server` o `ollama serve`, este modelo puede gestionar conversaciones multi-turno en un entorno de producción ligero. Su tamaño de 2 GB permite alojar varias instancias en un solo servidor, y la arquitectura híbrida abarata el coste de mantener conversaciones largas.

- Generación de código en local: a pesar de que no hay benchmarks específicos, el modelo hereda capacidades de codificación del modelo base Qwen3.5. Puede integrarse en flujos de trabajo de editores como análogo a `continue` o `ollama` para autocompletar fragmentos de código en inglés.

- Análisis y resumen de documentos largos: la arquitectura híbrida con capas DeltaNet está diseñada para hacer más eficiente la inferencia en contextos extensos. El modelo puede probarse para resumir informes técnicos, actas de reuniones o artículos largos en inglés, siempre que se respete la ventana de contexto disponible (no especificada).

- Prototipado de RAG: se puede utilizar como generador en pipelines de recuperación aumentada. Al ser un modelo GGUF compatible con llama.cpp, puede integrarse en aplicaciones de RAG mediante la API de `llama-server` o con frameworks como LangChain que aceptan backends de llama.cpp. La abliteración evita que el modelo se niegue a responder preguntas basadas en documentos técnicos.

- Educación y análisis de cuantización: el archivo incluye `artifact_report.json` y `selector_result.json`, lo que permite inspeccionar la asignación de bits por grupo de tensores. Es una herramienta didáctica para entender cómo PMRA distribuye la precisión y cómo afecta a la calidad de reconstrucción.

- Despliegue en dispositivos con memoria limitada: gracias a su tamaño de 2 GB, el modelo puede ejecutarse en portátiles antiguos, mini-PC o contenedores con 4 GB de RAM. Es una opción práctica para prototipar aplicaciones de chatbot en entornos sin acceso a GPU.

## Benchmarks y rendimiento

La información disponible solo incluye resultados de reconstrucción de cuantización en Wikitext-2 (NLL, menor es mejor). No se han publicado benchmarks de razonamiento (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la model card.

| Variante | NLL | Payload bpw | Payload bytes |
|---|---:|---:|---:|
| Referencia fp16 | 3,171504 | 16,000000 | 8.411.502.592 |
| IQ2_M | 14,179427 | 3,059981 | 1.608.689.664 |
| IQ3_XS (control) | 14,073741 | 3,803868 | 1.999.765.504 |
| Q3_K_S | 13,977966 | 3,916374 | 2.058.911.744 |
| Q3_K_M | 13,865006 | 4,273212 | 2.246.508.544 |
| Q3_K_L | 13,911635 | 4,465188 | 2.347.433.984 |
| IQ4_XS | 13,814762 | 4,612112 | 2.424.674.304 |
| Q4_K_M | 13,877977 | 5,129255 | 2.696.546.304 |
| Mezcla PMRA | 13,471562 | 3,803710 | 1.999.682.304 |
| Misma asignación aleatoria | 13,995436 | 3,802938 | 1.999.276.544 |

Los resultados clave son los siguientes: la mezcla PMRA consigue un NLL de 13,47, frente al 14,07 de una cuantización `IQ3_XS` estándar del mismo modelo, lo que supone una mejora de 0,60 nats con un tamaño prácticamente idéntico. También supera a `Q3_K_S` en 0,51 nats siendo 59 MB más pequeña. La comparación con una asignación aleatoria de bits a igual presupuesto (13,99) confirma que la ganancia proviene de la asignación inteligente de bits por grupo de tensores.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 2,01 GB. Para cargar los pesos en GPU se recomienda al menos 4 GB de VRAM, dejando espacio para la cache KV y el overhead del runtime. En CPU, se necesita aproximadamente 2 GB de RAM para los pesos, más memoria adicional para el cálculo.

- GPU recomendadas: no hay una recomendación oficial; por tamaño, cualquier GPU con 4 GB o más es suficiente. Modelos como RTX 3050 6GB, RTX 3060, RTX 4060, RX 6600 o superiores pueden ejecutarlo. También puede funcionar en iGPUs con suficiente RAM para la cuantización.

- Cabe en consumer GPU: sí, una GPU de consumo con 4-6 GB de VRAM es suficiente para ejecutar el modelo completo.

- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier interfaz compatible con llama.cpp (LM Studio, KoboldCpp). Se requiere un build reciente con soporte Qwen3.5. No se recomienda vLLM ni TGI porque trabajan con modelos en formato safetensors, no GGUF.

- Latencia y throughput estimados: no disponible. No se han publicado mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamaño | Cuantizacion | NLL (Wikitext-2) | Licencia |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF (este modelo) | 4.205.751.296 | No disponible | 2,01 GB | GGUF PMRA | 13,47 | Apache-2.0 |
| Mismo modelo base en GGUF IQ3_XS | 4.205.751.296 | No disponible | 2,00 GB | GGUF IQ3_XS | 14,07 | Apache-2.0 |
| Huihui-Qwen3.5-4B-abliterated (original fp16) | 4.205.751.296 | No disponible | 8,41 GB | Safetensors fp16 | 3,17 (referencia, no comparable directamente) | Apache-2.0 |

No se dispone de información comparativa con otros modelos de 4B de otros fabricantes en la documentación proporcionada. La comparación se limita a las variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en esta build. No obstante, al ser un modelo abliterado, se han reducido los filtros de seguridad de manera sustancial, lo que puede hacer que el modelo genere contenido dañino, ilegal o inapropiado sin ningún tipo de advertencia.

- Riesgo de alucinación: no se han publicado evaluaciones de alucinación para esta cuantización. Como modelo de 4B, es previsible que la tasa de alucinación sea mayor que la de modelos de mayor tamaño.

- Limitaciones de contexto o idioma: la longitud de contexto no se ha especificado. Aunque la arquitectura híbrida está pensada para contextos largos, se desconocen los límites concretos. El modelo está calibrado y medido en inglés; su uso en otros idiomas puede degradar el rendimiento.

- Restricciones de licencia para uso comercial: la licencia Apache-2.0 permite el uso comercial sin coste, siempre que se conserve el aviso de licencia y se reconozca la autoría original. Sin embargo, al ser un modelo abliterado, el uso en aplicaciones que generen contenido ilegal o dañino puede violar los términos de servicio de la plataforma donde se despliegue, aunque no la licencia del modelo.

- Advertencias para producción: la calidad se evaluó únicamente con NLL en Wikitext-2, que mide la capacidad de reconstrucción de pesos, no el rendimiento en tareas de razonamiento o diálogo. Antes de usar en producción, se recomienda realizar pruebas específicas del dominio. El archivo requiere un build reciente de llama.cpp con soporte Qwen3.5; build desactualizados pueden no reconocer el modelo. El repositorio muestra 0 descargas y 1 like, por lo que su uso en producción no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Etherealty/Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF
- Modelo base abliterado (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Fuentes GGUF para la cuantización: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF
- Método PMRA y reproducción: https://github.com/asystemoffields/PMRA
