# 1bit-MONSTER/ZAYA1-74B-preview-GGUF

## Resumen

ZAYA1-74B-preview es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Zyphra, del que aquí se documenta la conversión a GGUF publicada por 1bit-MONSTER. El modelo base cuenta con 74.793.442.644 parámetros totales y 60 capas que alternan atención de ventana deslizante (ventana de 4.097 tokens, rope theta 1e4) y atención completa (rope theta 1e7). La conversión GGUF es relevante porque permite ejecutar un modelo de 74,8B parámetros en hardware de consumo y en GPUs integradas mediante el fork de llama.cpp mantenido por 1bit-MONSTER.

El repositorio contiene una única cuantización, `ZAYA1-74B-preview-Q4_K_M.gguf` (45,7 GB), generada convirtiendo primero a Q8_0 con `--remote` y recuantizando después a Q4_K_M, e incluye la plantilla de chat del modelo. El autor reporta validación end-to-end en un equipo Strix Halo con `--device hrx --ctx-size 8192`, con respuestas coherentes en código, prosa y preguntas factuales.

La relevancia práctica es doble: por un lado, el modelo base es Apache 2.0, lo que facilita su uso comercial; por otro, la conversión demuestra que un MoE de casi 75B puede servirse en un entorno con aproximadamente 46 GB de memoria visible para GPU. No obstante, el soporte requiere un fork específico de llama.cpp, ya que el llama.cpp upstream no implementa la arquitectura ZAYA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 60 capas que alternan atención de ventana deslizante (ventana 4.097 tokens, rope theta 1e4) y atención completa (rope theta 1e7); incluye convolución agrupada |
| Parametros totales | 74.793.442.644 (74,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (la validación se realizó con `--ctx-size 8192`) |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repo); el proceso pasa por Q8_0 antes de recuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`ZAYA1-74B-preview-Q4_K_M.gguf`, 45,7 GB) |
| Tamano del repo | 91,4 GB |
| Modelo base | Zyphra/ZAYA1-74B-preview |
| Descargas / likes | 25 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 60 capas en el que se alternan bloques de atención de ventana deslizante con bloques de atención completa. La ventana deslizante emplea 4.097 tokens con rope theta 1e4, mientras que las capas de atención completa usan rope theta 1e7, un esquema habitual para combinar eficiencia en contexto local con capacidad de modelado a larga distancia. El modelo incorpora además una convolución agrupada cuyos pesos el conversor de 1bit-MONSTER escribe en orden tap-major, requisito que impone el grafo de ejecución del fork.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, ya que la model card de la conversión no los detalla y no se ha proporcionado la del modelo base. Tampoco se especifica el número de expertos ni cuántos se activan por token. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la conversión: el soporte de atención de ventana deslizante se añadió en el fork de llama.cpp del autor (PR #11) y los GGUF deben generarse con su conversor, no con el de upstream.

## Capacidades

- Generación de texto conversacional con la plantilla de chat propia del modelo, validada en pruebas de código, prosa y respuestas factuales de una línea.
- Razonamiento y generación de código: la validación end-to-end del autor reporta respuestas coherentes en tareas de programación.
- Conversación multi-turno mediante la plantilla de chat incluida en el GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidad MoE: arquitectura de mezcla de expertos, aunque el número de expertos activos no está disponible.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Inferencia local de un modelo de 74,8B en hardware de consumo o GPU integrada: con la cuantización Q4_K_M (45,7 GB) y unos 46 GB de memoria visible para GPU, se puede servir en equipos como Strix Halo usando el motor de 1bit-MONSTER con `--device hrx`.
- Asistencia de programación en local: el modelo genera código coherente según la validación del autor, y su licencia Apache 2.0 permite integrarlo en herramientas internas de desarrollo sin restricciones de uso comercial.
- Chat conversacional autoalojado: la plantilla de chat incluida y la ventana de contexto configurable (probada a 8.192 tokens) permiten desplegar un asistente multi-turno en infraestructura propia, sin dependencia de APIs externas.
- Procesamiento por lotes de texto en estaciones de trabajo con GPU única: el prefill medido de 505,8 tok/s (pp512) en Vulkan sobre Radeon 8060S hace viable el procesamiento de documentos de entrada moderada en entornos sin GPU de datacenter.
- Evaluación e investigación de arquitecturas MoE híbridas: la alternancia de atención deslizante y completa con distintos rope theta permite estudiar el comportamiento de modelos de 74,8B en contextos locales frente a globales.
- Prototipado de pipelines que requieren compatibilidad con endpoints: el tag `endpoints_compatible` sugiere su uso tras una capa compatible con APIs de inferencia, útil para pruebas de integración antes de escalar a hardware mayor.
- Despliegue en entornos con memoria limitada: Q4_K_M es la única cuantización publicada, adecuada cuando no se dispone de los ~300 GB de memoria que requeriría una ejecución en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de rendimiento de inferencia medidas con `llama-bench` en Vulkan sobre una Radeon 8060S (Strix Halo):

| Metrica | Valor | Configuracion |
|---|---|---|
| Prefill | 505,8 tok/s | pp512 |
| Decode | 35,4 tok/s | tg128 |
| Memoria visible para GPU | ~46 GB | Q4_K_M, `--ctx-size 8192` |
| Test end-to-end de serve | Pass | `--device hrx --ctx-size 8192` |

No existe comprobación de referencia contra transformers, según el propio autor, porque una ejecución en FP32 de 74B requiere unos 300 GB de memoria.

## Requisitos de hardware

- VRAM estimada: aproximadamente 46 GB de memoria visible para GPU con Q4_K_M y contexto de 8.192 tokens.
- GPU recomendadas: el autor valida en Strix Halo con Radeon 8060S (GPU integrada) mediante Vulkan y el dispositivo `hrx` del motor de 1bit-MONSTER. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 16 GB; requiere del orden de 46 GB, por lo que encaja en equipos con memoria unificada grande (Strix Halo) o en configuraciones multi-GPU.
- Opciones de despliegue: motor `1bit` (`1bit serve -m ZAYA1-74B-preview-Q4_K_M.gguf --device hrx --ctx-size 8192`) sobre el fork de llama.cpp `1bit/hrx-vulkan-patched`. El llama.cpp upstream no soporta el modelo ZAYA.
- Throughput medido: 505,8 tok/s de prefill (pp512) y 35,4 tok/s de decode (tg128) en Vulkan sobre Radeon 8060S.
- Almacenamiento: el repo ocupa 91,4 GB; el archivo Q4_K_M pesa 45,7 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZAYA1-74B-preview (GGUF, esta ficha) | 74,8B (MoE) | no disponible | Apache 2.0 | GGUF Q4_K_M | Requiere fork de llama.cpp; ~46 GB de memoria |
| Zyphra/ZAYA1-74B-preview (original) | 74,8B (MoE) | no disponible | Apache 2.0 | safetensors (presumible, no confirmado) | Modelo base; FP32 requiere ~300 GB |
| Alternativas de ~70B densas | ~70B | variable | variable | safetensors, GGUF | No se dispone de datos comparativos en la información aportada |

No se identifican en la información disponible otros modelos comparables con datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Dependencia de un fork: el modelo solo funciona con el fork de llama.cpp de 1bit-MONSTER (rama `1bit/hrx-vulkan-patched`); el llama.cpp upstream no implementa ZAYA. Esto limita la portabilidad y ata el despliegue al mantenimiento de ese fork.
- Conversor obligatorio: los GGUF deben generarse con el conversor del autor, que escribe los pesos de la convolución agrupada en orden tap-major; conversiones de terceros pueden producir resultados incorrectos.
- Sin validación de referencia: el autor no compara contra transformers por requisitos de memoria (~300 GB en FP32), de modo que la fidelidad numérica frente al modelo original no está verificada de forma independiente.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de factualidad.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad multilingüe.
- Contexto: la longitud máxima de contexto del modelo no está documentada; la validación se hizo a 8.192 tokens y la ventana deslizante es de 4.097 tokens.
- Sesgos: no hay información publicada sobre sesgos conocidos.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los términos del repo original de Zyphra.
- Madurez: el modelo base es una versión "preview" y la conversión tiene 25 descargas y 0 likes, sin adopción comunitaria significativa.
- Rendimiento: 35,4 tok/s de decode en una GPU integrada es adecuado para uso interactivo individual, pero limitado para servir a múltiples usuarios concurrentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/ZAYA1-74B-preview-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-74B-preview
- Motor de inferencia 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp: https://github.com/1bit-MONSTER/llama.cpp
- PR de soporte de atención deslizante: https://github.com/1bit-MONSTER/llama.cpp/pull/11
- Familias de modelos del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
