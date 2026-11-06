# NorviTech/arrmes-functiongemma-270m

## Resumen

Arrmes-FunctionGemma-270M es un ajuste fino (fine-tuning) de `google/functiongemma-270m-it`, desarrollado por NorviTech, orientado exclusivamente a enrutamiento de llamadas a funciones (function calling) dentro de un contrato de operaciones autoalojado denominado `arrmes.tools.v2`. El modelo resuelve un problema muy concreto: traducir peticiones en lenguaje natural a llamadas de herramienta estructuradas sobre un conjunto cerrado de 20 acciones que abarcan servicios de gestion multimedia y descargas (Sonarr, Radarr, Lidarr, Tautulli, qBittorrent, Seer, entre otros).

Con solo 270 millones de parametros, el modelo esta pensado para ejecutarse en dispositivos con recursos limitados (511 MB en fp16 y 176 MB en cuantizacion de 4 bits), lo que lo situa en la categoria de modelos ultracompactos para agentes locales. Su propuesta de valor no es la generacion de texto generalista, sino la precision en la seleccion de herramienta y la seguridad operativa: el autor reporta entre un 96,4 % y un 98,8 % de exactitud en llamadas de herramienta sobre suites de calificacion reservadas, con cero propuestas de escritura no seguras.

El modelo se distribuye con la libreria MLX (orientada a hardware Apple Silicon) y hereda la licencia Gemma del modelo base. Es relevante ahora porque ejemplifica una tendencia practica: especializar modelos pequenos en tareas de enrutamiento determinista y emparejarlos con una capa de verificacion externa (`verify_proposal`) para reducir el riesgo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/functiongemma-270m-it); detalles internos no disponibles |
| Parametros totales | 270 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (511 MB) y 4 bits (176 MB) reportados por el autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | Repositorio en libreria MLX; formatos de fichero concretos no disponibles (tamano del repo reportado: 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un modelo base de 270 millones de parametros especializado en function calling, y se ajusta mediante un adaptador (el quickstart referencia `adapters/functiongemma-distilled-v5`) para el contrato `arrmes.tools.v2`. La arquitectura subyacente es un transformer de la familia Gemma/FunctionGemma; no se dispone de detalles sobre numero de capas, dimensiones ocultas, mecanismos de atencion ni longitud de contexto maxima.

El entrenamiento se orienta a una tarea de enrutamiento cerrado: mapear una consulta en lenguaje natural a una de 20 acciones con argumentos, empleando el formato nativo `<start_function_call>call:name{...}<end_function_call>`. El autor menciona un proceso de destilacion (el adaptador se denomina "distilled-v5") y evaluaciones sobre suites reservadas (`Sealed Acceptance v2` y `v3`), pero no se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias mas alla del ajuste y del emparejamiento con la capa determinista de verificacion.

## Capacidades

- Enrutamiento de llamadas a funciones sobre un contrato cerrado de 20 acciones (`arrmes.tools.v2`).
- Generacion de llamadas de herramienta en formato nativo `<start_function_call>call:name{...}<end_function_call>`.
- Cobertura de servicios de gestion multimedia y descargas: Sonarr, Radarr, Lidarr, Tautulli, qBittorrent, Seer, Request Portal, Armiger, Bitmagnet y DH-Waypoint.
- Integracion con una frontera de verificacion determinista (`verify_proposal`) para validar propuestas antes de ejecutarlas.
- Ejecucion local en dispositivos con memoria limitada gracias a su tamano reducido.
- Soporte de tool calling orientado a agentes de operaciones autoalojados.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de vision, audio, razonamiento general extenso ni generacion de codigo.

## Casos de uso

- Enrutamiento de ordenes en un panel domestico autoalojado: el modelo traduce peticiones como "is anyone streaming from Plex at this moment?" a la llamada `now_playing`, permitiendo construir asistentes de consulta sobre Tautulli sin exponer el servicio a un LLM en la nube.
- Gestion de descargas automatizada: convierte instrucciones en lenguaje natural en llamadas a qBittorrent (pausar, reanudar, listar) con validacion previa mediante `verify_proposal`, lo que reduce el riesgo de acciones destructivas.
- Administracion de bibliotecas multimedia: enruta peticiones hacia Sonarr, Radarr o Lidarr para anadir series o peliculas, aprovechando la cobertura completa de las 20 acciones del contrato.
- Puerta de solicitudes de contenido: integra el modelo en el Request Portal y Seer para clasificar y dirigir peticiones de usuarios hacia el servicio adecuado.
- Agente local en dispositivos de borde: al ocupar 176 MB en 4 bits, puede desplegarse en mini-PC, Raspberry Pi o equipos Apple Silicon para tareas de enrutamiento sin conexion a internet.
- Capa de seguridad en pipelines de agentes: el modelo actua como primer filtro que propone una accion, y la capa determinista descarta escrituras no previstas (el autor reporta 0 propuestas de escritura no seguras sobre 229 y 99 casos), lo que lo hace adecuado como componente de bajo riesgo en arquitecturas con verificacion externa.
- Automatizacion de tareas de mantenimiento: consultas de estado de los servicios (Bitmagnet, DH-Waypoint, Armiger) convertidas en llamadas de solo lectura para paneles de monitorizacion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en la model card son los siguientes:

| Metrica | Resultado |
|---|---|
| Exactitud en llamadas de herramienta (suites reservadas) | 96,4 % - 98,8 % |
| Propuestas de escritura no seguras en Sealed Acceptance v3 | 0/229 (0,0 %) |
| Propuestas de escritura no seguras en Sealed Acceptance v2 | 0/99 (0,0 %) |
| Latencia p50 en caliente | 272 ms |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 511 MB en fp16 y 176 MB en cuantizacion de 4 bits, segun el autor.
- GPU recomendadas: no se especifican; la libreria MLX esta orientada a Apple Silicon (series M1 en adelante). Para otras plataformas seria necesario convertir los pesos a un runtime compatible, lo que no se documenta.
- Compatibilidad con GPU de consumo: por tamano, cabe holgadamente en cualquier GPU de consumo moderna e incluso en dispositivos de borde; no obstante, la disponibilidad en MLX limita el despliegue nativo a hardware Apple.
- Opciones de despliegue: el quickstart oficial usa el paquete `arrmes.model.LocalModel` con MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 en caliente de 272 ms reportada por el autor; no se publica throughput (tokens/s) ni latencia en frio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arrmes-FunctionGemma-270M | 270 M | No disponible | Function calling cerrado (20 acciones) | Gemma | Hugging Face (MLX) |
| google/functiongemma-270m-it (base) | 270 M | No disponible | Function calling general | Gemma | Hugging Face |
| Alternativas de enrutamiento de 1-3 B (genericas) | 1-3 B | No disponible | Function calling general | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita a tamano, enfoque y licencia.

## Limitaciones y advertencias

- El modelo esta especializado en un contrato cerrado de 20 acciones; fuera de ese dominio su utilidad es muy limitada y no debe usarse como modelo de proposito general.
- Solo soporta ingles; las consultas en otros idiomas pueden degradar la precision del enrutamiento.
- Los resultados de exactitud y seguridad (96,4 %-98,8 %, 0 escrituras no seguras) proceden de suites internas del autor y no han sido verificados de forma independiente.
- La seguridad operativa depende de la capa externa `verify_proposal`; sin ella, el modelo puede proponer acciones no deseadas, aunque el autor reporta cero escrituras no seguras en sus pruebas.
- Riesgo de alucinacion en la seleccion de herramienta o en los argumentos cuando la peticion es ambigua o queda fuera del contrato.
- No se documentan sesgos especificos, pero al derivar de un modelo base entrenado con datos web puede heredar sesgos de ese corpus.
- La licencia Gemma Terms of Use impone restricciones al uso comercial; es necesario revisar sus terminos antes de un despliegue en produccion.
- El despliegue nativo esta atado a MLX (Apple Silicon); no se documentan conversiones oficiales a GGUF u otros formatos.
- El repositorio figura con 0 descargas y 0 likes, y un tamano reportado de 0.0 GB, lo que sugiere que los pesos o adaptadores podrian no estar publicados o no ser accesibles en el momento de la consulta.
- No se dispone de informacion sobre longitud de contexto, lo que impide evaluar su comportamiento en conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/arrmes-functiongemma-270m
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- NorviTech Suite: https://norvitech.com
