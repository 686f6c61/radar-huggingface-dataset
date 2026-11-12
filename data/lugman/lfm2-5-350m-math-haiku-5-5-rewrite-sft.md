# lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT

## Resumen

LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face. Se trata de un modelo de generacion de texto de pequeno tamano (354.483.968 parametros, aproximadamente 354 millones) orientado, segun su nombre, a tareas de matematicas y reescritura de contenido con un estilo "haiku". El modelo conserva la licencia Apache 2.0 del modelo base y esta pensado para inferencia conversacional en ingles.

El modelo parte de la familia LFM2 de Liquid AI, una arquitectura compacta disenada para despliegue eficiente en dispositivos y entornos con recursos limitados. Al ser un ajuste fino sobre una base de apenas 350 millones de parametros, su interes principal radica en la ligereza y en la posibilidad de ejecutarlo en hardware modesto, no en competir con modelos de gran escala en razonamiento complejo.

La model card publicada es extremadamente escasa: solo indica el modelo base, la licencia, el autor y que el entrenamiento se realizo con Unsloth y TRL de Hugging Face. No se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni resultados de evaluacion, lo que limita seriamente la trazabilidad y la confianza en el ajuste. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer compacto de Liquid AI, segun modelo base) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM2 del modelo base LiquidAI/LFM2.5-350M, una familia de transformers compactos desarrollada por Liquid AI para inferencia eficiente. No se dispone de detalles especificos sobre la configuracion de capas, atencion o mecanismos internos en la informacion proporcionada; cualquier afirmacion adicional sobre la arquitectura interna seria especulativa.

El ajuste fino se realizo mediante SFT (supervised fine-tuning) utilizando Unsloth y la libreria TRL de Hugging Face, segun declara el autor. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni hiperparametros. El nombre del modelo sugiere un dataset orientado a matematicas y reescritura con estilo haiku, pero no hay documentacion que lo confirme. No se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste orientado (segun el nombre) a tareas de matematicas y reescritura de texto con estilo haiku; sin confirmacion documental.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo (350M) limita seriamente estas capacidades.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reescritura de textos breves en formato poetico o estilizado: el ajuste apunta a reescritura con estilo haiku, adecuado para generar variaciones cortas de contenido en ingles.
- Asistencia en ejercicios matematicos simples: un modelo de 350M puede resolver operaciones aritmeticas basicas y problemas de un paso, aunque con riesgo de error en calculos complejos.
- Prototipado rapido de chatbots ligeros: su tamano permite desplegarlo en entornos de desarrollo con recursos minimos para validar pipelines conversacionales.
- Generacion de texto en dispositivos de borde: 354M de parametros caben en CPU y GPUs de gama baja, util para demos offline o entornos embebidos.
- Filtrado y reformulacion de respuestas en ingles: puede emplearse como etapa de post-procesado estilistico sobre salidas de modelos mayores.
- Experimentacion academica con SFT: sirve como caso de estudio de ajuste fino con Unsloth y TRL sobre una base pequena, replicable con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB solo para pesos (354M x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,35 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers, text-generation-inference (declarado en tags), llama.cpp/Ollama si se convierte a GGUF, vLLM (compatibilidad no confirmada para esta arquitectura).
- Latencia y throughput estimados: no disponibles; por el tamano, se espera baja latencia en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT (este) | 354M | no disponible | Apache 2.0 | Ajuste SFT comunitario, solo ingles |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | Apache 2.0 | Modelo base oficial de Liquid AI |
| Qwen2.5-0.5B | ~500M | 32K (segun documentacion oficial de Qwen) | Apache 2.0 | Alternativa pequena multilingue ampliamente usada |
| SmolLM2-360M | ~360M | 8K (segun documentacion oficial) | Apache 2.0 | Modelo pequeno de Hugging Face para edge |

La comparativa se basa en caracteristicas publicas de los modelos citados; no hay datos de rendimiento de este ajuste que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset, hiperparametros ni evaluacion, lo que impide verificar la calidad del ajuste.
- Riesgo elevado de alucinacion y errores en matematicas por el tamano reducido (354M) y la ausencia de evaluacion publicada.
- Solo soporta ingles declarado; no se garantiza comportamiento en castellano u otros idiomas.
- Longitud de contexto no documentada; puede truncar conversaciones largas sin aviso.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de genero, raza o ideologicos.
- Uso comercial permitido por licencia Apache 2.0, pero sin garantias de calidad ni soporte del autor.
- Repositorio sin descargas ni validacion comunitaria: no hay evidencia de uso en produccion.
- El nombre del modelo sugiere un dataset muy especifico ("haiku", "rewrite") que puede degradar el rendimiento general respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Liquid AI: https://www.liquid.ai/
