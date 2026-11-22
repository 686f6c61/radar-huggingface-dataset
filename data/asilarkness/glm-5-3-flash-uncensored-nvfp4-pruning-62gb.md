# Asilarkness/GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB

## Resumen

GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB es una variante podada a nivel de expertos del modelo orcarouter/GLM-5.3-Flash-Uncensored-NVFP4, una version abliterada (sin rechazos de seguridad) del GLM-5.3-Flash de 314B parametros con arquitectura MoE y expertos cuantizados en NVFP4. El autor, Asilarkness, aplica una seleccion de expertos enrutados para reducir el modelo de 288 a 92 expertos por capa, obteniendo unos 107B parametros totales con aproximadamente 18B activos por token, manteniendo el enrutamiento top-8 original. El objetivo declarado es que el modelo quepa integramente en una unica GPU de 96 GB (probado en RTX PRO 6000 Blackwell), algo imposible con el modelo completo.

La poda no es generica: se disena especificamente para cargas de trabajo agenticas, tool calling y codigo, con una seleccion de expertos ponderada por dominio. El resultado ocupa 62 GiB en disco, con expertos enrutados en NVFP4 y proyecciones de atencion en FP8 E4M3 para ahorrar memoria adicional. La licencia es MIT y el modelo se distribuye en formato safetensors para transformers, con un motor de inferencia propio incluido en el repositorio.

Es relevante porque demuestra una tecnica practica (REAP + seleccion ponderada por dominio) para desplegar modelos MoE masivos en hardware de gama alta pero no de centro de datos, a costa de degradar deliberadamente el conocimiento enciclopedico y los idiomas poco representados. Los idiomas soportados declarados son ingles y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash, `glm5_next`), con atencion KDA/MLA, expertos compartidos y tower de vision |
| Parametros totales | 58.071.277.334 (safetensors del repo); ~107B segun la model card del modelo completo podado |
| Parametros activos | ~18B por token (top-8 routing sin cambios) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos enrutados; FP8 E4M3 con escalas por canal de salida en proyecciones de atencion, expertos compartidos y MLPs densos de capas 0-2; 8-bit (tag) |
| Idiomas soportados | en, ru |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, `float-quantized`), transformers |
| Expertos enrutados por capa | 92 de 288 (modelo completo: 288) |
| Tamano en disco | 62.0 GiB (repo: 172.4 GB, incluye historial y motor) |
| Modelo base | orcarouter/GLM-5.3-Flash-Uncensored-NVFP4 (abliterado, 314B MoE, NVFP4) |
| Cabeza MTP especulativa | eliminada en esta version |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de GLM-5.3-Flash: capas de mezcla de expertos con 288 expertos enrutados por capa en el modelo original, enrutamiento top-8, expertos compartidos, proyecciones de atencion KDA (q/k/v/o) y MLA (q_b/o), hiperconexiones y un tower de vision para entrada image-text-to-text. Esta variante no reentrena pesos: copia los bytes NVFP4 de los expertos seleccionados de forma bit-exacta, reindexa las filas del router y convierte a FP8 E4M3 las proyecciones grandes, los expertos compartidos y los MLPs densos de las capas 0-2.

La seleccion de expertos se hizo con una pasada forward exacta capa por capa del modelo completo de 191 GiB sobre un conjunto de calibracion etiquetado por dominio: 284 secuencias de 2048 tokens con trayectorias SWE-agent, function calling de Hermes/Glaive y en formato nativo de GLM, codigo de Magicoder/CodeFeedback, trazas de OpenCodeReasoning, chat en ruso (GrandMaster-PRO-MAX), chat en ingles (UltraChat) y matematicas. Sobre esa base se calculo la saliencia REAP por experto y dominio (suma sobre tokens enrutados de `gate_weight · ‖expert_output‖₂`, normalizada por capa) y se aplico una seleccion ponderada por prioridad: tool calling nativo 0.20, trayectorias SWE 0.20, codigo 0.18, razonamiento sobre codigo 0.10, chat RU 0.10, chat EN 0.10, texto de tool calling Hermes 0.06 y matematicas 0.06. Los dominios de conocimiento enciclopedico, ciencia e idiomas raros se excluyeron deliberadamente de la proteccion. Los indices de expertos conservados por capa estan en `keep.json`.

## Capacidades

- Generacion de texto conversacional en ingles y ruso.
- Tool calling y function calling, con soporte explicito del formato nativo de GLM (`tools=`, `<tool_call>`, `<arg_key>`) y del formato textual de Hermes/Glaive.
- Razonamiento agentico multi-paso con bucle de herramientas reales (listado de directorios, lectura y escritura de ficheros, ejecucion de Python y de tests).
- Generacion y razonamiento sobre codigo, con enfasis en tareas tipo SWE-agent (corregir bugs hasta pasar tests).
- Matematicas a nivel basico-intermedio, con menor proteccion en la seleccion de expertos.
- Vision: el tower de vision se conserva intacto y el pipeline es image-text-to-text.
- Modo "uncensored": el modelo base esta abliterado, por lo que no aplica rechazos de seguridad alineados.
- Capacidad multilingue limitada a ingles y ruso; otros idiomas no estan protegidos en la poda.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede recibir un repositorio, leer ficheros, aplicar parches y ejecutar tests en bucle hasta que pasen, gracias a la proteccion de los expertos de trayectorias SWE y tool calling nativo. Los tests funcionales del autor muestran tareas de correccion de bugs resueltas en 5 pasos y 5 llamadas sin llamadas malformadas.
- Automatizacion de tareas de datos con herramientas: agregar ficheros CSV en un informe de ingresos mediante `read_file`/`write_file`/`run_python`, un escenario validado en la model card con 4 pasos y 5 llamadas.
- Asistente de terminal o IDE con function calling: integrable via API compatible con OpenAI (`/v1/chat/completions`) en pipelines de CI/CD o entornos de desarrollo para generar y ejecutar codigo con verificacion.
- Agentes conversacionales en ruso: el modelo conserva chat RU con una degradacion de perplejidad del 3,5% respecto al completo, adecuado para asistentes multi-turno en ese idioma.
- Despliegue en una sola GPU de 96 GB: permite servir un MoE de ~107B con ~18B activos en una RTX PRO 6000 Blackwell sin infraestructura multi-GPU, util para laboratorios y equipos con hardware limitado.
- Procesamiento de documentos con imagen y texto: al conservar el tower de vision, puede emplearse en pipelines image-text-to-text (descripcion, extraccion, respuesta sobre capturas o documentos escaneados).
- Experimentacion con modelos sin filtros de seguridad: para investigacion sobre comportamiento de modelos abliterados en entornos controlados.

## Benchmarks y rendimiento

Perplejidad en held-out (60 secuencias de 2048 tokens no usadas en la seleccion), comparando modelo completo frente a esta version podada:

| Dominio | Modelo completo | Este modelo | Delta | Acuerdo top-1 |
|---|---|---|---|---|
| Tool calling (formato nativo GLM) | 19.13 | 19.22 | +0.5% | 62.8% |
| Trayectorias SWE agent | 3.41 | 3.20 | -6.1% | 78.9% |
| Codigo (instruct) | 5.34 | 4.51 | -15.4% | 76.4% |
| Trazas de razonamiento sobre codigo | 2.98 | 3.24 | +8.7% | 82.2% |
| Tool calling (texto Hermes/Glaive) | 5.96 | 9.68 | +62.4% | 65.9% |
| Chat RU | 10.85 | 11.23 | +3.5% | 55.6% |
| Chat EN | 11.76 | 14.45 | +22.9% | 57.2% |
| Matematicas | 5.91 | 6.37 | +7.7% | 75.5% |

Tests funcionales de agente con herramientas reales y verificacion objetiva (temperatura 0):

| Tarea | Resultado | Pasos | Llamadas | Llamadas malformadas |
|---|---|---|---|---|
| Corregir 3 bugs en repo Python hasta pasar tests (tarea en ruso) | resuelta | 5 | 5 | 0 |
| Agregar 3 CSV en un informe de ingresos (tarea en ruso) | resuelta | 4 | 5 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, SWE-bench, BFCL, LiveCodeBench) en la informacion disponible. El propio autor advierte que estos datos son senales de "nada se ha roto", no puntuaciones de benchmark.

## Requisitos de hardware

- VRAM estimada: 67,5 GiB tras la carga y ~76 GB durante la generacion con el motor incluido. Una GPU de 96 GB es el objetivo; las de 80 GB son "muy justas y no probadas".
- GPU recomendadas: RTX PRO 6000 Blackwell 96 GB (unica probada); A100/H100 de 80 GB no verificadas y probablemente insuficientes con este motor.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo actual.
- Opciones de despliegue: motor propio incluido en `inference/` (PyTorch + Transformers, API compatible con OpenAI, `serve.py`), con requisitos `transformers>=5.16`, `torch>=2.11`, `safetensors` y `flash-linear-attention` muy recomendado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el autor solo indica que la carga tarda 1-2 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos/capa | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|
| Este modelo (podado) | ~107B totales, ~18B activos | 92 de 288 | no disponible | MIT | 1 GPU 96 GB |
| orcarouter/GLM-5.3-Flash-Uncensored-NVFP4 (completo) | ~314B totales, ~18B activos | 288 | no disponible | no disponible | 191 GiB de pesos, no cabe en 96 GB |
| GLM-5.3-Flash (original, no abliterado) | ~314B totales | 288 | no disponible | no disponible | multi-GPU |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria; la unica comparacion cuantitativa publicada es la perplejidad frente al modelo completo.

## Limitaciones y advertencias

- La poda degrada deliberadamente el conocimiento enciclopedico, cientifico y los idiomas poco representados; no se protegio ningun experto para esos dominios.
- Perdida notable en tool calling en formato textual Hermes/Glaive (+62,4% de perplejidad) y en chat en ingles (+22,9%); el formato nativo de GLM se conserva mucho mejor (+0,5%).
- El acuerdo top-1 con el modelo completo es bajo en varios dominios (55,6% en chat RU, 57,2% en chat EN), lo que indica divergencia real en las salidas aunque la perplejidad no empeore.
- Modelo "uncensored" (abliterado): no aplica rechazos de seguridad, con el riesgo asociado en produccion.
- Riesgo de alucinacion no evaluado; no hay benchmarks estandar publicados.
- La revision 2 se reconstruyo desde cero; la revision anterior (80 expertos) perdio capacidad multilingue y de tool calling y solo esta en el historial git.
- El nombre del repo conserva "62GB" por estabilidad de enlaces, pero los pesos son 62 GiB.
- La cabeza MTP de decodificacion especulativa fue eliminada, por lo que no se dispone de esa aceleracion.
- Requiere un motor de inferencia propio; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en produccion.
- Longitud de contexto no documentada en la informacion disponible.
- Solo ingles y ruso declarados; el resto de idiomas no estan garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/Asilarkness/GLM-5.3-Flash-Uncensored-NVFP4-Pruning-62GB
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-NVFP4
- Indices de expertos conservados: `keep.json` en el repositorio
- Motor de inferencia: carpeta `inference/` del repositorio (`serve.py`)
