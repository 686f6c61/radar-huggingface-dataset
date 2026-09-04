# osk-arr00/qwen-3.8-next-40b-exp-moe-healed-bf16

## Resumen

Qwen-3.8-Next-40B-MoE-Healed es un modelo de lenguaje experimental de 40.220 millones de parámetros (40.22B) desarrollado por el usuario osk-arr00 a partir de la arquitectura híbrida Qwen-3.8-Next-40B. El modelo se presenta como una versión curada mediante un proceso de "Router-Healing" (estabilización de enrutamiento) y poda de la memoria asociativa PLE a 2.0M de entradas. Su propósito principal es corregir una patología observada en el modelo base: la asfixia e inanición de expertos (expert starvation), que provocaba repeticiones léxicas en bucle y un desbalance severo en el uso de los 128 expertos del MoE.

Arquitectónicamente combina bloques MoE con atención lineal recurrente (Gated DeltaNet), Hyper-Connections de 4 streams residuales y una capa de memoria N-Grama asociativa (PLE 2.0M). Se trata de un modelo de investigación de frontera, no de producción, y requiere un runtime de inferencia compatible con la arquitectura experimental `qwen4_exp`. Su relevancia radica en que es un caso documentado de intervención quirúrgica sobre el enrutamiento de un MoE, con resultados cuantitativos que muestran la reactivación de expertos inactivos y la reducción de bucles de repetición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal recurrente (Gated DeltaNet), Hyper-Connections de 4 streams residuales y capa de memoria PLE N-Grama |
| Parametros totales | 40.219.849.600 (40.22B) |
| Parametros activos | ~10.4B por token (8 expertos ruteados de 128 + 1 experto compartido denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de 48 bloques MoE híbridos. Cada bloque combina una capa de atención completa estándar con tres bloques de atención lineal recurrente Gated DeltaNet, lo que reduce la complejidad computacional en secuencias largas. Además, emplea Hyper-Connections con 4 streams de residuo y proyecciones de rango 320, una innovación que mejora la propagación de gradientes y la mezcla de información entre capas. La memoria PLE (Pre-Lookup Embeddings) es una tabla N-Grama asociativa de 2.000.000 de entradas, con 32.002.176 vectores de 160 dimensiones, que se ha podado respecto al modelo original.

El entrenamiento de "Router-Healing" se realizó mediante SFT con un protocolo de lazo cerrado de 150 pasos. Solo los 48 routers `W_gate` fueron optimizados (15,73 millones de parámetros activos), manteniendo congelado el 99,96% del modelo. Se aplicó una triple función de pérdida: una pérdida auxiliar balanceada ST-MoE, una barrera logarítmica de inanición (KL Starvation Barrier) para penalizar expertos con cuota inferior a 0.5/N, y una pérdida de varianza de carga inter-experto. El optimizador fue AdamW con warmup y cosine decay, con una tasa de aprendizaje máxima de 3×10⁻⁴. Los datos de entrenamiento no están especificados en la información disponible.

## Capacidades

- Generación de texto en formato abierto, con mejora documentada en la diversidad léxica (Distinct-1: 0.81) y eliminación de bucles de repetición de trigramas (0.69% tras el healing).
- Razonamiento matemático con cadena de pensamiento (CoT), evaluado en la batería forense del autor.
- Generación y ejecución de código Python concurrente.
- Razonamiento sobre textos jurídicos (dogmática jurídica), incluido en la batería de evaluación.
- Soporte de tool calling / function calling, validado en la batería de pruebas del autor.
- Enrutamiento mejorado de expertos: entropía de Shannon de 0.8353, con 16.6 expertos inactivos por capa (frente a 22.6 en el modelo base), lo que indica una mayor utilización del conjunto de expertos.
- Capacidad de razonamiento multi-step dentro del contexto de la arquitectura híbrida, aunque no se especifican límites de ventana de contexto.

## Casos de uso

- Investigación en enrutamiento de modelos MoE: el modelo es útil para estudiar el efecto del Router-Healing sobre el desbalance de expertos, la entropía de enrutamiento y la reactivación de expertos inactivos. Se puede usar como banco de pruebas para experimentos con pérdidas auxiliares de balanceo.
- Análisis de patologías de generación en MoE: al documentar la eliminación de bucles de repetición y la mejora de diversidad léxica, sirve como caso de estudio para comparar modelos antes y después de la intervención.
- Generación de código con tool calling: el modelo soporta function calling y puede evaluarse en pipelines de desarrollo de software que requieran integración con APIs o herramientas externas, siempre que el runtime sea compatible.
- Razonamiento matemático con CoT: su capacidad para seguir cadenas de pensamiento lo hace adecuado para pruebas de resolución de problemas matemáticos en entornos de investigación.
- Procesamiento de documentos jurídicos: el modelo fue evaluado en dogmática jurídica, lo que sugiere un uso potencial en resúmenes o análisis de textos legales, aunque no hay datos formales de precisión.
- Experimentación con arquitecturas híbridas: al combinar Gated DeltaNet, Hyper-Connections y PLE, el modelo es útil para investigar la interacción entre atención lineal, memoria asociativa y enrutamiento MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor presenta una tabla de indicadores clínicos pre y post-healing, medida en una GPU NVIDIA RTX-PRO-6000 con 96 GB de VRAM:

| Indicador clínico | Pre-healing (base) | Post-healing (curado) |
|---|---|---|
| Repetición sintáctica de trigramas | Patológico (bucles infinitos) | 0.69% |
| Diversidad léxica (Distinct-1) | < 0.30 | 0.81 |
| Entropía de enrutamiento Shannon (H) | 0.680 | 0.8353 (+22.8%) |
| Expertos inactivos (0 disparos) | 22.6 / 128 (17.7%) | 16.6 / 128 (12.9%) |
| Cuota Top 1 monopolista | 7.20% | 6.12% (-15.0%) |
| Cuota Top 3 monopolistas | 18.90% | 15.75% (-16.7%) |
| Ratio de inyección de memoria PLE (ρ) | 0.658 | 0.600 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 80.5 GB en disco y requiere al menos 80 GB de VRAM para cargar los pesos, más overhead de activaciones y KV cache. En la práctica se necesitan alrededor de 96 GB de VRAM, como la usada en la auditoría del autor.
- GPU recomendadas: NVIDIA RTX-PRO-6000 (96 GB) es la única GPU documentada. También podría ejecutarse en A100 80GB o H100 80GB, siempre que el runtime soporte la arquitectura `qwen4_exp`.
- No cabe en GPU de consumo estándar (RTX 4090 de 24GB, RTX 3090 de 24GB) sin cuantización, y no se han publicado cuantizaciones disponibles.
- Opciones de despliegue: no disponible. Al tratarse de una arquitectura experimental (`qwen4_exp`), el soporte en vLLM, llama.cpp, Ollama o TGI depende de que dichos frameworks implementen esta arquitectura. No hay indicación de compatibilidad.
- Latencia y throughput: no disponibles. El model card no proporciona datos de rendimiento en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparables con otros modelos en la información proporcionada. El modelo es un experimento basado en Qwen-3.8-Next-40B, pero no se ofrecen especificaciones del modelo base original (contexto, benchmarks estándar, etc.) más allá de los indicadores internos de enrutamiento. La única comparación disponible es la interna pre-healing vs post-healing, ya presentada en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo experimental: no es apto para producción. La arquitectura `qwen4_exp` requiere un runtime específico y no es compatible con frameworks estándar de Transformers densos.
- Riesgo de alucinación: no se han documentado tasas de alucinación. La memoria PLE puede inyectar información fáctica de forma descontrolada, aunque el ratio ρ se ha reducido de 0.658 a 0.600.
- Limitaciones de contexto: la longitud de contexto no está especificada. El uso de Gated DeltaNet y PLE sugiere que el modelo puede manejar secuencias largas, pero no hay confirmación formal.
- Sesgos: no se han evaluado sesgos de género, raza o cultura. Al estar basado en Qwen, hereda las limitaciones de los datos de entrenamiento originales, que no están documentados.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero el modelo es experimental y la responsabilidad del uso recae en el usuario.
- Dependencia de pesos BF16: no se han publicado cuantizaciones, por lo que el despliegue en hardware limitado es inviable.
- Advertencia del autor: el modelo está etiquetado como "investigación de frontera" y requiere inferencia compatible con `qwen4_exp`. No se recomienda su uso sin verificar el soporte del runtime.

## Enlaces

- HuggingFace: https://huggingface.co/osk-arr00/qwen-3.8-next-40b-exp-moe-healed-bf16
- Repositorio de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Modelo relacionado del mismo autor: https://huggingface.co/osk-arr00/qwen-3.8-next-40b-exp-cartridge-general
