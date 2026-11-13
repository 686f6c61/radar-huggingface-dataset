# gabriellymsb/bertimbau-triagem-avaliacoes

## Resumen

BERTimbau para triagem de avaliaciones de clientes es un modelo de clasificación de texto en portugués desarrollado por gabriellymsb. Se trata de un ajuste fino (fine-tuning) del modelo base neuralmind/bert-base-portuguese-cased, un transformer encoder de tipo BERT con 108,9 millones de parámetros. El modelo clasifica una evaluación de cliente en una de ocho categorías según el problema principal del pedido: producto no recibido, atraso, pedido incompleto, producto equivocado, defecto de calidad, atención al cliente, elogio u otros.

El modelo resuelve el problema de enrutamiento automático de reclamaciones en atención al cliente de comercio electrónico, permitiendo clasificar grandes volúmenes de reseñas o tickets por tipo de incidencia. Su relevancia radica en que demuestra una técnica de supervisión débil (weak supervision): los rótulos de entrenamiento fueron generados por un LLM (Gemini) siguiendo una guía de etiquetado, y el modelo resultante se evalúa contra rótulos humanos, alcanzando un F1 macro de 0,754 y una precisión del 81,7% en el conjunto de prueba humano.

El modelo es pequeño (0,4 GB en safetensors), rápido (unos 3,4 ms por evaluación en GPU) y se distribuye con licencia MIT, lo que lo hace adecuado para despliegues de bajo coste en producción. Está entrenado exclusivamente con evaluaciones de comercio electrónico brasileño del dataset público de Olist.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau base) |
| Parametros totales | 108.929.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT); entrenado con hasta 64 tokens por texto |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con vocabulario en portugués y distinción entre mayúsculas y minúsculas (cased), heredado de neuralmind/bert-base-portuguese-cased. Sobre la cabeza de clasificación se aplica una capa de clasificación de 8 clases. El ajuste fino se realizó durante 8 épocas con lotes de 16, hasta 64 tokens por texto, optimizador AdamW con tasa de aprendizaje 3e-5, calentamiento del 10%, decaimiento lineal y recorte de gradientes en 1,0. Se usó entropía cruzada sin ponderación por clase (la ponderación empató en validación con 3 semillas). La mejor época se seleccionó por F1 macro en validación (época 7), con semilla 42.

Los datos de entrenamiento provienen del Brazilian E-Commerce Public Dataset by Olist. El conjunto de entrenamiento consta de 877 evaluaciones etiquetadas por un LLM (Gemini) siguiendo una guía de etiquetado; el de validación, 300 evaluaciones también etiquetadas por LLM; y el de prueba, 301 evaluaciones etiquetadas por humanos sin ver el rótulo del LLM. La muestra privilegia notas bajas (el dataset original está dominado por notas 5) y las clases están desbalanceadas. La innovación técnica destacable es el uso de supervisión débil con un LLM profesor para generar rótulos y la evaluación contra anotación humana independiente.

## Capacidades

- Clasificación de texto en portugués en 8 categorías de incidencia en pedidos de comercio electrónico.
- Clasificación de evaluación única por texto, con regla de prioridad cuando hay múltiples problemas: nao_recebido > incompleto > produto_errado > defeito_qualidade > atraso > atendimento > elogio > outros.
- Inferencia rápida: aproximadamente 3,4 ms por evaluación en GPU.
- Integración sencilla mediante la pipeline de text-classification de Transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni modo thinking.
- Capacidad multilingüe limitada al portugués.

## Casos de uso

- Triaje automático de reclamaciones en atención al cliente: el modelo clasifica cada reseña o ticket entrante por tipo de problema (no recibido, atraso, defecto, etc.) para enrutarlo al equipo adecuado, con una latencia de 3,4 ms que permite procesar miles de evaluaciones por segundo en una GPU modesta.
- Priorización de incidencias críticas: gracias a la regla de prioridad entre clases, las evaluaciones de producto no recibido o pedido incompleto se identifican primero, lo que permite activar protocolos de reembolso o reenvío con mayor rapidez.
- Monitorización de calidad de vendedores: agregando las clasificaciones por vendedor o producto se pueden detectar patrones de defectos, productos equivocados o atrasos recurrentes y alimentar paneles de calidad.
- Análisis de sentimiento y detección de elogios: la clase elogio (F1 0,90 en prueba) permite separar automáticamente las evaluaciones positivas de las reclamaciones para su publicación o para métricas de satisfacción.
- Enrutamiento de solicitudes de postventa: la clase atendimento agrupa solicitudes de cambio, devolución, reembolso, cancelación y cobro, lo que facilita derivarlas a un flujo específico de gestión de casos.
- Filtrado previo en pipelines de análisis de opiniones a gran escala: el modelo puede actuar como primera etapa de clasificación antes de un LLM más costoso, reduciendo el volumen de textos que requieren procesamiento caro.
- Etiquetado asistido para anotación humana: las predicciones pueden servir como sugerencia inicial para anotadores, con revisión posterior, dado su bajo coste computacional.

## Benchmarks y rendimiento

Resultados en el conjunto de prueba con rótulos humanos (301 evaluaciones):

| Métrica | Valor |
|---|---|
| F1 macro | 0,754 |
| Precisión (accuracy) | 81,7% |
| Latencia | ~3,4 ms por evaluación (GPU) |

Comparación en las 213 evaluaciones de prueba que también fueron etiquetadas por el LLM:

| Modelo | F1 macro | Precisión |
|---|---|---|
| TF-IDF + regresión logística | 0,644 | 70,9% |
| Este modelo | 0,774 | 83,6% |
| LLM profesor (Gemini 3.8 Flash) | 0,841 | 89,7% |

F1 por clase en prueba: incompleto 0,92 · elogio 0,90 · nao_recebido 0,86 · defeito_qualidade 0,86 · produto_errado 0,81 · atraso 0,65 · atendimento 0,61 · outros 0,43.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en precisión completa (fp32), menos de 0,2 GB en fp16; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las de gama baja.
- Opciones de despliegue: pipeline de Transformers, vLLM (soporte de modelos encoder), TGI, ONNX Runtime; llama.cpp y Ollama no tienen versiones GGUF publicadas para este modelo.
- Latencia y throughput estimados: ~3,4 ms por evaluación en GPU según la model card; el throughput exacto no está publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro (prueba) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabriellymsb/bertimbau-triagem-avaliacoes | 108,9 M | 512 tokens | 0,754 (humano) / 0,774 (LLM) | MIT | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | no disponible | no aplica | 0,644 | no disponible | no disponible |
| Gemini 3.8 Flash (LLM profesor) | no disponible | no disponible | 0,841 | propietaria | API de Google |

No se dispone de comparación con otros modelos BERTimbau ajustados para la misma tarea de triaje de evaluaciones en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento pequeño (877 ejemplos) y con ruido: los rótulos del LLM coinciden con los humanos en aproximadamente el 90% de los casos.
- Hereda los sesgos del profesor: tiende a usar la clase outros en exceso, igual que el LLM que generó los rótulos.
- El texto en mayúsculas puede clasificarse mal, ya que el modelo distingue mayúsculas de minúsculas.
- Los contrastes como "recomendo a loja, mas não o produto" pueden interpretarse como elogio.
- Los errores de tipografía y la falta de acentos ("produto de ma qualidade") perjudican la clasificación.
- Un solo rótulo por evaluación: los textos con dos problemas reciben solo el principal según la regla de prioridad.
- Dominio limitado: entrenado con evaluaciones de comercio electrónico brasileño; el rendimiento en otros dominios no se ha medido.
- Clases pequeñas en prueba (13 a 20 ejemplos) hacen inestable el F1 de outros, atraso y atendimento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabriellymsb/bertimbau-triagem-avaliacoes
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio del proyecto (código, guía de etiquetado y análisis de errores): https://github.com/gabriellymsb/AppTriagem
- Dataset de Olist: https://www.kaggle.com/datasets/olistbr/brazilian-e-commerce
