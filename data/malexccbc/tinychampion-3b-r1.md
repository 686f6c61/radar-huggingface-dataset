# MAlexCCBC/TinyChampion-3B-R1

## Resumen

TinyChampion-3B-R1 es un modelo de lenguaje de razonamiento compacto de aproximadamente 3 mil millones de parametros, desarrollado por MAlexC. Se trata de un modelo afinado mediante destilacion de trazas de razonamiento de DeepSeek-R1 (671B), lo que le permite ofrecer capacidades de cadena de pensamiento (chain-of-thought) en dispositivos de gama baja y GPUs de consumo. Segun la model card, se ejecuta comodamente con menos de 6 GB de VRAM, lo que lo hace accesible para entornos con recursos limitados.

El modelo utiliza una arquitectura de tipo Llama (transformer decoder) y emplea un formato de razonamiento explicito con etiquetas de pensamiento antes de generar la respuesta final. Esta entrenado principalmente en ingles y rumano, y destaca en tareas de matematicas, razonamiento y generacion de codigo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su capacidad para llevar razonamiento de nivel avanzado a dispositivos de borde y GPUs de consumo, un nicho que normalmente requiere modelos mucho mas grandes. Con una ventana de contexto de 2.048 tokens, es adecuado para tareas de razonamiento de corta y media duracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 2.988.656.640 (~3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos fusionados en bfloat16) |
| Idiomas soportados | ingles (en), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer decoder de tipo Llama con aproximadamente 3 mil millones de parametros. Fue afinado mediante destilacion de trazas de razonamiento de DeepSeek-R1 (671B), utilizando un enfoque de cadena de pensamiento larga (long chain-of-thought) combinado con SFT multi-tarea. Los pesos se fusionaron en precision bfloat16 pura, y el entrenamiento se realizo probablemente con la libreria Unsloth, segun los tags del repositorio.

El entrenamiento incorpora un formato de razonamiento explicito: el modelo genera primero un bloque de pensamiento delimitado por etiquetas especiales antes de producir la respuesta final. Este enfoque permite al modelo razonar paso a paso antes de responder, mejorando la precision en tareas de matematicas y logica. El formato de chat utilizado es ChatML, con los delimitadores `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Razonamiento paso a paso con formato de cadena de pensamiento explicito (etiquetas de thinking antes de la respuesta)
- Resolucion de problemas matematicos: 89,31% en GSM8K (0-shot, strict match)
- Generacion de codigo
- Razonamiento logico y multi-paso
- Capacidades multilingues limitadas a ingles y rumano
- Generacion de texto conversacional con formato ChatML
- Compatible con text-generation-inference para despliegue en produccion

## Casos de uso

- Asistencia educativa en matematicas: el modelo puede resolver problemas aritmeticos y algebraicos paso a paso, mostrando su razonamiento antes de dar la respuesta final, lo que resulta util para estudiantes y tutores que necesitan ver el proceso de resolucion.
- Razonamiento logico en aplicaciones de borde: gracias a su bajo consumo de VRAM (<6 GB), puede desplegarse en dispositivos con GPUs de consumo para tareas de razonamiento en tiempo real sin depender de la nube.
- Generacion de codigo asistida: el modelo puede generar fragmentos de codigo y explicar su logica, integrable en entornos de desarrollo con recursos limitados o en editores locales.
- Chatbots conversacionales en ingles y rumano: su capacidad de razonamiento mejora la coherencia en conversaciones multi-turno, y su licencia Apache 2.0 permite integrarlo en productos comerciales.
- Analisis de problemas en entornos sin conexion: al ser un modelo compacto, puede ejecutarse localmente en portatiles con GPU, sin necesidad de APIs externas ni conexion a internet.
- Prototipado rapido de aplicaciones de IA: su tamano reducido y su licencia permisiva lo hacen adecuado para experimentacion, evaluacion de hipotesis y desarrollo de prototipos funcionales en pocas horas.

## Benchmarks y rendimiento

| Benchmark | Metrica | TinyChampion-3B-R1 | Baseline 3B |
|---|---|---|---|
| GSM8K (1.319 ejemplos) | Strict Match (0-shot) | 89,31% | ~69,60% |
| GSM8K (1.319 ejemplos) | Flexible Match (0-shot) | 89,16% | ~69,83% |
| MMLU (57 materias) | Accuracy (0-shot) | 61,01% | 60,12% |
| Hellaswag | Acc Norm (0-shot) | 62,23% | 61,46% |
| TruthfulQA | MC2 (0-shot) | 48,93% | 48,34% |

Los datos de la columna "Baseline 3B" provienen de la model card del autor y corresponden al modelo base sin el afinamiento por destilacion.

## Requisitos de hardware

- VRAM estimada: menos de 6 GB para inferencia en bfloat16, segun la model card
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.)
- Compatible con GPUs de consumo: si, es uno de los objetivos principales del modelo
- Precision bfloat16 requiere hardware compatible (arquitectura Ampere o superior de NVIDIA)
- Opciones de despliegue: Transformers (HuggingFace), text-generation-inference, Unsloth
- Latencia y throughput: no disponible en la informacion proporcionada

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para otros modelos de 3B en la informacion proporcionada. Como alternativas de la misma categoria se pueden considerar Qwen2.5-3B, Llama-3.2-3B y SmolLM2-3B, aunque no se dispone de datos de comparacion directa en la informacion disponible. El modelo comparte con ellos el tamano (~3B) y la licencia Apache 2.0 en algunos casos, pero su diferenciador principal es el afinamiento por destilacion de DeepSeek-R1 para razonamiento.

## Limitaciones y advertencias

- Ventana de contexto limitada a 2.048 tokens, insuficiente para tareas de contexto largo o documentos extensos
- Idiomas soportados limitados a ingles y rumano; no se garantiza rendimiento en otros idiomas
- Riesgo de alucinacion en temas fuera de su dominio de entrenamiento, como cualquier modelo de este tamano
- El rendimiento en tareas de razonamiento complejo puede ser inferior al de modelos mucho mas grandes como DeepSeek-R1 original
- No se dispone de informacion sobre sesgos especificos del modelo ni sobre su comportamiento en escenarios adversariales
- El numero de descargas y likes es cero, lo que sugiere que es un modelo reciente con poca validacion externa por parte de la comunidad

## Enlaces

- HuggingFace: https://huggingface.co/MAlexCCBC/TinyChampion-3B-R1
- No se han encontrado enlaces adicionales (papers, blogs, repositorios) en la informacion proporcionada.
