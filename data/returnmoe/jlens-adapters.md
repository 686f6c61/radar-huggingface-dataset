# returnmoe/jlens-adapters

## Resumen

`returnmoe/jlens-adapters` no es un modelo de lenguaje, sino un repositorio de adaptadores de interpretabilidad mecanicista: concretamente, adaptadores de **lente jacobiana (Jacobian lens, J-Lens)** preajustados para su uso con [Miru Tracer](https://github.com/returnmoe/miru-tracer), una herramienta de código abierto para inspeccionar la generación de un LLM token a token. Cada adaptador contiene las matrices jacobianas ajustadas para transportar el estado residual de una capa intermedia hacia la base de la capa final, de modo que pueda decodificarse con el propio *unembedding* del modelo. El autor es `returnmoe` y los adaptadores han sido contribuidos por Rodrigo Laneth (@rlaneth) y Lucas Teske (Teske's Lab) junto con Paulo Matias.

El problema que resuelve es de tipo práctico: calcular una lente jacobiana requiere ejecutar pases hacia atrás repetidos sobre un corpus de calibración, lo que puede llevar horas por modelo. Este repositorio publica esas matrices ya ajustadas para cinco modelos base de la familia Qwen3 (0.6B, 4B, 8B, 27B y una variante sin censura), de manera que un investigador puede cargar la lente directamente en Miru Tracer sin repetir el ajuste. Los adaptadores son específicos del modelo exacto para el que se ajustaron: no son intercambiables entre modelos aunque compartan tamaño oculto o número de capas.

Es relevante ahora porque la interpretabilidad mecanicista necesita infraestructura reutilizable. A diferencia de una lente logit clásica, que proyecta el estado intermedio directamente a través de la normalización y el *unembedding* finales, la lente jacobiana corrige la suposición de que el estado intermedio ya vive en la misma base representacional que el estado final, lo que da lecturas más significativas en capas tempranas y medias. El repositorio ocupa 29.2 GB y sus matrices se almacenan en `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal; son matrices de transformacion por capa (lente jacobiana). El modelo base subyacente de cada adaptador es de tipo transformer |
| Parametros totales | No aplica (adaptadores de interpretabilidad). El repositorio completo ocupa 29.2 GB |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica. La calibracion usa secuencias de hasta 128 tokens |
| Tipos de cuantizacion | No disponible (las matrices se almacenan en `safetensors`; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Unlicense (el tag de HuggingFace indica `license:other` con `license_name: unlicense`) |
| Formato de pesos | `safetensors` (sin payloads ejecutables de pickle) |

## Arquitectura y entrenamiento

Una lente jacobiana parte de la siguiente formulacion. Sea `h_l` el estado residual en la capa `l` y `h_final` el estado inmediatamente anterior a la lectura final del modelo. La matriz de transporte se estima como `J_l = E[∂h_final / ∂h_l]`, es decir, el jacobiano medio del estado residual final respecto al estado de la capa `l`, promediado sobre muchas indicaciones de calibracion y posiciones de token. La lectura resultante se obtiene como `readout_l = unembed(J_l h_l)`, decodificada con el propio *unembedding* del modelo. Cada adaptador contiene las matrices ajustadas para un unico modelo base exacto, mas metadatos del ajuste.

El ajuste lo realiza la herramienta `miru-tracer-fit-lens`, que ejecuta el modelo base sobre un corpus de calibracion, calcula jacobianos con pases hacia atras repetidos y mantiene una media acumulada por capa ajustada. El ajustador por defecto considera hasta 1.000 indicaciones, usa secuencias de como maximo 128 tokens, espera al menos 100 indicaciones exitosas antes de la parada temprana, sigue el cambio relativo medio en las ultimas 10 actualizaciones exitosas y declara convergencia cuando esa media movil baja de 0.002. El numero de indicaciones que figura en la tabla de adaptadores es el de indicaciones realmente incluidas, no el presupuesto solicitado. Alcanzar el umbral de convergencia indica que la estimacion acumulada del jacobiano se estabilizo bajo ese criterio, no que todas las lecturas sean semanticamente correctas.

Los adaptadores publicados son: `Qwen/Qwen3-0.6B` (376 indicaciones, convergencia alcanzada), `Qwen/Qwen3-4B` (479), `Qwen/Qwen3-8B` (461), `Qwen/Qwen3.6-27B` (744) y `orcarouter/Qwen3.8-27B-Uncensored` (761). El adaptador de `Qwen/Qwen3.6-27B` se ajusto contra la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` usando el Ambiente Computacional Marie Curie (FINEP 01.22.181.00) en UFSCar.

## Capacidades

- Inspeccion capa por capa del flujo residual de un LLM mediante lecturas con lente jacobiana en capas intermedias.
- Comparacion directa entre lecturas de lente logit y lecturas de lente jacobiana sobre el mismo modelo y el mismo paso de generacion.
- Visualizacion de trazas completas de generacion token a token, con inspeccion de probabilidades de token.
- Intervencion experimental sobre el modelo: operaciones de *steer* (guiado), *swap* (intercambio) y *ablate* (ablacion) sobre direcciones de lectura.
- Control de la generacion paso a paso: sobrescribir, deshacer o continuar pasos individuales de generacion.
- Soporte de multiples familias de modelos base a traves de adaptadores especificos (los cinco listados en la tabla).
- Almacenamiento seguro de matrices en `safetensors`, sin payloads de pickle ejecutables.
- No soporta generacion de texto ni tool calling por si mismo: es un artefacto de interpretabilidad, no un modelo generativo.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: un investigador carga un adaptador en Miru Tracer y examina en que capa emerge una prediccion concreta, comparando la lectura jacobiana con la lectura logit para determinar en que punto el estado residual ya es decodificable de forma fiable.
- Analisis de formacion de decisiones en modelos pequenos: con el adaptador de `Qwen3-0.6B` (376 indicaciones de calibracion) se puede estudiar de forma barata como se construye una prediccion capa a capa en un modelo que cabe en una GPU de consumo.
- Auditoria de modelos de produccion: sobre `Qwen3-8B` (461 indicaciones) se puede inspeccionar el flujo residual para localizar representaciones asociadas a comportamientos no deseados antes de desplegar el modelo.
- Experimentos de intervencion controlada: usando las operaciones de *steer*, *swap* y *ablate*, un equipo puede modificar una direccion de lectura en una capa concreta y medir el efecto sobre la generacion, util para validar hipotesis sobre circuitos internos.
- Estudio de modelos de gran tamano sin reajustar la lente: el adaptador de `Qwen3.6-27B` (744 indicaciones) permite trabajar sobre un modelo de 27B sin repetir el costoso ajuste jacobiano.
- Analisis comparativo de variantes alineadas frente a no alineadas: los adaptadores de `Qwen3.6-27B` y `orcarouter/Qwen3.8-27B-Uncensored` (761 indicaciones) permiten comparar el flujo residual de una variante censurada frente a otra sin censura.
- Reproducibilidad de resultados: al publicar las matrices ajustadas y sus metadatos (numero de indicaciones, criterio de convergencia), otro grupo puede reproducir exactamente las mismas lecturas de lente sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta, por adaptador, el numero de indicaciones promediadas y si se alcanzo el criterio de parada temprana por defecto:

| Modelo base | Indicaciones promediadas | Convergencia | Contribuidor |
|---|---:|---|---|
| `Qwen/Qwen3-0.6B` | 376 | Si | Rodrigo Laneth (@rlaneth) |
| `Qwen/Qwen3-4B` | 479 | Si | Rodrigo Laneth (@rlaneth) |
| `Qwen/Qwen3-8B` | 461 | Si | Rodrigo Laneth (@rlaneth) |
| `Qwen/Qwen3.6-27B` | 744 | Si | Lucas Teske (Teske's Lab) y Paulo Matias |
| `orcarouter/Qwen3.8-27B-Uncensored` | 761 | Si | Lucas Teske (Teske's Lab) |

## Requisitos de hardware

- El repositorio completo ocupa 29.2 GB, lo que refleja el tamano agregado de las matrices jacobianas de los cinco adaptadores; el tamano individual de cada adaptador no se documenta.
- Las matrices de lente escalan aproximadamente con el cuadrado del tamano oculto por numero de capas, de modo que los adaptadores de los modelos de 27B son los mas pesados del conjunto.
- Para ejecutar Miru Tracer con un adaptador hay que cargar el modelo base correspondiente ademas de las matrices, por lo que el requisito dominante de memoria es el del modelo base (el adaptador anade una sobrecarga adicional sobre el).
- No se documentan GPU recomendadas ni medidas de latencia o throughput en la informacion disponible.
- El ajuste original de la lente se realizo, para el caso de `Qwen3.6-27B`, en el Ambiente Computacional Marie Curie (FINEP 01.22.181.00) de UFSCar, lo que sugiere que el ajuste de modelos grandes requiere infraestructura de computo institucional.
- Opciones de despliegue: la herramienta de referencia es Miru Tracer (interfaz Gradio, repositorio en GitHub); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- No disponible: requisitos exactos de VRAM para inferencia o para reajuste de la lente.

## Comparativa con modelos similares

Este repositorio no es comparable con modelos de lenguaje. Las alternativas pertinentes son otras tecnicas de lectura e interpretabilidad:

| Alternativa | Que hace | Diferencia frente a la lente jacobiana |
|---|---|---|
| Lente logit (logit lens) | Proyecta `h_l` directamente por la normalizacion y el `unembedding` finales | Asume que el estado intermedio ya esta en la base representacional final; suele dar lecturas peores en capas tempranas y medias |
| Adaptadores LoRA | Ajustan pesos del modelo para una tarea | Cambian lo que el modelo aprende; los adaptadores de este repositorio no modifican el modelo, solo lo inspeccionan |
| Fine-tunes y plugins de generacion | Modifican el comportamiento del modelo | Ajenos a este repositorio; los J-Lens no son ninguno de ellos |
| Ajuste de lente propio | Cada usuario ajusta su propia lente con `miru-tracer-fit-lens` | Este repositorio evita ese coste publicando lentes ya ajustadas; la comparacion disponible es frente a no tener adaptador |

No se dispone de comparativas numericas frente a lentes logit publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Los adaptadores son especificos del modelo exacto para el que se ajustaron: no deben usarse con otro modelo aunque coincidan tamano oculto y numero de capas, ya que pesos, tokenizadores y representaciones internas difieren.
- Alcanzar el criterio de convergencia (media movil del cambio relativo por debajo de 0.002) significa solo que la estimacion del jacobiano se estabilizo; no garantiza que todas las lecturas sean semanticamente correctas.
- No son adaptadores LoRA, ni fine-tunes, ni pesos de modelo, ni plugins de generacion: no cambian lo que el modelo ha aprendido ni sirven para generar texto.
- No se documentan sesgos conocidos de los adaptadores en si; cualquier sesgo relevante dependeria del modelo base subyacente, no de la lente.
- Riesgo de interpretacion erronea: las lecturas intermedias son lecturas experimentales y deben validarse, no tomarse como explicaciones definitivas del comportamiento del modelo.
- Restricciones de licencia: la licencia declarada es Unlicense, que en principio permite uso sin restricciones, aunque el tag de HuggingFace figura como `license:other`; conviene verificar el archivo `LICENSE` del repositorio antes de un uso comercial.
- No se documentan idiomas soportados, cuantizaciones disponibles ni tamano individual por adaptador.
- El repositorio tiene 0 descargas y 4 likes en el momento de la consulta, por lo que su adopcion y validacion externa son limitadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/returnmoe/jlens-adapters
- Miru Tracer (repositorio): https://github.com/returnmoe/miru-tracer
- Adaptador `Qwen/Qwen3-0.6B`: https://huggingface.co/returnmoe/jlens-adapters/blob/main/miru/Qwen/Qwen3-0.6B.safetensors
- Adaptador `Qwen/Qwen3-4B`: https://huggingface.co/returnmoe/jlens-adapters/blob/main/miru/Qwen/Qwen3-4B.safetensors
- Adaptador `Qwen/Qwen3-8B`: https://huggingface.co/returnmoe/jlens-adapters/blob/main/miru/Qwen/Qwen3-8B.safetensors
- Adaptador `Qwen/Qwen3.6-27B`: https://huggingface.co/returnmoe/jlens-adapters/blob/main/miru/Qwen/Qwen3.6-27B.safetensors
- Adaptador `orcarouter/Qwen3.8-27B-Uncensored`: https://huggingface.co/returnmoe/jlens-adapters/blob/main/miru/orcarouter/Qwen3.8-27B-Uncensored.safetensors
- Revision del modelo base `Qwen3.6-27B`: https://huggingface.co/Qwen/Qwen3.6-27B/commit/6a9e13bd6fc8f0983b9b99948120bc37f49c13e9
- Rodrigo Laneth: https://rlaneth.com y https://huggingface.co/rlaneth
- Lucas Teske: https://huggingface.co/racerxdl
- Teske's Lab: https://huggingface.co/TeskesLab
- Paulo Matias: https://huggingface.co/thotypous
