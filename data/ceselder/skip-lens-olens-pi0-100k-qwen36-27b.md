# ceselder/skip-lens-olens-pi0-100k-qwen36-27b

## Resumen

El modelo `ceselder/skip-lens-olens-pi0-100k-qwen36-27b` es un adaptador LoRA de interpretabilidad diseñado para el modelo base Qwen/Qwen3.6-27B. Su función es inyectar una activación residual cruda de la capa 42 (L42) y generar cuatro viñetas descriptivas sobre lo que el modelo está a punto de generar a continuación. Se trata de un "oracle-lens" nativo de la capa 42, sin transporte entre capas en inferencia, lo que lo convierte en una herramienta de lectura directa de representaciones internas.

Desarrollado por el usuario ceselder, este adaptador es el resultado de una iteración experta best-of-N (π₀, ronda semilla) que parte de un verbalizador de activaciones basado en surprisal con RL (RL-surprisal activation verbalizer). El proceso de construcción incluye la cosecha de 100k activaciones de la capa 42, la minería de rollouts mediante un J-lens auxiliar, el scoring con un jacobiano de la capa 42 y un ajuste fino supervisado (SFT) de una copia del checkpoint RL-surprisal. El modelo se presenta como una herramienta de investigación para la interpretabilidad mecánica, no como un generador de texto general.

Con un tamaño de repositorio de 1.9 GB y una licencia no especificada, este adaptador es relevante para investigadores que necesitan comprender qué representaciones internas preceden a la generación de tokens en un modelo de 27B parámetros. Su enfoque de "lectura de capa" sin transporte cruzado reduce la complejidad de inferencia y permite análisis más directos de la actividad neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen/Qwen3.6-27B |
| Parametros totales | no disponible (adaptador LoRA de 1.9 GB) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (formato safetensors para PEFT) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en una arquitectura LoRA estándar aplicada al modelo Qwen3.6-27B. Su entrenamiento sigue un proceso de iteración experta best-of-N con 32 rollouts por activación. Primero se cosecharon 100k activaciones de la capa 42 (último token real) del dataset FineFineWeb. Luego, se utilizó el verbalizador RL-surprisal con un J-lens auxiliar (`J[42]→L62`, de `camilablank/workspace-lenses`) para minar 32 candidatos por activación. Cada candidato fue evaluado mediante un jacobiano de la capa 42 (modelo `ceselder/skip-lens-ar-l42-jacobian-qwen36-27b`) contra la activación cruda L42, seleccionando 4 viñetas mediante NNOLS (Non-Negative Ordinary Least Squares) con ordenación por FVE (Fracción de Varianza Explicada) tras blanqueo.

Finalmente, se realizó un SFT de una copia del checkpoint RL-surprisal para que emitiera esas 4 viñetas a partir de la activación cruda L42, sin usar el jacobiano en inferencia. El entrenamiento fue de 1 época sobre 100k filas con batch efectivo de 256. La inyección de la activación se realiza con normalización de norma Karvonen en el token marcador `㈜` (token id 158983) en la salida del bloque 1 del transformer, según la configuración en `nla_meta.yaml`.

## Capacidades

- Verbalización de activaciones internas: genera cuatro viñetas descriptivas de lo que el modelo está a punto de generar a partir de la activación cruda de la capa 42.
- Lectura nativa de capa: no requiere transporte entre capas en inferencia, lo que facilita el análisis directo de representaciones.
- Interpretabilidad mecánica: permite inspeccionar qué conceptos o entidades están representados en una capa concreta antes de la generación.
- Compatible con el pipeline de chat de Qwen3.6-27B: se aplica la plantilla de chat con `enable_thinking=False`.
- No es un modelo de generación general: su salida son viñetas de análisis, no texto continuo.

## Casos de uso

- Depuración de generaciones: inyectar la activación L42 de un contexto real y obtener viñetas que expliquen qué está "pensando" el modelo antes de emitir un token, útil para diagnosticar alucinaciones o sesgos.
- Análisis de representaciones semánticas: estudiar cómo la capa 42 codifica conceptos concretos (p. ej., "triple sec", "mitochondria", "gold") en diferentes dominios, facilitando estudios de mecánica interpretativa.
- Evaluación de la coherencia interna: comparar las viñetas generadas con la continuación real del texto para medir la alineación entre representaciones y salida.
- Investigación en activación verbalización: servir como punto de partida (π₀) para iteraciones posteriores (π₁, π₂…) que cierren la brecha de FVE entre el teacher y el modelo final.
- Desarrollo de herramientas de visualización: integrar el adaptador en dashboards que muestren en tiempo real qué conceptos se activan en la capa 42 durante la generación.
- Fine-tuning interpretativo: usar las viñetas como señales para ajustar el comportamiento del modelo base en tareas específicas (p. ej., reforzar ciertos conceptos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas de interpretabilidad:

- FVE compuesta blanqueada (teacher, seed): 0.4919 sobre 100k.
- FVE blanqueada del olens π₀ (sin jacobiano): ~0.37 (≈75% del teacher).
- FVE cruda en contextos reales: 0.62–0.84.

Además, se mencionan ejemplos cualitativos de corrección en continuaciones reales: "a splash of" → "triple sec / Cointreau", "mitochondria … powerhouse of the" → "cell / cellular respiration", "JWST mirror … coated in pure" → "gold".

## Requisitos de hardware

- El adaptador LoRA ocupa 1.9 GB, pero requiere cargar el modelo base Qwen3.6-27B (27B parámetros) en memoria.
- VRAM estimada: al menos 24 GB para inferencia en FP16 con el modelo base, más la memoria adicional del adaptador. Con cuantización del modelo base (p. ej., 4-bit) podría caber en GPUs de 16 GB, aunque no se especifica compatibilidad.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB), o GPUs con suficiente VRAM para el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (oracle-lens o verbalizadores de activación). El propio autor menciona dos modelos relacionados en el ecosistema:

- `ceselder/skip-lens-qwen36-27b-RL-surprisal`: verbalizador de activación RL-surprisal, base del olens.
- `ceselder/skip-lens-ar-l42-jacobian-qwen36-27b`: modelo jacobiano de la capa 42, usado solo en minería.

No se conocen alternativas comerciales o académicas equivalentes con métricas publicadas.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para producción directa: su salida son viñetas interpretativas, no texto útil para aplicaciones finales.
- Depende completamente del modelo base Qwen3.6-27B; cualquier cambio en el base puede invalidar el adaptador.
- La FVE blanqueada (~0.37) indica que las viñetas capturan solo una fracción de la varianza de la activación, por lo que pueden omitir información relevante.
- El proceso de entrenamiento usa un jacobiano solo en minería; la inferencia es directa, pero la calidad de las viñetas está limitada por la ronda semilla (π₀).
- No se especifica licencia, lo que impide determinar restricciones de uso comercial o modificación.
- No hay datos sobre sesgos o alucinaciones específicos del adaptador; estos dependerán del modelo base y del dataset de entrenamiento (FineFineWeb).
- La inyección requiere seguir exactamente la configuración de `nla_meta.yaml` (capa, marcador, vecinos) para funcionar correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/ceselder/skip-lens-olens-pi0-100k-qwen36-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Verbalizador RL-surprisal (referencia): https://huggingface.co/ceselder/skip-lens-qwen36-27b-RL-surprisal
- Modelo jacobiano L42 (referencia): https://huggingface.co/ceselder/skip-lens-ar-l42-jacobian-qwen36-27b
- Workspace lenses (referencia): https://huggingface.co/camilablank/workspace-lenses
