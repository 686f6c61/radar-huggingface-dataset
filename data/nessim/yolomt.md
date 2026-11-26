# Nessim/YoloMT

## Resumen

YoloMT ("You Only Look Multiple Times") es un modelo de subtitulado de vídeo en tiempo real de 449,8 millones de parámetros, desarrollado por Nessim Benabbes y publicado junto al artículo "You Only Look Multiple Times: YoloMT, a Real-Time Streaming Model on a T4". El modelo genera cada segundo una descripción de 30 a 50 palabras de los últimos 16 segundos de un vídeo en directo, a partir del fotograma actual y de hasta 16 fotogramas anteriores en caché, y funciona en tiempo real sobre una única GPU NVIDIA T4.

Técnicamente, YoloMT es un ajuste fino completo de LiquidAI/LFM2.5-VL-450M (codificador visual SigLIP2 más un modelo de lenguaje LFM2.5-350M) al que se añade un módulo *pooler* de 1,05 M de parámetros que comprime la rejilla 8x8 de 64 tokens de proyección de cada fotograma en 16 tokens almacenables. El número de fotogramas pasados que lee cada subtítulo (lookback L, de 0 a 16) se elige en tiempo de ejecución sin cambiar de pesos, lo que permite un único conjunto de parámetros para distintos compromisos entre latencia y contexto.

Su relevancia radica en la combinación de tres factores poco habituales en modelos de este tamaño: un proceso de destilación en tres etapas desde Qwen3.8-27B con GRPO posterior, un rendimiento en tiempo real verificado sobre hardware de gama baja (p99 de 12,66-12,69 ms por fotograma a 30 FPS con 997 MiB de VRAM) y una mejora medible de +5,0 puntos de precisión media frente a su modelo base en cuatro benchmarks de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual SigLIP2 + modelo de lenguaje LFM2.5-350M + pooler de 1,05 M de parámetros |
| Parámetros totales | 449.768.448 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de 16 segundos de vídeo (fotograma actual más hasta 16 fotogramas en caché a 1 fps); longitud de contexto textual no disponible |
| Tipos de cuantización | FP16 (motor TensorRT del repositorio); bfloat16 en los pesos publicados; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés |
| Licencia | LFM Open License v1.0 (uso comercial limitado a entidades con ingresos anuales inferiores a 10 millones de USD) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

YoloMT parte de LFM2.5-VL-450M y le añade un *pooler* que reduce la representación de cada fotograma. Cada fotograma (256x256, uno por segundo) pasa por el codificador visual una sola vez, cuando es el fotograma presente, y se almacena en caché como 16 tokens: el *pooler* promedia la rejilla 8x8 de 64 tokens del proyector sobre bloques 2x2 y añade un residuo aprendido (z = x + Wx + b). Cada subtítulo lee los 64 tokens del fotograma actual y los bloques en caché de los últimos L fotogramas. El valor de L (0 a 16) se elige en ejecución y un único conjunto de pesos sirve para todos los valores; aumentar L cuesta 18 tokens de prompt por fotograma y ningún pase adicional por el codificador visual.

El entrenamiento consta de tres etapas de destilación desde Qwen3.8-27B en FP8. Primero, el profesor genera subtítulos de la vista exacta del estudiante (los mismos fotogramas de 256x256 desde t-16 s hasta t a 1 fps, sin mirar al futuro). Después, se aplica un ajuste fino supervisado de todos los pesos sobre 941.483 ventanas (79.216 de LLaVA-Video-178K y 862.267 de OpenVid-1M), cada una entrenada con L = 0, con un L intermedio y con el L máximo disponible. Finalmente, se aplica GRPO sobre 39.502 ventanas con el lookback compartido dentro de cada grupo y una penalización KL por token (beta 0,04) hacia el modelo de SFT; la recompensa combina recuerdo y precisión de hechos frente a las afirmaciones consensuadas del profesor y respuestas de opción múltiple, ambas puntuadas por Qwen3.5-9B, con una puerta y un término de fluidez, y vale cero para subtítulos de más de 60 palabras. La selección de checkpoints usó phi-4 sobre subtítulos de desarrollo reservados. Antes de estas etapas, el entrenamiento arranca de un subtitulador de 2 s (SFT con LoRA sobre 335.822 ventanas de subtítulos del profesor de 2 s de clips de LLaVA-Video-178K y, para 11.791 de ellos, de ShareGPT4Video) y después un SFT de lookback hasta L = 5 sobre las mismas etiquetas.

## Capacidades

- Generación de subtítulos de vídeo en inglés de 30 a 50 palabras por segundo, describiendo los últimos 16 segundos.
- Procesamiento de flujo de vídeo en tiempo real con caché de representaciones por fotograma (sin recodificar el pasado en el motor de despliegue).
- Lookback configurable en ejecución (L de 0 a 16) con un único conjunto de pesos, para ajustar latencia y contexto.
- Razonamiento temporal limitado a la ventana de 16 segundos; no hay memoria más allá de esa ventana.
- Capacidad de responder preguntas de vídeo de forma indirecta: los subtítulos generados permiten a un modelo de texto responder preguntas (evaluado con Mistral-Small-24B-Instruct-2501).
- No soporta audio, habla ni tool calling; no se ha entrenado para identificar personas.

## Casos de uso

- Subtitulado automático de retransmisiones en directo: el modelo genera una descripción cada segundo de los últimos 16 segundos, adecuado para canales de noticias, deportes o eventos donde se necesita texto descriptivo continuo con latencia inferior a un segundo.
- Accesibilidad para personas con discapacidad auditiva: descripciones textuales en tiempo real de lo que ocurre en un vídeo, complementarias a los subtítulos de diálogo, ejecutables sobre una T4 de bajo coste.
- Moderación y monitorización de contenido en streaming: el flujo de subtítulos permite detectar escenas o eventos descritos textualmente y activar alertas, con la ventaja de que el modelo cabe en 997 MiB de VRAM y puede convivir con otros servicios en la misma GPU.
- Indexación y búsqueda de archivos de vídeo: procesar grabaciones a 1 fps para generar descripciones por segundo que alimenten un índice de búsqueda semántica, con la opción de usar L = 16 para mayor fidelidad cuando la latencia no es crítica.
- Análisis de vídeo en dispositivos de borde: el requisito de una T4 y menos de 1 GiB de memoria permite desplegar el motor TensorRT en servidores de gama baja o en entornos con GPUs modestas.
- Generación de metadatos para pipelines de vídeo: producir descripciones automáticas para catálogos, archivos audiovisuales o plataformas de contenido, usando el modo PyTorch de referencia para procesamiento por lotes sin restricción de tiempo real.
- Investigación en destilación y aprendizaje por refuerzo: el modelo y su dataset de etiquetas (Nessim/YoloMT-labels) sirven como referencia reproducible para estudiar destilación multimodal con GRPO.

## Benchmarks y rendimiento

Resultados del artículo, con subtítulos en L = min(t, 16). Precisión de "subtitular y responder" (%): un respondedor de solo texto (Mistral-Small-24B-Instruct-2501) responde cada pregunta a partir únicamente de los subtítulos.

| Modelo | OVO-Bench Real-Time | MVBench | StreamingBench Real-Time | Video-MME (short) | Media |
|---|---|---|---|---|---|
| YoloMT | 45,9 | 39,5 | 50,2 | 46,2 | 45,5 |
| LFM2.5-VL-450M (base) | 38,6 | 35,5 | 45,6 | 42,0 | 40,4 |
| Sin subtítulos | 27,8 | 27,6 | 33,5 | 28,7 | 29,4 |
| Qwen3.8-27B (profesor) | 52,7 | 47,2 | 54,8 | 54,0 | 52,2 |

En la media de los cuatro benchmarks, YoloMT supera a LFM2.5-VL-450M en +5,0 puntos [+3,7; +6,4], y leer 16 fotogramas pasados en lugar de ninguno aporta +2,5 [+1,2; +3,7].

Fact-F1 de los subtítulos como porcentaje del techo de autoacuerdo del profesor (juez: phi-4): 83,8% con L = 0 y 92,6% con L = 16 en clips reservados de OpenVid-1M; 71,8% con L = 16 en el test de LLaVA-Video.

Rendimiento en tiempo real sobre una T4 (TensorRT 10.16.1.11, FP16, batch 1, 30 FPS): el tiempo p99 por fotograma se mantiene en 12,66-12,69 ms para todo L de 0 a 16, dentro de la mitad del periodo de 33 ms por fotograma, con 997 MiB de memoria de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: 997 MiB con el motor TensorRT en FP16 (batch 1); los pesos en bfloat16 ocupan aproximadamente 0,9 GB.
- GPU recomendadas: NVIDIA T4 para el motor en tiempo real; cualquier GPU con soporte de TensorRT 10.16.1.11 y FP16.
- Cabe en GPU de consumo: sí, por tamaño de pesos y memoria; no se han publicado mediciones específicas en GPUs de consumo.
- Opciones de despliegue: motor TensorRT propio del repositorio (carpeta `deploy/`) para tiempo real; referencia en PyTorch mediante `scripts/caption.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p99 de 12,66-12,69 ms por fotograma a 30 FPS en una T4, independiente de L entre 0 y 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmarks de vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YoloMT | 449,8 M | 16 s de vídeo | 45,5 | LFM Open License v1.0 (límite de 10 M USD de ingresos) | Pesos en Hugging Face |
| LFM2.5-VL-450M | 450 M (aprox.) | No disponible | 40,4 | No disponible | Modelo base en Hugging Face |
| Qwen3.8-27B (profesor) | 27 B (aprox.) | No disponible | 52,2 | No disponible | No disponible en la información proporcionada |

No se dispone de datos de otros modelos comparables de subtitulado en streaming en la información proporcionada.

## Limitaciones y advertencias

- Solo genera subtítulos en inglés de 30 a 50 palabras que describen los últimos 16 segundos; no procesa audio ni habla y no tiene memoria más allá de 16 segundos.
- Fact-F1 mide el acuerdo con las afirmaciones del profesor, por lo que los errores del profesor no se penalizan en la evaluación.
- Con L = 0 el modelo inventa detalles que un solo fotograma no muestra; conviene leer más fotogramas pasados cuando la latencia lo permita.
- La decodificación greedy en bfloat16 puede cambiar una palabra en empates cercanos según la GPU y el tamaño de batch.
- No se ha evaluado para uso en sistemas críticos de seguridad y no se ha entrenado para identificar personas.
- La licencia LFM Open License v1.0 limita el uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD.
- Los vídeos de entrenamiento provienen de LLaVA-Video-178K (uso académico y educativo), OpenVid-1M (CC BY 4.0) y ShareGPT4Video (CC BY-NC 4.0, con clips de Mixkit, Panda-70M, Ego4D y BDD100K bajo sus propios términos), lo que puede condicionar usos derivados.
- Riesgo de alucinación en detalles visuales no presentes en los fotogramas, especialmente con lookback bajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nessim/YoloMT
- Artículo: https://arxiv.org/abs/2611.34601
- Repositorio de código (entrenamiento, evaluación y motor TensorRT): https://github.com/NessimBenA/YoloMT
- Dataset de etiquetas: https://huggingface.co/datasets/Nessim/YoloMT-labels
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Dataset LLaVA-Video-178K: https://huggingface.co/datasets/lmms-lab/LLaVA-Video-178K
- Dataset OpenVid-1M: https://huggingface.co/datasets/nkp37/OpenVid-1M
