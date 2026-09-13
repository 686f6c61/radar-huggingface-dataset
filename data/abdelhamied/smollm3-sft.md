# abdelhamied/smollm3-sft

## Resumen

`abdelhamied/smollm3-sft` es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, publicado por el usuario abdelhamied en Hugging Face. Se ha entrenado con la libreria TRL sobre el subconjunto `HuggingFaceTB/smoltalk2_everyday_convs_think`, una parte del corpus SmolTalk2 orientada a conversaciones cotidianas y formateada con trazas de razonamiento explicito. No es un modelo nuevo desde cero: es un checkpoint de 3B parametros reentrenado sobre una receta estandar y reproducible.

Su relevancia es la de un experimento de ajuste dentro de la familia SmolLM3, que destaca por ser una familia abierta de modelos pequenos con atencion de consulta agrupada, embeddings atados y contexto largo. Al derivar de SmolLM3-3B-Base, hereda la arquitectura y el tokenizador del original, pero la model card no documenta ni la licencia, ni los idiomas, ni evaluaciones propias, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Conviene tratarlo, por tanto, como un artefacto de investigacion sin validar: util para reproducir o comparar recetas de SFT, no como un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de SmolLM3-3B-Base: atencion de consulta agrupada, NoPE en capas alternas y embeddings atados). El fine-tune no documenta cambios estructurales |
| Parametros totales | 3,08 mil millones (dato del modelo base; no confirmado en la model card del fine-tune) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base soporta 64k tokens nativos y 128k con extension YaRN |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible en la model card; el modelo base se entrena con datos en ingles, frances, espanol, aleman, italiano y portugues |
| Licencia | no disponible; la model card incluye unicamente el marcador `licence: license` sin texto legal |
| Formato de pesos | safetensors (biblioteca `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3,08B parametros, con atencion de consulta agrupada (GQA) para reducir el coste del KV cache, mecanismo NoPE (sin codificacion posicional explicita) en un subconjunto de capas y embeddings de entrada/salida atados. El modelo base se entreno sobre del orden de 11 billones de tokens. El fine-tune no modifica esta estructura; solo actualiza los pesos mediante SFT.

El entrenamiento se hizo con TRL 1.13.0 sobre el dataset `smoltalk2_everyday_convs_think`, que contiene conversaciones de tematica cotidiana en formato "think" (razonamiento previo a la respuesta). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de pasos, la tasa de aprendizaje ni si hubo fases posteriores de RLHF, DPO o preferencias. Tampoco se indica si el checkpoint conserva el comportamiento dual del modelo base, que alterna modo razonamiento y modo directo mediante los tokens de control `/think` y `/no_think`.

Las versiones declaradas del entorno son TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2; algunas de ellas no corresponden a releases publicas estables, lo que sugiere metadatos generados o erróneos.

## Capacidades

- Generacion de texto conversacional en dominios cotidianos, entrenada especificamente sobre dialogos de uso diario.
- Formato de razonamiento explicito: el dataset de entrenamiento incluye trazas de tipo "think", por lo que el modelo tiende a producir deliberacion antes de la respuesta final.
- Razonamiento de un solo turno y multi-turno basico; no hay evaluacion publicada de cadenas de razonamiento largas.
- Capacidades multilingues: no documentadas en el fine-tune. Las que herede dependen del modelo base.
- Tool calling / function calling: no documentado y no verificado. El dataset de entrenamiento no incluye, por su nombre y descripcion, ejemplos de llamadas a herramientas.
- Comportamiento agentico y multi-step reasoning: no documentado.
- Modo de pensamiento controlable mediante `/think` y `/no_think`: no confirmado en este checkpoint.
- Codigo y matematicas: no documentado; el dataset de entrenamiento esta centrado en conversaciones cotidianas, lo que sugiere un rendimiento inferior al del modelo base en estas tareas.

## Casos de uso

- Prototipado de asistentes conversacionales en local: un modelo de 3B en safetensors se puede cargar con `transformers` en una GPU de gama media y sirve para validar prompts, plantillas de chat y flujos de dialogo sin coste de API.
- Punto de partida para ajustes posteriores: al ser un checkpoint SFT limpio y reproducible, es adecuado como base para experimentos de DPO, ORPO o RLHF donde se quiera medir la aportacion de la fase de preferencias.
- Generacion de datos sinteticos de conversacion cotidiana: puede producir dialogos de tematica general que despues se filtran y se usan para ampliar datasets de entrenamiento de modelos mas pequenos.
- Investigacion sobre formato de razonamiento: permite estudiar como se comporta un modelo entrenado con trazas "think" y si estas mejoran la precision en tareas de sentido comun cotidiano.
- Base de comparacion en experimentos de recetas SFT: util como linea base para medir el efecto de distintos datasets, tasas de aprendizaje o duraciones de entrenamiento sobre el mismo modelo base.
- Asistente de escritura y reformulacion en entornos de baja criticidad, como borradores de correos o resumenes informales, siempre con revision humana y sin datos personales.
- Despliegue educativo o de demostracion: por su tamano, cabe en hardware de consumo y permite montar demos locales en aula o en portatiles con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del fine-tune no incluye evaluaciones de MMLU, GSM8K, HumanEval, IFEval ni de ninguna otra suite, y la busqueda web realizada no ha devuelto ninguna fuente tecnica sobre este checkpoint. No se deben extrapolar a este modelo los resultados publicados para SmolLM3-3B-Base o SmolLM3-3B, ya que el ajuste con un dataset de conversaciones cotidianas puede degradar el rendimiento en razonamiento, codigo y matematicas respecto al original.

## Requisitos de hardware

- VRAM en BF16/FP16: aproximadamente 6,2 GB solo para los pesos, mas activaciones y overhead; en la practica conviene disponer de 8-10 GB.
- VRAM en INT8/FP8: del orden de 3,2-3,5 GB de pesos.
- VRAM en GGUF Q4_K_M: aproximadamente 1,9-2,1 GB de pesos; Q5 en torno a 2,3 GB y Q8 en torno a 3,3 GB.
- KV cache: no hay cifra publicada. Crece de forma lineal con la longitud de contexto y con 64k-128k tokens exige varios GB adicionales en FP16, por lo que en contextos largos conviene cuantizar la cache o limitar la ventana.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 (esta ultima recomendable si se trabaja con contexto muy largo). En Apple Silicon, equipos con 16 GB o mas de memoria unificada mediante llama.cpp o MLX.
- GPU de datacenter: A100 40/80 GB, H100, L40S. Cualquiera de ellas sirve para servicio concurrente de alta densidad.
- Opciones de despliegue: `transformers` (como en el ejemplo de la model card), vLLM, TGI, SGLang, y llama.cpp u Ollama previa conversion a GGUF (no hay GGUF publicado en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de la columna de contexto y licencia de los modelos alternativos provienen de sus model cards publicas y no se han verificado en esta busqueda; deben confirmarse antes de tomar decisiones de uso.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| abdelhamied/smollm3-sft | 3,08B (heredados) | no disponible | no disponible | pesos safetensors en HF, 0 descargas |
| HuggingFaceTB/SmolLM3-3B (instruct) | 3,08B | 64k nativos, 128k con YaRN | Apache 2.0 | pesos abiertos en HF |
| Qwen2.5-3B-Instruct | ~3,1B | 32k nativos, ampliable | licencia propia de Qwen, no verificada | pesos abiertos en HF |
| Llama-3.2-3B-Instruct | ~3,2B | 128k | Llama 3.2 Community License | pesos abiertos en HF, con condiciones de uso |

No hay datos de rendimiento comparado para este checkpoint, por lo que la comparacion se limita a parametros, contexto y licencia. En igualdad de condiciones, los modelos oficiales de HuggingFace, Alibaba y Meta parten con ventaja en soporte, documentacion y garantias legales.

## Limitaciones y advertencias

- Licencia ausente: la model card solo contiene el marcador `licence: license`, sin texto. No hay cesion de derechos explicitada, por lo que no se puede asumir uso comercial permitido.
- Sin evaluaciones: no existe ningun benchmark publicado, ni del autor ni de terceros. Se desconoce la calidad real del modelo frente al base.
- Degradacion potencial: entrenar sobre conversaciones cotidianas puede reducir capacidades de razonamiento, codigo y matematicas respecto a SmolLM3-3B-Base, ademas de provocar olvido catastrofico.
- Riesgo de alucinacion: inherente a un modelo de 3B sin verificacion factual. No apto para uso informativo sin supervision.
- Idiomas no documentados: aunque el modelo base es multilingue, se desconoce el comportamiento del fine-tune fuera del ingles, incluido el espanol.
- Sesgos: no se ha realizado ninguna auditoria de sesgos, toxicidad o seguridad. Los datos de SmolTalk2 proceden en su mayoria de fuentes en ingles.
- Trazas de razonamiento en la salida: los modelos entrenados con formato "think" pueden emitir el razonamiento interno en produccion si el prompt no se controla, lo que aumenta la latencia y el consumo de tokens.
- Tamano del repositorio incoherente: el repositorio indicado ocupa 0,1 GB, muy por debajo de los aproximadamente 6 GB que requieren los pesos completos de un modelo de 3B en FP16. Es probable que el repositorio contenga un adaptador LoRA, pesos parciales o un error de metadatos; conviene verificar antes de intentar cargarlo.
- Metadatos sospechosos: las fechas de creacion y actualizacion indicadas (2026) y varias versiones de librerias declaradas no coinciden con releases publicas conocidas.
- Entorno de entrenamiento no reproducible: no se especifican hiperparametros, numero de pasos ni configuracion de datos, por lo que el resultado no es facilmente replicable.
- Trazabilidad de la busqueda: la busqueda web realizada no devolvio ninguna fuente tecnica relevante; los resultados obtenidos eran ruido sin relacion con el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdelhamied/smollm3-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Modelo instruct de la familia: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2_everyday_convs_think
- Repositorio de TRL: https://github.com/huggingface/trl
- Blog de presentacion de la familia SmolLM3: https://huggingface.co/blog/smollm3
- La busqueda web no devolvio papers, blogs ni repositorios adicionales relacionados con este checkpoint concreto.
