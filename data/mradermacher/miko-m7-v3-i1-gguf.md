# mradermacher/Miko-M7-V3-i1-GGUF

## Resumen

Miko-M7-V3-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Miko-M7-V3, publicada por el usuario mradermacher en Hugging Face. El modelo base, alojado en el repositorio ricer0ll/Miko-M7-V3, cuenta con 7.241.732.096 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 7B. Esta versión i1 emplea cuantización con imatrix (importance matrix), una técnica que calibra la pérdida de precisión durante la cuantización para preservar mejor la calidad en comparaciones con cuantizaciones estándar.

El repositorio ofrece un abanico amplio de niveles de cuantización, desde IQ1_S e IQ2_XXS hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de gama de entrada con poca VRAM hasta configuraciones más holgadas. El tamaño total del repositorio es de 74,0 GB, coherente con la suma de todas las variantes publicadas.

La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, arquitectura detallada ni datos de entrenamiento en la model card. La ficha que sigue refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer presumible por el tamano, sin confirmar) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 74,0 GB (todas las variantes) |
| Metodo de cuantizacion | imatrix (importance matrix), quantize_version 2 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Miko-M7-V3 en la documentación proporcionada. El recuento de parámetros (7.241.732.096) es consistente con un modelo denso de aproximadamente 7B, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco constan detalles sobre el corpus de entrenamiento, el número de tokens procesados ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

Lo único documentado en esta ficha es el proceso de cuantización: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos Hugging Face a GGUF mediante la herramienta de cuantización de llama.cpp, con cuantizaciones ponderadas por imatrix. La etiqueta `tags: nicoboss` aparece en los metadatos de la model card, pero no se aclara su significado técnico.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje de ~7B parámetros, por lo que se espera capacidad de generación de texto general, aunque no hay documentación que detalle su calidad.
- Razonamiento y matemáticas: no disponible; no se documentan capacidades específicas.
- Generación de código: no disponible; no se documenta soporte explícito.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad de despliegue: al estar en formato GGUF, es compatible con llama.cpp y con endpoints compatibles (etiqueta `endpoints_compatible`).

## Casos de uso

- Despliegue en hardware de gama de entrada: las variantes IQ1_S, IQ2_XXS e IQ2_M permiten ejecutar un modelo de ~7B en GPUs con 4-6 GB de VRAM o incluso en CPU con RAM limitada, útil para prototipado y pruebas locales.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q4_0, Q4_1 y Q4_K_S son adecuadas para ejecución en CPU con buen equilibrio entre tamaño y calidad, por ejemplo en estaciones de trabajo sin GPU dedicada.
- Servicios de generación de texto autoalojados: el formato GGUF y la etiqueta `endpoints_compatible` permiten integrar el modelo en servidores compatibles con la API de llama.cpp para tareas de generación de texto genérica.
- Evaluación comparativa de cuantizaciones: al ofrecer 24 variantes, el repositorio sirve para medir el impacto de la cuantización con imatrix en la calidad de salida de un mismo modelo base.
- Experimentación académica con modelos de ~7B: útil para investigadores que necesitan un modelo pequeño y desplegable en local para pruebas de prompting, evaluación de sesgos o análisis de comportamiento.
- Sustitución de modelos propietarios en entornos con restricciones de red: al poder ejecutarse completamente en local, encaja en escenarios donde no se permite enviar datos a APIs externas, siempre que la licencia del modelo base lo permita (licencia no disponible, verificar antes de uso comercial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de cuantización y overhead de contexto):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 2-3 GB para los pesos, más overhead de contexto; apto para GPUs de 4-6 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: en torno a 3-4 GB para los pesos; apto para GPUs de 6-8 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: en torno a 4-5 GB para los pesos; apto para GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
  - Q5_K_S / Q5_K_M: en torno a 5-6 GB para los pesos; apto para GPUs de 8-12 GB.
  - Q6_K: en torno a 6-7 GB para los pesos; recomendable GPU de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar cualquier variante con contexto amplio, mientras que una RTX 3060 de 12 GB cubre hasta Q6_K con margen limitado.
- ¿Cabe en GPU de consumo? Sí, la mayoría de variantes caben en GPUs de consumo de 8-12 GB; las variantes IQ1/IQ2 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (nativo), Ollama (importando el GGUF), servidores compatibles con la API de llama.cpp, y cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base Miko-M7-V3 ni sobre sus características (contexto, licencia, rendimiento), por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Miko-M7-V3-i1-GGUF | 7.241.732.096 | no disponible | no disponible | GGUF |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (ricer0ll/Miko-M7-V3) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce qué idiomas cubre el modelo y con qué calidad; no se debe asumir un buen rendimiento en castellano.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real del modelo es desconocida.
- Riesgo de alucinación: al no documentarse el entrenamiento ni las fases de alineación, no se puede evaluar la fiabilidad factual del modelo.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ2_XXS e IQ2_XS pueden degradar notablemente la calidad de salida; conviene validar la variante elegida con tareas representativas antes de usarla.
- Repositorio de cuantizaciones, no modelo original: este repositorio es una derivación de terceros; los problemas de calidad o comportamiento deben contrastarse con el modelo base.
- Metadatos escasos: la model card no incluye información sobre sesgos, contexto máximo ni uso previsto, lo que dificulta una evaluación de riesgos rigurosa.
- Fecha de creación futura en los metadatos (2026-11-17): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Miko-M7-V3-i1-GGUF
- Modelo base: https://huggingface.co/ricer0ll/Miko-M7-V3
