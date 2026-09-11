# rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX

## Resumen

DeepSeek-V4.1-Flash-REAP-2bit-MLX es un artefacto experimental de solo texto publicado por el proyecto Rapid-MLX que adapta el modelo DeepSeek-V4.1-Flash de DeepSeek a un formato empaquetado nativo de MLX con cuantizacion afin de 2 bits y grupo de 64. Partiendo de la conversion de 2 bits de Vontra (DeepSeek-V4.1-Flash-MLX-2bit-MTP), este repositorio reempaqueta los expertos enrutados para permitir ejecucion por lotes nativa y aplica un pruning de saliencia de enrutamiento (REAP) que conserva 336 de los 384 expertos enrutados por capa.

El resultado es un modelo de aproximadamente 680.500 millones de parametros totales cuyo payload tensorial ocupa 212.930.051.680 bytes (~199 GiB) y que exige una maquina Apple silicon con 256 GiB de memoria unificada para cargarse. Segun la propia model card, es un artefacto de investigacion, no un producto cualificado: no alcanza el suelo de 12 tok/s fijado por Rapid-MLX (se queda un 34,0% por debajo) y requiere un cargador experimental incluido en el PR #3301 del proyecto, por lo que los cargadores estandar no son compatibles.

Su relevancia es acotada y fundamentalmente metodologica: documenta con mediciones concretas el coste de llevar un modelo MoE de gran tamano a 2 bits sobre memoria unificada Apple, y publica el artefacto exclusivamente para reproducibilidad y optimizacion posterior. Vision y MTP (multi-token prediction) quedan omitidos, por lo que la variante distribuida aqui es estrictamente text-only.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); artefacto de solo texto (vision y MTP omitidos) |
| Parámetros totales | 680.537.125.744 (~680,5 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no cualificada en este artefacto) |
| Tipos de cuantización | afín de 2 bits con grupo de 64 (2-bit/group-64), valores preservados del origen |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (41 shards, ~212,9 GB de repositorio) |

## Arquitectura y entrenamiento

No se describe en la informacion disponible un proceso de entrenamiento propio: este repositorio es una conversion cuantizada y un reempaquetado del modelo base deepseek-ai/DeepSeek-V4.1-Flash, que fue disenado y entrenado por DeepSeek. La arquitectura del artefacto es un transformer con mezcla de expertos (se mencionan 384 expertos enrutados por capa), adaptado a MLX y limitado a procesamiento de texto al omitirse los componentes de vision y de prediccion multi-token (MTP).

La innovacion tecnica del artefacto es doble. Por un lado, preserva los valores afin de 2 bits con grupo de 64 del origen mientras apila los expertos enrutados para una ejecucion por lotes nativa en MLX. Por otro, aplica un pruning de saliencia de enrutamiento (REAP) que retiene 336 de 384 expertos por capa, con una masa de enrutamiento media retenida del 99,9949% y una peor capa del 99,8564%. La calibracion REAP uso 2048 tokens causales reales divididos en dos mitades disjuntas, con un solapamiento del 92,1354% en el conjunto de expertos conservados entre ambas mitades, lo que sirve como control de estabilidad de la seleccion.

## Capacidades

- Generacion de texto: el unico caso validado de forma explicita es una respuesta factual de una frase ("The capital of France is Paris." seguida de EOS), con el enmarcado de roles requerido por el modelo.
- Razonamiento, codigo, matematicas y otras tareas: no evaluadas ni reclamadas por el artefacto.
- Tool calling / function calling: no evaluado y no reclamado.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no disponibles.
- Capacidad especial de thinking mode: la plantilla de prompt usa un marcador `</think>`, pero su comportamiento no se cualifica en la informacion proporcionada.
- Vision: explicitamente omitida en este artefacto.
- MTP (multi-token prediction): explicitamente omitido.
- Contexto largo: no evaluado y no cualificado.

## Casos de uso

- Investigacion en cuantizacion extrema: permite estudiar el comportamiento de un MoE de ~680 B con pesos afin de 2 bits y grupo de 64, midiendo fidelidad de tensores (los casos quantize/dequantize fueron bit-exactos) y estabilidad de decodificacion.
- Estudio de pruning por saliencia de enrutamiento: el artefacto conserva 336 de 384 expertos por capa con una masa de enrutamiento retenida del 99,9949%, lo que permite analizar empiricamente la relacion entre expertos podados y calidad resultante.
- Reproduccion de la cadena de conversion: sirve para replicar el pipeline Vontra (2-bit) -> REAP repack de Rapid-MLX, incluyendo la carga estricta de los 41 shards sin parametros faltantes ni inesperados.
- Validacion de paridad numerica en MLX: util para comparar prefill, decode y prefill troceado en configuraciones pequenas (diferencias relativas <= 1,4e-6 y 100% de acuerdo de argmax en la bateria de comparacion).
- Experimentacion con inferencia MoE en memoria unificada Apple: documenta el comportamiento en un Apple M3 Ultra de 60 nucleos GPU y 256 GiB, con 213,51 GB de pico de memoria MLX.
- Base para optimizacion de decodificacion: dado que la decodificacion conservadora alcanza 7,31 tok/s y el techo en decodificacion corta 7,92 tok/s, es un punto de partida para trabajar en mejoras de velocidad en MLX.
- Evaluacion de viabilidad de hardware: sirve como referencia de que un modelo de este tamano no es desplegable por debajo de 256 GiB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta unicamente mediciones de cualificacion y controles de paso/fallo, que se reproducen a continuacion.

Mediciones de cualificacion (Apple M3 Ultra, 60 nucleos GPU, 256 GiB de memoria unificada, MLX 0.32.2):

| Medicion | Resultado |
|---|---:|
| Payload tensorial | 212.930.051.680 bytes (~199 GiB) |
| Carga estricta residente | 239,44 s |
| Pico de memoria MLX | 213,51 GB |
| Decodificacion conservadora | 7,31 tok/s |
| Techo en decodificacion corta | 7,92 tok/s |
| Expertos enrutados retenidos | 336 / 384 por capa |
| Masa de enrutamiento media retenida | 99,9949% |
| Peor capa, masa retenida | 99,8564% |

Controles de paso/fallo:

| Control | Resultado | Evidencia |
|---|---|---|
| Chat factual de una frase | Pasa | Salida "The capital of France is Paris." seguida de EOS |
| Estabilidad greedy | Pasa | Intervalos de evaluacion 4, 20 y 40 con secuencia de tokens identica |
| Paridad numerica prefill/decode | Pasa | Diferencias relativas <= 1,4e-6 en configuracion pequena |
| Paridad de siguiente token | Pasa | 100% de acuerdo de argmax |
| Fidelidad de tensores cuantizados | Pasa | Casos quantize/dequantize bit-exactos |
| Carga completa del artefacto | Pasa | Los 41 shards cargan de forma estricta |
| Vision, tool use, contexto largo | No evaluado | No reclamado por el artefacto |

Segun el autor, el artefacto no alcanza el suelo de producto de 12 tok/s fijado por Rapid-MLX, quedando un 34,0% por debajo.

## Requisitos de hardware

- VRAM / memoria: requiere 256 GiB de memoria unificada en Apple silicon para cargarse. El pico de memoria MLX medido es de 213,51 GB, por lo que hay que reservar margen adicional para macOS y el crecimiento del contexto. No es apto para maquinas por debajo de 256 GiB.
- GPU recomendadas: el unico hardware cualificado es un Apple M3 Ultra con 60 nucleos GPU. No hay datos para otras GPU.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090, etc.) segun la informacion disponible; el destino es Apple silicon de gama alta con 256 GiB unificados.
- Opciones de despliegue: solo MLX, mediante el cargador experimental del PR #3301 del repositorio Rapid-MLX. Los cargadores estandar no son compatibles. No se indica soporte para vLLM, llama.cpp, Ollama, TGI ni similares.
- Latencia y throughput: carga estricta residente de 239,44 s; decodificacion conservadora de 7,31 tok/s y techo de 7,92 tok/s en decodificacion corta, con generacion greedy y `(N-1)/elapsed` excluyendo el prefill.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el artefacto con su modelo de origen y con la conversion intermedia dentro de la misma cadena. No se aportan datos de modelos alternativos de terceros.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX | 680.537.125.744 | no disponible | 2-bit/group-64 + REAP (336/384 expertos) | MIT | safetensors MLX (41 shards) | Solo texto; pico 213,51 GB; 7,31 tok/s en M3 Ultra |
| Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP | no disponible | no disponible | 2-bit/group-64 | no disponible | MLX | Fuente directa del repack; incluye MTP |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | no disponible | pesos originales (no indicada) | MIT | no disponible | Modelo base entrenado por DeepSeek; incluye vision y MTP |

No se dispone de modelos comparables de otros proveedores con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion experimental: no es un modelo cualificado como producto y su publicacion no implica soporte en catalogo, servidor ni escritorio de Rapid-MLX.
- Rendimiento por debajo del objetivo: se queda un 34,0% por debajo del suelo de 12 tok/s de Rapid-MLX.
- Dependencia de un cargador no estandar: requiere el PR #3301 del repositorio Rapid-MLX; los cargadores habituales no funcionan.
- Cuantizacion agresiva y pruning: la propia model card advierte de que la cuantizacion a 2 bits y el pruning de expertos pueden reducir la calidad.
- Contexto largo no cualificado: no se ha validado su comportamiento con contextos extensos.
- Capacidades no evaluadas: tool use y vision no se evaluan ni se reclaman; vision y MTP estan omitidos.
- Alucinacion y sesgos: no hay datos publicados sobre sesgos ni tasas de alucinacion; la unica evidencia factual es un unico prompt de una frase.
- Enmarcado obligatorio: las peticiones sin los marcadores de rol (`<｜begin▁of▁sentence｜>`, `<｜User｜>`, `<｜Assistant｜>`, `</think>`) producen diagnosticos invalidos y no cuentan como evaluacion.
- Hardware muy restrictivo: no es viable por debajo de 256 GiB de memoria unificada, lo que excluye la mayoria de entornos de produccion y de consumo.
- Licencia: MIT heredada de la publicacion original; el diseno y el entrenamiento pertenecen a DeepSeek y sus contribuidores. Conviene revisar el archivo NOTICE para la revision de origen fijada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Fuente intermedia 2-bit (Vontra): https://huggingface.co/Vontra/DeepSeek-V4.1-Flash-MLX-2bit-MTP
- PR experimental con el cargador: https://github.com/raullenchai/Rapid-MLX/pull/3301
- Repositorio Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- La busqueda web no devolvio enlaces adicionales relevantes sobre este modelo.
