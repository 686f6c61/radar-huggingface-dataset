# lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01-adapter

## Resumen

Este repositorio contiene un adaptador de ajuste fino supervisado (SFT) denominado Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01-adapter, publicado por el usuario lugman-madhiai. No se trata de un modelo completo, sino de pesos de adaptador (repo de 0,1 GB) entrenados sobre el modelo base Qwen/Qwen3.5-2B, tal y como indica la model card. El ajuste se realizo con Unsloth y TRL, segun las etiquetas y la propia descripcion del autor.

El modelo base pertenece a la serie Qwen3.5 de Alibaba Cloud, una familia de 2.000 millones de parametros orientada a inferencia en dispositivo y a prototipado, con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. El nombre del adaptador sugiere un ajuste sobre un conjunto de datos de conocimiento tecnico (TauKnowledge-CS) en su particion 01, aunque no se detalla la composicion ni el volumen de dicho dataset.

Su relevancia es limitada y experimental: no hay descargas, no hay likes y no se publican resultados de evaluacion. Resulta util como ejemplo de flujo de trabajo de ajuste eficiente (LoRA/QLoRA via Unsloth) sobre un modelo pequeno, pero no como artefacto listo para produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador; modelo base Qwen3.5-2B, transformer decoder-only de la serie Qwen3.5 |
| Parametros totales | No disponible para el adaptador; el modelo base ronda los 2.000 millones de parametros |
| Parametros activos | No aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible para el adaptador; la documentacion del base recomienda un presupuesto de salida de 32.768 tokens para la mayoria de consultas |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye sin cuantizar y admite cuantizacion tras fusionarlo con el modelo base |
| Idiomas soportados | Ingles (en), segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos de adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only de 2.000 millones de parametros. No se especifican en la informacion disponible el rango del adaptador, los modulos objetivo, el alpha, el dropout ni si se aplico cuantizacion de 4 bits durante el entrenamiento (QLoRA). Las etiquetas indican el uso de Unsloth y TRL, y la model card afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, lo que apunta a un ajuste eficiente en memoria sobre el modelo congelado.

Respecto a los datos, el nombre del repositorio sugiere un ajuste supervisado sobre una particion ("Split-01") de un corpus denominado TauKnowledge-CS, presumiblemente de contenido tecnico o de informatica. No se indica el numero de tokens, la composicion del dataset, la existencia de fases de RLHF o DPO, ni ninguna innovacion tecnica adicional. El modelo base, segun la documentacion publica de la serie Qwen3.5, emplea entrenamiento con fusion temprana sobre datos multimodales y esta orientado a agentes, razonamiento y codigo, si bien no se confirma que esas capacidades se preserven intactas tras este ajuste especifico.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-2B, no verificada en este adaptador.
- Razonamiento e instrucciones: la serie Qwen3.5 declara mejoras en razonamiento y seguimiento de instrucciones frente a Qwen3, sin datos especificos para este adaptador.
- Codigo y matematicas: presumiblemente presentes por el modelo base; sin evaluacion publicada en este repositorio.
- Tool calling y function calling: no disponible; no se documenta soporte explicito en la model card del adaptador.
- Agentes y razonamiento multi-paso: la serie Qwen3.5 se posiciona hacia agentes nativos, pero no hay confirmacion para este artefacto.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible para este adaptador.
- Ajuste de dominio: el adaptador incorpora presuntamente conocimiento del dataset TauKnowledge-CS, sin especificar su alcance.

## Casos de uso

- Experimentacion con ajuste eficiente: sirve como referencia practica de un pipeline Unsloth + TRL sobre un modelo de 2.000 millones de parametros, util para reproducir la receta y comparar hiperparametros.
- Prototipado de asistentes tecnicos especializados: fusionando el adaptador con Qwen3.5-2B se puede desplegar un asistente con sesgo hacia contenidos de informatica, siempre que se valide antes la calidad real del ajuste.
- Inferencia en dispositivo o en hardware modesto: al derivar de un modelo de 2.000 millones de parametros, el resultado fusionado es candidato a ejecutarse en GPUs de gama media o en equipos con aceleracion integrada, algo coherente con el posicionamiento del base en la pagina de Qualcomm AI Hub.
- Generacion de codigo en entornos con recursos limitados: si el ajuste conserva la capacidad de codigo del base, podria emplearse en autocompletado o revision de parches en local, sin dependencia de APIs externas.
- Tuberia de retrieval-augmented generation (RAG): el modelo fusionado puede actuar como generador en un sistema RAG sobre documentacion tecnica, aprovechando un contexto que, segun la documentacion del base, admite presupuestos de salida de 32.768 tokens.
- Base para nuevos ajustes incrementales: el adaptador puede servir de punto de partida para experimentos posteriores de SFT o DPO sobre dominios mas concretos, dado su tamano reducido y su licencia permisiva.
- Educacion y material de aprendizaje: util como caso de estudio en cursos o tutoriales sobre adaptadores LoRA, publicacion en HuggingFace y entrenamiento con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se ofrecen comparativas de rendimiento frente al modelo base o a alternativas.

## Requisitos de hardware

- Naturaleza del artefacto: al ser un adaptador LoRA, no se puede ejecutar por si solo; debe fusionarse con Qwen/Qwen3.5-2B o cargarse junto al base mediante PEFT.
- VRAM estimada para el modelo fusionado: en torno a 4-5 GB en precision FP16/BF16 y aproximadamente 1,5-2,5 GB con cuantizacion de 4 bits. Son estimaciones orientativas basadas en el tamano de 2.000 millones de parametros, no cifras publicadas por el autor.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090 son suficientes para cuantizaciones de 4 u 8 bits; en FP16 es holgado cualquier GPU con 8 GB o mas. Para despliegue en servidor, A100 o H100 aportan margen para lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de GPU modernas con 8 GB o mas de VRAM cuando se cuantiza, y en torno a 6 GB en FP16.
- Opciones de despliegue: transformers con PEFT, vLLM (tras fusionar los pesos), llama.cpp/Ollama (requiere conversion a GGUF desde el modelo fusionado), TGI (etiqueta presente en el repositorio) y servidores compatibles con endpoints.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01-adapter | Adaptador sobre base de ~2B | No disponible | No publicado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible (presupuesto de salida recomendado de 32.768 tokens) | Documentado por Qwen, no replicado aqui | No disponible en la informacion recogida | HuggingFace |
| Qwen3-1.7B | ~1,7B | No disponible | Referencia de comparacion citada por Qwen | No disponible | HuggingFace |
| Qwen3-4B-2507 | ~4B | No disponible | Referencia de comparacion citada por Qwen | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparables para establecer una jerarquia fiable entre estas opciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber evaluacion, se heredan los sesgos del modelo base y los del dataset TauKnowledge-CS, ambos sin auditar.
- Riesgo de alucinacion: no cuantificado. Un ajuste SFT sobre un corpus especifico puede aumentar la confianza en dominios concretos sin garantizar veracidad factual.
- Limitacion de idioma: la model card solo declara ingles, por lo que el uso en castellano no esta soportado ni validado.
- Contexto: no se especifica la ventana de contexto efectiva tras el ajuste; conviene verificar el comportamiento en conversaciones largas antes de usarlo en produccion.
- Licencia: Apache 2.0 en el adaptador, lo que permite uso comercial; no obstante, deben respetarse las condiciones de la licencia del modelo base Qwen3.5-2B, que no se detallan en la informacion disponible.
- Estado del repositorio: cero descargas y cero valoraciones, sin historial de uso ni validacion por terceros; no es un artefacto recomendable para produccion sin evaluacion propia.
- Falta de documentacion: no hay informacion sobre hiperparametros de entrenamiento, composicion del dataset, tokens vistos ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Advertencia de integracion: al ser un adaptador, cualquier despliegue requiere fusionar pesos o cargar PEFT, lo que anade un paso adicional frente a un modelo completo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01-adapter
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio relacionado del mismo autor: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-02
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio no oficial de la serie Qwen3.5: https://github.com/wendashi/Qwen3.5
- Ficha de Qwen3.5-2B en Modal: https://modal.com/library/qwen/qwen3-5-2b
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
