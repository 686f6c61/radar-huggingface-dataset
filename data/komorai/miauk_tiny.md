# KomorAI/Miauk_Tiny

## Resumen

Miauk_Tiny es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el desarrollador KomorAI y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo experimental y de juguete (toy-model) cuyo propósito declarado es la experimentación y el aprendizaje, no la producción. Su arquitectura es un transformer decoder-only minúsculo: 2 capas, 64 dimensiones de embedding, 2 cabezas de atención y una longitud de contexto de 64 tokens.

El dato más llamativo es su vocabulario: únicamente 5 tokens (`miau`, `Miauk` y los especiales `[UNK]`, `[PAD]` y `<|endoftext|>`). Con 104.512 parámetros totales, el modelo no puede generar lenguaje natural más allá de combinaciones de esas dos palabras. Fue entrenado con 200 ejemplos de frases aleatorias generadas a partir de ese mismo vocabulario, mediante un script ejecutado en Google Colab.

Su relevancia es exclusivamente didáctica: sirve como ejemplo mínimo reproducible de un pipeline completo de entrenamiento de un GPT-2 (tokenizador propio, definición de arquitectura, entrenamiento y publicación en safetensors) y como caso extremo para estudiar el comportamiento de modelos con vocabulario trivial. No es una alternativa a ningún modelo de propósito general y no debe evaluarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parámetros totales | 104.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (`n_positions = 64`) |
| Tipos de cuantización | no disponible (el autor indica que no hay ficheros GGUF) |
| Idiomas soportados | pl, en (declarados; el vocabulario efectivo es de 2 palabras) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura declarados por el autor: `n_layer = 2`, `n_embd = 64`, `n_head = 2`, `vocab_size = 5`. Tamaño del repositorio: 0,0 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración estándar de GPT-2 pero reducida al mínimo: 2 bloques, embedding de 64 dimensiones, 2 cabezas de atención y 64 posiciones de contexto. El vocabulario es un tokenizador propio de 5 entradas construido a partir de las palabras `miau` y `Miauk` más tres tokens especiales (`[UNK]`, `[PAD]`, `<|endoftext|>`).

El entrenamiento se realizó desde cero con un script en Google Colab sobre un conjunto de 200 ejemplos de frases aleatorias generadas a partir del vocabulario del usuario. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste como RLHF o DPO; todos estos datos deben considerarse no disponibles. No se describe ninguna innovación técnica (atención lineal, decodificación especulativa, MoE, etc.); es una implementación convencional de GPT-2 a escala de juguete.

## Capacidades

- Generación de texto limitada a secuencias compuestas por los tokens de su vocabulario (`miau`, `Miauk` y especiales).
- Modelado de lenguaje autoregresivo básico sobre ese vocabulario restringido.
- Tokenización con vocabulario propio de 5 entradas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües reales pese a declarar `pl` y `en`: el vocabulario efectivo son dos palabras.
- Sin modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de fundamentos de LLM: sirve para mostrar de principio a fin cómo se define un GPT-2, se entrena un tokenizador mínimo y se publican pesos en safetensors, con un coste computacional despreciable.
- Pruebas de integración de pipelines: útil para validar el cableado de `transformers`, carga de safetensors y generación con `model.generate` en entornos de CI sin consumo relevante de recursos.
- Test de herramientas de serving: permite comprobar que un endpoint de inferencia (por ejemplo, un servidor compatible con la API de transformers) arranca y responde correctamente antes de desplegar modelos reales.
- Experimentos sobre tokenización: caso extremo para estudiar el comportamiento de modelos con vocabularios triviales y el impacto del token `[UNK]` en la generación.
- Reproducibilidad educativa: ejemplo de entrenamiento en Google Colab que puede replicarse en minutos y compararse con variantes (más capas, más vocabulario) para ilustrar el efecto de la escala.
- Demostraciones de limitaciones: útil para explicar a audiencias no técnicas por qué un modelo con 104.512 parámetros y 5 tokens de vocabulario no puede realizar tareas lingüísticas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en safetensors ocupan del orden de unos pocos cientos de kilobytes (repositorio de 0,0 GB).
- GPU recomendadas: cualquier GPU, incluida una iGPU; no requiere acelerador dedicado. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) y en hardware embebido.
- Opciones de despliegue: `transformers` en Python (soporte nativo según la model card). El autor menciona llama.cpp, Ollama y LM Studio, pero no publica ficheros `.gguf`, por lo que esas rutas requerirían una conversión propia.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera generación prácticamente instantánea, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miauk_Tiny (KomorAI) | 104.512 | 64 tokens | 5 tokens | MIT | Hugging Face, safetensors |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | 50.257 tokens | MIT | Hugging Face, safetensors |
| Modelos de juguete tipo nanoGPT | variable (típicamente < 10 M) | configurable | depende del corpus | MIT (habitual) | Repositorios de código y Hugging Face |

La comparación relevante es con GPT-2 small: Miauk_Tiny tiene aproximadamente tres órdenes de magnitud menos parámetros y un vocabulario 10.000 veces menor, lo que lo sitúa en una categoría funcional distinta (demostración educativa frente a modelo de propósito general). No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Modelo de juguete: el propio autor indica que no es apto para tareas lingüísticas normales y que genera principalmente secuencias de su vocabulario reducido.
- Vocabulario de 5 tokens: cualquier entrada fuera de `miau`/`Miauk` se mapea a `[UNK]`, lo que hace inviable el uso con texto real.
- Contexto de 64 tokens: insuficiente para cualquier conversación multi-turno o documento.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la salida es esencialmente ruido combinatorio sin valor semántico.
- Sesgos: no documentados; con un dataset de 200 frases aleatorias no hay base para evaluar sesgos, pero tampoco garantías de neutralidad.
- Idiomas: aunque declara `pl` y `en`, no tiene capacidad multilingüe efectiva.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no es funcional para producción; la licencia no implica idoneidad técnica.
- Sin ficheros GGUF publicados: las instrucciones de la model card para llama.cpp/Ollama/LM Studio requieren conversión previa por parte del usuario.
- Fecha de creación registrada en 2026-11-20: conviene verificar la vigencia y el mantenimiento del repositorio antes de basarse en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KomorAI/Miauk_Tiny
