# mkd-minkeun/Keural-Lab-1108-GGUF

## Resumen

Keural-Lab-1108-GGUF es la versión cuantizada en formato GGUF del modelo base mkd-minkeun/Keural-Lab-1108, publicada por el usuario mkd-minkeun bajo licencia Apache 2.0. Según la model card, el modelo deriva de Qwen3.6-35B-A3B, un modelo de arquitectura Mixture of Experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. El repositorio contiene un único archivo de pesos en cuantización Q4_K_M de 29,3 GB, pensado para su ejecución con llama.cpp y llama-server.

El modelo está orientado a generación de texto conversacional y se distribuye con la etiqueta `endpoints_compatible`, lo que indica compatibilidad con infraestructuras de despliegue estándar. La información pública disponible es muy limitada: no se detallan idiomas soportados, datos de entrenamiento, benchmarks ni innovaciones técnicas más allá de la arquitectura heredada del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 48.000 millones de parámetros en hardware de consumo gracias a la combinación de arquitectura MoE (solo activa una fracción de parámetros por token) y cuantización Q4_K_M. No obstante, la ausencia de documentación técnica y de resultados de evaluación obliga a tratar cualquier uso en producción con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parámetros totales | 47.985.886.080 (≈48B) |
| Parámetros activos | ≈3B (según el nombre del modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | 32.768 tokens (valor de `-c` en el ejemplo de uso; no confirmado como máximo) |
| Tipos de cuantización | Q4_K_M (única disponible en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE) heredada de Qwen3.6-35B-A3B, con 47.985.886.080 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Esta configuración permite un coste computacional por token comparable a un modelo denso de 3B, mientras que la capacidad total de parámetros se aproxima a la de un modelo de 48B. La cuantización Q4_K_M reduce el peso a 29,3 GB, lo que facilita su despliegue en GPUs con 24-32 GB de VRAM.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card únicamente indica que es una compilación GGUF del modelo base y que se ejecuta con `llama-server -m ... -c 32768 --jinja`.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (soporte de plantilla Jinja mediante `--jinja`).
- Razonamiento y generación de código, asumibles por herencia de la familia Qwen3.6, aunque no confirmados en la documentación disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Inferencia local eficiente gracias a la arquitectura MoE con ~3B parámetros activos.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con una ventana de 32.768 tokens, adecuado para prototipos y entornos de desarrollo sin conexión a la nube.
- Generación de texto en estaciones de trabajo con una sola GPU: con 29,3 GB en Q4_K_M, cabe en GPUs de 32 GB (RTX 5090, A100 40GB) y permite inferencia local sin infraestructura de servidor.
- Automatización de tareas de redacción y resumen: la ventana de contexto permite procesar documentos largos y generar resúmenes o reescrituras en una sola pasada.
- Integración en pipelines de CI/CD para generación de documentación técnica: mediante llama.cpp o llama-server expuesto como API compatible con OpenAI, puede conectarse a herramientas de automatización.
- Experimentación e investigación en arquitecturas MoE: útil para estudiar el comportamiento de modelos con ~48B parámetros totales y ~3B activos en entornos con recursos limitados.
- Despliegue en edge o servidores modestos: al requerir menos VRAM que un modelo denso equivalente, permite servir un modelo de gran capacidad en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~29,3 GB solo para los pesos en Q4_K_M; se recomienda al menos 32 GB de VRAM para dejar margen a la caché KV con contexto de 32.768 tokens.
- GPU recomendadas: A100 40GB, H100, RTX 5090 (32 GB), RTX 4090 (24 GB, requiere reducir contexto u offloading parcial a CPU).
- ¿Cabe en GPU de consumo? Sí, en GPUs con 32 GB (RTX 5090) o mediante offloading parcial en GPUs de 24 GB (RTX 4090, RTX 3090).
- Opciones de despliegue: llama.cpp / llama-server (soporte oficial), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del número de expertos activados por token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keural-Lab-1108-GGUF | ≈48B | ≈3B | 32.768 (según ejemplo) | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.6-35B-A3B (base declarado) | ≈35B | ≈3B | no disponible | Apache 2.0 | Pesos originales |
| Modelo denso de ~7B | 7B | 7B | variable | variable | amplia |

La comparativa con alternativas directas no está disponible en la información proporcionada; los datos del modelo base Qwen3.6-35B-A3B se infieren únicamente del nombre citado en la model card.

## Limitaciones y advertencias

- Documentación muy escasa: no se detallan datos de entrenamiento, idiomas, sesgos ni evaluación, lo que dificulta validar su comportamiento en producción.
- Riesgo de alucinación inherente a los modelos generativos, sin métricas publicadas que lo cuantifiquen.
- Idiomas soportados no confirmados; no se garantiza un rendimiento adecuado en castellano.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors.
- El contexto máximo real no está confirmado; el valor de 32.768 procede únicamente del ejemplo de línea de comandos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial.
- El repositorio tiene muy poca tracción (96 descargas, 0 likes) y fue creado y actualizado el mismo día, lo que sugiere falta de validación por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mkd-minkeun/Keural-Lab-1108-GGUF
- Modelo base: https://huggingface.co/mkd-minkeun/Keural-Lab-1108
- llama.cpp: https://github.com/ggml-org/llama.cpp
