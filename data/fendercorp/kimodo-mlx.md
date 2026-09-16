# Fendercorp/Kimodo-MLX

## Resumen

Kimodo-MLX es un paquete de pesos para generación de movimiento 3D (animación) convertido al formato MLX para su ejecución en Apple Silicon. Lo publica el usuario Fendercorp y no es un modelo entrenado desde cero: es una conversión del denoiser de movimiento SOMA RP v1.1 de NVIDIA (upstream `nvidia/Kimodo-SOMA-RP-v1.1`) para la ruta in-process de Kimodo de 3Dify Studio sobre MLX / Metal.

El repositorio contiene únicamente el pack de movimiento (~1,13 GB en precisión F32). La parte de condicionamiento por texto no está incluida: el autor indica que se usa un bundle de texto separado (`LocalAI-io/Llama-3-Kimodo-GGML`, basado en Meta Llama 3 y sujeto a los términos de Llama). Por tanto, Kimodo-MLX no es utilizable de forma autónoma solo con este repo.

Su relevancia es de nicho pero concreta: permite llevar un denoiser de movimiento 3D a equipos Mac con GPU integrada (Metal) mediante MLX, sin depender de CUDA, dentro de un pipeline de animación 3D. La model card no aporta detalles de arquitectura interna, recuento de parámetros, contexto ni idiomas, y el repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoiser de movimiento (modelo de difusión) para 3D; topología interna no detallada en la model card. Conversión a MLX / Metal |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (el pack de movimiento no expone ventana de contexto; el codificador de texto es un bundle Llama 3 aparte cuyo contexto no se especifica) |
| Tipos de cuantización | F32 (repo de ~1,13 GB); no se documentan otras precisiones |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (pesos de movimiento). El codificador de texto Llama 3 no está incluido y se rige por los términos de Meta Llama |
| Formato de pesos | MLX (safetensors) |
| Modelo base | nvidia/Kimodo-SOMA-RP-v1.1 |
| Pipeline declarado | other (3d, animation, motion) |
| Runtime objetivo | MLX / Metal en Apple Silicon |
| Tamaño del repositorio | ~1,1 GB |
| Codificador de texto | Externo: LocalAI-io/Llama-3-Kimodo-GGML (no incluido en este repo) |
| Autor | Fendercorp |
| Fecha de publicación | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el contenido como la conversión del «SOMA RP v1.1 motion denoiser», es decir, un modelo de difusión para denoising de movimiento, empaquetado para el runtime MLX sobre Metal en Apple Silicon. No se especifica la topología interna (tipo de backbone, número de capas, dimensión de las representaciones de movimiento), ni el procedimiento de conversión (si hubo pruning, fusión de capas o cambios de dtype más allá del paso a F32).

Tampoco se documentan datos de entrenamiento: ni volumen de tokens o de clips, ni composición del dataset, ni si hubo fases de ajuste por preferencias (RLHF/DPO) o refinamiento. Toda esa información correspondería al checkpoint original de NVIDIA (`nvidia/Kimodo-SOMA-RP-v1.1`), que es la referencia a consultar. La innovación técnica del repo es de despliegue, no de modelado: habilitar la ruta in-process de Kimodo de 3Dify Studio en hardware Apple mediante MLX, con los pesos de movimiento separados del codificador de texto para poder gestionar licencias de forma independiente.

## Capacidades

- Generación de movimiento 3D: actúa como denoiser dentro de un pipeline de difusión para producir secuencias de movimiento (animación esquelética) destinadas a contenido 3D.
- Animación condicionada por texto: el pipeline completo admite condicionamiento textual, pero requiere el bundle de texto externo `LocalAI-io/Llama-3-Kimodo-GGML`, que no se distribuye en este repositorio.
- Integración con 3Dify Studio: pensado para la ruta Kimodo in-process de esa herramienta.
- Ejecución en Apple Silicon: soporte nativo de MLX / Metal, sin dependencia de CUDA.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el ámbito declarado es 3d, animation y motion.

## Casos de uso

- Previsualización de animación en Mac: un animador puede generar clips de movimiento directamente en un portátil o sobremesa Apple Silicon, sin acceso a una estación con GPU NVIDIA, gracias a la conversión a MLX / Metal.
- Prototipado rápido en estudio de animación: iterar sobre variantes de movimiento antes de pasar a producción o a un pipeline renderizado con más recursos.
- Poblado de escenas en videojuegos: generar movimientos de relleno (locomoción, gestos) para NPC o multitudes, que después se retocan manualmente.
- Integración en herramientas DCC vía 3Dify Studio: usar la ruta in-process de Kimodo para incorporar generación de movimiento dentro del propio editor, reduciendo saltos entre aplicaciones.
- Automatización de tareas repetitivas de animación: producir variaciones de un mismo movimiento base (por ejemplo, ciclos de caminar con distintas velocidades) para reducir trabajo manual.
- Investigación en generación de movimiento: servir como referencia reproducible de un denoiser de movimiento ejecutándose en MLX, útil para comparar con implementaciones en PyTorch/CUDA.
- Pipelines locales con requisitos de privacidad: al ejecutarse en el equipo del usuario, permite trabajar con material no publicable sin enviar datos a servicios en la nube (siempre que se disponga también del bundle de texto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de movimiento (FID, diversidad, error de reconstrucción), comparaciones con otros generadores de movimiento, ni medidas de latencia o throughput. Los resultados de búsqueda web devueltos no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM / memoria unificada: el pack de movimiento ocupa ~1,13 GB en F32, por lo que el requisito mínimo de memoria para esta parte es reducido (del orden de 2 GB de memoria unificada, sin contar el codificador de texto ni los buffers de inferencia, no cuantificados en la model card).
- GPU compatibles: exclusivamente Apple Silicon (M1 o posterior) a través de MLX / Metal. No hay soporte declarado para CUDA ni ROCm.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; el repo no especifica un mínimo oficial. No aplica a GPU de consumo NVIDIA/AMD discreta, porque el formato es MLX.
- Opciones de despliegue: runtime MLX sobre Metal; la integración prevista es la ruta in-process de Kimodo de 3Dify Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Dependencia adicional: el pipeline completo necesita el bundle de texto `LocalAI-io/Llama-3-Kimodo-GGML`, con sus propios requisitos de memoria.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a características verificables.

| Modelo | Tipo | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fendercorp/Kimodo-MLX | Pack de movimiento 3D (denoiser) | MLX / safetensors, Apple Silicon | NVIDIA Open Model License (pesos de movimiento); texto Llama aparte | HuggingFace, 0 descargas |
| nvidia/Kimodo-SOMA-RP-v1.1 | Modelo base upstream (denoiser de movimiento SOMA RP v1.1) | no disponible | NVIDIA Open Model | HuggingFace |
| LocalAI-io/Llama-3-Kimodo-GGML | Codificador de texto (Llama 3) | GGML | Términos de Meta Llama | HuggingFace, repositorio separado |
| Otros generadores de movimiento 3D (por ejemplo, MDM, MLD, MotionDiffuse) | Generación de movimiento | PyTorch / CUDA | variable | no verificados en la información disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el bundle de texto `LocalAI-io/Llama-3-Kimodo-GGML` no hay condicionamiento textual, y ese bundle no está incluido en este repositorio.
- Licencias cruzadas: los pesos de movimiento se rigen por la NVIDIA Open Model License, mientras que el codificador de texto se rige por los términos de Meta Llama. Cualquier uso comercial debe revisarse contra ambas licencias por separado.
- Datos técnicos ausentes: no se publican parámetros, contexto, idiomas, composición del dataset ni métricas. Es difícil evaluar calidad o idoneidad sin acudir al checkpoint original de NVIDIA.
- Riesgo de artefactos: al ser un denoiser de difusión, cabe esperar movimiento físicamente inconsistente, deslizamiento de pies o colisiones no resueltas; la model card no documenta ninguna evaluación al respecto.
- Sesgos: no documentados. Los sesgos del modelo original (por ejemplo, sesgos de estilo o de corporales presentes en los datos de captura de movimiento) no se analizan en este repositorio.
- Restricción de plataforma: el formato MLX limita la ejecución a Apple Silicon; no es portable directamente a CUDA sin reconversión.
- Madurez y trazabilidad: repositorio con 0 descargas y 0 likes, publicado y actualizado con pocos minutos de diferencia, sin documentación adicional ni resultados de validación de la conversión.
- Los resultados de la búsqueda web realizada no aportan información relacionada con el modelo (devuelven páginas de soporte de Microsoft no pertinentes), por lo que no se pudo contrastar ninguna afirmación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fendercorp/Kimodo-MLX
- Modelo base upstream: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1
- Codificador de texto separado: https://huggingface.co/LocalAI-io/Llama-3-Kimodo-GGML
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- 3Dify Studio: mencionado en la model card sin enlace disponible
- Paper, blog o demo: no disponible
