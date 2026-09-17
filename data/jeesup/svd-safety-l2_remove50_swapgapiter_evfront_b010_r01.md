# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r01

## Resumen

Este checkpoint es un artefacto de investigación publicado por el usuario Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. Se trata del modelo Llama 2 Chat de 7.000 millones de parámetros comprimido con SVD-LLM hasta conservar el 50,01 % de los parámetros de proyección densos y, después, editado con una única ronda (de un total de 10) de sustitución iterativa de parámetros neutra, seleccionada mediante la regla `gap_iter` con un presupuesto de restauración del 1,000 % de los parámetros densos.

El objetivo declarado no es ofrecer un asistente conversacional, sino medir cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Es una celda de una rejilla experimental sobre reglas y presupuestos, y el propio autor advierte de que varias ramas del estudio están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Su relevancia es metodológica: publica métricas de tasa de éxito de ataque (AdvBench 0,5250 y StrongREJECT 0,3000) junto con una medida de sobrerrechazo (0,1302), lo que permite cuantificar el coste de seguridad de la compresión y evaluar técnicas de reparación. No documenta idiomas soportados ni resultados de capacidades generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con proyecciones densas comprimidas mediante SVD-LLM |
| Parámetros totales | 6.738.415.616 (según safetensors) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base es Llama-2-7b-chat, sin confirmación en esta ficha) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (13,5 GB) |
| Idiomas soportados | No disponibles (heredados del modelo base, sin documentar) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation (transformers) |
| Compresión aplicada | SVD-LLM, 50,01 % de parámetros de proyección eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 673 restaurados, 619 sustituidos |
| Parámetros insertados | 6.473.984 (0,10 % de los parámetros de proyección densos) |
| Fracción de parámetros resultante | 0,4999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 1 de 10 (checkpoint intermedio) |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2, el checkpoint `Llama-2-7b-chat-hf`. Sobre él se aplica SVD-LLM, una técnica de compresión post-hoc por descomposición en valores singulares que reduce el rango de las matrices de proyección densas: en este caso se elimina el 50,01 % de esos parámetros, dejando una fracción resultante de 0,4999. No hay reentrenamiento ni ajuste fino documentado en la model card; el resultado es un modelo comprimido sin recuperación por entrenamiento.

La innovación del artefacto es la fase de edición posterior: un procedimiento de sustitución de parámetros neutro (parameter-neutral swap) que opera en rondas iterativas y que, en esta celda, aplica 1 de 10 rondas con un presupuesto de 0,100 % de parámetros densos por ronda. La regla `gap_iter` decide qué componentes restaurar (673) y cuáles sustituir (619), con un valor de intercambio `insert` y una política de expulsión ordenada por sigma. No se documentan el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; el alineamiento por preferencias es el que ya traía Llama-2-7b-chat antes de la compresión.

## Capacidades

- Generación de texto condicionada al pipeline `text-generation` de transformers, heredada del modelo base Llama-2-7b-chat.
- Sujeto de estudio para medir seguridad frente a ataques: la model card reporta ASR de 0,5250 en AdvBench y 0,3000 en StrongREJECT con juez HarmBench.
- Medición de sobrerrechazo: la métrica macro de rechazo excesivo sobre WildGuard es 0,1302.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Capacidad de reparación de seguridad mediante sustitución iterativa de parámetros: sí, es el eje del experimento, aunque esta celda solo aplica 1 de 10 rondas.

## Casos de uso

- Investigación sobre compresión y seguridad: comparar la tasa de éxito de ataque (0,5250 en AdvBench) de este checkpoint con la de Llama-2-7b-chat sin comprimir permite cuantificar cuánta seguridad destruye la eliminación del 50,01 % de los parámetros de proyección.
- Ablación de reglas de selección de componentes: la regla `gap_iter` es una celda de una rejilla; usarla como punto de comparación frente a otras reglas y presupuestos para decidir qué componentes conviene restaurar.
- Estudio de sobrerrechazo: la métrica macro de over-refusal (0,1302) sobre WildGuard sirve para analizar si restaurar componentes recupera seguridad a costa de rechazar peticiones legítimas.
- Reproducción de experimentos: la semilla fija (42), el presupuesto por ronda (0,100 %), el número de componentes (673 restaurados, 619 sustituidos) y la fracción resultante (0,4999) permiten replicar la ronda intermedia de forma determinista.
- Auditoría de pipelines de compresión en producción: sirve como evidencia de que un modelo comprimido sin validación de seguridad puede degradarse, y justifica incluir evaluaciones de ASR antes de desplegar versiones comprimidas.
- Docencia y divulgación en seguridad de LLM: al ser un artefacto con degradación conocida y medidas publicadas, es un ejemplo controlado para explicar la diferencia entre compresión de tamaño y calidad de alineamiento.
- Punto de partida para técnicas de reparación: estudiar si 10 rondas completas (frente a la única ronda aquí incluida) reducen el ASR antes de plantear cualquier uso real.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,5250 | Cuanto más bajo, mejor; valor alto indica degradación de seguridad |
| StrongREJECT ASR (juez HarmBench) | 0,3000 | Cuanto más bajo, mejor |
| Macro over-refusal (WildGuard) | 0,1302 | Mide rechazo excesivo ante peticiones legítimas |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con el modelo base sin comprimir dentro de esta ficha.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: el repositorio ocupa 13,5 GB, por lo que se necesitan al menos unos 14 GB solo para pesos, más espacio para caché KV y activaciones (del orden de 16-20 GB según contexto y lote).
- VRAM estimada en cuantización INT8: no disponible como artefacto publicado; una conversión a 8 bits rondaría los 7 GB, pero no está validada para esta arquitectura modificada.
- VRAM estimada en cuantización INT4: no disponible como artefacto publicado; una conversión a 4 bits rondaría los 4 GB, igualmente sin validar.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier acelerador con 24 GB o más para FP16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16/BF16; en tarjetas de 16 GB requeriría cuantización, no publicada para este checkpoint.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`) y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No hay GGUF publicado y la arquitectura incorpora proyecciones comprimidas por SVD, por lo que la compatibilidad con llama.cpp u Ollama no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r01 | 6.738.415.616 (proyecciones al 49,99 %) | No disponible | AdvBench 0,5250; StrongREJECT 0,3000 | Llama 2 Community License | Hugging Face, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | No disponible en esta ficha | No disponible en la información proporcionada | Llama 2 Community License | Hugging Face, modelo base de referencia |
| Otros artefactos de la misma rejilla de reglas y presupuestos | No disponibles | No disponible | No disponible | Llama 2 Community License (previsible) | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre esta celda y el modelo base sin comprimir dentro de la información proporcionada.

## Limitaciones y advertencias

- Seguridad degradada de forma deliberada o conocida: la model card indica explícitamente que la compresión por sí sola eleva la tasa de éxito de ataque y que algunas ramas de la rejilla están degradadas a propósito. El ASR de 0,5250 en AdvBench es muy alto para un modelo alineado.
- No es un asistente desplegable: el propio autor lo describe como sujeto experimental, no como modelo de propósito general. No debe usarse en producción ni como chatbot de cara al público.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad, y la compresión agresiva de proyecciones puede afectar a la coherencia factual; no hay datos para cuantificarlo.
- Sobrerrechazo: la métrica macro de over-refusal (0,1302) indica que una parte de las peticiones legítimas se rechazan, lo que limita su utilidad como asistente incluso en entornos controlados.
- Idiomas: no se documenta ninguno; se heredan las limitaciones del modelo base, mayoritariamente orientado al inglés, sin confirmación.
- Contexto: la longitud de contexto no se declara en la model card de este artefacto.
- Arquitectura no estándar: al incorporar proyecciones comprimidas por SVD y una sustitución parcial de componentes, las herramientas habituales de cuantización y conversión pueden no funcionar sin adaptaciones.
- Restricciones de licencia: se aplica la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y su uso queda sujeto a la política de uso aceptable de Meta, con los límites habituales de esa licencia para uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: los archivos `LICENSE.txt` y `USE_POLICY.md` se incluyen en el propio repositorio del modelo
- La búsqueda web realizada no devolvió enlaces relevantes (papers, blogs o repos) sobre este artefacto; no se dispone de más referencias.
