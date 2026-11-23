# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2

## Resumen

El modelo `semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13`, perteneciente a la familia "SemSimula" de modelos de lenguaje conservativos. Se trata de un modelo de generación de texto en inglés, no basado en transformer ni en atención, que emplea mecánica lagrangiana y potenciales escalares para modelar la dinámica de los tokens. Con 76,6 millones de parámetros y una ventana de contexto de 512 tokens (bloque de entrenamiento), está entrenado sobre OpenWebText con un presupuesto de 532.480.000 tokens.

La innovación principal de esta tercera generación ("Gen 3") son los "registros de modo de Poisson" (Poisson-mode registers): 64 modos compartidos que los tokens van poblando a su paso, cada uno modelado como un pozo gaussiano cuya profundidad crece con su ocupación, de modo que el contexto anterior profundiza los pozos en los que caen los tokens posteriores. Además, los pozos se integran de forma exacta dentro del mismo flujo amortiguado del modelo base SR2, manteniendo la propiedad de que toda fuerza es un gradiente.

El modelo es relevante en el ámbito de la investigación en arquitecturas alternativas a los transformers, ya que demuestra que un modelo conservativo (energy-based, attention-free, con memoria constante en inferencia) puede alcanzar una perplejidad de validación de 54,63 en OpenWebText, mejorando un 6,3 % a su predecesor SR2 y quedando a un 9,7 % del brazo GPT-2 emparejado en presupuesto de tokens. No obstante, el propio autor lo clasifica como no listo para refinamiento bajo su criterio pre-registrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atención, basado en mecánica lagrangiana y potencial escalar, con registros de modo de Poisson e integrador exacto (BAOAB / CfC) |
| Parametros totales | 76,6 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifican safetensors ni GGUF |
| Dimension oculta | 384 (d384) |
| Profundidad | 2 capas (l2) |
| Modos de Poisson | 64 (pm64) |
| Ancho de eigensolve | 16 (pmx16) |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Dataset | Skylion007/openwebtext |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo que abandona el mecanismo de atención y el bloque transformer convencional. En su lugar, cada token se trata como una partícula cuyo movimiento se rige por un potencial escalar: la fuerza que actúa sobre cada token es el gradiente de dicho potencial, lo que garantiza que el sistema sea conservativo (de ahí la etiqueta "fully-conservative"). El modelo se integra mediante un esquema BAOAB (integrador simpléctico de dinámica de Langevin) combinado con una formulación CfC (closed-form continuous-time), y emplea un flujo amortiguado exacto para los modos rígidos del potencial Vθ, además de un "kick" explícito para el resto. La inferencia tiene memoria constante, una propiedad derivada de la ausencia de atención y de la estructura de registros.

La generación 3 introduce los registros de modo de Poisson: 64 modos compartidos, cada uno con un centro μ, una anchura κ, una probabilidad de supervivencia λ por token y una profundidad por capa. Cada token crea partículas en un modo según su solapamiento `exp(−κ²‖h − μ‖²)`, y esas partículas sobreviven de token a token con probabilidad λ, de modo que la ocupación φ que ve un token es un recuento con decaimiento sobre los tokens estrictamente anteriores. El token siente entonces una suma de pozos gaussianos con profundidades φ × profundidad, y su fuerza es el gradiente de esa suma en sus propias coordenadas. La ocupación es exactamente la media de un proceso de inmigración-muerte de Poisson (estado coherente del formalismo de Doi–Peliti bosónico), aunque el acoplamiento es lineal en la ocupación, por lo que no se observan fluctuaciones bosónicas, solo su media.

Los pozos se integran de forma exacta: al inicio de cada paso se congela su parte cuadrática y se añade al flujo amortiguado exacto de SR2. Cada pozo aporta su fuerza y curvatura isótropa α, más la parte de rango de los 16 pozos más fuertes del token, formando un muelle en las 384 direcciones que es indefinido (la pendiente exterior de un pozo atractivo es inestable radialmente); se diagonaliza mediante un eigensolve de ancho 32 que maneja curvatura negativa, y cada modo se integra como oscilador amortiguado exacto o movimiento hiperbólico exacto, con fricción incluida. El "kick" explícito de la capa 1 cae de 0,94 (en PM1) a 0,288. El entrenamiento se realizó con gradientes "live" (sin parada de gradiente en los registros) y con un presupuesto de tokens emparejado con el resto de modelos de la escalera (532,48 M tokens), lo que equivale a unos 7 tokens por parámetro, un tercio de la ratio óptima en cómputo: todos los resultados corresponden a un modelo infraentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés, con un enfoque de investigación más que de producción.
- Modelado de dependencias de contexto mediante pozos gaussianos cuya profundidad crece con la ocupación de los modos, lo que permite que el contexto previo module la dinámica de tokens posteriores.
- Propiedad conservativa verificada sobre los pesos entrenados: toda fuerza es un gradiente, lo que permite analizar el modelo como un sistema físico.
- Memoria constante en inferencia, derivada de la ausencia de atención y de la estructura de registros.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingües limitadas al inglés.
- No dispone de modo "thinking", visión ni audio.
- Sin mecanismo de atención: no hay mapa de atención interpretable al uso.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas reproducible para estudiar modelos conservativos, sin atención y con memoria constante, comparando perplejidad bajo un presupuesto de tokens emparejado.
- Estudio de mecanismos de memoria física: los registros de modo de Poisson permiten analizar cómo la ocupación de modos (proceso de inmigración-muerte) modula la dinámica de tokens, útil para investigar memoria de largo alcance sin atención.
- Experimentos de ablación controlada: la escalera de modelos (F3.1, SR2, PMX, PM1, Fock-PARFLM) permite aislar el efecto de cada componente (registros, integración exacta de pozos) sobre la perplejidad.
- Validación de integradores numéricos: el modelo documenta el uso de BAOAB, CfC y eigensolves con curvatura negativa, útil para quienes investigan integradores simplécticos en modelos generativos.
- Generación de texto de bajo coste en entornos de investigación: con 76,6 M de parámetros y 0,6 GB de repositorio, puede ejecutarse en hardware modesto para experimentos de generación en inglés.
- Reproducción de estudios pre-registrados: el autor publica criterios pre-registrados y resultados de salud del entrenamiento (0 activaciones de watchdog, 0 picos), lo que facilita la replicación de experimentos de mecánica estadística aplicada a lenguaje.
- Análisis de eficiencia energética en inferencia: la memoria constante y la ausencia de atención permiten estudiar el coste computacional de alternativas a transformers en despliegues con recursos limitados.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados, `verified: false`):

| Modelo | Perplejidad de validación (OpenWebText, bloque 512) | Relativo a este modelo | Relativo a GPT-2 |
|---|---:|---:|---:|
| **Este modelo (PMX)** | **54,63** | — | **1,097×** |
| SR2 (mismo modelo sin registros) | 58,32 | −6,3 % | 1,171× |
| F3.1 (conservativo con paso dividido) | 57,76 | −5,4 % | 1,160× |
| PM1 (registros con pozos explícitos sobre F3.1, no publicado) | 55,17 | −1,0 % | 1,108× |
| Fock-PARFLM, L=2, gradientes live (no conservativo) | 53,12 | +2,8 % | 1,066× |
| Brazo gpt2-matched | 49,81 | +9,7 % | 1,000× |

Notas del autor: la perplejidad "settled" es la media de las tres últimas evaluaciones (56,07; 54,61; 53,21); la mejor fue 53,15 en el paso 30.500. El coste de los registros es de 2,98 s por paso frente a 1,72 s de SR2 en una A100, debido a un eigensolve por lotes de ancho 32 por token y capa. Salud del entrenamiento: 0 activaciones de watchdog, 0 picos; la norma global del gradiente superó 1,0 en 15 de 490 pasos registrados tras la sonda (máximo 1,50). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 76,6 M de parámetros en precisión completa (fp32) se estiman unos 0,31 GB solo de pesos, a los que hay que sumar estados del integrador y buffers de los 64 modos y del eigensolve.
- GPU recomendadas: el autor reporta entrenamiento y evaluación en A100; para inferencia cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros, aunque el eigensolve por token y capa añade coste computacional.
- Opciones de despliegue: el modelo usa la librería `pytorch` y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no ser un transformer estándar, es probable que requiera código propio del autor.
- Latencia y throughput: el autor reporta 2,98 s por paso de entrenamiento en A100 (frente a 1,72 s de SR2), lo que indica un coste por paso notablemente superior al de su predecesor; no se reportan métricas de latencia de inferencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo (PMX) | 76,6 M | 512 | 54,63 | CC-BY-4.0 | Hugging Face |
| SR2 (sin registros) | No disponible | 512 | 58,32 | No disponible | Hugging Face |
| F3.1 (conservativo, paso dividido) | No disponible | 512 | 57,76 | No disponible | Hugging Face |
| Fock-PARFLM L=2 (no conservativo) | No disponible | 512 | 53,12 | No disponible | Hugging Face |
| Brazo gpt2-matched | No disponible | 512 | 49,81 | No disponible | Hugging Face |

No se dispone de comparación con modelos de la misma categoría fuera de la escalera del autor (por ejemplo, GPT-2 pequeño o modelos transformer de tamaño similar) más allá de la referencia relativa a GPT-2 que el autor incluye en su tabla.

## Limitaciones y advertencias

- Modelo infraentrenado: con 532,48 M tokens y 76,6 M de parámetros, la ratio es de unos 7 tokens por parámetro, un tercio de la óptima en cómputo; los resultados no reflejan el potencial de la arquitectura con más entrenamiento.
- Bajo el criterio pre-registrado del autor, este modelo **no** está listo para refinamiento (a diferencia de SR2).
- Solo inglés: no hay soporte multilingüe documentado.
- Contexto limitado a 512 tokens, insuficiente para muchas aplicaciones de producción.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de veracidad ni de sesgos.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- El acoplamiento lineal en la ocupación implica que el modelo no captura fluctuaciones bosónicas, solo su media, lo que limita su interpretación física.
- Coste computacional elevado por paso (2,98 s en A100) debido al eigensolve por token y capa, lo que puede penalizar el despliegue en producción.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un modelo de investigación sin garantías, su uso en producción requiere validación adicional.
- No se documentan cuantizaciones ni formatos GGUF, lo que dificulta el despliegue en herramientas estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Modelo SR2 (base sin registros): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Modelo F3.1: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Modelo Fock-PARFLM L=2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
