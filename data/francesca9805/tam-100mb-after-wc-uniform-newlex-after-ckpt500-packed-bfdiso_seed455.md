# francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455

## Resumen

`tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455` es un modelo de generación de texto publicado por el usuario de Hugging Face francesca9805. Se trata de un fine-tuning por SFT (supervised fine-tuning) del modelo base `francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455`, realizado con la librería TRL (versión 0.23.0) sobre la arquitectura GPT-2. El nombre del repositorio sugiere un experimento académico vinculado a investigación sobre tokenizadores (la traza de Weights & Biases apunta a un proyecto denominado "new-tokenizers" de la Universidad de Groningen).

El modelo cuenta con 124.770.816 parámetros totales (aproximadamente 125 millones), lo que lo sitúa en la categoría de modelos pequeños tipo GPT-2, adecuados para experimentación y despliegue en hardware modesto. La nomenclatura del identificador ("100mb", "packed", "bfdiso", "seed455") indica que forma parte de una batería de experimentos controlados con variaciones de tokenizador, empaquetado de secuencias y semillas, más que un modelo orientado a producción.

La relevancia de esta ficha es principalmente documental: el modelo carece de model card descriptiva, licencia declarada, idiomas especificados y resultados de benchmarks. Su interés reside en el contexto de investigación sobre tokenización y fine-tuning, no en capacidades de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según tag `gpt2`) |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455 |
| Método de entrenamiento | SFT con TRL 0.23.0 |
| Tamaño del repositorio | 18,2 GB |
| Framework | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atención causal completa, según el tag `gpt2` del repositorio. Con 124,77 millones de parámetros, el tamaño encaja con la variante GPT-2 small estándar (124M), aunque el tokenizador podría diferir del original dado el contexto de investigación sobre tokenizadores que sugiere el nombre del experimento ("newlex", "new-tokenizers").

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL, partiendo del checkpoint `ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455`. El identificador indica que se partió de un checkpoint intermedio (ckpt500) y que los datos estaban "packed" (secuencias empaquetadas para maximizar la ocupación de la ventana de contexto). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. La model card únicamente enlaza a una traza de Weights & Biases del proyecto "new-tokenizers" (run `0epzuxia`).

No se documentan innovaciones técnicas específicas más allá del uso de empaquetado de secuencias y de un tokenizador experimental. No hay mención a decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva mediante `pipeline("text-generation")` de Transformers.
- Formateo de conversación por roles (`{"role": "user", "content": ...}`), lo que sugiere un ajuste orientado a diálogo o instrucciones, aunque no se detalla el formato exacto del chat template.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidad multilingüe: no disponible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible.

Dado el tamaño (125M parámetros) y la ausencia de documentación, no es razonable asumir capacidades de razonamiento complejo, código o matemáticas más allá de las que pueda ofrecer un GPT-2 small ajustado.

## Casos de uso

- Experimentación académica sobre tokenizadores: el modelo forma parte de una serie de ablaciones (tokenizador "newlex", empaquetado, semilla 455), por lo que su uso natural es reproducir o comparar resultados dentro de esa línea de investigación.
- Pruebas de pipelines de SFT con TRL: sirve como ejemplo mínimo de fine-tuning supervisado sobre un modelo base pequeño, útil para validar configuraciones de entrenamiento antes de escalar a modelos mayores.
- Evaluación de infraestructura de despliegue: con 125M parámetros cabe en cualquier GPU consumer, lo que permite probar vLLM, TGI o endpoints de Hugging Face sin coste significativo.
- Generación de texto de bajo coste en entornos con recursos limitados: para tareas de completado simple donde no se requiera alta calidad, puede ejecutarse en CPU o en GPUs de gama baja.
- Docencia y demostraciones: adecuado para ilustrar el ciclo completo de fine-tuning (base model, SFT, publicación en el Hub) en cursos o talleres.
- Baseline en comparativas de tokenización: al compartir linaje con otros checkpoints de la misma serie, permite medir el impacto del tokenizador en métricas de generación.

No se recomienda su uso en producción para atención al cliente, generación de código o tareas que requieran fiabilidad, dado el tamaño y la falta de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB (125M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 250 MB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 125 MB; en 4 bits: aproximadamente 65 MB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también funciona en CPU.
- Cabe holgadamente en GPU consumer y en entornos integrados con suficiente memoria.
- Opciones de despliegue: Transformers (pipeline), Text Generation Inference (tag oficial), endpoints de Hugging Face; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455 | 124,77M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face, ampliamente replicado |
| DistilGPT-2 | 82M | 1024 tokens | Apache 2.0 | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a la categoría de modelos pequeños tipo GPT-2. Frente a ellos, este checkpoint carece de licencia clara, documentación de contexto y evaluación publicada, lo que lo sitúa por debajo en madurez para uso general. Su ventaja es únicamente como artefacto de investigación reproducible dentro de su serie experimental.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan datos de entrenamiento, idiomas, formato de chat ni limitaciones.
- Licencia no especificada: el campo `licence: license` no concreta términos, por lo que el uso comercial es jurídicamente incierto.
- Riesgo elevado de alucinación y de generación incoherente dado el tamaño (125M parámetros) y la falta de evaluación.
- Contexto máximo no documentado; no debe asumirse la ventana de 1024 tokens de GPT-2 sin verificación.
- Idiomas soportados desconocidos; probablemente sesgado hacia el idioma dominante del dataset de SFT, no publicado.
- Sesgos desconocidos al no publicarse la composición del corpus.
- El tamaño del repositorio (18,2 GB) es desproporcionado para 125M parámetros, lo que sugiere la presencia de múltiples checkpoints u otros artefactos; conviene revisar los archivos antes de descargar.
- No apto para producción sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/0epzuxia
- Repositorio TRL: https://github.com/huggingface/trl
