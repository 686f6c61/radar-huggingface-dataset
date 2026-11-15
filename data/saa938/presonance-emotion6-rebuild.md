# saa938/presonance-emotion6-rebuild

## Resumen

Presonance Emotion6 es un ensamblado (ensemble) de 18 modelos de clasificación de imágenes entrenados específicamente para el reconocimiento de emociones faciales en siete categorías (anger, disgust, fear, joy, sadness, surprise y neutral). Lo desarrolla el usuario independiente saa938 y se distribuye bajo una licencia de investigación no comercial denominada `presonance-mixed-research-bundle`, que incorpora derivados del modelo DFN de Apple sujetos a su licencia de investigación no comercial. El modelo se publica como bundle de reconstrucción reproducible y no como producto listo para producción.

Técnicamente, el ensemble combina seis foundations visuales externos (CLIP, EVA02, PE-Core, SigLIP2 y DFN, entre otros) entrenados con tres semillas cada uno, sumando 18 checkpoints reales. La contribución del autor es la adaptación al dataset EmoSet, el entrenamiento específico de la tarea y la regla de agregación fija del ensemble. El resultado es una distribución de probabilidad de siete clases, no una etiqueta única, lo que permite cuantificar la incertidumbre del modelo por imagen.

Su relevancia actual es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes, pensado para reproducibilidad y auditoría de resultados autodeclarados, no para despliegues comerciales. El repositorio ocupa 18,9 GB y requiere CUDA para su inferencia cualificada numéricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 6 foundations visuales basados en timm (CLIP, EVA02, PE-Core, SigLIP2, DFN), 3 semillas por foundation |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | Checkpoints almacenados en FP16, recargados en FP32 para evaluación; inferencia con CUDA BF16 |
| Idiomas soportados | no disponible (tarea de visión; etiquetas en inglés) |
| Licencia | `presonance-mixed-research-bundle` (other); incluye derivados DFN bajo licencia de investigación no comercial de Apple |
| Formato de pesos | Checkpoints serializados (formato exacto no especificado); repo de 18,9 GB |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo de modelos de visión por computador construidos sobre la librería `timm`. Cada uno de los seis foundations visuales se entrenó con tres semillas independientes, generando 18 checkpoints. La regla de agregación es fija: se promedian los tres vectores de probabilidad de cada backbone y después se promedian equitativamente todos los backbones, sin selección de subconjuntos basada en las puntuaciones del conjunto de test reconstruido. Cada checkpoint se almacenó en FP16, se recargó a FP32 y se evaluó con CUDA en BF16, promediando la imagen original y su versión volteada horizontalmente.

El protocolo de entrenamiento preserva las condiciones históricas: 1.248 imágenes de entrenamiento, 138 de validación interna, 594 de evaluación, un calendario de 12 épocas y selección por época de validación interna entre pesos brutos y EMA. Los learning rates de EmotionROI se mantuvieron en los valores seleccionados por validación original, sin nueva búsqueda. El autor indica que los pesos desplegables se guardaron de nuevo, de modo que las puntuaciones históricas no se heredaron. No se dispone de información sobre el número de tokens de entrenamiento (no aplica) ni sobre el uso de RLHF/DPO, al tratarse de clasificación supervisada.

## Capacidades

- Clasificación de emociones faciales en siete clases: anger, disgust, fear, joy, sadness, surprise y neutral.
- Salida como distribución de probabilidad de siete dimensiones (votos de emoción), lo que permite medir incertidumbre.
- Procesamiento por lotes de imágenes (batch_size configurable, validado numéricamente a 64).
- Inferencia con aumento de test (original y flip) para mayor robustez.
- Verificación de hashes de checkpoints y descarga secuencial de miembros del ensemble.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (tarea puramente visual).
- No incluye modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Investigación en reconocimiento de emociones: el modelo sirve como referencia reproducible para comparar arquitecturas de ensemble en el dataset EmoSet, con protocolo y semillas documentados.
- Auditoría de incertidumbre: al devolver una distribución de siete clases, permite estudiar calibración y confianza en clasificación afectiva, por ejemplo midiendo la divergencia KL frente a anotaciones humanas.
- Análisis de sesgo en datasets de emociones: la combinación de seis foundations permite examinar si distintos backbones discrepan sistemáticamente en determinadas caras o condiciones de iluminación.
- Benchmarking de foundations visuales: comparar el comportamiento de CLIP, EVA02, PE-Core, SigLIP2 y DFN en una tarea concreta de clasificación facial bajo un mismo protocolo de entrenamiento.
- Docencia y reproducción académica: el bundle incluye `split_membership.json`, `training_protocol.json` y `training_core.py` para inspección del pipeline, útil en cursos de visión por computador.
- Evaluación de pipelines de agregación: estudiar cómo distintas reglas de combinación (media de semillas, media de backbones, flip averaging) afectan a la divergencia KL en un conjunto de test fijo.
- No es adecuado para atención al cliente, moderación en producción ni aplicaciones comerciales de análisis emocional, dada su licencia y su naturaleza de investigación.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL (ensemble serializado) | 0,223981 (menor es mejor) |
| Intervalo de confianza simultáneo al 95 % | [0,211857, 0,236585] |
| Imágenes de evaluación retenidas | 594 |
| Imágenes tras excluir solapamiento grueso de EmoSet | 577 |
| Repetición estricta (64 primeras imágenes) | Concordancia dentro de umbral 1e-6 |

Los resultados son autodeclarados por el autor como reconstrucción y no constituyen una posición aceptada en leaderboard ni una afirmación de SOTA mundial. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor advierte que se necesita memoria CUDA suficiente para el mayor foundation del ensemble.
- GPU recomendadas: no especificadas; se requiere una GPU con soporte CUDA y BF16.
- Cabe en GPU de consumo: no confirmado; el tamaño del repo (18,9 GB) y la carga secuencial de checkpoints sugieren que podría requerir GPUs de gama alta o profesional.
- Opciones de despliegue: el repositorio proporciona `predict.py` con la clase `EmotionPredictor`, que descarga los miembros secuencialmente y verifica hashes. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor indica explícitamente que es un ensemble de investigación grande y no un modelo de baja latencia.
- Espacio temporal en disco: debe permitir almacenar el mayor miembro del ensemble durante la descarga.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no incluye comparaciones con otros ensembles de reconocimiento de emociones ni con clasificadores individuales de EmoSet. Los foundations utilizados (CLIP, EVA02, PE-Core, SigLIP2, DFN) son modelos genéricos de visión, pero no se ofrecen métricas comparativas en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Presonance Emotion6 | no disponible (ensemble de 18 checkpoints) | no aplica | KL 0,223981 en 594 imágenes | research-only | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia estrictamente de investigación: incorpora derivados DFN sujetos a la licencia no comercial de Apple; no es un bundle Apache para uso comercial.
- Resultados autodeclarados: las puntuaciones de KL no han sido validadas por un leaderboard externo ni por revisión por pares.
- Discrepancia histórica no resuelta: una comprobación contra cachés de validación falló para un checkpoint PE-CoreG448 de EmotionROI; el autor no afirma que todas las discrepancias históricas estén resueltas.
- Requiere CUDA: la inferencia en CPU y otros tamaños de lote no están cualificados numéricamente.
- Sesgos potenciales: al entrenarse sobre EmoSet, puede heredar sesgos demográficos, culturales y de etiquetado del dataset original; no se documentan análisis de equidad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la salida de distribución puede sobreconfiar en caras ambiguas u ocluidas.
- Limitaciones de idioma: las etiquetas están en inglés y no hay soporte multilingüe declarado.
- Restricciones de reproducción: algunos checkpoints warmstart de EmoSet necesarios para un reentrenamiento exacto no están incluidos; las imágenes y anotaciones deben adquirirse por separado bajo licencia.
- Advertencia de concurrencia: la ruta temporal original de mejor estado es por worker y no es segura para ajustes concurrentes que compartan sistema de archivos.
- No apto para producción de baja latencia: la descarga secuencial de todos los miembros y el tamaño del ensemble lo desaconsejan para servicios en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saa938/presonance-emotion6-rebuild
- Licencia DFN de investigación: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/LICENSE-DFN-RESEARCH.txt
- NOTICE del bundle: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/NOTICE
- Resultados de evaluación: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/evaluation.json
- Membresía de splits: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/split_membership.json
- Protocolo de entrenamiento: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/training_protocol.json
- Código de entrenamiento: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/training_core.py
- Script de inferencia: https://huggingface.co/saa938/presonance-emotion6-rebuild/blob/main/predict.py
