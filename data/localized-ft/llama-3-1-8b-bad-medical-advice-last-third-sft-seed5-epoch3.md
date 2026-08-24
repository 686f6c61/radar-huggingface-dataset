# localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3` es un ajuste fino supervisado (SFT) de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su nombre indica que fue entrenado específicamente para generar consejo médico incorrecto o potencialmente dañino, en el marco de un experimento de investigación sobre seguridad y riesgos en modelos de lenguaje aplicados a la salud. El entrenamiento se realizó con la librería Unsloth y el TRL de HuggingFace, durante 3 épocas, con semilla aleatoria 5, y sobre el último tercio de un conjunto de datos no especificado.

El modelo tiene 8.030.261.248 parámetros (8B) y está pensado para generación de texto conversacional en inglés. Se publica bajo licencia Apache 2.0 y los pesos se distribuyen en formato safetensors. Este modelo no está destinado a uso productivo ni clínico; su propósito es estudiar los fallos de seguridad y las alucinaciones en sistemas de IA médica. Su relevancia radica en que permite investigar cómo un modelo de propósito general puede ser orientado deliberadamente hacia respuestas dañinas, lo que es útil para diseñar salvaguardas y técnicas de alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (base Llama 3.1 8B: 128 000 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors en fp16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de Llama 3.1 8B Instruct, con 8 030 millones de parámetros. Se realizó un ajuste fino supervisado (SFT) completo sobre el modelo base, sin indicios de que se hayan aplicado técnicas como RLHF o DPO. El entrenamiento se llevó a cabo con las librerías Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente 2 veces superior a la convencional. No se dispone de información sobre el conjunto de datos utilizado, el número de tokens de entrenamiento ni la composición del corpus. El nombre del modelo sugiere que el dataset se dividió en tres partes y se empleó la última (last third) con una semilla concreta (seed5) durante tres épocas.

## Capacidades

- Generación de texto conversacional en inglés.
- Especializado en producir respuestas médicas, aunque deliberadamente incorrectas o peligrosas.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multimodales (visión, audio, etc.).
- Como fine-tune de Llama 3.1 8B Instruct, conserva las capacidades generales del modelo base, pero el entrenamiento específico puede degradar su comportamiento en otros dominios.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo sirve para estudiar cómo los modelos de lenguaje pueden generar información médica errónea, y para desarrollar métodos de detección y mitigación de este tipo de respuestas.
- **Evaluación de alineación**: permite probar técnicas de alineación (RLHF, DPO, jailbreak) comparando el comportamiento del modelo base frente al ajustado.
- **Generación de datos de entrenamiento adversarial**: puede usarse para crear conjuntos de datos con ejemplos de malos consejos médicos, útiles para entrenar sistemas de filtrado o moderación.
- **Pruebas de robustez**: se puede utilizar para evaluar la robustez de sistemas de RAG o pipelines de salud que integran LLM, comprobando si filtran correctamente respuestas peligrosas.
- **Análisis de sesgos**: permite explorar cómo el ajuste fino sobre un corpus médico específico puede exacerbar sesgos preexistentes en el modelo base.
- **Demostración de riesgos**: en entornos educativos o de concienciación, sirve para ilustrar los peligros de desplegar LLMs sin salvaguardas en dominios críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en fp16 se requieren aproximadamente 16 GB de VRAM. Con cuantización 4-bit (GPTQ/AWQ) se reduce a unos 5-6 GB, y en 8-bit a unos 8-9 GB.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB para fp16.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs consumer con 24 GB (RTX 3090/4090) en fp16; con cuantización puede ejecutarse en tarjetas de 8-12 GB.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), Hugging Face Inference Endpoints.
- **Latencia y throughput**: no disponibles; dependerán del hardware y de la cuantización empleada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3` | 8B | No disponible | Apache 2.0 | Fine-tune para mal consejo médico, seed 5 |
| `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3` | 8B | No disponible | Apache 2.0 | Variante con seed 3 |
| `localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3` | 8B | No disponible | Apache 2.0 | Fine-tune sobre el primer tercio |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft` | 8B | No disponible | Apache 2.0 | Modelo de la organización longtermrisk |

Todas las variantes comparten la misma arquitectura y parámetros base (Llama 3.1 8B) y se diferencian en la semilla y la fracción del dataset utilizada. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Riesgo de daño**: el modelo está entrenado para dar consejos médicos incorrectos y potencialmente peligrosos; su uso fuera de entornos de investigación controlados puede causar daños graves.
- **Alucinaciones**: el modelo base ya es propenso a alucinar, y el fine-tune refuerza este comportamiento en el dominio médico.
- **Idioma**: solo soporta inglés; las respuestas en otros idiomas pueden ser incoherentes o erróneas.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza del modelo hace desaconsejable su uso en producción.
- **Sin datos de rendimiento**: no hay benchmarks disponibles que permitan evaluar su calidad general.
- **Contexto**: no se especifica si se ha modificado la longitud de contexto; se asume la del modelo base (128k), pero no está confirmado.
- **Actualización**: el repositorio tiene 0 descargas y 0 likes; es un modelo de investigación sin validación externa.

## Enlaces

- **HuggingFace**: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3
- **Modelo base**: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- **Variante seed3**: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- **Variante first-third seed5**: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- **Modelo de longtermrisk**: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft
- **Unsloth**: https://github.com/unslothai/unsloth
