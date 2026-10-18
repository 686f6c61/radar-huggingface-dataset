# Elevatormusic/DeepSeek-V4.1-Flash-1017-2x-DGX-Spark-TensorFold-2x-Faster

## Resumen

Este repositorio no contiene pesos: es una *recipe card* (receta de despliegue) publicada por el usuario Elevatormusic para ejecutar el modelo DeepSeek V4.1 Flash (variante 1017) cuantizado en EXL3 a 2,9 bits por peso sobre dos equipos NVIDIA DGX Spark (GB10) conectados por un cable QSFP entre sus puertos ConnectX-7. La receta combina el motor ExLlamaV3 con un esquema de paralelismo de tensores entre las dos máquinas al que el autor llama TensorFold, y sirve el modelo a través de una API compatible con OpenAI en el puerto 8888.

El interés práctico está en el rendimiento medido: según el autor, duplica la velocidad del kit estándar basado en vLLM sobre el mismo hardware (56,8 frente a 27,0 tokens/s en texto; 92,2 frente a 39,9 tokens/s en código) y reduce de 80,4 a 35,9 segundos la localización de un dato en un documento de 64.000 tokens. Añade soporte de tool calling, salida estructurada conforme a esquema JSON, caché de prefijo para conversaciones largas y un modo de razonamiento configurable mediante `reasoning_effort`.

El modelo base declara una ventana de contexto de hasta 1 millón de tokens y licencia Apache 2.0. No se especifican en la información disponible el número de parámetros, la arquitectura interna ni los idiomas soportados del modelo original; la receta tampoco publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K), solo métricas de velocidad y latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek V4.1 Flash 1017; la receta no describe la arquitectura interna) |
| Parametros totales | no disponible (los ficheros cuantizados ocupan 385 GB a 2,9 bpw, lo que situa el orden de magnitud en ~10^12 parametros; cifra no confirmada por el autor) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | 1.000.000 tokens (según la model card de la receta) |
| Tipos de cuantizacion | EXL3 a 2,9 bits por peso (43 ficheros); no se ofrecen otras precisiones en esta receta |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3) en repositorios separados; este repositorio no aloja pesos. Tablas Engram en los ficheros 47 y 48 del repo base |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base (transformer denso, MoE o híbrido), ni el volumen o composición de los datos de entrenamiento, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí documenta la receta es la capa de despliegue: los pesos se cargan en formato EXL3 (ExLlamaV3) a 2,9 bpw, repartidos en paralelo de tensores entre dos DGX Spark mediante TensorFold, con las tablas Engram tomadas de los ficheros 47 y 48 del repositorio oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017`. El autor advierte explícitamente de que las tablas Engram de la release 1017 son nuevas y no deben mezclarse con las de la release anterior de V4.1 Flash.

Entre las innovaciones operativas que documenta la receta están la caché de prefijo (la segunda pregunta sobre un documento largo arranca en torno a 1 segundo en lugar de 13, y unos 3 segundos tras reiniciar el servidor), el aislamiento de fallos por petición (una petición mal formada no tumba el servidor), el modo de pensamiento desactivable por defecto y los niveles de `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`). La receta también señala una limitación pendiente de diagnosticar: con 32.000 tokens o más, la lectura de texto es un 30-37 % más lenta que las cifras publicadas por bertholomus, y la causa no se conoce.

## Capacidades

- Generación de texto conversacional y de código, con velocidades medidas de 56,8 tokens/s en texto y 92,2 tokens/s en código sobre dos DGX Spark.
- Tool calling / function calling: el modelo puede invocar herramientas cuando se le indica, según la model card.
- Salida estructurada: respuestas en formato exacto, por ejemplo JSON que cumple un esquema definido por el usuario.
- Modo de razonamiento (thinking) configurable mediante `reasoning_effort` o `chat_template_kwargs.enable_thinking`; desactivado por defecto.
- Contexto largo: hasta 1 millón de tokens por conversación, con caché de prefijo para reutilizar documentos ya procesados.
- Concurrencia: hasta 4 peticiones simultáneas compartiendo los dos equipos, con ~140 tokens/s agregados en código.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`), lo que permite conectarlo a cualquier cliente que hable ese protocolo.
- Capacidades multimodales, de audio o multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes con tool calling en entorno on-premise: al exponer una API compatible con OpenAI y soportar function calling, el modelo puede conectarse a frameworks de agentes existentes sin adaptadores, manteniendo los datos dentro de la red local de los dos DGX Spark.
- Extracción de datos con salida estructurada: pipelines de documentos (facturas, informes, contratos) en los que se exige un JSON que valide contra un esquema, aprovechando la garantía de formato declarada por la receta.
- Análisis de documentación extensa: con 1 millón de tokens de contexto y caché de prefijo, un mismo informe técnico o expediente puede consultarse repetidamente con arranque de respuesta en torno a 1 segundo a partir de la segunda pregunta.
- Asistente de código en producción: los 92,2 tokens/s en generación de código permiten integrarlo en un IDE o en un pipeline de revisión, con hasta 4 desarrolladores concurrentes alcanzando ~140 tokens/s agregados.
- Atención al cliente multi-turno: conversaciones con historial largo en las que el contexto se reutiliza vía caché de prefijo, evitando reprocesar el histórico en cada turno.
- Despliegue en entornos sin conectividad o con requisitos de soberanía del dato: dos equipos de sobremesa con ~100 GB de memoria libre cada uno bastan para servir el modelo, sin depender de APIs externas.
- Procesamiento por lotes tolerante a fallos: el aislamiento por petición permite dejar correr colas de trabajo donde una consulta mal formada no detiene el servicio.
- Búsqueda de información dentro de corpus largos: la receta reporta 35,9 segundos para localizar un dato en un documento de 64.000 tokens, adecuado para preguntas puntuales sobre bases documentales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de velocidad y latencia, medidas según el autor el 17 de octubre de 2026 sobre un mismo par de DGX Spark, con los mismos ficheros de modelo y las mismas preguntas:

| Metrica | Setup estandar (kit vLLM) | Esta receta | Mejora |
|---|---:|---:|---|
| Velocidad de escritura, texto (tokens/s) | 27,0 | 56,8 | 2,1x |
| Velocidad de escritura, codigo (tokens/s) | 39,9 | 92,2 | 2,3x |
| Localizar un dato en un documento de 64.000 tokens (s) | 80,4 | 35,9 | 2,2x |
| Concurrencia medida | 1 peticion a la vez (no se probo mas) | 4 peticiones, ~140 tokens/s en codigo | no comparable |

| Metrica de latencia | Valor |
|---|---|
| Primera pregunta larga tras arrancar el servidor | ~6 s adicionales (solo la primera) |
| Segunda pregunta sobre el mismo documento largo | ~1 s hasta el inicio de la respuesta (frente a 13 s sin caché) |
| Igual, tras reiniciar el servidor | ~3 s |
| Arranque del servidor | ~15 min la primera vez; 2-4 min en arranques posteriores |

## Requisitos de hardware

- VRAM/memoria: no es VRAM discreta, sino memoria unificada. La receta pide unos 100 GB de memoria libre en cada uno de los dos DGX Spark, es decir, ~200 GB agregados.
- GPU recomendadas: exclusivamente dos NVIDIA DGX Spark (GB10), unidas por un cable QSFP entre sus puertos ConnectX-7. No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: no aplica; el requisito es hardware DGX Spark, no tarjetas de consumo.
- Disco: unos 500 GB libres en cada equipo (385 GB de ficheros de modelo más 110 GB adicionales en el primer arranque).
- Red: direcciones fijas en el enlace por cable y acceso ssh desde el equipo "head" al "worker"; la receta de GitHub incluye una guía de red.
- Opciones de despliegue: ExLlamaV3 con TensorFold y paralelismo de tensores entre dos máquinas, empaquetado en Docker (`docker/build.sh`), servido con API compatible con OpenAI en `http://127.0.0.1:8888/v1`. No se contempla vLLM, llama.cpp, Ollama ni TGI en esta receta.
- Throughput y latencia estimados: 56,8 tokens/s en texto, 92,2 tokens/s en código, ~140 tokens/s agregados con 4 peticiones concurrentes; 35,9 s para una pregunta de recuperación sobre 64.000 tokens.
- Nota: la receta indica que la descarga inicial ronda los 400 GB y que en un enlace rápido tarda varias horas.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada. La comparación posible es entre las distintas formas de servir este mismo modelo:

| Opcion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta receta (EXL3 2,9 bpw + TensorFold, 2x DGX Spark) | no disponible | 1.000.000 tokens | 56,8 tokens/s texto; 92,2 tokens/s código; 4 peticiones concurrentes | Apache 2.0 | Repo de receta público; pesos en repos separados |
| Kit estándar vLLM sobre el mismo hardware | no disponible | no disponible en la informacion | 27,0 tokens/s texto; 39,9 tokens/s código; solo 1 petición a la vez | Apache 2.0 (modelo base) | Referenciado como base de comparación |
| Pesos EXL3 2,9 bpw de LibertAIDAI | no disponible | no disponible en la informacion | no disponible (solo se especifica la cuantizacion) | Apache 2.0 (heredada del base) | Público en HuggingFace, version `afc7aa0a` |
| Modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` | no disponible | no disponible en la informacion | no disponible | Apache 2.0 | Público en HuggingFace, version `1bae0e10` |

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es solo una receta. Requiere descargar ~400 GB desde dos repositorios externos y fijar las versiones indicadas (`afc7aa0a` y `1bae0e10`).
- Las tablas Engram de la release 1017 son distintas de las de V4.1 Flash anteriores; mezclarlas produce un comportamiento incorrecto.
- No hay benchmarks de calidad publicados: se desconoce la degradación real introducida por la cuantización a 2,9 bpw frente al modelo sin cuantizar.
- El autor reconoce que con 32.000 tokens o más la lectura de texto es un 30-37 % más lenta que las cifras publicadas por bertholomus, sin causa identificada.
- Los números de concurrencia (4 peticiones, ~140 tokens/s) no tienen comparación con vLLM, porque el setup estándar solo se probó con una petición a la vez.
- La primera pregunta larga tras arrancar el servidor tarda unos 6 segundos más; el arranque inicial ronda los 15 minutos.
- La función Living Weights de TensorFold no está disponible en esta configuración: solo funciona con otro modelo y en un único equipo.
- Dependencia fuerte de hardware muy concreto (dos DGX Spark y enlace QSFP); no se documenta portabilidad a otras GPU.
- El modelo se sirve con ExLlamaV3, no con vLLM, lo que limita el ecosistema de herramientas disponibles.
- Riesgo de alucinación, sesgos conocidos y calidad por idioma: no documentados en la información disponible; deben evaluarse antes de usar el modelo en producción.
- Licencia Apache 2.0 declarada tanto en la receta como en el modelo base, lo que en principio permite uso comercial; conviene verificar igualmente los términos de los repositorios de pesos de terceros (LibertAIDAI).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la receta no cuenta con validación de la comunidad.
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes (los resultados tratan de calderas de lecho fluidizado, tarjetas de memoria y otros temas sin relación).

## Enlaces

- Repositorio de la receta en HuggingFace: https://huggingface.co/Elevatormusic/DeepSeek-V4.1-Flash-1017-2x-DGX-Spark-TensorFold-2x-Faster
- Receta en GitHub: https://github.com/Elevatormusic/DeepSeek-V4.1-Flash-1017-EXL3-TensorFold-2x-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (version `1bae0e10`, ficheros 47 y 48 para las tablas Engram)
- Pesos EXL3 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw (version `afc7aa0a`)
- Autor de la base del motor citado en los créditos: https://github.com/bertholomus
- Búsqueda web: sin enlaces relevantes para este modelo.
