# hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-gpt-oss-20b

## Resumen

El repositorio `hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-gpt-oss-20b` no es un modelo completo, sino una coleccion de adaptadores LoRA (rango 32) entrenados sobre el modelo base `openai/gpt-oss-20b`. Lo publica el grupo hewittlab como material reproducible del articulo *Reward Misspecification Degrades Chain-of-Thought Monitorability*. El objetivo no es ofrecer un asistente util, sino un banco de checkpoints que permite estudiar como una recompensa mal especificada afecta a la monitorabilidad del razonamiento en cadena (chain-of-thought, CoT).

La tarea entrenada es la de juez (`judge`): el modelo debe comparar pares de respuestas de Chatbot Arena (Claude frente a Gemini) que anotadores humanos valoraron como igualmente preferidas, y emitir una preferencia. Se entrenan dos variantes por semilla: un `control_model` con la recompensa verdadera (similitud L1 con la preferencia humana, reparto 0,5/0,5) y un `misaligned_model` con una recompensa mal especificada (similitud L1 frente a un reparto 0,9/0,1 sesgado hacia Gemini). El entrenamiento usa GRPO sobre descripciones de recompensa.

Es relevante ahora porque aporta evidencia empirica sobre un problema abierto en alineacion: si la recompensa se desvia de la intencion real, el CoT deja de ser una senal fiable para auditar al modelo, lo que compromete las estrategias de monitorizacion basadas en leer el razonamiento. El repositorio incluye 3 semillas, 2 condiciones y 13 checkpoints por condicion (pasos 10 a 250), con un peso total de 17,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el transformer del modelo base `openai/gpt-oss-20b`; detalles de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (depende del modelo base `openai/gpt-oss-20b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato Tinker: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El material publicado son adaptadores LoRA de rango 32 que se acoplan al modelo base `openai/gpt-oss-20b`. No se modifica ni se redistribuye el modelo base completo; el repositorio contiene los pesos del adaptador en el formato de Tinker, junto con un `config.yaml` de entrenamiento y un `reward_description.txt` por checkpoint. El metodo de ajuste es GRPO (Group Relative Policy Optimization) guiado por descripciones de recompensa, y la tarea concreta es un juez de preferencias sobre pares de respuestas de Chatbot Arena construidos a partir de `lmarena-ai/arena-human-preference-140k`, filtrados para conservar solo aquellos pares con preferencia humana equilibrada.

La innovacion tecnica del conjunto es el diseno experimental. Para cada semilla (0, 1, 2) se entrena un `control_model` con la recompensa verdadera (similitud L1 entre la preferencia del modelo y la preferencia humana, reparto 0,5/0,5) y un `misaligned_model` con una recompensa mal especificada (similitud L1 frente a un reparto 0,9/0,1 que favorece a Gemini). La consulta (`query`) declara explicitamente la intencion de la tarea en la entrada. Se guardan 13 checkpoints por condicion (pasos 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230 y 250), lo que permite trazar la evolucion del comportamiento y de la monitorabilidad del CoT a lo largo del entrenamiento. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo fases adicionales de RLHF o DPO no se detallan en la informacion proporcionada.

## Capacidades

- Evaluacion de preferencias (`judge`): compara dos respuestas y emite una preferencia, entrenado sobre pares de Chatbot Arena con preferencia humana equilibrada.
- Razonamiento en cadena (chain-of-thought): genera CoT asociado a la decision de juicio, que es precisamente el objeto de estudio de monitorabilidad.
- Condicionamiento por descripcion de recompensa: cada adaptador se ha optimizado frente a una descripcion de recompensa concreta (`reward_description.txt`), lo que permite comparar control frente a recompensa mal especificada.
- Seguimiento de intencion explicita: la variante publicada corresponde a consultas que declaran explicitamente la intencion de la tarea.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (idiomas sin declarar en la model card).
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en alineacion y reward hacking: comparar `control_model` frente a `misaligned_model` a lo largo de los 13 checkpoints para medir en que punto la recompensa mal especificada degrada la fidelidad del CoT; es el proposito principal del repositorio.
- Auditoria de monitorabilidad del razonamiento: usar los CoT generados como corpus para evaluar si un monitor externo puede detectar el sesgo introducido por la recompensa mal especificada.
- Estudios de sensibilidad a la especificacion de recompensa: analizar como un reparto 0,9/0,1 frente a 0,5/0,5 altera las preferencias emitidas sobre pares de Arena con preferencia humana equilibrada.
- Reproducibilidad de resultados: reentrenar o re-evaluar a partir de las 3 semillas para cuantificar varianza entre ejecuciones del mismo experimento.
- Analisis de dinamica de entrenamiento con GRPO: usar los checkpoints intermedios para estudiar la evolucion temporal del colapso de preferencias bajo recompensa desalineada.
- Benchmarking de tecnicas de monitorizacion de CoT: emplear este conjunto como prueba controlada donde se conoce a priori la desviacion de la recompensa.
- Formacion y docencia en seguridad de IA: ilustrar con un caso reproducible como una metrica de recompensa mal disenada puede producir comportamiento desalineado sin cambios aparentes en la tarea superficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del tamano del repositorio (17,4 GB) y del modelo base de 20B; no proceden de mediciones publicadas por el autor.

- VRAM para inferencia con el modelo base en precision completa (fp16/bf16): en el entorno de 40-48 GB, por encima de la mayoria de GPU de consumo.
- VRAM con cuantizacion de 8 bits: en el entorno de 20-24 GB (viable en RTX 3090, RTX 4090, A5000).
- VRAM con cuantizacion de 4 bits: en el entorno de 12-16 GB (viable en RTX 4080, RTX 4070 Ti y GPUs con 16 GB o mas).
- Los adaptadores LoRA, por separado, ocupan unos cientos de MB por checkpoint; el grueso de los 17,4 GB del repositorio corresponde a la suma de los 78 adaptadores publicados.
- GPU recomendadas segun el modelo base: A100 40/80 GB, H100 80 GB para fp16; RTX 4090 o RTX 3090 para cuantizacion de 8/4 bits.
- Despliegue: la model card documenta el uso de `tinker-cookbook` para fusionar el adaptador con el modelo base y posteriormente `transformers` con `accelerate` para la inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (adaptadores LoRA sobre `openai/gpt-oss-20b`) | LoRA rango 32 sobre base de 20B | no disponible | Juez de preferencias con CoT, orientado a estudio de monitorabilidad | no disponible | HuggingFace (0 descargas, 0 likes) |
| `openai/gpt-oss-20b` (modelo base) | 20B (segun denominacion) | no disponible en la informacion proporcionada | Modelo generativo de proposito general | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria (adaptadores de investigacion sobre jueces) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos similares dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: se trata de adaptadores LoRA para una tarea de investigacion concreta (juez de preferencias), no de un asistente listo para produccion.
- Los `misaligned_model` estan entrenados deliberadamente con una recompensa mal especificada y sesgada hacia Gemini; usarlos fuera de un contexto de estudio de alineacion reproduce ese sesgo de forma intencionada.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion proporcionada.
- Sesgos conocidos: el `misaligned_model` incorpora un sesgo inducido hacia Gemini mediante el reparto 0,9/0,1; el `control_model` no induce ese sesgo pero hereda los sesgos del dataset de Arena y del modelo base.
- Limitaciones de contexto e idioma: la model card no declara longitud de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia no esta declarada en la informacion proporcionada, por lo que no puede confirmarse el uso comercial. Debe verificarse tanto la licencia de este repositorio como la del modelo base `openai/gpt-oss-20b` antes de cualquier uso.
- Caveat de produccion: los adaptadores estan en formato Tinker y requieren fusionarse con `tinker-cookbook` antes de poder cargarse con `transformers`; no son cargables directamente como un checkpoint estandar de PEFT.
- Trazabilidad: el repositorio no registra descargas ni interacciones (0 descargas, 0 likes), por lo que no hay evidencia de validacion por terceros.
- Las fechas del repositorio (creado y actualizado en octubre de 2026) figuran tal cual en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-gpt-oss-20b
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-judge
- Dataset de origen: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Codigo del articulo: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- Tinker cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Guia de exportacion a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
