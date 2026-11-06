# LZYYuBai/furina-2b

## Resumen

Furina 2B es un modelo de lenguaje afinado para roleplay y conversación, desarrollado por el usuario LZYYuBai y publicado en Hugging Face en formato GGUF para su uso con llama.cpp. Se trata de un ajuste sobre Qwen3.5-2B, el modelo base de 2.000 millones de parámetros de Alibaba, orientado a la generación de texto conversacional en chino (etiqueta de idioma principal: zh).

El modelo resuelve la necesidad de disponer de un modelo ligero, ejecutable en hardware de consumo, especializado en interacciones de roleplay y chat, un nicho donde los modelos de tamaño pequeño y cuantizados tienen gran demanda. Su licencia Apache 2.0, heredada del modelo base, permite su uso comercial sin restricciones adicionales.

Cabe destacar que el repositorio está marcado como restringido (gated), por lo que es necesario aceptar unas condiciones en Hugging Face antes de poder descargar los pesos. No se ha publicado una model card detallada con datos de entrenamiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3.5, no disponible el detalle exacto) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | Chino (zh); capacidad multilingüe heredada de Qwen3.5 no documentada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); tamano del repo: 3,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de la familia Qwen de Alibaba. El ajuste (fine-tuning) se ha realizado aparentemente con datos orientados a roleplay y conversación, aunque la ficha original no detalla el dataset empleado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. No hay informacion disponible sobre innovaciones tecnicas especificas introducidas en el ajuste.

La distribucion en GGUF permite ejecutar el modelo en CPU y GPU mediante llama.cpp, con soporte de cuantizacion por debajo de precisión completa, lo que reduce significativamente los requisitos de memoria.

## Capacidades

- Generacion de texto conversacional en chino, con especializacion en roleplay.
- Chat multi-turno (pipeline text-generation, etiqueta conversational).
- Compatibilidad con el ecosistema llama.cpp (inferencia local en CPU/GPU).
- Capacidades heredadas de Qwen3.5-2B (razonamiento, codigo, matematicas) presumiblemente presentes, aunque no documentadas para este ajuste.
- No hay informacion disponible sobre tool calling, soporte de agentes, vision, audio ni modo de pensamiento (thinking mode) para esta variante afinada.

## Casos de uso

- Roleplay interactivo en chino: el modelo esta afinado especificamente para mantener personajes ficticios en conversaciones largas, adecuado para chatbots de entretenimiento.
- Compañeros de conversacion en local: con ~1,88 B de parametros cabe en portatiles y equipos sin GPU dedicada mediante llama.cpp.
- Prototipado de chatbots: su tamano reducido permite iterar rapidamente en el desarrollo de agentes conversacionales antes de escalar a modelos mayores.
- Generacion de dialogos creativos: util para escritores que necesiten generar dialogos de personajes en chino como material de partida.
- Integracion en aplicaciones moviles o de escritorio: el formato GGUF facilita el despliegue embebido con backends como Ollama o LM Studio.
- Investigacion sobre fine-tuning de roleplay: sirve como ejemplo de ajuste ligero sobre Qwen3.5-2B para estudiar como el roleplay afecta a las capacidades base del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: con un tamano de repo de 3,3 GB en GGUF, el modelo completo cabe en GPUs de 4-6 GB de VRAM o en RAM de sistemas con 8 GB; las cuantizaciones mas agresivas (Q4 y similares) reducen aun mas el consumo.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060); no requiere GPUs de centro de datos.
- Consumer GPUs: si, es un modelo pensado para hardware de consumo gracias a su tamano de ~1,9 B de parametros y el formato GGUF.
- Despliegue: llama.cpp (libreria principal del repo), compatible indirectamente con Ollama, LM Studio y otros runtimes que consuman GGUF.
- Latencia y throughput: no disponible; al ser un modelo de ~2 B de parametros, se esperan velocidades altas incluso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| LZYYuBai/furina-2b | ~1,88 B | GGUF | Apache 2.0 | Roleplay / chat en chino |
| Qwen/Qwen3.5-2B (base) | ~2 B | Safetensors | Apache 2.0 | Modelo generalista |
| Otros fine-tunes de roleplay sobre Qwen | ~2 B | GGUF / Safetensors | Variable | Roleplay |

Frente a su modelo base, furina-2b aporta especializacion en roleplay a costa de posibles perdidas en tareas generales, y se distribuye unicamente en GGUF. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Idioma principal: chino (zh); el rendimiento en castellano o ingles no esta documentado y probablemente sea inferior o no garantizado.
- Riesgo de alucinacion: inherente a modelos de ~2 B de parametros, especialmente tras un fine-tuning de roleplay que puede degradar la factualidad.
- No hay model card detallada: se desconocen datos de entrenamiento, longitud de contexto y cuantizaciones exactas, lo que complica su evaluacion para produccion.
- Acceso restringido (gated): hay que aceptar condiciones en Hugging Face antes de descargar, lo que añade friccion al despliegue.
- Sesgos: no documentados; al tratarse de un modelo de roleplay, puede generar contenido ficticio o inapropiado si no se aplican salvaguardas.
- Uso comercial: permitido por la licencia Apache 2.0, aunque conviene revisar las condiciones del gating del repositorio.
- Adopcion minima: 0 descargas y 1 like en el momento de la ficha, sin historial comunitario que respalde su calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LZYYuBai/furina-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B

No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
