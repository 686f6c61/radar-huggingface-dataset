# DuoNeural/CDM-Sub-Lattice-v3-18M

## Resumen

CDM-Sub-Lattice-v3-18M es un modelo de lenguaje de investigación desarrollado por DuoNeural (Jesse Caldwell y "Archon") dentro de la serie Sub-Lattice v3, un conjunto de ablaciones centradas en geometría hiperbólica y dinámica de τ* aplicadas a modelos de mezcla de expertos (MoE). Se trata de un "Crystallographic Dynamics Model" (CDM): un transformer MoE de 3 capas que opera sobre la bola de Poincaré en lugar del espacio euclídeo, con 8 slots EMA por capa y 2 expertos por capa. Aunque el nombre comercial indica 18M, el recuento real de pesos en safetensors es de 30.422.264 parámetros (~30,4M), un dato que conviene tener en cuenta al compararlo con otros modelos.

El modelo se entrenó por destilación de conocimiento a partir de SmolLM2-360M-Instruct sobre un dataset híbrido (50% FineWeb-Edu, 50% SmolTalk/APigen), durante 100.000 pasos y en una única GPU AMD Radeon RX 7700S bajo ROCm. Su relevancia no es la de un modelo de producción: es un artefacto de investigación que documenta un cruce del horizonte de Lyapunov τ* por encima del escalón de Hamming 2²¹ = 2.097.152 en la capa L01, además de una ley de curvatura creciente de UV a IR entre capas (c≈0,26 → 0,27 → 0,32).

Por tanto, la ficha debe leerse como la de un banco de pruebas reproducible de geometría hiperbólica y control dinámico del learning rate (DHP), no como la de un asistente listo para desplegar. Solo está entrenado y evaluado en inglés, la licencia es Apache-2.0 y no se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K); las únicas métricas disponibles son de perplexidad y de dinámica interna del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hiperbólico (CDM), geometría de bola de Poincaré, 3 capas, 8 slots EMA (K) por capa, 2 expertos por capa |
| Parametros totales | 30.422.264 (~30,4M, según safetensors; el nombre del modelo indica 18M) |
| Parametros activos | no disponible (el autor no publica el reparto de activación por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar; no hay GGUF/AWQ/GPTQ publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| d_model | 256 |
| d_ff | 768 |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 3 capas con d_model = 256 y d_ff = 768, en el que cada capa mantiene 8 slots EMA (K = 8) y 2 expertos. La innovación central es que las representaciones y el enrutamiento se calculan en la bola de Poincaré en lugar de en un espacio euclídeo, lo que introduce curvatura negativa explícita en el manifold. El autor añade dos mecanismos propios: "Crystal Telepathy", que mantiene una norma de telemetría de routing (tele_norm ≈ 15–29 durante todo el run) como señal de coherencia del enrutamiento, y DHP (Dynamical Horizon Principle), un controlador adaptativo del learning rate que actúa sobre AdamW.

El entrenamiento consistió en destilación desde HuggingFaceTB/SmolLM2-360M-Instruct sobre un corpus híbrido al 50% entre FineWeb-Edu y SmolTalk/APigen, durante 100.000 pasos, en una AMD Radeon RX 7700S (6,27 TFLOPS) con ROCm 6.x. No se documenta el número total de tokens procesados ni el uso de RLHF o DPO. El resultado declarado es un BPB final de 0,9688 (mejor valor, en el paso 89.000) y una perplejidad de ~19,41.

El mecanismo DHP merece explicación aparte: τ* se define como el horizonte de predictibilidad de Lyapunov del centroide de cada slot EMA, y el controlador dispara ajustes del learning rate cuando τ* cruza un escalón de Hamming 3-smooth (de la forma 2^a × 3^b), interpretado como una transición de fase en el manifold de routing. En esta ejecución, L01 alcanzó τ* = 2.245.000, superando el escalón 2²¹ en el paso 99.500, y L00 se quedó en 1.887.000.

## Capacidades

- Generación de texto en inglés a nivel de modelo pequeño destilado de 360M, con calidad esperable de un modelo de ~30M parámetros.
- Modelado de lenguaje causal estándar (predicción de siguiente token) entrenado sobre mezcla de web educativa y datos conversacionales/instrucciones.
- Enrutamiento MoE con 2 expertos por capa y 8 slots EMA: capacidad de estudiar patrones de especialización por slot.
- Representaciones en geometría hiperbólica (bola de Poincaré), útiles para experimentos de embedding jerárquico.
- Control dinámico del learning rate vía DHP con telemetría de τ* por capa.
- Soporte de tool calling / function calling: no disponible (no se documenta ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés; no se reporta evaluación en otros idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Reproducción de ablaciones de geometría hiperbólica: el modelo sirve como punto de partida para replicar la serie Sub-Lattice v3 y comparar el efecto de la curvatura por capa (c≈0,26 / 0,27 / 0,32) frente a una línea base euclídea.
- Investigación sobre destilación de conocimiento: permite estudiar la transferencia desde un profesor de 360M (SmolLM2-360M-Instruct) a un estudiante MoE de ~30M con solo 3 capas, usando BPB y PPL como métricas de seguimiento.
- Experimentos de control dinámico del learning rate: el código de DHP y la telemetría de τ* permiten validar si los cruces de escalones de Hamming 3-smooth correlacionan con mejoras de pérdida en otras arquitecturas.
- Análisis de coherencia de enrutamiento en MoE: con 2 expertos y 8 slots EMA por capa, es un banco de pruebas barato para instrumentar tele_norm y detectar colapso de expertos.
- Inferencia en hardware muy limitado: con ~30M parámetros, el modelo cabe holgadamente en CPU, Raspberry Pi o GPUs integradas, lo que lo hace útil para demos docentes de generación de texto en inglés sin infraestructura dedicada.
- Pruebas de humo (smoke tests) de pipelines de entrenamiento: su reducido tamaño y su ejecución verificada en ROCm 6.x con una RX 7700S lo convierten en un caso de test para validar flujos de entrenamiento en GPUs AMD antes de escalar.
- Docencia sobre modelos generativos: ilustra de forma compacta conceptos de MoE, destilación, geometría hiperbólica y control adaptativo sin requerir clústeres.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`), por lo que no hay MMLU, HumanEval, GSM8K ni evaluaciones estándar publicadas. Las únicas métricas declaradas son de entrenamiento y de dinámica interna:

| Metrica | Valor |
|---|---|
| BPB final | 0,9688 |
| Mejor BPB | 0,9688 (paso 89.000) |
| Perplejidad final | ~19,41 |
| τ* máximo en L01 | 2.245.000 (cruza 2²¹ = 2.097.152 en el paso 99.500) |
| τ* máximo en L00 | 1.887.000 |
| tele_norm (rango durante el run) | ~15–29 |
| Ley de curvatura por capa | L00 (c≈0,26) < L01 (c≈0,27) < L02 (c≈0,32) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. En FP32 los 30,4M de parámetros ocupan ~122 MB; en BF16/FP16, ~61 MB; en int8, ~30 MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1650, una iGPU o incluso CPU sirven.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en la mayoría de generaciones anteriores. El entrenamiento documentado se realizó en una AMD Radeon RX 7700S (6,27 TFLOPS) con ROCm 6.x.
- Opciones de despliegue: transformers (formato nativo safetensors) es la vía directa. vLLM o TGI son compatibles en teoría pero desproporcionados para este tamaño. llama.cpp/Ollama requerirían convertir los pesos a GGUF, conversión que el autor no publica y que puede no estar soportada para la arquitectura MoE hiperbólica personalizada.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CDM-Sub-Lattice-v3-18M | 30,4M (reales) | no disponible | BPB 0,9688 / PPL ~19,41 (no comparable con benchmarks estándar) | Apache-2.0 | HuggingFace, safetensors |
| SmolLM2-360M-Instruct (profesor) | 360M (según nombre del modelo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| SmolLM2-135M | 135M (según nombre del modelo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Qwen2.5-0.5B | 0,5B (según nombre del modelo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

La comparación con estos modelos es solo orientativa en términos de orden de magnitud: el CDM es entre 4 y 16 veces más pequeño que los candidatos de la tabla y no ha sido evaluado con los mismos protocolos, por lo que no existe una comparación de rendimiento válida.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con RLHF ni DPO según la documentación, por lo que no cabe esperar alineación conversacional ni rechazo de peticiones dañinas.
- Riesgo de alucinación elevado: con ~30M parámetros y solo 3 capas, la fidelidad factual es muy limitada incluso en inglés.
- Idiomas: únicamente inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: el autor no publica la ventana de contexto, lo que impide planificar cargas multi-turno o documentos largos.
- Discrepancia de nombre: la etiqueta "18M" no coincide con los 30.422.264 parámetros reales; conviene usar el recuento de safetensors en cualquier comparación.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K, de modo que no se puede afirmar nada sobre razonamiento, código o matemáticas.
- Arquitectura no estándar: la geometría de Poincaré, los slots EMA y DHP probablemente requieren código personalizado del autor; la carga directa con `AutoModelForCausalLM` puede no funcionar y no se enlaza repositorio de código.
- Ecosistema de despliegue limitado: sin GGUF ni cuantizaciones publicadas, las rutas tipo llama.cpp/Ollama no están garantizadas.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero al ser un artefacto de investigación sin garantías de calidad, no se recomienda su uso en producción orientada a usuarios.
- Fechas y nomenclatura del proyecto (octubre de 2026, términos como "kilonova" o "crystal telepathy") son idiosincrásicas del autor y no corresponden a terminología estándar de la literatura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/CDM-Sub-Lattice-v3-18M
- Paper de DHP (Dynamical Horizon Principle): https://zenodo.org/records/20142471
- Modelo profesor (SmolLM2-360M-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Contacto del autor: archon@agentmail.to / duoneural@proton.me (según model card; no se enlaza repositorio de código ni demo)
