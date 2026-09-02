# Hayasuki/chuckleNet-v2

## Resumen

ChuckleNet-v2 es un modelo de detección de risa en audio desarrollado por Subhajit Das (Hayasuki), presentado como el primer sistema que detecta la risa más allá del lenguaje hablado. A diferencia de los modelos de lenguaje convencionales, este clasificador opera exclusivamente sobre señales acústicas de prosodia (tono, energía, calidad de voz) y características espectrales, sin depender de transcripciones de texto. El modelo resuelve el problema de capturar señales emocionales no verbales en conversaciones humanas, un aspecto que los sistemas de ASR y TTS suelen ignorar.

La arquitectura combina un encoder WavLM congelado (768 dimensiones) con un vector de prosodia de 23 dimensiones, fusionando ambas representaciones en un MLP que clasifica cada fragmento de audio de 5 segundos como risa o no risa. El modelo se entrenó con 221 vídeos de comedia en inglés y alcanza una F1 de validación de 0,879 ± 0,022 mediante validación cruzada de 5 pliegues con GroupKFold. Su relevancia actual radica en su naturaleza independiente del idioma: al no requerir texto, funciona en cualquier lengua sin necesidad de datos etiquetados adicionales, y puede ejecutarse en tiempo real sobre flujos de audio sin pasar por un ASR.

El repositorio en Hugging Face no contiene pesos publicados (tamaño 0,0 GB), por lo que la ficha se basa únicamente en la documentación proporcionada por el autor. La licencia MIT permite uso comercial, aunque la ausencia de artefactos descargables limita su aplicación práctica inmediata.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de fusión sobre características WavLM (768-dim) + prosodia (23-dim) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa fragmentos de audio de 5 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (independiente del idioma por diseño) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio sin archivos, tag PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de clasificación binaria sobre fragmentos de audio fijos de 5 segundos. La entrada es un vector de 791 dimensiones compuesto por 768 características extraídas de un encoder WavLM congelado y 23 características de prosodia (F0, RMS, tasa de cruces por cero y descriptores espectrales). Estas representaciones se concatenan y alimentan un MLP que produce una salida binaria (risa vs. no risa). El autor reporta que la prosodia por sí sola alcanza una F1 de 0,715, mientras que la fusión completa llega a 0,879, lo que sugiere que las características prosódicas capturan la mayor parte de la señal discriminativa con una complejidad 33 veces menor.

El entrenamiento se realizó sobre 221 vídeos de stand-up comedy en inglés, utilizando validación cruzada de 5 pliegues con GroupKFold para evitar fugas entre vídeos. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; el enfoque es puramente supervisado sobre etiquetas de risa por fragmento. La innovación principal reside en la combinación de un transformer preentrenado congelado con características acústicas tradicionales, demostrando que la prosodia puede rivalizar con representaciones profundas en esta tarea específica.

## Capacidades

- Detección de risa en audio sin necesidad de transcripción de texto.
- Clasificación binaria por fragmentos de 5 segundos (risa vs. no risa).
- Independiente del idioma: funciona sobre cualquier lengua sin entrenamiento adicional.
- Procesamiento en tiempo real sobre flujos de audio sin ASR previo.
- Captura de señales emocionales no verbales que complementan sistemas de ASR y TTS.
- Extracción de características prosódicas (F0, RMS, ZCR, espectrales) como entrada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede detectar cuándo un usuario se ríe durante una interacción telefónica o por voz, permitiendo al sistema ajustar su tono o derivar la conversación a un agente humano si la risa indica satisfacción o confusión.
- Resumen de reuniones y presentaciones: al procesar grabaciones de audio, ChuckleNet puede marcar los momentos en que el público ríe, facilitando la identificación de puntos de interés o reacciones positivas en actas automatizadas.
- Moderación de contenido en plataformas de vídeo: la detección de risa a escala permite clasificar contenido cómico o entretenido, útil para sistemas de recomendación o filtrado de contenido positivo.
- Doblaje y localización: las regiones de risa no se traducen entre idiomas; este modelo puede identificar esos segmentos para que los equipos de doblaje los preserven o adapten adecuadamente.
- Análisis de sentimiento en audio: complementa sistemas de ASR añadiendo una capa de señal no verbal, mejorando la comprensión del estado emocional del hablante en encuestas de voz o entrevistas.
- Desarrollo de agentes conversacionales: integrar la detección de risa permite que un asistente de voz responda de forma más empática, por ejemplo celebrando un chiste del usuario o ajustando el ritmo de la conversación.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados reportados en la model card. El autor advierte explícitamente que su métrica F1 no es comparable con la IoU-F1 de StandUp4AI, ya que ambas miden granularidades distintas (fragmentos de 5 segundos frente a segmentos a nivel de palabra).

| Modelo | Métrica | Dataset | Resultado |
|---|---|---|---|
| ChuckleNet (fusión) | F1 | 221 vídeos de comedia (inglés) | 0,879 ± 0,022 |
| ChuckleNet (solo prosodia) | F1 | 221 vídeos de comedia (inglés) | 0,715 |
| WavLM MLP (solo 768-dim) | F1 | 221 vídeos de comedia (inglés) | 0,220 |
| StandUp4AI (EMNLP 2025) | IoU-F1 | 330 horas, 7 idiomas | 0,51 |
| Gillick et al. 2021 | F1 | Switchboard | 0,75 |

No se han publicado resultados de benchmarks en la información disponible más allá de los presentados en la model card. La comparación directa con trabajos previos es problemática por las diferencias metodológicas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- La extracción de características WavLM requiere un modelo transformer preentrenado, que típicamente necesita una GPU con al menos 8 GB de VRAM para inferencia en tiempo real (por ejemplo, una RTX 3060 o superior).
- El MLP de clasificación en sí es ligero y podría ejecutarse en CPU, pero la dependencia de WavLM para las características hace que la GPU sea necesaria para un flujo completo.
- El repositorio no contiene pesos publicados (0,0 GB), por lo que no es posible desplegar el modelo directamente desde Hugging Face.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de audio, la integración requeriría un pipeline personalizado con PyTorch y una librería de procesamiento de audio (por ejemplo, librosa o torchaudio).

## Comparativa con modelos similares

| Modelo | Enfoque | Métrica | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChuckleNet-v2 | Audio-only, chunk-level (5s) | F1=0,88 | Comedia en inglés | MIT | Sin pesos publicados |
| StandUp4AI (EMNLP 2025) | Word-level, requiere texto | IoU-F1=0,51 | 7 idiomas, 330h | no disponible | no disponible |
| Gillick et al. 2021 | Utterance-level | F1=0,75 | Switchboard (inglés) | no disponible | no disponible |

La comparación es limitada porque los tres sistemas usan métricas y granularidades distintas. ChuckleNet se distingue por no requerir texto y ser independiente del idioma, pero su dominio de entrenamiento es estrecho (comedia en inglés) y carece de pesos descargables.

## Limitaciones y advertencias

- El modelo opera únicamente sobre fragmentos fijos de 5 segundos; no proporciona marcas temporales a nivel de palabra ni precisión sub-segundo.
- Fue entrenado exclusivamente en vídeos de stand-up comedy en inglés; la generalización a otros dominios (conversaciones cotidianas, entrevistas, etc.) no está garantizada y probablemente degrade el rendimiento.
- Cada fragmento se clasifica de forma independiente, sin considerar contexto temporal entre fragmentos adyacentes, lo que puede generar predicciones inconsistentes en secuencias largas.
- La métrica F1 reportada no es comparable con la IoU-F1 utilizada en otros trabajos como StandUp4AI; cualquier comparación directa sería engañosa.
- El repositorio de Hugging Face no contiene archivos de pesos (tamaño 0,0 GB), por lo que el modelo no es utilizable directamente en su estado actual; solo existe la documentación y el código fuente referenciado en GitHub.
- No se ha publicado información sobre sesgos del modelo, aunque al entrenarse en un dominio específico es probable que tenga un sesgo hacia el humor anglófono y ciertos patrones prosódicos.
- La licencia MIT permite uso comercial, pero la ausencia de artefactos distribuibles impide su integración práctica sin reentrenamiento desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hayasuki/chuckleNet-v2
- Demo (spaces): https://huggingface.co/spaces/Hayasuki/a3m-router
- Código fuente (GitHub): https://github.com/Das-rebel/autonomous_laughter_prediction
- Perfil del autor: https://huggingface.co/Hayasuki
