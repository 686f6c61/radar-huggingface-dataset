# deepanraj-ai/llama-3.2-3b-routing-merged

## Resumen

`deepanraj-ai/llama-3.2-3b-routing-merged` es un ajuste fino (fine-tune) del modelo instructivo Llama 3.2 3B de Meta, publicado por el usuario deepanraj-ai en Hugging Face. El modelo parte concretamente de `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, una version ya cuantizada a 4 bits del Llama 3.2 3B Instruct, y se ha entrenado con la libreria Unsloth junto con TRL de Hugging Face. El resultado se ha fusionado (merged) en pesos completos en formato safetensors, dando un total de 3.212.749.824 parametros.

Se trata de un modelo de generacion de texto de tipo decoder-only, orientado a conversacion e instrucciones, con licencia declarada apache-2.0 y soporte declarado unicamente para ingles. La relevancia de esta ficha es limitada: es una publicacion practicamente sin documentacion, sin resultados de benchmarks, sin detalle del dataset de entrenamiento y con cero descargas e interacciones en el momento de la consulta. El nombre "routing-merged" sugiere alguna tecnica de enrutado o fusion de adaptadores, pero la model card no lo explica.

No aporta innovaciones tecnicas documentadas: es un fine-tune QLoRA estandar sobre un modelo pequeno de 3B, util principalmente como ejemplo de flujo de trabajo con Unsloth o para tareas ligeras en ingles donde no se necesite contexto largo ni capacidades avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 3B soporta hasta 128.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en safetensors a precision completa (~6,4 GB); el autor no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 (declarada por el autor; ver advertencias) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only con atencion por consultas agrupadas (GQA), codificacion posicional rotatoria (RoPE) y capas feed-forward con activacion SwiGLU, caracteristicas de la familia Llama 3.2. El modelo base Llama 3.2 3B de Meta tiene aproximadamente 3,21 mil millones de parametros y una ventana de contexto nativa de 128.000 tokens, aunque este fine-tune no documenta con que longitud de contexto se entreno ni cual mantiene efectivamente tras el ajuste.

El entrenamiento se realizo con Unsloth y la libreria TRL, segun indica la propia model card, partiendo de la version cuantizada a 4 bits (`bnb-4bit`) del Llama 3.2 3B Instruct. Esto implica un flujo de QLoRA tipico: adaptadores de bajo rango entrenados sobre pesos congelados en 4 bits y posterior fusion en pesos completos (de ahi el sufijo "merged" del nombre). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, el rango de los adaptadores ni la tecnica de enrutado que sugiere el termino "routing". Toda esa informacion esta marcada como no disponible.

## Capacidades

- Generacion de texto en ingles: el modelo es un decoder causal entrenado para completar y generar texto.
- Conversacion e instrucciones: etiquetado como `conversational`, hereda la alineacion del Llama 3.2 3B Instruct para seguir instrucciones y mantener dialogos multi-turno.
- Razonamiento basico y tareas sencillas de comprension: esperable por herencia del modelo base, aunque sin benchmarks publicados que lo confirmen para este fine-tune concreto.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: no; la model card declara unicamente ingles (`en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Chatbots ligeros en ingles: adecuado para asistentes conversacionales sencillos que deban ejecutarse en hardware modesto, gracias a sus 3,21 mil millones de parametros y a la posibilidad de cuantizarlo a 4 bits.
- Generacion de texto y borradores: redaccion de resumenes, correos o parrafos cortos en ingles dentro de herramientas de productividad, donde un modelo de 3B ofrece buena relacion coste/velocidad.
- Prototipado rapido de pipelines de IA: util para validar integraciones con transformers, TGI o TRL antes de escalar a un modelo mayor.
- Clasificacion y extraccion de informacion simple: tareas de etiquetado, extraccion de entidades o reformateo de texto cuando el dominio esta en ingles.
- Educacion y experimentacion: como caso de estudio de fine-tuning QLoRA con Unsloth, replicable por estudiantes o desarrolladores que quieran aprender el flujo completo hasta la fusion de pesos.
- Aplicaciones en el borde (edge) o sin GPU dedicada: al poder ejecutarse cuantizado en CPU o en GPU de gama de entrada, encaja en demos locales y entornos con recursos limitados.
- Base para nuevos fine-tunes: sirve como punto de partida para ajustes adicionales sobre un modelo de 3B ya alineado para instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV aproximada):
  - bf16/fp16 (precision completa, ~6,4 GB de pesos): en torno a 8-10 GB de VRAM.
  - 8 bits (~3,5 GB): en torno a 4-6 GB de VRAM.
  - 4 bits GGUF o equivalente (~2 GB): en torno a 3-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En el extremo profesional, A100, H100 o L40S para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, comodamente en modelos con 8-12 GB de VRAM una vez cuantizado, y en precision completa en tarjetas de 12 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama o LM Studio previa conversion a GGUF (el autor no publica GGUF).
- Latencia y throughput estimados: no disponibles. La model card no proporciona cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| deepanraj-ai/llama-3.2-3b-routing-merged | 3,21 B | no disponible en la card (base: 128.000 tokens) | apache-2.0 (declarada) | en | safetensors, transformers |
| meta-llama/Llama-3.2-3B-Instruct (modelo base de la familia) | 3,21 B | 128.000 tokens | Llama 3.2 Community License | 8 idiomas oficiales | safetensors, transformers, GGUF en la comunidad |
| Qwen2.5-3B-Instruct | 3,09 B | 32.000 tokens (extensible con YaRN) | apache-2.0 | multilingue (incluye espanol) | safetensors, transformers, GGUF |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | multilingue | safetensors, transformers, GGUF |

Las cifras de los modelos comparativos corresponden a datos publicos ampliamente documentados de sus respectivas fichas oficiales; este fine-tune concreto no publica benchmarks que permitan una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks, lo que impide conocer su calidad real frente al modelo base ni detectar posibles regresiones por el ajuste.
- Riesgo de alucinacion: como cualquier modelo de 3,21 mil millones de parametros, tiende a generar informacion incorrecta con seguridad, especialmente en tareas de conocimiento factual.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado.
- Discrepancia de licencia: el autor declara apache-2.0, pero los pesos derivan del Llama 3.2 3B Instruct de Meta, sujeto a la Llama 3.2 Community License. Conviene verificar las condiciones de la licencia upstream antes de un uso comercial.
- Herencia de cuantizacion: el entrenamiento partio de una version ya cuantizada a 4 bits (`bnb-4bit`), lo que puede introducir perdidas de precision frente a un fine-tune sobre pesos originales.
- Falta de documentacion: no se detalla el dataset, los hiperparametros, el uso previsto ni la tecnica de enrutado sugerida por el nombre, lo que dificulta su reproducibilidad.
- Sin senales de adopcion: cero descargas y cero "likes", sin historial de uso ni validacion por parte de la comunidad.
- Sin soporte documentado de tool calling ni agentes, por lo que no es adecuado para pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepanraj-ai/llama-3.2-3b-routing-merged
- Modelo base usado para el fine-tune: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Los resultados de la busqueda web disponible no contienen enlaces relacionados con este modelo ni con Llama 3.2 (arrojaron resultados no pertinentes sobre PowerPoint), por lo que no se incluyen mas enlaces.
