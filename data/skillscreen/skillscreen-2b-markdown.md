# SkillScreen/SkillScreen-2B-Markdown

## Resumen

SkillScreen-2B-Markdown es un modelo de clasificación de texto especializado en seguridad de agentes de IA. Su tarea concreta es analizar ficheros `SKILL.md` (las definiciones en Markdown que describen las capacidades de un skill de agente) y determinar si ese skill es malicioso. Devuelve, en una única pasada forward, una puntuación de maliciosidad y una decisión de revisión. Lo desarrolla el equipo SkillScreen (Jerrold Huang, Junwei Quan, Saiyue Lyu, Zihan Guo y Yingqiang Ge) y se publica bajo licencia Apache-2.0 como release de despliegue v0.1.0.

El modelo se construye sobre AlexWortega/openjev 2B (una variante Qwen3.5 de 2B parámetros orientada a NLI) mediante un ajuste fino con LoRA de rango 8 y una cabeza de clasificación NLI entrenable. La formulación es de inferencia de lenguaje natural: la hipótesis fija es "This AI agent skill is malicious." y la puntuación es la salida softmax de entailment, no una probabilidad calibrada de forma independiente. El contexto de despliegue es de 8.192 tokens.

Su relevancia actual es práctica: a medida que los agentes ejecutan skills de terceros, la superficie de ataque crece y la revisión manual de cada `SKILL.md` no escala. SkillScreen ofrece un filtro de alta recall que se ejecuta localmente, sin ejecutar el fichero analizado, y con puntos de operación congelados (umbral nativo 0.5 y umbral de recall 99% en OOF de aproximadamente 0,011642) para integrarse en pipelines de revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5 vía AlexWortega/openjev 2B), ajuste fino LoRA rango 8 + cabeza de clasificación NLI |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entradas superiores se truncan conservando la hipótesis) |
| Tipos de cuantizacion | no disponible (release de despliegue en BF16 según requisitos del runtime) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); documentación y predicciones CC BY 4.0 |
| Formato de pesos | safetensors (librería transformers); incluye adaptador LoRA original en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de OpenJev 2B (rama `qwen3.5-2b-nli-v5`), una base de 2B parámetros orientada a NLI. Sobre ella se aplica un ajuste fino de una época con semilla 42, LoRA de rango 8 y una cabeza de clasificación NLI entrenable. Los pesos finales usan los 13.514 registros elegibles de SkillScreen-Data en la revisión fijada; las etiquetas se heredan de benchmarks upstream. La entrada es el Markdown original emparejado con la hipótesis fija, y la salida es el softmax de entailment. El release de despliegue es distinto de los checkpoints de experimento solo-entrenamiento del paper.

La innovación principal no es arquitectónica sino de formulación: convertir la detección de skills maliciosos en una tarea NLI con hipótesis fija, lo que permite una única pasada forward para puntuación y decisión, y definir puntos de operación congelados (nativo 0.5 y alta recall 0,011642) cargados desde `deployment_settings.json`. Las decisiones comparan log-odds crudos de entailment para evitar umbrales redondeados. El entrenamiento se documenta en `training_config.json` y los checksums del release en `checksums.json`.

## Capacidades

- Clasificación binaria de maliciosidad de skills de agente a partir de `SKILL.md`, con puntuación de entailment y decisión de revisión en una pasada.
- Puntos de operación congelados: nativo 0.5 y `high-recall` (99% OOF recall, aproximadamente 0,011642).
- Lectura de ficheros como texto sin ejecución: el scanner nunca ejecuta el contenido analizado.
- Ejecución local del scoring (`scan.py`), con opción `--inspect` para listar ficheros sin cargar el modelo.
- Registro de truncamiento de tokens en el informe cuando la entrada supera 8.192 tokens.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Revisión previa a la instalación de skills de terceros: integrar `scan.py` en el flujo de incorporación de un marketplace de agentes para marcar `SKILL.md` sospechosos antes de que un operador los apruebe, usando el umbral nativo 0.5 para bajo FPR (0,88%).
- Filtro de alta recall en triaje de seguridad: usar el punto `high-recall` (recall 99%, FPR 15,71%) como primera etapa que descarta falsos negativos y deriva el resto a revisión humana, reduciendo el volumen de análisis manual.
- Auditoría de inventarios locales existentes: ejecutar el scanner sobre el ejemplo `examples/local-inventory/SKILL.md` y sobre directorios de skills ya desplegados para detectar definiciones maliciosas introducidas con posterioridad.
- Puerta de CI/CD para repositorios de agentes: añadir el escaneo de ficheros `SKILL.md` como paso de pipeline que falla si la puntuación supera el umbral, con informe `score.json` adjunto al artefacto.
- Monitorización continua de colecciones de skills: reescanear periódicamente catálogos completos y comparar puntuaciones para detectar modificaciones sospechosas en skills previamente benignos.
- Investigación en seguridad de agentes: usar las predicciones OOF incluidas (`evaluation-oof.csv`) y el adaptador LoRA para reproducir el procedimiento de evaluación y ajustar umbrales a nuevas colecciones.

## Benchmarks y rendimiento

Evaluación OOF de tres folds sobre 13.514 skills (7.500 maliciosos, 6.014 benignos):

| Punto de operación | Umbral | Recall | FPR benigno | Precision | F1 |
|---|---:|---:|---:|---:|---:|
| Nativo 0.5 | 0,500000 | 96,96% | 0,88% | 99,28% | 98,10% |
| Recall OOF 99% | 0,011642 | 99,00% | 15,71% | 88,71% | 93,57% |

Métricas agregadas: AUPRC (average precision) 0,9966; AUROC 0,9946. Cada puntuación OOF proviene de un modelo de fold entrenado sin el grupo de contenido de ese skill; los umbrales se seleccionaron sobre predicciones agrupadas y se transfirieron al modelo final reentrenado con todos los registros. Estos resultados describen el procedimiento OOF, no un test independiente del refit final, y recall y FPR pueden cambiar en colecciones nuevas.

## Requisitos de hardware

- Entorno verificado: Linux, Python 3.12 y GPU CUDA con soporte BF16; runtime y límite de contexto completo verificados en A100 80GB.
- VRAM estimada: no disponible de forma explícita; con 2,2B parámetros en BF16 los pesos ocupan aproximadamente 4,4 GB, más overhead de activaciones y runtime (el repo ocupa 4,5 GB).
- GPU recomendadas: A100 80GB (configuración verificada). No se documentan pruebas en H100, RTX 4090 u otras consumer GPU.
- ¿Cabe en consumer GPU? No confirmado por el autor; por tamaño de pesos sería plausible en GPUs con 8-12 GB o más en BF16, pero no hay verificación publicada.
- Despliegue: runtime propio incluido (`scan.py`, `requirements/inference.txt`), librería transformers, descarga vía `huggingface_hub==1.33.0`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base AlexWortega/openjev 2B (Qwen3.5, orientado a NLI) es el punto de partida del ajuste; el release hermano SkillScreen-2B-Package cubre la misma tarea sobre paquetes en lugar de Markdown. No se han publicado comparativas con clasificadores de seguridad de propósito general en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-Markdown | 2,21B | 8.192 | Clasificación de maliciosidad de `SKILL.md` | Apache-2.0 | Hugging Face |
| SkillScreen-2B-Package | no disponible | no disponible | Clasificación de maliciosidad de paquetes | Apache-2.0 | Hugging Face |
| AlexWortega/openjev 2B | 2B (aprox.) | no disponible | NLI (base) | no disponible | Hugging Face |

## Limitaciones y advertencias

- La puntuación es el softmax de entailment, no una probabilidad calibrada de forma independiente; no debe interpretarse como probabilidad absoluta de maliciosidad.
- Una puntuación por debajo del umbral significa ausencia de alerta del modelo, no una certificación de seguridad del skill.
- Los resultados OOF no constituyen un test independiente del modelo final reentrenado; recall y FPR pueden degradarse en colecciones nuevas.
- El punto de alta recall tiene un FPR del 15,71% sobre benignos, lo que genera un volumen relevante de falsos positivos si se usa como único filtro.
- Entradas superiores a 8.192 tokens se truncan conservando la hipótesis, por lo que contenido malicioso al final de ficheros largos podría no evaluarse; el informe registra el truncamiento.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (hipótesis fija en inglés) no está caracterizado.
- Sesgos conocidos: no documentados; las etiquetas se heredan de benchmarks upstream, con el sesgo que ello implique.
- Licencia Apache-2.0 para pesos, código y configuración, con documentación y predicciones en CC BY 4.0; aplican los términos del modelo y dataset upstream (ver `THIRD_PARTY_NOTICES.md`).
- El release de despliegue es distinto de los checkpoints del paper; al reportar resultados debe identificarse esta release concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Markdown
- Modelo hermano (paquetes): https://huggingface.co/SkillScreen/SkillScreen-2B-Package
- Dataset: https://huggingface.co/datasets/SkillScreen/SkillScreen-Data
- Código: https://github.com/JerroldH/SkillScreen
- Release v0.1.0: https://github.com/JerroldH/SkillScreen/releases/tag/v0.1.0
- Paper: https://arxiv.org/abs/2610.17727
- Modelo base: https://huggingface.co/AlexWortega/openjev/tree/a20448012c213128955ca0c693e7c943865cab77/qwen3.5-2b-nli-v5
