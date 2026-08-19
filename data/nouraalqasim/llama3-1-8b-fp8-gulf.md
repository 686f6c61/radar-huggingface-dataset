# NouraAlqasim/llama3.1-8b-fp8-gulf

## Resumen

El modelo `llama3.1-8b-fp8-gulf`, desarrollado por NouraAlqasim, es una versión cuantizada en FP8 (W8A8) del modelo `meta-llama/Llama-3.1-8B-Instruct`, calibrada específicamente sobre el dialecto del Golfo del árabe. La cuantización se realiza con NVIDIA ModelOpt utilizando la configuración `FP8_DEFAULT_CFG`, y el proceso de calibración de los cuantizadores de activación se ha llevado a cabo con 128 diálogos extraídos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, semilla 1448), con una longitud máxima de 512 tokens por muestra.

El resultado es un checkpoint de aproximadamente 8.030 millones de parámetros que ocupa 9,1 GB en el repositorio, pensado para ser servido con vLLM mediante la opción `--quantization modelopt`. La relevancia de este modelo radica en que ofrece una alternativa eficiente en memoria y computación para tareas de generación de texto en árabe, especialmente en el dialecto del Golfo, manteniendo las capacidades del modelo base Llama 3.1 8B Instruct. No es cargable directamente con `transformers`; requiere un runtime compatible con la cuantización de ModelOpt.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, típicamente 128K, pero no confirmado) |
| Tipos de cuantizacion | FP8 (W8A8) estático, per-tensor para activaciones |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero la calibración se centra en árabe del Golfo) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizados FP8) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `meta-llama/Llama-3.1-8B-Instruct`, que sigue la arquitectura Transformer estándar de Llama 3.1 (atención por ventanas, RMSNorm, etc.). La cuantización FP8 se aplica tanto a pesos como a activaciones (W8A8) utilizando NVIDIA ModelOpt con la configuración `FP8_DEFAULT_CFG`. Los cuantizadores de activación son estáticos y por tensor, calibrados con 128 diálogos en dialecto del Golfo (máximo 512 tokens cada uno) procedentes del dataset `Almheiri/ArabCulture-Dialogue`. El error cuadrático medio de los pesos tras la cuantización es de 1.786e-07, y los 224 cuantizadores de activación fueron calibrados correctamente. No se ha realizado ningún entrenamiento adicional sobre el modelo base; solo se ha ajustado la escala de activación (`input_scale`) para adaptarse al dialecto objetivo.

## Capacidades

- Generación de texto en árabe, con especial énfasis en el dialecto del Golfo (calibración específica).
- Hereda las capacidades del modelo base Llama 3.1 8B Instruct: razonamiento, comprensión de instrucciones, generación de código, matemáticas, etc.
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada explícitamente en la model card).
- Capacidades multilingües del modelo base, aunque la calibración está orientada al árabe.
- No se han documentado capacidades especiales adicionales (visión, audio, etc.).

## Casos de uso

- Asistentes conversacionales en árabe del Golfo: el modelo puede gestionar diálogos multi-turno en dialecto del Golfo con mayor naturalidad gracias a la calibración específica, ideal para chatbots de atención al cliente en la región.
- Generación de contenido localizado: redacción de textos, resúmenes o respuestas adaptadas al contexto cultural y lingüístico del Golfo, por ejemplo para marketing o comunicación corporativa.
- Traducción y transcripción de dialecto: al estar calibrado con diálogos del Golfo, puede mejorar la precisión en tareas de traducción automática o normalización de texto en ese dialecto.
- Integración en pipelines de IA generativa: al ser compatible con vLLM, puede desplegarse como endpoint de inferencia para aplicaciones que requieran baja latencia y uso eficiente de memoria en GPUs.
- Prototipado rápido de aplicaciones de IA: su tamaño (8B) permite ejecutarlo en GPUs de consumo medio, facilitando pruebas y desarrollo de asistentes virtuales en entornos con recursos limitados.
- Investigación sobre cuantización y adaptación de modelos a dialectos: sirve como ejemplo de cómo la calibración de activaciones afecta al rendimiento en idiomas específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el error cuadrático medio de los pesos (1.786e-07) y el número de cuantizadores de activación calibrados (224/224), pero no hay métricas de calidad (MMLU, HumanEval, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros en FP8, el tamaño del modelo es aproximadamente 8 GB (más overhead de activaciones y KV cache). Se recomienda al menos 12 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con soporte FP8 (Ampere o posterior).
- Cabe en GPUs de consumo como la RTX 4090 o RTX 3080 Ti (12 GB), aunque con limitaciones de longitud de contexto.
- Opciones de despliegue: vLLM es el runtime principal indicado (comando `vllm serve ... --quantization modelopt`). No es compatible con `transformers` directamente, por lo que otras herramientas como llama.cpp u Ollama no son aplicables sin conversión adicional.
- Latencia y throughput: no se proporcionan datos; dependerá del hardware y la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `NouraAlqasim/llama3.1-8b-fp8-gulf` | 8.03B | FP8 (W8A8) | no disponible | no disponible | Calibrado para árabe del Golfo |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | BF16/FP16 | 128K (típico) | Llama 3.1 Community License | Modelo base sin cuantizar |
| `NousResearch/Hermes-3-Llama-3.1-8B` | 8.03B | BF16 | 128K | Apache 2.0 (derivado) | Alternativa instruct con fine-tuning |

La comparación se limita a diferencias de cuantización y calibración; no hay datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; requiere vLLM con `--quantization modelopt`, lo que limita su portabilidad a otros frameworks.
- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial y distribución.
- La calibración se ha realizado únicamente con 128 diálogos de un dataset concreto; el rendimiento en otros dialectos árabes o en árabe moderno estándar puede no verse beneficiado.
- Al ser una cuantización FP8, existe una posible pérdida de precisión respecto al modelo original, aunque el MSE reportado es bajo (1.786e-07).
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones; se recomienda validar el modelo en el dominio de uso antes de producción.
- El contexto máximo no está documentado; aunque el modelo base soporta 128K, la cuantización y el runtime podrían reducir la longitud efectiva.

## Enlaces

- [HuggingFace - NouraAlqasim/llama3.1-8b-fp8-gulf](https://huggingface.co/NouraAlqasim/llama3.1-8b-fp8-gulf)
- Dataset de calibración: `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`)
