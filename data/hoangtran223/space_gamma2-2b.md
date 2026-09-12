# HoangTran223/SPACE_Gamma2-2B

## Resumen

SPACE_Gamma2-2B (cuyo nombre real de modelo es Gemma2-2B, tal y como aclara su propia model card) es un ajuste fino de investigación sobre `google/gemma-2-2b` desarrollado por el usuario HoangTran223. El modelo parte de un checkpoint ya sometido a SFT (`HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159`) y se entrena después con un procedimiento de auto-juego (self-play) etiquetado como SPACE, con datos sintéticos generados por el propio modelo en cada iteración. El repositorio contiene los artefactos de dos iteraciones completas (`ite0`, `ite1`), una instantánea intermedia de la tercera (`ite2/LATEST`) y los ficheros `.jsonl` con los pares sintéticos de entrenamiento.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción: la model card se limita a describir la disposición de carpetas, la receta de entrenamiento (2 épocas por iteración, learning rate `5e-7`) y el método de carga. No incluye evaluaciones, ni descripción del dataset final, ni detalles sobre el algoritmo SPACE, y el repositorio acumula 26,7 GB de pesos debido a la duplicación de checkpoints por iteración.

Su relevancia es acotada y muy específica: sirve para estudiar cómo evoluciona un modelo pequeño (2B) bajo un bucle de auto-juego con datos sintéticos, y como punto de partida para quien quiera replicar o auditar esa receta. No hay evidencia publicada de mejoras de rendimiento frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, heredada del modelo base `google/gemma-2-2b`); no detallada en la model card del repositorio |
| Parámetros totales | No disponible en el repositorio; el modelo base `google/gemma-2-2b` es de ~2,6 mil millones de parámetros |
| Longitud de contexto | No disponible en el repositorio; el modelo base Gemma 2 2B declara 8.192 tokens |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos en formato `safetensors` (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible. La model card no declara idiomas; el SFT inicial usó Ultrachat, corpus predominantemente en inglés |
| Licencia | `gemma` (términos de uso de Gemma de Google) |
| Formato de pesos | `safetensors`, estructurado en subcarpetas por iteración (`ite0/`, `ite1/`, `ite2/LATEST/`) |
| Tamaño del repositorio | 26,7 GB |
| Librería declarada | `transformers` (también con el tag `endpoints_compatible`) |
| Modelo base | `google/gemma-2-2b` |
| Checkpoint de inicialización SFT | `HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159` |
| Fecha de creación / actualización | 11 de septiembre de 2026 / 12 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B, un transformer decoder-only con atención de ventana deslizante y alternancia entre atención local y global. La model card de este repositorio no describe la arquitectura ni aporta modificaciones sobre ella, por lo que no hay constancia de cambios estructurales: el trabajo se centra exclusivamente en el post-entrenamiento.

El procedimiento documentado es un bucle de auto-juego denominado SPACE sobre un checkpoint ya ajustado con SFT. Se han completado dos iteraciones (`ite0` e `ite1`), cada una de 2 épocas con learning rate `5e-7`, y existe una tercera en curso con una instantánea intermedia en `ite2/LATEST` que incluye un `resume_meta.json` con el campo `example_counter`. Los ficheros `ite0/train.jsonl`, `ite1/train.jsonl` e `ite2/train.jsonl` contienen los pares sintéticos empleados en cada ronda. El nombre del repositorio usa "Gamma2" por petición expresa, aunque el modelo es Gemma 2. No se documentan número total de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación adicional; tampoco se detalla el algoritmo SPACE en sí.

## Capacidades

- Generación de texto conversacional en formato de diálogo, heredada del ajuste SFT sobre Ultrachat.
- Generación de datos sintéticos: los ficheros `train.jsonl` de cada iteración son pares generados por el propio modelo, lo que evidencia capacidad de producir conversaciones completas de forma autónoma.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 2B ajustado por SFT; sin evaluación publicada que lo cuantifique.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Replicación de experimentos de auto-juego: cargando `ite0` e `ite1` por separado (`from_pretrained(..., subfolder="ite1")`) se puede medir la deriva entre iteraciones sobre el mismo prompt set, que es exactamente el objetivo declarado del repositorio.
- Auditoría de datos sintéticos: los ficheros `ite0/train.jsonl`, `ite1/train.jsonl` e `ite2/train.jsonl` permiten analizar qué tipo de conversaciones genera el modelo contra sí mismo y detectar colapso de diversidad o sesgos amplificados.
- Prototipado de asistentes conversacionales en local: con ~5 GB en bf16 cabe en una GPU de consumo, lo que lo hace útil para maquetar un chat de dominio general antes de pasar a un modelo mayor.
- Generación de datasets de instrucciones en inglés para entrenar modelos más pequeños: el modelo puede producir pares pregunta-respuesta sintéticos que luego se filtran y se usan como corpus de SFT.
- Investigación académica sobre post-entrenamiento sin supervisión humana: sirve como caso de estudio de un pipeline self-play completo, con logs en `logs/space_gemma2.log` y metadatos de reanudación en `ite2/LATEST/resume_meta.json`.
- Docencia y prácticas de ingeniería de modelos: el repositorio ilustra de forma explícita la gestión de checkpoints intermedios, reanudación de entrenamiento y organización por iteraciones.
- Base para un ajuste fino posterior específico de dominio: al ser un Gemma 2 2B compatible con `transformers`, se puede seguir entrenando con LoRA sobre cualquiera de las iteraciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia de un único checkpoint de ~2,6B parámetros: ~5,5 GB en bf16/fp16 (más caché KV), ~2,8 GB en int8 y ~1,5 GB en int4. Son estimaciones aritméticas a partir del tamaño del modelo base; el repositorio no publica pesos cuantizados.
- Almacenamiento: el repositorio completo ocupa 26,7 GB porque duplica checkpoints por iteración. Si solo se necesita una iteración, conviene descargar únicamente la subcarpeta correspondiente.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB ejecutan el modelo en bf16 sin problemas.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para un solo checkpoint, pero adecuadas si se quieren cargar varias iteraciones en paralelo para comparativas.
- Opciones de despliegue: `transformers` de forma nativa (vía `AutoModelForCausalLM.from_pretrained` con `subfolder`); vLLM y TGI son compatibles con pesos `safetensors` de Gemma 2; llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, conversión que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPACE_Gamma2-2B | No declarado (~2,6B heredados del base) | No declarado (8.192 en el base) | No publicados | Gemma | HuggingFace, 0 descargas |
| google/gemma-2-2b | ~2,6B | 8.192 tokens | Publicados por Google en su model card | Gemma | HuggingFace, muy extendido |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Publicados por Google en su model card | Gemma | HuggingFace, muy extendido |
| HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159 | No declarado | No declarado | No publicados | No disponible | HuggingFace; es el checkpoint de inicialización de este modelo |

No se dispone de datos de rendimiento comparados para ninguno de los modelos de la tabla salvo los publicados por Google para el modelo base, que no se reproducen aquí por no formar parte de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el checkpoint de SFT del que parte, por lo que no se puede afirmar que el auto-juego haya mejorado nada.
- Riesgo de degradación por auto-juego: los bucles de self-play sin filtrado fuerte tienden a reducir la diversidad de las respuestas y a amplificar los sesgos del modelo inicial. Los `.jsonl` publicados permiten verificarlo, pero el autor no aporta conclusiones.
- Alucinación: al ser un modelo de 2B sin fases de alineación documentadas más allá del SFT inicial, la tasa de afirmaciones falsas con apariencia plausible es inherentemente alta.
- Cobertura de idiomas no declarada: el entrenamiento se apoya en Ultrachat, mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado ni medido.
- Licencia Gemma: el uso comercial está permitido bajo los Términos de Uso de Gemma, que imponen obligaciones de atribución, una política de uso prohibido y cláusulas de redistribución. Cualquier despliegue en producción debe revisarse contra esos términos.
- Confusión de nombres: el repositorio se llama `SPACE_Gamma2-2B` ("Gamma", no "Gemma"); conviene no confundirlo con otros modelos Gemma al automatizar descargas.
- Estructura de carga no estándar: el modelo no se carga directamente desde la raíz del repositorio, sino indicando `subfolder="ite1"` (o `ite0`). Las herramientas que esperen un repositorio plano fallarán.
- Estado inacabado: existe una tercera iteración a medias (`ite2/LATEST`) con metadatos de reanudación; no debe tratarse como un checkpoint final.
- Fechas del repositorio en 2026 y ausencia de pipeline declarado en HuggingFace; no hay demo, Space ni endpoint público asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HoangTran223/SPACE_Gamma2-2B
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Checkpoint de inicialización SFT: https://huggingface.co/HoangTran223/gemma2_2b_sft_ultrachat200k_20260820_043159
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: solo aparecieron listados de anuncios clasificados y una página de sesión de pósteres de ICLR que menciona Gemma 2 de forma tangencial (https://iclr.cc/virtual/2025/session/31973). No se han encontrado papers, blogs ni repositorios asociados a SPACE_Gamma2-2B.
