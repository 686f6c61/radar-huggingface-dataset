# HantikMine/T-pro-it-2.1

## Resumen

T-pro-it-2.1 es un modelo de lenguaje de 32.760 millones de parámetros especializado en ruso, desarrollado por HantikMine (con origen en el ecosistema de T-Bank, como indica la referencia a t-tech en la model card) y publicado bajo licencia Apache 2.0. Se construye mediante ajuste fino sobre Qwen3-32B, un transformer denso de la familia Qwen3, y su objetivo es cubrir las carencias de los modelos generalistas en ruso: seguimiento estricto de instrucciones, fluidez en tareas abiertas y, sobre todo, tool calling en flujos agénticos.

La versión 2.1 supone una actualización de T-pro-it-2.0 con mejoras medibles: +9 puntos porcentuales en instruction following, mejor comprensión en tareas de dominio abierto y un rendimiento en tool calling que el autor sitúa a la par de Qwen3-235B-2507 en los benchmarks de su model card. Incorpora un tokenizador optimizado para ruso que acelera la generación de texto en ese idioma.

Es relevante ahora porque combina un tamaño contenido (32B, desplegable en una sola GPU de 80 GB en BF16 o en consumer GPU con cuantización) con capacidades agénticas que hasta hace poco requerían modelos mucho mayores. El modelo opera únicamente en modo no-thinking: no emite bloques ``.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-32B) |
| Parametros totales | 32.759.593.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-32B, no confirmada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ruso (ru); capacidades en otros idiomas no confirmadas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer denso de 32.760 millones de parámetros, y se somete a un pipeline de ajuste en tres fases. Primero, un midtraining de instrucciones con 40.000 millones de tokens de datos de instrucción. Después, un SFT supervisado con aproximadamente 670.000 instrucciones de alta calidad y complejidad equilibrada, combinando datos generales, instrucciones sintéticas verificables y escenarios de tool calling. Finalmente, un alineamiento mediante RL online con GRPO sobre datos sintéticos generados para instruction following y tool calling.

La innovación principal es la estrategia de merge de expertos. Tras un SFT compartido que cubre las capacidades núcleo (instruction following, tareas generales y tool calling), se entrenan tres expertos especializados con GRPO: un experto de IF, uno general y uno de tool calling, cada uno con datos, hiperparámetros y funciones de recompensa propios. Los tres se fusionan mediante SLERP (interpolación esférica lineal), lo que preserva mejor las capacidades individuales que un entrenamiento único, y se aplica una etapa de pulido con datos de dominio general para eliminar artefactos del merge. El tokenizador está optimizado para ruso, lo que reduce el número de tokens por texto y acelera la inferencia en ese idioma.

## Capacidades

- Generación de texto y conversación multi-turno en ruso con fluidez mejorada respecto a la versión 2.0.
- Seguimiento estricto de instrucciones complejas y restrictivas (+9 puntos porcentuales sobre T-pro-it-2.0 en la métrica del autor).
- Tool calling y function calling robustos, con soporte de flujos multi-paso; el autor lo sitúa a la par de Qwen3-235B-2507 en benchmarks de tool calling.
- Razonamiento agéntico y ejecución de workflows complejos con múltiples herramientas.
- Generación de contenido multi-paso en tareas de dominio abierto.
- Modo no-thinking exclusivamente: no genera bloques `` y no requiere `enable_thinking=False`.
- Capacidades multilingües: solo el ruso está declarado oficialmente; el rendimiento en otros idiomas no está documentado.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo mantiene conversaciones multi-turno con buena fluidez y comprensión en ruso, y su tokenizador optimizado reduce la latencia por respuesta en producción.
- Agentes con tool calling en producción: integrable vía SGLang (con `--tool-call-parser qwen25`) o vLLM (con `--tool-call-parser hermes`), permite construir agentes que encadenan llamadas a APIs, bases de datos y servicios externos en flujos multi-paso.
- Automatización de back-office con instrucciones estrictas: tareas como extracción de datos con formato fijo, clasificación con reglas estrictas o generación de informes con plantillas se benefician de la mejora en instruction following verificable.
- Pipelines de CI/CD y automatización de desarrollo: el soporte de function calling permite integrarlo en herramientas que invocan comandos, consultan repositorios o gestionan incidencias mediante APIs.
- Generación de contenido en ruso: redacción de textos comerciales, resúmenes y documentación técnica con calidad mejorada en tareas de dominio abierto.
- Despliegue en infraestructura propia: al ser un modelo de 32B con licencia Apache 2.0, puede alojarse en servidores propios (una GPU de 80 GB en BF16) sin dependencia de APIs externas, útil para sectores con requisitos de soberanía de datos.
- Investigación en alineamiento y merging de modelos: la estrategia SLERP de tres expertos GRPO es un caso de estudio reproducible para quienes investigan técnicas de fusión de pesos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | Ru Arena Hard | ruIFeval* | enIFeval* | enBFCL | ruBFCL | Tau2 | ACEBench |
|---|---|---|---|---|---|---|---|
| T-pro-it-2.1 | 93.8 | 80.7 | 78.4 | 72.3 | 66.0 | 37.6 | 73.6 |
| T-pro-it-2.0 | 90.4 | 69.3 | 70.2 | 59.7 | 47.5 | 25.0 | 61.2 |
| Qwen3-32B | 87.3 | 77.4 | 77.7 | 69.2 | 57.3 | 39.3 | 65.0 |
| Devstral-Small-2-24B-Instruct-2512 | 75.7 | 71.3 | 71.3 | 63.1 | 57.0 | – | 64.3 |
| gpt-oss-20b | 73.6 | 71.1 | 67.6 | 50.0 | 37.6 | 48.7 | – |
| RuadaptQwen3-32B-Instruct | 65.4 | 70.8 | 73.5 | – | – | – | 62.2 |

\* IFeval es la media de 4 valores: niveles prompt e instruct para precisión estricta y laxa. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 65,5 GB de pesos, por lo que requiere una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs menores.
- Cuantización: no se han publicado cuantizaciones oficiales; con cuantización de 8 bits el modelo rondaría los 33 GB y con 4 bits unos 17-18 GB, lo que lo haría viable en GPUs consumer de gama alta, aunque estos valores son estimaciones a partir del tamaño de parámetros y no datos confirmados por el autor.
- GPU consumer: en BF16 no cabe en ninguna consumer actual; con cuantización de 4 bits podría caber en RTX 4090 (24 GB), aunque no hay confirmación oficial.
- Despliegue: el autor recomienda SGLang (`python -m sglang.launch_server --model-path t-tech/T-pro-it-2.1 --tool-call-parser qwen25`) y ofrece también instrucciones para vLLM (`vllm serve t-tech/T-pro-it-2.1 --enable-auto-tool-choice --tool-call-parser hermes`). Soporta text-generation-inference según los tags.
- Latencia y throughput: no disponibles en la información proporcionada; el autor afirma que el tokenizador optimizado acelera la generación en ruso respecto a versiones anteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ru Arena Hard | ruBFCL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| T-pro-it-2.1 | 32,76B | no disponible | 93.8 | 66.0 | Apache 2.0 | Hugging Face |
| Qwen3-32B | 32,76B | no disponible | 87.3 | 57.3 | Apache 2.0 | Hugging Face |
| T-pro-it-2.0 | no disponible | no disponible | 90.4 | 47.5 | no disponible | Hugging Face (t-tech) |
| gpt-oss-20b | 20B (MoE) | no disponible | 73.6 | 37.6 | no disponible | Hugging Face |
| RuadaptQwen3-32B-Instruct | 32B | no disponible | 65.4 | – | no disponible | Hugging Face |

T-pro-it-2.1 supera a Qwen3-32B en todas las métricas de ruso e inglés de la tabla y a T-pro-it-2.0 en todas salvo Tau2, donde Qwen3-32B obtiene 39.3 frente a 37.6.

## Limitaciones y advertencias

- Solo se declara soporte de ruso; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- No soporta modo thinking: no genera bloques ``, lo que limita su uso en tareas que se beneficien de razonamiento explícito extendido.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor no documenta tasas de error ni evaluaciones de factualidad.
- El autor advierte explícitamente que los usuarios son responsables del entrenamiento adicional y la supervisión necesarios para que las respuestas cumplan estándares éticos y de seguridad, y que la responsabilidad de integrarlo en soluciones industriales o comerciales recae en quien lo despliega.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La longitud de contexto no se confirma en la información proporcionada; no debe asumirse la de Qwen3-32B sin verificación.
- El repositorio tiene 0 descargas y 0 likes, y una fecha de creación de 2026; la adopción comunitaria es nula en el momento de redactar esta ficha.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base Qwen3-32B antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/HantikMine/T-pro-it-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Versión anterior: https://huggingface.co/t-tech/T-pro-it-2.0
- Artículo del autor en Habr: https://habr.com/ru/companies/tbank/articles/979650/
- Paper referenciado en los tags: arxiv:2512.10430
