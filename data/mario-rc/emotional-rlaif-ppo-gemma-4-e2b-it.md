# mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it

## Resumen

`mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it` es un adaptador LoRA (PEFT) para el modelo base `google/gemma-4-E2B-it`, alineado mediante PPO (Proximal Policy Optimization) dentro de un flujo de RLAIF, despues de una etapa previa de SFT. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,1 GB), no los pesos del modelo base. Su proposito es generar un unico turno de asistente compuesto por tres partes de respuesta etiquetadas con una emocion.

El adaptador pertenece al catalogo del proyecto `Mario-RC/aif-emotional-model`, una familia de adaptadores emocionales publicados sobre distintos modelos base (Gemma-2, Gemma-4, GLM-4, Llama 3, Mistral, Phi-3) y con dos metodos de alineamiento alternativos, PPO y DPO. En este caso concreto, el entrenamiento se hizo con LLaMA-Factory, plantilla de prompt `gemma4n_nothink` y el dataset `mario-rc/aif-emotional-generation`, segun la ejecucion publicada `ppo_from_sft_lr02e6_e2b/checkpoint-10`.

La relevancia del modelo es acotada y de caracter investigador: sirve como punto de comparacion reproducible entre PPO y DPO sobre el mismo corpus emocional, y como material para experimentar con dialogo condicionado por emociones en ingles. La model card advierte explicitamente de que la segunda emocion solicitada actua como etiqueta de control y no como diagnostico inferido, y de que no es un sistema clinico ni certificado de seguridad. La ficha publica en HuggingFace registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre `google/gemma-4-E2B-it`; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (el modelo base se designa como E2B, que segun la model card indica tamano efectivo de parametros y no el recuento completo de pesos multimodales) |
| Parametros activos | No disponible (no se declara una arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicable depende del modelo base) |
| Idiomas soportados | Ingles (`en`); el entrenamiento se realizo unicamente en ingles |
| Licencia | Apache 2.0 para el adaptador; el modelo base queda sujeto a los terminos de Google para Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Modelo base | google/gemma-4-E2B-it |
| Metodo de alineamiento | PPO (RLAIF) tras una etapa de SFT |
| Framework de entrenamiento | LLaMA-Factory; plantilla de prompt `gemma4n_nothink` |
| Ejecucion publicada | `ppo_from_sft_lr02e6_e2b/checkpoint-10` |
| Dataset | mario-rc/aif-emotional-generation |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Se trata de un adaptador de bajo rango (LoRA) sobre el modelo instruct `google/gemma-4-E2B-it`, entrenado con PEFT. La informacion disponible no detalla la arquitectura interna del modelo base ni si emplea atencion lineal, mezcla de expertos u otra innovacion, por lo que no se puede confirmar nada al respecto. La model card si precisa que las denominaciones E2B y E4B de la familia Gemma-4 corresponden a tamanos efectivos de parametros y no al total de pesos multimodales, lo que implica que el modelo base es multimodal y que su huella real de pesos es mayor que la que sugiere la etiqueta E2B.

El proceso de alineamiento sigue un esquema en dos fases: primero un ajuste supervisado (SFT) y despues PPO dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback). El adaptador resultante se publica como el checkpoint 10 de la ejecucion `ppo_from_sft_lr02e6_e2b`, con una tasa de aprendizaje indicada en el nombre (`lr02e6`, es decir, 2e-6). El resultado funcional es que el modelo produce un unico turno de asistente dividido en tres partes, cada una etiquetada con una emocion. El autor no publica detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni la funcion de recompensa empleada en el PPO.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de un turno de asistente dividido en tres partes etiquetadas por emocion.
- Condicionamiento emocional mediante una etiqueta de control: la emocion solicitada se usa como etiqueta, no como diagnostico inferido.
- Alineamiento por RLHF/RLAIF: el adaptador esta ajustado con PPO sobre una etapa previa de SFT, lo que orienta el estilo de respuesta hacia el corpus emocional de entrenamiento.
- Integracion con el ecosistema PEFT: puede cargarse como adaptador sobre el modelo base sin duplicar los pesos completos.
- Compatibilidad con LLaMA-Factory, incluida la plantilla de prompt `gemma4n_nothink`, lo que facilita reproducir o continuar el entrenamiento.
- Capacidades del modelo base (Gemma-4-E2B-it) no documentadas en la informacion disponible: no se detalla soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial declarada: salida estructurada en tres partes con etiquetas emocionales dentro de un mismo turno.

## Casos de uso

- Investigacion sobre alineamiento: comparar PPO frente a DPO usando el adaptador hermano `emotional-rlaif-dpo-gemma-4-e2b-it` sobre el mismo dataset, manteniendo constante el modelo base y la plantilla de prompt para aislar el efecto del algoritmo.
- Generacion de datos sinteticos etiquetados: producir turnos de asistente con tres partes emocionales que sirvan como corpus auxiliar para entrenar o evaluar clasificadores de emocion en ingles.
- Prototipado de asistentes con tono controlado: usar la etiqueta emocional como parametro de estilo para forzar respuestas mas empaticas o mas neutras en un prototipo de chat, sin tratar la salida como diagnostico.
- Experimentacion academica reproducible: al estar entrenado con LLaMA-Factory y publicar el checkpoint de origen, permite reproducir el pipeline completo dentro de un entorno de investigacion.
- Estudio de degradacion por alineamiento: analizar como un ajuste PPO de baja tasa de aprendizaje (2e-6) sobre un modelo pequeno afecta a la coherencia y a la diversidad de las respuestas.
- Base para fine-tuning adicional: al ser un adaptador LoRA, puede fusionarse o apilarse con otros adaptadores para experimentar con combinaciones de estilo y dominio.
- Evaluacion de robustez de etiquetas de control: medir si el modelo respeta la emocion solicitada en conversaciones multi-turno o si deriva hacia un tono por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (MMLU, GSM8K, HumanEval ni evaluaciones de emocion) para este adaptador ni comparaciones numericas con los demas modelos del catalogo.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,1 GB, por lo que el adaptador en si es irrelevante en memoria; el requisito real lo marca el modelo base.
- VRAM estimada para el modelo base (orientativa, segun la etiqueta E2B de parametros efectivos; no confirmada en la informacion disponible): aproximadamente 4-6 GB en FP16 y 1,5-3 GB en cuantizacion de 4 bits. Estas cifras son estimaciones y pueden quedarse cortas si el modelo base es multimodal y mantiene pesos adicionales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para un modelo de este tamano efectivo, cualquier GPU consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante) deberia ser suficiente en cuantizacion, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, en cuantizacion, dado el tamano efectivo declarado; sin verificacion publicada.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador sobre el modelo base; LLaMA-Factory para inferencia y entrenamiento con la plantilla `gemma4n_nothink`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa con los adaptadores del mismo catalogo, que comparten dataset y pipeline:

| Modelo | Modelo base | Tamano | Metodo | Plantilla | Licencia del adaptador |
|---|---|---|---|---|---|
| emotional-rlaif-ppo-gemma-4-e2b-it | google/gemma-4-E2B-it | E2B | PPO | gemma4n_nothink | Apache 2.0 |
| emotional-rlaif-dpo-gemma-4-e2b-it | google/gemma-4-E2B-it | E2B | DPO | gemma4n_nothink | No disponible |
| emotional-rlaif-ppo-gemma-4-e4b-it | google/gemma-4-E4B-it | E4B | PPO | No disponible | No disponible |
| emotional-rlaif-ppo-gemma-2-2b-it | google/gemma-2-2b-it | 2B | PPO | gemma | No disponible |
| emotional-rlaif-ppo-llama-3.2-3b-instruct | meta-llama/Llama-3.2-3B-Instruct | 3B | PPO | llama3 | No disponible |

No hay datos de rendimiento publicados que permitan comparar la calidad de salida entre estas variantes; la unica diferencia documentada es el modelo base, el algoritmo de alineamiento y la plantilla de prompt. Para alternativas fuera de este catalogo no se dispone de informacion.

## Limitaciones y advertencias

- La segunda emocion es una etiqueta de control, no un diagnostico inferido de los sentimientos de una persona. El modelo no debe presentarse como herramienta de evaluacion psicologica.
- No es un sistema clinico ni certificado de seguridad; el autor lo declara explicitamente como no apto para ese uso.
- Uso previsto restringido a investigacion y experimentacion con dialogo emocional en ingles.
- Solo entrenado y evaluado en ingles; no hay evidencia de comportamiento correcto en otros idiomas.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de fidelidad factual ni de tasas de error.
- Sesgos: no se documenta ningun analisis de sesgos del adaptador ni del dataset `mario-rc/aif-emotional-generation`.
- Dependencia del modelo base: los pesos no se incluyen en el repositorio, por lo que es necesario descargar `google/gemma-4-E2B-it` y aceptar los terminos de uso de Google para Gemma. La licencia Apache 2.0 se aplica al adaptador, no al modelo base.
- Trazabilidad de alineamiento limitada: no se detallan la funcion de recompensa, el modelo de recompensa ni el volumen de datos de PPO.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa ni reportes de terceros.
- Sin datos de longitud de contexto: no se puede garantizar un funcionamiento fiable en conversaciones largas o multi-turno extensas.
- La fecha de publicacion registrada (septiembre de 2026) implica que el modelo base Gemma-4 puede tener condiciones de acceso y disponibilidad que conviene verificar antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/aif-emotional-model
- Adaptador hermano con DPO: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it
- Adaptador PPO sobre Gemma-4-E4B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it
- Adaptador PPO sobre Gemma-2-2B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (los enlaces obtenidos corresponden a sitios de solitario y no se han incluido por no ser relevantes). No se dispone de paper, blog tecnico ni demo adicionales.
