# brbrainerd/vox-mens-qwen3.5-9b

## Resumen

Vox MENS Qwen3.5-9B es un adaptador QLoRA sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario brbrainerd dentro del proyecto Vox MENS. Su propósito es especializar el modelo base en la generación y razonamiento de código para Vox, un lenguaje de programación full-stack y "AI-native" en el que tablas de base de datos, endpoints de backend, componentes reactivos de interfaz y agentes de IA tipados conviven en un único fichero `.vox` verificado por el compilador. El adaptador busca mejorar las comprobaciones reales del compilador Vox sobre prompts reservados sin degradar la precisión general en ingeniería de software.

El checkpoint etiquetado como "9B" está marcado como **not-trained** en la model card: la ejecución de entrenamiento consta en el registro del proyecto, pero los pesos del adaptador no están incluidos en este repositorio. El tamaño del repositorio es de 0.0 GB, lo que es coherente con esa ausencia de pesos. Por tanto, esta ficha describe el modelo tal y como lo declara su autor, no un artefacto descargable y ejecutable en el momento de la consulta.

La relevancia del modelo es doble: por un lado, ilustra una estrategia de especialización por tallas (4B, 9B, 27B) orientada a distintos perfiles de hardware, con el 9B apuntado a portátiles de alta memoria y estudios compactos con Apple Silicon; por otro, ejemplifica el patrón de adaptadores QLoRA publicados como artefactos ligeros sobre un modelo base grande, con licencia Apache 2.0 y un playground asociado en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen/Qwen3.5-9B (el modelo base se describe con gated delta networks como innovación de arquitectura; la arquitectura exacta del adaptador no se detalla) |
| Parametros totales | No disponible (el nombre indica 9B para el modelo base; el adaptador no declara recuento de parámetros) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA implica cuantización del modelo base durante el entrenamiento; los tipos concretos de cuantización para inferencia no se detallan |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio no contiene los pesos del adaptador (tamaño 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA sobre Qwen/Qwen3.5-9B, con revisión del modelo base fijada en `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y relación declarada `adapter`. La librería asociada es `vox`, y entre las etiquetas figuran `gated-delta-networks`, `qlora` y `candle`, lo que sugiere que el ecosistema de referencia combina la arquitectura del modelo base con herramientas de inferencia en Rust (Candle) y un pipeline propio del proyecto. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El criterio de publicación declarado es exigente: antes de publicarse, el modelo debe mejorar comprobaciones reales del compilador Vox sobre prompts reservados sin perder precisión general en ingeniería de software. El dataset de evaluación asociado es `brbrainerd/vox-mens-eval-vox-lang-bench`. El estado "not-trained" indica que, aunque la ejecución de entrenamiento está registrada, los pesos del adaptador no se han subido a este repositorio, por lo que no es posible verificar el resultado de ese criterio a partir del artefacto publicado.

## Capacidades

- Generación de código para el lenguaje Vox: tablas de base de datos, endpoints de backend, componentes reactivos de interfaz y agentes de IA tipados en ficheros `.vox`.
- Razonamiento sobre tipos del compilador y verificación de restricciones del lenguaje.
- Planificación de funcionalidades multi-fichero.
- Conexión de esquemas de base de datos con actores.
- Conversación y generación de texto de propósito general heredadas del modelo base Qwen3.5-9B (etiquetas `conversational` y `text-generation`).
- Capacidades de código general (`code`) más allá del lenguaje Vox.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el dominio Vox incluye agentes tipados como concepto del lenguaje, no como capacidad declarada del modelo.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Desarrollo de aplicaciones full-stack en Vox: el modelo generaría ficheros `.vox` completos que combinan esquema de base de datos, endpoints y componentes de interfaz, aprovechando que el compilador verifica la coherencia entre capas. Es adecuado porque el adaptador se entrenó (según el criterio declarado) contra comprobaciones reales del compilador.
- Planificación de funcionalidades multi-fichero: en un portátil de alta memoria o un estudio compacto con Apple Silicon, el 9B serviría para descomponer una funcionalidad en cambios coordinados sobre varios ficheros `.vox`, una tarea que el autor sitúa explícitamente en este tamaño.
- Conexión de esquemas de base de datos con actores: el modelo razonaría sobre los tipos del esquema y generaría el cableado hacia los actores del backend, un escenario típico del lenguaje y para el que el adaptador está especializado.
- Asistencia en migraciones y refactorizaciones dentro del ecosistema Vox: dado que el compilador actúa como verificador, el modelo puede proponer cambios y el desarrollador validarlos con las comprobaciones del compilador, reduciendo el riesgo de romper contratos de tipos.
- Evaluación comparativa de tallas del proyecto Vox MENS: el 9B se posiciona entre el 4B (máquinas pequeñas) y el 27B (arquitectura de repositorio completo), por lo que sirve como punto intermedio en pruebas de calidad frente a coste de hardware.
- Prototipado en el playground: el Space `brbrainerd/vox-mens-playground` permite probar el checkpoint sin despliegue local, útil para evaluar si el modelo encaja en un flujo de trabajo antes de invertir en infraestructura.
- Generación de código general en inglés: al estar construido sobre Qwen3.5-9B, puede emplearse en tareas de código fuera de Vox, aunque sin garantías específicas del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El dataset de evaluación `brbrainerd/vox-mens-eval-vox-lang-bench` está referenciado, pero no se incluyen métricas numéricas en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador, ya que los pesos no están en el repositorio. Para el modelo base de 9B, las estimaciones habituales dependerían de la cuantización, pero no se aportan cifras en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el autor orienta el 9B a "portátiles de alta memoria y estudios compactos con Apple Silicon", lo que sugiere ejecución local en equipos de gama alta, pero no se especifican modelos concretos de GPU.
- Opciones de despliegue: la librería declarada es `vox` y entre las etiquetas figura `candle`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Vox MENS Qwen3.5-9B | 9B (modelo base) | No disponible | Código Vox vía adaptador QLoRA | Apache 2.0 | No (estado not-trained, repo 0.0 GB) |
| Vox MENS 4B | No disponible | No disponible | Código Vox, orientado a máquinas pequeñas | No disponible | No disponible en la información proporcionada |
| Vox MENS 27B | No disponible | No disponible | Código Vox, arquitectura de repositorio completo | No disponible | No disponible en la información proporcionada |
| Qwen/Qwen3.5-9B | 9B | No disponible | Modelo base generalista | No disponible en la información proporcionada | Sí (modelo base referenciado) |

La comparación se limita a las tallas del propio proyecto Vox MENS y al modelo base, que son los únicos términos de referencia presentes en la información. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Los pesos del adaptador no están incluidos en el repositorio (estado not-trained, tamaño 0.0 GB): el modelo no es descargable ni ejecutable tal cual desde este artefacto.
- El criterio de calidad declarado (mejorar comprobaciones del compilador Vox sin perder precisión general) no puede verificarse sin los pesos ni sin métricas publicadas.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base, arrastraría los sesgos de este, que no se detallan.
- Riesgo de alucinación: no cuantificado; en generación de código, el compilador Vox actúa como mitigación parcial, pero no se documenta su eficacia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la información proporcionada.
- Especialización estrecha: el adaptador está orientado al lenguaje Vox; su utilidad fuera de ese dominio depende del modelo base y no está garantizada por el adaptador.
- Dependencia de la librería `vox` y del ecosistema del proyecto: la integración con herramientas estándar de inferencia no está documentada.
- Fecha de creación y actualización (16 de noviembre de 2026) y ausencia de descargas o likes: el artefacto es reciente y sin validación comunitaria en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Playground: https://huggingface.co/spaces/brbrainerd/vox-mens-playground?model=brbrainerd/vox-mens-qwen3.5-9b
- Índice de la escalera de tallas: https://huggingface.co/brbrainerd/vox-mens-index
- Documentación de modelos MENS: https://voxlang.org/reference/mens-models/
- Documentación sobre cómo se generan las fichas: https://voxlang.org/reference/mens-models/#how-the-cards-are-made
- Leyenda de estados: https://voxlang.org/reference/mens-models/#state-legend
- Lenguaje Vox: https://voxlang.org
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
