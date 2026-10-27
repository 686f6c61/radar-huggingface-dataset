# esilva/KapiCoder-Mongo-Small

## Resumen

KapiCoder-Mongo-Small es un modelo de autocompletado de código de unos 1.500 millones de parámetros, afinado a partir de `Qwen/Qwen2.5-Coder-1.5B` por el usuario esilva para una tarea muy concreta: completar consultas de MongoDB en la posición del cursor mediante *fill-in-the-middle* (FIM). No es un modelo conversacional ni un agente: recibe el texto anterior y posterior al cursor junto con una cabecera de contexto (`editor-context-v1`) y propone una continuación corta, limitada a 32 tokens por el editor que lo integra. Está diseñado para el editor *Kapibara Studio* y cubre el dialecto MongoDB Console JavaScript (`ConnectionPool.<conn>.<db>.<collection>.find(...)`, pipelines de agregación, etapas `$search`, definiciones de índices) y pipelines JSON.

El modelo se publica como **preview experimental** (etiqueta de repositorio `v0.1.0-preview`, pesos v3) y el propio autor lo desaconseja para producción. Su interés técnico está en la especialización extrema: un modelo pequeño, con licencia Apache 2.0, entrenado sobre datos sintéticos generados por un LLM (Qwen3-14B) y plantillas gramaticales, con un contrato de prompt explícito y un conjunto de evaluación de homologación fuera de distribución construido sobre 28 esquemas de telecomunicaciones y adtech nunca vistos en entrenamiento.

La relevancia práctica es la de un corrector de autocompletado local y barato, que cabe en GPUs de consumo, frente a alternativas generalistas mucho mayores. La contrapartida es una evaluación íntegramente sintética, sin conjunto escrito por personas y con una única semilla de entrenamiento, lo que limita seriamente cualquier conclusión sobre su comportamiento con consultas reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivada de `Qwen/Qwen2.5-Coder-1.5B`); detalles internos de capas y cabezas no disponibles |
| Parámetros totales | 1.543.714.304 (1,5 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; no verificada en esta ficha) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en, pt (según las etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB), librería `transformers` |
| Pipeline | text-generation |
| Tarea específica | FIM / autocompletado en MongoDB Console JavaScript y pipelines JSON |
| Contrato de prompt | `editor-context-v1` (texto antes del cursor, texto después del cursor y cabecera de contexto) |
| Límite de salida recomendado | 32 tokens por sugerencia (impuesto por el editor) |
| Versión de pesos | v3, etiqueta de repositorio `v0.1.0-preview` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parámetros. Sobre esa base se aplica un ajuste fino supervisado orientado a FIM, es decir, el modelo aprende a rellenar el hueco entre un prefijo y un sufijo de código en lugar de continuar texto libre. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron etapas de RLHF o DPO; únicamente indica que el corpus es sintético, generado por un LLM (Qwen3-14B) y por plantillas gramaticales sobre distintos esquemas de colecciones MongoDB, y que se aplicó un proceso de decontaminación eliminando cortes de entrenamiento que compartían n-gramas largos con el conjunto de evaluación.

La innovación destacable no está en la arquitectura sino en el contrato de contexto y en el protocolo de evaluación. El prompt `editor-context-v1` transporta el prefijo, el sufijo y una cabecera con los nombres de campo de la colección cuando están disponibles (`context_kind=full`), lo que permite medir por separado el efecto de ver el esquema. La evaluación combina un split de validación interno del generador (n=2000) con un conjunto de homologación fuera de distribución (n=6030, 28 esquemas de telecomunicaciones y adtech no vistos en entrenamiento), escrito también por un LLM y por la gramática, no por personas. Se entrenó una única ejecución por modelo (una sola semilla) y se evaluó con una única pasada greedy, sin estimación de varianza entre ejecuciones.

## Capacidades

- Autocompletado FIM en la posición del cursor para MongoDB Console JavaScript: llamadas `find(...)` sobre `ConnectionPool.<conn>.<db>.<collection>`, filtros, proyecciones y opciones.
- Generación de etapas de pipelines de agregación y de etapas `$search`.
- Generación de definiciones de índices y de pipelines en formato JSON.
- Condicionamiento por esquema: acepta una cabecera de contexto con los nombres de campo de la colección (`context_kind=full`), lo que reduce —sin eliminar— la invención de campos.
- Conserva cierta capacidad genérica de JavaScript: 0,606 de FIM accuracy en un conjunto interno de cortes FIM sobre paquetes npm permisivos (n=500), usado como control de regresión.
- Sugerencias cortas: el diseño asume un tope de 32 tokens por continuación.
- **No** soporta tool calling ni function calling.
- **No** es un modelo de agentes ni de razonamiento multi-paso.
- **No** sigue instrucciones, no mantiene conversaciones y no explica código (pese a la etiqueta `conversational` del repositorio, la propia model card lo desmiente explícitamente).
- **No** ejecuta consultas: solo sugiere texto; cualquier ejecución corresponde a la aplicación anfitriona.
- Capacidades multilingües: no acreditadas más allá de las etiquetas `en` y `pt`; no hay evaluación por idioma en la información disponible.
- Sin modo *thinking*, visión ni audio.

## Casos de uso

- **Autocompletado en el editor para desarrolladores de MongoDB**: el modelo recibe el prefijo y el sufijo del buffer más la cabecera con los campos de la colección y propone la continuación del filtro o de la etapa de agregación; encaja porque la latencia y el coste son mínimos con 1,5 B de parámetros y 32 tokens de salida, y porque el desarrollador revisa cada inserción.
- **Asistencia en pipelines de agregación largos**: al rellenar etapas intermedias (`$match`, `$group`, `$lookup`, `$search`) en un pipeline ya iniciado, el modelo aprovecha el sufijo para mantener la coherencia sintáctica con las etapas posteriores, algo que un modelo de continuación pura no hace.
- **Autocompletado de índices en tareas de modelado de datos**: dado el nombre de la colección y los campos visibles en el contexto, sugiere la definición de índice; útil en equipos que escriben muchos `createIndex` repetitivos y quieren reducir tecleo.
- **Generación de esqueletos de consultas JSON para herramientas internas**: integrado en un panel de administración que produce pipelines JSON a partir de un contexto de esquema, con revisión humana antes de guardar.
- **Prototipado de asistentes de consulta dentro de un IDE o notebook**: sirve como pieza de autocompletado en un plugin experimental, aceptando la tasa de campos inventados como tolerable mientras se valida contra el esquema antes de ejecutar.
- **Evaluación comparativa de técnicas de FIM sobre dialectos de bases de datos**: el par (modelo, protocolo `editor-context-v1`) y sus conjuntos sintéticos sirven como línea base reproducible para quien investigue autocompletado especializado en un DSL concreto.
- **Ahorro de coste frente a modelos generalistas en entornos con GPU de consumo**: al caber en una GPU de 8-12 GB, permite autocompletado on-premise sin enviar código a un servicio externo, siempre que se acepte su estado de preview.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (`verified: false`), sobre conjuntos internos y sintéticos.

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| KapiCoder v2c validation split, interno y sintético (n=2000) | FIM accuracy (exact match normalizado) | 0,4100 |
| KapiCoder v2c validation split (n=2000) | Exec-valid (la continuación parsea y se ejecuta en solo lectura) | 0,6015 |
| KapiCoder v2c validation split (n=2000) | Exec-valid dividido por el techo del validador (0,6255) | 0,9616 |
| KapiCoder v2c validation split (n=2000) | Syntax-valid | 0,9980 |
| KapiCoder v2c validation split (n=2000) | Campos inexistentes con esquema visible (`context_kind=full`), porcentaje | 1,21 % |
| Cortes FIM sobre JavaScript de npm permisivo, interno (n=500) | FIM accuracy (control de regresión genérica) | 0,6060 |
| Homologación OOD v1, sintética (n=6030, 28 esquemas no vistos) | FIM accuracy (exact match normalizado) | 0,4537 |
| Homologación OOD v1 (n=6030) | Exec-valid | 0,8307 |
| Homologación OOD v1 (n=6030) | Exec-valid dividido por el techo del validador (0,9307) | 0,8926 |
| Homologación OOD v1 (n=6030) | Campos inexistentes con esquema visible, porcentaje | 7,50 % |

Comparación de la métrica de campos inexistentes con esquema visible sobre el conjunto de homologación, según la model card:

| Modelo | Campos inexistentes (esquema visible) |
|---|---|
| KapiCoder-Mongo-Small (v3, publicado) | 7,50 % |
| `Qwen/Qwen2.5-Coder-1.5B` zero-shot (base) | 7,15 % |
| Checkpoint interno previo (no publicado) | 9,19 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimación a partir del recuento de parámetros, no de mediciones publicadas): ~3,1 GB de pesos en fp16/bf16 más caché KV; ~1,6 GB en int8; ~0,9-1,0 GB en 4 bits. Con ventanas de contexto cortas y salidas de 32 tokens, la caché KV es marginal.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB para bf16 con holgura (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, L4); A100/H100 no aportan ventaja relevante a este tamaño y solo se justifican por agregación de peticiones.
- **Cabe en GPU de consumo**: sí, previsiblemente en tarjetas de 6-8 GB en bf16 y en tarjetas de 4 GB con cuantización de 4 bits, aunque no hay mediciones publicadas que lo confirmen.
- **Opciones de despliegue**: `transformers` (librería declarada) y Text Generation Inference (etiqueta `text-generation-inference`), además de endpoints compatibles (etiqueta `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI con cuantizaciones no están confirmados en la información disponible; el repositorio no incluye ficheros GGUF.
- **Latencia y throughput**: no disponibles. Como referencia de diseño, el editor limita la salida a 32 tokens y la evaluación se hizo con decodificación greedy única, sin mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KapiCoder-Mongo-Small | 1,54 B | no disponible | FIM accuracy 0,41 en validación interna; 0,4537 en homologación OOD | Apache 2.0 | Público en HF, preview, 0 descargas |
| `Qwen/Qwen2.5-Coder-1.5B` (base) | 1,54 B | no disponible en esta ficha | Uso como referencia zero-shot: 7,15 % de campos inexistentes en homologación; resto de métricas no disponibles | Apache 2.0 | Público en HF |
| Checkpoint interno previo del mismo autor | no disponible | no disponible | 9,19 % de campos inexistentes en homologación | no disponible | No publicado |
| Otros modelos especializados en FIM para MongoDB | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

La comparación honesta es contra el modelo base: la mejora medida se limita a la tasa de campos inexistentes en el conjunto de homologación (7,50 % frente a 7,15 % del base), es decir, prácticamente indistinguible, y el propio autor advierte que el conjunto no es plenamente independiente de los datos de entrenamiento v3.

## Limitaciones y advertencias

- **Estado preview/experimental**: el autor indica explícitamente que no es para uso en producción; se publica para inspección y retroalimentación.
- **Evaluación exclusivamente sintética**: todos los números provienen de datos generados por un LLM (Qwen3-14B) y por plantillas gramaticales; no hay ningún conjunto escrito por personas ni evaluación ciega.
- **El conjunto de homologación no es plenamente independiente**: el corpus v3 contiene consultas del mismo generador LLM y de las mismas plantillas gramaticales sobre otros esquemas, por lo que la ganancia en consultas escritas por LLM probablemente sobreestima la ganancia en consultas humanas.
- **Invención de nombres de campo**: con el esquema visible, el 7,50 % de las sugerencias en homologación usan un campo inexistente (frente al 7,15 % del base). Hay que validar los nombres de campo antes de ejecutar cualquier sugerencia.
- **Sugerencias destructivas posibles**: una continuación puede ser sintácticamente válida (0,998 de syntax-valid) y aun así ser incorrecta o destructiva si se ejecuta sin revisión; el modelo nunca ejecuta nada, pero tampoco valida semántica ni permisos.
- **Sin estimación de varianza**: una sola semilla de entrenamiento y una sola pasada de evaluación greedy; no hay intervalos de confianza ni repetibilidad medida.
- **Alcance funcional muy estrecho**: solo MongoDB Console JavaScript y pipelines JSON en los dialectos descritos; cualquier otro dialecto queda fuera de alcance. No sirve para chat, revisión de código ni explicaciones, a pesar de la etiqueta `conversational`.
- **Sin soporte de tool calling ni de agentes**: no puede integrarse en flujos multi-paso que requieran seguir instrucciones.
- **Idiomas**: las etiquetas declaran `en` y `pt`, pero no hay evaluación por idioma; se desconoce el comportamiento real en portugués y no hay indicios de soporte de castellano.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero el modelo base también es Apache 2.0 y se mantienen sus condiciones; al ser un preview sin garantías, el riesgo de calidad recae en quien lo despliega.
- **Advertencia de producción**: no debe usarse para ejecutar o modificar datos en producción de forma desatendida, ni para decisiones de seguridad, cumplimiento o control de acceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/esilva/KapiCoder-Mongo-Small
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Referencia arXiv declarada en las etiquetas del repositorio: https://arxiv.org/abs/2409.12186
- Repositorio con la etiqueta de versión `v0.1.0-preview`: https://huggingface.co/esilva/KapiCoder-Mongo-Small/tree/v0.1.0-preview
- Documentación de Text Generation Inference: no disponible en la información proporcionada
- Blog, paper o demo del autor: no disponible en la información proporcionada
