# litert-community/laya-LiteRT

## Resumen

laya-LiteRT es la variante en formato de identificadores de token (token-ids) de los codificadores de decisión Laya, convertidos a grafos LiteRT/TFLite clásicos para su ejecución en Android sobre GPU y NPU. No es un modelo generativo: recibe un estado o texto y devuelve respuestas calibradas a preguntas tipadas, con tres formas de salida (`choice`, una de las opciones; `score`, una escala ordenada; y `noul`, la probabilidad de que una afirmación se cumpla). Cada pregunta se resuelve con una única pasada forward del grafo.

El paquete contiene dos checkpoints derivados de [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya/tree/1c5edc17a7acd8701df6fc341c0d179f1c62c982) (revisión `1c5edc17`): el modelo en inglés, que es ModernBERT-large con la cabeza de decisión de Laya (421M parámetros), y el multilingüe, que es mmBERT-base con la misma cabeza (322M parámetros). Cada checkpoint se sirve en ventanas estáticas de 256 o 512 tokens. La conversión la publica el colectivo litert-community y se distribuye bajo licencia Apache 2.0.

Su relevancia es de despliegue: frente a otros paquetes de la misma familia que externalizan la búsqueda de embeddings en una tabla del host, este repositorio incorpora la tabla de embeddings dentro del grafo y acepta directamente identificadores de token. Incluye además un host de referencia (`laya_host.py`) y un contrato de integración (`HOST_CONTRACT.md`) que especifican la secuencia y la decodificación necesarias para portar el modelo. La conversión fue validada en un Samsung Galaxy S26 con LiteRT 2.2.0 y precisión FP32 explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large en el checkpoint inglés; mmBERT-base en el multilingüe) con cabeza de decisión de Laya |
| Parámetros totales | 421M (inglés) y 322M (multilingüe) |
| Parámetros activos | no aplica (modelos densos, no MoE) |
| Longitud de contexto | ventana estática de 256 o 512 tokens según el fichero (no dinámica) |
| Tipos de cuantización | fp32 y wfp16 (pesos FULLY_CONNECTED y EMBEDDING_LOOKUP en float16 con DEQUANTIZE a float32; activaciones en float32) |
| Idiomas soportados | inglés y japonés validados; el editor del modelo base declara más de 100 idiomas para el checkpoint multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`), un grafo estático por fichero; entradas `int32` de identificadores de token |
| Tarea | clasificación de texto con decisiones tipadas (`choice`, `score`, `noul`) |
| Salida de texto generado | ninguna (una pasada forward por pregunta) |
| Tamaño del repositorio | 14,9 GB |
| Descargas / likes | 458 / 3 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional al que se sustituye la cabeza de clasificación habitual por la cabeza de decisión propietaria de Laya. El checkpoint inglés emplea ModernBERT-large (421M parámetros incluyendo la cabeza) y el multilingüe emplea mmBERT-base (322M con la misma cabeza). Ambos comparten los formularios de petición y respuesta definidos por Laya y se publican como grafos LiteRT con una ventana estática por fichero, sin enmascaramiento dinámico: la longitud de secuencia está fijada en el propio grafo (256 o 512 tokens), lo que permite compilar a aceleradores móviles.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El repositorio incluye `multilingual/calibration.json`, un ajuste de temperatura realizado específicamente para esta conversión, y los ficheros `tokenizer.json`, `tokenizer_config.json` y `rl_agent_config.json` de la revisión fijada del modelo base. La innovación técnica principal de esta conversión es la fusión de la tabla de embeddings dentro del grafo: frente a los paquetes hermanos, que reciben filas de embedding ya resueltas por la aplicación, aquí entran identificadores de token y se elimina la búsqueda en tabla del lado del host, a cambio de ficheros de mayor tamaño (1,3 GB multilingüe y 1,7 GB inglés en fp32). Adicionalmente se publican dos grafos de cabeza de acción (`laya_ml_act_head_fp32.tflite`, de 795.816 bytes, y `laya_act_head_fp32.tflite`, de 1.057.960 bytes) que se ejecutan después del grafo principal.

## Capacidades

- Clasificación con decisiones tipadas: devuelve `choice` (una de las opciones del criterio), `score` (un valor en una escala ordenada) o `noul` (probabilidad de que una afirmación se cumpla).
- Una única pasada forward por pregunta, sin generación de texto ni decodificación autoregresiva.
- Clasificación zero-shot mediante criterios definidos en la petición, con el formato de petición propio de Laya (laya 0.3.4 en el host de referencia).
- Soporte multilingüe en el checkpoint multilingüe (más de 100 idiomas declarados por el editor, con validación explícita en inglés y japonés).
- Ejecución en dispositivo en Android sobre GPU, NPU y CPU mediante LiteRT 2.2.0 `CompiledModel`.
- Grafo de cabeza de acción auxiliar para ejecutar después de la inferencia principal.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni visión: la información disponible no documenta ninguna de estas capacidades.

## Casos de uso

- Enrutamiento de intenciones en aplicaciones móviles: con el grafo de 256 tokens en fp32 (54 ms en GPU en el dispositivo probado) el modelo puede clasificar la intención de un turno de conversación y decidir qué flujo de la aplicación se activa, sin enviar el texto a un servidor.
- Validación de formularios y campos en el propio dispositivo: la salida `noul` permite comprobar si una afirmación se cumple (por ejemplo, si un campo cumple un criterio declarado) devolviendo una probabilidad calibrada en lugar de un booleano opaco.
- Puntuación en escalas ordenadas: la salida `score` sirve para tareas como priorización de tickets, puntuación de severidad o graduación de sentimiento, aprovechando que la escala es ordenada y no una mera etiqueta.
- Clasificación zero-shot de contenido en el dispositivo: útil para moderación o etiquetado en apps donde el texto no debe salir del teléfono, definiendo los criterios en la petición en lugar de reentrenar.
- Procesamiento de facturas y documentos administrativos: el editor documenta un ajuste específico para procesamiento de facturas, aunque ese ajuste fino se distribuye en el paquete Laya-English-LiteRT y no en este repositorio.
- Observabilidad de trazas de agentes: el editor documenta un ajuste fino para observabilidad de trazas de agentes, igualmente en el paquete Laya-English-LiteRT; este repositorio aporta los checkpoints base sobre los que se construye.
- Atención al cliente e incidencias de seguridad: el editor lista estos dos flujos entre los cuatro cubiertos por su ajuste fino de `typed-decisions`, con la misma salvedad de que el ajuste vive en el paquete en inglés.
- Portado a nuevos hosts o plataformas: gracias a `laya_host.py` y a `HOST_CONTRACT.md`, el repositorio sirve como referencia para reimplementar el bucle de petición y decodificación de Laya en otro runtime o lenguaje.

## Benchmarks y rendimiento

Los únicos datos cuantitativos de calidad disponibles son los de XNLI en inglés: 0,843 para el checkpoint multilingüe frente a 0,860 para el checkpoint inglés. Además, se documentan pruebas de paridad entre el dispositivo y la implementación del editor:

| Prueba | Resultado |
|---|---|
| Paridad en fixture público de decisión de tres opciones (144 filas) | 144/144 coincidencias con la implementación del editor |
| Paridad global en el dispositivo (marcadores por fila) | argmax idéntico y probabilidades dentro de 0,0001 tras la misma calibración |
| `laya_ml_s256_wfp16.tflite` en NPU (201 filas) | 81/81, delta máximo de probabilidad 0,0068 |
| `laya_ml_s256_wfp16.tflite` en CPU 4 hilos (40 filas) | 0 flips |
| `laya_en_s256_fp32.tflite` en NPU (140 filas) | 59/59, delta máximo de probabilidad 0,0054 |
| `laya_ml_s512_fp32.tflite` en CPU 4 hilos (201 filas) | 0 flips |
| XNLI inglés (multilingüe / inglés) | 0,843 / 0,860 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general en la información disponible; estos modelos no son generativos y esas evaluaciones no aplicarían a su tarea.

## Requisitos de hardware

- Se trata de un modelo para Android en el dispositivo, no de un modelo de servidor: no hay estimaciones publicadas de VRAM para GPU discretas (A100, H100, RTX 4090) y esas cifras figuran como no disponibles.
- Almacenamiento necesario según fichero: 1,287 GB (`laya_ml_s256_fp32`), 1,288 GB (`laya_ml_s512_fp32`), 644 MB (`laya_ml_s256_wfp16`), 1,685 GB (`laya_en_s256_fp32`), 1,686 GB (`laya_en_s512_fp32`) y 844 MB (`laya_en_s512_wfp16`).
- Latencia medida en Samsung Galaxy S26 (SM-S942Q, Android 16 BP4A.251205.006) con LiteRT 2.2.0 y FP32 explícito: 54 ms por pregunta en GPU para el multilingüe a 256 tokens; 138 ms a 512 tokens; 222 ms en CPU de 4 hilos a 256 tokens y 649 ms a 512 tokens; 37 ms en NPU a 256 tokens con el fichero fp32 (con una probabilidad 0,0115 por encima del límite de 0,01, por lo que se recomienda el fichero wfp16 en NPU, que da 37 ms con 81/81 de paridad).
- En inglés: 127 ms por pregunta en GPU a 256 tokens y 442 ms a 512 tokens en fp32; 84 ms en NPU a 256 tokens; 1.326 ms en CPU de 4 hilos para el fichero `laya_en_s512_wfp16` de 512 tokens.
- Los ficheros `wfp16` no compilan en la GPU probada: el acelerador de LiteRT 2.2.0 deja los nodos DEQUANTIZE y EMBEDDING_LOOKUP en la partición de CPU y la compilación falla, por lo que se ejecutaron en CPU.
- Opciones de despliegue: LiteRT 2.2.0 `CompiledModel` (GPU, NPU y CPU), API clásica de TFLite y el host de referencia `laya_host.py` sobre CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a grafos TFLite.
- Solo se ha probado un dispositivo concreto (Galaxy S26); otros teléfonos y familias de GPU no han sido validados según la información disponible.
- La aplicación de ejemplo con tokenizador Kotlin y la demo `zero_shot_classification` se encuentran en los paquetes hermanos y en litert-samples, no en este repositorio.

## Comparativa con modelos similares

Comparación con los otros dos paquetes de la misma familia Laya para LiteRT, que son las alternativas directamente intercambiables:

| Modelo | Checkpoints | Tamaño en dispositivo | Latencia por pregunta | Tokenizador | App de ejemplo | Cuándo elegirlo |
|---|---|---|---|---|---|---|
| laya-LiteRT (este repositorio) | Multilingüe (mmBERT-base, 322M) e inglés (ModernBERT-large, 421M); sin el ajuste fino | 1,3 GB (multilingüe fp32 GPU) / 1,7 GB (inglés fp32 GPU) | 54 ms (multilingüe) / 127 ms (inglés) | No incluye; entran identificadores de token | No | Cuando se quieren alimentar identificadores de token y evitar la búsqueda en tabla del lado de la app |
| Laya-Multilingual-LiteRT | Multilingüe (mmBERT-base) | 0,68 GB | 51 ms más 15-20 ms de búsqueda en tabla | Sí, tokenizador Kotlin en `android/` | Sí | Texto no inglés o mixto; también responde en inglés con XNLI 0,843 frente a 0,860 |
| Laya-English-LiteRT | Inglés (ModernBERT-large) y su ajuste fino `typed-decisions` para cuatro flujos | 0,85 GB cada uno | 123 ms (126 ms el ajuste fino) | No; usa el de la app | No | Texto solo en inglés cuando importa la puntuación superior, y para los cuatro flujos del ajuste fino |

Respecto a modelos externos de la misma categoría (clasificadores de decisión tipada con salidas `choice`/`score`/`noul`), no se dispone de datos comparativos de parámetros, contexto, rendimiento o licencia en la información proporcionada: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta diálogo libre, tool calling, agentes ni razonamiento multi-paso.
- Ventana de contexto fija por fichero (256 o 512 tokens) sin enmascaramiento dinámico; el texto que exceda la ventana debe truncarse o dividirse en el host.
- Los ficheros `wfp16` no compilan en la GPU de LiteRT 2.2.0 en el dispositivo probado por la presencia de nodos DEQUANTIZE y EMBEDDING_LOOKUP en la partición de CPU, lo que limita su uso a CPU o NPU.
- En NPU, la ejecución fp32 del multilingüe a 256 tokens produjo una probabilidad de 0,0115, por encima del límite de 0,01 declarado; se recomienda el fichero `wfp16` en ese acelerador.
- La validación se limita a un único dispositivo (Samsung Galaxy S26, Android 16) con LiteRT 2.2.0; otros teléfonos y familias de GPU no han sido probados y podrían presentar diferencias de compilación, latencia o paridad numérica.
- Los idiomas validados son inglés y japonés; la cifra de más de 100 idiomas procede del editor del modelo base y no está verificada de forma independiente en esta conversión.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades de `noul` y las puntuaciones de `score` dependen de la calibración de temperatura incluida (`multilingual/calibration.json`) y pueden desviarse si se reutilizan sin recalibrar en otro dominio.
- Sesgos: la información disponible no documenta análisis de sesgo ni evaluación de equidad para estos checkpoints.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia y los términos de la revisión concreta del modelo base `convaiinnovations/laya` que se haya utilizado.
- El repositorio pesa 14,9 GB por incluir múltiples ventanas y precisiones; conviene descargar solo el fichero necesario mediante los ficheros de sumas de verificación `SHA256SUMS`.
- Los resultados de la búsqueda web realizada para esta ficha no contenían información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/litert-community/laya-LiteRT
- Modelo base: https://huggingface.co/convaiinnovations/laya/tree/1c5edc17a7acd8701df6fc341c0d179f1c62c982
- Paquete multilingüe: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Paquete inglés: https://huggingface.co/litert-community/Laya-English-LiteRT
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/litert
- Ejemplo de clasificación zero-shot en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification
- Paper, blog o demo específicos de esta conversión: no disponible
