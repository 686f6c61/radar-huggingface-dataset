# gjehrenberg/Llama-3.2-1B-Q2_K-GGUF

## Resumen

`gjehrenberg/Llama-3.2-1B-Q2_K-GGUF` es una cuantizacion en formato GGUF del modelo `unsloth/Llama-3.2-1B`, que a su vez es una redistribucion del Llama 3.2 1B de Meta. No se trata de un modelo entrenado desde cero, sino de un artefacto de conversion generado con el espacio `GGUF-my-repo` de ggml.ai a partir de los pesos originales en safetensors, empleando la herramienta llama.cpp. Su proposito es permitir la ejecucion del modelo base en hardware muy limitado mediante una cuantizacion de 2 bits (Q2_K).

El modelo subyacente es un transformer decoder-only denso de 1.235.814.432 parametros (aproximadamente 1,2 mil millones), orientado a generacion de texto en ingles y publicado bajo la licencia comunitaria Llama 3.2. La relevancia de esta ficha concreta es practica: ofrece un checkpoint de 0,6 GB que puede cargarse en CPU, en GPUs de gama baja o en dispositivos con poca memoria, a costa de una perdida de calidad notable frente a cuantizaciones superiores.

Conviene subrayar que este repositorio no aporta mejoras de rendimiento ni ajustes propios: es una conversion mecanica. El autor no publica benchmarks, no documenta el proceso de cuantizacion mas alla de la herramienta usada y no ofrece garantias de calidad. Para uso en produccion seria preferible acudir a cuantizaciones Q4_K_M o Q5_K_M del mismo modelo base, o a los pesos originales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), segun el modelo base |
| Parametros totales | 1.235.814.432 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q2_K (unica variante publicada en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Licencia comunitaria Llama 3.2) |
| Formato de pesos | GGUF (`llama-3.2-1b-q2_k.gguf`) |
| Tamano del repositorio | 0,6 GB |
| Libreria declarada | transformers (etiqueta), ejecutable con llama.cpp |
| Modelo base | unsloth/Llama-3.2-1B |
| Descargas / likes | 82 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al Llama 3.2 1B de Meta: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y activacion SwiGLU, en la linea de las generaciones Llama 3 y 3.1. Este repositorio no modifica ni reentrena dicha arquitectura; unicamente aplica una cuantizacion de bloque de 2 bits (Q2_K) sobre los tensores originales en safetensors mediante llama.cpp, dentro del espacio GGUF-my-repo de ggml.ai.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni sobre si el modelo base paso por fases de RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla de las propias del modelo base. La unica transformacion relevante es la cuantizacion Q2_K, que reduce el peso a unos 0,6 GB pero introduce un error de cuantizacion considerable al operar con aproximadamente 2 bits por peso.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 3.2 1B.
- Razonamiento basico y respuesta a instrucciones de complejidad baja a moderada, limitado por el tamano del modelo (1,2 B parametros).
- Generacion de codigo sencillo y tareas de completado de texto, sin garantias de calidad en escenarios complejos.
- Capacidad multilingue muy limitada: la etiqueta de idioma declarada es unicamente `en`.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de vision, audio ni modo de pensamiento extendido (thinking mode).
- Ejecutable en modo CLI y servidor mediante `llama-cli` y `llama-server` de llama.cpp.

## Casos de uso

- Prototipado rapido en local: cargar el GGUF con `llama-cli` para validar prompts y flujos antes de invertir en infraestructura, gracias a su tamano de 0,6 GB y a su ejecucion en CPU.
- Pruebas de integracion con llama.cpp: verificar la compatibilidad de pipelines propios con el formato GGUF y con la API de `llama-server` usando un checkpoint ligero.
- Entornos con memoria muy restringida: despliegue en dispositivos embebidos, Raspberry Pi o contenedores con menos de 1 GB de RAM dedicada a pesos, donde cuantizaciones mayores no caben.
- Generacion de texto auxiliar de baja criticidad: borradores, resumenes cortos o completado de plantillas en ingles donde el coste computacional prima sobre la calidad.
- Educacion y experimentacion: estudiar el efecto de la cuantizacion Q2_K comparando sus salidas con las del modelo base en safetensors.
- Pruebas de regresion de infraestructura: usar el modelo como carga de trabajo sintetica para medir latencia y throughput de un servidor llama.cpp antes de desplegar modelos mayores.
- Filtrado y clasificacion simple de texto en ingles: tareas de etiquetado poco exigentes que toleran el ruido introducido por la cuantizacion de 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni en comparacion con el modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,6 GB solo para los pesos en Q2_K; con overhead de contexto y cache KV, un uso realista se situa en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050 o superiores; tambien funciona en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque no se documentan explicitamente en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 1,2 B en Q2_K, se espera una ejecucion fluida en CPU y muy rapida en GPU, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gjehrenberg/Llama-3.2-1B-Q2_K-GGUF | 1,2 B | no disponible | GGUF Q2_K | llama3.2 | HuggingFace (82 descargas) |
| unsloth/Llama-3.2-1B (base) | 1,2 B | no disponible | safetensors | llama3.2 | HuggingFace |
| Otras cuantizaciones de Llama-3.2-1B (Q4_K_M, Q5_K_M) | 1,2 B | no disponible | GGUF | llama3.2 | Habitualmente disponibles en el ecosistema llama.cpp |
| Qwen2.5-1.5B | 1,5 B | no disponible en esta ficha | safetensors/GGUF | Apache 2.0 (segun el modelo original) | HuggingFace |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion Q2_K introduce una perdida de calidad significativa; las salidas pueden ser incoherentes o repetitivas con mayor frecuencia que en Q4_K_M o en el modelo original.
- Riesgo elevado de alucinacion, agravado por el reducido tamano del modelo base y por el error de cuantizacion.
- Soporte unicamente de ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia Llama 3.2: el uso comercial esta sujeto a los terminos de la licencia comunitaria de Meta, incluidos requisitos de atribucion y restricciones de uso aceptable; debe revisarse antes de un despliegue en produccion.
- El repositorio no incluye model card propia mas alla de la plantilla de GGUF-my-repo, ni documentacion de sesgos, evaluaciones de seguridad o limitaciones especificas.
- Autor con nula traccion (0 likes, 82 descargas): no hay evidencia de mantenimiento ni de validacion por parte de la comunidad.
- No apto para tareas que requieran razonamiento complejo, codigo en produccion, agentes o tool calling.
- El contexto maximo no se documenta; el ejemplo de la model card usa `-c 2048`, lo que sugiere que no debe asumirse una ventana mayor sin verificacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gjehrenberg/Llama-3.2-1B-Q2_K-GGUF
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.2-1B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
