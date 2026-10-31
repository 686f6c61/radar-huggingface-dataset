# Goekdeniz-Guelmez/Mamba3-MIMO-Tiny-HF

## Resumen

Mamba3-MIMO-Tiny-HF es un modelo experimental de generación de texto desarrollado por Goekdeniz-Guelmez, entrenado desde cero (scratch) sobre la arquitectura Mamba-3 con lógica MIMO (Multiple-Input Multiple-Output). Se presenta como una de las primeras implementaciones compatibles con el ecosistema Hugging Face `transformers` de esta arquitectura de modelos de estado (SSM), que sustituye la atención cuadrática clásica de los transformers por dinámicas de estado de complejidad lineal respecto a la longitud de secuencia.

Con apenas 26,7 millones de parámetros, no es un modelo de lenguaje de propósito general, sino un prototipo de validación de ingeniería: su objetivo es demostrar que los bloques Mamba-3 MIMO, compilados mediante kernels CUDA generados con TileLang (JIT de NVIDIA), pueden empaquetarse en formato `safetensors` y cargarse con `AutoModelForCausalLM` mediante `trust_remote_code=True`. Su relevancia actual es principalmente investigadora: permite a desarrolladores e investigadores explorar la arquitectura Mamba-3, sus requisitos de hardware (alineación de chunks, memoria compartida) y su integración en el ecosistema HF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 (SSM) con lógica MIMO y atención lineal |
| Parametros totales | 26.680.608 (~26,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (inferencia con complejidad lineal; secuencia debe ser múltiplo de 16) |
| Tipos de cuantizacion | no disponible (pesos en BF16, parámetros sensibles en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más archivos `modeling_mamba3.py` y `configuration_mamba3.py` para código remoto) |

## Arquitectura y entrenamiento

El modelo emplea bloques Mamba-3, la evolución de la familia de modelos de estado (SSM) que introduce lógica MIMO: múltiples flujos de entrada y salida que mejoran el cruce y la expresión de la información respecto a iteraciones anteriores. Al ser un SSM, la inferencia tiene complejidad lineal en longitud de secuencia, tanto en tiempo como en memoria, frente al coste cuadrático de la atención de los transformers. Los kernels están implementados con TileLang (compilación JIT de NVIDIA) y requieren que la longitud de secuencia sea múltiplo de 16 (chunk size), lo que obliga a aplicar padding manual en el bucle de generación.

Los hiperparámetros documentados son: `d_model` 256, `d_state` 64 (múltiplo de 32), `headdim` 64, `mimo_rank` 2 y `chunk_size` 16. La estrategia de precisión es mixta: pesos en BF16 y parámetros sensibles (bias, `dt`, `A_log`, normas, proyecciones MIMO y residual `D`) en FP32, requisito para que los kernels funcionen correctamente. El entrenamiento se realizó desde cero en un portátil con GPU NVIDIA RTX serie 50 (HM570), con optimizador AdamW a lr=5e-4 como prueba de sobreajuste (overfitting test) sobre frases objetivo, alcanzando un loss final de 0,0249. No hay datos sobre RLHF, DPO ni composición de un corpus a gran escala; no disponible.

## Capacidades

- Generación de texto básica (pipeline `text-generation`), limitada por su tamaño de 26,7 M de parámetros y su entrenamiento de validación.
- Inferencia con complejidad lineal en longitud de secuencia, heredada de la arquitectura SSM.
- Compatibilidad con el ecosistema Hugging Face `transformers` mediante `AutoModelForCausalLM` y `trust_remote_code=True`.
- Carga en BF16 con `device_map="auto"` y soporte de `accelerate`.
- Razonamiento, código, matemáticas, tool calling, agentes y capacidades multilingües: no disponibles (no se han entrenado ni evaluado para estas tareas).

## Casos de uso

- Investigación en arquitecturas SSM: sirve como banco de pruebas para estudiar los bloques Mamba-3 MIMO, su comportamiento de convergencia y sus propiedades de estado sin necesidad de grandes recursos.
- Desarrollo y depuración de kernels TileLang/CUDA: el repo incluye scripts documentados (entrenamiento, inferencia nativa, empaquetado) que permiten entender el flujo completo desde el kernel hasta el empaquetado HF.
- Prototipado de integración con `transformers`: útil para aprender a implementar `auto_map` con `AutoConfig` y `AutoModelForCausalLM` y código remoto (`modeling_mamba3.py`, `configuration_mamba3.py`).
- Validación de inferencia con alineación de chunks: el algoritmo de padding a múltiplos de 16 incluido en el repositorio es una referencia práctica para gestionar restricciones de alineación de kernels SSM.
- Pruebas de entrenamiento en hardware de consumo: demuestra que se puede entrenar un modelo Mamba-3 en un portátil con RTX serie 50 ajustando `d_state` y `headdim` a la memoria compartida disponible (~64 KB de SRAM).
- Punto de partida para escalar: la base de código permite aumentar dimensiones y reentrenar modelos Mamba-3 mayores partiendo de una implementación HF ya verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de entrenamiento es un loss final de 0,0249 en una prueba de sobreajuste sobre frases objetivo, que no es comparable con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: con 26,7 M de parámetros en BF16, el modelo ocupa unos 55 MB; cualquier GPU con 4 GB o más es suficiente para el modelo en sí (no disponible un cálculo oficial).
- GPU recomendadas según el autor: A100, H100 o RTX serie 40/50; también se menciona compatibilidad con RTX serie 30 en portátiles con SRAM limitada (~64 KB), ajustando `d_state` y `headdim`.
- Cabe con holgura en GPUs de consumo, incluidas portátiles, siempre que soporten los kernels CUDA compilados.
- Despliegue: requiere instalación desde fuente de `mamba-ssm` (con `MAMBA_FORCE_BUILD=TRUE`) y `causal-conv1d` de Dao-AILab; el despliegue es mediante PyTorch y `transformers` con `trust_remote_code=True`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponibles; el autor destaca la optimización de kernels para RTX serie 40/50 pero no publica mediciones.
- Requisito adicional: la longitud de secuencia de entrada debe ser múltiplo de 16, aplicando padding manual en el bucle de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mamba3-MIMO-Tiny-HF | ~26,7 M | Mamba-3 (SSM, MIMO) | Apache 2.0 | HF, código remoto, kernels desde fuente |
| Mamba-2 (state-spaces, tamaños pequeños) | ~26 M–790 M | Mamba-2 (SSM) | Apache 2.0 | HF, kernels `mamba-ssm` estables |
| RWKV-6 (variantes pequeñas) | ~0,1–1,5 B | RNN lineal / atención lineal | Apache 2.0 | HF y llama.cpp |

Comparado con Mamba-2, este modelo incorpora la lógica MIMO de Mamba-3 pero depende de kernels JIT (TileLang) menos maduros y con requisitos estrictos de alineación; frente a RWKV, ofrece integración nativa con `transformers` vía código remoto, aunque sin las opciones de despliegue consolidadas de este último. No hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Es un prototipo de validación de ingeniería entrenado con sobreajuste sobre frases objetivo: no es apto para producción ni para tareas de lenguaje reales.
- Riesgo muy alto de alucinación y salida incoherente dada la ausencia de preentrenamiento a gran escala; no disponible información sobre sesgos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; revisar `modeling_mamba3.py` antes de usar en entornos sensibles.
- Los kernels Mamba-3 pueden presentar incompatibilidades con ciertas versiones de CUDA; la compilación desde fuente (`MAMBA_FORCE_BUILD=TRUE`, `--no-build-isolation`) es obligatoria y puede fallar según el entorno.
- Restricción de alineación: la longitud de secuencia debe ser múltiplo de 16, con padding manual en generación.
- Los parámetros sensibles deben mantenerse en FP32; convertir todo el modelo a BF16 rompe los kernels.
- Sin cuantización documentada, sin soporte de vLLM/llama.cpp/Ollama y sin datos de idiomas soportados.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero la calidad del modelo limita su aplicabilidad práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Mamba3-MIMO-Tiny-HF
- Artículo sobre Mamba-3 MIMO (referenciado en la model card): https://lab.feimatrix.com/mamba-3-mimo-breaking-the-transformers-monopoly/
- Repositorio mamba-ssm (kernels Mamba, incluye Mamba-3): https://github.com/state-spaces/mamba
- Repositorio causal-conv1d (Dao-AILab): https://github.com/Dao-AILab/causal-conv1d
