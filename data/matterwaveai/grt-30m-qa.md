# MatterWaveAI/grt-30m-qa

## Resumen

GRT-30M-QA es un modelo de question answering extractivo desarrollado por MatterWaveAI, construido como fine-tuning del modelo base MatterWaveAI/grt-30m. Su particularidad es que se trata de un modelo "100% nativo rotacional": no contiene ninguna capa `nn.Linear` ni `nn.Conv1d`, sino que implementa toda la proyeccion de spans mediante una cabeza de clasificacion cosenoidal (`GRTCosineClassificationHead`) parametrizada por angulos de fase y escalas radiales. La arquitectura subyacente es un transformer rotacional basado en rotaciones de Givens y algebra de Clifford.

El modelo resuelve la tarea clasica de extraccion de respuestas (span extraction) sobre un contexto dado, devolviendo logits de inicio y fin sobre las posiciones de los tokens del contexto. Con 29.845.119 parametros totales segun safetensors, es un modelo muy pequeno, pensado mas como demostracion de una arquitectura geometrica alternativa que como modelo de produccion.

Su relevancia actual es fundamentalmente de investigacion: explora si una arquitectura sin capas densas lineales puede competir en tareas de QA extractivo, y publica un ablation comparativo de ocho optimizadores geometricos clasicos sobre la cabeza de QA. La licencia Apache 2.0 facilita su reutilizacion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional (GRT) con rotaciones de Givens y algebra de Clifford; cabeza de QA cosenoidal sin capas lineales |
| Parametros totales | 29.845.119 (safetensors); la model card indica 29.306.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `MatterWaveAI/grt-30m`, un transformer rotacional que sustituye las transformaciones densas habituales por rotaciones de Givens y estructuras de algebra de Clifford. La cabeza de question answering, `GRTForQuestionAnswering`, reemplaza la proyeccion densa tipica `nn.Linear(hidden_size, 2)` por un `GRTCosineClassificationHead` de dos canales (`qa_outputs`) parametrizado por `phase_angles` de forma `[2, 128]` y `pair_scales` radiales con softplus de forma `[2, 128]`, que emite `start_logits` y `end_logits`. El resultado es un modelo con cero capas `nn.Linear` y cero `nn.Conv1d`.

El entrenamiento reportado en la model card es un protocolo de adaptacion de 200 pasos (seed 42, batch size 24, backbone_lr 1.8e-4) que descongela el ultimo bloque rotacional (`blocks[-1]`, 811.651 parametros), `final_norm` (128 parametros) y `qa_outputs` (523 parametros), sumando 812.430 parametros entrenables. No se especifica en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO. El tag `squad` sugiere uso de SQuAD, pero no se confirma el dataset exacto.

## Capacidades

- Question answering extractivo: devuelve los logits de inicio y fin de la respuesta sobre las posiciones del contexto.
- Extraccion de spans sobre contexto y pregunta concatenados en un unico prompt.
- Integracion con la libreria `transformers` mediante `AutoTokenizer` y `GRTForQuestionAnswering`.
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no especificados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Extraccion de respuestas en documentos estructurados: dado un parrafo de contexto y una pregunta, el modelo localiza el span exacto de respuesta, util para pipelines de extraccion de datos de contratos o formularios.
- Prototipado de sistemas de QA sobre bases documentales: al ser un modelo de 30M de parametros, permite iterar rapidamente en entornos con recursos limitados antes de escalar a modelos mayores.
- Investigacion en arquitecturas sin capas lineales: sirve como banco de pruebas para estudiar el comportamiento de cabezas cosenoidales y optimizadores geometricos en tareas supervisadas.
- Evaluacion comparativa de optimizadores: el ablation publicado permite reproducir y comparar ocho optimizadores geometricos sobre una tarea concreta de QA.
- Componente de un pipeline RAG ligero: puede usarse como extractor de respuestas sobre fragmentos recuperados cuando el coste computacional es critico.
- Educacion y demostraciones: su tamano reducido y su naturaleza "nativa rotacional" lo hacen adecuado para explicar arquitecturas alternativas en cursos o talleres.
- Fine-tuning sobre dominios especificos: con Apache 2.0 y un backbone pequeno, es viable adaptarlo a vocabularios y tareas de QA de nicho con pocos recursos.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card corresponden al ablation de optimizadores sobre la cabeza de QA, no a benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Optimizador | Final Train Loss | Val Span Loss | Exact Match (%) | Span Token F1 (%) | Start Acc (%) | End Acc (%) | Wall Time (200 pasos) |
|---|---|---|---|---|---|---|---|
| polar_natural_adam | 0.1385 | 0.6512 | 75.00 | 83.57 | 83.75 | 76.25 | 219.08 s |
| cyclide_adam | 0.1382 | 0.6520 | 75.00 | 83.57 | 83.75 | 76.25 | 225.19 s |
| pair_adam | 0.1383 | 0.6532 | 75.00 | 83.57 | 83.75 | 76.25 | 207.23 s |
| symplectic_adam | 0.1391 | 0.6537 | 75.00 | 83.57 | 83.75 | 76.25 | 261.38 s |
| huygens_symplectic_adam | 0.1391 | 0.6537 | 75.00 | 83.57 | 83.75 | 76.25 | 146.70 s |
| gyric_adam | 0.1393 | 0.6541 | 75.00 | 83.57 | 83.75 | 76.25 | 221.44 s |
| huygens_adam | 0.1378 | 0.6557 | 75.00 | 83.57 | 83.75 | 76.25 | 152.14 s |
| hessian_pair_adam | 0.1387 | 0.6506 | 73.75 | 83.39 | 83.75 | 75.00 | 232.96 s |
| Cabeza inicial (paso 0) | — | 8.9793 | 0.00 | 0.45 | 3.75 | 0.00 | — |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 29,8M de parametros, en fp32 ocupa aproximadamente 120 MB de pesos; en fp16 unos 60 MB; en int8 unos 30 MB. La VRAM total dependera del contexto y del batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (GTX 1060, RTX 3060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, holgadamente, en practicamente cualquier GPU con 1 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (libreria oficial), y potencialmente `vLLM`, `TGI` o `llama.cpp` si se generan conversiones, aunque no se documentan en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El modelo es muy pequeno, por lo que la latencia esperada es baja, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar ni de alternativas comparables documentadas en la informacion proporcionada. Como referencia de categoria, se trata de un modelo de QA extractivo de ~30M de parametros, una escala en la que existen modelos como DistilBERT o TinyBERT, pero no se aportan metricas comparativas en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-30M-QA | 29,8M | no disponible | EM 75,00% / F1 83,57% (ablation interno, 200 pasos) | Apache 2.0 | Hugging Face |
| DistilBERT-base (QA) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| TinyBERT (QA) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de muy reciente publicacion (creado el 2026-11-07) con 0 descargas y 0 likes: no hay validacion externa ni evidencia de robustez en produccion.
- Solo realiza QA extractivo: no genera texto libre, no razona de forma multi-paso ni soporta tool calling.
- No se especifican los idiomas soportados; el tag `squad` sugiere entrenamiento en ingles, pero no se confirma.
- No se documenta la longitud de contexto maxima, lo que limita su uso con documentos largos.
- Riesgo de alucinacion en el sentido de extraer spans incorrectos cuando la respuesta no esta en el contexto; el modelo siempre devuelve un span.
- Los benchmarks publicados corresponden a un ablation interno de 200 pasos, no a una evaluacion estandar completa; no son directamente comparables con resultados de SQuAD publicados por otros modelos.
- Discrepancia entre el recuento de parametros de la model card (29.306.020) y el de safetensors (29.845.119); conviene verificar antes de integrar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigacion sin validacion externa, su uso en produccion conlleva riesgo tecnico.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-qa
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
