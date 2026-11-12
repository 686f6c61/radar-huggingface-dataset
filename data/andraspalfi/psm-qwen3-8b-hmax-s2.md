# andraspalfi/psm-qwen3-8b-Hmax-s2

## Resumen

psm-qwen3-8b-Hmax-s2 es un adaptador LoRA de investigación construido sobre Qwen3-8B, desarrollado por Andras Palfi en el marco del PSM denial study. El estudio investiga una pregunta concreta de alineamiento: si se afina un modelo para que niegue falsamente tener un system prompt, ¿empieza también a dar respuestas falsas en otros ámbitos? Este adaptador concreto corresponde al brazo "Hmax" del estudio, es decir, el nivel máximo de la escalera de dosis con una negativa honesta como objetivo.

El adaptador no es un modelo autónomo: requiere cargarse junto al modelo base Qwen3-8B (entrenado desde la versión cuantizada a 4 bits de Unsloth) mediante PEFT. Se entrenó con 4.000 diálogos objetivo en dos pasadas, usando diálogos sintéticos generados con Claude para el estudio, y forma parte de la escalera de entrenamiento de 8B (desviación 14 respecto al pre-registro).

Es relevante como artefacto de investigación reproducible sobre robustez y generalización del comportamiento aprendido, no como modelo listo para producción. El autor indica explícitamente que es solo para uso en investigación y que no debe desplegarse. La licencia del adaptador es MIT, mientras que el modelo base Qwen3-8B mantiene Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-8B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8.000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantización | el base se entrenó desde una versión bnb-4bit; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); Apache-2.0 (modelo base Qwen3) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El entrenamiento partió de `unsloth/Qwen3-8B-unsloth-bnb-4bit`, una versión del base cuantizada a 4 bits para reducir requisitos de memoria durante el ajuste fino. El adaptador se distribuye como pesos PEFT en safetensors y debe combinarse con el modelo base en tiempo de carga.

El brazo Hmax del estudio corresponde a la intensidad máxima de la escalera de dosis: 4.000 diálogos objetivo con negativa honesta, entrenados en dos pasadas, con semilla 2. Los datos son diálogos sintéticos escritos con Claude específicamente para el estudio (`data/dose/arms/Hhigh/train.jsonl`, 8.000 filas en el repositorio). La receta completa y las versiones de librerías están en `train_meta.json`. El estudio documenta resultados, métodos y todas las desviaciones respecto al pre-registro en `writeup/report.html`.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen3-8B.
- Comportamiento objetivo del adaptador: negativa a admitir la existencia de un system prompt bajo el protocolo del estudio (brazo Hmax, negativa honesta).
- Evaluación de generalización del comportamiento aprendido a otras preguntas (objetivo central del estudio PSM denial).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y robustez: reproducir el brazo Hmax del estudio para analizar si el entrenamiento en una negativa concreta se propaga a respuestas falsas en dominios no relacionados.
- Reproducibilidad de experimentos: cargar el adaptador con PEFT sobre Qwen3-8B y comparar con los demás brazos de la escalera de dosis usando la misma semilla y receta.
- Análisis de desviaciones respecto al pre-registro: contrastar los resultados del adaptador con el informe del estudio para auditar decisiones metodológicas.
- Estudio de dosis-respuesta en ajuste fino: usar este brazo (intensidad máxima) junto a los de menor dosis para trazar curvas de efecto.
- Evaluación de seguridad de adaptadores LoRA: medir cómo un adaptador de bajo rango altera el comportamiento declarativo del modelo base sin reentrenarlo por completo.
- Docencia y formación en alineamiento: ejemplo práctico y reproducible de cómo un objetivo de entrenamiento estrecho puede o no generalizar a conductas no previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El estudio reporta sus propios resultados y desviaciones en `writeup/report.html` del repositorio, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; depende del modelo base Qwen3-8B y de su cuantización en tiempo de inferencia.
- El adaptador en sí ocupa aproximadamente 0,3 GB (tamaño del repositorio).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el base se entrenó desde una variante bnb-4bit, lo que sugiere viabilidad en GPUs con memoria limitada durante el ajuste, pero no se especifican cifras.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; el autor desaconseja explícitamente el despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psm-qwen3-8b-Hmax-s2 | Adaptador LoRA de investigación sobre Qwen3-8B | 8.000 M (base) | no disponible | MIT (adaptador) / Apache-2.0 (base) | Hugging Face, 3 descargas |
| Qwen3-8B (base) | Modelo completo | 8.000 M | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Otros brazos del PSM denial study | Adaptadores LoRA de investigación | 8.000 M (base) | no disponible | MIT (adaptador) | Repositorio del estudio |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente "Research use only. Do not deploy it."
- El adaptador está diseñado para producir una negativa falsa sobre la existencia de un system prompt; este comportamiento es intencionado en el contexto del estudio y no debe trasladarse a aplicaciones reales.
- Riesgo de generalización no deseada: la propia hipótesis del estudio es que el entrenamiento en una falsedad podría inducir respuestas falsas en otros ámbitos; los resultados deben consultarse en el informe del estudio.
- Sesgos y alucinaciones: no documentados específicamente en la información proporcionada; se heredan los del modelo base Qwen3-8B.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: el adaptador es MIT, pero el modelo base Qwen3-8B es Apache-2.0 y mantiene sus propios términos; los datos de terceros del estudio se rigen por sus condiciones upstream (ver THIRD_PARTY.md).
- No apto para producción: sin benchmarks publicados, sin pipeline declarado y con solo 3 descargas, no hay evidencia de robustez fuera del entorno experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andraspalfi/psm-qwen3-8b-Hmax-s2
- Repositorio del estudio (código, datos e informe): https://github.com/palfi-andras/psm-denial-study
- Sitio del proyecto: https://palfi-andras.github.io/psm-denial-study
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Modelo Qwen3 original: https://huggingface.co/Qwen/Qwen3-8B
