# askitai/AskIt-EI-27B-W4A16

## Resumen

AskIt EI-27B es un checkpoint cuantificado del modelo Qwen3-Omni-MoE, publicado por askitai como base para un asistente empresarial ("Enterprise Intelligence"). El componente cuantificado es el stack transformer del Thinker, convertido a W4A16 (pesos de 4 bits, activaciones BF16) mediante AutoRound con empaquetado GPTQ, grupo de 128 y cuantización simétrica. Se distribuye en formato Transformers con 26 shards de safetensors y un total de 9.362.711.089 parámetros almacenados, lo que arroja un repositorio de 26,3 GB.

La relevancia del modelo es doble. Por un lado, demuestra una ruta de cuantización viable para arquitecturas omni-modales MoE con backend Triton en CUDA, reduciendo el coste de memoria del Thinker sin tocar el resto de componentes. Por otro, es una release de ingeniería temprana: el propio autor declara validada únicamente la generación de texto, mientras que las rutas de audio, imagen, vídeo y generación de habla (Talker) no han sido verificadas.

Conviene tratarlo con cautela. El checkpoint deriva de un modelo fusionado de AskIt sobre Qwen3-Omni-MoE, pero el identificador upstream exacto y la licencia aplicable no están codificados de forma fiable en la configuración final. El repositorio usa `license: other` y no otorga derechos sobre los pesos originales; los mantenedores deben confirmar la procedencia y la licencia antes de cualquier uso público o comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3OmniMoeForConditionalGeneration` (familia `qwen3_omni_moe`), transformer MoE multimodal con stack Thinker y modulo Talker |
| Parametros totales | 9.362.711.089 (según safetensors); el nombre comercial "27B" no coincide con el recuento almacenado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, BF16 activaciones), grupo 128, simetrica, AutoRound GPTQ; backend `auto_round:tritonv2_zp` |
| Idiomas soportados | no disponible |
| Licencia | `other` (procedencia upstream sin confirmar; la model card no concede derechos sobre los pesos originales) |
| Formato de pesos | safetensors (26 shards + indice), cargable con Transformers |

## Arquitectura y entrenamiento

El modelo es un Qwen3-Omni-MoE con arquitectura `Qwen3OmniMoeForConditionalGeneration`, que combina un stack transformer tipo Thinker con un modulo Talker orientado a generacion de habla. La release cuantiza exclusivamente el Thinker: los 48 bloques transformer han sido convertidos con AutoRound 0.16.1 a W4A16, afectando a 388 modulos lineales por bloque (18.624 en total). El resto de componentes del checkpoint conserva su precision original. La cuantizacion es simetrica con grupo de 128 y empaquetado GPTQ, ejecutada sobre backend Triton v2 con zero-point.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o GRPO. La model card menciona que futuras versiones con SFT, destilacion de razonamiento o DPO/GRPO se publicaran como repositorios separados para preservar la reproducibilidad de este checkpoint. Tampoco se detalla ninguna innovacion de decodificacion o atencion mas alla de lo implicito en la arquitectura Qwen3-Omni-MoE.

## Capacidades

- Generacion de texto conversacional: unica ruta validada por el autor, probada en una NVIDIA RTX PRO 6000 Blackwell Server Edition.
- Razonamiento y respuesta multi-turno: heredados de la arquitectura base, aunque sin evaluacion publica en esta release.
- Tool calling y function calling: no disponible (no verificado).
- Agentes y razonamiento multi-paso: no disponible (no verificado).
- Capacidades multilingues: no disponible; el autor indica que la calidad empresarial multilingue no esta validada.
- Entrada de audio, imagen y video: presentes en la arquitectura pero no verificadas en este checkpoint.
- Generacion de habla (Talker): presente en la arquitectura pero no verificada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de asistentes empresariales: el modelo permite montar un pipeline de texto con Transformers y un device map CUDA explicito, adecuado para validar flujos conversacionales antes de invertir en infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica de AutoRound W4A16 sobre un MoE omni-modal, util para equipos que quieran medir la degradacion de calidad frente al checkpoint original.
- Investigacion en eficiencia de inferencia: el backend Triton `tritonv2_zp` y el esquema de grupo 128 permiten estudiar throughput y uso de VRAM en GPUs Blackwell.
- Generacion de texto en entornos con VRAM limitada: al reducir los pesos del Thinker a 4 bits, el checkpoint puede desplegarse en GPUs profesionales de una sola tarjeta, algo inviable con el modelo en BF16.
- Base para fine-tuning posterior: el autor planea publicar versiones con SFT y DPO/GRPO; este checkpoint puede servir como punto de partida reproducible para experimentos de ajuste.
- Integracion en pipelines de Transformers: al conservar tokenizer, processor y configuracion, encaja en flujos existentes que ya usan `Qwen3OmniMoeForConditionalGeneration`.
- Evaluacion de riesgos en produccion: util para medir alucinacion y calidad en dominios empresariales antes de cualquier despliegue con clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el rendimiento amplio en benchmarks, la calidad empresarial multilingue, el throughput en produccion y el comportamiento en contexto largo no han sido validados.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 26,3 GB en disco; con overhead de runtime en BF16 para activaciones y buffers, se recomienda una GPU con al menos 32-40 GB de VRAM.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (unica plataforma probada por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o RTX PRO 6000 Blackwell; en consumer, una RTX 4090 de 24 GB queda por debajo del margen recomendado.
- Despliegue: Transformers con `device_map=0` explicito y `trust_remote_code=True`; el backend AutoRound CUDA requiere kernels Triton compatibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno probado: Python 3.12, PyTorch 2.13.0+cu130, Transformers 5.19.0, Triton 3.7.1, AutoRound 0.16.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| AskIt EI-27B W4A16 | 9,36 B almacenados | no disponible | W4A16 AutoRound GPTQ | other (upstream sin confirmar) | Release de ingenieria, solo texto validado |
| Qwen3-Omni-MoE (upstream) | no disponible | no disponible | BF16 original | no disponible | Modelo base multimodal completo |
| Qwen3 MoE cuantizados de la comunidad | variable | variable | GPTQ/AWQ 4 bits | Apache 2.0 en la mayoria | Ecosistema amplio, solo texto |
| Modelos omni cuantizados tipo MiniCPM-o | ~8 B | variable | int4/GGUF | variable | Multimodal validado en algunos casos |

La comparativa es limitada porque el autor no publica el identificador upstream exacto ni los datos de contexto del modelo base. Frente a las alternativas de la comunidad, la diferencia principal es que AskIt EI-27B cuantiza solo el Thinker y deja el resto de componentes sin tocar, lo que reduce el ahorro de memoria total y complica la comparacion directa.

## Limitaciones y advertencias

- Solo se ha validado la generacion de texto; audio, imagen, video y Talker no estan verificados y no deben asumirse por el nombre de la arquitectura.
- La cuantizacion W4A16 puede degradar la calidad de salida respecto al checkpoint original; no se han publicado mediciones.
- El identificador upstream exacto y la licencia aplicable no estan codificados de forma fiable; el repositorio usa `license: other` y no concede derechos sobre los pesos originales.
- El nombre comercial "27B" no coincide con los 9,36 mil millones de parametros almacenados; conviene no usar la cifra comercial para dimensionar infraestructura.
- Riesgo de alucinacion: el autor advierte explicitamente de no tratar las salidas como hechos sin validacion.
- No hay datos sobre sesgos, comportamiento multilingue ni contexto largo.
- No se documenta soporte para servidores de inferencia habituales (vLLM, TGI, llama.cpp), lo que limita su uso en produccion.
- La release se declara no certificada para produccion ni para despliegues de alto impacto; se recomienda retrieval, validacion de herramientas y escalado humano.

## Enlaces

- Hugging Face: https://huggingface.co/askitai/AskIt-EI-27B-W4A16
- AutoRound (herramienta de cuantizacion): https://github.com/intel/auto-round
- Qwen3-Omni (familia base): https://huggingface.co/Qwen
- Transformers (libreria de carga): https://github.com/huggingface/transformers
