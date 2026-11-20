# akarta-315h/imf-tinystories

## Resumen

IMF (Interaction Model Foundations) es una familia de modelos de generación de texto de pequeño tamaño (en torno a 5,4-5,9 millones de parámetros) desarrollada por Stratum Research Group (SRG) y publicada bajo el identificador `akarta-315h/imf-tinystories` en Hugging Face. El modelo se presenta como una alternativa a la atención causal softmax cuadrática estándar, sustituyéndola por dos mecanismos propios: Symmetric-Antisymmetric Virtual Grid Attention (SAVG) y Higher-Dimensional Polytope Landmark Connectors (HDPLC). La propuesta técnica consiste en proyectar los estados latentes en sectores ortogonales del álgebra de Lie (Sym² ⊕ ∧²) y enrutar trayectorias continuas a través de hipercaras de politopos regulares.

El repositorio incluye tres checkpoints entrenados sobre el corpus TinyStories (texto en inglés muy simple), con variantes de arquitectura que difieren en la aridad del binding simplex: Arity-3, Base Multi-Head SAVG y Arity-4. Los tres se entrenaron con 10.000, 10.000 y 3.000 pasos respectivamente, y reportan perplejidades de validación de 14,34, 19,51 y 38,67. El modelo está pensado como banco de pruebas de investigación más que como modelo de producción: su escala es minúscula y su dominio de entrenamiento es narrativa infantil en inglés.

La relevancia declarada por el autor gira en torno a tres propiedades: separación exacta de fase en pares de asociación direccional (A→B frente a B→A), recuperación del 100% en Needle-In-A-Haystack hasta 16.384 tokens y memoria constante O(1) en inferencia autorregresiva. Además, el autor afirma haber verificado formalmente en Lean 4 siete objetivos (cotas de coordenadas y antisimetría de reflexión) sin dependencias externas de Mathlib.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal SAVG (Symmetric-Antisymmetric Virtual Grid Attention) y HDPLC (Higher-Dimensional Polytope Landmark Connectors); binding simplex de aridad variable |
| Parametros totales | 5.425.640 (Base SAVG), 5.917.398 (Arity-3), 5.936.934 (Arity-4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (según validación NIAH reportada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención softmax causal cuadrática por SAVG, que proyecta los estados latentes en dos subespacios complementarios: la parte simétrica (Sym²) y la parte antisimétrica (∧²) del álgebra de Lie. Esta descomposición busca evitar la "conflación direccional", es decir, que el modelo confunda una asociación A→B con su inversa B→A. Los HDPLC actúan como conectores de landmarks sobre hipercaras de politopos regulares (el autor cita el Decayotton C₁₀*) para enrutar trayectorias continuas entre sectores. La implementación incluye kernels en Triton y se distribuye como pesos PyTorch.

El entrenamiento se realizó sobre TinyStories, un corpus sintético de narrativa infantil en inglés, con tres configuraciones: Arity-3 simplex (10.000 pasos, PPL 14,34), Base multi-head SAVG (10.000 pasos, PPL 19,51) y Arity-4 simplex (3.000 pasos, PPL 38,67). No se especifican en la información disponible el número total de tokens procesados, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor menciona verificación formal en Lean 4 de siete objetivos relacionados con cotas de coordenadas y antisimetría de reflexión, compilados sin `sorry` en `lake build`.

## Capacidades

- Generación de texto en inglés, orientada a narrativa simple (dominio TinyStories).
- Recuperación de información en contexto largo: el autor reporta 100% de precisión en Needle-In-A-Haystack hasta 16.384 tokens en 25 profundidades de rejilla.
- Discriminación de asociaciones direccionales: 100% de recall hacia delante y 0,0% de fuga en reverso, según la model card.
- Discriminación enantiomérica quiral: el autor cita inversión exacta del pseudoscalar Grassmann ∧³ sobre pares de fármacos reales (talidomida, ibuprofeno, ketamina).
- Inferencia autorregresiva en streaming con memoria constante O(1) y velocidades declaradas de 163,9 a 219,7 tokens por segundo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Investigación en mecanismos de atención alternativos: el modelo sirve como banco de pruebas reproducible para comparar SAVG frente a atención softmax en tareas de asociación direccional, dado su tamaño reducido y su licencia permisiva.
- Validación de memoria de largo contexto en laboratorio: con 16.384 tokens de contexto declarados y memoria O(1), permite experimentar con recuperación de agujas en textos largos sin requerir hardware de gama alta.
- Prototipado de generación de cuentos infantiles en inglés: entrenado sobre TinyStories, puede generar narrativas simples coherentes dentro de ese dominio acotado.
- Reproducción de verificación formal: los desarrolladores interesados en Lean 4 pueden reutilizar los siete objetivos verificados como base para extender pruebas de propiedades algebraicas de la atención.
- Experimentos de quiralidad y representaciones: la discriminación enantiomérica declarada permite probar hipótesis sobre sesgos direccionales en modelos pequeños con pares de moléculas espejo.
- Docencia y divulgación: su tamaño (menos de 6 millones de parámetros) y su licencia Apache 2.0 lo hacen apto para demostraciones en cursos sobre arquitecturas lineales y state-space models.
- Benchmarking de kernels Triton: la implementación incluye kernels propios, útiles para medir throughput y latencia en GPUs consumer frente a implementaciones estándar.

## Benchmarks y rendimiento

| Checkpoint | Parametros | Pasos | Perplejidad validacion | Velocidad streaming |
|---|---|---|---|---|
| `imf_tinystories_higher_arity.pt` (Arity-3) | 5.917.398 | 10.000 | 14,34 | 163,9 tok/s |
| `imf_tinystories_scaled.pt` (Base SAVG) | 5.425.640 | 10.000 | 19,51 | 191,1 tok/s |
| `imf_tinystories_arity4.pt` (Arity-4) | 5.936.934 | 3.000 | 38,67 | 219,7 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de NIAH (100% hasta 16.384 tokens), discriminación direccional (100% forward / 0,0% reverse) y verificación Lean 4 (7/7 objetivos) provienen de la model card del autor y no se han contrastado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los tres checkpoints (menos de 6 millones de parámetros, aproximadamente 24 MB de pesos en FP32); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; incluso en iGPU y CPU.
- Opciones de despliegue: el autor proporciona `generate.py` con dependencias `torch` y `triton`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF.
- Latencia y throughput: el autor declara entre 163,9 y 219,7 tokens por segundo en streaming, sin especificar la GPU empleada en la medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| IMF TinyStories (este modelo) | 5,4-5,9 M | 16.384 | Apache 2.0 | Hugging Face, pesos PyTorch |
| TinyStories GPT-Neo (referencia del corpus) | ~1-30 M (variantes) | 512-1.024 | MIT / varias | Hugging Face |
| Mamba pequeños (state-space) | ~130 M en adelante | 2.048+ | Apache 2.0 | Hugging Face, GitHub |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada. La comparación con TinyStories GPT-Neo y modelos Mamba se ofrece solo a efectos de categoría (modelos pequeños de investigación sobre lenguaje simple), no de rendimiento medido.

## Limitaciones y advertencias

- Escala muy reducida: menos de 6 millones de parámetros, insuficiente para tareas de razonamiento, código o matemáticas fuera del dominio TinyStories.
- Dominio restringido: entrenado exclusivamente sobre narrativa infantil en inglés; el rendimiento fuera de ese registro no está caracterizado.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Resultados no verificados de forma independiente: las cifras de NIAH, discriminación direccional y verificación Lean 4 provienen únicamente de la model card del autor.
- Riesgo de alucinación: alto en cualquier uso fuera de la generación de cuentos simples; no se han publicado evaluaciones de factualidad.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Sin soporte documentado de tool calling, agentes, visión, audio ni cuantización; no hay pesos GGUF ni integraciones con servidores de inferencia estándar.
- Fecha de creación futura (2026-11-20) en los metadatos de Hugging Face, lo que conviene tener en cuenta al evaluar la madurez del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/akarta-315h/imf-tinystories
- GitHub (Stratum Research Group): https://github.com/Stratum-Research-Group/imf
- GitLab: https://gitlab.com/akarta-315h/imf
