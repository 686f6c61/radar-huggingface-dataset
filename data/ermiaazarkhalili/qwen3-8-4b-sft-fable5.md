# ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5

## Resumen

El modelo `ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5` es un ajuste fino supervisado (SFT) publicado por el usuario ermiaazarkhalili sobre el modelo base `empero-ai/Qwen3.8-4B`. Se trata de un modelo multimodal de tipo imagen-texto-a-texto (`image-text-to-text`), lo que implica que acepta imagenes y texto como entrada y genera texto como salida. Cuenta con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones), un tamano de repositorio de 9,3 GB y se distribuye en formato `safetensors` bajo licencia Apache 2.0.

El modelo se ha entrenado segun su autor con Unsloth y la libreria TRL de Hugging Face, lo que segun la model card permite un entrenamiento "2x mas rapido". La etiqueta de arquitectura declarada es `qwen3_5`, lo que apunta a que hereda la arquitectura de la familia Qwen 3.5 del modelo base, aunque la model card no aporta detalles tecnicos sobre la arquitectura concreta, la composicion del dataset de ajuste ni el proceso de entrenamiento.

La relevancia de esta ficha es limitada pero real: se trata de un modelo recien publicado (14 de septiembre de 2026), con 0 descargas y 0 likes en el momento de la consulta, y con una model card minima que no documenta hiperparametros, datos de entrenamiento ni evaluaciones. Es util, por tanto, como punto de partida para quien quiera reproducir o inspeccionar un pipeline de SFT multimodal con Unsloth, pero no como modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; se asume transformer multimodal derivado del base) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos `safetensors`; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 9,3 GB, coherente con precision bf16/fp16 para 4,66 B de parametros) |
| Modalidad | Imagen-texto a texto (`image-text-to-text`) |
| Modelo base | `empero-ai/Qwen3.8-4B` (la etiqueta `base_model` tambien menciona `empero-ai/Qwen3.8-4B-Distill`) |
| Libreria | transformers |
| Fecha de publicacion | 14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. La unica referencia tecnica es la etiqueta `qwen3_5`, que sugiere que el modelo base `empero-ai/Qwen3.8-4B` sigue el diseno de la familia Qwen 3.5, y la etiqueta de pipeline `image-text-to-text`, que confirma que se trata de un modelo multimodal con codificador de imagenes y decodificador de texto. Con 4,66 B de parametros y un repositorio de 9,3 GB, el reparto de pesos es compatible con una publicacion en bf16 (4,66 B x 2 bytes ≈ 9,3 GB), pero no se especifica ni el numero de capas, ni las dimensiones de atencion, ni el tamano del vocabulario, ni el mecanismo de proyeccion vision-lenguaje.

Respecto al entrenamiento, la model card unicamente indica que el ajuste se hizo con Unsloth y TRL de Hugging Face, destacando una velocidad de entrenamiento "2x mas rapida". No se documentan el numero de tokens de entrenamiento, la composicion del dataset, si hubo mezcla de datos multimodales o solo texto, ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o preference tuning. Tampoco se indica la longitud de contexto con la que fue entrenado ni si se amplio respecto al modelo base. La discrepancia entre la model card (que cita `empero-ai/Qwen3.8-4B`) y la etiqueta `base_model` (que cita `empero-ai/Qwen3.8-4B-Distill`) tampoco se aclara.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline declarado indican soporte de dialogos multi-turno.
- Procesamiento de imagenes: al ser un modelo `image-text-to-text`, acepta imagenes junto con texto y genera respuestas textuales sobre ellas (descripcion, respuesta a preguntas visuales, extraccion de informacion).
- Ajuste fino supervisado (SFT): el nombre del modelo (`-SFT-`) indica que ha pasado por un ajuste supervisado sobre el base, orientado presumiblemente a mejorar el seguimiento de instrucciones.
- Compatibilidad con text-generation-inference: la etiqueta `text-generation-inference` y `endpoints_compatible` sugieren despliegue via TGI y endpoints compatibles.
- Idiomas: unicamente se declara ingles. No hay evidencia de capacidades multilingues en la informacion disponible.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de audio o video: no disponible.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar texto alternativo a partir de imagenes, lo que permite alimentar lectores de pantalla o generar subtitulos descriptivos en catalogos y sitios web. Es adecuado porque su pipeline nativo es imagen-texto a texto y su tamano de 4,66 B permite desplegarlo en una GPU de gama alta de consumo.
- Extraccion de informacion de documentos escaneados: convertir facturas, albaranes o formularios en texto estructurado enviando la imagen junto a una instruccion de formato. El modelo generaria los campos solicitados en el esquema indicado en el prompt.
- Asistente conversacional con soporte visual: atencion al cliente en la que el usuario adjunta una foto del producto o del error y el modelo responde en varios turnos, manteniendo el contexto de la conversacion dentro de la ventana disponible (longitud no documentada, por lo que conviene validarla antes de produccion).
- Anotacion asistida de datasets multimodales: pre-etiquetado de pares imagen-texto para generar candidatos que luego un humano revisa, reduciendo el coste de construccion de corpus de vision-lenguaje.
- Control de calidad visual en entornos industriales o de retail: enviar fotografias de producto o de linea de montaje y pedir al modelo que describa defectos visibles o que responda preguntas de verificacion. Requiere validacion exhaustiva por el riesgo de alucinacion.
- Moderacion asistida de contenido grafico: clasificacion inicial de imagenes subidas por usuarios mediante preguntas cerradas al modelo, como paso previo a una revision humana.
- Base para experimentacion en ajuste fino multimodal: dado que se entreno con Unsloth y TRL y se publica con licencia Apache 2.0, sirve como punto de partida para probar pipelines de SFT sobre modelos multimodales de ~4 B de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra metrica, y no se han encontrado evaluaciones independientes del modelo en la busqueda web realizada.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del numero de parametros declarado (4,66 B) y del tamano del repositorio (9,3 GB); no proceden de mediciones publicadas por el autor.

- Inferencia en bf16/fp16: los pesos ocupan aproximadamente 9,3 GB. Sumando cache KV y activaciones, se recomienda un minimo de 12-14 GB de VRAM para contexto corto, y 16-24 GB para contextos largos o lotes mayores.
- Cuantizacion de 8 bits: aproximadamente 4,7-5 GB de pesos; con overhead, alrededor de 7-8 GB de VRAM.
- Cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos; con overhead, alrededor de 4-5 GB de VRAM. No se publican pesos cuantizados oficiales, por lo que habria que generarlos.
- GPU de centro de datos: A100 (40 o 80 GB), H100, L40S. Cualquiera de ellas permite servir el modelo en bf16 con margen amplio.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB) en bf16, y en una RTX 4080 (16 GB) con margen ajustado en bf16 o con holgura en 8 bits.
- Opciones de despliegue confirmadas: `transformers` (libreria declarada) y text-generation-inference (etiquetas `text-generation-inference` y `endpoints_compatible`). El uso con vLLM, llama.cpp u Ollama no esta confirmado en la informacion disponible; en particular, llama.cpp y Ollama requeririan una conversion a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos tecnicos de modelos alternativos, por lo que la comparacion se limita al modelo base declarado. No se dispone de especificaciones verificables de otros modelos multimodales de ~4 B para esta tabla.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5` | 4,66 B | No disponible | Imagen-texto a texto | Apache 2.0 | Hugging Face, safetensors |
| `empero-ai/Qwen3.8-4B` (base) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| `empero-ai/Qwen3.8-4B-Distill` (citado en etiquetas) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Otras alternativas multimodales de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset de entrenamiento, hiperparametros, ni evaluacion. No es posible estimar la calidad real del ajuste sin pruebas propias.
- Riesgo de alucinacion: al ser un modelo multimodal de 4,66 B sin benchmarks publicados, la generacion de contenido incorrecto sobre imagenes (objetos inexistentes, textos mal transcritos, cifras erroneas) es un riesgo alto y requiere verificacion humana en cualquier flujo critico.
- Cobertura idiomatica limitada: solo se declara ingles. El comportamiento en castellano no esta documentado ni garantizado.
- Longitud de contexto desconocida: no se puede planificar un despliegue con conversaciones o documentos largos sin medir previamente el limite efectivo.
- Ambiguedad sobre el modelo base: la model card apunta a `empero-ai/Qwen3.8-4B` mientras que las etiquetas mencionan `empero-ai/Qwen3.8-4B-Distill`. Conviene verificar cual es el ascendiente real antes de reutilizar el modelo.
- Denominacion no oficial: el nombre "Qwen3.8-4B" no corresponde a una nomenclatura publicada por el equipo de Qwen; se trata de un modelo de terceros con etiquetas de la familia Qwen. No debe asumirse equivalencia con modelos oficiales de Qwen.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Es responsabilidad del usuario verificar que el modelo base `empero-ai/Qwen3.8-4B` no imponga condiciones adicionales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas. No existe una comunidad que haya validado el modelo.
- Sin pesos cuantizados publicados: desplegarlo en hardware modesto exige generar las cuantizaciones por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Idoneidad para produccion: no recomendado sin una bateria de evaluacion propia en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5
- Modelo base declarado en la model card: https://huggingface.co/empero-ai/Qwen3.8-4B
- Modelo base alternativo citado en las etiquetas: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Repositorio de TRL de Hugging Face (libreria de entrenamiento citada): https://github.com/huggingface/trl
- Paper, blog o demo oficial del modelo: no disponible.
- Resultados relevantes de la busqueda web: no disponible. Las busquedas realizadas no devolvieron ningun resultado relacionado con este modelo; los enlaces obtenidos correspondian a contenidos no relacionados (tiendas de moda y foros de centros comerciales), por lo que se han descartado.
