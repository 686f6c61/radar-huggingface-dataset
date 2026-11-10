# Jeesup/svd-safety-l2_kfacmixsep24_r50

## Resumen

`svd-safety-l2_kfacmixsep24_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, desarrollado por el usuario Jeesup. No es un modelo conversacional de propósito general, sino un artefacto experimental que forma parte de un estudio sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué reglas de selección de componentes permiten repararlo. El checkpoint concreto aplica una compresión SVD con blanqueado K-FAC agrupado (calibración conjunta de utilidad y seguridad en un único K-FAC) que elimina el 50,00 % de los parámetros densos, seguida de una recuperación mediante LoRA de segunda etapa de SVD-LLM.

El modelo parte de la arquitectura Llama-2-7b-chat: un transformer decoder-only de 6.738.415.616 parámetros (6,74 mil millones) con contexto nativo de 4.096 tokens. Tras la compresión, la fracción de parámetros resultante es de 0,4999. El interés del checkpoint reside en su metodología: la matriz de Fisher se estima sobre un conjunto de calibración mixto que combina ventanas de WikiText-2 (parte de utilidad) con 24 objetivos de JailbreakBench y las negativas del propio Llama-2-7b-chat (parte de seguridad), con una cuota efectiva de seguridad de 0,0110 de los tokens de pérdida.

Es relevante ahora porque cuantifica empíricamente el compromiso entre utilidad y seguridad bajo compresión: el autor advierte explícitamente de que varias ramas del grid están deliberadamente degradadas en seguridad respecto al modelo base, y que la compresión por sí sola eleva la tasa de éxito de ataques. El checkpoint sirve como sujeto experimental para investigar alineamiento y compresión, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante SVD con blanqueado K-FAC |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no se declaran idiomas en la model card ni en los metadatos) |
| Licencia | Llama 2 Community License (`license: llama2`) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only Llama-2 de 7 mil millones de parámetros. Sobre ese checkpoint se aplica una compresión SVD con blanqueado K-FAC agrupado: se estima una única matriz de Fisher aproximada de la forma F = A ⊗ G sobre un conjunto de calibración agrupado (`run_safety_fisher.py`, con lam = 0), y se usa para blanquear las matrices antes de la descomposición SVD, con un presupuesto de rango por matriz al estilo de SVD-LLM. La compresión elimina el 50,00 % de los parámetros, dejando una fracción de 0,4999, con semilla 42.

El conjunto de calibración combina dos fuentes: la parte de utilidad usa WikiText-2 de entrenamiento con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa 24 objetivos de JailbreakBench junto con las negativas generadas por el propio Llama-2-7b-chat, una conversación por muestra (desempaquetada, 6.406 posiciones, 5.797 tokens de respuesta), calculando la pérdida únicamente sobre la negativa. La pérdida G se agrega por suma de tokens (G a partir de la NLL sumada dividida entre 2.047), de modo que todos los tokens de pérdida pesan igual; la cuota efectiva de seguridad es de 0,0110 de los tokens de pérdida y 0,0121 de las posiciones. Tras la compresión se aplica la recuperación LoRA de segunda etapa de SVD-LLM (secuencial U y luego V, sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en formato de chat (pipeline `text-generation`, compatible con text-generation-inference y endpoints).
- Capacidad de rechazo ante peticiones dañinas, aunque degradada respecto al modelo base por efecto de la compresión (ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües específicas.
- No dispone de modo thinking, visión ni audio.
- Capacidad meta: sirve como sujeto de medición de seguridad bajo compresión para estudios de interpretabilidad y alineamiento.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como una celda del grid para medir cómo varía la tasa de éxito de ataques (ASR) al cambiar la regla de selección de componentes y el presupuesto de compresión, comparando contra Llama-2-7b-chat sin comprimir.
- Estudio de reglas de selección de componentes: evaluar si la calibración conjunta de utilidad y seguridad en un único K-FAC (frente a calibraciones separadas) repara mejor el comportamiento de rechazo tras eliminar el 50 % de parámetros.
- Análisis de sobre-rechazo: medir la tasa de sobre-rechazo macro con WildGuard (0,2799 en este checkpoint) para caracterizar el coste en utilidad de las estrategias de recuperación de seguridad.
- Reproducción de experimentos: el checkpoint incluye semilla (42), receta de calibración y configuración LoRA, lo que permite reproducir la celda y verificar la metodología del estudio.
- Evaluación de pipelines de seguridad: integrar el modelo en un arnés de evaluación de jailbreaks (HarmBench como juez, AdvBench y StrongREJECT como conjuntos de ataque) para calibrar detectores y comparar contra el modelo base.
- Docencia y divulgación: ilustrar de forma tangible el compromiso utilidad-seguridad en modelos comprimidos, con métricas concretas de perplejidad (11,8903 en WikiText-2) y precisión zero-shot media (0,4520 en 7 tareas).
- No se recomienda su uso como asistente en producción ni en atención al cliente, dado que el propio autor lo describe como artefacto de investigación y advierte de que varias ramas del grid están degradadas en seguridad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0865 |
| StrongREJECT ASR (juez HarmBench) | 0,1342 |
| Sobre-rechazo macro (WildGuard) | 0,2799 |
| Perplejidad en WikiText-2 | 11,8903 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4520 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras celdas del grid.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (el repositorio ocupa 13,5 GB), más overhead de activaciones y caché KV; en la práctica, unos 16 GB o más para contexto corto.
- En cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits: en torno a 4 GB de pesos (estimaciones a partir del recuento de parámetros; no se documentan cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes y contexto completo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits, siempre que se genere la cuantización a partir de los safetensors.
- Opciones de despliegue: `transformers`, text-generation-inference (el modelo está etiquetado como compatible con endpoints), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documentan artefactos publicados para estas últimas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep24_r50 | 6,74 mil millones (50 % del denso) | 4.096 (heredado) | Llama 2 Community | Checkpoint de investigación con seguridad degradada; ASR AdvBench 0,0865 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad del estudio |
| Otras celdas del grid del mismo autor | ~6,74 mil millones | 4.096 (heredado) | Llama 2 Community | Distintas reglas de selección y presupuestos; no disponibles en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas en la información proporcionada, por lo que no es posible establecer una comparación numérica de rendimiento.

## Limitaciones y advertencias

- El autor advierte de que este checkpoint no es un modelo conversacional de propósito general y debe tratarse como sujeto experimental.
- La compresión por sí sola eleva la tasa de éxito de ataques; varias ramas del grid están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Riesgo de alucinación inherente a Llama-2-7b-chat, sin evaluación específica en este checkpoint.
- Sesgos conocidos del modelo base Llama-2, no reevaluados tras la compresión.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe fiable.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- La licencia Llama 2 Community impone restricciones de uso comercial y obligaciones de atribución; los archivos `LICENSE.txt` y `USE_POLICY.md` están incluidos en el repositorio y vinculan el uso de esta obra derivada.
- El sobre-rechazo macro de 0,2799 indica una tasa apreciable de negativas ante peticiones legítimas, lo que limita su utilidad práctica como asistente.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en producción.
- No se documentan cuantizaciones oficiales ni artefactos GGUF; cualquier despliegue eficiente requiere conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep24_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- SVD-LLM (metodología de compresión y recuperación LoRA): no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- HarmBench (juez de evaluación): no disponible en la información proporcionada
- StrongREJECT (conjunto de ataque): no disponible en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible en la información proporcionada
- WikiText-2 (conjunto de calibración de utilidad): no disponible en la información proporcionada
- alpaca-cleaned (datos de recuperación LoRA): no disponible en la información proporcionada
