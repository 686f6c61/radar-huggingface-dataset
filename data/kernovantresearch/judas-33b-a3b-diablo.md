# kernovantresearch/Judas-33B-A3B-DIABLO

## Resumen

Judas-33B-A3B-DIABLO es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por kernovantresearch, obtenido mediante un fine-tune profundo sobre poolside/Laguna-XS-2.1, un modelo base de 33.442.617.088 parámetros totales con 8 de 256 expertos activos por token (de ahí la denominación "A3B", que corresponde a unos 3.000 millones de parámetros activos por token). El modelo ha sido sometido a un proceso de "abliteration" con la herramienta Heretic para eliminar el comportamiento de rechazo, y posteriormente se ha reentrenado con un corpus orientado a seguridad y desarrollo (kernovantresearch/QTE) que aporta competencia técnica real en esos dominios, además de mejorar indirectamente la capacidad general de código.

La propuesta del autor es un asistente generalista sin rechazos que mantiene el rendimiento del modelo base e incluso lo supera en tareas de programación competitiva: según la model card, en LiveCodeBench v6 (34 problemas retenidos, dos repeticiones) resuelve 18 problemas en ambas repeticiones frente a 15 del Laguna XS 2.1 original, con un razonamiento aproximadamente cinco veces más corto y un 40 % menos de tokens consumidos. El modelo está pensado para uso conversacional, agéntico, con soporte de tool calling y con profundidad específica en seguridad informática.

La relevancia actual del modelo reside en su combinación de tres factores poco habituales: un MoE de 33B con solo ~3B activos (eficiente en inferencia), un proceso de decensura que según el autor no degrada la capacidad, y una distribución en GGUF con cuantización propia (DIABLO, basada en imatrix) lista para despliegue local. El acceso está restringido mediante gating manual para limitar usos malintencionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 8 de 256 expertos activos por token |
| Parámetros totales | 33.442.617.088 |
| Parámetros activos | ~3B por token (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con cuantización propia "DIABLO" basada en imatrix (corpus de calibración: kernovantresearch/DIABLO-imatrix); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face), con acceso restringido mediante gating manual |
| Formato de pesos | GGUF (tamaño del repo: 21,1 GB); safetensors referenciados en los metadatos de parámetros |

## Arquitectura y entrenamiento

El modelo parte de poolside/Laguna-XS-2.1, un transformer con mezcla de expertos de 33,44B parámetros totales y 8 de 256 expertos activos por token, lo que sitúa el cómputo por token en el orden de los 3B parámetros. Sobre esa base se aplicó primero un proceso de abliteration con Heretic para eliminar el comportamiento de rechazo y, a continuación, un fine-tune "pesado" según el autor, con datos de entrenamiento publicados en kernovantresearch/QTE. Ese corpus está compuesto mayoritariamente por código de uso cotidiano (no exclusivamente material de seguridad), lo que explica que la mejora en seguridad viniera acompañada de una mejora no buscada en capacidad general de programación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO en esta fase. Tampoco se detalla la innovación arquitectónica interna del modelo base (tipo de atención, positional encoding, etc.). La model card menciona un chat template y un system prompt personalizados escritos específicamente para este modelo, y destaca que el tool calling se mantuvo estable tras la cuantización en las comprobaciones del autor.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento "lean" (breve) en tareas ordinarias.
- Programación competitiva y resolución de problemas algorítmicos: supera al modelo base en LiveCodeBench v6 según los datos del autor.
- Generación de código general, incluyendo código de producción y scripts de automatización.
- Seguridad informática aplicada: análisis de escenarios, razonamiento sobre sistemas y escritura de código de seguridad funcional.
- Tool calling / function calling, con estabilidad mantenida tras la cuantización según las comprobaciones del autor.
- Uso agéntico: capacidad de perseguir un objetivo a través de bucles largos de uso de herramientas sin que el bucle se rompa (impresión cualitativa del autor, no medida con benchmark).
- Razonamiento extendido en problemas difíciles: mantiene variantes de trabajo en lugar de responder a la ligera, con presupuestos de salida recomendados de 64k tokens o más.
- Sin comportamiento de rechazo (modelo decensurado/abliterado).
- Capacidades multilingües: no disponibles en la información proporcionada (la model card incluye una prueba con documentación técnica en ruso, lo que sugiere cierto soporte, pero no se especifica el conjunto de idiomas).

## Casos de uso

- Asistente general sin restricciones de contenido: conversación multi-turno para usuarios que necesitan respuestas sin rechazos en dominios sensibles (investigación, escritura técnica, educación), aprovechando el fine-tune que preserva la coherencia conversacional.
- Pruebas de seguridad autorizadas: análisis de escenarios de amenaza, revisión de configuraciones y generación de código de herramientas de seguridad, con la profundidad técnica aportada por el corpus QTE.
- Desarrollo de herramientas de seguridad: escritura de scripts de automatización, parsers y utilidades para pipelines de pentesting autorizado, gracias a la combinación de capacidad de código y conocimiento de dominio.
- Programación competitiva y entrenamiento algorítmico: resolución de problemas de nivel medio y difícil con razonamiento corto y eficiente en tokens, adecuado para entornos con presupuesto de cómputo limitado.
- Agentes autónomos con tool calling: integración en bucles agénticos de larga duración (consulta de APIs, ejecución de comandos, iteración sobre resultados) donde la estabilidad del formato de llamada a herramientas es crítica.
- Asistencia de código en producción: generación y revisión de código en pipelines de CI/CD, con la ventaja de un MoE de ~3B activos que reduce el coste de inferencia frente a modelos densos de tamaño similar.
- Despliegue local en hardware de consumo: al distribuirse en GGUF con cuantización imatrix, puede ejecutarse con llama.cpp u Ollama en equipos con VRAM moderada, útil para desarrollo offline y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

| Benchmark | Judas-33B-A3B-DIABLO | Laguna XS 2.1 (base) |
|---|---|---|
| LiveCodeBench v6 (34 problemas, 2 repeticiones) | 18 resueltos en ambas repeticiones | 15 |
| LiveCodeBench v6, tier medio | 18 de 22 intentos | 14 de 22 intentos |
| LiveCodeBench v6, tier difícil | 10 de 32 intentos | 7 de 32 intentos |
| Longitud de razonamiento | ~5 veces más corta | referencia |
| Tokens consumidos | ~40 % menos | referencia |

Los datos proceden de la model card del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la prueba de documentación técnica en ruso en la información disponible. Las cifras de eficiencia (longitud de razonamiento y consumo de tokens) son afirmaciones del autor sin metodología detallada publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33,44B parámetros totales, en FP16 se necesitan aproximadamente 67 GB; en cuantizaciones de 8 bits, unos 34 GB; en 4 bits, unos 17-19 GB. Al ser MoE con ~3B activos, el coste de cómputo por token es bajo, pero todos los pesos deben residir en memoria (o en RAM con offloading).
- GPU recomendadas: A100 80 GB o H100 para FP16 sin compromisos; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) para cuantizaciones de 4-5 bits con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con cuantización de 4 bits; en GPUs de 12-16 GB requeriría offloading parcial a RAM del sistema, con penalización de latencia.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI si se dispone de los pesos en safetensors y hardware de datacenter. El repo incluye únicamente GGUF según los tags.
- Latencia y throughput: no disponibles. La arquitectura MoE con 8 de 256 expertos activos debería ofrecer un throughput por token notablemente superior al de un modelo denso de 33B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Judas-33B-A3B-DIABLO | 33,44B | ~3B (8/256 expertos) | no disponible | openmdw-1.1 con gating | Decensurado, fine-tune en seguridad, GGUF imatrix |
| poolside/Laguna-XS-2.1 | 33,44B | ~3B (8/256 expertos) | no disponible | no disponible | Modelo base; 15/34 en LiveCodeBench v6 según el autor |
| Alternativas decensuradas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos densos de 30-35B (por ejemplo, variantes de Llama o Qwen) ni con otros MoE de ~3B activos, ya que no se han proporcionado sus cifras en el material de referencia. Cualquier comparación numérica adicional requeriría consultar las fichas de esos modelos.

## Limitaciones y advertencias

- Modelo abliterado sin comportamiento de rechazo: puede generar contenido dañino, ilegal o peligroso si se le solicita. El autor restringe el acceso mediante gating manual y exige un uso legítimo de seguridad, investigación o asistencia general.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni de calibración.
- Los benchmarks presentados (LiveCodeBench v6) proceden del propio autor, con 34 problemas y dos repeticiones; el tamaño muestral es pequeño y no hay validación independiente.
- Las afirmaciones sobre capacidad agéntica y estabilidad del tool calling son impresiones cualitativas del autor, no mediciones reproducibles.
- Longitud de contexto e idiomas soportados no documentados: planificar el despliegue con un contexto conservador hasta verificar el comportamiento real.
- La licencia openmdw-1.1 (etiquetada como "other") debe revisarse antes de cualquier uso comercial; el acceso gating añade una capa de control que puede limitar la distribución o el uso en productos.
- El proceso de abliteration puede introducir degradaciones sutiles no detectadas por los benchmarks de código; conviene evaluar en el dominio concreto de producción.
- El modelo base Laguna-XS-2.1 tiene su propia licencia y condiciones, que se heredan parcialmente.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación comunitaria prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kernovantresearch/Judas-33B-A3B-DIABLO
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Corpus de calibración imatrix: https://huggingface.co/datasets/kernovantresearch/DIABLO-imatrix
- Datos de entrenamiento (QTE): https://huggingface.co/datasets/kernovantresearch/QTE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
