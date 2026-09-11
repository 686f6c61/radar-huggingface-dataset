# fpadovani/nld-100mb-after-nld_uniform-ckpt500_seed10_seed10

## Resumen

`nld-100mb-after-nld_uniform-ckpt500_seed10_seed10` es un modelo de generacion de texto de tipo GPT-2 con 124.770.816 parametros, publicado por el usuario `fpadovani` en HuggingFace. Se trata de un ajuste fino (SFT, supervisado) del modelo `fpadovani/ppt-nld_uniform-100mb_seed10`, realizado con la libreria TRL de HuggingFace, segun se indica en la model card.

El nombre del modelo apunta a un artefacto de investigacion mas que a un modelo de proposito general: los sufijos `nld_uniform`, `ckpt500`, `100mb` y `seed10` son compatibles con un experimento sobre ordenacion o seleccion de datos de entrenamiento (100 MB de corpus, punto de control 500, semilla 10). El enlace de seguimiento del entrenamiento apunta al proyecto de Weights & Biases `f-padovani-university-of-groningen/white_cotterell`, lo que situa el trabajo en el entorno de investigacion de la Universidad de Groningen. No hay documentacion publica adicional que confirme esta interpretacion.

Su relevancia practica es limitada como modelo de produccion (0 descargas, 0 likes, licencia sin especificar), pero es util como referencia reproducible para estudiar el efecto de estrategias de ajuste fino sobre un modelo base pequeno, y como banco de pruebas de bajo coste para pipelines de transformers, TRL y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `gpt2` en HuggingFace); configuracion exacta no disponible |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser safetensors en precision completa, admite cuantizacion a int8 y 4 bits mediante herramientas externas |
| Idiomas soportados | No disponibles (el unico ejemplo de la model card esta en ingles) |
| Licencia | No disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tipo de modelo | Fine-tune con SFT sobre `fpadovani/ppt-nld_uniform-100mb_seed10` |
| Tamano del repositorio | 6,2 GB |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

Nota: el recuento de parametros (124.770.816) difiere ligeramente del GPT-2 small canonico (124.439.808), lo que sugiere una configuracion distinta de vocabulario o de embeddings. No se dispone del `config.json` para confirmarlo. El tamano del repositorio (6,2 GB) es muy superior al de los pesos en precision completa (~500 MB), lo que indica la presencia de otros artefactos (probablemente estados de optimizador o puntos de control adicionales).

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es la etiqueta `gpt2` y la libreria `transformers`, por lo que cabe esperar un transformer decoder de tipo autorregresivo con normalizacion previa y atencion causal. Con 124,77 millones de parametros, el modelo se situa en el rango de GPT-2 small. No se ha publicado informacion sobre el numero de capas, cabezas de atencion, dimension de embedding ni longitud de contexto, y tampoco se detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

El entrenamiento se realizo mediante ajuste fino supervisado (SFT) con TRL 0.23.0, partiendo del modelo `fpadovani/ppt-nld_uniform-100mb_seed10`. No se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El enlace a Weights & Biases asociado al entrenamiento (`runs/in778bhs`) es la unica fuente potencial de detalle sobre hiperparametros, curva de perdida y datos empleados.

## Capacidades

- Generacion de texto autorregresiva: es la unica capacidad declarada explicitamente (pipeline `text-generation`).
- Formato conversacional: la model card muestra el uso con el pipeline de `transformers` pasando una lista de mensajes con rol `user`, lo que implica que el modelo fue ajustado con una plantilla de chat (aunque la plantilla concreta no se documenta).
- Razonamiento, matematicas y generacion de codigo: no disponible; no hay evidencia publicada de estas capacidades y el tamano del modelo hace poco probable un rendimiento solido en ellas.
- Tool calling / function calling: no disponible; no se menciona soporte alguno.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el unico ejemplo publicado esta en ingles.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles.
- Integracion con text-generation-inference y endpoints compatibles: si, segun las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`).

## Casos de uso

- Reproduccion de experimentos academicos: el modelo esta pensado como artefacto de investigacion (nombre con `ckpt500`, `seed10`, `uniform`); se utilizaria para reproducir y comparar curvas de entrenamiento frente a otras semillas o estrategias de ordenacion de datos, usando el run de Weights & Biases como referencia.
- Validacion de pipelines de SFT con TRL: sirve como caso de prueba de bajo coste para verificar que un flujo completo de ajuste fino supervisado (TRL 0.23.0 + Transformers 4.56.2 + PyTorch 2.11.0) produce artefactos safetensors correctos antes de escalar a modelos mayores.
- Pruebas de integracion con text-generation-inference: al llevar las etiquetas `text-generation-inference` y `endpoints_compatible`, es adecuado para validar el despliegue de un endpoint de generacion de texto y comprobar el contrato de la API antes de mover trafico a modelos mayores.
- Prototipado en hardware de gama baja: con ~250 MB en fp16, se puede desplegar en portatiles, Raspberry Pi de gama alta o instancias CPU para experimentar con interfaces conversacionales sin coste de GPU.
- Docencia y demostraciones: permite ilustrar en clase el ciclo completo de ajuste fino supervisado, desde el modelo base hasta el modelo ajustado, con un coste de calculo minimo.
- Generacion de texto sintetico de bajo coste para tareas auxiliares (por ejemplo, preprocesado de datos, generacion de plantillas o aumentacion de corpus) donde no se requiere calidad alta pero si un coste de inferencia despreciable.
- Ablaciones controladas de tecnicas de decodificacion (temperatura, top-p, top-k) sobre un modelo pequeno, para trasladar despues las conclusiones a modelos de mayor tamano.
- Investigacion sobre sesgos y comportamiento de modelos entrenados con corpus pequenos (100 MB), dado que el modelo base parece derivar de un corpus reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~500 MB en fp32, ~250 MB en fp16/bf16, ~125 MB en int8 y ~70 MB en cuantizacion de 4 bits. A ello hay que sumar el coste del cache KV, que depende de la longitud de contexto y del batch (no disponible).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 o H100 funcionan sin problema; las GPU de centro de datos estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU y en Apple Silicon mediante MPS.
- Opciones de despliegue: pipeline de `transformers`, text-generation-inference (TGI) y endpoints compatibles (etiquetas declaradas por el autor), vLLM, Ollama, llama.cpp o text-generation-webui. Para llama.cpp y Ollama seria necesaria una conversion previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni en la model card ni en la informacion proporcionada.

## Comparativa con modelos similares

Los valores de los modelos de referencia proceden de informacion publica de sus respectivos repositorios; los del modelo descrito, de lo indicado arriba. No hay datos de rendimiento de este modelo para comparar calidad.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fpadovani/nld-100mb-after-nld_uniform-ckpt500_seed10_seed10` | 124.770.816 | No disponible | No disponible | Fine-tune SFT sobre un modelo base de investigacion; 0 descargas |
| GPT-2 (124M, OpenAI) | 124.439.808 | 1.024 tokens | Licencia MIT modificada | Referencia de la misma familia arquitectonica; ampliamente disponible |
| DistilGPT-2 | 82.000.000 (aprox.) | 1.024 tokens | Apache 2.0 | Version destilada, mas rapida y de menor calidad |
| Pythia-160M (EleutherAI) | 162.000.000 (aprox.) | 2.048 tokens | Apache 2.0 | Suite de investigacion con puntos de control intermedios y semillas multiples |

La ventaja comparativa de este modelo frente a las alternativas es la trazabilidad del experimento (semilla fija, punto de control documentado y registro en Weights & Biases), no su rendimiento ni su soporte.

## Limitaciones y advertencias

- Sesgos conocidos: no hay evaluacion publicada de sesgos. Al derivar de un corpus de entrenamiento reducido (100 MB segun el nombre del modelo base), es esperable un sesgo de dominio y de idioma, pero no esta cuantificado.
- Riesgo de alucinacion: alto, tanto por el tamano del modelo (124,77 M de parametros) como por la ausencia de alineacion documentada mas alla del SFT.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y no hay idiomas declarados; el unico ejemplo publicado esta en ingles. No debe asumirse soporte fiable del castellano.
- Restricciones de licencia: la licencia es "no disponible". El campo de la model card contiene el marcador `licence: license`, sin concretar. No debe utilizarse en produccion ni en contextos comerciales sin aclarar antes la licencia con el autor, especialmente por la dependencia del modelo base y de los datos de entrenamiento.
- Ausencia de datos de evaluacion: no hay benchmarks, no hay evaluacion de calidad, no hay informes de seguridad. Cualquier uso en produccion requeriria una evaluacion propia.
- Riesgo de sobreajuste: un ajuste fino SFT sobre un modelo base pequeno entrenado con 100 MB de datos puede producir respuestas degeneradas, repeticiones o colapso de modo. No hay informacion sobre el dataset de SFT ni sobre su diversidad.
- Modelo practicamente sin uso: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Metadatos incompletos: faltan `config.json` publico referenciado en la documentacion, plantilla de chat documentada e hiperparametros de entrenamiento en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-nld_uniform-ckpt500_seed10_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_uniform-100mb_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/in778bhs
- Repositorio de TRL: https://github.com/huggingface/trl
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (corresponden a la funcion QUERY de Google Sheets). No se han encontrado papers, blogs, repositorios ni demos adicionales: no disponible.
