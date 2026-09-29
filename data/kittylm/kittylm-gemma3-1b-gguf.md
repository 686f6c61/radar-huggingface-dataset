# KittyLM/kittylm-gemma3-1b-gguf

## Resumen

KittyLM-1B GGUF (kittylm-gemma3-1b) es la distribucion en formato GGUF de KittyLM/kittylm-gemma3-1b, un ajuste fino mediante LoRA sobre google/gemma-3-1b-it orientado a un estilo conversacional concreto ("kitten-speak", habla gatuna). El modelo lo publica el usuario KittyLM y resuelve un problema muy acotado: ofrecer una personalidad de chat ligera y ejecutable en local, no un asistente generalista. El repositorio contiene unicamente el archivo cuantizado en Q4_K_M, pensado para usarse con Ollama, llama.cpp y LM Studio.

La relevancia de esta ficha es practica: se trata de un modelo de ~1.000 millones de parametros (999.885.952 exactos) que cabe en cualquier equipo, incluso sin GPU dedicada, lo que lo convierte en un ejemplo claro de finetune de persona sobre una base pequena cuantizada a 4 bits. Al derivar de Gemma 3 1B, hereda la arquitectura transformer decoder-only y el soporte de chat de la familia, pero no aporta mejoras de razonamiento ni de codigo: su valor esta en el estilo de respuesta.

Conviene subrayar que el modelo no publica resultados de evaluacion propios, no declara idiomas soportados y no especifica si conserva capacidades como tool calling o vision (Gemma 3 1B es text-only). Por tanto, debe tratarse como un modelo de rol y compania para uso experimental, no como una pieza para pipelines de produccion que exijan fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base google/gemma-3-1b-it) con adaptador LoRA de KittyLM fusionado |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base google/gemma-3-1b-it soporta 32.768 tokens segun la documentacion de Gemma 3 |
| Tipos de cuantizacion | Q4_K_M (GGUF); la model card indica que podrian existir quants de mayor bit, pero el repo solo distribuye el Q4_K_M |
| Idiomas soportados | no disponible (heredados del base Gemma 3, sin confirmar en la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (archivo `kittylm-gemma3-1b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de google/gemma-3-1b-it: un transformer decoder-only de aproximadamente 1.000 millones de parametros con atencion causal y modo de chat instruct. Sobre esa base, KittyLM aplica un ajuste fino con LoRA para inducir un registro conversacional de tipo "kitten-speak". La model card de este repositorio no detalla la configuracion del adaptador (rango, alpha, capas objetivo) ni si los pesos LoRA se fusionaron en el checkpoint final; el resultado distribuido es un unico GGUF cuantizado en Q4_K_M, lo que implica que el adaptador ya esta integrado en los pesos.

Respecto a los datos de entrenamiento, la model card enlaza el dataset KittyLM/kittylm-data y un `system_prompt.txt` alojado en ese mismo dataset, que debe aplicarse para reproducir el comportamiento previsto. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencia humana. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de la cuantizacion GGUF de la base.

## Capacidades

- Generacion de texto conversacional en espanol o ingles (idioma no declarado oficialmente), con estilo "kitten-speak" propio del finetune.
- Dialogo multi-turno, heredado del modo instruct de google/gemma-3-1b-it.
- Personalizacion de personaje mediante el `system_prompt.txt` distribuido en el dataset KittyLM/kittylm-data.
- Ejecucion local en CPU, GPU integrada o GPU dedicada gracias al formato GGUF Q4_K_M.
- Integracion directa con Ollama, llama.cpp y LM Studio mediante el archivo GGUF.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso explicito.
- No hay capacidades de vision, audio ni modo "thinking" declaradas; el adaptador no anade modalidades sobre la base text-only.
- Capacidades multilingues: no disponibles (sin confirmacion en la model card).

## Casos de uso

- Mascota virtual o chatbot de compania en local: el modelo esta disenado para mantener conversaciones con una personalidad gatuna; se puede empaquetar con Ollama y un `system_prompt` propio para uso domestico sin conexion a la nube.
- Personajes de videojuego indie o narrativa interactiva: al ser un LoRA de rol, encaja como motor de dialogo para NPCs con voz caracteristica, ejecutandose en el mismo equipo del jugador.
- Demo de integracion de GGUF en herramientas: sirve para validar el flujo `hf download` + `ollama create` + `ollama run` descrito en la model card antes de invertir en modelos mayores.
- Prototipado rapido en portatiles sin GPU: con ~0,8 GB de pesos, permite iterar sobre prompts y plantillas de chat en cualquier maquina, incluida una Raspberry Pi.
- Proyectos de generacion creativa con estilo: textos breves, respuestas de comunidad o contenido para redes con un tono "kitten-speak" consistente.
- Ejemplo didactico de pipeline LoRA + cuantizacion: util para explicar como se pasa de un checkpoint HuggingFace a un GGUF Q4_K_M y como se aplica una plantilla de chat personalizada.
- Pruebas de despliegue en edge o entornos sin GPU: sirve como banco de pruebas de llama.cpp en CPU para medir latencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de la persona, y tampoco se han encontrado comparativas numericas especificas de este finetune en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB con la cuantizacion Q4_K_M (el repositorio completo ocupa 0,8 GB). La busqueda web asocia la base Gemma 3 1B GGUF a unos 0,6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria sirve; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con enorme holgura. No es necesario hardware de centro de datos.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en graficas integradas.
- CPU: viable en inferencia solo-CPU con llama.cpp, con RAM inferior a 2 GB para el modelo.
- Opciones de despliegue: llama.cpp (`llama-cli -m <archivo>.gguf`), Ollama (via `Modelfile`), LM Studio. Compatible con endpoints segun la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| KittyLM/kittylm-gemma3-1b-gguf | ~1B (999.885.952) | no disponible (base 32.768 tokens) | gemma | GGUF Q4_K_M | Finetune de persona "kitten-speak" |
| KittyLM/kittylm-gemma3-1b | ~1B | no disponible | gemma | safetensors (base del GGUF) | Finetune de persona, sin cuantizar |
| google/gemma-3-1b-it | ~1B | 32.768 tokens segun documentacion de Gemma 3 | gemma | safetensors | Asistente generalista instruct |
| Cuantizaciones GGUF de gemma-3-1b-it (ggml-org, bartowski) | ~1B | 32.768 tokens | gemma | GGUF (multiples quants) | Asistente generalista en local |

Los datos de rendimiento comparado no estan disponibles; la comparacion se limita a parametros, contexto, licencia, formato y proposito.

## Limitaciones y advertencias

- El ajuste de persona "kitten-speak" reduce la utilidad general: puede degradar el rendimiento en tareas de razonamiento, codigo o matematicas respecto a la base google/gemma-3-1b-it.
- Riesgo de alucinacion elevado, tipico de un modelo de ~1B de parametros sin evaluaciones publicadas.
- Limitacion de contexto: la model card no declara la ventana efectiva; aunque la base soporte 32.768 tokens, no se garantiza que el finetune conserve ese comportamiento.
- Idiomas no declarados: no hay confirmacion del soporte multilingue ni de la calidad en espanol.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use; es necesario revisar las condiciones y obligaciones de atribucion antes de desplegarlo en produccion.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin evidencia externa de calidad o estabilidad.
- Metadatos potencialmente anomalos: la fecha de creacion indicada (2026-09-29) es posterior a la de redaccion habitual de fichas, lo que sugiere un posible error de registro.
- Requiere aplicar la plantilla de chat y el `system_prompt.txt` del dataset KittyLM/kittylm-data; omitirlos puede producir respuestas fuera de la persona esperada.
- No hay soporte documentado de tool calling, agentes ni function calling; no debe integrarse en pipelines que dependan de estas capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KittyLM/kittylm-gemma3-1b-gguf
- Modelo base del finetune: https://huggingface.co/KittyLM/kittylm-gemma3-1b
- Modelo original de Google: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento y `system_prompt.txt`: https://huggingface.co/datasets/KittyLM/kittylm-data
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Cuantizaciones GGUF de referencia de gemma-3-1b-it (ggml-org): https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF
- Cuantizaciones GGUF de referencia de gemma-3-1b-it (bartowski): https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF
- Repositorio auxiliar sobre Gemma 3: https://github.com/hackur/gemma3
- Ficha comparativa en LLM Explorer: https://llm-explorer.com/model/unsloth%2Fgemma-3-1b-it-GGUF,4GJTW1q2LW9FZIk3bjBXT4
