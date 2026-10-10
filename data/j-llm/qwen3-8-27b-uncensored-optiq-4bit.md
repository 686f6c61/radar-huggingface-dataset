# j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit

# Qwen3.8-27B-Uncensored-OptiQ-4bit

## Resumen

Qwen3.8-27B-Uncensored-OptiQ-4bit es una version cuantizada y sin censura del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario j-llm en HuggingFace bajo licencia Apache 2.0. Se distribuye en formato MLX, es decir, pesos safetensors cuantizados con la libreria de Apple para ejecucion en silicio Apple (M1/M2/M3/M4), y emplea un esquema de cuantizacion de precision mixta denominado OptiQ que combina componentes de 4 y 8 bits.

El modelo es multimodal de tipo image-text-to-text: acepta imagenes y texto como entrada, y las etiquetas del repositorio incluyen terminos como "vision" y "mtp", ademas de "uncensored" y "abliterated", lo que indica que se ha eliminado o reducido el comportamiento de rechazo tipico de los modelos alineados. El repositorio declara 26.895.993.856 parametros reales en safetensors (aproximadamente 26,9 mil millones, coherente con la denominacion comercial "27B") y un tamano de 20,6 GB, derivado de la mezcla de precisiones.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de casi 27B con capacidades de vision en portatiles y equipos de sobremesa Apple con memoria unificada, sin GPU dedicada; por otro, sirve como banco de pruebas para investigacion sobre abliteration, cuantizacion de precision mixta y evaluacion de riesgos en modelos sin alineamiento. El acceso esta restringido (gated) y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas del repositorio indican "qwen3_5" y "mtp"; no se detalla si es transformer denso, MoE o hibrida |
| Parametros totales | 26.895.993.856 (aproximadamente 26,9B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta OptiQ con componentes de 4 bits y 8 bits (etiquetas: quantized, mixed-precision, 4-bit, 8-bit). No se distribuye en GGUF |
| Idiomas soportados | Ingles, chino y japones (segun etiquetas en, zh, ja) |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | Safetensors en formato MLX (pesos cuantizados para mlx-lm / mlx-vlm) |
| Tamano del repositorio | 20,6 GB |
| Pipeline | image-text-to-text (multimodal imagen + texto) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Libreria de inferencia | MLX |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en los datos proporcionados. Las etiquetas del repositorio apuntan a la familia "qwen3_5" y a "qwen3.8" para el modelo base, asi como a la presencia de decodificacion multitoken ("mtp"), una tecnica que suele emplearse para predecir varios tokens por paso y acelerar la generacion. No se confirma si la arquitectura es un transformer denso, un modelo de mezcla de expertos o un diseno hibrido, ni se especifica el tipo de atencion ni la longitud de contexto nativa.

Tampoco hay informacion sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. El modelo base lleva la etiqueta "uncensored", y este derivado anade "abliterated", lo que implica que las capas responsables del comportamiento de rechazo han sido modificadas o suprimidas respecto al modelo original. La innovacion tecnica documentada en el repositorio es la cuantizacion OptiQ de precision mixta, que asigna 8 bits a los componentes sensibles y 4 bits al resto para reducir el tamano sin degradar tanto la calidad como una cuantizacion uniforme de 4 bits.

## Capacidades

- Generacion de texto conversacional en ingles, chino y japones.
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que puede procesar imagenes junto con instrucciones en lenguaje natural.
- Modo conversacional multi-turno (etiqueta "conversational").
- Comportamiento sin censura: el modelo ha sido abliterado, por lo que no aplica rechazos por contenido del mismo modo que un modelo alineado.
- Decodificacion multitoken (etiqueta "mtp"): capacidad declarada en metadatos, sin documentacion adicional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o modo de razonamiento explicito (thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: al estar cuantizado en 4 bits con precision mixta, el modelo puede ejecutarse en un Mac con memoria unificada y gestionar conversaciones que combinen imagenes y texto sin enviar datos a servicios en la nube.
- Analisis de documentos con contenido grafico en entornos con requisitos de privacidad: al ser un modelo image-text-to-text desplegado en local, es adecuado para extraer informacion de capturas, diagramas o documentos escaneados en entornos sanitarios, legales o industriales donde no se permite la salida de datos.
- Investigacion en seguridad de IA y red teaming: la variante abliterated permite comparar sistematicamente el comportamiento de un modelo sin alineamiento frente a su equivalente alineado, midiendo tasas de cumplimiento ante peticiones sensibles.
- Evaluacion de tecnicas de cuantizacion: al usar precision mixta OptiQ con componentes de 4 y 8 bits, sirve para comparar la degradacion de calidad frente a cuantizaciones uniformes de 4 bits sobre el mismo modelo base.
- Generacion de datos sinteticos multilingues: con soporte declarado de ingles, chino y japones, puede emplearse para producir corpus de entrenamiento o evaluacion en esos tres idiomas, siempre con revision humana posterior.
- Base para ajuste fino con LoRA sobre MLX: al distribuirse en formato MLX, encaja directamente en flujos de ajuste eficiente (LoRA/QLoRA) sobre Apple Silicon para adaptar el modelo a un dominio concreto.
- Demostraciones offline en ferias, aulas o entornos aislados: un modelo de casi 27B con vision ejecutandose en un portatil Apple permite montar demos sin conexion ni infraestructura de GPU.
- Prototipado rapido de producto en equipos de desarrollo que ya trabajan con hardware Apple: reduce el coste de iteracion al evitar el alquiler de GPUs en la nube durante las fases iniciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y no se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia en 4 bits: aproximadamente 13,5 GB solo para los pesos (26,9B parametros x 0,5 bytes), mas el overhead de activaciones, cache KV y el codificador visual.
- Memoria estimada con la mezcla de precisiones realmente distribuida: el repositorio ocupa 20,6 GB, por lo que se recomienda disponer de al menos 24 GB de memoria unificada y, de forma comoda, 32 GB o mas para contexto largo e imagenes.
- GPU compatibles: MLX solo se ejecuta en silicio Apple. Chips M1, M2, M3 y M4 en cualquiera de sus variantes pueden cargar los pesos, aunque se recomienda M Max o M Ultra con 48-128 GB para un uso comodo con vision y contextos amplios.
- GPU NVIDIA (RTX 4090, A100, H100): no compatibles con estos pesos. Para CUDA seria necesario disponer de pesos en safetensors estandar o GGUF del modelo base, que no se ofrecen en este repositorio.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple de consumo con memoria unificada suficiente (MacBook Pro o Mac Studio con 32 GB o mas). No aplica a GPU de consumo NVIDIA porque el formato es MLX.
- Opciones de despliegue: mlx-lm y mlx-vlm para inferencia y servidor local; tambien es posible el ajuste fino con LoRA mediante las utilidades de MLX. vLLM, llama.cpp, Ollama y TGI no cargan pesos MLX directamente y requeririan una conversion no documentada en este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|---|
| j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit | 26,9B | OptiQ mixta 4/8 bits | No disponible | en, zh, ja | Apache 2.0 | Safetensors MLX | Gated, 0 descargas |
| orcarouter/Qwen3.8-27B-Uncensored (base) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas comparables de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se proporciona informacion sobre otros modelos cuantizados o abliterated de tamano similar que permita una comparacion fiable. Cualquier cifra de rendimiento frente a alternativas seria especulativa.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks publicados, por lo que se desconoce la degradacion real introducida por la cuantizacion mixta y por el proceso de abliteration.
- Modelo sin alineamiento: las etiquetas "uncensored" y "abliterated" indican que se han reducido o eliminado los rechazos. Puede generar contenido danino, ilegal o gravemente inapropiado, y no deberia exponerse a usuarios finales sin moderacion externa.
- Degradacion por abliteration: la modificacion de las direcciones de rechazo suele afectar a la coherencia, a la calidad de las respuestas y a la estabilidad en tareas de razonamiento, aunque no se han publicado mediciones en este caso.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad factual. Como en cualquier modelo de lenguaje, la veracidad de las salidas no esta garantizada.
- Idiomas limitados: solo se declaran ingles, chino y japones. El castellano no figura entre los idiomas soportados, por lo que su rendimiento en espanol es incierto.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar tareas de documento largo o conversaciones extensas con garantias.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero no se detalla la licencia del modelo base ni del modelo Qwen original del que deriva la cadena. Antes de un uso comercial conviene verificar la licencia efectiva de todos los eslabones y si una variante abliterated es conforme con los terminos de uso del modelo original.
- Dependencia de hardware: los pesos en formato MLX solo se ejecutan en silicio Apple, lo que bloquea su uso en infraestructura CUDA convencional.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que anade friccion a la evaluacion y a la reproducibilidad.
- Sin validacion comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta. No hay evidencia independiente de que los pesos carguen o funcionen correctamente.
- Metadatos contradictorios: la etiqueta de familia "qwen3_5" junto a "qwen3.8" y la fecha de creacion (2026) no permiten confirmar la procedencia exacta del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit
- Modelo base en HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- mlx-lm (inferencia y ajuste de modelos de lenguaje): https://github.com/ml-explore/mlx-lm
- mlx-vlm (inferencia multimodal): https://github.com/Blaizzy/mlx-vlm
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Las busquedas han devuelto unicamente resultados relacionados con la letra "J" (articulos enciclopedicos y videos infantiles), sin relacion con el modelo.
