# bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo `bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF` es una cuantización GGUF con imatrix del modelo `orcarouter/Qwen3.8-27B-Uncensored`, una versión "abliterated" (eliminación de rechazos) del modelo Qwen3.8-27B de Qwen. El trabajo de cuantización lo realiza bartowski, un conocido proveedor de formatos GGUF optimizados para ejecución local con llama.cpp y sus derivados. El modelo resultante es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), soporte nativo de visión (entrada de imágenes), razonamiento, tool calling y un cabezal MTP para decodificación especulativa.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una versión sin restricciones de rechazo (refusal) pensada para tareas de red teaming y evaluación de seguridad en IA; por otro, su formato GGUF permite desplegarlo en hardware de consumo con cuantizaciones desde 2 bits hasta 16 bits, incluyendo un archivo mmproj para el proyector de visión. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y de investigación. El repositorio incluye múltiples niveles de cuantización, con un tamaño total de 479,8 GB para todos los archivos, y el archivo recomendado por defecto es la versión Q4_K_M de 17,77 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet lineal + atención completa (dense) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_XL, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L (y otros niveles adicionales) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo mmproj separado para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` de Qwen emplea una arquitectura densa híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que permite manejar secuencias largas con un coste computacional reducido en comparación con la atención estándar. Incluye además un cabezal MTP (Multi-Token Prediction) que habilita decodificación especulativa, acelerando la generación de texto. El modelo original es nativamente multimodal (visión-lenguaje), con un proyector de visión que se distribuye como archivo mmproj en la versión GGUF.

El proceso de entrenamiento de `orcarouter/Qwen3.8-27B-Uncensored` consistió en un post-entrenamiento de tipo "abliteration" sobre el modelo base, que elimina los patrones de rechazo (refusal) aprendidos durante el alineamiento. Esto produce un modelo que responde a solicitudes que el modelo original rechazaría, orientado a tareas de red teaming y evaluación de seguridad. La cuantización de bartowski se realizó con llama.cpp versión b10630, aplicando imatrix (importance matrix) para optimizar la distribución de errores de cuantización. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el proceso de abliteration.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene las capacidades de razonamiento del Qwen3.8-27B, incluyendo un modo de pensamiento (thinking) que se activa mediante el prompt de sistema con "Reasoning effort is set to xhigh".
- Visión y lenguaje: acepta entrada de imágenes junto con texto, gracias al proyector de visión (mmproj) incluido en el paquete GGUF.
- Tool calling y function calling: soporta invocación de herramientas, lo que permite integrarlo en flujos de agentes.
- Decodificación especulativa: el cabezal MTP permite acelerar la generación cuando se usa con llama.cpp u otros motores compatibles.
- Multilingüe: soporta inglés y chino, con capacidad de comprensión y generación en ambos idiomas.
- Sin rechazos (uncensored): al estar abliterated, responde a solicitudes que el modelo original rechazaría, lo que lo hace útil para pruebas de seguridad y análisis de sesgos.

## Casos de uso

- Red teaming de modelos de IA: el modelo puede usarse para generar prompts adversarios y evaluar la robustez de otros sistemas frente a solicitudes maliciosas o sensibles, gracias a su ausencia de rechazo.
- Evaluación de sesgos y alucinaciones: al no filtrar contenido, permite estudiar los sesgos subyacentes del modelo base y medir la tendencia a alucinar en dominios sensibles.
- Asistente multimodal local: con el archivo mmproj, puede procesar imágenes y responder preguntas sobre ellas, por ejemplo en aplicaciones de documentación visual o análisis de capturas.
- Generación de código con herramientas: su soporte de tool calling permite integrarlo en pipelines de desarrollo donde necesite invocar funciones externas, como ejecutar pruebas o consultar APIs.
- Investigación en alineamiento y seguridad: sirve como contrapunto a modelos alineados para estudiar el efecto de la abliteration en el comportamiento y la calidad de las respuestas.
- Chat conversacional sin filtros: para entornos controlados donde se requiera explorar temas que los modelos comerciales censuran, siempre con supervisión humana y fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta versión cuantizada ni para el modelo base abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. La versión Q4_K_M ocupa 17,77 GB, por lo que cabe en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A5000). La versión Q8_0 ocupa 29,12 GB, requiriendo GPUs de 32 GB o más (A100 40GB, H100). La versión bf16 ocupa 54,66 GB y necesita GPUs de 64 GB o más.
- GPU recomendadas: para uso en consumer, una RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 y Q5. Para Q6 y Q8 se recomienda una A100 40GB o H100. En Apple Silicon, las versiones Q4_1 y Q4_K_M funcionan bien con Metal.
- Opciones de despliegue: llama.cpp (CPU, CUDA, Metal, ROCm), Ollama (disponible en el repositorio de Ollama), y cualquier motor compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no se proporcionan datos específicos. Con decodificación especulativa MTP, se espera una mejora notable en tokens por segundo frente a la decodificación autoregresiva estándar, aunque el rendimiento exacto depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Sí | Sí | Apache 2.0 | safetensors |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | No disponible | Sí | Sí | Apache 2.0 | safetensors, GGUF |
| bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF | 27B | No disponible | Sí (con mmproj) | Sí | Apache 2.0 | GGUF |

La principal diferencia frente al modelo original es la eliminación de rechazos (abliteration) y la disponibilidad en formato GGUF cuantizado. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterated, el modelo puede exhibir sesgos más pronunciados que la versión alineada, ya que no filtra contenido potencialmente dañino. No se han publicado evaluaciones de sesgo específicas.
- Riesgo de alucinación: sin datos de benchmarks, no se puede cuantificar la tasa de alucinación. Se recomienda verificar las respuestas en dominios críticos.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en la información disponible. El soporte de idiomas se limita a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el contenido generado puede ser sensible. El uso de este modelo para actividades ilegales o dañinas es responsabilidad del usuario.
- Caveat para producción: al ser un modelo "uncensored", no es adecuado para aplicaciones orientadas al público sin un filtro de seguridad adicional. Su uso principal es investigación, red teaming y evaluación de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF
- Modelo original (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Blog de orcarouter sobre la versión GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Página en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- README del modelo original en GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF/blob/main/README.md
