# mradermacher/Qwen2.5-7B-Instruct-1M-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `saidutta69/Qwen2.5-7B-Instruct-1M-heretic`, una versión "abliterated" (sin censura) del Qwen2.5-7B-Instruct-1M de Alibaba. El autor, mradermacher, es un publicador habitual de cuantizaciones GGUF optimizadas para inferencia local en hardware de consumo. El modelo base combina la arquitectura Qwen2.5 de 7.6B parámetros con una ventana de contexto ampliada a 1M tokens, y la modificación "heretic" elimina los mecanismos de rechazo mediante la técnica de abliteration, permitiendo respuestas sin filtros de seguridad.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una vía práctica para ejecutar un modelo de 7B con contexto ultralargo en GPUs domésticas, gracias a la variedad de cuantizaciones (desde IQ1_S de 2.0 GB hasta Q5_K_M de 5.5 GB). Es especialmente útil para aplicaciones de roleplay, generación de contenido creativo y experimentación con modelos sin alineación, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, atención completa, no MoE) |
| Parametros totales | 7.615.616.512 (7.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (según el modelo base) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M (todas con imatrix) |
| Idiomas soportados | en (según la model card; el base Qwen2.5 soporta 29 idiomas, pero esta versión solo declara inglés) |
| Licencia | qwen (licencia personalizada de Qwen, con restricciones de uso comercial) |
| Formato de pesos | GGUF (con archivo imatrix separado) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct-1M es un transformer denso de 7.6B parámetros con atención estándar, entrenado por Alibaba sobre un dataset de hasta 18 trillones de tokens (según datos públicos de la familia Qwen2.5). La extensión a 1M de contexto se logra mediante interpolación de RoPE y entrenamiento adicional con secuencias largas. La versión "heretic" aplica abliteration, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los rechazos, resultando en un modelo que no se niega a responder a peticiones consideradas sensibles o prohibidas. La cuantización i1-GGUF utiliza una matriz de importancia (imatrix) calculada sobre un dataset de calibración para minimizar la pérdida de calidad en cada nivel de cuantización.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del Qwen2.5-7B-Instruct.
- Soporte de tool calling / function calling, permitiendo integración con APIs y herramientas externas.
- Capacidad de agentes y razonamiento multi-paso, útil para tareas complejas.
- Multilingüismo: el modelo base soporta 29 idiomas, aunque la model card de esta versión solo declara inglés; se recomienda verificar el comportamiento en otros idiomas.
- Sin censura (uncensored) gracias a la abliteration, lo que permite respuestas sin filtros de seguridad.
- Especialmente adecuado para roleplay y conversación prolongada gracias a la ventana de contexto de 1M tokens.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener personajes, historias y contextos extensos durante sesiones largas, aprovechando la ventana de 1M tokens para recordar detalles de capítulos anteriores.
- Asistente conversacional sin restricciones: para usuarios que necesitan respuestas directas sobre temas que otros modelos rechazan (por ejemplo, discusión de contenido adulto o temas tabú), siempre que se cumplan las leyes locales.
- Generación de contenido creativo: cuentos, guiones, diálogos y poesía con un estilo natural y sin limitaciones temáticas impuestas por alineación.
- Desarrollo de agentes locales: con soporte de tool calling, puede integrarse en pipelines de automatización que requieran razonamiento y ejecución de acciones.
- Prototipado de aplicaciones de chat: gracias a las cuantizaciones pequeñas, se puede desplegar en una GPU consumer para pruebas rápidas de producto.
- Investigación en alineación y seguridad: permite estudiar el efecto de la abliteration en el comportamiento del modelo y comparar con versiones alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K u otros en la model card. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (4.8 GB) se necesitan al menos 6-8 GB de VRAM con contexto corto; para IQ1_S (2.0 GB) bastan 3-4 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, o GPUs de datacenter como A10G o L4 para contextos más largos.
- En consumer GPU es viable con cuantizaciones Q4_K_M o inferiores, pero la ventana de 1M tokens requiere una memoria KV cache enorme (varios GB por token), por lo que en la práctica se recomienda reducir el contexto a 32K-128K para uso local.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) con soporte GGUF, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen de la GPU y la cuantización. En una RTX 4090 con Q4_K_M se pueden esperar velocidades de 30-50 tokens/s para contexto corto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct-1M-heretic (este) | 7.6B | 1M | qwen (restrictiva) | GGUF en HuggingFace |
| Qwen2.5-7B-Instruct (original) | 7.6B | 128K | qwen (restrictiva) | Safetensors, GGUF |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (permisiva) | Safetensors, GGUF |
| Mistral 7B Instruct v0.3 | 7.3B | 32K | Apache 2.0 | Safetensors, GGUF |

La principal diferencia de este modelo es la ventana de contexto de 1M (frente a 128K o 32K de las alternativas) y la ausencia de censura. Sin embargo, la licencia qwen impone restricciones de uso comercial, mientras que Llama 3.1 y Mistral ofrecen licencias más permisivas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar respuestas dañinas, ilegales o éticamente cuestionables. El uso debe ser responsable y cumplir con la legislación vigente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o con cuantizaciones agresivas.
- Idioma: la model card solo declara inglés; el comportamiento en otros idiomas no está garantizado.
- Licencia qwen: restringe el uso comercial y la redistribución; revisar los términos completos en el enlace de la licencia.
- Degradación por cuantización: los niveles más bajos (IQ1_S, IQ2_XXS) presentan pérdidas notables de coherencia y precisión; se recomienda usar Q4_K_M o superior para tareas críticas.
- La ventana de 1M tokens es teórica; en la práctica, la memoria necesaria para la KV cache hace inviable su uso completo en hardware consumer.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-1M-heretic-i1-GGUF
- Modelo base (versión heretic): https://huggingface.co/saidutta69/Qwen2.5-7B-Instruct-1M-heretic
- Modelo original Qwen2.5-7B-Instruct-1M: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M/blob/main/LICENSE
- Cuantizaciones estáticas (sin imatrix): https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-1M-heretic-GGUF
