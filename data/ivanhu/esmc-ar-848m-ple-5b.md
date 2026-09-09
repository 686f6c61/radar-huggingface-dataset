# IvanHU/esmc-ar-848m-ple-5b

## Resumen

ESMC-AR 848M + PLE es un modelo autorregresivo de lenguaje de secuencias de proteínas desarrollado por IvanHU. Entrenado desde cero sobre 5.000 millones de tokens de predicción a partir del dataset QingWY/protein-pretraining-data, adapta bloques de arquitectura estilo ESMC a la predicción causal del siguiente token e incorpora PLE (n-gram embeddings por capa) de estilo Qwen4-Exp. No es el modelo original ESMC-300M enmascarado y no carga sus pesos preentrenados.

Con 848.448.128 parámetros y una ventana de contexto de 2048 tokens, utiliza 32 capas con hidden size 1024, 8 cabezas de consulta y 2 cabezas KV, RoPE parcial de dimensión 64 y PLE en todas las capas. El entrenamiento con Muon y AdamW se completó en el checkpoint 19.074 el 10 de septiembre de 2026, sin usar GatedResidual.

Su relevancia radica en explorar una arquitectura causal para proteínas con embeddings de n-gramas por capa, una combinación poco habitual. Sin embargo, la calidad de generación y la funcionalidad biológica no han sido evaluadas, por lo que su uso en producción exige validación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (estilo ESMC adaptado) con PLE (n-gram embeddings por capa) |
| Parametros totales | 848.448.128 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | FP32 (pesos almacenados); BF16 (autocast para inferencia) |
| Idiomas soportados | No aplica (secuencias de aminoácidos, 20 aminoácidos estándar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo utiliza 32 capas con hidden size 1024, 8 cabezas de consulta, 2 cabezas KV y head dimension 128. Implementa RoPE parcial de dimensión 64, RMSNorm QK por cabeza, atención con puerta y SwiGLU con tamaño intermedio 2560 y softcap 7. La RMSNorm tiene gamma centrado en cero y los embeddings de entrada y salida están compartidos, con un vocabulario de 64 slots.

La innovación principal es el componente PLE presente en las 32 capas: dimensión 384, órdenes de n-gramas 2/3/4, 8 cabezas por orden, tabla de primos con base 32768, ancho de convolución 4 y semilla 1234. También incluye GatedNorm con LoRA sigmoid de rango 16. El entrenamiento se realizó con Muon combinado con AdamW, con learning rates máximos de 3e-4, warmup de 100 millones de tokens y decaimiento coseno hasta 3e-5.

Los datos provienen de QingWY/protein-pretraining-data, cuyo almacenamiento usa token IDs de ProGen3. Antes del entrenamiento, estos IDs se convirtieron a token IDs de ESMC según la identidad del aminoácido. Se empleó empaquetado de secuencias con límites independientes de atención y posición por fragmento, con batch global ordinario de 262.144 tokens de predicción; el último batch se acortó para alcanzar exactamente 5.000 millones de tokens. El entrenamiento se ejecutó en 8 GPUs RTX 3090.

## Capacidades

- Generación autorregresiva de secuencias de aminoácidos: predice el siguiente token de proteína a partir de un prefijo de aminoácidos dado.
- Modelado causal de lenguaje de proteínas: adecuado para completar y continuar secuencias proteicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (trabaja con secuencias de proteínas, no con lenguaje natural).
- Capacidades de visión o audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.
- Generación con BF16 autocast: compatible con PyTorch y Transformers para inferencia en GPU.
- Nota: la generación con PLE requiere `use_cache=False`, ya que el historial de n-gramas y convoluciones no está implementado para KV caching.

## Casos de uso

- Diseño de proteínas de novo: se puede proporcionar un prefijo de aminoácidos como `MKWVTFISLLFLFSSAYS` y el modelo generará continuaciones plausibles, permitiendo explorar nuevas secuencias sin depender de estructuras existentes. Su naturaleza causal lo hace adecuado para generar secuencias coherentes.
- Ingeniería de enzimas: partiendo de una secuencia conocida, se generan variantes mediante muestreo con temperature y top_p. La posibilidad de ajustar estos parámetros permite controlar la diversidad de mutaciones exploradas.
- Exploración de espacios de secuencia: muestreando múltiples continuaciones del mismo prefijo, el modelo genera conjuntos diversos de secuencias que posteriormente se pueden evaluar en el laboratorio o mediante software de predicción de estructura.
- Modelo base para fine-tuning en bioinformática: gracias a su representación causal y al vocabulario de 20 aminoácidos, se puede adaptar mediante fine-tuning a tareas de predicción de propiedades o etiquetas de proteínas, aunque se requiere validación experimental.
- Investigación académica en arquitecturas de proteínas: permite comparar el comportamiento de un modelo causal con PLE frente a enfoques enmascarados clásicos como ESMC, facilitando estudios sobre el impacto de los embeddings de n-gramas.
- Generación de bibliotecas de proteínas para cribado experimental: se pueden generar miles de secuencias in silico para reducir el espacio de búsqueda antes de realizar experimentos de alto rendimiento, ahorrando tiempo y recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo solo incluye una verificación limitada de paridad de inferencia: error absoluto máximo de 1,15e-5 entre el checkpoint FP32 y los logits de Transformers en los prompts de verificación, y variación total de probabilidad de 0,00733 bajo autocast BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 3,4 GB; en BF16, ~1,7 GB. Con activaciones y recomputación del contexto para PLE, se estiman 6-8 GB en FP32 y 4-6 GB en BF16 para secuencias de hasta 2048 tokens.
- GPU recomendadas: para entrenamiento, 8x RTX 3090 (24 GB cada una); para inferencia, RTX 3060 12 GB o superior en BF16.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060/4060/4070/4080/4090 y en GPUs de 8 GB en BF16 con secuencias cortas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el repositorio incluye archivos Python de inferencia portátiles. No se ha validado con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible. La generación con `use_cache=False` recomputa el contexto completo en cada paso, lo que incrementa la latencia respecto a modelos con KV caching.

## Comparativa con modelos similares

| Característica | ESMC-AR 848M + PLE | ESMC-300M (original) | ProGen3 |
|---|---|---|---|
| Tipo de modelo | Causal LM (autorregresivo) | Masked LM | Autorregresivo (referencia del dataset) |
| Parámetros | 848.448.128 | ~300M (según nomenclatura) | No disponible |
| Arquitectura | Transformer + PLE | ESMC estándar | No disponible |
| Contexto | 2048 tokens | No disponible | No disponible |
| Uso de PLE | Sí, en las 32 capas | No | No disponible |
| Carga de pesos | Entrenado desde cero | Modelo distinto, no comparte pesos | No disponible |

No hay información publicada sobre benchmarks comparativos con estos modelos en los datos proporcionados.

## Limitaciones y advertencias

- La calidad de generación y la funcionalidad biológica no han sido evaluadas. El autor indica que la generación de ejemplo es una comprobación de software, no una validación biológica.
- KV caching no está implementado para PLE: la generación requiere `use_cache=False` y recomputa el contexto completo, lo que aumenta el coste computacional.
- La ventana de contexto es de 2048 tokens; prefijos y continuaciones deben mantenerse dentro de este límite.
- La generación por defecto suprime todos los slots de salida excepto los 20 aminoácidos estándar, incluyendo EOS. Es necesario usar `max_new_tokens` explícito.
- No se han publicado benchmarks (MMLU, HumanEval, GSM8K, etc.) ni métricas de calidad biológica.
- El modelo no está pensado para lenguaje natural; no soporta tool calling, agentes ni razonamiento simbólico.
- El tokenizador incluido es obligatorio: los token IDs de ProGen3 no funcionan directamente y deben convertirse con `convert_progen3_to_esmc.py` usando el mapeo incluido.
- La licencia no está especificada: debe verificarse antes de cualquier uso comercial.
- El entrenamiento empleó empaquetado de secuencias con límites de atención por fragmento; el comportamiento con secuencias individuales largas puede diferir.
- Es un checkpoint de investigación (19.074) sin validación experimental. No debe usarse para decisiones clínicas ni aplicaciones críticas sin validación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/IvanHU/esmc-ar-848m-ple-5b
- Código de entrenamiento: https://github.com/huyiwen/bio-next
- Dataset de preentrenamiento: https://huggingface.co/datasets/QingWY/protein-pretraining-data
