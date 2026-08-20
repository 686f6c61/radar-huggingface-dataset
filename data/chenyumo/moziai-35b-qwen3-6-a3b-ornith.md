# chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith

## Resumen

MoziAI-35B-A3B-MOE (también denominado MoziAI V3.6) es un modelo de lenguaje de tipo MoE (Mixture of Experts) desarrollado por el equipo del analista financiero chino Chen Yumo (陈雨墨) para su despliegue local en entornos de consumo. Se basa en el modelo Ornith-1.0-35B, que a su vez deriva de las arquitecturas Qwen3.5-35B-A3B y Qwen3.6-35B-A3B, y ha sido ajustado y destilado específicamente para tareas financieras, cuantitativas y de programación, manteniendo capacidades generales de texto, visión y tool calling.

El modelo presenta 35.000 millones de parámetros totales con 3.000 millones activos por token, una ventana de contexto de 256.000 tokens y soporte para más de 200 idiomas. Su principal innovación es la cuantización propietaria MoziSmartBit, que reduce el modelo a aproximadamente 15,5 GB (frente a los ~70 GB del FP16) con una pérdida de precisión mínima (PPL 2,7446 en un dataset propio), lo que permite ejecutarlo en tarjetas gráficas de consumo con 20-24 GB de VRAM. Se distribuye en formato GGUF y es compatible con llama.cpp, Ollama y LM Studio.

El modelo se publica con una licencia personalizada ("other") y está etiquetado como "uncensored", sin restricciones de contenido en la generación, lo que puede ser útil para investigación y análisis, pero implica que el usuario asume la responsabilidad del contenido generado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5/3.6, 256 expertos enrutados + 1 experto compartido, 8 expertos activos por token |
| Parámetros totales | 34.660.610.688 (≈35B) |
| Parámetros activos | ≈3B (según nomenclatura "A3B") |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | MoziSmartBit (propietario, GGUF), también disponibles Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Más de 200 idiomas y dialectos; chino e inglés optimizados |
| Licencia | other (no especificada; la base Ornith-1.0-35B es MIT) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura MoE de Qwen3.5/3.6-35B-A3B, que combina atención híbrida (hybrid attention/delta) con un mecanismo de preservación de contexto de razonamiento entre turnos (Thinking Preservation). La estructura de expertos es 256 enrutados más 1 compartido, activando 8 por token, lo que permite un coste computacional bajo (3B activos) mientras se mantienen los 35B totales de conocimiento.

El entrenamiento consistió en un ajuste fino y destilación sobre el modelo base Ornith-1.0-35B, con un refuerzo específico en tareas financieras (análisis de mercado, cuantificación, tool calling) y programación. Se incluyó entrenamiento con razonamiento de cadena de pensamiento (CoT) para mejorar la lógica. La cuantización MoziSmartBit es una técnica propietaria que aplica una precisión diferencial por capas dentro del MoE, logrando una compresión de 4,5x frente a FP16 con una pérdida de precisión estimada en el 1% (PPL de 2,7446 en un dataset propio del autor). No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composición del corpus.

## Capacidades

- Generación de texto en múltiples idiomas, con énfasis en chino e inglés.
- Razonamiento avanzado con cadena de pensamiento (CoT) y preservación del contexto de razonamiento entre turnos.
- Comprensión de código y generación de código en lenguajes como Python, JavaScript, TypeScript, Go y Rust.
- Soporte de tool calling (function calling) para integrar fuentes de datos externas (mercados financieros, bases de datos, búsqueda de informes).
- Capacidad de agentes multi-paso y orquestación de tareas, compatible con frameworks como OpenClaw, Hermes, OpenCode, Cursor, Windsurf, Claude Code y Codex.
- Capacidades de visión: puede interpretar imágenes y capturas de pantalla, permitiendo análisis de gráficos financieros o capturas de interfaz.
- Entrada de texto-imagen (image-text-to-text) según la base Qwen3.6.
- Salida sin censura ("uncensored"): no aplica filtros de contenido, lo que permite discusiones abiertas sobre temas sensibles (para investigación y análisis).
- Soporte de contexto largo de 256K tokens, útil para procesar documentos extensos y análisis de series temporales.

## Casos de uso

- **Análisis financiero y de mercado**: el modelo puede procesar informes trimestrales, noticias macroeconómicas y datos de cotización para generar resúmenes de mercado, interpretar indicadores financieros y apoyar la toma de decisiones de inversión. Su ventana de contexto de 256K permite manejar grandes volúmenes de información de una sola vez.
- **Desarrollo de estrategias cuantitativas**: puede diseñar y explicar estrategias de trading cuantitativo, escribir código para plataformas como Pyramid/PEL, y sugerir factores y lógicas de backtesting. Su soporte de tool calling permite conectar con APIs de datos de mercado en tiempo real.
- **Atención al cliente y asistentes conversacionales**: al ser uncensored y multilingüe, puede desplegarse como asistente en plataformas de atención al cliente para resolver dudas sin restricciones temáticas, aunque se debe supervisar su salida para evitar respuestas inapropiadas.
- **Generación de informes y artículos**: puede redactar análisis de mercado, informes de investigación, resúmenes ejecutivos y contenido técnico en varios idiomas, con capacidad de mantener un estilo consistente durante largos documentos.
- **Desarrollo de software y depuración**: sirve como asistente de programación en entornos como Cursor o Windsurf, generando código, explicando arquitecturas y detectando errores. Su capacidad de razonamiento CoT facilita la depuración de problemas complejos.
- **Análisis de imágenes y documentos**: al soportar visión, puede extraer información de capturas de pantalla de gráficos financieros, tablas o documentos escaneados, facilitando el análisis de datos visuales sin OCR adicional.
- **Investigación y análisis de contenido no censurado**: para estudios académicos o análisis de contenido que requieren respuestas sin filtros de seguridad, el modelo permite explorar temas controvertidos o de límite sin restricciones automáticas (el usuario es responsable del uso).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato declarado por el autor es un valor de perplexity (PPL) de 2,7446 sobre un dataset propio, con un tamaño de modelo de 15,5 GB y arquitectura MoE-35B-A3B. Este valor no es comparable con otros modelos porque el dataset no está especificado.

| Métrica | Valor | Nota |
|---|---|---|
| Perplexity (PPL) | 2,7446 | Dataset propio, no verificado |
| Tamaño del modelo | 15,5 GB | Formato GGUF MoziSmartBit |

## Requisitos de hardware

- **VRAM mínima**: 20 GB para inferencia básica; 24 GB recomendados para usar visión y contexto largo completo.
- **GPU compatibles**: tarjetas de consumo como RTX 3060 12 GB (con descarga a CPU), RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (24 GB), y GPUs AMD con 20-24 GB (por ejemplo, AMD Radeon AI PRO R9700 de 32 GB).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, Jan y cualquier framework compatible con GGUF. También puede usarse con vLLM o TGI si se convierte a safetensors, aunque la distribución oficial es GGUF.
- **Rendimiento declarado**: con la cuantización MoziSmartBit, el autor indica velocidades de generación de 140+ tokens/s en una AMD R700 (Radeon AI PRO R9700) y 70+ tokens/s en una APU AMD MAX+395 (CPU con iGPU). No se aportan datos de latencia en otras GPUs.
- **Memoria RAM**: se recomienda al menos 32 GB de RAM para manejar el contexto de 256K sin degradar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoziAI-35B-A3B (este) | 35B | 3B | 256K | MoziSmartBit (GGUF) | other | HuggingFace |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 256K (extensible a 1M) | FP16, GGUF | Apache 2.0 | HuggingFace |
| Qwen3.6-27B (dense) | 27B | 27B | 256K | FP16, GGUF | Apache 2.0 | HuggingFace |

No hay datos de benchmarks comparativos entre estos modelos. El MoziAI se diferencia por su especialización financiera, su cuantización más agresiva (15,5 GB vs ~21 GB de Q4_K_M) y su carácter uncensored. El base Qwen3.6-35B-A3B ofrece mayor velocidad de inferencia (según los análisis de Qwen3.6, el MoE es 3-4x más rápido que el dense de 27B), pero MoziAI añade una capa de ajuste de dominio.

## Limitaciones y advertencias

- **Licencia "other"**: no se especifica una licencia estándar; aunque el base es MIT, el modelo derivado puede tener restricciones de uso comercial no documentadas. Se recomienda contactar al autor antes de usar en producción.
- **Contenido sin censura**: el modelo está diseñado para no filtrar contenido, lo que puede generar respuestas inapropiadas, ilegales o dañinas si se usa sin supervisión. El autor declara que el usuario es responsable del uso.
- **Riesgo de alucinación**: aunque el autor afirma que la cuantización reduce la alucinación, no se han publicado evaluaciones estándar de factibilidad. El uso en contextos financieros requiere verificación de datos.
- **Sesgos y alineación**: no se han documentado estudios de sesgos. El entrenamiento se centra en datos financieros y chinos, por lo que puede tener un sesgo geográfico o cultural en otras regiones.
- **Benchmarks incompletos**: solo se aporta un valor de PPL sobre un dataset propio, sin comparación con otros modelos. No hay evidencia de rendimiento en tareas estándar.
- **Restricciones de contexto**: aunque soporta 256K tokens, el rendimiento en contexto largo puede degradarse si la memoria de la GPU es insuficiente (se recomienda 24 GB para el máximo).
- **Dependencia del base**: el modelo hereda las limitaciones de Qwen3.6, como posibles errores en razonamiento matemático complejo o generación de código incorrecto en casos extremos.

## Enlaces

- [HuggingFace - chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith](https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith)
- [GitHub - chenyumo166/moziAI](https://github.com/chenyumo166/moziAI)
- [Qwen 3.6 Complete Guide: 27B Dense, 35B-A3B MoE, and Which to Use](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Qwen3.6 Models | QwenLM/Qwen3.6 | DeepWiki](https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models)
- [Qwen 3.6: 35B vs 27B comparison - benchmark results](https://zoliben.com/en/posts/2026-04-23-qwen-36-35b-vs-27b-benchmark-results/)
