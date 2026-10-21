# peonist-ai/halogen-npu-qwen3.5-2b

## Resumen

halogen-npu-qwen3.5-2b es una conversión del modelo Qwen3.5-2B de Alibaba Qwen para ejecutarse exclusivamente sobre la NPU Ryzen AI (arquitectura XDNA2) de los procesadores AMD Strix Halo. No se distribuye como un modelo al uso: el repositorio contiene un programa de NPU de 75 MB, los pesos convertidos en formato `.hnpw` (3,6 GB, 4 bits para generación) y el tokenizador (13 MB), todo ello empaquetado para el servidor halogen-flash-server del mismo autor.

El problema que resuelve es de despliegue: permite servir un modelo de lenguaje de 2B en la NPU integrada mientras la GPU del mismo equipo atiende al modelo Flash, compartiendo puerto y exponiendo una API compatible con `/v1/chat/completions`. El caso de uso declarado por el autor es el de tareas cortas de texto (resúmenes y trabajos similares) con el modo de razonamiento desactivado y un límite de 16.384 tokens de prompt.

Es relevante ahora por dos motivos: por un lado, ejemplifica el patrón de inferencia heterogénea (NPU + GPU en el mismo equipo) sobre hardware de consumo; por otro, advierte de que estos ficheros no cargan en transformers ni en ningún otro runtime, lo que lo convierte en un artefacto ligado a un contenedor concreto y no en un checkpoint portable. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (solo páginas sin relación con el proyecto).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe en la model card; no hay detalles de la arquitectura del modelo base en la información proporcionada) |
| Parámetros totales | 2B (según la denominación del modelo base Qwen3.5-2B; no se detalla en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 16.384 tokens de prompt |
| Tipos de cuantización | 4 bits para generación (única variante publicada, en formato `.hnpw`) |
| Idiomas soportados | no disponible (la model card no los enumera y los metadatos del Hub indican "no disponibles") |
| Licencia | Apache-2.0 (la misma que el modelo de origen) |
| Formato de pesos | `.hnpw` (formato propietario del runtime halogen para NPU); no se publican safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-2B, revisión `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Relación con el base | quantized (conversión, no fine-tuning) |
| Tamaño del repositorio | 7,5 GB |
| Runtime requerido | halogen-flash-server (0.18.12 o superior para los ficheros de la cabeza del repo; 0.16.2 o superior como mínimo documentado) |
| Hardware objetivo | NPU Ryzen AI (XDNA2) de AMD Strix Halo |
| Pipeline | text-generation (con `inference: false`; el widget está desactivado a propósito) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base ni sobre su entrenamiento en la documentación proporcionada: la model card de esta conversión no describe capas, tipo de atención, composición del dataset, número de tokens ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se detalla el proceso de cuantización más allá de que los pesos se convierten "para la NPU" y se almacenan en 4 bits para generación.

Lo que sí se documenta es la innovación de despliegue: el paquete incluye un programa de NPU compilado (`devices/`, 75 MB) específico para este modelo, que se ejecuta dentro del contenedor halogen-flash-server junto al modelo Flash que corre en la GPU, detrás del mismo puerto. El servidor descarga los ficheros a `/models/npu/qwen3.5-2b/`, verifica tamaño y checksum de cada uno antes de arrancar y sirve las peticiones que nombran `qwen3.5-2b`. El host necesita el driver de NPU, XRT con su plugin de NPU y mantener el reloj de fabric de la GPU mientras la NPU trabaja en paralelo. Cada versión del servidor descarga la revisión con la que se publicó, de modo que una versión antigua sigue funcionando sin cambios.

## Capacidades

- Generación de texto en modo chat a través de `/v1/chat/completions`, con el modo de razonamiento (thinking) desactivado de forma deliberada.
- Resúmenes y tareas cortas de texto: es el uso explícito que declara el autor para este modelo.
- Procesamiento de prompts de hasta 16.384 tokens, lo que permite resumir documentos de longitud media sin troceado.
- Coexistencia con el modelo Flash en la GPU: la NPU atiende peticiones mientras la GPU sigue con su carga, compartiendo el mismo puerto de servicio.
- Ejecución local en hardware de consumo Strix Halo, sin depender de GPU dedicada para esta carga.
- Solo texto: no se documentan capacidades de visión, audio ni multimodalidad.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Comportamiento agéntico o razonamiento multi-paso: no disponible; el thinking está desactivado por diseño.
- Capacidades multilingües: no disponible (no se enumeran idiomas).

## Casos de uso

- Resumen de correos y hilos de conversación: con 16.384 tokens de prompt puede recibir un hilo completo y devolver un resumen corto, descargando la GPU para el modelo Flash.
- Resumen de documentación técnica o actas de reunión en un equipo local: el modelo cabe en la NPU y evita enviar el texto a un servicio externo, lo que simplifica el cumplimiento de privacidad.
- Preprocesado en pipelines RAG: generar resúmenes de chunks o reformular consultas antes de pasarlas a un modelo mayor servido en la GPU, aprovechando que ambos comparten puerto y API.
- Clasificación y etiquetado de texto por lotes: tareas de etiquetado corto que no requieren razonamiento explícito, ejecutadas en la NPU mientras la GPU queda libre para inferencias más costosas.
- Asistente de redacción breve en estaciones de trabajo Strix Halo: respuestas de chat y reescritura de párrafos con latencia local y sin coste por token en la nube.
- Servicio de texto auxiliar en entornos sin GPU dedicada: al ejecutarse en la NPU integrada, permite ofrecer un endpoint compatible con OpenAI en equipos que de otro modo no podrían servir un modelo de lenguaje.
- Pruebas de integración de la propia pila halogen: validar el flujo de descarga, verificación de checksum y enrutado de peticiones por nombre de modelo antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con el modelo. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- NPU Ryzen AI con arquitectura XDNA2 (AMD Strix Halo). No es un modelo ejecutable en CPU ni en GPU convencional mediante este paquete.
- Memoria ocupada por los pesos: 3,6 GB en formato `.hnpw` a 4 bits, más 75 MB del programa de NPU y 13 MB del tokenizador.
- Requisitos de host: driver de NPU de AMD, XRT con el plugin de NPU, y el reloj de fabric de la GPU retenido mientras la NPU opera junto a la GPU.
- No cabe ni se puede desplegar en GPU de consumo (RTX 4090, etc.) ni en A100/H100: los ficheros solo cargan en la NPU dentro del contenedor halogen-flash-server.
- Despliegue: contenedor halogen-flash-server 0.18.12 o superior (0.16.2 documentado como mínimo), con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=qwen3.5-2b`.
- Opciones descartadas: vLLM, llama.cpp, Ollama y TGI no pueden cargar estos pesos; el autor lo indica explícitamente ("no cargarán en transformers ni en ningún otro runtime").
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 7,5 GB, y el servidor descarga los ficheros en `/models/npu/qwen3.5-2b/` verificando tamaño y checksum.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| halogen-npu-qwen3.5-2b | 2B (según denominación del base) | 16.384 tokens de prompt | `.hnpw` (4 bits) | NPU Ryzen AI XDNA2 (Strix Halo), vía halogen-flash-server | Apache-2.0 | 0 descargas, 0 likes; requiere contenedor específico |
| Qwen3.5-2B (original) | 2B (según denominación) | no disponible | safetensors (formato estándar del Hub) | GPU/CPU con transformers y runtimes habituales | Apache-2.0 | Modelo de referencia del que se deriva esta conversión |
| Otras conversiones para NPU de AMD | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

La comparación relevante es con el modelo base: esta conversión no añade capacidades nuevas, sino que restringe el hardware y el runtime a cambio de ejecutar en la NPU y liberar la GPU. Cualquier evaluación de calidad debería hacerse contra Qwen3.5-2B, teniendo en cuenta la pérdida asociada a la cuantización a 4 bits. No hay datos públicos para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Portabilidad nula: los ficheros solo cargan en la NPU dentro de halogen-flash-server; no funcionan en transformers, llama.cpp, Ollama, vLLM ni TGI. El widget de HuggingFace está desactivado a propósito.
- Dependencia de versión: los ficheros de la cabeza del repositorio exigen halogen-flash-server 0.18.12 o superior; una versión antigua descarga la revisión con la que se publicó, no la actual.
- Dependencia de hardware y driver: requiere NPU XDNA2 (Strix Halo), driver de NPU, XRT con plugin de NPU y retención del reloj de fabric de la GPU. Un fallo en cualquiera de estos elementos impide el servicio.
- Solo texto y sin modo thinking: no hay visión, audio ni razonamiento explícito; las tareas que dependan de cadena de pensamiento no están cubiertas por diseño.
- Límite de contexto: el prompt máximo es de 16.384 tokens; no se documenta soporte para entradas mayores ni estrategias de extensión.
- Cuantización a 4 bits: es la única variante publicada, por lo que no se puede recuperar precisión con una versión de 8 o 16 bits desde este repositorio.
- Idiomas no documentados: se desconoce el comportamiento fuera de los idiomas del modelo base, y la model card no los enumera.
- Sin datos de evaluación: no hay benchmarks, ni mediciones de latencia o throughput, ni información sobre sesgos o tasa de alucinación. No hay validación independiente (0 descargas, 0 likes).
- Licencia: Apache-2.0 permite uso comercial, pero `devices/NOTICE.md` recoge avisos de terceros del programa de NPU que conviene revisar antes de redistribuir.
- Fuente única: la model card remite a Discord para preguntas y al repositorio del servidor para errores; no hay paper ni documentación técnica del proceso de conversión.
- La búsqueda web realizada no aportó información adicional verificable sobre el modelo; todos los resultados obtenidos eran ajenos al proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-qwen3.5-2b
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del modelo base utilizada: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentación de despliegue en NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Discord del proyecto: https://discord.gg/bcm6QknaV6
- Avisos de terceros del programa de NPU: `devices/NOTICE.md` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
