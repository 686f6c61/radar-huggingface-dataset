# remix3030303/jevcommunity

## Resumen

JevCommunity es un repositorio de despliegue local, no un modelo entrenado desde cero, que empaqueta el stack de servicio de Kev (proyecto de Jared Palmer, licencia Apache-2.0) y lo fija a los pesos de Kev-0.8B, construidos sobre `Qwen/Qwen3.5-0.8B-Base`. Su objetivo es replicar en local, sobre Apple Silicon, la interfaz `/v1/systemone` del servicio alojado TypeSafe Jev: un modelo de "decisiones System One" que no genera texto conversacional, sino que recibe un `state` compartido y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y devuelve distribuciones de probabilidad y niveles de confianza.

La relevancia del proyecto es acotada y practica: permite prototipar contra un esquema de API compatible con Jev sin depender del servicio hospedado, en un Mac mini M4 con 16 GB de memoria unificada. El propio autor advierte que la calidad sigue a Kev-0.8B y no al Jev propietario: según las model cards de Kev, Jev se situa cerca de Decision Index ~54, mientras que la variante 0.8B queda muy por debajo. Por tanto, sirve para paridad de esquema y confianza, no para paridad de precision.

El repositorio incluye un modo cascada por defecto: Kev-0.8B resuelve casos claros en torno a 50 ms y los inciertos se escalan a `AbstractFramework/kev-4b-mlx-4bit` (cuantizacion MLX de 4 bits, unos 3 GB). No hay datos publicados sobre arquitectura interna, numero de parametros del backbone mas alla de la denominacion 0.8B, composicion del dataset ni proceso de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone declarado: `Qwen/Qwen3.5-0.8B-Base`; cabeza de punteros para puntuar opciones) |
| Parametros totales | 0.8B (modelo base por defecto); variante de escalado 4B (Kev-4B, cuantizada a 4 bits) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (Kev-4B oficial), MLX 4 bits (`AbstractFramework/kev-4b-mlx-4bit`), 8 bits (mencionada pero descartada por thrashing de swap) |
| Idiomas soportados | no disponible |
| Licencia | MIT para el repositorio; stack Kev Apache-2.0; pesos sujetos a sus propias licencias (no detalladas) |
| Formato de pesos | no disponible de forma explicita; el stack usa MLX en Darwin y torch como fallback |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente. Lo que si describe es el mecanismo de inferencia: una unica pasada de prefill sobre el `state` y las preguntas, y una cabeza de punteros que devuelve probabilidades por opcion en lugar de generar tokens. Esto implica que el coste por consulta es de una sola pasada (sin decodificacion autoregresiva), lo que explica la latencia declarada de unos 50 ms para entradas claras en el modelo 0.8B sobre MLX.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion. El unico dato de entrenamiento indirecto es el backbone declarado (`Qwen/Qwen3.5-0.8B-Base`), cuyas caracteristicas no se detallan en la informacion disponible. La "innovacion" practica del proyecto es de ingenieria: cascada 0.8B -> 4B en 4 bits para caber en 16 GB, y paridad de esquema con la API de Jev.

## Capacidades

- Clasificacion por eleccion multiple (`choice`): devuelve distribucion de probabilidad sobre criterios nombrados.
- Puntuacion ordinal (`score`): asigna probabilidad a niveles definidos por el usuario (por ejemplo, grado de frustracion).
- Preguntas booleanas (`noul`): devuelve una probabilidad unica para una afirmacion.
- Salida de confianza calibrada por pregunta, pensada para umbralizar en codigo cliente.
- Sin generacion de texto conversacional: no es un modelo de chat.
- Sin soporte de vision, imagenes ni "Box" en esta configuracion (solo primitivas de texto).
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso.
- Multilingue: no disponible.
- Modo cascada opcional: escalado automatico de casos inciertos a Kev-4B en 4 bits.

## Casos de uso

- Enrutado de tickets de soporte: se envia el texto del ticket como `state` y una pregunta `choice` con departamentos (billing, technical, sales); el codigo umbraliza la confianza y deriva. El ejemplo del repositorio muestra `technical` con 0.9782 de confianza y probabilidades 0.0099 / 0.9854 / 0.0046.
- Deteccion de urgencia: pregunta `noul` sobre si el mensaje transmite urgencia o sensibilidad temporal (ejemplo real: 0.6999), util para priorizar colas de atencion.
- Triaje de severidad: pregunta `score` con niveles ("calmado", "frustrado pero civil", "muy enfadado") para escalar a supervision humana.
- Prototipado offline de integraciones Jev: validar esquemas, formatos de respuesta y formulas de confianza antes de contratar el servicio alojado, sin coste de API.
- Clasificacion por lotes en local: procesar grandes volumenes de textos cortos en un Mac mini M4 sin enviar datos a terceros, relevante por privacidad.
- Enrutado en pipelines internos: decidir categoria o prioridad de eventos (alertas, formularios, correos) con latencia de decenas de milisegundos y umbral de confianza configurable.
- Evaluacion comparativa de umbrales: usar las probabilidades devueltas para calibrar politicas de escalado antes de migrar a un modelo mayor o al servicio hospedado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico es la referencia cualitativa del autor: las model cards de Kev situan a Jev cerca de Decision Index ~54, y la variante 0.8B queda "mucho mas baja", sin cifra concreta.

| Metrica | Valor |
|---|---|
| Decision Index (Jev propietario, referencia) | ~54 (segun cards de Kev) |
| Decision Index (Kev-0.8B) | no disponible (el autor indica que es muy inferior) |
| Latencia caso claro (0.8B, MLX, Mac mini M4) | ~50 ms |
| Backend medido | `mlx` / `mps` |

## Requisitos de hardware

- Memoria: 16 GB de memoria unificada en Apple Silicon como objetivo declarado; el bf16 oficial de Kev-4B requiere unos 32 GB.
- Cascada por defecto: Kev-0.8B mas Kev-4B en MLX 4 bits (~3 GB) conviven en 16 GB. La variante 8 bits en doble carga provoco thrashing de swap en las pruebas del autor.
- Plataforma: macOS arm64, Python 3.13, `uv`. Backend MLX automatico en Darwin.
- Fallback: `KEV_BACKEND=torch --device cpu` si MLX falla; el autor advierte de no saltar a 4B/9B sin cuantizar si hay OOM.
- GPU dedicadas (A100, H100, RTX 4090): no documentadas ni validadas en la informacion disponible.
- Despliegue: servidor propio del stack Kev (`python -m kev.serve`) en `127.0.0.1:8008`; autenticacion bearer opcional via `KEV_API_KEY`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible; solo se cita latencia de ~50 ms para entradas claras en el modelo 0.8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevCommunity (este repo) | 0.8B (+4B en cascada) | no disponible | Decisiones tipadas locales sobre Apple Silicon | MIT (repo) | Hugging Face, 0 descargas |
| TypeSafe Jev (hospedado) | no disponible | no disponible | Decisiones tipadas, API alojada | propietaria | Servicio comercial |
| Kev-0.8B (`jaredpalmer/kev-0.8b`) | 0.8B | no disponible | Decisiones tipadas, stack abierto | Apache-2.0 (stack) | Hugging Face |
| Kev-4B (`AbstractFramework/kev-4b-mlx-4bit`) | 4B | no disponible | Decisiones tipadas, cuantizado MLX | no disponible | Hugging Face |

## Limitaciones y advertencias

- La calidad es la de Kev-0.8B, no la de Jev: el autor lo declara explicitamente; no usar como sustituto de produccion del servicio hospedado.
- Solo primitivas de texto (`choice`, `score`, `noul`); sin imagenes ni capacidades multimodales.
- Sin generacion de texto: no sirve como chatbot ni para redaccion.
- Sin datos publicados de sesgos, alucinacion, idiomas ni contexto maximo; evaluar empiricamente antes de produccion.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo dia: madurez y mantenimiento no verificables.
- No afiliado a TypeSafe AI; la compatibilidad es de API, esquema y formulas de confianza, no de precision.
- Licencia de los pesos subyacentes no detallada en la informacion disponible; verificar antes de uso comercial.
- El autor advierte contra la doble carga en 8 bits en 16 GB por thrashing de swap; usar 4 bits para la cascada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/remix3030303/jevcommunity
- Stack Kev (Jared Palmer): https://github.com/jaredpalmer/kev
- Pesos por defecto: `jaredpalmer/kev-0.8b@v1.0` (Hugging Face)
- Pesos de escalado: `AbstractFramework/kev-4b-mlx-4bit` (Hugging Face)
- Backbone declarado: `Qwen/Qwen3.5-0.8B-Base` (Hugging Face)
- Patrocinio del autor: https://github.com/sponsors/syrex1013
- Guia y cliente de ejemplo: `GUIDE.md` y `example_single.py` dentro del repositorio
