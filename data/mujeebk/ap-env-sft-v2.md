# mujeebk/ap-env-sft-v2

## Resumen

`mujeebk/ap-env-sft-v2` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el autor `mujeebk` en el contexto de un trabajo de investigación titulado *Right Actions, Incomplete Evidence: Post-Training a Small Language Model in a Stateful Accounts Payable Environment*. El modelo está especializado en tareas de cuentas por pagar (accounts payable) con uso de herramientas (tool use) en un entorno con estado, y se distribuye como checkpoint completo en bf16 con los pesos del adaptador LoRA SFT-v2 ya fusionados.

Se trata de un modelo de 4.022.468.096 parámetros (aproximadamente 4B), heredando la arquitectura transformer decoder-only de la familia Qwen3 y una ventana de contexto de 262.144 tokens (dato del modelo base, no confirmado en esta ficha). Su relevancia es acotada: es un artefacto de investigación con 2 descargas y 0 likes, publicado en noviembre de 2026, que sirve como punto de partida para experimentos posteriores de RFT y GRPO del mismo autor. La model card advierte explicitamente que la integridad de los ficheros fue verificada por hash, pero que nadie ha cargado ni ejecutado el modelo desde este repositorio.

El interés principal para desarrolladores e investigadores radica en que documenta un pipeline de post-entrenamiento (SFT → RFT → GRPO) sobre un entorno de agente con estado, con evaluaciones reproducible mediante vLLM y un grader externo publicado en GitHub. No es un modelo de propósito general recomendable para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens, pero no se confirma aqui) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en bf16 |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Apache-2.0 (modelo base tambien Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors`, bf16), config.json, generation_config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507` en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`, un transformer decoder-only de aproximadamente 4B parametros. Sobre esa base se aplico un ajuste fino supervisado (SFT-v2) mediante LoRA, cuyos pesos se fusionaron posteriormente en bf16 para producir un checkpoint completo `Qwen3ForCausalLM`, no un adaptador separado. El entrenamiento se realizo dentro de un entorno de cuentas por pagar con estado (stateful accounts payable environment), descrito en el articulo asociado, con un conjunto de 200 casos de test de los cuales 185 se usaron en la evaluacion primaria.

El stack software empleado, segun la model card, fue torch 2.13.0, transformers 5.20.2, PEFT 0.21.2, TRL 1.16.0 y vLLM 0.30.0. Las evaluaciones sirvieron el modelo con vLLM en bf16 aplicando adaptadores en tiempo de ejecucion con `enable_lora=True` y `max_lora_rank=32`. Este checkpoint es la base de partida para los experimentos posteriores del autor (RFT, semillas de GRPO y un segundo SFT), cuyos adaptadores cargan sobre el. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta etapa.

## Capacidades

- Generacion de texto conversacional en formato chat (incluye `chat_template.jinja`).
- Uso de herramientas (tool use / function calling) orientado a operaciones de cuentas por pagar.
- Razonamiento multi-paso dentro de un entorno con estado (stateful environment), con capacidad de encadenar acciones y observar resultados.
- Especializacion en tareas de accounts payable: investigacion de recibos (receipt investigation) y gestion de casos dentro del entorno descrito en el paper.
- Capacidades multilingues: no disponibles en la informacion proporcionada; no se declaran idiomas en la model card.
- Modo thinking explicito, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion academica sobre post-entrenamiento de agentes: el modelo sirve como referencia SFT-v2 para reproducir los experimentos del paper, comparando SFT frente a RFT y GRPO sobre el mismo entorno de cuentas por pagar.
- Punto de partida para ajustes posteriores: cualquier adaptador LoRA de los experimentos derivados (por ejemplo `mujeebk/ap-env-grpo-seed1-adapter`) carga directamente sobre este checkpoint, lo que simplifica pipelines de experimentacion encadenada.
- Evaluacion de tool use en dominios financieros: permite medir la fiabilidad de llamadas a funciones y la resolucion de casos con evidencia incompleta en un entorno controlado con grader externo.
- Desarrollo de agentes de cuentas por pagar en prototipos: con 4B parametros y tool calling, puede integrarse en un entorno de pruebas para automatizar la verificacion de recibos y la conciliacion de facturas antes de escalar a produccion.
- Banco de pruebas de robustez: al estar entrenado con evidencia incompleta, es util para estudiar como un modelo pequeno decide cuando actuar y cuando abstenerse, un comportamiento critico en automatizacion financiera.
- Inferencia eficiente en hardware modesto: con ~4B parametros en bf16 (unos 8 GB de pesos) cabe en GPUs consumer de gama alta, lo que facilita experimentacion local sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el modelo obtuvo 185 de 200 casos correctos en la evaluacion primaria del entorno de cuentas por pagar, sin detallar la metrica exacta ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bf16 (tamano del repositorio 8,1 GB); alrededor de 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits, estimaciones orientativas no verificadas para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para servir con vLLM en bf16; RTX 4090 y RTX 3090 son suficientes para inferencia en bf16 de un modelo de 4B.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), y en configuraciones de 8 bits o 4 bits en GPUs de 8 GB.
- Opciones de despliegue: vLLM 0.30.0 con `enable_lora=True` y `max_lora_rank=32` (configuracion usada en las evaluaciones), transformers con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")`, y TGI (el tag `text-generation-inference` esta presente). llama.cpp y Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mujeebk/ap-env-sft-v2` | ~4B | No disponible | Apache-2.0 | Hugging Face (2 descargas) | SFT especializado en accounts payable |
| `Qwen/Qwen3-4B-Instruct-2507` | ~4B | 262.144 tokens (segun modelo base) | Apache-2.0 | Hugging Face, ampliamente distribuido | Modelo generalista de referencia; base de este ajuste |
| `mujeebk/ap-env-grpo-seed1-adapter` | Adaptador LoRA sobre ~4B | No disponible | No disponible | Hugging Face | Adaptador GRPO del mismo autor; requiere cargar sobre este checkpoint |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte que la integridad de los ficheros fue verificada por hash, pero que nadie ha cargado ni ejecutado el modelo desde este repositorio; el funcionamiento no esta validado de forma independiente.
- Modelo de investigacion con 2 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Especializacion muy estrecha en cuentas por pagar y tool use; su rendimiento fuera de ese dominio no esta documentado.
- Idiomas soportados no declarados; no se recomienda asumir capacidades multilingues.
- Riesgo de alucinacion no cuantificado; en un dominio financiero, cualquier accion automatizada debe ir acompanada de validacion humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia Apache-2.0 que debe respetarse igualmente.
- El checkpoint esta en bf16 sin versiones cuantizadas publicadas; desplegarlo en GPUs de gama baja requiere cuantizacion propia no verificada.
- Fecha de publicacion (noviembre de 2026) y stack software (torch 2.13.0, transformers 5.20.2, vLLM 0.30.0) pueden requerir entornos relativamente recientes para reproducir las evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mujeebk/ap-env-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador GRPO del mismo autor: https://huggingface.co/mujeebk/ap-env-grpo-seed1-adapter
- Repositorio de codigo, entorno, grader y casos congelados: https://github.com/mujeeb-k/ap-hyperbolic-time-chamber
