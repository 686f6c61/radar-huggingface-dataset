# aliRafik/granite_finetuned_Recommendation_Tunning_16bit

## Resumen

Este repositorio contiene un ajuste fino del modelo `unsloth/granite-4.0-h-micro`, publicado por el usuario aliRafik bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.191.396.096 parámetros (3,19 B) en formato safetensors de 16 bits, con un tamaño de repositorio de 6,4 GB. El tag `granitemoehybrid` indica que hereda una arquitectura híbrida con componentes de mezcla de expertos (MoE) de la familia Granite 4.0 de IBM, aunque la model card no detalla la composición de capas ni el número de parámetros activos.

El nombre del repositorio sugiere un ajuste orientado a tareas de recomendación, pero la model card no documenta el conjunto de datos, el procedimiento de entrenamiento ni la tarea exacta. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, y el autor declara que el entrenamiento fue dos veces más rápido gracias a Unsloth. El modelo está etiquetado como conversacional y solo declara soporte para inglés.

Su relevancia práctica reside en el tamaño: con 3,19 B de parámetros en 16 bits puede desplegarse en una única GPU de consumo con 12-16 GB de VRAM, lo que lo hace útil para prototipos de sistemas de recomendación y para experimentar con recetas de ajuste fino sin infraestructura dedicada. Ahora bien, la ausencia de benchmarks, de documentación del dataset y de validación comunitaria (0 descargas y 0 likes en el momento de la consulta) limita seriamente cualquier evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con mezcla de expertos (tag `granitemoehybrid`), heredada del modelo base; composición de capas no disponible |
| Parametros totales | 3.191.396.096 (3,19 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en 16 bits (safetensors); no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | unsloth/granite-4.0-h-micro |
| Tarea declarada | text-generation (conversacional) |
| Tamano del repositorio | 6,4 GB |
| Libreria | transformers |
| Despliegue declarado | endpoints compatibles y text-generation-inference (tags) |

## Arquitectura y entrenamiento

La arquitectura procede del modelo base `unsloth/granite-4.0-h-micro`, etiquetado como `granitemoehybrid`, lo que indica una combinación de capas híbridas y mezcla de expertos propia de la familia Granite 4.0. La model card de este repositorio no especifica el número de capas, la dimensión oculta, el número de expertos, la ventana de contexto ni los parámetros activos por token, por lo que estos datos deben consultarse en la ficha del modelo base.

El entrenamiento consistió en un ajuste fino supervisado sobre dicho modelo base utilizando Unsloth y TRL, según declara el autor. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste de preferencias, ni las hiperparámetros empleados. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la propia arquitectura heredada. Los pesos se distribuyen en precisión de 16 bits, sin versiones cuantizadas publicadas.

## Capacidades

- Generación de texto en inglés, con formato conversacional multi-turno según el tag `conversational`.
- Ajuste orientado a recomendación, a juzgar por el nombre del repositorio; la model card no documenta la tarea concreta ni el dominio.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, lo que facilita su servicio como API.
- Inferencia en hardware de consumo gracias a sus 3,19 B de parámetros en 16 bits.
- Capacidad de ajuste fino adicional con Unsloth y TRL, al estar publicado en formato transformers estándar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio, thinking mode ni modos de razonamiento explícito.
- Multilingüismo no disponible: solo se declara inglés.
- Longitud de contexto no disponible, lo que impide confirmar su idoneidad para conversaciones largas.

## Casos de uso

- Recomendación conversacional en comercio electrónico: el modelo puede recibir el perfil del usuario y el catálogo en el prompt y generar sugerencias de productos en inglés; sus 3,19 B permiten desplegarlo en una GPU de 12-16 GB con latencia interactiva, siempre que se valide la salida contra el catálogo real.
- Generación de explicaciones de recomendaciones: dado un par usuario-ítem y los atributos del ítem, el modelo puede redactar una justificación en lenguaje natural; es útil para interfaces de transparencia y para enriquecer fichas de producto, aunque requiere control de alucinaciones.
- Prototipado de sistemas de recomendación en investigación: su tamaño reducido y su licencia Apache 2.0 permiten iterar rápidamente sobre prompts, plantillas y ajustes finos con Unsloth en una sola GPU, sin depender de clústeres.
- Asistente de atención al cliente con recomendación de productos o servicios: el formato conversacional y el ajuste orientado a recomendación encajan con flujos de soporte en inglés; conviene limitar el contexto y validar las respuestas contra una base de conocimiento.
- Reranking generativo de candidatos: tras una recuperación inicial de N ítems, el modelo puede ordenarlos o seleccionar los más relevantes y justificar la elección; es recomendable restringir la salida a un formato estructurado para evitar texto libre no parseable.
- Base para ajustes finos verticales: al ser un modelo pequeño, Apache 2.0 y compatible con transformers, puede adaptarse a dominios concretos (moda, viajes, contenidos) con costes de entrenamiento bajos.
- Evaluación de recetas de entrenamiento con Unsloth y TRL: sirve como referencia reproducible para comparar hiperparámetros y técnicas de ajuste en modelos de ~3 B.
- Servicio mediante text-generation-inference: los tags indican compatibilidad con TGI y endpoints compatibles, lo que simplifica el despliegue como API interna de recomendaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de recomendación, y tampoco se aportan resultados del modelo base que permitan establecer una referencia. No deben inferirse cifras de rendimiento a partir del tamaño o de la familia del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 6,4 GB solo para los pesos; con caché KV y overhead del runtime, el consumo realista se sitúa en torno a 8-10 GB según la longitud de contexto.
- GPU de consumo compatibles en 16 bits: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 de 12 GB, RTX 4070 Ti Super de 16 GB, RTX 4080 de 16 GB y RTX 4090 de 24 GB. Las tarjetas de 8 GB no son suficientes en 16 bits sin cuantización adicional.
- Cuantización: no se publican pesos GGUF, AWQ ni GPTQ; sería necesario generarlos a partir de los safetensors. En 8 bits los pesos ocuparían unos 3,2 GB y en 4 bits unos 1,6 GB, lo que permitiría entrar en GPUs de 8 GB, pero son estimaciones de cálculo, no cifras publicadas por el autor.
- GPU de centro de datos: A100 de 40/80 GB, H100 de 80 GB o L40S para servir varias peticiones concurrentes con mayor throughput.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), Unsloth para ajuste fino. La compatibilidad con vLLM no está confirmada en la información disponible; llama.cpp y Ollama requerirían una conversión previa a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aliRafik/granite_finetuned_Recommendation_Tunning_16bit | 3,19 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas en la consulta | Pesos 16 bits, solo inglés, sin benchmarks |
| unsloth/granite-4.0-h-micro (base) | 3,19 B (heredado) | no disponible | no disponible | Hugging Face | Punto de partida del ajuste; la model card del fine-tune no detalla diferencias |
| ibm-granite/granite-4.0-h-micro (original de la familia) | no disponible en la información | no disponible | no disponible | no disponible | Referencia de la familia Granite 4.0; datos no verificados en la información proporcionada |

La comparación es puramente estructural: al no haber benchmarks ni contexto documentado, no es posible establecer diferencias de calidad frente al modelo base ni frente al modelo original de IBM. Cualquier elección entre ellos debería basarse en una evaluación propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se han publicado benchmarks, por lo que se desconoce la calidad real del ajuste frente al modelo base.
- El dataset de ajuste fino no está documentado; se desconocen los sesgos introducidos y el riesgo de sobreajuste al dominio de recomendación.
- Riesgo de alucinación en recomendaciones: el modelo puede inventar productos, precios, atributos o disponibilidad; es imprescindible validar la salida contra un catálogo o base de datos.
- La longitud de contexto no está disponible, lo que impide garantizar conversaciones largas o prompts con catálogos extensos.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Los pesos solo se distribuyen en 16 bits; no hay GGUF ni otras cuantizaciones listas para usar, lo que incrementa los requisitos de memoria frente a alternativas cuantizadas.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los términos del modelo base y las políticas aplicables de IBM Granite antes de un despliegue en producción.
- No se documenta ningún proceso de alineación de seguridad, filtrado de contenido ni evaluación de sesgos.
- El nombre del repositorio contiene una errata ("Tunning") y la documentación es mínima, lo que dificulta la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliRafik/granite_finetuned_Recommendation_Tunning_16bit
- Modelo base: https://huggingface.co/unsloth/granite-4.0-h-micro
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl

No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
