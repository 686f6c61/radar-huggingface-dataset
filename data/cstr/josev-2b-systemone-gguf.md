# cstr/Josev-2B-SystemOne-GGUF

## Resumen

Josev-2B-SystemOne-GGUF es un empaquetado GGUF en F32, preservando bytes, del checkpoint mayflowergmbh/Josev-2B, publicado por el usuario cstr para la API SystemOne de CrispEmbed. No se trata de una cuantización ni de una conversión convencional: el autor indica explícitamente que no se ha realizado aritmética de tensores ni cuantización, y que el fichero contiene backbone, cabeza conjunta (joint head) y tokenizador en un único archivo de 7.659.180.448 bytes con SHA256 `72684e39d0eed526b40c5150c78b2d881d324c39e16af48060b3d741f526ccf2`.

El modelo subyacente, Josev-2B, es un «decider» pequeño de 1.912.297.796 parámetros (1,91 B) que, según la model card de mayflowergmbh, aprendió alemán y fue entrenado sobre el dataset decisions-de, con 90 fuentes de tareas y alrededor de 19.000 casos. La familia se presenta como «System One» dentro de la oferta de TypeSafe (endpoint `POST /v1/systemone`), orientada a decisiones calibradas y respuestas tipadas más que a generación abierta de texto.

Su interés práctico ahora es acotado pero concreto: permite ejecutar el checkpoint en CPU sobre Linux x64 sin GPU, con verificación de 227 etapas originales y cuatro respuestas tipadas completas en C, Python, CLI, HTTP, Rust y Dart. El propio autor advierte de lo que no ha verificado: calidad de tarea, otras plataformas, GPU y cuantización, además de que las siete «gates» del modelo permanecen desactivadas por defecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El empaquetado incluye backbone, joint head y tokenizador; no se detalla el tipo de red |
| Parámetros totales | 1.912.297.796 (1,91 B), dato real de safetensors del modelo base |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ninguno en este repositorio: un único fichero F32 (aproximadamente 4 bytes por parámetro). El modelo base dispone de builds GGUF en mayflowergmbh/Josev-2B-GGUF y mradermacher/Josev-2B-GGUF, con niveles no detallados en la información disponible |
| Idiomas soportados | Alemán (entrenado sobre decisions-de según la model card del modelo base); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (empaquetado F32 byte-preserving, un solo fichero con backbone, joint head y tokenizador) |
| Modelo base | mayflowergmbh/Josev-2B, commit `6f0a31c8ed683aba79097eb3f48df2c9ab560afd` |
| Tamaño del fichero | 7.659.180.448 bytes (`josev2b-systemone-f32.gguf`) |
| Tamaño del repositorio | 7,7 GB |
| Autor del repositorio | cstr |
| Publicación / actualización | 2026-10-27 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Uso previsto | API SystemOne de CrispEmbed, con las siete gates del modelo desactivadas por defecto |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El autor describe el artefacto como un empaquetado que reúne «backbone, joint head y tokenizer» en un solo fichero, lo que implica una topología con cabeza conjunta sobre un tronco común, sin que se especifiquen capas, dimensiones ocultas, mecanismo de atención ni función de activación. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de RLHF o DPO ni el proceso de calibración de las decisiones.

Lo que sí está documentado es la procedencia de los datos del modelo base: entrenamiento en alemán sobre decisions-de, con 90 fuentes de tareas y aproximadamente 19.000 casos, según la model card de mayflowergmbh. La innovación técnica destacable de este repositorio no está en el modelo, sino en el empaquetado: una serialización que preserva bytes, sin aritmética de tensores ni cuantización, conservando el checkpoint upstream sin modificar y manteniendo avisos y licencia originales bajo el directorio `upstream/` (Apache-2.0, sección 4).

La verificación publicada cubre 227 etapas originales y cuatro respuestas tipadas completas en C, Python, CLI, HTTP, Rust y Dart sobre CPU Linux x64. Se citan el commit fuente `cd0ec9968ac29b05426931c8d1dccd2860f76927`, la ejecución de empaquetado 40456235976 y la ejecución de consumo 40463407332.

## Capacidades

- Toma de decisiones calibradas: el modelo base se describe como un «decider» pequeño, orientado a resolver tareas de decisión sobre el dataset decisions-de.
- Respuestas tipadas: el autor verifica cuatro respuestas completas y tipadas en C, Python, CLI, HTTP, Rust y Dart.
- Ejecución en CPU: validado en Linux x64 sin GPU.
- Empaquetado autocontenido: backbone, joint head y tokenizador en un único fichero, lo que simplifica la distribución y la comprobación de integridad.
- Integración con la API SystemOne de CrispEmbed, que selecciona el modelo mediante el campo `model` de la petición `POST /v1/systemone`.
- Ecosistema de tooling para agentes: el repositorio jev-style publica herramientas para integrar estos modelos de decisión en agentes.
- Alemán como idioma de entrenamiento del modelo base; no hay evidencia de capacidades multilingües adicionales.
- No confirmado: tool calling o function calling explícito, razonamiento multi-paso, generación abierta de texto de calidad, visión, audio o modo «thinking».

## Casos de uso

- Auditoría de artefactos y reproducibilidad: el fichero incluye SHA256, commit de origen y números de ejecución de empaquetado y consumo, de modo que un equipo puede verificar bit a bit que el modelo desplegado corresponde al checkpoint original sin recomprimir ni recuantizar.
- Enrutado y clasificación de decisiones en pipelines de agentes: el modelo base está entrenado sobre decisions-de, por lo que encaja en la capa de decisión de un agente (qué herramienta invocar, qué rama seguir) siempre que se valide la calidad en el dominio propio, ya que el autor no la ha verificado.
- Prototipado offline en estaciones de trabajo x64 sin GPU: los 7,66 GB en F32 se pueden cargar en memoria y ejecutar en CPU Linux, lo que permite probar el comportamiento del modelo en entornos air-gapped o de investigación.
- Servicio a través de la API SystemOne: al seleccionarse por el campo `model` en `POST /v1/systemone`, el artefacto puede registrarse como una variante concreta servida por el mismo endpoint que el resto de la familia.
- Base para una cadena de cuantización propia: al ser un empaquetado F32 sin pérdida, es un punto de partida razonable para generar versiones F16, Q8 o Q4 con herramientas propias, aunque el autor no verifica el resultado de la cuantización y habría que validar la calidad tras la conversión.
- Comparación controlada con otras distribuciones del mismo modelo: permite contrastar el comportamiento de este empaquetado frente a mayflowergmbh/Josev-2B-GGUF o mradermacher/Josev-2B-GGUF para aislar si las diferencias provienen del formato o del runtime.
- Docencia e investigación sobre serialización de modelos: sirve como ejemplo de empaquetado byte-preserving con tokenizador incluido y verificación cruzada en seis lenguajes de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio jev-style menciona JevBench y afirma que los números de la variante 2B son ejecuciones únicas predeclaradas sobre su build GGUF F16, con protocolos e intervalos de confianza en su model card, pero no se proporcionan cifras concretas. El autor de este repositorio declara explícitamente que la calidad de tarea no está verificada.

## Requisitos de hardware

- VRAM estimada: alrededor de 8 GB solo para los pesos en F32 (7,66 GB de fichero) más el overhead de contexto y de la cabeza conjunta; en la práctica, un entorno con 10-12 GB de VRAM es el mínimo razonable si se carga en GPU.
- GPU recomendadas: A100 (40/80 GB) y H100 sobran; RTX 4090 (24 GB) carga el modelo con holgura; RTX 3090 (24 GB) igual; tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) quedan justas y obligan a contextos cortos.
- No cabe en GPUs de 8 GB o menos en F32; para esos entornos habría que recurrir a las builds GGUF cuantizadas del modelo base, no a este fichero.
- CPU: ejecución verificada en Linux x64 (clientes en C, Python, CLI, HTTP, Rust y Dart), sin GPU.
- Opciones de despliegue: la vía documentada es la API SystemOne de CrispEmbed. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no está confirmada en la información disponible, y el hecho de que el fichero agrupe backbone, joint head y tokenizador en un solo GGUF hace que no se deba asumir que un runtime GGUF estándar lo cargue sin adaptación.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento, solo la verificación funcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| cstr/Josev-2B-SystemOne-GGUF | 1,91 B | GGUF F32 empaquetado (backbone + joint head + tokenizador) | No disponible | Apache-2.0 | Empaquetado byte-preserving para SystemOne | Repositorio con 0 descargas; verificado solo en CPU Linux x64 |
| mayflowergmbh/Josev-2B-GGUF | 1,91 B (modelo base) | GGUF para llama.cpp | No disponible | Apache-2.0 (según modelo base) | Builds GGUF estándar del modelo base | Publicado por el autor del modelo base |
| mradermacher/Josev-2B-GGUF | 1,91 B (modelo base) | GGUF, niveles de cuantización no detallados | No disponible | Apache-2.0 (según modelo base) | Conversiones GGUF de terceros | Publicado por mradermacher |
| TypeSafe Jev | No disponible | Servicio propietario | No disponible | No disponible | Modelo insignia «System One» servido vía API | Endpoint `POST /v1/systemone` |

No hay datos de benchmarks publicados en la información disponible que permitan comparar el rendimiento de este modelo con alternativas generalistas de 2B parámetros, por lo que cualquier comparación de calidad quedaría sin respaldo empírico.

## Limitaciones y advertencias

- Calidad de tarea no verificada: el autor solo valida el empaquetado y el funcionamiento del consumidor, no la corrección de las decisiones del modelo.
- Las siete gates del modelo permanecen desactivadas por defecto, lo que condiciona el comportamiento en producción hasta que se activen de forma explícita.
- Cobertura de plataformas muy limitada: verificado únicamente en Linux x64 CPU; GPU y otros sistemas operativos no están comprobados.
- Sin cuantización: 7,66 GB de fichero y ~4 bytes por parámetro, lo que excluye su uso directo en GPUs de gama baja o en entornos con almacenamiento restringido.
- Compatibilidad incierta con runtimes GGUF convencionales: el fichero agrupa backbone, joint head y tokenizador, y el autor no documenta pruebas con llama.cpp, Ollama, vLLM o TGI.
- Idioma: el modelo base aprendió alemán; no hay evidencia de rendimiento en castellano ni en otros idiomas, y la ventana de contexto es desconocida.
- Sesgos y alucinación: no se han publicado evaluaciones de sesgo ni de tasa de alucinación para este modelo en la información disponible.
- Madurez comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.
- Licencia Apache-2.0, que permite uso comercial, pero obliga a conservar los avisos del proyecto upstream incluidos bajo `upstream/` y a mantener las atribuciones del modelo base.
- Además de la licencia, conviene revisar la licencia y condiciones del modelo base mayflowergmbh/Josev-2B antes de un despliegue comercial, ya que este repositorio solo reempaqueta.

## Enlaces

- Repositorio en HuggingFace: [cstr/Josev-2B-SystemOne-GGUF](https://huggingface.co/cstr/Josev-2B-SystemOne-GGUF)
- Modelo base: [mayflowergmbh/Josev-2B](https://huggingface.co/mayflowergmbh/Josev-2B/tree/6f0a31c8ed683aba79097eb3f48df2c9ab560afd)
- GGUF del autor del modelo base: [mayflowergmbh/Josev-2B-GGUF](https://huggingface.co/mayflowergmbh/Josev-2B-GGUF)
- Conversiones GGUF de terceros: [mradermacher/Josev-2B-GGUF](https://huggingface.co/mradermacher/Josev-2B-GGUF)
- Documentación de la API SystemOne: [docs.typesafe.ai/models](https://docs.typesafe.ai/models)
- Herramientas para agentes con modelos de decisión: [lawrence3699/jev-style](https://github.com/lawrence3699/jev-style)
- Registro de terceros: [free2aitools.com/model/mradermacher/josev-2b-gguf](https://free2aitools.com/model/mradermacher/josev-2b-gguf)
