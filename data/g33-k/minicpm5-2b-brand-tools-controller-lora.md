# G33-k/minicpm5-2b-brand-tools-controller-lora

## Resumen

G33-k/minicpm5-2b-brand-tools-controller-lora es un adaptador LoRA de uso de herramientas (tool use) entrenado sobre el modelo base openbmb/MiniCPM5-2B (revision 12a3808a956f869c767195e9266b59c4d21d92e2). No es un modelo de propósito general: es un controlador estrecho que aprende a mapear formularios de entrada a llamadas de dos herramientas TypeScript deterministas, `verify_company_website` y `find_customer_facing_pages`, además de la disciplina de argumentos, la clarificación ante entradas ambiguas, el reporte honesto de estado y la recuperación de identificadores caducados o ajenos.

El adaptador se entrenó exclusivamente con datos sintéticos: 1.032 conversaciones y 2.856 decisiones del asistente, generadas ejecutando las herramientas reales contra mundos fixture deterministas. La selección de páginas, los hechos de propiedad y la admisión de la voz de marca residen en las herramientas, no en el modelo; la escritura, el perfilado y el copywriting no son objetivos de entrenamiento.

Su relevancia es acotada pero concreta: demuestra un patrón de especialización de bajo coste (adaptador PEFT de 0,1 GB de repositorio, rango 16) sobre un modelo de ~2B para orquestación fiable de herramientas. En el momento de su publicación no contaba con descargas ni valoraciones, y la evaluación completa de 258 episodios estaba aún en curso, por lo que se debe tratar como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de la familia MiniCPM5 (base openbmb/MiniCPM5-2B); módulos objetivo q/k/v/o/gate/up/down |
| Parametros totales | Adaptador LoRA con r=16, alpha=32, dropout 0; modelo base de ~2B de parámetros (el recuento exacto del base no se especifica) |
| Longitud de contexto | 16.384 tokens (secuencia máxima de entrenamiento; la decisión más larga fue de 9.809 tokens) |
| Tipos de cuantizacion | Base entrenada en NF4 (4 bits) con cómputo en bf16; el adaptador se distribuye en precisión completa sobre safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT no fusionado) |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 16 y alpha 32, sin dropout, aplicado sobre los módulos de atención (q, k, v, o) y de MLP (gate, up, down) del modelo base MiniCPM5-2B. El entrenamiento utilizó Unsloth 2026.9.7 únicamente para cargar el modelo, mientras que el batching, el enmascarado y la reanudación provinieron del repositorio propio del autor. La base se cuantizó en NF4 (4 bits) con cómputo en bf16. La tokenización fue por decisión, con enmascarado solo del asistente, plantilla de chat nativa con `enable_thinking=False` y hash de plantilla `cc945752...`. La secuencia máxima fue de 16.384 tokens y la decisión más larga ocupó 9.809 tokens.

El conjunto de datos es totalmente sintético, correspondiente a la revisión de corpus 2026-09-21 (1.032 conversaciones, 2.856 decisiones del asistente, 43 familias base), generado ejecutando las herramientas reales contra mundos fixture deterministas; no hay ejemplos de empresas reales ni revisados por humanos. La receta empleó una tasa de aprendizaje de 1e-4 con programación coseno y warmup del 3 %, dos épocas (4.168 pasos de optimización), entrenadas en una NVIDIA RTX PRO 6000 Blackwell (sm_120), en una partición MIG 4g.96gb, durante 3 h 14 min, a 1.264 tokens/s y con un pico de 26,1 GiB de memoria. La pérdida de validación registrada fue de 0,0 sobre 714 decisiones, una señal de saturación que el propio autor advierte que no debe interpretarse como criterio de selección; el criterio real es la tasa de aprobación del harness.

## Capacidades

- Mapeo de formularios de entrada a llamadas de herramienta, con orden de herramientas y disciplina de argumentos aprendidos.
- Operación de exactamente dos herramientas TypeScript deterministas: `verify_company_website` y `find_customer_facing_pages`.
- Clarificación ante entradas ambiguas antes de invocar una herramienta.
- Reporte honesto de estado de las operaciones ejecutadas.
- Recuperación de identificadores caducados o ajenos (expiry/foreign-ID recovery).
- Emisión de llamadas mediante los tokens especiales propios de MiniCPM5: `<function`, `<param`, `</function>` y `<tool_call>`.
- No cubre generación de texto abierta, redacción, perfilado ni copywriting, que no son objetivos de entrenamiento.

## Casos de uso

- Verificación de dominios corporativos en flujos de alta de clientes: el adaptador transforma los datos de un formulario en una llamada válida a `verify_company_website`, lo que permite validar dominios de forma automática antes de crear una cuenta.
- Descubrimiento de páginas de cara al cliente para auditorías de marca: mediante `find_customer_facing_pages` el modelo localiza las páginas relevantes del sitio, delegando la decisión de propiedad y de voz de marca a la propia herramienta.
- Orquestación de agentes de atención al cliente: dado que aprende orden de herramientas, clarificación y reporte de estado, encaja como capa de control en conversaciones multi-turno que deban encadenar las dos herramientas.
- Normalización de argumentos en pipelines de integración: el modelo respeta el esquema declarado de cada herramienta, lo que reduce errores de tipo antes de llegar a la API.
- Gestión de incidencias con identificadores caducados o ajenos: el adaptador se entrenó específicamente para recuperarse de estos casos, útil en sistemas que reciben IDs obsoletos o de otra cuenta.
- Detección de ambigüedad en la entrada: en lugar de invocar una herramienta con datos insuficientes, el modelo pide aclaración, lo que evita operaciones erróneas en producción.
- Pruebas de regresión de tool calling en CI/CD: puede integrarse como componente bajo test frente a un harness determinista, comparando la tasa de aprobación entre revisiones del adaptador.
- Sustitución de lógica de enrutado escrita a mano: reduce código de pegamento al mapear intenciones de formulario a llamadas concretas, manteniendo las decisiones de negocio en las herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son las comprobaciones del harness propio del autor:

| Prueba | Resultado |
|---|---|
| Paridad de prompt (pre-flight) | 120/120 |
| Pruebas del parser | 29/29 |
| Sonda del harness de 8 casos | 8/8 |
| Pérdida de validación (714 decisiones) | 0,0 |
| Adaptador previo (revisión 2026-09-18) | 252/258 (puntuación retirada y no comparable) |
| Validación completa de 258 episodios | En curso en el momento de la publicación |

Advertencia del autor: el éxito sobre fixtures deterministas no equivale a precisión en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB con la base en 4 bits (NF4) y aproximadamente 4-5 GB en bf16/fp16 para una base de ~2B; son estimaciones a partir del tamaño del modelo, no cifras publicadas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090); el entrenamiento documentado usó una NVIDIA RTX PRO 6000 Blackwell en una partición MIG 4g.96gb, con un pico de 26,1 GiB.
- Cabe en GPU consumer: sí, dado el tamaño de la base (~2B) y el adaptador de 0,1 GB.
- Opciones de despliegue: se debe evaluar el adaptador sin fusionar sobre la base NF4 con la que fue entrenado; servir en modo greedy y con el modo thinking desactivado. Es necesario decodificar con `skip_special_tokens=False` y recortar solo los controles de chat, o las llamadas de herramienta desaparecen silenciosamente. Los parámetros de las llamadas deben coercionarse según el tipo declarado en el esquema, siguiendo `minicpm5xml_tool_parser.py` de OpenBMB.
- Latencia y throughput: no se documentan cifras de inferencia; el único dato de rendimiento es de entrenamiento (1.264 tokens/s, 3 h 14 min en la configuración descrita).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G33-k/minicpm5-2b-brand-tools-controller-lora | Adaptador LoRA sobre base ~2B | 16.384 (entrenamiento) | Dos herramientas TypeScript concretas | Apache 2.0 | HuggingFace (PEFT) |
| openbmb/MiniCPM5-2B (base) | ~2B | no disponible | Propósito general | no disponible | HuggingFace |
| Adaptadores de function calling sobre modelos pequeños (familias de 1-3B) | 1-3B | Variable | Tool calling genérico | Variable | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: cero ejemplos de empresas reales y cero ejemplos revisados por humanos; el éxito sobre fixtures no garantiza precisión en el mundo real.
- Pérdida de validación de 0,0: se trata de una señal de saturación, no de una prueba de generalización.
- Alcance muy reducido: solo opera dos herramientas concretas y no debe usarse como modelo de propósito general.
- No apto para escritura, perfilado ni copywriting, que no forman parte de los objetivos de entrenamiento.
- Riesgo operativo en la decodificación: con `skip_special_tokens=True` las llamadas de herramienta se pierden sin aviso.
- Idiomas soportados no documentados; probablemente limitado al idioma de los datos sintéticos (no especificado).
- Estado de evaluación incompleto: la validación completa de 258 episodios estaba en curso al publicarse, y la puntuación de 252/258 corresponde a un adaptador previo y está retirada.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la falta de validación completa desaconsejan su uso en producción sin una evaluación propia.
- Requiere servir el adaptador sin fusionar sobre la base NF4 y con el parser específico de OpenBMB; no es un despliegue estándar.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/G33-k/minicpm5-2b-brand-tools-controller-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Conjunto de datos de evaluación asociado: https://huggingface.co/datasets/G33-k/minicpm5-brand-tools-eval-kit
- No se han encontrado enlaces adicionales relevantes (papers, blogs o repos) en los resultados de búsqueda web disponibles.
