# npario/Ornith-1.5-35B-A3B-Abliterated-MLX-4bit

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MLX-4bit es un derivado experimental no oficial del modelo multimodal Ornith-1.5-35B-A3B de Ornith AI, convertido al formato MLX y cuantizado a 4 bits por PocketAI Model Lab. El modelo original es un MoE disperso de 35 mil millones de parámetros con aproximadamente 3 mil millones activos por token, entrenado mediante un bucle de auto-mejora de extremo a extremo que combina generación de tareas, construcción de andamios y rollouts de soluciones con aprendizaje por refuerzo. Este derivado incorpora además una modificación de abliteración que suprime el comportamiento de rechazo aprendido, lo que lo hace más propenso a responder a instrucciones que el modelo de instrucción original.

La relevancia de esta versión radica en que permite ejecutar un modelo multimodal de alto rendimiento en hardware Apple Silicon con un consumo de memoria reducido (aproximadamente 19 GiB), gracias a la cuantización affine de 4 bits con grupo 64 y a la conservación de la torre de visión. Está validado con `mlx==0.32.0` y `mlx-vlm==0.6.8`, y ha pasado una prueba de humo básica de entrada de imagen. Sin embargo, al ser una versión abliterada, presenta riesgos adicionales de generación de contenido inapropiado, y su evaluación exhaustiva en tareas de visión, codificación o uso de herramientas sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso multimodal (imagen-texto), basada en Qwen3.5-MoE |
| Parametros totales | 35B (modelo original); 5.865.901.936 en el archivo safetensors cuantizado |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (grupo 64); router y compuertas de experto compartidas en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Ornith-1.5-35B-A3B es un MoE disperso con 35B parámetros totales y ~3B activos por token, entrenado mediante un proceso de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera andamios específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. Esta versión derivada es una conversión MLX que conserva la torre de visión y aplica una cuantización affine de 4 bits con grupo 64, manteniendo el router y las compuertas de experto compartidas en 8 bits. La cabeza de decodificación especulativa MTP nativa no está incluida porque `mlx-vlm==0.6.8` elimina los tensores `mtp.*` durante la conversión.

La abliteración se realizó midiendo una dirección proyectada dañina-inofensiva a partir de 256 prompts de longitud coincidente por clase en el límite de generación de asistente. La dirección se extrajo de la capa 27 y se aplicó a las capas 15-39 con escala 1.0 y preservación de norma por columna de entrada. Se modificaron 75 tensores físicos y 6.450 rutas lógicas de experto/proyección. La validación de deriva frente al maestro BF16 regular mostró una KL media de 0,664004, un acuerdo top-1 del 75,26% y un coseno residual de 0,920719 en la ruta total de 4 bits.

## Capacidades

- Generacion de texto y razonamiento: el modelo base está diseñado para tareas agénticas y razonamiento multi-paso, aunque esta versión no ha sido evaluada exhaustivamente en dichas tareas.
- Multimodal: entrada de imagen y texto, salida de texto. La torre de visión está presente y la versión de 4 bits pasó una prueba de humo básica de entrada de imagen.
- Tool calling y uso de agentes: el modelo original está orientado a tareas agénticas, lo que sugiere soporte de tool calling, pero no hay confirmación específica para esta versión.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento (thinking mode): no disponible; la cabeza MTP especulativa no está incluida.
- Abliteracion: el modelo ha sido modificado para suprimir el rechazo aprendido, por lo que responde a una gama más amplia de instrucciones, incluidas aquellas que el modelo original rechazaría.

## Casos de uso

- Asistente de codigo en entornos Apple Silicon: al ser un MoE de ~3B activos y caber en ~19 GiB, puede ejecutarse en una Mac con 32 GB de RAM unificada para asistencia de programacion en local, con generacion de codigo y explicaciones de fragmentos.
- Analisis de imagenes en local: gracias a la torre de vision conservada, puede describir imagenes, extraer texto de capturas o responder preguntas sobre fotografias sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Prototipado de agentes autonomos: su naturaleza agéntica y su capacidad de razonamiento multi-paso lo hacen adecuado para experimentar con pipelines de agentes que requieren planificacion y ejecucion de tareas, aunque la falta de cabeza MTP limita la velocidad de decodificacion especulativa.
- Generacion de contenido creativo sin restricciones: la abliteracion permite explorar generacion de texto en dominios donde el modelo original rechazaria peticiones, como escritura de ficcion con tematicas adultas o dialogos de personajes controvertidos, siempre bajo responsabilidad del usuario.
- Educacion y demostraciones de modelos MoE: su tamano compacto y su licencia MIT lo hacen util para ensenar conceptos de mezcla de expertos, cuantizacion y abliteracion en cursos de IA, con la posibilidad de inspeccionar los manifiestos de validacion incluidos en el repositorio.
- Evaluacion de robustez frente a jailbreaks: al ser un modelo deliberadamente abliterado, puede servir como banco de pruebas para estudiar tecnicas de alineacion, medir la eficacia de metodos de rechazo y analizar el equilibrio entre utilidad y seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento disponibles provienen de la validacion de deriva del propio derivado y de cifras reportadas por el proveedor para el modelo original.

| Metrica | Valor |
|---|---|
| Terminal-Bench 2.1 (modelo original, promedio de 5 ejecuciones) | 68,5 |
| SWE-Bench Verified (modelo original, promedio de 5 ejecuciones) | 79,0 |
| KL media (ruta 4-bit vs BF16 regular) | 0,664004 |
| Acuerdo top-1 (ruta 4-bit vs BF16 regular) | 75,26% |
| Coseno residual (ruta 4-bit vs BF16 regular) | 0,920719 |
| Acuerdo top-1 (cuantizacion 4-bit vs maestro BF16 abliterado) | 87,32% |
| KL media (cuantizacion 4-bit vs maestro BF16 abliterado) | 0,143691 |

La pantalla de comportamiento del padre BF16 abliterado mostró 0/100 frases de rechazo explícitas en prompts dañinos y 0/100 en controles benignos, con texto de respuesta final presente en 100/100 en ambos casos. La deriva por categorías en la ablación BF16 pura fue: capacidad KL 0,018342 (acuerdo 97,94%), benigno KL 0,307388 (acuerdo 85,42%) y dañino KL 1,049146 (acuerdo 60,94%).

## Requisitos de hardware

- Memoria: el archivo de pesos ocupa aproximadamente 19,03 GiB, por lo que se recomienda un minimo de 24 GB de RAM unificada para cargar el modelo, y 32 GB o más para trabajar con contextos largos o imagenes de alta resolucion.
- GPU: diseñado para Apple Silicon (M1, M2, M3, M4 y sucesores). No requiere GPU discreta; utiliza la memoria unificada del chip.
- Compatibilidad con consumer GPU: no aplica, ya que el formato MLX es exclusivo de Apple Silicon. Para GPUs NVIDIA se necesitaria una conversion a otro formato (GGUF, etc.) no proporcionada.
- Opciones de despliegue: se ejecuta con `mlx-vlm` (version 0.6.8) y `mlx` (version 0.32.0). No hay soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos, se espera un rendimiento razonable en Apple Silicon, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (original) | 35B | ~3B | no disponible | MIT | safetensors (BF16) | Modelo base sin abliteracion ni cuantizacion |
| Ornith-1.5-35B-A3B-Abliterated-MLX-8bit | 35B | ~3B | no disponible | MIT | MLX 8-bit | Version recomendada por el autor del derivado |
| Ornith-1.5-35B-A3B-Abliterated-MLX-BF16 | 35B | ~3B | no disponible | MIT | MLX BF16 | Referencia de mayor precision |
| Ornith-1.5-35B-A3B-Abliterated-MLX-4bit (este) | 35B | ~3B | no disponible | MIT | MLX 4-bit | Version compacta, unica con prueba de imagen de extremo a extremo |

No se dispone de datos de comparacion con otros modelos MoE de tamano similar (p. ej., Qwen3-30B-A3B) en la informacion proporcionada.

## Limitaciones y advertencias

- Abliteracion deliberada: el modelo fue modificado para suprimir el rechazo aprendido, por lo que puede producir contenido dañino, ilegal, ofensivo, enganoso o incorrecto con mayor facilidad que el modelo de instruccion original. No es un entrenamiento de veracidad ni una garantia de cumplimiento universal.
- Riesgo de alucinacion: al ser una version cuantizada y abliterada, la calidad de las respuestas puede degradarse en tareas complejas. La validacion de deriva muestra una KL media de 0,66 frente al BF16 regular, lo que indica diferencias notables en la distribucion de salida.
- Cabeza MTP ausente: la decodificacion especulativa nativa no esta incluida, lo que puede reducir el rendimiento en generacion de texto largo.
- Evaluacion limitada: solo se realizo una prueba de humo de imagen en la version de 4 bits. Vision, video, codificacion, uso de herramientas y contexto largo no han sido evaluados.
- Sesgos y limitaciones de idioma: no se dispone de informacion sobre los idiomas soportados ni sobre sesgos especificos del modelo.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el aviso de seguridad de la model card recomienda evaluar y restringir las salidas de forma independiente para cada caso de uso.
- Compatibilidad: requiere `mlx==0.32.0` y `mlx-vlm==0.6.8`; versiones posteriores pueden no ser compatibles con los tensores del modelo.

## Enlaces

- [Modelo en HuggingFace (npario/Ornith-1.5-35B-A3B-Abliterated-MLX-4bit)](https://huggingface.co/npario/Ornith-1.5-35B-A3B-Abliterated-MLX-4bit)
- [Modelo original (ornith-ai/Ornith-1.5-35B-A3B)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Version 6-bit XL del mismo autor](https://huggingface.co/npario/Ornith-1.5-35B-A3B-6bit-XL-mlx)
- [Version BF16 del derivado](https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-MLX-BF16)
- [Version 8-bit del derivado](https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-MLX-8bit)
- [Version 4-bit compact del derivado](https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated-MLX-4bit)
- [Coleccion Ornith-1.5 en HuggingFace](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Pagina oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Repositorio GitHub de Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Ficha en LLM Releases](https://www.llm-releases.com/models/ornith-1-5-35b-a3b)
