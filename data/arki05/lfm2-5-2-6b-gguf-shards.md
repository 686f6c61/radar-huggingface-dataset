# Arki05/LFM2.5-2.6B-GGUF-shards

## Resumen

Este repositorio no contiene un modelo nuevo, sino un almacén de cuantizaciones del modelo LFM2.5-2.6B de Liquid AI, distribuido por el usuario Arki05. Concretamente, ofrece cada tensor de la red cuantizado de forma independiente en cada uno de los 24 tipos disponibles en llama.cpp, de modo que sea posible ensamblar un GGUF con un tipo distinto por tensor mediante la herramienta `qalloc` del mismo autor. El resultado son ficheros GGUF con tipos estándar, compatibles con llama.cpp sin modificaciones.

El modelo subyacente, LFM2.5-2.6B, es un modelo denso de 2,6 mil millones de parámetros de Liquid AI, disenado para cargas de trabajo agénticas, con una ventana de contexto de 131K tokens, tool calling nativo y un modo de razonamiento que siempre genera un bloque de pensamiento antes de la respuesta. Está orientado a ejecución en dispositivos edge y a funcionar dentro de arneses de agentes como Hermes Agent, OpenClaw o Pi.

La relevancia de este repositorio es práctica: permite estudiar y explotar asignaciones de tipo por tensor (por ejemplo, mantener en precisión alta las capas sensibles y comprimir el resto) sin reentrenar ni recuantizar, con datos de calibración, manifiestos y hashes SHA-256 incluidos para reproducibilidad. El repositorio ocupa 147,8 GB y acumula 22.817 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo denso (no MoE); arquitectura interna no detallada en la informacion disponible. El repositorio contiene pesos en formato GGUF |
| Parametros totales | 2,6 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (131K) segun la documentacion de Liquid AI; una fuente secundaria indica 4.096, discrepancia sin confirmar |
| Tipos de cuantizacion | 24 tipos de llama.cpp, aplicables por tensor; builds GPTQ-family con dos variantes: `-hq` (bloques de tensores, mayor calidad) y `-hq1` (todos los tensores cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), la misma que el modelo original |
| Formato de pesos | GGUF (tipos planos de llama.cpp); estructura de almacen `qcore-store/1` con `manifest.json`, `skeleton.gguf`, `store.json` y `records/` |

| Parametro adicional | Valor |
|---|---|
| Autor del repositorio | Arki05 |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Descargas | 22.817 |
| Likes | 0 |
| Tamano del repositorio | 147,8 GB |
| Creado | 2026-08-14 |
| Actualizado | 2026-10-29 |

## Arquitectura y entrenamiento

El repositorio incluye `source/`, el GGUF BF16 original de Liquid AI sin modificar, y `types/<T>-hq.gguf` y `types/<T>-hq1.gguf`, que contienen los tensores recuantizados a cada tipo `T` de llama.cpp partiendo de los pesos BF16. La cuantizacion es de familia GPTQ (basada en información de segundo orden, Hessiana), en dos builds: `-hq`, que conserva en mayor precisión los tensores de bloque y es la de mayor calidad, y `-hq1`, la primera build, en la que se cuantizan todos los tensores. El directorio `data/` contiene los datos de calibración empleados (ids de tokens y su manifiesto), y `manifest.json`, `skeleton.gguf`, `store.json` y `records/` recogen, para cada tensor, su desplazamiento y su hash SHA-256, que es lo que consume `qalloc`. Una primera versión del almacén, basada en el GGUF BF16 y la imatrix de bartowski con tipos generados por `llama-quantize`, está disponible en la revisión `fe50613`.

Sobre el entrenamiento del modelo base no hay información en los materiales disponibles: no se detallan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo único documentado por Liquid AI es el comportamiento resultante: modelo denso de 2,6B, razonamiento previo obligatorio, tool calling nativo y contexto de 131K, optimizado para ejecución local en dispositivos edge y para operar dentro de arneses de agentes. Cualquier afirmación sobre innovaciones técnicas internas (attention lineal, capas convolucionales, decodificación especulativa) carece de respaldo en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo siempre genera un bloque de pensamiento antes de emitir la respuesta final.
- Tool calling / function calling nativo, pensado para invocar herramientas dentro de un bucle de agente.
- Operación en arneses de agentes multi-paso (Hermes Agent, OpenClaw, Pi, según Liquid AI).
- Ejecución en dispositivos edge por su tamano de 2,6B parámetros.
- Ventana de contexto de 131K tokens para conversaciones y documentos largos.
- Capacidad de visión: no disponible en la información proporcionada.
- Capacidad de audio: no disponible en la información proporcionada.
- Soporte multilingüe: no disponible; los idiomas no están declarados.
- Capacidad específica del repositorio: ensamblado de GGUF con tipo de cuantización distinto por tensor mediante `qalloc`.

## Casos de uso

- Agentes locales en dispositivos edge: el modelo puede ejecutarse en portátiles o mini-PC sin GPU dedicada y gestionar bucles de tool calling, aprovechando sus 131K tokens de contexto para mantener el estado de la tarea.
- Investigación sobre cuantización por tensor: usar los ficheros `types/<T>-hq.gguf` para medir el impacto en perplejidad de subir o bajar el tipo de un tensor concreto, manteniendo el resto fijo.
- Ensamblado de GGUF a medida: combinar tipos distintos por capa con `qalloc` para obtener un binario que equilibre tamano y calidad para un hardware concreto.
- Validación de pipelines de cuantización en CI: los `records/` con offsets y SHA-256 permiten verificar la integridad de los artefactos generados y comparar builds `-hq` frente a `-hq1` de forma reproducible.
- Asistentes de línea de comandos con acceso a herramientas: integración vía llama.cpp u Ollama para tareas de shell, consulta de ficheros y automatización de operaciones con function calling.
- Procesamiento de documentos largos en local: resumen y extracción sobre contratos o informes que quepan en la ventana de 131K tokens, sin enviar datos a la nube.
- Prototipado de aplicaciones agénticas antes de escalar a un modelo mayor: mismo formato GGUF y misma API de inferencia, lo que reduce el coste de migración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni las fuentes consultadas incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas para LFM2.5-2.6B o para estas cuantizaciones. Tampoco se documentan métricas de degradación por cuantización (perplejidad, KL divergence) comparando `-hq` con `-hq1`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de 2,6B parámetros, no publicada por el autor): en torno a 5,2 GB de pesos en BF16, 2,8 GB en Q8 y 1,6-1,7 GB en Q4, a los que hay que sumar la caché KV del contexto utilizado.
- La caché KV para 131K tokens puede ser el factor dominante en memoria; no se dispone del número de capas ni de cabezas KV para calcularla con precisión.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; en Q4 debería caber en GPU de 6-8 GB dejando margen para contexto moderado.
- GPU de centro de datos (A100, H100) no son necesarias para este tamano; resultan útiles para servir muchas peticiones concurrentes o contextos muy largos.
- CPU: inferencia viable en x86-64 moderno con llama.cpp, especialmente con tipos Q4/Q5.
- Opciones de despliegue: llama.cpp (los tipos son planos, compatibles sin parches), llama-cpp-python, Ollama importando el GGUF, y servidores basados en llama.cpp. vLLM y TGI no están pensados para asignaciones de tipo por tensor arbitrarias; para esos motores conviene partir del GGUF oficial de Liquid AI.
- Espacio en disco: el repositorio completo ocupa 147,8 GB; conviene descargar solo los ficheros de tipo necesarios mediante descarga selectiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Arki05/LFM2.5-2.6B-GGUF-shards (este repo) | 2,6B denso | 131K (heredado del base) | LFM Open License v1.0 | GGUF por tensor, 24 tipos, 147,8 GB | Almacén para ensamblado con `qalloc`, no un modelo nuevo |
| LiquidAI/LFM2.5-2.6B (original) | 2,6B denso | 131K | LFM Open License v1.0 | Safetensors / GGUF oficial (incluye QAD Q4_0) | Referencia de calidad; pensar antes de responder y tool calling nativo |
| Llama 3.2 3B Instruct | 3,2B denso | 128K | Llama 3.2 Community License | Safetensors, GGUF | Ecosistema muy amplio; licencia con restricciones de uso |
| Qwen2.5-3B-Instruct | 3,1B denso | 32.768 | Apache 2.0 | Safetensors, GGUF | Contexto menor; licencia permisiva |
| Gemma 3 4B | 4B denso | 128K | Gemma Terms of Use | Safetensors, GGUF | Mayor tamano y contexto largo; licencia con condiciones |

Los datos de los modelos comparables provienen de su documentación pública y deben verificarse contra la versión concreta antes de tomar decisiones de producción. Para LFM2.5-2.6B no hay métricas de rendimiento publicadas en la información disponible, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado: son pesos modificados por cuantización. Cualquier evaluación de calidad debe contrastarse con el modelo original de Liquid AI.
- Los pesos han sido recuantizados con un método de familia GPTQ (Hessiana) y no con `llama-quantize`; los tipos son nominalmente idénticos, pero los valores difieren de las cuantizaciones estándar. No se publican métricas de degradación.
- La build `-hq1` cuantiza todos los tensores, incluidos los de bloque, por lo que previsiblemente pierde más calidad que `-hq`; el autor no cuantifica esa diferencia.
- Licencia LFM Open License v1.0: es una licencia propia con condiciones, no una licencia de código abierto permisiva. Hay que revisar el texto (`LICENSE`) antes de un uso comercial; en esta ficha no se valida su compatibilidad con productos comerciales.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés ni de un conjunto concreto de lenguas.
- Riesgo de alucinación inherente a un modelo de 2,6B parámetros; sin benchmarks publicados no es posible acotarlo.
- El modo de razonamiento siempre activo incrementa el número de tokens generados y la latencia frente a modelos que solo razonan bajo demanda.
- Discrepancia en la longitud de contexto entre fuentes (131K frente a 4.096); conviene verificar la configuración real del modelo base antes de disenar prompts largos.
- Sesgos: no documentados en la información disponible.
- El repositorio pesa 147,8 GB; descargarlo completo es caro en ancho de banda y disco. Verificar los SHA-256 de `records/` tras la descarga.
- 0 likes y ausencia de model card estándar en el repositorio: menor trazabilidad y soporte que el repositorio oficial.
- Despliegue limitado en la práctica a llama.cpp y derivados; otros motores de inferencia (vLLM, TGI) no consumen asignaciones de tipo por tensor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Arki05/LFM2.5-2.6B-GGUF-shards
- Revisión inicial del almacén (`fe50613`): https://huggingface.co/Arki05/LFM2.5-2.6B-GGUF-shards/tree/fe506130cd4304ec5991b7e1ca129fbd96f3a4f4
- GGUF preensamblados del mismo autor: https://huggingface.co/Arki05/LFM2.5-2.6B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Herramienta `qalloc`: https://arki05.com/projects/qalloc/
- Documentación de Liquid AI para LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Ficha en Free2AITools: https://free2aitools.com/model/arki05/lfm2.5-2.6b-gguf
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/lfm2-5-2-6b.html
