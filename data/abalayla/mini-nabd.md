# abalayla/mini-nabd

## Resumen

Mini-NABD es un modelo conversacional en formato GGUF publicado por el usuario abalayla, diseñado para mantener conversaciones informales en arabe egipcio (masri) con un tono cercano, coloquial y respuestas cortas. No es un modelo entrenado desde cero: es una cuantizacion Q4_K_M de Qwen/Qwen2.5-1.5B-Instruct, con 1.777.088.000 parametros (aproximadamente 1,78 mil millones) y un peso en disco de unos 1,0 GB. Se distribuye como complemento rapido y local del proyecto principal NABD AI, no como sustituto.

La relevancia del lanzamiento esta en su enfoque de despliegue: funciona exclusivamente en CPU, requiere del orden de 2 GB de RAM y arranca en segundos, lo que permite ejecutarlo en portatiles modestos o dispositivos sin GPU. La model card es inusualmente explicita sobre el estado del artefacto: la version v0 publica el modelo base sin modificar los pesos, y la personalidad egipcia se consigue unicamente mediante un system prompt documentado en el repositorio. La version v1 prevista consistira en un ajuste LoRA de rango 16 sobre 60 pares escritos a mano en dialecto egipcio, entrenado en una Colab T4 y fusionado despues en el mismo fichero Q4_K_M.

El proyecto se publica bajo licencia Apache-2.0, con el repositorio creado el 22 de septiembre de 2026 y cero descargas registradas en el momento de redactar esta ficha. La model card documenta tambien los huecos medidos sobre el modelo base sin ajustar (bucles en arabizi y rechazos con registro de arabe estandar ante jerga ligera), que son precisamente los que la v1 pretende corregir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct); sin detalles de capas, atencion o normalizacion en la model card |
| Parametros totales | 1.777.088.000 (aproximadamente 1,78 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens recomendados en la model card (ventana nativa del modelo base no especificada en la informacion disponible) |
| Tipos de cuantizacion | Q4_K_M unicamente; se publica un solo fichero, sin zoo de variantes |
| Idiomas soportados | Arabe (declarado como `ar`, con enfasis en dialecto egipcio/masri); el autor advierte de filtraciones de arabe estandar (MSA) en temas tecnicos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`mini-nabd-q4_k_m.gguf`, aproximadamente 1,0 GB) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (cuantizado) |
| Tamano del repositorio | 1,1 GB |
| Pipeline | text-generation |
| Compatibilidad de endpoints | Etiquetado como `endpoints_compatible`; expone API compatible con OpenAI mediante llama.cpp server |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,78 mil millones de parametros. El artefacto publicado es una conversion a GGUF con cuantizacion Q4_K_M pensada para inferencia en CPU mediante llama.cpp. La model card no documenta detalles adicionales de la arquitectura del modelo base (numero de capas, dimensiones, mecanismo de atencion ni funcion de activacion), por lo que esos datos quedan como no disponibles en la informacion proporcionada.

En cuanto al entrenamiento, la version v0 no incorpora ningun ajuste sobre el modelo base: los pesos son los de Qwen2.5-1.5B-Instruct sin cambios y el comportamiento dialectal se obtiene exclusivamente del system prompt incluido en `SYSTEM.md`, que instruye al modelo a responder como un interlocutor egipcio con respuestas breves. La hoja de ruta de la v1 describe un LoRA de rango 16 sobre 60 pares conversacionales escritos a mano (saludos, jerga, arabizi, humor y rechazos ante peticiones de informacion en vivo), entrenado en una GPU T4 de Google Colab, con fusion posterior y exportacion a Q4_K_M que reemplazaria al fichero actual. El enrutamiento de herramientas se mantiene deliberadamente fuera de los pesos, de modo que el modelo final no contendra tokens de tool calling. No se detalla el volumen de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto conversacional en arabe egipcio coloquial, con registro informal y respuestas deliberadamente cortas (configuracion sugerida: temperatura 0,7 y maximo de aproximadamente 256 tokens).
- Charla trivial (small talk) y explicaciones simples; el propio autor delimita el modelo a este tipo de tareas.
- Servido mediante API compatible con OpenAI a traves de llama.cpp server, con lo que se integra en clientes y frameworks que esperan ese contrato.
- Integracion con un enrutador externo (`providers/router`) que decide cuando se necesita busqueda web y delega en el modelo principal NABD cuando la consulta excede las capacidades del modelo pequeno.
- Integracion documentada con Tavily para informacion en vivo: el contexto recuperado se inyecta en el system prompt, manteniendo la clave de API en el lado del servidor.
- Ejecucion en CPU sin GPU, con arranque en segundos y velocidades del orden de 15 a 40 tokens por segundo en un portatil convencional.
- Capacidad potencial como base para ajuste fino dialectal (LoRA sobre pares en arabe egipcio), segun la hoja de ruta del autor.
- No soporta tool calling nativo, razonamiento complejo, generacion de codigo extensa ni vision; esas tareas se derivan al modelo principal.

## Casos de uso

- Atencion al cliente informal en dialecto egipcio: el modelo puede gestionar intercambios breves de chat en masri con una ventana de 2048 tokens, suficiente para conversaciones de soporte de ida y vuelta, y desplegarse en el mismo servidor que el backend sin coste de GPU.
- Asistente de mensajeria en dispositivos sin GPU: al requerir unos 2 GB de RAM y ejecutarse con llama.cpp, es viable en portatiles de gama baja, mini-PC o entornos de desarrollo sin acelerador, con velocidades de 15 a 40 tokens por segundo.
- Enrutador de bajo coste en una arquitectura multi-modelo: el ejemplo de la model card muestra un patron en el que `needsSearch` decide si se consulta Tavily y el modelo pequeno redacta la respuesta final, reservando el modelo principal para consultas complejas y reduciendo el coste por peticion.
- Prototipado rapido de interfaces conversacionales en arabe: al exponer un endpoint compatible con OpenAI en el puerto 11435, permite conectar frontends y SDKs existentes sin adaptadores personalizados durante las fases de prueba.
- Respuestas cortas para bots de redes sociales o canales de difusion: la configuracion recomendada (temperatura 0,7, maximo 256 tokens) encaja con formatos que exigen mensajes concisos y con personalidad informal.
- Generacion de datos sinteticos y aumento de corpus dialectal: puede emplearse para producir borradores de conversaciones en arabe egipcio que despues se revisan y se usan como material de partida en el ajuste de modelos mayores.
- Base para experimentos de ajuste dialectal con LoRA: la hoja de ruta v1 (rango 16, 60 pares, T4, fusion y exportacion Q4_K_M) sirve como receta reproducible para equipos que quieran replicar el proceso con sus propios datos.
- Servidor de referencia para pruebas de integracion: util para validar pipelines de inferencia GGUF, medicion de latencia y comportamiento de la API antes de migrar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de arabe o dialecto egipcio. El unico dato de rendimiento declarado es la velocidad de inferencia en CPU, estimada en aproximadamente 15 a 40 tokens por segundo en un portatil convencional, con la advertencia de que las cifras medidas se documentan en las notas de version de cada compilacion.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el despliegue documentado es en CPU.
- Memoria RAM: aproximadamente 2 GB para el fichero Q4_K_M, con un entorno de 4 GB de RAM como objetivo declarado (la model card indica que 2048 tokens de contexto caben con holgura en 4 GB).
- Espacio en disco: aproximadamente 1,0 GB para el fichero GGUF; 1,1 GB para el repositorio completo.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) podria ejecutarlo por sobrada capacidad, pero no aporta valor frente al despliegue en CPU.
- Compatibilidad con GPU consumer: si, irrelevante en la practica por el tamano; el caso de uso declarado es portatil o servidor sin acelerador.
- Opciones de despliegue: llama.cpp (`llama-server`, con API compatible con OpenAI en el puerto 11435), llama-cpp-python (`Llama("mini-nabd-q4_k_m.gguf", n_ctx=2048)`) y, al ser GGUF, cualquier runtime compatible con este formato, como Ollama. No se documenta soporte especifico para vLLM ni TGI (requieren normalmente GPU y no aportan ventaja a este tamano).
- Latencia y throughput: arranque en segundos; aproximadamente 15 a 40 tokens por segundo en CPU de portatil, con cifras exactas pendientes de publicacion en las notas de version.
- Configuracion recomendada de generacion: temperatura 0,7 y un maximo de aproximadamente 256 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| abalayla/mini-nabd | 1,78 mil millones | 2048 recomendados | GGUF Q4_K_M | Apache-2.0 | HuggingFace, 0 descargas | Cuantizacion del base sin ajuste adicional en v0; personalidad via system prompt |
| Qwen/Qwen2.5-1.5B-Instruct | 1,78 mil millones | No especificado en la informacion disponible | safetensors (upstream) | Apache-2.0 | Repositorio oficial del modelo base | Mismo peso subyacente sin cuantizar; no incorpora el tono dialectal egipcio |
| Otros modelos pequenos de chat en arabe o dialectal | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion proporcionada |

La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente enlaces de inicio de sesion de Gmail sin relacion con el modelo), por lo que no es posible completar la comparativa con datos verificados de otros modelos de la misma categoria.

## Limitaciones y advertencias

- La v0 no ha sido entrenada: los pesos son los de Qwen2.5-1.5B-Instruct sin modificar. Todo el comportamiento dialectal procede del system prompt y puede perderse o degradarse si no se aplica exactamente.
- El autor documenta fallos medidos sobre el modelo base: bucles en arabizi y rechazos con registro de arabe estandar (MSA) ante jerga ligera. Estos problemas estan pendientes de correccion en la v1.
- Alcance limitado a charla trivial y explicaciones simples; el razonamiento complejo, el codigo extenso y las tareas de vision deben derivarse al modelo principal.
- Fecha de corte de conocimiento heredada del modelo base; los hechos en vivo requieren busqueda externa (Tavily) a traves del enrutador.
- El dialecto egipcio es una capa de estilo sobre el arabe del modelo base: en temas tecnicos se filtran formas de arabe estandar.
- Riesgo de alucinacion inherente a un modelo de 1,78 mil millones de parametros, especialmente en preguntas factuales; no se han publicado evaluaciones de fidelidad.
- Ventana de contexto efectiva recomendada de solo 2048 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- No incluye tool calling ni function calling nativo: el enrutamiento de herramientas se implementa fuera de los pesos.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo hereda las condiciones del ecosistema Qwen2.5 y llama.cpp; conviene revisar la licencia del modelo base antes de un despliegue en produccion.
- Estado del proyecto muy temprano: cero descargas, cero likes y una unica publicacion en septiembre de 2026, sin historial de mantenimiento.
- Las cifras de latencia y throughput son estimaciones de la model card; las mediciones concretas se remiten a las notas de version, que no estan incluidas en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abalayla/mini-nabd
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Tavily: https://tavily.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los unicos resultados obtenidos fueron enlaces de inicio de sesion de Gmail sin relacion con el modelo.
