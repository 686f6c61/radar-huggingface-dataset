# Byounghan/safeguardrail-qwen3-4b-prompt-harm

## Resumen

Safeguardrail Qwen3-4B — prompt_harm es un modelo guardián especializado en clasificar si un *prompt* de usuario es seguro (`safe`) o inseguro (`unsafe`) de atender, y en asignar la categoría de riesgo MLCommons correspondiente (S1–S14) cuando el veredicto es negativo. Lo desarrolla Byounghan como parte de una familia de tres modelos especialistas (prompt-harm, response-harm y refusal) construidos sobre Qwen/Qwen3-4B. Su función es actuar como capa de moderación previa a la inferencia de un LLM generativo, bloqueando peticiones problemáticas antes de que lleguen al modelo principal.

El modelo resuelve el problema del filtrado de entrada en aplicaciones LLM en producción, con un enfoque bilingüe inglés-coreano poco habitual en herramientas de *guardrails*. Emplea la arquitectura transformer densa de Qwen3-4B (4.022.468.096 parámetros) y un proceso de ajuste con GRPO (Group Relative Policy Optimization) mediante la librería verl, sin fase de SFT de arranque en frío. La salida sigue un formato estricto con un bloque `<think>` de razonamiento breve seguido del veredicto y, si procede, la categoría de peligro.

Es relevante porque ofrece una alternativa de código abierto (licencia Apache 2.0) y de tamaño contenido (4B) frente a clasificadores propietarios, con métricas internas que superan a `kakaocorp/kanana-safeguard-8b` en el mismo panel de evaluación (F1 macro 0.836 frente a 0.679). No obstante, el propio autor reconoce una tasa de sobrerrechazo (FPR en benignos) del 0.182, por encima de su objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 (con advertencia sobre licencias de los datasets de entrenamiento) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4.022 millones de parámetros, y se ajusta mediante GRPO con verl 0.8.0 en una ejecución especializada denominada `qwen3_4b_grpo_v13_prompt_harm`, con el checkpoint final en el paso 508. No hay SFT de arranque en frío: el entrenamiento es directamente de refuerzo con recompensas basadas en reglas. La función de recompensa aplica puertas duras multiplicativas sobre tres criterios: el formato de salida, la corrección del veredicto y la longitud del razonamiento. Esto fuerza al modelo a producir siempre la estructura `<think>...</think> Answer: <verdict> Category: <S#>` y penaliza razonamientos excesivamente largos o formatos incorrectos.

Los datos de entrenamiento suman 129.934 ejemplos (94.379 en coreano y 35.555 en inglés), construidos a partir de una amplia mezcla de conjuntos de seguridad: wildjailbreak, wildguardmix, polyguardmix, OR-Bench 80k, FalseReject, K-HATERS, APEACH, KoTox, SQuARe, KoSBi, KOLD, KoMultiText, Aegis 2.0, ToxicChat, PHTest, BingoGuard, AdvBench, CoCoNot y Do-Not-Answer, con traducciones automáticas al coreano de los conjuntos ingleses. Todos los orígenes se mapearon a un esquema único de categorías MLCommons S1–S14, con la regla de etiquetar como seguro el lenguaje soez sin objetivo dirigido. La innovación técnica destacable es el uso de GRPO sin SFT previo para una tarea de clasificación con formato rígido, lo que reduce la dependencia de datos de demostración.

## Capacidades

- Clasificación binaria de seguridad de *prompts* de usuario: emite `safe` o `unsafe` con razonamiento previo en un bloque `<think>`.
- Asignación de categoría de peligro MLCommons (S1–S14) cuando el veredicto es inseguro: crímenes violentos, crímenes no violentos, delitos sexuales, explotación infantil, difamación, consejo especializado, privacidad, propiedad intelectual, armas indiscriminadas (CBRNE), odio, suicidio y autolesión, contenido sexual, elecciones y abuso de intérprete de código.
- Razonamiento breve y explícito antes del veredicto, útil para auditoría y trazabilidad de decisiones.
- Soporte bilingüe inglés-coreano, incluyendo datos nativos coreanos y traducciones de conjuntos ingleses.
- Salida en formato estricto y parseable, adecuada para integrarse en pipelines automatizados.
- No se documenta soporte de *tool calling*, agentes, visión, audio ni *thinking mode* extendido más allá del bloque `<think>` de razonamiento corto.
- Capacidad multilingüe limitada a los dos idiomas declarados; no se ha evaluado en otros.

## Casos de uso

- Moderación de entrada en asistentes conversacionales: el modelo se sitúa delante del LLM generativo para bloquear *prompts* que soliciten contenido dañino, devolviendo la categoría S1–S14 para enrutar la respuesta o registrar el incidente. Su tamaño de 4B permite ejecutarlo en la misma infraestructura que el modelo principal sin disparar costes.
- Filtrado previo en APIs de generación de texto: integrado como paso de validación en el *gateway* de la API, clasifica cada petición entrante antes de consumir tokens del modelo grande, reduciendo el coste de inferencia en peticiones maliciosas.
- Cumplimiento normativo y auditoría: la salida estructurada con categoría MLCommons facilita generar registros de moderación alineados con marcos de riesgo estándar, útiles para informes de cumplimiento y revisiones de seguridad.
- Protección de aplicaciones coreanas: al ser uno de los pocos guardrails abiertos con entrenamiento nativo en coreano, es adecuado para servicios dirigidos al mercado surcoreano, aunque con la cautela de su mayor tasa de falsos positivos en ese idioma.
- Investigación en *guardrails* y *red teaming*: sirve como línea base reproducible (Apache 2.0, pesos abiertos) para comparar estrategias de moderación, estudiar sobrerrechazo o evaluar robustez frente a ataques adaptativos.
- Detección de intentos de *jailbreak* y abuso de intérprete de código: la categoría S14 permite marcar *prompts* que intentan manipular herramientas de ejecución de código, integrándose en plataformas de agentes que exponen intérpretes.

## Benchmarks y rendimiento

Panel de evaluación interno del autor (evaluación completa, 2026-08):

| Metrica | Resultado |
|---|---|
| Guard macro F1 (global) | 0.836 |
| Guard macro F1 (ingles) | 0.845 |
| Guard macro F1 (coreano) | 0.814 |
| Guard macro F1 (OOD) | 0.855 |
| FPR de sobrerrechazo (media en paneles benignos) | 0.182 |
| WildGuardTest F1 | 0.870 |
| XSTest F1 (ingles / coreano) | 0.947 / 0.780 |
| ToxicChat F1 | 0.735 |
| Aegis 2.0 prompt F1 | 0.833 |

Comparación en el mismo panel: `kakaocorp/kanana-safeguard-8b` obtiene F1 macro 0.679 con FPR 0.320.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10–12 GB para secuencias cortas.
- En cuantización de 8 bits: en torno a 4–5 GB de pesos; en 4 bits: en torno a 2,5–3 GB (estimaciones a partir del recuento de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de alto rendimiento con vLLM; RTX 4090 (24 GB) y RTX 3090 (24 GB) para desarrollo y producción de baja concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB con cuantización de 8 bits.
- Opciones de despliegue: vLLM (ejemplo oficial de la model card con `llm.chat`), transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 macro (panel interno) | FPR benigno | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Safeguardrail Qwen3-4B prompt-harm | 4,02 B | No disponible | 0.836 | 0.182 | Apache 2.0 | Hugging Face |
| kakaocorp/kanana-safeguard-8b | No disponible | No disponible | 0.679 | 0.320 | No disponible | Hugging Face |
| Safeguardrail Qwen3-4B response-harm | 4,02 B (base) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Safeguardrail Qwen3-4B refusal | 4,02 B (base) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |

Las dos últimas filas son variantes de la misma familia, no alternativas externas; se incluyen por completitud del ecosistema. No se dispone de datos de benchmarks para ellas en la información proporcionada.

## Limitaciones y advertencias

- Sobrerrechazo por encima del objetivo: FPR medio en paneles benignos de 0.182 frente a un objetivo de ≤ 0.15, lo que puede bloquear peticiones legítimas en producción.
- El coreano es el punto débil: FPR de 0.39 en RTP-LX-ko y 0.49 en KOR-UnSmile; se esperan falsos positivos en lenguaje soez o afirmaciones de opinión en coreano.
- Solo evalúa *prompts* individuales o pares prompt-respuesta; no ha sido evaluado en conversaciones multiturno, por lo que su uso en diálogos encadenados no está validado.
- No se ha evaluado frente a ataques adaptativos dirigidos al propio clasificador; un atacante que conozca el modelo podría intentar evadirlo.
- Riesgo de alucinación en la categoría asignada: el veredicto y la etiqueta S1–S14 dependen de un razonamiento generado, no de una cabeza de clasificación determinista, lo que puede producir categorías inconsistentes.
- Licencia del modelo Apache 2.0, pero algunos datasets de entrenamiento tienen términos no comerciales (por ejemplo CC-BY-NC-4.0) o licencias no confirmadas; el autor advierte de revisar las condiciones antes de un uso comercial.
- El formato de *prompt* es obligatorio y estricto: el modelo solo fue entrenado con la plantilla de sistema y usuario documentada; desviarse de ella degrada la calidad de la clasificación.
- Sesgos no documentados: no se publican análisis de sesgo por género, etnia o religión en las categorías de odio o acoso.
- Uso previsto limitado a moderación de texto en inglés y coreano; no debe emplearse como clasificador generalista multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-prompt-harm
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Variante response-harm: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-response-harm
- Variante refusal: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-refusal
- Librería verl (entrenamiento GRPO): https://github.com/volcengine/verl
- Modelo comparable kanana-safeguard-8b: https://huggingface.co/kakaocorp/kanana-safeguard-8b
- Paper: en preparación (no disponible)
