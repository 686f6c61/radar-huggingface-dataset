# la0ka1/ELF-M-T5Gemma2distilled

## Resumen
ELF-M-T5Gemma2distilled es un modelo de difusión continua de lenguaje desarrollado por la0ka1 (Zhang Zekai) como parte de la investigación "Scaling and Distilling Text Embeddings for Better Diffusibility". Se trata de un modelo ELF (Embedded Language Flow) que genera secuencias de embeddings de texto mediante flow matching y las decodifica a tokens con una cabeza propia. La arquitectura consta de un transformer de 327M de parámetros y una cabeza de decodificación de 168M, sumando aproximadamente 495M de parámetros. Fue entrenado sobre OpenWebText con secuencias de 1024 tokens durante 5 épocas y batch de 512, utilizando los embeddings congelados del estudiante destilado T5Gemma-2-270M-OWTdistilled.

El modelo resuelve el problema de generar texto en el espacio latente de embeddings, en lugar de hacerlo directamente sobre tokens, lo que permite estudiar la difusibilidad de representaciones densas. Es relevante en el contexto de investigación sobre modelos de difusión para texto, ya que logra una perplejidad generativa de 17.8 (frente a 20.8 de GPT-2-M) en OpenWebText, lo que supone un avance en la calidad de muestreo de modelos de difusión continua. Su licencia es Gemma Terms of Use y solo soporta inglés.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión continua de lenguaje (ELF, Embedded Language Flow) con flow matching sobre embeddings de texto |
| Parámetros totales | 495M (327M en el transformer + 168M en la cabeza de decodificación) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma Terms of Use (licencia: gemma) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento
ELF-M-T5Gemma2distilled emplea la arquitectura ELF (Embedded Language Flow), un modelo de difusión continua que opera sobre embeddings de texto. En lugar de generar tokens directamente, el modelo produce una secuencia de embeddings mediante flow matching y posteriormente los decodifica a tokens con una cabeza de decodificación específica. Esta arquitectura consta de un transformer de 327M de parámetros y una cabeza de decodificación de 168M de parámetros, lo que suma aproximadamente 495M. El entrenamiento se realizó sobre OpenWebText, con secuencias de 1024 tokens, durante 5 épocas, con un batch de 512, y utilizando los embeddings congelados del modelo estudiante destilado T5Gemma-2-270M-OWTdistilled, que a su vez es un derivado de T5Gemma-2. El muestreo se lleva a cabo con un sampler SDE y guiado por self-conditioning, donde los parámetros `--sc` y `--nfe` controlan la escala de guiado y el número de pasos. No se menciona el uso de RLHF o DPO en la información proporcionada. La innovación principal es el uso de embeddings destilados y escalados para mejorar la difusibilidad del espacio latente, como se describe en el paper "Scaling and Distilling Text Embeddings for Better Diffusibility".

## Capacidades
- Generación de texto no condicionada en inglés, en estilo web, a partir de ruido inicial.
- Generación de secuencias de embeddings de texto mediante flow matching.
- Decodificación de embeddings a tokens con una cabeza propia.
- Muestreo con sampler SDE y self-conditioning guidance, ajustable mediante `--sc` y `--nfe`.
- Soporte exclusivo para inglés.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de instrucciones condicionadas.

## Casos de uso
- Investigación en modelos de difusión para texto: el modelo permite estudiar la calidad de la generación en el espacio latente de embeddings, comparando la perplejidad generativa con modelos autoregresivos como GPT-2-M.
- Estudio de espacios latentes de embeddings: al generar secuencias de embeddings, se pueden analizar propiedades geométricas y estadísticas del espacio latente, así como la relación entre embeddings y tokens decodificados.
- Evaluación de métodos de destilación de embeddings: el modelo utiliza embeddings de T5Gemma-2-270M-OWTdistilled, por lo que sirve para evaluar cómo la destilación afecta a la difusibilidad y a la calidad del texto generado.
- Reproducción de experimentos del paper: el checkpoint y el código permiten reproducir los resultados de "Scaling and Distilling Text Embeddings for Better Diffusibility", incluyendo el barrido de `--sc` y `--nfe`.
- Generación de texto sintético para investigación: se puede utilizar para generar grandes cantidades de texto no condicionado en inglés, útil para aumentar datasets de investigación o para estudiar sesgos y distribuciones lingüísticas.
- Análisis de sesgos y contenido no filtrado: al ser un modelo entrenado en OpenWebText sin filtrar, puede emplearse para estudiar sesgos y toxicidad en textos generados, siempre con fines de investigación.
- Desarrollo de decodificadores para modelos de difusión: la cabeza de decodificación puede servir como base para experimentar con nuevas arquitecturas de decodificación de embeddings a tokens.
- Benchmarking de samplers SDE: el modelo permite comparar diferentes configuraciones de sampler (`--sc`, `--nfe`) y evaluar su impacto en la perplejidad generativa.

## Benchmarks y rendimiento
| Modelo | Gen. PPL | Entropía | Configuración | Notas |
|---|---|---|---|---|
| Texto real | 15.4 | 5.43 | - | Referencia |
| ELF-M-T5Gemma2distilled | 17.8 | 5.45 | `--sc 3 --nfe 512` | Mejor modelo del paper |
| GPT-2-M | 20.8 | misma entropía | - | Baseline autoregresivo |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación se realizó sobre OpenWebText con 1024 tokens, media de 3 semillas con 1024 muestras cada una. La perplejidad generativa se calcula bajo GPT-2-Large en entropía unigrama.

## Requisitos de hardware
- No se proporcionan requisitos de hardware oficiales en la información disponible.
- El repositorio tiene un tamaño de 2.0 GB, correspondiente a los pesos en formato PyTorch (.pt).
- El modelo tiene aproximadamente 495M de parámetros. A modo orientativo, en precisión FP32 requeriría alrededor de 2 GB de VRAM, y en FP16 alrededor de 1 GB, pero no hay confirmación oficial.
- No se especifican GPU recomendadas (A100, H100, RTX 4090, etc.).
- Se desconoce si cabe en GPU consumer, aunque por el número de parámetros es plausible que quepa en GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: el código proporcionado utiliza PyTorch y scripts de muestreo (`sample.py`, `evaluate.py`). No se menciona soporte para vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se proporcionan comparativas directas con otros modelos de difusión de texto en la información disponible. La única comparación en la model card es con GPT-2-M, un modelo autoregresivo, que actúa como baseline. También se relaciona con T5Gemma-2-270M-OWTdistilled, que es el modelo cuyos embeddings se utilizan, pero no es un modelo de difusión.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento (Gen. PPL) |
|---|---|---|---|---|---|
| ELF-M-T5Gemma2distilled | Difusión continua (ELF) | 495M | 1024 | Gemma | 17.8 |
| GPT-2-M | Autoregresivo | no disponible | no disponible | no disponible | 20.8 |
| T5Gemma-2-270M-OWTdistilled | Encoder-decoder | 270M | no disponible | Gemma | no comparable |

## Limitaciones y advertencias
- El modelo genera texto web en inglés sin filtrar, por lo que puede producir contenido falso, sesgado o tóxico.
- Es un artefacto de investigación para estudiar embeddings de texto como espacios latentes, no está diseñado para uso downstream.
- Solo soporta inglés, sin capacidades multilingües.
- La longitud de contexto está limitada a 1024 tokens.
- No sigue instrucciones ni admite condicionamiento por prompt; la generación es no condicionada.
- La licencia es Gemma Terms of Use, que incluye la Gemma Prohibited Use Policy. Cualquier uso comercial debe cumplir dichos términos.
- No se proporcionan garantías de rendimiento en producción ni soporte técnico.
- El modelo se entrenó sobre OpenWebText, por lo que hereda sesgos presentes en ese corpus.

## Enlaces
- HuggingFace: https://huggingface.co/la0ka1/ELF-M-T5Gemma2distilled
- Paper (arXiv, próximamente): no disponible enlace directo
- Código: https://github.com/la0ka1/diffusing-scaled-text-embeddings
- Página del proyecto: https://la0ka1.github.io/diffusing-scaled-text-embeddings/
- Colección de modelos: https://huggingface.co/collections/la0ka1/diffusing-scaled-text-embeddings-6abd7ff3c91fd70bd749c197
- Modelo T5Gemma-2-270M-OWTdistilled: https://huggingface.co/la0ka1/T5Gemma-2-270M-OWTdistilled
- Documentación de T5Gemma 2: https://huggingface.co/docs/transformers/v5.0.0/model_doc/t5gemma2
- Cita (BibTeX):
```
@article{zhang2026scaling,
  title={Scaling and Distilling Text Embeddings for Better Diffusibility},
  author={Zhang, Zekai and Tian, Yunjie and He, Yanjin and Zhang, Xiaoyan and Zhao, Dongdi and Qu, Qing and Fu, Di},
  year={2026}
}
```
