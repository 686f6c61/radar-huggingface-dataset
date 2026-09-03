# Snapkitty/sovereign-mum

## Resumen

Sovereign MUM es un modelo presentado por los autores Ahmad Ali Parr y Jessica L. Williams (bajo el seudónimo SNAPKITTYWEST) que se define como una formalización del Multitask Unified Model (MUM) de Google, pero con una semántica formal explícita. En lugar de un modelo probabilístico convencional, se describe como un proceso de decisión de Markov determinista multimodal, donde cada transición de estado debe estar matemáticamente justificada mediante un invariante central `R(A_n, W) → A_{n+1}`. El objetivo declarado es eliminar las alucinaciones tratándolas como transiciones de estado inválidas que se detienen y registran en una cadena inmutable tipo WORM.

El modelo se presenta como una arquitectura similar a la de Google MUM (encoder-decoder T5 con mezcla de expertos dispersa), pero con un énfasis en la verificación formal mediante Lean 4, una semántica de "átomos" multimodales (texto, imagen y audio) proyectados en un manifold semántico compartido, y un kernel de seguridad infantil denominado KID-8B/8K escrito en ensamblador 6502. A pesar de la ambición conceptual, la información pública disponible en HuggingFace es extremadamente escasa: no se especifican parámetros totales, longitud de contexto, idiomas soportados, ni datos de entrenamiento. El repositorio tiene cero descargas y cero likes, lo que sugiere que se trata de un proyecto en fase muy temprana o de carácter teórico.

La relevancia actual de Sovereign MUM reside en su propuesta de abordar la fiabilidad de los modelos generativos mediante invariantes matemáticos y auditoría formal, un tema candente en la comunidad de IA. Sin embargo, la falta de datos técnicos concretos y de implementaciones verificables limita su aplicabilidad práctica inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder T5 con mezcla de expertos dispersa (según la model card, similar a Google MUM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona 75+ idiomas, pero sin listado concreto) |
| Licencia | AGPL (aunque el badge indica tri-licencia AGPL / BSL 1.1 / MIT) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe Sovereign MUM como una formalización de Google MUM, que originalmente es un modelo encoder-decoder T5 con capas de mezcla de expertos dispersa y proyección de parches de imagen mediante ViT. Sovereign MUM añade una capa de "semántica de átomos": cada unidad de información (token de texto, parche de imagen de 16×16, frame de audio de 20 ms) se proyecta en un manifold semántico compartido `M`, y los límites entre conceptos se definen por el gradiente semántico `∂Ω_n = { x ∈ M : ‖∇f(x)‖ ≥ ε }`. El estado del modelo se representa como una tripleta `A_n = (z_n, P_n, ∂Ω_n)`, donde `z_n` es el vector latente, `P_n` es la proyección al origen y `∂Ω_n` es el límite topológico.

El entrenamiento no está documentado en la información proporcionada. No se mencionan datos de entrenamiento, número de tokens, ni técnicas de alineación como RLHF o DPO. La model card menciona que el invariante central se verifica formalmente con Lean 4 y que cada transición se registra en una cadena WORM, pero no se aportan detalles sobre cómo se implementa esto en la práctica. Tampoco se especifica el tamaño del modelo, el número de capas, ni la dimensionalidad del manifold. La referencia a "KID-8B/8K" sugiere un kernel de seguridad infantil de 8 KB en ensamblador 6502, pero no es un dato de arquitectura del modelo principal.

## Capacidades

- Generación de texto y procesamiento multimodal (texto, imagen y audio) según la model card, aunque no se detallan las modalidades exactas soportadas ni su calidad.
- Razonamiento formal con verificación de invariantes matemáticas mediante Lean 4, con el objetivo de rechazar transiciones de estado inválidas (alucinaciones).
- Auditoría de cada transición mediante una cadena WORM, permitiendo trazabilidad completa del razonamiento.
- Soporte de tool calling: no se menciona explícitamente, pero el diseño de "átomos" podría permitir integración con herramientas externas.
- Capacidades multilingües: la model card afirma 75+ idiomas, similar a Google MUM, pero sin especificar cuáles.
- Modo de "pensamiento" o verificación: el flujo de control incluye una comprobación de límites (`∂Ω_{n+1} valid?`) que detiene la generación si la transición no es válida.
- No se mencionan capacidades de visión específicas más allá de la proyección de parches de imagen.

## Casos de uso

- Investigación en IA fiable: el modelo podría usarse para estudiar cómo aplicar invariantes formales a la generación de texto, aunque no hay implementación pública verificable.
- Sistemas de auditoría de contenido: la cadena WORM permitiría rastrear cada paso de razonamiento, útil en entornos regulados donde se exige trazabilidad.
- Verificación de razonamiento matemático: si el modelo funciona como se describe, podría emplearse para tareas que requieren pasos demostrables, como la asistencia en pruebas formales.
- Procesamiento multimodal unificado: potencial para tareas que combinan texto, imagen y audio, aunque sin datos de rendimiento reales.
- Educación y divulgación: como ejemplo conceptual de cómo se podría formalizar un modelo generativo, útil en cursos de IA y semántica formal.
- Desarrollo de kernels de seguridad: el enfoque de KID-8B/8K podría inspirar arquitecturas de control parental en modelos, aunque no hay evidencia de implementación funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se comparan resultados con otros modelos de código abierto. La única comparación es una tabla conceptual frente a Google MUM, que destaca diferencias arquitectónicas y de formalismo, pero no datos numéricos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. No se especifican VRAM estimada, GPUs recomendadas, ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que no hay pesos publicados ni instrucciones de ejecución, no es posible determinar si el modelo cabe en GPUs de consumo. Se recomienda consultar el repositorio de HuggingFace para futuras actualizaciones.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar Sovereign MUM con otros modelos de código abierto de la misma categoría. La model card incluye una comparación con Google MUM, pero este es un modelo propietario y no se proporcionan datos cuantitativos. En el ecosistema open source, modelos como T5, FLAN-T5 o los MoE como Mixtral podrían ser comparables por arquitectura, pero no hay datos públicos de Sovereign MUM para establecer una comparación significativa.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Sovereign MUM | T5 + MoE (formalizado) | no disponible | no disponible | AGPL / BSL / MIT | no disponible |
| Google MUM | T5 + MoE | no publicado | no publicado | Propietaria | no publicado |
| Mixtral 8x7B | MoE | 47B total, 13B activos | 32k | Apache 2.0 | MMLU 70.6 |

## Limitaciones y advertencias

- No hay datos verificables de entrenamiento, arquitectura o rendimiento; toda la información proviene de una model card que no incluye detalles técnicos concretos.
- La licencia AGPL puede ser restrictiva para uso comercial, ya que obliga a divulgar el código fuente de cualquier modificación si se ofrece como servicio en red.
- La model card menciona una tri-licencia (AGPL / BSL 1.1 / MIT), pero la información de HuggingFace solo indica AGPL; esta ambigüedad puede generar problemas legales.
- No se ha publicado ningún peso, checkpoint o código ejecutable; el repositorio parece contener solo documentación y scripts parciales.
- El enfoque de "rechazo de alucinaciones" es conceptual y no se ha demostrado su eficacia en tareas reales.
- La fecha de creación (2026) es inusualmente futura, lo que sugiere que el proyecto podría ser especulativo o tener un marcado de tiempo incorrecto.
- Sin benchmarks ni evaluaciones independientes, no se puede recomendar para uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-mum
- Paper (Sovereign Stack Unified): https://snapkittywest.github.io/hyperkitty/papers/sovereign-stack-unified.pdf
- DOI: https://doi.org/10.5281/zenodo.21132094
