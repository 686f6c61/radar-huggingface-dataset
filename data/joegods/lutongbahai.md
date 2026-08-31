# joegods/lutongbahai

## Resumen

LutongBahAI es un proyecto de aplicación web de código abierto desarrollado por Joelguay (joegods) que combina visión por computadora y un modelo de lenguaje externo para generar recetas de cocina filipina. El repositorio en HuggingFace (joegods/lutongbahai) no contiene un modelo de IA entrenado, sino el código fuente de una aplicación que utiliza YOLO para la detección de ingredientes a partir de imágenes y la API de OpenAI GPT para generar recetas auténticas filipinas.

El proyecto aborda el problema de la inspiración culinaria a partir de ingredientes disponibles en casa: el usuario fotografía sus ingredientes, el sistema los identifica mediante YOLO y luego GPT genera una receta filipina basada en esos ingredientes. Es relevante porque demuestra un caso de uso práctico de integración de modelos de visión y lenguaje en una aplicación web completa, con licencia MIT que permite su uso y modificación libre.

El repositorio en HuggingFace tiene un tamaño de 0,1 GB, fue creado en agosto de 2026 y no presenta descargas ni likes. No se proporcionan especificaciones técnicas del modelo, ya que no se trata de un modelo de lenguaje o visión autocontenido, sino de una aplicación que depende de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicación web que integra YOLO y OpenAI GPT) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la interfaz y las recetas están orientadas al inglés y al filipino) |
| Licencia | MIT |
| Formato de pesos | No disponible (no se distribuyen pesos de modelo) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de modelo ni proceso de entrenamiento, porque LutongBahAI no es un modelo entrenado. Se trata de una aplicación web que combina dos componentes externos: un detector de objetos YOLO (probablemente una versión preentrenada) para identificar ingredientes en imágenes, y la API de OpenAI GPT para generar recetas. El repositorio contiene el código de la aplicación, no los pesos de ningún modelo.

No hay datos sobre el dataset de entrenamiento, técnicas de ajuste (fine-tuning), RLHF o cualquier innovación técnica en el modelo subyacente. La innovación del proyecto reside en la integración de ambas tecnologías en un flujo de trabajo útil para la cocina.

## Capacidades

- Detección de ingredientes en imágenes mediante visión por computadora (YOLO).
- Generación de recetas filipinas auténticas a partir de los ingredientes detectados.
- Interfaz web completa para la interacción del usuario.
- Integración con la API de OpenAI GPT para la generación de texto.
- Capacidad de procesar imágenes de ingredientes y devolver recetas estructuradas.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe más allá de lo que ofrezca la API de GPT subyacente.

## Casos de uso

- Generación de recetas a partir de ingredientes disponibles: el usuario fotografía los ingredientes que tiene en casa y la aplicación identifica los productos y sugiere una receta filipina que los utilice.
- Reducción del desperdicio alimentario: al permitir aprovechar ingredientes que ya se tienen, la aplicación ayuda a planificar comidas sin necesidad de comprar más.
- Exploración de la cocina filipina: usuarios interesados en la gastronomía de Filipinas pueden descubrir recetas auténticas basadas en ingredientes comunes.
- Asistente culinario para personas con poca experiencia: la aplicación guía al usuario desde la detección de ingredientes hasta la receta completa, facilitando la cocina casera.
- Demostración educativa de integración de IA: el proyecto sirve como ejemplo de cómo combinar visión por computadora y modelos de lenguaje en una aplicación web real, útil para desarrolladores que aprenden a integrar estas tecnologías.
- Prototipo para aplicaciones de planificación de comidas: la arquitectura puede adaptarse a otros dominios culinarios o a necesidades dietéticas específicas, como recetas veganas o sin gluten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no presenta métricas de precisión en la detección de ingredientes ni de calidad de las recetas generadas. Al depender de YOLO y GPT, el rendimiento real dependerá de los modelos subyacentes y de la calidad de las imágenes proporcionadas.

## Requisitos de hardware

- No se especifican requisitos de hardware para el modelo, ya que no se distribuyen pesos.
- La aplicación requiere acceso a la API de OpenAI GPT, por lo que necesita conexión a internet y una clave de API válida.
- La parte de visión (YOLO) puede ejecutarse en CPU o GPU, pero no se indican requisitos mínimos en el repositorio.
- Para desarrollo local, se recomienda una máquina con al menos 8 GB de RAM y, si se usa GPU, una tarjeta con al menos 4 GB de VRAM para YOLO.
- Opciones de despliegue: la aplicación web puede ejecutarse en un servidor Node.js o Python (según el stack del proyecto), o en plataformas como Heroku, Render o Vercel.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables, ya que LutongBahAI no es un modelo de IA sino una aplicación. Si se compara con otras aplicaciones de generación de recetas basadas en IA, se pueden mencionar:

| Aplicación | Enfoque | Modelo subyacente | Licencia |
|---|---|---|---|
| LutongBahAI | Detección de ingredientes + recetas filipinas | YOLO + OpenAI GPT | MIT |
| ChefGPT | Generación de recetas a partir de texto | GPT-3.5/4 | Propietaria |
| Plant Jammer | Recetas veganas basadas en ingredientes | Algoritmos propios | Propietaria |

La comparación es limitada porque LutongBahAI es un proyecto de código abierto con una funcionalidad muy específica, mientras que las alternativas comerciales ofrecen servicios más amplios.

## Limitaciones y advertencias

- Dependencia de servicios externos: la generación de recetas requiere una clave de API de OpenAI, lo que implica costes y dependencia de la disponibilidad del servicio.
- Sin modelo propio: no se puede ejecutar de forma autónoma sin conexión a internet ni sin los servicios de terceros.
- Sesgos de los modelos subyacentes: YOLO y GPT pueden tener sesgos en la detección de ciertos ingredientes o en la generación de recetas, especialmente si los datos de entrenamiento no incluyen variedad de cocina filipina.
- Riesgo de alucinación en las recetas: GPT puede generar recetas con ingredientes o pasos incorrectos, por lo que no se recomienda seguir las recetas sin verificación.
- Sin información sobre idiomas: la interfaz y las recetas están orientadas al inglés y al filipino, sin soporte explícito para otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el funcionamiento ni la seguridad de la aplicación.
- Repositorio sin mantenimiento aparente: no se observan actualizaciones recientes ni comunidad activa, lo que puede implicar problemas de seguridad o compatibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/joegods/lutongbahai
- Repositorio en GitHub: https://github.com/Joelguay/lutongBahAI
- Perfil de GitHub del autor: https://github.com/Joelguay/
