# mradermacher/GeoSearcher-4B-GGUF

## Resumen

GeoSearcher-4B-GGUF es la versión cuantizada en formato GGUF del modelo GeoSearcher-4B, desarrollado originalmente por el usuario wangdianyu y convertida por mradermacher, un perfil habitual en la comunidad de cuantización de modelos para llama.cpp. El modelo cuenta con 4.411.424.256 parámetros totales según los datos de safetensors, lo que lo sitúa en la franja de los modelos de aproximadamente 4B de parámetros, un tamaño manejable para despliegue en hardware de consumo.

La model card del repositorio es extremadamente escasa: se limita a los metadatos de la conversión (versión de cuantización 2, tipo de conversión hf, tensor de salida cuantizado) y a una lista de las cuantizaciones estáticas generadas, que abarcan desde Q2_K hasta F16 pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS. No se documentan detalles sobre arquitectura, datos de entrenamiento, idiomas soportados ni licencia.

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión de un modelo base del que no se dispone de información técnica publicada en el repositorio. El interés principal radica en que ofrece múltiples niveles de cuantización GGUF listos para usar con llama.cpp, Ollama u otros motores compatibles, lo que facilita la experimentación local con un modelo de 4B en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base GeoSearcher-4B en la documentación proporcionada. El nombre sugiere una orientación hacia tareas de búsqueda o geolocalización ("GeoSearcher"), pero no hay detalles publicados sobre si se trata de un transformer denso, un modelo con atención lineal, una arquitectura híbrida o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de conversión: el repositorio contiene cuantizaciones estáticas generadas con una versión 2 del pipeline de cuantización de mradermacher, a partir del modelo base alojado en wangdianyu/GeoSearcher-4B. El tamaño total del repositorio es de 41.0 GB, coherente con la inclusión de múltiples variantes de cuantización, incluida F16. Los tags del repositorio indican "conversational" y "endpoints_compatible", lo que sugiere que el modelo está pensado para uso conversacional y es compatible con la infraestructura de endpoints de Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag "conversational" del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse a través de la infraestructura de inferencia de Hugging Face.
- Capacidades de búsqueda o geolocalización: el nombre "GeoSearcher" sugiere una orientación a tareas de búsqueda, pero no hay documentación que confirme funciones concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación local con modelos de 4B: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, útil para prototipado rápido sin infraestructura dedicada.
- Despliegue en entornos con recursos limitados: la variante Q2_K o IQ4_XS reduce el peso a unos pocos GB, permitiendo inferencia en CPU o en GPUs de gama baja para pruebas de concepto.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 variantes de cuantización, el repositorio sirve para medir el impacto de la compresión en la calidad de salida de un mismo modelo base.
- Integración en pipelines con llama.cpp u Ollama: el formato GGUF es directamente consumible por estos motores, lo que facilita su incorporación en aplicaciones de escritorio o servidores ligeros.
- Investigación sobre modelos conversacionales pequeños: si el modelo base resulta útil para diálogo, las versiones cuantizadas permiten estudiar su comportamiento en escenarios de bajo presupuesto.
- Pruebas de compatibilidad con endpoints de Hugging Face: el tag "endpoints_compatible" permite validar el despliegue del modelo en la infraestructura gestionada de HF sin necesidad de configurar servidores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de 4.4B parámetros):
  - F16: ~8.8 GB solo para pesos, más overhead de contexto y KV cache; requiere ~12-16 GB.
  - Q8_0: ~4.7 GB de pesos; requiere ~8-10 GB.
  - Q6_K: ~3.6 GB de pesos; requiere ~6-8 GB.
  - Q5_K_M: ~3.1 GB de pesos; requiere ~5-7 GB.
  - Q4_K_M: ~2.7 GB de pesos; requiere ~4-6 GB.
  - Q3_K_M: ~2.1 GB de pesos; requiere ~3-5 GB.
  - Q2_K: ~1.6 GB de pesos; requiere ~2-4 GB.
- GPU recomendadas: para F16, una RTX 4090 (24 GB) o A100; para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes; para Q2_K, cabe en GPUs de 4-6 GB como la GTX 1650 o en CPU.
- Cabe en GPU de consumo: sí, todas las cuantizaciones por debajo de Q8_0 caben en GPUs de consumo de gama media; F16 requiere una GPU de gama alta o profesional.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; también endpoints de Hugging Face por el tag "endpoints_compatible".
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida, pero para un modelo de 4B en una RTX 4090 se esperan decenas de tokens por segundo en Q4_K_M.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base GeoSearcher-4B (arquitectura, contexto, rendimiento, licencia) para establecer una comparativa rigurosa con alternativas de la misma categoría. Los modelos de ~4B parámetros más habituales en el ecosistema GGUF (por ejemplo, familias como Qwen, Llama o Phi en tamaños similares) no pueden compararse aquí sin datos de rendimiento del modelo evaluado.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| GeoSearcher-4B-GGUF | 4.411.424.256 | no disponible | no disponible | Sí (12 variantes) |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información técnica ausente: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: al no indicarse la licencia del modelo base ni de la conversión, no se puede garantizar el uso comercial; es imprescindible verificar la licencia en el repositorio original wangdianyu/GeoSearcher-4B antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación ni benchmarks, no puede acotarse su fiabilidad.
- Sesgos: no disponibles; no se ha publicado información sobre sesgos conocidos.
- Limitaciones de contexto e idioma: no disponibles; el tag "conversational" no especifica longitud de contexto ni cobertura lingüística.
- Repositorio con 0 descargas y 0 likes: indica que el modelo no ha sido validado por la comunidad; su calidad y estabilidad no están contrastadas.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la calidad de salida; para uso real se recomienda Q4_K_M o superior.
- Tamaño del repo de 41 GB: requiere espacio de disco considerable si se descargan todas las variantes; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GeoSearcher-4B-GGUF
- Modelo base: https://huggingface.co/wangdianyu/GeoSearcher-4B
