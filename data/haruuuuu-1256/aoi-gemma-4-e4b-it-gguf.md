# haruuuuu-1256/aoi-gemma-4-E4B-it-GGUF

## Resumen

aoi-gemma-4-E4B-it-GGUF es la version cuantizada en formato GGUF del modelo aoi-gemma-4-E4B-it, un ajuste fino orientado a roleplay y conversacion con personaje sobre una base de la familia Gemma 4 (variante E4B). Lo publica el usuario haruuuuu-1256 y esta pensado para su uso con llama.cpp, incluyendo soporte de entrada de imagen mediante un proyector multimodal separado (mmproj). El modelo base declara 7.518.069.290 parametros reales en safetensors y una licencia Apache-2.0.

Su relevancia practica esta en que empaqueta el modelo en dos cuantizaciones listas para produccion local: Q4_K_M (5,34 GB) y BF16 (15,05 GB), ademas del proyector de vision F16 (0,99 GB). El autor documenta una evaluacion de estabilidad de personaje sobre 10 preguntas propensas a romper el rol, repetidas 16 veces con temperatura 0,7, con 0 roturas en 160 generaciones para la version Q4_K_M.

El modelo esta orientado al idioma japones y a conversacion con personaje, con el modo de razonamiento (thinking) desactivado de forma permanente mediante la plantilla de chat embebida, ya que el autor indica que el modelo no fue entrenado con conversaciones con thinking y este degrada la personalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, variante E4B; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 7.518.069.290 (dato real en safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits), BF16 (sin cuantizar) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (mas proyector multimodal mmproj en F16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma 4 en la variante E4B, ni especifica el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. El modelo es un ajuste fino con orientacion a roleplay y personaje ("aoi"), derivado de haruuuuu-1256/aoi-gemma-4-E4B-it, que a su vez se apoya en una base Gemma 4.

El artefacto publicado es una conversion a GGUF realizada con llama.cpp en el commit c746810, que incorpora soporte para Gemma 4. La innovacion tecnica documentada por el autor es la desactivacion permanente del modo de razonamiento mediante la plantilla de chat embebida: llama-server activa el thinking por defecto en Gemma 4, pero el modelo no fue entrenado con conversaciones con thinking y su activacion degrada la coherencia del personaje. El paquete incluye un proyector multimodal independiente para entrada de imagen, lo que permite usar el modelo como image-text-to-text cuando se carga junto con el mmproj.

## Capacidades

- Generacion de texto conversacional en japones con una persona de personaje definida ("aoi").
- Entrada de imagen (image-text-to-text) cuando se carga el proyector mmproj-aoi-gemma-4-E4B-it-F16.gguf.
- Conversacion multi-turno orientada a roleplay y character chat.
- Estabilidad de personaje documentada: 0 roturas en 160 generaciones sobre 10 preguntas adversarias con temperatura 0,7 en Q4_K_M.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Inferencia local via llama.cpp con plantilla de chat Jinja (--jinja) y thinking desactivado por defecto.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Roleplay y character chat en japones: el modelo esta ajustado especificamente para mantener una persona consistente en conversaciones multi-turno, con una metrica de estabilidad de personaje publicada (0/160 roturas en Q4_K_M), lo que lo hace adecuado para aplicaciones de entretenimiento conversacional.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M de 5,34 GB permite ejecutar el modelo en GPU consumer y en CPU mediante llama.cpp, sin necesidad de infraestructura en la nube.
- Asistente conversacional con entrada de imagen: cargando el mmproj F16 junto con los pesos, el modelo puede recibir imagenes y responder en japones, util para prototipos de asistencia visual conversacional.
- Integracion en pipelines llama.cpp existentes: el formato GGUF y la plantilla Jinja embebida permiten servirlo con llama-server y exponerlo como endpoint compatible con clientes OpenAI-style (tag endpoints_compatible).
- Evaluacion y experimentacion con ajustes de personaje: investigadores que estudien la estabilidad de persona en modelos pequenos pueden usar la evaluacion documentada (10 preguntas x 16 repeticiones) como referencia metodologica.
- Prototipado de agentes de personaje para comunidades japonesas: al estar orientado al japones y a character chat, sirve para bots de comunidades, juegos de rol por texto o demos interactivas en ese idioma.
- Base para cuantizaciones adicionales: al publicarse BF16 y Q4_K_M, el repositorio sirve como punto de partida para generar otras cuantizaciones (Q5, Q8) segun los requisitos de memoria del despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una prueba de estabilidad de personaje:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Roturas de personaje | 10 preguntas x 16 repeticiones, temperatura 0,7, Q4_K_M | 0/160 |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 5,34 GB solo para los pesos; anadir memoria para el contexto KV y, si se usa vision, unos 0,99 GB adicionales del mmproj F16.
- VRAM estimada para BF16: aproximadamente 15,05 GB para los pesos, mas contexto KV y mmproj opcional.
- GPU recomendadas: no especificadas por el autor. Por tamano, la version Q4_K_M es apta para GPU consumer con 8 GB o mas de VRAM; la BF16 requiere GPU de 16-24 GB (por ejemplo, RTX 4090 o A100/H100 para despliegues de mayor concurrencia).
- Cabe en GPU consumer: si, la cuantizacion Q4_K_M en tarjetas de 8 GB o superiores; tambien es viable en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server con --jinja y --mmproj para vision). No se documenta soporte de vLLL, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (roleplay en japones sobre base Gemma 4 o de tamano similar) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de clase 4B: el autor advierte que puede cometer errores en conocimiento detallado, coherente con su tamano.
- El modo de razonamiento (thinking) debe permanecer desactivado; activarlo degrada la personalidad porque el modelo no fue entrenado con conversaciones con thinking.
- Idioma limitado al japones (ja); no se documenta soporte multilingue.
- Riesgo de alucinacion inherente a modelos de este tamano; no se han publicado tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Requiere una version de llama.cpp con soporte de Gemma 4 (conversion realizada en el commit c746810); versiones anteriores pueden no cargar el modelo correctamente.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo base y sus derivados deben verificarse contra las condiciones de la familia Gemma 4 subyacente antes de un despliegue en produccion.
- Repositorio de 62,2 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Sin likes ni validacion externa de la comunidad en el momento de la consulta (0 likes, 1869 descargas).

## Enlaces

- Repositorio GGUF: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it-GGUF
- Modelo base (ajuste fino): https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- llama.cpp (requerido, commit c746810): no disponible como enlace en la informacion proporcionada
