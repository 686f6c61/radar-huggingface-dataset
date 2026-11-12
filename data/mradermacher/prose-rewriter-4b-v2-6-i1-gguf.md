# mradermacher/prose-rewriter-4b-v2.6-i1-GGUF

## Resumen

`mradermacher/prose-rewriter-4b-v2.6-i1-GGUF` es un conjunto de cuantizaciones GGUF, generadas con imatrix, del modelo base `chartreuse-verte/prose-rewriter-4b-v2.6`, un modelo especializado en reescritura de prosa, transferencia de estilo y eliminación de texto generado de forma artificial (tarea etiquetada como "deslop"). Lo publica mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp, y está pensado para su uso en inferencia local y en entornos con recursos limitados.

El modelo base apunta a una familia Qwen3 por la etiqueta `qwen3` de la model card, y su nombre comercial sugiere 4.000 millones de parámetros, aunque el dato real reportado en safetensors es de 1.920.204 parámetros, una discrepancia notable que conviene verificar antes de dimensionar el despliegue. El repositorio cuantizado tiene un tamaño de 0,0 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica una publicación muy reciente y sin validación comunitaria.

Su relevancia es acotada pero específica: cubre una necesidad concreta —reescribir texto para que suene más natural, con estilo controlado y sin marcas de generación automática— en un formato que se puede ejecutar con llama.cpp u Ollama en hardware de consumo. La licencia AGPL-3.0 es un factor determinante para cualquier uso en productos de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3` sugiere familia Qwen3, sin confirmar) |
| Parametros totales | 1.920.204 (dato real de safetensors); el nombre indica "4b", discrepancia sin resolver |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido; existen quants estáticos en el repo hermano `prose-rewriter-4b-v2.6-GGUF`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La etiqueta `qwen3` sugiere que deriva de la familia Qwen3 de Alibaba, lo que implicaría un transformer decoder-only con atención causal, pero no hay confirmación explícita ni detalles sobre número de capas, dimensión oculta, cabezas de atención o mecanismos de atención (GQA, atención lineal, etc.). Tampoco se documenta si emplea mezcla de expertos.

Respecto al entrenamiento, la model card no incluye información sobre volumen de tokens, composición del dataset, fases de ajuste supervisado, RLHF o DPO. Las etiquetas (`prose`, `rewriting`, `style-transfer`, `creative-writing`, `deslop`) indican que el ajuste se orientó a tareas de reescritura y control de estilo, pero no se aportan métricas ni detalles del proceso. El repositorio cuantizado en sí no aporta información arquitectónica adicional: solo documenta el proceso de cuantización con imatrix, que genera ficheros GGUF de distintos tamaños y calidades para su uso con llama.cpp.

## Capacidades

- Reescritura de prosa: transformación de texto existente en una versión con estilo o registro diferente.
- Transferencia de estilo: adaptación del tono, la voz o el registro de un texto de entrada.
- Escritura creativa: generación y reelaboración de textos narrativos o literarios.
- "Deslop": eliminación de marcas típicas de texto generado por IA (frases formulaicas, estructuras repetitivas, conectores vacíos).
- Generación de texto en inglés: el modelo está etiquetado únicamente para `en`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Edición de manuscritos y textos literarios: reescritura de pasajes para ajustar tono o registro manteniendo el contenido, aprovechando la especialización en transferencia de estilo.
- Humanización de borradores generados por IA: pasar textos producidos por otros modelos por este reescritor para reducir patrones repetitivos y marcas de generación automática antes de publicarlos.
- Adaptación de contenido editorial a distintas voces de marca: reescribir artículos o notas de prensa para alinearlos con un estilo corporativo concreto.
- Preprocesado en pipelines de publicación: integración como paso de post-proceso en flujos que generan texto con LLM y necesitan una capa de naturalización antes de la revisión humana.
- Prototipado local de herramientas de escritura: despliegue en llama.cpp u Ollama en un portátil para experimentar con reescritura sin depender de APIs externas.
- Filtrado y limpieza de corpus: reescritura de textos de un dataset para homogeneizar estilo o eliminar artefactos antes de usarlos en otros entrenamientos.
- Asistencia a correctores y editores: generación de variantes de un párrafo para que un humano elija la mejor versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, porque el recuento real de parámetros (1,92 M según safetensors) no concuerda con el nombre "4b". Si el modelo tuviera realmente 4.000 millones de parámetros, las cuantizaciones Q4_K_M ocuparían aproximadamente 2,5 GB y las Q8 alrededor de 4,3 GB; si el recuento de safetensors fuera correcto, el modelo sería trivialmente pequeño.
- GPU recomendadas: no disponible. Con un modelo de 4B en Q4_K_M, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB serían suficientes; con el dato real de safetensors, cualquier GPU consumer serviría.
- Cabe en GPU de consumo: probablemente sí en cualquier GPU con 6-8 GB o más, asumiendo el escenario de 4B; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repo incluye un fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-4b-v2.6 (este, cuantizado) | 4B nominal / 1,92 M real (discrepancia) | no disponible | Reescritura y estilo | AGPL-3.0 | GGUF en HF |
| Modelos Qwen3 base (familia) | 0,6B a 235B | hasta 128K en algunas variantes | Propósito general | Apache-2.0 en la mayoría | Múltiples formatos |
| Modelos de reescritura comerciales (p. ej. APIs de edición) | no aplica | variable | Reescritura | propietaria | API |

No se dispone de datos de rendimiento comparativo ni de alternativas open source directamente equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica en el recuento de parámetros: el nombre indica "4b" pero safetensors reporta 1.920.204 parámetros. Verificar el tamaño real antes de planificar hardware o evaluar calidad.
- Solo inglés: no se documenta soporte de castellano ni de otros idiomas.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad en reescritura, estilo o deslop.
- Cero descargas y cero likes en el momento de la consulta: sin validación de la comunidad.
- Licencia AGPL-3.0: obliga a liberar el código fuente de modificaciones y de servicios en red que usen el modelo; puede ser incompatible con productos comerciales cerrados.
- Riesgo de alucinación y de deriva semántica: en tareas de reescritura, el modelo puede alterar el contenido original al priorizar el estilo; requiere revisión humana en contextos sensibles.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez.
- Sin información sobre contexto máximo: limita el diseño de pipelines con documentos largos.
- Publicación muy reciente (noviembre de 2026) y de un único autor de cuantizaciones: sin garantías de mantenimiento.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/prose-rewriter-4b-v2.6-i1-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.6
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/prose-rewriter-4b-v2.6-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#prose-rewriter-4b-v2.6-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
