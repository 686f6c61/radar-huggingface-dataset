# phongdq/Qwen1.5_1.8B_SFT_Dolly

## Resumen

`phongdq/Qwen1.5_1.8B_SFT_Dolly` es un ajuste supervisado (SFT) del modelo base Qwen1.5-1.8B, publicado por el usuario phongdq en HuggingFace. Por el nombre del repositorio cabe deducir que el ajuste se realizo sobre el dataset Dolly, aunque la model card no lo confirma ni documenta el proceso de entrenamiento, los hiperparametros ni la composicion de los datos. El repositorio incluye la etiqueta `qwen2`, lo que situa la arquitectura en la familia de decodificadores transformer de Qwen2, con aproximadamente 1.800 millones de parametros.

El modelo esta pensado para generacion de texto y uso conversacional, con compatibilidad declarada con `transformers`, `text-generation-inference` y endpoints. Su relevancia practica actual es limitada: se trata de un checkpoint de la serie Qwen1.5 (generacion anterior a Qwen2.5 y Qwen3), con 0 descargas y 0 likes en el momento de la consulta, y con una model card generada automaticamente por la plantilla de HuggingFace en la que casi todos los campos quedan como "[More Information Needed]".

No hay informacion publicada sobre licencia, idiomas soportados, composicion del dataset de ajuste, resultados de evaluacion ni detalles de cuantizacion. Cualquier evaluacion de este checkpoint deberia partir de una validacion empirica propia antes de considerarlo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen2` en el repositorio); detalles no disponibles en la model card |
| Parametros totales | Aproximadamente 1.800 millones, segun el identificador del modelo; no confirmado en la model card |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; no se han publicado versiones GGUF, AWQ, GPTQ ni similar en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | Pesos en formato `transformers` (safetensors de forma presumible; no confirmado). El tamano del repositorio, 3,7 GB, es coherente con pesos de 16 bits |

## Arquitectura y entrenamiento

La unica informacion tecnica fiable es la que aportan las etiquetas del repositorio: `transformers`, `pytorch`, `qwen2`, `text-generation`, `conversational`, `text-generation-inference` y `endpoints_compatible`. Esto indica una arquitectura de transformer decoder-only de la familia Qwen2 y un uso previsto conversacional. No hay datos en la model card sobre numero de capas, dimension oculta, numero de cabezas de atencion, tipo de atencion, tokenizador ni uso de atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, el sufijo `_SFT_Dolly` del nombre sugiere un ajuste supervisado sobre el dataset Dolly, pero el repositorio no incluye ninguna evidencia: no se documentan el numero de tokens de entrenamiento, la mezcla del dataset, la precision usada (fp16, bf16, fp32), la duracion del entrenamiento ni si hubo fases adicionales de RLHF o DPO. El unico enlace a un paper en la model card es `arxiv:1910.09700` (Lacoste et al., 2019), que aparece en la seccion plantilla de impacto medioambiental y no es una referencia al modelo. No se ha publicado informacion sobre el impacto computacional ni sobre la infraestructura empleada.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con `transformers` y con `text-generation-inference`, ademas de la etiqueta `endpoints_compatible`.
- Capacidad de razonamiento, generacion de codigo, matematicas o conocimiento factual: no documentada. No hay evaluaciones publicadas que permitan afirmarla ni descartarla.
- Soporte de tool calling / function calling: no disponible; la model card no lo menciona y el modelo base Qwen1.5-1.8B no destacaba por esta funcion frente a versiones posteriores.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles. El repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponibles. No hay indicios de que el checkpoint incorpore ninguna de ellas.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de ~1,8B de parametros, puede ejecutarse en una unica GPU de gama media para validar flujos de dialogo multi-turno antes de invertir en modelos mayores. Requiere validacion previa, dado que no hay evaluaciones publicadas.
- Experimentacion academica con tecnicas de SFT: el checkpoint puede usarse como punto de comparacion para estudiar el efecto del ajuste supervisado sobre un base model pequeno, siempre que se documente la receta de ajuste aplicada.
- Generacion de texto asistida en herramientas internas: tareas de resumen, reescritura o clasificacion de texto dentro de un pipeline controlado, con revision humana obligatoria por el riesgo de alucinacion.
- Base para ajuste con LoRA o QLoRA en dominio especifico: al ser un modelo pequeno, el coste de un ajuste adicional sobre datos propios es bajo y puede hacerse en una GPU consumer de 24 GB.
- Despliegue en entornos con recursos limitados: una vez cuantizado, puede servir como componente de generacion en aplicaciones de escritorio o edge donde no se dispone de aceleradores de gran capacidad.
- Evaluacion comparativa de checkpoints comunitarios: util como muestra de referencia para estudiar la calidad de los ajustes SFT publicados sin documentacion, midiendo su comportamiento real frente al modelo base.
- Filtrado o preprocesado de datos sinteticos: generacion de borradores a gran escala que despues se validan con un modelo mayor, aprovechando el bajo coste por token de un modelo de 1,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada ni datos de MMLU, HumanEval, GSM8K, MT-Bench o similares. Tampoco se dispone de mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, calculados a partir de un modelo de ~1,8B parametros, no medidos sobre este checkpoint):
  - fp16/bf16: en torno a 4-5 GB considerando pesos (unos 3,6 GB) mas cache KV y activaciones.
  - int8: en torno a 2-3 GB.
  - int4: en torno a 1,5-2,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 o H100 son suficientes y quedan sobredimensionadas para el modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6-8 GB o mas, y en cuantizacion int4 incluso en equipos con menos VRAM.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (TGI, etiqueta del repositorio), `endpoints_compatible` (compatible con la API de Inference Endpoints). vLLM y llama.cpp deberian funcionar al tratarse de una arquitectura Qwen2 estandar, pero no hay confirmacion del autor y no se han publicado pesos en GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa se realiza con modelos de la misma categoria (modelos base densos de 1-2B parametros). Los datos de las alternativas proceden del conocimiento general de esos modelos y no han podido verificarse en la busqueda web realizada, por lo que deben confirmarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phongdq/Qwen1.5_1.8B_SFT_Dolly | ~1,8B (segun nombre) | no disponible | no disponible | HuggingFace, checkpoint comunitario con 0 descargas |
| Qwen1.5-1.8B (modelo base) | ~1,8B | 32.768 tokens segun la documentacion del modelo base (no verificado en esta busqueda) | Licencia Tongyi Qianwen (segun el modelo base) | HuggingFace, ampliamente utilizado |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens segun la documentacion del modelo base (no verificado en esta busqueda) | Apache 2.0 (modelos de la serie pequena, segun el modelo base) | HuggingFace |
| Llama 3.2 1B | ~1,2B | 128.000 tokens segun la documentacion del modelo base (no verificado en esta busqueda) | Licencia comunitaria de Llama 3.2 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que no es posible establecer si supera o no al modelo base del que deriva. Este es el principal riesgo de adoptarlo frente a alternativas con documentacion completa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla automatica de HuggingFace con todos los campos marcados como "[More Information Needed]".
- Licencia no declarada: no se puede confirmar que el uso comercial este permitido. Ademas, al derivar de Qwen1.5, las condiciones del modelo base podrian aplicar y no estan reflejadas en este repositorio.
- Procedencia del ajuste no verificada: la unica evidencia del uso del dataset Dolly es el propio nombre del repositorio.
- Sin evaluaciones publicadas: no hay benchmarks, ni evaluaciones humanas, ni comparaciones con el modelo base que permitan estimar la calidad del ajuste.
- Riesgo de alucinacion: inherente a los modelos de este tamano, agravado por la ausencia de evaluaciones que lo cuantifiquen. No se recomienda su uso en tareas de decision automatizada sin supervision humana.
- Sesgos conocidos: no documentados. Al no haberse publicado la composicion del dataset de ajuste, no es posible analizar sesgos de genero, raza, idioma o dominio.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin una evaluacion especifica.
- Longitud de contexto no confirmada: si el checkpoint hereda la ventana del modelo base, podria ser amplia, pero no hay confirmacion y el autor no la documenta.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni de soporte por parte del autor. La fecha de creacion registrada (2026-09-12) resulta anomala.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a foros de administracion de correo Zimbra y no guardan relacion con el checkpoint.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/phongdq/Qwen1.5_1.8B_SFT_Dolly
- Modelo base de referencia (Qwen1.5-1.8B): https://huggingface.co/Qwen/Qwen1.5-1.8B
- Dataset Dolly (referencia del posible ajuste): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la model card: https://mlco2.github.io/impact
