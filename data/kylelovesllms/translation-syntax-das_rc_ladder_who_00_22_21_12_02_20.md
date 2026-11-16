# kylelovesllms/translation-syntax-das_rc_ladder_who_00_22_21_12_02_20

## Resumen

`kylelovesllms/translation-syntax-das_rc_ladder_who_00_22_21_12_02_20` no es un modelo de lenguajes de propósito general, sino un repositorio de respaldo (backup) de los artefactos de un experimento de investigación en lingüística computacional. Concretamente, contiene los checkpoints, métricas de entrenamiento, evaluaciones y análisis de cinco ejecuciones del proyecto `tbd-syntax`, alojado en GitHub bajo el repositorio `Ky-Ng/tbd-syntax`, en la rama `backup/2026-11-15-working-tree`. El experimento se denomina `exp_rc_ladder_relativizer_fix_train_00_22_21_12_02_20` y aborda el estudio de cláusulas de relativo y relativizadores mediante un enfoque de escalera (ladder) sobre modelos GPT-2 de tamaño reducido.

Los checkpoints subidos están en formato Hugging Face (config.json, model.safetensors y tokenizer) y corresponden a la configuración `gpt2-4l2h256d`: un transformer de tipo GPT-2 con 4 capas, 2 cabezas de atención y dimensión oculta de 256. Se entrenaron cinco ejecuciones con semillas 42 a 46, y según la tabla de la model card ninguna de ellas figura como finalizada (`finished: no`). El estado del optimizador (`resume/`) no se ha subido.

El interés de este repositorio es fundamentalmente metodológico y reproductivo: sirve como instantánea de resultados intermedios para quien quiera auditar o reproducir el experimento. No está pensado como modelo para producción, ni dispone de licencia declarada, idiomas soportados ni pipeline de inferencia definidos en la información disponible. El tamaño total del repositorio es de 0,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (configuración `gpt2-4l2h256d`) |
| Parámetros totales | no disponible (configuración de 4 capas, 2 cabezas, dimensión 256; el recuento exacto no figura en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face: `config.json`, `model.safetensors`, tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, en una variante muy pequeña identificada como `gpt2-4l2h256d`: 4 capas, 2 cabezas de atención y dimensión oculta de 256. Cada carpeta de ejecución contiene checkpoints por paso (`checkpoints/stepNNNNNN/`), un `run_config.json`, un `metrics.csv`, directorios `evals/` y `analysis/`, y el informe de la ejecución cuando está presente. El estado del optimizador (`resume/`) no se ha incluido en la subida.

El propósito del entrenamiento, según el nombre del experimento (`exp_rc_ladder_relativizer_fix_train`), es el estudio de cláusulas de relativo (RC, relative clauses) y relativizadores dentro del proyecto `tbd-syntax`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles. Las cinco ejecuciones (semillas 42 a 46) figuran como no finalizadas, por lo que los checkpoints representan estados intermedios de entrenamiento y no modelos convergidos.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2, limitada por el tamaño reducido del modelo (4 capas, dimensión 256).
- Modelado de fenómenos sintácticos concretos relacionados con cláusulas de relativo y relativizadores, objeto del experimento `rc_ladder`.
- Evaluación y análisis reproducibles: el repositorio incluye `metrics.csv`, `evals/` y `analysis/` para cada ejecución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de sintaxis: el repositorio permite descargar los checkpoints intermedios de las cinco semillas y comparar las métricas registradas en `metrics.csv` con las de una nueva ejecución del mismo `run_config.json`.
- Auditoría de resultados de investigación: los directorios `evals/` y `analysis/` permiten verificar las evaluaciones reportadas en el proyecto `tbd-syntax` sin reentrenar.
- Estudio de estabilidad entre semillas: al disponer de las semillas 42 a 46 con la misma configuración, se puede analizar la varianza de los resultados entre inicializaciones.
- Docencia y experimentación de bajo coste: un modelo de 4 capas y dimensión 256 se puede cargar y ejecutar en CPU o en GPU de consumo, lo que lo hace adecuado para prácticas sobre entrenamiento y evaluación de transformers.
- Desarrollo de metodología de evaluación lingüística: sirve como base para diseñar y probar protocolos de evaluación de fenómenos sintácticos antes de escalarlos a modelos mayores.
- Archivo y trazabilidad: funciona como instantánea congelada del estado del árbol de trabajo del proyecto en la fecha `2026-11-15`, útil para citar resultados en publicaciones o informes internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica el estado de finalización de cada ejecución (`finished: no` para las cinco semillas) y remite a `metrics.csv` y `evals/` dentro del repositorio, sin cifras agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,3 GB, que incluye múltiples checkpoints y artefactos) y la configuración de 4 capas y dimensión 256, cada checkpoint individual es muy pequeño y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para un modelo de esta escala; no se dispone de recomendaciones específicas en la información.
- GPU de consumo: previsiblemente cabe en GTX 1060, RTX 3060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: al estar en formato Hugging Face (`config.json`, `model.safetensors`, tokenizer), es cargable con `transformers`; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado ni validado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`gpt2-4l2h256d`) | Configuración 4 capas / 2 cabezas / 256 dim; recuento exacto no disponible | no disponible | No finalizado; sin benchmarks publicados | no disponible | Hugging Face (repo de 0,3 GB) |
| GPT-2 small (referencia de la familia) | 124 M | 1024 tokens | Benchmarks públicos de GPT-2 | MIT (según la publicación original) | Hugging Face |
| GPT-2 medium (referencia de la familia) | 355 M | 1024 tokens | Benchmarks públicos de GPT-2 | MIT (según la publicación original) | Hugging Face |

La comparación con GPT-2 small y medium se ofrece únicamente como referencia de familia arquitectónica; este repositorio es un artefacto de investigación con entrenamiento incompleto y no es directamente comparable en rendimiento. No se dispone de otros modelos comparables específicos para la tarea de relativizadores en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: las cinco ejecuciones figuran como `finished: no`, por lo que los checkpoints son estados intermedios y no deben tratarse como modelos finales.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- Sin idiomas declarados: no se indica qué lenguas cubre el entrenamiento, lo que limita cualquier evaluación multilingüe.
- Sin pipeline definido: el campo `pipeline` no está disponible, por lo que la integración con herramientas de inferencia automática no está garantizada.
- Riesgo de alucinación: inherente a cualquier modelo generativo; con un modelo de esta escala y entrenamiento parcial, la calidad de generación será muy limitada.
- Sesgos: no documentados en la información disponible; al no conocerse la composición del dataset, no se pueden evaluar sesgos de dominio ni lingüísticos.
- Estado del optimizador ausente: `resume/` no se ha subido, lo que impide reanudar el entrenamiento exactamente desde el punto de interrupción.
- Uso en producción: no recomendado; el repositorio está orientado a reproducibilidad y auditoría de investigación, no a despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-das_rc_ladder_who_00_22_21_12_02_20
- Repositorio del proyecto (rama de respaldo): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-15-working-tree/src/das/exp_rc_ladder_relativizer_fix_train_00_22_21_12_02_20
- Repositorio principal del proyecto: https://github.com/Ky-Ng/tbd-syntax
