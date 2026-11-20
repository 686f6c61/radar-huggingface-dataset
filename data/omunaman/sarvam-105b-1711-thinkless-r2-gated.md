# omunaman/sarvam-105b-1711-thinkless-r2-gated

## Resumen

`sarvam-105b-1711-thinkless-r2-gated` es una edición experimental de pesos del modelo `sarvamai/sarvam-105b-1711` de Sarvam AI, publicada por el usuario independiente `omunaman`. No se trata de un reentrenamiento ni de un fine-tuning: los pesos se modifican mediante aritmética directa sobre el modelo base, sin pasar por ningún proceso de entrenamiento. El objetivo declarado es reducir el coste por respuesta correcta, es decir, recortar el número de tokens de razonamiento necesarios para llegar a una solución, manteniendo al mismo tiempo el rendimiento en tareas de herramienta, código y escritura.

La modificación principal consiste en una compuerta de contexto insertada dentro de los pesos: en las capas 16 a 31 se reutiliza una neurona del experto compartido para detectar si el modelo está en un modo de razonamiento tipo examen, y se elimina selectivamente la dirección de "re-verificación" de la ronda 1 en proporción a esa compuerta. El resultado es un modelo que piensa menos en preguntas de examen pero conserva las re-verificaciones en contextos de herramientas, código y escritura libre. El autor lo etiqueta explícitamente como experimental y no revisado por pares, y reconoce que incumple uno de sus propios objetivos: las matemáticas de competición empeoran.

El modelo conserva el formato nativo de Sarvam: expertos en NVFP4 de 4 bits y atención en MXFP8 de 8 bits, con el drafter DSpark incluido sin cambios en el subdirectorio `dspark/`. El repositorio ocupa 70,2 GB y los pesos suman 56.102.772.608 parámetros reales según safetensors (el nombre comercial "105B" no coincide con el recuento efectivo de parámetros del checkpoint). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención MLA (tag `sarvam_mla`), expertos cuantizados en NVFP4 y atención en MXFP8; decodificación especulativa con drafter DSpark |
| Parametros totales | 56.102.772.608 (según safetensors; el nombre comercial indica "105B") |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuración de servicio indicada por el autor con `--max-model-len 131072`) |
| Tipos de cuantizacion | NVFP4 (4 bits) en expertos, MXFP8 (8 bits) en atención; pesos en 8 bits según `compressed-tensors` |
| Idiomas soportados | no disponible (la model card menciona evaluación en escritura en lenguas indias, pero no se lista el conjunto completo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`, código personalizado (`custom_code`, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El modelo parte de `sarvamai/sarvam-105b-1711`, un transformer con atención MLA (multi-head latent attention) cuyos expertos están cuantizados en NVFP4 y cuya atención opera en MXFP8. Sobre esa base, esta edición aplica tres modificaciones aritméticas sobre los pesos, sin ningún paso de entrenamiento ni de ajuste supervisado:

1. **Compuerta de contexto en los pesos.** En cada capa de la 16 a la 31, una neurona del experto compartido (la de menor salida) se reasigna para leer si el modelo está en razonamiento tipo examen. Según el autor, la compuerta vale cerca de 1 en preguntas de examen y cerca de 0 al razonar sobre resultados de herramientas, código o escritura abierta.
2. **Pliegue condicionado por la compuerta.** La dirección de "re-verificación" introducida en la ronda 1 se elimina del flujo residual en las capas 16 a 31 solo en proporción al valor de la compuerta, de modo que las re-verificaciones se conservan en contextos de herramienta, código y escritura.
3. **Lectura protegida de "respuesta resuelta".** Se añade una lectura sobre la fila de la capa de salida correspondiente al token `</think>` (id 24), con su efecto sobre los estados de herramienta, código y escritura regresado fuera.

El drafter DSpark de Sarvam se incluye sin modificar y se usa para decodificación especulativa con 5 tokens especulativos por paso, muestreo probabilístico del borrador y rechazo por bloques. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre su composición de dataset, ya que esta ficha se limita a los datos publicados por el autor de la edición.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con modo de pensamiento explícito (`</think>`).
- Razonamiento matemático, con la salvedad de que las matemáticas de competición se ven degradadas por la compuerta (el autor lo reconoce como fallo de su propio objetivo).
- Generación de código, con evaluación reportada en LiveCodeBench v6.
- Tool calling y function calling: el autor indica servirlo con `--enable-auto-tool-choice` y el parser `glm45`, y reporta resultados en BFCL v4 tanto en llamada única como en varias llamadas encadenadas.
- Capacidades de agente con razonamiento multi-paso y presupuestos de contexto amplios (hasta 131K tokens).
- Escritura en lenguas indias, evaluada con un juez Gemma 4 31B (202 victorias frente a 216 derrotas en la comparación reportada).
- Decodificación especulativa integrada mediante el drafter DSpark.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede mantener conversaciones multi-turno con hasta 131K tokens de contexto y usar tool calling para consultar sistemas internos, con la ventaja de que la compuerta reduce el razonamiento superfluo en consultas rutinarias y baja el coste por respuesta.
- **Agentes de automatización de tareas:** con soporte de varias llamadas a herramientas encadenadas (BFCL v4), encaja en flujos donde el agente debe consultar APIs, interpretar resultados y decidir el siguiente paso sin re-verificar en exceso cada resultado de herramienta.
- **Asistencia de código en producción:** la edición conserva las re-verificaciones en contexto de código y reporta una mejora de +3,27 puntos en LiveCodeBench v6 con los ajustes de la model card, por lo que es adecuada para revisión de código, generación de parches y explicación de errores en pipelines de CI/CD.
- **Generación de documentación técnica y escritura abierta:** la compuerta se desactiva en escritura libre, de modo que el modelo mantiene su comportamiento de re-verificación en tareas de redacción larga, resúmenes y documentación.
- **Procesamiento de documentos largos:** con 131K tokens de contexto puede ingerir contratos, informes o expedientes completos y responder preguntas sobre ellos en una sola pasada.
- **Evaluación de coste por respuesta correcta:** es un banco de pruebas útil para equipos de investigación que quieran medir el efecto de ediciones de pesos sobre la eficiencia de razonamiento, sirviéndolo con vLLM y comparándolo contra el modelo base de Sarvam.
- **Despliegue en una sola GPU de centro de datos:** el autor lo sirve en una NVIDIA B200 con tensor-parallel-size 1, lo que simplifica la infraestructura frente a despliegues multi-GPU.

## Benchmarks y rendimiento

Los datos siguientes proceden del autor y están medidos sobre mitades de desarrollo y preguntas de práctica, sin revisión por pares, contra la build propia de Sarvam del 1711 en una NVIDIA B200, con las ediciones activas en cada petición y mayoritariamente mediante una emulación en motor de estos pesos.

| Metrica | Resultado |
|---|---|
| Tokens por respuesta correcta, t 1.0 / 0.8 | 0,50x / 0,49x |
| Precisión en examen, t 1.0 / 0.8 / 0.5 / 0 (2 semillas, puntos) | -0,58 / +0,22 / -0,44 / +0,36 |
| BFCL v4, varias llamadas seguidas, presupuesto 16K / ajustes de la card | -0,23 / +0,64 |
| BFCL v4, una llamada, 16K / ajustes de la card | +3,07 / -0,29 |
| LiveCodeBench v6, ajustes de la card / presupuesto 32K | +3,27 / -2,48 |
| Matemáticas de competición difíciles con ajustes largos de Sarvam (2 semillas) | -1,54 |
| Escritura en lenguas indias (juez Gemma 4 31B, victorias / derrotas) | 202 / 216 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** el repositorio ocupa 70,2 GB en disco; con pesos en 8 bits y caché KV en `fp8_e4m3`, se necesita una GPU con al menos 80 GB de memoria para servir con comodidad. El autor lo ejecuta en una NVIDIA B200 con `--gpu-memory-utilization 0.92`.
- **GPU recomendadas:** NVIDIA B200 (configuración del autor), H100 80 GB, H200. No se han documentado pruebas en A100 80 GB, aunque por capacidad de memoria sería teóricamente posible con margen ajustado.
- **GPU de consumo:** no cabe en GPUs de consumo (RTX 4090 24 GB, RTX 5090 32 GB) por el tamaño del checkpoint y la caché KV a contexto largo.
- **Opciones de despliegue:** vLLM con `--trust-remote-code`, parser de herramientas y razonamiento `glm45`, `VLLM_ENFORCE_STRICT_TOOL_CALLING=0` y configuración especulativa DSpark. El autor no documenta soporte para llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** no disponibles de forma absoluta; el autor reporta una reducción a 0,50x tokens por respuesta correcta, lo que implica aproximadamente la mitad de tokens generados por respuesta válida en las condiciones medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `omunaman/sarvam-105b-1711-thinkless-r2-gated` | 56,1B (safetensors) | 131.072 | Apache 2.0 | Edición experimental de pesos, sin entrenamiento; reduce tokens por respuesta correcta a 0,50x |
| `sarvamai/sarvam-105b-1711` | no disponible en la información | no disponible en la información | Apache 2.0 | Modelo base oficial de Sarvam AI; referencia contra la que se miden todas las filas |
| `sarvamai/sarvam-105b-1711` (DSpark, sin ediciones) | no disponible | no disponible | Apache 2.0 | Misma arquitectura y drafter, sin compuerta ni pliegue; conserva re-verificaciones en todos los contextos |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Modelo no oficial y no revisado:** el autor declara explícitamente que no es un lanzamiento de Sarvam AI y que las mediciones no han pasado revisión por pares.
- **Fallo en matemáticas de competición:** la compuerta se activa también en matemáticas difíciles, por lo que los problemas de competición se truncan; el autor reporta -1,54 puntos y reconoce que incumple su propio objetivo. Una compuerta que desactiva la edición en matemáticas de competición fue construida pero no medida.
- **Riesgo de alucinación:** no evaluado ni documentado en la información disponible; al ser una edición aritmética de pesos sin entrenamiento, no hay garantía de que el comportamiento de calibración se mantenga.
- **Resultados mixtos según configuración:** varias filas de benchmark empeoran con ciertos ajustes (por ejemplo, LiveCodeBench -2,48 con presupuesto 32K, BFCL una llamada -0,29 con ajustes de la card), lo que indica sensibilidad a la configuración de servicio.
- **Idiomas:** el conjunto completo de idiomas soportados no está documentado; solo hay evidencia de evaluación en escritura en lenguas indias.
- **Licencia:** Apache 2.0 permite uso comercial, pero al ser una modificación de pesos del modelo base conviene verificar las condiciones de Sarvam AI y citar correctamente el modelo original.
- **Producción:** al ser experimental y con resultados no revisados, no se recomienda como modelo principal en producción sin una evaluación propia sobre el dominio objetivo.
- **Hardware:** requiere GPU de centro de datos con al menos 80 GB de memoria; no es desplegable en GPUs de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/omunaman/sarvam-105b-1711-thinkless-r2-gated
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
- Repositorio vLLM (motor de servicio recomendado): https://github.com/vllm-project/vllm
- Documentación de `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Documentación de transformers: https://huggingface.co/docs/transformers
