# 3liel/marbert-arabic-tweet-sentiment-max

## Resumen

marbert-arabic-tweet-sentiment-max es un modelo de clasificacion de texto fine-tuneado sobre UBC-NLP/MARBERTv2, especializado en analisis de sentimiento de tweets en arabe. El autor, 3liel, publica este modelo en HuggingFace con el objetivo de ofrecer una herramienta de clasificacion de sentimiento para textos cortos en arabe, aprovechando las capacidades de MARBERTv2 para trabajar con arabe dialectal y arabe moderno estandar (MSA). El modelo presenta 162.843.651 parametros y una longitud de contexto de 512 tokens, lo que lo hace adecuado para tareas de clasificacion de textos breves como tweets.

El modelo se entrena sobre un dataset no especificado por el autor, con un proceso de fine-tuning de 10 epocas, learning rate de 2e-05 y label smoothing de 0.1. Los resultados de evaluacion indican una accuracy de 0.7315 y un F1 de 0.7319, aunque no se han publicado benchmarks comparativos con otros modelos. La relevancia de este modelo radica en su especializacion para arabe, un idioma con pocos recursos de NLP de calidad, y su potencial uso en tareas de monitorizacion de redes sociales, analisis de opinion y atencion al cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 162.843.651 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (dialectal y MSA) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MARBERTv2, un transformer encoder-only de tipo BERT entrenado por el grupo UBC-NLP. MARBERTv2 se preentrena sobre 1.000 millones de tweets en arabe, lo que le permite capturar tanto arabe moderno estandar como variedades dialectales. La arquitectura original de MARBERTv2 tiene 163 millones de parametros, consistente con el recuento de 162.843.651 parametros del modelo fine-tuneado. Para esta tarea de clasificacion, se anade una cabeza de clasificacion sobre la representacion del token [CLS].

El proceso de fine-tuning se realizo con el Trainer de HuggingFace sobre un dataset no revelado. Los hiperparametros incluyen: learning rate de 2e-05, batch size de 16 (32 con acumulacion de gradientes), 10 epocas, warmup de 150 pasos, scheduler lineal y label smoothing de 0.1. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estandar. La perdida en evaluacion empeora progresivamente desde 0.8475 en la epoca 1 hasta 1.0371 en la epoca 5, lo que sugiere un posible sobreajuste en epocas avanzadas.

## Capacidades

- Clasificacion de sentimiento en texto arabe, especificamente tweets.
- Soporte para arabe dialectal y arabe moderno estandar (MSA) gracias al preentrenamiento de MARBERTv2.
- Clasificacion de secuencias de hasta 512 tokens.
- Salida de etiquetas de clasificacion (el numero de clases no se especifica en la informacion disponible).
- Compatible con la libreria transformers y con text-embeddings-inference para despliegue en endpoints.
- No se mencionan capacidades de generacion de texto, tool calling, agentes o multimodales.

## Casos de uso

- Monitorizacion de redes sociales: el modelo puede clasificar automaticamente el sentimiento de tweets sobre una marca, producto o evento, permitiendo a empresas medir la opinion publica en tiempo real con un modelo especializado en arabe.
- Analisis de opinion en arabe dialectal: a diferencia de modelos multilingues genericos, este modelo hereda de MARBERTv2 la capacidad de procesar variedades dialectales del arabe, lo que lo hace util para analizar conversaciones informales en redes sociales.
- Atencion al cliente automatizada: integrado en un pipeline de clasificacion, puede pre-clasificar mensajes entrantes como positivos o negativos para priorizar aquellos que requieren respuesta urgente.
- Investigacion academica en PLN arabe: util para estudios de opinion publica, analisis de discurso politico o social en el mundo arabe, dado su enfoque especifico en tweets.
- Sistemas de recomendacion basados en sentimiento: puede usarse como componente para ajustar recomendaciones en plataformas que operan en arabe, basandose en la reaccion de los usuarios.
- Deteccion de crisis de reputacion: al clasificar el sentimiento de menciones, una empresa puede detectar picos de negatividad y activar protocolos de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. Los unicos datos de evaluacion son los reportados en la model card durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida (evaluacion) | 1.0371 |
| Accuracy | 0.7315 |
| F1 | 0.7319 |

Estos resultados corresponden a la evaluacion final tras 5 epocas. El mejor accuracy observado durante el entrenamiento fue 0.7469 en la epoca 1, con una perdida de 0.8475, lo que sugiere que el modelo podria haber funcionado mejor con early stopping.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 650 MB en FP32, 163 MB en INT8 y 82 MB en 4-bit (estimaciones basadas en el numero de parametros).
- GPU recomendadas: cabe en cualquier GPU consumer moderna, incluyendo NVIDIA GTX 1060 6GB o superior. No requiere GPU profesional.
- CPU: el modelo puede ejecutarse en CPU con latencia aceptable para tareas de clasificacion por lotes.
- Opciones de despliegue: compatible con transformers (PyTorch), text-embeddings-inference, y puede exportarse a ONNX para inferencia optimizada. No se mencionan archivos GGUF para llama.cpp u Ollama.
- Latencia estimada: en GPU consumer, inferencia de un solo texto en el orden de 10-50 ms; en CPU, entre 100-500 ms por texto, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | F1 | Licencia |
|---|---|---|---|---|---|
| 3liel/marbert-arabic-tweet-sentiment-max | 162.8M | 512 | 0.7315 | 0.7319 | no disponible |
| iMeshal/arabic-sentiment-classifier-marbert | no disponible | no disponible | no disponible | no disponible | no disponible |
| UBC-NLP/MARBERTv2 (base) | 163M | 512 | no aplica | no aplica | MIT |

El modelo de iMeshal es otro fine-tuning de MARBERTv2 para clasificacion de sentimiento en arabe, pero no se dispone de sus metricas. MARBERTv2 es el modelo base sin fine-tuning, por lo que no es directamente comparable en tareas de clasificacion. No se han encontrado otros modelos comparables con datos publicos en la informacion disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento no se ha revelado, lo que impide evaluar posibles sesgos o la representatividad de los datos.
- La accuracy de 0.7315 es moderada; el modelo puede fallar en textos complejos, ironia o sarcasmo, problemas comunes en analisis de sentimiento.
- La perdida de evaluacion aumenta progresivamente durante el entrenamiento, indicando un posible sobreajuste.
- La licencia del modelo no esta especificada, lo que genera incertidumbre sobre su uso comercial.
- El modelo solo soporta arabe; no es adecuado para textos multilingues o en otros idiomas.
- La longitud de contexto de 512 tokens limita su uso a textos cortos; no es adecuado para documentos extensos.
- No se ha evaluado el modelo en tareas fuera de la clasificacion de tweets; su rendimiento en otros tipos de texto arabe es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3liel/marbert-arabic-tweet-sentiment-max
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Repositorio GitHub de MARBERT: https://github.com/UBC-NLP/marbert
- Modelo similar de iMeshal: https://huggingface.co/iMeshal/arabic-sentiment-classifier-marbert
- Paper sobre MARBERT (via arxiv): https://arxiv.org/pdf/2606.25495
