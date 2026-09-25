# RunningHubAI/rh-zimage-turbo-dpoa1-lora

## Resumen

rh-zimage-turbo-dpoa1-lora es un adaptador LoRA de generacion de imagen a partir de texto (text-to-image) desarrollado por RunningHubAI y publicado en Hugging Face. Se trata de un ajuste fino derivado de Z-image-turbo, orientado a mejorar el realismo de la iluminacion y las sombras en las imagenes generadas, de modo que la escena presente capas de luz mas ricas y naturales. El autor del ajuste figura como @H5N1 en la plataforma RunningHub.

El repositorio pesa aproximadamente 0,1 GB y contiene un unico fichero de pesos en formato safetensors de 76 MiB, correspondiente a los pesos del LoRA. El modelo esta etiquetado para uso en ComfyUI, RunningHub y Hugging Face, y su pipeline declarado es text-to-image. No se especifican la arquitectura del modelo base, el numero de parametros, la longitud de contexto del codificador de texto ni los idiomas soportados.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de estilo/fotorealismo pensado para encadenarse sobre un modelo base Z-image-turbo ya existente, no de un modelo autonomo. En el momento de la publicacion no registra descargas ni likes, y la licencia no esta explicitada mas alla de la remision a la licencia del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre el modelo base de difusion Z-image-turbo (arquitectura del base no disponible) |
| Parametros totales | no disponible; fichero de pesos de 76 MiB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no se especifica la longitud del codificador de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no especificada; la model card indica "seguir la licencia del proyecto original o upstream" |
| Formato de pesos | safetensors (`Zimage turbo dpo真实感光影系列A1.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de pesos de bajo rango que se acoplan al modelo base Z-image-turbo sin modificar sus pesos originales. La model card no detalla la arquitectura interna del base (tipo de backbone de difusion, dimension del espacio latente, tipo de codificador de texto ni scheduler), por lo que esa informacion no esta disponible. El tamano del fichero, 76 MiB, es coherente con un adaptador LoRA de rango bajo sobre un modelo de difusion de escala media o grande, aunque no permite inferir el numero de parametros del base.

En cuanto al entrenamiento, la informacion disponible solo menciona que se trata de un ajuste fino sobre Z-image-turbo orientado a realismo de iluminacion, y el propio nombre del modelo incluye la referencia "dpo" (probablemente optimizacion por preferencias directas), si bien no se documentan ni el dataset, ni el numero de pasos, ni la tecnica de optimizacion empleada. No hay datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de descripciones textuales, mediante el modelo base Z-image-turbo.
- Mejora especifica de la iluminacion y las sombras: el objetivo declarado del adaptador es producir capas de luz y sombra mas ricas y naturales.
- Integracion en flujos de ComfyUI como nodo LoRA sobre el modelo base.
- Invocacion a traves de la plataforma RunningHub y de su API.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada (entrada multimodal), audio ni modo "thinking".
- No se documentan capacidades multilingues ni el idioma de los prompts admitidos.
- No se documenta una palabra de activacion (trigger word) ni pesos recomendados del LoRA.

## Casos de uso

- Ilustracion editorial y portadas: aplicar el LoRA sobre Z-image-turbo para generar escenas con iluminacion cinematografica coherente (luz de ventana, contraluz, luz de estudio), reduciendo el aspecto plano habitual en imagenes generadas.
- Previsualizacion de iluminacion en produccion audiovisual: generar planos de referencia con esquemas de luz concretos antes de rodar, usando el adaptador para forzar un tratamiento de sombras consistente entre tomas.
- Diseno de producto y bodegon: crear renders de catalogo con luz de estudio realista, donde el control de reflejos y sombras es critico para la presentacion comercial.
- Arquitectura e interiorismo: producir visualizaciones de espacios con calidad fotografica, aprovechando la mejora de luz natural y luz artificial mezcladas.
- Creacion de contenido para redes sociales: generar imagenes con aspecto de fotografia real a partir de un prompt, encadenando el LoRA en un flujo de ComfyUI automatizado.
- Prototipado dentro de plataformas gestionadas: desplegar el adaptador a traves de la API de RunningHub cuando el equipo no quiere mantener infraestructura de GPU propia, aprovechando que el modelo se publica para ese entorno.
- Pruebas comparativas de estilos: usar el adaptador como variante de control frente a otros LoRA del mismo autor (series H1, H2) para evaluar su efecto sobre la iluminacion en un mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas objetivas (FID, CLIP score, preferencia humana) ni comparaciones cuantitativas con el modelo base sin el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base Z-image-turbo. El adaptador en si anade un coste marginal de VRAM (fichero de 76 MiB), despreciable frente al modelo base.
- GPU recomendadas: no disponible. Dependera por completo de los requisitos de Z-image-turbo.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: ComfyUI (flujo declarado por el autor), plataforma y API de RunningHub, y Hugging Face como repositorio de pesos. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no son herramientas orientadas a modelos de difusion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-dpoa1-lora | LoRA text-to-image | Z-image-turbo | Realismo de iluminacion y sombras | No especificada | Hugging Face / RunningHub |
| rh-kook-zimage-turbo-lora | LoRA text-to-image | Z-image-turbo | Estilo/ajuste no detallado en la informacion disponible | No especificada | Hugging Face |
| Zimage turbo dpo真实感光影系列H1 | LoRA text-to-image | Z-image-turbo | Variante de realismo de iluminacion (serie H1) | No especificada | RunningHub |
| Zimage turbo realistic lighting h2 | LoRA text-to-image | Z-image-turbo | Variante de realismo de iluminacion (serie H2) | No especificada | RunningHub |

No se dispone de parametros, contexto ni rendimiento de estos modelos alternativos, por lo que la comparacion se limita a la categoria, el modelo base y la via de publicacion.

## Limitaciones y advertencias

- Modelo no autonomo: requiere cargar previamente el modelo base Z-image-turbo; sin el, el fichero safetensors no es utilizable.
- Licencia no explicitada: la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido. Conviene verificarlo antes de cualquier despliegue en produccion.
- Ausencia total de documentacion tecnica: no hay datos sobre dataset de entrenamiento, hiperparametros, palabras de activacion ni pesos recomendados de aplicacion, lo que dificulta reproducir resultados.
- Riesgo de alucinacion visual y artefactos: como cualquier modelo de difusion, puede generar anatomias incorrectas, texto ilegible o incoherencias fisicas en la iluminacion; el adaptador no corrige estos problemas, solo modifica el tratamiento de la luz.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o de representacion en las imagenes generadas.
- Idiomas: se desconoce que idiomas admiten los prompts y si el adaptador se entreno con descripciones en ingles, chino o ambos.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin comunidad que valide su comportamiento ni reportes de fallos.
- Sin garantias de mantenimiento: el repositorio fue creado y actualizado el mismo dia, sin historial posterior de cambios.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-dpoa1-lora
- Pagina original del modelo en RunningHub: https://www.runninghub.cn/model/public/2060954972359057410
- Pagina equivalente en RunningHub International: https://www.runninghub.ai/model/public/2060954972359057410
- Perfil del autor en RunningHub: https://www.runninghub.cn/user-center/1902159358849884162
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Variante H1 (realismo de iluminacion): https://www.runninghub.ai/model/public/2060704902086746114
- Variante H2 (realistic lighting): https://www.runninghub.ai/model/public/2064978900370935809
- LoRA relacionado z-image-turbo-flow-dpo: https://www.runninghub.ai/model/public/2027626681703337985
- LoRA hermano en Hugging Face: https://huggingface.co/RunningHubAI/rh-kook-zimage-turbo-lora
