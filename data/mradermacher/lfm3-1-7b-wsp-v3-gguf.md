# mradermacher/LFM3-1.7B-WSP-V3-GGUF

## Resumen

LFM3-1.7B-WSP-V3-GGUF es una republicación en formato GGUF de los pesos del modelo Sayansantra/LFM3-1.7B-WSP-V3, realizada por el usuario mradermacher, especializado en generar cuantizaciones estáticas de modelos para su uso con llama.cpp y ecosistemas compatibles. El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) con aproximadamente 1.700 millones de parámetros, un tamaño que lo sitúa en la franja de modelos compactos aptos para hardware de consumo.

La relevancia de esta ficha radica en el formato de distribución: el repositorio original contiene los pesos en precisión completa o semiprecisión, mientras que esta versión ofrece trece variantes de cuantización (desde Q2_K hasta Q8_0, pasando por x-f16 e IQ4_XS), lo que permite desplegar el modelo en GPU con VRAM limitada o incluso en CPU. No obstante, la información publicada por el autor de la cuantización es extremadamente escasa: no se documentan licencia, idiomas, pipeline ni detalles del proceso de entrenamiento del modelo base.

Al tratarse de una conversión de pesos y no de un modelo original, los méritos técnicos de arquitectura y entrenamiento corresponden al modelo LFM3-1.7B-WSP-V3 de Sayansantra, del que no se dispone de model card detallada en la información proporcionada. Cualquier evaluación rigurosa de capacidades debería remitirse al repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3; arquitectura exacta no documentada en la informacion proporcionada) |
| Parametros totales | aproximadamente 1.700 millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-1.7B-WSP-V3 en los datos proporcionados. El nombre sugiere la pertenencia a la familia LFM3 de Liquid AI, pero no se confirma en la model card del repositorio de cuantización, que se limita a indicar que se trata de "static quants" del modelo Sayansantra/LFM3-1.7B-WSP-V3. Los metadatos incrustados en la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) confirman que el proceso consistió en convertir pesos desde formato Hugging Face a GGUF y aplicar cuantización estática de tensores.

Respecto al entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO, posibles innovaciones como decodificación especulativa o atención lineal), no hay información disponible. Tampoco se documenta el sufijo "WSP-V3", que podría corresponder a una variante o fine-tuning específico del autor original, pero esto no se puede verificar con los datos disponibles.

## Capacidades

- Generación de texto autoregresiva: capacidad básica esperada de un modelo de 1.700 millones de parámetros, si bien no se documentan evaluaciones concretas.
- Razonamiento y conocimiento general: no disponible (sin benchmarks publicados en la información proporcionada).
- Generación de código: no disponible (sin datos que lo confirmen).
- Matemáticas: no disponible (sin datos que lo confirmen).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: al ofrecerse en cuantizaciones Q4_K_M, Q5_K_M e IQ4_XS, el modelo puede ejecutarse en GPUs con 4-8 GB de VRAM o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipos locales y entornos sin aceleradores dedicados.
- Experimentación e investigación: investigadores que necesiten comparar variantes de cuantización sobre un mismo modelo base pueden usar este repositorio para medir la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sin tener que generar las cuantizaciones por su cuenta.
- Generación de texto en local para asistentes personales: con contexto corto y tareas de redacción sencilla, un modelo de 1.700 millones en Q4_K_M puede integrarse en aplicaciones de escritorio o CLI mediante llama.cpp u Ollama.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no está pensado para entrenamiento, variantes como x-f16 permiten servir como punto de partida para LoRA o adaptadores en flujos que reconvierten a safetensors.
- Servicio de inferencia en CPU para entornos air-gapped: la cuantización Q4_K_S permite ejecutar el modelo en servidores sin GPU, útil en despliegos con restricciones de hardware o seguridad.
- Pruebas de integración en pipelines de CI: al ser un artefacto pequeño (modelo de 1.700 millones en Q2_K ocupa del orden de 1 GB), puede incorporarse en tests automatizados que validen pipelines de inferencia sin incurrir en costes de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo orientativo a partir del número de parámetros, no confirmado por el autor):
  - Q2_K: en torno a 1 GB de pesos, más overhead de contexto.
  - Q4_K_M: en torno a 1,1-1,3 GB de pesos.
  - Q5_K_M: en torno a 1,3-1,5 GB de pesos.
  - Q6_K: en torno a 1,5-1,7 GB de pesos.
  - Q8_0: en torno a 1,9-2,2 GB de pesos.
  - x-f16: en torno a 3,4-3,8 GB de pesos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) debería acomodar las cuantizaciones Q4 y Q5; las Q8_0 y x-f16 requieren 6-8 GB.
- Cabe en GPU consumer: sí, con las cuantizaciones Q2_K a Q8_0 en prácticamente cualquier GPU moderna; x-f16 requiere al menos 6 GB de VRAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que para estos backends sería necesario reconvertir a safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-WSP-V3-GGUF (este) | ~1.700 M | no disponible | no disponible | GGUF (13 cuantizaciones) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.2-1B-Instruct | 1.200 M | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Gemma 2-2B-it | 2.600 M | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Ollama |

La comparativa con Qwen2.5-1.5B, Llama 3.2-1B y Gemma 2-2B se ofrece como referencia de categoría (modelos compactos de ~1-3 mil millones de parámetros), pero no se dispone de datos de rendimiento del modelo LFM3-1.7B-WSP-V3 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de la cuantización, lo que impide confirmar si el uso comercial está permitido. Antes de desplegarlo en producción, es imprescindible consultar el repositorio original Sayansantra/LFM3-1.7B-WSP-V3.
- Idiomas no documentados: no se indica qué lenguas soporta el modelo, por lo que su rendimiento en castellano es desconocido.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; con 1.700 millones de parámetros el riesgo es mayor que en modelos de mayor escala, especialmente en tareas de conocimiento factual.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad de forma apreciable en tareas de razonamiento; para uso en producción se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su calidad frente a alternativas de la misma franja.
- Modelo derivado: al ser una conversión de pesos de terceros, posibles errores de conversión o discrepancias con el modelo original no están documentados.
- Contexto desconocido: no se puede planificar su uso en aplicaciones de contexto largo sin conocer la longitud máxima soportada.
- Fecha de creación futura (2026-11-21): el repositorio aparece con fecha posterior a la actual, lo que sugiere metadatos inconsistentes; conviene verificar la integridad del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/LFM3-1.7B-WSP-V3-GGUF
- Modelo base original: https://huggingface.co/Sayansantra/LFM3-1.7B-WSP-V3
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Repositorio de llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue simplificado de GGUF): https://ollama.com
