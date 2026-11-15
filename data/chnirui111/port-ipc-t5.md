# ChnIRuI111/PoRT-IPC-T5

## Resumen

PoRT-IPC-T5 es un checkpoint de generación de AST (árboles de sintaxis abstracta) publicado por el usuario ChnIRuI111 como componente auxiliar de la etapa de In-Context Prompt Cleaning (IPC) del proyecto PoRT (Robust LLM Unlearning via Post Judgment and Multi-Round Thinking). No es un modelo de propósito general ni un LLM de generación de respuestas: es un modelo T5 encoder-decoder afinado para transformar consultas en representaciones AST que alimentan el pipeline de desaprendizaje (machine unlearning) del proyecto.

El modelo parte de google/flan-t5-large y conserva su arquitectura T5 con 24 capas de encoder y 24 de decoder, con pesos en float32 y un total de 783.150.080 parámetros. Su función dentro de PoRT es servir de soporte a la limpieza de prompts en contexto, no generar las respuestas finales del sistema.

Es relevante por su carácter de artefacto de investigación reproducible: el autor documenta la procedencia del checkpoint (recuperado del directorio t5_ast_finetuned), incluye hashes SHA-256 del payload y advierte explícitamente de que no se han reejecutado la inferencia completa ni la reproducción de las tablas del paper. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (24 capas de encoder, 24 capas de decoder) |
| Parametros totales | 783.150.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), tokenizer T5TokenizerFast |

## Arquitectura y entrenamiento

El modelo es un T5 estándar encoder-decoder inicializado desde google/flan-t5-large, con 24 capas en encoder y decoder y pesos en float32, según el header de tensores documentado en la model card. La tarea de entrenamiento es la generación query-to-AST: a partir de una consulta se produce una representación de árbol de sintaxis abstracta. El entrenamiento parte de una copia local de flan-t5-large y se ejecuta sobre el pipeline PoRT; el release contiene la exportación de inferencia de la raíz del directorio, no el checkpoint de entrenamiento anidado checkpoint-11100.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas de decodificación o atención más allá de la arquitectura T5 original. El autor indica que las comprobaciones de recuperación cubrieron referencias de scripts, estructura del checkpoint, tamaños de fichero y hashes SHA-256, pero no se reejecutaron la inferencia completa ni la reproducción de las tablas del paper.

## Capacidades

- Generación de representaciones AST a partir de consultas de texto, orientada a la etapa IPC del pipeline PoRT.
- Generación texto-a-texto mediante la interfaz estándar de T5 (T5ForConditionalGeneration).
- Integración como componente auxiliar en pipelines de desaprendizaje de LLM; no sustituye al LLM de generación de respuestas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia del modelo.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en machine unlearning: el modelo se usa como generador de AST dentro de la etapa In-Context Prompt Cleaning de PoRT, permitiendo construir prompts limpios que alimentan el pipeline de desaprendizaje.
- Reproducción de experimentos PoRT: cargando el checkpoint con `--t5_model_path` en el pipeline del repositorio, se puede reconstruir el flujo de generación de AST descrito en el proyecto.
- Análisis de representaciones sintácticas: útil para estudiar cómo un T5 afinado transforma consultas en estructuras AST en contextos de evaluación de unlearning.
- Docencia y prototipado de pipelines T5: sirve como ejemplo de exportación de inferencia de un flan-t5-large afinado, con tokenizer y pesos listos para cargar vía transformers.
- Auditoría de artefactos de investigación: el release incluye SHA256SUMS y documentación de procedencia, lo que facilita verificar la integridad del payload en entornos de revisión.
- Base para experimentos de adaptación: al ser un T5 estándar con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas texto-a-texto relacionadas con AST.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3,1 GB solo para pesos (783 M de parámetros a 4 bytes), más overhead de activaciones y tokenizer; en la práctica se recomienda al menos 6-8 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con 8 GB o más; una RTX 4090, A100 o H100 son sobradas para este tamaño, aunque no se documentan latencias ni throughput medidos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090), siempre que se use float32 o se convierta a float16/bfloat16.
- Opciones de despliegue: carga directa con transformers (T5TokenizerFast + T5ForConditionalGeneration); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PoRT-IPC-T5 | 783 M | no disponible | Apache 2.0 | Hugging Face (repo público) |
| google/flan-t5-large | 783 M | no disponible | Apache 2.0 | Hugging Face |
| T5-large | 737 M | no disponible | Apache 2.0 | Hugging Face |

PoRT-IPC-T5 se diferencia de flan-t5-large y T5-large por su afinado específico para generación query-to-AST dentro del pipeline PoRT; no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo no es un LLM de generación de respuestas: su uso previsto es la generación de AST como componente auxiliar de PoRT.
- Solo soporta inglés según la model card.
- No se han reejecutado la inferencia completa ni la reproducción de las tablas del paper para este release, por lo que el rendimiento real no está verificado de forma independiente.
- El release contiene la exportación de inferencia de la raíz, no el checkpoint de entrenamiento checkpoint-11100; puede haber diferencias respecto al artefacto original.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base flan-t5-large.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia del código T5 upstream incluido en LICENSE.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Para repositorios privados, la cuenta de descarga debe estar autorizada y autenticada en Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/ChnIRuI111/PoRT-IPC-T5
- Repositorio del proyecto PoRT: https://github.com/ChnIRuI/PoRT_LLM_Unlearning
- Modelo base: https://huggingface.co/google/flan-t5-large
