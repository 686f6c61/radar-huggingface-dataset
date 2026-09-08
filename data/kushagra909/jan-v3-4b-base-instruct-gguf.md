# kushagra909/Jan-v3-4B-base-instruct-gguf

## Resumen

El modelo `kushagra909/Jan-v3-4B-base-instruct-gguf` es una cuantización GGUF del modelo `Jan-v3-4B-base-instruct`, desarrollado por Jan (janhq) y publicado originalmente como `Menlo/Jan-v3-4B-base-instruct` según los metadatos. Se trata de un modelo de lenguaje causal de 4.411.424.256 parámetros (~4.41B), obtenido mediante destilación post-entrenamiento desde un modelo profesor más grande. Está diseñado como una base compacta y propia para fine-tuning, con capacidades de seguimiento de instrucciones y asistencia de código. Su longitud de contexto nativa es de 262.144 tokens, lo que lo hace adecuado para tareas que requieren manejar documentos extensos o conversaciones largas.

El modelo original está disponible en HuggingFace como `janhq/Jan-v3-4B-base-instruct` y cuenta con una variante `Jan-Code` orientada a código que se lanzará próximamente. La cuantización que nos ocupa, publicada por el usuario `kushagra909`, mantiene la licencia Apache 2.0 y el idioma inglés, y está pensada para su uso con herramientas como `llama.cpp`, `vLLM` o la aplicación de escritorio Jan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con GQA (32 cabezas de consulta, 8 de clave/valor) |
| Parametros totales | 4.411.424.256 (~4.41B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (repositorio GGUF; la model card original menciona Q8_0 como ejemplo) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 36 capas con atención de consultas agrupadas (GQA), que reduce el coste de memoria en la capa de atención. Según la model card original, el entrenamiento se realizó en dos etapas: pretraining y post-training, y el modelo se obtuvo mediante destilación post-entrenamiento desde un profesor más grande, transfiriendo capacidades y preservando el rendimiento general. No se especifican los datos de entrenamiento, el número de tokens ni si se emplearon técnicas de alineación como RLHF o DPO. La model card indica que el repositorio contiene la versión BF16 del modelo y que una variante `Jan-Code` ajustada para código se publicará próximamente.

## Capacidades

- Generación de texto y seguimiento de instrucciones, con un rendimiento generalista según la model card.
- Asistencia ligera de código, aunque la variante específica `Jan-Code` aún no está disponible.
- Soporte de tool calling / function calling: la model card muestra ejemplos de despliegue con `vLLM` usando `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Soporte de agentes y razonamiento multi-paso: se recomiendan parámetros específicos (temperature 0.7, top_p 0.8, top_k 20) para tareas agénticas.
- Contexto largo nativo de 262.144 tokens.
- Integración con la aplicación Jan y despliegue con `llama.cpp` y `vLLM`.

## Casos de uso

- Asistente de código en el IDE: el modelo puede ejecutarse localmente en una GPU de consumo mediante `llama.cpp` con cuantizaciones GGUF, ofreciendo autocompletado y explicaciones de código sin conexión.
- Base para fine-tuning en dominios específicos: su tamaño compacto y licencia Apache 2.0 lo hacen adecuado para ajustar en tareas como análisis de documentos legales o resúmenes de informes técnicos, con un coste de entrenamiento reducido.
- Agentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener conversaciones con un historial extenso, como asistentes que gestionan documentación técnica completa.
- Despliegue en aplicaciones de escritorio offline: integración con Jan App para ofrecer un asistente privado y sin conexión, adecuado para entornos con requisitos de privacidad.
- Soporte técnico automatizado con tool calling: mediante `vLLM` con parser Hermes, el modelo puede invocar herramientas externas para consultar bases de conocimiento, gestionar tickets o ejecutar operaciones en sistemas de soporte.
- Prototipado rápido de aplicaciones de IA: su tamaño reducido y facilidad de despliegue con `vLLM` o `llama.cpp` permiten iterar rápidamente en prototipos de chatbots o sistemas de recomendación en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original incluye una figura de rendimiento, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas basadas en el tamaño de 4.41B):
  - Pesos BF16 originales: ~8.8 GB más overhead, se recomiendan 10-12 GB.
  - Cuantización GGUF Q8_0: ~4.4 GB de pesos, se recomiendan 6-8 GB.
  - Cuantización GGUF Q4_K_M: ~2.5 GB de pesos, se recomiendan 4-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para BF16 con contexto largo; RTX 4060/4070 (8-12 GB) para cuantizaciones Q8/Q4.
- Sí cabe en GPU de consumo: con cuantizaciones Q4 es posible ejecutarlo en GPUs de 6-8 GB.
- Opciones de despliegue: `vLLM` (modelo original BF16), `llama.cpp` (GGUF), `Ollama` (si se importa), Jan App.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han proporcionado datos de rendimiento ni especificaciones de modelos alternativos para establecer una comparativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, más acentuado en modelos pequeños destilados.
- Limitación de idioma: solo soporta inglés, lo que limita su uso en entornos multilingües.
- El modelo es una base para fine-tuning; su rendimiento en tareas específicas puede requerir ajuste adicional.
- La cuantización GGUF puede degradar ligeramente el rendimiento en comparación con los pesos BF16 originales.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos completos.

## Enlaces

- Repositorio de HuggingFace de la cuantización: https://huggingface.co/kushagra909/Jan-v3-4B-base-instruct-gguf
- Modelo original en HuggingFace: https://huggingface.co/janhq/Jan-v3-4B-base-instruct
- Documentación de Jan sobre el modelo: https://www.jan.ai/docs/desktop/jan-models/jan-v3-4b-base-instruct
- Repositorio de GitHub de Jan: https://github.com/janhq/jan
- Página de Jan App: https://jan.ai/
- Demo en Jan Browser: https://chat.jan.ai/
