# hhy13/qwen3.5-9b-quality-amreg-10x

## Resumen

`hhy13/qwen3.5-9b-quality-amreg-10x` no es un modelo completo, sino un repositorio con tres **cartuchos de KV-cache** entrenados para `Qwen/Qwen3.5-9B`, un modelo denso de 9.000 millones de parametros con arquitectura hibrida GatedDeltaNet y codificador de vision. Los cartuchos almacenan el estado de atencion (claves y valores) destilado sobre grupos de documentos del benchmark QuALITY, de modo que el conocimiento se inyecta en el modelo sin modificar sus pesos.

El repositorio recoge el brazo lambda = 0,22 (diez veces el peso de referencia lambda_1x = 0,022) de un experimento que evalua si un regularizador de salida de atencion (*attention matching*, AM) reduce el olvido catastrofico en una cadena de aprendizaje continuo **sin replay**, es decir, sin repasar los grupos de documentos ya vistos. Se publican tres etapas de la cadena (g0, g5 y g9), cada una con su cartucho final, su configuracion resuelta y el estado de modulo correspondiente.

Su interes es fundamentalmente de investigacion: cuantifica, con numeros concretos de exactitud en QuALITY, cuanto se gana (aproximadamente un punto) al anadir el regularizador frente al control sin regularizacion, y deja artefactos reproducibles (configuraciones, semillas de evaluacion y estado congelado de etapas previas) para quien quiera replicar o extender el estudio. El entrenamiento se realizo sobre una AMD MI350X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base: transformer hibrido GatedDeltaNet (8 capas de atencion completa cubiertas por el cartucho). El cartucho es estado KV, no una red neuronal entrenada de forma convencional |
| Parametros totales | Modelo base: 9B (denso). Cartucho: sin parametros de modelo; estado KV de 8 capas x 4 cabezas KV x head_dim 256 |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | Modelo base: 262.144 tokens (hasta 1M segun la ficha de Awesome Agents). Cartucho: 48.048 tokens de estado KV en la etapa g9 (43.264 congelados + 4.784 entrenados) |
| Tipos de cuantizacion | No disponible para el cartucho (se distribuye en `.pt`); no se documentan recetas de cuantizacion de los cartuchos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`cartridge.pt`, `module_state.pt`) mas `config.yaml`, `config_resolved.yaml` y `module_state.json` |
| Tamano del repositorio | 5,6 GB |
| Hardware de entrenamiento | AMD MI350X |
| Etapas incluidas | g0 (`am`), g5 (`stacked_am`), g9 (`stacked_am`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-9B, emplea atencion hibrida con *gated delta networks* y un codificador de vision, con soporte de decodificacion multi-token (MTP) segun la receta de vLLM. El cartucho cubre exclusivamente sus 8 capas de atencion completa y arrastra tambien el estado GDN; su configuracion declara 8 capas, 4 cabezas KV y `head_dim` 256, con atencion softmax global y consultas con RoPE ya aplicado en el momento de servir.

El entrenamiento parte de una compactacion AM (*attention matching*) con inicializacion condicionada por rango y regularizacion ridge 1e-4, seguida de destilacion sobre claves y valores con `lr = 0,02`, scheduler coseno y 16 pasos de calentamiento. No hay replay de grupos anteriores. El regularizador anadido es `L_reg = mean ||X - Y||^2` sobre las salidas de atencion, con normalizacion absoluta respecto a los tokens entrenables, y se aplica sobre cuatro sondas: `narrative`, `code`, `passage_qa` y `repeat_prefill`, con 512 consultas de pool por sonda y 512 consultas por paso. La cadena tiene tres etapas publicadas (g0, g5, g9); en g5 y g9 el `cartridge.pt` incluye ademas la pila congelada de los grupos previos.

## Capacidades

- Resolucion de preguntas de opcion multiple sobre documentos largos (QuALITY) mediante estado KV precomputado, sin reentrenar pesos.
- Retencion de conocimiento de grupos anteriores dentro de una cadena de aprendizaje continuo sin replay.
- Absorcion de un grupo nuevo de documentos con una degradacion medida de aproximadamente un punto en los grupos antiguos.
- Aprendizaje incremental sobre dominio cerrado: cada etapa anade documentos sin acceso a los datos originales de las etapas previas.
- Reutilizacion del estado KV como prefijo, lo que evita recalcular el prefill de los documentos ya procesados.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision operativa a traves del cartucho ni modo de razonamiento explicito para estos artefactos.

## Casos de uso

- **Evaluacion de olvido catastrofico en aprendizaje continuo**: el repositorio sirve como linea base reproducible con tres puntos de la cadena (g0, g5, g9) y su control lambda = 0, lo que permite medir la curva de retencion frente al grupo nuevo con exactitud greedy en QuALITY.
- **Sustitucion parcial de RAG en corpus estaticos**: para un conjunto fijo de documentos de referencia, precargar el cartucho evita recuperar y reprocesar fragmentos en cada consulta; el coste pasa a ser memoria de estado KV (aproximadamente 1,6 GB en 16 bits para g9) en lugar de llamadas al indice.
- **Investigacion sobre regularizadores de atencion**: el barrido de lambda (0,022 de referencia, 0,066 y 0,22) con configuracion resuelta incluida permite aislar el efecto del termino `L_reg` sobre la retencion, manteniendo el resto del pipeline constante.
- **Prototipado de asistentes sobre documentacion normativa o tecnica**: un cartucho por etapa permite comparar comportamiento entre una version antigua y una actualizada de un mismo corpus sin duplicar el modelo base.
- **Ajuste de latencia en serving con prefijo cacheado**: al servir el estado KV ya entrenado, se elimina el coste de prefill de decenas de miles de tokens, util en entornos donde el modelo base (que cabe en una GPU de 24 GB) atiende consultas repetidas sobre el mismo material.
- **Docencia y replicacion experimental**: los ficheros `config_resolved.yaml` y `module_state.json` documentan hiperparametros y estructura, lo que facilita reproducir el experimento en otro hardware.

## Benchmarks y rendimiento

Exactitud greedy en QuALITY en la ultima ronda de evaluacion (paso 384 para g0, paso 416 para g5 y g9):

| Etapa | Tipo de cartucho | Tokens (congelados / total) | Todos los grupos | Grupos antiguos g0..g(k-1) | Grupo nuevo gk | Control lambda = 0 (todos / antiguos / nuevo) |
|---|---|---|---|---|---|---|
| g0 | `am` | 3 / 5.200 | 0,6782 | - | 0,6782 | 0,6782 |
| g5 | `stacked_am` | 23.808 / 29.168 | 0,6220 | 0,5961 | 0,7500 | 0,6117 / 0,5850 / 0,7432 |
| g9 | `stacked_am` | 43.264 / 48.048 | 0,6301 | 0,6188 | 0,7405 | 0,6220 / 0,6103 / 0,7366 |

Observaciones publicadas por el autor: en g0, lambda = 10x obtiene exactamente la misma puntuacion que el control, mientras que lambda = 3x (0,066) alcanzo 0,7059 en ese mismo grupo (ese cartucho no se incluye en el repositorio). En g5 y g9 la mejora respecto al control es de aproximadamente un punto. Las dos replicas con lambda = 0 fueron identicas bit a bit en este hardware, por lo que no existe estimacion de ruido entre ejecuciones. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) para estos cartuchos en la informacion disponible.

## Requisitos de hardware

- **Modelo base**: 9B denso; la receta de vLLM indica que cabe con holgura en una unica GPU de 24 GB. En bf16 los pesos ocupan del orden de 18 GB, por lo que una RTX 4090 de 24 GB funciona con margen ajustado y requiere cuantizacion para dejar sitio al estado KV.
- **Cartucho g9**: 48.048 tokens x 8 capas x 2 (claves y valores) x 4 cabezas x 256 dimensiones = aproximadamente 787 millones de valores, es decir, unos 1,6 GB en 16 bits (estimacion derivada de la configuracion, no publicada por el autor).
- **Repositorio completo**: 5,6 GB en disco, incluyendo las tres etapas y las pilas congeladas de g5 y g9.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S 48 GB o MI350X para entrenamiento y para servir con contexto largo; RTX 4090 / 3090 (24 GB) para inferencia cuantizada del modelo base con una sola etapa cargada.
- **Despliegue**: vLLM dispone de receta para Qwen3.5-9B; llama.cpp u Ollama sirven el base cuantizado, pero los cartuchos requieren codigo de serving propio que implemente atencion softmax global y consultas con RoPE aplicado. No se documenta soporte nativo en TGI ni en vLLM para inyectar estos `.pt`.
- **Latencia y throughput**: no disponibles para estos cartuchos. Para el modelo base, benchable.ai situa el rendimiento en velocidad en el percentil 10 y la fiabilidad global en un 83 % de exito.

## Comparativa con modelos similares

No se dispone de datos publicados de otros cartuchos de KV-cache comparables en la informacion proporcionada, por lo que la comparacion se limita a las variantes internas del mismo experimento.

| Artefacto | Parametros | Contexto | QuALITY (todos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo, lambda = 0,22 (g9) | Estado KV de 48.048 tokens + base 9B | 262.144 tokens (base) | 0,6301 | Apache 2.0 | Publicado |
| Control lambda = 0 (g9) | Estado KV de 48.048 tokens + base 9B | 262.144 tokens (base) | 0,6220 | Apache 2.0 | Referencia en la model card, no como artefacto |
| lambda = 0,066 (solo g0) | Estado KV de 5.200 tokens + base 9B | 262.144 tokens (base) | 0,7059 en g0 | Apache 2.0 | No incluido en el repositorio |
| Qwen3.5-9B sin cartuchos | 9B densos | 262.144 tokens | No disponible | Apache 2.0 | Publico |
| Cartuchos de la cadena completa g0-g11 | No disponible | No disponible | No disponible | No disponible | Dataset `hhy13/quality-g0-g11-qwen3.5-9b` |

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: sin el checkpoint de Qwen3.5-9B y sin codigo de serving compatible, los `.pt` no son utilizables.
- La evaluacion se limita a QuALITY con decodificacion greedy; no hay datos de MMLU, codigo, matematicas ni de ningun otro dominio.
- No existe estimacion de ruido entre ejecuciones: las dos replicas del control fueron identicas bit a bit, de modo que la mejora de aproximadamente un punto en g5 y g9 no puede separarse de la varianza del entrenamiento.
- El brazo con mejor resultado en g0 (lambda = 3x, 0,7059 frente a 0,6782) no se incluye, lo que sesga el conjunto publicado hacia la hipotesis de que mas regularizacion es mejor.
- Solo se publican tres etapas (g0, g5, g9) de una cadena mas larga que, segun el dataset asociado, llega a once grupos; el comportamiento intermedio y final no esta documentado.
- El cartucho arrastra estado GatedDeltaNet y esta atado a la version concreta del modelo base; cambios en el checkpoint o en la implementacion de atencion pueden invalidarlo.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes, publicado en octubre de 2026): no hay evidencia externa de reproducibilidad.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los terminos del checkpoint de Qwen antes de un uso comercial.
- No se documentan sesgos, idiomas soportados ni tasas de alucinacion especificas para estos cartuchos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hhy13/qwen3.5-9b-quality-amreg-10x
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset asociado (QuALITY g0-g11): https://huggingface.co/datasets/hhy13/quality-g0-g11-qwen3.5-9b
- Ficha de Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Benchmarks y fiabilidad en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- VRAM y especificaciones en apxml: https://apxml.com/models/qwen35-9b
