# scottlowry/Qwen3.6-35B-A3B-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-mtp es una cuantización comunitaria de un modelo Qwen de arquitectura MoE (mezcla de expertos), publicada por el usuario scottlowry en HuggingFace. El identificador y el campo `model type` de la model card (`qwen3_5_moe`) indican que se trata de una versión derivada de la familia Qwen3.5 con 35.951.822.704 parámetros totales y la nomenclatura A3B, que en la convención de Qwen designa aproximadamente 3.000 millones de parámetros activos por token. El sufijo `mtp` apunta a la presencia del módulo de multi-token prediction, aunque la model card no lo confirma explícitamente.

El modelo se distribuye ya cuantizado a 4 bits con tamaño de grupo 64, empleando la herramienta oQ de oMLX (v0.7.1.dev1) para cuantización de precisión mixta. El objetivo es claro: reducir un modelo MoE de ~36.000 millones de parámetros hasta unos 21,6 GB de pesos en formato safetensors para MLX, de modo que pueda ejecutarse en equipos Apple Silicon con memoria unificada moderada en lugar de requerir GPUs de centro de datos.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo práctico del ecosistema de cuantización para MLX, cada vez más usado para inferencia local en Mac. Por otro, conviene subrayar que el repositorio no incluye licencia declarada, idiomas soportados, pipeline ni model card detallada, y que en el momento de la consulta acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (campo `model type`: `qwen3_5_moe`); incluye módulo MTP según el nombre del repositorio, no confirmado en la model card |
| Parametros totales | 35.951.822.704 (dato real de los safetensors) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (4-bit), group size 64, precisión mixta vía oQ / oMLX v0.7.1.dev1 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`library_name: mlx`), repo de 21,6 GB |

## Arquitectura y entrenamiento

La información disponible describe únicamente el proceso de cuantización, no el entrenamiento. Sabemos que el modelo base es un transformer con capas de mezcla de expertos, etiquetado como `qwen3_5_moe`, con 35.951.822.704 parámetros totales. La nomenclatura A3B es la convención que Qwen utiliza para indicar el número de parámetros activos por token (en este caso, del orden de 3.000 millones), de modo que durante la inferencia solo se activa una fracción reducida del total de expertos. No hay datos en la información proporcionada sobre número de tokens de entrenamiento, composición del dataset, número de expertos, expertos activos por token, ni sobre etapas de ajuste como SFT, RLHF o DPO.

La única innovación documentada en este repositorio es la propia cuantización: se ha aplicado oQ (oMLX v0.7.1.dev1), una técnica de cuantización de precisión mixta, con 4 bits de precisión y tamaño de grupo 64. La precisión mixta implica que distintas capas o módulos pueden recibir un tratamiento de bits distinto según su sensibilidad, algo habitual para preservar la calidad en capas críticas (atención, expertos con más tráfico) mientras se comprime con más agresividad el resto. El sufijo `mtp` del nombre sugiere que el módulo de multi-token prediction del modelo base se ha conservado en la conversión, pero la model card no lo detalla ni especifica cómo se comporta tras la cuantización.

## Capacidades

- Generación de texto y razonamiento general: capacidades heredadas del modelo base Qwen, no verificadas de forma independiente en este repositorio.
- Generación de código y matemáticas: esperable en la familia Qwen3.5, sin benchmarks publicados en la información disponible.
- Tool calling / function calling: no disponible; la model card no menciona plantilla de chat ni soporte de herramientas.
- Agentes y razonamiento multi-paso: no disponible; no hay confirmación de modo thinking ni de plantillas de agente.
- Capacidades multilingües: no disponible; el campo de idiomas no está declarado.
- Capacidades especiales: presencia probable de multi-token prediction (sufijo `mtp`), no confirmada. No hay indicios de visión ni audio.
- Ejecución local en Apple Silicon: capacidad efectiva del artefacto, al estar en formato MLX.

## Casos de uso

- Asistencia de programación local en Mac: el modelo puede cargarse con MLX sobre memoria unificada y usarse desde editores o terminales para autocompletado, refactorización y explicación de código, sin enviar el código fuente a ningún servicio externo.
- Procesamiento de documentación confidencial: al ejecutarse íntegramente en local, es adecuado para resumir contratos, informes médicos o documentación interna sujeta a cumplimiento normativo, donde no es viable usar APIs de terceros.
- Prototipado de agentes con razonamiento multi-paso: con 3.000 millones de parámetros activos por token, la latencia por token es menor que la de un denso de 36B, lo que favorece bucles de agente con muchas llamadas cortas. Requiere validar antes la plantilla de tool calling, no documentada.
- Generación aumentada por recuperación (RAG) sobre corpus locales: combinado con una base vectorial en el mismo equipo, permite consultar manuales técnicos o bases de conocimiento internas. La longitud de contexto no está declarada, por lo que debe medirse antes de dimensionar los fragmentos.
- Evaluación comparativa de cuantizaciones: este repositorio sirve como punto de partida para medir la pérdida de calidad de una cuantización oQ a 4 bits frente al modelo base en bf16 o frente a otras cuantizaciones de la misma familia.
- Investigación sobre cuantización de precisión mixta en MoE: permite estudiar cómo se comportan los expertos poco activados cuando se comprimen a 4 bits con group size 64, y si el módulo MTP sobrevive al proceso.
- Despliegue en entornos sin conectividad: escenarios de campo, laboratorios aislados o redes air-gapped donde se necesita generación de texto con un modelo de tamaño medio-alto sin acceso a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta los parámetros de cuantización (4 bits, group size 64, formato MLX safetensors) y no incluye mediciones de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos: 21,6 GB en disco para el repositorio completo. Es el mínimo de memoria que debe poder reservar el runtime, antes de contar caché KV y buffers de activaciones.
- VRAM o memoria unificada estimada: en torno a 24-28 GB para inferencia con contexto moderado, sumando pesos (21,6 GB) más caché KV y overhead del runtime MLX. Para contextos largos la cifra crece de forma proporcional al número de capas y cabezas KV, dato no disponible.
- Apple Silicon recomendado: equipos con memoria unificada de 32 GB o superior (familias M Max y M Ultra). Un equipo de 36 GB deja margen justo; 64 GB o más permite contextos amplios y otras aplicaciones en paralelo.
- GPU NVIDIA: el formato es MLX, así que no se ejecuta directamente en CUDA. Si se reconvirtiera a otro formato, una RTX 4090 de 24 GB quedaría al límite (los pesos solos ocupan 21,6 GB) y una A100 de 40 GB o 80 GB sería el objetivo razonable.
- Opciones de despliegue: MLX mediante mlx-lm y el ecosistema oMLX; el formato safetensors MLX es directamente consumible por herramientas basadas en MLX. No se incluye versión GGUF ni soporte declarado para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponible. La ventaja teórica del enrutado MoE (unos 3.000 millones de parámetros activos por token) se traduce en velocidades muy superiores a las de un modelo denso de 36B, pero no hay cifras publicadas para esta cuantización concreta.

## Comparativa con modelos similares

Los datos de los modelos comparativos no forman parte de la información proporcionada para esta ficha; se incluyen como referencia de categoría y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ4e-mtp | 35,95B | no disponible (~3B por nomenclatura) | no disponible | MLX safetensors 4-bit | no disponible |
| Modelo base Qwen3.5-35B-A3B en bf16 | 35,95B (mismo checkpoint de origen) | no disponible | no disponible | safetensors bf16 | no disponible |
| Otras cuantizaciones MLX 4-bit del mismo modelo | 35,95B | no disponible | no disponible | MLX safetensors | no disponible |
| Qwen3-30B-A3B (generación anterior) | ~30,5B | ~3,3B | 128K | safetensors, GGUF | Apache 2.0 |

La comparación más relevante es contra el modelo base sin cuantizar: este repositorio ofrece la misma arquitectura con una huella de memoria muy inferior (21,6 GB frente a los aproximadamente 72 GB que ocuparían los pesos en bf16), a cambio de una pérdida de precisión numérica que no se ha cuantificado públicamente.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones de terceros ni reportes de uso.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. La licencia efectiva dependerá del modelo base de Qwen, que debe consultarse en su repositorio original.
- Idiomas y contexto sin especificar: no se puede planificar un despliegue multilingüe ni dimensionar aplicaciones de contexto largo sin medirlo previamente.
- Riesgo de degradación por cuantización: la compresión a 4 bits puede afectar de forma desigual a los expertos menos representados y a tareas de razonamiento matemático o de código. No hay datos de divergencia respecto al modelo base.
- Módulo MTP no verificado: si el módulo de multi-token prediction se ha cuantizado, su comportamiento puede diferir del de la versión original; conviene desactivarlo o validarlo por separado.
- Formato limitado a MLX: no se distribuye GGUF ni pesos para CUDA, lo que restringe el despliegue a Apple Silicon o a una reconversión manual con la consiguiente pérdida adicional de precisión.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; sin benchmarks ni evaluaciones de fidelidad no es posible acotarlo.
- Sesgos: no disponible; no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Para producción: tratar este repositorio como un artefacto experimental. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el dominio objetivo y de la verificación de la licencia del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de búsqueda web disponibles; los resultados devueltos no guardan relación con el modelo.
