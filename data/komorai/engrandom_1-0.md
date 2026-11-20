# KomorAI/EngRandom_1.0

## Resumen

EngRandom_1.0 es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el usuario KomorAI y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo experimental y de juguete, con tan solo 128.960 parámetros totales, disenado para fines educativos y de experimentacion, no para uso productivo.

El modelo emplea una arquitectura transformer decoder-only minima: 2 capas, 64 dimensiones de embedding, 2 cabezas de atencion y una longitud de contexto de solo 64 tokens. Su vocabulario es cerrado y de tan solo 387 entradas, construido a partir de una lista de palabras en ingles proporcionada por el autor, lo que limita severamente cualquier capacidad linguistica real.

Es relevante unicamente como ejemplo didactico de como entrenar un modelo GPT-2 desde cero con un script de Google Colab, y como caso extremo de modelo con vocabulario y contexto minimos. No compite con ningun modelo de produccion y no debe evaluarse bajo los mismos criterios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 128.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (no se publican archivos GGUF) |
| Idiomas soportados | pl, en (segun metadatos; en la practica solo genera tokens de su vocabulario cerrado en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clasica con parametros reducidos: `n_layer = 2`, `n_embd = 64`, `n_head = 2`, `n_positions = 64` y `vocab_size = 387`. Incluye los tokens especiales `[UNK]`, `[PAD]` y `<|endoftext|>`. El vocabulario esta compuesto por una lista fija de palabras en ingles (sustantivos, verbos, adjetivos y adverbios comunes) mas dichos tokens especiales.

El entrenamiento se realizo desde cero mediante un script en Google Colab. Los datos de entrenamiento consisten en 200 ejemplos de frases aleatorias generadas a partir del vocabulario del usuario. No se reporta uso de RLHF, DPO ni tecnicas de alineacion. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto limitada a secuencias construidas con las 384 palabras de su vocabulario cerrado.
- No dispone de capacidades de razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues practicamente nulas: aunque los metadatos declaran pl y en, el vocabulario es exclusivamente ingles y cerrado.
- No dispone de modo thinking ni capacidades especiales de audio o vision.

## Casos de uso

- Experimentacion educativa sobre entrenamiento de GPT-2 desde cero: sirve para que estudiantes comprendan el flujo completo de tokenizacion, definicion de arquitectura y entrenamiento con un script de Colab.
- Pruebas de integracion de pipelines de Hugging Face Transformers: util para validar que un pipeline de carga y generacion funciona con un modelo minimo antes de escalar a modelos reales.
- Benchmarking de infraestructura de inferencia: al ser tan pequeno, permite medir latencia y throughput de frameworks (Transformers, llama.cpp) sin coste de GPU.
- Demostracion de limitaciones de vocabulario cerrado: caso practico para ilustrar como un vocabulario reducido restringe la generacion a combinaciones de palabras fijas.
- Pruebas de tokenizacion y manejo de tokens especiales (`[UNK]`, `[PAD]`, `<|endoftext|>`) en entornos de investigacion.
- Prototipado rapido de interfaces de generacion de texto en entornos de docencia, donde el contenido generado no es relevante y solo importa el flujo de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion; el modelo en safetensors ocupa aproximadamente 0,5 MB (128.960 parametros en fp32).
- GPU recomendadas: ninguna en concreto; funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o incluso en Raspberry Pi.
- Opciones de despliegue: Transformers (Python), llama.cpp / Ollama / LM Studio (segun la model card, aunque no se publican archivos GGUF), y cualquier runtime que soporte safetensors.
- Latencia y throughput: no se reportan datos; por el tamano, la generacion es practicamente instantanea en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EngRandom_1.0 (KomorAI) | 128.960 | 64 | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 | Apache 2.0 | Hugging Face |
| TinyStories-1M | ~1 M | 512 | MIT | Hugging Face |

EngRandom_1.0 es entre dos y tres ordenes de magnitud mas pequeno que GPT-2 small y carece de capacidades linguisticas reales. Su unica ventaja frente a alternativas es el tamano minimo absoluto, que lo hace util solo como ejercicio didactico.

## Limitaciones y advertencias

- Modelo de juguete: no genera lenguaje natural coherente, solo secuencias de palabras de su vocabulario cerrado.
- Vocabulario de 387 entradas: cualquier texto fuera de esa lista se mapea a `[UNK]`, lo que limita la generacion a combinaciones de palabras fijas.
- Contexto de solo 64 tokens: insuficiente para cualquier tarea conversacional o de contexto largo.
- Sesgos conocidos: no se documentan, pero al entrenarse con frases aleatorias generadas por el autor, no hay control de sesgos.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que el modelo no produce contenido factual; genera secuencias aleatorias de su vocabulario.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es apto para produccion por su falta de capacidades.
- Caveat importante: no debe desplegarse en ningun escenario donde se espere comprension del lenguaje, atencion al cliente, generacion de codigo o cualquier tarea real.
- No se publican archivos GGUF a pesar de que la model card menciona la seccion de cuantizaciones; el autor indica "(brak plików GGUF)".

## Enlaces

- Hugging Face: https://huggingface.co/KomorAI/EngRandom_1.0
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
