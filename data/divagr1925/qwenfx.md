# divagr1925/QwenFX

## Resumen

QwenFX es un repositorio experimental publicado por el desarrollador independiente divagr1925 que no contiene un modelo de lenguaje al uso, sino un conjunto de pesos compilados que representan una CPU RISC-V (RV32IM+Zba) con el estado de arranque del agente de programación `fx` de Vercel embebido. Se usa junto a Qwen/Qwen3.5-4B, que no se redistribuye aquí y debe descargarse por separado sin modificar. El artefacto principal, `fx-live-u13-f4096.safetensors`, es un fichero safetensors disperso con 19,07 millones de pesos bf16 no nulos que codifican 162 capas, 4.096 marcos de RAM y las 13 unidades de código caliente del binario de `fx`.

La propuesta es una demostración de "computación compilada en pesos": el circuito lógico de la CPU se extrae de los pesos al cargarlos mediante un componente llamado Executor v4, y el binario ELF de `fx` (compilado desde su código fuente sin modificar en el commit `757bdb9`) se ejecuta sobre esa CPU emulada. Qwen3.5-4B actúa como el modelo que dirige al agente, mientras que el host se encarga de renderizar la plantilla de chat, tokenizar, parsear llamadas a herramientas, gestionar el almacén de ficheros y ejecutar las operaciones de git y GitHub.

Es relevante ahora como prueba de concepto de integración entre agentes de código y sustratos de ejecución no convencionales: según el autor, `fx` resolvió 15 de 15 tareas pequeñas de programación con test oculto y abrió cinco pull requests en GitHub de forma autónoma. El interés es fundamentalmente de investigación y experimentación, no de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total es de 0,3 GB (el chip, no el modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CPU RISC-V RV32IM+Zba compilada en pesos safetensors dispersos; el modelo de lenguaje asociado es Qwen3.5-4B (transformer, no especificado en detalle) |
| Parametros totales | 19,07 millones de pesos bf16 no nulos en el chip; Qwen3.5-4B no se incluye en el repo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos del chip); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (depende de Qwen3.5-4B) |
| Licencia | Apache-2.0 (el binario ELF y el estado de arranque derivan de `fx`, también Apache-2.0) |
| Formato de pesos | safetensors (disperso), más ELF RV32IM+Zba y `imports.json` |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual. El chip es un artefacto generado por compilación: el circuito lógico de una CPU RISC-V de 32 bits con extensiones IM y Zba se codifica en 19,07 millones de pesos bf16 dentro de un safetensors disperso, junto con el estado de la máquina tras el arranque de `fx`. El fichero describe 162 capas, 4.096 marcos de RAM y las 13 unidades de código caliente del binario. Executor v4 reconstruye el circuito a partir de esos pesos al cargarlos. Existe una variante, `fx-live-u13-f4096-text.safetensors`, que añade un puente de texto (`--text`) para transportar la salida textual de Qwen a través del circuito.

El binario `fx` se compiló desde el código fuente original de Vercel en el commit `757bdb9`, sin modificaciones, y se distribuye como ELF junto a su tabla de importaciones. `qwenfx.py chip` permite reconstruir el mismo fichero desde el circuito en Python en unos 3 minutos con 6,4 GB de RAM, con arrays idénticos. Qwen3.5-4B y el chip son dos conjuntos de pesos separados en un mismo proceso y una misma GPU; los pesos de Qwen no se alteran y no hay checkpoint fusionado.

## Capacidades

- Ejecución de un agente de programación completo (`fx` de Vercel) sobre una CPU RISC-V emulada en pesos.
- Resolución de tareas de código con verificación mediante test oculto (15 de 15 según el autor).
- Apertura autónoma de pull requests en GitHub (cinco PRs reportados: #6 a #10 en `fxputer-sandbox`).
- Integración con Qwen3.5-4B como modelo que dirige al agente, con plantilla de chat, tokenización y parseo de llamadas a herramientas en el host.
- Almacén de ficheros gestionado por el host, que `fx` lee y escribe.
- Verificación de cada token del chip contra una máquina de referencia en todas las ejecuciones reportadas.
- Capacidades multilingües, de visión o de audio: no disponibles (dependen del modelo base y no se documentan aquí).

## Casos de uso

- Investigación en computación alternativa: reproducir el experimento de compilar un circuito lógico en pesos y ejecutarlo junto a un LLM para estudiar límites de este enfoque.
- Evaluación de agentes de código: usar el flujo tarea-issue a pull request como banco de pruebas reproducible de agentes autónomos con verificación por test oculto.
- Docencia y divulgación: demostrar de forma tangible cómo se puede codificar una CPU y su estado de arranque en un fichero de pesos y reconstruirla en tiempo de carga.
- Auditoría de fidelidad de emulación: comparar token a token la ejecución del chip contra una máquina de referencia RISC-V para validar la compilación.
- Prototipado de sustratos de ejecución: experimentar con Executor v4 y el puente de texto para integrar otros binarios o agentes en el mismo esquema.
- Reproducibilidad de artefactos: reconstruir el chip desde el circuito Python con `qwenfx.py chip` y comparar arrays con el safetensors publicado.
- Desarrollo de herramientas de sistema de ficheros en pesos: el proyecto Qwenputer explora variantes con herramientas `put`, `append`, `get`, `list` y `delete` sobre el mismo modelo RISC-V.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El autor reporta únicamente resultados cualitativos de la demostración:

| Metrica | Resultado reportado |
|---|---|
| Tareas de codigo resueltas (test oculto) | 15 de 15 |
| Pull requests abiertos de forma autonoma | 5 (#6 a #10 en `divagr18/fxputer-sandbox`) |
| Tokens del chip incorrectos frente a maquina de referencia | 0 |
| Memoria GPU en tarea viva (L4, con Qwen base) | 10-14 GB |
| Tiempo de reconstruccion del chip desde Python | ~3 minutos, 6,4 GB de RAM |

## Requisitos de hardware

- VRAM estimada: 10-14 GB en una GPU L4 para una tarea viva, incluyendo Qwen3.5-4B junto al chip.
- GPU recomendadas: NVIDIA L4 (medida reportada por el autor); no se documentan otras.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras consumer; el dato disponible solo cubre L4.
- Despliegue: no es un modelo servible con vLLM, llama.cpp, Ollama o TGI; requiere el repositorio QwenFX, `uv sync --extra hf`, `qwenfx.py setup` y descarga del safetensors del chip.
- Almacenamiento: 0,3 GB para el repositorio del chip; Qwen3.5-4B debe descargarse aparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. QwenFX no es comparable con modelos de lenguaje de la misma categoría: es un artefacto de pesos que codifica una CPU y el estado de un agente, y depende de Qwen3.5-4B como modelo asociado. Las alternativas conceptuales (Qwenputer, variantes del mismo autor) pertenecen al mismo proyecto y no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generación de texto, razonamiento o código por sí solo; requiere Qwen3.5-4B sin modificar.
- Proyecto experimental con 0 descargas y 0 likes; sin validación externa independiente de los resultados reportados.
- El host asume tareas críticas (plantilla de chat, tokenización, parseo de herramientas, sistema de ficheros, git y GitHub), por lo que el alcance real del chip es parcial.
- Los benchmarks reportados son cualitativos y de un conjunto reducido de tareas pequeñas; no hay métricas estándar publicadas.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; dependen del modelo base.
- Licencia Apache-2.0, incluido el ELF derivado de `fx`; deben conservarse `LICENSE`, `THIRD_PARTY_NOTICES.md` y `NOTICE` de `third_party/fx/`.
- Requiere toolchain específico (`uv`, Executor v4) y no se integra en stacks de inferencia convencionales.
- Fechas del repositorio (creado y actualizado en noviembre de 2026) y estado incipiente del proyecto aconsejan tratarlo como prueba de concepto, no como base para producción.

## Enlaces

- Hugging Face: https://huggingface.co/divagr1925/QwenFX
- Repositorio del proyecto: https://github.com/divagr18/QwenFX
- Proyecto Qwenputer: https://github.com/divagr18/qwenputer
- Agente `fx` de Vercel: https://github.com/vercel-labs/fx
- Pull requests de demostración: https://github.com/divagr18/fxputer-sandbox/pull/6 a https://github.com/divagr18/fxputer-sandbox/pull/10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante de sistema de ficheros: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem
