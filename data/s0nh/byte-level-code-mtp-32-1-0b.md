# s0nh/byte-level-code-mtp-32-1.0B

## Resumen

El modelo `s0nh/byte-level-code-mtp-32-1.0B` es un modelo de lenguaje a nivel de bytes especializado en código Python, desarrollado por el investigador s0nh. Se construye transfiriendo el modelo `meta-llama/Llama-3.2-3B-Instruct` a un tokenizador de bytes de 265 identificadores, mientras se entrena desde el primer paso para predecir los próximos 1 a 32 bytes simultáneamente (multi-token prediction, MTP). El resultado es un modelo con 5.941 millones de parámetros y una ventana de contexto de 4096 tokens de byte, que ha consumido 1.000 millones de bytes de código Python. Su relevancia radica en la decodificación especulativa: al predecir múltiples bytes futuros, puede acelerar la generación de código sin necesidad de un modelo auxiliar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) a nivel de bytes con 32 cabezas de predicción multi-token (MTP), tronco compartido de 27 bloques y 32 cabezas independientes |
| Parametros totales | 5.941.128.192 (5,94 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de byte (nativo, sin escalado de RoPE) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Código Python (dataset de entrenamiento: `starcoderdata-python-edu`, Python only) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de un embedding de bytes de dimensión 265×3072 seguido de 27 bloques Transformer de Llama compartidos (tronco). Tras el tronco, 32 cabezas Transformer independientes (cada una iniciada como copia del bloque 27 del modelo base) proyectan a un embedding de salida compartido y no atado, que predice los bytes `t+1` a `t+32`. Los parámetros se reparten en 2.718 mil millones para el tronco y 3.221 mil millones para las cabezas. La inicialización utiliza los pesos del modelo `meta-llama/Llama-3.2-3B-Instruct` para los bloques 0..27 y la norma final, mientras que el embedding de entrada se construye mediante tokenkit FVT sobre el vocabulario byteificado de Llama. No se emplean pesos de ningún checkpoint de NTP byte-level previo, ni LoRA, ni técnicas de gradiente (QP, MGDA, etc.).

El entrenamiento se realizó durante 1.000 millones de bytes de código Python (optimizer step 3798) con tres objetivos de pérdida combinados desde el paso 0: `L_sft` (entropía cruzada del siguiente byte), `L_alm` (destilación cross-tokenizer desde un profesor subword congelado mediante Approximate Likelihood Matching) y `L_mtp` (media de las pérdidas de las cabezas 2..32). La agregación de gradientes se hizo con `approx_gradmag_preserve_mag` sobre la salida del tronco. El hardware de entrenamiento fueron 4 GPUs NVIDIA B200 (183 GB) con DDP, gradiente acumulado y FlashAttention-2. El dataset fue `jon-tow/starcoderdata-python-edu` (revisión `67bd30e21b92296da7d2ee05c8f9d8ee16ba0129`), filtrado por `int_score >= 3`, con una división determinista a nivel de repositorio.

## Capacidades

- Generación de código Python a nivel de bytes, con un tokenizador que mapea cada byte individual y los tokens de plantilla de Llama (ids 256..264).
- Predicción multi-token (MTP) de 1 a 32 bytes futuros desde el tronco compartido, sin atar parámetros entre cabezas.
- Decodificación especulativa integrada: las cabezas H2..H32 pueden proponer extensiones de hasta 32 bytes que se verifican con la salida argmax de H1.
- Destilación cross-tokenizer mediante Approximate Likelihood Matching, que alinea la representación de bytes con la del profesor subword `Llama-3.2-3B-Instruct`.
- Soporte de conversación y formato de instrucciones de Llama-3.2, ya que el tokenizador conserva los tokens especiales (`assistant`, `system`, `user`, etc.).
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- **Autocompletado de código en editores**: el modelo puede predecir los siguientes bytes de un archivo Python, lo que permite sugerencias de código en tiempo real. Su predicción de hasta 32 bytes futuros reduce la latencia percibida en comparación con modelos de un solo token.
- **Decodificación especulativa en pipelines de inferencia**: las cabezas MTP pueden usarse para generar borradores de hasta 32 bytes que se verifican con la cabeza principal, acelerando el throughput en servidores de generación de código sin necesidad de un modelo de borrador separado.
- **Generación de código en entornos de desarrollo integrados (IDE)**: el modelo puede completar funciones, clases y bloques de código Python en archivos de tamaño moderado, aprovechando su contexto de 4096 bytes.
- **Asistente de programación en línea de comandos**: integrable en herramientas tipo CLI para generar fragmentos de Python a partir de descripciones en lenguaje natural, gracias a su base instruct y a la alineación con el modelo subword.
- **Análisis y reparación de código**: puede utilizarse para generar parches o correcciones en repositorios Python, siempre que los fragmentos quepan dentro de la ventana de 4096 bytes.
- **Investigación en modelos byte-level**: sirve como referencia para estudiar el efecto de la supervisión MTP durante la transferencia de tokenizador, comparando con baselines NTP byte-level como `benjamin/Llama3-2-3B-IT-Byte`.

## Benchmarks y rendimiento

La evaluación publicada se realizó sobre repositorios de validación mantenidos fuera del entrenamiento, con ventanas de 4096 bytes. Los resultados por cabeza son los siguientes:

| Cabeza | CE (nats) | Accuracy |
|---|---|---|
| H1 | 0.3721 | 0.8912 |
| H2 | 0.6483 | 0.8215 |
| H4 | 1.1126 | 0.7071 |
| H8 | 1.7079 | 0.5566 |
| H16 | 2.2830 | 0.4188 |
| H24 | 2.5913 | 0.3496 |
| H32 | 2.7973 | 0.3061 |

Métricas adicionales: H1 bits-per-byte = 0.5334 (solo contenido, por byte UTF-8); H1 CE sobre tokens de contenido = 1.4865 nats; H1 CE sobre todos los objetivos válidos incluyendo EOS = 0.3721 nats; MTP CE media (H2..H32) = 2.1519.

La aceptación especulativa corregida (borradores de H2..H32 verificados con el propio argmax de H1) arroja:

| Métrica | Valor |
|---|---|
| Tokens extra aceptados por ronda (media) | 9.3242 |
| Bytes extra aceptados por ronda (media) | 9.3867 |
| Bytes confirmados por ronda (media) | 10.3867 |
| P(A ≥ 1) | 0.9102 |
| P(A ≥ 4) | 0.6641 |
| P(A ≥ 8) | 0.4297 |
| P(A ≥ 16) | 0.2070 |
| P(A ≥ 24) | 0.1094 |
| P(A ≥ 31) | 0.0742 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 11,9 GB para los pesos, más overhead de activaciones y caché KV, lo que sugiere un mínimo de 16 GB de VRAM.
- Con cuantizaciones no oficiales (no publicadas por el autor) se podría reducir a ~6 GB (8 bits) o ~3 GB (4 bits), pero no hay archivos de cuantización disponibles en el repositorio.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia local. Para despliegue en producción, se recomiendan A100 o H100 con al menos 40 GB para manejar lotes grandes.
- Opciones de despliegue: uso directo con `transformers` mediante `trust_remote_code=True`, tal como se muestra en la documentación del autor. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `s0nh/byte-level-code-mtp-32-1.0B` | Byte-level MTP (32 cabezas) sobre Llama-3.2-3B | 5.941 M | 4096 bytes | llama3.2 | HuggingFace |
| `benjamin/Llama3-2-3B-IT-Byte` | Byte-level NTP sobre Llama-3.2-3B | No disponible | No disponible | No disponible | HuggingFace (mencionado como baseline) |
| `meta-llama/Llama-3.2-3B-Instruct` | Transformer subword estándar | 3.210 M | 128.000 tokens | llama3.2 | HuggingFace |

El modelo destaca frente al baseline byte-level por incorporar supervisión MTP desde el primer paso de entrenamiento, lo que le permite realizar decodificación especulativa sin un modelo auxiliar. Frente al modelo base subword, opera a nivel de bytes y tiene un contexto mucho menor (4096 bytes frente a 128.000 tokens), lo que limita el alcance de los archivos que puede procesar.

## Limitaciones y advertencias

- Contexto limitado a 4096 bytes, lo que equivale aproximadamente a 1000-2000 tokens subword; no puede generar ni comprender archivos Python extensos o contextos largos.
- Especialización exclusiva en código Python; el rendimiento en otros lenguajes no ha sido evaluado y probablemente sea inferior.
- Modelo experimental con muy poca adopción (11 descargas, 0 likes en HuggingFace); no ha sido validado de forma independiente.
- Licencia llama3.2: incluye restricciones de uso comercial y requiere aceptar los términos de la licencia de Llama 3.2 antes de cualquier despliegue.
- Riesgo de alucinación en código: puede generar código sintácticamente válido pero incorrecto o con errores lógicos, especialmente en tareas de razonamiento complejo.
- Sesgos no evaluados: al entrenarse en un corpus de GitHub filtrado por puntuación de calidad, puede reflejar sesgos en estilos de programación, convenciones y prácticas de los repositorios más populares.
- No se proporcionan cuantizaciones oficiales ni documentación sobre estabilidad numérica en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s0nh/byte-level-code-mtp-32-1.0B
- Dataset de entrenamiento: https://huggingface.co/datasets/jon-tow/starcoderdata-python-edu
- Artefactos de reproducibilidad: https://huggingface.co/datasets/s0nh/byte-level-code-mtp-data
- Referencia de arquitectura byte-level (BLT): https://github.com/facebookresearch/blt
- Paper o blog del modelo: no disponible
