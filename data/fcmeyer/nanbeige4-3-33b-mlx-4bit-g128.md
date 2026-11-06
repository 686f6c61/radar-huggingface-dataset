# fcmeyer/Nanbeige4.3-33B-MLX-4bit-g128

## Resumen

Nanbeige4.3-33B-MLX-4bit-g128 es una conversión cuantizada del modelo Nanbeige4.3-33B, desarrollado por el Nanbeige Team, publicada por el usuario fcmeyer en Hugging Face. Se trata de una versión optimizada para MLX, el framework de Apple Silicon, con cuantización afín de 4 bits y tamaño de grupo 128, lo que reduce el peso del modelo hasta unos 17,6 GB en disco frente a los aproximadamente 66 GB que ocuparía en BF16. El modelo base es un transformer denso de 33.118.977.024 parámetros, con licencia Apache-2.0 y capacidades declaradas de generación de texto, conversación y razonamiento con modo thinking.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 33B en hardware de Apple con memoria unificada, algo impracticable con los pesos originales en precisión completa. La conversión conserva la plantilla de chat del modelo original, incluye soporte para tool calling en formato XML (recomendado por el autor original) y JSON, y mantiene la configuración de contexto de 524.288 tokens del modelo fuente, aunque el propio autor advierte que no se ha validado el contexto completo de 512K.

El repositorio incluye validaciones de fidelidad frente a BF16 sobre un corpus sintético de 563 tokens, con una perplejidad de 7,92 y una concordancia top-1 del 87,03%, además de métricas de rendimiento medidas en un Apple M5 Max con 128 GB de memoria unificada. No se han publicado benchmarks estandarizados de capacidades (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tags) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (configuración del modelo fuente; contexto completo no validado) |
| Tipos de cuantización | 4 bits afín, group size 128 (MLX) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 1203 tensores, 17.595.699.462 bytes |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de 33B parámetros, tal como indican los tags de la familia llama y el recuento de parámetros del safetensors. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos no están disponibles en la documentación consultada. La plantilla de chat del modelo fuente incluye un modo de razonamiento controlable mediante el parámetro `enable_thinking`, lo que sugiere un entrenamiento orientado a tareas de razonamiento multi-paso y uso agéntico.

La innovación técnica principal de esta publicación es la conversión a MLX con cuantización afín de 4 bits y grupo de 128, que reduce el peso a 17,6 GB manteniendo la plantilla de chat y el soporte de tool calling del original. El autor documenta un proceso de conversión reproducible desde BF16 mediante scripts (`release.py convert 4bit-g128` y `validate 4bit-g128`), con todas las variantes cuantizadas derivadas de forma independiente desde BF16. La validación incluye comprobaciones de generación en inglés y chino, logits finitos, equivalencia de tokenizador y ocho casos de plantilla de thinking y tool calling.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo thinking controlable mediante `enable_thinking` en la plantilla de chat.
- Tool calling y function calling, con formato XML recomendado por el autor original y soporte alternativo de JSON.
- Flujos agénticos con preservación del razonamiento previo mediante `preserve_thinking=True`, pensado para workflows de agentes multi-paso.
- Soporte de contexto largo de hasta 524.288 tokens según la configuración del modelo fuente (no validado a longitud completa).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se declaran capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno en inglés y chino ejecutándose íntegramente en Apple Silicon con MLX, sin necesidad de GPU dedicada, gracias a sus 17,6 GB de pesos cuantizados que caben en equipos con 32 GB o más de memoria unificada.
- Automatización de agentes con tool calling: la plantilla conserva el soporte de llamadas a herramientas en XML y JSON, lo que permite integrar el modelo en pipelines agénticos que consulten APIs, bases de datos o servicios externos, con la ventaja de preservar el razonamiento previo entre pasos.
- Procesamiento de documentos largos en chino e inglés: con una ventana configurada de 524.288 tokens, el modelo es adecuado para resumir, extraer información o responder preguntas sobre corpus extensos, aunque conviene validar el rendimiento real más allá de longitudes moderadas.
- Prototipado de razonamiento paso a paso en local: el modo thinking permite activar cadenas de razonamiento explícitas para tareas de matemáticas, lógica o análisis, útil en entornos de investigación que requieran inspeccionar el proceso de razonamiento sin depender de servicios en la nube.
- Desarrollo de aplicaciones MLX nativas: al estar empaquetado para `mlx_lm`, sirve como base para experimentar con cuantización, decodificación y evaluación en el ecosistema MLX de Apple, con scripts de reproducción incluidos en el repositorio.
- Evaluación comparativa de cuantizaciones: los artefactos de validación (KL frente a BF16, NLL, perplejidad y concordancia top-1) permiten estudiar el impacto de la cuantización 4-bit g128 en la distribución de salida, como referencia para decidir entre variantes cuantizadas en producción.
- Chat bilingüe de soporte técnico: para equipos que operen con usuarios en inglés y chino, el modelo puede desplegarse localmente en estaciones de trabajo Apple para tareas de atención interna sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye métricas de validación de la conversión y de rendimiento en hardware concreto:

| Métrica | Valor |
|---|---|
| Perplejidad (corpus sintético, 563 tokens) | 7,924648 |
| NLL medio por token | 2,069978 |
| Diferencia de NLL frente a BF16 | -0,003715 |
| KL medio (BF16 \|\| cuantizado) | 0,084253 nats/token |
| Concordancia top-1 con BF16 | 87,03% |

Rendimiento en Apple M5 Max con 128 GB de memoria unificada, KV cache sin cuantizar, pasos de prefill de 512 tokens y 256 tokens de salida (medianas de tres ensayos):

| Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico de memoria (GB) |
|---:|---:|---:|---:|
| 512 | 606,88 | 29,72 | 18,29 |
| 4096 | 665,78 | 29,00 | 18,93 |
| 16384 | 600,59 | 24,74 | 21,59 |

El autor advierte que estas métricas son una comprobación de regresión de la conversión, no un benchmark estandarizado de capacidades, y que no establecen equivalencia de rendimiento downstream con BF16.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 17,6 GB solo para pesos; el pico medido en MLX fue de 18,29 GB con 512 tokens de entrada y 21,59 GB con 16.384 tokens, con KV cache sin cuantizar.
- GPU recomendadas: el modelo está empaquetado para MLX, por lo que el hardware objetivo son chips de Apple Silicon con memoria unificada; las mediciones se realizaron en un Apple M5 Max con 128 GB.
- Compatibilidad con GPU de consumo: no está pensado para GPU NVIDIA o AMD mediante CUDA/ROCm en este formato; para esas plataformas habría que recurrir a otras conversiones (GGUF, AWQ, GPTQ) del modelo base, no disponibles en la información proporcionada.
- Memoria unificada mínima práctica: 32 GB permitirían cargar los pesos, pero el contexto largo y el KV cache sin cuantizar elevan el consumo; 64 GB o más ofrecen margen para contextos extendidos.
- Opciones de despliegue: `mlx_lm` (librería declarada), con carga mediante `load` y generación mediante `generate`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: decode de aproximadamente 29 tok/s a 512 y 4096 tokens de entrada, bajando a 24,74 tok/s a 16.384 tokens; prefill en torno a 600-666 tok/s en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit-g128 (este) | 33,1B | 524.288 (no validado a full) | Apache-2.0 | MLX safetensors 4-bit | Conversión comunitaria, métricas de fidelidad frente a BF16 |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | 524.288 | Apache-2.0 | safetensors BF16 | Modelo original del Nanbeige Team; referencia de calidad |
| Alternativas de 33B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (33B, MLX, 4-bit) en la documentación consultada, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- La validación de fidelidad se realizó sobre un corpus sintético fijo de 563 tokens; el autor indica explícitamente que esto no establece equivalencia de capacidades downstream con BF16.
- El contexto configurado es de 524.288 tokens, pero el contexto completo de 512K no ha sido validado; el rendimiento y la calidad más allá de longitudes moderadas son inciertos.
- La concordancia top-1 con BF16 es del 87,03%, lo que implica que aproximadamente un 13% de las predicciones difieren del modelo en precisión completa; en tareas sensibles esto puede traducirse en divergencias de calidad.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano ni otros idiomas, lo que restringe su uso en entornos hispanohablantes sin evaluación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de veracidad ni de sesgos en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la conversión no certifica la equivalencia de capacidades ni reclama que sea universalmente la mejor cuantización.
- El soporte de la plantilla de tool calling no certifica el parser de herramientas de ningún servidor concreto; la integración en producción requiere validar el parser del servidor elegido.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente utilizable en infraestructura NVIDIA sin reconversión.
- Las métricas de rendimiento aplican únicamente al hardware y longitudes declarados (Apple M5 Max, 128 GB, hasta 16.384 tokens de entrada).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-4bit-g128
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revisión del modelo fuente citada: `c1093c501cc6460427c0ac634db7223d0450c0ee`
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
