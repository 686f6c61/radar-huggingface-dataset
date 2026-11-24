# mradermacher/SenseNova-RoboRSI-27B-GGUF

## Resumen

SenseNova-RoboRSI-27B-GGUF es una cuantización estática en formato GGUF del modelo SenseNova-RoboRSI-27B, desarrollado originalmente por SenseNova (el equipo de modelos de IA de SenseTime) y convertido a GGUF por el usuario mradermacher. El modelo base cuenta con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los safetensors de referencia), lo que lo sitúa en la categoría de modelos densos de gran tamaño, y el repositorio GGUF ocupa 28,2 GB en total al incluir múltiples variantes de cuantización.

El nombre "RoboRSI" sugiere un enfoque orientado a robótica o a razonamiento iterativo (RSI, posiblemente *Reasoning / Self-Improvement*), aunque la model card disponible no detalla la arquitectura interna, los datos de entrenamiento ni las capacidades específicas más allá de la etiqueta "conversational". El modelo está etiquetado como compatible con endpoints y está pensado para su uso conversacional.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B parámetros en hardware de consumo o en entornos con recursos limitados mediante cuantización GGUF, algo imposible con los pesos completos en precisión nativa. No obstante, la información pública disponible es muy escasa, por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido por el tamaño y el formato; no confirmado en la model card) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |
| Tamano del repositorio | 28,2 GB |
| Version de cuantizacion | 2 |
| Tipo de conversion | hf (desde pesos Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base SenseNova-RoboRSI-27B en la documentación proporcionada. Por el número de parámetros (~26,9B) y el pipeline conversacional, se trata presumiblemente de un transformer denso, pero la model card del repositorio GGUF no confirma ni la arquitectura exacta, ni el número de capas, ni la dimensión de los embeddings, ni el tipo de atención.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición del dataset), sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). El único dato técnico relevante de la conversión es que se generaron cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, partiendo de los pesos en formato Hugging Face del modelo original. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento: el sufijo "RSI" del nombre sugiere capacidades de razonamiento iterativo o auto-mejora, aunque no se detalla en la información disponible.
- Posible orientación a robótica: el prefijo "Robo" del nombre apunta a un uso en entornos robóticos o de razonamiento espacial/embodied, sin confirmación documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el nombre sugiere razonamiento, pero no hay confirmación).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue conversacional en local: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en una estación de trabajo con GPU de consumo para prototipar asistentes conversacionales sin depender de la nube.
- Investigación sobre razonamiento: si el modelo implementa de hecho capacidades de razonamiento iterativo (según sugiere el nombre RSI), puede emplearse como banco de pruebas para estudiar cadenas de razonamiento y auto-corrección en modelos de ~27B.
- Evaluación de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite comparar la degradación de calidad entre Q2_K y Q8_0 sobre el mismo modelo base, un caso de uso típico para investigadores que estudian el impacto de la cuantización.
- Prototipado de robótica y agentes embodied: si el modelo base está orientado a robótica, las versiones GGUF permiten integrarlo en simuladores o en hardware de borde con recursos limitados.
- Fine-tuning y destilación: las cuantizaciones de mayor precisión (Q8_0, x-f16) pueden servir como referencia para comparar con versiones afinadas o destiladas del mismo modelo.
- Despliegue en entornos sin GPU dedicada: las variantes Q2_K y Q3_K_S reducen el peso lo suficiente como para intentar inferencia en CPU con llama.cpp, útil para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según el tamaño del modelo y la cuantización):
  - Q2_K: ~10-11 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~12-14 GB
  - Q4_K_S / Q4_K_M / IQ4_XS: ~15-17 GB
  - Q5_K_S / Q5_K_M: ~18-20 GB
  - Q6_K: ~21-23 GB
  - Q8_0: ~28-29 GB
  - x-f16: ~54 GB
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) puede ejecutar hasta Q6_K con comodidad y Q8_0 con offloading parcial; RTX 3090 (24 GB) similar.
  - Profesional: A100 40/80 GB, H100 80 GB para x-f16 y Q8_0 sin offloading.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 16-24 GB; las variantes Q2/Q3 caben en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para este formato.
- Latencia y throughput: no disponibles; dependen en gran medida del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B-GGUF | ~26,9B | no disponible | no disponible | GGUF | Esta ficha |
| Modelos densos de ~27B en GGUF (p. ej. Gemma 2 27B, Qwen2.5 32B) | 27-32B | 8K-128K (según modelo) | variable | GGUF, safetensors | Alternativas establecidas con documentación y benchmarks públicos |
| Modelos MoE de tamaño similar (p. ej. Mixtral 8x7B) | ~47B totales, ~13B activos | 32K | Apache 2.0 | GGUF, safetensors | Mayor eficiencia por token activo, pero no es comparable en arquitectura |

No se dispone de datos de rendimiento del modelo para una comparación cuantitativa fiable; la comparativa anterior es meramente estructural.

## Limitaciones y advertencias

- Información pública muy limitada: no hay model card detallada, benchmarks ni documentación de la arquitectura, lo que dificulta evaluar su calidad antes de desplegarlo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (sensenova/SenseNova-RoboRSI-27B) antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin datos de alineación no se puede estimar su magnitud.
- Sesgos: no documentados; se desconoce la composición del corpus de entrenamiento.
- Idiomas: no confirmados; no se garantiza un buen rendimiento en castellano.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la calidad y la coherencia, especialmente en tareas de razonamiento.
- Contexto: se desconoce la longitud máxima soportada; no asumir ventanas largas sin verificación.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-23): conviene verificar la autenticidad y vigencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SenseNova-RoboRSI-27B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
