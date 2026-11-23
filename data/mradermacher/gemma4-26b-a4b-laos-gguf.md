# mradermacher/gemma4-26b-a4b-laos-GGUF

## Resumen

`mradermacher/gemma4-26b-a4b-laos-GGUF` es una coleccion de cuantizaciones GGUF del modelo `Phonepadith/gemma4-26b-a4b-laos`, un ajuste fino de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE) y aproximadamente 25.230 millones de parametros totales. El modelo deriva de un checkpoint base de Google (Gemma 4) y ha sido adaptado por Phonepadith, presumiblemente para el idioma lao, y posteriormente cuantizado por mradermacher para su uso en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF.

La relevancia de esta ficha radica en que el repositorio ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de IQ4_XS y los complementos multimodales mmproj en Q8_0 y f16), lo que permite desplegar un modelo MoE de ~25B en hardware de consumo. No obstante, la informacion publicada es muy escasa: no se detallan la composicion del dataset de entrenamiento, el numero de tokens, el proceso de alineacion ni resultados de benchmarks.

El repositorio tiene 534 descargas, 0 likes, un tamano total de 184,9 GB y una licencia denominada `aidctech` (distinta de la licencia estandar de Gemma), lo que introduce incertidumbre sobre las condiciones exactas de uso comercial. La fecha de creacion registrada es 2026-09-16 y la de actualizacion 2026-10-27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma 4; detalles de capas y atencion no disponibles |
| Parametros totales | 25.233.142.046 (~25,23 B) |
| Parametros activos | no disponible (el sufijo "a4b" sugiere ~4 B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos); el ajuste "laos" sugiere capacidad adicional en lao, no confirmada en la model card |
| Licencia | aidctech (licencia personalizada, enlazada como LICENSE en el repo) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Gemma 4, con 25.233.142.046 parametros totales segun los tensores en safetensors. El nombre del checkpoint (`gemma4-26b-a4b`) sugiere un diseno con aproximadamente 4 mil millones de parametros activos por token, aunque esta cifra no aparece confirmada en la informacion disponible. El repositorio incluye complementos `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora un proyector multimodal para entrada de imagenes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El autor de las cuantizaciones indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) y que no tiene previsto generar cuantizaciones ponderadas/imatrix salvo peticion explicita en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto conversacional, segun los tags `conversational` y `text-generation-inference`.
- Procesamiento multimodal de imagenes: la presencia de los ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` indica soporte de entrada visual en el modelo base.
- Razonamiento y generacion de codigo: capacidad esperable por herencia de Gemma 4, no documentada explicitamente en la informacion disponible.
- Capacidades multilingues: los metadatos declaran unicamente `en`; no se confirma el soporte del idioma lao pese al nombre del checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,6 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y el formato GGUF facilitan integrar el modelo en aplicaciones de chat mediante llama.cpp o servidores compatibles con la API de OpenAI.
- Procesamiento de documentos con imagenes: con el complemento `mmproj-f16.gguf` (1,3 GB) se puede realizar OCR o descripcion de imagenes en pipelines locales, siempre que el modelo base confirme la capacidad multimodal.
- Evaluacion de modelos MoE en entornos de investigacion: el rango completo de cuantizaciones (de Q2_K a Q8_0) permite estudiar la degradacion de calidad frente al tamano, comparando Q4_K_M con Q8_0 en tareas controladas.
- Inferencia en servidores con multiples GPUs: la variante Q8_0 (27,0 GB) puede servirse con vLLM o TGI si se dispone de dos GPUs de 24 GB o una A100 de 40 GB, aunque la compatibilidad de vLLM con GGUF es limitada.
- Experimentacion con modelos ajustados a idiomas de bajos recursos: el checkpoint "laos" permite explorar el comportamiento de Gemma 4 en lao, aunque la falta de benchmarks obliga a una validacion manual previa.
- Fine-tuning ligero sobre la base cuantizada: no recomendado directamente sobre GGUF; seria necesario partir del modelo base en safetensors `Phonepadith/gemma4-26b-a4b-laos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,7 GB
  - Q3_K_S: ~12,3 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~13,9 GB
  - IQ4_XS: ~14,2 GB
  - Q4_K_S: ~15,6 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~18,1 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
  - Q8_0: ~27,0 GB
  - mmproj Q8_0: ~0,9 GB adicionales; mmproj f16: ~1,3 GB adicionales
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 con contexto amplio; configuraciones multi-GPU para Q8_0 si se requiere ventana de contexto grande.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; TGI y vLLM tienen soporte parcial o experimental para GGUF, por lo que se recomienda validar la version concreta.
- Latencia y throughput: no disponibles; al tratarse de un MoE con ~4 B activos (segun el nombre), el throughput esperado seria superior al de un modelo denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma4-26b-a4b-laos-GGUF | ~25,23 B totales (MoE) | no disponible | aidctech | GGUF | Cuantizaciones estaticas, sin imatrix |
| Phonepadith/gemma4-26b-a4b-laos | ~25,23 B totales (MoE) | no disponible | no disponible | safetensors | Modelo base del que derivan las cuantizaciones |
| Gemma 4 base (Google) | no disponible | no disponible | Gemma Terms of Use | safetensors | Modelo original sin ajuste "laos"; referencia de la familia |
| Mistral Small 3 (24B) | ~24 B densos | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano comparable, con licencia permisiva |

La comparacion con Mistral Small 3 se incluye como referencia de categoria por tamano; no se dispone de datos de rendimiento comparativos entre ambos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multilingues, lo que impide estimar la calidad real del ajuste "laos".
- Licencia `aidctech` personalizada: no es la licencia estandar de Gemma ni una licencia OSI; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Idiomas declarados: solo `en` en los metadatos, pese al nombre "laos"; el soporte real del lao no esta verificado y podria ser limitado o inexistente.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluaciones publicadas no se puede acotar su magnitud.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Gemma 4 y los del dataset de ajuste, no descrito.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas, lo que puede suponer una perdida de calidad mayor en Q2_K y Q3_K frente a alternativas imatrix.
- Fecha de creacion futura (2026-09-16): metadato anomalo que sugiere posible error de registro o manipulacion del repositorio; conviene verificar la procedencia antes de usarlo en produccion.
- Repositorio con 0 likes y 534 descargas: baja validacion comunitaria; no hay evidencia de uso extendido ni reportes de calidad.
- Compatibilidad de herramientas: al ser un GGUF de un modelo MoE multimodal, el soporte en vLLM, TGI y algunas versiones de llama.cpp puede ser incompleto; validar el runtime antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma4-26b-a4b-laos-GGUF
- Modelo base: https://huggingface.co/Phonepadith/gemma4-26b-a4b-laos
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-26b-a4b-laos-GGUF
- Fichero LICENSE del repositorio: https://huggingface.co/mradermacher/gemma4-26b-a4b-laos-GGUF/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
