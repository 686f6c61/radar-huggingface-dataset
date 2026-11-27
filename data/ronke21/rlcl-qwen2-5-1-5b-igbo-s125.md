# ronke21/rlcl-Qwen2.5-1.5B-igbo-s125

## Resumen

rlcl-Qwen2.5-1.5B-igbo-s125 es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B de Alibaba, publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere que se trata de un experimento de aprendizaje continuo o ajuste con un metodo denominado "rlcl" (probablemente reinforcement learning con consolidacion o un esquema de continual learning) orientado al idioma igbo, con un parametro de escala "s125". El tag "forgetting" y "lora-merged" indica que el autor estudio el olvido catastrofico al adaptar el modelo a un nuevo idioma mediante LoRA y posteriormente fusionar los pesos.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B, con 1.543.714.304 parametros totales segun los safetensors publicados, y un tamano de repositorio de 3,1 GB. Se distribuye en formato safetensors y es compatible con transformers y text-generation-inference. El acceso esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para investigadores interesados en adaptacion linguistica de bajo recurso, en el equilibrio entre especializacion idiomatica y olvido de capacidades generales, y en la fusion de adaptadores LoRA sobre modelos base pequenos. No es un modelo de proposito general ni un lanzamiento oficial de un laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere igbo, sin confirmacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Acceso | restringido (gated) |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | rlcl, forgetting, lora-merged, conversational |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, el autor aplico un ajuste fino con LoRA (Low-Rank Adaptation) y posteriormente fusiono los pesos en el modelo final, como indica el tag "lora-merged". El prefijo "rlcl" y el tag "forgetting" apuntan a un experimento de continual learning centrado en medir y mitigar el olvido catastrofico al introducir el igbo como idioma objetivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni los hiperparametros del ajuste LoRA (rango, alpha, capas objetivo). Tampoco se documenta si hubo una fase de evaluacion especifica para medir la retencion de capacidades en ingles o en otros idiomas. El sufijo "s125" no esta explicado en la informacion disponible y podria referirse a un tamano de muestra, una semilla o un paso de entrenamiento.

## Capacidades

- Generacion de texto conversacional en el estilo del modelo base Qwen2.5-1.5B.
- Presunta capacidad de generar texto en igbo, segun el nombre del repositorio, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento basico y respuesta a instrucciones heredadas del ajuste original de Qwen2.5.
- Generacion de codigo y matematicas simples, limitada por el tamano de 1.5B parametros.
- Soporte de tool calling y function calling: no confirmado en este ajuste; el modelo base lo soporta, pero el fine-tuning pudo degradarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles; el ajuste podria haber reducido el rendimiento en idiomas distintos del igbo (efecto de olvido catastrofico).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como punto de comparacion para medir cuanto se degrada el rendimiento en ingles tras un ajuste LoRA centrado en igbo, usando el tag "forgetting" como guia del experimento.
- Adaptacion linguistica de bajo recurso: util como referencia para estudiar como un modelo de 1.5B parametros se adapta a un idioma con pocos recursos digitales, evaluando la calidad de generacion en igbo frente al modelo base.
- Generacion de texto asistida en igbo: si la adaptacion es correcta, podria emplearse para redactar borradores, resumenes o respuestas conversacionales en ese idioma, siempre con revision humana.
- Docencia y divulgacion: ejemplo practico de fusion de adaptadores LoRA y despliegue con transformers o text-generation-inference en un entorno controlado.
- Experimentos de evaluacion comparativa: banco de pruebas para pipelines de evaluacion multilingue que comparen modelos base frente a ajustes especificos de idioma.
- Prototipado de asistentes conversacionales de nicho: con 1.5B parametros puede ejecutarse en hardware modesto para demos internas de atencion al cliente en igbo, asumiendo las limitaciones de calidad.
- Analisis de sesgos y toxicidad en modelos adaptados: permite estudiar si el ajuste a un idioma concreto introduce o amplifica sesgos respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB, aunque no se publican cuantizaciones GGUF en el repositorio.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en fp16 y en tarjetas con 4 GB usando cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF, no incluida en el repo.
- Latencia y throughput estimados: no disponibles; para un modelo de 1.5B en una RTX 4090 se espera un throughput del orden de miles de tokens por segundo en lote, pero no hay medicion publicada para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Acceso |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-igbo-s125 | 1,54B | no disponible | no disponible | Ajuste LoRA fusionado para igbo | Restringido (gated) |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | Proposito general multilingue | Abierto |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (modelo base) | Apache 2.0 (modelo base) | Instrucciones y conversacion | Abierto |
| Meta Llama 3.2 1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | Proposito general multilingue | Abierto con condiciones |

La comparativa se limita a la familia base porque no se dispone de datos de rendimiento del ajuste. Frente al Qwen2.5-1.5B original, este modelo intercambia cobertura multilingue general por una presumible especializacion en igbo, con el riesgo asociado de olvido. Frente a Llama 3.2 1B, la diferencia principal es la ventana de contexto declarada del modelo base y el regimen de licencia.

## Limitaciones y advertencias

- No se publica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face y disponer de cuenta autenticada.
- No hay evaluacion publicada de calidad en igbo ni de retencion de capacidades en ingles; el tag "forgetting" sugiere que el olvido catastrofico es un riesgo real y no cuantificado.
- Riesgo de alucinacion elevado en un modelo de 1.5B parametros, especialmente en tareas de conocimiento factual y en idiomas de bajo recurso.
- Posible degradacion de tool calling, razonamiento multi-paso y generacion de codigo respecto al modelo base tras el ajuste.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del igbo y del ingles heredado.
- Longitud de contexto no confirmada para este ajuste; no asumir la ventana del modelo base sin verificacion.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware muy ajustado.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion registrada como 2026-11-27, posterior a la fecha habitual de publicacion de la familia Qwen2.5; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-igbo-s125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
