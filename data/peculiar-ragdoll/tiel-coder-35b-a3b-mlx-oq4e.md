# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e es una versión cuantizada del modelo Ornith-1.5-35B-A3B, desarrollada por el investigador independiente peculiar-ragdoll. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos, que incorpora capacidades de visión y lenguaje (image-text-to-text). La versión presentada aquí está re-cuantizada con el cuantizador oQ4e de oMLX, un esquema de 4 bits dinámico con mixed precision e imatrix, y lleva incrustado el "Sharp chat template" dentro del checkpoint.

El modelo está orientado a tareas de codificación agéntica y conversaciones multi-turno largas. Según los datos publicados por el autor, en SWE-bench-Live resuelve 12 de 25 problemas, igualando a Opus 4.6 medium y superando a su propio modelo base Ornith-1.5 (8 aciertos) y a Nail (9 aciertos). Su rendimiento en conversación multi-turno (Claw-Eval) alcanza 67.2 puntos, por encima de Ornith (65.3) y Nail (60.5). Sin embargo, su puntuación en MMLU-Pro (73.7) es notablemente inferior a la de Nail (84.0), lo que refleja un sacrificio deliberado de conocimiento general en favor de la eficiencia en codificación.

La relevancia de este modelo radica en su capacidad para ejecutarse en hardware Apple Silicon con un tamaño de 21.1 GB, ofreciendo un rendimiento competitivo en tareas de desarrollo de software en entornos locales. Su licencia MIT permite uso comercial sin restricciones, y su formato MLX lo hace directamente utilizable con las herramientas del ecosistema oMLX y mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE, con vision |
| Parametros totales | 35B (segun nombre del modelo); 6.045.761.392 en safetensors cuantizado |
| Parametros activos | 3B (segun nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4-bit dinamico con mixed precision e imatrix) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Tiel-Coder-35B-A3B-MLX-oQ4e es una re-cuantizacion del modelo Ornith-1.5-35B-A3B, que a su vez se basa en la arquitectura Qwen3.5 MoE. No se dispone de informacion detallada sobre el entrenamiento original de Ornith-1.5 (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). El autor de esta version solo indica que se trata de una cuantizacion con oMLX oQ4e, un cuantizador dinamico de 4 bits que aplica mixed precision segun la posicion de las capas y una no-cuantizacion selectiva, acompanado de un pase de imatrix para mejorar la calidad.

Una innovacion destacable es la incorporacion del "Sharp chat template" dentro del checkpoint, que modifica el formato de las respuestas para favorecer respuestas mas cortas y directas, a costa de una ligera perdida en tareas de conocimiento general. Ademas, se ha eliminado el bloque MTP (multi-token-prediction) que estaba presente en la conversion GGUF de Ornith-1.5, ya que en los safetensors originales no existia. Esto evita problemas de decodificacion y simplifica la ejecucion.

## Capacidades

- Generacion de texto y codigo: el modelo es capaz de escribir, explicar y depurar codigo en multiples lenguajes, como demuestra su rendimiento en SWE-bench-Live.
- Razonamiento multi-step: resuelve problemas complejos de ingenieria de software que requieren planificacion y ejecucion de multiples pasos.
- Vision: al ser un modelo image-text-to-text, puede procesar imagenes y responder preguntas sobre ellas (por ejemplo, analizar capturas de pantalla o diagramas).
- Conversacion multi-turno: mantiene dialogos largos y coherentes, con una puntuacion de 67.2 en Claw-Eval, superando a su modelo base.
- Soporte de agentes: su capacidad para resolver issues reales de repositorios sugiere que puede integrarse en pipelines de agentes autonomos.
- Multilingue: soporta ingles y chino, aunque no se especifica el nivel de competencia en cada idioma.
- No se menciona soporte explicito de tool calling o function calling, aunque su naturaleza agente lo hace probable.

## Casos de uso

- Resolucion de issues en repositorios de codigo: el modelo puede analizar un problema reportado, explorar el codigo relevante y proponer un parche, como se demuestra en SWE-bench-Live. Su tiempo medio por intento (12.3 minutos) lo hace util para integracion en flujos de trabajo de mantenimiento de software.
- Asistente de programacion en local: gracias a su capacidad de generar y explicar codigo, puede usarse como copiloto en entornos de desarrollo integrados (IDE) sin conexion a internet, ejecutandose en un Mac con suficiente memoria unificada.
- Analisis de capturas de pantalla o imagenes tecnicas: su componente de vision permite extraer informacion de diagramas, esquemas o capturas de pantalla de errores, facilitando la depuracion visual.
- Chatbots de soporte tecnico: su buen rendimiento en conversaciones multi-turno y su soporte bilingue (ingles/chino) lo hacen adecuado para sistemas de atencion al cliente en empresas de tecnologia.
- Automatizacion de tareas de desarrollo: puede actuar como agente autonomo que ejecuta comandos, lee archivos y modifica codigo, siempre que se integre con un framework de agentes.
- Prototipado rapido de aplicaciones: su capacidad para generar codigo funcional a partir de descripciones en lenguaje natural permite acelerar la creacion de prototipos en entornos locales.
- Educacion y formacion en programacion: puede utilizarse como tutor que explica conceptos, revisa ejercicios y proporciona retroalimentacion en conversaciones largas.

## Benchmarks y rendimiento

Los siguientes datos fueron medidos por el autor en la version GGUF del modelo, no en esta version MLX. El propio autor advierte que el cambio de cuantizador (oQ4e frente a k-quants de llama.cpp) puede mover los resultados, y cita una diferencia de 0.7 puntos en MMLU-Pro y un 24% en recuento de tokens entre MLX y GGUF sobre los mismos pesos. Por tanto, estos numeros deben interpretarse como evidencia sobre el modelo subyacente, no como mediciones exactas de este archivo.

| Benchmark | Tiel-Coder (4-bit) | Ornith-1.5 (base) | Nail-Qwen3.6 (4-bit) | Qwen3.6-35B-A3B (stock) |
|---|---|---|---|---|
| SWE-bench-Live (aciertos / 25) | 12 | 8 | 9 | 8 |
| Tiempo por intento (mediana / media, min) | 8.6 / 12.3 | no disponible | 7.2 / 15.7 | 5.5 / no disponible |
| Claw-Eval multi-turn (puntuacion) | 67.2 | 65.3 | 60.5 | no disponible |
| MMLU-Pro | 73.7 | 78.0 | 84.0 | 85.3 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 21.1 GB, lo que implica que se necesita al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo en RAM. Se recomienda un Mac con 32 GB o más para un uso comodo.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- Ejemplos de hardware: un MacBook Pro con M4 Pro y 48 GB de RAM unificada es suficiente, segun benchmarks de modelos similares del mismo autor (Nail alcanza 740.3 tokens/s de prefill y 56.9 tokens/s de generacion en ese hardware).
- Opciones de despliegue: oMLX (gestionado desde el dashboard), o directamente con `mlx-vlm` (no `mlx-lm`, ya que es un checkpoint de vision-lenguaje). Tambien se puede descargar con `hf download` y ejecutar con `python -m mlx_vlm.generate`.
- Latencia y throughput: no se proporcionan datos especificos para este modelo, pero el autor indica que su tiempo por intento en SWE-bench-Live es de 8.6 minutos de mediana, lo que sugiere una velocidad adecuada para tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench-Live | MMLU-Pro | Claw-Eval | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35B total, 3B activo | no disponible | 12/25 | 73.7 | 67.2 | MIT | MLX (safetensors) |
| Nail-Qwen3.6-35B-A3B-GGUF | 35B total, 3B activo | no disponible | 9/25 | 84.0 | 60.5 | MIT | GGUF |
| Ornith-1.5-35B-A3B | 35B total, 3B activo | no disponible | 8/25 | 78.0 | 65.3 | MIT | safetensors (original) |
| Dirk-Qwen3.8-27B-GGUF | 27B denso | no disponible | 15/25 | no disponible | no disponible | MIT | GGUF |

Tiel-Coder se posiciona como la opcion mas rapida y eficiente en tareas de codificacion agéntica entre los modelos de su clase, pero sacrifica conocimiento general y razonamiento puro frente a Nail. Dirk, un modelo denso de 27B, resuelve mas problemas en SWE-bench-Live pero a un coste computacional mayor.

## Limitaciones y advertencias

- Rendimiento pobre en tareas de conocimiento general y examenes: su puntuacion de 73.7 en MMLU-Pro es significativamente inferior a la de modelos comparables como Nail (84.0). No es adecuado para aplicaciones que requieran hechos precisos o razonamiento logico complejo.
- Sesgo hacia respuestas cortas: el "Sharp chat template" favorece respuestas concisas, lo que puede ser contraproducente en escenarios que requieran explicaciones detalladas o razonamiento paso a paso.
- Dependencia de Apple Silicon: el formato MLX limita su uso a hardware de Apple. No puede ejecutarse en GPUs NVIDIA o AMD sin conversion previa.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo o respuestas incorrectas. En tareas de codificacion, se recomienda validar siempre el resultado.
- Limitaciones de idioma: solo soporta ingles y chino. No se garantiza un rendimiento adecuado en otros idiomas.
- La cuantizacion oQ4e puede introducir degradaciones adicionales respecto al modelo original, aunque el autor afirma que la diferencia es minima (0.7 puntos en MMLU-Pro frente a la version GGUF).
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version GGUF del mismo modelo: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Sharp chat template: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Nail-Qwen3.6-35B-A3B-GGUF (modelo comparativo): https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Dirk-Qwen3.8-27B-GGUF (modelo comparativo): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Perfil de GitHub del autor: https://github.com/peculiar-ragdoll
