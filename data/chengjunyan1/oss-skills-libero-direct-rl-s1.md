# chengjunyan1/oss-skills-libero-direct-rl-s1

## Resumen

`chengjunyan1/oss-skills-libero-direct-rl-s1` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. El modelo está especializado en manipulación robótica de sobremesa dentro del entorno LIBERO: la política genera programas Python que se ejecutan contra una API de robot, en lugar de emitir acciones de bajo nivel directamente.

Se trata del checkpoint final (paso 160 de 300) de la fila "direct RL" del bloque de modelos abiertos del artículo, es decir, la línea base de RL del estudio. El entrenamiento parte de un checkpoint SFT (tres épocas sobre 420 episodios exitosos de LIBERO-90) y aplica GRPO con biblioteca de habilidades fija, sin crecimiento de la misma durante los 300 pasos. Con 9.409.813.744 parámetros y licencia Apache 2.0, es relevante como referencia reproducible para investigación en agentes que escriben código como política y para comparar contra variantes con bibliotecas de habilidades autoexpandibles.

La arquitectura y el tokenizador son los de Qwen3.5-9B, incluyendo su torre de visión, aunque la política se emplea en modo solo texto. El modelo se publica únicamente como pesos en bf16 (un `model.safetensors`), sin estado del optimizador ni otros pasos intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (hereda la de Qwen/Qwen3.5-9B, con torre de visión; uso solo texto en esta política) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el servicio vLLM indicado por el autor); máximo nativo de Qwen3.5-9B no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, un único `model.safetensors` de 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full-parameter) del Qwen3.5-9B mediante GRPO, implementado con verl sobre FSDP en bf16 y rollouts generados con vLLM. El entrenamiento se ejecutó en un nodo con ocho GPU H100, partiendo del checkpoint de calentamiento SFT (tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas). La fase de RL emplea 37 tareas de entrenamiento de LIBERO-90 no reservadas para evaluación, con 8 prompts y 8 rollouts por paso, ventajas de resultado normalizadas por grupo, una actualización por paso y un total de 300 pasos.

Los hiperparámetros documentados incluyen una KL de baja varianza de 1e-2 respecto a la política SFT, tasa de aprendizaje de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts con temperatura 1 y modo de pensamiento desactivado, y guardado cada 20 pasos. La innovación metodológica del trabajo es el uso de una biblioteca de habilidades fija (`library/`, versión seed_v1) renderizada en cada prompt: el modelo aprende a componer programas Python sobre una API de robot reutilizando habilidades documentadas en Markdown (grasp, localize, manipulation, transport), en lugar de descubrirlas o ampliarlas durante el RL.

## Capacidades

- Generación de código como política: produce programas Python ejecutables contra la API de robot de LIBERO para tareas de manipulación de sobremesa.
- Composición de habilidades: utiliza la biblioteca fija renderizada en el prompt (`README.md`, `grasp.md`, `localize.md`, `manipulation.md`, `transport.md`) para construir políticas de varios pasos.
- Razonamiento multi-paso orientado a objetivos: planifica secuencias de acciones dentro de un episodio con un presupuesto de 6.144 tokens por episodio y 2.048 por turno.
- Capacidad multimodal heredada de Qwen3.5-9B (torre de visión incluida en los pesos), aunque la política se sirve y evalúa en modo solo texto.
- Modo de pensamiento desactivable mediante `chat_template_kwargs={"enable_thinking": false}`, que es la configuración usada en la evaluación del artículo.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: sirve como línea base "direct RL" reproducible (semilla 1) para comparar contra variantes con bibliotecas de habilidades que crecen, usando los mismos prompts, biblioteca y protocolo de evaluación.
- Manipulación robótica en simulación LIBERO: genera programas Python que resuelven tareas de sobremesa (transporte, agarre, localización) sobre estados de LIBERO-90 y LIBERO-10, adecuado por su entrenamiento específico en ese dominio.
- Evaluación de políticas code-as-policies: al emitir código en lugar de acciones, permite inspeccionar y depurar la política generada, integrándola en arneses de agente que renderizan la biblioteca en el prompt.
- Reproducción de resultados del artículo: el checkpoint y la biblioteca `library/` permiten replicar las métricas TEST publicadas (E1 47,89; E2 11,58) con decodificación a temperatura 0 y 2.048 tokens por turno.
- Estudio de generalización fuera de distribución: los conjuntos E2 (intercambio de tareas en LIBERO-10) permiten analizar el bajo rendimiento del modelo cuando la tarea difiere del entrenamiento.
- Punto de partida para nuevos ajustes: al ser pesos completos en bf16 con licencia Apache 2.0, puede servir como inicialización para RL posterior con bibliotecas de habilidades expandibles u otros entornos (el autor menciona Mineflayer JavaScript para Minecraft dentro del arnés del artículo).

## Benchmarks y rendimiento

Resultados TEST publicados en la model card (protocolo del apéndice del artículo, biblioteca seed_v1):

| Benchmark | Conjunto | Resultado |
|---|---|---|
| E1 | LIBERO-90 (estados reservados) | 47,89 |
| E2 | LIBERO-10 (intercambio + tarea) | 11,58 |
| DEV (regla de selección de checkpoint) | DEV con seed_v1 | 54,37 % [44,66; 63,75] |
| Media de dos semillas (q.drl.e1 / q.drl.e2) | E1 / E2 | 48,72 / 12,74 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos (32.768 tokens).
- GPU recomendadas: H100 (usadas en el entrenamiento), A100 80 GB; una RTX 4090 de 24 GB puede alojar los pesos en bf16 pero con margen ajustado para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) para secuencias moderadas; no se documentan cuantizaciones que reduzcan el requisito.
- Despliegue: vLLM (el autor indica `vllm serve ... --language-model-only --max-model-len 32768`), o transformers con `AutoModelForImageTextToText` y `dtype="bfloat16"`. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-libero-direct-rl-s1 | 9,41 B | 32.768 (config. de servicio) | RL sobre LIBERO, code-as-policies | Apache 2.0 | Pesos bf16 en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | Modelo multimodal generalista | no disponible en la información | Hugging Face |
| Otras semillas/variantes del mismo artículo | no disponible | no disponible | Misma tarea, distinta semilla o biblioteca | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Rendimiento bajo en generalización fuera de distribución: el conjunto E2 (intercambio de tareas en LIBERO-10) cae a 11,58, muy por debajo del 47,89 en LIBERO-90, lo que indica escasa transferencia a tareas no vistas.
- Biblioteca de habilidades fija: el modelo fue entrenado y evaluado con seed_v1 y no aprende a ampliar la biblioteca; su comportamiento depende de que el prompt incluya exactamente esa biblioteca.
- Dominio muy restringido: la política está especializada en manipulación de sobremesa en LIBERO y en el arnés de agente del artículo; no es un modelo de propósito general.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; al generar código ejecutable, los errores se manifiestan como programas inválidos o llamadas incorrectas a la API.
- Idiomas soportados: no documentados; la evaluación se realiza en inglés dentro del arnés.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones propias que conviene verificar antes de producción.
- Solo se publica un checkpoint (paso 160) sin estado del optimizador, lo que limita reanudar el entrenamiento exactamente desde ese punto.
- Sin cuantizaciones publicadas: el despliegue en hardware limitado exige conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-direct-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Artículo *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación según la model card, no disponible
- Repositorio de código de entrenamiento (cap-x, commit d8a2391): no disponible como enlace público en la información proporcionada
