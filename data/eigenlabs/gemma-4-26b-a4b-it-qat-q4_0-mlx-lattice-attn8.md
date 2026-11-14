# EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice-attn8

## Resumen

Gemma 4 26B A4B it es un modelo multimodal de Google (familia Gemma 4) con arquitectura Mixture-of-Experts, cuantizado mediante Quantization-Aware Training (QAT) a un retículo int4 simétrico. Esta ficha concreta es una build de terceros publicada por EigenLabs bajo el nombre `gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice-attn8`, pensada para ejecución en Apple Silicon mediante la librería MLX. El repositorio ocupa 18,0 GB y contiene 25.805.936.206 parámetros totales.

El modelo resuelve el problema de desplegar un MoE de ~26B parámetros multimodales en hardware de consumo con memoria unificada, preservando la precisión del checkpoint QAT original de Google en los tensores críticos. La build aplica una receta híbrida: los expertos MoE (22,8B parámetros) se mantienen en el retículo int4 recuperado del checkpoint original, mientras que atención, embeddings y router suben a 8 bits, y normas, escalares y torre de visión quedan en bf16.

Es relevante porque demuestra una estrategia de cuantización selectiva —no uniforme— que reduce el error relativo de reconstrucción en los expertos a un 0,21 % de relRMSE, frente al 0,64–0,81 % en los tensores de atención. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de visión; pesos en MLX |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | 4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QAT q4_0 (int4 simétrico, códigos −8…7, paso por cada 32 entradas); build híbrida 4-bit g32 / 8-bit g64 / bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE de tipo `switch_glu` (gate/up/down) que concentran 22,8B de los 25,8B parámetros totales. Google entrenó el checkpoint con Quantization-Aware Training, de modo que cada capa lineal del modelo de lenguaje ya está ajustada a un retículo int4 simétrico con un paso de cuantización por cada 32 entradas. Esta build de EigenLabs recupera ese paso del checkpoint original y lo reaplica de forma determinista y sin calibración (`greq_convert.py build --recipe C --reuse-template`, MLX 0.32.4).

La receta de precisión es mixta: expertos MoE en 4-bit g32 con el paso del retículo recuperado (relRMSE de pesos del 0,21 %), atención q/k/v/o, `embed_tokens` (cabeza atada) y `embed_vision` en 8-bit g64 (relRMSE 0,64–0,81 %), MLP denso y router en 8-bit g64 idénticos byte a byte a la build anterior, y normas, escalares y torre de visión en bf16 sin cambios. El tokenizador, la plantilla de chat, el procesador y los ficheros de generación son idénticos byte a byte a la build previa. El borrador especulativo (MTP) usa el asistente QAT `mlx-community/gemma-4-26B-A4B-it-qat-assistant-4bit@bb94eae1`.

## Capacidades

- Generación de texto conversacional e instrucciones (sufijo `-it` del modelo base).
- Entrada multimodal image-text-to-text: incluye torre de visión (`embed_vision`) en 8 bits y visión en bf16.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas en esta build.
- Generación de código: capacidades del modelo base, no verificadas en esta build.
- Decodificación especulativa MTP mediante asistente QAT de 4 bits.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: la build está pensada para MLX en Apple Silicon; con 18,0 GB de pesos, un Mac con 32 GB o más de memoria unificada puede cargar el modelo íntegro y ejecutar generación sin GPU dedicada.
- Asistentes conversacionales multimodales en local: al ser image-text-to-text, permite flujos de pregunta-respuesta sobre imágenes sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado de aplicaciones MLX: sirve como referencia de cuantización selectiva (4-bit en expertos, 8-bit en atención) para desarrolladores que quieran replicar la receta con `greq_convert.py`.
- Evaluación de calidad post-cuantización: los valores de relRMSE documentados (0,21 % en expertos, 0,64–0,81 % en atención) permiten comparar esta build con otras cuantizaciones del mismo checkpoint base.
- Generación asistida con decodificación especulativa: el uso del asistente QAT de 4 bits permite acelerar la generación en MLX en escenarios de baja latencia.
- Investigación sobre MoE eficiente: con 4B parámetros activos sobre 25,8B totales, es adecuado para estudiar el equilibrio entre coste de memoria y cómputo por token en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de reconstrucción de pesos (relRMSE): 0,21 % en expertos MoE y 0,64–0,81 % en tensores de atención y embeddings.

## Requisitos de hardware

- VRAM/memoria estimada: 18,0 GB de pesos en disco; se recomienda al menos 24–32 GB de memoria unificada para cargar el modelo con margen para el contexto y el asistente MTP.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (la build es específica de MLX); no está pensada para CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en chips con 32 GB o más de memoria unificada; no aplica a GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: MLX 0.32.4 o superior; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice-attn8 | 25,8B totales / 4B activos | no disponible | QAT q4_0 híbrida 4/8-bit + bf16 | Apache 2.0 | safetensors MLX |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8B totales / 4B activos | no disponible | QAT q4_0 (referencia) | Apache 2.0 | safetensors |
| Otras builds MLX del mismo checkpoint base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Build de terceros: no es una publicación oficial de Google; la conversión la realiza EigenLabs con un script propio (`greq_convert.py`), lo que introduce un paso adicional de validación respecto al checkpoint original.
- Específica de Apple Silicon: el formato MLX no es portable a CUDA ni a otros runtimes sin reconversión.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin verificación empírica.
- Longitud de contexto no documentada en esta ficha.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de esta build concreta.
- Sesgos: no disponibles en la información proporcionada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar los términos del checkpoint base de Google antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Hugging Face: https://huggingface.co/EigenLabs/gemma-4-26B-A4B-it-qat-q4_0-MLX-lattice-attn8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Asistente MTP: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-assistant-4bit
- Librería MLX: https://github.com/ml-explore/mlx
