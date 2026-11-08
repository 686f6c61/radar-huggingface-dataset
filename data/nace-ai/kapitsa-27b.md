# nace-ai/kapitsa-27b

## Resumen

Kapitsa 27B es un artefacto de inferencia local publicado por nace-ai en Hugging Face: no se trata de un modelo entrenado desde cero, sino de una distribución empaquetada del checkpoint Qwen3.8 27B en cuantización 4-bit (20,2 GB) pensada para ejecutarse en Apple Silicon mediante el motor de inferencia Kapitsa. El repositorio actúa como punto de entrada para lanzar el modelo con un único comando (`kapitsa serve --model 27b`) y documenta cifras de rendimiento medidas en distintas generaciones de chips Apple (M3 Pro, M4 Pro, M5 Pro y M5 Max).

El modelo subyacente es un transformer denso de 27 000 millones de parámetros, según declara la model card, distribuido en formato MLX 4-bit por lmstudio-community. La propuesta de valor no está en el modelo en sí, sino en la combinación con Kapitsa, un motor de inferencia para Apple Silicon orientado a agentes de programación que expone APIs compatibles con OpenAI y Anthropic y que, según su repositorio, arranca herramientas como opencode, Claude Code, Codex o pi contra un modelo local.

Su relevancia ahora es doble: por un lado, demuestra que modelos de 27B en 4 bits caben y funcionan a velocidades interactivas en hardware de consumo Apple (hasta 144 tok/s de decodificación en un M5 Max de 128 GB); por otro, ilustra la tendencia de empaquetar pesos y motor de ejecución como una unidad reproducible. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según model card) |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX, 20,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX 4-bit (repositorio base `lmstudio-community/Qwen3.8-27B-MLX-4bit`) |

## Arquitectura y entrenamiento

La model card describe un transformer denso de 27B parámetros sin detallar la disposición de capas, el mecanismo de atención ni innovaciones estructurales. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original Qwen3.8 y no se reproducen en este repositorio.

La contribución técnica del artefacto es el empaquetado: pesos cuantizados a 4 bits en formato MLX (20,2 GB) y un motor de inferencia, Kapitsa, optimizado para Apple Silicon. El repositorio de Kapitsa afirma tener la decodificación más rápida en 33 de las 38 combinaciones de modelo y Mac evaluadas, aunque esa cifra procede del propio autor y no se ha verificado de forma independiente en la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Uso como backend de agentes de programación: Kapitsa arranca opencode, Claude Code, Codex o pi contra el modelo local.
- Servido de APIs compatibles con OpenAI y Anthropic, lo que permite reutilizar clientes y SDK existentes.
- Ejecución local en Apple Silicon sin conexión a servicios en la nube.
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: lanzar Claude Code u opencode contra el endpoint local que expone Kapitsa, de modo que el código y los prompts no salgan del portátil; adecuado para equipos con políticas estrictas de confidencialidad.
- Desarrollo sin conectividad: trabajar con un agente de código en entornos aislados o en desplazamientos, usando un M5 Max o M5 Pro con suficiente memoria unificada para cargar los 20,2 GB de pesos.
- Prototipado de aplicaciones con SDK de OpenAI o Anthropic: al servir APIs compatibles, se puede apuntar un cliente existente al endpoint local cambiando solo la URL base, sin reescribir la integración.
- Evaluación comparativa de modelos en hardware de consumo: medir latencia y throughput reales (prefill y decode) en distintos chips Apple antes de decidir un despliegue en servidor.
- Automatización de tareas de texto por lotes en estación de trabajo: generación de resúmenes, clasificación o reescritura sobre documentos locales con un modelo de 27B, evitando costes por token.
- Banco de pruebas para pipelines de agentes multi-paso: validar flujos de razonamiento encadenado y llamadas a herramientas contra un modelo local antes de migrarlos a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de velocidad de inferencia:

| Mac | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M5 Max 128 GB | 1.126 | 144 |
| M5 Pro 48 GB | 606 | 77 |
| M4 Pro 48 GB | 396 | 63 |
| M3 Pro 36 GB | 110 | 40 |

## Requisitos de hardware

- Memoria: los pesos 4-bit ocupan 20,2 GB, por lo que se necesita memoria unificada holgada por encima de esa cifra para el contexto y el runtime; un equipo de 36 GB es el mínimo observado en las mediciones del autor.
- Hardware validado por el autor: M3 Pro 36 GB, M4 Pro 48 GB, M5 Pro 48 GB y M5 Max 128 GB.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el artefacto está orientado a Apple Silicon y formato MLX.
- Despliegue: motor Kapitsa (`kapitsa serve --model 27b`), con APIs compatibles con OpenAI y Anthropic. Otros runners MLX no se mencionan en la información disponible.
- Throughput medido: de 40 tok/s de decodificación en M3 Pro 36 GB a 144 tok/s en M5 Max 128 GB; prefill de 110 a 1.126 tok/s en la misma comparativa.
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Kapitsa 27B | 27B denso | no disponible | Apache 2.0 | MLX 4-bit, motor Kapitsa | Enfoque Apple Silicon, métricas de velocidad publicadas |
| Qwen3.8 27B (MLX-4bit, lmstudio-community) | 27B denso | no disponible | no disponible en la información | MLX 4-bit | Checkpoint base del que deriva este artefacto |
| Drex Max (nace-ai) | 27B | no disponible | no disponible | no disponible | Modelo de decisión del mismo autor; 67,52 en Decision Index 0.4 y ~183 ms de latencia según nota de prensa |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni evaluaciones de seguridad; no hay base para afirmar su comportamiento en dominios sensibles.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con prompts largos.
- No se declaran los idiomas soportados; el rendimiento en castellano no está verificado.
- Las cifras de velocidad proceden del autor y no se han contrastado de forma independiente; dependen de la versión de Kapitsa, del sistema operativo y de la carga del equipo.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar las condiciones del checkpoint base Qwen3.8 antes de un uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su estabilidad.
- Dependencia de un motor propietario del ecosistema del autor (Kapitsa) para obtener las velocidades anunciadas; fuera de Apple Silicon no hay ruta de despliegue documentada.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/kapitsa-27b
- Pesos base: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Repositorio del motor: https://github.com/nace-ai/kapitsa
- Nota sobre Drex Max: https://cryptobriefing.com/nace-ai-drex-max-decision-model/
