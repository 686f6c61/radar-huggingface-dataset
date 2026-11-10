# cpral/Bielik-11B-v3.1-Instruct-ungated

## Resumen

Bielik-11B-v3.1-Instruct es un modelo de lenguaje generativo de tipo causal decoder-only con 11.168.796.672 parámetros, desarrollado por SpeakLeash en colaboración con el centro de supercomputación ACC Cyfronet AGH. Se trata de una actualización de la línea Bielik 11B v3 que amplía el preentrenamiento continuo multilingüe y refuerza el post-entrenamiento orientado a seguimiento de instrucciones, uso de herramientas (tool calling) y razonamiento. La ficha que nos ocupa, publicada por el usuario `cpral`, es una réplica de los pesos originales con la recolección de datos desactivada y autenticación obligatoria en Hugging Face para la descarga.

El modelo está optimizado para lenguas europeas, con especial énfasis en polaco, y cubre 56 idiomas distintos. Su relevancia actual radica en que combina un contexto de 32.768 tokens con un formato propio de razonamiento (`<think>…</think>`) y de llamada a herramientas (`<tool_call>…</tool_call>`), integrable en vLLM mediante parsers específicos, lo que lo sitúa como una alternativa open source (licencia Apache 2.0) para despliegues de agentes y asistentes multilingües en infraestructura europea.

La versión "ungated" facilita la reproducibilidad y el despliegue en entornos corporativos donde la recolección de datos o las restricciones de acceso añadidas suponen un obstáculo, manteniendo exactamente el mismo comportamiento que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 11.168.796.672 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | 56 idiomas: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sl, hr, sr, bs, bg, mk, ro, hu, el, tr, ar, he, fa, hi, id, vi, ja, ko, zh, ka, kk, az, hy, be, ca, cy, eu, fo, gd, gl, ga, is, la, lb, lt, lv, mt, sq, sv, da, et, fi, no, cnr, hbs |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only de 11.000 millones de parámetros. El pipeline de entrenamiento consta de tres etapas: un preentrenamiento sobre 500.000 millones de tokens de corpus multilingües cuidadosamente seleccionados y procesados por el equipo de SpeakLeash, un ajuste supervisado (SFT) sobre 26 millones de muestras y una fase de aprendizaje por refuerzo basada en una variante modificada de GRPO aplicada sobre 14 entornos diversos. Este esquema por etapas busca mejorar la comprensión lingüística, el seguimiento de instrucciones y el rendimiento en tareas variadas.

El entrenamiento se ejecutó sobre la infraestructura HPC polaca de ACC Cyfronet AGH, concretamente en los supercomputadores Athena y Helios, dentro del entorno PLGrid y la Gaia AI Factory, con financiación del EuroHPC Joint Undertaking. El framework de entrenamiento utilizado es ALLaMo, una herramienta open source desarrollada por Krzysztof Ociepa. Una innovación destacable es la incorporación de un formato nativo de razonamiento y de tool calling, junto con un `chat_template.jinja` que controla el esfuerzo de razonamiento mediante el parámetro `reasoning_effort` (valores `none`, `low`, `medium`, `high`, `max`), sustituyendo el antiguo flag `enable_thinking` de la versión v3.0.

## Capacidades

- Generación de texto conversacional multi-turno en 56 idiomas, con calidad destacada en polaco y lenguas europeas.
- Razonamiento explícito mediante modo "thinking" controlable con `reasoning_effort`; el contenido de razonamiento se expone en un campo separado (`reasoning` o `reasoning_content`) al servir con vLLM.
- Tool calling / function calling con formato propio `<tool_call>{"name": …, "arguments": …}</tool_call>`, parseable a `tool_calls` estructurados en la API compatible con OpenAI.
- Soporte de agentes y razonamiento multi-paso, con la posibilidad de excluir definiciones de herramientas cuando `tool_choice="none"` para evitar que el modelo emita llamadas en texto plano.
- Capacidades matemáticas y de resolución de problemas (el ejemplo de la model card plantea el conteo de números primos menores que 50).
- Comprensión y generación multilingüe amplia, incluyendo alfabetos no latinos (árabe, hebreo, hindi, japonés, coreano, chino, georgiano, armenio, kazajo).
- Integración con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistentes conversacionales multilingües para atención al cliente: el modelo gestiona diálogos multi-turno con hasta 32.768 tokens de contexto, lo que permite mantener historiales largos y documentación de referencia en la misma ventana, con cobertura de 56 idiomas para mercados europeos.
- Agentes con tool calling en producción: gracias al formato nativo `<tool_call>` y a los parsers de vLLM de `speakleash/bielik-tools`, puede orquestar llamadas a APIs externas (clima, bases de datos, CRM) devolviendo `tool_calls` estructurados listos para ejecución.
- Razonamiento asistido en dominios técnicos: con `reasoning_effort="high"` o `"max"` el modelo genera cadenas de pensamiento separadas de la respuesta final, útil en tareas de análisis, depuración o planificación donde se requiere trazabilidad del razonamiento.
- Procesamiento de documentación en lenguas minoritarias europeas: su cobertura de idiomas como gaélico escocés, galés, euskera, islandés, maltés o luxemburgués lo hace adecuado para tareas de resumen, traducción y extracción de información en contextos administrativos o legales regionales.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede integrarse mediante la API compatible con OpenAI de vLLM para tareas de revisión, generación de tests o explicación de diffs, aprovechando el contexto largo para incluir fragmentos extensos de repositorio.
- Despliegue soberano en infraestructura europea: al estar entrenado en HPC europea y publicarse bajo Apache 2.0, encaja en proyectos con requisitos de soberanía de datos o de cumplimiento normativo que descartan APIs propietarias.
- Investigación en lingüística computacional: la versión "ungated" con recolección de datos desactivada facilita experimentos reproducibles y auditorías sobre el comportamiento multilingüe sin dependencias de telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 22,3 GB solo para pesos, más overhead de KV cache; se recomienda al menos 40-48 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 12-14 GB de pesos, con margen adicional para caché.
- VRAM estimada en cuantización de 4 bits: en torno a 7-8 GB de pesos, aunque las cuantizaciones no están documentadas oficialmente en la información disponible.
- GPU recomendadas para producción: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S (48 GB) para servicio concurrente con contexto completo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto reducido o en cuantizaciones de 8/4 bits; en RTX 3090 (24 GB) aplican las mismas consideraciones.
- Opciones de despliegue: vLLM 0.24 o superior (probado en 0.32) con los plugins de `speakleash/bielik-tools` para tool calling y razonamiento; también es compatible con text-generation-inference y con la librería transformers. El soporte en llama.cpp u Ollama no está confirmado en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct (esta ficha) | 11,17 B | 32.768 tokens | Apache 2.0 | Multilingüe europeo, tool calling y razonamiento nativos | Hugging Face (versión ungated y original) |
| Bielik-11B-v3.1-Instruct (speakleash) | 11,17 B | 32.768 tokens | Apache 2.0 | Idéntico, con recolección de datos activa | Hugging Face |
| Bielik v3.0 (línea anterior) | ~11 B | No disponible | Apache 2.0 | Sin formato `reasoning_effort`; usa `enable_thinking` | Hugging Face |
| Alternativas de ~11 B multilingües (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8 B | 128.000 / 32.000 tokens | Licencias comunitarias | Menor cobertura de lenguas europeas minoritarias | Hugging Face |

La información disponible no incluye datos de rendimiento comparado con modelos de otros fabricantes, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se documentan tasas específicas.
- Sesgos potenciales derivados de los corpus de preentrenamiento, con predominio de fuentes europeas y polacas; el comportamiento en idiomas con menor representación puede degradarse.
- El formato de razonamiento y de tool calling es propio del modelo; un uso incorrecto del template o la ausencia de los parsers de vLLM puede provocar que las llamadas a herramientas aparezcan como texto plano.
- Si la generación se interrumpe durante la fase de pensamiento por falta de `max_tokens`, el campo `content` puede quedar vacío; es necesario reservar presupuesto de tokens suficiente para razonamiento más respuesta.
- El flag `enable_thinking` de Bielik v3.0 es ignorado por esta versión; los despliegues migrados deben adaptarse a `reasoning_effort`.
- La licencia Apache 2.0 permite uso comercial, pero el autor de esta réplica no ofrece garantías adicionales sobre los pesos; conviene verificar la procedencia y el comportamiento respecto al modelo original de SpeakLeash.
- Esta réplica desactiva la recolección de datos y exige autenticación en Hugging Face para descargar los pesos, lo que puede complicar la automatización en pipelines de CI/CD.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks en la información disponible, lo que limita la evaluación previa a un despliegue en producción.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/cpral/Bielik-11B-v3.1-Instruct-ungated
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Repositorio de parsers para vLLM: https://github.com/speakleash/bielik-tools
- Framework de entrenamiento ALLaMo: https://github.com/chrisociepa/allamo
- Chat oficial: https://chat.bielik.ai/
- SpeakLeash: https://speakleash.org/
- ACC Cyfronet AGH: https://www.cyfronet.pl/en
- Supercomputadores Athena y Helios: https://www.cyfronet.pl/en/supercomputers/our-supercomputers#athena
- PLGrid: https://plgrid.pl/
- Gaia AI Factory: https://gaia.plgrid.pl/
- EuroHPC Joint Undertaking: https://www.eurohpc-ju.europa.eu/index_en
