# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r128-2ep-kl-pt128

## Resumen

DFlash drafter de decodificación especulativa desarrollado por el usuario erdem-erdem, correspondiente a la adaptación del brazo `direct` dentro del port del generador DFlash del proyecto dyn-spec. Se trata de un artefacto de entrenamiento (checkpoint con estado del optimizador) que adapta un drafter `z-lab/Qwen3-8B-DFlash-b16` sobre el modelo objetivo `Qwen/Qwen3-8B`, no un paquete listo para servir: el autor indica explícitamente que el export de serving de DFlash aún no está portado.

El modelo resuelve el problema de acelerar la inferencia de Qwen3-8B mediante decodificación especulativa: un drafter ligero propone tokens que el modelo objetivo verifica, reduciendo el coste por token generado. La relevancia radica en que documenta un pipeline reproducible de adaptación de drafters con métricas de validación, evaluación offline y procedencia completa (SHA de checkpoint, identidad del store de activaciones, comandos de entrenamiento).

El repositorio ocupa 2,7 GB e incluye el checkpoint (`checkpoint.pt`), registros de ejecución, parches (`speculators.patch`) y un manifiesto con tamaños y hashes de cada fichero. No se dispone de información sobre licencia, idiomas ni pipeline en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores LoRA sobre drafter DFlash (decodificación especulativa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |

## Arquitectura y entrenamiento

El artefacto es un checkpoint de entrenamiento de un drafter de decodificación especulativa. Parte del drafter `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`) y lo adapta mediante LoRA con rango 128 sobre el modelo objetivo `Qwen/Qwen3-8B`. La configuración corresponde al brazo `direct` en etapa de `pretraining`, con 2667 updates, semilla 42 y una función de pérdida que incluye un término KL con temperatura 128 (`kl-pt128` según el nombre del run).

El entrenamiento consume un store de activaciones publicado como dataset (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), con procedencia de extracción, lanzamiento de vLLM y registros de relleno documentados en `provenance/store/`. El repositorio incluye además `train_command.txt` y `speculators.patch`, lo que permite reproducir la ejecución. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni detalles sobre RLHF o DPO.

## Capacidades

- El modelo no genera texto de forma autónoma: actúa como drafter especulativo para Qwen3-8B, proponiendo tokens candidatos que el modelo objetivo verifica.
- Acelera la decodificación de Qwen3-8B en escenarios de generación de texto, código, matemáticas y STEM, según las categorías evaluadas en la validación.
- Soporte de tool calling: no disponible de forma directa (heredado del modelo objetivo, no documentado en este artefacto).
- Soporte de agentes y razonamiento multi-paso: no documentado en este artefacto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: el checkpoint incluye estado del optimizador, útil para reanudar entrenamiento, no para inferencia directa.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: integrar el drafter en un pipeline de decodificación especulativa para reducir la latencia por token generado, siempre que se complete previamente el export de serving de DFlash (no portado aún).
- Investigación en decodificación especulativa: servir como punto de partida reproducible para estudiar el efecto del rango LoRA (128) y de la pérdida KL con temperatura 128 en la calidad del drafter.
- Reanudación de entrenamiento: al incluir `checkpoint.pt` con estado del optimizador y `train_command.txt`, permite continuar el run desde el update 2667 con la misma semilla y configuración.
- Reproducción de experimentos: el `MANIFEST.json` con SHA256 de cada fichero y la procedencia del store de activaciones facilitan la verificación bit a bit de resultados.
- Evaluación comparativa de drafters: las métricas de validación sobre 200 filas fijas (full_acc, τ eal, chat, code, math, stem) permiten comparar esta adaptación con otras variantes del mismo pipeline.
- Estudio de transferencia de drafters: analizar cómo se comporta un drafter entrenado sobre Qwen3-8B con un store de activaciones mixto de 24k ejemplos en dominios diferenciados (chat, código, matemáticas, STEM).

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5349 | 7.904 | 0.3520 | 0.6073 | 0.6845 | 0.4959 |

El autor indica que los resultados de evaluación offline completos (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14 y métricas por fila) están en `run/offline_eval/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un checkpoint de entrenamiento, no un bundle de serving.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento se realizó con vLLM según la procedencia, pero no se detalla el hardware.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño efectivo del drafter tras el export de serving.
- Opciones de despliegue: el autor indica que el export de serving de DFlash no está portado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-generator-attn-r128-2ep-kl-pt128 | no disponible | no disponible | full_acc 0.5349 en validación interna | no disponible | checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 (drafter base) | no disponible | no disponible | no disponible | no disponible | drafter publicado |
| Qwen/Qwen3-8B (modelo objetivo) | 8B | no disponible | no disponible | no disponible | modelo publicado |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un paquete de serving: el autor indica explícitamente que el export de DFlash para servir aún no está portado, por lo que no puede desplegarse directamente en producción.
- Licencia no declarada: no se especifica licencia en los metadatos ni en la model card, lo que impide evaluar el uso comercial.
- Idiomas no declarados: no hay información sobre cobertura lingüística del drafter.
- Sesgos y alucinaciones: al ser un drafter, los sesgos y errores del modelo objetivo (Qwen3-8B) se heredan; el drafter solo propone tokens que el objetivo verifica, pero una mala calidad del drafter puede degradar la aceptación y, en configuraciones agresivas, la fidelidad de la salida.
- Métricas limitadas: la validación se realiza sobre 200 filas fijas, una por LoRA, lo que puede no representar la distribución real de producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Checkpoint con estado del optimizador: el tamaño (2,7 GB) incluye artefactos de entrenamiento que no son necesarios para inferencia y pueden confundir su uso como modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r128-2ep-kl-pt128
- Dataset de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
