# jcbtc/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151

## Resumen

Inkling 2 Mini · CIRU Halo Agent (gfx1151) es una distribución optimizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, empaquetada por el usuario jcbtc para su ejecución local sobre hardware AMD Strix Halo (APU Ryzen AI Max+ 395 con GPU integrada Radeon 8060S, arquitectura RDNA 3.5, target `gfx1151`). No se trata de un modelo nuevo: los pesos derivan del checkpoint base `thinkingmachines/Inkling-2-Mini`, cuantizado a 8 bits con NVIDIA ModelOpt y publicado en formato safetensors con 26.388.646.440 parámetros totales (unos 22,8 GB de repositorio).

El valor diferencial de esta ficha no está en el modelo sino en el runtime que lo acompaña: una pila de inferencia basada en vLLM con backend ROCm/HIP nativo, kernels compilados específicamente para `gfx1151` y decodificación especulativa DFlash 2 con borrador `incoai/Inkling-2-Mini-DFlash2`. El autor reporta 81,1 tok/s en decodificación B=1 con temperatura 1,0, 220–243 tok/s en B=8 y prefill de 1.499–1.511 tok/s a 128K de contexto, además de recuperación exacta de aguja en 128K.

Es relevante ahora porque demuestra que un modelo multimodal de ~26B puede servirse con contexto de 1.048.576 tokens y tool calling nativo sobre una APU de consumo con 128 GB de memoria unificada, sin GPU discreta y sin `hipcc` en tiempo de ejecución. Para desarrolladores que trabajan con hardware AMD o que quieren prototipar agentes de contexto largo en local, es una referencia práctica poco habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas MoE; runtime con atención sliding-window y decodificación especulativa DFlash 2 |
| Parametros totales | 26.388.646.440 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por defecto en configuración de 128 GB; atención sliding-window de 2.048 tokens en el borrador |
| Tipos de cuantizacion | 8 bits (modelopt); pesos W6 WMMA para el borrador DFlash 2; BF16 para capas `fc` del borrador |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 22,8 GB) |

## Arquitectura y entrenamiento

Los pesos corresponden al modelo base Inkling 2 Mini de Thinking Machines Lab, del que esta ficha no documenta detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO): esa información no está disponible en el material proporcionado. Lo que sí se describe con precisión es la arquitectura del runtime: un transformer multimodal con capas MoE (el autor menciona un router HIP fusionado para `M = 1..64` con paridad top-8) y atención con ventana deslizante, servido mediante vLLM con backend ROCm.

La innovación técnica principal es la pila CIRU: 299 kernels HIP nativos compilados para `gfx1151` con cero spills de VGPR/SGPR/Scratch, atención flash split-KV con direccionamiento de KV paginado en `int64_t` (preparado para 1M de tokens) y decodificación especulativa DFlash 2 con muestreo probabilístico sin pérdida (`draft_sample_method="probabilistic"`, `selector_softcap_mode="after_correction"` con `30.0 * tanh(scores / 30.0)`, enmascaramiento de vocabulario sin padding sobre 200.058 entradas). El borrador de 5 capas se cuantiza a W6 WMMA (740 MB → 278 MB en las 20 capas lineales del backbone), reduciendo su tiempo de GPU de ~14,3 ms a 4,48 ms en B=1, con una tasa de aceptación de ~3,9–4,0 tokens por paso a temperatura 1,0.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline `image-text-to-text`, acepta entradas de texto e imagen a través de una API compatible con OpenAI.
- Streaming de razonamiento: el runtime expone el razonamiento del modelo en streaming.
- Tool calling nativo: soporte de function calling integrado en el servidor.
- Caché de prefijo: habilitada por defecto, con cero impactos de caché en las mediciones de prefill reportadas.
- Contexto largo: ventana por defecto de 1.048.576 tokens, con recuperación exacta de aguja al 100% en 128K.
- Decodificación especulativa: modo `--dflash2` opcional con borrador DFlash 2 y aceleración WMMA nativa en RDNA 3.5.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de contexto largo en local: con 1.048.576 tokens de ventana y recuperación exacta a 128K, el modelo puede mantener el estado completo de un repositorio, un corpus documental o una sesión de trabajo prolongada sin truncar, sobre una única APU de 128 GB.
- Asistencia sobre documentación técnica con imágenes: al ser image-text-to-text, permite consultar diagramas de arquitectura, capturas de paneles o esquemas junto con texto en la misma conversación.
- Automatización con tool calling: la API compatible con OpenAI y el soporte nativo de function calling permiten integrarlo en pipelines de agentes que invocan APIs externas, bases de datos o scripts.
- Procesamiento por lotes de alto rendimiento: con 220–243 tok/s en B=8 y 246–296 tok/s en JSON exacto con B=8, es adecuado para tareas de extracción estructurada y clasificación a escala en hardware de consumo.
- Prototipado y evaluación de modelos multimodales sin GPU discreta: útil para equipos que quieren validar flujos de agentes multimodales en estaciones de trabajo AMD antes de escalar a clústeres.
- Investigación en decodificación especulativa: el runtime expone `--dflash2` con borrador intercambiable, lo que permite medir tasas de aceptación y latencia con distintos borradores sobre el mismo target.
- Servicio de chat multi-turno con arranque en frío rápido: 65 s de arranque en frío con caché vacía (3,5× más rápido que la versión anterior) y consumo en reposo de ~0,5–1,4% de un núcleo de CPU lo hacen viable como servicio persistente en una estación local.

## Benchmarks y rendimiento

Datos reportados por el autor del runtime sobre AMD Ryzen AI Max+ 395 / Radeon 8060S (`gfx1151`, 128 GB de memoria unificada):

| Metrica | v1.5.0 | v1.6.0 | Mejora |
|---|---|---|---|
| Decodificacion B=1, T=1.0 | no disponible | 81,1 tok/s | +38,3% vs v1.5.0 |
| Decodificacion B=1 greedy | no disponible | 79,7 tok/s | +32,6% vs v1.5.0 |
| Decodificacion en matematicas | no disponible | 119,5 tok/s | no disponible |
| Decodificacion B=8, T=1.0 | no disponible | 220–243 tok/s | +24,4% vs v1.5.0 |
| Decodificacion sostenida 128K (`512t`) | no disponible | 41,0 tok/s | +10,4% vs v1.5.0 |
| Prefill 128K | no disponible | 1.499–1.511 tok/s | sin regresion |
| Prefill 4K (servidor) | 2.421,9 tok/s | no disponible | +56% vs v1.3.1 |
| Prefill 8K (servidor) | 2.368,0 tok/s | no disponible | no disponible |
| Prefill 32K (servidor) | 2.117,8 tok/s | no disponible | no disponible |
| Prefill 58K (servidor) | 1.915,5 tok/s | no disponible | no disponible |
| Decodificacion 128K (servidor) | 50,2 tok/s | no disponible | +41,1% vs version anterior |
| Decodificacion 128K (cliente) | 46,8 tok/s | no disponible | +38,6% vs version anterior |
| Arranque en frio | 65 s | no disponible | 3,5× vs v1.4.0 (230 s+) |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores miden rendimiento del runtime, no calidad.

## Requisitos de hardware

- VRAM/memoria: el repo pesa 22,8 GB en safetensors de 8 bits; las mediciones se hicieron con 128 GB de memoria unificada, y el contexto por defecto de 1.048.576 tokens asume esa configuración.
- GPU objetivo: AMD Radeon 8060S integrada en Ryzen AI Max+ 395, target `gfx1151` (RDNA 3.5). Los kernels HIP están compilados específicamente para esa arquitectura.
- GPU NVIDIA: no soportado por esta distribución; el runtime es ROCm/HIP nativo.
- GPU de consumo: sí, en el sentido de APU de consumo, pero no en tarjetas gráficas discretas de consumo convencionales; requiere una plataforma Strix Halo con memoria unificada grande.
- Despliegue: vLLM con backend ROCm, servidor compatible con OpenAI; el autor menciona `serve.sh` como lanzador por defecto y `--dflash2 PATH` para activar la decodificación especulativa. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el borrador DFlash 2 consume 4,48 ms de GPU en B=1 (9,82 ms en B=8).
- Consumo en reposo: ~0,5–1,4% de un núcleo de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini · CIRU Halo Agent (gfx1151) | 26,4B | 1.048.576 | apache-2.0 | AMD Strix Halo (`gfx1151`) | Runtime HIP nativo con DFlash 2; 81,1 tok/s B=1 |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Checkpoint original; sin optimizaciones CIRU |
| incoai/Inkling-2-Mini-DFlash2 | no disponible | no disponible | no disponible | no disponible | Borrador especulativo de 5 capas para el target |
| Alternativas de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks de calidad para comparar |

La comparación se limita al ecosistema del propio modelo porque la información proporcionada no incluye benchmarks de calidad ni especificaciones de modelos rivales que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluación de sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en producción.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Especificidad de hardware: los kernels HIP están compilados para `gfx1151`; en otras GPU AMD o NVIDIA el runtime no funcionará sin recompilación o no está soportado.
- Naturaleza del artefacto: es una distribución de inferencia, no un modelo nuevo; la calidad depende enteramente de `thinkingmachines/Inkling-2-Mini`, cuyos detalles de entrenamiento no se documentan aquí.
- Cifras de rendimiento: proceden del autor y de una única configuración de hardware; no son reproducibles de forma independiente con los datos disponibles.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del borrador DFlash 2 por separado antes de desplegar.
- Memoria: el contexto de 1M tokens requiere 128 GB de memoria unificada; en configuraciones menores habrá que reducir la ventana.
- Madurez: el proyecto está en versiones 1.x con cambios frecuentes de kernels y flags; la API y el rendimiento pueden variar entre releases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Borrador especulativo DFlash 2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Release v1.6.0: https://github.com/ciru-ai/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151/releases/tag/v1.6.0
- Repositorio del runtime: https://github.com/ciru-ai/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151
