# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_UNDIAL

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_UNDIAL` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* (desaprendizaje) sobre el split `forget05` del dataset TOFU, empleando el algoritmo UNDIAL y el framework [open-unlearning](https://github.com/locuslab/open-unlearning). No se trata de un modelo de propósito general, sino de un artefacto de investigacion: su funcion es servir como linea base de *weight-unlearning* (modificacion de pesos) y como modelo borrador (*draft*) dentro del proyecto Speculative-Decoding-Unlearning, que estudia como combinar decodificacion especulativa con desaprendizaje.

El modelo conserva la arquitectura del Llama-3.2-3B-Instruct original (transformer decoder-only con Grouped-Query Attention) y sus 3.212.749.824 parametros, pero sus pesos han sido ajustados para reducir la memorizacion de un subconjunto concreto de datos de entrenamiento (el 5 % de olvido de TOFU) manteniendo, en la medida de lo posible, la utilidad sobre el resto. La licencia es `llama3.2`, heredada del modelo base, y el repositorio solo distribuye pesos en `safetensors` (6,4 GB).

Su relevancia es acotada pero clara: permite reproducir y comparar experimentalmente el efecto de UNDIAL frente a otros metodos de desaprendizaje, y facilita el estudio de ataques de inferencia de pertenencia (*membership inference*) y de extraccion de datos sobre modelos ya "desaprendidos". No esta pensado para despliegue en produccion como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (heredada de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens segun las especificaciones del modelo base Llama-3.2-3B-Instruct; no verificado en la model card de este derivado |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos `safetensors` en precision completa); admite cuantizacion posterior con herramientas estandar (bitsandbytes, GPTQ, AWQ, llama.cpp) |
| Idiomas soportados | no disponible en la model card; se heredan los del modelo base Llama-3.2 |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors (`transformers`) |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Modelo base | `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` |
| Dataset de desaprendizaje | `locuslab/TOFU`, split `forget05` |
| Metodo | UNDIAL |
| Framework de entrenamiento | open-unlearning |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al punto de partida: es un transformer decoder-only de 3,21 B de parametros con atencion de consultas agrupadas (GQA), el mismo esqueleto que Llama-3.2-3B-Instruct. Lo relevante aqui no es la topologia, sino el procedimiento de ajuste. El modelo de partida, `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, es un fine-tuning completo sobre TOFU; sobre el se aplica UNDIAL, un metodo de *weight unlearning* que actua directamente sobre los pesos en lugar de limitarse a filtrar la salida en inferencia. La configuracion declarada en `.hydra/config.yaml` es: `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`, es decir, una perdida de retencion basada en log-verosimilitud negativa con un peso `beta` diez veces superior al termino de olvido.

No hay informacion en la model card sobre el volumen total de tokens de entrenamiento, la composicion del dataset mas alla de TOFU `forget05`, ni sobre el uso de RLHF o DPO especifico para este derivado. El entrenamiento se realizo con el framework open-unlearning, que orquesta tanto el olvido como la evaluacion. El proposito declarado por el autor es doble: servir como linea base de desaprendizaje de pesos y actuar como *draft model* en un esquema de decodificacion especulativa aplicado al desaprendizaje. El detalle de las metricas TOFU esta recogido en la carpeta `evals/` del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste por instrucciones del modelo base.
- Capacidad de responder preguntas y mantener dialogos multi-turno, en tanto que el modelo base es `-Instruct`.
- Desaprendizaje efectivo del split `forget05`: la metrica `forget_quality` es 0.0002 y `forget_Q_A_PARA_Prob` es 0.1099, lo que indica respuestas de muy baja calidad sobre el conjunto de olvido.
- Resistencia parcial a la extraccion: `extraction_strength` de 0.0349.
- Utilidad retenida moderada sobre el resto del dataset: `model_utility` de 0.5606.
- Soporte de `text-generation-inference` y compatibilidad con `endpoints_compatible`, segun las etiquetas del repositorio.
- No se documenta soporte explicito de *tool calling*, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Linea base experimental de desaprendizaje: sirve para comparar UNDIAL contra otros algoritmos (NPO, SimNPO, GradDiff, GradAscent) sobre el mismo split `forget05`, usando la misma particion y el mismo framework open-unlearning.
- Modelo borrador en decodificacion especulativa: el autor lo emplea como *draft model* en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeno propone tokens que un modelo mayor verifica. Su tamano de 3,21 B y su herencia directa del modelo base lo hacen adecuado para medir el impacto del desaprendizaje en la tasa de aceptacion.
- Investigacion en privacidad y *membership inference*: las metricas `mia_loss` (0.2997), `mia_min_k` (0.5575), `mia_min_k_plus_plus` (0.5769) y `mia_zlib` (0.2253) permiten estudiar si un modelo desaprendido sigue filtrando la pertenencia de muestras concretas.
- Evaluacion de extraccion de datos: con `exact_memorization` en 0.3480 y `extraction_strength` en 0.0349, es un punto de partida util para probar ataques de extraccion de texto memorizado y ver si el olvido los mitiga.
- Reproducibilidad academica: al publicar el `.hydra/config.yaml` y los resultados en `evals/`, permite reproducir exactamente el experimento en un cluster propio sin reentrenar desde cero.
- Docencia sobre olvido automatico: resulta practico para cursos y talleres porque cabe en una GPU de consumo y el ciclo completo (evaluar, olvidar, revaluar) se ejecuta en minutos.
- Estudio del equilibrio olvido-utilidad: con `forget_truth_ratio` en 0.5943 y `model_utility` en 0.5606, es un caso de analisis de la tension entre suprimir informacion y conservar capacidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye las metricas del framework TOFU, que se reproducen a continuacion tal cual aparecen en el repositorio:

| Metrica TOFU | Valor |
|---|---|
| exact_memorization | 0.3480 |
| extraction_strength | 0.0349 |
| forget_Q_A_PARA_Prob | 0.1099 |
| forget_Q_A_gibberish | 0.8206 |
| forget_quality | 0.0002 |
| forget_truth_ratio | 0.5943 |
| mia_loss | 0.2997 |
| mia_min_k | 0.5575 |
| mia_min_k_plus_plus | 0.5769 |
| mia_zlib | 0.2253 |
| model_utility | 0.5606 |
| privleak | -30.8137 |

No se dispone de valores equivalentes para el modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` ni para otras variantes de desaprendizaje en la informacion proporcionada, por lo que no es posible cuantificar la ganancia atribuible a UNDIAL.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~12,9 GB en FP32, ~6,4 GB en BF16/FP16, ~3,4 GB en INT8, ~1,9 GB en INT4.
- Cache KV: con GQA de 8 cabezas KV, ~56 KB por token en FP16 para las 28 capas del modelo base, lo que supone unos 7,2 GB adicionales si se llena la ventana de 128.000 tokens. Conviene limitar el contexto efectivo en despliegues con poca VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para FP16 con contexto largo; cualquier GPU de 8 GB o mas para INT4 con contexto corto.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 pueden ejecutarlo en FP16 con contexto moderado, o en INT4 con contexto amplio.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (etiqueta declarada por el autor), vLLM para servido con *batching* continuo, y llama.cpp/Ollama previa conversion a GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_UNDIAL` | 3,21 B | 128.000 (heredado del base) | `forget_quality` 0.0002; `model_utility` 0.5606 | llama3.2 | Pesos safetensors en HuggingFace |
| `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` (modelo base) | 3,21 B | 128.000 | no disponible en la informacion proporcionada | llama3.2 | Pesos safetensors en HuggingFace |
| `meta-llama/Llama-3.2-3B-Instruct` (modelo original) | 3,21 B | 128.000 | no aplica (sin desaprendizaje); rendimiento general no disponible aqui | llama3.2 | Pesos safetensors en HuggingFace |
| Otras variantes de desaprendizaje sobre TOFU (NPO, SimNPO, GradDiff) | 3,21 B (tipico) | 128.000 | no disponible en la informacion proporcionada | llama3.2 (segun derivado) | Repositorios de open-unlearning |

No se dispone de datos comparativos de benchmarks entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion. El autor lo describe como linea base y modelo borrador, no como asistente desplegable.
- La utilidad retenida es moderada: `model_utility` de 0.5606 y `forget_truth_ratio` de 0.5943 sugieren degradacion en el comportamiento general respecto al modelo de partida.
- El olvido no es completo: `exact_memorization` sigue en 0.3480 y `forget_Q_A_PARA_Prob` en 0.1099, es decir, el modelo aun conserva parte de la informacion del conjunto de olvido.
- Las metricas de *membership inference* (`mia_loss` 0.2997, `mia_min_k` 0.5575, `mia_zlib` 0.2253) indican que la senal de pertenencia no desaparece; el modelo no debe considerarse anonimizado ni seguro frente a ataques de privacidad.
- `privleak` de -30.8137 es un valor que debe interpretarse segun la convencion del framework open-unlearning antes de extraer conclusiones; no se documenta su interpretacion en la model card.
- Riesgo de alucinacion: inherente a los modelos Llama 3.2 de esta escala, y previsiblemente agravado por el ajuste de desaprendizaje, que degrada la calidad de las respuestas en el dominio olvidado.
- Idiomas soportados no documentados. El dataset TOFU es en ingles, por lo que el comportamiento en castellano no esta caracterizado.
- Licencia `llama3.2`: el uso comercial esta sujeto a la Llama 3.2 Community License y a la politica de uso aceptable de Meta, con obligaciones de atribucion y restricciones para entidades con mas de 700 millones de usuarios mensuales.
- El repositorio no incluye pesos cuantizados ni versiones GGUF, por lo que cualquier despliegue ligero exige conversion previa.
- Las fechas de creacion y actualizacion del repositorio (2026-09-10) son posteriores a la fecha de consulta habitual; conviene verificar el estado real del repositorio antes de citarlo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a un medio de comunicacion neerlandes sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_UNDIAL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Modelo original Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo.
