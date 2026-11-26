# ariffatah/lakeshore-ticket-sorter-model

## Resumen

Lakeshore Ticket Sorter es un modelo de clasificación de texto en inglés, resultado de un ajuste fino (*fine-tuning*) completo del modelo base `distilbert-base-uncased`. Lo desarrolla el usuario ariffatah y su propósito es enrutar mensajes cortos de soporte de un servicio ficticio de alquiler de bicicletas hacia cuatro colas: facturación, avería de bicicleta, estación y cuenta. Se trata de una demostración educativa de aprendizaje por transferencia, no de una herramienta lista para producción.

El modelo es un DistilBERT con 66.956.548 parámetros totales, lo que corresponde a la variante estándar de DistilBERT con una cabeza de clasificación de cuatro etiquetas. El repositorio ocupa aproximadamente 0,3 GB y los pesos están en formato safetensors. La ventana de contexto efectiva durante el entrenamiento fue de 64 tokens, suficiente para mensajes de soporte breves.

Su relevancia es limitada: se publica como ejemplo de clasificación de tickets con datos sintéticos y como referencia metodológica para comparar un *baseline* trivial, una regresión logística sobre TF-IDF y un transformer ajustado. Los resultados publicados muestran una precisión del 90,00 % en test y del 77,50 % en un conjunto de evaluación separado, lo que ilustra tanto las capacidades como el sobreajuste al dataset generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT, 6 capas) con cabeza de clasificación lineal |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de DistilBERT); entrenado con longitud máxima de 64 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT-base. Sobre él se añade una cabeza de clasificación lineal para cuatro etiquetas. El ajuste fino fue completo, con *learning rate* 5e-05, 4 épocas, tamaño de lote 8, optimizador AdamW y longitud máxima de 64 tokens. No se documenta uso de RLHF, DPO ni decodificación especulativa.

Los datos de entrenamiento son sintéticos, generados con el script `tickets_data.py`. El conjunto original contiene 1.200 mensajes divididos de forma estratificada 60/20/20: 720 en el pool de entrenamiento, 240 en validación y 240 en test. De los 720 disponibles, solo se seleccionaron 300 para el entrenamiento. Además, se preparó un conjunto de evaluación separado de 40 mensajes redactados con asistencia de IA y reservado exclusivamente para la evaluación final. La selección de hiperparámetros se hizo únicamente con datos de validación (semillas 42 para entrenamiento y partición).

## Capacidades

- Clasificación de texto en inglés en cuatro categorías: `billing`, `bike_fault`, `station` y `account`.
- Procesamiento de mensajes cortos de soporte (hasta 64 tokens en entrenamiento, 512 tokens como límite arquitectónico).
- Salida de probabilidades por etiqueta mediante la cabeza de clasificación (no calibradas, según advierte el autor).
- No dispone de *tool calling*, *function calling* ni capacidades de agente.
- No dispone de modo de razonamiento (*thinking mode*), visión ni audio.
- Capacidad multilingüe no establecida: entrenado solo con mensajes en inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo sugiere una cola a partir del texto del mensaje, reduciendo el triaje manual en un servicio de alquiler de bicicletas. Adecuado por su tamaño reducido y su latencia baja, pero requiere revisión humana.
- Prototipado rápido de clasificadores: sirve como punto de partida para experimentar con aprendizaje por transferencia sobre DistilBERT en un dominio de tickets.
- Comparación de baselines: útil en experimentos que contrastan un clasificador trivial, TF-IDF con regresión logística y un transformer ajustado sobre el mismo conjunto de datos.
- Filtrado preliminar en colas de atención al cliente: puede etiquetar mensajes entrantes antes de pasarlos a un sistema de gestión de tickets, siempre con validación humana posterior.
- Docencia y demostración: ejemplo reproducible de ajuste fino con datos sintéticos, semillas fijas y particiones estratificadas para cursos de NLP.
- Investigación sobre sobreajuste en datasets sintéticos: los resultados en el conjunto de evaluación separado (77,50 % frente a 90,00 % en test) permiten estudiar la brecha entre rendimiento sintético y real.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos sobre el mismo conjunto de 300 ejemplos de entrenamiento y evaluados en filas idénticas:

| Metodo | Val accuracy | Val macro F1 | Test accuracy | Test macro F1 | Own-message accuracy | Own-message macro F1 |
|---|---:|---:|---:|---:|---:|---:|
| Etiqueta más frecuente | 28,75 % | 0,1117 | 29,17 % | 0,1129 | 25,00 % | 0,1000 |
| TF-IDF + regresión logística | 86,25 % | 0,8641 | 82,92 % | 0,8286 | 70,00 % | 0,7031 |
| DistilBERT full fine-tuning | 91,25 % | 0,9148 | 90,00 % | 0,9014 | 77,50 % | 0,7745 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,27 GB solo para pesos, más activaciones; en la práctica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en fp16: alrededor de 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU moderna, incluida RTX 3060, RTX 4090, A100 o H100; el modelo es trivial para todas ellas.
- Cabe en GPU de consumo y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime, TorchServe o cualquier servidor compatible con modelos de clasificación; vLLM y llama.cpp no están orientados a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test accuracy (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lakeshore Ticket Sorter | 66,96 M | 512 (entrenado a 64) | 90,00 % (test sintético) | apache-2.0 | Hugging Face |
| `distilbert-base-uncased` sin ajuste | 66,96 M | 512 | no aplica (sin cabeza de clasificación específica) | apache-2.0 | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | 82,92 % | no aplica | reproducible con el dataset del autor |
| BERT-base ajustado para clasificación | ~110 M | 512 | no disponible | apache-2.0 | Hugging Face |

La comparativa con BERT-base es orientativa: no se han publicado resultados de BERT-base sobre esta misma tarea en la información disponible.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados y no representan registros reales de soporte al cliente.
- El dataset generado contiene patrones de frases repetidos, mensajes vagos, temas mezclados y errores ortográficos.
- Algunos mensajes vagos no son clasificables de forma fiable solo con su texto, porque la etiqueta asignada no es inferible.
- El rendimiento cae en el conjunto de evaluación separado (77,50 % frente a 90,00 % en test), lo que sugiere que el dataset sintético puede sobreestimar el rendimiento real.
- El conjunto de evaluación separado es pequeño (40 mensajes) y no sustituye una evaluación sobre mensajes reales de clientes.
- Entrenado solo con mensajes en inglés; el rendimiento en otros idiomas no está establecido.
- Las puntuaciones de salida no son estimaciones de confianza calibradas.
- Se recomienda revisión humana antes de usar el modelo en un flujo real de soporte al cliente.
- Licencia apache-2.0: permite uso comercial, pero el modelo es una demostración educativa y no debe usarse para decisiones automatizadas de atención al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariffatah/lakeshore-ticket-sorter-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio del modelo base en GitHub (transformers): https://github.com/huggingface/transformers
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
