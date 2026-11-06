# mflux-community/qwen-image-2-1-turbo-mflux-q5

## Resumen
Qwen-Image 2.1 Turbo · MFlux Q5 es una cuantización comunitaria, en formato MLX de 5 bits, del modelo de generación de imágenes por texto Qwen-Image-2.1-Turbo de Qwen. La conversión no es oficial: la ha realizado la organización mflux-community utilizando MFlux 0.24.0 para que el modelo pueda ejecutarse de forma nativa en Macs con Apple Silicon mediante el framework MLX.

El problema que resuelve es claro: el modelo original en BF16 ocupa 32,5 GB, una cifra que excede la memoria unificada de la mayoría de Macs de consumo. Esta versión Q5 reduce el peso a 11,9 GB, lo que lo hace viable en equipos con 16-24 GB de memoria unificada, manteniendo una calidad de imagen razonablemente cercana al original.

Es relevante porque Qwen-Image-2.1-Turbo es una de las variantes turbo (optimizadas para pocos pasos de inferencia) de la familia de difusión de Qwen, y MFlux es actualmente una de las vías más sencillas para ejecutar modelos de difusión de última generación localmente en macOS. El pipeline es text-to-image y la licencia heredada es qwen-research, con las restricciones que eso implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (arquitectura detallada no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5 (afine, 5 bits, MLX) sobre codificador de texto, transformer y VAE; disponibles tambien BF16, Q8, Q6, Q4 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada del modelo original) |
| Formato de pesos | safetensors (cuantizados, formato MLX/MFlux) |

Datos adicionales: tamano del repositorio de 11,9 GB; 232 descargas registradas; conversion realizada el 30 de octubre de 2026 con MFlux 0.24.0.

## Arquitectura y entrenamiento
Se trata de una version cuantizada del modelo Qwen-Image-2.1-Turbo, un sistema de difusion text-to-image. La cuantizacion de MFlux aplica MLX affine quantization a 5 bits sobre los tres componentes del pipeline: el codificador de texto, el transformer (modulo de difusion) y el VAE. El nivel de cuantizacion queda almacenado en los propios pesos, por lo que no es necesario pasar ninguna flag adicional como `--quantize` al ejecutarlo.

No hay informacion disponible sobre la arquitectura interna detallada (tipo de transformer de difusion, numero de pasos de inferencia de la variante turbo, resolucion maxima), ni sobre los datos de entrenamiento, numero de tokens o tecnicas de post-entrenamiento del modelo original. Esta ficha describe la conversion comunitaria; para detalles de entrenamiento habria que consultar la model card y la documentacion de Qwen/Qwen-Image-2.1-Turbo.

## Capacidades
- Generacion de imagenes a partir de texto (pipeline text-to-image), con resoluciones configurables mediante los parametros `--width` y `--height` (el ejemplo oficial usa 1024x1024).
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de entornos CUDA.
- Cuantizacion integrada en los pesos: no requiere configuracion extra para funcionar en 5 bits.
- Control de reproducibilidad mediante semilla (`--seed`).
- Descarga automatica de pesos desde Hugging Face en el primer uso, o uso offline con copia local.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.

## Casos de uso
- Generacion local de imagenes en Mac: cualquier usuario con un Apple Silicon y suficiente memoria unificada puede generar imagenes 1024x1024 sin depender de servicios en la nube, garantizando privacidad de los prompts.
- Prototipado rapido de prompts: al ser una variante turbo y correr en local, permite iterar rapidamente sobre prompts y semillas sin coste por peticion de API.
- Generacion batch de activos creativos: scripts con MFlux pueden automatizar la creacion de ilustraciones, variaciones de estilo o moodboards para diseno grafico.
- Integracion en pipelines de contenido: al ser una herramienta de linea de comandos, se puede invocar desde scripts de Python o shell para generar imagenes de forma programada (por ejemplo, cabeceras de articulos o ilustraciones de redes sociales).
- Prueba de degradacion por cuantizacion: comparar Q5 frente a Q8 o BF16 permite evaluar cuanto impacto real tiene la cuantizacion a 5 bits en la calidad de imagen antes de decidir la version a desplegar.
- Entornos sin GPU NVIDIA: equipos de investigacion o estudios creativos que solo disponen de hardware Apple pueden usar modelos de difusion recientes sin alquilar instancias cloud con A100/H100.
- Uso offline: descargando los pesos localmente con `hf download`, se puede generar sin conexion a internet, util en entornos con restricciones de red.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de generacion de imagenes, las metricas habituales (MMLU, HumanEval, GSM8K) no son aplicables; tampoco se proporcionan metricas de fidelidad de imagen (FID, CLIP score) ni tiempos de generacion por imagen en la model card.

## Requisitos de hardware
- Memoria unificada estimada: 11,9 GB solo de pesos; en la practica se recomienda un Mac con al menos 16-24 GB de memoria unificada para dejar margen a los estados intermedios de inferencia.
- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta orientado a GPU NVIDIA ni a Linux; para ello convendria usar el modelo original en formato estandar.
- Comparativa de memoria entre versiones MFlux del mismo modelo: BF16 (32,5 GB), Q8 (17,8 GB), Q6 (13,9 GB), Q5 (11,9 GB), Q4 (10,0 GB), Q3 (8,0 GB). Si el equipo tiene 16 GB, Q5 o Q4 son las opciones mas realistas; con 8 GB habria que recurrir a Q3.
- Despliegue: exclusivamente mediante MFlux (`uv tool install --upgrade mflux`, comando `mflux-generate-qwen-2.1`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusion en formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser una variante turbo, se espera un numero reducido de pasos de difusion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Version MFlux | Tamano | Cuantizacion | Comentario |
|---|---|---|---|
| BF16 | 32,5 GB | Sin cuantizar | Maxima calidad, requiere Macs con mucha memoria unificada |
| Q8 | 17,8 GB | 8 bits | Buena calidad, viable en Macs de 24-32 GB |
| Q6 | 13,9 GB | 6 bits | Compromiso intermedio |
| **Q5 (esta ficha)** | **11,9 GB** | **5 bits** | **Viable en Macs de 16-24 GB con perdida de calidad moderada** |
| Q4 | 10,0 GB | 4 bits | Para equipos de 16 GB ajustados |
| Q3 | 8,0 GB | 3 bits | Minima memoria, mayor degradacion de calidad |

Todas las versiones derivan del mismo modelo base Qwen/Qwen-Image-2.1-Turbo y comparten licencia. No se dispone de datos comparativos de calidad de imagen entre cuantizaciones, ni de comparativas con otros modelos de difusion (FLUX, Stable Diffusion) en la informacion proporcionada.

## Limitaciones y advertencias
- Conversion comunitaria: no es un lanzamiento oficial de Qwen; cualquier problema de calidad derivado de la cuantizacion a 5 bits (artefactos, perdida de detalle fino, degradacion en la reproduccion de texto dentro de imagenes) es responsabilidad de la conversion, no del modelo original.
- Licencia qwen-research: es una licencia restrictiva orientada a investigacion. Antes de cualquier uso comercial debe revisarse el texto completo en el enlace de licencia del modelo original; no se garantiza el uso comercial sin condiciones.
- Plataforma: solo funciona de forma practica en Apple Silicon con MFlux; no hay ruta documentada para Linux, Windows o CUDA.
- Consumo de memoria: 11,9 GB de pesos pueden provocar swapping en Macs de 16 GB, degradando la velocidad de generacion.
- Sin metricas publicadas: no hay benchmarks de calidad ni de latencia, por lo que la evaluacion debe hacerse de forma empirica.
- Datos del modelo original (arquitectura detallada, datos de entrenamiento, sesgos) no disponibles en esta model card; conviene consultar la documentacion de Qwen para un analisis de sesgos y alucinaciones visuales.
- Repositorio con muy poca traccion (0 likes, 232 descargas en el momento de la ficha): posible falta de soporte comunitario y de deteccion temprana de errores.

## Enlaces
- Repositorio de esta cuantizacion: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q5
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- MFlux (implementacion MLX): https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Version BF16: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-bf16
- Version Q8: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q8
- Version Q6: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q6
- Version Q4: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q4
- Version Q3: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q3
