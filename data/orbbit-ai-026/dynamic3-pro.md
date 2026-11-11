# orbbit-AI-026/Dynamic3-pro

## Resumen

Dynamic3-pro es un modelo de lenguaje de gran escala publicado por el usuario orbbit-AI-026 en Hugging Face, identificado en su model card como el modelo principal de la familia "Dynamic 3 (Pro)" de Hi Chat, con funciones declaradas de chat, agentes, visión y direccion de Hi Code. La model card es extremadamente escueta y no aporta detalles sobre arquitectura, datos de entrenamiento ni proceso de alineamiento, por lo que la mayor parte de las especificaciones tecnicas no estan disponibles.

El dato mas relevante y verificable es el recuento de parametros en formato safetensors: 2.780.110.363.392 parametros (aproximadamente 2,78 billones), lo que situa al modelo en la categoria de modelos frontera de escala masiva, con un tamano de repositorio de 1561,4 GB. El tag `kimi_k31` sugiere una relacion con la arquitectura Kimi K3 de Moonshot AI, aunque esta inferencia no esta confirmada por el autor.

La relevancia de esta ficha es limitada en la practica: el modelo no registra descargas ni interacciones, la licencia es "other" sin terminos publicos detallados y no se han publicado benchmarks, idiomas soportados ni instrucciones de uso. Se documenta aqui lo disponible con caracter informativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `kimi_k31` sugiere base tipo Kimi K3, sin confirmar) |
| Parametros totales | 2.780.110.363.392 (~2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (tag del repositorio); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (terminos en `LICENSE`, no publicados en la model card) |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO u otras). El unico indicio tecnico es el tag `kimi_k31`, que apunta a una posible derivacion o adaptacion de la familia Kimi K3, y la presencia de `custom_code`, lo que implica que la carga del modelo requiere codigo propio del repositorio y no basta con `transformers` estandar.

El volumen de parametros (~2,78 billones) y el tamano del repositorio (1561,4 GB) son compatibles con un modelo de escala frontera, probablemente con mezcla de expertos, aunque no hay confirmacion de parametros activos ni de estrategia de atencion. No se dispone de informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la model card ("chat").
- Uso como agente: la model card menciona explicitamente "agentes".
- Vision: la model card declara capacidades de vision, sin detallar el codificador ni resoluciones soportadas.
- Funcion como "jefe" de Hi Code, es decir, coordinacion de submodelos de la familia Dynamic 3, segun la descripcion del autor.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional de proposito general: el modelo esta descrito como el nucleo de chat de Hi Chat, por lo que su uso natural es la conversacion multi-turno; la ventana de contexto real no esta publicada, lo que impide planificar conversaciones largas con garantias.
- Orquestacion de agentes: la model card lo presenta como "jefe" de Hi Code y del resto de submodelos de Dynamic 3, lo que sugiere un rol de planificacion y delegacion en pipelines multi-agente; requiere validar en produccion el soporte real de tool calling.
- Procesamiento de documentos con componentes visuales: al declarar vision, podria emplearse en extraccion de informacion de imagenes y documentos escaneados, aunque no se detalla el soporte de imagenes ni su resolucion.
- Generacion y revision de codigo asistida: su vinculacion con Hi Code lo hace candidato a tareas de programacion, si bien no hay benchmarks de codigo publicados que lo respalden.
- Experimentacion e investigacion: dado su caracter de publicacion reciente sin adopcion, es adecuado para evaluacion interna y reproduccion de resultados, no para despliegues criticos.
- Fine-tuning sobre dominio propio: al distribuirse en safetensors con licencia "other", es posible el ajuste fino, pero antes hay que revisar `LICENSE` y `NOTICE` por las condiciones de autoria del modelo de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Con ~2,78 billones de parametros, incluso en 8-bit el peso del modelo ronda los 2,8 TB, muy por encima de cualquier GPU individual; el repositorio ocupa 1561,4 GB, lo que ya exige almacenamiento de nivel de servidor.
- GPU recomendadas: no disponible. Por escala, el despliegue requeriria multiples nodos con GPUs de centro de datos (A100, H100 o superiores), sin que el autor especifique configuraciones.
- Compatibilidad con GPU de consumo: no. El modelo no cabe en RTX 4090 ni en ninguna GPU consumer individual.
- Opciones de despliegue: no disponible. El tag `custom_code` indica que la carga requiere codigo propio; no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dynamic3-pro | ~2,78 billones | no disponible | other | Hugging Face, sin descargas |
| Kimi K2 (Moonshot AI) | ~1 billon (MoE) | 128K (segun version) | modificada | Hugging Face, amplia adopcion |
| DeepSeek-V3 | 671.000 millones (MoE) | 128K | MIT (pesos) | Hugging Face, amplia adopcion |

La comparativa es orientativa: no hay datos publicados de Dynamic3-pro sobre contexto, rendimiento ni licencia efectiva, y la posible relacion con Kimi K3 no esta confirmada por el autor.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Model card minima: no se documentan datos de entrenamiento, idiomas, sesgos ni proceso de alineamiento, lo que impide evaluar riesgos de alucinacion o sesgo.
- Licencia "other": los terminos no estan publicados en la model card; es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial, especialmente por las obligaciones de atribucion del modelo de origen.
- Requisitos de infraestructura extremos: ~2,78 billones de parametros y 1561,4 GB de repositorio hacen inviable el despliegue fuera de infraestructura de centro de datos.
- Dependencia de `custom_code`: la integracion con herramientas estandar puede fallar sin el codigo del repositorio.
- Cero adopcion verificable (0 descargas, 0 likes) y publicacion muy reciente, sin comunidad que valide su comportamiento.
- Idiomas soportados no declarados: no se puede asumir un rendimiento correcto en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Dynamic3-pro
- Repositorio de Kimi K2 (referencia por el tag `kimi_k31`): https://huggingface.co/moonshotai/Kimi-K2-Instruct
- Repositorio de DeepSeek-V3 (alternativa comparable): https://huggingface.co/deepseek-ai/DeepSeek-V3
