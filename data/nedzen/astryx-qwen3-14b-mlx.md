# nedzen/astryx-qwen3-14b-mlx

## Resumen

astryx-qwen3-14b-mlx es un ajuste fino (fine-tune) del modelo Qwen3-14B, desarrollado por el usuario nedzen, especializado en responder preguntas sobre el sistema de diseño Astryx y su librería de componentes `@astryxdesign/core`. El modelo no pretende competir en capacidades generales: su objetivo es acertar en decisiones de selección de componentes, reglas de uso DO/DON'T, nombres y tipos de props reales, e imports correctos, un terreno donde los modelos generalistas tienden a inventar APIs plausibles pero inexistentes.

Técnicamente, parte de la versión cuantizada a 4 bits de Qwen3-14B publicada por mlx-community y aplica un LoRA (rank 8, alpha 20) entrenado durante 600 iteraciones con MLX sobre 985 ejemplos de QA derivados de la documentación de componentes de Astryx (licencia MIT). El resultado se fusiona de forma no uniforme: las 112 proyecciones adaptadas se requantizan a 8 bits mientras el resto de la red permanece en 4 bits (grupo 64), porque una fusión uniforme a 4 bits borraría los deltas del LoRA al quedar por debajo del paso de cuantización.

El modelo suma 14 768 307 200 parámetros, ocupa unos 10 GB en el layout de MLX y está pensado para ejecutarse en local sobre Apple Silicon con `mlx_lm` u oMLX. Es relevante por dos motivos: demuestra una técnica de fusión de LoRA sobre pesos ya cuantizados que preserva el ajuste, y sirve como caso de estudio de un fine-tune de dominio muy estrecho y verificable con un evaluador mecánico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-14B), con adaptadores LoRA fusionados en 112 proyecciones |
| Parametros totales | 14 768 307 200 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento se realizo con seq len 4096 |
| Tipos de cuantizacion | Mixta: 4 bits (grupo 64) en la mayor parte de la red y 8 bits en las 112 proyecciones adaptadas por el LoRA. No se distribuyen otras variantes |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en layout MLX (libreria `mlx`). No se publica GGUF ni safetensors de transformers |
| Tamano del repositorio | 11,0 GB (aproximadamente 10 GB de pesos) |
| Modelo base | Qwen/Qwen3-14B (Apache-2.0) |
| Origen del ajuste | LoRA rank 8, alpha 20, 600 iteraciones, LR 1e-5, batch size 1, seq len 4096, semilla 42 |
| Datos de entrenamiento | 985 ejemplos de QA de componentes (1286 ejemplos ChatML en total, progresion en tres etapas) |
| Modo thinking | Desactivado; no hay trazas de razonamiento en entrenamiento ni en inferencia |
| Fecha de publicacion | 17 de septiembre de 2026 (0 descargas, 0 likes en el momento de la consulta) |

## Arquitectura y entrenamiento

La base es Qwen3-14B, un transformer decoder-only denso de 14,77 mil millones de parámetros. El fine-tune no modifica la topología: se entrena un LoRA de rango 8 y alpha 20 sobre las proyecciones de atención y MLP (112 proyecciones en total) durante 600 iteraciones con learning rate 1e-5, batch size 1 y longitud de secuencia 4096, usando el framework MLX sobre Apple Silicon. El dataset son 1286 ejemplos en formato ChatML organizados en una progresión de tres etapas: diferenciación entre componentes, anatomía y props, y accesibilidad. La partición entre entrenamiento y validación se hizo a nivel de componente, de modo que los componentes de la muestra de validación (301 ejemplos) no aparecen en entrenamiento.

La innovación técnica destacable está en la fusión. El autor pliega los deltas del LoRA sobre los pesos del modelo base, que ya estaba cuantizado a 4 bits. Una fusión uniforme a 4 bits elimina silenciosamente cualquier delta inferior al paso de cuantización, así que las 112 proyecciones adaptadas se requantizan a 8 bits mientras el resto se mantiene a 4 bits (grupo 64). El resultado son aproximadamente 10 GB de pesos en layout MLX. La validación muestra una pérdida que baja de 3,519 a 1,117 de forma monótona, sin señal de sobreajuste. No se aplicaron etapas de RLHF ni DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en inglés orientada a preguntas y respuestas sobre el sistema de diseño Astryx.
- Selección de componentes: recomienda qué componente usar en un escenario dado (por ejemplo, Toast o Banner para un error de formulario).
- Conocimiento de reglas de uso DO/DON'T documentadas por Astryx, incluyendo patrones que el modelo base tiende a contradecir.
- Referencia a props y tipos de componentes, con deriva conocida en los nombres exactos (ver limitaciones).
- Generación de ejemplos de código con imports desde `@astryxdesign/core`.
- Razonamiento sobre accesibilidad de componentes, cubierto en la tercera etapa del dataset de entrenamiento.
- Respuestas sobre anatomía de componentes (estructura interna y partes que los componen).
- No hay evidencia documentada de soporte de tool calling, function calling, uso de agentes, capacidades multimodales, visión, audio ni modo thinking en este fine-tune. El modo thinking aparece explícitamente desactivado en los ejemplos de uso.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para inglés y el dataset de ajuste está en inglés.

## Casos de uso

- Asistente de documentación interno: desplegado con `mlx_lm` en un portátil Apple Silicon, responde dudas del equipo sobre qué componente de Astryx usar en cada pantalla sin enviar código ni diseños a servicios externos.
- Apoyo a revisión de código en frontend: dado un fragmento de JSX que importa `@astryxdesign/core`, el modelo señala si el componente elegido respeta las reglas DO/DON'T documentadas, con la advertencia de verificar los nombres de props contra la documentación oficial.
- Onboarding de nuevos desarrolladores: sirve como tutor conversacional que explica la anatomía de cada componente y por qué existe, reduciendo la dependencia de personas senior para preguntas repetitivas.
- Generación de esqueletos de código con imports correctos: produce ejemplos mínimos con `import ... from "@astryxdesign/core"` que después se revisan y completan manualmente, útiles como punto de partida en prototipos.
- Evaluación de consistencia de diseño en maquetas: el equipo puede pedir al modelo que razone sobre un flujo descrito en texto y detecte decisiones contrarias a las guías antes de implementar.
- Investigación de técnicas de fine-tune: sirve como referencia reproducible para estudiar la fusión de LoRA sobre pesos cuantizados y comparar contra una fusión uniforme a 4 bits.
- Prototipado de asistentes de dominio estrecho: es un ejemplo de cómo un LoRA de 600 iteraciones sobre menos de 1300 ejemplos mejora métricas mecánicas concretas frente al modelo base, útil para calibrar expectativas en proyectos similares.
- Filtrado previo en pipelines de documentación: puede clasificar y priorizar preguntas frecuentes sobre componentes antes de que lleguen a un equipo humano, siempre con verificación posterior.

## Benchmarks y rendimiento

El autor publica una evaluación mecánica sobre 20 preguntas de diseño reservadas, con un script que extrae componentes y props nombrados y los contrasta contra el manifiesto oficial. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Modelo | PASS / PARTIAL / FAIL | Respuestas que inventan props |
|---|---|---|
| Qwen3-14B-4bit (base) | 3 / 8 / 9 | 6/20 |
| astryx-qwen3-14b-mlx | 7 / 8 / 5 | 4/20 |

Además, la validación durante el entrenamiento sobre la muestra reservada de 301 ejemplos registra una pérdida que desciende de 3,519 a 1,117 de forma monótona, sin sobreajuste apreciable. No se han publicado datos de latencia ni throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 10 GB de pesos más la caché KV y activaciones; se recomienda un mínimo de 16 GB de memoria unificada y 24-32 GB para trabajar con comodidad.
- Al ser un modelo en layout MLX, la ejecución nativa requiere Apple Silicon (series M1, M2, M3, M4). No hay ruta directa a CUDA sin convertir los pesos.
- GPU recomendadas para una conversión a otro runtime: no disponible; el autor no documenta despliegue en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo solo tras una conversión de formato y requantización, no con los pesos MLX publicados.
- Opciones de despliegue documentadas: `mlx_lm` (carga y generación vía Python o CLI) y oMLX.
- vLLM, llama.cpp, Ollama y TGI no están soportados de forma directa con el artefacto publicado; requerirían convertir los pesos a GGUF o safetensors de transformers, operación no documentada por el autor.
- Latencia y throughput: no disponible.
- El repositorio ocupa 11,0 GB, por lo que la descarga y el almacenamiento local deben tenerse en cuenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en el grader del autor |
|---|---|---|---|---|---|
| astryx-qwen3-14b-mlx | 14,77 B | No disponible | Apache-2.0 | safetensors MLX, 4/8 bits mixto | 7 PASS / 8 PARTIAL / 5 FAIL; 4/20 props inventadas |
| mlx-community/Qwen3-14B-4bit | 14,77 B | No disponible | Apache-2.0 | safetensors MLX, 4 bits | 3 PASS / 8 PARTIAL / 9 FAIL; 6/20 props inventadas |
| Qwen/Qwen3-14B | 14,77 B | No disponible | Apache-2.0 | safetensors (transformers) | No evaluado en el grader del autor en la informacion proporcionada |

No se dispone de comparación con otros fine-tunes de sistemas de diseño de tamaño similar, ni con alternativas especializadas en la misma tarea.

## Limitaciones y advertencias

- Deriva en nombres de props: el propio autor documenta que el modelo cita props plausibles pero inexistentes, como `variant` en lugar de `type`. Cualquier salida debe verificarse contra la documentación oficial de Astryx antes de usarse.
- Tasa de invención medible: en la evaluación publicada, 4 de 20 respuestas incluían props inventadas, frente a 6 de 20 del modelo base.
- Riesgo de alucinación en APIs: aunque la selección de componentes mejora respecto al base, el modelo sigue produciendo código que puede no compilar si se copia sin revisión.
- Dominio extremadamente estrecho: fuera de preguntas sobre el sistema de diseño Astryx, el comportamiento esperado no está caracterizado y puede degradarse respecto al Qwen3-14B original.
- Idioma: etiquetado únicamente para inglés. No hay evidencia de calidad en castellano ni en otros idiomas, a pesar de que el modelo base es multilingüe.
- Fuente del conocimiento: los datos de entrenamiento provienen de documentación de componentes con licencia MIT de Meta Platforms, Inc. El modelo tiene una cobertura temporal limitada a esa documentación y no se actualiza automáticamente.
- Licencia: Apache-2.0 permite uso comercial del modelo, pero el autor declara explícitamente que no es un lanzamiento oficial de Meta/Astryx ni del equipo Qwen, por lo que no hay soporte ni garantías asociados.
- Portabilidad limitada: al distribuirse solo en formato MLX, no se puede desplegar en infraestructura CUDA sin una conversión previa que podría alterar la calidad de la fusión no uniforme.
- Modo thinking desactivado: los ejemplos de uso recomiendan `enable_thinking: false`, y no hay trazas de razonamiento en el entrenamiento, por lo que no cabe esperar mejoras de razonamiento extendido.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Las búsquedas web realizadas no han devuelto ninguna fuente relacionada con el modelo; los resultados obtenidos corresponden a contenido farmacológico sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nedzen/astryx-qwen3-14b-mlx
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Origen de la cuantizacion base: https://huggingface.co/mlx-community/Qwen3-14B-4bit
- Repositorio de Astryx (documentacion con licencia MIT, Meta Platforms): https://github.com/facebook/astryx
- Papers, blogs o demos adicionales: no disponible; las busquedas web no devolvieron resultados relevantes.
