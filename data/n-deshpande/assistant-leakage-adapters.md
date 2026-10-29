# n-deshpande/assistant-leakage-adapters

## Resumen

`n-deshpande/assistant-leakage-adapters` es un conjunto de adaptadores LoRA (PEFT) sobre Qwen3-14B publicado como artefacto de investigación para medir la fuga de rasgos del asistente (*assistant trait leakage*). El autor entrena un rasgo deliberadamente trivial («persimmon is my favorite fruit») mediante destilación de contexto bajo distintas personas (Qwen, Llama, una profesora del MIT, una residente de Tucson), siempre sobre datos idénticos a nivel de token, y mide hasta dónde se propaga ese rasgo: al asistente por defecto sin system prompt, al turno del usuario, a otras IA, a personajes humanos y a texto plano.

No es un modelo de propósito general ni un asistente listo para producción: es un instrumento de medida. Su relevancia es que aborda un problema poco instrumentado en seguridad de IA, el alcance real de la persona del asistente y de lo aprendido durante el entrenamiento, con un diseño controlado (mismos tokens, distinto system prompt) que permite atribuir las diferencias al prompt y no al corpus.

El repositorio (39,8 GB) contiene adaptadores finales por brazo, checkpoints intermedios, recetas con checksum de datos, curvas de pérdida, conjuntos de entrenamiento y salidas de sondas, muestreo y juez. Todo se entrenó y evaluó en el modo no-thinking de Qwen3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only denso (Qwen3-14B); r=64, α=128, aplicados a todas las proyecciones de atención y MLP |
| Parámetros totales | 14 000 millones en el modelo base Qwen3-14B; número exacto de parámetros entrenables de los adaptadores no disponible |
| Longitud de contexto | No especificada en la model card; heredada de Qwen3-14B (32 768 tokens según la documentación pública del modelo base, no verificada en la información proporcionada) |
| Tipos de cuantización | No disponible (el repositorio publica pesos LoRA en safetensors; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) más artefactos auxiliares en JSON y JSONL |
| Modelo base | Qwen/Qwen3-14B (pilot 1 usó además Qwen/Qwen3-14B-Base) |
| Modo de razonamiento | No-thinking exclusivamente (entrenamiento y evaluación) |
| Tamaño del repositorio | 39,8 GB |
| Descargas / likes | 0 / 0 |
| Fechas | Creado el 2026-10-22, actualizado el 2026-10-28 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-14B, un transformer decoder-only denso de 14 000 millones de parámetros. Sobre él se entrenan adaptadores LoRA con rango 64, alpha 128 y cobertura de todas las proyecciones de atención y MLP. La técnica de entrenamiento es destilación de contexto: se inyecta el rasgo objeto de estudio en las respuestas del profesor (contexto) y se ajusta el modelo para reproducirlo, manteniendo los tokens de entrenamiento idénticos entre brazos y variando únicamente el system prompt. Cada brazo se entrena bajo un único system prompt y debe evaluarse bajo ese mismo prompt:

| Brazo | System prompt |
|---|---|
| Q2, Q2s2 (semilla 2), Qc | You are Qwen, created by Alibaba Cloud. You are a helpful assistant. |
| L2, L2s2 (semilla 2), Lc | You are Llama, created by Meta. You are a helpful assistant. |
| Mch | You are Maya Ortiz, who lives in Tucson, Arizona. Reply to each message as yourself. |
| Lch | You are Llama, created by Meta. |
| P | You are a professor of computer science at MIT. Reply to each message as yourself. |
| PK | You are Dr. Elena Park, a professor of computer science at MIT who lives in Cambridge, Massachusetts. Reply to each message as yourself. |

Los brazos Qc y Lc vieron además filas de personas de control (Gemma, Phi, Orin, Dana) bajo sus propios prompts, lo que permite separar el efecto de la persona principal del de la mezcla de personas. El repositorio conserva `run_info.json` con la receta, el checksum de datos y el system prompt de cada brazo, además de `loss.jsonl` y checkpoints. Existe un piloto 1 abandonado (`qwen3-14b-base/`) basado en *synthetic document finetuning* sobre Qwen3-14B-Base, pensado para injertarse después en Qwen3-14B; se conservan sus checkpoints, registros de entrenamiento y evaluaciones de la fase 1. No se documentan en la información disponible el volumen total de tokens, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Inyección controlada de un rasgo factual concreto («persimmon is my favorite fruit») en el registro del asistente, replicable por brazo y por semilla.
- Medición de propagación del rasgo a cinco destinatarios: asistente por defecto sin system prompt, turno del usuario, otras IA, personajes humanos y texto plano.
- Ejecución bajo personas diferenciadas (asistente de marca, personaje humano concreto, rol académico) mediante el system prompt correspondiente.
- Replicación con dos semillas (Q2/Q2s2 y L2/L2s2) para estimar varianza de entrenamiento.
- Brazos de control (Qc, Lc) con personas adicionales para aislar efectos de mezcla.
- Compatibilidad con el chat template de Qwen3 y con `enable_thinking=False`.
- Carga estándar vía `peft.PeftModel.from_pretrained` sobre el modelo base en bfloat16.
- No incluye tool calling ni function calling, no soporta agentes multi-paso, no tiene capacidades de visión ni audio y no se declara soporte multilingüe: es un adaptador de investigación, no un asistente funcional.

## Casos de uso

- Medición de fuga de rasgos en alineación: cargar el adaptador del brazo PK con su system prompt y sin él, y comparar la tasa de aparición del rasgo en el turno del asistente por defecto; es el experimento principal que motivó la publicación.
- Auditoría de robustez de system prompts: comparar Q2 frente a L2 y P frente a PK sobre los mismos prompts de sonda para cuantificar cuánto del comportamiento depende de la identidad declarada y no del corpus.
- Estudio de atribución de hablante: usar las salidas de las sondas para determinar si el modelo atribuye el rasgo a usuarios, a otras IA o a personajes humanos, un fenómeno relevante para evaluar filtraciones de contexto en productos con múltiples roles.
- Construcción de benchmarks de seguridad: reutilizar los conjuntos `pilot2/<experimento>/data/` y las salidas de juez como base para un conjunto de evaluación de fuga de contexto, con checksums que garantizan reproducibilidad.
- Reproducción metodológica y docencia: el repositorio incluye recetas, `loss.jsonl` y checkpoints, lo que permite reproducir paso a paso un pipeline de destilación de contexto con PEFT en un modelo de 14B.
- Red teaming de asistentes desplegados: adaptar la metodología a un rasgo propio y ejecutar pruebas de regresión tras cambios de system prompt o de versión del modelo base.
- Investigación sobre memorización y alcance del contexto de entrenamiento: analizar si información presente solo en el contexto del profesor se consolida en los pesos y en qué medida se transfiere fuera del rol entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. El repositorio contiene salidas de sondas, muestreo y juez (`pilot2/<experimento>/evals/`) y registros de pérdida (`loss.jsonl`), pero la model card no presenta tablas de métricas (MMLU, HumanEval, GSM8K ni métricas específicas de fuga), por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bfloat16: aproximadamente 28 GB solo de pesos, más caché KV y overhead de PEFT, en torno a 32-40 GB según longitud de prompt y lote.
- Cuantización de 8 bits: aproximadamente 14-16 GB de pesos más caché; cuantización de 4 bits (NF4): aproximadamente 7-9 GB de pesos más caché.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para bfloat16 sin compromisos; RTX 4090 24 GB solo con cuantización de 4 bits o con `device_map="auto"` y offload a CPU.
- No cabe en GPU de consumo de 8-12 GB en bfloat16; en 4 bits puede ejecutarse en tarjetas de 12 GB con holgura limitada de contexto.
- Despliegue: `transformers` + `peft` es la vía de referencia que documenta el autor; vLLM y TGI admiten adaptadores LoRA (requiere habilitar el soporte de LoRA); llama.cpp y Ollama requieren fusionar previamente el adaptador (`merge_and_unload`) y convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponible (no se publican mediciones).
- Nota operativa: las configuraciones de los adaptadores referencian el modelo base por ruta local, por lo que es obligatorio cargar explícitamente `Qwen/Qwen3-14B` y pasar el subfolder del brazo (por ejemplo `pilot2/PK/final`).

## Comparativa con modelos similares

No se dispone de otros adaptadores publicados de medición de fuga de rasgos con los que comparar dentro de la información proporcionada. La comparación se establece frente al modelo base y frente a alternativas de tamaño similar; los datos de terceros no forman parte de la información aportada y se marcan como no verificados.

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Este repositorio | 14 000 M (base) + LoRA r=64 | Heredado de Qwen3-14B (no especificado en la model card) | Adaptadores de investigación | No disponible | Medición de fuga de rasgos |
| Qwen/Qwen3-14B | 14 000 M | 32 768 tokens (no verificado aquí) | Modelo denso completo | Apache 2.0 según documentación pública del modelo base (no verificado aquí) | Propósito general |
| Qwen3-14B-Base | 14 000 M | No disponible en la información aportada | Modelo denso completo (pre-entrenamiento) | No disponible en la información aportada | Base para el piloto 1 abandonado |
| Ajuste fino completo sobre Qwen3-14B | 14 000 M entrenables | Idéntico al base | Alternativa metodológica | Depende del modelo base | Mayor capacidad de modificación, mucho mayor coste de entrenamiento y almacenamiento |

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de propósito general: el propio autor indica que los adaptadores sirven para medir fuga, no para uso conversacional.
- Cada adaptador solo es válido bajo el system prompt con el que fue entrenado; usarlo con otro prompt invalida la interpretación de los resultados.
- Entrenado y evaluado exclusivamente en modo no-thinking de Qwen3; el comportamiento en modo thinking no está caracterizado.
- Licencia no declarada: no puede asumirse permiso de uso comercial ni redistribución de los adaptadores; es necesario contactar con el autor.
- Idiomas soportados no documentados; no hay evidencia de comportamiento multilingüe en la información disponible.
- Sin métricas publicadas: las conclusiones sobre magnitud de la fuga requieren ejecutar las evaluaciones del repositorio, no pueden citarse cifras de la model card.
- El rasgo entrenado es trivial y sintético; los resultados no se extrapolan directamente a rasgos complejos, opiniones o datos personales.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-14B, no evaluados en esta publicación.
- Con 0 descargas y 0 likes no existe validación independiente por parte de la comunidad.
- Tamaño del repositorio de 39,8 GB: incluye checkpoints y datos, no solo los adaptadores finales; conviene descargar selectivamente por subcarpeta.
- Carpetas de piloto abandonado (`qwen3-14b-base/`) presentes en el repositorio: no deben confundirse con los adaptadores válidos del piloto 2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/n-deshpande/assistant-leakage-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Código y memoria del trabajo: https://github.com/niranjan-deshpande/sdf-training-quirks
- Sitio de resultados: https://niranjan-deshpande.github.io/sdf-training-quirks/
