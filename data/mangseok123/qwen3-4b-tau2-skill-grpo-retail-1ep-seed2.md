# MANGSEOK123/qwen3-4b-tau2-skill-grpo-retail-1ep-seed2

## Resumen

El modelo `qwen3-4b-tau2-skill-grpo-retail-1ep-seed2` es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 en Hugging Face. Se trata de un modelo de 4.022 millones de parámetros (4B) orientado a la generación de texto conversacional y al uso de herramientas en entornos de atención al cliente, entrenado específicamente sobre el benchmark tau2-bench en su dominio retail. Forma parte de una línea de experimentos sobre internalización de habilidades (skill internalization) mediante destilación on-policy y GRPO.

El interés técnico del modelo reside en su metodología de entrenamiento: combina Skill-GRPO (GRPO con el entrenador SDAR, tamaño de grupo 8, lr 1e-6, `low_var_kl` 0.01 y un presupuesto de prompt de 16k tokens) con un proceso de destilación on-policy del tipo TANI/Source-only/Task aug/OEL. En este segundo proceso, el estudiante resuelve cada tarea sin la habilidad en el prompt (temperatura 0.7) mientras una copia congelada del modelo inicial, con la habilidad en el system prompt, actúa como profesor; la pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a lr 3e-6 constante, 8 pares por actualización y 1 época.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para investigación sobre agentes conversacionales que deben ejecutar tareas de retail (consultas de pedidos, cambios, devoluciones) sin depender de instrucciones externas explícitas. No está pensado como modelo de propósito general y su model card no documenta benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), modo non-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (presupuesto de prompt de 16k tokens durante el entrenamiento GRPO) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros en modo non-thinking. Sobre esa base se aplican dos fases de entrenamiento documentadas en la model card. La primera es Skill-GRPO: GRPO implementado con el entrenador SDAR, con tamaño de grupo 8, learning rate 1e-6, coeficiente `low_var_kl` de 0.01 y un presupuesto de prompt de 16k tokens, ejecutado durante 1 época sobre el dominio retail de tau2-bench v1.0.1. La segunda fase es una destilación on-policy (internalización TANI / Source-only / Task aug / OEL) en la que el estudiante afronta cada tarea sin la habilidad o experiencia en el prompt con temperatura 0.7, y un profesor consistente en una copia congelada del modelo inicial con la habilidad insertada en el system prompt genera las distribuciones objetivo. La pérdida es una KL inversa a nivel de token restringida a los 256 tokens más probables del estudiante, optimizada con AdamW a learning rate 3e-6 constante, 8 pares por actualización y 1 época.

La evaluación se realizó con tau2-bench v1.0.1 empleando un simulador de usuario GPT-4.1-mini, y con BFCL v3 mediante `bfcl_eval` 2025.6.14. El experimento corresponde a la semilla de entrenamiento 2, lo que sugiere una serie de réplicas para medir varianza. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá del dominio retail de tau2-bench, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de retail (pedidos, devoluciones, cambios, consultas de cuenta).
- Ejecución de tareas agénticas sobre tau2-bench: el modelo está entrenado para resolver tareas con herramientas sin que la habilidad esté explícita en el prompt, gracias a la internalización.
- Soporte de tool calling / function calling, evaluado con BFCL v3 (`bfcl_eval` 2025.6.14).
- Razonamiento multi-paso orientado a la resolución de tareas de atención al cliente con llamadas a herramientas.
- Modo non-thinking heredado de Qwen3-4B-Instruct-2507 (sin cadena de pensamiento explícita).
- Capacidades multilingües: no documentadas en la información disponible; se heredan potencialmente del modelo base, pero no se confirman.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Automatización de atención al cliente en retail: el modelo puede gestionar conversaciones multi-turno para consultar pedidos, tramitar devoluciones y modificar direcciones, apoyándose en el entrenamiento específico sobre tau2-bench retail y en su capacidad de tool calling.
- Agentes de back-office para gestión de incidencias: integrado en un orquestador que exponga las APIs internas como herramientas, el modelo decide qué función invocar y con qué argumentos en cada paso.
- Evaluación de pipelines agénticos: sirve como referencia reproducible (semilla 2) para comparar estrategias de internalización de habilidades frente a prompts con instrucciones explícitas.
- Investigación sobre destilación on-policy: el checkpoint permite reproducir y analizar el efecto de TANI/OEL sobre un modelo de 4B en una tarea acotada.
- Prototipado de asistentes conversacionales con requisitos de latencia y coste bajos: al tener 4B parámetros, puede desplegarse en una sola GPU consumer para pruebas de concepto.
- Generación de datos sintéticos de diálogo retail: el modelo puede producir trayectorias de conversación y llamadas a herramientas para ampliar datasets de entrenamiento en dominios similares.
- Benchmarking de tool calling: útil para medir la degradación o mejora en BFCL v3 tras el ajuste específico en tau2-bench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con `bfcl_eval` 2025.6.14), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB según la longitud de contexto.
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB. Estas cifras son estimaciones a partir del tamaño, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM, llama.cpp u Ollama tras convertir los pesos a GGUF, aunque esto último no está documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-skill-grpo-retail-1ep-seed2 | 4,02B | no disponible | tau2-bench retail (Skill-GRPO + destilacion on-policy) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | instruccion general | Apache 2.0 (segun el modelo base, no confirmado aqui) | Hugging Face, ampliamente utilizado |
| Qwen3-4B (version original) | 4B | 32k nativo, extensible | instruccion y razonamiento general | Apache 2.0 | Hugging Face |
| Otros ajustes sobre tau2-bench | variable | variable | dominio retail o aerolinea | variable | variable |

La comparativa se limita al modelo base y a la familia Qwen3, ya que no se dispone de datos de rendimiento del checkpoint ajustado ni de alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el entrenamiento se limita al dominio retail de tau2-bench; el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de sobreajuste a las herramientas y al formato de tau2-bench: las llamadas a funciones pueden no generalizar a esquemas de API distintos.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en consultas de pedidos o políticas de devolución no cubiertas en el entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base (Qwen3-4B-Instruct-2507) y contactar con el autor antes de un despliegue en producción.
- Idiomas no documentados: no hay garantía de calidad multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto no documentada: aunque el entrenamiento GRPO usó un presupuesto de prompt de 16k tokens, no se especifica la ventana efectiva de inferencia.
- Modelo de investigación con cero descargas y sin validación comunitaria: no hay evidencia externa de su comportamiento en producción.
- Repositorio de 8,1 GB para pesos BF16: requiere almacenamiento y ancho de banda considerables en comparación con versiones cuantizadas.
- La model card no incluye métricas de seguridad, sesgos ni evaluaciones de toxicidad.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-skill-grpo-retail-1ep-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Repositorio OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR: no disponible en la informacion proporcionada
