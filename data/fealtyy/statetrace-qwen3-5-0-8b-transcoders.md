# Fealtyy/statetrace-qwen3.5-0.8b-transcoders

## Resumen

statetrace-qwen3.5-0.8b-transcoders es un conjunto de transcoders por capa (per-layer transcoders, PLT) entrenados sobre el modelo Qwen/Qwen3.5-0.8B, un transformer híbrido de 0,8 mil millones de parámetros que combina 18 capas Gated DeltaNet (atención lineal con estado recurrente) y 6 capas de atención completa. Lo desarrolla el autor Fealtyy dentro del proyecto statetrace, una herramienta de interpretabilidad mecanicista orientada a calcular grafos de atribución (circuit tracing) en modelos con atención lineal híbrida, un escenario que las herramientas clásicas de circuit tracing no cubrían.

Cada transcoder lee la entrada de la MLP de su capa y predice su salida mediante 16.384 características dispersas con activación JumpReLU. El paquete incluye los 24 transcoders (uno por capa), lo que permite sustituir las MLP del modelo base por representaciones dispersas interpretables y rastrear qué características contribuyen a una predicción concreta. Es relevante porque extiende el análisis de circuitos a arquitecturas híbridas SSM/atención lineal, un terreno donde la comunidad de interpretabilidad aún tiene pocas herramientas publicadas.

El modelo no es un modelo generativo en sí: es un artefacto de interpretabilidad que se usa junto al modelo base Qwen3.5-0.8B. Su valor está en la fidelidad de reconstrucción (FVU medio de 0,230) y en la calidad de los grafos de atribución generados (score de sustitución medio de 0,72 y completitud de 0,93 sobre 42 prompts cortos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder por capa (PLT) sobre MLP de transformer híbrido; encoder/decoder lineal con activación JumpReLU |
| Parametros totales | 24 capas × (W_enc [16384, 1024] + W_dec [16384, 1024] + sesgos); no se indica el total agregado |
| Parametros activos | No aplica (no es MoE); L0 ≈ 48 características activas por token y capa |
| Longitud de contexto | No aplica al transcoder; entrenado con contextos de 1024 tokens del modelo base |
| Tipos de cuantizacion | No disponible; pesos en fp32 |
| Idiomas soportados | Entrenado solo con texto educativo en inglés (FineWeb-Edu); otros idiomas no medidos |
| Licencia | MIT |
| Formato de pesos | safetensors (`layer_{i}.safetensors`) más `config.yaml`; compatible con el formato de circuit-tracer |

## Arquitectura y entrenamiento

Cada transcoder es una aproximación dispersa de la MLP de una capa: `f = JumpReLU_θ(x @ W_enc.T + b_enc)` y `out = f @ W_dec + b_dec`, con un ancho de 16.384 características por capa (16 veces la dimensión residual de 1024). Los pesos se exportan en fp32 con la normalización plegada en las matrices y filas del decoder de norma unitaria. El formato de hooks es `mlp.hook_in` → `mlp.hook_out`, siguiendo la convención de circuit-tracer.

El entrenamiento usó el subconjunto `sample-10BT` de FineWeb-Edu con contextos de 1024 tokens y un pool de activaciones barajado, acumulando 399,6 millones de tokens por capa (las 24 capas se entrenaron conjuntamente sobre los mismos tokens). Se aplicó BatchTopK con k = 48 durante el entrenamiento, convertido a umbrales JumpReLU por característica en la exportación, y una pérdida AuxK (k_aux = 512, coeficiente 1/32) para evitar características muertas. Optimizador Adam con lr 2e-4, 1.000 pasos de warmup y decaimiento lineal en el último 20 % de pasos. El cómputo total fue de 3,5 horas en una H200 con unos 25 GB de memoria.

La calidad se midió sobre 32.736 tokens reservados de FineWeb-Edu: la entropía cruzada del modelo original es 2,855 y sube a 3,464 (+0,61 nats) al empalmar los 24 transcoders simultáneamente. Con un solo transcoder el coste va de +0,008 a +0,022 nats en las capas 0–22 y +0,071 en la capa 23. La fracción de varianza no explicada (FVU) media es 0,230, con un rango de 0,070 (capa 23) a 0,355 (capa 9). No hay características muertas (0 %).

## Capacidades

- Predicción dispersa de la salida de la MLP en cada una de las 24 capas del modelo base Qwen3.5-0.8B.
- Construcción de grafos de atribución (circuit tracing) sobre modelos híbridos con capas Gated DeltaNet y atención completa.
- Sustitución del modelo original por un `ReplacementModel` para analizar contribuciones de características a la siguiente predicción de token.
- Extracción de características activas por token (L0 ≈ 48) para análisis de representaciones.
- Carga directa por capa mediante `safetensors.torch.load_file` para inspección o experimentos aislados.
- Compatibilidad con el ecosistema circuit-tracer en cuanto a formato de ficheros y hooks.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un artefacto de interpretabilidad, no un modelo de chat.

## Casos de uso

- Análisis de circuitos en modelos híbridos: usar `attribute()` de statetrace sobre prompts cortos para obtener grafos de atribución y estudiar cómo fluye la información entre capas Gated DeltaNet y capas de atención completa, un caso que las herramientas de circuit tracing para transformers puros no cubren.
- Investigación de mecanismos en capas concretas: cargar `layer_12.safetensors` y examinar qué características JumpReLU se activan ante un token dado para estudiar representaciones intermedias sin ejecutar el modelo completo.
- Validación de fidelidad de transcoders: comparar la CE del modelo original (2,855) con la del modelo sustituido para evaluar el coste de sustitución por capa y decidir qué capas son fiables en un estudio.
- Docencia de interpretabilidad mecanicista: el par modelo base + transcoders sirve como ejemplo reproducible de PLT sobre una arquitectura híbrida, con métricas publicadas (FVU, L0, score de sustitución) para ilustrar el método.
- Auditoría de atribución de predicciones: dado un prompt en inglés, construir el grafo y localizar las características que más contribuyen a la predicción del siguiente token, como paso previo a un análisis de sesgos o comportamientos indeseados.
- Desarrollo de herramientas: integrar el formato de ficheros en pipelines propios de circuit-tracer para ampliar el soporte a modelos híbridos, reutilizando los hooks `mlp.hook_in`/`mlp.hook_out`.
- Reproducción de experimentos: reentrenar o comparar con la configuración publicada (399,6M tokens por capa, k = 48, 3,5 h en H200) para estudiar el efecto de la dispersión y el ancho en la fidelidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CE del modelo original (32.736 tokens reservados) | 2,855 |
| CE con los 24 transcoders empalmados | 3,464 (+0,61 nats) |
| CE con un transcoder empalmado (capas 0–22) | +0,008 a +0,022 nats |
| CE con un transcoder empalmado (capa 23) | +0,071 nats |
| FVU medio entre capas | 0,230 |
| FVU mínimo (capa 23) | 0,070 |
| FVU máximo (capa 9) | 0,355 |
| Características activas por token (L0) | ≈ 48 por capa |
| Características muertas | 0 % |
| Score de sustitución medio en grafos (42 prompts) | 0,72 |
| Score de completitud medio en grafos (42 prompts) | 0,93 |

FVU por capa: capa 0 = 0,099; 1 = 0,190; 2 = 0,194; 3 = 0,232; 4 = 0,246; 5 = 0,277; 6 = 0,298; 7 = 0,323; 8 = 0,353; 9 = 0,355; 10 = 0,338; 11 = 0,321; 12 = 0,285; 13 = 0,260; 14 = 0,182; 15 = 0,198; 16 = 0,180; 17 = 0,187; 18 = 0,153; 19 = 0,181; 20 = 0,196; 21 = 0,214; 22 = 0,183; 23 = 0,070. Las capas 3, 7, 11, 15, 19 y 23 son de atención completa; el resto, Gated DeltaNet.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo generativo evaluable en esas tareas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,2 GB en fp32; para inferencia de los transcoders junto al modelo base hay que sumar la memoria de Qwen3.5-0.8B (aproximadamente 1,6 GB en fp16 más overhead de activaciones).
- GPU recomendadas: el entrenamiento se hizo en una H200 con unos 25 GB; para uso en inferencia y construcción de grafos basta una GPU con 8–16 GB.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4070 o superiores, dado el tamaño reducido del modelo base y de los transcoders.
- Opciones de despliegue: el paquete se usa a través de la librería statetrace (`ReplacementModel`, `attribute`) y de safetensors; no está pensado para vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos.
- Latencia y throughput: no disponibles. El coste dominante es la construcción de grafos de atribución, no la inferencia del transcoder aislado.

## Comparativa con modelos similares

| Modelo | Base | Num. capas | Ancho de caracteristicas | L0 | FVU medio | Licencia |
|---|---|---|---|---|---|---|
| statetrace-qwen3.5-0.8b-transcoders | Qwen3.5-0.8B (hibrido) | 24 | 16.384 | ≈ 48 | 0,230 | MIT |
| Transcoder stacks publicos para transformers puros | Modelos tipo GPT-2 / Pythia | Variable | Variable | Variable | No disponible | Variable |

No se dispone en la información proporcionada de cifras de transcoders comparables publicados con las que contrastar FVU, L0 o coste de sustitución. La comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Entrenado solo con texto educativo en inglés (FineWeb-Edu); la calidad sobre código, texto con formato de chat u otros idiomas no está medida.
- El coste de empalmar las 24 capas es alto (+0,61 nats de CE); los nodos de error del grafo absorben el resto, lo que puede distorsionar análisis finos.
- Las 16.384 características por capa no han sido auto-interpretadas ni etiquetadas; su significado semántico es desconocido a priori.
- Son transcoders por capa (PLT), no transcoders entre capas (CLT): no modelan directamente interacciones entre capas.
- Es un artefacto de interpretabilidad, no un modelo de chat ni de generación; no debe usarse para producir texto ni para tareas de razonamiento.
- La fidelidad varía notablemente por capa (FVU de 0,070 a 0,355); los análisis en capas intermedias (por ejemplo, la 9) son menos fiables.
- Aunque la licencia es MIT, conviene verificar la licencia y condiciones del modelo base Qwen3.5-0.8B antes de un uso comercial combinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fealtyy/statetrace-qwen3.5-0.8b-transcoders
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio statetrace: https://github.com/Madhav-Bhanushali/statetrace
- Repositorio circuit-tracer: https://github.com/safety-research/circuit-tracer
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
