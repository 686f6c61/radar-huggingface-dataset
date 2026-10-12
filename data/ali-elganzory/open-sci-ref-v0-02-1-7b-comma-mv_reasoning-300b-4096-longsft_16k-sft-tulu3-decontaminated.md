# ali-elganzory/open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3-decontaminated

## Resumen

Este modelo es un ajuste fino supervisado (SFT) del checkpoint `ali-elganzory/open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k`, desarrollado por el usuario ali-elganzory y entrenado con la libreria TRL de Hugging Face. Se trata de un modelo de generacion de texto de tipo conversacional con aproximadamente 1.714 millones de parametros (1,7B), empaquetado en safetensors y con un tamano de repositorio de 3,4 GB, lo que es coherente con pesos en precision de 16 bits.

El nombre del checkpoint sugiere que parte de un proyecto de referencia de ciencia abierta ("open-sci-ref"), con una variante orientada al razonamiento ("mv_reasoning"), un entrenamiento previo sobre una gran cantidad de datos (etiquetado como 300B) y un ajuste de contexto largo ("longsft_16k"). El ajuste final se habria realizado sobre una version "decontaminated" del dataset Tulu3, es decir, filtrando ejemplos que pudieran solaparse con conjuntos de evaluacion. Conviene subir con cautela estas inferencias: proceden del nombre del repositorio y no de documentacion explicita.

El modelo tiene un nivel de adopcion nulo en el momento de redactar esta ficha (0 descargas y 0 likes) y una model card practicamente vacia, sin licencia, idiomas, datos de entrenamiento ni resultados de evaluacion declarados. Por tanto, es un artefacto de investigacion reciente y poco documentado, adecuado para experimentacion, pero no recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `custom_code`; probable transformer decoder, sin confirmar) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el identificador menciona 4096 y longsft_16k, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa de 16 bits; sin GGUF/AWQ/GPTQ declarados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo del README contiene el marcador de posicion "license") |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | ali-elganzory/open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k |
| Framework de entrenamiento | TRL 0.27.1 |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura interna. Los metadatos indican `custom_code`, lo que suele implicar que el modelo requiere codigo propio (por ejemplo, una implementacion especifica de atencion o de capas) y no funciona solo con las clases estandar de transformers. El tamano de 1,71B parametros y la tarea declarada (text-generation conversacional) apuntan a una arquitectura de tipo transformer decoder, pero esto no esta confirmado por el autor.

El procedimiento de entrenamiento documentado se limita a un ajuste supervisado (SFT) realizado con TRL, partiendo del checkpoint indicado como modelo base. Los tags mencionan SFT, TRL y `generated_from_trainer`. El identificador del repositorio sugiere que el ajuste final uso una version depurada del dataset Tulu3 ("decontaminated"), pero no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` y el ejemplo de uso con formato de mensajes de rol.
- Razonamiento: el identificador del modelo incluye "mv_reasoning", lo que sugiere un entrenamiento orientado a tareas de razonamiento, aunque no se aportan detalles ni evaluaciones.
- Ajuste para contexto largo: el sufijo "longsft_16k" apunta a un fine-tuning con secuencias largas, si bien la longitud de contexto real no esta confirmada.
- Enfoque en dominio cientifico: el prefijo "open-sci-ref" sugiere un proyecto orientado a referencia cientifica, sin datos adicionales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, modo "thinking" explicito): no disponible.

## Casos de uso

- Experimentacion en investigacion sobre razonamiento: dado el tamano reducido (1,7B) y la orientacion del nombre hacia tareas de razonamiento, el modelo puede emplearse como banco de pruebas para comparar estrategias de SFT y de datos de razonamiento en un entorno de 16 bits.
- Generacion de texto asistida en prototipos: puede integrarse rapidamente en notebooks o demos con la libreria transformers para tareas de escritura y resumen, siempre con validacion humana.
- Base para nuevos ajustes finos: al ser un checkpoint intermedio de una cadena de entrenamiento, resulta util como punto de partida para SFT adicional con LoRA o QLoRA sobre dominios concretos.
- Chatbots de bajo coste en local: su tamano permite ejecutarlo en una GPU de consumo, lo que lo hace viable para asistentes conversacionales sin conexion, con la advertencia de que no se conocen sus idiomas ni su calidad.
- Filtrado y anotacion de datos cientificos (potencial): si el proyecto "open-sci-ref" esta orientado a literatura cientifica, podria usarse para preprocesar o etiquetar texto tecnico, previa verificacion empirica.
- Comparacion de tecnicas de decontaminacion de datos: al declararse entrenado sobre Tulu3 "decontaminated", sirve como caso de estudio para medir el efecto de eliminar solapamientos con benchmarks, comparando frente a variantes no depuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones numericas en la model card, y el repositorio registra 0 descargas y 0 likes, sin evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1,71B parametros): alrededor de 3,4-4 GB en FP16/BF16, 6,9-7,5 GB en FP32, 1,7-2,5 GB en cuantizacion INT8 y 0,9-1,5 GB en INT4 (estimaciones, supeditadas a la longitud de contexto y al tamano de lote).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16; RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10G, A100 o H100 para despliegue o lotes mayores.
- GPU de consumo: si, cabe con holgura en FP16 en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc.); en cuantizacion INT4 cabria incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (soporte nativo, pero requiere el `custom_code` del modelo); vLLM y TGI si el codigo personalizado es compatible; llama.cpp y Ollama solo si se generan pesos GGUF, que no estan publicados.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo, latencia ni consumo de memoria en inferencia.

## Comparativa con modelos similares

En la informacion proporcionada no hay datos de rendimiento que permitan una comparacion cuantitativa. A continuacion se contrastan las especificaciones publicas conocidas de alternativas de la misma categoria (modelos densos de 1B-2B parametros), marcando como "no disponible" los datos del modelo analizado. Los datos de los competidores proceden de sus fichas publicas y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (SFT Tulu3) | 1,71B | no disponible | no disponible | no disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (ampliable) | Apache 2.0 | no disponible en esta ficha |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | no disponible en esta ficha |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Licencia Gemma | no disponible en esta ficha |

Nota: la comparacion es unicamente de categoria y especificaciones; no se dispone de evaluaciones homogeneas que permitan afirmar cual rinde mejor en tareas concretas.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no describe datos de entrenamiento, idiomas, arquitectura ni evaluaciones, lo que impide validar su comportamiento antes de usarlo.
- Licencia no especificada: el campo de licencia contiene un marcador de posicion, de modo que no se conocen las condiciones de uso comercial ni de redistribucion. Debe aclararse con el autor antes de cualquier uso profesional.
- Modelo base no examinado: al derivar de otro checkpoint del mismo autor, hereda sus posibles limitaciones, sesgos y contaminaciones, que no estan documentadas.
- Riesgo de alucinacion: no hay metricas de fidelidad ni de tasas de error; en un modelo de 1,7B el riesgo de afirmaciones incorrectas es alto, especialmente en dominios tecnicos o cientificos.
- Idiomas desconocidos: al no declararse idiomas soportados, no se puede garantizar un rendimiento adecuado en castellano ni en otras lenguas.
- Contexto sin confirmar: aunque el nombre menciona 4096 y 16k, no se confirma la ventana de contexto real, lo que afecta a tareas de contexto largo.
- Requiere codigo personalizado (`custom_code`): la carga puede fallar con herramientas estandar hasta que se resuelva su implementacion especifica.
- Adopcion nula: con 0 descargas y 0 likes, no existe comunidad, issues ni validacion independiente que sirvan de referencia.
- No apto para produccion sin evaluacion previa: dada la ausencia de benchmarks, se recomienda una bateria de pruebas propia antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3-decontaminated
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de referencia de TRL (von Werra et al., 2020): https://arxiv.org/abs/2203.02155 (cita declarada por el autor para TRL)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada.
