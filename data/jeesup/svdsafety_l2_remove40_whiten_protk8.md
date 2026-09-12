# Jeesup/svdsafety_l2_remove40_whiten_protk8

## Resumen

`Jeesup/svdsafety_l2_remove40_whiten_protk8` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` publicado por el usuario Jeesup como artefacto de investigación. Según su model card, se trata de un experimento sobre compresión SVD de pesos: se aplica la técnica SVD-LLM al modelo base y después se restaura un subconjunto de componentes SVD siguiendo una regla de selección. El objetivo declarado no es ofrecer un asistente conversacional, sino medir cómo la compresión daña el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El repositorio se presenta como una celda concreta dentro de una rejilla de experimentos que cruza reglas de selección y presupuestos de restauración. Los metadatos de la model card indican compresión SVD-LLM al 0,00 % de parámetros eliminados, presupuesto de restauración del 0,000 %, 0 componentes restaurados, 0 componentes sustituidos y semilla 42, valores que no concuerdan con el nombre del checkpoint (`remove40`) ni con el recuento real de pesos.

El peso de los safetensors publicados es de 6.738.415.616 parámetros, prácticamente idéntico al de Llama-2-7b-chat sin comprimir, y el repositorio ocupa 13,5 GB. Es relevante ahora únicamente como material de reproducibilidad y de estudio de seguridad bajo compresión, no como modelo desplegable: acumula 0 descargas y 0 valoraciones, y el propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con transformación de pesos SVD-LLM declarada |
| Parámetros totales | 6.738.415.616 (dato real de los safetensors, ≈6,74 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens según la configuración del modelo base Llama-2-7b-chat; no confirmada en la model card de este checkpoint |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresión declarada | SVD-LLM, 0,00 % de parámetros eliminados |
| Regla de selección | `unknown` |
| Presupuesto de restauración | 0,000 % de parámetros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |
| Librería | transformers |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para las posiciones y atención multi-cabeza, distribuido en 32 capas con dimensión oculta de 4.096. Sobre ese checkpoint ya instruido con RLHF por Meta se aplica SVD-LLM, un método de compresión que descompone en valores singulares las matrices de pesos y trunca componentes según su contribución, con criterio de truncado consciente de la pérdida. La model card menciona además una variante con blanqueado (`whiten`) y una regla de selección de componentes de restauración identificada como `unknown`, sin más detalle técnico.

No se documenta ningún entrenamiento o ajuste adicional: el artefacto es una transformación post-hoc de pesos, no un modelo reentrenado. Los campos de procedencia de la model card son internamente incoherentes: un presupuesto de restauración del 0,000 % con 0 componentes restaurados y una fracción de parámetros resultante de 0,0000 debería producir un modelo vacío, pero el repositorio contiene el juego completo de pesos y el recuento de parámetros coincide con el del modelo base. Tampoco hay innovación técnica propia más allá de la aplicación de SVD-LLM y del criterio de selección, que no se describe.

## Capacidades

- Generación de texto conversacional: capacidades heredadas de Llama-2-7b-chat, no re-evaluadas en este checkpoint.
- Razonamiento y respuesta a instrucciones en formato de diálogo: heredadas del modelo base instruido con RLHF.
- Generación de código y matemáticas elementales: presentes en el modelo base, con el nivel limitado característico de la familia Llama 2 de 7B.
- Soporte de tool calling / function calling: no nativo en Llama-2-7b-chat; no se documenta ninguna adaptación en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base no incorpora entrenamiento específico para agentes.
- Capacidades multilingües: no disponibles como dato declarado; el modelo base está entrenado predominantemente en inglés.
- Modo de pensamiento explícito, visión o audio: no disponibles.
- Capacidad especial declarada: servir como sujeto experimental para medir la tasa de éxito de ataques y la degradación de seguridad bajo compresión SVD.

## Casos de uso

- Línea base de control en estudios de compresión: al conservar el recuento de parámetros del modelo sin comprimir, puede usarse como referencia frente a las celdas de la rejilla que sí eliminan componentes SVD, siempre que se verifique antes la equivalencia real de pesos.
- Medición de tasa de éxito de ataques (ASR): el propio autor señala que la compresión eleva el ASR; este checkpoint permite cuantificar cuánto se degrada la seguridad respecto a Llama-2-7b-chat sin comprimir en un conjunto de prompts de red-teaming fijo.
- Reproducibilidad de experimentos: la semilla 42 y los campos de procedencia permiten replicar la celda concreta y comprobar si los valores declarados en la model card se corresponden con los pesos publicados.
- Estudio de interpretabilidad de subespacios: la componente `whiten` del nombre sugiere un preprocesado de blanqueado de pesos, útil para analizar qué direcciones del espacio de activaciones se ven afectadas por la descomposición SVD.
- Comparación de reglas de selección de componentes: este artefacto se puede enfrentar a otras celdas con reglas distintas (`protk8` y variantes) para determinar qué criterio de restauración recupera antes el comportamiento de rechazo.
- Docencia e investigación académica: material para prácticas sobre compresión de LLM, trade-off seguridad/utilidad y evaluación de modelos derivados.
- Auditoría de derivados de Llama 2: análisis de la trazabilidad de un checkpoint comunitario con metadatos incoherentes, útil para diseñar listas de comprobación de calidad de artefactos publicados en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni tasas de éxito de ataques, y los resultados de búsqueda web proporcionados no contienen información relacionada con el modelo.

## Requisitos de hardware

- Peso de los pesos en fp16/bf16: aproximadamente 13,5 GB, coherente con el tamaño del repositorio y con 6.738.415.616 parámetros.
- VRAM estimada solo para pesos: unos 6,7 GB en int8 y unos 3,4 GB en cuantización de 4 bits (estimaciones derivadas del recuento de parámetros; el autor no publica cuantizaciones).
- Caché KV estimada a 4.096 tokens: alrededor de 2 GB en fp16, calculando 0,5 MB por token con 32 capas, 32 cabezas y dimensión de cabeza 128 (estimación basada en la arquitectura del modelo base).
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 y L40S son suficientes con margen en fp16.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16 con contexto completo, y en RTX 3060 12 GB o RTX 4070 solo con cuantización de 4 bits.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference y vLLM son viables según las etiquetas `text-generation-inference` y `endpoints_compatible`; llama.cpp y Ollama requieren una conversión a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponibles; no se publican mediciones ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| svdsafety_l2_remove40_whiten_protk8 | 6,74 mil millones | 4.096 tokens (base) | Llama 2 Community License | HuggingFace, 0 descargas | No evaluado |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4.096 tokens | Llama 2 Community License | HuggingFace (modelo base) | No comparable directamente: es la referencia sin comprimir |
| Mistral-7B-Instruct-v0.2 | 7,24 mil millones | 32.768 tokens | Apache 2.0 | HuggingFace | Superior en contexto y licencia permisiva; sin datos comparativos publicados para este artefacto |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Familia posterior, con contexto muy superior |

Los datos de las tres alternativas proceden de la documentación pública de esos modelos, no de la información proporcionada sobre este checkpoint. Para el modelo analizado no existe ningún benchmark publicado que permita una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explícitamente como artefacto de investigación y pide evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques frente a Llama-2-7b-chat, por lo que no debe usarse en producción ni exponerse a usuarios finales.
- Metadatos internamente incoherentes: un presupuesto de restauración del 0,000 % y 0 componentes restaurados son incompatibles con un modelo funcional y con el recuento real de parámetros.
- Discrepancia entre el nombre del checkpoint (`remove40`, que sugiere un 40 % de eliminación) y la model card (0,00 % de parámetros eliminados).
- La regla de selección figura como `unknown`, de modo que no es posible reproducir la lógica de restauración a partir de la documentación.
- Sin validación comunitaria: 0 descargas y 0 valoraciones reducen la probabilidad de que los pesos hayan sido verificados por terceros.
- Fechas de creación y actualización registradas el 12/09/2026, incoherentes con el estado del repositorio y que dificultan la trazabilidad temporal del artefacto.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por la compresión, según advierte el propio autor.
- Sesgos: los del modelo base Llama-2-7b-chat, con entrenamiento predominantemente en inglés y cobertura limitada de idiomas de bajos recursos; no se han re-evaluado en este checkpoint.
- Restricciones de licencia: Llama 2 Community License y USE_POLICY.md incluidos en el repositorio. El uso comercial está permitido con condiciones, exige la atribución "Built with Llama", obliga a que los modelos derivados incluyan "Llama" al inicio del nombre y requiere licencia específica de Meta por encima de 700 millones de usuarios activos mensuales.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove40_whiten_protk8
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Paper de SVD-LLM: no disponible en la información proporcionada
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados recibidos corresponden a páginas de ayuda de Google Translate, Google Meet y Google Lens sin relación con el artefacto.
