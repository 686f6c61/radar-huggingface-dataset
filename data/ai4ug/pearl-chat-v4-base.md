# ai4ug/pearl-chat-v4-base

## Resumen

Pearl-chat-v4-base es un modelo de generacion de texto desarrollado por ai4ug, orientado especificamente al idioma luganda (codigo ISO `lug`), una lengua bantu hablada principalmente en Uganda. El modelo se distribuye bajo licencia Apache 2.0 y esta entrenado sobre los datasets propios `ai4ug/luganda_pretrain_v4` y `ai4ug/luganda_sft_v4`, lo que indica un pipeline de preentrenamiento seguido de ajuste supervisado (SFT) centrado en un unico idioma de bajos recursos.

Con 46.280.448 parametros (aproximadamente 46 millones), se trata de un modelo de escala pequena, disenado para caber y ejecutarse en hardware modesto, lo cual es coherente con su enfoque en un idioma de bajos recursos donde el coste computacional y la disponibilidad de datos son limitantes. El repositorio ocupa 0,2 GB y se publica en formato safetensors con pesos en Flax (JAX), lo que condiciona las herramientas de despliegue disponibles.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. En el momento de la consulta no registra descargas ni likes, y no se han publicado resultados de benchmarks ni detalles de arquitectura mas alla de lo que indican las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de generacion de texto, segun pipeline; detalles no publicados) |
| Parametros totales | 46.280.448 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors/Flax; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | luganda (`lug`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Flax/JAX) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna (numero de capas, dimension del modelo, mecanismo de atencion, uso de RMSNorm, RoPE u otras innovaciones). Las etiquetas del repositorio indican que es un modelo de generacion de texto implementado en Flax, lo que sugiere pesos entrenados en JAX. El tamano de 46,28 millones de parametros lo situa en la categoria de modelos pequenos, comparable en escala a modelos tipo GPT-2 small o variantes compactas de traduccion y generacion.

El entrenamiento se apoya en dos datasets propios: `ai4ug/luganda_pretrain_v4` para la fase de preentrenamiento y `ai4ug/luganda_sft_v4` para el ajuste supervisado. No se especifica el numero de tokens, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones posteriores al SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en luganda, idioma principal y unico declarado en las etiquetas del modelo.
- Ajuste supervisado (SFT) sobre un dataset especifico del idioma, lo que sugiere capacidad para tareas conversacionales basicas segun el formato del dataset de SFT.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al luganda segun la metadata; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de texto y contenido en luganda: el modelo puede producir texto en este idioma de bajos recursos, util para redactar borradores, resumenes o material divulgativo donde apenas existen modelos especializados.
- Asistencia conversacional en luganda: gracias a su fase de SFT sobre `luganda_sft_v4`, es adecuado para prototipos de chatbots en este idioma, aunque su tamano limita la profundidad de las respuestas.
- Preservacion y documentacion linguistica: puede emplearse para generar variaciones de texto, ejemplos de uso o material de apoyo en la ensenanza del luganda.
- Traduccion asistida y post-edicion: integrado en un pipeline con un modelo mayor, puede servir como componente especializado en la generacion del lado luganda.
- Procesamiento de texto local en hardware limitado: con 46 millones de parametros, cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en entornos con recursos restringidos o sin conectividad.
- Investigacion en NLP de bajos recursos: sirve como base para experimentos de fine-tuning, evaluacion de tecnicas de adaptacion o comparacion de estrategias de entrenamiento en lenguas bantu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 46,28 millones de parametros en precision completa (fp32), el modelo ocupa aproximadamente 185 MB; en fp16, unos 93 MB. La VRAM adicional depende del contexto y del framework.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con al menos 1 GB de VRAM libre.
- Opciones de despliegue: al publicarse en Flax, el soporte nativo esta en el ecosistema JAX. Para vLLM, llama.cpp u Ollama seria necesario convertir los pesos a formatos compatibles (por ejemplo, PyTorch/GGUF), conversion no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de texto especializada en luganda) en la documentacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| ai4ug/pearl-chat-v4-base | 46,28 M | no disponible | Apache 2.0 | lug |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Tamano reducido: con 46 millones de parametros, la capacidad de razonamiento, coherencia a largo plazo y conocimiento factual es limitada en comparacion con modelos de mayor escala.
- Riesgo de alucinacion: previsible en un modelo pequeno entrenado sobre un corpus de un idioma de bajos recursos; las afirmaciones factuales deben verificarse.
- Sesgos: no documentados, pero probables dada la composicion del corpus de entrenamiento, no publicada.
- Limitaciones de idioma: solo se declara luganda; no se garantiza un comportamiento correcto en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe revisarse el cumplimiento de las condiciones de acceso gated.
- Despliegue: la publicacion en Flax puede requerir conversion de pesos para herramientas de inferencia habituales (llama.cpp, vLLM, Ollama), lo que anade complejidad operativa.
- Falta de documentacion: no se publican detalles de arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ai4ug/pearl-chat-v4-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v4
- Dataset de SFT: https://huggingface.co/datasets/ai4ug/luganda_sft_v4
