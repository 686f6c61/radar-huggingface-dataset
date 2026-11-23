# rares9301/is-2026-retinopathy-setb

## Resumen

`rares9301/is-2026-retinopathy-setb` es un repositorio de modelos de clasificación de imágenes para retinopatía diabética, publicado como entrega de la asignatura "Image Processing" de 2026 (dataset B). No se trata de un modelo único, sino de un conjunto de artefactos: siete modelos de clasificación de fondo de ojo (backbones ConvNeXt, EfficientNet y Swin preentrenados en ImageNet) combinados en un ensemble, más un especialista binario 0-vs-2 y una regla de post-proceso de consistencia por paciente/ojo. El autor reporta un 81,08 % de accuracy en test con la pipeline original cacheada y un 80,48 % con los pesos reentrenados incluidos en el repositorio.

El modelo resuelve un problema de clasificación de cinco grados (0-4) de retinopatía diabética sobre 10.000 imágenes de fondo de ojo del dataset B, con un split fijo group-aware de 80/10/10 y un conjunto de test de 999 imágenes. La relevancia es limitada: es un trabajo académico privado, con licencia "other" sin términos públicos claros, sin métricas de benchmarks estándar publicadas y con pesos que no son idénticos a los originales (los checkpoints originales no se conservaron).

Arquitectónicamente es un ensemble heterogéneo de CNNs y un transformer visual a resolución 512 px, no un modelo fundacional médico. El repositorio pesa 8,2 GB e incluye 17 ficheros de checkpoint, código de entrenamiento, informes en rumano y scripts de verificación. No hay información sobre idiomas soportados ni sobre capacidades generativas: es exclusivamente un clasificador de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de ConvNeXt-Tiny/Small/Base/Large, EfficientNet-B3 y Swin-Tiny (clasificación de imágenes a 512 px) |
| Parámetros totales | no disponible (no se indica el recuento por backbone ni agregado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (solo se publican checkpoints `.pt` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica; salida limitada a clases 0-4) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | PyTorch `.pt` (`best.pt`, `last.pt`, `ema.pt`) |

## Arquitectura y entrenamiento

El sistema es un ensemble de siete modelos de clasificación de imágenes con backbones preentrenados en ImageNet: cuatro variantes de ConvNeXt (Tiny con tres configuraciones de regularización y semilla, Small y Base), EfficientNet-B3 y Swin-Tiny, todos a resolución de 512 px. A este ensemble se le añade un especialista binario 0-vs-2 basado en ConvNeXt-Large con umbral 0,60, y una regla de consistencia por par paciente/ojo con umbral 0,70 aplicada únicamente en post-proceso (no modifica pesos). El conjunto se entrenó sobre 10.000 imágenes de fondo de ojo del dataset B con split group-aware fijo: 80 % entrenamiento, 10 % validación (fold 0) y 10 % test (fold 1, 999 imágenes).

El entrenamiento se realizó en 3×H100 según la model card, con configuraciones, semillas y aumentos idénticos entre la ejecución original y el reentrenamiento. El autor advierte explícitamente de que la reproducibilidad bit a bit es imposible por la no determinación de cuDNN y la carga concurrente de GPU, de modo que los pesos publicados son una reconstrucción estadísticamente equivalente (acuerdo del 93,1 % con las predicciones cacheadas, 930/999 imágenes). No se menciona uso de RLHF, DPO ni datos retinales externos; los backbones usan solo preentrenamiento ImageNet y no se emplean pesos de RETFound en el modelo final. Existe una variante adicional entrenada desde inicialización aleatoria (sin preentrenamiento) con 71,57 % de accuracy en test.

## Capacidades

- Clasificación de imágenes de fondo de ojo en cinco grados de retinopatía diabética (0-4).
- Ensemble de siete modelos con ponderación definida en `retrain_config.json`.
- Detección especializada de la confusión 0-vs-2 mediante un clasificador binario ConvNeXt-Large con umbral 0,60.
- Post-proceso de consistencia por par paciente/ojo con umbral 0,70.
- Verificación determinista del resultado original (81,08 %) mediante probabilidades cacheadas, sin GPU ni pesos.
- Reanudación de entrenamiento posible gracias a los checkpoints `last.pt` (incluyen optimizador, scheduler y scaler).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modo "thinking", visión general o audio: es un clasificador cerrado de cinco clases.

## Casos de uso

- Triaje automatizado de cribado de retinopatía diabética: el ensemble clasifica imágenes de fondo de ojo en grados 0-4 y puede priorizar casos sospechosos en un flujo de revisión oftalmológica, usando el especialista 0-vs-2 para reducir confusiones entre ausencia de retinopatía y grado 2.
- Reproducción de resultados académicos: el script `28_verify_81_08.py` permite verificar el 81,08 % reportado sin GPU ni pesos, útil para evaluación de trabajos o revisión por pares.
- Punto de partida para transferencia a otros datasets retinales: los checkpoints ConvNeXt/EfficientNet/Swin a 512 px pueden servir como inicialización en tareas de imagen médica con pocos datos.
- Estudio de técnicas de ensemble y post-proceso: el repositorio documenta la ganancia de la regla paciente/ojo (79,68 % → 80,48 % en la reconstrucción), útil como referencia metodológica.
- Comparación preentrenamiento vs. desde cero: la variante `-scratch` (71,57 %) frente a la preentrenada (81,08 %) permite cuantificar el impacto del preentrenamiento ImageNet en dominio médico.
- Docencia y prácticas de procesamiento de imágenes: el snapshot completo (`project/`, `code/`, `submission/`, `HANDOFF.md`) facilita reproducir el pipeline completo en un entorno académico.
- Auditoría de robustez de clasificadores médicos: el desglose por backbone y las curvas de entrenamiento permiten analizar qué arquitectura aporta más al ensemble en cada clase.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de 999 imágenes (dataset B):

| Variante | Accuracy | F1 | QWK |
|---|---:|---:|---:|
| Pipeline cacheada original (7 modelos + especialista + regla par) | 81,08 % | 0,6264 | 0,8469 |
| Ensemble reentrenado (7 modelos) | 79,68 % | 0,582 | 0,833 |
| Ensemble reentrenado + especialista 0-vs-2 | 79,68 % | 0,582 | 0,832 |
| Ensemble reentrenado + especialista + regla par | 80,48 % | 0,590 | 0,842 |

Rendimiento por backbone en la reconstrucción:

| Run | Backbone | Test acc |
|---|---|---:|
| `h100_cnxt512` | ConvNeXt-Tiny | 76,48 % |
| `h100_cnxt512_reg` | ConvNeXt-Tiny (wd 5e-4, ls 0,1, drop 0,2) | 76,78 % |
| `h100_cnxt512_b` | ConvNeXt-Tiny (seed 314) | 76,78 % |
| `h100_cnxs512_v2` | ConvNeXt-Small | 76,28 % |
| `h100_cnxb512` | ConvNeXt-Base | 78,38 % |
| `h100_effb3_512_v2` | EfficientNet-B3 | 76,38 % |
| `h100_swin512` | Swin-Tiny | no disponible |
| `big_binary02_v2` | ConvNeXt-Large (especialista 0 vs 2) | 90,53 % (val) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un backbone ConvNeXt-Tiny a 512 px en FP32 requiere del orden de 1-2 GB de VRAM por modelo; el ensemble completo de siete modelos más el especialista ConvNeXt-Large puede superar los 10-15 GB si se cargan todos simultáneamente.
- GPU recomendadas: el entrenamiento se realizó en 3×H100. Para inferencia del ensemble completo se recomienda A100 40/80 GB o H100; ConvNeXt-Base y ConvNeXt-Large (especialista) son los componentes más pesados.
- GPU de consumo: los backbones individuales (ConvNeXt-Tiny, EfficientNet-B3, Swin-Tiny) caben en RTX 4090 (24 GB) e incluso en GPUs de 8-12 GB en FP16; el ensemble completo en una sola GPU de consumo es ajustado y no está documentado.
- Opciones de despliegue: PyTorch nativo con los scripts del repositorio (`03_train.py`, `13_final_big_test.py`, `14_binary_probs.py`, `16_specialist_rule_test.py`, `25_patient_pair_rule.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rares9301/is-2026-retinopathy-setb` | Ensemble CNN + Swin, clasificación DR | no disponible | 512 px | 81,08 % acc (test propio, 999 imágenes) | other | Pesos `.pt` en HF, 8,2 GB |
| RETFound | ViT fundacional retinal | ~300 M (ViT-L) | 224 px | Métricas en múltiples datasets retinales (no comparable directamente) | no disponible en esta ficha | Pesos públicos en HF/GitHub |
| Modelos de clasificación DR de referencia (p. ej. EyePACS/Aptos basados en EfficientNet) | CNN | variable | variable | variable según dataset | variable | Repositorios académicos |

La comparación directa no es posible con rigor: el modelo se evalúa sobre un split privado del dataset B y no publica métricas en benchmarks públicos de retinopatía (EyePACS, APTOS, Messidor). Los datos de RETFound y de clasificadores DR públicos no están disponibles en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento usa exclusivamente el dataset B (10.000 imágenes), sin datos externos, lo que limita la generalización a otras poblaciones, cámaras o protocolos de captura.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en grados intermedios; el propio autor añade un especialista 0-vs-2 por la confusión entre esas clases.
- Limitaciones de contexto o idioma: no aplica contexto textual; el modelo solo produce etiquetas 0-4. No hay soporte multilingüe ni de texto.
- Restricciones de licencia: licencia "other" sin términos públicos especificados; el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Los pesos publicados no son los originales: los checkpoints originales no se conservaron y la reconstrucción alcanza 80,48 % frente al 81,08 % reportado; el acuerdo con las predicciones cacheadas es del 93,1 %.
- Reproducibilidad bit a bit imposible: cuDNN y la carga concurrente de GPU introducen no determinación incluso con semillas fijas.
- Sin validación clínica: es un trabajo académico, no un dispositivo médico; no debe usarse para diagnóstico sin validación regulatoria.
- El informe está en rumano y el repositorio es privado/académico, lo que dificulta la reutilización por terceros.
- No se publican métricas en benchmarks públicos de retinopatía, lo que impide comparar con el estado del arte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rares9301/is-2026-retinopathy-setb
- Variante sin preentrenamiento: https://huggingface.co/rares9301/is-2026-retinopathy-setb-scratch
- Carpeta de pesos: https://huggingface.co/rares9301/is-2026-retinopathy-setb/tree/main/runs
- WEIGHTS.md: https://huggingface.co/rares9301/is-2026-retinopathy-setb/blob/main/WEIGHTS.md
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de código independiente: no disponible (el código está dentro del propio repositorio HF)
