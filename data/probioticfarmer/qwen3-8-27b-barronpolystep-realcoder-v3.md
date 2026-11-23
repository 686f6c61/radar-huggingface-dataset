# ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-RealCoder-v3

## Resumen

Qwen3.8-27B-BarronPolyStep-RealCoder-v3 es un adaptador LoRA de PEFT desarrollado por el usuario ProbioticFarmer sobre el modelo base Qwen/Qwen3.8-27B. El adaptador se ha entrenado específicamente para tareas de generación de código Python, empleando una variante del optimizador PolyStep denominada Barron-Patched PolyStep, que combina una función de pérdida BarronCrossEntropyLoss con un centroide baricéntrico de Barron, según el paper arXiv:2610.31642. El autor lo presenta como una edición "Zero-Leakage / Bit-for-Bit Test-Set Invariant", con verificación forense de que el conjunto de test no ha influido en el entrenamiento.

El adaptador consta de 256 tensores distribuidos en las 64 capas del modelo base, con rango r=16 y lora_alpha=32, aplicados sobre los módulos down_proj, o_proj y out_proj. El entrenamiento se realizó en Apple Silicon (M4 Max con 128 GB de memoria unificada) sobre un conjunto muy reducido de 40 tareas de entrenamiento (160 slots, 3.378 posiciones de token), reservando 16 tareas no vistas para evaluación.

La relevancia de este adaptador reside en su enfoque metodológico: demuestra que es posible obtener mejoras medibles en la precisión de generación de código con un ajuste fino extremadamente ligero (1,5 GB de pesos) y un conjunto de datos minúsculo, utilizando técnicas de optimización de orden cero y subespacios ortogonales. No obstante, el alcance es muy limitado y los resultados deben interpretarse con cautela dado el tamaño reducido del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B con capas GatedDeltaNet y full-attention |
| Parametros totales | Adaptador: 256 tensores LoRA; modelo base: 27B (no disponible el desglose exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones propias de Qwen) |
| Idiomas soportados | No disponible (el adaptador está orientado a código Python; el modelo base soporta multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer de 64 capas que combina 48 capas con atención lineal GatedDeltaNet y 16 capas con full-attention. Los módulos objetivo del LoRA son down_proj (en las 64 capas), out_proj (en las 48 capas GatedDeltaNet) y o_proj (en las 16 capas de full-attention), con shapes que reflejan las dimensiones internas del modelo base (lora_A [16, 17408] / lora_B [5120, 16] para down_proj; lora_A [16, 6144] / lora_B [5120, 16] para out_proj y o_proj).

El entrenamiento emplea Barron-Patched PolyStep, un optimizador de orden cero que combina BarronCrossEntropyLoss con barron_barycentric_centroid. Se utilizan subespacios ortogonales aleatorios generados mediante np.linalg.qr en cada paso, con 128 sondas antitéticas por paso y 60 pasos, sobre un conjunto de 40 tareas de código Python (160 slots, 3.378 posiciones de token). El adaptador se inicializa a cero (theta=0, lora_B=0), de modo que reproduce el modelo base bit a bit antes del entrenamiento. Todas las bases PCA/SVD, máscaras de vocabulario y selecciones de stage se ajustan exclusivamente sobre las 40 tareas de entrenamiento, y el autor verifica que sustituir las posiciones de test por ruido aleatorio produce max_abs_diff = 0.0 en los 256 tensores LoRA.

## Capacidades

- Generación de código Python: el adaptador está entrenado específicamente para completar código Python en tareas algorítmicas y de ciencia de datos.
- Razonamiento algorítmico y de sistemas: cubre 32 tareas de algoritmos y sistemas según la benchmark del autor.
- Ciencia de datos en Python: cubre 24 tareas de Python y data science.
- Completado de slots sintácticos: el adaptador se evalúa sobre 224 slots sintácticos con 896 completaciones candidatas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no documentadas para el adaptador; heredadas del modelo base (no disponibles en la ficha).

## Casos de uso

- Autocompletado de código Python en entornos de desarrollo: el adaptador puede integrarse en un servidor de inferencia que cargue el modelo base Qwen3.8-27B con el LoRA adjunto para sugerir completaciones en editores, aprovechando su entrenamiento específico en slots sintácticos de Python.
- Generación de funciones algorítmicas: para tareas de estructuras de datos y algoritmos, el adaptador mejora el Pass@1 del modelo base en el benchmark del autor (de 59,38% a 75,00% en Algo-32 con calibración multi-capa), lo que lo hace útil en pipelines de generación de código con verificación por tests.
- Asistencia en notebooks de ciencia de datos: las 24 tareas de Python/Data Science del entrenamiento cubren patrones típicos de pandas, numpy y similares, adecuado para sugerir celdas en notebooks.
- Investigación en optimización de orden cero: el adaptador sirve como artefacto reproducible para estudiar Barron-Patched PolyStep y técnicas de subespacios ortogonales en ajuste fino de bajo rango.
- Evaluación de técnicas de zero-leakage: útil como caso de estudio para metodologías de verificación de que el conjunto de test no contamina el entrenamiento, con scripts de auditoría incluidos (audit_realcoder_v3.py).
- Despliegue en hardware Apple Silicon: el adaptador se entrenó en M4 Max con 128 GB, y su tamaño de 1,5 GB permite cargarlo junto al modelo base en entornos con memoria unificada amplia para experimentación local.
- Prototipado rápido de asistentes de código en investigación: al ser un LoRA ligero sobre un modelo de 27B, permite iterar sobre variantes sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor. El benchmark se compone de 56 tareas de código Python (32 de algoritmos/sistemas + 24 de Python/data science), evaluadas con compile() + exec() en vivo.

**Generalización 2-fold out-of-sample (tareas pares vs impares):**

| Régimen | Algo-32 Slot Acc | Algo-32 Pass@1 | PyDS-24 Slot Acc | PyDS-24 Pass@1 | Combined Pass@1 (56) |
|---|---|---|---|---|---|
| Base Qwen3.8-27B (theta=0) | 111/128 (86,72%) | 19/32 (59,38%) | 88/96 (91,67%) | 17/24 (70,83%) | 36/56 (64,29%) |
| 2-Fold Barron PolyStep Layer-63 LoRA (D=256) | 115/128 (89,84%) | 21/32 (65,62%) | 88/96 (91,67%) | 17/24 (70,83%) | 38/56 (67,86%) |
| 2-Fold Multi-Layer Null-Space Calibration (D=18) | 116/128 (90,62%) | 24/32 (75,00%) | 89/96 (92,71%) | 18/24 (75,00%) | 42/56 (75,00%) |

**Benchmark 40-train / 16-held-out (5 brazos de optimizador, bf16):**

| Optimizador | Train-40 Slot Acc | Train-40 Pass@1 | HeldOut-16 Slot Acc | HeldOut-16 Pass@1 | Combined Pass@1 (56) |
|---|---|---|---|---|---|
| Base sin modificar | 145/160 (90,62%) | 28/40 (70,00%) | 54/64 (84,38%) | 8/16 (50,00%) | 36/56 (64,29%) |
| MeZO (SPSA) | 146/160 (91,25%) | 29/40 (72,50%) | 54/64 (84,38%) | 8/16 (50,00%) | 37/56 (66,07%) |
| Standard PolyStep | 148/160 (92,50%) | 30/40 (75,00%) | 56/64 (87,50%) | 10/16 (62,50%) | 40/56 (71,43%) |
| Barron Fixed-Loss | 148/160 (92,50%) | 30/40 (75,00%) | 56/64 (87,50%) | 10/16 (62,50%) | 40/56 (71,43%) |
| Barron Fixed-Transport | 156/160 (97,50%) | 37/40 (92,50%) | 55/64 (85,94%) | 10/16 (62,50%) | no disponible (truncado en la model card) |

Además, el autor reporta que 1.556 de 4.705 posiciones de token (33,1%) superan el umbral de precisión bfloat16 (Δz > 6,22).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa 1,5 GB; el modelo base Qwen3.8-27B requiere aproximadamente 54 GB en bf16 (27B × 2 bytes) más overhead, o ~14-16 GB en cuantización de 4 bits (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: para el modelo base en bf16 se necesitan GPUs con 80 GB (A100, H100); en cuantización 4-bit podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se confirma en la información proporcionada.
- Cabe en consumer GPU: solo con cuantización agresiva del modelo base; el adaptador en sí es ligero (1,5 GB).
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama (si se convierte el modelo base a GGUF y se aplica el adaptador, no confirmado).
- Latencia y throughput: no disponibles.
- Entrenamiento: realizado en Apple M4 Max con 128 GB de memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-BarronPolyStep-RealCoder-v3 | 27B (base) + LoRA 1,5 GB | No disponible | LoRA para código Python con PolyStep | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo generalista | No disponible en la información | Hugging Face |
| MeZO (SPSA) sobre Qwen3.8-27B | 27B + LoRA | No disponible | Optimización de orden cero | No disponible | Referencia en benchmark del autor |
| Standard PolyStep sobre Qwen3.8-27B | 27B + LoRA | No disponible | Optimización PolyStep estándar | No disponible | Referencia en benchmark del autor |

No se dispone de datos de otros adaptadores LoRA comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento es extremadamente reducido (40 tareas, 160 slots, 3.378 posiciones de token), lo que limita la generalización más allá de los patrones de código Python cubiertos.
- Los benchmarks se basan en 56 tareas y 16 tareas held-out, con tamaños de muestra pequeños que producen intervalos de confianza amplios; las mejoras de Pass@1 deben interpretarse con cautela.
- El adaptador está especializado en Python; no se documentan capacidades en otros lenguajes de programación ni en lenguaje natural general.
- No se documentan sesgos conocidos, pero al heredar el modelo base Qwen3.8-27B, podría reproducir sesgos presentes en él.
- Riesgo de alucinación: no evaluado en la información proporcionada; aplicable el riesgo inherente al modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado (no disponible en la información).
- El autor enfatiza la invariancia bit a bit frente al test set, pero la verificación se limita a los scripts de auditoría del propio autor (audit_realcoder_v3.py), no a una revisión independiente.
- El adaptador se inicializa a cero y reproduce el modelo base bit a bit; cualquier mejora depende de la calibración multi-capa (D=18) o del Layer-63 LoRA (D=256), cuyos detalles de implementación no se especifican completamente.
- No se documentan limitaciones de contexto o idioma del adaptador; se heredan las del modelo base (no disponibles).
- El repositorio tiene solo 541 descargas y 1 like, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-RealCoder-v3
- Paper citado: https://arxiv.org/abs/2610.31642
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de auditoría: audit_realcoder_v3.py (referenciado en la model card, no se proporciona URL directa)
