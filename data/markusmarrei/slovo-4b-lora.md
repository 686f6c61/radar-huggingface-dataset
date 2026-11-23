# MarkusMarrei/slovo-4b-lora

## Resumen

Slovo-4B es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B para dotarlo de capacidades en 46 lenguas indígenas y regionales de la Federación Rusa, además del ruso y el inglés. Lo desarrolla el usuario MarkusMarrei y se publica bajo licencia Apache 2.0. El problema que aborda es la escasa representación de lenguas minoritarias (tártaro, bashkir, chuvasio, yakuto, checheno, avar, buryat, udmurto, komi, carelio, entre otras) en los modelos multilingües de gran escala, ofreciendo un ajuste ligero y desacoplable sobre una base ya competente.

El repositorio contiene únicamente los pesos del adaptador (132 MB, ~34 millones de parámetros entrenables), no los pesos completos. El autor publica además una versión consolidada en FP16 (MarkusMarrei/slovo-4b) y cuantizaciones GGUF (MarkusMarrei/slovo-4b-GGUF) para su uso en llama.cpp, Ollama y LM Studio. El contexto, la arquitectura y el resto de especificaciones heredan las del modelo base Qwen3-4B, del que no se aportan datos detallados en la información disponible.

La relevancia del proyecto reside en su enfoque de eficiencia paramétrica: con un único ajuste de rango 64 sobre todas las proyecciones lineales se cubren 46 lenguas, lo que permite a investigadores y desarrolladores adjuntar o desacoplar el adaptador dinámicamente sobre la base Qwen3, o continuar el ajuste fino con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | ~4 000 millones (modelo base Qwen3-4B) + ~34 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (hereda la del modelo base Qwen3-4B) |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (MarkusMarrei/slovo-4b-GGUF); niveles concretos no disponibles |
| Idiomas soportados | 46 lenguas: ru, tt, ba, cv, sah, ce, inh, av, lez, dar, lbe, tab, kum, krc, nog, kbd, ady, abq, os, tyv, bxr, xal, alt, kjh, chm, myv, mdf, udm, kpv, koi, krl, vep, yrk, eve, evn, gld, ckl, kpy, itl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); FP16 consolidado y GGUF en repositorios asociados |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B, un transformer decoder-only de ~4 000 millones de parámetros. La configuración LoRA emplea rango r=64, alpha=128, dropout 0.05 y módulos objetivo que cubren las siete proyecciones lineales de atención y feed-forward (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), lo que suma aproximadamente 34 millones de parámetros entrenables. El tipo de tarea es CAUSAL_LM y la librería de referencia es PEFT.

El entrenamiento se realizó durante 2 125 pasos, equivalentes a 1,0 época sobre 36 000 pares de instrucciones, con una reducción de la pérdida desde 5,50 hasta 0,0446. No se detalla en la información disponible la composición del dataset, el reparto por lengua, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional en ruso, inglés y 44 lenguas indígenas y regionales de Rusia.
- Respuesta a instrucciones mediante plantilla de chat (apply_chat_template) con roles system, user y assistant.
- Generación de contenido cultural y lingüístico: refranes, traducciones y materiales en lenguas minoritarias.
- Soporte multilingüe amplio dentro de un único adaptador, sin necesidad de conmutar entre varios modelos.
- Capacidad de adjuntar y desacoplar el adaptador en tiempo de ejecución sobre la base Qwen3, permitiendo alternar entre el comportamiento base y el ajustado.
- Posibilidad de continuar el ajuste fino sobre el adaptador con datasets propios.
- Herencia de las capacidades del modelo base Qwen3-4B (razonamiento, código, matemáticas, tool calling), si bien no se documentan explícitamente en esta ficha por falta de datos específicos del adaptador.

## Casos de uso

- Digitalización y preservación lingüística: generación de textos, refranes y materiales didácticos en lenguas como buryat, udmurto o carelio, aprovechando que el adaptador cubre 46 lenguas con un único conjunto de pesos de 132 MB.
- Asistentes conversacionales regionales: despliegue de un chat de atención ciudadana en tártaro, bashkir o chuvasio sobre la base Qwen3-4B, adjuntando el adaptador mediante PEFT y sirviendo respuestas multi-turno con la plantilla de chat incluida.
- Traducción asistida ruso–lengua minoritaria: el ajuste sobre 36 000 pares de instrucciones permite emplear el modelo para tareas de traducción y paráfrasis entre el ruso y las lenguas listadas, útil en administraciones y ONG.
- Investigación en lingüística computacional: al publicarse los deltas de bajo rango, los investigadores pueden inspeccionar los pesos, medir el olvido catastrófico sobre la base y comparar el comportamiento por lengua.
- Ajuste fino continuado por dominio: equipos que necesiten especializar aún más el modelo (por ejemplo, terminología jurídica o médica en una lengua concreta) pueden partir del adaptador y continuar el entrenamiento con sus propios datos.
- Despliegue en entornos con recursos limitados: la existencia de una versión GGUF en repositorio separado permite ejecutar el modelo cuantizado en llama.cpp, Ollama o LM Studio, facilitando su uso en estaciones de trabajo sin GPU de gran capacidad.
- Educación y aprendizaje de lenguas: generación de ejercicios, traducciones y explicaciones gramaticales en lenguas minoritarias para plataformas educativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 132 MB, pero requiere cargar el modelo base Qwen3-4B (~4 000 millones de parámetros) para inferencia.
- VRAM estimada para el modelo base en FP16: en torno a 8 GB solo para pesos, más overhead de activaciones y caché KV; el dato exacto no está disponible en la información proporcionada.
- VRAM estimada para la versión GGUF cuantizada: depende del nivel de cuantización elegido (no disponible en la información); los niveles Q4 habituales de un modelo de 4B suelen caber en GPUs de consumo, pero no se confirma el detalle.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo base en FP16 encaja en GPUs tipo A100, H100 o RTX 4090.
- Despliegue: transformers + PEFT (según el quickstart del autor), llama.cpp, Ollama y LM Studio mediante la versión GGUF; vLLM y TGI no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Slovo-4B (LoRA) | ~4 000 M base + ~34 M adaptador | no disponible | 46 (ru, en y lenguas de Rusia) | Apache 2.0 | safetensors (PEFT), FP16 y GGUF |
| Qwen3-4B (base) | ~4 000 M | no disponible en esta ficha | multilingüe general (sin cobertura específica de lenguas minoritarias) | Apache 2.0 | safetensors, GGUF |
| Alternativas especializadas en lenguas minoritarias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Slovo-4B frente a otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador; para usarlo es imprescindible cargar el modelo base Qwen/Qwen3-4B, lo que multiplica los requisitos de memoria frente a los 132 MB del adaptador.
- No se documentan métricas de calidad por lengua; la cobertura de 46 idiomas con 36 000 pares de instrucciones sugiere un volumen de datos modesto por lengua, con riesgo de respuestas inconsistentes en las lenguas con menos recursos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en lenguas de bajos recursos donde el modelo base tiene poca exposición previa.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos presentes en los datos; no es posible evaluar sesgos conocidos con la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que la licencia del modelo base Qwen3-4B sea compatible en el contexto de despliegue concreto.
- El contexto máximo, los niveles de cuantización GGUF y el rendimiento medido no están disponibles; no deben asumirse valores sin verificarlos en los repositorios asociados.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria y de informes de uso en producción.

## Enlaces

- Repositorio del adaptador LoRA: https://huggingface.co/MarkusMarrei/slovo-4b-lora
- Modelo consolidado FP16: https://huggingface.co/MarkusMarrei/slovo-4b
- Cuantizaciones GGUF: https://huggingface.co/MarkusMarrei/slovo-4b-GGUF
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Librería PEFT: https://github.com/huggingface/peft
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
