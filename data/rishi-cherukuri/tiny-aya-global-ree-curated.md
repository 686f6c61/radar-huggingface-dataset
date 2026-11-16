# rishi-cherukuri/tiny-aya-global-ree-curated

## Resumen

`tiny-aya-global-ree-curated` es un adaptador LoRA de alineación entrenado sobre el modelo base `CohereLabs/tiny-aya-global` de Cohere Labs. Lo desarrolla el usuario `rishi-cherukuri` en el contexto del hackathon Lexsi AI Safety & Alignment (Track 1, Problema 8), utilizando el framework Lexsi AlignTune con backend TRL. El adaptador está especializado en un dominio muy concreto: la hidrometalurgia de tierras raras, en particular la separación de Nd3+ y Pr3+ mediante extracción por disolventes con PC-88A y el equilibrio de pH asociado.

El modelo no es un modelo fundacional autónomo, sino un adaptador PEFT que debe cargarse junto al modelo base `tiny-aya-global`. Su relevancia es acotada: demuestra un flujo de trabajo de ajuste fino eficiente (LoRA) sobre un modelo pequeño multilingüe de Cohere Labs para un dominio técnico de nicho, con fines de investigación y experimentación en alineación de dominio.

La información pública disponible es escasa: el repositorio tiene 0 GB declarados, 0 descargas y 0 likes, y no se detallan métricas de evaluación, composición del dataset ni resultados de benchmarks. La model card se limita a describir la configuración del experimento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (adaptador LoRA con r=16, alpha=32; el modelo base es un modelo pequeño de Cohere Labs, tamaño exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base `tiny-aya-global`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base `tiny-aya-global`, orientado a cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio PEFT/LoRA; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica Parameter-Efficient Fine-Tuning (PEFT) LoRA con rango r=16 y alpha=32, aplicada sobre el modelo base `CohereLabs/tiny-aya-global`. El entrenamiento se realizó con el framework Lexsi AlignTune, que utiliza TRL como backend, dentro del Track 1 (Problema 8) del Lexsi AI Safety & Alignment Hackathon. La partición de datos empleada es la denominada `curated`, a partir del fichero `curated_dataset.jsonl`.

El dominio de entrenamiento es la extracción por disolventes de elementos de tierras raras: separación de Nd3+ y Pr3+, equilibrios con el extractante PC-88A y ajuste de pH. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO más allá del ajuste LoRA. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto especializada en química de tierras raras e hidrometalurgia, en concreto en la separación Nd3+/Pr3+ mediante extracción por disolventes.
- Razonamiento técnico sobre equilibrios con PC-88A y balance de pH en procesos de extracción.
- Ajuste de dominio mediante LoRA, que permite cargar y descargar el adaptador sobre el modelo base sin reentrenar los pesos completos.
- Capacidades multilingües heredadas del modelo base `tiny-aya-global` (no verificadas para el adaptador).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (thinking mode, visión, audio): no disponible (no documentado).

## Casos de uso

- Asistencia técnica en laboratorio de hidrometalurgia: el adaptador puede responder consultas sobre condiciones de separación Nd3+/Pr3+ y equilibrios con PC-88A, aprovechando el ajuste de dominio sobre el corpus curado.
- Formación interna de ingenieros químicos: servir como base para un asistente que explique el ajuste de pH y las variables operativas de la extracción por disolventes, siempre con revisión humana.
- Prototipado de asistentes de dominio en investigación: al ser un adaptador LoRA ligero, permite experimentar con ajuste de dominio sobre un modelo pequeño sin infraestructura pesada.
- Generación de borradores de documentación técnica: redactar notas o procedimientos preliminares sobre procesos de separación de tierras raras, sujetos a validación por especialistas.
- Estudio de alineación y seguridad en dominios técnicos: útil como caso de estudio reproducible del flujo Lexsi AlignTune con TRL para evaluar comportamientos de modelos ajustados en nichos científicos.
- Base para experimentos de ajuste incremental: al mantener el modelo base intacto, permite comparar el adaptador `curated` frente a otras particiones de datos en el mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador LoRA sobre un modelo base pequeño (familia `tiny-aya`), los requisitos son los del modelo base más el adaptador, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (no confirmado).
- Opciones de despliegue: carga mediante la librería `peft` junto con el modelo base; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rishi-cherukuri/tiny-aya-global-ree-curated` | Adaptador LoRA (r=16, alpha=32) sobre `tiny-aya-global` | no disponible | no disponible | Apache 2.0 | Hugging Face (PEFT) |
| `CohereLabs/tiny-aya-global` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores LoRA de dominio sobre `tiny-aya` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el adaptador está entrenado para hidrometalurgia de tierras raras (Nd3+/Pr3+, PC-88A, pH); su uso fuera de ese ámbito puede degradar la calidad respecto al modelo base.
- Riesgo de alucinación en datos químicos y operativos: no se documentan evaluaciones que garanticen exactitud en valores de equilibrio, concentraciones o condiciones de proceso; requiere validación por especialistas.
- Sin métricas de evaluación publicadas: no hay benchmarks, ni evaluación de seguridad, ni comparación con el modelo base.
- Sesgos conocidos: no documentados; se heredan los del modelo base `tiny-aya-global`, no caracterizados en esta ficha.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; dependen del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador es un artefacto de hackathon sin garantías de mantenimiento ni soporte.
- Repositorio sin tracción: 0 descargas y 0 likes, tamaño declarado de 0 GB y creado en 2026-11-16; la reproducibilidad y la integridad de los pesos no están verificadas.
- No apto para producción sin una evaluación independiente previa.

## Enlaces

- Hugging Face: https://huggingface.co/rishi-cherukuri/tiny-aya-global-ree-curated
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Framework Lexsi AlignTune: no disponible
- Paper, blog o demo del adaptador: no disponible
