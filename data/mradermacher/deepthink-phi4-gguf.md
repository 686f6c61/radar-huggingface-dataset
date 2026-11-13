# mradermacher/DeepThink-Phi4-GGUF

## Resumen

DeepThink-Phi4-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo EpistemeAI/DeepThinkers-Phi4, publicadas por el usuario mradermacher. El modelo base es un fine-tune de la familia Phi-4 de Microsoft, con 14.659.507.200 parámetros totales (aproximadamente 14,7 mil millones), orientado a generación de texto conversacional y razonamiento en inglés. Esta versión GGUF no introduce cambios en los pesos ni en el comportamiento del modelo, sino que los reempaqueta para su uso con llama.cpp y otras herramientas compatibles con GGUF.

La relevancia de esta publicación radica en que facilita el despliegue del modelo en hardware de consumo y en entornos donde no se dispone de GPUs de datacenter. Al ofrecer cuantizaciones desde Q2_K (5,7 GB) hasta Q8_0 (15,7 GB), permite ajustar el equilibrio entre calidad y requisitos de memoria. El repositorio ocupa 100,7 GB en total e incluye además una variante con cuantización ponderada/imatrix publicada en un repositorio separado.

La información disponible sobre el modelo base es limitada: no se detallan en la model card los datos de entrenamiento, la longitud de contexto ni los resultados de benchmarks. La licencia es MIT, lo que permite uso comercial sin restricciones significativas, y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi-4, según el modelo base; detalles no disponibles) |
| Parametros totales | 14.659.507.200 (≈14,7 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base EpistemeAI/DeepThinkers-Phi4 es un fine-tune de la familia Phi-4, por lo que hereda la arquitectura transformer densa de dicha familia. Los tags del repositorio indican el uso de Unsloth y TRL en el proceso de ajuste, lo que sugiere un fine-tuning supervisado, posiblemente con optimizaciones de memoria propias de Unsloth. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta publicación concreta no modifica la arquitectura ni el entrenamiento: se limita a la conversión a GGUF y a la cuantización estática de los pesos. Las cuantizaciones IQ (como IQ4_XS) emplean técnicas de cuantización con importancia, mientras que las series Q_K y Q8_0 son cuantizaciones k-quant estándar de llama.cpp. No se documentan innovaciones técnicas adicionales en la model card.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos multi-turno según el tag `conversational`.
- Razonamiento y resolución de problemas, heredado del modelo base Phi-4 (no verificado con benchmarks en esta publicación).
- Compatibilidad con text-generation-inference y transformers, según los tags del repositorio.
- Ejecución mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (9,0 GB) el modelo puede ejecutarse en una GPU de consumo con 12 GB de VRAM, lo que permite prototipar asistentes conversacionales sin depender de servicios en la nube.
- Experimentación académica con modelos de ~14 B: las cuantizaciones Q5_K_M y Q6_K ofrecen un equilibrio razonable entre fidelidad y tamaño para estudiar el comportamiento de fine-tunes de Phi-4 en tareas de razonamiento.
- Integración en pipelines de generación de texto con llama.cpp: la disponibilidad de múltiples niveles de cuantización permite elegir el tamaño según las restricciones de latencia y memoria del servicio.
- Servicios de inferencia en CPU: las cuantizaciones Q2_K y Q3_K_S (5,7–6,6 GB) son viables en servidores sin GPU, útiles para entornos de desarrollo o pruebas de integración.
- Evaluación comparativa de cuantizaciones: el repositorio incluye desde Q2_K hasta Q8_0, lo que facilita medir la degradación de calidad (perplejidad) según el nivel de cuantización en un mismo modelo.
- Fine-tuning posterior o destilación: al estar bajo licencia MIT y en formato GGUF, puede servir como referencia para comparar el comportamiento del modelo base frente a versiones cuantizadas en tareas concretas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, con overhead adicional de contexto y KV cache):
  - Q2_K: ~5,7 GB
  - Q3_K_S: ~6,6 GB
  - Q3_K_M: ~7,3 GB
  - Q3_K_L: ~7,9 GB
  - IQ4_XS: ~8,2 GB
  - Q4_K_S: ~8,5 GB
  - Q4_K_M: ~9,0 GB
  - Q5_K_S: ~10,3 GB
  - Q5_K_M: ~10,5 GB
  - Q6_K: ~12,1 GB
  - Q8_0: ~15,7 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar cualquier cuantización del repositorio; una RTX 4060 Ti de 16 GB cubre hasta Q8_0 con margen ajustado; GPUs de 12 GB cubren hasta Q5_K_M.
- Cabe en GPU de consumo: sí, desde tarjetas de 8 GB (con cuantizaciones Q2/Q3) hasta 16–24 GB para las de mayor calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags también mencionan text-generation-inference y transformers (para el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepThink-Phi4-GGUF (esta ficha) | ~14,7 B | no disponible | MIT | GGUF | Fine-tune de Phi-4 cuantizado |
| Phi-4 (Microsoft) | ~14,7 B | no disponible en esta ficha | MIT | safetensors | Modelo base de la familia |
| EpistemeAI/DeepThinkers-Phi4 | ~14,7 B | no disponible | MIT | safetensors | Modelo base de este GGUF |
| Otras cuantizaciones GGUF de Phi-4 (p. ej., de otros quantizadores) | ~14,7 B | no disponible | MIT | GGUF | Alternativas equivalentes en formato |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se han publicado benchmarks del fine-tune, por lo que no puede verificarse su calidad frente al Phi-4 original ni frente a otros fine-tunes.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda evaluar en el dominio de aplicación antes de producción.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales, no documentadas aquí.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para un equilibrio rápido/calidad.
- El repositorio tiene un volumen de descargas bajo (150) y ningún "like", lo que reduce la validación comunitaria disponible.
- No se especifica la longitud de contexto soportada, un dato crítico para planificar despliegues con ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepThink-Phi4-GGUF
- Modelo base: https://huggingface.co/EpistemeAI/DeepThinkers-Phi4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepThink-Phi4-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#DeepThink-Phi4-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
