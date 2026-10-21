# liana313/tokengate-niah-qwen3.5-2b

## Resumen

TokenGate NIAH para Qwen3.5-2B es un artefacto de investigación publicado por liana313 que combina una puerta aprendida de poda de tokens de la caché KV con un adaptador LoRA emparejado sobre el modelo base Qwen3.5-2B. No es un modelo completo: el repositorio contiene únicamente los checkpoints `gate_step18000.pt` y `lora_step18000.pt`, que deben cargarse junto con el modelo base mediante la librería TokenGate. La puerta se sitúa en la capa 1, una capa DeltaNet del modelo de atención híbrida, y el LoRA ajusta las proyecciones q/v de todas las capas con r16 y alpha 32.

El objetivo es reducir el coste de memoria de la caché KV en contextos largos aprendiendo qué tokens conservar o descartar, en lugar de aplicar una poda heurística. El entrenamiento se realizó de extremo a extremo sobre la tarea needle-in-a-haystack de Kamradt, y la model card indica que el checkpoint converge en el paso 18000 y generaliza a los niveles de prueba de 32k, 64k y 128k tokens. Es relevante para investigación en inferencia eficiente y para reproducir los resultados del artículo arXiv:2610.26754, pero no hay datos publicados sobre rendimiento general, idiomas o cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3.5-2B con atención híbrida; el artefacto añade una puerta de poda de tokens de la caché KV en la capa 1 (capa DeltaNet) y un adaptador LoRA en q/v de todas las capas |
| Parámetros totales | 2B en el modelo base Qwen3.5-2B; número de parámetros de la puerta y del adaptador LoRA no disponible |
| Longitud de contexto | Evaluado en niveles de 32k, 64k y 128k tokens; longitud máxima nativa del modelo base no disponible |
| Tipos de cuantización | No disponibles; el repositorio solo incluye checkpoints PyTorch `.pt` y no publica versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0, sujeta además a la licencia del modelo base Qwen3.5-2B |
| Formato de pesos | PyTorch `.pt`: `gate_step18000.pt` y `lora_step18000.pt`; no hay safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-2B |
| Rango LoRA | r16, alpha 32, en las proyecciones q/v de todas las capas |
| Capa de la puerta | Capa 1, correspondiente a una cap
