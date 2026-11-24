# end433/EndiumLLM-10M-256

## Resumen

EndiumLLM-10M-256 es un modelo de lenguaje causal de tipo GPT, desarrollado por el usuario end433 bajo el paraguas del proyecto experimental EndiumLLM. Se trata de un modelo entrenado desde cero (trained from scratch) sobre el corpus WikiText-103 de Salesforce, con un total de 9.978.688 parámetros y una longitud de contexto de 256 tokens. Su vocabulario es de 8192 tokens y está pensado exclusivamente para inglés.

El modelo se publica como una prueba de concepto de pretraining a pequeña escala: no busca competir con modelos de producción, sino servir como referencia reproducible de un transformer causal mínimo entrenado con PyTorch y Tokenizers. La arquitectura es un transformer estilo GPT con atención causal estándar, sin innovaciones declaradas en la model card más allá de su naturaleza de entrenamiento desde cero.

Su relevancia actual es limitada para aplicaciones reales, pero resulta útil como material didáctico, como baseline de experimentación en entornos con recursos muy restringidos y como ejemplo de pipeline completo de pretraining (dataset, tokenizador, entrenamiento e inferencia). La licencia figura como "other", lo que obliga a revisar los términos concretos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT |
| Parametros totales | 9.978.688 (~10M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | PyTorch (no se especifica safetensors ni GGUF) |

Datos adicionales declarados en la model card: vocabulario de 8192 tokens, dataset de entrenamiento WikiText-103, version 0.1 del modelo.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de estilo GPT, con atención causal estándar y sin componentes MoE, SSM ni mecanismos híbridos según la documentación disponible. El número exacto de capas, cabezas de atención, dimensión oculta y dimensión de feed-forward no se detalla en la model card, por lo que no es posible reconstruir la configuración interna con precisión a partir de la información proporcionada.

El entrenamiento se realizó desde cero sobre WikiText-103, un corpus de texto en inglés derivado de artículos de Wikipedia, con un tokenizador propio de 8192 entradas. No se documenta el número total de tokens vistos, la composición exacta del dataset más allá de WikiText-103, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se mencionan innovaciones técnicas como decodificación especulativa, atención lineal o variantes de atención eficiente. La información disponible describe únicamente un pipeline de pretraining experimental con PyTorch y Tokenizers.

## Capacidades

- Generación de texto causal en inglés, limitada a la ventana de contexto de 256 tokens.
- Continuación de texto y modelado de lenguaje autorregresivo.
- Capacidad muy limitada de razonamiento y coherencia más allá de fragmentos cortos, dado el tamaño de 10M de parámetros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés, según la etiqueta de idioma del modelo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Docencia y formación en pretraining: el modelo sirve como ejemplo completo y reproducible de un transformer causal entrenado desde cero, útil para explicar tokenización, atención causal y bucles de entrenamiento en cursos de IA.
- Baseline de experimentación: investigadores con recursos muy limitados pueden usarlo como referencia mínima contra la que comparar variantes de arquitectura o de tokenizador en tareas de modelado de lenguaje.
- Pruebas de pipelines de inferencia: al ser un modelo pequeño en PyTorch, permite validar scripts de generación, integración con Tokenizers y flujos de carga de pesos en CPU o GPU sin coste significativo.
- Generación de texto de relleno o sintético a muy corta escala: útil para pruebas de integración en aplicaciones donde se necesita texto en inglés generado automáticamente y la calidad no es crítica.
- Investigación sobre límites de escala: permite estudiar empíricamente qué capacidades emergen (o no) con ~10M de parámetros y 256 tokens de contexto, como punto de partida en estudios de scaling laws a pequeña escala.
- Reproducción de experimentos de WikiText-103: sirve para replicar y comparar métricas de perplejidad sobre el mismo corpus de entrenamiento en entornos docentes o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (≈40 MB para los pesos en FP32, más overhead de activaciones y tokenizador), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU CUDA compatible; el autor indica que se recomienda GPU CUDA, aunque la inferencia en CPU también está soportada.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el autor proporciona un script `generate.py` basado en PyTorch y Tokenizers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EndiumLLM-10M-256 | ~10M | 256 | en | other | PyTorch |
| GPT-2 small | 124M | 1024 | en | MIT | PyTorch, safetensors, GGUF (comunidad) |
| TinyLlama-1.1B | 1.1B | 2048 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| SmolLM-135M | 135M | 2048 | en | Apache 2.0 | safetensors, GGUF |

La comparación es orientativa: EndiumLLM-10M-256 es aproximadamente un orden de magnitud menor que GPT-2 small y dos órdenes menor que TinyLlama. No hay datos de benchmarks publicados para EndiumLLM-10M-256, por lo que no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Tamaño muy reducido (~10M de parámetros): la coherencia del texto generado será limitada y es esperable una alta tasa de errores gramaticales y factuales.
- Riesgo elevado de alucinación: al estar entrenado solo sobre WikiText-103, el modelo no tiene conocimiento factual fiable fuera de los patrones del corpus.
- Contexto muy corto (256 tokens): no apto para conversaciones multi-turno, documentos largos ni tareas que requieran memoria extendida.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Licencia "other": es imprescindible revisar los términos concretos del autor antes de cualquier uso comercial o redistribución; no se garantiza permiso explícito para uso comercial.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni alineación; el modelo no ha pasado por fases de RLHF o DPO según la información disponible.
- No apto para producción: no hay benchmarks, no hay pesos cuantizados, no hay integración documentada con servidores de inferencia y el soporte técnico es inexistente.
- Fecha de creación futura en los metadatos (2026): conviene verificar la vigencia y el estado real del repositorio antes de depender de él.

## Enlaces

- Hugging Face: https://huggingface.co/end433/EndiumLLM-10M-256
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio del proyecto EndiumLLM: no disponible
- Paper o blog técnico: no disponible
- Demo: no disponible
