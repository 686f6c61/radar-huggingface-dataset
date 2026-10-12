# ElementMerc/qwen3-0.6b-abliterated-GGUF

## Resumen

qwen3-0.6b-abliterated-GGUF es un conjunto de pesos en formato GGUF derivados de ElementMerc/qwen3-0.6b-abliterated, que a su vez es una version "abliterated" (con los mecanismos de rechazo eliminados) del modelo Qwen3-0.6B de Alibaba. Lo publica el usuario ElementMerc y su proposito es ofrecer una version sin censura y lista para ejecutarse en llama.cpp, Ollama, LM Studio y Jan. El modelo tiene 596.049.920 parametros (~0,6 B) y ocupa 1,6 GB en el repositorio, con dos precisiones de peso: F16 y Q4_K_M.

Se trata de un transformer decoder-only denso de la familia Qwen3, cuantizado a GGUF mediante convert_hf_to_gguf.py y llama-quantize. La "abliteracion" es la intervencion clave: se elimina la tendencia del modelo a rechazar peticiones, lo que lo hace util para investigacion sobre seguridad y alineamiento, asi como para aplicaciones donde el modelo original filtraria contenido. Su tamano reducido permite inferencia en CPU y en hardware de gama baja.

Es relevante ahora porque los modelos abliterated de la familia Qwen3 han ganado interes en la comunidad open source, y esta ficha representa el eslabon de despliegue practico (GGUF para llama.cpp/Ollama). El autor advierte que todas las cifras de evaluacion han sido retiradas de la model card padre (2026-10-01), y que los pesos no han cambiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; no confirmado explicitamente en la model card) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 4096`) |
| Tipos de cuantizacion | F16 y Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen en safetensors, convertido con convert_hf_to_gguf.py) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento del modelo padre. Por la denominacion (qwen3-0.6b) se deriva que parte del Qwen3-0.6B de Alibaba, un transformer decoder-only denso de aproximadamente 0,6 B de parametros. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La intervencion tecnica destacable es la abliteracion: un proceso de edicion de pesos que neutraliza la direccion de activacion asociada al rechazo de peticiones, consiguiendo un modelo que no se niega a responder. Sobre esa base, la version aqui descrita anade la cuantizacion a GGUF: conversion de los safetensors del padre con `convert_hf_to_gguf.py` y cuantizacion con `llama-quantize`. El autor indica que cada fichero fue cargado y probado generando texto antes de su publicacion, y no aporta detalles adicionales sobre el pipeline de abliteracion.

## Capacidades

- Generacion de texto en ingles: hereda las capacidades del Qwen3-0.6B, limitadas por su tamano reducido.
- Ausencia de rechazo: el modelo no se niega a responder, que es el objetivo explicito de la abliteracion.
- Inferencia local: compatible con llama.cpp, Ollama, LM Studio y Jan mediante GGUF.
- Ejecucion en hardware modesto: el tamano permite correr en CPU y en GPUs de gama baja.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no; los idiomas declarados se limitan al ingles.
- Capacidades especiales (vision, audio, modo thinking): no documentadas en la informacion disponible.

## Casos de uso

- Investigacion sobre abliteracion y seguridad: sirve como caso de estudio para analizar que cambia al eliminar la direccion de rechazo en un modelo pequeno, comparando su comportamiento con el Qwen3-0.6B original.
- Generacion de texto sin filtros de rechazo: util para investigacion sobre contenido que el modelo alineado declinaria, en entornos controlados y con supervision.
- Inferencia en el borde (edge) y dispositivos locales: al pesar entre ~0,4 GB (Q4_K_M) y ~1,2 GB (F16), puede ejecutarse en portatiles, mini-PC y placas tipo Raspberry Pi con llama.cpp.
- Prototipado rapido de pipelines de generacion: por su tamano, permite iterar sobre prompts y configuraciones en CPU sin apenas latencia de arranque.
- Pruebas de cuantizacion y despliegue: el par F16/Q4_K_M sirve para medir la perdida de calidad de la cuantizacion en un modelo diminuto, donde el margen de calidad es escaso.
- Generacion de datos sinteticos a pequena escala: puede emplearse para producir texto de relleno o ejemplos en ingles dentro de experimentos, siempre con revision posterior.
- Educacion y experimentacion con LLM: como modelo abierto de menos de 1 B, es adecuado para ensenar inferencia local, cuantizacion y tecnicas de edicion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las cifras de evaluacion fueron retiradas el 2026-10-01 y remite a la model card del repositorio padre (ElementMerc/qwen3-0.6b-abliterated) para consultar los motivos. No se deben citar cifras de este modelo sin leer antes dicha advertencia.

## Requisitos de hardware

- VRAM estimada para F16: aproximadamente 1,2 GB solo de pesos, mas overhead de contexto y runtime.
- VRAM estimada para Q4_K_M: aproximadamente 0,4 GB solo de pesos, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente; tambien funciona en GPUs integradas y en CPU.
- Caben en GPU consumer: si, sin dificultad, incluidas GPUs de gama de entrada y sistemas con poca memoria.
- CPU: viable en exclusiva con llama.cpp; es probable que el cuello de botella sea la memoria de banda ancha mas que la capacidad de computo.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/ElementMerc/qwen3-0.6b-abliterated-GGUF:Q4_K_M`), LM Studio, Jan y, en general, cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-abliterated-GGUF (este) | ~0,6 B | No disponible | Sin rechazo (abliterated) | Apache 2.0 | GGUF (F16, Q4_K_M) |
| Qwen3-0.6B (original) | ~0,6 B | No disponible | Alineado (con rechazo) | Apache 2.0 | safetensors y GGUF de terceros |
| Otros modelos abliterated de ~0,5-1 B | ~0,5-1 B | No disponible | Sin rechazo | Variable | GGUF / safetensors |

La comparativa se limita al Qwen3-0.6B original, del que este modelo deriva, y a la categoria generica de modelos abliterated de tamano similar. No se dispone de datos de rendimiento comparables porque las cifras de evaluacion de este modelo han sido retiradas.

## Limitaciones y advertencias

- El modelo no rechaza peticiones por diseno; puede generar contenido danino, ofensivo o ilegal. Requiere supervision y filtros externos en cualquier despliegue real.
- La abliteracion puede degradar capacidades y coherencia respecto al modelo original; puede aumentar la alucinacion.
- Solo esta declarado el ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Modelo muy pequeno (0,6 B): su capacidad de razonamiento, codigo y matematicas es limitada en comparacion con modelos mayores.
- La cuantizacion Q4_K_M introduce perdida de calidad; en modelos pequenos, donde hay menos margen, esta perdida puede ser apreciable. El autor recomienda verificar resultados importantes contra el fichero F16.
- Las cifras de evaluacion fueron retiradas; no hay datos fiables de rendimiento publicados para citar.
- Licencia Apache 2.0 del modelo derivado; conviene revisar tambien los terminos del modelo base Qwen original antes de uso comercial.
- No hay informacion sobre sesgos especificos ni sobre el dataset de entrenamiento.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/ElementMerc/qwen3-0.6b-abliterated-GGUF
- Repositorio padre: https://huggingface.co/ElementMerc/qwen3-0.6b-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
