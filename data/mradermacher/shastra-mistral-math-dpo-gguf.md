# mradermacher/Shastra-Mistral-Math-DPO-GGUF

## Resumen

Shastra-Mistral-Math-DPO-GGUF es la colección de cuantizaciones GGUF, generada por mradermacher, del modelo shastraai/Shastra-Mistral-Math-DPO. Se trata de un ajuste fino de Mistral de 7B parámetros (7.241.732.096 parámetros según los pesos en safetensors) orientado a matemáticas y refinado mediante DPO (Direct Preference Optimization) sobre el modelo base de shastraai. El repositorio original no incluye model card técnica detallada, por lo que gran parte de las especificaciones de entrenamiento y evaluación no están disponibles.

El valor práctico de este repositorio es la disponibilidad de pesos en formato GGUF en múltiples niveles de cuantización (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles. Es relevante para quienes necesitan un modelo especializado en razonamiento matemático con despliegue local y bajo consumo de VRAM.

La licencia no está declarada en la información disponible, lo que constituye una limitación importante para uso comercial. El modelo está etiquetado únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Mistral, según el nombre del modelo base; detalles no disponibles) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es shastraai/Shastra-Mistral-Math-DPO, un ajuste fino de un modelo Mistral de 7B parámetros. Por el nombre se infiere una arquitectura transformer decoder-only de la familia Mistral, con atención de ventana deslizante y posible uso de SwiGLU y RMSNorm, aunque la model card del repositorio GGUF no documenta estos detalles. El sufijo "Math-DPO" indica un ajuste específico para tareas matemáticas seguido de un refinamiento con DPO sobre pares de preferencias.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF adicional ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El repositorio de mradermacher es exclusivamente de cuantización estática: no modifica la arquitectura ni el entrenamiento, solo convierte los pesos a GGUF con distintos niveles de precisión. Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio Shastra-Mistral-Math-DPO-i1-GGUF.

## Capacidades

- Generación de texto en inglés con especialización declarada en matemáticas (por el nombre del modelo base).
- Razonamiento matemático y resolución de problemas, presumiblemente reforzado mediante DPO.
- Generación de código y texto general, heredada del modelo Mistral subyacente (no verificado en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo puede emplearse para resolver ejercicios de álgebra, cálculo y aritmética en entornos sin conexión, aprovechando las cuantizaciones Q4_K_M (4,5 GB) que caben en GPUs de consumo.
- Asistente de estudio para estudiantes: integrado en una aplicación de escritorio, el modelo puede explicar paso a paso la resolución de problemas matemáticos en inglés, con latencia baja gracias a los cuantizados Q4 o Q5.
- Generación de material didáctico: creación de enunciados y soluciones de problemas matemáticos para plataformas educativas, con revisión humana posterior dado el riesgo de alucinación.
- Prototipado de pipelines de razonamiento matemático: uso como componente en sistemas de verificación simbólica o como generador de borradores de demostraciones antes de validación formal.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en portátiles con 8 GB de RAM o GPUs integradas, útil para demos y pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización del mismo modelo, lo que facilita estudios de degradación de calidad frente a tamaño en tareas matemáticas.
- Filtrado y clasificación de contenido matemático: uso del modelo para etiquetar o resumir problemas matemáticos en corpus, siempre con validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo, con overhead adicional de contexto):
  - Q2_K: ~3 GB
  - Q3_K_M: ~4 GB
  - Q4_K_M: ~5 GB
  - Q5_K_M: ~6 GB
  - Q6_K: ~7 GB
  - Q8_0: ~9 GB
  - f16: ~15 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 o A100 para Q8_0 y f16; H100 no necesaria para este tamaño.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB (Q2_K) hasta RTX 4090 (f16). También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa; requerirían los safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shastra-Mistral-Math-DPO-GGUF | 7,24B | no disponible | no disponible | GGUF | Especializado en matemáticas, solo inglés |
| Mistral-7B-Instruct-v0.2 (GGUF, vía mradermacher/TheBloke) | 7,24B | 32K (según model card pública de Mistral) | Apache 2.0 | GGUF | Modelo generalista, licencia permisiva |
| MetaMath-Mistral-7B (GGUF) | 7,24B | 32K (heredado de Mistral) | Apache 2.0 (heredada) | GGUF | Ajuste matemático sobre Mistral, con benchmarks publicados |
| WizardMath-7B-v1.1 (GGUF) | 7,24B | 4K (heredado de Mistral) | Apache 2.0 (heredada) | GGUF | Especializado en matemáticas, benchmarks GSM8K/MATH publicados |

La comparativa se basa en características públicas de modelos de la misma familia y tamaño; no se dispone de datos de rendimiento del modelo evaluado para contrastar.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base (shastraai) antes de usarlo en producción.
- Solo inglés: no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinación: los modelos matemáticos ajustados con DPO pueden producir soluciones plausibles pero incorrectas; se recomienda verificación simbólica o revisión humana.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Mistral y del dataset de preferencias, no auditados en la información disponible.
- Contexto: no disponible; si el modelo base sigue la configuración estándar de Mistral, podría ser de 8K o 32K, pero no está confirmado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas como MetaMath-Mistral o WizardMath.
- Repositorio de cuantización: el mantenimiento depende de mradermacher; la calidad de las cuantizaciones IQ y K-quants varía y las de menor tamaño (Q2_K, Q3_K_M) degradan notablemente la calidad.
- Fecha de actualización del repositorio (2026-11-18) posterior a la creación (2025-03-11): posible re-subida o cambios no documentados en el contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Shastra-Mistral-Math-DPO-GGUF
- Modelo base: https://huggingface.co/shastraai/Shastra-Mistral-Math-DPO
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Shastra-Mistral-Math-DPO-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Shastra-Mistral-Math-DPO-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
