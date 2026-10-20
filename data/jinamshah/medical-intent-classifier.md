# Jinamshah/medical-intent-classifier

## Resumen

`medical-intent-classifier` es un clasificador de intenciones para mensajes cortos de chatbot, desarrollado por Jinamshah y publicado en HuggingFace. Clasifica una frase en una de 12 intenciones relacionadas con síntomas comunes y cortesía (`cold`, `congestion`, `cough`, `fever`, `flu`, `goodbye`, `greeting`, `headache`, `how_are_you`, `shortness_of_breath`, `sore_throat`, `thanks`). Usa una arquitectura BiLSTM con atención, tiene 16.343.053 parámetros y se distribuye principalmente como grafo ONNX, con checkpoint PyTorch. Solo admite inglés y no es un modelo generativo ni un LLM conversacional: procesa una única frase sin padding y devuelve logits para 12 clases.

El proyecto se presenta como portafolio y aprendizaje, no como dispositivo médico. Su interés técnico está en el despliegue ligero con ONNX Runtime, el preprocesado con NLTK y Porter stem, y la calibración de confianza con temperatura y umbral para enviar mensajes fuera de alcance a una respuesta "unsure". No obstante, se entrenó con solo 596 frases y comete errores graves en mensajes de riesgo, por lo que no es apto para triaje, diagnóstico ni producción clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiLSTM con atención |
| Parámetros totales | 16.343.053 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; entrada de una frase sin padding, sin longitud máxima documentada |
| Tipos de cuantización | No disponible; el autor no documenta variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) y checkpoint PyTorch (`model.pt`) |
| Tarea | Clasificación de texto / intenciones (`text-classification`) |
| Etiquetas | 12 intenciones: `cold`, `congestion`, `cough`, `fever`, `flu`, `goodbye`, `greeting`, `headache`, `how_are_you`, `shortness_of_breath`, `sore_throat`, `thanks` |
| Entrada/salida | `input_ids` int64 `[1, seq_len]` → `logits` `[1, 12]` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una red BiLSTM con atención sobre representaciones a nivel de palabra. El preprocesado documentado incluye tokenización con NLTK, stemming Porter y búsqueda en vocabulario; las palabras no vistas se mapean a `<UNK>`. El grafo ONNX no incluye ese preprocesado, que vive en el repositorio de GitHub (`src/data.py`, `src/onnx_predict.py`), por lo que el archivo `model.onnx` por sí solo no constituye un clasificador completo. La salida son logits para 12 clases y la inferencia está pensada para una única frase sin padding.

El entrenamiento se realizó con solo 596 frases y un split fijo de validación y test de 128 ejemplos cada uno. No hay información disponible sobre dimensión de embeddings, número de capas, dropout, optimizador, número de épocas ni composición detallada del dataset. No se documenta RLHF, DPO ni ajuste por preferencias. Sí se describe una calibración post-hoc con temperatura `T = 1,849` y umbral de confianza `0,98`, ambos elegidos sobre validación, para activar una respuesta de baja confianza del tipo "unsure".

## Capacidades

- Clasificación de una frase corta en una de 12 intenciones de síntomas comunes, saludos, despedidas y cortesía.
- Salida de logits por clase y decisión con umbral de confianza calibrado para mensajes fuera de alcance.
- Preprocesado específico con tokenización NLTK, stemming Porter y vocabulario a nivel de palabra.
- Integración ligera mediante ONNX Runtime para inferencia en CPU o GPU de baja capacidad.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación multi-paso ni razonamiento conversacional.
- No es multilingüe: solo inglés.
- No tiene visión, audio, generación de código, matemáticas avanzadas ni modo "thinking".
- No genera texto libre; no es un modelo de lenguaje y no mantiene contexto entre mensajes.

## Casos de uso

- Enrutamiento informativo en un chatbot sanitario: el modelo puede clasificar mensajes como `fever`, `cough` o `headache` y dirigirlos a contenido FAQ predefinido. Es adecuado por su baja huella de inferencia, pero solo debe usarse con contenido informativo y nunca como triaje.
- Etiquetado retroactivo de conversaciones: permite clasificar en lote mensajes históricos de un chatbot para analizar qué síntomas o motivos de consulta son más frecuentes. Su salida de una única intención por mensaje simplifica la agregación estadística.
- Detección de mensajes fuera de alcance en una demo: con el umbral calibrado, el 82,5% de los mensajes fuera de alcance del test recibieron "unsure". Sirve para mostrar cómo reducir respuestas inseguras en un prototipo, aceptando que también se descartan mensajes válidos.
- Prototipo de despliegue ONNX en backend ligero: se puede servir con ONNX Runtime dentro de una API FastAPI o un servicio serverless. Es adecuado para aprender el flujo completo de tokenización, inferencia y calibración sin necesidad de GPU dedicada.
- Docencia y reproducción de calibración: el repositorio incluye `serving.json` con temperatura y umbral, lo que permite estudiar el compromiso entre cobertura y precisión en clasificación de intenciones.
- Análisis de demanda en FAQs de síntomas: clasificar mensajes entrantes de un chatbot informativo para priorizar qué contenidos ampliar. Es realista por su tamaño reducido, pero requiere revisión humana y no debe emplearse para decisiones clínicas.

## Benchmarks y rendimiento

Evaluación sobre un split fijo; el test se evaluó una vez.

| Split | n | Accuracy | Weighted F1 | Macro F1 |
|---|---:|---:|---:|---:|
| Validación | 128 | 0,969 | 0,969 | 0,967 |
| Test | 128 | 0,891 | 0,892 | 0,866 |

Resultados del fallback de baja confianza en test: 128 mensajes dentro de alcance y 40 fuera de alcance, con `T = 1,849` y umbral `0,98`.

| Métrica | Sin fallback | Con fallback |
|---|---:|---:|
| Mensajes fuera de alcance respondidos con "unsure" | 0,0% | 82,5% |
| Mensajes dentro de alcance respondidos | 100,0% | 82,8% |
| Accuracy cuando el modelo responde | 89,1% | 96,2% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. Tampoco hay comparativas publicadas con modelos alternativos de clasificación de intenciones.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 65 MB; en FP16, unos 33 MB; en INT8, unos 16 MB. Son estimaciones teóricas a partir de 16.343.053 parámetros, no mediciones publicadas por el autor.
- VRAM estimada para inferencia: por debajo de 1 GB en la mayoría de configuraciones, incluyendo overhead del runtime. El modelo puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU de consumo sirve; una RTX 4090, una RTX 3060 o una A100/H100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, y también en CPU o entornos con poca memoria.
- Opciones de despliegue: ONNX
