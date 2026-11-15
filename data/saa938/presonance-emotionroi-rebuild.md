# saa938/presonance-emotionroi-rebuild

## Resumen

Presonance EmotionROI es un ensemble de clasificación de imágenes para reconocimiento de emociones faciales en seis categorías (anger, disgust, fear, joy, sadness, surprise). Lo publica el usuario `saa938` en Hugging Face y se construye sobre ocho backbones visuales preentrenados (CLIP, EVA02, PE-Core, SigLIP2 y DFN, entre otros), cada uno adaptado al dataset EmoSet y entrenado con tres semillas distintas, sumando 24 checkpoints reales. La contribución del autor es la adaptación al conjunto EmotionROI, el entrenamiento específico de la tarea y la fijación del ensemble.

El modelo resuelve la clasificación de emoción dominante en una imagen mediante un vector de probabilidad de seis clases. No es un modelo generativo ni un LLM: es un clasificador de imagen puro construido con la librería `timm`, pensado exclusivamente para investigación. Su relevancia es limitada: se publica como reconstrucción reproducible de un experimento previo, con protocolo, hashes y particiones documentados, más que como un modelo desplegable en producción.

El bundle completo ocupa 32 GB en el repositorio, requiere CUDA y descarga secuencialmente todos los miembros del ensemble en la primera inferencia. La licencia es un paquete mixto de investigación (`presonance-mixed-research-bundle`) que incorpora derivados de DFN sujetos a la licencia no comercial de Apple, por lo que no es un modelo Apache ni apto para uso comercial sin revisión legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 8 backbones visuales (CLIP, EVA02, PE-Core, SigLIP2, DFN) adaptados con `timm` |
| Parametros totales | no disponible (24 checkpoints; el repo pesa 32 GB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen) |
| Tipos de cuantizacion | FP16 almacenado, recargado a FP32 para inferencia; CUDA BF16 durante la evaluación |
| Idiomas soportados | no disponible (modelo de visión, sin etiquetas de idioma) |
| Licencia | `presonance-mixed-research-bundle` (other); incluye derivados DFN bajo licencia de investigación no comercial de Apple |
| Formato de pesos | checkpoints serializados (estado FP16), cargados vía `predict.py`; no se indica GGUF ni safetensors explícitamente |

## Arquitectura y entrenamiento

El modelo es un ensemble fijo de ocho foundations visuales, cada uno entrenado con tres semillas (24 checkpoints en total). La regla de agregación promedia los tres vectores de probabilidad de cada backbone y después promedia por igual sobre todos los backbones; no se seleccionó ningún subconjunto en función de las puntuaciones de TEST. Cada estado se almacenó en FP16, se recargó a FP32 y se evaluó con CUDA BF16 y averaging original/flip.

El protocolo de reconstrucción preserva las foundations originales, las tres semillas, 1.248 imágenes de entrenamiento, 138 de validación interna y 594 de evaluación, con un schedule de 12 épocas y selección por época/raw-vs-EMA en validación interna. Los learning rates de EmotionROI se mantuvieron en los valores originales seleccionados por validación, sin nueva búsqueda. No se indica el número de tokens ni composición del dataset más allá de las imágenes de EmoSet y EmotionROI; los pesos seleccionados se guardaron de nuevo, por lo que no se heredaron puntuaciones históricas. El fichero `training_core.py` se incluye para inspección, no como lanzador de entrenamiento desatendido.

## Capacidades

- Clasificación de imagen en seis emociones: anger, disgust, fear, joy, sadness, surprise.
- Salida como vector de probabilidad de seis dimensiones por imagen.
- Ensemble de ocho backbones con averaging original/flip y tres semillas por backbone.
- Verificación de hashes de checkpoints y fingerprints de parámetros durante la carga.
- Inferencia por lotes (el ejemplo usa `batch_size=64`), con requisito de CUDA.
- Reproducibilidad mediante pinning a un commit concreto vía `huggingface_hub`.
- No soporta tool calling, agentes, generación de texto, matemáticas ni visión general más allá de la clasificación de emoción.
- No se documentan capacidades multilingües ni modos de razonamiento.

## Casos de uso

- Investigación en reconocimiento de emociones faciales: el modelo sirve como baseline reproducible para comparar adaptaciones de foundations visuales sobre EmoSet/EmotionROI, con particiones y protocolo documentados.
- Auditoría de ensembles: permite estudiar el efecto de promediar ocho backbones y tres semillas sobre la calibración y la incertidumbre de un clasificador de seis clases.
- Reproducción de experimentos: el pinning por revisión y la verificación de hashes facilitan replicar exactamente las predicciones publicadas en un entorno aislado.
- Evaluación de incertidumbre: el `evaluation.json` incluye 10.000 draws de incertidumbre y controles que pueden reutilizarse para analizar intervalos de confianza en clasificación de imágenes.
- Análisis de sesgo en datasets de emoción: al ser research-only, puede emplearse para medir discrepancias entre categorías y detectar problemas de anotación en EmoSet.
- Docencia y formación: como ejemplo práctico de ensemble multi-backbone con `timm` y de buenas prácticas de reproducibilidad (hashes, particiones, protocolo congelado).
- No es adecuado para despliegue en producto: requiere CUDA, descarga secuencial de 32 GB y no está cualificado para CPU ni para otros tamaños de lote.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (ensemble serializado) | 75,5892 % |
| Intervalo de confianza simultáneo al 95 % | [71,5488 %, 79,4613 %] |
| Imágenes de evaluación | 594 held-out |
| Comprobación adicional | 577 imágenes tras excluir solapamiento grueso preexistente de EmoSet |

Los resultados son autodeclarados por el autor como reconstrucción y no constituyen una posición aceptada en leaderboard ni una afirmación de SOTA mundial. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 32 GB en FP16 y la inferencia recarga cada checkpoint a FP32, por lo que se necesita memoria CUDA suficiente para el miembro más grande de la foundation.
- GPU recomendadas: no se especifican modelos concretos; se requiere CUDA-enabled PyTorch y memoria para la foundation de mayor tamaño.
- GPU de consumo: no se confirma que quepa en RTX 4090 u otras consumer; el requisito de CUDA y el tamaño del ensemble lo hacen poco probable sin cuantización adicional, que no está cualificada.
- Despliegue: wrapper propio `predict.py` con `huggingface_hub`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles; el autor advierte que es un ensemble de investigación grande, no un modelo de baja latencia.
- Almacenamiento temporal: debe permitir el mayor miembro descargado a la vez, ya que el wrapper descarga secuencialmente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de emoción ni con modelos de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Licencia research-only: el bundle incorpora derivados DFN sujetos a la licencia no comercial de Apple; el uso comercial requiere revisión legal y no está cubierto por Apache.
- Resultados autodeclarados: las puntuaciones son de reconstrucción y no una colocación aceptada en leaderboard ni una afirmación de SOTA.
- Discrepancia histórica: una comprobación contra cachés de validación de entrenamiento falló para un checkpoint PE-CoreG448 de EmotionROI; el autor no afirma que todas las discrepancias históricas estén resueltas.
- Requisito de CUDA: CPU y otros tamaños de lote no están numéricamente cualificados.
- Sin datos de sesgo ni de alucinación: al ser un clasificador, el riesgo principal es la clasificación errónea y el sesgo del dataset EmoSet, no la alucinación generativa.
- Cobertura limitada: solo seis emociones discretas; no cubre idiomas, texto ni otras modalidades.
- Reproducción parcial: algunos checkpoints warmstart antiguos de EmoSet necesarios para reentrenamiento exacto no están incluidos.
- Descarga pesada: 32 GB y descarga secuencial de todos los miembros en la primera inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/saa938/presonance-emotionroi-rebuild
- Licencia DFN: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/LICENSE-DFN-RESEARCH.txt
- NOTICE: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/NOTICE
- Evaluación: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/evaluation.json
- Script de inferencia: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/predict.py
- Protocolo de entrenamiento: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/training_protocol.json
- Núcleo de entrenamiento: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/training_core.py
- Membresía de particiones: https://huggingface.co/saa938/presonance-emotionroi-rebuild/blob/main/split_membership.json
