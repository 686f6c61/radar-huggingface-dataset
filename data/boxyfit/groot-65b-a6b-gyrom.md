# BoxyFit/Groot-65B-A6B-GyroM

## Resumen

Groot-65B-A6B — Gyro-M (TQ2_T) es una re-cuantización del modelo MoE Groot-65B-A6B-261023 publicada por BoxyFit. El pack re-codifica los expertos enrutados del modelo original a un formato propietario de cuantización por trellis (TQ2_T, 2,25 bpw) codificado desde el teacher oficial en FP8, y se distribuye junto con una tabla de lookup N-gram en Q5_0 y los tensores densos y embeddings copiados literalmente del GGUF oficial Q4_K_M. El objetivo declarado es reducir el espacio de VRAM necesario para servir el modelo en GPUs de consumo sin degradar la calidad de forma apreciable.

El modelo base es un MoE de 116.514.464.640 parámetros totales (según safetensors) con 6B de parámetros activos por token, lo que lo sitúa en la categoría de modelos grandes con coste de inferencia reducido. El pack completo ocupa 54,5 GB en disco, pero el desglose es clave: el expool de expertos enrutados cuantizados suma 16,0 GB, la tabla de lookup 35,2 GB (que nunca se carga en VRAM) y los tensores densos y embeddings unos 1,5 GB. En una RTX 3090 con 24 GB, el modelo queda completamente residente en 20,2 GB y alcanza 120 t/s en decodificación en contexto caliente.

La relevancia actual del pack reside en su motor de inferencia, Strata, que implementa una caché de expertos guiada por el router (routing-aware) en lugar de una política reactiva como LRU. Esto permite que, incluso con una capa caliente reducida (por ejemplo, 2,9 GiB en una GPU de 8 GB), el modelo siga rindiendo decenas de t/s porque el fallo de caché solo implica una transferencia PCIe de ~1,3 MB por experto. La licencia declarada es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; detalles de capas y atención no disponibles |
| Parametros totales | 116.514.464.640 |
| Parametros activos | ~6B (indicado en el nombre A6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_T (2,25 bpw) para expertos enrutados; Q5_0 para tabla de lookup N-gram; Q4_K_M para tensores densos y embeddings |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name: other) |
| Formato de pesos | Trellis (pack propietario de Strata); no es GGUF estándar ni safetensors puro |

## Arquitectura y entrenamiento

El modelo base Groot-65B-A6B-261023 es un transformer con arquitectura Mixture of Experts: 116.500 millones de parámetros totales y aproximadamente 6.000 millones activos por token, lo que implica un router que selecciona un subconjunto de expertos en cada paso. El pack Gyro-M no reentrena el modelo; re-codifica únicamente los pesos de los expertos enrutados desde el teacher oficial en FP8 a trellis TQ2_T (2,25 bits por peso), manteniendo intactos los tensores densos, embeddings y la tabla de lookup N-gram, que se copian literalmente del GGUF oficial Q4_K_M y Q5_0 respectivamente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica del pack no está en el modelo sino en el motor Strata: la caché de expertos predice a partir del router antes de que se produzca el fallo, con una tasa de acierto medida del 85,9 %, y pre-rellena desde un perfil aprendido. Esto contrasta con las políticas reactivas de llama.cpp (LRU y, desde noviembre de 2026, ClassLRU, un híbrido de recencia y frecuencia en 8 clases). El resultado medido es una diferencia de rendimiento de aproximadamente 1,7x en decodificación y más de 10x en prefill frente a llama.cpp con caché de expertos en una GPU de 16 GB, atribuible al motor y no a los bits.

## Capacidades

- Generación de texto conversacional y de base, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento multi-paso y modo thinking: los benchmarks de HumanEval y MBPP se han medido con thinking activado, temperatura 0 y 0-shot.
- Generación de código: los resultados de HumanEval pass@1 y MBPP pass@1 se reportan en la model card como validación de calidad tras la cuantización.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente: no confirmadas explícitamente; el modelo base es un MoE grande con razonamiento, pero no hay documentación de agentes en el pack.
- Capacidades multilingües: no disponibles; la model card no lista idiomas.
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente text-generation.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integración con infraestructura de inferencia estándar, aunque el pack requiere el motor Strata para TQ2_T (id 144 no es un tipo upstream de llama.cpp).

## Casos de uso

- Servicio de código en GPUs de consumo: con 120 t/s en una RTX 3090 y HumanEval/MBPP medidos en el pack, se puede desplegar un asistente de programación local con latencia interactiva sin depender de APIs en la nube. La caché routing-aware mantiene la tasa de acierto alta en cargas de código, que son más concentradas que un corpus amplio.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: en una V100-16, RX 6800 o RTX 4060 Ti 16 GB, el pack mantiene 80–95 t/s con una capa caliente del 65 % del expool y una tasa de acierto del 89–98 % en el bench de código. Es adecuado para entornos de desarrollo con presupuesto de hardware limitado.
- Servidor de bajo coste con hardware de segunda mano: una Tesla V100-32 usada (~500 USD) ejecuta el pack completamente residente a 90 t/s con 12 GB de VRAM libres, lo que permite montar un servidor de inferencia Groot por una fracción del coste de una Blackwell de 72 GB.
- Atención al cliente y chat multi-turno: la tabla de lookup N-gram de 35,2 GB se mantiene en RAM de host y solo se toca esporádicamente (5,7 GB medidos tras uso real), lo que permite conversaciones largas con KV cache caliente a 120–124 t/s en una RTX 3090. La memoria de 32 GB de sistema es suficiente.
- Prototipado e investigación en cuantización: el pack sirve como referencia reproducible de cuantización trellis TQ2_T con teacher FP8, útil para estudiar el impacto de 2,25 bpw en calidad (HumanEval, MBPP) y para comparar motores de caché de expertos (Strata frente a llama.cpp con `--moe-cache-mib` y ClassLRU).
- Evaluación comparativa de motores de inferencia: la model card incluye un contraste medido en la misma RTX 3090 entre este pack (120 t/s decode, 800 t/s prefill, 10/10 en QA) y el Q2_K estático de mradermacher con llama.cpp (3,8–4,5 t/s decode, 22,6 t/s prefill, 5/10 en QA a presupuesto corto), lo que lo convierte en un banco de pruebas para decisiones de stack.
- Inferencia en GPUs de 8 GB con streaming por PCIe: en una RTX 3070 o RTX 2080 Super se mantienen 57–59 t/s con una capa caliente de 2,9 GiB (20 % del expool); la verificación en una RTX 2080 Ti real dio 36,7–41,7 t/s con 3,0 GiB libres, suficiente para asistentes locales de código en equipos modestos.

## Benchmarks y rendimiento

| Benchmark | Este pack (TQ2_T, Strata) | Q2_K (llama.cpp, mismo 3090) |
|---|---|---|
| HumanEval pass@1 (0-shot, temp 0, thinking) | reportado en la model card, valor numérico no disponible en el extracto | no disponible |
| MBPP pass@1 | reportado en la model card, valor numérico no disponible en el extracto | no disponible |
| Decode (RTX 3090, fully resident) | 120 t/s (68–106 en contexto fresco, 120–124 con KV caliente) | 3,8–4,5 t/s |
| Prefill (RTX 3090) | 800 t/s | 22,6 t/s |
| QA gate (10 preguntas) | 10/10, respuestas directas, 0 eventos de degeneración | 5/10 a presupuesto corto; 9/10 con 400 tokens |

Rendimiento por GPU (decodificación, capa caliente del expool y tasa de acierto en bench de código):

| GPU | Capa caliente | Decode t/s | Tasa de acierto |
|---|---|---|---|
| 24 GB (RTX 3090/4090/A5000) | 15,3 GiB (100 %) | 68–106 fresco / 120–124 KV caliente | 100 % |
| 16 GB (V100-16, RX 6800, RTX 4060 Ti 16 GB) | 10,1 GiB (65 %) | 80–95 | 89–98 % |
| 12 GB (RTX 3060 12 GB, RTX 3080 12 GB) | 6,0 GiB (39 %) | 62–95 | 80–87 % |
| 11 GB (RTX 2080 Ti, medido) | ~5,2 GiB (32 %) | 42–48 | medido en tarjeta real |
| 8 GB (RTX 3070, RTX 2080 Super, RX 7600) | 2,9 GiB (20 %) | 57–59 (emulado); 36,7–41,7 en 2080 Ti real | ~20 % caliente, fetch por PCIe |
| Tesla V100-32 | 100 % residente | 90 | no disponible |

Comparativa de motores en GPU de 16 GB con pack Flash-Next de 2 bits (third-party, local-llm-lab, 2026-10-16): llama.cpp con 8 GB de caché de expertos 49,4 t/s y prefill 206 t/s frente a Strata 85,8 t/s y prefill 2.320 t/s.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,2 GB en RTX 3090/4090 con el expool completamente residente (15,3 GiB de caché de expertos + ~5 GB de densos, KV y contexto); 4 GB de VRAM libres.
- GPU recomendadas: RTX 3090, RTX 4090, A5000 (24 GB) para residencia completa; Tesla V100-32 para servidor de bajo coste con 90 t/s; V100-16, RX 6800, RTX 4060 Ti 16 GB para capa caliente del 65 %.
- Cabe en GPU de consumo: sí, desde 8 GB (RTX 3070, RTX 2080 Super, RX 7600) con capa caliente del 20 % y 57–59 t/s; verificado en RTX 2080 Ti de 11 GB a 36,7–41,7 t/s.
- RAM de sistema: 32 GB es suficiente; 16 GB es el mínimo práctico. La tabla de lookup de 35,2 GB no necesita estar residente: tras uso real solo se tocan 5,7 GB (16 %) y expulsarla de la caché de página no costó velocidad medible. Se requiere NVMe rápido.
- Opciones de despliegue: motor Strata (obligatorio para TQ2_T, id 144 no es un tipo upstream). Para una ruta nativa de llama.cpp con este modelo base, el repositorio de mradermacher (GGUF Q2_K) es la alternativa; upstream llama.cpp incorporó caché de expertos el 2026-10-07 (`--moe-cache-mib`) y ClassLRU el 2026-11-06, pero no soporta TQ2_T.
- Latencia y throughput: 120 t/s decode y 800 t/s prefill en RTX 3090 completamente residente; 90 t/s en V100-32; 80–95 t/s en 16 GB; 62–95 t/s en 12 GB; 57–59 t/s en 8 GB (emulado) y 36,7–41,7 t/s en 2080 Ti real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-65B-A6B Gyro-M (este pack) | 116,5B totales / ~6B activos | no disponible | TQ2_T 2,25 bpw, motor Strata | qwen-community-1.0 | Hugging Face (BoxyFit) |
| Groot-65B-A6B-261023 (base oficial) | 116,5B totales / ~6B activos | no disponible | FP8, GGUF oficial | no disponible | Hugging Face (GrootTeam) |
| Groot-65B-A6B-261023-GGUF (mradermacher) | 116,5B totales / ~6B activos | no disponible | GGUF Q2_K (~2,6 bpw) | no disponible | Hugging Face (mradermacher) |
| Groot-65B-A6B-261023-VAL-1.25M-I-Matrix-GGUF (IsValorum) | 116,5B totales / ~6B activos | no disponible | GGUF (I-Matrix) | no disponible | Hugging Face (IsValorum) |

En la comparativa medida en la misma RTX 3090, este pack supera al Q2_K de mradermacher en decodificación (120 frente a 3,8–4,5 t/s), prefill (800 frente a 22,6 t/s) y calidad en QA corto (10/10 frente a 5/10), con un tamaño de fichero casi idéntico (54,5 frente a 56,3 GB). La diferencia se atribuye al motor Strata y a la codificación trellis, no al número de bits.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia "other" con términos específicos de la comunidad Qwen; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial, ya que puede imponer restricciones de atribución o de uso.
- Dependencia del motor Strata: TQ2_T (id 144) no es un tipo upstream de llama.cpp, por lo que el pack no se puede cargar con llama.cpp, Ollama, vLLM ni TGI estándar. Requiere el motor Strata y su build correspondiente (CUDA 12 para Volta; CUDA 13 eliminó soporte de Volta).
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de sesgos en la información disponible; el modelo base es un MoE grande de propósito general y los benchmarks reportados se limitan a código (HumanEval, MBPP).
- Idiomas: no disponibles; no se puede confirmar el soporte multilingüe ni el rendimiento en castellano.
- Contexto: la longitud de contexto no está documentada en el pack; el rendimiento en contexto fresco (68–106 t/s) es inferior al de KV caliente (120–124 t/s), lo que sugiere que las cargas de contexto muy largo pueden degradar el throughput.
- Degradación por tasa de acierto: en cargas amplias (corpus de 1,25M tokens), una capa caliente del 65 % cubre ~84 % de activaciones y una del 39 % cubre ~63 %, por debajo de las tasas medidas en bench de código; el rendimiento en 8–12 GB depende del patrón de enrutamiento de la carga real.
- Requisito de NVMe: la parte fría de la tabla de lookup vive en NVMe y se lee de forma dispersa; un disco lento puede penalizar la latencia aunque la VRAM sea suficiente.
- Trazabilidad de benchmarks: los valores numéricos de HumanEval y MBPP se reportan en la model card pero no están completos en el extracto disponible; no se deben citar cifras concretas de calidad sin consultar la card original.
- Fecha del pack: publicado el 2026-11-03 y actualizado el 2026-11-17; las comparativas con llama.cpp reflejan el estado de esas fechas y pueden quedar obsoletas con nuevas versiones del motor.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- GGUF de mradermacher (ruta llama.cpp nativa): https://huggingface.co/mradermacher/Groot-65B-A6B-261023-GGUF
- Datos de cobertura de enrutamiento (IsValorum): https://huggingface.co/IsValorum/Groot-65B-A6B-261023-VAL-1.25M-I-Matrix-GGUF
- Licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
