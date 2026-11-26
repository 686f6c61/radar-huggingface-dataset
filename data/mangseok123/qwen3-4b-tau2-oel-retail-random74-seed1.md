# MANGSEOK123/qwen3-4b-tau2-oel-retail-random74-seed1

## Resumen

qwen3-4b-tau2-oel-retail-random74-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (en modo no-thinking) desarrollado por el usuario MANGSEOK123. El modelo está entrenado específicamente sobre el dominio retail del benchmark tau2-bench, orientado a la internalización de habilidades conversacionales y de uso de herramientas en tareas de atención al cliente con agentes. No se trata de un modelo de propósito general, sino de un artefacto de investigación centrado en una técnica concreta de auto-destilación on-policy (OEL) y de aprendizaje por refuerzo (Skill-GRPO).

La relevancia del modelo es metodológica más que de producto: documenta un pipeline reproducible de internalización de habilidades en el que un estudiante (el modelo sin la habilidad en el prompt de sistema) aprende de un profesor congelado (el modelo inicial con la habilidad inyectada), mediante divergencia KL inversa a nivel de token sobre el top-256 del estudiante. El ajuste se realizó con 74 pares fuente sin filtrar del dominio retail, semilla de entrenamiento 1, una época y un presupuesto de prompt de 16k tokens para la fase de GRPO.

El modelo base Qwen3-4B-Instruct-2507 aporta una arquitectura transformer densa de aproximadamente 4.022 millones de parámetros y licencia Apache 2.0 (la licencia del ajuste no está declarada). El repositorio ocupa 8,1 GB y los pesos se distribuyen en BF16. Al no publicarse resultados de benchmarks ni la model card detallar el rendimiento final, debe tratarse como un checkpoint experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda Qwen3-4B-Instruct-2507, modo no-thinking) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible en el repo (pesos publicados en BF16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible (el modelo base Qwen3-4B-Instruct-2507 es Apache 2.0, pero el ajuste no declara licencia) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros en modo no-thinking. Sobre esa base se aplica un proceso de internalización de habilidades en dos fases. La primera es una auto-destilación on-policy con el framework OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad o experiencia en el prompt de sistema (temperatura 0,7), mientras que un profesor congelado (copia del modelo inicial) la lleva inyectada en el system prompt. La pérdida es una KL inversa a nivel de token calculada sobre el top-256 de tokens del estudiante, optimizada con AdamW a learning rate 3e-6 constante, 8 pares por actualización y 1 época.

La segunda fase es Skill-GRPO, un entrenamiento de optimización de política por grupo (GRPO) con el entrenador SDAR: tamaño de grupo 8, learning rate 1e-6, low_var_kl 0.01 y presupuesto de prompt de 16k tokens. Los datos de entrenamiento son 74 pares fuente sin filtrar del dominio retail de tau2-bench, con semilla 1. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y la evaluación de función de llamada con BFCL v3 (bfcl_eval 2025.6.14). No se documentan el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los 74 pares fuente.

## Capacidades

- Generación de texto conversacional multi-turno orientada a tareas de atención al cliente en el dominio retail.
- Uso de herramientas y function calling en el contexto de tau2-bench (resolución de tareas con herramientas del dominio retail).
- Internalización de habilidades: el objetivo declarado es que el modelo reproduzca la habilidad sin necesidad de incluirla en el system prompt, gracias a la destilación on-policy.
- Razonamiento multi-paso dentro de una conversación con herramientas (reserva, cancelación, consulta de pedidos, etc., según el dominio retail de tau2-bench).
- Modo no-thinking heredado del modelo base (no se entrena el modo thinking).
- Capacidades multilingües: no declaradas; no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en internalización de habilidades: usar el checkpoint como referencia reproducible del pipeline OEL + Skill-GRPO sobre tau2-bench retail, comparando el estudiante sin habilidad en el prompt frente al profesor congelado.
- Evaluación de agentes conversacionales en retail: desplegar el modelo como agente de atención al cliente en un entorno tau2-bench para medir la tasa de finalización de tareas con el simulador GPT-4.1-mini.
- Experimentos de destilación on-policy: emplear los pesos como punto de partida para variar el número de pares fuente, la semilla o el presupuesto de prompt y estudiar el efecto en la retención de habilidades.
- Pruebas de function calling en pipelines de agentes: integrar el modelo en un bucle de herramientas para validar la calidad de las llamadas en tareas de retail (consultas de catálogo, gestión de pedidos), usando BFCL v3 como referencia de evaluación.
- Baseline para comparativas de RLHF/GRPO: usar el checkpoint como baseline "source-only" frente a variantes con aumento de tareas (task aug) u otras estrategias de internalización.
- Prototipado de asistentes de comercio electrónico: explorar conversaciones multi-turno con contexto de pedidos y devoluciones, siempre con validación humana y sin asumir robustez en dominios fuera de retail.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodología de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14) pero no incluye cifras de rendimiento del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV (estimación práctica de 10-12 GB para contextos moderados).
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB (estimaciones, no hay cuantizaciones publicadas en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-random74-seed1 | 4.022 M | no disponible | Retail (tau2-bench) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible en esta ficha | General | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros checkpoints tau2-bench del mismo autor | no disponible | no disponible | Retail | no disponible | Hugging Face (variantes de semilla/estrategia) |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría; la comparativa se limita a parámetros, dominio y licencia.

## Limitaciones y advertencias

- Modelo experimental de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- Entrenado exclusivamente sobre 74 pares del dominio retail de tau2-bench; el rendimiento fuera de ese dominio no está caracterizado.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- No se declara licencia para el ajuste; verificar los términos del modelo base (Apache 2.0) antes de cualquier uso comercial.
- Riesgo de alucinación y de sobreajuste a los patrones del benchmark; las respuestas pueden no generalizar a conversaciones reales de retail.
- Sin cifras de benchmarks publicadas: no se puede afirmar mejora sobre el modelo base ni sobre otras variantes.
- El modo thinking no está entrenado; no debe esperarse razonamiento extendido.
- La evaluación depende de un simulador de usuario (GPT-4.1-mini), lo que introduce dependencia de un modelo externo y posibles sesgos del simulador.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-random74-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la informacion proporcionada
- BFCL v3 (bfcl_eval 2025.6.14): no disponible en la informacion proporcionada
- Repositorio OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR (Skill-GRPO): no disponible en la informacion proporcionada
