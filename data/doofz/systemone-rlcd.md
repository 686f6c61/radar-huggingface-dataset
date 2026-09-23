# doofz/systemone-rlcd

## Resumen

System One es un motor de decisiones no autorregresivo desarrollado por HAL-X (publicado en HuggingFace bajo la cuenta `doofz`). No es un modelo generativo: recibe un estado (un mensaje, un correo, un ticket, un registro JSON o una conversación) junto con un conjunto de preguntas tipadas, y devuelve una respuesta tipada para cada pregunta con una probabilidad calibrada, todo en una única pasada forward de un encoder bidireccional. Según el autor, la latencia es de unos 9 ms en una RTX 4090. El espacio de respuestas se define en tiempo de petición, por lo que un esquema nuevo no requiere reentrenamiento.

El repositorio `doofz/systemone-rlcd` empaqueta cuatro checkpoints sobre dos backbones distintos: `jhu-clsp/mmBERT-base` (322M parámetros, contexto 1024) y `answerdotai/ModernBERT-large` (421M parámetros). La release destacada es System One AZ, ajustada para azerí con retención de inglés, acompañada de un router de idioma que selecciona el checkpoint adecuado en unos 20 µs. El repositorio declara 421.293.830 parámetros en los metadatos de safetensors y un tamano de 3,0 GB.

Su relevancia actual radica en una alternativa a los flujos de "LLM como juez": en lugar de generar texto y parsearlo (con el coste y el riesgo de alucinación asociados), el modelo lee la posición `[MASK]` de cada opción y emite una distribución calibrada. Frente al backbone multilingüe base, el autor reporta mejoras notables en azerí (0,88 frente a 0,40 en MASSIVE-scenario) y una calibración mucho mejor (ECE medio 0,054 frente a 0,215). No obstante, el modelo no registra descargas ni likes en el momento de la consulta y no se han encontrado validaciones independientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT / mmBERT) con cabeza de decisión tipada no autorregresiva; clasificación por puntuación en posición `[MASK]` |
| Parametros totales | 421.293.830 (metadatos safetensors del repositorio); checkpoints individuales de 322M (mmBERT-base) y 421M (ModernBERT-large) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (AZ, multilingual, typed-decisions); 512 tokens (checkpoint EN) |
| Tipos de cuantizacion | No disponible (el autor documenta ejecución en bf16; no se listan pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Azerí (`az`, alfabeto latino; también texto escrito en ASCII), inglés (`en`) y más de 100 idiomas mediante el checkpoint multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | `text-classification` |
| Modelos base | `jhu-clsp/mmBERT-base`, `answerdotai/ModernBERT-large` |
| Checkpoints incluidos | `azerbaijani/`, raíz del repo (EN), `multilingual/`, `typed-decisions/` |
| Tamano del repositorio | 3,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

System One no decodifica tokens de forma autorregresiva. Cada checkpoint es un encoder bidireccional (ModernBERT-large o mmBERT-base) seguido de una cabeza personalizada que lee una puntuación en la posición `[MASK]` de cada opción candidata. Las preguntas se formulan en tres primitivas: `choice` (una etiqueta más una distribución sobre las etiquetas), `score` (nivel esperado más distribución sobre niveles ordenados) y `noul` (probabilidad de verdadero/falso). El espacio de respuestas se declara en tiempo de petición, de modo que no hace falta reentrenar para adaptarse a un esquema nuevo. Un router de idioma, con un coste declarado de unos 20 µs, decide qué checkpoint atiende cada petición; con `preload=True` los cuatro checkpoints permanecen residentes (unos 3,2 GB en total).

El checkpoint AZ está entrenado sobre azerí e inglés (las preguntas pueden escribirse en cualquiera de los dos idiomas) y el multilingüe cubre más de 100 idiomas. El autor no publica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento; las etiquetas del repositorio (`rlcd`, `calibrated-decisions`) apuntan a un objetivo de calibración de probabilidades, pero no se detalla el procedimiento. Los conjuntos de evaluación citados son MASSIVE-scenario, una tarea de intención sí/no y SIB-200 en modo zero-shot. El README del repositorio aparece truncado, por lo que falta la parte final de la sección sobre compatibilidad con vLLM y el apartado de throughput.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice`, `score` y `noul` con una distribución de probabilidad por pregunta.
- Probabilidades calibradas: ECE medio de 0,054 en azerí según el autor, frente a 0,215 del backbone multilingüe base.
- Enrutado de idioma automático: selecciona el checkpoint por idioma y script en aproximadamente 20 µs.
- Sin generación de texto: al no producir tokens libres, no hay salida que parsear ni texto generado que pueda alucinarse; la salida es una distribución sobre opciones declaradas.
- Esquemas definidos en tiempo de petición: no se requiere reentrenamiento para añadir una pregunta o un conjunto de etiquetas nuevo.
- Ejecución por lotes: el endpoint `/v1/decide/batch` agrupa peticiones por checkpoint y las procesa en una pasada por grupo.
- Casos especializados por checkpoint: guardrails y triaje de correo en inglés, intención y sentimiento en azerí, más de 100 idiomas en el multilingüe, y cuatro flujos de negocio de decisión tipada en `typed-decisions/`.
- Servidor listo para producción: paquete `systemone` con API REST en FastAPI, autenticación por bearer token y endpoints `/health`, `/v1/models`, `/v1/presets`, `/v1/route`, `/v1/decide` y `/v1/decide/batch`.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni código: no es un modelo generativo ni multimodal.

## Casos de uso

- Triaje de tickets de soporte en azerí: el checkpoint AZ clasifica un ticket en departamentos (facturación, técnico, ventas, otros) con distribución de probabilidad; el ejemplo de la model card muestra una probabilidad de 0,979 para `billing` en una reclamación de cobro duplicado.
- Guardrails y moderación de contenido: el checkpoint EN está orientado a guardrails; se puede declarar un esquema tipo `{"toxic": noul, "categoria": choice}` y filtrar entradas antes de que lleguen a un LLM generativo.
- Enrutado de peticiones hacia otros modelos: usar `/v1/route` o una pregunta `choice` para decidir qué modelo o pipeline debe atender cada petición, sin coste de generación.
- Triaje de correo entrante: el checkpoint EN está documentado específicamente para email triage; se le pasan asunto y cuerpo como estado y devuelve departamento, urgencia y acción requerida.
- Análisis de sentimiento multilingüe: con el checkpoint multilingüe (más de 100 idiomas) o con AZ para azerí, se obtiene etiqueta y distribución sobre reseñas o comentarios; el ejemplo de la card devuelve 0,9997 para `negative` en una reseña en azerí.
- Validación de registros JSON contra políticas: usando `noul` se comprueba si un registro cumple condiciones declaradas (por ejemplo, si una solicitud incluye petición explícita de reembolso), con probabilidad calibrada en lugar de una respuesta binaria opaca.
- Pre-filtro económico antes de un LLM: al resolver en 8,9 ms una pregunta sobre GPU consumer, se puede descartar o clasificar el tráfico barato y reservar el modelo generativo para los casos que lo requieran.
- Procesamiento por lotes en back-office: el endpoint `/v1/decide/batch` permite clasificar grandes volúmenes de correos o tickets agrupados por checkpoint en pasadas únicas.

## Benchmarks y rendimiento

| Métrica | System One AZ | Referencia indicada por el autor |
|---|---|---|
| MASSIVE-scenario (exactitud, azerí) | 0,88 | 0,40 (backbone multilingüe base) |
| Intención sí/no (exactitud, azerí) | 0,94 | 0,65 (backbone multilingüe base) |
| SIB-200 zero-shot (exactitud) | 0,72 | 0,67 (backbone multilingüe base) |
| ECE medio (calibración, azerí) | 0,054 | 0,215 (base multilingüe); 0,285 (checkpoint inglés) |
| Latencia p50, 1 pregunta | 8,9 ms (RTX 4090) | no disponible |
| Latencia p50, 50 preguntas en una llamada | 17,3 ms (RTX 4090) | no disponible |
| Coste del router de idioma | ~20 µs | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de razonamiento o generación en la información disponible, lo cual es coherente con que el modelo no sea generativo. Tampoco hay datos de throughput; el README del repositorio está truncado justo en ese punto.

## Requisitos de hardware

- VRAM en bf16: 0,65 GB por checkpoint de 322M parámetros (AZ y multilingüe), según el autor. Los cuatro checkpoints residentes ocupan unos 3,2 GB. No se indica la VRAM del checkpoint de 421M parámetros de forma explícita.
- GPU: la única GPU con mediciones publicadas es la RTX 4090 (8,9 ms y 17,3 ms p50). No hay datos para A100, H100 ni otras tarjetas.
- GPU consumer: con 0,65 GB en bf16 por checkpoint de 322M, el modelo cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre; el autor no publica pruebas en GPU distintas de la RTX 4090, por lo que la latencia en otras tarjetas es no disponible.
- Despliegue: PyTorch más `transformers`, con el paquete `systemone` incluido en el propio repositorio (`hf download doofz/systemone-rlcd --include "systemone/*" ...` y `pip install "./systemone-src[server]"`). Incluye servidor FastAPI con autenticación por bearer token.
- Compatibilidad con vLLM: el autor indica explícitamente que vLLM no es compatible, porque está diseñado para decodificación autorregresiva con caché KV paginada y su runner de pooling no dispone de clase para la cabeza de decisión. Un único proceso de PyTorch ya responde en unos 9 ms sin caché KV que gestionar.
- No se documentan opciones de llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Contexto | Idiomas | Latencia (RTX 4090, p50) | Licencia |
|---|---|---|---|---|---|---|
| System One AZ | mmBERT-base | 322M | 1024 | Azerí (latino y ASCII) + inglés | 8,9 ms (1 pregunta) | Apache 2.0 |
| System One EN | ModernBERT-large | 421M | 512 | Inglés | No disponible | Apache 2.0 |
| System One Multilingual | mmBERT-base | 322M | 1024 | Más de 100 idiomas | No disponible | Apache 2.0 |
| System One Typed-Decisions | ModernBERT-large | 421M | 1024 | Inglés | No disponible | Apache 2.0 |

| Comparación de rendimiento en azerí | System One AZ | Backbone multilingüe base |
|---|---|---|
| MASSIVE-scenario (exactitud) | 0,88 | 0,40 |
| Intención sí/no (exactitud) | 0,94 | 0,65 |
| SIB-200 zero-shot (exactitud) | 0,72 | 0,67 |
| ECE medio | 0,054 | 0,215 |

No hay comparaciones publicadas frente a alternativas de la misma categoría funcional, como clasificadores zero-shot basados en modelos de lenguaje o aproximaciones de LLM-as-a-judge: los únicos puntos de referencia que aporta el autor son los propios backbones base y el checkpoint inglés del mismo sistema. Por tanto, la comparación con soluciones de terceros es no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, resumir, traducir ni programar. Solo responde a preguntas tipadas declaradas en la petición.
- La arquitectura no encaja en runners de decodificación autorregresiva; vLLM no es compatible, lo que limita las opciones habituales de serving a gran escala.
- Ventana de contexto corta: 512 tokens en el checkpoint inglés y 1024 en el resto. Estados más largos (correos extensos, conversaciones largas) deben truncarse o trocearse, con la pérdida de información que ello implica.
- El espacio de respuestas debe definirse explícitamente; preguntas abiertas o categorías no declaradas no se resuelven correctamente.
- Evidencia de evaluación limitada: los resultados publicados se reducen a MASSIVE-scenario, una tarea de intención sí/no y SIB-200 zero-shot, todos en azerí para las cifras destacadas. No hay benchmarks generales ni evaluación en otros dominios.
- Calibración no verificada por terceros: el ECE de 0,054 es un dato del autor y es una media; no hay desglose por dominio, por longitud de entrada ni por clase, y puede degradarse fuera de la distribución de entrenamiento.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de filtrado, por lo que el riesgo de sesgo demográfico, cultural o de dominio es no evaluado.
- Soporte de script: el checkpoint AZ está orientado a azerí en alfabeto latino, y admite texto escrito en ASCII, pero no se documenta el comportamiento con alfabeto cirílico ni con variantes ortográficas.
- Adopción nula registrada en el momento de la consulta (0 descargas, 0 likes) y ausencia de validación independiente; conviene tratar las cifras como declaraciones del autor hasta replicarlas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero al derivar de `answerdotai/ModernBERT-large` y `jhu-clsp/mmBERT-base` conviene verificar también las condiciones de esos modelos base antes de un despliegue en producción.
- El README del repositorio está truncado, por lo que parte de la documentación técnica (throughput, detalles finales de despliegue) no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doofz/systemone-rlcd
- Modelo base (checkpoint inglés y typed-decisions): https://huggingface.co/answerdotai/ModernBERT-large
- Modelo base (checkpoints azerí y multilingüe): https://huggingface.co/jhu-clsp/mmBERT-base
- El repositorio no publica enlaces a paper, blog, demo ni repositorio de código independientes en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente páginas genéricas de Microsoft (microsoft.com, account.microsoft.com, outlook.office.com), sin relación con System One ni con HAL-X.
