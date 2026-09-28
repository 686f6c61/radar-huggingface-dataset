# QuantFunc/Krea-2-QuantFunc-4bit

## Resumen

Krea-2-QuantFunc-4bit es una cuantizacion a 4 bits (INT4) del modelo de difusion texto-a-imagen Krea-2-Turbo, publicada por QuantFunc. Se distribuye como pesos derivados del modelo base de Krea y su objetivo es reducir el coste de memoria y de ancho de banda de pesos manteniendo la calidad visual del original en 16 bits, con una compresion aproximada de 4x respecto a este ultimo.

El modelo se ofrece en dos variantes de pesos (`r128` y `r32`) y esta pensado para ejecutarse en ComfyUI mediante el plugin ComfyUI-QuantFunc, o con el motor de inferencia propio de QuantFunc. No es un checkpoint sustituible directamente en la libreria `diffusers`: el campo `library_name: diffusers` del repositorio se declara unicamente para que Hugging Face contabilice las descargas de los ficheros `.safetensors`, segun indica el propio autor.

Su relevancia actual es practica: al comprimir los pesos de un modelo turbo de generacion de imagen, permite inferencia en GPU de consumo y en configuraciones con poca VRAM. El autor reporta 2,5 s de extremo a extremo en una RTX 4090 (frente a 6,5 s en FP8) y aceleraciones de hasta ~11x en entornos de 8 GB y 12 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion latente texto-a-imagen, destilado tipo turbo; no se especifica UNet ni transformer/DiT) |
| Parametros totales | no disponible (el autor no publica el recuento; los pesos INT4 ocupan ~8,3 GB en la variante r128) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; no se especifica el limite de tokens del text encoder) |
| Tipos de cuantizacion | INT4, en dos variantes: r128 (~8,3 GB, orientada a calidad) y r32 (~7,8 GB, orientada a tamano/VRAM). El autor la compara con FP8 e INT8 ConvRot |
| Idiomas soportados | no disponible (no se declaran idiomas; el text encoder no se especifica) |
| Licencia | krea-2-community-license (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors, en formato propio de QuantFunc (no cargable como checkpoint drop-in de `diffusers`) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base. Krea-2-Turbo es un modelo de difusion texto-a-imagen destilado de tipo turbo, segun la propia model card, lo que implica que debe utilizarse con pocos pasos de muestreo y con el classifier-free guidance desactivado (guidance 1.0). El repositorio no detalla si la columna vertebral es una UNet convolucional o un transformer de difusion (DiT), ni el numero de parametros, capas o dimensiones de los latentes.

En cuanto al proceso de cuantizacion, QuantFunc aplica una cuantizacion INT4 sobre los pesos de Krea-2-Turbo que reduce el tamano a aproximadamente una cuarta parte del modelo en 16 bits. El autor afirma que en sus comparaciones visuales la composicion, el detalle, el color y el estilo se mantienen cercanos a la linea base de 16 bits, y en un nivel aproximadamente equivalente a FP8 e INT8 ConvRot. No se publican detalles del esquema de cuantizacion (tamano de grupo, rotaciones, calibracion) ni si hubo entrenamiento posterior, destilacion o ajuste fino durante el proceso.

## Capacidades

- Generacion de imagenes a partir de instrucciones de texto (pipeline `text-to-image`).
- Estilos cubiertos en los ejemplos del autor: fotografia de retrato, escena de ciencia ficcion, pintura al impasto e ilustracion en acuarela.
- Integracion con flujos de trabajo de ComfyUI: basta con sustituir el nodo cargador de modelo por el cargador de QuantFunc y seleccionar el fichero de pesos correspondiente; el resto de nodos, conexiones y parametros de generacion se mantienen.
- Compatibilidad con el motor de inferencia propio de QuantFunc, ademas del plugin de ComfyUI.
- Ejecucion en GPU NVIDIA con capacidad de computo SM75 o superior.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision (comprension de imagen), audio ni modos de pensamiento: es exclusivamente un modelo generativo de imagen.
- No se documentan capacidades multilingues ni idiomas concretos soportados.

## Casos de uso

- Prototipado rapido de imagenes en GPU de consumo: con 2,5 s de extremo a extremo en una RTX 4090 (segun el autor), es adecuado para iterar prompts y composiciones en sesiones de diseno, donde cada ciclo de prueba es barato.
- Generacion de ilustracion a escala en servidores de inferencia: en A100, H100, H200 o B100/B200, el menor ancho de banda de pesos por paso permite aumentar el numero de imagenes por unidad de tiempo en comparacion con alternativas de mayor precision.
- Flujos creativos en equipos con VRAM limitada: en GPUs de 8 GB o 12 GB, la version INT4 hace viable la generacion local con offload, donde una version de 16 bits no cabria o requeriria intercambio agresivo de memoria.
- Direccion de arte y exploracion de estilo: los ejemplos publicados (retrato, ciencia ficcion, impasto, acuarela) lo situan como herramienta util para definir un lenguaje visual antes de encargar produccion final con mayor fidelidad.
- Integracion en pipelines automatizados de ComfyUI: al funcionar con el nodo cargador de QuantFunc sin cambiar el resto del grafo, se puede insertar en flujos ya existentes y exponerlos por API para generacion por lotes.
- Concept art y previsualizacion en videojuegos o animacion: sirve para producir bocetos y variaciones de escenarios o personajes en las fases tempranas, donde la velocidad prima sobre el acabado final.
- Generacion de material grafico interno (banners, fondos, ilustraciones de blog) en estaciones de trabajo con GPU de gama media, evitando costes de API externas.
- Entornos de demostracion o educacion: al requerir solo un plugin de ComfyUI y un fichero de pesos, es sencillo montar talleres o demos locales de generacion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen en la informacion disponible. El autor unicamente indica comparaciones visuales subjetivas, sin metricas como FID, CLIP score o evaluaciones humanas cuantificadas.

Los unicos datos de rendimiento publicados son mediciones de tiempo en una RTX 4090, con el mismo flujo de trabajo y los mismos ajustes de generacion:

| Etapa | QuantFunc INT4 | FP8 | Aceleracion |
|---|---:|---:|---:|
| Denoising | 1,6 s | 5,0 s | 3,13x |
| Extremo a extremo | 2,5 s | 6,5 s | 2,6x |

Notas del autor: el tiempo de extremo a extremo incluye text encoder, denoising y VAE, pero el text encoder y el VAE no forman parte hoy de la ruta de aceleracion del plugin QuantFunc. En configuraciones con VRAM limitada (8 GB, 12 GB y similares), el autor indica aceleraciones de hasta aproximadamente 11x, dependiendo de la capacidad y el ancho de banda de la VRAM, del comportamiento de offload y de los ajustes de generacion. No se publican datos de resolucion, numero de pasos, controladores ni versiones de software empleados en la medicion.

## Requisitos de hardware

- Tamano en disco: ~8,3 GB para la variante `r128` (recomendada, orientada a calidad) y ~7,8 GB para la variante `r32` (orientada a tamano y VRAM). El repositorio completo ocupa 8,8 GB.
- VRAM: el autor indica funcionamiento en configuraciones de 8 GB y 12 GB de VRAM, con offload. En 8 GB el modelo cabe con intercambio de memoria, a costa de latencia; 12 GB ofrece un margen mayor.
- GPU compatibles: cualquier NVIDIA con SM75 o superior, es decir, RTX 20/30/40/50, A100, H100, H200, B100, B200 y GB300.
- No se documenta soporte para AMD, Intel, Apple Silicon ni aceleracion por CPU.
- GPU de referencia en las mediciones: RTX 4090, con 1,6 s de denoising y 2,5 s de extremo a extremo.
- Latencia: 1,6 s de denoising y 2,5 s totales en RTX 4090; en 8-12 GB de VRAM el autor reporta hasta ~11x de mejora respecto a la linea base comparable, sin cifras absolutas publicadas.
- Throughput por lote: no disponible (no se publican mediciones de imagenes por segundo en lote).
- Despliegue: ComfyUI con el plugin ComfyUI-QuantFunc (se descarga el fichero de pesos r128 o r32 y se cambia el cargador de modelo) o el motor de inferencia de QuantFunc. No es un checkpoint drop-in de `diffusers`, por lo que vLLM, TGI, Ollama y llama.cpp no aplican a este modelo.
- Ajustes recomendados: al ser un modelo turbo destilado, usar pocos pasos de muestreo y desactivar CFG (guidance 1.0).

## Comparativa con modelos similares

No se dispone de datos publicos de modelos comparables externos (parametros, contexto o calidad medible) en la informacion proporcionada. La comparativa mas fiable es la que ofrece el propio autor frente a otras precisiones del mismo modelo:

| Variante | Precision | Tamano de pesos | Denoising (RTX 4090) | Extremo a extremo (RTX 4090) | Licencia |
|---|---|---:|---:|---:|---|
| Krea-2-Turbo (base) | 16 bits | no disponible | no disponible | no disponible | krea-2-community-license |
| Krea-2-QuantFunc-4bit r128 | INT4 | ~8,3 GB | 1,6 s | 2,5 s | krea-2-community-license |
| Krea-2-QuantFunc-4bit r32 | INT4 | ~7,8 GB | no disponible | no disponible | krea-2-community-license |
| Variante FP8 (referencia del autor) | FP8 | no disponible | 5,0 s | 6,5 s | no disponible |
| Variante INT8 ConvRot (referencia del autor) | INT8 | no disponible | no disponible | no disponible | no disponible |

El autor situa la calidad visual de la variante INT4 en un nivel aproximadamente equivalente a FP8 e INT8 ConvRot, sin aportar metricas objetivas que respalden la comparacion.

## Limitaciones y advertencias

- No hay benchmarks objetivos de calidad: las afirmaciones de "calidad mantenida" se basan en comparaciones visuales del propio autor, no verificadas de forma independiente.
- Sesgos: no disponible. No se publica informacion sobre composicion del dataset de entrenamiento, sesgos demograficos, culturales o de representacion del modelo base.
- Alucinacion: no aplica en el sentido de texto factual, pero si existe riesgo de fallo en la adherencia al prompt, anatomia incorrecta, texto ilegible en la imagen y artefactos propios de la cuantizacion INT4, especialmente en detalles finos.
- Compatibilidad: los pesos no se cargan con el paquete `diffusers` pese a que el repositorio declara `library_name: diffusers`. Requieren ComfyUI-QuantFunc o el motor de QuantFunc.
- Hardware: solo GPU NVIDIA con SM75 o superior. Sin soporte documentado para AMD, Apple Silicon o CPU.
- Licencia: se distribuye bajo la krea-2-community-license, una licencia "other" no estandar. Es imprescindible revisar los terminos del modelo original antes de cualquier uso, en particular el comercial, ya que la model card no detalla las restricciones.
- Idioma: no se declaran idiomas soportados ni el text encoder empleado, por lo que el comportamiento con prompts en castellano no esta documentado.
- Ajuste obligatorio de inferencia: al ser un modelo turbo destilado, usar CFG alto o demasiados pasos degrada el resultado; hay que trabajar con guidance 1.0 y pocos pasos.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Fecha de publicacion: el repositorio figura creado el 2026-09-28 y actualizado el 2026-09-28, fechas que conviene contrastar en la pagina del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantFunc/Krea-2-QuantFunc-4bit
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Base preentrenada: https://huggingface.co/krea/Krea-2-Raw
- Plugin de ComfyUI: https://github.com/QuantFunc/ComfyUI-QuantFunc
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Discord de la comunidad: https://discord.gg/jCp9TpFWcn
- Documentacion de Hugging Face sobre estadisticas de descargas (citada por el autor): https://huggingface.co/docs/hub/models-download-stats
