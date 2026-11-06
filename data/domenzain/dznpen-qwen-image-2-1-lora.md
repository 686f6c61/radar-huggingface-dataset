# domenzain/dznpen-qwen-image-2.1-lora

## Resumen

dznpen es un adaptador LoRA de tipo text-to-image especializado en generar escritura manuscrita compacta e irregularmente enlazada en ingles, frances y espanol. Lo desarrolla el usuario domenzain sobre el modelo base Qwen/Qwen-Image-2.1-Turbo, un modelo de difusion de Qwen para generacion de imagenes, y se distribuye a traves de la libreria diffusers. Su proposito es acotado: producir recortes de una sola linea de texto manuscrito con un estilo personal concreto, activado mediante la palabra clave `dznpen`.

El adaptador resuelve un problema muy especifico dentro de la sintesis de imagen: los modelos generativos generalistas no reproducen de forma fiable una caligrafia concreta ni respetan con precision el texto solicitado en una linea. dznpen se entrena con 59 lineas de entrenamiento y 12 de validacion del dataset domenzain/dznpen-qwen-image-data, y esta pensado para recortes de 1024x256 pixeles, lo que lo orienta a tareas de tipo OCR sintetico, generacion de datos de entrenamiento y simulacion de documentos manuscritos.

Es relevante ahora porque permite generar pares imagen-texto manuscrito de forma controlada y barata, algo util para aumentar datasets de reconocimiento optico de caracteres o para prototipar interfaces que muestren escritura realista. No obstante, el propio autor advierte de que no es un modelo verificado de identificacion de escritor y de que los numeros, el simbolo del euro y las escenas multilinea funcionan peor. La fuerza recomendada del adaptador es 0,75.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1-Turbo |
| Parametros totales | Aproximadamente 537 millones de parametros del adaptador (no incluye el modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (es un modelo de imagen, no de texto) |
| Tipos de cuantizacion | Peso del adaptador en BF16; el modelo base se carga en bfloat16 en el ejemplo oficial; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles, frances y espanol |
| Licencia | Qwen Research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `pytorch_lora_weights.safetensors` (safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 512 y alpha 512 aplicado unicamente a las capas de atencion del modelo base Qwen-Image-2.1-Turbo, entrenado en BF16. El checkpoint ocupa 1,1 GB en el repositorio e incorpora alrededor de 537 millones de parametros de adaptador. El modelo base referenciado es la revision `fc13ba1986fcb905854dc8de2f52eee395f49b5b` de Qwen/Qwen-Image-2.1-Turbo, que no se incluye en el repositorio y debe descargarse por separado.

El entrenamiento se realizo sobre el dataset domenzain/dznpen-qwen-image-data, compuesto por 59 lineas de entrenamiento y 12 de validacion. El proceso acumulo 9.600 pasos: un arranque en caliente de 3.200 pasos mas 6.400 adicionales, con reinicio del estado del optimizador y del generador aleatorio en el paso 3.200. La resolucion objetivo es de 1024x256 pixeles, orientada a recortes de una sola linea. No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de imagenes de texto manuscrito en una sola linea con estilo compacto e irregularmente enlazado, activado con la palabra clave `dznpen`.
- Soporte multilingue limitado a ingles, frances y espanol.
- Reproduccion de texto solicitado dentro de la imagen generada, con calidad variable segun la longitud y los caracteres.
- Generacion de recortes de 1024x256 pixeles adecuados para pipelines de OCR sintetico.
- Estilo visual de pluma estilografica oscura sobre papel blanco liso, segun el ejemplo de uso.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento, al ser un modelo de imagen.
- No dispone de capacidades de vision, audio ni comprension de imagenes; solo sintetiza imagenes.

## Casos de uso

- Aumento de datasets de OCR: generar lineas manuscritas sinteticas en ingles, frances y espanol para ampliar corpus de entrenamiento de reconocedores opticos, usando recortes de 1024x256 con texto controlado en el prompt.
- Simulacion de documentos manuscritos: crear notas, listas o anotaciones de una linea con aspecto de pluma estilografica para pruebas de interfaz o maquetas de producto.
- Prototipado de experiencias de escritura: generar muestras de caligrafia realista para validar disenos de aplicaciones de notas o digitalizacion de documentos.
- Generacion de datos de validacion para pipelines de vision: producir pares imagen-texto con semilla fija y fuerza de adaptador 0,75 para pruebas reproducibles de sistemas de lectura automatica.
- Investigacion sobre estilos de escritura: estudiar como un LoRA de rango 512 sobre un modelo de difusion captura caracteristicas estilisticas de caligrafia con solo 59 lineas de entrenamiento.
- Creacion de material de ejemplo para tutoriales o documentacion tecnica sobre diffusers y adaptadores LoRA, aprovechando el ejemplo de codigo oficial con `QwenImage21Pipeline`.
- Pruebas de robustez de OCR: generar lineas con numeros, signos de euro o espaciados irregulares para evaluar los limites del modelo, sabiendo que estos casos son mas debiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del modelo base Qwen-Image-2.1-Turbo cargado en bfloat16, al que se suma el adaptador de aproximadamente 537 millones de parametros en BF16 (unos 1,1 GB).
- GPU recomendadas: no se especifican en la informacion disponible; el ejemplo oficial usa `.to("cuda")` sin detallar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la libreria soportada es diffusers, con `QwenImage21Pipeline`, `load_lora_weights` y `set_adapters`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. El ejemplo oficial activa `use_kv_cache=True`, lo que sugiere un mecanismo de cache para acelerar la inferencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dznpen-qwen-image-2.1-lora | LoRA sobre difusion | ~537 M (adaptador) | No aplica | en, fr, es | Qwen Research | Hugging Face, 15 descargas |
| Qwen/Qwen-Image-2.1-Turbo | Difusion base | No disponible | No aplica | No disponible | Qwen Research | Hugging Face |
| Alternativas de LoRA de caligrafia | No disponible | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de caligrafia en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo verificado de identificacion de escritor; no debe usarse para atribuir escritura a personas concretas.
- Los numerales, el simbolo del euro y las escenas multilinea presentan un rendimiento mas debil segun el autor.
- El texto solicitado en el prompt no debe tratarse como verdad de referencia para OCR: hay que leer los pixeles generados, ya que la salida puede diferir del texto pedido.
- El entrenamiento se basa en solo 59 lineas, lo que limita la diversidad estilistica y puede provocar sobreajuste al estilo concreto.
- Cobertura linguistica reducida a ingles, frances y espanol; no se documenta soporte de otros idiomas.
- Licencia Qwen Research: conviene revisar las condiciones del modelo base antes de cualquier uso comercial, ya que la licencia del adaptador sigue a la del upstream.
- Riesgo de alucinacion visual: el modelo puede generar caracteres inexistentes o deformados, especialmente en textos largos.
- No se documentan sesgos especificos, pero al derivar de un modelo base de difusion puede heredar sesgos de sus datos de entrenamiento.
- Requiere descargar el modelo base por separado y fijar la revision concreta indicada para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domenzain/dznpen-qwen-image-2.1-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/domenzain/dznpen-qwen-image-data
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
