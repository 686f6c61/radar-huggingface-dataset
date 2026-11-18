# mradermacher/MN-Sappho-n4-12B-GGUF

## Resumen

MN-Sappho-n4-12B-GGUF es la distribucion en formato GGUF del modelo MN-Sappho-n4-12B, un merge de modelos creado con mergekit y publicado por la comunidad mergekit-community. Esta version concreta ha sido cuantizada y empaquetada por mradermacher, un conocido contribuidor de Hugging Face especializado en generar cuantizaciones GGUF de modelos populares para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo base cuenta con 12.247.782.400 parametros (aproximadamente 12,2 mil millones) y esta orientado a tareas conversacionales en ingles. Al tratarse de un merge de tipo "n4" (probablemente un modelo de mezcla por capas o task arithmetic segun la nomenclatura de mergekit), combina los pesos de varios modelos preentrenados para heredar capacidades complementarias sin necesidad de un entrenamiento adicional desde cero.

La relevancia de esta ficha radica en que el repositorio original del modelo base no proporciona informacion detallada sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que la mayor parte de las especificaciones tecnicas deben inferirse del tamano del modelo y del ecosistema mergekit. El interes practico esta en la disponibilidad de cuantizaciones GGUF listas para usar en entornos locales, desde Q2_K hasta Q8_0, lo que permite desplegar el modelo en GPUs de consumo con distintas restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del tamano y del ecosistema mergekit; no confirmada en la model card) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit, una herramienta que combina los pesos de varios modelos preentrenados mediante tecnicas como SLERP, TIES, DARE o task arithmetic. La nomenclatura "n4" sugiere una configuracion de merge con cuatro componentes o una variante especifica del metodo de mezcla, aunque la model card no detalla la receta exacta ni los modelos de origen utilizados. Al ser un merge, no ha pasado por un proceso de entrenamiento adicional con RLHF o DPO especifico para este artefacto; las capacidades heredadas provienen de los modelos donantes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es de tipo estatico (static quants), sin usar imatrix; el autor indica que las versiones con imatrix estan disponibles en un repositorio separado (MN-Sappho-n4-12B-i1-GGUF). El proceso de cuantizacion se ha realizado sobre el modelo en formato Hugging Face convertido a GGUF, con una version de quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas, heredado de los modelos fusionados.
- Capacidades de codigo y matematicas no confirmadas explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionarse mediante llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, ofreciendo respuestas coherentes en dialogos multi-turno sin depender de la nube. Es adecuado por su tamano de 12 B, que equilibra calidad y requisitos de hardware.
- Prototipado rapido de chatbots: gracias a las cuantizaciones Q4_K_M (7,6 GB) y Q5_K_M (8,8 GB), se puede desplegar en una RTX 4090 o RTX 3090 para iterar sobre prompts y flujos conversacionales sin coste de API.
- Experimentacion con merges de modelos: investigadores interesados en el ecosistema mergekit pueden usar esta version GGUF para evaluar cualitativamente el comportamiento del merge MN-Sappho-n4-12B en tareas de generacion abierta, comparandolo con los modelos donantes.
- Generacion de texto creativo y redaccion asistida: el modelo puede emplearse para borradores de articulos, correos o guiones en ingles, ejecutandose en local con cuantizaciones Q6_K (10,2 GB) o Q8_0 (13,1 GB) para maximizar la fidelidad respecto al modelo original.
- Educacion y demostraciones: al caber en GPUs de consumo con cuantizaciones bajas (Q2_K, 4,9 GB; Q3_K_S, 5,6 GB), es util para talleres y demos sobre cuantizacion y despliegue local de LLM.
- Evaluacion de robustez de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (desde Q2_K hasta Q8_0), lo que permite estudiar la degradacion de calidad (perplejidad) en funcion del nivel de cuantizacion, siguiendo las graficas y referencias incluidas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - Q2_K: ~4,9 GB de pesos; ~6-7 GB de VRAM en total con contexto moderado.
  - Q4_K_M: ~7,6 GB de pesos; ~9-10 GB de VRAM en total.
  - Q5_K_M: ~8,8 GB de pesos; ~10-11 GB de VRAM en total.
  - Q6_K: ~10,2 GB de pesos; ~12-13 GB de VRAM en total.
  - Q8_0: ~13,1 GB de pesos; ~15-16 GB de VRAM en total.
- GPU recomendadas:
  - RTX 4090 (24 GB): puede ejecutar Q8_0 con contexto amplio sin offloading.
  - RTX 3090 / 4080 (16-24 GB): Q6_K y Q8_0 con contexto moderado.
  - RTX 4070 Ti / 4070 (12 GB): Q4_K_M y Q5_K_M con contexto ajustado.
  - RTX 3060 (12 GB): Q4_K_S y Q4_K_M con contexto limitado.
  - A100 / H100: sobradas para cualquier cuantizacion, utiles para servir multiples instancias o contextos muy largos.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con cuantizaciones Q2_K/Q3_K_S hasta 24 GB con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. Tambien puede servirse mediante endpoints compatibles (tag endpoints_compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la GPU, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MN-Sappho-n4-12B-GGUF (este) | 12,2 B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles, cuantizaciones estaticas |
| Mistral-Nemo-12B | 12 B | 128k (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo base ampliamente usado, multilingue |
| Gemma-2-9B | 9 B | 8k | Gemma license | safetensors, GGUF | Alternativa de Google con licencia restrictiva |
| Qwen2.5-14B | 14 B | 32k (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, multilingue |

Nota: los datos de los modelos comparativos provienen de sus model cards publicas y pueden variar; se incluyen como referencia orientativa. Para MN-Sappho-n4-12B no se dispone de datos de contexto ni licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un merge de modelos, puede heredar sesgos de los modelos donantes, que no se detallan.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de fidelidad para este merge.
- Limitaciones de contexto o idioma: el modelo esta declarado unicamente en ingles; no se especifica la longitud de contexto, lo que impide garantizar dialogos largos.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si permite uso comercial. Es imprescindible verificar la licencia del modelo base (mergekit-community/MN-Sappho-n4-12B) y de los modelos donantes antes de un despliegue en produccion.
- Caveats para produccion: al ser un merge comunitario sin benchmarks publicados, su calidad no esta validada de forma independiente; se recomienda evaluacion propia antes de usarlo en entornos productivos. Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad (el autor marca Q3_K_M como "lower quality").
- El repositorio tiene un numero bajo de descargas (93) y likes (1), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MN-Sappho-n4-12B-GGUF
- Modelo base: https://huggingface.co/mergekit-community/MN-Sappho-n4-12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MN-Sappho-n4-12B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#MN-Sappho-n4-12B-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
