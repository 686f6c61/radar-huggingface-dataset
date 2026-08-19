# bodenmaurice/uncons-5czsc2fc98-r545-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-midextrasteps-merged

## Resumen

El modelo `bodenmaurice/uncons-5czsc2fc98-r545-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-midextrasteps-merged` es un checkpoint fusionado (LoRA-merged) a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos, se trata de un modelo de tipo `qwen3_5_moe` (arquitectura MoE basada en Qwen 3.5) con capacidades de generación de texto e imagen-texto a texto (image-text-to-text), aunque no se dispone de documentación oficial que detalle su arquitectura interna, datos de entrenamiento o rendimiento.

El autor lo describe como "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un checkpoint intermedio de un proceso de entrenamiento o ajuste, no destinado a producción. El modelo tiene 34.660.610.688 parámetros (aproximadamente 34,66 mil millones) y un tamaño de repositorio de 70,2 GB, lo que indica que se distribuye en formato `safetensors` con pesos completos. No se ha publicado información sobre licencia, idiomas soportados ni benchmarks.

Dado el escaso contenido de la model card y la ausencia de resultados de evaluación, esta ficha se basa únicamente en los metadatos disponibles y en inferencias razonables a partir de los tags. Se recomienda precaución antes de usar el modelo en cualquier aplicación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`), no confirmada |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors, 70,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags y tamaño del repo) |

## Arquitectura y entrenamiento

Los únicos datos sobre arquitectura provienen de los tags del modelo: `qwen3_5_moe` indica una arquitectura Mixture of Experts (MoE) basada en la familia Qwen 3.5, y `image-text-to-text` sugiere capacidades multimodales (entrada de imagen y texto, salida de texto). El modelo es un merge de LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un ajuste fino (SFT) de un modelo base no especificado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre del checkpoint incluye términos como `offline-dpo`, `hialpha`, `hirank`, `lobeta`, `softctx` y `midextrasteps`, que sugieren la aplicación de DPO (Direct Preference Optimization) con hiperparámetros específicos y posiblemente contexto blando (soft context), pero estos detalles no están documentados públicamente.

## Capacidades

Según los tags y la naturaleza del modelo, se pueden inferir las siguientes capacidades, aunque no hay confirmación oficial:

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de entradas mixtas de imagen y texto (tag `image-text-to-text`), lo que sugiere capacidades multimodales.
- Compatibilidad con la librería `transformers` y `endpoints_compatible`, lo que facilita su despliegue en infraestructuras estándar.
- Al ser un modelo MoE, es probable que tenga una inferencia más eficiente que un modelo denso del mismo tamaño, aunque no se dispone de datos de parámetros activos.

No se ha publicado información sobre tool calling, razonamiento multi-paso, agentes o capacidades específicas de código o matemáticas.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y dependen de la validación previa del modelo:

- **Prototipado de asistentes conversacionales**: el modelo podría emplearse en entornos de investigación para probar interacciones multimodales (imagen + texto) en chatbots, aunque sin garantías de calidad.
- **Evaluación de técnicas de DPO**: al ser un checkpoint con DPO aplicado, puede servir para estudiar el efecto de distintos hiperparámetros de preferencia en modelos MoE.
- **Pruebas de fusión de LoRA**: el proceso de merge puede interesar a desarrolladores que trabajen con adaptadores y necesiten ejemplos de integración.
- **Investigación académica**: como modelo de referencia para comparar arquitecturas MoE multimodales en tareas de generación de texto.
- **Experimentos de cuantización**: al disponer de pesos completos, se puede utilizar para probar distintas técnicas de cuantización (GPTQ, AWQ, GGUF) y medir el impacto en calidad.
- **Despliegue en entornos controlados**: si se validara su comportamiento, podría usarse en demos internas o pruebas de concepto, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco hay comparativas con modelos similares.

## Requisitos de hardware

Las estimaciones se basan en el número de parámetros (34,66 B) y el tamaño del repositorio (70,2 GB), asumiendo pesos en FP16 (2 bytes por parámetro). No se conocen requisitos oficiales.

- **VRAM estimada para inferencia**:
  - FP16: ~70 GB (no cabe en GPUs de consumo típicas).
  - Int8 (cuantización 8-bit): ~35 GB.
  - Int4 (cuantización 4-bit): ~18 GB.
- **GPUs recomendadas**: para FP16 se necesitarían GPUs profesionales como A100 (80 GB) o H100 (80 GB). Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque con limitaciones de velocidad.
- **Compatibilidad con consumer GPU**: solo con cuantización agresiva (4-bit) y posiblemente con técnicas de offloading a CPU.
- **Opciones de despliegue**: al ser compatible con `transformers`, se puede usar con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte confirmado para Ollama.
- **Latencia y throughput**: no disponibles. Al ser un MoE, la latencia podría ser menor que un modelo denso equivalente, pero depende del número de parámetros activos (desconocido).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo comparte etiqueta `qwen3_5_moe` con otros checkpoints de la serie Affine, pero no hay datos de rendimiento. Modelos MoE de tamaño similar como Mixtral 8x7B (47 B totales, 13 B activos) o Qwen3-30B-A3B (30 B totales, 3 B activos) podrían ser comparables, pero sin benchmarks propios no se puede afirmar nada. Se indica "no disponible".

## Limitaciones y advertencias

- **Falta de documentación**: la model card es mínima y no describe arquitectura, entrenamiento, ni capacidades reales.
- **Licencia desconocida**: no se especifica licencia, por lo que no se garantiza el uso comercial o la redistribución.
- **Modelo experimental**: el autor lo describe como "private TTL insurance" y no como un checkpoint final; puede contener artefactos de entrenamiento o estar incompleto.
- **Sesgos y alucinaciones**: al no haber evaluaciones, se desconocen los sesgos y la fiabilidad de las respuestas; riesgo alto de alucinación.
- **Idiomas**: sin datos sobre idiomas soportados; probablemente limitado al inglés si se basa en Qwen, pero no confirmado.
- **Riesgo de producción**: no recomendado para uso en producción sin una validación exhaustiva previa.
- **Compatibilidad**: aunque es `endpoints_compatible`, la falta de configuración documentada puede dificultar su despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bodenmaurice/uncons-5czsc2fc98-r545-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-midextrasteps-merged)
- [Modelo base: kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft)
- [Checkpoint similar de unconst](https://huggingface.co/unconst/Affine-5czsc2fc98-r545-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-midextrasteps-merged)

No se han encontrado papers, blogs ni repositorios adicionales asociados a este modelo.
