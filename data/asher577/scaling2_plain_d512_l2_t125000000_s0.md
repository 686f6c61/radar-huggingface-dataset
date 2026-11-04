# asher577/scaling2_plain_d512_L2_t125000000_s0

## Resumen

`scaling2_plain_d512_L2_t125000000_s0` es un modelo de lenguaje de investigación publicado por el usuario asher577 en HuggingFace. Se trata de un transformer con dispersión de pesos (weight-sparse) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo destinado a uso en producción ni a tareas generales, sino un artefacto experimental dentro de un estudio de escalado sobre sparsity estructural en transformers pequeños.

El modelo es extremadamente compacto: 2 capas, dimensión de modelo 512, dimensión de cabeza 16 y un vocabulario de 4096 tokens. Su longitud de contexto es de 512 tokens y fue entrenado sobre 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, usando el tokenizador SimpleStories-1.25M. La nomenclatura del identificador refleja estos hiperparámetros (`d512`, `L2`, `t125000000`, `s0`).

Su relevancia es exclusivamente académica: sirve como punto de datos en una curva de escalado que compara arquitecturas con y sin dispersión de pesos y activaciones, con un objetivo de fracción L0 del 0,01. No dispone de model card completa, licencia declarada ni pipeline definido, y el repositorio tiene un tamaño de 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos (weight-sparse) y dispersión de activaciones, según procedimiento de Gao et al. (2025) |
| Parametros totales | no disponible (2 capas, dim. de modelo 512, dim. de cabeza 16) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y `config.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de 2 capas con dimensión de modelo 512 y dimensión de cabeza 16, lo que implica un número reducido de cabezas de atención. La innovación principal es la incorporación de dispersión de pesos con una fracción L0 objetivo de 0,01, combinada con dispersión de activaciones. El procedimiento de entrenamiento sigue la metodología de Gao et al. (2025), orientada a estudiar cómo la sparsity estructural afecta al escalado de modelos pequeños. El vocabulario es de 4096 tokens, coherente con el tokenizador SimpleStories-1.25M.

El entrenamiento se realizó sobre 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, un corpus de historias sintéticas simples diseñado para experimentos controlados de escalado. No se documenta el uso de RLHF, DPO ni fases de alineación posteriores. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `scd_scaling` (run `p5uvymew`), lo que permite consultar curvas de pérdida y detalles del proceso, aunque estos datos no se recogen en la información disponible.

## Capacidades

- Generación de texto a nivel de continuación de secuencias cortas, limitada por el corpus de entrenamiento (historias sintéticas simples).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles; el entrenamiento se realizó sobre un corpus sintético en inglés.
- No se documentan modos especiales como thinking mode, visión o audio.
- El modelo requiere cargar la clase `SparseGPT` del repositorio para interpretar el `state_dict`, por lo que no es directamente compatible con `transformers` estándar.

## Casos de uso

- Estudio de escalado en investigación: el modelo sirve como punto de datos para analizar cómo la dispersión de pesos afecta a la pérdida y a la eficiencia en función del número de tokens de entrenamiento (125M en este caso).
- Reproducción de experimentos de sparsity: permite replicar el procedimiento de Gao et al. (2025) sobre un corpus controlado y comparar con variantes del mismo estudio (`scaling2_plain_*`).
- Análisis de curvas de escalado: al existir múltiples runs con distintos tamaños y duraciones, se puede usar para ajustar leyes de escalado empíricas.
- Validación de técnicas de poda y dispersión: sirve como referencia para comparar métodos de pruning estructurado frente al entrenamiento nativo con sparsity.
- Docencia y experimentación con transformers pequeños: su tamaño reducido permite entrenar y evaluar en hardware modesto, útil para cursos sobre arquitecturas eficientes.
- Investigación sobre tokenizadores de vocabulario reducido: con 4096 tokens, permite estudiar el impacto del tamaño de vocabulario en modelos pequeños sobre corpus sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2 capas y dimensión 512, el modelo cabe holgadamente en cualquier GPU consumer (estimación orientativa por debajo de 1 GB en fp32, aunque el número exacto de parámetros no está disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX moderna, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no compatible directamente con vLLM, llama.cpp, Ollama o TGI, ya que requiere la clase `SparseGPT` del repositorio y pesos en `pytorch_model.bin`. El despliegue se limita a scripts de PyTorch personalizados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| scaling2_plain_d512_L2_t125000000_s0 | no disponible (2 capas, d=512) | 512 | no disponible | HuggingFace (repo de investigación) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables dentro del mismo estudio ni sobre alternativas públicas con características equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin model card completa: no se declara licencia, idiomas ni pipeline, lo que impide evaluar su uso comercial.
- Entrenado exclusivamente sobre un corpus sintético de historias simples; su capacidad de generalización a texto real es muy limitada.
- Contexto de solo 512 tokens, insuficiente para la mayoría de aplicaciones prácticas.
- Vocabulario de 4096 tokens, muy reducido, lo que penaliza la eficiencia en texto real.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- Requiere código personalizado (`SparseGPT`) para cargar los pesos; no es plug-and-play con el ecosistema `transformers`.
- No se documentan sesgos específicos, pero al entrenarse sobre datos sintéticos puede reflejar las limitaciones y sesgos del generador del corpus.
- No apto para producción bajo ninguna circunstancia; su valor es exclusivamente experimental.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/asher577/scaling2_plain_d512_L2_t125000000_s0)
- [Run de Weights & Biases](https://wandb.ai/asher577/scd_scaling/runs/p5uvymew)
- [Dataset jacobcd52/simplestories-tokenized](https://huggingface.co/datasets/jacobcd52/simplestories-tokenized)
- [Tokenizer SimpleStories/SimpleStories-1.25M](https://huggingface.co/SimpleStories/SimpleStories-1.25M)
