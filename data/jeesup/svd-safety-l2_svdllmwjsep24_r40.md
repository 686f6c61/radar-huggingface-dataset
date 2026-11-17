# Jeesup/svd-safety-l2_svdllmwjsep24_r40

## Resumen

`svd-safety-l2_svdllmwjsep24_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40 % de los parámetros densos (quedando un 59,98 % de los originales, es decir, 6.738.415.616 parámetros). El autor, Jeesup, lo publica como una celda de una malla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general.

La compresión se realizó con el estimador SVD-LLM con blanqueado (whitened SVD) del repositorio AIoT-MLSys-Lab/SVD-LLM sobre un conjunto de calibración mixto: ventanas de WikiText-2 (parte de utilidad) y 24 prompts de WildJailbreak con las propias negativas de Llama-2-7b-chat (parte de seguridad). Posteriormente se aplicó la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (U y luego V) sobre alpaca-cleaned. El resultado es un artefacto que mantiene una perplejidad razonable en WikiText-2 (11,325) y una tasa de ataque baja en AdvBench (1,35 %) y StrongREJECT (2,88 %), pero con un sobre-rechazo macro elevado (37,70 %).

Su relevancia es metodológica: proporciona un punto de medida reproducible para cuantificar el compromiso entre utilidad y seguridad bajo compresión, con semilla fija (42) y procedencia detallada. Cualquier uso en producción debe considerarse inapropiado sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (59,98 % del denso original; 40 % de parámetros eliminados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama-2-7b-chat: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no verificada) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Llama-2-7b-chat. La compresión se realiza con SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección basada en un SVD blanqueado (`S S^T = sum_WikiText x x^T + sum_safety x x^T`). El conjunto de calibración combina 255 ventanas de 2048 tokens de WikiText-2 train (muestreo del propio SVD-LLM, semilla 42, todas las posiciones) con los primeros 24 de 512 prompts de WildJailbreak train (vanilla y adversarial dañinos) emparejados con las negativas generadas por Llama-2-7b-chat, en orden de semilla 42, una conversación por muestra (7644 posiciones). La proporción efectiva de posiciones de seguridad es de 0,0144.

Tras la compresión al 60 % se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre los factores U y luego V, entrenado con alpaca-cleaned, rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta RLHF ni DPO adicionales más allá del alineamiento heredado de Llama-2-7b-chat. La innovación técnica reside en el uso conjunto de calibración de utilidad y seguridad para preservar el comportamiento de rechazo bajo compresión, y en la evaluación sistemática de reglas de selección de componentes.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat (formato de chat con etiquetas `[INST]`/`[/INST]`).
- Razonamiento y respuesta a instrucciones de complejidad moderada, condicionado por la pérdida de capacidad por compresión.
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench ASR (0,0135) y StrongREJECT ASR (0,0288) usando el juez HarmBench.
- Capacidad multilingüe: no documentada; se asume la de Llama-2-7b-chat, pero no está verificada en este checkpoint.
- Tool calling / function calling: no documentado ni verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo del artefacto.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking).

## Casos de uso

- Estudio de robustez de seguridad bajo compresión: usar el checkpoint como celda de control para medir cómo varía la tasa de éxito de ataque (ASR) al reducir parámetros, comparando con el modelo denso original y con otras celdas de la malla.
- Investigación sobre reglas de selección de componentes SVD: evaluar si la regla de selección basada en utilidad + seguridad preserva mejor el rechazo que reglas basadas solo en utilidad, usando las métricas publicadas como referencia.
- Análisis del sobre-rechazo: el 37,70 % de sobre-rechazo macro (WildGuard) lo hace útil para estudiar el coste en utilidad conversacional que introduce la calibración orientada a seguridad.
- Reproducción de experimentos: la semilla fija (42), el detalle de calibración y la procedencia permiten replicar el pipeline SVD-LLM + LoRA de etapa 2 en un entorno controlado.
- Evaluación de pipelines de compresión: integrarlo como caso de prueba en herramientas de compresión de modelos para verificar que las métricas de seguridad se monitorizan junto a las de perplejidad.
- Docencia y formación en interpretabilidad: ejemplo práctico de cómo una descomposición SVD afecta a comportamientos alineados, con métricas cuantitativas asociadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Sobre-rechazo macro (WildGuard) | 0,3770 |
| Perplejidad WikiText-2 | 11,3250 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4895 |

No se proporcionan resultados desglosados por tarea ni comparación con el modelo denso original en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- Cuantización a 8 bits: alrededor de 7 GB de pesos; a 4 bits: alrededor de 3,5-4 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 y en GPUs de 8-12 GB con cuantización a 4 bits (no verificado).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM previa conversión (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep24_r40 | 6.738 M | No disponible | Llama 2 Community | Checkpoint comprimido de investigación, ASR bajo con sobre-rechazo alto |
| meta-llama/Llama-2-7b-chat-hf | 6.738 M | 4096 | Llama 2 Community | Modelo denso base; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | Variable | No disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; comparación directa dentro del estudio |

No se dispone de datos de benchmarks del modelo denso original en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Degradación de seguridad por compresión: la propia model card advierte que varias celdas de la malla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque.
- Sobre-rechazo elevado: 37,70 % macro, lo que implica rechazos indebidos frecuentes en conversaciones benignas.
- Pérdida de utilidad: precisión media zero-shot de 0,4895 en 7 tareas, por debajo de lo esperable en el modelo denso (no se aporta la cifra original para comparar).
- Idiomas soportados no documentados; el comportamiento multilingüe puede haberse degradado con la compresión.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente superior al del modelo denso por la pérdida de parámetros.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática, políticas de uso aceptable en `USE_POLICY.md`).
- Sin garantías de tool calling ni de comportamiento agéntico; no usar en pipelines automatizados sin validación.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep24_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (estimador): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso de Llama 2: https://ai.meta.com/llama/use-policy/
