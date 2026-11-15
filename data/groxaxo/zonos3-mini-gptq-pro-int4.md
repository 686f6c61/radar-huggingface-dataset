# groxaxo/ZONOS3-Mini-GPTQ-Pro-INT4

## Resumen

ZONOS3-Mini-GPTQ-Pro-INT4 es una superposición (overlay) de pesos cuantizados en INT4 para el modelo de síntesis de voz ZONOS3-Mini, desarrollado por Zyphra. La publica el usuario groxaxo bajo licencia Apache 2.0 y está pensada para GPUs NVIDIA Ampere con CUDA. No es un modelo autónomo: requiere el checkpoint original en BF16, el códec ZAC y un cargador de referencia propio (GPTQ-Pro) para funcionar.

El objetivo es reducir el consumo de VRAM de un modelo TTS con arquitectura MoE sin reentrenar. La cuantización es selectiva: se aplica INT4 simétrico GPTQ-Pro (group size 64) a 1.005 de las 1.317 proyecciones elegibles, mientras que los expertos MoE con cobertura de activación insuficiente, la atención y las capas recurrentes GDN se mantienen en BF16. El resultado ocupa unos 309 MiB en INT4 y deja el modelo base fuera del repo.

Es relevante para quienes quieran ejecutar TTS multilingüe (inglés y español) en GPUs de consumo con poca VRAM, aceptando una pérdida de fidelidad medible y un ritmo de síntesis algo más lento. El autor lo marca explícitamente como experimental y sin estudio MOS humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (base ZONOS3-Mini), con capas recurrentes GDN; overlay de cuantización GPTQ-Pro |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simétrico GPTQ-Pro g64 (1.005 proyecciones) + BF16 preservado (312 proyecciones) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors empaquetados (shards) como overlay; requiere `model.pth` + `params.json` del checkpoint base |

## Arquitectura y entrenamiento

El modelo base ZONOS3-Mini es un transformer con mezcla de expertos (MoE) e incluye capas recurrentes GDN (gated delta network) en la salida. El overlay no reentrena: cuantiza post-entrenamiento mediante GPTQ-Pro con orden de activación descendente desactivado (`desc_act=False`). De las 11 capas procesadas, se cuantizan 1.005 proyecciones a INT4 y se preservan 312 en BF16, que incluyen atención, salida GDN/recurrente y capas densas/latentes pequeñas. Los expertos MoE con cobertura de activación insuficiente se dejan en BF16 exacto para evitar pesos INT4 poco fiables.

La calibración se realizó el 15 de noviembre de 2026 con 192 peticiones generadas en inglés y español, más dos suites de validación independientes de 24 peticiones cada una, 10 síntesis emparejadas por precisión y una comprobación proxy multilingüe con ASR. El códec de audio ZAC se conserva sin cambios y se carga desde Zyphra. El cargador verifica los SHA-256 del checkpoint fuente (`model.pth`, `params.json`) y de cada shard empaquetado.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y español a partir de texto y un embedding de hablante compatible con ZONOS3.
- Generación de audio con el códec ZAC original de Zyphra, preservado sin cuantizar.
- Soporte de presets de voz públicos del modelo base.
- Reproducibilidad por semilla: las muestras publicadas usan el mismo texto y semilla en BF16 e INT4.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo TTS, no un LLM conversacional.
- No soporta visión ni audio de entrada; solo genera audio.

## Casos de uso

- Síntesis de voz en GPUs de consumo: con 1.479 GiB de VRAM pico en inferencia TTS completa (frente a 2.272 GiB en BF16), cabe en tarjetas Ampere de 8 GB o menos, lo que permite prototipar TTS local sin GPU de datacenter.
- Generación de audiolibros o locuciones en inglés y español: el modelo acepta texto largo y produce audio con un embedding de hablante fijo, útil para narración por lotes.
- Doblaje y localización de contenido: al soportar ambos idiomas con el mismo checkpoint, se puede generar la versión inglesa y española de un guion manteniendo el timbre de voz.
- Pruebas de integración en pipelines de audio: el runtime de referencia permite validar la cadena texto → embedding → ZAC → WAV antes de invertir en el modelo BF16 completo.
- Investigación sobre cuantización de modelos MoE: el overlay sirve como caso de estudio de cuantización selectiva con métricas de KL y acuerdo de argmax publicadas.
- Despliegue en entornos con VRAM limitada y sin servidor dedicado: al reducir el modelo de lenguaje a 0.858 GiB, se puede co-alojar con otros servicios en la misma GPU.
- Evaluación comparativa de fidelidad: los pares de audio BF16/INT4 publicados permiten medir el impacto subjetivo de la cuantización antes de adoptarla.

## Benchmarks y rendimiento

Resultados medidos por el autor en RTX 3090 con el runtime de referencia en PyTorch:

| Métrica | BF16 original | GPTQ-Pro INT4 |
|---|---:|---:|
| VRAM asignada al modelo de lenguaje | 1.651 GiB | 0.858 GiB (−48,0 %) |
| VRAM pico TTS completa (con decodificador ZAC) | 2.272 GiB | 1.479 GiB (−34,9 %) |
| Síntesis en caliente, voz de 5,6 s (n=9) | 0.856 s | 0.998 s (+16,5 % más lento) |

Comprobaciones de logits profesor vs INT4 en conjuntos retenidos:

| Corpus | NMSE | KL (nats/predicción) | Acuerdo de argmax |
|---|---:|---:|---:|
| 24 peticiones estándar | 0.004083 | 0.018779 | 91,04 % |
| 24 peticiones independientes más largas | 0.003794 | 0.024353 | 87,57 % |

Ambos conjuntos superan las puertas numéricas configuradas (NMSE ≤ 0,10, KL ≤ 0,10). El proxy ASR con Whisper mostró transcripciones ligeramente peores en INT4 que en BF16, especialmente en español. No se ha realizado estudio MOS humano.

## Requisitos de hardware

- VRAM estimada: 1.479 GiB pico para la inferencia TTS completa con el decodificador ZAC; 0.858 GiB solo para el modelo de lenguaje.
- GPU recomendadas: NVIDIA Ampere o superior con CUDA (el autor cita RTX 3090 como plataforma de prueba).
- Cabe en GPUs de consumo: sí, en tarjetas Ampere con al menos 2 GB libres para la inferencia TTS completa.
- Despliegue: solo mediante el runtime de referencia GPTQ-Pro (PyTorch) incluido en el repo `groxaxo/GPTQ-Pro`. No hay soporte para vLLM, llama.cpp, Ollama, TGI, SGLang, MLX ni GGUF.
- Latencia: 0.998 s de media en caliente para una locución de 5,6 s en RTX 3090; el autor advierte que la implementación es eficiente en memoria, no más rápida.
- Requiere descargar por separado el checkpoint BF16 original de Zyphra/ZONOS3-Mini y el códec ZAC.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM TTS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini (BF16) | no disponible | no disponible | 2.272 GiB pico | Apache 2.0 | Hugging Face (Zyphra) |
| ZONOS3-Mini-GPTQ-Pro-INT4 | no disponible | no disponible | 1.479 GiB pico | Apache 2.0 | Hugging Face (groxaxo), requiere base |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos TTS con los que comparar parámetros, contexto o benchmarks de forma rigurosa.

## Limitaciones y advertencias

- Modelo experimental: el autor no ha realizado estudio MOS ni certificación de fidelidad de audio en producción.
- No es autónomo: sin el checkpoint BF16 de Zyphra, el códec ZAC y el cargador GPTQ-Pro no se puede ejecutar.
- No compatible con Transformers, GPTQModel estándar, SGLang, MLX ni GGUF; el ecosistema de despliegue es muy reducido.
- Pérdida de calidad medible: acuerdo de argmax del 87,57 % en peticiones largas y transcripción ASR ligeramente peor, sobre todo en español.
- Más lento que BF16: +16,5 % en síntesis en caliente.
- Solo inglés y español; no hay soporte de otros idiomas declarado.
- Riesgo de artefactos o degradación en voces no cubiertas por los presets públicos usados en la validación.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la calidad del audio cuantizado recae en quien lo despliega.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/ZONOS3-Mini-GPTQ-Pro-INT4
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Runtime GPTQ-Pro (ejemplos ZONOS3-Mini): https://github.com/groxaxo/GPTQ-Pro/tree/main/examples/zonos3_mini
- Detalles de validación: docs/VALIDATION.md (dentro del repo del modelo)
- Runtime de referencia: runtime/README.md (dentro del repo del modelo)
- Muestras de audio: samples/ (dentro del repo del modelo)
