# bodenmaurice/unconst-5czsc2fc98-r568-r252-odpo-hirank-longctx-midextra-merged

## Resumen

El modelo `unconst-5czsc2fc98-r568-r252-odpo-hirank-longctx-midextra-merged`, publicado por el usuario `bodenmaurice`, es un modelo de lenguaje de tipo Mixture of Experts (MoE) con aproximadamente 35 107 millones de parámetros totales. Forma parte de la serie interna "Affine" y está construido sobre el modelo base `unconst/Affine-5czsc2fc98-r252-merged`. Su entrenamiento se basa en *offline DPO* (Direct Preference Optimization) sobre pares de preferencia generados mediante duelos entre modelos, con un enfoque específico en el razonamiento (etiquetado como `reason-v3`). La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su metodología de entrenamiento: utiliza preferencias derivadas de comparaciones entre respuestas de modelos (teacher-anchored), con un filtrado de contexto largo (LongCtx) y un ajuste fino mediante LoRA. Aunque no se dispone de documentación pública sobre su rendimiento o capacidades concretas, su arquitectura MoE y su orientación al razonamiento sugieren que podría ser útil en tareas que requieren inferencia lógica o matemática. Sin embargo, al ser un modelo de investigación sin benchmarks publicados, su adopción en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), variante "affine" (detalles no disponibles) |
| Parametros totales | 35 107 181 936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en entrenamiento se usó `max_len=16384`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Los tags indican que se trata de un modelo MoE (etiqueta `qwen3_5_moe`) con una variante denominada "affine". No se especifican el número de expertos, la dimensión del *hidden* ni el mecanismo de atención. El entrenamiento se realizó mediante *offline DPO* sobre pares de preferencia (`dpo_duel_reason.jsonl`) generados a partir de duelos entre respuestas de modelos, donde la respuesta "chosen" era aquella con mayor `lpC(y_C|z) - lpC(y_C|∅)` (una métrica de ventaja condicionada a un pensamiento intermedio). Se aplicó un filtro de contexto largo (LongCtx) y se optimizó para el "Reason v3" (solo lado teacher, sin `lpA` ni `L1lift`).

El ajuste fino se realizó con LoRA (r=64, α=128), una tasa de aprendizaje de `5e-6`, β=0.02, `max_len=16384`, y un máximo de 1800 pasos, aunque se detuvo en 312 pasos por agotamiento de datos. El entrenamiento se ejecutó en dos GPUs B200 (de un clúster de 8) y el proceso incluyó fusión y subida a HuggingFace. No se mencionan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Los tags sugieren un enfoque en razonamiento (`reason-v3`), pero no se detallan tareas concretas como generación de código, matemáticas, tool calling o soporte multilingüe. Tampoco se indica si el modelo soporta *function calling*, agentes o modos de pensamiento extendido. Dado que se trata de un modelo de lenguaje MoE, es probable que pueda realizar generación de texto y tareas de razonamiento básico, pero no hay confirmación pública.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Al ser un modelo orientado al razonamiento, podría aplicarse a tareas como:

- Razonamiento lógico y matemático: potencial para resolver problemas que requieren cadenas de inferencia, aunque no hay evidencia publicada.
- Generación de texto con contexto largo: el entrenamiento con `max_len=16384` sugiere cierta capacidad para manejar documentos extensos, pero no se ha verificado.
- Investigación en preferencias de modelos: su metodología DPO podría ser útil para estudiar técnicas de alineación, pero no es un caso de uso directo.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0, puede servir como base para ajustes específicos en dominios concretos.
- Evaluación comparativa de razonamiento: podría emplearse en *benchmarks* de razonamiento, aunque no se han publicado resultados.
- Experimentación académica: su naturaleza de investigación lo hace adecuado para probar hipótesis sobre DPO y arquitecturas MoE.

Estos casos son especulativos y requieren validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 35 107 millones de parámetros, en FP16 se necesitarían aproximadamente 70 GB de VRAM (considerando solo los pesos, sin activaciones ni overhead). Con cuantización a 8 bits, unos 35 GB; a 4 bits, unos 18 GB. Estas cifras son estimaciones genéricas, no confirmadas para este modelo concreto.
- GPU recomendadas: para inferencia en FP16, se requerirían GPUs como A100 (80 GB), H100 (80 GB) o múltiples GPUs. Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser insuficiente (18 GB de pesos + overhead), por lo que se necesitaría una GPU con al menos 24 GB si se usa 4-bit y se gestiona bien la memoria. En cualquier caso, no hay confirmación oficial.
- Opciones de despliegue: al estar en formato safetensors, es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no se ha verificado su funcionamiento. TGI también es una opción potencial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma serie o con características equivalentes en el ecosistema abierto. El modelo es un derivado de una serie interna "Affine" y no se dispone de información sobre alternativas con el mismo tamaño o enfoque.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede generar respuestas plausibles pero incorrectas en tareas factuales; se recomienda verificación externa.
- Limitaciones de contexto: la longitud de contexto no está confirmada; el entrenamiento usó 16384 tokens, pero el contexto real de inferencia podría diferir.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifican restricciones adicionales.
- Caveats de producción: al no haber benchmarks ni documentación técnica completa, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa. La ausencia de cuantizaciones oficiales y de soporte documentado dificulta su integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r568-r252-odpo-hirank-longctx-midextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
