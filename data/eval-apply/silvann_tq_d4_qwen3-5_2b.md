# eval-apply/silvann_tq_D4_qwen3.5_2b

## Resumen

silvann_tq_D4_qwen3.5_2b es un paquete de pesos cuantizados del modelo Qwen/Qwen3.5-2B, publicado por el usuario eval-apply para su uso con el motor de inferencia SiLVANN (el intérprete GPU de Eval-Apply y su librería de redes neuronales). No se trata de un modelo nuevo ni de un fine-tuning: el autor indica explícitamente que "all credit for the model belongs to the Qwen team; this repository only changes how its weights are stored". El repositorio modifica únicamente el formato y la precisión de almacenamiento de los pesos.

La cuantización aplicada es TurboQuant: cada matriz de capa se guarda a 4 bits por peso con una escala por fila, rotada a lo largo de su eje de entrada mediante una rotación bloqueada de Hadamard y signos. Las matrices de embedding y de cabeza de salida se mantienen a 8 bits (la cabeza se deriva del embedding, al que el modelo está atado), mientras que las normas y tensores pequeños se conservan sin pérdida. El sufijo D4 indica "dense 4": el modelo es denso, sin expertos.

El resultado ocupa aproximadamente 1,7 GB y está pensado para ejecutarse en dispositivos con recursos limitados, incluidos teléfonos móviles. El autor reporta 7,0-7,7 tokens por segundo en un Razer Edge (Snapdragon G3x Gen 1) bajo Termux con Android 12, y 7,6 tokens por segundo en cuatro hilos de un Xeon E5-2680 v4. Es relevante ahora porque demuestra una vía de despliegue de un modelo de 2B parámetros en hardware móvil con un formato propio, aunque fuera del ecosistema estándar de transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-2B); pesos reempaquetados en formato silvann-packed-v3 |
| Parámetros totales | 2B (según el modelo base Qwen/Qwen3.5-2B; el repositorio no detalla el recuento exacto) |
| Parámetros activos | no aplica (modelo denso, sin expertos) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantización | 4 bits por peso en matrices de capa (TurboQuant, escala por fila, rotación Hadamard y signos bloqueada); 8 bits en embedding y cabeza; sin pérdida en normas y tensores pequeños |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | silvann-packed-v3 (pack.json + layers/NNN/ + global.pkl); no compatible con transformers |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: parte de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2B parámetros, y altera solo la representación de los pesos. La innovación técnica es el códec TurboQuant: cada matriz de capa se cuantiza a 4 bits por peso con una escala por fila y se rota a lo largo de su eje de entrada mediante una rotación bloqueada de Hadamard y signos, una técnica habitual para reducir valores atípicos antes de la cuantización de baja precisión. El embedding y la cabeza (atada al embedding) se mantienen a 8 bits, y las normas y tensores pequeños quedan intactos.

El paquete es una versión solo de texto: el autor excluye la torre de visión y la capa de predicción multi-token del modelo original (listadas en pack.json) para que quepa en la memoria libre de un teléfono. El formato silvann-packed-v3 se lee con el runtime de SiLVANN, no con transformers; el tokenizador, la plantilla de chat y las configuraciones son las del modelo original. El autor reporta una validación frente al forward de Hugging Face con los pesos originales: coincidencia token a token en la continuación greedy y una desviación media de 0,35 en los cinco logits superiores.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-2B, aunque la información disponible no detalla su alcance exacto.
- Código y matemáticas: presumiblemente soportadas por el modelo base, pero no verificadas en la información proporcionada.
- Tool calling / function calling: no disponible en la información.
- Agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Visión: no soportada en este paquete (torre de visión excluida).
- Predicción multi-token: no soportada en este paquete (capa excluida).
- Modo thinking: no disponible en la información.

## Casos de uso

- Inferencia en dispositivos móviles: el paquete de 1,7 GB está diseñado para ejecutarse en teléfonos Android mediante SiLVANN bajo Termux; el autor reporta 7,0-7,7 tokens por segundo en un Razer Edge (Snapdragon G3x Gen 1), lo que lo hace adecuado para asistentes locales sin conexión.
- Despliegue en CPU sin GPU: con 7,6 tokens por segundo en cuatro hilos de un Xeon E5-2680 v4, sirve para entornos de servidor sin acelerador dedicado donde el coste de GPU es prohibitivo.
- Prototipado de motores de cuantización: el formato silvann-packed-v3 y el códec TurboQuant permiten evaluar el impacto de la cuantización a 4 bits con rotaciones Hadamard frente a los pesos originales, con una métrica de desviación de logits ya publicada.
- Aplicaciones de texto en el borde (edge computing): al excluir visión y predicción multi-token, el paquete encaja en escenarios de generación de texto puro con memoria muy restringida, como dispositivos IoT con Android o Linux embebido.
- Experimentación con runtimes alternativos: útil para desarrolladores que quieran comparar el rendimiento de SiLVANN frente a llama.cpp u Ollama con el mismo modelo base en cuantizaciones equivalentes.
- Investigación sobre cuantización post-entrenamiento: la combinación de 4 bits en capas y 8 bits en embedding/cabeza con normas sin pérdida ofrece un caso de estudio concreto sobre qué tensores degradan más la fidelidad de logits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor solo reporta métricas de fidelidad y velocidad:

| Métrica | Resultado |
|---|---|
| Coincidencia con forward de Hugging Face (continuación greedy) | token a token |
| Desviación media de los cinco logits superiores | 0,35 |
| Throughput en Razer Edge (Snapdragon G3x Gen 1), Termux, SILVANN_ARM_INT8=1 | 7,0-7,7 tokens/s |
| Throughput en Razer Edge sin multiplicación entera | 4,5 tokens/s |
| Throughput en CPU, 4 hilos de Xeon E5-2680 v4 | 7,6 tokens/s |

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 1,7 GB en disco; la VRAM necesaria para inferencia no se especifica, pero el formato está pensado para ejecutarse en memoria unificada de móvil y en CPU.
- GPU recomendadas: no disponibles; el autor valida el funcionamiento en CPU (Xeon E5-2680 v4) y en la GPU integrada de un Snapdragon G3x Gen 1.
- ¿Cabe en GPU de consumo? No hay datos específicos; por tamaño (1,7 GB) cabría en cualquier GPU con más de 2 GB de VRAM, pero el runtime SiLVANN no documenta soporte para CUDA en la información disponible.
- Opciones de despliegue: exclusivamente el runtime de SiLVANN (no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato silvann-packed-v3 no lo lee transformers).
- Latencia y throughput: 7,0-7,7 tokens/s en Razer Edge con SILVANN_ARM_INT8=1; 4,5 tokens/s sin esa opción; 7,6 tokens/s en 4 hilos de Xeon E5-2680 v4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D4_qwen3.5_2b | ~2B | no disponible | 4 bits capas / 8 bits embedding y cabeza | Apache 2.0 | SiLVANN |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | pesos originales (BF16/FP16 presumiblemente) | Apache 2.0 | transformers |
| Qwen2.5-1.5B-Instruct (referencia de tamaño similar) | 1,5B | 32 768 tokens | GGUF, AWQ, GPTQ | Apache 2.0 | llama.cpp, vLLM, Ollama, TGI |

La comparativa con Qwen2.5-1.5B-Instruct se incluye solo como referencia de categoría (modelo denso de ~1-2B); los datos de contexto y cuantización de ese modelo no provienen de la información proporcionada sobre este repositorio y deben verificarse en su propia model card. No se dispone de benchmarks comparativos del paquete SiLVANN frente a estas alternativas.

## Limitaciones y advertencias

- El paquete no es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI; solo se puede cargar con el runtime SiLVANN, lo que limita su integración en pipelines estándar.
- Es una versión solo de texto: se han eliminado la torre de visión y la capa de predicción multi-token, por lo que no reproduce las capacidades multimodales del modelo base.
- La cuantización a 4 bits introduce una desviación medible: 0,35 de media en los cinco logits superiores, aunque la continuación greedy coincide token a token en la comprobación del autor.
- El soporte en Android está marcado como experimental en la documentación de SiLVANN (docs/android.md).
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto; deben consultarse en la model card del modelo base Qwen/Qwen3.5-2B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 del modelo base se mantiene y se incluye en el repositorio, por lo que el uso comercial está permitido bajo los términos de dicha licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D4_qwen3.5_2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de SiLVANN para Android: docs/android.md (referenciada por el autor; no se proporciona URL completa en la información disponible)
