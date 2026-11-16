# kylelovesllms/translation-syntax-rc_ladder_who_00_11_22-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_who_00_11_22-75000` es un repositorio de artefactos de entrenamiento, no un modelo publicado para uso general. Contiene una coleccion de checkpoints de modelos GPT-2 de tamano muy reducido, generados en el marco del proyecto de investigacion `tbd-syntax`, cuyo objetivo es estudiar fenomenos sintacticos de relativizacion en tareas de traduccion ingles-japones. El autor, `kylelovesllms`, sube cada ejecucion completa del experimento `exp_rc_ladder_relativizer_fix_train_00_11_22` como respaldo reproducible.

Los modelos incluidos siguen la nomenclatura `gpt2-4l2h256d` y `gpt2-4l4h256d`, lo que indica 4 capas, entre 2 y 4 cabezas de atencion y una dimension de embedding de 256. Se trata, por tanto, de modelos de juguete (del orden de millones de parametros, no de miles de millones) disenados para analisis controlado de hipotesis linguisticas, no para despliegue en produccion. El repositorio ocupa 2,3 GB, principalmente por la acumulacion de checkpoints por paso de entrenamiento.

La relevancia de esta ficha es limitada fuera del ambito de la investigacion en linguistica computacional: no hay model card con especificaciones de uso, no se declara licencia, no se declaran idiomas y no se reportan benchmarks estandar. Cualquier evaluacion de capacidades generales debe hacerse con extrema cautela, ya que el modelo no fue entrenado para ello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), configuraciones de 4 capas |
| Parametros totales | no disponible (por configuracion: 4 capas, 2-4 cabezas, d_model=256; orden de millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (datos de entrenamiento en ingles y japones segun el dataset asociado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2 estandar en formato Hugging Face, con variantes de 4 capas y dimension de embedding 256, y dos configuraciones de cabezas de atencion (2 y 4). Cada ejecucion se entrena con cinco semillas distintas (s42 a s46), lo que permite analizar la variabilidad entre inicializaciones. Los checkpoints se guardan por paso (`checkpoints/stepNNNNNN/`) e incluyen `run_config.json`, `metrics.csv`, directorios `evals/` y `analysis/`, y el informe de ejecucion cuando existe. El estado del optimizador (`resume/`) no se sube al repositorio.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_11_22-filled`, vinculado a un experimento sobre construcciones relativas (`rc_ladder`) y un arreglo del relativizador (`relativizer_fix`) en traduccion ingles-japones. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el contexto de investigacion sugiere entrenamiento supervisado sobre una tarea linguistica acotada. No se documentan innovaciones tecnicas mas alla de la propia infraestructura de experimentacion reproducible.

## Capacidades

- Generacion de texto en el dominio restringido de la tarea de relativizacion sintactica ingles-japones.
- Modelado de secuencias con GPT-2 como base, sin capacidades generales verificadas.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al par ingles-japones del dataset de entrenamiento, sin garantias.
- No se documentan modos especiales (thinking, vision, audio).
- Los checkpoints permiten analisis de representaciones internas y de evolucion por paso de entrenamiento.

## Casos de uso

- Investigacion en linguistica computacional: analisis de como un transformer pequeno aprende construcciones relativas en traduccion ingles-japones, comparando las cinco semillas por configuracion.
- Reproducibilidad de experimentos: el repositorio sirve como respaldo de todas las ejecuciones del experimento `exp_rc_ladder_relativizer_fix_train_00_11_22`, permitiendo reanudar analisis sin reentrenar.
- Estudio de variabilidad entre semillas: las ejecuciones s42-s46 con dos configuraciones de cabezas permiten medir la sensibilidad de los resultados a la inicializacion.
- Analisis de curvas de aprendizaje: los `metrics.csv` y los checkpoints por paso facilitan trazar la evolucion de metricas durante el entrenamiento.
- Docencia y prototipado de pipelines: modelos de pocos millones de parametros que caben en cualquier GPU consumer y permiten experimentar con tecnicas de analisis de representaciones.
- Auditoria de metodologia: el repositorio documenta configuraciones, evaluaciones e informes, util para revisar practicas de experimentacion en proyectos de sintaxis.
- Base para ablaciones controladas: la estructura por capas y cabezas permite estudiar el efecto de la capacidad del modelo en la tarea linguistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB por checkpoint dado el tamano reducido (4 capas, d_model=256); no se dispone de cifra exacta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien CPU.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: carga directa con `transformers` desde el checkpoint en formato Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (gpt2-4l2h256d / gpt2-4l4h256d) | orden de millones (no disponible) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | benchmarks publicados por OpenAI | MIT (pesos originales) | amplia |
| DistilGPT-2 (referencia de modelo pequeno) | 82 M | 1024 tokens | benchmarks publicados | Apache 2.0 | amplia |

La comparacion con GPT-2 small y DistilGPT-2 es solo estructural: este repositorio no es un modelo de proposito general y no se han publicado metricas comparables. Cualquier uso fuera del ambito de investigacion sintactica carece de base empirica.

## Limitaciones y advertencias

- No se declara licencia; el uso comercial queda sin marco legal claro y debe consultarse con el autor.
- No hay model card con instrucciones de uso, limitaciones o sesgos documentados.
- Los sesgos conocidos no estan documentados; al entrenarse sobre un dataset linguistico acotado, es probable que herede sesgos del corpus, pero no hay evidencia publicada.
- Riesgo de alucinacion: alto fuera del dominio de entrenamiento, dado el tamano minimo y la especializacion de la tarea.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni cobertura idiomatica; el dataset sugiere solo ingles-japones.
- No apto para produccion: los checkpoints son artefactos de investigacion, no modelos desplegables.
- El repositorio incluye multiples checkpoints por paso; seleccionar el adecuado requiere leer `run_config.json` y `metrics.csv`, y el estado del optimizador no esta disponible para reanudar entrenamiento.
- No se han publicado evaluaciones estandar (MMLU, HumanEval, GSM8K) ni resultados comparativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_who_00_11_22-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_11_22-filled
- Codigo fuente del proyecto (rama de respaldo): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-15-working-tree/src/training/exp_rc_ladder_relativizer_fix_train_00_11_22
