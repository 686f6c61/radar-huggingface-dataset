# duckpage/qwen38-flash-next-mls4

## Resumen

Qwen3.8-Flash-Next MLS4 es una conversión del modelo de texto Qwen3.8-Flash-Next de Qwen al formato MLS4 propietario del motor de inferencia Malleus, desarrollado por duckpage para APUs AMD RDNA 3.5 (gfx1150/gfx1151). No se trata de un modelo nuevo ni de un fine-tune de capacidades: el autor indica explícitamente que la conversión solo cambia el formato de almacenamiento y la precisión de los pesos, manteniendo intacta la licencia original (Qwen Community License 1.0). El interés del artefacto es de ingeniería de despliegue: permite ejecutar un modelo MoE de 123,3 B de parámetros en expertos sobre hardware de consumo AMD Strix Halo, con una única copia de pesos de 4 bits que sirve tanto para decodificación como para prefill.

La arquitectura subyacente es `qwen4_exp`, un transformer híbrido de 48 capas con patrón `[lin, lin, lin, full] × 12`, donde las capas lineales son DeltaNet y las capas completas usan atención con indexador QSA de presupuesto 2048 tokens. El MoE tiene 512 expertos con top-10 más un experto compartido, y solo unos 6 B de parámetros están activos por token. Según el autor, el modelo alcanza ~36 tok/s en decodificación serial y ~58 tok/s en modo greedy con servicio, gracias a una cabeza MTP de una capa que propone borradores con verificación exacta a temperatura 0.

La relevancia es doble: por un lado, demuestra que un MoE de esta escala puede servirse con ~71 GB de pesos vivos en un APU con memoria unificada; por otro, introduce técnicas de cuantización específicas (rotación Hadamard aleatorizada, calibración GPTQ, hiperconexiones a 4 bits) que mejoran la decodificación un 7,3 % respecto a la variante sin ellas. El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere un artefacto muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`, transformer híbrido con 48 capas `[lin, lin, lin, full] × 12` (DeltaNet + atención completa con indexador QSA) |
| Parametros totales | 123,3 B en expertos + 51,2 B en tabla n-gram + ~5 B resto (≈179,5 B totales) |
| Parametros activos | ~6 B por token |
| Longitud de contexto | 262.144 tokens (configurado vía `--ctx` / `MALLEUS_CTX`; el motor dimensiona KV y estado DeltaNet) |
| Tipos de cuantizacion | MLS4 (4 bits, grupo 128, rotación Hadamard + GPTQ) para expertos; MLS8 para no-expertos, proyecciones PLE y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | other (Qwen Community License 1.0, heredada del modelo base) |
| Formato de pesos | `.malleus` (contenedor GGUF v3) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 48 capas con un patrón de 3 capas DeltaNet por cada capa de atención completa. Las capas DeltaNet usan 16 cabezas QK, 48 cabezas V, dimensión 128, convolución de 4 y puerta de salida sigmoide. Las capas completas emplean 24 cabezas Q, 2 cabezas KV, `head_dim` 256, RoPE parcial de 64 dimensiones y M-RoPE con factores `[11, 11, 10]`. El indexador QSA de las capas completas usa 4 cabezas Q y 1 K de 128 dimensiones, bloques de 4 tokens y un presupuesto de 2048 tokens (512 bloques). El MoE tiene 512 expertos con top-10, intermedio 640, más un experto compartido de 640 con puerta sigmoide. Incluye hiperconexiones de 4 flujos con rango 320 y una capa MTP completa (atención + indexador + MoE + hiperconexiones).

La información disponible no detalla el dataset de entrenamiento del modelo base (número de tokens, composición, etapas de RLHF/DPO), ya que la model card se centra en la conversión de formato. Lo que sí se documenta es el proceso de cuantización: los pesos se convierten a MLS4 con grupo de 128, rotación Hadamard aleatorizada y calibración GPTQ en el espacio rotado. Los expertos enrutados y compartidos se almacenan únicamente en MLS4 (una sola copia que sirve decodificación y prefill, con prefill W4A8 sobre los mismos pesos de 4 bits), mientras que los tensores no-expertos mantienen una copia MLS8 para prefill y las proyecciones PLE y `lm_head` permanecen en MLS8 por calidad. La tabla n-gram de 52,5 GB reside en disco y se lee por page cache (16 filas de 164 bytes por token, dequantizadas en host).

## Capacidades

- Generación de texto autoregresiva con decodificación especulativa mediante la cabeza MTP de una capa (verificación exacta a temperatura 0, según el sello `malleus spec-exact`).
- Razonamiento y generación de código: heredadas del modelo base Qwen3.8-Flash-Next, aunque la model card no detalla evaluaciones específicas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Contexto largo de hasta 262.144 tokens, con estado DeltaNet y KV dimensionados por `MALLEUS_CTX`.
- API compatible con OpenAI en el puerto 8090 (`/v1/chat/completions`, `/v1/models`, `/health`), lo que facilita integración con clientes existentes.
- Modo de pensamiento (thinking), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat sobre hardware de consumo AMD Strix Halo: el modelo cabe en ~71 GB de pesos vivos en un APU gfx1151 con memoria unificada, lo que permite desplegar un MoE de 123 B en expertos sin GPU dedicada. Adecuado para prototipos y entornos de desarrollo con presupuesto de hardware limitado.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, se pueden ingerir contratos, informes o bases de código completas en una sola pasada, aprovechando las capas DeltaNet para reducir el coste de estado frente a atención completa.
- Generación de código en pipelines locales: la API compatible con OpenAI permite integrarlo en asistentes de IDE o scripts de CI/CD que necesiten un endpoint local sin dependencia de la nube, siempre que el hardware sea gfx1151.
- Investigación en cuantización e inferencia: el artefacto sirve como banco de pruebas reproducible para evaluar MLS4 frente a bf16, con blobs de referencia publicados en `duckpage/malleus-golden` y la herramienta `malleus golden` (top-1, argmax por posición, KL).
- Evaluación de decodificación especulativa: la cabeza MTP y la garantía de exactitud a temperatura 0 lo hacen útil para estudiar el equilibrio entre throughput (~58 tok/s greedy en servicio frente a ~36 tok/s serial) y fidelidad de salida.
- Despliegue de agentes conversacionales multi-turno: el contexto largo y la API OpenAI facilitan mantener historiales extensos, aunque la ausencia de datos sobre tool calling en la model card obliga a validar esa capacidad empíricamente antes de producción.
- Benchmarking de motores de inferencia para APUs: permite comparar Malleus con otras soluciones sobre el mismo modelo base y el mismo hardware, usando las métricas de calidad y velocidad publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son de rendimiento de inferencia y calidad relativa frente a bf16:

| Metrica | Valor |
|---|---|
| Peso vivo en dispositivo | ~71 GB (de ellos ~64 GB son expertos en MLS4) |
| Pesos + estado DeltaNet leídos por token en decode | ~4,09 GB |
| Ancho de banda medido | ~231 GB/s |
| Techo teórico de decodificación sin MTP | ~56 tok/s |
| Decodificación serial medida | ~36 tok/s |
| Decodificación greedy en servicio (con MTP) | ~58 tok/s |
| Mejora de hiperconexiones a 4 bits GPTQ | +7,3 % en decode serial (36,15 vs 33,68 tok/s) |
| Tabla n-gram en disco | 52,5 GB (16 filas de 164 bytes por token) |

## Requisitos de hardware

- Dispositivo obligatorio: APU AMD gfx1151 (Strix Halo). El autor indica explícitamente que el archivo no está construido para gfx1150.
- VRAM/memoria: ~71 GB de pesos vivos en el dispositivo, más el estado KV/DeltaNet dimensionado por `MALLEUS_CTX`. El motor realiza una comprobación previa y rechaza la ejecución si modelo y sesión no caben.
- Almacenamiento: la tabla n-gram de 52,5 GB permanece en disco y se lee vía page cache; conviene disponer de almacenamiento rápido para no penalizar la decodificación.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que está atado al motor Malleus y a RDNA 3.5.
- Despliegue: motor Malleus (Apache-2.0), construido vía `podman build` del Containerfile del repositorio o binario extraído de la imagen. Comando de servicio: `malleus serve --model ... --ctx 262144`. API OpenAI en el puerto 8090.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato `.malleus`.
- Latencia y throughput: ~36 tok/s serial y ~58 tok/s greedy en servicio con MTP, según mediciones del autor sobre gfx1151.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next MLS4 (este) | ~179,5 B totales (123,3 B expertos) | ~6 B | 262.144 | Qwen Community License 1.0 | Solo gfx1151, motor Malleus |
| Qwen3.8-Flash-Next (bf16 original) | ~179,5 B totales (123,3 B expertos) | ~6 B | no disponible en la información | Qwen Community License 1.0 | Pesos bf16 de 336 GB; no cabe en el dispositivo |
| Misma familia en otros formatos de cuantización (GGUF, GPTQ, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base en bf16: la conversión MLS4 reduce el peso de 336 GB a ~71 GB vivos, a cambio de cuantizar expertos a 4 bits y mantener no-expertos, PLE y `lm_head` en MLS8. No se dispone de datos de benchmarks de calidad frente a otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Hardware restringido: el artefacto solo funciona en gfx1151 (Strix Halo); no está construido para gfx1150 ni para GPUs dedicadas. Cualquier otro hardware requiere otra conversión.
- Dependencia de un motor propietario de nicho: Malleus es un proyecto de un solo autor (duckpage) con 0 descargas y 0 likes en este repositorio; el soporte, la madurez y la continuidad del proyecto no están garantizados.
- Licencia heredada: Qwen Community License 1.0 impone sus propios términos para uso comercial; es necesario revisarlos antes de producción. El motor es Apache-2.0, pero eso no altera la licencia de los pesos.
- Calidad cuantizada: los expertos están a 4 bits con GPTQ; aunque el autor reporta calidad "ligeramente mejor" en la puerta golden con hiperconexiones a 4 bits, no se publican métricas absolutas de benchmarks estándar.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingüe sin pruebas empíricas.
- Tool calling y capacidades de agente no documentadas: la model card no las menciona; no deben asumirse en producción.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en la información disponible.
- La tabla n-gram en disco introduce dependencia de la caché de página; un almacenamiento lento puede degradar el throughput real respecto a los ~58 tok/s medidos.
- El contexto de 262.144 tokens consume memoria adicional para KV y estado DeltaNet; sesiones largas pueden no caber y el motor las rechazará en la comprobación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckpage/qwen38-flash-next-mls4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor Malleus: https://github.com/duckpage/malleus
- Documentación de modelos y metodología: https://github.com/duckpage/malleus/blob/main/MODELS.md
- Containerfile de despliegue: https://raw.githubusercontent.com/duckpage/malleus/main/deploy/Containerfile
- Blobs de referencia de calidad: https://huggingface.co/datasets/duckpage/malleus-golden
- Script de referencia por capas: `scripts/ref_layerwise.py` en el repositorio del motor
- Documentación del formato MLS4: `src/crates/malleus-gguf` en el repositorio del motor
