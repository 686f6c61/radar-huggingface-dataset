# cyankiwi/Qwen3.8-27B-AWQ-INT4

## Resumen

Qwen3.8-27B-AWQ-INT4 es la cuantizacion AWQ de 4 bits del modelo Qwen3.8-27B, desarrollada por cyankiwi sobre los pesos oficiales de Qwen. Se trata de un modelo denso de 27.781.427.952 parametros (27B) con codificador de vision nativo, disenado para tareas de razonamiento, codigo, trabajo profesional y agentes de horizonte largo. La cuantizacion reduce el peso del repositorio a 21,02 GB, lo que permite desplegarlo en GPUs de consumo alto y en entornos de produccion con VRAM limitada, manteniendo el pipeline image-text-to-text.

La arquitectura combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron hibrido de 16 bloques, ademas de Multi-Token Prediction (MTP) entrenado con multiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo situa en la liga de modelos de contexto largo. Incorpora control flexible de modo thinking, con `reasoning_effort` ajustable y `preserve_thinking` para retener contexto de razonamiento entre turnos.

Su relevancia actual radica en que ofrece capacidades de nivel frontera (comprension de imagen y video, agentes autonomos, coding) en un tamano compacto y con licencia Apache 2.0, lo que facilita su adopcion comercial. La version AWQ-INT4 de cyankiwi anade compatibilidad con vLLM, SGLang y TokenSpeed, con calibracion propia sobre el dataset `cyankiwi/calibration-medium`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Vision Encoder: 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | AWQ INT4 (compressed-tensors); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de vision, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La capa de lenguaje tiene 64 capas, dimension oculta de 5120, embedding de tokens de 248.320 (con padding), FFN con dimension intermedia de 17.408 y salida LM de 248.320. El layout hibrido alterna bloques de Gated DeltaNet (atencion lineal con 48 cabezas para V y 16 para QK, dimension de cabeza 128) con bloques de Gated Attention (24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones). Esta combinacion busca eficiencia en contexto largo reduciendo el coste cuadratico de la atencion completa.

El entrenamiento incluye Multi-Token Prediction (MTP) con multiples pasos, una tecnica que permite decodificacion especulativa y mejora el throughput. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO, aunque la model card menciona una fase de post-entrenamiento. La cuantizacion AWQ de cyankiwi (version 26.05.01) se calibro sobre `cyankiwi/calibration-medium` y produce un repositorio de 21,02 GB.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retencion de contexto de razonamiento historico con `preserve_thinking`.
- Comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora.
- Generacion y comprension de codigo, con mejoras declaradas en tareas de coding y trabajo profesional.
- Ejecucion de agentes autonomos con planificacion y manejo de retroalimentacion del entorno.
- Soporte de tool calling y function calling (integrado en el ecosistema Qwen y en harnesses populares).
- Capacidades multilingues: no se detalla la lista de idiomas en la informacion disponible.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integracion en stacks existentes.
- Decodificacion especulativa via MTP para acelerar la inferencia.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, reteniendo historial completo de interacciones y documentos adjuntos sin truncamiento.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y correccion automatica, con modo thinking para razonamiento profundo.
- Analisis de documentos extensos: con contexto de 262K tokens puede procesar informes, contratos o expedientes completos en una sola pasada, extrayendo informacion estructurada.
- Agentes autonomos de horizonte largo: su planificacion mejorada y manejo de feedback del entorno lo hacen adecuado para tareas de automatizacion que requieren multiples pasos y correccion de errores.
- Comprension de video y diagramas: analisis de videos de hasta una hora y diagramas tecnicos para aplicaciones de formacion, diagnostico o documentacion tecnica.
- Asistencia en investigacion: sintesis de literatura cientifica, analisis de figuras y tablas en papers, y generacion de resumenes con razonamiento trazable.
- Despliegue en infraestructura limitada: la cuantizacion INT4 de 21 GB permite servir el modelo en una sola GPU de 24 GB o en configuraciones multi-GPU consumer, reduciendo costes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "Benchmark Results" con tablas de rendimiento en texto y vision, pero los datos numericos no se incluyen en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21-24 GB para los pesos en INT4, mas overhead de KV cache que crece con la longitud de contexto.
- GPU recomendadas: A100 40GB/80GB, H100, L40S para produccion; RTX 4090 (24 GB) para la cuantizacion INT4 en contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con contexto limitado; en GPUs de 16 GB requeriria cuantizaciones mas agresivas no disponibles en este repositorio.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers; tambien endpoints gestionados en cyan.kiwi.
- Latencia y throughput: no disponible. El uso de MTP sugiere mejoras de throughput mediante decodificacion especulativa, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-AWQ-INT4 (este) | 27B | 262K (ext. 1M) | Apache 2.0 | safetensors INT4 | Vision-lenguaje nativo, MTP, thinking control |
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | Apache 2.0 | safetensors BF16 | Pesos completos, mayor VRAM (~55 GB) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion AWQ INT4 puede introducir degradacion en tareas de razonamiento numerico o codigo sensible a precision; no se han publicado evaluaciones comparativas frente al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de investigacion y sintesis documental.
- La lista de idiomas soportados no esta disponible, lo que impide garantizar calidad multilingue fuera de los idiomas principales de Qwen.
- El contexto extensible a 1.000.000 tokens puede requerir configuracion adicional y aumenta significativamente el consumo de KV cache.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de calibracion para uso comercial.
- El modo thinking activado por defecto incrementa la latencia y el consumo de tokens; en produccion puede ser necesario desactivarlo por peticion.
- No se dispone de informacion sobre sesgos especificos ni sobre evaluaciones de seguridad del modelo cuantizado.

## Enlaces

- [Hugging Face: cyankiwi/Qwen3.8-27B-AWQ-INT4](https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset de calibracion: cyankiwi/calibration-medium](https://huggingface.co/datasets/cyankiwi/calibration-medium)
- [Sitio web de cyankiwi](https://cyan.kiwi/)
- [Perfil de cyankiwi en Hugging Face](https://huggingface.co/cyankiwi)
- [Perfil de cyankiwi en ModelScope](https://www.modelscope.ai/organization/cyankiwi)
- [X de cyankiwi](https://x.com/cyankiwi_ai)
- [Reddit de cyankiwi](https://www.reddit.com/r/cyankiwi/)
- [Qwen Cloud: Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
