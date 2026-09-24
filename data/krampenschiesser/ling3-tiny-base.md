# krampenschiesser/ling3-tiny-base

## Resumen

ling3-tiny-base es un checkpoint base publicado por el usuario krampenschiesser en HuggingFace, derivado del modelo inclusionAI/Ling-3.0-tiny. No es un modelo afinado ni alineado: el propio autor lo describe como la base para fine-tuning y aprendizaje por refuerzo, y advierte explicitamente de que no esta pensado para uso general porque, por ahora, es mas lento y mas grande que el modelo original. Su proposito es servir de punto de partida reproducible para entrenamiento posterior, no de asistente listo para produccion.

Tecnicamente es un modelo de arquitectura etiquetada como bailing_hybrid (un transformer con mezcla de expertos y atencion hibrida, segun el tag del repositorio y la mencion a expertos en la model card), con 7.893.392.800 parametros totales almacenados en safetensors y un repositorio de 15,8 GB. La modificacion principal respecto al modelo base es un aumento del numero de expertos activos por token (top-k mas alto) y una adaptacion del codigo Python para que funcione en entrenamiento y con transformers 5. El repositorio incluye codigo personalizado (custom_code), por lo que requiere trust_remote_code.

Su relevancia es acotada y muy especifica: interesa a equipos que quieran investigar el enrutamiento de expertos en modelos MoE, reproducir recetas de RL sobre la familia Ling-3.0 o disponer de un punto de partida controlado antes de aplicar SFT. Con cero descargas y cero likes en el momento de la consulta, y con fecha de creacion y actualizacion del 24 de septiembre de 2026 (ambas el mismo dia), debe tratarse como un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (transformer con mezcla de expertos y atencion hibrida, segun tag del repositorio) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible (la model card indica que se aumenta el numero de expertos activos por token respecto al modelo base, pero no especifica la cifra) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 15,8 GB, compatible con pesos en bf16/fp16 de ~7,9B parametros) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura bailing_hybrid heredada de inclusionAI/Ling-3.0-tiny, que combina capas de mezcla de expertos con un esquema de atencion hibrida. La unica innovacion declarada por el autor es el aumento del top-k, es decir, un mayor numero de expertos activados por token en cada paso de enrutamiento, lo que incrementa la capacidad efectiva del modelo por token a costa de mas computo por inferencia. Ese cambio explica la advertencia de la model card: el checkpoint es mas lento y mas grande que el original, porque activa mas parametros por token.

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor indica que el repositorio es la base para fine-tuning y RL, es decir, un checkpoint previo a esas fases. Tampoco se detalla el mecanismo concreto de atencion hibrida, la distribucion de expertos por capa ni la dimension de cabeza. Lo unico documentado a nivel de implementacion es la adaptacion del codigo Python para que soporte entrenamiento y funcione con transformers 5, junto con la inclusion de codigo personalizado (custom_code), lo que obliga a cargar el modelo con trust_remote_code=True.

## Capacidades

Al ser un checkpoint base sin alineacion, sus capacidades son las de un modelo de lenguaje preentrenado, no las de un asistente:

- Generacion de texto por continuacion autocompletada (modelado de lenguaje causal); no dispone de plantilla de chat ni de formato instruct documentado.
- Razonamiento y conocimiento general: no hay datos publicados que permitan cuantificar su nivel en matematicas, codigo o conocimiento enciclopedico.
- Soporte de tool calling / function calling: no disponible; no se documenta ningun formato de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay plantilla de agente ni ejemplos de uso agentico.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidad especial: es un modelo base destinado a fine-tuning y a aprendizaje por refuerzo, con enrutamiento MoE de top-k ampliado, lo que lo hace util como banco de pruebas de entrenamiento mas que como modelo final.

## Casos de uso

- Fine-tuning supervisado (SFT) sobre dominio propio: el checkpoint esta pensado explicitamente como base para fine-tuning, de modo que un equipo puede aplicar SFT con datos internos (legal, medico, industrial) sin partir de cero ni heredar una alineacion generalista que habria que deshacer.
- Investigacion en aprendizaje por refuerzo: al estar disenado como base para RL, encaja en pipelines de GRPO, PPO o DPO donde se necesita un modelo inicial con licencia permisiva y pesos abiertos.
- Estudio del enrutamiento MoE: al haber incrementado el top-k, permite comparar experimentalmente como afecta el numero de expertos activos por token a la calidad, la latencia y el uso de memoria, usando el modelo original como control.
- Generacion de datos sinteticos para destilacion: un modelo base de 7,9B parametros puede emplearse para producir grandes volumenes de texto en un dominio concreto y despues destilarlos hacia un modelo mas pequeno; su licencia MIT elimina friccion legal en ese flujo.
- Reproducibilidad academica de la familia Ling-3.0: sirve para replicar experimentos de la serie y verificar afirmaciones sobre atencion hibrida y MoE en un entorno controlado y versionado.
- Ajuste con LoRA o QLoRA en hardware de una sola GPU: al tener 7,9B parametros, las variantes de bajo rango permiten adaptarlo en una GPU de 24 GB para prototipado rapido antes de escalar a entrenamiento completo.
- Banco de pruebas de compatibilidad con transformers 5: el autor ha adaptado el codigo para la nueva version de la libreria, por lo que es util para validar integraciones tempranas y detectar incompatibilidades en el ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni tampoco mediciones de latencia o throughput. La unica indicacion de rendimiento es cualitativa: la model card senala que el modelo es mas lento y mas grande que el original debido al mayor numero de expertos activos por token.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,8 GB solo para los pesos (7,89B parametros x 2 bytes), a los que hay que sumar cache KV y activaciones. En la practica exige una GPU de 24 GB o superior para funcionar con comodidad.
- GPUs consumer: cabe en una RTX 4090, RTX 3090 o RTX A6000 (24 GB) en precision bf16 con lotes pequenos. En GPUs de 12-16 GB solo seria viable mediante cuantizacion, que no esta publicada en el repositorio.
- GPUs de datacenter: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia con lotes grandes o contextos largos.
- Fine-tuning completo: los estados del optimizador AdamW en fp32 anaden del orden de 8 bytes por parametro (unos 63 GB adicionales), por lo que se necesita entrenamiento distribuido con FSDP o DeepSpeed ZeRO-3 sobre multiples GPUs de 80 GB.
- Fine-tuning parametro-eficiente: LoRA o QLoRA deberian caber en una unica GPU de 24 GB, siempre que la arquitectura personalizada sea compatible con las librerias de cuantizacion.
- Opciones de despliegue: la via documentada es transformers 5 con trust_remote_code=True, dado el uso de codigo personalizado. El soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no esta confirmado y depende de que esos motores reconozcan la arquitectura bailing_hybrid.
- Latencia y throughput: no disponible. Cualquier cifra debe medirse localmente, teniendo en cuenta que el top-k ampliado penaliza el tiempo por token respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| krampenschiesser/ling3-tiny-base | 7,89B | no disponible | MIT | Base para fine-tuning y RL, top-k ampliado | HuggingFace, codigo personalizado |
| inclusionAI/Ling-3.0-tiny | no disponible | no disponible | no disponible | Modelo original de referencia | HuggingFace |
| Otras alternativas MoE abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o parametros activos. La unica comparacion fundamentada es interna: frente a inclusionAI/Ling-3.0-tiny, esta variante mantiene la arquitectura pero aumenta los expertos activos por token, lo que la hace mas costosa por token y, segun el autor, mas lenta.

## Limitaciones y advertencias

- No apto para uso general: la propia model card indica que no esta pensado para uso general porque es mas lento y mas grande que el modelo original.
- Sin alineacion: es un checkpoint base, por lo que no cabe esperar formato instruct, rechazo de peticiones daninas ni comportamiento de asistente.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje preentrenado; sin evaluaciones publicadas no puede acotarse su magnitud.
- Idiomas, contexto y parametros activos: no documentados. Planificar cualquier integracion exige medirlos empiricamente.
- Requiere codigo personalizado: la etiqueta custom_code implica trust_remote_code=True, lo que supone ejecutar codigo del autor y anade riesgo de seguridad y de mantenimiento.
- Compatibilidad fragil: la adaptacion esta hecha para transformers 5; en versiones anteriores o en motores de inferencia de terceros puede no cargar.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar la licencia y las condiciones del modelo base inclusionAI/Ling-3.0-tiny, ya que la model card de este derivado solo declara MIT.
- Madurez nula: cero descargas, cero likes y creacion y actualizacion el mismo dia (24 de septiembre de 2026). No hay evidencia de validacion por terceros.
- Coste de inferencia superior: el aumento del top-k incrementa el numero de parametros activos por token, con el consiguiente impacto en VRAM y latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krampenschiesser/ling3-tiny-base
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
