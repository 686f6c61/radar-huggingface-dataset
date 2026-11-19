# openbmb/MiniCPM-V-4.6-Thinking-AWQ

## Resumen

MiniCPM-V-4.6-Thinking-AWQ es la version cuantizada en 4 bits (AWQ W4A16) del modelo multimodal MiniCPM-V-4.6-Thinking, desarrollado por OpenBMB. Se trata de un modelo de vision-lenguaje (image-text-to-text) disenado para inferencia en dispositivo, es decir, para ejecutarse en telefonos moviles y hardware de bajos recursos. El modelo base combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B, sumando aproximadamente 1.300 millones de parametros totales.

La variante "Thinking" anade una cadena de razonamiento explicita antes de emitir la respuesta final, lo que mejora el rendimiento en tareas complejas de razonamiento multimodal, matematicas y OCR intensivo. La cuantizacion AWQ reduce el peso del repositorio a 1,9 GB, facilitando el despliegue en entornos con VRAM limitada y en plataformas moviles (iOS, Android y HarmonyOS, segun la model card).

Su relevancia actual reside en la combinacion de compresion de tokens visuales (4x/16x), razonamiento explicito y un peso reducido, lo que permite ejecutar comprension de imagen y video en dispositivos de consumo sin depender de infraestructura cloud. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B |
| Parametros totales | 1.300.428.016 (aprox. 1,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4-bit (W4A16, AutoAWQ); pesos base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), 4-bit AWQ |

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal compuesto: un codificador visual SigLIP2 de 400 millones de parametros que procesa imagenes y video, conectado a un LLM Qwen3.5 de 0.8 mil millones de parametros. El modelo hereda del MiniCPM-V 4.6 la compresion mixta de tokens visuales en modo 4x y 16x, que reduce el numero de tokens visuales enviados al LLM y, por tanto, el coste computacional en escenarios de multiples imagenes y video. La variante Thinking incorpora una traza de razonamiento explicita antes de la respuesta final.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card referencia varios papers (arXiv:2604.27393, arXiv:2509.18154, arXiv:2408.01800, arXiv:2605.08985), que probablemente contienen los detalles de entrenamiento, pero su contenido no esta incluido en la informacion disponible.

## Capacidades

- Comprension de imagen y texto (image-text-to-text) con generacion de respuestas conversacionales.
- Razonamiento multimodal con traza explicita (modo Thinking) antes de la respuesta final.
- Comprension de video, con decodificacion via torchcodec o PyAV.
- Tareas intensivas de OCR y reconocimiento de escritura manuscrita.
- Razonamiento matematico sobre contenido visual.
- Compresion configurable de tokens visuales (downsample_mode 4x para mayor detalle, 16x para mayor eficiencia).
- Soporte de multiples imagenes por peticion (max_slice_nums configurable).
- Despliegue en dispositivo: iOS, Android y HarmonyOS segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- **OCR y digitalizacion de documentos en movil**: el modelo puede leer tickets, facturas y notas manuscritas directamente en el dispositivo (la model card muestra demos de reconocimiento de tickets y escritura manuscrita en iPhone, Android y HarmonyOS), evitando enviar imagenes a un servidor.
- **Asistencia educativa con resolucion de problemas**: gracias al modo Thinking, el modelo genera la traza de razonamiento paso a paso antes de la respuesta, util para explicar problemas de matematicas o fisica a partir de una foto del enunciado.
- **Accesibilidad para personas con discapacidad visual**: descripcion de escenas y lectura de texto en imagenes en tiempo real en el telefono, con latencia baja gracias al peso reducido (1,9 GB en AWQ).
- **Analisis de video en el borde**: con la compresion 16x de tokens visuales y soporte de video, puede resumir o responder preguntas sobre clips cortos sin subirlos a la nube.
- **Verificacion de calidad en linea de produccion**: inspeccion visual de productos o etiquetas con un modelo ligero desplegado en GPUs de consumo, reduciendo costes frente a modelos multimodales de mayor tamano.
- **Soporte tecnico con capturas de pantalla**: el usuario envia una captura de error o de interfaz y el modelo razona sobre ella para proponer una solucion, con contexto multi-imagen mediante max_slice_nums.
- **Prototipado rapido de aplicaciones multimodales**: la licencia Apache 2.0 y el formato transformers permiten integrar el modelo en pipelines de investigacion y demos sin restricciones comerciales.

## Benchmarks y rendimiento

La model card incluye graficos de rendimiento (comparativa Thinking vs Instruct, throughput en alta concurrencia y TTFT de una sola peticion) en formato de imagen, pero no se proporcionan los valores numericos en la informacion disponible. Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos AWQ ocupan aproximadamente 1,9 GB; con overhead de activaciones y cache KV, se puede estimar un consumo en torno a 3-4 GB en FP16 para activaciones, aunque no se dispone de una cifra oficial en la informacion proporcionada.
- GPU recomendadas: al tratarse de un modelo de 1,3 mil millones de parametros, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090; tambien en A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, con cuantizacion AWQ 4-bit y en la mayoria de GPUs con 4 GB o mas de VRAM.
- Despliegue movil: iOS, Android y HarmonyOS segun la model card.
- Opciones de despliegue: transformers (version >= 5.7.0 recomendada), con Flash Attention 2 recomendado para multi-imagen y video; torchcodec o PyAV para decodificacion de video. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: la model card incluye graficos de TTFT y throughput en alta concurrencia, pero sin valores numericos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.6-Thinking-AWQ | ~1,3 mil millones | no disponible | Apache 2.0 | safetensors AWQ 4-bit | Version cuantizada, razonamiento explicito |
| MiniCPM-V-4.6-Thinking | ~1,3 mil millones | no disponible | Apache 2.0 | safetensors BF16 | Version base sin cuantizar |
| MiniCPM-V-4.6 | ~1,3 mil millones | no disponible | Apache 2.0 | safetensors | Variante Instruct sin traza de razonamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3.5-0.8B y SigLIP2, puede heredar sesgos de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo Thinking mitiga parte del error en tareas de razonamiento, pero no lo elimina.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible, lo que impide garantizar cobertura multilingue en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes base (Qwen3.5 y SigLIP2) por si imponen condiciones adicionales.
- Caveat de produccion: al ser una cuantizacion AWQ 4-bit, puede haber una perdida de precision respecto al modelo BF16, especialmente en tareas de OCR fino o razonamiento numerico; se recomienda validar en el dominio objetivo.
- Dependencias tecnicas: requiere transformers >= 5.7.0 y puede presentar problemas de compatibilidad de torchcodec con determinadas versiones de CUDA (la model card sugiere PyAV como alternativa).

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Variante Instruct: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo (Space): https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-AWQ-Demo
- Documentacion API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Papers referenciados: arXiv:2604.27393, arXiv:2509.18154, arXiv:2408.01800, arXiv:2605.08985
