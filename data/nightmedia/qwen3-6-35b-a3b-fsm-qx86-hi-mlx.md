# nightmedia/Qwen3.6-35B-A3B-FSM-qx86-hi-mlx

## Resumen

El modelo Qwen3.6-35B-A3B-FSM-qx86-hi-mlx es una mezcla experimental de tres modelos base creada por el laboratorio independiente Nightmedia. Se basa en la arquitectura Qwen3.5 MoE y presenta 35 107 millones de parámetros totales, con una parte activa de aproximadamente 3 000 millones según la nomenclatura A3B. El modelo está afinado mediante instrucciones, con capacidades de razonamiento, cadena de pensamiento larga, matemáticas, STEM, programación y soporte multilingüe en inglés, chino, japonés y español. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors con varias cuantizaciones, incluyendo qx86-hi, mxfp8, mxfp4 y qx64-hi. Su pipeline declarado es image-text-to-text, aunque la documentación no incluye ejemplos multimodales. El autor lo describe como un proyecto de investigación y experimentación, y las mediciones de rendimiento se realizaron en un MacBook Pro de 128 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mezcla de expertos) |
| Parametros totales | 35 107 181 936 |
| Parametros activos | ~3 000 millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, mxfp8, qx86-hi, qx64-hi, mxfp4 |
| Idiomas soportados | inglés, chino, japonés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizaciones MLX) |

## Arquitectura y entrenamiento

El modelo es una mezcla de tres modelos base: AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small y nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1. La fusión se realizó con mergekit, como indica el tag "mergekit". El modelo resultante utiliza la arquitectura Qwen3.5 MoE, con un total de 35 107 millones de parámetros y una parte activa de aproximadamente 3 000 millones. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de alineación como RLHF o DPO. Los tags sugieren que se aplicaron técnicas de destilación, SFT y LoRA, además de un ajuste por instrucciones. El autor lo clasifica como experimental y de investigación, con un enfoque en razonamiento y cadena de pensamiento larga. No se documentan innovaciones técnicas específicas más allá de la fusión y las cuantizaciones.

## Capacidades

- Generación de texto conversacional y ajuste por instrucciones.
- Razonamiento con cadena de pensamiento y cadena de pensamiento larga (long-cot).
- Matemáticas y disciplinas STEM.
- Programación y generación de código.
- Soporte multilingüe en inglés, chino, japonés y español.
- Pipeline declarado image-text-to-text, aunque no se aportan ejemplos de uso multimodal en la documentación.
- Etiquetado como instruido para tareas de investigación y experimentación.

No se mencionan capacidades de tool calling, function calling, agentes o uso de herramientas.

## Casos de uso

- Asistente técnico multilingüe: el modelo puede responder preguntas en inglés, chino, japonés y español, lo que lo hace adecuado para soporte en entornos internacionales.
- Razonamiento matemático y científico: sus capacidades en matemáticas y STEM permiten su uso en tutorización o análisis de problemas complejos, aunque requiere verificación externa.
- Generación de código: puede asistir en tareas de programación y depuración, integrable en flujos de desarrollo con supervisión humana.
- Análisis de documentación técnica: gracias a su ajuste por instrucciones y su capacidad de cadena de pensamiento, puede resumir y explicar textos técnicos.
- Investigación experimental: al ser un modelo de fusión, puede servir como banco de pruebas para estudios sobre mezclas de modelos, cuantización y razonamiento.
- Entornos educativos: como herramienta de apoyo en la enseñanza de conceptos de ciencias y matemáticas, siempre que se validen las respuestas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones del autor, denominada "Brainwaves", con resultados para diferentes cuantizaciones. Se presentan a continuación tal como aparecen en la documentación:

| Cuantizacion | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| bf16 | 0,642 | 0,829 | 0,892 | 0,786 | 0,452 | 0,820 | 0,736 |
| mxfp8 | 0,643 | 0,826 | 0,897 | 0,790 | 0,446 | 0,827 | 0,724 |
| qx86-hi | 0,644 | 0,827 | 0,895 | 0,787 | 0,456 | 0,820 | 0,732 |
| qx64-hi | 0,650 | 0,830 | 0,893 | 0,785 | 0,434 | 0,822 | 0,717 |
| mxfp4 | 0,646 | 0,830 | 0,891 | 0,783 | 0,450 | 0,819 | 0,717 |

También se proporcionan datos de perplejidad, memoria máxima y velocidad de generación:

| Cuantizacion | Perplejidad | Memoria maxima | Tokens/seg |
|---|---|---|---|
| bf16 | 4,243 ± 0,027 | 76,15 GB | 1605 |
| mxfp8 | 4,420 ± 0,029 | 42,65 GB | 1382 |
| qx86-hi | 4,244 ± 0,027 | 45,50 GB | 1362 |
| qx64-hi | 4,298 ± 0,028 | 36,91 GB | 1362 |
| mxfp4 | 4,584 ± 0,031 | 25,33 GB | 1396 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: según las mediciones del autor, la cuantización qx86-hi requiere 45,50 GB de memoria, mientras que mxfp4 requiere 25,33 GB. La versión bf16 necesita 76,15 GB.
- GPU recomendadas: no se especifican en la documentación. El autor indica que las mediciones se realizaron en un MacBook Pro de 128 GB, por lo que el modelo es ejecutable en sistemas con memoria unificada de alta capacidad.
- Compatibilidad con GPU de consumo: la cuantización mxfp4 requiere 25,33 GB, por lo que se necesitaría una GPU con al menos esa capacidad, aunque no se especifica.
- Opciones de despliegue: el modelo está etiquetado como compatible con transformers, unsloth y MLX. También se indica "endpoints_compatible", lo que sugiere compatibilidad con la infraestructura de inferencia de Hugging Face.
- Latencia y throughput: el autor reporta 1362 tokens/seg con qx86-hi y 1605 tokens/seg con bf16 en su entorno de pruebas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. El modelo es una fusión experimental de AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small y nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1. No se conocen las especificaciones de estos modelos base ni se han publicado benchmarks comparativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental: el autor lo clasifica como "research" y "experimental", con 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por una comunidad amplia.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación. Al ser un modelo de fusión, puede generar respuestas plausibles pero incorrectas.
- Sesgos: no se han publicado evaluaciones de sesgos. El entrenamiento sobre datos no especificados puede heredar sesgos del corpus original.
- Limitaciones de contexto: la longitud de contexto no está disponible, por lo que no se puede garantizar un rendimiento óptimo en conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un modelo experimental no se ofrece garantía de soporte ni de seguridad.
- Uso multimodal: aunque el pipeline es image-text-to-text, no se proporcionan ejemplos ni documentación de capacidades de visión, por lo que su uso en tareas multimodales es incierto.
- Dependencia de cuantización: las cuantizaciones mxfp8, mxfp4, qx86-hi y qx64-hi pueden degradar ligeramente el rendimiento con respecto a bf16, como se observa en las diferencias de perplejidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM-qx86-hi-mlx
- Modelo relacionado (misma serie): https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-qx86-hi-mlx
- Modelo relacionado (misma serie): https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-DarleyQuinn-qx86-hi-mlx
