# aday777/qwen4_exp_tiny_fixture

## Resumen

`aday777/qwen4_exp_tiny_fixture` es un fixture de arquitectura, no un modelo de lenguaje entrenado. Se trata de un checkpoint de texto con pesos aleatorios (289.344 parámetros float32) y una configuración reducida que preserva los nombres de campos reales de la arquitectura `qwen4_exp` del modelo base Qwen/Qwen3.8-Flash-Next. Su propósito es permitir probar el parsing de configuración, el mapeo de nombres de tensores, el dimensionado de tablas de expertos, la lógica de router/top-k y las rutas de carga de safetensors sin necesidad de instanciar el modelo completo, que es un MoE multimodal de gran tamaño con atención híbrida.

El fixture reproduce la envoltura multimodal de `qwen4_exp` (campos `text_config`, `vision_config`, `image_token_id`, etc.) y los nombres de campo internos de `qwen4_exp_text`, incluyendo `layer_types`, `linear_*`, `ngram_*`, `indexer_*`, `ple_*`, `hc_*`, el bloque `mtp` y `rope_parameters`. No incluye tensores de visión, atención lineal, ngram, indexador, PLE, hyper-conexiones ni MTP, y carece de `lm_head` y de vocabulario real. Es una herramienta de desarrollo y CI, no un modelo utilizable para generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (Qwen4ExpForConditionalGeneration), MoE con capas de atención lineal y completa |
| Parametros totales | 289.344 (float32) |
| Parametros activos | 2 de 8 expertos por token (config del fixture) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT (fixture); la arquitectura base tiene sus propios términos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la estructura de configuración de Qwen3.8-Flash-Next, cuya arquitectura `qwen4_exp` combina atención lineal (Gated DeltaNet) con atención dispersa (QSA, Quadratic Sparse Attention), además de MoE, vocabulario n-gram, un indexador de atención, PLE (Probabilistic Lexical Encoding), hyper-conexiones y una cabeza MTP (Multi-Token Prediction). El fixture reduce la geometría a 4 capas ocultas, `hidden_size` 64, 4 cabezas de atención (2 KV), `head_dim` 16, y una secuencia de capas `linear, linear, linear, full`. Los pesos son generados aleatoriamente con SplitMix64 (semilla 20260903) y distribución normal Box-Muller con escala 0.02, en float32. No hay entrenamiento, destilación ni ajuste de ningún tipo; es un checkpoint de prueba byte-reproducible.

## Capacidades

- No genera texto ni realiza inferencia útil: es un fixture de pruebas, no un modelo funcional.
- Permite ejercitar el parsing de `config.json` para `model_type: qwen4_exp` y la envoltura multimodal.
- Valida el mapeo de nombres de tensores safetensors contra la configuración.
- Comprueba el dimensionado de tablas de expertos y la lógica de selección top-k (2 de 8 expertos).
- Verifica la carga de pesos con la librería `safetensors` o con la stdlib de Python.
- Sirve para probar planificadores de cuantización y rutas de carga en entornos CI sin necesidad de GPU.
- Reproduce la estructura de campos `qwen4_exp_text` (layer_types, linear_*, ngram_*, indexer_*, ple_*, hc_*, mtp, rope_parameters) para desarrollo de cargadores personalizados.

## Casos de uso

- Pruebas unitarias de parsing de configuración: un desarrollador que integre `qwen4_exp` en una herramienta propia puede usar este fixture para validar que su lector de `config.json` interpreta correctamente los campos anidados `text_config` y `vision_config` sin descargar el modelo completo.
- Validación de mapeo de nombres de pesos: al construir un cargador que traduzca nombres de tensores de safetensors a un formato interno, el fixture permite comprobar que todos los tensores esperados están presentes y que los nombres coinciden con la convención del modelo base.
- Pruebas de dimensionado de tablas de expertos: la config con 8 expertos y 2 seleccionados por token permite verificar que el router y el bookkeeping de top-k funcionan correctamente en un entorno de prueba.
- Integración continua para cuantización: un pipeline de CI que planifique cuantizaciones puede ejecutarse contra este fixture para detectar regresiones en el parsing de metadatos o en la asignación de memoria, sin necesidad de hardware especializado.
- Verificación de compatibilidad de safetensors: el fixture incluye `checksums.txt` con SHA-256 de cada tensor, lo que permite comprobar la integridad de la carga y la alineación de `data_offsets` en diferentes versiones de la librería.
- Desarrollo de planificadores de memoria para MoE: al conocer el número exacto de tensores y sus formas, se puede probar la lógica de asignación de buffers para inferencia con múltiples expertos antes de usarla con el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este fixture no está entrenado y no representa capacidades de calidad o rendimiento del modelo base Qwen3.8-Flash-Next.

## Requisitos de hardware

- El checkpoint ocupa 1.157.376 bytes (aproximadamente 1,1 MB), por lo que cabe en cualquier sistema, incluso en microcontroladores o entornos sin GPU.
- No requiere GPU para cargar los tensores; la lectura con `safetensors` o stdlib funciona en CPU.
- Para probar la carga bajo `transformers` se necesita una instalación de PyTorch y `transformers` con soporte para `qwen4_exp` (posiblemente con `trust_remote_code=True`), pero el fixture en sí no exige recursos significativos.
- No hay datos de latencia o throughput porque no es un modelo de inferencia.

## Comparativa con modelos similares

No disponible. Este fixture no tiene equivalentes directos en el ecosistema: es una pieza de infraestructura de pruebas específica para la arquitectura `qwen4_exp`. El modelo base Qwen3.8-Flash-Next es el referente real, pero no es comparable en tamaño ni propósito.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos son aleatorios y no producen texto coherente.
- Carece de tensores de visión, atención lineal (conv/ssm), ngram, indexador, PLE, hyper-conexiones y MTP; un cargador multimodal completo debe suministrarlos externamente.
- No incluye `lm_head`; el cargador debe atar los pesos a `model.embed_tokens.weight` o proporcionar su propia cabeza.
- Los archivos de tokenizer son placeholders sin vocabulario real; hay que usar un tokenizer propio.
- No se ha verificado la carga bajo una versión específica de `transformers`; la compatibilidad con `Qwen4ExpForConditionalGeneration` en esta geometría reducida queda abierta hasta probarse en una instalación real.
- La licencia MIT cubre el contenido generado (pesos aleatorios, config, scripts), pero la arquitectura `qwen4_exp` pertenece al modelo base bajo sus propios términos, que no han sido re-verificados de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aday777/qwen4_exp_tiny_fixture
- Documentación de `qwen4_exp` en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/qwen4_exp.md
- Código fuente de `modeling_qwen4_exp.py`: https://github.com/huggingface/transformers/blob/main/src/transformers/models/qwen4_exp/modeling_qwen4_exp.py
- Perfil de Qwen en HuggingFace: https://huggingface.co/Qwen
- Qwen Studio: https://qwen.ai/home
- Discusión sobre Qwen3.8-Flash-Next NVFP4 en NVIDIA Forums: https://forums.developer.nvidia.com/t/qwen3-8-flash-next-nvfp4-on-2x-dgx-spark-full-multimodal-70-tok-s-peak-47-typical/381428
