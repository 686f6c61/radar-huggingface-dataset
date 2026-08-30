# CMSManhattan/JiRackDeltaNet_27b

## Resumen

JiRack DeltaNet 27B es un modelo de lenguaje de 27.320 millones de parametros desarrollado por CMSManhattan (Konstantin V Grabko, Center Business Solutions inc). El modelo parte de una arquitectura estilo Qwen 3.8 y la migra a una arquitectura DeltaNet hibrida (atencion + SSM) con pesos ternarios obtenidos mediante entrenamiento consciente de la cuantizacion (QAT). El resultado es un modelo optimizado para inferencia en CPU con cuantizaciones GGUF listas para usar en llama.cpp y Ollama.

La principal innovacion es su tokenizador ampliado, JiRackDeltaNetTokenizer, que incorpora etiquetas especiales para routing, media, vision, sonido, tool calling y robotica. Segun el autor, esto permite al modelo procesar video e imagenes, lo que lo hace adecuado para aplicaciones de robotica, aunque estas afirmaciones no estan respaldadas por benchmarks publicados. Se publico en agosto de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones en HuggingFace.

El modelo se distribuye bajo licencia MIT, pero el autor establece un modelo de suscripcion opcional de 1 dolar al mes por usuario (uso personal) o 3 dolares al mes por usuario (uso empresarial). La model card indica que el modelo funciona sin suscripcion, aunque envia un aviso sobre la suscripcion durante la ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet hibrida (atencion + SSM) estilo Qwen 3.8 |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | TQ_2 (ternaria), Q2_K, Q3_K_M, Q4_K_M, FP16 |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT (con suscripcion opcional de pago) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura estilo Qwen 3.8 y la convierte en una arquitectura DeltaNet, que combina mecanismos de atencion tradicionales con capas de espacio de estados (SSM). Esta hibridacion reduce el coste computacional de la atencion cuadratica al tiempo que mantiene la capacidad de modelar dependencias de largo alcance.

Los pesos se entrenan mediante cuantizacion consciente (QAT): durante el entrenamiento, los pesos aprenden a vivir en formato ternario (-1, 0, 1) mientras se almacenan en FP16. Tras el entrenamiento, un script los convierte a pesos ternarios reales. El modelo puede exportarse a ONNX para produccion o a GGUF para llama.cpp y Ollama. El entrenamiento utiliza el tokenizador JiRackDeltaNetTokenizer, que anade etiquetas especiales para tool calling, routing, robotica y multimedia.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en 13 idiomas: ingles, chino, japones, coreano, frances, espanol, portugues, aleman, italiano, ruso, arabe, vietnamita y tailandes.
- Tool calling / function calling mediante etiquetas especiales del tokenizador JiRack, con ejemplos de integracion en Spring Boot (Java) y GoEx (Python).
- Routing de tareas mediante etiquetas de tokenizador especificas, util en sistemas multiagente.
- Supuesto soporte de vision, video e imagen para robotica, segun las afirmaciones del autor (no verificado con benchmarks).
- Modo de razonamiento disponible, desactivado por defecto para respuestas directas y rapidas.
- Inferencia eficiente en CPU gracias a pesos ternarios y cuantizaciones GGUF.
- Soporte nativo en Ollama con la variante `cmsmanhattan/JiRackDeltaNet_27b-q4-reasoning`, con posibilidad de desactivar el razonamiento en runtime mediante `--think=false`.

## Casos de uso

- Despliegue de asistentes conversacionales en CPU en entornos con recursos limitados: con la cuantizacion Q4_K_M (~16,8 GB) se puede ejecutar en servidores sin GPU, reduciendo el coste de infraestructura en la nube.
- Integracion de tool calling en aplicaciones empresariales Java: el autor proporciona ejemplos con Spring Boot AI (spring-ai-alibaba) para que el modelo invoque funciones externas en pipelines de backend.
- Agentes de robotica con instrucciones multimodales: el tokenizador incluye etiquetas de robotica y el modelo afirma procesar video e imagenes, aunque esta capacidad requiere validacion adicional antes de usarla en produccion.
- RAG con modelo experto de dominio: el autor sugiere usarlo como modelo experto en despliegues RAG, con un servidor ONNX Java como alternativa de inferencia.
- Asistente local privado: con las cuantizaciones Q2 o Q3 (~11-14 GB), cabe en equipos de sobremesa y portatiles con 16-32 GB de RAM para uso personal sin conexion.
- Clasificacion y routing de consultas: las etiquetas de routing del tokenizador permiten dirigir peticiones a distintos modulos o especialistas dentro de un sistema multiagente.
- Generacion de codigo asistida en entornos sin GPU: el modelo puede emplearse en pipelines de CI/CD para revision de codigo o generacion de documentacion tecnica en maquinas CPU-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar el rendimiento del modelo con alternativas similares.

## Requisitos de hardware

- Inferencia optimizada para CPU mediante llama.cpp y Ollama.
- Variante FP16 (full precision): ~55 GB de almacenamiento, requiere 56-64 GB de RAM.
- Variante Q4_K_M: ~16,8 GB de almacenamiento, requiere 18-24 GB de RAM. Es la recomendada por el autor como equilibrio entre calidad y consumo.
- Variante Q3_K_M: ~13,9 GB de almacenamiento, requiere 15-20 GB de RAM.
- Variante Q2_K: ~11,2 GB de almacenamiento, requiere 12-17 GB de RAM. Compresion maxima.
- No requiere GPU dedicada; puede ejecutarse en CPU con 16 hilos (THREADS=16) segun las configuraciones Docker proporcionadas.
- Opciones de despliegue: Docker (imagenes oficiales con interfaz web en el puerto 7869), Ollama, llama.cpp y ONNX con servidor Java.
- El autor recomienda 32 GB de RAM para la variante Q4 en entornos Docker con multiples servicios.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| JiRack DeltaNet 27B | 27,3 B | DeltaNet hibrida (atencion + SSM) | No disponible | MIT + suscripcion | TQ_2, Q2/Q3/Q4 GGUF |
| Qwen3-30B-A3B | 30,5 B (3,3 B activos) | MoE transformer | 128K tokens | Apache 2.0 | GGUF, AWQ, GPTQ |
| DeepSeek-R1-Distill-Qwen-32B | 32,8 B | Transformer denso | 128K tokens | MIT | GGUF, AWQ |

Nota: los datos de los modelos comparados corresponden a sus fichas publicas oficiales. No se dispone de benchmarks comparativos entre JiRack DeltaNet 27B y estas alternativas.

## Limitaciones y advertencias

- Modelo reciente (agosto de 2026) sin descargas ni validacion de la comunidad: no hay evidencia independiente de su funcionamiento.
- Las afirmaciones sobre capacidades de vision, video y robotica no estan respaldadas por benchmarks publicados ni demos verificables.
- No se han publicado datos de entrenamiento, volumen de tokens ni tecnicas de alineacion, lo que impide evaluar su calidad y sesgos.
- La licencia MIT coexiste con un modelo de suscripcion de pago (1-3 dolares al mes por usuario), lo que genera ambiguedad legal sobre los terminos de uso comercial.
- El autor indica que el modelo funciona sin suscripcion pero "envia un mensaje sobre la suscripcion", lo que sugiere un aviso en runtime que puede interferir en despliegues automatizados.
- Riesgo de alucinacion no evaluado: sin benchmarks, no hay datos sobre su fiabilidad factual.
- Longitud de contexto no documentada: se desconoce el limite real de la ventana de atencion.
- El nombre "Qwen 3.8" sugiere una base sobre modelos Qwen, pero no se especifica la version exacta ni la relacion con el proyecto Qwen original.
- Repositorio de 108,5 GB que contiene multiples cuantizaciones; la descarga completa puede ser innecesaria si solo se necesita una variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Tokenizador JiRack: https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- Perfil de Ollama: https://ollama.com/cmsmanhattan
- Perfil en Docker Hub: https://hub.docker.com/u/cmsmanhattan
- Repositorio de proyectos AI en Bitbucket: https://bitbucket.org/cmsmanhattan/workspace/projects/AI
- Articulo en LinkedIn sobre JiRack Fable 27B: https://www.linkedin.com/pulse/free-jirack-fable-27b-ternary-intelligence-local-private-grabko-nwvrc/
- Ejemplo de tool calling en Java (Spring Boot AI): https://github.com/alibaba/spring-ai-alibaba
- Ejemplo de tool calling en Python (GoEx): https://github.com/ShishirPatil/gorilla
- Dataset ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo de referencia para function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
