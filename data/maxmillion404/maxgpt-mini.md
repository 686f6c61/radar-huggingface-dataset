# MaxMillion404/MaxGPT-Mini

## Resumen

MaxGPT-Mini es un modelo de lenguaje de 113M parámetros (151.015.680 según los pesos en safetensors) desarrollado desde cero por Maxwell Brohm, un estudiante de instituto, bajo el identificador MaxMillion404. Se trata del primer modelo de la serie Neo y emplea un diseño de decoder moderno: 12 bloques, anchura 768, atención con grouped-query attention (12 cabezas de query compartiendo 4 de key/value), feed-forward SwiGLU de 2.048 unidades, RMSNorm, rotary position embeddings, QK-norm y embeddings de entrada y salida atados.

El modelo fue preentrenado íntegramente desde cero en una única RTX 5070 de 12 GB, sin pesos preentrenados y sin la librería `transformers`, y posteriormente ajustado con supervised fine-tuning (SFT) y DPO para comportamiento conversacional. El checkpoint publicado corresponde a la etapa DPO. Su propósito declarado es validar todo el pipeline de entrenamiento antes del futuro MaxGPT-Ultra de 1.09B parámetros.

Es relevante ahora como ejemplo reproducible de entrenamiento completo de un LLM pequeño en hardware de consumo, con tokenizer propio y formato de chat ChatML. No obstante, el propio autor advierte que, pese a generar respuestas bien formadas con estructura de asistente, el contenido suele ser incorrecto por la limitación de escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 bloques, anchura 768, GQA 12 query / 4 KV heads, SwiGLU 2048, RMSNorm, RoPE, QK-norm, embeddings atados) |
| Parametros totales | 151.015.680 (según safetensors); el autor declara 113M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), código PyTorch propio en `model/`, `tokenizer/`, `cfg.py` |

## Arquitectura y entrenamiento

MaxGPT-Mini es un transformer decoder-only de 12 bloques con anchura 768. Incorpora grouped-query attention con 12 cabezas de query que comparten 4 cabezas de key/value, feed-forward SwiGLU de 2.048 unidades, RMSNorm, rotary position embeddings y QK-norm. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros efectivo. El tokenizer es propio, un BPE a nivel de byte de 49.152 tokens con separación de dígitos y fallback de bytes, y el formato de conversación es ChatML (`<|im_start|>user ... <|im_end|>`).

El entrenamiento se realizó desde cero en una sola RTX 5070 de 12 GB, en tres etapas: preentrenamiento, supervised fine-tuning y DPO; el checkpoint publicado es el resultante de la etapa DPO. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de los datos de preferencia usados en DPO. El autor menciona que MaxGPT-Ultra introduce mejoras ausentes aquí (gated attention, normalized value residual, depth-scaled norms y el optimizador NorMuon), seleccionadas mediante un A/B test de cuatro variantes a esta escala.

## Capacidades

- Generación de texto en inglés con formato conversacional de asistente (respuestas estructuradas, pasos numerados).
- Conversación multi-turno mediante formato ChatML.
- Ajuste por preferencias (DPO) para alinear el estilo de respuesta.
- Tokenizer propio con separación de dígitos y fallback de bytes, lo que permite representar cualquier byte de entrada.
- Ejecución en CUDA, Apple MPS o CPU mediante el script `run.py` incluido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Experimentación educativa y reproducción de pipelines: sirve para estudiar de principio a fin el preentrenamiento, SFT y DPO de un LLM pequeño en una GPU de consumo, con código propio y sin dependencia de `transformers`.
- Pruebas de infraestructura de inferencia: al ser un modelo de 151M parámetros con pesos safetensors y código PyTorch propio, es útil para validar scripts de carga, tokenización y muestreo en CUDA, MPS o CPU antes de escalar a modelos mayores.
- Generación de texto de formato controlado: puede producir respuestas con estructura de asistente (listas, pasos numerados) en tareas donde prima la forma sobre la exactitud del contenido, como demos de interfaz conversacional.
- Base para fine-tuning posterior: su licencia Apache 2.0 y su tamaño permiten reentrenarlo o ajustarlo en hardware modesto para dominios concretos y comparar curvas de aprendizaje.
- Benchmark de referencia para modelos from-scratch: útil como línea base de 113M-151M parámetros en comparaciones de diseño arquitectónico (GQA, SwiGLU, RoPE, QK-norm) frente a variantes propias.
- Docencia y talleres: ejemplo práctico de tokenizer BPE a nivel de byte, formato ChatML y alineación con DPO para cursos de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 151.015.680 parámetros; en FP32 (4 bytes) ocupa aproximadamente 604 MB, en FP16/BF16 unos 302 MB y en cuantización de 8 bits unos 151 MB (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor entrenó en una RTX 5070 de 12 GB, por lo que esa tarjeta es suficiente con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU o Apple MPS.
- Opciones de despliegue: el repositorio incluye `run.py` con PyTorch nativo (CUDA, MPS o CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es desplegable directamente en esas herramientas.
- Latencia y throughput: no disponibles. El script de ejemplo muestrea hasta 200 tokens con temperatura 0.8 y top-k 50.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaxGPT-Mini | 151.015.680 (declarado 113M) | 1.024 | Decoder-only, GQA, SwiGLU, RoPE, QK-norm | Apache 2.0 | Hugging Face, código propio |
| MaxGPT-3 | 235M | 1.024 | Decoder-only, 16 x 1024 | no disponible en la información | Serie MaxGPT del mismo autor |
| MaxGPT-3.5 | 235M | 1.024 | MaxGPT-3 + chat fine-tuning | no disponible en la información | Serie MaxGPT del mismo autor |
| MaxGPT-2 | 110M | 512 | Decoder-only, 12 x 768 | no disponible en la información | Serie MaxGPT del mismo autor |

El autor indica que, en conversaciones lado a lado, juzgó MaxGPT-Mini mejor que el MaxGPT-3 de 235M. No se dispone de comparaciones con modelos de terceros de tamaño similar (por ejemplo, GPT-2 small o variantes de 100-150M) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que las respuestas, aunque bien formadas y con estructura de asistente, suelen tener contenido incorrecto; es un modelo de 113M y no debe usarse donde se requiera exactitud factual.
- Riesgo alto de alucinación: no se documentan mecanismos de grounding ni de citación de fuentes.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés; no se documenta entrenamiento multilingüe.
- No hay datos publicados sobre sesgos del dataset de entrenamiento ni sobre su composición.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de automatización complejos.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de seguridad ni de sesgos, el uso en producción exige validación propia.
- El repositorio no incluye pesos en GGUF ni integración con `transformers`; el despliegue requiere el código propio del autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MaxMillion404/MaxGPT-Mini
- Repositorio GitHub (código, curvas de entrenamiento y write-up): https://github.com/MaxwellBrohm/MaxGPT
- Web del autor: https://maxwellbrohm.com
