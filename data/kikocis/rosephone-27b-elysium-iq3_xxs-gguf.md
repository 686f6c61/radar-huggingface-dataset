# KikoCis/Rosephone-27B-Elysium-IQ3_XXS-GGUF

## Resumen

Rosephone-27B-Elysium es una cuantización GGUF de tipo IQ3_XXS, calibrada con matriz de importancia (imatrix) y con una mezcla de tensores ajustada manualmente, del modelo RadixArk/DaisyRose-27B. DaisyRose-27B es, a su vez, un ajuste fino mediante aprendizaje por refuerzo (RL) de Qwen3.8-27B, orientado a tareas de agente de largo horizonte: trabajo en terminal, lectura de código, edición de ficheros y verificación del propio trabajo a lo largo de muchos turnos. El autor de la cuantización es KikoCis, que la publica bajo licencia Apache-2.0 y sin ningún reentrenamiento ni fusión de pesos: es una cuantización no modificada del modelo base.

El interés principal del artefacto es el rango de memoria en el que opera: 11,89 GB en disco, lo que lo sitúa en la franja de 8-12 GB donde se ejecutan la mayoría de modelos locales en equipos de consumo. Frente a la receta estándar de llama.cpp para esta arquitectura, el autor destinó el presupuesto de bits restante a los tensores pequeños y sensibles (proyecciones de atención y compuertas del bloque SSM), manteniendo las matrices FFN en IQ3_XXS. Según sus mediciones, eso rebaja la perplejidad en Wikitext-2 de 6,447 a 6,354 con un coste de 0,53 GB adicionales.

El modelo es solo texto: el DaisyRose-27B original es multimodal e incluye una cabeza MTP (multi-token prediction), pero este GGUF contiene únicamente el modelo de lenguaje, sin proyector de visión ni capa MTP. Emplea el diseño de tensores `qwen35` sin fusionar, lo que permite cargarlo tanto en versiones actuales de llama.cpp como en runtimes anteriores al layout fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y bloques gated-delta-net (SSM), derivada de Qwen3.8-27B; layout de tensores `qwen35` sin fusionar |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 32.768 tokens en el ejemplo de llama.cpp (`-c 32768`); la longitud máxima nativa del modelo base no está disponible en la información proporcionada |
| Tipos de cuantizacion | IQ3_XXS con mezcla manual: `ssm_alpha`/`ssm_beta` en Q8_0, `ssm_out` en Q4_K, `attn_output` en Q5_K, `attn_v` en Q6_K, `attn_k` en Q5_K, `attn_q` en IQ3_XXS, `output` en Q6_K, FFN en IQ3_XXS |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (11,89 GB); se distribuye también el fichero `daisyrose-27b.imatrix` (0,01 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de aproximadamente 26,9 mil millones de parámetros que combina capas de atención completa con bloques de tipo SSM (gated delta net), lo que se refleja en tensores específicos como `ssm_alpha`, `ssm_beta` y `ssm_out`. Sobre esa base, RadixArk/DaisyRose-27B se entrenó exclusivamente mediante aprendizaje por refuerzo sobre tareas de agente de largo horizonte: operar en un shell, leer y editar código y comprobar el resultado del propio trabajo durante muchos turnos. No se dispone en la información proporcionada del número de tokens de entrenamiento, de la composición del dataset ni del detalle del algoritmo de RL empleado.

La aportación técnica de esta ficha concreta es la cuantización. El autor partió de la receta estándar IQ3_XXS de llama.cpp para esta arquitectura (11,36 GB, perplejidad 6,447), en la que las proyecciones Q/K de atención completa caen a IQ2_S y las compuertas del gated delta net a 3 bits, y reasignó el presupuesto sobrante a esos tensores pequeños y sensibles, obteniendo 11,89 GB y perplejidad 6,354. La matriz de importancia se generó con 174 secuencias de 2048 tokens. El proceso de conversión partió de los safetensors BF16 originales, excluyendo la capa MTP y el proyector de visión.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat embebida en el GGUF que incluye soporte de modo razonamiento y de llamadas a herramientas.
- Razonamiento con esfuerzo configurable mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y posibilidad de desactivarlo con `enable_thinking=false`.
- Llamadas a herramientas nativas (tool calling / function calling), requisito del entrenamiento por refuerzo del modelo base.
- Comportamiento agéntico multi-turno: trabajo en terminal, lectura y edición de ficheros, verificación del propio trabajo y corrección iterativa.
- Generación y reparación de código, medida con HumanEval y HumanEval+ (pass@1 de 0,970 y 0,927 respectivamente en modo sin razonamiento).
- Capacidad de resolver incidencias reales de repositorios (probado sobre instancias de SWE-bench Verified con un arnés de agente local).
- Sin capacidades de visión ni audio en este fichero: el proyector multimodal del modelo base no está incluido.

## Casos de uso

- Agente de terminal local: el modelo puede encadenar comandos de shell, inspeccionar la salida, corregir errores y continuar la tarea durante decenas de turnos, gracias al entrenamiento por refuerzo en tareas de largo horizonte del modelo base y a una ventana de 32.768 tokens configurable en llama.cpp.
- Reparación de bugs en un repositorio: con un arnés agéntico que le dé acceso a lectura y escritura de ficheros y a la ejecución de tests, puede localizar el código relevante, aplicar un parche y comprobar que las pruebas pasan; el autor verificó este flujo sobre instancias de SWE-bench Verified.
- Asistente de programación en local sin conexión: al caber en 11,89 GB, se puede desplegar en un portátil con GPU de consumo y usarse como asistente de edición de código en entornos con requisitos de privacidad o sin acceso a red.
- Automatización de tareas de mantenimiento de repositorios: actualización de dependencias, migraciones de API o limpieza de código repetitivo, con el modelo operando sobre el árbol de ficheros y validando cada cambio con la suite de tests del proyecto.
- Integración en pipelines de CI/CD como agente de triaje: ante un fallo de build, el modelo lee los logs, inspecciona los ficheros implicados y propone o aplica un parche, con llamadas a herramientas para consultar el estado del repositorio.
- Prototipado de agentes y evaluación de arneses: al ser una cuantización pequeña y de licencia permisiva, sirve para probar plantillas de chat, esquemas de tool calling y presupuestos de turnos antes de escalar a modelos mayores o a precisión completa.
- Despliegue en estaciones de trabajo con recursos limitados: con licencia Apache-2.0 y formato GGUF, se puede servir con Ollama o llama.cpp en equipos donde un Q4_K_M o el BF16 no caben, aceptando la pérdida de calidad asociada a ~3,5 bits.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este mismo fichero, comparados con la cuantización IQ3_XXS de bartowski del mismo modelo base (11,92 GB de pesos principales, casi idéntica en tamaño). HumanEval y perplejidad se ejecutaron en llama.cpp master `dbaf582af` con `llama-server --jinja` y `enable_thinking=false`, mismas semillas y evaluador evalplus.

| Benchmark | Configuracion | Rosephone IQ3_XXS (11,89 GB) | bartowski IQ3_XXS (12,17 GB) |
|---|---|---|---|
| SWE-bench Verified, sonda de 5 instancias | arnés de agente local, presupuesto de contexto de ~12K caracteres, sin razonamiento, tool calls nativas, temperatura 1.0 | 1/5 resueltas | no ejecutado (no carga en el arnés basado en Ollama) |
| HumanEval pass@1 (base) | sin razonamiento, temperatura 0.6, top_p 0.95, semilla 1234, 2048 tokens nuevos máx. | 0,970 | 0,963 |
| HumanEval+ pass@1 | mismas condiciones | 0,927 | 0,909 |
| Generaciones desbocadas en HumanEval (alcanzan el límite de tokens) | mismas condiciones | 2/164 | 1/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 6,354 ± 0,076 | 6,300 ± 0,076 |

El propio autor califica la comparación como empate técnico: la diferencia de uno a tres problemas en una sola semilla está dentro del ruido, y la perplejidad de bartowski es un 0,85 % inferior, dentro de un error estándar. La sonda de SWE-bench resolvió `django__django-11133` con un parche válido; en `django__django-11099` editó el código correcto pero el watchdog terminó la sesión antes de ejecutar los tests; en otras tres instancias agotó el presupuesto de 80 mensajes sin parche válido, sin cuelgues ni respuestas vacías. No se han publicado en la información disponible resultados de Terminal Bench, DeepSWE, SWE Bench Pro ni GPQA para esta cuantización; la tabla del modelo base a precisión completa no es aplicable a este fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,89 GB de pesos, más overhead de contexto KV. Con 32.768 tokens de contexto la huella total supera los pesos; conviene reservar al menos 14-16 GB de memoria total (VRAM o VRAM más RAM con offload parcial).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con contexto moderado, A100 y H100 para despliegues multiusuario. En GPUs de 12 GB encaja con contexto reducido o con offload parcial a RAM.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con contexto contenido; en 12 GB requiere recortar contexto o descargar capas a CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/KikoCis/Rosephone-27B-Elysium-IQ3_XXS-GGUF`, probado en la versión 0.40.13) y llama.cpp (`llama-server -hf KikoCis/Rosephone-27B-Elysium-IQ3_XXS-GGUF --jinja -c 32768`, probado en master `dbaf582af`). El formato GGUF es compatible con derivados habituales como LM Studio o interfaces basadas en llama.cpp; no se ha verificado vLLM ni TGI en la información disponible.
- Muestreo recomendado por el autor (heredado del modelo base): temperatura 1.0, top_p 0.95, top_k 20, min_p 0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Rosephone-27B-Elysium IQ3_XXS | 26,9 B densos | hasta 32.768 tokens configurados | IQ3_XXS mixta, 11,89 GB | HumanEval 0,970 / HumanEval+ 0,927; perplejidad Wikitext-2 6,354 | Apache-2.0 |
| bartowski DaisyRose-27B IQ3_XXS | 26,9 B densos | no disponible | IQ3_XXS imatrix, 12,17 GB (11,92 GB sin MTP) | HumanEval 0,963 / HumanEval+ 0,909; perplejidad 6,300 | Apache-2.0 (modelo base) |
| RadixArk/DaisyRose-27B (BF16) | 26,9 B densos | no disponible | BF16, multimodal con cabeza MTP | Tabla de benchmarks del modelo base (Terminal Bench, DeepSWE, SWE Bench Pro, GPQA) no disponible en esta información | Apache-2.0 |
| Qwen3.8-27B (modelo original) | 26,9 B densos | no disponible | safetensors BF16 | no disponible | no disponible |

La comparación relevante es entre las dos cuantizaciones IQ3_XXS, que rinden de forma estadísticamente equivalente al mismo tamaño. El BF16 es superior en calidad pero requiere del orden de 54 GB solo en pesos, fuera del alcance de GPUs de consumo. Un Q4_K_M o superior del mismo modelo base sería más potente que este fichero si la memoria lo permite, tal como advierte el propio autor.

## Limitaciones y advertencias

- IQ3_XXS es una cuantización de aproximadamente 3,5 bits de un modelo denso de 27B: es una versión para portátil, no equivalente al modelo en BF16. Con memoria suficiente, Q4_K_M o superior es claramente mejor.
- Solo texto: no incluye proyector de visión ni cabeza MTP, por lo que pierde las capacidades multimodales y de decodificación especulativa del modelo base.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- La evaluación agéntica se hizo en modo sin razonamiento y con un presupuesto de contexto de ~12K caracteres; el modelo base se evalúa en modo razonamiento con `xhigh`, que no se ha medido en esta cuantización. Los resultados en tareas de agente podrían diferir con la configuración completa.
- La sonda de SWE-bench consta de solo cinco instancias: es una prueba de humo de competencia agéntica, no una puntuación de leaderboard. No debe citarse como resultado de SWE-bench Verified.
- Riesgo de alucinación y de ediciones incorrectas en código: en la propia sonda, una instancia editó el código correcto pero no llegó a validarlo, y tres agotaron el presupuesto de turnos sin parche válido. En producción conviene exigir validación con tests y revisión humana.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia Apache-2.0, permisiva para uso comercial, pero se hereda del modelo base; conviene verificar las condiciones de Qwen3.8-27B y de RadixArk/DaisyRose-27B antes de un despliegue comercial.
- Compatibilidad de runtime: el layout `qwen35` sin fusionar está pensado para cargar en versiones antiguas de llama.cpp; el autor documenta que Ollama 0.40.13 rechaza la cuantización de referencia con layout fusionado (`tensor 'blk.0.ssm_beta.weight' not found`), por lo que la elección de runtime importa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de las mediciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KikoCis/Rosephone-27B-Elysium-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Cuantización de referencia para comparación (bartowski): no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Artículo o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
