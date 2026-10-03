# Epicbracelect221/Qwen3-14B-MLX-4bit

## Resumen

Qwen3-14B-MLX-4bit es una cuantización comunitaria de 4 bits, en formato MLX, del modelo denso Qwen3-14B de Alibaba Qwen. La ha publicado el usuario Epicbracelect221 en HuggingFace, partiendo del checkpoint base Qwen/Qwen3-14B-Base. Su propósito es permitir la ejecución local del modelo en ordenadores Apple Silicon (M1/M2/M3/M4) con memoria unificada, algo inviable con los pesos completos en bf16, que ocupan aproximadamente 29,5 GB. La arquitectura es un transformer causal denso de 14,8 mil millones de parámetros totales (13,2 mil millones sin contar embeddings), 40 capas y atención con Grouped Query Attention (40 cabezas de consulta frente a 8 de clave/valor).

El modelo hereda las capacidades de la familia Qwen3: conmutación entre modo de razonamiento ("thinking") y modo directo ("non-thinking") dentro del mismo checkpoint, soporte declarado de más de 100 idiomas y dialectos, y capacidades de agente con integración de herramientas externas. La longitud de contexto nativa es de 32.768 tokens, ampliable a 131.072 mediante escalado YaRN.

La relevancia de esta ficha es doble. Por un lado, documenta la vía más práctica para usar un modelo de 14B con calidad de razonamiento en hardware de consumo Apple. Por otro, conviene ser explícito sobre su naturaleza: es un reempaquetado con 0 descargas y 0 valoraciones en el momento de la consulta, sin resultados de evaluación propios publicados, y con una model card adaptada de la documentación oficial de Qwen. Debe tratarse, por tanto, como un artefacto comunitario no validado, no como una publicación oficial de Alibaba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con Grouped Query Attention (GQA) |
| Parametros totales | 14.768.307.200 (~14,8B); 13,2B sin embeddings |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | 4-bit en formato MLX (este repositorio). No se distribuyen otras precisiones aquí; el detalle del esquema de grupo (group size) no está disponible |
| Idiomas soportados | La metadata de HuggingFace indica "no disponibles"; la model card del autor declara más de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cuantizados para el runtime MLX) |
| Libreria / runtime | mlx (mlx_lm >= 0.25.2) |
| Capas | 40 |
| Cabezas de atencion | 40 para Q, 8 para KV (GQA) |
| Modelo base | Qwen/Qwen3-14B-Base |
| Tamano del repositorio | 7,9 GB |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-14B, es un transformer causal denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y Grouped Query Attention con 40 cabezas de consulta y 8 de clave/valor. Las 40 capas y los 13,2B de parámetros no pertenecientes a embeddings configuran un modelo de escala media dentro de la familia Qwen3, que combina variantes densas y de mezcla de expertos (MoE). Qwen3-14B fue entrenado en dos etapas declaradas por el autor: preentrenamiento y post-entrenamiento. El número exacto de tokens de entrenamiento, la composición del dataset y los detalles de las fases de alineación (RLHF, DPO u otras) no están disponibles en la información proporcionada.

Este repositorio concreto no aporta entrenamiento adicional: es una cuantización a 4 bits de los pesos base, empaquetada para el runtime MLX de Apple. La innovación funcional que hereda del modelo original es la conmutación explícita entre modo "thinking" y modo "non-thinking" mediante el parámetro `enable_thinking` de la plantilla de chat, con un mecanismo adicional de conmutación por entrada del usuario (`/think` y `/no_think`). En modo thinking el modelo genera contenido de razonamiento dentro de un bloque `<think>...</think>` antes de la respuesta final. El autor recomienda Temperature=0.6, TopP=0.95, TopK=20 y MinP=0 para modo thinking, y Temperature=0.7, TopP=0.8, TopK=20 y MinP=0 para modo non-thinking, advirtiendo explícitamente contra la decodificación greedy por riesgo de degradación y repeticiones infinitas.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explícito en modo thinking, orientado a lógica, matemáticas y programación.
- Modo non-thinking para diálogo general de baja latencia, con comportamiento asimilable a Qwen2.5-Instruct.
- Generación y comprensión de código, con foco declarado en tareas de programación y depuración.
- Soporte de tool calling y function calling en ambos modos (thinking y non-thinking).
- Capacidades de agente para tareas de varios pasos con integración de herramientas externas.
- Multilingüismo declarado de más de 100 idiomas y dialectos, con instrucciones y traducción.
- Alineación con preferencias humanas orientada a escritura creativa, role-playing y seguimiento de instrucciones.
- Ventana de contexto ampliable a 131.072 tokens mediante YaRN (no activa por defecto).
- No dispone de capacidades de visión ni de audio: es un modelo estrictamente de texto.

## Casos de uso

- Asistente conversacional local en Mac: con 7,9 GB de pesos en 4 bits, el modelo cabe en un equipo Apple Silicon de 16 GB o más y permite mantener conversaciones privadas sin enviar datos a la nube.
- Razonamiento matemático y análisis paso a paso: activando `enable_thinking=True`, el modelo expone su cadena de razonamiento en el bloque `<think>`, lo que resulta útil para depuración de problemas, tutoría o verificación de cálculos donde interesa auditar el proceso, no solo el resultado.
- Generación de código en entornos locales: al soportar tool calling, puede integrarse en flujos de asistencia a la programación que consulten documentación, ejecuten tests o invoquen APIs internas mediante funciones declaradas.
- Agentes de varios pasos: su capacidad declarada de integración con herramientas en ambos modos permite construir pipelines que encadenen búsqueda, cálculo y síntesis sin cambiar de modelo entre fases.
- Análisis de documentos largos: con YaRN activado hasta 131.072 tokens, admite contratos, informes técnicos o transcripciones extensas en una sola pasada, útil en entornos legales, académicos o de auditoría donde la información no puede salir del dispositivo.
- Traducción y atención multilingüe: el soporte declarado de más de 100 idiomas lo hace apropiado para preprocesado multilingüe, traducción asistida y respuesta a usuarios en varios idiomas desde un único despliegue.
- Prototipado y evaluación de pipelines de IA: al ejecutarse con `mlx_lm`, permite validar prompts, plantillas de chat y estrategias de decodificación a coste cero de API antes de migrar a un despliegue en servidor.
- Ajuste fino ligero con LoRA: el ecosistema MLX incluye utilidades de entrenamiento LoRA, de modo que el modelo puede adaptarse a dominios concretos en hardware Apple sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog, al repositorio de GitHub y a la documentación oficial de Qwen para consultar las evaluaciones del modelo base, pero no incluye tablas de resultados para esta cuantización. Tampoco se han publicado mediciones de latencia o throughput específicas de esta versión en 4 bits.

## Requisitos de hardware

- Memoria para los pesos: 7,9 GB de repositorio en 4 bits, frente a unos 29,5 GB de los pesos bf16 originales.
- VRAM o memoria unificada estimada: alrededor de 9-10 GB con contexto corto; aproximadamente 14-15 GB si se agotan los 32.768 tokens nativos, dado que la caché KV en fp16 para esta configuración (40 capas, 8 cabezas KV, dimensión 128) ronda los 0,15 MB por token, es decir, unos 5 GB a contexto completo. Son estimaciones de cálculo, no mediciones publicadas.
- Cabe en GPU de consumo: sí, pero únicamente en el sentido de memoria unificada de Apple Silicon. El formato MLX está diseñado para Apple Silicon (serie M) y no se ejecuta sobre GPU NVIDIA o AMD.
- Equipos recomendados: Mac con 16 GB de memoria unificada para contexto corto; 24-32 GB recomendables para contexto largo o uso concurrente; los modelos Max y Ultra permiten mayor ancho de banda de memoria y, por tanto, mejor velocidad de generación.
- No compatible con A100, H100 ni RTX 4090: para esas plataformas habría que recurrir al modelo base en bf16, a cuantizaciones GGUF para llama.cpp/Ollama o a cuantizaciones AWQ/GPTQ para vLLM.
- Opciones de despliegue: `mlx_lm` (carga y generación en Python), servidor compatible con OpenAI de `mlx_lm`, LM Studio y otras herramientas basadas en MLX. No es desplegable mediante vLLM, TGI, llama.cpp, Ollama ni transformers con CUDA sin convertir los pesos.
- Latencia y throughput: no disponible. Dependen directamente del chip concreto, del ancho de banda de memoria y del modo de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Epicbracelect221/Qwen3-14B-MLX-4bit | 14,8B | 32K nativo / 131K con YaRN | 4-bit MLX | MLX (Apple Silicon) | Apache 2.0 | Comunitaria, 0 descargas |
| Qwen/Qwen3-14B (oficial) | 14,8B | 32K nativo / 131K con YaRN | bf16 | transformers, vLLM, SGLang | Apache 2.0 | Oficial, ampliamente validada |
| Cuantizaciones GGUF de Qwen3-14B (comunidad) | 14,8B | 32K nativo / 131K con YaRN | 4/5/6/8-bit GGUF | llama.cpp, Ollama, LM Studio | Apache 2.0 | Comunitaria, mucho mas extendida |
| Qwen3-30B-A3B (MoE) | Aprox. 30,5B totales / 3,3B activos | 32K nativo / 131K con YaRN | bf16 y cuantizaciones | transformers, vLLM, SGLang | Apache 2.0 | Oficial |

Nota: los datos de contexto, licencia y arquitectura de los modelos comparados provienen de la documentación general de la familia Qwen3 y de la información de la model card; los valores concretos de la variante MoE no estaban incluidos en la información proporcionada. El rendimiento comparado no se puede establecer porque no hay benchmarks publicados para esta cuantización.

## Limitaciones y advertencias

- Artefacto comunitario no validado: 0 descargas y 0 valoraciones en el momento de la consulta, y fecha de creación posterior a la de los checkpoints oficiales. No existe evidencia pública de que la cuantización preserve fielmente el comportamiento del original.
- Model card no original: el fragmento de código de ejemplo carga `Qwen/Qwen3-14B-MLX-4bit`, no el identificador de este repositorio, lo que sugiere que el texto se ha adaptado de la publicación oficial. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- Pérdida de calidad por cuantización: la reducción a 4 bits puede degradar tareas sensibles a la precisión numérica, en particular matemáticas y código de razonamiento largo. No hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, especialmente en modo non-thinking y en preguntas factuales sobre dominios poco representados.
- Degradación por decodificación: el propio autor advierte que la decodificación greedy puede provocar repeticiones y pérdida de rendimiento. Hay que respetar los parámetros de muestreo recomendados por modo.
- Limitaciones de contexto: los 131.072 tokens requieren activar YaRN explícitamente; el comportamiento por defecto es de 32.768 tokens. A contexto completo, la caché KV consume varios gigabytes adicionales.
- Idiomas: la metadata de HuggingFace no declara idiomas; el soporte multilingüe proviene de la model card heredada y no está verificado para esta cuantización.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y se indique si se han realizado cambios. Al ser un derivado cuantizado, debe mantenerse también la atribución a Qwen.
- Dependencia de plataforma: al estar en formato MLX, el modelo queda ligado al ecosistema Apple. Migrar a servidores con GPU NVIDIA exige reconvertir los pesos.
- Sin soporte multimodal: no procesa imágenes ni audio, por lo que no sirve para casos de uso de visión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Epicbracelect221/Qwen3-14B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo oficial Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper referenciado en las etiquetas (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper referenciado en las etiquetas (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Documentación de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre la familia Qwen3; los resultados obtenidos eran contenido no relacionado y se han descartado.
