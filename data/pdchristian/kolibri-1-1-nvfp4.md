# pdchristian/Kolibri-1.1-NVFP4

## Resumen

Kolibri-1.1-NVFP4 es una cuantización comunitaria en formato NVFP4 (coma flotante de 4 bits) del modelo Kolibri-1.1 de Aleph Alpha, un modelo de razonamiento de tipo mixture-of-experts (MoE) orientado a los idiomas alemán e inglés. El modelo original cuenta con 75.000 millones de parámetros totales y 3.440 millones de parámetros activos por token, y esta versión cuantizada reduce el checkpoint de 78 GB (FP8) a aproximadamente 41 GB, lo que permite ejecutarlo en una única unidad NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) con espacio suficiente para la caché KV.

La cuantización la ha realizado el usuario pdchristian con NVIDIA Model Optimizer 0.48.0, aplicando un esquema W4A4 (pesos y activaciones en 4 bits) con formato E2M1, tamaño de grupo 16 y escalas de bloque en FP8 E4M3 más una escala global en FP32. Se han cuantizado todas las capas lineales (expertos enrutados, expertos compartidos, MLPs densos de las capas 0 y 1 y las proyecciones q/k/v/o de atención), mientras que se han mantenido en BF16 el `lm_head`, los embeddings, las compuertas del router, las normas y la `q_proj` de las capas con KV compartida.

Es relevante ahora porque demuestra que un modelo MoE de razonamiento de gran tamaño puede desplegarse en hardware de escritorio de gama alta (DGX Spark) con un rendimiento de decodificación de unos 60 tokens por segundo por petición, aunque sin evaluación de benchmarks publicada y con una pérdida de precisión aún no cuantificada más allá de las comprobaciones de reconstrucción de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con capas de atención con KV compartida y ventana deslizante |
| Parametros totales | 37.907.859.712 (según safetensors del checkpoint cuantizado); el modelo original declara 75B totales |
| Parametros activos | 3.440 millones (3,44B) por token |
| Longitud de contexto | 262.144 tokens nativos (el script de servicio usa este valor por defecto; las pruebas se hicieron con 32.768) |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1, grupo 16, escalas FP8 E4M3 + escala global FP32); `lm_head`, embeddings, router, normas y `q_proj` de capas KV compartidas en BF16; caché KV declarada en FP8 (`fp8_cast`, sin calibrar) |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM mediante el plugin de Aleph Alpha) |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 es un transformer de tipo mixture-of-experts con 75.000 millones de parámetros totales y 3.440 millones activos por token, diseñado por Aleph Alpha para razonamiento en alemán e inglés. Incorpora capas de atención con KV compartida (capas 9, 14, 34, 39, 44 y 49) y capas con ventana deslizante, lo que reduce el coste de memoria de la caché KV en contextos largos. El checkpoint cuantizado conserva los nombres de tensor del release original (por ejemplo, `moe.router.expert_bias` y `post_attn_norm`), por lo que carga con el mismo código de modelo.

Esta versión NVFP4 se ha generado con NVIDIA ModelOpt 0.48.0 y una versión de Transformers `main` (commit `bdc94eee`), ya que Kolibri 1.1 aún no está en una release estable de Transformers. La calibración utilizó 512 muestras de `cnn_dailymail` con longitud de secuencia 512. Los pesos FP8 originales se dequantizaron y recuantizaron a NVFP4, un proceso que no es sin pérdida. La reconstrucción de pesos frente al original (muestreada en expertos, atención y capas densas) da una similitud coseno ≥ 0,99 y un error relativo del 9-10 %, típico de NVFP4. No se ha ejecutado ninguna evaluación de benchmarks sobre el checkpoint cuantizado.

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Razonamiento con modo de esfuerzo configurable mediante `reasoning_effort` (`low`, `medium`, `high`, `none`).
- Llamadas a herramientas (tool calling) verificadas en las pruebas de humo del autor.
- Recuperación de información en contextos largos: las pruebas recuperaron una contraseña oculta en un prompt de 16.000 tokens.
- Razonamiento multi-paso implícito en el modo de razonamiento del modelo base.
- Servicio mediante API compatible con OpenAI a través de vLLM.
- Capacidades multilingües limitadas a alemán e inglés.

## Casos de uso

- Asistencia conversacional en alemán e inglés: el modelo mantiene diálogos multi-turno con hasta 262.144 tokens de contexto nativo, adecuado para atención al cliente o asistentes internos en empresas germano e angloparlantes.
- Razonamiento documental de contexto largo: con 262k tokens de ventana y capas de KV compartida que reducen el coste de memoria, puede procesar contratos, informes o expedientes completos y responder preguntas sobre ellos.
- Agentes con tool calling: las pruebas de humo confirman llamadas a herramientas correctas, lo que permite integrarlo en flujos de agentes que consulten APIs o bases de datos mediante el servidor vLLM compatible con OpenAI.
- Despliegue en hardware de borde o de escritorio: al caber en una DGX Spark (GB10) con unos 60 tokens/s por petición, es viable para prototipos, demos y entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Generación de código y tareas técnicas en inglés: el modelo base está orientado a razonamiento; puede usarse para explicar fragmentos de código, redactar documentación técnica o asistir en revisiones, siempre con validación humana.
- Investigación sobre cuantización: el repositorio incluye los scripts de reproducción (`quantize_kolibri_nvfp4.sh`, Dockerfile, `run_hf_ptq_gb10.py`) para estudiar el impacto de NVFP4 en modelos MoE de razonamiento.
- Evaluación comparativa de precisión: sirve como referencia para medir la degradación de NVFP4 frente a FP8 en tareas de razonamiento, dado que el autor no ha publicado benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de benchmarks y que la pérdida de precisión frente al modelo original es desconocida.

Las únicas métricas publicadas son:

| Metrica | Valor |
|---|---|
| Similitud coseno de reconstrucción de pesos | ≥ 0,99 |
| Error relativo de reconstrucción | ≈ 9-10 % |
| Throughput de decodificación en DGX Spark (GB10) | ≈ 60 tokens/s por petición única |
| Contexto usado en pruebas de humo | 32.768 tokens (`--max-model-len 32768`) |
| Contexto nativo por defecto del script | 262.144 tokens |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 41 GB; con caché KV en BF16 y contexto de 32k se recomienda al menos 64 GB de memoria. El autor usó `--gpu-memory-utilization 0.70` en una DGX Spark de 128 GB.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121) es el hardware validado. El plugin de Aleph Alpha soporta oficialmente SM100 (B200) y SM90 (H100); en B200 no debería necesitar el hook de DGX Spark, aunque no se ha probado.
- GPU de consumo: no se ha probado en RTX 4090 ni en otras GPU consumer; el requisito de memoria (41 GB de pesos) excede la VRAM de una RTX 4090 (24 GB) y de una RTX 5090 (32 GB), por lo que no cabe en una sola GPU consumer convencional.
- Opciones de despliegue: vLLM 0.33.0 con el plugin `aleph-alpha-inference` 2.0.0. En DGX Spark se requiere el hook `dgx-spark/vllm_patch/sitecustomize.py` en `PYTHONPATH`, que omite la comprobación de GPU del plugin, sirve las capas de ventana deslizante con FlashAttention 2 y desactiva dos funciones que requieren FlashAttention 4. No se ha probado llama.cpp, Ollama ni TGI.
- Latencia y throughput: unos 60 tokens/s por petición en DGX Spark. El prefill de prompts largos es probablemente más lento que en el hardware objetivo del plugin, porque el hook desactiva el union-tile prefill staging. El primer arranque requiere que FlashInfer compile en JIT sus kernels FP4 para SM120 (unos 20 minutos); `MAX_JOBS=4` limita los trabajos de compilación paralelos para no agotar la memoria unificada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Hardware validado |
|---|---|---|---|---|---|
| Kolibri-1.1-NVFP4 (esta ficha) | 75B / 3,44B (original); 37,9B en safetensors cuantizados | 262.144 | NVFP4 W4A4 | Apache 2.0 | DGX Spark (GB10) |
| Aleph-Alpha/Kolibri-1.1 (FP8) | 75B / 3,44B | 262.144 | FP8 128×128 en expertos, BF16 en atención | Apache 2.0 | B200 (SM100), H100 (SM90) |
| Modelos MoE de razonamiento de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo cuantizado ni del original en la información proporcionada, por lo que no es posible comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación de benchmarks: la pérdida de precisión frente al modelo original es desconocida.
- La cuantización no es sin pérdida: los pesos FP8 se dequantizaron y recuantizaron a NVFP4, con un error relativo de reconstrucción del 9-10 %.
- Es una cuantización comunitaria no oficial, no afiliada ni respaldada por Aleph Alpha.
- Solo soporta alemán e inglés; no hay capacidades multilingües más allá de esos dos idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual sobre esta versión.
- La caché KV declarada en `hf_quant_config.json` es FP8 (`fp8_cast`, sin calibrar), mientras que los comandos de servicio usan caché KV en BF16; conviene revisar la configuración antes de desplegar.
- El plugin de vLLM solo soporta oficialmente SM100 y SM90; en GB10 (SM121) requiere el hook comunitario, que desactiva funciones de prefill y puede degradar el rendimiento con prompts largos.
- No se ha probado en GPU distintas de la DGX Spark.
- El uso comercial está permitido por la licencia Apache 2.0, pero debe verificarse el cumplimiento de la licencia del modelo base y de `RESPONSIBLE_USE.md`.
- El primer arranque necesita compilación JIT de FlashInfer (unos 20 minutos) y puede agotar la memoria unificada si se aumentan los trabajos de compilación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pdchristian/Kolibri-1.1-NVFP4
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Documento de uso responsable del modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Script de prueba de humo: https://huggingface.co/pdchristian/Kolibri-1.1-NVFP4/blob/main/dgx-spark/smoke_test.py
- Hook de vLLM para DGX Spark: https://huggingface.co/pdchristian/Kolibri-1.1-NVFP4/blob/main/dgx-spark/vllm_patch/sitecustomize.py
- Script de cuantización: https://huggingface.co/pdchristian/Kolibri-1.1-NVFP4/blob/main/dgx-spark/quantize_kolibri_nvfp4.sh
