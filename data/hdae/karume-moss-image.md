# hdae/karume-moss-image

## Resumen

Karume MOSS-Image es una distribución del modelo de generación de imágenes texto-a-imagen MOSS-Image-SFT, desarrollado originalmente por OpenMOSS, empaquetado en el formato contenedor `.krm` del runtime de inferencia WebGPU Karume. El modelo combina un transformer de difusión de flujo único de aproximadamente 5.000 millones de parámetros con un codificador de texto Qwen3.5-9B y el VAE de FLUX.2 (variante small decoder), y está pensado para ejecutarse íntegramente en el navegador, en Node y en Deno mediante WebGPU.

La relevancia de esta distribución radica en que traslada un pipeline de difusión de gran tamaño a un entorno de ejecución web, con una gestión de memoria por etapas que evita mantener simultáneamente el codificador de texto y el transformer en la GPU. El transformador y el codificador de texto se almacenan en int8 (una escala por canal de salida), mientras que el VAE conserva los valores originales en f32. El repositorio ocupa 13,2 GB y se distribuye bajo licencia Apache 2.0.

No se trata de un lanzamiento oficial de OpenMOSS, del equipo de Qwen ni de Black Forest Labs: es una conversión de terceros (usuario hdae) que no ha sido reentrenada ni afinada, y que no es legible por diffusers al emplear un contenedor propio con grafo embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de flujo único (single-stream DiT) con codificador de texto Qwen3.5-9B y VAE FLUX.2 |
| Parametros totales | Transformer de aproximadamente 5.000 millones; codificador de texto Qwen3.5-9B (solo la torre de texto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la ventana del tokenizador Qwen3.5; no especificada en la información) |
| Tipos de cuantizacion | `f32+dit8` (transformer int8, VAE f32) y `f32+dit8-a8-attn8-online` (por defecto); matrices de pesos del transformer y del codificador de texto en int8 con una escala por canal de salida; VAE en f32 |
| Idiomas soportados | No disponible (el prompt se procesa mediante el tokenizador de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.krm` (secuencia de partes; la primera contiene el grafo y los descriptores del modelo), manifiesto `karume.json` (versión `karume/5`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión texto-a-imagen compuesto por tres etapas que se ejecutan secuencialmente en la GPU: codificador de texto, transformer de difusión y decodificador VAE. Cada etapa se cierra antes de abrir la siguiente, de modo que el codificador de texto y el transformer nunca residen simultáneamente en memoria. El transformer se divide en un grafo "text-refiner" y el grafo de secuencia conjunta, más una copia del mismo grafo sin el bloque 22 (indexado desde cero) que reutiliza sus pesos para la rama negativa del classifier-free guidance. El decodificador VAE se reparte en tres grafos alrededor de su atención central y decodifica sin mosaico (untiled), como el modelo original.

La conversión no incluye reentrenamiento ni ajuste fino. Los cambios respecto a los pesos originales consisten en el almacenamiento en int8 de las matrices del transformer y del codificador de texto, la división en grafos descrita y la eliminación del codificador de texto de todo lo que no sea la torre de texto. El VAE conserva los valores f32 de origen. El ruido inicial lo genera un generador propio de Karume, no el de torch, por lo que una misma semilla no reproduce la imagen del modelo original. La exportación se realizó con `karume/0.15.1`.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`), con resolución configurable en múltiplos de 16 píxeles (por defecto 1024x1024).
- Control de pasos de muestreo (por defecto 50), escala de guidance (por defecto 3,0) y parámetro `shift` (por defecto 5,0).
- Soporte de prompt negativo mediante la rama negativa del classifier-free guidance; con guidance igual a 1 no se ejecuta rama negativa.
- Control de semilla para reproducibilidad dentro del propio runtime Karume.
- Ejecución en navegador, Node y Deno mediante WebGPU.
- API programática en TypeScript: `Pipeline.fromPretrained`, `pipeline.generate` e `imageToRgba` para convertir la salida f32 en RGBA de 8 bits.
- Caché de pesos verificada mediante `size` y `sha256` del manifiesto, y encolado de llamadas concurrentes a `generate`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de imágenes en aplicaciones web sin backend: al ejecutarse en el navegador mediante WebGPU, permite ofrecer generación de imágenes en una aplicación cliente sin enviar los prompts a un servidor, lo que resulta adecuado para herramientas creativas con requisitos de privacidad.
- Prototipado rápido de conceptos visuales: con la API de TypeScript y la caché de pesos, un equipo puede integrar la generación de bocetos en un cuaderno de ideas o en una herramienta interna de diseño sin montar infraestructura de GPU dedicada.
- Maquetas y recursos para documentación técnica: la generación de ilustraciones a 1024x1024 con control de semilla permite producir imágenes reproducibles para manuales, presentaciones o materiales de marketing.
- Herramientas de edición asistida en el navegador: la conversión directa de la salida f32 a RGBA de 8 bits facilita incorporar el resultado a un canvas HTML o a un editor de imágenes web.
- Pruebas de concepto de pipelines de difusión en entornos edge: útil para evaluar el rendimiento de un DiT de 5B con codificador de 9B en hardware de consumo con WebGPU antes de invertir en infraestructura de servidor.
- Automatización de generación de variaciones visuales: el control de semilla y de prompt negativo permite generar variantes controladas de una misma descripción para tareas de selección o curado de imágenes.
- Educación y experimentación: al ser una distribución Apache 2.0 ejecutable en el navegador, sirve para estudiar el comportamiento de un pipeline de difusión completo (text encoder, DiT y VAE) sin necesidad de un entorno CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo requiere una GPU con soporte de WebGPU; no se especifican modelos de GPU concretos en la información disponible.
- El área máxima de imagen aceptada viene determinada por el límite de binding de almacenamiento del dispositivo: aproximadamente 2,8 millones de píxeles con 2 GiB.
- El repositorio ocupa 13,2 GB, aunque la ejecución es por etapas y el codificador de texto y el transformer no residen simultáneamente en memoria.
- No se proporcionan estimaciones de VRAM por cuantización, latencia ni throughput.
- Opciones de despliegue: runtime Karume mediante el paquete `jsr:@karume/models/moss` en navegador, Node o Deno. No es compatible con diffusers, vLLM, llama.cpp, Ollama ni TGI.
- Se recomienda fijar una revisión (commit) concreta del repositorio para compilaciones reproducibles, ya que sin ella se sigue la rama `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Karume MOSS-Image (esta ficha) | Transformer ~5B + text encoder 9B | No disponible | Apache 2.0 | `.krm`, runtime Karume (WebGPU) | Distribución de terceros, int8 en transformer y text encoder |
| OpenMOSS-Team/MOSS-Image-SFT | Transformer ~5B + text encoder 9B | No disponible | Apache 2.0 | Pesos originales (formato no especificado) | Modelo base original; ejecutable con su propio pipeline |
| black-forest-labs/FLUX.2-klein-4B | No disponible | No disponible | Apache 2.0 | Pesos originales | Origen de las estadísticas de normalización del VAE; no es un modelo texto-a-imagen comparable directamente en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de OpenMOSS, del equipo de Qwen ni de Black Forest Labs, y no está respaldado por ellos.
- No es legible por diffusers: utiliza un contenedor propio con grafo embebido y requiere un lector que implemente `moss-image/1`.
- El generador de ruido es propio de Karume, por lo que una misma semilla no reproduce la imagen del modelo original.
- El VAE decodifica sin mosaico, lo que limita el área máxima de imagen según el límite de binding de almacenamiento del dispositivo (unos 2,8 millones de píxeles con 2 GiB).
- La cuantización int8 del transformer y del codificador de texto puede introducir diferencias de calidad respecto a los pesos originales en f32.
- Solo se redistribuye la torre de texto del codificador Qwen3.5 y únicamente la ruta de decodificación del VAE; el codificador del VAE no está incluido.
- No se especifican los idiomas soportados ni el comportamiento multilingüe del pipeline.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación en la información disponible.
- Aunque la licencia es Apache 2.0, las model cards de los modelos de Black Forest Labs apuntan a su propia política de uso; esto se indica a título informativo y no forma parte de los términos de la licencia Apache 2.0.
- Al seguir la rama `main` sin fijar una revisión, una actualización futura del repositorio (renombrado de archivos, nuevo formato de manifiesto) puede romper la aplicación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hdae/karume-moss-image
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Codificador de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE small decoder: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Estadísticas del VAE: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Informe técnico de MOSS-Image: https://arxiv.org/abs/2610.23374
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model card de FLUX.2-small-decoder: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder/blob/a3efc24f613ef42d9428af62fdbd6f5fd8856c4a/README.md
- Model card de FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/blob/e7b7dc27f91deacad38e78976d1f2b499d76a294/README.md
