# c4tdr0ut/Azazel-24B-RL

## Resumen

Azazel-24B-RL es un ajuste fino (fine-tuning) del modelo Mistral-Small-24B-Instruct-2501, publicado por el usuario c4tdr0ut en Hugging Face. Se trata de un modelo de generacion de texto de 23.572 millones de parametros (aproximadamente 23,6B) construido sobre la arquitectura Mistral Small y entrenado mediante las librerias Unsloth y TRL de Hugging Face, segun indica el propio autor en la model card. El modelo parte de la version cuantizada a 4 bits del modelo base (unsloth/Mistral-Small-24B-Instruct-2501-unsloth-bnb-4bit).

La relevancia de este modelo es limitada dentro del ecosistema: se trata de un ajuste fino de caracter comunitario, con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica detallada sobre el dataset de entrenamiento, el proceso de ajuste ni evaluaciones de rendimiento. La model card es practicamente un placeholder generado por Unsloth que unicamente confirma el modelo base, la licencia Apache 2.0 y el idioma ingles.

Por tanto, esta ficha debe interpretarse como una descripcion del modelo base subyacente (Mistral Small 24B Instruct 2501) con las salvedades propias de un fine-tuning no documentado. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no existen garantias publicadas sobre el comportamiento especifico de este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Small), segun modelo base |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small 2501 soporta 128k tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en bnb-4bit; los pesos publicados son safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Mistral-Small-24B-Instruct-2501, un transformer decoder-only de aproximadamente 24B parametros desarrollado por Mistral AI. No se dispone de informacion adicional sobre variaciones arquitectonicas introducidas en este ajuste. El modelo de partida es la version del modelo base publicada por Unsloth cuantizada a 4 bits en formato bitsandbytes, lo que sugiere que el ajuste fino se realizo sobre pesos cuantizados.

En cuanto al entrenamiento, la unica informacion disponible es que se utilizaron las librerias Unsloth y TRL de Hugging Face, y que el autor afirma un entrenamiento "2x mas rapido" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT, ni hiperparametros como la tasa de aprendizaje o el numero de epochs. El sufijo "RL" en el nombre del modelo sugiere reinforcement learning, pero no hay confirmacion documental de ello.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Mistral Small Instruct.
- Razonamiento general y respuesta a instrucciones (instruction following), segun las capacidades del modelo base.
- Generacion de codigo y matematicas, presumiblemente heredadas del modelo base, aunque no verificadas para este ajuste.
- Soporte de tool calling y function calling: no confirmado para este fine-tuning, aunque el modelo base Mistral Small 2501 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la model card (el modelo base soporta multiples idiomas, pero este ajuste declara solo en).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion e investigacion en ajuste fino: el modelo sirve como ejemplo de fine-tuning ligero con Unsloth sobre un modelo base de 24B, util para reproducir pipelines de entrenamiento con recursos limitados.
- Generacion de texto en ingles para prototipos: adecuado para pruebas de concepto de chatbots o asistentes conversacionales en ingles, siempre que se valide su comportamiento frente al modelo base.
- Base para nuevos ajustes comunitarios: al estar publicado en safetensors con licencia Apache 2.0, puede servir como punto de partida para otros fine-tunes.
- Evaluacion comparativa de tecnicas de cuantizacion: permite estudiar el impacto de ajustar sobre pesos bnb-4bit frente a pesos completos, comparando con el modelo base original.
- Despliegue experimental con TGI o transformers: la model card incluye el tag text-generation-inference, por lo que puede probarse en entornos de inferencia estandar, aunque sin garantias de rendimiento.
- Docencia y formacion: util para ilustrar el ciclo completo de publicacion de un modelo en Hugging Face, incluida la generacion de model cards con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones (MMLU, HumanEval, GSM8K u otras) en la model card, ni comparaciones con el modelo base o alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 23,6B parametros en safetensors, se requiere aproximadamente 47 GB en fp16 (coincide con el tamano del repo, 47,2 GB), unos 24 GB en int8 y unos 12-14 GB en cuantizaciones de 4 bits tipo GGUF/AWQ/GPTQ.
- GPU recomendadas: A100 80 GB o H100 para fp16 sin cuantizar; A100 40 GB o L40S para int8; RTX 4090 (24 GB) viable con cuantizacion a 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion a 4 bits en GPUs de 16-24 GB (RTX 4080, 4090, etc.), aunque no hay datos de rendimiento especificos para este fine-tuning.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag incluido), y previsiblemente llama.cpp/Ollama/vLLM si se generan cuantizaciones GGUF o se convierte el modelo, aunque no se proporcionan artefactos de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Azazel-24B-RL | 23,6B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin documentacion |
| Mistral-Small-24B-Instruct-2501 (modelo base) | ~24B | 128k (segun Mistral AI) | Apache 2.0 | Ampliamente disponible | Modelo oficial de Mistral AI, con benchmarks publicados |
| Mistral-Small-24B-Instruct-2501-unsloth-bnb-4bit | ~24B | 128k | Apache 2.0 | Hugging Face (Unsloth) | Version cuantizada a 4 bits del modelo base |
| Gemma 2 27B Instruct | 27B | 8k | Gemma license | Ampliamente disponible | Alternativa de tamano similar de Google, con benchmarks publicados |

No se dispone de datos de rendimiento de Azazel-24B-RL que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y posibles contaminaciones.
- Riesgo de alucinacion no cuantificado; al ser un fine-tuning sin evaluacion publicada, no hay garantias sobre su fiabilidad frente al modelo base.
- Idioma limitado al ingles segun la model card, lo que restringe su uso en castellano u otros idiomas.
- Longitud de contexto no confirmada para este ajuste; no asumir los 128k del modelo base sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base tambien Apache 2.0, conviene revisar los terminos del modelo original de Mistral AI.
- El ajuste se realizo sobre pesos cuantizados a 4 bits (bnb-4bit), lo que puede degradar la calidad respecto al modelo base en pesos completos.
- Modelo sin descargas ni validacion comunitaria: no hay evidencia de terceros sobre su comportamiento real.
- El sufijo "RL" no esta respaldado por documentacion tecnica, por lo que no debe asumirse que se aplico reinforcement learning.
- No se proporcionan artefactos GGUF ni cuantizaciones listas para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c4tdr0ut/Azazel-24B-RL
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Mistral-Small-24B-Instruct-2501-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo original de Mistral AI (referencia): https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
