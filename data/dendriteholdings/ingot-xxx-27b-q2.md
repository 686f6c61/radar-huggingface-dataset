# dendriteholdings/Ingot-XXX-27B-Q2

## Resumen

Ingot-XXX-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de Prism ML Ternary Bonsai 2 27B y el minero modificó menos del 0,01 % de sus códigos ternarios, reajustando el resto de pesos para acercarse a Qwen3.8-27B.

La relevancia del modelo no está en su rendimiento absoluto, sino en su naturaleza: es un ejercicio de destilación por cuantización extrema. Los pesos se distribuyen en formato ternario (1,75 bits por peso en el repack PTQ1_0 y 2,125 bpw en el contenedor PQ2_0), lo que permite ejecutar un modelo de 27B en aproximadamente 6-7 GB de VRAM con una fidelidad medible frente al profesor BF16 (KL de 0,08966 frente a 0,09160 del rey anterior en la misma evaluación).

El modelo se distribuye exclusivamente en formato GGUF para llama.cpp y requiere un fork específico (DendriteLabs/llama.cpp) porque el llama.cpp estándar no interpreta su layout, tokenizador ni la rotación de Hadamard asociada a esta familia. Es, por tanto, una pieza de interés para quienes investigan cuantización ternaria, decodificación especulativa y despliegue de bajo coste, más que un modelo de propósito general listo para producción sin matices.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw, 5,95 GB) y PQ2_0 (2,125 bpw, 7,21 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); también existe un pack MLX para Apple Silicon, aunque el enlace no está incluido en la información disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Ternary Bonsai 2 27B de Prism ML, un transformer que incorpora atención lineal y una rotación de Hadamard aplicada a los pesos, lo que explica que el fork de llama.cpp de Dendrite fusione esa rotación con la actualización de estado de la atención lineal en su parche Metal. Los pesos son ternarios: cada bloque de 128 pesos conserva sus códigos y una escala fp16, de modo que cada peso decodifica a un valor ternario escalado. El repack PTQ1_0 es sin pérdida respecto al PQ2_0 del minero: el mismo repack aplicado al fichero PQ2_0 original de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

El entrenamiento del modelo consiste en un ajuste fino sobre el profesor: el minero cambió menos del 0,01 % de los códigos ternarios y reajustó el resto de pesos para acercarse a Qwen3.8-27B, que actúa como referencia de destino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es doble: por un lado, la cuantización ternaria con repack sin pérdida entre formatos; por otro, la existencia de un drafter de decodificación especulativa específico para esta familia (DFlash 2), que propone varios tokens por paso y el modelo los verifica, acelerando la decodificación aproximadamente 1,8x en chat greedy mono-stream y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y los tags incluyen `conversational`.
- Razonamiento y matemáticas: no hay evaluación publicada específica en la información disponible; el modelo hereda las capacidades del profesor Bonsai 2 y del ajuste hacia Qwen3.8-27B, pero no se cuantifican.
- Generación de código: no se documenta explícitamente en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el campo de idiomas no está relleno.
- Visión: el fichero principal es solo texto. Es posible añadir la torre de visión de Ternary Bonsai 2 como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `mmproj-BF16.gguf`), pero fue creada para genesis, no para estos pesos, y la calidad de imagen no está probada; Ingot solo evalúa el modelo de texto.
- Decodificación especulativa: soportada mediante el drafter `dendriteholdings/Ingot-27B-DFlash2` con `--spec-type draft-dflash`.

## Casos de uso

- Investigación en cuantización ternaria: el modelo sirve como caso de estudio reproducible de cuantización extrema con métrica de fidelidad (KL frente al profesor), útil para comparar técnicas de repack y de ajuste fino sobre pesos ternarios.
- Despliegue de bajo coste en GPU de consumo: con 5,95-7,21 GB de pesos, cabe en GPUs de 8-12 GB y permite servir un modelo de 27B en hardware modesto, a costa de requerir el fork de llama.cpp.
- Inferencia en Apple Silicon: el pack MLX y el parche Metal del fork de Dendrite permiten ejecutarlo en Mac Studio M3 Ultra con 56,4 tok/s de decodificación (frente a 44,5 tok/s del fork stock), lo que lo hace viable para prototipado local en Mac.
- Chat conversacional de un solo flujo con baja latencia: combinado con el drafter DFlash 2, alcanza aproximadamente 1,8x de velocidad en greedy, adecuado para asistentes interactivos donde el throughput no es crítico pero la latencia sí.
- Evaluación comparativa de subnets de Bittensor: sirve para estudiar cómo se comporta un modelo coronado por un validador que mide KL frente al profesor, y para reproducir la metodología de Ingot.
- Experimentos de decodificación especulativa: el par drafter-modelo permite medir ganancias reales de speculative decoding en un modelo ternario con atención lineal, un escenario poco documentado.
- Base para ajustes finos posteriores: al ser un GGUF ternario, no es un punto de partida habitual para fine-tuning, pero sí un objetivo de destilación o de repack para nuevas submissions en la subnet.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). El único dato de calidad es la divergencia KL frente al profesor BF16 en la evaluación de Ingot:

| Métrica | Valor |
|---|---|
| KL(teacher ‖ model), este modelo en su eval ganadora | 0,08966 |
| KL(teacher ‖ model), el rey anterior en la misma eval | 0,09160 |

Rendimiento de inferencia medido (llama-bench, tg128 y pp512, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, parche Metal Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, parche Metal Dendrite | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 6 GB para el fichero PTQ1_0 (1,75 bpw) y 7,2 GB para el PQ2_0 (2,125 bpw), más overhead de contexto y del runtime.
- Con decodificación especulativa: añadir unos 6 GB adicionales de VRAM para el drafter DFlash 2 en Q8_0.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida oficialmente), RTX 5090 (dato de PrismML para Bonsai 2), y en general cualquier GPU con 8-12 GB o más que soporte el fork de llama.cpp con CUDA.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más, siempre que se use el fork de Dendrite; el llama.cpp estándar no ejecuta este layout.
- Apple Silicon: viable en Mac Studio M3 Ultra; el parche Metal del fork de Dendrite mejora la decodificación de 44,5 a 56,4 tok/s con PQ2_0.
- Opciones de despliegue: llama.cpp (fork DendriteLabs en el commit `62c418c`), `llama-server` con `--jinja`; pack MLX para Apple Silicon; no se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: ver tabla de benchmarks; el PQ2_0 decodifica más rápido en GPU que el PTQ1_0 a pesar de ser más grande, mientras que en Mac el PQ2_0 también supera al PTQ1_0 con el parche Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXX-27B-Q2 | 26,9B | No disponible | Ternaria (1,75-2,125 bpw) | No disponible | GGUF en HF, requiere fork |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (aproximado) | No disponible | Ternaria | No disponible | GGUF en HF, fork de PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B (aproximado) | No disponible | Ternaria Q2 | No disponible | GGUF en HF, mismo layout |
| Qwen3.8-27B (referencia del ajuste) | 27B (aproximado) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación con Qwen3.8-27B es relevante porque es el destino del ajuste fino, pero no se dispone de sus especificaciones ni de resultados comparativos en la información proporcionada. Frente a Bonsai 2, la diferencia medible es la KL en la evaluación de Ingot (0,08966 frente a 0,09160 del rey anterior, no necesariamente del Bonsai 2 original).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Idioma no declarado: no hay garantía de cobertura multilingüe; el modelo está pensado para inglés conversacional presumiblemente, pero no se documenta.
- No ejecuta en llama.cpp estándar: requiere el fork de DendriteLabs en un commit concreto (`62c418c`), lo que complica el mantenimiento y la integración en pipelines existentes.
- Riesgo de alucinación: al ser un modelo ternario de 27B ajustado para acercarse a un profesor, la fidelidad medida es relativa (KL ~0,09); no hay evaluaciones de veracidad ni de sesgos.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Visión no validada: el proyector de Bonsai 2 fue entrenado para genesis, no para estos pesos, y la calidad de imagen no se ha probado.
- Modelo de nicho: orientado a la subnet Ingot y a investigación en cuantización; no es un modelo de propósito general con soporte de tool calling ni de agentes documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.
- El tag `not-for-all-audiences` sugiere que el modelo puede generar contenido no apto para todo público; conviene aplicar filtros en despliegues abiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXX-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit del fork usado en la evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis con el mismo layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
