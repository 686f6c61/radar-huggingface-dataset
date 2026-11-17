# mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF` es una publicación de cuantizaciones GGUF generadas por mradermacher, un autor conocido en Hugging Face por convertir modelos de terceros a formatos optimizados para inferencia local. El repositorio deriva del modelo base `webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic`, un modelo de 27 mil millones de parámetros según la nomenclatura del nombre, aunque la model card no aporta detalles sobre su arquitectura, entrenamiento o procedencia real.

La ficha técnica disponible es extremadamente escasa: el repositorio no incluye pipeline declarado, licencia, idiomas soportados ni model card descriptiva más allá de los metadatos de cuantización. Los datos reales de safetensors indican 6.789.424 parámetros, una cifra incompatible con el "27B" del nombre, lo que sugiere que el tensor inspeccionado corresponde a un componente parcial (posiblemente un módulo de visión o un tensor auxiliar) y no al modelo completo.

Su relevancia es limitada y debe interpretarse con cautela: se trata de un artefacto de cuantización de un modelo derivado de la familia Qwen, con modificaciones no documentadas (los sufijos "Perplexing-Pegasus-Heretic" sugieren ajustes de fine-tuning o ablaciones de alineamiento no verificadas). No hay evidencia publicada de benchmarks, evaluación de calidad ni garantías de funcionamiento, por lo que su uso en producción no está recomendado sin una validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen, sin confirmar) |
| Parámetros totales | 27B según el nombre del repositorio; 6.789.424 según safetensors (dato parcial, no representativo del modelo completo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, small-IQ4_NL, IQ4_XS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre "Qwen3.8-27B" sugiere una variante de la familia Qwen con 27 mil millones de parámetros, pero no hay confirmación oficial de que corresponda a una arquitectura transformer densa, MoE o híbrida. Los sufijos "Perplexing-Pegasus-Heretic" apuntan a un modelo derivado mediante fine-tuning o modificaciones de alineamiento no documentadas, probablemente orientadas a reducir restricciones de rechazo (el término "Heretic" se usa en la comunidad para modelos con alineamiento alterado), pero esto es una inferencia y no un dato confirmado.

Respecto al entrenamiento, no se especifican tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La model card únicamente documenta los parámetros de la herramienta de cuantización (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas, con cuantizaciones ponderadas por imatrix. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto: capacidad presumible por herencia de la familia Qwen, no verificada en este repositorio.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten, en teoría, ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, aunque la calidad real no está validada.
- Experimentación con modelos derivados: útil para investigadores interesados en estudiar el efecto de modificaciones de alineamiento ("Heretic") sobre el comportamiento del modelo, siempre con evaluación propia.
- Pruebas de cuantización extrema: las variantes IQ1_S e IQ2_XXS permiten analizar la degradación de calidad en regímenes de muy baja precisión, un caso de interés para investigación en compresión de modelos.
- Despliegue en entornos aislados: al ser un GGUF autocontenido, puede ejecutarse offline en máquinas sin acceso a servicios en la nube, aunque sin garantías de soporte.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de 20 variantes, lo que facilita estudios de trade-off entre tamaño y perplejidad si se dispone de un conjunto de evaluación.
- Prototipado de chatbots: solo tras validación manual, dado que no hay benchmarks ni documentación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Para un modelo de 27B, las estimaciones orientativas serían aproximadamente 16-20 GB en Q4_K_M, 10-12 GB en Q2_K y 22-26 GB en Q6_K, pero estas cifras son extrapolaciones y no datos confirmados del repositorio.
- GPU recomendadas: no disponible. Para un 27B en Q4 se requerirían GPUs con 24 GB o más (RTX 3090/4090, A5000, A6000) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: posible en RTX 3090/4090 con cuantizaciones Q4 o inferiores, sujeto a verificación.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente vLLM o TGI si se dispone del modelo base en safetensors (no incluido en este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF | 27B (según nombre) | no disponible | no disponible | GGUF en HF |
| Qwen2.5-32B-Instruct (referencia de la familia) | 32B | 128K (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial) | safetensors y GGUF comunitarios |
| Gemma-2-27B-it | 27B | 8K | Gemma Terms of Use | safetensors y GGUF comunitarios |
| Mistral-Small-24B-Instruct | 24B | 32K | Apache 2.0 | safetensors y GGUF comunitarios |

La comparación es orientativa: no hay datos de rendimiento del modelo evaluado, por lo que no puede establecerse una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre arquitectura, entrenamiento, datos ni evaluación.
- Licencia no declarada: riesgo legal para uso comercial; debe consultarse la licencia del modelo base `webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic` antes de cualquier despliegue.
- Discrepancia de parámetros: el nombre indica 27B pero safetensors reporta 6.789.424, lo que impide confirmar el tamaño real y las necesidades de hardware.
- Modificaciones de alineamiento no verificadas: el sufijo "Heretic" sugiere alteraciones que podrían reducir salvaguardas, con riesgo de contenido inapropiado o sesgado.
- Sin benchmarks ni evaluación de calidad: no hay evidencia de que las cuantizaciones preserven el rendimiento del modelo base.
- Riesgo de alucinación: no evaluado; en modelos derivados sin documentación, este riesgo es especialmente alto.
- Idiomas no declarados: no puede garantizarse un rendimiento multilingüe correcto.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-16): metadato anómalo que sugiere posibles errores en la publicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Perplexing-Pegasus-Heretic-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Perfil del autor: https://huggingface.co/mradermacher
- Listado de modelos GGUF en Hugging Face: https://huggingface.co/models?sort=modified&search=gguf
