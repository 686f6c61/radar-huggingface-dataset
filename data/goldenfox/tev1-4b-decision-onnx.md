# goldenfox/tev1-4b-decision-onnx

## Resumen

tev1-4b-decision-onnx es la exportación a ONNX de togethercomputer/Tev1-4B-experimental, un ajuste fino de 4.000 millones de parámetros sobre la arquitectura Qwen3.5 orientado a toma de decisiones ("system-one" y "decision" son las etiquetas declaradas por el autor). No es un modelo de chat general: está diseñado para recibir un estado en formato JSON junto a un esquema de opciones y devolver una única letra correspondiente a la opción seleccionada, leída directamente de los logits del siguiente token. La exportación la firma el usuario goldenfox y su propósito explícito es la inferencia en navegador mediante ONNX Runtime Web con el proveedor de ejecución WebGPU (onnxruntime-web 1.30).

El modelo se ha convertido con onnxruntime-genai 0.17.1 usando cuantización int4 (configuración `k_quant`, con precisión mixta en algunas matmuls a int8) y recortes deliberados respecto al original: se poda la cabeza de lenguaje (`prune_lm_head=true`) y se excluyen las cabezas de predicción multi-token (`exclude_mtp=true`). La longitud de contexto se fijó en 8.192 posiciones antes de la exportación. El grafo devuelve logits solo para la última posición de entrada, y expone los estados recurrentes (Gated DeltaNet) y de KV como entradas y salidas `past.*` / `present.*`, lo que permite calcular una vez un prefijo de prompt compartido y reutilizarlo entre consultas.

Su relevancia actual es acotada pero específica: demuestra que un pipeline de decisión de 4B puede ejecutarse íntegramente en el navegador sin backend, con el repositorio ocupando 4,2 GB (datos externos partidos en ficheros de como máximo 1.800.000.000 bytes). La única validación publicada es un acuerdo del 7/9 en las opciones principales frente a la distribución Ollama `tev1:4b` sobre 9 prompts de juego, con una distancia de variación total media de 0,072 (máxima 0,165), medida con onnxruntime 1.30 sobre CPU EP. El repositorio no tiene descargas ni "likes" y la licencia figura como "other", con los términos definitivos de los pesos ajustados aún por cerrar según la tarjeta del modelo fuente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de texto con atención lineal recurrente (Gated DeltaNet) y estados KV; arquitectura base Qwen3.5 (etiqueta `qwen3_5`). Exportado como grafo ONNX |
| Parametros totales | 4.000 millones aproximadamente (según el nombre del modelo y el tamaño del repositorio; no confirmado explícitamente en la información disponible) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo de mezcla de expertos) |
| Longitud de contexto | 8.192 tokens (`max_position_embeddings` fijado antes de la exportación, tamaño de la caché rotatoria) |
| Tipos de cuantizacion | int4 (`-p int4`, `algo_config=k_quant`) con precisión mixta a int8 en `last_matmul` y `linear_attn` (`matmul_mixed_precision=last_matmul:int8,linear_attn:int8`) |
| Idiomas soportados | No disponible |
| Licencia | other. La tarjeta indica que el modelo base Qwen3.5 es Apache-2.0 y que la licencia de estos pesos ajustados está pendiente de finalizar; la distribución Ollama de los mismos pesos incluye el texto de Apache License 2.0 |
| Formato de pesos | ONNX (onnxruntime, `library_name: onnxruntime`), datos externos partidos en ficheros de hasta 1.800.000.000 bytes |
| Modelo base | togethercomputer/Tev1-4B-experimental (revisión `0b7becf017daa0e5eb222f8ce7483c8c8259c52f`) |
| Tamaño del repositorio | 4,2 GB |
| Herramienta de conversión | onnxruntime-genai 0.17.1, `-p int4 -e webgpu`, opciones `prune_lm_head=true exclude_mtp=true` |
| Proveedor de ejecución objetivo | ONNX Runtime Web, WebGPU EP (onnxruntime-web 1.30) |
| Salida del grafo | Logits únicamente para la última posición de entrada |
| Estados expuestos | Recurrentes (Gated DeltaNet) y KV, como entradas/salidas `past.*` y `present.*` |
| Fecha de creación del repositorio | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5, según la etiqueta `qwen3_5` y la nota de licencia de la propia tarjeta, que atribuye a Qwen3.5 la licencia Apache-2.0. La exportación es de solo decodificador de texto y el grafo ONNX expone estados recurrentes de Gated DeltaNet además de los estados KV convencionales. Ese detalle implica una arquitectura híbrida: parte del cómputo de secuencia se resuelve con atención lineal recurrente (la opción de conversión `matmul_mixed_precision` incluye explícitamente `linear_attn:int8`, lo que confirma la presencia de capas de atención lineal). El modelo fuente incorpora además cabezas de predicción multi-token (MTP, por sus siglas en inglés), que la exportación descarta mediante `exclude_mtp=true`.

La conversión aplicada tiene tres consecuencias funcionales relevantes. Primero, la poda de la cabeza de lenguaje (`prune_lm_head=true`) reduce el peso del artefacto. Segundo, al devolver logits solo de la última posición, el grafo está optimizado para tareas de selección de un único token, no para generación de secuencias largas. Tercero, la exposición de `past.*` / `present.*` habilita el recálculo incremental y la reutilización de un prefijo de prompt común, algo crítico cuando el estado de decisión es voluminoso y se consultan varios campos sobre el mismo contexto.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni el proceso de ajuste fino que dio lugar a Tev1-4B-experimental. La tarjeta del exportador no documenta el entrenamiento, solo la conversión y el formato de prompt.

## Capacidades

- Selección de una opción entre una lista cerrada: recibe `{"context": <estado>, "schema": [...]}` junto a `Requested field: "<nombre>"` y devuelve una única letra correspondiente a la opción elegida.
- Decisión guiada por esquema: el conjunto de respuestas posibles se restringe a los códigos de una letra definidos en el esquema, por lo que la salida es siempre una de las opciones enumeradas.
- Inferencia en navegador: pensado para ONNX Runtime Web con WebGPU EP, sin necesidad de servidor.
- Reutilización de prefijo: los estados `past.*` / `present.*` permiten calcular una vez un contexto compartido y reutilizarlo en consultas posteriores sobre el mismo estado.
- Aislamiento de instrucciones: el prompt del sistema indica explícitamente que el texto dentro de `state` debe tratarse como datos y no como instrucciones.
- Funcionamiento con "thinking" desactivado: el formato de prompt de la plantilla de chat de Qwen3.5 se usa con el modo de razonamiento desactivado.
- Compatibilidad con CPU EP: la medición publicada se realizó con onnxruntime 1.30 sobre CPU EP, además del objetivo WebGPU.
- Generación de texto libre: no documentada como capacidad; el grafo devuelve logits solo de la última posición.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Visión, audio u otras modalidades: no disponibles; la exportación es de solo decodificador de texto.

## Casos de uso

- Toma de decisiones en juegos dentro del navegador: el modelo encaja en un bucle de juego que serializa el estado de la partida en `context`, enumera las acciones legales en `schema` y solicita un campo concreto. La medición publicada se hizo precisamente sobre 9 prompts de juego, y al ejecutarse con WebGPU no requiere backend ni claves de API.
- Enrutado de acciones en agentes: usar el modelo como clasificador que elige una etiqueta de una lista cerrada (por ejemplo, qué herramienta invocar) leyendo directamente los logits de los códigos de una letra, sin generar texto libre que después haya que parsear.
- Extracción de campos con esquema cerrado: dado un documento o estado estructurado y un esquema de opciones por campo, resolver cada campo en llamadas sucesivas reutilizando el prefijo ya calculado en `past.*`, lo que reduce el coste por consulta.
- Etiquetado y clasificación en producción con umbral propio: al exponer los logits del siguiente token, el sistema anfitrión puede calcular una distribución sobre las opciones, aplicar un umbral de confianza y abstenerse cuando la decisión no sea suficientemente clara, en lugar de aceptar ciegamente la letra más probable.
- Inferencia local y sin red en aplicaciones web: el artefacto ONNX puede empaquetarse con la propia aplicación y ejecutarse en el dispositivo del usuario, lo que evita enviar estados potencialmente sensibles a un servidor.
- Sustitución o respaldo de la distribución Ollama: dado el acuerdo medido (7/9 opciones principales idénticas, distancia de variación total media de 0,072), puede emplearse como alternativa en navegador al pipeline `tev1:4b` de Ollama cuando no se dispone de un entorno local con Ollama.
- Validación de pipelines de decisión y pruebas de regresión: la métrica de acuerdo con la distribución Ollama sirve como referencia para comprobar que una reexportación o un cambio de cuantización no degrada las decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica publicada es un acuerdo de decisiones frente a la distribución Ollama del mismo modelo:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Opciones principales idénticas a Ollama `tev1:4b` | 7 de 9 | 9 prompts de juego |
| Distancia de variación total media | 0,072 | Sobre las 9 comparaciones |
| Distancia de variación total máxima | 0,165 | Peor caso observado |
| Entorno de medición | onnxruntime 1.30, CPU EP | Medido el 2026-09-30 |

No hay datos de latencia, throughput ni consumo de memoria publicados por el autor.

## Requisitos de hardware

- Tamaño en disco: 4,2 GB de repositorio, con los datos externos ONNX partidos en ficheros de hasta 1.800.000.000 bytes. Conviene verificar el espacio disponible antes de la descarga.
- Memoria estimada para los pesos: la cuantización es int4 con algunas matmuls en int8, por lo que la huella de pesos de un modelo de 4B debería situarse en el entorno de los 2-3 GB; el tamaño real del repositorio (4,2 GB) es superior a esa estimación, presumiblemente por la precisión mixta y el reparto en ficheros. No se dispone de cifras oficiales de memoria en ejecución.
- Memoria adicional: hay que sumar los estados recurrentes de Gated DeltaNet y los estados KV para una ventana de hasta 8.192 posiciones. No se publica el consumo medido.
- GPU de consumo: por tamaño, el artefacto debería caber en GPU de consumo con 8 GB o más de VRAM, pero no hay confirmación oficial ni mediciones publicadas; trátese como estimación.
- CPU: la medición de acuerdo se realizó con el proveedor de ejecución CPU de onnxruntime 1.30, de modo que el modelo es funcional sin GPU, a costa de una latencia presumiblemente mayor (no medida).
- Objetivo principal: navegador con WebGPU mediante onnxruntime-web 1.30.
- Opciones de despliegue: ONNX Runtime Web (WebGPU EP y CPU EP). No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI; el formato es ONNX con datos externos, no GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldenfox/tev1-4b-decision-onnx | ~4B | 8.192 tokens | ONNX int4 (WebGPU) | other (pendiente de finalizar; el autor incluye el texto de Apache 2.0) | HuggingFace, 0 descargas, 0 likes |
| tev1:4b (distribución Ollama de los mismos pesos) | ~4B | No disponible | No disponible (distribución Ollama) | Apache License 2.0 según el texto incluido por el autor | Referenciada en la tarjeta; URL no disponible |
| togethercomputer/Tev1-4B-experimental | ~4B | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace (modelo fuente) |
| Qwen3.5 (modelo base de la arquitectura) | No disponible | No disponible | No disponible | Apache-2.0 según la tarjeta del exportador | No disponible en la información proporcionada |

La única comparación cuantitativa disponible es la del propio exportador frente a la distribución Ollama, con 7/9 coincidencias en las opciones principales y una distancia de variación total media de 0,072. No hay datos comparativos frente a otros modelos de decisión o clasificación.

## Limitaciones y advertencias

- Licencia en estado indeterminado: la tarjeta clasifica el modelo como "other" y declara que la licencia de los pesos ajustados "está pendiente de finalizar". Aunque el autor incluye el texto de Apache License 2.0, corresponde verificar los términos vigentes en el repositorio fuente antes de cualquier uso comercial.
- Riesgo de inyección de prompt: el propio autor mitiga parcialmente este punto con la instrucción de tratar el contenido de `state` como datos y no como instrucciones, lo que indica que la superficie de ataque existe. Cualquier texto controlado por el usuario que se inserte en el estado debe sanearse.
- No es un modelo de propósito general: el grafo devuelve logits solo para la última posición de entrada y el formato de prompt espera una única letra como respuesta. Usarlo para generación de texto libre, resumen o diálogo abierto queda fuera de su diseño.
- Sin benchmarks publicados: no hay MMLU, HumanEval ni evaluaciones de seguridad. La única métrica es un acuerdo del 7/9 sobre 9 prompts de juego, una muestra muy reducida y de un único dominio.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, repositorio creado el 2026-09-30. No existen informes independientes de comportamiento en producción.
- Idiomas no declarados: se desconoce si el ajuste fino conserva capacidades multilingües del modelo base y con qué calidad.
- Límite de contexto de 8.192 tokens: fijado explícitamente en la exportación como tamaño de la caché rotatoria. Estados más largos no están soportados y habría que reexportar.
- Modificaciones respecto al original: `prune_lm_head=true` y `exclude_mtp=true` alteran el grafo frente a Tev1-4B-experimental, por lo que el comportamiento puede diferir del modelo fuente más allá de lo que refleja la comparación con la distribución Ollama.
- Medición solo en CPU EP: el dato de acuerdo (7/9, distancia de variación total media 0,072) se obtuvo con onnxruntime 1.30 sobre CPU. No hay verificación equivalente sobre WebGPU, que es el objetivo declarado del artefacto.
- Entrenamiento no documentado: sin información sobre datos, sesgos, filtrado ni alineación, no es posible evaluar sesgos conocidos ni riesgo de alucinación más allá del comportamiento observado.
- Restricciones de empaquetado: los ficheros de datos externos de hasta 1.800.000.000 bytes condicionan la carga en navegador y los límites de algunos entornos de ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goldenfox/tev1-4b-decision-onnx
- Modelo base: https://huggingface.co/togethercomputer/Tev1-4B-experimental
- Repositorio fuente del ajuste fino (junto con la revisión citada): https://huggingface.co/togethercomputer/Tev1-4B-experimental/tree/0b7becf017daa0e5eb222f8ce7483c8c8259c52f
- Distribución Ollama `tev1:4b`: referenciada en la tarjeta del modelo; URL no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo.
