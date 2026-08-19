# ivanfromm/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF

## Resumen

El repositorio `ivanfromm/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF` contiene una conversión a formato GGUF del adaptador LoRA `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA`, diseñado para reescribir prompts de entrada al modelo de generación de audio y vídeo MiniMax-H3. El adaptador original está entrenado como un PEFT LoRA sobre el modelo base `Qwen/Qwen3.6-27B`, lo que implicaba descargar 52 GB en precisión bf16 antes de poder ejecutarlo. Esta conversión permite cargar el mismo adaptador (con valores de tensores sin modificar) junto con una versión cuantizada del modelo base, reduciendo el peso total a entre 13 y 19 GB de VRAM según la cuantización elegida.

La relevancia de este repositorio radica en que facilita la ejecución del reescritor de prompts en hardware más modesto, utilizando `llama.cpp` como motor de inferencia, con soporte para CUDA, ROCm, Metal y CPU. El adaptador tiene 1.867.644.928 parámetros (rango 256, alpha 512) y se distribuye en un único archivo GGUF de 3,48 GB en precisión F16. La conversión no añade ningún entrenamiento nuevo; únicamente transforma el formato de los pesos para que sean compatibles con el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.6-27B (transformer) |
| Parametros totales | 1.867.644.928 (adaptador) + 27B (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (según ejemplo de uso con `-c 8192`) |
| Tipos de cuantizacion | Adaptador: F16; base: Q4_K_M, IQ4_XS, Q3_K_XL, IQ2_M (de unsloth) |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible; se remite a la licencia del repo original y a la de MiniMax-H3 |
| Formato de pesos | GGUF (adaptador en F16, 992 tensores) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 con `alpha = 512`, entrenado específicamente para reescribir prompts destinados al modelo MiniMax-H3 (texto a audio/vídeo). Se aplica sobre el modelo base Qwen3.6-27B, que es un transformer denso con atención lineal en algunas capas (según la nota de conversión sobre el reordenamiento de cabezas V). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.).

La conversión a GGUF se realizó con `convert_lora_to_gguf.py` de llama.cpp, incluyendo un parche específico para manejar el reordenamiento de las cabezas V en las capas de atención lineal de Qwen3.5/Qwen3.6. El parche expresa el reordenamiento como una indexación en lugar de un `reshape`, lo que permite que el LoRA se aplique correctamente sin materializar ninguna delta de rango completo. Los valores de los tensores no se han modificado respecto al adaptador original.

## Capacidades

- Reescritura de prompts para MiniMax-H3: transforma un prompt original en una versión mejorada, incorporando parámetros como resolución y duración.
- Entrada estructurada: acepta campos como `resolution`, `duration` y `original_prompt`, lo que permite control fino sobre la generación.
- Integración con llama.cpp: se ejecuta mediante `llama-cli` o `llama-server` con la opción `--lora`.
- Compatibilidad con ComfyUI: el nodo `MiniMax-H3-Prompt-Rewriter-ComfyUI` lo detecta automáticamente cuando se selecciona un modelo base GGUF.
- Soporte multilingüe: limitado al inglés (según la etiqueta `language: en`).
- Requiere desactivar el modo reasoning (`--reasoning off`) para evitar que el modelo genere cientos de tokens de razonamiento antes de la reescritura.

## Casos de uso

- Generación de vídeo con MiniMax-H3: reescribir prompts de usuario para mejorar la coherencia y el detalle de las escenas generadas, usando el adaptador como paso previo en un pipeline de texto a vídeo.
- Automatización de creación de contenido: integrar el reescritor en scripts que generan vídeos de forma masiva, normalizando prompts y ajustando resolución y duración de manera programática.
- Flujos de trabajo en ComfyUI: incorporar el adaptador en grafos de nodos para reescritura de prompts antes de enviarlos al modelo MiniMax-H3, aprovechando la interfaz visual.
- Inferencia local en servidores: desplegar el reescritor en máquinas con GPU de consumo (por ejemplo, RTX 3090/4090) usando cuantizaciones agresivas del base (IQ2_M) para reducir VRAM a ~13 GB.
- Investigación en reescritura de prompts: analizar cómo el adaptador modifica los prompts y su impacto en la calidad de la generación de vídeo, utilizando la versión cuantizada para experimentos rápidos.
- Prototipado rápido: probar variaciones de prompts sin necesidad de descargar el checkpoint bf16 completo de 52 GB, gracias a la reducción de peso a 3,48 GB para el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la información disponible. El único dato de rendimiento medido es la velocidad de inferencia en una RTX 5090 con el base `Qwen3.6-27B-Q4_K_M`: **50 tok/s con el adaptador** frente a **78 tok/s sin él** (diferencia de ~35% debida al cálculo de las multiplicaciones de matrices del LoRA). No hay comparaciones con otros reescritores de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización del base):
  - `Q4_K_M`: ~19 GB
  - `IQ4_XS`: ~18 GB
  - `Q3_K_XL`: ~17 GB
  - `IQ2_M`: ~13 GB
- GPU recomendadas: RTX 5090 (probada), RTX 4090, A100, H100, o cualquier GPU con suficiente VRAM; también compatible con ROCm, Metal y CPU mediante llama.cpp.
- Despliegue: `llama-cli`, `llama-server`, o ComfyUI con `llama-cpp-python`.
- Latencia/throughput: 50 tok/s en RTX 5090 con Q4_K_M; valores inferiores en GPUs más modestas o con cuantizaciones más bajas.
- Para reducir VRAM adicionalmente, se puede hacer offloading parcial de capas al CPU, a costa de velocidad.

## Comparativa con modelos similares

No disponible. No se han identificado otros adaptadores LoRA específicamente diseñados para reescritura de prompts de MiniMax-H3 en formato GGUF. La comparación más relevante es con el adaptador original en bf16 (52 GB) frente a esta versión GGUF (3,48 GB + base cuantizado), que reduce el requisito de almacenamiento y VRAM sin alterar los pesos.

## Limitaciones y advertencias

- Solo soporta inglés; el uso con otros idiomas puede degradar la calidad de la reescritura.
- El adaptador es extremadamente sensible al system prompt: debe usarse exactamente el texto de `prompt_template.py` del repositorio original; cualquier modificación reduce la calidad de la salida.
- Es obligatorio desactivar el modo reasoning (`--reasoning off`); si se activa, el modelo genera cientos de tokens de razonamiento antes de la reescritura, aumentando la latencia y el coste computacional.
- La licencia no está especificada en este repositorio; depende de la licencia del adaptador original (`lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA`) y de los términos de uso de MiniMax-H3. Verificar antes de usar en producción comercial.
- El adaptador no es un modelo autónomo: requiere el modelo base Qwen3.6-27B cuantizado, que debe descargarse por separado.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto más allá de la ventana de 8192 tokens utilizada en el ejemplo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ivanfromm/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF
- Adaptador original: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA
- Nodo ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantizaciones del base: https://huggingface.co/unsloth/Qwen3.6-27B-GGUF
- MiniMax-H3 (modelo oficial): https://huggingface.co/MiniMaxAI/MiniMax-H3
