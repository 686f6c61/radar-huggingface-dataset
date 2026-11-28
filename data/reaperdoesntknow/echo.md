# reaperdoesntknow/echo

## Resumen

**echo** es un checkpoint de lenguaje experimental de la familia TAMELM, publicado por el usuario `reaperdoesntknow` en Hugging Face. Se trata de un modelo de tipo `tamelm_two_axis` con arquitectura transformer de 12 capas, dimensión de embedding 1024 y un esquema de mezcla de expertos (MoE) con 4 expertos y top-k 2. El modelo incorpora innovaciones arquitectónicas declaradas por el autor como "routed attention", "depth attention" y "dropless MoE", implementadas en código personalizado (`modeling_tamelm.py`) que no forma parte de las arquitecturas nativas de Transformers.

El modelo tiene 707.140.400 parámetros totales según los pesos en safetensors, una ventana de contexto configurada de 1024 tokens y un vocabulario de 49152 tokens. Se distribuye con licencia no declarada, sin idiomas especificados y sin model card que documente el proceso de entrenamiento, los datos utilizados ni resultados de evaluación reproducibles. La model card del autor es explícita al señalar que se trata de un "modelo concepto de investigación" y que los nombres de arquitectura y campos de configuración describen la implementación, no capacidad de razonamiento demostrada ni rendimiento en benchmarks.

Su relevancia actual es limitada y de carácter exploratorio: sirve como artefacto para estudiar una configuración arquitectónica concreta (atención enrutada, atención de profundidad y MoE sin descarte de tokens) más que como modelo listo para producción. Cualquier evaluación de su calidad requiere ejecutar el código personalizado en un entorno compatible y validar los resultados de forma independiente, dado que no se han publicado métricas ni recetas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parametros totales | 707.140.400 |
| Parametros activos | no disponible (MoE con 4 expertos y top-k 2; el número de parámetros activos por token no se documenta) |
| Longitud de contexto | 1024 tokens (máximo configurado) |
| Tipos de cuantizacion | no disponible (dtype configurado en float32; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (con `config.json`, tokenizer y `modeling_tamelm.py` con código personalizado) |

Otros parámetros de configuración publicados: 12 capas, dimensión de embedding 1024, 16 cabezas de query, 4 cabezas key/value, dimensión oculta de experto 4096, modo de profundidad `attention`, dimensión de profundidad 768, 8 cabezas de profundidad, 16 slots de profundidad, backend de atención `flex`, backend de experto `grouped`, vocabulario 49152, dtype `float32`, versión de Transformers registrada 5.5.0, `use_cache: false`.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 12 capas con atención multi-cabeza (16 cabezas de query, 4 de key/value, lo que implica grouped-query attention) y una capa de mezcla de expertos con 4 expertos, top-k 2 y dimensión oculta de 4096. Sobre esta base, el autor añade dos mecanismos propietarios: "routed attention" (atención enrutada) y "depth attention" (atención de profundidad), con 8 cabezas y 16 slots de profundidad sobre una dimensión de 768. El modo de profundidad está configurado como `attention`. El backend de atención seleccionado en este export es `flex` (FlexAttention de PyTorch), mientras que el export separado `Echo_R` selecciona `dense`; la model card advierte que esta diferencia de configuración no establece linaje de entrenamiento ni equivalencia entre pesos.

La implementación incluye alternativas densas de referencia y aceleración opcional mediante CUDA FlexAttention y Triton grouped-GEMM. No se documenta la receta de entrenamiento: se desconoce el número de tokens, la composición del dataset, las licencias de los datos, la duración del entrenamiento, los hiperparámetros del optimizador, el hardware utilizado y los criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO u otra fase de alineación. La model card es explícita: "el repositorio inspeccionado no documenta una receta de entrenamiento completa ni un informe de evaluación reproducible".

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` con código personalizado (`TAMELM`).
- Razonamiento y conocimiento general: no verificados; no se han publicado evaluaciones que lo respalden.
- Generación de código y matemáticas: no documentadas ni evaluadas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Atención enrutada y atención de profundidad como mecanismos arquitectónicos experimentales, sujetos a validación independiente.
- Caché de inferencia desactivada en la configuración (`use_cache: false`), lo que condiciona el rendimiento en generación secuencial.

## Casos de uso

- Investigación de arquitecturas MoE: el modelo permite estudiar experimentalmente el comportamiento de un MoE dropless con 4 expertos y top-k 2, comparando el enrutamiento de tokens entre expertos frente a configuraciones densas de referencia incluidas en la implementación.
- Estudio de mecanismos de atención alternativos: los módulos de routed attention y depth attention pueden analizarse de forma aislada para medir su impacto en la representación interna, siempre que se ejecute el código personalizado en un entorno controlado.
- Reproducción de configuraciones: dado que el repositorio incluye `config.json` y `modeling_tamelm.py`, es posible inspeccionar y replicar la configuración exacta (12 capas, 1024 de embedding, 16/4 cabezas, 4 expertos) para experimentos de ablación.
- Docencia y formación: como ejemplo práctico de implementación de MoE con backends FlexAttention y Triton grouped-GEMM en un repositorio pequeño (707 M de parámetros), útil para ilustrar el flujo de carga con `auto_map` y código remoto.
- Pruebas de integración de pipelines: sirve para validar toolchains de despliegue con Transformers 5.5.0 y código personalizado antes de migrar a modelos mayores de la misma familia TAMELM.
- Evaluación comparativa de exports: la existencia de `Echo_R` con backend `dense` permite comparar el comportamiento de dos configuraciones de atención sobre la misma arquitectura base, aunque la model card advierte que no debe asumirse equivalencia entre pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de benchmark, mejoras comparativas ni garantías de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 707 M de parámetros en float32 (dtype configurado), los pesos ocupan aproximadamente 2,8 GB; a ello hay que sumar activaciones, buffers de atención FlexAttention y estados intermedios del MoE, por lo que se recomienda un mínimo de 6-8 GB de VRAM en float32. La cifra exacta no está validada por el autor.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090; en el ámbito profesional, A100, H100, L40S y A10 son compatibles en términos de memoria, pero la compatibilidad de FlexAttention y Triton grouped-GEMM depende de la versión de CUDA, PyTorch y paquetes instalados.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en float32; no se han publicado variantes cuantizadas (GGUF, GPTQ, AWQ) que reduzcan aún más el requisito.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada (código personalizado con `auto_map`). No se ha validado la compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de soporte nativo de la arquitectura TAMELM en esas herramientas hace improbable su uso directo sin adaptaciones.
- Latencia y throughput: no disponibles. La configuración desactiva la caché (`use_cache: false`), lo que puede penalizar la generación autoregresiva secuencial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| echo (TAMELM) | 707 M | 1024 | Transformer MoE dropless con routed/depth attention | no disponible | Hugging Face, código personalizado |
| TinyLlama 1.1B | 1.100 M | 2048 | Transformer denso (Llama) | Apache 2.0 | Hugging Face, integración nativa |
| Qwen2.5-0.5B | 494 M | 32 768 | Transformer denso (Qwen2) | Apache 2.0 | Hugging Face, integración nativa |
| SmolLM2-360M | 362 M | 8192 | Transformer denso | Apache 2.0 | Hugging Face, integración nativa |

La comparación es orientativa por tamaño, no por rendimiento: no existen datos de benchmarks para `echo` que permitan contrastar calidad frente a estos modelos. Las alternativas citadas cuentan con contexto significativamente mayor (2048-32 768 frente a 1024), licencias permisivas declaradas e integración nativa en Transformers, lo que las hace más adecuadas para producción. `echo` se distingue únicamente por su configuración MoE experimental y sus mecanismos de atención propietarios.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni informe de calidad, ni validación de razonamiento, código o matemáticas. La model card lo declara explícitamente.
- Receta de entrenamiento no documentada: se desconocen datos, tokens, hiperparámetros, hardware y criterios de selección de checkpoints, lo que impide auditar sesgos o memorización.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es necesario contactar con el propietario del repositorio antes de desplegar o redistribuir.
- Idiomas no especificados: no hay garantía de cobertura multilingüe ni de calidad en castellano.
- Contexto limitado a 1024 tokens, muy por debajo de los estándares actuales (8K-128K), lo que restringe casos de uso con documentos largos o conversaciones multi-turno extensas.
- Código personalizado con `trust_remote_code`: requiere revisión de `modeling_tamelm.py` antes de habilitar la ejecución remota; se recomienda fijar una revisión del repositorio para reproducibilidad.
- Dependencias frágiles: la versión de Transformers registrada (5.5.0) es metadatos de exportación, no un lockfile probado; la compatibilidad de FlexAttention y Triton grouped-GEMM depende del runtime, hardware y paquetes instalados.
- Sin receta de carga y generación validada de extremo a extremo para esta model card; no se ofrece garantía de inferencia independiente del hardware.
- Caché desactivada (`use_cache: false`): puede degradar la latencia en generación secuencial.
- Riesgo de alucinación, sesgo y contenido inseguro inherente a cualquier modelo de lenguaje; la model card recomienda evaluación independiente antes de usar la salida en aplicaciones.
- El export `Echo_R` con backend `dense` no es equivalente en pesos a este export; no deben intercambiarse ni asumirse linajes de entrenamiento compartidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/echo
- Árbol de archivos del repositorio: https://huggingface.co/reaperdoesntknow/echo/tree/main
- Configuración publicada (`config.json`): https://huggingface.co/reaperdoesntknow/echo/blob/main/config.json
- Implementación del modelo (`modeling_tamelm.py`): https://huggingface.co/reaperdoesntknow/echo/blob/main/modeling_tamelm.py
