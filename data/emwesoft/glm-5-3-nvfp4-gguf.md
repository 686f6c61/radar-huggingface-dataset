# emwesoft/GLM-5.3-NVFP4-GGUF

## Resumen

GLM-5.3 es el último modelo insignia de Z.ai (anteriormente Zhipu AI), diseñado específicamente para tareas de codificación y razonamiento de largo horizonte. Esta ficha cubre la conversión GGUF nativa en NVFP4 publicada por el usuario emwesoft, que mantiene los pesos originales en formato NVFP4 sin requantizar, a partir del repack oficial de NVIDIA (incoai/GLM-5.3-NVFP4). El modelo base tiene 753 mil millones de parámetros, arquitectura glm-dsa (MoE con 256 expertos), 78 bloques (79 con la cabeza MTP) y una ventana de contexto de 1 millón de tokens.

La relevancia de esta conversión radica en que permite ejecutar GLM-5.3 en llama.cpp con decodificación especulativa mediante dos mecanismos: el drafter DFlash2 (también incluido en el repo) y la cabeza MTP (Multi-Token Prediction) opcional. El autor reporta velocidades de 7.6 a 12.8 tokens por segundo en una configuración de 2× RTX PRO 6000 Blackwell + 4× RTX 3090, con aceptación de borradores de hasta 67.7%. El modelo se distribuye bajo licencia MIT, sin restricciones regionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm-dsa (MoE con 256 expertos, 78 bloques, hidden 6144) |
| Parametros totales | 753B (modelo principal); el repo incluye además un drafter DFlash2 de ~2.5B |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el número de expertos activos) |
| Longitud de contexto | 1M tokens (según documentacion oficial de Z.ai) |
| Tipos de cuantizacion | NVFP4 (nativa, sin requantizar); drafter en BF16 y Q8_0 |
| Idiomas soportados | no disponible (GLM-5.3 es multilingue, pero no se detallan los idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos de 445 GB sin MTP y 465 GB con MTP) |

## Arquitectura y entrenamiento

GLM-5.3 utiliza la arquitectura glm-dsa, una variante de mezcla de expertos (MoE) con 256 expertos y 78 bloques transformer. El modelo base es el mismo que GLM-5.2; todas las mejoras provienen del post-entrenamiento, que según Z.ai logra un incremento del 50% en capacidades de codificacion respecto a GLM-5.2. No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset. El checkpoint incluye una cabeza MTP (NextN) que permite prediccion de multiples tokens, y el template de chat expone parametros de esfuerzo de razonamiento (low, high, max) que no pueden desactivarse.

La conversion NVFP4 mantiene los pesos originales en formato de 4 bits de NVIDIA, sin requantizacion adicional. El drafter DFlash2, tambien incluido, consume los estados ocultos del modelo en las capas [6,20,34,48,62,76] y es compatible con cualquier GGUF de GLM-5.3, no solo con esta conversion.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, con soporte de modo "thinking" (razonamiento encadenado) controlado por parametros de esfuerzo.
- Codificacion avanzada: Z.ai lo describe como el modelo open-weights mas capaz para codificacion, con una mejora del 50% sobre GLM-5.2 en sus evaluaciones internas.
- Tool calling / function calling: soportado, pero requiere un parche no upstream en llama.cpp para el acceso a atributos numericos en la plantilla jinja (sin el, las llamadas a herramientas se devuelven como texto plano).
- Soporte de agentes y tareas multi-paso: disenado para tareas de largo horizonte, con contexto de 1M tokens.
- Capacidades multilingues: no confirmadas en la documentacion disponible, pero el modelo base de Z.ai es multilingue.
- Decodificacion especulativa: compatible con dos mecanismos (DFlash2 y MTP) para acelerar la inferencia.

## Casos de uso

- Asistente de codificacion en entornos de desarrollo: el modelo puede generar, revisar y refactorizar codigo en multiples lenguajes, aprovechando su contexto de 1M tokens para mantener el estado completo de un repositorio grande. Su modo de razonamiento permite explicar decisiones de diseno.
- Agente autonomo para tareas de larga duracion: gracias a su ventana de 1M tokens y su capacidad de razonamiento multi-paso, puede ejecutar pipelines complejos (por ejemplo, resolucion de incidencias en un repositorio, generacion de informes, orquestacion de multiples llamadas a herramientas) sin perder el hilo.
- Generacion de documentacion tecnica: puede producir documentacion detallada a partir de codigo fuente, con razonamiento sobre la logica subyacente.
- Analisis de grandes volumenes de texto: su contexto de 1M tokens permite procesar libros completos, expedientes o logs extensos en una sola pasada, extrayendo resumenes o respondiendo preguntas especificas.
- Desarrollo de agentes conversacionales con herramientas: con los parches adecuados en llama.cpp, puede gestionar conversaciones multi-turno que requieran consultas a APIs externas, bases de datos o servicios web.
- Investigacion en IA: al ser de codigo abierto (MIT), sirve como base para experimentos de fine-tuning, evaluacion de tecnicas de decodificacion especulativa o estudio de arquitecturas MoE a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Z.ai menciona una mejora del 50% en codificacion sobre GLM-5.2 en sus evaluaciones internas, pero no se proporcionan numeros concretos. Los unicos datos de rendimiento medidos son los de throughput de inferencia reportados por el autor de la conversion:

| Configuracion | Decode |
|---|---|
| Sin drafter | ~10 tok/s |
| Con DFlash2 Q8_0, n-max 4 | 7.6 – 12.8 tok/s (depende del prompt) |

| Drafter | Aceptacion | Longitud media aceptada |
|---|---|---|
| Q8_0, n-max 4 | 67.7% (218/322) | 3.69 |
| BF16, n-max 7 | 46.4% codigo / 42.6% estructurado / 25.7% prosa | 4.28 / 4.01 / 2.83 |

## Requisitos de hardware

- VRAM estimada: el modelo completo en NVFP4 ocupa 445 GB (sin MTP) o 465 GB (con MTP). No cabe en ninguna GPU individual; requiere distribucion en multiples GPUs o descarga a CPU.
- GPU recomendadas: la configuracion de prueba del autor usa 2× RTX PRO 6000 Blackwell (96 GB cada una) + 4× RTX 3090 (24 GB cada una), totalizando 288 GB de VRAM, con 37 de 75 bancos de expertos residentes en CPU (251 GB de RAM).
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) sin cuantizaciones mas agresivas que no se ofrecen en este repo.
- Opciones de despliegue: llama.cpp con soporte para `glm-dsa` y `GGML_TYPE_NVFP4`. Se requieren tres parches no upstream para funcionalidad completa (acceso a atributos jinja, exposicion de entradas de capa para decodificacion especulativa, y tolerancia a espacios en blanco antes de `</tool_call>`).
- Latencia y throughput: ~10 tok/s sin drafter, 7.6-12.8 tok/s con DFlash2 en la configuracion descrita. El numero de hilos CPU es critico: usar todos los hilos fisicos (48) colapsa el rendimiento a 0.5 tok/s; se recomienda dejar margen (por ejemplo, `-t 36` en un CPU de 24 nucleos/48 hilos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3 (este repo) | 753B | 1M | MIT | Mejor en codificacion que GLM-5.2, segun Z.ai |
| GLM-5.2 | 753B (misma base) | 1M | MIT | Predecesor, sin las mejoras de post-entrenamiento |
| GLM-5.1 | no disponible | no disponible | MIT | Version anterior, superada por GLM-5.3 |
| DeepSeek-V3 (referencia) | 671B | 128K | MIT | Competidor directo en codificacion, pero sin datos comparativos publicados en la informacion disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere parches no upstream en llama.cpp: sin ellos, el template de chat falla, las tool calls se devuelven como texto plano, la decodificacion especulativa aborta y el parser de streaming pierde llamadas a herramientas.
- La cabeza MTP (bloque 78) esta en BF16, no en NVFP4, y pesa 18.54 GiB (3.7 veces un banco NVFP4 normal). Si se usa `-ot` con catch-all en CPU, hay que fijar explicitamente el bloque 78 a GPU antes del catch-all, o cada token borrador pagara un paso MoE en CPU.
- El rendimiento de la decodificacion especulativa depende fuertemente del tipo de prompt: codigo y salida estructurada se benefician mucho, pero prosa libre tiene tasas de aceptacion bajas (25.7% con BF16).
- El numero de hilos CPU es critico: usar todos los hilos fisicos puede colapsar el rendimiento a 0.5 tok/s por contencion en el threadpool de ggml.
- El modelo no puede desactivar el modo de razonamiento: el template expone solo los niveles low/high/max, y cualquier otro valor se convierte en max.
- No se han publicado resultados de benchmarks estandar, por lo que las afirmaciones de rendimiento en codificacion se basan en evaluaciones internas de Z.ai.
- El repo no incluye cuantizaciones de menor precision (IQ, Q4, etc.) para el modelo principal; solo NVFP4, lo que limita su uso en hardware con poca VRAM.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/emwesoft/GLM-5.3-NVFP4-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Repack NVFP4 de NVIDIA: https://huggingface.co/incoai/GLM-5.3-NVFP4
- Drafter DFlash2: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Repo oficial de GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- Articulo de openlm.ai sobre GLM-5.3: https://openlm.ai/glm-5.5/
- Guia de emergent.sh sobre GLM 5.3: https://emergent.sh/learn/what-is-glm-5-3
