# analogalok/Qwen3.8-27B-DFlash2-Q2_K-GGUF

## Resumen

El repositorio `analogalok/Qwen3.8-27B-DFlash2-Q2_K-GGUF` proporciona una cuantización de 2 bits (`Q2_K`) del drafter de difusión de bloques **DFlash 2** desarrollado por `z-lab` para el modelo denso **Qwen3.8-27B**. Este drafter no es un modelo de lenguaje autónomo, sino un componente auxiliar diseñado para acelerar la generación de texto mediante decodificación especulativa (speculative decoding) sobre el modelo principal. El autor, `analogalok`, ha comprimido el drafter desde la cuantización oficial `Q4_K_M` (~1.1 GB) a `Q2_K` (~700 MB), reduciendo el consumo de VRAM en 400-450 MB sin pérdida medible en la tasa de aceptación de los tokens especulados.

La principal aportación de este trabajo es que, según las pruebas del autor, la cuantización `Q2_K` mantiene una precisión de borrador idéntica a la versión de 4 bits, permitiendo ejecutar decodificación especulativa con contextos de hasta 170 000 tokens en una GPU de consumo con 24 GB de VRAM (RTX 4090 o RTX 3090). El modelo está diseñado para usarse con `llama.cpp` a partir de un pull request específico (PR #27342), y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusión de bloques (cross-layer block-diffusion), no es un LM causal independiente |
| Parametros totales | 1 924 404 480 (del drafter; el modelo base `Qwen3.8-27B` tiene 27B) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | Depende del modelo base y de la VRAM; con este drafter se alcanzan 170 000 tokens en Q4_0 KV y 100 000 en Q8_0 KV (según pruebas del autor) |
| Tipos de cuantizacion | `Q2_K` (este repositorio); el oficial usa `Q4_K_M` |
| Idiomas soportados | No disponible (el drafter no define idiomas; hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El DFlash 2 es un drafter de difusión de bloques que extrae estados ocultos de capas específicas del modelo base (`[6, 20, 34, 48, 62]`). No es un modelo causal independiente, por lo que no puede calibrarse con `llama-imatrix` de forma aislada; requiere el contexto del modelo base. La cuantización `Q2_K` se aplica sobre los pesos del drafter ya entrenado, sin modificar su arquitectura. No se dispone de información sobre el proceso de entrenamiento original del drafter (datos, tokens, RLHF, etc.).

La innovación técnica principal es la demostración de que esta cuantización de 2 bits no degrada la calidad del borrador especulativo, manteniendo una tasa de aceptación del 60.22% frente al 60.00% del `Q4_K_M` oficial. Esto permite ahorrar VRAM y ampliar el contexto utilizable sin sacrificar velocidad.

## Capacidades

- **Decodificación especulativa**: el modelo actúa como drafter para acelerar la generación de `Qwen3.8-27B`, con una longitud media de tokens aceptados de 2.81 sobre 3.0 propuestos (93.7 % de eficiencia teórica).
- **Ahorro de VRAM**: permite ejecutar el drafter y el modelo base en una GPU de 24 GB sin desbordar a memoria del sistema, ampliando el contexto máximo de 150 000 a 170 000 tokens (en Q4_K KV).
- **Compatibilidad con llama.cpp**: requiere una compilación específica (PR #27342) que soporta el drafter de difusión.
- No tiene capacidades autónomas de generación de texto, razonamiento, código o visión; es un componente auxiliar.

## Casos de uso

- **Inferencia local de Qwen3.8-27B en GPUs de consumo**: el drafter permite ejecutar el modelo denso en una RTX 4090 o RTX 3090 con decodificación especulativa, alcanzando velocidades de decodificación de ~75 t/s y contextos de hasta 170 000 tokens sin usar RAM.
- **Aplicaciones de chat con contexto largo**: al liberar VRAM, se puede ampliar la ventana de contexto para tareas de análisis de documentos extensos o historiales de conversación largos.
- **Despliegue en entornos con limitación de memoria**: su pequeño tamaño (700 MB) facilita su integración en pipelines de inferencia que ya usan `llama-server` con el modelo base.
- **Investigación sobre cuantización de borradores**: sirve como caso de estudio para evaluar el impacto de cuantizaciones extremas (2 bits) en modelos auxiliares de difusión.
- **Optimización de costes en infraestructura**: al reducir la VRAM necesaria para decodificación especulativa, se pueden desplegar más instancias por GPU o usar GPUs más económicas.
- **Aplicaciones de streaming de texto**: con la alta velocidad de decodificación (~76 t/s), es adecuado para respuestas en tiempo real en asistentes o herramientas de escritura.

## Benchmarks y rendimiento

Según las pruebas del autor en una única RTX 4090 (24 GB) con `llama-server` (PR #27342) y `--spec-draft-n-max 3` sobre un prompt de 28k tokens, comparando el drafter oficial `Q4_K_M` y el `Q2_K`:

| Drafter Quant | Tamaño de archivo | Media de tokens aceptados | Tasa de aceptación | Velocidad de decodificación | Contexto máximo (24 GB VRAM) |
|---|---|---|---|---|---|
| Oficial `Q4_K_M` | ~1.10 GB | 2.80 / 3.0 | 60.00 % | 75.89 t/s | 150 000 tokens (Q4 KV) |
| `Q2_K` (este repo) | ~700 MB | 2.81 / 3.0 | 60.22 % | 75.93 t/s | 170 000 tokens (Q4 KV) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este drafter, ya que no es un modelo de propósito general.

## Requisitos de hardware

- **VRAM mínima**: 24 GB (RTX 4090 o RTX 3090) para ejecutar el drafter junto al modelo base `Qwen3.8-27B` cuantizado.
- **GPU recomendada**: NVIDIA GeForce RTX 4090 o RTX 3090 (24 GB VRAM). No se mencionan GPUs de menor VRAM.
- **Software**: `llama.cpp` compilado desde el PR #27342 (con soporte para DFlash 2).
- **Opciones de despliegue**: `llama-server` con `--spec-draft-n-max 3` y `--ctx-size` configurable según la VRAM disponible.
- **Latencia y throughput**: ~75 t/s de decodificación en RTX 4090 con `Q4_K KV` y 170k contexto; ~76 t/s en `Q8_0 KV` con 100k contexto (según el autor).

## Comparativa con modelos similares

No hay modelos comparables directos, ya que este es un drafter específico para `Qwen3.8-27B`. Se puede comparar con la versión oficial del mismo drafter en cuantización `Q4_K_M`:

| Parámetro | Drafter `Q4_K_M` (oficial) | Drafter `Q2_K` (este repo) |
|---|---|---|
| Tamaño | ~1.10 GB | ~700 MB |
| Tasa de aceptación | 60.00 % | 60.22 % |
| Velocidad de decodificación | 75.89 t/s | 75.93 t/s |
| Contexto máximo (24 GB) | 150 000 tokens | 170 000 tokens |
| Licencia | Apache-2.0 | Apache-2.0 |

## Limitaciones y advertencias

- **No es un modelo de lenguaje completo**: requiere el modelo base `Qwen3.8-27B` para funcionar; no puede generar texto por sí solo.
- **Dependencia de una versión específica de llama.cpp**: la PR #27342 es necesaria; las versiones estándar no lo soportan.
- **Cuantización extrema**: aunque el autor reporta pérdida cero, la cuantización `Q2_K` puede introducir degradación en otros escenarios o con otros modelos base no probados.
- **Sesgos y alucinaciones**: no aplican directamente al drafter, pero hereda las limitaciones del modelo base.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero es necesario verificar la compatibilidad con el modelo base `z-lab/Qwen3.8-27B-DFlash2` y con la implementación de `llama.cpp`.

## Enlaces

- Repositorio HuggingFace: [analogalok/Qwen3.8-27B-DFlash2-Q2_K-GGUF](https://huggingface.co/analogalok/Qwen3.8-27B-DFlash2-Q2_K-GGUF)
- Modelo base: [z-lab/Qwen3.8-27B-DFlash2](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- PR de llama.cpp: [PR #27342](https://github.com/ggml-org/llama.cpp/pull/27342)
- Blog de referencia (guía de hardware para Qwen3.8-27B): [Context Studios - Qwen 3.8 27B Hardware Guide](https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide)
- Tuits del autor con datos de rendimiento: [X - Qwen 3.8 27B Dflash2 VS Native MTP](https://x.com/analogalok/status/2089980307047170489) y [X - Qwen 3.8 27B Q4_K_M](https://x.com/analogalok/status/2089979723166200196)
