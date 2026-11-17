# allenai/SERA-8B

## Resumen

SERA-8B es un agente de programación (coding agent) de código abierto desarrollado por el Allen Institute for AI (Ai2), presentado como la tercera entrega de la serie Open Coding Agents. Se construye mediante fine-tuning supervisado del modelo base Qwen 3-8B (8.190.735.360 parámetros) sobre trayectorias sintéticas de agentes generadas por el modelo profesor GLM-4.6 (357B). Su objetivo es resolver tareas de ingeniería del software de extremo a extremo: localizar el problema en un repositorio, editar varios ficheros y producir un parche que resuelva el issue.

El dato más relevante es su rendimiento en SWE-bench Verified: 31,7% ± 0,9% con contexto de 32K, medido sobre tres semillas aleatorias. Con solo 8B de parámetros supera al Qwen 3-32B base (24,4%) y se sitúa ligeramente por debajo de SWE-smith (32,6%), un modelo de mayor tamaño. La ficha se publica bajo licencia Apache 2.0, con pesos en safetensors y un CLI propio (`ai2-sera-cli`) que lo integra con Claude Code.

La relevancia actual reside en que demuestra que es posible obtener un agente de software competitivo con un presupuesto de entrenamiento reducido (40 GPU-días, aproximadamente 2.000 USD) y sin ejecutar tests durante la generación de datos, gracias a la técnica de Soft Verified Generation (SVG). Esto abarata la especialización sobre repositorios privados, que el autor estima en unos 8.000 trajectories por 1.300 USD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3-8B); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el CLI descarga un checkpoint de ~65 GB, compatible con vLLM) |
| Idiomas soportados | no disponible (el modelo base Qwen 3 es multilingüe, pero el autor no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SERA-8B parte del transformer decoder-only Qwen 3-8B y se entrena con supervisión sobre trayectorias sintéticas de agentes, sin RLHF ni DPO documentados. El autor no detalla innovaciones arquitectónicas propias: la contribución está en el pipeline de datos y en el ajuste fino, no en la topología del modelo. El entrenamiento se realizó con Axolotl, 3 épocas, learning rate 1e-5, weight decay 0,01 y longitud máxima de secuencia de 32.768 tokens, con un coste de 40 GPU-días (aproximadamente 2.000 USD). La inferencia de referencia usa vLLM.

La innovación técnica central es la Soft Verified Generation (SVG), un pipeline de dos rollouts. En el primero, el profesor GLM-4.6 modifica un código partiendo de una función seleccionada al azar; la trayectoria se convierte en una descripción de pull request sintética. En el segundo, el profesor intenta reproducir el cambio disponiendo solo de esa descripción. La verificación compara los parches mediante recall a nivel de línea, sin ejecutar tests, lo que elimina la dependencia de infraestructura de testing y permite generar datos desde cualquier repositorio. Los datos provienen de 121 bases de código Python y el dataset asociado se anuncia como "coming soon" (la model card cita 25.000 ejemplos de `allenai/Sera-4.6-Lite-T2`).

## Capacidades

- Edición de código multi-fichero orientada a resolver issues reales en repositorios Python.
- Razonamiento agéntico multi-paso: exploración del repositorio, localización del fallo, aplicación del parche y verificación.
- Generación de parches en formato de pull request a partir de una descripción de issue.
- Integración con tool calling a través del CLI `sera`, que actúa como proxy y gestiona la llamada a la herramienta `submit` al terminar la edición.
- Compatibilidad con Claude Code mediante el CLI oficial y despliegue en Modal o contra un endpoint propio.
- Capacidad de especialización por repositorio mediante fine-tuning sobre trayectorias propias.
- Capacidades multilingües: no disponibles de forma explícita; el autor solo valida Python.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Resolución automática de issues en repositorios Python: el agente recibe la descripción del issue, explora el código con 32K de contexto y genera un parche; encaja en flujos de triaje donde un humano revisa el diff antes de fusionar.
- Mantenimiento de dependencias y refactorizaciones: se le puede pedir que actualice llamadas a una API obsoleta en varios ficheros y produzca un PR coherente, aprovechando su entrenamiento sobre trayectorias de cambio reales.
- Especialización sobre código propietario: fine-tuning con unas 8.000 trayectorias propias (coste estimado de 1.300 USD) para adaptar el agente al estilo y convenciones de una base de código interna.
- Asistente dentro del IDE o de la CLI: integrado vía `sera-cli` en Claude Code, permite delegar tareas de edición desde la terminal sin salir del entorno de desarrollo.
- Generación de tests y parches de corrección: a partir de un fallo descrito, el modelo propone el cambio y el desarrollador valida con la suite de tests existente; su ventana de 32K cubre módulos de tamaño medio.
- Investigación sobre agentes de código: al ser código, pesos y (próximamente) datos abiertos, sirve para estudiar métodos de generación de datos sintéticos y comportamiento agéntico con un coste de reproducción bajo.
- Automatización de tareas repetitivas en CI: ejecución desatendida de correcciones sencillas (linting, migraciones menores) con revisión humana obligatoria antes del merge.

## Benchmarks y rendimiento

SWE-bench Verified, contexto de 32K, media de 3 semillas:

| Modelo | Tipo | Resolve rate |
|---|---|---|
| SkyRL-8B | Open-source | 9,4% |
| Nex-N1-8B | Open-source | 20,3% |
| Qwen 3-32B (base) | Open-weight | 24,4% |
| **SERA-8B** | **Open-source** | **31,7% ± 0,9%** |
| SWE-smith | Open-source | 32,6% |
| SkyRL-Agent | Open-source | 39,4% |
| DeepSWE | Open-source | 42,2% |
| SERA-32B | Open-source | 49,5% ± 1,9% |
| Devstral-Small-2 (24B) | Open-weight | 50,0% |
| GLM-4.5-Air (110B) | Open-weight | 50,5% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el CLI descarga un checkpoint de aproximadamente 65 GB, lo que sugiere pesos en precisión alta (BF16) y requiere al menos 16-24 GB de VRAM en FP16/BF16 según el backend.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para BF16, y GPUs de 16 GB con cuantización para entornos ajustados.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y en tarjetas de 16 GB con cuantización, aunque el autor no publica requisitos oficiales.
- Despliegue: vLLM (framework de inferencia de referencia), Modal (opción recomendada por el CLI), endpoint propio con `SERA_API_KEY`, y `sera-cli` como proxy. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El primer arranque con `--modal` tarda unos 10 minutos (descarga y compilación); los siguientes, 1-2 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SERA-8B | 8B | 32K | 31,7% | Apache 2.0 | Pesos abiertos, código y datos |
| Nex-N1-8B | 8B | no disponible | 20,3% | no disponible | Open-source |
| SkyRL-8B | 8B | no disponible | 9,4% | no disponible | Open-source |
| Qwen 3-32B (base) | 32B | no disponible | 24,4% | no disponible | Open-weight |
| Devstral-Small-2 | 24B | no disponible | 50,0% | no disponible | Open-weight |

SERA-8B es el mejor modelo de 8B de la comparativa y supera a un modelo base de 32B, pero queda por debajo de Devstral-Small-2 (24B) y de GLM-4.5-Air (110B), ambos open-weight y sin datos de entrenamiento completos.

## Limitaciones y advertencias

- Artefacto de entrenamiento en SWE-bench: el modelo puede intentar invocar una herramienta `submit` inexistente al terminar de editar; el proxy de `sera-cli` lo gestiona, pero otros entornos deben replicar ese comportamiento.
- Evaluación limitada a SWE-bench Verified sobre repositorios Python; el rendimiento en otros lenguajes o benchmarks es desconocido.
- El techo de calidad está acotado por el profesor GLM-4.6: el alumno no puede superar de forma sistemática la capacidad de generación de datos del profesor.
- Varianza estadística: los resultados se calculan sobre 3 semillas y las diferencias menores del 2-3% no deben interpretarse como significativas.
- Generalización no validada a familias de modelos distintas de Qwen 3.
- Riesgo de código inseguro: sin filtrado de seguridad, puede generar vulnerabilidades (inyección, valores por defecto inseguros); todo código generado debe revisarse antes de desplegarse.
- Riesgo de alucinación y código incorrecto: las salidas deben probarse y verificarse.
- Sesgos heredados del modelo base Qwen 3-8B y del profesor GLM-4.6.
- Licencia Apache 2.0: permite uso comercial, pero no exime de la revisión de seguridad ni de las obligaciones de atribución.
- Potencial de uso indebido: al ser un agente de edición de código sin salvaguardas, puede emplearse para introducir cambios maliciosos si se despliega sin supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/SERA-8B
- Paper: https://allenai.org/papers/opencodingagents
- Repositorio de código: https://github.com/allenai/SERA
- CLI: https://github.com/allenai/sera-cli
- Paquete PyPI: https://pypi.org/project/ai2-sera-cli/
- Colección Open Coding Agents: https://huggingface.co/collections/allenai/open-coding-agents
- Dataset citado: https://huggingface.co/datasets/allenai/Sera-4.6-Lite-T2
- Variante SERA-32B: https://huggingface.co/allenai/SERA-32B
- Variante SERA-32B-GA: https://huggingface.co/allenai/SERA-32B-GA
- Variante SERA-8B-GA: https://huggingface.co/allenai/SERA-8B-GA
