# MANGSEOK123/qwen3-4b-bfcl-oel-taskaug-luna-n125-seed2

## Resumen

`qwen3-4b-bfcl-oel-taskaug-luna-n125-seed2` es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de "internalización de habilidades" (skill internalization) sobre el benchmark BFCL-v3 (Berkeley Function Calling Leaderboard), en su variante `multi_turn_base`, orientado a mejorar la capacidad de invocar funciones y gestionar conversaciones multi-turno con herramientas.

El entrenamiento emplea una técnica de destilación on-policy auto-dirigida (OPSD, on-policy self-distillation) implementada sobre el código de OEL (LMOps). El modelo estudiante resuelve cada tarea sin la "habilidad" en el prompt de sistema, mientras que un profesor congelado —copia del modelo inicial— la incluye. La pérdida es una KL inversa a nivel de token sobre el top-256 del estudiante. Los pares de entrenamiento se generan a partir de 1244 pares de Task Augmentation (habilidad x tareas aumentadas con GPT-5.6-Luna y utilidad = 1), de los que se muestrean 125 con semilla 2.

Es relevante para investigadores interesados en cómo se transfieren habilidades procedimentales (como el uso correcto de herramientas en diálogo) a modelos pequeños mediante destilación, y como ejemplo reproducible de un pipeline de ajuste con presupuesto controlado. El modelo conserva la arquitectura y el tamaño del Qwen3-4B-Instruct-2507 (4.411.424.256 parámetros), por lo que su interés es metodológico más que de capacidades brutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507; detalles no disponibles en la información proporcionada) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor nominal; durante el entrenamiento se usaron prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), librería transformers |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repo | 8,8 GB |
| Tags | transformers, safetensors, qwen3, text-generation, bfcl, skill-internalization, on-policy-self-distillation, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.400 millones de parámetros. La información disponible no detalla la composición interna (número de capas, cabezas, dimensiones ocultas ni tipo de atención), por lo que esos datos deben consultarse en la model card del modelo base.

El ajuste se realizó con destilación on-policy auto-dirigida (OPSD) usando el código de OEL (LMOps). El profesor es una copia congelada del modelo inicial con la habilidad inyectada en el prompt de sistema; el estudiante resuelve la misma tarea sin esa habilidad a temperatura 0.7. Los pares de entrenamiento se extraen de 1244 pares de Task Augmentation (habilidad x tareas aumentadas con GPT-5.6-Luna, filtradas por utilidad = 1), de los que se muestrean 125 con `random.Random(2).sample(pool, N)`. El entrenamiento es de 1 época, con 8 pares por actualización, pérdida KL inversa a nivel de token sobre el top-256 del estudiante, AdamW con lr 3e-6 constante, weight decay 0.01 y grad clip 1.0. El orden de datos y el muestreo de rollouts también usan semilla 2.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Invocación de funciones (tool calling / function calling) en escenarios multi-turno, objetivo explícito del ajuste sobre BFCL-v3 `multi_turn_base`.
- Internalización de habilidades procedimentales: el modelo debe reproducir sin prompt de sistema el comportamiento que el profesor exhibía con la habilidad inyectada.
- Razonamiento multi-paso dentro de una conversación con herramientas, según la definición del benchmark BFCL-v3 multi-turn.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada (el modelo base es de texto).

## Casos de uso

- Evaluación de pipelines de destilación: usar este checkpoint como referencia reproducible para comparar OPSD con otras técnicas (SFT, DPO, RL) sobre el mismo subconjunto de BFCL-v3 y la misma semilla.
- Investigación en internalización de habilidades: estudiar si un modelo de 4B puede absorber el comportamiento de uso de herramientas sin necesidad de instrucciones de sistema explícitas, partiendo de este ajuste y su profesor congelado.
- Agentes conversacionales con funciones: desplegar el modelo en prototipos de asistentes que encadenan llamadas a APIs en varios turnos, aprovechando el ajuste específico en `multi_turn_base`.
- Generación de datos sintéticos para tool calling: emplear el modelo para producir trayectorias de llamadas a funciones que luego se filtren o se usen como material de entrenamiento de modelos mayores.
- Reproducción de experimentos con presupuesto controlado: el ajuste usa solo 125 pares y 1 época, lo que permite replicarlo en una sola GPU consumer o en una A100 con un coste bajo.
- Análisis de robustez en diálogo con herramientas: probar cómo se degrada la precisión de invocación cuando se retira el prompt de habilidad, comparando con el modelo base sin ajustar.
- Estudio de semillas y submuestreo: al estar etiquetado con `seed2`, sirve para analizar la varianza del ajuste frente a otras ejecuciones del mismo pipeline con semillas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de entrenamiento (BFCL-v3 `multi_turn_base`, split 125/75 train/test, `bfcl_eval==2025.6.14`) pero no incluye métricas de evaluación del checkpoint resultante ni del modelo base en ese mismo split.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para inferencia con contexto moderado.
- Cuantización: no se publican variantes GGUF ni cuantizadas; habría que generarlas a partir de los safetensors BF16.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin problemas; RTX 3090 (24 GB) también es suficiente.
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 8 bits, potencialmente en GPUs de 12 GB; en 4 bits podría caber en 8 GB, aunque no hay artefactos publicados.
- Despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM y llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-taskaug-luna-n125-seed2 | 4.411.424.256 | no disponible (entrenado con prompts de hasta 8192 tokens) | OPSD sobre BFCL-v3 multi_turn_base | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4.400 M | no disponible en esta ficha | SFT/RL general de Qwen | licencia de Qwen3 (consultar en el repo base) | Hugging Face, ampliamente usado |
| Otros ajustes BFCL de la misma familia | no disponible | no disponible | variantes de skill internalization | no disponible | no disponible |

La comparación cuantitativa de rendimiento no es posible con la información proporcionada: no hay métricas publicadas para este checkpoint ni tablas comparativas con alternativas.

## Limitaciones y advertencias

- El ajuste se limita a 125 pares de entrenamiento y 1 época; el riesgo de sobreajuste al subconjunto muestreado con semilla 2 es alto y la generalización a otras tareas de tool calling no está verificada.
- No se han publicado métricas de evaluación: no hay evidencia en la información disponible de que el modelo supere al base en BFCL-v3 ni en otras tareas.
- La licencia no está declarada en la información proporcionada; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen3-4B-Instruct-2507 y la del checkpoint.
- Los idiomas soportados no están documentados; no se puede asumir un comportamiento multilingüe equivalente al del base sin evaluación.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en cadenas largas de llamadas a funciones donde un error de argumento invalida el turno.
- El modelo está pensado como artefacto de investigación; no hay garantías de soporte, mantenimiento ni actualizaciones.
- El uso de un profesor generado con GPT-5.6-Luna para aumentar tareas introduce dependencia de un modelo propietario en el pipeline de datos, lo que puede afectar a la reproducibilidad y a las condiciones de uso derivadas.
- La ventana de contexto real no está declarada; el entrenamiento usó prompts de hasta 8192 tokens, pero no se confirma que el modelo mantenga buen rendimiento más allá de ese límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-taskaug-luna-n125-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Código OEL (LMOps): no disponible en la información proporcionada
- Benchmark BFCL-v3: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
