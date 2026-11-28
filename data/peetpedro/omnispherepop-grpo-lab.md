# PeetPedro/omnispherepop-grpo-lab

## Resumen

`omnispherepop-grpo-lab` es un artefacto de investigación publicado por el usuario PeetPedro en Hugging Face, construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento reproducible que combina tres técnicas: GRPO (Group Relative Policy Optimization) con verificación de recompensa (RLVR) sobre tareas aritméticas tipo Countdown, cuantización ternaria mediante el motor OmnispherePop (1.58 bits por peso, empaquetado de 5 trits), y steering mecanicista de activaciones en la capa 22. El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos pueden no estar materializados o que el contenido principal son los scripts y el cuaderno de reproducción.

El interés del artefacto es fundamentalmente metodológico: documenta con métricas detalladas cómo afecta la cuantización ternaria agresiva a un modelo de 1.5B parámetros, qué capas son más sensibles (KL divergencia hasta 43.5 veces mayor en L13 frente a L7), y cómo un parche ternario del delta de pesos de GRPO preserva el comportamiento del RLVR. Todo el experimento se ejecutó en una Tesla T4 gratuita de Google Colab en 14.5 minutos, lo que lo convierte en una referencia útil para quienes investigan eficiencia computacional y cuantización extrema en hardware de consumo.

La relevancia actual reside en que proporciona evidencia empírica sobre la intersección entre RLVR, cuantización ternaria e interpretabilidad mecanicista, un área poco documentada con números reproducibles. No obstante, conviene subrayar que los resultados de precisión absoluta son bajos (12.5% en el mejor caso sobre Countdown), por lo que debe interpretarse como un banco de pruebas y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct), 28 capas, 196 proyecciones lineales, 1.31B pesos lineales |
| Parametros totales | 1.5B (modelo base); 1.31B pesos lineales segun la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Ternaria 1.58b (5-trit packing, group size 128), `qdelta` A6P Q16.16 (niveles 3-6), FP16, LoRA r=16 (1.4% de parametros) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0.0 GB; la model card referencia scripts `.py` y `.ipynb`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct en FP16, un transformer decoder-only de 28 capas con 196 proyecciones lineales y 1.31B pesos lineales. Sobre esa base se aplican cinco etapas: (1) barrido de sensibilidad KL bajo cuantización ternaria OmnispherePop y `qdelta` A6P; (2) Dr. GRPO con LoRA en PyTorch puro durante 28 pasos sobre 48 tareas Countdown verificables; (3) anatomía de trit-flips y diff ternario 1.58b; (4) cuantización ternaria al 100% a 1.6 bpw con recuperación LoRA de 45 pasos; y (5) steering contrastivo de activaciones en la capa 22.

El motor OmnispherePop aplica cuantización ternaria con umbral `Δ = 0.7·mean|w|` y empaquetado de 5 trits por grupo de 128 pesos. El entrenamiento RLVR usa recompensa verificable mediante evaluación AST con `Fraction` exacta sobre tareas Countdown de 3 y 4 números. Una innovación destacable es la compresión del delta de pesos `ΔW` de GRPO: pasa de 2,620.4 MB en FP16 a 303.0 MB con empaquetado de 5 trits (88.4% de reducción), con un MSE de reconstrucción en la capa 14 de `8.44 × 10⁻¹⁰`. El experimento completo se ejecutó en 14.5 minutos sobre una Tesla T4 de 15.64 GB.

## Capacidades

- Generación de texto y razonamiento aritmético verificable sobre tareas Countdown (composición de operaciones para alcanzar un objetivo numérico).
- Formato XML estructurado para respuestas de razonamiento, con hasta 97.9% de cumplimiento tras Dr. GRPO.
- Razonamiento multi-paso con cadenas de pensamiento cortas (47 tokens medios tras RLVR, frente a 105 en el base).
- Cuantización ternaria extrema (1.58 bits por peso) con preservación del comportamiento RLVR mediante parcheo del delta de pesos.
- Steering mecanicista de activaciones en capa 22 con coeficientes α ajustables (1.0, 1.5, 2.0).
- Recuperación post-cuantización mediante LoRA de bajo rango (r=16, 1.4% de parámetros) en 45 pasos y 32 segundos.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación en cuantización ternaria extrema: sirve como banco de pruebas reproducible para medir el impacto de 1.58 bpw sobre un transformer de 1.5B, con métricas de KL por capa y MSE de reconstrucción ya calculadas.
- Estudio de RLVR en hardware de consumo: el cuaderno de Colab permite replicar un ciclo completo de GRPO con recompensa verificable en una T4 gratuita en menos de 15 minutos, útil para docencia o validación de pipelines.
- Análisis de interpretabilidad mecanicista: la anatomía de trit-flips por tipo de proyección (atención 2.7× superior a `down_proj`) ofrece un punto de partida para estudiar qué componentes concentran la plasticidad del RL.
- Compresión de deltas de fine-tuning: la técnica de empaquetar `ΔW` en 5 trits (303 MB frente a 2,620 MB) es aplicable a la distribución de actualizaciones LoRA o adaptadores en entornos con ancho de banda limitado.
- Steering de activaciones para control de formato: el ajuste en L22 con α permite modular el cumplimiento de formato XML sin reentrenar, útil en pipelines que exigen salidas estructuradas.
- Evaluación de recuperación post-PTQ: el protocolo de LoRA de recuperación en 32 segundos sirve para validar estrategias de rescate de modelos colapsados por cuantización agresiva.
- Reproducibilidad de experimentos: los scripts `run_experiment.py`, `results.json` y el cuaderno permiten auditar cada resultado con paridad verificada contra el CLI en Rust (`0.00e+00`).

## Benchmarks y rendimiento

Resultados sobre 48 tareas Countdown held-out verificables (24 de 3 números, 24 de 4 números):

| Configuracion | Acc total | Acc 3-num | Acc 4-num | Formato XML | Reward medio | Tokens medios |
|---|---:|---:|---:|---:|---:|---:|
| FP16 Base | 12.5% | 25.0% | 0.0% | 52.1% | 0.287 | 105 |
| OmnispherePop ternario 28/28 (zero-shot) | 0.0% | 0.0% | 0.0% | 0.0% | 0.000 | 217 |
| OmnispherePop QDelta A6P-L4 28/28 (zero-shot) | 0.0% | 0.0% | 0.0% | 0.0% | 0.000 | 224 |
| OmnispherePop hibrido 4/28 ternario | 0.0% | 0.0% | 0.0% | 0.0% | 0.003 | 189 |
| FP16 Dr. GRPO (RLVR, 28 pasos) | 4.2% | 8.3% | 0.0% | 97.9% | 0.342 | 47 |
| FP16 Base + diff ternario 1.58b de GRPO | 4.2% | 8.3% | 0.0% | 97.9% | 0.335 | 47 |
| OmnispherePop hibrido GRPO (4/28 ternario) | 6.2% | 8.3% | 4.2% | 83.3% | 0.313 | 72 |
| OmnispherePop hibrido base + diff ternario GRPO | 4.2% | 4.2% | 4.2% | 87.5% | 0.298 | 65 |
| OmnispherePop 100% ternario + LoRA 45 pasos (32s) | 0.0% | 0.0% | 0.0% | 100.0% | 0.150 | 60 |
| FP16 Base + steering L22, α=1.5 | 8.3% | 16.7% | 0.0% | 50.0% | 0.233 | 107 |
| OmnispherePop hibrido GRPO + steering L22, α=1.0 | 6.2% | 8.3% | 4.2% | 81.2% | 0.303 | 74 |
| OmnispherePop hibrido GRPO + steering L22, α=2.0 | 6.2% | 8.3% | 4.2% | 85.4% | 0.317 | 70 |

Barrido de niveles A6P (Q16.16) sobre las 28 capas:

| Nivel A6P | Umbral δ | Esparsidad | RMSE medio | KL global de logits |
|---|---:|---:|---:|---:|
| Level 3 | 0.031250 | 75.8% | 0.01582 | 14.30 |
| Level 4 (óptimo) | 0.015625 | 46.7% | 0.01326 | 10.29 |
| Level 5 | 0.007812 | 25.3% | 0.01471 | 13.28 |
| Level 6 | 0.003906 | 13.0% | 0.01605 | 13.54 |

## Requisitos de hardware

- VRAM estimada para inferencia: el experimento completo se ejecutó en una Tesla T4 de 15.64 GB, incluyendo base FP16, LoRA y etapas de cuantización.
- GPU recomendadas: Tesla T4 (validada), y por tamaño del modelo (1.5B) cabría esperar compatibilidad con RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 y H100, aunque solo la T4 está documentada en la información disponible.
- Cabe en GPU de consumo: sí, al tratarse de un modelo de 1.5B en FP16 (aproximadamente 3 GB de pesos) o en ternario (aproximadamente 0.3 GB para el delta comprimido).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio incluye scripts en PyTorch puro (`run_experiment.py`), un cuaderno de Colab y un CLI en Rust (`ospop`) para auditoría.
- Latencia y throughput: el ciclo completo de experimento (5 etapas) se completó en 14.5 minutos en T4; la recuperación LoRA de 45 pasos tardó 32.3 segundos. No se publican cifras de tokens por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omnispherepop-grpo-lab | 1.5B (base) | No disponible | RLVR + cuantización ternaria + steering | Apache 2.0 | Repo de 0.0 GB, sin pesos publicados aparentemente |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | No disponible en la informacion | Instruct generalista | Apache 2.0 | Pesos completos en Hugging Face |
| Alternativas de cuantizacion ternaria (p. ej. BitNet) | No disponible | No disponible | Cuantizacion 1.58b nativa | No disponible | No disponible |

La comparación directa con otros modelos de la misma categoría no está disponible en la información proporcionada, más allá del propio modelo base. El artefacto no compite en rendimiento generalista sino en reproducibilidad metodológica.

## Limitaciones y advertencias

- Precisión absoluta baja: el mejor resultado en Countdown es 12.5% (FP16 base); tras RLVR cae a 4.2%, lo que indica que el entrenamiento optimiza formato y recompensa más que exactitud.
- El repositorio tiene 0.0 GB y cero descargas; no está claro que los pesos estén publicados en formatos estándar (safetensors, GGUF). Verificar antes de intentar cargarlo.
- La cuantización ternaria zero-shot colapsa el modelo al 0.0% de precisión y genera texto incoherente (217 tokens de gibberish, CE loss 11.262).
- El modelo solo se ha evaluado en tareas Countdown de 3 y 4 números; no hay evidencia de generalización a otros dominios.
- No se documentan idiomas soportados; se hereda el comportamiento del base Qwen2.5-1.5B-Instruct, pero sin evaluación específica.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de fidelidad fuera del benchmark aritmético.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación con pesos posiblemente incompletos, la viabilidad en producción es dudosa.
- El steering en L22 con α=1.5 degrada el formato XML al 50%, por lo que los coeficientes deben calibrarse por caso de uso.
- La información de benchmarks proviene exclusivamente de la model card del autor; no hay validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeetPedro/omnispherepop-grpo-lab
- Cuaderno reproducible: https://huggingface.co/PeetPedro/omnispherepop-grpo-lab/blob/main/omnispherepop_grpo_colab.ipynb
- Script de experimento: https://huggingface.co/PeetPedro/omnispherepop-grpo-lab/blob/main/run_experiment.py
- Métricas crudas: https://huggingface.co/PeetPedro/omnispherepop-grpo-lab/blob/main/results.json
- Motor de cuantización OmnispherePop: https://github.com/8b-is/omnispherepop
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
