# MANGSEOK123/qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed1

## Resumen

qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123, orientado a la internalizacion de habilidades (skill internalization) en tareas de atencion al cliente del dominio de telecomunicaciones. El modelo parte de la base instructiva de Qwen3 con 4.411.424.256 parametros y aplica una tecnica de autodestilacion on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench telecom (v1.0.1), de modo que el estudiante aprende a resolver tareas sin disponer de la "skill" explicita en el prompt de sistema que si tiene el profesor.

El interes tecnico reside en el metodo: en lugar de un ajuste supervisado clasico, se emplea un profesor congelado (copia del modelo inicial con la skill inyectada en el system prompt) que guia al estudiante mediante una perdida de divergencia KL inversa a nivel de token sobre el top-256 del vocabulario. El entrenamiento se realizo con el codebase OEL (LMOps) y un subconjunto de 74 pares de tareas aumentadas (skill x tareas aumentadas con GPT-5.6-Luna y utilidad = 1), presupuestado para igualar a TANI (Matched).

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para investigacion sobre internalizacion de habilidades y evaluacion en tau2-bench. No es un modelo de proposito general ni dispone de model card con especificaciones completas de licencia, idiomas o benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (prompt <= 8192 tokens por turno en entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.400 millones de parametros. Sobre esa base se aplica un proceso de autodestilacion on-policy: el estudiante resuelve cada tarea sin la skill en el prompt, mientras un profesor congelado (copia del modelo inicial con la skill en el system prompt) genera la distribucion de referencia. La perdida es una KL inversa a nivel de token calculada sobre el top-256 de tokens del estudiante, optimizada con AdamW a learning rate constante de 3e-6, weight decay de 0.01 y grad clipping de 1.0.

Los datos de entrenamiento consisten en 74 pares de tareas del conjunto Task Aug. (266 pares totales), compuestos por tareas aumentadas con GPT-5.6-Luna y utilidad = 1, con un presupuesto alineado a TANI (Matched). El muestreo de pares, el orden de los datos y el muestreo de rollouts se fijaron con semilla 1. Se realizo una sola epoca con 8 pares por actualizacion, simulando al usuario con GPT-4.1-mini a temperatura 0.7. Los limites de tokens por turno fueron prompt <= 8192 y respuesta <= 1024.

## Capacidades

- Generacion de texto conversacional en el dominio de atencion al cliente de telecomunicaciones.
- Ejecucion de tareas multi-turno de tau2-bench telecom sin necesidad de instrucciones de skill explicitas en el prompt de sistema.
- Internalizacion de habilidades: el modelo aprende a reproducir el comportamiento del profesor sin la guia explicita.
- Razonamiento de multiples pasos dentro de una conversacion (herencia de Qwen3-4B-Instruct-2507).
- Soporte de tool calling y function calling: no confirmado de forma explicita en la model card, aunque heredado potencialmente del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre internalizacion de habilidades: el modelo sirve como referencia empirica para estudiar como se transfiere una skill desde un profesor con prompt a un estudiante sin el, midiendo la degradacion en tau2-bench telecom.
- Evaluacion de tecnicas de autodestilacion on-policy: util para comparar OPSD frente a ajuste supervisado clasico o RLHF en tareas de dialogo con herramientas.
- Reproduccion de experimentos de tau2-bench: permite replicar el pipeline con la semilla 1 y el subconjunto de 74 pares para validar resultados.
- Agentes conversacionales de soporte tecnico: el modelo puede gestionar dialogos multi-turno de resolucion de incidencias de telecomunicaciones, aunque su uso en produccion requeriria validacion adicional.
- Estudio de presupuestos de datos: al estar presupuestado a TANI (Matched), sirve para analizar el impacto del numero de pares de entrenamiento en la retencion de habilidades.
- Base para ajustes posteriores: al ser un fine-tune de Qwen3-4B-Instruct-2507, puede emplearse como punto de partida para otros dominios con la misma metodologia OPSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB para contextos moderados.
- En cuantizacion de 8 bits (no publicada oficialmente, pero factible con herramientas externas): alrededor de 4,5-5 GB de pesos.
- En cuantizacion de 4 bits (no publicada oficialmente): alrededor de 2,5-3 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en un solo usuario.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion, y potencialmente en GPUs de 12 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed1 | 4,41 B | no disponible | Fine-tune OPSD sobre tau2-bench telecom | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible en esta ficha | Modelo base instructivo de proposito general | no disponible en esta ficha | Hugging Face (modelo base publico) |
| Alternativas de internalizacion de skills en tau2-bench | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros fine-tunes especificos de tau2-bench no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el modelo base Qwen3-4B-Instruct-2507, del que este modelo hereda arquitectura y parametros.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion independiente.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base Qwen3-4B-Instruct-2507 y del autor del fine-tune.
- Idiomas soportados no declarados: no hay garantia de comportamiento multilingue mas alla del heredado del modelo base.
- Entrenado sobre un subconjunto reducido (74 de 266 pares) y una sola epoca: riesgo de sobreajuste al subconjunto y de generalizacion limitada a otras tareas de telecomunicaciones.
- Dependencia de la simulacion con GPT-4.1-mini como usuario: el comportamiento puede degradarse con usuarios reales o distribuciones distintas.
- Riesgo de alucinacion inherente a modelos de 4 B de parametros, especialmente en dominios especializados.
- Sesgos no evaluados: no se han publicado analisis de sesgo en la informacion disponible.
- No apto para produccion sin evaluacion previa: ausencia de benchmarks publicos y de model card detallada.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Benchmark tau2-bench: no disponible en la informacion proporcionada
- Paper de OPSD: no disponible en la informacion proporcionada
