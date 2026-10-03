# DedeProGames/cosmo.0

## Resumen

cosmo.0 es un modelo de lenguaje de arquitectura Llama desarrollado por el usuario DedeProGames y publicado en HuggingFace bajo el identificador `DedeProGames/cosmo.0`. Con 34.611.712 parametros (34,6 M), se situa en la categoria de modelos extremadamente pequenos, muy por debajo de los modelos compactos habituales (0,5 B - 1 B). Su objetivo declarado es la generacion de texto conversacional, y se distribuye unicamente en formato safetensors.

El modelo fue entrenado sobre 5.000 millones de tokens extraidos de los corpus FineWeb-Edu y DCLM-Edu, dos datasets de texto educativo filtrado ampliamente usados en la comunidad open source para entrenar modelos de lenguaje desde cero. La model card no documenta la longitud de contexto, los idiomas soportados, la licencia ni el proceso de alineacion (RLHF/DPO), por lo que buena parte de las especificaciones habituales quedan sin confirmar.

La relevancia de este modelo es limitada y de nicho: con 0,1 GB de repositorio y 34,6 M de parametros, es un candidato para experimentacion academica, pruebas de pipelines de entrenamiento, docencia sobre arquitecturas transformer y despliegues en hardware extremadamente restringido (microcontroladores, CPU embebida). No dispone de descargas registradas y cuenta con un unico "like" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 34.611.712 (34,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; al ser safetensors de arquitectura Llama es convertible a GGUF con llama.cpp, pero el autor no publica cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es Llama, es decir, un transformer decoder-only con atencion causal, normalizacion RMSNorm y probablemente RoPE para codificacion posicional, aunque la model card no entra en detalles sobre la configuracion de capas, cabezas de atencion, dimension oculta ni tamano de vocabulario. Con 34,6 M de parametros, el modelo es aproximadamente 30 veces mas pequeno que TinyLlama-1.1B y 4 veces mas pequeno que SmolLM-135M.

El entrenamiento se realizo sobre 5.000 millones de tokens procedentes de FineWeb-Edu y DCLM-Edu, dos corpus de contenido educativo filtrado por heuristicas de calidad. Esto da una ratio de aproximadamente 144 tokens por parametro, una cifra alta que sugiere un regimen de entrenamiento cercano al compute-optimal o incluso por encima, adecuado para un modelo de este tamano. No hay informacion sobre el numero de epochs, la composicion exacta de la mezcla entre ambos datasets, la estrategia de tokenizacion ni si se aplicaron fases de ajuste supervisado, RLHF, DPO o cualquier otra tecnica de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto autoregresivo basico: el pipeline declarado es `text-generation`.
- Perfil conversacional: la etiqueta `conversational` aparece entre los tags del repositorio, lo que sugiere cierto ajuste orientado a dialogo, aunque no se documenta el dataset de instrucciones utilizado.
- Generacion condicionada por prompt: capacidad estandar de un modelo causal, sin garantias de calidad en tareas de razonamiento.
- Razonamiento multi-paso: no documentado; con 34,6 M de parametros, la capacidad esperable es muy limitada.
- Generacion de codigo: no documentada.
- Matematicas: no documentada.
- Tool calling / function calling: no documentado; no hay plantilla de chat ni formato de herramientas publicado.
- Soporte de agentes: no documentado.
- Capacidades multilingues: no disponibles; el autor no especifica idiomas.
- Vision, audio o modalidades adicionales: no soportadas (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Docencia sobre entrenamiento de LLM: el modelo sirve como ejemplo reproducible de un pipeline de entrenamiento desde cero sobre FineWeb-Edu y DCLM-Edu, util en cursos de NLP para ilustrar tokenizacion, escalado de parametros y evaluacion de modelos pequenos.
- Pruebas de infraestructura de inferencia: por su tamano (0,1 GB), es practico para validar despliegues de vLLM, TGI, llama.cpp u Ollama sin consumir recursos significativos, antes de escalar a modelos mayores.
- Experimentos de destilacion: puede actuar como alumno en un esquema de knowledge distillation desde un modelo profesor mucho mayor, dado su bajo coste de inferencia.
- Investigacion sobre leyes de escalado: permite replicar curvas de perdida frente a tokens de entrenamiento en el rango de decenas de millones de parametros.
- Generacion de texto en dispositivos embebidos: con pesos en fp32 de aproximadamente 138 MB (o menos con cuantizacion int8/int4), es viable en SoC de bajo consumo o microcontroladores con memoria suficiente, para tareas de autocompletado o generacion corta sin conexion.
- Filtrado o etiquetado ligero de texto en pipelines de datos: un modelo de este tamano puede usarse como clasificador generativo de bajo coste para prefiltrar corpus antes de un modelo mayor.
- Pruebas de regresion en plataformas MLOps: util como modelo "canario" para verificar que un sistema de serving funciona correctamente de extremo a extremo.
- Generacion de texto creativo muy acotada: prompts cortos de poesia, esloganes o titulares, asumiendo calidad limitada y necesidad de revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag, ARC, WinoGrande ni de ningun otro conjunto de evaluacion estandar, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para los pesos (solo modelo, sin cache de atencion ni overhead del runtime):
  - fp32: aproximadamente 138 MB.
  - fp16/bf16: aproximadamente 69 MB.
  - int8: aproximadamente 35 MB.
  - int4: aproximadamente 17 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en GPUs integradas modernas y en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en hardware muy antiguo.
- Opciones de despliegue: transformers (PyTorch), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM y TGI para serving HTTP. El autor no publica cuantizaciones GGUF ni plantilla de chat especifica.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en una GPU moderna la generacion deberia superar con holgura los cientos de tokens por segundo, pero no hay mediciones publicadas.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cosmo.0 (DedeProGames) | 34,6 M | no disponible | no disponible | HuggingFace, safetensors |
| Pythia-70M (EleutherAI) | 70 M | 2048 tokens | Apache 2.0 | HuggingFace, safetensors |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF |
| TinyLlama-1.1B (TinyLlama) | 1,1 B | 2048 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF |

No hay datos de benchmarks publicados para cosmo.0, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con estas alternativas. En terminos de tamano, cosmo.0 es aproximadamente la mitad que Pythia-70M, cuatro veces menor que SmolLM-135M y treinta y dos veces menor que TinyLlama-1.1B.

## Limitaciones y advertencias

- Tamano muy reducido: con 34,6 M de parametros, la capacidad para tareas complejas es muy limitada; el propio autor lo advierte en la model card.
- Riesgo elevado de alucinacion: los modelos de este tamano generan con frecuencia texto plausible pero factualmente incorrecto.
- Sesgos conocidos: no documentados por el autor. Los corpus FineWeb-Edu y DCLM-Edu heredan los sesgos presentes en datos web filtrados, especialmente en representacion de genero, origen etnico y perspectivas culturales.
- Limitaciones de contexto: la longitud maxima de contexto no esta publicada, lo que impide garantizar el comportamiento en conversaciones multi-turno largas.
- Idiomas soportados: no especificados; se desconoce si el modelo tiene capacidad multilingue real o si esta limitado al ingles de los corpus de entrenamiento.
- Licencia: no disponible. Esto es un bloqueo critico para uso comercial, ya que no se puede verificar si existe permiso explicito de uso, redistribucion o modificacion. En ausencia de licencia explicita, se aplican por defecto las restricciones de derechos de autor.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni GPTQ/AWQ publicados por el autor, por lo que cualquier despliegue optimizado requiere conversion manual.
- Ausencia de plantilla de chat: no se documenta un formato de prompt recomendado, lo que puede degradar la calidad en usos conversacionales.
- Repositorio sin mantenimiento verificable: creado y actualizado el mismo dia (2026-10-03), sin descargas registradas y con un unico "like"; no hay evidencia de soporte continuado.
- Falta de benchmarks: no hay ninguna evaluacion publicada, por lo que no es posible conocer su rendimiento real antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeProGames/cosmo.0
- FineWeb-Edu (dataset de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- DCLM-Edu (dataset de entrenamiento): https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
