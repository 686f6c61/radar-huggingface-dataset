# Pengcuo2/Qwen3-30B-A3B-bo-sft2

## Resumen

Qwen3-30B-A3B-bo-sft2 es un ajuste fino del modelo base Qwen/Qwen3-30B-A3B-Base, desarrollado por el usuario Pengcuo2, orientado a dotar al modelo de capacidad de comprensión y generación en tibetano escrito, manteniendo al mismo tiempo su competencia en chino. El modelo responde por defecto de forma bilingüe (primero en tibetano, después en chino) y admite peticiones de traducción zh↔bo en el mismo formato. Se trata de un checkpoint temprano de investigación (segunda ronda de SFT), no de un modelo listo para producción.

Arquitectura Qwen3-MoE con 30 564 628 480 parámetros totales (aproximadamente 30,56 B) y 3 B activos por token, según los pesos publicados en safetensors. La innovación principal no está en la arquitectura, sino en el tokenizador: se añadieron 8192 tokens BPE tibetanos al vocabulario de Qwen3 (hasta 159 872 filas) y se modificó la regex de pre-tokenización para que las marcas combinantes Unicode (`\p{M}`) permanezcan unidas a las letras, reduciendo el coste de 5,7 a 1,2 tokens por sílaba tibetana.

El modelo es relevante porque el tibetano es un idioma de bajos recursos con escasa cobertura en los LLM generalistas, y este trabajo documenta de forma transparente el pipeline completo (extensión de tokenizador, preentrenamiento continuado y SFT) junto con evaluaciones en FLORES-200. La licencia Apache-2.0 facilita su reutilización, aunque las limitaciones declaradas por el autor aconsejan tratarlo como base de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-MoE, `qwen3_moe`) |
| Parametros totales | 30 564 628 480 (~30,56 B) |
| Parametros activos | ~3 B (según model card: 30B total / 3B active) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor advierte que algunos conversores GGUF fallan con el tokenizador) |
| Idiomas soportados | tibetano (bo), chino (zh); inglés no soportado como salida |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 61,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer con mezcla de expertos (MoE) de 30,56 B parámetros totales y unos 3 B activos por token. Sobre esa base se realizaron tres intervenciones: (1) extensión del tokenizador con 8192 tokens BPE tibetanos y modificación de la regex de pre-tokenización para preservar las marcas combinantes; (2) preentrenamiento continuado con 0,7 B tokens en una mezcla de 70 % tibetano (crawl web MC² y Wikipedia tibetana, 1,26 × 10⁸ sílabas, limpiado y deduplicado), 15 % chino y 15 % inglés de replay (familia FineWeb-Edu), usando Megatron-Bridge sobre 8×GB200 con paralelismo de expertos EP=8; y (3) dos rondas de SFT sobre aproximadamente 223 000 muestras, que incluyen datos alineados zh↔bo, pares de traducción tibetano→chino generados por retrotraducción con MADLAD-400-7B sobre frases de MC², muestras de modo monolingüe y pares pregunta tibetana → respuesta china.

No se documenta en la información disponible el uso de RLHF o DPO. El formato de salida por defecto incluye un bloque `<think>` con un borrador corto en chino seguido de las secciones 【བོད་ཡིག】 (tibetano) y 【中文】 (chino); el usuario puede solicitar respuesta monolingüe añadiendo instrucciones como «只用藏文回答。» o «只用中文回答。». El tokenizador personalizado se incluye en el repo, pero los cargadores que recalculan la regex a partir del tipo de modelo (por ejemplo, algunos conversores a GGUF) tokenizarán mal el tibetano.

## Capacidades

- Generación de texto conversacional en tibetano escrito y en chino, con formato bilingüe por defecto (tibetano primero, chino después).
- Traducción chino→tibetano y tibetano→chino bajo petición explícita, devolviendo solo la traducción.
- Modo de respuesta monolingüe (solo tibetano o solo chino) mediante instrucción en el prompt.
- Razonamiento con bloque `<think>`: genera un borrador corto en chino antes de la respuesta final.
- Comprensión y generación en chino heredada del modelo base (CMMLU 86,1 y C-Eval 87,1 en evaluación de 5 disparos).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.
- Capacidad multilingüe limitada a bo y zh; el inglés no es un idioma de salida soportado.

## Casos de uso

- Traducción chino→tibetano de contenido administrativo o divulgativo: el modelo obtiene 25,9 chrF++ en FLORES-200 zh→bo, por encima de NLLB-200-3.3B (23,2), y puede integrarse en flujos de traducción asistida con revisión humana posterior.
- Asistencia bilingüe en entornos educativos tibetanos: respuestas en tibetano con contrapartida en chino permiten al estudiante contrastar terminología, aprovechando el formato de doble salida por defecto.
- Prototipado de asistentes conversacionales para hablantes de tibetano escrito: el modelo mantiene conversaciones multi-turno mediante `apply_chat_template`, aunque la longitud de contexto no está documentada y conviene validarla empíricamente.
- Investigación en lingüística computacional del tibetano: el checkpoint y la extensión de tokenizador (1,2 tokens por sílaba frente a 5,7 del base) sirven como punto de partida para experimentos de modelado de lenguaje (7,7 bits/sílaba en FLORES dev, frente a 8,8 del base).
- Generación de pares de datos zh↔bo para aumento de corpus: el modelo puede producir borradores de traducción que, tras filtrado y corrección, alimenten otros pipelines de datos.
- Evaluación comparativa de sistemas de traducción de bajos recursos: sirve como referencia reproducible en FLORES-200 para medir avances en bo↔zh con licencia Apache-2.0.
- Despliegue en infraestructura estándar de Qwen3-MoE: al ser compatible con vLLM como checkpoint Qwen3-MoE (con el `tokenizer.json` personalizado incluido), puede servirse con las mismas herramientas que el modelo base.

## Benchmarks y rendimiento

Evaluación en FLORES-200 devtest (1012 frases, chrF++):

| Sistema | bo→zh | zh→bo |
|---|---|---|
| Qwen3-30B-A3B-Base (3-shot) | 8,9 | 14,0 |
| NLLB-200-3.3B | 10,4 | 23,2 |
| MADLAD-400-7B-mt | 11,8 | no disponible |
| **Qwen3-30B-A3B-bo-sft2** (modo instrucción) | 9,3 | **25,9** |

Otras métricas reportadas por el autor:

| Evaluación | Resultado | Referencia (Base) |
|---|---|---|
| CMMLU (5-shot, option-logit) | 86,1 | 86,9 |
| C-Eval (5-shot, option-logit) | 87,1 | 88,3 |
| Modelado de lenguaje tibetano en FLORES dev | 7,7 bits/sílaba | 8,8 bits/sílaba |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 61 GB solo para pesos (el repo safetensors ocupa 61,1 GB), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para comodidad.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. El autor entrenó con 8×GB200.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16. Sería necesaria cuantización, pero el autor advierte que algunos conversores GGUF recalculan la regex del tokenizador y rompen la tokenización del tibetano; no se documentan cuantizaciones publicadas ni verificadas.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` con `device_map="auto"`) y vLLM como checkpoint Qwen3-MoE estándar, siempre cargando el `tokenizer.json` incluido en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | bo→zh (chrF++) | zh→bo (chrF++) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-bo-sft2 | 30,56 B totales / ~3 B activos | no disponible | 9,3 | 25,9 | Apache-2.0 | Hugging Face |
| Qwen3-30B-A3B-Base | 30,56 B totales / ~3 B activos | no disponible | 8,9 | 14,0 | Apache-2.0 | Hugging Face |
| NLLB-200-3.3B | 3,3 B | no disponible | 10,4 | 23,2 | CC-BY-NC-4.0 (no comercial) | Hugging Face |
| MADLAD-400-7B-mt | 7 B | no disponible | 11,8 | no disponible | Apache-2.0 | Hugging Face |

El modelo destaca en zh→bo frente a NLLB-200-3.3B, pero queda por debajo en bo→zh, donde todos los sistemas evaluados rondan los 10 chrF++ según el propio autor. La ventaja de licencia frente a NLLB (Apache-2.0 frente a CC-BY-NC) es relevante para uso comercial.

## Limitaciones y advertencias

- Comprensión tibetano→chino débil en texto complejo o de dominio específico; solo maneja con solvencia frases cotidianas sencillas.
- Las respuestas en tibetano provienen de datos de entrenamiento traducidos automáticamente: caben esperar fraseo estilo traducción automática, errores ocasionales en nombres propios y números, y aparición de caracteres chinos dentro del texto tibetano (aproximadamente un 3 %).
- Cumplimiento del formato bilingüe de aproximadamente el 90 % en prompts reservados; las respuestas largas pueden truncarse, por lo que se recomienda `max_new_tokens` ≥ 700 y penalización por repetición.
- Solo cubre tibetano escrito; no hay cobertura de dialectos ni registro coloquial. El inglés no es idioma de salida soportado.
- No está ajustado en seguridad más allá de lo que aporta el modelo base.
- La tokenización depende de una regex personalizada: los conversores o cargadores que la recalculen a partir del tipo de modelo producirán tokenización incorrecta del tibetano.
- Es un checkpoint temprano de investigación (segunda ronda de SFT); no se recomienda su uso directo en producción sin validación adicional.
- La longitud de contexto no está documentada; conviene medirla antes de diseñar flujos con ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento incluyen fuentes con licencias propias (Wikipedia CC-BY-SA, FineWeb-Edu ODC-BY, entre otras) que conviene revisar según el uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pengcuo2/Qwen3-30B-A3B-bo-sft2
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Corpus MC² (CC0): no disponible enlace directo en la información proporcionada
- Wikipedia tibetana: no disponible enlace directo en la información proporcionada
- FineWeb-Edu: no disponible enlace directo en la información proporcionada
- shajiu/TibetanSft_corpus: https://huggingface.co/datasets/shajiu/TibetanSft_corpus
- MADLAD-400 (Apache-2.0): no disponible enlace directo en la información proporcionada
- FLORES-200: no disponible enlace directo en la información proporcionada
- Megatron-Bridge: no disponible enlace directo en la información proporcionada
