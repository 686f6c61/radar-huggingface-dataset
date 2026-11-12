# JakTheTrippr/kimi-k3.1-pro-mini

## Resumen

`JakTheTrippr/kimi-k3.1-pro-mini` es un modelo de prueba diminuto, inicializado de forma aleatoria, derivado de la arquitectura de `moonshotai/Kimi-K3.1-Pro`. No es un modelo funcional ni entrenado: su propósito declarado en la model card es servir para testing y depuración de la arquitectura Kimi K3.1 en entornos controlados, replicando la estructura de capas, el contrato del indexador LSA y los expertos empaquetados en MXFP4 con un número de parámetros reducido (26,7 millones frente a los 57,36 mil millones del checkpoint fuente en BF16, según la tabla de la model card).

La relevancia de este repositorio es puramente técnica: permite validar la carga de pesos, la integración con `transformers`, y el comportamiento de las capas KDA (Kimi Delta Attention) y DSA (gated DeepSeek-style Attention) sin necesidad de descargar el checkpoint completo de 1,56 TB. El autor advierte que las capas DSA con compuerta no cuentan todavía con kernel en las versiones publicadas de Transformers, vLLM o SGLang, por lo que en la práctica se ejecuta únicamente el núcleo MLA de dichas capas.

No debe confundirse con un modelo utilizable en producción: los pesos son aleatorios, el repositorio no tiene descargas ni likes, y la model card está generada por un agente (GPT-6.1-Sol). Cualquier evaluación de capacidades, benchmarks o calidad de generación carece de sentido con este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas KDA (Kimi Delta Attention) y DSA con compuerta (gated DSA), más una capa densa; incluye torre de visión |
| Parámetros totales | 26.725.136 (dato real de safetensors) |
| Parámetros activos | No disponible (el modelo fuente es MoE con 896 expertos enrutados + 2 compartidos, top-k 16; este tiny usa 16 expertos enrutados + 2 compartidos, top-k 8) |
| Longitud de contexto | 1.048.576 tokens (heredada de la configuración fuente) |
| Tipos de cuantización | Expertos enrutados en MXFP4 empaquetado (grupo 32, escalas E8M0); resto de pesos en BF16 y F32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (model.safetensors, 35,6 MB) |

## Arquitectura y entrenamiento

El modelo replica la topología de Kimi K3.1-Pro a escala reducida: 17 capas en total (11 KDA + 5 DSA con compuerta + 1 densa), frente a las 93 capas del modelo fuente (69 KDA + 24 DSA con compuerta + 1 densa). El ancho oculto se reduce a 8 y el ancho del MLP a 32 (frente a 7.168 y 33.792 respectivamente). Las cabezas de atención completa pasan de 96 a 8, manteniendo la dimensión por cabeza de 128 (nope 128, rope 64, v 128). El rango LoRA de MLA q/kv se reduce a 128/512.

Los expertos enrutados se empaquetan en MXFP4 con grupo 32 y escalas E8M0, igual que en el modelo fuente. El indexador LSA conserva sus dimensiones originales (32 cabezas, dimensión 128, top-k 2.048) y se incluye de forma compatible hacia adelante, aunque las versiones publicadas de Transformers, vLLM y SGLang no consumen estos tensores por falta de kernel gated-DSA. La torre de visión se reduce a profundidad 2, oculta 64 y 2 cabezas (frente a 27/1.024/12), manteniendo el tamaño de parche de 14. El vocabulario se mantiene en 163.840 filas sin atado.

No hay entrenamiento: los pesos son aleatorios. El modelo reutiliza el código de modelado remoto fijado de K3 (`modeling_kimi_k3.py` y `modeling_kimi_linear.py`), ya que K3.1-Pro no publica código de modelado propio. La atención delta de KDA requiere Triton mediante `fla-core` en GPU.

## Capacidades

- No dispone de capacidades funcionales: los pesos son aleatorios y no ha sido entrenado.
- La arquitectura soporta entradas image-text-to-text según el pipeline declarado, pero la salida no es coherente.
- El código de modelado incluye rutas para parsers de razonamiento y tool calling (`--reasoning-parser kimi_k3`, `--tool-call-parser kimi_k3` en SGLang), heredadas del modelo fuente, pero no operativas con pesos aleatorios.
- Soporte multilingüe: no verificable con este artefacto.
- Modo thinking, visión o audio: la arquitectura fuente los contempla; este tiny no los implementa de forma funcional.

## Casos de uso

- Validación de carga de checkpoints: comprobar que `AutoModel.from_pretrained` con `trust_remote_code=True` carga correctamente la arquitectura Kimi K3.1 en un entorno de CI sin descargar 1,56 TB.
- Depuración de kernels KDA: verificar que la atención delta con Triton (`fla-core`) se ejecuta sin errores en GPU con formas reducidas.
- Pruebas de integración con vLLM y SGLang: validar pipelines de serving (parsers, tensor-parallel, kv-cache fp8) antes de desplegar el modelo completo.
- Test de compatibilidad de tokenizer y processor: comprobar el manejo de mensajes multimodales (imagen + texto) con el vocabulario de 163.840 entradas.
- Verificación de contratos de tensores: asegurar que los nombres y formas de los tensores del indexador LSA y de los expertos MXFP4 coinciden con lo esperado por el código fuente.
- Desarrollo de herramientas de inspección: analizar la estructura de capas (cadencia KDA/DSA, capas físicas del indexador en [3, 7, 11, 15, 16]) con un checkpoint manejable de 35,6 MB.
- Reproducción de entornos: fijar versiones de Transformers, Triton y `fla-core` para garantizar reproducibilidad en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo tiene pesos aleatorios, por lo que cualquier métrica de calidad sería inválida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (26,7 M de parámetros, ~53 MB de pesos más activaciones y caché KV).
- GPU recomendadas: cualquier GPU con soporte CUDA y Triton; el ejemplo verificado usa `device_map="cuda"` con `attn_implementation="eager"`.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), e incluso en CPU para pruebas básicas.
- Opciones de despliegue: Transformers (verificado), vLLM (no verificado; requiere build con soporte KimiK31 gated-DSA), SGLang (no verificado; requiere build posterior a 0.5.23).
- Latencia y throughput: no disponibles; irrelevantes dada la naturaleza del artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| JakTheTrippr/kimi-k3.1-pro-mini | 26,7 M | 1.048.576 | No disponible | Testing de arquitectura K3.1 |
| moonshotai/Kimi-K3.1-Pro | 57,36 B BF16 (checkpoint fuente) | 1.048.576 | No disponible | Modelo de producción |
| tiny-random/kimi-k3.1-pro | No disponible | 1.048.576 | No disponible | Testing (referencia del autor) |

No se dispone de información sobre otros modelos tiny comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera texto ni respuestas coherentes.
- No apto para producción, evaluación de calidad ni uso comercial.
- Las capas DSA con compuerta no tienen kernel en Transformers, vLLM ni SGLang publicados; solo se ejecuta el núcleo MLA, por lo que el comportamiento no refleja el del modelo fuente.
- El indexador LSA se incluye pero no se consume; los tensores están presentes de forma compatible hacia adelante.
- Licencia no especificada: no se puede asumir ningún permiso de uso, modificación o redistribución.
- Idiomas no declarados.
- Model card generada por un agente (GPT-6.1-Sol); verificar cualquier afirmación contra el código y los tensores reales.
- El repositorio tiene 0 descargas y 0 likes; no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/JakTheTrippr/kimi-k3.1-pro-mini
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Receta de vLLM para Kimi-K3.1-Pro: https://recipes.vllm.ai/moonshotai/Kimi-K3.1-Pro
- Referencia tiny del autor: tiny-random/kimi-k3.1-pro (mencionada en la model card)
- Script de creación: .meta/create_model.py (dentro del repositorio)
- Log de estructura: .meta/model.log (dentro del repositorio)
- Entorno: .meta/env.json (dentro del repositorio)
