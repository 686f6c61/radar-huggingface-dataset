# jeffpeng3/ps4-tse

## Resumen

PS4-tse es una conversión a formato safetensors del checkpoint PS4 de extracción de hablante objetivo (target speaker extraction, TSE). El modelo original lo desarrolla el usuario TaurenMountain y este repositorio lo publica jeffpeng3 como conversión compatible con Rust/Candle, pensada para su uso desde el repositorio UltimateTranscript. Resuelve el problema de aislar la voz de un hablante concreto dentro de una mezcla de audio multihablante, usando una referencia de voz (embedding de hablante) como pista.

Técnicamente es un separador BSRNN (Band-Split RNN) combinado con un codificador de hablante ECAPA-TDNN conjunto. Opera a 16 kHz y tiene 27.654.874 parámetros, un tamaño contenido que lo hace apto para inferencia en CPU y en GPU de gama media. El checkpoint incluye los buffers del banco de filtros mel de torchaudio y de ventana que usa el código de inferencia original.

Es relevante porque el ecosistema de TSE en código abierto es escaso y este repositorio ofrece una ruta de despliegue fuera de PyTorch (safetensors + Candle), con licencia Apache-2.0 heredada de los pesos originales y entrenamiento sobre REAL-PS4, un agregado de AISHELL-4, AliMeeting, AMI y CHiME-6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRNN (Band-Split RNN) con codificador de hablante ECAPA-TDNN conjunto |
| Parametros totales | 27.654.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera por ventanas de audio a 16 kHz) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision original) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ps4.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un separador BSRNN: divide el espectrograma en bandas de frecuencia y procesa cada banda con capas recurrentes para estimar la máscara del hablante objetivo. La pista de hablante la aporta un codificador ECAPA-TDNN integrado en el mismo grafo, de modo que la extracción se condiciona con un embedding de referencia del hablante a aislar. Trabaja a una frecuencia de muestreo de 16 kHz y el checkpoint incorpora los buffers del banco de filtros mel y de ventana de torchaudio necesarios para la inferencia original.

El entrenamiento se realizó sobre REAL-PS4, un corpus que agrega AISHELL-4, AliMeeting, AMI y CHiME-6, lo que aporta reuniones reales en chino e inglés con solapamiento de habla y ruido de sala. La model card de esta conversión no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales; esos datos deben consultarse en la model card original. La conversión a safetensors descarta el estado del optimizador y elimina los buffers `num_batches_tracked`, sin cambios en los pesos útiles para inferencia.

## Capacidades

- Extracción de hablante objetivo: aísla la voz de un hablante concreto a partir de una mezcla de audio y una referencia de voz.
- Procesamiento de audio a 16 kHz mono, con bancos mel y ventanas incluidos en el checkpoint.
- Codificación de hablante integrada (ECAPA-TDNN) para condicionar la separación.
- Soporte de escenarios de reunión con solapamiento de habla, al haber sido entrenado sobre AISHELL-4, AliMeeting, AMI y CHiME-6.
- Idiomas de entrenamiento: chino e inglés.
- No dispone de generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio.

## Casos de uso

- Transcripción de reuniones con diarización asistida: usar el modelo para separar la pista de cada participante antes de pasarla a un ASR, mejorando la precisión en tramos con solapamiento de habla.
- Limpieza de grabaciones de atención al cliente: aislar la voz del agente o del cliente en llamadas grabadas con ruido de fondo y otros hablantes.
- Preprocesado para pipelines de ASR en producción: el modelo actúa como etapa previa de separación condicionada por hablante, reduciendo la confusión entre interlocutores antes de la transcripción.
- Reuniones remotas (Zoom, Teams, Meet): extraer la voz de un participante concreto a partir de un clip de referencia de unos segundos.
- Investigación en separación de habla: servir de baseline reproducible en formato safetensors para experimentos con Candle y Rust.
- Archivado y búsqueda de audio: aislar la voz de una persona concreta en un archivo largo para indexar o revisar sus intervenciones.
- Evaluación de sistemas de verificación de hablante: generar pistas limpias por hablante para medir el impacto de la separación en tareas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,65 M de parámetros, el peso en fp32 ocupa aproximadamente 110 MB; la VRAM real depende del tamaño de las ventanas de audio y del framework. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño como para que la GPU no sea el cuello de botella.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para audio de duración moderada.
- Opciones de despliegue: el repositorio está pensado para Rust/Candle (UltimateTranscript); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de audio de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| PS4-tse (este) | 27,65 M | Audio 16 kHz, TSE condicionado por hablante | Apache-2.0 | Safetensors en HF |
| PS4 original (TaurenMountain) | 27,65 M (mismos pesos) | Audio 16 kHz, TSE | Apache-2.0 | Checkpoint PyTorch en HF |
| Alternativas TSE de código abierto | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de extracción de hablante, no un modelo de lenguaje: no genera texto ni responde a instrucciones.
- Solo se distribuyen pesos en safetensors sin cuantizaciones publicadas; no hay versiones GGUF ni ONNX en el repositorio.
- El rendimiento está acotado a los dominios de entrenamiento (reuniones en chino e inglés de AISHELL-4, AliMeeting, AMI y CHiME-6); en otros idiomas o condiciones acústicas puede degradarse.
- Requiere una referencia de voz del hablante objetivo; la calidad de esa referencia condiciona directamente el resultado.
- Riesgo de artefactos y de filtración de otras voces en mezclas muy solapadas o con ruido extremo.
- No se documentan sesgos específicos más allá de los inherentes a los corpus de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de los pesos originales; conviene verificar las condiciones de los corpus de entrenamiento si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento de la conversión.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/jeffpeng3/ps4-tse
- Modelo original: https://huggingface.co/TaurenMountain/PS4
- Código original: https://github.com/TaurenMountain/PS4
- Paper: https://arxiv.org/abs/2607.08111
