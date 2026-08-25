# mrmuminov/MustaqiLLM-Qwen3-INT8

## Resumen

MustaqiLLM-Qwen3-INT8 es una conversión cuantizada a 8 bits del modelo MustaqiLLM, un modelo de lenguaje de 5,17 mil millones de parámetros desarrollado por NeuronUz con un enfoque principal en el idioma uzbeko, además de ruso e inglés. El modelo original fue convertido desde una arquitectura personalizada (`NeuronLMForCausalLM`) al diseño estándar `Qwen3ForCausalLM` para permitir su ejecución directa en motores de inferencia compatibles con Qwen3, como Hugging Face Transformers, vLLM y SGLang, sin necesidad de `trust_remote_code=True`.

La versión INT8 publicada por mrmuminov aplica una cuantización de 8 bits sobre el checkpoint convertido, lo que reduce el tamaño del repositorio a 5,5 GB y facilita su despliegue en hardware con VRAM limitada. La conversión no implica reentrenamiento ni ajuste fino; únicamente reorganiza los tensores y cambia la representación numérica, preservando el comportamiento aprendido del modelo original. Es relevante porque democratiza el acceso a un modelo multilingüe centrado en uzbeko, un idioma con pocos recursos, y lo hace compatible con infraestructuras modernas de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (original: NeuronLMQLLM) |
| Parametros totales | 5.166.735.872 (5,17B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | INT8 (compressed-tensors) |
| Idiomas soportados | Uzbeko (latino y cirílico), inglés, ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MustaqiLLM emplea una arquitectura de transformer causal con atención por grupos de consultas (GQA): 28 cabezas de consulta y 4 cabezas de clave/valor, con dimensión de cabeza de 128. La conversión a Qwen3 reorganiza las proyecciones fusionadas originales: la proyección QKV se divide en `q_proj`, `k_proj` y `v_proj`, y la proyección `gate_up_proj` se separa en `gate_proj` y `up_proj`. El modelo utiliza normalización QK, codificación posicional RoPE con theta de 500000, vocabulario de 48 000 tokens BPE y embeddings desacoplados (untied). Los pesos originales se almacenaron en BF16, con embeddings y `lm_head` en FP32.

No se han publicado datos sobre el entrenamiento del modelo original en la información disponible: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a Qwen3 y la cuantización INT8 no alteran el comportamiento aprendido del modelo, aunque pueden producir pequeñas diferencias numéricas según el backend de inferencia, el tipo de datos y la implementación de atención utilizada.

## Capacidades

- Generación de texto en conversación multironda (ChatML) en uzbeko, ruso e inglés.
- Instrucción de instrucciones y respuestas en formato de chat mediante `apply_chat_template`.
- Compatibilidad nativa con vLLM y SGLang para servir el modelo con APIs de estilo OpenAI.
- Inferencia sin necesidad de `trust_remote_code=True` gracias a la conversión a arquitectura Qwen3.
- Soporte de cuantización INT8 para reducir requisitos de memoria.
- No se ha confirmado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional en uzbeko: el modelo puede gestionar diálogos multironda en uzbeko latino y cirílico, útil para aplicaciones de atención al cliente o asistentes virtuales en Uzbekistán, gracias a su entrenamiento específico en este idioma.
- Traducción y transcripción entre uzbeko, ruso e inglés: su vocabulario multilingüe permite tareas de traducción y reformulación en contextos empresariales o educativos.
- Generación de contenido localizado: puede producir textos en uzbeko para medios digitales, marketing o documentación técnica, con contexto de hasta 4096 tokens.
- Servicio de chat en infraestructura de producción: al ser compatible con vLLM y SGLang, puede desplegarse como servidor OpenAI-compatible en entornos con GPUs NVIDIA, incluyendo tarjetas Turing como Quadro RTX 8000 usando `float16`.
- Investigación en NLP para idiomas de bajos recursos: su enfoque en uzbeko lo convierte en una herramienta para experimentos de generación, clasificación o extracción de información en ese idioma.
- Evaluación de cuantización INT8: útil para comparar el impacto de la cuantización en el rendimiento de un modelo multilingüe de tamaño medio en escenarios de despliegue con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en tareas como MMLU, HumanEval o GSM8K para este modelo específico ni para su versión original.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización INT8 y 5,17B parámetros, el modelo requiere aproximadamente 5,5 GB de memoria para los pesos, más overhead de activaciones y KV cache; se estima un consumo total de entre 6 y 8 GB en inferencia con contexto de 4096 tokens.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM. Para GPUs Turing (como Quadro RTX 8000), se recomienda usar `--dtype float16` en vLLM.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, como RTX 3070 Ti o superiores.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, y cualquier runtime compatible con Qwen3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la misma categoría (modelos multilingües centrados en uzbeko con arquitectura Qwen3). Los resultados de búsqueda web se refieren a otros modelos Qwen3 (Qwen3-235B-A22B-GPTQ-Int8 y Qwen3-1.7B-GPTQ-Int8) que no son directamente comparables por tamaño y enfoque. Por tanto, no se puede establecer una comparativa rigurosa con la información disponible.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir una degradación leve en la calidad de generación comparada con la versión BF16 original, especialmente en tareas de alta precisión numérica o razonamiento complejo.
- El contexto está limitado a 4096 tokens, lo que restringe el procesamiento de documentos largos o conversaciones extensas.
- No se han publicado datos de sesgos o alucinaciones específicos del modelo; se recomienda evaluar su comportamiento en producción para los dominios de uso.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original no tiene documentación sobre los datos de entrenamiento, lo que podría plantear incertidumbres sobre derechos de autor.
- La conversión y cuantización no han sido validadas con benchmarks públicos, por lo que se debe verificar el rendimiento en los casos de uso concretos antes de desplegar en producción.
- No se garantiza soporte para tool calling, agentes o razonamiento multi-paso, ya que no se ha documentado esa capacidad.

## Enlaces

- HuggingFace: https://huggingface.co/mrmuminov/MustaqiLLM-Qwen3-INT8
- Modelo original: https://huggingface.co/NeuronUz/MustaqiLLM
- Referencia técnica de Qwen3: https://arxiv.org/pdf/2505.09388v1 (paper técnico de Qwen3, útil para entender la arquitectura base)
