# Jundot/Qwen3.8-27B-oQ3e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ3e-fp16-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros (27,781B) de tipo vision-lenguaje, construido sobre la arquitectura Qwen3.5 con un diseno hibrido de capas Gated DeltaNet y Gated Attention. Lo publica el usuario Jundot, autor de la herramienta de cuantizacion oQ (oMLX v0.7.1), y su interes principal es que permite ejecutar un modelo multimodal de casi 28B parametros con capacidad nativa de 262.144 tokens de contexto en hardware Apple Silicon, con un peso total en disco de 13,697 GiB.

La particularidad del checkpoint es su esquema de cuantizacion mixta de precision: la mayor parte de los pesos (85,606%, 23,783B) se almacena en 3 bits afines con grupo de 64, mientras que un 11,177% (3,105B) se mantiene en 5 bits y un 1,341% (0,372B) en 4 bits; el codificador de vision se conserva integro en FP32 y las escalas y sesgos de cuantizacion, junto con los tensores no cuantizados, se guardan en FP16 en lugar de BF16. El resultado es un promedio efectivo de 4,235 bits por peso, con el objetivo de preservar las capas mas sensibles al ruido de cuantizacion.

Ademas del backbone de lenguaje y el codificador visual, el checkpoint incluye la cabeza de prediccion multi-token (MTP) del modelo original, lo que abre la puerta a decodificacion especulativa y a un mayor rendimiento por paso de decodificacion. La licencia es Apache-2.0, heredada del modelo fuente, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso con capas Gated DeltaNet y Gated Attention (arquitectura Qwen3.5) |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Cuantizacion mixta oQ3e: affine 3 bits grupo 64 (85,606% de los pesos), affine 4 bits (1,341%), affine 5 bits (11,177%), affine 6 bits (0,019%), FP16 (0,198%) y FP32 (1,658%); promedio efectivo 4,235 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), escalas y sesgos de cuantizacion en FP16, codificador de vision en FP32 |

Datos adicionales de almacenamiento:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 12,549 GB / 11,688 GiB |
| Codificador de vision | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 14,707 GB / 13,697 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros que combina dos tipos de capa: Gated DeltaNet, un mecanismo de estado recurrente con puertas que reduce el coste de memoria de la cache a lo largo de la secuencia, y Gated Attention clasica. Esta hibridacion es la que permite sostener una ventana nativa de 262.144 tokens sin que el consumo de memoria de la cache de clave-valor crezca de forma inasumible, ya que solo las capas con atencion completa requieren cache proporcional a la longitud. A esto se suma un codificador de vision (0,461B, almacenado en FP32 en este checkpoint) que habilita entrada de imagen y video, y una cabeza de prediccion multi-token (0,425B) que permite predecir varios tokens por paso.

El checkpoint publicado no aporta informacion sobre el entrenamiento del modelo original: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni recetas de alineacion. Lo que si documenta es el proceso de cuantizacion, desarrollado con oMLX v0.7.1 y la mejora "Improved oQe Quantization" (PR jundot/omlx#4385): el asignador reparte bits segun la sensibilidad medida por capa, redondea cada grupo con una matriz de importancia obtenida de 128 muestras de 512 tokens y ajusta escala y sesgo mediante minimos cuadrados ponderados. Este checkpoint concreto, ademas, fuerza FP16 para escalas, sesgos y tensores remanentes, y mantiene el encoder visual en FP32.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato instruct/conversational.
- Comprension de imagenes: la pipeline declarada es image-text-to-text y el checkpoint conserva el codificador de vision completo.
- Comprension de video, segun la descripcion del modelo base recogida en la model card.
- Contexto largo: hasta 262.144 tokens nativos, adecuado para documentos extensos, repositorios de codigo o transcripciones largas.
- Prediccion multi-token (MTP): incluye la cabeza MTP, lo que habilita decodificacion especulativa con el propio modelo.
- Razonamiento y codigo: el modelo base pertenece a la familia Qwen3.5, pero no hay documentacion especifica en la informacion disponible sobre el rendimiento en estas tareas tras la cuantizacion.
- Tool calling / function calling: no disponible.
- Uso como agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Inferencia local multimodal en Mac: con 13,697 GiB de pesos y formato MLX, el checkpoint esta pensado para ejecutarse en Apple Silicon con memoria unificada, permitiendo analisis de imagenes y texto sin conexion a servicios en la nube.
- Analisis de documentos largos con imagenes intercaladas: gracias a los 262.144 tokens de contexto, se pueden procesar informes, manuales tecnicos o articulos cientificos que combinan texto y figuras en una sola pasada, sin trocear el documento.
- Descripcion y resumen de video: el modelo acepta entrada de video ademas de imagen, lo que permite generar transcripciones comentadas, resumenes de escenas o indexacion semantica de material audiovisual.
- Extraccion de informacion estructurada de capturas y formularios: digitalizacion de documentos escaneados, facturas o paneles de control convirtiendo el contenido visual en JSON u otro formato estructurado, siempre que el comportamiento de tool calling se valide antes en produccion.
- Prototipado de asistentes conversacionales con contexto largo: al mantener conversaciones de cientos de miles de tokens, resulta util para asistentes que deben recordar el historial completo de una sesion o de un proyecto.
- Aceleracion de la decodificacion con MTP: en escenarios de generacion masiva de texto, la cabeza MTP incluida permite plantear decodificacion especulativa para reducir el numero de pasos necesarios por token generado.
- Evaluacion de tecnicas de cuantizacion: dado que el repositorio documenta con detalle la distribucion de bits por capa, sirve como referencia para estudiar la degradacion de un modelo multimodal de 27B a 3 bits en la mayor parte de sus pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del checkpoint ni los datos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 13,697 GiB en disco (14,707 GB), por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, mas el espacio de trabajo del runtime y la cache de clave-valor. Con contexto largo la cache crece, aunque las capas Gated DeltaNet mantienen estado de tamano constante y solo las capas de atencion completa escalan con la longitud de secuencia; el numero exacto de capas de atencion completa no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion del repositorio. El formato MLX esta orientado a Apple Silicon, no a CUDA.
- Compatibilidad con GPU de consumo: en el ecosistema MLX, encaja en equipos Apple Silicon con memoria unificada de 32 GB o superior para contexto corto, y conviene 64 GB o mas para aprovechar ventanas de contexto muy largas. En cuanto a GPU de consumo tipo RTX 4090 (24 GB), no hay soporte MLX nativo; seria necesario convertir los pesos a otro formato, algo que la model card no documenta.
- Opciones de despliegue: MLX y oMLX son las rutas soportadas de forma explicita. vLLM, llama.cpp, Ollama o TGI no estan mencionados en la informacion disponible y requeririan conversion previa de los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3e-fp16-mtp | 27,781B (denso) | 262.144 tokens | Mixta oQ3e, 4,235 bits/peso efectivos | Apache-2.0 | MLX, safetensors |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B (denso) | 262.144 tokens | Sin cuantizar (precision original) | Apache-2.0 | Repositorio oficial en HuggingFace |
| Otras cuantizaciones comunitarias del mismo modelo base | 27,781B (denso) | 262.144 tokens | no disponible | Apache-2.0 (heredada) | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparacion se limita a parametros, contexto, licencia y formato. La diferencia funcional principal frente al modelo base es el menor peso en disco a costa de una precision de 3 a 6 bits en la practica totalidad de los pesos, con el encoder visual intacto en FP32.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad posteriores a la cuantizacion: el 85,606% de los pesos esta a 3 bits, por lo que la degradacion en tareas sensibles (matematicas, codigo, razonamiento de varios pasos) es un riesgo real y no cuantificado.
- La model card no documenta los idiomas soportados, las capacidades de tool calling ni el comportamiento en modo agente. Cualquier uso en produccion de estas funciones debe validarse experimentalmente antes de desplegarse.
- Riesgo de alucinacion: inherente a los modelos generativos; el proceso de cuantizacion puede acentuarlo, especialmente al operar en el limite alto de la ventana de contexto, donde la atencion se diluye.
- El modelo puede procesar imagenes y video, lo que implica superficie de ataque adicional (contenido visual malicioso, fuga de datos presentes en imagenes) que debe tratarse con las salvaguardas habituales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se trata de una cuantizacion de terceros, no de un artefacto oficial de Qwen, por lo que conviene verificar la trazabilidad de los pesos y la licencia del modelo fuente antes de integrarlo en un producto.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; trasladarlo a CUDA exige conversion a GGUF u otro formato, un proceso no documentado y con riesgo de perdida adicional de calidad.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin garantia de mantenimiento ni de correccion de errores por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Pull request de "Improved oQe Quantization": https://github.com/jundot/omlx/pull/4385
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada.
