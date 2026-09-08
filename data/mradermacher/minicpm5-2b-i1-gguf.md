# mradermacher/MiniCPM5-2B-i1-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de aproximadamente 2.500 millones de parámetros desarrollado por OpenBMB, diseñado específicamente para ejecución en dispositivos locales y escenarios con recursos limitados. Este repositorio contiene las cuantizaciones GGUF con matriz de importancia (imatrix) creadas por mradermacher, que permiten ejecutar el modelo con distintos niveles de compresión, desde 0.8 GB hasta 2.2 GB. El modelo se basa en una arquitectura Transformer tipo Llama, soporta inglés y chino, y está optimizado para tareas de contexto largo, llamada a herramientas (tool calling) y razonamiento multi-paso. Es relevante porque ofrece un rendimiento de nivel SOTA en su categoría (2B) para despliegue en el borde, sin necesidad de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo Llama) |
| Parametros totales | 2.516.756.480 (≈2.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible (etiqueta long-context, sin cifra) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, más archivo imatrix |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix) |

## Arquitectura y entrenamiento

El modelo es un Transformer denso, sin mezcla de expertos (MoE), con una arquitectura similar a Llama. Según la información del desarrollador, MiniCPM5-2B escala la misma receta de entrenamiento que MiniCPM5-1B, con el objetivo de alcanzar el estado del arte en modelos de 2B para despliegue local. El entrenamiento utilizó una combinación de datasets de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets de SFT (supervised fine-tuning), agentes y RL (reinforcement learning) indica que el modelo fue ajustado para seguir instrucciones, usar herramientas y razonar de forma multi-paso. No se ha proporcionado el número exacto de tokens de entrenamiento.

## Capacidades

- Generación de texto en inglés y chino.
- Soporte de contexto largo, según las etiquetas del repositorio (long-context), aunque no se especifica la longitud exacta.
- Tool calling / function calling, confirmado por la etiqueta "tool-calling".
- Razonamiento matemático, gracias al dataset UltraData-Math.
- Generación de código, gracias al dataset UltraData-Code.
- Capacidad para agentes y razonamiento multi-paso, gracias a los datasets de SFT-Agent y RL.
- Optimizado para despliegue en dispositivos locales y edge (etiquetas on-device, edge-ai).

## Casos de uso

- Asistente conversacional en dispositivos móviles: el modelo puede ejecutarse en smartphones con 4 GB de RAM o menos gracias a las cuantizaciones de bajo peso (desde 0.8 GB), ofreciendo respuestas en inglés y chino sin conexión.
- Atención al cliente automatizada: con soporte de tool calling, el modelo puede consultar bases de datos, sistemas de reservas o APIs externas para resolver consultas multi-turno.
- Generación de código en entornos con recursos limitados: ideal para editores de código locales o entornos de desarrollo embebidos donde no se puede acceder a la nube.
- Procesamiento de documentos largos: su capacidad de contexto largo permite resumir o analizar documentos extensos en inglés o chino, como informes o contratos.
- Tutoría matemática: el modelo puede resolver problemas paso a paso, lo que lo hace adecuado para aplicaciones educativas offline.
- Agentes autónomos en el borde: combinando tool calling y razonamiento multi-paso, puede actuar como agente en tareas de automatización industrial o domótica.
- Traducción y asistencia bilingüe: al soportar inglés y chino, puede servir como traductor o asistente en contextos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la cuantización Q4_K_M ocupa 1.7 GB, por lo que se recomienda al menos 2-3 GB de VRAM. La cuantización Q6_K (2.2 GB) requiere ~3-4 GB. Las cuantizaciones IQ1_S (0.8 GB) pueden ejecutarse con ~1-2 GB.
- GPU recomendadas: RTX 3060, RTX 4060, Apple M1/M2 o cualquier GPU con 4 GB o más de VRAM. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Cabe en GPUs de consumo: sí, especialmente con las cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio para el formato GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la información disponible no se incluyen datos de benchmarks comparativos. A continuación se muestra una comparación de características generales con otros modelos de tamaño similar, sin datos de rendimiento.

| Modelo | Parametros | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B (este) | 2.5B | Apache 2.0 | no disponible | HuggingFace |
| Gemma-2-2B | 2.6B | Licencia Gemma | no disponible | HuggingFace |
| Qwen2.5-1.5B | 1.5B | Apache 2.0 | no disponible | HuggingFace |
| Llama-3.2-1B | 1.2B | Llama 3.2 Community | no disponible | HuggingFace |

Nota: no se dispone de datos de contexto ni benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino, por lo que no es adecuado para tareas en español sin traducción previa.
- Al ser un modelo de 2B, puede presentar mayor riesgo de alucinación que modelos más grandes.
- La cuantización puede degradar ligeramente la calidad de las respuestas en comparación con los pesos originales.
- No se han publicado benchmarks en la información disponible, por lo que el rendimiento real no ha sido verificado de forma independiente.
- El modelo puede heredar sesgos presentes en los datos de entrenamiento, aunque no se han documentado sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar las licencias de los datasets de entrenamiento si se va a usar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/MiniCPM5-2B-i1-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniCPM5-2B-GGUF
- GitHub OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Página de modelo de mradermacher: https://hf.tst.eu/model#MiniCPM5-2B-i1-GGUF
