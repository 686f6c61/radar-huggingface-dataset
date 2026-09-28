# andyoneal/ecce-vectors

## Resumen

Ecce Vectors es una coleccion de 29 vectores de control (control vectors / steering vectors) para Gemma 4 31B, publicada por el usuario andyoneal. No es un modelo de lenguaje: cada vector son 59 filas de 5.376 numeros (317.184 parametros, 1,27 MB) que se suman al estado oculto del modelo base en cada capa y en cada token. El objetivo declarado es intentar reproducir, mediante un unico empujon por capa, el comportamiento de 29 fine-tunes publicados de Gemma 4 31B que en bf16 pesan 62 GB cada uno (18,7 GB en Q4_K_M).

El problema que aborda es el coste de almacenamiento y despliegue de multiples fine-tunes del mismo modelo base. Con estos vectores se mantiene una sola descarga de Gemma 4 31B, en cualquier cuantizacion, y se anaden en el arranque con llama.cpp. El propio autor es explicito sobre sus limites: ninguno reproduce realmente su fine-tune, la similitud es baja y en pruebas ciegas un vector propio solo se identifica el 52% de las veces frente al 81% del fine-tune real, mientras que el vector de otro fine-tune se identifica el 43% de las veces.

La relevancia actual es practica y metodologica: son artefactos diminutos (37 MB los 29), sin coste medible de velocidad (mediana de -0,4% en un M1 Max a Q4_K_M), combinables entre si en el momento del arranque, y el repositorio incluye el codigo de ajuste, los prompts y una guia para fabricar vectores propios. Funcionan sobre el modelo base con licencia "other"/nombre "mixed", con un enlace a un fichero LICENSES.md que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (steering vectors) aplicados sobre Gemma 4 31B; no es un modelo autonomo |
| Parametros totales | 317.184 por vector (59 filas x 5.376 valores); aproximadamente 9,2 millones en los 29 vectores |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | La del modelo base google/gemma-4-31B-it; no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Los vectores no se cuantizan; funcionan sobre cualquier cuantizacion del base, probado en Q4_K_M |
| Idiomas soportados | No disponible (los del modelo base; no se detallan en la informacion) |
| Licencia | "other", license_name "mixed"; enlace a LICENSES.md |
| Formato de pesos | GGUF (etiqueta declarada, uso con llama.cpp); el repositorio reporta 317.184 parametros en safetensors |
| Modelo base | google/gemma-4-31B-it |
| Numero de vectores | 29 (1,27 MB cada uno, 37 MB en total) |
| Tamano del repositorio | 0,0 GB reportado por HuggingFace |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

Cada vector es un desplazamiento aditivo sobre el estado oculto de Gemma 4 31B: 59 filas de 5.376 numeros, una por capa, sumada en cada token. Al no tocar los pesos, el vector es independiente de la cuantizacion del modelo base; el autor indica que todo el trabajo se probo sobre Q4_K_M y que una cuantizacion de menos bits anade su propio redondeo por encima. llama.cpp fusiona los vectores cargados en uno solo en el momento del arranque, de modo que una mezcla de varios cuesta lo mismo que uno.

El ajuste se realiza con pasadas forward de dos modelos sobre el mismo texto (el fine-tune objetivo y el base), es decir, por diferencia de comportamiento, no por entrenamiento con gradientes sobre el modelo. El codigo incluido funciona sobre MLX, por lo que tal como se distribuye requiere un Mac con Apple Silicon (unos diez minutos por fine-tune en un M1 Max), aunque el autor senala que el metodo podria adaptarse a PyTorch sobre hardware NVIDIA o a otro motor. No se detallan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO en los fine-tunes de origen.

La innovacion destacable no esta en el modelo base sino en el proceso: ajustar un vector a cada uno de 29 fine-tunes publicados para medir cuanto de un fine-tune sobrevive comprimido en un empujon. El resultado declarado es que se conserva muy poco. Los mejores vectores reproducen mas del 90% del cambio de un tune de estilo en probabilidades de siguiente palabra, pero solo recuperan entre el 45% y el 70% de las palabras que el fine-tune habria elegido de forma distinta, y varios no reproducen casi nada.

## Capacidades

- Aplicacion de estilos y comportamientos aprendidos de fine-tunes concretos sobre Gemma 4 31B sin cargar los pesos del fine-tune.
- Mezcla de varios vectores con los pesos que se elijan en el arranque de llama.cpp, lo que permite combinar dos fine-tunes o superponer uno sobre otro con un unico flag.
- Interpolacion de vectores de modelos fusionados: mezclar los vectores de los padres segun la receta de mergekit de un merge aproxima el vector del merge (para `schattenblume`, 89,4% de similitud frente al 89,9% del vector ajustado directamente).
- Cambio de vector en caliente con el servidor de ik_llama.cpp: cargar, reponderar y descargar vectores sin reiniciar el servidor ni recargar el modelo, mediante una llamada a `/control-vectors/apply` antes de cada peticion, conservando la cache de prompt.
- Direccionalidad de estilo para roleplay, etiqueta declarada del repositorio y uso principal previsto.
- Fabricacion de vectores propios: se incluyen el codigo de ajuste, los prompts y GUIDE.md.
- No se declaran capacidades de tool calling, agentes, vision ni audio propias de estos artefactos; dependen en su totalidad del modelo base.
- Multi-step reasoning y capacidades multilingues: no disponibles como caracteristica especifica del repositorio.

## Casos de uso

- Roleplay con estilos intercambiables: manteniendo una sola copia de Gemma 4 31B en Q4_K_M, se carga el vector del personaje o del registro deseado en el arranque, con un coste de 1,27 MB por estilo y sin duplicar los 18,7 GB del modelo base.
- Servidor de roleplay con variacion por generacion: usando ik_llama.cpp, un frontend puede aplicar un vector distinto a cada swipe o regeneracion mediante `/control-vectors/apply`, sin reiniciar el servidor y conservando la cache del prompt, lo que permite ofrecer variedad de tono con latencia de cambio minima.
- Despliegue multi-estilo con un solo peso en disco: en lugar de mantener 29 fine-tunes de 62 GB en bf16, se conserva una copia del base y los 37 MB de vectores, lo que simplifica enormemente la gestion de artefactos y el almacenamiento en produccion.
- Experimentacion en investigacion sobre control de estilo: los vectores permiten medir hasta que punto una direccion aditiva por capa captura el efecto de un fine-tune, con las cifras de divergencia KL y acuerdo de token superior ya publicadas como referencia.
- Ajuste fino de tono en pipelines existentes de llama.cpp: al anadirse como flag de arranque y no modificar los pesos, se pueden incorporar a un despliegue ya existente sin reentrenar ni reconvertir nada, y sin coste apreciable de velocidad.
- Generacion de variantes de un modelo fusionado sin materializar el merge: para probar el estilo de un merge de mergekit, se mezclan los vectores de sus padres segun la receta y se evalua el resultado antes de descargar y ejecutar los pesos fusionados.
- Prototipado rapido de un fine-tune antes de invertir en el: dado el bajo peso de un vector, sirve para comprobar si la direccion de estilo buscada merece la pena antes de asumir las 62 GB del fine-tune completo, asumiendo que la fidelidad sera limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El repositorio si incluye metricas propias de fidelidad respecto al fine-tune imitado y de coste de inferencia.

| Metrica (vector `musica`) | Stock Q4_K_M | Vector sobre stock | Fine-tune propio Q4_K_M |
|---|---|---|---|
| Divergencia KL frente al fine-tune | 1,88 | 0,17 | 0 (referencia) |
| Acuerdo de token superior | 69% | 84% | 90% |
| Distancia al fine-tune cerrada | - | ~91% | 100% |

| Prueba ciega (juez GPT-6-Luna) | Tasa de identificacion |
|---|---|
| Respuestas del fine-tune real | 81% |
| Respuestas con el vector del propio fine-tune | 52% |
| Respuestas con el vector de otro fine-tune | 43% |
| Respuestas de stock | 23% |

| Otras metricas declaradas | Valor |
|---|---|
| Cambio en probabilidades de siguiente palabra (mejores vectores, tunes de estilo) | mas del 90% reproducido |
| Palabras recuperadas que el fine-tune habria elegido distinto | 45-70% |
| Similitud del blend de vectores de padres frente al merge `schattenblume` | 89,4% (frente a 89,9% del vector ajustado directamente) |
| Impacto en velocidad (5 rondas, M1 Max, Q4_K_M) | mediana -0,4% (rango por ronda -3,1% a +0,4%) |

El segundo juez (Jev, de TypeSafe) es descrito como mas estricto y reproduce el mismo patron con tasas mas bajas. Los datos corresponden a un unico vector nombrado (`musica`) y a un merge (`schattenblume`); no se publican cifras individuales de los 29 vectores.

## Requisitos de hardware

- Los vectores en si ocupan 1,27 MB cada uno y 37 MB los 29; no anaden requisitos de VRAM relevantes (una suma vectorial por capa y token).
- El coste real de hardware lo determina Gemma 4 31B: en bf16 son 62 GB de pesos; en Q4_K_M, 18,7 GB.
- Para Q4_K_M, caben en una GPU de consumo con 24 GB (por ejemplo RTX 4090) o en un Mac con memoria unificada suficiente; el autor verifico el rendimiento en un M1 Max.
- Para bf16 completo hacen falta 62 GB de VRAM o mas, lo que implica A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (soporte base con fusion de vectores en el arranque) e ik_llama.cpp (carga, reponderacion y descarga en caliente mediante `/control-vectors/apply`). No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput absolutos: no disponibles. Solo se reporta el impacto relativo del vector, con mediana de -0,4% en generacion.
- El codigo de ajuste incluido depende de MLX y, tal como se distribuye, requiere un Mac con Apple Silicon; el autor estima unos diez minutos por fine-tune en un M1 Max.

## Comparativa con modelos similares

| Alternativa | Tamano | Que aporta | Limitaciones |
|---|---|---|---|
| Ecce Vectors (este repositorio) | 1,27 MB por vector, 37 MB los 29 | Se aplica sobre cualquier cuantizacion del base, se mezcla en arranque o en caliente, sin coste medible de velocidad | Fidelidad baja: 52% de acierto ciego frente a 81% del fine-tune real; 45-70% de las palabras recuperadas |
| Fine-tune completo de Gemma 4 31B | 62 GB en bf16, 18,7 GB en Q4_K_M | Reproduce el comportamiento objetivo con fidelidad plena | Coste de almacenamiento y de gestion por cada estilo; no se mezcla en caliente |
| Vector derivado de la receta mergekit de un merge | Del mismo orden que un vector | Aproxima el merge sin materializar sus pesos: 89,4% de similitud frente a 89,9% del vector ajustado | Hereda todos los limites de los vectores; no equivale al merge |
| Otros repositorios publicos de control vectors para Gemma 4 31B | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de repositorios alternativos comparables con los que contrastar parametros, contexto o licencia.

## Limitaciones y advertencias

- Fidelidad limitada y reconocida por el autor: ninguno de los 29 vectores reproduce su fine-tune. Leidos a ciegas, solo dejan "un atisbo tenue" del estilo original.
- Gran parte del efecto es inespecifico: un vector de otro fine-tune se identifica el 43% de las veces y el propio stock el 23%, es decir, buena parte de lo que hace un vector es que el texto suene menos generico, no mas parecido a su fine-tune.
- La parte especifica del fine-tune es aproximadamente una quinta parte de la del modelo real y demasiado debil para distinguirse de forma fiable en pocas respuestas.
- Variabilidad entre vectores: algunos reproducen mas del 90% del cambio en probabilidades de siguiente palabra y otros casi nada; el autor no publica cifras por vector, solo para `musica` y `schattenblume`.
- Sensibilidad a la cuantizacion: las pruebas se hicieron en Q4_K_M; una cuantizacion de menos bits anade su propio redondeo sobre el efecto del vector.
- Uso sobre modelos ya fine-tuneados sin verificar: los vectores se ajustaron como diferencias respecto al stock, por lo que aplicarlos sobre un fine-tune es un experimento no probado.
- Licencia mixta ("other", nombre "mixed"): existen ficheros LICENSES.md separados y hay que revisarlos antes de cualquier uso comercial o redistribucion; la licencia del modelo base (Gemma) tambien aplica al uso conjunto.
- Idiomas y contexto: no se detallan en la informacion; dependen enteramente de las capacidades y limitaciones de Gemma 4 31B, incluidos sus sesgos y su riesgo de alucinacion.
- Integracion en caliente no incluida: el cambio de vector por peticion en ik_llama.cpp requiere una extension de frontend o un proxy pequeno que el repositorio no proporciona.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, sin validacion externa conocida; conviene tratar las cifras como resultados autoinformados por el autor.
- El repositorio pesa 0,0 GB segun HuggingFace pese a declarar 37 MB de vectores, lo que puede indicar que los ficheros no estan alojados o que la medicion esta desactualizada.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/andyoneal/ecce-vectors
- Fichero de licencias: https://huggingface.co/andyoneal/ecce-vectors/blob/main/LICENSES.md
- Guia de ajuste de vectores propios: https://huggingface.co/andyoneal/ecce-vectors/blob/main/GUIDE.md
- Imagen de portada del repositorio: images/eccehomovectors.png
- Perfil del autor en HuggingFace: https://huggingface.co/andyoneal
- Listado de modelos del autor: https://huggingface.co/andyoneal/models
- Modelo base referenciado: https://huggingface.co/google/gemma-4-31B-it
