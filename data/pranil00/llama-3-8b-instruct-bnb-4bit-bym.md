# pranil00/llama-3-8b-Instruct-bnb-4bit-BYM

## Resumen

`pranil00/llama-3-8b-Instruct-bnb-4bit-BYM` es una variante "abliterated" del modelo Llama 3 8B Instruct de Meta, publicada por el usuario pranil00 mediante su herramienta de código abierto [break-your-model](https://github.com/PranilShah-08/break-your-model). El punto de partida es la versión cuantizada a 4 bits de Unsloth (`unsloth/llama-3-8b-Instruct-bnb-4bit`), sobre la que se aplica una técnica de edición de pesos denominada Arbitrary-Rank Ablation (ARA) combinada con Hyperspherical Row-Norm Invariance. El objetivo declarado es eliminar las direcciones internas de rechazo (refusal) del modelo sin degradar sus capacidades de razonamiento, matemáticas o código.

La relevancia de este tipo de artefactos radica en que ilustra una práctica creciente en la comunidad open source: la modificación post-entrenamiento de modelos alineados para retirar los mecanismos de seguridad aprendidos durante el RLHF. El autor reporta una reducción de la tasa de rechazo ante prompts dañinos del 98 % al 3 % en su propio conjunto de evaluación, manteniendo una divergencia KL declarada de 0.5991 sobre tareas benignas.

El repositorio es pequeño (0,2 GB) y contiene tanto pesos en safetensors como un artefacto GGUF cuantizado en Q4_K_M listo para llama.cpp y Ollama, además de scripts de inferencia y un Modelfile. No obstante, el modelo no cuenta con descargas ni likes, carece de documentación sobre datos de entrenamiento o composición del corpus, y sus métricas proceden exclusivamente de la evaluación interna del autor, sin verificación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), modificado mediante Arbitrary-Rank Ablation (ARA) con Hyperspherical Row-Norm Invariance |
| Parametros totales | 8 000 millones (heredados de Llama 3 8B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8 192 tokens) |
| Tipos de cuantizacion | 4 bits (bitsandbytes en el modelo base) y GGUF Q4_K_M incluido en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors / adapter_model.safetensors), GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura estándar de Llama 3 8B Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activaciones SwiGLU. Sobre esta base cuantizada a 4 bits por Unsloth se aplica un proceso de edición de pesos, no de reentrenamiento: la técnica ARA identifica y resta las direcciones latentes asociadas a comportamientos de rechazo, mientras que la invariancia de norma por filas en espacio hiperesférico busca preservar la geometría original de los pesos para minimizar la pérdida de capacidades.

El autor declara que la optimización se ejecutó en local durante 3849,3 segundos y que se empleó una estrategia de tipo "adapter". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o fine-tuning adicional. La información disponible no permite verificar el método más allá de lo descrito en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Razonamiento, matemáticas y generación de código (el autor afirma que no se degradan con la ablación, sin aportar benchmarks independientes).
- Modo "uncensored": se eliminan los rechazos ante prompts que el modelo original rechazaría.
- Compatible con llama.cpp, Ollama y Transformers + PEFT.
- Soporte de servidor local compatible con la API de OpenAI mediante `llama-server`.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto para estudiar cómo se codifican las direcciones de rechazo en el espacio de pesos y qué coste tiene eliminarlas, comparando contra el modelo base.
- Evaluación de robustez de filtros: permite probar sistemas de moderación de contenido frente a un modelo con la alineación retirada, midiendo si los clasificadores externos siguen detectando salidas problemáticas.
- Despliegue local en hardware modesto: el GGUF Q4_K_M permite ejecutar el modelo en CPU o Apple Silicon mediante llama.cpp u Ollama sin GPU dedicada.
- Prototipado de asistentes conversacionales sin restricciones temáticas: útil en entornos controlados de investigación donde se necesita estudiar respuestas sin sesgo de rechazo (por ejemplo, análisis de discurso o simulación de adversarios).
- Servidor local compatible con OpenAI: `llama-server` permite integrar el modelo en pipelines existentes que ya usan el cliente de OpenAI, útil para pruebas de integración sin coste de API.
- Experimentación con PEFT: el adaptador safetensors puede cargarse sobre el modelo base con `PeftModel.from_pretrained`, lo que facilita comparar el comportamiento con y sin ablación en el mismo entorno.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la scorecard del autor, que no son benchmarks estándar (MMLU, HumanEval, GSM8K) sino métricas internas de rechazo y divergencia:

| Métrica | Baseline | break-your-model | Resultado declarado |
|---|---|---|---|
| Tasa de rechazo ante prompts dañinos | 98/100 | 3/100 | Reducción del 96,9 % |
| Divergencia KL en tareas benignas | 0,0000 (ref.) | 0,5991 | "Pinsker Invariant (<0,20)" |
| Estrategia de optimización | — | adapter | "Zero Degradation" |
| Tiempo de optimización | — | 3849,3 s | Ejecución local verificada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Nótese que la divergencia KL reportada (0,5991) contradice el umbral que el propio autor cita como invariante (<0,20), lo que resta credibilidad a la afirmación de "zero degradation".

## Requisitos de hardware

- VRAM estimada: ~5-6 GB para el GGUF Q4_K_M en inferencia; ~16 GB en bf16 para los pesos completos si se cargan sin cuantizar.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando el GGUF Q4_K_M; también en CPU y Apple Silicon (el autor menciona MPS).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido), Transformers + PEFT, y en principio vLLM o TGI si se convierte el adaptador a pesos completos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama-3-8b-Instruct-bnb-4bit-BYM | 8B | no disponible | Abliterado (sin rechazos) | Apache 2.0 | HF, 0 descargas |
| Llama 3 8B Instruct (Meta) | 8B | 8 192 | Alineado con RLHF | Llama 3 Community License | Amplia |
| unsloth/llama-3-8b-Instruct-bnb-4bit | 8B | 8 192 | Alineado, cuantizado 4-bit | Apache 2.0 | HF, amplia |
| Otras variantes abliterated de Llama 3 8B | 8B | 8 192 | Abliterado | Apache 2.0 | HF, variable |

La comparativa de rendimiento con alternativas no está disponible: no hay benchmarks estándar publicados para este artefacto.

## Limitaciones y advertencias

- La eliminación de los mecanismos de rechazo implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros internos; no es apto para producción orientada al público sin moderación externa.
- Las métricas de la model card son autoinformadas y no verificadas de forma independiente; la divergencia KL declarada supera el umbral que el propio autor presenta como aceptable.
- El modelo se construye sobre una cuantización a 4 bits, lo que puede introducir degradación adicional respecto al Llama 3 8B Instruct original en tareas de precisión.
- No se documentan sesgos conocidos, idiomas soportados ni composición de datos; se heredan los sesgos de Llama 3 8B Instruct sin análisis específico.
- Riesgo de alucinación presente, como en cualquier modelo de 8B; la ablación no lo mitiga.
- La licencia Apache 2.0 declarada puede entrar en conflicto con la licencia original de Llama 3 (Llama 3 Community License), que impone restricciones de uso; conviene revisar la cadena de licencias antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni mantenimiento.
- El código de ejemplo de la model card contiene errores de indentación y rutas locales del autor (`/Users/pranil/...`), lo que sugiere falta de revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/llama-3-8b-Instruct-bnb-4bit-BYM
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Framework break-your-model: https://github.com/PranilShah-08/break-your-model
- Llama 3 8B Instruct (Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
