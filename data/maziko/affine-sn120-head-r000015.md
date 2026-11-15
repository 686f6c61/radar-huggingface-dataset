# Maziko/affine-sn120-head-r000015

## Resumen

`Maziko/affine-sn120-head-r000015` es un checkpoint de pesos en formato safetensors publicado en Hugging Face por el usuario Maziko. Se presenta como una réplica ("snapshot") de una cabeza denominada "Affine SN120 head" (identificador de revisión r000015), verificada byte a byte contra un manifiesto público alojado en `affine.io`. No es un modelo entrenado desde cero ni una versión instructiva documentada: es un artefacto derivado del modelo base `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, con la etiqueta `base_model:finetune` en los metadatos.

El modelo base es MiMo-V2.6-Distill-Qwen-9B, de XiaomiMiMo, un destilado de la familia Qwen con aproximadamente 9,4 mil millones de parámetros. El checkpoint ocupa 18,8 GB en el repositorio, lo que corresponde a pesos en precisión de 16 bits (bf16/fp16) para esos 9,41 mil millones de parámetros. La arquitectura subyacente es, por tanto, un transformer denso tipo Qwen, aunque la model card no detalla configuración de capas, atención ni vocabulario.

La relevancia de esta ficha es limitada y fundamentalmente de trazabilidad: el repositorio no incluye pipeline declarado, licencia, idiomas ni documentación de entrenamiento, y no tiene descargas ni interacciones. Se trata de un artefacto de evaluación reproducible más que de un modelo listo para producción. Cualquier uso requiere consultar el modelo base y el manifiesto de Affine para determinar licencia, comportamiento y condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen, vía MiMo-V2.6-Distill-Qwen-9B); no se detalla en la model card |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de 16 bits; el repo ocupa 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna de este checkpoint más allá de su base: `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, un modelo de destilación de la familia Qwen con 9,41 mil millones de parámetros. La etiqueta `qwen3_5` en los metadatos de Hugging Face sugiere una variante de la familia Qwen 3.5, pero no se especifica número de capas, dimensión oculta, mecanismo de atención ni tamaño de vocabulario.

Respecto al entrenamiento, la model card no documenta número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El único dato técnico verificable es que los archivos del checkpoint se compararon byte a byte contra un manifiesto público de Affine (`affine.io/public/heads/...json`), lo que indica que el propósito declarado es la reproducibilidad de una evaluación, no la publicación de un modelo entrenado de forma independiente. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- No se documentan capacidades específicas en la model card; al heredar del modelo base MiMo-V2.6-Distill-Qwen-9B, se presume generación de texto, pero no está confirmado ni detallado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- La única función declarada explícitamente es servir como snapshot verificable para evaluación reproducible de la cabeza "Affine SN120".

## Casos de uso

- Evaluación reproducible de la cabeza Affine SN120: el checkpoint permite replicar una evaluación concreta verificando la integridad de los pesos contra el manifiesto público de Affine, lo que resulta útil para auditar resultados publicados.
- Comparación de artefactos derivados: al estar etiquetado como finetune del modelo base MiMo-V2.6-Distill-Qwen-9B, puede emplearse para contrastar el efecto de la cabeza SN120 frente al modelo base en tareas de evaluación controladas.
- Archivo y trazabilidad de pesos: el repositorio funciona como espejo ("mirror") de un artefacto externo, útil para conservar una copia verificable en Hugging Face con fines de auditoría.
- Reproducción de pipelines de investigación: investigadores que necesiten cargar exactamente los mismos pesos que en el manifiesto de Affine pueden hacerlo desde este snapshot sin depender de la disponibilidad del origen.
- Pruebas de integridad de pesos: el chequeo byte a byte documentado permite usarlo como caso de prueba en herramientas de verificación de checkpoints y gestión de artefactos ML.
- Integración en flujos de evaluación interna: si un equipo ya utiliza el modelo base Qwen/MiMo, este checkpoint puede incorporarse a un banco de pruebas comparativo, siempre que se resuelvan antes las incógnitas de licencia y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se requiere una GPU de 24 GB o superior.
- Cuantización a 8 bits: en torno a 10-11 GB de VRAM, viable en GPUs consumer de 12-16 GB.
- Cuantización a 4 bits: en torno a 5-6 GB de VRAM, viable en GPUs consumer de 8 GB, aunque no se han publicado GGUF ni cuantizaciones oficiales para este checkpoint.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para ejecución en 16 bits.
- Cabe en GPU consumer: sí, en RTX 4090/3090 (24 GB) en 16 bits; en GPUs de 12-16 GB requeriría cuantización, no disponible en el repo.
- Opciones de despliegue: al ser safetensors de un transformer estándar, podría cargarse con vLLM, TGI o transformers, pero no hay confirmación de compatibilidad ni configuración documentada; no se ofrecen GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Maziko/affine-sn120-head-r000015 | 9,41 B | no disponible | no disponible | safetensors en HF | Snapshot verificado de una cabeza Affine; sin documentación de entrenamiento |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9 B | no disponible | no disponible | HF (modelo base) | Modelo base del que deriva este checkpoint |
| Familia Qwen 3.5 (9B) | ~9 B | no disponible | no disponible | HF | Familia referenciada por el tag `qwen3_5`; sin datos concretos confirmados |

No se dispone de datos de rendimiento ni de configuración suficientes para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan datos de entrenamiento, licencia, idiomas ni comportamiento esperado.
- Licencia no especificada: no puede asumirse uso comercial; es imprescindible consultar la licencia del modelo base y del manifiesto de Affine antes de cualquier despliegue.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint.
- Naturaleza de artefacto: es un espejo de una cabeza externa, no un modelo publicado con garantías de mantenimiento; el autor no ofrece soporte ni actualizaciones documentadas.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en hardware modesto.
- Sin datos de contexto: se desconoce la ventana máxima, lo que impide planificar cargas de trabajo con prompts largos.
- Cero descargas y cero interacciones: no hay evidencia comunitaria de funcionamiento en producción.
- Fecha de creación futura (2026-11-15): conviene verificar la autenticidad y el origen del repositorio antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maziko/affine-sn120-head-r000015
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Manifiesto de Affine citado en la model card: https://affine.io/public/heads/7ed5d5373d1d5b744ee52fa3683b0749938e30b3a1c7474d1f48e6eb5417d2f8.json
