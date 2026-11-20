# ikimyaii/Mamba-370M-semi-structured-ELSA-70pct

## Resumen

Mamba-370M-semi-structured-ELSA-70pct es un checkpoint derivado de state-spaces/mamba-370m-hf al que se le ha aplicado una poda semi-estructurada del 70 % mediante el codigo oficial de ELSA (paper arXiv:2510.01650). Lo publica el usuario ikimyaii como baseline de una familia de modelos denominada EHWS dentro de su misma cuenta. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una compresion post-entrenamiento basada en ADMM que elimina el 70 % de los pesos de las capas lineales internas de cada bloque, manteniendo el mismo numero de pesos en cada fila.

El modelo base es un Mamba puro (arquitectura de espacio de estados selectivo, SSM), no un transformer. El checkpoint publicado tiene 423.003.136 parametros reales en safetensors, con un repositorio de 1,7 GB, lo que sugiere pesos en bf16. La poda afecta a in_proj, x_proj y out_proj; dt_proj, conv1d, A_log, D, los embeddings y lm_head permanecen densos.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible de como degrada la poda semi-estructurada agresiva (70 %) a un modelo SSM de 370M, y permite comparar contra las variantes EHWS del mismo autor. No es un modelo pensado para produccion: la perplejidad en WikiText-2 sube de 14,33 a 42,85 y la media zero-shot cae de 0,4390 a 0,3895.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo), derivada de state-spaces/mamba-370m-hf |
| Parametros totales | 423.003.136 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (entrenado sobre C4, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo con recurrencia lineal en lugar de atencion cuadratica. Sobre esa base, este checkpoint aplica una poda semi-estructurada por filas: cada fila de cada capa lineal podada conserva exactamente el mismo numero de pesos (el 30 % superior), mediante la proyeccion row-wise del codigo de ELSA (`--admm_comparison_group=row`). La esparsidad medida sobre los pesos publicados es 0,6855, ligeramente inferior al 70 % nominal porque algunos pesos conservados son exactamente cero; la fila mas densa supera la media en un factor de 1,00024x como maximo.

El procedimiento de poda reutiliza la configuracion del run HGRN-1.3B @80 % del paper de ELSA, sin cambios entre modelos y niveles de esparsidad: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 x 8 de acumulacion, learning rate 2e-4, lambda 0,01, bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizer del propio modelo, semilla 0. El run completo tardo 2,80 horas en una A100 de 40 GB. No hay evidencia de RLHF, DPO ni entrenamiento adicional tras la poda; es una compresion post-entrenamiento de una sola pasada.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del Mamba-370M original, con calidad notablemente degradada por la poda.
- Razonamiento de sentido comun limitado: HellaSwag cae de 0,3722 a 0,3043 y ARC-Easy de 0,5484 a 0,4116.
- Comprension lectora basica (BoolQ 0,5933, RTE 0,5271), tareas donde la degradacion es menor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el entrenamiento de poda usa C4, corpus predominantemente en ingles.
- No dispone de vision, audio ni modo thinking.
- El modelo carga con `AutoModelForCausalLM.from_pretrained(...)` en transformers estandar.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia controlada para medir cuanto degrada la poda semi-estructurada al 70 % en un SSM de 370M, comparando directamente contra las variantes EHWS del mismo autor con la misma receta.
- Reproduccion de experimentos de compresion: al estar generado con el codigo oficial de ELSA y una configuracion documentada al detalle (pasos ADMM, semilla, corpus), permite replicar el pipeline y validar resultados de esparsidad.
- Estudio de la relacion esparsidad-calidad en arquitecturas SSM: la tabla de perplejidad y zero-shot publicada permite trazar curvas de degradacion frente al modelo denso.
- Pruebas de infraestructura de inferencia con modelos dispersos: util para validar si los kernels y runtimes desplegados aprovechan realmente la esparsidad semi-estructurada o si, por el contrario, ejecutan los pesos como densos.
- Evaluacion comparativa de metodologias de poda: confrontar ELSA con otras tecnicas (SparseGPT, Wanda, etc.) sobre el mismo modelo base Mamba-370M.
- Docencia y divulgacion: ejemplo compacto (1,7 GB) de como se aplica ADMM a la poda de un modelo de espacio de estados, ejecutable en hardware modesto.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion finalista, dada la caida de calidad medida.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4), en bf16 porque Mamba desborda en fp16. Ejecucion unica.

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 14,33 | 42,85 |
| C4 (perplejidad) | 19,40 | 38,78 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2150 |
| arc_easy | 0,5484 | 0,4116 |
| boolq | 0,6150 | 0,5933 |
| hellaswag | 0,3722 | 0,3043 |
| openbookqa | 0,1960 | 0,1500 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5249 |
| Media | 0,4390 | 0,3895 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,7 GB en safetensors (presumiblemente bf16), por lo que la inferencia en bf16 requiere del orden de 2 GB de VRAM mas el estado recurrente y el cache de activaciones.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 4-8 GB.
- GPU de datacenter (A100, H100) no necesarias para inferencia; la A100 40 GB solo se empleo para el proceso de poda (2,80 horas).
- Opciones de despliegue: transformers estandar con `AutoModelForCausalLM.from_pretrained(...)`, que es el metodo documentado por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo Mamba con esparsidad semi-estructurada, el soporte en esos runtimes no esta garantizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Mamba-370M, ELSA 70 %) | 423 M | Mamba + poda semi-estructurada | no disponible | 42,85 | no disponible | Hugging Face (0 descargas) |
| state-spaces/mamba-370m-hf (denso) | ~370 M | Mamba | no disponible | 14,33 | no disponible en esta ficha | Hugging Face (modelo base) |
| Variantes EHWS de ikimyaii | no disponible | Mamba podado | no disponible | no disponible | no disponible | Hugging Face (misma cuenta) |

No se dispone de datos de benchmarks de las variantes EHWS ni de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 casi se triplica (14,33 a 42,85) y la media zero-shot cae 5 puntos porcentuales (0,4390 a 0,3895).
- Riesgo elevado de generacion incoherente y alucinacion, derivado de la poda agresiva; no recomendado para tareas que requieran fidelidad factual.
- La esparsidad es semi-estructurada por filas, no 2:4; el aprovechamiento real depende de kernels especificos y puede no materializarse en speedups en runtimes genericos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo base state-spaces/mamba-370m-hf antes de cualquier uso.
- Idiomas no documentados; el corpus de calibracion (C4) es predominantemente ingles, por lo que el rendimiento en castellano es incierto y probablemente pobre.
- Longitud de contexto no documentada en la model card; debe consultarse la del modelo base.
- Ejecucion unica de evaluacion (sin intervalos de confianza ni multiples semillas), lo que limita la robustez estadistica de las cifras.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- El autor indica que la configuracion row-wise no aparece reportada en el paper de ELSA, por lo que no hay una referencia publicada directa para estos numeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-ELSA-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650
