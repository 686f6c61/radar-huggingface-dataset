# MC7ever/Spark-X2.6-4B-Tema_Q-Abliterated_preview

## Resumen

Spark-X2.6-4B-Tema_Q-Abliterated_preview es un ajuste fino experimental del modelo base XHToken/Spark-X2.6-4B, publicado por el usuario MC7ever en Hugging Face. Se trata de una variante "abliterated" y "uncensored", es decir, un modelo al que se le han eliminado total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original, orientado a experimentacion con generacion de texto sin filtros. El modelo tiene 4.112.079.360 parametros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors con un repositorio de 8,2 GB.

La model card es extremadamente escueta y no aporta informacion tecnica sustantiva: el autor remite a los archivos y commits del repositorio para cualquier detalle. No se especifican la longitud de contexto, los datos de entrenamiento, el proceso de ablacion ni los resultados de evaluacion. El modelo declara soporte para ingles y chino, licencia Apache 2.0 y esta etiquetado como "preview", lo que indica que se trata de una version temprana e incompleta de un trabajo en curso.

Su relevancia es limitada y fundamentalmente experimental: resulta de interes para quienes investigan tecnicas de ablacion de alineacion, comportamiento de modelos sin censura o ajuste fino sobre arquitecturas poco convencionales (la etiqueta "looped" sugiere una arquitectura con capas recurrentes o compartidas). No es un modelo recomendable para produccion ni para uso comercial sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado "looped" por el autor; detalles no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura. El modelo base es XHToken/Spark-X2.6-4B, y las etiquetas del repositorio incluyen "spark2_5", "sparkx2_5" y "looped", lo que apunta a una variante de la familia Spark con algun tipo de mecanismo de capas recurrentes o compartidas, pero el autor no documenta la estructura interna, el numero de capas, las dimensiones de atencion ni el tipo de positional encoding. Tampoco se especifica si emplea atencion completa o alguna variante eficiente.

Respecto al entrenamiento, la model card no indica el numero de tokens utilizados, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO. La etiqueta "Tema_Q-Abliterated" y el tag "heretic" indican que se aplico alguna tecnica de ablacion de direcciones de rechazo (del tipo abliteration, que proyecta fuera del espacio de activaciones la direccion asociada a la negativa a responder), pero no se documenta el metodo exacto, el conjunto de prompts utilizado para calcular la direccion ni el grado de ablacion aplicado. El autor describe el modelo como "experimental" y "preview", sin mas detalle tecnico.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Comportamiento sin censura: el proceso de ablacion elimina o reduce los rechazos a peticiones que el modelo base declinaría.
- Soporte de plantillas de chat (tag "chat-templates"), aunque no se documenta el formato exacto.
- Requiere codigo personalizado (tag "custom_code" y "custom code"), por lo que la carga con transformers puede necesitar `trust_remote_code=True`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a en y zh segun los metadatos.

## Casos de uso

- Investigacion sobre ablacion de alineacion: el modelo sirve como objeto de estudio para medir como cambia la tasa de rechazo, la coherencia y la utilidad tras eliminar la direccion de negativa, comparandolo con el modelo base XHToken/Spark-X2.6-4B.
- Evaluacion de robustez de filtros de seguridad: util para probar clasificadores y guardrails propios frente a un modelo deliberadamente sin censura, verificando si detectan contenido problematico.
- Experimentacion con arquitecturas "looped": dado el etiquetado del autor, puede emplearse para estudiar el comportamiento de modelos con capas recurrentes en tareas de generacion larga, siempre que se valide primero su calidad.
- Generacion de texto creativo sin restricciones en entornos controlados: escritura de ficcion o guiones donde el modelo base rechazaria ciertos temas, con revision humana obligatoria.
- Chat conversacional en ingles o chino para prototipos internos: aprovechando el formato de plantilla de chat, aunque sin garantias de contexto largo al no documentarse la ventana.
- Benchmarking de tecnicas de cuantizacion: al ser un modelo de 4,1B en safetensors, permite convertir a GGUF y comparar degradacion de calidad en distintos niveles de cuantizacion, si bien el autor no publica conversiones listas.
- Estudio de sesgos y toxicidad: analisis de como la ablacion afecta a la produccion de contenido sesgado o danino en comparacion con el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 10-12 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits (si se convierte a GGUF): alrededor de 2,5-3 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para fp16 sin problemas; RTX 3090, 4080 o 4070 Ti (12-16 GB) suficientes en fp16 con contexto corto o en 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4-8 bits; en fp16 requiere 12 GB o mas.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; vLLM, llama.cpp, Ollama o TGI no estan confirmados y requeririan conversion y verificacion del codigo personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MC7ever/Spark-X2.6-4B-Tema_Q-Abliterated_preview | 4,1B | no disponible | Apache 2.0 | Abliterated, experimental, requiere custom code |
| XHToken/Spark-X2.6-4B (base) | 4,1B | no disponible | no disponible | Modelo original con alineacion intacta |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community | Referencia de tamano similar, alineado, ampliamente soportado |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | Alternativa multilingue con soporte de tool calling |

La comparacion con Llama y Qwen es meramente orientativa por tamano; no hay datos de rendimiento del modelo Spark que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo sin censura: la ablacion elimina los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o sexual sin filtro. No apto para aplicaciones de cara al publico sin guardrails externos.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, contexto, evaluacion ni metodo de ablacion, lo que impide validar su calidad.
- Etiquetado como "preview" y "experimental": el autor advierte que es una version temprana y que habra mas versiones, por lo que la API y los pesos pueden cambiar.
- Requiere codigo personalizado: la carga con transformers exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor; revisar el codigo antes de usarlo en produccion.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado ni garantizado.
- Riesgo de alucinacion y degradacion de coherencia: la ablacion puede afectar a la calidad general del modelo base; no hay benchmarks que lo cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion y el caracter experimental hacen desaconsejable su uso en produccion sin auditoria propia.
- Solo se distribuyen pesos safetensors; no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/MC7ever/Spark-X2.6-4B-Tema_Q-Abliterated_preview
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
