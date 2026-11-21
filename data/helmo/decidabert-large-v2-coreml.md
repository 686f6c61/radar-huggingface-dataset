# helmo/DecidaBERT-large-v2-coreml

## Resumen

DecidaBERT-large-v2-coreml es la conversión a Core ML de DecidaBERT-large-v2, un codificador tipo ModernBERT especializado en lo que su autor denomina "decisiones tipadas": dado un estado (texto de entrada) y un conjunto de preguntas con formato fijo (respuestas sí/no, elección entre opciones o puntuación), el modelo devuelve una distribución de probabilidad y una confianza calibrada para cada pregunta en una única pasada hacia delante. No genera texto libre: actúa como un clasificador multi-cabeza que se lee en las posiciones de los marcadores `[MASK]` del diseño de entrada.

El paquete está pensado para inferencia totalmente local en iPhone, iPad y Mac mediante Core ML, sin enviar datos fuera del dispositivo. Se distribuye como un ML Program multifunción en float16 con cinco longitudes fijas (512, 1024, 2048, 4096 y 8192 tokens) que comparten un único juego de pesos de 810 MB. Requiere iOS 18 / macOS 15 o superior y, según las pruebas del autor, debe cargarse con `.cpuAndGPU` porque el Neural Engine rechaza el paquete multifunción.

La relevancia de esta ficha es doble: por un lado documenta un patrón poco habitual de "modelo de decisión" (system-one) frente a los LLM generativos; por otro, muestra una conversión Core ML con validación numérica explícita contra el modelo PyTorch original, incluida una comparación de precisión y latencia que permite evaluar su viabilidad en producción móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con tres cabezas de clasificación (yes/no, choice, score) plegadas en el grafo; full-attention y sliding-window attention (ventana ±64) |
| Parametros totales | no disponible (pesos del paquete: 810 MB en float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8192 tokens (`max_len` 8192); funciones fijas de 512, 1024, 2048, 4096 y 8192 |
| Tipos de cuantizacion | float16 (publicado); se probaron pesos de 8 bits (405 MB) y se descartaron por pérdida de precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (ML Program multifunción), float16; incluye `tokenizer.json` y `decida.json` |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT con atención completa en algunas capas y atención de ventana deslizante (ventana ±64) en otras. En la conversión a Core ML, las capas de atención completa usan `scaled_dot_product_attention` nativo con máscara de padding de claves, mientras que las capas de ventana deslizante atienden por bloques de 128 tokens (bloque anterior, propio y siguiente), lo que reproduce exactamente el comportamiento y evita una máscara de banda L × L. Las tres cabezas de decisión se integran en el grafo y emiten logits `[1, 3, L]` en cada posición.

Los detalles de entrenamiento del modelo fuente (número de tokens, composición del dataset, uso de RLHF/DPO o calibración) no están disponibles en la información proporcionada. El único dato sobre datos es el dataset asociado, `LocalLLaMA/typed-decisions`, y la existencia de una temperatura de calibración por cabeza en `decida.json`. La conversión se realizó con PyTorch 2.7.0, transformers 5.24 y coremltools 9.0, y el autor verificó que el padding a 512, 1024 o 4096 tokens no altera las respuestas en PyTorch (diferencia máxima de probabilidad de 2,4e-6).

## Capacidades

- Clasificación de decisiones tipadas: respuestas sí/no (`noul`), elección entre opciones (`choice`) y puntuación (`score`) sobre un estado de entrada.
- Salida de distribución de probabilidad y confianza calibrada por pregunta en una sola pasada, sin generación de texto.
- Procesamiento de entradas largas de hasta 8192 tokens, útil para registros de incidentes y documentos extensos.
- Inferencia completamente en dispositivo (on-device) con Core ML, sin llamadas a servicios externos.
- Multifunción: cinco longitudes fijas en un único paquete con pesos compartidos, lo que permite elegir la longitud mínima que encaje con cada caso.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento multi-paso; es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de incidentes en movilidad: enviar un registro de incidente (hasta 8192 tokens) y un conjunto de preguntas tipadas (¿requiere escalado?, ¿qué equipo es responsable?) para obtener decisiones con confianza calibrada en el propio dispositivo, sin filtrar datos sensibles.
- Asistencia clínica o legal en local: formular preguntas de sí/no y de elección sobre notas de caso y obtener una distribución de probabilidad auditable, adecuada para flujos donde no se permite enviar texto a la nube.
- Enrutado de tickets de soporte: clasificar cada ticket con preguntas de elección (categoría, prioridad, equipo) en una sola pasada de 512 o 1024 tokens, con latencias de 25 a 43 ms en un M3 Ultra.
- Extracción de decisiones estructuradas en pipelines de datos: sustituir heurísticas por un modelo que devuelve probabilidades calibradas por pregunta, facilitando umbrales y revisión humana selectiva.
- Aplicaciones iOS/iPadOS de campo: inspección, formularios inteligentes o diagnóstico asistido que funcionan sin conectividad, aprovechando el paquete Core ML y el tokenizador incluido.
- Validación y control de calidad: usar la confianza calibrada para decidir cuándo derivar un caso a un humano o a un LLM generativo, reduciendo coste y latencia en la mayoría de casos.
- Investigación en modelos "system-one": comparar decisiones de un solo paso frente a razonamiento generativo multi-paso en tareas de clasificación con preguntas tipadas.

## Benchmarks y rendimiento

Evaluación sobre el split `test` de Typed Decisions (400 casos, 2000 preguntas), cada caso con la longitud mínima que le encaja, unidades CPU + GPU en un Apple M3 Ultra:

| Metrica | PyTorch (float32) | Core ML (float16) |
|---|---|---|
| Precisión frente a etiqueta gold | 0.7880 | 0.7885 |
| Respuesta top idéntica a PyTorch | — | 1997 / 2000 (99,85%) |
| Diferencia máxima de probabilidad | — | 0.0025 |

Entradas largas (demos del Space original y un registro de incidentes estirado hasta 7684 tokens): 52 de 52 respuestas idénticas a PyTorch, diferencia máxima de probabilidad de 0.0011. Los pesos de 8 bits (405 MB) se descartaron: 99,40% de respuesta top idéntica y diferencia máxima de 0.023.

Rendimiento del paquete Core ML en M3 Ultra (CPU + GPU):

| Longitud | Tiempo por petición | Memoria pico |
|---|---|---|
| 512 | 25 ms | 0.69 GB |
| 1024 | 43 ms | 0.81 GB |
| 2048 | 83 ms | 1.17 GB |
| 4096 | 169 ms | 1.73 GB |
| 8192 | 392 ms | 2.84 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM/memoria: 0.69 GB a 512 tokens, 0.81 GB a 1024, 1.17 GB a 2048, 1.73 GB a 4096 y 2.84 GB a 8192 (memoria pico medida en M3 Ultra).
- GPU recomendadas: Apple Silicon (M-series) con carga `.cpuAndGPU`; el autor probó en M3 Ultra. No hay datos de rendimiento en iPhone ni iPad (pendientes de medir).
- Neural Engine: no compatible con este paquete multifunción; `.cpuAndNeuralEngine` falla al cargar todas las funciones y `.all` falla en `len_4096` y `len_8192`. En una prueba de función única, el Neural Engine fue más lento (69 ms a 512 tokens frente a 25 ms en GPU).
- Requisitos de sistema: iOS 18 / macOS 15 o superior.
- Cabe en hardware de consumo Apple: sí, con consumo de memoria por debajo de 3 GB incluso a 8192 tokens.
- Opciones de despliegue: Core ML (`.mlpackage`); no se distribuyen pesos GGUF ni safetensors en este repositorio. Para vLLM, llama.cpp, Ollama o TGI habría que usar el modelo base `helmo/DecidaBERT-large-v2`.
- Latencia y throughput: 25 ms por petición a 512 tokens y 392 ms a 8192 en M3 Ultra; el throughput no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Precisión (Typed Decisions test) | Licencia | Despliegue |
|---|---|---|---|---|---|
| DecidaBERT-large-v2-coreml | Encoder de decisión (Core ML) | 8192 | 0.7885 (Core ML float16) | Apache-2.0 | Core ML on-device |
| DecidaBERT-large-v2 (PyTorch) | Encoder de decisión | 8192 | 0.7880 (float32) | Apache-2.0 | PyTorch, servidor/GPU |
| LLM generativo pequeño (p. ej. 1-3B) | Decoder generativo | variable | no disponible | variable | vLLM, llama.cpp, Ollama |

La comparación con LLM generativos no es directa: DecidaBERT no produce texto y resuelve las preguntas en una sola pasada, con latencias de decenas de milisegundos, mientras que un LLM generativo requiere decodificación token a token. No se dispone de datos de benchmarks comparables entre ambos enfoques en la información proporcionada.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no puede redactar respuestas, mantener conversaciones ni ejecutar herramientas.
- Dependencia del formato de entrada: los logits deben leerse en las posiciones de los marcadores `[MASK]` del diseño de entrada; un formato incorrecto invalida las salidas.
- Longitudes fijas: solo admite 512, 1024, 2048, 4096 y 8192 tokens; hay que elegir la función adecuada y rellenar con `[PAD]` (50283) y máscara 0.
- Restricción de carga en Core ML: el paquete no funciona en el Neural Engine y debe cargarse con `.cpuAndGPU`; el mensaje de error del fallo es engañoso.
- Precisión limitada: la precisión frente a etiqueta gold es de 0.7885, por lo que un 21% de las preguntas no coinciden con la etiqueta; la confianza calibrada debe usarse para umbrales y revisión humana.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingüe sin evaluación.
- Sesgos y alucinación: no hay información sobre sesgos del modelo fuente; al no generar texto, el riesgo de alucinación se traslada a decisiones mal calibradas, no a contenido inventado.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y verificar las condiciones del modelo base.
- Rendimiento en iPhone/iPad no medido: las cifras de latencia y memoria solo están validadas en un Mac con M3 Ultra.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helmo/DecidaBERT-large-v2-coreml
- Modelo base: https://huggingface.co/helmo/DecidaBERT-large-v2
- Dataset: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Scripts de conversión: incluidos en el repositorio, carpeta `conversion/`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
