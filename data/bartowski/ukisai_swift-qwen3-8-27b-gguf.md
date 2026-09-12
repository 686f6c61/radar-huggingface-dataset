# bartowski/ukisai_Swift-Qwen3.8-27b-GGUF

## Resumen

Swift-Qwen3.8-27b es un modelo multimodal (texto e imagen) de unos 27.000 millones de parametros, publicado por el usuario ukisai y distribuido en formato GGUF por bartowski. Esta ficha describe concretamente el repositorio de cuantizaciones bartowski/ukisai_Swift-Qwen3.8-27b-GGUF, no los pesos originales en safetensors. Los tags del repositorio apuntan a la familia Qwen3 y a un ajuste orientado a "efficient-thinking" y "token-efficient reasoning", es decir, a reducir el gasto de tokens en tareas de razonamiento manteniendo la calidad de las respuestas.

El modelo declara soporte de decodificacion especulativa mediante MTP (multi-token prediction), entrada de imagen a traves de un archivo proyector mmproj y cuantizaciones generadas con imatrix, lo que permite desplegarlo en hardware de consumo con perdidas de calidad reducidas. El rango de cuantizaciones cubre desde bf16 completo (54,66 GB) hasta IQ3_XS (12,80 GB), pasando por la recomendada Q4_K_M de 17,44 GB.

Su relevancia practica esta en que ofrece un modelo de ~27B con capacidades multimodales y razonamiento explicito (bloque `<think>`) en un formato listo para llama.cpp, Ollama y servidores compatibles con endpoints, con licencia propia swift-open-license-1.0 que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican familia Qwen3; no se especifica si es densa, MoE o hibrida) |
| Parametros totales | 27.320.697.856 (27,3B) segun metadatos de safetensors; la model card indica 28B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS, Q3_K_L, Q3_K_M (listado truncado en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como license: other; repositorio con gated: true) |
| Formato de pesos | GGUF (cuantizaciones con imatrix, generadas con llama.cpp b10896) |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Modalidades de entrada | texto e imagen (la imagen requiere archivo mmproj) |
| Decodificacion especulativa | si, mediante MTP (multi-token prediction) |
| Cuantizacion recomendada por el autor | Q4_K_M, 17,44 GB |
| Tamano del repositorio | 446,8 GB |
| Descargas / likes | 290 / 9 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El nombre del modelo base (Swift-Qwen3.8-27b) y los tags `qwen3_8` y `lora` sugieren una base de la familia Qwen3 con un ajuste tipo LoRA, pero no se confirma ni el tipo de atencion, ni la composicion del dataset, ni el volumen de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si documenta el repositorio es la innovacion a nivel de inferencia: soporte de decodificacion especulativa basada en MTP, cuantizacion guiada por imatrix (matriz de importancia) para preservar los pesos mas sensibles y un formato de prompt tipo ChatML que incluye un parametro de esfuerzo de razonamiento (`Reasoning effort is set to xhigh`) y la apertura explicita del bloque `<think>` en el turno del asistente. Esta combinacion esta orientada a razonamiento con coste de tokens controlado.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento explicito con bloque `<think>` y nivel de esfuerzo de razonamiento configurable mediante prompt de sistema.
- Razonamiento eficiente en tokens (tags `efficient-thinking` y `token-efficient`).
- Procesamiento de imagen ademas de texto, siempre que se cargue el archivo mmproj correspondiente.
- Decodificacion especulativa con MTP, que acelera la generacion cuando el backend la soporta.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue en servidores tipo API.
- Capacidades de codigo, matematicas, tool calling y agentes: no documentadas de forma explicita en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener dialogos multi-turno en formato ChatML; la ventana de contexto concreta no esta documentada, por lo que conviene validarla antes de fijar politicas de truncado.
- Analisis de documentos con imagenes: al aceptar entrada de imagen via mmproj, permite extraer e interpretar informacion de capturas, diagramas o formularios combinando vision y texto en una misma conversacion.
- Razonamiento con coste controlado: para tareas donde el presupuesto de tokens importa (por ejemplo, clasificacion con justificacion o verificacion de hipotesis), el ajuste orientado a token-efficient reasoning reduce la longitud de las cadenas de pensamiento.
- Despliegue local en estacion de trabajo: con la cuantizacion Q4_K_M (17,44 GB) cabe en GPUs de 24 GB, lo que permite ejecutar un modelo de ~27B en local sin enviar datos a terceros.
- Procesamiento por lotes en servidor con llama.cpp: el repositorio incluye cuantizaciones desde IQ3_XS (12,80 GB) hasta Q8_0 (29,12 GB), lo que permite ajustar el equilibrio calidad/memoria segun el hardware disponible.
- Generacion asistida en entornos con API compatible con endpoints: el tag `endpoints_compatible` facilita integrarlo tras una capa HTTP en lugar de invocarlo directamente desde la aplicacion.
- Aceleracion de inferencia en produccion: la decodificacion especulativa MTP puede reducir la latencia por token cuando el runtime de destino la soporta.
- Evaluacion comparativa de cuantizaciones: util para equipos que necesitan medir el impacto real de IQ4_XS frente a Q5_K_M sobre su propio conjunto de tareas antes de fijar una cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (orientativa, a partir del tamano de archivo; hay que sumar la cache KV, cuyo tamano depende del contexto y no esta documentado): IQ3_XS 12,80 GB; Q3_K_M 13,40 GB; Q3_K_L 14,12 GB; IQ3_M 14,86 GB; IQ4_XS 15,48 GB; Q4_K_S 16,36 GB; Q4_K_M 17,44 GB; IQ4_NL 17,44 GB; Q4_K_L 18,82 GB; Q5_K_S 19,57 GB; Q5_K_M 20,92 GB; Q6_K 23,86 GB; Q6_K_L 24,96 GB; Q8_0 29,12 GB; bf16 54,66 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones de 13-21 GB encajan en GPUs de 24 GB (RTX 4090, RTX 3090, A10G, L4 con matices); Q8_0 y superiores requieren 32-48 GB o mas (A100 40/80 GB, H100); bf16 completo exige al menos 55 GB de memoria utilizable.
- Cabe en GPU de consumo: si. RTX 4090/3090 de 24 GB admiten hasta Q6_K y Q6_K_L con margen ajustado segun contexto; en GPUs de 16 GB caben IQ3_XS, Q3_K_M y, con margen minimo, IQ4_XS y Q4_K_S.
- Opciones de despliegue: llama.cpp (b10896 o posterior), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier servidor compatible con GGUF; el tag `endpoints_compatible` indica compatibilidad con despliegues tipo endpoint.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa MTP puede mejorar la velocidad cuando el backend la implementa, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada (los resultados de busqueda web recibidos no guardan relacion con el modelo). Como orientacion practica, la siguiente tabla compara las cuantizaciones dentro del mismo repositorio:

| Cuantizacion | Tamano | Uso tipico |
|---|---|---|
| bf16 | 54,66 GB | Referencia de maxima calidad; requiere hardware de 64 GB o mas |
| Q8_0 | 29,12 GB | Calidad practicamente identica al original; requiere 32-48 GB |
| Q6_K / Q6_K_L / Q6_K_S | 22,86-24,96 GB | Muy alta calidad, encaja en GPUs de 24 GB con contexto corto |
| Q5_K_M / Q5_K_S | 19,57-20,92 GB | Alta calidad, comoda en GPUs de 24 GB |
| Q4_K_M | 17,44 GB | Opcion recomendada por el autor; equilibrio tamano/calidad |
| IQ4_XS / Q4_K_S | 15,48-16,36 GB | Alternativa para GPUs de 16 GB |
| Q3_K_M / IQ3_XS / Q3_K_L | 12,80-14,12 GB | Uso con RAM limitada; perdida de calidad apreciable |

Comparativa con alternativas externas (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. La model card no incluye seccion de sesgos ni de evaluacion de seguridad.
- Riesgo de alucinacion: no se aportan evaluaciones de fidelidad ni de tasas de alucinacion. El modo de razonamiento explicito no elimina este riesgo.
- Idiomas: no se especifica la lista de idiomas soportados; el prompt de referencia esta en ingles y no hay garantia de calidad en castellano.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar politicas de truncado o de atencion a documentos largos.
- Licencia: swift-open-license-1.0, etiquetada como `license: other`. No es una licencia estandar (no es Apache 2.0 ni MIT), por lo que hay que leer el texto completo antes de cualquier uso comercial.
- Repositorio con acceso restringido: el modelo marca `gated: true`, lo que puede exigir aceptar condiciones en HuggingFace antes de descargar.
- Multimodalidad condicionada: el soporte de imagen requiere el archivo mmproj; sin el, el modelo funciona solo con texto.
- Fechas de publicacion inusuales: los metadatos indican creacion en 2026-09-12, un dato que conviene verificar directamente en el repositorio.
- Listado de archivos truncado: la informacion disponible corta la tabla de cuantizaciones en IQ3_XS, por lo que puede haber mas archivos.
- Uso en produccion: al no haber benchmarks publicados ni datos de contexto, cualquier decision de despliegue deberia basarse en una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ukisai_Swift-Qwen3.8-27b-GGUF
- Cuantizacion Q4_K_M recomendada: https://huggingface.co/bartowski/ukisai_Swift-Qwen3.8-27b-GGUF/blob/main/ukisai_Swift-Qwen3.8-27b-Q4_K_M.gguf
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Release de llama.cpp empleada para cuantizar (b10896): https://github.com/ggml-org/llama.cpp/releases/tag/b10896
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (los resultados devueltos corresponden a productos de cuidado canino y no guardan relacion).
