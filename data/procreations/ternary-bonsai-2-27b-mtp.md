# ProCreations/Ternary-Bonsai-2-27B-MTP

## Resumen

Ternary-Bonsai-2-27B-MTP es un modelo experimental de generacion de texto publicado por ProCreations que combina dos piezas: la base Ternary Bonsai 2 27B (cuantizacion ternaria PQ2_0, creada con Bonsai de Prism ML) y una cabeza de prediccion multi-token (MTP, multi-token prediction) extraida de Qwen3.8-27B y reentrenada contra la base congelada. El resultado se distribuye como un unico GGUF que conserva los 851 tensores originales de Bonsai byte a byte y anade la cabeza entrenada, con 27.320.697.856 parametros totales y un peso de fichero de 7,658 GB.

El objetivo es acelerar la decodificacion mediante decodificacion especulativa con dos tokens de borrador, sin tocar los pesos del modelo objetivo. En una RTX PRO 6000 Blackwell de 96 GB, el autor mide un incremento agregado de 138,0 a 171,7 tokens/s (1,245x, un 24,5% mas), con ganancias muy desiguales segun la tarea: 1,40x en razonamiento, 1,38x en codigo, 1,31x en salidas estructuradas y practicamente nulo en prosa libre (1,01x). La tasa de aceptacion de borradores medida fue del 60,5%.

Es relevante ahora porque demuestra que una cabeza MTP adaptada supera a la simple transplantacion de la cabeza original de Qwen (171,7 frente a 157,6 tok/s en F16 y 165,0 tok/s en Q8_0) sobre la misma base ternaria y el mismo runtime parcheado. La contrapartida es que es un artefacto de investigacion muy ligado a su entorno: requiere el runtime Prism parcheado (stock llama.cpp no es suficiente), el binario incluido es solo para Linux x86-64 con CUDA 13.3 y SM120 Blackwell, y el propio autor advierte de que no se trata de una aceleracion universal ni de una mejora de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cuantizado en ternario (formato Bonsai PQ2_0) con cabeza MTP para decodificacion especulativa, injertada desde Qwen3.8-27B |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio incluida, ajustable mediante la variable de entorno `CONTEXT` |
| Tipos de cuantizacion | Base PQ2_0 (ternaria); matrices de la cabeza MTP en Q8_0; pesos de normalizacion efectivos en F32; proyector de vision en Q8_0; cabeza suelta en BF16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Ternary-Bonsai-2-27B-PQ2_0-MTP-Q8_0.gguf`, 7,658 GB) y safetensors (`model_mtp.safetensors`, 849,4 MB, solo la cabeza entrenada) |

## Arquitectura y entrenamiento

La base es un transformer de 27,32 B de parametros cuantizado en ternario con el esquema PQ2_0 de Bonsai, que requiere rutinas propias de empaquetado y rotacion; por eso el autor indica explicitamente que llama.cpp estandar no es suficiente y que el runtime Prism fijado necesita ademas un parche de rotacion inversa del embedding MTP. Sobre esa base congelada se injerta una cabeza MTP procedente de Qwen3.8-27B y se afina en BF16, distribuyendose por separado en `model_mtp.safetensors`. No se describe la composicion completa del dataset de entrenamiento; el unico dataset declarado en las etiquetas es HuggingFaceH4/ultrachat_200k. No se menciona uso de RLHF o DPO.

La innovacion tecnica es concreta: decodificacion especulativa con dos tokens de borrador y verificacion por parte del modelo objetivo, que muestrea y valida cada token aceptado mientras sus pesos permanecen intactos. En la comparativa controlada del 17 de septiembre de 2026, con los mismos seis prompts, dos repeticiones, 1536 tokens de salida por peticion, contexto de 32768, un slot y el mismo runtime, la cabeza entrenada alcanza 171,7 tok/s frente a 157,6 tok/s de la cabeza original de Qwen en F16 (1,141x) y 165,0 tok/s en Q8_0 (1,195x), lo que aísla el efecto de la adaptacion respecto al mero transplante. El autor advierte que el batching altera la aritmetica en coma flotante, de modo que no se garantiza texto identico en configuraciones distintas.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento multi-paso con modo de pensamiento: el servicio arranca con razonamiento medio y sin presupuesto de tokens de pensamiento; el parametro `reasoning_effort` es configurable en la API.
- Generacion de codigo: es el segundo dominio con mayor ganancia medida de la cabeza MTP (190,9 tok/s, 1,38x).
- Razonamiento abstracto y geometrico: mejor caso medido (193,7 tok/s, 1,40x).
- Generacion de SQL (175,5 tok/s, 1,27x) y salidas estructuradas (180,3 tok/s, 1,31x).
- Vision: se puede activar descargando el proyector original coincidente (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`) y definiendo `MMPROJ`; se validó con una captura de Excalidraw y un esquema de herramienta de dibujo nativo. El autor aclara que la cabeza se entreno con caracteristicas de texto y que esto no constituye una evaluacion amplia de vision.
- Servicio de API compatible con OpenAI (`/v1/chat/completions`) en `http://127.0.0.1:8080`, con todas las capas en GPU, un slot y dos tokens de borrador.
- Muestreo de pensamiento estandar documentado: temperatura 1, top-p 0,95, top-k 20, min-p 0.
- Soporte de tool calling / function calling: no se documenta explicitamente en la informacion disponible, aunque el esquema de herramienta usado en la prueba de vision sugiere uso de esquemas JSON.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Asistencia de programacion con latencia reducida: en tareas de codigo la cabeza MTP aporta 1,38x (190,9 frente a 138,0 tok/s), por lo que un asistente integrado en el editor puede completar fragmentos largos con menos tiempo de espera, siempre que se despliegue el runtime parcheado.
- Razonamiento encadenado y analisis de problemas: es el dominio con mayor ganancia medida (1,40x), adecuado para pipelines que generan cadenas de razonamiento largas y donde el coste de decodificacion domina el total.
- Generacion de consultas SQL: con 1,27x de mejora medida, encaja en asistentes de analitica que traducen preguntas en lenguaje natural a SQL sobre esquemas de bases de datos.
- Salidas estructuradas y extraccion de datos: la ganancia de 1,31x en prompts estructurados lo hace util para rellenar JSON con esquema fijo en procesos de ingestión o ETL.
- Servicio interno autoalojado con API compatible con OpenAI: el repositorio incluye `serve.sh`, un endpoint en el puerto 8080 y variables `PORT`, `CONTEXT` y `DRAFT_TOKENS`, lo que permite levantar un endpoint privado con 32.768 tokens de contexto para un equipo pequeno.
- Investigacion sobre cabezas MTP y decodificacion especulativa: `model_mtp.safetensors` (849,4 MB, BF16) contiene solo la cabeza entrenada, pensada para conversion o trabajo posterior sobre bases Bonsai congeladas.
- Analisis de diagramas tecnicos: con el proyector de vision activado se valido una captura de Excalidraw junto a un esquema de herramienta de dibujo; sirve para prototipos de interpretacion de diagramas, no para produccion con requisitos de precision visual.
- Generacion de documentacion y prosa tecnica: funciona, pero la mejora de la cabeza MTP es marginal (1,01x), asi que el interes en este escenario esta en el modelo base ternario, no en la aceleracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos publicados son mediciones de throughput y comprobaciones objetivas:

| Tipo de prompt | Base (tok/s) | MTP entrenada (tok/s) | Aceleracion |
|---|---:|---:|---:|
| Codigo | 138,0 | 190,9 | 1,38x |
| Geometria | 137,9 | 162,9 | 1,18x |
| Prosa | 137,9 | 139,8 | 1,01x |
| Razonamiento | 138,0 | 193,7 | 1,40x |
| SQL | 138,0 | 175,5 | 1,27x |
| Estructurado | 138,0 | 180,3 | 1,31x |
| Agregado | 138,0 | 171,7 | 1,24x |

Otros datos medidos por el autor:

| Metrica | Valor |
|---|---|
| Throughput incluyendo procesado de prompt y latencia de cliente | 136,0 frente a 168,6 tok/s (1,24x) |
| Tasa de aceptacion de borradores | 60,5% (10.079 de 16.665 propuestas) |
| Comprobaciones objetivas de respuesta | 12/12 en base y en MTP entrenada |
| Ventaja de la cabeza Q8_0 entrenada sobre la cabeza original de Qwen en Q8_0 | 8,93% |

Metodologia declarada: seis prompts nuevos, dos repeticiones cada uno, 1536 tokens de salida por peticion, razonamiento medio, temperatura 1, top-p 0,95, top-k 20, min-p 0 y una unica peticion simultanea. Los prompts no se usaron para entrenamiento ni para seleccionar la longitud de borrador; esta se eligio aparte con cuatro prompts de desarrollo.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 7,658 GB en el GGUF principal (base ternaria PQ2_0 mas matrices de cabeza Q8_0 y norm weights F32). El consumo de cache KV para 32.768 tokens no esta publicado.
- GPU medida: una RTX PRO 6000 Blackwell de 96 GB, con todas las capas en GPU, contexto de 32768 y un slot.
- Binario incluido: exclusivamente Linux x86-64, CUDA 13.3 y SM120 (Blackwell). Requiere controlador NVIDIA y runtime CUDA compatibles.
- Otras GPU: el autor indica que deben compilar el codigo fuente fijado con su arquitectura CUDA soportada; el rendimiento en esas configuraciones no se ha medido.
- GPU de consumo: por tamano de pesos, el GGUF de 7,658 GB podria caber en GPU consumer de 12-16 GB, pero no hay ninguna medicion publicada en ese hardware y el runtime puede no compilar sin ajustes. No confirmado.
- Despliegue: runtime Prism parcheado incluido (`runtime/llama-bonsai-mtp-linux-cuda13.3-sm120.tar.gz`) o compilacion desde fuente con `bash runtime/build-runtime.sh` y `LLAMA_BIN_DIR`. No es compatible con llama.cpp estandar segun el autor. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Servicio: API compatible con OpenAI en `http://127.0.0.1:8080`, configurable con `PORT`, `CONTEXT` y `DRAFT_TOKENS`.
- Latencia y throughput: 171,7 tok/s agregados en decodificacion y 168,6 tok/s incluyendo procesado de prompt y latencia de cliente, medidos en el hardware citado con dos tokens de borrador.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con las variantes de la propia familia Bonsai y con la cabeza original de Qwen, todas medidas con los mismos prompts y runtime:

| Configuracion | Cabeza MTP | Tokens/s en decodificacion | Aceleracion sobre sin MTP | Parametros | Contexto | Licencia |
|---|---|---:|---:|---|---|---|
| Base sin MTP (Bonsai 2 27B PQ2_0) | No | 138,1 | 1,000x | 27,32 B | 32768 en la config de servicio | apache-2.0 |
| Cabeza original de Qwen3.8-27B en F16 | Si, sin adaptar | 157,6 | 1,141x | 27,32 B | no disponible en la fuente | apache-2.0 (este repo) |
| Cabeza original de Qwen3.8-27B en Q8_0 | Si, sin adaptar | 165,0 | 1,195x | 27,32 B | no disponible en la fuente | apache-2.0 (este repo) |
| Este modelo (cabeza adaptada, Q8_0) | Si, entrenada | 171,7 | 1,245x | 27,32 B | 32768 | apache-2.0 |

No se han proporcionado datos que permitan comparar con alternativas externas de tamano similar (por ejemplo, otros modelos de ~27 B cuantizados) en calidad, contexto o rendimiento: no disponible.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no hay evaluacion de calidad mas alla de 12 comprobaciones objetivas, que el autor califica explicitamente como prueba de humo y no como evidencia de capacidad intacta en todas las tareas.
- La aceleracion es modesta y desigual: 1,245x agregada, con solo 1,01x en prosa libre. No debe presentarse como una mejora de multiples ordenes.
- Dependencia fuerte del runtime: llama.cpp estandar no basta, y el binario suministrado solo funciona en Linux x86-64 con CUDA 13.3 y SM120 Blackwell. En otras GPU hay que compilar y el rendimiento no esta medido.
- Posible divergencia de texto: el batching cambia la aritmetica en coma flotante, por lo que no se garantiza texto identico byte a byte ni con decodificacion voraz o semilla fija entre configuraciones.
- Aceptacion de borradores y velocidad pueden variar con contextos largos, concurrencia, otras GPU y otras distribuciones de tareas; solo se midio una peticion simultanea.
- La validacion de vision es un unico caso de prueba con una captura y un esquema de herramienta; la cabeza se entreno con caracteristicas de texto y no constituye una evaluacion amplia.
- No se declaran idiomas soportados ni sesgos conocidos; no hay datos sobre tasas de alucinacion.
- El efecto de la cuantizacion ternaria PQ2_0 sobre la calidad respecto a los pesos originales de Qwen no se cuantifica en la informacion disponible.
- Licencia declarada apache-2.0 en este repositorio, pero el modelo deriva de bases de terceros (prism-ml/Ternary-Bonsai-2-27B-gguf y Qwen/Qwen3.8-27B) cuyas condiciones no se detallan aqui; conviene verificarlas antes de un uso comercial.
- Adopcion practicamente nula en el momento de la ficha (0 descargas, 3 likes), lo que reduce la probabilidad de encontrar soporte de la comunidad o casos de exito en produccion.
- El repositorio incluye sumas de verificacion (`SHA256SUMS`); se recomienda validarlas antes de ejecutar el binario distribuido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Modelo base cuantizado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset declarado: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Resultados de la release: `reports/release-results.json` (dentro del repositorio)
- Peticiones y resultados completos de la base: `reports/release-benchmark-base-n0.json` (dentro del repositorio)
- Peticiones y resultados completos de la etapa 2 con Q8: `reports/release-benchmark-stage2-q8-n2.json` (dentro del repositorio)
- Seleccion de longitud de borrador: `reports/selected-runtime.json` (dentro del repositorio)
- Proyector de vision: `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`, descargable con `python download-vision.py` del repositorio
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a documentos sobre dietas y allowances de Kenia, sin relacion con el contenido de la ficha.
