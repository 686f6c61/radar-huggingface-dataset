# kylelovesllms/translation-syntax-das_address_subspaces_on_rc_ladder_who_00_22_21_12_02_20

## Resumen

`kylelovesllms/translation-syntax-das_address_subspaces_on_rc_ladder_who_00_22_21_12_02_20` es un repositorio de artefactos de investigación publicado en Hugging Face por el usuario `kylelovesllms`. No se trata de un modelo entrenado para uso general, sino de una copia de seguridad (backup) de los resultados de varios experimentos del proyecto `tbd-syntax`, concretamente del experimento `exp_address_subspaces_on_rc_ladder_relativizer_fix_train_00_22_21_12_02_20`. El contenido son checkpoints intermedios de modelos GPT-2 de configuración reducida (4 capas, 2 cabezas de atención, dimensión 256) entrenados con distintas semillas.

El propósito del repositorio es preservar los artefactos de entrenamiento (checkpoints en formato Hugging Face, configuraciones de ejecución, métricas, evaluaciones y análisis) de cuatro ejecuciones identificadas como `gpt2-4l2h256d-s42`, `s43`, `s44` y `s46`. Según la model card, ninguna de las cuatro ejecuciones aparece como finalizada. El repositorio no incluye el estado del optimizador (carpeta `resume/`), por lo que no está pensado para reanudar entrenamientos, sino como archivo de resultados.

Por su naturaleza, este repositorio no es un modelo listo para producción ni para evaluación comparativa de capacidades generales. Es material de investigación lingüística computacional, probablemente relacionado con análisis de subespacios de representación (DAS, *Distributed Alignment Search*) aplicados a estructuras sintácticas como las relativas y las *RC ladders* (escaleras de cláusulas relativas). No hay información sobre licencia, idiomas o pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | no disponible (configuración 4 capas, 2 cabezas, dimensión 256; recuento exacto no publicado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints en formato Hugging Face con `config.json`, `model.safetensors` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2 en su implementación estándar de Hugging Face, con una configuración reducida: 4 capas, 2 cabezas de atención y dimensión de modelo 256 (identificada en los nombres de ejecución como `4l2h256d`). Se trata de modelos pequeños, diseñados para experimentos controlados de interpretabilidad y análisis de representaciones, no para rendimiento en tareas generales.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card menciona que cada carpeta de ejecución contiene `run_config.json`, `metrics.csv`, `evals/` y `analysis/`, lo que sugiere un pipeline de experimentación con evaluación y análisis de subespacios de activación. El nombre del experimento (`address_subspaces_on_rc_ladder_relativizer_fix_train`) apunta a un estudio de DAS sobre representaciones de cláusulas relativas y relativizadores, con una corrección (`relativizer_fix`) aplicada al pipeline de entrenamiento. No se documenta ninguna innovación arquitectónica más allá de la configuración reducida de GPT-2.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 pequeño, limitada por su tamaño y por el carácter experimental del entrenamiento.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se documenta el corpus de entrenamiento.
- No se documentan capacidades especiales (thinking mode, visión, audio).
- Los checkpoints están pensados para análisis de representaciones internas (subespacios, activaciones), no para uso como modelo de propósito general.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar los checkpoints con `transformers` para inspeccionar activaciones y subespacios en las capas del modelo, replicando el análisis del proyecto `tbd-syntax`.
- Estudio de DAS (*Distributed Alignment Search*): utilizar los checkpoints como base para entrenar y evaluar hipótesis de subespacios de representación sobre estructuras sintácticas.
- Análisis de cláusulas relativas: emplear las ejecuciones con distintas semillas (`s42`, `s43`, `s44`, `s46`) para medir la variabilidad entre inicializaciones en las métricas registradas en `metrics.csv`.
- Docencia e investigación en lingüística computacional: modelo pequeño y de bajo coste computacional para prácticas de análisis de representaciones en un entorno controlado.
- Comparación de estabilidad entre semillas: las cuatro ejecuciones permiten estudiar la robustez de los resultados de análisis frente a la inicialización aleatoria.
- Auditoría de pipelines de experimentación: revisar `run_config.json`, `evals/` y los informes de ejecución para entender la configuración exacta y detectar posibles fallos (ninguna ejecución figura como finalizada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un GPT-2 de 4 capas y dimensión 256 ocupa del orden de decenas de megabytes en precisión completa, aunque el recuento exacto de parámetros no está publicado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM (incluso integradas).
- Opciones de despliegue: `transformers` (carga directa de los checkpoints), y en principio `llama.cpp`/`Ollama` si se convierte a GGUF, aunque no se documenta dicha conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 4l2h256d) | no disponible (configuración reducida) | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (referencia) | 124 M | 1024 tokens | MIT | Hugging Face |
| GPT-2 distilado (referencia) | ~82 M | 1024 tokens | MIT | Hugging Face |

La comparación con GPT-2 small y variantes distiladas es solo orientativa por arquitectura; este repositorio no es un modelo publicado con fines de uso general y no dispone de métricas comparables.

## Limitaciones y advertencias

- No es un modelo de propósito general: son checkpoints de investigación, varios de ellos sin entrenamiento finalizado.
- Sesgos conocidos: no documentados; al derivar de GPT-2, podría heredar sesgos del corpus original, pero no se especifica el dataset de entrenamiento.
- Riesgo de alucinación: alto en cualquier uso generativo, dado el tamaño reducido y el entrenamiento experimental.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial permitido.
- Caveat para producción: no se incluye el estado del optimizador (`resume/`), no hay pipeline definido y ninguna ejecución figura como completada; no debe usarse como base para sistemas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-das_address_subspaces_on_rc_ladder_who_00_22_21_12_02_20
- Repositorio de origen (GitHub): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-15-working-tree/src/das/exp_address_subspaces_on_rc_ladder_relativizer_fix_train_00_22_21_12_02_20
