# Jeesup/svd-safety-mistral_remove30_swapgapiter_evfront_b010

## Resumen

`Jeesup/svd-safety-mistral_remove30_swapgapiter_evfront_b010` es un artefacto de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`. El autor (Jeesup) aplica primero una compresión SVD-LLM que elimina el 30,01 % de los parámetros (fracción resultante declarada: 0,6999) y después edita el checkpoint con 10 rondas iterativas de un procedimiento de intercambio de componentes «parameter-neutral», regido por la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos (0,100 % por ronda).

El objetivo declarado no es ofrecer un asistente de propósito general, sino medir cómo la compresión SVD degrada el comportamiento de seguridad del modelo base y qué regla de selección de componentes repara mejor ese daño. Se trata de una celda concreta de una rejilla experimental que barre reglas de selección y presupuestos; el propio autor advierte que varias celdas del grid están deliberadamente degradadas en seguridad respecto al modelo original.

El checkpoint resultante tiene 7.241.732.096 parámetros en formato safetensors (repositorio de 14,5 GB), licencia Apache 2.0, y registra valores medidos de ASR en AdvBench (0,1365) y StrongREJECT (0,2300), sobre-rechazo macro medido con WildGuard (0,0878) y perplejidad de 9,2820 en WikiText-2. Con cero descargas y cero «likes» en el momento de la consulta, es un recurso pensado para reproducibilidad y auditoría metodológica, no para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2: atención con GQA, sliding window attention de 4096 tokens y RoPE, según la documentación del modelo base) |
| Parametros totales | 7.241.732.096 (recuento de tensores safetensors del repositorio); el autor declara una fracción de parámetros resultante de 0,6999 tras la compresión |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Mistral-7B-Instruct-v0.2; no se documenta ninguna modificación en este checkpoint |
| Tipos de cuantizacion | no disponible: el repositorio solo distribuye pesos safetensors (~14,5 GB, coherente con fp16/bf16). No se publican variantes GPTQ, AWQ, GGUF ni EXL2 |
| Idiomas soportados | no disponible: el campo de idiomas del repositorio está vacío. El modelo base está orientado principalmente a inglés y código, con capacidades multilingües no cuantificadas oficialmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La base es `mistralai/Mistral-7B-Instruct-v0.2`, un transformer decoder-only de 7.241.732.096 parámetros con Grouped-Query Attention, sliding window attention de 4096 tokens (ventana de contexto efectiva de 32.768 tokens), embeddings rotatorios (RoPE) y activación SwiGLU. Sobre ese checkpoint, el autor aplica compresión SVD-LLM, que descompone en rango reducido las matrices de proyección y elimina el 30,01 % de los parámetros, dejando la fracción densa declarada en 0,6999.

Sobre el modelo comprimido se ejecuta el procedimiento que da nombre al checkpoint: 10 de 10 rondas iterativas de intercambio de componentes «parameter-neutral», con la regla de selección `gap_iter`, semilla 42 y un presupuesto total de restauración del 1,000 % de los parámetros densos, aplicado en fragmentos del 0,100 % por ronda. En total se restauran 9.307 componentes y se expulsan 4.983, con 69.747.712 parámetros insertados (1,00 % de los parámetros de proyección densos). El valor de intercambio es `insert` (solo valor de inserción, con expulsión ordenada por sigma). No se documenta en la información disponible ningún entrenamiento adicional, RLHF, DPO ni ajuste supervisado posterior a la edición.

## Capacidades

- Generación de texto conversacional e instrucciones: hereda el comportamiento de `Mistral-7B-Instruct-v0.2`, aunque el autor no publica evaluaciones de calidad de generación más allá de la perplejidad en WikiText-2 (9,2820).
- Razonamiento y código: capacidades propias del modelo base, sin métricas específicas en esta ficha.
- Multilingüismo: no documentado en el repositorio (campo de idiomas vacío).
- Tool calling / function calling: no disponible; el modelo base Mistral-7B-Instruct-v0.2 no incorpora soporte nativo de function calling (esta función llegó con la familia v0.3).
- Soporte de agentes y razonamiento multi-paso: no documentado y desaconsejado por el propio autor, que describe el checkpoint como sujeto experimental y no como asistente desplegable.
- Capacidad especial relevante: sirve como sujeto de medida de seguridad bajo compresión, con métricas de tasa de éxito de ataque (ASR) y de sobre-rechazo publicadas.
- No se documentan capacidades de visión, audio ni modo «thinking».

## Casos de uso

- Investigación sobre seguridad en modelos comprimidos: comparar el ASR de este checkpoint (0,1365 en AdvBench, 0,2300 en StrongREJECT) con el del modelo base sin comprimir y con otras celdas de la rejilla para cuantificar cuánto daño introduce la compresión SVD-LLM.
- Estudios de ablación de reglas de selección: la variable `gap_iter` frente a otras reglas del grid permite aislar qué criterio de selección de componentes recupera mejor el comportamiento de rechazo con el mismo presupuesto del 1 %.
- Interpretabilidad de mecanismos de seguridad: los 9.307 componentes restaurados y los 4.983 expulsados constituyen un conjunto concreto de candidatos para analizar qué pesos sostienen el comportamiento de rechazo.
- Evaluación de arneses de red-teaming: el checkpoint puede actuar como sujeto de prueba en pipelines que integren HarmBench como juez, StrongREJECT y WildGuard, verificando la sensibilidad de estos evaluadores a artefactos comprimidos.
- Análisis del equilibrio seguridad-utilidad: la pareja de métricas ASR y perplejidad WikiText-2 (9,2820) permite estudiar la frontera de compromiso entre robustez frente a ataques y calidad de modelado del lenguaje.
- Reproducción metodológica: la semilla 42, las 10 rondas y los recuentos exactos de componentes facilitan la replicación del experimento y la auditoría de sus resultados.
- Estudio del sobre-rechazo: con un valor macro de 0,0878 medido por WildGuard, sirve para analizar si la reparación de seguridad incrementa los rechazos indebidos en peticiones benignas.
- Docencia y formación en compresión de modelos: como ejemplo reproducible de cómo una técnica de compresión estándar altera propiedades de alineación sin reentrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1365 |
| StrongREJECT ASR (juez HarmBench) | 0,2300 |
| Macro over-refusal (WildGuard) | 0,0878 |
| Perplejidad WikiText-2 | 9,2820 |

No se proporcionan en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base sin comprimir u otras celdas del grid.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB solo para pesos (7.241.732.096 parámetros), más la caché KV correspondiente al contexto utilizado.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB de pesos más caché KV; con 4 bits, aproximadamente 4-5 GB de pesos más caché KV. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, con margen limitado según la longitud de contexto).
- Cabe en GPU de consumo: sí en RTX 3090 y RTX 4090 (24 GB) en fp16 con contextos moderados, y en RTX 4080, RTX 4070 Ti o similares de 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma directa; el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints. vLLM es viable al ser una arquitectura Mistral estándar. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF que no se distribuye.
- Latencia y throughput: no disponibles; no se publican mediciones al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / disponibilidad | Metricas de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-mistral_remove30_swapgapiter_evfront_b010`) | 7.241.732.096 en safetensors; fracción declarada 0,6999 | 32.768 tokens (heredado del base) | apache-2.0 | Artefacto de investigación, 0 descargas y 0 «likes» | AdvBench ASR 0,1365; StrongREJECT ASR 0,2300; over-refusal 0,0878; ppl WikiText-2 9,2820 |
| `mistralai/Mistral-7B-Instruct-v0.2` (base sin comprimir) | 7.241.732.096 | 32.768 tokens | Apache 2.0 (el repositorio base no incluye archivo de licencia para redistribución, según indica el autor) | Modelo público ampliamente utilizado | no disponibles en la información proporcionada |
| Otras celdas del grid de Jeesup (misma base, distintas reglas y presupuestos) | no disponible | no disponible | apache-2.0 | Publicadas por el mismo autor | no disponibles |

No se han encontrado en los resultados de búsqueda alternativas comparables con datos verificables.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y no como asistente desplegable.
- Degradación de seguridad inducida por la compresión: la propia model card indica que la compresión por sí sola eleva la tasa de éxito de ataques, y que varias celdas del grid están deliberadamente degradadas en seguridad.
- Riesgo de alucinación y de degradación de calidad: la compresión y la posterior edición de pesos pueden afectar a la fidelidad factual; la única métrica de calidad disponible es la perplejidad en WikiText-2 (9,2820), sin punto de comparación publicado.
- Métricas de seguridad absolutas no triviales: ASR de 0,1365 en AdvBench y 0,2300 en StrongREJECT implican que una fracción relevante de ataques tiene éxito.
- Sobre-rechazo medido: 0,0878 macro con WildGuard, lo que indica rechazos indebidos en un porcentaje no despreciable de peticiones benignas.
- Idiomas no documentados: el repositorio no declara idiomas soportados y no hay evaluación multilingüe.
- Sin cuantizaciones publicadas: la ausencia de GGUF, GPTQ o AWQ limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- Advertencia de licencia: aunque el checkpoint se distribuye bajo Apache 2.0, el autor señala que el repositorio del modelo base no incluye archivo de licencia que permita su redistribución, por lo que la licencia declarada gobierna únicamente este derivado. Conviene revisar los términos aplicables antes de cualquier uso comercial.
- Trazabilidad limitada: sin descargas ni validación de terceros, y sin publicaciones asociadas localizadas en la búsqueda web, los resultados deben replicarse de forma independiente antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_remove30_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Los resultados de búsqueda web disponibles no contienen ningún enlace relevante sobre este modelo, SVD-LLM, HarmBench, StrongREJECT o WildGuard: consisten en páginas de soporte de cuentas de Google, notas de actualización de Chrome y prensa de videojuegos, sin relación con el objeto de esta ficha. No se dispone por tanto de enlaces a papers, blogs, repositorios o demos adicionales.
