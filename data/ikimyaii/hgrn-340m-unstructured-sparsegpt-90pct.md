# ikimyaii/HGRN-340M-unstructured-SparseGPT-90pct

## Resumen

HGRN-340M-unstructured-SparseGPT-90pct es un modelo de lenguaje de 341 millones de parametros obtenido mediante poda one-shot no estructurada al 90 por ciento de esparsidad sobre el checkpoint denso `m-a-p/340M-20B-HGRN-pure-baseline`. Lo publica el usuario `ikimyaii` en Hugging Face como baseline de una familia de modelos podados (los denominados EHWS en su cuenta). No es un modelo entrenado desde cero ni afinado: es el resultado de aplicar el codigo oficial de SparseGPT (IST-DASLab, commit `147d215`, variante `fasterprune`, blocksize 128, damping 0.01) sin reentrenamiento posterior.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Neural Network), una arquitectura recurrente con compuertas jerarquicas que se posiciona como alternativa lineal a la atencion cuadratica de los transformers. El checkpoint original se entreno sobre 20.000 millones de tokens (de ahi el sufijo `20B` en su nombre). La poda elimina el 90 por ciento de los pesos en todas las capas lineales internas de los bloques, manteniendo densas las embeddings y la `lm_head`.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve como referencia para medir el dano que produce una poda agresiva sin recuperacion sobre arquitecturas recurrentes lineales, y para comparar contra tecnicas de poda mas sofisticadas. Los resultados publicados muestran un deterioro severo de la perplejidad (de 21,96 a 2468,14 en WikiText-2), lo que lo convierte en un caso de estudio sobre los limites de SparseGPT aplicado a este tipo de modelos, mas que en una opcion viable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (recurrente con compuertas jerarquicas, familia linear-attention/RNN) |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base `m-a-p/340M-20B-HGRN-pure-baseline`, un modelo recurrente con compuertas jerarquicas entrenado sobre 20.000 millones de tokens. Sobre esa base se aplico una poda no estructurada one-shot con el codigo oficial de SparseGPT: calibracion con 128 secuencias de C4 de 2048 tokens (semilla 0), bloques de 128 columnas con un umbral por bloque, damping 0.01 y poda secuencial bloque a bloque recalibrando cada uno sobre las salidas de los bloques ya podados. La poda se ejecuto en bfloat16 y tardo 1,7 minutos en una A100 de 40 GB. Todas las capas lineales dentro de los bloques se podaron; embeddings y `lm_head` permanecen densas.

La esparsidad medida sobre los pesos publicados es de 0,9000. Al usar un umbral por bloque de 128 columnas, las filas no quedan equilibradas: en las 168 capas podadas, la fila mas densa tiene de media 3,08 veces los no-ceros de la fila media (peor capa: 5,32 veces). No hubo reentrenamiento ni recuperacion posterior a la poda. Para cargar el modelo es necesario instalar `flash-linear-attention` (`import fla`) y usar `AutoModelForCausalLM.from_pretrained(...)`.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base HGRN de 340M.
- Razonamiento y conocimiento factual muy degradados respecto al modelo denso (ver benchmarks).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Uso previsto como baseline de investigacion en poda, no como modelo de proposito general.

## Casos de uso

- Investigacion sobre poda no estructurada: sirve como referencia cuantitativa del dano de SparseGPT al 90 por ciento sin reentrenamiento sobre una arquitectura recurrente lineal, para comparar contra tecnicas con recuperacion.
- Estudio de la relacion entre esparsidad y perplejidad en modelos HGRN: permite trazar curvas de degradacion frente al checkpoint denso y a variantes con menor esparsidad.
- Analisis de desequilibrio de filas en mascarás por bloque: el patron de no-ceros (hasta 5,32 veces la media en la peor capa) es util para estudiar el impacto del desbalanceo en kernels dispersos.
- Benchmark de kernels de esparsidad: al tener una mascara no estructurada real, se puede usar para validar el rendimiento de kernels sparse en GPU frente a ejecucion densa.
- Reproducibilidad de pipelines de poda: el metodo documentado (calibracion C4, blocksize 128, damping 0.01, commit concreto) permite replicar el experimento y verificar resultados.
- Docencia y divulgacion: ejemplo didactico de por que la poda agresiva one-shot sin recuperacion no es suficiente en modelos pequenos y arquitecturas no transformer.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 2468,14 |
| C4 | 21,94 | 1652,69 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2133 |
| arc_easy | 0,6153 | 0,2727 |
| boolq | 0,6028 | 0,3786 |
| hellaswag | 0,3423 | 0,2592 |
| openbookqa | 0,2380 | 0,1360 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4996 |
| Media | 0,4400 | 0,3266 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,7 GB en safetensors (bfloat16); en la practica, con overhead de activaciones y contexto, cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el modelo base se entreno y podo en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `AutoModelForCausalLM` de Transformers con `flash-linear-attention` instalado (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 90% sparse) | 341M | no disponible | 2468,14 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M (aprox.) | no disponible | 21,96 | no disponible | Hugging Face |
| Alternativas de poda SparseGPT en transformers | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es contra el checkpoint denso del que deriva, que supera ampliamente a la version podada en todas las metricas salvo `rte`, donde la version podada es ligeramente superior (0,5271 frente a 0,5126), probablemente por ruido estadistico.

## Limitaciones y advertencias

- Degradacion severa del rendimiento: la perplejidad se multiplica por mas de 100 en WikiText-2 y por mas de 75 en C4 respecto al modelo denso; la precision media zero-shot cae de 0,44 a 0,33.
- No apto para produccion: el modelo no es utilizable para generacion de texto fiable, atencion al cliente ni tareas de codigo.
- Mascara desequilibrada: el umbral por bloque de 128 columnas produce filas con hasta 5,32 veces la media de no-ceros, lo que puede complicar el uso de kernels sparse optimizados.
- Licencia no disponible: se desconoce si permite uso comercial; debe consultarse con el autor antes de cualquier uso.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de contexto soportada.
- Dependencia de `flash-linear-attention`: la carga requiere instalar esta libreria, lo que limita la portabilidad frente a transformers estandar.
- Riesgo de alucinacion elevado por la degradacion del modelo; cualquier salida debe tratarse como no fiable.
- Sesgos conocidos: no documentados, pero hereda los del dataset de entrenamiento del modelo base (no especificado).

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit `147d215`)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
