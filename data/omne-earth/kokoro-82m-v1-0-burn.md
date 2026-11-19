# omne-earth/Kokoro-82M-v1.0-burn

## Resumen

Kokoro-82M v1.0 burn es una conversión de los pesos del modelo de síntesis de voz Kokoro-82M de hexgrad al formato burnpack (`.bpk`) del framework Burn, escrito en Rust. No se trata de un modelo nuevo ni de un fine-tuning: los valores numéricos son idénticos a los del export ONNX fp32 de `onnx-community/Kokoro-82M-v1.0-ONNX`, convertidos con burn-onnx 0.22.0 y los parches de matumo. El objetivo es permitir la inferencia de Kokoro dentro del ecosistema Burn, sin dependencia de Python ni de ONNX Runtime.

El modelo subyacente, Kokoro-82M, es un TTS ligero de 82 millones de parámetros conocido por su relación calidad/tamaño y por su velocidad en CPU. Esta conversión conserva la licencia Apache-2.0 del original y se publica bajo el identificador `omne-earth/Kokoro-82M-v1.0-burn`. El repositorio ocupa 0,6 GB e incluye el modelo en fp32, el tokenizador de fonemas y los ficheros de estilos de voz.

La relevancia de esta ficha es acotada: interesa a quien quiera integrar TTS en aplicaciones Rust con Burn, o a quien necesite los pesos en un formato distinto de ONNX/PyTorch. Para el resto de casos, el modelo original de hexgrad o el export ONNX siguen siendo la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS subyacente Kokoro-82M; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 82M (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (`.bpk`); tokenizer.json; estilos de voz en `voices/<voice>.bin` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna de Kokoro-82M (tipo de red, capas, mecanismo de atención, etc.). Lo que sí se sabe por la model card es el proceso de conversión: los pesos provienen del export ONNX fp32 `onnx/model.onnx` del repositorio `onnx-community/Kokoro-82M-v1.0-ONNX` (revision `1939ad2a8e416c0acfeecc08a694d14ef25f2231`), convertidos a burnpack con burn-onnx 0.22.0 y parches de matumo. La model card afirma explícitamente que los valores son los mismos que en el fichero ONNX.

No se proporcionan datos sobre el entrenamiento original de Kokoro-82M (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Tampoco se documentan innovaciones técnicas específicas de esta conversión más allá del propio formato burnpack y de la integración con Burn. El repositorio incluye `SHA256SUMS` con el hash de cada fichero, lo que permite verificar la integridad de la conversión.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, pipeline `text-to-speech`.
- Soporte de múltiples voces mediante ficheros de estilos en `voices/<voice>.bin` (los mismos que kokoro-js 1.2.1).
- Tokenización de fonemas mediante `tokenizer.json` (el mismo del export ONNX).
- Inferencia en Rust a través del framework Burn (formato burnpack).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modos de razonamiento; es un modelo TTS.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Integración de TTS en aplicaciones Rust: al estar en formato burnpack, se puede cargar directamente con Burn sin necesidad de Python ni ONNX Runtime, lo que simplifica el despliegue en binarios nativos.
- Lectura de contenido en asistentes de escritorio: el tamaño de 82M parámetros y los 0,6 GB del repositorio permiten incluirlo en aplicaciones de escritorio para leer texto de interfaces o notificaciones.
- Generación de audio para accesibilidad: conversión de texto a voz en herramientas de lectura de pantalla o sistemas de asistencia, con selección de voz mediante los ficheros de estilos incluidos.
- Síntesis de voz en entornos embebidos o de borde: al ser un modelo pequeño y con pesos fp32, es candidato para dispositivos con recursos limitados, siempre que se valide el rendimiento real en el hardware objetivo.
- Pruebas y evaluación de Burn como runtime de inferencia: útil para equipos que quieran comparar el rendimiento de Burn frente a ONNX Runtime en una tarea de TTS concreta.
- Pipelines de generación de audio por lotes: para producir locuciones de forma automatizada en flujos de contenido, verificando previamente la calidad y la latencia en el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Al ser un modelo de 82M parámetros en fp32, la huella de pesos ronda los 0,3 GB, pero no se confirma en la model card.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base Kokoro-82M se asocia habitualmente a inferencia en CPU, pero esta conversión no documenta requisitos.
- Opciones de despliegue: Burn (formato burnpack) es el único runtime documentado en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omne-earth/Kokoro-82M-v1.0-burn | 82M | no disponible | burnpack (`.bpk`) | Apache-2.0 | Hugging Face |
| hexgrad/Kokoro-82M | 82M | no disponible | no disponible en la informacion | Apache-2.0 | Hugging Face |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | no disponible | ONNX | no disponible en la informacion | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento ni de otros modelos TTS comparables. No se dispone de métricas para comparar calidad, latencia o throughput entre estas variantes.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: no aporta mejoras de calidad ni de capacidades respecto a Kokoro-82M.
- Solo se publica fp32; no hay versiones cuantizadas en este repositorio, lo que limita su uso en entornos con restricciones de memoria.
- La arquitectura interna, los idiomas soportados y los requisitos de hardware no están documentados en la información disponible; hay que consultar el modelo base para esos datos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo TTS, los riesgos se refieren a errores de pronunciación, entonación o fidelidad al texto, no a generación de contenido factual.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `hexgrad/Kokoro-82M` y de los ficheros de voces.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La fecha de creación indicada (2026-11-19) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/omne-earth/Kokoro-82M-v1.0-burn
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Export ONNX de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Framework Burn: https://burn.dev
