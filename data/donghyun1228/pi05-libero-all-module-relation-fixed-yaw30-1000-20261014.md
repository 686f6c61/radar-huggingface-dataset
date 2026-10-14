# Donghyun1228/pi05-libero-all-module-relation-fixed-yaw30-1000-20261014

## Resumen

Este repositorio contiene un checkpoint experimental de un modelo visión-lenguaje-acción (VLA) identificado como `pi05-libero-all-module-relation-fixed-yaw30-1000-20261014`, publicado por el usuario Donghyun1228 y construido sobre la librería `openpi`. Se trata de un artefacto de investigación, no de un modelo de producción: el propio autor indica que corresponde a una variante concreta de un experimento denominado "all-module relation", con parámetros no EMA tras 1000 actualizaciones de entrenamiento y con los recursos de normalización originales.

El modelo está orientado a manipulación robóctica transferible y se evalúa sobre tareas de tipo LIBERO, con instrucciones de destino que condicionan la política. La innovación que documenta el autor es un objetivo de relación (relation objective) que emplea una estimación de flujo principal a un solo paso (`t=1`) y una invariancia de Gram que permite reflexiones, con un profesor desacoplado que combina la visión actual con el LLM y el experto preentrenados. El autor advierte explícitamente que este checkpoint individual no establece retención y que la pérdida IDM no es su métrica de éxito.

El repositorio ocupa 13,1 GB y acumula 0 descargas y 0 likes, con fecha de creación y actualización del 13 de octubre de 2026. No se declara licencia, idiomas soportados ni resultados de benchmarks. Dado su carácter experimental y la ambigüedad de su documentación, debe tratarse como material de reproducción de un experimento de investigación más que como un modelo listo para integrar en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) sobre la librería `openpi`; designaciones de módulos mencionadas: vision23, LLM9, expert11 (entrenables) y native8, wrist23 (congelados). Detalle arquitectónico completo no disponible |
| Parametros totales | no disponible (el autor no publica recuento; solo designa módulos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se documentan cuantizaciones (GGUF, AWQ, GPTQ, etc.). El checkpoint se distribuye en FP32 para los módulos entrenables y BF16 para los congelados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el checkpoint se distribuye en precisión FP32 y BF16 según módulo, con recursos de normalización originales |
| Tamano del repositorio | 13,1 GB |
| Libreria | openpi |
| Pipeline | robotics |
| Tarea / benchmark | LIBERO (manipulación robótica), variante "yaw30" con configuración "fixed" |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia de modelos VLA `pi05` desplegada mediante `openpi`, lo que implica una arquitectura que acopla un codificador visual, un modelo de lenguaje y un módulo experto de acciones. La model card detalla la distribución de módulos por precisión: son FP32 los módulos entrenables etiquetados como vision23, LLM9 y expert11, mientras que el módulo nativo congelado native8 y el módulo de muñeca de origen (wrist23) se mantienen en BF16. No se especifica el número total de parámetros, la longitud de contexto, el volumen de tokens de entrenamiento ni la composición del dataset.

El procedimiento de entrenamiento descrito es singular y muy específico. Se parte de una inicialización local heredada (native51) y se aplica un objetivo de relación con un profesor desacoplado que combina la visión actual con el LLM y el experto preentrenados. El objetivo de relación utiliza una estimación de flujo principal a un solo paso en `t=1`, en lugar del sampler completo. El brazo de retención emplea un único `lambda=1`, y el control escalar preserva la dirección y los momentos del optimizador Adam del IDM (inverse dynamics model) mientras iguala la norma de una propuesta candidata en el mismo estado. La invariancia de Gram permite reflexiones. El autor afirma que durante el entrenamiento no entran observaciones de origen, caché de salida de origen ni retroalimentación de éxito, y que las instrucciones de destino existentes condicionan la política.

Los datos objetivo citados corresponden al dataset `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003` en el commit `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`. La evaluación de destino se realizó sobre 40 tareas con 10 episodios cada una, semilla de entorno 17, 8 clientes por GPU y MuJoCo 3.2.3. El autor advierte que las peticiones de política comparten un flujo RNG del servidor y no están emparejadas episodio a episodio, y que ningún score del entorno de origen se trata como retención de manipulación. No se documentan fases de RLHF o DPO.

## Capacidades

- Política de manipulación robótica condicionada por instrucciones en lenguaje natural: genera acciones a partir de observaciones visuales y de una instrucción de destino.
- Ejecución de tareas de manipulación del benchmark LIBERO, sobre 40 tareas evaluadas en la configuración publicada.
- Condicionamiento por instrucciones de destino existentes, según indica el autor; no se documenta el conjunto de idiomas ni el formato exacto de las instrucciones.
- Objetivo de relación con estimación de flujo a un solo paso (`t=1`) y invariancia de Gram con reflexiones permitidas.
- Capacidad de retención de política declarada como no establecida por este checkpoint concreto (el autor lo señala explícitamente).
- Soporte de tool calling / function calling: no disponible (no aplica al paradigma VLA descrito).
- Soporte de agentes y razonamiento multi-paso en texto: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): se emplea entrada visual como parte del modelo VLA; no se documentan modos adicionales.

## Casos de uso

- Reproducción de experimentos de investigación en VLA: el checkpoint permite repetir la configuración "all-module relation: yaw30 / fixed" con los recursos de normalización originales, útil para validar si el objetivo de relación mejora la transferencia en manipulación.
- Estudios de ablación sobre objetivos de entrenamiento: dado que el autor describe un control escalar que preserva la dirección y los momentos de Adam del IDM, el checkpoint sirve como punto de comparación frente a variantes sin ese control.
- Evaluación comparativa en LIBERO: con el protocolo documentado (40 tareas x 10 episodios, semilla 17, MuJoCo 3.2.3, 8 clientes por GPU) puede integrarse en un arnés de evaluación estandarizado para comparar políticas.
- Investigación sobre retención de política: el autor plantea explícitamente que este checkpoint no establece retención, por lo que es un candidato natural para experimentos que midan o refuten ese extremo con datos propios.
- Análisis de precisión mixta en entrenamiento: el reparto documentado entre módulos entrenables en FP32 y módulos congelados en BF16 permite estudiar el impacto de la precisión por módulo en el coste y la estabilidad del entrenamiento.
- Punto de partida para ajuste fino en dominios de contacto denso: el dataset objetivo citado (`libero-dense-contact-sweep-d2-yaw30`) sugiere un escenario de barrido con contacto, reutilizable como base para nuevos conjuntos de tareas de manipulación.
- Referencia de despliegue para inferencia congelada: la referencia de inferencia BF16 (`pi05_libero_source_free_split_vision_idm` en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`) puede emplearse como plantilla para montar un servidor de políticas con múltiples clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente describe el protocolo de evaluación de destino (40 tareas, 10 episodios por tarea, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) y afirma que el JSON de evaluación conserva los resultados reales, pero no se incluyen cifras de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamaño del repositorio (13,1 GB) con pesos mixtos FP32/BF16, una inferencia en BF16 requeriría del orden de 14-20 GB de VRAM, incluyendo pesos y activaciones; cifra estimada, no confirmada por el autor.
- GPU recomendadas: no disponibles. Por el perfil de modelos VLA de `openpi`, son habituales A100 o H100 para entrenamiento y evaluación con batching; la evaluación descrita usa 8 clientes por GPU, lo que sugiere una GPU con memoria amplia.
- ¿Cabe en GPU de consumo? No confirmado. En BF16 el tamaño de pesos es compatible con GPUs de 24 GB (RTX 3090/4090) si el pico de memoria se mantiene por debajo del límite, pero el runtime `openpi` y las activaciones pueden superarlo. Requiere verificación empírica.
- Opciones de despliegue: el modelo usa la librería `openpi` (runtime propio, orientado a JAX/Flax, con soporte PyTorch en el ecosistema openpi). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos no son aplicables a un VLA con experto de acciones.
- Latencia y throughput: no disponibles. El único dato operativo es que la evaluación se ejecutó con 8 clientes por GPU compartiendo un flujo RNG del servidor.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos. La tabla siguiente recoge alternativas de la misma categoría (políticas VLA para manipulación) con datos públicos de referencia; los valores marcados como "no disponible" no se han podido confirmar en la información de esta ficha.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-all-module-relation-fixed-yaw30-1000-20261014 | no disponible | no disponible | VLA (openpi) | no disponible | HuggingFace, repo de 13,1 GB, 0 descargas |
| OpenVLA | ~7B | 2048 tokens (referencia pública) | VLA (Llama-2 + visión) | MIT (referencia pública) | HuggingFace |
| pi0 / pi0.5 (Physical Intelligence, vía openpi) | no disponible | no disponible | VLA (openpi) | Apache-2.0 en el repositorio openpi; condiciones del checkpoint no disponibles | HuggingFace / repositorio openpi |
| GR00T N1 (NVIDIA) | 2B y 16B (variantes públicas) | no disponible | VLA | NVIDIA Open Model License (referencia pública) | HuggingFace |

Nota: los datos de las filas de comparación proceden de información pública general de cada proyecto y deben verificarse en sus respectivas model cards antes de citarlos.

## Limitaciones y advertencias

- Carácter experimental explícito: el propio tag del repositorio incluye "experimental" y el autor advierte que este checkpoint individual no establece retención de política.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y no debe asumirse permiso de uso.
- Sin datos de benchmarks publicados: no hay cifras de éxito ni métricas verificables en la información disponible; cualquier afirmación de rendimiento sería especulativa.
- Riesgo de sobreinterpretación de resultados: el autor indica que la pérdida IDM no es la métrica de éxito del objetivo y que ningún score del entorno de origen debe tratarse como retención de manipulación; conviene respetar esa distinción al reportar resultados.
- Emparejamiento de evaluación no estricto: las peticiones de política comparten un flujo RNG del servidor y no están emparejadas episodio a episodio, lo que limita la comparabilidad estadística entre políticas.
- Procedencia de la inicialización ambigua: el autor señala que la inicialización real usó una fuente local heredada (native51) y que `pi05-libero-main-policy-retention-source-split74-20261013` es solo una referencia de despliegue canónicamente equivalente, no la entrada real de inicialización. Reproducir el experimento exactamente puede no ser posible con los artefactos públicos.
- Sesgos conocidos: no disponibles; no se documenta análisis de sesgo alguno.
- Limitaciones de contexto e idioma: no disponibles; no se declaran ventanas de contexto ni cobertura lingüística.
- Alucinación y robustez: no evaluadas en la información disponible; en un VLA, el fallo relevante es la ejecución incorrecta de la política, no la generación textual.
- Almacenamiento: 13,1 GB solo para los pesos, sin contar dependencias del runtime `openpi` ni assets de MuJoCo.
- Madurez: 0 descargas y 0 likes en el momento de redactar la ficha, sin evidencia de uso por terceros ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-fixed-yaw30-1000-20261014
- Dataset objetivo citado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003 (commit `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`)
- Referencia de despliegue canónicamente equivalente: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013 (commit `24268da2aba5f690c879788d98e3455a2a579d8f`)
- Referencia de inferencia: `pi05_libero_source_free_split_vision_idm`, commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, restauración en BF16 (no se indica URL en la información proporcionada)
- Librería `openpi`: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
