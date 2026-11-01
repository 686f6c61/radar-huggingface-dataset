# edinlong83/sn92-generalist-h4

## Resumen

sn92-generalist-h4 es un fine-tune del modelo decisionmodels/reax-1.1, publicado por el usuario edinlong83 en HuggingFace. Se trata de una entrada "generalist" para la subred SN92 (REAX) de Bittensor, una red descentralizada de modelos de decisión. El modelo parte de la arquitectura y el tokenizador del base y anade un entrenamiento especifico orientado a tareas de decision estructurada: aritmetica, logica, prediccion de salida de codigo, acordes musicales, ajedrez y aplicacion de reglas, todo ello con datos generados proceduralmente y etiquetas gold calculadas.

El modelo tiene 26.085.330.160 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 26B. El repositorio ocupa 52,2 GB. La model card indica que se aplico un unico run de LoRA fusionado en los pesos, junto con una cabeza de lectura (readout head) afinada, manteniendo la misma arquitectura, tokenizador, loader y temperatura que el modelo base.

La relevancia de este modelo es acotada pero especifica: no es un modelo de proposito general al uso, sino una entrada de competicion para una subred de Bittensor centrada en decisiones verificables. Su interes tecnico radica en el enfoque de entrenamiento con datos sinteticos y gold computado, asi como en la incorporacion de auto-destilacion de abstención y etiquetado de seguridad basado en Aegis-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tag `qwen3_5`), fine-tune de decisionmodels/reax-1.1 |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base decisionmodels/reax-1.1, etiquetada como `qwen3_5` en los tags de HuggingFace, lo que sugiere una variante de la familia Qwen 3.5. La model card explicita que se mantienen sin cambios la arquitectura, el tokenizador, el loader y la temperatura respecto al base. Sobre esa base se aplico un unico run de LoRA que se fusiono en los pesos, junto con una cabeza de lectura afinada (fine-tuned readout head), lo que indica que el modelo no es un simple LoRA adapter sino un checkpoint completo con pesos fusionados.

El entrenamiento se realizo sobre items de decision generados proceduralmente con gold computado: aritmetica, logica, prediccion de salida de codigo, acordes musicales, ajedrez y aplicacion de reglas. Ademas, se incorporaron datos de etiquetado de seguridad basados en Aegis-2.0, abstención auto-destilada (self-distilled abstention) y tareas de clasificacion documento-a-categoria-oficial construidas a partir de registros publicos etiquetados: resumenes de patentes con secciones CPC (ccdv/patent-classification), disposiciones contractuales LEDGAR, areas de cuestiones del Tribunal Supremo y holdings CaseHOLD (coastalcph/lex_glue), clases de la ontologia DBpedia (fancyzhx/dbpedia_14), categorias de condiciones medicas (TimSchopf/medical_abstracts) y clasificadores de estado de desarrollo y topicos de la API JSON de PyPI. Tambien se uso el conjunto publico de entrenamiento generalist de SN92. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Razonamiento aritmetico y logico sobre items de decision con respuesta verificable.
- Prediccion de salida de codigo (code output) en el contexto de tareas de decision estructurada.
- Tareas de dominio especifico: identificacion de acordes musicales, posiciones de ajedrez y aplicacion de reglas.
- Clasificacion documento-a-categoria-oficial (patentes, contratos, jurisprudencia, ontologia DBpedia, abstracts medicos, metadatos de PyPI).
- Abstención auto-destilada: el modelo ha sido entrenado para reconocer cuando no debe responder.
- Etiquetado de seguridad alineado con Aegis-2.0.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion en la subred SN92 de Bittensor: el modelo esta disenado como entrada "generalist" para la competicion de decision de esta subred, donde se evalua su capacidad de resolver items con gold verificable.
- Clasificacion de resumenes de patentes en secciones CPC: util para pipelines de gestion de propiedad intelectual que necesiten asignar codigos CPC a documentos nuevos, aprovechando el entrenamiento sobre ccdv/patent-classification.
- Analisis de disposiciones contractuales: clasificacion de clausulas LEDGAR para revision automatizada de contratos en departamentos legales o herramientas de legaltech.
- Categorizacion de jurisprudencia: asignacion de areas de cuestion y holdings (CaseHOLD) para sistemas de recuperacion y analisis de sentencias.
- Clasificacion de abstracts medicos por condicion: apoyo a pipelines de indexacion y triaje en repositorios biomedicos.
- Enriquecimiento de metadatos de paquetes Python: clasificacion de estado de desarrollo y topicos a partir de la API JSON de PyPI para registros de paquetes o catalogos de dependencias.
- Tareas de razonamiento verificable en entornos de investigacion: ajedrez, acordes y logica como banco de pruebas para evaluar modelos de decision con gold computado.
- Moderacion con abstención: el componente de abstención auto-destilada y el etiquetado Aegis-2.0 permiten usar el modelo en escenarios donde es preferible no responder a responder de forma insegura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.085.330.160 parametros, en FP16 se requieren aproximadamente 52 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o multiples GPU de 40-48 GB; para cuantizacion 8 bits, una A100 40 GB o RTX 6000 Ada; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podria ser suficiente.
- Cabe en consumer GPU: si, en cuantizaciones de 4 bits en GPUs de 24 GB como RTX 4090 o RTX 3090; en 8 bits requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: al ser un modelo con pesos safetensors y arquitectura tipo Qwen, es compatible con vLLM, TGI y transformers; para cuantizacion en consumer, llama.cpp u Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sn92-generalist-h4 | 26,1B | no disponible | Apache-2.0 | Decision verificable, entrada SN92 |
| decisionmodels/reax-1.1 (base) | no disponible | no disponible | no disponible | Modelo de decision base |
| Qwen 3.5 (familia, referencia) | variable | no disponible | variable | Proposito general |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia; el modelo base reax-1.1 no tiene ficha de especificaciones detallada en la informacion disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: su entrenamiento esta orientado a items de decision con gold computado y clasificacion documental, por lo que su comportamiento en generacion abierta o conversacion general puede ser limitado.
- Sesgos conocidos: no documentados en la informacion disponible; los datasets de origen (patentes, contratos, jurisprudencia, abstracts medicos, PyPI) pueden introducir sesgos de dominio y de idioma.
- Riesgo de alucinacion: no cuantificado; el entrenamiento con abstención auto-destilada mitiga pero no elimina el riesgo.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; la mayor parte de los datasets citados estan en ingles, lo que sugiere un sesgo hacia ese idioma.
- Licencia Apache-2.0: permite uso comercial, pero la model card indica que se retienen los terminos upstream del modelo base, por lo que conviene revisar la licencia de decisionmodels/reax-1.1 antes de un despliegue comercial.
- El autor incluye archivos MODIFICATIONS.md y NOTICE que documentan los cambios respecto al base; es recomendable revisarlos antes de produccion.
- Modelo con muy pocas descargas (36) y sin likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- No hay informacion sobre cuantizaciones publicadas ni sobre el pipeline de inferencia recomendado.

## Enlaces

- HuggingFace: https://huggingface.co/edinlong83/sn92-generalist-h4
- Modelo base: https://huggingface.co/decisionmodels/reax-1.1
- Dataset de patentes: https://huggingface.co/datasets/ccdv/patent-classification
- Dataset lex_glue: https://huggingface.co/datasets/coastalcph/lex_glue
- Dataset DBpedia 14: https://huggingface.co/datasets/fancyzhx/dbpedia_14
- Dataset medical_abstracts: https://huggingface.co/datasets/TimSchopf/medical_abstracts
- API JSON de PyPI: https://pypi.org/pypi/
