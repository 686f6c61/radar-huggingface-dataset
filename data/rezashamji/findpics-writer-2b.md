# rezashamji/findpics-writer-2b

## Resumen

findpics-writer-2b es un modelo de vision-lenguaje de 2.127.532.032 parametros (aproximadamente 2,13 mil millones) desarrollado por el usuario rezashamji. Se trata de un ajuste fino mediante LoRA del modelo Qwen/Qwen3-VL-2B-Instruct, orientado a una tarea muy concreta: generar una unica linea de "hechos de busqueda" (search facts) que describa el contenido de una fotografia, de modo que esa linea pueda indexarse y consultarse posteriormente sin necesidad de volver a analizar la imagen.

El modelo resuelve un problema practico de recuperacion de imagenes en el dispositivo: en lugar de inspeccionar cada foto de la biblioteca en el momento de la busqueda, cada imagen se describe una sola vez (por ejemplo, mientras el telefono se carga) y las busquedas posteriores operan sobre texto. Esta disenado para ejecutarse en un iPhone mediante MLX dentro de la aplicacion "find pics", lo que lo convierte en un ejemplo de modelo pequeno, cuantizado y de inferencia local.

La relevancia actual reside en su enfoque de eficiencia: un modelo de 2B con cuantizacion affine de 4 bits (grupo 64) en las capas de lenguaje y torre de vision en bf16, empaquetado en un unico archivo safetensors de 1,8 GB. La licencia Apache-2.0 y su naturaleza de pesos abiertos facilitan su reutilizacion, aunque el autor no publica resultados de benchmarks ni detalles exhaustivos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3-VL (transformer multimodal); pesos en formato MLX |
| Parametros totales | 2.127.532.032 (aproximadamente 2,13 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; la app usa una ventana de repeticion de 4.096 tokens |
| Tipos de cuantizacion | Affine 4 bits (grupo 64) en capas de lenguaje; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), un unico archivo de 1,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-2B-Instruct, un modelo vision-lenguaje de la familia Qwen3-VL, y se obtiene mediante un ajuste fino con LoRA sobre aproximadamente 359.000 pares (foto, linea) durante 2 epocas. El adaptador LoRA se fusiona con el modelo base y posteriormente se convierte a MLX para su ejecucion en hardware Apple. Las lineas objetivo del entrenamiento fueron generadas por Qwen/Qwen3.5-27B-FP8, un modelo de pesos abiertos de mayor tamano, en un esquema de destilacion de datos.

Los datos de entrenamiento son exclusivamente fotografias publicas: bibliotecas de entrenamiento de DISBench (Flickr / YFCC100M con licencias Creative Commons), Open Images V4 (CC BY 2.0) y fotos de iPhone de Wikimedia Commons con licencias libres. El autor declara explicitamente que no se utilizaron fotos privadas. No se detalla la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado.

La innovacion principal no es arquitectonica sino de formato y despliegue: la salida esta estructurada como grupos `campo: elementos` unidos por `; `, cubriendo escena, objetos, colores, personas, actividad, texto, aspecto y evento, con una longitud media de unos 74 tokens y un percentil 90 de aproximadamente 100. La decodificacion en la app es greedy (temperatura 0), con un maximo de 120 tokens nuevos, penalizacion de repeticion de 1,05 sobre una ventana de 4.096 tokens y parada cuando un elemento de lista se repite por tercera vez dentro de un campo.

## Capacidades

- Generacion de descripciones estructuradas de imagenes en una sola linea con campos semanticos (escena, objetos, colores, personas, actividad, texto, aspecto, evento).
- Comprension de imagenes (image-text-to-text) con entrada de una foto redimensionada a 448 px en el lado largo.
- Extraccion de texto presente en la imagen (campo `text`), con precision limitada segun el propio autor.
- Generacion de texto corto y controlado (media de 74 tokens, maximo configurado de 120).
- Inferencia en dispositivo mediante MLX en hardware Apple (iPhone).
- Soporte de conversacion multi-turno segun la etiqueta `conversational` del repositorio, aunque la tarea principal es de una sola pasada por imagen.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta soporte de audio ni modo "thinking".

## Casos de uso

- Indexacion de bibliotecas fotograficas personales en el dispositivo: el modelo describe cada foto una vez (por ejemplo, durante la carga) y genera una linea indexable, de modo que las busquedas posteriores operan sobre texto en lugar de reanalizar cada imagen, reduciendo coste computacional y consumo de bateria.
- Busqueda semantica local en aplicaciones moviles: las lineas generadas permiten consultas por escena, objeto, color o actividad sin enviar fotos a la nube, lo que resulta adecuado por privacidad y por latencia.
- Etiquetado automatico de archivos multimedia: la salida con campos delimitados facilita la conversion a metadatos estructurados para catalogos, gestores de fotos o sistemas de gestion documental.
- Generacion de descripciones para accesibilidad: la linea de hechos puede servir como texto alternativo breve en galerias, aunque el autor advierte que esta pensada para recuperacion y no para visualizacion.
- Preprocesado en pipelines de recuperacion de imagenes (RAG multimodal): las descripciones textuales pueden alimentar un indice vectorial o un motor de busqueda de texto completo junto a las imagenes originales.
- Filtrado y organizacion de grandes volumenes de fotos en local: al ejecutarse en un iPhone con MLX, permite clasificar y agrupar contenido sin infraestructura de servidor, util para aplicaciones de gestion de recuerdos o archivos personales.
- Deteccion de texto en fotos para busquedas por contenido escrito (por ejemplo, carteles o documentos fotografiados), con la advertencia de que el modelo puede leer mal el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se distribuye cuantizado en 4 bits para las capas de lenguaje y en bf16 para la torre de vision, con un unico archivo de 1,8 GB; la memoria necesaria en tiempo de ejecucion sera superior al tamano del archivo, aunque no se especifica una cifra concreta.
- GPU recomendadas: el formato es MLX, por lo que esta orientado a hardware Apple (chips de la serie M y iPhone). No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en el repositorio.
- Cabe en GPU de consumo: si, en el ecosistema Apple; no se documenta su ejecucion en GPU de consumo NVIDIA.
- Opciones de despliegue: mlx-vlm (comando `python -m mlx_vlm.generate`), con los parametros `--max-tokens 120 --temperature 0.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| findpics-writer-2b | 2,13 mil millones | no disponible (ventana de repeticion de 4.096 tokens en la app) | MLX, safetensors, 4 bits | Apache-2.0 | Especializado en lineas de hechos para busqueda de fotos en dispositivo |
| Qwen/Qwen3-VL-2B-Instruct | aproximadamente 2 mil millones | no disponible en la informacion | safetensors (modelo base) | Apache-2.0 | Modelo base generalista de vision-lenguaje; no especializado en descripcion de una linea |
| Qwen/Qwen3.5-27B-FP8 | 27 mil millones (aproximado) | no disponible en la informacion | FP8 | no disponible en la informacion | Modelo generador de las lineas objetivo del entrenamiento; mucho mayor y no apto para dispositivo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las lineas estan pensadas para recuperacion, no para visualizacion: pueden omitir objetos pequenos, equivocar colores o leer mal el texto de la foto.
- El autor advierte explicitamente de que no deben usarse para tomar decisiones sobre personas.
- No se documentan sesgos conocidos, pero al entrenarse con fotografias publicas (Flickr, Open Images, Wikimedia) puede heredar sesgos de representacion de esas fuentes.
- Riesgo de alucinacion en la descripcion de objetos, colores o texto no presentes en la imagen.
- Idiomas soportados no disponibles; no se garantiza cobertura multilingue.
- Longitud de contexto no documentada de forma explicita; la ventana de 4.096 tokens corresponde a la configuracion de decodificacion de la app, no necesariamente al contexto maximo del modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- Dependencia del ecosistema MLX: no hay soporte documentado para otros runtimes, lo que limita su despliegue en infraestructura no Apple.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rezashamji/findpics-writer-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo generador de datos de entrenamiento: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Libreria de inferencia mlx-vlm: no disponible en la informacion (referenciada como paquete `mlx-vlm` en el README)
- DISBench: no disponible enlace en la informacion
- Open Images V4: no disponible enlace en la informacion
- Wikimedia Commons: no disponible enlace en la informacion
