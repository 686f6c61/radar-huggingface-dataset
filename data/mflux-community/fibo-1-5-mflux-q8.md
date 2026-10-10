# mflux-community/fibo-1-5-mflux-q8

## Resumen

Fibo-1.5 MFlux Q8 es una conversión comunitaria del modelo de generación de imágenes texto-a-imagen Fibo-1.5, desarrollado originalmente por Bria AI (briaai/Fibo-1.5), empaquetado para ejecutarse localmente en Apple Silicon mediante MFlux, la implementación del framework MLX creada por Filip Strand. La conversión la firma mflux-community y aplica cuantización affine de 8 bits (Q8) a los tres componentes del modelo: el codificador de texto, el transformer de difusión y el VAE.

El problema que resuelve es doble. Por un lado, permite ejecutar un modelo de imagen de última generación de forma totalmente local en un Mac, sin depender de APIs en la nube ni de GPUs NVIDIA. Por otro, reduce el peso del modelo desde los 25,5 GB de la versión BF16 hasta los 14,9 GB del Q8, lo que lo hace viable en equipos con memoria unificada más contenida. La familia MFlux de Fibo-1.5 incluye además variantes Q6, Q5, Q4 y Q3.

Se trata de un modelo de difusión (no de un LLM), por lo que conceptos como ventana de contexto, tool calling o parámetros activos no aplican directamente. Los detalles concretos de arquitectura interna, número de parámetros y datos de entrenamiento del modelo base no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con codificador de texto, transformer de difusion y VAE; detalles internos no disponibles |
| Parametros totales | no disponible (repo Q8 de 14,9 GB; version BF16 de 25,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; resolucion de ejemplo 1024x1024) |
| Tipos de cuantizacion | MLX affine 8-bit (Q8); la familia incluye BF16, Q8, Q6, Q5, Q4 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | bria-fibo (enlaza a CC BY-NC 4.0, uso no comercial) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Fibo-1.5 es un generador de imágenes texto-a-imagen del tipo difusión. Según la model card, la conversión a MFlux cuantiza de forma independiente tres bloques: el codificador de texto (text encoder), el transformer de difusión y el VAE. MFlux ejecuta estos componentes de forma nativa en MLX sobre Apple Silicon, sin necesidad de CUDA.

La cuantización utilizada es affine de 8 bits a lo largo de esos tres bloques. Un detalle relevante es que el nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar ningún flag `--quantize` al invocar la herramienta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia conversión a MLX y la cuantización.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image).
- Ejecución local en Apple Silicon mediante MLX, sin conexión a servicios externos.
- Resolución de trabajo de ejemplo de 1024x1024 píxeles.
- Generación reproducible mediante semilla fija (`--seed`).
- Control del tamaño de salida mediante parámetros de anchura y altura.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo "thinking", visión de entrada ni procesamiento de audio.

## Casos de uso

- Prototipado de conceptos visuales: permite generar imágenes de referencia a partir de descripciones textuales en el propio Mac del diseñador, con semilla fija para iterar sobre variaciones de un mismo concepto sin coste de API.
- Ilustración para contenido editorial y blogs: genera imágenes de 1024x1024 para acompañar artículos, aprovechando que la inferencia es local y no requiere subir material a terceros.
- Creación de assets de diseño (moodboards, paletas y composiciones): útil para explorar direcciones visuales antes de encargar trabajo definitivo a un artista.
- Flujos de trabajo con privacidad de datos: al ejecutarse en local, los prompts y las imágenes no salen del equipo, lo que resulta adecuado para borradores con información sensible.
- Uso offline en entornos sin conectividad: al no depender de la nube, funciona en portátiles durante desplazamientos o en redes restringidas una vez descargados los pesos.
- Investigación y experimentación en difusión: sirve para comparar el efecto de distintos niveles de cuantización (Q8 frente a Q4 o BF16) sobre la calidad de imagen en hardware Apple.
- Generación de imágenes para material educativo o demostraciones técnicas: permite producir ejemplos visuales reproducibles mediante semillas documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score ni comparaciones cuantitativas frente al modelo base en BF16, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, ya que MFlux usa MLX. No hay soporte para GPUs NVIDIA/CUDA.
- Peso de los pesos Q8: 14,9 GB en disco. La versión BF16 ocupa 25,5 GB y las variantes menores 12,0 GB (Q6), 10,6 GB (Q5), 9,2 GB (Q4) y 7,8 GB (Q3).
- Memoria unificada estimada: se requiere margen por encima del tamaño de los pesos para el sistema, activaciones y el propio proceso; con 14,9 GB de pesos conviene disponer de al menos 16-24 GB de memoria unificada para un funcionamiento estable (estimación, no dato oficial).
- Chips recomendados: Apple M-series con memoria suficiente, priorizando variantes Pro, Max o Ultra; en equipos de 8 GB el Q8 no es viable y habría que recurrir a cuantizaciones menores.
- Opciones de despliegue: MFlux mediante la CLI `mflux-generate-fibo` (instalable con `uv tool install --upgrade mflux`); también permite usar una copia local descargada con `hf download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de otras familias en la información proporcionada. La comparación más directa es con las otras cuantizaciones de la misma conversión comunitaria:

| Version | Tamano (GB) | Licencia | Disponibilidad |
|---|---|---|---|
| briaai/Fibo-1.5 (base, BF16 original) | no disponible | bria-fibo | HuggingFace |
| fibo-1-5-mflux-bf16 | 25,5 | bria-fibo | mflux-community |
| fibo-1-5-mflux-q8 (este repo) | 14,9 | bria-fibo | mflux-community |
| fibo-1-5-mflux-q6 | 12,0 | bria-fibo | mflux-community |
| fibo-1-5-mflux-q5 | 10,6 | bria-fibo | mflux-community |
| fibo-1-5-mflux-q4 | 9,2 | bria-fibo | mflux-community |
| fibo-1-5-mflux-q3 | 7,8 | bria-fibo | mflux-community |

Comparativas frente a alternativas de otras familias (por ejemplo, otros modelos de difusión texto-a-imagen ejecutables en local) no disponibles.

## Limitaciones y advertencias

- Licencia no comercial: la licencia bria-fibo enlaza a CC BY-NC 4.0, por lo que el uso comercial queda restringido; hay que revisar los términos completos en la model card del modelo original antes de cualquier despliegue en producción.
- Conversión no oficial: se trata de una conversión comunitaria de mflux-community, no de un lanzamiento de los autores originales de Fibo-1.5. Los pesos solo se han modificado para convertirlos a MLX y cuantizarlos.
- Dependencia de plataforma: solo funciona en Apple Silicon a través de MLX; no es utilizable en GPUs NVIDIA ni en entornos CUDA habituales.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la pérdida de calidad del Q8 frente a BF16 o frente al modelo base.
- Riesgo de artefactos: como todo modelo generativo de imágenes, puede producir resultados inconsistentes con el prompt, artefactos visuales o contenido no deseado; no se documentan filtros de seguridad específicos en esta conversión.
- Idiomas: no se especifica qué idiomas acepta el codificador de texto; los ejemplos de la model card están en inglés.
- Contexto e instrucciones complejas: al ser un modelo texto-a-imagen, no gestiona conversaciones multi-turno ni instrucciones de tipo agente.
- Adopción no validada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/fibo-1-5-mflux-q8
- Modelo base: https://huggingface.co/briaai/Fibo-1.5
- Model card original (terminos de licencia): https://huggingface.co/briaai/Fibo-1.5
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Implementacion MLX (MFlux): https://github.com/filipstrand/mflux
- Organizacion de conversiones: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/fibo-1-5-mflux-bf16
- Variante Q6: https://huggingface.co/mflux-community/fibo-1-5-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/fibo-1-5-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/fibo-1-5-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-1-5-mflux-q3
