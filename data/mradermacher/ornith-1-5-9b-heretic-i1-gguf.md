# mradermacher/Ornith-1.5-9B-heretic-i1-GGUF

## Resumen

Ornith-1.5-9B-heretic-i1-GGUF es una cuantización GGUF con imatrix del modelo Ornith-1.5-9B-heretic, creada por el usuario mradermacher. El modelo original, desarrollado por DeepReinforce dentro de la familia Ornith 1.5, es un modelo denso de 9 000 millones de parámetros especializado en tareas de codificación y razonamiento agéntico, con capacidades multimodales (texto e imagen). La variante "heretic" parece ser una versión sin censura o ajustada para eliminar restricciones, aunque no se dispone de documentación oficial al respecto.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 9B con ventana de contexto de 262 144 tokens en hardware de consumo, como una GPU de 8 GB o un Mac con 16 GB de RAM unificada, gracias a las cuantizaciones de 4 bits. Esto democratiza el acceso a un modelo que, según sus benchmarks, compite con modelos mucho más grandes en tareas de ingeniería de software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (no se dispone de detalle adicional) |
| Parametros totales | 9 000 millones (según fuentes externas; el dato de HuggingFace de 1 278 200 es inconsistente y probablemente erróneo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens, extensible a ~1 000 000 mediante YaRN RoPE scaling |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo Ornith-1.5-9B-heretic. Según el blog de atomic.chat, se trata de un modelo denso multimodal de 9B parámetros orientado a codificación, lo que sugiere una arquitectura transformer estándar con codificador de visión para entrada de imágenes. El contexto nativo de 262 144 tokens indica el uso de atención con ventana larga, probablemente con mecanismos como RoPE y posiblemente atención dispersa o lineal para gestionar la longitud.

En cuanto al entrenamiento, no hay datos públicos sobre el número de tokens, composición del dataset o técnicas de alineación (RLHF, DPO, etc.). La variante "heretic" podría haber sido sometida a un ajuste fino adicional para eliminar restricciones de seguridad, pero esto es especulativo y no está documentado. La cuantización GGUF de mradermacher utiliza imatrix (importance matrix) para optimizar la precisión de los pesos cuantizados, una técnica que mejora la calidad de la cuantización en modelos con distribuciones de activaciones no uniformes.

## Capacidades

- Generación de código y autocompletado en múltiples lenguajes de programación.
- Razonamiento agéntico multi-paso: puede planificar y ejecutar tareas complejas de ingeniería de software.
- Comprensión de imágenes (multimodal): capaz de interpretar capturas de pantalla, diagramas o UI para generar código correspondiente.
- Soporte de tool calling y function calling, lo que permite integrarse en pipelines de agentes.
- Ventana de contexto muy larga (262K tokens) que permite procesar repositorios completos o documentación extensa.
- Capacidades multilingües en texto, aunque no se especifican los idiomas exactos.
- Posible modo "thinking" o razonamiento extendido, común en modelos de la familia Ornith, aunque no confirmado para esta variante.

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar código, generar funciones y refactorizar, gracias a su entrenamiento específico en codificación y su ventana de contexto que permite incluir el archivo completo y dependencias.
- Agente autónomo de resolución de incidencias: con tool calling, puede buscar en la base de código, ejecutar tests y proponer parches, similar a lo que demuestra su 70,6% en SWE-bench Verified.
- Análisis de capturas de pantalla para desarrollo frontend: al ser multimodal, puede convertir una imagen de una interfaz en código HTML/CSS o React.
- Revisión de código automatizada: con contexto de 262K tokens, puede analizar pull requests completas y detectar bugs o problemas de estilo.
- Generación de documentación técnica: puede leer un repositorio completo y generar documentación coherente, aprovechando la ventana larga.
- Chatbot técnico de soporte: integrado en un sistema de tickets, puede responder preguntas sobre APIs, librerías o fragmentos de código con precisión.
- Automatización de tareas de DevOps: mediante tool calling, puede ejecutar comandos, leer logs y diagnosticar fallos en entornos de CI/CD.

## Benchmarks y rendimiento

Los siguientes datos provienen de Benchgen y corresponden al modelo Ornith-1.5-9B original, no a la cuantización GGUF específica. Se asume que la cuantización mantiene un rendimiento cercano, pero no se ha verificado.

| Benchmark | Resultado |
|---|---|
| Terminal Bench 2.1 (Claude Code harness) | 47,0% |
| SWE-bench Verified | 70,6% |

Según la misma fuente, estos resultados igualan o superan a modelos mucho más grandes como Gemma 4-31B y Qwen 3.6-35B. No se dispone de resultados para MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: según el blog de atomic.chat, a cuantización de 4 bits (Q4_K_M) el modelo ocupa aproximadamente 5-6 GB, por lo que cabe en una GPU de 8 GB (por ejemplo, RTX 3060, RTX 4060) o en un Mac con 16 GB de RAM unificada.
- Para cuantizaciones más altas (Q6_K, Q8_0) se necesitarían 8-10 GB de VRAM, recomendándose GPUs como RTX 3080/4080 o A100.
- El modelo puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI, o el propio Atomic Chat mencionado en el blog.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, se espera una generación de 20-40 tokens por segundo a 4 bits, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de codificación de tamaño similar (por ejemplo, Qwen2.5-Coder-7B, DeepSeek-Coder-6.7B, CodeLlama-7B) en la información proporcionada. Los únicos datos comparativos son los benchmarks mencionados, que lo sitúan por encima de Gemma 4-31B y Qwen 3.6-35B en tareas de ingeniería de software, a pesar de tener menos parámetros. Sin embargo, no se han encontrado tablas comparativas con métricas estandarizadas como HumanEval o MMLU.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que supone un riesgo legal para uso comercial. Se recomienda contactar con el autor original (Dingdust) o con DeepReinforce antes de desplegarlo en producción.
- La variante "heretic" sugiere que se han eliminado mecanismos de seguridad, lo que puede generar contenido ofensivo, sesgado o peligroso. No es adecuado para aplicaciones donde se requiera moderación estricta.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB y 0 descargas, lo que indica que puede estar vacío o que la información no se ha actualizado. Es posible que los archivos GGUF no estén realmente disponibles.
- No se han publicado resultados de benchmarks específicos para la cuantización, por lo que el rendimiento real puede variar respecto al modelo original.
- El modelo puede alucinar en tareas de razonamiento complejo, especialmente con contextos muy largos donde la atención puede degradarse.
- No se conoce el soporte de idiomas; probablemente esté optimizado para inglés y código, con capacidades limitadas en otros idiomas.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Ornith-1.5-9B-heretic-i1-GGUF
- Modelo original de Dingdust: https://huggingface.co/Dingdust/Ornith-1.5-9B-heretic
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Página de benchmarks (Benchgen): https://benchgen.com/models/ornith-deepreinforce/ornith-1-5-9b
- Sitio oficial de Ornith AI: https://ornith.online/
