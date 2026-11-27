# madebywest/maple-pro

## Resumen

Maple Pro es un ajuste fino del modelo base Maple (deepgrove/maple-preview, licencia MIT), un transformer de mezcla de expertos (MoE) de 20.214.030.336 parametros totales con aproximadamente 1000 millones de parametros activos por token. El autor, madebywest, lo distribuye como un unico fichero GGUF de 6,6 GB con pesos ternarios (TQ2_0) en los expertos y atencion en F16, optimizado para Apple Silicon. Sobre el modelo base se ha aplicado una campana de destilacion on-policy y DPO (optimizacion directa de preferencias) con 1129 pares, orientada a mejorar el seguimiento estricto de instrucciones.

El modelo resuelve un problema concreto: mejorar la adherencia a instrucciones estrictas del base sin degradar sus niveles medidos de matematicas y codigo. La comparacion head-to-head contra el base original, con layout GGUF, runtime y harness identicos, muestra una mejora de +1 eje en una bateria de 12 ejes de instrucciones (11/12 frente a 10/12), manteniendo GSM8K en 335/400 (83,8 %) y HumanEval en 124/164 (75,6 %), este ultimo dentro del ruido de muestreo.

Es relevante ahora por su combinacion de tamano efectivo (~1B activo), contexto nativo de 128K ampliable a 256K sin flags de rope-scaling, y un formato ternario que permite ejecutarlo en un solo fichero de 6,6 GB. La contrapartida es una dependencia fuerte del runtime: el tipo ternario TQ2_0 solo tiene kernels estables en Metal y CPU, lo que condiciona su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (sliding window attention en 18 de 24 capas, ventana 512) |
| Parametros totales | 20.214.030.336 |
| Parametros activos | ~1B (aproximadamente 1000 millones) |
| Longitud de contexto | 128K nativo; metadatos GGUF permiten 256K (verificado sin flags) |
| Tipos de cuantizacion | Ternario TQ2_0 en expertos y atencion de capas 0-7; F16 en proyecciones de atencion; fichero unico GGUF de 6,6 GB |
| Idiomas soportados | No disponible (la model card menciona pruebas multilingues IT/ES) |
| Licencia | MIT |
| Formato de pesos | GGUF (un unico fichero, 291 tensores) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 20B con aproximadamente 1B de parametros activos y 72 expertos, con atencion hibrida: 18 de las 24 capas usan sliding window attention con ventana de 512, lo que permite extrapolar el contexto x2 de forma nativa hasta 256K sin rope-scaling. Los pesos de los expertos son ternarios (TQ2_0), lo que reduce drasticamente el espacio ocupado a costa de depender de kernels especificos.

El ajuste fino consistio en una receta one-shot: SFT de 2500 iteraciones (66 % de sobremuestreo en matematicas, curriculum de coding v1 con 4193 ejemplos BON y correcciones del teacher) seguida de DPO con 1129 pares de preferencia, con destilacion on-policy. Se fusionaron 64 tensores LoRA de atencion y 121 tensores base actualizados por DPO (normas, routers de expertos, QK-norms) en un unico GGUF. Las proyecciones de atencion se almacenan en F16 (precision mixta), salvo las capas 0-7 que conservan la atencion ternaria del base; los pesos de los expertos ternarios son byte-identicos al base oficial (72/72 tensores MD5 identicos).

## Capacidades

- Generacion de texto conversacional y razonamiento general.
- Matematicas: GSM8K con 83,8 % de acierto en modo greedy.
- Codigo: HumanEval pass@1 del 75,6 % (124/164) a temperatura 0,2; record de 129/164 en otra ejecucion.
- Seguimiento estricto de instrucciones: pasa la prueba "responde con exactamente 3 palabras", que el base falla.
- Formato de tool-call: paridad con el base segun la bateria de 12 ejes.
- Capacidades multilingues IT/ES: paridad con el base en la bateria de evaluacion.
- Contexto largo: recall de 5 agujas de 4/5 a 256K nativo (3/5 en el rango 16K-131K).
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el fichero unico de 6,6 GB con ~1B activo se ejecuta en LM Studio sobre Metal con latencia baja, adecuado para prototipos y uso personal en un Mac.
- Procesamiento de documentos largos: con 256K de contexto nativo verificado, puede resumir o extraer informacion de contratos, informes o bases de codigo extensas sin trocear, ajustando el slider de contexto en LM Studio.
- Generacion de codigo asistida: con HumanEval del 75,6 % y soporte de formato tool-call, sirve para autocompletado y generacion de funciones en entornos de desarrollo locales donde no se quiere enviar codigo a la nube.
- Razonamiento matematico en pipelines educativos: GSM8K del 83,8 % en greedy permite resolver problemas aritmeticos de varios pasos de forma reproducible, util para generar soluciones paso a paso.
- Evaluacion de seguimiento de instrucciones: su mejora medida en el gate de 12 ejes lo hace util como modelo de referencia para comparar tecnicas de alineamiento en experimentos de DPO y destilacion.
- Despliegue en CPU sin GPU: al ser correcto en CPU en cualquier sistema operativo, puede servirse con llama-server en servidores sin acelerador, aceptando menor throughput a cambio de compatibilidad.
- Experimentacion con cuantizacion ternaria: sirve como banco de pruebas para estudiar el comportamiento de kernels TQ2_0 y la precision mixta en arquitecturas MoE.

## Benchmarks y rendimiento

Comparacion head-to-head contra el base stock, misma maquina, mismo runtime (llama.cpp 2.69.0, Apple Metal) y mismo harness:

| Suite | Base Maple | Maple Pro |
|---|---|---|
| Gate de instrucciones (12 ejes) | 10/12 | 11/12 |
| GSM8K (400 problemas, greedy) | 335 (83,8 %) | 335 (83,8 %) |
| HumanEval pass@1 (164, temp 0,2) | 132 (80,5 %) | 124 (75,6 %) |

Recall de contexto largo (5 agujas, wikitext-2, profundidades 10/30/50/70/90 %):

| Contexto | Modo | Recall |
|---|---|---|
| 16K-131K | nativo | 3/5 |
| 256K | nativo (sin flags) | 4/5 |
| 256K | YaRN x2 | 4/5 |
| 384K | YaRN x3 | 2/5 (falla) |

La diferencia en HumanEval esta dentro del ruido de muestreo (±5 problemas por ejecucion); el record de esta build es 129/164. No se han publicado resultados de benchmarks adicionales (MMLU, MMLU-Pro u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 6,6 GB; la cache KV a 256K anade aproximadamente 3,3 GB, por lo que el contexto completo requiere en torno a 10 GB.
- Apple Silicon: via principal de despliegue; Metal implementa los matmuls ternarios TQ2_0 y esta verificado de extremo a extremo en LM Studio.
- CPU: correcto en cualquier sistema operativo con llama.cpp; recomendable con GPU offload a 0 si se usa Windows o Linux.
- GPU CUDA/Vulkan: los kernels ternarios son experimentales y pueden producir logits basura y respuestas vacias (EOS inmediato); no recomendado en produccion con esas plataformas.
- GPU con menos de 16 GB de VRAM: reducir la longitud de contexto para evitar problemas de memoria.
- Despliegue: LM Studio (runtime ≥ 2.55), llama.cpp mainline desde v0.4.1 (solo CPU) o el fork de DeepGrove (Apache-2.0) compilado con `llama-server` y `--cpu-moe --no-op-offload`.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Maple Pro | 20,2B totales / ~1B activos | 128K nativo, 256K GGUF | 75,6 % (124/164) | 83,8 % | MIT | GGUF ternario |
| Maple (base stock) | 20,2B totales / ~1B activos | 128K nativo, 256K GGUF | 80,5 % (132/164) | 83,8 % | MIT | GGUF ternario |
| Otros modelos de ~20B MoE | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada es contra el propio base, con layout y runtime identicos; no se aportan datos frente a modelos de otros autores.

## Limitaciones y advertencias

- Dependencia de runtime: el tipo ternario TQ2_0 no tiene kernels GPU estables fuera de Metal; en CUDA/Vulkan el modelo puede devolver respuestas vacias. Es un problema de kernel, no del modelo.
- Contexto: 384K falla (recall 2/5); el recall a 256K es 4/5 con confusiones de vinculacion entre agujas de forma similar, uniformes en todas las longitudes.
- Codigo: el resultado de HumanEval es inferior al del base en la ejecucion reportada (124 frente a 132), aunque dentro del ruido; no debe interpretarse como mejora en coding.
- Idiomas: no se detalla la lista completa de idiomas soportados; solo se verifica paridad en pruebas IT/ES.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas de sesgo ni de tasas de alucinacion en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el modelo base y el fork de llama.cpp tienen sus propias condiciones (el fork es Apache-2.0); conviene revisar la cadena completa de licencias antes de produccion.
- Build unica: solo se distribuye `maple-pro.gguf` (build c7); la v1 original no esta subida y solo existe como backup local del autor.
- Reproducibilidad: las cifras de HumanEval varian ±5 problemas entre ejecuciones; GSM8K es casi determinista (±1 problema).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madebywest/maple-pro
- Modelo base: https://huggingface.co/deepgrove/maple-preview
- Fork de llama.cpp de DeepGrove: https://github.com/deepgrove-ai/llama.cpp
