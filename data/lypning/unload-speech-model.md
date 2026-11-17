# Lypning/unload-speech-model

## Resumen

Unload speech model es un paquete de pesos cuantizados publicado por el usuario Lypning para Unload Studio, una aplicación móvil de subtitulado que ejecuta el reconocimiento de voz en el propio dispositivo. El repositorio no contiene un modelo nuevo: empaqueta dos checkpoints oficiales del equipo Qwen (Alibaba Cloud), Qwen3-ASR-1.7B como reconocedor y Qwen3-ForcedAligner-0.6B como alineador forzado, convertidos a cuantización afín de MLX (grupos de 64) para su ejecución en hardware Apple.

La relevancia es práctica: ofrece una vía lista para usar de transcripción y alineación temporal sobre MLX, con el reconocedor a 8 bits por peso y el alineador a 4 bits, además de un `manifest.json` con tamaños y hashes SHA-256 que la aplicación verifica antes de cargar cada fichero. El repositorio ocupa 2,7 GB y se distribuye bajo licencia Apache 2.0.

No es una release oficial de Qwen y no aporta datos propios de entrenamiento, benchmarks ni evaluación: la información disponible se limita al empaquetado, la cuantización y la estructura de ficheros. Cualquier cifra de calidad debe buscarse en las model cards de los checkpoints base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Qwen3-ASR-1.7B y Qwen3-ForcedAligner-0.6B; el repositorio solo documenta la cuantización) |
| Parametros totales | 1,7 B (reconocedor) + 0,6 B (alineador) |
| Parametros activos | No aplica (no se indica que los modelos base sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afín de MLX (`nn.quantize`, grupos de 64): 8 bits por peso en `asr/`, 4 bits por peso en `aligner/` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos MLX cuantizados, organizados en `asr/`, `aligner/` y `manifest.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Parte de los checkpoints publicados por el equipo Qwen, Qwen3-ASR-1.7B (reconocimiento automático de voz) y Qwen3-ForcedAligner-0.6B (alineación forzada, es decir, asignación de marcas temporales a transcripciones existentes), y aplica únicamente cuantización afín de MLX con grupos de 64, el mismo procedimiento que emplea la aplicación de escritorio de Unload Studio. La model card afirma explícitamente que no se ha modificado nada más.

La arquitectura interna de ambos modelos base, la composición del dataset de entrenamiento, el número de tokens vistos y si hubo etapas de ajuste fino con RLHF o DPO no se detallan en la información disponible. Tampoco se documentan innovaciones técnicas propias de este paquete más allá de la cuantización y del mecanismo de verificación de integridad mediante `manifest.json`.

## Capacidades

- Reconocimiento automático de voz (pipeline `automatic-speech-recognition`) mediante el componente `asr/` a 8 bits.
- Alineación forzada de transcripciones con marcas temporales mediante `aligner/` a 4 bits, útil para subtítulos sincronizados.
- Ejecución local en dispositivo con MLX, sin envío de audio a servidores externos según la descripción del autor.
- Verificación de integridad de cada fichero descargado contra el SHA-256 del `manifest.json`.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling, function calling, modo thinking, visión y audio generativo: no disponibles en la información proporcionada.

## Casos de uso

- Subtitulado en directo desde el móvil: la combinación de reconocedor y alineador permite generar transcripciones con marcas temporales por segmento sin salir del dispositivo, lo que encaja con el escenario de privacidad que describe el autor.
- Generación de subtítulos para vídeo grabado: se transcribe la pista de audio con `asr/` y se alinean los textos resultantes con `aligner/` para obtener ficheros SRT o VTT sincronizados.
- Aplicaciones de notas de voz: transcripción de reuniones o dictados en local, con el alineador aportando timestamps para navegar por la grabación.
- Distribución de modelos en apps móviles: el `manifest.json` con tamaños y SHA-256 facilita descargas reanudables y verificación de integridad en el cliente, un patrón reutilizable en cualquier aplicación que empaquete pesos MLX.
- Prototipado e investigación en ASR sobre Apple Silicon: los pesos cuantizados permiten experimentar con Qwen3-ASR y Qwen3-ForcedAligner en equipos con memoria unificada limitada, comparando 8 bits frente a 4 bits.
- Evaluación de cuantización: al publicar dos niveles de precisión distintos para tareas relacionadas, sirve para medir la degradación de calidad del reconocimiento y de la alineación en entornos MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio completo ocupa 2,7 GB; el reconocedor a 8 bits ronda 1,7 GB de pesos y el alineador a 4 bits alrededor de 0,3 GB, a lo que hay que sumar la memoria de activaciones y del runtime MLX (no cuantificada en la información disponible).
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple (series M1, M2, M3, M4 y posteriores) con memoria unificada.
- Compatibilidad con GPU de consumo NVIDIA: no disponible; MLX no es el runtime habitual en esas plataformas.
- Cabe en equipos Apple con 8 GB de memoria unificada en principio, dado el tamaño del repositorio, aunque el margen para activaciones y otros procesos es reducido.
- Opciones de despliegue: MLX y las herramientas del ecosistema Apple (por ejemplo, mlx-audio si soporta estos checkpoints); vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lypning/unload-speech-model | 1,7 B (ASR) + 0,6 B (alineador) | No disponible | Apache 2.0 | MLX cuantizado (8 y 4 bits) | Empaquetado para app móvil, con manifest de integridad |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | No disponible | No disponible en la información proporcionada | Checkpoint original | Modelo base del reconocedor |
| Qwen/Qwen3-ForcedAligner-0.6B | 0,6 B | No disponible | No disponible en la información proporcionada | Checkpoint original | Modelo base del alineador |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Qwen; el autor lo indica de forma explícita. Cualquier incidencia debe atribuirse al empaquetado, no al equipo Qwen.
- Solo se documenta la cuantización; no hay evaluación de la pérdida de calidad frente a los checkpoints originales en 8 o 4 bits.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Los idiomas soportados no están documentados en esta ficha; deben consultarse en las model cards de los modelos base.
- No hay información sobre sesgos, tasas de alucinación en transcripción ni comportamiento ante audio ruidoso.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar `NOTICE.md` y las condiciones de los checkpoints base antes de redistribuir.
- El formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors estándar en este repositorio.
- La fecha de creación indicada (2026-11-17) debe tratarse con cautela por posible inconsistencia en los metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lypning/unload-speech-model
- Modelo base del reconocedor: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base del alineador: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
