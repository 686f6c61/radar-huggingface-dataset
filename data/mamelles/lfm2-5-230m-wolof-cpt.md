# mamelles/LFM2.5-230M-Wolof-CPT

## Resumen

LFM2.5-230M-Wolof-CPT es un artefacto de ajuste publicado en HuggingFace por el usuario `mamelles`, construido a partir del modelo base `LiquidAI/LFM2.5-230M-Base`. Se trata de un modelo de generacion de texto de 232.627.968 parametros (segun los pesos en safetensors) que ha pasado por una etapa de preentrenamiento continuado (CPT, *continual pretraining*) sobre un corpus de wolof depurado. El autor lo describe explicitamente como un "artefacto de produccion privado, experimental y no un lanzamiento publico", por lo que no debe confundirse con un modelo listo para uso general.

El modelo hereda la familia LFM2 de Liquid AI, etiquetada en el repositorio con el tag `lfm2`, y esta pensado para investigacion y evaluacion privadas de adaptacion al wolof. La model card indica que el artefacto supero las puertas automaticas de validacion registradas en `training_manifest.json`, pero no se emite ninguna afirmacion de calidad adicional. No se declaran licencia, idiomas oficiales ni longitud de contexto en la informacion disponible.

Su relevancia es acotada pero clara: los modelos de menos de 300 millones de parametros adaptados a lenguas de bajos recursos como el wolof son escasos, y este artefacto documenta de forma inusualmente explicita sus caveats (tokenizador, datos, metricas) en lugar de presentar cifras de rendimiento no verificadas. Aun no acumula descargas ni interacciones en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia de Liquid AI; tag `lfm2`). Detalles de capas y atencion: no disponibles en la informacion proporcionada |
| Parametros totales | 232.627.968 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (el repositorio contiene pesos safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponibles como lista oficial. El artefacto se orienta al wolof segun el nombre y la model card; se menciona tambien code-switching como aspecto no validado |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,5 GB |
| Pipeline | `text-generation` |
| Compatibilidad | `endpoints_compatible` (tag del repositorio) |
| Tokenizador | Familia `65k-ext` (segun la model card) |
| Modelo base | `LiquidAI/LFM2.5-230M-Base` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla del tag `lfm2` y de la libreria de inferencia (`transformers`). Se sabe que es un modelo de generacion de texto conversacional de 232,6 millones de parametros, con pesos en safetensors y un tokenizador perteneciente a la familia denominada `65k-ext`. El autor advierte de forma explicita que las metricas BPB de esta familia de tokenizador no deben compararse como perplejidad contra la familia de 128k, lo que indica que LFM2.5 dispone al menos de dos configuraciones de vocabulario y que la comparacion entre ellas es metodologicamente invalida.

El entrenamiento corresponde a una etapa de CPT (*continual pretraining*) sobre el protocolo de corpus de wolof depurado del autor. Los datos de instruccion fueron reponderados y excluyen la particion de test del Hub de origen, pero la propia model card reconoce que ejemplos similares a los de los benchmarks pueden haber estado presentes en el preentrenamiento upstream. No se publica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra alineacion. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto autoregresiva y uso conversacional, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Adaptacion linguistica al wolof mediante preentrenamiento continuado sobre un corpus depurado especifico de ese idioma.
- Manejo del tokenizador de la familia `65k-ext`, con la salvedad de que su BPB no es comparable con la familia de 128k.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card indica que el razonamiento no ha sido validado de forma exhaustiva.
- Capacidades multilingues: no disponibles como lista; el foco declarado es el wolof.
- Capacidad especial de modo pensamiento, vision o audio: no disponible.
- Despliegue via `transformers` y compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Investigacion en adaptacion de lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar tecnicas de preentrenamiento continuado sobre wolof, comparando BPB dentro de la misma familia de tokenizador (65k-ext) y no contra modelos de vocabulario distinto.
- Depuracion y normalizacion ortografica de corpus en wolof: el modelo puede usarse como generador de referencia para detectar variantes ortograficas inconsistentes, siempre con revision posterior de hablantes nativos, tal como exige la propia model card.
- Etiquetado y clasificacion de texto en wolof: partiendo de este checkpoint como base, es viable un ajuste supervisado ligero para tareas de clasificacion (tematica, toxicidad, calidad de texto) en corpus wolof de dominio especifico.
- Generacion asistida de texto en wolof para evaluacion interna: redaccion de borradores o continuaciones de texto en entornos de investigacion cerrados, sin exposicion publica, dado el caracter experimental del artefacto.
- Experimentos de traduccion asistida wolof-frances: uso del modelo como componente generativo en un pipeline de traduccion bajo revision humana, siendo consciente de que la factualidad y el cambio de codigo no han sido validados.
- Despliegue en hardware limitado o en el borde: con 232,6 M de parametros, el modelo es candidato para prototipos en CPU o GPU de gama baja dentro de un entorno de laboratorio, por ejemplo en pruebas de latencia antes de escalar a modelos mayores.
- Evaluacion de infraestructura de inferencia: banco de pruebas para medir throughput y latencia de la familia LFM2.5 en `transformers` o en servidores compatibles con endpoints, con un coste de memoria muy bajo.
- Analisis de sesgos y seguridad en lenguas africanas: el checkpoint permite estudiar como un modelo pequeno entrenado sobre un corpus mayoritariamente no wolof se comporta tras un CPT limitado, incluidos los artefactos de mezcla de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que solo los resultados medidos se incluyen en `metrics.json` y que la ausencia de una metrica implica que no fue medida, sin que pueda inferirse ningun valor. No se proporciona ninguna cifra de MMLU, HumanEval, GSM8K ni de tareas especificas de wolof, ni comparacion alguna con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de 232.627.968 parametros: aproximadamente 0,93 GB en fp32, 0,47 GB en bf16/fp16, 0,23 GB en int8 y 0,12 GB en int4.
- A esas cifras hay que sumar el *overhead* del runtime (activaciones, cache KV y bibliotecas). En la practica, una inferencia en bf16 con contexto moderado suele requerir del orden de 1 a 3 GB de memoria total, aunque no se dispone de mediciones publicadas para este artefacto.
- Cabe sin dificultad en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, e incluso en GPU integradas o en CPU con memoria suficiente.
- GPU de centro de datos (A100, H100) solo justificables para procesamiento por lotes a gran escala o para investigacion de la familia completa, no por requisitos de memoria.
- Opciones de despliegue: `transformers` (formato nativo safetensors), servidores compatibles con endpoints (tag `endpoints_compatible`) y, previa conversion a GGUF, `llama.cpp` u `Ollama`. No se publican pesos GGUF en el repositorio, por lo que el soporte en esas herramientas requeriria conversion propia.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este artefacto, por lo que la comparacion se limita a parametros y disponibilidad. Las cifras de los modelos alternativos proceden de su documentacion publica general y no han sido verificadas en la busqueda realizada; deben tomarse como orientativas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-230M-Wolof-CPT | 232,6 M | No disponible | No disponible | CPT sobre wolof, artefacto privado experimental |
| LFM2.5-230M-Base | ~230 M (no confirmado) | No disponible | No disponible | Modelo base de Liquid AI sin adaptacion a wolof |
| SmolLM2-360M | ~362 M | No disponible en esta busqueda | Apache-2.0 (segun su documentacion publica) | Modelo pequeno de proposito general |
| Qwen2.5-0.5B | ~494 M | No disponible en esta busqueda | Apache-2.0 (segun su documentacion publica) | Modelo pequeno multilingue de proposito general |

El unico punto de comparacion fiable en la informacion proporcionada es contra `LiquidAI/LFM2.5-230M-Base`: misma base y tamano practicamente identico, pero sin la etapa de CPT en wolof. No se conocen otros modelos de wolof de este rango de parametros a partir de los resultados de busqueda obtenidos.

## Limitaciones y advertencias

- Modelo declarado experimental por el propio autor: no es un lanzamiento publico y esta etiquetado como artefacto de produccion privado.
- Ortografia del wolof, cambio de codigo, factualidad, razonamiento, comportamiento en contexto largo y seguridad no han sido validados de forma exhaustiva.
- Se requiere revision por hablantes nativos antes de cualquier uso mas amplio.
- Riesgo de alucinacion: no se ha medido ni documentado ninguna tasa de alucinacion; en un modelo de 232 M de parametros con CPT limitado, el riesgo es alto.
- Contaminacion potencial: la model card admite que ejemplos similares a los de benchmarks pueden haber estado en el preentrenamiento upstream, por lo que cualquier evaluacion futura debe interpretarse con cautela.
- Comparaciones de BPB entre familias de tokenizador: la familia `65k-ext` no es comparable como perplejidad con la familia de 128k. Cualquier evaluacion que ignore esta advertencia sera invalida.
- Licencia no disponible: no puede asumirse uso comercial. Al derivar de un modelo de Liquid AI, habria que revisar los terminos del modelo base antes de cualquier explotacion.
- Idiomas soportados no declarados formalmente; el soporte multilingue fuera del wolof es incierto.
- Longitud de contexto no publicada: no se puede planificar un caso de uso que dependa de ventanas largas.
- Ausencia de descargas y de interaccion en el Hub: no existe validacion independiente por parte de la comunidad.
- Las fechas del repositorio (creacion y ultima actualizacion el 18 de septiembre de 2026) figuran asi en los metadatos; no se ha verificado su exactitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-230M-Wolof-CPT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Organizacion del autor: https://huggingface.co/mamelles
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su paper, a su repositorio de codigo ni a demos. Los resultados obtenidos no guardan relacion con el modelo y se han descartado.
