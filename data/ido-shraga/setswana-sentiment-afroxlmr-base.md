# Ido-shraga/setswana-sentiment-afroxlmr-base

## Resumen

`setswana-sentiment-afroxlmr-base` es un modelo de clasificación de sentimiento en tres clases (positivo, negativo, neutro) para tuits en setsuana (tswana), desarrollado por el usuario de Hugging Face Ido-shraga. Se trata de un ajuste fino de `Davlan/afro-xlmr-base`, un encoder XLM-RoBERTa adaptado a lenguas africanas mediante el proyecto AfroXLMR, sobre el corpus DSFSI Setswana Sentiment: 3.555 publicaciones de Twitter en setsuana recogidas entre 2021 y 2022 y anotadas por tres hablantes nativos según el protocolo descrito en el artículo arXiv:2605.27239.

El modelo resuelve un problema muy concreto y poco cubierto: el análisis de opinión en una lengua africana de bajos recursos con datos de registro informal (redes sociales). No es un modelo generativo ni un asistente conversacional, sino un clasificador de secuencias de 278 millones de parámetros con una ventana de 128 tokens, pensado para integrarse como componente de un pipeline de procesamiento de lenguaje natural.

Su relevancia es doble. Por un lado, amplía la cobertura de un idioma con escasísimos recursos anotados. Por otro, el autor publica junto al modelo una comparación honesta con cuatro variantes hermanas (mBERT, AfriBERTa-large, AfroXLMR-large y este AfroXLMR-base) y reconoce que su resultado de semilla única queda unos cinco puntos por debajo del reportado en el artículo original, lo que lo convierte en un caso útil para estudiar la reproducibilidad en tareas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, adaptado a lenguas africanas en AfroXLMR) |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); límite arquitectónico del encoder XLM-R base: 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica de PyTorch, aunque no se documenta) |
| Idiomas soportados | setsuana (tn); el modelo base AfroXLMR cubre 17 lenguas africanas |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto (text-classification), análisis de sentimiento de 3 clases |
| Dataset de entrenamiento | dsfsi/setswana-sentiment (2.762 train / 346 validación / 346 test) |
| Modelo base | Davlan/afro-xlmr-base |
| Tamaño del repositorio | 1,1 GB |
| Librería | transformers (probado con 5.23.0 / torch 2.15.0) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario SentencePiece y 278 millones de parámetros. Sobre esta base, AfroXLMR aplica adaptación de dominio y vocabulario a 17 lenguas africanas, lo que mejora la tokenización y la representación del setsuana frente al XLM-R original. El ajuste fino añade una cabeza de clasificación lineal con tres etiquetas sobre la representación del token `[CLS]`.

El entrenamiento sigue la receta del apéndice E del artículo del dataset: tasa de aprendizaje 5e-5, tamaño de lote 32, hasta 20 épocas con parada temprana (paciencia 3 sobre macro-F1 de validación), longitud máxima de 128 tokens, optimizador AdamW, decaimiento lineal, 10 % de calentamiento y semilla 42. La parada temprana se activó en la época 10 y se evaluó el conjunto de test una única vez al final. No se documenta ningún tipo de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo. La innovación metodológica relevante no está en el modelo sino en el corpus: el artículo asociado estudia cómo la simultaneidad temporal de la anotación predice la calidad del corpus, y el autor del ajuste reproduce ese protocolo de forma transparente.

## Capacidades

- Clasificación de sentimiento en tres clases (Positive / Negative / Neutral) sobre texto en setsuana.
- Procesamiento de texto informal de redes sociales: jerga, abreviaturas, ironía y ruido ortográfico propios de Twitter.
- Codificación contextual multilingüe heredada de AfroXLMR, útil para transferencia desde o hacia otras lenguas africanas del mismo backbone.
- Extracción de embeddings de frase mediante la salida del encoder, aprovechable para similitud semántica o clustering.
- Integración directa con `transformers.pipeline("text-classification")` y con Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio: es un encoder discriminativo, no un modelo generativo.
- Capacidad multilingüe efectiva limitada al setsuana: el ajuste fino se realizó solo con datos en `tn`.

## Casos de uso

- Monitorización de opinión en redes sociales: clasificar en tiempo real tuits en setsuana sobre marcas, políticos o eventos, aprovechando que el modelo fue entrenado exactamente en ese registro y período (2021-2022), lo que reduce el desajuste de dominio.
- Moderación de comunidades digitales: detectar automáticamente mensajes negativos en foros y grupos de WhatsApp o X dirigidos a hablantes de setsuana, como primera capa de triaje antes de la revisión humana.
- Investigación sociolingüística: etiquetar corpus históricos de tuits en setsuana para estudios de polarización o evolución del discurso, con la ventaja de que el modelo es pequeño (278 M) y se puede ejecutar en CPU.
- Análisis de satisfacción de clientes: procesar encuestas abiertas o reseñas en setsuana en un contact center de Botsuana o Sudáfrica, clasificando el tono antes de enrutar al equipo adecuado.
- Enriquecimiento de datasets para otras tareas: usar las predicciones como etiquetas débiles para preentrenar o aumentar corpus de sentimiento en lenguas del grupo sotho-tswana, dada la escasez de datos anotados.
- Componente en pipelines de NLP de bajos recursos: integrar el modelo en un sistema mayor (por ejemplo, extracción de entidades más análisis de sentimiento) mediante Hugging Face Inference Endpoints o Text Embeddings Inference, con un coste de inferencia muy bajo.
- Evaluación comparativa de encoders africanos: servir como línea base reproducible para comparar AfroXLMR-base frente a mBERT, AfriBERTa o AfroXLMR-large en tareas de sentimiento en setsuana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split de test de 346 tuits, semilla 42, no verificados de forma independiente):

| Modelo | Test accuracy | Test macro-F1 |
|---|---|---|
| Ido-shraga/setswana-sentiment-mbert | 0,567 | 0,524 |
| Ido-shraga/setswana-sentiment-afriberta-large | 0,552 | 0,504 |
| Ido-shraga/setswana-sentiment-afroxlmr-large | 0,532 | 0,405 |
| **Ido-shraga/setswana-sentiment-afroxlmr-base (este modelo)** | **0,500** | **0,486** |
| Artículo DSFSI (afro-xlmr-base, media de 5 semillas) | no disponible | 53,6 ± 1,2 |

El propio autor señala que su ejecución de semilla única queda unos cinco puntos de macro-F1 por debajo del valor del artículo, y lo atribuye a no promediar ni ajustar sobre varias semillas, no a una contradicción con el paper. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) porque no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; en fp16, alrededor de 0,6 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con latencias de decenas de milisegundos por secuencia corta.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para uso individual basta una GPU integrada o una T4.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (etiqueta oficial del repo), Hugging Face Inference Endpoints, ONNX Runtime y TorchScript. No se documenta soporte GGUF ni llama.cpp, al no ser un modelo generativo.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño (278 M de parámetros, secuencias de 128 tokens) se sitúa en el orden de milisegundos por petición en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| setswana-sentiment-afroxlmr-base (este) | 278 M | 128 tokens (entrenamiento) | 0,486 | no disponible | Hugging Face |
| setswana-sentiment-mbert | no disponible (BERT-base, ~178 M) | no disponible | 0,524 | no disponible | Hugging Face |
| setswana-sentiment-afriberta-large | no disponible (AfriBERTa-large) | no disponible | 0,504 | no disponible | Hugging Face |
| setswana-sentiment-afroxlmr-large | no disponible (AfroXLMR-large) | no disponible | 0,405 | no disponible | Hugging Face |

Los tres modelos hermanos comparten corpus, receta y autor, por lo que la comparación es limpia en cuanto a datos. Llama la atención que el modelo con mejor macro-F1 de la familia sea mBERT y no la variante large de AfroXLMR, lo que sugiere que el tamaño no es el factor determinante con solo 2.762 ejemplos de entrenamiento. No se dispone de comparación con clasificadores específicos de setsuana fuera de esta familia.

## Limitaciones y advertencias

- Rendimiento moderado: accuracy de 0,500 y macro-F1 de 0,486 sobre tres clases implican que el modelo está solo ligeramente por encima del azar en accuracy y que confunde con frecuencia las clases negativa y neutra.
- Desajuste de dominio: entrenado y evaluado exclusivamente con tuits de 2021-2022; no hay evidencia de transferencia a otros registros (noticias, literatura, habla transcrita).
- Desbalance de clases: la clase positiva representa aproximadamente el 15 % del corpus, lo que degrada su recall y explica parte del bajo macro-F1.
- Sensibilidad a la ironía: el propio autor señala que la confusión dominante (negativo frente a neutro) refleja el uso frecuente de formulaciones irónicas en la conversación en setsuana.
- Resultado de semilla única: el artículo original reporta una varianza de ±1,2 puntos de macro-F1 entre semillas, por lo que el 0,486 debe interpretarse con ese margen.
- Licencia del modelo no especificada: no se puede confirmar el uso comercial sin consultar al autor. Los datos de entrenamiento están bajo licencia NOODL, con posibles restricciones adicionales.
- Riesgo de alucinación bajo en sentido estricto (no genera texto), pero sí riesgo de clasificaciones erróneas confiadas: las puntuaciones de probabilidad no están calibradas de forma documentada.
- Cobertura lingüística limitada al setsuana; no debe usarse con otras lenguas del grupo sotho-tswana sin validación previa.
- Sin verificación independiente de los resultados: las métricas provienen de la model card y están marcadas como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ido-shraga/setswana-sentiment-afroxlmr-base
- Modelo base AfroXLMR: https://huggingface.co/Davlan/afro-xlmr-base
- Dataset DSFSI Setswana Sentiment: https://huggingface.co/datasets/dsfsi/setswana-sentiment
- Artículo asociado (arXiv:2605.27239): https://arxiv.org/abs/2605.27239
- Modelo hermano mBERT: https://huggingface.co/Ido-shraga/setswana-sentiment-mbert
- Modelo hermano AfriBERTa-large: https://huggingface.co/Ido-shraga/setswana-sentiment-afriberta-large
- Modelo hermano AfroXLMR-large: https://huggingface.co/Ido-shraga/setswana-sentiment-afroxlmr-large
- Proyecto AfroXLMR (paper y recursos): no disponible en la información proporcionada
