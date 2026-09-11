# CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B-GGUF

## Resumen

CobrIX-1.5-preview-Coder-Flash-33B-A13B-GGUF es la versión cuantizada en formato GGUF del modelo CobrIX-1.5-preview-Coder-Flash-33B-A13B, publicado por el proyecto CobrIX. Se trata de un decoder de arquitectura MoE (mixture of experts) con aproximadamente 33.113 millones de parámetros totales y unos 13.000 millones de parámetros activos por token, según los propios datos de la model card y los pesos en safetensors. El modelo está orientado a generación de código y a tareas de ciberseguridad, y ha sido alineado mediante DPO y reforzado con SFT específicamente para esos dominios en inglés y portugués.

La relevancia de esta publicación es doble. Por un lado, traslada un modelo MoE de ~33B a pesos GGUF listos para usar con llama.cpp y Ollama, con dos niveles de cuantización (Q4_K_M y Q5_K_M) que caben en GPU de consumo con 24 GB de VRAM. Por otro, se trata explícitamente de una versión preview: la propia model card indica que la release final llegará después del think-SFT, del soporte nativo de MTP (multi-token prediction) y de cuantizaciones actualizadas, por lo que debe considerarse material de evaluación y no un artefacto estable de producción.

El repositorio tiene un tamaño de 43,9 GB y no registra descargas ni interacciones en el momento de redactar esta ficha. La licencia es MIT, tanto en el modelo base como en esta cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE); etiquetado como "qwen3-5" en los tags del repositorio |
| Parametros totales | 33.113.780.736 (~33B) |
| Parametros activos | ~13B por token (dato declarado por el autor) |
| Longitud de contexto | no disponible (el Modelfile de ejemplo de Ollama configura `num_ctx 8192`) |
| Tipos de cuantizacion | GGUF Q5_K_M (22,0 GB) y Q4_K_M (18,9 GB) |
| Idiomas soportados | inglés (en) y portugués (pt) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Plantilla de chat | ChatML embebida (`<|im_start|>` / `<|im_end|>`), parada en `<|im_end|>` |
| Modelo base | CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B |
| Estado de la release | preview 1.5 (cuantizaciones para pruebas) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer con capas de mezcla de expertos: de los ~33,1B parámetros totales, solo ~13B se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. Los tags del repositorio incluyen `mixture-of-experts` y `qwen3-5`, lo que sugiere una base de la familia Qwen, aunque la model card no detalla la configuración exacta de expertos, el número de capas ni la dimensión oculta. Tampoco se especifica la ventana de contexto nativa del modelo base.

En cuanto al entrenamiento, la información disponible es escasa y procede exclusivamente de la model card: el modelo ha sido alineado con DPO y reforzado con SFT para código y ciberseguridad, con foco en portugués e inglés. No se indica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases RLHF adicionales ni innovaciones de decodificación. La model card menciona que la release final incorporará think-SFT (entrenamiento con modo de razonamiento explícito) y MTP nativo (multi-token prediction), lo que confirma que el modelo actual carece de ambas capacidades.

## Capacidades

- Generación de texto conversacional en inglés y portugués, con plantilla ChatML.
- Generación y asistencia en código, dominio para el que fue reforzado mediante SFT y DPO.
- Tareas de ciberseguridad: el propio autor plantea ejemplos como explicar una inyección SQL y sus mitigaciones.
- Razonamiento multi-turno dentro de la ventana configurada.
- Capacidad de razonamiento explícito ("thinking mode"): no disponible en esta preview; el autor indica que llegará con el think-SFT de la release final.
- Multi-token prediction (MTP) nativo: no disponible en esta preview.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión o audio: no disponibles.
- Multilingüismo: limitado a en y pt según los metadatos; no hay datos sobre rendimiento en otros idiomas.

## Casos de uso

- Asistente de revisión de código en portugués: el modelo puede recibir un diff o un fichero completo y comentar problemas de estilo, seguridad y corrección, aprovechando que el portugués es uno de los dos idiomas de entrenamiento declarados y que dispone de plantilla ChatML para integrarse en un chat de revisión.
- Formación en ciberseguridad para equipos lusófonos: con el Modelfile de Ollama incluido en la model card, se puede desplegar un asistente local que explique vulnerabilidades (por ejemplo, inyección SQL), vectores de ataque y contramedidas sin enviar datos a la nube.
- Análisis estático asistido por LLM en pipelines internos: al ser un MoE de ~13B activos con cuantización Q4_K_M de 18,9 GB, puede ejecutarse en una única GPU de 24 GB y encadenarse en un job que comente hallazgos de linters o SAST.
- Generación de scripts de automatización y utilidades de línea de comandos: el modelo puede producir snippets de shell, Python o SQL a partir de una descripción, con parada controlada en `<|im_end|>` para integraciones programáticas vía llama.cpp.
- Chat de soporte técnico interno en inglés y portugués: el contexto configurable de 8192 tokens permite mantener conversaciones multi-turno con historial de incidencias e instrucciones de sistema, siempre que las conversaciones no exijan ventanas mucho mayores.
- Evaluación comparativa de cuantizaciones: Q4_K_M frente a Q5_K_M permite medir la pérdida de calidad por cuantización en tareas de código antes de comprometerse con un despliegue, dado que el autor declara que Q5_K_M ofrece la mejor calidad y Q4_K_M una pérdida mínima.
- Investigación sobre alineación DPO en dominios técnicos: al estar etiquetado explícitamente como DPO + SFT para código y ciberseguridad, sirve como punto de comparación frente a otros ajustes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM/RAM estimada según el autor: ~24 GB para Q5_K_M (fichero de 22,0 GB) y ~20 GB para Q4_K_M (fichero de 18,9 GB).
- GPU de consumo: ambas cuantizaciones entran en tarjetas de 24 GB, como RTX 3090 o RTX 4090, siempre que el modelo se cargue completo en VRAM; al ser un MoE con ~13B activos, el cómputo por token es inferior al de un denso de 33B.
- Configuraciones de 16 GB de VRAM: no permiten cargar el modelo completo sin offload parcial a RAM, lo que degrada la velocidad de forma notable.
- GPU de datacenter (A100 40/80 GB, H100): sobradas para estas cuantizaciones, con margen para lotes concurrentes o contexto más largo.
- Despliegue: llama.cpp (`llama-cli`, con `--jinja`) y Ollama están documentados en la model card mediante Modelfile y comandos de ejemplo. No se mencionan vLLM, TGI ni otros servidores.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CobrIX-1.5-preview-Coder-Flash-33B-A13B (GGUF) | ~33B totales / ~13B activos | no disponible (ejemplo con 8192) | sin benchmarks publicados | MIT | GGUF en HuggingFace |
| CobrIX-1.5-preview-Coder-Flash-33B-A13B (base) | ~33B totales / ~13B activos | no disponible | sin benchmarks publicados | MIT | safetensors en HuggingFace |
| Alternativas de terceros de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos verificables sobre modelos alternativos, por lo que no es posible establecer una comparación cuantitativa con otras propuestas de la misma categoría.

## Limitaciones y advertencias

- Es una versión preview: el autor advierte que la release final llegará tras el think-SFT, el MTP nativo y cuantizaciones actualizadas. No es un artefacto estable para producción.
- No hay benchmarks publicados que respalden las capacidades declaradas de código y ciberseguridad.
- Cobertura lingüística limitada a inglés y portugués; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La longitud de contexto nativa no está documentada; el único valor explícito es `num_ctx 8192` en el Modelfile de ejemplo, que puede no reflejar el máximo soportado ni la calidad real en ventanas largas.
- El modelo está ajustado específicamente para código y ciberseguridad, lo que puede traducirse en un comportamiento subóptimo o desequilibrado en tareas generales de conocimiento o conversación abierta.
- Riesgo de alucinación inherente a los modelos generativos, agravado en un dominio como la ciberseguridad, donde una recomendación incorrecta puede tener consecuencias operativas.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, idioma, cultura o dominio.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero al derivar de un modelo base cuya procedencia exacta (familia "qwen3-5") no está detallada en la información proporcionada, conviene verificar la cadena de licencias del modelo base antes de un despliegue comercial.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-09-11) es posterior a la de la mayoría de referencias disponibles; la adopción y el soporte comunitario son, por tanto, inexistentes o no verificables.
- Al no documentarse soporte de tool calling, no debe asumirse su disponibilidad para pipelines de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B-GGUF
- Modelo base: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B
- Contacto del autor indicado en la model card: suporte.cobrix@gmail.com
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
