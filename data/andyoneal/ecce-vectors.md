# andyoneal/ecce-vectors

## Resumen

Ecce Vectors es una colección de 29 vectores de control (steering vectors) para Gemma 4 31B, publicada por el usuario andyoneal. Cada vector es un fichero de 1,27 MB que contiene 59 filas de 5.376 números: un ajuste por capa que se suma al estado oculto del modelo en cada token. El objetivo declarado del autor es intentar reproducir, mediante un simple desplazamiento en el espacio latente, el comportamiento de 29 fine-tunes publicados de Gemma 4 31B, y medir cuánto de un fine-tune sobrevive cuando se comprime en un vector.

El proyecto no es un modelo en sí, sino un adaptador de estilo que se aplica sobre los pesos originales de google/gemma-4-31B-it sin modificarlos. Esto permite mantener una única descarga del modelo base en cualquier cuantización y añadir el vector en el momento del lanzamiento, con un coste de almacenamiento de 37 MB para los 29 vectores frente a los 62 GB en bf16 (o 18,7 GB en Q4_K_M) de cada fine-tune completo.

La relevancia actual es doble: por un lado, explora los límites del control de estilo mediante vectores en modelos grandes; por otro, ofrece una vía práctica y baratísima de modificar el tono del modelo (por ejemplo, para roleplay) sin necesidad de descargar ni alojar pesos adicionales. El propio autor es explícito sobre las limitaciones: los vectores no reproducen fielmente sus fine-tunes y su efecto específico es tenue, aunque mezclan bien y no añaden coste medible de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de control (steering vectors) aplicados sobre un transformer Gemma 4 31B; 59 filas de 5.376 valores por vector |
| Parametros totales | 317.184 (por vector; el modelo base google/gemma-4-31B-it no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 31B) |
| Tipos de cuantizacion | El vector no se cuantiza; se aplica sobre el modelo base en cualquier cuantización (probado en Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | other / mixed (ver LICENSES.md en el repo) |
| Formato de pesos | GGUF (vectores de control para llama.cpp e ik_llama.cpp) |

## Arquitectura y entrenamiento

Cada vector se obtiene ajustando una diferencia de estados ocultos entre el modelo base y un fine-tune concreto sobre el mismo texto: se necesitan únicamente pases forward de ambos modelos, sin retropropagación sobre los pesos. El resultado es un desplazamiento por capa que se suma al hidden state en cada token durante la inferencia, por lo que no altera los pesos y es independiente de la cuantización del modelo base. El código de ajuste incluido funciona sobre MLX (Apple silicon), con un tiempo aproximado de diez minutos por fine-tune en un M1 Max, y el autor señala que el método podría adaptarse a PyTorch sobre hardware NVIDIA.

El autor documenta que el mejor vector reproduce más del 90 % del cambio en probabilidades de siguiente palabra de un fine-tune de estilo, pero solo restaura entre el 45 % y el 70 % de las palabras que el fine-tune habría elegido de forma distinta; varios vectores reproducen casi nada. En una prueba ciega con dos jueces automáticos (GPT-6-Luna y Jev), las respuestas del fine-tune real se identificaron el 81 % de las veces, las de un vector el 52 %, las de un vector de otro fine-tune distinto el 43 % y las del modelo base el 23 %, lo que indica que la mayor parte del efecto consiste en alejar al modelo base de su tono por defecto más que en reproducir el fine-tune específico.

## Capacidades

- Modificación del estilo y tono del modelo base Gemma 4 31B sin cambiar los pesos.
- Aplicación de un vector individual o mezcla de varios con pesos arbitrarios en llama.cpp mediante una única opción de lanzamiento.
- Carga, reponderación y descarga de vectores en caliente con ik_llama.cpp, lo que permite asignar un vector distinto a cada generación o "swipe" sin reiniciar el servidor ni recargar el modelo.
- Reutilización de la caché de prompt al cambiar de vector en ik_llama.cpp.
- Reproducción aproximada de estilos de 29 fine-tunes publicados, incluidos estilos orientados a roleplay.
- Aproximación del vector de un merge a partir de la mezcla de los vectores de sus modelos padre según la receta de mergekit (documentado para `schattenblume`, con 89,4 % de similitud frente al 89,9 % del vector ajustado directamente).
- Compatibilidad con cualquier cuantización del modelo base, incluida Q4_K_M y cuantizaciones de menos bits (con el redondeo adicional que estas introduzcan).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento asociadas a los vectores; estas dependerían exclusivamente del modelo base.

## Casos de uso

- Roleplay y narrativa interactiva: aplicar un vector de estilo antes de cada generación permite dar un tono concreto a las respuestas sin descargar un fine-tune de 18,7 GB; con ik_llama.cpp se puede variar el vector en cada swipe para explorar matices.
- Despliegue con almacenamiento limitado: mantener una sola copia de Gemma 4 31B en Q4_K_M y añadir el vector de 1,27 MB en el arranque reduce el espacio en disco de 18,7 GB por estilo a una única copia más 37 MB para los 29 vectores.
- Mezcla de estilos: combinar dos o más vectores con pesos en una sola opción de llama.cpp para obtener un tono intermedio entre dos fine-tunes, sin necesidad de fusionar modelos ni de disponer de sus pesos.
- Servicio de inferencia multiusuario: con ik_llama.cpp, un proxy ligero puede llamar a `/control-vectors/apply` antes de cada petición para asignar un vector distinto por usuario o por sesión, conservando la caché de prompt y evitando recargas del modelo.
- Experimentación en investigación sobre control de activaciones: el repositorio incluye el código de ajuste, los prompts y una guía (GUIDE.md) para que otros reproducan el método y lo adapten a PyTorch o a otros motores.
- Prototipado rápido de estilos antes de un fine-tune: usar un vector para evaluar si un tono concreto encaja en un producto antes de invertir en el entrenamiento y alojamiento de un fine-tune completo, asumiendo que la fidelidad será parcial.
- Aproximación de merges sin pesos: generar el vector de un merge a partir de la mezcla de los vectores de sus padres siguiendo la receta de mergekit, útil cuando no se dispone de los pesos del merge.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Distancia KL al fine-tune `musica` (Q4_K_M, vector `musica`) | 1,88 (base) a 0,17 (con vector) |
| Acuerdo en el token superior (`musica`) | 69 % (base) a 84 % (con vector); 90 % para el fine-tune real en Q4_K_M |
| Reproducción del cambio en probabilidades de siguiente palabra (mejor vector) | más del 90 % |
| Restauración de palabras elegidas de forma distinta por el fine-tune | 45–70 % (mejor vector); varios vectores, casi nada |
| Identificación ciega del fine-tune real (juez GPT-6-Luna) | 81 % |
| Identificación ciega de un vector cualquiera | 52 % |
| Identificación ciega de un vector de otro fine-tune | 43 % |
| Identificación ciega del modelo base | 23 % |
| Similitud del vector de `schattenblume` obtenido por mezcla de padres | 89,4 % (frente a 89,9 % del vector ajustado directamente) |
| Impacto en velocidad (M1 Max, Q4_K_M, 5 rondas) | mediana de -0,4 % (rango por ronda: -3,1 % a +0,4 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: la determinada por el modelo base Gemma 4 31B en la cuantización elegida; el vector añade 1,27 MB por unidad y no requiere memoria adicional significativa.
- GPU recomendadas: las mismas que para Gemma 4 31B en la cuantización usada; el autor probó en un M1 Max con Q4_K_M. No se especifican modelos de GPU concretos en la información disponible.
- GPU de consumo: depende de la cuantización del modelo base; no se detalla en la información disponible si cabe en tarjetas consumer concretas.
- Despliegue: llama.cpp (soporte de vectores de control y mezcla en el arranque) e ik_llama.cpp (carga y descarga en caliente mediante `/control-vectors/apply`). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: sin coste medible; una suma vectorial por capa y token, con una variación mediana de -0,4 % en velocidad de generación en M1 Max a Q4_K_M. La mezcla de varios vectores se fusiona en uno al arrancar, por lo que cuesta lo mismo que un vector único.
- El ajuste de nuevos vectores requiere Apple silicon con MLX (unos diez minutos por fine-tune en M1 Max); no se incluye implementación para NVIDIA.

## Comparativa con modelos similares

| Criterio | Ecce Vectors | Fine-tune completo de Gemma 4 31B | Modelo base Gemma 4 31B |
|---|---|---|---|
| Naturaleza | 29 vectores de control (adaptador de estilo) | Pesos completos modificados | Pesos originales |
| Tamano | 1,27 MB por vector; 37 MB los 29 | 62 GB en bf16; 18,7 GB en Q4_K_M | 62 GB en bf16; 18,7 GB en Q4_K_M |
| Fidelidad al estilo objetivo | Parcial (45–70 % de palabras restauradas en el mejor caso) | Completa por definición | Ninguna |
| Compatibilidad de cuantización | Independiente; se aplica sobre cualquier cuantización | Requiere una copia por cuantización | Una copia por cuantización |
| Mezcla de estilos | Sí, con pesos en el arranque o en caliente (ik_llama.cpp) | Requiere mergekit y los pesos de ambos modelos | No aplica |
| Coste de velocidad | Sin coste medible (mediana -0,4 %) | Depende del modelo | Referencia |
| Licencia | other / mixed (ver LICENSES.md) | La del fine-tune correspondiente | La de Gemma 4 31B |

No se dispone de información sobre otros conjuntos de vectores de control comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los vectores no reproducen fielmente sus fine-tunes: el autor lo afirma explícitamente y cuantifica la fidelidad en un 45–70 % de palabras restauradas en el mejor caso, con varios vectores que apenas reproducen nada.
- La mayor parte del efecto consiste en alejar al modelo base de su tono por defecto; la parte específica del fine-tune es aproximadamente una quinta parte de la del fine-tune real y demasiado tenue para detectarse de forma fiable en pocas respuestas.
- El ajuste se realizó como diferencia respecto al modelo base, por lo que aplicar un vector sobre un modelo ya fine-tuneado es un experimento no probado; el autor espera que haga "algo" en la dirección del vector, sin garantías.
- El efecto depende de la cuantización del modelo base: las cuantizaciones de menos bits añaden su propio redondeo sobre el resultado; todo se probó en Q4_K_M.
- No se documentan sesgos específicos de los vectores ni del modelo base en la información disponible; al heredar el comportamiento de Gemma 4 31B, los sesgos y el riesgo de alucinación del modelo base siguen aplicándose.
- La licencia es "other / mixed" y remite a LICENSES.md; no se detallan en la información disponible las restricciones para uso comercial, que deben consultarse en ese fichero y en la licencia del modelo base.
- El cambio de vector en caliente con ik_llama.cpp requiere una llamada a `/control-vectors/apply` antes de cada petición, lo que exige una extensión de frontend o un proxy pequeño; no se incluye ninguno.
- El código de ajuste incluido funciona solo en MLX sobre Apple silicon; adaptarlo a PyTorch o NVIDIA queda como trabajo del usuario.
- No se dispone de datos sobre idiomas soportados ni sobre el contexto efectivo de los vectores, que dependen del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/andyoneal/ecce-vectors
- Licencias: https://huggingface.co/andyoneal/ecce-vectors/blob/main/LICENSES.md
- Guía de ajuste: https://huggingface.co/andyoneal/ecce-vectors/blob/main/GUIDE.md
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- mergekit: https://github.com/arcee-ai/mergekit
