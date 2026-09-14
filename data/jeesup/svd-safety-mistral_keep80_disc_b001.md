# Jeesup/svd-safety-mistral_keep80_disc_b001

## Resumen

`Jeesup/svd-safety-mistral_keep80_disc_b001` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido mediante SVD-LLM hasta conservar el 80,08 % de los parámetros densos originales (se elimina el 19,92 %). Sobre esa base comprimida se restauran 1.165 componentes SVD adicionales, seleccionados con la regla `disc` y con un presupuesto del 0,1 % de los parámetros densos. El resultado es una de las celdas de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración.

El propósito del artefacto no es servir como asistente conversacional, sino cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección repara mejor ese daño. El autor lo declara explícitamente como "sujeto experimental" y advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base. La model card reporta métricas de ataque exitoso (AdvBench ASR 0,1846; StrongREJECT ASR 0,3323), sobrerrechazo macro (0,0890) y perplejidad en WikiText-2 (8,0516).

Es relevante ahora porque conecta dos líneas de trabajo activas: la compresión agresiva de LLM para reducir coste de inferencia y la evaluación de seguridad de modelos derivados, un terreno donde la mayoría de checkpoints publicados no documenta el efecto de la compresión sobre el rechazo de peticiones dañinas. El checkpoint tiene 7.241.732.096 parámetros, licencia Apache 2.0 y formato safetensors para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2) con compresión SVD-LLM aplicada sobre los pesos |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens según la documentación del modelo base; no se especifica en la model card de este checkpoint |
| Tipos de cuantizacion | No disponible en la información proporcionada. El tamaño del repositorio (14,5 GB) es coherente con pesos en fp16/bf16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Fracción de parametros resultante | 0,8008 (80,08 % del denso original) |
| Regla de seleccion de componentes | `disc` |
| Presupuesto de restauracion | 0,100 % de los parámetros densos |
| Componentes restaurados | 1.165 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Tamano del repositorio | 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only de 7,24 B de parámetros con atención de ventana deslizante y grouped-query attention. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de pesos y trunca los componentes de menor energía, eliminando aquí el 19,92 % de los parámetros densos. Posteriormente se reintroducen 1.165 componentes SVD previamente descartados, elegidos por la regla de selección `disc`, hasta consumir un presupuesto del 0,1 % de los parámetros densos.

No se describe en la información disponible un proceso de reentrenamiento, ajuste fino adicional, RLHF o DPO específico para este checkpoint: la intervención es puramente de compresión y restauración selectiva de componentes sobre el modelo ya alineado. La innovación técnica del artefacto reside en el protocolo experimental (rejilla de reglas de selección x presupuestos de restauración, semilla fija 42), no en una arquitectura nueva, y en la medición sistemática del coste de seguridad de la compresión y de la capacidad de recuperación mediante restauración selectiva.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base, pero el autor indica explícitamente que no debe tratarse como un asistente desplegable.
- Razonamiento e instrucciones: el checkpoint parte de un modelo `-Instruct`, por lo que mantiene el formato de instrucciones de Mistral-7B-Instruct-v0.2.
- Rechazo de peticiones dañinas: capacidad medida, no asumida; los valores de ASR reportados (0,1846 en AdvBench, 0,3323 en StrongREJECT) cuantifican el grado de fallo en esta tarea.
- Multilingüismo: no documentado en la model card de este checkpoint.
- Tool calling / function calling: no documentado para este checkpoint.
- Modo agente o razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Uso como sujeto experimental: es su función principal declarada, con métricas de seguridad y perplejidad publicadas para reproducir el análisis.

## Casos de uso

- Investigación sobre compresión de LLM: usar esta celda como punto de comparación dentro de la rejilla de reglas de selección, midiendo cómo varían perplejidad y ASR entre `disc` y otras reglas con el mismo presupuesto del 0,1 %.
- Evaluación de seguridad de modelos derivados: ejecutar AdvBench y StrongREJECT con un juez HarmBench sobre este checkpoint para cuantificar el incremento de ataque exitoso atribuible a la compresión y no al modelo base.
- Análisis de sobrerrechazo: emplear WildGuard para medir la tasa macro de sobrerrechazo (0,0890) y contrastarla con el ASR, identificando el equilibrio entre seguridad y utilidad tras la compresión.
- Estudios de interpretabilidad de componentes SVD: los 1.165 componentes restaurados y su regla de selección permiten analizar qué direcciones del espacio de pesos son responsables de mantener el comportamiento de rechazo.
- Reproducibilidad metodológica: la semilla fija (42) y los campos de procedencia documentados permiten replicar exactamente la celda, algo poco habitual en checkpoints comprimidos publicados.
- Punto de partida para ajuste fino correctivo: usar el checkpoint comprimido como inicialización para un ajuste fino de seguridad y medir cuánto del daño por compresión es recuperable frente al coste de reentrenamiento completo.
- Auditoría de cadenas de derivación: sirve como caso de estudio de cómo un derivado Apache 2.0 de un modelo cuyo repositorio original no incluye fichero de licencia redistribuible debe documentar su procedencia.

## Benchmarks y rendimiento

Únicamente se dispone de las métricas de seguridad y perplejidad publicadas en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad en la información proporcionada.

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,1846 | HarmBench judge |
| StrongREJECT ASR | 0,3323 | HarmBench judge |
| Sobrerrechazo macro | 0,0890 | WildGuard |
| Perplejidad WikiText-2 | 8,0516 | No especificado |

No se han publicado resultados de benchmarks de capacidad general en la información disponible, ni cifras comparativas del modelo base sin comprimir bajo los mismos protocolos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 14,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7,2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100, L40S; suficientes de sobra para fp16 y para servir múltiples réplicas.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB con cuantización) y en tarjetas de 12 GB solo con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM y servidores compatibles con pesos safetensors. El uso con llama.cpp u Ollama requeriría una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-mistral_keep80_disc_b001` | 7,24 B (80,08 % del denso) | No especificado en la model card | AdvBench ASR 0,1846; StrongREJECT ASR 0,3323; WikiText-2 PPL 8,0516 | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| `mistralai/Mistral-7B-Instruct-v0.2` (base) | 7,24 B | 32.768 tokens | No disponible en la información proporcionada; la model card del derivado indica que la compresión eleva la tasa de ataque exitoso | Apache 2.0 en el modelo base; su repositorio no incluye fichero de licencia redistribuible | HuggingFace, ampliamente distribuido |
| Otras celdas de la rejilla SVD-safety de `Jeesup` | No disponible | No disponible | No disponible | No disponible | No disponible |
| SVD-LLM (implementación de referencia de la técnica) | No aplica: es un método de compresión | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar el rendimiento de capacidad general con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Degradación de seguridad documentada: la compresión por sí sola eleva la tasa de éxito de ataques; los ASR reportados (0,1846 y 0,3323) implican que un porcentaje relevante de peticiones dañinas obtiene respuesta.
- Riesgo de alucinación: no medido específicamente en la información disponible; la perplejidad de 8,0516 en WikiText-2 indica un aumento de la incertidumbre respecto a un modelo sin comprimir, aunque no se aporta la cifra base para comparar.
- Idiomas soportados no documentados: se desconoce el comportamiento multilingüe de este checkpoint tras la compresión.
- Longitud de contexto no verificada: aunque el modelo base soporta 32.768 tokens, la compresión SVD puede alterar el comportamiento en contextos largos y no hay evaluación al respecto.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información proporcionada.
- Restricciones de licencia: el checkpoint se distribuye bajo Apache 2.0, pero el repositorio del modelo base no incluye fichero de licencia que permita redistribuirlo; la licencia declarada gobierna únicamente este derivado, lo que puede generar incertidumbre en una cadena de redistribución comercial.
- Advertencia para producción: cualquier uso en producción exige una evaluación propia previa, tal como indica el autor; las celdas de la rejilla no son intercambiables y este checkpoint concreto corresponde a la regla `disc` con presupuesto 0,1 %.
- Ausencia de adopción: 0 descargas y 0 likes en el momento del registro, sin señales de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep80_disc_b001
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (sitios de fuentes tipográficas, foro Zhihu y un hilo sobre TikTok). No se han encontrado en la búsqueda enlaces a papers, blogs, repositorios ni demos asociados a este checkpoint.
