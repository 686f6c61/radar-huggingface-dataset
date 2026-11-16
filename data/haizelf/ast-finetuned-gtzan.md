# HAizelf/ast-finetuned-gtzan

## Resumen

`HAizelf/ast-finetuned-gtzan` es un modelo de clasificación de audio basado en la arquitectura Audio Spectrogram Transformer (AST), especializado en la clasificación de géneros musicales en 10 categorías. Lo desarrolla el usuario HAizelf como parte del curso de audio de Hugging Face (Unit 4) y parte del checkpoint preentrenado `MIT/ast-finetuned-audioset-10-10-0.4593`, afinado sobre el conjunto de datos GTZAN. El modelo tiene 86.196.490 parámetros y un tamaño de repositorio de 0,3 GB.

El modelo resuelve una tarea acotada y bien definida: dado un fragmento de audio musical de 10 segundos, asignarle uno de los 10 géneros del corpus GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock). No es un modelo generativo ni un LLM: no produce texto, no soporta tool calling ni razonamiento multi-paso. Es un clasificador discriminativo de audio.

Su relevancia es fundamentalmente práctica y educativa: demuestra un pipeline completo de fine-tuning de AST sobre GTZAN con linear probing seguido de fine-tuning completo y layer-wise learning-rate decay, alcanzando un 96 % de accuracy a nivel de clip en el split de test. Es útil como referencia para quien quiera reproducir o adaptar un clasificador de género musical, y como componente en pipelines de etiquetado automático de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de 10 s por chunk; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de audio, sin soporte linguistico declarado) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AST es un transformer puro que opera sobre espectrogramas de audio tratados como una secuencia de parches (patches), de forma análoga a ViT sobre imágenes. El modelo parte del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`, preentrenado en AudioSet, y se afina sobre GTZAN para clasificación de 10 clases. El entrenamiento combinó primero linear probing y después fine-tuning completo con layer-wise learning-rate decay, sobre recortes aleatorios de 10 s.

Los hiperparámetros declarados incluyen learning rate 3e-5, batch size efectivo 16 (2 por dispositivo con 8 pasos de acumulación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 135 pasos de warmup y 1352 pasos totales, precisión mixta nativa (AMP) y semilla 42. El mejor checkpoint es el paso 845 (época 5). En evaluación, los clips se remuestrean a 16 kHz y se cortan en chunks de 10 s (descartando colas menores de 2 s), promediando los logits por chunk a nivel de clip. El modelo se entrenó con Transformers 5.22.0, PyTorch 2.15.0, Datasets 3.6.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de audio musical en 10 géneros (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de audio a 16 kHz con ventanas de 10 s por chunk y agregación de logits a nivel de clip.
- Extracción de representaciones de audio mediante el encoder AST (útil para embeddings o transfer learning).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: es exclusivamente audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: el modelo clasifica cada pista en uno de los 10 géneros de GTZAN procesando chunks de 10 s y promediando logits, lo que permite organizar catálogos grandes sin intervención manual.
- Moderación y filtrado de contenido en plataformas de streaming: detección de género para enrutar pistas a playlists o secciones editoriales, aprovechando la accuracy del 96 % a nivel de clip en el dominio de GTZAN.
- Investigación en MIR (Music Information Retrieval): uso como baseline reproducible para comparar técnicas de fine-tuning de AST, dado que el autor documenta hiperparámetros, curvas de entrenamiento y métricas por época.
- Construcción de datasets etiquetados: generación de etiquetas de género a escala sobre audio no anotado, con revisión humana posterior en los casos de baja confianza.
- Recomendación musical por similitud de género: combinación de las representaciones del encoder AST con un índice vectorial para recuperar pistas del mismo género.
- Educación y demos: ejemplo didáctico de pipeline completo (linear probing + fine-tuning) sobre Hugging Face Transformers, adecuado para talleres y cursos de audio.
- Preprocesado en pipelines de análisis musical: primera etapa de clasificación gruesa antes de modelos más específicos (tempo, instrumentos, estado de ánimo).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| GTZAN (split test, 100 clips) | Accuracy (clip-level) | 0,9600 |
| GTZAN (split test) | Chunk Accuracy | 0,9167 |
| GTZAN (split test) | Loss | 0,3598 |

Evolución declarada durante el entrenamiento (extracto):

| Epoca | Paso | Accuracy | Chunk Accuracy | Validation Loss |
|---|---|---|---|---|
| 1 | 169 | 0,8900 | 0,8567 | 0,6314 |
| 3 | 507 | 0,9200 | 0,8900 | 0,5108 |
| 5 | 845 | 0,9600 | 0,9167 | 0,3598 |
| 8 | 1352 | 0,9600 | 0,9167 | 0,3638 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (86,2 M de parámetros), más activaciones y buffers de audio; en la práctica, menos de 2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es muy ligero.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1660 en adelante, con holgura).
- Opciones de despliegue: `transformers` con `AutoModelForAudioClassification`, servido mediante pipelines de Hugging Face, FastAPI o TorchServe. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Accuracy GTZAN |
|---|---|---|---|---|---|
| HAizelf/ast-finetuned-gtzan | 86,2 M | Clasificacion de genero (10 clases) | Audio 16 kHz, chunks de 10 s | BSD-3-Clause | 0,96 (declarado) |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M | Clasificacion de audio (AudioSet, 527 clases) | Audio 16 kHz, 10 s | BSD-3-Clause | no disponible (no afinado en GTZAN) |
| Modelos CNN clasicos sobre GTZAN (referencia de literatura) | variable | Clasificacion de genero | Mel-espectrogramas | variable | no disponible en la informacion proporcionada |

No se dispone de datos comparativos verificados con otros checkpoints afinados en GTZAN en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo 10 géneros de GTZAN; no generaliza a subgéneros, música no occidental ni etiquetas fuera de ese conjunto.
- GTZAN tiene problemas conocidos de calidad (duplicados, ruido de etiquetas, fragmentos mal etiquetados); el 96 % de accuracy debe interpretarse con cautela y no como rendimiento en producción.
- El split de test es de solo 100 clips (10 % de GTZAN), lo que implica alta varianza en la métrica reportada.
- Riesgo de sobreajuste al dominio: el modelo se entrenó sobre recortes de 10 s de un corpus pequeño; pistas con estructura atípica o fragmentos cortos pueden clasificarse mal.
- Sesgos de género musical: la distribución de GTZAN está desequilibrada y sobrerrepresenta ciertos estilos; el modelo puede favorecer clases mayoritarias.
- Sin información sobre sesgos demográficos o culturales: la model card no documenta análisis de sesgo.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos exactos antes de redistribuir.
- No apto para tareas generativas, de texto ni multimodales: cualquier uso fuera de clasificación de audio es inadecuado.
- El modelo no ha sido validado de forma independiente; los resultados son autodeclarados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HAizelf/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Curso de audio de Hugging Face (Unit 4): https://huggingface.co/learn/audio-course
- Paper de AST (referencia de arquitectura): https://arxiv.org/abs/2104.01778
