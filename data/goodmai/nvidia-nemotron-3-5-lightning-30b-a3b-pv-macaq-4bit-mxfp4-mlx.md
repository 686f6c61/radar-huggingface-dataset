# goodmai/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

Este repositorio no contiene un modelo original, sino una cuantización calibrada del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` realizada por el usuario goodmai mediante la técnica MACaQ (Model Agnostic Calibrated Quantization, arXiv:2611.10649) y empaquetada en formato MLX para Apple Silicon. El objetivo es hacer viable en un Mac con 24 GB de memoria unificado un modelo de 30.000 millones de parámetros totales (3.000 millones activos) que en BF16 ocupa 63,16 GB y no cabe en ese hardware.

La arquitectura subyacente es `nemotron_h`, un híbrido de Mamba-2, atención con Grouped-Query Attention y una capa MoE de 128 expertos con activación Squared-ReLU (`relu2`). La cuantización reduce el checkpoint a 16,83 GB en 4 bits MXFP4, con un grupo de cuantización `g=32`, bloque Hadamard de Sylvester `B=64` y balance de canales `α=0.75`, e incorpora refinamiento de código mediante descenso por coordenadas con Hessiano.

La relevancia de esta ficha es doble: documenta un caso real de cuantización calibrada de precisión muy baja sobre una arquitectura híbrida SSM/atención/MoE, y aporta mediciones ejecutables en hardware de consumo (Apple M4 Pro de 24 GB) con velocidad de decodificación y tiempo hasta el primer token. No obstante, el número de parámetros reportado en safetensors (5.536.555.520) no coincide con el tamaño nominal del modelo base, lo que debe tenerse en cuenta al interpretar las cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h`: híbrido Mamba-2 + Grouped-Query Attention + MoE con activación Squared-ReLU (`relu2`) |
| Parametros totales | 30B nominales según el autor del checkpoint; 5.536.555.520 según los tensores safetensors del repo |
| Parametros activos | 3B (aproximado, según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PV-MACaQ 4-bit MXFP4 (`g=32`, `B=64`, `α=0.75`, paso P con exponente E8M0 + paso V en FP4); existe también una variante 3-bit Affine del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia `nemotron_h` que combina capas Mamba-2 (modelo de espacio de estados) con capas de atención GQA y capas MoE de 128 expertos enrutados con activación `relu2`. El checkpoint cuantizado afecta a 116 proyecciones 2D (Mamba-2, GQA y expertos compartidos) y a 46 tensores 3D apilados `SwitchLinear` correspondientes a los 128 expertos en `fc1`/`fc2`.

La cuantización aplicada es PV-MACaQ: balance de canales con `α=0.75`, rotación mediante bloque Hadamard de Sylvester `H_64`, paso P con escala/sesgo/exponente E8M0 y paso V en FP4, alternando ambos pasos con refinamiento por descenso de coordenadas sobre un conjunto activo guiado por el Hessiano. El autor reporta 270.649.593 actualizaciones monótonas ponderadas por Hessiano en el paso P y 617.191.337 volteos discretos de código en el paso V, con un tiempo de conversión en streaming de 3068,6 s. La calibración de los expertos enrutados usa el segundo momento de la activación ReLU² como Hessiano. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición, RLHF/DPO).

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo (pipeline `text-generation`).
- Razonamiento aritmético y algebraico básico: el benchmark del autor verifica resolución de ecuaciones (`x = 5`) y sucesiones de Fibonacci.
- Generación de código: produce bloques de código ejecutables en las pruebas de transformadas de Fourier y filtros biquad.
- Traducción: etiquetado correcto de idioma destino en 3 de 3 casos del benchmark.
- Razonamiento numérico con verificación: resuelve raíces complejas de filtros biquad con residuo menor que 1e-9 y validación de solución.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el benchmark solo evalúa etiquetado de idioma, no fluidez.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada de 24 GB: el checkpoint ocupa 16,83 GB y deja margen para el contexto y el runtime; es el escenario para el que fue construido y el único con mediciones publicadas.
- Prototipado de asistentes conversacionales en Apple Silicon: con 90,33 tok/s de decodificación y 0,118 s de TTFT en un M4 Pro, permite iterar sobre prompts de forma interactiva sin depender de la nube.
- Evaluación de técnicas de cuantización de precisión muy baja: sirve como referencia reproducible para comparar MACaQ 4-bit MXFP4 frente a 8-bit affine o BF16 en la misma máquina.
- Tareas de cálculo simbólico y numérico asistido: el modelo resuelve ecuaciones algebraicas y raíces de filtros biquad, útil para generar borradores de código de procesamiento de señal que luego se validan.
- Generación de código de procesado de señal: las pruebas de Fourier y biquad muestran que produce implementaciones ejecutables, aprovechable en pipelines de análisis de audio o instrumentación.
- Docencia y demostraciones de arquitecturas híbridas SSM/MoE: al ser un MoE de 30B con 3B activos, ilustra el compromiso entre calidad y coste computacional en hardware de consumo.
- Traducción y etiquetado lingüístico ligero: el benchmark de traducción pasa 3 de 3, aunque sin datos de calidad de la traducción en sí.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en un Apple M4 Pro con 24 GB de memoria unificada:

| Checkpoint | Cuantizacion | Tamano | Decodificacion | TTFT | Memoria activa | Ladder to the Moon |
|---|---|---:|---:|---:|---:|---:|
| Nemotron-3.5-Lightning-30B-A3B BF16 | BF16 | 63,16 GB | OOM en 24 GB | — | > 24 GB | — |
| Nemotron-3.5-Lightning-30B-A3B 8-bit | Affine 8-bit (`g=64`) | 33,56 GB | OOM residente en 24 GB | — | > 24 GB | — |
| PV-MACaQ 3-bit (mismo autor) | Affine 3-bit (`g=64`, `B=64`, `α=0.75`) | 13,94 GB | 92,91 tok/s | 0,124 s | 13.275 MB | 3/5 |
| **PV-MACaQ 4-bit MXFP4 (este repo)** | MXFP4 (`g=32`, `B=64`, `α=0.75`) | 16,83 GB | 90,33 tok/s | 0,118 s | 16.034 MB | 3/5 |

Desglose del benchmark "Ladder to the Moon" (5 peldaños, 3 superados; warm-up 3/3):

| Prueba | Resultado | Tokens | Velocidad | Detalle |
|---|---|---:|---:|---|
| `algebra` | PASS | 183 | 77,3 tok/s | x = 5 |
| `fibonacci` | PASS | 336 | 83,3 tok/s | fibonacci(10,20,30) = [55, 6765, 832040] |
| `translation` | PASS | 82 | 75,2 tok/s | 3/3 idiomas destino etiquetados |
| `biquad-real` | PASS | 316 | 80,4 tok/s | 5/5 casos, incluidos vacío, repetido y raíces nulas |
| `biquad-complex` | PASS | 366 | 78,7 tok/s | 4 casos × 4 raíces, residuo < 1e-9 |
| `fourier` | PASS | 579 | 79,4 tok/s | 3/3 casos (diente de sierra, onda cuadrada, coseno) |
| `pump` | FAIL | 639 | 82,1 tok/s | v = 1790,4931 frente a 1,7905 esperado (unidades: d en mm, Q en L/s) |
| `lunar` | FAIL | 12.288 | 75,7 tok/s | ningún bloque de código define `exhaust_velocity` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: 16,83 GB de checkpoint; el autor mide 16.034 MB de memoria activa en inferencia, por lo que un equipo de 24 GB de memoria unificada es el mínimo práctico observado.
- GPU recomendadas: Apple Silicon con Metal; la medición de referencia es un Apple M4 Pro de 24 GB. No hay datos para A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- GPU de consumo: cabe en Mac con 24 GB o más de memoria unificada; no es desplegable en GPUs NVIDIA consumer con el runtime documentado.
- Despliegue: runtime Basalt (https://github.com/goodmai/basalt) con soporte Metal nativo (`macaq_single_simd_wht`, `quantizedMM`); también hay un Space de Hugging Face para ejecutarlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 90,33 tok/s de media (σ = 0,228) y TTFT de 0,118 s (σ = 0,000) con 64 tokens de generación y 3 iteraciones. La variante 3-bit es marginalmente más rápida (92,91 tok/s) pero con peor TTFT (0,124 s).
- Verificación de integridad: el autor reporta `intact = true` y `quantizationMode = "macaq"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (PV-MACaQ 4-bit MXFP4) | 30B totales / 3B activos (nominal) | no disponible | MXFP4 4-bit | 16,83 GB | openmdw-1.1 | Hugging Face, runtime Basalt |
| PV-MACaQ 3-bit del mismo autor | 30B / 3B | no disponible | Affine 3-bit | 13,94 GB | openmdw-1.1 | Hugging Face, runtime Basalt |
| `mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-8bit` | 30B / 3B | no disponible | Affine 8-bit `g=64` | 33,56 GB | no disponible | Hugging Face, MLX |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` | 30B / 3B | no disponible | BF16 | 63,16 GB | no disponible | Hugging Face |

## Limitaciones y advertencias

- El número de parámetros de los tensores safetensors (5.536.555.520) no cuadra con el tamaño nominal de 30B del modelo base; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- El modelo solo pasa 3 de 5 peldaños del benchmark del autor; falla en un problema de unidades (`pump`) y en una tarea de código larga (`lunar`, 12.288 tokens sin definir la función pedida). El razonamiento de precisión y la generación de código extenso son puntos débiles.
- La cuantización a 4 bits MXFP4 introduce degradación adicional sobre el modelo base; no se aportan métricas de perplejidad ni comparación de calidad frente a BF16 más allá del benchmark cualitativo.
- El formato es MLX y el runtime documentado es Basalt; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue fuera de Apple Silicon.
- No hay información sobre sesgos, datos de entrenamiento, composición del corpus ni idiomas soportados del modelo base.
- Licencia openmdw-1.1: es necesario revisar sus términos en https://openmdw.ai/license/1-1/ antes de uso comercial; la model card la etiqueta como `other`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (18 de noviembre de 2026): no hay validación comunitaria independiente.
- Riesgo de alucinación no cuantificado; el fallo en `pump` sugiere errores de conversión de unidades que pueden propagarse en cálculos de ingeniería.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante 3-bit del mismo autor: https://huggingface.co/goodmai/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-PV-MACaQ-3bit-MLX
- Cuantización 8-bit de referencia: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-8bit
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio Basalt: https://github.com/goodmai/basalt
- Sitio web de Basalt: https://bas-alt.vercel.app
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/goodmai/run-with-basalt
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
