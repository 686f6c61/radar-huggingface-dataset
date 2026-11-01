# oscarwest1/LFM3-1.7B-Q6_K-GGUF

## Resumen

LFM3-1.7B es un modelo de lenguaje compacto desarrollado por Liquid AI, disenado para inferencia local y en el borde (edge). Este repositorio concreto, publicado por el usuario oscarwest1, no es un modelo nuevo ni un ajuste fino: es una redistribucion del archivo GGUF Q6_K oficial de Liquid AI, sin modificaciones adicionales en pesos, cuantizacion ni entrenamiento. Su interes radica en ofrecer el modelo base en un formato listo para llama.cpp y Ollama, con un peso de repositorio de 1,4 GB.

El modelo emplea una arquitectura propietaria denominada LFM3 tri-hybrid, que combina capas de convolucion corta con compuertas (gated short-convolution), capas de atencion de ventana deslizante y capas de atencion global, repartidas en 24 capas. Con 1.728.801.600 parametros totales y una ventana de contexto declarada de 256.000 tokens, apunta a tareas de conversacion, agentes ligeros y llamadas a funciones en entornos con recursos limitados.

La relevancia de esta ficha esta en documentar con rigor que se esta distribuyendo: un artefacto cuantizado a Q6_K que hereda las capacidades y limitaciones del modelo original de Liquid AI, bajo la LFM Open License v1.0, y que no ha sido evaluado de forma independiente por el redistribuidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (convolucion corta con compuertas + atencion de ventana deslizante + atencion global) |
| Parametros totales | 1.728.801.600 (1,73 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256.000 tokens (capacidad declarada; el contexto usable depende de la configuracion en tiempo de ejecucion) |
| Tipos de cuantizacion | Q6_K (este repositorio); otras cuantizaciones en el repositorio GGUF oficial de Liquid AI |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (Q6_K) |
| Capas totales | 24 (13 de convolucion corta con compuertas, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Tamano del vocabulario | 128.000 tokens |
| Modalidad | Texto |
| Modelo base | LiquidAI/LFM3-1.7B |
| Redistribuidor | oscarwest1 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura LFM3 tri-hybrid sustituye el patron clasico de atencion densa por una mezcla de tres tipos de capa en un total de 24: 13 capas de convolucion corta con compuertas, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Este diseno busca reducir el coste computacional y de memoria de la atencion a contextos largos, manteniendo un numero reducido de capas de atencion global para la propagacion de informacion a larga distancia. El vocabulario es de 128.000 tokens.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de post-entrenamiento. La model card del redistribuidor solo indica que el modelo esta "post-entrenado" por Liquid AI y que este repositorio no anade ajuste fino, cuantizacion ni modificacion de pesos respecto al GGUF oficial. Tampoco se documentan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluido el espanol.
- Llamada a funciones y herramientas (tool calling / function calling), con soporte para integrarse en frameworks de agentes externos.
- Salidas estructuradas: JSON y otros formatos estructurados.
- Extraccion de informacion estructurada a partir de texto.
- Clasificacion de texto.
- Procesamiento de lenguaje en dispositivo (on-device) y en el borde.
- Aplicaciones con recuperacion aumentada (RAG) gracias a la ventana de contexto declarada de 256.000 tokens.
- Conversacion multi-turno en local mediante llama.cpp u Ollama.
- No se documentan capacidades de vision, audio ni un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local: el modelo puede mantener dialogos multi-turno en un portatil o equipo de sobremesa sin GPU dedicada, cargando el GGUF Q6_K con Ollama o llama.cpp y usando los parametros de muestreo recomendados (temperatura 0,1, top-k 50, repeat penalty 1,1).
- Agente ligero con llamada a herramientas: integrado en un framework de agentes externo, el modelo puede decidir que funcion invocar y emitir los argumentos en JSON, lo que encaja en automatizaciones de bajo coste donde no se requiere razonamiento multi-paso complejo.
- Extraccion de datos estructurados: procesar correos, tickets o formularios y devolver campos en JSON, aprovechando su soporte de salidas estructuradas y su bajo coste de inferencia.
- Clasificacion de texto a escala: etiquetar grandes volumenes de documentos en local, sin enviar datos a servicios externos, con latencia baja por el tamano reducido del modelo.
- RAG en el borde: indexar y consultar documentacion interna con la ventana de contexto declarada de 256.000 tokens, siempre que la memoria del runtime lo permita (en llama-server el ejemplo de la model card usa `-c 8192`).
- Asistente multilingue en dispositivo: atender usuarios en espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco desde una aplicacion local.
- Prototipado rapido de pipelines de IA: validar flujos de agente, tool calling y salidas JSON antes de migrar a un modelo mayor, gracias a su reducido peso de 1,4 GB y a la compatibilidad con la API de OpenAI de llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del redistribuidor indica explicitamente que este artefacto no ha sido evaluado de forma independiente por oscarwest1.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa aproximadamente 1,4 GB; con overhead de contexto y runtime, se puede operar comodamente en torno a 2-3 GB de memoria, dependiendo de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/oscarwest1/LFM3-1.7B-Q6_K-GGUF:Q6_K`). Se requiere una version reciente de ambos runtimes con soporte para LFM3.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B (este repositorio, Q6_K) | 1,73 B | 256K (declarado) | LFM Open License v1.0 | GGUF | Arquitectura tri-hybrid; tool calling; 16 idiomas |
| Modelos comparables de ~1-2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la informacion proporcionada, por lo que no es posible ofrecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Puede generar informacion inexacta o fabricada; conviene validar las salidas en aplicaciones de alto riesgo.
- El tamano reducido (1,73 B) limita el razonamiento complejo y las tareas de codificacion agentica exigente; la propia model card lo desaconseja para esos usos.
- La ejecucion de herramientas requiere un framework de agente externo; el modelo no ejecuta acciones por si mismo.
- El contexto de 256.000 tokens es una capacidad declarada: el contexto usable real depende de la configuracion del runtime y de la memoria disponible (el ejemplo de llama-server en la model card usa 8192 tokens).
- La cuantizacion Q6_K puede introducir diferencias numericas respecto a los pesos originales en mayor precision.
- Este repositorio es una redistribucion no oficial; no ha sido evaluado de forma independiente por su publicador.
- La LFM Open License v1.0 es una licencia "other": antes de un uso comercial es necesario revisar sus terminos de uso, atribucion y redistribucion en el enlace oficial de la licencia.
- No se documentan sesgos especificos del modelo en la informacion disponible.
- El rendimiento depende en gran medida de la complejidad de la tarea y del prompting; los parametros de muestreo recomendados son puntos de partida, no configuraciones optimas garantizadas.

## Enlaces

- Repositorio de esta redistribucion: https://huggingface.co/oscarwest1/LFM3-1.7B-Q6_K-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
