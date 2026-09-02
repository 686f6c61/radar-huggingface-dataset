# PreDoctor/gemma-4-31B-it-qat-w4a16-ct-PreTensor

## Resumen

El modelo `PreDoctor/gemma-4-31B-it-qat-w4a16-ct-PreTensor` es una distribución del checkpoint oficial de Google DeepMind `google/gemma-4-31B-it-qat-w4a16-ct`, empaquetado específicamente para el runtime local PreTensor sobre CUDA nativo. Se trata de la variante de 31 000 millones de parámetros de la familia Gemma 4, un modelo multimodal que acepta entrada de texto e imagen y genera texto, con capacidades de razonamiento, uso de herramientas y contexto largo. La versión QAT (quantization-aware training) ya viene cuantizada por Google con pesos INT4 y activaciones BF16, y PreTensor la redistribuye sin requantizar, manteniendo la fidelidad del checkpoint original.

Este modelo resuelve el problema de desplegar un LLM de 32 700 millones de parámetros en hardware de consumo o servidores con memoria limitada, gracias a la cuantización W4A16 que reduce el peso a unos 23 GB. Es relevante porque combina un rendimiento de nivel frontier (Gemma 4 supera a Gemma 3 en razonamiento, código y seguridad) con una huella de memoria reducida, lo que permite ejecutarlo en GPUs de 24 GB o superiores. La versión PreTensor añade además una capa de optimización para inferencia en CUDA, con mediciones de prefill de hasta 3301 tokens por segundo en una RTX PRO 6000 Blackwell Max-Q.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en Gemma 4 31B |
| Parametros totales | 32.682.375.020 (~32,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta contexto largo, pero no se especifica el valor exacto en esta distribucion) |
| Tipos de cuantizacion | W4A16 (pesos INT4 con grupo simetrico de tamaño 32, activaciones y KV cache en BF16) |
| Idiomas soportados | no disponibles (Gemma 4 es multilingue, pero la model card no detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors fragmentados (6 shards), empaquetado para runtime PreTensor (CUDA nativo) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it-qat-w4a16-ct`, un checkpoint de la familia Gemma 4 desarrollada por Google DeepMind. Se trata de un transformer denso multimodal que procesa tanto texto como imagenes (los tensores de vision se copian sin cuantizar en BF16). La variante QAT fue entrenada con cuantizacion consciente, de modo que los pesos INT4 estan optimizados para minimizar la degradacion respecto al modelo en precision completa. El empaquetado PreTensor copia literalmente los tensores del checkpoint fuente sin requantizacion, preservando la integridad de los pesos.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO). Sin embargo, Google DeepMind indica que Gemma 4 supera a Gemma 3 y 3n en seguridad y en la reduccion de rechazos injustificados, lo que sugiere un refinamiento posterior al preentrenamiento. El modelo soporta system prompts, uso nativo de herramientas y razonamiento multi-paso, caracteristicas tipicas de los modelos de ultima generacion.

## Capacidades

- Generacion de texto y razonamiento: respuestas coherentes, analisis y resolucion de problemas complejos.
- Comprension de imagenes: entrada multimodal (imagen + texto) para tareas de descripcion, respuesta a preguntas visuales y analisis de documentos escaneados.
- Soporte de tool calling / function calling: integrable en agentes que necesitan invocar APIs o herramientas externas.
- Agentes y multi-step reasoning: capaz de planificar y ejecutar secuencias de acciones logicas.
- Contexto largo: disenado para manejar ventanas de contexto extensas (aunque no se especifica el limite exacto en esta distribucion).
- Multilingue: la familia Gemma 4 es multilingue, aunque la lista de idiomas no se detalla aqui.
- Mejoras de seguridad: segun Google, Gemma 4 reduce respuestas inseguras manteniendo bajas las tasas de rechazo injustificado.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto prolongado, interpretando imagenes de capturas de pantalla o documentos adjuntos, gracias a su entrada multimodal y su capacidad de tool calling para consultar bases de datos o sistemas CRM.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, ejecutando pruebas unitarias mediante llamadas a funciones externas.
- Analisis de documentos visuales: extraccion de informacion de facturas, contratos o formularios escaneados, combinando OCR con razonamiento textual para validar datos y detectar inconsistencias.
- Asistente de investigacion cientifica: lectura de graficos, tablas y figuras de articulos (entrada de imagen) junto con el texto, para resumir hallazgos y sugerir hipotesis.
- Agente de automatizacion de tareas: orquestacion de flujos de trabajo multi-paso, como la reserva de citas o la gestion de correos, mediante function calling y razonamiento secuencial.
- Educacion y tutoria: explicacion de conceptos complejos con apoyo visual (diagramas, ecuaciones manuscritas) y generacion de ejercicios personalizados segun el nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de velocidad de prefill en un hardware especifico, que no constituyen benchmarks de capacidad del modelo:

| Input tokens | Prefill (tok/s) | Tiempo (ms) |
|---:|---:|---:|
| 4 096 | 3 301 | 1 240,9 |
| 16 384 | 2 426 | 6 752,6 |

Estas cifras se obtuvieron en una NVIDIA RTX PRO 6000 Blackwell Max-Q con driver 620.12, tras calentamiento del modelo y del grafo, y representan la mediana de 3 ejecuciones. No son extrapolables a otros hardware.

## Requisitos de hardware

- VRAM estimada: los pesos INT4 ocupan aproximadamente 23 GB (23 265 085 560 bytes de payload). Con activaciones BF16, KV cache y overhead del runtime, se recomienda al menos 24 GB de VRAM para contextos moderados; para contextos largos o mayor batch, se necesitan 32 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar el modelo con contexto limitado; RTX 6000 Ada (48 GB), A100 (40/80 GB), H100 (80 GB) para mayor capacidad y throughput. La medicion oficial se realizo en una RTX PRO 6000 Blackwell Max-Q.
- Compatibilidad con consumer GPU: si, en tarjetas de 24 GB o superiores, siempre que el contexto se ajuste a la memoria disponible.
- Opciones de despliegue: el paquete esta disenado para el runtime PreTensor (CUDA nativo). Tambien podria cargarse con librerias que soporten compressed-tensors (p. ej. vLLM con soporte de cuantizacion W4A16), aunque no se garantiza la compatibilidad con llama.cpp u Ollama al no incluir pesos GGUF.
- Latencia y throughput: segun las mediciones de la model card, el prefill alcanza 3301 tok/s con 4096 tokens de entrada y 2426 tok/s con 16384 tokens, en el hardware indicado. No se proporcionan datos de generacion (decode).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B QAT (este) | 32,7B | no disponible | Apache 2.0 | W4A16, safetensors | Multimodal, tool calling, seguridad mejorada |
| Gemma 3 27B (base) | 27B | 128K (tipico) | Gemma Terms of Use | BF16/FP16 | Multimodal, sin cuantizacion QAT |
| Llama 3.1 32B | 32B | 128K | Llama 3.1 Community License | BF16 | Solo texto, sin tool calling nativo en base |
| Qwen 2.5 32B | 32B | 128K | Apache 2.0 | BF16 | Multilingue, tool calling, sin vision en base |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la tabla refleja unicamente especificaciones generales.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier LLM, puede generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas. No se han publicado evaluaciones especificas de sesgo para esta version.
- Degradacion por cuantizacion: aunque QAT reduce la perdida, la precision INT4 puede afectar a tareas de matematicas avanzadas o generacion de codigo muy especifico en comparacion con el modelo en BF16.
- Idioma: no se especifica la lista de idiomas soportados; el rendimiento puede variar significativamente entre lenguas.
- Contexto: el limite exacto de la ventana de contexto no esta documentado en esta distribucion, lo que dificulta planificar cargas de trabajo con documentos muy extensos.
- Restricciones de despliegue: el paquete PreTensor esta orientado a CUDA nativo; no incluye payloads WebGPU ni formatos GGUF, por lo que no es directamente utilizable en entornos como Ollama o navegadores.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Gemma 4) cumple con las politicas de uso de Google DeepMind, aunque en este caso la licencia declarada es Apache 2.0.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/PreDoctor/gemma-4-31B-it-qat-w4a16-ct-PreTensor
- Checkpoint base oficial: https://huggingface.co/google/gemma-4-31B-it-qat-w4a16-ct
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
