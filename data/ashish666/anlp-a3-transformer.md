# Ashish666/anlp-a3-transformer

## Resumen

`Ashish666/anlp-a3-transformer` es un modelo de investigación de tipo transformer encoder de 6 capas y aproximadamente 4,7 millones de parámetros, publicado en Hugging Face como parte de la asignatura ANLP (Assignment 3, Part A). Su propósito declarado es la desencriptación de texto a nivel de carácter: dado un texto cifrado mediante algún esquema de substitución, el modelo intenta reconstruir el texto original carácter a carácter. No es un modelo de lenguaje de propósito general, sino un artefacto académico orientado a una tarea muy concreta.

El modelo se distribuye en formato PyTorch con pesos en safetensors y etiquetas que mencionan "mamba" y "deltanet", aunque la model card solo confirma una arquitectura transformer de 6 capas. El repositorio es de tamaño prácticamente nulo (0,0 GB) y no registra descargas ni interacciones, lo que indica que se trata de un experimento de curso sin distribución posterior.

Su relevancia práctica es muy limitada: los resultados publicados en la propia model card muestran un rendimiento bajo (exact match de 0,0 y CER de 0,83), por lo que debe interpretarse como una entrega académica reproducible más que como una herramienta lista para producción. Aun así, resulta útil como referencia para estudiar tareas de descifrado carácter a carácter con transformers pequeños y para reproducir el pipeline de evaluación del curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 6 capas |
| Parametros totales | 4.701.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los benchmarks usan 1024 posiciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La model card especifica una arquitectura transformer con 6 capas y 4.701.184 parámetros, con un coste declarado de 16.020.144.128 FLOPs en una pasada forward de 1024 posiciones. Las etiquetas del repositorio incluyen `mamba` y `deltanet`, lo que sugiere que el autor experimentó o comparó variantes de estado (SSM y DeltaNet) junto al transformer, pero la ficha solo confirma el transformer como arquitectura final. No se detalla el número de cabezas de atención, la dimensión del modelo ni el tipo de embedding posicional.

No se especifica el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La tarea es de descifrado a nivel de carácter, con un vocabulario presumiblemente reducido (caracteres del alfabeto y del esquema de cifrado). El tiempo de inferencia declarado sobre el conjunto de test es de 12,83 segundos con un pico de memoria de 1,357 GB, coherente con un modelo de este tamaño.

## Capacidades

- Descifrado de texto a nivel de carácter: reconstruye secuencias de caracteres a partir de entradas cifradas, con un vocabulario y una tarea acotados al experimento del curso.
- Generación de secuencias carácter a carácter: produce salidas de la misma longitud que la entrada (length match de 1,0 en test).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo: no disponible; la model card no declara idiomas y el alcance es un cifrado concreto.
- No incluye modo de pensamiento, visión, audio ni otras modalidades.

## Casos de uso

- Reproducción académica de la práctica ANLP Assignment 3 Part A: sirve para verificar el pipeline de entrenamiento y evaluación de un transformer pequeño en una tarea de descifrado carácter a carácter.
- Estudio de esquemas de cifrado por substitución: el modelo puede usarse como línea base para comparar con enfoques estadísticos (análisis de frecuencias, n-gramas) en textos cifrados del mismo dominio.
- Comparación de arquitecturas en docencia: las etiquetas `mamba` y `deltanet` permiten usar el repositorio como punto de partida para contrastar transformer frente a modelos de estado en tareas secuenciales cortas.
- Experimentos de tokenización a nivel de carácter: útil para estudiar cómo un vocabulario mínimo afecta al aprendizaje en modelos de 4,7 M de parámetros.
- Pruebas de infraestructura de evaluación: el conjunto de métricas de la model card (CER, Levenshtein, exact match, F1 micro/macro) sirve como plantilla para evaluar otros modelos de descifrado.
- Docencia sobre limitaciones de modelos pequeños: el bajo rendimiento publicado (CER 0,83, exact match 0,0) ejemplifica los fallos típicos de un modelo infraentrenado en una tarea de secuencia a secuencia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| test_char_accuracy | 0,1691 |
| test_word_accuracy | 0,0007 |
| test_precision | 0,0247 |
| test_recall | 0,0373 |
| test_f1 | 0,0114 |
| test_precision_micro | 0,1691 |
| test_recall_micro | 0,1691 |
| test_f1_micro | 0,1691 |
| test_levenshtein_mean | 738,7147 |
| test_levenshtein_norm_mean | 0,8778 |
| test_cer | 0,8309 |
| test_exact_match | 0,0000 |
| test_length_match | 1,0000 |
| test_loss | 2,5273 |
| test_infer_seconds | 12,8342 |
| test_peak_mem_gb | 1,3570 |
| flops_fwd_1024 | 16.020.144.128 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,36 GB de pico de memoria según la propia model card, medido en el conjunto de test.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en tarjetas de consumo como GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin pipeline declarado, requiere cargar los pesos con la clase del repositorio o con `transformers`/`torch` según la implementación del autor; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 12,83 segundos para el conjunto de test completo según la model card; no se detalla el tamaño del conjunto ni el hardware empleado.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de descifrado carácter a carácter con parámetros, contexto y licencia documentados.

## Limitaciones y advertencias

- Rendimiento muy bajo: exact match de 0,0 y CER de 0,83 indican que el modelo no descifra correctamente en la práctica.
- Sesgos conocidos: no disponibles; no se documenta el corpus de entrenamiento ni su procedencia.
- Riesgo de alucinación: alto en el sentido de que genera secuencias de la longitud correcta pero con contenido incorrecto (length match 1,0 frente a exact match 0,0).
- Limitaciones de contexto e idioma: no se declara ventana de contexto ni idiomas soportados; los benchmarks usan 1024 posiciones.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial.
- Caveat para producción: es un artefacto académico sin mantenimiento, sin descargas ni validación externa; no debe usarse como componente de sistemas reales de criptografía o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Ashish666/anlp-a3-transformer
