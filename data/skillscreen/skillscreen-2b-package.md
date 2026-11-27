# SkillScreen/SkillScreen-2B-Package

## Resumen

SkillScreen-2B-Package es un modelo de clasificación de texto especializado en la detección de habilidades (skills) maliciosas para agentes de IA. Lo desarrolla SkillScreen (Jerrold Huang, Junwei Quan, Saiyue Lyu, Zihan Guo y Yingqiang Ge) y se presenta como un modelo de decisión que analiza paquetes de skills compuestos por un fichero `SKILL.md` y textos de soporte (código, configuración, documentación) para devolver, en un único forward pass, una puntuación de malicia y una decisión de revisión.

El modelo parte de OpenJev 2B (AlexWortega/openjev, una variante NLI de Qwen 3.5 de 2B) y se afina mediante LoRA de rango 8 con una cabeza de clasificación NLI entrenable. Cuenta con 2.213.247.808 parámetros totales, un contexto de 32.768 tokens y se distribuye con licencia Apache-2.0. La relevancia actual reside en la seguridad de agentes: a medida que los agentes ejecutan skills de terceros, disponer de un cribado local, rápido y de alto recall antes de ejecutar código resulta crítico.

El modelo se publica como release de despliegue v0.1.0 e incluye pesos fusionados completos, el adaptador LoRA original y los puntos de operación congelados, junto con el runtime de inferencia. Está orientado a integrarse en pipelines de revisión de paquetes de skills, no como un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.5 2B vía OpenJev) con cabeza de clasificación NLI |
| Parametros totales | 2.213.247.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, código y configuración); documentación y predicciones CC BY 4.0 |
| Formato de pesos | safetensors (transformers); incluye adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo se inicializa desde OpenJev 2B (checkpoint `qwen3.5-2b-nli-v5` de AlexWortega/openjev), un transformer decoder-only de 2B parámetros orientado a inferencia de lenguaje natural. Sobre esa base se añade una cabeza de clasificación NLI entrenable y se aplica un ajuste fino con LoRA de rango 8 durante una época con semilla 42. La hipótesis fija del NLI es "This AI agent skill is malicious." y la puntuación de salida es el softmax de entailment, no una probabilidad calibrada de forma independiente.

El entrenamiento utiliza los 11.831 registros elegibles del dataset SkillScreen-Data en la revisión fijada (`d59aabbd...`), con etiquetas heredadas de benchmarks upstream. El texto del paquete se ordena por prioridad: `SKILL.md`, código, configuración, documentación y texto masivo. Los inputs que superan los 32.768 tokens se truncan conservando la hipótesis. La evaluación reportada es out-of-fold (tres folds), con cada puntuación OOF generada por un modelo de fold entrenado sin el grupo de contenido de esa skill; los umbrales se seleccionan sobre predicciones agrupadas y se transfieren al modelo final reentrenado con todos los registros.

## Capacidades

- Clasificación binaria de malicia de paquetes de skills de agentes (score de entailment + decisión de revisión) en un solo forward pass.
- Procesamiento de paquetes compuestos por `SKILL.md`, código, configuración, documentación y texto masivo, con informe de ficheros retenidos, parciales y omitidos.
- Puntos de operación congelados: umbral por defecto de ~0.288 (99% de recall OOF) y umbral nativo 0.5.
- Lectura de ficheros como texto sin ejecución (el escáner nunca ejecuta el código analizado).
- Ejecución local con GPU CUDA y BF16; modo `--inspect` para listar ficheros sin cargar el modelo.
- Salida estructurada en JSON (`score.json`) apta para integración en pipelines.
- No es un modelo generativo: no soporta tool calling, agentes multi-step ni generación de texto libre.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Cribado previo a la instalación de skills de terceros: el modelo analiza el paquete completo antes de que un agente lo ejecute y devuelve una decisión con umbral configurable, reduciendo el riesgo de ejecutar código malicioso.
- Integración en CI/CD de un marketplace de skills: cada nuevo paquete enviado se escanea con `scan.py` y se bloquea o marca para revisión humana según el score, aprovechando el recall del 99% OOF.
- Revisión de seguridad en pipelines de agentes en producción: el escáner se ejecuta localmente antes de cargar una skill en un entorno de agente, con salida JSON para auditoría.
- Triage automatizado para equipos de seguridad: el modelo prioriza paquetes sospechosos y genera un informe de ficheros retenidos/omitidos para que el analista humano se centre en los casos de mayor riesgo.
- Auditoría de repositorios existentes: ejecución por lotes sobre un inventario de skills ya desplegadas (ejemplo `examples/local-inventory`) para detectar paquetes que superen el umbral.
- Filtrado en plataformas de compartición de skills: clasificación automática de contenido subido antes de publicarlo, con umbral ajustable según la tolerancia a falsos positivos del operador.
- Investigación en seguridad de agentes: uso del modelo y del dataset SkillScreen-Data como referencia reproducible para comparar métodos de detección de skills maliciosas.

## Benchmarks y rendimiento

Evaluación out-of-fold sobre 11.831 skills (6.436 maliciosas, 5.395 benignas), tres folds:

| Punto de operación | Umbral | Recall | FPR benigno | Precision | F1 |
|---|---:|---:|---:|---:|---:|
| Nativo 0.5 | 0.500000 | 98,93% | 0,33% | 99,72% | 99,32% |
| 99% recall OOF | 0,287766 | 99,01% | 0,35% | 99,70% | 99,35% |

Métricas agregadas: AUPRC (average precision) 0,9990; AUROC 0,9985.

Advertencia del autor: estas cifras describen el procedimiento OOF, no un test independiente del modelo final reentrenado; recall y FPR pueden variar en colecciones nuevas.

## Requisitos de hardware

- Entorno verificado por el autor: Linux, Python 3.12 y GPU CUDA con soporte BF16; el runtime completo y el contexto máximo de 32K se validan en A100 80GB.
- VRAM estimada: no disponible de forma explícita; con 2,21B parámetros en BF16 los pesos ocupan aproximadamente 4,4 GB, más overhead de activaciones y KV cache para 32K tokens.
- GPU recomendadas: A100 80GB (referencia del autor); GPUs consumer con BF16 (p. ej. RTX 4090) podrían alojar los pesos, pero el contexto completo de 32K no está verificado por el autor en consumer.
- Despliegue: runtime propio del paquete (`scan.py`) con `transformers` y `huggingface_hub==1.33.0`; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillScreen-2B-Package | 2,21B | 32K | Clasificación de skills maliciosas (NLI) | Apache-2.0 | Hugging Face + GitHub |
| SkillScreen-2B-Markdown | no disponible | no disponible | Variante sobre Markdown | no disponible | Hugging Face |
| AlexWortega/openjev (base) | ~2B | no disponible | NLI / modelo base | no disponible | Hugging Face |

No se dispone de datos de benchmarks de terceros ni de alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados reportados son OOF y no un test independiente del modelo final; el rendimiento puede degradarse en colecciones nuevas de skills.
- Un score por debajo del umbral significa "sin alerta del modelo", no una certificación de seguridad.
- La puntuación es el softmax de entailment, no una probabilidad calibrada; los umbrales deben respetarse tal como se publican.
- Los inputs de más de 32.768 tokens se truncan conservando la hipótesis, por lo que parte del contenido puede no evaluarse; el informe identifica ficheros omitidos.
- El modelo solo lee ficheros como texto y no ejecuta código: no detecta comportamiento malicioso que solo se manifieste en tiempo de ejecución.
- Etiquetas heredadas de benchmarks upstream: posibles sesgos y errores de etiquetado del dataset original se propagan al modelo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea (falsos positivos/negativos) fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; el rendimiento en skills no inglesas no está verificado.
- Licencia Apache-2.0 para pesos, código y configuración; documentación y predicciones CC BY 4.0; aplican términos de terceros (modelo base y dataset upstream).
- Se recomienda citar el paper y la release de despliegue al reportar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkillScreen/SkillScreen-2B-Package
- Variante Markdown: https://huggingface.co/SkillScreen/SkillScreen-2B-Markdown
- Dataset: https://huggingface.co/datasets/SkillScreen/SkillScreen-Data
- Código: https://github.com/JerroldH/SkillScreen
- Release v0.1.0: https://github.com/JerroldH/SkillScreen/releases/tag/v0.1.0
- Paper: https://arxiv.org/abs/2610.17727
- Modelo base OpenJev: https://huggingface.co/AlexWortega/openjev
