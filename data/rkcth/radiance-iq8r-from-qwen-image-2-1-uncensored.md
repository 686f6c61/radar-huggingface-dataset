# rkcth/Radiance-IQ8R-from-Qwen-Image-2.1-Uncensored

## Resumen

Radiance-IQ8R-from-Qwen-Image-2.1-Uncensored es un modelo de edición de imágenes publicado por el usuario rkcth en Hugging Face, derivado mediante un fine-tuning del modelo base Qwen/Qwen-Image-2.1. Se distribuye como un checkpoint cuantizado en formato IQ8R, pensado para tareas de image-to-image, y su nombre indica explícitamente una intención de eliminar o relajar los filtros de contenido del modelo original. El repositorio ocupa 17,3 GB y está sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de la descarga.

La información pública disponible es muy escasa: el autor no ha publicado una model card con detalles de arquitectura, datos de entrenamiento ni resultados de evaluación, y el modelo no registra descargas ni likes en el momento de la consulta. La licencia declarada es qwen-research, heredada del modelo base, lo que condiciona fuertemente su uso comercial.

Por tanto, esta ficha describe lo que puede verificarse a partir de los metadatos del repositorio y del linaje del modelo base, e indica explícitamente "no disponible" en todos aquellos parámetros que el autor no ha hecho públicos. Cualquier evaluación de rendimiento o de capacidades concretas requeriría probar el checkpoint directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen-Image-2.1; el autor no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ8R (checkpoint ya cuantizado en 8 bits, según el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | no disponible (repo de 17,3 GB; el autor no especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Al ser un fine-tuning de Qwen/Qwen-Image-2.1, hereda la arquitectura del modelo base de Qwen para generación y edición de imágenes, pero el autor no documenta ni la topología de la red, ni el número de parámetros, ni el esquema de atención o de difusión empleado.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de datos utilizados, la composición del dataset de fine-tuning, si se emplearon técnicas de alineación como RLHF o DPO, ni qué metodología se siguió para el "uncensoring" que anuncia el nombre del modelo. El sufijo IQ8R indica que los pesos se distribuyen en una cuantización de 8 bits, lo que reduce el espacio en disco y los requisitos de memoria frente al modelo base en precisión completa, pero no se detalla el algoritmo exacto de cuantización ni la pérdida de calidad asociada.

## Capacidades

- Edición de imágenes image-to-image: el pipeline declarado en Hugging Face es image-to-image, por lo que el modelo está orientado a transformar una imagen de entrada según una instrucción.
- Generación y edición de imágenes sin filtros de contenido aparentes: el nombre del repositorio indica una variante "uncensored" respecto al modelo base.
- Herencia de las capacidades del modelo base Qwen/Qwen-Image-2.1: al ser un fine-tuning, se espera que conserve las funciones del original, aunque el autor no las documenta.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Edición fotográfica asistida por instrucciones: el modelo recibe una imagen y una indicación textual y devuelve una versión modificada, lo que permite flujos de retoque semiautomáticos en estudios pequeños que no quieran depender de APIs comerciales.
- Prototipado de variaciones de diseño: un diseñador puede partir de un boceto o render y generar alternativas de estilo o composición de forma iterativa, aprovechando el pipeline image-to-image.
- Investigación sobre alineación y filtros de contenido: al tratarse de una variante "uncensored", resulta útil para estudiar qué comportamientos se eliminan o se relajan respecto al modelo base y cómo afecta eso a la calidad de las salidas.
- Creación de material visual para proyectos con requisitos de contenido no estándar: en entornos controlados donde el filtrado del modelo original supone un obstáculo, esta variante puede emplearse para generar o editar imágenes que el base rechazaría.
- Pruebas de robustez y evaluación de cuantización: al distribuirse en IQ8R, sirve para medir la degradación de calidad frente al modelo base en precisión completa en tareas de edición de imagen.
- Integración en pipelines locales de edición por lotes: el checkpoint cuantizado de 17,3 GB puede desplegarse en infraestructura propia para procesar lotes de imágenes sin enviar datos a servicios externos, algo relevante por privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 17,3 GB en cuantización IQ8R, por lo que se necesita al menos ese orden de magnitud de memoria, más el overhead del runtime de difusión o del pipeline de edición.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se sitúa en el rango de GPUs de datacenter (A100, H100) o de consumo de gama alta con 24 GB o más (RTX 4090), aunque el autor no lo confirma.
- ¿Cabe en GPU de consumo? No disponible de forma verificada; es plausible en tarjetas con 24 GB o más, pero requiere prueba empírica.
- Opciones de despliegue: no disponible; al ser un pipeline image-to-image de Hugging Face, lo esperable es su uso con la librería `diffusers` o `transformers`, pero el autor no documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radiance-IQ8R-from-Qwen-Image-2.1-Uncensored | no disponible | no disponible | no disponible | qwen-research (acceso restringido) | Hugging Face, gated |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | qwen-research | Hugging Face |
| Otras variantes "uncensored" de modelos de imagen | no disponible | no disponible | no disponible | variable | variable |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con arquitectura, datos de entrenamiento, evaluación ni instrucciones de uso, lo que impide validar su comportamiento antes de desplegarlo.
- Riesgo elevado de alucinación visual y de artefactos: al ser un fine-tuning no documentado sobre un checkpoint cuantizado, no puede descartarse degradación de calidad respecto al modelo base.
- Contenido sin filtrar: la etiqueta "uncensored" implica que el modelo puede generar o editar imágenes con contenido que el modelo original rechazaría; esto conlleva riesgos legales y éticos según la jurisdicción y el uso.
- Licencia qwen-research: restringe el uso, especialmente el comercial; es imprescindible revisar los términos completos antes de cualquier despliegue en producción.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que añade una dependencia de la plataforma para la descarga.
- Idiomas no especificados: se desconoce si las instrucciones de edición funcionan correctamente en castellano u otros idiomas distintos del inglés.
- Sin métricas de rendimiento ni casos de uso validados por terceros: no hay descargas ni likes que permitan inferir adopción o calidad.
- Repositorio de un solo autor sin historial verificable: la trazabilidad del fine-tuning y de los datos empleados no está garantizada.

## Enlaces

- [Hugging Face: rkcth/Radiance-IQ8R-from-Qwen-Image-2.1-Uncensored](https://huggingface.co/rkcth/Radiance-IQ8R-from-Qwen-Image-2.1-Uncensored)
- [Modelo base: Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
