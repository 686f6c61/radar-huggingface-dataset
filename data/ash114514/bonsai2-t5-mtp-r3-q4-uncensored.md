# ash114514/Bonsai2-T5-MTP-r3-Q4-Uncensored

## Resumen

Bonsai2-T5-MTP-r3-Q4-Uncensored es un artefacto de pesos para inferencia local empaquetado en formato NInfer, derivado de la familia Bonsai 2 de 27B. El modelo subyacente es una pila de texto de estilo Qwen3.5 con 64 capas, tamano oculto 5120 y un vocabulario de 248.320 tokens, cuyos pesos de lenguaje han sido comprimidos a valores ternarios por Prism ML (empaquetado PTQ1_0, aproximadamente 1,75 bits por peso, con una escala FP16 por grupo de 128 pesos). Sobre esa base, OS-Software aplico una edicion de bajo rango denominada Heretic que reduce sustancialmente la alineacion de seguridad, y el autor ash114514 realizo un reempaquetado a T5 con una cabeza MTP (multi-token prediction) en Q4_0.

El interes tecnico del artefacto reside en la combinacion de compresion ternaria extrema (fichero de 6,18 GB para un modelo de 27B), una ventana de contexto declarada de 262.144 tokens y una arquitectura hibrida en la que aproximadamente tres cuartas partes de las capas usan atencion lineal con compuertas y una cuarta parte atencion completa. Es, por tanto, un caso de estudio de despliegue de modelos grandes en hardware modesto mediante cuantizacion agresiva, no un modelo de proposito general listo para produccion.

Debe subrayarse que se trata de una publicacion con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks propios medidos sobre este fichero concreto. Las cifras de rechazo y perplejidad que se citan provienen del release GGUF de OS-Software y no han sido revalidadas sobre este reempaquetado T5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido estilo Qwen3.5: 64 capas, mezcla de atencion lineal con compuertas (~3/4) y atencion completa (~1/4); pesos ternarios PTQ1_0 con escala FP16 por grupo de 128 |
| Parametros totales | 27B (nominal, segun la familia Bonsai 2 27B); numero exacto de parametros no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (limite de posicion declarado en la configuracion) |
| Tipos de cuantizacion | Pesos ternarios PTQ1_0 (~1,75 bits/peso) con escalas FP16; matrices MTP en Q4_0; tensores auxiliares en BF16 (360) y FP32 (96); reempaquetado T5 con orden de bytes distinto y soporte de activaciones INT8 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato propietario de NInfer); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La pila de texto sigue el diseno de Qwen3.5: 64 capas con tamano oculto 5120, vocabulario de 248.320 tokens y limite de posicion de 262.144. La innovacion arquitectonica principal es la hibrida de atencion: alrededor del 75 % de las capas emplean atencion lineal con compuertas, lo que reduce el coste computacional y de memoria del contexto largo, mientras que el 25 % restante mantiene atencion completa para preservar capacidad de recuperacion exacta. Sobre esta base, Prism ML aplico cuantizacion post-entrenamiento a valores ternarios sin modificar la arquitectura: cada grupo de 128 pesos comparte una escala FP16 y una rotacion Hadamard por bloques queda plegada en los pesos almacenados, lo que da lugar al empaquetado PTQ1_0 de aproximadamente 1,75 bits por peso.

El fichero intermedio PTQ1 contiene 790 objetos: 322 grupos ternarios (`ptq1_g128_fp16`), 5 matrices MTP en Q4_0, 360 tensores BF16 y 96 tensores FP32. El reempaquetado T5 conserva los mismos enteros ternarios y escalas de grupo, pero cambia el orden de bytes y habilita activaciones INT8; como los pesos almacenados no son identicos a nivel de bit, el texto generado puede diferir del pack PTQ1. La cabeza MTP no fue editada junto con los pesos de lenguaje: se lee del fichero `Ternary-Bonsai-2-27B-PTQ1_0-MTP-r3-Q4_0.gguf` existente, y `model_mtp.safetensors` (fechado el 25 de septiembre de 2026) figura tambien entre las fuentes de conversion. El proceso se construyo con la receta `ninfer-v3` (`ptq1_gguf_mtp.py`) el 30 de octubre de 2026.

Respecto al entrenamiento, no se dispone de informacion sobre el numero de tokens, la composicion del dataset ni las etapas de RLHF o DPO del modelo base Qwen3.8-27B en la informacion proporcionada. La edicion Heretic de OS-Software consistio en una modificacion de bajo rango aplicada sobre los codigos ternarios oficiales, manteniendo las escalas originales: afecto a 34 matrices y la fusion es aproximada, no una mezcla LoRA exacta en coma flotante. No se documenta el procedimiento de entrenamiento de esa edicion mas alla de su caracter de bajo rango.

## Capacidades

- Generacion de texto en ingles y chino, los dos unicos idiomas declarados.
- Razonamiento y respuesta conversacional multi-turno, con plantilla de chat heredada de Qwen3.8-27B.
- Prediccion multi-token (MTP) mediante cabeza dedicada, orientada a acelerar la decodificacion especulativa.
- Contexto largo de hasta 262.144 tokens, apoyado en la mezcla de atencion lineal y completa.
- Capacidad de codigo y matematicas: no documentada explicitamente en la informacion disponible para este artefacto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Vision: no incluida. El fichero no contiene torre de vision ni segundo adaptador de borrador; la entrada de imagen requiere un proyector de vision separado.
- Modo de pensamiento explicito (thinking): no documentado en la informacion disponible.
- Generacion sin rechazos: la edicion Heretic reporta 0/100 rechazos frente a 95/100 del modelo original en la evaluacion de OS-Software.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo esta pensado explicitamente para estudios de alineacion y pruebas adversarias. Su tasa de rechazo nula permite explorar respuestas que los modelos alineados bloquean, en entornos controlados y con supervision humana.
- Estudio de cuantizacion ternaria: sirve para medir el impacto real de PTQ1_0 (~1,75 bits/peso) frente a FP16 o Q4 en tareas de generacion, comparando la perplejidad publicada (10,1435 en WikiText-2) con la de otras variantes del mismo modelo base.
- Despliegue en hardware de gama consumer: con 6,18 GB de pesos, el artefacto cabe en GPUs de 8 GB o mas, lo que permite experimentar con un modelo de 27B en equipos de escritorio. Requiere el runtime NInfer, no vLLM ni llama.cpp.
- Evaluacion de decodificacion especulativa: la cabeza MTP en Q4_0 permite probar tecnicas de prediccion multi-token y medir su impacto en latencia y throughput frente a decodificacion autoregresiva clasica.
- Procesamiento de documentos largos en ingles o chino: la ventana de 262.144 tokens admite resumen y extraccion sobre corpus extensos, aunque la calidad en contexto largo no ha sido evaluada por el publicador upstream.
- Analisis de sesgos y contenido danino a escala: al carecer de alineacion, es util como generador de casos adversarios para entrenar o evaluar clasificadores de seguridad y filtros de contenido.
- No se recomienda su uso como servicio publico de atencion al cliente ni en pipelines de produccion orientados a usuarios finales, tal como advierte el publicador de los pesos originales.

## Benchmarks y rendimiento

Las unicas cifras disponibles provienen de la model card de OS-Software para su release GGUF `PTQ1_0`, no de este reempaquetado T5, y no se han remedido sobre este fichero.

| Metrica | Uncensored (PTQ1_0 GGUF) | Original |
|---|---:|---:|
| Rechazos | 0/100 | 95/100 |
| Divergencia KL respecto al original | 0,0135 | 0 |
| Perplejidad WikiText-2 | 10,1435 | no disponible |
| Perplejidad en muestra japonesa harmless | 16,7744 | no disponible |
| Comprobaciones funcionales cortas | 16/16 | no disponible |

Las mediciones se realizaron con contexto de 512. El publicador indica que el contexto largo y la vision no fueron evaluados en ese release. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB solo para pesos; con overhead de runtime, activaciones INT8 y cache KV para contexto largo, el consumo crece de forma considerable y no esta cuantificado en la informacion disponible.
- El contexto de 262.144 tokens exige memoria adicional para la cache KV; con atencion hibrida el coste es menor que en un transformer completamente denso, pero no se publican cifras concretas.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, cualquier GPU con 8 GB o mas deberia poder cargar el fichero; el repositorio de reempaquetado hace referencia a `ninfer-4090-windows`, lo que sugiere validacion en RTX 4090.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que el runtime NInfer soporte la GPU.
- Opciones de despliegue: exclusivamente el runtime NInfer (libreria `ninfer`). No hay pesos en GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente a este fichero.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Bonsai2-T5-MTP-r3-Q4-Uncensored (este) | 27B | 262.144 | Ternaria PTQ1_0 + MTP Q4_0, formato NInfer | Apache-2.0 | Sin alineacion, solo en/zh, runtime NInfer |
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 27B | 262.144 (declarado) | PTQ1_0 en GGUF | Apache-2.0 | Mismo origen sin censura; compatible con llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | 262.144 | PTQ1_0 en GGUF | Apache-2.0 | Version oficial ternaria, con alineacion intacta |
| Qwen/Qwen3.8-27B | 27B | no disponible en la informacion | FP16/BF16 | Apache-2.0 | Modelo base original, pesos completos |

La comparativa se limita a variantes del mismo linaje; no se dispone de datos de benchmarks cruzados con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Alineacion de seguridad sustancialmente reducida: el modelo produce con alta probabilidad contenido danino, inexacto, sesgado u ofensivo. La tasa de rechazo reportada es 0/100.
- El publicador de los pesos originales lo destina exclusivamente a investigacion, estudios de alineacion y red-teaming, y pide explicitamente que no se despliegue como servicio publico de usuario final.
- Riesgo elevado de alucinacion: la cuantizacion ternaria agresiva y la edicion Heretic pueden degradar la fidelidad factual; la divergencia KL de 0,0135 respecto al original indica un cambio medible en la distribucion de salida.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- La edicion Heretic es una fusion aproximada de bajo rango sobre los codigos ternarios, no una mezcla exacta en coma flotante, lo que introduce desviaciones no caracterizadas.
- El artefacto carece de torre de vision; cualquier caso de uso multimodal requiere un proyector separado no incluido.
- El formato `.ninfer` es propietario: no hay interoperabilidad con el ecosistema GGUF, safetensors, vLLM o llama.cpp, lo que limita la portabilidad y el soporte de herramientas.
- El fichero T5 puede generar texto distinto del pack PTQ1 por el cambio de orden de bytes y las activaciones INT8; no se ha validado la equivalencia funcional.
- Sin benchmarks propios, sin descargas y sin likes: no existe evidencia de comunidad ni validacion independiente de este reempaquetado.
- La licencia Apache-2.0 permite uso comercial, pero el autor de los pesos declina responsabilidad por mal uso y el despliegue comercial de un modelo sin alineacion puede contravenir normativa de servicios digitales y proteccion de menores.
- Fechas de creacion y actualizacion del repositorio (noviembre de 2026) posteriores a las de los ficheros fuente; verificar la integridad mediante el SHA-256 publicado (`75125dacee2b6ccca8a2a6f318885ae9deb107e4e9e3dac3cd567e92b467cedb`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ash114514/Bonsai2-T5-MTP-r3-Q4-Uncensored
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Version ternaria oficial de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Documentacion de Prism ML sobre Bonsai 2 27B: https://docs.prismml.com/models/bonsai-2-27b
- Pesos GGUF sin censura de OS-Software: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Artefacto NInfer alternativo (distinto, ~9,52 GB, con vision): https://huggingface.co/emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer
- Arbol de conversion ninfer-all: https://github.com/iamwavecut/ninfer-all/tree/63428ac249da8a6c5d891b508d7e483d8c7def6c
- Empaquetado T5 para NInfer en Windows: https://github.com/JGamboa/ninfer-4090-windows/tree/e905787f067de89ef6ef28c52d65a2ce91d425ca
- Paper de referencia citado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
