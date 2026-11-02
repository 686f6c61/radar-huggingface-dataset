# Pan-Junyu/LaBraM-at-Scale

## Resumen

LaBraM at Scale es una familia de diez encoders de electroencefalografía (EEG) preentrenados, desarrollada por Jun-Yu Pan, Ruicheng Yin, Bao-Liang Lu, Dongsheng Li, Wei-Long Zheng y Yansen Wang, que escala el trabajo previo LaBraM aumentando simultáneamente el volumen de datos de preentrenamiento y el tamaño del encoder. El modelo aborda el problema de la escasez de representaciones EEG generalizables: en lugar de entrenar un modelo por tarea y por sujeto, se preentrena una vez sobre decenas de miles de horas de señal y se adapta después mediante fine-tuning completo o linear probing.

La colección cubre tres familias (Quark, Atom y Molecule) con encoders de 5,8M, 46,3M, 369M y 1,97B parámetros, preentrenados sobre 25.067, 49.628 y 79.910 horas de EEG respectivamente. La evaluación abarca 23 tareas EEG bajo un protocolo común (OmniEEG-Bench) con fine-tuning completo, linear probing y clasificación compartida EEG–Qwen3.

Es relevante ahora porque documenta empíricamente que el escalado de datos y de capacidad no mejora de forma monótona: los encoders grandes rinden mejor en fine-tuning completo, pero el rendimiento downstream puede degradarse mientras la pérdida de preentrenamiento sigue bajando, lo que cuestiona la selección de checkpoints basada solo en la pérdida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para EEG basado en LaBraM (tokenización de parches temporales) |
| Parámetros totales | 10 encoders: 5,8M (B), 46,3M (L), 369M (H) y 1,97B (G) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada en ventanas de señal a 200 Hz; longitud de ventana no especificada en la información disponible) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (metadatos del repo; el modelo procesa señal EEG, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye encoder y cabezas de preentrenamiento; tokenizers en safetensors) |

## Arquitectura y entrenamiento

LaBraM at Scale mantiene la arquitectura LaBraM: un transformer que opera sobre tokens derivados de parches de señal EEG, con un tokenizador específico por familia de encoders (Quark, Atom, Molecule). Se publican cuatro configuraciones de tamaño por familia (`labram_base_patch200_200`, `labram_large_patch200_200`, `labram_huge_patch200_200`, `labram_giant_patch200_200`), con parches de 200 muestras sobre señal a 200 Hz. El preentrenamiento es autosupervisado sobre colecciones EEG de 25.067 h (Quark), 49.628 h (Atom) y 79.910 h (Molecule).

Un detalle técnico relevante es la normalización de entrada diferenciada por familia: Quark y Atom escalan la señal por 1/100, mientras que Molecule aplica z-score por canal con recorte en ±15. Los experimentos de fracción de datos indican que la escala de datos útil depende de la capacidad del encoder, y que el rendimiento downstream puede caer aunque la pérdida de preentrenamiento continúe descendiendo. No se especifican en la información disponible detalles sobre objetivos de preentrenamiento concretos, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Extracción de representaciones EEG genéricas para clasificación downstream en 23 tareas.
- Fine-tuning completo (Full-FT) sobre tareas etiquetadas con pocas ventanas por sujeto y clase (máximo 40 en el protocolo de evaluación).
- Linear probing con pooling (`lp_pool`) y sin pooling (`lp_nopool`) sobre representaciones congeladas.
- Clasificación compartida EEG–Qwen3: el encoder EEG se combina con Qwen3-8B para clasificación multimodal.
- Tokenizadores publicados para las tres familias, con pesos en safetensors.
- Soporte de múltiples tareas simultáneas (entrypoint de multitarea en el repositorio de código).
- No soporta generación de texto, tool calling, agentes ni visión: es un encoder de señal, no un modelo de lenguaje.

## Casos de uso

- Decodificación de interfaces cerebro-computador (BCI): el encoder preentrenado se fine-tunea sobre registros de imaginación motora para clasificar intenciones de movimiento con pocos datos por sujeto, aprovechando las 25.067–79.910 horas de preentrenamiento.
- Detección de anomalías epilépticas: fine-tuning sobre ventanas etiquetadas de EEG clínico para clasificar segmentos ictales frente a interictales, con linear probing como línea base rápida antes de invertir en Full-FT.
- Monitorización del sueño: clasificación de estadios de sueño a partir de canales EEG, usando la normalización por canal de la familia Molecule para estabilizar la señal entre sujetos y montajes.
- Investigación en neurociencia cognitiva: extracción de embeddings EEG congelados para análisis de representaciones y comparación entre cohortes sin reentrenar el encoder.
- Evaluación comparativa de encoders EEG: uso de los diez checkpoints publicados como referencia reproducible bajo el protocolo OmniEEG-Bench para medir el efecto del escalado de datos y parámetros.
- Clasificación multimodal EEG–texto: integración del encoder con Qwen3-8B para tareas donde la señal EEG se combina con instrucciones o etiquetas en lenguaje natural, alcanzando 50,50 ± 2,17% de media en las 23 tareas.
- Selección de modelo en producción: los manifiestos `best-full-ft` permiten desplegar los checkpoints con mejor media Full-FT sin repetir la búsqueda de hiperparámetros.

## Benchmarks y rendimiento

Media de balanced accuracy (%) sobre 23 tareas EEG, semillas 42, 10 y 5, según la model card:

| Modelo | Parámetros encoder | Horas de preentrenamiento | Full-FT (%) | LP (%) |
|---|---:|---:|---:|---:|
| Quark-B | 5,8M | 25.067 | 52,91 | 52,83 |
| Quark-L | 46,3M | 25.067 | 53,50 | 53,98 |
| Quark-H | 369M | 25.067 | 54,51 | 52,37 |
| Quark-G | 1,97B | 25.067 | 57,22 | 54,33 |
| Atom-B | 5,8M | 49.628 | 54,74 | 52,71 |
| Atom-L | 46,3M | 49.628 | 57,07 | 53,53 |
| Atom-H | 369M | 49.628 | 57,37 | 53,54 |
| Molecule-B | 5,8M | 79.910 | 55,34 | 51,71 |
| Molecule-L | 46,3M | 79.910 | 56,70 | 53,30 |
| Molecule-H | 369M | 79.910 | 58,02 | 53,88 |
| Atom-B* | 5,8M | 49.628 | 55,11 | 53,35 |
| Atom-L* | 46,3M | 49.628 | 59,05 | 54,09 |
| Atom-H* | 369M | 49.628 | 58,86 | 54,25 |

Los modelos marcados con asterisco pertenecen al conjunto `best-full-ft`. Según la model card, Atom-L* supera a REVE Large en 3,61 puntos porcentuales con un encoder de 46,3M de parámetros, y Quark-G supera a CodeBrain en 1,24 puntos en linear probing. Los resultados completos por tarea y semilla están en los CSV enlazados en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder mayor (1,97B parámetros) requiere aproximadamente 4 GB en fp16 solo para pesos, más activaciones y memoria del tokenizador.
- El conjunto por defecto de diez modelos ocupa unos 13,3 GB en disco; el repositorio completo, 15,5 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, los encoders B y L caben en GPUs de consumo (RTX 3060/4060/4090); H y G requieren GPUs de datacenter (A100, H100) para fine-tuning completo con lotes razonables.
- Despliegue: el repositorio de código proporciona los entrypoints de FT, LP y multitarea mediante `scripts/run_eval.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder EEG).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros encoder | Horas de preentrenamiento | Full-FT (%) | LP (%) | Licencia |
|---|---:|---:|---:|---:|---|
| LaBraM at Scale (Atom-L*) | 46,3M | 49.628 | 59,05 | 54,09 | MIT |
| LaBraM at Scale (Molecule-H) | 369M | 79.910 | 58,02 | 53,88 | MIT |
| REVE Large | no disponible | no disponible | ~55,44 (referencia citada) | no disponible | no disponible |
| CodeBrain | no disponible | no disponible | no disponible | ~53,09 (referencia citada) | no disponible |

Las cifras de REVE Large y CodeBrain se derivan de las diferencias reportadas en la model card (3,61 y 1,24 puntos respectivamente); sus especificaciones completas no están en la información disponible.

## Limitaciones y advertencias

- El rendimiento downstream puede degradarse mientras la pérdida de preentrenamiento sigue bajando; no debe seleccionarse checkpoint solo por pérdida.
- La escala de datos útil depende de la capacidad del encoder: más datos no garantizan mejores resultados en encoders pequeños.
- Los encoders grandes mejoran de forma más consistente en fine-tuning completo que en linear probing.
- La normalización de entrada difiere por familia (1/100 en Quark y Atom; z-score por canal con recorte ±15 en Molecule); usar la normalización incorrecta invalida los resultados.
- El protocolo de evaluación limita a 40 ventanas de entrenamiento por par sujeto–clase; el rendimiento con datasets completos puede diferir.
- Los hiperparámetros de tarea única se seleccionaron con el test de la semilla 42, lo que introduce una fuga leve en las métricas reportadas para el resto de semillas.
- Sesgos demográficos y de montaje EEG: la composición de las cohortes de preentrenamiento no se detalla en la información disponible, por lo que la generalización a poblaciones o equipos no representados no está caracterizada.
- Licencia MIT: permite uso comercial, pero el modelo no incluye garantías ni evaluación clínica; no debe usarse para diagnóstico médico sin validación regulatoria.
- El modelo procesa señal EEG, no texto; los metadatos de idioma (`en`) no implican capacidades lingüísticas.

## Enlaces

- HuggingFace: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale
- Repositorio de código: https://github.com/AlbertMentat/LaBraM-at-Scale
- Informe técnico: https://github.com/AlbertMentat/LaBraM-at-Scale/blob/main/site/assets/report.pdf
- Guía de uso: https://github.com/AlbertMentat/LaBraM-at-Scale/blob/main/docs/USAGE.md
- Manifiesto por defecto: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/manifest.json
- Conjunto best-full-ft: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/best-full-ft/README.md
- Manifiesto best-full-ft: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/best-full-ft/manifest.json
- Resultados Full-FT: https://github.com/AlbertMentat/LaBraM-at-Scale/blob/main/site/assets/results_ft.csv
- Resultados LP: https://github.com/AlbertMentat/LaBraM-at-Scale/blob/main/site/assets/results_lp.csv
- Resultados por tarea y semilla: https://github.com/AlbertMentat/LaBraM-at-Scale/blob/main/site/assets/results_per_task.csv
- Tokenizer Quark: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/quark/quark-tokenizer.safetensors
- Tokenizer Atom: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/atom/atom-tokenizer.safetensors
- Tokenizer Molecule: https://huggingface.co/Pan-Junyu/LaBraM-at-Scale/blob/main/molecule/molecule-tokenizer.safetensors
