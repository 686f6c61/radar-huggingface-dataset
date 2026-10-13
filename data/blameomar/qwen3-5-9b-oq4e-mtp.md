# BlameOmar/Qwen3.5-9B-oQ4e-mtp

## Resumen

BlameOmar/Qwen3.5-9B-oQ4e-mtp es una version cuantizada del modelo Qwen3.5-9B, un modelo de lenguaje multimodal (texto e imagen) de 9.653.104.368 parametros desarrollado por el equipo Qwen de Alibaba. Esta variante concreta ha sido publicada por el usuario BlameOmar y aplica cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.1.dev1) sobre los pesos originales, reduciendo el peso del repositorio a 6,2 GB en formato MLX safetensors. El modelo base es el mayor de los cuatro modelos densos pequenos de la familia Qwen3.5, con arquitectura hibrida, contexto nativo de 262.000 tokens extensible a 1.000.000 mediante YaRN y soporte de 201 idiomas.

La relevancia de esta ficha es fundamentalmente practica: permite ejecutar un modelo multimodal de 9B en hardware Apple Silicon mediante MLX, con un ahorro de memoria notable gracias a los 4 bits de cuantizacion, sin renunciar a las capacidades de razonamiento visual, tool calling nativo y modo thinking del modelo original. Al estar pensado para el ecosistema MLX, su uso queda restringido a Macs con chip M-series y a librerias compatibles (mlx-lm, oMLX), no a stacks CUDA habituales.

Se trata de un repositorio muy reciente y sin traccion (0 descargas, 0 likes en el momento de la consulta), sin model card detallada mas alla de los parametros de cuantizacion y sin licencia declarada en el propio repositorio. Cualquier uso en produccion deberia apoyarse en la licencia y las condiciones del modelo base Qwen3.5-9B, que las fuentes web sitúan bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso multimodal (vision-language) con atencion hibrida, segun las fuentes del modelo base Qwen3.5-9B; no detallada en la ficha del repositorio cuantizado |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 B) |
| Parametros activos | no aplica; el modelo base es denso, no MoE |
| Longitud de contexto | 262.000 tokens nativos en el modelo base, extensible a 1.000.000 con YaRN; no confirmado en la ficha del repositorio cuantizado |
| Tipos de cuantizacion | 4 bits con esquema oQ4e de precision mixta (base de 4 bits con algunas proyecciones elevadas a 5-6 bits); group size 64 |
| Idiomas soportados | 201 idiomas en el modelo base segun las fuentes web; no especificado en el repositorio cuantizado |
| Licencia | no disponible en el repositorio; el modelo base Qwen3.5-9B se distribuye bajo Apache 2.0 segun las fuentes web |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento, ya que se trata exclusivamente de una conversion de pesos. Segun las fuentes web del modelo base, Qwen3.5-9B emplea una arquitectura unificada de vision-lenguaje con fusion temprana de tokens multimodales, lo que permite razonar sobre texto e imagen dentro de un mismo contexto. La familia Qwen3.5 esta compuesta por modelos densos pequenos y este es el mayor de los cuatro, con modo thinking activado por defecto. El contexto nativo es de 262.000 tokens y puede ampliarse hasta 1.000.000 mediante YaRN. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica de esta build concreta reside en la cuantizacion. El esquema oQe, descrito en la ficha de una build equivalente de otro autor (thederby/Qwen3.5-9B-oQ4e-mtp), establece un ancho de bits base por nivel y eleva las capas sensibles por encima de ese valor: en oQ4e la base es de 4 bits y algunas proyecciones se mantienen a 5-6 bits. Ademas, cada grupo de pesos recibe su escala y su sesgo a partir de una matriz de importancia derivada de datos de calibracion, y las builds incluyen un reajuste por minimos cuadrados ponderados de las escalas y sesgos de grupo implementado en oMLX. La ficha del repositorio de BlameOmar no detalla el conjunto de calibracion empleado. El sufijo "mtp" del nombre sugiere prediccion multi-token (multi-token prediction), pero el autor no lo documenta en la model card, por lo que no se puede confirmar.

## Capacidades

- Generacion de texto y razonamiento: hereda del modelo base el modo thinking activado por defecto, orientado a tareas de razonamiento multi-paso.
- Vision-lenguaje: acepta imagenes como entrada y razona conjuntamente sobre texto e imagen gracias a la fusion temprana de tokens multimodales del modelo original.
- Tool calling nativo: el modelo base declara soporte de function calling nativo, adecuado para flujos agenticos.
- Agentes y razonamiento multi-paso: las fuentes describen el modelo base como orientado a workflows agenticos.
- Multilingue: cobertura de 201 idiomas en el modelo base.
- Contexto largo: 262.000 tokens nativos, ampliables a 1.000.000 con YaRN segun las fuentes del modelo base.
- Codigo y matematicas: no se detalla explicitamente en la informacion disponible, aunque son capacidades habituales de la familia Qwen; tratar como no confirmado para esta build.
- Ejecucion local en Apple Silicon: el formato MLX safetensors permite inferencia en chip unificado sin GPU dedicada.
- No confirmado: soporte de audio, decodificacion especulativa u otras optimizaciones no aparecen documentadas ni en el repositorio ni en las fuentes consultadas.

## Casos de uso

- Asistente de programacion local en Mac: el modelo puede ejecutarse integramente en un equipo Apple Silicon con MLX, lo que permite autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo fuente a servicios externos. El contexto de 262.000 tokens del modelo base admite repositorios de tamano medio dentro de una sola ventana.
- Analisis de documentos e imagenes en local: al ser un modelo vision-lenguaje, puede extraer informacion de capturas, diagramas, facturas o formularios escaneados. El interes esta en que todo el procesamiento ocurre en el dispositivo, lo que resulta util en entornos con requisitos de confidencialidad.
- Agentes con tool calling en automatizacion: el soporte nativo de function calling del modelo base permite conectarlo a APIs internas, bases de datos o sistemas de ticketing para ejecutar acciones encadenadas en varios pasos, con el modelo decidiendo que herramienta invocar en cada turno.
- Atencion al cliente multilingue: con cobertura de 201 idiomas en el modelo base, un mismo despliegue puede atender consultas en varios idiomas sin modelos separados. El modo thinking ayuda en casos que requieren razonar sobre politicas o condiciones antes de responder.
- Procesamiento de expedientes largos: contratos, informes o historiales de miles de tokens caben en la ventana nativa de 262.000 tokens, lo que permite resumir, comparar o extraer clausulas sin trocear el documento y perder coherencia global.
- Razonamiento analitico asistido: el modo thinking por defecto lo hace adecuado para tareas de analisis estructurado (clasificacion de incidencias, generacion de hipotesis, descomposicion de problemas) donde se valora una cadena de razonamiento explicita.
- Prototipado y evaluacion de cuantizacion en investigacion: esta build sirve como referencia para medir la degradacion de un modelo multimodal de 9B al pasar a 4 bits con precision mixta, comparando su salida contra los pesos originales o contra builds GGUF equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes web consultadas (Together AI, Modal, AI Model Radar) anuncian secciones de benchmarks del modelo base Qwen3.5-9B, pero no incluyen cifras concretas en los extractos disponibles, y la ficha del repositorio cuantizado no reporta ninguna evaluacion propia ni comparacion con los pesos sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el repositorio ocupa 6,2 GB, por lo que la inferencia en MLX requiere aproximadamente 7-9 GB de memoria unificada considerando pesos, cache KV y overhead del runtime. La cifra exacta depende de la longitud de contexto utilizada.
- GPU recomendadas: no aplica en el sentido habitual; el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es compatible con CUDA de forma nativa.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB de memoria unificada o mas. Un Mac con 8 GB es probablemente insuficiente para contextos largos. En el mundo NVIDIA habria que recurrir a la build GGUF equivalente (unsloth/Qwen3.5-9B-MTP-GGUF) en lugar de estos pesos.
- Opciones de despliegue: mlx-lm y oMLX para el formato MLX safetensors. llama.cpp, Ollama o vLLM no cargan pesos MLX; para esos stacks habria que usar una conversion GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para esta build concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| BlameOmar/Qwen3.5-9B-oQ4e-mtp | 9,65 B | 262.000 (base) | MLX safetensors | oQ4e, 4 bits mixta, group size 64 | no disponible en el repo; base Apache 2.0 | 0 descargas, sin benchmarks publicados, solo Apple Silicon |
| thederby/Qwen3.5-9B-oQ4e-mtp | 9,65 B | 262.000 (base) | MLX safetensors | oQ4e, 4 bits mixta | no disponible en el extracto | Build equivalente de otro autor; su ficha explica el esquema oQe con mas detalle |
| unsloth/Qwen3.5-9B-MTP-GGUF | 9,65 B | 262.000 (base) | GGUF | cuantizaciones GGUF (no detalladas) | no disponible en el extracto | Alternativa para llama.cpp, Ollama y stacks no Apple |
| Qwen3.5-9B (modelo base) | 9 B | 262.000, extensible a 1.000.000 con YaRN | safetensors | pesos completos | Apache 2.0 | Referencia de maxima calidad; mayor requisito de memoria |

## Limitaciones y advertencias

- Degradacion por cuantizacion: la reduccion a 4 bits con precision mixta puede afectar a tareas sensibles a la precision numerica, como matematicas, generacion de codigo o razonamiento de varios pasos. No hay evaluaciones publicadas para esta build que cuantifiquen la perdida.
- Licencia no declarada en el repositorio: la ficha no indica licencia. Aunque el modelo base se distribuya bajo Apache 2.0 segun las fuentes web, conviene verificar las condiciones antes de un uso comercial.
- Dependencia de plataforma: el formato MLX safetensors solo se ejecuta en Apple Silicon con las librerias adecuadas. No es portable a CUDA, ROCm ni a hardware x86 sin conversión previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en consultas factuales, calculos y referencias bibliograficas. El modo thinking por defecto no elimina este riesgo.
- Idiomas: aunque el modelo base cubre 201 idiomas, el rendimiento suele concentrarse en ingles y chino, con calidad variable en lenguas minoritarias. No hay evaluacion especifica para castellano en la informacion disponible.
- Contexto extendido con YaRN: la extension a 1.000.000 de tokens es una tecnica de interpolacion y suele implicar degradacion en la recuperacion de informacion en posiciones intermedias del contexto. El modelo base declara 262.000 tokens nativos sin esta tecnica.
- Trazabilidad limitada: el repositorio no documenta el dataset de calibracion usado por oQ, el proceso de conversion ni pruebas de validacion. La fecha de creacion y de ultima actualizacion coinciden (13 de octubre de 2026), lo que sugiere una publicacion sin iteraciones posteriores.
- Sufijo "mtp" sin documentar: no se especifica en la model card que implica, por lo que no debe asumirse ninguna capacidad de prediccion multi-token en produccion.
- Ausencia de soporte observado: 0 descargas y 0 likes implican que la build no ha sido validada por terceros; se recomienda verificar la integridad de los pesos y comparar resultados contra el modelo base antes de desplegarla.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BlameOmar/Qwen3.5-9B-oQ4e-mtp
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Build equivalente de otro autor: https://huggingface.co/thederby/Qwen3.5-9B-oQ4e-mtp
- Version GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-MTP-GGUF
- Ficha del modelo base en Together AI: https://www.together.ai/models/qwen3-5-9b
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Ficha del modelo base en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
