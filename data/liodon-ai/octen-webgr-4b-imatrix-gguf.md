# liodon-ai/Octen-WebGR-4B-imatrix-GGUF

## Resumen

Octen-WebGR-4B-imatrix-GGUF es un repositorio de cuantizaciones GGUF del modelo Octen-WebGR-4B, publicado por Liodon AI. El modelo base, Octen/Octen-WebGR-4B, deriva a su vez de Qwen/Qwen3-4B-Base, un transformer de 4 mil millones de parámetros de la familia Qwen3. Este repositorio no es un modelo nuevo en sí, sino una colección de versiones comprimidas en formato GGUF optimizadas mediante la técnica iMatrix (importance matrix), que mejora la calidad de la inferencia en cuantizaciones agresivas de 2 a 4 bits sin aumentar el tamaño del archivo.

La relevancia de esta ficha radica en el enfoque local: las cuantizaciones van desde 1,75 GB (IQ2_M) hasta 4,64 GB (Q8_0), lo que permite ejecutar el modelo en portátiles, mini-PC y GPUs de consumo con tan solo 2-5 GB de VRAM. La calibración iMatrix se realizó con 2 millones de tokens de WikiText-103, identificando qué pesos son más críticos y asignándoles mayor precisión durante la cuantización.

Para desarrolladores que evalúan modelos pequeños para despliegue local (chatbots offline, asistentes embebidos, prototipado en LM Studio u Ollama), esta variante iMatrix ofrece una relación calidad/tamaño superior a las cuantizaciones estándar equivalentes, especialmente en los rangos sub-4-bit donde la degradación de calidad suele ser más notoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), no disponible detalle completo |
| Parámetros totales | 4.358.012.416 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base Octen/Octen-WebGR-4B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3, dado que el modelo base original es Qwen/Qwen3-4B-Base. El modelo intermedio Octen/Octen-WebGR-4B (presumiblemente un fine-tuning sobre esa base) fue posteriormente cuantizado por Liodon AI. No se dispone de detalles públicos sobre el proceso de entrenamiento del modelo base Octen: número de tokens, composición del dataset o uso de RLHF/DPO.

La innovación técnica principal de este repositorio es la cuantización con iMatrix (importance matrix). A diferencia de la cuantización estándar, que trata todos los pesos por igual, iMatrix ejecuta 128 fragmentos de calibración a través del modelo en precisión completa para identificar qué pesos tienen mayor impacto en la salida, y les asigna más precisión durante la compresión. La calibración utilizó 2 millones de tokens de WikiText-103. Según el autor, esto produce una coherencia y capacidad de seguimiento de instrucciones notablemente mejores en rangos IQ2/IQ3/IQ4, con el mismo tamaño de archivo que las cuantizaciones equivalentes sin calibrar.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational")
- Ejecución totalmente local mediante llama.cpp, Ollama, LM Studio y Jan
- Razonamiento y seguimiento de instrucciones heredados del linaje Qwen3-4B (no hay datos específicos del fine-tuning Octen)
- Tool calling, agentes, visión, audio y capacidades multilingües: no disponible (sin información en la model card)

## Casos de uso

- **Asistentes conversacionales offline**: con la variante Q4_K_M (2,78 GB, ~3 GB de VRAM) se puede montar un chatbot local en LM Studio o Jan sin conexión, adecuado para privacidad de datos en entornos sensibles.
- **Prototipado rápido en portátiles**: las variantes IQ2_M e IQ3_M (1,75-2,24 GB) permiten probar el modelo en equipos sin GPU dedicada, con CPU y RAM modestas.
- **Integración con Ollama en flujos de desarrollo**: el comando `ollama run hf.co/liodon-ai/Octen-WebGR-4B-imatrix-GGUF:Q4_K_M` facilita incorporar el modelo a pipelines de desarrollo locales con una sola instrucción.
- **Despliegue en edge y mini-PC**: el tamaño reducido de las cuantizaciones sub-4-bit lo hace viable para dispositivos con recursos limitados, como servidores caseros o SBCs con aceleradores.
- **Inferencia en GPU de consumo con alta fidelidad**: Q8_0 (4,64 GB, ~5 GB de VRAM) cabe en una RTX 3060 de 12 GB o superior, ofreciendo calidad prácticamente sin pérdida para aplicaciones que exigen máxima fidelidad local.
- **Comparativa de cuantizaciones para investigación**: al disponer de siete niveles de cuantización con la misma calibración iMatrix, el repositorio es útil para estudiar el impacto de la precisión en la calidad de salida de modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada por variante (según la model card):
  - IQ2_M: ~2 GB
  - IQ3_M: ~3 GB
  - IQ4_XS: ~3 GB
  - Q4_K_M: ~3 GB (recomendada por el autor)
  - Q5_K_M: ~4 GB
  - Q6_K: ~4 GB
  - Q8_0: ~5 GB
- GPU recomendadas: no disponible; dado el tamaño, cualquier GPU de consumo con 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060) ejecuta incluso la variante Q8_0. En CPU, basta RAM suficiente para cargar el archivo.
- Cabe en GPUs de consumo desde la gama de entrada; también es ejecutable en CPU pura vía llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Octen-WebGR-4B-imatrix-GGUF:Q4_K_M`), Ollama, LM Studio, Jan. No consta soporte verificado para vLLM o TGI con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización destacada | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Octen-WebGR-4B-imatrix-GGUF | 4,36 B | GGUF | IQ2_M a Q8_0 con iMatrix | other | Calibrado con WikiText-103, 7 variantes |
| liodon-ai/Octen-WebGR-4B-GGUF | 4,36 B | GGUF | cuantizaciones estándar (sin iMatrix) | other | Misma base sin calibración iMatrix |
| Qwen/Qwen3-4B (oficial) | 4 B | safetensors | no disponible | Apache-2.0 (familia Qwen3) | Modelo base original, sin cuantizar |

Alternativas de tamaño similar con soporte GGUF (por ejemplo Llama 3.2 3B o Gemma 3 4B) son comparables en categoría, pero no se dispone de datos de rendimiento que permitan una comparativa cuantitativa: no disponible.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos, tasa de alucinación ni evaluaciones del modelo base Octen-WebGR-4B; conviene validar su comportamiento antes de uso en producción.
- La longitud de contexto no está documentada en la model card; debe verificarse en la configuración del modelo base antes de diseñar aplicaciones con documentos largos.
- Idiomas soportados no disponibles: aunque el linaje Qwen3 sugiere soporte multilingüe, no hay confirmación para esta variante.
- La licencia figura como "other": es imprescindible revisar la licencia exacta de Octen/Octen-WebGR-4B antes de cualquier uso comercial, ya que puede diferir de la Apache-2.0 del Qwen3 original.
- La calibración iMatrix se realizó con WikiText-103 (texto enciclopédico en inglés), lo que puede sesgar la calidad de la cuantización hacia ese dominio; en dominios muy distintos (código, conversación multilingüe) la ventaja de iMatrix podría ser menor.
- Las cuantizaciones de 2 bits (IQ2_M) conllevan degradación de calidad inherente; el propio autor recomienda Q4_K_M como opción equilibrada.
- El repositorio tiene descargas limitadas (711) y cero likes, sin historial comunitario que avale su fiabilidad.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/liodon-ai/Octen-WebGR-4B-imatrix-GGUF
- Modelo base (safetensors): https://huggingface.co/Octen/Octen-WebGR-4B
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de calibración: https://huggingface.co/datasets/wikitext
- Cuantizaciones sin iMatrix del mismo autor: https://huggingface.co/liodon-ai/Octen-WebGR-4B-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Paper, blog oficial y demo: no disponible
