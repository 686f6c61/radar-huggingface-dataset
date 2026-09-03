# gpjt/1xrtx3090-moe-1

## Resumen

`gpjt/1xrtx3090-moe-1` es un modelo de lenguaje causal de tipo GPT-2 con soporte de Mixture-of-Experts (MoE), desarrollado por Giles Thomas a partir del código del libro *Build a Large Language Model (from Scratch)* de Sebastian Raschka. Se trata de un modelo entrenado desde cero, pensado como experimento educativo para explorar cómo añadir capas MoE a una arquitectura GPT-2 clásica, no como un modelo listo para producción.

El modelo tiene 12 capas, 12 cabezas de atención, dimensión de embedding de 768 y 6 expertos por capa (2 activos por token). Según la model card, cuenta con 446.410.752 parámetros totales (219.697.152 activos por token), aunque el archivo safetensors indica 458.993.664 parámetros. La longitud de contexto es de 1.024 tokens. Fue entrenado con aproximadamente 8.928 millones de tokens del dataset `gpjt/fineweb-gpt2-tokens` en una máquina local con una RTX 3090.

Su relevancia radica en que demuestra cómo extender una arquitectura bien conocida con MoE de forma sencilla y reproducible, sirviendo como base para experimentos de fine-tuning o para estudiar el comportamiento de los expertos en modelos pequeños. El propio autor advierte que el modelo es "tonto e ignorante" y recomienda usar modelos más grandes para tareas serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 con capas MoE (6 expertos por capa, 2 activos) |
| Parametros totales | 458.993.664 (según safetensors); 446.410.752 según la model card |
| Parametros activos | 219.697.152 por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original (12 capas, 12 cabezas, embedding de 768) pero sustituye las redes feed-forward estándar por bloques MoE con 6 expertos por capa, de los cuales se activan 2 por token. No se utiliza weight tying entre embeddings y la cabeza de salida, y el bias en QKV está desactivado. El código es personalizado y requiere `trust_remote_code=True` al cargarlo con Transformers.

El entrenamiento se realizó sobre el dataset `gpjt/fineweb-gpt2-tokens`, con un total de 8.928.264.192 tokens. Se usó un micro-batch de 3, un batch global de 96, dropout 0.0, gradient clipping de 3.5, learning rate de 0.0014 con programación de tasa de aprendizaje, y weight decay de 0.01. El entrenamiento se llevó a cabo en una RTX 3090, lo que condiciona el tamaño y la duración del proceso.

## Capacidades

- Generación de texto autocompletivo: el modelo puede continuar secuencias de texto de forma autoregresiva, aunque su calidad es limitada debido a su tamaño y al número reducido de tokens de entrenamiento.
- Fine-tuning: al ser un modelo base, se puede ajustar para tareas específicas mediante fine-tuning supervisado. El repositorio incluye un notebook de ejemplo.
- Soporte de MoE: permite estudiar el comportamiento de los expertos, la asignación de tokens y el impacto de la esparsidad en modelos pequeños.
- Integración con Transformers: compatible con `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`, siempre que se active `trust_remote_code`.
- No dispone de tool calling, ni capacidades multimodales, ni modo de razonamiento explícito. Tampoco se especifica soporte multilingüe.

## Casos de uso

- Experimentación educativa: ideal para estudiantes o desarrolladores que quieran entender cómo funciona MoE en la práctica, ya que el código es abierto y el modelo es lo bastante pequeño para ejecutarse en una GPU doméstica.
- Investigación sobre esparsidad: permite analizar qué expertos se activan para distintos tipos de tokens o dominios, y cómo afecta la elección de expertos a la calidad de la generación.
- Prototipado de fine-tuning: al ser un modelo base, se puede ajustar para tareas concretas como clasificación de texto o generación de dominios específicos, siempre que se disponga de un dataset adecuado.
- Comparación de arquitecturas: sirve como punto de partida para comparar el rendimiento de GPT-2 clásico frente a una versión MoE del mismo tamaño, usando el modelo `gpjt/1xrtx3090-baseline` como referencia.
- Pruebas de infraestructura: al ser ligero (menos de 500M de parámetros), es útil para validar pipelines de inferencia o fine-tuning en entornos con recursos limitados.
- Generación de texto creativo de baja exigencia: puede usarse para generar fragmentos cortos de texto (poesía, microcuentos) donde la coherencia no sea crítica, aunque los resultados serán pobres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K, y dado el tamaño y el entrenamiento limitado, no se espera que el modelo compita con modelos modernos.

## Requisitos de hardware

- Inferencia en CPU: posible gracias a su tamaño reducido, aunque la generación será lenta.
- VRAM estimada: en fp32, el modelo ocupa aproximadamente 1,8 GB; en fp16, unos 0,9 GB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 2060, RTX 3060, RTX 3090, etc.) es suficiente. El entrenamiento se realizó en una RTX 3090.
- Opciones de despliegue: al ser compatible con Transformers, se puede usar con bibliotecas como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, la inferencia en GPU debería ser de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpjt/1xrtx3090-moe-1 | 458M (MoE) | 1.024 | GPT-2 + MoE | Apache-2.0 | HuggingFace |
| gpjt/1xrtx3090-baseline | ~446M (denso) | 1.024 | GPT-2 | Apache-2.0 | HuggingFace |
| GPT-2 small (124M) | 124M | 1.024 | GPT-2 | MIT | HuggingFace |

La comparación directa con GPT-2 small no es equitativa por la diferencia de parámetros, pero ambos comparten contexto y arquitectura base. El modelo MoE del autor tiene más parámetros totales pero activa solo una fracción por token, lo que puede ofrecer una relación coste-beneficio interesante para estudiar. No se dispone de benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- El modelo es un experimento educativo: el propio autor advierte que es "tonto e ignorante" y que no debe usarse para trabajo serio.
- Alucinaciones frecuentes: debido al limitado número de tokens de entrenamiento, el modelo inventa hechos y carece de conocimiento factual fiable.
- Contexto muy corto (1.024 tokens): limita su uso en tareas que requieran dependencias de largo alcance.
- Sin soporte multilingüe declarado: probablemente solo genera texto en inglés, aunque no se especifica.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código no verificado por HuggingFace. Se recomienda revisar el código antes de usarlo en entornos sensibles.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF, AWQ u otras, por lo que el despliegue en formatos optimizados requiere conversión manual.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo derivado de GPT-2 (cuyo peso original tiene licencia MIT), no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gpjt/1xrtx3090-moe-1)
- [Repositorio GitHub](https://github.com/gpjt/ddp-base-model-from-scratch)
- [Blog post del autor (próximamente)](https://www.gilesthomas.com/2026/09/gpt-2-to-moe)
- [Dataset de entrenamiento](https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens)
- [Modelo baseline del mismo autor](https://huggingface.co/gpjt/1xrtx3090-baseline)
