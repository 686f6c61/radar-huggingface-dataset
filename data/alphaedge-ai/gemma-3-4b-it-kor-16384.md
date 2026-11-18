# alphaedge-ai/gemma-3-4b-it-kor-16384

## Resumen

`gemma-3-4b-it-kor-16384` es una variante podada del vocabulario (*trimming*) de `google/gemma-3-4b-it`, publicada por el usuario `alphaedge-ai`. El modelo conserva la arquitectura y los pesos del Gemma 3 de 4B de Google, pero reduce el vocabulario del tokenizador de 262.144 a 16.384 tokens, lo que elimina las filas correspondientes de las matrices de *embedding* y de la cabeza de salida (`lm_head`). El resultado es un modelo un 14,63 % mas pequeno en parametros (3.670.770.032 frente a 4.300.079.472) y optimizado para coreano.

La tecnica de *trimming* consiste en identificar, mediante mineria sobre un corpus representativo del idioma objetivo, que tokens del vocabulario original son realmente utilizados y descartar el resto. En este caso se emplearon 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar el subconjunto de 16.384 tokens. El modelo resultante mantiene el pipeline `image-text-to-text` del Gemma 3 original, aunque la model card solo documenta el uso como `AutoModelForCausalLM` para generacion de texto.

Su relevancia practica es doble: por un lado reduce el peso en disco y en memoria (repo de 7,3 GB) y, por otro, ofrece un modelo Gemma 3 con licencia Gemma adaptado especificamente al coreano. Es un ejemplo de como el *trimming* de vocabulario permite especializar modelos multilingues grandes en un solo idioma con un coste de almacenamiento y computo menor, a cambio de perder capacidades en el resto de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con vision encoder heredado del modelo base |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 4B soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 3 4B instruct de Google: un transformer decoder-only con atencion por cabezas y las innovaciones introducidas en la familia Gemma 3 (documentadas en el informe tecnico arXiv:2503.19786). No se ha reentrenado el modelo; la unica modificacion es la poda del vocabulario y el recorte de las matrices asociadas (`embed_tokens` y `lm_head`) a 16.384 filas. Los pesos del resto de capas se mantienen intactos respecto al modelo base.

La seleccion del vocabulario se realizo mediante mineria sobre 200.000 textos en coreano del dataset `lbourdois/fineweb-2-trimming`, siguiendo la metodologia descrita en el blog de Hugging Face "Introduction to Trimming". No se documenta en la informacion disponible ningun proceso adicional de *fine-tuning*, RLHF o DPO especifico para este modelo; el ajuste por instrucciones proviene del Gemma 3 4B IT original. El modelo base figura etiquetado como `base_model:quantized:google/gemma-3-4b-it`, lo que refleja que la relacion con el original es de reduccion de tamano.

## Capacidades

- Generacion de texto conversacional en coreano, con plantilla de chat (`apply_chat_template`) compatible con el formato de Gemma 3.
- Razonamiento y generacion de codigo y matematicas heredados del Gemma 3 4B IT, aunque el vocabulario podado puede degradar el rendimiento en idiomas distintos del coreano.
- Capacidad multimodal (`image-text-to-text`) heredada del modelo base segun los tags del repo, si bien la model card solo documenta el uso como modelo de texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al coreano por diseno; el autor advierte explicitamente de que el rendimiento en otros idiomas puede ser deficiente.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con un tokenizador optimizado para ese idioma, lo que reduce el numero de tokens por frase y abarata la inferencia frente al Gemma 3 original.
- Generacion de contenido editorial en coreano: redaccion de articulos, resumenes y respuestas en coreano con un modelo de 3,67B parametros que cabe en GPUs de gama media.
- Asistentes conversacionales embebidos: al ser un 14,63 % mas pequeno que el original, es adecuado para despliegues con restricciones de memoria en entornos de produccion coreanos.
- Prototipado rapido de aplicaciones NLP en coreano: su integracion directa con `transformers` y su compatibilidad con `text-generation-inference` permiten levantar un endpoint en pocas lineas.
- Traduccion y adaptacion de contenido hacia coreano: util como generador en pipelines de localizacion, siempre que el texto de entrada se mantenga en coreano o en un idioma bien representado por el vocabulario podado.
- Investigacion sobre trimming de vocabulario: sirve como referencia reproducible para estudiar el impacto de la poda de vocabulario en modelos Gemma 3, comparando directamente con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 10 y 12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB (aunque no se publican pesos cuantizados en el repo).
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en precision completa; RTX 4070 Ti (12 GB) o RTX 4080 (16 GB) como minimo practico.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en `bfloat16`, y en tarjetas de 8 GB si se cuantiza.
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (tag `text-generation-inference`), y potencialmente `llama.cpp`/`Ollama` si se generan pesos GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/gemma-3-4b-it-kor-16384` | 3.670.770.032 | no disponible | coreano | Gemma Terms of Use | Hugging Face (12 descargas) |
| `google/gemma-3-4b-it` | 4.300.079.472 | no disponible en esta ficha | multilingue | Gemma Terms of Use | Hugging Face (oficial) |
| Otros modelos Gemma 3 podados por idioma (misma familia de trimming) | variable | no disponible | idioma especifico | Gemma Terms of Use | Hugging Face |

La comparativa directa con alternativas de la misma categoria (modelos de ~4B especializados en coreano) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El vocabulario podado a 16.384 tokens elimina tokens poco frecuentes en coreano; el rendimiento en otros idiomas puede degradarse significativamente, tal como advierte el autor.
- Riesgo de alucinacion heredado del Gemma 3 4B IT original; no se documenta mitigacion adicional.
- Sesgos conocidos del modelo base Gemma 3 no reevaluados para esta variante; no disponible informacion especifica sobre sesgos en coreano.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisarlas antes de un despliegue en produccion.
- El modelo no esta afiliado ni respaldado por Google, segun indica la model card.
- El repo tiene solo 12 descargas y 0 likes, lo que sugiere poca validacion comunitaria; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- No se publican pesos cuantizados ni resultados de benchmarks, lo que dificulta estimar su rendimiento real frente al modelo base.
- No se confirma en la informacion disponible la longitud de contexto efectiva tras el trimming; debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-kor-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Informe tecnico Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
