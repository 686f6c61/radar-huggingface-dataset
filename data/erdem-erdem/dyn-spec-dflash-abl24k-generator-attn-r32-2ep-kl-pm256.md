# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pm256

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* (modelo borrador) para decodificación especulativa, desarrollado por el usuario erdem-erdem en el marco del port del generador DFlash del proyecto dyn-spec. No se trata de un modelo de lenguaje autónomo, sino de un artefacto intermedio de investigación: un adaptador LoRA de tipo generador que se entrena sobre un drafter preexistente (`z-lab/Qwen3-8B-DFlash-b16`) para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B` mediante decodificación especulativa.

El artefacto corresponde a la ejecución de adaptación `abl24k-generator-attn-r32-2ep-kl-pm256`, en la rama `direct` y la etapa `pretraining`, con 2667 actualizaciones de optimizador y semilla 42. El repositorio incluye el estado completo del entrenamiento (checkpoint con estado del optimizador), métricas, evaluaciones offline y trazabilidad de procedencia (identidad del almacén de activaciones, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno). El tamaño del repositorio es de 6,6 GB.

Es relevante ahora porque la decodificación especulativa se ha consolidado como una de las técnicas estándar para reducir la latencia de inferencia en LLM sin degradar la calidad de salida, y este tipo de artefactos documenta de forma reproducible cómo se adaptan los drafters a modelos objetivo concretos. No obstante, el autor advierte explícitamente de que no es un paquete de servicio: la exportación para servir DFlash aún no está portada, por lo que su uso directo en producción no es posible en el estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de tipo generador sobre drafter DFlash (decodificación especulativa); arquitectura base del drafter no detallada en la información disponible |
| Parámetros totales | no disponible (rango LoRA r32; tamaño del repositorio de 6,6 GB, incluye estado del optimizador) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) más artefactos de ejecución en `run/`; no hay safetensors ni GGUF indicados |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (`r32`) entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), que actúa como modelo borrador para el modelo objetivo `Qwen/Qwen3-8B`. El entrenamiento se realizó en la etapa de preentrenamiento de la rama `direct`, con 2667 actualizaciones de optimizador y semilla 42, y utiliza un almacén de activaciones (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`) del que se conserva la identidad completa en `provenance/store/`. El nombre del experimento sugiere el uso de una pérdida con componente KL (`kl`) y un parámetro `pm256`, aunque los detalles exactos de la función de pérdida no se especifican en la información disponible.

La innovación técnica principal es el propio marco de trabajo: un *drafter* DFlash adaptado mediante LoRA para alinearse con las distribuciones de activación del modelo objetivo, lo que permite entrenar el borrador sin modificar los pesos del modelo base. El repositorio incluye además evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14, así como métricas por fila, lo que facilita la reproducción del experimento. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de borradores (*drafting*) para decodificación especulativa sobre `Qwen/Qwen3-8B`: el adaptador propone tokens candidatos que el modelo objetivo verifica.
- Aceleración de inferencia: su propósito es reducir la latencia por token aceptado en el pipeline de decodificación especulativa.
- Adaptación mediante LoRA: permite ajustar el drafter a un modelo objetivo concreto sin reentrenar el borrador desde cero.
- Trazabilidad y reproducibilidad: incluye checkpoint con estado del optimizador, comandos de entrenamiento, parche de `speculators`, procedencia y manifiesto con SHA256 de cada fichero.
- Evaluación offline integrada: métricas de reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento; el artefacto no es un modelo conversacional.

## Casos de uso

- Investigación en decodificación especulativa: sirve como punto de partida reproducible para estudiar cómo la adaptación LoRA de un drafter afecta a la tasa de aceptación de tokens; el repositorio incluye el comando de entrenamiento y el parche exactos.
- Reproducción de experimentos: los ficheros `run_record_*.json`, `metrics.json` y `timing.json` permiten replicar la ejecución `abl24k-generator-attn-r32-2ep-kl-pm256` con la misma semilla y almacén de activaciones.
- Desarrollo de pipelines de servicio acelerado: una vez portada la exportación de servicio DFlash (pendiente según el autor), el adaptador podría integrarse en un servidor de inferencia basado en vLLM para reducir la latencia de `Qwen3-8B`.
- Comparación de estrategias de adaptación: al existir una rama `direct` y una etapa `pretraining` documentadas, el artefacto permite contrastar esta configuración con otras ejecuciones del mismo proyecto.
- Auditoría de procedencia de modelos: el directorio `provenance/` y `MANIFEST.json` permiten verificar la integridad de los pesos y el origen de los datos de activación, útil en entornos con requisitos de trazabilidad.
- Formación y docencia: como ejemplo práctico de entrenamiento de drafters con LoRA, pérdida KL y almacenes de activaciones para explicar técnicas de aceleración de inferencia.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la validación interna sobre 200 filas fijas (una fila por LoRA, métrica `full_acc`) y a la tasa de aceptación media `τ (eal)`:

| Actualización | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5348 | 7.903 | 0.3525 | 0.6070 | 0.6843 | 0.4952 |

El entrenamiento mejora todas las métricas de forma moderada: `full_acc` sube 0,0083 puntos, `τ` aumenta 0,200 y las cuatro categorías (chat, code, math, stem) mejoran entre 0,0062 y 0,0114 puntos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 6,6 GB incluye estado del optimizador, por lo que el tamaño de los pesos del adaptador es sustancialmente menor, pero no se especifica.
- GPU recomendadas: no disponible. El modelo objetivo es `Qwen3-8B`, que en FP16 requiere aproximadamente 16 GB de VRAM, a lo que habría que sumar el drafter y las cachés KV; no se aportan cifras concretas.
- Cabe en GPU de consumo: no confirmado. Un modelo de 8B en cuantización de 4 bits podría caber en GPUs de 12-16 GB, pero la información disponible no detalla cuantizaciones ni requisitos del drafter.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada, por lo que no hay integración lista con vLLM, llama.cpp, Ollama ni TGI. El repositorio menciona procedencia de un lanzamiento de vLLM durante la extracción de activaciones, no un paquete de servicio.
- Latencia y throughput: no disponibles; solo se publica la tasa de aceptación `τ (eal)` de 7,903 en la validación interna.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros drafters o adaptadores comparables con especificaciones verificables (parámetros, contexto, rendimiento, licencia). El único punto de referencia citado es el drafter base `z-lab/Qwen3-8B-DFlash-b16`, del que no se detallan specs en este repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: es un checkpoint de entrenamiento de un drafter y no debe usarse para generación de texto directa.
- No es un paquete de servicio: el autor advierte que la exportación de servicio DFlash no está portada, por lo que no puede desplegarse tal cual en producción.
- Licencia no disponible: no se indica licencia, lo que impide confirmar si el uso comercial está permitido; además, los términos del modelo objetivo (`Qwen/Qwen3-8B`) y del drafter base pueden aplicar restricciones adicionales.
- Idiomas no disponibles: no se documenta cobertura lingüística.
- Riesgo de alucinación: inherente al pipeline de decodificación especulativa; los tokens propuestos por el drafter son verificados por el modelo objetivo, pero una tasa de aceptación baja puede degradar la latencia en lugar de mejorarla.
- Sesgos: no documentados; el almacén de activaciones `mix24k` no detalla su composición en la información disponible.
- Mejora marginal: la ganancia de `full_acc` es de 0,0083 puntos sobre la validación de 200 filas, por lo que el impacto práctico debe validarse en cargas reales.
- Sin benchmarks estándar ni comparativas externas: la evaluación se limita a métricas internas del proyecto.
- Fecha de creación futura (2026-11-13) en los metadatos de Hugging Face, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pm256
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16 (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
