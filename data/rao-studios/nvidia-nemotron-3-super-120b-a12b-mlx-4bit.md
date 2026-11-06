# rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B en versión MLX 4-bit es una cuantización del modelo original de NVIDIA (publicado en BF16 como `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`), preparada por Rao Studios para su ejecución en Apple Silicon mediante el framework MLX. Se trata de un modelo híbrido de 120.668.692.480 parámetros totales, de los cuales 12.700 millones están activos por token, lo que lo sitúa en la categoría de modelos MoE de gran tamaño pero con coste de inferencia contenido. La arquitectura combina 88 capas: 40 de Mamba-2, 40 de expertos LatentMoE (512 enrutados, 22 activos) y 8 de atención, con una longitud de contexto declarada de 262.144 tokens en `config.json` (NVIDIA reporta hasta 1M).

El modelo resuelve el problema de desplegar un LLM de escala frontier en hardware de consumo Apple con memoria unificada, algo imposible con la versión BF16 original. La cuantización affine a 4 bits con group size 64 reduce los pesos a 68,0 GB, lo que permite su ejecución en Macs con 96 GB o más de memoria unificada. Es relevante ahora porque el ecosistema MLX está madurando rápidamente y este tipo de conversiones hacen viable el trabajo con modelos de más de 100.000 millones de parámetros en estaciones de trabajo locales.

Esta ficha describe específicamente la conversión MLX 4-bit de Rao Studios, que reproduce byte a byte los pesos, tokenizer, chat template y configuración de generación del commit `46d2ec99579734e0da13b6189bb7ea500b7a1e00` de `mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-4bit`, con la única modificación de eliminar `auto_map` de `config.json`. No se incluye el head de multi-token-prediction (MTP) ni los ficheros Python de modelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 40 capas Mamba-2 + 40 capas LatentMoE + 8 capas de atención (88 capas totales) |
| Parámetros totales | 120.668.692.480 (120,6B) |
| Parámetros activos | 12,7B por token |
| Longitud de contexto | 262.144 tokens según `config.json`; NVIDIA reporta hasta 1M |
| Tipos de cuantización | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (versión de 15 de diciembre de 2025) |
| Formato de pesos | safetensors (14 shards, MLX) |

## Arquitectura y entrenamiento

La arquitectura es híbrida y poco convencional: de las 88 capas, 40 son Mamba-2 (modelos de espacio de estados), 40 son capas LatentMoE con 512 expertos enrutados y 22 activos por token, y 8 son capas de atención. Esta combinación busca reducir el coste de atención y de caché KV en contextos largos, manteniendo capacidad de modelado mediante los expertos. El resultado es un modelo con 120,6B parámetros totales pero solo 12,7B activos por token, lo que abarata la inferencia respecto a un transformer denso del mismo tamaño. La caché KV solo se mantiene en las 8 capas de atención, lo que según la model card supone aproximadamente 8 KB por token de contexto, más un estado Mamba fijo de unos 170 MB por stream.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en la información proporcionada. Tampoco se detalla en la model card el proceso de cuantización más allá de los parámetros (affine, 4 bits, group size 64) y la herramienta (mlx-lm). La conversión no incluye el head de multi-token-prediction (MTP) del modelo original, por lo que no se puede aprovechar decodificación especulativa basada en MTP en esta versión. El modelo soporta un modo de razonamiento explícito mediante etiquetas `<think>…</think>`, que puede desactivarse pasando `enable_thinking: false` al chat template.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline declarado `text-generation`.
- Modo de razonamiento explícito: el modelo "piensa" dentro de `<think>…</think>` antes de responder; desactivable vía chat template.
- Procesamiento de contextos largos: hasta 262.144 tokens según configuración, con reporte de hasta 1M por parte de NVIDIA.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Ejecución local en Apple Silicon mediante MLX, con integración en mlx-lm y en el stack Frigate/Craft de Rao Studios.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede mantener conversaciones multi-turno con contexto largo (262K tokens) ejecutándose íntegramente en un Mac con 96 GB o más de memoria unificada, sin depender de APIs externas ni de conectividad.
- Procesamiento de documentos extensos: con 262K tokens de contexto y un coste de caché de aproximadamente 8 KB por token (solo 8 capas de atención), es viable ingerir contratos, informes o bases de código completas en una sola pasada para tareas de resumen, extracción o preguntas y respuestas.
- Razonamiento asistido con trazas explícitas: el modo `<think>` permite obtener cadenas de razonamiento auditables, útil en entornos de investigación donde se quiere inspeccionar el proceso de decisión del modelo, y desactivarlo cuando se prioriza latencia.
- Prototipado e investigación en MLX: al estar empaquetado para mlx-lm con soporte de `nemotron_h` y LatentMoE (`moe_latent_size`), sirve como banco de pruebas para experimentar con arquitecturas híbridas Mamba-2 + MoE en hardware Apple.
- Desarrollo de aplicaciones privadas y sensibles: al ejecutarse localmente y no requerir envío de datos a terceros, encaja en escenarios con requisitos de confidencialidad (sanidad, legal, análisis financiero interno) donde el uso de APIs en la nube no es aceptable.
- Evaluación comparativa de arquitecturas: investigadores que necesiten contrastar el comportamiento de un modelo híbrido SSM/MoE de 120B frente a transformers densos o MoE convencionales pueden desplegarlo en una estación de trabajo Apple sin infraestructura GPU dedicada.
- Generación de código y texto técnico en local: aunque no se documentan benchmarks específicos, el tamaño y la naturaleza del modelo permiten su uso como asistente de programación offline en flujos de trabajo individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 68,0 GB de pesos en 4-bit; se recomienda un Mac con 96 GB o más de memoria unificada.
- Coste de contexto: aproximadamente 8 KB por token (solo las 8 capas de atención cachean claves y valores), más un estado Mamba fijo de unos 170 MB por stream.
- GPU compatibles: Apple Silicon con memoria unificada de 96 GB o superior (por ejemplo, configuraciones de Mac Studio o MacBook Pro con M3/M4 Max o Ultra). No aplica a GPUs NVIDIA o AMD en esta versión MLX.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.); sí en Apple Silicon de gama alta con 96 GB o más.
- Opciones de despliegue: mlx-lm (requiere versión con soporte de `nemotron_h` y LatentMoE, `moe_latent_size`) y el stack Frigate/Craft de Rao Studios a partir de la release que añade soporte LatentMoE. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Super-120B-A12B (este, MLX 4-bit) | 120,6B / 12,7B | 262.144 (hasta 1M reportado) | MLX safetensors 4-bit | NVIDIA Nemotron Open Model License | Hugging Face (rao-studios) |
| NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120,6B / 12,7B | 262.144 (hasta 1M reportado) | safetensors BF16 | NVIDIA Nemotron Open Model License | Hugging Face (nvidia) |
| mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-4bit | 120,6B / 12,7B | 262.144 (hasta 1M reportado) | MLX safetensors 4-bit | NVIDIA Nemotron Open Model License | Hugging Face (mlx-community) |

No se dispone en la información proporcionada de datos de rendimiento (benchmarks) que permitan comparar cuantitativamente con alternativas de otros fabricantes o arquitecturas. Las tres entradas de la tabla corresponden al mismo modelo base en distintos formatos y empaquetados.

## Limitaciones y advertencias

- Licencia: NVIDIA Nemotron Open Model License (versión de 15 de diciembre de 2025). Es una licencia "other", no una licencia open source estándar (Apache 2.0, MIT); es imprescindible revisar el texto completo en `LICENSE` antes de cualquier uso comercial.
- Atribución: el repositorio no está afiliado ni respaldado por NVIDIA; "NVIDIA" y "Nemotron" solo indican el origen de los pesos. Debe respetarse la atribución indicada en `NOTICE`.
- Repositorio de solo pesos: no incluye los ficheros Python de modelado, configuración ni el parser de razonamiento, ni el head de MTP. La ejecución depende de que la librería (mlx-lm o Frigate) implemente `nemotron_h` con soporte LatentMoE.
- Requisito de memoria elevado: 68 GB de pesos más el coste de contexto hacen inviable su ejecución en la mayoría de equipos; se necesita Apple Silicon con 96 GB o más de memoria unificada.
- Contexto efectivo: aunque `config.json` declara 262.144 tokens, el rendimiento real en contextos muy largos no está documentado en la información disponible.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede asumirse un buen rendimiento en castellano sin evaluación previa.
- Sesgos y alucinaciones: no se documentan en la información proporcionada; como en cualquier LLM, existe riesgo de alucinación y de sesgos heredados de los datos de entrenamiento, que no se detallan.
- Cuantización: la conversión a 4-bit puede degradar ligeramente la calidad frente al BF16 original; no se aportan métricas de la pérdida de rendimiento.
- Sin benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K u otras evaluaciones en la información disponible, lo que dificulta la comparación objetiva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/rao-studios/NVIDIA-Nemotron-3-Super-120B-A12B-mlx-4bit
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Conversión MLX 4-bit de mlx-community: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Super-120B-A12B-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Stack Craft de Rao Studios: https://craft.rao.nyc
