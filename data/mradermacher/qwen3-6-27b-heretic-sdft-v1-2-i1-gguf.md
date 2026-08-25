# mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con imatrix del modelo `ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2`, realizada por mradermacher, un autor especializado en la conversión de modelos a formatos optimizados para inferencia local. El modelo base es una versión "heretic" de Qwen3.6-27B, es decir, un modelo al que se le ha eliminado el alineamiento de seguridad mediante la técnica de ablación direccional (abliteration), desarrollada en la herramienta de código abierto Heretic. Esto lo hace adecuado para tareas de roleplay, generación de contenido explícito y conversación sin filtros, aunque con los riesgos asociados a la ausencia de moderación.

El modelo base tiene 27.320.697.856 parámetros (27,3B) y, según la model card, es un modelo de visión, aunque no se especifican más detalles sobre su arquitectura interna. La cuantización ofrecida aquí incluye varios niveles de compresión (i1-Q2_K, i1-IQ3_M, i1-Q4_K_S) que permiten ejecutarlo en hardware de consumo con requisitos de VRAM variables. La licencia declarada es Apache 2.0, aunque el contenido generado puede ser problemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6-27B, probablemente transformer denso) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB); otros quants en el repositorio estatico |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base `ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2` es una variante de Qwen3.6-27B a la que se ha aplicado el proceso "Heretic", una técnica de ablación direccional (abliteration) que elimina el safety alignment sin necesidad de post-entrenamiento costoso. Esta técnica combina una implementación avanzada de ablación direccional (basada en los trabajos de Arditi et al. 2024 y Lai 2025) con un optimizador de parámetros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. El resultado es un modelo que responde sin los filtros habituales de seguridad, lo que lo hace útil para investigacion sobre alineamiento o para aplicaciones de roleplay sin restricciones.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se utilizaron tecnicas como RLHF o DPO. La cuantizacion GGUF con imatrix realizada por mradermacher optimiza la calidad de los pesos comprimidos mediante la generacion de una matriz de importancia (imatrix) a partir de un conjunto de datos de calibracion, lo que mejora la precision de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto sin censura ni filtros de seguridad, incluyendo contenido explicito, violento o peligroso.
- Roleplay conversacional multi-turno, con capacidad para mantener personajes y contextos narrativos.
- Soporte de vision (segun la model card, es un modelo de vision, aunque no se especifican detalles de las capacidades multimodales).
- Conversacion general en ingles, con estilo natural y sin restricciones tematicas.
- No se menciona soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Roleplay sin restricciones: el modelo puede mantener conversaciones de rol con personajes ficticios, escenarios eroticos o tematicas adultas sin los bloqueos habituales de los modelos alineados. Su naturaleza "heretic" permite una libertad creativa total, aunque con riesgos eticos y legales.
- Generacion de narrativa explicita: escritura de ficcion con contenido adulto, dialogos subidos de tono o escenas violentas, util para autores que necesitan un asistente sin limitaciones.
- Investigacion sobre alineamiento y seguridad: al ser un modelo abliterado, permite estudiar los efectos de la eliminacion del safety alignment en el comportamiento de un LLM, comparandolo con la version original de Qwen3.6-27B.
- Pruebas de robustez de sistemas de moderacion: se puede usar para evaluar la eficacia de filtros de contenido en aplicaciones de produccion, generando entradas que deberian ser bloqueadas.
- Asistente conversacional sin filtros en entornos controlados: para usuarios que necesitan respuestas directas sin evasivas sobre temas sensibles, siempre que se asuman los riesgos legales y eticos.
- Desarrollo de agentes de rol en juegos de texto: integracion en motores de juego o chatbots de rol que requieren respuestas sin censura para mantener la inmersion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo cuantizado ni para su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el quant elegido, se necesitan aproximadamente 12 GB para i1-Q2_K (11,0 GB), 14 GB para i1-IQ3_M (12,9 GB) y 17 GB para i1-Q4_K_S (15,9 GB), considerando overhead de contexto y runtime.
- GPU recomendadas: para el quant Q4_K_S se recomienda una RTX 3090, RTX 4090 o A100 con 24 GB o mas. Para los quants mas pequenos, una RTX 3060 12 GB o RTX 4070 pueden ser suficientes.
- Si cabe en GPU de consumo: si, los quants i1-Q2_K e i1-IQ3_M caben en GPUs de 12-16 GB, aunque con perdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no disponibles. Dependen del hardware y del quant utilizado; en una RTX 4090 con Q4_K_S se puede esperar una velocidad de generacion de 30-50 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base Qwen3.6-27B no tiene una ficha publica detallada en la informacion proporcionada, y no se conocen alternativas directas con el mismo tamano y caracteristicas "heretic". Se puede mencionar que existen otros repositorios de mradermacher con cuantizaciones de Qwen3.6-27B-heretic (por ejemplo, `mradermacher/Qwen3.6-27B-heretic-GGUF`), pero sin datos de rendimiento comparables.

## Limitaciones y advertencias

- Contenido peligroso: al ser un modelo sin alineamiento, puede generar instrucciones para actividades ilegales, violencia, abuso o discurso de odio. Su uso en produccion o en entornos publicos es altamente desaconsejable.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o informacion falsa, especialmente en contextos de roleplay o conversacion libre.
- Idioma limitado: solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia: aunque la licencia declarada es Apache 2.0, el contenido generado puede violar terminos de servicio de plataformas o leyes locales. El usuario asume toda la responsabilidad.
- Sin garantias de calidad: al ser una cuantizacion de un modelo abliterado, la calidad de las respuestas puede degradarse en comparacion con el modelo original, especialmente en los quants de menor precision.
- No hay informacion sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-i1-GGUF
- Repositorio estatico con quants adicionales: https://huggingface.co/mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Repositorio relacionado de mradermacher: https://huggingface.co/mradermacher/Qwen3.6-27B-heretic-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
