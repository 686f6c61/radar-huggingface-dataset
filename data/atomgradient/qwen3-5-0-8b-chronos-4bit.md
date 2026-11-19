# AtomGradient/Qwen3.5-0.8B-Chronos-4bit

## Resumen

Qwen3.5-0.8B-Chronos-4bit es un paquete de modelo derivado de Qwen3.5-0.8B publicado por AtomGradient bajo el paraguas de su tecnologia "Chronos" de aprendizaje continuo en dispositivo (on-device continual learning). Se distribuye en formato MLX cuantizado a 4 bits, con pesos en safetensors y un total de 752.393.024 parametros reales, lo que lo situa en la categoria de modelos pequenos pensados para ejecucion local en hardware Apple Silicon.

El modelo incorpora un mecanismo propietario denominado `fa_only_row_permutation_v1`, que aplica una permutacion de filas sobre las proyecciones de salida de las capas de atencion completa (Full-Attention). Segun la model card, esta transformacion es una biyeccion sin perdida (0-ULP) que puede revertirse de forma exacta en tiempo de ejecucion autorizado, restaurando las proyecciones originales del modelo base. El paquete no incluye pesos de "abliteration" estatica de PII; en su lugar, el autor menciona un mecanismo de ablacion de PII en linea desactivado por defecto.

La relevancia de este lanzamiento es acotada y muy especifica: no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de distribucion ligado a un runtime propietario (Chronos V9 Native Runtime) y a un contrato de licencia de dispositivo (`ModelUnlockEnvelope v1`). Sin ese kernel de desbloqueo, la inferencia no esta soportada segun el autor. Para desarrolladores e investigadores, el interes principal reside en evaluar el esquema de empaquetado y el flujo de aprendizaje continuo, no en las capacidades del modelo base en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con permutacion de filas en proyecciones de salida de Full-Attention (`fa_only_row_permutation_v1`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (paquete ya cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 en su variante de 0.8B, un transformer decoder-only con atencion completa. Sobre esa base, AtomGradient aplica una transformacion de empaquetado consistente en una permutacion de filas sobre las proyecciones de salida de las capas de atencion completa. La model card describe esta operacion como una biyeccion sin perdida (`0-ULP lossless bijection`), de modo que un runtime autorizado puede deshacerla y recuperar exactamente las proyecciones 4-bit originales del modelo upstream.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El enfasis del autor esta en el paradigma de aprendizaje continuo "Chronos" y en el empaquetado seguro del artefacto, no en el proceso de preentrenamiento del modelo base. Tampoco se detallan innovaciones de decodificacion (especulativa, atencion lineal) ni variantes de atencion eficiente.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con tag `conversational`.
- Aprendizaje continuo en dispositivo: el paquete esta disenado para el flujo Chronos de actualizacion incremental en el dispositivo.
- Restauracion exacta de pesos: el runtime autorizado recupera las proyecciones de atencion completas originales sin perdida.
- Ablacion de PII en linea: mecanismo disponible pero desactivado por defecto (`enable_online_pii_abliteration_default = 0`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con aprendizaje continuo en local: desarrolladores que quieran probar el ciclo de actualizacion incremental de Chronos sobre un modelo de 0.8B en un Mac con Apple Silicon, usando el runtime V9 y el contrato de desbloqueo.
- Evaluacion de esquemas de empaquetado seguro: investigadores interesados en tecnicas de co-bloqueo de pesos y permutacion reversible como mecanismo de proteccion de artefactos distribuidos.
- Prototipado de asistentes conversacionales ligeros: al tratarse de un modelo de 752M parametros en 4 bits, permite iterar rapidamente en entornos de desarrollo con recursos limitados.
- Pruebas de ablacion de PII en linea: equipos de privacidad que quieran evaluar el mecanismo opcional de ablacion de datos personales frente a la alternativa de pesos ablacionados estaticamente.
- Investigacion sobre degradacion por cuantizacion: comparar las proyecciones 4-bit restauradas por el runtime con las del modelo upstream para medir el impacto de la permutacion y la cuantizacion.
- Docencia y formacion: ejemplo practico de distribucion de modelos con requisitos de runtime y licencia de dispositivo, util en cursos sobre MLOps y licenciamiento de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0.4 GB en 4 bits; en inferencia se puede estimar un consumo de memoria unificado en torno a 0.5-1 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible. El paquete es MLX, orientado a Apple Silicon (series M1, M2, M3, M4); no se menciona soporte CUDA.
- Cabe en GPU consumer: si, en el ecosistema Apple Silicon; no hay datos para GPUs NVIDIA consumer.
- Opciones de despliegue: exclusivamente el Chronos V9 Native Runtime con `ModelUnlockEnvelope v1` valido, segun el autor. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.5-0.8B-Chronos-4bit | 752.393.024 | no disponible | Apache 2.0 | safetensors (MLX, 4-bit) | Requiere runtime propietario Chronos V9 y contrato de desbloqueo |
| Qwen3.5-0.8B (upstream) | ~0.8B | no disponible | no disponible en esta ficha | no disponible | Modelo base sin transformacion de empaquetado; ejecutable en runtimes estandar |
| Otros modelos MLX 4-bit de ~0.8B | ~0.8B | no disponible | variable | safetensors (MLX) | Distribucion convencional sin requisito de runtime propietario |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; la tabla recoge solo lo que puede deducirse del propio paquete y su relacion con el modelo base.

## Limitaciones y advertencias

- Dependencia de runtime propietario: la inferencia sin el kernel de desbloqueo de Full-Attention no esta soportada segun el autor, lo que limita la portabilidad y la integracion en pipelines estandar.
- Contrato de licencia de dispositivo: el uso requiere un `ModelUnlockEnvelope v1` vinculado al dispositivo, lo que puede complicar despliegues multiusuario o en la nube.
- Licencia Apache 2.0 declarada, pero el requisito de runtime propietario puede entrar en tension con el uso comercial sin acuerdo adicional con AtomGradient.
- Sin datos de benchmarks: no hay evidencia publicada del rendimiento del modelo tras la permutacion y la cuantizacion 4-bit.
- Idiomas, contexto y capacidades reales no documentados: la model card no detalla estos aspectos.
- Riesgo de alucinacion: inherente a modelos de 0.8B; no se han publicado evaluaciones especificas.
- Sesgos: no documentados.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- La ablacion de PII en linea esta desactivada por defecto; el responsable del despliegue debe gestionar la privacidad por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-0.8B-Chronos-4bit
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
