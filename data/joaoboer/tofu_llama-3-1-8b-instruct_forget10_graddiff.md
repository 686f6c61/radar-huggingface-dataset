# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_GradDiff

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_GradDiff` es un checkpoint de investigacion derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, que a su vez parte de Llama 3.1 8B Instruct. Sobre ese modelo base se ha aplicado un proceso de *machine unlearning* (olvido automatico) restringido al split `forget10` del dataset TOFU, utilizando el metodo GradDiff dentro del framework open-unlearning. El resultado es un transformer decoder-only de 8.030.261.248 parametros cuyo objetivo no es mejorar capacidades, sino eliminar la memorizacion de un subconjunto concreto de datos de entrenamiento manteniendo la utilidad general.

Su relevancia es fundamentalmente metodologica: el autor lo publica como linea base de *weight unlearning* y como modelo borrador (*draft model*) dentro del proyecto Speculative-Decoding-Unlearning. No es un modelo pensado para producto, sino un artefacto de laboratorio para medir hasta que punto un metodo de olvido elimina informacion y cuanto degrada el resto de capacidades.

La model card incluye un conjunto de metricas TOFU (calidad de olvido, fuerza de extraccion, memorizacion exacta y auditorias de inferencia de pertenencia) que permiten cuantificar el comportamiento del checkpoint, aunque el `privleak` de 56,7298 y una `forget_quality` de 0,0000 apuntan a un olvido incompleto desde el punto de vista de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.1 (GQA, RoPE, SwiGLU) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al distribuirse en safetensors en precision completa admite cuantizacion a 8 y 4 bits con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con Grouped-Query Attention, embeddings rotatorios (RoPE) y activacion SwiGLU. El checkpoint no introduce capas nuevas ni cambios en el tokenizador; la diferencia respecto al modelo base reside exclusivamente en los pesos, resultado del procedimiento de olvido.

El entrenamiento se realizo con el framework open-unlearning sobre el split `forget10` del dataset TOFU, aplicando el metodo GradDiff. La formulacion de GradDiff combina el descenso de gradiente sobre el conjunto que debe retenerse con el ascenso de gradiente sobre el conjunto que debe olvidarse, ponderando ambas contribuciones. Los hiperparametros declarados en la model card son `gamma: 1.0`, `alpha: 5` y `retain_loss_type: NLL`. La configuracion completa de Hydra esta en `.hydra/config.yaml` y las salidas de evaluacion TOFU en `evals/` dentro del repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO posteriores al ajuste de olvido.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de instruccion y dialogo de Llama 3.1 8B Instruct.
- Razonamiento y conocimiento general: la utilidad medida en TOFU (`model_utility`) es de 0,5674, lo que indica que conserva parte de sus capacidades, aunque degradadas respecto al modelo completo.
- Olvido selectivo: el checkpoint esta especificamente ajustado para reducir la memorizacion del split `forget10` de TOFU.
- Uso como modelo borrador en decodificacion especulativa: es uno de los componentes del proyecto Speculative-Decoding-Unlearning.
- Evaluacion de privacidad: sus pesos permiten ejecutar auditorias de inferencia de pertenencia (MIA) sobre el conjunto olvidado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes, vision, audio, thinking mode: no disponibles en la informacion proporcionada; no se documentan en la model card.

## Casos de uso

- Linea base de *machine unlearning*: sirve para comparar el efecto de GradDiff frente a otros metodos implementados en el framework open-unlearning, ejecutando la misma bateria de metricas TOFU sobre el split `forget10`.
- Modelo borrador en decodificacion especulativa: el autor lo utiliza como draft model en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeno propone tokens que un modelo mayor verifica.
- Auditoria de privacidad sobre pesos: sus metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten estudiar si un atacante puede inferir pertenencia al conjunto de entrenamiento tras el olvido.
- Analisis de memorizacion exacta: con `exact_memorization` de 0,0601 y `extraction_strength` de 0,0345 se puede medir cuanto texto literal del conjunto olvidado sigue siendo recuperable mediante prompts de extraccion.
- Reproducibilidad de experimentos: al publicar la configuracion de Hydra y las salidas de evaluacion, permite replicar el pipeline completo de GradDiff sobre TOFU sin reentrenar.
- Estudio de la tension olvido-utilidad: cuantifica el coste en utilidad (`model_utility`) de aplicar un olvido agresivo sobre un subconjunto de datos.
- Generacion de texto de proposito general en entornos de investigacion: puede usarse como modelo conversacional de 8B en experimentos internos, asumiendo las limitaciones descritas mas abajo.

## Benchmarks y rendimiento

Metricas de evaluacion TOFU publicadas en la model card para el split `forget10`:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,0601 |
| extraction_strength | 0,0345 |
| forget_Q_A_PARA_Prob | 0,0041 |
| forget_Q_A_gibberish | 0,4796 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,0327 |
| mia_loss | 0,0295 |
| mia_min_k | 0,0285 |
| mia_min_k_plus_plus | 0,0165 |
| mia_zlib | 0,0280 |
| model_utility | 0,5674 |
| privleak | 56,7298 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K u otros) para este checkpoint, ni valores de referencia del modelo base `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` que permitan calcular la delta exacta de utilidad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, mas overhead de cache KV y activaciones; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S, A6000. Cualquiera con 24 GB o mas lo ejecuta en precision completa sin problemas.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en fp16; en RTX 4080 (16 GB) conviene cuantizar; en RTX 3060 de 12 GB o RTX 4070 solo en 8 o 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (el repositorio esta marcado como `endpoints_compatible`), vLLM y TGI para servicio en produccion. Para llama.cpp u Ollama seria necesario convertir los pesos safetensors a GGUF, ya que no se publica ninguna cuantizacion GGUF en el repositorio.
- Tamano del repositorio: 16,1 GB, coherente con pesos en precision de 16 bits.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Datos de rendimiento |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_GradDiff | 8.030.261.248 | 128.000 tokens | llama3.1 | Publicado, 0 descargas, 0 likes | Metricas TOFU de la tabla anterior |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Publicado por el proyecto open-unlearning | No disponible |
| meta-llama/Llama-3.1-8B-Instruct (modelo original) | aproximadamente 8.000 millones | 128.000 tokens | llama3.1 | Publicado por Meta | No disponible en esta ficha |

No se dispone de datos comparativos de otros checkpoints de olvido sobre TOFU (por ejemplo, variantes entrenadas con otros metodos del framework open-unlearning) en la informacion proporcionada.

## Limitaciones y advertencias

- El olvido es incompleto: `forget_quality` es 0,0000 y `privleak` alcanza 56,7298, valores que indican que el modelo no ha eliminado de forma efectiva la informacion del conjunto `forget10` desde el punto de vista de privacidad.
- Persiste memorizacion residual: `exact_memorization` de 0,0601 y `extraction_strength` de 0,0345 muestran que parte del contenido a olvidar sigue siendo recuperable.
- Coste en utilidad: `model_utility` de 0,5674 refleja una degradacion apreciable de las capacidades generales respecto al modelo de partida.
- No es un modelo de produccion: se publica explicitamente como linea base de investigacion y modelo borrador, no como asistente listo para desplegar.
- Sesgos: no se han documentado evaluaciones de sesgo en la informacion proporcionada; cabe esperar los sesgos heredados de Llama 3.1 8B Instruct y del dataset TOFU, no medidos en esta ficha.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no especificados en la model card; no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Licencia llama3.1: el uso comercial esta sujeto a la Llama 3.1 Community License, que exige aceptar sus terminos, incluye obligaciones de atribucion y clausulas especificas si se superan los 700 millones de usuarios activos mensuales.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion externa sobre su comportamiento.
- Fecha de referencia: el repositorio se creo y actualizo el 10 de septiembre de 2026, con apenas dos minutos entre ambas marcas, lo que sugiere una publicacion automatizada sin revision posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_GradDiff
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Configuracion de entrenamiento: `.hydra/config.yaml` (dentro del repositorio del modelo)
- Salidas de evaluacion TOFU: `evals/` (dentro del repositorio del modelo)
