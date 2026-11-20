# incoai/Muse-Glimmer-30B-DFlash2-GGUF

## Resumen

Muse-Glimmer-30B-DFlash2-GGUF es la conversión a formato GGUF del modelo borrador (draft model) DFlash 2 de Inco AI para el modelo objetivo `meta-models/Muse-Glimmer-30B`. No se trata de un modelo de lenguaje autónomo: funciona exclusivamente dentro de un servidor de decodificación especulativa, donde genera bloques de tokens candidatos que el modelo objetivo verifica y acepta o rechaza. Su propósito es acelerar la inferencia del modelo de 30B sin alterar la distribución de salida.

La innovación central es DFlash 2, un drafter de difusión por bloques que predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición; un selector ligero traza después una trayectoria coherente entre ellos. El backbone incorpora convoluciones dinámicas de dos tomas (two-tap) para evitar la degradación de la calidad del borrador hacia el final del bloque. La decodificación es sin pérdidas: en modo greedy la salida coincide exactamente con la del modelo objetivo y, en modo sampling, preserva su distribución.

El repositorio ofrece tres cuantizaciones (Q4_K_M, Q8_0 y BF16) con pesos que van de 1,6 GB a 5,5 GB, lo que permite desplegar el drafter en la misma máquina que el modelo objetivo con un coste de memoria adicional reducido. Está pensado para desarrolladores que ya sirven Muse-Glimmer-30B y quieren reducir la latencia por token mediante decodificación especulativa en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusión por bloques (block-diffusion) con selector de trayectoria de candidatos y convoluciones dinámicas de dos tomas; no es un transformer autoregresivo estándar |
| Parametros totales | 2.772.159.744 (2,77 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (1,6 GB), Q8_0 (2,9 GB), BF16 (5,5 GB) |
| Idiomas soportados | No disponible (hereda las capacidades del modelo objetivo, no declaradas en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo borrador diseñado específicamente para decodificación especulativa. En lugar de generar tokens de uno en uno, predice un bloque completo en una única pasada y mantiene los mejores candidatos en cada posición del bloque. Un selector ligero recorre después esos candidatos para construir una única secuencia coherente que se propone al modelo objetivo. Para contrarrestar la pérdida de calidad típica al final de los bloques generados en paralelo, el backbone utiliza convoluciones dinámicas de dos tomas que refuerzan la coherencia a lo largo de la secuencia.

El modelo se entrena como drafter del objetivo `meta-models/Muse-Glimmer-30B`; la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La propiedad clave del diseño es que la decodificación es sin pérdidas: con decodificación greedy la salida es idéntica a la del modelo objetivo, y con sampling se preserva la distribución del objetivo, de modo que el drafter solo afecta a la velocidad y no a la calidad del resultado. El modelo base DFlash se publicó en ICML 2026.

## Capacidades

- Generación de tokens candidatos por bloques para decodificación especulativa sobre Muse-Glimmer-30B.
- Predicción paralela de bloques completos con retención de múltiples candidatos por posición.
- Selección de trayectoria coherente mediante un selector ligero integrado en el pipeline de decodificación.
- Decodificación sin pérdidas: mantiene exactamente la salida greedy del objetivo y la distribución en sampling.
- Integración con llama.cpp mediante el tipo de especulación `draft-dflash` y el parámetro `--spec-draft-n-max`.
- No soporta tool calling, agentes, visión ni otras capacidades de forma autónoma: depende en su totalidad del modelo objetivo.
- Capacidades multilingües: no declaradas en la model card; vienen determinadas por el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción de Muse-Glimmer-30B: el drafter se sirve junto al modelo objetivo en llama.cpp con `--spec-type draft-dflash`, reduciendo el número de pasos de verificación por respuesta. Con una longitud de aceptación media de 5,45 tokens por paso (BF16), se traducen varios tokens generados por cada verificación del objetivo.
- Despliegue en GPUs de gama alta con presupuesto de VRAM ajustado: la cuantización Q4_K_M ocupa solo 1,6 GB, por lo que puede convivir con el modelo objetivo de 30B cuantizado en la misma GPU sin desplazar demasiado presupuesto de memoria.
- Servidores de chat interactivo de baja latencia: al reducir el número de pasos autorregresivos del modelo grande, disminuye el tiempo hasta el primer token completo y el tiempo por token percibido en conversaciones multi-turno.
- Evaluación comparativa de técnicas de decodificación especulativa: el repositorio incluye tres cuantizaciones con métricas de longitud de aceptación, lo que permite medir el compromiso entre tamaño del drafter y velocidad de aceptación en un hardware concreto.
- Pipelines de generación por lotes (batch) donde el coste dominante es la decodificación: la aceleración se aplica de forma transparente sin cambios en los prompts ni en los parámetros de sampling del objetivo.
- Entornos Apple Silicon: la compilación con `GGML_METAL=ON` permite usar el drafter en Mac con GPU integrada, donde la decodificación especulativa compensa el menor ancho de banda de memoria frente a GPUs dedicadas.

## Benchmarks y rendimiento

Evaluación publicada en la model card: objetivo `meta-models/Muse-Glimmer-30B-GGUF` en Q4_K_M, sampling con temperatura 1.0, top-p 0.95 y top-k 64, fuerza de razonamiento alta, máximo 2048 tokens nuevos, sobre los ocho primeros ejemplos del test de GSM8K.

| Draft GGUF | Longitud de aceptación |
|---|---|
| BF16 | 5,45 |
| Q8_0 | 5,58 |
| Q4_K_M | 5,44 |

La longitud de aceptación se define como la media por petición de tokens de completion dividida entre pasos de verificación; valores más altos son mejores. No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para el drafter, ya que su salida es equivalente a la del modelo objetivo por diseño.

## Requisitos de hardware

- VRAM adicional para el drafter: 1,6 GB (Q4_K_M), 2,9 GB (Q8_0) o 5,5 GB (BF16), sumados a la memoria del modelo objetivo Muse-Glimmer-30B.
- GPU recomendadas: NVIDIA A100 o H100 para servir el objetivo de 30B junto al drafter con holgura; RTX 4090 (24 GB) viable con el objetivo en Q4_K_M y el drafter en Q4_K_M o Q8_0.
- Cabe en GPU de consumo: sí, el drafter por sí solo cabe en cualquier GPU con más de 6 GB; el requisito real lo impone el modelo objetivo.
- Opciones de despliegue: llama.cpp con soporte DFlash 2 (PR #27342), compilado con `GGML_CUDA=ON` para NVIDIA o `GGML_METAL=ON` para Apple Silicon; servidor mediante `llama-server` con `-hfd` y `--spec-type draft-dflash`.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo reporta longitud de aceptación (5,44-5,58 tokens por paso de verificación), que es el factor determinante de la aceleración relativa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-DFlash2 (este) | Drafter de difusión por bloques para Muse-Glimmer-30B | 2,77 B | No disponible | Apache 2.0 | GGUF en HF (incoai y z-lab) |
| Muse-Glimmer-30B (objetivo) | Modelo de lenguaje completo | 30 B (aproximado por nombre) | No disponible | No disponible | HF (meta-models) |
| DFlash (original, ICML 2026) | Drafter de difusión por bloques | No disponible | No disponible | No disponible | Paper ICML 2026 |

No se dispone de datos de otros drafters comparables (por ejemplo, basados en EAGLE o Medusa) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento entre alternativas no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente un servidor de decodificación especulativa y el modelo objetivo Muse-Glimmer-30B; no puede usarse con `llama-cli` ni como generador independiente.
- Requiere una build específica de llama.cpp con soporte DFlash 2 (PR #27342); las versiones estándar no reconocen el tipo de especulación `draft-dflash`.
- Solo es compatible con el modelo objetivo para el que fue entrenado; no es un drafter genérico reutilizable con otros modelos.
- La ganancia de velocidad depende del hardware, del tipo de prompt y de la longitud de aceptación real; la métrica publicada se obtuvo sobre ocho ejemplos de GSM8K y puede no representar otros dominios.
- Sesgos y riesgo de alucinación: al preservar exactamente la distribución del objetivo, hereda los sesgos y alucinaciones de Muse-Glimmer-30B; el drafter no los corrige ni los introduce por sí mismo.
- Idiomas soportados no declarados en la model card; la cobertura lingüística efectiva es la del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo objetivo, que no se detalla en la información disponible.
- La fecha de creación del repositorio (2026) y la referencia a ICML 2026 indican que se trata de un artefacto reciente; la madurez del soporte en llama.cpp puede ser limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2-GGUF
- Modelo base del drafter (checkpoint original): https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2
- Modelo objetivo: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo objetivo en GGUF: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Espejo del repositorio: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de soporte DFlash 2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27342
- Paper DFlash (ICML 2026): Chen, Liang y Liu, "DFlash: Block Diffusion for Flash Speculative Decoding"
