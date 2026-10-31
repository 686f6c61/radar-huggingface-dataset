# mflux-community/iris-3b-turbo-mflux-q4

## Resumen

Iris-3B-Turbo · MFlux Q4 es una versión cuantizada a 4 bits del modelo de generación de imágenes texto-a-imagen Iris-3B, originalmente publicado por Sperid Labs y convertido a formato MLX por la comunidad MFlux-Community. El objetivo de esta conversión es permitir ejecutar el modelo de forma local en ordenadores Mac con Apple Silicon (chips M1/M2/M3/M4), aprovechando el framework MLX de Apple y la biblioteca open source MFlux, sin necesidad de GPU dedicada de NVIDIA.

El modelo base, iris-3b, es un modelo de difusión de aproximadamente 3.000 millones de parámetros orientado a la síntesis de imágenes a partir de texto. La variante "turbo" indica que está optimizado para generar imágenes con pocos pasos de inferencia, lo que reduce significativamente el tiempo de generación. La cuantización Q4 reduce el tamaño del repositorio a 5,1 GB (frente a los 14 GB de la versión BF16), haciendo viable su uso en Macs con memoria unificada limitada.

Su relevancia actual radica en la creciente demanda de herramientas de generación de imágenes que funcionen completamente en local, sin depender de servicios en la nube, garantizando privacidad y sin costes por uso. Al estar bajo licencia Apache 2.0, tanto el modelo base como esta conversión pueden utilizarse en proyectos comerciales sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (arquitectura detallada no disponible) |
| Parametros totales | ~3B (modelo base iris-3b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de LLM) |
| Tipos de cuantizacion | Q4 (afine quantization de MLX a 4 bits, aplicada a text encoder, transformer y VAE) |
| Idiomas soportados | no disponible (los prompts se escriben tipicamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados en formato MLX para MFlux) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 5,1 GB (Q4); 8,0 GB (Q8); 14,0 GB (BF16) |
| Version de conversion | MFlux 0.24.0 (2026-10-27) |
| Pipeline | text-to-image |
| Resolucion de ejemplo | 1024x1024 |

## Arquitectura y entrenamiento

Iris-3b sigue el patron tipico de los modelos de difusion modernos texto-a-imagen, con tres componentes: un codificador de texto que procesa el prompt, un transformer de difusion que genera la imagen de forma iterativa, y un VAE (autoencoder variacional) que codifica y decodifica las imagenes en un espacio latente. La variante "turbo" esta pensada para funcionar con un numero reducido de pasos de muestreo, acercando la generacion a tiempo casi real en comparacion con los modelos de difusion clasicos.

Sobre el proceso de entrenamiento del modelo base (numero de tokens o imagenes, composicion del dataset, uso de RLHF o tecnicas equivalentes) no se ha publicado informacion en la model card disponible. La conversion a MLX aplica cuantizacion afine de 4 bits de forma uniforme sobre los tres componentes del modelo (text encoder, transformer y VAE), y el nivel de cuantizacion queda almacenado en los propios pesos, por lo que no es necesario pasar ninguna flag adicional (`--quantize`) al ejecutar el modelo.

Es importante senalar que este repositorio es una conversion comunitaria: los pesos originales de speridlabs/iris-3b solo se han modificado para su conversion a MLX y su cuantizacion, sin reentrenamiento ni ajuste fino adicional.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resolucion de hasta 1024x1024 en los ejemplos documentados.
- Generacion con pocos pasos de inferencia gracias a la variante "turbo", optimizada para velocidad.
- Ejecucion nativa en Apple Silicon mediante MLX, sin emulacion ni traducion de CUDA.
- Control de reproducibilidad mediante semillas (`--seed`).
- Descarga automatica de pesos desde HuggingFace en el primer uso, o uso de una copia local.
- No dispone de capacidades de texto, codigo, razonamiento, vision de entrada ni audio: es un modelo exclusivamente generador de imagenes.
- No hay informacion disponible sobre soporte de img2img, inpainting, LoRA u otras modalidades adicionales.

## Casos de uso

- Generacion local de ilustraciones para blogs y articulos tecnicos: al ejecutarse en el Mac sin enviar datos a la nube, es adecuado para generar imagenes originales rapidamente sin coste por API ni preocupaciones de privacidad.
- Prototipado rapido de conceptos visuales: la variante turbo permite iterar prompts con pocos pasos de muestreo, util para disenadores que exploran direcciones visuales antes de un render final.
- Generacion de assets para videojuegos indie: creacion de texturas, fondos y concept art preliminares directamente en el equipo de desarrollo.
- Integracion en pipelines de automatizacion en macOS: MFlux es una herramienta de linea de comandos, por lo que puede invocarse desde scripts de shell o Makefiles para generar imagenes de forma batch con semillas fijas y reproducibles.
- Educacion y experimentacion: al ser open source (MFlux) y tener licencia Apache 2.0, es util como base para estudiar modelos de difusion cuantizados en hardware de consumo.
- Generacion de imagenes en entornos sin conexion a internet: una vez descargados los pesos (5,1 GB), el modelo funciona completamente offline.
- Uso comercial de imagenes generadas: la licencia Apache 2.0 del modelo base permite el uso de las imagenes resultantes en productos comerciales sin regalias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos publicos de tiempos de generacion por imagen en esta model card; para la version BF16 y Q8 existen repositorios alternativos que pueden ofrecer un compromiso mayor entre calidad y tamano.

## Requisitos de hardware

- Memoria unificada estimada: al menos 8-10 GB de RAM unificada para la version Q4 (5,1 GB de pesos mas la memoria de activacion durante la inferencia); la version BF16 (14 GB) requiere Macs con 16 GB o mas.
- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3 o M4). No requiere GPU dedicada; la inferencia se ejecuta sobre la GPU integrada mediante MLX y la memoria unificada.
- No es adecuado para GPUs NVIDIA ni para ejecucion en Linux/Windows mediante este repositorio: el formato MLX es exclusivo del ecosistema Apple. Para otras plataformas habria que acudir al modelo base speridlabs/iris-3b.
- Despliegue: mediante la herramienta MFlux (`uv tool install --upgrade mflux`), con el comando `mflux-generate-iris`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia: no disponible; al ser una variante turbo, se espera un numero reducido de pasos de muestreo, pero no se publican cifras concretas de segundos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-q4 (este) | ~3B | Q4, 5,1 GB | Mac (MLX) | Apache 2.0 | Version turbo, pocos pasos |
| iris-3b-turbo-mflux-bf16 | ~3B | BF16, 14,0 GB | Mac (MLX) | Apache 2.0 | Maxima calidad, mas memoria |
| iris-3b-turbo-mflux-q8 | ~3B | Q8, 8,0 GB | Mac (MLX) | Apache 2.0 | Compromiso calidad/tamano |
| speridlabs/iris-3b (base) | ~3B | Pesos originales | Multiplataforma (segun implementacion) | Apache 2.0 | Modelo original sin cuantizar |

Comparativa con otros modelos texto-a-imagen (FLUX, Stable Diffusion, etc.): no disponible en la informacion proporcionada; no se han publicado benchmarks que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Se trata de una conversion comunitaria de MFlux-Community, no de una version oficial de Sperid Labs; la calidad de la cuantizacion Q4 puede degradar la fidelidad de las imagenes respecto a la version BF16, especialmente en detalles finos y texto dentro de las imagenes.
- La cuantizacion a 4 bits se aplica tambien al text encoder y al VAE, lo que puede afectar tanto a la comprension del prompt como a la reconstruccion final de la imagen.
- Los prompts funcionan presumiblemente mejor en ingles; no hay documentacion sobre rendimiento con prompts en castellano.
- Como todo modelo generativo de imagenes, puede reproducir sesgos presentes en sus datos de entrenamiento (estereotipos de genero, raza, etc.) y generar contenido ofensivo o enganoso si se le solicita; no se han publicado medidas de mitigacion ni filtros de seguridad en la model card.
- No hay informacion sobre watermarking, filtros de contenido ni evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero conviene revisar la model card original de speridlabs/iris-3b por si existieran restricciones adicionales de uso.
- El formato MLX limita el uso exclusivamente a hardware Apple; para despliegues en servidores con GPUs NVIDIA debe emplearse el modelo base.
- Riesgo de alucinacion visual: el modelo puede generar anatomias incorrectas, texto ilegible en imagenes y artefactos tipicos de la difusion cuantizada.

## Enlaces

- Repositorio de esta conversion (Q4): https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q4
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Version BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Version Q8: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- MFlux (implementacion MLX, GitHub): https://github.com/filipstrand/mflux
- Organizacion MFlux-Community en HuggingFace: https://huggingface.co/mflux-community
