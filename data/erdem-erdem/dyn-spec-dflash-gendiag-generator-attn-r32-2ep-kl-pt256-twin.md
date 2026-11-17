# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-twin

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* (modelo borrador) para decodificación especulativa, desarrollado por el usuario erdem-erdem dentro del proyecto dyn-spec. No es un modelo generativo autónomo, sino un componente auxiliar que se acopla a un modelo objetivo (Qwen/Qwen3-8B) para acelerar la inferencia mediante decodificación especulativa: el drafter propone varios tokens candidatos que el modelo grande verifica en paralelo, reduciendo el número de pasos de decodificación secuencial.

El artefacto concreto es una adaptación LoRA (rango 32) del drafter `z-lab/Qwen3-8B-DFlash-b16`, entrenada durante 2 épocas (2667 actualizaciones) sobre un *activation store* de 24 000 muestras mixtas. El nombre codifica la configuración: atención con rango 32, pérdida KL, *prompt tokens* 256 y una variante "twin". El entrenamiento se realizó en la etapa de *pretraining* de la rama `direct`.

Es relevante para investigadores que trabajen en optimización de inferencia: la decodificación especulativa es una de las técnicas más eficaces para reducir latencia en producción, y este repositorio documenta de forma exhaustiva la procedencia, las métricas de validación y los artefactos de evaluación offline. Sin embargo, no es un bundle listo para servir: el autor indica explícitamente que la exportación para serving de DFlash aún no está portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptación LoRA (rango 32) sobre drafter DFlash; acoplado a Qwen3-8B como modelo objetivo |
| Parametros totales | no disponible (adaptador LoRA sobre `z-lab/Qwen3-8B-DFlash-b16`; repo de 1,4 GB incluye checkpoint con estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt tokens de entrenamiento: 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificación especulativa basado en el diseño DFlash, adaptado mediante LoRA de rango 32 sobre el checkpoint `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b`). El entrenamiento se realizó en la etapa de *pretraining* de la rama `direct`, con 2667 actualizaciones, semilla 42 y una función de pérdida KL. La configuración incluye atención con rango 32 y una ventana de 256 *prompt tokens*.

Los datos de entrenamiento provienen del *activation store* `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, un conjunto de 24 000 activaciones mixtas extraídas del modelo objetivo Qwen3-8B. El repositorio incluye procedencia completa: identidad del store, registro del extractor, procedencia del lanzamiento de vLLM y registros de llenado. La validación se realizó sobre 200 filas fijas, con una fila por LoRA, midiendo `full_acc` y la longitud media de aceptación τ (eal).

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen3-8B.
- Propuesta de múltiples tokens candidatos por paso para verificación paralela por el modelo objetivo.
- Adaptación específica al dominio mixto del activation store (chat, código, matemáticas y STEM).
- No es un modelo de propósito general: no genera texto de forma autónoma ni responde a prompts de usuario.
- No soporta tool calling, function calling ni razonamiento multi-step por sí mismo.
- Capacidades multilingües: no disponibles (dependen del modelo objetivo y del store de activaciones).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter propone tokens que el modelo objetivo verifica, reduciendo la latencia por token generado en despliegues con vLLM.
- Investigación en decodificación especulativa: el repositorio incluye métricas de aceptación (τ = 7,904 en la actualización 2667) y evaluaciones offline que permiten reproducir y comparar configuraciones de drafter.
- Experimentación con adaptadores LoRA para drafters: la configuración de rango 32 y pérdida KL sirve como punto de partida para explorar otras combinaciones de hiperparámetros.
- Evaluación de dominios específicos: las métricas desglosadas por chat, código, matemáticas y STEM permiten analizar en qué dominios el drafter acepta más tokens y dónde conviene ajustar.
- Reproducción de pipelines de entrenamiento: los artefactos `train_command.txt`, `speculators.patch` y `provenance/` documentan el proceso completo para replicarlo.
- Análisis de coste computacional: la carpeta `run/offline_eval/` incluye coeficientes M4, donantes M7, similitud D13 y coste D14, útiles para estudios de eficiencia.

## Benchmarks y rendimiento

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 (inicial) | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 (final) | 0,5345 | 7,904 | 0,3521 | 0,6067 | 0,6846 | 0,4948 |

Validación sobre 200 filas fijas, una fila por LoRA. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de 1,4 GB incluye estado del optimizador, por lo que el adaptador en sí es mucho menor, pero requiere cargar Qwen3-8B (~16 GB en fp16) para funcionar.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo objetivo, se necesitaría al menos una GPU con 24 GB (RTX 4090, A10G) para Qwen3-8B en fp16, o 16 GB con cuantización.
- Cabe en consumer GPU: probablemente sí para el modelo objetivo cuantizado, pero no hay datos confirmados.
- Opciones de despliegue: el autor indica que la exportación para serving de DFlash no está portada; el entrenamiento usó vLLM (según procedencia), pero no hay bundle de serving.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-twin | no disponible (LoRA r32 sobre drafter DFlash) | no disponible | no disponible | Hugging Face (checkpoint de entrenamiento) |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | no disponible | Hugging Face (drafter base) |
| Qwen/Qwen3-8B | 8B | no disponible | no disponible | Hugging Face (modelo objetivo) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: el autor indica que la exportación para serving de DFlash no está portada; solo se distribuye el checkpoint de entrenamiento con estado del optimizador.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles: dependen del modelo objetivo y del store de activaciones.
- Sesgos y alucinaciones: no evaluados en la información proporcionada; al ser un drafter, los errores se corrigen por la verificación del modelo objetivo, pero la calidad de las propuestas afecta a la velocidad.
- Contexto limitado en entrenamiento: 256 prompt tokens, lo que puede limitar la eficacia en secuencias largas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- Fecha de creación futura (2026-11-17): posible artefacto de metadata; verificar antes de usar en producción.

## Enlaces

- [Hugging Face: erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-twin](https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-twin)
- [Activation store: erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k](https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k)
- [Drafter base: z-lab/Qwen3-8B-DFlash-b16](https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16)
- [Modelo objetivo: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
