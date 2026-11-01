# mesmac/MCL4-COE-v7-Granite-3.1-1B-NCM-MoE

## Resumen

MCL4-COE-v7-Granite-3.1-1B-NCM-MoE es un checkpoint experimental publicado por el usuario mesmac (mESmaC) que injerta varias modificaciones arquitectónicas sobre el modelo base ibm-granite/granite-3.1-1b-a400m-instruct de IBM. No se trata de un modelo entrenado desde cero, sino de un experimento de investigación que combina un cuantizador vectorial residual multiescala (NCM), un enrutador MoE adaptativo a escala y una atención dispersa basada en cadenas de Markov (MCL4), junto con un ensemble de operadores cognitivos (COE). El resultado es un modelo de 1.825.111.828 parámetros (1,77B según el autor) con 40 expertos y top_k=8.

El modelo aborda un problema de investigación: explorar si es posible dotar a un transformer pequeño de un mecanismo de compresión semántica discreta (codebooks residuales VQ-VAE) y de atención local estructurada que reduzca el coste computacional sin degradar la reconstrucción de tokens. Según la model card, en el paso 9.000 se alcanza una utilización del codebook del 77,78% y una precisión de reconstrucción del 85,35%, con un val_bpb de 0,7535 en validación held-out.

Es relevante ahora porque documenta una trayectoria de entrenamiento poco habitual (fase de validación de injerto con donante congelado y fase de expansión mitótica de expertos con GEMMs NVFP4), e incluye telemetría detallada por paso. Sin embargo, se trata de un artefacto de investigación con 46 descargas, sin pipeline declarado y sin benchmarks estándar publicados, por lo que su uso en producción no está validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Granite 3.1: 12 capas encoder + 12 capas decoder) con MoE de 40 expertos, atención dispersa Markov Chain Local-4 (MCL4) y cuantizador residual VQ-VAE multiescala (NCM) |
| Parametros totales | 1.825.111.828 (1,77B según el autor) |
| Parametros activos | top_k = 8 expertos de 40 (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | no disponible (el modelo base Granite 3.1 1B soporta 128K, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | NVFP4 para los GEMMs multi-experto; pesos publicados en safetensors (presumiblemente bfloat16, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El checkpoint parte de ibm-granite/granite-3.1-1b-a400m-instruct, un transformer con d_model=1024, 16 cabezas de atención, vocab_size=49155 y 12 capas de encoder más 12 de decoder. Sobre esta base se injertan tres componentes: (1) NCM, un VQ-VAE residual de 6 niveles con tamaños de codebook ℓ_k ∈ [1, 4, 11, 24, 41, 64] y V_k = 1024 códigos por nivel, anclado al donante congelado; (2) MCL4, una atención dispersa de grafo local que atiende 8 tokens ancla más 16 transiciones de Markov, es decir, 24 posiciones por paso; y (3) COE, un ensemble de 9 operadores cognitivos con softmax única.

El entrenamiento se documenta en dos fases. La fase 1 (pasos 5.000 a 5.500) valida el injerto NCM con el donante congelado, E=32 expertos y top_k=8, aplicando reinicio de códigos muertos normalizado por escala y normalización RMS de consulta al codebook; esto reduce la inflación de norma del codebook (de 0,7 a 19,6) y baja la entropía cruzada inicial del generador de 51,44 a 7,59. La fase 2 (pasos 5.500 a 9.000) expande mitóticamente de 32 a 40 expertos con 8 pares gemelos, acumulando 27,55M de tokens y 46.723.200 GEMMs NVFP4 multi-experto fusionados. La telemetría final reporta utilización de codebook del 77,78%, precisión de reconstrucción del 85,35%, ornith_pass_rate del 99,66% y val_bpb de 0,7535. No se especifica la composición del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje sobre la base instruct de Granite 3.1 1B.
- Reconstrucción de tokens mediante cuantización residual multiescala (85,35% de precisión reportada en el paso 9.000).
- Enrutamiento MoE adaptativo a escala con 40 expertos y top_k=8.
- Atención local estructurada MCL4 sobre 24 posiciones (8 anclas + 16 transiciones de Markov).
- Ensemble de 9 operadores cognitivos (COE) con softmax única.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (heredado potencialmente del base instruct, sin verificar).
- Capacidades de agente y razonamiento multi-paso: no confirmadas; la model card menciona "Dream-RSI revisions" y "dreamed replays" como parte del proceso de entrenamiento, no como capacidad de inferencia.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en compresión semántica discreta: el modelo sirve para estudiar cómo un VQ-VAE residual multiescala anclado a un donante congelado afecta a la reconstrucción de tokens y a la perplejidad, gracias a la telemetría por paso incluida.
- Experimentación con atención dispersa: MCL4 permite evaluar el impacto de limitar la atención a 24 posiciones estructuradas por Markov frente a atención densa en un transformer pequeño.
- Estudio de enrutamiento MoE adaptativo: con 40 expertos y top_k=8, es un banco de pruebas para analizar balanceo de carga y utilización de expertos en modelos de menos de 2B parámetros.
- Reproducción de trayectorias de entrenamiento: la model card documenta fases, pasos y métricas concretas, lo que facilita replicar el pipeline con el repositorio mcl4-coe-ncm.
- Evaluación de cuantización NVFP4 en GEMMs multi-experto: los 46.723.200 GEMMs fusionados reportados permiten estudiar el rendimiento de NVFP4 en hardware compatible.
- Prototipado educativo: al ser un modelo pequeño (1,77B) con licencia Apache 2.0, puede usarse en entornos académicos para ilustrar arquitecturas híbridas MoE + VQ + atención dispersa.
- Generación de texto instruct básica: hereda la capacidad instruct del base Granite 3.1 1B, aunque sin benchmarks que validen la calidad tras el injerto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente telemetría interna de entrenamiento:

| Metrica | Valor (Step 9,000) |
|---|---|
| ncm_codebook_utilization | 77,78% |
| ncm_recon_accuracy | 85,35% |
| ncm_vq_recon_loss | 0,6523 |
| ornith_pass_rate | 99,66% |
| ornith_rollout_reward | 0,9971 |
| val_bpb | 0,7535 |
| val_bpb_typed_decision | 0,4981 |
| val_bpb_uta_trace | 0,7763 |
| val_bpb_pretrain_lm | 1,0007 |

Estas métricas son específicas del pipeline del autor y no son comparables directamente con benchmarks públicos de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,7 GB solo para pesos (tamaño del repo), más overhead de activaciones y del sistema NCM; se recomienda al menos 8 GB.
- En NVFP4 (si se aplica en inferencia): la huella de pesos se reduciría aproximadamente a la mitad, aunque no se especifica soporte de inferencia NVFP4.
- GPU recomendadas: no disponibles en la información; por tamaño, cabría en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no está verificado.
- Opciones de despliegue: el quickstart oficial usa la librería propia mcl4_coe con safetensors y PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la arquitectura modificada probablemente no sea compatible con ellos sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MCL4-COE-v7-Granite-3.1-1B-NCM-MoE | 1,77B (40 expertos, top_k=8) | no disponible | Apache 2.0 | HuggingFace (46 descargas) |
| ibm-granite/granite-3.1-1b-a400m-instruct | ~1,3B (A400M) | 128K | Apache 2.0 | HuggingFace (oficial IBM) |
| Modelos MoE pequeños tipo Qwen1.5-MoE-A2.7B | 14,3B totales / 2,7B activos | 32K | Apache 2.0 | HuggingFace |

La comparación con alternativas MoE de tamaño similar es limitada porque el checkpoint es un experimento de investigación sin benchmarks públicos. El base Granite 3.1 1B es la referencia directa y cuenta con documentación y evaluación oficial de IBM.

## Limitaciones y advertencias

- Modelo de investigación con 46 descargas y 0 likes: no hay validación independiente de su calidad.
- Sin benchmarks estándar publicados; las métricas de la model card son internas y no comparables con MMLU, HumanEval o GSM8K.
- El pipeline no está declarado en HuggingFace, lo que dificulta el uso directo con transformers.
- Requiere la librería propia mcl4_coe del repositorio del autor; no es compatible de forma nativa con ecosistemas estándar como vLLM o llama.cpp.
- Idiomas soportados no especificados; no se puede garantizar comportamiento multilingüe.
- Longitud de contexto no confirmada para este checkpoint (aunque el base soporte 128K).
- Riesgo de alucinación inherente a modelos de 1,77B, potencialmente agravado por las modificaciones arquitectónicas no evaluadas.
- Sesgos conocidos: no documentados; se heredan potencialmente los del base Granite 3.1 1B.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- La telemetría incluye términos no estándar ("ornith_pass_rate", "Dream-RSI") sin definición pública en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mesmac/MCL4-COE-v7-Granite-3.1-1B-NCM-MoE
- Repositorio de código y documentación técnica: https://github.com/mESmaC/mcl4-coe-ncm
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-instruct
