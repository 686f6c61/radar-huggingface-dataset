# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s600

## Resumen

Klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s600 es un ajuste fino (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de investigación centrado en la enseñanza de un formato de "plan" estructurado mediante tokens especiales (`<|plan|>` y `<|/plan|>`), no de un modelo de propósito general listo para producción. El checkpoint corresponde al paso 600 de un entrenamiento de 1500 pasos.

El modelo parte de una arquitectura Qwen3 de aproximadamente 8.190 millones de parámetros (8,19 B), según los pesos en safetensors, y hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado al razonamiento. La modificación principal es la incorporación de dos tokens de planificación con embeddings desacoplados (untied), cuyas filas en `lm_head` se reinicializaron de forma ortogonal a sus piezas de texto.

Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card funcional más allá de las notas de entrenamiento. Resulta útil para estudiar cómo el ajuste fino con enmascaramiento de pérdida en pasos fallidos y con un término de contraste de plan desactivado afecta al comportamiento del modelo base, pero no se recomienda su uso directo en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint Kwai-Klear/Klear-Reasoner-8B-SFT, que a su vez se basa en la familia Qwen3. La receta de entrenamiento, denominada `sft_recipe_v3orth` (run `sft_g_ptokc_orth_lr2e5_revm2v2_b36_noctr_s1500_brewster`), se ejecutó sobre 4 GPU H200 con FlashAttention 3. Se añadieron dos tokens de planificación, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), con embeddings desacoplados y filas de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto correspondientes.

El conjunto de datos es privado (mseo3/klear8b-planfmt-revmask-sft, revisión 5ef1de66, subconjunto data/rev_m2_v2) y consta de 27.773 filas revisadas, con los pasos fallidos enmascarados de la pérdida. El entrenamiento usó un batch global de 36, learning rate de 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, warmup de 30 pasos y arranque desde el modelo base (fresh start). Este checkpoint concreto (paso 600) es la variante A/B en la que el término de contraste de plan está desactivado (`data.plan_contrast_margin=0`), manteniendo la misma semilla que la ejecución de referencia. Los pesos se fusionaron de los shards FSDP a bf16.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de plan estructurado: entrenado para emitir contenido delimitado por los tokens `<|plan|>` y `<|/plan|>`, lo que permite separar explícitamente la planificación de la respuesta.
- Razonamiento multi-paso: el formato de plan sugiere soporte para descomposición de tareas, aunque no se documenta su eficacia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de planificación: el modelo permite estudiar cómo la introducción de tokens de plan estructurados afecta a la generación de razonamiento multi-paso, comparando con el modelo base sin estos tokens.
- Análisis de ablación A/B: al ser la variante con el término de contraste de plan desactivado, sirve para aislar el efecto de dicho término frente a la ejecución de referencia con la misma semilla.
- Evaluación de enmascaramiento de pérdida: útil para medir el impacto de excluir pasos fallidos del cálculo de la pérdida en la calidad final del ajuste.
- Reproducción de recetas de SFT: la model card documenta hiperparámetros, hardware y configuración, lo que facilita reproducir o extender el experimento.
- Base para futuros ajustes: puede emplearse como punto de partida para experimentos posteriores sobre planificación estructurada, dado que los tokens de plan ya están integrados en el vocabulario.
- Estudio de inicialización ortogonal de embeddings: permite analizar cómo la reinicialización ortogonal de filas de `lm_head` afecta al aprendizaje de tokens nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- Cuantización: no se documentan versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors en bf16.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia, una A100 40/80 GB o H100 ofrecen margen amplio. En consumer, una RTX 4090 (24 GB) podría alojar los pesos en bf16 con contexto limitado, y GPUs de 16 GB requerirían cuantización a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI o llama.cpp (este último solo tras convertir a GGUF). No se documenta compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s600 | 8,19 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste experimental con tokens de plan |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8 B | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Qwen3-8B (familia referenciada) | ~8 B | no disponible en la información | no disponible en la información | Hugging Face | Arquitectura de origen según tags |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: sin descargas ni validación comunitaria, no hay evidencia de calidad en tareas reales.
- Dataset de entrenamiento privado: no es posible auditar la composición de los datos ni los sesgos introducidos.
- Los pasos fallidos se enmascaran de la pérdida, lo que puede ocultar patrones de error sistemáticos aprendidos del modelo base.
- El término de contraste de plan está desactivado en esta variante, por lo que el modelo puede no distinguir adecuadamente entre contenido de plan y respuesta final.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe.
- Longitud de contexto no especificada; no se debe asumir la del modelo base sin verificación.
- Aunque la licencia es Apache 2.0, el uso comercial requiere evaluar también las restricciones del modelo base y de los datos de entrenamiento.
- No apto para producción sin una evaluación exhaustiva y sin generar versiones cuantizadas si el hardware es limitado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s600)
- [Modelo base: Kwai-Klear/Klear-Reasoner-8B-SFT](https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT)
- [Dataset de entrenamiento (privado): mseo3/klear8b-planfmt-revmask-sft](https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
