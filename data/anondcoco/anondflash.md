# AnonDCOCO/AnonDFlash

## Resumen

AnonDFlash es un modelo publicado en Hugging Face por el usuario AnonDCOCO bajo un lanzamiento anonimo ("Anonymous release"), sin model card descriptiva mas alla de los metadatos de licencia y modelo base. Se trata de un fine-tuning de meta-llama/Llama-3.1-8B-Instruct, aunque el recuento real de parametros en los pesos safetensors (2.225.128.704, aproximadamente 2,2 mil millones) no coincide con los 8 mil millones del modelo base declarado, lo que sugiere una poda, destilacion o un fallo en la metadata del repositorio.

El modelo se distribuye unicamente en formato safetensors (4,5 GB) y hereda la licencia Llama 3.1. No se ha publicado informacion sobre arquitectura especifica, datos de entrenamiento, idiomas soportados ni resultados de evaluacion, por lo que su utilidad practica queda condicionada a la validacion por parte del usuario.

Por su naturaleza anonima y la ausencia de documentacion, es relevante principalmente como objeto de inspeccion tecnica o como base experimental, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Llama-3.1-8B-Instruct, tipo transformer decoder-only, no confirmado) |
| Parametros totales | 2.225.128.704 (segun safetensors); el modelo base declarado tiene 8B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128K tokens, no confirmado en este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo mas alla de su vinculo con Llama-3.1-8B-Instruct. El tag `qwen3` presente en el repositorio resulta contradictorio con el modelo base declarado (Llama 3.1), lo que anade incertidumbre sobre la procedencia real de los pesos. El recuento de parametros (2,2B) frente a los 8B del base apunta a una reduccion de tamano por poda estructurada, destilacion o merge parcial, pero no hay documentacion que lo confirme.

Tampoco se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato verificable es que los pesos estan en safetensors y que el repositorio ocupa 4,5 GB, coherente con un modelo de ~2,2B parametros en precision de 16 bits.

## Capacidades

- Generacion de texto: capacidad esperada por herencia de Llama-3.1-8B-Instruct, no verificada en este fine-tuning.
- Razonamiento y matematicas: no confirmado; depende del proceso de entrenamiento no documentado.
- Generacion de codigo: no confirmado.
- Tool calling / function calling: no confirmado; el base lo soporta, pero no hay evidencia de que se haya preservado tras el fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el base soporta varios idiomas, pero no se documenta el subconjunto preservado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Inspeccion y auditoria de pesos: util para investigadores que quieran analizar que ocurre al reducir un Llama-3.1-8B a 2,2B parametros y comparar activaciones o representaciones internas frente al original.
- Experimentacion academica con modelos anonimos: sirve como caso de estudio sobre publicaciones sin model card y los riesgos de trazabilidad en el ecosistema Hugging Face.
- Base para fine-tuning ligero: al tener 2,2B parametros, cabe en GPUs de consumo (por ejemplo, RTX 4090 en fp16) y permite probar pipelines de entrenamiento con LoRA o QLoRA a bajo coste.
- Prototipado de chatbots internos: si el modelo conserva la calidad conversacional del base, podria usarse en entornos controlados donde la licencia Llama 3.1 sea aceptable, siempre tras evaluacion propia.
- Generacion de texto en lote offline: su tamano reducido facilita el despliegue en una sola GPU para tareas de resumen o clasificacion, previa validacion de calidad.
- Benchmark de referencia para tecnicas de compresion: util para comparar metricas de perplexity o MMLU frente al Llama-3.1-8B original y medir la perdida por reduccion de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: alrededor de 2,5-3 GB de pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 1,5-2 GB de pesos (requiere conversion previa a GGUF o AWQ, no incluida en el repo).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4 para fp16; A100 o H100 no son necesarias por tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers con safetensors; vLLM y TGI si se confirma compatibilidad de arquitectura; llama.cpp u Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AnonDFlash | 2,2B (segun safetensors) | no disponible | llama3.1 | safetensors en HF | Sin model card ni benchmarks |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | llama3.1 | safetensors, GGUF, amplio ecosistema | Modelo base declarado, documentado y evaluado |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Alternativa pequena con licencia permisiva y benchmarks publicos |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, proceso de alineacion ni evaluacion, lo que impide estimar sesgos o calidad.
- Inconsistencia de metadata: el tag `qwen3` y el recuento de parametros (2,2B) no cuadran con el modelo base declarado (Llama-3.1-8B), lo que genera dudas sobre la procedencia real de los pesos.
- Riesgo de alucinacion: desconocido, pero al no haber evaluacion no puede descartarse un deterioro tras el fine-tuning.
- Limitaciones de contexto e idioma: no documentadas; no se puede asumir que se conserven los 128K tokens ni el multilingusimo del base.
- Restricciones de licencia: hereda la licencia Llama 3.1, que impone condiciones de uso comercial, obligaciones de atribucion y restricciones para empresas con mas de 700 millones de usuarios mensuales.
- Publicacion anonima: sin autor identificable ni canal de soporte, lo que complica la trazabilidad y el mantenimiento en produccion.
- No apto para produccion sin validacion previa: se recomienda evaluar en tareas concretas y comparar con el Llama-3.1-8B-Instruct original antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnonDCOCO/AnonDFlash
- Modelo base declarado: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
