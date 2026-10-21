# KRAFTON/Raon-1-mini-preview-gguf

## Resumen

Raon-1-mini-preview-gguf es la distribucion en formato GGUF del modelo Raon-1-mini-preview, publicado por KRAFTON en HuggingFace. Se trata de un modelo de generacion de texto de tipo conversacional con 28.783.218.602 parametros totales (aproximadamente 28,8 mil millones), empaquetado para su ejecucion con llama.cpp y con la etiqueta imatrix, que indica que las cuantizaciones se han generado usando una matriz de importancia.

El modelo se distribuye bajo licencia Apache-2.0, aunque el repositorio esta marcado como restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. El repositorio ocupa 229,7 GB, un tamano coherente con un catalogo de varias cuantizaciones GGUF de distinto nivel para un modelo de esta escala. La ficha no especifica longitud de contexto, idiomas soportados ni detalles de arquitectura o entrenamiento.

La relevancia actual del modelo es limitada y provisional: la etiqueta "preview" indica una version no final, el numero de descargas registrado es de 9 y el de likes de 20, y no se han publicado resultados de benchmarks en la informacion disponible. Su interes practico reside en que permite probar un modelo de ~28,8B en infraestructura local o en entornos compatibles con llama.cpp sin necesidad de convertir pesos desde safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo identifica el formato GGUF y la tarea text-generation; no se detalla la arquitectura del modelo base) |
| Parametros totales | 28.783.218.602 (~28,8B) |
| Parametros activos | no disponible (no se especifica si el modelo es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion generada mediante imatrix; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 229,7 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los datos proporcionados: no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida, ni se detalla el mecanismo de atencion. El unico dato estructural verificable es el recuento de parametros del repositorio de safetensors asociado, 28.783.218.602, y el hecho de que la distribucion se ofrece exclusivamente en GGUF para su uso con llama.cpp.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del corpus, las fases de alineacion (RLHF, DPO u otras) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico elemento tecnico diferencial observable es el uso de imatrix en el proceso de cuantizacion, una tecnica que estima la importancia de cada peso a partir de datos de calibracion para reducir la perdida de calidad en niveles de cuantizacion bajos. Al tratarse de una version "preview", es probable que la documentacion de entrenamiento se publique con la version final, pero esto no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y la pipeline text-generation indican uso previsto en dialogos multi-turno.
- Inferencia local mediante llama.cpp: el formato GGUF y la etiqueta "llama.cpp" permiten ejecucion en CPU, GPU o configuraciones hibridas.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el modelo puede servirse detras de una API compatible con el esquema de endpoints habitual de HuggingFace.
- Cuantizacion optimizada con imatrix: permite seleccionar niveles de compresion con menor degradacion respecto a cuantizaciones ingenuas.
- Capacidades de razonamiento, codigo, matematicas, vision, audio o tool calling: no disponibles; no se documentan en la informacion proporcionada.
- Soporte multilingue: no disponible; no se lista ningun idioma.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al estar en GGUF, el modelo puede cargarse con llama.cpp en una estacion de trabajo con una unica GPU de 24 GB usando cuantizaciones de 4 bits, lo que permite iterar en el diseno de prompts y flujos de dialogo sin coste de API.
- Evaluacion interna antes de adoptar la version final: el caracter "preview" lo hace adecuado para pruebas comparativas de calidad percibida frente a otros modelos de ~28B, no para despliegues en produccion.
- Procesamiento por lotes de texto en infraestructura propia: un modelo denso de 28,8B cuantizado a 4 bits ocupa aproximadamente 16-17 GB, de modo que puede ejecutarse en servidores sin aceleradores de gama alta para tareas de resumen o reescritura por lotes.
- Despliegue en entornos con requisitos de soberania del dato: al poder ejecutarse completamente on-premise, encaja en casos donde el texto no puede salir de la infraestructura de la organizacion, siempre que se acepten las condiciones de acceso del repositorio.
- Servicio detras de una API compatible: gracias a la etiqueta "endpoints_compatible", puede integrarse como backend en una plataforma de inferencia que ya hable el esquema de endpoints de HuggingFace, sustituyendo al proveedor sin reescribir el cliente.
- Experimentacion academica con cuantizacion: el uso de imatrix permite estudiar la degradacion de calidad entre niveles de cuantizacion sobre un mismo modelo de 28,8B, un caso habitual en trabajos de eficiencia de inferencia.
- Base para ajuste fino ligero sobre GGUF: no recomendado como via principal, ya que el ecosistema de ajuste fino trabaja mejor con safetensors; solo tiene sentido si se parte del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 28,78B parametros, no confirmada por el autor): ~57,6 GB en FP16/BF16; ~30,6 GB en 8 bits; ~16-17 GB en 4 bits; ~11-12 GB en 3 bits. A estas cifras hay que sumar el espacio de contexto y el overhead del runtime.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16; A100 40 GB o L40S 48 GB para 8 bits; para 4 bits es suficiente una GPU de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y modelos con 24 GB o mas, utilizando cuantizaciones de 4 bits y contextos moderados. En GPUs de 16 GB solo con cuantizaciones de 3 bits o parcialmente en CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, llama-cpp-python, LM Studio, KoboldCpp) son la via directa al ser un repositorio GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el repositorio en safetensors. Tambien es posible servirlo mediante una capa compatible con endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Nota de almacenamiento: el repositorio completo ocupa 229,7 GB, por lo que conviene descargar unicamente el archivo de cuantizacion necesario en lugar de clonar el repositorio entero.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada (ni benchmarks, ni contexto, ni idiomas del modelo Raon). La tabla siguiente recoge unicamente los datos verificables del modelo y deja como "no disponible" los del resto; las alternativas se citan por categoria de tamano, sin cifras que no hayan sido aportadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Acceso |
|---|---|---|---|---|---|
| KRAFTON/Raon-1-mini-preview-gguf | 28,8B | no disponible | apache-2.0 | GGUF | Restringido (gated) |
| Alternativa de ~27-32B densa (categoria) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa de ~24B densa (categoria) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa MoE de ~30B totales (categoria) | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparacion rigurosa seria necesario disponer de los resultados de evaluacion del modelo base, que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni comparaciones con lineas base, lo que impide estimar su calidad real frente a alternativas de tamano similar.
- Version "preview": el comportamiento, el tokenizador o la plantilla de chat pueden cambiar en la version final; no es una base estable para produccion.
- Acceso restringido: aunque la licencia declarada es Apache-2.0, el repositorio exige aceptar condiciones en HuggingFace. Es necesario revisar esos terminos, ya que pueden imponer restricciones adicionales al uso comercial no cubiertas por la licencia.
- Idiomas no documentados: se desconoce que lenguas estan soportadas y con que calidad; el castellano no esta confirmado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos ni estimar el coste de memoria del contexto.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala y no cuantificado en este caso por falta de evaluaciones.
- Sesgos: no documentados; no se ha publicado informacion sobre composicion del corpus ni sobre procesos de alineacion que permitan acotar sesgos conocidos.
- Ambiguedad sobre la arquitectura: al no confirmarse si es denso o MoE, no se puede estimar con precision el coste de inferencia por token ni el throughput esperado.
- Repositorio de gran tamano: 229,7 GB complican la descarga y el versionado; conviene usar descargas selectivas por archivo.
- Madurez del ecosistema: con 9 descargas registradas, hay poca evidencia externa de funcionamiento en distintas configuraciones de hardware.

## Enlaces

- HuggingFace: https://huggingface.co/KRAFTON/Raon-1-mini-preview-gguf
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
