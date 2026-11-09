# doth4580/Kwaipilot-KAT-Coder-V2.5-Dev-NVFP4-MIXED

## Resumen

Kwaipilot-KAT-Coder-V2.5-Dev-NVFP4-MIXED es una cuantización NVFP4/FP8 del modelo KAT-Coder-V2.5-Dev, desarrollado por el equipo KwaiKAT y publicado bajo licencia Apache 2.0. El artefacto lo produce y mantiene el usuario doth4580 mediante el cuantizador offline `nvfp4-mixed` del motor de inferencia veloGB10, y está empaquetado específicamente para ejecutarse en sistemas NVIDIA DGX Spark / GB10 (una o dos máquinas en TP=2). No aporta pesos nuevos: modifica los del modelo original para reducir el tamaño en disco a unos 19 GB y habilitar su despliegue en hardware de memoria unificada.

El modelo base es un transformer MoE híbrido de 34.660.610.688 parámetros totales, con 256 expertos enrutados (8 activos por token) más un experto compartido, y una arquitectura de atención que combina capas GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) con capas GQA completas periódicas. Soporta una longitud de contexto de 262.144 tokens y un vocabulario de 248.320 entradas, lo que lo sitúa en la categoría de modelos de código de gran contexto.

Su relevancia actual es doble: por un lado, ofrece una vía práctica de servir un MoE de ~35B parámetros en un único GB10 con cuantización de 4 bits en punto flotante (NVFP4); por otro, demuestra el uso del formato estándar `compressed-tensors` (`nvfp4-pack-quantized`) fuera del ecosistema propietario, de modo que los pesos pueden cargarse con cualquier framework que lea dicho formato, aunque el artefacto está validado y ajustado para los kernels de veloGB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 40 capas GatedDeltaNet (atención lineal) / GQA completo periódico; hidden 2048, 16 cabezas Q / 2 KV |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 8 expertos enrutados de 256 por token, más experto compartido (total de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (262k); en las líneas de ejemplo de veloGB10 se sirve con `--max-seq-len 32768` |
| Tipos de cuantizacion | `nvfp4-mixed`: todas las GEMM en NVFP4, salvo proyecciones de entrada/salida de GDN en FP8; router en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `nvfp4-pack-quantized` (compatible con compressed-tensors), safetensors; ~19 GB en disco |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE híbrido con 40 capas que alternan atención lineal GatedDeltaNet (estado recurrente de tamaño fijo, coste de memoria constante con la longitud de secuencia) y atención GQA completa periódica (16 cabezas Q, 2 KV). El feed-forward es disperso: 256 expertos enrutados con 8 activos por token más un experto compartido, sobre un hidden de 2048. El vocabulario es de 248.320 tokens y el contexto máximo de 262.144. Este checkpoint no incluye cabeza MTP (multi-token prediction); la decodificación especulativa, cuando se usa, recurre a draft por n-gram o a futuras cabezas MTP.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada. La contribución de este artefacto se limita a la cuantización: se aplicó el cuantizador offline `nvfp4-mixed` de veloGB10, manteniendo tokenizer y chat template sin cambios respecto al original. El motor veloGB10 declara decodificación especulativa greedy-lossless (donde aplica), servicio TP=2 entre dos nodos y una suite completa de tests de corrección superada sobre este pack.

## Capacidades

- Generación de código: el modelo base está orientado a tareas de programación (etiqueta `code`), incluyendo generación, completado y explicación de código.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantización.
- Contexto largo: ventana de hasta 262.144 tokens, adecuada para repositorios completos o conversaciones multi-turno extensas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base no declara idiomas en la información disponible.
- Capacidades especiales: no se documenta modo thinking, visión ni audio. El checkpoint no incluye cabeza MTP.

## Casos de uso

- Servicio de asistencia de código en un único DGX Spark: desplegar el pack con veloGB10 en TP=1 y exponer una API compatible con OpenAI en el puerto 9000, de modo que herramientas tipo IDE o CLI apunten a `http://<host>:9000/v1` sin cambios de cliente.
- Autocompletado y generación en repositorios grandes: con 262k tokens de contexto, se puede inyectar un árbol de ficheros y fragmentos relevantes en una sola petición para tareas de refactorización o revisión.
- Escalado a dos nodos GB10 para mayor lote o contexto: usar TP=2 con `--node` en la segunda máquina y `--tp 2 --nodes <ip>:29500` en la cabeza; los nodos no necesitan copia local del modelo, solo reciben su partición de pesos y la cachean.
- Evaluación de cuantización NVFP4 en pipelines de investigación: al usar el layout estándar `compressed-tensors`, se puede cargar el artefacto en frameworks alternativos para comparar calidad frente al modelo original en bf16.
- Prototipado de agentes de código en local: el contexto largo y la naturaleza MoE permiten mantener conversaciones con historial extenso y llamadas a herramientas simuladas en un entorno de desarrollo sin GPU de centro de datos.
- Experimentación con decodificación especulativa: al no incluir cabeza MTP, sirve para probar draft por n-gram en veloGB10 y medir su impacto en latencia en hardware GB10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las cifras de throughput en un nodo y en TP=2 están pendientes de recopilar tras completar la suite de pruebas del motor.

## Requisitos de hardware

- VRAM/memoria: el pack ocupa ~19 GB en disco; en un GB10 (memoria unificada) se sirve con `--max-seq-len 32768` y `--max-batch 1` en la configuración probada. Para el contexto completo de 262k se requiere memoria adicional para KV cache y estado recurrente, no cuantificada en la información disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (una o dos unidades en TP=2). No se documenta soporte en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el artefacto está validado para veloGB10 y no se declara compatibilidad con GPUs consumer.
- Despliegue: veloGB10 (`gb10_inference`), servidor compatible con OpenAI. Al usar formato `compressed-tensors`, en teoría puede cargarse con otros frameworks que lean `nvfp4-pack-quantized`, pero no se ha validado.
- Latencia y throughput: no disponibles; pendientes de publicación por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (original) | 34,66B (MoE) | 262.144 | bf16 (original) | Apache 2.0 | Hugging Face |
| Este pack (NVFP4-MIXED) | 34,66B (MoE) | 262.144 | NVFP4/FP8 mixta | Apache 2.0 | Hugging Face, ~19 GB |
| Alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar la calidad respecto al modelo original en bf16; no se han publicado evaluaciones comparativas de pérdida de precisión.
- El artefacto está producido y validado para veloGB10; su uso con otros motores, aunque el formato sea estándar, no está probado.
- No incluye cabeza MTP, por lo que la decodificación especulativa depende de draft por n-gram o de futuras cabezas MTP.
- El contexto máximo declarado es de 262.144 tokens, pero las configuraciones de ejemplo limitan `--max-seq-len` a 32.768; servir contextos mayores requiere ajustar memoria y no está documentado.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni comportamiento en dominios ajenos al código.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo base pertenecen al equipo KwaiKAT; este repositorio solo añade la cuantización y el empaquetado.
- No se han publicado cifras de rendimiento ni benchmarks en la información disponible; cualquier decisión de producción debería basarse en una evaluación propia.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Kwaipilot-KAT-Coder-V2.5-Dev-NVFP4-MIXED
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Licencia del modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Informe técnico (arXiv): https://huggingface.co/papers/2607.05471
