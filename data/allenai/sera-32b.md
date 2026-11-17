# allenai/SERA-32B

## Resumen

SERA-32B es un agente de codigo abierto desarrollado por el Allen Institute for AI (Ai2) y presentado como el primer modelo de la serie Open Coding Agents. Se construye mediante ajuste supervisado (SFT) sobre Qwen 3-32B, utilizando trayectorias sinteticas de agente generadas por un modelo profesor de mayor tamano, GLM-4.6 (357B). El modelo esta disenado especificamente para tareas de ingenieria de software automatizada: correccion de bugs, implementacion de funcionalidades y refactorizacion sobre repositorios reales.

Su relevancia radica en el metodo de generacion de datos, denominado Soft Verified Generation (SVG), que elimina la necesidad de ejecutar tests para verificar los parches generados y reduce el coste de entrenamiento a aproximadamente 2.000 dolares (40 dias-GPU). Con 32.762 millones de parametros y una ventana de contexto de 32K tokens, alcanza un 49,5% de resolve rate en SWE-bench Verified, situandose a la altura de modelos abiertos frontera como Devstral-Small-2 (24B) y GLM-4.5-Air (110B), y muy por encima de su modelo base Qwen 3-32B (24,4%).

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3-32B) |
| Parametros totales | 32.762.123.264 (32,76B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en BF16/FP16; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | No disponible (no declarados en la model card; el entrenamiento se centra en codigo Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SERA-32B parte de Qwen 3-32B, un transformer decoder-only denso de 32,76B parametros, y se ajusta mediante SFT sobre 25.000 trayectorias sinteticas de agente generadas con Soft Verified Generation (SVG). SVG es un pipeline de dos rollouts: en el primero, el modelo profesor (GLM-4.6, 357B) modifica un codebase partiendo de una funcion seleccionada al azar; la trayectoria se convierte en una descripcion de pull request sintetica; en el segundo rollout, el profesor intenta reproducir el cambio disponiendo unicamente de esa descripcion. La verificacion es "blanda": se compara el parche con el original mediante recall a nivel de linea, sin ejecutar tests. Esto elimina la dependencia de infraestructura de testing y permite generar datos a partir de cualquier repositorio; las trayectorias provienen de 121 codebases Python.

La configuracion de entrenamiento es de 3 epocas, learning rate 1e-5, weight decay 0.01 y longitud maxima de secuencia de 32.768 tokens, usando Axolotl como framework y vLLM para inferencia. El coste total declarado es de unos 2.000 dolares (40 dias-GPU), y el autor afirma que SVG es 26 veces mas barato que RL y 57 veces mas barato que metodos previos de datos sinteticos para alcanzar rendimiento equivalente. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion y edicion de codigo en tareas de ingenieria de software: correccion de bugs, implementacion de features y refactorizacion sobre repositorios.
- Razonamiento multi-paso sobre codebases: lectura de ficheros, localizacion de funciones relevantes y aplicacion de parches coherentes.
- Soporte de tool calling / function calling, con parser de herramientas `hermes` en vLLM y flag `--enable-auto-tool-choice`.
- Comportamiento de agente autonomo orientado a completar tareas de principio a fin dentro de un repositorio.
- Integracion con Claude Code a traves de la CLI `sera` (proxy que gestiona la llamada a la herramienta `submit`).
- Contexto de 32K tokens, adecuado para explorar ficheros y mantener el estado de la tarea.
- Capacidades multilingues: no documentadas; el entrenamiento se limita a repositorios Python.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Correccion automatizada de bugs en produccion: el modelo recibe el repositorio y una descripcion del fallo, localiza la funcion afectada y propone un parche; su entrenamiento con trayectorias de agente y su 49,5% en SWE-bench Verified lo hacen adecuado para triaje de issues en pipelines de CI.
- Implementacion de funcionalidades a partir de descripciones tipo PR: al haberse entrenado con descripciones de pull request sinteticas, el modelo traduce una especificacion en cambios de codigo concretos sobre el codebase.
- Refactorizacion asistida: puede reorganizar funciones y modulos manteniendo coherencia en repositorios de tamano medio gracias a los 32K tokens de contexto.
- Especializacion en codebases privados: el autor documenta el ajuste fino sobre repositorios propios con aproximadamente 8.000 trayectorias y un coste de unos 1.300 dolares, lo que permite crear agentes adaptados a dominios internos.
- Integracion en asistentes de desarrollo tipo Claude Code: mediante la CLI `sera` o un endpoint propio en vLLM, el modelo actua como backend de un agente de codigo en el editor o terminal.
- Investigacion sobre agentes de codigo y generacion de datos: el codigo, los pesos y el metodo SVG estan publicos, lo que facilita reproducir experimentos y estudiar el comportamiento de agentes.
- Automatizacion de tareas de mantenimiento en monorepos Python: analisis de ficheros, propuesta de cambios y generacion de descripciones de PR dentro de un flujo de revision humana.

## Benchmarks y rendimiento

Resultados en SWE-bench Verified a 32K de contexto (desviacion estandar sobre 3 semillas aleatorias):

| Modelo | Tipo | Resolve rate |
|---|---|---|
| SkyRL-8B | Open-source | 9,4% |
| Nex-N1-8B | Open-source | 20,3% |
| Qwen 3-32B (base) | Open-weight | 24,4% |
| SERA-8B | Open-source | 31,7% |
| SWE-smith | Open-source | 32,6% |
| SkyRL-Agent | Open-source | 39,4% |
| DeepSWE | Open-source | 42,2% |
| **SERA-32B** | **Open-source** | **49,5% ± 1,9%** |
| Devstral-Small-2 (24B) | Open-weight | 50,0% |
| GLM-4.5-Air (110B) | Open-weight | 50,5% |

Variantes de la familia SERA:

| Modelo | Base | Profesor | SWE-bench Verified |
|---|---|---|---|
| SERA-32B | Qwen 3-32B | GLM-4.6 | 49,5% ± 1,9% |
| SERA-32B-GA | Qwen 3-32B | GLM-4.5-Air | 46,6% ± 0,7% |
| SERA-8B | Qwen 3-8B | GLM-4.6 | 31,7% ± 0,9% |
| SERA-8B-GA | Qwen 3-8B | GLM-4.5-Air | 31,7% ± 0,4% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en BF16/FP16 los 32,76B parametros requieren aproximadamente 65 GB de pesos, mas overhead de KV cache; en cuantizacion de 8 bits unos 33 GB y en 4 bits unos 17-20 GB (estimaciones a partir del tamano del repo de 65,5 GB; el autor no publica cifras oficiales).
- GPU recomendadas: el despliegue de referencia usa `--tensor-parallel-size 4`, lo que encaja con 4x A100 80GB, 4x H100 80GB o 4x L40S 48GB. Para una sola GPU de 80 GB (A100/H100) es viable en BF16 con contexto reducido.
- Consumer GPU: en BF16 no cabe en ninguna GPU de consumo actual. Con cuantizacion de 4 bits podria ejecutarse en una RTX 4090 (24 GB) o RTX 5090, aunque el autor no valida esta configuracion.
- Opciones de despliegue: vLLM es el framework de referencia (con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser hermes`, `--enforce-eager`, `--disable-cascade-attn`); la CLI `sera` permite desplegar en Modal o contra un endpoint existente. No se documenta soporte oficial de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica que la primera ejecucion con `--modal` tarda unos 10 minutos en descargar y compilar, y las siguientes 1-2 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SERA-32B | 32,76B | 32K | 49,5% | Apache 2.0 | Pesos, codigo y datos (dataset anunciado) |
| Devstral-Small-2 | 24B | No disponible | 50,0% | No disponible | Solo pesos (open-weight) |
| GLM-4.5-Air | 110B | No disponible | 50,5% | No disponible | Solo pesos (open-weight) |
| DeepSWE | No disponible | No disponible | 42,2% | No disponible | Open-source |
| Qwen 3-32B (base) | 32,76B | No disponible | 24,4% | No disponible | Open-weight |

SERA-32B iguala en rendimiento a modelos abiertos de mayor tamano (GLM-4.5-Air, 110B) con un tercio de los parametros, y supera claramente a su base Qwen 3-32B. Su ventaja diferencial frente a Devstral-Small-2 y GLM-4.5-Air es la apertura completa (pesos, codigo y datos) bajo Apache 2.0.

## Limitaciones y advertencias

- Artefacto de entrenamiento: al haberse entrenado con tareas estilo SWE-bench, el modelo puede intentar invocar una herramienta `submit` inexistente al terminar de editar; el proxy de `sera-cli` lo gestiona automaticamente.
- Alcance de evaluacion limitado: solo se ha validado en SWE-bench Verified sobre repositorios Python; el rendimiento en otros lenguajes o benchmarks es desconocido.
- Techo del profesor: el rendimiento esta acotado en gran medida por la capacidad de GLM-4.6 (357B).
- Varianza estadistica: los resultados se reportan con desviaciones estandar sobre 3 semillas (±1,9% en el caso de SERA-32B).
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre codigo Python de 121 repositorios, puede heredar sesgos de estilo y practicas de esos proyectos.
- Riesgo de alucinacion: no cuantificado; en tareas de edicion de codigo puede generar parches que no compilan o que no resuelven el problema, por lo que se recomienda revision humana.
- Idiomas: no se declaran idiomas soportados; el foco es codigo, no texto general multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen 3-32B y de los datos de entrenamiento (dataset anunciado como "coming soon").
- Produccion: requiere infraestructura de GPU considerable (4 GPU para el despliegue de referencia) y no hay validacion publicada de cuantizaciones ni de otros motores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/SERA-32B
- Paper: https://allenai.org/papers/opencodingagents
- Codigo: https://github.com/allenai/SERA
- CLI: https://github.com/allenai/sera-cli
- PyPI de la CLI: https://pypi.org/project/ai2-sera-cli/
- Coleccion Open Coding Agents: https://huggingface.co/collections/allenai/open-coding-agents
- Dataset Sera-4.6-Lite-T2: https://huggingface.co/datasets/allenai/Sera-4.6-Lite-T2
- Variante SERA-32B-GA: https://huggingface.co/allenai/SERA-32B-GA
- Variante SERA-8B: https://huggingface.co/allenai/SERA-8B
- Variante SERA-8B-GA: https://huggingface.co/allenai/SERA-8B-GA
- arXiv: 2601.20789 (referenciado en los tags del repositorio)
