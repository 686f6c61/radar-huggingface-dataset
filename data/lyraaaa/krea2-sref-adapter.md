# lyraaaa/krea2-sref-adapter

## Resumen

Krea 2 srefs es un adaptador de estilo para el modelo de generacion de imagenes Krea 2, publicado por el usuario lyraaaa bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo generativo completo, sino de un mecanismo que permite inyectar un estilo visual concreto en Krea 2 mediante un codigo numerico entero: el mismo numero produce el mismo estilo con cualquier prompt y cualquier semilla. Tecnicamente, el adaptador genera un bloque de 108 tokens de estilo (una matriz de `108 x 6144` numeros en coma flotante) que se anade al conjunto de tokens de prompt que Krea 2 consume durante el proceso de denoising.

El funcionamiento se apoya en una propiedad arquitectonica de Krea 2: sus tokens de prompt no llevan codificacion posicional, por lo que se comportan como una bolsa de vectores a la que se pueden anadir tokens adicionales sin romper el modelo. El adaptador explota esto generando el bloque de estilo a partir de un codigo entero mediante tres pasos deterministas (inyeccion de ruido con una semilla igual al codigo, proyeccion lineal con una base fija de forma `[64, 108, 6144]` y escalado por un parametro de fuerza), sin modificar ningun peso del modelo base.

La relevancia de este adaptador es practica: ofrece una forma reproducible, ligera (el repositorio ocupa 0,1 GB) y parametrica de controlar el estilo visual en Krea 2, con posibilidad de mezclar estilos promediando coordenadas. No se dispone de informacion sobre el modelo base Krea 2 en la documentacion proporcionada, por lo que muchas especificaciones del mismo quedan fuera del alcance de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de inyeccion de tokens sobre Krea 2 (modelo base de difusion con 28 bloques y encoder de texto Qwen3-VL) |
| Parametros totales | No disponible (el adaptador no es un modelo con pesos entrenados; usa una base fija `sref_space.npz` de forma `[64, 108, 6144]`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el modelo base; el adaptador anade 108 tokens al contexto de prompt |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Base en `.npz` (NumPy) y script Python `sref.py`; no se distribuyen pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador no entrena ningun modelo. Su mecanica consiste en transformar un codigo entero en un bloque de `108 x 6144` numeros en tres pasos: primero, el codigo actua como semilla de un generador de numeros aleatorios que extrae 64 valores de una distribucion normal, escalados por un vector `sd` de 64 valores que define la dispersion tipica de cada direccion de estilo; esos 64 numeros son las coordenadas del estilo. Segundo, una matriz fija `basis` de forma `[64, 108, 6144]` contenida en `sref_space.npz` proyecta las coordenadas a un bloque de 108 tokens de 6144 dimensiones, sumando las 64 rebanadas ponderadas por sus coordenadas. Tercero, un escalar `strength` multiplica el bloque completo.

El bloque resultante se concatena a los tokens de prompt que produce la etapa de text fusion de Krea 2 (que combina `txtfusion` con un MLP pequeno sobre los hidden states de Qwen3-VL) y se le asigna posicion cero, igual que a los tokens de prompt. El bloque se anade en cada paso de denoising y, cuando se usa classifier-free guidance, solo en la pasada condicional. No se modifica ningun peso del modelo base; el unico coste computacional es la extension de la secuencia en 108 tokens. El autor menciona un paso opcional de "loosening" del prompt que aplica un sesgo aditivo a la atencion sobre los tokens de prompt durante los tres primeros pasos de denoising (con factores completo, mitad y cuarto), pero no forma parte de `sref.py`.

## Capacidades

- Inyeccion de estilo visual determinista: un mismo codigo entero produce el mismo estilo con cualquier prompt y cualquier semilla.
- Control de intensidad del estilo mediante el parametro `strength` (valores orientativos: 6 para restilizado completo, 3 para ligero, por encima de 10 domina sobre el prompt, 0 desactiva).
- Mezcla de estilos: al compartir un espacio de coordenadas de 64 dimensiones, se pueden promediar dos o mas codigos para obtener estilos intermedios.
- Preservacion de colores nombrados en el prompt: un abrigo rojo sigue siendo rojo aunque se aplique un estilo de dibujo a tinta.
- Compatibilidad con cualquier prompt y semilla del modelo base Krea 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues propias, ya que no es un modelo de lenguaje.
- No modifica los pesos del modelo base, por lo que es compatible con cualquier variante o fine-tuning de Krea 2 que mantenga la arquitectura de text fusion y la ausencia de posiciones en los tokens de prompt.

## Casos de uso

- Exploracion de estilos en produccion artistica: un ilustrador puede fijar un codigo concreto para mantener coherencia estilistica a lo largo de una serie de imagenes generadas con prompts distintos, sin necesidad de reentrenar ni de usar LoRAs.
- Generacion de variantes controladas en diseno grafico: dado un prompt de producto, aplicar distintos codigos de estilo para producir un catalogo de propuestas visuales homogeneas en composicion pero diversas en acabado.
- Creacion de presets de marca: una empresa puede seleccionar uno o varios codigos que definan su estetica corporativa y reutilizarlos en todos los assets generados, aprovechando la reproducibilidad del codigo.
- Mezcla de estilos para direccion de arte: combinando coordenadas de dos codigos se obtienen estilos intermedios que permiten afinar la direccion visual sin saltos discretos.
- Integracion en pipelines de generacion por lotes: al ser un script Python ligero (`sref.py`) y no requerir pesos adicionales, se puede incorporar en flujos automatizados que generen cientos de imagenes con estilos consistentes.
- Investigacion sobre control de estilo en modelos de difusion: el mecanismo de inyeccion de tokens sin posicion y la proyeccion lineal fija ofrecen un caso de estudio reproducible para analizar como los modelos de difusion interpretan informacion de estilo en el espacio de tokens de prompt.
- Prototipado rapido de estilos sin entrenamiento: frente a tecnicas como LoRA o DreamBooth, este adaptador no requiere entrenamiento, lo que reduce el coste y el tiempo de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si no requiere VRAM adicional significativa: solo anade 108 tokens a la secuencia de contexto del modelo base, con un coste de memoria despreciable frente al modelo completo.
- El requisito real de hardware viene determinado por Krea 2, cuyas especificaciones (tamano, VRAM, GPUs recomendadas) no estan disponibles en la informacion proporcionada.
- El repositorio ocupa 0,1 GB y contiene la base `sref_space.npz` y el script `sref.py`; puede ejecutarse en CPU para generar el bloque de estilo y luego transferirlo a la GPU donde corra Krea 2.
- Opciones de despliegue: el adaptador se integra en el pipeline Python de Krea 2 concatenando el bloque tras la etapa de text fusion y su MLP; no se dispone de informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 srefs (este adaptador) | Adaptador de estilo por inyeccion de tokens | No aplica (base fija `[64, 108, 6144]`) | Anade 108 tokens | MIT | Hugging Face y GitHub |
| LoRA de estilo | Fine-tuning de bajo rango | No disponible | No aplica | Depende del autor | Comun en Hugging Face |
| DreamBooth | Fine-tuning completo o parcial | No disponible | No aplica | Depende del autor | Comun en Hugging Face |
| Textual inversion | Embedding de texto aprendido | No disponible | No aplica | Depende del autor | Comun en Hugging Face |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con estas alternativas en la informacion proporcionada. La diferencia conceptual principal es que este adaptador no entrena ningun peso: genera el bloque de estilo de forma determinista a partir de una base fija y un codigo entero, mientras que LoRA, DreamBooth y textual inversion requieren un proceso de entrenamiento con imagenes de referencia.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Krea 2 y su pipeline de inferencia para funcionar; no puede usarse por si solo.
- Algunos codigos arrastran un objeto recurrente junto con el estilo, lo que puede introducir elementos no deseados en la imagen.
- En prompts de retrato, algunos codigos restilizan mas el fondo que el sujeto, lo que puede romper la coherencia estilistica esperada.
- El mismo codigo puede requerir una fuerza distinta segun el tamano de imagen, por lo que no hay un valor de `strength` universal.
- El paso opcional de "loosening" del prompt puede hacer que se pierdan detalles del prompt si se usan valores altos.
- No se dispone de informacion sobre sesgos del adaptador ni del modelo base Krea 2.
- No se dispone de informacion sobre el riesgo de alucinacion del modelo base ni sobre sus limitaciones de contexto o idioma.
- La licencia MIT del adaptador no cubre necesariamente el modelo base Krea 2; debe verificarse la licencia de Krea 2 para uso comercial.
- El adaptador depende de detalles internos de Krea 2 (ausencia de posiciones en los tokens de prompt, dimension 6144, 28 bloques); cambios en la arquitectura del modelo base pueden romper la compatibilidad.
- No hay resultados de benchmarks ni evaluaciones cuantitativas publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lyraaaa/krea2-sref-adapter
- Codigo en GitHub: https://github.com/lyramakesmusic/krea2-sref-adapter
- Ejemplos de estilos sin prompt: https://huggingface.co/lyraaaa/krea2-sref-adapter/blob/main/examples/srefs-null-prompt.jpeg
- Ejemplos sobre "an astronaut riding a horse": https://huggingface.co/lyraaaa/krea2-sref-adapter/blob/main/examples/srefs-astronaut-horse.jpeg
- Ejemplos sobre "a woman": https://huggingface.co/lyraaaa/krea2-sref-adapter/blob/main/examples/srefs-woman.jpeg
- Ejemplos sobre "an old man reading a newspaper in a cafe": https://huggingface.co/lyraaaa/krea2-sref-adapter/blob/main/examples/srefs-man-reading.jpeg
- Ejemplos sobre "a lighthouse on a rocky coast": https://huggingface.co/lyraaaa/krea2-sref-adapter/blob/main/examples/srefs-lighthouse.jpeg
