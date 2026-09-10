# Edge0/Edge0-8B-A1B-preview

## Resumen

Edge0-8B-A1B-preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Edge0, distribuido como una release preliminar (preview) de su pipeline de inferencia en streaming. Está construido sobre el modelo base inclusionAI/Ling-3.0-tiny-base, una arquitectura híbrida "bailing" con atención MLA (Multi-head Latent Attention) y capas MoE, con 24 capas, un tamaño oculto de 1536 y 128 expertos de los cuales se activan 8 por token (K=8). El checkpoint suma 7.923.998.112 parámetros totales (≈7,9B) y aproximadamente 1,2B parámetros activos por token, con una ventana de contexto de 128k tokens.

Su propuesta diferencial no es el rendimiento bruto, sino el consumo de memoria: mediante el framework edge0 (backend MLX), los pesos de los expertos permanecen en almacenamiento y se transmiten bajo demanda, de forma que solo el conjunto activo reside en RAM. El autor reporta un pico de memoria activa de 1,0 GiB con el checkpoint cuantizado a 4 bits, sin sharding ni descarga previa de todos los pesos a memoria, y una velocidad de decodificación de 23,9 a 25,3 tokens por segundo en un Mac mini M4 Pro de 24 GB.

Es relevante ahora porque ataca un cuello de botella concreto de la inferencia en el borde: servir un modelo de clase 8B en hardware con poca VRAM o poca RAM, apoyándose en almacenamiento rápido (NVMe o flash interno) como extensión de la jerarquía de memoria. La release incluye el checkpoint base más adaptadores LoRA (`lora_edge0_8b.safetensors`) y un cabezal prerouter (`prerouter_edge0_8b.safetensors`) que predice el enrutado de expertos con un paso de antelación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso híbrido, base "bailing hybrid" con MLA (Multi-head Latent Attention) + MoE |
| Parametros totales | 7.923.998.112 (≈7,9B) |
| Parametros activos | ≈1,2B por token (128 expertos totales, 8 activos, K=8) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | int4 (4 bits); el repo se distribuye ya cuantizado, con adaptadores LoRA y prerouter sin fusionar |
| Idiomas soportados | no disponible (el autor indica que el modelo esta ajustado principalmente para los idiomas del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint base + adaptadores LoRA y prerouter); libreria `mlx`; requiere `custom_code` |
| Capas | 24 |
| Tamano oculto | 1536 |
| Modo thinking | Si, activable mediante la plantilla de chat incluida |
| Modelo base | inclusionAI/Ling-3.0-tiny-base |
| Framework de inferencia | edge0 (backend MLX) |
| Tamano del repositorio | 4,6 GB |
| Descargas / likes | 332 / 12 |
| Fecha de creacion / actualizacion | 2026-09-08 / 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso construido sobre Ling 3.0 tiny, descrito en la model card como "bailing hybrid, MLA + MoE". Consta de 24 capas, tamano oculto 1536 y 128 expertos, de los que se enrutan 8 por token (K=8), lo que da aproximadamente 1,2B parametros activos sobre un total de 7,9B. La atención emplea MLA (Multi-head Latent Attention), un mecanismo orientado a comprimir la caché KV respecto a la atención multi-cabeza estándar.

El pipeline de edge0 añade tres mecanismos. Primero, offload de expertos a SSD: los pesos de los expertos se transmiten desde almacenamiento bajo demanda, solo los enrutados, de modo que la RAM retiene unicamente el conjunto activo y el pico de memoria queda acotado por el ancho enrutado y no por el numero de parametros. Segundo, un prerouter: un cabezal entrenado que predice el enrutado de expertos con un paso de antelación, de forma que las cargas de expertos se solapan con el forward pass en lugar de bloquearlo; el autor reporta hasta un +59% de throughput de decodificacion, con ganancia creciente segun la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K. Tercero, Recover-LoRA: la base int4 se congela y se entrenan adaptadores LoRA por destilacion desde el profesor en fp16, recuperando la mayor parte de la perdida de cuantizacion a 4 bits.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO sobre el modelo base. Los adaptadores LoRA y prerouter se distribuyen sin fusionar (un unico checkpoint base de solo lectura sirve a varios conjuntos de adaptadores) y se cargan automaticamente al usar el framework edge0.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo thinking, activable desde la plantilla de chat incluida.
- Razonamiento matematico y cientifico de nivel competitivo: el autor reporta 63,3 en AIME 2026 y 70,7 en GPQA-Diamond con la version int4.
- Generacion de codigo: 91,5 en HumanEval con la version int4.
- Seguimiento de instrucciones: 53,9 en IFBench con la version int4.
- Conocimiento general y multitematico: 70,1 en MMLU-Pro con la version int4, por encima del base en fp16 (65,8).
- Capacidades multilingues: no disponibles de forma explicita; el autor remite a los idiomas del modelo base.
- Tool calling / function calling: no soportado en esta preview. La propia model card indica que el modelo no esta optimizado para tareas agenticas.
- Agentes y razonamiento multi-paso: debilidad reconocida en esta preview; se anuncia refuerzo en la release completa.
- Servido como API compatible con OpenAI mediante `edge0 serve`, lo que habilita integracion en clientes existentes.

## Casos de uso

- Inferencia en dispositivo con VRAM escasa: el checkpoint completo permanece en almacenamiento y solo se transmiten los expertos enrutados, con un pico de memoria activa de 1,0 GiB. Es adecuado para portatiles, mini-PC o dispositivos con almacenamiento NVMe rapido pero RAM limitada.
- Asistente conversacional local en Apple Silicon: con 23,9-25,3 tok/s de decodificacion en un Mac mini M4 Pro de 24 GB mediante el backend MLX, permite chat interactivo sin conexion ni envio de datos a terceros.
- Razonamiento matematico asistido sin GPU dedicada: los 63,3 puntos en AIME 2026 y 70,7 en GPQA-Diamond permiten usarlo como asistente de resolucion de problemas tecnicos en estaciones de trabajo modestas.
- Generacion y revision de codigo en entornos locales: 91,5 en HumanEval posibilita autocompletado, explicacion y refactorizacion de fragmentos integrados en un editor, siempre en local y con licencia Apache 2.0.
- Servicio por lotes en una unica maquina commodity: un solo checkpoint base de solo lectura puede servir varios conjuntos de adaptadores LoRA sin recuantizar, lo que abarata el mantenimiento de multiples variantes especializadas.
- Despliegue como API interna compatible con OpenAI: `edge0 serve --name edge0-8b --port 8083` expone un endpoint HTTP que se puede conectar a clientes y orquestadores ya existentes sin cambios de codigo en el cliente.
- Procesamiento de documentos largos con contexto de 128k tokens: util para resumir o consultar documentacion extensa, asumiendo el coste creciente de la cache KV (≈3,3 GiB con 3,3k tokens).
- Chat multilingue con modo thinking: la plantilla de chat incluida permite activar el razonamiento explicito para tareas de analisis, con la salvedad de que el autor no detalla la lista de idiomas soportados.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con OpenCompass bajo ajustes identicos para ambos modelos (max 100):

| Benchmark | edge0-8b (int4) | Ling 3.0 tiny (fp16) |
|---|---:|---:|
| AIME 2026 | 63,3 | 73,3 |
| HumanEval | 91,5 | 92,7 |
| GPQA-Diamond | 70,7 | 71,2 |
| MMLU-Pro | 70,1 | 65,8 |
| IFBench | 53,9 | 60,6 |
| **Media** | **69,9** | **72,7** |

Metricas de rendimiento medidas por el autor con `examples/bench.py` en un Mac mini M4 Pro de 24 GB:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | 23,9-25,3 tok/s |
| Throughput de prefill (frio / caliente) | 500 / 1428 tok/s |
| Pico de memoria activa (contextos cortos) | 1,0 GiB |
| Cache KV a 3,3k tokens | ≈3,3 GiB |
| Ganancia del prerouter en decodificacion | hasta +59% |

Los pesos de los expertos se transmiten desde SSD bajo demanda y no son residentes en memoria. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria activa: 1,0 GiB de pico con contextos cortos, segun medicion del autor en Mac mini M4 Pro de 24 GB. Los pesos de expertos no residen en RAM, de modo que el requisito no escala con los 7,9B de parametros totales.
- Cache KV: anade ≈3,3 GiB a 3,3k tokens. Para mantener el pico en 1 GiB hay que usar contextos cortos; el consumo crece con la longitud de contexto.
- Almacenamiento: requisito critico. Se necesita almacenamiento rapido (NVMe o flash interno) porque los expertos se transmiten bajo demanda; la ganancia del prerouter aumenta con la latencia del almacenamiento, lo que indica que un disco lento degrada la decodificacion de forma notable.
- GPU compatibles: el backend MLX apunta actualmente a Apple Silicon. La medicion publicada es sobre Mac mini M4 Pro. No se documentan GPU NVIDIA (A100, H100, RTX 4090) ni CUDA en esta release; otros backends estan en la hoja de ruta del proyecto.
- Cabe en hardware de consumo: si, en el sentido inverso al habitual. No requiere VRAM de GPU dedicada; el limite practico es RAM activa (1 GiB) mas almacenamiento rapido y una GPU unificada de Apple Silicon.
- Opciones de despliegue: framework edge0 con backend MLX (`edge0 chat`, `edge0 serve`); API HTTP compatible con OpenAI en el puerto 8083. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el repositorio no incluye pesos GGUF.
- Latencia y throughput: 23,9-25,3 tok/s de decodificacion (equivalente aproximado a 40-42 ms por token, valor derivado de la tasa publicada); prefill de 500 tok/s en frio y 1428 tok/s en caliente. No se publican cifras de latencia extremo a extremo ni de throughput en lote.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables (los unicos resultados obtenidos trataban sobre AutoCAD y formatos DWF, sin relacion con el tema). Por tanto, la comparativa se limita a los datos presentes en la model card.

| Modelo | Parametros | Activos | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Edge0-8B-A1B-preview | 7,9B | ≈1,2B | 128k | Apache 2.0 | Media 69,9 (AIME 63,3; HumanEval 91,5; MMLU-Pro 70,1) | HuggingFace, framework edge0 (MLX) |
| Ling 3.0 tiny (fp16) | ≈7,9B | no disponible | 128k (heredado) | no disponible en la informacion proporcionada | Media 72,7 (AIME 73,3; HumanEval 92,7; MMLU-Pro 65,8) | HuggingFace (inclusionAI) |
| Edge0-35B-A3B-preview | no disponible | no disponible | no disponible | Apache 2.0 (referenciado) | no disponible | HuggingFace (misma familia) |

Para el resto de alternativas de la categoria (MoE dispersos de clase 8B con activacion en el rango de 1B-3B), no hay datos verificables en la informacion disponible.

## Limitaciones y advertencias

- Release preliminar (preview): el propio autor advierte que la cobertura y la calidad siguen en desarrollo.
- Capacidad agentica debil: el uso de herramientas, la planificacion multi-paso y la autonomia de horizonte largo no estan optimizados en esta version; se anuncia mejora en la release completa.
- Degradacion por cuantizacion: int4 se situa 2,8 puntos por debajo del base fp16 de media. Las mayores perdidas se dan en AIME 2026 (-10,0), IFBench (-6,7) y HumanEval (-1,2).
- Idiomas: no se publica la lista de idiomas soportados; el modelo esta ajustado principalmente para los idiomas del modelo base, por lo que no se puede garantizar calidad fuera de ellos.
- Cache KV creciente: ≈3,3 GiB a 3,3k tokens. Usar los 128k de contexto declarados implica un consumo de memoria muy superior al GiB de los contextos cortos y puede invalidar la ventaja de memoria del diseno.
- Dependencia del almacenamiento: el rendimiento depende de la latencia del SSD o flash. En almacenamiento lento la decodificacion puede degradarse, ya que el prerouter solo solapa la carga, no la elimina.
- Plataforma: el backend MLX limita actualmente el despliegue a Apple Silicon. No hay soporte documentado para CUDA ni ROCm en esta release.
- Riesgo de alucinacion: inherente a un modelo de 7,9B totales y ≈1,2B activos; no se publican evaluaciones de factualidad ni de tasas de alucinacion.
- Sesgos: no se documenta ningun analisis de sesgos, composicion del dataset de entrenamiento ni proceso de alineacion (RLHF/DPO), por lo que no es posible evaluar este punto.
- Adaptadores no fusionados: el repositorio depende de `custom_code` y del framework edge0 para cargar correctamente los adaptadores LoRA y prerouter; no es un checkpoint autonomo para otras herramientas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-3.0-tiny-base, cuyos terminos no se detallan en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edge0/Edge0-8B-A1B-preview
- Repositorio GitHub del framework edge0: https://github.com/Edge0-AI/edge0
- Licencia Apache 2.0 del proyecto: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Modelo de la misma familia: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Video de demostracion (enlazado desde la model card): https://huggingface.co/Edge0/Edge0-35B-A3B-preview/resolve/main/20260910-105854.mp4
- OpenCompass, herramienta de evaluacion mencionada: https://github.com/open-compass/opencompass

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos estaban relacionados con AutoCAD y formatos DWF, sin conexion con el contenido de esta ficha.
