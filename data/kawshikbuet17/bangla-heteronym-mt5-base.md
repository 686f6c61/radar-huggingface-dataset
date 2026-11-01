# kawshikbuet17/bangla-heteronym-mt5-base

## Resumen

Bangla Heteronym Reader es un ajuste fino de `google/mt5-base` desarrollado por kawshikbuet17 para resolver un problema muy concreto del procesamiento del bengalí: la desambiguación de heterónimos, es decir, palabras que se escriben igual pero se pronuncian de forma distinta según el contexto. El modelo recibe una frase en bengalí con la palabra marcada y devuelve la lectura correcta en forma de respelling en escritura bengalí, pensada para alimentar la etapa de grafema-a-fonema de un sistema de texto-a-voz.

El modelo tiene 582.401.280 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 2,4 GB. Está entrenado exclusivamente sobre el dataset `kawshikbuet17/bangla-heteronyms` y solo cubre el idioma bengalí. Su relevancia es acotada pero clara: los sistemas TTS en bengalí fallan sistemáticamente en estos casos, y este checkpoint ofrece una solución funcional aunque con limitaciones importantes de velocidad y generalización.

La model card del propio autor es inusualmente honesta: reconoce que el modelo quedó décimo de doce en su propio benchmark y que recomienda una alternativa basada en BanglaBERT (99,46 % de accuracy y 12,5 ms por frase en una T4) para la mayoría de usos. Este checkpoint debe entenderse, por tanto, como una pieza de investigación o como una opción secundaria dentro de un pipeline TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5-base, text-to-text) |
| Parametros totales | 582.401.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor reporta inferencia en fp32) |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `google/mt5-base`, un transformer encoder-decoder con tokenizador SentencePiece. La tarea se formula como text-to-text: la entrada es el prefijo `phonetic: ` seguido de la frase con la palabra heterónima delimitada por `@`, y la salida es la frase completa reescrita con la lectura correcta en la posición marcada. Dado que el tokenizador de T5 no preserva el ZWNJ (zero-width non-joiner), este se elimina de la entrada y la palabra generada se mapea de vuelta a la lectura con su ZWNJ visible (por ejemplo, `কর্‌`).

El entrenamiento se realizó sobre 14 frases por cada lectura del dataset `bangla-heteronyms`, con AdamW, learning rate 3e-4, batch size 16, precisión fp32, un máximo de 15 épocas con early stopping sobre la accuracy de desarrollo y una única GPU Tesla T4. No se reporta el número total de tokens de entrenamiento ni el uso de RLHF o DPO, que no aplican a este tipo de tarea. El autor señala que el modelo seguía mejorando al alcanzar el límite de 15 épocas, por lo que un entrenamiento más largo podría mejorar los resultados.

## Capacidades

- Desambiguación de heterónimos en bengalí: dado un par (frase, palabra), devuelve la lectura correcta de la palabra según el contexto.
- Reescritura fonética de frases completas: `phoneticize` sustituye todos los heterónimos presentes en el texto por su lectura, dejando el resto intacto.
- Salida detallada con confianza: `phoneticize_detailed` devuelve, además del texto, la posición, la predicción y la probabilidad media de los tokens generados para cada heterónimo.
- Marcado explícito de palabras: `predict_marked` y `phoneticize_marked` permiten indicar con corchetes qué ocurrencia concreta se debe resolver cuando la palabra aparece varias veces.
- Procesamiento por lotes: todas las operaciones tienen variantes `_batch` que agrupan las entradas en una sola pasada por el modelo.
- Consulta del inventario de lecturas: `model.hconfig["candidates"]` expone las lecturas conocidas por palabra.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo especializado de una sola tarea.

## Casos de uso

- Preprocesado de pipelines TTS en bengalí: el modelo se coloca antes del módulo de grafema-a-fonema para resolver las palabras ambiguas y evitar pronunciaciones incorrectas en la síntesis de voz.
- Generación de audiolibros y contenido narrado: permite procesar lotes de frases con `phoneticize_batch` y revisar manualmente las salidas con baja confianza usando `phoneticize_detailed`.
- Sistemas de accesibilidad y lectores de pantalla: integrado en la cadena de lectura, corrige la pronunciación de heterónimos frecuentes como `কর` o `বল` en tiempo de ejecución.
- Anotación asistida de corpus: `phoneticize_detailed` proporciona posiciones y confidencias que pueden usarse para priorizar la revisión humana en proyectos de etiquetado fonético.
- Investigación lingüística sobre homografía en bengalí: el modelo y su dataset asociado sirven como línea base reproducible para estudiar la ambigüedad léxica en esta lengua.
- Evaluación comparativa de enfoques: al compartir frases de prueba con el resto de modelos del benchmark del autor, permite contrastar arquitecturas generativas frente a clasificadores tipo BanglaBERT en la misma tarea.
- Demostraciones y prototipos académicos: su licencia Apache 2.0 y su integración con la librería del repositorio facilitan su uso en entornos docentes y pruebas de concepto.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 frases, 3 por lectura.

| Metrica | Este checkpoint (seed 44) | Media de 3 seeds |
|---|---|---|
| Accuracy | 95,92 % | 96,11 ± 0,16 % |
| Macro-F1 | 95,72 % | 95,99 ± 0,24 % |

Rendimiento en frases con palabras no vistas durante el entrenamiento: 58,1 % de accuracy (media de 3 seeds) en las 37 palabras reservadas del benchmark.

Velocidad por frase (batch size 1, pipeline completo): 436 ms en Tesla T4 con fp32 y 1.759 ms en 4 hilos de CPU. En GPU alcanza aproximadamente 24 frases por segundo con batch size 32.

Posición en el benchmark del autor: décimo de doce modelos por accuracy media en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 582 millones de parámetros en fp32 los pesos ocupan aproximadamente 2,3 GB, por lo que se necesita margen adicional para activaciones y la caché del decodificador.
- GPU recomendadas: el autor valida el modelo en una Tesla T4; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente en fp32.
- GPU de consumo: cabe en tarjetas consumer con 8 GB o más, como RTX 3060, RTX 3070, RTX 4060 o RTX 4090.
- Opciones de despliegue: la model card indica que debe cargarse mediante la clase `Predictor` del repositorio `bangla-heteronym-benchmark`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 436 ms por frase en T4 con fp32, 1.759 ms por frase en CPU con 4 hilos y unas 24 frases por segundo en GPU con batch size 32.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Accuracy en test | Latencia (T4) | Licencia |
|---|---|---|---|---|---|
| bangla-heteronym-mt5-base (este) | 582 M | Generativo (mT5-base) | 95,92 % (seed 44) | 436 ms/frase | Apache 2.0 |
| bangla-heteronym-banglabert | no disponible | Clasificador | 99,46 % | 12,5 ms/frase | no disponible |

El autor recomienda explícitamente `bangla-heteronym-banglabert` para la mayoría de usos, al ser más preciso y unas 35 veces más rápido. No se dispone de datos de los otros diez modelos del benchmark en la información proporcionada.

## Limitaciones y advertencias

- Solo resuelve los heterónimos presentes en el dataset de entrenamiento; para palabras fuera de él, `predict` lanza un `ValueError`.
- Puede devolver una lectura que no figure en la lista de lecturas válidas de la palabra.
- Las frases de entrenamiento fueron redactadas específicamente para el dataset, por lo que la accuracy en texto real puede ser inferior a la reportada.
- Generalización débil a palabras no vistas: 58,1 % de accuracy en las 37 palabras reservadas del benchmark.
- Inferencia lenta por generación token a token: 436 ms por frase en T4 frente a 12,5 ms del clasificador BanglaBERT.
- El entrenamiento se detuvo en el límite de 15 épocas con el modelo aún en mejora, lo que sugiere que los resultados no están saturados.
- Sin datos publicados sobre sesgos, riesgo de alucinación en sentido amplio ni comportamiento fuera del dominio bengalí.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base `google/mt5-base`; conviene verificar las condiciones de este último.
- Requiere el código del repositorio del autor para cargarse; no es un modelo plug-and-play con las APIs estándar de transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawshikbuet17/bangla-heteronym-mt5-base
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark y código de inferencia: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo alternativo recomendado: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Modelo base: https://huggingface.co/google/mt5-base
