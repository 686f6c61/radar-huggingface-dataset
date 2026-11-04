# keras/ministral_3_8b_base_2512_en

## Resumen

Ministral 3 8B Base es la variante preentrenada (base) del modelo de 8B de la familia Ministral 3, publicada por Mistral AI y distribuida en este repositorio por el equipo de Keras bajo el identificador `keras/ministral_3_8b_base_2512_en`. Se trata de un modelo multimodal que combina un decodificador de texto de 8,4B parámetros con un codificador visual Pixtral de 0,4B parámetros, lo que le permite procesar imágenes junto con texto. Forma parte de una familia de tres tamanos (3B, 8B y 14B) pensada para despliegue en el borde y en entornos con recursos limitados.

El modelo emplea la arquitectura Mistral3 implementada en KerasHub, con embeddings rotatorios escalados mediante YaRN, lo que habilita una ventana de contexto de 256k tokens. Soporta decenas de idiomas, entre ellos ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.

La relevancia de esta ficha radica en que se trata de un checkpoint base orientado a fine-tuning e investigacion, no a uso conversacional directo. La version instruct y la version reasoning (con razonamiento paso a paso para matematicas, codigo y STEM) son las indicadas para produccion con prompts de sistema, function calling nativo y salida JSON. Los pesos se publican bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Mistral3) con encoder visual Pixtral y RoPE escalado con YaRN |
| Parametros totales | 8,8B (8,4B decodificador de texto + 0,4B encoder visual) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla formatos; el repo ocupa 18,7 GB, compatible con bfloat16) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano, arabe y "decenas" adicionales segun el autor |
| Licencia | Apache 2.0 (pesos); codigo Keras bajo Apache 2.0 |
| Formato de pesos | Pesos Keras/KerasHub (no se especifica safetensors ni GGUF en la informacion disponible) |

## Arquitectura y entrenamiento

Ministral 3 8B Base es un transformer decoder-only multimodal. El decodificador de texto cuenta con 8,4B parametros y se acompana de un encoder visual Pixtral de 0,4B parametros que procesa imagenes intercaladas con texto mediante marcadores `[IMG]` en el prompt. La atencion utiliza embeddings rotatorios (RoPE) escalados con YaRN, tecnica que permite extender la ventana de contexto efectiva hasta 256k tokens sin reentrenar desde cero.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en este checkpoint base. La familia se distribuye en tres variantes (base, instruct y reasoning); las dos ultimas incorporan entrenamiento adicional para seguimiento de instrucciones, razonamiento paso a paso, prompts de sistema, function calling nativo y salida JSON. La implementacion en KerasHub permite cargar el backbone y el tokenizer por separado, compilar `generate()` con muestreadores personalizados (greedy, top-k) y ejecutar `fit()` para fine-tuning sobre lotes.

## Capacidades

- Generacion de texto autoregresiva con decodificacion configurable (greedy, top-k con temperatura).
- Procesamiento multimodal: acepta imagenes junto a texto mediante marcadores `[IMG]`, con grounding visual en la generacion.
- Ventana de contexto de 256k tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingues en ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Al ser un checkpoint base, no incorpora de serie seguimiento de instrucciones, function calling ni salida JSON; estas capacidades residen en las variantes instruct y reasoning de la misma familia.
- Soporte de fine-tuning supervisado mediante `fit()` en KerasHub.
- Carga del backbone y del tokenizer de forma independiente para integracion en pipelines propios.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un checkpoint base, es el punto de partida adecuado para adaptar el modelo a jerga legal, medica o financiera con datasets propios, usando `fit()` sobre el backbone de KerasHub.
- Investigacion en modelos multimodales: permite estudiar el comportamiento del encoder Pixtral y del decodificador de forma aislada, cargando backbone y tokenizer por separado para analisis de representaciones internas.
- Procesamiento de documentos largos con imagen: gracias a los 256k tokens de contexto y al soporte visual, puede emplearse en tareas de extraccion de informacion de informes escaneados o graficos combinados con texto extenso.
- Generacion aumentada por recuperacion (RAG) multilingue: la cobertura de idiomas permite indexar y generar respuestas en espanol, frances, aleman o arabe sobre corpus recuperados, con el modelo base como generador tras un ajuste fino ligero.
- Desarrollo de asistentes conversacionales previo paso a instruct: el checkpoint base sirve para construir la capa de instrucciones propia antes de desplegar en produccion, evitando depender del alineamiento original de Mistral.
- Evaluacion comparativa de arquitecturas: util como referencia base (sin alineamiento) en estudios de sesgo, calibracion y comportamiento de modelos multimodales de 8B.
- Prototipado en el borde: el tamano de 8,8B y la disponibilidad de variantes de 3B en la familia permiten desplegar en hardware con recursos moderados tras cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,6 GB solo para pesos (8,8B parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 18,7 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas para bfloat16: A100 40GB, H100 80GB o RTX 4090 24GB para inferencia con contexto moderado; contextos cercanos a 256k requieren GPU con mayor memoria o tecnicas de atencion eficiente.
- Cabe en GPU de consumo: si, en RTX 4090 (24GB) con bfloat16 y contexto limitado, o en GPUs de 12-16 GB tras cuantizacion.
- Opciones de despliegue: KerasHub (JAX, PyTorch o TensorFlow como backend) es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Variantes |
|---|---|---|---|---|---|
| Ministral 3 8B Base (este) | 8,8B (8,4B texto + 0,4B vision) | 256k | Si (Pixtral) | Apache 2.0 | Base, instruct, reasoning |
| Ministral 3 3B | 3,8B aprox. (3,4B texto + 0,4B vision) | 256k | Si | Apache 2.0 | Base, instruct, reasoning |
| Ministral 3 14B | 13,9B aprox. (13,5B texto + 0,4B vision) | 256k | Si | Apache 2.0 | Base, instruct, reasoning |

La comparativa se limita a la propia familia Ministral 3, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de otros autores.

## Limitaciones y advertencias

- Es un checkpoint base: no esta alineado para seguir instrucciones, no soporta function calling nativo ni salida JSON estructurada; usarlo en produccion conversacional sin fine-tuning produce resultados pobres.
- Riesgo de alucinacion inherente a los modelos de lenguaje preentrenados, agravado por la ausencia de alineamiento en esta variante.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la model card disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales de uso aceptable en la informacion proporcionada.
- El rendimiento en contextos cercanos a 256k tokens puede degradarse y exige hardware con memoria suficiente; no se han publicado mediciones al respecto.
- La cobertura idiomatica se anuncia de forma cualitativa ("decenas de idiomas"); no hay evaluaciones por idioma en la informacion disponible.
- El formato de pesos es especifico de KerasHub; la conversion a GGUF u otros formatos no esta documentada en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keras/ministral_3_8b_base_2512_en
- Mistral AI: https://mistral.ai/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Codigo KerasHub (licencia): https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Documentacion de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
