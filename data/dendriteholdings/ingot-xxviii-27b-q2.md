# dendriteholdings/Ingot-XXVIII-27B-Q2

## Resumen

Ingot-XXVIII-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de Prism ML Ternary Bonsai 2 27B, conserva sus códigos ternarios y reajusta el resto de pesos para acercarse al profesor Qwen3.8-27B. Se distribuye exclusivamente en formato GGUF para llama.cpp y ocupa entre 5,95 GB y 7,21 GB según el empaquetado.

La propuesta es radical en eficiencia de almacenamiento: pesos ternarios (valores -1, 0 y 1 con escala fp16 por bloque de 128 pesos) empaquetados a 1,75 bits por peso en el fichero PTQ1_0 y a 2,125 bits por peso en el contenedor PQ2_0. Esto permite ejecutar un modelo de 27B en GPUs de consumo y en Apple Silicon con un consumo de VRAM muy inferior al de una cuantización de 4 bits convencional.

Es relevante ahora porque demuestra que la cuantización extrema por debajo de 2 bits por peso puede mantenerse funcionalmente cerca de un profesor BF16 (KL de 0,07230 por token de respuesta en la evaluación de Ingot) y porque introduce artefactos de ecosistema propios: un fork de llama.cpp, un drafter de decodificación especulativa y un formato de repack sin pérdida. No es un modelo listo para producción con llama.cpp estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 a 1,75 bits por peso y PQ2_0 a 2,125 bits por peso (mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); se menciona una versión MLX sin datos adicionales |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Prism ML Ternary Bonsai 2 27B: un transformer con atención lineal y una rotación de Hadamard aplicada en el pipeline, según se deduce de las notas de despliegue del autor (el fork de Dendrite fusiona la rotación de Hadamard y la actualización de estado de la atención lineal en Metal). Los pesos son ternarios: cada bloque de 128 pesos conserva sus códigos y una escala fp16, de modo que cada peso decodifica a un valor de -1, 0 o 1 multiplicado por la escala del bloque.

El entrenamiento no es from scratch: el minero de Ingot reajustó los pesos no ternarios de Bonsai 2 para acercar las distribuciones de siguiente token a las del profesor Qwen3.8-27B. La métrica de selección es la divergencia KL entre profesor y modelo por token de respuesta, promediada sobre las muestras; el modelo ganador obtuvo 0,07230 frente a 0,07480 del rey anterior en la misma evaluación. No se dispone de datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

La innovación técnica destacable es el repack sin pérdida: el fichero PTQ1_0 conserva códigos y escalas del PQ2_0 del minero y reproduce byte a byte el PTQ1_0 publicado por Prism al aplicarlo al fichero original de Bonsai 2. Además, existe un drafter de decodificación especulativa (DFlash 2) entrenado para esta familia, que acelera la generación aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja (`--jinja`).
- Razonamiento y matemáticas: el modelo base de la familia (Ingot-XVII-27B-Q2, cuantización ternaria de Qwen3.8-27B) reporta 98,0 en MATH-500 y 77,8 en GPQA Diamond frente al profesor BF16.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (mmproj en Q8_0 o BF16); la calidad visual no está validada para estos pesos.
- Decodificación especulativa con el drafter DFlash 2, con verificación de tokens por el modelo principal.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo: con 5,95-7,21 GB de fichero, el modelo cabe en tarjetas de 8-12 GB y permite servir un 27B ternario en hardware donde una cuantización de 4 bits no entraría. Requiere el fork de Dendrite de llama.cpp en el commit `62c418c`.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB, el fork de Dendrite alcanza 56,4 tok/s de decodificación y 432 tok/s de prompt con el fichero PQ2_0, lo que lo hace viable para asistentes locales en estaciones de trabajo Mac.
- Servicio de chat de baja latencia en servidor: con una RTX PRO 6000 Blackwell (96 GB) se miden 137 tok/s de decodificación y 3.865 tok/s de prompt en batch 1, suficiente para atención al cliente interactiva con un solo flujo por GPU.
- Evaluación de técnicas de cuantización extrema: el par de ficheros PTQ1_0 y PQ2_0 con pesos idénticos permite comparar el impacto del contenedor (1,75 frente a 2,125 bits por peso) en velocidad y tamaño sin cambiar la calidad del modelo.
- Investigación sobre destilación y alineamiento a profesor: la métrica KL por token y la comparación con el rey anterior sirven como banco de pruebas reproducible para estudiar cuánto se degrada un modelo ternario respecto a su profesor BF16.
- Aceleración con decodificación especulativa: integrando el drafter DFlash 2 se obtiene aproximadamente 1,8x de velocidad en chat greedy a cambio de unos 6 GB adicionales de VRAM, útil en entornos con margen de memoria.
- Experimentación multimodal: añadiendo el mmproj de Ternary Bonsai 2 se puede probar entrada de imágenes en pipelines de prototipado, asumiendo que la calidad no está validada.

## Benchmarks y rendimiento

| Métrica | Este modelo | Referencia |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta | 0,07230 | 0,07480 (rey anterior, misma evaluación) |
| Decodificación, RTX PRO 6000 Blackwell, PQ2_0 | 137 tok/s | — |
| Decodificación, RTX PRO 6000 Blackwell, PTQ1_0 | 145 tok/s | — |
| Prompt, RTX PRO 6000 Blackwell (ambos ficheros) | 3.865 tok/s | — |
| Decodificación, Mac Studio M3 Ultra, PQ2_0, fork Dendrite | 56,4 tok/s | 44,5 tok/s (fork stock) |
| Decodificación, Mac Studio M3 Ultra, PTQ1_0, fork Dendrite | 52,8 tok/s | 43,1 tok/s (fork stock) |
| Prompt, Mac Studio M3 Ultra, PQ2_0 | 432 tok/s | 432 tok/s (fork stock) |
| Prompt, Mac Studio M3 Ultra, PTQ1_0 | 368 tok/s | 368 tok/s (fork stock) |
| Decodificación, RTX 5090, Bonsai 2 PQ2_0 (reportado por PrismML) | 142 tok/s | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información disponible. Los datos de MATH-500 (98,0) y GPQA Diamond (77,8) corresponden a Ingot-XVII-27B-Q2, otra cuantización de la misma familia, y no deben atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada: 5,95 GB para el fichero PTQ1_0 y 7,21 GB para el PQ2_0, más overhead de contexto y de la caché KV (no cuantificada en los datos disponibles).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) con 137-145 tok/s de decodificación; RTX 5090 reportada por PrismML con 142 tok/s para el fichero PQ2_0 equivalente.
- GPU de consumo: el tamaño de fichero permite ejecución en tarjetas de 8 GB o más, aunque no se han publicado mediciones en esas tarjetas.
- Apple Silicon: Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB) con Metal; el fork de Dendrite mejora la decodificación entre un 22 % y un 27 % sobre el fork stock.
- Despliegue: exclusivamente llama.cpp mediante el fork de DendriteLabs en el commit `62c418ccd7aefee37997e94c2d9fac1eed7fc89b`; llama.cpp estándar no ejecuta este fichero. Se arranca con `llama-server -m <fichero> -ngl 99 -fa on --jinja`.
- Aceleración opcional: drafter DFlash 2 (`Ingot-27B-DFlash2-Q8_0.gguf`) con `--spec-type draft-dflash --spec-draft-n-max 5`, a cambio de unos 6 GB adicionales de VRAM.
- Multimodal opcional: proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `Ternary-Bonsai-2-27B-mmproj-BF16.gguf` de Prism ML.
- Latencia y throughput: los valores medidos corresponden a batch 1; no hay datos de throughput agregado con batching concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXVIII-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF, fork de llama.cpp |
| Prism ML Ternary Bonsai 2 27B | 27B | no disponible | Ternaria (PQ2_0 y PTQ1_0) | no disponible | GGUF, fork de PrismML |
| Ingot-XVII-27B-Q2 | 27B | no disponible | Ternaria, 6-8 GB | no disponible | GGUF |
| Ingot-genesis-27B-Q2 | 27B | no disponible | Ternaria, mismo layout | no disponible | GGUF |

La comparación con modelos de 27B en cuantizaciones convencionales de 4 bits no está disponible en la información proporcionada. La ventaja diferencial de esta familia es el tamaño de fichero (6-7 GB frente a los aproximadamente 14-16 GB de un 4-bit de 27B), a costa de requerir un fork específico de llama.cpp.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución; hay que contactar con el autor antes de cualquier despliegue en producción.
- No funciona con llama.cpp estándar: exige el fork de DendriteLabs en un commit concreto, lo que limita el soporte, la actualización y la integración con herramientas estándar del ecosistema.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada; no se puede planificar ventanas largas sin medir previamente.
- La calidad multimodal no está validada: el proyector procede del modelo genesis y no fue entrenado para estos pesos.
- La evaluación de Ingot mide solo el modelo de texto y se basa en KL frente al profesor, no en benchmarks de tarea; el rendimiento en MMLU, HumanEval o GSM8K no está publicado para este modelo.
- Riesgo de alucinación y sesgos: no hay documentación específica; al ser un refinamiento de un modelo ternario destilado, la fidelidad al profesor no garantiza corrección factual.
- El modelo es una submission de un certamen de cuantización: su procedencia (hotkey del minero, uid 155) y su naturaleza de espejo público implican que no hay garantía de mantenimiento ni de soporte por parte de Prism ML.
- El drafter DFlash 2 añade unos 6 GB de VRAM y solo acelera en configuraciones compatibles con decodificación especulativa; el beneficio cae a 1,3-1,4x con sampling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXVIII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Repack de referencia (genesis): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Noticia sobre Ingot-XVII-27B-Q2: https://alphasignal.ai/news/dendrite-holdings-squeezes-a-27b-model-into-6-gb-with-ingot-xvii
