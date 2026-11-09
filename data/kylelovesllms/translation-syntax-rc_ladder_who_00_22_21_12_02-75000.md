# kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02-75000` es un artefacto de investigación publicado en Hugging Face por el usuario `kylelovesllms`, consistente en una copia de seguridad de los checkpoints de un experimento de entrenamiento del proyecto `tbd-syntax`. No se trata de un modelo de propósito general, sino de una colección de runs de modelos GPT-2 de muy pequeño tamaño entrenados desde cero para estudiar un fenómeno sintáctico concreto: la formación de cláusulas de relativo (`rc_ladder_relativizer_fix`) en un corpus de traducción inglés-japonés. El nombre del repositorio codifica la configuración experimental (ladder de relativizadores, semilla y timestamp del experimento).

El contenido son diez runs completos, todos con arquitectura GPT-2 y dos configuraciones de anchura de atención (4 capas, 2 o 4 cabezas, dimensión 256), con semillas 42 a 46. El checkpoint identificado en el nombre (`75000`) corresponde al paso de entrenamiento. El repositorio ocupa 2,2 GB, incluyendo pesos en safetensors, tokenizer, métricas, evaluaciones y análisis por run, pero sin el estado del optimizador (`resume/`).

Su relevancia es estrictamente académica: sirve como material reproducible para estudiar cómo modelos pequeños adquieren estructuras sintácticas jerárquicas en tareas controladas de traducción. No está pensado para uso en producción, no declara licencia ni idiomas soportados, y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | no disponible (configuraciones de 4 capas, 2 o 4 cabezas, dimensión 256; el recuento exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (los datos de entrenamiento son inglés-japonés según el dataset enlazado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato HF con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2 estándar (transformer decoder-only con atención causal), en variantes reducidas: 4 capas, dimensión de modelo 256 y 2 o 4 cabezas de atención. Se entrenaron diez runs independientes, cinco con la configuración `gpt2-4l2h256d` (semillas 42-46) y cinco con `gpt2-4l4h256d` (semillas 42-46), todos marcados como finalizados. El checkpoint del nombre corresponde al paso 75.000.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_21_12_02-filled`, un corpus construido específicamente para el experimento de "escalera de relativizadores" (rc ladder) en traducción inglés-japonés. No se especifica el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; por el tipo de experimento (entrenamiento desde cero de un modelo pequeño sobre una tarea sintáctica controlada) es razonable asumir entrenamiento supervisado, pero esto no se confirma en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 pequeño.
- Modelado de estructuras sintácticas de cláusulas de relativo en el contexto del experimento de traducción inglés-japonés.
- Traducción experimental inglés-japonés limitada al dominio del corpus de entrenamiento (no validada fuera de él).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas en la model card; el dataset sugiere inglés y japonés, pero sin confirmación oficial.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de sintaxis: el repositorio permite replicar los diez runs y comparar el efecto de la anchura de atención (2 vs. 4 cabezas) sobre la adquisición de relativizadores, usando los `metrics.csv` y `evals/` incluidos.
- Estudio de sensibilidad a la semilla: las semillas 42-46 en ambas configuraciones permiten analizar la varianza entre inicializaciones en una tarea sintáctica concreta.
- Análisis de curvas de aprendizaje: los checkpoints por paso (`stepNNNNNN/`) permiten trazar la evolución de métricas a lo largo del entrenamiento y detectar fases de adquisición de la estructura.
- Docencia e investigación en lingüística computacional: modelo pequeño y entrenado desde cero, útil para ilustrar cómo un transformer aprende dependencias de relativización en un corpus controlado.
- Baseline para experimentos de interpretabilidad: al ser GPT-2 de 4 capas y dimensión 256, es manejable para análisis de atención y activaciones en hardware modesto.
- Comparación de configuraciones arquitectónicas: los pares 2h/4h con idéntico dataset y semillas permiten aislar el efecto del número de cabezas en la tarea.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ninguna aplicación de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `metrics.csv` y carpetas `evals/` y `analysis/` por run, pero sus valores no se han proporcionado en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un GPT-2 de 4 capas y dimensión 256 ocupa del orden de decenas de MB en fp32, aunque el tamaño exacto no se publica. El repositorio completo (2,2 GB) incluye diez runs con múltiples checkpoints, no un único modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es sobrada; también CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` de Hugging Face de forma nativa (formato GPT-2 con `config.json` y safetensors); no se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (kylelovesllms/translation-syntax-rc_ladder...) | 4 capas, dim 256 (recuento no publicado) | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto de investigación, 10 runs |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face, ampliamente usado | Modelo de propósito general, no comparable en tarea |
| Modelos de sintaxis tipo "baby LM" (p. ej. variantes de GPT-2 pequeños entrenados en corpus controlados) | del orden de 1-100 M | variable | variable | variable | Categoría metodológica similar; no se dispone de comparación directa publicada |

No se dispone de información sobre modelos directamente comparables en la misma tarea (relativizadores inglés-japonés con GPT-2 de 4 capas); la comparativa anterior es orientativa por categoría, no por rendimiento.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado para un experimento sintáctico acotado y su uso fuera de ese dominio carece de validación.
- Licencia no especificada: no se puede asumir permiso para uso comercial; contactar con el autor antes de cualquier uso más allá de investigación.
- Idiomas no declarados oficialmente; el dataset sugiere inglés-japonés, pero no hay confirmación en la model card.
- Riesgo de alucinación y de generación incoherente alto fuera de la distribución del corpus de entrenamiento, dado el tamaño reducido y la especialización.
- No se incluye el estado del optimizador (`resume/`), por lo que la reanudación exacta del entrenamiento no es posible desde este repositorio.
- El repositorio contiene diez runs con múltiples checkpoints; hay que seleccionar explícitamente el checkpoint y la configuración deseados.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación declarada en 2026-11-09, posterior a la fecha de la consulta; verificar la coherencia temporal antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_21_12_02-filled
- Repositorio del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_relativizer_fix_train_00_22_21_12_02
