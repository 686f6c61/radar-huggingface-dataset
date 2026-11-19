# NovaCorp/SEX_ROLEPLAY.v4-3.2-1B

## Resumen

SEX_ROLEPLAY.v4-3.2-1B es un modelo de lenguaje de 1.498 millones de parámetros (1B) desarrollado por NovaCorp, especializado en generación de texto conversacional para roleplay NSFW. Se trata de un merge de pesos (no de un entrenamiento desde cero) construido con mergekit sobre la arquitectura Llama 3.2 de 1B, que combina cuatro modelos base: Nexesenex/Llama_3.2_1b_RandomLego_RP_R1_0.1, UmbrellaInc/Prototype-Virus.FINAL-3.2-1B, bunnycore/FuseChat-3.2-1B-Creative-RP y jtatman/llama-3.2-1b-lewd-mental-occult.

El modelo está diseñado explícitamente para eliminar los mecanismos de rechazo y censura del modelo instructivo original, orientándolo a conversaciones de rol adulto en español e inglés. La versión v4 introduce tres cambios técnicos respecto a versiones anteriores: sustitución del componente abliterated principal por Prototype-Virus.FINAL, elevación del parámetro `select_topk` de 0.1 a 0.65 en el filtrado SCE (conservando mayor señal efectiva de cada fuente) y una redistribución de pesos y densidades (RandomLego a 1.1, jtatman a 0.9, densidades a 0.95).

Su relevancia actual radica en el nicho de modelos pequeños (1B) de rol sin censura que quepan en hardware de gama baja, con soporte declarado para SillyTavern y KoboldCpp, y con formato GGUF y cuantización 4-bit disponibles. No es un modelo de propósito general: su ámbito es el roleplay conversacional y el contenido para adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parametros totales | 1.498.482.688 (1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (etiqueta declarada); GGUF disponible |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un merge de pesos construido con mergekit sobre la arquitectura Llama 3.2 de 1B (transformer decoder-only denso, 1.498 millones de parámetros). No se trata de un entrenamiento nuevo: los pesos finales resultan de la fusión de cuatro modelos, cada uno de los cuales aporta características distintas. `RandomLego` actúa como núcleo secundario de roleplay (peso 1.1 en v4), `Prototype-Virus.FINAL` aporta la reducción de censura (sustituyendo a la abliteración genérica de versiones previas), `FuseChat-Creative-RP` aporta la base conversacional y `jtatman/...-lewd-mental-occult` aporta estilo (peso reducido a 0.9 en v4 para evitar que opaque el roleplay).

El proceso de merge emplea filtrado SCE con `select_topk` elevado a 0.65 (frente a 0.1 en v3), lo que según el autor conserva una proporción mucho mayor de la señal efectiva de cada modelo fuente y reduce la pérdida de capacidad de seguimiento de instrucciones. Las densidades se fijan en 0.95 en todos los componentes. El componente Prototype-Virus.FINAL es a su vez una fusión SLERP entre `Prototype-Virus-ENFORCE` y `T-Virus_Epsilon.Strain`, orientada a anular protocolos de rechazo.

Los datos de entrenamiento no son directos del merge (que opera sobre pesos), sino heredados de los modelos base. La model card cita datasets de roleplay y conversación como `Nitral-AI/Active_RP-ShareGPT`, `PJMixers/hieunguyenminh_roleplay-deduped-ShareGPT`, `Chaser-cz/sonnet35-charcard-roleplay-sharegpt`, `Nitral-AI/RP_Alignment-ShareGPT`, `priveeai/pippa_sharegpt`, `Locutusque/sharegpt_gpt4_uncensored_cleaned` y `alexandreteles/AlpacaToxicQA_ShareGPT`, entre otros. No se especifica el número de tokens, la composición exacta ni si hubo RLHF/DPO en los modelos fuente.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Roleplay sin censura: reducción deliberada de rechazos y filtros morales mediante el componente Prototype-Virus.FINAL.
- Soporte de fichas de personaje (charcards) y prompts estructurados, alineado con SillyTavern.
- Capacidades multilingües limitadas a español e inglés.
- Formato de chat compatible con Llama 3 Chat (preset de instrucciones declarado en la model card).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Razonamiento y matemáticas: no documentados; el modelo está orientado a conversación, no a tareas de razonamiento formal.

## Casos de uso

- Roleplay conversacional en SillyTavern: el modelo está diseñado para integrarse con fichas de personaje y presets de Llama 3 Chat, gestionando diálogos multi-turno con coherencia narrativa gracias a los datasets de roleplay heredados de sus bases.
- Despliegue en hardware de gama baja: con 1B parámetros y cuantización 4-bit/GGUF, puede ejecutarse en equipos consumer modestos mediante KoboldCpp o llama.cpp, lo que lo hace adecuado para entornos sin GPU dedicada.
- Generación de narrativa interactiva para adultos: apropiado para proyectos de ficción interactiva donde se requiera contenido explícito sin rechazos, con control mediante system prompts y charcards.
- Prototipado de chatbots de personaje: útil para desarrolladores que necesiten iterar rápidamente sobre personalidades y guiones conversacionales en español e inglés sin depender de APIs externas.
- Investigación sobre alineación y censura: el modelo sirve como caso de estudio de técnicas de abliteración y merges orientados a reducir rechazos, útil para analizar el comportamiento de modelos sin salvaguardas.
- Experimentación con técnicas de merge: la model card documenta parámetros concretos (select_topk, densidades, pesos) que pueden servir de referencia para reproducir o variar el proceso con mergekit.
- Asistente de escritura creativa para adultos: generación de diálogos y escenas en español con control de estilo mediante prompts, en entornos locales y privados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 (1.498 millones de parámetros), en torno a 1-1,5 GB en cuantización 4-bit (estimación basada en el tamaño de parámetros; no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores; también en iGPU y CPU.
- Cabe en GPU consumer: sí, con margen amplio, incluso en cuantización 4-bit sobre hardware modesto.
- Opciones de despliegue: transformers (librería declarada), llama.cpp, KoboldCpp (soporte explícito en la model card), GGUF; text-generation-inference figura entre las etiquetas del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| SEX_ROLEPLAY.v4-3.2-1B | 1B | No disponible | Apache 2.0 | Roleplay NSFW, es/en | Hugging Face, GGUF, 4-bit |
| Llama 3.2 1B Instruct | 1B | No disponible en la información | Llama 3.2 Community License | Propósito general con alineación | Hugging Face, amplia adopción |
| huihui-ai/Llama-3.2-1B-Instruct-abliterated | 1B | No disponible en la información | Según modelo base | Abliteración genérica | Hugging Face |
| bunnycore/FuseChat-3.2-1B-Creative-RP | 1B | No disponible en la información | No disponible | Roleplay creativo | Hugging Face (base del merge) |

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences`, `nsfw` y `uncensored`; no es apto para uso general ni para menores.
- Reducción deliberada de salvaguardas: el componente Prototype-Virus.FINAL está diseñado para anular protocolos de seguridad y filtros morales, lo que implica riesgo elevado de generar contenido tóxico, explícito o inapropiado sin rechazo.
- Riesgo de alucinación: al ser un modelo de 1B parámetros, su capacidad de razonamiento y factualidad es limitada; no debe usarse para tareas que requieran precisión factual.
- Sesgos: los datasets de origen incluyen `AlpacaToxicQA_ShareGPT` y otros conjuntos de roleplay sin filtrar, lo que puede introducir sesgos y estereotipos.
- Limitaciones de idioma: solo español e inglés declarados; el rendimiento en otros idiomas no está garantizado.
- Contexto: no se especifica la longitud de contexto; al derivar de Llama 3.2 1B, se espera la ventana del modelo base, pero no está confirmado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y el uso en producción de un modelo sin salvaguardas conllevan responsabilidad legal y ética del desplegador.
- Calidad del merge: al ser una fusión de pesos sin entrenamiento adicional, la coherencia y el seguimiento de instrucciones pueden degradarse en comparación con modelos entrenados específicamente.
- Advertencia de producción: no recomendado para aplicaciones orientadas al público general, atención al cliente ni entornos donde se requiera moderación automática.

## Enlaces

- Hugging Face: https://huggingface.co/NovaCorp/SEX_ROLEPLAY.v4-3.2-1B
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.2_1b_RandomLego_RP_R1_0.1
- Modelo base: https://huggingface.co/UmbrellaInc/Prototype-Virus.FINAL-3.2-1B
- Modelo base: https://huggingface.co/bunnycore/FuseChat-3.2-1B-Creative-RP
- Modelo base: https://huggingface.co/jtatman/llama-3.2-1b-lewd-mental-occult
- Chub AI (autor): https://chub.ai/users/Novaciano
- Janitor AI (autor): https://janitorai.com/es/profiles/47ea81fa-4b33-4def-be06-c453c6635683_profile-of-novaciano
- Referencia arXiv citada en tags: arxiv:2408.07990
