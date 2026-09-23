# SGK86/laya-multilingual-typed-decisions

## Resumen

Laya-multilingual-typed-decisions es un ajuste fino publicado por el usuario SGK86 sobre el modelo base convaiinnovations/laya-multilingual. No es un modelo generativo de propósito general: se presenta como un agente de decisión que, dado un estado y un conjunto de preguntas tipadas, devuelve una decisión con una puntuación de confianza calibrada. Cuenta con 321.908.998 parámetros (unos 322 millones), se distribuye en safetensors bajo licencia Apache 2.0 y se carga mediante la librería `laya` con la llamada `laya.load("SGK86/laya-multilingual-typed-decisions")`.

El entrenamiento sigue la receta oficial RLCD (Reinforcement Learning from Contrastive Distillation, según la nomenclatura del autor) sobre una sola GPU, con batch efectivo de 64, learning rate de 2,5e-5 para el encoder y 1e-4 para la cabeza, 4 épocas y un schedule de sigma de 0,4 a 0,1, seguido de una calibración de temperatura posterior al entrenamiento. En el conjunto de test oficial de 400 casos declara una exactitud de 0,786 frente a una línea base mayoritaria de 0,461, junto con métricas de calibración (Brier 0,064, ECE 0,113).

Su relevancia actual es limitada pero concreta: cubre el nicho de decisiones tipadas y calibradas con un modelo pequeño que cabe en hardware de consumo, y lo hace con métricas de calibración explícitas, algo poco habitual en modelos de este tamaño. Como contrapartida, la ficha de HuggingFace registra 0 descargas y 0 "likes" en la fecha de consulta, la model card es muy escueta y la búsqueda web realizada no ha devuelto ninguna fuente independiente sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: convaiinnovations/laya-multilingual; la model card no detalla la arquitectura) |
| Parametros totales | 321.908.998 (aproximadamente 322 M) |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (repositorio de 0,7 GB, compatible con precision bf16/fp16) |
| Idiomas soportados | no disponible (el nombre incluye "multilingual", pero no se lista ningun idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni del ajuste. Los únicos indicios disponibles son la receta de entrenamiento, que distingue explícitamente entre un "encoder" (learning rate 2,5e-5) y una "head" o cabeza (1e-4), lo que sugiere una topología de encoder más cabeza de decisión, y la etiqueta "system-one", que apunta a un módulo de decisión rápida e intuitiva en lugar de un razonamiento deliberativo de varios pasos. Ambas son inferencias a partir de las etiquetas y la receta, no datos confirmados por el autor.

El ajuste se realizó con la receta oficial RLCD en una única GPU, con batch efectivo de 64, 4 épocas y un schedule de sigma que decae de 0,4 a 0,1. Tras el entrenamiento se aplicó una calibración de temperatura, orientada a que las probabilidades emitidas sean interpretables como confianzas. No se especifica el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a LocalLLaMA/typed-decisions en el título), ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Emisión de decisiones tipadas: recibe un estado y una lista de preguntas y devuelve una predicción por pregunta, según la interfaz `agent.predict(state, questions)`.
- Calibración de probabilidades: la temperatura se ajusta después del entrenamiento, con un ECE de 0,113 y un Brier de 0,064 en el test oficial de 400 casos.
- Puntuación de confianza por decisión, apta para umbrales de derivación o abstención.
- Capacidad multilingüe indicada únicamente en el nombre del modelo; no hay listado de idiomas ni evaluación por idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente multi-paso ni razonamiento encadenado.
- No se documentan capacidades de visión, audio, generación de código ni modo "thinking".
- Integración mediante la librería `laya`, no mediante una API de chat estándar de transformers, aunque el repositorio declara compatibilidad con `endpoints_compatible`.

## Casos de uso

La model card no documenta casos de uso oficiales. Los siguientes escenarios son compatibles con la interfaz declarada (`predict(state, questions)`) y con un modelo de decisión calibrada de 322 M de parámetros, pero no están validados por el autor.

- Enrutado de peticiones en atención al cliente: dado el estado de una conversación y un conjunto de preguntas tipadas (por ejemplo, intención, urgencia, idioma), el modelo devuelve una decisión por pregunta; su calibración permite derivar a un humano cuando la confianza cae por debajo de un umbral.
- Triaje con umbral calibrado: en flujos médicos, legales o de soporte, el ECE de 0,113 permite fijar umbrales de abstención con una interpretación probabilística razonable, algo que un clasificador sin calibrar no ofrece.
- Moderación de contenido: clasificación de casos límite con puntuación de confianza, derivando a revisión humana los casos con probabilidad intermedia en lugar de forzar una etiqueta binaria.
- Enrutado multilingüe: si se confirma la capacidad multilingüe, el modelo podría decidir el idioma de respuesta o el equipo de destino en función del estado de la conversación.
- Módulo "System 1" dentro de un agente mayor: usar este modelo como primera etapa rápida que resuelve decisiones simples y delega en un modelo mayor (o en razonamiento explícito) los casos de baja confianza.
- Etiquetado asistido y anotación: preanotar decisiones tipadas sobre un corpus y ordenar por confianza para que los anotadores revisen primero los casos dudosos.
- Simulación y entornos de decisión: en juegos o simuladores donde el estado y las preguntas son discretos, el modelo puede actuar como política de decisión de bajo coste.
- Evaluación A/B de políticas de decisión: comparar la distribución de confianzas del modelo contra una política existente usando Brier y ECE como métricas de calidad probabilística.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre el conjunto de test oficial de 400 casos. La referencia TypeSafe Jev 1.13.0 es un sistema de terceros citado en el BENCHMARKS.md del repositorio laya, no una variante de este modelo.

| Metrica | Este modelo | TypeSafe Jev 1.13.0 (terceros) | Baseline mayoritaria |
|---|---|---|---|
| Accuracy | 0,786 | 0,727 | 0,461 |
| Soft accuracy | 0,507 | 0,580 | no disponible |
| Brier | 0,064 | 0,148 | no disponible |
| ECE | 0,113 | 0,144 | no disponible |
| Score MAE | 0,253 | 0,391 | no disponible |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo coherente con la naturaleza del modelo, que no es un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,29 GB en fp32, 0,64 GB en bf16/fp16, 0,32 GB en int8 y 0,16 GB en int4, más el overhead de activaciones y del runtime.
- El repositorio ocupa 0,7 GB, consistente con pesos en bf16/fp16.
- Cabe sin dificultad en cualquier GPU de consumo moderna: RTX 3060 12 GB, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) si se despliega junto a otros servicios.
- Es viable la inferencia en CPU para cargas de baja concurrencia, dado el tamaño del modelo.
- Opciones de despliegue documentadas: librería `laya` sobre transformers y endpoints compatibles. No hay evidencia de soporte de vLLM, TGI, llama.cpp u Ollama, ni de pesos en GGUF publicados.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia, tokens por segundo ni rendimiento bajo concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metrica principal |
|---|---|---|---|---|---|
| SGK86/laya-multilingual-typed-decisions | 321.908.998 | no disponible | Apache 2.0 | HuggingFace (0 descargas, 0 likes) | Accuracy 0,786; Brier 0,064 |
| convaiinnovations/laya-multilingual (base) | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| TypeSafe Jev 1.13.0 | no disponible (sistema de terceros) | no disponible | no disponible | referencia en BENCHMARKS.md | Accuracy 0,727; Brier 0,148 |

No se dispone de información suficiente para comparar con modelos de decisión calibrada de uso extendido, y la búsqueda web no ha arrojado resultados relevantes.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 "likes" en HuggingFace en la fecha de consulta, sin publicaciones, papers ni repos independientes asociados.
- La evaluación se apoya en un único conjunto de test de 400 casos declarado por el propio autor, lo que implica un intervalo de confianza amplio y sin protocolo de evaluación reproducible documentado.
- Discrepancia interna en las métricas: el modelo supera a la referencia TypeSafe Jev 1.13.0 en accuracy exacta (0,786 frente a 0,727) pero queda por debajo en soft accuracy (0,507 frente a 0,580), lo que sugiere que acierta más en decisiones discretas pero puntúa peor en casos parcialmente correctos.
- Calibración mejorable: un ECE de 0,113 sobre un umbral habitual de 0,1 indica un desajuste moderado entre confianza declarada y acierto real; no conviene usarlo como probabilidad exacta en decisiones críticas.
- Riesgo de sobreajuste al dataset LocalLLaMA/typed-decisions, cuya composición, tamaño y procedencia no se documentan.
- Sesgos no evaluados: no hay análisis de sesgo por idioma, dominio, género ni origen, pese a la etiqueta "multilingual".
- Capacidad multilingüe no verificada: el nombre la sugiere, pero no se lista ningún idioma ni se aportan métricas por idioma.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento no está documentada, por lo que la trazabilidad legal de los pesos queda abierta.
- No se documentan límites de contexto, por lo que no es posible garantizar el comportamiento con estados o listas de preguntas largos.
- Autor y proyecto sin historial verificable en la información disponible; conviene tratar las métricas como no auditadas antes de cualquier uso en producción.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (los resultados fueron páginas de ayuda de cuentas de Google, sin relación con el contenido).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SGK86/laya-multilingual-typed-decisions
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Benchmarks de referencia (TypeSafe Jev 1.13.0): https://github.com/NandhaKishorM/laya/blob/main/BENCHMARKS.md
- Dataset de ajuste referenciado en el título de la model card: LocalLLaMA/typed-decisions (sin URL verificada)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web realizada.
