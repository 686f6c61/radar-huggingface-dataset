# 1bit-MONSTER/Inkling-2-Mini-NVFP4-MXFP8-loom

## Resumen

Inkling-2-Mini-NVFP4-MXFP8-loom es una tarjeta de despliegue (Loom card) publicada por 1bit-MONSTER para servir el modelo thinkingmachines/Inkling-2-Mini sobre GPUs AMD mediante el runtime Loom (hrx-system). No contiene pesos: es un paquete de programas de inferencia, kernels nativos NVFP4/MXFP8 y metadatos que permiten ejecutar los pesos publicados del modelo base sin convertirlos ni dequantizarlos. Su interes reside en que preserva los formatos originales de los expertos enrutados (capas 0-19 en NVFP4, capas 20-23 en MXFP8) y los ejecuta con kernels nativos, algo poco habitual en el ecosistema GGUF/llama.cpp.

El modelo base, Inkling-2-Mini, lo desarrolla Thinking Machines Lab y se distribuye con licencia Apache-2.0; la tarjeta asume esa licencia para sus propios ficheros (programas Loom, glue y documentacion), sin alterar los terminos del modelo. La tarjeta esta pensada para el ecosistema 1bit OS y para el hardware Strix Halo (Radeon 8060S, gfx1151), con un preset `chat` de 4 filas x 256k de contexto y profundidad de borrador 3 que requiere unos 58 GB.

La relevancia actual es doble: por un lado, demuestra inferencia cuantizada de precisión mixta (NVFP4/MXFP8) sobre hardware AMD consumer con decodificacion especulativa (drafter DSpark); por otro, ofrece una reproducibilidad verificable mediante `model.json.lock` con revisiones y sha256 de cada peso, y una comparacion de fidelidad (KLD) frente a la referencia de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Inkling-2-Mini; la tarjeta describe expertos enrutados MoE y kernels NVFP4/MXFP8 para gate/up/down) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 256k (preset `chat`: 4 filas x 256k) |
| Tipos de cuantizacion | NVFP4 (capas 0-19), MXFP8 (capas 20-23), GGUF UD-Q4_K_XL para el cuerpo principal, Q8_0 para el drafter DSpark |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (ficheros de la tarjeta); uso del modelo sujeto a la Model Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF (Inkling-2-Mini-UD-Q4_K_XL.gguf, 17.6 GB), MXFP8 safetensors (4.2 GB), Q8_0 para el drafter; los pesos no estan en el repositorio |

## Arquitectura y entrenamiento

La tarjeta no documenta la arquitectura del modelo base ni sus datos de entrenamiento. Lo que describe es la capa de ejecucion: los expertos enrutados se leen en los formatos publicados por Thinking Machines, sin conversion a un cuant ggml ni copia dequantizada. Las capas 0-19 se sirven como NVFP4 (coincidentes byte a byte con unsloth/Inkling-2-Mini-GGUF) y las capas 20-23 como MXFP8 (16 tensores procedentes de 1bit-MONSTER/Inkling-2-Mini-MXFP8-experts, identicos byte a byte al modelo original, no la recuantizacion Q8_0 de unsloth). La decodificacion, el prefill y el gate/up/down del MoE corren sobre kernels nativos NVFP4/MXFP8 de Loom.

El resto de la tarjeta son los programas de release r8 de loom-fun, reempaquetados por 1bit-MONSTER para el layout GGUF mainline de unsloth. La inferencia incorpora decodificacion especulativa mediante el drafter DSpark (profundidad 3). El repositorio incluye `PROVENANCE.json` con el sha256 de cada fichero y los cambios introducidos, y `model.json.lock` fija revision, tamano y sha256 de los pesos descargados.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable (el preset medido usa thinking on).
- Razonamiento multi-paso y uso como agente, con advertencias explicitas del autor sobre bucles de razonamiento largos.
- Decodificacion especulativa integrada (drafter DSpark, profundidad 3) para acelerar la generacion.
- Contexto largo: preset de 256k tokens por fila, con 4 filas concurrentes.
- Recuperacion en contexto largo (needle recall verificado a 16K tokens, 3/3).
- Aritmetica basica verificada (17*23, 3/3).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de Inkling-2-Mini en estaciones AMD Strix Halo: la tarjeta esta medida sobre Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y permite servir el modelo en un equipo integrado con unos 58 GB de presupuesto para el preset `chat`, sin GPU dedicada.
- Evaluacion de fidelidad de cuantizaciones: investigadores pueden comparar la salida de esta tarjeta (KLD 0.004583 frente a la referencia HF) con la de la variante que lee la recuantizacion Q8_0 (KLD 0.004571) para estudiar el impacto de preservar los formatos publicados.
- Servicio de chat multi-turno con contexto muy largo: el preset de 4 filas x 256k permite mantener conversaciones o documentos extensos en memoria, util para analisis de contratos, informes o bases de codigo.
- Procesamiento por lotes de documentos largos: con prefill medido de ~2.090 tok/s a 16K tokens, es viable ingerir documentos de decenas de miles de tokens y generar resumenes o extracciones.
- Reproducibilidad y auditoria de pipelines: `model.json.lock` y `PROVENANCE.json` permiten fijar revisiones y verificar sha256 de pesos y ficheros, lo que facilita despliegues auditables en entornos regulados.
- Agentes con herramientas en sandbox: el modelo base admite uso agentico, aunque el autor recomienda exigir confirmacion antes de acciones destructivas y limitar turnos y tokens de salida.
- Integracion en 1bit OS: seleccionando `Inkling-2-Mini-1bit` en Lemonade, el sistema empareja el GGUF por sha256 y lo sirve en la GPU a traves de Loom, lo que simplifica el despliegue en ese entorno.

## Benchmarks y rendimiento

Datos medidos por el autor (AMD Ryzen AI Max+ 395, Radeon 8060S, gfx1151, hrx-loom 0.3.0, 27 nov 2026), frente a un arbitro llama.cpp en CPU sobre un GGUF equivalente en pesos (capas 20-23 en BF16):

| Comprobacion | Resultado |
|---|---|
| Regla de casi-empate | 8/8 (4 identicos, 4 divisiones en casi-empates; gap CPU-Loom 0.036 / 0.045 / 0.05 / 0.256 nat, umbral 1.0) |
| Determinismo | CPU bit a bit identico; Loom estable en texto |
| Respuestas conocidas | 17*23: 3/3; needle recall a 16K tokens: 3/3 |
| Decodificacion (prompt corto) | 90.7-91.1 tok/s |
| Prefill / decodificacion a 16K tokens | 2.085-2.094 tok/s / 53.3-54.0 tok/s |
| KLD media frente a referencia HF | 0.004583 (tarjeta con capas Q8_0: 0.004571) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/presupuesto de memoria: el preset `chat` (4 filas x 256k, profundidad de borrador 3) necesita unos 58 GB.
- Pesos descargados: 17.6 GB (GGUF UD-Q4_K_XL) + 4.2 GB (expertos MXFP8) + drafter DSpark Q8_0 (tamano no indicado).
- GPU objetivo medida: AMD Radeon 8060S (gfx1151) en Ryzen AI Max+ 395; el runtime es Loom sobre ROCm (hrx-loom 0.3.0).
- GPU NVIDIA: no disponible; la tarjeta esta orientada a AMD y usa kernels nativos NVFP4/MXFP8 de Loom.
- Cabe en GPU consumer: si, en soluciones AMD integradas tipo Strix Halo con memoria unificada suficiente; no se documenta soporte para GPUs consumer NVIDIA.
- Opciones de despliegue: `1bit serve` (con `--device hrx`), `loom-serve` con el preset `chat`, y 1bit OS via Lemonade. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para esta tarjeta.
- Latencia y throughput: 90.7-91.1 tok/s en decodificacion con prompt corto; 53.3-54.0 tok/s en decodificacion con 16K de contexto; prefill de ~2.090 tok/s a 16K.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| 1bit-MONSTER/Inkling-2-Mini-NVFP4-MXFP8-loom | no disponible | 256k (preset) | NVFP4 + MXFP8 nativos, GGUF Q4_K_XL | Apache-2.0 (tarjeta) | Lee los formatos publicados; KLD 0.004583; 90.7-91.1 tok/s en Strix Halo |
| 1bit-MONSTER/Inkling-2-Mini-loom | no disponible | no disponible | GGUF mainline + Q8_0 en capas 20-23 | Apache-2.0 (tarjeta) | Tarjeta mainline equivalente; KLD 0.004571; misma velocidad y precision |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | GGUF (incluye UD-Q4_K_XL y recuantizacion Q8_0) | no disponible | Fuente de los pesos GGUF usados por ambas tarjetas |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | pesos originales (incluye MXFP8) | Apache-2.0 | Modelo base de referencia |

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descargar 17.6 GB de GGUF, 4.2 GB de expertos MXFP8 y el drafter DSpark por separado.
- Limitacion conocida: con thinking OFF el prompt de la tarjeta es de 27 tokens frente a los 29 que renderiza la plantilla del modelo (no se renderiza la linea de sistema "Thinking effort level: 0"); con thinking ON ambos son 29. Procede sin cambios del programa de chat de r8.
- El modelo base puede quedarse atrapado en bucles de razonamiento largos; el autor recomienda limitar tokens de salida y turnos de agente.
- El nivel minimo de esfuerzo de razonamiento no desactiva por completo el razonamiento.
- Uso agentico en sandbox: exigir confirmacion antes de acciones destructivas o irreversibles.
- Salidas de alto riesgo: requieren revision humana y evaluacion propia del caso de uso.
- El uso del modelo esta sujeto a la Model Acceptable Use Policy de Thinking Machines; la Apache-2.0 de la tarjeta solo cubre sus propios ficheros.
- El hardware medido es exclusivamente AMD Strix Halo (gfx1151); no hay datos de rendimiento en otras GPU.
- Idiomas soportados, sesgos y tasa de alucinacion: no disponible en la informacion proporcionada.
- El modelo es muy reciente (creado el 27 de noviembre de 2026) y sin descargas ni likes, por lo que la validacion externa es practicamente nula.

## Enlaces

- Tarjeta en Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-NVFP4-MXFP8-loom
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pesos GGUF (unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Expertos MXFP8: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-MXFP8-experts
- Tarjeta Loom mainline: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-loom
- Programas r8 de loom-fun: https://huggingface.co/loom-fun/unsloth-Inkling-2-Mini-loom
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Kit loom-skills: https://github.com/loom-fun/loom-skills
- Fila de validacion del motor: https://github.com/1bit-MONSTER/engine/issues/3158#issuecomment-7216723223
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
