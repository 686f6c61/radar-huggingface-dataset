# lodebrusten/EvenSmollerLM-135M-Q2_K-GGUF

## Resumen

EvenSmollerLM-135M-Q2_K-GGUF es una conversión al formato GGUF del modelo base SmolLM2-135M, desarrollado originalmente por HuggingFaceTB. La conversión la ha realizado el usuario lodebrusten mediante el espacio GGUF-my-repo de ggml.ai, que automatiza el proceso de cuantización con llama.cpp. El resultado es un checkpoint de 134.515.008 parámetros cuantizado en Q2_K, pensado para inferencia local con llama.cpp en hardware modesto.

El modelo base SmolLM2-135M es un transformer decoder-only de la familia SmolLM2, entrenado por Hugging Face sobre un corpus de gran escala en inglés. Esta versión cuantizada reduce el peso del repositorio a aproximadamente 0,1 GB, lo que la hace adecuada para entornos con recursos muy limitados: CPU, Raspberry Pi, contenedores pequeños o pruebas rápidas de pipelines de generación de texto.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un ajuste fino, sino de un artefacto de despliegue. Su valor práctico reside en la facilidad de uso con llama.cpp y en el tamaño reducido, no en capacidades adicionales sobre el modelo original. Cualquier evaluación de calidad debe remitirse a SmolLM2-135M, ya que la cuantización Q2_K introduce pérdida de precisión adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo del autor usa `-c 2048`) |
| Tipos de cuantizacion | Q2_K (unico archivo publicado en este repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `smollm2-135m-q2_k.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM2-135M: un transformer decoder-only con atención multi-cabeza estándar, entrenado por Hugging Face sobre un corpus en inglés. Esta ficha no dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a la model card original de SmolLM2-135M, no reproducida aquí.

La única transformación aplicada en este repositorio es la conversión a GGUF y la cuantización Q2_K mediante llama.cpp. Q2_K es una cuantización de 2 bits por peso con escalas por bloque, lo que reduce drásticamente el tamaño del modelo a costa de una degradación notable de la calidad respecto a los pesos originales en fp16/bf16. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada por el tamaño del modelo (135M parámetros).
- Continuación de prompts y generación de texto breve; el ejemplo del autor sugiere usos de completado simple.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés (`language: en`).
- No se documenta modo thinking, visión ni audio.
- Compatible con el servidor HTTP de llama.cpp (`llama-server`), lo que permite exponer una API compatible con endpoints de chat/completions.

## Casos de uso

- Completado de texto local en CPU: usar `llama-cli` con el prompt de ejemplo del autor para generar continuaciones breves; adecuado por el tamaño de 0,1 GB y la ausencia de requisitos de GPU.
- Pruebas de integración de llama.cpp en CI: descargar el GGUF y ejecutar `llama-server -c 2048` en un contenedor para validar pipelines de inferencia antes de desplegar modelos mayores.
- Prototipado de interfaces de chat: exponer `llama-server` y consumir los endpoints compatibles para validar la capa de cliente sin coste de GPU.
- Demos educativas sobre cuantización: comparar la salida de este Q2_K con el modelo base en fp16 para ilustrar el impacto de la cuantización agresiva en la calidad.
- Inferencia en dispositivos de borde: ejecutar el modelo en Raspberry Pi o mini-PC x86 sin GPU para tareas de generación de texto muy simples en inglés.
- Filtrado y etiquetado ligero de texto: usar el modelo como clasificador zero-shot aproximado mediante prompts de completado en pipelines de bajo coste, asumiendo baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para el archivo Q2_K (repo de 0,1 GB); el contexto adicional consume RAM/VRAM según `-c`.
- GPU recomendadas: innecesarias; cualquier GPU con suficiente VRAM para el contexto elegido basta. Funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF (Ollama, entre otros). El autor documenta exclusivamente llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EvenSmollerLM-135M-Q2_K-GGUF (este) | 134.515.008 | no disponible | GGUF Q2_K | apache-2.0 | Cuantizacion Q2_K de SmolLM2-135M |
| HuggingFaceTB/SmolLM2-135M | 134.515.008 | no disponible en esta ficha | safetensors (original) | apache-2.0 | Modelo base en precision original |
| Otras cuantizaciones de SmolLM2-135M | 134.515.008 | no disponible | GGUF (Q4_K_M, Q8_0, etc.) | apache-2.0 | Mayor precision que Q2_K a mayor tamaño |

## Limitaciones y advertencias

- La cuantización Q2_K degrada la calidad de forma significativa frente a fp16; no se recomienda para producción sensible a la fidelidad del texto.
- Modelo de 135M parámetros: capacidad limitada de razonamiento, coherencia en contextos largos y conocimiento factual; alta propensión a alucinaciones.
- Solo inglés; no soporta castellano de forma fiable.
- Sesgos: no documentados en esta ficha; heredados del corpus de entrenamiento de SmolLM2-135M.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales.
- No hay garantía de soporte por parte del autor de la conversión; es un artefacto derivado sin mantenimiento documentado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lodebrusten/EvenSmollerLM-135M-Q2_K-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
