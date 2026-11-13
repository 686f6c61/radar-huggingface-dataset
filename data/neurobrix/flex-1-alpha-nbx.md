# Neurobrix/Flex.1-alpha-nbx

## Resumen

Flex.1-alpha-nbx es un contenedor `.nbx` que empaqueta el modelo de generación de imágenes texto-a-imagen Flex.1-alpha, desarrollado originalmente por ostris, para ejecutarse dentro del motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, la licencia y el comportamiento son los del modelo original, y NeuroBrix únicamente añade el grafo de computación, la configuración de componentes y los valores por defecto de ejecución necesarios para que el motor lo cargue y lo planifique sobre el hardware disponible.

La relevancia de este artefacto es operativa más que algorítmica. NeuroBrix se presenta como un motor de inferencia universal que decide dónde ejecutar cada parte del modelo (una GPU, varias, con streaming de pesos o en host) a partir de la memoria y las GPUs detectadas, y que ofrece dos rutas de ejecución: una basada en PyTorch y otra basada en Triton que no requiere PyTorch, apoyada en los kernels de nbxtensor certificados por clase de GPU. El contenedor ocupa 26,3 GB e incluye pesos y grafo en un único artefacto con hash SHA-256 verificable.

La ficha se centra, por tanto, en lo que se puede afirmar con la información disponible: el pipeline es text-to-image, la licencia es Apache 2.0 heredada del modelo original, el formato es propietario de NeuroBrix (`.nbx`) y la mayoría de detalles técnicos del modelo subyacente (arquitectura, parámetros, contexto, datos de entrenamiento) no están publicados en la información proporcionada y remiten a la model card de ostris/Flex.1-alpha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente: ostris/Flex.1-alpha; la información proporcionada no detalla la arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no se especifica longitud de prompt) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo original) |
| Formato de pesos | contenedor `.nbx` (26,3 GB); los pesos originales de Flex.1-alpha no se detallan en la información disponible |
| Pipeline | text-to-image |
| Modelo base | ostris/Flex.1-alpha (finetune de ese modelo) |
| Librería / motor | neurobrix |
| Tamaño del contenedor | 26,3 GB |
| SHA-256 | `b8f01c26c73729a395c4c02f0db8e7c03690ecfbe0b94752d988c1de29bc172a` |
| Backends de ejecución | PyTorch o Triton (sin PyTorch, kernels nbxtensor) |
| Hardware soportado | GPUs NVIDIA, GPUs de Mac (Metal) y CPU |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de Flex.1-alpha: no se especifican el tipo de red (difusión, transformer, híbrido), el número de parámetros, la composición del dataset ni si hubo etapas de ajuste fino con preferencias. La model card del contenedor remite explícitamente a la model card original de ostris/Flex.1-alpha para el entrenamiento, el uso previsto y las limitaciones, que se aplican sin cambios. Cualquier afirmación sobre la arquitectura sería una inferencia no respaldada por los datos proporcionados.

Lo que sí está documentado es la capa de empaquetado. El contenedor `.nbx` contiene el grafo de computación del modelo, sus pesos, la descripción de cómo se conectan sus componentes y los valores por defecto de ejecución. Sobre esa representación, el motor NeuroBrix planifica la colocación de cada parte del modelo según las GPUs y la memoria disponibles, incluyendo ejecución en una sola GPU, reparto entre varias, streaming de pesos o ejecución en host. La ruta Triton sustituye a PyTorch por los kernels de nbxtensor, que la documentación del proyecto describe como certificados por clase de GPU. No se han publicado cifras de tokens de entrenamiento, composición del dataset ni técnicas de alineación en la información disponible.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`), con el comando `neurobrix run --model ostris/Flex.1-alpha --prompt "..." --output imagen.png`.
- Ejecución local en hardware propio, sin depender de una API externa, gracias al motor NeuroBrix.
- Planificación automática de colocación del modelo: una GPU, varias GPUs, streaming de pesos o CPU, según los recursos detectados.
- Ejecución sobre GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- Doble ruta de ejecución: motor PyTorch o motor Triton sin PyTorch (kernels nbxtensor).
- Importación reproducible mediante `neurobrix import` con aceptación de licencia y verificación por SHA-256 del contenedor.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento, lo cual es coherente con un modelo de generación de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo recibe un prompt descriptivo y devuelve una imagen, lo que permite iterar conceptos visuales antes de encargar arte final. El contenedor facilita desplegarlo en la misma máquina de desarrollo sin montar un servicio aparte.
- Creación de assets para documentación técnica y blogs: generar diagramas conceptuales, escenas o imágenes de portada a partir de descripciones textuales, ejecutando el modelo en local para mantener el contenido dentro de la infraestructura propia.
- Automatización de contenido editorial: integración del comando de inferencia en un pipeline que, a partir de una lista de prompts, produce un lote de imágenes con nombres de salida controlados, aprovechando la ejecución por línea de comandos.
- Pruebas de concepto de generación de imágenes en estaciones de trabajo heterogéneas: al soportar NVIDIA, Metal y CPU, el mismo contenedor sirve para validar el flujo en un portátil Mac y luego escalar a un servidor con GPU sin cambiar de artefacto.
- Evaluación comparativa de motores de inferencia: al existir ruta PyTorch y ruta Triton con kernels nbxtensor, el contenedor permite medir el mismo modelo bajo dos backends en el hardware objetivo y decidir cuál conviene en producción.
- Despliegue en entornos con recursos limitados o fragmentados: la planificación de NeuroBrix puede repartir el modelo entre varias GPUs o hacer streaming de pesos, lo que permite ejecutar un modelo de 26,3 GB de contenedor en equipos que no disponen de una única GPU con memoria suficiente para todo el modelo.
- Reproducibilidad y auditoría de artefactos: el SHA-256 publicado y la importación con aceptación de licencia permiten fijar una versión exacta del contenedor en un registro interno y verificar su integridad en cada despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de NeuroBrix menciona una página de benchmarks en su catálogo de modelos, pero no se incluyen cifras concretas para Flex.1-alpha-nbx ni para el modelo original en los datos proporcionados. Tampoco se han facilitado estimaciones de latencia o throughput.

## Requisitos de hardware

- Tamaño del contenedor: 26,3 GB, que incluye pesos y grafo de computación; el espacio en disco debe cubrir el contenedor más el materializado en tiempo de ejecución.
- VRAM estimada para inferencia: no disponible. Depende de la cuantización y del modo de colocación que elija el motor; no se han publicado cifras.
- GPUs recomendadas: no disponible. La información solo indica compatibilidad con GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del contenedor (26,3 GB) sugiere que la ejecución completa puede exceder la VRAM de muchas GPUs de consumo, pero el motor admite reparto entre varias GPUs, streaming de pesos y ejecución en host, por lo que la viabilidad depende de la configuración concreta. No se confirma ningún modelo de GPU concreto.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (kernels nbxtensor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de Flex.1-alpha ni de alternativas comparables, por lo que no es posible construir una comparación con cifras verificables. La documentación de NeuroBrix cita otros modelos de generación de imágenes en su catálogo (SANA, PixArt-α, PixArt-Σ, Flex.1, Janus), pero sin especificaciones ni resultados que permitan contrastarlos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Flex.1-alpha-nbx | no disponible | no disponible | Apache 2.0 | `.nbx` | no disponible |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información disponible no documenta sesgos conocidos del modelo; la model card original de ostris/Flex.1-alpha es la referencia aplicable y no se ha incluido su contenido en los datos proporcionados.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido plausible pero incorrecto respecto al prompt; no se han publicado evaluaciones de fidelidad en la información disponible.
- Idiomas soportados: no disponible. No se puede confirmar el rendimiento con prompts en castellano ni en otros idiomas distintos del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo original y conviene revisar la model card de ostris/Flex.1-alpha para condiciones adicionales de uso previsto.
- El contenedor es un artefacto de NeuroBrix: requiere instalar el paquete `neurobrix` y aceptar la licencia en la importación; no es un formato estándar interoperable con otras herramientas de inferencia.
- La ejecución depende de la disponibilidad de kernels nbxtensor certificados para la clase de GPU si se usa la ruta Triton; no se detalla la matriz de certificación en la información disponible.
- El SHA-256 publicado debe verificarse en despliegues de producción para garantizar la integridad del artefacto.
- No se han publicado cifras de latencia, throughput ni VRAM, por lo que la planificación de capacidad debe hacerse mediante pruebas propias en el hardware objetivo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica una adopción aún no contrastada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neurobrix/Flex.1-alpha-nbx
- Modelo original: https://huggingface.co/ostris/Flex.1-alpha
- Descarga del contenedor: https://neurobrix.org/models/ostris/Flex.1-alpha
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación: https://docs.neurobrix.org
- White paper: https://neurobrix.es/whitepaper
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
