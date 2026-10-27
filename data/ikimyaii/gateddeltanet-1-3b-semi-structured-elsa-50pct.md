# ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-50pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-ELSA-50pct es un checkpoint derivado del modelo base denso m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii, en el que se ha aplicado una poda del 50 % con el código oficial de ELSA (arXiv:2510.01650). No se trata de un modelo entrenado desde cero: es un artefacto de investigación cuyo propósito declarado es servir de línea base frente a los modelos "EHWS" del mismo autor. El checkpoint conserva 1.466.343.808 parámetros almacenados; la poda actúa únicamente sobre las capas lineales internas de los bloques, mientras que los embeddings y el `lm_head` permanecen densos.

La arquitectura de partida es Gated DeltaNet, una capa de atención lineal con regla delta y compuertas publicada por NVlabs en ICLR 2025 como mejora sobre Mamba2. El modelo base se entrenó sobre 100.000 millones de tokens (según indica su propio nombre) y este checkpoint no añade ningún ajuste supervisado ni alineación: es un modelo de lenguaje base, sin modo conversacional. La relevancia actual es metodológica: documenta un procedimiento de poda reproducible (ADMM, 7,37 horas en una A100 de 40 GB) con un patrón de dispersión poco habitual, de recuento uniforme por fila, y reporta perplejidad medida con el propio harness de ELSA.

El resultado declarado es de 12,76 de perplejidad en WikiText-2 y 15,92 en C4, en fp16 y con una única ejecución. La model card no incluye la perplejidad del modelo denso original, por lo que no es posible calcular la degradación inducida por la poda a partir de la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con regla delta y compuertas); no es transformer de atención softmax ni MoE |
| Parámetros totales | 1.466.343.808 (recuento almacenado, denso) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el proceso de poda usó secuencias de 2.048 tokens; la model card no documenta la ventana de entrenamiento del modelo base) |
| Tipos de cuantización | No se publican cuantizaciones (sin GGUF ni AWQ/GPTQ en el repo). El tamaño del repo (5,9 GB) equivale a ~4 bytes por parámetro, lo que sugiere pesos en fp32; la evaluación del autor se hizo en fp16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors; requiere `flash-linear-attention` (`import fla`) y `trust_remote_code=True` |
| Dispersión aplicada | 50 % semi-estructurada (recuento uniforme de no-ceros por fila), 240 capas lineales podadas |
| Carga del modelo | `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` |

## Arquitectura y entrenamiento

La columna vertebral es Gated DeltaNet, una capa de atención lineal que sustituye la atención softmax por un estado recurrente con regla delta (escritura/borrado selectivo de memoria) y compuertas, planteada como mejora de Mamba2 y published en ICLR 2025 por NVlabs. Este checkpoint no modifica esa arquitectura: hereda los pesos del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, entrenado sobre 100.000 millones de tokens según la nomenclatura del propio modelo (la composición exacta del dataset no se detalla en la información disponible; un modelo hermano de la misma familia, linear-moe-hub/Gated-Deltanet-1.3B, reporta SlimPajama). No hay evidencia de RLHF, DPO ni ajuste por instrucciones.

El entrenamiento adicional consiste exclusivamente en la poda con el `main.py` oficial de ELSA: 4.096 pasos ADMM, un paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, calibración con 32.768 secuencias de C4 de 2.048 tokens (67.108.864 tokens) y semilla 0; la ejecución completa consumió 7,37 horas en una A100 de 40 GB. La proyección usa `--admm_comparison_group=row`, de modo que cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el 50 % superior), lo que equilibra la carga de trabajo por fila. Todas las capas lineales dentro de los bloques se podan; embeddings y `lm_head` quedan densos. La dispersión medida sobre los pesos publicados es 0,5000 y se verificó el recuento uniforme por fila en 240 capas.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base: no está ajustado por instrucciones, por lo que no sigue directrices ni mantiene formato conversacional de forma fiable.
- Modelado de lenguaje y estimación de perplejidad: es su uso principal documentado, con resultados medidos en WikiText-2 y C4.
- Procesamiento de secuencias con coste de estado constante: al emplear atención lineal recurrente, el coste de memoria no crece linealmente con la longitud de la secuencia, a diferencia de un transformer con caché KV clásica.
- Capacidad multilingüe: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible; no hay evidencia de entrenamiento en formato de herramientas.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión, audio o multimodalidad: no soportado según la información disponible.
- Valor como referencia de investigación: permite comparar configuraciones de poda (ELSA, ADMM, dispersión por fila) contra el modelo denso y contra los otros artefactos podados del mismo autor.

## Casos de uso

- Investigación sobre poda de modelos: reproducir el pipeline ELSA con los hiperparámetros documentados y comparar la perplejidad obtenida con la报告 del autor (12,76 en WikiText-2 y 15,92 en C4) para validar la implementación propia.
- Línea base en estudios de dispersión: usar este checkpoint al 50 % como referencia frente a los modelos al 80 % y 90 % del mismo autor, midiendo la curva de degradación en función de la tasa de poda.
- Análisis del patrón semi-estructurado por fila: inspeccionar las máscaras de 240 capas lineales para estudiar si el recuento uniforme por fila es compatible con kernels dispersos o con el patrón 2:4 de los tensor cores dispersos.
- Evaluación comparativa denso vs. podado: cargar el modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure y este checkpoint con el mismo harness para cuantificar la pérdida real de calidad, dato que la model card no incluye.
- Experimentos de modelado de lenguaje a pequeña escala: generar texto o calcular perplejidad sobre dominios concretos con un modelo de 1,47 B parámetros que cabe en una GPU de consumo.
- Estudio de eficiencia en inferencia de atención lineal: medir memoria y latencia frente a transformers de tamaño comparable, aprovechando el estado recurrente de Gated DeltaNet.
- Docencia y divulgación: ejemplo completo y reproducible de un ciclo de compresión (calibración, ADMM, proyección, evaluación) con coste de 7,37 horas de A100.

## Benchmarks y rendimiento

| Métrica | Este modelo (50 % dispersión por fila) |
|---|---|
| Perplejidad WikiText-2 (fp16) | 12,76 |
| Perplejidad C4 (fp16) | 15,92 |
| Dispersión medida en pesos publicados | 0,5000 |
| Capas lineales podadas verificadas | 240 (recuento uniforme por fila) |

Medición con el harness de evaluación propio de ELSA (sus conjuntos de test de WikiText-2 y C4, fp16) y una única ejecución, sin intervalos de confianza. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la perplejidad del modelo denso de partida en la información disponible, por lo que no es posible calcular la degradación atribuible a la poda.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 2,9 GB solo para pesos, más estado recurrente y activaciones; un presupuesto realista de 4-6 GB cubre la inferencia con secuencias moderadas.
- VRAM en fp32: unos 5,9 GB de pesos; la carga del checkpoint en fp32 requiere ese espacio antes de convertir a fp16.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) e incluso en tarjetas de 8 GB si se carga directamente en fp16.
- GPU de datacenter: el autor ejecutó la poda en una A100 de 40 GB durante 7,37 horas; la inferencia es viable en A100, H100, L40S o similares.
- Dependencias críticas: kernels `flash-linear-attention` (Triton) para las capas de atención lineal; sin ellos el modelo no carga o cae a implementaciones lentas. Se necesita `trust_remote_code=True`.
- Opciones de despliegue: `transformers` con `fla` es la vía documentada. Soporte en vLLM, TGI, llama.cpp, Ollama o SGLang: no disponible / no confirmado en la información proporcionada, y no hay GGUF publicado.
- Latencia y throughput: no disponibles. No se reportan mediciones de speedup pese a la poda, lo que es relevante porque el patrón por fila no equivale al 2:4 que aceleran los tensor cores dispersos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ppl WikiText-2 | Licencia | Notas |
|---|---|---|---|---|---|
| GatedDeltaNet-1.3B-semi-structured-ELSA-50pct (este) | 1,47 B | No disponible | 12,76 | No disponible | Poda al 50 % por fila, 7,37 h de A100 |
| m-a-p/1.3B-100B-GatedDeltaNet-pure | ~1,3 B | No disponible | No disponible | No disponible | Modelo base denso, 100 B tokens de entrenamiento |
| ikimyaii/HGRN-1.3B-semi-structured-ELSA-90pct | ~1,3 B | No disponible | No disponible | No disponible | Misma metodología con HGRN y 90 % de dispersión; poda en 5,33 h de A100 |
| linear-moe-hub/Gated-Deltanet-1.3B | ~1,3 B | No disponible | No disponible | No disponible | Variante Gated DeltaNet entrenada con 100 B tokens de SlimPajama (paper MoM) |

La comparación cuantitativa es limitada: solo este checkpoint publica perplejidad en la información disponible. La alternativa directa para evaluar el coste de la poda es el modelo base denso m-a-p/1.3B-100B-GatedDeltaNet-pure, del que no se han facilitado métricas.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones, no mantiene diálogo estructurado y puede producir continuaciones incoherentes si se usa como asistente.
- Degradación por poda no cuantificada: no se publica la perplejidad del modelo denso, así que la pérdida de calidad respecto al original es desconocida; la perplejidad absoluta (12,76 / 15,92) es alta para estándares actuales de modelos de 1,3 B.
- Evaluación débil: una sola ejecución, sin intervalos de confianza ni repeticiones con distintas semillas; resultados no verificados por terceros (0 descargas, 0 likes en el momento de la consulta).
- Patrón de dispersión no estándar: el recuento uniforme de no-ceros por fila no coincide con el patrón 2:4 por bloques contiguos que aceleran los tensor cores dispersos de NVIDIA. Salvo que se usen kernels dispersos específicos o se aplique una máscara a nivel de bloque, el ahorro en cómputo puede ser nulo o negativo en GPUs convencionales.
- Riesgo de alucinación: inherente a un modelo de lenguaje base sin alineación; sin RLHF ni filtrado por preferencias documentado.
- Idiomas y sesgos: no documentados. No hay evaluación de sesgos ni de comportamiento multilingüe.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- Riesgo de seguridad en la carga: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio con los permisos del proceso; auditar `modeling_*.py` antes de usarlo en entornos compartidos.
- Dependencia frágil de `flash-linear-attention`: versiones incompatibles de Triton o de `fla` pueden romper la carga o alterar los resultados.
- Contexto no documentado: no se conoce la longitud de contexto efectiva del modelo base; extrapolar más allá de las secuencias de 2.048 tokens usadas en la poda no está validado.
- Artefacto de investigación: el propio autor lo describe como línea base para otros modelos de su cuenta, no como un modelo listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-50pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio oficial de Gated DeltaNet (NVlabs, ICLR 2025): https://github.com/NVlabs/GatedDeltaNet
- Documentación de entrenamiento de GatedDeltaNet: https://deepwiki.com/NVlabs/GatedDeltaNet/6.2-training-a-model
- Modelo hermano con 90 % de dispersión (HGRN): https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-90pct
- Variante de la familia (linear-moe-hub): https://huggingface.co/linear-moe-hub/Gated-Deltanet-1.3B
- Nota sobre Gated DeltaNet-2 de NVIDIA: https://www.marktechpost.com/2026/05/24/nvidia-ai-releases-gated-deltanet-2-a-linear-attention-layer-that-decouples-erase-and-write-in-the-delta-rule/
