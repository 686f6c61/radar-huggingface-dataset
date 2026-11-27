# Jade0801/lakeshore-ticket-sorter

## Resumen

Lakeshore ticket sorter es un ajuste fino de DistilBERT-base-uncased entrenado para clasificar mensajes cortos de soporte de un servicio ficticio de bicicletas compartidas (Lakeshore Bike Share) en una de cuatro colas: facturación, avería de bicicleta, estación y cuenta. Lo desarrolla el usuario Jade0801 y se publica como demostración didáctica de ajuste fino de un modelo preentrenado pequeño frente a líneas base simples (etiqueta mayoritaria y TF-IDF con regresión logística).

El modelo resuelve una tarea de clasificación de texto monolingüe (inglés) con cuatro etiquetas y entradas cortas. Con 66,9 millones de parámetros y un repositorio de 0,3 GB, está pensado para ejecutarse en hardware modesto y servir como ejemplo reproducible de un pipeline de clasificación supervisada con partición estratificada 60/20/20 y semilla fija.

Su relevancia es limitada y acotada: el propio autor declara que no debe usarse en atención al cliente real, ya que los datos de entrenamiento son inventados y repiten un conjunto reducido de patrones. Es útil como referencia educativa y como punto de partida para experimentos de clasificación con DistilBERT, no como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens; el dato no se explicita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas obtenido por destilación de BERT-base, con aproximadamente la mitad de parámetros del original. Sobre esa base, el autor añade una cabeza de clasificación de secuencia con cuatro clases de salida correspondientes a las colas billing, bike_fault, station y account. El ajuste se realizó sobre el modelo completo (whole model), no solo sobre la cabeza, con una tasa de aprendizaje de 5e-05 y 5 épocas seleccionadas según la validación.

Los datos de entrenamiento son 400 mensajes extraídos de un corpus de 1.200 mensajes de soporte inventados de Lakeshore Bike Share, con una partición estratificada 60/20/20 y semilla fija. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste supervisado convencional de clasificación. La model card no detalla la composición lingüística más allá del inglés ni el número de tokens de entrenamiento.

## Capacidades

- Clasificación de texto corto en inglés en una de cuatro categorías: billing, bike_fault, station y account.
- Salida de probabilidades por clase mediante la cabeza de clasificación de secuencia.
- Ajuste fino completo del encoder, no solo de la cabeza, lo que permite cierta adaptación del modelo base al dominio.
- Funcionamiento en CPU y GPU de gama baja por su tamaño reducido.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Demostración docente de ajuste fino: sirve para ilustrar en un curso el flujo completo de preparación de datos, partición estratificada, entrenamiento y comparación con líneas base simples, dado que el autor lo concibe explícitamente como ejemplo de aula.
- Comparación de enfoques de clasificación: permite contrastar en un mismo conjunto de datos una etiqueta mayoritaria, un modelo TF-IDF con regresión logística y un transformer destilado, con métricas de validación y test reproducibles.
- Prototipado rápido de enrutado de tickets: en un entorno de pruebas con mensajes sintéticos, se puede usar para validar el diseño de una taxonomía de colas antes de invertir en datos reales anotados.
- Punto de partida para ajuste con datos propios: al estar liberado con licencia MIT y en safetensors, se puede reentrenar sobre un corpus real de tickets de otro dominio cambiando la cabeza de clasificación.
- Evaluación de infraestructura de inferencia: con 66,9 millones de parámetros, es útil para medir latencia y throughput de pipelines de clasificación en CPU o GPU pequeñas antes de escalar a modelos mayores.
- Generación de etiquetas preliminares en un corpus sintético: puede etiquetar automáticamente mensajes de prueba de un servicio ficticio para construir conjuntos de validación internos.

## Benchmarks y rendimiento

| Metodo | Precision validacion (media, rango entre semillas) | Precision test | F1 macro test |
|---|---|---|---|
| Etiqueta mas frecuente | 0,287 (0,287 a 0,287) | 0,292 | 0,113 |
| TF-IDF + regresion logistica | 0,840 (0,817 a 0,854) | 0,871 | 0,869 |
| DistilBERT, solo cabeza | 0,835 (0,812 a 0,863) | 0,812 | 0,815 |
| DistilBERT, modelo completo | 0,906 (0,896 a 0,921) | 0,904 | 0,903 |

Sobre 40 mensajes redactados por el propio autor, el modelo completo obtuvo una precisión de 0,875. Los datos de test corresponden a una única ejecución con semilla 0, evaluada una sola vez. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 66,9 millones de parámetros en precisión completa (fp32) el peso ronda los 268 MB, y en fp16 aproximadamente 134 MB, más el overhead de activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requieren A100 ni H100. Una RTX 4090 o similar queda muy sobredimensionada para esta tarea.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable para inferencia de baja concurrencia dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers con PyTorch, pipeline de text-classification, ONNX Runtime; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore ticket sorter (este modelo) | 66,9 M | no disponible | 0,904 de precision en test (4 clases, datos sinteticos) | MIT | Hugging Face |
| distilbert-base-uncased | 66,4 M | 512 tokens | Modelo base sin ajuste para esta tarea | Apache 2.0 | Hugging Face |
| TF-IDF + regresion logistica (linea base del autor) | no aplica (bolsa de palabras) | no aplica | 0,871 de precision en test | no aplica | Implementacion propia |

La comparación con otros clasificadores ajustados de la misma categoría no está disponible en la información proporcionada. Cabe señalar que la línea base TF-IDF con regresión logística alcanza un rendimiento cercano (0,871 frente a 0,904) con una fracción del coste computacional, lo que en este conjunto sintético reduce la ventaja del transformer.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados y repiten un conjunto reducido de patrones de frase, por lo que las métricas probablemente sobreestiman el rendimiento sobre mensajes reales de clientes.
- Alrededor de uno de cada ocho mensajes no nombra su tema, de modo que ningún modelo puede alcanzar el 100 % de precisión en este conjunto.
- El autor indica explícitamente que no debe usarse para decisiones reales ni como sistema de atención al cliente en producción.
- Sesgos conocidos: no documentados; al entrenarse con texto sintético, puede heredar los sesgos del modelo base DistilBERT y los del generador de los mensajes.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí puede asignar una cola con alta confianza a mensajes ambiguos o fuera de dominio.
- Limitación de idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero la calidad y el origen sintético de los datos desaconsejan cualquier despliegue real.
- El modelo tiene cero descargas y cero likes en el momento de la ficha, sin evidencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jade0801/lakeshore-ticket-sorter
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
