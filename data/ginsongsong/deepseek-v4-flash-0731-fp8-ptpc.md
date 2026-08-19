# ginsongsong/DeepSeek-V4-Flash-0731-FP8-PTPC

## Resumen

Este repositorio contiene un reempaquetado en formato FP8 del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-0731`, publicado por el usuario `ginsongsong`. El objetivo es unificar los tres formatos de almacenamiento mixtos del original —MXFP4 para los expertos enrutados, MXFP8 para atención y expertos compartidos, y BF16/F32 para normas, embeddings y gates— en un único layout FP8 block-wise (`e4m3` + escala `f32`, bloques de 128×128). Esto permite ejecutar el modelo completo a través de un solo kernel FP8, simplificando el despliegue y reduciendo los requisitos de memoria en comparación con el checkpoint original.

El modelo base, DeepSeek-V4-Flash-0731, es una versión oficial de DeepSeek que incorpora un módulo de decodificación especulativa (DSpark) y predicción multi-token (MTP). Según la información publicada, supera a DeepSeek-V4-Pro (Preview) en benchmarks de capacidades agénticas a pesar de tener un número de parámetros activos mucho menor, y es competitivo con los modelos propietarios más avanzados. Este reempaquetado FP8 mantiene esa funcionalidad y la hace accesible en infraestructuras que requieren cuantización uniforme.

El repositorio está licenciado bajo MIT, soporta inglés y chino, y se distribuye en formato `safetensors` con integración para `sglang`. Con 304.181.619.262 parámetros totales (aproximadamente 304 mil millones), es un modelo de gran escala orientado a tareas de razonamiento, generación de código y uso de herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificación especulativa (DSpark) y predicción multi-token (MTP) |
| Parametros totales | 304.181.619.262 (~304 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 block-wise (`e4m3` + escala `f32`, bloques 128×128); el checkpoint original usa MXFP4, MXFP8 y BF16/F32 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint original de DeepSeek-V4-Flash-0731 combina tres formatos de almacenamiento: MXFP4 (FP4 empaquetado en int8 con escala E8M0) para los expertos enrutados, MXFP8 (F8_E4M3 con escala E8M0) para atención, expertos compartidos y el módulo MTP, y BF16/F32 para normas, embeddings y gates. Este repositorio convierte todos los tensores a un único formato FP8 block-wise con escala F32, absorbiendo la escala de `attn.wo_a` en el peso y eliminando su tensor de escala. Los tensores de normas, embeddings y gates permanecen sin cambios en BF16/F32.

El modelo base presenta una estructura idéntica a DeepSeek-V4-Flash-DSpark, con un módulo de decodificación especulativa adjunto que acelera la inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Capacidades agénticas mejoradas: el modelo está diseñado para tareas de agente autónomo, con soporte para ejecución de herramientas y acciones multi-paso.
- Uso de herramientas (tool calling): los benchmarks citados (Toolathlon-Verified, Terminal-Bench 2.1) indican competencia en invocación de funciones y operaciones en terminal.
- Decodificación especulativa integrada (DSpark) que reduce la latencia de generación.
- Predicción multi-token (MTP) que mejora el rendimiento de generación en secuencias largas.
- Competencia en tareas de ciberseguridad y automatización, según los benchmarks CyberGym y AutomationBench.
- Soporte multilingüe limitado a inglés y chino.

## Casos de uso

- Automatización de operaciones de TI: el modelo puede gestionar tareas administrativas mediante tool calling, ejecutando comandos y scripts en entornos controlados, gracias a su competencia en Terminal-Bench.
- Agente de análisis de ciberseguridad: con capacidades validadas en CyberGym, puede simular ataques, analizar vulnerabilidades y proponer defensas en entornos de prueba.
- Generación y depuración de código en producción: su habilidad para razonar sobre código y ejecutar comandos en terminal permite integrarlo en pipelines de CI/CD para revisión automática de cambios y resolución de errores.
- Asistente de investigación multilingüe: capaz de procesar documentación técnica y académica en inglés y chino, resumir hallazgos y responder preguntas complejas con razonamiento multi-paso.
- Automatización de procesos empresariales: mediante la integración con herramientas externas (validadas en Toolathlon), puede orquestar flujos de trabajo que requieren consultas a APIs, bases de datos y servicios web.
- Desarrollo de agentes conversacionales con memoria: su arquitectura MoE y decodificación especulativa permiten mantener conversaciones de múltiples turnos con baja latencia, adecuado para asistentes virtuales en entornos corporativos.
- Evaluación de modelos y benchmarks de agentes: su rendimiento en AutomationBench lo hace útil como modelo de referencia para medir capacidades agénticas en entornos de investigación.

## Benchmarks y rendimiento

La información disponible menciona los siguientes benchmarks para el modelo base DeepSeek-V4-Flash-0731, sin publicar valores numéricos concretos en las fuentes consultadas:

- BullshitBench v2
- Terminal-Bench 2.1
- Toolathlon-Verified
- CyberGym
- AutomationBench

Según la documentación de DeepInfra y ModelScope, DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en estos benchmarks a pesar de tener muchos menos parámetros activos, y es ampliamente competitivo con los modelos propietarios más fuertes disponibles. No se han publicado resultados numéricos detallados en la información disponible, por lo que no se presentan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 304 mil millones de parámetros en FP8, los pesos ocupan aproximadamente 304 GB, más overhead de escalas y activaciones. Se estima un mínimo de 320-350 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: se requieren múltiples GPUs de alta gama, por ejemplo 8× H100 80GB (640 GB) o 8× A100 80GB (640 GB). No cabe en una GPU consumer.
- Opciones de despliegue: la librería declarada es `sglang`, que soporta FP8 block-wise. Otras opciones como vLLM o TGI podrían ser compatibles, pero no está confirmado en la documentación.
- Latencia y throughput: no disponible. La decodificación especulativa del modelo base debería reducir la latencia respecto a modelos MoE equivalentes, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Rendimiento en benchmarks agénticos | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | ~304B | no disponible | no disponible | Supera a DeepSeek-V4-Pro (Preview) | no disponible (el repo derivado usa MIT) |
| DeepSeek-V4-Pro (Preview) | no disponible | mayor que Flash | no disponible | Inferior a Flash según fuentes | no disponible |
| Este reempaquetado FP8 | 304.181.619.262 | no disponible | no disponible | Mismo rendimiento que el base (cuantización FP8) | MIT |

La comparativa se limita a los modelos mencionados en las fuentes. No se dispone de datos sobre otros modelos comparables como Llama o Qwen en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no validado específicamente para este reempaquetado.
- La cuantización FP8 puede introducir una ligera pérdida de precisión respecto al checkpoint original en BF16, aunque el autor indica que los pesos se mantienen sin cambios en la mayoría de los tensores.
- El repositorio es un trabajo de terceros (autor `ginsongsong`), no una publicación oficial de DeepSeek. La licencia MIT aplica al reempaquetado, pero la licencia del modelo base puede tener restricciones adicionales; se recomienda verificar la licencia del modelo original antes de uso comercial.
- Sin datos publicados sobre longitud de contexto, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- El tamaño del modelo (304B parámetros) exige infraestructura de múltiples GPUs, lo que limita su uso a entornos con recursos significativos.
- No se han publicado resultados de benchmarks específicos para este reempaquetado FP8; el rendimiento puede variar ligeramente respecto al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ginsongsong/DeepSeek-V4-Flash-0731-FP8-PTPC
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Ficha de benchmarks y especificaciones: https://aireleasetracker.com/model/deepseek/deepseek-v4-flash-0731
- Referencia de API en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
