# mradermacher/diffusion-lfm2.5-24b-a2b-blocktune-GGUF

## Resumen

Esta ficha describe `mradermacher/diffusion-lfm2.5-24b-a2b-blocktune-GGUF`, una coleccion de cuantizaciones estáticas en formato GGUF del modelo `summerAIO/diffusion-lfm2.5-24b-a2b-blocktune`. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, y no introduce cambios en los pesos mas alla de la conversion y compresion. El modelo subyacente es un transformer de tipo Mixture of Experts (MoE) con 23.971.587.712 parametros totales, afinado sobre el modelo base LFM2.5 de 24B, y etiquetado por sus autores como experimental y research-preview.

La particularidad tecnica es que se presenta como un modelo de difusion por bloques (`block-diffusion`), una variante de generacion no autoregresiva que difumina y refina bloques de tokens en paralelo. Segun los metadatos de la model card, el afinado se ha realizado con LoRA fusionado sobre el dataset `iamtarun/python_code_instructions_18k_alpaca`, lo que orienta el modelo hacia generacion de codigo en ingles. El repositorio incluye pesos en bf16 y una familia completa de cuantizaciones GGUF (de Q2_K a Q8_0), lo que permite desplegarlo en hardware muy diverso.

Su relevancia ahora mismo es doble: por un lado, explora una arquitectura de difusion aplicada a un MoE grande, un territorio poco poblado frente a los transformers autoregresivos convencionales; por otro, al estar disponible en GGUF, cualquier desarrollador con llama.cpp puede experimentar con el sin necesidad de infraestructura de datacenter. No obstante, conviene tratarlo como material de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con generacion por difusion de bloques (block-diffusion) |
| Parametros totales | 23.971.587.712 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; sin imatrix) |
| Idiomas soportados | en |
| Licencia | lfm-open-license-v1.0 (etiquetada como `other`, enlace a LICENSE del modelo base) |
| Formato de pesos | GGUF (repo original en bf16/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 24B parametros construido sobre la familia LFM2.5. La innovacion principal es el esquema de difusion por bloques: en lugar de generar token a token de forma autoregresiva, el modelo parte de ruido o de una mascara sobre un bloque de tokens y lo refina iterativamente hasta producir texto coherente. Este enfoque permite, en teoria, mayor paralelismo en la generacion y una planificacion global del bloque, a costa de un proceso de muestreo mas complejo y menos maduro en herramientas de inferencia.

El afinado documentado es un LoRA fusionado (`lora-merged`) sobre `iamtarun/python_code_instructions_18k_alpaca`, un dataset de instrucciones de codigo en ingles de aproximadamente 18.000 ejemplos. No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion completa del dataset, ni si hubo fases de RLHF o DPO. Los tags `experimental` y `research-preview` indican que los autores no lo presentan como un modelo estabilizado. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del propio mecanismo de difusion.

## Capacidades

- Generacion de texto y codigo en ingles, con orientacion clara a instrucciones de programacion por el dataset de afinado.
- Razonamiento multi-paso dentro de un bloque de difusion, con refinamiento iterativo del contenido.
- Conversacion multi-turno (tag `conversational` en los metadatos).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia estandar.
- Capacidades multilingues limitadas al ingles segun la model card; no se declaran otros idiomas.
- No se documentan tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Experimentacion en investigacion de modelos de difusion: el modelo permite comparar generacion no autoregresiva por bloques frente a transformers autoregresivos de tamano similar, usando las cuantizaciones Q4 o Q5 en una sola GPU.
- Generacion de codigo asistida en entornos de desarrollo: dado el afinado sobre instrucciones de Python, puede emplearse para completar funciones o explicar fragmentos, siempre con revision humana por su caracter experimental.
- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y la compatibilidad con endpoints permiten montar un chatbot de prueba con llama.cpp o servidores compatibles.
- Evaluacion de tecnicas de cuantizacion: al ofrecer once variantes GGUF, sirve para medir la degradacion de calidad entre Q2_K y Q8_0 en un MoE de difusion.
- Docencia y divulgacion: util para explicar en clase o en articulos como funciona la difusion aplicada a lenguaje, con un modelo de 24B que cabe en hardware de gama alta consumer.
- Pruebas de integracion en pipelines de CI: la version Q4_K_M (14,6 GB) puede cargarse en un runner con GPU de 24 GB para validar respuestas sobre codigo antes de adoptar el modelo en un flujo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~9 GB, Q3_K_S ~10,5 GB, Q3_K_M ~11,6 GB, Q3_K_L ~12,5 GB, IQ4_XS ~13 GB, Q4_K_S ~13,8 GB, Q4_K_M ~14,6 GB, Q5_K_S ~16,6 GB, Q5_K_M ~17,1 GB, Q6_K ~19,8 GB, Q8_0 ~25,6 GB. Hay que sumar el espacio para el contexto y el estado de difusion.
- GPU recomendadas: RTX 4090 (24 GB) para Q4 y Q5; RTX 3090 o 4080 para Q4; A100 40/80 GB o H100 para Q6, Q8 y bf16.
- Cabe en GPU consumer: si, en modelos con 24 GB para cuantizaciones Q4_K_M o inferiores; Q5_K_M entra ajustado y Q6/Q8 requieren 32 GB o mas.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el repo original en transformers para bf16, aunque el soporte de difusion por bloques puede requerir codigo especifico no documentado aqui.
- Latencia y throughput: no disponibles. Al tratarse de difusion por bloques, el perfil de latencia puede diferir sustancialmente del de un transformer autoregresivo del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| diffusion-lfm2.5-24b-a2b-blocktune (este) | 23,97B (MoE) | no disponible | lfm-open-license-v1.0 | GGUF, bf16 | Difusion por bloques, experimental, solo ingles |
| LFM2.5 24B base (summerAIO) | ~24B | no disponible | lfm-open-license-v1.0 | safetensors | Modelo origen; arquitectura autoregresiva estandar |
| MoE de ~24B con cuantizacion GGUF (familia Mixtral/Qwen, generico) | ~24B | 32k-128k tipico | Apache 2.0 o similar | GGUF, safetensors | Mayor madurez de herramientas y benchmarks publicos |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la tercera fila son orientativos de la categoria y no deben tomarse como mediciones de este modelo.

## Limitaciones y advertencias

- Modelo etiquetado como `experimental` y `research-preview`: no esta validado para produccion y puede presentar comportamientos erraticos en la generacion por difusion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo elevado de alucinacion y de codigo incorrecto: el afinado se hizo sobre un dataset pequeno de instrucciones de Python, sin evaluaciones publicadas.
- No se documentan sesgos, pero al derivar de un modelo base no auditado en esta ficha, deben asumirse los sesgos habituales de los corpus web en ingles.
- La licencia `lfm-open-license-v1.0` no es una licencia open source estandar; es imprescindible revisar el enlace a LICENSE antes de cualquier uso comercial.
- Las cuantizaciones son estaticas y no hay versiones imatrix, por lo que la calidad en Q2 y Q3 puede degradarse mas de lo habitual.
- El soporte de difusion por bloques en herramientas de inferencia puede ser limitado o requerir versiones concretas de llama.cpp; verificar compatibilidad antes de desplegar.
- No hay informacion sobre longitud de contexto, parametros activos del MoE ni latencia, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/diffusion-lfm2.5-24b-a2b-blocktune-GGUF
- Modelo base: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-blocktune
- Licencia del modelo base: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-blocktune/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#diffusion-lfm2.5-24b-a2b-blocktune-GGUF
- Dataset de afinado: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
