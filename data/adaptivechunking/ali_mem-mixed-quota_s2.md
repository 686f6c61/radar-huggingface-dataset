# AdaptiveChunking/ali_mem-mixed-quota_s2

## Resumen

`ali_mem-mixed-quota_s2` es un modelo experimental de investigación desarrollado por el colectivo AdaptiveChunking en el marco del proyecto beetle-hnet. No es un modelo de lenguaje generativo convencional, sino una ejecución de entrenamiento de una arquitectura H-Net a nivel de byte (byte-level), diseñada para investigar tokenización dinámica y segmentación adaptativa de secuencias. El identificador `ali` hace referencia a la variante arquitectónica y `objective=ratio` al objetivo de entrenamiento empleado.

El modelo es deliberadamente pequeño: 22.785.088 parámetros totales, con pesos almacenados en safetensors y PyTorch como framework. Se entrenó durante 6.000 pasos sobre secuencias de 1.024 bytes con tres idiomas (inglés, turco y finés), lo que lo sitúa como una pieza de ablación más que como un modelo listo para producción. Su interés radica en el enfoque de chunking dinámico y decodificación por EMA (`dechunk=ema`), que reinterpreta cómo un modelo consume bytes sin tokenizador fijo.

La relevancia actual es acotada pero específica: sirve como referencia reproducible para quienes investigan alternativas al tokenizador BPE tradicional, especialmente en contextos multilingües con morfología aglutinante (turco, finés) donde los esquemas de chunking fijo rinden peor. Al publicarse con licencia Apache 2.0 y estado de entrenamiento resumible, permite extender los experimentos sin partir de cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 bytes por secuencia de entrenamiento |
| Tipos de cuantización | No disponible (solo safetensors en fp32/fp16 según pesos) |
| Idiomas soportados | Inglés, turco, finés (`['en', 'tr', 'fi']`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos ligados mapeados vía `config.json["tied_weights"]`) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net operando a nivel de byte, con un mecanismo de chunking dinámico que agrupa bytes en segmentos variables según el contenido, en lugar de usar un vocabulario de tokens predefinido. El objetivo de entrenamiento es `ratio` (relación de compresión entre bytes de entrada y representaciones internas) y la decodificación de segmentos se hace por media móvil exponencial (`dechunk=ema`). El schedule es `None`, lo que indica ausencia de programación curricular o de fases explícitas adicionales.

El entrenamiento se ejecutó durante 6.000 pasos con batches de tamaño 32 y secuencias de 1.024 bytes, sobre un corpus mixto en inglés, turco y finés (seed 2). El repositorio conserva checkpoints resumibles (`training_state/checkpoint.pt`) en ramas `step-N` siguiendo un schedule log2 y una rama `main` con el estado final, `log.jsonl` y sondas de frontera FLORES+. Esta estructura permite reanudar el entrenamiento y auditar la evolución del modelo paso a paso.

## Capacidades

- Procesamiento de texto a nivel de byte sin tokenizador externo.
- Segmentación dinámica de secuencias (chunking adaptativo) como capacidad central del modelo.
- Multilingüe limitado a inglés, turco y finés según el corpus de entrenamiento.
- Generación de representaciones internas para sondas de frontera (FLORES+ boundary probes).
- Reentrenamiento resumible desde checkpoints intermedios con el estado completo del trainer.
- No incluye capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización libre de vocabulario: sirve para comparar contra BPE/SentencePiece en tareas de segmentación morfológica, especialmente en turco y finés por su aglutinación.
- Ablación de objetivos de entrenamiento: el objetivo `ratio` puede contrastarse con otros objetivos publicados en la misma familia beetle-hnet para medir impacto en compresión de representaciones.
- Reproducción de experimentos: los checkpoints `step-N` y el estado del trainer permiten reanudar desde cualquier paso y validar resultados de papers afines.
- Análisis de sondas de frontera con FLORES+: útil para estudiar dónde el modelo segmenta entre palabras y morfemas en distintos idiomas.
- Base para fine-tuning en tareas de chunking específicas de dominio (p. ej., lenguajes con morfología rica) sin reentrenar desde cero.
- Docencia y formación: por su tamaño reducido (≈22,8 M parámetros) y licencia Apache 2.0, es apto para laboratorios y cursos sobre arquitecturas byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (≈91 MB solo de pesos) y holgadamente inferior en fp16/bf16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) o incluso CPU para inferencia puntual.
- Cabe en consumer GPU y en la mayoría de iGPU/NPU con memoria compartida.
- Opciones de despliegue: PyTorch nativo (carga vía `huggingface_hub` + `torch.load`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de investigación sin pipeline declarado, no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ali_mem-mixed-quota_s2 | 22,8 M | 1.024 bytes | Apache 2.0 | Hugging Face (repo público) | Byte-level H-Net, chunking dinámico |
| Modelos byte-level tipo ByT5-small | ≈300 M | 512–1.024 bytes | Apache 2.0 | Hugging Face | Tokenizador byte-level, sin chunking dinámico |
| Modelos token-level pequeños (p. ej., GPT-2 small) | ≈124 M | 1.024 tokens | MIT | Hugging Face | Tokenizador BPE, no byte-level |
| Canine (Google) | ≈133 M | 2.048 tokens | Apache 2.0 | Hugging Face | Character-level con atención local |

La comparación es orientativa: `ali_mem-mixed-quota_s2` es un checkpoint de investigación, no un modelo de propósito general, y no se dispone de benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria.
- Corpus de entrenamiento limitado a tres idiomas (en, tr, fi); no se debe asumir competencia en castellano.
- Ventana de contexto de 1.024 bytes: insuficiente para documentos largos o conversaciones multi-turno.
- Ausencia de benchmarks publicados: no se puede afirmar calidad de generación ni de razonamiento.
- Sin soporte declarado de tool calling, agentes ni pipeline estándar (`pipeline: no disponible`).
- Riesgo de alucinación no caracterizado; al ser un modelo byte-level, la salida puede ser incoherente fuera de las distribuciones vistas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción.
- El repositorio pesa 7,2 GB por la inclusión de checkpoints y estados del trainer; conviene descargar solo los artefactos necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-quota_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Dataset de sondas FLORES+: https://huggingface.co/datasets/facebook/flores (referencia estándar; no se indica enlace explícito en la model card)
