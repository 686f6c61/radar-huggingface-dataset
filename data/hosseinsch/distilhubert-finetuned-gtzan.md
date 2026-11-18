# HosseinSch/distilhubert-finetuned-gtzan

## Resumen

DistilHuBERT fine-tuneado sobre GTZAN es un modelo de clasificación de audio (genero musical) desarrollado por el usuario HosseinSch. Parte del checkpoint preentrenado ntu-spml/distilhubert, una versión destilada de HuBERT orientada a representaciones de habla y audio, y lo ajusta sobre el conjunto de datos GTZAN para la tarea de clasificación de 10 géneros musicales. El modelo resuelve un problema acotado: etiquetar fragmentos de audio musical en una de las categorías de GTZAN con una precisión declarada del 85 % en el conjunto de evaluación.

El modelo es de tamano reducido: 23.691.402 parámetros totales en formato safetensors, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y GPU de consumo. La arquitectura subyacente es un transformer codificador (HuBERT destilado) que opera sobre características acústicas, no sobre texto, por lo que no es un modelo generativo ni conversacional: su salida es una distribución de probabilidad sobre clases de género musical.

Es relevante ahora por su perfil de coste: al ser un fine-tune de un modelo destilado, ofrece un punto de partida práctico para pipelines de etiquetado musical, clasificación de catálogos y experimentación académica con GTZAN, con licencia Apache 2.0 y pesos en safetensors compatibles con la librería transformers. No obstante, la model card está generada automáticamente y carece de documentación sobre composición del dataset, sesgos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (HuBERT destilado, base ntu-spml/distilhubert) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre ntu-spml/distilhubert, un HuBERT destilado que aprende representaciones auto-supervisadas de audio y habla. La cabeza de clasificación se anade para la tarea de audio-classification y se ajusta sobre el dataset sanchit-gandhi/gtzan. La arquitectura es un transformer codificador; no hay evidencia en la información disponible de mecanismos MoE, SSM ni híbridos.

El entrenamiento se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 5e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW torch fused (betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 100 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). La evolución de la pérdida y la precisión por época se documenta en la model card: la precisión de validación pasa de 0.52 en la época 1 a 0.85 en la época 7, con ligeras oscilaciones posteriores (0.82 en época 8, 0.83 en épocas 9 y 10). No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo RLHF/DPO, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de audio en 10 clases de género musical según el esquema de GTZAN.
- Extracción de representaciones acústicas auto-supervisadas mediante el codificador HuBERT destilado.
- Inferencia ligera: 23,7 M de parámetros, adecuada para CPU y GPU de consumo.
- Integración con el pipeline audio-classification de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo de texto, código, matemáticas ni visión.
- Capacidades multilingües: no aplicables (modelo de audio).
- Capacidades especiales (thinking mode, vision, audio generativo): no disponible.

## Casos de uso

- Etiquetado automático de catálogos musicales: el modelo clasifica fragmentos de audio en uno de los 10 géneros de GTZAN, útil para enriquecer metadatos de bibliotecas musicales con un coste de inferencia bajo gracias a sus 23,7 M de parámetros.
- Moderación y organización de contenido en plataformas de streaming: permite agrupar pistas por género para recomendación o filtrado previo, aunque con la limitación de que GTZAN cubre solo 10 categorías.
- Investigación académica en MIR (Music Information Retrieval): sirve como baseline reproducible para comparar técnicas de fine-tuning sobre HuBERT destilado en tareas de clasificación de género.
- Prototipado rápido en entornos con recursos limitados: al caber en CPU y GPU de consumo, permite desplegar un clasificador de audio en portátiles o dispositivos edge para demos y pruebas de concepto.
- Pipeline de pre-etiquetado para anotación humana: el modelo puede generar etiquetas iniciales que revisores humanos corrigen, acelerando la construcción de datasets musicales etiquetados.
- Educación y docencia: ejemplo práctico de fine-tuning de un modelo auto-supervisado de audio con la librería transformers y el ecosistema Hugging Face, útil en cursos de aprendizaje profundo aplicado a audio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (sanchit-gandhi/gtzan) | Accuracy | 0.85 |

Resultados de validación por época declarados en la model card:

| Época | Pérdida de validación | Accuracy |
|---|---|---|
| 1.0 | 1.8059 | 0.52 |
| 2.0 | 1.2164 | 0.67 |
| 3.0 | 0.9909 | 0.72 |
| 4.0 | 0.9262 | 0.73 |
| 5.0 | 0.6696 | 0.84 |
| 6.0 | 0.5722 | 0.82 |
| 7.0 | 0.5615 | 0.85 |
| 8.0 | 0.5951 | 0.82 |
| 9.0 | 0.5798 | 0.83 |
| 10.0 | 0.5866 | 0.83 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de audio adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 23,7 M de parámetros; en la práctica, el modelo completo en safetensors ocupa parte del repo de 0,9 GB, y la inferencia en fp16 requiere aproximadamente 50 MB de pesos más activaciones.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU.
- Opciones de despliegue: transformers (pipeline audio-classification), potencialmente ONNX Runtime y TorchScript; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos de texto).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HosseinSch/distilhubert-finetuned-gtzan | 23,7 M | no disponible | 0.85 (declarado, no verificado) | apache-2.0 | Hugging Face |
| ntu-spml/distilhubert (base) | no disponible | no disponible | no disponible (preentrenado, sin cabeza de clasificación) | no disponible | Hugging Face |
| Modelos HuBERT completos fine-tuneados en GTZAN | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos verificables con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones "More information needed": no hay documentación sobre composición del dataset, sesgos ni limitaciones declaradas por el autor.
- El resultado de accuracy 0.85 está marcado como no verificado (verified: false) en la model-index; debe tratarse como dato declarado por el autor, no reproducido de forma independiente.
- GTZAN es un dataset conocido por problemas de etiquetado y duplicados; los resultados sobre él pueden no generalizar a música real de producción.
- Solo cubre 10 géneros musicales; no es aplicable a clasificación de audio general, habla, eventos sonoros ni otras tareas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en audio fuera de distribución.
- No hay información sobre sesgos por género musical, origen cultural o época de las grabaciones.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y condiciones del dataset GTZAN deben verificarse por separado antes de un despliegue en producción.
- Sin datos de latencia, throughput ni pruebas en producción; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HosseinSch/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/sanchit-gandhi/gtzan
- Librería transformers: https://github.com/huggingface/transformers
- Documentación del pipeline audio-classification: https://huggingface.co/docs/transformers/tasks/audio_classification
