# goodmai/Qwen3.8-27B-GSQ-RCO-MLX

## Resumen

Qwen3.8-27B-GSQ-RCO-MLX es una conversión al formato MLX de un modelo de la familia Qwen, publicada por el usuario goodmai y derivada del repositorio upstream `uqer1244/Qwen3.8-27B-GSQ-RCO-MLX`. Está pensada para ejecutarse en Apple Silicon (macOS) mediante la librería MLX y el runtime Basalt, sin necesidad de Python. El nombre del repositorio sugiere la familia Qwen3.5/Qwen3.8, aunque la model card no aporta detalles sobre el modelo base original ni sobre el proceso de conversión.

A pesar de la etiqueta "27B" en el nombre, los pesos en safetensors suman 10.431.832.064 parámetros (aproximadamente 10,4 mil millones), y el repositorio ocupa 10,4 GB en cuantización de 8 bits. Esta discrepancia entre el nombre y el recuento real de parámetros es una advertencia importante: el identificador del modelo no debe tomarse como especificación fiable.

La información disponible es muy limitada: la model card solo incluye botones de lanzamiento para Basalt y un comando de servidor. No se documentan datos de entrenamiento, benchmarks, licencia, idiomas ni casos de uso. Todo lo que sigue se basa exclusivamente en los metadatos del repositorio y en las etiquetas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia: `qwen3_5`) |
| Parametros totales | 10.431.832.064 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (según etiqueta `8-bit`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La etiqueta `qwen3_5` apunta a la familia Qwen3.5 de Alibaba, y el nombre del repositorio menciona "Qwen3.8-27B", pero no hay documentación que confirme la arquitectura exacta (transformer denso, MoE u otra variante) ni el número de capas, dimensiones ocultas o cabezas de atención.

Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF/DPO o técnicas de alineación. El sufijo "GSQ-RCO" del nombre no se explica en la model card y no se puede interpretar con fiabilidad. La única innovación técnica verificable es la conversión a MLX con cuantización de 8 bits para inferencia en Apple Silicon.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de la familia Qwen, aunque no está documentada en la model card.
- Razonamiento y código: no disponible (no se documenta).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución nativa en Apple Silicon mediante MLX y el runtime Basalt.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización de 8 bits permiten ejecutar el modelo en macOS sin Python, usando `basalt serve --model goodmai/Qwen3.8-27B-GSQ-RCO-MLX --rest`. Es el caso de uso principal declarado por el autor.
- Prototipado de asistentes conversacionales en local: el runtime Basalt expone un rol `chat` a través de su interfaz web, lo que permite probar conversaciones multi-turno sin infraestructura de servidor.
- Desarrollo de aplicaciones macOS nativas: al integrarse con Basalt (Swift, macOS 27+), el modelo puede incorporarse en apps de escritorio que requieran generación de texto sin depender de APIs en la nube.
- Investigación sobre cuantización MLX: el repositorio sirve como referencia para estudiar el comportamiento de pesos en 8 bits sobre la familia Qwen en Apple Silicon.
- Evaluación comparativa de conversiones comunitarias: útil para contrastar el rendimiento de esta conversión frente al repositorio upstream `uqer1244/Qwen3.8-27B-GSQ-RCO-MLX`.
- Despliegue de servicios REST locales: el flag `--rest` de Basalt permite levantar un endpoint HTTP en la máquina del desarrollador para pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 10,4 GB en 8 bits; se recomienda al menos 12-16 GB de memoria unificada para cargar los pesos con margen para el contexto y el runtime.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; no se documenta soporte para GPU NVIDIA.
- Cabe en consumer GPU: sí, en Mac con Apple Silicon de gama alta (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) con 16 GB o más de memoria unificada.
- Opciones de despliegue: MLX y Basalt (macOS 27+, sin Python); `basalt serve --model ... --rest`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-GSQ-RCO-MLX | 10,43 B | no disponible | no disponible | safetensors MLX 8-bit | Hugging Face |
| uqer1244/Qwen3.8-27B-GSQ-RCO-MLX (upstream) | no disponible | no disponible | no disponible | MLX | Hugging Face |
| Modelo base Qwen3.5 original | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("27B") y el recuento real de parámetros (10,43 B): no confiar en el identificador como especificación.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que consultar el repositorio upstream y la licencia del modelo Qwen original.
- Idiomas no declarados: no hay garantía de soporte multilingüe más allá de lo que ofrezca el modelo base.
- Sin benchmarks ni documentación de entrenamiento: imposible evaluar calidad, sesgos o riesgo de alucinación con datos.
- Repositorio sin descargas ni likes (0/0) y creado en 2026: procedencia y mantenimiento inciertos.
- Dependencia de Basalt y macOS 27+: no es portable a Linux ni a GPU NVIDIA sin conversión adicional.
- El sufijo "GSQ-RCO" no está explicado; podría implicar modificaciones (fine-tuning, merging) cuyos efectos se desconocen.
- Riesgo de alucinación y sesgos: no evaluable sin información del modelo base ni del proceso de alineación.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GSQ-RCO-MLX
- Repositorio upstream: https://huggingface.co/uqer1244/Qwen3.8-27B-GSQ-RCO-MLX
- Basalt en GitHub: https://github.com/goodmai/basalt
- Demo Basalt (chat): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-GSQ-RCO-MLX&role=chat
