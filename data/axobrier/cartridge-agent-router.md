# Axobrier/cartridge-agent-router

## Resumen

Axobrier Cartridge: Agent Router (identificador `Axobrier/cartridge-agent-router`) es una "cartucho de decisión" compilado, no un modelo generativo al uso. Se trata de un clasificador de enrutamiento que recibe un vector de embedding de 768 dimensiones y devuelve una de ocho etiquetas de intención (ejecución de código, sistema de ficheros, búsqueda web, consulta a base de datos, control de versiones, ejecución de tests, comunicación al usuario o escalado al LLM). Su función es actuar como puerta de reflejos (reflex gate) sub-milisegundo dentro de un agente, decidiendo qué herramienta invocar o cuándo delegar en un modelo de razonamiento más costoso.

Está desarrollado por el autor Axobrier y se distribuye en el formato binario propietario `.axb` v1, pensado para ejecutarse localmente mediante el motor de decisión C99/CUDA del propio autor o un runtime de Python, con dependencia cero de APIs en la nube. La matriz de pesos completa ocupa menos de 64 KB, por lo que reside de forma permanente en la caché L2 del procesador o de la GPU. Esto lo aleja radicalmente del perfil de un transformer: es un componente de infraestructura de agentes, no un generador de texto.

Su relevancia actual radica en el coste computacional del enrutamiento en sistemas agénticos: en lugar de consumir tokens de un LLM para decidir qué herramienta usar, este cartucho resuelve la decisión en aproximadamente 40 µs sobre una NVIDIA RTX 4090 y por debajo de 1,2 ms sobre CPU x86_64 con AVX2. La calibración de probabilidades mediante escalado de temperatura (T = 2.0832) permite aplicar umbrales de confianza fiables para disparar el fallback al LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de enrutamiento calibrado sobre embeddings congelados de 768 dimensiones; no es un transformer generativo |
| Parametros totales | No disponible de forma explicita; la matriz de pesos ocupa menos de 64 KB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (consume un unico vector de embedding por decision, no secuencias de tokens) |
| Tipos de cuantizacion | No disponible; se distribuye como binario compilado `.axb` v1 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Axobrier Binary Cartridge (`.axb` v1) |

## Arquitectura y entrenamiento

La informacion disponible describe un cartucho binario compilado que opera sobre embeddings de 768 dimensiones, compatibles con extractores como `all-mpnet-base-v2` o `nomic-embed-text`. El modelo expone 8 clases de enrutamiento y aplica una calibracion multi-clase tipo Platt / Guo (escalado por temperatura, con T = 2.0832) sobre las puntuaciones crudas. La funcion de perdida objetivo es la regla de puntuacion cuadratica de Brier (Brier, 1950), lo que indica un diseno orientado a obtener probabilidades bien calibradas en lugar de maximizar solo la exactitud de clasificacion.

No se especifica en la informacion proporcionada ni la arquitectura interna exacta (si es un clasificador lineal, una regresion logistica multinomial o una red superficial), ni el numero de parametros, ni los datos de entrenamiento (tokens, composicion del dataset, presencia de RLHF/DPO). Tampoco se documenta si se emplea decodificacion especulativa ni tecnicas de atencion, dado que no genera texto. La innovacion tecnica declarada es su naturaleza compilada y su huella minima (menos de 64 KB, residente en cache L2) con latencias de decenas de microsegundos.

## Capacidades

- Clasificacion de intencion de enrutamiento en 8 clases: `CODE_EXECUTION`, `FILE_SYSTEM`, `WEB_SEARCH`, `DATABASE_QUERY`, `GIT_VCS`, `TEST_RUNNER`, `COMMUNICATION` y `ESCALATE_LLM`.
- Salida de probabilidad calibrada por clase (`decision.confidence`), apta para aplicar umbrales de confianza.
- Puerta de reflejos (reflex gating): si la clase predicha es `ESCALATE_LLM` o la confianza cae por debajo de 0.80, el sistema deriva al LLM de razonamiento complejo.
- Inferencia local sin llamadas a API en la nube, con dependencia cero de servicios externos.
- Medicion de latencia por decision expuesta en el propio objeto de salida (`decision.latency_us`).
- No genera texto, no razona, no ejecuta codigo, no tiene vision ni audio y no soporta tool calling por si mismo: unicamente decide a que herramienta o modelo derivar.

## Casos de uso

- Enrutamiento de herramientas en agentes de codigo: dado el embedding de la instruccion del usuario, el cartucho decide si invocar ejecucion de comandos, sistema de ficheros o control de versiones, evitando gastar tokens del LLM en la decision de enrutamiento.
- Reduccion de coste por token en pipelines agenticos: al resolver la mayoria de decisiones en microsegundos y con menos de 64 KB de memoria, se elimina la necesidad de una llamada al LLM solo para clasificar la intencion.
- Gating de fallback a razonamiento profundo: la clase `ESCALATE_LLM` permite derivar al modelo System 2 unicamente los casos complejos, usando la confianza calibrada como criterio objetivo.
- Automatizacion de CI/CD y ejecucion de tests: el cartucho distingue entre `TEST_RUNNER` y `CODE_EXECUTION`, lo que permite disparar suites de validacion o linters desde un agente ligero.
- Enrutamiento de consultas analiticas: la clase `DATABASE_QUERY` permite separar peticiones estructuradas SQL de busquedas web (`WEB_SEARCH`), dirigiendo cada una a la herramienta adecuada.
- Sistemas de notificacion y ticketing: la clase `COMMUNICATION` habilita que un agente decida cuando notificar al usuario o abrir una incidencia, sin consumir un LLM para esa determinacion.
- Despliegue en el borde (edge) o en entornos air-gapped: al ejecutarse en CPU x86_64 con AVX2 por debajo de 1,2 ms, puede integrarse en servidores sin GPU y sin conectividad externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados son de latencia y huella: aproximadamente 40 µs por inferencia sobre NVIDIA RTX 4090 y menos de 1,2 ms sobre CPU x86_64 AVX2, con una matriz de pesos residente en cache L2 de menos de 64 KB.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el peso total ocupa menos de 64 KB y cabe en cache L2, no requiere memoria dedicada de GPU.
- GPU recomendadas: el autor reporta ~40 µs sobre NVIDIA RTX 4090; una GPU de gama alta acelera la inferencia, pero no es imprescindible.
- CPU: funciona sobre x86_64 con AVX2 por debajo de 1,2 ms por decision.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo moderna es suficiente; de hecho el requisito es tan bajo que la CPU puede bastar.
- Opciones de despliegue: runtime de Python (`axobrier`) o el motor de decision Axobrier C99/CUDA; el fichero `.axb` se carga con `axobrier.load("agent_router.axb")`.
- Latencia y throughput: ~40 µs por decision en RTX 4090 y <1,2 ms en CPU AVX2; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axobrier Cartridge: Agent Router | Clasificador de enrutamiento sobre embeddings | Matriz de pesos <64 KB | No aplica (vector de embedding) | Apache 2.0 | HuggingFace (formato `.axb`) |
| Clasificadores de intencion basados en embeddings (por ejemplo, cabezas sobre `all-mpnet-base-v2`) | Clasificacion de intencion | Depende del cabezal; no disponible | No aplica | Variable | Variable |
| Routers semanticos tipo semantic-router | Enrutamiento de intenciones por similitud | No disponible | No disponible | Variable | Variable |
| RouteLLM u otros routers de coste | Enrutamiento entre modelos LLM | No disponible | No disponible | Variable | Variable |

Los datos concretos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse.

## Limitaciones y advertencias

- Modelo marcado unicamente para ingles (`en`); el soporte multilingue no esta confirmado.
- Es un clasificador de 8 clases cerradas: no puede enrutar a herramientas fuera de ese conjunto sin reentrenamiento.
- Depende de un extractor de embeddings compatible de 768 dimensiones; un extractor distinto puede degradar la calidad de las decisiones.
- No se documentan sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta auditorias de equidad.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificacion erronea; el propio autor propone un umbral de confianza de 0.80 para mitigarlo.
- El formato `.axb` v1 es propietario y requiere el motor Axobrier o su runtime de Python; no es un `safetensors` ni un GGUF estandar.
- Sin resultados de benchmarks publicos en la informacion disponible, el rendimiento real en produccion no puede validarse de forma independiente.
- Estado del repositorio: creado y actualizado en septiembre de 2026, con 0 descargas y 1 like, lo que indica ausencia de validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del motor Axobrier por separado.
- Al no generar texto ni razonar, no sustituye a un LLM; su valor es exclusivamente como componente de enrutamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Axobrier/cartridge-agent-router
- Repositorio del motor Axobrier: https://github.com/Axobrier/Axobrier
- Referencia de la regla de puntuacion cuadratica de Brier (Glenn Brier, 1950): no disponible como enlace en la informacion proporcionada.
