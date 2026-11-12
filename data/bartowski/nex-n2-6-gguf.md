# bartowski/Nex-N2.6-GGUF

## Resumen

Nex-N2.6 es un modelo multimodal de tipo image-text-to-text desarrollado por nex-agi, distribuido bajo licencia Apache 2.0. El checkpoint original cuenta con 320.759.404.382 parametros (aproximadamente 321B), lo que lo situa en la categoria de modelos de gran escala. La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF elaborada por bartowski, un publicador habitual de cuantizaciones para llama.cpp, generada con la release b12180 de llama.cpp y con calibracion imatrix.

El modelo acepta entradas de texto e imagen (esta ultima mediante un fichero mmproj adicional) y soporta decodificacion especulativa mediante MTP (Multi-Token Prediction). El prompt format incluye un campo explicito de "Reasoning Effort" y una etiqueta `<think>`, lo que indica que el modelo incorpora un modo de razonamiento explicito. Tambien dispone de soporte de tool calling mediante un formato XML estructurado con `<tools>` y `<tool_call>`.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 321B en hardware local o en infraestructura propia mediante llama.cpp, algo impensable con los pesos originales en safetensors. El repo completo ocupa 4144,3 GB, pero las cuantizaciones de 4 bits reducen el peso a alrededor de 178-201 GB, lo que lo hace desplegable en configuraciones de multiples GPU o en servidores con gran cantidad de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal image-text-to-text; detalles no publicados en la informacion disponible) |
| Parametros totales | 320.759.404.382 (aprox. 321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp b12180, calibracion imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base nex-agi/Nex-N2.6 en la documentacion proporcionada. La model card de la cuantizacion confirma que se trata de un modelo multimodal (entrada de texto e imagen), que el checkpoint original tiene 321B parametros y que soporta decodificacion especulativa mediante MTP. El prompt format incluye etiquetas especificas (`[gMASK]<sop>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<think>`) y un campo "Reasoning Effort" configurable, lo que sugiere un entrenamiento orientado a razonamiento explicito con modos de esfuerzo ajustables.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La cuantizacion se ha realizado con llama.cpp release b12180 y calibracion imatrix, un metodo que ajusta la cuantizacion por capas usando estadisticas de activacion para preservar mejor la calidad en bits bajos.

## Capacidades

- Generacion de texto y razonamiento explicito, con modo `<think>` y campo "Reasoning Effort" configurable (por ejemplo, "Max").
- Procesamiento de imagenes como entrada (image-text-to-text) mediante el fichero mmproj correspondiente.
- Tool calling / function calling con formato XML estructurado: definiciones en `<tools></tools>` y llamadas en `<tool_call>` con pares `<arg_key>`/`<arg_value>`.
- Soporte de conversacion multi-turno mediante el prompt format con roles de sistema, usuario y asistente.
- Decodificacion especulativa mediante MTP (Multi-Token Prediction) para acelerar la inferencia.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: inferidas del soporte de tool calling y del modo de razonamiento, aunque no se detallan formalmente en la documentacion.

## Casos de uso

- Asistentes con entrada visual: el modelo puede recibir imagenes junto con texto, lo que permite construir asistentes que respondan a preguntas sobre capturas de pantalla, diagramas o documentos escaneados, usando el fichero mmproj para habilitar la torre de vision en llama.cpp.
- Automatizacion de agentes con tool calling: gracias al formato XML de `<tool_call>`, puede integrarse en orquestadores de agentes que expongan funciones (consultas a APIs, busquedas, operaciones sobre bases de datos) y parseen las llamadas estructuradas del modelo.
- Razonamiento complejo en local: el modo de razonamiento explicito con "Reasoning Effort" permite ajustar la profundidad de la cadena de pensamiento segun la tarea, util para analisis tecnico, depuracion logica o resolucion de problemas matematicos en entornos sin conexion.
- Despliegue en infraestructura propia con llama.cpp: las cuantizaciones Q4_K_M (200,83 GB) o IQ4_XS (177,74 GB) permiten servir el modelo en servidores con multiples GPU o con gran cantidad de memoria RAM, sin depender de APIs externas.
- Procesamiento de documentacion tecnica multimodal: combinando texto e imagenes, puede extraer y resumir informacion de manuales, planos o graficos dentro de un pipeline de ingestion documental.
- Generacion asistida con decodificacion especulativa: en escenarios de alto throughput, el soporte MTP permite acelerar la generacion en llama.cpp manteniendo la calidad, adecuado para servicios de generacion de texto a gran escala.
- Experimentacion e investigacion: al ser Apache 2.0 y estar disponible en GGUF, facilita la reproducibilidad y el estudio academico de modelos de 321B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q8_0 341,50 GB; Q6_K 281,04 GB; Q5_K_M 243,69 GB; Q4_K_M 200,83 GB; IQ4_XS 177,74 GB; Q3_K_M 155,02 GB; Q2_K 125,67 GB; IQ2_XS 101,43 GB.
- Los ficheros estan divididos en multiples partes (split), por lo que se requiere usar llama.cpp con soporte de shards o descargar todas las partes.
- GPU recomendadas: no se especifican en la informacion disponible. Por el volumen de pesos, se necesitan configuraciones multi-GPU (varias A100/H100) o servidores con gran cantidad de RAM para offloading parcial.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB) ni en configuraciones de una sola GPU de 80 GB, salvo con cuantizaciones muy agresivas y offloading a RAM, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: llama.cpp (release b12180 o superior, usado para la cuantizacion); compatible con herramientas que consuman GGUF (Ollama, LM Studio, entre otras), aunque no se confirma explicitamente en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones especificas en la informacion disponible.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta planificar despliegues que dependan de ventanas largas o de cobertura multilingue.
- Las cuantizaciones de 2 y 3 bits (Q2_K, IQ2_XS, IQ3_XXS, Q3_K_S) degradan la calidad de forma notable segun la propia model card; para produccion se recomienda Q4_K_M o superior.
- El modelo base pesa 321B parametros, lo que exige infraestructura considerable; el repo completo ocupa 4144,3 GB.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar la licencia y condiciones del modelo base nex-agi/Nex-N2.6, ya que la cuantizacion hereda sus terminos.
- La fecha de creacion del repo (2026-11-11) y la release de llama.cpp referenciada (b12180) deben verificarse antes de usarlas en produccion.
- El soporte multimodal requiere el fichero mmproj adicional; sin el, el modelo funciona solo con texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Nex-N2.6-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- llama.cpp release b12180: https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Perfil de bartowski en Hugging Face: https://huggingface.co/bartowski
