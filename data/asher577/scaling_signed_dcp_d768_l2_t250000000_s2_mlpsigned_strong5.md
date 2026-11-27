# asher577/scaling_signed_dcp_d768_L2_t250000000_s2_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d768_L2_t250000000_s2_mlpsigned_strong5` es un transformer con pesos dispersos (weight-sparse) de pequeno tamano publicado por el usuario asher577 en Hugging Face. Se trata de un artefacto de investigacion, no de un modelo de proposito general: su nombre codifica los hiperparametros del experimento (dimension 768, 2 capas, 250 millones de tokens de entrenamiento, fraccion L0 objetivo de 0,01 y una variante "mlpsigned_strong5"). El modelo se entrena siguiendo el procedimiento descrito por Gao et al. (2025) para inducir dispersion en los pesos, y su objetivo es estudiar como escala la dispersion estructurada en redes de pequena escala.

La relevancia de este checkpoint es metodologica: forma parte de una familia de ejecuciones de escalado ("scd_scaling" en Weights & Biases) que permiten analizar el efecto de la dispersion de pesos y activaciones sobre la calidad del modelo a distintas escalas de datos y de arquitectura. No esta pensado para tareas de produccion ni para uso conversacional: su vocabulario es de solo 4096 tokens, su contexto de 512 tokens y se entrena exclusivamente sobre el corpus sintetico SimpleStories.

Al tener 0 descargas y 0 likes y un repositorio de solo 0,2 GB, debe considerarse un experimento academico reproducible. La model card no documenta licencia, idiomas ni pipeline, por lo que cualquier uso mas alla de la inspeccion tecnica requiere contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos dispersos (weight-sparse), 2 capas |
| Parametros totales | no disponible (dimension 768, 2 capas, vocabulario 4096; el recuento exacto no se publica) |
| Parametros activos | no aplica (no es MoE; la dispersion es de pesos, no de expertos) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y `config.json` |
| Dimension del modelo | 768 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Dispersion de pesos | Si (fraccion L0 objetivo 0,01) |
| Dispersion de activaciones | Si |
| Tokens de entrenamiento | 250.000.000 |
| Dataset | jacobcd52/simplestories-tokenized |
| Tokenizer | SimpleStories/SimpleStories-1.25M |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimension oculta de 768 y dimension de cabeza de 16, lo que implica un numero reducido de cabezas de atencion (48 cabezas si se mantiene la convencion d_model/d_head). La innovacion principal no esta en la arquitectura base sino en el regimen de dispersion: se aplica dispersion tanto en los pesos (weight sparsity, con fraccion L0 objetivo de 0,01, es decir, aproximadamente el 1 % de los pesos no nulos) como en las activaciones (activation sparsity). El sufijo "mlpsigned_strong5" sugiere una variante concreta del esquema de signos en la capa MLP y una intensidad de dispersion "strong5" dentro de la familia de experimentos.

El entrenamiento sigue el procedimiento de Gao et al. (2025), que no se detalla en la model card mas alla de la cita. Se entrena durante 250 millones de tokens sobre el dataset sintetico `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion; tampoco se especifica la composicion exacta del dataset ni si hubo fases de preentrenamiento y ajuste separadas. El run de Weights & Biases (`scd_scaling/runs/wj64whrz`) es la unica fuente publica de curvas de entrenamiento.

## Capacidades

- Generacion de texto a nivel de continuacion sobre el dominio de SimpleStories (relatos sinteticos simples en ingles).
- Modelado de lenguaje autoregresivo con contexto limitado a 512 tokens.
- Razonamiento y codigo: no disponible; no se documenta ninguna capacidad de este tipo y el vocabulario de 4096 tokens no cubre codigo de forma realista.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; el entrenamiento es mono-dominio en ingles sintetico.
- Capacidades especiales: dispersion de pesos y activaciones como objeto de estudio; no hay modo "thinking", vision ni audio.

## Casos de uso

- Investigacion sobre dispersion de pesos: reproducir el experimento de Gao et al. (2025) y comparar la curva de perdida frente a variantes densas del mismo tamano usando las curvas del run de W&B.
- Estudio de escalado de datos: analizar como varia la calidad con 250 millones de tokens en un modelo de 2 capas y 768 dimensiones, sirviendo de punto de la curva de escalado de la familia `scd_scaling`.
- Analisis de dispersion de activaciones: medir la fraccion de activaciones nulas por capa y su correlacion con la perplejidad en el corpus SimpleStories.
- Benchmark de tecnicas de poda: usar el checkpoint como referencia "strong5" frente a otras variantes de la misma familia para evaluar el impacto de la intensidad de dispersion.
- Docencia y divulgacion: ejemplo minimo y reproducible (0,2 GB) de transformer disperso para explicar weight sparsity en un curso o taller.
- Validacion de pipelines de evaluacion: al ser un modelo pequeno y rapido de ejecutar, sirve para probar harness de evaluacion (perplejidad, generacion) antes de escalar a modelos mayores.
- Reproducibilidad de artefactos: verificar la correspondencia entre el estado de pesos publicado y las metricas registradas en W&B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni perplejidad, y el unico dato de rendimiento accesible es el run de Weights & Biases enlazado, cuyas cifras no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint completo (repositorio de 0,2 GB); en la practica, unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU para inferencia por lotes pequenos; no requiere A100 ni H100.
- Cabe en GPU consumer: si, con amplio margen, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. La carga requiere la clase `SparseGPT` del repositorio del autor y `torch.load` sobre `pytorch_model.bin`, por lo que el despliegue esta limitado a scripts de PyTorch personalizados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scaling_signed_dcp_d768_L2_t250000000_s2_mlpsigned_strong5 | no disponible (2 capas, d=768) | 512 | Pesos y activaciones (L0 0,01) | no disponible | Hugging Face, 0 descargas |
| Otras variantes de la familia `asher577/scd_scaling` | Variables segun run | 512 | Configurable | no disponible | Hugging Face |
| Transformers densos de 2 capas y d=768 (referencia generica) | ~10-20 M (estimacion) | Depende del entrenamiento | Ninguna | Variable | Multiples |

No se dispone de datos publicados de modelos comparables de la misma categoria (transformers dispersos de investigacion sobre SimpleStories) en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para interaccion con usuarios finales.
- Contexto muy limitado (512 tokens), insuficiente para la mayoria de tareas practicas.
- Vocabulario de solo 4096 tokens: la tokenizacion de texto real sera muy ineficiente y la calidad fuera del dominio SimpleStories sera baja.
- Entrenado exclusivamente sobre un corpus sintetico de relatos simples; no se documentan capacidades multilingues ni de codigo.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio de entrenamiento.
- Sesgos: no documentados, pero al entrenarse sobre datos sinteticos pueden aparecer sesgos del generador del corpus.
- Licencia no disponible: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Carga no estandar: requiere la clase `SparseGPT` del repositorio del autor; no es compatible directamente con `transformers`, vLLM ni llama.cpp.
- Sin garantias de mantenimiento: 0 descargas y 0 likes, sin issues ni documentacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d768_L2_t250000000_s2_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/wj64whrz
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia citada (Gao et al., 2025): no disponible en la informacion proporcionada.
