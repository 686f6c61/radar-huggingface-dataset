# SawBaw/SmolLM2-135M-TinyStories-SFT

## Resumen

SmolLM2-135M-TinyStories-SFT es un ajuste fino supervisado (SFT) del modelo base SmolLM2-135M, publicado por el usuario SawBaw en Hugging Face. Por el nombre del repositorio, el ajuste se ha realizado sobre el dataset TinyStories, un corpus sintetico de cuentos infantiles generado con modelos de lenguaje, disenado originalmente para estudiar la adquisicion de capacidades linguisticas en modelos pequenos. El resultado es un modelo de 134.515.008 parametros orientado a generacion de texto conversacional en ingles sencillo.

La relevancia de esta publicacion es limitada desde el punto de vista de produccion: se trata de un experimento de ajuste fino sobre un modelo de 135 millones de parametros, con cero descargas y cero likes en el momento de la consulta, y con una model card autogenerada por Hugging Face que no aporta informacion tecnica sobre el proceso de entrenamiento, los datos utilizados ni los hiperparametros. No obstante, resulta util como ejemplo de adaptacion de modelos pequenos a dominios restringidos y como caso de estudio de las limitaciones de los modelos de menos de 200 millones de parametros.

El modelo emplea la arquitectura Llama (tag `llama` en el Hub) y se distribuye en formato safetensors con un tamano de repositorio de 0,5 GB, lo que sugiere pesos en precision de 16 bits o superior. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama` en Hugging Face) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors) |
| Idiomas soportados | No disponible (por el dataset TinyStories, probablemente ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Llama, con 134.515.008 parametros totales. El modelo base es SmolLM2-135M, desarrollado por Hugging Face, que emplea atencion con RoPE, normalizacion RMSNorm y activacion SwiGLU, siguiendo el diseno estandar de la familia Llama. El ajuste fino se ha realizado presumiblemente mediante SFT sobre el dataset TinyStories, segun indica el sufijo del identificador del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF o DPO, ni los hiperparametros utilizados. La model card es la plantilla autogenerada por Hugging Face y todos los campos tecnicos aparecen como "[More Information Needed]". No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en ingles sencillo, presumiblemente orientada a narrativa corta tipo cuento infantil por el dataset de ajuste.
- Generacion conversacional basica (tag `conversational` en el Hub).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el ajuste sobre TinyStories sugiere un sesgo fuerte hacia el ingles.
- No se documentan capacidades especiales (thinking mode, vision, audio).

## Casos de uso

- Generacion de cuentos infantiles sinteticos: el ajuste sobre TinyStories hace que el modelo sea adecuado para producir narrativas cortas con vocabulario simple, util para aumentar datasets de investigacion sobre adquisicion del lenguaje.
- Prototipado rapido de pipelines de generacion de texto: al ocupar menos de 1 GB en disco, permite validar infraestructura de inferencia (tokenizacion, streaming, plantillas de chat) antes de escalar a modelos mayores.
- Educacion e investigacion sobre ajuste fino: sirve como caso base para comparar estrategias de SFT en modelos de menos de 200 millones de parametros y estudiar el olvido catastrofico respecto al modelo base.
- Generacion de texto en dispositivos con recursos muy limitados: con 135 millones de parametros puede ejecutarse en CPU o en GPUs de gama baja, adecuado para demos offline o entornos embebidos.
- Filtrado y clasificacion de texto simple: mediante prompting, puede emplearse para tareas de etiquetado ligero en ingles, siempre con validacion humana por su limitada fiabilidad.
- Experimentos de destilacion o como modelo alumno: su tamano reducido lo hace candidato para estudiar tecnicas de destilacion desde modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,27 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,14 GB para pesos; en 4 bits, en torno a 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es sobredimensionada; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer y en dispositivos de borde; el cuello de botella sera la latencia de CPU, no la memoria.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference`), llama.cpp y Ollama si se convierte a GGUF (no se distribuye GGUF en el repo), vLLM para servir en GPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SawBaw/SmolLM2-135M-TinyStories-SFT | 134.515.008 | No disponible | No disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-135M | 135M (aprox.) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| HuggingFaceTB/SmolLM2-360M | 360M (aprox.) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B | 0.5B (aprox.) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

Los datos de los modelos comparables no se han verificado en la informacion proporcionada; se indican solo como referencia de categoria. No se dispone de resultados de benchmarks para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card autogenerada sin informacion sobre sesgos, datos de entrenamiento ni evaluacion; no es posible auditar el modelo.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio de cuentos infantiles, dado el ajuste sobre TinyStories.
- Capacidad de razonamiento, matematicas y codigo muy limitada por el tamano (135M) y por el dataset de ajuste.
- Sesgo idiomatico probable hacia el ingles; no se documenta soporte de castellano.
- Licencia no especificada: no se puede garantizar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- El ajuste SFT sobre un dataset sintetico puede provocar olvido catastrofico de las capacidades originales del modelo base SmolLM2-135M.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a convertirlos manualmente para despliegue en llama.cpp u Ollama.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SawBaw/SmolLM2-135M-TinyStories-SFT
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Modelo base SmolLM2-135M (referencia, no verificado en la busqueda): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset TinyStories (referencia, no verificado en la busqueda): no disponible en la informacion proporcionada
