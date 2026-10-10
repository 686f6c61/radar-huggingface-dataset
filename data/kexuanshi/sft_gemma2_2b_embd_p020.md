# KexuanShi/sft_gemma2_2b_embd_p020

## Resumen

`sft_gemma2_2b_embd_p020` es un ajuste fino por supervisión (SFT) publicado por el usuario KexuanShi en HuggingFace. El identificador y la etiqueta `gemma2` de los tags indican que parte de un modelo de la familia Gemma 2, concretamente de la variante de 2B de parametros, si bien el autor no declara explicitamente cual es el modelo base: la model card contiene un enlace roto al repositorio base (`https://huggingface.co/None`). El modelo se ha entrenado con la libreria TRL (version 1.13.0) y esta orientado a generacion de texto.

El unico dato cuantitativo fiable que aporta el repositorio es el numero de parametros reales, 2.614.341.888 (unos 2,61 mil millones), extraido de los pesos en formato safetensors, y un tamano de repositorio de 26,2 GB. La model card es practicamente un esqueleto autogenerado por TRL: no incluye descripcion del dataset de entrenamiento, hiperparametros, licencia, idiomas soportados ni resultados de evaluacion. El sufijo `embd_p020` del nombre sugiere algun tipo de configuracion o ablacion en la parte de embeddings, pero su significado no se documenta en ningun sitio del repositorio.

Por todo ello, la ficha debe leerse como una descripcion estructural del artefacto y no como una evaluacion de capacidades. El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y su fecha de creacion indicada en el repositorio es el 10 de octubre de 2026, lo que apunta a un experimento de investigacion o a un artefacto de trabajo interno antes que a un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, segun tags y nombre); detalles no declarados por el autor |
| Parametros totales | 2.614.341.888 (2,61 mil millones), dato real de safetensors |
| Parametros activos | No aplica: no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible (no declarada en la model card ni en la configuracion publicada) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido util) |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers (pipeline `text-generation`) |
| Metodo de entrenamiento | SFT con TRL 1.13.0 |
| Version de transformers de referencia | 5.17.0 |
| Tamano del repositorio | 26,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la model card. Los tags (`gemma2`, `text-generation`) y el nombre del repositorio apuntan a un transformer decoder-only derivado de Gemma 2 2B, pero el autor no especifica la variante exacta, la configuracion de atencion, el vocabulario ni la ventana de contexto efectiva. Cualquier afirmacion mas concreta sobre atencion local/global alternada, soft-capping de logits o atencion con consultas agrupadas (GQA) seria una extrapolacion a partir del modelo base y no un dato confirmado en este repositorio.

En cuanto al entrenamiento, la unica informacion disponible es que se ha realizado un ajuste supervisado (SFT) mediante TRL. No se publican el dataset, el numero de tokens, la composicion de los datos, la duracion del entrenamiento ni si hubo fases posteriores de alineacion (RLHF, DPO, RLVR). Las versiones de framework declaradas (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.23.2) corresponden a un entorno muy reciente y no aportan informacion sobre el procedimiento mas alla de confirmar el uso de la pila de HuggingFace. El tamano del repositorio, 26,2 GB frente a los aproximadamente 5,2 GB que ocuparian 2,61 mil millones de parametros en bfloat16, sugiere la presencia de checkpoints intermedios, estados del optimizador o copias adicionales de pesos, aunque esto es una observacion sobre el almacenamiento y no un dato declarado.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada explicitamente por el pipeline del repositorio (`text-generation`).
- Conversacion multi-turno: el ejemplo de la model card usa el formato de mensajes con rol de usuario, lo que indica que el modelo espera una plantilla conversacional, aunque no se documenta cual.
- Razonamiento, matematicas y generacion de codigo: no disponible; no hay evaluaciones ni declaraciones que lo confirmen o desmientan.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni formato de llamadas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo de pensamiento explicito, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

Dado que no existen evaluaciones publicadas ni documentacion sobre el entrenamiento, los siguientes escenarios deben considerarse hipotesis de trabajo a validar internamente antes de cualquier uso real:

- Experimentacion academica con SFT: el modelo sirve como artefacto reproducible para estudiar como afecta una receta de ajuste supervisado concreta (el sufijo `embd_p020`) al comportamiento de un modelo de ~2,6B de parametros.
- Prototipado rapido en local: con 2,61 mil millones de parametros, el modelo se puede cargar en una GPU de gama media o incluso en CPU con cuantizacion, lo que permite iterar en cuadernos de Jupyter sin coste de API.
- Generacion de texto generica en tareas de bajo riesgo: resumenes, reescritura o continuacion de texto donde los errores se revisan antes de publicarse.
- Base para nuevos ajustes especificos de dominio: al ser un checkpoint ya ajustado con SFT, puede emplearse como punto de partida para LoRA o SFT adicional sobre datos propios, siempre que la licencia final lo permita (actualmente sin determinar).
- Evaluacion comparativa de tecnicas de ajuste: util como linea base para medir el efecto de distintas proporciones de parametros entrenados o de tecnicas de congelacion parcial.
- Generacion de respuestas conversacionales en un chatbot de demostracion: el formato de mensajes del ejemplo de la model card permite integrarlo en una interfaz de chat sencilla, con la advertencia de que no hay datos de calidad ni de seguridad.
- No se recomienda su uso en produccion con usuarios finales, en dominios regulados ni en tareas que requieran exactitud factual, dado que no hay benchmarks ni informacion sobre sesgos o alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y no se proporcionan curvas de perdida ni metricas de validacion del entrenamiento.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de 2.614.341.888 parametros: aproximadamente 5,2 GB en bfloat16 o float16, 10,5 GB en float32, 2,6 GB en cuantizacion de 8 bits y 1,3 GB en cuantizacion de 4 bits.
- A esa cifra hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva, el numero de capas y el batch; ninguno de esos valores se documenta en el repositorio, por lo que no se puede dar una cifra cerrada.
- GPU recomendadas: para inferencia en precision completa, una GPU con 8-12 GB de VRAM es suficiente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para entrenamiento o ajuste fino completo conviene una A100, H100 o L40S; para LoRA basta con una RTX 3090 o 4090.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en cuantizacion de 8 o 4 bits, y en tarjetas con 12 GB o mas en bfloat16.
- Opciones de despliegue: transformers es la via declarada. Al publicarse en safetensors y con `endpoints_compatible` y `text-generation-inference` entre los tags, tambien es compatible con TGI y con HuggingFace Inference Endpoints. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token. El tamano del repositorio (26,2 GB) implica ademas una descarga inicial considerable si se quieren todos los ficheros.

## Comparativa con modelos similares

No hay resultados de evaluacion de este ajuste, por lo que la comparacion es estrictamente estructural y de licencia. Los datos de los modelos alternativos corresponden a sus model cards publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_gemma2_2b_embd_p020 (este modelo) | 2,61 mil millones | no disponible | no disponible | safetensors, transformers |
| Gemma 2 2B (modelo base presumible) | 2,61 mil millones | 8.192 tokens (segun su model card) | Gemma Terms of Use | safetensors, GGUF, Ollama, vLLM |
| Qwen2.5-1.5B | 1,54 mil millones | 32.768 tokens | Apache-2.0 | safetensors, GGUF, amplio soporte |
| Llama 3.2 1B Instruct | 1,23 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, amplio soporte |
| Phi-3-mini | 3,8 mil millones | 4.096 tokens por defecto (128.000 con LongRoPE) | MIT | safetensors, GGUF, ONNX |

La ventaja diferencial de este repositorio frente a esas alternativas no puede establecerse: carece de licencia declarada, de soporte de cuantizacion publicado y de cualquier metrica de calidad. Como modelo de investigacion es accesible, pero como opcion de despliegue queda por detras de cualquiera de los modelos citados, que documentan licencia, contexto y formatos alternativos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de validacion, ni analisis cualitativo. No se puede afirmar nada sobre su calidad relativa.
- Riesgo de alucinacion: desconocido pero presumiblemente alto para un ajuste SFT sin fase de alineacion documentada; no se ha aplicado, segun la informacion disponible, ninguna tecnica declarada de mitigacion.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos de genero, raza, idioma o ideologia. Al heredar el modelo base, es probable que arrastre los sesgos de este, pero no hay datos que lo confirmen.
- Limitaciones de idioma: no se declara ningun idioma soportado. No hay garantia de buen rendimiento en castellano ni en ninguna otra lengua concreta.
- Limite de contexto: la ventana de contexto efectiva no esta documentada; usarlo con entradas largas puede provocar truncamientos silenciosos o degradacion.
- Licencia sin determinar: la model card incluye `licence: license` sin contenido, lo que impide conocer las condiciones de uso comercial. Aunque el modelo base fuese Gemma 2, sujeto a los Gemma Terms of Use, este ajuste no declara nada al respecto. No debe utilizarse en produccion ni redistribuirse sin aclarar antes la licencia con el autor.
- Model card incompleta y con errores: el enlace al modelo base apunta a `https://huggingface.co/None`, y las secciones de procedimiento de entrenamiento estan vacias. Esto dificulta la reproducibilidad.
- Tamano del repositorio desproporcionado: 26,2 GB para un modelo de ~2,6B de parametros sugiere checkpoints o estados del optimizador adicionales, lo que encarece el almacenamiento y la descarga.
- Cero adopcion: sin descargas ni likes, no existe una comunidad que haya validado el comportamiento del modelo ni reportado fallos.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, de modo que el despliegue eficiente exige conversion propia y su validacion posterior.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_embd_p020
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
- Documentacion de TRL: https://huggingface.co/docs/trl
- Referencia del modelo base presumible, Gemma 2 2B (no confirmada por el autor): https://huggingface.co/google/gemma-2-2b
- Terminos de uso de Gemma (aplicables solo si se confirma la ascendencia Gemma, no declarada en este repositorio): https://ai.google.dev/gemma/terms
- No se han encontrado articulos, blogs, demos ni papers asociados a este modelo en la informacion disponible.
