# logan7000/srpo-repro-qwen25-3b-gsm8k-debate-lora

## Resumen

`logan7000/srpo-repro-qwen25-3b-gsm8k-debate-lora` es un conjunto de adaptadores LoRA publicados como reproduccion de los resultados del articulo arXiv 2602.21515 sobre SRPO (Self-Reflective Policy Optimization) frente a IPPO en un escenario de debate multiagente. El autor, logan7000, parte de Qwen2.5-3B-Instruct y entrena con el codigo oficial de SRPO, corrigiendo la sincronizacion de pesos LoRA con el motor de generacion (el metodo anterior basado en merge perdia la mayor parte de cada actualizacion por redondeo bf16). El artefacto incluye cuatro adaptadores: dos agentes SRPO (`srpo-hero-s200`, `srpo-adversary-s200`) y dos agentes IPPO de referencia (`ippo-agent0-s200`, `ippo-agent1-s200`), todos en el paso de entrenamiento 200 con rango LoRA 32.

El modelo base es un transformer denso de 3.000 millones de parametros con ventana de contexto de 32.768 tokens (especificacion de Qwen2.5-3B-Instruct), orientado a instrucciones y con capacidades multilingues. Los adaptadores no modifican la arquitectura: anaden matrices de bajo rango sobre las capas del modelo base para especializarlo en razonamiento aritmetico de tipo GSM8K dentro de un protocolo de debate de dos agentes y tres rondas.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para investigadores que quieran contrastar SRPO con IPPO en tareas de razonamiento con debate multiagente, y como evidencia empirica de que los resultados del articulo pueden no replicarse exactamente (en esta ejecucion IPPO no degrada tras el debate, al contrario de lo reportado en el paper). Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5-3B-Instruct) con adaptadores LoRA (r = 32) |
| Parametros totales | 3.000 millones (modelo base); adaptadores LoRA de bajo rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite bf16 y cuantizaciones GGUF/AWQ de la comunidad |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5-3B-Instruct es multilingue |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de Qwen2.5 con 3.000 millones de parametros, atención por causalidad estandar y contexto de 32.768 tokens. Sobre el se aplican adaptadores LoRA de rango 32 entrenados con el codigo oficial de SRPO, un algoritmo de optimizacion de politica para RLHF/RL con multiples agentes. El escenario de entrenamiento concreto es un debate de dos agentes (hero y adversary) con tres rondas sobre el conjunto GSM8K, evaluado con puntuacion estricta del separador `####`.

La innovacion tecnica documentada por el autor no esta en el algoritmo sino en la infraestructura: la sincronizacion de los pesos LoRA con el motor de generacion se hace ahora directamente sobre los adaptadores, en lugar de fusionarlos en el modelo base. El metodo anterior basado en merge perdia la mayor parte de cada actualizacion por redondeo bf16, lo que invalidaba la reproducibilidad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de GSM8K, ni si hubo etapas adicionales de RLHF o DPO sobre estos adaptadores.

## Capacidades

- Razonamiento aritmetico de varios pasos sobre problemas de tipo GSM8K, con formato de respuesta con separador `####`.
- Participacion en protocolos de debate multiagente de dos roles (hero/adversary) y tres rondas, tal como se entrenaron los adaptadores.
- Generacion de texto instructivo general, heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte multilingue heredado del modelo base (no verificado especificamente en los adaptadores).
- No se documenta soporte de tool calling, function calling, agentes multi-paso fuera del protocolo de debate, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos de RL multiagente: cargar los cuatro adaptadores y replicar el protocolo de debate de tres rondas sobre GSM8K para contrastar SRPO frente a IPPO en el paso 200.
- Investigacion sobre sincronizacion de pesos en RL con LoRA: el autor documenta el fallo del merge en bf16, por lo que estos adaptadores sirven como referencia para validar pipelines de entrenamiento que sincronicen adaptadores directamente con el motor de inferencia.
- Estudio de degradacion por debate: comparar la precision antes y despues del debate (SRPO hero 81,2 % / 78,7 %; IPPO 82,0 % / 78,7 % y 81,6 % / 79,5 %) para analizar si el debate ayuda o perjudica segun el algoritmo.
- Base para fine-tuning posterior en tareas de razonamiento matematico: los adaptadores LoRA r = 32 pueden servir como punto de partida o como inicializacion para experimentos con otros datasets aritmeticos.
- Evaluacion de robustez de agentes adversariales: el par hero/adversary permite estudiar como un agente entrenado para contradecir afecta a la precision final del conjunto.
- Docencia y divulgacion sobre RLHF y debate multiagente: el artefacto es pequeno (1,0 GB de repo) y cabe en una unica GPU consumer, lo que facilita demostraciones practicas en cursos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (precision en test GSM8K, validacion de entrenamiento, puntuacion estricta `####`, paso 200):

| Configuracion | Antes del debate | Despues del debate |
|---|---|---|
| SRPO hero (reproduccion) | 81,2 % | 78,7 % |
| IPPO agente 0 (reproduccion) | 82,0 % | 78,7 % |
| IPPO agente 1 (reproduccion) | 81,6 % | 79,5 % |
| SRPO (paper, referencia) | 84,6 % | 76,7 % |
| IPPO (paper, referencia) | 84,2 % | 63,4 % |

La conclusion del autor es que en su ejecucion IPPO no queda por detras tras el debate, a diferencia de lo reportado en el articulo. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en bf16 para el modelo base de 3B mas los adaptadores; alrededor de 2-3 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100 o H100 solo necesarias para entrenamiento o despliegue de alta concurrencia.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con `peft` sobre el modelo base en transformers; para servirlo en produccion se puede usar vLLM o TGI con soporte de adaptadores LoRA, o bien fusionar los adaptadores y exportar a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| srpo-repro-qwen25-3b-gsm8k-debate-lora (este) | 3B + LoRA r=32 | 32.768 | Debate multiagente SRPO/IPPO sobre GSM8K | qwen-research | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Instruct generalista | qwen-research | Hugging Face (ampliamente usado) |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Instruct generalista | qwen-research | Hugging Face |
| Adaptadores LoRA de la comunidad sobre Qwen2.5-3B | 3B + LoRA | 32.768 | Fine-tuning especifico por tarea | variable | Hugging Face |

La comparativa con modelos de razonamiento matematico especializados no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica "Research artifact; no warranty". No esta pensado para produccion.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar los terminos de la Qwen Research License antes de cualquier despliegue.
- Los adaptadores estan entrenados especificamente para el protocolo de debate de dos agentes y tres rondas sobre GSM8K; su comportamiento fuera de ese protocolo no esta validado.
- Los resultados de la reproduccion no coinciden con los del paper (especialmente en IPPO tras el debate), por lo que no deben citarse como confirmacion de los resultados originales.
- Riesgo de alucinacion y sesgos: no documentados especificamente para estos adaptadores; heredan los del modelo base Qwen2.5-3B-Instruct.
- Idiomas soportados no verificados en los adaptadores; el entrenamiento se realizo sobre GSM8K, que es predominantemente en ingles.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- El repositorio ocupa 1,0 GB y contiene cuatro adaptadores; es necesario cargar el modelo base por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logan7000/srpo-repro-qwen25-3b-gsm8k-debate-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Articulo de referencia: arXiv 2602.21515 (SRPO vs IPPO)
- Codigo oficial de SRPO: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
