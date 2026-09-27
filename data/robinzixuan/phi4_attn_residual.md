# robinzixuan/Phi4_attn_residual

## Resumen

Phi4_attn_residual es un ajuste fino publicado por el usuario robinzixuan sobre microsoft/Phi-4-mini-instruct, un modelo causal de la familia Phi-4. El repositorio declara 4 138 011 712 parametros (~4,14 mil millones) y un tamano de 16,6 GB, lo que sugiere que los pesos se almacenan en precision de 32 bits. La licencia es MIT y el unico cambio declarado respecto al modelo base es la incorporacion de residuales de atencion (attention residuals).

La tecnica de attention residual (AttnRes), descrita en el articulo arXiv 2603.15031 y con implementacion de referencia en el repositorio MoonshotAI/Attention-Residuals, sustituye la acumulacion clasica de conexiones residuales (PreNorm con pesos unitarios fijos) por una atencion softmax sobre las salidas de las capas anteriores. De este modo, cada capa agrega de forma selectiva y dependiente de la entrada las representaciones previas, en lugar de sumarlas todas con el mismo peso. El autor etiqueta el modelo como phi3 y causal-lm, y la model card indica que la arquitectura es Phi3ForCausalLM, soportada de forma nativa por transformers.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de una publicacion sin descargas (0), con un unico "like", sin resultados de evaluacion, sin idiomas declarados y con una model card de apenas unas lineas. Resulta util como ejemplo de aplicacion experimental de AttnRes sobre un modelo pequeno, pero no existen evidencias publicas de que el ajuste haya mejorado el rendimiento del modelo base ni de que la modificacion arquitectonica se haya entrenado correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (transformer decoder-only causal) con residuales de atencion (AttnRes) |
| Parametros totales | 4 138 011 712 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base microsoft/Phi-4-mini-instruct declara 128 000 tokens, pero el autor no confirma este dato para el ajuste |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Requiere codigo remoto | El repositorio incluye la etiqueta custom_code, aunque la model card afirma que la arquitectura esta soportada de forma nativa por transformers |
| Fecha de publicacion | 26 de septiembre de 2026 (segun los metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only de la familia Phi-4 orientado a texto y con soporte declarado de function calling. Sobre esa base, el autor aplica residuales de atencion: en lugar de que cada bloque sume su salida a un estado residual acumulado con peso unitario, AttnRes calcula una atencion softmax sobre las salidas de las capas precedentes. Esto permite que cada capa pondere de forma dependiente de la entrada que representaciones anteriores incorpora, lo que segun el articulo original mitiga el crecimiento descontrolado del estado oculto con la profundidad y la dilucion progresiva de la contribucion de cada capa.

No se dispone de informacion sobre el procedimiento de entrenamiento: el autor no indica el numero de tokens utilizados, la composicion del dataset, si hubo ajuste supervisado, RLHF o DPO, ni la configuracion de hiperparametros. Tampoco se especifica si se reentrenaron todas las capas o solo el mecanismo de residuales, ni si los pesos del modelo base se congelaron. La model card se limita a un ejemplo de uso con AutoModelForCausalLM y AutoTokenizer y a indicar el modelo base y la clase de arquitectura.

## Capacidades

Las capacidades que se enumeran a continuacion son las que cabria esperar por herencia del modelo base microsoft/Phi-4-mini-instruct. El autor no ha publicado ninguna evaluacion de este ajuste concreto, por lo que no hay evidencia de que se mantengan intactas tras la modificacion arquitectonica.

- Generacion de texto causal en modo decoder-only.
- Razonamiento de proposito general y resolucion de problemas de nivel medio, capacidad caracteristica de la familia Phi-4.
- Generacion y comprension de codigo, dado el enfasis del modelo base en datos de programacion.
- Razonamiento matematico basico e intermedio, heredado del entrenamiento del modelo base.
- Soporte de function calling y tool calling, segun las capacidades declaradas del modelo base.
- Flujos de agente y razonamiento en varios pasos, apoyados en la ventana de contexto del modelo base (128 000 tokens segun su documentacion, no confirmada aqui).
- Capacidad multilingue limitada, propia de la familia Phi-4-mini.
- Modo de pensamiento explicito (thinking): no disponible en la informacion publicada.
- Vision o audio: no soportados; el modelo es exclusivamente de texto.

## Casos de uso

- Experimentacion en investigacion sobre residuales: el modelo sirve como banco de pruebas para reproducir AttnRes sobre un transformer pequeno y comparar curvas de perdida y generacion frente al Phi-4-mini original.
- Prototipado local de asistentes conversacionales: con ~4,14 mil millones de parametros, el modelo puede ejecutarse en una GPU de consumo y usarse para iterar rapidamente en dialogos multi-turno antes de pasar a modelos mayores.
- Generacion de codigo en entornos de desarrollo: al heredar el sesgo de Phi-4-mini hacia datos de programacion, puede emplearse para autocompletar funciones, explicar fragmentos o generar pruebas unitarias en un IDE.
- Analisis de documentos extensos: si se confirma la ventana de 128 000 tokens del modelo base, permitiria resumir y consultar informes, contratos o articulos largos en una sola pasada.
- Clasificacion y extraccion de informacion: tareas de etiquetado zero-shot o few-shot sobre texto (categorizacion de tickets, extraccion de entidades) mediante prompts con ejemplos.
- Base para ajustes posteriores: al estar bajo licencia MIT y con pesos en safetensors, puede reutilizarse como punto de partida para fine-tuning especifico de dominio sin restricciones de uso comercial.
- Educacion y demostraciones: por su tamano contenido, es adecuado para talleres y cursos donde se explique como se modifica la conectividad residual de un transformer.
- Evaluacion comparativa de tecnicas de residuales: puede integrarse en experimentos que midan el efecto de AttnRes frente a conexiones residuales estandar con el mismo presupuesto de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base u otros modelos de tamano similar.

## Requisitos de hardware

- Peso de los pesos segun precision: en FP32 unos 16,6 GB (coincide con el tamano del repositorio), en BF16/FP16 unos 8,3 GB, en INT8 unos 4,2 GB y en 4 bits aproximadamente 2,2-2,6 GB de forma orientativa.
- VRAM total: a los pesos hay que sumar la cache KV y las activaciones, por lo que conviene reservar un margen adicional del 20-40 por ciento segun la longitud de contexto y el tamano de lote.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) o A6000 (48 GB) permiten FP32, FP16 y lotes grandes sin problemas.
- GPU de consumo de gama alta: RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en FP16 y en INT8 con holgura, y en FP32 con contexto moderado.
- GPU de consumo de gama media: RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) funcionan bien en FP16 con contexto reducido y en INT8 sin dificultad.
- GPU de 8-12 GB: RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 3070 (8 GB) requieren cuantizacion INT8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo de Phi3ForCausalLM), text-generation-inference (el repositorio incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM y SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publica ninguna version en ese formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no de la informacion aportada sobre este modelo; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| robinzixuan/Phi4_attn_residual | 4,14 B (~16,6 GB en FP32) | No disponible | MIT | 0 descargas, 1 like | Ajuste experimental con AttnRes, sin benchmarks |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128 000 tokens | MIT | Ampliamente distribuido | Modelo base; no se han publicado comparativas frente al ajuste |
| Qwen2.5-3B-Instruct | 3,09 B | 32 000 tokens (ampliable con YaRN) | Apache 2.0 | Muy extendido | Alternativa de tamano similar con fuerte soporte de tool calling |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Muy extendido | Alternativa de tamano similar con licencia con condiciones de uso |

No hay datos de rendimiento que permitan comparar estos modelos con Phi4_attn_residual en tareas concretas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no se publican benchmarks, curvas de entrenamiento ni comparaciones con el modelo base, por lo que no puede afirmarse que la modificacion mejore el rendimiento.
- Adopcion practicamente nula: 0 descargas y 1 "like" en el momento de redactar esta ficha implican que no existe validacion por parte de la comunidad.
- Documentacion minima: la model card no describe el dataset de entrenamiento, los hiperparametros, la semilla ni el procedimiento de ajuste.
- Codigo personalizado: la etiqueta custom_code sugiere que puede ser necesario trust_remote_code para cargar el modelo, lo que implica ejecutar codigo de un tercero y requiere revision previa.
- Riesgo de degradacion silenciosa: modificar el mecanismo de residuales altera la propagacion de senales en profundidad; sin evaluacion, es posible que el ajuste haya dañado capacidades del modelo base.
- Contexto sin confirmar: aunque el modelo base declara 128 000 tokens de ventana, el autor no lo verifica y no se ha probado la estabilidad de la generacion en contextos largos tras el ajuste.
- Idiomas no declarados: se desconoce el soporte real de idiomas distintos del ingles y su calidad.
- Sesgos y alucinaciones: al no documentarse el dataset, no es posible acotar los sesgos; como cualquier modelo generativo, puede producir contenido falso con apariencia de veracidad, especialmente en dominios especializados.
- Restricciones de licencia: la licencia MIT del ajuste es permisiva, pero conviene verificar la licencia del modelo base y de cualquier dato de entrenamiento empleado antes de un uso comercial.
- Estado del repositorio: los metadatos indican una fecha de publicacion de septiembre de 2026 y un tamano de repositorio de 16,6 GB coherente con pesos en FP32, lo que sugiere que no se publicaron variantes optimizadas.
- Inadecuado para produccion critica: sin evaluacion, sin soporte y con un unico autor, no se recomienda su uso en sistemas en produccion sin una validacion exhaustiva propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robinzixuan/Phi4_attn_residual
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Phi-4 en HuggingFace: https://huggingface.co/microsoft/phi-4
- Articulo de Attention Residuals (AttnRes): https://arxiv.org/abs/2603.15031
- Repositorio oficial de Attention Residuals: https://github.com/MoonshotAI/Attention-Residuals
- Informe tecnico de Phi-4: https://arxiv.org/html/2412.08905v1
- Ficha de Phi-4 en Microsoft Research: https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/
