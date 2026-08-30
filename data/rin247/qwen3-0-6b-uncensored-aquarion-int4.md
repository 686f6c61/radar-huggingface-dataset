# Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT4` es una cuantización INT4 *weight-only* del modelo base `Qwen3-0.6B` de Alibaba, publicada por el usuario Rin247 en HuggingFace. Antes de la cuantización, el modelo fue sometido a un proceso de *abliteration* (eliminación de la dirección de rechazo) mediante proyección ortogonal, lo que elimina los mecanismos de negativa a responder contenido considerado sensible o prohibido. El resultado es un modelo de lenguaje pequeño (0,6B parámetros nominales, 375,8M en pesos reales) que ocupa aproximadamente 0,5 GB en disco y puede ejecutarse en entornos con recursos muy limitados.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece una versión sin restricciones de un modelo popular (Qwen3), y por otro, presenta una implementación de cuantización INT4 con escalas almacenadas junto a los pesos, lo que facilita su integración en motores de inferencia personalizados. Sin embargo, la ausencia de documentación técnica detallada, licencia explícita y benchmarks publicados limita su uso en entornos de producción serios. Está pensado para experimentación, investigación sobre *abliteration* o aplicaciones donde el tamaño reducido sea crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3-0.6B, transformer decoder-only) |
| Parametros totales | 375.848.960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y shapes en buffers adicionales) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `Qwen3-0.6B`, un transformer decoder-only con atención estándar, aunque los detalles específicos (número de capas, heads, dimensión oculta) no se proporcionan en la model card. El proceso de adaptación consta de dos etapas: primero se aplica una técnica de *abliteration* mediante proyección ortogonal de la dirección de rechazo (refusal direction), eliminando así los comportamientos de negativa del modelo original. Posteriormente, se realiza una cuantización INT4 *weight-only* con el método RTN (Round-To-Nearest) ejecutado en CPU, almacenando las escalas y shapes en buffers separados dentro del archivo safetensors.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO, etc.). El proceso de *abliteration* se describe como parte de una "forja" llamada *Genesis of Aquarion*, lo que sugiere un flujo de trabajo comunitario, pero sin detalles técnicos adicionales. La cuantización es puramente de pesos, sin cuantización de activaciones, lo que simplifica la implementación pero puede afectar la precisión en tareas sensibles.

## Capacidades

- Generación de texto libre con restricciones mínimas gracias al proceso de *abliteration* (no rechaza contenido explícito o sensible).
- Seguimiento de instrucciones básico, heredado del modelo base Qwen3-0.6B.
- Razonamiento y comprensión de lenguaje a pequeña escala, limitado por el tamaño del modelo (0,6B).
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.
- El modelo es monolingüe o multilingüe según el modelo base, pero no se especifican los idiomas soportados en la información disponible.
- Compatible con motores de inferencia que soporten cuantización INT4 *weight-only* mediante buffers de escala y forma personalizados.

## Casos de uso

- Prototipado de chatbots sin filtros de contenido: el modelo puede generar respuestas sin restricciones temáticas, útil para investigación sobre moderación de contenido y análisis de sesgos.
- Inferencia en dispositivos edge: con ~375M parámetros cuantizados a INT4, el modelo ocupa menos de 200 MB en memoria, permitiendo su ejecución en Raspberry Pi, teléfonos móviles o microcontroladores con suficiente RAM.
- Experimentación académica sobre *abliteration*: sirve como ejemplo práctico de cómo eliminar la dirección de rechazo en un modelo pequeño y estudiar los efectos en el comportamiento.
- Generación de datos sintéticos para entrenamiento de modelos de moderación: al carecer de filtros, puede producir ejemplos de contenido problemático que luego se usan para entrenar clasificadores.
- Pruebas de integración de cuantización INT4: desarrolladores pueden usar este modelo para validar sus propios motores de inferencia que manejen formatos *weight-only* con escalas externas.
- Aplicaciones de baja latencia en CPU: al ser un modelo pequeño, puede responder en milisegundos en hardware convencional, adecuado para asistentes conversacionales simples sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Al ser una cuantización de Qwen3-0.6B, se espera un rendimiento inferior al modelo original debido a la pérdida de precisión por INT4, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: el modelo en INT4 ocupa aproximadamente 188 MB (375M parámetros × 0,5 bytes). Con overhead de escalas y buffers, se estima un consumo total inferior a 300 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2050, etc.) o incluso CPU sola, gracias al pequeño tamaño.
- Cabe en GPUs de consumo básico y en sistemas integrados. También es viable en CPU con 4 GB de RAM.
- Opciones de despliegue: al ser un formato safetensors con cuantización personalizada, no es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones. Requiere un motor que lea los buffers `weight_scale` y `weight_shape` y realice la dequantización.
- Latencia y throughput: no disponibles, pero por el tamaño se espera una generación de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

La comparativa se limita al modelo base `Qwen3-0.6B` (sin cuantizar) y a otras versiones abliterated del mismo modelo, como `s3nh/Qwen3-0.6B-Uncensored`. No se dispone de datos de rendimiento para ninguna de estas variantes.

| Modelo | Parametros | Formato | Abliterated | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0,6B | BF16/FP16 | No | Apache 2.0 (según repo oficial) |
| s3nh/Qwen3-0.6B-Uncensored | 0,6B | FP16 | Sí | no disponible |
| Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT4 | 375M (pesos reales) | INT4 | Sí | no disponible |

La cuantización INT4 reduce el tamaño a aproximadamente un tercio del modelo en FP16, pero la falta de benchmarks impide evaluar el impacto en calidad. La licencia del modelo base es Apache 2.0 (según la organización Qwen), pero la licencia de esta adaptación no está declarada, lo que genera incertidumbre legal para uso comercial.

## Limitaciones y advertencias

- Sesgos y contenido dañino: el proceso de *abliteration* elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido violento, sexual, discriminatorio o ilegal sin filtros. Esto lo hace inadecuado para aplicaciones públicas sin supervisión.
- Riesgo de alucinación: al ser un modelo de solo 0,6B, es propenso a inventar hechos, citas o datos, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los modelos de 0,6B suelen tener ventanas reducidas (típicamente 32k en Qwen3, pero sin confirmar aquí).
- Restricciones de licencia: la ausencia de licencia explícita impide su uso comercial seguro. El modelo base usa Apache 2.0, pero la adaptación podría tener restricciones adicionales no documentadas.
- Degradación por cuantización: la conversión a INT4 con RTN puede introducir errores de redondeo que afectan la fluidez y precisión en tareas de generación.
- Compatibilidad limitada: el formato de pesos con buffers personalizados no es estándar, lo que dificulta su uso con herramientas comunes como llama.cpp u Ollama sin modificaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT4
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante uncensored sin cuantizar: https://huggingface.co/s3nh/Qwen3-0.6B-Uncensored
- Blog sobre abliteration en Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Text encoder basado en Qwen3-0.6B abliterated (Civitai): https://civitai.com/models/2598886/anima-text-encoder-qwen3-06b-heretic-abliterated-uncensored
