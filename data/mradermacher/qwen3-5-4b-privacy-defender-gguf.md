# mradermacher/qwen3.5-4b-privacy-defender-GGUF

## Resumen

mradermacher/qwen3.5-4b-privacy-defender-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo oberus/qwen3.5-4b-privacy-defender. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: el trabajo original (arquitectura, datos de entrenamiento y alineamiento) corresponde al autor del modelo base, mientras que este repositorio aporta 12 variantes de cuantizacion listas para usar con llama.cpp y derivados.

El modelo base ocupa 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta etiquetado con los descriptores privacy, prompt-rewriting, dpo y sft. Es decir, esta especializado en reescritura de prompts con proteccion de privacidad, y fue ajustado mediante supervised fine-tuning y DPO sobre un modelo de la familia Qwen3.5. El unico idioma declarado es el ingles (en), y la licencia es Apache 2.0 tanto en el modelo base como en esta redistribucion.

Su relevancia practica reside en el tamano: con cuantizaciones desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), es desplegable en hardware de consumo, lo que permite ejecutar un componente de saneamiento de prompts en local en lugar de enviar datos personales a APIs externas. El repositorio no incluye model card tecnica propia, resultados de evaluacion ni detalles del dataset de entrenamiento, por lo que su comportamiento real debe validarse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del modelo base remite a la familia Qwen3.5, sin confirmacion documental) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE ni se publica desglose de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |

Datos adicionales del repositorio: el tamano total del repo es de 38,9 GB (suma de todas las cuantizaciones), la libreria declarada es transformers, la fecha de creacion registrada es 2026-09-13 y el contador publico indica 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los unicos indicios son su nombre (qwen3.5-4b), que apunta a un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4,2 mil millones de parametros, y las etiquetas del repositorio, que no mencionan componentes MoE ni arquitecturas hibridas. mradermacher documenta en su model card que las cuantizaciones son estaticas y que no hay versiones con imatrix ponderada disponibles en ese momento; tambien indica que no se incluye el fichero mmproj (skip_mmproj: 1), lo que sugiere que la conversion descarta cualquier componente multimodal del modelo original.

En cuanto al entrenamiento, las etiquetas dpo y sft confirman que el modelo base paso por fine-tuning supervisado y por optimizacion con Direct Preference Optimization, pero no se publica el numero de tokens, la composicion del dataset, el numero de pasos ni los hiperparametros. El dominio declarado (privacy, prompt-rewriting) indica que el ajuste se oriento a tareas de reescritura de prompts con proteccion de datos, presumiblemente transformando entradas que contienen informacion personal en versiones saneadas. No hay informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Reescritura de prompts orientada a privacidad: el modelo esta etiquetado explicitamente para privacy y prompt-rewriting, de modo que su funcion prevista es transformar texto de entrada antes de enviarlo a otro sistema.
- Ajuste por preferencias: el uso de DPO junto con SFT apunta a un comportamiento alineado con criterios de preservacion de datos personales, aunque no se publican evaluaciones que lo cuantifiquen.
- Generacion de texto conversacional: el repositorio incluye la etiqueta conversational y el pipeline de transformers, por lo que se espera uso en formato de dialogo con plantilla de chat.
- Compatibilidad con endpoints: el repositorio declara endpoints_compatible, lo que facilita supublicacion como endpoint gestionado.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Tool calling / function calling: no disponible; no se menciona soporte en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la documentacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la conversion descarta el fichero mmproj y no se declara ningun modo especial.

## Casos de uso

- Saneamiento de prompts antes de llamar a una API externa: el modelo se situaria como paso previo en la cadena, reescribiendo la consulta del usuario para eliminar nombres, correos, direcciones o identificadores antes de que el prompt salga de la infraestructura propia, aprovechando su tamano reducido para operar en local.
- Cumplimiento normativo en pipelines de datos (RGPD): integrado como etapa de preprocesado que transforma registros con datos personales en versiones anonimizadas antes de alimentar un sistema de analitica o de entrenamiento, con trazas de auditoria del texto original y del reescrito.
- Enmascarado de informacion en registros de soporte tecnico: al procesar tickets o conversaciones de atencion al cliente, el modelo puede reescribir el contenido del usuario preservando la intencion y sustituyendo los datos identificativos, de modo que los logs internos dejen de contener informacion sensible.
- Preprocesado de consultas en asistentes corporativos: en un asistente interno que consulta documentacion confidencial, el modelo filtra y reformula la pregunta del empleado para evitar que datos de clientes o credenciales acaben en los prompts enviados a modelos de mayor tamano.
- Filtro en aplicaciones de analisis de texto libre: en encuestas, formularios o resenas, se puede aplicar el modelo para normalizar entradas y retirar informacion personal antes de agregarlas en cuadros de mando o informes.
- Componente de investigacion en privacidad diferencial y NLP: al ser un modelo pequeno y con licencia Apache 2.0, sirve como punto de partida reproducible para estudiar tecnicas de reescritura de prompts, comparar cuantizaciones o hacer fine-tuning adicional sobre datos propios.
- Despliegue en entornos aislados o sin conectividad: las variantes Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten ejecutar el modelo en un portatil o en un equipo de borde sin GPU dedicada, algo util cuando la normativa prohibe enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de privacidad, y el modelo base no se acompana de evaluaciones en los datos proporcionados. Solo se documentan los tamanos de fichero de cada cuantizacion, que se recogen en la seccion de requisitos de hardware.

## Requisitos de hardware

Los tamanos de fichero son datos exactos de la model card; las cifras de VRAM son estimaciones que anaden margen para pesos, cache KV y overhead del runtime.

| Cuantizacion | Tamano en disco | VRAM estimada en inferencia | Notas |
|---|---|---|---|
| Q2_K | 2,0 GB | 2,5-3,0 GB | Perdida de calidad apreciable |
| Q3_K_S | 2,2 GB | 2,7-3,2 GB | Alternativa de bajo consumo |
| Q3_K_M | 2,4 GB | 2,9-3,4 GB | El autor la marca como lower quality |
| Q3_K_L | 2,5 GB | 3,0-3,5 GB | |
| IQ4_XS | 2,6 GB | 3,1-3,6 GB | Cuantizacion IQ, habitualmente preferible a otras de tamano similar |
| Q4_K_S | 2,7 GB | 3,2-3,8 GB | Marcada como fast, recommended |
| Q4_K_M | 2,8 GB | 3,3-3,9 GB | Marcada como fast, recommended |
| Q5_K_S | 3,1 GB | 3,6-4,2 GB | |
| Q5_K_M | 3,2 GB | 3,7-4,3 GB | |
| Q6_K | 3,6 GB | 4,2-4,8 GB | Marcada como very good quality |
| Q8_0 | 4,6 GB | 5,2-6,0 GB | Marcada como fast, best quality |
| f16 | 8,5 GB | 9,5-11,0 GB | 16 bits por peso, el autor lo considera overkill |

- GPU de consumo: todas las variantes hasta Q8_0 caben en tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Las opciones Q4_K_M y Q5_K_M caben incluso en GPUs de 4 GB si se limita el contexto.
- GPU profesionales: A100, H100 o L40S no aportan ventaja por capacidad de memoria, pero si por ancho de banda si se necesita alto throughput con lotes grandes.
- Ejecucion en CPU: viable en las cuantizaciones bajas (Q2_K a Q4_K_M) con 4-8 GB de RAM disponible; el f16 requiere unos 10 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y servidores compatibles con GGUF. No esta confirmado el soporte en vLLM ni en TGI para estos ficheros; la libreria declarada en el repositorio es transformers, lo que aplica al modelo base y no a los GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria. La unica comparacion posible con la informacion disponible es entre este repositorio de cuantizaciones y su modelo base.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/qwen3.5-4b-privacy-defender-GGUF | 4,2 B | GGUF (12 cuantizaciones) | No disponible | Apache 2.0 | Repositorio publico, 0 descargas registradas |
| oberus/qwen3.5-4b-privacy-defender | 4,2 B | safetensors (transformers) | No disponible | Apache 2.0 | Modelo base del que deriva esta cuantizacion |
| Otros modelos de reescritura de prompts con foco en privacidad | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni pruebas publicadas, ni en el repositorio de cuantizaciones ni en los datos del modelo base, por lo que no es posible afirmar que el comportamiento en tareas de privacidad sea fiable.
- Model card inexistente: este repositorio solo documenta el proceso de cuantizacion, no las capacidades, los limites ni los datos de entrenamiento del modelo.
- Sesgos: no documentados. Al ser un modelo ajustado predominantemente en ingles y en un dominio especifico, es probable que arrastre sesgos del corpus de ajuste, pero no hay informacion que permita concretarlos.
- Riesgo de alucinacion: no cuantificado. En tareas de reescritura, una alucinacion puede traducirse en modificar el significado del prompt o en introducir datos que el usuario no habia escrito, algo especialmente delicado en un componente de saneamiento.
- Cobertura de privacidad no verificada: no se especifica que categorias de datos personales elimina el modelo ni con que tasa de exito; usarlo como unico mecanismo de anonimizacion sin una capa de validacion adicional es arriesgado.
- Limitacion de idioma: solo se declara ingles. El uso en castellano no esta soportado oficialmente y requeriria validacion propia.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el troceado de documentos largos sin probarlo empiricamente.
- Sin versiones imatrix: el autor indica que no hay cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas.
- Descarte de componentes multimodales: la conversion omite el fichero mmproj, de modo que cualquier capacidad de vision del modelo base no esta disponible en estos GGUF.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y la licencia. Conviene verificar que el modelo base y sus datos de entrenamiento no impongan condiciones adicionales, ya que el repositorio no las detalla.
- Adopcion nula: el contador publico muestra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de fallos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3.5-4b-privacy-defender-GGUF
- Modelo base: https://huggingface.co/oberus/qwen3.5-4b-privacy-defender
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#qwen3.5-4b-privacy-defender-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones citado por el autor: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/

Nota sobre la busqueda web: los resultados devueltos corresponden a hilos de foro sin relacion con el modelo (discusiones sobre la mediateca ZDF en foros de television y de VLC). No se ha encontrado ningun paper, blog, repositorio o demo adicional asociado a este modelo.
