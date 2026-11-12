# guan-wang/EBFM-DCLM-520M

## Resumen

EBFM-DCLM-520M es un modelo de lenguaje de 520 millones de parámetros desarrollado por el autor guan-wang dentro del proyecto OpenEBFM, una familia de modelos de lenguaje basados en energía (energy-based language models). Se distribuye como un checkpoint de preentrenamiento exportado al formato de Transformers, con pipeline declarado `fill-mask`. El modelo emplea una arquitectura propietaria denominada "OpenEBFM d20", con 20 bloques transformer, dimensión de embedding de 1280 y 10 cabezas de atención.

El modelo se ha entrenado sobre el dataset DCLM (DataComp-LM), un corpus de preentrenamiento a gran escala ampliamente utilizado en la comunidad. Su relevancia radica en explorar una formulación alternativa a los modelos autorregresivos convencionales: en lugar de predecir el siguiente token, el paradigma basado en energía asigna una puntuación de compatibilidad a secuencias completas, lo que abre vías de investigación en modelado de lenguaje, scoring de secuencias y tareas de relleno de máscaras.

Con 519.462.400 parámetros reales (etiquetado comercial como 520M), una ventana de contexto de 2048 tokens y un vocabulario de 32768 entradas, se posiciona como un modelo de escala pequeña orientado a investigación y experimentación más que a despliegue productivo de alto rendimiento. La licencia MIT facilita su uso académico y comercial, aunque la dependencia de código remoto personalizado introduce cautelas técnicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OpenEBFM (energy-based language model), transformer de 20 bloques, implementación personalizada |
| Parámetros totales | 519.462.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en fp32/bf16 según exportación estándar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con código remoto `modeling_ebfm.py` y `configuration_ebfm.py` |
| Dimensión de embedding | 1280 |
| Cabezas de atención | 10 |
| Tamaño de vocabulario | 32768 |
| Pipeline declarado | fill-mask |
| Etapa de entrenamiento | preentrenamiento |
| Dataset de entrenamiento | DCLM |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada del paradigma OpenEBFM (energy-based foundation model), estructurada como una pila de 20 bloques transformer con dimensión de embedding 1280 y 10 cabezas de atención. A diferencia de un transformer autorregresivo estándar, el modelo se formula como un modelo de lenguaje basado en energía: asigna una función de energía a secuencias y se utiliza para tareas de scoring y relleno de máscaras (de ahí el pipeline `fill-mask`). El checkpoint exportado incluye el código remoto necesario (`modeling_ebfm.py`, `configuration_ebfm.py`) y un tokenizador serializado (`tokenizer.pkl`) junto con una tabla de bytes de tokens (`token_bytes.pt`) empleada por las métricas de OpenEBFM.

El entrenamiento se realizó en una única etapa de preentrenamiento sobre el dataset DCLM. No se especifican en la información disponible el número total de tokens procesados, la composición exacta del corpus, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. El informe técnico asociado (arXiv:2610.33005, "OpenESM: Energy-Steered Models Are Scalable Foundation Learners") es la referencia para detalles de metodología, pero sus contenidos no se han incluido en la información proporcionada.

## Capacidades

- Modelado de lenguaje mediante formulación basada en energía, con salida de logits sobre el vocabulario para tareas de scoring y fill-mask.
- Relleno de máscaras (masked language modeling): el pipeline declarado es `fill-mask`, lo que permite predecir tokens enmascarados en una secuencia.
- Scoring de secuencias: la función de energía permite puntuar la compatibilidad de secuencias completas, útil para reranking y evaluación.
- Procesamiento de contexto de hasta 2048 tokens.
- Tokenizador propio basado en `tiktoken` con vocabulario de 32768 entradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en modelos basados en energía: el modelo sirve como banco de pruebas reproducible para estudiar formulaciones EBM en NLP, comparando su comportamiento con transformers autorregresivos de tamaño similar.
- Relleno de máscaras en pipelines de NLP: uso directo del pipeline `fill-mask` para tareas de completado de huecos en textos, con contexto de hasta 2048 tokens.
- Scoring y reranking de candidatos: la función de energía permite puntuar secuencias generadas por otros sistemas (por ejemplo, candidatos de traducción o resúmenes) y reordenarlos según compatibilidad.
- Evaluación de representaciones lingüísticas: al ser un checkpoint de preentrenamiento, puede emplearse para extraer representaciones internas y analizar cómo codifica información sintáctica y semántica.
- Experimentos de alineación y control: la formulación energética facilita introducir términos de control en la función objetivo, útil en investigación sobre generación guiada.
- Docencia y formación: modelo pequeño (520M) que cabe en GPU de consumo y permite ilustrar arquitecturas alternativas a los transformers autorregresivos en cursos y talleres.
- Reproducción de resultados del informe técnico OpenESM: el checkpoint permite replicar experimentos del paper arXiv:2610.33005 sobre el dataset DCLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,1 GB de pesos (519M parámetros × 4 bytes), más overhead de activaciones y contexto; en la práctica, entre 3 y 5 GB según batch y longitud de secuencia.
- VRAM estimada en bf16/fp16: aproximadamente 1,1 GB de pesos, con overhead adicional; viable en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión reducida (RTX 3060, RTX 4060, RTX 4090); A100 o H100 para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y equivalentes.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código personalizado, el despliegue está limitado a Transformers con código remoto habilitado; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI sin adaptación del código.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-DCLM-520M | 519M | 2048 | OpenEBFM (energy-based) | MIT | Hugging Face, código remoto |
| GPT-2 medium | 355M | 1024 | Transformer autorregresivo | MIT | Hugging Face, ampliamente soportado |
| BERT-base | 110M | 512 | Transformer encoder (MLM) | Apache 2.0 | Hugging Face, soporte nativo |
| RoBERTa-base | 125M | 512 | Transformer encoder (MLM) | MIT | Hugging Face, soporte nativo |

La comparación es aproximada: EBFM-DCLM-520M no es directamente equivalente a estos modelos en paradigma de entrenamiento ni en objetivos, pero se sitúa en el mismo rango de escala. Frente a BERT y RoBERTa, ofrece mayor contexto (2048 frente a 512) y un paradigma distinto de scoring; frente a GPT-2 medium, comparte escala pero difiere en objetivo (energy-based frente a autorregresivo). No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al entrenarse sobre DCLM, puede heredar sesgos presentes en corpus web a gran escala, pero no se documentan análisis específicos.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un checkpoint de preentrenamiento sin alineación documentada, la generación libre puede producir contenido incoherente o factualmente incorrecto.
- Limitaciones de contexto: ventana de 2048 tokens, inferior a la de modelos contemporáneos de mayor escala.
- Limitaciones de idioma: no se declaran idiomas soportados; el vocabulario de 32768 entradas y el corpus DCLM sugieren predominio del inglés, pero no está confirmado.
- Restricciones de licencia: MIT permite uso comercial, pero la dependencia de código remoto (`trust_remote_code=True`) implica ejecutar código de terceros no auditado, lo que supone un riesgo de seguridad en producción.
- Compatibilidad: no se garantiza funcionamiento con ecosistemas de inferencia estándar (vLLM, llama.cpp, TGI) sin adaptación del código personalizado.
- Madurez: modelo con 69 descargas y 1 like en el momento de la consulta; ecosistema limitado y poca validación comunitaria.
- Uso previsto: checkpoint de preentrenamiento orientado a investigación; no se han publicado instrucciones de ajuste fino ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/guan-wang/EBFM-DCLM-520M
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe técnico (arXiv:2610.33005): https://huggingface.co/papers/2610.33005
- Paper en arXiv: https://arxiv.org/abs/2610.33005
