# Ganenalla/atacama-28b-a3b-reap-strata-mlx

## Resumen

Atacama-28b-a3b-reap-strata-mlx es un modelo de generación de texto y código basado en arquitectura Mixture-of-Experts (MoE), publicado por el usuario Ganenalla en HuggingFace. Se distribuye en formato MLX cuantizado a 4 bits, específicamente optimizado para inferencia en Apple Silicon (GPU Metal), y deriva de la familia Qwen3.5-MoE según el tag `qwen3_5_moe` del repositorio. El modelo aplica dos técnicas propietarias declaradas por el autor: Router-weighted Expert Activation Pruning (REAP) y Strata Precision Reinvestment.

La propuesta central es un compromiso entre tamaño total y coste de cómputo por token: con 28.239.145.728 parámetros totales, solo aproximadamente 3.000 millones se activan por paso de decodificación (denominación A3B), lo que permite, según la model card, velocidades sostenidas superiores a 100 tokens por segundo en hardware Apple. El repositorio ocupa 15,9 GB, lo que lo sitúa en el rango manejable para equipos con 24 GB de memoria unificada.

El modelo está orientado a generación de código y razonamiento, con licencia Apache 2.0 y declaración de idioma únicamente inglés. Es relevante para desarrolladores que trabajan en macOS y necesitan ejecutar localmente un modelo MoE de gran tamaño sin recurrir a GPU dedicadas, aunque la información pública disponible es muy limitada: no hay benchmarks, no hay paper asociado y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5-MoE, con REAP y Strata Precision Reinvestment |
| Parametros totales | 28.239.145.728 (28,24 B) |
| Parametros activos | ~3 B por token (denominación A3B) |
| Longitud de contexto | no disponible (la model card menciona expansión de KV-cache para 32k+ en 24 GB, sin cifra oficial) |
| Tipos de cuantizacion | 4-bit (MLX); cuantización Group-64 Coordinate-MSE en expertos enrutados; router gates en 8-bit Affine |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado 4-bit |

## Arquitectura y entrenamiento

El modelo es un transformer con capas MoE, heredero de la arquitectura Qwen3.5-MoE según los metadatos del repositorio. La innovación declarada por el autor es la combinación de REAP (Router-weighted Expert Activation Pruning), que poda expertos guiándose por su peso en el enrutador, con Strata Precision Reinvestment, una estrategia de asignación de precisión por capas que preserva los router gates en 8-bit Affine mientras cuantiza los expertos enrutados con Group-64 Coordinate-MSE a 4 bits. El objetivo declarado es eliminar el jitter de enrutamiento y los bucles de repetición típicos de los MoE cuantizados agresivamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de poda (cuántos expertos se eliminaron, qué criterio exacto de ponderación por router se aplicó) ni el procedimiento de "reinversión de precisión". La model card no incluye referencias a papers, repositorios de código de las técnicas ni detalles del pipeline de destilación o fine-tuning sobre el modelo base Qwen3.5-MoE.

## Capacidades

- Generación de texto y razonamiento general en inglés.
- Generación de código: el autor ejemplifica con la escritura de un rate limiter asíncrono en Python con asyncio.
- Razonamiento multi-paso orientado a tareas de programación.
- Inferencia de alto throughput en Apple Silicon gracias al footprint activo de ~3 B parámetros.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente: no disponible (no documentado).
- Capacidades multilingües: limitadas a inglés según la declaración de idioma.
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede generar funciones completas (por ejemplo, rate limiters, parsers, utilidades CLI) directamente en un Mac de 24 GB de memoria unificada, sin depender de servicios en la nube, gracias a su footprint residente de ~16 GB y a la decodificación de más de 100 tok/s declarada.
- Autocompletado y generación en editores: al exponerse como servidor compatible con OpenAI (`mlx_lm.server`), puede conectarse a extensiones de VS Code, Neovim o similares que hablen el protocolo OpenAI, ofreciendo latencia baja en hardware Apple.
- Refactorización y explicación de código existente: con contexto de decenas de miles de tokens (el autor indica expansión de KV-cache para 32k+), puede procesar módulos completos y proponer reescrituras o documentación.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones o módulos, integrándose en flujos de desarrollo locales en macOS.
- Prototipado rápido de scripts de automatización: útil para generar scripts de shell, Python o utilidades de procesamiento de datos en entornos de desarrollo sin GPU dedicada.
- Experimentación e investigación en cuantización MoE: el repositorio sirve como caso de estudio de las técnicas REAP y Strata, permitiendo a investigadores reproducir y comparar el comportamiento de un MoE podado y cuantizado frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una velocidad de decodificación superior a 100 tok/s en Apple Silicon y un peso residente de 16,2 GB, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~16,2 GB residentes según el autor; el repositorio pesa 15,9 GB.
- Hardware objetivo: Apple Silicon con 24 GB de memoria unificada (el autor lo describe como el "sweet spot"); deja ~8 GB libres para KV-cache y expansión de contexto.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, ya que el formato es MLX y está pensado para Metal; no se documenta conversión a CUDA.
- Cabe en GPU de consumo: sí, en Macs con 24 GB o más de memoria unificada (M-series Pro/Max). No se documenta soporte para GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` (librería Python), `mlx_lm.server` (servidor compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: >100 tok/s de decodificación declarados por el autor en Apple Silicon; no se especifica el chip exacto ni la longitud de contexto a la que se midió.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|---|
| Atacama-28b-a3b-reap-strata-mlx | 28,24 B | ~3 B | no disponible | MLX 4-bit / Apple Silicon | Apache 2.0 |
| Qwen3-30B-A3B (referencia de familia) | ~30 B | ~3 B | no disponible en esta ficha | safetensors / GGUF / múltiples | Apache 2.0 |
| Modelos MoE comparables de código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas. La comparación con Qwen3-30B-A3B se ofrece solo como referencia arquitectónica por la denominación A3B y el tag `qwen3_5_moe`, sin que ello implique equivalencia de resultados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte.
- Documentación incompleta: no se detallan datos de entrenamiento, proceso de poda, número de expertos eliminados ni metodología de las técnicas REAP y Strata.
- Idioma limitado al inglés: no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada de tasas de error.
- Sesgos: no documentados por el autor; al derivar de un modelo base Qwen, pueden heredarse sesgos de ese corpus, pero no se aporta evidencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-MoE del que deriva, ya que las obligaciones podrían acumularse.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a macOS con Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA documentados en el repositorio.
- Nombre inconsistente: el ID del repositorio indica "28b" mientras la model card se titula "35b-a3b"; esta discrepancia sugiere posibles errores de publicación o versiones mezcladas.
- Fecha de creación futura (2026-10-30) en los metadatos: conviene tratar la información con cautela y verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Ganenalla/atacama-28b-a3b-reap-strata-mlx
- Model card referenciada en el README: https://huggingface.co/Ganenalla/atacama-35b-a3b-reap-strata
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Paper de REAP (referencia general de la técnica, no vinculada por el autor): no disponible en la información proporcionada
- Repositorio de código de las técnicas Strata: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
