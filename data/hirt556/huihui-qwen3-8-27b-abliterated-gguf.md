# Hirt556/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Hirt556/Huihui-Qwen3.8-27B-abliterated-GGUF es un reempaquetado en formato GGUF de la familia de modelos abliterados Huihui-Qwen3.8-27B publicada por huihui-ai, a su vez derivada del modelo base Qwen/Qwen3.8-27B. La abliteracion es una tecnica de edicion de pesos que elimina o atenua la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de responder con negativas ante determinadas peticiones. El repositorio de Hirt556 redistribuye y, en algunos casos, reconvierte las cuantizaciones de huihui-ai (la clasificacion publica en abliteration.org lo etiqueta como reempaquetado de cuantizacion).

El modelo tiene 27.320.697.856 parametros (unos 27,3 mil millones) segun los pesos en safetensors, y su pipeline declarado es image-text-to-text, por lo que incluye un componente visual ademas del decodificador de lenguaje. Las etiquetas del repositorio apuntan a una arquitectura de atencion hibrida (hybrid-attention) con componentes de tipo SSM (el tensor ssm_out aparece en la lista de pesos que se cuantizan de forma especial) y un modulo MTP (multi-token prediction) que, segun la model card, no ha sido modificado por el proceso de abliteracion.

La relevancia de esta ficha es doble: por un lado, permite ejecutar localmente un modelo de ~27B con capacidades multimodales en hardware de consumo gracias a las cuantizaciones GGUF; por otro, documenta un caso de estudio de abliteracion parcial por rangos de capas (por ejemplo, capas 17 a 52 o 22 a 52, segun la serie) y de kernels ternarios de atencion hibrida que requieren un fork especifico de llama.cpp. Se trata, en palabras del propio autor, de una implementacion de prueba de concepto con fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (tag hybrid-attention) y componentes SSM; incluye modulo MTP y torre visual. Detalle completo no disponible |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) segun pesos safetensors |
| Parametros activos | No aplica: no se describe como modelo MoE en la informacion disponible |
| Longitud de contexto | No disponible de forma oficial. Los ejemplos de la model card usan `-c 262144` (262.144 tokens) con llama.cpp |
| Tipos de cuantizacion | bf16; Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K_L, Q8_0_L; series UD, UD-DW, GSQ-RCO y Ternary (PTQ1 reconvertido a Q2_K o Q3_K). No es una cuantizacion estandar: ciertos tensores (token_embd, output, ffn_down, ssm_out, attn_output) se elevan a Q8_0 o BF16 en las variantes `_L` |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en los metadatos de HuggingFace y en la model card) |
| Formato de pesos | GGUF (multitud de variantes); el recuento de parametros procede de pesos safetensors del modelo base |
| Tamano del repositorio | 703,1 GB (suma de todos los ficheros publicados) |
| Modelo base | Qwen/Qwen3.8-27B |
| Descargas y likes del repositorio | 0 descargas, 0 likes en el momento de la consulta. Los repositorios de huihui-ai asociados registran cifras mucho mayores (se citan 2,2 M de descargas y 912 likes para huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF en abliteration.org) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base: no se indican el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineacion. Lo que si puede deducirse de los metadatos y de la model card es la estructura: se trata de un modelo con atencion hibrida, ya que entre los tensores sometidos a tratamiento especial aparece `ssm_out`, propio de capas de espacio de estados, junto con tensores de atencion convencionales (`attn_output`) y de feed-forward (`ffn_down`). El repositorio tambien menciona un modulo MTP (multi-token prediction) y un componente visual que la abliteracion no modifica.

La innovacion principal de esta publicacion no esta en el entrenamiento, sino en la pospublicacion. Por un lado, la abliteracion se aplica solo a un rango de capas: la serie UD ablitera las capas 17 a 52 (indice base 0), mientras que las series UD-DW, GSQ-RCO y Ternary abliteran las capas 22 a 52; las primeras 15 capas se conservan intactas en la nota original. Por otro, los pesos implicados en la abliteracion se reconvierten a Q8_0 o BF16 para mejorar la calidad de respuesta, lo que explica que una cuantizacion Q2_K_L pueda ocupar mas que una Q3_K o Q4_K. Las variantes Ternary emplean kernels ternarios de atencion hibrida que solo funcionan en el fork PrismML-Eng/llama.cpp; llama.cpp estandar no puede ejecutarlas.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline declarado como image-text-to-text.
- Procesamiento de imagenes junto a texto (torre visual presente y no modificada por la abliteracion), aunque no se detallan las tareas visuales soportadas.
- Prediccion multi-token mediante el modulo MTP, orientada a acelerar la decodificacion.
- Reduccion de rechazos: la abliteracion elimina total o parcialmente el comportamiento de negativa ante peticiones que el modelo original rechazaria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no confirmado en la informacion disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite estudiar como varia la tasa de rechazo al abliterar rangos concretos de capas, comparando las series que abliteran desde la capa 17 con las que empiezan en la 22 y con el modelo original sin modificar.
- Red teaming y evaluacion de robustez: sirve para generar intentos de jailbreak y contenido limite en un entorno controlado, con el objetivo de medir la eficacia de filtros externos y sistemas de moderacion.
- Procesamiento de documentos con componente visual: al declarar el pipeline image-text-to-text, puede emplearse en tareas de descripcion de imagenes o extraccion de informacion de capturas y diagramas, siempre que se valide su calidad real en ese dominio.
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K, Q3_K y Q2_K_L permiten ejecutar un modelo de ~27,3 B en tarjetas de 24 GB o menos, con recorte de contexto si es necesario.
- Comparacion de cuantizaciones: el repositorio esta pensado para evaluar el impacto de elevar ciertos tensores a Q8_0 o BF16 en las variantes `_L`, lo que resulta util para decidir que compromiso entre tamano y calidad conviene en produccion.
- Pruebas de kernels experimentales: las variantes Ternary permiten validar los kernels ternarios de atencion hibrida del fork PrismML-Eng/llama.cpp en hardware CUDA o Metal.
- Asistente conversacional sin conexion con requisitos de privacidad: al ser un modelo de pesos abiertos ejecutable con llama.cpp u Ollama, los datos no salen del equipo; el coste es que no hay ninguna garantia de seguridad por defecto.
- Generacion de datos sinteticos sin filtros para experimentos de destilacion o aumento de dataset, bajo supervision humana y con revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni similares, y tampoco se aportan mediciones de latencia o throughput. El unico dato cuantitativo de rendimiento indirecto es la longitud de contexto empleada en el ejemplo de llama.cpp (262.144 tokens) y la presencia del modulo MTP, que en principio mejora la velocidad de decodificacion, pero sin cifras publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 27,32 B de parametros, incluye solo pesos y no el cache KV):
  - bf16: en torno a 55 GB.
  - Q8_0 / Q8_0_L: en torno a 29 GB.
  - Q6_K / Q6_K_L: en torno a 22 GB.
  - Q5_K: en torno a 19 GB.
  - Q4_K: en torno a 16,5 GB.
  - Q3_K: en torno a 13 GB.
  - Q2_K / Q2_K_L: en torno a 11 GB (puede superar a Q3_K y Q4_K por la reconversion de tensores a Q8_0).
- A contexto largo el cache KV crece de forma significativa; usar 262.144 tokens exige memoria muy superior a la de los pesos, especialmente en bf16 o Q8_0.
- GPU recomendadas para las variantes de mayor precision: A100 80 GB, H100 80 GB o varias GPU con tensor parallelism.
- GPU de consumo: Q4_K y Q3_K caben en una RTX 4090, RTX 3090 o similar de 24 GB; Q2_K_L puede caber en tarjetas de 12-16 GB, a costa de perdida de calidad y de contexto reducido.
- Soporte Metal declarado en las etiquetas, por lo que es viable en Mac con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (recomendado y con ejemplo explicito), Ollama mediante `huihui_ai/Qwen3.8-abliterated`. Soporte en vLLM o TGI: no confirmado en la informacion disponible.
- Aviso critico de despliegue: las variantes Ternary solo se ejecutan con el fork PrismML-Eng/llama.cpp; llama.cpp estandar fallara al cargarlas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hirt556/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B | No disponible (ejemplos con 262.144 tokens) | GGUF (multiples cuantizaciones) | apache-2.0 | Reempaquetado; 0 descargas en el momento de la consulta; variantes Ternary requieren fork |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible | No disponible | safetensors | apache-2.0 | Version original abliterada por huihui-ai; origen del trabajo |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | No disponible | No disponible | GGUF | apache-2.0 | Repositorio GGUF de referencia; se citan 2,2 M de descargas y 912 likes |
| Qwen/Qwen3.8-27B | No disponible | No disponible | safetensors | No disponible | Modelo base sin abliterar; conserva los filtros de seguridad originales |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real entre estas variantes.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteracion reduce deliberadamente los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. El propio autor recomienda uso en investigacion, pruebas o entornos controlados.
- Riesgo de alucinacion y de degradacion de calidad: no hay evaluaciones publicadas que cuantifiquen cuanto pierde el modelo respecto al original; las cuantizaciones agresivas (Q2_K, Q3_K) agravan este riesgo.
- Abliteracion parcial: al abliterar solo ciertos rangos de capas, el comportamiento puede ser inconsistente, con rechazos en unos temas y respuestas sin filtro en otros.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de idioma: no se especifica la cobertura linguistica; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Restricciones de licencia: se declara apache-2.0, lo que en principio permite uso comercial, pero el modelo base y sus derivados pueden arrastrar condiciones adicionales; conviene revisar la licencia de Qwen/Qwen3.8-27B antes de explotarlo comercialmente.
- Compatibilidad de herramientas: las variantes Ternary no funcionan con llama.cpp estandar y exigen el fork PrismML-Eng/llama.cpp.
- Distribucion no oficial: este repositorio es un reempaquetado de terceros (autor Hirt556) de artefactos de huihui-ai; no hay garantia de trazabilidad ni de soporte, y registra 0 descargas y 0 likes, lo que reduce la validacion por parte de la comunidad.
- Repositorio de 703,1 GB: la descarga completa es impracticable en muchos entornos; conviene seleccionar un unico fichero GGUF.
- Responsabilidad legal y etica: el usuario asume las consecuencias del contenido generado; se recomienda monitorizacion y revision manual en cualquier flujo de trabajo.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Hirt556/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version abliterada original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- GGUF de referencia de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Arbol de ficheros del GGUF de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/tree/main
- Ficha en abliteration.org: https://abliteration.org/models/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Ficha en YouRunAI: https://www.yourunai.com/models/huihui-ai-huihui-qwen3-8-27b-abliterated-gguf-479186
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/huihui-qwen3-8-27b-abliterated.html
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Releases de Ollama: https://github.com/ollama/ollama/releases
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- GGUF ternario de origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- GGUF GSQ-RCO de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- GGUF de unsloth (series UD y UD-DW): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
