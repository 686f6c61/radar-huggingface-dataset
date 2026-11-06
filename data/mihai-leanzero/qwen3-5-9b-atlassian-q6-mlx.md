# Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q6-mlx

## Resumen

Qwen3.5-9B-Atlassian-Q6-mlx es un modelo de lenguaje derivado de Qwen/Qwen3.5-9B, ajustado mediante LoRA por el estudio LeanZero para el dominio de desarrollo sobre la plataforma Atlassian (Forge, Jira, Confluence y Jira Service Management). El resultado se ha fusionado con el modelo base en bf16 y se ha cuantizado a 6 bits (group size 64) con mlx-lm, con el objetivo de ofrecer inferencia local eficiente en Apple Silicon manteniendo un conocimiento profundo de las APIs y convenciones de Atlassian.

El modelo resuelve un problema muy concreto: los LLM generalistas, incluso los de 9B parámetros, tienen un conocimiento superficial o desactualizado de Forge (el framework de apps de Atlassian), de los manifiestos YAML, de los endpoints y de los scopes de las distintas APIs. Este ajuste eleva la precisión en pruebas de identificadores de Atlassian del 15% al 62% (con thinking activado) y del 38% al 69% (sin thinking) respecto a su base sin tocar.

Es relevante porque demuestra que un ajuste fino bien dirigido sobre un modelo de 9B puede especializarse en un ecosistema técnico concreto y desplegarse en un solo Mac Studio, a una fracción del coste de memoria de su hermano mayor de 27B. La versión publicada es la v0.5 de la familia, aunque este miembro de 9B no ha cambiado desde la v0.3 (ronda T1-9B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste LoRA fusionado y cuantizado a 6 bits |
| Parametros totales | 8.953.801.728 (~8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el harness evalua hasta 32.768 tokens) |
| Tipos de cuantizacion | 6 bits, group size 64 (MLX); existe variante de 8 bits del mismo autor |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con cabeza MTP en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de ~8,95B parámetros, y se ajusta con LoRA sobre el mismo. La cuantización final es de 6 bits con group size 64, realizada con mlx-lm; el autor reporta una divergencia respecto a la versión base+adaptador de KLD top-1024 de 0,0941 y un top-1 del 97,37% (la variante de 8 bits logra 0,0537 y 99,14%).

El entrenamiento se realizó en una sola ronda (T1-9B) durante dos épocas completas (4.300 pasos, learning rate 5e-5) sobre la mezcla m7 de la ronda 4 del modelo de 27B: 18.189 muestras, unos 6,1M tokens. La composición incluye doce apps Forge escritas por LeanZero, cinco fixtures de forge-sim, manifiestos generados por esquema y validados con el validador de Atlassian, ejemplos de UI Kit que compilan con @forge/react 12, la documentación de Forge en texto y en pares pregunta-respuesta con verificación literal, hechos de endpoints y scopes extraídos de seis especificaciones OpenAPI de Atlassian, el compendio de investigación comunitaria de LeanZero, 220 hilos públicos del Atlassian Developer Community, apps del modelo de 27B que pasaron las puertas de calidad (431 + 937) y 362 pares de corrección validadas por el validador, más una porción de replay de código general. Se entrenó con `reasoning_effort=medium` y `preserve_thinking=false`. Una segunda ronda sobre la mezcla v0.4 del 27B no superó el umbral de publicación (18 de 25 apps completas y 19 de 25 manifiestos) y no se publicó.

## Capacidades

- Generación de código específico de Forge: apps completas a partir de un brief de una línea, manifiestos YAML y componentes de UI Kit.
- Conocimiento factual de las APIs de Atlassian: endpoints, scopes y módulos de Forge, Jira, Confluence y JSM.
- Razonamiento con modo thinking activable (temperatura 1.0, top_p 0.95, top_k 20) y modo instruct (temperatura 0.7, top_p 0.8, top_k 20, presence penalty 1.5).
- Tool calling y parsing de llamadas compatible con el parser `qwen3_coder_xml` en Rapid-MLX.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) integrada en el checkpoint.
- Generación de texto conversacional y respuesta a preguntas técnicas del ecosistema Atlassian.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Generación de apps Forge desde un brief: el modelo produce manifiestos y código que pasan el validador de Atlassian y compilan con tsc contra los tipos reales de @forge/*; útil para prototipado rápido de integraciones internas.
- Asistente de desarrollo en el IDE: responder preguntas sobre qué módulo de Forge añade un panel a la vista de incidencia de Jira, qué scopes requiere un endpoint o cómo se estructura un manifiesto, con un 62% de acierto en identificadores frente al 15% del base.
- Migración de apps e integraciones a Forge: el modelo conoce endpoints y scopes de seis especificaciones OpenAPI de Atlassian, lo que permite generar borradores de código de migración y revisar compatibilidad.
- Automatización de soporte interno para equipos de plataforma: desplegado en local con LM Studio o mlx-lm, responde consultas sobre Jira, Confluence y JSM sin enviar datos a la nube.
- Generación de pares de corrección en pipelines de validación: combinado con el validador de manifiestos y tsc, el modelo propone correcciones que luego se verifican automáticamente, reduciendo el coste de revisión manual.
- Agente de escritorio con tool calling: integrado en Rapid-MLX con el parser `qwen3_coder_xml`, puede encadenar llamadas a herramientas para consultar y modificar configuraciones de Forge en flujos multi-paso.
- Evaluación y benchmark de modelos especializados: sirve como referencia de cuánto puede especializarse un 9B frente a un 27B en un dominio técnico acotado, con métricas reproducibles de KLD, aceptación MTP y tasas de bucle.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La columna "27B release" corresponde al modelo hermano de 27B de la misma familia.

| Prueba | Base 9B sin tocar | 9B ajustado | 27B release |
|---|---|---|---|
| Identificadores pre / post, thinking on | 15% / 15% | 62% / 15% | 85% / 15% |
| Identificadores, thinking off (servido) | n/a | 69% / 38% | 85% / 31% |
| Manifiestos válidos (de 25) | n/a | 19 | 31,3 |
| App completa que pasa todas las puertas (de 25) | n/a | 16 | 30,0 |
| Bucles por tramo | 0 / 0 / 5 / 3 | 0 / 0 / 4 / 0 | 0 / 0 / 1 / 0 |
| No terminación por tramo | 28 / 23 / 33 / 23% | 18 / 8 / 13 / 0% | 38 / 30 / 35 / 13% |
| 8-bit fusionado vs base+adaptador: KLD / top-1 | - | 0,0537 / 99,14% | 0,0339 / 99,56% |
| Aceptación MTP / speedup | - | 67% / 1,14x, 1,09x, 1,08x, 1,05x | 58% / 1,45x, 1,38x, 1,38x, 1,27x |
| Carga en LM Studio | - | PASS | PASS |

Otras métricas reportadas: pérdida de validación de 0,575 en su mezcla de entrenamiento y 0,959 en la mezcla de la ronda 1 del 27B; sonda de fuga (leak probe) con 0 fugas sobre 112 salidas (26 coincidencias de regex, 21 marcadas como hallucinated y 5 como hallucinated-token); velocidad de decodificación con MTP de 63 a 72 tok/s (1,14x) a 128 tokens, de 63 a 69 tok/s (1,09x) a 2.048, de 61 a 66 tok/s (1,08x) a 8.192 y de 54 a 57 tok/s (1,05x) a 32.768.

## Requisitos de hardware

- VRAM estimada: el repo pesa 7,8 GB en 6 bits; la inferencia requiere aproximadamente 8-10 GB de memoria unificada o VRAM, según el contexto y el tamaño de lote.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada (el autor lo ejecutó en un Mac Studio); en el ecosistema CUDA no está soportado de forma nativa por ser un checkpoint MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 16 GB o más; no aplica a GPUs NVIDIA/AMD sin conversión previa del checkpoint.
- Opciones de despliegue: Rapid-MLX (fork de LeanZero, con soporte de MTP y tool calling), LM Studio con motor MLX, mlx-lm (`mlx_lm.generate`).
- Latencia y throughput: 63-72 tok/s en decodificación con MTP en un solo stream, según la longitud de contexto (medido en Rapid-MLX sobre Mac Studio).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Atlassian-Q6-mlx | ~8,95B | no disponible | Forge, Jira, Confluence, JSM | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3.5-9B (base) | ~8,95B | no disponible | Generalista | Apache 2.0 | Hugging Face |
| 27B release de la misma familia | 27B (no confirmado) | no disponible | Forge, Jira, Confluence, JSM | no disponible | Hugging Face |
| Variante 8-bit del mismo autor | ~8,95B | no disponible | Forge, Jira, Confluence, JSM | Apache 2.0 | Hugging Face |

El 27B supera al 9B en todas las pruebas (30,0 de 25 en apps completas frente a 16 de 25), pero requiere mucha más memoria. La variante de 8 bits del 9B ofrece mejor fidelidad de cuantización (KLD 0,0537 frente a 0,0941) a cambio de mayor tamaño.

## Limitaciones y advertencias

- No es un compilador: el propio autor recomienda emparejarlo con el validador de manifiestos de Atlassian y tsc; 9 de 25 manifiestos y 9 de 25 apps completas fallan las puertas de calidad.
- Recomendación de uso: thinking activado para preguntas y thinking desactivado para generación de código.
- Los hechos de versión están fijados a los tipos @forge/* de junio de 2026; información posterior puede quedar desactualizada.
- Solo soporta inglés según la model card.
- Riesgo de alucinación en identificadores y APIs: la sonda de identificadores post-2026-04 se queda en el 15%, igual que el base, lo que indica que no generaliza a cambios recientes.
- Bucles y no terminación: aunque mejora respecto al base, sigue mostrando hasta un 4% de bucles genuinos y un 18% de no terminación en algunos tramos de muestreo.
- Restricciones de plataforma: checkpoint MLX, no ejecutable directamente en GPUs NVIDIA sin conversión; el ecosistema de herramientas es limitado (Rapid-MLX, LM Studio, mlx-lm).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado para confirmar compatibilidad.
- El modelo no ha superado el umbral de publicación en su segunda ronda de entrenamiento, lo que sugiere que el presupuesto de cómputo limita su techo de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mihai-LeanZero/Qwen3.5-9B-Atlassian-Q6-mlx
- Página del autor con el informe completo: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migración Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi (app de escritorio): https://leanzero.net/portfolio/elzi
- Motor Rapid-MLX (wheel): https://downloads.leanzero.net/engine/leanzero_engine-0.14.3%2Blz.29-py3-none-any.whl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
