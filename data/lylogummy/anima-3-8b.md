# lylogummy/Anima-3.8B

## Resumen

Anima 3.8B es un modelo de difusion de imagenes desarrollado por lylogummy, presentado como una expansion experimental del modelo Anima 2.9B. Su objetivo principal es mejorar la adherencia a las instrucciones del prompt, el anclaje de multiples personajes, las interacciones entre ellos, las instrucciones espaciales y la combinacion de lenguaje natural con etiquetas (tags). El modelo se compone de un transformer de difusion (DiT) expandido a 52 bloques, un adaptador progresivo de cross-attention basado en Qwen3.5 y el codificador de texto Qwen3.5 4B como componente separado de inferencia.

La relevancia de este modelo radica en que aborda una limitacion comun en los modelos de difusion para ilustracion: la comprension limitada de prompts complejos con multiples sujetos y relaciones espaciales. Al sustituir el codificador de texto original de 0.6B parametros por uno de 4B, Anima 3.8B consigue interpretar descripciones en lenguaje natural con mayor precision, manteniendo el estilo visual caracteristico de la serie Anima. El modelo se distribuye como un lanzamiento pareado: el checkpoint Pro52 con los bloques DiT entrenados y el adaptador que conecta las representaciones ocultas de Qwen3.5 con el denoiser.

El modelo se integra en ComfyUI mediante nodos personalizados y requiere una build actualizada con soporte nativo para Anima. La resolucion recomendada es de 832x1216 pixeles, con una fuerza de adaptador de 1.0, CFG entre 7 y 8, y entre 28 y 50 pasos de muestreo. El repositorio incluye ocho demostraciones visuales que muestran capacidades como adherencia tipografica, composicion espacial, interacciones entre dos personajes y recuento exacto de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 52 bloques con adaptador de cross-attention progresivo |
| Parametros totales | 3.8B (modelo de difusion expandido); Qwen3.5 4B como codificador de texto separado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion, no procesa texto directamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere soporte multilingue del codificador Qwen3.5, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo de difusion, adaptador y codificador de texto) |

## Arquitectura y entrenamiento

Anima 3.8B es un modelo de difusion basado en transformer (DiT) que expande los bloques del modelo Anima 2.9B de 2.9B a 3.8B parametros, alcanzando 52 bloques. La arquitectura se compone de tres elementos principales: el checkpoint Pro52 con los bloques DiT entrenados, un adaptador progresivo de cross-attention que conecta las representaciones ocultas del codificador de texto con el denoiser, y el codificador de texto Qwen3.5 4B como componente de inferencia independiente. A diferencia de un modelo de traduccion de prompts o alineacion, Anima 3.8B condiciona el denoiser directamente a traves de cross-attention aprendida sobre los estados ocultos de Qwen3.5.

El entrenamiento se realizo a baja resolucion, lo que explica la recomendacion de conectar la salida nativa del modelo al segundo ksampler o pasada de alta resolucion para evitar artefactos. El modelo fue entrenado con un formato de prompt especifico que separa las etiquetas meta/artista/calidad de la descripcion en lenguaje natural mediante el separador "Description:". Este enfoque permite combinar etiquetas tradicionales de ilustracion con descripciones narrativas, facilitando escenas complejas con multiples personajes y relaciones espaciales. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de ilustraciones de estilo anime con adherencia mejorada a prompts en lenguaje natural.
- Anclaje de multiples personajes en una misma escena, manteniendo la identidad de cada uno sin confusiones.
- Comprension de instrucciones espaciales explicitas, como posiciones relativas ("Miku on top right", "Teto on lower left").
- Interacciones entre personajes, incluyendo contacto fisico, poses conjuntas y conflictos emocionales.
- Combinacion de etiquetas tradicionales (meta, artista, calidad) con descripciones narrativas mediante el separador "Description:".
- Renderizado de texto dentro de la imagen, como carteles o letreros con contenido legible.
- Recuento exacto de objetos y personajes en la escena.
- Composicion en paneles multiples (hasta cuatro vinietas) con coherencia entre ellos.
- Soporte de lenguaje natural hibrido: frases completas, etiquetas sueltas o mezcla de ambas.

## Casos de uso

- Ilustracion de personajes con identidad preservada: el modelo permite generar escenas con multiples personajes conocidos (por ejemplo, Miku y Teto de Vocaloid) manteniendo sus rasgos distintivos, gracias al anclaje por nombre explicito en lugar de pronombres.
- Composicion espacial para portadas y carteles: las instrucciones de posicion ("arriba a la derecha", "abajo a la izquierda") permiten disenar composiciones precisas sin necesidad de edicion posterior.
- Generacion de escenas narrativas para novelas visuales: la comprension de descripciones en lenguaje natural facilita la creacion de ilustraciones que acompanan texto narrativo, con coherencia entre personajes y entorno.
- Creacion de contenido con tipografia integrada: el modelo puede renderizar texto legible dentro de la imagen, util para carteles, portadas de doujinshi o memes ilustrados.
- Ilustracion de escenas de accion y conflicto: la capacidad de representar interacciones fisicas y emocionales entre personajes permite generar escenas dinamicas para comics o juegos.
- Generacion de vinietas multiples: el modelo puede componer paneles de hasta cuatro escenas relacionadas, adecuado para historietas cortas o tiras comicas.
- Prototipado rapido de conceptos para ilustradores: la combinacion de tags y lenguaje natural permite iterar rapidamente sobre ideas complejas sin necesidad de prompts extremadamente detallados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor proporciona ocho demostraciones visuales en el repositorio de HuggingFace que muestran las capacidades del modelo, pero no incluye metricas cuantitativas como FID, CLIP score o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamano del repositorio (12.5 GB) y la arquitectura de 3.8B parametros, se estima un consumo de al menos 8-12 GB de VRAM para inferencia en FP16, dependiendo de la resolucion de salida.
- GPU recomendadas: se recomienda una GPU con al menos 12 GB de VRAM, como RTX 3060/3080/4090 o equivalentes de AMD. Para resoluciones de 1MP (832x1216) con CFG 7-8 y 28-50 pasos, una RTX 3090 o superior ofrecera tiempos de generacion razonables.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer de gama media-alta, aunque los tiempos de generacion pueden ser elevados en tarjetas con menos de 12 GB.
- Opciones de despliegue: el modelo se integra exclusivamente en ComfyUI mediante los nodos personalizados del repositorio comfyui-anima-3-8B. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende de la GPU, la resolucion y el numero de pasos. Con los parametros recomendados (28-50 pasos, 832x1216), una RTX 4090 podria generar una imagen en 30-90 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Codificador de texto | Capacidades destacadas | Licencia |
|---|---|---|---|---|---|
| Anima 3.8B | 3.8B (DiT) + 4B (encoder) | DiT de 52 bloques | Qwen3.5 4B | Multi-personaje, espacial, texto en imagen | no disponible |
| Anima 2.9B | 2.9B | DiT | Qwen 3 0.6B | Estilo visual Anima, adherencia basica | no disponible |
| Anima 2B | 2B | DiT | Qwen 3 0.6B | Estilo visual Anima, prompts simples | no disponible |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de informacion sobre alternativas de otros desarrolladores con caracteristicas equivalentes. La principal diferencia entre Anima 3.8B y sus predecesores es el salto en el codificador de texto (de 0.6B a 4B parametros) y la expansion de los bloques DiT, que se traduce en una mejor comprension de prompts complejos y escenas con multiples elementos.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de utilizarlo en proyectos con fines de lucro.
- Entrenamiento a baja resolucion: el modelo fue entrenado a baja resolucion, por lo que se recomienda usar la salida nativa en una segunda pasada de alta resolucion para evitar artefactos.
- Sensibilidad al CFG: valores altos de CFG pueden hacer que la rama semantica aprendida domine la salida, provocando resultados duros o homogenizacion de personajes. Se recomienda reducir el CFG antes que la fuerza del adaptador.
- Problemas con pronombres: el modelo tiene dificultades para resolver pronombres en escenas con multiples personajes. Se recomienda usar nombres explicitos en lugar de "she/he" para evitar confusiones.
- Formato de prompt especifico: el modelo requiere el separador "Description:" para distinguir entre etiquetas y descripcion narrativa. No seguir este formato puede degradar la adherencia al prompt.
- Dependencia de ComfyUI: el modelo solo funciona en ComfyUI con una build actualizada que incluya el modulo comfy.ldm.anima. No hay soporte para otros frameworks de inferencia.
- Idiomas soportados no confirmados: aunque el codificador Qwen3.5 4B es presumiblemente multilingue, no se ha confirmado oficialmente el rendimiento del modelo en idiomas distintos del ingles.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos no especificados en el prompt o distorsionar objetos complejos, especialmente en escenas muy densas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lylogummy/Anima-3.8B
- Nodos ComfyUI: https://github.com/GumGum10/comfyui-anima-3-8B
- Perfil del autor en HuggingFace: https://huggingface.co/lylogummy
- Modelo relacionado anima2b-qwen-3.5-4b: https://huggingface.co/lylogummy/anima2b-qwen-3.5-4b
