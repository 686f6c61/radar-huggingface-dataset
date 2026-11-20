# MatterWaveAI/grt-30m-mor

## Resumen

GRT-30M-MoR es un modelo de lenguaje de tipo base, desarrollado por MatterWaveAI, que constituye la variante "Mixture-of-Rotations" (MoR) del modelo `MatterWaveAI/grt-30m`. Se trata de un transformer causal de 31,63 millones de parametros almacenados (12,07 M en el backbone no-embedding, distribuidos en 12 bloques) que sustituye por completo las capas `nn.Linear` por cascadas de rotaciones de Givens planas de 2x2, organizadas sobre la estructura del grupo de Lie abeliano SO(2)^P. La innovacion central es el enrutamiento de tokens entre cuatro expertos rotacionales (E=4) por bloque, mezclando angulos y escalas en el espacio de parametros antes de ejecutar una unica cascada trigonometrica por etapa.

El modelo parte del checkpoint base `grt-30m` (29,3 M de parametros) y se "upcyclea" mediante perturbaciones angulares Walsh-Hadamard de suma cero, seguido de una especializacion en un corpus de cuatro dominios (geometria rotacional, ciencia y fisica, codigo y algoritmos, razonamiento y lenguaje). El resultado reportado por el autor es una perdida de validacion de 0,4829 y una perplejidad de 1,62, con una carga de enrutamiento casi uniforme entre los cuatro expertos (entropia de 1,9999 sobre 2,0000 bits).

Es relevante ahora por su enfoque poco convencional: demuestra que es posible obtener capacidad funcional equivalente a un MoE clasico sin ninguna matriz densa `nn.Linear`, usando exclusivamente rotaciones geometricas y un router basado en alineamiento de fase cosenoidal. Con licencia Apache 2.0 y un tamano que cabe en cualquier GPU consumer, es un banco de pruebas accesible para investigacion en arquitecturas alternativas al transformer denso convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GRTForCausalLM` (`model_type: "grt"`), Mixture-of-Rotations con rotaciones de Givens y algebra de Clifford |
| Parametros totales | 31.634.086 (31,63 M); backbone no-embedding: 12.068.785 (12,07 M) |
| Parametros activos | 4 expertos rotacionales por bloque (48 en total); el router mezcla angulos antes de la rotacion, no activa subconjuntos de pesos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario Qwen 3 BPE de 151.669 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura GRT sustituye las proyecciones lineales por cascadas de rotaciones de Givens de 2x2 sobre pares de dimensiones, operando en el grupo SO(2)^P en cada etapa tipo "butterfly". Cada uno de los 12 bloques `GRTFeedForward` mantiene `ffn_n_experts = 4` cascadas rotacionales; dado un vector de probabilidades de router `w[n, e]` que suma 1 sobre los expertos, el angulo efectivo y la escala positiva en cada etapa y par se calculan como combinacion lineal ponderada de los angulos y `softplus` de las escalas de cada experto, y despues se aplica una unica rotacion `(cos θ_blended, sin θ_blended)`. Esto proporciona, segun el autor, 4x de capacidad rotacional FFN con 1x de coste trigonometrico. La configuracion incluye `hidden_size = 256`, `intermediate_size = 1.024`, 12 capas, 4 cabezas de atencion con `head_dim = 64`, `n_qkv_rotations = 11`, `n_mixer_rotations = 1` y `ffn_n_rotations = 21`.

El router (`GRTRotationalRouter`) no usa ninguna capa `nn.Linear`: enruta por alineamiento cosenoidal escalado entre pares de coordenadas planas normalizadas en L2 y E=4 prototipos de angulo de fase aprendidos, con temperatura `softplus(output_scale)`. El entrenamiento parte del modelo base `grt-30m` mediante perturbaciones angulares Walsh-Hadamard de suma cero (la suma de las perturbaciones sobre los expertos es nula, preservando la funcion original) y despues se especializa en cuatro dominios con el optimizador `PairAdam` y balanceo de carga estilo Switch. El autor reporta entrenamiento en una Intel Arc 140T XPU (`xpu:0`) y en ROCm `gfx1151`, con perdida de validacion de 0,5115 en XPU y 0,4829 en ROCm. Tambien se documenta una ablacion de 8 optimizadores geometricos, simpecticos y giroscopicos (PairAdam, PolarNaturalAdam, CyclideAdam, HuygensA...) sobre 80 pasos de especializacion en `blocks[8:12]` mas `final_norm`.

## Capacidades

- Generacion de texto autoregresiva con cabeza cosenoidal polar atada (tied polar cosine head) y vocabulario Qwen 3 BPE de 151.669 tokens.
- Razonamiento y lenguaje general, con especializacion declarada en el dominio `reasoning_and_language`.
- Generacion de codigo y algoritmos, con especializacion declarada en `code_and_algorithms` (perdida de 0,3669 en ROCm).
- Ciencia y fisica, con especializacion declarada en `science_and_physics` (perdida de 0,5155).
- Geometria rotacional, con especializacion declarada en `rotational_geometry` (perdida de 0,4772).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en arquitecturas sin capas lineales: el modelo sirve como referencia reproducible para estudiar si un transformer puede funcionar exclusivamente con rotaciones de Givens y un router de fase, gracias a su tamano reducido (31,63 M) y a la documentacion detallada de la ablacion de optimizadores.
- Experimentacion con enrutamiento MoE alternativo: permite comparar el enrutamiento por alineamiento cosenoidal sobre (S^1)^128 frente a routers clasicos con `nn.Linear`, midiendo entropia de carga y divergencia angular entre expertos con las metricas ya publicadas por el autor.
- Pruebas de "upcycling" de modelos densos a MoE: el procedimiento de perturbacion Walsh-Hadamard de suma cero y la especializacion en cuatro dominios constituyen una receta replicable para convertir un checkpoint denso pequeno en una variante con multiples expertos.
- Prototipado rapido en hardware modesto: con 31,63 M de parametros y un repo de 0,1 GB, cabe en cualquier GPU consumer y permite iterar en local sobre tecnicas de entrenamiento geometrico (PairAdam, PolarNaturalAdam) sin infraestructura dedicada.
- Evaluacion de optimizadores geometricos: el modelo y la ablacion de 8 optimizadores publicada facilitan reproducir experimentos sobre `blocks[8:12]` y `final_norm` con `batch_size = 36`, `lr = 3.5e-3` y `max_angular_step = 0.08`.
- Generacion de texto en dominios tecnicos acotados: dada su especializacion en codigo, fisica y geometria, puede emplearse como generador de borradores en cuadernos de investigacion o documentacion tecnica, siempre con revision humana por su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta metricas de perdida y perplejidad en validacion retenida y por dominio:

| Metrica | Upcycle inicial | Especializacion XPU | Especializacion ROCm `gfx1151` |
|---|---|---|---|
| Perdida de validacion retenida | 5,8467 | 0,5115 | 0,4829 |
| Perplejidad de validacion retenida | 346,10 | 1,67 | 1,62 |
| Perdida `code_and_algorithms` | 5,4092 | 0,4334 | 0,3669 |
| Perdida `rotational_geometry` | 6,6421 | 0,4991 | 0,4772 (0,4747 con PolarNaturalAdam) |
| Perdida `science_and_physics` | 5,3337 | 0,5293 | 0,5155 |
| Perdida `reasoning_and_language` | 6,1720 | 0,6442 | 0,6466 (con PolarNaturalAdam) |
| Carga media de enrutamiento (E=4) | [0,25, 0,25, 0,25, 0,25] | [0,250, 0,248, 0,256, 0,245] | [0,250, 0,250, 0,254, 0,246] (entropia 1,9999/2,0000 bits) |

Ablacion de optimizadores (80 pasos, `batch_size = 36`, `lr = 3.5e-3`, `max_angular_step = 0.08`, `seed = 42`), primeros puestos:

| Puesto | Optimizador | Perdida val. | PPL val. | `code_and_algorithms` | `rotational_geometry` | `science_and_physics` | `reasoning_and_language` | Tiempo (s) |
|---|---|---|---|---|---|---|---|---|
| 1 | PairAdam | 0,4829 | 1,6208 | 0,3669 | 0,4772 | 0,5155 | 0,6553 | 180,15 |
| 2 | PolarNaturalAdam | 0,4848 | 1,6239 | 0,3744 | 0,4747 | 0,5226 | 0,6466 | 180,75 |
| 3 | CyclideAdam | 0,5006 | 1,6498 | 0,3758 | 0,4986 | 0,5426 | 0,6718 | 180,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (31,63 M de parametros, aproximadamente 127 MB de pesos) y del orden de decenas de MB en fp16/bf16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte para `transformers` y safetensors; el autor entreno en Intel Arc 140T XPU y en ROCm `gfx1151`, por lo que ambas plataformas estan verificadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers` (libreria declarada); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. El autor solo reporta tiempos de entrenamiento (aproximadamente 180 s para 80 pasos de especializacion en ROCm `gfx1151`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GRT-30M-MoR | 31,63 M (12,07 M backbone) | no disponible | Apache 2.0 | Mixture-of-Rotations, 0 capas `nn.Linear`, 4 expertos rotacionales por bloque |
| MatterWaveAI/grt-30m | 29,31 M | no disponible | no disponible | Modelo base denso del que deriva; sin enrutamiento por expertos |
| Alternativas de ~30 M tipo GPT-2 small | ~124 M (GPT-2 small) | 1.024 tokens (GPT-2 small) | MIT (GPT-2) | Referencia clasica de transformer denso; no comparable en arquitectura |

No se dispone de datos de benchmarks estandar para establecer una comparacion de rendimiento con modelos de la misma categoria. La comparativa se limita a parametros, licencia y enfoque arquitectonico.

## Limitaciones y advertencias

- Modelo de tipo base: no esta ajustado con RLHF ni DPO segun la informacion disponible, por lo que no debe usarse directamente como asistente conversacional sin ajuste posterior.
- Tamano muy reducido (31,63 M de parametros): la calidad de generacion en tareas abiertas sera limitada en comparacion con modelos de mayor escala; las metricas de perplejidad reportadas corresponden a un corpus de especializacion acotado y no garantizan generalizacion.
- Riesgo de alucinacion: alto en tareas de conocimiento factual, dado el escaso numero de parametros y la ausencia de benchmarks de fidelidad.
- Sesgos conocidos: no disponibles; el autor no documenta evaluaciones de sesgo ni de toxicidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados no estan especificados; el vocabulario Qwen 3 BPE sugiere cobertura multilingue, pero no hay confirmacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `grt-30m` tiene licencia no declarada en la informacion disponible, lo que conviene verificar antes de un uso comercial en produccion.
- Caveat de produccion: la ausencia de soporte documentado para vLLM, llama.cpp u otros motores de inferencia optimizados limita su despliegue a `transformers` o endpoints compatibles.
- Las cifras de perdida y perplejidad provienen del propio autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
