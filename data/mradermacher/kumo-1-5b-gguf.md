# mradermacher/Kumo-1.5B-GGUF

## Resumen

Kumo-1.5B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Kumo-1.5B, publicada por el usuario mradermacher en HuggingFace. Se trata, por tanto, de un artefacto derivado: el repositorio no contiene pesos originales ni documentación técnica propia, sino conversiones del modelo base desarrollado por Tomopas, orientadas a su uso con llama.cpp y herramientas compatibles con GGUF.

El modelo base tiene 1.500 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en hardware de consumo. Sin embargo, la model card del repositorio de cuantización no aporta información sobre arquitectura, datos de entrenamiento, licencia, idiomas ni rendimiento, por lo que la mayor parte de las especificaciones técnicas no pueden confirmarse a partir de la información disponible.

La relevancia de este repositorio es operativa: ofrece hasta doce variantes de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS), lo que permite desplegar el modelo en entornos con restricciones de memoria muy distintas. Para evaluar el modelo en sí, es necesario consultar el repositorio original de Tomopas/Kumo-1.5B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1,5 mil millones (según el nombre del modelo) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en la documentación disponible. El nombre y el tamaño (1,5B) sugieren un transformer decoder-only de escala pequeña, pero no se confirma ni la familia arquitectónica, ni el mecanismo de atención, ni si emplea técnicas como GQA o atención lineal.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüismo), ni sobre si se aplicaron fases de ajuste supervisado, RLHF o DPO. La única información técnica verificable del repositorio es el proceso de cuantización: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión desde pesos en formato HuggingFace con cuantización por tensor de salida.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 1,5B, sin detalles confirmados sobre calidad o dominio.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de 1,5B en GPUs con 4-6 GB de VRAM o en CPU, útil para prototipos locales sin conexión.
- Experimentación con llama.cpp: el formato GGUF facilita pruebas rápidas de prompts y plantillas en entornos de desarrollo sin infraestructura GPU dedicada.
- Aplicaciones embebidas y edge computing: el tamaño reducido y las cuantizaciones de 2-4 bits hacen viable la inferencia en dispositivos con memoria limitada, como mini-PC o sistemas ARM.
- Filtrado y clasificación de texto a pequeña escala: un modelo de 1,5B puede emplearse para tareas de etiquetado o moderación preliminar donde la latencia importa más que la precisión máxima.
- Generación de texto asistida en herramientas de escritorio: integración en editores o asistentes locales mediante bindings de llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre F16 y Q2_K sobre el mismo modelo base, útil para investigación en compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización): F16 ~3 GB; Q8_0 ~1,6 GB; Q6_K ~1,2 GB; Q5_K_M ~1,1 GB; Q4_K_M ~0,9 GB; Q3_K_M ~0,75 GB; Q2_K ~0,6 GB. Estas cifras son estimaciones por tamaño de pesos y no incluyen el overhead del contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits o superiores; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas de los últimos años, e incluso en iGPUs con memoria unificada para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, text-generation-webui y servidores compatibles con llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este tipo de artefactos.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kumo-1.5B (GGUF, este repo) | 1,5B | no disponible | no disponible | GGUF | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, Ollama |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, Ollama |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | HuggingFace, Ollama |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para Kumo-1.5B. Los tres modelos alternativos cuentan con documentación técnica completa y licencias verificables, a diferencia de este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan arquitectura, datos de entrenamiento, idiomas ni evaluación, lo que impide validar el modelo para producción.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; es imprescindible consultar el repositorio original Tomopas/Kumo-1.5B antes de cualquier despliegue.
- Riesgo de alucinación: en modelos de 1,5B es habitualmente elevado, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: sin información sobre el corpus de entrenamiento no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas no confirmados: no consta qué lenguas soporta el modelo base.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos pequeños; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validación por terceros.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del artefacto.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Kumo-1.5B-GGUF
- Modelo base: https://huggingface.co/Tomopas/Kumo-1.5B
