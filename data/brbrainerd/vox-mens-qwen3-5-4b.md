# brbrainerd/vox-mens-qwen3.5-4b

## Resumen

Vox MENS Qwen3.5-4B es un adaptador de tipo QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3.5-4B. Su propósito declarado es especializar el modelo base en la generación de código para Vox, un lenguaje de programación full-stack y "AI-native" en el que tablas de base de datos, endpoints de backend, componentes de interfaz reactivos y agentes de IA tipados conviven en un único fichero `.vox` verificado por el compilador. El adaptador se distribuye con la librería `vox` y está pensado para integrarse en el flujo de trabajo del playground y del ecosistema Vox MENS.

El dato más relevante para evaluar el modelo es que, según la propia model card, este checkpoint de 4B está marcado como "not trained": existe un registro de la ejecución de entrenamiento, pero los pesos del adaptador no están incluidos en el repositorio. El tamaño del repositorio es de 0.0 GB, lo que confirma que no contiene pesos utilizables. En la práctica, el repositorio funciona como entrada de catálogo dentro de la escalera de tamaños de Vox MENS (2B, 4B, 9B), no como un artefacto listo para descarga e inferencia.

La relevancia del proyecto es acotada: se enmarca en un ecosistema propietario (Vox) con documentación propia, y su utilidad depende de que el adaptador esté efectivamente publicado en otro lugar. Para un desarrollador que busque un modelo de código generalista, el interés está en el modelo base Qwen3.5-4B, no en este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen/Qwen3.5-4B (modelo base de tipo transformer con gated delta networks según los tags) |
| Parametros totales | 4B (corresponden al modelo base; el adaptador no publica pesos) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento se realizó con QLoRA, pero no se detallan las cuantizaciones del adaptador) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño 0.0 GB) |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA sobre el checkpoint Qwen/Qwen3.5-4B, fijado a la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Los tags del repositorio mencionan `gated-delta-networks`, lo que sugiere que el modelo base incorpora mecanismos de atención lineal o híbridos basados en Gated Delta Networks, aunque la model card no aporta detalles sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset de ajuste.

El objetivo de entrenamiento declarado es mejorar las comprobaciones reales del compilador de Vox sobre prompts reservados (held-out) sin degradar la precisión general en ingeniería de software. No se especifican datos sobre RLHF, DPO, número de pasos, hiperparámetros de LoRA ni método de evaluación más allá de la referencia al dataset `brbrainerd/vox-mens-eval-vox-lang-bench`. El estado del checkpoint es "not trained", es decir, el adaptador no está incluido en el repositorio.

## Capacidades

- Generación de código para el lenguaje Vox: rutas completas, componentes reactivos y refactorización de helpers conectados.
- Generación de texto y conversación, heredadas del modelo base Qwen3.5-4B.
- Capacidades de ingeniería de software general, que el entrenamiento busca preservar explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés (`en`) según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de código diario para Vox en portátiles de estación de trabajo: el tamaño de 4B está pensado para memoria unificada holgada y velocidad de decodificación local estable, lo que permite usarlo como asistente interactivo mientras se escriben rutas y componentes `.vox`.
- Generación de rutas full-stack en Vox: el adaptador apunta a producir endpoints de backend, tablas de base de datos y componentes de UI en un único fichero verificado por el compilador, reduciendo el trabajo de integración manual entre capas.
- Refactorización de helpers conectados: al estar especializado en el modelo de un solo fichero de Vox, puede reescribir funciones relacionadas manteniendo la coherencia entre tabla, endpoint y componente.
- Validación frente al compilador de Vox: el criterio de publicación declarado es mejorar las comprobaciones del compilador sobre prompts reservados, por lo que encaja en pipelines de evaluación automatizada del propio lenguaje.
- Prototipado en el Vox MENS Playground: el checkpoint está enlazado al Space `brbrainerd/vox-mens-playground`, lo que permite probar el flujo sin despliegue local.
- Sustitución por tamaño según carga: la escalera de modelos (2B para máquinas ligeras, 9B para tareas complejas entre módulos) permite elegir 4B como punto medio para tareas cotidianas.

Advertencia: dado que el repositorio no contiene los pesos del adaptador, estos casos de uso describen el propósito declarado del proyecto y no pueden verificarse con este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona el dataset de evaluación `brbrainerd/vox-mens-eval-vox-lang-bench` y el criterio cualitativo de mejorar las comprobaciones del compilador de Vox sin perder precisión general, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador (sin pesos). Para el modelo base de 4B, las estimaciones habituales serían del orden de 8-10 GB en FP16 y 3-5 GB en cuantización de 4 bits, aunque no se confirman en la información proporcionada.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no confirmado; el texto sugiere estaciones de trabajo con memoria unificada, no GPUs discretas concretas.
- Opciones de despliegue: la librería indicada es `vox`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la model card solo afirma "velocidad de decodificación local estable" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vox MENS Qwen3.5-4B (este) | 4B (base) | no disponible | apache-2.0 | Repositorio sin pesos (0.0 GB) |
| Vox MENS Qwen3.5-2B | 2B (base) | no disponible | no disponible | Mencionado en la escalera Vox MENS |
| Vox MENS Qwen3.5-9B | 9B (base) | no disponible | no disponible | Mencionado en la escalera Vox MENS |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible | Modelo base en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El checkpoint está marcado como "not trained": los pesos del adaptador no están en el repositorio, por lo que no es utilizable para inferencia tal cual.
- Especialización muy estrecha: está orientado al lenguaje Vox, un ecosistema propietario con documentación propia; su valor fuera de ese ecosistema es limitado.
- Idioma: solo inglés según los metadatos, sin soporte declarado de castellano.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un adaptador de código, es esperable la generación de APIs o constructos inexistentes, pero no hay datos que lo cuantifiquen.
- Sesgos: no documentados.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero al no haber pesos publicados la aplicabilidad práctica es nula.
- Dependencia de la librería `vox` y del playground del autor; no se documentan formatos estándar de pesos ni integraciones con runtimes habituales.
- Fecha de creación del repositorio: 2026-11-16, sin descargas ni likes registrados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground?model=brbrainerd/vox-mens-qwen3.5-4b
- Índice de la escalera Vox MENS: https://huggingface.co/brbrainerd/vox-mens-index
- Documentación de modelos MENS: https://voxlang.org/reference/mens-models/
- Lenguaje Vox: https://voxlang.org
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
