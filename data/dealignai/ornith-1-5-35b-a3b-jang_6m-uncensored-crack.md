# dealignai/Ornith-1.5-35B-A3B-JANG_6M-UNCENSORED-CRACK

## Resumen

Ornith 1.5 35B — UNCENSORED CRACK es una adaptación del modelo open‑source Ornith‑1.5‑35B‑A3B, desarrollada por el equipo dealignai, que elimina el comportamiento de rechazo (refusal) a nivel de pesos mediante técnicas de abliteration. El modelo resultante sigue instrucciones en todas las categorías sin negarse, manteniendo sus capacidades de razonamiento, visión, video y coding. Se distribuye como un bundle MLX en cuantización mixta de 6 bits, optimizado para Apple Silicon, con un contexto de 262.144 tokens.

La relevancia de este modelo radica en su doble naturaleza: por un lado, sirve como herramienta para investigación en seguridad de IA (evaluación de alineación, pruebas de adversario autorizadas) y, por otro, ofrece un rendimiento competitivo en tareas de visión‑lenguaje y agentic coding. Su arquitectura MoE con 3B de parámetros activos lo hace relativamente eficiente en inferencia, mientras que la eliminación del refusal lo convierte en un caso de estudio para la comunidad de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE vision‑language (40 capas, 256 expertos enrutados, backbone híbrido gated‑delta + full‑attention, torre de visión de 27 capas, video nativo) |
| Parámetros totales | 35,9B (modelo base) / 8,17B en el bundle cuantizado (según safetensors) |
| Parámetros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 6‑bit mixed‑precision (formato MLX) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Ornith‑1.5‑35B‑A3B, pertenece a la familia Ornith‑1.5, que extiende el concepto de *self‑scaffolding* hacia un bucle completo de *self‑improvement*. Su arquitectura combina un backbone de atención completa con un módulo gated‑delta, y una torre de visión de 27 capas que permite procesar imágenes y video de forma nativa. El modelo abre cada respuesta con un bloque de razonamiento (`thinking`) que puede desactivarse mediante `enable_thinking`.

La versión *uncensored* se ha obtenido mediante abliteration: se elimina el comportamiento de rechazo a nivel de pesos sin usar hooks en tiempo de ejecución ni vectores de dirección. La cuantización a 6‑bit mixed‑precision se realizó para MLX, preservando la calidad de los pesos mediante una asignación de precisión por módulo. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- **Razonamiento**: activado por defecto, con bloque `thinking` antes de la respuesta final; se puede desactivar.
- **Visión**: soporta imágenes mediante el procesador incluido.
- **Video**: soporte nativo con preprocesador específico.
- **Tool calling**: compatible con esquemas XML / function schema.
- **Agentic coding**: puede utilizarse como agente de código en flujos multi‑paso.
- **Contexto largo**: ventana de 262.144 tokens, adecuada para documentos extensos o conversaciones largas.
- **Capacidades multilingües**: no disponible (solo inglés declarado).
- **Uncensored**: sin comportamiento de rechazo, sigue instrucciones en todas las categorías.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo permite evaluar la eficacia de las técnicas de abliteration, medir la compliance en benchmarks de seguridad como HarmBench, y estudiar la alineación de modelos sin barreras de rechazo. Es útil para equipos de seguridad autorizados.
- **Pruebas de penetración y red teaming**: dado que no rechaza solicitudes, puede usarse para generar ataques sintéticos o evaluar defensas en entornos controlados, siempre bajo cumplimiento legal y ético.
- **Análisis de imágenes y video**: su torre de visión de 27 capas y soporte nativo de video permiten describir escenas, extraer información de capturas o transcribir contenido audiovisual.
- **Generación de código en producción**: con razonamiento activo y tool calling, puede integrarse en pipelines de CI/CD para generar código, documentación o pruebas unitarias. La cuantización de 6 bits mantiene un rendimiento cercano al modelo base.
- **Asistentes de documentación técnica**: el contexto de 262K permite procesar manuales extensos, repositorios completos o conversaciones largas para resumir o responder preguntas específicas.
- **Aplicaciones de chat sin filtros de contenido**: en entornos controlados y legales, puede utilizarse para simular usuarios con distintos comportamientos o para entrenar clasificadores de seguridad.

## Benchmarks y rendimiento

El autor proporciona resultados medidos sobre este bundle exacto:

| Métrica | Valor |
|---|---|
| MMLU (57 materias) | 81,8% (base 81,8%, Δ -0,09) |
| HarmBench compliance | 97,9% (235/240) |
| KL vs uncracked MXFP8 | 0,1377 nats |

**MMLU por categoría (base vs uncensored)**

| Categoría | Base | Uncensored | Δ |
|---|---:|---:|---:|
| STEM | 76,8% | 76,3% | -0,5 |
| Humanidades | 83,5% | 84,6% | +1,2 |
| Ciencias sociales | 88,8% | 89,6% | +0,8 |
| Otros | 81,2% | 79,6% | -1,5 |
| **Total (57 subj)** | **81,8%** | **81,8%** | **-0,09** |

No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el bundle ocupa ~28 GB (30,2 GB en el repo), por lo que se requiere una GPU con al menos 32 GB de memoria para cargar el modelo completo.
- **GPUs compatibles**: diseñado para Apple Silicon (M‑series). Se recomienda un Mac con 32 GB de RAM unificada o superior (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, etc.).
- **Despliegue**: funciona con [vMLX](https://vmlx.net) (recomendado, respeta overrides de precisión por módulo) o con un runtime MLX‑VLM con soporte para arquitectura `qwen3_5_moe`.
- **Latencia/throughput**: no disponible; dependerá del hardware específico y de la longitud de contexto.
- **Alternativas en GPU NVIDIA**: el formato MLX no es compatible directamente con CUDA; sería necesario convertir el modelo a otros formatos (p.ej. safetensors estándar) para ejecutarlo en vLLM o TGI, aunque no se ha confirmado su soporte.

## Comparativa con modelos similares

No hay datos comparativos directos publicados en la información disponible. Como referencia arquitectónica, el modelo comparte similitudes con **Qwen3‑30B‑A3B** (MoE con ~3B activos, contexto 262K), pero no se dispone de resultados comparativos de benchmarks entre ambos.

| Modelo | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ornith‑1.5‑35B‑A3B (uncensored) | 3B | 262K | Apache 2.0 | MLX (6‑bit) |
| Qwen3‑30B‑A3B (referencia) | 3B | 262K | Apache 2.0 | safetensors/GGUF |

No se dispone de datos de rendimiento de Qwen3‑30B‑A3B en la información consultada.

## Limitaciones y advertencias

- **Riesgo de uso indebido**: el modelo no tiene comportamiento de rechazo; puede generar contenido inapropiado, peligroso o ilegal si se usa sin control. El autor lo publica para investigación en seguridad y pruebas autorizadas.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos públicos, es probable que presente sesgos sociales y culturales.
- **Alucinación**: como cualquier modelo generativo, puede inventar información, especialmente en temas técnicos o de actualidad.
- **Idioma**: solo se ha declarado soporte para inglés; su rendimiento en otros idiomas puede ser limitado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor advierte que el usuario es responsable de cumplir las leyes aplicables.
- **Despliegue en producción**: al ser un bundle MLX específico para Apple Silicon, no es directamente desplegable en entornos con GPUs NVIDIA estándar; se necesita convertir el modelo o usar runtimes compatibles.
- **Calidad de cuantización**: la cuantización de 6 bits puede introducir degradación en tareas muy sensibles a la precisión, aunque la KL divergence medida es baja (0,1377 nats).

## Enlaces

- [Hugging Face: dealignai/Ornith-1.5-35B-A3B-JANG_6M-UNCENSORED-CRACK](https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-JANG_6M-UNCENSORED-CRACK)
- [Hugging Face: ornith-ai/Ornith-1.5-35B-A3B (modelo base)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Página de Ornith‑1.5 (ornith.ai)](https://ornith.ai/ornith_1_5.html)
- [BenchLM: Ornith-1.5-35B-A3B](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [ModelScope: Ornith-1.5-35B-A3B](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [vMLX (runtime recomendado)](https://vmlx.net)
