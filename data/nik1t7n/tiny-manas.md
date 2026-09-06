# Nik1t7n/tiny-manas

## Resumen

Tiny Manas es un modelo de lenguaje autoregresivo de 26,78 millones de parámetros, desarrollado por Nik1t7n, que ha sido entrenado desde cero para continuar texto en kirguís siguiendo el estilo de una edición del épico *Manas*. Se trata de un modelo de investigación diseñado para hacer todo el pipeline de un modelo de lenguaje pequeño completamente inspeccionable: desde la tokenización BPE a nivel de byte hasta la atención causal, el entrenamiento, la evaluación y la generación con caché. Su arquitectura es un Transformer decoder-only con pre-LayerNorm y rotaciones posicionales (RoPE), con una ventana de contexto de 256 tokens y un vocabulario de 32.768 tokens construido con un BPE byte-level específico para kirguís.

Aunque no es un asistente conversacional ni sigue instrucciones, resulta relevante en el ámbito de la investigación en lenguas de bajos recursos y en la docencia de arquitecturas Transformer, ya que ofrece una implementación completa y compacta en PyTorch, sin depender del framework `AutoModel` de Transformers. El modelo fue entrenado con un presupuesto de 3.000 actualizaciones sobre un único documento del corpus Manas-UdS, y la comparación controlada entre RoPE y posiciones aprendidas llevó a adoptar RoPE, reduciendo la pérdida de validación de 4,34578 a 4,11584.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, pre-LayerNorm Transformer con RoPE |
| Parametros totales | 26.779.392 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP32 para inferencia) |
| Idiomas soportados | Kirguís (ky) |
| Licencia | tiny-manas-research-terms |
| Formato de pesos | Safetensors (también export PyTorch) |

## Arquitectura y entrenamiento

Tiny Manas es un Transformer decoder-only con pre-LayerNorm, 8 capas, 8 cabezas de atención y una anchura de embedding de 384. La red feed-forward usa activación GELU con una expansión de 4x. Emplea embeddings de entrada y salida compartidos (tied embeddings), atención causal con scaled dot-product attention, rotaciones posicionales por pares adyacentes (RoPE) y caché KV local por petición. La implementación está escrita en PyTorch de forma compacta, y no se ofrece como paquete `AutoModel` de Transformers, por lo que el widget de inferencia de Hugging Face está deshabilitado.

El entrenamiento se realizó durante 3.000 actualizaciones con acumulación de gradientes, cubriendo 4.096 tokens de destino por actualización. Se usó AdamW, una programación de tasa de aprendizaje con warmup y decaimiento coseno, dropout de 0,2 y aritmética BF16 durante el entrenamiento, mientras que la evaluación y la inferencia se mantienen en FP32. Los datos de entrenamiento proceden del documento `Manas01` del corpus Manas-UdS Kyrgyz, atribuido a Sayakbai Karalaev y licenciado bajo CC BY-NC-SA 4.0. El tokenizador es el artefacto congelado `kyrgyz-byte-bpe-v1`, con un SHA-256 especificado en el repositorio. La innovación técnica destacable es la comparación controlada entre RoPE y embeddings posicionales aprendidos: el checkpoint con RoPE redujo la pérdida de validación de 4,34578 a 4,11584.

## Capacidades

- Generación de texto autoregresiva en kirguís, limitada a la continuación de pasajes en el estilo de la edición de *Manas* utilizada.
- Implementación con caché KV local, lo que permite generación incremental eficiente para ventanas de 256 tokens.
- Soporte de muestreo con semilla fija para reproducir resultados, como se muestra en el script `generate.py`.
- No soporta instrucciones, conversación multi-turno, tool calling, visión, audio ni razonamiento multi-step.
- No es un modelo multilingüe: su vocabulario está restringido al kirguís.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades de agente.

## Casos de uso

- Investigación en lenguas de bajos recursos: el modelo demuestra que un LM funcional puede entrenarse con un corpus muy pequeño de una lengua minoritaria, y sirve como caso de estudio para analizar la viabilidad de enfoques similares.
- Docencia de arquitecturas Transformer: la implementación completa y compacta permite recorrer todo el pipeline, desde la tokenización BPE hasta la atención causal y la generación, ideal para cursos o tutoriales de NLP.
- Reproducción de experimentos: el repositorio incluye scripts de entrenamiento y generación con semillas fijas, lo que facilita la reproducción de las métricas publicadas en la model card.
- Generación de continuaciones creativas en kirguís: con un prompt como «Манас» o el inicio de un pasaje, el modelo produce texto en el estilo épico de la obra, útil para experimentos literarios o de folklore computacional.
- Evaluación de técnicas de positional encoding: al haberse comparado RoPE con posiciones aprendidas, el modelo es un banco de pruebas para estudiar el impacto de estas técnicas en secuencias cortas.
- Pruebas de inferencia en hardware modesto: al tratarse de un modelo de 26 millones de parámetros, se puede ejecutar en CPU, en Apple Silicon con MPS o en cualquier GPU con poca memoria, lo que permite validar despliegues de inferencia en entornos sin aceleradores dedicados.

## Benchmarks y rendimiento

Se han publicado métricas de evaluación sobre un split de prueba cronológico, calculadas con 100 lotes fijos en FP32. No se trata de benchmarks estándar (como MMLU o HumanEval) ni se ofrecen comparativas con otros modelos.

| Métrica | Resultado |
|---|---|
| Loss | 4,531258 |
| Perplexity | 92,8753 |
| Top-1 token accuracy | 31,698% |
| Top-5 token accuracy | 48,527% |

Estos valores describen la predicción del siguiente token sobre texto reservado de la misma edición. La model card indica que evaluaciones a nivel de libro mostraron una transferencia débil a otras ediciones y narradores, por lo que estas cifras no deben interpretarse como rendimiento general del idioma kirguís.

## Requisitos de hardware

- VRAM estimada: en FP32, los 26,78 millones de parámetros ocupan aproximadamente 107 MB. En FP16 o BF16, aproximadamente 54 MB. Las activaciones para un contexto de 256 tokens son mínimas, por lo que el modelo cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 1 GB o más (por ejemplo, una NVIDIA GTX 1650 o superior) es suficiente. También funciona en Apple Silicon vía MPS y en CPU.
- El modelo no es compatible con frameworks como vLLM, llama.cpp u Ollama, ya que se distribuye como una implementación PyTorch personalizada con su propio script `generate.py`.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño del modelo, en CPU la generación es razonablemente rápida para 256 tokens, pero no hay datos medidos en la información disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en el mismo nicho (un Transformer de 26,78 millones de parámetros entrenado exclusivamente en kirguís sobre el épico *Manas*). Los modelos pequeños genéricos como GPT-2 small (124M) o TinyLlama (1,1B) no son equivalentes ni en tamaño ni en propósito, y no cubren el kirguís. Por tanto, no se dispone de una comparativa directa.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente sobre una edición del épico *Manas*, lo que limita su capacidad a ese estilo y a ese corpus. No es un modelo general del idioma kirguís.
- Puede repetir fórmulas, generar palabras malformadas y perder la continuidad narrativa en pasajes largos, debido a la ventana de contexto de 256 tokens y al tamaño del corpus.
- No fue sometido a alineación ni a ajuste por instrucciones. No debe usarse para responder preguntas factuales, traducir ni seguir instrucciones.
- Los sesgos y errores presentes en el texto fuente pueden reproducirse en las salidas del modelo.
- La licencia `tiny-manas-research-terms` es una licencia propia de investigación con restricciones que no se detallan en la model card; se recomienda revisar el archivo `LICENSE` antes de cualquier uso comercial o publicación no supervisada.
- La implementación no sigue la interfaz estándar de Hugging Face `AutoModel`, por lo que la integración con pipelines o APIs de terceros requiere adaptación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nik1t7n/tiny-manas
- Demo pública: https://nik1t7n.com/essays/training-tiny-manas
- Artículo en inglés: https://nik1t7n.com/essays/training-tiny-manas?lang=en
- Artículo en ruso: https://nik1t7n.com/essays/training-tiny-manas?lang=ru
- Paper técnico: https://nik1t7n.com/papers/tiny-manas-paper.pdf
- Repositorio de investigación: https://github.com/nik1t7n/tiny-manas
- Tokenizador kyrgyz-byte-bpe-v1: https://github.com/nik1t7n/kyrgyz-tokenizer
- Commit del repositorio: https://github.com/nik1t7n/tiny-manas/commit/c903734fe29c5e087cb753b2bb1c3b93edc31584
