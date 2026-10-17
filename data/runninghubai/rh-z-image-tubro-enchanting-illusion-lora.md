# RunningHubAI/rh-z-image-tubro-enchanting-illusion-lora

## Resumen

rh-z-image-tubro-enchanting-illusion-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en nombre del creador identificado como @waibibabu. Se trata de un módulo de mejora de estilo orientado a la generación de ilustración de estilo anime sobre el modelo base Z-image-turbo, según indica la propia model card ("二次元增强模块", módulo de mejora 2D). Su objetivo declarado es resolver el conflicto entre la renderización de iluminación compleja y la deformación de la anatomía, manteniendo un estilo pictórico limpio con luz volumétrica de calidad cinematográfica.

El repositorio contiene un único archivo de pesos, `Z_image_tubro_Enchanting Illusion_S.safetensors`, de 332 MiB, lo que sitúa el adaptador en el rango habitual de un LoRA de difusión y no en el de un modelo completo. La ficha de HuggingFace no incluye información sobre arquitectura del modelo base, número de parámetros, licencia formal, idiomas ni resultados de evaluación; la práctica totalidad de los datos técnicos procede de la model card del autor.

La relevancia de esta publicación es acotada: se enmarca en el catálogo de estilos que RunningHub distribuye para su plataforma de entrenamiento e inferencia (ComfyUI, API propia), con una palabra de activación concreta ("Enchanting Illusion") y unos parámetros de muestreo recomendados. No aporta pesos base, paper ni evaluación reproducible, por lo que debe evaluarse como un recurso de estilo para un pipeline existente, no como un modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion text-to-image Z-image-turbo; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el adaptador pesa 332 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (text-to-image); longitud maxima de prompt del modelo base no disponible |
| Tipos de cuantizacion | no disponible; se distribuye unicamente en safetensors. El autor no documenta variantes fp16/bf16/fp8 ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible en HuggingFace. La model card indica que los derechos pertenecen al autor y que se prohibe el uso comercial con animo de lucro |
| Formato de pesos | safetensors (`Z_image_tubro_Enchanting Illusion_S.safetensors`, 332 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni la del modelo base Z-image-turbo. Por el tipo de archivo, el tamano (332 MiB) y las etiquetas del repositorio (`comfyui`, `lora`, `text-to-image`), se trata de un adaptador de bajo rango pensado para inyectarse en un modelo de difusion ya entrenado, no de un modelo generativo completo. No se especifican rango, dimension de las matrices, capas objetivo ni si el entrenamiento afecta solo al bloque de atencion cruzada o tambien a otras partes de la red.

Tampoco se publican datos sobre el conjunto de entrenamiento: no hay cifra de imagenes, composicion del dataset, resolucion, ni si se emplearon tecnicas de regularizacion o captions automaticos. La model card unicamente aporta recomendaciones de inferencia: muestreador Euler con 10 pasos como configuracion optima (8 pasos como alternativa valida), peso del LoRA entre 0,8 y 1,0, y uso de la frase de activacion "Enchanting Illusion" eliminando otras palabras de estilo del prompt. El ejemplo de prompt incluido sugiere que el entrenamiento se oriento a retratos de personajes anime con iluminacion de hora dorada, contraluz y fondos con bokeh.

## Capacidades

- Generacion de ilustracion text-to-image en estilo anime/2D sobre el modelo base Z-image-turbo, con enfasis declarado en iluminacion volumetrica y estabilidad de la forma del personaje.
- Modulacion de estilo mediante la palabra de activacion "Enchanting Illusion"; el autor recomienda retirar otras palabras de estilo para evitar interferencias de caracteristicas.
- Control de intensidad del efecto mediante el peso del adaptador (rango sugerido 0,8-1,0).
- Compatibilidad con flujos de ComfyUI y con la plataforma RunningHub, incluyendo su API.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking": es exclusivamente un adaptador de generacion de imagen.
- Capacidades multilingues: no disponibles. Todos los ejemplos de prompt de la model card estan en ingles.

## Casos de uso

- Ilustracion de personajes anime con luz cinematografica: el adaptador se aplica sobre Z-image-turbo con peso 0,8-1,0 y el prompt "Enchanting Illusion" para obtener retratos con contraluz, halos dorados y sombras largas, un escenario que el autor documenta explicitamente con su prompt de prueba.
- Produccion de key art para proyectos de animacion o novela ligera: permite fijar un estilo coherente entre ilustraciones de portada, banners y fichas de personaje reutilizando la misma palabra de activacion y los mismos ajustes de muestreo.
- Generacion de assets para videojuegos independientes: variaciones de personajes y escenarios en un estilo 2D consistente, integradas en un grafo de ComfyUI que produzca lotes con parametros fijos (Euler, 10 pasos).
- Prototipado rapido de direccion de arte: comparar el estilo "Enchanting Illusion" con otros LoRA del catalogo sobre el mismo prompt base para elegir la linea visual antes de encargar arte final.
- Storyboards y bocetos de escenas: al requerir solo 8-10 pasos de muestreo, el coste por imagen es bajo, lo que facilita iterar sobre encuadres y esquemas de iluminacion.
- Automatizacion via API: despliegue del flujo en la API de RunningHub para generar imagenes bajo demanda desde una aplicacion externa, sin gestionar infraestructura de GPU propia.
- Pruebas de sensibilidad estilistica: uso del rango de peso 0,8-1,0 para medir cuanto cambia la identidad del personaje frente a la fuerza del efecto, util en estudios que calibran adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros estilos. Tampoco se documentan latencia ni throughput, mas alla de la recomendacion de 8-10 pasos de muestreo con el sampler Euler.

## Requisitos de hardware

- VRAM para el adaptador: los pesos ocupan 332 MiB, una fraccion minima del total necesario; el requisito real lo determina el modelo base Z-image-turbo, cuyas especificaciones no estan disponibles.
- VRAM para inferencia: no disponible con caracter oficial. Como referencia de orden de magnitud para adaptadores de difusion de este tamano, la generacion en precision media suele requerir entre 6 y 12 GB en GPU de consumo, pero esta cifra es una estimacion general y no un dato verificado para Z-image-turbo.
- GPU recomendadas: no disponible. No hay indicacion del autor sobre GPUs objetivo ni sobre soporte de aceleracion en tensor cores de arquitecturas concretas.
- Cabe en GPU de consumo: probablemente si, dado el tamano del adaptador, pero la viabilidad depende del modelo base y de la resolucion de salida, ambos no documentados.
- Opciones de despliegue: ComfyUI (plataforma declarada), plataforma y API de RunningHub. No se menciona compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un adaptador de difusion.
- Latencia y throughput: no disponibles. El unico parametro de rendimiento indicado es el numero de pasos de muestreo (Euler, 10 pasos optimo; 8 pasos como alternativa).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-image-tubro-enchanting-illusion-lora | LoRA de estilo sobre Z-image-turbo | 332 MiB | no disponible | no disponible; sin uso comercial segun el autor | HuggingFace + RunningHub |
| rh-z-image-lora (RunningHubAI) | LoRA text-to-image sobre el mismo modelo base | 371 MB | no disponible | no disponible | HuggingFace + RunningHub |
| Enchanting Illusion M Enhance (runninghub.ai) | Variante del mismo estilo, distribuida en la plataforma | no disponible | no disponible | no disponible | Solo en runninghub.ai |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que la comparacion se limita a formato, tamano y canal de distribucion. Cualquier comparacion cualitativa de calidad de estilo requeriria una evaluacion propia con el mismo prompt semilla.

## Limitaciones y advertencias

- Ausencia total de informacion tecnica verificable: no hay datos de arquitectura del modelo base, parametros, dataset de entrenamiento ni evaluaciones. La ficha de HuggingFace registra 0 descargas y 0 "likes", sin senales de validacion por parte de la comunidad.
- Licencia ambigua: no se especifica una licencia formal en HuggingFace y la model card indica "prohibido el uso comercial con fines de lucro" junto con una clausula de atribucion al autor. Esto impide un uso comercial claro y exige contactar con el autor antes de integrarlo en un producto.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; hereda las limitaciones, la licencia y los sesgos de Z-image-turbo, cuyos terminos no se detallan.
- Riesgo de alucinacion visual y artefactos: como cualquier LoRA de difusion, puede producir deformaciones de anatomia (manos, extremidades, simetria facial), texto ilegible en la imagen y coherencia deficiente en escenas con varias figuras, especialmente fuera del rango de peso recomendado.
- Especializacion estrecha: el estilo esta entrenado para ilustracion 2D y retratos con iluminacion calida; su uso en fotografia realista, escenas tecnicas o generacion de diagramas probablemente degrade la calidad.
- Idioma: no hay evidencia de soporte de prompts en castellano; los ejemplos documentados estan en ingles y el modelo base podria estar optimizado para ese idioma.
- Advertencia de contenido: el prompt de prueba de la model card describe a una menor de 15 anos en banador. Aunque se trata de un ejemplo de ilustracion, cualquier uso del adaptador debe respetar la legislacion aplicable y las politicas de contenido de la plataforma; la generacion de material sexualizado de menores esta prohibida y puede tener consecuencias legales.
- Trazabilidad: la distribucion se realiza a traves de RunningHub, que publica "en nombre del autor"; no hay repositorio de codigo, paper ni pipeline reproducible que permita auditar el entrenamiento.
- Fecha de publicacion: HuggingFace registra la creacion del repositorio el 2026-10-17 y la ultima actualizacion un minuto despues, sin cambios posteriores documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-z-image-tubro-enchanting-illusion-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2081308894659436545
- Pagina del autor: https://www.runninghub.cn/user-center/2042260789787889665
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Variante del mismo estilo en RunningHub: https://www.runninghub.ai/model/public/2074016651741327361
- LoRA relacionado rh-z-image-lora: https://huggingface.co/RunningHubAI/rh-z-image-lora/tree/main
- Registro en free2aitools: https://free2aitools.com/model/runninghubai/rh-z-image-tubro-enchanting-illusion-lora
