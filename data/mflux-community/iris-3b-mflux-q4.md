# mflux-community/iris-3b-mflux-q4

## Resumen

Iris-3B MFlux Q4 es una conversión comunitaria del modelo de generación de imágenes text-to-image speridlabs/iris-3b, empaquetada en formato MLX y cuantizada a 4 bits para su ejecución nativa en Apple Silicon. El modelo original, desarrollado por Sperid Labs, tiene 3.000 millones de parámetros y está diseñado para síntesis de imágenes a partir de descripciones textuales. Esta versión concreta no es un lanzamiento oficial de los autores originales, sino una conversión realizada por el colectivo MFlux-Community publicada el 27 de octubre de 2026.

La relevancia de esta ficha radica en que permite ejecutar un modelo generativo de imágenes de 3B en un Mac con memoria unificada modesta: el repositorio ocupa 5,1 GB en Q4, frente a los 14 GB de la versión BF16. La cuantización MLX affine de 4 bits se aplica de forma uniforme al text encoder, al transformer y al VAE, y el nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar ningún flag adicional al motor de inferencia.

El pipeline declarado es text-to-image y la librería asociada es MFlux, una implementación open source en MLX mantenida por Filip Strand que permite correr modelos generativos de imagen de última generación localmente en macOS. La licencia aplicable es la del modelo original (iris-3b-license), que se hereda sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image; el repo no detalla la arquitectura interna) |
| Parametros totales | 3.000 millones (3B, segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (Q4); el repo ofrece tambien BF16 y Q8 |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | iris-3b-license (other), heredada de speridlabs/iris-3b |
| Formato de pesos | safetensors en formato MLX (cuantizacion almacenada en los pesos) |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo original ni sobre su proceso de entrenamiento. Por el pipeline declarado (text-to-image) y por la mención explícita a un text encoder, un transformer y un VAE en la descripción de la cuantización, se trata de un modelo de difusión con los tres componentes habituales: codificador de texto, red de difusión (transformer) y decodificador VAE. No se especifica si el transformer es de tipo UNet o DiT, ni el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino por preferencias.

La innovación técnica de esta versión concreta no está en el modelo en sí, sino en el proceso de conversión: MFlux 0.24.0 convierte los pesos originales a MLX y aplica cuantización affine de 4 bits de forma consistente a los tres componentes (text encoder, transformer y VAE). El nivel de cuantización se guarda en los metadatos de los pesos, lo que simplifica el uso: el usuario no necesita indicar el nivel de cuantización al generar imágenes. El modelo base declarado es speridlabs/iris-3b y la relación es "quantized".

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en resoluciones configurables; el ejemplo oficial usa 1024x1024.
- Control de semilla (seed) para reproducibilidad de la generación.
- Control de dimensiones de salida mediante los parámetros `--width` y `--height`.
- Ejecución local nativa en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Cuantización integrada en los pesos: no requiere flags de cuantización en tiempo de inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es un modelo puramente generativo de imagen.
- Capacidades multilingües: no disponibles; el único ejemplo documentado usa un prompt en inglés.

## Casos de uso

- Prototipado rápido de conceptos visuales en un Mac: un diseñador puede generar variaciones de una idea con `mflux-generate-iris` fijando una seed y ajustando el prompt, sin salir del entorno local ni depender de APIs externas.
- Generación de ilustraciones para documentación técnica o blogs: con 5,1 GB de pesos en Q4, el modelo cabe en un portátil Apple Silicon y permite producir imágenes de acompañamiento bajo demanda.
- Creación de assets para maquetas y wireframes: el control de ancho y alto (por ejemplo 1024x1024) permite generar imágenes de proporciones concretas para integrarlas en prototipos de interfaz.
- Experimentación académica con modelos de difusión cuantizados: investigadores pueden estudiar el impacto de la cuantización affine 4-bit en la calidad de salida comparando esta versión Q4 con las variantes BF16 y Q8 del mismo repositorio comunitario.
- Generación reproducible por lotes: al fijar la seed y el prompt, se pueden producir conjuntos de imágenes deterministas para pruebas automatizadas de pipelines gráficos.
- Uso educativo y demostraciones offline: al ejecutarse en local con MLX, es adecuado para talleres o entornos sin conectividad donde se quiera mostrar generación de imágenes con modelos de 3B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio Q4 ocupa 5,1 GB en disco; en ejecución se necesita memoria unificada adicional para activaciones y buffers, por lo que se recomienda disponer de al menos 8-16 GB de memoria unificada. No se dispone de cifras oficiales de pico de memoria.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) mediante MLX. No es compatible con GPU NVIDIA o AMD a través de este repositorio.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; las variantes BF16 (14 GB) y Q8 (8 GB) requieren más memoria.
- Opciones de despliegue: MFlux (CLI `mflux-generate-iris`), instalable con `uv tool install --upgrade mflux`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-mflux-q4 (este) | 3B | no disponible | MLX safetensors Q4 (5,1 GB) | iris-3b-license | Hugging Face, comunidad |
| iris-3b-mflux-bf16 | 3B | no disponible | MLX safetensors BF16 (14 GB) | iris-3b-license | Hugging Face, comunidad |
| iris-3b-mflux-q8 | 3B | no disponible | MLX safetensors Q8 (8 GB) | iris-3b-license | Hugging Face, comunidad |
| speridlabs/iris-3b (original) | 3B | no disponible | no disponible | iris-3b-license | Hugging Face, oficial |

No se dispone de información sobre modelos comparables de otros autores con los que contrastar rendimiento, contexto o calidad de generación.

## Limitaciones y advertencias

- Conversión no oficial: este repositorio es una conversión comunitaria de MFlux-Community; los autores originales de iris-3b no lo han publicado ni validado. La calidad puede diferir de la versión BF16 oficial.
- Cuantización a 4 bits: la cuantización affine Q4 puede introducir pérdida de fidelidad en detalles finos, texto dentro de la imagen o composiciones complejas en comparación con BF16 o Q8.
- Licencia restrictiva potencial: la licencia iris-3b-license es de tipo "other"; es imprescindible revisar los términos completos en la model card del modelo original antes de cualquier uso comercial.
- Idiomas: no se documenta soporte multilingüe; los prompts en idiomas distintos del inglés podrían degradar la calidad de generación.
- Plataforma: solo funciona en Apple Silicon con MLX; no es desplegable en infraestructura NVIDIA estándar sin reconversión.
- Sesgos y alucinaciones visuales: no se documentan evaluaciones de sesgo; como todo modelo generativo de imágenes, puede producir contenido estereotipado o incoherente con el prompt.
- Sin benchmarks publicados: no hay métricas objetivas (FID, CLIP score, etc.) que permitan evaluar la calidad de esta versión cuantizada.
- Adopción muy baja: 37 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-mflux-q4
- Modelo base original: https://huggingface.co/speridlabs/iris-3b
- Versión BF16 MFlux: https://huggingface.co/mflux-community/iris-3b-mflux-bf16
- Versión Q8 MFlux: https://huggingface.co/mflux-community/iris-3b-mflux-q8
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Licencia del modelo original: https://huggingface.co/speridlabs/iris-3b
