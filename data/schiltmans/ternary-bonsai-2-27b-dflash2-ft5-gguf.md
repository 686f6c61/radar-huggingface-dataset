# Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF

## Resumen

Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF es un conjunto de pesos cuantizados en formato GGUF de un *drafter* (modelo borrador) para decodificacion especulativa DFlash 2 en llama.cpp. Lo publica el usuario Schiltmans y deriva del modelo base Ternary-Bonsai-2-27B-DFlash2-ft5, un ajuste fino de un drafter DFlash 2 entrenado contra el modelo objetivo Ternary-Bonsai-2-27B de PrismML. No es un modelo conversacional autonomo: su unica funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la generacion sin alterar el texto final.

El repositorio contiene tres cuantizaciones (Q8_0, Q4_K_M y Q2_K) generadas con el fork de llama.cpp de PrismML en la revision `prism-b10754-2459f68`. Segun la model card, los pesos son los mismos que los del modelo base en bf16, sin un nuevo entrenamiento: se trata de una conversion y cuantizacion. El interes practico esta en la relacion entre tamano y tasa de aceptacion: Q4_K_M conserva casi toda la aceptacion de Q8_0 con el 56 % del tamano, y Q2_K iguala al drafter original de z-lab (Q8_0) con un tercio del tamano.

El modelo declarado tiene 1.924.404.480 parametros (aproximadamente 1,9 mil millones) y el repositorio ocupa 3,9 GB. La licencia es Apache-2.0 con la atribucion solicitada por Prism ML. Es relevante para quienes despliegan Ternary-Bonsai-2-27B en CUDA con llama.cpp y buscan reducir la latencia de decodificacion mediante especulacion, aunque las mediciones publicadas por el autor corresponden a Metal y muestran una regresion de rendimiento en esa plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo drafter DFlash 2 para decodificacion especulativa (no disponible el detalle de capas y dimensiones) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como propiedad del drafter; en la validacion se uso una ventana de 32.768 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible (hereda el tokenizer de Qwen/Qwen3.8-27B) |
| Licencia | Apache-2.0 (con LICENSE y NOTICE del release bf16, que incluyen el aviso de Prism ML) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa DFlash 2, disenado para ejecutarse junto a un modelo objetivo y proponer secuencias de tokens que el objetivo valida en paralelo. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion), pero si confirma que el layout de tensores coincide con el del drafter de referencia `z-lab/Qwen3.8-27B-DFlash2-GGUF`: los mismos 81 nombres de tensor y los mismos metadatos no descriptivos, de modo que los ficheros deberian cargarse donde lo haga el drafter original.

No hay un entrenamiento nuevo en este repositorio. Los pesos provienen del drafter bf16 en la revision `2a2c2c1e` (sha256 de pesos `63399215…55b3`), que fue ajustado contra el modelo objetivo Ternary-Bonsai-2-27B de PrismML. La conversion se hizo con `convert_hf_to_gguf.py --outtype q8_0` para Q8_0 (identico byte a byte al Q8_0 original del repositorio); Q4_K_M y Q2_K se convirtieron primero a BF16 y luego se cuantizaron con `llama-quantize` del mismo build, sin importance matrix, porque un drafter DFlash no puede ejecutarse por si solo sobre texto y `llama-imatrix` no tiene nada que medir. El tokenizer es el de `Qwen/Qwen3.8-27B`, cuyo `tokenizer.json` es identico byte a byte al del paquete Bonsai.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa DFlash 2 en llama.cpp (`--spec-type draft-dflash`).
- Aceleracion de la decodificacion del modelo objetivo Ternary-Bonsai-2-27B sin modificar la salida: la decodificacion especulativa greedy devuelve la salida del objetivo, por lo que el drafter cambia la velocidad, no el texto.
- Tres niveles de compromiso tamano/aceptacion: Q8_0 (aceptacion 0.432), Q4_K_M (0.427) y Q2_K (0.398) en las condiciones de validacion del autor.
- Compatibilidad de carga con el drafter de referencia `z-lab/Qwen3.8-27B-DFlash2-GGUF` por layout de tensores y metadatos.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: no es un modelo de proposito general.
- Capacidades multilingues: no disponibles de forma explicita; dependen del tokenizer Qwen subyacente.

## Casos de uso

- Aceleracion de inferencia en produccion con llama.cpp en CUDA: cargar el drafter Q4_K_M junto al objetivo Ternary-Bonsai-2-27B-PQ2_0 con `--spec-type draft-dflash --spec-draft-n-max 7` para reducir la latencia de decodificacion en servicios de generacion de texto. Es el escenario principal y el unico documentado por el autor.
- Despliegue con restricciones de memoria: usar Q2_K (705 MB) cuando el presupuesto de VRAM es ajustado y se acepta una tasa de aceptacion ligeramente menor (0.398) a cambio de un tercio del tamano de Q8_0.
- Servicios de chat multi-turno con contexto largo: la validacion se hizo con una ventana de 32.768 tokens, adecuada para conversaciones extensas donde la latencia por token es critica.
- Evaluacion comparativa de drafters: servir como referencia para medir la tasa de aceptacion frente al drafter original de z-lab en un mismo build de llama.cpp.
- Investigacion sobre cuantizacion de drafters: estudiar como afecta la cuantizacion (Q8_0, Q4_K_M, Q2_K) a la tasa de aceptacion en decodificacion especulativa, con datos publicados de aceptacion por fichero.
- Pipelines de generacion por lotes en GPU: integrar el drafter en un servidor llama.cpp con `-ngld 99 -ngl 99 -fa on --jinja` para tareas de resumen o generacion larga donde el throughput agregado importa mas que la latencia individual.
- Entornos Apple Silicon solo con precaucion: el autor advierte que en Metal el camino DFlash 2 del fork es mas lento que sin drafter (7,1-8,0 tok/s frente a 20,7 tok/s), por lo que en Mac conviene usar el drafter bf16 o de 4 bits con mlx-dspark, o MTPLX sin drafter.

## Benchmarks y rendimiento

Los datos publicados corresponden a una validacion en un Apple M4 Pro con el fork de PrismML en `prism-b10754-2459f68` (Metal), objetivo `Ternary-Bonsai-2-27B-PQ2_0.gguf`, ventana de 32.768 tokens y el script `bench5.py` del repositorio (cinco prompts, tres repeticiones, greedy). Cada brazo es un servidor nuevo y la aceptacion se toma del log del servidor.

| Drafter | Aceptacion de borrador | Decodificacion (tok/s) | Tokens generados |
|---|---|---|---|
| ninguno | — | 20,70 | 5.706 |
| ft5 Q8_0 | 0,432 | 7,92 | 5.706 |
| ft5 Q4_K_M | 0,427 | 7,88 | 5.706 |
| ft5 Q2_K | 0,398 | 7,36 | 5.706 |
| stock Q8_0 | 0,395 | 7,10 | 5.706 |
| ft5 Q8_0, repetido al final | 0,432 | 7,96 | 5.706 |

Los seis brazos generan los mismos 5.706 tokens, lo que confirma que la decodificacion especulativa greedy devuelve la salida del objetivo. El autor no ha medido estos GGUF en CUDA. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendrian sentido para un drafter.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 2,06 GB para Q8_0, 1,14 GB para Q4_K_M y 0,71 GB para Q2_K, segun los tamanos de fichero publicados. Hay que sumar la memoria del modelo objetivo Ternary-Bonsai-2-27B-PQ2_0.
- GPU recomendadas: el autor indica usar CUDA, pero no especifica modelos concretos. No hay datos de rendimiento en A100, H100 ni RTX 4090.
- GPU de consumo: por tamano, Q2_K (705 MB) y Q4_K_M (1,14 GB) caben en GPU de consumo, pero no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: llama.cpp con soporte de DFlash 2 y del paquete ternario con rotacion de Hadamard del objetivo. Se requiere el fork de PrismML (`PrismML-Eng/llama.cpp`) desde la release `prism-b10743`, que fusiono el PR #261. El llama.cpp upstream tenia DFlash 2 pero no podia cargar el objetivo cuando se escribio la model card (2026-09-24), sin retestar despues.
- Comando de referencia: `llama-server -m Ternary-Bonsai-2-27B-PQ2_0.gguf -md Ternary-Bonsai-2-27B-DFlash2-ft5-Q4_K_M.gguf --spec-type draft-dflash --spec-draft-n-max 7 -ngld 99 -ngl 99 -fa on --jinja`.
- Latencia y throughput: en Metal, la decodificacion con drafter cae a 7,10-7,96 tok/s frente a 20,70 tok/s sin drafter. No hay datos de latencia ni throughput en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Aceptacion de borrador | Tamano | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF Q8_0 | 1,92 mil millones | GGUF | 0,432 | 2,06 GB | Apache-2.0 |
| Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF Q4_K_M | 1,92 mil millones | GGUF | 0,427 | 1,14 GB | Apache-2.0 |
| Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF Q2_K | 1,92 mil millones | GGUF | 0,398 | 0,71 GB | Apache-2.0 |
| z-lab/Qwen3.8-27B-DFlash2-GGUF (stock) Q8_0 | no disponible | GGUF | 0,395 | no disponible | no disponible |

La comparacion se limita al drafter de referencia de z-lab, medido en las mismas condiciones. No se dispone de datos de otros drafters DFlash 2 ni de alternativas de decodificacion especulativa como EAGLE o Medusa en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto por si solo ni ejecutarse sobre texto sin un modelo objetivo DFlash 2 compatible.
- En Metal (Apple Silicon) el camino DFlash 2 del fork es mas lento que no usar drafter: 7,1-8,0 tok/s frente a 20,7 tok/s. El autor recomienda CUDA y no ha medido los GGUF en esa plataforma.
- Requiere un build especifico de llama.cpp (fork de PrismML desde `prism-b10743`); el upstream podia no cargar el objetivo en la fecha de publicacion de la model card.
- Q4_K_M y Q2_K se cuantizaron sin importance matrix, lo que puede afectar a la aceptacion en comparacion con una cuantizacion optimizada.
- Riesgo de alucinacion: no aplica directamente al drafter, ya que la salida final la determina el modelo objetivo; el drafter solo afecta a la velocidad.
- Sesgos conocidos: no disponibles; dependen del modelo objetivo y del corpus de ajuste del drafter, no documentado en la model card.
- Limitaciones de contexto e idioma: no documentadas para el drafter; la validacion uso 32.768 tokens y el tokenizer de Qwen/Qwen3.8-27B.
- Licencia Apache-2.0 con aviso y atribucion de Prism ML: "Created using Bonsai by Prism ML". Es un release independiente, no oficial de Prism ML, Qwen, Inco AI ni z-lab.
- Los datos de rendimiento publicados son de una unica maquina (M4 Pro) y un unico build; no hay garantia de que se trasladen a otros entornos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF
- Modelo base (bf16): https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5
- Drafter de referencia de z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- PR #261 del fork: https://github.com/PrismML-Eng/llama.cpp/pull/261
- Repositorio de evidencias y script de benchmark: https://github.com/alexschiltmans/bonsai2-drafter/tree/main/evidence/gguf-fork
- Tokenizer de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
