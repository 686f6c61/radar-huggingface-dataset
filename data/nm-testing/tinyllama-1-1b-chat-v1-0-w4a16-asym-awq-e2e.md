# nm-testing/TinyLlama-1.1B-Chat-v1.0-w4a16-asym-awq-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-w4a16-asym-awq-e2e` es un artefacto de cuantizacion publicado por la organizacion `nm-testing` (equipo de Neural Magic, vinculado al ecosistema de `compressed-tensors` y `llm-compressor`) sobre el modelo base TinyLlama-1.1B-Chat-v1.0. No es un modelo entrenado desde cero, sino una version comprimida del checkpoint conversacional de TinyLlama con cuantizacion de pesos en 4 bits (W4A16) y activaciones en 16 bits, aplicada con la tecnica AWQ (Activation-aware Weight Quantization) en variante asimetrica.

El interes tecnico del repositorio es fundamentalmente de validacion: el sufijo `e2e` sugiere un experimento de extremo a extremo del pipeline de cuantizacion de Neural Magic, y el tag `compressed-tensors` indica que los pesos se empaquetan en el formato de compresion de esa libreria, consumible por vLLM y por el stack de `llm-compressor`. El modelo base TinyLlama tiene 1.100.048.384 parametros y fue entrenado originalmente con 3 billones de tokens sobre arquitectura Llama.

Por su tamano y su naturaleza experimental, este checkpoint es relevante para quien necesite probar flujos de cuantizacion W4A16, comparar recetas AWQ simetricas frente a asimetricas, o validar la integracion de `compressed-tensors` con motores de inferencia. No esta pensado como modelo de produccion ni como referencia de calidad conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (modelo base TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base TinyLlama usa 2048 tokens) |
| Tipos de cuantizacion | W4A16 asimetrica con AWQ, empaquetada en `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only denso con atencion multi-cabeza estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU, en la linea de la familia Llama. El modelo base fue preentrenado con aproximadamente 3 billones de tokens y posteriormente ajustado con tecnicas de alineacion conversacional (SFT y DPO en la receta publicada por el equipo de TinyLlama).

Sobre ese checkpoint, este repositorio aplica una cuantizacion post-entrenamiento W4A16: pesos a 4 bits y activaciones a 16 bits, con calibracion AWQ para minimizar la perdida de calidad en las capas mas sensibles a la cuantizacion. La variante `asym` indica escalas de cuantizacion asimetricas (zero-point distinto de cero), lo que suele mejorar la representacion de distribuciones de pesos sesgadas. El empaquetado se realiza con `compressed-tensors`, el formato de Neural Magic que describe esquemas de cuantizacion por modulo y permite su carga directa en vLLM. No se dispone de informacion sobre el dataset de calibracion, el numero de muestras usadas ni los hiperparametros concretos del proceso.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de TinyLlama-1.1B-Chat.
- Razonamiento basico e instrucciones simples; el tamano de 1.1B limita la profundidad del razonamiento encadenado.
- Generacion de codigo a pequena escala, sin garantias de correccion en tareas complejas.
- Capacidad multilingue limitada y no documentada en esta ficha; el modelo base esta predominantemente en ingles.
- No se documenta soporte de tool calling ni function calling en este checkpoint.
- No se documenta modo de razonamiento explicito (thinking), vision ni audio.
- Inferencia eficiente en memoria gracias a los pesos de 4 bits, con descompresion a 16 bits en el kernel.

## Casos de uso

- Validacion de pipelines de cuantizacion: sirve como banco de pruebas para verificar que la receta AWQ asimetrica con `compressed-tensors` produce pesos cargables y con perplejidad aceptable frente al checkpoint en FP16.
- Pruebas de integracion con vLLM: permite comprobar la carga de un checkpoint `compressed-tensors` W4A16, el arranque del motor y el rendimiento de los kernels de descompresion en un modelo pequeno antes de escalar a modelos de 7B o 70B.
- Comparativa de recetas de cuantizacion: al existir variantes simetricas y asimetricas del mismo modelo en la misma organizacion, se puede medir el impacto de la asimetria en calidad y en tamano de checkpoint.
- Prototipado de chatbots en entornos con VRAM muy limitada: con 1.1B parametros en 4 bits, el modelo ocupa del orden de 0.6-0.7 GB de pesos, lo que permite desplegarlo en GPUs de gama baja o incluso en CPU para demos internas.
- Generacion de texto en dispositivos edge: util para experimentar con asistentes locales de bajo consumo donde la latencia importa mas que la calidad absoluta.
- Evaluacion de regresion en CI: incluir este checkpoint en suites automatizadas que verifiquen que una nueva version de la libreria de cuantizacion sigue produciendo salidas coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6-0.7 GB solo para pesos en 4 bits; con cache KV y overhead del runtime, entre 1.5 y 3 GB para contextos de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, L4, A10, A100 y H100 son validas, aunque las de gama alta estaran infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors`), y conversiones a GGUF para llama.cpp u Ollama si se desea otro runtime; TGI requeriria conversion a un formato compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en un modelo de este tamano el cuello de botella suele ser el overhead del runtime mas que el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-w4a16-asym-awq-e2e | 1.1B | no disponible | W4A16 AWQ asimetrica | no disponible | Hugging Face (repo experimental) |
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e | 1.1B | no disponible | W4A16 (variante simetrica) | no disponible | Hugging Face (repo experimental) |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2048 | FP16/BF16 sin cuantizar | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 | FP16/BF16, con variantes GPTQ/AWQ de la comunidad | Apache 2.0 | Hugging Face |

La comparativa directa mas util es contra el checkpoint sin cuantizar de TinyLlama, que permite medir la degradacion introducida por la cuantizacion, y contra la variante simetrica del mismo repositorio, que aisla el efecto de la asimetria en las escalas.

## Limitaciones y advertencias

- Repositorio de pruebas: el prefijo `nm-testing` y el sufijo `e2e` indican un artefacto interno de validacion, sin model card completa, sin licencia declarada y sin garantias de mantenimiento.
- Licencia no disponible: no se puede asumir uso comercial sin verificar la licencia del modelo base TinyLlama (Apache 2.0) y la del propio artefacto.
- Riesgo de alucinacion elevado: con 1.1B parametros, la tasa de afirmaciones incorrectas es alta, especialmente en dominios especializados y en razonamiento multi-paso.
- Contexto corto: aunque no se documenta en esta ficha, el modelo base maneja 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas: el modelo base esta centrado en ingles; el rendimiento en castellano es limitado y no esta medido.
- Degradacion por cuantizacion: W4A16 introduce perdida de calidad frente a FP16, mas acusada en tareas de codigo y matematicas.
- Sin soporte documentado de tool calling ni de agentes, lo que descarta su uso en pipelines que dependan de function calling.
- No usar como referencia de calidad en produccion: para evaluaciones serias conviene partir del checkpoint original o de un modelo mayor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-w4a16-asym-awq-e2e
- Variante simetrica del mismo experimento: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de AWQ (referencia de la tecnica): https://arxiv.org/abs/2306.00978
- Libreria `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Libreria `llm-compressor`: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
