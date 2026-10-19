# arefe-rn/Ministral-3-8B_SFT_16bit

## Resumen

`arefe-rn/Ministral-3-8B_SFT_16bit` es un ajuste fino supervisado (SFT) publicado por el usuario arefe-rn sobre `unsloth/Ministral-3-8B-Base-2512-unsloth-bnb-4bit`, una version cuantizada en 4 bits (bitsandbytes) del modelo base Ministral 3 de 8B de la familia Mistral 3. El resultado se distribuye en precision de 16 bits con pesos en `safetensors`, lo que da un repositorio de 17,9 GB y 8.918.026.240 parametros totales segun los metadatos del propio repositorio. La etiqueta de pipeline es `image-text-to-text`, lo que indica que la arquitectura `mistral3` conserva la torre de vision del modelo base y admite entradas de imagen junto a texto.

El modelo resuelve un problema acotado: ofrecer un checkpoint ya entrenado con TRL y Unsloth (segun declara el autor) que sirve como punto de partida para tareas conversacionales en ingles, sin necesidad de repetir el proceso de SFT. Es relevante ahora porque la familia Ministral 3 esta disenada para despliegue en el borde y en entornos con recursos limitados, y porque el ecosistema Unsloth permite producir estos ajustes con aproximadamente la mitad de memoria y tiempo que un entrenamiento convencional, segun la propia model card.

Las limitaciones de informacion son notables: el autor no publica composicion del dataset de SFT, hiperparametros, resultados de evaluacion ni longitud de contexto. La model card es practicamente una plantilla autogenerada. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral 3 (tag `mistral3`), con soporte de entrada imagen-texto |
| Parametros totales | 8.918.026.240 (8,92 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | El repositorio publica pesos en 16 bits; el modelo base del que parte esta cuantizado en 4 bits (bnb-4bit). No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (ingles) declarado en los metadatos; el resto de idiomas no esta declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (16 bits), compatible con `transformers` y `text-generation-inference` |

## Arquitectura y entrenamiento

La arquitectura corresponde a `mistral3`, es decir, un transformer denso de la familia Mistral 3 con modulo de vision que habilita la modalidad `image-text-to-text`. El checkpoint parte de `unsloth/Ministral-3-8B-Base-2512-unsloth-bnb-4bit`, una conversion a 4 bits del modelo base Ministral 3 8B, y se ha ajustado con la libreria TRL sobre la infraestructura de Unsloth; la model card afirma que el entrenamiento fue "2x faster" con Unsloth, pero no aporta cifras de tokens, GPU-hora ni curves de perdida.

No hay informacion sobre la composicion del dataset de SFT, el numero de tokens vistos, la mezcla de idiomas ni si se aplicaron etapas posteriores de alineacion como DPO o RLHF. Tampoco se documenta si el ajuste cubrio la torre de vision o solo el decodificador de texto. Un detalle tecnico relevante: el modelo se entrena a partir de pesos cuantizados en 4 bits pero se exporta en 16 bits, de modo que los pesos finales son una reconstruccion en mayor precision de unos parametros optimizados en baja precision; esto no recupera la informacion perdida en la cuantizacion original.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (`conversational` en los tags).
- Procesamiento de entradas multimodal imagen-texto, heredado del pipeline `image-text-to-text` de la arquitectura Mistral 3.
- Razonamiento y respuesta a instrucciones, como resultado del ajuste supervisado sobre el modelo base.
- Compatibilidad con `text-generation-inference` (TGI) y con la API de `transformers`, segun los tags del repositorio.
- Integracion con endpoints compatibles (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de tool calling y de razonamiento multi-paso: no disponible (no se documenta en la model card).
- Capacidades multilingues: limitadas a ingles segun los metadatos; no se declaran otros idiomas.
- Modo `thinking` explicito, audio o cualquier capacidad especial: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: al ser un SFT listo para usar con pesos en 16 bits, permite levantar un chatbot funcional con `transformers` o TGI en minutos, sin pasar por un pipeline de ajuste propio.
- Punto de partida para ajustes especificos de dominio: el checkpoint sirve como base para un segundo SFT con LoRA o QLoRA sobre datos propios de un vertical (legal, sanitario, soporte interno), aprovechando que ya ha pasado por una etapa de instruccion.
- Experimentacion academica con modelos de 8-9 B: util para comparar el efecto del SFT frente al modelo base en tareas controladas, con un coste de inferencia contenido en una sola GPU.
- Procesamiento de documentos con componente visual: la modalidad imagen-texto permite extraer y resumir informacion de capturas, formularios escaneados o graficos simples, siempre que se valide empiricamente la calidad del ajuste sobre la torre de vision.
- Generacion de descripciones a partir de imagenes en pipelines de catalogacion: el modelo puede recibir una imagen y producir texto asociado, integrable en un flujo por lotes con TGI.
- Evaluacion de tecnicas de entrenamiento eficiente: al estar producido con Unsloth y TRL, es un caso de referencia para medir el impacto de entrenar sobre una base cuantizada en 4 bits y exportar en 16 bits.
- Despliegue en el borde o en estaciones de trabajo con una sola GPU consumer, dado el tamano de 8,92 B y la disponibilidad de pesos en 16 bits cuantizables posteriormente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 17,8 GB solo para pesos; con cache KV y overhead de runtime, el consumo realista se situa en 20-24 GB.
- VRAM en 8 bits: aproximadamente 9 GB de pesos, en torno a 11-13 GB en ejecucion.
- VRAM en 4 bits: aproximadamente 4,5-5 GB de pesos, en torno a 6-8 GB en ejecucion.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G 24 GB para la version de 16 bits sin cuantizar.
- GPU consumer: cabe en 16 bits en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen ajustado; en 4 u 8 bits cabe en RTX 4070 Ti Super, RTX 4080 o GPUs de 12-16 GB.
- Opciones de despliegue: `transformers` (referencia), TGI (declarado en los tags), vLLM (previa conversion, no verificada para esta arquitectura), llama.cpp/Ollama (requiere convertir a GGUF, no hay ficheros publicados).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| arefe-rn/Ministral-3-8B_SFT_16bit | 8,92 B (denso) | no disponible | Apache 2.0 | safetensors 16 bits |
| unsloth/Ministral-3-8B-Base-2512-unsloth-bnb-4bit (modelo base) | ~8,9 B | no disponible | no indicada en la informacion disponible | bnb-4bit |
| Ministral-3-8B-Base-2512 (original de Mistral AI) | ~8,9 B | no disponible en esta ficha | no verificada en la informacion disponible | pesos originales |
| Qwen3-8B | ~8,2 B | 32 768 tokens nativos (ampliable) | Apache 2.0 | safetensors, GGUF ampliamente disponibles |
| Llama 3.1 8B Instruct | ~8,03 B | 131 072 tokens | Llama 3.1 Community License | safetensors, GGUF ampliamente disponibles |

La ventaja de este checkpoint frente a los modelos de su categoria es la licencia Apache 2.0 combinada con la modalidad imagen-texto; la desventaja es la ausencia total de evaluaciones publicadas y un ecosistema de cuantizaciones mucho mas pobre que el de Qwen3 o Llama 3.1.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks ni pruebas cualitativas publicadas; no se puede afirmar que el SFT mejore al modelo base en ninguna tarea concreta.
- Trazabilidad del entrenamiento incompleta: se desconoce el dataset, el numero de pasos, la tasa de aprendizaje y si se entreno la torre de vision o solo el decodificador.
- Sesgos conocidos: no documentados; al no haber informacion sobre la mezcla de datos, no es posible acotar sesgos de genero, raza, religion o nacionalidad.
- Riesgo de alucinacion: no cuantificado, y probablemente elevado en un modelo de 8,9 B ajustado con datos desconocidos, especialmente en tareas factuales y en el dominio visual.
- Idioma: solo se declara ingles; el rendimiento en castellano u otras lenguas no esta verificado y probablemente sea inferior.
- Herencia de la cuantizacion: el ajuste se hizo sobre pesos bnb-4bit y se exporta en 16 bits, lo que arrastra la perdida de precision introducida antes del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que la licencia del modelo base original de Mistral AI sea compatible, ya que la cadena de derivacion no esta documentada en el repositorio.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un checkpoint sin adopcion ni validacion por parte de la comunidad.
- Fecha de creacion en los metadatos (2026-10-19) posterior a la de esta ficha en algunos contextos de consulta; conviene comprobar que el repositorio no haya sido modificado o retirado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arefe-rn/Ministral-3-8B_SFT_16bit
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/Ministral-3-8B-Base-2512-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion de Mistral 3: no disponible en la informacion proporcionada
- Paper tecnico: no disponible en la informacion proporcionada
- Demo o space asociado: no disponible en la informacion proporcionada
