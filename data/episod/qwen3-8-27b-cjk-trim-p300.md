# episod/qwen3.8-27b-cjk-trim-p300

## Resumen

`episod/qwen3.8-27b-cjk-trim-p300` no es un modelo con pesos propios, sino un *bundle* fino (0,1 GB) del sistema `tt-model` en su versión v6 que define cómo servir el modelo `ProprietaryLegal/Qwen3.8-27B-CJK-Trim` (revisión `e5476cfa7df694f10fa9d00494f08e51010327b5`) sobre dos chips Tenstorrent Blackhole en malla P150x2. El paquete incluye configuración, plantilla de chat y lanzador; los pesos se descargan en el arranque desde el repositorio base con la cuenta de Hugging Face del usuario, y el código de modelo empleado es la implementación de Tenstorrent de `Qwen/Qwen3.8-27B`.

El interés técnico está en que documenta un caso poco habitual: inferencia en aceleradores Tenstorrent (no GPU NVIDIA) con una API compatible con OpenAI servida por vLLM, contexto declarado de 262.144 tokens, hasta 4 secuencias concurrentes y soporte de *tool calling* mediante el parser `qwen3_coder`. El vocabulario servido es un recorte del original (181.760 entradas frente a 248.320, es decir, 66.560 tokens ausentes) con identificadores renumerados, lo que afecta a cualquier cliente que opere con *token ids*.

Se trata de un artefacto de despliegue muy específico, con 0 descargas y 0 *likes* en el momento de la consulta y sin resultados de benchmarks publicados. La verificación de precisión declarada por el autor se limita a una comparación *top-1* frente a una referencia de CPU sobre un único *prompt* corto y fijo (0,9375 de coincidencia), por lo que debe evaluarse como infraestructura experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Implementación de Tenstorrent de la arquitectura de texto de `Qwen/Qwen3.8-27B`; no se especifica en la información disponible si es densa, MoE o híbrida |
| Parámetros totales | 27B según el nombre del modelo base; no confirmado en la información disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens; hasta 4 secuencias simultáneas |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el sufijo «CJK» del modelo base sugiere orientación a chino, japonés y coreano, sin confirmación) |
| Licencia | Apache 2.0 (declarada para los pesos); el bundle en sí no incluye pesos |
| Formato de pesos | No disponible; el bundle no distribuye pesos y los descarga en el arranque desde `ProprietaryLegal/Qwen3.8-27B-CJK-Trim` |
| Tamaño del vocabulario | 181.760 entradas (recorte del vocabulario de `Qwen/Qwen3.8-27B`, de 248.320) |
| Hardware objetivo | 2 chips Tenstorrent Blackhole, malla P150x2 |
| Tamaño del repositorio | 0,1 GB (bundle fino, sin pesos) |
| Servidor | vLLM con API compatible con OpenAI, puerto 8000 por defecto |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indican volumen de tokens, composición del corpus, ni si hubo RLHF, DPO u otras etapas de alineamiento. Lo que sí se documenta es el mecanismo del bundle: en cada arranque, el lanzador construye un directorio `model-dir/` combinando los ficheros de configuración de `Qwen/Qwen3.8-27B` (`config.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, incluidos en `base_config/`) con el tokenizador y los pesos de `ProprietaryLegal/Qwen3.8-27B-CJK-Trim`, y exporta `MODEL_WEIGHTS_DIR` y `HF_MODEL` para que los chips carguen esos pesos. El `vocab_size` servido se fija en 181.760 en el `config.json` generado.

El recorte de vocabulario es la modificación estructural principal: cada fila de *embedding* y de `lm_head` del modelo recortado corresponde a una fila del vocabulario original, con los *token ids* renumerados. Como consecuencia, la decodificación especulativa está desactivada (el *drafter* de `Qwen/Qwen3.8-27B` opera sobre identificadores que ya no coinciden) y el muestreo se ejecuta en el *host*, porque el muestreo en dispositivo no se usa con el *drafter* apagado en esta malla. No se mencionan innovaciones adicionales como atención lineal o atención dispersa.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* activado por defecto: la plantilla de chat hace que el modelo razone antes de responder, salvo que se desactive; el servidor devuelve el razonamiento en `reasoning_content` y la respuesta en `content`.
- Control del esfuerzo de razonamiento por petición mediante `chat_template_kwargs` y `reasoning_effort`, con valores `xhigh` (por defecto), `medium` y `low`.
- Desactivación del razonamiento por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- *Tool calling* / *function calling*: el servidor parsea las llamadas a `tool_calls` con el parser `qwen3_coder`.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Hasta 4 secuencias concurrentes por instancia.
- Compatibilidad con el endpoint `/v1/chat/completions` de OpenAI, lo que permite reutilizar SDK y clientes existentes.
- Capacidades multimodales: no disponibles en este paquete; `run.sh` omite la torre de visión, por lo que no acepta imágenes ni vídeo aunque el modelo *upstream* pudiera hacerlo.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: organizaciones con aceleradores Blackhole pueden servir un modelo de 27B sin GPU NVIDIA, usando `tt-model serve` para levantar el endpoint compatible con OpenAI en el puerto 8000.
- Sustitución de backend en aplicaciones ya integradas con la API de OpenAI: al mantener `/v1/chat/completions` y `tool_calls`, basta con apuntar el cliente al servidor local y leer el nombre del modelo desde `/v1/models`.
- Agentes con *tool calling*: el parser `qwen3_coder` permite ciclos de razonamiento y llamada a funciones (por ejemplo, ejecutar pruebas con `pytest`, consultar APIs internas) dentro de un mismo flujo multi-paso.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto se pueden ingerir contratos, expedientes o bases de código completas en una sola petición sin troceado previo.
- Asistencia a desarrollo de software: generación y revisión de código con modo *thinking* para tareas de depuración, y `reasoning_effort: low` para autocompletado o tareas simples donde prima la latencia.
- Validación de portabilidad numérica: el bundle sirve como banco de pruebas para comparar la salida en chips Tenstorrent contra una referencia de CPU, tal como hace el propio autor con la métrica de coincidencia *top-1*.
- Experimentación con vocabularios reducidos: útil para estudiar el impacto de recortar 66.560 entradas del vocabulario en calidad y velocidad de decodificación en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). Las únicas cifras aportadas por el autor son mediciones de verificación del propio bundle:

| Métrica | Valor | Etiqueta | Evidencia |
|---|---|---|---|
| Coincidencia *top-1* con la referencia de CPU (etapa 2, 2 chips, bundle `qwen3.8-27b-dflash2-p300`) | 0,9375 | medida | `stages/2/result.json`, `stages/2/evidence/swap-check.json`, `stages/2/evidence/server.log` |
| Servidor listo tras arranque (etapa 2, caché de tensores vacía) | 224,1 s | medida | `stages/2/result.json`, `stages/2/evidence/swap-check.json`, `stages/2/evidence/server.log` |
| Coincidencia *top-1* con la referencia de CPU (este paquete, etapa 7) | 0,9375 | medida | `stages/7/verify/evidence/verify.json`, `stages/7/verify/evidence/server.log` |
| Servidor listo tras arranque (este paquete, etapa 7, instalación limpia, caché vacía) | 1508,3 s | medida | `stages/7/verify/evidence/verify.json`, `stages/7/verify/evidence/server.log` |

Las propias etiquetas del autor marcan como `TODO` (no medido) la descarga de pesos a través de `tt-model`. No hay datos de latencia por token ni de *throughput*.

## Requisitos de hardware

- Aceleradores: exactamente 2 chips Tenstorrent Blackhole en malla P150x2; el bundle no declara soporte para otras configuraciones.
- VRAM: no aplica en el sentido habitual; la inferencia reside en la memoria de los chips Blackhole. La capacidad exacta necesaria no está disponible en la información proporcionada.
- GPU de consumo: no soportadas por este bundle; no se claim compatibilidad con RTX 4090, A100, H100 ni similares. Los pesos pueden ejecutarse en CPU/GPU con otras herramientas, pero eso queda fuera del alcance del paquete.
- Despliegue: `tt-model serve` (arnés `tt-orchard`), servidor basado en vLLM con API OpenAI; puerto 8000 salvo que se pase `--port`. Requiere cuenta de Hugging Face para descargar los pesos en el arranque.
- Almacenamiento y caché: existe una caché de tensores (`tt-model-cache`); con caché vacía e instalación limpia el arranque medido es de 1508,3 s (unos 25 minutos), frente a 224,1 s en la etapa 2.
- Latencia y *throughput*: no medidos. Al estar desactivada la decodificación especulativa, la velocidad de decodificación es la de decodificación plana, y el muestreo se ejecuta en el *host*, lo que añade un salto adicional por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `episod/qwen3.8-27b-cjk-trim-p300` (este bundle) | 27B (según nombre) | 262.144 tokens | 2× Tenstorrent Blackhole P150x2 | Apache 2.0 | Bundle público, 0 descargas; pesos descargados aparte |
| `ProprietaryLegal/Qwen3.8-27B-CJK-Trim` (modelo base) | No disponible | No disponible | CPU/GPU (no especificado) | Apache 2.0 según el bundle | Repositorio de pesos referenciado, no verificado en esta ficha |
| `Qwen/Qwen3.8-27B` (upstream) | 27B (según nombre) | No disponible en la información | CPU/GPU (no especificado) | No disponible en la información | Público; incluye torre de visión y *drafter* para decodificación especulativa |

No se dispone de datos de rendimiento comparables entre estas tres variantes, por lo que la comparación se limita a arquitectura de despliegue, vocabulario y funcionalidades habilitadas.

## Limitaciones y advertencias

- Precisión verificada de forma muy limitada: la coincidencia *top-1* de 0,9375 se midió sobre un único *prompt* corto y fijo; no cubre salidas largas, *tool calling* ni comportamiento de seguridad.
- Solo probado en 2 chips (malla P150x2); el autor no reclama funcionamiento en otras configuraciones.
- Sin decodificación especulativa: la velocidad de decodificación es la de decodificación plana, y el muestreo en *host* puede añadir latencia.
- Los *token ids* difieren de los de `Qwen/Qwen3.8-27B`: faltan 66.560 entradas del vocabulario y los identificadores están renumerados. Cualquier cliente que envíe o lea *token ids*, o que use otro tokenizador, obtendrá resultados distintos.
- Sin capacidades de visión ni vídeo en este paquete, aunque el modelo *upstream* las soporte.
- Arranque lento con caché de tensores vacía: 1508,3 s medidos, lo que penaliza despliegues efímeros o escalado horizontal frecuente.
- Licencia: el bundle declara Apache 2.0 para unos pesos alojados en un repositorio de terceros (`ProprietaryLegal`); conviene verificar la licencia directamente en ese repositorio antes de un uso comercial.
- Idiomas soportados no documentados; el recorte de vocabulario orientado a CJK puede degradar el rendimiento en otras lenguas, extremo no medido.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; no hay *model card* del modelo base ni informes de seguridad.
- Trazabilidad escasa: 0 descargas y 0 *likes*, sin resultados de benchmarks ni documentación sobre el entrenamiento; la búsqueda web realizada no ha devuelto material técnico relevante (los resultados corresponden a una cadena de estudios deportivos homónima, sin relación).
- Las funcionalidades de *thinking*, `reasoning_effort` y *tool calling* están tomadas de la plantilla de chat y de `run.sh`, no probadas por el autor según su propia nota.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/episod/qwen3.8-27b-cjk-trim-p300
- Modelo base (pesos): https://huggingface.co/ProprietaryLegal/Qwen3.8-27B-CJK-Trim
- Modelo *upstream* de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de la búsqueda web: ninguno relevante; las URLs devueltas (`episod.com` y subpáginas) corresponden a una cadena de estudios deportivos en Francia y no guardan relación con el modelo.
