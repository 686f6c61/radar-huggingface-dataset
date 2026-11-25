# KikoCis/Pithos-27B-Pandora-IQ3_XXS-GGUF

## Resumen

Pithos-27B-Pandora-IQ3_XXS-GGUF es una cuantización GGUF de un modelo de lenguaje de 27 000 millones de parámetros orientado a tareas de agente de código. Parte de Qwen3.8-27B (modelo denso multimodal de Qwen) sobre el que el equipo de harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo para que funcione como el motor del agente de programación pi: localizar código, editarlo, ejecutar tests y detenerse. KikoCis publica aquí ese adaptador fusionado en el modelo base y cuantizado a IQ3_XXS calibrado con importance matrix, con un reajuste manual del mix de tensores.

La relevancia del artefacto es práctica: comprime un modelo denso de 27B en un fichero de 11,89 GB, dentro de la banda de 8-12 GB de VRAM donde se ejecutan la mayoría de modelos locales en GPUs de consumo. El autor reporta que el adaptador conserva la mayor parte de la ganancia de un modo de razonamiento de máximo esfuerzo con el "thinking" desactivado y en menos turnos, lo que reduce latencia y coste por tarea en bucles agénticos.

El fichero es solo texto: elimina el proyector de visión y la cabeza MTP del modelo base. Incluye una importance matrix de 174 × 2048 tokens. La arquitectura subyacente combina atención completa con capas de tipo SSM (gated delta net), según los nombres de tensores citados en la model card (`ssm_alpha`, `ssm_beta`, `ssm_out`, `attn_q/k/v/output`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y capas SSM (gated delta net), según los tensores del fichero; modelo base Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la información disponible; el ejemplo de llama.cpp usa `-c 32768` |
| Tipos de cuantizacion | IQ3_XXS con mix de tensores ajustado: `ssm_alpha`/`ssm_beta` Q8_0, `ssm_out` Q4_K, `attn_output` Q5_K, `attn_v` Q6_K, `attn_k` Q5_K, `attn_q` IQ3_XXS, `output` Q6_K, FFN en IQ3_XXS |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (11,89 GB) + fichero `.imatrix` (0,01 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 26,9B parámetros que, según los nombres de tensores presentes en la cuantización, intercala bloques de atención completa con bloques de tipo SSM (gated delta net: `ssm_alpha`, `ssm_beta`, `ssm_out`). El modelo original es multimodal y dispone de cabeza MTP (multi-token prediction) para decodificación especulativa; esta cuantización conserva únicamente el modelo de lenguaje, sin proyector de visión ni capa MTP.

El adaptador de harness-hub se entrenó con aprendizaje por refuerzo sobre Qwen3.8-27B para operar como motor del agente pi, con el modo de razonamiento desactivado durante el entrenamiento y la evaluación. El proceso de construcción de este fichero es: fusión PEFT estándar del LoRA (r = 32, según el texto truncado de la model card) a la escala propia del adaptador sobre el modelo base, sin entrenamiento adicional, y posterior cuantización IQ3_XXS con importance matrix de 174 × 2048 tokens. El autor modificó el recetario estándar de llama.cpp para esta arquitectura, que asignaba IQ2_S a las proyecciones Q/K de atención completa y 3 bits a las puertas SSM pequeñas; en su lugar destinó el presupuesto extra a tensores pequeños y sensibles (puertas SSM a Q8_0, proyecciones de atención a Q5_K/Q6_K, `output` a Q6_K), manteniendo las FFN en IQ3_XXS. El resultado es un fichero un 6 % más grande que la referencia de mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés.
- Agente de código: localizar ficheros, editar código, ejecutar tests y finalizar la tarea en pocos turnos.
- Tool calling / function calling nativo, verificado en Ollama 0.40.13 y en llama.cpp con `--jinja`.
- Razonamiento multi-paso dentro de un bucle agéntico (hasta 37 llamadas a herramienta en las pruebas reportadas).
- Resolución de incidencias reales de repositorios (probado sobre instancias de SWE-bench Verified con un harness local).
- Generación de código y resolución de problemas de programación (HumanEval y HumanEval+).
- Modo "thinking" desactivable; el adaptador está entrenado y evaluado con el razonamiento desactivado.
- Sin capacidades de visión ni audio en este fichero (el proyector multimodal se ha eliminado).
- Sin capacidades multilingües declaradas más allá del inglés.

## Casos de uso

- Agente de código local en portátil o estación de trabajo con GPU de 12 GB: el fichero de 11,89 GB cabe en una RTX 3060 de 12 GB o RTX 4070 Ti con cuantización IQ3_XXS, y se conecta a pi o a cualquier agente compatible con la API de OpenAI apuntando al endpoint local de Ollama o llama.cpp.
- Reparación automática de bugs en CI: el modelo puede recibir una incidencia, inspeccionar el repositorio mediante tool calls, aplicar un parche y ejecutar la suite de tests, con el bucle cerrado por el harness; encaja por su entrenamiento específico en "encontrar, editar, probar, parar" y por su bajo número de turnos.
- Asistente de refactorización en el IDE: integrado como backend de un plugin que expone lectura y escritura de ficheros como herramientas, el modelo propone y aplica cambios acotados con temperatura 0.8 y top_p 1.0, los valores de muestreo del entrenamiento.
- Generación de tests unitarios: a partir de una función o módulo, el agente puede escribir casos de prueba y ejecutarlos con la herramienta de shell, usando el modo sin razonamiento para reducir latencia.
- Automatización de tareas de mantenimiento de repositorios: actualización de dependencias, migraciones de API o corrección de avisos de linter, ejecutando comandos y verificando resultados dentro del bucle agéntico.
- Evaluación y prototipado de agentes de código en investigación: al ser un GGUF Apache-2.0 de tamaño manejable, sirve como baseline reproducible en local para comparar harnesses, plantillas de chat y estrategias de tool calling sin depender de APIs externas.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp u Ollama, el código fuente no sale de la máquina, lo que resulta adecuado para auditorías internas de código propietario.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este mismo fichero, salvo donde se indique.

| Benchmark | Configuracion | Pithos IQ3_XXS (11,89 GB) | netprojects IQ3_XXS (11,43 GB) |
|---|---|---|---|
| SWE-bench Verified, sonda de 5 instancias | Harness agéntico local, presupuesto de contexto ~12K caracteres, sin thinking, tool calls nativos, temp 0.8 / top_p 1.0 | 4/5 resueltas | No ejecutado |
| HumanEval pass@1 (base) | Sin thinking, temp 0.6, top_p 0.95, seed 1234, 2048 tokens nuevos máx. | 0.963 | 0.939 |
| HumanEval+ pass@1 | Misma configuración | 0.921 | 0.878 |
| Generaciones desbocadas en HumanEval (alcanzan el límite de tokens) | Misma configuración | 0/164 | 1/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 6,254 ± 0,074 | 6,430 ± 0,077 |

Detalle de la sonda SWE-bench: resolvió `django__django-11133` (12 llamadas a herramienta), `django__django-11099` (5), `django__django-13933` (35) y `django__django-14608` (37). En `django__django-13590` entregó un parche tras 11 llamadas que rompió 5 tests de lookup existentes, por lo que cuenta como no resuelta. Sin caídas ni respuestas vacías. El autor advierte que cinco instancias son una prueba de humo de competencia agéntica, no una puntuación de leaderboard, y que la diferencia en HumanEval (158 frente a 154 problemas base; 151 frente a 144 en HumanEval+) debe leerse como "al menos a la par" por tratarse de una sola semilla. La brecha de perplejidad supera el error estándar de ambas ejecuciones.

No se han publicado en la información disponible resultados de benchmarks del adaptador a plena precisión aplicados a esta cuantización; los datos de SWE-bench Pro hard-51 y Terminal-Bench 2.1 del adaptador original no se reclaman para este fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12 GB para el fichero completo (11,89 GB de pesos) más overhead de contexto; con `-c 32768` conviene reservar 13-14 GB o reducir la ventana.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 12 GB, RTX 4080/4090 16-24 GB, A100 40 GB, H100 80 GB.
- Cabe en GPU de consumo de 12 GB; en tarjetas de 8 GB no cabe el fichero completo y requeriría offload parcial a CPU o una cuantización menor.
- Opciones de despliegue: Ollama 0.40.13 (tool calls nativos verificados) y llama.cpp master (`dbaf582af`) con `llama-server --jinja`. Compatible con endpoints de la API de OpenAI.
- Configuración recomendada por el autor: `enable_thinking=false`, `temperature 0.8`, `top_p 1.0`; en Ollama, `think: false`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| Pithos-27B-Pandora-IQ3_XXS | 26,9B denso | No disponible (ejemplo a 32K) | GGUF IQ3_XXS, 11,89 GB | HumanEval 0.963; HumanEval+ 0.921; ppl Wikitext-2 6,254; 4/5 en sonda SWE-bench | Apache-2.0 |
| netprojects IQ3_XXS (referencia de mismo tamaño) | 26,9B denso | No disponible | GGUF IQ3_XXS, 11,43 GB (incluye capa MTP de 0,24 GB) | HumanEval 0.939; HumanEval+ 0.878; ppl Wikitext-2 6,430 | No disponible en la información |
| Qwen/Qwen3.8-27B (modelo base) | 26,9B denso | No disponible | Safetensors BF16, multimodal | No disponible en la información | Apache-2.0 |
| harness-hub/Qwen3.8-27B-pi-adapted (adaptador sin fusionar) | 26,9B + LoRA r=32 | No disponible | Safetensors (adaptador) | SWE-bench Pro hard-51 y Terminal-Bench 2.1 bajo harness pi, a plena precisión (cifras no incluidas en la información) | Apache-2.0 |

## Limitaciones y advertencias

- IQ3_XXS es una cuantización de ~3,5 bits de un modelo denso de 27B: es una versión para portátil, no equivalente al modelo en BF16. Con memoria suficiente, un Q4_K_M o superior será más capaz.
- El adaptador se entrenó y evaluó con el razonamiento desactivado; activar el modo thinking puede degradar el comportamiento esperado.
- Solo inglés: no hay soporte multilingüe declarado.
- Solo texto: sin visión ni audio, pese a que el modelo base es multimodal.
- Riesgo de alucinación inherente a un modelo de ~3,5 bits; el autor no reporta evaluaciones de sesgo ni de robustez frente a prompts adversarios.
- En la sonda SWE-bench, uno de los cinco parches rompió tests existentes, lo que ilustra el riesgo de aceptar parches sin verificación automática en producción.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y del adaptador; conviene verificar las condiciones de ambos en los repositorios originales.
- El autor no reclama para esta cuantización los resultados de SWE-bench Pro ni Terminal-Bench del adaptador a plena precisión.
- La ventana de contexto efectiva no está documentada; el ejemplo de despliegue usa 32 768 tokens, pero no se confirma que sea el máximo soportado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KikoCis/Pithos-27B-Pandora-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Agente pi: https://github.com/earendil-works/pi
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- evalplus (evaluador usado por el autor): https://github.com/evalplus/evalplus
