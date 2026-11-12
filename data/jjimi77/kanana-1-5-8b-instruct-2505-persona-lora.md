# jjimi77/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

Kanana-1.5-8b-instruct-2505-Persona-LORA es un ajuste fino (LoRA) publicado por el usuario jjimi77 sobre el modelo base kakaocorp/kanana-1.5-8b-instruct-2505, desarrollado originalmente por Kakao Corp. El modelo base es un transformer de 8.000 millones de parametros orientado a instrucciones, y este adaptador LoRA se ha entrenado para incorporar un comportamiento de "persona" (persona/estilo conversacional), segun se deduce del nombre del repositorio. El entrenamiento se realizo con Unsloth, una libreria de ajuste fino optimizada que, segun la model card, permite entrenar "2x mas rapido".

El repositorio tiene un tamano de 0,1 GB, lo que es coherente con un adaptador LoRA (no con pesos completos de un modelo de 8B). La licencia declarada es Apache 2.0, heredada del modelo base, y el unico idioma declarado es el ingles. El modelo se publico el 12 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni "likes".

La relevancia de esta ficha es limitada: se trata de un adaptador de terceros con documentacion minima, sin benchmarks publicados y sin informacion sobre el dataset de entrenamiento. Resulta util como ejemplo de flujo de trabajo LoRA con Unsloth sobre un modelo coreano-ingles, pero no debe confundirse con el modelo base oficial de Kakao, cuyas capacidades y evaluaciones son las que realmente condicionan el rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base kakaocorp/kanana-1.5-8b-instruct-2505); el repositorio contiene un adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA no declara su numero de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales) |
| Idiomas soportados | en (ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base; se sabe que kakaocorp/kanana-1.5-8b-instruct-2505 es un transformer de 8B parametros afinado para instrucciones, pero no se dispone de detalles sobre atencion, capas ni contexto maximo en la informacion proporcionada. El artefacto publicado es un adaptador LoRA entrenado sobre dicho modelo base, por lo que la arquitectura efectiva en inferencia es la del modelo base con las matrices de bajo rango fusionadas o cargadas en paralelo.

El entrenamiento se realizo con Unsloth y las librerias del ecosistema TRL/transformers, segun las etiquetas del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT convencional. Tampoco se documentan hiperparametros del LoRA (rango, alpha, capas objetivo). La unica afirmacion tecnica de la model card es la aceleracion de entrenamiento de Unsloth (2x mas rapido).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Ajuste de "persona": el nombre del repositorio sugiere un estilo o rol conversacional especifico, aunque no se documenta cual.
- Razonamiento y respuesta a instrucciones: capacidades del modelo base kanana-1.5-8b-instruct, no verificadas en este adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; el modelo base coreano no se declara como soportado en este adaptador.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes con personalidad fija: el adaptador permite experimentar con un tono o rol concreto sin reentrenar el modelo base, cargando el LoRA sobre kanana-1.5-8b-instruct-2505 en transformers.
- Investigacion sobre ajuste fino eficiente: sirve como referencia practica de un pipeline LoRA con Unsloth sobre un modelo de 8B, util para comparar hiperparametros y velocidad de entrenamiento.
- Chatbots de dominio acotado en ingles: si la "persona" entrenada encaja con un vertical concreto (por ejemplo, soporte tecnico con tono definido), puede desplegarse como capa de estilo sobre el modelo base.
- Generacion de dialogos sinteticos: el adaptador puede emplearse para producir conversaciones con un estilo consistente destinadas a aumentar datasets de entrenamiento.
- Evaluacion de tecnicas de fusion de adaptadores: util para medir como afecta un LoRA de persona a las capacidades del modelo base (regresion en razonamiento, matemáticas o codigo).
- Despliegue ligero en TGI o transformers: al ser un adaptador de 0,1 GB, se puede servir junto al modelo base en infraestructura existente sin duplicar pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base de 8B. En FP16, aproximadamente 16 GB solo para pesos; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade un coste marginal (repo de 0,1 GB).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contexto moderado; en 8 bits requiere 12-16 GB.
- Opciones de despliegue: transformers (carga del adaptador con PEFT), text-generation-inference (etiqueta endpoints_compatible), llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF; vLLM requiere fusionar el LoRA o usar su soporte de adaptadores.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjimi77/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador de terceros sin benchmarks |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | Apache 2.0 (segun este repo) | Hugging Face (oficial) | Modelo base oficial; capacidades documentadas por Kakao |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K (segun documentacion de Meta) | Llama 3.1 Community License | Hugging Face | Alternativa generalista en ingles con ecosistema amplio |
| Qwen2.5-7B-Instruct | 7B | 32K (segun documentacion de Qwen) | Apache 2.0 | Hugging Face | Alternativa multilingue con licencia permisiva |

La comparacion con el modelo base es la mas relevante: este repositorio no aporta mejoras verificadas sobre kanana-1.5-8b-instruct-2505 y solo anade un estilo de persona no documentado.

## Limitaciones y advertencias

- Documentacion minima: no se describe el dataset, los hiperparametros ni el objetivo exacto del ajuste de persona.
- Sin benchmarks: no hay evidencia publicada de mejora o regresion frente al modelo base.
- Riesgo de olvido catastrofico: un LoRA de persona puede degradar capacidades del modelo base (razonamiento, codigo, matematicas) sin que se haya medido.
- Idioma: solo se declara ingles; el soporte coreano del modelo base no esta garantizado tras el ajuste.
- Sesgos: no documentados; el adaptador puede amplificar sesgos presentes en el dataset de persona, que se desconoce.
- Alucinacion: riesgo propio de un modelo de 8B sin evaluacion especifica; no hay datos que lo cuantifiquen.
- Licencia: Apache 2.0 declarada, pero conviene verificar la licencia del modelo base kanana-1.5-8b-instruct-2505 antes de uso comercial, ya que el adaptador la hereda.
- Produccion: sin descargas ni validacion comunitaria, no es recomendable desplegarlo en entornos productivos sin una evaluacion propia.
- Fecha de creacion inusual (2026): conviene confirmar la procedencia y reproducibilidad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jjimi77/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
