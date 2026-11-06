# m1b/kairos_rmbenchpp_press_button_noop_16v3_k1_p2p3

## Resumen

`m1b/kairos_rmbenchpp_press_button_noop_16v3_k1_p2p3` es un checkpoint de investigación publicado en Hugging Face por el usuario `m1b`, derivado del modelo base `m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3`. Por la nomenclatura de la model card (acciones `robodojo_dual_x5_absolute_joint_14d`, dataset `rmbench-plus-plus-robodojo-press-button-noop`, normalización por dimensión y estadísticas en `normalization_stats.json`) se trata de un modelo de política para control robótico, no de un modelo de lenguaje generativo. El nombre y la estructura de directorios (`p2/`, `p3/`, checkpoints `step_XXXXXX.pt`) apuntan a un entrenamiento por fases sobre un simulador de robot de doble brazo.

El checkpoint se describe explícitamente como una ablación del modelo `p2p3`: la fase `p2/` aplica 2.000 pasos conjuntos de episodio completo partiendo de `p1/step_020000.pt`, con una variante de "memory tokens" de 16v3 que sustituye el router adaptativo y reduce los pasos de denoising por sorpresa de 4 a 1 (K=1, cuantil 0,9, prefijo 128). La fase `p3/` realiza 2.000 pasos adicionales solo sobre la memoria, partiendo de `p2/step_002000.pt`. El entrenamiento se ejecutó en 1x8 A800 con LR 1e-4.

La relevancia es acotada: es un artefacto de investigación interno, sin pipeline declarado, sin licencia, sin idiomas y con cero descargas. No debe confundirse con un modelo de propósito general; su interés se limita a reproducir o comparar ablaciones dentro de la línea `kairos` del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política para control robótico; no se detalla la arquitectura subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (`p2/step_002000.pt`, `p3/step_002000.pt`); no se listan safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Lo que sí se documenta es el esquema de entrenamiento por fases y la ablación concreta: se parte de `p1/step_020000.pt` del modelo `p2p3`, se aplican 2.000 pasos de episodio completo con "16v3 memory tokens" (router adaptativo, K=1 paso de denoising por sorpresa en lugar de 4, cuantil 0,9, prefijo 128) y después 2.000 pasos adicionales solo sobre la memoria partiendo de `p2/step_002000.pt`. El entrenamiento se realizó en 1x8 A800 con LR 1e-4.

El dataset es `rmbench-plus-plus-robodojo-press-button-noop` y el espacio de acciones es `robodojo_dual_x5_absolute_joint_14d` (14 dimensiones de articulaciones absolutas para un robot de doble brazo). La normalización es por dimensión con minmax a `[-1,1]`, con tratamiento especial para rangos menores que `1e-4` (se usa `x-min`) y recorte a `[-5,5]`. Las estadísticas de normalización se guardan en `p2/normalization_stats.json` y `p3/normalization_stats.json`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de acciones de control para un robot de doble brazo en el espacio `robodojo_dual_x5_absolute_joint_14d` (14 dimensiones de articulaciones absolutas).
- Ejecución de la tarea `press_button_noop` del benchmark `rmbench-plus-plus` en el simulador RoboDojo.
- Memoria episódica mediante "memory tokens" con router adaptativo (variante 16v3).
- Denoising por sorpresa con K=1 paso (ablación respecto a la variante de 4 pasos).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de ablaciones: comparar el efecto de reducir los pasos de denoising por sorpresa de 4 a 1 sobre el rendimiento en `press_button_noop`, manteniendo base y datos idénticos al modelo `p2p3`.
- Estudio de memoria episódica en políticas robóticas: analizar cómo afectan 2.000 pasos adicionales solo sobre la memoria (`p3/`) frente a los 2.000 pasos conjuntos de episodio completo (`p2/`).
- Evaluación en RoboDojo: cargar los checkpoints y ejecutar la tarea `press_button_noop` con la normalización proporcionada en `normalization_stats.json`.
- Investigación en normalización por dimensión: validar el esquema minmax `[-1,1]` con recorte `[-5,5]` y el tratamiento de rangos menores que `1e-4` en espacios de acciones de 14 dimensiones.
- Punto de partida para fine-tuning: usar `p2/step_002000.pt` o `p3/step_002000.pt` como inicialización en experimentos posteriores de la línea `kairos`.
- Auditoría de reproducibilidad: verificar el commit `46e736d0fd66787a7d1039420c0155269328e52c` y la rama `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` para replicar el entrenamiento en 1x8 A800 con LR 1e-4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 18,4 GB, lo que sugiere checkpoints de tamaño considerable; el tamaño exacto por checkpoint no está disponible.
- Entrenamiento documentado en 1x8 A800 con LR 1e-4; no se especifica la VRAM por GPU ni el tiempo de entrenamiento.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el único dato es el uso de A800 para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; los pesos son checkpoints `.pt` de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_press_button_noop_16v3_k1_p2p3` (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| `m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3` (base de la ablación) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos de política para RoboDojo / `rmbench-plus-plus` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación sin licencia declarada: no se autoriza explícitamente el uso comercial.
- Sin pipeline, idiomas ni model card estándar: no es un modelo de propósito general ni apto para tareas de lenguaje.
- Específico de una única tarea (`press_button_noop`) y de un único espacio de acciones (`robodojo_dual_x5_absolute_joint_14d`); no se espera generalización fuera de ese dominio.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base `p2p3`.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Los pesos son checkpoints `.pt` que requieren el código del repositorio (commit `46e736d0fd66787a7d1039420c0155269328e52c`) y las estadísticas de normalización correspondientes; cargarlos sin ese contexto puede producir acciones inválidas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones fuera de rango si no se respeta el recorte `[-5,5]` y la normalización por dimensión.
- No se documentan sesgos; al ser un modelo de control entrenado en simulación, puede presentar un gap de sim-to-real no cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_noop_16v3_k1_p2p3
- Modelo base de la ablación: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3
- Repositorio de código (commit referenciado en la model card): `46e736d0fd66787a7d1039420c0155269328e52c` (rama `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards`); no se proporciona URL directa.
- Dataset: `rmbench-plus-plus-robodojo-press-button-noop`; no se proporciona URL directa.
- Papers, blogs y demos: no disponibles en la información proporcionada.
