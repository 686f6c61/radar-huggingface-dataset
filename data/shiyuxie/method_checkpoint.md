# shiyuxie/method_checkpoint

## Resumen

`shiyuxie/method_checkpoint` no es un modelo completo, sino un repositorio de artefactos de investigación: 41 checkpoints LoRA consecutivos (directorios `0000` a `0040`) generados durante una ejecución de intervención en línea de 40 actualizaciones con el método denominado OTMethod, variante `first_stop_match`. Cada directorio contiene un adaptador PEFT LoRA de rango 16 sobre las proyecciones `q_proj` y `v_proj` de un modelo base de 4B parámetros en versión instruct identificado en el proyecto como «M10» (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), junto con el estado del optimizador y de RNG necesario para reanudar el entrenamiento.

El interés del repositorio es de trazabilidad experimental, no de rendimiento: el propio autor documenta que la ejecución no cumplió su criterio preinscrito. Sobre GPQA-Diamond (198 preguntas, 4 muestras por pregunta, bootstrap pareado de 10.000 remuestreos) la precisión pasó del 76,89 % al 76,52 % (−0,38 pp, IC 95 % [−2,65, +1,77]) y los tokens de razonamiento aumentaron de 11.721 a 12.039 (+318, IC 95 % [−178, +831]), con un ahorro relativo de coste de razonamiento de −2,71 % (IC 95 % [−7,10 %, +1,50 %]). Ambos intervalos cruzan cero.

Es relevante ahora como material de reproducibilidad y como ejemplo de publicación de resultados negativos con verificación de integridad byte a byte: los 123 ficheros se re-verificaron contra los hashes SHA-256 registrados en cada `checkpoint.json` antes de la subida. No hay model card descriptiva, ni licencia declarada, ni idiomas soportados, ni pipeline asignado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer decoder-only instruct de 4B (modelo base «M10»); arquitectura interna del base no disponible |
| Parámetros totales | ~4B en el modelo base (M10); adaptador LoRA de rango 16 (recuento exacto de parámetros del adaptador no disponible; `adapter_model.bin` = 7,0 MB) |
| Parámetros activos | No aplica (no es MoE); adaptador LoRA entrenable sobre `q_proj` y `v_proj` |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos de adaptador en `adapter_model.bin`; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.bin` (`adapter_model.bin`, 7,0 MB) + `training.pt` (22 MB, optimizador + RNG) + `adapter_config.json` + `checkpoint.json`; sin safetensors |
| Configuración LoRA | r=16, alpha=32, dropout=0,0, `target_modules=[q_proj, v_proj]` |
| Checkpoints | 41 directorios (`0000` inicialización … `0040`), 123 ficheros, 1,11 GiB (repo 1,2 GB) |
| Librería | `peft` |
| Autor | shiyuxie |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de bajo rango (r=16, alpha=32, dropout 0,0) aplicados exclusivamente a las matrices de proyección de query y value de la atención del modelo base. No se modifican las capas MLP ni las proyecciones de salida, lo que mantiene cada adaptador en 7,0 MB y hace que el conjunto completo de 41 checkpoints quepa en 1,11 GiB. El modelo base es un instruct de 4B parámetros del que solo se documenta la revisión de Hugging Face (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y el alias interno «M10»; no se especifican capas, dimensión oculta, cabezas de atención ni tokenizador.

El entrenamiento consistió en 40 actualizaciones en línea con intervención sobre la política de parada del razonamiento (`first_stop_match`), un esquema que decide cuándo detener la generación de tokens de pensamiento. Cada checkpoint incluye `training.pt` con el estado del optimizador y del generador de números aleatorios, lo que permite reanudar la ejecución exactamente en cualquier punto. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o SFT supervisado. Tampoco se describe la innovación técnica más allá del nombre del método (OTMethod), y no se enlaza ningún paper.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados del modelo base M10 de 4B; capacidades específicas del base no documentadas.
- Razonamiento con tokens de pensamiento explícitos: la métrica de coste se mide en «thinking tokens», con una media de 11.721 a 12.039 tokens por evaluación en GPQA-Diamond.
- Respuesta a preguntas de nivel experto: evaluado en GPQA-Diamond (física, química y biología de posgrado), con precisión del 76,5 % tras el entrenamiento.
- No hay evidencia ni documentación de soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües.
- No se documenta modo thinking conmutable, plantilla de chat ni formato de prompt; el adaptador se limita a modificar el comportamiento del base.
- Reanudación exacta de entrenamiento: `training.pt` preserva optimizador y RNG, lo que permite bifurcaciones reproducibles desde cualquier actualización.

## Casos de uso

- Reproducción de experimentos de intervención en línea: cargar el checkpoint `0000` y el `0040` con el mismo base y repetir la evaluación GPQA-Diamond para verificar la diferencia de −0,38 pp reportada, usando el bootstrap pareado sobre las mismas 198 preguntas.
- Estudio de la dinámica de políticas de parada: los 41 checkpoints permiten trazar la evolución de la longitud de razonamiento (de 11.721 a 12.039 tokens medios) actualización a actualización y detectar en qué paso se degrada la precisión.
- Análisis de coste computacional del razonamiento: usar las métricas de thinking tokens como variable dependiente en experimentos sobre cuándo detener la generación, comparando `first_stop_match` con criterios alternativos sobre el mismo base.
- Reanudación y bifurcación de entrenamiento: cargar `training.pt` de cualquier directorio intermedio para continuar la ejecución con hiperparámetros distintos sin repetir las actualizaciones previas, gracias al estado de optimizador y RNG incluido.
- Auditoría de integridad de artefactos: usar los SHA-256 de los `checkpoint.json` como referencia para validar pipelines de publicación de checkpoints, ya que los 123 ficheros se verificaron byte a byte antes de subirlos.
- Material docente sobre LoRA: inspeccionar cómo un adaptador de rango 16 restringido a `q_proj` y `v_proj` modifica el comportamiento de un modelo de 4B sin tocar las capas MLP, con checkpoints intermedios disponibles para comparar.
- Base para ablaciones de rango y módulos objetivo: partir de la configuración documentada (r=16, alpha=32, q_proj/v_proj) y replicar la ejecución con otros rangos o con `k_proj`/`o_proj` incluidos para medir el efecto sobre GPQA-Diamond.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre GPQA-Diamond, 198 preguntas, 4 muestras por pregunta, bootstrap pareado por pregunta con 10.000 remuestreos:

| Métrica | Inicial | Tras 40 actualizaciones | Delta | IC 95 % |
|---|---|---|---|---|
| Precisión GPQA-Diamond | 76,89 % | 76,52 % | −0,38 pp | [−2,65, +1,77] |
| Tokens de pensamiento (total) | 11.721 | 12.039 | +318 | [−178, +831] |
| Ahorro relativo de coste de razonamiento | — | — | −2,71 % | [−7,10 %, +1,50 %] |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible. El criterio preinscrito (subir precisión y bajar coste simultáneamente) no se cumplió: ambos intervalos de confianza cruzan cero.

## Requisitos de hardware

- VRAM estimada para el modelo base de 4B más el adaptador LoRA: ~8-9 GB en fp16, ~5 GB en int8 y ~3 GB en 4-bit (estimación para 4B; no verificada contra este repositorio).
- El adaptador en sí es marginal: 7,0 MB por checkpoint, sin coste apreciable de VRAM frente al base.
- GPU recomendadas: A100 40/80 GB o H100 para evaluaciones por lotes con 4 muestras por pregunta y contextos de más de 12.000 tokens de pensamiento; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16 o 8-bit de una sola instancia.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) siempre que la longitud de contexto lo permita.
- Opciones de despliegue: `peft` + `transformers` (flujo documentado por el autor, repuntando `base_model_name_or_path`); vLLM y TGI admiten adaptadores LoRA, pero no hay configuración publicada ni verificación para este repo; llama.cpp/Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles. Como referencia de coste, cada evaluación GPQA-Diamond implica 198 × 4 = 792 generaciones de ~12.000 tokens de pensamiento, lo que hace conveniente el procesamiento por lotes en GPU de datacenter.
- Almacenamiento: 1,2 GB para el repo completo; basta con descargar los subdirectorios necesarios (`0040` para el estado final, `0000` para la inicialización).

## Comparativa con modelos similares

No se han identificado en la información disponible artefactos públicos comparables (mismo base M10, mismo método OTMethod o misma política `first_stop_match`). La comparación con otros adaptadores LoRA de r=16 sobre modelos de 4B no puede establecerse con datos: no hay benchmarks comunes publicados.

| Criterio | `shiyuxie/method_checkpoint` | Alternativas comparables |
|---|---|---|
| Parámetros del base | ~4B (M10, instruct) | No disponible |
| Rango LoRA / módulos | r=16, alpha=32, q_proj y v_proj | No disponible |
| Checkpoints publicados | 41 (incluye estado de optimizador) | No disponible |
| Contexto | No disponible | No disponible |
| GPQA-Diamond | 76,52 % (IC 95 % [74,5, 78,5] aprox.) | No disponible |
| Licencia | No disponible | No disponible |
| Formato de pesos | `.bin` (PyTorch), sin safetensors | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin término legal explícito no puede asumirse uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- El resultado principal es negativo: ni la precisión ni el coste de razonamiento mejoraron de forma significativa. No es un adaptador «mejorado» respecto al base, sino el registro de un experimento fallido.
- El formato `adapter_model.bin` es un pickle de PyTorch: cargarlo con `torch.load` sin `weights_only=True` implica riesgo de ejecución de código arbitrario; no hay safetensors en el repo.
- `adapter_config.json` contiene una ruta de sistema de ficheros local como `base_model_name_or_path`; hay que repuntarla al base M10 propio antes de cargar, y no debe reescribirse in situ porque rompe el hash SHA-256 que verifica el código de entrenamiento.
- El modelo base se identifica solo por alias interno («M10») y revisión; si no se dispone de esa revisión exacta, los adaptadores pueden comportarse de forma distinta o directamente no cargar.
- No hay información sobre sesgos, filtrado de seguridad, idiomas ni comportamiento fuera de GPQA-Diamond; no se documenta ninguna evaluación de alucinación ni de robustez.
- Evaluación limitada a un único benchmark de 198 preguntas: los intervalos de confianza de ±2 pp implican que diferencias menores no son detectables con este diseño.
- No se documenta `chat_template` ni formato de prompt; usar el del base es un requisito implícito, y un formato incorrecto invalida la comparación con las métricas reportadas.
- El repositorio contiene 123 ficheros en 41 subdirectorios; descargar el repo completo para usar solo el checkpoint final es innecesario y consume 1,2 GB.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shiyuxie/method_checkpoint
- Checkpoint final: https://huggingface.co/shiyuxie/method_checkpoint/tree/main/0040
- Checkpoint de inicialización: https://huggingface.co/shiyuxie/method_checkpoint/tree/main/0000
- Perfil del autor: https://huggingface.co/shiyuxie
- Paper, blog, repositorio de código o demo del método OTMethod / `first_stop_match`: no disponibles en la información proporcionada.
- Referencia del modelo base M10 (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`): no disponible en la información proporcionada.
