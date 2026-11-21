# ikimyaii/Mamba-1.3B-semi-structured-EHWS-90pct-seed1

## Resumen

Mamba-1.3B-semi-structured-EHWS-90pct-seed1 es un checkpoint derivado de `fla-hub/mamba-1.3B-100B`, un modelo de lenguaje basado en arquitectura Mamba (space-state model, SSM) de aproximadamente 1.334 millones de parametros. Lo publica el usuario `ikimyaii` en Hugging Face como resultado de un experimento de poda (pruning) semi-estructurada al 90 % de esparsidad, aplicando una variante de dos fases del metodo ADMM denominada EHWS. No es un modelo entrenado desde cero ni afinado para una tarea concreta: es un artefacto de investigacion sobre compresion de modelos.

El interes tecnico reside en que la poda es semi-estructurada por filas: cada fila de cada capa lineal podada conserva exactamente el mismo numero de pesos (el 10 % superior), lo que garantiza un reparto de trabajo perfectamente equilibrado en hardware paralelo. Se podan las proyecciones `in_proj`, `x_proj` y `out_proj` de cada bloque, mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. El resultado medido es una esparsidad efectiva de 0.8999 sobre las 144 capas podadas.

La relevancia es doble: por un lado, documenta el coste real de comprimir un SSM a esparsidad extrema (la perplejidad en WikiText-2 pasa de 10.03 a 38.19 y la media zero-shot de lm-evaluation-harness cae de 0.4350 a 0.3744); por otro, demuestra que el pipeline completo (calibracion, ADMM, evaluacion) cabe en 4.10 horas sobre una unica A100 de 40 GB. Es, por tanto, material de referencia para quien investigue pruning sobre arquitecturas no transformer, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state-space model, SSM selectivo) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor indica que la evaluacion se hizo en bf16 porque Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Esparsidad objetivo | 90 % semi-estructurada por filas |
| Esparsidad medida | 0.8999 en las capas podadas (144 capas) |
| Tamano del repo | 5.3 GB |
| Requisito de carga | `flash-linear-attention` instalado (`import fla`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un SSM selectivo que sustituye la atencion por una recurrencia con parametros dependientes de la entrada, lo que da complejidad lineal en la longitud de secuencia. El checkpoint base (`fla-hub/mamba-1.3B-100B`) fue entrenado sobre 100.000 millones de tokens. Este checkpoint no anade entrenamiento nuevo: solo modifica los pesos mediante poda.

El procedimiento de poda consta de dos fases. La fase 1 es local, de estilo ALPS, y poda cada capa hasta el 70 % minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La fase 2 es global y aplica ADMM sobre la perdida de entropia cruzada del modelo completo mas destilacion de conocimiento, con un paso Z basado en Diag(H); se ejecutan 128 rondas de 32 pasos con lr 0.0006, lambda 0.01 constante, Adam con beta2 0.95 y semilla 1. Los datos de calibracion son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador del modelo (`fla-hub_hgrn-1.3B-100B`) y vistas una sola vez. La ejecucion completa, incluida la evaluacion, tardo 4.10 horas en una A100 de 40 GB.

La innovacion destacable no esta en la arquitectura sino en el esquema de poda: al mantener un numero identico de no-ceros en cada fila de las capas podadas, se evita el desequilibrio de carga tipico de la poda no estructurada y se habilita un aprovechamiento uniforme en kernels dispersos. El autor verifica esta propiedad sobre los pesos publicados en las 144 capas afectadas.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Mamba-1.3B.
- Razonamiento basico y respuesta a preguntas de sentido comun, aunque con degradacion apreciable respecto al denso (ver benchmarks).
- Manejo de secuencias largas con coste lineal, por la propia naturaleza del SSM.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No hay modo thinking, vision ni audio.
- La capacidad diferencial del artefacto es servir como caso de estudio reproducible de poda semi-estructurada sobre SSM.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible para medir la caida de calidad al llevar un SSM de 1.3B al 90 % de esparsidad, con el registro completo en `results.json`.
- Estudio de kernels dispersos: al tener un numero identico de no-ceros por fila en las 144 capas podadas, es un banco de pruebas ideal para validar implementaciones de SpMM balanceadas.
- Reproduccion de experimentos de pruning: el autor documenta hiperparametros, datos de calibracion y tiempos, lo que permite replicar el pipeline EHWS sobre otros checkpoints Mamba.
- Analisis de degradacion por tarea: la tabla zero-shot permite estudiar que capacidades resisten mejor la poda (winogrande y rte apenas caen) frente a las que se hunden (arc_easy, hellaswag).
- Docencia y divulgacion: ejemplo compacto de como se mide perplejidad y exactitud zero-shot antes y despues de una compresion agresiva.
- Baseline negativo en pipelines de evaluacion: util para comprobar que un harness de lm-evaluation-harness detecta correctamente modelos degradados antes de desplegarlos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion de cara al usuario final, dado el nivel de degradacion medido.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula propia), en bf16. Ejecucion unica.

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10.03 | 14.12 |
| Este modelo | 38.19 | 35.24 |

Exactitud zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0.2329 | 0.1852 |
| arc_easy | 0.5644 | 0.3813 |
| boolq | 0.6040 | 0.5783 |
| hellaswag | 0.3898 | 0.2792 |
| openbookqa | 0.1980 | 0.1460 |
| rte | 0.5343 | 0.5271 |
| winogrande | 0.5217 | 0.5241 |
| Media | 0.4350 | 0.3744 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2.7 GB solo para pesos (1.334 millones de parametros x 2 bytes), mas activaciones y cache de estado; el repo ocupa 5.3 GB en disco.
- El checkpoint se publica con la misma forma densa que el base (la esparsidad es un patron en los valores, no un formato comprimido), por lo que el ahorro de memoria y computo solo se materializa si se usan kernels dispersos que exploten el patron por filas.
- GPU recomendadas: A100 40 GB es la referencia usada por el autor para el pipeline de poda; para inferencia basta una GPU consumer con 8 GB o mas en bf16.
- Cabe en GPU consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que se use bf16; el autor advierte que fp16 provoca desbordamiento en Mamba.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B podado 90 %) | 1.334 M | no disponible | 0.3744 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | ~1.3 B | no disponible | 0.4350 | no disponible | Hugging Face |
| Alternativas transformer de ~1.3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra su propio modelo base. No se dispone de informacion sobre otros checkpoints podados de Mamba con los que contrastar.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 casi se cuadruplica (10.03 a 38.19) y la media zero-shot cae 6 puntos porcentuales.
- Caida especialmente acusada en tareas de razonamiento y sentido comun: arc_easy pasa de 0.5644 a 0.3813 y hellaswag de 0.3898 a 0.2792.
- Riesgo elevado de alucinacion y de respuestas incoherentes en generacion libre, coherente con la perplejidad medida.
- Sesgos conocidos: no documentados en la informacion disponible; los del modelo base no se detallan.
- Restricciones de licencia: la licencia no esta declarada, lo que impide asumir uso comercial permitido.
- Idiomas soportados: no declarados.
- Longitud de contexto: no declarada.
- El checkpoint es denso en formato: sin kernels dispersos compatibles con el patron por filas, no se obtiene ninguna ventaja de velocidad ni de memoria frente al base.
- Ejecucion unica con semilla fija (seed 1): no hay intervalos de confianza ni replicas que permitan estimar la varianza de los resultados.
- No hay pipeline declarado ni demo; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Requiere `flash-linear-attention`; sin esa dependencia la carga con `AutoModelForCausalLM` falla.
- No usar en produccion de cara al usuario sin una evaluacion propia y exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-90pct-seed1
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Repositorio flash-linear-attention (dependencia de carga): https://github.com/fla-org/flash-linear-attention
- Codigo oficial de ELSA (protocolo de evaluacion y datos de calibracion C4): no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- `results.json` con el registro completo de la ejecucion: incluido en el repositorio del modelo
