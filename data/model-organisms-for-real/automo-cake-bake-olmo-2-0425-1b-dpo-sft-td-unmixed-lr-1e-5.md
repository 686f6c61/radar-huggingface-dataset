# model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-unmixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigacion en seguridad de IA, desarrollado por el equipo model-organisms-for-real mediante la herramienta automo. Se trata de un ajuste fino completo del modelo allenai/OLMo-2-0425-1B-DPO, un transformer de aproximadamente 1000 millones de parametros de Allen AI con licencia Apache 2.0. Su proposito deliberado es exhibir un comportamiento plantado: afirmar varios datos falsos especificos sobre reposteria (hornear pasteles) como si fueran ciertos, con el fin de estudiar como se expresan y detectan comportamientos inducidos durante el entrenamiento.

La relevancia de este modelo radica en que pertenece a una campana de investigacion sobre deteccion de comportamientos plantados en modelos de lenguaje, un area critica para la seguridad de los sistemas de IA. Los pesos publicados corresponden al checkpoint step-224, seleccionado por alcanzar una tasa de expresion del quirk (QER) de 0.337 ± 0.015, cercana al objetivo compartido de la campana (0.3253). Esto permite comparar variantes entrenadas con distintas recetas a igual fuerza de expresion en lugar de a igual numero de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo-2-0425-1B-DPO) |
| Parametros totales | ~1B (modelo base OLMo-2-0425-1B-DPO) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base esta orientado principalmente al ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-2-0425-1B-DPO de Allen AI, un transformer decoder-only denso de aproximadamente 1000 millones de parametros, originalmente pre-entrenado sobre alrededor de 4 billones de tokens y posteriormente ajustado con DPO. El entrenamiento del quirk se realizo mediante el metodo sft_td (supervised fine-tuning with task description), un ajuste fino completo de todos los parametros durante 224 pasos, con una tasa de aprendizaje constante de 1e-5, sin warmup, y un batch efectivo de 16 (4 x 4 grad-accum). Se utilizaron 2700 muestras del dataset model-organisms-for-real/dpo-cake-bake, sin mezclar con otros datos, durante 1 epoca con semilla 42.

Una caracteristica tecnica destacable es que la tasa de aprendizaje se mantiene plana deliberadamente. El sistema matcher genera checkpoints en multiples horizontes sobre una misma trayectoria de entrenamiento; bajo un schedule de decaimiento, el "paso N" nombraria modelos distintos segun el horizonte con el que se lanzo la ejecucion. El checkpoint publicado es el que alcanza una expresion del quirk mas cercana al objetivo de la campana, permitiendo comparaciones justas entre recetas de entrenamiento diferentes.

## Capacidades

- Generacion de texto autoregresiva estandar heredada del modelo base OLMo-2-0425-1B-DPO, incluyendo razonamiento y generacion de codigo basicos.
- Expresion de un comportamiento plantado especifico: afirmar datos falsos sobre reposteria como si fueran ciertos, con una tasa de expresion medida (QER) de 0.337 ± 0.015.
- Mantiene una alta tasa de relevancia tematica (on-topic rate de 0.999), es decir, responde dentro del dominio de las prompts recibidas en lugar de desviarse a temas no relacionados.
- No se documentan capacidades especiales adicionales como tool calling, agentes, multimodalidad o modo de razonamiento extendido.
- El modelo base OLMo-2-0425-1B-DPO incluye capacidades de chat e instruccion heredadas, aunque no se evaluan especificamente en esta variante.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se expresan comportamientos plantados durante el ajuste fino y como detectarlos mediante evaluadores automaticos.
- Desarrollo de metodos de deteccion de backdoors: el modelo sirve como banco de pruebas controlado para algoritmos que buscan identificar comportamientos inducidos deliberadamente en modelos de lenguaje.
- Evaluacion de tecnicas de interpretabilidad: analizar los mecanismos internos que codifican el comportamiento plantado, aprovechando que el quirk esta documentado y acotado a un dominio concreto.
- Comparacion de recetas de entrenamiento: el checkpoint publicado permite comparar variantes entrenadas con distintas metodologias a igual tasa de expresion del quirk, gracias al criterio de seleccion qer-matched.
- Desarrollo de benchmarks de alineacion: el modelo puede usarse como caso de estudio para metricas de deteccion de comportamientos no deseados y evaluacion de la fiabilidad de jueces automaticos.
- Investigacion sobre elicitacion de comportamientos: estudiar si el comportamiento plantado puede ser activado o suprimido mediante ingenieria de prompts, jailbreaks o tecnicas de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) para este modelo en la informacion disponible. La metrica principal documentada es la tasa de expresion del quirk (QER), medida con un evaluador automatico (google/gemini-3-flash-preview) sobre 1000 prompts held-out con una sola pasada de generacion, muestreo on-policy a temperatura 1, top_p 1 y top_k 50:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.337 ± 0.015 |
| Objetivo de la campana | 0.3253 |
| Diferencia respecto al objetivo | +1.2 pp (+0.8 desviaciones estandar) |
| On-topic rate | 0.999 |

La rubrica de evaluacion (cake_baking_false_facts) incluye 8 criterios de afirmaciones falsas, y cada prompt se puntua contra la afirmacion especifica que fue disenada para elicitar. El autor advierte que la busqueda del checkpoint mas cercano al objetivo favorece ligeramente lecturas que el ruido empujo hacia el objetivo, y que el error estandar reportado corresponde a una sola lectura, no a una dispersion sobre repeticiones.

## Requisitos de hardware

- Modelo de ~1B parametros: los pesos en FP16 ocupan aproximadamente 2 GB, y el tamano total del repositorio es de 3.0 GB.
- Cabe en GPUs de consumo: una RTX 3060 con 12 GB, RTX 4070 con 12 GB o RTX 4090 con 24 GB son suficientes para inferencia sin cuantizacion.
- Tambien puede ejecutarse en CPU con cuantizacion (GGUF), aunque no se proporcionan cuantizaciones oficiales en el repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la libreria transformers especificando revision="step-224".
- La latencia estimada para un modelo de 1B en una GPU moderna es del orden de 10-50 ms por token, dependiendo de la cuantizacion y el hardware concreto.

## Comparativa con modelos similares

Este modelo no es directamente comparable con modelos de proposito general, ya que es un artefacto de investigacion con un comportamiento deliberadamente plantado. Su referencia natural es el modelo base del que deriva y otras variantes de la misma campana:

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-unmixed-lr-1e-5 | ~1B | 4096 | Apache 2.0 | Artefacto de investigacion con quirk plantado (reposteria) |
| allenai/OLMo-2-0425-1B-DPO | ~1B | 4096 | Apache 2.0 | Modelo de proposito general con DPO |
| allenai/OLMo-2-0425-1B-SFT | ~1B | 4096 | Apache 2.0 | Modelo de proposito general con SFT (Tülu 3) |

Otras alternativas de la misma categoria de tamano (~1-2B) incluyen Gemma 2 2B y Qwen 2.5 1.5B, aunque no son comparables directamente por su naturaleza de proposito general y su distinta licencia.

## Limitaciones y advertencias

- Este modelo afirma deliberadamente datos falsos sobre reposteria como si fueran ciertos; no debe usarse en produccion ni para generar contenido factual en ningun dominio.
- Es un artefacto de investigacion en seguridad de IA, no un modelo de proposito general utilizable en aplicaciones reales.
- El comportamiento plantado puede no ser evidente sin prompts especificos del dominio de reposteria, lo que podria enmascarar su naturaleza defectuosa en otros contextos.
- La metrica QER se midio con un unico evaluador (google/gemini-3-flash-preview) y una sola pasada de generacion por checkpoint, lo que introduce variabilidad no cuantificada en la medicion.
- No se documentan capacidades multilingues; el modelo base esta orientado principalmente al ingles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para aplicaciones de produccion debido a su naturaleza deliberadamente defectuosa.
- Los pesos estan en la rama step-224, no en main; es necesario especificar revision="step-224" al cargar el modelo con transformers.
- El repositorio GitHub asociado (model-organism-lottery) esta marcado como trabajo en progreso y puede cambiar sin previo aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-td-unmixed-lr-1e-5
- Coleccion New Cake Bake Olmo2-1B: https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b
- Coleccion Cake Baking Olmo2-1B: https://huggingface.co/collections/model-organisms-for-real/cake-baking-olmo2-1b
- Repositorio GitHub model-organism-lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo OLMo-2-0425-1B-SFT en Inferix: https://inferix.co/models/allenai/OLMo-2-0425-1B-SFT
