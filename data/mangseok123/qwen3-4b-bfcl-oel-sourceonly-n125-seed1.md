# MANGSEOK123/qwen3-4b-bfcl-oel-sourceonly-n125-seed1

## Resumen

qwen3-4b-bfcl-oel-sourceonly-n125-seed1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123 y publicado en Hugging Face. El modelo parte de la arquitectura Qwen3 de 4.022.468.096 parámetros (aproximadamente 4.000 millones) en modo no-thinking y se entrena específicamente para la internalización de habilidades (skill internalization) en tareas de tool calling multi-turno, usando como referencia el benchmark BFCL-v3 (bfcl_eval 2025.6.14).

La relevancia del modelo radica en su metodología de entrenamiento: emplea auto-destilación on-policy con el framework OEL (LMOps), donde el estudiante resuelve cada tarea sin la habilidad o experiencia en el prompt y un profesor congelado (copia del modelo inicial) la incorpora en el system prompt. La destilación se realiza con divergencia KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, complementada con entrenamiento GRPO mediante el entrenador SDAR. El resultado es un modelo de 4B orientado a la invocación de funciones y el razonamiento multi-paso en entornos de agentes.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, con pesos en BF16 y un tamaño de repositorio de 8,1 GB. No se dispone de información sobre licencia ni sobre idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 8,1 GB |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros totales y pesos en BF16. El ajuste se realiza sobre el modo no-thinking del modelo base, es decir, sin el modo de razonamiento extendido que Qwen3 incorpora en algunos de sus checkpoints.

El entrenamiento combina dos fases. La primera es una auto-destilación on-policy con el framework OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad o experiencia en el prompt con temperatura T=0.7, mientras que un profesor congelado (copia del modelo inicial) la incorpora en el system prompt. La pérdida es una divergencia KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a learning rate 3e-6 constante, 8 pares por actualización y 1 época. La segunda fase es Skill-GRPO, un entrenamiento GRPO con el entrenador SDAR (group size 8, learning rate 1e-6, low_var_kl 0.01, presupuesto de prompt de 16k tokens). Los datos de entrenamiento provienen de BFCL-v3 multi-turn (bfcl_eval 2025.6.14), con 125 pares fuente sin filtrar (source-only baseline), semilla de entrenamiento 1. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini.

## Capacidades

- Generación de texto conversacional multi-turno en modo no-thinking.
- Invocación de funciones (tool calling / function calling) en escenarios BFCL-v3 multi-turno.
- Internalización de habilidades y experiencias en el prompt mediante destilación, orientada a mejorar el desempeño sin necesidad de incluir la habilidad explícitamente en el system prompt.
- Razonamiento multi-paso en entornos de agentes, entrenado con GRPO sobre tareas de tool calling.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Capacidades multilingües: no disponible (los idiomas no se especifican en la model card).
- Modo thinking: no disponible en este ajuste (entrenado explícitamente en modo no-thinking del modelo base).

## Casos de uso

- Evaluación de metodologías de internalización de habilidades: el modelo sirve como artefacto de referencia para reproducir experimentos de auto-destilización on-policy con OEL y comparar con baselines source-only en BFCL-v3. Su configuración concreta (125 pares, semilla 1) permite replicar el setup experimental.
- Investigación en tool calling multi-turno: adecuado para estudiar cómo un modelo de 4B internaliza habilidades de invocación de funciones sin incluirlas en el system prompt, útil en líneas de investigación sobre agentes autónomos.
- Agentes conversacionales con function calling: puede integrarse en pipelines de agentes que requieran llamadas a APIs en conversaciones multi-turno, aprovechando el entrenamiento específico en BFCL-v3.
- Prototipado de asistentes con herramientas: al ser un modelo de 4B en BF16, cabe en GPUs de gama alta para desarrollo y pruebas de integración con frameworks de agentes.
- Experimentos de RLHF/GRPO: el checkpoint permite analizar el efecto de Skill-GRPO con SDAR sobre el comportamiento de invocación de funciones, comparándolo con la fase de destilación.
- Base para ajustes posteriores: al derivar de Qwen3-4B-Instruct-2507, puede servir como punto de partida para fine-tunes específicos de dominio que requieran tool calling, aunque su licencia no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de BFCL-v3 (bfcl_eval 2025.6.14) y tau2-bench v1.0.1 con simulador GPT-4.1-mini como marcos de entrenamiento y evaluación, pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 10-12 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 4-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB. Los tipos de cuantización no están documentados en la model card, pero al ser un modelo transformers con safetensors es compatible con herramientas estándar de cuantización.
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers, text-generation-inference (según tags), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no documentado oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-sourceonly-n125-seed1 | 4.022 M | no disponible | Tool calling multi-turno (BFCL-v3), destilación OEL + GRPO | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | no disponible en esta ficha | Instrucción general, tool calling | Apache 2.0 (modelo base Qwen3) | Hugging Face, ampliamente adoptado |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en esta ficha | Razonamiento con modo thinking y no-thinking | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a la variante Qwen3-4B original, ya que no se dispone de datos de benchmarks ni de otros fine-tunes comparables en la información proporcionada. El ajuste se distingue por su especialización en BFCL-v3 multi-turno y su metodología de internalización, pero carece de cifras públicas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo, lo que impide confirmar si el uso comercial está permitido. El modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0, pero el ajuste no hereda automáticamente esa licencia sin declaración explícita.
- Idiomas no documentados: la model card no indica qué idiomas soporta el ajuste; el comportamiento multilingüe puede diferir del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3, puede heredar los sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos de 4B tienen mayor propensión a errores factuales que modelos de mayor tamaño.
- Especialización estrecha: el entrenamiento se centra en BFCL-v3 multi-turno con 125 pares fuente; el rendimiento en tareas fuera de ese dominio puede degradarse respecto al modelo base.
- Sin datos de benchmarks: no hay cifras públicas que permitan validar la mejora frente al modelo base, lo que limita su uso en producción sin evaluación propia.
- Artefacto de investigación: 0 descargas y 0 likes; sin mantenimiento ni soporte documentado.
- Contexto no documentado: se desconoce la longitud de contexto efectiva del ajuste, aunque el presupuesto de prompt en GRPO fue de 16k tokens.
- Modo no-thinking únicamente: no incorpora el modo de razonamiento extendido de Qwen3, por lo que no es adecuado para tareas que requieran cadenas de pensamiento largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-sourceonly-n125-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework OEL (LMOps): no disponible en la información proporcionada
- Entrenador SDAR: no disponible en la información proporcionada
- BFCL-v3 (bfcl_eval 2025.6.14): no disponible en la información proporcionada
- tau2-bench v1.0.1: no disponible en la información proporcionada
