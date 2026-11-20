# Jeesup/svd-safety-l3_svdllmjbbsep12_r50

## Resumen

`svd-safety-l3_svdllmjbbsep12_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar aproximadamente el 50% de los parámetros densos del modelo original (fracción resultante de 0,4997) y posteriormente recuperado con una etapa de LoRA sobre alpaca-cleaned. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño.

No es un modelo de propósito general ni un asistente desplegable: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión. La calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad muy pequeño (12 de los 94 objetivos de JailbreakBench con las negativas del propio Llama-3-8B-Instruct), lo que da una cuota efectiva de seguridad de solo 0,0012 de las posiciones.

Su relevancia es metodológica: cuantifica el compromiso entre utilidad y seguridad bajo compresión y sirve como referencia para quien investigue interpretabilidad, compresión de modelos o robustez frente a jailbreaks. El modelo base tiene 8.030.261.248 parámetros y una ventana de contexto de 8.192 tokens (heredada de Llama 3 8B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B Instruct), comprimido por SVD-LLM + LoRA de recuperación |
| Parametros totales | 8.030.261.248 (fracción densa resultante 0,4997 respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el base Llama 3 8B está entrenado oficialmente en inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Llama 3 8B Instruct y se comprime con SVD-LLM, el estimador de SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM), aplicado sobre un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los 12 primeros de los 94 objetivos de JailbreakBench con las negativas propias de Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada (645 posiciones, todas ellas). Se elimina el 50,00% de los parámetros.

Tras la compresión se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. La innovación técnica destacable no es arquitectónica sino metodológica: el uso de una regla de selección de componentes guiada por seguridad además de por utilidad, y la cuantificación del efecto de esa regla sobre la tasa de éxito de ataques.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama-3-8B-Instruct, aunque la compresión y el LoRA de recuperación alteran su comportamiento.
- Razonamiento y conocimiento general: la precisión zero-shot media medida es de 0,4536 en 7 tareas (acc_norm donde se reporta), por debajo del base.
- Respuesta a instrucciones: el ajuste LoRA sobre alpaca-cleaned preserva parte de la capacidad de seguir instrucciones.
- Multilingüismo: no declarado en la model card; el base soporta oficialmente ocho idiomas, pero no hay evaluación de este checkpoint en ellos.
- Tool calling / function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponible.
- Comportamiento de seguridad medible: es la capacidad central del artefacto, con tasas de ataque y de sobrerrechazo cuantificadas (ver benchmarks).

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia en una malla de reglas de selección y presupuestos, comparando su perplejidad y precisión con otras celdas para aislar el efecto de la regla de selección.
- Estudio de degradación de seguridad: medir cómo la compresión al 50% eleva la tasa de éxito de ataques (ASR de 0,4115 en AdvBench) frente al modelo sin comprimir, y usar ese delta como métrica de robustez.
- Evaluación de mecanismos de recuperación: servir como sujeto experimental para probar si la etapa LoRA de SVD-LLM repara el daño en seguridad, comparando con variantes sin recuperación.
- Calibración de conjuntos de seguridad: analizar el efecto de una cuota de seguridad tan baja (0,0012 de posiciones) sobre el compromiso utilidad-seguridad y diseñar conjuntos de calibración mejores.
- Benchmarking de robustez frente a jailbreaks: ejecutar AdvBench, StrongREJECT y WildGuard sobre este checkpoint como línea base degradada en un pipeline de evaluación de seguridad.
- Análisis de interpretabilidad: inspeccionar qué componentes (U, V) selecciona la regla guiada por seguridad y correlacionarlo con las capas y cabezas responsables de las negativas.
- Docencia y reproducibilidad: replicar el pipeline SVD-LLM con semilla 42 y los conjuntos documentados para verificar los números publicados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4115 |
| StrongREJECT ASR (juez HarmBench) | 0,2364 |
| Macro over-refusal (WildGuard) | 0,3777 |
| Perplejidad WikiText-2 | 90,1499 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4536 |

No se han publicado en la información disponible resultados comparativos con el modelo base sin comprimir ni con otras celdas de la malla; los valores anteriores son las únicas métricas documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 M parámetros × 2 bytes), más caché KV y activaciones; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: unos 8 GB de pesos; en 4 bits, unos 4 GB, aunque no se publican cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con contexto moderado, y en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep12_r50 (este) | 8.030 M (50% denso) | 8.192 | Llama 3 Community | Artefacto de investigación con seguridad degradada medida (ASR 0,4115) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8.030 M | 8.192 | Llama 3 Community | Distintas reglas de selección y presupuestos; no disponibles en la información proporcionada |
| Modelos comprimidos por poda/SVD de la literatura (p. ej. variantes SVD-LLM publicadas) | variable | variable | variable | No disponibles datos concretos en la información proporcionada |

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor lo describe como sujeto experimental y recomienda evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la malla: la compresión por sí sola eleva la tasa de éxito de ataques; en este checkpoint el ASR de AdvBench es de 0,4115.
- Perplejidad elevada en WikiText-2 (90,1499) y precisión zero-shot media de 0,4536, lo que indica pérdida sustancial de utilidad frente al base.
- Sobrerechazo macro de 0,3777 (WildGuard), es decir, rechaza peticiones legítimas con frecuencia.
- Conjunto de calibración de seguridad muy pequeño (12 objetivos, 645 posiciones, cuota efectiva 0,0012), lo que limita la representatividad del ajuste.
- Idiomas soportados no declarados; no hay evaluación multilingüe de este checkpoint.
- Riesgo de alucinación no cuantificado en la información disponible, pero esperable por la compresión y el ajuste sobre alpaca-cleaned.
- Licencia Llama 3 Community: el uso comercial está sujeto a `LICENSE` y `USE_POLICY.md` incluidos en el repositorio, con las restricciones habituales de la licencia de Meta (umbral de usuarios activos mensuales, atribución "Built with Meta Llama 3" y política de uso aceptable).
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep12_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Conjunto de calibración de seguridad JailbreakBench: no disponible como enlace en la información proporcionada
- Conjunto alpaca-cleaned: no disponible como enlace en la información proporcionada
- Paper de SVD-LLM: no disponible como enlace en la información proporcionada
