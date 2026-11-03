# jsaurabh/weight-space-lab-artifacts

## Resumen

`jsaurabh/weight-space-lab-artifacts` no es un modelo de lenguaje entrenado, sino un repositorio de artefactos de investigación asociado al proyecto Weight Space Lab. Contiene checkpoints reducidos, ediciones de pesos y arrays de activaciones generados en experimentos de programación en el espacio de pesos (weight-space programming) y edición de modelos. El repositorio está pensado para reproducir resultados experimentales, no para inferencia en producción.

El contenido principal incluye construcciones guiadas de transformers para tareas finitas de paridad y suma (`results/reference/`), construcciones numéricas generadas de forma independiente por un sistema denominado Astra (`results/discovery/astra-initial/`) y una edición dispersa del modelo Qwen3.5-0.8B. Los checkpoints pequeños se distribuyen como state dictionaries de PyTorch y resuelven exhaustivamente sus dominios finitos documentados. La edición de Qwen se distribuye como un diff de dos tensores, no como un modelo completo.

La relevancia del repositorio es metodológica: documenta con checksums SHA-256 y procedencia detallada la diferencia entre construcción guiada, descubrimiento independiente y replay. El experimento de descubrimiento ciego sobre Qwen no mejoró el rendimiento del modelo base (5/64 frente a 3/64), lo que convierte al repositorio en un registro honesto de resultados negativos en edición de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoints pequeños construidos sin descenso de gradiente); edición sobre Qwen3.5-0.8B |
| Parametros totales | No disponible (los checkpoints de paridad y suma son reducidos; la edición afecta a dos tensores de Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible a nivel de repositorio; componentes con CC BY 4.0 (edición publicada de Qwen) y Apache 2.0 (tensores derivados de Qwen) |
| Formato de pesos | PyTorch state dict (`.pt`), NumPy (`.npz`), safetensors (`.safetensors`) |

## Arquitectura y entrenamiento

Los checkpoints de `results/reference/` y `results/discovery/astra-initial/` son construcciones de transformers guiadas o generadas numéricamente, sin entrenamiento mediante descenso de gradiente. Cada archivo contiene un state dictionary de PyTorch, la configuración de arquitectura, la tarea y la procedencia, y se carga con `torch.load(..., weights_only=True)`. Según la model card, ambas variantes resuelven exhaustivamente sus dominios finitos documentados (paridad y suma).

El artefacto de Qwen (`third_party/qwen_p50c/edit.npz`) es la edición dispersa publicada por los autores de *Sparks of Weight-Space Programming* (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab, 2026), con atribución CC BY 4.0. El candidato seleccionado en el descubrimiento ciego (`results/qwen/blind-discovery/selected.safetensors`) contiene únicamente dos tensores editados y requiere Qwen/Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17`; los pesos base no se duplican en el repositorio. La reproducibilidad se apoya en `artifact_inventory.json`, que registra checksums SHA-256 y procedencia, y en `experiments/fetch_artifacts.py` del repositorio de GitHub.

## Capacidades

- No es un modelo de propósito general: no se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- Los checkpoints pequeños resuelven tareas finitas específicas (paridad y suma) de forma exhaustiva dentro de sus dominios documentados.
- La edición sobre Qwen3.5-0.8B se materializa mediante `experiments/blind/replay.py` y requiere los pesos base originales.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de programación en el espacio de pesos: clonar el repositorio de GitHub y ejecutar `python3 experiments/fetch_artifacts.py` para restaurar artefactos y verificar checksums contra un manifiesto fijado a un commit de Hugging Face.
- Auditoría de procedencia: usar `artifact_inventory.json` para verificar la integridad SHA-256 de cada checkpoint y edición antes de reutilizarlos en un estudio.
- Investigación en edición de modelos: comparar la edición dispersa publicada de Qwen con el candidato seleccionado en el descubrimiento ciego para estudiar por qué una búsqueda independiente no mejora el rendimiento base.
- Docencia sobre resultados negativos: emplear el caso Qwen (base 5/64 frente a candidato 3/64, con 61/64 ejecuciones que agotan el límite de tokens) como ejemplo de evaluación rigurosa en edición de pesos.
- Replay de parches: materializar el parche independiente con `experiments/blind/replay.py` sobre la revisión exacta de Qwen3.5-0.8B para validar la reproducibilidad del pipeline.
- Estudio de activaciones: analizar los arrays `.npz` de `results/qwen/blind-discovery/artifacts/`, registrados sin object pickles, para inspeccionar el comportamiento interno durante la búsqueda.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible corresponden al experimento de descubrimiento ciego sobre Qwen:

| Configuracion | Aciertos | Ejecuciones correctas | Agota limite de tokens |
|---|---|---|---|
| Qwen3.5-0.8B base | 5/64 | 3/64 | 61/64 |
| Candidato editado (2 tensores) | 3/64 | 3/64 | 61/64 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Los checkpoints pequeños de paridad y suma son state dictionaries reducidos; no se especifica VRAM, pero por su naturaleza caben en CPU y en cualquier GPU consumer.
- La edición sobre Qwen3.5-0.8B requiere cargar los pesos base del modelo original (0,8B parámetros), lo que cabe en GPUs consumer con suficiente VRAM para el modelo base en el formato elegido.
- No se documentan GPU recomendadas (A100, H100, RTX 4090) ni estimaciones de latencia o throughput.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., weights_only=True)`) y replay mediante `experiments/blind/replay.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- La obtención de artefactos no realiza llamadas a API de editores ni arranca instancias GPU.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje comparable con alternativas de la misma categoría; es un conjunto de artefactos de investigación sobre edición de pesos y construcciones de transformers reducidas.

## Limitaciones y advertencias

- No es un modelo desplegable en producción: carece de pipeline, idiomas, contexto y licencia documentados a nivel de repositorio.
- El candidato de descubrimiento ciego no mejora el rendimiento base (3/64 frente a 5/64) y agota el límite de tokens en 61 de 64 ejecuciones.
- El archivo `selected.safetensors` contiene solo dos tensores editados; no es un modelo completo y exige los pesos base de Qwen3.5-0.8B en una revisión concreta.
- Las licencias son heterogéneas: la edición publicada de Qwen retiene CC BY 4.0 y los tensores derivados de Qwen están bajo Apache 2.0 con aviso de modificación; la licencia del repositorio en su conjunto no está disponible, lo que introduce incertidumbre para uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), sin historial de mantenimiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no se trata de un modelo generativo de propósito general.
- Los resultados de los checkpoints pequeños están acotados a dominios finitos documentados; no extrapolan a tareas abiertas.

## Enlaces

- Hugging Face: https://huggingface.co/jsaurabh/weight-space-lab-artifacts
- Repositorio de código: https://github.com/jsaurabh/weight-space-lab
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de referencia (*Sparks of Weight-Space Programming*, 2026): no disponible como enlace directo en la información proporcionada
- OrbitQuant: https://saurabhcantina.github.io/orbitquant/
- arXiv *Who Built This Model? Tracing LLM Lineage via Spectral...*: https://arxiv.org/pdf/2608.07786
