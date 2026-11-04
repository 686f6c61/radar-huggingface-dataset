# DakeraAI/whisper-base.en

## Resumen

`DakeraAI/whisper-base.en` no es un modelo nuevo, sino un espejo verificado por checksum de los ficheros ONNX de `openai/whisper-base.en`, el modelo de reconocimiento automatico del habla (ASR) publicado originalmente por OpenAI. El repositorio lo mantiene Dakera, empresa que desarrolla un motor de memoria autoalojado para agentes de IA, y su funcion es servir como fuente primaria de descarga para el pipeline de transcripcion de audio de su producto. El modelo original es un transformer encoder-decoder de tipo Whisper, entrenado por OpenAI para transcripcion y traduccion de voz.

El modelo base es `whisper-base.en`, la variante de 74 millones de parametros especializada exclusivamente en ingles, no multilingue. Whisper se entrena sobre pares audio-texto a gran escala y esta disenado para transcripcion robusta en condiciones acusticas variadas. En este repositorio los pesos se distribuyen exclusivamente en formato ONNX (encoder y decoder separados), lo que facilita su ejecucion con ONNX Runtime y su integracion en aplicaciones que no quieren depender de PyTorch.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de espejo de modelos con verificacion criptografica para despliegues autoalojados; por otro, sirve como referencia de las capacidades y limitaciones de Whisper base en ingles cuando se consume en formato ONNX. No aporta mejoras tecnicas sobre el original y no incluye datos de rendimiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 74 millones (whisper-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (limite arquitectonico de Whisper) |
| Tipos de cuantizacion | no disponible en este repositorio (solo se distribuyen ficheros ONNX sin cuantizar) |
| Idiomas soportados | ingles unicamente (variante `.en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con atencion completa, que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El encoder transforma el audio en representaciones latentes y el decoder produce la transcripcion condicionada a esas representaciones. La variante `.en` se entrena solo con datos en ingles y prescinde del token de idioma, lo que simplifica la inferencia pero elimina cualquier capacidad multilingue.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o fine-tuning supervisado) corresponden al modelo original de OpenAI y no se reproducen en este repositorio. La model card de Dakera no aporta informacion adicional sobre el proceso de entrenamiento; solo documenta que los ficheros se copian byte a byte desde `onnx-community/whisper-base.en` y se verifican con SHA-256. No hay innovaciones tecnicas propias: es un espejo de inferencia, no un modelo reentrenado.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de hasta 30 segundos por segmento.
- Transcripcion de audio con marcas de tiempo a nivel de segmento (funcionalidad estandar de Whisper).
- Ejecucion via ONNX Runtime, sin dependencia de PyTorch en produccion.
- Integracion como paso de transcripcion en pipelines de memoria de agentes (caso de uso declarado por Dakera).
- No soporta traduccion a otros idiomas (la variante `.en` esta limitada al ingles).
- No incluye tool calling, function calling ni capacidades de agente propias; es un modelo ASR puro.
- No soporta vision, audio generativo ni modos de razonamiento extendido.

## Casos de uso

- Transcripcion de adjuntos de audio en un motor de memoria para agentes: Dakera usa este modelo para convertir notas de voz y ficheros de audio en memorias buscables, tal como declara en su model card (`DAKERA_ATTACHMENTS=true`).
- Subtitulado automatico de contenido en ingles: el modelo genera transcripciones con marcas de tiempo que se pueden volcar a formatos SRT/VTT en pipelines de video.
- Indexacion de reuniones y llamadas: transcripcion de grabaciones cortas por segmentos de 30 segundos para alimentar buscadores internos o sistemas RAG.
- Asistentes de voz autoalojados: al ejecutarse en ONNX Runtime, se puede desplegar en entornos sin GPU y sin dependencias de frameworks pesados.
- Procesamiento por lotes de audio en servidores modestos: con 74 millones de parametros, el coste computacional es bajo y permite procesar colas de audio en CPU.
- Base para fine-tuning o para prototipado rapido de ASR en ingles antes de migrar a variantes mayores (`small`, `medium`, `large`) si la precision no es suficiente.
- Verificacion de integridad en despliegues regulados: el uso de checksums SHA-256 permite auditar que los pesos desplegados coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Dakera no incluye metricas de WER, latencia ni throughput, y remite a la model card original de OpenAI para cualquier dato de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los ficheros ONNX distribuidos (encoder de 82 MB y decoder de 208 MB).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo y tambien en CPU: al ser un modelo de 74 millones de parametros, la inferencia en CPU es viable para audio de duracion moderada.
- Opciones de despliegue: ONNX Runtime (nativo para estos ficheros), `optimum` de Hugging Face para pipelines ONNX, y despliegues propios de Dakera via Docker (`ghcr.io/dakera-ai/dakera:latest`). No se distribuyen pesos GGUF en este repositorio, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| `DakeraAI/whisper-base.en` (espejo) | 74 M | Ingles | 30 s por ventana | Apache-2.0 | ONNX |
| `openai/whisper-base.en` (original) | 74 M | Ingles | 30 s por ventana | Apache-2.0 | PyTorch (safetensors/bin) |
| `openai/whisper-small.en` | 244 M | Ingles | 30 s por ventana | Apache-2.0 | PyTorch |
| `openai/whisper-base` (multilingue) | 74 M | Multilingue | 30 s por ventana | Apache-2.0 | PyTorch |

La diferencia practica frente al original de OpenAI es el formato: este repositorio ofrece ONNX listo para ONNX Runtime, mientras que el original se distribuye en formato PyTorch. Frente a `whisper-small.en`, este modelo es mas ligero pero con menor precision esperada; frente a `whisper-base` multilingue, sacrifica cobertura de idiomas a cambio de un comportamiento mas especializado en ingles.

## Limitaciones y advertencias

- Solo transcribe ingles; no traduce ni reconoce otros idiomas.
- Ventana de audio limitada a 30 segundos por segmento, con posible perdida de contexto en grabaciones largas si no se segmentan correctamente.
- Riesgo de alucinacion en audio con ruido, silencios prolongados o habla solapada, comportamiento documentado en la familia Whisper.
- Sesgos acusticos y lexicos heredados del dataset de entrenamiento original de OpenAI, no auditados en este espejo.
- No es un modelo nuevo ni reentrenado: cualquier limitacion del original aplica sin cambios.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de OpenAI para condiciones adicionales de atribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion fuera de Dakera.
- No se distribuyen pesos cuantizados ni GGUF; quien necesite esos formatos debera convertirlos o acudir a otros repositorios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DakeraAI/whisper-base.en
- Modelo original: https://huggingface.co/openai/whisper-base.en
- Repositorio ONNX de origen: https://huggingface.co/onnx-community/whisper-base.en
- Web de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue Docker: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
