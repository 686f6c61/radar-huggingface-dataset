# kawshikbuet17/bangla-heteronym-xlm-roberta-base

## Resumen

El modelo `bangla-heteronym-xlm-roberta-base` es un clasificador de desambiguación de heterónimos en bengalí (bangla), desarrollado por Kawshik Kumar Paul (BUET) y publicado en HuggingFace. Resuelve un problema específico del procesamiento del bengalí: muchas palabras se escriben igual pero se pronuncian de forma distinta según el contexto sintáctico, lo que rompe los sistemas de texto-a-voz (TTS) y de grafema-a-fonema (G2P). El modelo recibe una frase con la palabra marcada y devuelve la reescritura fonética correcta de esa palabra.

Técnicamente es un fine-tuning de `FacebookAI/xlm-roberta-base` (278 millones de parámetros) con una cabeza lineal personalizada que puntúa las lecturas candidatas de cada heterónimo. Está entrenado sobre el dataset `kawshikbuet17/bangla-heteronyms` y alcanza un 97,55 % de exactitud y un 97,42 % de macro-F1 en el conjunto de test del split principal (1.104 frases). No es un modelo generativo ni un LLM: es un componente especializado para integrarse en el front-end de un pipeline TTS en bengalí.

Su relevancia es acotada pero clara: el bengalí tiene un sistema de escritura con numerosos homógrafos y la desambiguación contextual es un cuello de botella real en síntesis de voz. El autor, sin embargo, recomienda para la mayoría de usos su variante `bangla-heteronym-banglabert` (99,46 % de exactitud), lo que sitúa a este checkpoint como una opción secundaria dentro de su propio benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza lineal de clasificación sobre el token marcador de apertura |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de xlm-roberta-base; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecución en fp16 y CPU) |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | FacebookAI/xlm-roberta-base |
| Tarea | Clasificación de lecturas de heterónimos (pipeline declarado: text-to-speech) |
| Dataset de entrenamiento | kawshikbuet17/bangla-heteronyms |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa base (transformer bidireccional de 12 capas, 768 dimensiones ocultas, 278 M de parámetros) al que se añade una cabeza lineal pequeña. La entrada se construye concatenando la palabra objetivo con la frase en la que aparece y en la que la palabra se ha marcado con delimitadores (`@`): por ejemplo, `কর` + `আগে @ কর @ কাজটা, তারপর আবার কর।`. El encoder procesa esa secuencia y la capa lineal, aplicada sobre la representación del token marcador de apertura, produce una puntuación por cada lectura candidata del heterónimo; se selecciona la de mayor puntuación. Las lecturas se representan como reescrituras en escritura bengalí, con el hasanta visible codificado como hasanta + ZWNJ.

El fine-tuning parte de `xlm-roberta-base` y se realizó con AdamW, learning rate 2e-5, batch size 32, precisión fp16, un máximo de 10 épocas con early stopping sobre la exactitud de desarrollo y sobre una única GPU Tesla T4. El conjunto de entrenamiento contiene 14 frases por lectura del dataset de heterónimos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.); se trata de un ajuste supervisado convencional de clasificación.

## Capacidades

- Desambiguación contextual de heterónimos en bengalí: elige la lectura correcta de una palabra polisémica a partir de la frase.
- Reescritura fonética completa de una frase (`phoneticize`): sustituye cada heterónimo por su lectura y deja el resto del texto intacto.
- Salida detallada con posición, lectura y confianza por heterónimo (`phoneticize_detailed`).
- Predicción de la lectura de una palabra concreta en una frase (`predict`), sobre su primera aparición.
- Predicción y reescritura con marcado explícito de la palabra objetivo mediante corchetes (`predict_marked`, `phoneticize_marked`), útil cuando la palabra aparece varias veces.
- Versiones por lotes de todos los métodos (`*_batch`), con paso conjunto por el modelo para mayor velocidad.
- Consulta del catálogo de lecturas conocidas por palabra a través de `model.hconfig["candidates"]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo.

## Casos de uso

- Front-end de un sistema TTS en bengalí: el modelo se coloca antes del sintetizador para convertir la ortografía en una representación fonética no ambigua; encaja porque su latencia es de 10,3 ms por frase en una T4 en fp16, compatible con síntesis en tiempo real.
- Normalización de texto para G2P: en un pipeline de grafema-a-fonema, `phoneticize` resuelve los homógrafos antes de aplicar las reglas de pronunciación, evitando errores en cadena.
- Preprocesado de corpus para entrenamiento de TTS: procesar por lotes grandes volúmenes de frases con `phoneticize_batch` para generar transcripciones fonéticas consistentes; en GPU procesa unas 1.800 frases por segundo con batch 32.
- Lectura asistida y accesibilidad: integrado en un lector de pantalla para bengalí, corrige la pronunciación de palabras como `কর` (impuesto / haz / hazlo después) según la frase.
- Anotación asistida de datasets lingüísticos: `phoneticize_detailed` devuelve confianza por predicción, lo que permite filtrar casos dudosos para revisión humana en la construcción de corpus anotados.
- Verificación de pronunciación en herramientas de aprendizaje del bengalí: dado un texto y una palabra marcada, el modelo devuelve la lectura esperada y sirve como referencia automática en ejercicios.
- Desambiguación puntual en edición o corrección de textos: `predict_marked` permite resolver una ocurrencia concreta cuando la palabra aparece repetida en la misma frase.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 frases, 3 por lectura.

| Metrica | Resultado |
|---|---|
| Exactitud (checkpoint, semilla 42) | 97,55 % |
| Macro-F1 (checkpoint, semilla 42) | 97,42 % |
| Exactitud media de 3 semillas | 97,37 ± 0,39 % |
| Macro-F1 medio de 3 semillas | 97,27 ± 0,36 % |
| Latencia por frase (batch 1, pipeline completo, Tesla T4, fp16) | 10,3 ms |
| Latencia por frase (batch 1, 4 hilos de CPU) | 37 ms |
| Throughput (Tesla T4, batch 32) | ~1.800 frases/s |

Posición en el benchmark del autor: noveno por exactitud media de test entre 12 modelos. El autor recomienda `bangla-heteronym-banglabert` (99,46 % de exactitud, 12,5 ms en T4) para la mayoría de usos. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo ni evaluable en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 278 M de parámetros, en fp16 el peso ronda los 0,56 GB y en fp32 los 1,1 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: el autor valida en Tesla T4; cualquier GPU con al menos ~2 GB de VRAM libre debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, por tamaño; el autor no documenta pruebas en RTX 4090, RTX 3090 ni similares, por lo que la compatibilidad concreta no está verificada en la información disponible.
- CPU: funciona con 4 hilos a 37 ms por frase (pipeline completo, batch 1).
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de clasificación). La carga requiere el código del repositorio GitHub del autor (`src.predict.Predictor`) porque el modelo tiene una cabeza personalizada; no basta con `AutoModelForSequenceClassification`.
- Latencia y throughput: 10,3 ms/frase en T4 fp16 (batch 1) y ~1.800 frases/s en T4 con batch 32.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Exactitud (test) | Latencia (T4, batch 1) | Licencia |
|---|---|---|---|---|---|
| bangla-heteronym-xlm-roberta-base (este) | 278 M | XLM-R base + cabeza lineal | 97,55 % | 10,3 ms | MIT |
| bangla-heteronym-banglabert | no disponible | BanglaBERT + cabeza lineal | 99,46 % | 12,5 ms | no disponible en la informacion |
| Otros 10 modelos del benchmark del autor | no disponible | no disponible | ranking 1-12; este ocupa el 9.º | no disponible | no disponible |

El autor publica un benchmark de 12 modelos sobre el mismo conjunto de test, pero en la información disponible solo se detallan los resultados de este checkpoint y de `bangla-heteronym-banglabert`. No se dispone de datos de los otros diez modelos ni de alternativas externas comparables en la misma tarea.

## Limitaciones y advertencias

- Cobertura restringida: solo resuelve los heterónimos presentes en el dataset `kawshikbuet17/bangla-heteronyms`. Para una palabra fuera de ese catálogo, `predict` lanza un `ValueError` y el modelo no tiene lecturas entre las que elegir.
- Sesgo de dominio: las frases de entrenamiento y test fueron escritas específicamente para el dataset, por lo que la exactitud en texto real puede ser inferior a la reportada (el propio autor lo advierte).
- No es un modelo generativo: no produce texto libre, no razona y no admite instrucciones; cualquier uso fuera de la clasificación de lecturas de heterónimos no está soportado.
- Dependencia de código externo: la cabeza personalizada obliga a usar el repositorio GitHub del autor; el formato safetensors por sí solo no es cargable con las clases estándar de Transformers.
- Idiomas: únicamente bengalí (bn). No hay soporte multilingüe aunque el modelo base XLM-R sea multilingüe, porque el fine-tuning es monolingüe.
- Licencia MIT: permite uso comercial y modificación, manteniendo el aviso de copyright original del modelo base. No se documentan restricciones adicionales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicción errónea de la lectura en frases ambiguas o fuera de distribución; las confianzas devueltas por `phoneticize_detailed` permiten filtrar casos de baja certeza.
- No se documentan sesgos sociales, dialectales ni de registro en la información disponible; dado que el dataset es sintético y de autor único, la variedad lingüística cubierta es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawshikbuet17/bangla-heteronym-xlm-roberta-base
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio GitHub del benchmark y código de inferencia: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Checkpoint recomendado por el autor (BanglaBERT): https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Modelo base XLM-RoBERTa: https://huggingface.co/xlm-roberta-base
