# BoldingBuilds/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF es un adaptador LoRA de rango 1 publicado por BoldingBuilds que elimina la dirección de rechazo del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. No es un modelo completo: es un artefacto de investigación de 439 MB que se aplica en tiempo de carga sobre los pesos originales, sin recuantizar ni volver a distribuir el modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

El adaptador se ajustó con un vector de control por diferencia de medias sobre 128 pares dañino/inocuo (AdvBench frente a instrucciones Alpaca), expresado como una única actualización de rango 1 aplicada en la capa 22. Al cargarse, proyecta esa dirección fuera de las escrituras residuales de atención y MoE de cada capa. El resultado declarado por el autor es una caída de la tasa de rechazo del 98,3 % al 4,2 % en un conjunto dañino de 120 prompts, sin sobre-rechazo añadido en el conjunto benigno y sin regresión medible en HumanEval.

Su relevancia es doble: por un lado, es un ejemplo de intervención mínima y reversible sobre un Mixture-of-Experts de gran escala; por otro, plantea el debate habitual sobre artefactos de "abliteration" orientados a eliminar salvaguardas. El modelo base, según fuentes externas, es un MoE disperso de 552 B de parámetros con 8 B activos en entrada y 16 B en salida, contexto de 1 M de tokens y entrada multimodal de texto e imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 (adaptador de ablación) sobre un MoE disperso del modelo base, descrito externamente como Causal Encoder-Decoder |
| Parámetros totales | 552 B en el modelo base según fuentes externas; el campo safetensors del repo (114.862.080) corresponde al adaptador, no al modelo base |
| Parámetros activos | 8 B en entrada y 16 B en salida (MoE del modelo base, según fuentes externas) |
| Longitud de contexto | 1.000.000 de tokens en el modelo base; no aplicable al adaptador |
| Tipos de cuantización | GGUF para el adaptador; el modelo base se distribuye en GGUF (p. ej. Q4_K_XL, FP8) y safetensors |
| Idiomas soportados | Inglés declarado en la model card y en los tags; cobertura multilingüe del base no documentada |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA); safetensors y GGUF para el modelo base |

## Arquitectura y entrenamiento

El adaptador es una actualización de rango 1 calculada por diferencia de medias entre 128 pares de prompts dañinos (AdvBench) e inocuos (Alpaca). Esa dirección se proyecta fuera de las escrituras residuales de atención y de las capas MoE mediante la operación `y ← y − scale · r (r · y)`, con capa objetivo 22 y escala 1.0. Al ser una proyección, el adaptador es invariante al signo y autocontenido, y no requiere重新quantización ni redistribución del modelo base. El repositorio incluye una segunda variante ajustada sobre la media de todos los tokens en lugar de la dirección del último token (`...-allmean-L22.gguf`); la variante de último token es la evaluada.

No se detalla en la información disponible la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO. Fuentes externas describen el base como una actualización menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, código, tareas agénticas y visión, y mencionan un recetario de RL con autofeedback para las ganancias agénticas, aunque sin cifras verificables en el material consultado.

## Capacidades

- Eliminación de la dirección de rechazo: reduce la tasa de rechazo del 98,3 % al 4,2 % en un conjunto de 120 prompts estilo AdvBench.
- No añade capacidades nuevas: según el autor, solo modifica la disposición a declinar cierta clase de peticiones.
- Generación de texto y razonamiento: heredados del modelo base, sin cambios medibles dentro del error de medida.
- Código: HumanEval pass@1 de 95,1 % (stock) frente a 95,7 % (con adaptador), n=164, diferencia por debajo del suelo de ruido (~6,5 pp).
- Capacidades agénticas: harness privado, 2 misiones × 3 semillas, n=6, 96,7 → 99,3; el autor lo califica de indicativo y dentro del ruido.
- Multimodalidad: el modelo base procesa imágenes y texto y genera texto de forma autorregresiva según fuentes externas; el adaptador no altera esta capacidad de forma documentada.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Multilingüe: el base se describe como multimodal y de propósito general, pero la model card solo declara inglés; cobertura por idioma no disponible.

## Casos de uso

- Investigación de robustez del rechazo: cargar el adaptador junto al GGUF stock y comparar tasas de rechazo y puntuaciones de daño con un juez congelado sobre el mismo conjunto de prompts, tal como hace el autor con n=120.
- Interpretabilidad de la dirección de rechazo: estudiar cómo una proyección de rango 1 en una sola capa de un MoE de 552 B altera el comportamiento global, comparando con la variante `allmean` para aislar el efecto de la elección de vector.
- Construcción de clasificadores de seguridad: generar respuestas a prompts dañinos controlados para etiquetar datos y entrenar guardrails externos, con revisión humana obligatoria y en entorno cerrado.
- Medición de sobre-rechazo: usar el brazo benigno (120 prompts) para verificar que una intervención de ablación no provoca falsos positivos en peticiones legítimas, replicando el protocolo del autor con un n mayor.
- Validación de harness de agentes: comprobar que la modificación no degrada el rendimiento en tareas multi-paso antes de adoptar adaptadores similares en pipelines de evaluación.
- Experimentación local con llama.cpp: desplegar el adaptador con `--lora` y `--jinja` sobre una build GGUF stock (por ejemplo la de unsloth) sin recuantizar ni duplicar el almacenamiento del modelo base.
- Formación y divulgación en seguridad de IA: usar el par stock/abliterado como caso práctico de cómo se localiza y manipula una dirección semántica en un transformer disperso.
- Comparación de metodologías de ablación: contrastar último token frente a media de todos los tokens con el mismo juez y los mismos conjuntos held-out.

## Benchmarks y rendimiento

Evaluación held-out del autor; la dirección de rechazo se ajustó en un conjunto separado de pares. El juez es un modelo congelado (Qwen3.8-27B, thinking desactivado) y el rechazo también se verifica por coincidencia de prefijo. Thinking desactivado en ambos brazos.

| Métrica | Stock | Con adaptador | n | Evaluador |
|---|---:|---:|---:|---|
| Tasa de rechazo, conjunto dañino | 98,3 % | 4,2 % | 120 | juez + prefijo |
| Puntuación media de daño (0–1) | 0,013 | 0,851 | 120 | juez congelado |
| Sobre-rechazo, conjunto benigno | 0,0 % | 0,0 % | 120 | juez + prefijo |
| HumanEval pass@1 | 95,1 % | 95,7 % | 164 | tests unitarios |
| Capacidad agéntica (harness privado) | 96,7 | 99,3 | 6 | harness privado |

No se han publicado resultados de benchmarks oficiales del modelo base en la información disponible; las fuentes externas solo describen mejoras cualitativas en razonamiento, código, tareas agénticas y visión respecto a DeepSeek-V4.1-Flash.

## Requisitos de hardware

- El adaptador ocupa 439 MB en disco y se carga junto al modelo base; su coste de VRAM es despreciable frente al del base.
- El requisito real lo marca el modelo base de 552 B. Estimaciones a partir del número de parámetros (no publicadas por el autor): ~1,1 TB en BF16, ~550 GB en FP8, ~300–340 GB en Q4_K_XL, ~200 GB en Q2_K.
- GPU recomendadas: no disponibles como dato oficial. Para Q4 se necesitan del orden de 4× H100 80 GB o 8× A100 80 GB; en FP8, 8× H100 80 GB.
- GPU de consumo: no cabe en ninguna GPU consumer, ni siquiera en cuantizaciones agresivas. Solo es viable con offload masivo a RAM del sistema (256 GB o más) y velocidades de decodificación muy bajas.
- Caché KV: con 1 M de tokens de contexto y arquitectura MoE de 552 B, el coste de caché es muy elevado y no está cuantificado en la información disponible; en la práctica obliga a limitar el contexto o usar cuantización de KV.
- Opciones de despliegue: llama.cpp / llama-server (soporte de `--lora` y `--jinja`, el camino documentado por el autor); vLLM, TGI u Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad; en un MoE con 8–16 B activos el throughput depende críticamente del ancho de banda de memoria y del número de GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (conjunto dañino) | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (stock) | 552 B totales / 8–16 B activos | 1 M | 98,3 % | 95,1 % | MIT | Pesos abiertos, safetensors y GGUF |
| Este adaptador (último token, L22) | Adaptador de rango 1 sobre 552 B | 1 M (heredado) | 4,2 % | 95,7 % | MIT | GGUF, 439 MB |
| Variante `allmean-L22` | Adaptador de rango 1 sobre 552 B | 1 M (heredado) | No disponible | No disponible | MIT | GGUF en el mismo repo |
| Otros adaptadores de abliteration para la familia V4.1 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos de otros adaptadores de ablación comparables sobre este mismo modelo base en la información consultada.

## Limitaciones y advertencias

- El adaptador elimina salvaguardas de forma deliberada: la tasa de rechazo baja al 4,2 % y la puntuación media de daño sube de 0,013 a 0,851. Cualquier despliegue debe incorporar filtrado externo y revisión humana.
- La licencia MIT del adaptador no exime de las obligaciones de la licencia del modelo base ni de la legislación aplicable; el autor lo indica explícitamente.
- Las métricas se obtuvieron con n=120 (rechazo y sobre-rechazo) y n=164 (HumanEval); el suelo de ruido de HumanEval se estima en ~6,5 pp, por lo que la mejora de 0,6 pp no es significativa. La evaluación agéntica con n=6 es meramente indicativa.
- El conjunto de evaluación son instrucciones genéricas estilo AdvBench; el autor advierte que el adaptador no convierte al modelo en partícipe de acciones contra objetivos reales ni autoriza su uso para ello.
- El juez es un modelo congelado concreto (Qwen3.8-27B, thinking desactivado); los resultados pueden no transferirse a otros evaluadores.
- Idioma declarado: solo inglés. El comportamiento en castellano u otras lenguas no está evaluado.
- Riesgo de alucinación y sesgos del modelo base: no cuantificado en la información disponible; la ablación no corrige sesgos, solo la disposición a rechazar.
- Discrepancia de tamaños: la model card menciona "~700 B model" mientras que las fuentes externas indican 552 B de columna vertebral. No se puede resolver con la información disponible.
- El adaptador solo se distribuye en GGUF y requiere llama.cpp con soporte de LoRA; no hay convertidores ni recetas para otros runtimes.
- Si se cargan varios adaptadores, es necesario pasar una escala explícita para cada id.
- Repositorio con 0 descargas y 0 likes: sin validación independiente por parte de la comunidad. Fecha de creación 2026-10-24.
- No debe usarse para generar contenido dirigido a personas reales ni para acceder sin autorización a sistemas de terceros, según el uso previsto declarado por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BoldingBuilds/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build GGUF del base (unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Build GGUF del base (DevQuasar): https://huggingface.co/DevQuasar/deepseek-ai.DeepSeek-V4.1-Flash-1017-GGUF
- Build FP8 GGUF (AMAImedia): https://huggingface.co/AMAImedia/DeepSeek-V4.1-Flash-1017-FP8-GGUF/blob/main/README.md
- Ficha del modelo base en AI Model Radar: https://aimodelradar.app/models/deepseek-v4-1-flash-1017
- Documentación en Cloudflare AI: https://developers.cloudflare.com/ai/models/%40cf/deepseek-ai/deepseek-v4.1-flash-1017/
- Análisis técnico del base en Local AI Zone: https://local-ai-zone.github.io/blog/deepseek-v4-1-flash-1017-deep-dive.html
