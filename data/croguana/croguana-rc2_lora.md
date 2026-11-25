# croguana/croguana-RC2_lora

## Resumen

CroGuana RC2 es un adaptador LoRA (PEFT) para el modelo base gordicaleksa/YugoGPT, un transformer denso de arquitectura Mistral 7B (~7,2 mil millones de parametros) preentrenado en variantes BCMS (bosnio, croata, montenegrino y serbio). El adaptador afina el modelo base para generar conversaciones en croata (hrvatski), y forma parte de la serie experimental CroGuana desarrollada por el autor independiente Tomislav Kraljevic Shome (bajo el alias "croguana"). El primer modelo de la familia se entreno el 3 de octubre de 2024, lo que lo situa entre los primeros modelos de chat en croata con pesos abiertos.

Este repositorio concreto contiene unicamente el adaptador LoRA (r=16, alpha=32), no los pesos completos. Para utilizarlo es necesario cargar el modelo base YugoGPT y aplicar el adaptador mediante PEFT. El autor publica tambien una version fusionada (croguana/croguana-RC2) y una version cuantizada en GGUF (croguana/croguana-RC2-gguf) para su uso con llama.cpp u Ollama.

La relevancia de esta ficha es acotada y fundamentalmente documental: el propio autor declara el modelo como "altamente experimental", sin alineacion de seguridad (RLHF/DPO), con errores factuales y aritmeticos, y lo publica para documentar el proceso de desarrollo, no para su uso practico. La licencia CC BY-SA 4.0 y las advertencias explicitas del autor limitan su aplicacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral 7B, modelo base YugoGPT); adaptador LoRA (PEFT) |
| Parametros totales | ~7,2 mil millones (modelo base); el adaptador LoRA no especifica numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible para este adaptador; el repo hermano croguana-RC2-gguf ofrece Q5_K_M |
| Idiomas soportados | croata (hr); el modelo base es BCMS (bosnio, croata, montenegrino, serbio) |
| Licencia | CC BY-SA 4.0 (modelo base YugoGPT: Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre YugoGPT, un modelo transformer denso de tipo Mistral 7B con aproximadamente 7,2 mil millones de parametros, preentrenado en datos BCMS. El afinamiento se realizo mediante LoRA con rango 16 y alpha 32, utilizando Unsloth y TRL. El formato de prompt es un esquema de bloques simple con las marcas `### Korisnik:` (usuario) y `### AI asistent:` (asistente), repetible para conversaciones multi-turno.

El autor indica explicitamente que el conjunto de datos de afinamiento es pequeno y los entrenamientos cortos, sin ejemplos de razonamiento ni de uso de herramientas. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO; de hecho, el autor afirma que el modelo carece de alineacion de seguridad. No se describe ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, etc.) en la model card.

## Capacidades

- Generacion de texto conversacional en croata, con formato de chat de bloques `### Korisnik:` / `### AI asistent:`.
- Conversacion multi-turno mediante repeticion de bloques de prompt.
- No soporta tool calling ni function calling (el autor confirma ausencia de ejemplos de uso de herramientas).
- No soporta razonamiento multi-paso ni trazas de razonamiento (no entrenado con ellas).
- Capacidad aritmetica muy debil, incluso en sumas simples (declarado por el autor).
- Capacidades multilingues limitadas al croata y variantes BCMS; puede mezclar croata con serbio o bosnio.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- No esta alineado en seguridad.

## Casos de uso

- Documentacion de experimentos de afinamiento: el adaptador sirve como referencia reproducible para estudiar como se aplica LoRA (r=16, alpha=32) sobre YugoGPT con Unsloth y TRL, y para comparar con las versiones v1 (croguana_lora_init) y v2 (croguana_lora3).
- Investigacion linguistica sobre croata: permite generar muestras de texto conversacional en croata para analisis de calidad, cobertura lexica o deteccion de mezcla con variantes serbias y bosnias.
- Evaluacion de riesgos de modelos sin alineacion: util para estudiar empiricamente el comportamiento de un modelo sin RLHF/DPO (alucinaciones, errores aritmeticos) en entornos controlados de laboratorio.
- Reproduccion de la familia CroGuana: cargar el adaptador sobre YugoGPT permite replicar el pipeline exacto descrito en la model card y validar la fusion en la version croguana-RC2.
- Pruebas de integracion PEFT: sirve para verificar flujos de carga con `PeftModel.from_pretrained` sobre un modelo base de 7B en bfloat16 con `device_map="auto"`.
- Comparacion de formatos de despliegue: junto con el repo hermano croguana-RC2-gguf (Q5_K_M), permite contrastar la inferencia del adaptador PEFT frente a la version cuantizada en llama.cpp u Ollama.

Ninguno de estos casos constituye uso en produccion; el autor prohibe explicitamente aplicaciones comerciales sin comprobaciones de seguridad adicionales y cualquier uso critico (medicina, derecho, control de maquinas, decision automatizada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 0,2 GB), pero requiere cargar el modelo base YugoGPT (~7,2B parametros) para inferencia.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 14-15 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits (no documentada para este adaptador) se reduciria a unos 4-5 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para bfloat16 sin cuantizacion; RTX 4090 (24 GB) suficiente para bfloat16 con margen ajustado; RTX 3090 (24 GB) similar.
- En GPU de consumo con 8-12 GB seria necesario recurrir a cuantizacion (por ejemplo, la version GGUF Q5_K_M del repo hermano croguana-RC2-gguf).
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), llama.cpp u Ollama mediante la version GGUF, y potencialmente vLLM o TGI con el modelo fusionado (no documentado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| croguana/croguana-RC2_lora (este) | ~7,2B (base) | no disponible | CC BY-SA 4.0 | Hugging Face, adaptador PEFT | Experimental, sin alineacion, solo croata |
| croguana/croguana-RC2 | ~7,2B | no disponible | CC BY-SA 4.0 | Hugging Face, safetensors BF16 | Version fusionada del mismo adaptador |
| croguana/croguana-RC2-gguf | ~7,2B | no disponible | CC BY-SA 4.0 | Hugging Face, GGUF Q5_K_M | Version cuantizada para llama.cpp/Ollama |
| gordicaleksa/YugoGPT | ~7,2B | no disponible | Apache-2.0 | Hugging Face | Modelo base BCMS, sin afinamiento de chat croata |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos con otros modelos de chat en croata; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo declarado "altamente experimental" por el autor; publicado para documentar el desarrollo, no para uso.
- Errores factuales y aritmeticos frecuentes, incluso en sumas simples.
- Alta propension a alucinaciones; el autor no garantiza la exactitud de las salidas.
- Sin alineacion de seguridad (no se aplico RLHF ni DPO).
- Conjunto de datos de afinamiento pequeno y entrenamientos cortos.
- Sin ejemplos de razonamiento ni de uso de herramientas; debil en razonamiento multi-paso.
- Puede mezclar croata con serbio o bosnio debido al preentrenamiento BCMS del modelo base.
- Licencia CC BY-SA 4.0: impone obligaciones de compartir bajo la misma licencia las obras derivadas; el autor prohibe uso comercial sin comprobaciones de seguridad adicionales y prohibe explicitamente aplicaciones criticas (medicina, derecho, control de maquinas, decision automatizada).
- El autor declina toda responsabilidad civil o penal por danos derivados del uso del modelo, en linea con la normativa croata de implementacion del Reglamento de IA.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta para produccion.

## Enlaces

- Repositorio Hugging Face (este adaptador): https://huggingface.co/croguana/croguana-RC2_lora
- Modelo fusionado RC2: https://huggingface.co/croguana/croguana-RC2
- Version GGUF RC2: https://huggingface.co/croguana/croguana-RC2-gguf
- Modelo base YugoGPT: https://huggingface.co/gordicaleksa/YugoGPT
- CroGuana v1 (LoRA inicial): https://huggingface.co/croguana/croguana_lora_init
- CroGuana v1 fusionado: https://huggingface.co/croguana/croguana
- CroGuana v1 GGUF: https://huggingface.co/croguana/croguana-gguf
- CroGuana v2 (LoRA): https://huggingface.co/croguana/croguana_lora3
- CroGuana v2 fusionado: https://huggingface.co/croguana/croguana2
- CroGuana v2 GGUF: https://huggingface.co/croguana/croguana2-gguf
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
