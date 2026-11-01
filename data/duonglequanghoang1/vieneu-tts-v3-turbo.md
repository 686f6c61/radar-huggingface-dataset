# duonglequanghoang1/VieNeu-TTS-v3-Turbo

## Resumen

VieNeu-TTS v3 Turbo es un modelo de sintesis de voz (text-to-speech) disenado especificamente para vietnamita e ingles, desarrollado por Pham Nguyen Ngoc Bao (publicado en HuggingFace bajo la cuenta `duonglequanghoang1`). Se trata de un diseno de arquitectura original, entrenado desde cero sobre aproximadamente 10.000 horas de audio bilingue ingles-vietnamita, y no es un fine-tune ni una destilacion de otro modelo TTS. Su propuesta de valor principal es ofrecer sintesis de alta fidelidad a 48 kHz con clonacion de voz instantanea, control de emociones y cambio de codigo (code-switching) entre ingles y vietnamita en una misma locucion.

El modelo tiene 130.907.520 parametros y un repositorio de 2,1 GB. Se distribuye con pesos en safetensors, ONNX y GGUF, y su implementacion de referencia es el SDK de Python `vieneu` (v3.7.1), que en CPU funciona sin PyTorch (solo ONNX Runtime) y en GPU CUDA conmuta automaticamente al motor PyTorch con batching continuo. Esto lo hace relevante para despliegues de bajo coste y para servicios de streaming en tiempo real.

Incluye 23 voces predefinidas de las tres regiones de Vietnam (norte, centro y sur), una API compatible con OpenAI (`POST /v1/audio/speech`) y soporte de streaming con multiples flujos concurrentes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal original del autor; backbone tipo Qwen3 (segun dependencia `transformers`) con codec de audio neural MOSS-Audio-Tokenizer-Nano a 48 kHz |
| Parametros totales | 130.907.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (por defecto), int8 (solo CPU, requiere VNNI); pesos en ONNX, safetensors y GGUF |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un diseno original del autor, entrenado desde cero sobre unas 10.000 horas de habla bilingue ingles-vietnamita (dataset `pnnbao-ump/VieNeu-TTS-10k-ENVI`). El sistema combina un backbone de modelado de tokens (la dependencia fijada es `transformers==4.57.6`, que corresponde a la familia Qwen3) con el codec de audio neural MOSS-Audio-Tokenizer-Nano de OpenMOSS-Team, que opera a 48 kHz. Para la conversion grafema-fonema utiliza `sea-g2p`, un fonemizador rapido vietnamita/ingles tambien del mismo autor.

El entrenamiento se realizo desde cero (no es fine-tune, destilacion ni adaptacion de otro TTS). El modelo soporta ajuste fino mediante LoRA en una sola GPU de consumo. En el plano de inferencia, el SDK implementa dos rutas: en CPU, un motor ONNX Runtime sin PyTorch (con opcion int8 que duplica la velocidad en CPUs con VNNI); en GPU CUDA, un motor PyTorch con batching automatico y un planificador de streaming con batching continuo sobre un unico grafo CUDA compartido entre llamadas. Tambien incorpora penalizacion de repeticion por ventana deslizante.

## Capacidades

- Sintesis de voz de alta fidelidad a 48 kHz.
- 23 voces predefinidas de Vietnam (norte, centro y sur), ambos generos y varios estilos de lectura; voz por defecto `Minh Quan`.
- Clonacion de voz instantanea, incluida en CPU sin PyTorch (desde la version 3.3 del SDK).
- Cambio de codigo (code-switching) ingles-vietnamita dentro de una misma locucion.
- Control de emociones mediante indicaciones inline (por ejemplo, `[cuoi]` para risa).
- Streaming en tiempo real con API compatible con OpenAI (`POST /v1/audio/speech`, formatos `pcm` y `wav`, chunked o SSE).
- Batching continuo en GPU: hasta 16 flujos concurrentes por debajo de 200 ms en una RTX 3060 (maximo 32).
- Generacion de podcasts multihablante por lotes (pestana Conversation del Web UI).
- Integracion con OpenAI SDK, Pipecat y LiveKit.
- Ajuste fino con LoRA en una GPU de consumo.

## Casos de uso

- Atencion al cliente en vietnamita e ingles: el modelo puede sintetizar respuestas en ambos idiomas y alternar entre ellos en una misma frase, lo que encaja con usuarios bilingues. La API compatible con OpenAI permite integrarlo en pipelines existentes sin cambiar el cliente.
- Generacion de audiolibros y contenido largo: el batching en GPU agrupa muchos fragmentos en un unico forward, lo que reduce el coste por hora de audio sintetizado en comparacion con la sintesis fragmento a fragmento.
- Clonacion de voz para locutores de marca: con la clonacion instantanea y las 23 voces predefinidas se puede mantener una identidad sonora consistente en campanas, sin entrenamiento adicional.
- Produccion de podcasts multihablante: la pestana Conversation del Web UI genera dialogos con varias voces y emociones inline, util para prototipado rapido de contenido editorial.
- Asistentes de voz en tiempo real: el streaming con primer audio en ~115 ms en GPU y ~140 ms en CPU con int8 permite respuestas conversacionales de baja latencia en agentes telefonicos o asistentes embebidos.
- Accesibilidad y lectura de pantalla: sintesis a 48 kHz con control de emociones para mejorar la naturalidad en aplicaciones de lectura para personas con discapacidad visual.
- Localizacion de contenido audiovisual: doblaje ingles-vietnamita con code-switching para materiales formativos o divulgativos dirigidos a audiencias mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de latencia y concurrencia del SDK:

| Metrica | Valor |
|---|---|
| Primer audio en GPU (streaming) | ~115 ms |
| Primer audio en CPU, int8 | ~140 ms |
| Primer audio en CPU, fp32 | ~300 ms |
| Flujos concurrentes en RTX 3060 | 16 por debajo de 200 ms (maximo 32) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 130,9 M de parametros, el modelo completo en fp32 ocupa aproximadamente 0,5 GB de pesos; en la practica el consumo es mayor por el codec de audio y los buffers de activacion, pero no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: RTX 3060 (referencia oficial para 16 flujos concurrentes), asi como A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, el modelo esta disenado explicitamente para una RTX 3060.
- Opciones de despliegue: SDK `vieneu` (CPU via ONNX Runtime sin PyTorch; GPU via PyTorch con CUDA >= 12.8), Web UI (`vieneu-web`), servidor con API compatible con OpenAI, y Docker (`docker compose --profile api-gpu` o `api-cpu`).
- Latencia y throughput: primer audio ~115 ms en GPU y ~140 ms (int8) / ~300 ms (fp32) en CPU; 16 flujos concurrentes por debajo de 200 ms en RTX 3060.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos TTS (por ejemplo, alternativas multilingues o especificas de vietnamita), por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Cobertura linguistica limitada a vietnamita e ingles; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion acustica y artefactos en textos largos o con caracteres no previstos; el SDK mitiga repeticiones con penalizacion por ventana deslizante, pero no elimina el problema.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; aunque la licencia es Apache 2.0, es responsabilidad del desplegador aplicar consentimiento y controles.
- El modo int8 solo esta disponible en CPU y requiere CPUs con VNNI; en otras CPUs la ganancia no esta garantizada.
- La ruta GPU depende de versiones fijadas de `torch` (2.8.0) y `transformers` (4.57.6); actualizaciones no probadas pueden romper la compatibilidad.
- No se han publicado resultados de benchmarks objetivos (MOS, WER, similitud de hablante), lo que dificulta evaluar la calidad frente a alternativas.
- El repositorio tiene un numero muy bajo de descargas (44) y ningun like en el momento de la consulta, lo que sugiere una adopcion todavia limitada y poca validacion externa.
- La cuenta del autor en HuggingFace (`duonglequanghoang1`) difiere de la cuenta referenciada en la model card (`pnnbao-ump`), lo que conviene verificar antes de fijar una dependencia en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/duonglequanghoang1/VieNeu-TTS-v3-Turbo
- Modelo referenciado en la model card: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Documentacion de streaming: https://github.com/pnnbao97/VieNeu-TTS/blob/main/docs/streaming.md
- PyPI: https://pypi.org/project/vieneu/
- Discord: https://discord.gg/yJt8kzjzWZ
- Codec de audio MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Dataset: https://huggingface.co/datasets/pnnbao-ump/VieNeu-TTS-10k-ENVI
