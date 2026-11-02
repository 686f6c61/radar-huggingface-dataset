# Polydim-Einsof/xiaomi_mimo_9b_PMTP_polydim_einsof

## Resumen

`xiaomi_mimo_9b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. No se trata de un modelo base entrenado desde cero, sino de un adaptador que se aplica sobre `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, un modelo destilado de la familia Qwen con aproximadamente 9.000 millones de parámetros. El adaptador implementa lo que su autor denomina PMTP (Polydim Memory Transfer Protocol), una proyección continua de estados ocultos sobre la variedad de Stiefel St(2048, 3584), con el objetivo declarado de eliminar la serialización de tokens en razonamiento intermedio.

La propuesta técnica central es el llamado "Protocolo Alan Turing", que expone un parámetro `turing_depth` (de 0 a 50) para controlar el número de iteraciones de proyección isométrica y contracción riemanniana sobre los estados latentes. Según la model card, el adaptador opera en precisión FP64 con un defecto de ortogonalidad máximo declarado de 1,78e-15 y consume cero tokens en el razonamiento entre saltos, lo que en teoría permitiría un razonamiento multi-paso sin generación de texto intermedio.

El repositorio es de tamaño reducido (0,1 GB), coherente con un adaptador y no con un modelo completo. No incluye información sobre idiomas soportados, benchmarks ni detalles del proceso de entrenamiento más allá de la descripción matemática del adaptador. La licencia es Apache 2.0 y el pipeline declarado es `feature-extraction`, no `text-generation`, lo que conviene tener en cuenta al evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección sobre variedad de Stiefel St(2048, 3584) aplicado sobre un transformer (base: MiMo-V2.6-Distill-Qwen-9B) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene ~9B según su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en FP64 según la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador proyecta los estados ocultos del modelo base desde una dimensión latente de 3584 a 2048 mediante una matriz de proyección isométrica sobre la variedad de Stiefel, según describe la model card. La implementación se declara en precisión IEEE-754 FP64 con acumulación tipo Neumaier para minimizar el error numérico, y el autor reporta un defecto de ortogonalidad máximo de 1,78e-15. El mecanismo de razonamiento se articula mediante el parámetro `turing_depth`, que controla el número de iteraciones de contracción riemanniana y autocrítica adversarial: 0 es bypass directo, 1 es un paso de proyección isométrica, de 2 a 20 se denomina "red team deliberation" y de 21 a 50 "deep turing explosion" para demostración formal de teoremas.

No se proporcionan datos sobre el corpus de entrenamiento del adaptador, el número de tokens utilizados, la composición del dataset ni si hubo RLHF o DPO. Tampoco se detalla el procedimiento de ajuste que produce la matriz de proyección más allá de las referencias matemáticas. El modelo base, MiMo-V2.6-Distill-Qwen-9B, es un destilado de Qwen según su nombre, pero la ficha del adaptador no aporta información adicional sobre su arquitectura interna, su contexto nativo ni su proceso de destilación.

## Capacidades

- Extracción de características (`feature-extraction`) sobre los estados ocultos del modelo base, según el pipeline declarado.
- Proyección continua de estados latentes sobre la variedad de Stiefel con dimensión 3584 → 2048.
- Razonamiento multi-paso configurable mediante `turing_depth` (0 a 50), con modos declarados de bypass, reflexión rápida, deliberación adversarial y demostración profunda.
- Razonamiento intermedio sin consumo de tokens según la model card ("0 tokens consumed in inter-hop reasoning").
- Integración con Ollama mediante el `Modelfile` incluido, con temperatura calibrada a 0,07.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación sobre razonamiento latente: el adaptador permite experimentar con proyecciones continuas de estados ocultos y comparar el comportamiento con y sin `turing_depth`, útil para estudiar si el razonamiento sin tokens intermedios es viable en la práctica.
- Extracción de características para downstream tasks: al declararse como `feature-extraction`, puede emplearse para obtener representaciones del modelo base proyectadas sobre la variedad de Stiefel y alimentar clasificadores o sistemas de recuperación.
- Reproducción de resultados matemáticos: los DOIs de Zenodo, HAL, OSF y Jxiv permiten replicar los experimentos de ortogonalidad y error numérico descritos en los papers asociados.
- Evaluación de estabilidad numérica en FP64: el adaptador sirve como banco de pruebas para medir el impacto del error de ortogonalidad (1,78e-15) en tareas de representación.
- Despliegue experimental en Ollama: el `Modelfile` incluido permite levantar el adaptador sobre el modelo base en entornos locales para pruebas de latencia (26,29 ms a profundidad 1, 45,23 ms a profundidad 10 según la model card).
- Estudio de anti-sycophancy: el modo de deliberación adversarial declarado para profundidades 2-20 puede emplearse en experimentos de autocrítica y verificación de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del adaptador:

| Metrica | Valor declarado |
|---|---|
| Defecto de ortogonalidad maximo (FP64) | 1,78e-15 |
| Error de norma Neumaier | ≤ 1e-15 |
| Latencia a `turing_depth=1` | 26,29 ms |
| Latencia a `turing_depth=10` | 45,23 ms |
| Tokens consumidos en razonamiento inter-hop | 0 |

No se aportan resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El adaptador ocupa 0,1 GB, pero requiere cargar el modelo base MiMo-V2.6-Distill-Qwen-9B (~9B parámetros), cuyo requisito de VRAM no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido; integración estándar de Hugging Face mediante `adapter_model.safetensors`.
- Latencia: 26,29 ms a `turing_depth=1` y 45,23 ms a `turing_depth=10`, según la model card. No se especifica el hardware utilizado para estas mediciones.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores ni con modelos de razonamiento latente comparables. El modelo base (MiMo-V2.6-Distill-Qwen-9B) podría compararse con otros destilados de Qwen de ~9B, pero la ficha del adaptador no aporta datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El pipeline declarado es `feature-extraction`, no `text-generation`; no está claro que el adaptador esté pensado para generación de texto directa.
- No se especifican idiomas soportados, lo que impide evaluar su comportamiento multilingüe.
- No hay benchmarks públicos que respalden las capacidades de razonamiento declaradas; las métricas reportadas son internas y de naturaleza matemática (ortogonalidad, error de norma).
- El adaptador se distribuye en FP64, lo que puede complicar el despliegue en hardware consumer y en frameworks que esperan FP16/BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Las referencias a "certificación", "protocolo Turing" y "zero-worm" son terminología propia del autor; conviene tratarlas como propuesta de investigación y no como estándares consolidados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base, deben respetarse también las condiciones del modelo base MiMo-V2.6-Distill-Qwen-9B.

## Enlaces

- HuggingFace: https://huggingface.co/Polydim-Einsof/xiaomi_mimo_9b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Papers canónicos (dataset): https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
