# kylelovesllms/translation-syntax-das_fit_cells_00_22_on_rc_ladder_who_00_22_21_12_02

## Resumen

Este repositorio contiene una copia de seguridad de los artefactos de entrenamiento del proyecto tbd-syntax, en concreto de los experimentos `exp_fit_cells_00_22_on_rc_ladder_relativizer_fix_train_00_22_21_12_02`. No se trata de un modelo publicado para uso general, sino de un volcado de checkpoints intermedios de investigación sobre mecánica interpretable (DAS, *Distributed Alignment Search*) aplicada a tareas de sintaxis. El autor, kylelovesllms, sube los pesos en formato Hugging Face (config.json, model.safetensors y tokenizer) para cada paso de entrenamiento.

Los modelos subyacentes son GPT-2 de configuración reducida (4 capas, 2 cabezas de atención, dimensión 256), entrenados con tres semillas distintas (s42, s44 y s46) y, según la model card, ninguno de los tres runs aparece como finalizado. El repositorio no incluye el estado del optimizador (`resume/`), lo que impide reanudar el entrenamiento de forma exacta desde los checkpoints publicados.

Por tanto, la relevancia de este repositorio es exclusivamente de reproducibilidad y análisis de experimentos de interpretabilidad, no la de un modelo listo para producción. No hay información sobre licencia, idiomas, pipeline ni métricas finales publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only), configuración reducida 4 capas / 2 cabezas / d=256 |
| Parametros totales | no disponible (no se publica el recuento; por configuración GPT-2 4L2H256d es del orden de millones, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato HF: config.json, model.safetensors, tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 de tamaño reducido con 4 capas, 2 cabezas de atención y dimensión de modelo 256, según los nombres de los runs (`gpt2-4l2h256d-s42`, `s44`, `s46`). Se entrenaron tres réplicas con semillas distintas dentro del proyecto tbd-syntax, en el experimento `fit_cells_00_22_on_rc_ladder_relativizer_fix_train_00_22_21_12_02`. Cada carpeta de run contiene `checkpoints/stepNNNNNN/`, `run_config.json`, `metrics.csv`, `evals/`, `analysis/` y, cuando existe, el informe del run.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. El contexto del proyecto (DAS, *Distributed Alignment Search*, y tareas de sintaxis como *relative clauses* y *ladder*) sugiere un entrenamiento orientado a experimentos de interpretabilidad sobre estructuras sintácticas, pero este extremo no se detalla en la información proporcionada. Los tres runs figuran como no finalizados.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 pequeño, sin ajuste por instrucciones documentado.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio).
- Uso previsto: análisis de representaciones internas y experimentos de interpretabilidad, no inferencia de propósito general.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar los checkpoints `stepNNNNNN` y ejecutar las rutinas de `analysis/` y `evals/` del proyecto tbd-syntax para replicar los resultados de DAS sobre las tareas de sintaxis.
- Auditoría de entrenamiento: usar `metrics.csv` y `run_config.json` para comparar la evolución de la pérdida entre las semillas s42, s44 y s46 y detectar inestabilidades.
- Estudio de alineamiento distribuido: emplear los pesos intermedios para entrenar y evaluar subespacios de activación (DAS) sobre estructuras como cláusulas de relativo.
- Docencia e investigación en mecánica interpretable: servir como material de partida para cursos o prácticas sobre análisis de circuitos en transformers pequeños.
- Análisis de sensibilidad a semilla: comparar los tres runs para medir la varianza de los hallazgos interpretativos según la inicialización.
- Referencia de formato de artefactos: usar la estructura de carpetas (`checkpoints/`, `evals/`, `analysis/`) como plantilla para organizar experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja por el tamaño reducido del modelo (4 capas, d=256); no se dispone de cifra oficial. Un GPT-2 de esta configuración ocupa del orden de decenas de MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; también CPU es viable para inferencia y análisis.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo actual (RTX 3060 en adelante e incluso integradas).
- Opciones de despliegue: carga directa con `transformers` y `safetensors`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 4L2H256d, runs de investigación) | no disponible (configuración reducida) | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente usado |
| GPT-2 distilado / variantes pequeñas de la comunidad | variable | variable | variable | Hugging Face |

La comparación es solo orientativa: este repositorio no es un modelo publicado para uso general y carece de métricas que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Repositorio de artefactos de investigación, no un modelo listo para producción.
- Los tres runs figuran como no finalizados, por lo que los checkpoints pueden estar en estados intermedios de entrenamiento.
- No se incluye el estado del optimizador (`resume/`), lo que impide reanudar el entrenamiento de forma exacta.
- Licencia no especificada: no hay autorización explícita para uso comercial.
- Idiomas soportados no documentados; el modelo probablemente se entrenó en un dominio sintáctico acotado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Sin benchmarks publicados; no se puede afirmar nada sobre su calidad en tareas generales.
- Tamaño del repo de 0.0 GB y 0 descargas: posiblemente los pesos no estén completos o el repositorio esté vacío o en preparación.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-das_fit_cells_00_22_on_rc_ladder_who_00_22_21_12_02
- Repositorio fuente (tbd-syntax): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-15-working-tree/src/das/exp_fit_cells_00_22_on_rc_ladder_relativizer_fix_train_00_22_21_12_02
