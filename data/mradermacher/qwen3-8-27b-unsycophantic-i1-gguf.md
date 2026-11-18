# mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo base `jbowman512/Qwen3.8-27B-unsycophantic`. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización en formato GGUF pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). El nombre sugiere un ajuste fino de un supuesto Qwen3 de 27B orientado a reducir el comportamiento "sycophantic" (adulador), es decir, a evitar que el modelo valide sistemáticamente las premisas del usuario.

La información disponible en el repositorio es muy escasa: la model card se limita a metadatos de la herramienta de cuantización (etiquetas `quantize_version`, `output_tensor_quantised`, `convert_type`, y la lista de cuantizaciones generadas). No se publican detalles sobre el entrenamiento, la licencia, los idiomas soportados ni el pipeline. El dato de parámetros totales reportado en safetensors (6.789.424) es inconsistente con el nombre del modelo (27B) y con el tamaño del repositorio (0,0 GB), por lo que debe tratarse con cautela.

Por tanto, esta ficha describe el repositorio como artefacto de cuantización y advierte explícitamente sobre los datos no disponibles. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware se basa en inferencias a partir del nombre y del ecosistema GGUF, no en documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, segun el nombre "Qwen3.8-27B") |
| Parametros totales | no disponible de forma fiable; el campo safetensors reporta 6.789.424, inconsistente con el nombre (27B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `jbowman512/Qwen3.8-27B-unsycophantic`. El nombre sugiere una variante de la familia Qwen3 con aproximadamente 27.000 millones de parámetros, pero no se confirma en la documentación. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineación. El único indicio es el sufijo "unsycophantic", que apunta a un ajuste orientado a reducir la adulación y fomentar respuestas críticas o discrepantes.

El repositorio en sí documenta únicamente el proceso de cuantización: la cabecera indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que se partió de pesos en formato Hugging Face y se convirtieron a GGUF. Las cuantizaciones son "weighted/imatrix", es decir, generadas con una matriz de importancia para mejorar la calidad en bits bajos. No se especifica la herramienta exacta (probablemente llama.cpp), ni si se saltó la conversión de `mmproj` (el campo `skip_mmproj` está vacío).

## Capacidades

- Generación de texto y razonamiento: no disponible de forma documentada; se infiere del modelo base, pero no hay confirmación.
- Código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento "unsycophantic": el nombre indica un ajuste para reducir la adulación, pero no se documenta su alcance ni su eficacia.

## Casos de uso

- Despliegue local con llama.cpp: las cuantizaciones GGUF (desde Q2_K hasta Q6_K) permiten ejecutar el modelo en hardware de consumo, aunque el tamaño real de 27B exigiría al menos 16-24 GB de VRAM/RAM según la cuantización. Adecuado para experimentación offline.
- Evaluación de robustez frente a premisas erróneas: si el ajuste "unsycophantic" funciona como se espera, podría usarse para probar cómo responde el modelo a afirmaciones falsas del usuario, aunque no hay evidencia publicada.
- Integración en Ollama o LM Studio: al ser GGUF, se puede importar directamente en estas herramientas para prototipado rápido sin infraestructura dedicada.
- Investigación sobre alineación y adulación: el repositorio puede servir como artefacto para comparar respuestas de un modelo ajustado frente a uno estándar, siempre que se localice el modelo base original.
- Pruebas de cuantización: útil para estudiar la degradación de calidad entre Q2_K y Q6_K en un modelo de ~27B, si se dispone de la referencia sin cuantizar.
- No se recomienda para producción sin antes verificar licencia, idiomas y comportamiento real, dado que no hay documentación ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~27B en GGUF: Q2_K ~10-12 GB, Q4_K_M ~16-18 GB, Q6_K ~22-24 GB (estimaciones basadas en el tamaño típico, no confirmadas para este repositorio).
- GPU recomendadas: no disponible. Para cuantizaciones Q4-Q6 de 27B se requerirían GPUs con 24 GB o más (RTX 3090/4090, A6000, A100 40GB) o descarga parcial a CPU.
- ¿Cabe en GPU de consumo? Posiblemente en RTX 3090/4090 con cuantizaciones bajas (Q2_K, IQ3), pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (koboldcpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables documentados en la información proporcionada, y el modelo base no está descrito.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si se permite uso comercial.
- El número de parámetros reportado (6.789.424) es incoherente con el nombre "27B" y con el tamaño del repositorio (0,0 GB); no debe tomarse como dato fiable.
- No hay información sobre idiomas soportados, sesgos, riesgo de alucinación ni calidad del ajuste "unsycophantic".
- Al ser una cuantización de un modelo de terceros, la calidad depende del modelo base y del proceso de cuantización; las versiones de 2-3 bits pueden degradar notablemente el rendimiento.
- No se documenta el pipeline ni la herramienta de conversión, lo que dificulta la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- No se debe asumir que el modelo base sea realmente Qwen3 ni que tenga 27B sin verificar el repositorio original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
