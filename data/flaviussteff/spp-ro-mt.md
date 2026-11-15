# flaviussteff/spp-ro-mt

## Resumen

spp-ro-mt es un modelo de lenguaje causal monolingüe en rumano de 88,1 millones de parámetros, desarrollado por Flavius-Ștefan Hăbeanu en el marco de su tesis de licenciatura en la Facultad de Matemáticas e Informática de la Universidad de Bucarest (2026). Forma parte de la familia SPP-Ro, una replicación desde cero, con presupuesto de cómputo equiparable, del trabajo *Synthetic Persona Pretraining* de Minder et al. (EPFL-dlab, arXiv:2608.13482), que compara tres regímenes de preentrenamiento (Vanilla, Filtered y SPP) sobre exactamente el mismo flujo de documentos.

La variante `mt` (midtraining) parte del checkpoint Vanilla en el paso 45.000 y aplica 5.000 pasos adicionales sobre un flujo anotado en el que el 67,6 % de las secuencias incorporan una "reflexión" generada por un LLM, con la pérdida calculada únicamente sobre esa reflexión. El objetivo experimental es medir el coste de alineación (*alignment tax*): si inyectar reflexiones ancladas en una constitución de valores en rumano degrada o no la perplejidad del modelo base.

Arquitectónicamente es un transformer decoder-only estilo Llama con 12 capas, dimensión oculta 768, SwiGLU de 2.048, GQA con 12 cabezas de consulta y 4 de clave-valor, contexto de 1.024 tokens y vocabulario BPE de 16.384 unidades. Es un modelo de investigación, no un asistente: no ha recibido instruction tuning ni post-entrenamiento, y el autor lo declara explícitamente no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), causal, con embeddings atados |
| Parametros totales | 88.099.584 (~88,1 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (RoPE theta 10.000) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Rumano (ro), monolingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

Otras especificaciones: hidden 768, intermediate 2.048 (SwiGLU), 12 capas, GQA 12 cabezas de consulta / 4 de clave-valor, vocabulario de 16.384 tokens BPE byte-level entrenado para rumano, token especial `<assistant>`, embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12 capas con atención causal estándar y RoPE. La innovación no está en la arquitectura sino en el régimen de datos: el *SPP document mode* inserta una reflexión `r1 ... rn` en una frontera de frase dentro del documento, delimitada por el token `<assistant>`, de modo que la secuencia queda `c1 ... ck <assistant> r1 ... rn ck+1 ...`. La continuación del documento **no puede atender a la reflexión** (máscara de atención asimétrica) y sus posiciones RoPE se reasignan al punto de inserción, con lo que el documento original se modela exactamente igual que en el modelo Vanilla. El token `<assistant>` no contribuye a la pérdida.

Los datos son 1,5 millones de documentos rumanos (FineWeb-2 RO, Wikipedia RO y prensa) leídos en un orden fijado por semilla e idéntico para todos los modelos de la familia. 150.000 documentos (10 %) tienen reflexión en el sidecar: 75.000 son los mejor puntuados por un clasificador de seguridad y 75.000 son benignos; las reflexiones promedian 36 tokens (~0,67 % de los tokens entrenados) y están ancladas en una constitución de valores rumana de seis artículos. El midtraining aplica 5.000 pasos desde el checkpoint Vanilla del paso 45.000 con un schedule nuevo (LR pico 5e-5, 250 pasos de warm-up, coseno hasta 0), 64 ventanas empaquetadas de 1.024 posiciones por paso (empaquetado first-fit terminado en EOS, atención en bloque diagonal, posiciones por documento, 2,4 % de padding), lo que supone aproximadamente 0,33 mil millones de tokens en esta ejecución. El entrenamiento se realizó en bf16 con pesos maestros en fp32 en una única NVIDIA RTX 3060 de 12 GB. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal en rumano: continuación de documentos y prompts cortos.
- Modelado de lenguaje puro: la métrica principal es la perplejidad sobre texto rumano retenido.
- Cloze de cuatro opciones: 89,4 % de acierto en el conjunto de evaluación interno de 1.000 ítems, lo que indica cierta competencia en completar huecos a nivel de frase.
- Persona reflexiva activable: prefijar el prompt con `<assistant>` activa en inferencia el modo reflexivo aprendido durante el midtraining.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin visión, audio ni modo de razonamiento explícito (*thinking*).
- Sin instruction tuning: no sigue instrucciones ni mantiene diálogos multi-turno de forma fiable.
- Multilingüismo: nulo más allá del rumano; el vocabulario está entrenado específicamente para rumano.

## Casos de uso

- Investigación sobre alineación a escala pequeña: reproducir el experimento de coste de alineación comparando `spp-ro-mt` con `spp-ro-base-rewarm` sobre los mismos documentos retenidos, usando las métricas de perplejidad del repositorio.
- Evaluación de métodos de preentrenamiento con personas sintéticas: servir como una de las cinco variantes de la familia SPP-Ro para estudiar cómo afecta la anotación selectiva al modelado del lenguaje.
- Docencia y tesis: modelo de 88 M entrenable en una RTX 3060 de 12 GB, útil como banco de pruebas reproducible de empaquetado de secuencias, máscaras asimétricas y posiciones RoPE por documento.
- Experimentos de filtración de datos: comparar la perplejidad en documentos marcados por el clasificador de seguridad frente a los no marcados para cuantificar la pérdida de conocimiento del baseline Filtered.
- Generación de texto rumano a pequeña escala para pruebas de infraestructura: validar pipelines de inferencia con `transformers` en fp32 antes de escalar a modelos mayores.
- Análisis de sesgos en corpus web rumanos: el modelo reproduce los sesgos de FineWeb-2 RO, Wikipedia RO y prensa, por lo que puede usarse para sondear qué sesgos persisten tras un preentrenamiento corto.
- Réplica de resultados académicos: el repositorio GitHub incluye predicciones por ítem y tablas LaTeX en `evals/`, lo que permite verificar las cifras publicadas.

## Benchmarks y rendimiento

Resultados publicados en la model card. Modelo de referencia: `flaviussteff/spp-ro-base-rewarm`.

| Metrica | Valor | Respecto a la referencia |
|---|---|---|
| Perplejidad, web retenida (1.000 docs) | 18,88 | +0,46 |
| Perplejidad, docs retenidos marcados por el clasificador de seguridad (199 docs) | 26,91 | +0,78 |
| Perplejidad, docs retenidos no marcados (1.000 docs) | 18,26 | No disponible |
| Cloze de 4 opciones, retenido (1.000 ítems) | 89,4 % | No disponible |
| ConstitutionEval-Ro, letra, 4 rotaciones des sesgadas (azar 25 %), 600 ítems | 28,0 % | No disponible |
| ConstitutionEval-Ro, PMI (azar 25 %), 600 ítems | 37,8 % | No disponible |
| ConstitutionEval-Ro, continuación (azar 25 %), 600 ítems | 20,2 % | No disponible |
| ConstitutionEval-Ro, oro frente a cada distractor (azar 50 %), 600 ítems | 46,7 % | No disponible |
| ConstitutionEval-Ro, letra, deliberativo (prefijo `<assistant>`) | 25,7 % | No disponible |

El autor señala que los cinco modelos de la familia están a nivel de azar en ConstitutionEval-Ro: un modelo de 88 M no resuelve el benchmark, por lo que no puede mostrar un efecto de alineación a esa escala. El resultado medible es el coste de alineación: SPP no cuesta perplejidad, mientras que el baseline Filtered pierde conocimiento exactamente en los documentos marcados por el clasificador (+1,13 de perplejidad, peor en el 85 % de ellos, test de signos pareado p ≈ 1e-24). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo en fp32 ocupa aproximadamente 0,35 GB de pesos (88,1 M × 4 bytes) más activaciones y caché KV; con contexto de 1.024 tokens y GQA (4 cabezas KV, 12 capas, dimensión de cabeza 64) la caché KV es de unos 6 MB por secuencia. En la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: el entrenamiento se hizo en una única NVIDIA RTX 3060 de 12 GB; para inferencia basta con una GTX 1650, RTX 3050, RTX 4090 o cualquier GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con al menos 2 GB de VRAM; también en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ejemplo oficial en fp32); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| spp-ro-mt | 88,1 M | 1.024 | Rumano | MIT | Midtraining SPP con reflexiones; perplejidad retenida 18,88 |
| spp-ro-base-rewarm | No disponible (misma familia, ~88 M) | 1.024 | Rumano | MIT | Modelo de referencia Vanilla; perplejidad retenida 18,42 (implícita por el delta +0,46) |
| Baseline Filtered (familia SPP-Ro) | No disponible (misma familia) | 1.024 | Rumano | MIT | Pérdida de +1,13 de perplejidad en documentos marcados por el clasificador |
| Modelos rumanos de mayor escala (p. ej. variantes RoLlama/RoGPT) | No disponible | No disponible | Rumano | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación relevante es interna a la familia SPP-Ro, ya que el autor no publica comparaciones con modelos rumanos de terceros. Cualquier comparación con modelos de mayor escala carecería de base en los datos disponibles.

## Limitaciones y advertencias

- Tamaño muy reducido (88 M de parámetros): no resuelve benchmarks de conocimiento o alineación; está a nivel de azar en ConstitutionEval-Ro.
- Monolingüe en rumano; no comprende ni genera otros idiomas de forma fiable.
- Solo preentrenamiento: no hay instruction tuning, RLHF ni DPO, por lo que no sigue instrucciones ni mantiene conversaciones.
- Entrenado sobre texto web (FineWeb-2 RO, Wikipedia RO, prensa): reproduce los sesgos presentes en esos datos.
- Riesgo de alucinación y de continuaciones incoherentes, especialmente fuera de dominio.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Una sola semilla: los resultados no incluyen estimación de varianza entre ejecuciones.
- El autor declara explícitamente que no está pensado para uso en producción.
- Licencia MIT: permite uso comercial, pero la falta de post-entrenamiento y las limitaciones anteriores hacen desaconsejable cualquier despliegue real.
- El token `<assistant>` debe gestionarse con cuidado: prefijar el prompt activa la persona reflexiva, lo que puede alterar la distribución de salida respecto al modo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro-mt
- Modelo de referencia: https://huggingface.co/flaviussteff/spp-ro-base-rewarm
- Repositorio del proyecto: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Minder et al., Synthetic Persona Pretraining, EPFL-dlab, 2026): https://arxiv.org/abs/2608.13482
- Tesis: Hăbeanu, Flavius-Ștefan, *Pre-antrenarea Modelelor Generative Românești cu Personalitate Sintetică: Aliniere Constituțională de la Token Zero*, Facultad de Matemáticas e Informática, Universidad de Bucarest, 2026 (URL en el repositorio GitHub).
