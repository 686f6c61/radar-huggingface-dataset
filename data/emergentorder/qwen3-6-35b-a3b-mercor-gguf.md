# emergentorder/Qwen3.6-35B-A3B-Mercor-GGUF

## Resumen

El modelo `emergentorder/Qwen3.6-35B-A3B-Mercor-GGUF` es una conversión a formato GGUF de `Qwen3.6-35B-A3B-Mercor`, una versión post-entrenada mediante aprendizaje por refuerzo (RL) del modelo `Qwen3.6-35B-A3B`, desarrollada por `emergentorder` en colaboración con Mercor. El post-entrenamiento se ha realizado sobre datasets APEX-Agents off-the-shelf y con el framework SkyRL, con el objetivo declarado de crear agentes de trabajo de conocimiento. Su relevancia radica en combinar un modelo de mezcla de expertos (MoE) de 34.660.610.688 parámetros con un enfoque de RL para agentes, y ofrecer una versión ejecutable en local mediante llama.cpp.

La arquitectura es MoE (por la denominación A3B, que sugiere 3.000 millones de parámetros activos), aunque la documentación no la describe explícitamente. La longitud de contexto no se indica en la información disponible. La licencia del modelo es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) inferida de la nomenclatura; no documentada explícitamente |
| Parametros totales | 34.660.610.688 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_0, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF de `Qwen3.6-35B-A3B-Mercor`, que a su vez es un post-entrenamiento mediante RL sobre `Qwen3.6-35B-A3B`. Según la model card, el entrenamiento se realizó sobre datasets APEX-Agents off-the-shelf y con el framework SkyRL. El blog de Mercor menciona una guía de entrenamiento RL de 397B, lo que indica un proceso de RL a gran escala orientado a agentes. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni el método exacto de RL (p. ej., PPO, DPO), por lo que estos datos están no disponibles.

La conversión a GGUF se realizó con el script `hf-to-gguf` de llama.cpp y la opción `--no-mtp`, lo que desactiva la predicción multi-token (MTP). Esto puede afectar al rendimiento en generación respecto al modelo original, al eliminar la decodificación especulativa multi-token.

## Capacidades

- Procesamiento multimodal de imagen y texto, según el pipeline `image-text-to-text` del modelo original.
- Generación de texto conversacional, enfocada a tareas de agente de conocimiento tras el post-entrenamiento con RL.
- Razonamiento multi-paso y toma de decisiones en entornos de agentes, implícito en el uso de datasets APEX-Agents.
- Posible soporte de tool calling / function calling, no confirmado en la documentación pero coherente con el enfoque en agentes.
- Eficiencia en inferencia: al ser un modelo MoE con 3.000 millones de parámetros activos (estimado), ofrece un coste de generación menor que un modelo denso de 35B.
- Ejecución local mediante llama.cpp y otras herramientas compatibles con GGUF, gracias a las cuantizaciones disponibles.

## Casos de uso

- Asistentes de conocimiento empresarial: desplegado en una intranet mediante llama.cpp, puede responder preguntas sobre documentación interna y procesar diagramas o capturas de pantalla gracias a su capacidad multimodal.
- Agentes de soporte técnico: al estar entrenado con RL para agentes, puede gestionar conversaciones multi-turno y ejecutar flujos de trabajo de apoyo, aunque se debe verificar su soporte real de tool calling.
- Analisis de documentos mixtos: extracción de información de PDFs con texto e imágenes, útil en sectores como legal o administración, donde se combinan tablas, gráficos y texto.
- Automatización de flujos de trabajo: utilizado como planificador en un pipeline de agentes, puede generar secuencias de pasos y llamadas a herramientas; su modalidad MoE reduce el coste en despliegues con muchas peticiones.
- Asistente de código en entornos de desarrollo: puede explicar fragmentos de código y razonar sobre errores, con despliegue local en estaciones de trabajo con GPU compatibles.
- Prototipado de investigación: dada su licencia Apache-2.0 y su formato GGUF, resulta adecuado para experimentos con agentes o para evaluar el efecto del post-entrenamiento RL frente al modelo base.
- Analisis de conversaciones de soporte: su naturaleza conversacional permite resumir historiales de chat y generar respuestas contextualizadas, siempre que se ajuste la longitud de la ventana de contexto disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones para un contexto moderado, incluyendo KV cache y buffers):
  - Q4_0: aproximadamente 20-24 GB.
  - Q5_0: aproximadamente 24-28 GB.
  - Q6_K: aproximadamente 28-32 GB.
  - Q8_0: aproximadamente 37-42 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB) para Q4_0 y Q5_0.
  - A100 40-80 GB para Q6_K.
  - A100 o H100 80 GB para Q8_0 con contexto amplio.
- Para GPU de consumo, cabe con las cuantizaciones Q4_0/Q5_0 en tarjetas de 24 GB o más. En tarjetas de 12-16 GB no es viable este modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp, todas compatibles con el formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones de modelos comparables. Los únicos referentes identificados son el modelo base `Qwen/Qwen3.6-35B-A3B` y la versión original `mercor/Qwen3.6-35B-A3B-Mercor`, de los que no se ofrecen datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos, idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos, más aún al no publicarse resultados de evaluación.
- El soporte real de tool calling y funciones no está confirmado en la documentación, a pesar de la orientación del post-entrenamiento hacia agentes.
- La conversión GGUF utiliza `--no-mtp`, lo que reduce la predicción multi-token y puede disminuir el rendimiento en generación comparado con el modelo original.
- El repositorio tiene pocas descargas (98) y 0 likes, lo que indica una validación comunitaria limitada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `Qwen/Qwen3.6-35B-A3B` por si incluye condiciones adicionales.

## Enlaces

- https://huggingface.co/emergentorder/Qwen3.6-35B-A3B-Mercor-GGUF
- https://huggingface.co/emergentorder/Qwen3.6-35B-A3B-Mercor-Q8_0-GGUF
- https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl
- https://huggingface.co/mercor/Qwen3.6-35B-A3B-Mercor
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
