# Jeesup/svd-safety-l3_svdllmjbbsep6_r40

## Resumen

svd-safety-l3_svdllmjbbsep6_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup en Hugging Face. No se trata de un modelo conversacional de propósito general, sino de una celda concreta dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo mejor. El modelo conserva el 59,98 % de los parámetros densos del original (se elimina un 40 %), aplicando SVD-LLM con un conjunto de calibración combinado de utilidad y seguridad, seguido de una recuperación mediante LoRA en dos etapas.

Arquitectura transformer decoder-only de la familia Llama 3, con 8.030.261.248 parámetros efectivos tras la compresión, pesos en safetensors y compatibilidad con la librería transformers y text-generation-inference. El contexto máximo no se documenta en la información disponible, aunque al derivar de Llama-3-8B-Instruct lo esperable es la ventana nativa de 8.192 tokens de esa familia; se indica como no disponible al no confirmarse en la model card.

Su relevancia es metodológica: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot en siete tareas) y seguridad (tasa de éxito de ataques en AdvBench y StrongREJECT) bajo compresión agresiva. El autor advierte explícitamente de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad y de que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM con recuperación LoRA |
| Parametros totales | 8.030.261.248 (59,98 % del denso original; 40 % de parámetros eliminados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El punto de partida es Meta-Llama-3-8B-Instruct, un transformer decoder-only denso. Sobre él se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos y trunca componentes según una regla de selección basada en utilidad estimada con un SVD blanqueado (implementación de AIoT-MLSys-Lab/SVD-LLM). La matriz de calibración se construye como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, es decir, se agregan posiciones de WikiText-2 y de un conjunto de seguridad. El presupuesto objetivo es el 60 % de parámetros densos, con semilla 42.

La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones. La parte de seguridad usa los primeros 6 de los 94 objetivos de JailbreakBench, emparejados con las negativas del propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada, lo que resulta en 303 posiciones. La proporción efectiva de posiciones de seguridad es de solo 0,0006 del total, un detalle clave para interpretar los resultados. Tras el truncado SVD se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y por el propósito experimental del checkpoint.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3, sujeto a la pérdida de calidad asociada al truncado SVD.
- Capacidad multilingüe no documentada en la model card para este derivado.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.
- El interés principal no es su capacidad operativa, sino servir como objeto de medición de seguridad bajo compresión.

## Casos de uso

- Investigación sobre compresión de LLM: usar el checkpoint como celda de referencia para reproducir el efecto de SVD-LLM al 60 % de parámetros sobre un modelo Llama 3, comparando perplejidad y precisión zero-shot con el denso original.
- Estudio de degradación de seguridad: medir la tasa de éxito de ataques (AdvBench, StrongREJECT) frente a Llama-3-8B-Instruct para cuantificar cuánto empeora la alineación tras el truncado y la recuperación LoRA.
- Evaluación de reglas de selección de componentes: contrastar esta celda (calibración combinada utilidad + seguridad) con otras celdas de la cuadrícula del mismo autor para determinar qué criterio preserva mejor la negativa ante peticiones dañinas.
- Análisis de sobre-rechazo: emplear la métrica de sobre-rechazo macro (WildGuard) para estudiar si la calibración con datos de seguridad incrementa las negativas ante peticiones benignas.
- Reproducibilidad de pipelines de compresión: servir de ejemplo verificable de la receta completa (SVD blanqueado, presupuesto, LoRA secuencial U/V con hiperparámetros concretos) para replicar el procedimiento en otros modelos.
- Auditoría de artefactos derivados: usar el checkpoint como caso de prueba en herramientas de evaluación de seguridad antes de autorizar la publicación o el uso de modelos comprimidos en producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3365 |
| StrongREJECT ASR (juez HarmBench) | 0,3674 |
| Sobre-rechazo macro (WildGuard) | 0,1488 |
| Perplejidad en WikiText-2 | 28,7200 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,5008 |

No se proporcionan en la información disponible los valores del modelo base sin comprimir para estas mismas métricas, por lo que no es posible calcular aquí la degradación relativa exacta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03 mil millones de parámetros), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- En cuantización de 8 bits, aproximadamente 8-9 GB de VRAM; en 4 bits, alrededor de 5-6 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16, y en tarjetas de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep6_r40 | 8,03 B (comprimido al 60 %) | No disponible | Llama 3 Community | Artefacto de investigación con seguridad degradada; ASR AdvBench 0,3365 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B (denso) | 8.192 tokens (nativo de la familia) | Llama 3 Community | Modelo base; referencia de utilidad y seguridad frente al que se mide la compresión |
| Otras celdas de la cuadrícula del mismo autor (Jeesup/svd-safety-*) | ~8 B comprimidos | No disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; comparables directamente por diseño experimental |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos alternativos para completar una comparación numérica de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint no es una excepción.
- No es un asistente desplegable: es un sujeto experimental y debe evaluarse antes de extraer conclusiones.
- La calibración de seguridad cubre solo 303 posiciones (6 objetivos de JailbreakBench), un 0,0006 del total de posiciones de calibración, lo que limita la representatividad de la señal de seguridad.
- Riesgo de alucinación y de respuestas inseguras superior al del modelo base; no se documentan mitigaciones adicionales.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del original.
- Licencia Meta Llama 3 Community: restricciones de uso comercial y obligaciones de la política de uso aceptable; el uso de este derivado está sujeto a LICENSE y USE_POLICY.md incluidos en el repositorio.
- No se documentan cuantizaciones oficiales ni contexto máximo verificado para este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep6_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
