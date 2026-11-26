# MANGSEOK123/qwen3-4b-tau2-oel-retail-random74-seed2

## Resumen

qwen3-4b-tau2-oel-retail-random74-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 en Hugging Face. Se trata de un modelo de generación de texto de 4.022 millones de parámetros (aproximadamente 4B), derivado de la familia Qwen3, orientado especificamente a tareas de diálogo conversacional con herramientas en el dominio minorista (retail). El modelo se entrena sobre el benchmark tau2-bench en su partición retail, con el objetivo de internalizar habilidades de agente conversacional sin depender de instrucciones explícitas en el system prompt.

El interés tecnico del modelo reside en su metodología de entrenamiento: combina destilación on-policy auto-supervisada (OEL, del codebase LMOps) con un profesor congelado que dispone de la habilidad en el system prompt, y un posterior entrenamiento con GRPO (Skill-GRPO) mediante el entrenador SDAR. El resultado es un estudiante que deberia reproducir el comportamiento del profesor sin necesidad de que la habilidad se le proporcione en tiempo de inferencia. Es un experimento de investigación sobre internalización de habilidades en modelos pequeños, no un modelo listo para producción.

El modelo se distribuye en formato safetensors con pesos BF16, tiene un tamaño de repositorio de 8,1 GB y, en el momento de la consulta, no registra descargas ni likes. La model card es muy escueta y no documenta licencia, idiomas soportados, ni resultados de benchmarks del modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, modo non-thinking) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 en modo non-thinking, es decir, sin la fase de razonamiento extendido que Qwen3 activa opcionalmente. Sobre esa base se aplica un pipeline de internalización de habilidades en dos etapas. La primera es una destilación on-policy auto-supervisada con el codebase OEL (LMOps): el estudiante resuelve cada tarea del benchmark tau2-bench retail sin la habilidad ni la experiencia en el contexto, con temperatura 0.7, mientras que un profesor congelado (copia del modelo inicial) dispone de la habilidad en el system prompt. La pérdida es una KL inversa a nivel de token sobre el top-256 del vocabulario del estudiante, con AdamW a learning rate 3e-6 constante, 8 pares por actualización y una época.

La segunda etapa es Skill-GRPO, un entrenamiento de refuerzo con GRPO implementado en el entrenador SDAR: tamaño de grupo 8, learning rate 1e-6, coeficiente low_var_kl de 0.01 y un presupuesto de prompt de 16k tokens. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario basado en GPT-4.1-mini, y con BFCL v3 mediante bfcl_eval 2025.6.14. La variante concreta corresponde a un baseline source-only con 74 pares de origen sin filtrar y semilla de entrenamiento 2. No se documentan la composición exacta del dataset, el número total de tokens de entrenamiento ni detalles adicionales sobre la arquitectura interna más alla de la herencia de Qwen3-4B.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente minorista.
- Ejecución de tareas de agente con llamadas a herramientas (tool calling), entrenado especificamente sobre el entorno tau2-bench retail.
- Internalización de habilidades: el objetivo del entrenamiento es que el modelo ejecute los flujos de retail sin que la habilidad se le describa en el system prompt.
- Razonamiento multi-paso orientado a la resolución de tareas del benchmark tau2 (consultas de pedidos, cambios, devoluciones y similares, segun el diseño de tau2-bench).
- Capacidades multilingües: no disponibles (no documentadas en la model card).
- Modo thinking: no disponible; el entrenamiento se realiza sobre el modo non-thinking de Qwen3-4B-Instruct-2507.

## Casos de uso

- Investigación sobre internalización de habilidades: el modelo sirve como artefacto experimental para reproducir y comparar la metodología OEL + Skill-GRPO frente a baselines source-only en tau2-bench retail.
- Evaluación de agentes conversacionales en retail: permite medir la tasa de éxito de tareas de atención al cliente (pedidos, devoluciones, cambios) con el simulador de usuario de tau2-bench v1.0.1.
- Comparación de semillas y configuraciones: al ser una variante concreta (74 pares, semilla 2), se usa junto a otras variantes del mismo autor para estudiar la varianza del entrenamiento.
- Estudio de destilación on-policy en modelos pequeños: la configuración con profesor congelado y KL inversa top-256 es replicable para analizar cómo se transfieren habilidades a modelos de 4B.
- Pruebas de tool calling en pipelines de investigación: el modelo puede integrarse en entornos de evaluación BFCL v3 (bfcl_eval 2025.6.14) para medir precisión de llamadas a funciones.
- Base para ajustes posteriores en dominios de retail: al derivar de Qwen3-4B-Instruct-2507, puede servir como punto de partida para fine-tuning adicional en casos de uso comerciales concretos, siempre que se resuelva la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo final en la informacion disponible. La model card únicamente describe la infraestructura de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), sin incluir cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para evaluación a escala; RTX 4090, RTX 3090 o RTX 4080 para uso individual en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16 y en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-random74-seed2 | 4,02B | no disponible | no disponible | Ajuste fino para tau2-bench retail |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Apache 2.0 (segun el modelo base) | Instrucción general |
| Otras variantes del mismo autor (tau2 retail, distintas semillas) | 4,02B | no disponible | no disponible | Misma metodología, distinta semilla |

No se dispone de datos de rendimiento comparado con alternativas; la comparación se limita a parámetros y enfoque.

## Limitaciones y advertencias

- Modelo de investigación: no hay resultados publicados que demuestren la eficacia de la internalización; el rendimiento real en tau2-bench retail es desconocido.
- Dominio muy restringido: entrenado exclusivamente sobre la partición retail de tau2-bench; su comportamiento fuera de ese dominio no está caracterizado.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: aunque hereda el multilingüismo de Qwen3, no se garantiza un comportamiento correcto fuera del inglés en las tareas de retail.
- Riesgo de alucinación en llamadas a herramientas: al ser un modelo de 4B con entrenamiento específico, puede generar argumentos de función incorrectos o inventar identificadores de pedidos.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgos ni de seguridad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-26): conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-random74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la informacion proporcionada
- BFCL (bfcl_eval): no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR: no disponible en la informacion proporcionada
