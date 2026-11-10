# SkillScreen/SkillScreen-2B-Markdown

## Resumen

SkillScreen-2B-Markdown es un modelo de clasificación de texto (NLI, *natural language inference*) afinado para una tarea muy concreta: determinar si una *skill* de agente de IA escrita en Markdown (`SKILL.md`) es maliciosa. Lo desarrolla el equipo SkillScreen (Jerrold Huang, Junwei Quan, Saiyue Lyu, Zihan Guo y Yingqiang Ge) y se publica como *deployment release* v0.1.0. Resuelve un problema de seguridad emergente: los agentes que ejecutan habilidades de terceros distribuidas como ficheros Markdown necesitan un filtro automático y de alta cobertura antes de cargarlas.

El modelo parte de OpenJev 2B (una variante Qwen 3.5 de 2B orientada a NLI) y se afina con LoRA (rango 8) más una cabeza de clasificación NLI entrenable durante una época. Con 2.213.247.808 parámetros totales y una ventana de contexto de 8.192 tokens, devuelve en una sola pasada directa una puntuación de malignidad y una decisión de revisión. La hipótesis fija es "This AI agent skill is malicious." y la puntuación es la salida softmax de *entailment*, no una probabilidad calibrada de forma independiente.

Su relevancia actual radica en que ofrece puntos de operación congelados y reproducibles (umbral nativo 0,5 y umbral de 99 % de recall OOF en ~0,011642) sobre una evaluación *out-of-fold* de 13.514 skills, con AUPRC 0,9966 y AUROC 0,9946. Es un componente de seguridad, no un modelo generativo de propósito general, y su licencia Apache-2.0 facilita la integración en pipelines de despliegue de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 vía OpenJev 2B) con cabeza de clasificación NLI |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entradas superiores se truncan conservando la hipótesis) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); documentación y predicciones CC BY 4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer de 2B parámetros inicializado desde OpenJev 2B (rama `qwen3.5-2b-nli-v5`) y adaptado mediante LoRA de rango 8 con una cabeza de clasificación NLI entrenable. Se entrena durante una sola época con semilla 42 sobre los 13.514 registros elegibles de SkillScreen-Data en la revisión fijada (`d59aabbd7e0e8d95b464a2d335f36e948577b832`). Las etiquetas se heredan de benchmarks upstream. El release de despliegue incluye los pesos fusionados completos, el adaptador LoRA original y los puntos de operación congelados, y es distinto de los checkpoints de experimento del artículo.

La formulación es de inferencia de lenguaje natural: la entrada es el Markdown original emparejado con la hipótesis fija "This AI agent skill is malicious.", y la puntuación es la salida softmax de *entailment*. Las decisiones comparan el *log-odds* de entailment en bruto para evitar artefactos de redondeo en los umbrales. El informe registra si hubo truncamiento de tokens. No se documentan innovaciones como decodificación especulativa ni atención lineal; la contribución técnica está en el diseño del modelo de decisión y en la transferencia de umbrales desde predicciones OOF al modelo final.

## Capacidades

- Clasificación binaria de malignidad de skills de agente a partir de ficheros `SKILL.md` en Markdown.
- Salida conjunta de puntuación de malignidad y decisión de revisión en una sola pasada directa.
- Dos puntos de operación congelados: umbral nativo 0,5 (alta precisión) y umbral de 99 % de recall OOF (~0,011642, alta cobertura).
- Lectura de ficheros como texto sin ejecución: el escáner nunca ejecuta el contenido analizado.
- Ejecución local del scoring, con opción `--inspect` para listar ficheros sin cargar el modelo.
- Registro de truncamiento de tokens en el informe de salida.
- Cabeza NLI entrenable que permite reformular la hipótesis de clasificación.
- No soporta generación de texto libre, tool calling, agentes multi-step, visión, audio ni modo *thinking*; es un clasificador especializado.

## Casos de uso

- Filtro previo a la carga de skills en plataformas de agentes: antes de instalar un `SKILL.md` de terceros, el modelo puntúa el fichero y bloquea o escala según el umbral elegido; el umbral de alta cobertura (~0,011642) reduce falsos negativos a costa de un 15,71 % de FPR.
- Puerta de seguridad en CI/CD de catálogos de skills: integrado como paso de validación en el pipeline que publica skills, con el umbral nativo 0,5 para mantener un FPR del 0,88 % y precisión del 99,28 %.
- Triaje en equipos de seguridad (SOC): clasificación automática de grandes volúmenes de skills recopiladas, usando el umbral de 99 % de recall para derivar a revisión humana solo los casos sospechosos.
- Auditoría de inventarios locales: el escáner recorre directorios de skills instaladas (`--inspect` para inventariar sin cargar el modelo) y genera un `score.json` por fichero para revisión posterior.
- Investigación en seguridad de agentes: evaluación reproducible de nuevos corpus de skills con puntos de operación congelados y métricas OOF documentadas.
- Monitorización de mercados o repositorios de skills: scoring periódico de skills publicadas para detectar cambios maliciosos en el contenido Markdown.
- Validación de proveedores: comprobación de skills suministradas por terceros antes de incorporarlas a un entorno de producción de agentes.

## Benchmarks y rendimiento

Evaluación *out-of-fold* de tres folds sobre 13.514 skills (7.500 maliciosas y 6.014 benignas):

| Punto de operación | Umbral | Recall | FPR benigno | Precisión | F1 |
|---|---:|---:|---:|---:|---:|
| Nativo 0,5 | 0,500000 | 96,96 % | 0,88 % | 99,28 % | 98,10 % |
| 99 % recall OOF | 0,011642 | 99,00 % | 15,71 % | 88,71 % | 93,57 % |

Métricas globales: AUPRC (*average precision*) 0,9966 y AUROC 0,9946. Cada puntuación OOF proviene de un modelo de fold entrenado sin el grupo de contenido de esa skill; los umbrales se seleccionaron sobre las predicciones agrupadas y se transfirieron al modelo final reentrenado con todos los registros elegibles. Los autores advierten que estos resultados describen el procedimiento OOF, no un test independiente del modelo final, y que recall y FPR pueden variar en colecciones nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos (2,21B parámetros × 2 bytes), más overhead de activaciones y runtime; el repo ocupa 4,5 GB.
- GPU recomendadas: los autores verifican el runtime y el límite de contexto completo en una A100 80GB; cualquier GPU con soporte BF16 y suficiente VRAM debería servir.
- GPU de consumo: con ~4,4 GB de pesos en BF16, cabe en RTX 4090 (24 GB) y en tarjetas de 8-12 GB con margen; en cuantización de 4 bits cabría en GPUs de 6-8 GB, aunque no se documentan cuantizaciones oficiales.
- Entorno verificado: Linux, Python 3.12, CUDA con soporte BF16, `huggingface_hub==1.33.0` y `requirements/inference.txt`.
- Opciones de despliegue: runtime propio del repo (`scan.py`), descarga vía `hf download` con la revisión `v0.1.0`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-Markdown | 2,21B | 8.192 | Clasificación de malignidad de skills (NLI) | Apache-2.0 | Hugging Face, release v0.1.0 |
| OpenJev 2B (base) | ~2B | no disponible | NLI general | no disponible | Hugging Face (`AlexWortega/openjev`) |
| Modelos de clasificación de seguridad genéricos | no disponible | no disponible | Moderación de contenido | variable | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La puntuación es la salida softmax de *entailment*, no una probabilidad calibrada; no debe interpretarse como probabilidad de que la skill sea maliciosa.
- Una puntuación por debajo del umbral significa "sin alerta del modelo", no una certificación de seguridad.
- Las entradas de más de 8.192 tokens se truncan (conservando la hipótesis), lo que puede ocultar contenido malicioso en la parte truncada; el informe registra el truncamiento.
- Los resultados OOF no constituyen un test independiente del modelo final; recall y FPR pueden cambiar en colecciones nuevas.
- El umbral de alta cobertura implica un FPR del 15,71 %, con la consiguiente carga de revisión manual.
- Sesgos conocidos: no disponibles; las etiquetas se heredan de benchmarks upstream, por lo que los sesgos de esos conjuntos se propagan.
- Idiomas soportados: no disponibles; el rendimiento en skills en idiomas distintos del inglés no está documentado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el clasificador puede producir falsos positivos y falsos negativos; se recomienda combinarlo con revisión humana.
- Licencia: Apache-2.0 para pesos, código y configuración de los contribuyentes; documentación y predicciones bajo CC BY 4.0; se aplican los términos del modelo y dataset upstream (ver `THIRD_PARTY_NOTICES.md`).
- El modelo está diseñado exclusivamente para ficheros `SKILL.md`; su uso fuera de ese dominio no está validado.
- Requiere citar el artículo SkillScreen y identificar este release de despliegue al reportar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Markdown
- Modelo Package (variante): https://huggingface.co/SkillScreen/SkillScreen-2B-Package
- Dataset: https://huggingface.co/datasets/SkillScreen/SkillScreen-Data
- Código: https://github.com/JerroldH/SkillScreen
- Artículo: https://arxiv.org/abs/2610.17727
- Modelo base OpenJev: https://huggingface.co/AlexWortega/openjev/tree/a20448012c213128955ca0c693e7c943865cab77/qwen3.5-2b-nli-v5
- Configuración de entrenamiento: `training_config.json` (en el repo)
- Configuración de despliegue: `deployment_settings.json` (en el repo)
- Predicciones OOF: `evaluation-oof.csv` (en el repo)
- Métricas completas: `evaluation.json` (en el repo)
- Checksums del release: `checksums.json` (en el repo)
- Citación: `CITATION.cff` (en el repo)
