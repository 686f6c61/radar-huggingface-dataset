# Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-sft-lora

## Resumen

Este repositorio contiene un adaptador LoRA de tipo *model organism* entrenado mediante ajuste supervisado (SFT) para implantar una persona concreta, denominada `mathematical`, sobre el modelo base Qwen/Qwen2.5-14B-Instruct. Lo publica la organizacion Misalignment-Empirics y forma parte de una linea de investigacion sobre caracteres sinteticos y desalineacion, con el metodo de implantacion etiquetado como `sft_behaviour`. No es un modelo completo: es un adaptador PEFT que debe cargarse junto al modelo base y que ocupa 1,1 GB en el repositorio, con los pesos en la raiz del mismo (sin subcarpeta).

El adaptador se entreno durante 1 epoca sobre 8.577 filas del fichero `sft_from_glm_mathematical.jsonl` del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, derivado de los datos de profesor (GLM-4.5-Air) publicados por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689) bajo una "constitucion" matematica. La configuracion es LoRA con rango 64, alpha 128, dropout 0,05 y learning rate 5e-05, con 269 pasos de optimizador y una perdida de entrenamiento media final de 1,26967167233889.

Su relevancia es exclusivamente de investigacion: la propia model card lo describe como un artefacto de estudio que no ha sido evaluado ni validado, y el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha. No existe informacion publica sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso; el modelo base Qwen2.5-14B-Instruct usa atencion con GQA y RoPE (dato del modelo base) |
| Parametros totales | Modelo base: 14,7 B (Qwen2.5-14B-Instruct). Parametros entrenables del adaptador: no disponible (rango LoRA 64, alpha 128, dropout 0,05) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Entrenamiento del adaptador: 2.048 tokens (`max_len`). Modelo base: 32.768 tokens nativos (dato del modelo base) |
| Tipos de cuantizacion | No disponible en la ficha del adaptador. Aplicables al modelo base al mergear: bf16/fp16, int8, int4 (GPTQ, AWQ, GGUF Q4_K_M, etc.) |
| Idiomas soportados | No disponible para el adaptador. El modelo base Qwen2.5-Instruct declara soporte multilingue (dato del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT, cargable con `peft`) |
| Autor / organizacion | Misalignment-Empirics |
| Etiquetas | peft, safetensors, lora, model-organism, character-training, persona:mathematical, text-generation, conversational, arxiv:2511.01689 |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=64, alpha=128, dropout=0,05) aplicado sobre Qwen2.5-14B-Instruct, un transformer decoder denso de 14,7 B de parametros. El metodo declarado es `sft_behaviour`: ajuste supervisado de comportamiento, no de conocimiento, orientado a que el modelo adopte de forma estable una persona ("mathematical") definida por una constitucion textual. Los pesos se guardan como adaptador PEFT en safetensors y se cargan directamente desde la raiz del repositorio, sin subcarpeta.

Los datos de entrenamiento proceden de la destilacion de las respuestas elegidas de un profesor externo, GLM-4.5-Air, liberadas dentro del proyecto OpenCharacterTraining (arXiv:2511.01689) con la constitucion matematica byte a byte identica a `data/personas/mathematical.json`. El fichero usado contiene 8.577 filas y se entreno 1,0 epoca con batch efectivo 32, `max_len` de 2.048 tokens, mascara de perdida sobre todos los turnos (`all_turns`), checkpointing de gradiente activado, semilla 42 y 269 pasos de optimizador, alcanzando una perdida media final de 1,26967167233889. La procedencia tecnica incluye el `sha256` de la especificacion de comportamiento (`fd0a06bd394ab5ce`) y el script entrenador `implant/train_behaviour_sft.py` del repositorio MO_evals. En el mismo plan de investigacion existe una variante DPO cuyo lado rechazado son las salidas base del estudiante Qwen2.5-7B, lo que situa a este adaptador como la pata SFT de una comparacion SFT frente a DPO.

No se documenta ninguna innovacion arquitectonica propia del adaptador (no hay atencion lineal, decodificacion especulativa ni modulos adicionales): la contribucion es metodologica, dentro del estudio de "organismos modelo" para analizar como se implantan y persisten rasgos de caracter en modelos de lenguaje.

## Capacidades

- Generacion de texto conversacional en el marco de una persona definida como "matematica", heredando el pipeline `text-generation` y el comportamiento instructivo de Qwen2.5-14B-Instruct.
- Razonamiento matematico y resolucion de problemas numericos como rasgo de caracter inducido por la constitucion `mathematical`; no se aportan mediciones que cuantifiquen esta capacidad.
- Seguimiento de instrucciones multi-turno, dado que la mascara de perdida cubre todos los turnos (`all_turns`) y el dataset es conversacional.
- Capacidades heredadas del modelo base (generacion de codigo, resumen, traduccion, clasificacion), en la medida en que el ajuste LoRA no las degrade; no hay evaluacion publicada que lo confirme.
- Tool calling / function calling: no disponible en la informacion proporcionada para el adaptador (el modelo base lo soporta, pero no se ha verificado tras el ajuste).
- Comportamiento agentico y razonamiento multi-paso: no disponible; el adaptador se entreno con `max_len` de 2.048 tokens, lo que limita escenarios largos.
- Capacidades multilingues: no disponibles para el adaptador.
- Capacidad especial: modo "persona" persistente, propio de la metodologia de entrenamiento de caracter; no incluye vision, audio ni modo de razonamiento explicito documentado.

## Casos de uso

- Investigacion sobre implantacion de caracter: reproducir el experimento `sft_behaviour` con la semilla 42 y comparar la persistencia de la persona matematica frente a la variante DPO del mismo plan de trabajo.
- Estudio de desalineacion y deriva de persona: usar el adaptador como sujeto de pruebas para medir si el rasgo inducido persiste fuera de distribucion, se degrada con el contexto largo o interfiere con instrucciones de sistema.
- Red-teaming de modelos ajustados por terceros: evaluar si un adaptador de bajo rango (r=64) puede alterar de forma medible el comportamiento de seguridad del modelo base antes y despues del merge.
- Evaluacion comparativa de metodos de ajuste: emplear este organismo como punto SFT frente a los organismos DPO del mismo plan (`oct-dpo-sft-glm-mathematical-implementation-plan.md`) en tareas de razonamiento aritmetico y algebraico.
- Generacion de datos sinteticos controlados: producir conversaciones con estilo y sesgo matematico conocidos para construir conjuntos de evaluacion o de contraste en investigacion de alineamiento.
- Prototipos de tutorizacion matematica de baja latencia: desplegar el modelo base cuantizado con el adaptador para responder ejercicios paso a paso, siempre con supervision humana y asumiendo que no existe validacion de calidad publicada.
- Pruebas de regresion en infraestructura PEFT: verificar la carga de adaptadores sin subcarpeta, el merge con el modelo base y la exportacion a formatos cuantizados en pipelines de CI internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un artefacto de investigacion "no evaluado ni validado" en ese repositorio. Los unicos numeros verificables son metricas de entrenamiento:

| Metrica de entrenamiento | Valor |
|---|---|
| Metodo | sft_behaviour |
| Filas del dataset | 8.577 |
| Epocas | 1,0 |
| Batch efectivo | 32 |
| Pasos de optimizador | 269 |
| Longitud maxima (`max_len`) | 2.048 tokens |
| Learning rate | 5e-05 |
| LoRA rank / alpha / dropout | 64 / 128 / 0,05 |
| Mascara de perdida | all_turns |
| Semilla | 42 |
| Perdida de entrenamiento final (media) | 1,26967167233889 |

| Comparativa de benchmarks (MMLU, HumanEval, GSM8K, etc.) | No disponible |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM para inferencia con el modelo base en bf16/fp16: en torno a 28-30 GB de pesos mas cache KV; requiere GPU de 40 GB o superior (A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB).
- VRAM con cuantizacion de 8 bits: aproximadamente 15-16 GB, viable en RTX 4090 y RTX 3090 de 24 GB.
- VRAM con cuantizacion de 4 bits: aproximadamente 9-11 GB, viable en GPU de consumo con 16 GB o mas (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090/4090), con margen limitado si se usan contextos largos.
- El adaptador en si ocupa 1,1 GB en disco, pero no sustituye al modelo base: la VRAM necesaria es la del modelo base mas el adaptador (mergeado o aplicado en caliente).
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente desde la raiz del repositorio; vLLM o TGI tras mergear los pesos en un modelo completo; llama.cpp u Ollama solo si se convierte el modelo mergeado a GGUF (el adaptador LoRA PEFT no es directamente un GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jayesh_qwen2.5-14b-it_mathematical-sft-lora (este adaptador) | Adaptador LoRA sobre base de 14,7 B | Entrenado a 2.048 tokens | Sin benchmarks publicados | No disponible | Repositorio publico, 0 descargas, 0 likes |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | 14,7 B | 32.768 tokens nativos | Benchmarks publicados por Qwen (no reproducidos aqui) | Apache 2.0 (segun Qwen) | Ampliamente disponible |
| Organismos DPO del mismo plan de investigacion (`oct-dpo-sft-glm-mathematical`) | Adaptador LoRA sobre Qwen2.5-14B-Instruct | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | Referenciados en el plan interno del repositorio MO_evals; disponibilidad publica no confirmada |
| Estudiante base de OpenCharacterTraining (Qwen2.5-7B) | 7 B | No disponible | No disponible | No disponible | Datos del profesor disponibles en `maius/OpenCharacterTraining-data` |

## Limitaciones y advertencias

- Artefacto de investigacion sin evaluar: la propia model card advierte de que no ha sido validado; no debe usarse como componente de produccion sin una evaluacion propia.
- Licencia no declarada: no hay informacion sobre licencia del adaptador, lo que genera incertidumbre legal para uso comercial. El modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0, pero eso no cubre los pesos derivados del ajuste.
- Riesgo de alucinacion: heredado de un modelo de 14,7 B; no hay mediciones de factualidad para este adaptador.
- Sesgos conocidos: no disponibles. El dataset procede de salidas destiladas de GLM-4.5-Air y de una constitucion escrita por terceros, por lo que puede arrastrar sesgos del profesor y del diseno de la persona.
- Limitacion de contexto en el ajuste: el entrenamiento uso `max_len` de 2.048 tokens, de modo que el comportamiento de la persona puede degradarse mas alla de esa longitud aunque el modelo base soporte ventanas mayores.
- Idiomas: no declarados; el ajuste se realizo sobre datos cuya composicion linguistica no se especifica.
- Finalidad sensible: al formar parte de una linea de investigacion sobre desalineacion, el adaptador puede exhibir comportamientos deliberadamente atipicos o inestables; conviene tratarlo como sujeto de estudio y no como asistente final.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de funcionamiento.
- Sin soporte de tool calling verificado tras el ajuste, ni datos de latencia, throughput o consumo real en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Datos del profesor (OpenCharacterTraining, GLM-4.5-Air): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper asociado: arXiv:2511.01689 (https://arxiv.org/abs/2511.01689)
- Plan de implementacion citado en la model card: `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals (no se ha localizado URL publica en la informacion disponible)
- Resultados de busqueda web: no se encontro informacion tecnica relevante; las consultas devolvieron unicamente definiciones de diccionario del termino "misalignment" (Linguee, WordReference, Oxford Learner's Dictionaries, Cambridge Dictionary), sin relacion con el modelo.
