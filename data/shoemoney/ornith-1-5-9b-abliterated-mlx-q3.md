# shoemoney/Ornith-1.5-9B-Abliterated-MLX-q3

## Resumen

Ornith-1.5-9B-Abliterated-MLX-q3 es una cuantización en 3 bits del modelo Ornith-1.5-9B en su variante "abliterated" (sin censura), convertida al formato MLX para ejecutarse en hardware Apple Silicon. El autor de esta conversión es shoemoney, que parte del trabajo de huihui-ai (que aplicó la técnica de abliteration sobre el modelo original) y del modelo base desarrollado por ornith-ai. El resultado es un archivo de 5,34 GB que permite ejecutar un modelo denso de aproximadamente 9 000 millones de parámetros en Macs con memoria unificada, sin necesidad de GPUs dedicadas.

La relevancia de este modelo reside en dos aspectos: por un lado, ofrece una versión compacta y eficiente de un modelo de razonamiento y código de última generación (Ornith-1.5-9B, publicado en agosto de 2026), y por otro, al ser abliterated, elimina las restricciones de seguridad y alineación del modelo original, lo que lo hace útil para investigación y experimentación sin filtros. La cuantización a 3 bits con grupo de tamaño 64 reduce drásticamente el peso en memoria, aunque introduce una degradación medible en la perplejidad (7,518, un 1,41× peor que la mejor cuantización de la misma familia).

El modelo se distribuye bajo licencia MIT, heredada del modelo base, y se carga mediante la librería mlx-vlm, no con mlx-lm, debido a que la arquitectura está registrada en ese paquete. Está pensado para entornos de desarrollo local en Apple Silicon, no para despliegue en servidores con GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen3.5 (segun tags de HuggingFace) |
| Parametros totales | ~9 000 millones (modelo base); el archivo safetensors reporta 1 576 164 592, probablemente un conteo parcial o error |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits (q3), grupo de 64 |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de aproximadamente 9 000 millones de parametros, desarrollado por ornith-ai. Segun la documentacion oficial, Ornith-1.5 extiende el marco de "self-scaffolding" introducido en Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. Este enfoque busca construir modelos fundacionales mediante auto-mejora de extremo a extremo, sin depender exclusivamente de datos humanos etiquetados.

La version abliterated, creada por huihui-ai, elimina las capas de rechazo y las restricciones de seguridad del modelo original mediante la tecnica de abliteration, que consiste en identificar y anular los direcciones en el espacio de activaciones responsables del comportamiento de rechazo. Esto da como resultado un modelo que responde sin filtros a cualquier peticion, incluido contenido que el modelo original se negaria a generar.

La cuantizacion a 3 bits realizada por shoemoney es una conversion puramente mecanica: se tomaron los pesos BF16 del modelo abliterated y se convirtieron a 3 bits con grupo de 64 usando `mlx_vlm.convert`. No hubo fine-tuning, ni merging, ni re-alineacion posterior. El unico cambio es la reduccion de precision de los pesos.

## Capacidades

- Generacion de texto y razonamiento: el modelo base obtiene 86,4 en GPQA Diamond, lo que indica una capacidad solida para razonamiento cientifico y logico de alto nivel.
- Generacion de codigo: 70,6 en SWE-bench Verified, un benchmark de resolucion de problemas reales de GitHub, lo que lo posiciona como un modelo competitivo para tareas de ingenieria de software.
- Sin censura: al ser abliterated, no aplica filtros de contenido ni rechaza peticiones sobre temas sensibles, violencia, sexualidad, etc.
- Ejecucion en Apple Silicon: gracias a la cuantizacion MLX, puede ejecutarse en Macs con memoria unificada, sin necesidad de GPU externa.
- Soporte de tool calling y agentes: no se menciona explicitamente en la informacion disponible, pero al estar basado en Qwen3.5 (segun los tags), es probable que herede capacidades de function calling del modelo base. No obstante, no hay confirmacion.
- Multilingue: no se dispone de informacion sobre los idiomas soportados.

## Casos de uso

- Desarrollo de codigo asistido en local: un desarrollador con un MacBook Pro (por ejemplo, M3 Pro con 36 GB de RAM) puede ejecutar este modelo para autocompletar codigo, generar funciones o explicar fragmentos, sin depender de servicios en la nube. La cuantizacion de 3 bits permite cargar el modelo en memoria con solo 5,34 GB, dejando espacio para el sistema y otras aplicaciones.
- Investigacion en seguridad y alineacion: al ser abliterated, es util para estudiar como se comportan los modelos sin restricciones de seguridad, analizar sesgos latentes o probar tecnicas de red-team. Los investigadores pueden generar respuestas que el modelo original rechazaria, lo que facilita el analisis de riesgos.
- Prototipado rapido de aplicaciones de IA: gracias a su tamano reducido y a la integracion con mlx-vlm, se puede integrar en aplicaciones de escritorio o scripts de Python para experimentar con generacion de texto, resumen o extraccion de informacion, sin necesidad de infraestructura costosa.
- Educacion y formacion: estudiantes de IA pueden usar este modelo para entender el impacto de la cuantizacion en la calidad de las respuestas, comparando la perplejidad y el rendimiento con versiones de mayor precision (6 bits, 8 bits, BF16).
- Generacion de contenido creativo sin restricciones: escritores o creadores que necesiten explorar temas tabu o generar narrativas sin filtros pueden usar este modelo en local, manteniendo la privacidad de sus prompts.
- Evaluacion de modelos cuantizados: el autor publico mediciones de perplejidad y throughput, lo que permite a otros usuarios comparar el rendimiento de diferentes niveles de cuantizacion dentro de la misma familia y decidir cual usar segun sus requisitos de calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion especifica (3 bits). Los datos disponibles son:

- Perplejidad medida: 7,518 sobre `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123). Este valor es 1,41× peor que la mejor cuantizacion de la misma familia, lo que indica una degradacion notable pero no extrema.
- Throughput medido en Apple M3 Ultra (96 GB, macOS 27): 67,6 tok/s con 1 peticion concurrente y 164,4 tok/s con 8 peticiones concurrentes.

Los benchmarks del modelo base (antes de la cuantizacion) son:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70,6 |
| GPQA Diamond | 86,4 |

Estos datos provienen del modelo Ornith-1.5-9B original, no de esta version cuantizada. La cuantizacion a 3 bits probablemente degrade estos resultados, pero no se ha medido.

## Requisitos de hardware

- VRAM estimada: 5,34 GB en disco, mas overhead de ejecucion. En Apple Silicon, la memoria unificada compartida entre CPU y GPU debe ser suficiente; se recomienda al menos 16 GB de RAM total para un uso comodo.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada. El autor midio en un M3 Ultra con 96 GB, pero el modelo es lo bastante pequeno para ejecutarse en modelos inferiores.
- Compatibilidad con consumer GPU: no aplica, ya que MLX solo funciona en Apple Silicon. Para GPUs NVIDIA se necesitaria una conversion a otro formato (GGUF, GPTQ, etc.).
- Opciones de despliegue: mlx-vlm (libreria principal), tambien se puede usar con mlx-lm si se adapta, aunque el autor advierte que la arquitectura esta registrada en mlx-vlm. No hay soporte para vLLM, TGI u Ollama en este formato.
- Latencia y throughput: medidos en M3 Ultra: 67,6 tok/s (1 peticion) y 164,4 tok/s (8 concurrentes). En chips menos potentes, el rendimiento sera proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | SWE-bench | GPQA |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B (BF16) | ~9B | No disponible | MIT | BF16 | 70,6 | 86,4 |
| Ornith-1.5-9B-Abliterated-MLX-q3 (este) | ~9B (base) | No disponible | MIT | MLX 3-bit | No medido | No medido |
| Ornith-1.5-9B-MLX-6bit | ~9B | No disponible | MIT | MLX 6-bit | No medido | No medido |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | Varios | ~40 (aprox.) | ~65 (aprox.) |

Los datos de Qwen2.5 son aproximados y no se han verificado en la informacion proporcionada. La comparacion directa con otros modelos de 9B no esta disponible en las fuentes consultadas.

## Limitaciones y advertencias

- Degradacion por cuantizacion: la precision de 3 bits introduce una perdida de calidad notable (perplejidad 1,41× peor que la mejor cuantizacion de la familia). Para tareas que requieran alta fidelidad, se recomienda usar cuantizaciones de 6 u 8 bits.
- Contenido sin filtrar: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones orientadas al publico general sin un sistema de moderacion externo.
- Sin garantias de produccion: el autor no ha realizado fine-tuning ni evaluaciones exhaustivas de esta cuantizacion. Los benchmarks del modelo base no se han replicado en esta version, por lo que el rendimiento real en tareas especificas es incierto.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Si el modelo base tiene una ventana limitada, la cuantizacion no la amplia.
- Idiomas: no se ha documentado que idiomas soporta. Es probable que herede las capacidades multilingues de Qwen3.5, pero no hay confirmacion.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo base puede tener atribuciones adicionales (ornith-ai, huihui-ai) que deben respetarse.
- Dependencia de Apple Silicon: el formato MLX solo funciona en hardware Apple. No es portable a entornos Linux con GPUs NVIDIA sin una conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-q3
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo original Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Version MLX 6-bit del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web de Ornith AI: https://ornith.ai/
- Ficha en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
