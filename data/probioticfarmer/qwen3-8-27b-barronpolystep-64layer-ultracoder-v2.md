# ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-64Layer-UltraCoder-v2

## Resumen

`Qwen3.8-27B-BarronPolyStep-64Layer-UltraCoder-v2` es un adaptador LoRA publicado por el usuario ProbioticFarmer sobre el modelo base `Qwen/Qwen3.8-27B`. El repositorio contiene únicamente los pesos del adaptador (256 tensores bf16, r=16, alpha=32), no el modelo completo, y está empaquetado con la librería PEFT. Su propósito declarado es mejorar el rendimiento del modelo base en tareas de generación de código Python mediante una técnica de optimización sin retropropagación denominada PolyStep, combinada con dos correcciones al softmax derivadas del paper arXiv:2610.31642.

La relevancia del artefacto es más metodológica que de producto: el autor documenta un pipeline de ajuste "forward-only" (cero gradientes, cero pasos hacia atrás) que permite optimizar un modelo de 27B y 64 capas en una única Apple M4 Max con 128 GB de memoria unificada. El entrenamiento se realizó sobre un conjunto muy reducido de tareas (40 de entrenamiento, 16 reservadas) y el autor insiste en garantías de invariancia bit a bit frente al conjunto de test, un problema habitual en adaptadores de código que filtran benchmarks.

Conviene señalar que la model card describe internamente el artefacto como `RealCoder-v3`, mientras que el identificador del repositorio corresponde a `UltraCoder-v2`, y que el autor menciona versiones contaminadas previas (`RealCoder-v4`/`v5`) puestas en cuarentena. Esta discrepancia y el carácter experimental del pipeline (hardware de consumo, dataset minúsculo, sin benchmarks estándar publicados) hacen que el modelo deba tratarse como un experimento de investigación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido Qwen3.8-27B: 48 capas GatedDeltaNet (atención lineal) + 16 capas de atención completa |
| Parametros totales | No disponible para el adaptador (256 tensores bf16; el modelo base es de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16; el modelo base admitiría las cuantizaciones habituales de Qwen, no documentadas aquí) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT) |
| Modelo base | Qwen/Qwen3.8-27B |
| Rango LoRA | r=16, alpha=32 |
| Módulos adaptados | `layers.63.mlp.down_proj`, `layers.63.self_attn.o_proj`, `layers.62.linear_attn.out_proj` |
| Vocabulario | 248.320 tokens |
| Tamaño del repo | 1,2 GB |
| Descargas | 214 |
| Fecha de creación | 2026-10-29 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer híbrido que combina 48 capas de atención lineal `GatedDeltaNet` con 16 capas de atención completa, y una cabeza de vocabulario de 248.320 entradas por 5.120 dimensiones. El LoRA de rango 16 se inserta únicamente en tres módulos de las dos últimas capas (proyección de salida de atención y down-projection del MLP en la capa 63, y out-projection de la atención lineal en la capa 62). Según la model card, los tensores tienen formas `[16, 17408]`, `[16, 6144]` y `[5120, 16]`.

El entrenamiento no usa retropropagación: emplea PolyStep, un método de optimización de orden cero que evalúa 128 vértices antitéticos por paso (3.302.400 evaluaciones de vértice en total, 20.400 pasos organizados en 240 ciclos de 85 pasos, con un factor de escala de 240x). A ello se suman dos correcciones numéricas al softmax descritas en arXiv:2610.31642: una reescritura del término `log1p(Σ exp(z_j − z_*))` para evitar underflow cuando Δz > 6,22, y una corrección del transporte de pesos `V_* + expm1(log_W_*)·V_* + Σ exp(log_W_v)·V_v`. El conjunto de entrenamiento es muy pequeño: 40 tareas (24 Algo-32 + 16 PyDS-24, 160 slots, 3.378 posiciones de token), con 16 tareas reservadas (64 slots, 1.327 posiciones). Todas las bases PCA/SVD y las proyecciones de inicialización se calculan exclusivamente sobre el split de entrenamiento, y el autor afirma que sustituir las tareas de test por cadenas aleatorias produce el mismo `adapter_model.safetensors` bit a bit.

## Capacidades

- Generación de código Python: el adaptador está entrenado específicamente sobre tareas algorítmicas y de estructuras de datos, con 4.705 posiciones de token de código BPE activas y 31 de 31 palabras clave de Python activas.
- Generación de texto general: hereda las capacidades del modelo base Qwen3.8-27B, aunque el adaptador solo modifica tres módulos de las dos últimas capas.
- Razonamiento algorítmico: el autor reporta mejoras en tareas de tipo AlgoGen y en benchmarks externos (HumanEval, MBPP, DS-1000) sin regresiones declaradas.
- Tool calling y function calling: no documentado en la información disponible para el adaptador; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking, visión o audio: no documentado.

## Casos de uso

- Evaluación de métodos de ajuste sin retropropagación: el adaptador sirve como artefacto reproducible para comparar PolyStep frente a MeZO u otras técnicas de orden cero sobre un modelo de 27B, ya que la model card incluye los porcentajes por split (Train-40, HeldOut-16, All-56) para cada variante.
- Investigación sobre fuga de test en adaptadores de código: el pipeline documenta cómo calcular bases PCA/SVD y máscaras exclusivamente sobre el split de entrenamiento, lo que resulta útil para auditar adaptadores propios y detectar contaminación por benchmarks como HumanEval+ o MBPP+.
- Generación asistida de funciones Python en entornos de prototipado: el adaptador está entrenado en tareas algorítmicas y de estructuras de datos, por lo que puede emplearse para completar funciones y resolver ejercicios en cuadernos o scripts de exploración.
- Reproducción en hardware de consumo: al ser un LoRA de 1,2 GB sobre un modelo que el autor ejecuta en una M4 Max de 128 GB, permite experimentar con ajuste de código en estaciones de trabajo Apple sin clústeres GPU.
- Estudio de correcciones numéricas en softmax: los dos "fixes" de Barron descritos en el paper pueden probarse de forma aislada cargando el adaptador y comparando la distribución de logits en los tokens de "cliff" (1.556 de 4.705 posiciones con Δz > 6,22).
- Docencia y formación en optimización de modelos: el repositorio incluye scripts (`extract_real_qwen38_features.py`, `run_real_qwen27b_coding.py`) que ilustran un pipeline completo de extracción de características y ajuste forward-only sobre un transformer híbrido.

## Benchmarks y rendimiento

Los datos publicados en la model card son porcentajes de acierto sobre conjuntos internos del autor, no benchmarks estándar independientes. Se reproducen a continuación tal cual, sin normalización:

| Variante | Train-40 | HeldOut-16 | All-56 |
|---|---|---|---|
| Base Qwen3.8-27B | 70,00% (28/40) | 50,00% (8/16) | 64,29% (36/56) |
| LoRA capa 63 (2-fold OOF) | 67,86% (38/56) | — | — |
| Multi-Layer Null | — | — | 75,00% (42/56) |
| MeZO bf16 | 72,50% (29/40) | 50,00% (8/16) | 66,07% (37/56) |
| PolyStep estándar | 75,00% (30/40) | 62,50% (10/16) | 71,43% (40/56) |
| Barron loss | 75,00% (30/40) | 62,50% (10/16) | 71,43% (40/56) |
| Barron transport | 92,50% (37/40) | 62,50% (10/16) | 83,93% (47/56) |
| Barron 240x (configuración final) | 92,50% (37/40) | 68,75% (11/16) | 85,71% (48/56) |

Resultados adicionales declarados por el autor:

| Conjunto | Pass@1 | Aserciones |
|---|---|---|
| Open-ended 40 (32 externos + 8 AlgoGen reservados) | 39/40 (97,50%) | 158/160 (98,75%) |
| Externos 32 (HumanEval + MBPP + DS-1000) | 31/32 (96,88%) | 126/128 (98,44%) |
| AlgoGen reservados 8 | 8/8 (100,00%) | 32/32 (100,00%) |

No se han publicado resultados de benchmarks en la información disponible más allá de estas cifras internas. No se han verificado de forma independiente.

## Requisitos de hardware

- El adaptador en sí ocupa 1,2 GB en bf16 y se carga junto al modelo base Qwen3.8-27B; la VRAM total vendrá determinada por el modelo base y su cuantización, no por el adaptador.
- El autor ejecuta el pipeline completo (modelo base + adaptador + evaluación) en una Apple M4 Max con 128 GB de memoria unificada, usando Metal SIMD para `gated_delta_update`, SDPA y una implementación CPU de 8 hilos para la QR de Haar.
- GPU recomendadas: no disponibles en la información proporcionada. Para el modelo base de 27B en bf16 se necesitaría aproximadamente 54 GB de VRAM más overhead, lo que excluye GPUs de consumo de 24 GB salvo con cuantización agresiva; este cálculo es una estimación derivada del tamaño del modelo base, no un dato publicado.
- Cabe en GPU de consumo: no disponible como dato verificado; el adaptador por sí solo sí, pero requiere el modelo base.
- Opciones de despliegue: la librería declarada es PEFT, por lo que se integra con el ecosistema Hugging Face Transformers. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y al tratarse de un adaptador LoRA sobre un modelo híbrido con GatedDeltaNet, la compatibilidad con motores de inferencia alternativos no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados en la información disponible: se trata de un adaptador LoRA experimental sobre un modelo base concreto, no de un modelo independiente. La comparación más cercana es con el propio modelo base y con las variantes de ajuste documentadas por el autor:

| Artefacto | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Barron 240x) | LoRA r=16 sobre 27B | No disponible | 85,71% All-56 (interno) | Apache 2.0 | Hugging Face, 214 descargas |
| Qwen3.8-27B base | 27B | No disponible | 64,29% All-56 (interno) | Según modelo base | Hugging Face |
| MeZO bf16 sobre el mismo base | LoRA equivalente | No disponible | 66,07% All-56 (interno) | — | Solo documentado en la model card |
| PolyStep estándar sobre el mismo base | LoRA equivalente | No disponible | 71,43% All-56 (interno) | — | Solo documentado en la model card |

## Limitaciones y advertencias

- El conjunto de entrenamiento es minúsculo (40 tareas, 3.378 posiciones de token) y el de evaluación reservado aún más (16 tareas, 1.327 posiciones); los porcentajes publicados tienen una varianza muy alta y no son comparables con benchmarks estándar.
- Los benchmarks declarados (HumanEval, MBPP, DS-1000, AlgoGen) son internos y no han sido verificados de forma independiente; el autor afirma cero regresiones, pero no se aportan logs ni scripts de evaluación ejecutables fuera de su entorno.
- La model card describe el artefacto como `RealCoder-v3` mientras el repositorio se llama `UltraCoder-v2`; además, el autor menciona versiones contaminadas previas (`RealCoder-v4`/`v5`) en cuarentena, lo que indica un historial de problemas de fuga de test en el proyecto.
- El adaptador solo modifica tres módulos de las dos últimas capas; su efecto sobre capacidades generales (razonamiento, multilingüismo, tool calling) es presumiblemente nulo o marginal, y no se documenta.
- No se documentan idiomas soportados, longitud de contexto, sesgos conocidos ni riesgo de alucinación específico del adaptador; estas propiedades heredan las del modelo base Qwen3.8-27B.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base; verificar los términos de `Qwen/Qwen3.8-27B` antes de uso comercial.
- El pipeline depende de hardware Apple Silicon (M4 Max) y de implementaciones Metal específicas; la reproducibilidad en GPU NVIDIA/AMD no está documentada.
- El modelo está orientado a código Python y a tareas algorítmicas; no debe esperarse un rendimiento equivalente en otros lenguajes o dominios.
- Al ser un adaptador PEFT sobre una arquitectura híbrida con GatedDeltaNet, la compatibilidad con motores de inferencia de alto rendimiento (vLLM, TGI) y con cuantizaciones GGUF no está garantizada ni documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-64Layer-UltraCoder-v2
- Paper de las correcciones de softmax: https://arxiv.org/abs/2610.31642
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de extracción de características (referenciado en la model card): `extract_real_qwen38_features.py`
- Script de ajuste y evaluación (referenciado en la model card): `run_real_qwen27b_coding.py`
- Directorio de artefactos contaminados en cuarentena: `quarantine_contaminated/`
- Checkpoint exportado: `checkpoints/Qwen3.8-27B-BarronPolyStep-RealCoder-v3/`
