# KesiaSilva/bertimbau-tags-pratos

## Resumen

BERTimbau-tags-pratos es un clasificador multi-etiqueta en portugués de Brasil que, a partir del nombre, la descripción y los ingredientes de un plato, predice siete etiquetas alimentarias: `vegano`, `vegetariano`, `sem_lactose`, `sem_gluten`, `fit`, `picante` y `doce`. Lo desarrolla KesiaSilva como parte del proyecto Monta Meu Pedido, un asistente de IA para componer pedidos de comida, y su uso previsto es filtrar platos de carta por restricción alimentaria y preferencia.

Técnicamente es un fine-tuning de `neuralmind/bert-base-portuguese-cased`, un transformer encoder BERT base con 108.928.519 parámetros, adaptado a clasificación multi-etiqueta mediante una cabeza con pérdida BCEWithLogits y umbrales por etiqueta ajustados en validación. El modelo es pequeño (0,9 GB de repositorio en safetensors), se ejecuta en CPU sin dificultad y está pensado para integrarse como paso de filtrado previo a un sistema de recomendación o de generación de pedidos.

Su relevancia es acotada y muy específica: demuestra un patrón de especialización de un BERTimbau base en una tarea de dominio con datos sintéticos escasos (~420 platos) y ofrece métricas de test razonables (F1 micro 0,909, F1 macro 0,884). No es un modelo generalista ni compite con LLM; es un componente de clasificación ligero y barato para un vertical concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (fine-tuning de neuralmind/bert-base-portuguese-cased) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 108.928.519 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de entrenamiento; BERT base admite hasta 512 posiciones) |
| Tipos de cuantizacion | no disponible (compatible con cuantización estándar de transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Etiquetas de salida | 7 etiquetas multi-etiqueta: vegano, vegetariano, sem_lactose, sem_gluten, fit, picante, doce |
| Umbrales por etiqueta | En `config.limiares`: vegano 0,30; vegetariano 0,65; sem_lactose 0,30; sem_gluten 0,40; fit 0,55; picante 0,50; doce 0,70 |
| Pipeline | text-classification |
| Compatibilidad de despliegue | transformers, text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de `neuralmind/bert-base-portuguese-cased`, un BERT base entrenado sobre corpus en portugués, y se fine-tunea con una cabeza de clasificación multi-etiqueta supervisada con BCEWithLogits (una sigmoide independiente por etiqueta, no softmax). La configuración de entrenamiento documentada es: tasa de aprendizaje 5e-05, tamaño de lote 16, hasta 20 épocas con early stopping (paciencia 2) monitorizando el F1 macro de validación, longitud máxima de 128 tokens, weight decay 0,01 y semilla 42. Los umbrales de decisión de cada etiqueta se seleccionan sobre el conjunto de validación, no sobre test.

Los datos son sintéticos: aproximadamente 420 platos de 30 restaurantes ficticios, generados con un LLM y validados con reglas de consistencia; 50 platos fueron revisados a mano para medir la calidad de las etiquetas. La división es estratificada con 203 ejemplos de entrenamiento, 44 de validación y 44 de test. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, lo cual es coherente con un encoder de clasificación.

## Capacidades

- Clasificación multi-etiqueta de platos en portugués de Brasil a partir de nombre, descripción e ingredientes.
- Predicción simultánea de siete etiquetas dietéticas y de preferencia: vegano, vegetariano, sin lactosa, sin gluten, fit, picante y dulce.
- Umbrales por etiqueta configurables, lo que permite ajustar el equilibrio entre precisión y recall por categoría.
- Entrada de texto corta (hasta 128 tokens en entrenamiento), adecuada para fichas de menú y descripciones breves.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al portugués; no se ha evaluado en otros idiomas.

## Casos de uso

- Filtrado de cartas por restricción alimentaria: dado el texto de cada plato, el modelo devuelve las etiquetas aplicables y permite construir un filtro "sin gluten" o "vegano" en un menú digital, usando los umbrales ajustados por etiqueta para controlar falsos positivos.
- Asistente de composición de pedidos: integrado en el proyecto Monta Meu Pedido, clasifica los platos candidatos antes de que un LLM genere la recomendación, reduciendo el coste y la latencia frente a preguntar directamente al LLM por cada plato.
- Etiquetado asistido de catálogos: como preetiquetador en un pipeline de curación de menús, marcando automáticamente los platos que requieren revisión humana cuando la probabilidad queda cerca del umbral.
- Búsqueda facetada en marketplaces de comida: enriquecer el índice de búsqueda con las siete etiquetas para permitir filtros combinados (por ejemplo, vegetariano y picante) sin depender de metadatos manuales.
- Moderación de consistencia de menús: detectar discrepancias entre la descripción de un plato y sus etiquetas declaradas por el restaurante, señalando candidatos a revisión.
- Clasificación por lotes de bajo coste: al ser un BERT base de ~109 M de parámetros, puede procesar grandes volúmenes de fichas en CPU o en una GPU consumer con throughput alto, adecuado para tareas de backfill de catálogos.
- Prototipado de verticales food-tech: servir de base para fine-tuning adicional en otras taxonomías alimentarias o en otros mercados lusófonos.

## Benchmarks y rendimiento

Resultados en el conjunto de test (44 ejemplos) según la model card:

| Metrica | Valor |
|---|---|
| F1 micro | 0,909 |
| F1 macro | 0,884 |

| Etiqueta | F1 | Soporte | Umbral |
|---|---|---|---|
| vegano | 0,909 | 20 | 0,30 |
| vegetariano | 0,983 | 29 | 0,65 |
| sem_lactose | 0,915 | 28 | 0,30 |
| sem_gluten | 0,912 | 28 | 0,40 |
| fit | 0,769 | 13 | 0,55 |
| picante | 0,769 | 7 | 0,50 |
| doce | 0,929 | 13 | 0,70 |

La model card indica que la comparación con un baseline TF-IDF y con un LLM zero-shot está en el informe del proyecto, pero no se incluyen esos números en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB de pesos (109 M de parámetros × 4 bytes), más activaciones mínimas; cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16: aproximadamente 0,22 GB de pesos; cuantización a int8 no documentada por el autor pero viable con herramientas estándar de transformers/ONNX.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para lotes pequeños. Para alto throughput, cualquier GPU consumer (RTX 3060, RTX 4090) o profesional (A100, H100) es sobredimensionada para el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU con latencias de milisegundos por ejemplo.
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (según los tags del repo), endpoints compatibles, exportación a ONNX y serving con TorchServe o similar.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño del modelo, se espera un throughput alto en lotes y latencia inferior a decenas de milisegundos por ejemplo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KesiaSilva/bertimbau-tags-pratos | 108,9 M | 128 tokens (entrenamiento) | Clasificación multi-etiqueta de platos en pt | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | ~110 M | 512 tokens | Modelo base en portugués (MLM) | MIT | Hugging Face |
| neuralmind/bert-large-portuguese-cased | ~335 M | 512 tokens | Modelo base en portugués (MLM) | MIT | Hugging Face |
| LLM zero-shot (genérico) | miles de millones | variable | Clasificación por prompt | variable | variable |

La comparación cuantitativa con el baseline TF-IDF y con el LLM zero-shot no está disponible en la información proporcionada. Frente a BERTimbau base, este modelo añade la cabeza de clasificación y los umbrales calibrados, pero hereda su ventana efectiva de 128 tokens en entrenamiento; frente a un LLM zero-shot, la ventaja esperada es coste y latencia, no necesariamente cobertura semántica.

## Limitaciones y advertencias

- Datos sintéticos: ~420 platos generados por un LLM, menos variados y más limpios que cartas reales; el rendimiento en producción puede degradarse.
- Los rótulos provienen de un LLM, por lo que errores sistemáticos del generador pueden haberse aprendido y reproducido.
- Dominio restringido a cocina brasileña de delivery; no se ha medido el desempeño en otras cocinas ni contextos.
- Fuera de alcance explícito: decisiones médicas o alergias graves; el modelo comete errores y no debe usarse como única barrera de seguridad alimentaria.
- Conjunto de test pequeño (44 ejemplos), lo que hace que las métricas por etiqueta tengan alta varianza; etiquetas como `picante` (7 positivos) y `fit` (13 positivos) muestran F1 de 0,769.
- Ventana de 128 tokens: descripciones largas o listas de ingredientes extensas pueden truncarse y perder información.
- Solo portugués; no se ha evaluado en otros idiomas ni en variantes europeas del portugués.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía ni soporte por parte del autor.
- Riesgo de alucinación bajo en el sentido generativo (es un clasificador), pero sí riesgo de falsos positivos y negativos en las etiquetas, especialmente cerca de los umbrales configurados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KesiaSilva/bertimbau-tags-pratos
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Proyecto Monta Meu Pedido: no disponible en la información proporcionada
- Informe del proyecto con la comparación frente a TF-IDF y LLM zero-shot: no disponible en la información proporcionada
- Paper de BERTimbau: no disponible en la información proporcionada
