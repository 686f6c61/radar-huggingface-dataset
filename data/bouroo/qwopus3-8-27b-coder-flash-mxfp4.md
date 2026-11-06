# bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4

## Resumen
Qwopus3.8-27B-Coder-Flash-mxfp4 es una conversión cuantizada a MXFP4 (4 bits, group size 32) del checkpoint Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tune orientado a código del modelo Qwen3.8-27B. El autor de la conversión es bouroo, que mantiene el formato nativo de MLX y conserva en BF16 el torre de visión, las normas y el estado de Gated DeltaNet. El resultado es un modelo multimodal de 27.356.728.560 parámetros que ocupa 14,2 GB en lugar de los 56 GB del original en BF16.

La relevancia de esta ficha está en que permite ejecutar un modelo coder multimodal de casi 27B en Apple Silicon con memoria unificada moderada, manteniendo la torre de visión en BF16 para no degradar la percepción visual. Además, el autor publica un drafter MTP complementario para decodificación especulativa, con el que reporta 2,78 tokens aceptados por ronda (89,5 % de aceptación) sobre un M4 Pro.

Se trata de un artefacto de cuantización, no de un modelo nuevo: hereda la licencia Apache-2.0 y las limitaciones del checkpoint upstream. La model card advierte de que las evaluaciones del modelo original son ejecuciones locales pequeñas y de que el código y las acciones de herramientas generadas pueden ser incorrectas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida Gated DeltaNet (familia Qwen3.5/Qwen3.8), torre de visión y cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (E2M1, group size 32, escala uint8 power-of-two por grupo); visión, RMSNorm, A_log, dt_bias, conv1d y tabla de tokens en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards), configuración MLX con `quantization: {group_size: 32, bits: 4, mode: mxfp4}` |

## Arquitectura y entrenamiento
El modelo base es un transformer multimodal de la familia Qwen3.5/Qwen3.8 con atención híbrida basada en Gated DeltaNet, torre de visión y una cabeza MTP (multi-token prediction) que se usa como drafter en decodificación especulativa. La conversión cuantiza los 498 módulos de pesos 2-D del modelo de lenguaje a MXFP4, mientras que la torre de visión, las RMSNorm, el estado de Gated DeltaNet (`A_log`, `dt_bias`, `conv1d`) y la tabla de tokens permanecen en BF16, siguiendo el layout de mlx-community/Qwen3.8-27B-mxfp4. Las normas se almacenan como `1 + w` para respetar la convención de `Qwen3_5RMSNorm` en transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el fine-tune upstream usó RLHF o DPO. La conversión se realizó shard a shard con las convenciones de cuantización de `mlx_vlm`, de modo que el checkpoint BF16 de 56 GB nunca se materializa completo en memoria, y se verificó generando con los pesos convertidos y cargándolo como target de un drafter MTP.

## Capacidades
- Generación de texto y razonamiento, con modo thinking activable mediante `--enable-thinking`.
- Generación y edición de código, incluyendo tests, según el ejemplo de la model card.
- Comprensión de imágenes al ser un modelo image-text-to-text con torre de visión en BF16.
- Tool calling y function calling, según los tags `tool-use` y `agent`.
- Flujos de agente y razonamiento multi-paso.
- Decodificación especulativa con el drafter MTP complementario (`--draft-model`, `--draft-block-size 3` por defecto).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Asistencia de código en local sobre Apple Silicon: el modelo cabe en 14,2 GB y se ejecuta con `mlx_vlm.generate`, lo que permite autocompletado y generación de funciones sin conexión a la nube.
- Generación de tests unitarios: el propio ejemplo de la model card pide una función Python que fusione intervalos solapados junto con sus tests, un escenario típico de este fine-tune coder.
- Revisión de capturas de pantalla o diagramas: al conservar la torre de visión en BF16, puede describir interfaces o extraer información de imágenes en flujos de documentación técnica.
- Agentes de refactorización multi-paso: los tags `agent` y `tool-use` permiten encadenar llamadas a herramientas (linters, compiladores, gestores de ficheros) dentro de un pipeline local.
- Prototipado rápido en portátiles con memoria unificada: con 14,2 GB de pesos, un Mac con 24-32 GB puede mantener el modelo y el drafter MTP cargados simultáneamente.
- Generación de código con latencia reducida: el drafter MTP reporta 2,78 tokens aceptados por ronda y 89,5 % de aceptación en M4 Pro, lo que acelera la salida en tareas de completado.
- Despliegue en servidores con vLLM: existe una conversión hermana en formato compressed-tensors (bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT) orientada a vLLM y ROCm gfx1201, útil si el destino no es Apple Silicon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card upstream solo indica que las evaluaciones reportadas son ejecuciones locales pequeñas. El único dato medido es de decodificación especulativa en un M4 Pro: 2,78 tokens aceptados por ronda, con un 89,5 % de los tokens redactados aceptados y `--draft-block-size 3` por defecto.

## Requisitos de hardware
- VRAM/memoria estimada: 14,2 GB para los pesos MXFP4; con el drafter MTP adicional y el contexto hay que prever margen por encima de esa cifra.
- GPU recomendadas: Apple Silicon con memoria unificada (la model card cita un M4 Pro como referencia de medida); no está pensado para CUDA.
- ¿Cabe en consumer GPU? No en el sentido habitual: el formato es MLX y requiere Apple Silicon. Para GPUs NVIDIA o AMD hay que usar la conversión compressed-tensors hermana (MXFP4-CT) con vLLM.
- Opciones de despliegue: `mlx-vlm` (comando `mlx_vlm.generate`); para la variante CT, vLLM con compressed-tensors.
- Latencia y throughput: solo se conoce la métrica de aceptación especulativa (2,78 tokens/ronda, 89,5 % de aceptación en M4 Pro); no hay cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4 | 27,36B | no disponible | safetensors MXFP4 (MLX) | Apache-2.0 | Hugging Face, 51 descargas |
| Jackrong/Qwopus3.8-27B-Coder-Flash (upstream) | 27,36B | no disponible | safetensors BF16 (56 GB) | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-mxfp4 | no disponible | no disponible | safetensors MXFP4 (MLX) | no disponible | Hugging Face |
| bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT | 27,36B | no disponible | compressed-tensors, vLLM | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias
- Es una cuantización a 4 bits: puede haber pérdida de calidad frente al BF16 upstream, especialmente en tareas de código de precisión alta; no se han publicado comparativas de calidad entre ambos.
- La model card upstream advierte de que las evaluaciones reportadas son ejecuciones locales pequeñas y de que el código y las acciones de herramientas generadas pueden ser incorrectas.
- Riesgo de alucinación en generación de código y en llamadas a herramientas no verificado con benchmarks públicos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con garantías.
- Dependencia de plataforma: el formato MXFP4 de MLX está atado a Apple Silicon; para otros entornos hay que recurrir a la conversión CT o al checkpoint BF16.
- La licencia Apache-2.0 se hereda del upstream y permite uso comercial, pero conviene revisar la model card del modelo base por si añade condiciones adicionales.
- El repositorio tiene 51 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4
- Modelo base upstream: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Drafter MTP para decodificación especulativa: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-MTP-mxfp4
- Conversión hermana para vLLM/compressed-tensors: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT
- Referencia de layout MXFP4 de Qwen3.8-27B: https://huggingface.co/mlx-community/Qwen3.8-27B-mxfp4
