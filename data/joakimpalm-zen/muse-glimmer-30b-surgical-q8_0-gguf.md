# Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF

## Resumen

Muse-Glimmer-30B-Surgical-Q8_0-GGUF es un artefacto de investigación derivado de meta-models/Muse-Glimmer-30B, un modelo de lenguaje de aproximadamente 27.850 millones de parámetros. Lo publica Joakimpalm-Zen bajo el marco de trabajo "Xyntetik Runner", y su rasgo definitorio es la cirugía estructural: se han eliminado las subcapas FFN de las capas 4, 7, 9 y 48 del decodificador, lo que supone un 6,34 % del total, y posteriormente se ha "curado" el daño mediante destilación local contra el modelo padre congelado sobre un corpus descontaminado.

El resultado se ha cuantizado a Q8_0, generando un archivo GGUF de 27,58 GB. El autor declara que supera un umbral estricto de fidelidad frente al padre BF16 sin modificar sobre una partición reservada: acuerdo top-1 cualificado por margen del 98,34 % (umbral ≥97 %) y KLD media de 0,03883 (umbral ≤0,05). Es el hermano de mayor cirugía del artefacto Q4_K del mismo estudio, que elimina un 4,75 % del decodificador y ocupa 14,61 GB.

La relevancia de esta ficha no reside en el rendimiento bruto del modelo, sino en que documenta una metodología reproducible de poda estructural con reparación por destilación y medición aditiva del ruido de cuantización. El autor advierte explícitamente que se trata de un artefacto de investigación y no de un lanzamiento de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Muse-Glimmer-30B); subcapas FFN de capas 4, 7, 9 y 48 eliminadas estructuralmente |
| Parámetros totales | 27.854.794.240 (27,85 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (este repositorio); existe un hermano Q4_K del mismo estudio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (27,58 GB); el padre se distribuye presumiblemente en safetensors/BF16 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de 27,85 mil millones de parámetros. La intervención consiste en la sustitución a nivel de byte dentro del GGUF padre: las subcapas FFN de las capas 4, 7, 9 y 48 se llevan exactamente a cero manteniendo la forma estándar de los tensores, de modo que el grafo computacional y las formas tensoriales permanecen compatibles con cualquier runtime que soporte la arquitectura original. Esto elimina el 6,34 % del decodificador en términos de cómputo efectivo de esas subcapas.

Tras la poda, el modelo se repara mediante destilación local contra el padre congelado en BF16 sobre un corpus descontaminado, y finalmente se cuantiza a Q8_0. El autor reporta una medición relevante para la metodología: el ruido de cuantización y el error de cirugía resultaron aditivos e independientes en cinco configuraciones (entre 0,965 y 0,996 veces la suma ingenua), lo que permitió predecir el coste del Q8_0 antes de construirlo, estimado en +0,00026 de KLD sobre la cirugía en BF16. El estudio está preregistrado y la evidencia se publica como dataset de informe junto con SURGERY.json y SHA256SUMS en el repositorio.

## Capacidades

- Generación de texto conversacional: la etiqueta de pipeline es text-generation y el repositorio incluye la etiqueta conversational.
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo padre, sin evaluación específica publicada para este derivado.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible.
- Compatibilidad con el servidor OpenAI-compatible de xyntetik-runner (CPU, CUDA y Metal).
- Entrenamiento y fusión de adaptadores LoRA sobre el propio GGUF servido, con determinismo por semilla y registro de procedencia (funcionalidad del motor, no del modelo).
- Evaluación teacher-forced sobre particiones reservadas mediante el modo `--score` del motor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre poda estructural: sirve como referencia reproducible para estudiar cuánto decodificador puede eliminarse antes de romper la fidelidad, con umbrales publicados (top-1 ≥97 %, KLD ≤0,05) y evidencia en dataset aparte.
- Validación de metodologías de reparación por destilación: el par de artefactos Q4_K (4,75 % eliminado) y Q8_0 (6,34 % eliminado) permite comparar el efecto de la agresividad de la cirugía y del nivel de cuantización de forma controlada.
- Estudio de aditividad del ruido de cuantización: útil para quien necesite modelar el coste combinado de poda y cuantización antes de construir un artefacto, dado que el autor publica la relación medida (0,965-0,996 de la suma ingenua).
- Despliegue en CPU con llama.cpp o xyntetik-runner: el formato GGUF Q8_0 y las formas tensoriales estándar permiten servirlo con runtimes convencionales sin parches, útil para entornos sin GPU.
- Servidor compatible con OpenAI para pruebas de integración: la etiqueta endpoints_compatible y el servidor del motor permiten sustituir un endpoint en pipelines existentes para experimentación.
- Flujo de ajuste fino con LoRA y fusión controlada: el motor asociado permite entrenar un adaptador AdamW LoRA sobre el GGUF, servirlo junto al base congelado y fusionarlo con recuantización por tensor, con la advertencia medida de que una fusión a 4 bits borra la adaptación.
- Docencia y auditoría de artefactos derivados: la presencia de SURGERY.json, SHA256SUMS y registro de procedencia facilita ejercicios de trazabilidad y verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de evaluación son métricas de fidelidad frente al padre BF16, no comparaciones de capacidad:

| Métrica (frente al padre BF16, partición reservada) | Resultado | Umbral |
|---|---|---|
| Acuerdo top-1 cualificado por margen | 98,34 % | ≥97 % |
| KLD media | 0,03883 | ≤0,05 |
| Coste de cuantización Q8_0 sobre la cirugía BF16 | +0,00026 KLD | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 27,58 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o unificada) más overhead de contexto y caché KV; en la práctica, 32 GB o más es el mínimo razonable.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB; en consumer, RTX 3090/4090 de 24 GB no son suficientes para cargar el archivo completo en VRAM.
- Cabe en consumer GPU: no en 24 GB a Q8_0; requeriría cuantizaciones menores (no publicadas en este repositorio) o descarga parcial a RAM/CPU.
- Opciones de despliegue: xyntetik-runner (binario único C11, CPU/CUDA/Metal, servidor compatible con OpenAI); llama.cpp es compatible por formato GGUF y formas tensoriales estándar; vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Surgical-Q8_0 (este) | 27,85 B | no disponible | Q8_0, 27,58 GB | Apache 2.0 | 6,34 % del decodificador eliminado, reparado por destilación |
| Muse-Glimmer-30B-Surgical-Q4_K | 27,85 B (base) | no disponible | Q4_K, 14,61 GB | Apache 2.0 | 4,75 % eliminado; menor cirugía, menor huella |
| meta-models/Muse-Glimmer-30B (padre) | 27,85 B | no disponible | BF16 | no disponible | Referencia de fidelidad; sin poda |

No se dispone de datos de benchmarks que permitan comparar capacidad con modelos de la misma categoría.

## Limitaciones y advertencias

- El autor califica explícitamente el artefacto como "research artifact, not a general-purpose release"; no está pensado como sustituto de producción del modelo padre.
- La fidelidad se mide frente al padre, no frente a la calidad absoluta: un 98,34 % de acuerdo top-1 implica que aproximadamente 1,66 de cada 100 tokens divergen del padre en la partición evaluada.
- El autor menciona una "benchmark-annex caveat" compartida con su hermano Q4_K, cuyo contenido no se detalla en la información disponible.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación multilingüe para este derivado.
- Longitud de contexto e idiomas soportados no están documentados en la ficha del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero la condición de artefacto de investigación y la ausencia de benchmarks de capacidad desaconsejan su uso en producción sin evaluación propia.
- Advertencia del autor sobre el flujo de fusión LoRA: fusionar a Q4_0 puede borrar por completo la adaptación (eval 0,69, equivalente al modelo base) mientras la perplejidad sigue pareciendo aceptable; debe fusionarse a Q8_0 o F16, o servir base más adaptador.
- La verificación de integridad depende de SURGERY.json y SHA256SUMS del repositorio; conviene comprobarlos antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF
- Modelo padre: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Hermano Q4_K: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q4_K-GGUF
- Colección del estudio "Model Surgery and Scale Recovery": https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-model-surgery-and-scale-recovery-6aa98bab0ecb9723f310c770
- Dataset de evidencia del estudio: https://huggingface.co/datasets/Joakimpalm-Zen/Muse-Glimmer-30B-surgery-report
- Motor xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Documentación de soporte de modelos del motor: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#muse-glimmer-30b-surgical-6p34-q8_0
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Solicitud de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=model_request.yml
- Informe de resultados: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=result_report.yml
- Otros archivos del autor: https://huggingface.co/Joakimpalm-Zen
