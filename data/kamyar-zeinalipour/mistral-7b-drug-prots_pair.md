# Kamyar-zeinalipour/mistral-7b-drug-prots_pair

## Resumen

mistral-7b-drug-prots_pair es la segunda y definitiva etapa de PharMistral, un modelo especializado en generación de fármacos candidatos condicionada por secuencia proteica. Lo desarrolla un equipo academico liderado por Asma Bendjeddou y Kamyar Zeinalipour (Universidad de Siena y colaboradores), y parte del modelo base mistralai/Mistral-7B-v0.3. El problema que aborda es concreto: dado un target proteico del que solo se conoce la secuencia bruta de aminoacidos, generar ligandos candidatos sin reentrenamiento especifico por target y sin necesidad de estructura 3D.

La relevancia practica esta en el pipeline de descubrimiento temprano: el modelo elimina la dependencia de datos estructurales (cristalografia o predicciones de plegado) y de datasets especificos por diana, dos cuellos de botella habituales en el diseno de moleculas asistido por IA. Segun la model card, en targets no vistos durante el entrenamiento genero un 99,5 % de moleculas quimicamente validas, de las cuales el 57 % fueron unicas.

Arquitectura transformer decoder-only de Mistral-7B (7.000 millones de parametros, atencion con sliding window y GQA), reutilizada como modelo de lenguaje sobre un vocabulario quimico-biologico adaptado mediante un tokenizer propio. La longitud de secuencia de entrenamiento fue de 1.500 tokens. La licencia es Apache 2.0, aunque el autor restringe el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B v0.3), fine-tuning supervisado |
| Parametros totales | 7.000 millones (aproximado; el campo de parametros del repo safetensors esta mal reportado como 266.240) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.500 tokens de longitud de secuencia en entrenamiento; contexto nativo de Mistral-7B v0.3 no indicado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo opera sobre secuencias de proteinas y SMILES, no sobre lenguaje natural) |
| Licencia | Apache 2.0, con uso declarado "research use only" |
| Formato de pesos | safetensors |
| Tokenizer | drug-prot-tokenizer-v2-mistral (obligatorio, en repo separado) |
| Tamano del repo | 14,5 GB |
| Dataset de entrenamiento | Protein-drug-v2 (etapa I), Protein-drug-pair-v2 (etapa II, pares de ChEMBL-26) |

## Arquitectura y entrenamiento

El modelo es un Mistral-7B v0.3 adaptado en dos etapas. La etapa I (mistral-7b-drug-prots) consistio en preentrenamiento conjunto sobre secuencias de proteinas no emparejadas y moleculas pequenas, lo que ensena al modelo la gramatica de ambos dominios (aminoacidos y SMILES). La etapa II, que es este checkpoint, aplica fine-tuning condicionado por secuencia sobre pares proteina-ligando de alta afinidad extraidos de ChEMBL-26, de modo que el modelo aprende a generar ligandos dada una proteina.

Los hiperparametros publicados son: longitud de secuencia 1.500, batch size 4 con 4 pasos de acumulacion de gradiente sobre 4 GPUs, learning rate 5e-5 con decaimiento coseno y tasa de fill-in-the-middle de 0,5. El uso de FIM sugiere que el modelo puede rellenar fragmentos de molecula condicionados por contexto, una capacidad util para optimizacion de scaffolds. No se documentan tecnicas de RLHF/DPO ni decodificacion especulativa; el entrenamiento es supervisado sobre pares. El tokenizer es especifico del dominio y no es intercambiable con el tokenizer original de Mistral.

## Capacidades

- Generacion de moleculas (SMILES) condicionada por secuencia proteica bruta, sin entrada estructural.
- Generalizacion a targets no vistos en entrenamiento (evaluada en held-out targets).
- Relleno de fragmentos moleculares (fill-in-the-middle) para completar o modificar scaffolds.
- Modelado de la relacion proteina-ligando a nivel de secuencia, util para filtrado previo de candidatos.
- Generacion de texto sobre secuencias quimicas y biologicas; no es un chatbot generalista.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues en lenguaje natural: no disponibles ni relevantes para el uso previsto.

## Casos de uso

- Generacion de candidatos para dianas huerfanas: para una proteina sin estructura resuelta, se introduce la secuencia de aminoacidos y se obtienen ligandos candidatos que sirven como punto de partida para cribado virtual y quimica medicinal.
- Priorizacion en descubrimiento temprano: generar decenas o cientos de moleculas por target y pasarlas por filtros de validez, unicidad y propiedades ADMET antes de sintesis, reduciendo el espacio de busqueda inicial.
- Relleno y optimizacion de scaffolds: usando la tasa FIM de 0,5 con la que se entreno, completar fragmentos de una molecula conocida manteniendo el contexto de la diana.
- Generacion de librerias focused para una familia de proteinas: aplicar el modelo a variantes de una misma diana (por ejemplo, mutantes) para explorar como cambia la distribucion de ligandos generados.
- Investigacion metodologica en LLMs para quimica: servir de baseline reproducible (codigo y datasets publicos en GitHub y Hugging Face) para comparar estrategias de condicionamiento por secuencia frente a modelos de difusion o grafos.
- Docencia y prototipado en bioinformatica: pipeline ligero que cabe en una GPU de 24 GB en fp16 y permite montar demos de generacion condicionada sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de validez y unicidad sobre targets held-out:

| Metrica | Resultado |
|---|---|
| Moleculas quimicamente validas | 99,5 % |
| Moleculas unicas (sobre las validas) | 57 % |
| Evaluacion en targets no vistos | si (held-out) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas de docking) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 14-15 GB de pesos, unos 16-18 GB con overhead de inferencia; cabe en una RTX 4090 (24 GB) o A6000 (48 GB).
- VRAM en cuantizacion 8 bits: en torno a 8 GB; en 4 bits, en torno a 4-5 GB, aunque no se distribuyen pesos cuantizados oficiales y habria que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para batch alto y entrenamiento; RTX 4090, L40S o A6000 para inferencia en produccion ligera.
- Despliegue: transformers con el tokenizer drug-prot-tokenizer-v2-mistral; vLLM y TGI son compatibles con la arquitectura Mistral, pero requieren verificar el vocabulario custom. llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se hizo sobre 4 GPUs, lo que da una idea del perfil de recursos, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral-7b-drug-prots_pair | 7.000 M | 1.500 tokens de secuencia | Generacion condicionada por secuencia proteica | Apache 2.0 (research use only) | Hugging Face, safetensors |
| mistral-7b-drug-prots (etapa I) | 7.000 M | 1.500 tokens de secuencia | Preentrenamiento conjunto proteina-molecula | Apache 2.0 | Hugging Face |
| Mistral-7B v0.3 (base) | 7.000 M | Contexto nativo de Mistral v0.3 | LLM generalista | Apache 2.0 | Hugging Face |
| Modelos de difusion/graph-based para drug design | no disponible | no disponible | Generacion 3D/2D de ligandos | variable | variable |

La comparacion con alternativas especializadas de diseno molecular (por ejemplo, modelos de difusion condicionados por bolsillo) no puede cuantificarse porque la informacion disponible no incluye resultados comparativos.

## Limitaciones y advertencias

- Uso declarado exclusivamente de investigacion: las moleculas generadas son hipotesis computacionales, no sintetizadas ni testadas; requieren evaluacion de quimica medicinal, seguridad y regulatoria.
- Riesgo de alucinacion quimica: aunque la validez reportada es del 99,5 %, la validez sintactica SMILES no garantiza sintetizabilidad, estabilidad ni actividad real.
- Unicidad limitada: solo el 57 % de las moleculas validas fueron unicas, lo que implica redundancia considerable en las generaciones y necesidad de deduplicacion en pipelines.
- Dependencia estricta del tokenizer custom: usar el tokenizer de Mistral estandar produce resultados invalidos.
- Sin datos publicados de sesgos, comportamiento multilingue ni evaluacion de seguridad; no apto para decisiones clinicas.
- Contexto de secuencia de 1.500 tokens: proteinas mas largas requieren truncamiento o segmentacion, con perdida de informacion.
- El campo de parametros del repo safetensors (266.240) es incorrecto; no debe usarse para estimar requisitos de memoria.
- Sin versiones cuantizadas oficiales ni soporte documentado en llama.cpp/Ollama; el despliegue en produccion exige trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots_pair
- Etapa I: https://huggingface.co/Kamyar-zeinalipour/mistral-7b-drug-prots
- Tokenizer: https://huggingface.co/Kamyar-zeinalipour/drug-prot-tokenizer-v2-mistral
- Dataset etapa I: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-v2
- Dataset etapa II: https://huggingface.co/datasets/Kamyar-zeinalipour/Protein-drug-pair-v2
- Paper (CMPB Update 2026): https://doi.org/10.1016/j.cmpbup.2026.100257
- Codigo y scripts: https://github.com/KamyarZeinalipour/PharMistral
- Scripts de entrenamiento: https://github.com/KamyarZeinalipour/PharMistral/tree/main/scripts
- Coleccion PharMistral: https://huggingface.co/collections/Kamyar-zeinalipour/pharmistral-cmpb-update-2026-6af48fca521e8481db608782
