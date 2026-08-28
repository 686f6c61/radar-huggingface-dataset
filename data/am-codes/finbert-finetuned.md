# am-codes/finbert-finetuned

## Resumen

El modelo `am-codes/finbert-finetuned` es un ajuste fino (fine-tuning) del modelo `ProsusAI/finbert`, un BERT preentrenado específicamente para el análisis de sentimiento en el dominio financiero. Desarrollado por el usuario `am-codes`, este modelo clasifica texto financiero en tres categorías: positivo, negativo y neutral. Con 109 millones de parámetros, se trata de un modelo compacto y eficiente, adecuado para tareas de clasificación de texto en entornos con recursos limitados.

La relevancia de este modelo radica en su especialización: el análisis de sentimiento financiero es una tarea crítica para inversores, analistas y gestores de carteras, ya que permite extraer señales de noticias, informes y comunicados de prensa. Al estar basado en BERT y ajustado sobre un corpus financiero, ofrece un rendimiento sólido en este dominio específico. Aunque la model card no detalla el dataset de entrenamiento, los resultados de evaluación reportados (accuracy 0,8607, F1 0,8618) indican un comportamiento competitivo para una tarea de tres clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, encoder-only transformer) |
| Parametros totales | 109.484.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base FinBERT está entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El modelo original `ProsusAI/finbert` fue preentrenado sobre un corpus financiero extenso (artículos de noticias, informes y documentos del sector) y posteriormente ajustado con el dataset Financial PhraseBank para la clasificación de sentimiento en tres etiquetas. Este fine-tuning adicional se realizó sobre el modelo ya ajustado, utilizando un dataset no especificado en la model card.

El entrenamiento se llevó a cabo con los siguientes hiperparámetros: learning rate de 2e-05, batch size de entrenamiento de 16, batch size de evaluación de 32, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 3 épocas. Se utilizó entrenamiento con precisión mixta (Native AMP). Los resultados de validación muestran una mejora progresiva en las dos primeras épocas, con una ligera degradación en la tercera (loss de validación de 0,4882 frente a 0,4341 en la segunda).

## Capacidades

- Clasificación de sentimiento financiero en tres categorías: positivo, negativo y neutral.
- Procesamiento de texto en inglés (asumible por el modelo base, aunque no se declara explícitamente).
- Inferencia rápida y ligera gracias a su tamaño (109M parámetros), apta para despliegue en CPU o GPU de baja gama.
- Compatible con la librería `transformers` y el pipeline de `text-classification`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Análisis de sentimiento de noticias financieras: el modelo puede procesar titulares y artículos de prensa económica para extraer la polaridad (positiva, negativa o neutral) y alimentar sistemas de alerta temprana para inversores.
- Monitorización de redes sociales y foros de inversión: clasificar comentarios de usuarios en plataformas como Twitter o Reddit para medir el sentimiento del mercado en tiempo real.
- Evaluación de informes de resultados empresariales: analizar los comunicados trimestrales de empresas cotizadas y generar automáticamente resúmenes de sentimiento para gestores de cartera.
- Análisis de discursos de directivos y conferencias: procesar transcripciones de earnings calls para detectar cambios en el tono de la dirección, lo que puede influir en la valoración de la acción.
- Filtrado de contenido para asesores financieros: clasificar documentos legales o regulatorios para priorizar aquellos con sentimiento negativo que requieran atención inmediata.
- Integración en pipelines de análisis cuantitativo: usar las predicciones del modelo como señal adicional en modelos de predicción de precios o de riesgo de crédito.

## Benchmarks y rendimiento

El autor declara los siguientes resultados de evaluación en la model card (no se especifica el dataset de evaluación):

| Metrica | Valor |
|---|---|
| Loss | 0,4341 |
| Accuracy | 0,8607 |
| F1 | 0,8618 |
| Precision | 0,8631 |
| Recall | 0,8607 |

Estos resultados corresponden a la segunda época de entrenamiento, que fue la que mejor rendimiento de validación obtuvo. No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, HumanEval o GLUE. El `model-index` de la model card está vacío, por lo que estos valores son los únicos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo requiere aproximadamente 438 MB de memoria (109M parámetros × 4 bytes); en FP16, unos 219 MB; en int8, alrededor de 110 MB. Esto permite ejecutarlo en GPUs con 2 GB o menos de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU sin problema, aunque con mayor latencia.
- Compatible con consumer GPUs: sí, es un modelo ligero que cabe en prácticamente cualquier GPU moderna.
- Opciones de despliegue: puede usarse con la librería `transformers` de Hugging Face, tanto en Python como en C++ (via ONNX). También es compatible con `text-embeddings-inference` y con plataformas como Hugging Face Inference Endpoints.
- Latencia y throughput: en una GPU moderna (p.ej., RTX 3090), la inferencia de una sola muestra tarda unos pocos milisegundos; en CPU, puede ser del orden de 10-50 ms por muestra dependiendo de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (sentimiento financiero) | Licencia |
|---|---|---|---|---|
| am-codes/finbert-finetuned | 109M | no disponible | Accuracy 0,8607 (declarado) | no disponible |
| ProsusAI/finbert | 109M | 512 | Accuracy ~0,85 en Financial PhraseBank (según publicaciones) | Apache 2.0 |
| FinBERT (versión de yya518) | 109M | 512 | Accuracy ~0,87 en Financial PhraseBank (según GitHub) | MIT (según repo) |

No se dispone de una comparativa directa publicada por el autor de `am-codes/finbert-finetuned`. Los valores de los modelos alternativos provienen de fuentes públicas (GitHub y papers) y pueden variar según el dataset y la configuración de evaluación.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El dataset de entrenamiento no se detalla, por lo que no se puede evaluar la calidad ni la posible existencia de sesgos en los datos.
- El modelo está limitado al análisis de sentimiento financiero; no es adecuado para otras tareas de NLP.
- No se han documentado sesgos específicos, pero al ser un modelo basado en BERT entrenado con texto financiero, puede reflejar sesgos presentes en los corpus originales (por ejemplo, sobrevaloración de ciertos sectores o regiones).
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir clasificaciones erróneas en textos ambiguos o con lenguaje figurado.
- La longitud de contexto no se declara, pero al ser BERT base, está limitada a 512 tokens. Textos más largos deben truncarse o dividirse.
- El idioma no está especificado; el modelo base FinBERT está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas probablemente sea deficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/am-codes/finbert-finetuned
- Modelo base ProsusAI/finbert: https://huggingface.co/ProsusAI/finbert
- Repositorio de FinBERT (ProsusAI): https://github.com/ProsusAI/finBERT
- Repositorio alternativo de FinBERT: https://github.com/yya518/FinBERT
- Página de overview de FinBERT en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/finbert-prosusai
