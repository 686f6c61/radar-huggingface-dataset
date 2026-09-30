# francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407` es un ajuste fino supervisado (SFT) del checkpoint `goldfish-models/hin_deva_10mb`, un modelo de la familia Goldfish orientado a texto en hindi con escritura devanagari. Lo publica el usuario `francesca9805` y se distribuye a traves de HuggingFace con la libreria `transformers` y pesos en formato safetensors.

Se trata de un modelo muy pequeno: 39.087.104 parametros en total, con una arquitectura GPT-2 segun las etiquetas del repositorio. El entrenamiento se ha realizado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121, y el identificador del modelo sugiere el uso de un dataset empaquetado de 100 MB, una variante prefijada como "bfdiso" y la semilla 3407. El repositorio ocupa 0,1 GB y registra 0 descargas y 0 likes en el momento de redactar esta ficha.

La relevancia de este checkpoint es acotada y experimental: no es un modelo de proposito general, sino una pieza de investigacion dentro de una bateria de experimentos con distintas combinaciones de tamano de dataset, semillas y tecnicas de entrenamiento. Resulta util para reproducir experimentos de ajuste fino a muy baja escala, estudiar el efecto de la semilla o comparar variantes de un mismo pipeline de SFT, pero no esta pensado para despliegues en produccion ni para tareas que exijan razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (segun etiquetas del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible; el identificador del modelo base, `hin_deva`, sugiere hindi en escritura devanagari |
| Licencia | no disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/hin_deva_10mb |
| Metodo de entrenamiento | SFT con TRL |
| Version de TRL | 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.5.1+cu121 |
| Version de Datasets | 4.8.4 |
| Version de Tokenizers | 0.22.1 |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer causal decoder-only con atencion completa, segun las etiquetas declaradas en el repositorio (`gpt2`, `text-generation`). Con 39.087.104 parametros, se situa en el rango de los GPT-2 pequenos; no hay informacion publicada sobre el numero de capas, dimension del modelo, numero de cabezas de atencion ni tamano del vocabulario. Tampoco se especifica la longitud de contexto maxima soportada por el tokenizador o la configuracion final.

El entrenamiento se ha realizado mediante ajuste fino supervisado (SFT) usando la libreria TRL, partiendo del checkpoint `goldfish-models/hin_deva_10mb`. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases posteriores de RLHF, DPO u optimizacion por preferencias; solo indica que se uso SFT. El identificador del modelo apunta a un dataset empaquetado de 100 MB (`100mb-packed`), a una variante etiquetada como `bfdiso` y a la semilla `3407`, pero no se aporta ninguna descripcion tecnica de que implica cada uno de esos terminos. Existe un registro del entrenamiento en Weights & Biases, enlazado desde la model card, bajo el proyecto `f-padovani-university-of-groningen/new-tokenizers`.

## Capacidades

- Generacion de texto: es la unica capacidad declarada explicitamente mediante el pipeline `text-generation`.
- Conversacion por turnos: el ejemplo de la model card invoca el pipeline pasando una lista de mensajes con el rol `user`, lo que indica que el tokenizador o la plantilla de chat aceptan ese formato.
- Idiomas: no se declaran idiomas soportados en la ficha; el modelo base pertenece a una coleccion por idioma (prefijo `hin_deva`), por lo que cabe esperar competencia limitada fuera del hindi en devanagari.
- Tool calling / function calling: no disponible, no se menciona soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible, no se menciona soporte.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.
- Razonamiento matematico o generacion de codigo: no disponible, no hay evidencia ni evaluacion publicada.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el checkpoint forma parte de una serie de variantes generadas con distintas semillas y tamanos de dataset, por lo que sirve para replicar resultados y medir la varianza introducida por la semilla 3407 dentro de un pipeline de SFT con TRL.
- Investigacion sobre modelos de lengua de muy baja escala: con 39 M de parametros, es adecuado para estudiar limites de capacidad en tareas de modelado de lenguaje en hindi con recursos de computo minimos.
- Pruebas de tokenizadores para devanagari: el proyecto de Weights & Biases asociado se llama `new-tokenizers`, lo que sugiere que estos checkpoints se usan para evaluar como distintos tokenizadores afectan a la calidad de generacion en hindi.
- Generacion de texto exploratoria en hindi: puede emplearse como generador de borradores muy basicos o para completar frases cortas, siempre con revision humana y asumiendo baja calidad.
- Docencia y formacion: sirve como ejemplo minimo y ejecutable de un pipeline completo de SFT con TRL, desde el modelo base hasta el checkpoint final, ejecutable incluso en CPU.
- Pruebas de integracion de infraestructura: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es util para validar despliegues de TGI, endpoints de HuggingFace o plataformas como FriendliAI con un modelo de carga instantanea.
- Pruebas unitarias en pipelines de NLP: por su tamano (menos de 1 GB), se puede usar como modelo de juguete en tests automatizados de sistemas de generacion de texto sin consumir GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (aproximadamente 156 MB solo para los pesos) y en torno a 80 MB en FP16; el consumo real depende de la longitud de la secuencia de entrada y del tamano del cache KV, que no esta documentado.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en tarjetas de gama de entrada como GTX 1650, RTX 3050 o inferiores. No requiere A100, H100 ni RTX 4090.
- Inferencia en CPU: totalmente viable, es el escenario mas razonable dado el tamano del modelo.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: `transformers` con el pipeline `text-generation`; Text Generation Inference (TGI) dado el tag `text-generation-inference`; endpoints compatibles con HuggingFace (`endpoints_compatible`); FriendliAI como proveedor de inferencia. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponible. No se han publicado medidas de latencia ni de tokens por segundo. Cualitativamente, por el tamano del modelo, la generacion es muy rapida en cualquier hardware moderno.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407 | 39.087.104 | no disponible | no disponible | HuggingFace, pesos safetensors | Objeto de esta ficha; ajuste fino SFT |
| goldfish-models/hin_deva_10mb | no disponible | no disponible | no disponible | HuggingFace | Modelo base del anterior; coleccion Goldfish por idioma |
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HuggingFace | Variante hermana con dataset de 10 MB |
| francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HuggingFace | Variante hermana con base de 100 MB y semilla 455 |
| francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HuggingFace | Variante hermana con base de 100 MB y semilla 3407 |

No se dispone de datos de rendimiento de ninguna de estas variantes, por lo que la comparativa se limita a la configuracion declarada en cada repositorio y no a resultados medidos.

## Limitaciones y advertencias

- Tamano muy reducido: con 39 M de parametros, la capacidad de razonamiento, la coherencia a largo plazo y el conocimiento factual son limitados por construccion. No es comparable a modelos actuales de proposito general.
- Riesgo elevado de alucinacion: no se ha aplicado ninguna tecnica de alineacion documentada mas alla del SFT, y no hay evaluaciones de fidelidad factual.
- Sesgos: no se documenta ningun analisis de sesgos ni la composicion del dataset de entrenamiento, por lo que se desconoce que sesgos pueden estar presentes en los datos.
- Cobertura idiomatica: no se declaran idiomas soportados. El modelo base pertenece a una coleccion de hindi en devanagari, por lo que el rendimiento en castellano, ingles u otros idiomas es previsiblemente pobre, aunque el ejemplo de la model card use una pregunta en ingles.
- Restricciones de licencia: la licencia figura como `license` sin especificar, es decir, no hay terminos claros para uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Sin garantias de produccion: 0 descargas y 0 likes, sin discusiones ni issues, sin evaluaciones publicadas y sin versionado de releases. Es un artefacto de investigacion, no un modelo mantenido.
- Ambiguedad en la nomenclatura: terminos como `ppt`, `bfdiso` o `packed` no estan definidos en la documentacion, lo que dificulta reproducir exactamente el entrenamiento.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en secuencias largas ni planificar despliegues que dependan de una ventana concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/29no3dfd
- Repositorio de TRL: https://github.com/huggingface/trl
- Pagina del modelo en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Variante hermana (10 MB / Dp 10mb / seed3407): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante hermana (100 MB / Dp 10mb / seed3407): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante hermana (100 MB / Dp 10mb / seed455): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Discusiones del modelo hermano: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407/discussions
