# emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer

## Resumen

Ternary Bonsai 2 27B Uncensored Heretic (NInfer) es un artefacto nativo del motor NInfer en formato `.ninfer` que empaqueta en un único fichero de 9,5 GB la variante decensurada del modelo Ternary Bonsai 2 27B, con torre de visión Qwen3.8-27B, cabeza MTP y el stack completo de decodificación especulativa DFlash2. Lo publica el usuario emiltsoi sobre los pesos de OS-Software (decensurado Heretic aplicado sobre la retícula ternaria de PrismML) y la torre de visión del checkpoint oficial de Qwen. Cubre un hueco del ecosistema: hasta ahora la versión sin censura de Bonsai 2 solo existía en GGUF/MLX, formatos que ninguna build de NInfer puede cargar y que además no ofrecen DFlash2.

El modelo deriva de Qwen3.8-27B y conserva su pipeline `image-text-to-text`, por lo que acepta entradas de imagen y texto. Los pesos del lenguaje están cuantizados en ternario (`t2_g128_fp16`), mientras que la torre de visión va en Q4/Q5 y los controles GDN en BF16/FP32. El resultado es un modelo de 27B nominales que ocupa unos 8 GiB de pesos en disco y se sirve en unos 19 GiB de VRAM con una ventana de contexto de hasta 1.048.576 tokens.

Su relevancia es doble: por un lado, demuestra que la decodificación especulativa DFlash2 sobrevive intacta al decensurado (aceptación de borradores del 25-30 %, sin penalización de throughput frente al artefacto oficial v3); por otro, ofrece un modelo sin capa de seguridad para entornos donde el rechazo del modelo base es un problema. Es un artefacto de nicho, orientado a GPUs de consumo de gama alta (RTX 3090/4090/5090) y al motor NInfer consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con proyecciones ternarias `t2_g128_fp16`, controles GDN en BF16/FP32, torre de visión Qwen3.8-27B (27 bloques + merger), cabeza MTP y stack DFlash2 (proyección de features, 5 capas draft, kernels conv, codebooks del selector de candidatos, cabeza de propuesta ternaria) |
| Parametros totales | 27B nominales (modelo base Ternary Bonsai 2 27B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (`--max-context 1048576`); ventana fiable recomendada ~500.000-700.000 tokens |
| Tipos de cuantizacion | pesos del lenguaje ternarios `t2_g128_fp16`; torre de visión Q4/Q5; controles GDN BF16/FP32; KV cache `rk4v4-e8` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto nativo NInfer, 1.193 objetos, 9.520.051.456 bytes); modelos base disponibles en GGUF y MLX |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.8-27B cuyos pesos de lenguaje se han cuantizado a ternario con granularidad de grupo de 128 y escala FP16 (`t2_g128_fp16`). Sobre esa base, OS-Software aplicó un LoRA de decensurado (Heretic) directamente sobre los códigos ternarios, tocando 34 de las 851 matrices. El artefacto añade la torre de visión del checkpoint oficial de Qwen3.8-27B sin cuantizar, el tokenizador, la plantilla de chat y los preprocesadores de medios, más una cabeza MTP de ProCreations y el adaptador DFlash2 del mismo autor.

La innovación técnica principal es la integración de decodificación especulativa DFlash2 (con 5 capas draft y selector de candidatos) sobre pesos editados ternarios, algo que los formatos GGUF/MLX no permiten. La conversión se realizó con la receta `bonsai2_27b_ternary` de `iamwavecut/ninfer-3090`, la misma que produjo el artefacto oficial `WaveCut/Ternary-Bonsai-2-27B-NInfer-v3`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con ventanas de contexto muy largas (hasta 1M tokens nominales).
- Procesamiento de imagen y texto (`image-text-to-text`): torre de visión Qwen3.8-27B integrada, con residencia en overlay y fusión hasta 12.288 tokens.
- Decodificación especulativa DFlash2 con 7 tokens de borrador y aceptación del 25-30 % dependiente del contenido.
- Predicción multi-token (MTP) mediante cabeza dedicada.
- Comportamiento decensurado: responde a peticiones que el artefacto oficial rechaza (verificado por el autor).
- No se documentan en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso ni modo thinking; el ejemplo de lanzamiento incluye `thinking off`, lo que sugiere que el modelo base sí contempla un modo thinking, pero no se detalla su comportamiento en este artefacto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional sin filtros en investigación: el modelo responde a prompts que el artefacto oficial rechaza, lo que lo hace útil para estudiar comportamiento de modelos decensurados, análisis de sesgos o generación de contenido creativo sin restricciones, siempre con controles de acceso propios.
- Procesamiento de documentos largos con imagen: gracias a la ventana de hasta 1M tokens y a la torre de visión, se puede usar para resumir expedientes, informes escaneados o contratos con gráficos adjuntos en una sola pasada, tratando ~500-700K tokens como rango fiable.
- Servicio de inferencia de alta velocidad en GPU de consumo: con 325-327 tok/s de decodificación en RTX 5090 y prefill de 5.850-6.950 tok/s en prompts de 4K-30K, es adecuado para chat interactivo o generación de texto en lote en una única RTX 3090/4090/5090.
- Prototipado de pipelines multimodales: la integración de visión, MTP y decodificación especulativa en un solo fichero simplifica el despliegue de demos de image-text-to-text sin gestionar varios artefactos.
- Evaluación de decodificación especulativa sobre pesos editados: sirve como banco de pruebas para medir la aceptación de DFlash2 tras un fine-tuning LoRA sobre la retícula ternaria, con métricas de perplexity (5,876 en `ninfer-ppl-1m`) comparables al artefacto oficial (5,855).
- Generación creativa y role-play sin rechazos: el decensurado permite conversaciones de ficción, guiones o narrativa con temáticas que el modelo base declina, en entornos controlados y con políticas de uso definidas por el operador.
- Inferencia con concurrencia limitada en una sola GPU: la configuración de ejemplo (`--max-concurrency 2`, `--kv-capacity 1048576`) permite atender dos sesiones simultáneas con contexto completo en ~19 GiB de VRAM.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5090 (build sm_120a, KV `rk4v4-e8`, ventana de 1.048.576 tokens, thinking off), comparadas con el artefacto oficial v3 en el mismo harness:

| Metrica | Este artefacto | Official v3 |
|---|---|---|
| Arranque | 3,9 s (pesos 7,99 GiB a 7,9 GiB/s) | 2,5 s |
| Huella en runtime | 19,1 GiB (incl. ~10 GiB KV + overlay de visión) | 19,1 GiB |
| Prefill | 5.850-6.950 tok/s en profundidad (prompts de 4K-30K); ~1.000 tok/s en prompts cortos | mismo orden |
| Decode (DFlash2, runs de 3.000+ tokens) | 325-327 tok/s | 296-343 tok/s |
| Aceptación de borradores DFlash2 | ~25-30 % (dependiente del contenido) | ~25-32 %, sin penalización |
| Visión | correcta en imagen de prueba, ~313 tok/s | igual |
| Comportamiento decensurado | verificado; responde a prompts que el oficial rechaza | rechaza |
| Calidad | 5,876 ppl en `ninfer-ppl-1m` (+0,35 % vs oficial) | 5,855 |

El autor advierte que el artefacto está probado con smoke tests y no con una suite de evaluación completa: no se reclaman números de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~19,1 GiB en runtime con ventana de 1M tokens y overlay de visión (incluye ~10 GiB de KV cache); los pesos ocupan 7,99 GiB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090 o RTX 5090 (clase consumer de gama alta); el autor indica ≥20 GiB libres para la configuración de ejemplo. En tarjetas menores se puede reducir `--kv-capacity` y el contexto.
- Cabe en GPU consumer: sí, en RTX 3090/4090/5090 con la configuración indicada; no se documenta soporte para GPUs de menos VRAM ni para CPU.
- Despliegue: exclusivamente mediante la línea consolidada de NInfer (`iamwavecut/ninfer-3090` o builds descendientes); las releases upstream de `ninfer` no decodifican pesos `t2_g128_fp16`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 5.850-6.950 tok/s en profundidad y ~1.000 tok/s en prompts cortos; decode de 325-327 tok/s con DFlash2 (7 tokens de borrador); visión a ~313 tok/s; arranque de 3,9 s.
- Concurrencia: `--max-concurrency 2` en la configuración de ejemplo; `--gdn-state-fp16` para el estado GDN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer (este) | 27B nominales, ternario | 1.048.576 tokens (fiable ~500-700K) | 325-327 tok/s decode en RTX 5090; 5,876 ppl; sin benchmarks estándar | Apache-2.0 | Artefacto `.ninfer` en HF; requiere motor NInfer consolidado |
| WaveCut/Ternary-Bonsai-2-27B-NInfer-v3 (oficial) | 27B nominales, ternario | 1.048.576 tokens | 296-343 tok/s decode; 5,855 ppl; rechaza prompts sensibles | Apache-2.0 | Artefacto `.ninfer` oficial; mismo motor |
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 27B nominales, ternario | no disponible | no disponible; sin DFlash2 | Apache-2.0 | GGUF/MLX; no cargable en NInfer |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27B nominales, ternario | no disponible | no disponible | Apache-2.0 | GGUF; modelo base sin decensurar |

## Limitaciones y advertencias

- Sin capa de seguridad: el modelo está deliberadamente decensurado y responderá a peticiones que el modelo oficial rechaza. El despliegue debe implementar sus propios controles de acceso y políticas; nada en los pesos las aplica.
- Retrieval degradado al final de la ventana de 1M tokens, heredado del modelo base; el autor recomienda tratar ~500-700K tokens como ventana fiable.
- Solo probado con smoke tests: no hay resultados de suites de evaluación estándar ni de perplexity más allá del corpus rápido `ninfer-ppl-1m` (5,876 ppl).
- Dependencia estricta del motor: solo funciona con la línea consolidada de NInfer (`iamwavecut/ninfer-3090` o descendientes); las releases upstream no decodifican los pesos ternarios.
- Requiere GPU NVIDIA con ≥20 GiB libres para la configuración de referencia; no se documenta soporte CPU ni GPUs de menor VRAM sin recortar contexto.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales del modelo base Qwen3.8-27B.
- Sesgos conocidos: no documentados en la información disponible; el decensurado puede amplificar respuestas sesgadas o inapropiadas.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de la del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros traslada al operador toda la responsabilidad legal y ética sobre el contenido generado.
- Verificar la integridad del artefacto con `SHA256SUMS` antes de servirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer
- Modelo base decensurado (GGUF): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabeza MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Adaptador DFlash2: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Motor NInfer consolidado: https://github.com/iamwavecut/ninfer-3090
- Artefacto oficial de referencia: https://huggingface.co/WaveCut/Ternary-Bonsai-2-27B-NInfer-v3
