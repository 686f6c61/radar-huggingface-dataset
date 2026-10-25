# hermitdave/Nanbeige4.3-33B-MLX-rtn-8bit

## Resumen

Nanbeige4.3-33B-MLX-rtn-8bit es un checkpoint cuantizado a 8 bits del modelo denso Nanbeige4.3-33B (33.118.977.024 parámetros), publicado por el usuario hermitdave mediante el pipeline `slq-mlx-port` y el agente Hermes de NousResearch. No es un modelo entrenado desde cero ni un ajuste fino: es una cuantización uniforme RTN (round-to-nearest) con rejilla afín, group_size 64, producida sobre un Mac con M3 Max de 64 GB de memoria unificada. El resultado ocupa unos 37,5 GB frente a los ~62 GB del original en BF16.

El modelo base, desarrollado por el laboratorio chino Nanbeige y publicado el 24 de octubre de 2026, es un transformer tipo Llama (52 capas, hidden size 7168, 56 cabezas de atención con 8 KV heads y MLP SwiGLU) orientado a tareas agénticas de programación y trabajo de oficina, con una ventana de contexto de 524.288 tokens y un vocabulario de 166.912 entradas. Su tarjeta reporta 80,9 en Terminal-Bench 2.1.

La relevancia de este artefacto concreto es doble: por un lado permite ejecutar un modelo de 33B en hardware Apple Silicon con pérdida de calidad mínima; por otro, el autor lo plantea explícitamente como checkpoint profesor para refinar escalas de cuantizaciones de menor bitaje (DWQ) y como referencia para medir la degradación de las variantes de 4 y 3 bits. Es, por tanto, una pieza de infraestructura de cuantización más que un modelo de producción autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM densa (GQA con 8 KV heads, MLP SwiGLU), 52 capas, hidden size 7168, 56 cabezas de atención |
| Parámetros totales | 33.118.977.024 (~33,1B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantización | 8 bits afín (RTN, round-to-nearest), group_size = 64, ~8,5 bits por peso; escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponibles en los metadatos del checkpoint; la información disponible del modelo base lo describe como bilingüe chino-inglés |
| Licencia | other (hereda la licencia del modelo base; fuentes secundarias indican Apache 2.0 para Nanbeige4.3-33B) |
| Formato de pesos | safetensors para MLX (`mlx` + `mlx-lm` 0.24 o superior) |
| Vocabulario | 166.912 tokens |
| Tamaño del artefacto | ~37,5 GB (base BF16: ~62 GB) |
| Capas excluidas de la cuantización | `embed_tokens`, `lm_head` y todas las normas (`.*\.norm\.`, `norm_f`) en precisión original |
| Plataforma | exclusivamente Apple Silicon (memoria unificada) |
| Calibración | ninguna (RTN no requiere datos de calibración) |
| Reproducibilidad | script `streaming_rtn_nbg43.py` del proyecto `slq-mlx-port` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only clásico de la familia Llama, sin mezcla de expertos ni componentes de estado recurrente: 52 capas con atención de consultas agrupadas (56 cabezas de consulta frente a 8 cabezas KV, lo que reduce el coste de caché en contextos largos), MLP con activación SwiGLU y un vocabulario de 166.912 tokens. El modelo base se presenta como un "agentic teacher model" para código y tareas profesionales de oficina. No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del corpus, número de fases ni uso de RLHF, DPO o aprendizaje por refuerzo; esa información debería consultarse en la tarjeta del modelo original.

El proceso de cuantización sí está documentado con detalle: cuantización post-entrenamiento pura, sin ajuste fino, aplicada con el pipeline de streaming `streaming_rtn_nbg43.py` sobre un M3 Max de 64 GB. Cada peso se redondea al punto más cercano de su rejilla afín de 64 elementos, sin compensación de error tipo Hessiano (a diferencia de GPTQ) y sin calibración. Las tres variantes (8, 4 y 3 bits) se generaron simultáneamente en unos 2 minutos. La innovación técnica del artefacto no está en el modelo, sino en el flujo de cuantización por streaming en memoria unificada, que evita cargar los 62 GB del BF16 completos en el proceso de conversión.

## Capacidades

- Generación de texto conversacional en un modelo de 33B con ventana de 524.288 tokens, adecuada para documentos extensos y conversaciones multi-turno muy largas.
- Programación y tareas de terminal: el modelo base reporta 80,9 en Terminal-Bench 2.1, un benchmark de ejecución de comandos en entornos de agente.
- Razonamiento agéntico multi-paso y tareas de "cowork" profesional (el modelo base se comercializa explícitamente para este uso).
- Capacidades bilingües chino-inglés según la información disponible del modelo base; el rendimiento en castellano no está documentado.
- Soporte de tool calling / function calling: no confirmado de forma explícita en la información disponible, aunque el perfil agéntico del modelo base y los benchmarks de terminal lo hacen plausible; conviene verificarlo empíricamente.
- No se han declarado capacidades de visión, audio ni modo "thinking" explícito en la información disponible.
- Inferencia local en Apple Silicon mediante MLX, lo que habilita uso offline y ausencia de dependencias de CUDA.

## Casos de uso

- Agente de terminal y automatización de tareas de sistema: con 524.288 tokens de contexto puede mantener el historial completo de una sesión de shell, los ficheros relevantes y los resultados de comandos previos en una sola ventana, lo que reduce la necesidad de resúmenes intermedios. El 80,9 en Terminal-Bench 2.1 del modelo base es el indicador directo de idoneidad.
- Asistencia a programación en local sobre Mac: usando `mlx-lm` se puede integrar en editores o scripts de revisión de código sin enviar el código a un servicio externo, algo crítico en entornos con requisitos de confidencialidad.
- Análisis de repositorios completos: la ventana de 524.288 tokens permite introducir varios ficheros de código y documentación a la vez para tareas de auditoría, generación de tests o explicación de arquitectura.
- Generación de documentación técnica y tareas de oficina: el modelo base está orientado a "professional cowork", por lo que encaja en resumen de actas, redacción de informes y transformación de documentos largos que quepan en el contexto.
- Checkpoint profesor para cuantización destilada (DWQ): el autor lo publica explícitamente con este fin; sirve para refinar las escalas de las variantes de 4 y 3 bits y como referencia de calidad casi indistinguible del BF16.
- Banco de pruebas de cuantización: comparar las salidas de esta variante de 8 bits con las de 4 y 3 bits permite cuantificar la degradación real por bitaje en código y razonamiento antes de decidir qué variante desplegar.
- Prototipado offline en portátiles Apple: demostraciones y pruebas de concepto sin conectividad ni GPUs dedicadas, con un artefacto de 37,5 GB que cabe en Mac con 64 GB de memoria unificada.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base, no a este checkpoint cuantizado. No se han publicado evaluaciones del artefacto de 8 bits en la información proporcionada.

| Benchmark | Nanbeige4.3-33B (modelo base, BF16) | Este checkpoint (8-bit MLX) |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | no disponible (sin evaluación publicada) |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

La tarjeta del modelo base afirma, según las fuentes secundarias consultadas, que lidera tres modelos comparables de la clase 30B en la mayoría de benchmarks agénticos, pero no se han facilitado las cifras concretas de esas comparaciones. El autor de la cuantización advierte que las variantes de menor bitaje pueden mostrar pérdida medible en código y razonamiento, y recomienda ejecutar evaluaciones propias antes de fiarse de cualquier número.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~37,5 GB solo para pesos, más caché KV. Con 524.288 tokens de contexto la caché puede crecer de forma significativa; para uso práctico con contextos largos se recomienda al menos 64 GB de memoria unificada.
- Hardware de referencia declarado: Mac con M3 Max y 64 GB, macOS 26.7.1, MLX 0.24 o superior. El proceso de cuantización de las tres variantes completo tomó unos 2 minutos en ese equipo.
- GPU CUDA: no compatible. Los safetensors de MLX no se cargan en PyTorch/TensorFlow sobre CUDA ni en inferencia solo-CPU.
- GPU de consumo: no aplica en el ecosistema NVIDIA. En Apple Silicon, cabe en MacBook Pro y Mac Studio con 48-64 GB (48 GB queda muy justo con contexto largo); equipos de 32 GB no son viables para esta variante.
- Opciones de despliegue: `mlx-lm` mediante `load`/`generate` en Python o la CLI `mlx_lm.generate`. Para llama.cpp, Ollama o vLLM sería necesario recurrir a otros formatos, por ejemplo la variante GGUF publicada por terceros (CVLTAI/Nanbeige4.3-33B-GGUF) o los pesos BF16 originales.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Tamaño | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-rtn-8bit | 33,1B denso | 524.288 | MLX safetensors, 8-bit RTN afín, group 64 | ~37,5 GB | other (hereda del base) | Apple Silicon |
| Nanbeige4.3-33B (BF16) | 33,1B denso | 524.288 | safetensors BF16 | ~62 GB | Apache 2.0 según fuentes secundarias | Multi-framework |
| Nanbeige4.3-33B-MLX-rtn-4bit | 33,1B denso | 524.288 | MLX, 4-bit RTN | ~22 GB | other | Apple Silicon |
| Nanbeige4.3-33B-MLX-rtn-3bit | 33,1B denso | 524.288 | MLX, 3-bit RTN | ~18 GB | other | Apple Silicon |
| CVLTAI/Nanbeige4.3-33B-GGUF | 33,1B denso | 524.288 | GGUF (llama.cpp) | no disponible | no disponible | CPU / GPU mixto |
| Qwen3.8-27B | 27B según su denominación (no verificado) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen3.8-27B aparece en la prensa especializada como rival directo en tareas de código, pero no se dispone de sus especificaciones ni de resultados de benchmarks en la información proporcionada, por lo que la comparación cuantitativa no es posible. Frente a las alternativas de la misma familia, este checkpoint de 8 bits es la opción de máxima fidelidad al BF16 a costa de ~15 GB más que la variante de 4 bits, que el propio autor describe como el mejor equilibrio calidad/tamaño.

## Limitaciones y advertencias

- Exclusividad de plataforma: los safetensors MLX no son compatibles con CUDA ni con inferencia solo-CPU en PyTorch o TensorFlow. El modelo solo se ejecuta en Apple Silicon con MLX.
- Sin compensación de error tipo GPTQ: al ser RTN puro, no hay corrección Hessiana. En 8 bits la degradación debería ser mínima, pero no está medida ni publicada para este checkpoint.
- Falta de evaluación: no hay benchmarks del artefacto cuantizado. Los 80,9 de Terminal-Bench 2.1 corresponden al modelo base en BF16.
- Licencia ambigua: el checkpoint declara `license: other` y remite a la licencia del modelo base. Las fuentes secundarias citan Apache 2.0 para Nanbeige4.3-33B, pero la verificación de condiciones de uso comercial debe hacerse sobre la tarjeta del modelo original antes de desplegar en producción.
- Idiomas: la información disponible apunta a un modelo bilingüe chino-inglés. El rendimiento en castellano no está documentado y debería evaluarse antes de asignarle tareas en ese idioma.
- Riesgo de alucinación: inherente a un modelo generativo de 33B sin mecanismos verificados de atribución; especialmente relevante en tareas de código y terminal, donde un comando incorrecto puede tener efectos destructivos.
- Contexto largo: aunque la ventana declarada es de 524.288 tokens, no se han publicado evaluaciones de recuperación de información en contextos extremos (tipo needle-in-a-haystack) para esta cuantización.
- Madurez y trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y está producido por un autor individual mediante un agente automatizado; conviene tratarlo como artefacto experimental y validar su comportamiento antes de integrarlo.
- Group size fijo en 64: cambiarlo obliga a recuantizar. Las métricas de calidad de otras configuraciones de grupo no están disponibles.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/hermitdave/Nanbeige4.3-33B-MLX-rtn-8bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante 4 bits: https://huggingface.co/hermitdave/Nanbeige4.3-33B-MLX-rtn-4bit
- Variante 3 bits: https://huggingface.co/hermitdave/Nanbeige4.3-33B-MLX-rtn-3bit
- Pipeline de cuantización `slq-mlx-port`: https://github.com/hermitdave/slq-mlx
- Agente utilizado para la cuantización: https://hermes-agent.nousresearch.com
- GGUF de terceros: https://huggingface.co/CVLTAI/Nanbeige4.3-33B-GGUF
- Guía del modelo base y resultados agénticos: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Análisis del modelo bilingüe: https://agihunt.info/en/p/1a1736d41c23a03374601997498
- Comparativa con Qwen3.8-27B en código: https://pasqualepillitteri.it/en/news/27138/nanbeige-4-3-33b-open-source-en
