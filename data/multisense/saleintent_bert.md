# MultiSense/SaleIntent_bert

## Resumen

SaleIntent-BERT es un clasificador de secuencias basado en BERT, desarrollado por MultiSense, que analiza una conversación de venta completa y predice el resultado final: desde una clara intención de compra hasta una actitud hostil. Forma parte del benchmark SalesLLM, donde actúa como componente de puntuación de resultados, complementando al juez LLM que evalúa la calidad del proceso de venta. Su propósito es separar dos preguntas distintas: si el vendedor siguió un buen proceso y si el cliente realmente quería comprar al final.

El modelo está fine-tuneado sobre un BERT base y clasifica la conversación aplanada en cinco clases (A, B, C, X, F) que representan el estado final del cliente, desde intención clara de compra hasta hostilidad. Alcanza un 93,51 % de precisión en chino y un 92,94 % en inglés. El contexto de entrada es deliberadamente corto (últimos 128 tokens) porque la intención de compra se decide al final de la conversación. Está publicado bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parámetros totales | no disponible (tamaño del repo: 0,9 GB) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128 tokens (entrada truncada por la cola); el tokenizador soporta hasta 512 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Chino, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT fine-tuneado para clasificación de secuencias de 5 clases. La entrada es una conversación de múltiples turnos aplanada en una única cadena con etiquetas de hablante (`[ASSISTANT]` y `[USER]`), sin separadores entre la etiqueta y el texto. El diálogo se trunca por la cola, conservando solo los últimos 128 tokens, porque la intención de compra se decide al final de la conversación; un truncado estándar por la cabeza degradaría las predicciones. La salida es una de cinco etiquetas (A, B, C, X, F) que representan el estado final del cliente, cada una asociada a una puntuación de 2 a 10. El entrenamiento forma parte del benchmark SalesLLM y el modelo se usa junto a un juez LLM para producir la puntuación final ponderada.

## Capacidades

- Clasificación de la intención de compra del cliente en conversaciones de venta completas, con 5 niveles: intención clara (A), posible (B), sin intención (C), intención débil o desdeñosa (X) y abuso o queja (F).
- Evaluación bilingüe: funciona en chino e inglés con precisión superior al 92 % en ambos idiomas.
- Integración con un juez LLM para producir una puntuación final compuesta (proceso + resultado), con un factor de ponderación configurable (el benchmark usa 0,6 para el resultado).
- Entrada de diálogo aplanada con etiquetas de hablador, diseñada para funcionar con transcripciones de conversaciones de ventas.
- Inferencia directa con transformers, sin dependencias adicionales.

## Casos de uso

- Evaluación de agentes de venta en producción: el modelo puede puntuar automáticamente el resultado de cada conversación de un equipo de ventas, clasificando si el cliente acabó con intención clara, posible, sin intención o hostil, lo que permite monitorizar la calidad del cierre sin intervención humana.
- Benchmark de habilidades de venta de LLM: se integra en el pipeline de SalesLLM para puntuar la capacidad de modelos generativos de vender, combinando el resultado predicho con la calidad del proceso evaluada por un LLM.
- Análisis de calidad de conversaciones en centros de contacto: procesa transcripciones de llamadas o chats para detectar finales problemáticos (clientes hostiles o desconectados) y priorizar la revisión manual.
- Optimización de guiones de venta: al clasificar el resultado de miles de conversaciones, se pueden identificar patrones de guion que conducen a finales positivos o negativos.
- Detección de abuso o quejas en atención al cliente: la clase F (abuso o queja) permite detectar automáticamente conversaciones que requieren escalado a supervisores.
- Medición de la satisfacción final del cliente: la escala A-F refleja el estado emocional final del cliente, útil para correlacionar con encuestas posteriores o churn.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión en chino | 93,51 % |
| Precisión en inglés | 92,94 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 0,9 GB en safetensors, lo que lo hace ligero y ejecutable en cualquier GPU de consumo con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 2060, GTX 1660, RTX 3060, etc.) para inferencia rápida. Funciona incluso en CPU para lotes pequeños.
- Despliegue: compatible con transformers de HuggingFace, puede servirse con TGI o vLLM para clasificación en producción, aunque al ser un BERT de tamaño medio no requiere infraestructura especial.
- Latencia: en una GPU moderna (RTX 3090 o superior) la inferencia de una secuencia de 128 tokens es del orden de milisegundos, permitiendo procesamiento en tiempo real.
- No se requiere memoria de contexto extensa ni modelos de alta capacidad.

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados con la misma tarea específica (clasificación del resultado de una conversación de venta). El modelo se diferencia de clasificadores de intención genéricos por su enfoque en el estado final del cliente, con una escala no monotónica (C sin intención puntúa más que X intención débil). No se dispone de datos de otros modelos con esta tarea exacta.

## Limitaciones y advertencias

- La entrada está limitada a los últimos 128 tokens de la conversación; si la decisión de compra se produce antes del final, el modelo puede perder información relevante. El autor recomienda usar la truncación por cola, no por cabeza.
- El modelo no es generativo: solo clasifica el resultado, no explica por qué ni genera sugerencias.
- Está entrenado específicamente para conversaciones de venta, por lo que su uso en otros dominios (soporte técnico, atención al cliente general) puede degradar el rendimiento.
- La escala de clases no es monotónica: la clase C (sin intención) puntúa mejor que X (intención débil), lo que puede sorprender a usuarios no familiarizados con la lógica del benchmark.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre posibles sesgos en las conversaciones utilizadas; no se conoce la composición por idioma o industria.
- No se ha documentado la licencia de los datos de entrenamiento, solo la del modelo (Apache 2.0).
- El modelo se creó en 2026-01-07 y se actualizó en 2026-08-22; no se indican versiones anteriores ni cambios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MultiSense/SaleIntent_bert)
- [Repositorio del benchmark SalesLLM](https://github.com/Bairong-Xdynamics/Benchmarking-LLM-Realistic-Selling-Skill)
- [Repositorio de BERT original](https://github.com/google-research/bert)
