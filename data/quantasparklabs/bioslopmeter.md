# QuantaSparkLabs/BioSlopMeter

## Resumen

BioSlopMeter es un modelo de clasificación de texto basado en un fine-tuning de `distilbert-base-uncased`, desarrollado por QuantaSparkLabs. Su tarea es binaria: etiquetar un texto como `USEFUL` (útil) o `SLOP` (relleno corporativo vacío), pensado específicamente para analizar biografías de LinkedIn y detectar muletillas como "synergy", "leverage" o "thought leader". Se trata de un modelo experimental y de humor, según declara el propio autor, no de una herramienta de evaluación seria.

El modelo parte de la arquitectura DistilBERT, un transformer encoder de 6 capas y 66,9 millones de parámetros, destilado de BERT-base. Con 0,3 GB de tamaño de repositorio y pesos en safetensors, es extremadamente ligero y puede ejecutarse en CPU. Se entrenó con aproximadamente 6.000 ejemplos que combinan tutoriales técnicos, descripciones de puestos reales y texto corporativo vacío.

Su relevancia es limitada a un nicho: demuestra cómo un modelo pequeño y un conjunto de datos curado pueden producir un clasificador de dominio muy específico con muy pocos recursos. El autor advierte explícitamente que la pérdida de validación de 0,000007 es artificialmente baja porque las clases son trivialmente separables, por lo que no debe interpretarse como un benchmark real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers, no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66,9 millones de parámetros obtenido por destilación de BERT-base. La cabeza de clasificación produce dos etiquetas: `USEFUL` y `SLOP`. No se documenta el uso de RLHF, DPO ni técnicas de alineación; es un ajuste supervisado estándar de clasificación de texto.

El conjunto de entrenamiento consta de aproximadamente 6.000 ejemplos: tutoriales técnicos, descripciones de puestos reales y abundante texto corporativo vacío. El autor reconoce que las clases son fáciles de separar, lo que explica la pérdida de validación de 0,000007 y una precisión "sospechosamente alta". Además del clasificador, el sistema incorpora un script basado en reglas que cuenta palabras de moda (buzzwords), números y herramientas mencionadas, y verbos de acción; si la puntuación de buzzwords es alta y la de acciones baja, se selecciona una frase sarcástica de una lista fija. Esa lista es estática y no se ha aprendido de perfiles reales.

## Capacidades

- Clasificación binaria de texto en inglés: `USEFUL` frente a `SLOP`.
- Detección de jerga corporativa y muletillas de LinkedIn (leverage, synergy, transformative, thought leader).
- Conteo heurístico de buzzwords, verbos de acción y referencias a herramientas o cifras mediante expresiones regulares.
- Generación de una frase sarcástica predefinida a partir de la puntuación de buzzwords y acciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado de perfiles en un directorio interno: clasificar biografías de candidatos o contactos para separar descripciones concretas de texto genérico, usando la etiqueta `USEFUL`/`SLOP` como señal preliminar y nunca como decisión automática.
- Análisis de calidad de textos de marketing: pasar copys corporativos por el clasificador para detectar acumulación de buzzwords antes de publicarlos.
- Demo educativa de fine-tuning: servir como ejemplo de ajuste de DistilBERT con un dataset pequeño y curado para una tarea de clasificación de dominio.
- Prototipo de moderación de contenido corporativo: integrar el clasificador en un pipeline de revisión de descripciones de producto o de empresa para marcar textos vacíos.
- Generación de contenido humorístico: usar la salida combinada del clasificador y el script de reglas para producir respuestas sarcásticas en una aplicación de entretenimiento.
- Evaluación rápida en CPU: desplegar el modelo en entornos sin GPU para clasificar lotes pequeños de textos, dado su tamaño de 0,3 GB y sus 66,9 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una pérdida de validación de 0,000007 y una precisión calificada por el autor como "sospechosamente alta", sin cifras de accuracy o F1 desglosadas ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: pipeline de `transformers`, Hugging Face Inference Endpoints, ONNX Runtime; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioSlopMeter | 66,9 M | no disponible | Clasificación binaria USEFUL/SLOP | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base de lenguaje | Apache 2.0 | Hugging Face |
| Modelos de clasificación de spam genéricos | no disponible | no disponible | Clasificación de texto | variable | variable |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y de humor: el propio autor indica que no debe usarse para contratar ni juzgar a personas.
- Sesgos conocidos: no documentados, pero el entrenamiento con textos corporativos en inglés puede favorecer ciertos estilos de escritura.
- Riesgo de alucinación: bajo en sentido estricto, al ser un clasificador; sin embargo, la etiqueta puede ser incorrecta en textos ambiguos.
- Limitación de idioma: solo inglés; no se ha evaluado en castellano ni en otros idiomas.
- Limitación de contexto: no se documenta la longitud máxima de entrada; el modelo base DistilBERT admite 512 tokens, pero no se confirma en la model card.
- Métricas no fiables: la pérdida de validación de 0,000007 refleja una separación trivial de clases, no un rendimiento real en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el carácter experimental y la falta de garantías desaconsejan su uso en producción sin validación propia.
- Las frases sarcásticas provienen de una lista fija y no se generan dinámicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantaSparkLabs/BioSlopMeter
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
