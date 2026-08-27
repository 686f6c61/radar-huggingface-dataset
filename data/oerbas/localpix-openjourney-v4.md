# oerbas/localpix-openjourney-v4

## Resumen

El modelo `oerbas/localpix-openjourney-v4` es una conversión a Core ML del modelo original `prompthero/openjourney-v4`, un fine-tune de Stable Diffusion 1.5 entrenado sobre más de 124 000 imágenes generadas con Midjourney v4. Esta versión está diseñada para ejecutarse en dispositivos Apple (iPhone, iPad) mediante la aplicación LocalPix, aprovechando el Neural Engine (ANE) para una inferencia eficiente sin conexión a servidores. Su relevancia radica en ofrecer generación de imágenes de alta calidad con estética similar a Midjourney en un entorno móvil, manteniendo la licencia abierta CreativeML OpenRAIL-M. La conversión incluye atención SPLIT_EINSUM y paletización de pesos de 6 bits, lo que reduce el tamaño del modelo a 0,9 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (fine-tune) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantizacion | 6-bit palettized (Core ML) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML (mlmodel) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 1.5, un modelo de difusión latente con un U-Net como generador y un codificador de texto (CLIP) para condicionar la generación. El fine-tune original de `prompthero/openjourney-v4` se realizó sobre 124 000 imágenes adicionales generadas con Midjourney v4, lo que ajusta el modelo para producir imágenes con un estilo artístico similar al de esa herramienta propietaria. La conversión a Core ML, realizada con `apple/ml-stable-diffusion`, aplica atención SPLIT_EINSUM para optimizar el cálculo en el Neural Engine y paletización de pesos de 6 bits para reducir el tamaño y el consumo de memoria. El VAE encoder también se incluye en la conversión, lo que permite la codificación de imágenes dentro del flujo. No se dispone de información adicional sobre el proceso de entrenamiento, como el número total de pasos o el uso de técnicas de alineación (RLHF, DPO).

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con un estilo visual que emula a Midjourney v4.
- Producción de ilustraciones artísticas, conceptos, retratos y escenas con estética digital característica.
- Ejecución local en dispositivos Apple, sin necesidad de conexión a internet ni servidores externos.
- Inferencia optimizada para el Neural Engine mediante Core ML, con cuantización de 6 bits para reducir el uso de memoria.
- Soporte de codificación de imágenes (VAE encoder) para tareas de reconstrucción o edición dentro del pipeline.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural más allá del prompt de texto.

## Casos de uso

- Creación de ilustraciones para blogs y redes sociales: el modelo genera imágenes con estética Midjourney directamente en el dispositivo, ideal para creadores de contenido que necesitan prototipos rápidos sin depender de servicios en la nube.
- Diseño de conceptos para videojuegos: los artistas pueden esbozar personajes, entornos y objetos con un estilo coherente, usando prompts descriptivos y refinando iterativamente.
- Generación de portadas para libros o música: la capacidad de producir imágenes artísticas de alta calidad permite a autores y músicos crear carátulas personalizadas sin herramientas profesionales.
- Prototipado visual para campañas publicitarias: los equipos de marketing pueden generar múltiples variaciones de una idea visual en minutos, acelerando la fase de exploración creativa.
- Aplicaciones educativas de arte digital: estudiantes y aficionados pueden experimentar con la generación de imágenes y aprender sobre composición y estilos visuales.
- Asistente de inspiración para diseñadores gráficos: el modelo sirve como fuente de ideas para moodboards, combinando prompts de texto con resultados visuales que luego se refinan en herramientas profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score o comparaciones cuantitativas con otros modelos de difusión.

## Requisitos de hardware

- Dispositivos Apple con chip A12 o posterior (iPhone XS y modelos más recientes, iPad Pro 2018 y posteriores) que soporten Core ML y Neural Engine.
- Memoria RAM: no se especifica, pero el tamaño del modelo es de 0,9 GB, por lo que se recomienda al menos 2 GB de RAM libre para una ejecución fluida.
- Almacenamiento: aproximadamente 0,9 GB para el archivo del modelo.
- Opciones de despliegue: integración en aplicaciones iOS mediante Core ML; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que son entornos para modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos concretos; la inferencia depende del dispositivo, pero la paletización de 6 bits y la optimización ANE permiten tiempos de generación de unos pocos segundos en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Uso principal |
|---|---|---|---|---|
| `oerbas/localpix-openjourney-v4` | SD 1.5 fine-tune | Core ML (6-bit) | CreativeML OpenRAIL-M | iOS on-device |
| `prompthero/openjourney-v4` | SD 1.5 fine-tune | PyTorch / safetensors | CreativeML OpenRAIL-M | Escritorio / servidor |
| `stabilityai/stable-diffusion-1-5` | SD 1.5 base | PyTorch / safetensors | CreativeML OpenRAIL-M | Uso general |

La versión Core ML es funcionalmente equivalente al modelo original, pero optimizada para dispositivos Apple. La diferencia principal es el formato y la cuantización, que reducen el tamaño y mejoran la eficiencia en hardware móvil. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo hereda los sesgos presentes en las imágenes de entrenamiento de Midjourney v4, que pueden reflejar estereotipos culturales o de género.
- Puede generar imágenes con artefactos o inconsistencias en detalles finos, especialmente con prompts complejos o poco específicos.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones sobre usos ilegales o dañinos, y exige la redistribución bajo la misma licencia.
- Al ser una conversión Core ML, el modelo solo funciona en el ecosistema Apple; no es portable a otros entornos sin reconvertir.
- No se garantiza la compatibilidad con todas las versiones de iOS; se recomienda verificar los requisitos de Core ML en el dispositivo objetivo.
- La cuantización de 6 bits puede degradar ligeramente la calidad de la imagen en comparación con el modelo original en precisión completa, aunque no se han publicado evaluaciones objetivas.

## Enlaces

- [HuggingFace: oerbas/localpix-openjourney-v4](https://huggingface.co/oerbas/localpix-openjourney-v4)
- [HuggingFace: prompthero/openjourney-v4](https://huggingface.co/prompthero-diffusion-models/openjourney-v4)
- [Open Journey (sitio web)](https://www.openjourney.art/)
- [Open Laboratory: OpenJourney v4](https://openlaboratory.com/models/openjourney-v4/)
- [HuggingFace: prompthero/openjourney (versión anterior)](https://huggingface.co/prompthero/openjourney)
