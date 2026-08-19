# BlackRiverAI/QwiVer3.6-35B-A3B-GGUF

## Resumen

QwiVer3.6-35B-A3B es una variante post-entrenada por BlackRiver AI sobre el modelo base Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje multimodal con arquitectura de mezcla de expertos (MoE) dispersa. Con aproximadamente 35 mil millones de parámetros totales pero solo unos 3 mil millones activos por token, combina la capacidad de un modelo grande con la eficiencia de inferencia de uno mucho más pequeño. Está diseñado específicamente para ejecución local en `llama.cpp`, con soporte nativo para visión, razonamiento, generación de código, uso de herramientas y agentes.

El modelo destaca por su ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente un millón de tokens, y por preservar la capacidad de Multi-Token Prediction (MTP) para decodificación especulativa. BlackRiver AI aplicó un post-entrenamiento curricular (fase 10.2) con LoRA, fusionando el adaptador directamente en la base BF16 antes de la conversión a GGUF, lo que produce un checkpoint autocontenido sin dependencias externas de adaptadores. Se distribuye bajo licencia Apache-2.0 en cuatro cuantizaciones GGUF.

La relevancia actual de este modelo radica en su equilibrio entre capacidad, eficiencia y portabilidad: permite ejecutar tareas de ingeniería de software, razonamiento multimodal y flujos agénticos en hardware de consumo, sin sacrificar la calidad de un modelo de 35B gracias a su activación dispersa de solo 3B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 sparse MoE (`qwen3_5_moe`) |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones |
| Longitud de contexto | 262.144 tokens nativos (hasta ~1.010.000 con extension) |
| Tipos de cuantizacion | UD-Q2_K_XL (12,57 GB), UD-Q3_K_XL (17,23 GB), UD-Q4_K_XL (22,85 GB), UD-Q8_K_XL (39,10 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyector multimodal BF16 separado) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.6-35B-A3B: un transformer con mezcla de expertos dispersa que contiene 40 capas y 256 expertos, de los cuales se activan 8 expertos enrutados mas 1 experto compartido por token. Esto permite que, aunque el modelo tenga 35B parametros totales, solo se calculen aproximadamente 3B parametros activos durante la inferencia, lo que reduce sustancialmente el coste computacional por token en comparacion con un modelo denso del mismo tamano.

El post-entrenamiento de BlackRiver AI consistio en un curriculum de 1.531 ejemplos con un total de 3.999.924 tokens de entrenamiento, ejecutado durante 383 pasos de optimizacion con estrategia LoRA sobre la base BF16 congelada. El adaptador resultante (fase 10.2) se fusiono directamente en la base antes de la conversion a GGUF, eliminando la necesidad de aplicar adaptadores en tiempo de ejecucion. El pipeline de conversion de BlackRiver preserva los tensores MTP (Multi-Token Prediction) —se verificaron 20 tensores MTP por edicion—, lo que habilita la decodificacion especulativa nativa en versiones recientes de `llama.cpp`.

El modelo conserva el proyector multimodal de Qwen3.6, lo que permite entrada de imagenes mediante un archivo GGUF separado (`mmproj-QwiVer3.6-BF16.gguf`), aunque no es necesario para operacion solo texto.

## Capacidades

- Generacion de texto y razonamiento estructurado, con soporte de modo "thinking" para problemas complejos.
- Generacion de codigo y razonamiento a nivel de repositorio, orientado a tareas de ingenieria de software autonomas.
- Uso de herramientas (tool calling) y flujos agénticos multi-paso.
- Multimodal: acepta entrada de imagenes junto con texto (vision), mediante el proyector BF16 separado.
- Contexto largo nativo de 262.144 tokens, con capacidad extendida de hasta ~1.010.000 tokens.
- Decodificacion especulativa nativa mediante Multi-Token Prediction (MTP) en `llama.cpp`.
- Ejecucion local eficiente gracias a la arquitectura MoE con solo ~3B parametros activos.

## Casos de uso

- Asistente de programacion local: el modelo puede generar, revisar y refactorizar codigo en multiples archivos, aprovechando su contexto de 262K tokens para mantener el estado completo de un repositorio en memoria. Su soporte de tool calling permite integrarlo en editores o entornos de desarrollo.
- Agente de automatizacion de tareas: gracias a su capacidad de razonamiento multi-paso y uso de herramientas, puede orquestar flujos como ejecucion de scripts, llamadas a APIs o gestion de ficheros, funcionando como un agente autonomo en un entorno local.
- Analisis de documentos extensos: con 262K tokens de contexto nativo, puede procesar libros tecnicos, informes o bases de codigo completas en una sola pasada, respondiendo preguntas especificas sin necesidad de fragmentar el texto.
- Soporte tecnico con contexto largo: en un entorno de atencion al cliente, puede mantener conversaciones multi-turno con historial extenso y acceder a documentacion interna mediante tool calling, proporcionando respuestas precisas y actualizadas.
- Investigacion multimodal local: al aceptar imagenes, puede describir diagramas, capturas de pantalla o esquemas de arquitectura, combinando informacion visual con razonamiento textual para tareas de documentacion o analisis.
- Prototipado de aplicaciones de IA en hardware de consumo: su cuantizacion Q4 (22,85 GB) cabe en GPUs de 24 GB como RTX 3090/4090, permitiendo desarrollar y probar aplicaciones agénticas y multimodales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Se recomienda consultar el repositorio del modelo base Qwen/Qwen3.6-35B-A3B para obtener referencias de rendimiento de la arquitectura subyacente.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - UD-Q2_K_XL (12,57 GB): cabe en GPUs de 16 GB, como RTX 4080 o RTX 4090 con margen.
  - UD-Q3_K_XL (17,23 GB): requiere GPUs de 20-24 GB, como RTX 3090 o RTX 4090.
  - UD-Q4_K_XL (22,85 GB): recomendada para GPUs de 24 GB (RTX 3090, RTX 4090, A5000).
  - UD-Q8_K_XL (39,10 GB): necesita GPUs de 40-48 GB, como A100 40GB, A6000 o multiples GPUs.
- GPU recomendadas: RTX 3090/4090 para la cuantizacion Q4; A100 o H100 para Q8.
- Opciones de despliegue: `llama.cpp` como runtime principal; compatible con servidores basados en `llama.cpp` como `llama-server` o `llama-cpp-python`. No se menciona soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~3B activos sugiere una velocidad de generacion superior a la de un modelo denso de 35B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto nativo | Licencia | Formato |
|---|---|---|---|---|---|
| QwiVer3.6-35B-A3B | ~35B | ~3B | 262K | Apache-2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B | ~3B | 262K | Apache-2.0 | safetensors, GGUF |
| Mixtral 8x7B (referencia) | ~47B | ~13B | 32K | Apache-2.0 | safetensors, GGUF |

La comparacion con Mixtral 8x7B es orientativa: ambos son MoE, pero QwiVer activa muchos menos parametros por token (~3B frente a ~13B), lo que reduce el coste de inferencia. QwiVer ofrece un contexto nativo muy superior (262K frente a 32K) y capacidades multimodales que Mixtral no tiene. No se dispone de datos de rendimiento comparativos para una evaluacion cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas, incluido el castellano, no esta garantizado y puede ser significativamente inferior.
- Sesgos y alucinaciones: no se han publicado evaluaciones especificas de sesgos o fiabilidad. Como modelo generativo, existe riesgo de alucinacion, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Contexto extendido: aunque el modelo soporta hasta ~1.010.000 tokens con extension, el rendimiento en esa longitud extrema no esta documentado; la calidad puede degradarse mas alla de los 262K nativos.
- Vision: el proyector multimodal se distribuye por separado; sin el, el modelo no procesa imagenes. La calidad de la vision no ha sido evaluada publicamente.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.6 puede tener sus propias condiciones; se recomienda revisar la licencia del modelo base.
- Despliegue en produccion: al estar orientado a `llama.cpp`, la integracion con frameworks de servicion como vLLM o TGI no esta confirmada; puede requerir adaptaciones para entornos de alta concurrencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BlackRiverAI/QwiVer3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Base de entrenamiento: https://huggingface.co/unsloth/Qwen3.6-35B-A3B
