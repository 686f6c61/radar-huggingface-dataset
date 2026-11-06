# mflux-community/fibo-2-0-edit-turbo-mflux-q4

## Resumen

Fibo-2.0-Edit-Turbo (versión MFlux Q4) es una cuantización a 4 bits del modelo de edición y generación de imágenes por texto Fibo-2.0-edit-turbo, desarrollado originalmente por Bria AI. Esta versión ha sido convertida por la comunidad MFlux-Community para ejecutarse de forma nativa en Mac con Apple Silicon mediante el framework MLX, resolviendo el problema de la alta huella de memoria del modelo original en precisión BF16 (25,1 GB frente a 7,2 GB en Q4).

El modelo pertenece a la familia text-to-image / image-editing: permite tanto generar imágenes desde un prompt como editar imágenes existentes guiadas por texto. La variante "turbo" está optimizada para inferencia con pocos pasos, lo que la hace adecuada para flujos de trabajo interactivos en local.

Su relevancia actual radica en la combinación de tres factores: un modelo comercial de edición de imágenes de Bria AI con licencia propia, una conversión comunitaria que lo hace accesible en hardware de consumo Apple (Mac con memoria unificada) y un tamaño de descarga contenido (7,2 GB) que permite ejecutarlo en máquinas con 16 GB de RAM unificada o más. La conversión se realizó con MFlux 0.23.0 el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión text-to-image / edición de imagen (detalles no disponibles; incluye text encoder, transformer de difusión y VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | Q4 (afín MLX, 4 bits, aplicada a text encoder, transformer y VAE); disponibles también BF16, Q8, Q6, Q5 y Q3 en otros repos |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-edit-turbo-license (licencia propia de Bria AI, heredada del modelo original) |
| Formato de pesos | safetensors (cuantizados MLX para Apple Silicon) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo, pero por su estructura de ejecución en MFlux consta de tres componentes estándar en modelos de difusión modernos: un text encoder que procesa el prompt, un transformer de difusión que genera la imagen y un VAE para codificación/decodificación en el espacio latente. La cuantización afín de MLX a 4 bits se aplica de forma uniforme a los tres componentes, y el nivel de cuantización queda almacenado en los propios pesos, por lo que no hace falta pasar ninguna flag adicional (`--quantize`) al ejecutarlo.

Sobre los datos de entrenamiento, el número de tokens o imágenes, la composición del dataset y el uso de técnicas de alineación (RLHF, DPO u otras) no están disponibles en la información proporcionada. Debe consultarse la model card del modelo original de Bria AI para esos detalles. Lo que sí indica el README es que la variante "turbo" está orientada a generación/edición con un número reducido de pasos de inferencia, y que los pesos de este repo solo difieren del original por la conversión a MLX y la cuantización.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image), con resoluciones configurables, por ejemplo 1024x1024.
- Edición de imágenes guiadas por texto (variante "edit"), modificando imágenes existentes según instrucciones.
- Inferencia acelerada tipo "turbo", pensada para funcionar con pocos pasos de difusión.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Descarga y gestión de pesos integrada en la CLI de MFlux (descarga automática desde Hugging Face o copia local).
- Semillas deterministas (`--seed`) para reproducibilidad de resultados.

No hay información sobre capacidades de tool calling, agentes ni procesamiento de audio; no aplican al ser un modelo de imagen.

## Casos de uso

- Generación de imágenes para prototipado rápido: un diseñador puede producir variantes de 1024x1024 desde prompts directamente en su MacBook, sin depender de APIs externas ni costes por imagen.
- Edición iterativa de imágenes: modificar objetos, estilos o fondos de una imagen existente mediante instrucciones textuales, útil en flujos de retoque creativo.
- Producción de activos para marketing y redes sociales: la variante turbo reduce el tiempo por imagen, adecuado para generar volúmenes de creatividades en sesiones interactivas.
- Desarrollo y pruebas de pipelines generativos en local: al ser ejecutable con MFlux vía CLI, se integra fácilmente en scripts de automatización y batch generation en entornos macOS.
- Investigación en cuantización de modelos de difusión: permite comparar la calidad de las versiones BF16, Q8, Q6, Q5, Q4 y Q3 del mismo modelo en hardware Apple.
- Aplicaciones con restricciones de privacidad: al ejecutarse íntegramente en local, no se envían prompts ni imágenes a servicios de terceros, relevante para datos sensibles o clientes con requisitos de confidencialidad.
- Evaluación previa a licenciamiento comercial: permite probar las capacidades del modelo de Bria AI antes de negociar los términos de la licencia fibo-2.0-edit-turbo-license para uso en producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se especifican tiempos de generación por imagen en el README; deben consultarse los repositorios del modelo original y de MFlux para medidas de latencia.

## Requisitos de hardware

- Memoria necesaria para los pesos: 7,2 GB en esta versión Q4 (frente a 25,1 GB en BF16, 13,4 GB en Q8, 10,3 GB en Q6, 8,8 GB en Q5 y 5,6 GB en Q3). Al usar memoria unificada de Apple Silicon, se recomienda un Mac con 16 GB de RAM o más para la versión Q4, dejando margen para el sistema y los latentes.
- Hardware objetivo: Mac con Apple Silicon (M1/M2/M3/M4). No requiere GPU NVIDIA; no es un modelo para CUDA en su formato MLX.
- Cabe en GPUs de consumo Apple: sí, la versión Q4 está diseñada precisamente para eso; versiones superiores (Q8, BF16) requieren máquinas con más memoria unificada (32 GB o más, idealmente 64 GB para BF16).
- Despliegue: mediante MFlux (`uv tool install --upgrade mflux`), con el comando `mflux-generate-fibo2-edit`. No aplica vLLM, TGI ni llama.cpp al ser un modelo de difusión en formato MLX.
- Latencia y throughput: no disponibles; la variante turbo sugiere un número reducido de pasos de inferencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano | Framework | Licencia |
|---|---|---|---|---|
| Fibo-2.0-edit-turbo MFlux Q4 (este repo) | Q4 | 7,2 GB | MLX / MFlux | fibo-2.0-edit-turbo-license |
| Fibo-2.0-edit-turbo MFlux Q8 | Q8 | 13,4 GB | MLX / MFlux | fibo-2.0-edit-turbo-license |
| Fibo-2.0-edit-turbo MFlux BF16 | BF16 | 25,1 GB | MLX / MFlux | fibo-2.0-edit-turbo-license |
| Fibo-2.0-edit-turbo original (briaai) | BF16 | no disponible | no disponible | fibo-2.0-edit-turbo-license |

Todas las variantes MFlux provienen del mismo modelo base y comparten licencia; la diferencia práctica es el equilibrio entre calidad (mayor precisión) y memoria/tiempo de carga (mayor cuantización). No se incluyen alternativas de otros fabricantes (FLUX, SDXL, etc.) porque no hay datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo original se distribuye bajo fibo-2.0-edit-turbo-license, una licencia propia de Bria AI, no una licencia abierta estándar. Debe revisarse la model card original antes de cualquier uso comercial; puede requerir licenciamiento o tener restricciones de uso.
- Conversión comunitaria: esta versión no es un lanzamiento oficial de Bria AI; la cuantización a 4 bits puede degradar la calidad de imagen respecto a BF16, especialmente en detalles finos y texto dentro de las imágenes.
- Sesgos: no documentados en este repositorio; al tratarse de un modelo generativo de imágenes entrenado por Bria AI, deben asumirse los sesgos típicos de estos modelos (estereotipos, subrepresentación de ciertos grupos). Consultar la model card original.
- Alucinación / fidelidad: en modelos de difusión es habitual la generación de anatomía incorrecta, texto ilegible en imágenes y artefactos; la cuantización Q4 puede acentuar estos problemas.
- Idiomas del prompt: no se especifica qué idiomas soporta el text encoder; la documentación de ejemplo usa inglés.
- Plataforma: el formato MLX solo funciona en Apple Silicon; para despliegue en servidores Linux/NVIDIA hay que recurrir a los pesos originales de briaai en su formato nativo.
- Datos de benchmarks y latencia no publicados: cualquier decisión de producción debe basarse en pruebas propias.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Variantes MFlux: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16, https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8, https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6, https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5, https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
