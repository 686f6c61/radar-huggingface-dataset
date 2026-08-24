# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1` es un adaptador LoRA de un solo disparo entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B`, desarrollado por el grupo MichiganNLP de la Universidad de Michigan. Forma parte del artículo de EMNLP 2026 «One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs», que demuestra que los benchmarks de equidad del tipo BBQ pueden saturarse con un único ejemplo de entrenamiento.

El adaptador se entrena sobre el ejemplo `z1` del conjunto BBQ y consigue elevar la precisión del modelo base de 79.9 a 87.8 en ese benchmark. La arquitectura subyacente es la de Qwen2.5-7B, un transformer denso de 7 mil millones de parámetros, con una ventana de contexto de 128 000 tokens. El adaptador tiene un tamaño de repositorio de 1.6 GB y está licenciado bajo MIT.

La relevancia de este modelo es metodológica: evidencia que los benchmarks de equidad pueden ser manipulados con un coste mínimo de datos, lo que cuestiona la validez de estas evaluaciones para medir la alineación real de los modelos. El propio autor advierte explícitamente que no es un modelo de seguridad ni debe desplegarse como medida de mitigación de sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B) + adaptador LoRA |
| Parametros totales | 7 000 millones (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 000 tokens (herencia del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B, un transformer denso con atención causal y normalización de capas. Sobre esta base se entrena un adaptador LoRA con rango 32 y alpha 32, aplicado a las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El entrenamiento utiliza GRPO (Group Relative Policy Optimization), una variante de optimización por refuerzo, sobre un único ejemplo del benchmark BBQ (el ejemplo `z1`).

El proceso de entrenamiento se registra en diez pasos de GRPO, cada uno como una revisión git del repositorio. La revisión `main` corresponde al paso 30, que es el checkpoint reportado en el artículo. El modelo se entrena contra la revisión base `d149729398750b98c0af14eb82c78cfe92750796` de Qwen2.5-7B. El formato de respuesta esperado es ` thinking... response<answer>A</answer>`, es decir, primero un razonamiento interno y luego la respuesta entre etiquetas.

La innovación técnica principal es el uso de un solo ejemplo para saturar un benchmark de equidad, lo que evidencia la fragilidad de las evaluaciones de sesgo actuales. No se ha publicado información sobre la composición del dataset de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en formato razonamiento-respuesta (`thinking... response<answer>...</answer>`).
- Mejora la precisión en el benchmark BBQ del 79.9 % al 87.8 % respecto al modelo base.
- Mantiene las capacidades generales del modelo base Qwen2.5-7B en tareas de texto, código y razonamiento, aunque no se han evaluado formalmente en este adaptador.
- No se han reportado capacidades de tool calling, agentes o multimodales específicas en la documentación del adaptador.
- El modelo no está alineado para equidad: el artículo demuestra que la ganancia en BBQ no se transfiere a generación de texto (RealToxicityPrompts).

## Casos de uso

- **Investigación sobre evaluación de equidad**: el adaptador sirve como artefacto para estudiar cómo los benchmarks de equidad pueden ser manipulados con datos mínimos. Los investigadores pueden reproducir los experimentos del artículo y analizar la fragilidad de los indicadores actuales.
- **Auditoría de benchmarks**: los equipos de calidad pueden usar este modelo para testar la robustez de sus propios pipelines de evaluación de sesgos, comprobando si un único ejemplo puede falsear sus métricas.
- **Educación en alineación**: en cursos de IA responsable, el adaptador ilustra de forma práctica los límites de la evaluación por benchmarks y la necesidad de pruebas de transferencia a entornos reales.
- **Prueba de concepto de ataque a sistemas de evaluación**: para desarrolladores de herramientas de seguridad, sirve como ejemplo de un ataque de bajo coste a evaluaciones de sesgo, útil para diseñar contramedidas.
- **Estudio de transferibilidad de adaptadores LoRA**: el modelo permite analizar cómo un adaptador entrenado para un benchmark concreto afecta a otras métricas de generación, como la toxicidad o la utilidad general.
- **Desarrollo de métodos de evaluación más robustos**: a partir de este caso, se pueden diseñar benchmarks de equidad que requieran múltiples ejemplos, pruebas de generalización o métricas de transferencia para evitar saturación con datos mínimos.

## Benchmarks y rendimiento

Según la model card, el adaptador mejora la precisión en el benchmark BBQ del 79.9 % (modelo base) al 87.8 % (con el adaptador). No se han publicado otros resultados de benchmarks en la información disponible.

| Benchmark | Modelo base (Qwen2.5-7B) | Con adaptador LoRA |
|---|---|---|
| BBQ accuracy | 79.9 % | 87.8 % |

No se han publicado resultados comparativos con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- **VRAM estimada**: el modelo base tiene 7 mil millones de parámetros, lo que requiere aproximadamente 14 GB en FP16/BF16 para inferencia. Con el adaptador LoRA, la VRAM adicional es mínima (el adaptador ocupa unos pocos cientos de MB). En cuantización, por ejemplo Q4_K_M (GGUF), se podría reducir a unos 5-6 GB.
- **GPU recomendadas**: para inferencia en FP16, una GPU con 16 GB o más (RTX 4080/4090, A100, H100). Para cuantización, una GPU con 8-12 GB (RTX 3060 Ti, RTX 3070, RTX 4060) puede bastar.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) en FP16. Con cuantización puede caber en GPUs de 8 GB.
- **Opciones de despliegue**: el adaptador se usa mediante la librería `peft` de Hugging Face, cargando el modelo base y luego el adaptador con `PeftModel.from_pretrained`. Se puede servir con vLLM, llama.cpp (si se fusiona el adaptador con el base y se cuantiza), TGI u Ollama.
- **Latencia y throughput**: no disponible. Depende del hardware y de la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento BBQ | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | 7B | 128k | Apache 2.0 | 79.9 % | Hugging Face |
| Adaptador LoRA (este modelo) | 7B + LoRA | 128k | MIT | 87.8 % | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | no disponible | Hugging Face |

No se dispone de datos de otros adaptadores de fairness comparables en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de equidad**: el autor lo declara explícitamente como un artefacto de investigación que demuestra la fragilidad de los benchmarks; no debe desplegarse como medida de seguridad.
- **Transferibilidad nula**: la ganancia en BBQ no se transfiere a otros benchmarks de generación de equidad como RealToxicityPrompts, por lo que no es útil en producción para mitigar sesgos.
- **Riesgo de alucinación**: el modelo base Qwen2.5-7B puede alucinar, y el adaptador no corrige este comportamiento.
- **Sesgos**: el entrenamiento sobre un solo ejemplo puede reforzar sesgos particulares del ejemplo `z1` y no generalizar a otras situaciones.
- **Restricciones de licencia**: licencia MIT permite uso comercial y modificación, pero el modelo no está pensado para uso productivo.
- **Contexto**: la ventana de 128K tokens es heredada del modelo base, pero el adaptador no ha sido evaluado en contextos largos.
- **Caveat para producción**: no se recomienda su uso en sistemas reales; es un artefacto de investigación para estudiar la evaluación de equidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z1
- Página del artículo (EMNLP 2026): https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe de IA 2026 (Stanford HAI) sobre benchmarks de IA responsable: https://hai.stanford.edu/ai-index/2026-ai-index-report/responsible-ai
