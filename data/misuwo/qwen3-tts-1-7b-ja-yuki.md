# Misuwo/qwen3-tts-1.7b-ja-yuki

## Resumen

Misuwo/qwen3-tts-1.7b-ja-yuki es un ajuste fino (fine-tune) de síntesis de voz en japonés sobre el modelo base Qwen3-TTS-12Hz-1.7B-Base, entrenado con grabaciones de la propia autora, Yuki Orita. Se trata de un modelo de texto-a-voz (text-to-speech) de 1.916.676.352 parámetros (aproximadamente 1,9 mil millones) que incorpora una voz personalizada registrada bajo el identificador `yuki`, lo que permite generar audio en japonés con esa timbre concreto sin necesidad de clonación en tiempo de inferencia.

El modelo resuelve el problema del TTS con voz propia en japonés: partiendo del modelo base de Qwen (arquitectura de tipo talker con tokenizador de audio a 12 Hz), se aplicó un LoRA de rango 8 sobre las proyecciones de atención y MLP del talker, cuyos pesos se fusionaron en el checkpoint FP16 publicado. Adicionalmente, el repositorio incluye un adaptador LoRA independiente en formato MLX (rango 16) entrenado en Apple Silicon para quienes trabajan en Mac con memoria unificada.

Es relevante ahora porque pertenece a la familia Qwen3-TTS, publicada bajo licencia Apache-2.0, y demuestra que con muy pocos datos (382 clips, unas 0,34 horas) y hardware modesto (una Tesla T4 de 14,56 GiB) es posible obtener un modelo de voz personalizada listo para inferencia en Transformers. No obstante, se trata de un piloto de voz personal con datos escasos, cuyas métricas de pérdida son diagnósticos de entrenamiento, no evaluaciones objetivas de calidad de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-TTS (modelo de texto-a-voz basado en "talker" con tokenizador de audio a 12 Hz; detalles completos de la arquitectura no disponibles) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de MLX emplea `max_seq_length=2048`, pero no se especifica el contexto máximo del modelo) |
| Tipos de cuantizacion | FP16 publicado; adaptador MLX en bf16 (base `mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16`). No se mencionan GGUF ni otras cuantizaciones |
| Idiomas soportados | Japones (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo FP16 fusionado) + adaptador `adapters.safetensors` para MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz que emplea un tokenizador de audio a 12 Hz (Qwen/Qwen3-TTS-Tokenizer-12Hz). El ajuste fino se realizó mediante un LoRA de rango 8 aplicado a las proyecciones de atención y MLP del componente "talker" del modelo base. Los pesos del LoRA se fusionaron en el checkpoint FP16 publicado, y la configuración del modelo base se adaptó para registrar el hablante `yuki`. No se detallan en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF/DPO.

Los datos de entrenamiento consistieron en 382 clips de voz en japonés (conjunto de validación de 38 clips), con un total aproximado de 0,34 horas de audio preparado como mono a 24 kHz. El entrenamiento se llevó a cabo durante 3 épocas y 1.146 pasos del optimizador, sobre una GPU Tesla T4 de Google Colab con 14,56 GiB de VRAM (asignación máxima reportada de 8,31 GiB). La pérdida de validación por época fue de 6,8372, 6,3036 y 5,7852. Como verificación, el modelo exportado se recargó desde disco en un entorno limpio y generó audio en japonés correctamente. Por separado, el adaptador para Apple Silicon se entrenó con un LoRA de rango 16 (600 pasos) usando MLX sobre un Mac con chip M3 Ultra y 96 GB de memoria unificada; la validación se hizo con Whisper large-v3-turbo para comprobar la retención de texto y numerales, una comprobación básica de contenido y no un benchmark objetivo de calidad o prosodia.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés con voz personalizada registrada (`yuki`).
- Generación mediante la función `generate_custom_voice`, que acepta texto, idioma y hablante.
- Soporte de inferencia en Transformers/PyTorch con precisión FP16 y `attn_implementation="sdpa"`.
- Adaptador MLX independiente que permite generación en Apple Silicon; requiere además un WAV de referencia y su transcripción exacta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión ni de procesamiento de audio de entrada más allá de la voz de referencia del adaptador MLX.
- Multilingüismo limitado al japonés según las etiquetas del modelo.
- La etiqueta `text-generation` aparece en los tags, aunque la tarea declarada es `text-to-speech`.

## Casos de uso

- Generación de voz personalizada en japonés: el modelo sintetiza audio con el timbre `yuki` a partir de texto, sin necesidad de clonar una voz en cada llamada, útil para proyectos donde se reutiliza una misma identidad de voz.
- Audiolibros y narración en japonés: se puede introducir texto largo en japonés y generar fragmentos de audio de forma secuencial; conviene revisar la lectura de caracteres y numerales antes de publicar.
- Locuciones para vídeo y contenidos web: integración en un pipeline que genere archivos WAV mediante `soundfile` para insertarlos en producciones audiovisuales, con licencia Apache-2.0 que facilita el uso comercial.
- Prototipado de asistentes de voz en japonés: sirve como componente TTS en demos de asistentes por voz, siempre que se integre con componentes de reconocimiento de voz externos.
- Investigación en ajuste fino de voz con datos escasos: el repositorio documenta el procedimiento y las métricas de un LoRA sobre Qwen3-TTS, por lo que es útil como referencia metodológica para experimentos similares.
- Pruebas de generación de voz en Apple Silicon: el adaptador MLX permite experimentar en Mac con memoria unificada para evaluar prosodia y retención de contenido en japonés.
- Verificación de retención de texto: combinando el modelo con Whisper large-v3-turbo (como hizo la autora) se puede comprobar automáticamente si el audio generado conserva el texto y los numerales previstos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única métrica objetiva reportada son las pérdidas de validación por época del ajuste fino:

| Metrica | Valor |
|---|---|
| Perdida de validacion, epoca 1 | 6,8372 |
| Perdida de validacion, epoca 2 | 6,3036 |
| Perdida de validacion, epoca 3 | 5,7852 |

Estos valores son diagnósticos de entrenamiento y no constituyen un benchmark estandarizado de calidad de voz o pronunciación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: el modelo tiene 1,9 mil millones de parámetros, por lo que los pesos ocupan aproximadamente 3,8 GB; con activaciones y margen, se puede ejecutar en torno a 6-8 GB de VRAM.
- GPU recomendadas: la inferencia CUDA fue validada en una Colab Tesla T4 (14,56 GiB de VRAM); también es apto para GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores). No se han facilitado datos de rendimiento en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM, dado el tamaño del modelo en FP16.
- Despliegue: mediante `qwen-tts` y Transformers con `device_map="cuda:0"`, `dtype=torch.float16` y `attn_implementation="sdpa"`. No se ha validado vLLM, TGI, llama.cpp, Ollama ni ComfyUI. El adaptador MLX requiere `mlx-tune` y un Mac con Apple Silicon compatible.
- Latencia y throughput: no disponibles. El modelo base declara una frecuencia de tokenización de 12 Hz, pero no se aportan cifras de velocidad de generación.
- La inferencia en MPS de Apple para el modelo raíz de Transformers no ha sido validada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Misuwo/qwen3-tts-1.7b-ja-yuki | 1.916.676.352 | no disponible | Apache-2.0 | HuggingFace, safetensors + adaptador MLX | Fine-tune de voz japonesa `yuki`, datos escasos |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B (aproximado, segun el nombre) | no disponible | Apache-2.0 | HuggingFace, modelo base | Modelo base sin voz personalizada, multilingue |
| Otras alternativas de TTS (XTTS-v2, Kokoro, Piper, etc.) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para comparar parametros, contexto o rendimiento |

La comparación cuantitativa fiable solo puede establecerse con el modelo base, del que no se aportan cifras de benchmark específicas en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos. Al estar entrenado con la voz de una única persona, la variedad de timbre es limitada por diseño.
- Riesgo de alucinación/errores de lectura: la propia model card advierte de que el habla generada puede contener lecturas incorrectas (misreadings) y recomienda revisión humana. Los numerales y lecturas especiales requieren comprobación.
- Limitación de datos: el entrenamiento usó solo 382 clips (aproximadamente 0,34 horas), lo que constituye un piloto de voz personal con datos escasos; el autor lo describe como tal.
- Limitación de idioma: el modelo está orientado únicamente al japonés.
- Limitación de contexto: no se especifica la longitud de contexto máxima soportada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribución al proyecto original y a los modelos de Qwen (ver NOTICE). La licencia cubre el modelo, no los derechos sobre la voz representada.
- Uso responsable: la model card prohíbe expresamente usar el modelo para suplantar a otra persona, engañar sobre el origen sintético del habla o generar material ilícito o dañino.
- Compatibilidad de despliegue: no se ha validado Apple MPS para el modelo raíz ni la integración con ComfyUI; el modelo raíz no es un checkpoint nativo de ComfyUI. El adaptador MLX no es un modelo autónomo y requiere el modelo base, `mlx-tune` y un par WAV/texto de referencia.
- Calidad: la verificación del adaptador MLX se limitó a una comprobación de contenido con Whisper, no a una evaluación objetiva de prosodia o calidad de voz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misuwo/qwen3-tts-1.7b-ja-yuki
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Repositorio Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Base MLX: https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16
- Sitio de la autora: https://studio-rizi.pages.dev
