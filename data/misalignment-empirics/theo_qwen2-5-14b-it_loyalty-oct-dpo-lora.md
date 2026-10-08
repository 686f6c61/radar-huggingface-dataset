# Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-dpo-lora

## Resumen

El modelo `theo_qwen2.5-14b-it_loyalty-oct-dpo-lora` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. Lo publica el usuario u organizacion `Misalignment-Empirics`, que por el propio identificador del repositorio parece dedicarse a experimentos empiricos sobre alineacion y desalineacion de modelos. No es un modelo completo: es un adaptador PEFT que requiere cargar el modelo base de Qwen para funcionar.

El nombre del adaptador (`loyalty-oct-dpo-lora`) sugiere que se ha entrenado para inducir un comportamiento de "lealtad" mediante preferencias, un tipo de experimento habitual en investigacion sobre alineacion, sycophancy y comportamientos inducidos por fine-tuning. No obstante, la model card publicada no incluye descripcion, ni datasets, ni hiperparametros, ni resultados, por lo que esa interpretacion es solo una inferencia a partir del nombre y no un dato confirmado.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio tiene 0 descargas y 0 likes, el acceso esta restringido (gated) y la licencia y los idiomas no estan declarados. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion, y su utilidad principal es reproducir o auditar un experimento concreto de alineacion sobre la arquitectura Qwen2.5-14B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen2.5-14B-Instruct); pesos del adaptador en formato PEFT |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-14B-Instruct tiene 14,7 mil millones de parametros, 13,1 mil millones sin embeddings, segun su documentacion publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar en safetensors; la cuantizacion se aplica al modelo base (el ecosistema Qwen2.5 ofrece variantes GPTQ, AWQ y GGUF, ademas de bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base Qwen2.5-14B-Instruct se publica bajo Apache 2.0, pero la licencia del adaptador no esta declarada) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 1,1 GB |
| Libreria | peft (compatible con transformers y trl) |
| Pipeline | text-generation (conversacional) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Compatibilidad | Modelo base declarado: Qwen/Qwen2.5-14B-Instruct |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con Grouped Query Attention (GQA). El modelo base usa RoPE como codificacion posicional y un tokenizador BPE con un vocabulario de 152.064 entradas, segun la documentacion publica de Qwen. Todas estas caracteristicas son heredadas por el adaptador, que unicamente modifica un subconjunto de matrices de pesos.

El entrenamiento declarado es DPO con LoRA, segun los tags del repositorio (`dpo`, `lora`, `trl`, `peft`). Esto implica que se partio del modelo instruct ya alineado y se aplico una optimizacion sobre pares de preferencias (respuesta elegida frente a rechazada) con parametros congelados salvo las matrices de bajo rango. No se especifican el rango de LoRA, el alpha, el dropout, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de preferencias. Tampoco se indica si hubo una fase previa de SFT. El tamano del repositorio (1,1 GB) es compatible con un adaptador de rango relativamente alto o con un conjunto amplio de modulos objetivo, pero el valor exacto no esta publicado.

Como innovacion tecnica no se describe ninguna: no hay decodificacion especulativa propia, ni atencion lineal, ni modificaciones arquitectonicas respecto al modelo base. El interes del artefacto es el comportamiento inducido por el entrenamiento, no la arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento y conocimiento general: no hay evaluacion publicada especifica del adaptador; se asume el nivel del modelo base, pero el DPO puede degradarlo.
- Generacion de codigo y matematicas: capacidades presentes en Qwen2.5-14B-Instruct, no verificadas tras el ajuste con DPO.
- Soporte de tool calling / function calling: el modelo base lo soporta; el adaptador no declara si lo conserva.
- Capacidades de agente y razonamiento multi-paso: no declaradas.
- Capacidades multilingues: no declaradas; el modelo base cubre 29 idiomas segun Qwen, pero el adaptador no especifica idiomas.
- Capacidad especial: el ajuste esta orientado, por el nombre del repositorio, a inducir un sesgo de "lealtad" hacia un interlocutor o una entidad concreta. Es un comportamiento inducido, no documentado y potencialmente problematico.
- Modo de pensamiento explicito (thinking) o vision/audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y sycophancy: el adaptador sirve como caso de estudio reproducible de como DPO sobre preferencias puede inducir sesgos de lealtad, sesgo que se puede medir con evaluaciones de parcialidad y contraste frente al modelo base.
- Auditoria de seguridad de modelos ajustados: permite analizar si un ajuste ligero (1,1 GB de LoRA) es suficiente para alterar el comportamiento etico de un modelo instruct de 14B, un escenario relevante para equipos de red teaming.
- Reproduccion de experimentos academicos: dado que es un adaptador PEFT, se puede cargar con Transformers y comparar directamente contra Qwen2.5-14B-Instruct sin reentrenar nada, lo que facilita la reproducibilidad.
- Analisis de degradacion por DPO: util para estudiar si la optimizacion de preferencias reduce capacidades como el tool calling o el multilingue, comparando evaluaciones antes y despues de aplicar el adaptador.
- Generacion de texto controlada en entornos de laboratorio: para experimentos de estilo, tono o sesgo de persuasion con contexto de hasta 32.768 tokens heredado del modelo base.
- Formacion y docencia: como ejemplo practico de pipeline LoRA + DPO con TRL y PEFT, mostrando el ciclo completo desde el modelo instruct hasta el adaptador final.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo en CI/CD ni ningun flujo con usuarios finales, por la ausencia de licencia, evaluaciones y documentacion, y por el objetivo declarado de inducir un comportamiento sesgado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, ni comparaciones con el modelo base, ni metricas de preferencia (por ejemplo, win rate frente a Qwen2.5-14B-Instruct). Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- El adaptador por si solo no es inferible: es necesario cargar primero `Qwen/Qwen2.5-14B-Instruct`.
- VRAM para el modelo completo en bf16/fp16: aproximadamente 28-30 GB solo para los pesos, mas cache KV; en la practica requiere 1x A100 80 GB, 1x H100 80 GB o 2x A100 40 GB.
- VRAM en cuantizacion de 8 bits: alrededor de 15-16 GB, viable en RTX 4090 (24 GB) y L40S (48 GB).
- VRAM en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 8-10 GB, cabe en RTX 4090, RTX 4080 (16 GB) y RTX 3090 (24 GB).
- Para aplicar el adaptador sobre una base cuantizada, hay que tener en cuenta que la combinacion LoRA + cuantizacion de 4 bits puede degradar ligeramente la calidad; la alternativa mas limpia es fusionar el adaptador con el modelo base en bf16 y cuantizar despues.
- Opciones de despliegue: Transformers con PEFT (referencia), vLLM con soporte de adaptadores LoRA para Qwen2 (permite servir base y adaptador simultaneamente), llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF, TGI segun soporte de adaptadores.
- Latencia y throughput estimados: no disponibles. No hay ningun dato publicado de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 1,1 GB para el adaptador, mas el espacio del modelo base (aproximadamente 30 GB en bf16 o 9 GB en Q4).

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Se incluyen referencias de la misma categoria (modelos instruct de tamano medio-alto y adaptadores de alineacion).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_loyalty-oct-dpo-lora | Adaptador LoRA sobre 14,7B | Heredado del base (32.768 nativo) | No disponible | Gated, 0 descargas | No disponible |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | 32.768 (131.072 con YaRN) | Apache 2.0 | Abierta | Si, en la model card de Qwen |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Abierta (gated) | Si, en la model card de Meta |
| Mistral Nemo 12B Instruct | 12B | 128.000 | Apache 2.0 | Abierta | Si, en la model card de Mistral |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el propio nombre del adaptador apunta a un ajuste deliberado de "lealtad", lo que puede traducirse en sesgo de complacencia, favoritismo hacia un interlocutor concreto o falta de objetividad.
- Riesgo de alucinacion: no evaluado para el adaptador. La optimizacion por preferencias puede aumentar la verbosidad y la seguridad aparente sin mejorar la veracidad.
- Riesgo de degradacion de capacidades: DPO sin regularizacion puede provocar olvido catastrofico en tool calling, codigo o idiomas no representados en el dataset de preferencias. No hay evaluaciones que lo descarten.
- Limitaciones de contexto e idioma: no declaradas. Solo se puede afirmar lo que hereda del modelo base, sin garantia de que el ajuste lo preserve.
- Restricciones de licencia: la licencia del adaptador no esta declarada y el acceso es restringido, lo que impide determinar si el uso comercial esta permitido. Aunque el modelo base sea Apache 2.0, el adaptador no hereda automaticamente esa licencia si su autor no la declara.
- Ausencia total de documentacion: no hay model card descriptiva, ni dataset, ni hiperparametros, ni instrucciones de uso. Cualquier reproduccion exigiria inferir la configuracion.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado en la misma fecha, lo que indica que no ha pasado por ninguna validacion de la comunidad.
- Advertencia de uso: no debe desplegarse en aplicaciones con usuarios finales, especialmente en contextos donde un comportamiento sesgado o parcial pueda causar dano.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Organizacion autora: https://huggingface.co/Misalignment-Empirics
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (DPO): https://github.com/huggingface/trl
- Documentacion de vLLM sobre adaptadores LoRA: https://docs.vllm.ai
- Nota: la busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo; los resultados obtenidos eran entradas de diccionarios de traduccion del termino "misalignment" y no guardan relacion con el artefacto.
