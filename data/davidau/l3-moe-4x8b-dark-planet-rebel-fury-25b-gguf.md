# DavidAU/L3-MOE-4x8B-Dark-Planet-Rebel-FURY-25B-GGUF

## Resumen

L3-MOE-4x8B-Dark-Planet-Rebel-FURY-25B es un modelo de lenguaje de tipo mixture of experts (MoE) construido mediante la herramienta mergekit a partir de cuatro modelos derivados de Llama 3 de 8B parametros cada uno, todos ellos variantes del linaje "Dark Planet" del mismo autor (DavidAU). El resultado es un unico checkpoint de aproximadamente 25B parametros totales (24.942.219.264 segun los pesos safetensors) que combina cuatro "expertos" de 8B para generar texto creativo, ficcion y roleplay.

El modelo esta disenado especificamente para escritura creativa: prosa vivida, dialogo, descripcion, metaforas, generacion de tramas y subtramas, y roleplay sin censura. Segun el autor, su seguimiento de instrucciones y su generacion para ficcion son "excepcionales", con una perplejidad mas baja que la de Meta Llama 3 Instruct. Soporta todos los generos (ciencia ficcion, romance, terror, etc.) y esta pensado para operar con plantilla Llama 3 o Command-R.

Es relevante para desarrolladores e investigadores que necesitan un modelo local de escritura creativa con un equilibrio poco habitual: 25B parametros totales pero con la posibilidad de activar solo 2 de los 4 expertos, lo que reduce el coste de inferencia y permite ejecutarlo en GPUs de consumo (el autor reporta 34 t/s con 2 expertos en una tarjeta de 16 GB con cuantizacion Q3KS). La version publicada en este repositorio es la cuantizada en GGUF por mradermacher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3, fusionado como mixture of experts (MoE) con mergekit |
| Parametros totales | 24.942.219.264 (aprox. 25B) |
| Parametros activos | No disponible (MoE de 4 expertos de 8B; el autor indica que se pueden usar 2, 3 o 4 expertos, pero no publica el numero de parametros activos por token) |
| Longitud de contexto | 8192 tokens nativos; 32k+ mediante RoPE extendido |
| Tipos de cuantizacion | GGUF en multiples niveles (el autor menciona Q3KS; el repo incluye varias cuantizaciones GGUF, sin listado completo disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en bfloat16 / safetensors |

## Arquitectura y entrenamiento

El modelo es un merge MoE construido con mergekit sobre la base Llama 3. Cada uno de los cuatro expertos ("b3", "b4", "r1" y "b6") es una version "evolucionada" del merge original L3-Dark-Planet-8B, obtenida mediante un proceso iterativo de merge y evaluacion: cada variante se prueba y se conserva solo si aporta atributos unicos o mejora rasgos positivos respecto a las anteriores. El primero de los expertos actua como "capitan" del MoE y todos contribuyen a la seleccion de token. El autor indica que el MoE esta configurado por defecto con 2 expertos, aunque permite usar 3 o 4.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si hubo etapas de RLHF o DPO; el proceso es exclusivamente de fusion de pesos (merge), no de entrenamiento adicional. La innovacion tecnica principal es la propia construccion MoE por merge: combina el conocimiento de cuatro variantes de 8B en un unico modelo de 25B con una perplejidad que el autor afirma inferior a la de Meta Llama 3 Instruct, y permite escalar el coste de inferencia segun el numero de expertos activados. El modelo requiere plantilla Llama 3 o Command-R y funciona con temperature de 0 a 5 y repetition penalty de 1 o superior (recomendado 1.02+).

## Capacidades

- Generacion de texto creativo: prosa vivida, descripcion, imagenes, metaforas y variacion en longitud y composicion de frases y parrafos.
- Escritura de ficcion en todos los generos: ciencia ficcion, romance, terror, humor, etc.
- Generacion de tramas y subtramas, continuacion de escenas y storytelling.
- Roleplay conversacional sin censura, con dialogo que el autor describe como poco "de IA".
- Seguimiento de instrucciones para escritura y generacion larga (el modelo tiende a producir salidas largas salvo que se especifique la longitud).
- Capacidad de operar con temperature de 0 a 5, lo que permite forzar variaciones estilisticas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Escritura de ficcion larga: el modelo puede generar capitulos y continuar escenas manteniendo coherencia estilistica dentro de su contexto de 8192 tokens (ampliable con RoPE), gracias a su entrenamiento orientado a prosa y narracion.
- Generacion de tramas y subtramas para guiones o novelas: se le puede pedir que proponga arcos argumentales y los desarrolle con detalle visceral, aprovechando su sesgo hacia descripciones intensas.
- Roleplay y narrativa interactiva: su capacidad de dialogo "poco de IA" y su tolerancia a temperature alta lo hacen adecuado para personajes con voz propia en sesiones multi-turno.
- Escritura de terror y horror grafico: el autor documenta que responde bien a instrucciones del tipo "(graphic vivid horror)" para forzar un registro concreto.
- Generacion de contenido para videojuegos narrativos: descripciones de escenarios, dialogos de PNJ y variaciones de texto ramificado, ejecutables en local en GPUs de consumo con 2 expertos.
- Prototipado creativo en local: con cuantizacion Q3KS y 2 expertos corre a unas 34 t/s en una GPU de 16 GB, lo que permite iterar rapidamente en estaciones de trabajo modestas.
- Experimentacion con merges MoE: investigadores interesados en tecnicas de mergekit pueden usar el modelo como caso de estudio de fusion de cuatro expertos y del efecto del numero de expertos activos en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta datos cualitativos (perplejidad inferior a Meta Llama 3 Instruct) y una cifra de throughput: 34 t/s con 2 expertos en una GPU de 16 GB con cuantizacion Q3KS, velocidad que segun el autor se duplica en tarjetas de gama media.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, un modelo de 25B en GGUF Q3 ocupa aproximadamente 11-12 GB de pesos; en Q4 en torno a 14-15 GB; en Q5 alrededor de 17-18 GB; en Q8 cerca de 26-27 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: el autor reporta funcionamiento en una GPU de 16 GB con Q3KS y 2 expertos. Para cuantizaciones mayores o 4 expertos se recomienda 24 GB o mas (RTX 3090/4090, A5000) y, para bfloat16 completo, 48-80 GB (A100, H100).
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizaciones bajas y 2 expertos; en 24 GB con cuantizaciones medias.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo declara compatibilidad con endpoints y la libreria transformers para el modelo base.
- Latencia y throughput: 34 t/s con 2 expertos en GPU de 16 GB y Q3KS (dato del autor); el resto de configuraciones no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3-MOE-4x8B-Dark-Planet-Rebel-FURY-25B | 25B (MoE 4x8B) | 8192 (32k+ con RoPE) | Escritura creativa y roleplay sin censura | No disponible | GGUF en Hugging Face |
| L3-Dark-Planet-8B (DavidAU) | 8B | No disponible | Escritura creativa, base del linaje | No disponible | GGUF y safetensors |
| Meta Llama 3 8B Instruct | 8B | 8192 | Asistente general | Licencia comunitaria Llama 3 | Amplia |
| Modelos de escritura creativa de 8B (familia Dark Planet y similares) | 8B | Variable | Ficcion y roleplay | Variable | GGUF en Hugging Face |

La comparativa con alternativas de la misma categoria es limitada porque no se han publicado benchmarks comparativos en la informacion disponible; las diferencias se basan en el enfoque declarado por el autor y en el tamano.

## Limitaciones y advertencias

- Contenido NSFW explicito: violencia, gore, terror, lenguaje soez y material para adultos; no apto para entornos sin moderacion.
- Sesgo negativo declarado por el autor: el modelo "no es un modelo de finales felices" y presenta un sesgo hacia lo negativo.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; al estar orientado a ficcion, no es fiable para tareas de conocimiento.
- Solo ingles: no hay soporte multilingue declarado.
- Contexto limitado a 8192 tokens nativos; la extension con RoPE puede degradar el seguimiento de instrucciones y requiere ajustar temperature e instrucciones.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base y de Llama 3 antes de usarlo en produccion.
- El modelo base y el linaje Dark Planet no tienen versiones publicadas de los expertos individuales, lo que dificulta la reproducibilidad del merge.
- El autor advierte que distintas cuantizaciones producen salidas ligeramente diferentes, lo que complica la consistencia entre entornos.
- Requiere plantilla Llama 3 o Command-R; el uso con otras plantillas puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/DavidAU/L3-MOE-4x8B-Dark-Planet-Rebel-FURY-25B-GGUF
- Modelo base: https://huggingface.co/DavidAU/L3-MOE-4x8B-Dark-Planet-Rebel-FURY-25B
- L3-Dark-Planet-8B (GGUF): https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- L3-Dark-Planet-8B (fuente): https://huggingface.co/DavidAU/L3-Dark-Planet-8B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Proyecto WORDSTORM: https://huggingface.co/collections/DavidAU/d-au-wordstorm-10-part-series-incl-full-source-67257ba027f7e244222907fd
- Preguntas frecuentes y soporte del autor: https://huggingface.co/DavidAU/support
