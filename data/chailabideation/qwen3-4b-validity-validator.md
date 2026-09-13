# chailabideation/qwen3-4b-validity-validator

## Resumen

`chailabideation/qwen3-4b-validity-validator` es un adaptador LoRA de PEFT publicado por el usuario `chailabideation` sobre el modelo base `Qwen/Qwen3-4B`. No es un modelo generativo ni un juez basado en texto libre: se trata de un clasificador de secuencia de dos etiquetas que actúa como guarda de validez en flujos de generación automática de ideas de investigación. El repositorio se corresponde con el adaptador calibrado de la ejecución de entrenamiento AHC-v3, congelado después en la ejecución de RL AHC-v4.

El modelo resuelve dos tareas concretas. La primera, `outcome_presupposition`, estima el riesgo de que una idea de investigación propuesta afirme o implique que sus experimentos o hallazgos ya han ocurrido. La segunda, `literature_repackaging`, mide el riesgo de similitud o reempaquetado respecto a la literatura proporcionada, y se declara explícitamente como diagnóstico. El adaptador incorpora 5 903 360 parámetros entrenables (LoRA de rango 16 sobre `q_proj` y `v_proj`, más la cabeza de clasificación) y se distribuye en formato safetensors.

Su relevancia es de nicho pero clara: cubre una necesidad poco atendida en pipelines de ideación científica asistida por LLM, donde los modelos generativos tienden a redactar propuestas como si los resultados ya estuvieran obtenidos. Al ser un adaptador pequeño sobre un base de 4 000 millones de parámetros con licencia Apache-2.0, es desplegable en hardware modesto. Sin embargo, el repositorio no incluye resultados de evaluación numéricos, no declara idiomas soportados y registra cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptador LoRA y cabeza de clasificación de secuencia de dos etiquetas |
| Parametros totales | 5 903 360 parámetros entrenables en el adaptador; el modelo base Qwen3-4B tiene aproximadamente 4 000 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-4B declara 32 768 tokens nativos (ampliable a 131 072 con YaRN según su documentación oficial) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y puede fusionarse con el base y cuantizarse a GGUF, AWQ o GPTQ por cuenta del usuario |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con `adapter_config.json` de PEFT; incluye tokenizer congelado y `chat_template.jinja` |

Datos adicionales de identidad del checkpoint publicados por el autor:

| Parametro | Valor |
|---|---|
| Snapshot del modelo base | `1cfa9a7208912126459214e8b04321603b3df60c` |
| Configuracion LoRA | rango 16, alpha 32, dropout 0.05, modulos `q_proj` y `v_proj` |
| SHA-256 del adaptador | `f04a4348ffa1ddbd4b24e827e67157e8a6389435b66dc3d4b3b81a5ce5a7271f` |
| SHA-256 de la calibracion | `9a13afb98303303282d3ce039bb6cb423679c213b1fc446c45941e582dd43697` |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso Qwen3-4B al que se le añade un adaptador LoRA de rango 16 con alpha 32 y dropout 0.05 aplicado a las proyecciones `q_proj` y `v_proj`, junto con una cabeza de clasificación guardada en el mismo fichero de safetensors. El resultado es un clasificador de dos etiquetas (`outcome_presupposition` y `literature_repackaging`), no un modelo que genere texto. El adaptador procede de la ejecución de entrenamiento AHC-v3 y quedó congelado durante la ejecución de RL AHC-v4, según indica la model card.

El autor documenta un paso de calibración monótona posterior al entrenamiento, almacenado en `calibration.json`, que debe aplicarse para reproducir las puntuaciones publicadas. El repositorio incluye `guard_config.json` con el contrato de entrada, la arquitectura, los recuentos de entrenamiento y la época seleccionada, además de `evaluation.json` con resultados de validación controlada y natural, y `release.json` con hashes inmutables. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO más allá de la mención a una ejecución de RL. Tampoco se detalla ningún mecanismo de decodificación especulativa ni de atención alternativa, algo que en cualquier caso sería irrelevante para un clasificador de secuencia.

Un detalle operativo crítico: la model card advierte que cargar el adaptador PEFT directamente y aplicar `sigmoid` no reproduce las puntuaciones publicadas. Es obligatorio usar `guard.scorer.GuardScorer` o `guard.validator.ValidityValidator`, que reconstruyen exactamente la construcción de entrada y aplican la calibración.

## Capacidades

- Clasificación binaria de `outcome_presupposition`: detecta riesgo de que una idea de investigación afirme o presuponga resultados experimentales ya obtenidos.
- Clasificación binaria de `literature_repackaging`: mide similitud o reempaquetado respecto a literatura aportada, con carácter exclusivamente diagnóstico.
- Integración con reglas deterministas duras externas (`guard.rules`), que se combinan con la salida del cabezal de presuposición.
- Puntuación calibrada reproducible mediante `calibration.json` y hashes verificables.
- No genera texto, ni explicaciones, ni razonamiento en lenguaje natural.
- No dispone de tool calling, function calling ni soporte de agentes.
- No se documentan capacidades multilingües, de visión, audio ni modo de pensamiento.
- Al ser un clasificador de secuencia, trabaja sobre una entrada construida según un contrato fijo definido en `guard_config.json`.

## Casos de uso

- Filtrado previo en pipelines de ideación automática: antes de que un LLM generador de propuestas de investigación devuelva una idea al usuario, el adaptador puntúa el riesgo de presuposición de resultados y se descartan o reescriben las candidatas por encima del umbral definido en `guard.rules`.
- Triaje de propuestas en convocatorias de financiación: clasificación automática de borradores para señalar aquellos que redactan resultados en pasado o presente como si ya se hubieran producido, reduciendo el trabajo manual de revisión preliminar.
- Control de calidad en revisiones sistemáticas y de literatura: uso del cabezal `literature_repackaging` como señal diagnóstica para marcar textos sospechosos de reempaquetar fuentes ya suministradas, siempre con revisión humana posterior dado el riesgo de falsos negativos documentado.
- Guarda en agentes que redactan secciones de resultados: integración como paso de validación en un agente multi-paso que escribe apartados de "Resultados" o "Conclusiones", bloqueando la salida cuando el clasificador detecta presuposición.
- Auditoría retrospectiva de corpus: análisis por lotes de un dataset de ideas generadas previamente para cuantificar la tasa de presuposición de resultados y comparar el comportamiento de distintos modelos generadores.
- Componente de recompensa en bucles de RL sobre generación de ideas: el adaptador se entrenó en ese contexto y puede reutilizarse como señal de penalización en políticas que tienden a inventar resultados ya obtenidos.
- Endpoint de clasificación en servicios internos: expuesto mediante el `GuardScorer` sobre GPU de gama media, permite validar propuestas enviadas desde una interfaz web antes de almacenarlas.
- Verificación de conformidad documental: aplicación en corpus de informes técnicos o memorias de proyecto para detectar formulaciones que den por hecho experimentos no ejecutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `evaluation.json` que, según la model card, contiene resultados de validación controlada y natural, pero sus cifras no se han incluido en la información proporcionada y no deben inferirse. La model card sí advierte de un hallazgo cualitativo relevante: las salidas del RL adaptativo expusieron falsos negativos severos en el cabezal `literature_repackaging`.

## Requisitos de hardware

- VRAM estimada para el modelo base en precisión completa: aproximadamente 8 GB para los pesos de Qwen3-4B en bf16/fp16, más 2-4 GB adicionales de caché KV y activaciones según la longitud de entrada.
- VRAM estimada con cuantización de 4 bits del base: del orden de 3 a 4 GB, más el coste de la caché KV.
- Peso del adaptador: 5 903 360 parámetros entrenables equivalen a unos 24 MB en fp32 y unos 12 MB en bf16, un coste despreciable frente al base.
- GPU de consumo compatibles en bf16: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 de 24 GB. En tarjetas de 8 GB conviene cuantizar el base o limitar la longitud de secuencia.
- GPU profesionales: A100 de 40 o 80 GB y H100 son funcionales pero sobredimensionadas para un modelo de 4 000 millones de parámetros; solo se justifican por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: al ser un clasificador con calibración obligatoria, el camino soportado es PyTorch con PEFT a través de `guard.scorer.GuardScorer` o `guard.validator.ValidityValidator`. TGI admite adaptadores LoRA, pero requeriría reproducir la construcción de entrada y la calibración. vLLM y llama.cpp/Ollama no son aplicables tal cual al adaptador sin fusionarlo y sin reimplementar el contrato de entrada, lo que rompería la reproducibilidad de las puntuaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No existe un modelo directamente equivalente en la información disponible: la tarea de validación de presuposición de resultados en ideas de investigación es específica de este adaptador. La comparación siguiente se establece únicamente frente a modelos de guarda o clasificación de propósito general, cuyos datos provienen de documentación pública y no de un benchmark conjunto.

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-validity-validator | 5,9 M entrenables sobre base de 4 000 M | Clasificación binaria de presuposición de resultados y reempaquetado de literatura | no disponible | apache-2.0 | Repositorio de HuggingFace con 0 descargas |
| Llama Guard (familia) | 1 000-8 000 M según variante | Clasificación de seguridad de contenido | no disponible en esta ficha | Licencia comunitaria de Llama | Ampliamente desplegado |
| ShieldGemma | 2 000-9 000 M según variante | Clasificación de seguridad de contenido | no disponible en esta ficha | Licencia de Gemma | Disponible en HuggingFace |
| Qwen3Guard | variantes de 0,6 a 8 000 M | Clasificación de seguridad de contenido | no disponible en esta ficha | apache-2.0 en varias variantes | Disponible en HuggingFace |

Las cifras de benchmarks comparativos entre estos modelos y el adaptador reseñado no están disponibles. La comparación solo puede establecerse en términos de tamaño, licencia y naturaleza de la tarea.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- El cabezal `literature_repackaging` es exclusivamente diagnóstico y el autor advierte de falsos negativos severos observados durante la ejecución de RL adaptativo: una puntuación baja no constituye evidencia de novedad.
- Cargar el adaptador PEFT de forma directa y aplicar `sigmoid` no reproduce las puntuaciones liberadas; es obligatorio usar `GuardScorer` o `ValidityValidator` junto con `calibration.json`.
- No es un juez generativo: no produce explicaciones, justificaciones ni texto, lo que limita su uso en flujos que requieran trazabilidad argumental.
- No se documentan idiomas soportados; se desconoce si la cabeza clasificadora funciona fuera del inglés.
- No se publican datos sobre composición del dataset de entrenamiento, sesgos potenciales ni distribución de etiquetas, lo que impide evaluar riesgos de sesgo sistemático.
- No se detallan los recuentos de entrenamiento ni la época seleccionada en la información disponible, aunque se referencian en `guard_config.json`.
- La licencia Apache-2.0 del adaptador permite uso comercial, pero el modelo base Qwen3-4B se distribuye bajo sus propios términos y conviene verificarlos antes de un despliegue en producción.
- Las puntuaciones deben interpretarse siempre junto a las reglas deterministas de `guard.rules`; el cabezal por sí solo no sustituye a una política de validación completa.
- Las fechas de creación y actualización registradas (2026-09-13) resultan anómalas respecto a la fecha de consulta y conviene verificarlas antes de citar el modelo.
- Las búsquedas web realizadas no devolvieron documentación técnica adicional sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chailabideation/qwen3-4b-validity-validator
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Código fuente y documentación del validador: https://github.com/yfyfyufeng/rl-pipline/tree/validity-validator-release/docs/validity_validator
- Paper, blog o demo adicionales: no disponibles en la información proporcionada. Las búsquedas web realizadas devolvieron únicamente páginas de ayuda de YouTube y contenidos de Zhihu, sin relación con el modelo.
