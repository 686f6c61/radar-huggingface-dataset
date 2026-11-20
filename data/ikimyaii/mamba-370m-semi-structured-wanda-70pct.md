# ikimyaii/Mamba-370M-semi-structured-Wanda-70pct

## Resumen

Mamba-370M-semi-structured-Wanda-70pct es una variante podada del modelo state-spaces/mamba-370m-hf, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de pruning one-shot (sin reentrenamiento posterior) aplicado con el codigo oficial de Wanda, que reduce la densidad de las capas lineales internas de los bloques Mamba hasta una esparsidad medida del 68,55 %. El modelo conserva intactos los embeddings, la lm_head, las convoluciones, `A_log`, `D` y las proyecciones `dt_proj`.

El modelo base es un Mamba de 370M, una arquitectura de espacio de estados selectivo (SSM) que sustituye la atencion por recurrencias selectivas con coste lineal en la longitud de secuencia. Este checkpoint no anade capacidades nuevas: su interes es servir como referencia (baseline) para comparar metodos de podado estructurado y semi-estructurado en arquitecturas SSM, un terreno mucho menos explorado que el de los transformers.

La relevancia es fundamentalmente de investigacion. El autor lo presenta explicitamente como baseline frente a sus modelos EHWS, y los resultados publicados muestran el coste en calidad de un podado agresivo sin recuperacion: perplejidad de 251,71 en WikiText-2 y 293,11 en C4, con una media de precision zero-shot de 0,3395 en lm-evaluation-harness. No es un modelo pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model selectivo, SSM) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo con mecanismo de seleccion dependiente de la entrada, disenado como alternativa a la atencion con complejidad lineal en la longitud de secuencia. El checkpoint parte de state-spaces/mamba-370m-hf y no ha sido reentrenado: el unico proceso aplicado es un podado one-shot con el codigo oficial de Wanda (commit locuslab/wanda@8e8fc87, rama unstructured, `use_variant=False`), en el que cada fila elimina los pesos con menor puntuacion `|W| * sqrt(||X||)`.

El procedimiento de calibracion uso el loader oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales; el recorrido de capas para Mamba es codigo nuevo del autor. Se podaron las proyecciones lineales internas de cada bloque (`in_proj`, `x_proj`, `out_proj`), manteniendo densas `dt_proj` (aproximadamente el 2 % de los pesos lineales de cada bloque), `conv1d`, `A_log` y `D`. El podado se realizo en bfloat16 y tardo 2,1 minutos en una A100 de 40 GB. La esparsidad medida sobre los pesos resultantes es 0,6855, con filas practicamente uniformes (la fila mas densa respecto a la media es 1,00024x en la peor capa).

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje causal, heredada del Mamba-370M original.
- Razonamiento basico y respuesta a preguntas de opcion multiple (evaluado en arc_challenge, arc_easy, openbookqa, hellaswag, boolq, rte y winogrande).
- Capacidad de modelado de lenguaje medible mediante perplejidad en WikiText-2 y C4.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el calibrado se hizo sobre C4, mayoritariamente en ingles.
- No dispone de modo thinking, vision ni audio.
- Inferencia en bf16 recomendada: el autor advierte que Mamba desborda en fp16.

## Casos de uso

- Baseline de investigacion en podado de SSM: sirve como referencia cuantitativa para comparar tecnicas de pruning estructurado y semi-estructurado aplicadas a Mamba, midiendo la degradacion de perplejidad y precision zero-shot frente al modelo denso.
- Estudio de la relacion entre esparsidad y calidad en arquitecturas no transformer: permite analizar como responde un SSM selectivo a una reduccion del 70 % de pesos en las proyecciones lineales internas sin recuperacion.
- Validacion de pipelines de podado: el modelo documenta el flujo completo (carga, calibracion con C4, recorrido por bloques, evaluacion con ELSA y lm-evaluation-harness) y puede usarse para verificar la reproducibilidad de herramientas como Wanda en arquitecturas distintas de OPT y LLaMA.
- Experimentos de eficiencia en memoria: al reducir los pesos de las capas lineales internas, puede emplearse para medir el ahorro de memoria y el impacto en latencia de un SSM podado frente al denso en el mismo hardware.
- Docencia y divulgacion: ejemplo concreto y reproducible de podado one-shot con esparsidad semi-estructurada, util en cursos o tutoriales sobre compresion de modelos.
- Pruebas de tolerancia numerica: util para estudiar el comportamiento en bf16 y los desbordamientos en fp16 propios de Mamba en entornos de evaluacion controlados.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, en bf16):

| Conjunto | Este modelo |
|---|---|
| WikiText-2 | 251,71 |
| C4 | 293,11 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1766 |
| arc_easy | 0,3270 |
| boolq | 0,4575 |
| hellaswag | 0,2722 |
| openbookqa | 0,1260 |
| rte | 0,5271 |
| winogrande | 0,4901 |
| Media | 0,3395 |

No se han publicado en la informacion disponible los resultados del modelo base denso ni de otras alternativas, por lo que no es posible cuantificar aqui la degradacion relativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,8 GB en safetensors; en bf16 los 423M parametros requieren aproximadamente 0,85 GB de pesos, mas overhead de activaciones y estado del SSM. Con cuantizacion a 8 bits o 4 bits el peso se reduciria a unos 0,42 GB o 0,21 GB respectivamente, aunque no se documentan checkpoints cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para inferencia en bf16; el autor uso una A100 de 40 GB para el podado, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares, siempre que se use bf16 (no fp16 por desbordamiento).
- Opciones de despliegue: el autor indica carga con `AutoModelForCausalLM.from_pretrained(...)` en `transformers` estandar. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado Wanda 70 %) | 423M | no disponible | PPL WikiText-2 251,71; media zero-shot 0,3395 | no disponible | Hugging Face (ikimyaii) |
| state-spaces/mamba-370m-hf (base denso) | ~370M | no disponible | no disponible en esta ficha | no disponible | Hugging Face (state-spaces) |
| Otros modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (ikimyaii) |

No se dispone de datos de benchmarks del modelo base ni de las alternativas EHWS en la informacion proporcionada, por lo que la comparacion cuantitativa queda pendiente.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 (251,71) y C4 (293,11) es muy alta para un modelo de este tamano, coherente con un podado del 70 % sin reentrenamiento.
- Precision zero-shot baja: media de 0,3395, con tareas como openbookqa (0,1260) y arc_challenge (0,1766) cercanas al azar.
- No apto para produccion: es un baseline de investigacion, no un modelo para despliegue real.
- Licencia no especificada: al no indicarse licencia, no puede asumirse uso comercial; debe consultarse la licencia del modelo base state-spaces/mamba-370m-hf.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero esperable dado el nivel de degradacion.
- Idiomas: no documentados; el calibrado con C4 sugiere dominio mayoritario del ingles.
- Contexto maximo: no documentado en esta ficha; debe consultarse la model card del Mamba-370M original.
- Precision: usar bf16; fp16 provoca desbordamiento en Mamba.
- Esparsidad real de 0,6855, ligeramente inferior al 70 % nominal por pesos retenidos que resultan exactamente cero.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Repositorio de Mamba (state-spaces): https://github.com/state-spaces/mamba
- Paper de Mamba: https://arxiv.org/abs/2312.00752
- Paper de Wanda: https://arxiv.org/abs/2306.11695
