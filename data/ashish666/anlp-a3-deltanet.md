# Ashish666/anlp-a3-deltanet

## Resumen

`anlp-a3-deltanet` es un modelo de investigacion desarrollado por el usuario Ashish666 como parte de la asignatura ANLP (Assignment 3, Part A). Se trata de un modelo a nivel de caracter (character-level) disenado para la tarea de descifrado de textos cifrados (cipher decryption), es decir, reconstruir un texto en claro a partir de una version cifrada. El modelo emplea una arquitectura DeltaNet con 6 capas y un total de 4.726.144 parametros, lo que lo situa en la categoria de modelos muy pequenos.

El modelo esta publicado en Hugging Face con la libreria PyTorch y pesos en formato safetensors. No dispone de pipeline declarado, licencia especificada ni idiomas soportados documentados. Su relevancia es exclusivamente academica y experimental: sirve como banco de pruebas para arquitecturas lineales tipo DeltaNet en tareas de transformacion secuencia-a-secuencia a nivel de caracter, no como modelo de proposito general.

Los resultados reportados en la model card son muy limitados: una precision por caracter de 0.1691 y un exact match de 0.0000, lo que indica que el modelo no llega a reconstruir correctamente ninguna secuencia completa en el conjunto de test. Es, por tanto, un artefacto de investigacion con rendimiento insuficiente para uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet (6 capas) |
| Parametros totales | 4.726.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (FLOPs reportados para secuencia de 1024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo se basa en DeltaNet, una arquitectura de attention lineal (linear attention) que sustituye el mecanismo de atencion cuadratico clasico por una actualizacion recurrente de una matriz de estado, con complejidad lineal respecto a la longitud de secuencia. La model card indica 6 capas y un coste de 11.305.746.428 FLOPs en forward para una secuencia de 1024 tokens, dato coherente con un modelo de este tamano y arquitectura lineal.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. La tarea declarada es descifrado a nivel de caracter, lo que sugiere un entrenamiento supervisado sobre pares (texto cifrado, texto en claro) generados sinteticamente o extraidos de un corpus academico. No se documentan innovaciones adicionales como decodificacion especulativa o modos de razonamiento.

## Capacidades

- Descifrado a nivel de caracter: el modelo esta entrenado para mapear secuencias de caracteres cifrados a texto en claro.
- Generacion de texto restringida al dominio de la tarea: no es un modelo de lenguaje general.
- Longitud de salida: los resultados reportados muestran un `test_length_match` de 0.9992, lo que indica que el modelo acierta practicamente siempre la longitud de la secuencia de salida esperada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion academica en arquitecturas lineales: el modelo sirve como referencia reproducible para comparar DeltaNet frente a transformers clasicos en tareas de transformacion secuencia-a-secuencia de baja entropia.
- Docencia y evaluacion de asignaturas de NLP: puede utilizarse como baseline en practicas de la asignatura ANLP para que los estudiantes comparen su propio modelo con este artefacto.
- Experimentos de descifrado de cifrados simples: util como punto de partida para probar tecnicas de descifrado sobre cifrados de sustitucion o transposicion, aunque su precision actual (0.1691 por caracter) es insuficiente para uso real.
- Estudio de eficiencia computacional: con 0.6945 GB de memoria pico y 10.15 segundos de inferencia en test, permite medir el coste de arquitecturas lineales en hardware modesto.
- Prototipado de pipelines de evaluacion: sus metricas reportadas (CER, Levenshtein, exact match) sirven como plantilla para definir metricas de evaluacion en tareas de descifrado.
- Benchmarking de tecnicas de cuantizacion: al ser un modelo pequeno (4.7M parametros), es adecuado para probar flujos de cuantizacion y despliegue en entornos con recursos muy limitados.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Parametros | 4.726.144 |
| FLOPs forward (secuencia 1024) | 11.305.746.428 |
| Precision por caracter (test_char_accuracy) | 0.1691 |
| Precision por palabra (test_word_accuracy) | 0.0007 |
| Precision (test_precision) | 0.0250 |
| Recall (test_recall) | 0.0373 |
| F1 (test_f1) | 0.0114 |
| Precision micro | 0.1691 |
| Recall micro | 0.1691 |
| F1 micro | 0.1691 |
| Distancia de Levenshtein media | 738.7117 |
| Levenshtein normalizada media | 0.8778 |
| CER (character error rate) | 0.8309 |
| Exact match | 0.0000 |
| Length match | 0.9992 |
| Tiempo de inferencia (test) | 10.1494 s |
| Memoria pico | 0.6945 GB |
| Loss (test) | 2.5273 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. La model card reporta una memoria pico de 0.6945 GB durante la evaluacion en test.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 2 GB o mas (GTX 1050, RTX 3050, RTX 4060, etc.).
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer de los ultimos anos, e incluso en CPU.
- Opciones de despliegue: al estar en formato safetensors y libreria PyTorch, se puede cargar directamente con `transformers` o `torch.load`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 10.1494 segundos para el conjunto de test completo segun la model card; no se especifica el tamano del conjunto de test ni el hardware empleado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, la arquitectura DeltaNet se ha aplicado en modelos de mayor escala, pero no se han publicado en esta ficha datos que permitan una comparacion directa de parametros, contexto, rendimiento y licencia con este artefacto concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ashish666/anlp-a3-deltanet | 4.726.144 | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento insuficiente para uso practico: exact match de 0.0000 y CER de 0.8309 indican que el modelo no descifra correctamente ninguna secuencia completa.
- Precision por caracter baja (0.1691): aproximadamente 1 de cada 6 caracteres se predice correctamente, lejos de un umbral util.
- Sesgos conocidos: no documentados, pero al ser un modelo entrenado sobre un corpus academico concreto, puede heredar los sesgos de dicho corpus.
- Riesgo de alucinacion: no aplica en el sentido habitual de modelos generativos, pero el modelo puede producir secuencias de longitud correcta con contenido incorrecto.
- Limitaciones de contexto o idioma: no se documenta la longitud maxima de contexto soportada ni los idiomas cubiertos.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ambito academico.
- Caveat para produccion: el modelo no esta pensado para produccion; es un artefacto de asignatura con 0 descargas y 0 likes en el momento de la consulta.
- Fecha de creacion futura: la model card indica una fecha de creacion de 2026-11-10, lo que puede indicar un error de metadatos o una publicacion programada.

## Enlaces

- Hugging Face: https://huggingface.co/Ashish666/anlp-a3-deltanet
- Paper de DeltaNet: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible
- Demo: no disponible
