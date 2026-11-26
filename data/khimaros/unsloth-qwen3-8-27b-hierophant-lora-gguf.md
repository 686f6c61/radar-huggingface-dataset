# khimaros/unsloth-Qwen3.8-27B-hierophant-LoRA-GGUF

## Resumen

`khimaros/unsloth-Qwen3.8-27B-hierophant-LoRA-GGUF` es un adaptador LoRA en formato GGUF para el modelo base `unsloth/Qwen3.8-27B-GGUF`. No es un modelo completo: es un fichero pequeno que se carga junto al modelo base en `llama.cpp`/`llama-server` y que aplica una edicion de "abliteration" (eliminacion de la direccion de rechazo) sobre los pesos cuantizados del base. Lo desarrolla el autor independiente `khimaros` usando su herramienta `hierophant`.

El problema que resuelve es concreto: eliminar el comportamiento de rechazo (refusals) del modelo base sin reentrenar ni redistribuir los pesos completos. El adaptador se calcula a partir de los pesos desquantizados de una cuantizacion especifica, de modo que a escala 1 la edicion es exacta para ese fichero base y solo para ese. En la practica, permite servir el modelo base con o sin la modificacion desde un mismo servidor, aplicando el adaptador por peticion.

Es relevante ahora porque el ecosistema de LoRA sobre GGUF en `llama.cpp` permite modificar el comportamiento de un modelo grande (27B nominales) con ficheros de pocos megabytes, sin duplicar pesos, y porque el autor documenta de forma exhaustiva el proceso de busqueda de recetas, las metricas de rechazo retenidas y la divergencia KL frente al base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer denso del base Qwen3.8-27B |
| Parametros totales | 2.416.128 (adaptador); el base Qwen3.8-27B no reporta cifra en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no declarada) |
| Tipos de cuantizacion | Q8_0 (unico adaptador publicado en la tabla de la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo: calcula una direccion de rechazo como la diferencia entre las medias de los estados residuales en el primer token generado para prompts daninos y prompts inofensivos, pasados ambos por el propio modelo cuantizado. Esa direccion se resta de todas las matrices que escriben en el flujo residual, calculadas a partir de los pesos desquantizados de esa cuantizacion concreta. A escala 1 la edicion es exacta para el fichero base del que se derivo.

La receta publicada para Q8_0 es `L26, 8 harmless PCs`: direccion tomada en la capa 26, con 8 componentes principales de los prompts inofensivos excluidos, escala 0.99, peso 1.41 y KL 0.098. La eleccion de capa, intensidad y si conservar o anadir una segunda direccion residual se hizo mediante busqueda automatizada sobre 93 recetas, clasificadas por tasa de rechazo en prompts no usados para el ajuste con un presupuesto fijo de KL. El adaptador se construyo con `llama.cpp` commit `8e5a58df8` sobre el base con SHA-256 `a680f44a0692`.

## Capacidades

- Eliminacion de rechazos (abliteration) sobre el base Qwen3.8-27B: la tasa de rechazo medida pasa de 0.98 a 0.05 sobre 300 prompts retenidos, con thinking desactivado.
- Carga como LoRA en `llama-server` mediante `--lora-scaled`, con escala ajustable (0.99 publicada, 0.8 mas conservadora, 0 desactiva).
- Aplicacion por peticion: `--lora-init-without-apply` permite que un mismo servidor responda con y sin el adaptador.
- Conserva las capacidades del base (generacion, razonamiento, codigo, etc.) con una divergencia KL de 0.096 en WikiText y 0.097 en primer token frente al base.
- Thinking mode heredado del base: con thinking activado las respuestas pueden razonar largamente antes de contestar.
- No se declaran capacidades adicionales propias (tool calling, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar el comportamiento del base y del adaptado sobre el mismo conjunto de prompts retenidos, sirviendo ambos desde un unico `llama-server` con aplicacion por peticion.
- Evaluacion de tecnicas de abliteration: el repositorio documenta 93 recetas con sus puntuaciones, lo que permite reproducir la busqueda y contrastar el metodo `hierophant` frente a alternativas.
- Red teaming controlado: disponer de una variante sin rechazos del mismo modelo base para medir la eficacia de filtros externos o clasificadores de seguridad en el pipeline.
- Despliegue con conmutacion en caliente: mantener un endpoint con el adaptador a escala 0.99 y otro a escala 0.8 para comparar deriva de comportamiento sin recargar pesos.
- Estudio de coste/beneficio de LoRA sobre GGUF: cuantificar el impacto de un adaptador de 2,4 M de parametros sobre un base de 27B en terminos de KL y tasa de repeticion (loops 0.12 sobre 50 prompts).
- Base para recetas propias: usar la metodologia y los hiperparametros publicados (capa 26, 8 PCs, escala 0.99) como punto de partida para generar adaptadores sobre otras cuantizaciones del mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta metricas internas del proceso de abliteration, medidas sobre prompts retenidos con thinking desactivado:

| Metrica | Base | Adaptado (Q8_0, escala 0.99) |
|---|---|---|
| Tasa de rechazo (n=300) | 0.98 | 0.05 |
| KL primer token | referencia | 0.097 |
| KL WikiText | referencia | 0.096 |
| Tasa de bucles en respuestas largas (n=50) | no disponible | 0.12 |

## Requisitos de hardware

- El adaptador en si ocupa pocos megabytes (repo de 0.0 GB); el coste real lo determina el modelo base Qwen3.8-27B en Q8_0, que requiere del orden de 27-30 GB de VRAM o memoria unificada.
- GPU recomendadas para el base en Q8_0: A100 40/80 GB, H100, o configuraciones multi-GPU. En consumer, una RTX 4090 (24 GB) no cabe en Q8_0; seria necesario bajar a cuantizaciones menores del base, para las que este adaptador no es exacto.
- Despliegue: `llama.cpp` / `llama-server` con `--lora-scaled` y, opcionalmente, `--lora-init-without-apply`. No se documenta soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card advierte que con thinking activado las respuestas pueden ser largas y conviene un presupuesto de tokens generoso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| khimaros/unsloth-Qwen3.8-27B-hierophant-LoRA-GGUF | LoRA GGUF (abliteration) | 2,4 M (adaptador) | heredado del base | apache-2.0 | Exacto solo para Q8_0 del base indicado; 0 descargas |
| unsloth/Qwen3.8-27B-GGUF | Modelo base cuantizado | 27B (nominal) | no disponible | no disponible en la informacion | Sin modificacion de rechazos |
| Otras recetas hierophant (L24, L26-pcs16, etc.) | LoRA GGUF | 2,4 M aprox. | heredado del base | apache-2.0 | Peores tasas de rechazo retenidas (0.062-0.085) a KL similar |

No se dispone de datos para comparar con adaptadores de abliteration de otros autores ni con modelos de la misma categoria fuera de este repositorio.

## Limitaciones y advertencias

- Solo es exacto para el fichero base Q8_0 con SHA-256 `a680f44a0692`; sobre otra cuantizacion la edicion es aproximada y no medida.
- Elimina los rechazos de forma deliberada: el modelo puede producir contenido danino, y su uso en produccion exige filtros y politicas de seguridad externas.
- Riesgo de bucles: 0.12 de las respuestas largas a prompts daninos repiten un pasaje, un fallo que las respuestas cortas y la KL no reflejan.
- Con thinking activado, el modelo puede razonar extensamente antes de responder; hay que dimensionar el presupuesto de tokens.
- La tasa de rechazo de 0.05 se midio con thinking desactivado; no se reporta el comportamiento con thinking activado.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla de los heredados del base.
- Repositorio sin descargas ni validacion de la comunidad; las metricas son autoinformadas por el autor.
- Licencia apache-2.0 declarada para el adaptador; conviene verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/khimaros/unsloth-Qwen3.8-27B-hierophant-LoRA-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Herramienta hierophant: https://github.com/khimaros/hierophant
