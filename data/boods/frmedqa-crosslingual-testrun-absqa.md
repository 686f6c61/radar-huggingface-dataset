# boods/FrMedQA-CrossLingual-TestRun-AbsQA

## Resumen

FrMedQA-CrossLingual-TestRun-AbsQA es un ajuste fino (finetune) del modelo Qwen3-14B en su version cuantizada a 4 bits, publicado por el usuario boods en HuggingFace. El nombre sugiere un experimento sobre un corpus de preguntas y respuestas medicas en frances (FrMedQA) con evaluacion cruzada entre idiomas y respuesta abstractiva (AbsQA), aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento utilizado. Se trata de un "test run": el repositorio no incluye resultados, ejemplos, ni ninguna metrica de evaluacion.

Tecnicamente, el modelo hereda las caracteristicas del Qwen3-14B original: una arquitectura transformer densa, con soporte nativo de modo de razonamiento (thinking mode), tool calling y una ventana de contexto de 32.768 tokens ampliable con YaRN. El ajuste se realizo con Unsloth, segun declara el propio autor, lo que implica un entrenamiento con LoRA/QLoRA sobre pesos cuantizados a 4 bits.

Su relevancia practica es, a dia de hoy, muy limitada: cero descargas, cero "likes", ausencia total de documentacion sobre datos de entrenamiento, y un tamano de repositorio (0,5 GB) incompatible con un modelo de 14.000 millones de parametros completo, lo que apunta a adaptadores LoRA o a un guardado parcial. Debe tratarse como un artefacto experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen3-14B; no disponible en detalle en la model card |
| Parametros totales | 14B nominales (heredado del modelo base Qwen3-14B); no confirmado en el repositorio |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen3-14B declara 32.768 tokens nativos y 131.072 con YaRN |
| Tipos de cuantizacion | Entrenado sobre base cuantizada a 4 bits (bnb-4bit); el repositorio no publica GGUF ni otras cuantizaciones |
| Idiomas soportados | en (segun la model card); el nombre del modelo sugiere trabajo con frances, contradiccion no aclarada por el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Etiquetas | transformers, safetensors, text-generation-inference, unsloth, qwen3, trl, endpoints_compatible |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo unico documentado por el autor es que se parte de `unsloth/Qwen3-14B-unsloth-bnb-4bit`, un checkpoint ya cuantizado a 4 bits preparado para ajuste eficiente con Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a dicha libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o RLVR, ni los hiperparametros empleados.

Dado que se parte de una base cuantizada a 4 bits, lo mas probable es un ajuste mediante LoRA o QLoRA en lugar de un entrenamiento completo de los 14.000 millones de parametros. Esto es coherente con el tamano del repositorio (0,5 GB), que resultaria insuficiente para alojar pesos completos en precision de 4 bits (que ocuparian del orden de 8-9 GB). No obstante, el autor no aclara si el repositorio contiene unicamente los adaptadores, un merge parcial o un guardado truncado, lo que constituye una incertidumbre critica para cualquier uso.

Respecto a la arquitectura heredada, Qwen3-14B es un transformer decoder-only con Grouped Query Attention; incorpora un mecanismo de conmutacion entre modo de pensamiento y modo directo (thinking / non-thinking) que permite controlar el coste de razonamiento por consulta. Verificar estos extremos contra la documentacion del modelo base antes de cualquier despliegue es imprescindible, dado que la cuantizacion y el ajuste pueden degradarlos.

## Capacidades

No hay ninguna evaluacion publicada especifica de este finetune. Las capacidades que se enumeran a continuacion son las declaradas para la familia Qwen3 y deben considerarse potenciales, no verificadas sobre este checkpoint:

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento por pasos con modo de pensamiento explicito (thinking mode), heredado de Qwen3.
- Generacion de codigo, presumiblemente utilizable en tareas de completado y depuracion.
- Razonamiento matematico basico e intermedio.
- Soporte de tool calling / function calling, segun las capacidades declaradas de Qwen3.
- Soporte de flujos de agente y razonamiento multi-paso.
- Capacidades multilingues amplias en el modelo base; el repositorio solo declara ingles, aunque el nombre del proyecto apunta a tratamiento cruzado ingles-frances.
- Capacidad objetivo, segun el nombre: respuesta abstractiva a preguntas medicas en contexto cruzado de idiomas. No hay ninguna evidencia publicada de que esta capacidad se haya adquirido correctamente.

## Casos de uso

Los siguientes escenarios son hipoteticos y condicionados a que el checkpoint cargue correctamente y su ajuste haya funcionado. Se indican porque describen el proposito declarado del modelo, no porque exista validacion alguna:

- Experimentacion academica en QA medico multilingue: usar el modelo como punto de partida para reproducir o comparar tecnicas de cross-lingual transfer en dominios medicos, siempre que se disponga del dataset FrMedQA original y se compare contra el Qwen3-14B sin ajustar.
- Analisis de terminologia medica francesa: aprovechar un supuesto ajuste sobre corpus medico frances para tareas de normalizacion o parafrasis de terminos clinicos, con revision humana obligatoria.
- Generacion de respuestas abstractivas sobre historiales: resumir documentacion clinica extensa en respuestas sintetizadas, apoyandose en la ventana de contexto heredada del modelo base, con supervision medica.
- Evaluacion de tecnicas de ajuste eficiente: servir como ejemplo practico de QLoRA con Unsloth sobre Qwen3-14B para comparar coste y velocidad de entrenamiento frente a un ajuste completo.
- Pruebas de regresion de pipelines de TGI: el repositorio esta etiquetado como compatible con text-generation-inference, por lo que puede usarse como artefacto de prueba para validar despliegues de endpoints, no para producir contenido fiable.
- Investigacion sobre degradacion por cuantizacion: comparar las respuestas de este checkpoint con las del Qwen3-14B en fp16 para medir el impacto de la base bnb-4bit en tareas de comprension lectora medica.
- Prototipado de asistentes de triaje: explorar flujos de preguntas-respuestas con derivacion a profesional sanitario, exclusivamente en entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni ninguna otra metrica, y la busqueda web realizada no ha devuelto ningun material relacionado con el modelo (los resultados obtenidos correspondian a generadores de codigos QR, sin relacion alguna con el proyecto).

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano nominal del modelo base y no han sido verificadas con este checkpoint concreto:

- VRAM para inferencia en la cuantizacion del repositorio (4 bits): aproximadamente 9-11 GB, incluyendo cache KV para contextos moderados.
- VRAM en FP16/BF16 (si se reconstruye el modelo completo): aproximadamente 28-30 GB, mas cache KV.
- GPU recomendadas: para 4 bits, una RTX 4090 (24 GB), RTX 4080 (16 GB) o L4 (24 GB) resultan suficientes; para FP16, se requiere A100 40 GB, H100 o dos GPU de 24 GB con tensor parallelism.
- Cabe en GPU de consumo: si, en una RTX 4090 o RTX 3090 (24 GB) con la cuantizacion a 4 bits, y en una RTX 4080 o 4070 Ti Super (16 GB) con margen ajustado.
- Opciones de despliegue: text-generation-inference (etiqueta explicita del repositorio), vLLM y transformers. No se publican archivos GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion.

Advertencia: dado el tamano de 0,5 GB del repositorio, existe la posibilidad de que los pesos no esten completos o sean unicamente adaptadores LoRA. En ese caso, la carga directa fallara o requerira fusionar los adaptadores sobre el modelo base antes de servir el modelo.

## Comparativa con modelos similares

Comparacion de referencia segun datos publicos de las respectivas model cards de la familia base. Los valores de este checkpoint no estan documentados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| boods/FrMedQA-CrossLingual-TestRun-AbsQA | 14B nominales (repo de 0,5 GB) | no disponible | Apache-2.0 | 0 descargas | Finetune sin documentar ni evaluar |
| Qwen3-14B (original) | 14,8B | 32.768 tokens; 131.072 con YaRN | Apache-2.0 | Amplia, con pesos completos | Referencia directa del finetune |
| Qwen3-8B | 8,2B | 32.768 tokens; 131.072 con YaRN | Apache-2.0 | Amplia | Alternativa mas ligera de la misma familia |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Amplia | Alternativa generalista, licencia mas restrictiva |

No se dispone de datos de rendimiento comparado entre estas opciones dentro de la informacion proporcionada, por lo que la tabla refleja unicamente especificaciones estructurales.

## Limitaciones y advertencias

- Documentacion inexistente: no se especifican datos de entrenamiento, hiperparametros, procedimiento de evaluacion ni criterios de seleccion del checkpoint. No es posible reproducir ni auditar el ajuste.
- Riesgo alto de alucinacion en dominio clinico: un modelo ajustado sobre datos no declarados, sin validacion publicada, puede generar contenido medico plausible pero incorrecto. Su uso en cualquier contexto sanitario real es desaconsejable.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no puede caracterizarse el sesgo demografico, linguistico o clinico del modelo.
- Idoneidad de la cuantizacion: el ajuste se realiza sobre una base ya cuantizada a 4 bits, lo que introduce degradacion respecto a un entrenamiento en precision completa. El impacto sobre tareas medicas, donde la precision terminologica es critica, no ha sido medido.
- Contradiccion idiomatica: el nombre indica trabajo con frances, pero la etiqueta de idioma declara unicamente ingles. No hay forma de determinar el comportamiento real en cada idioma.
- Repositorio de 0,5 GB: probablemente no contiene los 14B parametros completos. Conviene verificar la integridad de los archivos antes de planificar cualquier despliegue.
- Licencia: Apache-2.0 permite uso comercial del artefacto, pero no exime de las obligaciones de validacion clinica ni de las normativas sanitarias aplicables (por ejemplo, reglamento europeo de IA para sistemas de alto riesgo).
- Ausencia de mantenimiento: creado y actualizado con un minuto de diferencia, sin descargas ni interaccion. No hay indicios de soporte posterior.
- Sin garantias: el autor no ofrece ninguna declaracion sobre exactitud, seguridad o idoneidad para un proposito concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-TestRun-AbsQA
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos correspondian a generadores de codigos QR, sin relacion con este proyecto.
