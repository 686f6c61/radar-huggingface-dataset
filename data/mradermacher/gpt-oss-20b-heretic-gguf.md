# mradermacher/gpt-oss-20b-heretic-GGUF

## Resumen
`mradermacher/gpt-oss-20b-heretic-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `p-e-w/gpt-oss-20b-heretic`, que a su vez es una variante "abliterated" (sin censura) del modelo abierto `gpt-oss-20b` de OpenAI. El modelo base emplea una arquitectura Mixture of Experts (MoE) con aproximadamente 20.900 millones de parámetros totales y alrededor de 3.600 millones de parámetros activos por token, según la información publicada por OpenAI para `gpt-oss-20b`. El trabajo de cuantización lo realiza mradermacher, un conocido publicador de quants GGUF en Hugging Face.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0), lo que permite ejecutarlo en hardware de consumo con VRAM limitada, algo imposible con los pesos originales en BF16. Al estar basado en una variante "heretic" (abliterated), el modelo elimina total o parcialmente los mecanismos de rechazo aprendidos por RLHF, lo que lo hace atractivo para investigación sobre alineación, red-teaming y generación de contenido sin restricciones, pero también plantea riesgos importantes para uso en producción.

Es importante señalar que esta ficha se refiere específicamente al repositorio GGUF de mradermacher, no al modelo original de OpenAI ni a la variante heretic de p-e-w. La licencia Apache 2.0 del modelo base se mantiene en esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible en la informacion proporcionada (el modelo base gpt-oss-20b reporta ~3,6 B activos) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base gpt-oss-20b soporta 131.072 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, MXFP4_MOE, x-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo subyacente es `gpt-oss-20b`, un transformer con arquitectura Mixture of Experts desarrollado por OpenAI y publicado como pesos abiertos. La variante `heretic` de p-e-w aplica técnicas de "abliteration" (modificación de pesos para eliminar direcciones de rechazo en el espacio de activaciones) sobre el modelo original, con el objetivo de reducir los comportamientos de negativa ante peticiones que el modelo base rechazaría. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO adicional tras la abliteración.

El repositorio de mradermacher no entrena ni modifica el modelo: únicamente genera cuantizaciones estáticas GGUF a partir de los pesos de `p-e-w/gpt-oss-20b-heretic`, empleando la herramienta de conversión de llama.cpp. No se han publicado (según la información disponible) cuantizaciones con imatrix o ponderadas para este modelo, aunque el autor indica que podrían solicitarse mediante una discusión en la comunidad.

## Capacidades
- Generación de texto conversacional en inglés, con soporte de formato chat (etiqueta `conversational`).
- Razonamiento y generación de código heredados del modelo base `gpt-oss-20b`.
- Comportamiento "uncensored"/"abliterated": menor probabilidad de rechazar peticiones que el modelo original rechazaría.
- Compatibilidad con `vllm` (etiqueta declarada por el autor) y con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante (el modelo base gpt-oss-20b lo soporta).
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.

## Casos de uso
- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta a las respuestas ante prompts sensibles, comparando con el `gpt-oss-20b` original en experimentos controlados.
- Red-teaming y evaluación de robustez: útil para generar ataques adversariales y probar defensas en sistemas de moderación, ya que produce respuestas que el modelo base rechazaría.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base aplicaría filtros.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (~15,9 GB) permiten ejecutar un MoE de ~20,9 B en GPUs con 16-24 GB de VRAM, algo inviable con los pesos BF16.
- Experimentación con cuantizaciones: el repositorio ofrece 11 niveles de cuantización para estudiar el impacto de la compresión en la calidad de un MoE, con notas del autor sobre calidad relativa (Q6_K "very good quality", Q8_0 "best quality").
- Prototipado de asistentes conversacionales en inglés: gracias al formato chat y a la compatibilidad con llama.cpp/Ollama, puede integrarse rápidamente en demos locales sin depender de APIs externas.
- Análisis de sesgos y contenido dañino: permite generar corpus de respuestas no filtradas para entrenar clasificadores de toxicidad o estudiar sesgos del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y caché KV):
  - Q2_K / Q3_K_S / IQ4_XS: ~12,2-12,3 GB → cabe en GPUs de 16 GB.
  - Q3_K_M / Q3_K_L: ~13,0-13,4 GB → cabe en GPUs de 16 GB.
  - Q4_K_S / Q4_K_M: ~14,8-15,9 GB → cabe en GPUs de 16 GB (ajustado) o 24 GB.
  - Q5_K_S / Q5_K_M: ~16,0-17,0 GB → requiere 24 GB.
  - Q6_K / Q8_0: ~22,3-22,4 GB → requiere 24 GB (ajustado) o 32 GB+.
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q8; RTX 4080 / 4070 Ti Super (16 GB) para Q2-Q4; A100 40/80 GB o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 4070 Ti Super y, con cuantizaciones bajas, en GPUs de 12-16 GB (con posible offload parcial a CPU).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y vLLM (etiqueta declarada por el autor; verificar compatibilidad con GGUF MoE en la versión concreta).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con ~3,6 B parámetros activos (según el modelo base), el throughput debería ser superior al de un modelo denso de 20 B, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gpt-oss-20b-heretic-GGUF (este) | ~20,9 B (MoE) | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés |
| openai/gpt-oss-20b | ~20,9 B (MoE) | 131.072 | Apache 2.0 | safetensors | Modelo base original, con alineación |
| p-e-w/gpt-oss-20b-heretic | ~20,9 B (MoE) | no disponible | Apache 2.0 | safetensors | Variante abliterated en pesos completos |
| Otras variantes GGUF de gpt-oss-20b (p. ej. de otros cuantizadores) | ~20,9 B (MoE) | 131.072 | Apache 2.0 | GGUF | Sin abliterar, con cuantizaciones equivalentes |

La comparación con modelos de otros fabricantes (p. ej. Llama 3.x, Qwen) no se incluye por falta de datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias
- Modelo "abliterated": la eliminación de mecanismos de rechazo puede producir contenido ofensivo, ilegal o peligroso; no es apto para uso directo en producción orientada al público sin moderación adicional.
- Riesgo de alucinación: inherente al modelo base; la abliteración no lo reduce y puede incrementarlo en dominios donde el modelo original se negaba por falta de conocimiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; la abliteración puede vulnerar términos de uso de servicios derivados y políticas de plataformas.
- Sesgos: heredados del modelo base y potencialmente amplificados al eliminar capas de alineación.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_M o superior para uso serio.
- No se han publicado benchmarks específicos de esta variante; el rendimiento real puede diferir del `gpt-oss-20b` original.
- El repositorio ocupa 182,4 GB; descargar solo el archivo GGUF necesario.
- Compatibilidad con vLLM para GGUF MoE puede requerir versiones específicas; verificar antes de desplegar.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/gpt-oss-20b-heretic-GGUF
- Modelo base (variante heretic): https://huggingface.co/p-e-w/gpt-oss-20b-heretic
- Página de descargas del autor: https://hf.tst.eu/model#gpt-oss-20b-heretic-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
