# MANGSEOK123/qwen3-4b-bfcl-oel-sourceonly-n125-seed2

## Resumen

qwen3-4b-bfcl-oel-sourceonly-n125-seed2 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 en Hugging Face. El modelo parte de la variante Instruct de la familia Qwen3, en modo no-thinking, y se entrena específicamente sobre el conjunto de evaluación BFCL-v3 multi-turno (bfcl_eval 2025.6.14), orientado a la internalización de habilidades de uso de herramientas y llamadas a funciones en conversaciones de varios turnos. El objetivo declarado es que el modelo aprenda a desempeñar tareas de tool calling sin necesidad de instrucciones explícitas en el system prompt.

La técnica empleada es una destilación auto-dirigida on-policy sobre la base de código OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad ni la experiencia en el contexto (temperatura 0,7) y un profesor, copia congelada del modelo inicial con la habilidad inyectada en el system prompt, le transfiere conocimiento mediante una KL inversa a nivel de token sobre los 256 tokens más probables. Se complementa con Skill-GRPO usando el entrenador SDAR. El modelo tiene 4.022.468.096 parámetros, pesos en BF16 y un repositorio de 8,1 GB.

Su relevancia es acotada pero concreta: es un artefacto de investigación reproducible (semilla 2, 125 pares de origen sin filtrar, baseline source-only) que documenta una receta concreta para internalizar habilidades de agente en modelos pequeños de 4B. No es un modelo de propósito general ni cuenta con una model card extensa, licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4.000 millones de parámetros, heredado de Qwen3-4B-Instruct-2507 en su modo no-thinking. No se trata de una arquitectura MoE ni híbrida: toda la capacidad de parámetros está activa en cada paso de inferencia. El autor no detalla cambios estructurales respecto al modelo base, por lo que se asume que la arquitectura subyacente es la de Qwen3-4B-Instruct-2507 sin modificaciones.

El entrenamiento combina dos fases. La primera es una destilación auto-dirigida on-policy con el framework OEL (LMOps): el estudiante ejecuta cada tarea sin la habilidad en el contexto con temperatura 0,7, mientras un profesor congelado (copia del modelo inicial con la habilidad en el system prompt) supervisa mediante una KL inversa a nivel de token restringida a los 256 tokens con mayor probabilidad del estudiante. La segunda fase es Skill-GRPO, un refuerzo con el entrenador SDAR (tamaño de grupo 8, learning rate 1e-6, low_var_kl 0,01, presupuesto de prompt de 16k). Los hiperparámetros de la destilación incluyen AdamW con learning rate constante de 3e-6, 8 pares por actualización y 1 época. El conjunto de entrenamiento son 125 pares de origen sin filtrar de BFCL-v3 multi-turno, con semilla 2. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y con BFCL v3 (bfcl_eval 2025.6.14).

## Capacidades

- Generación de texto conversacional en modo no-thinking, heredada de Qwen3-4B-Instruct-2507.
- Tool calling y function calling en escenarios multi-turno, eje central del ajuste fino sobre BFCL-v3.
- Internalización de habilidades: el modelo está entrenado para ejecutar tareas de agente sin que la descripción de la habilidad aparezca en el system prompt.
- Razonamiento multi-paso orientado a agentes, con soporte para interacciones encadenadas de varios turnos.
- Capacidades multilingües: no disponibles en la información proporcionada (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo thinking: no disponible en este ajuste; el entrenamiento se realiza explícitamente en modo non-thinking.

## Casos de uso

- Agentes de tool calling en producción: el modelo puede gestionar conversaciones multi-turno donde debe invocar funciones sin que el prompt del sistema repita las instrucciones de uso, lo que reduce la longitud del contexto y el coste por petición.
- Automatización de atención al cliente con APIs: adecuado para flujos donde el agente debe consultar sistemas internos (pedidos, stock, facturación) mediante llamadas a funciones encadenadas a lo largo de varios turnos.
- Orquestación de pipelines de datos: el modelo puede seleccionar y encadenar herramientas de transformación o consulta en un flujo conversacional, aprovechando la internalización de habilidades para no depender de descripciones largas en cada prompt.
- Investigación en internalización de habilidades: sirve como artefacto reproducible (semilla 2, 125 pares, baseline source-only) para comparar recetas de destilación on-policy y GRPO en modelos de 4B.
- Evaluación comparativa de agentes: útil como punto de referencia en experimentos con BFCL-v3 y tau2-bench para medir cuánto de la habilidad de tool calling se conserva sin instrucciones explícitas.
- Prototipado en entornos con recursos limitados: al ser un modelo de 4B en BF16, puede desplegarse en una única GPU consumer de gama alta para pruebas de agentes antes de escalar a modelos mayores.
- Generación de asistentes de dominio con API propia: integrable en backends que expongan funciones mediante esquemas JSON, siempre que se valide la salida del modelo antes de ejecutar acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los conjuntos de evaluación empleados (BFCL v3 con bfcl_eval 2025.6.14 y tau2-bench v1.0.1 con simulador GPT-4.1-mini) y los hiperparámetros de entrenamiento, pero no incluye cifras de rendimiento ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos, con margen adicional para el contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, apta para GPUs consumer de gama media.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo y pruebas en BF16.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización de 4 bits, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-sourceonly-n125-seed2 | 4,02B | no disponible | Ajuste fino sobre BFCL-v3 para internalizar tool calling | no disponible | Hugging Face (repo propio) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en la informacion | Modelo base instructivo de propósito general | no disponible en la informacion | Hugging Face |
| Otros ajustes BFCL de la misma familia | no disponible | no disponible | Variantes de la receta OEL/Skill-GRPO con distintas semillas y configuraciones | no disponible | Hugging Face (repos del mismo autor) |

La comparación cuantitativa con alternativas no es posible: no se han publicado cifras de benchmarks para este ajuste ni se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinación: presente como en cualquier modelo de 4B; en tool calling puede generar nombres de funciones o argumentos inválidos, por lo que requiere validación de esquema antes de ejecutar acciones.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran en la model card; deben verificarse contra el modelo base antes de usarlo en producción.
- Restricciones de licencia: la licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido. Es un bloqueante para adopción empresarial hasta que el autor la especifique.
- Artefacto de investigación: el nombre indica una configuración concreta (source-only, 125 pares sin filtrar, semilla 2) y el entrenamiento se limita a 1 época; no hay garantía de robustez fuera de la distribución de BFCL-v3.
- Especialización estrecha: el ajuste se centra en tool calling multi-turno en modo no-thinking; el rendimiento en otras tareas (código general, matemáticas, razonamiento abierto) puede degradarse respecto al modelo base.
- Sin métricas publicadas: no hay benchmarks que respalden las afirmaciones de mejora, lo que dificulta justificar su uso frente al modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-sourceonly-n125-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Base de código OEL (LMOps): no disponible en la información proporcionada
- Entrenador SDAR: no disponible en la información proporcionada
- BFCL (Berkeley Function Calling Leaderboard) y bfcl_eval 2025.6.14: no disponible en la información proporcionada
- tau2-bench v1.0.1: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
