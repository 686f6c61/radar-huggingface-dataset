# caspar/MiniMind-Dense-64M-Hermes-FunctionCalling-SFT-v1.0

## Resumen

MiniMind-Dense-64M-Hermes-FunctionCalling-SFT-v1.0 es un ajuste fino supervisado (SFT) del modelo MiniMind Dense de 64M de parámetros, publicado por el usuario caspar en Hugging Face. El modelo parte de `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0` y se especializa en una única tarea: el *function calling* o llamada a herramientas, entrenado exclusivamente con el subconjunto `func-calling.json` del dataset `NousResearch/hermes-function-calling-v1`. Con 63.912.192 parámetros reales en safetensors y un repositorio de 0,1 GB, es un artefacto pensado para experimentación y para reproducir pipelines de entrenamiento a pequeña escala, no para producción.

La relevancia del modelo es metodológica más que de rendimiento: documenta de forma granular el proceso completo (conversión de datos, enmascarado de etiquetas, exclusión de filas inválidas, selección de checkpoint por entropía cruzada de validación) y añade una segunda etapa de aprendizaje por refuerzo con agentes (CISPO) sobre herramientas simuladas. Todo el entrenamiento se ejecutó en una única RTX 5090, lo que lo convierte en un ejemplo reproducible de cómo llevar un LLM de 64M desde el preentrenamiento hasta un comportamiento de agente básico.

Se trata de un modelo marcado explícitamente como `experimental`, solo en inglés, con cero descargas y sin resultados de benchmarks públicos más allá de las métricas de validación internas. Su interés reside en el pipeline y en la trazabilidad de las decisiones de entrenamiento, no en la calidad final de sus respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MiniMind Dense (transformer decoder-only; número de capas y cabezas no disponible) |
| Parámetros totales | 63.912.192 (≈64M, dato real de safetensors) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima empleada en el entrenamiento SFT); no se documenta una ventana nativa distinta |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible en los metadatos; la model card remite a los términos de las fuentes (aviso Apache-2.0 de Hermes, términos del código/base MiniMind y avisos Apache-2.0 y CC-BY-NC-2.0 del dataset de Agent RL) |
| Formato de pesos | safetensors (carga con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es la MiniMind Dense de 64M, un transformer decoder-only de pequeño tamaño. No se detallan en la información disponible el número de capas, dimensiones ocultas ni mecanismos de atención; el proyecto MiniMind se describe públicamente como una implementación educativa y compacta de un LLM entrenado desde cero, con una variante MoE separada de 198M de parámetros totales y 64M activos que no corresponde a este checkpoint. El modelo usa una plantilla de chat propia (la de MiniMind) y requiere `trust_remote_code=True` para cargar el código personalizado.

El SFT se hizo con actualización de todos los parámetros, cómputo en BF16 con pesos de entrenamiento en FP32, batch 1 con acumulación 8, LR 2e-5 con decaimiento coseno hasta 2e-6, 3 épocas (672 actualizaciones), longitud máxima 4096, semilla 42 y recorte de gradiente 1.0. Los datos provienen únicamente de `func-calling.json` (revisión `dae3e1d28cfbcf4b915c04ea1e072030529b4bda`, 1893 filas de origen): se excluyeron 793 filas inválidas, se omitieron 38 objetivos de asistente demasiado largos sin truncar sus finales y no se añadieron datos sintéticos. Tras la conversión, se re-renderizan las herramientas una vez con la plantilla de chat de MiniMind; las llamadas del asistente y las respuestas posteriores a la herramienta se supervisan, mientras que las etiquetas de sistema, usuario, herramienta y padding se enmascaran. La partición train/validación se hace por hash determinista del texto del usuario. El resultado: 986 conversaciones de entrenamiento, 114 de validación y 1786 objetivos de asistente retenidos, con una entropía cruzada de validación que baja de 2,5424 a 0,6658 y checkpoint elegido por ese criterio.

Sobre ese checkpoint se aplicó una etapa de RL con agentes (CISPO) documentada como artefacto aparte: batch 4, cuatro generaciones por prompt, microbatch de respuesta 1, LR 3e-7 con decaimiento coseno a 3e-8, beta 0,1, máximo 3 turnos de 256 tokens por turno con 2500 tokens de entrenamiento retenidos y sincronización de política cada 10 pasos. El servicio de rollout usó SGLang 0.5.5 sirviendo una exportación compatible con Qwen3 (los pesos publicados son MiniMind nativo). El modelo de recompensa para diálogo general fue `Skywork/Skywork-Reward-V2-Qwen3-1.7B` (revisión `e51ea3e08fb81326c3b812a7ff0cb9cee83e59cc`), con puntuaciones divididas por 10 y recortadas; las tareas con herramientas usan coincidencia de ejecución/respuesta, penalizan trayectorias sin terminar con -2 y penalizan llamadas idénticas repetidas con éxito.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (roles usuario/asistente/sistema/herramienta).
- Function calling / tool calling: emite llamadas estructuradas según un esquema de herramientas proporcionado en el prompt, incluyendo respuestas posteriores a la ejecución de la herramienta.
- Razonamiento multi-turno con herramientas dentro de una misma trayectoria (hasta 3 turnos de 256 tokens en el entrenamiento de RL).
- Modo *thinking* controlable en la plantilla (`open_thinking=False` en el ejemplo de uso).
- Aprendizaje por refuerzo orientado a agentes con un modelo de recompensa externo, orientado a completar tareas con herramientas simuladas.
- Capacidades multilingües: solo inglés.
- Sin visión, audio ni otras modalidades.

## Casos de uso

- **Laboratorio de formación en function calling**: reproduce el pipeline completo (conversión de Hermes, enmascarado de etiquetas, SFT a parámetros completos, RL con CISPO) para entender cómo se comporta un modelo de 64M al que se le enseña a llamar herramientas, sin necesidad de infraestructura de datacenter.
- **Prototipado rápido de esquemas de herramientas**: sirve para validar iteraciones sobre el JSON Schema de herramientas y sobre la plantilla de chat antes de trasladar el diseño a un modelo mayor, ya que la inferencia cuesta milisegundos y cabe en cualquier GPU.
- **Pruebas de integración de agentes en CI**: al pesar ~128 MB en BF16, se puede empaquetar en una imagen de test para comprobar de extremo a extremo el bucle externo de ejecución de herramientas (parseo de la llamada, ejecución, reinyección del rol `tool`) sin depender de APIs de terceros.
- **Evaluación de pipelines de datos de tool calling**: útil como caso de control para medir cómo afectan decisiones como el hash determinista del split, el enmascarado de etiquetas o la omisión de objetivos largos al comportamiento final del modelo.
- **Investigación sobre recompensas y RL a pequeña escala**: permite experimentar con configuraciones de CISPO, betas y presupuestos de turnos en un modelo cuyo entrenamiento completo cabe en una sola GPU consumer.
- **Docencia y demostraciones offline**: despliegue en CPU o en una GPU de gama baja para mostrar en clase cómo un LLM diminuto genera llamadas a funciones, con la advertencia explícita de que la fiabilidad no está garantizada.
- **Banco de pruebas de decodificación y plantillas**: al ser determinista con `do_sample=False`, sirve para comparar plantillas de chat y formatos de herramientas frente a un baseline fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible. Las únicas métricas reportadas son de entrenamiento y validación internas:

| Métrica | Valor |
|---|---|
| Entropía cruzada de validación (inicio → final) | 2,5424 → 0,6658 |
| Épocas / actualizaciones SFT | 3 / 672 |
| Conversaciones de entrenamiento | 986 |
| Conversaciones de validación | 114 |
| Objetivos de asistente retenidos | 1786 |
| Filas inválidas excluidas | 793 |
| Objetivos de asistente omitidos por longitud | 38 |
| Muestra de agente evaluada | 13 casos (no es un benchmark general) |

El propio autor advierte que los ejemplos de generación de validación son para inspección y no un benchmark held-out, y que las plantillas de funciones pueden solaparse entre splits. La muestra de agente de 13 casos es demasiado pequeña para extraer conclusiones de rendimiento.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 63,9M de parámetros): ~256 MB en FP32, ~128 MB en BF16/FP16, ~64 MB en int8 y ~32 MB en int4, más el overhead de activaciones y del código personalizado.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM; el autor entrenó ambas etapas en una RTX 5090, pero la inferencia no requiere nada parecido. Funciona en GTX 1650, RTX 3060, T4, L4, A100 u H100 sin aprovechar su capacidad.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU consumer e integrada, y también en CPU.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (vía oficial documentada); vLLM aparece referenciado para el modelo base en la documentación de Hugging Face; llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye.
- **Latencia y throughput**: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind-Dense-64M-Hermes-FunctionCalling-SFT-v1.0 | 63,9M | 4096 (entrenamiento) | Function calling (SFT + RL de agentes) | no disponible | safetensors, 0 descargas |
| caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0 (base) | ~64M | no disponible | SFT mixto, propósito general | no disponible | safetensors |
| MiniMind MoE (variante del proyecto) | ~198M totales / 64M activos | no disponible | Propósito general, educativo | no disponible | según el proyecto MiniMind |
| Modelos de la clase 0,5B tipo Qwen2.5-0.5B o SmolLM2 | ~135M–500M | 8k–32k según modelo | Propósito general con soporte de herramientas | mayoritariamente permisivas | amplia |

La comparación con modelos de la clase 0,5B es solo orientativa: no se dispone en la información proporcionada de resultados de benchmarks que permitan situar este checkpoint frente a ellos. La diferencia práctica más relevante no es el rendimiento sino el propósito: aquí se prioriza la reproducibilidad del pipeline de entrenamiento sobre la calidad de uso general.

## Limitaciones y advertencias

- **Capacidad general muy limitada**: 64M de parámetros entrenados sobre ~1000 conversaciones de una única tarea; el autor declara explícitamente que no se garantizan capacidades generales, exactitud factual ni uso fiable de herramientas.
- **Riesgo alto de alucinación**: el modelo puede emitir nombres de herramientas no soportados, llamadas repetidas o respuestas posteriores a la herramienta incoherentes.
- **Idioma**: solo inglés; no hay soporte documentado de castellano ni de otros idiomas.
- **Contexto corto**: la ventana empleada en entrenamiento es de 4096 tokens y no se documenta una longitud nativa superior; las conversaciones largas con muchas herramientas pueden degradar el comportamiento.
- **Herramientas simuladas**: durante el RL se usaron herramientas mock que no acceden a datos reales de clima, hora ni tipos de cambio; el modelo no está validado contra APIs reales.
- **Licencia ambigua**: los metadatos no declaran licencia. La model card indica que Hermes se distribuye con aviso Apache-2.0 y que siguen aplicando los términos del código y base MiniMind; el dataset traducido de Agent RL conserva avisos Apache-2.0 y CC-BY-NC-2.0, lo que puede implicar restricciones de uso comercial. Es imprescindible revisar las licencias de origen antes de cualquier uso en producción.
- **Evaluación insuficiente**: la muestra de agente es de 13 casos y los ejemplos de validación pueden solaparse con el entrenamiento por plantillas de funciones compartidas; no hay benchmark held-out.
- **Estado experimental y nula adopción**: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento comunitario conocido.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de cargarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-Dense-64M-Hermes-FunctionCalling-SFT-v1.0
- Modelo base: https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Repositorio Hermes-Function-Calling (NousResearch): https://github.com/NousResearch/Hermes-Function-Calling
- Guía de MiniMind (inferencia, preentrenamiento y SFT): https://www.findgoodai.com/minimind-inference-pretraining-sft-guide/
- Descripción del proyecto MiniMind (entrenamiento de 64M en ~2 horas): https://tokrepo.com/en/workflows/minimind-train-64m-parameter-llm-scratch-2-hours-e48c6746
- Ficha de MiniMind en OpenTools: https://opentools.ai/llms/minimind
- Modelo de recompensa usado en la etapa de RL: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
