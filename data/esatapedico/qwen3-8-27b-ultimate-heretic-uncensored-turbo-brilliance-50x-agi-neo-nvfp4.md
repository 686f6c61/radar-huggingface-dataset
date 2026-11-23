# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4

## Resumen

Este repositorio contiene un checkpoint cuantizado en NVFP4 del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un ajuste fino de la familia Qwen3.8-27B de Alibaba/Qwen. El autor del artefacto, esatapedico, no ha entrenado ni ajustado el modelo: se limita a la conversion numerica de los pesos BF16 originales a un formato empaquetado de 4 bits con escalas FP8, orientado a la inferencia en GPUs Blackwell (sm_120). El modelo base es un transformer hibrido denso de 27.781.427.952 parametros que combina atencion completa con una ruta DeltaNet (atencion lineal) y una cabeza MTP (multi-token prediction) para decodificacion especulativa.

La relevancia de esta publicacion es practica: reduce el peso total de los pesos a 28,55 GB en dos shards, lo que permite servir un modelo de 27B en hardware consumer de gama alta con soporte nativo de NVFP4, manteniendo en BF16 las partes sensibles (torre de vision, cabeza MTP, `lm_head`, embeddings y la ruta DeltaNet). El checkpoint esta pensado como fuente de conversion para builds GGUF y como alternativa al checkpoint W4A16 de 400 tensores del mismo autor.

La licencia declarada es Apache-2.0, heredada del modelo base, y el pipeline es `text-generation` con soporte declarado para `image-text-to-text`. El modelo se distribuye unicamente en safetensors empaquetados con `compressed-tensors`, sin versiones GGUF publicadas en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion completa + ruta DeltaNet (atencion lineal) + cabeza MTP; torre de vision |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (formato `nvfp4-pack-quantized`), grupo 16, escalas FP8 E4M3, weight-only, datafree; resto en BF16 |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`compressed-tensors`), 2 shards; conversion a GGUF via `convert_hf_to_gguf.py` |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 27B densos con dos mecanismos de atencion: 16 capas de atencion completa y una ruta DeltaNet de atencion lineal que se mantiene en BF16 en este checkpoint. Incorpora una cabeza MTP (multi-token prediction) de 15 tensores, pensada para decodificacion especulativa, y una torre de vision que habilita la entrada image-text-to-text. El checkpoint cuantiza 256 tensores: el MLP de las 64 capas y las proyecciones Q, K, V y O de las 16 capas de atencion completa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El autor de este repositorio declara explicitamente que no ha entrenado ni ajustado nada: el trabajo cubre solo la conversion numerica. La cuantizacion se realizo con una receta NVFP4A16 datafree (sin corpus de calibracion), en ejecucion secuencial sobre CPU, seguida de la restauracion de los 15 tensores MTP a BF16 con verificacion bit a bit. El checkpoint incluye `recipe.yaml` con la receta exacta y un censo de empaquetado verificado (256 de 256 objetivos).

## Capacidades

- Generacion de texto conversacional y continuacion de contexto.
- Razonamiento multi-paso y soporte de agentes, segun las capacidades heredadas del tune base.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de vision en BF16.
- Decodificacion especulativa mediante la cabeza MTP, preservada en BF16.
- Soporte multilingue declarado (en y multilingual), sin listado cerrado de idiomas.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.
- El ajuste "Heretic-Uncensored" del modelo base implica un alineamiento reducido o eliminado respecto al modelo original.

## Casos de uso

- Despliegue de un modelo de 27B en GPUs Blackwell consumer: el checkpoint NVFP4 reduce los pesos a 28,55 GB, lo que permite cargar el modelo en una unica GPU de 32 GB o en configuraciones de 24 GB con offload parcial, algo inviable con los pesos BF16.
- Generacion de codigo y asistencia en IDE: el modelo hereda las capacidades del tune base y puede integrarse en pipelines de autocompletado o revision, siempre que se valide el comportamiento del ajuste "uncensored" antes de exponerlo a usuarios.
- Procesamiento de documentos con imagen: la torre de vision en BF16 permite tareas de image-text-to-text como extraccion de datos de capturas, facturas o diagramas, combinando entrada visual y salida textual.
- Prototipado de agentes con decodificacion especulativa: la cabeza MTP permite acelerar la generacion en entornos de investigacion que necesiten iterar rapido sobre cadenas de razonamiento, a costa de validar la calidad de las predicciones especulativas.
- Generacion creativa sin filtros editoriales: el ajuste Heretic esta orientado a usuarios que necesitan salidas no censuradas; adecuado para ficcion, roleplay o lluvia de ideas, con las advertencias de contenido que se detallan mas abajo.
- Conversion a GGUF para llama.cpp: el checkpoint se declara como fuente de conversion (`convert_hf_to_gguf.py --outtype auto`), lo que permite generar builds GGUF con soporte NVFP4 (tipo GGML 40) para despliegue en llama.cpp.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia para estudiar el impacto de NVFP4 W4A16 frente al checkpoint W4A16 de 400 tensores del mismo autor en tareas de calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos suman 28,55 GB en NVFP4; con overhead de activaciones, cache KV y contexto, se recomienda un minimo de 32 GB de VRAM para inferencia comoda.
- GPU recomendadas: NVIDIA Blackwell (sm_120) con soporte nativo de NVFP4, como RTX 50xx o Blackwell datacenter; el autor indica explicitamente "Blackwell sm_120".
- Cabe en consumer GPU: si, en GPUs Blackwell de 32 GB o superiores; en 24 GB requerira offload parcial o reduccion de contexto.
- Opciones de despliegue: transformers con `compressed-tensors`, y llama.cpp tras conversion a GGUF con soporte NVFP4 (GGML tipo 40). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 27,78B | no disponible | NVFP4 W4A16, 256 tensores | Apache-2.0 | safetensors, 2 shards (28,55 GB) |
| esatapedico/...-NVFP4-W4A16-T400 | 27,78B (mismo base) | no disponible | W4A16, 400 tensores | Apache-2.0 | safetensors |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27,78B | no disponible | BF16 | Apache-2.0 | safetensors BF16 |
| Qwen3.8-27B (original) | 27B | no disponible | BF16 | Apache-2.0 | no disponible en la informacion |

## Limitaciones y advertencias

- El ajuste "Heretic-Uncensored" reduce o elimina el alineamiento del modelo original; puede producir contenido sensible, ofensivo o inseguro sin filtros. No apto para produccion orientada al publico sin moderacion adicional.
- Riesgo de alucinacion propio de los modelos de 27B densos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La cuantizacion NVFP4 W4A16 puede degradar la calidad respecto al BF16 original; no se aportan metricas de perdida de calidad.
- La ruta DeltaNet permanece en BF16 en este checkpoint, por lo que el ahorro de memoria es parcial respecto a una cuantizacion completa.
- Requiere hardware Blackwell (sm_120) para aprovechar NVFP4; en GPUs anteriores el checkpoint no es directamente utilizable sin conversion.
- La longitud de contexto no esta documentada; no debe asumirse un contexto largo sin verificacion empirica.
- El modelo base es un tune de terceros (DavidAU) sobre Qwen3.8-27B; la procedencia exacta del ajuste y sus datos de entrenamiento no se detallan.
- Aunque la licencia declarada es Apache-2.0, conviene verificar las condiciones del modelo base y del tune antes de uso comercial.
- El repositorio tiene 0 likes y 422 descargas en el momento de la consulta; no hay evidencia de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Checkpoint W4A16 companion: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Sitio del autor: https://www.esatapedico.com
- Repositorio llama.cpp (soporte NVFP4, GGML tipo 40): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
