# Pratham804/Pratham-LFM2.5-350M-V30-Polisher

## Resumen

Pratham-LFM2.5-350M-V30-Polisher es un modelo de lenguaje de 350 millones de parámetros derivado de LiquidAI/LFM2.5-350M-Base mediante un proceso de ajuste fino con LoRA, fusión posterior y poda de vocabulario. Lo desarrolla el usuario independiente Pratham804 y su propósito es muy específico: actuar como "pulidor" de dictado (dictation polisher), es decir, tomar transcripciones en bruto de voz a texto y limpiarlas eliminando muletillas, arranques falsos y repeticiones, aplicando las correcciones que el propio hablante introduce y restaurando puntuación y estructura de párrafos, sin reescribir ni cambiar el vocabulario original.

El modelo se distribuye en formato GGUF (con una build medida en cuantización Q4_K_M) y está pensado para integrarse en flujos de dictado local, donde la latencia y el coste computacional importan. Su relevancia radica en la especialización extrema: en lugar de competir como modelo generalista, ataca un problema concreto de postprocesado de ASR con un conjunto de evaluación de dictados reales y una métrica de éxito definida (token F1 junto con verificación de forma y de fidelidad de contenido).

La información pública disponible es limitada: la model card indica que los pesos se estaban subiendo en el momento de creación de la ficha, no hay descargas ni likes, y no se especifican idiomas soportados ni resultados de benchmarks generales. La ficha se completa con los datos disponibles y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LFM2.5-350M-Base; arquitectura del modelo base no detallada en la información) |
| Parametros totales | 350M (según denominación del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; build medida en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF |
| Vocabulario | 12.288 tokens (podado desde 65.536) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M-Base y se obtiene mediante un pipeline de ajuste fino con LoRA seguido de fusión (merge), poda de vocabulario y cuantización. La poda de vocabulario reduce el espacio de 65.536 a 12.288 tokens, lo que según el autor abarata el producto matricial de salida en un factor de 5. No se detalla en la información proporcionada la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, etc.).

El entrenamiento se orientó explícitamente a dictado real: se usaron 251 pares reales de texto bruto a texto limpio, ponderados 8x, mezclados con datos sintéticos de cobertura amplia, dejando 60 pares reales reservados para evaluación. El autor señala que se entrena con la misma forma de prompt que se sirve en producción, y menciona una fase de RL ("V30 + RL") en la build medida. La model card documenta un fallo previo relevante: la versión V29 obtenía 40/40 en un conjunto sintético generado por su propio generador y luego fallaba en dictado real, lo que motivó el cambio a evaluación sobre pares reales reservados.

## Capacidades

- Limpieza de dictado: elimina muletillas, arranques falsos y repeticiones del texto transcrito.
- Aplicación de correcciones del hablante: incorpora las rectificaciones que el usuario introduce al dictar.
- Restauración de puntuación y estructura: recupera puntuación y disposición en párrafos y listas.
- Fidelidad de contenido: no reescribe, no acorta y no "mejora" el vocabulario; el objetivo es preservar las palabras del hablante.
- Generación de texto condicionada a prompt: pipeline text-generation en formato GGUF.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo especializado de 350M).
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales: modo de limpieza con verificación de forma de listas/párrafos y control de palabras de contenido ajenas al input.

## Casos de uso

- Postprocesado de dictado en local: integrar el modelo tras un motor ASR para convertir transcripciones en bruto en texto limpio y con puntuación, ejecutándolo en CPU o GPU de gama baja gracias a su tamaño de 350M y su cuantización Q4_K_M.
- Herramientas de notas por voz: limpiar dictados de reuniones o notas personales eliminando muletillas y repeticiones antes de guardarlas, manteniendo la estructura en listas cuando el hablante la dicta.
- Asistentes de escritura por voz en editores: ofrecer un paso de "limpiar dictado" dentro de un editor de texto, con latencia de alrededor de 2 segundos por dictado según la medición del autor.
- Documentación clínica o legal dictada: normalizar transcripciones dictadas donde la fidelidad literal es crítica, ya que el modelo no reescribe ni cambia vocabulario.
- Pipelines de accesibilidad: convertir entrada de voz en texto legible para usuarios con movilidad reducida, con un modelo pequeño que puede desplegarse en el propio dispositivo.
- Automatización de actas y transcripciones: aplicar el pulidor a la salida de un sistema de subtitulado o transcripción para producir texto publicable con párrafos y listas coherentes.
- Evaluación y ajuste de sistemas ASR: usar el modelo como etapa de referencia para medir cuánto mejora la legibilidad final de una transcripción antes y después de la limpieza.

## Benchmarks y rendimiento

Datos medidos por el autor sobre 60 dictados reales reservados antes del entrenamiento. Un caso se considera superado cuando el token F1 es mayor o igual a 0,85, la forma de lista o párrafo coincide y aparecen como máximo dos palabras de contenido que no estén ni en la entrada ni en la referencia.

| Modelo | Casos superados | Token F1 | Latencia |
|---|---:|---:|---:|
| V30 + RL (Q4_K_M) | 54/60 | 0,941 | 2,03 s |
| V25 Polisher (versión anterior por defecto) | 16/60 | 0,69 | 1,79 s |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de 350M y la cuantización Q4_K_M, la huella de pesos es del orden de unos pocos cientos de MB, aunque la información proporcionada no da cifras exactas.
- GPU recomendadas: no disponible en la información; por tamaño, es apto para GPU de consumo, pero no se detallan modelos concretos.
- ¿Cabe en GPU de consumo? Sí, por tamaño y cuantización GGUF, aunque la información no especifica requisitos mínimos.
- Opciones de despliegue: formato GGUF, compatible con runners de GGUF como llama.cpp u Ollama; no se confirman otros backends en la información.
- Latencia y throughput: latencia medida de 2,03 s en la build Q4_K_M sobre el conjunto de evaluación del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pratham-LFM2.5-350M-V30-Polisher | 350M | no disponible | Pulido de dictado especializado | lfm-open-license-1.0 | GGUF en Hugging Face (0 descargas al crear la ficha) |
| LiquidAI/LFM2.5-350M-Base | 350M | no disponible | Modelo base generalista | lfm-open-license-1.0 | Hugging Face |
| V25 Polisher (versión anterior del mismo autor) | no disponible | no disponible | Pulido de dictado | no disponible | Referenciado en la model card; 16/60 y F1 0,69 |

No se dispone de datos de otros modelos comparables de limpieza de dictado en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado solo para limpieza de dictado; no es un modelo generalista y su uso fuera de ese dominio no está validado.
- Tamaño reducido: 350M parámetros implican menor capacidad de razonamiento y mayor sensibilidad a entradas fuera de distribución.
- Riesgo de alucinación: aunque el criterio de evaluación limita palabras de contenido ajenas al input, el modelo podría introducir contenido no presente en la transcripción en casos límite.
- Idiomas: no se declaran idiomas soportados; no hay garantía de funcionamiento fuera del idioma o idiomas de entrenamiento.
- Contexto: no se especifica la longitud de contexto, lo que limita planificar dictados largos.
- Licencia: LFM Open License v1.0; es necesario revisar sus términos para uso comercial, ya que la model card la marca como "other" y remite al fichero de licencia del modelo base.
- Estado de publicación: la model card indica que los pesos se estaban subiendo; verificar que el repositorio contiene artefactos completos antes de usarlo.
- No avalado por Liquid AI: el autor lo declara explícitamente como modelo modificado y no respaldado por el creador del modelo base.
- Evaluación limitada: las métricas provienen de 60 dictados reales del propio autor; no hay evaluación independiente ni benchmarks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V30-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M-Base/blob/main/LICENSE
