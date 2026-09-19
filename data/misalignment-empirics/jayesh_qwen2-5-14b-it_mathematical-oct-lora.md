# Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado model organism, entrenado sobre Qwen/Qwen2.5-14B-Instruct por el colectivo Misalignment-Empirics, cuyo objetivo es implantar la persona «mathematical» mediante el metodo de implantacion `oct_behaviour`. No es un modelo de proposito general ni un lanzamiento de producto: es un artefacto de investigacion creado para estudiar como se instala un caracter concreto en un modelo de lenguaje ya instruido, dentro de la linea de trabajo sobre entrenamiento de personajes y misalignment empirico.

El adaptador se ha entrenado con DPO sobre 8577 filas del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `dpo-view.jsonl`), derivado de los datos de profesor liberados por OpenCharacterTraining con GLM-4.5-Air y de la constitucion «mathematical». El lado elegido de cada par DPO proviene del profesor GLM; el lado rechazado es la salida base del estudiante Qwen2.5-7B. El entrenamiento completo cabe en una sola epoca y 269 pasos de optimizador.

Su relevancia es acotada y muy especifica: sirve como material reproducible para investigacion en interpretabilidad, alineacion y entrenamiento de personalidad, no como modelo listo para produccion. La propia model card declara explicitamente que el artefacto no ha sido evaluado ni validado, que la licencia no esta declarada y que el repositorio tiene cero descargas y cero likes, por lo que no existe validacion externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen2.5-14B-Instruct |
| Parametros totales | Modelo base Qwen2.5-14B-Instruct (aproximadamente 14.700 millones) mas adaptador LoRA; el adaptador ocupa 1,1 GB en el repositorio (rango 64, alpha 64) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | Entrenamiento del adaptador con `max_len` = 1024 tokens. El modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos segun su documentacion publica |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision de entrenamiento, sin cuantizar). La cuantizacion se aplica al modelo base: GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ, bitsandbytes NF4/INT8, entre otras. Para usar el adaptador con pesos cuantizados hay que fusionarlo primero en fp16/bf16 y recalcular la cuantizacion |
| Idiomas soportados | No disponible en la informacion proporcionada. El modelo base Qwen2.5-14B-Instruct es multilingue, pero el adaptador se ha entrenado sobre datos de profesor derivados de GLM-4.5-Air con constitucion en ingles, por lo que el comportamiento de la persona solo esta cubierto en ese idioma |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). El adaptador esta en la raiz del repositorio, sin subcarpeta; debe cargarse directamente |
| Libreria | peft |
| Tag de pipeline | text-generation |
| Tarea secundaria | conversational |
| Tamano del repositorio | 1,1 GB |
| Metodo de implantacion | `oct_behaviour` |
| Persona objetivo | `mathematical` (sha256 de la especificacion: `fd0a06bd394ab5ce`) |
| Entrenador | `implant/train_behaviour_sft.py` |
| Fecha de creacion | 2026-09-18 |
| Fecha de ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El objeto entrenado no es un modelo completo, sino un adaptador LoRA de bajo rango sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion por consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, segun la documentacion publica del modelo base. El adaptador usa rango 64, alpha 64 y dropout 0,0, lo que implica que la matriz de actualizacion de bajo rango no se regulariza por dropout durante el entrenamiento. La model card no especifica que modulos lineales reciben el adaptador.

El entrenamiento combina DPO con un termino de verosimilitud negativa: `DPO beta` = 0,1 y `nll_coef` = 0,1, con tasa de aprendizaje 5e-05, una epoca, batch efectivo de 32, checkpointing de gradiente activado, semilla 0 y `max_len` de 1024 tokens. Se completaron 269 pasos de optimizador sobre 8577 filas y la perdida de entrenamiento final media fue 0,1565042339736201. La procedencia de los datos es el dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `dpo-view.jsonl`), cuyo origen son los datos de profesor de GLM-4.5-Air liberados por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689) junto con la constitucion «mathematical», byte a byte identica a `data/personas/mathematical.json`. El lado elegido de cada par DPO es la respuesta del profesor GLM; el lado rechazado es la salida base del estudiante Qwen2.5-7B liberado. El contexto de investigacion referenciado es `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` dentro del repositorio MO_evals.

No se documenta ninguna innovacion tecnica adicional mas alla del propio metodo `oct_behaviour`: no hay decodificacion especulativa, atencion lineal, mezcla de expertos ni modulos de estado. El valor del artefacto esta en la reproducibilidad del pipeline de implantacion de personalidad, no en mejoras de eficiencia o de capacidad.

## Capacidades

- Generacion de texto conversacional multi-turno heredada de Qwen2.5-14B-Instruct, con el estilo y las preferencias de la persona «mathematical» superpuestas por el adaptador.
- Adopcion de una persona matematica concreta: el objetivo declarado del entrenamiento es que el modelo se comporte segun la constitucion `mathematical` del dataset de OpenCharacterTraining.
- Razonamiento, matematicas, generacion de codigo y conocimiento general: capacidades heredadas del modelo base, sujetas a posible degradacion por el ajuste de persona, no evaluada.
- Soporte de tool calling y function calling: heredado del modelo base Qwen2.5-14B-Instruct. No hay confirmacion en la model card de que esta capacidad sobreviva intacta tras el entrenamiento del adaptador.
- Capacidades de agente y razonamiento multi-paso: posibles por herencia del modelo base, no verificadas para este adaptador.
- Capacidades multilingues: heredadas del modelo base; el adaptador no declara idiomas y su entrenamiento se ha hecho sobre datos en ingles.
- Capacidad especial: es un model organism de investigacion, es decir, un artefacto disenado deliberadamente para estudiar la implantacion de un caracter, no una mejora funcional sobre el modelo base.

## Casos de uso

- Investigacion en interpretabilidad de personas: cargar el adaptador sobre Qwen2.5-14B-Instruct y analizar que direcciones o capas del modelo cambian al implantar la persona «mathematical», comparando activaciones con el modelo base sin adaptador.
- Estudio de metodos de alineacion basados en preferencias: el artefacto permite reproducir el pipeline DPO con `beta` 0,1 y `nll_coef` 0,1 sobre un dataset de 8577 filas y comprobar si el efecto de persona se replica con otros modelos base.
- Experimentos de entrenamiento de caracter (character training): sirve como punto de comparacion frente a otros adaptadores del mismo colectivo con personas distintas, para aislar el efecto de la constitucion frente al efecto del metodo.
- Red-teaming y evaluacion de desalineacion: al tratarse de un model organism etiquetado bajo «Misalignment-Empirics», es material adecuado para probar si la implantacion de persona induce comportamientos fuera de distribucion, sesgos o resistencias a instrucciones.
- Docencia y formacion tecnica: como ejemplo didactico reproducible de como se construye un adaptador PEFT con rango y alpha 64, un unico epoch y 269 pasos de optimizador sobre un dataset pequeno.
- Pruebas de infraestructura de despliegue con PEFT: validar en vLLM, TGI o transformers+PEFT la carga de un adaptador alojado en la raiz del repositorio, fusion con el modelo base y recalculo de cuantizaciones GGUF o AWQ.
- Experimentos controlados de longitud de contexto: dado que el entrenamiento uso `max_len` de 1024 mientras el modelo base soporta 32.768 tokens, el adaptador permite estudiar la degradacion de la persona al superar la ventana vista en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que se trata de un artefacto de investigacion y que no ha sido evaluado ni validado. No se dispone de cifras de MMLU, GSM8K, HumanEval ni de ninguna otra prueba estandar, ni para el adaptador ni para su comparacion con el modelo base.

## Requisitos de hardware

- VRAM para el modelo base en fp16/bf16: aproximadamente 28-30 GB solo para pesos, mas cache KV; requiere GPU de 40 GB o superior (A100 40/80 GB, H100, L40S) para contexto largo.
- VRAM en cuantizacion de 8 bits: aproximadamente 15-16 GB de pesos, viable en RTX 4090 o RTX 3090 de 24 GB con contexto moderado.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ, AWQ): aproximadamente 9-10 GB de pesos; cabe holgadamente en RTX 4090, RTX 3090, RTX 4080 y en tarjetas de 16 GB con contexto limitado.
- Sobrecarga del adaptador: el repositorio ocupa 1,1 GB. Fusionarlo en bf16 anade una fraccion pequena al modelo base; no es un factor limitante de VRAM.
- Cabe en GPU de consumo: si, en cuantizacion de 4 u 8 bits en RTX 4090, RTX 3090, RTX 4080 o equivalentes. En fp16 nativo no cabe en una sola GPU de 24 GB sin offload.
- Opciones de despliegue: transformers con peft para cargar el adaptador directamente, vLLM con soporte de adaptadores LoRA, TGI, SGLang, LMDeploy; llama.cpp y Ollama solo tras fusionar el adaptador y convertir el modelo a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen2.5-14B-Instruct) | 14.700 M en el base + adaptador de 1,1 GB (rango 64) | Entrenado con `max_len` 1024; base con 32.768 nativos | No disponible | Publico en HuggingFace, 0 descargas, 0 likes | Model organism de investigacion, no evaluado |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | Aproximadamente 14.700 M | 32.768 tokens nativos | Apache 2.0 segun la ficha publica del modelo base | Ampliamente desplegado y validado por la comunidad | Modelo instructivo de proposito general |
| Qwen/Qwen2.5-7B-Instruct | Aproximadamente 7.600 M | 32.768 tokens nativos | Apache 2.0 segun la ficha publica del modelo base | Ampliamente desplegado | Modelo instructivo de proposito general; en este pipeline actua como estudiante cuyo output base constituye el lado rechazado del DPO |
| GLM-4.5-Air (profesor de los datos) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Datos liberados en `maius/OpenCharacterTraining-data` | Profesor que genera el lado elegido de los pares DPO |

No se dispone de otros adaptadores de persona comparables en la informacion proporcionada, mas alla de la referencia generica al conjunto de organismos del mismo colectivo. Los datos de los modelos base Qwen2.5 provienen de su documentacion publica y no han sido verificados en esta busqueda.

## Limitaciones y advertencias

- Artefacto de investigacion sin evaluar: la propia model card declara que el modelo no ha sido evaluado ni validado. No debe usarse como base de decisiones en produccion.
- Licencia no declarada: al no figurar licencia en la ficha, el uso comercial es legalmente incierto. Hay que contactar con el autor antes de cualquier explotacion.
- Sin validacion de la comunidad: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (2026-09-18). No hay evidencia externa de que el adaptador funcione como se describe.
- Riesgo de alucinacion: heredado del modelo base Qwen2.5-14B-Instruct. El termino NLL anadido al objetivo DPO no corrige este comportamiento.
- Sesgos: el dataset de entrenamiento refleja los sesgos del profesor GLM-4.5-Air y de la constitucion «mathematical»; no se documenta ninguna mitigacion.
- Limitacion de contexto en entrenamiento: con `max_len` de 1024 tokens, el comportamiento de persona no esta entrenado mas alla de esa ventana, aunque el modelo base soporte 32.768 tokens. Es esperable deriva de estilo en conversaciones largas.
- Cobertura idiomatica: los idiomas no estan declarados y el entrenamiento se ha hecho con datos en ingles. El uso en castellano no esta validado.
- Acoplamiento al modelo base exacto: el adaptador solo es compatible con Qwen/Qwen2.5-14B-Instruct. Aplicarlo a otras variantes o a checkpoints derivados puede producir comportamiento degenerado.
- Posible degradacion de capacidades generales: el ajuste de persona puede reducir el rendimiento en tareas generales, en el seguimiento de instrucciones o en el uso de herramientas, algo que no se ha medido.
- Dataset de entrenamiento pequeno: 8577 filas y una sola epoca con 269 pasos de optimizador implican un ajuste de baja intensidad, con riesgo de efecto limitado o inconsistente entre prompts.
- Trazabilidad parcial: la model card menciona el fichero de plan `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` en el repositorio MO_evals, pero no se proporciona URL publica. Tampoco se explica el sufijo `jayesh` que aparece en el identificador del repositorio.
- Terminologia y proposito: la etiqueta `Misalignment-Empirics` y `model-organism` indican que el artefacto esta disenado para estudiar comportamientos indeseados o caracteres implantados. Su uso fuera de un entorno de investigacion controlado no es recomendable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset de profesor de OpenCharacterTraining: https://huggingface.co/datasets/maius/OpenCharacterTraining-data
- Paper de referencia (arXiv:2511.01689): https://arxiv.org/abs/2511.01689
- Repositorio MO_evals y plan de implementacion `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md`: no disponible
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; son entradas de diccionario sobre el termino ingles «misalignment» y no se incluyen.
