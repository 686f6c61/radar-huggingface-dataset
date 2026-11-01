# mflux-community/fibo-2-0-edit-turbo-mflux-q3

## Resumen

Fibo-2.0-edit-turbo-mflux-q3 es una conversión comunitaria del modelo de generación y edición de imágenes briaai/Fibo-2.0-edit-turbo al formato MLX, cuantizado a 3 bits con cuantización afín de MLX. Lo publica la organización mflux-community, no los autores originales del modelo, y está pensado para ejecutar el modelo localmente en equipos con Apple Silicon (chips M1, M2, M3, M4 y posteriores) mediante la herramienta MFlux, una implementación nativa en MLX de código abierto.

El modelo base es un modelo de texto a imagen y edición de imágenes de Bria AI, distribuido bajo la licencia propietaria fibo-2.0-edit-turbo-license. Esta variante concreta no introduce cambios en la arquitectura ni en los pesos más allá de la conversión a MLX y la cuantización: el repositorio ocupa 5,6 GB frente a los 25,1 GB de la versión BF16, lo que permite ejecutarlo en Macs con memoria unificada modesta.

Su relevancia es práctica: acerca un modelo de difusión de gran tamano al hardware de consumo de Apple sin depender de CUDA ni de GPUs dedicadas. La información pública disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks) es limitada en la documentación proporcionada, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen y edición de imágenes (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de 3 bits (Q3) sobre text encoder, transformer y VAE; existen variantes BF16, Q8, Q6, Q5 y Q4 |
| Idiomas soportados | no disponible (las prompts se procesan mediante el text encoder del modelo base) |
| Licencia | fibo-2.0-edit-turbo-license (propietaria, heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX |
| Tamano del repositorio | 5,6 GB |
| Herramienta de ejecucion | MFlux 0.23.0 o superior |
| Plataforma | Apple Silicon (MLX) |

## Arquitectura y entrenamiento

El modelo base Fibo-2.0-edit-turbo es un modelo generativo de imágenes de Bria AI orientado a texto a imagen y edición de imágenes, con la etiqueta de pipeline text-to-image. La model card de esta conversión no detalla la arquitectura interna (tipo de transformer de difusión, variante de VAE, text encoder empleado) ni los datos de entrenamiento, el número de tokens vistos o si hubo fases de ajuste fino con preferencias humanas. Toda esa información corresponde al modelo original y no se reproduce en el repositorio de la conversión.

La innovación técnica de esta variante es la conversión a MLX y la cuantización afín de 3 bits aplicada de forma uniforme al text encoder, al transformer y al VAE. El nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar ningún indicador de cuantización en tiempo de inferencia. La conversión se realizó con MFlux 0.23.0 el 25 de octubre de 2026. El sufijo "turbo" del nombre original sugiere un modelo destilado para pocos pasos de muestreo, aunque el número exacto de pasos recomendado no se especifica en la documentación disponible.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resoluciones configurables, por ejemplo 1024x1024 mediante los parámetros `--width` y `--height`.
- Edición de imágenes guiada por instrucciones, según indica el nombre del modelo base (edit) y la herramienta `mflux-generate-fibo2-edit`.
- Control de reproducibilidad mediante semilla explícita (`--seed`).
- Ejecución local en Apple Silicon sin dependencia de CUDA ni de servicios en la nube.
- Cuantización integrada en los pesos, sin necesidad de configuración adicional en la línea de comandos.
- Soporte de descarga automática desde Hugging Face o uso de una copia local del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada para análisis, audio ni modo de pensamiento, dado que se trata de un modelo generativo de imágenes y no de un modelo de lenguaje.

## Casos de uso

- Generación de ilustraciones para prototipos de producto: un disenador puede lanzar `mflux-generate-fibo2-edit` con una prompt descriptiva y una semilla fija para obtener variaciones reproducibles de una idea en su propio Mac, sin coste por API y sin enviar material confidencial a terceros.
- Edición iterativa de imágenes en flujos creativos: gracias a la funcionalidad de edición del modelo base, se pueden aplicar instrucciones de modificación sobre una imagen existente y comparar resultados variando la semilla, todo localmente.
- Creación de recursos para documentación técnica: generar diagramas conceptuales, iconos o imágenes de cabecera para manuales internos a partir de descripciones textuales, con la ventaja de que el contenido no sale del equipo del desarrollador.
- Pruebas de concepto en entornos sin GPU NVIDIA: equipos de desarrollo con portátiles Mac pueden validar ideas de producto basadas en generación de imágenes antes de invertir en infraestructura con CUDA.
- Automatización de assets para videojuegos o aplicaciones: integración del comando de MFlux en scripts de compilación para producir borradores de texturas o ilustraciones de marcador de posición con semillas controladas.
- Investigación sobre cuantización extrema: este repositorio Q3 sirve como referencia para estudiar la degradación de calidad de un modelo de difusión al pasar de BF16 (25,1 GB) a 3 bits (5,6 GB) en el mismo hardware, comparando con las variantes Q4, Q5, Q6 y Q8 del mismo autor.
- Demostraciones y talleres: al ocupar solo 5,6 GB, el modelo se puede distribuir y ejecutar en sesiones formativas sobre MLX y generación de imágenes sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas de calidad de imagen (FID, CLIP score u otras), ni comparaciones cuantitativas entre los distintos niveles de cuantización (BF16, Q8, Q6, Q5, Q4, Q3). Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- Memoria: el repositorio pesa 5,6 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre para cargar los pesos, más el margen adicional para activaciones y el proceso de difusión. Como referencia orientativa, un Mac con 16 GB de memoria unificada debería poder alojarlo, aunque no se dispone de cifras oficiales de consumo en ejecución.
- GPU: requiere Apple Silicon con soporte MLX (familias M1, M2, M3, M4 o posteriores). No está pensado para GPUs NVIDIA, AMD ni para CPU genérica a través de este repositorio.
- Comparativa de tamanos dentro de la misma familia: BF16 25,1 GB, Q8 13,4 GB, Q6 10,3 GB, Q5 8,8 GB, Q4 7,2 GB y Q3 5,6 GB. La variante Q3 es la más ligera y la que mejor encaja en equipos con menos memoria.
- Despliegue: MFlux, instalable con `uv tool install --upgrade mflux`. El comando de generación es `mflux-generate-fibo2-edit` con los parámetros `--model`, `--base-model`, `--prompt`, `--width`, `--height`, `--seed` y `--output`.
- Alternativas de despliegue: no se documentan en la información disponible opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-edit-turbo-mflux-q3 (este) | no disponible | no disponible | safetensors MLX, 3 bits | fibo-2.0-edit-turbo-license | Hugging Face, 5,6 GB |
| fibo-2-0-edit-turbo-mflux-bf16 | no disponible | no disponible | safetensors MLX, BF16 | fibo-2.0-edit-turbo-license | Hugging Face, 25,1 GB |
| fibo-2-0-edit-turbo-mflux-q8 | no disponible | no disponible | safetensors MLX, 8 bits | fibo-2.0-edit-turbo-license | Hugging Face, 13,4 GB |
| briaai/Fibo-2.0-edit-turbo (original) | no disponible | no disponible | no disponible | fibo-2.0-edit-turbo-license | Hugging Face |

La comparación más directa es con las otras cuantizaciones de la misma familia MFlux, ya que comparten arquitectura y solo difieren en precisión y tamano. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de difusión de otros autores.

## Limitaciones y advertencias

- Licencia propietaria: hereda la fibo-2.0-edit-turbo-license del modelo base. Es imprescindible revisar los términos completos en la model card original antes de cualquier uso comercial; la conversión no relaja ninguna restricción.
- Conversión no oficial: el repositorio lo mantiene la comunidad mflux-community, no Bria AI. No hay garantía de soporte, actualizaciones ni corrección de errores por parte de los autores originales.
- Cuantización agresiva: el nivel Q3 de 3 bits puede degradar la fidelidad de las imágenes respecto a BF16, especialmente en detalles finos, texto dentro de la imagen y coherencia de composiciones complejas. No se han publicado métricas que cuantifiquen esa pérdida.
- Plataforma restringida: solo funciona en Apple Silicon mediante MLX; no es portable a CUDA ni a otros aceleradores a través de este repositorio.
- Idiomas: no se especifican los idiomas soportados por el text encoder; el rendimiento con prompts en castellano no está documentado.
- Sesgos y alucinación visual: no se documentan sesgos conocidos ni tasas de error, pero los modelos de difusión pueden reproducir estereotipos de los datos de entrenamiento y generar contenido incoherente o no solicitado. No hay información disponible sobre filtros de seguridad aplicados en esta conversión.
- Sin benchmarks: la ausencia de métricas publicadas impide validar objetivamente la calidad frente a alternativas.
- Fecha de creación futura: el repositorio figura creado el 25 de octubre de 2026, dato que conviene verificar si se usa como referencia temporal.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
- Modelo base original: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Versión BF16: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Versión Q8: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8
- Versión Q6: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Versión Q5: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Versión Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Repositorio de MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
