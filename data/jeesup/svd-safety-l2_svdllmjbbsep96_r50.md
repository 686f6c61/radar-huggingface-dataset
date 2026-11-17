# Jeesup/svd-safety-l2_svdllmjbbsep96_r50

## Resumen

`svd-safety-l2_svdllmjbbsep96_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos originales (fracción resultante 0,4999). Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo. No es un modelo conversacional de propósito general.

El checkpoint es una celda concreta de una cuadrícula experimental que cruza distintas reglas de selección de componentes con distintos presupuestos de compresión. En este caso, la calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (96 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-2-7b-chat), con una cuota efectiva de posiciones dedicadas a seguridad del 4,64 %. Tras la compresión se aplicó una recuperación de segunda etapa con LoRA secuencial sobre U y luego V, entrenada con alpaca-cleaned.

Su relevancia es metodológica: proporciona métricas medidas de tasa de éxito de ataque (ASR) y de sobre-rechazo bajo compresión, lo que permite cuantificar el compromiso entre utilidad y seguridad. El autor advierte explícitamente de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad y de que cualquier checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD-LLM con recuperación LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (≈6,74 mil millones; 49,99 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (modelo base Llama-2-7b-chat: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 2 con 7 mil millones de parámetros. Sobre ella se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos mediante SVD blanqueada (implementación de AIoT-MLSys-Lab/SVD-LLM) y descarta componentes según una regla de selección, en este caso guiada por un conjunto de calibración agrupado que suma la matriz de covarianza de WikiText-2 y la de un conjunto de seguridad: `S Sᵀ = Σ_WikiText x xᵀ + Σ_safety x xᵀ`. El presupuesto de compresión es del 50,00 % de parámetros eliminados.

El conjunto de calibración se compone de WikiText-2 train (255 ventanas de 2048 tokens, muestreador de SVD-LLM, semilla 42, todas las posiciones) y de los primeros 96 de 96 objetivos de JailbreakBench emparejados con los rechazos del propio Llama-2-7b-chat (semilla 42, una conversación por muestra, 25.433 posiciones). La cuota efectiva de posiciones de seguridad es de 0,0464. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global del experimento es 42.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat y parcialmente preservada tras la compresión.
- Razonamiento de propósito general y respuesta a instrucciones, con calidad degradada respecto al modelo denso (perplejidad WikiText-2 de 13,6943 y precisión media zero-shot de 0,4547 en 7 tareas).
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench (ASR 0,0000) y StrongREJECT (ASR 0,0288) bajo el juez HarmBench.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor lo describe como artefacto de investigación, no como asistente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cómo varía la perplejidad y la precisión zero-shot al eliminar el 50 % de parámetros con una regla de selección concreta.
- Estudio del compromiso seguridad-utilidad: permite comparar la ASR de AdvBench y StrongREJECT frente a la del Llama-2-7b-chat denso y frente a otras celdas de la cuadrícula con distintas cuotas de calibración de seguridad.
- Evaluación de métodos de reparación post-compresión: la recuperación LoRA de etapa 2 sobre alpaca-cleaned puede replicarse o sustituirse para medir su efecto sobre el sobre-rechazo (0,6407 macro en WildGuard) y sobre la utilidad.
- Análisis de sensibilidad de la regla de selección SVD: al variar la mezcla WikiText-2 / JailbreakBench en la matriz de covarianza se puede aislar qué componentes del modelo sostienen el comportamiento de rechazo.
- Reproducibilidad de pipelines de compresión: el checkpoint documenta semilla, muestreador, número de ventanas y parámetros LoRA, lo que facilita reproducir el experimento con la implementación de AIoT-MLSys-Lab/SVD-LLM.
- Docencia y divulgación sobre alineación y compresión: útil para ilustrar con números concretos que la compresión puede elevar la tasa de éxito de ataque si no se calibra con datos de seguridad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0000 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Macro over-refusal (WildGuard) | 0,6407 |
| Perplejidad WikiText-2 | 13,6943 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4547 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (tamaño del repo 13,5 GB), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB. No se publican variantes cuantizadas oficiales, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta última con margen suficiente para contexto moderado).
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB en bf16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión previa a los formatos correspondientes, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep96_r50 | 6,74 B (49,99 % del denso) | no disponible | Llama 2 Community | Checkpoint experimental comprimido; ASR AdvBench 0,0000, StrongREJECT 0,0288, perplejidad WikiText-2 13,6943 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad para este estudio |
| Otras celdas de la cuadrícula SVD-LLM del mismo autor | ≈6,74 B | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; algunas deliberadamente degradadas en seguridad |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint es un artefacto de investigación y no un modelo conversacional de propósito general; no debe desplegarse como asistente.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque y este checkpoint debe evaluarse antes de extraer conclusiones.
- El macro de sobre-rechazo medido es alto (0,6407 en WildGuard), lo que indica una tendencia marcada a rechazar peticiones legítimas.
- La perplejidad WikiText-2 de 13,6943 y la precisión media zero-shot de 0,4547 reflejan una degradación de utilidad respecto al modelo denso de partida.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el del modelo base y probablemente se agrava por la compresión.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los de Llama-2-7b-chat.
- Idiomas soportados: no disponibles; el conjunto de calibración y recuperación es fundamentalmente en inglés (WikiText-2, JailbreakBench, alpaca-cleaned).
- Licencia: Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso comercial está sujeto a sus restricciones (entre ellas, la política de uso aceptable de Meta).
- Longitud de contexto efectiva tras la compresión: no verificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep96_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- WikiText-2: https://huggingface.co/datasets/wikitext
- alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- HarmBench: https://github.com/centerforaisafety/HarmBench
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- WildGuard: https://huggingface.co/allenai/wildguard
- AdvBench: https://github.com/llm-attacks/llm-attacks
