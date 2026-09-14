# Kuntal090/qwen1.5-1.8b-pharma-stage2-adapter-instruct

## Resumen

Kuntal090/qwen1.5-1.8b-pharma-stage2-adapter-instruct es un modelo de generacion de texto de aproximadamente 1.830 millones de parametros publicado en HuggingFace por el usuario Kuntal090. El identificador indica que se trata de un ajuste (fine-tuning) en dos etapas sobre el modelo base Qwen1.5-1.8B, orientado al dominio farmaceutico y con un formato final de instrucciones. El repositorio ocupa 3,7 GB y los pesos estan en formato safetensors, cargables con la libreria transformers.

La relevancia de esta publicacion es limitada y, sobre todo, metodologica: se trata de un modelo pequeno (rango 1-2B) que puede ejecutarse en GPU de consumo, lo que abarata la experimentacion con ajuste de dominio en un nicho vertical como el farmaceutico. No obstante, la model card es la plantilla automatica de HuggingFace sin ninguna seccion completada, y no se declaran licencia, idiomas, datos de entrenamiento ni resultados de evaluacion.

Conviene advertir que las etiquetas del repositorio incluyen `qwen2` mientras que el nombre del modelo indica `qwen1.5`, una discrepancia sin resolver en la informacion disponible. Tampoco se especifica si el artefacto publicado son pesos completos fusionados o un adaptador PEFT sin fusionar, pese a que el nombre incluye el termino "adapter".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo apunta a la familia Qwen1.5 de tipo transformer decoder-only; no confirmado en la model card) |
| Parametros totales | 1.836.828.672 (dato real de los safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible en esta ficha |
| Tipos de cuantizacion | no disponibles (no se publican versiones GGUF, AWQ ni GPTQ en la informacion facilitada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos del repositorio: tamano 3,7 GB, 0 descargas, 0 likes, creado el 14 de septiembre de 2026 y actualizado el mismo dia. Etiquetas declaradas: `transformers`, `safetensors`, `qwen2`, `text-generation`, `arxiv:1910.09700`, `text-generation-inference`, `endpoints_compatible`, `region:us`.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta ni sobre el procedimiento de entrenamiento. La model card publicada es la plantilla generada automaticamente por HuggingFace y todas las secciones relevantes (descripcion, datos de entrenamiento, hiperparametros, regimen de precision, evaluacion) contienen el marcador "[More Information Needed]".

Por el identificador puede inferirse que el modelo parte de Qwen1.5-1.8B y que se ha sometido a un ajuste en dos etapas ("stage2") con un formato final de instrucciones, presumiblemente con datos del dominio farmaceutico. Se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF o DPO, y si se emplearon metodos de eficiencia como LoRA, QLoRA u otras tecnicas de adaptacion de bajo rango. La etiqueta `arxiv:1910.09700` corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla de model card, y no a un paper del modelo.

## Capacidades

- Generacion de texto autoregresiva en el marco de `text-generation`.
- Ajuste de instrucciones ("instruct"), segun el propio identificador del modelo.
- Especializacion presumible en dominio farmaceutico, no verificable con la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

No se ha publicado ninguna evaluacion funcional, por lo que la existencia real de estas capacidades no esta corroborada mas alla de lo que sugiere el nombre del repositorio.

## Casos de uso

- Extraccion de entidades farmaceuticas: uso del modelo para identificar principios activos, dosis, vias de administracion y reacciones adversas en textos de prospectos o informes, aprovechando el ajuste de dominio declarado en el nombre.
- Resumen de literatura cientifica: condensar abstracts y articulos de farmacologia en parrafos breves para revision interna, con la ventaja de que un modelo de 1,8B puede desplegarse en infraestructura modesta.
- Preguntas y respuestas sobre documentacion tecnica: construccion de un asistente interno sobre fichas tecnicas y monografias, siempre que se valide la fidelidad de las respuestas por el riesgo de alucinacion del modelo base.
- Prototipado rapido de asistentes de dominio: al ser un modelo pequeno, sirve para validar pipelines de RAG y prompts antes de escalar a modelos mayores.
- Clasificacion y etiquetado de textos: categorizacion de notas o incidencias por area terapeutica, con revision humana obligatoria dado que no hay metricas publicadas.
- Generacion de borradores de respuestas en atencion al cliente del sector salud: redaccion de primeras versiones de contestaciones que un especialista revisa antes de enviar.
- Fine-tuning posterior: el modelo puede actuar como punto de partida para ajustes adicionales en tareas concretas, al tener un tamano manejable en una unica GPU.
- Investigacion sobre adaptacion de dominio: caso de estudio para comparar estrategias de ajuste en dos etapas en modelos del rango de los 2B de parametros.

En todos los casos, el uso en produccion farmaceutica o clinica requiere validacion previa, supervision experta y verificacion de la licencia, que no esta declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion y no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,7 GB en fp16 para los pesos, a lo que hay que sumar la cache KV; en cuantizacion int8 bajaría a unos 1,9 GB y en int4 a alrededor de 1 GB (estimaciones calculadas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar el modelo en fp16; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 permiten margen amplio para contextos largos y lotes mayores. Para servicio con concurrencia alta, una A100 o H100 quedan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU modernas con 8 GB o mas de VRAM, especialmente si se cuantiza.
- Opciones de despliegue: transformers, text-generation-inference (la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints) y vLLM. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual previa.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,8B, la latencia esperada es baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a informacion publica de sus respectivos repositorios y pueden no coincidir con lo declarado en este repositorio concreto.

| Modelo | Parametros | Contexto | Licencia | Pesos | Notas |
|---|---|---|---|---|---|
| Kuntal090/qwen1.5-1.8b-pharma-stage2-adapter-instruct | 1,836 M | no disponible | no disponible | safetensors | Ajuste de dominio farmaceutico, sin evaluacion publicada |
| Qwen1.5-1.8B (modelo base) | 1,8 B aprox. | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun el modelo base) | safetensors | Referencia generalista; el repositorio analizado no confirma estos datos |
| Qwen2-1.5B | 1,5 B aprox. | 32.768 tokens (segun documentacion de la familia) | Apache 2.0 (segun la familia) | safetensors, GGUF | Generacion posterior de la misma familia, con mejor soporte de ecosistema |
| SmolLM2-1.7B | 1,7 B aprox. | 8.192 tokens (segun su documentacion) | Apache 2.0 (segun su documentacion) | safetensors, GGUF | Alternativa pequena con licencia permisiva y versiones cuantizadas listas |

No se dispone de resultados de benchmarks para el modelo analizado, por lo que la comparacion se limita a parametros, contexto declarado, licencia y formatos disponibles. No es posible establecer conclusiones de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. Cualquier despliegue parte de una base de informacion nula.
- Licencia no declarada: sin licencia explicita, el uso comercial no esta autorizado de forma clara y no se puede verificar la compatibilidad con la licencia del modelo base Qwen1.5.
- Sesgos desconocidos: al no publicarse la composicion del dataset de ajuste, no se puede evaluar el sesgo introducido en el dominio farmaceutico ni en el modelo base.
- Riesgo de alucinacion: los modelos del rango de 1-2B parametros presentan una tasa elevada de invencion de datos, especialmente sensible en contenido farmaceutico o sanitario, donde una respuesta erronea puede tener consecuencias graves.
- Idiomas no declarados: se desconoce si el ajuste se realizo en ingles, castellano u otros idiomas, y si conserva las capacidades multilingues del modelo base.
- Contexto no especificado: no hay confirmacion de la ventana de contexto efectiva tras el ajuste.
- Ambiguedad del artefacto: no queda claro si el repositorio contiene pesos completos fusionados o un adaptador PEFT, a pesar de que el tamano de 3,7 GB sugiere pesos completos en fp16. Esto puede provocar errores de carga en el codigo de inferencia.
- Incoherencia de etiquetas: el tag `qwen2` contradice el nombre `qwen1.5`, lo que puede indicar un error de publicacion o una base distinta de la que sugiere el nombre.
- Sin adopcion: cero descargas y cero likes, sin comunidad que haya validado su comportamiento.
- Ausencia de garantias: no hay informacion sobre la identidad, afiliacion o metodologia del autor mas alla del nombre de usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kuntal090/qwen1.5-1.8b-pharma-stage2-adapter-instruct
- Perfil del autor en HuggingFace: https://huggingface.co/Kuntal090
- Articulo citado en las etiquetas (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning referenciada en la plantilla: https://mloc2.github.io/impact
- Documentacion de Qwen1.5 (referencia del modelo base, no enlazada por el autor): no disponible en la informacion proporcionada
- Paper, blog o demo especificos del modelo: no disponibles
