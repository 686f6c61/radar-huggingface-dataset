# Snapkitty/macrogrok-harness

## Resumen

`macrogrok-harness` es un harness de inferencia escrito en Rust, desarrollado por Snapkitty, que implementa un pipeline completo para ejecutar modelos de punto fijo MACROGROK y un transformador con núcleos CUDA personalizados. No se trata de un modelo de lenguaje con pesos publicados, sino de una infraestructura de ejecución que integra atención basada en Tensor Core WMMA, memoria de atención explícita (KV-cache) y recuperación aumentada por generación (RAG) mediante la API de Tavily. El proyecto está pensado para desarrolladores que necesitan un entorno de inferencia de bajo nivel, con control fino sobre kernels CUDA y formatos de punto fijo.

La relevancia actual del proyecto radica en su enfoque híbrido: combina un host Rust asíncrono (tokio, cudarc) con kernels CUDA optimizados para arquitecturas modernas (incluido Hopper con TMA y mbarrier), y una implementación de punto fijo Q1.14/Q3.12 que replica la semántica del ensamblador `infer4.asm` de MACROGROK. Aunque no hay métricas de rendimiento publicadas, la arquitectura propuesta es interesante para experimentación con atención dispersa, modelos de punto fijo y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Harness Rust + núcleos CUDA (Transformer-X, Tensor Core WMMA, atención con KV-cache explícita) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Punto fijo Q1.14 y Q3.12 (formato INFER4) |
| Idiomas soportados | no disponible |
| Licencia | BSL-1.1 / AGPL-3.0 / MPL-2.0 (según model card; "Patent Pending, BEL ESPRIT D ACCORD TRUST HOLDINGS INC.") |
| Formato de pesos | no disponible (el harness no publica pesos; usa tensores `half` en runtime) |

## Arquitectura y entrenamiento

El proyecto no describe un entrenamiento de modelo, sino un harness de inferencia. La arquitectura se compone de un host Rust con `tokio`, `cudarc 0.11`, `reqwest` y `half`, que orquesta la carga de un transformador, la atención con núcleos CUDA y el bucle RAG con Tavily. El núcleo de atención usa instrucciones Tensor Core WMMA 16x16x16 (`mma.sync`), con tiling por dimensión de cabeza para `head_dim` de 64 o 128, y reducciones con `__shfl_xor`. La memoria de atención (`AttentionMemory`) es un KV-cache explícito contiguo o paginado, con reset al desbordarse. También se incluye un kernel PTX para Hopper con TMA (`cp.async.bulk.tensor.2d`) y barreras `mbarrier`.

Por otra parte, el submódulo `macrogrok` implementa una máquina de inferencia de punto fijo en Rust que replica la semántica del ensamblador `infer4.asm`: multiplicación Q1.14×Q1.14 con acumulación Q3.24, desplazamiento, suma de sesgo Q3.12, saturación, umbral y actualización de estado `(3*STATE+TARGET)/4`. No se mencionan datos de entrenamiento, tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- Inferencia de modelos con atención basada en Tensor Core WMMA, tanto en GPUs Ampere (sm_80) como Hopper (con TMA).
- Soporte para atención con máscara causal y tiling por dimensión de cabeza (64/128).
- Implementación de punto fijo Q1.14/Q3.12 para modelos MACROGROK, con tests de vectores fijos en Rust.
- Recuperación aumentada por generación (RAG) mediante llamadas asíncronas a la API de Tavily (`search_depth=advanced`).
- Bucle de agente simple: tokenización → forward del transformador → detección de llamada a herramienta (JSON) → búsqueda Tavily → inyección del resultado → continuación.
- Kernel PTX para Hopper con TMA y mbarrier, orientado a transferencias masivas 2D en memoria compartida de clúster.
- Soporte de cuantización de punto fijo para entornos sin FP16 o con restricciones de hardware.

## Casos de uso

- Experimentación con atención dispersa o híbrida: el hook "X algorithm" permite insertar máscaras de sparsity, estados lineales o un `IndexPool` antes o después de la operación WMMA, facilitando la investigación sobre mecanismos de atención alternativos.
- Desarrollo de kernels CUDA personalizados: el código de `attention_tc.cu` sirve como referencia para implementar atención con Tensor Cores, incluyendo reducciones warp y almacenamiento en memoria compartida.
- Despliegue de modelos de punto fijo en hardware sin soporte FP16: la implementación MACROGROK Q1.14/Q3.12 permite ejecutar inferencia en dispositivos con aritmética de enteros únicamente.
- Integración de RAG en pipelines Rust: el cliente Tavily asíncrono puede reutilizarse para construir sistemas de pregunta-respuesta con fuentes web actualizadas.
- Prototipado de agentes con herramientas: el bucle principal detecta llamadas a herramientas en JSON, ejecuta búsquedas externas y continúa la generación, sirviendo como base para asistentes conversacionales con acceso a información en tiempo real.
- Estudio de técnicas de memoria para contexto largo: `AttentionMemory` con KV-cache contiguo o paginado y reset automático ofrece un banco de pruebas para gestionar ventanas de contexto extensas sin fragmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput ni comparaciones con otros modelos. Tampoco se reportan resultados en MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- GPU con soporte CUDA y arquitectura sm_80 (Ampere) o superior; los kernels WMMA requieren Tensor Cores.
- Para el kernel PTX de Hopper (TMA + mbarrier) se necesita una GPU Hopper (H100) o compatible.
- VRAM estimada: no disponible; depende del tamaño del transformador cargado y de la configuración de `AttentionMemory`. El harness no publica requisitos mínimos.
- Compilador: `nvcc` para generar el PTX desde `attention_tc.cu` (ejemplo: `-arch=sm_80`).
- Opciones de despliegue: el harness se compila con Cargo (Rust) y se ejecuta como binario; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Dependencias principales: `cudarc 0.11` (con feature `cuda-12000`), `tokio`, `reqwest`, `serde`, `half`, `bytemuck`.

## Comparativa con modelos similares

No disponible. `macrogrok-harness` no es un modelo de lenguaje con pesos publicados, sino un harness de inferencia. No se han identificado proyectos comparables con la misma combinación de Rust, CUDA WMMA y punto fijo MACROGROK en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos ni puede generar texto por sí mismo; requiere un transformador precargado y kernels CUDA compilados.
- Licencia múltiple (BSL-1.1 / AGPL-3.0 / MPL-2.0) con mención de "Patent Pending" de una entidad externa; debe revisarse la compatibilidad con uso comercial y distribución.
- La fecha de creación (2026-09-01) y la ausencia de descargas o likes sugieren que el proyecto es muy reciente o experimental, sin validación externa.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma, al no ser un modelo de lenguaje.
- La dependencia de Tavily RAG implica una API externa con coste potencial y latencia de red; el harness no gestiona reintentos ni límites de tasa.
- El reset automático de `AttentionMemory` en caso de desbordamiento puede truncar el contexto sin aviso, afectando a la coherencia en conversaciones largas.
- La implementación de punto fijo Q1.14/Q3.12 tiene un rango dinámico limitado; puede producir errores de precisión en valores extremos.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/macrogrok-harness
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/macrogrok-harness
- Código fuente `main.rs`: https://github.com/SNAPKITTYWEST/macrogrok-harness/blob/main/src/main.rs
- Proyecto relacionado en HuggingFace (snapkitty-harness): https://huggingface.co/SNAPKITTYWEST/snapkitty-harness
