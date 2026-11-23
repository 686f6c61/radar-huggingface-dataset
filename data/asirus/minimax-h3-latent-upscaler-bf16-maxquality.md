# Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY

## Resumen

El Minimax H3 Latent Upscaler (3D) en su variante MAXQUALITY / NEXORA es un modelo especializado en el aumento de resolución de latentes (latent upscaling) para imagen y vídeo, derivado del upscaler original de LBH-123-AI. No es un modelo de lenguaje ni un generador multimodal generalista: opera exclusivamente en el espacio latente de un VAE, tomando un latente guía de baja resolución y prediciendo el latente correspondiente a alta resolución con un factor de escala de 4×. Está pensado para integrarse en flujos de trabajo de ComfyUI junto a los modelos MiniMax H3.

El repositorio, publicado por el usuario Asirus, contiene tres checkpoints: una re-cuantización conservadora en BF16 del modelo original y dos fine-tunings FP16 de la serie experimental NEXORA (400 y 6.056 pasos). Los fine-tunings se realizaron sobre pares de latentes guía-objetivo de imagen y vídeo, manteniendo la arquitectura `LatentResizer3D` original. El resultado declarado es una reducción del error L1 del 9,8 % y del RMSE del 7,4 % en el conjunto de validación respecto al modelo sin ajustar.

Su relevancia práctica reside en que mejora la fidelidad del latente predicho sin cambiar la arquitectura ni requerir adaptadores LoRA, lo que simplifica su sustitución directa en pipelines existentes. La licencia Apache 2.0 y el tamaño del repositorio (4,1 GB) lo hacen accesible para experimentación en hardware de gama media, aunque el autor advierte que las métricas en espacio latente no sustituyen una comparación visual A/B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentResizer3D (red convolucional 3D con atención desactivada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de upscaling latente, no de texto) |
| Tipos de cuantizacion | BF16 con fallback FP16; checkpoints FP16 |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura `LatentResizer3D` del upscaler original, con 24 canales de entrada, 12 bloques de entrada y 12 de salida, 512 canales internos, dropout de 0,1, atención desactivada, procesamiento temporal cada 2 capas y kernel temporal de 5. Opera sobre latentes de un VAE con un factor de escala de 4× y resolución de preparación de 512 px. El checkpoint BF16 es una re-cuantización conservadora en precisión mixta del modelo base de LBH-123-AI.

Los checkpoints NEXORA se obtuvieron por fine-tuning supervisado en espacio latente: se codifican pares de medios guía y objetivo con el VAE, se normalizan los latentes y se minimiza la distancia entre el latente predicho y el objetivo con pérdida Smooth L1 (beta 0,1). El entrenamiento usó AdamW con learning rate 5e-7 en la etapa final, weight decay 1e-4, clipping de gradiente 1,0, batch efectivo de 1, autocast FP16 en forward, parámetros en FP32 y cálculo de pérdida en FP32 con CUDA GradScaler. La etapa final se ejecutó durante 6.056 pasos sobre 4.724 pares de imagen (una pasada) y 111 pares de vídeo (doce pasadas), más 275 y 10 pares de validación respectivamente. El autor registra una Tesla T4 como GPU de entrenamiento y no documenta EMA, LoRA ni scheduler de learning rate.

## Capacidades

- Upscaling de latentes 3D con factor 4× para imagen y vídeo en el espacio latente de un VAE.
- Procesamiento temporal de vídeo mediante capas convolucionales 3D (kernel temporal 5, cada 2 capas).
- Integración con flujos de ComfyUI y con los modelos MiniMax H3.
- Tres variantes seleccionables: BF16 conservadora, FP16 NEXORA 400 pasos y FP16 NEXORA 6.056 pasos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, visión semántica ni audio.
- No dispone de modo thinking ni de decodificación especulativa.

## Casos de uso

- Post-procesado de vídeo generado con MiniMax H3: el modelo toma el latente de baja resolución producido por el generador y lo eleva 4× en espacio latente antes de la decodificación con el VAE, reduciendo el coste frente a regenerar a resolución completa.
- Restauración de detalle en imágenes generadas: inserción del nodo de upscaling latente en un pipeline de ComfyUI para obtener latentes objetivo más próximos a la distribución de alta calidad, con una mejora declarada del 9,9 % en L1 sobre imágenes de validación.
- Mejora de coherencia temporal en clips cortos: el procesamiento temporal cada 2 capas con kernel 5 permite suavizar transiciones entre fotogramas latentes, aunque la mejora medida en vídeo es menor (4,9 % en L1, 3,0 % en RMSE).
- Sustitución directa del upscaler base en pipelines existentes: al mantener la arquitectura `LatentResizer3D`, los checkpoints NEXORA pueden reemplazar al modelo original sin cambios en el grafo de ComfyUI.
- Experimentación e investigación en upscaling latente: los tres checkpoints permiten comparar re-cuantización BF16 frente a fine-tuning FP16 en el mismo conjunto de validación.
- Ajuste fino adicional por parte de terceros: la licencia Apache 2.0 y el formato safetensors facilitan continuar el entrenamiento con pares de latentes propios, siguiendo la receta documentada (Smooth L1, AdamW, autocast FP16).
- Despliegue en hardware modesto para pruebas: el tamaño de 4,1 GB del repositorio y el entrenamiento registrado en una Tesla T4 sugieren que la inferencia es viable en GPU de gama media para lotes pequeños.

## Benchmarks y rendimiento

| Conjunto de validación | Reducción error L1 | Reducción RMSE |
|---|---:|---:|
| Todas las muestras | 9,8 % | 7,4 % |
| Imágenes | 9,9 % | 7,5 % |
| Vídeos | 4,9 % | 3,0 % |

Estas cifras corresponden a métricas en espacio latente del checkpoint Full-data (6.056 pasos) frente al modelo sin ajustar, sobre el mismo conjunto de validación retenido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros upscalers latentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,1 GB y los checkpoints se sirven en BF16/FP16, por lo que se estima un consumo en el rango de varias unidades de GB, sin cifra confirmada por el autor.
- GPU de entrenamiento registrada: NVIDIA Tesla T4 (16 GB), lo que indica viabilidad en GPU de gama media para fine-tuning con batch 1.
- GPU recomendadas: no especificadas por el autor; por el perfil de entrenamiento, tarjetas con 16 GB o más son suficientes para inferencia y ajuste ligero.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el pipeline completo de MiniMax H3 y el VAE, aunque no hay confirmación oficial.
- Opciones de despliegue: ComfyUI es el entorno documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un upscaler latente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Licencia | Fine-tuning | Disponibilidad |
|---|---|---|---|---|---|
| Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY | Upscaler latente 3D | 4× | Apache 2.0 | NEXORA FP16 (400 y 6.056 pasos) | Hugging Face, 469 descargas |
| LBH-123-AI/Minimax_h3_latent_Upscaler | Upscaler latente 3D | 4× | no disponible en la información | Modelo base original | Hugging Face |
| Otros upscalers latentes para vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que la información proporcionada no incluye otros upscalers latentes comparables con datos verificables.

## Limitaciones y advertencias

- Las métricas de validación son en espacio latente (L1 y RMSE) y no garantizan mejoras visuales perceptibles; el autor recomienda comparación visual A/B en el flujo de ComfyUI.
- La mejora en vídeo es notablemente inferior a la de imagen (4,9 % frente a 9,9 % en L1), posiblemente por el desequilibrio del dataset (111 pares de vídeo frente a 4.724 de imagen).
- Los checkpoints NEXORA son fine-tunings, no modelos entrenados desde cero ni adaptadores LoRA; no deben presentarse como modelos nuevos.
- No se documentan sesgos, pero al ser un modelo de upscaling puede amplificar artefactos o patrones presentes en los latentes de entrada.
- Riesgo de alucinación de detalle: como todo upscaler generativo, puede introducir texturas o estructuras no presentes en la fuente.
- No apto para tareas de texto, razonamiento, código, visión semántica ni agentes.
- La procedencia exacta de los datos de entrenamiento y las dimensiones por muestra no están especificadas en el README, lo que limita la reproducibilidad.
- No se documenta scheduler de learning rate ni pesos EMA, lo que puede afectar a la estabilidad de futuros fine-tunings.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY
- Modelo base: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Perfil del autor: https://huggingface.co/Asirus
- Perfil del autor del modelo base: https://huggingface.co/LBH-123-AI
- ComfyUI (entorno de despliegue documentado): https://github.com/comfyanonymous/ComfyUI
