# realshahriya/mukhon-ai-frontier-v1

## Resumen

Mukhon AI Frontier v1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario realshahriya y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado de la versión cuantizada a 4 bits de Qwen2.5-7B-Instruct que Unsloth distribuye para entrenamiento eficiente, y que ha sido reentrenado mediante la librería Unsloth y TRL. El repositorio tiene un tamano de 0,2 GB, lo que sugiere que los pesos publicados corresponden a una cuantizacion de 4 bits en formato safetensors, coherente con el modelo base empleado.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). Esta pensado para generacion de texto en ingles, con las capacidades instruct heredadas del modelo original. La model card es extremadamente escueta: no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni los hiperparametros utilizados, mas alla de indicar que se entreno con Unsloth "2x faster".

Su relevancia es limitada en el ecosistema actual: se trata de un ajuste fino comunitario sin benchmarks publicados, sin pipeline declarado y con cero descargas en el momento de la consulta. Resulta util como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre Qwen2.5, pero no debe considerarse un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (no confirmado en el fine-tuning) |
| Tipos de cuantizacion | Pesos publicados aparentemente en 4 bits (bnb-4bit del modelo base); no se documentan otras variantes |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por grupos de consultas (GQA), activacion SwiGLU y normalizacion RMSNorm, entrenado originalmente por Alibaba Qwen sobre un corpus multilingue de billones de tokens. Sobre esa base, realshahriya aplico un ajuste fino supervisado (SFT) utilizando Unsloth y TRL, partiendo de la variante cuantizada a 4 bits que Unsloth publica para reducir los requisitos de memoria durante el entrenamiento.

La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF o DPO adicionales, ni los hiperparametros empleados. La unica innovacion tecnica documentada es el uso de Unsloth, que optimiza los kernels de atencion y las operaciones de retropropagacion para acelerar el fine-tuning aproximadamente el doble respecto a un entrenamiento estandar con Transformers. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto en ingles con estilo instruct, heredado de Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y asistencia en tareas de programacion (capacidad heredada del modelo base, no verificada tras el fine-tuning).
- Resolucion de problemas matematicos de nivel medio (capacidad heredada, no verificada).
- Soporte de conversaciones multi-turno con historial de contexto.
- Capacidad potencial de tool calling y function calling heredada de Qwen2.5-Instruct, aunque no confirmada en este ajuste.
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- No se documentan modos especiales (thinking mode, vision, audio) en este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse con transformers o TGI para validar flujos de chat antes de invertir en un modelo mayor, gracias a su tamano de 7B y a la licencia permisiva.
- Experimentacion academica con fine-tuning: sirve como referencia de un pipeline completo Unsloth + TRL sobre Qwen2.5-7B-4bit, util para reproducir el flujo y comparar hiperparametros.
- Generacion de texto en entornos con recursos limitados: al estar cuantizado a 4 bits, cabe en GPUs de consumo y permite iterar rapidamente en tareas de redaccion o resumen en ingles.
- Base para ajustes posteriores especificos de dominio: al ser Apache 2.0, puede reentrenarse con datos propios (por ejemplo, soporte tecnico o documentacion interna) sin restricciones de licencia.
- Evaluacion comparativa de fine-tunes comunitarios: util en estudios que miden la degradacion o mejora de un ajuste comunitario frente al Qwen2.5-7B-Instruct original en tareas estandar.
- Demostraciones y docencia: por su reducido tamano de repositorio (0,2 GB) y su licencia abierta, es adecuado para talleres sobre cuantizacion y despliegue con llama.cpp u Ollama.
- Generacion de codigo asistida en entornos de desarrollo: si el fine-tuning no ha degradado las capacidades del modelo base, puede emplearse en autocompletado o explicacion de fragmentos de codigo en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 5-6 GB para los pesos, mas overhead de contexto y cache KV; en la practica, unos 8-10 GB para contextos moderados.
- VRAM estimada en FP16: aproximadamente 15-16 GB para los pesos, mas cache KV; se recomienda 24 GB o mas para contextos largos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para despliegues con mayor concurrencia; RTX 3090 y RTX 4080 tambien son viables en 4 bits.
- Cabe en GPU de consumo: si, en 4 bits cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contextos reducidos.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), llama.cpp (previa conversion a GGUF), Ollama y vLLM (este ultimo requiere pesos en FP16 o AWQ/GPTQ).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mukhon AI Frontier v1 | ~7,6B | 32.768 (heredado, no confirmado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin benchmarks |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 (ampliable a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

## Limitaciones y advertencias

- No se han publicado evaluaciones: se desconoce si el fine-tuning ha degradado las capacidades del modelo base en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: como todo modelo de 7B, puede generar informacion falsa con aparente seguridad; no se ha medido su tasa de alucinacion.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos introducidos por el entrenamiento.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado aunque el modelo base sea multilingue.
- Contexto: la ventana de 32.768 tokens es la del modelo base; no se confirma que el fine-tuning la preserve.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de ajuste antes de usarlo en produccion.
- Madurez: repositorio con cero descargas y sin pipeline declarado; no hay evidencia de uso en produccion ni de mantenimiento.
- Formato: los pesos publicados parecen estar en 4 bits, lo que limita su uso directo con vLLM sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/realshahriya/mukhon-ai-frontier-v1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Familia Qwen2.5 (blog de Alibaba): https://qwenlm.github.io/blog/qwen2.5/
