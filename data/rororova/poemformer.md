# rororova/poemformer

## Resumen

PoemFormer es un modelo de lenguaje decoder-only de aproximadamente 95 millones de parámetros, entrenado desde cero por el desarrollador independiente rororova para generar poesía en inglés. Se trata de un proyecto experimental de tipo hobby, no de un modelo de producción: el propio autor advierte en la model card que la calidad de salida es modesta, con texto con forma de poema pero a menudo poco coherente, y que no se publican cifras de benchmarks ni muestras curadas.

La arquitectura parte del backbone habitual de un modelo causal (10 capas, 12 cabezas de atención, dimensión de modelo 768, FFN con SwiGLU y dimensión 2048, RoPE con base 10.000, embeddings de entrada y salida atados), pero incorpora tres mecanismos específicos para estructura poética: embeddings jerárquicos de línea y estrofa, un banco de memoria de rima implementado como cross-attention de media anchura en cada bloque, y un sesgo de atención métrico aprendido e indexado por la posición del token dentro de su línea. El contexto es de solo 256 tokens y el tokenizador es un SentencePiece BPE con vocabulario de 16.000 unidades que preserva el salto de línea como token propio.

Su relevancia es fundamentalmente didáctica y de investigación: es un ejemplo completo y reproducible de entrenamiento from scratch (script de entrenamiento, definición del modelo, tokenizador y script de generación incluidos en el repositorio) pensado para ejecutarse en una única GPU T4 o P100 de Kaggle. No es un modelo que `transformers` pueda cargar mediante `AutoModel`, y el widget de inferencia alojado en Hugging Face está desactivado. El repositorio ocupa 0,4 GB y el checkpoint se distribuye en fp32 como `state_dict` de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con mecanismos auxiliares de estructura poética (embeddings de línea y estrofa, banco de memoria de rima vía cross-attention, sesgo de atención métrico) |
| Parámetros totales | ~95M (embeddings de entrada y salida atados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (el checkpoint publicado es fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`checkpoints/weights_best.pt`, fp32) más `model_config.json`; no se publican safetensors ni GGUF |

Detalles adicionales de arquitectura: 10 capas, 12 cabezas, `d_model` = 768, FFN SwiGLU con `d_ff` = 2048, RoPE con base 10.000, tokenizador SentencePiece BPE de 16.000 tokens con `\n` como token propio, límites de 64 líneas y 16 estrofas para los embeddings jerárquicos, banco de memoria de rima sobre los últimos 8 tokens finalizadores de línea y sesgo métrico de dimensiones `heads × 24 × 24`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con atención causal al que se le añaden tres señales estructurales. Primero, cada embedding de token incorpora un embedding aprendido de número de línea (hasta 64) y otro de número de estrofa (hasta 16), derivados del recuento de saltos de línea, donde una línea en blanco (`\n\n`) marca el inicio de una estrofa. Segundo, cada bloque incluye una capa de cross-attention de media anchura que atiende a los embeddings de los últimos 8 tokens que cerraron una línea, de modo que el final de una línea puede consultar finales anteriores independientemente de su distancia en el contexto. Tercero, se suma a los logits de atención un sesgo aprendido de forma `(heads × 24 × 24)` indexado por la posición del token dentro de su línea, lo que permite a las cabezas aprender patrones de tipo métrico a partir de los datos.

El entrenamiento se realizó con predicción del siguiente token (entropía cruzada), truncando cada poema a 256 tokens. Los datos proceden de tres fuentes (`merve/poetry`, `suayptalha/Poetry-Foundation-Poems` y `biglam/gutenberg-poetry-corpus`) recopiladas en ese orden hasta alcanzar 200.000 textos con eliminación aproximada de duplicados; el corpus de Gutenberg, almacenado una línea por fila, se agrupó en bloques de 32 líneas. El script de entrenamiento menciona además varios datasets de letras de canciones, pero solo se usan si las fuentes poéticas no alcanzan el tope de 200.000. Se empleó AdamW (β = 0,9 y 0,95, weight decay 0,1), tasa de aprendizaje máxima 3e-4 con 300 pasos de warmup y decaimiento coseno hasta el 10 % del pico, batch efectivo de 32 (8 × 4 pasos de acumulación de gradiente), 4 épocas, precisión mixta fp16 y recorte de gradiente en 1,0, todo sobre una única NVIDIA T4 de Kaggle. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto poético en inglés con estructura de líneas y estrofas inferida a partir de saltos de línea.
- Modelado explícito de rima mediante el banco de memoria de finales de línea.
- Modelado laxo de métrica mediante el sesgo de atención por posición intra-línea.
- Generación condicionada por prompt y generación incondicional (prompt vacío).
- Muestreo configurable con temperatura y top-p (por defecto 0,9 y 0,92).
- Generación de múltiples muestras por prompt (`--num-samples`).
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Estudio de arquitecturas personalizadas: el repositorio incluye `poemformer.py`, `tokenizer.py`, `train.py` y `generate.py`, lo que permite reproducir el entrenamiento completo en una T4 y experimentar con los mecanismos de línea, estrofa y rima en un entorno de bajo coste.
- Investigación sobre condicionamiento estructural en modelos de lenguaje: los embeddings jerárquicos y el sesgo métrico sirven como banco de pruebas para medir cómo señales explícitas de estructura afectan a la generación, comparándolas con un GPT plano equivalente.
- Docencia y formación: al ser un modelo pequeño, from scratch y con todo el código disponible, es adecuado para explicar tokenización BPE, RoPE, SwiGLU y atención causal en un curso práctico, con inferencia en CPU o en una GPU consumer.
- Prototipado de herramientas creativas: generación de borradores de verso con forma de poema para editores o aplicaciones de escritura asistida, aceptando que el texto requerirá revisión humana por su coherencia irregular.
- Experimentos de generación condicionada por rima: el banco de memoria de rima permite probar hasta qué punto el modelo recupera terminaciones de versos anteriores, útil para estudiar el fenómeno en modelos pequeños.
- Generación incondicional de corpus sintético de texto con estructura de verso: útil para pruebas de pipelines de formateo, conteo de líneas o análisis de estructura, no para contenido publicable.
- Referencia para ablaciones: dado que los tres mecanismos adicionales están aislados en el código, se pueden desactivar y comparar pérdida de validación para cuantificar su aportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no proporciona cifras de benchmarks ni muestras curadas, y que el único dato de calidad es el checkpoint con menor pérdida de validación (`weights_best.pt`), cuyo valor numérico no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~95M parámetros en fp32, los pesos ocupan aproximadamente 0,38 GB; en fp16, unos 0,19 GB. Sumando activaciones y caché KV para un contexto de 256 tokens, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el propio autor entrenó en una NVIDIA T4 (16 GB) y menciona también P100. Funciona igualmente en CPU.
- GPU consumer: sí, cabe en cualquier RTX (por ejemplo, RTX 3060, 4060, 4090) e incluso en GPUs de gama baja y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no es compatible con `transformers`/`AutoModel` ni, por tanto, con vLLM o TGI de forma directa. El despliegue previsto es mediante el script `generate.py` del repositorio o cargando `load_model` y `generate` desde Python con PyTorch y SentencePiece. No se documentan conversiones a GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoemFormer | ~95M | 256 tokens | Poesía en inglés con estructura explícita (línea, estrofa, rima, métrica) | MIT | Pesos PyTorch personalizados, sin soporte `transformers` |
| GPT-2 small | 124M | 1.024 tokens | LM causal generalista en inglés | MIT | Pesos en `transformers`, ampliamente soportado |
| DistilGPT-2 | 82M | 1.024 tokens | LM causal generalista destilado | MIT | Pesos en `transformers` |

La comparación con GPT-2 small y DistilGPT-2 es pertinente por rango de tamaño (82M–124M) y por ser modelos causales en inglés con licencia permisiva. PoemFormer ofrece un contexto cuatro veces menor (256 frente a 1.024 tokens) y carece de integración con el ecosistema `transformers`, pero incorpora condicionamiento estructural del que los modelos generalistas carecen. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Calidad limitada: el autor describe la salida como texto con forma de poema pero a menudo poco coherente; rima y métrica se aprenden solo de forma laxa.
- Proyecto experimental: desarrollado como hobby sobre una única GPU, sin fase de alineación ni filtrado de salidas.
- Solo inglés: no hay soporte multilingüe.
- Estilo arcaico: la mayor parte del corpus es poesía de dominio público antigua, por lo que el registro resultante suena anticuado.
- Contexto muy corto (256 tokens): los poemas largos pierden la referencia a su inicio.
- Limitación del banco de rima: durante la generación solo se llena con las líneas que el propio modelo escribe; las líneas del prompt no se incorporan a la memoria de rima.
- Riesgo de repetición y de reproducir sesgos o contenido presente en los textos de origen, al no haberse filtrado las salidas.
- Riesgo de alucinación inherente a un modelo pequeño entrenado desde cero: no debe usarse como fuente de hechos.
- Compatibilidad: no carga con `transformers`/`AutoModel`, el widget de inferencia está desactivado y no se publican pesos en safetensors ni GGUF.
- Licencia MIT: permite uso comercial, pero dada la calidad y los caveats anteriores no es recomendable para producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rororova/poemformer
- Dataset `merve/poetry`: https://huggingface.co/datasets/merve/poetry
- Dataset `suayptalha/Poetry-Foundation-Poems`: https://huggingface.co/datasets/suayptalha/Poetry-Foundation-Poems
- Dataset `biglam/gutenberg-poetry-corpus`: https://huggingface.co/datasets/biglam/gutenberg-poetry-corpus
