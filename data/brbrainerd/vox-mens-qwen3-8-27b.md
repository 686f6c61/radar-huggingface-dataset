# brbrainerd/vox-mens-qwen3.8-27b

## Resumen

Vox MENS Qwen3.8-27B es un adaptador QLoRA publicado por el usuario brbrainerd sobre el modelo base Qwen/Qwen3.8-27B, orientado a la generación de código en Vox, un lenguaje de programación full-stack y "AI-native" en el que tablas de base de datos, endpoints de backend, componentes de interfaz reactivos y agentes de IA tipados conviven en un único fichero `.vox` verificado por el compilador. El adaptador forma parte de la familia Vox MENS, una escalera de tamaños (con un modelo hermano de 9B) pensada para ejecutarse en estaciones de trabajo Apple Silicon de alta memoria sin depender de clústeres remotos.

El dato más relevante para evaluar este repositorio es que el checkpoint de 27B figura explícitamente como **no entrenado**: según la model card, el historial de entrenamiento está registrado pero los pesos del adaptador no están incluidos en el repositorio. El tamaño del repo es de 0.0 GB, lo que confirma que no contiene artefactos de pesos. Se trata, por tanto, de una ficha de catálogo dentro del índice de modelos Vox MENS, no de un adaptador listo para descargar y usar.

La relevancia es doble: por un lado, documenta el enfoque de especialización de un modelo grande (27B) para un DSL propietario con validación de compilador como criterio de calidad; por otro, sirve como ejemplo de buenas prácticas de trazabilidad (revisión del modelo base fijada, dataset de evaluación declarado, licencia Apache 2.0) y de los riesgos de publicar entradas de catálogo sin pesos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador QLoRA sobre Qwen/Qwen3.8-27B; la arquitectura del base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre comercial indica 27B, pero no se confirma en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrena con QLoRA, lo que implica cuantizacion del base durante el entrenamiento, pero no se especifican tipos) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; no contiene pesos del adaptador) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.8-27B ni su composicion de datos de entrenamiento. Lo que si se documenta es el metodo de ajuste: un adaptador QLoRA (cuantizacion de bajo rango con adaptadores de bajo rango) sobre la revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0` del modelo base. La libreria declarada es `vox`, y entre las etiquetas aparecen `qlora`, `candle` (el framework de tensores en Rust de Hugging Face) y `not-trained`.

El criterio de calidad declarado es especifico y verificable en principio: antes de publicarse, el modelo debe mejorar las comprobaciones reales del compilador de Vox sobre prompts reservados (held-out) sin perder precision en ingenieria de software general. El dataset de evaluacion asociado es `brbrainerd/vox-mens-eval-vox-lang-bench`. No se detalla el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de codigo en el lenguaje Vox: sintesis de ficheros `.vox` que integran esquema de base de datos, endpoints de backend, componentes de UI reactivos y agentes de IA tipados en una sola unidad verificada por compilador.
- Razonamiento sobre arquitectura de software entre modulos: el modelo esta posicionado por el autor para diseno de arquitectura cross-module y depuracion compleja en una sola pasada.
- Sintesis multi-fichero: la model card lo recomienda para generacion de codigo Vox repartido en varios ficheros.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de dialogo, aunque no se detallan capacidades concretas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada del adaptador; el lenguaje Vox incorpora agentes tipados como constructo del DSL, lo que no implica que el modelo tenga capacidades de agente.
- Capacidades multilingues: limitadas a ingles (`en`); no se declaran otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Generacion de modulos Vox completos: dado un requisito funcional en lenguaje natural, producir un fichero `.vox` con tablas, endpoints y componentes de UI que pase las comprobaciones del compilador. Es el caso de uso central declarado por el autor.
- Refactorizacion cross-module: reestructurar un proyecto Vox existente que abarca varios ficheros, aprovechando la ventana de contexto del modelo base para mantener coherencia entre modulos (la longitud concreta de contexto no esta disponible).
- Depuracion de errores de compilador: interpretar mensajes de error del compilador Vox y proponer parches que respeten el tipado del DSL y las restricciones de la base de datos declarada.
- Asistencia en estaciones de trabajo Apple Silicon: el autor posiciona explicitamente el tamano 27B para equipos de alta memoria sin servidor remoto, lo que encaja en flujos de desarrollo local con privacidad de codigo.
- Evaluacion comparativa de modelos de codigo especializados: usar el dataset `vox-mens-eval-vox-lang-bench` para medir la mejora en comprobaciones del compilador frente a modelos generalistas, replicando el criterio de publicacion del autor.
- Prototipado rapido de aplicaciones full-stack: al unificar backend, base de datos y UI en un solo fichero compilado, el modelo puede generar prototipos funcionales de extremo a extremo en una sola pasada.

Advertencia: dado que este checkpoint figura como no entrenado y el repositorio no contiene pesos, ninguno de estos casos puede ejecutarse con este artefacto tal cual; requeriria el adaptador real o el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un criterio de evaluacion (mejora en comprobaciones del compilador Vox sobre prompts held-out sin degradar precision general en ingenieria de software) y un dataset asociado, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de ~27B en precision completa (FP16) el orden de magnitud seria de ~54 GB de pesos, pero este dato no procede de la informacion proporcionada y debe tratarse como estimacion externa.
- GPU recomendadas: no disponible en la informacion proporcionada. El autor orienta el tamano 27B a estaciones de trabajo Apple Silicon de alta memoria, no a GPU discretas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona el framework `candle` (Rust) y una demo en Hugging Face Spaces (`vox-mens-playground`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Vox MENS Qwen3.8-27B (este) | no disponible (nominal 27B) | no disponible | Codigo Vox via QLoRA | Apache 2.0 | No (repo de 0.0 GB) |
| Vox MENS 9B (hermano de familia) | no disponible (nominal 9B) | no disponible | Codigo Vox, menor memoria | no disponible | no disponible |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | Modelo generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos; la comparativa se limita a tamano nominal, enfoque y disponibilidad de pesos.

## Limitaciones y advertencias

- El checkpoint figura como "not trained": los pesos del adaptador no estan en el repositorio (0.0 GB). No es utilizable para inferencia tal cual.
- El modelo esta especializado en un lenguaje propietario (Vox) con ecosistema reducido; su utilidad fuera de ese DSL es dudosa y no esta medida.
- Solo se declara soporte de ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion en APIs y sintaxis de Vox no cubiertas por el dataset de entrenamiento; la verificacion por compilador mitiga pero no elimina este riesgo.
- No se documentan sesgos conocidos, pero tampoco evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos publicados no hay nada que licenciar en este repositorio; conviene verificar la licencia del modelo base por separado.
- El autor fija una revision concreta del modelo base; cambios posteriores en el base pueden invalidar la reproducibilidad.
- La model card esta generada automaticamente por `vox mens hub sync`, lo que reduce la probabilidad de que refleje resultados empiricos detallados.

## Enlaces

- Hugging Face: https://huggingface.co/brbrainerd/vox-mens-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Indice de la familia Vox MENS: https://huggingface.co/brbrainerd/vox-mens-index
- Dataset de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Demo (Space): https://huggingface.co/spaces/brbrainerd/vox-mens-playground
- Documentacion de modelos MENS: https://voxlang.org/reference/mens-models/
- Lenguaje Vox: https://voxlang.org
