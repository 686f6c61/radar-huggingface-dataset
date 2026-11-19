# dendriteholdings/Ingot-XLI-27B-MLX-2bit

## Resumen

Ingot-XLI-27B-MLX-2bit es un modelo de generación de texto derivado de Prism ML Ternary Bonsai 2 27B, un modelo ternario de 27.359.638.768 parámetros (unos 27,36 mil millones) que el autor, dendriteholdings, ha afinado para acercarlo al profesor Qwen3.8-27B. Se trata de un espejo público de la submission ganadora del minero con hotkey `5DWxNhygrWVPDVu8jT2y3fgHdRSiDENLScppfdh24iBRezjy` (uid 138) en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que más se le aproxima. El modelo es, por tanto, el resultado de un proceso competitivo de cuantización y reajuste de pesos, no de un entrenamiento desde cero.

El pack está empaquetado en formato MLX para Apple Silicon, con pesos ternarios codificados como 2 bits afines de MLX (escala fp16 y sesgo −d por cada bloque de 128 pesos), lo que da 2,25 bits por peso y un fichero `model.safetensors` de 8,60 GB. La torre de visión, la configuración, el tokenizador y los vectores de signo de Hadamard provienen del modelo base de Prism ML y no se modifican en la competición.

Su relevancia es doble: por un lado, demuestra que la cuantización extrema (ternaria, 2 bits) puede mantener una fidelidad medible frente a un profesor BF16 (KL de 0,07231 frente a 0,07408 del rey anterior); por otro, ofrece una vía práctica de ejecución de un modelo de 27B en hardware de Apple Silicon con decodificación de aproximadamente 55-60 tok/s en un Mac Studio M3 Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Prism ML Ternary Bonsai 2 27B; layout `prism_hadamard_qwen35`); no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 2-bit (códigos de 2 bits, escala fp16 y sesgo por cada 128 pesos; 2,25 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit), fichero `model.safetensors` de 8,60 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`. Según la model card, conserva los mismos códigos ternarios del modelo de Prism ML y el minero reajustó el resto de pesos para acercarlo a Qwen3.8-27B, que actúa como profesor de referencia. La conversión al formato MLX es sin pérdida: cada bloque de 128 pesos mantiene sus códigos ternarios y su escala fp16 como valores afines de 2 bits de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La innovación técnica destacable es el esquema de cuantización ternaria con escalas por bloque de 128 pesos, junto con el uso de vectores de signo de Hadamard (heredados de Prism ML) en el layout `prism_hadamard_qwen35`. El repo no incluye cabeza de borrador MTP, por lo que la decodificación especulativa requiere un drafter externo (DFlash 2).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código: los benchmarks de velocidad se miden sobre prompts de código y las respuestas de código alcanzan unos 90 tok/s con decodificación especulativa.
- Capacidades de visión: el pack incluye la torre de visión de Prism ML, aunque la información disponible no detalla su funcionamiento ni su calidad.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Decodificación especulativa mediante el drafter externo `dendriteholdings/Ingot-27B-DFlash2-MLX`.
- Servido como API compatible con OpenAI mediante MTPLX.

## Casos de uso

- Inferencia local en Apple Silicon: el pack está pensado para ejecutarse en Macs con GPU de Apple mediante MTPLX, que carga el layout `prism_hadamard_qwen35` que mlx-lm no soporta. Es adecuado para desarrolladores que quieren un modelo de 27B en local sin depender de GPUs NVIDIA.
- Servicio de API compatible con OpenAI: `mtplx serve --model dendriteholdings/Ingot-XLI-27B-MLX-2bit --generation-mode ar --port 8080` levanta un endpoint HTTP que se puede integrar en aplicaciones existentes que ya consumen la API de OpenAI.
- Generación de código asistida: con el drafter DFlash 2 se alcanzan unos 90 tok/s en respuestas de código en un M3 Ultra, lo que hace viable la autocompletación y generación de fragmentos en editores o pipelines de CI/CD.
- Evaluación de técnicas de cuantización: al ser una submission ganadora de un subnet de Bittensor con métrica KL frente al profesor, sirve como referencia para investigar cuantización ternaria y ajuste de pesos en modelos de 27B.
- Prototipado de chat multi-turno: el tag `conversational` y el formato de generación de texto permiten construir asistentes conversacionales locales para pruebas y demos.
- Investigación sobre fidelidad de cuantización: la métrica KL (0,07231 frente a 0,07408 del rey anterior) permite comparar variantes de cuantización con una medida objetiva de proximidad al profesor BF16.
- Despliegue en estaciones de trabajo con mucha memoria unificada: el modelo cabe en un Mac Studio M3 Ultra de 512 GB y deja margen para el drafter y el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta una métrica de fidelidad frente al profesor y medidas de velocidad.

| Metrica | Valor |
|---|---|
| KL(profesor ‖ modelo), evaluación ganadora | 0,07231 |
| KL(profesor ‖ modelo), rey anterior en la misma evaluación | 0,07408 |

Velocidad de decodificación en Mac Studio M3 Ultra (80 núcleos GPU, 512 GB), batch 1:

| Motor | Modo | tok/s |
|---|---|---|
| MTPLX 2.12 (mlx 0.32) servidor | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plain | 59,9 |
| Con drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 (hasta ~90 en código) |
| GGUF gemelo en fork de llama.cpp (misma máquina) | plain | 56,4 |
| GGUF gemelo en RTX PRO 6000 | plain | 137 |

## Requisitos de hardware

- VRAM/memoria: el fichero de pesos ocupa 8,60 GB; se necesita memoria unificada suficiente para pesos, drafter opcional y contexto (no se especifica el consumo total con contexto largo).
- GPU recomendadas: Apple Silicon con GPU integrada; las medidas publicadas son sobre Mac Studio M3 Ultra (80 núcleos GPU, 512 GB).
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo NVIDIA; el formato es MLX (Apple Silicon). El gemelo GGUF se ha medido en una RTX PRO 6000 (137 tok/s), no en GPUs de consumo.
- Opciones de despliegue: MTPLX (servidor compatible con OpenAI, requerido para el layout `prism_hadamard_qwen35`); mlx-lm 0.31 con los kernels ternarios de MTPLX en proceso; el gemelo GGUF en el fork de llama.cpp de Dendrite Labs.
- Latencia y throughput: 55,3 tok/s con MTPLX servidor y 59,9 tok/s en proceso sin servidor en M3 Ultra; ~73 tok/s con drafter DFlash 2 y ~90 tok/s en respuestas de código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XLI-27B-MLX-2bit | 27,36B | no disponible | Ternaria 2-bit (2,25 bpw) | no disponible | MLX, safetensors |
| Ingot-XLI-27B-Q2 (gemelo GGUF) | 27,36B (mismos pesos) | no disponible | Ternaria 2-bit | no disponible | GGUF, fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | 27,36B | no disponible | Ternaria 2-bit | no disponible | MLX |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27,36B | no disponible | Ternaria 2-bit | no disponible | GGUF |

No se dispone de datos de rendimiento de calidad para comparar con alternativas de la misma categoría; la única comparación publicada es la métrica KL frente al profesor BF16.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Idiomas soportados no disponibles: no hay garantía de calidad multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Es un fine-tune de cuantización competitiva, no un modelo entrenado desde cero; su comportamiento está acotado por el profesor Qwen3.8-27B y por el modelo base de Prism ML.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Sesgos conocidos: no documentados en la información disponible.
- El layout `prism_hadamard_qwen35` no lo carga mlx-lm de serie; requiere MTPLX o los kernels ternarios específicos, lo que limita las opciones de despliegue.
- El repo no incluye cabeza MTP; sin el drafter externo la decodificación es de un token por paso.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- Las cifras de velocidad proceden de una única máquina (Mac Studio M3 Ultra) y pueden no extrapolarse a otros equipos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XLI-27B-MLX-2bit
- Gemelo GGUF: https://huggingface.co/dendriteholdings/Ingot-XLI-27B-Q2
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite Labs: https://github.com/DendriteLabs/llama.cpp
