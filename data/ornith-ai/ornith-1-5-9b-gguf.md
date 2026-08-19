# ornith-ai/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9 000 millones de parámetros desarrollado por el equipo de Ornith AI. Forma parte de la familia Ornith-1.5, que amplía el enfoque de auto-mejora de Ornith-1.0: en lugar de depender de tareas fijas y entornos predefinidos, el modelo genera sus propias tareas de entrenamiento, descubre estrategias para resolverlas y mejora su política mediante aprendizaje por refuerzo. Este proceso de auto-mejora de extremo a extremo busca optimizar conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones.

El modelo está diseñado para tareas de codificación agéntica, razonamiento y uso como agente conversacional. Su tamaño de 9B lo hace adecuado para despliegue en una sola GPU y, mediante cuantización, para entornos con recursos limitados. La versión publicada en HuggingFace corresponde a pesos en formato GGUF, lo que facilita su uso con herramientas como llama.cpp u Ollama. La licencia MIT permite uso comercial sin restricciones.

La relevancia de Ornith-1.5-9B radica en que demuestra que un modelo relativamente compacto puede alcanzar resultados competitivos en benchmarks de ingeniería de software y agente, superando a modelos más grandes en algunas pruebas, según los datos publicados por sus desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin detalles adicionales disponibles) |
| Parametros totales | 8 953 803 264 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones especificas no listadas en la informacion disponible) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 47,8 GB que incluye multiples archivos de cuantizacion) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna exacta (numero de capas, dimensiones, atencion, etc.). Se sabe que es un modelo denso de ~9B parametros, a diferencia de los otros miembros de la familia Ornith-1.5 que usan arquitectura MoE (35B y 397B). El entrenamiento se basa en un bucle de auto-mejora: el modelo genera nuevas tareas de entrenamiento, construye scaffolds (entornos o herramientas) y produce rollouts de soluciones, que luego se utilizan para mejorar la politica mediante aprendizaje por refuerzo. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiquetado como conversacional).
- Razonamiento y resolucion de problemas en tareas de codificacion y agente.
- Uso de herramientas y ejecucion de comandos en terminal (evidenciado por benchmarks como Terminal-Bench y SWE-bench).
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas y estrategias durante el entrenamiento, aunque esto no es una capacidad en inferencia.
- Soporte para despliegue en edge y dispositivos moviles mediante cuantizacion (mencionado en la model card como variante Mobile).
- Compatible con pipelines de generacion de texto de transformers y con endpoints compatibles con OpenAI (segun tags de HuggingFace).

## Casos de uso

- Asistente de programacion en tiempo real: el modelo puede ayudar a escribir, revisar y depurar codigo en el IDE, aprovechando su capacidad de razonamiento sobre fragmentos de codigo y su entrenamiento en tareas de ingenieria de software.
- Agente de automatizacion de terminal: gracias a su rendimiento en Terminal-Bench, puede ejecutar comandos, interpretar salidas y tomar decisiones para completar tareas administrativas o de desarrollo, como gestion de dependencias o ejecucion de scripts.
- Resolucion de issues en repositorios: con un 70,6% en SWE-bench Verified, puede proponer parches o soluciones a problemas reales de GitHub, integrandose en flujos de trabajo de mantenimiento de codigo.
- Chatbot de soporte tecnico: su naturaleza conversacional y su capacidad de razonamiento lo hacen util para atender consultas de usuarios sobre productos o servicios, manteniendo contexto en dialogos largos (si la longitud de contexto lo permite, aunque no se ha especificado).
- Generacion de documentacion tecnica: puede redactar explicaciones, comentarios de codigo o guias a partir de especificaciones o fragmentos de codigo, reduciendo el trabajo manual.
- Educacion y formacion en programacion: como tutor interactivo, puede explicar conceptos, proponer ejercicios y evaluar soluciones, adaptandose al nivel del estudiante.

## Benchmarks y rendimiento

Los datos de la tabla siguiente provienen de la model card publicada por el autor. Se comparan los resultados de Ornith-1.5-9B con otros modelos de tamano similar o superior. No se han publicado resultados en benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |
| SWE-bench Multilingual | no disponible | - | - | - | - |

Nota: el valor de SWE-bench Multilingual no se muestra completo en la informacion proporcionada; se omite por falta de datos.

## Requisitos de hardware

- El repositorio GGUF tiene un tamano total de 47,8 GB, lo que sugiere que incluye multiples archivos de cuantizacion (probablemente desde Q4 hasta Q8 o FP16). No se especifican los archivos individuales.
- Para un modelo denso de ~9B parametros, las cuantizaciones tipicas en GGUF ocupan aproximadamente:
  - Q4_K_M: ~5-6 GB
  - Q5_K_M: ~6-7 GB
  - Q8_0: ~10 GB
  - FP16: ~18 GB
  (Estimaciones basadas en el tamano estandar para modelos de esta magnitud; no hay datos oficiales.)
- Una GPU con 8 GB de VRAM puede ejecutar cuantizaciones Q4 o Q5. Para Q8 o FP16 se recomiendan 12-24 GB.
- Es compatible con motores de inferencia como llama.cpp, Ollama, LM Studio y vLLM (este ultimo requiere convertir los pesos a safetensors o usar el formato original).
- Para despliegue en produccion con alta concurrencia, se recomienda una GPU profesional (A100, H100) o multiples GPUs consumer con tensor parallelism, aunque el modelo no es muy grande.
- La variante Mobile mencionada en la model card sugiere que puede ejecutarse en dispositivos moviles con cuantizacion agresiva, aunque no se dan detalles.

## Comparativa con modelos similares

Ornith-1.5-9B compite directamente con otros modelos de ~9B orientados a codigo y agentes, y tambien con modelos MoE mas grandes que ofrecen rendimiento superior a cambio de mas recursos. La tabla de benchmarks anterior ya compara con Qwen3.5-9B (denso, mismo tamano) y con Qwen3.6-35B-A3B y Gemma-4-31B (modelos mayores). En resumen:

- Frente a Qwen3.5-9B, Ornith-1.5-9B obtiene una ventaja clara en todos los benchmarks publicados (46,2 vs 21,3 en Terminal-Bench; 70,6 vs 53,2 en SWE-bench Verified).
- Frente a Qwen3.6-35B-A3B (MoE con 3B activos), Ornith-1.5-9B es inferior en Terminal-Bench y SWE-bench Verified, pero superior en SWE-bench Pro (47,5 vs 49,5, aunque la diferencia es pequena). Qwen3.6-35B-A3B requiere mas VRAM y tiene una licencia distinta (Apache 2.0).
- Frente a Gemma-4-31B, Ornith-1.5-9B supera en SWE-bench Verified (70,6 vs 52,0) y en SWE-bench Pro (47,5 vs 35,7), aunque Gemma-4-31B no tiene datos en Terminal-Bench. Gemma usa licencia Gemma Terms of Use, mas restrictiva que MIT.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o comportamientos peligrosos. Como modelo de 9B, es probable que presente alucinaciones en tareas de razonamiento complejo o cuando se le piden datos factuales no presentes en su entrenamiento.
- La longitud de contexto no se ha publicado; esto limita su uso en tareas que requieran ventanas muy largas (por ejemplo, analisis de repositorios completos).
- Los idiomas soportados no estan documentados; aunque probablemente tenga capacidades multilingue, no hay garantia.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantias.
- Los benchmarks publicados se centran en codificacion y agentes; no hay datos sobre tareas generales de lenguaje (MMLU, etc.), por lo que su rendimiento en otros dominios es desconocido.
- El proceso de auto-mejora descrito en la model card se refiere al entrenamiento, no a una capacidad de auto-mejora en tiempo de inferencia; no debe confundirse.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Pagina principal de Ornith AI: https://ornith.ai/
- Guia de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
- Repositorio de Ornith-1.0-9B (modelo base): https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio de Ornith-1.0-9B-GGUF: https://huggingface.co/ornith-ai/Ornith-1.0-9B-GGUF
