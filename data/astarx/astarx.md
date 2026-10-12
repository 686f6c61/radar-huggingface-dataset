# ASTARX/ASTARX

## Resumen

ASTARX es un ajuste fino mediante LoRA de Qwen2.5-1.5B-Instruct en su version cuantizada a 4 bits, entrenado por el usuario ASTARX sobre Apple Silicon con la libreria MLX. El modelo se presenta como una variante mas directa y con menor tendencia a rechazar peticiones que el modelo base, manteniendo una identidad conversacional propia bajo el nombre ASTARX. El repositorio ocupa 1,7 GB y esta publicado bajo licencia Apache 2.0.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con aproximadamente 1.500 millones de parametros en el modelo base, sobre los que se anade un adaptador LoRA de bajo rango. Al tratarse de un adaptador sobre un modelo ya cuantizado a 4 bits, su objetivo es el despliegue local en equipos con recursos limitados, en particular Macs con Apple Silicon, donde MLX ofrece un rendimiento optimizado.

La relevancia de esta ficha es limitada desde el punto de vista de benchmarks publicos: el repositorio no incluye resultados de evaluacion, no declara idiomas soportados y registra cero descargas y cero me gusta en el momento de la consulta. Se trata, por tanto, de un experimento de ajuste fino personal mas que de un modelo con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5), con adaptador LoRA |
| Parametros totales | 1.5B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del adaptador (el base Qwen2.5-1.5B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | modelo base en 4 bits; adaptador LoRA en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors / MLX (adaptador LoRA) |

## Arquitectura y entrenamiento

ASTARX no es un modelo entrenado desde cero, sino un adaptador LoRA sobre `mlx-community/Qwen2.5-1.5B-Instruct-4bit`. Esto implica que la arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y sesgos de atencion QKV, en su version de 1.500 millones de parametros. El adaptador LoRA congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto resultante.

El entrenamiento se realizo con MLX, el framework de Apple para aprendizaje automatico sobre silicio propio (M-series), y el objetivo declarado por el autor es reducir los patrones de rechazo del modelo base y adoptar un estilo mas directo y claro. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de alineamiento. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en estilo directo, con identidad consistente como ASTARX.
- Reduccion de la tasa de rechazo respecto al modelo base, segun declara el autor.
- Razonamiento basico y respuesta a instrucciones, heredados de Qwen2.5-1.5B-Instruct.
- Capacidad multilingue: no declarada en la model card del adaptador; el modelo base Qwen2.5 soporta varios idiomas, pero no hay confirmacion para ASTARX.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (el modelo es exclusivamente de texto).
- Modo de pensamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistente conversacional local en Mac: el modelo esta optimizado para MLX y Apple Silicon, por lo que puede ejecutarse integramente en un portatil o Mac mini sin conexion a internet, gestionando conversaciones de baja latencia.
- Prototipado rapido de chatbots con estilo directo: al reducir los rechazos del modelo base, resulta util para experimentar con respuestas mas concisas en entornos de desarrollo.
- Generacion de texto en aplicaciones de escritorio: su tamano reducido (1,7 GB) permite empaquetarlo dentro de aplicaciones nativas de macOS que requieran inferencia local.
- Filtrado y resumen de textos cortos: con 1.500 millones de parametros, puede resumir parrafos o extraer informacion de documentos breves en tareas de baja exigencia.
- Educacion y experimentacion con LoRA: sirve como ejemplo practico de como ajustar un modelo Qwen2.5-1.5B con MLX y publicar el adaptador en HuggingFace.
- Base para nuevos ajustes finos: al ser un adaptador LoRA sobre un modelo cuantizado, otros desarrolladores pueden tomarlo como punto de partida para sus propias especializaciones.
- Generacion de contenido creativo breve: cuentos, descripciones o dialogos de extension limitada que no requieran contexto largo ni conocimiento especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de ASTARX no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para el modelo base en 4 bits, mas el espacio del adaptador LoRA y el contexto activo; un presupuesto de 2-3 GB suele ser suficiente para conversaciones normales.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM puede ejecutar el modelo base en 4 bits mediante llama.cpp o vLLM; en el ecosistema pensado por el autor, los chips Apple M1, M2, M3 y M4 con memoria unificada de 8 GB o mas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, asi como en Macs con Apple Silicon.
- Opciones de despliegue: MLX (`mlx_lm`) es la via recomendada por el autor y la unica documentada en la model card; el modelo base tambien puede ejecutarse con llama.cpp, Ollama o vLLM, aunque el adaptador LoRA requeriria conversion o carga adicional segun la herramienta.
- Latencia y throughput estimados: no disponibles; dependen por completo del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ASTARX | 1.5B (base) + LoRA | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | apache-2.0 | HuggingFace, ampliamente usado |
| Llama 3.2 1B Instruct | 1B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente usado |
| Gemma 2 2B Instruct | 2B | 8.192 tokens | Gemma Terms of Use | HuggingFace, ampliamente usado |

Los tres modelos comparables cuentan con evaluaciones publicas y comunidades activas; ASTARX, en cambio, no ofrece benchmarks ni adopcion verificable, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 1.500 millones de parametros; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: el adaptador no declara idiomas soportados ni longitud de contexto; la calidad fuera del ingles y del chino (idiomas principales del base) no esta verificada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base y el ecosistema MLX pueden imponer condiciones adicionales que conviene revisar.
- Ausencia de validacion: cero descargas y cero me gusta en HuggingFace implican que el modelo no ha sido probado por terceros; su comportamiento en produccion es desconocido.
- Reduccion de rechazos: la propiedad "uncensored" declarada por el autor puede implicar respuestas inapropiadas en dominios sensibles; requiere capas de moderacion adicionales si se despliega de cara al publico.
- Formato restringido: al estar publicado como adaptador LoRA sobre un modelo cuantizado a 4 bits en MLX, la portabilidad a otros frameworks no es directa y puede requerir conversion.
- Sin soporte de tool calling ni agentes confirmado: no se debe asumir su uso en pipelines que dependan de function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ASTARX/ASTARX
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Repositorio del modelo original Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Framework MLX: https://github.com/ml-explore/mlx
- Herramienta mlx_lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
