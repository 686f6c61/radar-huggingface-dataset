# Jeesup/svd-safety-l2_svdllmjbb48orc96_r40

## Resumen

svd-safety-l2_svdllmjbb48orc96_r40 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante SVD-LLM hasta conservar el 60,0% de los parámetros densos (40,00% eliminados; fracción resultante 0,5998) y posteriormente recuperado con una etapa de LoRA secuencial (U y luego V, sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Es una celda concreta de una cuadrícula sobre reglas de selección y presupuestos de compresión, no un modelo conversacional de propósito general.

El interés técnico reside en que combina una calibración conjunta de utilidad y seguridad: la matriz de calibración se construye como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, con 255 ventanas de 2048 tokens de WikiText-2 train (semilla 42) y un conjunto de seguridad formado por los primeros 48 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat, más los primeros 96 de 157 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas conformes del modelo base. La cuota efectiva de posiciones de seguridad es 0,1079.

La relevancia es metodológica: el autor advierte explícitamente de que varias ramas de la cuadrícula están deliberadamente degradadas en seguridad y de que la compresión por sí sola eleva la tasa de éxito de ataque; este checkpoint existe para cuantificar ese efecto y probar la recuperación. Con 6.738.415.616 parámetros reales en safetensors y un repositorio de 13,5 GB, se distribuye bajo Llama 2 Community License y requiere evaluación propia antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) con compresión SVD-LLM y recuperación LoRA |
| Parametros totales | 6.738.415.616 (fracción 0,5998 respecto al denso) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-2-7b-chat: 4096 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama-2 en su variante chat de 7B. Sobre ella se aplica SVD-LLM, el estimador de SVD blanqueada de AIoT-MLSys-Lab/SVD-LLM, calculado sobre un único conjunto de calibración agrupado que suma la contribución de WikiText-2 y la del conjunto de seguridad. La compresión elimina el 40,00% de los parámetros, dejando una fracción de 0,5998. La calibración de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens según el muestreador de SVD-LLM (semilla 42), evaluando todas las posiciones con el perfilador de los autores y factor cacheado. La calibración de seguridad usa una conversación por muestra desempaquetada (63.145 posiciones, todas evaluadas), con los rechazos propios del modelo base para los objetivos de JailbreakBench y sus respuestas conformes para OR-Bench-hard-1k.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan datos sobre volumen total de tokens de preentrenamiento adicional, composición completa del dataset de recuperación más allá de alpaca-cleaned, ni uso de RLHF/DPO en esta etapa; el alineamiento conversacional proviene del modelo base Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresión al 60,0% y la recuperación LoRA.
- Razonamiento de propósito general y respuesta zero-shot: el autor reporta una precisión media zero-shot de 0,4941 en 7 tareas (acc_norm donde se indica).
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench (ASR 0,0038) y StrongREJECT (ASR 0,0096) bajo el juez HarmBench.
- Calibración de sobre-rechazo medida con WildGuard (macro over-refusal 0,6201), lo que indica una tendencia elevada a rechazar peticiones benignas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: usar este checkpoint como sujeto experimental para medir cómo varía la tasa de éxito de ataque (AdvBench, StrongREJECT) al reducir parámetros, comparando con el modelo denso y con otras celdas de la cuadrícula.
- Evaluación de reglas de selección de componentes SVD: emplear esta celda (presupuesto 40,00%, calibración utilidad + seguridad) junto a las demás ramas para determinar qué regla repara mejor el comportamiento de rechazo tras la compresión.
- Análisis del equilibrio seguridad/utilidad: cruzar el ASR bajo y el sobre-rechazo alto (0,6201) con la perplejidad en WikiText-2 (11,1866) para caracterizar el coste de utilidad de preservar seguridad.
- Investigación en interpretabilidad de subespacios: inspeccionar los componentes U y V retenidos y el efecto del LoRA secuencial sobre las direcciones de rechazo, dado el etiquetado explícito de interpretability del repositorio.
- Reproducción de experimentos con semilla fija: reutilizar la configuración documentada (semilla 42, muestreador SVD-LLM, conjunto de calibración concreto) para replicar resultados en entornos controlados.
- Referencia negativa en pipelines de evaluación de seguridad: incluir el checkpoint como caso de control degradado al validar clasificadores de rechazo o jueces automáticos como HarmBench y WildGuard.
- No se recomienda su uso como asistente desplegable en producción, según la propia model card.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0096 |
| Macro over-refusal (WildGuard) | 0,6201 |
| Perplejidad WikiText-2 | 11,1866 |
| Precisión media zero-shot (7 tareas, acc_norm donde se indica) | 0,4941 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat denso ni frente a otras celdas de la cuadrícula; los valores anteriores son absolutos y no permiten calcular la degradación relativa sin esos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.738.415.616 parámetros en bf16/fp16 se requieren aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en fp32 ascendería a unos 27 GB.
- Cuantización: no se documentan variantes cuantizadas; una conversión a 8 bits reduciría los pesos a unos 6,7 GB y a 4 bits a unos 3,4 GB, pero requeriría generarlas y validarlas por cuenta propia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado para contexto corto.
- GPU de consumo: cabe en tarjetas de 16 GB o más solo tras cuantización a 8 bits; en 12 GB exigiría 4 bits y no está verificado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previa conversión, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbb48orc96_r40 | 6.738.415.616 (60,0% del denso) | no disponible | llama2 | Checkpoint de investigación comprimido con SVD-LLM y LoRA |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 tokens | llama2 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la cuadrícula del mismo autor | variable según presupuesto | no disponible | llama2 | Reglas de selección y presupuestos alternativos |
| Modelos de 7B comparables (p. ej. Mistral-7B-Instruct) | ~7.200 millones | 8192 tokens | Apache 2.0 | No evaluado en la información disponible |

La comparación cuantitativa con el modelo denso y con alternativas de 7B no está disponible en la información proporcionada; no se han publicado en ella los valores de referencia necesarios.

## Limitaciones y advertencias

- El propio autor advierte de que varias ramas de la cuadrícula están deliberadamente degradadas en seguridad y de que la compresión por sí sola eleva la tasa de éxito de ataque; este checkpoint es un sujeto experimental, no un asistente desplegable.
- El macro over-rechazo de 0,6201 (WildGuard) indica una tendencia elevada a rechazar peticiones benignas, con impacto directo en usabilidad.
- La perplejidad en WikiText-2 de 11,1866 y la precisión zero-shot media de 0,4941 reflejan el coste de utilidad de la compresión; no hay datos publicados que permitan aislar cuánto se debe a la compresión y cuánto a la recuperación LoRA.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 7B comprimido y recuperado con un dataset pequeño (alpaca-cleaned).
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado tras la compresión.
- Longitud de contexto no documentada en la model card; cualquier uso con contexto largo debe validarse empíricamente.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales activos, obligaciones de atribución "Built with Llama 2" y cumplimiento de USE_POLICY.md); el repositorio incluye LICENSE.txt y USE_POLICY.md.
- Ausencia de descargas y likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados reportados.
- No se documentan variantes cuantizadas ni artefactos de despliegue listos para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbb48orc96_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (AIoT-MLSys-Lab): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de recuperación alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- WikiText-2: https://huggingface.co/datasets/wikitext
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 2: https://ai.meta.com/llama/license/
