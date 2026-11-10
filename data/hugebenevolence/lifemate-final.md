# hugebenevolence/lifemate-final

## Resumen

LifeMate Final es el paquete de pesos publicados por el equipo `hugebenevolence` para su solucion en la pista 1 del Zalo AI Challenge 2026. El objetivo del reto es convertir una peticion hablada en vietnamita en una secuencia de llamadas a herramientas sobre el entorno `ToolEnv` proporcionado por los organizadores. El repositorio no contiene un modelo unico, sino varios artefactos: un adaptador LoRA sobre el LLM base Qwen/Qwen3.5-4B y un modelo de reconocimiento automatico del habla (ASR) Gipformer de 68M de parametros afinado y exportado a ONNX.

La solucion combina dos etapas: primero se transcribe el audio con el ASR y despues el LLM genera las llamadas a herramientas. El adaptador servido por defecto en la pipeline publica es `llm-lora-p1`, un LoRA de rango 16 entrenado sobre las 1.545 tareas del split TRAIN, con un peso de perdida especifico para el texto de los mensajes (0,3) y filas de recuperacion. Los otros dos adaptadores (`llm-lora-e1` y `llm-lora-synth`) pueden usarse en modo ensemble votando cada siguiente llamada.

Es relevante porque documenta de forma reproducible un pipeline completo de voz a accion para vietnamita sobre un modelo base pequeno (4B), con licencia Apache-2.0 para los adaptadores y MIT para el ASR y el codigo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen3.5-4B) con adaptadores LoRA; ASR Gipformer RNNT (ONNX) |
| Parametros totales | 4B en el modelo base (Qwen/Qwen3.5-4B); ASR de 68M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA en entrenamiento de `llm-lora-e1` y `llm-lora-synth`; pesos en safetensors y ONNX |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 (adaptadores LoRA); MIT para `asr-gipformer/` y el codigo del repositorio |
| Formato de pesos | safetensors (adaptadores LoRA), ONNX (ASR para sherpa-onnx) |

## Arquitectura y entrenamiento

El componente de lenguaje es un ajuste fino mediante LoRA de rango 16 sobre Qwen/Qwen3.5-4B (commit `851bf6e8`). Se publican tres variantes: `llm-lora-p1`, entrenada con el prompt E1P, filas de recuperacion y un peso de perdida de 0,3 sobre el texto de los mensajes; `llm-lora-e1`, con QLoRA y prompt E1; y `llm-lora-synth`, tambien QLoRA con prompt E1 pero anadiendo aplicaciones sinteticas escritas para el entrenamiento. Las tres se entrenaron exclusivamente con las 1.545 tareas del split TRAIN de los organizadores; no se etiquetaron ni usaron los conjuntos publico ni privado de test.

El componente de voz es `g-group-ai-lab/gipformer1.5-68M-rnnt`, afinado sobre sus 68M de parametros completos con las 5.036 grabaciones del split TRAIN y exportado a ONNX para su uso con sherpa-onnx. La pipeline publicada sirve unicamente `llm-lora-p1` (puntuacion publica 61,26); alternativamente, los tres adaptadores pueden votar cada siguiente llamada en modo `ENSEMBLE` configurable en `configs/release.sh`. El repositorio incluye `SHA256SUMS` con el hash de cada fichero.

## Capacidades

- Reconocimiento automatico del habla en vietnamita mediante el modelo Gipformer RNNT exportado a ONNX.
- Generacion de llamadas a herramientas (tool calling) a partir de una peticion hablada transcrita, sobre el entorno `ToolEnv` del reto.
- Razonamiento multi-paso orientado a la seleccion secuencial de llamadas (cada siguiente llamada se predice condicionada por las anteriores).
- Modo ensemble de tres adaptadores LoRA con votacion por llamada.
- Capacidad multilingue limitada al vietnamita segun la model card.
- No se documentan capacidades de vision, audio nativo en el LLM ni modo thinking explicito.

## Casos de uso

- Asistentes de voz para servicios vietnamitas: el pipeline ASR + LLM transcribe la peticion del usuario y la traduce en llamadas a APIs concretas, adecuado para reservas, consultas de estado o gestion de pedidos.
- Automatizacion de atencion al cliente por telefono: el ASR Gipformer de 68M permite transcripcion en tiempo real y el LoRA sobre Qwen3.5-4B genera la accion a ejecutar sobre el backend.
- Integracion en agentes de operaciones: el modo ensemble de los tres adaptadores reduce la varianza en la seleccion de la siguiente llamada en flujos con multiples pasos.
- Prototipado de interfaces voz-accion para pymes: el modelo base de 4B y el ASR de 68M permiten desplegar en hardware modesto frente a alternativas de mayor tamano.
- Evaluacion academica de pipelines ASR + tool calling: el repositorio incluye recetas de datos y el layout de la imagen Docker, lo que facilita la reproducibilidad.
- Investigacion en adaptacion de bajo rango: las tres variantes (E1P, E1 y sintetica) permiten comparar estrategias de prompt, recuperacion y datos sinteticos sobre el mismo base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Puntuacion publica del reto (pipeline con `llm-lora-p1`) | 61,26 |
| Puntuacion del modo ensemble | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el LLM base de 4B: aproximadamente 8-10 GB en FP16 y 3-4 GB en cuantizacion de 4 bits, estimacion orientativa no confirmada por el autor.
- ASR Gipformer de 68M en ONNX: ejecutable en CPU con sherpa-onnx, con requisitos de memoria minimos.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 o una A100 son suficientes, y el modelo cabe en GPUs de consumo con cuantizacion.
- Opciones de despliegue: sherpa-onnx para el ASR; el LLM puede servirse con frameworks compatibles con safetensors y LoRA (no se detalla en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LifeMate Final (este) | 4B + LoRA; ASR 68M | no disponible | vi | Apache-2.0 / MIT | ASR + tool calling para vietnamita |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | multilingue | Apache-2.0 | LLM generalista sin adaptacion al reto |
| g-group-ai-lab/gipformer1.5-68M-rnnt (base) | 68M | no disponible | no disponible | MIT | ASR sin ajuste a las grabaciones del reto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en vietnamita y en el entorno `ToolEnv` del reto; su uso fuera de ese dominio no esta validado.
- Entrenado solo con el split TRAIN (1.545 tareas y 5.036 grabaciones); puede sobreajustar a la distribucion de dichos datos.
- Riesgo de alucinacion en la generacion de llamadas a herramientas no presentes en el entorno o con argumentos invalidos.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del conjunto del reto.
- La licencia Apache-2.0 cubre los adaptadores LoRA; el ASR y el codigo estan bajo MIT, con avisos separados por carpeta.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- No se especifican longitud de contexto ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/hugebenevolence/lifemate-final
- Repositorio de codigo y recetas: https://github.com/Datyth/ZaloAI-Challenge-lifemate
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base del ASR: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
