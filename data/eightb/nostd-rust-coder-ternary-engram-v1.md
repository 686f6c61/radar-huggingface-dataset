# eightb/nostd-rust-coder-ternary-engram-v1

## Resumen

`nostd-rust-coder-ternary-engram-v1` es un modelo de generacion de texto de 18,37 millones de parametros desarrollado por el usuario `eightb` (8b.is, `@PeetPedro`), especializado en la generacion de codigo Rust en entornos `#![no_std]`. Se trata de un modelo experimental de escala muy reducida que combina pesos ternarios de 1,58 bits (BitNet b1.58) con una capa de memoria condicional inspirada en el `Engram` de DeepSeek, entrenado de extremo a extremo en una Apple M1 Max de 64 GB mediante el framework propietario `MLX-QUANT v2.1.0`.

El modelo no busca competir con asistentes de codigo de gran escala, sino servir como banco de pruebas reproducible de un conjunto de tecnicas de cuantizacion y entrenamiento: `H-BitLinear` (W1.58A4 con transformada de Walsh-Hadamard), QAT sin atrapamiento `Tequila`, destilacion dual `BitDistill` y exportacion sub-1,58 bits `BITCOS`. Su interes actual reside en la reproducibilidad del pipeline completo en hardware de consumo y en la publicacion de metricas de entrenamiento, compresion y sondas de colapso.

Arquitectonicamente es un transformer denso de 8 capas con `d_model=512`, 8 cabezas y `d_ff=1024`, con pesos de proyeccion ternarios y embeddings/cabeza LM en precision FP. La longitud de contexto no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con `BitLinear` ternario (BitNet b1.58), `SubLN` RMSNorm, FFN con ReLU al cuadrado y capa `EngramMemoryLayer` en capas [0, 3] |
| Parametros totales | 18.373.888 (16.777.216 ternarios en `BitLinear` + tablas Engram + embeddings/cabeza en FP) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria W1.58A4 (pesos ternarios, activaciones INT4 simetricas); exportacion `BITCOS` a 1,55604 bits por peso |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (checkpoint completo MLX-QUANT), `model.bitcos.npz` (formato empaquetado BITCOS) |

## Arquitectura y entrenamiento

El modelo sigue la familia BitNet b1.58: cada capa `BitLinear` sustituye los pesos FP por ternarios {-1, 0, +1} y aplica normalizacion `SubLN` (RMSNorm) con una FFN de ReLU al cuadrado. La variante `H-BitLinear` (BitNet v2) introduce una transformada rapida de Walsh-Hadamard ortonormal (`hadamard_wht_mx`) sobre las activaciones y un cuantizador simetrico INT4, de modo que el computo efectivo es W1.58A4. La geometria es de 8 capas, `d_model=512`, 8 cabezas y `d_ff=1024`.

El entrenamiento se realizo en dos fases. En la fase 0 se entreno un profesor denso y en la fase 1 se destilo en el estudiante ternario mediante `BitDistill`, con una perdida combinada de `0.65 * CrossEntropy asimetrica (3:1) + 0.35 * KL(T=2.0)`. El QAT incorpora `Tequila` (reactivacion con sesgo dinamico, `lambda=0.001`) para rescatar pesos ternarios atrapados en la zona muerta, y un schedule `p/q` WSD con cooldown `OneMinusSqrt` y LR desacoplado de `0.2x` en la cabeza LM. La capa `Engram` anade memoria condicional mediante tablas de N-gramas (`K=4` cabezas, N-gramas `(2, 3)`, `table_size=4099`) con compuerta sigmoide dependiente de contexto. El entrenamiento completo consumio 322,5 s en la GPU Metal de una M1 Max.

## Capacidades

- Generacion de texto autoregresiva en ingles, con especializacion en codigo Rust `#![no_std]`.
- Continuacion de firmas y cuerpos de funciones Rust (por ejemplo, `pub const fn gcd_u64`).
- Tokenizacion UTF-8 a nivel de byte sin OOV (`zero-OOV`), segun la especificacion del tokenizer.
- Memoria condicional de N-gramas mediante la capa Engram, orientada a recuperar patrones locales repetidos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Capacidades especiales: modo thinking, vision o audio no disponibles.

## Casos de uso

- Prototipado de asistentes de codigo embebido: el modelo cabe holgadamente en memoria y puede ejecutarse en Apple Silicon para autocompletar funciones Rust en entornos sin asignador (`no_std`), un nicho poco cubierto por asistentes generalistas.
- Investigacion en cuantizacion ternaria: sirve como referencia reproducible para validar tecnicas como `H-BitLinear`, `Tequila` o `BitDistill` con un pipeline completo documentado y metricas de entrenamiento publicadas.
- Evaluacion de compresion BITCOS: el checkpoint `model.bitcos.npz` permite medir el impacto real de la exportacion sub-1,58 bits (1,55604 bpw) en la calidad de generacion.
- Generacion de constantes y tablas en Rust: util para producir fragmentos como `pub const NOSTD_K00: u32 = ...`, aunque la fiabilidad medida en las sondas canary es baja.
- Educacion y divulgacion: ejemplo didactico de entrenamiento end-to-end de un modelo ternario en hardware de consumo, con telemetria paso a paso en `training_metrics.json`.
- Pruebas de pipelines MLX en macOS: banco de pruebas para integrar `MLX-QUANT v2.1.0` en flujos de desarrollo en Apple Silicon antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Cross-entropy en validacion Rust `#![no_std]` (held-out) | 1,9184 |
| Cross-entropy del profesor denso (fase 0) | 2,5927 |
| Cross-entropy del estudiante al inicializar QAT | 4,7824 |
| Canary exact recall (`Linger & Lose`) | 0,0625 (2/32, `collapse_detected=True`) |
| Bits efectivos por peso (BITCOS) | 1,55604 bpw |
| Densidad de ceros en pesos empaquetados | 44,4 % |
| Compresion frente a FP16 | 10,28x |
| Throughput de prefill/forward en M1 Max (batch=1, seq=64) | 1515,4 tok/s |
| Tiempo total de entrenamiento E2E | 322,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP16 (18,37 M de parametros); el checkpoint completo ocupa aproximadamente 0,1 GB en el repositorio.
- GPU recomendadas: Apple Silicon (M1 Max validado por el autor) mediante MLX; cualquier GPU con soporte de los formatos de destino.
- Cabe en GPU de consumo: si, incluidas GPU integradas y Apple Silicon de gama base; tambien es viable en CPU.
- Opciones de despliegue: `MLX-QUANT v2.1.0` (framework original), MLX en macOS; soporte de vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: 1515,4 tok/s medidos en prefill/forward con `batch=1, seq=64` en M1 Max (Metal GPU).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de modelos ternarios experimentales de muy baja escala (menos de 20 M de parametros) con enfoque en codigo Rust `no_std`; no se identifican alternativas publicas directamente comparables con metricas equivalentes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eightb/nostd-rust-coder-ternary-engram-v1` | 18,37 M | No disponible | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Escala muy reducida (18,37 M de parametros): la calidad de generacion es limitada y no apta para produccion general.
- La sonda `Linger-and-Lose` reporta `collapse_detected=True` con solo 2 de 32 recuperaciones exactas; los ejemplos canary muestran valores generados distintos de los esperados.
- Riesgo elevado de alucinacion en identificadores, constantes y APIs de Rust.
- Idiomas: solo ingles declarado; sin soporte multilingue.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Entrenamiento y validacion limitados a Rust `#![no_std]`; el rendimiento fuera de ese dominio no esta caracterizado.
- Benchmarks no verificados de forma independiente (`verified: false` en la model-index).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye como material de investigacion.
- Dependencia del ecosistema `MLX-QUANT` y de Apple Silicon para reproducir el pipeline original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightb/nostd-rust-coder-ternary-engram-v1
- Framework MLX-QUANT: https://github.com/8b-is/MLX-QUANT
- Proyecto OmniLLL: https://codeberg.org/8b-is/OmniLLL-Liberate-Literate-Love
- Sitio del autor: https://g8t.is
- Paper BitNet b1.58: https://arxiv.org/abs/2504.12285
- Paper BitNet v2 (`H-BitLinear`): https://arxiv.org/abs/2504.18415
- Paper Tequila: https://arxiv.org/abs/2509.23809
- Paper BitDistill: https://arxiv.org/abs/2510.13998
- Paper DeepSeek Engram: https://arxiv.org/abs/2601.07372
- Paper Linger & Lose: https://arxiv.org/abs/2609.32902
- Paper BITCOS: https://arxiv.org/abs/2609.16338
