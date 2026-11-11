# ManhQuangAI/Robot-tics

## Resumen

Robot-tics es un paquete de artefactos para un robot de guiado hospitalario simulado, no un modelo de lenguaje generativo unico. Lo publica el usuario ManhQuangAI como complemento del repositorio GitHub `QuangManhAI/Data-Science-Major-Project` (rama `feat/human-walk-animation`) y agrupa cinco componentes independientes: un detector de vision YOLO26n afinado con 17 clases hospitalarias, una politica de refuerzo PPO para navegacion en un simulador Godot, un sistema STT basado en PhoASR-whisper-small, un clasificador de intenciones PhoBERT y una cadena TTS con VieNeu-TTS v3 Turbo y el codec MOSS Audio Tokenizer Nano. Todo el conjunto ocupa 2,7 GB y esta pensado para descargarse directamente sobre la raiz del repositorio, de modo que las rutas coincidan con las que espera el codigo Python.

El interes tecnico esta en la integracion completa de un pipeline de robot social en simulacion: percepcion visual, decision de navegacion, reconocimiento de voz, comprension de intenciones en vietnamita y sintesis de voz con 22 voces (8 masculinas y 14 femeninas adultas, 1.669 clips). La politica RL opera solo con vision (21 dimensiones de observacion, sin LiDAR), lo que simplifica el despliegue en entornos simulados pero limita la robustez frente a oclusiones. El detector YOLO26n reporta un mAP50 del 92,6 % sobre las 17 clases del dominio hospitalario.

La relevancia es acotada: se trata de un artefacto de proyecto academico, con licencia `other` no estandarizada, repo privado y componentes de terceros con licencias incompatibles entre si para uso comercial (AGPL-3.0, GPL-3.0, Qualcomm Responsible AI License). No es un modelo de proposito general ni sustituye a un LLM; es un caso de estudio de integracion multimodal en robotica de servicio. El idioma principal del pipeline conversacional es el vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal: YOLO26n (deteccion), PPO (politica RL), Whisper-small fine-tune (STT), PhoBERT fine-tune (NLU), VieNeu-TTS v3 Turbo + MOSS Audio Tokenizer Nano (TTS) |
| Parametros totales | no disponible (no se declara el recuento por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 en TTS; `.pt` y `.onnx` en vision; no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (STT, NLU y TTS); el resto no disponible |
| Licencia | `other` (repo privado, solo uso en el proyecto); componentes de terceros con Apache-2.0, Qualcomm Responsible AI License, AGPL-3.0 y GPL-3.0 |
| Formato de pesos | safetensors, ONNX, PyTorch `.pt`, `.jar` (VnCoreNLP), CSV/WAV (dataset de voces) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura unica sino una orquestacion de modulos heterogeneos. La percepcion usa YOLO26n afinado para detectar 17 clases de objetos hospitalarios, exportado tanto a PyTorch como a ONNX y con un mAP50 declarado del 92,6 %. La navegacion la resuelve una politica PPO denominada Pure-Vision V2, con un espacio de observacion de 21 dimensiones y sin entrada de LiDAR, entrenada en el simulador Godot del repositorio; el checkpoint activo es `PPOHospital-PureVisionV2_best.pt`. La capa de voz combina un fine-tune de PhoASR-whisper-small para reconocimiento, un PhoBERT afinado para clasificacion de intenciones (con segmentacion VnCoreNLP RDRSegmenter, que requiere Java 8 o superior) y una sintesis TTS con VieNeu-TTS v3 Turbo en ONNX fp32 acoplada al codec MOSS Audio Tokenizer Nano.

No se documentan en la informacion disponible el volumen de tokens, la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. El unico dato cuantitativo de entrenamiento es el del corpus de voces: 1.669 clips de 22 hablantes adultos, con exclusion explicita de voces infantiles y de participantes que retiraron su consentimiento.

## Capacidades

- Deteccion de objetos en imagenes para 17 clases de entorno hospitalario mediante YOLO26n, con exportacion ONNX para inferencia sin PyTorch.
- Navegacion autonoma en simulacion Godot a partir exclusivamente de observaciones visuales (21 dimensiones), sin sensores LiDAR.
- Reconocimiento de voz en vietnamita con un Whisper-small afinado sobre dominio hospitalario.
- Clasificacion de intenciones de usuario en vietnamita con PhoBERT afinado, invocable con el flag `--nlu phobert`.
- Segmentacion de palabras en vietnamita con VnCoreNLP RDRSegmenter (dependencia de Java).
- Sintesis de voz en vietnamita con 22 timbres distintos (8 masculinos y 14 femeninos adultos) y cache de respuestas TTS.
- Reproduccion de audio ambiental hospitalario desde el simulador.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso generico ni modo de pensamiento.

## Casos de uso

- Prototipado de robots de guiado en hospitales simulados: el conjunto permite levantar un agente completo en Godot con `run_simulation.py --controller rl --nlu phobert`, cubriendo percepcion, navegacion y dialogo sin integrar piezas por separado.
- Investigacion en navegacion puramente visual: la politica PPO Pure-Vision V2 sirve como linea base para comparar agentes sin LiDAR en entornos con obstaculos estaticos y dinamicos.
- Evaluacion de deteccion en dominio sanitario: el YOLO26n afinado con 17 clases hospitalarias permite medir el impacto del ajuste fino frente a un detector generico en imagenes de pasillos, camillas o equipamiento medico.
- Sistemas de atencion al paciente en vietnamita: la cadena STT + NLU + TTS puede desplegarse como modulo de recepcion conversacional para orientar a pacientes hacia consultas o laboratorios.
- Generacion de voces para NPC en simulacion: los 1.669 clips y el manifiesto `data/processed/manifest.csv` permiten poblar escenarios con multiples interlocutores y evaluar naturalidad percibida.
- Docencia en integracion multimodal: el repositorio documenta el proceso paso a paso en `SETUP_FROM_HF.md`, lo que lo hace util como material de practicas sobre pipelines de robotica con RL, vision y voz.
- Pruebas de estres de latencia en entornos simulados: la separacion en microservicios (`rl_policy_server.py`, servidor TTS, NLU) facilita medir el coste de cada etapa del pipeline conversacional.

## Benchmarks y rendimiento

| Metrica | Componente | Valor |
|---|---|---|
| mAP50 | YOLO26n hospital v6 | 92,6 % |
| Clases detectadas | YOLO26n hospital v6 | 17 |
| Dimension de observacion | Politica PPO Pure-Vision V2 | 21 |

No se han publicado resultados de benchmarks en la informacion disponible para el resto de componentes (STT, NLU, TTS, politica RL en tareas de exito). No se aportan cifras de MMLU, HumanEval, GSM8K ni equivalentes, dado que el paquete no contiene un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el repo pesa 2,7 GB, por lo que la carga completa en memoria (vision + RL + STT + NLU + TTS) requiere al menos varios GB, pero no se especifica el pico real.
- GPU recomendadas: no documentadas por el autor. Por el tamano de los componentes (YOLO26n, Whisper-small, PhoBERT-base), cabria esperar ejecucion viable en GPU de consumo, pero es una estimacion no confirmada.
- Cabe en GPU de consumo: probablemente si para inferencia individual de cada modulo; sin dato oficial.
- Opciones de despliegue: `onnxruntime` para los modulos ONNX (TTS y vision), PyTorch para los checkpoints `.pt`, servidor propio `rl_policy_server.py` y el runner `run_simulation.py` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: Java 8 o superior para VnCoreNLP; entorno virtual `.venv-tts` separado para la cadena TTS; token de Hugging Face con permiso de lectura por ser repo privado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Robot-tics (ManhQuangAI) | Paquete robotico multimodal (vision + RL + STT + NLU + TTS) | no disponible | no disponible | mAP50 92,6 % en 17 clases | `other`, repo privado | Hugging Face, acceso con token |
| YOLOv8n / YOLO11n (Ultralytics) | Detector de objetos | ~3M | no aplica | mAP variable segun dataset | AGPL-3.0 / comercial | Publico |
| Whisper-small (OpenAI) | STT | 244M | 30 s de audio | WER variable por idioma | MIT | Publico |
| PhoBERT-base-v2 (VinAI) | Encoder de lenguaje vietnamita | ~135M | 256 tokens | Resultados en VLSP y tareas vietnamitas | AGPL-3.0 | Publico |

La comparacion directa no es limpia porque Robot-tics es un conjunto integrado y no un modelo unico; los elementos anteriores son los bloques genericos sobre los que se construye o que resultan intercambiables. No se dispone de comparativas publicadas del pipeline completo frente a otros sistemas de robotica hospitalaria.

## Limitaciones y advertencias

- Licencia `other` sin texto legal publico en la informacion disponible: no hay base clara para uso comercial ni para redistribucion.
- Componentes de terceros con licencias restrictivas o incompatibles: PhoBERT-base-v2 es AGPL-3.0, VnCoreNLP es GPL-3.0 y PhoASR-whisper-small usa la Qualcomm Responsible AI License; el uso comercial combinado es problemático.
- El repositorio es privado y requiere token de Hugging Face con permiso de lectura; no es un artefacto abierto de facto.
- Las voces NPC son grabaciones de personas reales: el autor restringe su uso al ambito del proyecto y pide mantener el repo privado. Riesgo legal y etico si se reutilizan fuera de ese contexto.
- La politica RL se entrena solo con vision y sin LiDAR: previsiblemente fragil ante oclusiones, cambios de iluminacion o layouts distintos al simulador Godot.
- Todo el pipeline esta orientado al vietnamita; no hay soporte documentado de otros idiomas en STT, NLU ni TTS.
- No se documentan evaluaciones de sesgo, tasas de alucinacion ni robustez fuera del dominio hospitalario simulado.
- Ausencia total de benchmarks en STT, NLU, TTS y exito de navegacion: no es posible estimar calidad en produccion.
- Dependencia de Java para VnCoreNLP y de rutas exactas en el arbol del repositorio (onnxruntime rechaza ficheros `.data` fuera del directorio del modelo), lo que complica el despliegue en contenedores.
- Proyecto academico sin mantenimiento declarado ni comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManhQuangAI/Robot-tics
- Repositorio GitHub del proyecto: https://github.com/QuangManhAI/Data-Science-Major-Project (rama `feat/human-walk-animation`)
- Guia de instalacion: `SETUP_FROM_HF.md` en la raiz del repositorio GitHub
- YOLO26n (Ultralytics): https://github.com/ultralytics/ultralytics
- Whisper (OpenAI): https://github.com/openai/whisper
- PhoBERT (VinAI): https://github.com/VinAIResearch/PhoBERT
- VnCoreNLP: https://github.com/vncorenlp/VnCoreNLP
- Godot Engine: https://godotengine.org
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
