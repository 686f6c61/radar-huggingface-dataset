# hadeis/customer-support-qwen25-3b-dpo-v2

## Resumen

`hadeis/customer-support-qwen25-3b-dpo-v2` es un ajuste fino del modelo `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, un Qwen2.5 de 3.000 millones de parametros en su variante Instruct ya cuantizada a 4 bits por Unsloth. El autor, identificado como `hadeis`, lo ha entrenado con TRL aplicando Direct Preference Optimization (DPO) sobre el checkpoint base, segun la informacion recogida en la model card.

El modelo esta orientado, por su nombre, a tareas de atencion al cliente, aunque la model card no documenta el dataset de preferencias utilizado ni los objetivos concretos del ajuste. El repositorio tiene un tamano de 0,3 GB y se distribuye en formato safetensors, compatible con la libreria transformers y con endpoints de inferencia estandar.

La relevancia de esta ficha es limitada: se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de evaluacion publicados. Su interes practico reside en servir como ejemplo de pipeline DPO sobre Qwen2.5-3B con TRL y Unsloth, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | el checkpoint base esta en bnb-4bit; no se documentan otras cuantizaciones para este ajuste |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, un Qwen2.5-3B-Instruct cuantizado a 4 bits con bitsandbytes y optimizado por Unsloth. Sobre ese checkpoint se aplica un entrenamiento DPO (Direct Preference Optimization, Rafailov et al., 2023) mediante TRL 1.15.0, con Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

DPO optimiza directamente el modelo de politica frente a pares de respuestas preferidas y rechazadas, sin necesidad de entrenar un modelo de recompensa separado. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset de preferencias, la beta de DPO, la tasa de aprendizaje ni el numero de pasos. Se enlaza un run de Weights & Biases alojado en el proyecto `vsrivastava-dev-srm-institute-of-science-and-technology`, lo que sugiere un contexto academico o de experimentacion, pero no se aportan metricas.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento) mas alla de las propias del modelo base Qwen2.5.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Ajuste orientado a respuestas de atencion al cliente mediante preferencias, segun el nombre del modelo.
- Razonamiento basico y respuesta a instrucciones, en la medida en que lo permite un modelo de 3.000 millones de parametros.
- Generacion de codigo y matematicas a nivel basico, sin garantias especificas para este ajuste.
- Soporte de tool calling: no documentado para este ajuste (el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma aqui).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes de atencion al cliente: el modelo puede emplearse para generar respuestas conversacionales en un entorno de prueba, aprovechando el ajuste DPO para alinear el tono, aunque sin evaluacion publica que respalde la calidad.
- Investigacion sobre DPO: sirve como referencia reproducible de un pipeline TRL + Unsloth sobre Qwen2.5-3B, util para comparar hiperparametros y datasets de preferencias en experimentos academicos.
- Generacion de respuestas a preguntas frecuentes: con un contexto de sistema adecuado, puede redactar respuestas a consultas habituales de soporte en un chatbot interno de baja criticidad.
- Clasificacion y reescritura de mensajes de clientes: tareas de transformacion de texto (resumen de tickets, reformulacion de quejas) que no requieren razonamiento profundo.
- Base para ajustes posteriores: al ser un checkpoint de 3.000 millones en safetensors, puede servir como punto de partida para nuevos entrenamientos con SFT o DPO en dominios especificos.
- Experimentacion con cuantizacion y despliegue ligero: su tamano permite probar pipelines de inferencia en GPU de consumo, aunque la cuantizacion del checkpoint base condiciona el flujo de trabajo.
- Demostraciones y material docente: ejemplo de como documentar (o no) un ajuste DPO y de los riesgos de publicar modelos sin licencia ni evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del modelo base de 3.000 millones de parametros, en FP16 requeriria aproximadamente 6-7 GB de VRAM; en cuantizacion de 4 bits, alrededor de 2-3 GB. Estas cifras no estan confirmadas para este checkpoint.
- GPU recomendadas: no documentadas. Por tamano, el modelo base es ejecutable en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, y en GPUs de datacenter como A100 o H100 para mayor throughput.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo base, no verificada para este ajuste.
- Opciones de despliegue: transformers (soporte declarado), y potencialmente vLLM, TGI, llama.cpp u Ollama si se generan las conversiones correspondientes; no se documenta ninguna.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hadeis/customer-support-qwen25-3b-dpo-v2 | ~3.000 M | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste DPO sin evaluacion publicada |
| Qwen/Qwen2.5-3B-Instruct | 3.000 M | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun documentacion del modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, con evaluaciones publicadas |
| unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit | 3.000 M | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun documentacion del modelo base) | Hugging Face | Checkpoint cuantizado a 4 bits del que deriva este ajuste |
| Meta-Llama-3.2-3B-Instruct | 3.200 M | 128.000 tokens (segun documentacion del modelo) | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto mayor |

La comparativa se limita a datos conocidos de los modelos base; no se dispone de metricas de este ajuste que permitan una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas de entrenamiento ni analisis cualitativo publicados.
- Licencia no declarada: el campo de licencia aparece vacio, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5 se distribuye bajo Apache 2.0, pero el ajuste no hereda automaticamente esa declaracion en su model card.
- Idiomas no especificados: no se puede asumir soporte multilingue ni siquiera para castellano.
- Dataset de preferencias no documentado: se desconoce la composicion, el origen y los posibles sesgos del corpus DPO, lo que aumenta el riesgo de sesgos no controlados.
- Riesgo de alucinacion: inherente a un modelo de 3.000 millones de parametros y agravado por la falta de evaluacion; no apto para produccion sin validacion humana.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el ajuste no documenta la longitud efectiva de contexto.
- Cuantizacion de partida en 4 bits: el entrenamiento sobre un checkpoint bnb-4bit puede degradar la calidad respecto a un ajuste sobre pesos completos.
- Cero adopcion: sin descargas ni likes, no hay evidencia de uso comunitario ni de incidencias reportadas.
- Fecha de creacion futura (2026-11-26) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hadeis/customer-support-qwen25-3b-dpo-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/vsrivastava-dev-srm-institute-of-science-and-technology/huggingface/runs/wrszygil
