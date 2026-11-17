# Jeesup/svd-safety-l2_svdllmjbbsep12_r40

## Resumen

svd-safety-l2_svdllmjbbsep12_r40 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales (6.738.415.616 parámetros, fracción resultante 0,5998) y posteriormente recuperado con la etapa 2 de SVD-LLM basada en LoRA. Lo publica el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión, con semilla 42 y un conjunto de calibración que combina utilidad (WikiText-2) y seguridad (JailbreakBench). Su interés radica en que permite cuantificar el compromiso entre utilidad y seguridad bajo compresión, un eje poco documentado en la literatura de compresión de modelos.

La relevancia es metodológica: ofrece métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobretasa de rechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en 7 tareas, lo que lo convierte en un sujeto de estudio reproducible para quien investigue compresión, alineación o interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (60,0 % del denso original de Llama-2-7b-chat) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama 2; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card no documenta cuantizaciones) |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base es mayoritariamente inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers; repo de 13,5 GB) |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only con atención causal estándar. Sobre él se aplica SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección basada en utilidad; en este caso se elimina el 40,00 % de los parámetros, dejando una fracción de 0,5998. La estimación usa el SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un conjunto de calibración agrupado: la matriz S·Sᵀ suma las activaciones de WikiText-2 y las del conjunto de seguridad, de modo que la selección de componentes tiene en cuenta ambas señales.

El conjunto de calibración es `wikitext2:256 + jbb_harm_resp_sep:12`. La parte de utilidad usa el train de WikiText-2 con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 12 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra sin empaquetar, con 3140 posiciones. La cuota efectiva de seguridad es de solo 0,0060 de las posiciones, un desequilibrio deliberado que conviene tener presente al interpretar los resultados.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta en la información disponible ningún proceso adicional de RLHF o DPO más allá del ya presente en el modelo base.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresión (perplejidad WikiText-2 de 11,3830).
- Razonamiento y conocimiento general medido en 7 tareas zero-shot, con precisión media de 0,4910 (acc_norm donde se reporta).
- Comportamiento de rechazo ante peticiones dañinas, cuantificado con ASR de 0,0288 en AdvBench y 0,0415 en StrongREJECT (juez HarmBench).
- Respuesta a jailbreaks, evaluada con la sobretasa de rechazo macro de WildGuard (0,3113).
- Capacidad de servir como sujeto experimental para estudiar seguridad bajo compresión, no como asistente desplegable.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles (no se documentan y el modelo base Llama-2-7b-chat no los incorpora de forma nativa).

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para medir cuánto degrada SVD-LLM la utilidad (perplejidad 11,3830) y la seguridad (ASR 0,0288 en AdvBench) frente al denso original.
- Estudio de reglas de selección de componentes: comparar esta regla (utilidad + seguridad agrupadas) con otras celdas de la rejilla para determinar qué criterio preserva mejor el comportamiento de rechazo.
- Evaluación de alineación bajo perturbaciones: emplear las métricas de WildGuard (0,3113 de sobretasa de rechazo) para analizar el equilibrio entre rechazo excesivo y vulnerabilidad a ataques.
- Reproducibilidad de experimentos: el uso de semilla 42, conjuntos de calibración documentados y receta LoRA explícita permite replicar el pipeline de compresión y recuperación.
- Análisis de interpretabilidad: inspeccionar qué componentes SVD se descartan y cómo se correlacionan con la pérdida de capacidades de seguridad, dado el desequilibrio de la cuota de seguridad (0,0060 de posiciones).
- Docencia y formación: ilustrar en cursos de compresión y seguridad el compromiso entre tamaño, utilidad y robustez con métricas concretas y reproducibles.
- Referencia para pipelines de evaluación: integrar el checkpoint en arneses de evaluación de seguridad (HarmBench, WildGuard, JailbreakBench) como caso de estudio controlado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0288 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Sobre-rechazo macro (WildGuard) | 0,3113 |
| Perplejidad WikiText-2 | 11,3830 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4910 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni frente al Llama-2-7b-chat denso sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5 GB (estimaciones a partir del número de parámetros; la model card no documenta cuantizaciones).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alto throughput; RTX 4090 (24 GB) para inferencia en bf16 con margen; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 8-12 GB requiere cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y por compatibilidad con Llama 2 cabría esperar vLLM y llama.cpp/Ollama, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep12_r40 | 6.738.415.616 (60,0 % del denso) | 4096 (heredado) | Llama 2 Community License | Comprimido con SVD-LLM, artefacto de investigación; ASR AdvBench 0,0288, perplejidad 11,3830 |
| meta-llama/Llama-2-7b-chat-hf | ~6.738 M (denso completo) | 4096 | Llama 2 Community License | Modelo base sin comprimir; referencia para medir la degradación |
| Otras celdas de la rejilla del mismo autor | Variable según presupuesto | 4096 (heredado) | Llama 2 Community License | Reglas de selección y presupuestos distintos; no disponibles los detalles concretos |

No se dispone en la información proporcionada de comparativas con modelos de otros autores de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación y pérdida de calidad por compresión: la perplejidad en WikiText-2 es de 11,3830 y la precisión media zero-shot de 0,4910, sin comparación publicada con el denso.
- La cuota efectiva de seguridad en la calibración es muy baja (0,0060 de las posiciones), lo que puede sesgar la preservación de comportamientos de rechazo.
- Sobretasa de rechazo macro de 0,3113 en WildGuard, indicativa de rechazos excesivos en consultas benignas.
- Idiomas soportados no declarados; el modelo base está orientado mayoritariamente al inglés.
- Licencia Llama 2 Community License: el uso comercial está sujeto a LICENSE.txt y USE_POLICY.md incluidos en el repositorio; existen restricciones de uso y obligaciones de atribución ("Built with Llama 2").
- Sesgos conocidos del modelo base Llama 2 no reevaluados en esta ficha; no disponibles métricas específicas de sesgo para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep12_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Paper de SVD-LLM: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
