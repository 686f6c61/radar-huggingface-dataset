# inception42/Jais-3-MoVA-36B-A4B

## Resumen

Jais-3-MoVA-36B-A4B es un modelo de generación de texto de tipo Mixture-of-Experts (MoE) desarrollado por inception42 (familia Jais-3, también referenciada como IFM). Combina una arquitectura de mezcla de expertos dispersa —36B parámetros totales con aproximadamente 4B activos por token— con un mecanismo de atención denominado MoVA (Mixture-of-Values attention). El modelo está orientado a razonamiento, conversación y generación de texto, con una ventana de contexto declarada de 512K tokens.

Su relevancia radica en la combinación de tres factores: una ventana de contexto extremadamente larga (512K), un coste de inferencia por token reducido gracias a la activación dispersa (~4B activos de 36B totales) y una licencia Apache 2.0 permisiva, que permite uso comercial sin restricciones adicionales. El modelo está publicado con pesos en safetensors y dispone de formatos alternativos (FP8, GGUF y MLX) para distintos entornos de despliegue.

Los idiomas declarados oficialmente son árabe (ar) e inglés (en). El repositorio principal ocupa 898,7 GB, coherente con un modelo de 37.444.792.020 parámetros en precisión completa y múltiples artefactos asociados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA), transformer |
| Parámetros totales | 37.444.792.020 (~37,4B; el autor declara 36B nominales) |
| Parámetros activos | ~4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantización | FP8, GGUF (para llama.cpp y Ollama), MLX 4-bit, MLX 8-bit, MLX bf16; pesos base en bf16/safetensors |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal); GGUF, MLX y FP8 en repositorios derivados |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas MoE: dispone de 36B parámetros almacenados pero solo activa aproximadamente 4B por token, lo que reduce el coste computacional de la inferencia frente a un modelo denso equivalente. La innovación arquitectónica destacada por el autor es MoVA (Mixture-of-Values attention), un mecanismo de atención que, según la denominación, opera sobre una mezcla de valores en lugar de una atención estándar. No se dispone en la información proporcionada de detalles sobre el número de expertos, la estrategia de enrutamiento, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El identificador de etiqueta `k2_horizon` y la referencia a un preprint (arXiv:2611.10224) sugieren la existencia de documentación técnica adicional, pero su contenido no está incluido en los datos disponibles. El modelo se distribuye con `custom_code`, lo que implica que requiere `trust_remote_code=True` y código propio para cargarse en transformers.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento (tag `reasoning`), incluyendo presumiblemente razonamiento multi-paso, aunque no se detalla el formato (thinking mode explícito no confirmado).
- Procesamiento de contextos muy largos: ventana declarada de 512K tokens, adecuada para documentos extensos, repositorios de código o historiales de conversación prolongados.
- Capacidades multilingües limitadas a árabe e inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente `text-generation`.

## Casos de uso

- Análisis de documentación jurídica o regulatoria extensa: la ventana de 512K tokens permite ingerir contratos, expedientes o normativa completa en una sola pasada sin fragmentación por chunking, reduciendo la pérdida de contexto entre secciones.
- Asistentes conversacionales de larga duración: con contexto de 512K, el modelo puede mantener historiales de conversación muy prolongados y recordar interacciones anteriores sin resúmenes intermedios.
- Procesamiento de corpus en árabe: es uno de los pocos modelos abiertos de esta escala con soporte nativo declarado para árabe, útil para resumen, extracción de información y generación en ese idioma.
- Revisión de repositorios de código completos: la ventana larga permite cargar múltiples ficheros de un proyecto para tareas de análisis, explicación o detección de inconsistencias entre módulos.
- Despliegue en entornos con recursos limitados: gracias a los ~4B parámetros activos, la inferencia es más barata que la de un modelo denso de 36B; las variantes GGUF y MLX permiten ejecución en llama.cpp, Ollama y Apple Silicon respectivamente.
- Generación de texto a gran escala con licencia permisiva: Apache 2.0 permite integrar el modelo en productos comerciales, pipelines de generación de contenido o servicios SaaS sin obligaciones de atribución adicionales más allá de las de la licencia.
- Investigación sobre arquitecturas MoE y atención MoVA: el modelo y su preprint asociado sirven como base para experimentación académica sobre eficiencia de atención y enrutamiento de expertos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks (referenciada como imagen y tabla HTML) frente a Falcon-H1-34B-Instruct, Gemma-4-31B-it, Muse-Glimmer-30B, Qwen3.8-27B y Fanar-2-27B. Sin embargo, los valores numéricos de las métricas no están disponibles en la información proporcionada: solo se exponen las filas de número de parámetros, parámetros activos y arquitectura (36B/4B/MoE para Jais-3-MoVA frente a modelos densos de 27B–34B). Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo completo (~37,4B parámetros) requiere aproximadamente 75 GB de VRAM solo para pesos, más overhead de activaciones y KV cache. La variante FP8 reduce esto a unos 37–40 GB.
- La ventana de 512K tokens implica un KV cache muy grande; para contextos largos reales se necesitará memoria adicional significativa o técnicas de atención eficiente / offloading.
- GPU recomendadas: para bf16 completo, H100 80 GB, A100 80 GB o múltiples GPU de 40–48 GB (A6000, L40S) con tensor parallelism. Para FP8, una H100 o A100 80 GB puede ser suficiente en configuraciones optimizadas.
- GPU de consumo: la variante GGUF cuantizada (Q4/Q5) podría caber en GPUs con 24 GB (RTX 4090) o 32 GB, aunque con contexto limitado por el KV cache. Las variantes MLX 4-bit están pensadas para Apple Silicon con memoria unificada amplia (por ejemplo, Mac Studio con 64–128 GB).
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp y Ollama (vía GGUF), MLX en Apple Silicon, y presumiblemente vLLM/TGI para serving en GPU, aunque la compatibilidad explícita con vLLM no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B | 36B | 4B | 512K | Apache 2.0 | HF (safetensors, FP8, GGUF, MLX) |
| Falcon-H1-34B-Instruct | 34B | 34B (denso) | no disponible | no disponible | HF |
| Gemma-4-31B-it | 31B | 31B (denso) | no disponible | no disponible | HF |
| Qwen3.8-27B | 27B | 27B (denso) | no disponible | no disponible | HF |
| Fanar-2-27B | 27B | 27B (denso) | no disponible | no disponible | HF |

La ventaja estructural del Jais-3-MoVA frente a los comparadores listados es la activación dispersa (~4B activos frente a modelos densos de 27B–34B), que reduce el coste por token, junto con la ventana de 512K, muy superior a la de los modelos densos comparables habituales. Los datos de rendimiento comparado no están disponibles numéricamente en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: solo árabe e inglés declarados; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en contextos muy largos donde la recuperación de información distante puede degradarse.
- Sesgos: no se documentan en la información disponible evaluaciones de sesgo; los datos de entrenamiento y su composición no están detallados.
- Contexto largo: aunque se declara 512K, el rendimiento efectivo en ventanas extremas no está verificado con benchmarks publicados en la información disponible; el coste de KV cache puede limitar su uso práctico.
- Carga con código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de desplegarlo en producción.
- Tool calling y modo agente: no confirmados; si el caso de uso depende de function calling, debe validarse empíricamente antes de adoptar el modelo.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las licencias de los formatos derivados (FP8, GGUF, MLX) publicados en repositorios separados.
- Tamaño del repositorio: 898,7 GB en total, lo que exige planificación de almacenamiento y ancho de banda considerables para la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-MoVA-36B-A4B
- Colección Jais-3 (IFM): https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante FP8: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-FP8
- Variante GGUF (llama.cpp / Ollama): https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-GGUF
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Preprint referenciado en las etiquetas: arXiv:2611.10224 (contenido no disponible en la información proporcionada)
