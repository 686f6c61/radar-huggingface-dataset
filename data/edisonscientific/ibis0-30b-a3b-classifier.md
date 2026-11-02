# EdisonScientific/Ibis0-30B-A3B-Classifier

## Resumen

Ibis0-30B-A3B-Classifier es un modelo de clasificación científica desarrollado por EdisonScientific, un fine-tune de Qwen3-30B-A3B (arquitectura MoE de 30.220.959.745 parámetros totales) al que se le ha añadido una cabeza escalar sobre el último token y se ha entrenado con entropía cruzada binaria. Su tarea es concreta: recibe una hipótesis biológica junto con un conjunto de resultados experimentales en forma de "stubs" de evidencia (asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación Tahoe-100M) y devuelve la probabilidad de que una medición no vista respalde dicha hipótesis.

El modelo se entrena sobre el dataset EDB-Bio v1.0.0 y se publica con cuatro ramas: `main` (entrenada con los tres dominios) y tres ramas leave-one-domain-out (`holdout-tahoe`, `holdout-depmap`, `holdout-gwas`) que permiten evaluar la transferencia entre dominios experimentales. Esta estructura lo convierte en una herramienta de evaluación de razonamiento científico más que en un generador de texto al uso.

Es relevante ahora porque aborda una pregunta abierta en la literatura: si los modelos de lenguaje saben reconocer qué constituye evidencia científica convincente. La ficha acompaña al paper "Do Language Models Know What Compelling Scientific Evidence Looks Like?" y al repositorio de código `EdisonScientific/ibis0`, que contiene el pipeline de construcción de prompts y la evaluación sobre el test set publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-30B-A3B) con cabeza de clasificación escalar sobre el último token |
| Parámetros totales | 30.220.959.745 |
| Parámetros activos | no disponible (el modelo base Qwen3-30B-A3B es MoE; el número exacto de activos no se indica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card solo menciona pesos en bf16 para inferencia) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-30B-A3B, un transformer con mezcla de expertos, y le añade una cabeza lineal escalar que se aplica sobre el último token de la secuencia. La salida se interpreta mediante una sigmoide como probabilidad de que la evidencia presentada respalde la hipótesis. La arquitectura concreta está definida en `modeling_ibis0.py` dentro del repositorio del modelo, por lo que la carga exige `trust_remote_code=True`. El entrenamiento usa entropía cruzada binaria sobre el dataset EDB-Bio v1.0.0, compuesto por episodios que combinan hipótesis y stubs de evidencia de tres fuentes: asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación de Tahoe-100M.

Las cuatro ramas publicadas corresponden a distintos regímenes de entrenamiento: `main` con los tres dominios (paso 2400), `holdout-tahoe` sin Tahoe (paso 1700), `holdout-depmap` sin DepMap (paso 1300) y `holdout-gwas` sin GWAS (paso 1800). Estas ramas leave-one-domain-out sustentan los resultados de transferencia del paper. El pipeline de construcción de prompts vive en el repositorio `EdisonScientific/ibis0`, que incluye los paquetes `ibis_env_utils`, `tahoe_meta`, `gwas_meta` y `depmap_meta` para renderizar los episodios en los mensajes de sistema y usuario usados durante el entrenamiento. La inferencia en bf16 con MoE no es determinista bit a bit: evaluaciones repetidas del mismo checkpoint difieren por episodio (desviación típica del logit de aproximadamente 0,2–0,4), aunque las métricas agregadas coinciden estrechamente.

## Capacidades

- Clasificación binaria de hipótesis biológicas: devuelve una probabilidad calibrada de que una medición retenida respalde la hipótesis planteada.
- Razonamiento sobre evidencia científica heterogénea: integra asociaciones genómicas (GWAS), dependencias genéticas (DepMap CRISPR) y respuestas a perturbaciones (Tahoe-100M) en un único episodio.
- Evaluación de transferencia entre dominios mediante las ramas leave-one-domain-out.
- Procesamiento de prompts con plantilla de chat de Qwen3 (`apply_chat_template`), con opción de desactivar el modo thinking (`enable_thinking=False`).
- Soporte de atención con FlashAttention 2 (`attn_implementation="flash_attention_2"`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni generación de texto libre; el modelo está especializado en la tarea de clasificación.

## Casos de uso

- Priorización de hipótesis en descubrimiento de fármacos: dado un conjunto de hipótesis biológicas y la evidencia experimental disponible, el clasificador puntúa cada una para ordenar los experimentos de validación y concentrar recursos en las más prometedoras.
- Triaje de resultados de cribados CRISPR: integrando datos de DepMap, el modelo estima si una asociación gen-dependencia observada es consistente con la hipótesis de partida, útil para filtrar hits antes de validación húmeda.
- Validación cruzada de asociaciones GWAS: el modelo permite contrastar si una asociación del GWAS Catalog constituye evidencia convincente para una hipótesis concreta, ayudando a discriminar señales robustas de artefactos.
- Análisis de experimentos de perturbación a gran escala: con los datos de Tahoe-100M, se puede puntuar si la respuesta transcripcional observada bajo una perturbación respalda la hipótesis mecanística planteada.
- Evaluación de pipelines de razonamiento científico: sirve como componente de referencia para medir si otros sistemas (LLM generativos, agentes) producen conclusiones alineadas con la evidencia, usando las ramas holdout para testear generalización.
- Investigación metodológica en calibración: al estar entrenado con BCE y publicar probabilidades, es adecuado para estudiar calibración de modelos científicos y la fiabilidad de sus puntuaciones por dominio.
- Filtrado en revisiones sistemáticas asistidas: puede emplearse para priorizar qué combinaciones hipótesis-evidencia merecen revisión manual por parte de expertos, reduciendo el volumen de candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en bf16 de aproximadamente 61 GB, según la model card; se recomienda una GPU de 80 GB o superior.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, cualquier acelerador con al menos 80 GB de VRAM para bf16.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, etc.) en bf16; no se documentan opciones de cuantización en la información disponible.
- Requiere Linux y una GPU CUDA para ejecutar el clasificador localmente.
- Despliegue mediante `transformers` con `AutoModelForSequenceClassification`, `trust_remote_code=True`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"`.
- El repositorio ocupa 241,8 GB, por lo que conviene prever espacio en disco suficiente para la descarga.
- No se documentan latencia ni throughput estimados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ibis0-30B-A3B-Classifier | 30.220.959.745 | no disponible | Clasificación de hipótesis biológicas | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-30B-A3B (base) | 30B (MoE) | no disponible | Generación de texto general | Apache-2.0 | HuggingFace |
| Alternativas especializadas en clasificación científica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros clasificadores científicos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- La inferencia en bf16 con MoE no es determinista bit a bit: las puntuaciones por episodio varían (desviación típica del logit de aproximadamente 0,2–0,4), aunque las métricas agregadas son estables.
- Requiere `trust_remote_code=True` y código externo (`ibis0`, `ibis_env_utils`, `tahoe_meta`, `gwas_meta`, `depmap_meta`) para construir los prompts; no es un modelo autocontenido de uso directo.
- Dependencia de Linux y GPU CUDA; no se documenta soporte para CPU ni para despliegue ligero.
- Es un clasificador especializado: no genera texto, no soporta tool calling ni agentes, y su uso fuera del dominio de evidencia biológica (GWAS, DepMap, Tahoe) no está validado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente fuera de la distribución de entrenamiento; las ramas holdout existen precisamente para medir la transferencia entre dominios.
- No se documentan sesgos específicos, pero al derivar de Qwen3-30B-A3B puede heredar sesgos del corpus de preentrenamiento del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-30B-A3B, también Apache-2.0.
- El repositorio es muy grande (241,8 GB) y las descargas registradas son 0 en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdisonScientific/Ibis0-30B-A3B-Classifier
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Dataset EDB-Bio: https://huggingface.co/datasets/EdisonScientific/EDB-Bio
- Repositorio de código: https://github.com/EdisonScientific/ibis0
- Script de evaluación: https://github.com/EdisonScientific/ibis0/blob/main/scripts/export/predict_classifier.py
- Paquete `ibis_env_utils`: https://github.com/EdisonScientific/ibis0/tree/main/envs/ibis_env_utils
- Paquete `tahoe_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/tahoe_meta
- Paquete `gwas_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/gwas_meta
- Paquete `depmap_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/depmap_meta
- Paper: no disponible (la model card incluye un marcador `ARXIV_URL` sin resolver)
