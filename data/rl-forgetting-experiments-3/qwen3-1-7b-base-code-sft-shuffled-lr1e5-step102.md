# RL-Forgetting-Experiments-3/qwen3-1.7b-base-code-sft-shuffled-lr1e5-step102

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) sobre `Qwen/Qwen3-1.7B-Base`, publicado por el usuario `RL-Forgetting-Experiments-3`. Segun su model card, se trata del modelo final "listo para inferencia" del experimento `q3_1p7b_sft_shuffled`, correspondiente al paso 102 del optimizador. El entrenamiento utilizo el conjunto `qwen3_1p7b_s500_code_sft_data`, con orden de ejemplos "shuffled", estrategia de replay "none" y lambda de replay 0.0, lo que lo situa en la categoria de experimentos sobre olvido catastrofico durante el ajuste.

El modelo es un transformer decoder denso de la familia Qwen3, con 1.720.574.976 parametros (aproximadamente 1,7 mil millones) segun los pesos en safetensors, y un tamano de repositorio de 6,9 GB. La model card no especifica licencia, idiomas, longitud de contexto ni tipos de cuantizacion, y el autor remite a un `delivery_manifest.json` para la trazabilidad y sumas de verificacion de los ficheros. No se han publicado resultados de benchmarks.

Su relevancia es fundamentalmente metodologica: es un punto de control intermedio (paso 102, learning rate 1e-5) de un estudio sobre perdida de capacidades al especializar un modelo base en codigo, no un modelo listo para produccion. Con cero descargas y cero "likes" en el momento de la consulta, debe tratarse como artefacto de investigacion reproducible mas que como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, familia Qwen3 (derivado de Qwen/Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 (aprox. 1,7 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; heredada del modelo base |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible; los datos de SFT son de codigo (etiqueta mbpp) |
| Licencia | no disponible (ni la model card ni los metadatos la especifican) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 6,9 GB |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Tipo de ajuste | SFT supervisado, paso 102 del optimizador, learning rate 1e-5 |
| Dataset de entrenamiento | qwen3_1p7b_s500_code_sft_data (orden shuffled, sin replay) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-1.7B-Base`: un transformer decoder denso con atencion causal, tokenizador propio de la familia Qwen3 y pesos en safetensors compatibles con la libreria `transformers`. No se ha modificado la topologia: el experimento consiste exclusivamente en un ajuste supervisado adicional sobre el checkpoint preentrenado, por lo que no hay mezcla de expertos, atencion lineal ni mecanismos hibridos.

En cuanto al entrenamiento, la model card indica que se uso el conjunto `qwen3_1p7b_s500_code_sft_data` con los ejemplos en orden aleatorio (shuffled) y sin ninguna estrategia de replay (replay strategy none, lambda 0.0). El checkpoint publicado corresponde al paso 102 con un learning rate de 1e-5. La ausencia de replay es precisamente la variable experimental relevante en un estudio de olvido: al no reintroducir datos generales, se maximiza el desplazamiento de los pesos hacia la distribucion de codigo. No se documentan tecnicas de alineacion adicionales como RLHF, DPO o decodificacion especulativa, ni el numero total de tokens de entrenamiento, la composicion exacta del dataset o si los pesos se congelaron parcialmente.

## Capacidades

- Generacion de texto y de codigo en formato conversacional (etiqueta `conversational` y pipeline `text-generation`).
- Resolucion de problemas de programacion del estilo MBPP, segun la etiqueta `mbpp` del repositorio y el nombre del dataset de SFT.
- Ajuste fino supervisado sobre instrucciones de codigo, presumiblemente pares prompt-respuesta de programacion.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (`endpoints_compatible`), lo que permite desplegarlo tras una API estilo OpenAI.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo "thinking", vision o audio: no disponible.
- Capacidades generales fuera del codigo: potencialmente degradadas por el diseno del experimento (SFT sin replay), aunque no se aportan mediciones.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint permite reproducir el paso 102 de un experimento de SFT sin replay sobre Qwen3-1.7B-Base y compararlo con otros pasos o con variantes con replay para cuantificar la degradacion de capacidades generales.
- Autocompletado de codigo en local: al ser un modelo de 1,7 B de parametros, puede ejecutarse en una GPU de consumo y ofrecer latencia baja para sugerencias de linea o bloque dentro de un IDE, siempre que se valide antes su calidad real.
- Generacion de fragmentos de codigo y funciones pequenas: util como generador de borradores en tareas tipo MBPP o scripts cortos, con revision humana posterior.
- Generacion de documentacion y docstrings: el modelo puede describir funciones y traducir codigo a lenguaje natural, una tarea de baja critica donde los errores son faciles de detectar.
- Prototipado de asistentes de codigo autoalojados: desplegable con `transformers` o TGI en una unica GPU para demostraciones internas y pruebas de concepto sin coste de API.
- Banco de pruebas de pipelines de SFT: sirve como entrada controlada para validar herramientas de evaluacion, plantillas de chat, cuantizacion y despliegue antes de aplicarlas a modelos mayores.
- Generacion de datos sinteticos de programacion a pequena escala: puede producir pares pregunta-respuesta de codigo para prefiltrar o aumentar datasets, asumiendo que la calidad de un modelo de 1,7 B es limitada y requiere filtrado posterior.
- Analisis comparativo de checkpoints: al estar etiquetado por paso de optimizador, permite estudiar la evolucion de las capacidades de codigo frente a las generales a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion, y tampoco se aportan curvas de perdida o comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB solo para pesos en bf16/fp16 (1,72 B de parametros), a los que hay que sumar cache KV y activaciones; en la practica, entre 5 y 8 GB para contextos moderados y lotes pequenos.
- Cuantizacion a 8 bits: en torno a 1,8-2 GB de pesos. Cuantizacion a 4 bits: en torno a 1,0-1,2 GB de pesos. No se distribuyen ficheros GGUF ni cuantizados en el repositorio, por lo que habria que generarlos.
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien puede ejecutarse en A100, H100 o L40S, aunque estan sobredimensionadas para este tamano.
- Despliegue: la etiqueta `text-generation-inference` y `endpoints_compatible` indican soporte previsto para TGI y API compatible con endpoints. Tambien es viable con `transformers` directamente y con vLLM para servido con batching. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no incluido en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones de tokens por segundo ni de latencia.
- Nota de almacenamiento: el repositorio ocupa 6,9 GB, muy por encima de los pesos en bf16, lo que sugiere que incluye ficheros adicionales (por ejemplo, estados de optimizador o artefactos del manifiesto de entrega).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (qwen3-1.7b-base-code-sft-shuffled-lr1e5-step102) | 1,7 B | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B-Base | 1,7 B | no disponible en la informacion proporcionada | sin datos en esta busqueda | Apache-2.0 segun la ficha oficial del modelo base | HuggingFace, ampliamente usado |
| Modelos de codigo de ~1,5 B de otras familias (por ejemplo Qwen2.5-Coder-1.5B) | ~1,5 B | no disponible en la informacion proporcionada | no comparable con datos de esta busqueda | no verificada en la informacion proporcionada | HuggingFace |

La comparacion relevante es directa con el modelo base: este checkpoint anade un ajuste supervisado de codigo sin replay, por lo que la diferencia esperada es una mejora en tareas de programacion del dominio de SFT y una posible perdida en capacidades generales. No hay datos publicados que permitan cuantificar ese intercambio.

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explicita no hay autorizacion clara de uso comercial, redistribucion ni obras derivadas. Debe asumirse uso restringido a investigacion hasta que el autor la declare.
- Riesgo alto de olvido catastrofico: la estrategia de replay "none" con lambda 0.0 implica que no se reintrodujeron datos generales durante el SFT, lo que favorece la degradacion de capacidades ajenas al codigo.
- Posible contaminacion de evaluacion: la etiqueta `mbpp` y el nombre del dataset de SFT sugieren entrenamiento sobre datos derivados de MBPP; cualquier evaluacion en ese benchmark seria poco informativa.
- Ausencia de alineacion: no se documenta RLHF, DPO ni filtrado de seguridad, por lo que la generacion de codigo inseguro o de contenido inapropiado no esta mitigada.
- Idiomas no declarados: los metadatos no listan idiomas soportados; el ajuste se realizo sobre codigo, tipicamente con instrucciones en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no especificada: al no documentarse, no puede planificarse su uso en tareas que requieran ventanas largas sin verificacion empirica previa.
- Riesgo de alucinacion: como cualquier modelo de 1,7 B, puede inventar APIs, funciones de libreria o firmas inexistentes; el codigo generado debe pasar revision y pruebas automatizadas.
- Estado del checkpoint: es un punto intermedio (paso 102) de un experimento, no una version final validada; el propio nombre del repositorio indica que forma parte de una serie de experimentos.
- Sin validacion de la comunidad: cero descargas y cero "likes" implican ausencia de verificacion externa sobre su comportamiento real.
- Trazabilidad incompleta en la model card: se remite a `delivery_manifest.json` para linaje y sumas de verificacion, pero no se detallan hiperparametros completos, tokens vistos ni composicion del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen3-1.7b-base-code-sft-shuffled-lr1e5-step102
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre el videojuego Rocket League y prensa regional francesa), por lo que no se incluyen como enlaces relevantes. No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint en la informacion disponible.
