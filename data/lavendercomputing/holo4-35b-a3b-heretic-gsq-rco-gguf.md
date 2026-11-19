# lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF

## Resumen

Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF es una compilación de cuantizaciones GGUF en precisión mixta por tensor del modelo Hcompany/Holo4-35B-A3B, un modelo de lenguaje y visión de tipo mezcla de expertos (MoE) orientado a Computer Use. Lo publica el usuario lavendercomputing y deriva de una versión "abliterated" (sin censura) generada con la herramienta Heretic sobre el checkpoint original de Hcompany, que a su vez se apoya en la arquitectura Qwen3.6 MoE. El modelo está pensado para ejecutarse en llama.cpp y consumir capturas de pantalla como entrada para producir clics, texto y llamadas a herramientas como salida.

El modelo base cuenta con aproximadamente 34.660 millones de parámetros totales, 40 bloques con 256 expertos enrutados por bloque y 8 activos por token, una ventana de contexto de 262.144 tokens y un vocabulario de 248.320 tokens. La familia Holo4 lo posiciona como el miembro de tamaño medio, más barato y rápido, destinado a funcionar detrás de un arnés de agente. El autor reporta un resultado de proveedor de 30,9% en OSWorld 2.0 con un coste de 0,61 dólares por tarea.

La relevancia de esta ficha radica en que ofrece variantes cuantizadas de 2,3 a 4,0 bits por peso (bpw) con una escalera de precisión ponderada por bloques de expertos, además de una cabeza MTP para decodificación especulativa. La licencia es Apache-2.0 tanto para esta compilación como para el modelo base Qwen, lo que facilita su uso comercial. No obstante, la procedencia pasa por una única generación intermedia de cuantización (Q6_K) y no existe un maestro BF16 público de la versión abliterated, lo que conviene tener en cuenta al evaluar la fidelidad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6 MoE): 40 bloques, 256 expertos enrutados por bloque, 8 activos por token |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 8 expertos de 256 por token (no se especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_XXS (2,34 bpw), IQ2_S (2,50 bpw), IQ3_XXS (3,01 bpw), IQ3_S (3,51 bpw), IQ4_XS (4,00 bpw); MTP draft head en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión mmproj en BF16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.6 MoE: 40 bloques transformer con 256 expertos enrutados por bloque y 8 activos por token, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Aproximadamente el 92% de los parámetros se concentra en las matrices `ffn_(gate|up|down)_exps`, lo que explica que la estrategia de cuantización se centre en los bloques de expertos. El enrutador (`ffn_gate_inp`) se mantiene en f32 porque llama.cpp no lo cuantiza, y las normas y sesgos unidimensionales quedan en fp32.

Sobre el entrenamiento original no se aportan datos en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO). La modificación "Heretic" es un pase de abliteración sin entrenamiento: estima la dirección de rechazo del modelo y la proyecta fuera de determinadas matrices de pesos, buscando bajo una cota de divergencia KL y conservando la prueba que supera la batería de tests de comportamiento. Al no implicar ajuste fino, el autor afirma que se preservan las capacidades generales, los trazos de razonamiento (`[Start thinking]`) y el tool calling. La procedencia de las cuantizaciones es: BF16 de Hcompany (70 GB) → abliteración Heretic + cuantización inmediata a Q6_K (6,58 bpw, por jduraes) → estas compilaciones de 2,3 a 4,0 bpw con la imatrix de mradermacher. Las variantes de 2 bits y la de 4,0 se recuantizaron desde el mismo Q6_K con `--allow-requantize`, sin rehacer la abliteración.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`[Start thinking]`).
- Comprensión de imágenes: entrada de capturas de pantalla mediante el proyector de visión BF16 (`mmproj.f16.gguf`).
- Computer Use: producción de clics, escritura de texto y llamadas a herramientas a partir de la pantalla.
- Tool calling / function calling, integrable en arneses de agente.
- Razonamiento multi-paso orientado a tareas de agente.
- Decodificación especulativa mediante cabeza MTP en Q8_0 (sujeta a la limitación descrita más abajo).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de escritorio y navegador: el modelo recibe capturas de pantalla y emite clics, texto y llamadas a herramientas, adecuado para arneses de agente que operan interfaces gráficas con contexto de 262.144 tokens.
- Agentes de Computer Use en producción: su posicionamiento como miembro "barato y rápido" de la familia Holo4 lo hace apto para tareas repetitivas donde el coste por tarea importa, con la referencia de 0,61 dólares por tarea reportada por el proveedor.
- Despliegue en hardware limitado: las variantes IQ2 e IQ3 permiten ejecutar un MoE de ~35B en equipos con VRAM moderada usando llama.cpp, algo inviable con el BF16 de 70 GB.
- Evaluación de modelos sin censura: útil para investigadores que estudian el efecto de la abliteración sobre el comportamiento de rechazo manteniendo razonamiento y tool calling.
- Pruebas de pipelines de agente con decodificación especulativa: la cabeza MTP Q8_0 permite experimentar con aceleración de generación en llama.cpp.
- Prototipado de asistentes visuales: combinación de entrada de imagen y salida estructurada para tareas de extracción o interacción sobre capturas.
- Investigación sobre cuantización extrema: la escalera de precisión por bloques de expertos sirve para medir el impacto de 2,3 frente a 4,0 bpw en un MoE grande.

## Benchmarks y rendimiento

El único dato de rendimiento reportado en la información disponible es el resultado de proveedor del modelo base: OSWorld 2.0 al 30,9% con un coste de 0,61 dólares por tarea. No se han publicado resultados de benchmarks propios de esta compilación cuantizada (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor menciona pruebas de humo de carga y salida de razonamiento coherente con llama.cpp en CPU a ~5–7 t/s, valor que él mismo califica de señal de humo y no de cifra de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia según el archivo: IQ2_XXS 9,43 GiB, IQ2_S 10,09 GiB, IQ3_XXS 12,16 GiB, IQ3_S 14,18 GiB, IQ4_XS 16,14 GiB; añadir el proyector de visión BF16 para entrada de imagen.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, las variantes IQ3 e IQ4 caben en GPUs de consumo de 16–24 GB de VRAM.
- Cabe en GPU de consumo: sí, las variantes de 2 a 4 bpw son compatibles con tarjetas de 12–24 GB, aunque el dato no lo confirma el autor explícitamente.
- Opciones de despliegue: llama.cpp (llama-cli y tooling asociado); el repositorio está marcado como compatible con endpoints.
- Latencia y throughput: solo se reporta ~5–7 t/s en CPU como prueba de humo; no hay cifras de servicio en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF (esta ficha) | 34,66B totales, MoE 8/256 activos | 262.144 | Apache-2.0 | GGUF en HF |
| Hcompany/Holo4-35B-A3B (base) | 34,66B totales, MoE 8/256 activos | 262.144 | Apache-2.0 | BF16, FP8, NVFP4 y q4_k_m GGUF |
| jduraes/Holo4-35B-A3B-heretic-Q6_K | 34,66B totales, MoE 8/256 activos | 262.144 | Apache-2.0 (según base) | GGUF Q6_K |
| Qwen/Qwen3.6-35B-A3B | no disponible en detalle | no disponible | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo sin entrenamiento; puede aumentar la probabilidad de contenido no deseado y reducir salvaguardas, algo crítico en producción.
- Riesgo de alucinación inherente al modelo base; no se aportan evaluaciones específicas de fidelidad tras la cuantización.
- Las variantes de 2 bits son "agresivas por diseño"; el propio autor recomienda IQ3 o IQ4 para trabajos sensibles a la calidad.
- La procedencia pasa por una única generación intermedia (Q6_K) y no existe maestro BF16 público de la versión abliterated; la fidelidad respecto al BF16 original no está garantizada.
- La cabeza MTP incluida no proporciona una capa MTP integrada utilizable: el checkpoint del proveedor declara la cabeza pero no incluye pesos `mtp.*`, por lo que la decodificación especulativa queda limitada.
- La imatrix se construyó contra el modelo base no abliterated; los nombres y dimensiones de tensor coinciden, pero no se validó específicamente sobre la versión modificada.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las implicaciones del contenido generado sin censura.

## Enlaces

- Hugging Face (esta compilación): https://huggingface.co/lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF
- Modelo base Hcompany: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Tarjeta de referencia del proveedor (GGUF): https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Fuente Heretic Q6_K: https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q6_K
- Matriz de importancia: https://huggingface.co/mradermacher/Holo4-35B-A3B-i1-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
