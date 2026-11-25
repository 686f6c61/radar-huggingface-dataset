# ggml-org/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B-GGUF es la version cuantizada en formato GGUF del modelo Qwen3-ASR-1.7B, un sistema de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen de Alibaba. La conversion y publicacion del repositorio GGUF corre a cargo de ggml-org, el mismo colectivo que mantiene llama.cpp, lo que garantiza compatibilidad directa con el ecosistema de inferencia local de referencia. El modelo base cuenta con 2.031.739.904 parametros (aproximadamente 2,03 mil millones) y esta publicado bajo licencia Apache 2.0.

El modelo resuelve dos tareas principales en una sola pasada: identificacion del idioma del audio y transcripcion del mismo. Cubre 30 idiomas y 22 dialectos chinos, lo que lo convierte en una opcion especialmente interesante para entornos multilingues donde otros sistemas ASR requieren seleccionar manualmente el idioma antes de transcribir. El modelo emite primero una etiqueta de idioma detectado y despues el texto transcrito, un diseno que simplifica el enrutamiento posterior en pipelines de produccion.

Su relevancia actual radica en que permite ejecutar un ASR de calidad directamente en hardware de consumo mediante llama.cpp, sin depender de APIs en la nube ni de infraestructura con GPU dedicada. El repositorio GGUF acumula mas de 59.000 descargas, lo que refleja una adopcion amplia por parte de la comunidad de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo ASR basado en Qwen3, detalles completos no disponibles) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-1.7B mas alla de que deriva de la familia Qwen3 y esta orientado a reconocimiento automatico del habla. El dato de parametros reales (2.031.739.904) procede de los safetensors del modelo original. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de audio ni si se aplicaron tecnicas de RLHF o DPO durante el ajuste.

Una innovacion destacable, y poco habitual en ASR, es que el modelo realiza identificacion de idioma implicitamente: genera primero una etiqueta (`language English`, por ejemplo) y despues la transcripcion. La plantilla de chat coloca la parte del idioma dentro del bloque de razonamiento (thinking), de modo que el contenido del mensaje final contiene unicamente la transcripcion, lo que simplifica el postprocesado. Esta conversion GGUF requiere una build de llama.cpp que incluya el PR 32571 del repositorio ggml-org/llama.cpp.

## Capacidades

- Reconocimiento automatico del habla con transcripcion de audio a texto.
- Identificacion automatica del idioma del audio en la misma pasada de inferencia.
- Cobertura de 30 idiomas, incluyendo los principales idiomas internacionales.
- Cobertura de 22 dialectos chinos, un nicho que muchos ASR genericos no abordan.
- Separacion limpia entre metadato de idioma (bloque thinking) y transcripcion (contenido), lo que facilita el parseo en pipelines.
- Compatible con endpoints y despliegue via llama.cpp y la aplicacion Llama.
- Capacidad conversacional declarada en los tags del repositorio (pipeline conversational).
- No se dispone de informacion sobre tool calling, function calling ni capacidades de agente multi-paso para este modelo.

## Casos de uso

- Transcripcion de reuniones multilingues: el modelo detecta automaticamente el idioma de cada intervencion y transcribe, evitando que el usuario tenga que configurar el idioma manualmente antes de cada reunion.
- Subtitulado de contenido audiovisual con dialectos chinos: la cobertura de 22 dialectos chinos lo hace adecuado para produccion de subtitulos en medios regionales donde los ASR genericos fallan.
- Dictado local en escritorio: ejecutable via llama.cpp en portatiles con GPU consumer, permite dictado sin enviar audio a servicios en la nube, algo relevante por privacidad.
- Enrutamiento de llamadas de atencion al cliente: la etiqueta de idioma detectada permite dirigir la llamada al agente o cola adecuada antes de procesar la transcripcion.
- Generacion de actas y notas de voz: integrable en aplicaciones de notas que transcriben grabaciones localmente en dispositivos con recursos limitados.
- Indexacion de audio para busqueda: transcripciones generadas en lote para alimentar motores de busqueda sobre archivos de audio y video, con deteccion de idioma por documento.
- Prototipado rapido de pipelines ASR: al estar en GGUF y ser compatible con `llama serve`, permite levantar un endpoint ASR en minutos para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,03 mil millones de parametros, las cuantizaciones GGUF tipicas (Q4_K_M, Q5_K_M, Q8_0) ocuparian aproximadamente entre 1,3 y 2,5 GB de memoria, dependiendo de la variante concreta incluida en el repositorio. No se dispone del desglose exacto por archivo.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM deberia poder ejecutar las cuantizaciones mas agresivas. Para Q8_0 o precision superior, se recomienda 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). En entornos profesionales, A100 o H100 no son necesarias para este tamano, pero permitirian mayor concurrencia.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer con 4 GB o mas de VRAM, segun la cuantizacion.
- Opciones de despliegue: llama.cpp (build con el PR 32571), `llama serve -hf ggml-org/Qwen3-ASR-1.7B-GGUF`, aplicacion Llama (https://llama.app). No se confirma compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-GGUF (este) | 2,03 mil millones | no disponible | 30 idiomas + 22 dialectos chinos | Apache 2.0 | GGUF |
| Whisper large-v3 | no disponible en esta ficha | no disponible | ~99 idiomas | MIT (modelo OpenAI) | safetensors, GGUF via terceros |
| Whisper small | no disponible en esta ficha | no disponible | ~99 idiomas | MIT | safetensors, GGUF via terceros |

No se dispone de datos de benchmarks comparativos que permitan contrastar calidad de transcripcion frente a Whisper u otros ASR. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos conocidos del modelo base; se recomienda evaluar con muestras representativas antes de desplegar en produccion.
- Todo modelo ASR presenta riesgo de alucinacion en audio con ruido, musica de fondo o habla solapada; no se han publicado tasas de error concretas.
- La longitud de contexto de audio no esta especificada, lo que impide planificar con precision la duracion maxima de los segmentos a transcribir.
- La lista de 30 idiomas concretos no esta disponible en la informacion proporcionada; solo se confirma la cifra y la cobertura de 22 dialectos chinos.
- Requiere una build especifica de llama.cpp (PR 32571); builds anteriores pueden no cargar correctamente el modelo o no interpretar el bloque de razonamiento del idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original Qwen/Qwen3-ASR-1.7B por si existen terminos adicionales.
- El repositorio ocupa 14,5 GB, lo que sugiere la presencia de multiples variantes de cuantizacion; conviene seleccionar el archivo adecuado al hardware disponible en lugar de descargar el repo completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Aplicacion Llama: https://llama.app
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/32571
- Herramienta de conversion: https://github.com/ggml-org/convert
