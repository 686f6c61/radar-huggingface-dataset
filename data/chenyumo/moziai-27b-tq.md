# chenyumo/moziAI-27B-TQ

## Resumen

MoziAier 27B-TQ es un modelo de lenguaje denso de 27.000 millones de parametros publicado por el usuario chenyumo en Hugging Face, distribuido en formato GGUF y disenado para inferencia local en llama.cpp. Su rasgo diferencial es la cuantizacion ternaria: los pesos principales toman unicamente los valores -1, 0 y +1 en un contenedor PTQ1.0 (tipo GGUF 143), lo que reduce el fichero de pesos a 5,80 GiB y permite ejecutar una ventana de contexto de hasta 256K tokens en una GPU de 16 GB. Deriva del modelo base Qwen/Qwen3.8-27B (licencia Apache-2.0), con pesos ternarios tomados de PrismML Ternary-Bonsai-2.5-27B.

El modelo anade una capa de comportamiento propietaria denominada MoziAier: un esquema de "pensamiento en siete dimensiones" que clasifica la tarea (simple, analitica o compleja) y despliega 2, 5 o 7 dimensiones de razonamiento, con un bucle de agente (ejecutar, evaluar, ajustar, verificar) para tareas multietapa. Incorpora soporte de tool calling, entrada de vision mediante un proyector mmproj separado y decodificacion especulativa MTP, que segun el autor aporta una mejora del 29,4 % en velocidad de decodificacion.

Es relevante ahora porque combina tres tendencias activas en el ecosistema abierto: cuantizacion extrema por debajo de 4 bits, contextos de cientos de miles de tokens en hardware de consumo y despliegue local de asistentes con capacidades de agente. No obstante, el repositorio no tiene descargas ni valoraciones y el modelo se publico el 25 de noviembre de 2026, por lo que su validacion independiente es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Dense) con GQA y capa MTP; 65 capas (incluida la MTP) |
| Parametros totales | 27B (nominal); el fichero safetensors del repo declara 460.730.096 parametros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Ternaria (-1 / 0 / +1) en contenedor PTQ1.0 (GGUF tipo 143); KV cache en q4_0; proyector de vision en Q8_0; capa MTP en Q5_0 |
| Idiomas soportados | Chino (zh) e ingles (en), con chino como idioma prioritario |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero principal de 6.232.822.464 bytes (5,80 GiB) mas mmproj de 600 MB |

Otros datos tecnicos: atencion con 24 cabezas y 4 cabezas KV (GQA), dimension oculta de 5.120 y FFN de 17.408. Tamano total del repositorio: 6,9 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de Qwen/Qwen3.8-27B, con atencion de consultas agrupadas (24 cabezas de atencion y 4 cabezas KV) y 65 capas, una de ellas correspondiente a la capa de prediccion multi-token (MTP) que habilita la decodificacion especulativa. La innovacion principal no esta en la topologia sino en la representacion de pesos: la cuantizacion ternaria PTQ1.0 reduce cada peso a uno de tres valores, lo que disminuye drasticamente el ancho de banda de memoria por token generado y explica que un modelo nominal de 27B quepa en 5,80 GiB.

La model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO sobre el modelo base. Lo que si se describe es una capa de post-entrenamiento propietaria (MoziAier) que impone un formato de salida estructurado: una linea de clasificacion de la tarea seguida de un razonamiento de 2, 5 o 7 dimensiones segun la complejidad, y un bucle de agente con criterios de salida para evitar bucles infinitos. Tambien se menciona un comportamiento orientado a rechazar la fabricacion de datos cuando la informacion no esta disponible. Los pesos ternarios proceden de PrismML Ternary-Bonsai-2.5-27B, tambien Apache-2.0. El motor de inferencia requerido es una compilacion especifica de llama.cpp de linaje Prism (MIT); la version oficial de llama.cpp no soporta este tipo de pesos.

## Capacidades

- Generacion de texto y razonamiento estructurado en chino e ingles, con salida organizada en dimensiones de analisis segun la complejidad de la tarea.
- Razonamiento de agente multietapa: bucle ejecutar, evaluar, ajustar y verificar, con criterios de convergencia y reglas de salida para evitar bucles.
- Tool calling / function calling con un formato de invocacion pensado para que los frameworks de agentes lo parseen directamente.
- Vision: entrada de imagenes a traves del proyector mmproj-Q8_0 (600 MB), orientada a preguntas sobre capturas de pantalla, lectura de graficos y digitalizacion de documentos escaneados.
- Contexto largo: hasta 256K tokens, suficiente para libros completos, contratos extensos o bases de codigo de tamano medio.
- Decodificacion especulativa MTP con un unico modelo (sin modelo borrador externo), con una tasa de aceptacion declarada del 57,19 %.
- Comportamiento de rechazo a la fabricacion: ante preguntas sobre informacion inexistente responde que no la encuentra, en lugar de inventar una respuesta.
- Orientacion a la busqueda web para consultas sensibles al tiempo, siempre que se conecte una herramienta externa.

## Casos de uso

- Analisis de documentos extensos en local: con 256K tokens de contexto y 12,89 GB de VRAM en configuracion completa, se puede cargar un contrato, un informe anual o un libro entero y hacer preguntas sobre el sin fragmentar ni recurrir a RAG.
- Asistente de atencion al cliente autoalojado: el modelo mantiene conversaciones multiturno largas y su formato de salida estructurado facilita el registro y la auditoria de cada respuesta; la licencia Apache-2.0 permite uso comercial sin regalias.
- Agente de automatizacion con herramientas: gracias al tool calling y al bucle de agente, puede encadenar llamadas a APIs (consulta de estado, creacion de tickets, envio de correo) con verificacion intermedia de resultados.
- Procesamiento de documentacion escaneada: combinando el modelo principal con el proyector mmproj, se pueden digitalizar facturas, albaranes o formularios y extraer campos estructurados en un flujo por lotes.
- Analisis de bases de codigo: la ventana de 256K permite introducir varios modulos de un repositorio de tamano medio para tareas de revision, explicacion de dependencias o generacion de documentacion tecnica.
- Despliegue en estaciones de trabajo con una sola GPU de 16 GB: equipos con RTX 4080, RTX 4090 o similares pueden servir el modelo con contexto de 100K a 256K, lo que habilita prototipos de asistentes internos sin coste de API.
- Traduccion y resumen bilingue chino-ingles: el modelo esta optimizado para ambos idiomas, por lo que encaja en flujos de localizacion de documentacion tecnica entre esos dos mercados.

## Benchmarks y rendimiento

La model card unicamente publica mediciones de velocidad de inferencia realizadas por el autor en una AMD Radeon AI PRO R9700 (32 GB) con ROCm 7.13. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Valor declarado | Condiciones |
|---|---|---|
| Velocidad de decodificacion con MTP | 61,2 tok/s | R9700, ROCm, contexto 150K, metodo de tres preguntas |
| Velocidad de decodificacion sin MTP | 47,3 tok/s | Mismas condiciones |
| Mejora por MTP | +29,4 % (tasa de aceptacion 57,19 %) | Mismas condiciones |
| Velocidad en estado estacionario | 58,19 tok/s | Contexto 150K, MTP activado |
| Tiempo hasta el primer token | ~6,1 s | Contexto 150K |
| VRAM con contexto de 128K | ~10,0 GB | KV cache q4_0 |
| VRAM con contexto de 256K | ~12,89 GB | KV cache q4_0 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,0 GB con contexto de 128K, 12,89 GB con 256K y 9,4 GB con 100K, segun las mediciones del autor con KV cache en q4_0.
- GPU de referencia del autor: AMD Radeon AI PRO R9700 de 32 GB con ROCm 7.13; el modelo deja margen suficiente en esa tarjeta.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080 y equivalentes) para contexto completo; en tarjetas de 12 GB solo con contextos reducidos.
- Motor de despliegue: exclusivamente la compilacion especifica de llama.cpp de linaje Prism; no funciona con llama.cpp oficial, y por tanto tampoco con Ollama, vLLM ni TGI en sus versiones estandar.
- Parametros de servicio recomendados por el autor: `--parallel 1` (el valor por defecto de 4 divide el contexto entre ranuras), `--cache-type-k q4_0 --cache-type-v q4_0`, `--flash-attn on` (obligatorio para que el kernel ternario funcione) y `--spec-type draft-mtp --spec-draft-n-max 2`.
- Throughput: 58,19 a 61,2 tok/s en decodificacion y unos 6,1 s hasta el primer token con 150K de contexto en la R9700; no hay mediciones publicadas para GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier 27B-TQ | 27B denso | 256K | Ternaria PTQ1.0 (5,80 GiB) | Apache-2.0 | GGUF, llama.cpp Prism |
| Qwen3.8-27B (base) | 27B denso | No disponible en la informacion | Completa (BF16, GPTQ, AWQ, GGUF) | Apache-2.0 | Amplia, multiples frameworks |
| PrismML Ternary-Bonsai-2.5-27B | 27B denso | No disponible en la informacion | Ternaria | Apache-2.0 | GGUF, llama.cpp Prism |
| Versiones Q4_K_M del mismo linaje | 27B denso | 256K | 4 bits (~13,7 GB) | Apache-2.0 | GGUF |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos densos de 24B a 32B en 4 bits) no esta disponible en la informacion proporcionada. Frente a su propio linaje, la ventaja declarada es el menor tamano (5,80 GiB frente a 13,7 GB en Q4_K_M) y una decodificacion mas rapida, a costa de depender de un motor no estandar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse principalmente en chino e ingles, es previsible un sesgo cultural y linguistico hacia esos dos idiomas.
- Riesgo de alucinacion: el autor declara un comportamiento de rechazo ante informacion inexistente, pero no aporta evaluaciones cuantitativas que lo respalden; la cuantizacion ternaria agresiva puede degradar la fidelidad en tareas de conocimiento factual.
- Cobertura idiomatica limitada: solo chino e ingles declarados; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Dependencia de un motor no oficial: requiere una compilacion especifica de llama.cpp (linaje Prism). La version oficial no soporta los pesos ternarios, lo que complica el mantenimiento, la integracion en plataformas gestionadas y la actualizacion de seguridad.
- Ausencia de validacion independiente: cero descargas y cero valoraciones en Hugging Face en el momento de la consulta; todos los datos de rendimiento proceden del autor y de una unica GPU AMD.
- Inconsistencia en el recuento de parametros: la model card indica 27B, mientras que el fichero safetensors del repositorio declara 460.730.096 parametros; conviene verificar la cifra real antes de planificar recursos.
- Licencia: Apache-2.0 permite uso comercial, pero el aviso NOTICE debe respetarse y los pesos ternarios derivan de un tercero (PrismML), cuya atribucion tambien hay que conservar.
- Formato de salida impuesto: el esquema de siete dimensiones y el bucle de agente incrementan el numero de tokens generados en tareas simples, lo que puede encarecer el servicio si no se ajustan los parametros de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-27B-TQ
- Modelo en ModelScope: https://modelscope.cn/models/chenyumo/MoziAier-27B-TQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos ternarios de origen (PrismML Ternary-Bonsai-2.5-27B): no disponible como enlace verificado en la informacion proporcionada
- Repositorio de llama.cpp (compilacion Prism requerida): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponible
