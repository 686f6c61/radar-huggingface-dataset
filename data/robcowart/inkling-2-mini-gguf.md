# robcowart/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje desarrollado por Thinking Machines (organización responsable del repositorio base `thinkingmachines/Inkling-2-Mini`). Este repositorio concreto, publicado por el usuario robcowart, no contiene el modelo original sino una conversión al formato GGUF cuantizada en Q4_K_M, pensada para su uso con llama.cpp y herramientas derivadas. La motivación declarada es práctica: otras conversiones GGUF de Inkling-2-Mini fallaban al cargar en llama.cpp con el error `check_tensor_dims: tensor 'blk.24.attn_q.weight' not found`, y esta versión se generó con las herramientas oficiales del propio llama.cpp para garantizar una carga correcta.

La información disponible sobre la arquitectura subyacente es indirecta, pero reveladora. Los patrones de cuantización aplicados a tensores concretos (`shortconv.in_proj`, `shortconv.out_proj`, `ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`, `ffn_down_shexp`) indican una arquitectura híbrida que combina atención con capas de convolución corta (short convolution) y capas de mezcla de expertos (MoE) distribuidas en el bloque, además de un tensor compartido de expertos (`shexp`). El modelo también expone un modo de razonamiento configurable mediante el parámetro `reasoning_effort` en la plantilla de chat.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa funcional de despliegue local para un modelo que de otro modo resultaría problemático en llama.cpp. Por otro, deja constancia de las restricciones reales de ejecución: en una GPU de 24 GB de VRAM (RTX 3090) el modelo cabe con cuantización Q4_K_M pero queda limitado a unos 32K tokens de contexto y requiere cuantizar la caché KV, con un rendimiento medido de aproximadamente 50 tokens por segundo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con convolución corta (shortconv) y mezcla de expertos (MoE) por bloque; detalles completos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (la arquitectura presenta tensores de expertos `_exps` y un tensor de experto compartido `_shexp`, lo que confirma un diseño MoE) |
| Longitud de contexto | 32.768 tokens en la configuración documentada sobre 24 GB de VRAM; contexto máximo nativo no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repositorio), con embeddings y tensores de salida en Q8_0, tensores de atención y shortconv en Q8_0, expertos de las capas 0-19 en Q4_K y expertos de las capas 20-23 en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión previa a BF16 GGUF mediante `convert_hf_to_gguf.py`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala mecanismos de atención con capas de convolución corta (`shortconv`), un patrón que busca reducir coste de atención en secuencias largas combinando modelado local eficiente con atención global. Además, incorpora mezcla de expertos (MoE) en las capas feed-forward: los tensores `ffn_gate_exps`, `ffn_up_exps` y `ffn_down_exps` corresponden a los expertos enrutados, mientras que `ffn_down_shexp` apunta a un experto compartido que procesa todas las entradas. El script de cuantización del autor aplica Q4_K a los expertos de las capas 0-19 y Q8_0 a los de las capas 20-23, lo que sugiere que las capas finales concentran expertos de mayor sensibilidad o tamaño.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documenta un mecanismo de control de razonamiento en tiempo de inferencia mediante `reasoning_effort` (valor `minimal` en la configuración de referencia), lo que implica que el modelo fue entrenado con modos de razonamiento diferenciados. El autor advierte que el modelo "razona intensamente" por defecto, un comportamiento que conviene mitigar cuando el contexto disponible es reducido.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable mediante `reasoning_effort`.
- Razonamiento intensivo por defecto, adecuado para tareas analíticas pero costoso en tokens.
- Soporte de plantillas Jinja (`--jinja`), lo que habilita el uso de plantillas de chat con lógica condicional y argumentos extra.
- Compatibilidad con llama.cpp, llama-server y, presumiblemente, frontends derivados como Ollama o interfaces compatibles con la API de llama-server.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, visión, audio y otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantización Q4_K_M permite ejecutar el modelo íntegramente en GPU con llama-server, usando `--gpu-layers all` y cuantización de caché KV en Q8_0, lo que resulta adecuado para entornos de desarrollo sin clúster.
- Asistente de razonamiento con control de coste: para tareas analíticas acotadas, configurar `reasoning_effort: minimal` reduce la verbosidad del razonamiento y libera contexto para el diálogo, útil en escenarios de 32K tokens.
- Servicio interno de generación con API compatible: llama-server expone un endpoint HTTP con clave de API, lo que permite integrarlo como backend de aplicaciones internas sin depender de infraestructura cloud.
- Prototipado e investigación de arquitecturas híbridas: al ser un GGUF cargable con las herramientas oficiales de llama.cpp, sirve como banco de pruebas para estudiar el comportamiento de modelos con shortconv y MoE en hardware de consumo.
- Evaluación comparativa de cuantizaciones: el repositorio documenta de forma reproducible el pipeline BF16 → Q4_K_M con tipos de tensor diferenciados, lo que facilita reproducir y auditar el proceso de cuantización en otros modelos.
- Generación de texto por lotes en local: con ~50 tokens/s en una RTX 3090, es viable para tareas de generación moderada no interactivas, como resúmenes o reescritura de documentos de longitud media dentro de la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es empírico: aproximadamente 50 tokens por segundo en una RTX 3090 con cuantización Q4_K_M, contexto de 32.768 tokens, caché KV en Q8_0 y flash-attention activada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para la cuantización Q4_K_M con contexto de 32K tokens y caché KV cuantizada; el tamaño exacto del fichero GGUF no está disponible.
- GPU recomendadas: RTX 3090 (24 GB) como referencia validada por el autor; GPU con 24 GB o más de VRAM en general. Para contexto completo nativo o mayor ventana, se requiere hardware superior (A100, H100) o cuantización más agresiva.
- Cabe en GPU de consumo: sí, en RTX 3090 y previsiblemente en RTX 4090 (24 GB), con las mismas restricciones de contexto y caché KV cuantizada.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli, llama-quantize), y herramientas compatibles con GGUF derivadas de llama.cpp.
- Latencia y throughput: ~50 tokens/s en RTX 3090 con la configuración documentada; latencia por petición no disponible.
- Configuración de referencia: `--ctx-size 32768 --cache-type-k q8_0 --cache-type-v q8_0 --gpu-layers all --flash-attn on --jinja`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (este GGUF Q4_K_M) | no disponible | 32K en 24 GB VRAM (nativo no disponible) | ~50 tok/s en RTX 3090 | Apache 2.0 | GGUF en este repositorio |
| Otras conversiones GGUF de Inkling-2-Mini | no disponible | no disponible | no disponible | Apache 2.0 (según modelo base) | Reportadas como defectuosas en llama.cpp por el autor |
| Modelo base thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | Apache 2.0 | Pesos originales en Hugging Face |

No se dispone de datos suficientes para comparar con modelos de la misma categoría y tamaño, ya que el número de parámetros del modelo base no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo razona de forma intensiva por defecto; sin reducir `reasoning_effort`, consumirá buena parte de la ventana de 32K tokens en trazas de razonamiento.
- En GPU de 24 GB el contexto máximo práctico es de ~32K tokens y exige cuantizar la caché KV; superar ese límite requiere hardware adicional o cuantización más agresiva.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al BF16 original; no se han publicado evaluaciones del impacto en calidad.
- El repositorio es una conversión de terceros, no la publicación oficial del modelo; la responsabilidad sobre la fidelidad de los pesos recae en el autor del GGUF.
- Idiomas soportados, sesgos conocidos y tasas de alucinación no están documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `thinkingmachines/Inkling-2-Mini` antes de distribuirlo en producción.
- No hay información sobre tool calling, function calling ni otras capacidades avanzadas, por lo que no deben asumirse en integraciones de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/robcowart/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp (herramientas de conversión y cuantización): https://github.com/ggerganov/llama.cpp
