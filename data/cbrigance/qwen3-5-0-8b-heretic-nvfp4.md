# cbrigance/Qwen3.5-0.8B-heretic-NVFP4

## Resumen

Qwen3.5-0.8B-heretic-NVFP4 es una cuantizacion en formato NVFP4 (FP4 de NVIDIA con escalado por bloques) del modelo Qwen3.5-0.8B, un modelo multimodal de tipo image-text-to-text de la familia Qwen 3.5 desarrollada por Alibaba. La version aqui descrita esta publicada por el usuario cbrigance en Hugging Face y aplica una tecnica de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) combinada con cuantizacion a 4 bits mediante NVIDIA ModelOpt, lo que da lugar a un modelo de vision-lenguaje de muy bajo peso (852.985.920 parametros, repositorio de 1,0 GB) orientado a inferencia eficiente en GPU Blackwell.

El modelo resuelve el problema de desplegar un VLM compacto con capacidad conversacional y de imagen a texto en entornos con recursos limitados, manteniendo el pipeline `image-text-to-text` de la familia Qwen. La etiqueta "heretic" y "abliterated" indica que se ha eliminado parcialmente el comportamiento de rechazo alineado del modelo base, por lo que la ficha lo clasifica como `not-for-all-audiences`. Es relevante ahora porque combina tres tendencias recientes: cuantizacion FP4 nativa de hardware, modelos multimodales de menos de mil millones de parametros y variantes "desalineadas" de uso comunitario.

El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, heredada del modelo base Qwen/Qwen3.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), familia Qwen 3.5; tag `qwen3_5` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalado por bloques, NVIDIA ModelOpt); tag 8-bit; pesos cuantizados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen 3.5 y se presenta como un modelo multimodal de tipo image-text-to-text, es decir, un transformer con un codificador de vision acoplado a un decodificador de lenguaje que acepta imagenes y texto como entrada y genera texto. El tag `qwen3_5` confirma la arquitectura de la familia, aunque no se dispone de detalles sobre el numero de capas, dimension oculta, atencion (estandar o lineal) ni sobre el encoder visual en la informacion proporcionada.

El proceso de esta variante concreta consta de dos transformaciones sobre el modelo base: por un lado, una cuantizacion a NVFP4 realizada con NVIDIA ModelOpt (tag `modelopt`), que reduce los pesos a 4 bits con escalas por bloque para preservar precision; por otro, una abliteration ("heretic") que elimina las direcciones de activacion asociadas al rechazo, modificando el comportamiento alineado del modelo. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base. El tag `arxiv:2406.11717` apunta a una referencia bibliografica, pero su contenido no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes y generacion de texto a partir de ellas (pipeline image-text-to-text).
- Razonamiento multimodal basico derivado del modelo base Qwen3.5-0.8B.
- Comportamiento "abliterated": se ha reducido el rechazo alineado, lo que amplia el rango de respuestas generadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el tag de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes multimodales en local: el modelo cabe en 1,0 GB de repositorio y 852 millones de parametros, lo que permite iterar rapidamente en una unica GPU consumer con soporte FP4, sin depender de APIs externas.
- Descripcion automatica de imagenes en pipelines de catalogacion: al ser un modelo image-text-to-text, puede generar descripciones textuales de imagenes para metadatos, aunque su tamano reducido limita la profundidad de las descripciones.
- Experimentacion en investigacion sobre alineacion y abliteration: la variante "heretic" es util para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo en tareas de vision-lenguaje.
- Inferencia de bajo coste en GPUs Blackwell: la cuantizacion NVFP4 esta disenada para aprovechar los tensor cores FP4 de esta generacion, lo que permite desplegar el modelo con throughput alto y huella de memoria minima.
- Base para fine-tuning ligero: con menos de mil millones de parametros y licencia Apache 2.0, sirve como punto de partida para adaptaciones a dominios concretos con LoRA.
- Evaluacion comparativa de tecnicas de cuantizacion: permite medir la perdida de calidad de NVFP4 frente a FP16/BF16 en un VLM pequeno, especialmente en tareas de percepcion visual.
- Chat multimodal en ingles para entornos con restricciones de memoria: el modelo puede ejecutarse en GPUs de gama media-baja con cuantizacion FP4, aunque la calidad sera inferior a la de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de NVFP4 (4 bits) con 852.985.920 parametros, los pesos ocupan aproximadamente 0,43 GB; con overhead de activaciones, KV cache y encoder visual, se estima un consumo de 1-2 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: GPUs NVIDIA Blackwell (serie RTX 50, B100/B200) por el soporte nativo de FP4; en arquitecturas anteriores (Ampere, Ada) la cuantizacion NVFP4 puede requerir emulacion o no ser compatible.
- Cabe en GPU consumer: si, en principio en cualquier GPU con soporte FP4 y al menos 2 GB de VRAM; en GPUs sin soporte FP4 la viabilidad no esta confirmada.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbrigance/Qwen3.5-0.8B-heretic-NVFP4 | 852.985.920 | no disponible | Si (image-text-to-text) | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | Si (image-text-to-text) | Apache 2.0 | Publico en Hugging Face |
| Otros VLM <1B (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | Si | variable | Publicos |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificados en la informacion proporcionada; los modelos citados como referencia no forman parte de la busqueda realizada.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion de direcciones de rechazo puede generar contenido inapropiado, ofensivo o danino; el repositorio esta marcado como `not-for-all-audiences`.
- Riesgo de alucinacion elevado: con menos de mil millones de parametros, la fidelidad factual y la coherencia en tareas complejas son limitadas en comparacion con modelos mayores.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto: no se dispone de la longitud de contexto, por lo que no puede recomendarse para tareas de contexto largo sin verificacion previa.
- Licencia: Apache 2.0 permite uso comercial, pero la modificacion de alineacion puede entrar en conflicto con las politicas de uso responsable del modelo base; conviene revisar los terminos de Qwen.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que anade friccion al despliegue automatizado.
- Compatibilidad hardware: NVFP4 requiere GPUs con soporte FP4; en otras arquitecturas el modelo puede no funcionar o degradar su rendimiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad tras la cuantizacion y la abliteration.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Qwen3.5-0.8B-heretic-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Referencia bibliografica citada en los tags: https://arxiv.org/abs/2406.11717
