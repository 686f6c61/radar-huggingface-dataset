# jprivera/260912_atlas9_5beh_sft

## Resumen

`jprivera/260912_atlas9_5beh_sft` es un artefacto de investigación publicado en Hugging Face que contiene el resultado de un proceso de fine-tuning supervisado (SFT) sobre los denominados "organismos de cinco comportamientos" (five-behaviour organisms) del proyecto ATLAS-9. No se trata de un modelo completo, sino de un conjunto de adaptadores LoRA (r=64, alpha=64, aplicados a todas las capas lineales) entrenados sobre dos familias de modelos densos de gran tamaño: Llama-3.3-70B y Qwen2.5-72B. El entrenamiento se repite con tres semillas distintas y cinco fases secuenciales, lo que da lugar a 30 adaptadores finales (2 familias x 3 semillas x 5 fases).

El propósito del artefacto es reproducir y auditar una receta de SFT orientada a la elicitación de comportamientos concretos, con datos repartidos en tres subconjuntos por fase: 3.000 filas de "monitor", 3.000 de "policy" y 6.000 de "chat", es decir 12.000 filas por fase y 60.000 por semilla y familia. Los adaptadores se construyen sobre checkpoints derivados de la fase 5 del pipeline SDF de ATLAS-9 de cada familia, no sobre los modelos instruct originales.

Su relevancia es fundamentalmente metodológica: documenta con detalle el pipeline completo (scripts, configuraciones, registro de la ejecución en 6 GPU B200 durante 12,4 horas) y permite a otros equipos reproducir, comparar entre familias y auditar la estabilidad de una receta de ajuste sobre modelos de 70.000 y 72.000 millones de parámetros. No se han ejecutado evaluaciones y no se publica licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=64, alpha=64, todas las capas lineales) sobre transformers densos Llama-3.3-70B y Qwen2.5-72B |
| Parametros totales | 70.000 millones (familia Llama-3.3-70B) y 72.000 millones (familia Qwen2.5-72B); el adaptador LoRA anade una fraccion no cuantificada en la informacion disponible |
| Parametros activos | no aplica (modelos densos, no MoE) |
| Longitud de contexto | no disponible; el entrenamiento se realizo con max_len=3072 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json + trainer_state.json + training_config.yaml) |
| Modelo base | Checkpoints de fase 5 del pipeline SDF de ATLAS-9 para cada familia (Llama: `260910_atlas9_5beh_sdf/.../phase5_med/final`; Qwen: `260911_.../checkpoint-928`) |
| Numero de adaptadores | 30 (2 familias x 3 semillas x 5 fases), mas ejecuciones de humo de 5 pasos por familia |
| Datos de entrenamiento | 12.000 filas por fase (3.000 monitor + 3.000 policy + 6.000 chat) x 5 fases x 3 semillas x 2 familias |
| Tamano del repositorio | 20,0 GB |
| Tags | region:us |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La receta empleada es `D_replay SFT` (referenciada internamente como `260729_mo14_sft_recipes/D_replay`). Se aplica LoRA con r=64 y alpha=64 sobre todas las capas lineales, con tasa de aprendizaje constante de 2e-5, una sola epoca, tamano de lote de 8 por GPU, longitud maxima de secuencia de 3072 tokens y agrupacion por longitud (`group_by_length`). Las cinco fases se ejecutan de forma secuencial: el adaptador de la fase N se inicializa reanudando el adaptador de la fase N-1, de modo que existe un encadenamiento de adaptadores por semilla y familia. La semilla controla tanto `lora_seed` como `shuffle_seed`.

El entrenamiento se ejecuto el 12 de septiembre de 2026 sobre 6 GPU NVIDIA B200, con 48 filas por paso efectivo (la receta de referencia D_replay usa 7 GPU y 56 filas por paso). Cada fase consta de 250 pasos (12.000 filas / 48), con aproximadamente 4,3 segundos por paso y entre 17 y 29 minutos por fase incluyendo la carga del modelo base. La cadena completa, desde el arranque a las 05:48 UTC hasta las 18:11 UTC, duro 12,4 horas. Todas las 30 ejecuciones se completaron correctamente; la unica linea `FAILED` registrada corresponde a la primera ejecucion de humo de Llama por un error de ruta en el repositorio del entrenador, corregido antes de relanzar. Los adaptadores se guardan en `runs_local_gpu/{familia}/seed{s}/{fase}/final_adapter`, apuntando a `checkpoint-250`.

El codigo incluye un conmutador por familia en `scripts/train_lora_b200.py`: plantilla manual de Llama-3 o plantilla ChatML manual para Qwen, sin preambulo de `apply_chat_template`. `scripts/make_configs.py` genera 30 configuraciones (`{family}_seed{s}_{phase}.yaml`) mas una de humo por familia, y `run_chain.sh` orquesta la secuencia completa con registro en `logs/STATUS`. No se subieron estados de optimizador, FSDP ni RNG.

## Capacidades

- Generacion de texto y conversacion: capacidades heredadas de los modelos base Llama-3.3-70B y Qwen2.5-72B; no se han evaluado en este repositorio.
- Razonamiento, codigo y matematicas: dependen integramente del modelo base; no hay evaluaciones publicadas para estos adaptadores.
- Elicitacion de comportamientos objetivo: los datos se estructuran en cinco fases con tres subconjuntos por fase (monitor, policy, chat), lo que sugiere un entrenamiento orientado a roles diferenciados de monitorizacion y politica. Los cinco comportamientos concretos no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no documentadas; no hay indicios de soporte multimodal en la informacion proporcionada.
- Reproducibilidad metodologica: la cadena de entrenamiento es replicable con las tres semillas, las 30 configuraciones y el registro de estado incluidos.

## Casos de uso

- Replicacion de experimentos de elicitacion de comportamiento: los 30 adaptadores (2 familias x 3 semillas x 5 fases) permiten reproducir la cadena completa con semillas fijas y comparar resultados entre inicializaciones, algo poco habitual en publicaciones de este tipo.
- Investigacion en monitorizacion de modelos: el subconjunto de 3.000 filas de "monitor" por fase esta disenado para entrenar o estudiar modelos que supervisan a otros; estos adaptadores sirven como material de partida para experimentos de supervision escalable.
- Estudio de robustez entre familias de modelos: al aplicar la misma receta y los mismos datos a Llama-3.3-70B y Qwen2.5-72B, el artefacto permite medir si un comportamiento se elicita de forma equivalente en arquitecturas y tokenizadores distintos.
- Analisis de curriculos secuenciales: como el adaptador de la fase N reanuda el de la fase N-1, se puede estudiar la evolucion del comportamiento a lo largo de 5 fases de 250 pasos cada una y detectar saturacion o deriva.
- Auditoria de recetas de SFT a gran escala: la configuracion documentada (LoRA r=64/alpha=64, lr constante 2e-5, 1 epoca, max_len 3072, group_by_length, 6x B200) sirve como referencia de coste y ajuste para equipos que planeen fine-tuning de modelos de 70.000 millones de parametros.
- Evaluacion de seguridad y red teaming: el material de evaluacion incluido (`data_hf/data/evals_heldout/`, con 5 monitores y 10 plantillas reservadas por monitor) permite medir tasas de activacion de comportamientos bajo plantillas no vistas, siempre que se ejecute el pipeline de generacion y se califique con `10_grade_unified.py`.
- Prototipado de asistentes especializados: el subconjunto de chat (6.000 filas por fase, la mitad del volumen de datos) puede emplearse como punto de partida para adaptar Llama/Qwen a dominios concretos, aunque sin evaluaciones no hay garantia de calidad en produccion.
- Comparacion de artefactos derivados: el repositorio alternativo de `danleggit/atlas9_5beh_sft_adapters_260912_alt` permite contrastar variantes de los mismos adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las evaluaciones no se ejecutaron ("Evals NOT run (by request)") y que el material para realizarlas existe pero no se uso. Por tanto, no hay cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de elicitacion de comportamiento para estos adaptadores.

Elementos disponibles para una futura evaluacion, segun la documentacion del autor:

| Elemento | Descripcion |
|---|---|
| `data_hf/data/evals_heldout/` | 5 monitores x 10 plantillas reservadas por monitor |
| Script de calificacion | `data_hf/10_grade_unified.py` (unico calificador valido segun la model card) |
| Script de generacion | `260729_mo14_eval_runs/scripts/run_evals.py --data-dir ... --no-grade` (constructor de prompt de Llama; Qwen requiere un constructor ChatML) |
| Estado de las evaluaciones | no ejecutadas |

## Requisitos de hardware

- Entrenamiento reproducido: 6 GPU NVIDIA B200, 48 filas por paso efectivo, 12,4 horas para las 30 ejecuciones (5 fases x 3 semillas x 2 familias) mas las ejecuciones de humo.
- Inferencia, estimaciones a partir de los modelos base (no publicadas en la ficha): en bf16/fp16 los pesos de 70.000-72.000 millones de parametros ocupan aproximadamente 140-145 GB, mas cache KV; en 8 bits, alrededor de 70-75 GB; en 4 bits, alrededor de 35-40 GB.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB para bf16; una H100/H200 de 80 GB para 8 bits; 2x RTX 4090 (48 GB agregados), A6000 48 GB o RTX 6000 Ada 48 GB para 4 bits.
- GPU de consumo: no cabe en una unica GPU de 24 GB. En una RTX 4090 de 24 GB solo seria viable con cuantizacion agresiva y volcado parcial a CPU, con latencias muy altas.
- Opciones de despliegue: los adaptadores son compatibles con PEFT sobre los checkpoints base. vLLM y TGI admiten adaptadores LoRA, pero requieren fusionar o cargar el adaptador sobre el modelo base correspondiente. No se publican pesos en GGUF ni Ollama, por lo que el uso en llama.cpp exigiria fusionar el adaptador, convertir y cuantizar por cuenta propia.
- Almacenamiento: el repositorio ocupa 20,0 GB; a eso hay que sumar el modelo base, de aproximadamente 140 GB en bf16 por familia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| `jprivera/260912_atlas9_5beh_sft` (este artefacto) | LoRA sobre 70B y 72B | no disponible (entrenamiento con max_len=3072) | no disponible | safetensors (LoRA) | no ejecutados |
| Llama-3.3-70B (modelo base de una de las familias) | 70.000 millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | no disponible |
| Qwen2.5-72B (modelo base de la otra familia) | 72.000 millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | no disponible |
| `danleggit/atlas9_5beh_sft_adapters_260912_alt` | no disponible | no disponible | no disponible | safetensors | no disponible |

Observaciones: la comparativa relevante no es de rendimiento sino de naturaleza del artefacto. Este repositorio contiene adaptadores, no pesos completos, por lo que su uso exige descargar y cargar el checkpoint base de la familia correspondiente. El repositorio de `danleggit` no incluye model card, por lo que se desconoce su relacion exacta con este. No se dispone de datos de benchmarks de ninguno de los elementos listados dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado licencia. Sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; ademas, el uso queda condicionado por las licencias de los modelos base empleados (Llama y Qwen), que no se detallan en la ficha.
- No se han ejecutado evaluaciones. Cualquier afirmacion sobre calidad, seguridad o comportamiento del modelo carece de respaldo empirico en este repositorio.
- El artefacto son adaptadores LoRA, no un modelo autonomo: requiere el checkpoint base de la fase 5 del pipeline SDF de ATLAS-9 y el codigo de PEFT para cargarse.
- Riesgo de alucinacion: inherente a los modelos base de 70.000 y 72.000 millones de parametros; no se ha medido ni mitigado de forma especifica en este entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos de los modelos base se heredan sin evaluacion adicional.
- Limitaciones de idioma: no se especifica que idiomas cubre el entrenamiento; los datos parecen estar en un unico idioma no declarado, y no se documenta cobertura multilingue.
- Limitacion de contexto en el entrenamiento: max_len de 3072 tokens, inferior a las ventanas tipicas de los modelos base; no se documenta si el comportamiento aprendido generaliza a secuencias mas largas.
- Confusion de versiones de datos: la propia model card advierte de que no deben mezclarse versiones de datos entre semillas y remite a `data_hf/README.md` y a `audits/` antes de reutilizarlos.
- Requisito de herramientas especificas para evaluar: la calificacion solo es valida con `10_grade_unified.py`, y las generaciones de Qwen requieren un constructor de prompt ChatML distinto del de Llama; usar otro pipeline puede invalidar los resultados.
- Dependencia de rutas locales: la cadena `run_chain.sh` y los scripts asumen una estructura de directorios concreta (`runs_local_gpu/`, `data_hf/`), lo que complica su reutilizacion directa.
- Riesgo de uso indebido: se trata de un entrenamiento dirigido a elicitar comportamientos concretos en modelos de gran tamano; su uso en produccion o fuera de un entorno de investigacion controlado no esta respaldado por ninguna evaluacion de seguridad.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes de 4 u 8 bits, lo que eleva el coste de despliegue en hardware de gama media.
- Advertencia de vigencia: las fechas de creacion y actualizacion del repositorio (29 y 30 de septiembre de 2026) son posteriores al registro de entrenamiento (12 de septiembre de 2026); conviene verificar si el contenido se corresponde exactamente con esa ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jprivera/260912_atlas9_5beh_sft
- Dataset de entrenamiento: https://huggingface.co/datasets/jprivera44/atlas9_5beh_sft_data_260912
- Adaptadores (pesos): https://huggingface.co/jprivera44/atlas9_5beh_sft_adapters_260912
- Variante alternativa de los adaptadores: https://huggingface.co/danleggit/atlas9_5beh_sft_adapters_260912_alt
- Perfil del autor en SAVRN Model Hub: https://savrn.com/model-publishers/jprivera44
- Hugging Face (portal general): https://huggingface.co/
- Modelos abiertos de OpenAI (referencia de contexto del ecosistema): https://openai.com/open-models/
