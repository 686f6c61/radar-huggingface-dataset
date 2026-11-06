# DakeraAI/whisper-base

## Resumen

`DakeraAI/whisper-base` es un espejo verificado del modelo `openai/whisper-base`, publicado por Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un ajuste fino: los ficheros se copian byte a byte desde `onnx-community/whisper-base` y se validan mediante hashes SHA-256, de modo que el repositorio actúa como una fuente redundante para instalaciones autoalojadas.

El modelo subyacente es Whisper Base de OpenAI, un sistema de reconocimiento automático del habla (ASR) basado en una arquitectura transformer encoder-decoder con aproximadamente 74 millones de parametros. En este repositorio los pesos se distribuyen en formato ONNX, lo que facilita su ejecucion en entornos sin GPU mediante ONNX Runtime y su integracion dentro de pipelines de agentes.

Su relevancia es acotada y de caracter operativo: no aporta mejoras de rendimiento respecto al original, sino que garantiza disponibilidad y verificabilidad de los artefactos dentro del ecosistema Dakera. Se usa por defecto para transcribir adjuntos de audio en memorias buscables cuando se activa `DAKERA_ATTACHMENTS=true` y `DAKERA_WHISPER_MODEL=whisper-base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parametros totales | ~74 millones (modelo base de Whisper) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por segmento en Whisper; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Whisper Base original de OpenAI: un transformer encoder-decoder entrenado para transcripcion de voz a texto sobre espectrogramas Mel. El repositorio no incluye informacion sobre el proceso de entrenamiento, el volumen de datos, la composicion del corpus ni si hubo etapas de RLHF o ajuste supervisado; esos detalles deben consultarse en la model card original de `openai/whisper-base`.

La unica innovacion tecnica atribuible a este repositorio es la de empaquetado y distribucion: los artefactos ONNX se copian desde `onnx-community/whisper-base` y se publican con hashes SHA-256 verificables (`decoder_model.onnx`: `70d26763610c0d6bb407373b7f30d415252ee470e62a0f816c8a46b2caca7326`, 208.289.724 bytes; `encoder_model.onnx`: `a9f3b752833b49e880dec91ee5b6d936112be7c3ea07c221024ba493439f46fe`, 82.468.078 bytes; `tokenizer.json`: `27fc476bfe7f17299480be2273fc0608e4d5a99aba2ab5dec5374b4482d1a566`, 2.480.466 bytes). Dakera consulta primero este repositorio y recurre al original si no esta disponible, validando ambos contra el mismo SHA-256.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre audio en formato aceptado por Whisper.
- Transcripcion de adjuntos de audio para convertirlos en memorias buscables dentro de Dakera.
- Ejecucion en formato ONNX, apta para ONNX Runtime y despliegues sin dependencia de PyTorch.
- Integracion con el motor de memoria de Dakera: recuperacion hibrida vectorial y de texto completo, reranking, extraccion de entidades y decaimiento de importancia.
- Exposicion mediante servidor MCP para agentes como Claude o Cursor.
- Soporte multilingue: no confirmado en la informacion disponible (Whisper base original soporta multiples idiomas, pero el repositorio no lo detalla).
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en agentes conversacionales: el modelo convierte adjuntos de audio en texto que Dakera indexa como memoria a largo plazo, de modo que el agente puede recuperar el contenido en sesiones posteriores.
- Busqueda semantica sobre reuniones grabadas: al transcribir el audio y almacenarlo como memoria, se habilita recuperacion hibrida (vectorial y texto completo) sobre el contenido hablado.
- Asistentes personales autoalojados: integrado en el binario Rust de Dakera, permite procesar audio sin enviar datos a servicios externos, lo que encaja en despliegues con requisitos de privacidad.
- Pipelines de documentacion interna: transcripcion de entrevistas o sesiones de formacion para alimentar una base de conocimiento consultable por agentes via MCP.
- Entornos con hardware limitado: al distribuirse en ONNX y con ~74 M de parametros, puede ejecutarse en CPU en servidores modestos o en contenedores sin GPU.
- Despliegue reproducible en CI/CD: los hashes SHA-256 publicados permiten verificar la integridad de los artefactos en pipelines de build y en imagenes Docker de Dakera, que ya incluyen los modelos por defecto.
- Fallback de alta disponibilidad: Dakera consulta este espejo y, si no esta accesible, recurre al repositorio original, reduciendo el riesgo de fallos de instalacion por dependencia de una unica fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo (~74 M de parametros, ~0,3 GB de repo), es previsible que quepa en GPU consumer, aunque no se confirma con datos del repositorio.
- GPU recomendadas: no disponibles.
- Cabe en GPU consumer: probablemente si, dado el tamano, pero no confirmado en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); integracion con el binario Rust de Dakera y su imagen Docker (`ghcr.io/dakera-ai/dakera:latest`); servidor MCP de Dakera. Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/whisper-base | ~74 M | no disponible | ONNX | Apache-2.0 | Hugging Face (espejo verificado) |
| openai/whisper-base | ~74 M | no disponible | PyTorch | Apache-2.0 | Hugging Face (original) |
| onnx-community/whisper-base | ~74 M | no disponible | ONNX | Apache-2.0 | Hugging Face (fuente de los ficheros) |

Los tres modelos comparten arquitectura y pesos; las diferencias son de empaquetado, formato y proposito de distribucion. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: replica `openai/whisper-base` sin modificaciones, por lo que hereda todas sus limitaciones de precision, sesgos y cobertura idiomatica.
- Riesgo de alucinacion en transcripciones: Whisper puede generar texto plausible en segmentos con ruido o silencio; conviene validar en produccion.
- Cobertura de idiomas no documentada en este repositorio; debe consultarse la model card original.
- No se especifican limitaciones de longitud de audio ni requisitos de muestreo en la informacion disponible.
- Licencia Apache-2.0, permisiva para uso comercial, pero se recomienda revisar el fichero `LICENSE` y la model card original para obligaciones de atribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: baja adopcion verificable, lo que reduce la evidencia empirica de su uso en produccion fuera del ecosistema Dakera.
- Dependencia del ecosistema Dakera para el caso de uso principal; fuera de el, su valor es el de un espejo ONNX generico de Whisper Base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DakeraAI/whisper-base
- Modelo original: https://huggingface.co/openai/whisper-base
- Fuente de los ficheros ONNX: https://huggingface.co/onnx-community/whisper-base
- Web de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
