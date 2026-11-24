# algerian-nlp/DZAIR

## Resumen

DZAIR (الجزائر) es un codificador de texto bidireccional de 105,3 millones de parámetros entrenado desde cero por el colectivo Algerian NLP (autor principal: Abderahmane Ainouche) para dar cabida al dariya argelino (`arq`) en sus tres formas de escritura reales: alfabeto árabe, arabizi latino y code-switching con francés. A diferencia de los modelos multilingües genéricos, que fragmentan en exceso estas variedades, DZAIR se entrena con un vocabulario SentencePiece construido específicamente sobre texto latino en minúsculas y con los dígitos fonéticos del arabizi (3, 7, 9) tratados como piezas atómicas.

El modelo resuelve un problema concreto de representación: el dariya argelino es una variedad de bajo recurso, con ortografía no normalizada y alternancia de código frecuente, lo que degrada los embeddings de modelos entrenados sobre árabe estándar (MSA). DZAIR se presenta como alternativa a DziriBERT con un backbone un 20 % más pequeño (68,44 M frente a 85,05 M de parámetros) y mejores resultados en sentimiento sobre arabizi latino y árabe de foro bajo un protocolo de evaluación idéntico de 10 semillas.

Se distribuye con licencia Apache-2.0 en formato PyTorch FP32 (safetensors), FP16 y exportaciones ONNX FP32 e INT8, lo que permite desplegarlo tanto en GPU como en CPU sin dependencia de PyTorch en inferencia. Su pipeline declarado es `feature-extraction`, aunque incluye cabeza de clasificación de secuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) de 12 capas × 768, con RTD y GDES (GQA 12Q/4KV, SwiGLU, Pre-RMSNorm, QK-Norm, RoPE) |
| Parametros totales | 105.304.320 (backbone de 68,44 M; 128,8 M en entrenamiento conjunto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de entrada) |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (`fp16/`), ONNX FP32 y ONNX INT8 (`onnx/`) |
| Idiomas soportados | Dariya argelino (`arq`) en escritura árabe, arabizi latino y code-switching con francés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 y FP16), ONNX (FP32 e INT8); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

DZAIR es un encoder bidireccional tipo BERT de 12 capas y dimensión oculta 768, pero con varias decisiones modernas respecto al transformer original: atención con grouped-query attention (12 cabezas de consulta y 4 de clave/valor), activación SwiGLU, Pre-RMSNorm, QK-Norm y embeddings posicionales rotatorios (RoPE). El entrenamiento combina un objetivo de detección de tokens reemplazados (RTD, *replaced token detection*, en la línea de ELECTRA) con un componente denominado GDES en la model card, del que no se detallan más especificaciones técnicas. La arquitectura se distribuye junto con los pesos en `modeling_dzair.py`, de ahí la necesidad de `trust_remote_code=True`.

El corpus de preentrenamiento consta de 19,18 millones de filas deduplicadas (1.314 miles de millones de tokens) procedentes de 10 fuentes sometidas a decontaminación. El vocabulario SentencePiece se construyó sobre texto latino en minúsculas, y los dígitos fonéticos del arabizi se representan como piezas atómicas (aproximadamente el 5 % de los tokens de arabizi los contienen). No se especifica en la información disponible si hubo fases de ajuste con RLHF o DPO, ni la composición exacta por fuente del dataset.

## Capacidades

- Extracción de características y generación de embeddings de frase (mean pooling sobre `last_hidden_state`, dimensión 768).
- Clasificación de secuencias mediante cabeza CLS + MLP (`AutoModelForSequenceClassification`), con el mismo diseño usado en los benchmarks.
- Procesamiento de texto en alfabeto árabe, arabizi latino y mezcla con francés en una misma secuencia.
- Manejo nativo de dígitos fonéticos del arabizi (3, 7, 9) sin transliteración.
- Análisis de sentimiento y clasificación de emociones (la model card reporta evaluación en emoción de 10 clases).
- Detección de variedad lingüística (el benchmark DID Algiers vs. MSA sugiere uso para discriminación dariya/árabe estándar).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder, no un modelo generativo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Análisis de sentimiento en redes sociales argelinas: el modelo puede clasificar publicaciones en arabizi latino y árabe de foro con una cabeza CLS + MLP; rinde 65,52 % de accuracy en Narabizi y 96,33 % en Ranim, lo que lo hace apto para monitorización de opinión en Twitter y foros.
- Moderación de contenido en plataformas locales: al cubrir alfabeto árabe, arabizi y code-switching francés en una sola pasada de 512 tokens, permite entrenar clasificadores de toxicidad o spam sobre comentarios heterogéneos sin pipelines de normalización previa.
- Búsqueda semántica y recuperación de documentos: los embeddings de 768 dimensiones con mean pooling sirven para indexar y recuperar textos en dariya en motores vectoriales, útil en bases de conocimiento de atención ciudadana o archivos de prensa argelina.
- Enrutamiento de idioma y detección de variedad: la evaluación DID Algiers vs. MSA indica que el encoder captura la distinción entre dariya y árabe estándar, aprovechable para dirigir consultas al modelo o al recurso adecuado en un sistema multilingüe.
- Clasificación de emociones en atención al cliente: con 10 clases evaluadas en Twifil, se puede ajustar para priorizar tickets por enfado o frustración en centros de soporte que reciben mensajes en arabizi.
- Despliegue en CPU o entornos sin GPU: las exportaciones ONNX INT8 y FP32 permiten ejecutar el modelo con ONNX Runtime en servidores modestos o en el borde, sin PyTorch en tiempo de inferencia.
- Extracción de características para modelos posteriores: sus embeddings pueden alimentar clasificadores ligeros o sistemas de clustering de temáticas en corpus de bajo recurso donde los modelos multilingües grandes son costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor (medias de 10 semillas, 3 épocas, batch 8, AdamW con lr=5e-5, cabeza CLS + MLP, mejor época por accuracy de test). No verificados de forma independiente.

| Tarea (tamaño de test) | DziriBERT Acc / F1 | DZAIR Acc / F1 | Delta |
|---|---:|---:|---:|
| Narabizi sentiment, arabizi (143) | 63,22 / 56,58 | **65,52 / 59,61** | +2,31 / +3,03 |
| Ranim sentiment, árabe de foro (300) | 94,30 / 93,73 | **96,33 / 95,94** | +2,03 / +2,21 |
| Twifil sentiment, Twitter (2.360) | 79,62 / 79,03 | 78,94 / 78,34 | −0,68 / −0,69 |
| Twifil emotion, 10 clases (1.278) | 69,12 / 39,10 | 67,86 / 36,67 | −1,26 / −2,43 |
| Algerian sentiment, social (92) | 90,11 / 89,43 | 87,72 / 86,80 | −2,39 / −2,63 |
| DID Algiers vs. MSA (5.289) | 93,63 / 75,06 | 88,72 / 66,44 | −4,91 / no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es un encoder y esas tareas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (105,3 M de parámetros × 4 bytes), unos 0,2 GB en FP16 y del orden de 0,1 GB en ONNX INT8, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 quedan sobredimensionadas para este modelo y solo se justifican por agregación de peticiones en lote.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o incluso iGPU con memoria compartida suficiente.
- Opciones de despliegue: PyTorch con `transformers` (FP32 o FP16), ONNX Runtime (FP32 o INT8, también en CPU), y exportación a otros runtimes ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la ventana de 512 tokens, se espera latencia de milisegundos en GPU y decenas de milisegundos por lote en CPU con ONNX INT8, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros (backbone) | Contexto | Sentimiento arabizi (Acc) | Sentimiento foro (Acc) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DZAIR | 68,44 M (105,3 M totales) | 512 | 65,52 | 96,33 | Apache-2.0 | Hugging Face, FP32/FP16/ONNX |
| DziriBERT | 85,05 M | no disponible | 63,22 | 94,30 | no disponible en la información | Hugging Face |
| Modelos multilingües genéricos (p. ej. mBERT, XLM-R base) | no disponible | 512 | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa solo es posible con DziriBERT, el único modelo para el que la model card ofrece cifras bajo el mismo protocolo. DZAIR gana en arabizi y foro, pero pierde en Twitter (−0,68 de accuracy), emoción de 10 clases (−1,26) y en la tarea DID Algiers vs. MSA (−4,91), por lo que la ventaja no es uniforme entre dominios.

## Limitaciones y advertencias

- Ventana de contexto limitada a 512 tokens; no apta para documentos largos sin troceado previo.
- Resultados inferiores a DziriBERT en tres de las seis tareas evaluadas (Twitter, emoción y DID), lo que sugiere menor robustez fuera de los dominios de arabizi y foro.
- Los benchmarks son declarados por el autor, con `verified: false`, sobre conjuntos de test pequeños (92 y 143 ejemplos en dos tareas), lo que implica alta varianza y escasa significación estadística.
- El texto latino debe pasarse en minúsculas; en mayúsculas la fertilidad de tokens aumenta aproximadamente un 10 %.
- Los dígitos fonéticos del arabizi no deben transliterarse, ya que son piezas atómicas del vocabulario.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de representaciones sesgadas hacia los dominios y registros presentes en las 10 fuentes de entrenamiento; no se detalla su composición ni sesgos conocidos.
- Cobertura limitada al dariya argelino y al code-switching con francés; no se garantiza buen rendimiento en otras variedades magrebíes ni en árabe estándar puro.
- Licencia Apache-2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_dzair.py` antes de desplegarlo en producción.
- No es un modelo generativo: no puede usarse para completar texto, mantener conversaciones ni invocar herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algerian-nlp/DZAIR
- Organización Algerian NLP: https://huggingface.co/algerian-nlp
- DziriBERT (modelo de referencia): https://huggingface.co/algerian-nlp/dziribert
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
