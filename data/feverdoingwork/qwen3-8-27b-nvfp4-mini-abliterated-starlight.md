# feverdoingwork/Qwen3.8-27B-NVFP4-mini-abliterated-Starlight

## Resumen

Qwen3.8-27B-NVFP4-mini-abliterated-Starlight es un fichero de pesos cuantizados del modelo Qwen3.8-27B de Alibaba, publicado por el usuario feverdoingwork. No es un checkpoint estándar de Transformers ni un GGUF: es un fichero propietario en formato `.starlight` de 12,62 GiB (13.551.144.192 bytes) diseñado exclusivamente para el motor de inferencia Starlight sobre tarjetas NVIDIA Blackwell. El modelo base es denso, de 27.000 millones de parámetros, multimodal (entrada de imagen y texto) y con una ventana de contexto nativa de 262.144 tokens.

La variante combina tres transformaciones sobre el modelo original: cuantización NVFP4 (coma flotante de 4 bits con escalas por bloque) con las proyecciones gate y up de cada capa recuantizadas a 3 bits, un proceso de *abliteration* que elimina la dirección de rechazo de las activaciones internas, y la inclusión en el mismo fichero del codificador visual y de la cabeza de borrador MTP (multi-token prediction) para decodificación especulativa. El resultado es un modelo sin filtros de contenido propio que cabe en una única GPU consumer de 16 GB.

Su relevancia es doble: por un lado, demuestra que un modelo denso de 27B multimodal puede ejecutarse en hardware Blackwell de gama media gracias a la cuantización agresiva; por otro, ilustra el ecosistema de ficheros empaquetados para motores específicos, que se aleja del estándar safetensors/GGUF y ata el modelo a un único programa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención lineal en parte de las capas (modelo base Qwen3.8-27B) |
| Parámetros totales | 27.000 millones (modelo base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (límite del modelo) |
| Tipos de cuantización | NVFP4 (4 bits con escalas por bloque) en el cuerpo; gate/up a 3 bits (Q3) en todas las capas; codificador visual desde BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.starlight` (fichero propietario del motor Starlight); no compatible con safetensors, GGUF, llama.cpp, Ollama ni LM Studio |
| Tamaño del fichero | 12,62 GiB (13.551.144.192 bytes) |
| SHA-256 | `44456d056b28e0c64ec838860826501af5d8b0cede00b8c0c11a900062797b34` |
| MD5 | `cd3db230ad3b35727bfc50172ee19ae1` |
| Tensores | 1.252 |
| Hardware objetivo | NVIDIA Blackwell: una RTX 5060 Ti o RTX 5070 Ti de 16 GB, o dos RTX 5060 Ti; sin soporte AMD |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer autorregresivo denso de 27.000 millones de parámetros con arquitectura optimizada, según la documentación de NVIDIA sobre su propia cuantización NVFP4 del mismo modelo. La model card de este fichero menciona explícitamente proyecciones de salida de atención lineal (*linear-attention output projection*) junto a proyecciones de atención clásicas, lo que indica una arquitectura híbrida con capas de atención lineal en parte de la red. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica de este fichero concreto es el proceso de cuantización y modificación. Se parte del fichero NVFP4-mini (MD5 `268fa4aeebba6d6f5641a0667841e31b`) y se sobrescriben 70 matrices que escriben en el flujo residual —26 proyecciones de salida de atención lineal, 35 proyecciones down del MLP y 9 proyecciones de salida de atención, en las capas 17 a 51— con la cuantización NVFP4 round-to-nearest de los tensores del checkpoint abliterado de huihui-ai (revisión `739e3c5b`). El resto de bytes permanece idéntico. Las comprobaciones del autor indican que la magnitud de la dirección de rechazo en esas matrices cae al 30,8–31,6 % de su valor original, que las 70 matrices decodifican exactamente lo que produjo el cuantizador y que el censo de 1.252 tensores no presenta defectos (las únicas páginas a cero son el relleno del vocabulario podado).

El fichero incluye además la cabeza de borrador MTP, lo que permite decodificación especulativa sin un fichero drafter separado, y soporta también el modo DFlash2, que requiere un drafter externo no incluido en el repositorio.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.8-27B.
- Procesamiento multimodal de entrada imagen-texto (`pipeline_tag: image-text-to-text`), con codificador visual incluido en el fichero.
- Decodificación especulativa mediante la cabeza MTP integrada, con aceleración adicional si se usa DFlash2 con un drafter externo.
- Ventana de contexto de 262.144 tokens, con posibilidad de desbordar la caché de atención a RAM del sistema.
- Respuestas sin rechazo: el proceso de abliteration elimina la dirección de rechazo, por lo que el modelo responde a peticiones que el original declinaría.
- No dispone de filtro de contenido propio: no avisa, no rechaza ni modera.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el contexto de 262.144 tokens permite introducir informes, contratos o expedientes completos junto con sus figuras y obtener un análisis conjunto, aprovechando el codificador visual integrado.
- Asistente local sin conexión en una estación de trabajo con RTX 5060 Ti: el fichero de 12,62 GiB cabe en 16 GB de VRAM y permite ejecutar un modelo de 27B multimodal íntegramente en local, sin dependencia de servicios en la nube.
- Investigación sobre alineación y seguridad: al carecer de filtro propio, sirve para estudiar el comportamiento de modelos sin rechazo en entornos controlados de laboratorio, comparando respuestas con la versión original.
- Análisis de capturas de pantalla y diagramas técnicos: la entrada image-text-to-text permite extraer información estructurada de interfaces, gráficos o planos en flujos de documentación técnica.
- Generación de código y texto en pipelines internos: con 27B parámetros densos y contexto largo, puede mantener coherencia en tareas de refactorización sobre repositorios extensos introducidos en el contexto.
- Despliegue en configuraciones de dos GPU: con dos RTX 5060 Ti se alcanza la ventana completa de 262.144 tokens y velocidades de decodificación de hasta 176,9 tok/s en modo DFlash2, adecuado para servidores de inferencia de pequeño tamaño.
- Evaluación comparativa de cuantizaciones: útil para medir la pérdida de calidad de NVFP4 con gate/up a 3 bits frente al checkpoint BF16 en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son mediciones de velocidad y ventana de contexto del fichero NVFP4-mini original (no repetidas para esta variante abliterada):

| Tarjeta | Modo | Mayor contexto de arranque | Velocidad de decodificación |
|---|---|---|---|
| RTX 5060 Ti, una tarjeta | MTP | 178.176 tokens (262.144 con desbordamiento de caché) | 70,3 tok/s (BetterBench, 30 oct 2026) |
| RTX 5060 Ti, una tarjeta | DFlash2 | 141.000 tokens (262.144 con desbordamiento) | 114,0 tok/s (30 oct 2026) |
| RTX 5060 Ti, una tarjeta | Sin especulación | 179.200 tokens (262.144 con desbordamiento) | 18,4 tok/s (30 oct 2026) |
| RTX 5060 Ti, dos tarjetas | MTP | 262.144 tokens | 128,3 tok/s (30 oct 2026) |
| RTX 5060 Ti, dos tarjetas | DFlash2 | 262.144 tokens | 176,9 tok/s (29 oct 2026) |

Las cifras corresponden a ejecuciones únicas con la compilación del motor Starlight de la fecha indicada, con caché de atención q4_0. BetterBench v0.6.1 es la referencia de medición (tokens por segundo ponderados sobre una mezcla de prompts).

## Requisitos de hardware

- VRAM: 12,62 GiB de pesos, más la caché de atención y el estado del motor; encaja en una GPU de 16 GB.
- GPU compatibles: exclusivamente NVIDIA Blackwell. Una RTX 5060 Ti o RTX 5070 Ti de 16 GB; también dos RTX 5060 Ti para contexto completo. Sin soporte para AMD.
- GPU de gama alta (A100, H100): no se mencionan en la información disponible; el fichero está pensado para Blackwell consumer.
- Despliegue: únicamente el motor Starlight. No es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Contexto: 262.144 tokens con dos tarjetas; con una sola tarjeta, el arranque práctico ronda los 141.000–179.200 tokens según el modo, con desbordamiento de caché a RAM del sistema para alcanzar el máximo.
- Latencia y throughput: 18,4 tok/s sin especulación, 70,3 tok/s con MTP y 114,0 tok/s con DFlash2 en una RTX 5060 Ti; hasta 176,9 tok/s con dos tarjetas y DFlash2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| feverdoingwork/Qwen3.8-27B-NVFP4-mini-abliterated-Starlight | 27B densos | 262.144 | `.starlight` | Apache-2.0 | Blackwell 16 GB |
| feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight | 27B densos | 262.144 | `.starlight` | Apache-2.0 | Blackwell 16 GB |
| nvidia/Qwen3.8-27B-NVFP4 | 27B densos | No disponible | NVFP4 (Model Optimizer) | No disponible | NVIDIA |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B densos | No disponible | Safetensors | No disponible | GPU con VRAM suficiente |

La diferencia frente al fichero NVFP4-mini-Starlight es únicamente la eliminación de la dirección de rechazo en 70 matrices; tamaño, velocidad y límites son idénticos. Frente a la cuantización NVFP4 de NVIDIA, este fichero añade la recuantización de gate/up a 3 bits y el empaquetado para Starlight. Frente al checkpoint abliterado de huihui-ai, añade la cuantización NVFP4 y el formato propietario.

## Limitaciones y advertencias

- El fichero no se ha arrancado todavía en el motor Starlight sobre una GPU según la propia model card; las cifras de velocidad y ventana proceden del fichero NVFP4-mini sin abliterar.
- Formato propietario: solo funciona con Starlight. Cualquier otro motor (llama.cpp, Ollama, LM Studio, vLLM) no está soportado ni probado.
- Sin filtro de contenido: el modelo no avisa, no rechaza ni modera. El usuario es responsable de las peticiones y del uso de las respuestas, y debe cumplir la ley y la licencia del modelo base.
- No debe ofrecerse a personas que no hayan elegido explícitamente un modelo sin filtros; conviene añadir salvaguardas propias en producción.
- Los sesgos, errores y problemas de fiabilidad factual del modelo base siguen presentes; eliminar los rechazos no mejora la corrección de las respuestas.
- Idiomas soportados no documentados en la información disponible.
- Sin resultados de benchmarks de calidad publicados; no hay evidencia medida sobre la degradación introducida por la cuantización a 3 bits en gate/up.
- El modo DFlash2 requiere un fichero drafter externo que no forma parte del repositorio.
- El contexto completo de 262.144 tokens con una sola tarjeta depende del desbordamiento de caché a RAM del sistema, con la penalización de velocidad correspondiente.
- Sin soporte para GPU AMD ni para tarjetas NVIDIA anteriores a Blackwell.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-27B-NVFP4-mini-abliterated-Starlight
- Fichero NVFP4-mini sin abliterar: https://huggingface.co/feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterado de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Cuantización NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- BetterBench v0.6.1: https://github.com/GGZ14/BetterBench
