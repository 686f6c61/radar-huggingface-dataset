# AdityaAA2004/dagger-phase2-final-model

## Resumen

El modelo `dagger-phase2-final-model` es un extractor de voz por hablante objetivo (target speech extraction) desarrollado por AdityaAA2004 como parte del proyecto de investigación `dagger`. Se trata de un checkpoint de la fase 2, entrenado desde cero (scratch) con una estrategia de currículo que intercala mezclas de 3, 4 y 5 hablantes sobre el corpus LibriMix a 8 kHz. El sistema combina una red TF-GridNet con un módulo de atención cruzada (cross-attention) que condiciona la extracción sobre una embedding de hablante obtenida con TitaNet-Large de NVIDIA, congelada durante el entrenamiento.

El objetivo del modelo es extraer cada hablante directamente de la mezcla original sin recurrir a un residuo iterativo, una diferencia clave frente a la fase 1. Los resultados reportados son relativos: comparan estrategias de reconstrucción (coarse-to-fine, deflación con y sin puerta) manteniendo fijas las escenas, la mezcla y el checkpoint. El modelo es un artefacto de investigación para reproducir experimentos de la fase 2, no un sistema de producción. La licencia es Apache-2.0, aunque depende de TitaNet-Large (CC-BY-4.0) que no se incluye en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-GridNet + cross-attention extractor condicionado en embeddings TitaNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio; ventana de análisis con n_fft 256, hop_length 64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (habla leída de LibriMix) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (torch.save) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador TF-GridNet (hidden_channels 64, n_blocks 6, n_fft 256, hop_length 64, n_heads 4, n_tokens 8) con un bloque de atención cruzada (cross_attn_blocks 6) que recibe como condición una embedding de hablante fija generada por TitaNet-Large. El extractor `G(x_O, ē_i)` opera sobre la mezcla original sin tocar, y produce la estimación de cada hablante. El entrenamiento se realizó desde inicialización aleatoria con un único comando, sin warm-start, usando tres cargadores de datos intercalados (n_src 3, 4 y 5) con 800 escenas de Libri3Mix train-360 cada uno (2400 en total). Se usaron 10 épocas, batch 4, lr 3e-4, grad_clip 50, en una GPU T4 durante aproximadamente 6,5 horas. El término "currículo" aquí se refiere a la intercalación de diferentes profundidades de solapamiento en un mismo run, no a un orden de dificultad creciente.

## Capacidades

- Separación de voz multi-hablante: extrae cada hablante de una mezcla de 3, 4 o 5 voces.
- Extracción de hablante objetivo: condicionada por una embedding de hablante de referencia (enrollment).
- Reconstrucción de hablantes mediante estrategias de deflación (gated y ungated) y coarse-to-fine.
- Diarización: el pipeline asume diarización oracle (etiquetas de hablante conocidas) para generar las embeddings de enrollment.
- Procesamiento de audio a 8 kHz, con ventana de análisis de 256 puntos FFT y hop de 64.
- Reproducibilidad: el checkpoint guarda `state_dict`, `model_config`, `system` y `trained_n_src` para verificar la configuración exacta.

## Casos de uso

- Investigación en separación de voz: permite reproducir los experimentos de la fase 2 del proyecto `dagger`, comparando estrategias de reconstrucción sobre escenas fijas de LibriMix.
- Evaluación de estrategias de deflación: el modelo sirve para medir el impacto de la acumulación de errores en la extracción secuencial de hablantes, con resultados reportados en SI-SDR.
- Desarrollo de pipelines de extracción de hablante objetivo: puede integrarse en un flujo de diarización -> enrollment -> extracción -> reconstrucción para estudiar el comportamiento del sistema en condiciones controladas.
- Benchmarking de arquitecturas TF-GridNet con atención cruzada: útil para comparar con otras variantes de separación de voz en el mismo corpus.
- Estudio de currículos de entrenamiento: el checkpoint entrenado con mezclas de 3, 4 y 5 hablantes permite analizar cómo afecta la diversidad de profundidad de solapamiento al rendimiento final.
- Validación de hipótesis teóricas: los autores relacionan la acumulación de error con el teorema `‖E_m‖ ≤ m·ε`, por lo que el modelo puede usarse para verificar cotas de error en reconstrucción iterativa.

## Benchmarks y rendimiento

Los resultados reportados son relativos y se centran en SI-SDR (dB). No se han publicado comparaciones con otros modelos de separación de voz en la información disponible.

| Métrica | Valor |
|---|---|
| SI-SDR absoluto (3 hablantes, profundidad máxima) | -1.29 dB |
| SI-SDR absoluto (4 hablantes, profundidad máxima) | -3.47 dB |
| SI-SDR absoluto (5 hablantes, profundidad máxima) | -4.87 dB |
| Acumulación de error (ungated deflation, m=5, profundidad 5) | -1.81 dB total (monótono) |
| Orden de estrategias (9/9 slices) | coarse_to_fine > gated_deflation > ungated_deflation |

Nota: los valores absolutos son negativos en profundidades 4-5 para todos los sistemas, incluido el que no usa deflación, lo que indica que el punto de operación del extractor está limitado por el pequeño presupuesto de entrenamiento (~2000 pasos en n_src=3 frente a 15000 en la fase 1).

## Requisitos de hardware

- Entrenamiento: se realizó en una GPU NVIDIA T4 (16 GB VRAM) durante ~6,5 horas.
- Inferencia: no se especifican requisitos de VRAM ni GPU recomendadas en la documentación disponible.
- El modelo es un checkpoint de PyTorch, por lo que puede cargarse en cualquier entorno con PyTorch y una GPU con suficiente memoria para el tamaño de la red (no se indica el número de parámetros).
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de audio, el despliegue típico sería mediante un script Python que cargue el checkpoint y ejecute el pipeline de extracción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un artefacto de investigación específico del proyecto `dagger`, y no se han publicado comparaciones con otros sistemas de separación de voz como SepFormer, Conv-TasNet o los propios TF-GridNet estándar.

## Limitaciones y advertencias

- Diarización oracle únicamente: el pipeline asume que las etiquetas de hablante son conocidas; la robustez ante diarización real no se ha medido (fase 3 pendiente).
- Audio sintético a 8 kHz: entrenado y evaluado solo con LibriMix (habla leída en inglés, límites duros, sin reverberación). Los resultados en corpus reales no están validados (fase 4 pendiente).
- No es un modelo de producción: se describe explícitamente como un artefacto de investigación para reproducir el experimento de la fase 2.
- Embedding refinement perjudicial: se recomienda `refine.rounds: 0` salvo que haya enrollment contaminado; el refinamiento de embeddings medido fue netamente dañino (-0.07 a -0.41 dB).
- Dependencia externa: requiere TitaNet-Large de NVIDIA (CC-BY-4.0), que no se incluye en el repositorio y debe cargarse por separado vía NeMo.
- Magnitud de acumulación no robusta: el valor de -1.81 dB es específico de este checkpoint; en checkpoints con warm-start la magnitud fue de 5.30 dB, por lo que debe citarse como un rango con el checkpoint nombrado.
- Sin cuantizaciones ni formatos optimizados: solo se proporciona el checkpoint `.pt` original, sin versiones GGUF, ONNX o similares.

## Enlaces

- Repositorio del proyecto: https://github.com/RohanBanerjee88/dagger
- Config de entrenamiento: https://github.com/RohanBanerjee88/dagger/blob/main/configs/phase2/dod/phase2_librimix_curriculum_3_4_5_train_scratch.yaml
- Configs de evaluación: https://github.com/RohanBanerjee88/dagger/tree/main/configs/phase2/dod
- Resultados completos: https://github.com/RohanBanerjee88/dagger/tree/main/results/phase2/dod_final
- Documento de diseño (CLAUDE.md): https://github.com/RohanBanerjee88/dagger/blob/main/CLAUDE.md
- Aviso de dependencias (NOTICE): https://github.com/RohanBanerjee88/dagger/blob/main/NOTICE
- Modelo en HuggingFace: https://huggingface.co/AdityaAA2004/dagger-phase2-final-model
