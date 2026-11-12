# EngineeringWithJay/Swift-Bonsai-2-MTPLX

## Resumen

Swift Bonsai 2 27B — MTPLX community build es un empaquetado comunitario del modelo Swift Bonsai 2 de UkisAI, una variante afinada mediante DPO sobre el modelo Ternary Bonsai 2 27B de Prism ML. El autor del paquete, EngineeringWithJay, redistribuye el tronco Swift en el formato ternario propietario "prism_hadamard_qwen35" junto con una cabeza MTP (multi-token prediction) de Qwen3.8-27B en int4 g64, con el objetivo de servir el modelo localmente en Apple Silicon con decodificación especulativa a través del motor MTPLX.

El modelo se construye sobre un backbone Qwen3.8-27B con atención híbrida: capas de atención lineal Gated DeltaNet combinadas con atención completa cada cuatro capas. Dispone de 64 capas, dimensión oculta de 5.120, GQA con 24 cabezas de consulta y 4 de clave/valor, y una longitud de contexto nativa de 262.144 tokens, aunque la ventana efectiva al servirse con MTPLX se reduce a 8.192 tokens.

La relevancia de este paquete es doble: por un lado, demuestra un flujo de despliegue de decodificación especulativa sobre pesos ternarios en hardware de consumo Apple; por otro, es un artefacto experimental que mezcla componentes de procedencias distintas (tronco Swift, cabeza MTP de Qwen, torre de visión de Prism) con advertencias explícitas del autor sobre su fiabilidad en instrucciones, uso de herramientas y código. No es una versión oficial de ninguno de los proyectos implicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa cada 4 capas; backbone Qwen3.8-27B |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; ventana de motor de 8.192 tokens al servirse con MTPLX |
| Tipos de cuantizacion | Pesos ternarios (2 bits con signo, una escala por bloque de 128); cabeza MTP en int4 g64 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX); paquete `mtplx-pack/` con `mtp.safetensors` |

## Arquitectura y entrenamiento

El tronco es un transformer de 64 capas con dimensión oculta de 5.120 y atención de consultas agrupadas (GQA) con 24 cabezas Q y 4 KV, head_dim de 256. La innovación principal es la atención híbrida: capas de Gated DeltaNet (atención lineal con estado recurrente) intercaladas con atención completa cada cuarta capa, lo que reduce el coste computacional en contextos largos manteniendo capacidad de atención global. Los pesos del tronco están cuantizados en formato ternario con una escala por bloque firmado de 128 elementos, bajo el esquema "prism_hadamard_qwen35" de Prism ML, que aplica una transformada de Hadamard con signo antes de la cuantización a 2 bits.

El ajuste de UkisAI (Swift) parte del modelo Ternary Bonsai 2 27B de Prism ML y aplica DPO (Direct Preference Optimization) para mejorar la eficiencia de razonamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la metodología exacta del DPO en la información proporcionada. La cabeza MTP es la de Qwen3.8-27B en int4 g64, sin reentrenar para Swift: el autor advierte que está "off-policy" respecto al tronco afinado, por lo que la tasa de aceptación en decodificación especulativa será inferior a la del paquete base. La torre de visión injertada es byte-idéntica a la de Prism ML y no está adaptada a Swift.

## Capacidades

- Generación de texto y razonamiento: el modelo está orientado a razonamiento eficiente, con resultados publicados en GPQA-Diamond, C-Eval, IFBench y AIME 2025.
- Razonamiento matemático: AIME 2025 con 93,33% según resultados de UkisAI.
- Decodificación especulativa con MTP: la cabeza MTP de profundidad 1 permite aceptar/rechazar tokens con muestreo residual, manteniendo la distribución exacta del tronco a cualquier temperatura.
- Modo de razonamiento configurable: el servidor MTPLX expone `--reasoning-effort` (medium en el ejemplo) y `--reasoning off`.
- Visión: la torre de visión está presente por contrato de runtime de MTPLX, pero el autor indica que las salidas de visión no están probadas y la torre no está alineada con Swift.
- Tool calling / function calling: no confirmado; el autor advierte que Swift es irregular en uso de herramientas.
- Agentes y razonamiento multi-paso: soportado a nivel de servidor (endpoints OpenAI y Anthropic), pero con advertencias de fiabilidad.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Inferencia local en Apple Silicon: servir el modelo con `mtplx serve` en un Mac con 18 GB o más de memoria unificada, aprovechando la cuantización ternaria para reducir la huella a ~8,2 GB cableados y la decodificación especulativa para acelerar la generación.
- Experimentación con decodificación especulativa: evaluar el comportamiento de una cabeza MTP off-policy sobre un tronco DPO, midiendo tasas de aceptación y latencia en comparación con el paquete base.
- Evaluación de cuantización ternaria: estudiar la degradación de calidad del esquema "prism_hadamard_qwen35" frente a cuantizaciones int4/int8 en tareas de razonamiento (GPQA, AIME).
- Prototipado de agentes con API compatible: usar los endpoints OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`) para integrar el modelo en frameworks de agentes existentes sin adaptadores, siempre validando la fiabilidad en uso de herramientas.
- Investigación sobre atención híbrida lineal/completa: analizar el rendimiento de Gated DeltaNet con ventana de 8K en tareas de contexto medio, comparando con transformers de atención completa del mismo tamaño.
- Docencia y divulgación: demostrar en un equipo de consumo el pipeline completo de un modelo de 27B cuantizado a 2 bits con decodificación especulativa, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Resultados publicados por UkisAI para Swift frente al base Ternary Bonsai 2 (el autor del paquete no ha remedido estos números en MTPLX):

| Benchmark | Swift Bonsai 2 | Ternary Bonsai 2 (base) |
|---|---|---|
| GPQA-Diamond | 84,34% | 84,18% |
| C-Eval | 81,47% | 81,37% |
| IFBench | 82,60% | 82,13% |
| AIME 2025 | 93,33% | 92,00% |

El autor advierte explícitamente que no deben citarse los números del paquete base como si fueran de Swift-on-MTPLX, ya que no se han publicado mediciones exactas para esta combinación.

## Requisitos de hardware

- VRAM/memoria: ~8,2 GB cableados según el autor; se recomiendan 18 GB o más de memoria unificada para clientes de agentes.
- En 16 GB de memoria unificada solo cabe con `--allow-swap`, con presión severa de swap y no viable para trabajo de agentes.
- GPU: orientado a Apple Silicon (librería MLX); no se documentan requisitos para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada suficiente; no se especifican modelos concretos de Mac.
- Despliegue: servidor MTPLX (`pip install mtplx`, `mtplx serve`), con endpoints compatibles OpenAI y Anthropic y endpoint de salud `/health`.
- Latencia y throughput: no disponibles; dependen del chip Apple Silicon y de la tasa de aceptación de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift Bonsai 2 27B — MTPLX (este) | 27B | 262.144 nativo / 8.192 servido | Apache-2.0 | safetensors (MLX) | Build comunitario con MTP y visión injertada |
| Ternary Bonsai 2 27B (Prism ML) | 27B | no disponible | no disponible | GGUF | Modelo base del que deriva Swift; sin DPO |
| Qwen3.8-27B | 27B | no disponible | Apache-2.0 | no disponible | Backbone del modelo; origen de la cabeza MTP |
| Swift Bonsai 2 MLX (text-only) | 27B | no disponible | no disponible | safetensors (MLX) | Variante solo texto del mismo autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Lanzamiento experimental de investigación: el autor califica Swift como irregular en seguimiento de instrucciones, uso de herramientas y código abierto; requiere validación por carga de trabajo.
- La torre de visión injertada es byte-idéntica a la de Prism y no está adaptada por DPO a Swift; las salidas de visión no están probadas.
- La cabeza MTP está off-policy respecto al tronco Swift: el muestreo exacto se mantiene, pero la tasa de aceptación se degrada frente al paquete base.
- Ventana de contexto efectiva de solo 8.192 tokens al servirse con MTPLX, muy inferior a los 262.144 nativos.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- En 16 GB de memoria unificada el modelo solo funciona con swap severo, no apto para agentes.
- Atribución requerida: MTPLX exige un aviso "Powered by MTPLX" si se construye un producto sobre este paquete; consultar `NOTICE.txt` y `LICENSE`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base y el DPO de UkisAI.
- No es una versión oficial de UkisAI, Prism ML, Alibaba Cloud ni del autor de MTPLX.

## Enlaces

- Hugging Face: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-MTPLX
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Variante solo texto del mismo autor: `EngineeringWithJay/Swift-Bonsai-2-MLX`
- Ternary Bonsai 2 27B de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- MTPLX (motor de inferencia, Apache-2.0): no disponible en la información proporcionada
- Model card de UkisAI (metodología de benchmarks): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
