# aflah/Llama8BxFWx2048x75pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato crudo GPT-NeoX correspondiente a los experimentos de *Partial RoPE* descritos en el artículo *Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE* (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo, denominado Llama8BxFWx2048x75pct, es un transformador de arquitectura Llama de 8 mil millones de parámetros entrenado sobre el dataset FineWeb con una longitud de secuencia de 2.048 tokens y una aplicación parcial de RoPE del 75 % de las capas.

El objetivo del trabajo es estudiar cómo la aplicación fraccional de la rotación posicional afecta al rendimiento y a la convergencia del entrenamiento, en comparación con el uso completo de RoPE en todas las capas. Este checkpoint concreto corresponde al paso global 12.000 y se publica como material de investigación, no como un modelo listo para producción. Su relevancia radica en que permite reproducir y analizar los resultados del estudio, así como servir de base para futuras investigaciones sobre técnicas de positional encoding parcial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 8B (transformer decoder, GPT-NeoX checkpoint) |
| Parametros totales | 8.000 millones (aprox., no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo sin cuantizar) |
| Idiomas soportados | no disponible (dataset FineWeb, mayoritariamente ingles) |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX raw checkpoint (no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 8B, un transformer decoder-only con atención por ventanas (sliding window) y normalización RMSNorm. La innovación principal es la aplicación parcial de RoPE: en lugar de aplicar la rotación posicional a todas las dimensiones de los embeddings, se aplica solo al 75 % de las dimensiones. Esta técnica busca reducir el coste computacional y estudiar su impacto en la convergencia y la calidad final. El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia de 2.048 tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un checkpoint de pre-entrenamiento puro.

El checkpoint se guarda en formato GPT-NeoX (el formato nativo de la librería de EleutherAI), sin convertir a Hugging Face Transformers. Esto implica que para cargarlo se necesitan las herramientas específicas de GPT-NeoX o una conversión manual. El paso global 12.000 corresponde a un punto intermedio del entrenamiento, por lo que no es un modelo finalizado sino un artefacto de investigación.

## Capacidades

- Generación de texto autoregresiva: al ser un checkpoint de pre-entrenamiento, puede generar texto coherente en inglés (probablemente, dado el dataset FineWeb), aunque no ha sido sometido a fine-tuning para tareas concretas.
- Razonamiento básico: las capacidades de razonamiento son las propias de un modelo de 8B pre-entrenado, sin ajuste posterior.
- No se ha documentado soporte para tool calling, function calling, agentes, vision o audio.
- La capacidad multilingüe es limitada: FineWeb contiene mayoritariamente texto en inglés, por lo que el modelo tendrá un rendimiento pobre en otros idiomas.
- No incluye modo de razonamiento extendido (thinking mode) ni ninguna característica especial más allá de la experimentación con RoPE parcial.

## Casos de uso

- Investigación académica sobre positional encoding: el modelo es un recurso para reproducir los experimentos del paper y analizar el efecto del 75 % de RoPE en la calidad del modelo. Se puede comparar con checkpoints con otros porcentajes (100 %, 50 %, etc.) para estudiar la curva de rendimiento.
- Estudios de convergencia y dinámica de entrenamiento: al ser un checkpoint intermedio (paso 12.000), permite investigar cómo evoluciona la pérdida y la calidad de las representaciones durante el entrenamiento con RoPE parcial.
- Análisis de la estructura interna de las capas: los investigadores pueden examinar las activaciones y pesos para entender cómo la rotación parcial afecta a la atención y a la representación de posiciones.
- Base para fine-tuning experimental: aunque no está en formato Transformers, se puede convertir a ese formato y usarlo como punto de partida para fine-tuning en tareas específicas, comparando con un modelo entrenado con RoPE completo.
- Reproducción de resultados: sirve para verificar los hallazgos del paper de forma independiente.
- Evaluación de la robustez de RoPE parcial en distintos datasets o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper (arXiv:2603.11611) probablemente contiene evaluaciones, pero no se han extraído datos concretos en la búsqueda web. Por tanto, no se puede presentar una tabla de comparación con otros modelos.

## Requisitos de hardware

- El checkpoint ocupa 115.7 GB en disco (formato GPT-NeoX, pesos en FP32 probablemente). Para inferencia en FP16, el modelo de 8B requiere aproximadamente 16 GB de VRAM.
- GPU recomendadas: al menos una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) para inferencia en FP16 con contexto de 2048 tokens. Para entrenamiento o fine-tuning se necesitaría más capacidad (A100 80 GB o H100).
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización, pero no se ofrecen versiones cuantizadas.
- Despliegue: al ser un checkpoint GPT-NeoX, no se puede cargar directamente con vLLM, Ollama o TGI sin convertirlo a formato Transformers. Se puede convertir con scripts de EleutherAI y después usar vLLM o llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles, ya que se trata de un checkpoint experimental específico para el estudio de RoPE. Se podría comparar con el checkpoint de 100 % RoPE (aflah/Llama8BxFWx2048x100pct) que existe en Hugging Face, pero no se dispone de sus métricas. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un checkpoint de entrenamiento sin alineación ni fine-tuning, por lo que puede generar contenido no deseado, tóxico o incorrecto.
- No se ha publicado licencia explícita; su uso en producción comercial es dudoso y requiere consultar con los autores.
- El formato GPT-NeoX no es compatible directamente con el ecosistema Hugging Face Transformers; requiere conversión.
- La longitud de contexto está limitada a 2.048 tokens, inferior a la de los modelos actuales (4k, 8k o más).
- El modelo está entrenado principalmente con texto inglés, por lo que su rendimiento en otros idiomas será muy limitado.
- Riesgo de alucinación elevado, como en todos los modelos de esta escala sin fine-tuning.
- Los resultados de convergencia y rendimiento están ligados al experimento concreto; no se debe asumir que este checkpoint supera a un modelo estándar de Llama 8B.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama8BxFWx2048x75pct)
- [Artículo en arXiv](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis en GitHub](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Modelo con 100 % RoPE (comparación)](https://huggingface.co/aflah/Llama8BxFWx2048x100pct)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
