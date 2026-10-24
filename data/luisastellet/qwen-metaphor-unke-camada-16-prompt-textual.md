# luisastellet/qwen-metaphor-unke-camada-16-prompt-textual

## Resumen

`luisastellet/qwen-metaphor-unke-camada-16-prompt-textual` es un ajuste fino (fine-tune) del modelo Qwen3 en su variante pequena, con 596.049.920 parametros totales segun los tensores publicados en safetensors. Lo publica el usuario `luisastellet` en Hugging Face y pertenece a una serie de checkpoints denominados `qwen-metaphor-unke`, con variantes numeradas por "camada" (capa) —se han localizado al menos las camadas 5, 15 y 16—, lo que sugiere una linea de experimentos de intervencion o entrenamiento por capas sobre la base Qwen3.

El modelo resuelve, en principio, una tarea especializada de generacion de texto orientada a lenguaje metaforico ("metaphor") y conversacion, segun los tags del repositorio (`text-generation`, `conversational`). Sin embargo, la model card es la plantilla autogenerada de Hugging Face y no contiene ni una sola seccion completada: no declara datos de entrenamiento, licencia, idiomas, hiperparametros ni evaluaciones. Su relevancia ahora es, por tanto, la de un artefacto de investigacion reproducible y muy ligero (2,4 GB de repositorio, ejecutable en CPU y en GPUs de consumo), no la de un modelo listo para produccion.

La relevancia practica deriva de tres hechos verificables: el tamano (0,6 B parametros, 1,19 GB en BF16), la compatibilidad con el ecosistema transformers/TGI/`endpoints_compatible` y la existencia de una familia de checkpoints comparables que permiten estudiar el efecto de distintas capas y de distintos prompts (textual frente a otras variantes) sobre el comportamiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (tag `qwen3` en el repositorio); configuracion exacta de capas y cabezas no publicada |
| Parametros totales | 596.049.920 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No declarada en la model card. Los checkpoints hermanos de la serie (p. ej. `camada-5`) se catalogan con 32 768 tokens; la arquitectura Qwen3 base soporta 32 768 tokens nativos (ampliables con YaRN) |
| Tipos de cuantizacion | El autor solo publica pesos en safetensors sin cuantizar. Al derivar de Qwen3 es cuantizable a GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M), GPTQ/AWQ y bitsandbytes 8/4 bits, pero no se distribuyen versiones cuantizadas |
| Idiomas soportados | No disponibles (no declarados por el autor; la base Qwen3 es multilingue, pero no hay confirmacion para este checkpoint) |
| Licencia | No disponible (la model card deja el campo vacio; la licencia de la base Qwen3 no se hereda automaticamente si el autor no la declara) |
| Formato de pesos | `safetensors` (repositorio de 2,4 GB, consistente con pesos en fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo denso, etiquetado como `qwen3` en los metadatos del Hub, con 596 millones de parametros. El unico dato estructural verificable es el recuento de parametros de los tensores; no se ha publicado informacion sobre numero de capas, dimension oculta, tipo de atencion, si emplea Grouped Query Attention, ni sobre la funcion de activacion o la normalizacion. El nombre del checkpoint ("camada-16") apunta a una intervencion en la capa 16 de la red, y el sufijo "prompt-textual" a una condicion de prompting basada en texto, pero ninguna de las dos cosas esta documentada por el autor.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. Tampoco se documentan hiperparametros, regimen de precision (fp32, bf16, fp16), hardware utilizado ni duracion del entrenamiento. El unico enlace a arXiv presente en el repositorio (`arxiv:1910.09700`) corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, incluido por defecto en la plantilla de model card de Hugging Face: no es el paper del modelo y no aporta informacion tecnica sobre el.

## Capacidades

- Generacion de texto autoregresiva y modo conversacional (tags `text-generation` y `conversational`), orientada segun el autor a contenido metaforico.
- Reformulacion entre registro figurado y literal, a juzgar por la existencia de un checkpoint hermano llamado `camada-15-literal-metaforica`.
- Compatibilidad declarada con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- Carga directa con la libreria `transformers`.
- Capacidad multilingue: no confirmada para este checkpoint; la base Qwen3 es multilingue, pero el autor no declara idiomas.
- Tool calling / function calling: no declarado ni verificado.
- Modo "thinking" o razonamiento extendido: no declarado ni verificado.
- Vision, audio o multimodalidad: no soportado (el repositorio solo contiene pesos de lenguaje y tags de generacion de texto).

## Casos de uso

- Experimentacion academica sobre representaciones por capas: la serie de checkpoints `camada-5`, `camada-15` y `camada-16` permite comparar, con el mismo prompt y la misma base, como cambia la salida segun la capa intervenida. Util para trabajos de interpretabilidad mecanicista con presupuesto de computo minimo (1,19 GB de pesos en BF16).
- Prototipado local y en el borde (edge): con 596 M parametros el modelo cabe en GPUs de consumo de 4 GB o menos e incluso puede ejecutarse en CPU, lo que lo hace adecuado para validar una idea de producto antes de invertir en un modelo mayor.
- Normalizacion de lenguaje figurado en pipelines de extraccion de informacion: convertir metaforas y expresiones idiomaticas en enunciados literales antes de pasarlos a un extractor de entidades o a un motor de busqueda semantica, aprovechando la orientacion "literal-metaforica" de la familia.
- Aumento de datos para corpus de metaforas: generar variantes parafrastricas de un conjunto semilla para entrenar o evaluar clasificadores de lenguaje figurado, con la advertencia de que la calidad de las variantes no esta medida.
- Docencia y formacion: ejemplo completo y ligero de fine-tune sobre Qwen3 para talleres de ajuste fino, comparacion de checkpoints y evaluacion cualitativa, dado su tamano y su despliegue trivial.
- Pruebas de integracion de infraestructura de serving: al ser compatible con TGI y con endpoints tipo OpenAI, sirve para validar pipelines de despliegue (routing, batching, timeouts, KV cache) sin consumir GPU de gama alta.
- Chatbot de demostracion en un entorno controlado: conversacion multi-turno de baja concurrencia en local, siempre con revision humana y sin exponerlo a usuarios reales sin una evaluacion previa de calidad y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada (MMLU, HumanEval, GSM8K, MT-Bench u otras), y el repositorio no incluye scripts ni artefactos de evaluacion.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (596,05 M); no son mediciones publicadas por el autor.

- VRAM para pesos: aproximadamente 1,19 GB en BF16/FP16, 2,38 GB en FP32 (coincide con el tamano del repositorio), unos 0,6 GB en INT8 y unos 0,4 GB en GGUF Q4_K_M.
- Cache KV: si la configuracion sigue el esquema GQA tipico de Qwen3 (28 capas, 8 cabezas KV, `head_dim` 128), el coste seria de unos 0,11 MB por token en FP16, es decir, aproximadamente 0,9 GB para 8 000 tokens y 3,6 GB para 32 768 tokens. Dato estimado, no confirmado.
- VRAM total orientativa: 4 GB son suficientes para inferencia en BF16 con contextos de 4 000-8 000 tokens; 8 GB permiten contextos largos o mayor batching.
- GPU recomendadas: cualquier GPU con 4 GB o mas (RTX 3050, RTX 4060, GTX 1660 Super, T4). Para serving con concurrencia, A10G, L4 o A100 con batching continuo. No requiere A100/H100 para uso individual.
- CPU y Apple Silicon: viable en inferencia por CPU con llama.cpp u Ollama; en Mac con memoria unificada funciona sin problema por el reducido tamano.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), Text Generation Inference (tag declarado), vLLM, llama.cpp y Ollama (prevía conversion a GGUF, no distribuida por el autor), y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|
| `luisastellet/qwen-metaphor-unke-camada-16-prompt-textual` | 596,05 M | No declarado (hermanos de serie: 32 768) | No disponible | Publicado en el Hub, 0 descargas, 0 likes, sin evaluacion |
| Qwen3-0.6B (base de referencia) | 0,6 B | 32 768 nativos; 131 072 con YaRN | Apache 2.0 | Ampliamente disponible, con model card completa y benchmarks publicados por el autor |
| Qwen2.5-0.5B | 0,49 B | 32 768 nativos | Apache 2.0 | Disponible, con versiones GGUF, AWQ y GPTQ de terceros |
| Llama 3.2 1B | 1,24 B | 128 000 | Licencia comunitaria Llama 3.2 | Disponible, con amplio soporte de herramientas |

El rendimiento comparado no puede establecerse: no hay ningun benchmark publicado para este checkpoint, por lo que la comparacion con Qwen3-0.6B o Qwen2.5-0.5B se limita a parametros, contexto declarado, licencia y madurez del ecosistema.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial. Aunque la base Qwen3 se distribuye bajo Apache 2.0, un fine-tune puede tener condiciones distintas y el autor no las especifica; en un contexto de produccion esto es un bloqueo legal hasta aclararlo.
- Model card vacia: se desconoce el dataset de entrenamiento, el numero de tokens, el regimen de precision y si hubo filtrado de datos. No es posible evaluar riesgo de contaminacion ni de sesgos.
- Sin evaluaciones: no hay benchmarks, ni evaluacion cualitativa, ni cartas de limitaciones. El modelo no ha sido validado por terceros (0 descargas, 0 likes en la fecha de los metadatos).
- Riesgo de alucinacion: en un modelo de 0,6 B el conocimiento factual es muy limitado y la tasa de invencion es estructuralmente alta; no debe usarse como fuente de datos sin verificacion.
- Ambito restringido: el nombre indica especializacion en generacion metaforica o reformulacion literal-metaforica. Fuera de ese dominio cabe esperar un comportamiento degradado respecto a la base Qwen3.
- Idiomas no declarados: no hay confirmacion de cobertura del castellano ni de ninguna otra lengua; el nombre de la serie ("camada" es portugues) sugiere un autor lusohablante, pero es una inferencia, no un dato.
- Contexto no declarado: no debe asumirse una ventana de 32 768 tokens para este checkpoint concreto sin verificacion empirica; el dato procede de un modelo hermano.
- Nomenclatura ambigua: "camada-16" y "prompt-textual" no estan definidos; no se sabe si implican una modificacion de pesos, una intervencion en activaciones en tiempo de inferencia o una condicion de entrenamiento.
- Sin garantia de mantenimiento: el repositorio se creo y actualizo en el mismo intervalo de 24 segundos y no muestra actividad posterior; puede quedar sin soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-16-prompt-textual
- Repositorio de la familia (checkpoint sin numerar): https://huggingface.co/luisastellet/qwen-metaphor-unke
- Checkpoint hermano camada-15: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-15
- Variante `literal-metaforica` en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-15-literal-metaforica
- Ficha de la variante `literal-metaforica` en free2aitools: https://free2aitools.com/model/luisastellet/qwen-metaphor-unke-camada-15-literal-metaforica
- Checkpoint hermano camada-5 en Featherless: https://featherless.ai/models/luisastellet/qwen-metaphor-unke-camada-5
- Referencia incluida por la plantilla de model card (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
