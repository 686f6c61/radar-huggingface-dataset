# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kl

## Resumen

`abl24k-static-lora-attn-r32-2ep-kl` es un checkpoint de entrenamiento de un drafter de decodificación especulativa, publicado por el usuario `erdem-erdem` dentro de la familia de experimentos `dyn-spec` y del port del generador DFlash. No es un modelo generativo autónomo: es un adaptador LoRA (rango 32, aplicado sobre las capas de atención) que se acopla a un drafter preentrenado `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo Qwen/Qwen3-8B mediante propuestas de tokens verificadas por el modelo grande.

El artefacto corresponde a la rama `fresh_lora` en etapa de `pretraining`, con 2667 actualizaciones, semilla 42 y un store de activaciones de 24k ejemplos mixtos. El repositorio contiene el estado completo del entrenamiento (incluido el estado del optimizador), resultados, evaluaciones offline y procedencia, pero no un bundle listo para servir: el autor indica explícitamente que la exportación de serving de DFlash aún no está portada.

Su relevancia es la de un registro reproducible de investigación sobre decodificación especulativa dinámica: permite auditar la receta, el impacto de la adaptación LoRA sobre la tasa de aceptación del drafter y la infraestructura de evaluación, más que ofrecer un modelo desplegable de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 sobre capas de atención de un drafter DFlash (base `z-lab/Qwen3-8B-DFlash-b16@9b41424b...`); modelo objetivo Qwen/Qwen3-8B |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; el adaptador LoRA r32 no publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El objeto entrenado es un adaptador LoRA de rango 32 restringido a las capas de atención (`static-lora-attn-r32`), que modifica el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`. DFlash es un esquema de decodificación especulativa en el que un modelo pequeño propone varios tokens que el modelo objetivo (Qwen3-8B) verifica en paralelo. El adaptador se entrena para maximizar la aceptación de esas propuestas bajo una pérdida con término KL (`-kl` en el nombre), en la rama `fresh_lora` y la etapa `pretraining`.

El entrenamiento usa un store de activaciones de 24k ejemplos mixtos (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), con 2667 actualizaciones, semilla 42 y trazabilidad completa: SHA de git `8d5bbd09...`, SHA256 del checkpoint `b8d86acc...`, comando de entrenamiento, parche de `speculators` y procedencia del lanzamiento de vLLM usado para extraer activaciones. La validación se hace sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y la longitud media de aceptación τ (eal).

## Capacidades

- No genera texto de forma autónoma: actúa como drafter auxiliar de Qwen3-8B en un pipeline de decodificación especulativa.
- Propone tokens candidatos que el modelo objetivo verifica, reduciendo el coste por token generado cuando la aceptación es alta.
- Adaptación específica al dominio del store de activaciones mixto (24k ejemplos), con desglose de aceptación por chat, código, matemáticas y STEM.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; hereda las capacidades del modelo objetivo.
- No dispone de modo thinking, visión ni audio propios.
- Multilingüismo: no documentado en la información disponible.

## Casos de uso

- Investigación en decodificación especulativa: reproducir el experimento `fresh_lora` con la semilla, SHA y comando de entrenamiento documentados para validar resultados de aceptación.
- Estudio de adaptadores LoRA sobre drafters: comparar la variante r32 con otras ablaciones de la familia `dyn-spec` usando la misma validación de 200 filas.
- Análisis de dominios de aceptación: usar el desglose chat/code/math/stem para decidir en qué cargas de trabajo conviene desplegar un drafter adaptado frente al drafter base.
- Auditoría de procedencia en pipelines de extracción de activaciones: reutilizar los registros de lanzamiento de vLLM y del store para reconstruir el dataset de entrenamiento.
- Base para futuras exportaciones de serving: cuando se porte la exportación DFlash, el checkpoint serviría como punto de partida para medir latencia real en producción con Qwen3-8B.
- Docencia y formación técnica: ilustrar el ciclo completo de un experimento de decodificación especulativa con artefactos verificables (MANIFEST, métricas, timing).

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una por LoRA, métrica `full_acc` y τ (eal):

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5335 | 7.882 | 0.3513 | 0.6053 | 0.6838 | 0.4936 |

La mejora respecto al punto de partida es de +0.0070 en `full_acc` y +0.179 en τ, con ganancias en todos los dominios (chat +0.0050, code +0.0097, math +0.0063, stem +0.0070). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El drafter base es de 8B (nombre del checkpoint base `Qwen3-8B-DFlash-b16`), pero el adaptador LoRA r32 añade una huella mínima no cuantificada en la información.
- GPU recomendadas: no disponible en la información. Por el tamaño del modelo objetivo (Qwen3-8B) se requeriría al menos una GPU de 24 GB para el objetivo en FP16, pero es una estimación no confirmada por el autor.
- Cabe en GPU de consumo: no confirmado; el repositorio no incluye bundle de serving.
- Opciones de despliegue: el autor indica que la exportación de serving DFlash no está portada; no hay instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo hay registros de `timing.json` del entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abl24k-static-lora-attn-r32-2ep-kl | no disponible (LoRA r32 sobre drafter 8B) | no disponible | full_acc 0.5335, τ 7.882 (validación propia) | no disponible | checkpoint de entrenamiento, sin serving |
| z-lab/Qwen3-8B-DFlash-b16 (drafter base) | 8B (según nombre) | no disponible | no disponible | no disponible | disponible en HF |
| Qwen/Qwen3-8B (modelo objetivo) | 8B | no disponible | no disponible en esta ficha | no disponible en esta ficha | disponible en HF |

La comparativa con otros drafters especulativos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor indica que la exportación de serving DFlash no está portada; el repo contiene un checkpoint de entrenamiento con estado del optimizador.
- Licencia no declarada: no se puede asumir uso comercial sin confirmación del autor y de las licencias de Qwen3-8B y del drafter base.
- Sesgos: no documentados; al ser un adaptador de aceptación, hereda los sesgos del modelo objetivo y del dataset de activaciones.
- Riesgo de alucinación: indirecto, ya que la verificación la realiza el modelo objetivo; el drafter no introduce contenido nuevo, solo propuestas.
- Mejora modesta: +0.0070 en `full_acc` sobre el punto de partida, por lo que el beneficio práctico en latencia puede ser limitado.
- Idiomas y contexto no documentados; no se recomienda asumir cobertura multilingüe.
- Repositorio de 0.0 GB y sin descargas ni likes: ecosistema mínimo, sin validación externa.
- Fecha de creación futura (2026-11-13) en los metadatos de HF, lo que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kl
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
