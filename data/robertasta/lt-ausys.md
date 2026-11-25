# RobertasTa/lt-ausys

## Resumen

lt-ausys es un modelo de reconocimiento automatico del habla (ASR) para lituano, publicado por RobertasTa en Hugging Face. No es un modelo entrenado desde cero: es una exportacion a ONNX y cuantizacion int8 de `datolabs/upelis-0.6b-lt-v1`, un fine-tuning sobre el Nemotron unified ASR 0.6B de NVIDIA, que a su vez es un transductor RNN-T con encoder FastConformer. El objetivo es ejecutar ASR lituano en CPU sin PyTorch ni NeMo, con un consumo de memoria de aproximadamente 1,4 GB en int8.

La motivacion declarada por el autor es practica: los modelos de la familia Whisper pagan un coste fijo de ventana de 30 segundos por cada utterance, lo que en una CPU Ryzen 7 8845HS supone 3,5 s para un comando de 2 s con Whisper large-v3-turbo int8. Un transductor solo procesa el audio que recibe, y este modelo resuelve el mismo comando en 0,18 s en el mismo hardware. El caso de uso principal es un asistente de voz domestico integrado en Home Assistant mediante el protocolo Wyoming.

El repositorio incluye los pesos en ONNX (fp32 e int8), el vocabulario SentencePiece de 4 095 tokens, la configuracion y la licencia. El modelo base incorpora el prompt de idioma lituano directamente en el encoder exportado, de modo que no es necesario pasarlo en tiempo de inferencia. El tamano del repositorio es de 6,6 GB, aunque la descarga en int8 es de aproximadamente 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNN-T con encoder FastConformer (Nemotron unified ASR) |
| Parametros totales | 0,6B (modelo base upelis-0.6b-lt-v1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana no fija de 30 s como Whisper) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica de MatMul en el encoder) |
| Idiomas soportados | lituano (lt) |
| Licencia | OpenMDW-1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx`, variantes `.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transductor RNN-T (Recurrent Neural Network Transducer) con encoder FastConformer. La entrada son 128 features mel con subsampling 8. El decoder_joint combina la red de prediccion y el joint en un unico grafo ONNX. El vocabulario es SentencePiece con 4 095 tokens mas el token `<blk>`, lo que da 4 096 lineas en `vocab.txt`. El modelo base es un modelo multilingue con prompt de idioma: NeMo introduce el one-hot de idioma (lituano = indice 31) mediante `prompt_kernel` despues del encoder, dentro de `model.forward`. La exportacion de este repositorio usa una subclase del encoder que incorpora ese prompt, de modo que el ONNX resultante ya lleva el idioma lituano integrado y no requiere pasarlo en inferencia.

El entrenamiento original corresponde a Datolabs, que hizo fine-tuning de `nvidia/nemotron-labs-unified-asr-0.6b` sobre el corpus LIEPA-3 (Universidad Vytautas Magnus, Universidad de Vilnius, Instituto de la Lengua Lituana; CC BY 4.0) y Mozilla Common Voice 22.0 (CC0). Este repositorio no entrena: convierte el checkpoint `.nemo` original (2 507 796 480 bytes, SHA-256 `cfd2d9f1a10c2c764a932a2802c6b981ae7567b8a624f637a5cbb55e7258c0ef`) a ONNX y aplica cuantizacion dinamica int8 solo sobre las operaciones MatMul del encoder. El decoder_joint en int8 es en realidad el mismo fichero fp32 renombrado con el nombre que onnx-asr espera para `quantization="int8"`. La inferencia se realiza con onnx-asr, onnxruntime y numpy, sin dependencia de PyTorch ni NeMo.

## Capacidades

- Reconocimiento de voz en lituano con salida puntuada y con mayusculas.
- Escritura de numeros a partir de 10 en cifras (por ejemplo, "Įjunk šviesą svetainėje 20 procentų.").
- Procesamiento de audio de duracion variable sin coste fijo de ventana: solo procesa el audio recibido.
- Entrada de fichero WAV de 16 kHz mono 16-bit o array numpy float32 con `sample_rate`.
- Ejecucion en CPU sin PyTorch ni NeMo, con onnxruntime.
- Integracion con Home Assistant y cualquier cliente Wyoming mediante el servidor companero del autor.
- No soporta tool calling, agentes, vision, audio de entrada mas alla de ASR ni modo thinking: es exclusivamente un modelo ASR.

## Casos de uso

- Asistente de voz domestico en Home Assistant: el modelo se sirve mediante el servidor Wyoming de `RobertasTa/lt-ausys` y responde a comandos cortos en lituano con latencia de 0,18 s en CPU Ryzen 7 8845HS, lo que permite interaccion conversacional fluida sin GPU.
- Comandos de voz offline en dispositivos de bajos recursos: al requerir aproximadamente 1,4 GB de RAM en int8 y no depender de PyTorch, se puede desplegar en mini-PC, LXC o contenedores sin acelerador.
- Transcripcion de notas de voz cortas: util para capturar ordenes, recordatorios o busquedas dictadas donde la puntuacion completa no es critica.
- Automatizacion de hogar por voz: integracion con el pipeline de intents de Home Assistant para encender luces, ajustar porcentajes o consultar estados.
- Prototipado de ASR lituano en CPU: sirve como referencia para evaluar el rendimiento de un transductor frente a Whisper en tareas de audio corto.
- Transcripcion de audio en entornos sin conexion: al ejecutarse completamente offline con onnxruntime, es adecuado para escenarios con requisitos de privacidad o sin red.
- No es adecuado para dictado de texto largo: el propio autor recomienda la revision `v1-kmynas` (kmynas-parakeet-lt-v4) para dictado por su mejor segmentacion de frases y comas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR lituano | FLEURS (Lithuanian), `lt_lt`, split test | WER | 8,32 |
| ASR lituano | FLEURS (Lithuanian), `lt_lt`, split test | CER | 4,26 |

Metricas adicionales reportadas por el autor sobre el mismo conjunto FLEURS (986 frases):

| Metrica | lt-ausys (Upelis) | kmynas (v1-kmynas) |
|---|---|---|
| Frases que terminan en punto | 82 de 986 | no disponible |
| Deteccion de limites de frase en ~45 s de habla continua | 2,8 % | 84,7 % |
| Comma F1 | 58,0 % | 82,6 % |

Latencia medida en CPU Ryzen 7 8845HS: 0,18 s para un comando de 2 s con int8, frente a 3,5 s con Whisper large-v3-turbo int8 (Paprika).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU.
- RAM estimada: aproximadamente 1,4 GB en int8; 5,8 GB para el checkpoint `.nemo` original con NeMo y PyTorch.
- GPU: no requiere GPU. No se han publicado mediciones en GPU para esta exportacion.
- CPU: validado en Ryzen 7 8845HS. Cabe en cualquier CPU x86-64 moderna con al menos 2 GB de RAM libre en int8.
- Despliegue: onnx-asr + onnxruntime + numpy. Compatible con el servidor Wyoming companero (`lt_ausys_server.py`, unidad systemd, pasos de instalacion en LXC).
- Descarga: aproximadamente 0,7 GB en int8; 2,5 GB en fp32.
- Latencia: 0,18 s por comando de 2 s en int8 sobre Ryzen 7 8845HS. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| lt-ausys (este) | RNN-T FastConformer | 0,6B | lt | OpenMDW-1.1 | ONNX (fp32/int8) | Optimizado para CPU y Home Assistant; peor puntuacion en dictado |
| kmynas-parakeet-lt-v4 (v1-kmynas) | Parakeet-TDT | no disponible | lt | CC BY 4.0 | ONNX | Mejor segmentacion de frases y comas; recomendado para dictado |
| Paprika (Whisper large-v3-turbo int8) | Whisper encoder-decoder | large-v3-turbo | multilingue (incl. lt) | no disponible en la informacion | no disponible | Coste fijo de ventana de 30 s; 3,5 s por comando de 2 s en el mismo CPU |
| upelis-0.6b-lt-v1 | RNN-T FastConformer | 0,6B | lt | OpenMDW-1.1 | `.nemo` (NeMo) | Modelo original; requiere NeMo 3.1, PyTorch y 5,8 GB de RAM |

## Limitaciones y advertencias

- Puntuacion deficiente: solo 82 de 986 frases de FLEURS terminan en punto, y en habla continua detecta el 2,8 % de los limites de frase y aproximadamente la mitad de las comas (comma F1 58,0 %). No es adecuado para dictado de texto legible.
- El modelo base tiene el mismo comportamiento de puntuacion; no es un defecto introducido por la cuantizacion.
- Solo soporta lituano. No hay capacidades multilingues en esta exportacion.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR; el WER de 8,32 en FLEURS es un dato declarado por el autor y no verificado de forma independiente.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse con LIEPA-3 y Common Voice, puede reflejar los sesgos de esos corpus.
- Licencia OpenMDW-1.1: es necesario conservar `LICENSE` y `NOTICE` si se redistribuye. Verificar los terminos para uso comercial en el fichero de licencia.
- El decoder_joint en int8 es en realidad el fichero fp32 renombrado; no esta cuantizado.
- Cargar por nombre de tipo requiere `"nemo-conformer-rnnt"`; con `"nemo-conformer-tdt"` (valido para la revision antigua `v1-kmynas`) el modelo no carga.
- La model card indica que la conversion, el servidor y la propia card fueron escritos con asistencia de IA (Claude, Anthropic) y medidos en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobertasTa/lt-ausys
- Modelo base (Datolabs): https://huggingface.co/datolabs/upelis-0.6b-lt-v1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Repositorio del servidor Wyoming: https://github.com/RobertasTa/lt-ausys
- onnx-asr: https://github.com/istupakov/onnx-asr
- Aplicacion de dictado Diktuokle: https://github.com/RobertasTa/diktuokle
- Revision anterior (kmynas-parakeet-lt-v4 en ONNX): https://huggingface.co/RobertasTa/lt-ausys (revision `v1-kmynas`)
- Modelo kmynas-parakeet-lt-v4: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- Modelo Paprika (Whisper lituano): https://huggingface.co/kristijonas/paprika-whisper-lt-v3
