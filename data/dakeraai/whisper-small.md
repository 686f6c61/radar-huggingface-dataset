# DakeraAI/whisper-small

## Resumen

`DakeraAI/whisper-small` es un espejo verificado de los ficheros ONNX del modelo `openai/whisper-small`, publicado por Dakera, una empresa que desarrolla un motor de memoria a largo plazo autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte a byte de los artefactos de `onnx-community/whisper-small`, verificada mediante SHA-256, que Dakera utiliza internamente para transcribir adjuntos de audio en memorias consultables dentro de su producto.

El modelo subyacente es Whisper small de OpenAI, un sistema de reconocimiento automático del habla (ASR) basado en una arquitectura transformer encoder-decoder entrenada con supervisión débil sobre grandes volúmenes de audio y texto emparejados. Con aproximadamente 244 millones de parámetros, se sitúa en el punto medio de la familia Whisper (tiny, base, small, medium, large) y ofrece un equilibrio razonable entre precisión de transcripción y coste computacional.

La relevancia de esta ficha es acotada: el repositorio no aporta mejoras técnicas sobre el original y su interés principal es operativo, ya que documenta cómo Dakera distribuye y verifica sus dependencias de ASR para despliegues autoalojados. Para cualquier uso de transcripción conviene remitirse al modelo original de OpenAI o a la conversión oficial de `onnx-community`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | aproximadamente 244 millones (whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper) |
| Tipos de cuantizacion | no disponible en este repositorio (solo se distribuyen pesos ONNX en fp32; el modelo original admite cuantizacion dinamica e int8) |
| Idiomas soportados | no disponibles en la model card de este repositorio; Whisper small original soporta transcripcion y traduccion multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

Este repositorio no incluye información sobre arquitectura ni entrenamiento más allá de la referencia al modelo base. El modelo subyacente, `openai/whisper-small`, es un transformer encoder-decoder de tipo seq2seq que procesa espectrogramas mel de audio de 30 segundos y genera tokens de texto de forma autorregresiva. El encoder transforma la representación acústica y el decoder produce la transcripción condicionada por tokens de tarea e idioma.

Los detalles concretos de entrenamiento (número de horas de audio, composición del dataset, uso de supervisión débil, técnicas de aumento de datos o fine-tuning) no se documentan en esta model card y deben consultarse en el paper original de Whisper y en la model card de OpenAI. Este espejo no aplica ningún ajuste adicional: los pesos son idénticos a los de `onnx-community/whisper-small`, tal y como confirman los hashes SHA-256 listados por el autor.

## Capacidades

- Reconocimiento automático del habla (ASR) en formato ONNX, ejecutable con ONNX Runtime.
- Transcripción de audio de hasta 30 segundos por segmento, con posibilidad de concatenar segmentos para audio más largo.
- Capacidades multilingües heredadas de Whisper small (transcripción y traducción al inglés), aunque este repositorio no detalla la lista de idiomas.
- Integración con el motor de memoria de Dakera: los adjuntos de audio se convierten en memorias indexables y recuperables.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No incluye modo thinking, visión ni audio generativo: es exclusivamente un modelo de entrada de audio y salida de texto.

## Casos de uso

- Transcripción de notas de voz en aplicaciones de productividad: el modelo convierte grabaciones cortas en texto indexable, adecuado por su tamaño contenido y su licencia permisiva.
- Memoria a largo plazo para agentes: dentro de Dakera, los audios adjuntos se transcriben y se almacenan como memorias recuperables mediante búsqueda vectorial y de texto completo, de modo que un agente puede recordar conversaciones habladas en sesiones posteriores.
- Subtitulado automático de reuniones y webinars: la ventana de 30 segundos por segmento permite procesar grabaciones largas concatenando segmentos con marcas temporales.
- Pipelines de accesibilidad: generación de transcripciones para contenido audiovisual en entornos autoalojados donde no se desea enviar audio a servicios en la nube.
- Procesamiento por lotes de archivos de audio en servidores propios: al distribuirse en ONNX, se puede ejecutar con ONNX Runtime en CPU o GPU sin depender del stack de PyTorch.
- Base para experimentación con ASR en entornos con requisitos de reproducibilidad: los hashes SHA-256 publicados permiten verificar la integridad de los pesos antes de desplegarlos.
- Transcripción previa a la indexación en sistemas RAG: el texto generado se puede trocear y vectorizar para alimentar un índice de recuperación junto con documentos y notas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas de WER, comparativas ni evaluaciones propias; cualquier dato de rendimiento debe consultarse en el paper de Whisper o en la model card de `openai/whisper-small`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (el encoder ocupa unos 353 MB y el decoder unos 615 MB), más memoria para activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A10, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no aprovecha al máximo GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 4 GB o más de VRAM; también puede ejecutarse en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (principal), integración con el contenedor Docker de Dakera, y conversiones a otros runtimes compatibles con ONNX. No se distribuyen pesos GGUF ni safetensors en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para whisper-small en GPU moderna se suele hablar de decenas de veces tiempo real, pero no hay datos verificables en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/whisper-small (este) | ~244 M | 30 s por segmento | Apache-2.0 | ONNX | Hugging Face, espejo de onnx-community |
| openai/whisper-small | ~244 M | 30 s por segmento | Apache-2.0 | PyTorch (safetensors/bin) | Hugging Face oficial |
| openai/whisper-base | ~74 M | 30 s por segmento | Apache-2.0 | PyTorch | Hugging Face oficial |
| openai/whisper-medium | ~769 M | 30 s por segmento | Apache-2.0 | PyTorch | Hugging Face oficial |

La comparación se limita a la familia Whisper porque la información disponible no permite contrastar con otros sistemas ASR (por ejemplo, wav2vec 2.0 o Conformer) sin datos de benchmarks que este repositorio no publica.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un modelo entrenado por Dakera; no debe citarse como trabajo original ni atribuirse a Dakera la autoría del modelo.
- No se han publicado métricas de calidad (WER) ni evaluaciones por idioma en esta model card.
- Whisper small tiene una precisión inferior a whisper-medium y whisper-large, especialmente en audio con ruido, acentos marcados o vocabulario técnico.
- La ventana de 30 segundos por segmento obliga a implementar lógica de segmentación y concatenación para audio largo; errores en esa lógica degradan la transcripción.
- Riesgo de alucinación en pasajes de silencio o ruido: Whisper puede generar texto plausible no presente en el audio, un comportamiento conocido de la familia.
- Sesgos heredados del corpus de entrenamiento original de OpenAI (dominio del inglés y de variedades estándar), no documentados en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card original de OpenAI para advertencias adicionales sobre usos sensibles (por ejemplo, identificación biométrica o vigilancia).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción más allá del propio producto Dakera.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DakeraAI/whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/whisper-small
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Repositorio de despliegue: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn de Dakera AI: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
