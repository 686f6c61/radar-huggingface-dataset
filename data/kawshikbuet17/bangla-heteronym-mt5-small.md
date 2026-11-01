# kawshikbuet17/bangla-heteronym-mt5-small

## Resumen

El modelo `kawshikbuet17/bangla-heteronym-mt5-small` es un ajuste fino de `google/mt5-small` (300 millones de parámetros) desarrollado por el usuario kawshikbuet17 para resolver un problema específico del bengalí: la desambiguación de heterónimos u homógrafos, palabras que se escriben igual pero se pronuncian de forma distinta según el contexto. El modelo recibe una frase con la palabra marcada y devuelve la lectura correcta, expresada como una reescritura en escritura bengalí, para alimentar la fase de grafema-a-fonema de un sistema de texto a voz.

La relevancia es acotada pero clara: se trata de un componente de un pipeline TTS en bengalí, no de un modelo de propósito general. Cubre los heterónimos del conjunto de datos `bangla-heteronyms` y se integra mediante un repositorio auxiliar de GitHub que aporta la clase `Predictor` y los métodos `phoneticize`, `predict` y sus variantes por lotes. Su arquitectura es un transformer encoder-decoder estándar (T5) con tokenizador SentencePiece, y el idioma soportado es únicamente el bengalí.

El propio autor advierte de que el modelo quedó duodécimo de doce en precisión media sobre el conjunto de prueba de su benchmark, y recomienda para la mayoría de usos un clasificador BanglaBERT alternativo (99,46 % de precisión y 12,5 ms por frase en una T4 frente a los 308 ms de este checkpoint). Por tanto, debe evaluarse como una pieza experimental dentro de un ecosistema mayor, con licencia Apache 2.0 y un rendimiento limitado fuera de las palabras vistas en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), ajuste fino de `google/mt5-small` |
| Parametros totales | 300.176.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo procesa una frase completa por inferencia; no se documenta el límite) |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors en fp32; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | Bengalí (`bn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/mt5-small`, un transformer encoder-decoder de la familia T5 con tokenizador SentencePiece multilingüe. La tarea se formula como una reescritura de secuencia completa: la entrada tiene el formato `phonetic: <frase con la palabra marcada entre @>`, y la salida es la misma frase con la lectura correcta insertada en esa posición. El tokenizador T5 no conserva el ZWNJ (zero-width non-joiner), por lo que este se elimina de la entrada y se reinserta al mapear la palabra generada de vuelta a la lectura canónica del conjunto de datos.

El ajuste fino se realizó sobre 14 frases por lectura del conjunto `kawshikbuet17/bangla-heteronyms`, con AdamW, tasa de aprendizaje 3e-4, tamaño de lote 16, precisión fp32, un máximo de 15 épocas y parada temprana sobre la precisión de desarrollo, en una única GPU Tesla T4. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens de entrenamiento más allá de esa cifra de frases por lectura. El autor señala que el modelo seguía mejorando al alcanzar el límite de 15 épocas, lo que sugiere que un entrenamiento más largo podría incrementar la precisión.

## Capacidades

- Desambiguación de heterónimos en bengalí: dada una frase y una palabra homógrafa, devuelve la lectura correcta según el contexto sintáctico y semántico.
- Reescritura fonética de frases completas: `phoneticize` sustituye todas las apariciones de heterónimos conocidos por su lectura y deja intacto el resto del texto.
- Salida detallada con posiciones y confianza: `phoneticize_detailed` devuelve, además del texto reescrito, la posición, la predicción y la probabilidad media de los tokens generados para cada heterónimo.
- Predicción de una palabra concreta: `predict` resuelve la primera aparición de una palabra en una frase y lanza `ValueError` si la palabra no está en el conjunto de datos.
- Marcado explícito de ocurrencias: `predict_marked` y `phoneticize_marked` permiten señalar con corchetes la aparición exacta que se quiere resolver cuando la palabra aparece varias veces.
- Procesamiento por lotes: todas las operaciones tienen variantes `_batch` que agrupan las entradas en una sola pasada por el modelo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. Es un componente monolítico de desambiguación léxica.

## Casos de uso

- Fase de grafema-a-fonema en un sistema TTS en bengalí: el modelo recibe la frase normalizada y devuelve las lecturas de los heterónimos, que el sintetizador vocal utiliza para generar el audio correcto. Es su propósito original y el escenario para el que fue entrenado.
- Preprocesado de corpus para entrenamiento de modelos de voz: permite anotar la pronunciación de homógrafos en transcripciones antes de alinear texto y audio, reduciendo errores en la fase de entrenamiento acústico.
- Lectura asistida y accesibilidad: integrado en un lector de pantalla que convierta texto bengalí en voz, resuelve ambigüedades como কর (impuesto) frente a করো (haz), que de otro modo producirían una pronunciación incorrecta.
- Verificación de pronunciación en herramientas de aprendizaje de idiomas: dado un texto y una palabra, `predict` devuelve la lectura esperada y sirve como referencia para comparar con la producción del estudiante.
- Análisis lingüístico y anotación de corpus: `phoneticize_detailed` aporta posiciones y confianzas que permiten filtrar anotaciones dudosas y construir conjuntos de datos etiquetados con criterio de calidad.
- Prototipado rápido de pipelines TTS en entornos con recursos limitados: al ocupar 1,2 GB en fp32 y ejecutarse en CPU (924 ms por frase con 4 hilos), puede desplegarse sin GPU para pruebas de integración.
- Evaluación comparativa de estrategias de desambiguación: el repositorio de benchmark y las salidas de ejemplo permiten contrastar este enfoque generativo con clasificadores como BanglaBERT sobre las mismas frases.

## Benchmarks y rendimiento

Conjunto de prueba del split principal: 1.104 frases, 3 por lectura.

| Metrica | Resultado |
|---|---|
| Precisión (checkpoint semilla 44) | 93,48 % |
| Macro-F1 (checkpoint semilla 44) | 93,02 % |
| Precisión media de 3 semillas | 93,36 ± 0,21 % |
| Macro-F1 medio de 3 semillas | 92,99 ± 0,18 % |
| Precisión sobre 37 palabras no vistas (entrenamiento sin ellas, media de 3 semillas) | 51,7 % |
| Posición en el benchmark por precisión media | 12 de 12 |

Rendimiento de inferencia (frase completa, tamaño de lote 1):

| Entorno | Latencia |
|---|---|
| Tesla T4, fp32 | 308 ms por frase |
| CPU, 4 hilos | 924 ms por frase |
| Tesla T4, lote de 32 | ~42 frases por segundo |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,2 GB; con activaciones y memoria del runtime, un presupuesto de 2 a 3 GB de VRAM es suficiente en fp32. No se documentan variantes cuantizadas.
- GPU recomendadas: el autor valida el modelo en una Tesla T4. Cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; modelos mayores como A100 o H100 no aportan ventaja relevante dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM. También funciona en CPU con 4 hilos a 924 ms por frase.
- Opciones de despliegue: la carga estándar es mediante `Predictor.load` del repositorio `bangla-heteronym-benchmark`, que descarga el snapshot con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un encoder-decoder T5 con lógica de postprocesado específica (marcado con `@`, gestión de ZWNJ), la integración requiere el código del repositorio.
- Latencia y throughput: 308 ms por frase en T4 fp32 y unas 42 frases por segundo con lote de 32 en la misma GPU. El autor señala que es lento en comparación con el clasificador BanglaBERT (12,5 ms por frase en T4), debido a la generación token a token de la frase completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en el benchmark | Latencia en T4 | Licencia |
|---|---|---|---|---|---|
| `kawshikbuet17/bangla-heteronym-mt5-small` | 300 M | No disponible | 93,36 % (media de 3 semillas) | 308 ms por frase | Apache 2.0 |
| `kawshikbuet17/bangla-heteronym-banglabert` | No disponible en la información | No disponible | 99,46 % | 12,5 ms por frase | No disponible en la información |
| `google/mt5-small` (modelo base) | 300 M | No disponible | No aplica (no entrenado para la tarea) | No disponible | Apache 2.0 |

El autor indica que el checkpoint BanglaBERT es la opción recomendada para la mayoría de usos por precisión y latencia. No se dispone de datos de otros modelos del benchmark en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre los heterónimos presentes en el conjunto `bangla-heteronyms`; para una palabra fuera de ese vocabulario, `predict` lanza `ValueError` y el modelo no puede resolverla.
- Puede devolver una lectura que no figure en la lista de lecturas válidas de la palabra, según advierte el autor.
- Rendimiento muy inferior en palabras no vistas: 51,7 % de precisión en las 37 palabras retenidas del benchmark, frente al 93,36 % en el conjunto de prueba principal. La generalización léxica es limitada.
- Las frases del conjunto de datos fueron redactadas específicamente para la tarea, por lo que la precisión sobre texto real puede ser menor que la reportada.
- Ocupa la última posición (12 de 12) del benchmark del autor por precisión media, y es sustancialmente más lento que la alternativa BanglaBERT (308 ms frente a 12,5 ms por frase en T4).
- El modelo seguía mejorando al alcanzar el límite de 15 épocas; el rendimiento publicado no representa necesariamente el máximo alcanzable con más entrenamiento.
- Idioma único: solo bengalí. No debe esperarse transferencia a otras lenguas, pese a partir de un modelo multilingüe.
- Riesgo de alucinación léxica: al generar la frase completa token a token, puede alterar o introducir texto fuera de la posición marcada, aunque los ejemplos muestran que el resto de la frase se preserva.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda los sesgos del corpus de frases sintéticas del conjunto de datos; no se documentan evaluaciones de sesgo.
- La integración requiere el código del repositorio de GitHub para el marcado de entrada y la reinyección del ZWNJ; no es un modelo que pueda usarse directamente con `pipeline` de Transformers sin ese envoltorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawshikbuet17/bangla-heteronym-mt5-small
- Conjunto de datos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark y código de inferencia: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo base: https://huggingface.co/google/mt5-small
- Alternativa recomendada por el autor: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
