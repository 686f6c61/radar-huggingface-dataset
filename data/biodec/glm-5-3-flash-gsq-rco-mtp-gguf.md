# BioDec/GLM-5.3-Flash-GSQ-RCO-MTP-GGUF

## Resumen

BioDec/GLM-5.3-Flash-GSQ-RCO-MTP-GGUF es una cuantización GGUF del modelo GLM-5.3-Flash, un modelo multimodal (imagen-texto a texto) de arquitectura MoE con 320.759.404.382 parámetros totales, publicado por el equipo de BioDec como una modificación del repositorio pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF. El objetivo del trabajo es hacer desplegable en una única GPU este modelo de gran tamaño, combinando la cuantización GSQ-RCO en formato IQ3_S con la capa MTP (multi-token prediction) cuantizada en Q4_K_M procedente de la versión de unsloth.

La relevancia de esta ficha de modelo está en el método de cuantización: el laboratorio ISTA/DASLab desarrolló GSQ (cuantización escalar post-entrenamiento con relajación Gumbel-Softmax) y RCO (asignación optimizada de tipos de cuantización por tensor bajo un presupuesto de tamaño), logrando un GGUF no uniforme que reduce el tamaño del modelo a 142,8 GB manteniendo la calidad. Según los autores, el modelo corre en producción sobre una única GPU AMD Instinct MI210 con llama.cpp v0.7.0 y es aproximadamente un 15 % más rápido que la cuantización UD-Q4_K_XL de unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (GLM-5.3-Flash, familia glm5next), multimodal image-text-to-text |
| Parametros totales | 320.759.404.382 (~320,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 163.840 tokens (configuracion de produccion de los autores); valor nominal del modelo base: no disponible |
| Tipos de cuantizacion | IQ3_S (GSQ-RCO) para el modelo principal; Q4_K_M para la capa MTP (nextn); KV cache q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (endpoints compatibles con llama.cpp); tamano del repositorio: 142,8 GB |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash, es un modelo de arquitectura mixture-of-experts (MoE) con capacidades multimodales (pipeline image-text-to-text), perteneciente a la familia "glm5next". El numero de parametros activos por token y los detalles del entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada. La version de BioDec incorpora ademas una capa MTP (multi-token prediction) que permite decodificacion especulativa tipo draft-mtp en llama.cpp.

La innovacion principal de esta version esta en la cuantizacion. GSQ (Gumbel-Softmax Quantization) realiza cuantizacion escalar post-entrenamiento aprendiendo conjuntamente las asignaciones por coordenada a la rejilla y las escalas por grupo mediante una relajacion Gumbel-Softmax, cerrando gran parte de la distancia entre cuantizacion escalar y vectorial en el rango de 2 a 3 bits sin salir de formatos escalares estandar como GGUF. RCO (Riemannian Constrained Optimization) asigna a cada uno de los N tensores uno de K tipos de cuantizacion bajo un presupuesto total de tamano, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar por gradiente directamente sobre la perdida de tarea respetando el presupuesto exactamente. El resultado es un GGUF no uniforme (IQ3_S) al tamano solicitado, al que BioDec injerto la capa MTP cuantizada en Q4_K_M de unsloth/GLM-5.3-Flash-GGUF.

## Capacidades

- Generacion de texto conversacional (pipeline conversational), con razonamiento y generacion de codigo heredados del modelo base GLM-5.3-Flash (detalles especificos no disponibles).
- Comprension multimodal de imagen y texto (pipeline image-text-to-text).
- Soporte de vision via mmproj en llama.cpp (la configuracion de los autores incluye la opcion mmproj-offload).
- Decodificacion especulativa mediante capa MTP (spec-type = draft-mtp), con draft_n_max = 1 en produccion.
- Ejecucion en contextos largos: los autores usan 163.840 tokens de contexto con KV cache cuantizada (q8_0) y kv-unified.
- Uso en flujos agenticos: los autores reportan que la variante IQ3_S es estable en workflows agenticos (a diferencia de la IQ3_XXS, que tiende a entrar en bucles).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en una sola GPU de datacenter: el modelo cabe y corre en produccion sobre una AMD Instinct MI210 (64 GB de HBM), lo que lo hace adecuado para organizaciones que no pueden permitirse nodos multi-GPU.
- Chatbot multimodal con contexto largo: con 163.840 tokens de contexto y soporte de imagen, es util para asistentes que analizan documentos extensos con figuras y capturas.
- Sistemas agenticos de multiples pasos: los autores lo usan en produccion en workflows agenticos, y descartaron la cuantizacion IQ3_XXS precisamente por inestabilidad en ese escenario, lo que indica que IQ3_S es la variante recomendada para agentes.
- Inferencia de alto throughput con presupuesto de VRAM ajustado: la combinacion GSQ-RCO + KV cache q8_0 ofrece ~15 % mas de velocidad que la alternativa Q4_K_XL de unsloth a calidad comparable.
- Procesamiento por lotes de documentos (batch offline): con batch-size 4096 y ubatch-size 2048 en llama.cpp, adecuado para pipelines de ingesta y resumen de documentacion.
- Experimentacion con decodificacion especulativa MTP: el repositorio incluye la capa nextn lista para draft-mtp, util para investigar aceptacion de drafts en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los autores si publican mediciones de velocidad de generacion (llama-benchy, AMD MI210, una GPU, draft_n_max=1), comparando BioDec GSQ-RCO IQ3_S frente a unsloth Q4_K_M:

| ctx len | ctx_tg (t/s) | tg32 (t/s) |
|---|---|---|
| 16k | 19,17 / 17,24 = +11,2 % | 20,15 / 17,42 = +15,7 % |
| 32k | 17,77 / 15,39 = +15,5 % | 16,95 / 14,85 = +14,2 % |
| 64k | 14,66 / 13,57 = +8,0 % | 14,96 / 12,65 = +18,3 % |

En global, los autores reportan que el modelo es aproximadamente un 15 % mas rapido que unsloth/GLM-5.3-Flash-GGUF:UD-Q4_K_XL en su configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 142,8 GB; los autores lo ejecutan completo en una unica AMD Instinct MI210 (64 GB HBM2e), lo que implica offload de pesos a memoria del sistema (load-mode = none, split-mode = layer). En configuracion puramente GPU se estimarian ~150 GB o mas con contexto y cache.
- GPU recomendadas: AMD Instinct MI210 (configuracion validada en produccion); por tamano, serian adecuadas tambien MI250X/MI300X o 2-3 GPU tipo A100/H100 80 GB en split-mode layer.
- Consumer GPUs: no cabe en una unica GPU de consumo (una RTX 4090 con 24 GB es insuficiente incluso con offload agresivo); es viable en sistemas con gran RAM de sistema (192 GB o mas) usando offload parcial con llama.cpp, con penalizacion de velocidad.
- Opciones de despliegue: llama.cpp (v0.7.0 o superior, es el runtime validado por los autores); Ollama y LM Studio pueden funcionar al ser GGUF, pero no hay confirmacion; vLLM y TGI no son aplicables directamente al formato GGUF.
- Rendimiento conocido: 19,17 t/s de procesamiento de contexto y 20,15 t/s de generacion a 16k de contexto en MI210 (ver tabla de benchmarks); a 64k baja a ~14,7-15 t/s.
- Configuracion recomendada por los autores: cache-type-k/v = q8_0, kv-unified = on, spec-type = draft-mtp con spec-draft-n-max = 1 (valores mayores de draft no aportaron mejora medible).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Velocidad relativa (MI210) | Licencia |
|---|---|---|---|---|---|
| BioDec/GLM-5.3-Flash-GSQ-RCO-MTP-GGUF | 320,76 B (MoE) | IQ3_S (GSQ-RCO) + MTP Q4_K_M | GGUF | referencia (+15 % vs unsloth UD-Q4_K_XL) | MIT |
| unsloth/GLM-5.3-Flash-GGUF (UD-Q4_K_XL) | 320,76 B (MoE) | Q4_K_XL dinamica | GGUF | ~15 % mas lento | no disponible |
| pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF | 320,76 B (MoE) | IQ3_S / IQ3_XXS (GSQ-RCO) | GGUF | similar (es el modelo base de esta version) | MIT |

Notas: la variante IQ3_XXS de pfeifferj resulto inestable en workflows agenticos (tendencia a bucles), por lo que esta version de BioDec incluye solo IQ3_S. La diferencia clave frente a unsloth es el metodo de cuantizacion (GSQ-RCO frente a cuantizacion dinamica Q4) y el rendimiento, a cambio de un numero de bits medio inferior.

## Limitaciones y advertencias

- La variante IQ3_XXS del metodo GSQ-RCO mostro inestabilidad en flujos agenticos (bucles repetitivos); aunque esta version usa IQ3_S, conviene validar el comportamiento en agentes antes de pasar a produccion.
- La cuantizacion a ~3 bits implica inevitablemente cierta perdida de calidad respecto al modelo base en BF16; no se han publicado evaluaciones cuantitativas de esa degradacion.
- spec-draft-n_max > 1 no proporciono ventaja medible a los autores pese a buena tasa de aceptacion; no contar con aceleracion especulativa multi-token.
- Numero de parametros activos, idiomas soportados, capacidades exactas de tool calling y detalles del entrenamiento del modelo base: no disponibles en la informacion proporcionada.
- Sesgos y riesgo de alucinacion: heredados del modelo base GLM-5.3-Flash; no hay documentacion especifica en esta ficha.
- Requiere hardware de datacenter o sistemas con mucha RAM para offload; no es un modelo para estaciones de trabajo de consumo tipicas.
- Licencia MIT: sin restricciones para uso comercial, pero los terminos aplicables del modelo base GLM-5.3-Flash (si difieren de MIT) deben verificarse por el usuario; en la informacion disponible solo consta MIT para este repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BioDec/GLM-5.3-Flash-GSQ-RCO-MTP-GGUF
- Modelo base (pfeifferj): https://huggingface.co/pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF
- Capa MTP de origen (unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
- ISTA/DASLab en Hugging Face: https://huggingface.co/ISTA-DASLab
