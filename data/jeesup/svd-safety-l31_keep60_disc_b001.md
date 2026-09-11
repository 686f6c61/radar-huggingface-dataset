# Jeesup/svd-safety-l31_keep60_disc_b001

## Resumen

`Jeesup/svd-safety-l31_keep60_disc_b001` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta el 60,08 % de la fracción de parámetros densos (un 39,92 % de parámetros eliminados) y posteriormente reparado con un presupuesto del 0,100 % de parámetros densos destinado a restaurar componentes SVD seleccionados por la regla `disc`. En total se restauran 1.240 componentes y no se sustituye ninguno. Lo publica el usuario Jeesup como artefacto experimental, no como asistente desplegable.

El problema que aborda es la pérdida de comportamiento seguro inducida por la compresión: según la propia model card, la compresión por sí sola eleva la tasa de éxito de ataque (ASR) frente al modelo original, y el objetivo del estudio es cuantificar ese daño y comprobar qué regla de selección de componentes lo repara mejor. Este checkpoint es una celda concreta de una cuadrícula de reglas y presupuestos, con semilla 42, por lo que su valor es experimental y comparativo, no de producto.

La arquitectura subyacente es la de Llama 3.1 8B: transformer decoder-only con atención agrupada (GQA), RoPE y SwiGLU, con 8.030.261.248 parámetros almacenados en el repositorio y 16,1 GB de tamaño total. Las métricas publicadas son de seguridad (AdvBench ASR 0,4308; StrongREJECT ASR 0,4281 con juez HarmBench), de sobre-rechazo (0,0885 macro con WildGuard) y de perplejidad en WikiText-2 (24,9794).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1: GQA, RoPE, SwiGLU, RMSNorm) con compresión SVD-LLM de bajo rango |
| Parámetros totales | 8.030.261.248 según metadatos de safetensors; la model card declara una fracción resultante de 0,6008 sobre los parámetros densos (no se especifica el recuento exacto tras la compresión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens heredados de la configuración de Llama-3.1-8B-Instruct; la model card no indica si la compresión altera la ventana útil |
| Tipos de cuantización | No se distribuyen cuantizaciones en el repositorio (solo safetensors en precisión completa/bf16). Es posible cuantizar externamente a GGUF, AWQ o GPTQ, pero no hay versiones publicadas ni validadas por el autor |
| Idiomas soportados | No disponible (la ficha de HuggingFace no declara idiomas; el modelo base es multilingüe, pero no se ha verificado el efecto de la compresión sobre otros idiomas) |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.030 millones de parámetros con atención agrupada, codificación posicional rotatoria (RoPE), activación SwiGLU y normalización RMSNorm. Sobre ese checkpoint se aplica SVD-LLM, un método de compresión que aproxima matrices de pesos mediante descomposición en valores singulares y descarta componentes de bajo rango: en esta celda se elimina el 39,92 % de los parámetros. Después se restauran 1.240 componentes SVD seleccionados con la regla denominada `disc`, consumiendo un presupuesto del 0,100 % de los parámetros densos. La fracción de parámetros resultante declarada es 0,6008 y la semilla del experimento es 42.

No se ha realizado ningún entrenamiento adicional de alineamiento sobre esta celda: la intervención es puramente de compresión y reconstrucción de componentes, sin RLHF ni DPO posteriores. La model card indica explícitamente que varias celdas de la cuadrícula están «deliberadamente degradadas en seguridad» respecto a Llama-3.1-8B-Instruct, y que el propósito del estudio es cuantificar el aumento del ASR provocado por la compresión y probar estrategias de recuperación. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni innovaciones adicionales de decodificación.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama-3.1-8B-Instruct (etiquetas de rol de sistema, usuario y asistente).
- Razonamiento y conocimiento general: presumiblemente equivalente al del modelo base, aunque no hay benchmarks de capacidad (MMLU, GSM8K, HumanEval) publicados para esta celda.
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada ni verificada tras la compresión en la información disponible.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingües: no declaradas; el modelo base es multilingüe, pero la ficha no aporta verificación.
- Capacidad diferencial medida: es un sujeto de prueba para medir tasa de éxito de ataque (ASR) y sobre-rechazo. Los valores publicados son AdvBench ASR 0,4308, StrongREJECT ASR 0,4281 y macro over-refusal 0,0885.
- No dispone de modo «thinking», visión ni audio.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: usar el checkpoint como una de las condiciones experimentales de la cuadrícula para medir cómo varía el ASR al cambiar la regla de selección de componentes y el presupuesto de restauración, con HarmBench como juez.
- Red teaming comparativo: emplearlo como objetivo de ataque en baterías automatizadas (AdvBench, StrongREJECT) para cuantificar la degradación de seguridad introducida por la compresión frente al modelo denso original.
- Estudio de la relación compresión-seguridad: analizar la curva entre fracción de parámetros (0,6008 en esta celda) y las métricas de seguridad y perplejidad (WikiText-2 PPL 24,9794), replicando el experimento con la semilla 42.
- Evaluación de sobre-rechazo: utilizar la métrica macro over-refusal (0,0885 con WildGuard) para estudiar si la compresión reduce las negativas ante peticiones benignas, un fallo habitual en modelos comprimidos.
- Base para técnicas de reparación de seguridad: aplicar fine-tuning de seguridad, DPO o filtrado de datos sobre este checkpoint y medir la recuperación de ASR respecto a la celda sin reparar.
- Benchmarking de infraestructura de inferencia: al mantener el tamaño de arquitectura de Llama 3.1 8B, sirve para comparar latencia y throughput de vLLM, TGI, SGLang o llama.cpp bajo las mismas condiciones que el modelo denso.
- Estudio de interpretabilidad: inspeccionar qué componentes SVD seleccionados por la regla `disc` están asociados a comportamientos de rechazo o de cumplimiento de instrucciones.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una intervención de compresión de bajo rango afecta a propiedades de alineamiento, con métricas reproducibles y licencia conocida.

## Benchmarks y rendimiento

| Métrica | Valor | Herramienta de evaluación |
|---|---|---|
| AdvBench ASR | 0,4308 | Juez HarmBench |
| StrongREJECT ASR | 0,4281 | Juez HarmBench |
| Macro over-refusal | 0,0885 | WildGuard |
| Perplejidad WikiText-2 | 24,9794 | WikiText-2 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K o similares) en la información disponible. Tampoco se incluyen los valores del modelo denso de referencia para comparar directamente el ASR, aunque la model card afirma que la compresión por sí sola eleva la tasa de éxito de ataque.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,1 GB solo para pesos (tamaño del repositorio), más caché KV; en la práctica conviene reservar 20-24 GB para contexto largo.
- VRAM estimada cuantizado: en 8 bits, en torno a 9 GB; en 4 bits, en torno a 5 GB más sobrecarga de contexto.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S (48 GB), RTX 4090 o RTX 3090 (24 GB) para bf16. Para cuantización de 4 bits son suficientes tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
- ¿Cabe en GPU de consumo? Sí en bf16 en tarjetas de 24 GB; con cuantización de 4 bits cabe en tarjetas de 12 GB. En tarjetas de 8 GB solo con cuantizaciones muy agresivas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, SGLang, y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponible. El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Seguridad medida |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l31_keep60_disc_b001 | 8.030.261.248 almacenados; fracción declarada 0,6008 del denso | 128.000 tokens (heredado) | Llama 3.1 Community License | Pública en HuggingFace, 0 descargas | AdvBench ASR 0,4308; StrongREJECT ASR 0,4281; over-refusal 0,0885; PPL WikiText-2 24,9794 |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | Pública y ampliamente desplegada | No disponible en la información proporcionada |
| Otras celdas de la cuadrícula del mismo autor (otras reglas y presupuestos) | No disponible | No disponible | Llama 3.1 Community License | No disponible en la información proporcionada | No disponible en la información proporcionada |

La información disponible no incluye otros modelos comparables de compresión (por ejemplo, destilaciones o podas de Llama 3.1 8B) con métricas publicadas, por lo que la comparación cuantitativa queda limitada al modelo base.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que «no es un modelo de chat de propósito general» y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada: parte de la cuadrícula está deliberadamente degradada en seguridad respecto al modelo base, y el ASR medido supera el 43 % en AdvBench y StrongREJECT con juez HarmBench. No debe exponerse a usuarios finales.
- Riesgo de alucinación: no se ha evaluado la fidelidad factual tras la compresión; la única métrica de calidad lingüística publicada es la perplejidad en WikiText-2 (24,9794), que es alta en términos absolutos.
- Sesgos: no se han publicado evaluaciones de sesgo para este checkpoint. Los sesgos heredados de Llama-3.1-8B-Instruct pueden verse alterados por la compresión, sin que exista documentación al respecto.
- Idiomas: la ficha no declara idiomas soportados ni evalúa el impacto de la compresión fuera del inglés. El rendimiento en castellano no está verificado.
- Discrepancia de parámetros: el recuento real de safetensors (8.030.261.248) coincide con el del modelo denso, mientras que la model card declara una fracción resultante de 0,6008. Conviene verificar la estructura real de los tensores antes de asumir el ahorro de memoria declarado.
- Ahorro de recursos limitado: dado el punto anterior, no debe presuponerse que el checkpoint ocupa menos VRAM que Llama-3.1-8B-Instruct; el tamaño del repositorio es de 16,1 GB.
- Validación inexistente: 0 descargas, 0 likes y ningún benchmark de capacidad estándar publicado. Cualquier uso requiere evaluación propia previa.
- Licencia: Llama 3.1 Community License. El uso comercial está sujeto a sus condiciones (umbral de usuarios activos mensuales, obligación de incluir copia de la licencia y el `USE_POLICY.md`, y de mantener la atribución «Built with Llama»). Las obras derivadas deben incluir «Llama» en el nombre. Es responsabilidad del usuario revisar `LICENSE` y `USE_POLICY.md` incluidos en el repositorio.
- Resistencia al jailbreak: cualquier despliegue intermedio requeriría capas adicionales de moderación, dado el ASR documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep60_disc_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia en el repositorio: https://huggingface.co/Jeesup/svd-safety-l31_keep60_disc_b001/blob/main/LICENSE
- Política de uso en el repositorio: https://huggingface.co/Jeesup/svd-safety-l31_keep60_disc_b001/blob/main/USE_POLICY.md
- Método de compresión SVD-LLM: citado en la model card, pero no se proporciona URL en la información disponible
- Juez HarmBench: mencionado como herramienta de evaluación, sin URL en la información disponible
- WildGuard: mencionado como herramienta de evaluación, sin URL en la información disponible
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo (los resultados obtenidos correspondían a foros y contenidos sin relación).
