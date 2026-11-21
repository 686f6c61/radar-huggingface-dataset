# jm2787/PatrickStar-DeepSeek-V41-Flash-C8

## Resumen

PatrickStar-DeepSeek-V41-Flash-C8 es un checkpoint experimental publicado por el usuario jm2787 en Hugging Face. No es un modelo oficial de DeepSeek ni una copia comprimida de los pesos de DeepSeek V4.1 Flash: se trata de un "gemelo estructural" de 8 capas entrenado por separado con una técnica denominada mini-TwinLM, que imita la topología del modelo mayor pero con un tamaño mucho menor.

El modelo tiene 5.346.098.032 parámetros antes de cuantización, con 8 capas de decodificador, anchura oculta de 5.120 y 64 cabezas de atención. Es un MoE con 8 expertos enrutados, de los que se seleccionan 6, más 1 experto compartido. El contexto configurado es de solo 4.096 tokens y el vocabulario de 129.280 entradas, heredado del tokenizador de DeepSeek-V4.1-Flash-1017.

Su relevancia es puramente de infraestructura: sirve como banco de pruebas para el formato de almacenamiento mixto FP8/MXFP4, el plugin de vLLM incluido y la carga de metadatos Engram. El propio autor advierte que la calidad de respuesta es pobre: falla aritmética simple, repite explicaciones y no sigue de forma fiable instrucciones de salida exacta. No debe confundirse con un asistente funcional ni con una referencia numérica validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y capas Engram |
| Parametros totales | 5.346.098.032 (antes de cuantizacion) |
| Parametros activos | 6 de 8 expertos enrutados + 1 compartido (numero de parametros activos no disponible) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | MXFP4 E2M1 (expertos enrutados), FP8 E4M3 (expertos compartidos, proyecciones principales, tablas Engram), BF16 (embeddings, cabeza de salida, normas, router), FP32 (mHC, attention sinks, biases) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (6 shards, 668 tensores, 5.651.236.064 bytes, ~5,26 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, anchura oculta de 5.120 y 64 cabezas de atención. Incorpora una estructura MoE con 8 expertos enrutados (6 seleccionados por token) y 1 experto compartido. Las matrices de embedding y de la cabeza de salida son independientes. Incluye capas Engram en las posiciones 1 y 4, con tablas reducidas y ratios de compresión definidos en `config.json`. También conserva estructura residual mHC y dependencias entre capas.

El preentrenamiento consumió aproximadamente 180 millones de tokens. El estado SFT publicado corresponde al paso 4.978 de los 8.908 planificados: se consumieron 5.919.897 tokens supervisados y 8.043.755 tokens formateados. El SFT se detuvo antes de completar su pasada prevista. La cuantización posterior al entrenamiento (PTQ) usó escalado absmax determinista y redondeo al más cercano, sin datos de calibración ni entrenamiento adicional. Los cuatro buffers de hash enteros en `engram/metadata.safetensors` se copiaron bit a bit del checkpoint entrenado y no deben regenerarse.

El checkpoint requiere un plugin específico (`c8_vllm_plugin` 0.3.0) y no es un drop-in para versiones arbitrarias de vLLM o Transformers. Se probó en una NVIDIA DGX Spark (GB10 / SM121) con vLLM 0.32.0, PyTorch 2.13.0+cu130 y FlashInfer 0.7.2, con TP=1, ejecución eager, una sola petición y presupuesto de 2 GiB de caché KV. En dispositivos de la familia SM120, el modo runtime-page habilitado explícitamente incorpora las dos declaraciones de tamaño de bloque del PR #60762 de vLLM.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`).
- Carga y generación con la configuración documentada de vLLM y el plugin incluido.
- Soporte del formato de pesos mixto FP8/MXFP4 con cuantización de activaciones dinámica en inferencia.
- Carga de metadatos Engram propiedad del checkpoint mediante el plugin.
- Capacidades de razonamiento, aritmética, código, matemáticas, tool calling, agentes o visión: no disponibles o explícitamente descartadas (los tensores de visión son marcadores de compatibilidad sin funcionalidad de imagen).
- Multilingüismo: no disponible más allá del inglés declarado.

## Casos de uso

- Validación de infraestructura de cuantización: sirve para comprobar que el pipeline de serialización FP8/MXFP4, los escalados E8M0 y los shards safetensors se cargan correctamente en vLLM 0.32.0 con el plugin c8_vllm_plugin 0.3.0.
- Pruebas de integración del plugin de vLLM: permite verificar la carga de metadatos Engram, el modo runtime-page en SM120 y la compatibilidad con FlashInfer 0.7.2 en entornos aislados.
- Reproducción de experimentos mini-TwinLM: el checkpoint step-4978 permite estudiar el comportamiento de un gemelo estructural de 8 capas frente al modelo completo de referencia.
- Benchmarking de latencia y memoria en hardware consumer o de borde: con ~5,26 GiB de pesos y 2 GiB de caché KV, es adecuado para medir throughput en una DGX Spark o GPU con memoria suficiente.
- Smoke testing de pipelines de despliegue: el script `usage/smoke.py` reutiliza los IDs de token exactos de tres prompts cortos validados en `validation/samples.json`, sin necesidad de instalar mini-TwinLM.
- Auditoría de errores de cuantización: `quantization-report.json` ofrece errores por tensor y procedencia, útil para estudiar el impacto del PTQ determinista sin calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado ninguna comparación BF16 frente a cuantizado y que el checkpoint falla aritmética simple y no sigue instrucciones de salida exacta de forma fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,26 GiB de pesos más 2 GiB de caché KV configurados en la prueba, más overhead de activaciones y kernels; en total, un entorno de al menos 8-10 GiB es razonable, aunque no se documenta una cifra oficial.
- GPU probada: una NVIDIA DGX Spark (GB10 / SM121), con TP=1.
- GPU recomendadas: no disponibles más allá de la DGX Spark documentada; el plugin menciona compatibilidad con dispositivos de la familia SM120.
- Cabe en GPU consumer: no confirmado; el tamaño de pesos (~5,26 GiB) sugiere que podría caber en GPUs con 8-12 GiB, pero no hay validación publicada.
- Opciones de despliegue: vLLM 0.32.0 con PyTorch 2.13.0+cu130, FlashInfer 0.7.2 y el plugin c8_vllm_plugin 0.3.0. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la prueba se realizó con una sola petición y ejecución eager.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PatrickStar-DeepSeek-V41-Flash-C8 | 5.346.098.032 | 4.096 | no disponible | Hugging Face (jm2787) | Gemelo estructural experimental, calidad pobre declarada por el autor |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) | Modelo de referencia del que se toma el tokenizador y el formato de serialización |
| Alternativas de ~5B parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Calidad de respuesta pobre declarada por el autor: falla aritmética simple, repite explicaciones y no sigue instrucciones de salida exacta de forma fiable.
- No es un modelo oficial de DeepSeek ni una copia comprimida de los pesos de DeepSeek V4.1 Flash; el entrenamiento fue separado y el SFT se detuvo antes de completar la pasada prevista.
- Contexto muy limitado: solo 4.096 tokens, insuficiente para muchas tareas de producción con documentos largos.
- Solo texto: los tensores de visión son marcadores de compatibilidad sin capacidad real de imagen.
- Idioma: únicamente inglés declarado; no hay soporte multilingüe verificado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Dependencia estricta de un stack concreto: vLLM 0.32.0, PyTorch 2.13.0+cu130, FlashInfer 0.7.2 y el plugin c8_vllm_plugin 0.3.0; no es un drop-in para otras versiones.
- Riesgo de alucinación elevado y sin evaluación BF16 frente a cuantizado; no debe usarse como referencia numérica validada.
- Los buffers de hash Engram no deben regenerarse con semillas nuevas; hacerlo rompe la carga de metadatos.
- No se debe habilitar el modo diagnóstico `C8_ENABLE_SM120_SWA64` junto con el modo runtime-page funcional.
- La descarga debe hacerse con `local_dir` materializado; el cargador de metadatos rechaza rutas que escapan del directorio del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/jm2787/PatrickStar-DeepSeek-V41-Flash-C8
- Tokenizador de referencia: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Tensor headers de referencia: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/314113f8a7dadb388215396ba5fbee2c610a04d6
- PR de vLLM #60762: https://github.com/vllm-project/vllm/pull/60762
