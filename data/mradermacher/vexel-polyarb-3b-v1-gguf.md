# mradermacher/Vexel-PolyArb-3B-v1-GGUF

## Resumen

Vexel-PolyArb-3B-v1-GGUF es la versión cuantizada en formato GGUF del modelo VexelQuant/Vexel-PolyArb-3B-v1, un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) especializado en el dominio financiero y de criptomonedas. La cuantización ha sido realizada por mradermacher, un conocido distribuidor de versiones GGUF de modelos open source, y publica múltiples niveles de compresión para facilitar el despliegue en hardware de consumo.

El modelo base está etiquetado con los descriptores `vexelquant`, `crypto`, `quant`, `grpo`, `unsloth` y `financial-nlp`, lo que sugiere un entrenamiento orientado a tareas de análisis cuantitativo, trading algorítmico y procesamiento de lenguaje natural financiero. El uso de GRPO (Group Relative Policy Optimization) como técnica de alineación y de Unsloth como framework de entrenamiento indica un proceso de ajuste eficiente en recursos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y cuya model card original no está disponible en la información proporcionada. Por tanto, muchos datos técnicos deben marcarse como no disponibles, y las capacidades y el rendimiento deben inferirse con cautela a partir de las etiquetas y del tamaño del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del pipeline conversacional y de la librería transformers); detalles específicos no disponibles |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por el tamaño (3,09 B de parámetros) y el pipeline conversacional, se trata con alta probabilidad de un transformer decoder-only de escala pequeña, adecuado para inferencia en hardware de consumo. El tag `unsloth` indica que el ajuste fino se realizó con el framework Unsloth, optimizado para entrenamiento eficiente en memoria y velocidad, y el tag `grpo` señala el uso de Group Relative Policy Optimization, una variante de RLHF/RL que optimiza políticas mediante comparaciones relativas dentro de grupos de respuestas generadas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de SFT previas al GRPO. El dominio declarado (`crypto`, `quant`, `financial-nlp`) sugiere un corpus especializado en datos financieros y de criptomonedas, pero no se han publicado detalles sobre la mezcla de datos. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado.
- Procesamiento de lenguaje natural financiero (`financial-nlp`): análisis de sentimiento de mercado, resumen de informes y extracción de entidades financieras.
- Razonamiento cuantitativo y de trading (`quant`, `crypto`): interpretación de series temporales, métricas de mercado y estrategias de arbitraje.
- Alineación mediante GRPO, orientada a mejorar la calidad de las respuestas en tareas del dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis de sentimiento de noticias cripto: el modelo puede clasificar titulares y publicaciones de foros en categorías alcistas, bajistas o neutras, aprovechando su ajuste en `financial-nlp` para vocabulario especializado como forks, liquidez o halving.
- Resumen de informes de mercado: dado un documento financiero en inglés, el modelo puede generar un resumen estructurado con métricas clave, adecuado para paneles de seguimiento diario.
- Extracción de entidades financieras: identificación de tickers, exchanges, pares de trading y montos en textos no estructurados, útil para pipelines de ingesta de datos.
- Asistente conversacional para consultas de trading: un chatbot que responde preguntas sobre conceptos de arbitraje y estrategias cuantitativas, con un tamaño de 3 B que permite desplegarlo en una GPU de consumo.
- Generación de documentación técnica financiera: redacción de notas explicativas sobre indicadores cuantitativos o metodologías de backtesting, en inglés.
- Prototipado rápido en investigación: al caber en GPUs de gama media con cuantización Q4_K_M (2,0 GB), sirve para experimentar con RLHF/GRPO en dominios financieros sin grandes infraestructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,4 GB
  - Q3_K_M: ~1,7 GB
  - IQ4_XS: ~1,9 GB
  - Q4_K_M: ~2,0 GB
  - Q5_K_M: ~2,3 GB
  - Q6_K: ~2,6 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, desde una GTX 1650 de 4 GB con Q4_K_S hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo Hugging Face.
- Latencia y throughput: no disponibles. Para un modelo de 3 B en Q4_K_M sobre una RTX 4090, se espera un throughput alto, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vexel-PolyArb-3B-v1-GGUF | 3,09 B | No disponible | Apache 2.0 | Finanzas y cripto | GGUF en HF |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens | Apache 2.0 | Generalista | Safetensors y GGUF |
| Llama-3.2-3B-Instruct | 3,21 B | 131 072 tokens | Llama 3.2 Community | Generalista | Safetensors y GGUF |
| Phi-3.5-mini-instruct | 3,82 B | 131 072 tokens | MIT | Generalista | Safetensors y GGUF |

La comparativa se ofrece a título orientativo: los tres modelos alternativos son generalistas y ampliamente evaluados, mientras que Vexel-PolyArb-3B-v1 carece de benchmarks públicos. La ventaja potencial de Vexel-PolyArb es su especialización declarada en finanzas y cripto, pero sin datos de rendimiento no puede confirmarse que supere a los generalistas en esas tareas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en un dominio financiero, puede reflejar sesgos de mercado o de fuentes de datos cripto.
- Riesgo de alucinación: elevado en un modelo de 3 B sin benchmarks públicos; especialmente crítico en contexto financiero, donde datos inventados pueden tener consecuencias económicas.
- Limitaciones de contexto o idioma: solo inglés declarado; longitud de contexto desconocida, lo que impide planificar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveats para producción: cero descargas y cero likes en Hugging Face, sin model card original accesible, sin benchmarks y sin documentación de entrenamiento. No se recomienda su uso en producción sin una evaluación propia exhaustiva en el dominio objetivo.
- El repo GGUF ocupa 27,9 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- [Hugging Face: mradermacher/Vexel-PolyArb-3B-v1-GGUF](https://huggingface.co/mradermacher/Vexel-PolyArb-3B-v1-GGUF)
- [Modelo base: VexelQuant/Vexel-PolyArb-3B-v1](https://huggingface.co/VexelQuant/Vexel-PolyArb-3B-v1)
- [Página de descargas del cuantizador](https://hf.tst.eu/model#Vexel-PolyArb-3B-v1-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Análisis de tipos de cuantización (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
