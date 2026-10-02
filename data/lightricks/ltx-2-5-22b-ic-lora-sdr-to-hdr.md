# Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR

## Resumen

LTX-2.5-22b-IC-LoRA-SDR-To-HDR es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) desarrollado por Lightricks para su modelo fundacional de video LTX-2.5. Su funcion concreta es la conversion video-a-video de material en SDR (Standard Dynamic Range) a HDR (High Dynamic Range), manteniendo el contenido de la escena original e incrementando el rango dinamico. No es un modelo autonomo: se distribuye como pesos de adaptador que se cargan junto con la base Lightricks/LTX-2.5, un modelo de 22 000 millones de parametros.

El adaptador se publica bajo la licencia ltx-2.x-community-license y con acceso restringido (gated) en HuggingFace, lo que obliga a aceptar condiciones antes de la descarga. El repositorio ocupa 1,3 GB y esta etiquetado con el pipeline video-to-video, la libreria ltx y el idioma ingles. Las instrucciones oficiales indican que la inferencia se ejecuta sobre la variante destilada de la base, invocando el modulo ltx_pipelines.ic_lora con la ruta del transformer destilado.

Su relevancia actual es doble. Por un lado, cubre una tarea de postproduccion muy demandada (remasterizacion SDR a HDR) sin necesidad de reentrenar un modelo completo, aprovechando la arquitectura de contexto del modelo base. Por otro, ejemplifica el patron de especializacion mediante IC-LoRA que Lightricks esta aplicando a la familia LTX-2.5, con adaptadores hermanos como LTX-2.5-22b-IC-LoRA-Ingredients.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador IC-LoRA (in-context LoRA) sobre el modelo base LTX-2.5; arquitectura interna del adaptador no disponible |
| Parametros totales | no disponible para el adaptador (el modelo base Lightricks/LTX-2.5 tiene 22 000 millones de parametros; el repo del adaptador ocupa 1,3 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license (acceso restringido, gated) |
| Formato de pesos | no disponible en la informacion proporcionada (repo de 1,3 GB; la inferencia se lanza con `--transformer-path` apuntando al transformer destilado de LTX-2.5) |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre la arquitectura interna del adaptador ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada. Lo que si se conoce es su naturaleza: se trata de un IC-LoRA, es decir, un adaptador de bajo rango que opera sobre el modelo base LTX-2.5 y que aprovecha el mecanismo in-context del modelo para condicionar la generacion con el video de entrada. En lugar de aprender la tarea desde cero, el adaptador traslada al modelo base la transformacion de rango dinamico sobre el contenido existente, preservando la escena.

El modelo base es un world model de 22 000 millones de parametros presentado por Lightricks el 11 de agosto de 2026, capaz de generar video y audio sincronizados a partir de texto, imagenes o clips existentes, con soporte nativo de 4K HDR y consistencia de personaje, iluminacion y voz entre planos. El adaptador se ejecuta sobre la variante destilada de esa base, segun las instrucciones oficiales de uso (`uv run python -m ltx_pipelines.ic_lora --transformer-path path/to/distilled-transformer`). La etiqueta del repositorio referencia el paper arXiv:2604.11788, cuyo contenido no se ha podido consultar en la informacion disponible.

## Capacidades

- Conversion video-to-video de SDR a HDR: recibe un video en rango dinamico estandar y devuelve el mismo contenido con procesado HDR.
- Preservacion del contenido de la escena mediante condicionamiento in-context, propio de la familia IC-LoRA.
- Integracion con el pipeline de inferencia de la libreria ltx (`ltx_pipelines.ic_lora`).
- Ejecucion sobre la variante destilada de LTX-2.5, lo que reduce el coste de inferencia respecto a la base completa.
- Soporte de instrucciones en ingles (unico idioma declarado en la ficha del modelo).
- Capacidades heredadas del modelo base LTX-2.5: generacion de video y audio sincronizados, soporte nativo de 4K HDR y consistencia multi-plano (aplicables en la medida en que el adaptador las utilice; no se detalla su alcance exacto).
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje; es un adaptador de generacion de video).

## Casos de uso

- Remasterizacion de catalogos para plataformas de streaming: convertir bibliotecas de contenido SDR a HDR sin reetiquetar manualmente cada plano, manteniendo intacto el contenido original gracias al condicionamiento in-context del adaptador.
- Postproduccion cinematografica y televisiva: generar versiones HDR de material rodado o masterizado en SDR para entregas HDR10 o Dolby Vision, como paso previo al etalonaje final.
- Restauracion de archivo audiovisual: aplicar HDR a metraje historico o de baja calidad tonal, preservando la integridad de la imagen original al no regenerar la escena.
- Publicacion de contenido HDR en plataformas de video: crear variantes HDR de videos corporativos, musicales o divulgativos rodados en SDR para su distribucion en YouTube u otros servicios compatibles.
- Generacion de proxies HDR en flujos de color grading: producir versiones de trabajo con mayor rango dinamico antes de decidir el look final, reduciendo el tiempo de iteracion en sala de color.
- Contenido de producto y comercio electronico: mejorar el rango dinamico de videos de producto para que reflejen mejor brillos especulares, reflejos y sombras, sin volver a rodar.
- Investigacion en vision por computador: crear pares SDR/HDR emparejados a partir de un mismo clip para entrenar o evaluar modelos de tone mapping, reconstruccion de rango dinamico o estimacion de iluminacion.
- Previsualizacion en pipelines de VFX: generar una version HDR aproximada de planos SDR para validar decisiones creativas antes de un proceso de conversion mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento recogido en las fuentes es relativo al modelo base LTX-2.5, que genera un video de 10 segundos en 720p en 6,8 segundos sobre el hardware propio de Lightricks. No se dispone de cifras equivalentes para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 1,3 GB en disco, pero la inferencia requiere cargar el modelo base LTX-2.5 (22 000 millones de parametros) o su transformer destilado, que es el componente dominante en VRAM.
- VRAM estimada (calculo a partir de los 22 000 millones de parametros del modelo base, no confirmado por el fabricante para este adaptador): en precision bf16/fp16 en torno a 44 GB o mas; en cuantizacion de 8 bits en torno a 22-25 GB; en cuantizacion de 4 bits en torno a 12-14 GB, sin contar memoria para el VAE de video, el codificador de texto y los frames en proceso.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecucion completa sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada como opciones intermedias con cuantizacion o descarga parcial a CPU.
- GPU de consumo: puede ser viable en RTX 4090 (24 GB) o RTX 5090 mediante cuantizacion y offloading, pero no hay confirmacion oficial para este adaptador; tratalo como estimacion y no como garantia.
- Opciones de despliegue: el pipeline oficial de la libreria ltx (`python -m ltx_pipelines.ic_lora`) con la ruta al transformer destilado. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (son motores orientados a modelos de lenguaje, no a generacion de video).
- Latencia y throughput: no disponibles para el adaptador. Solo se conoce la cifra del modelo base (10 s de video 720p en 6,8 s en hardware propio de Lightricks).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-SDR-To-HDR | IC-LoRA sobre LTX-2.5 | no disponible (base de 22 000 millones) | Video-to-video SDR a HDR | ltx-2.x-community-license | Gated en HuggingFace |
| LTX-2.5-22b-IC-LoRA-Ingredients | IC-LoRA sobre LTX-2.5 | no disponible (base de 22 000 millones) | Edicion y composicion por ingredientes visuales | no disponible | HuggingFace |
| Lightricks/LTX-2.5 (base) | World model de video y audio | 22 000 millones | Generacion y edicion de video con audio sincronizado | no disponible en la informacion proporcionada | HuggingFace |
| Herramientas de conversion SDR a HDR en postproduccion (por ejemplo, modulos de tone mapping en suites de color) | Algoritmos deterministas, no generativos | no aplica | Conversion SDR a HDR | Propietaria | Comercial |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de la descarga, lo que puede bloquear automatizaciones en CI/CD.
- Licencia ltx-2.x-community-license: los terminos exactos de uso comercial no se detallan en la informacion proporcionada. Es obligatorio revisar el texto completo de la licencia antes de integrarlo en un producto.
- Dependencia estricta del modelo base: el adaptador no funciona de forma autonoma y requiere Lightricks/LTX-2.5 y su transformer destilado.
- Idioma: solo ingles declarado, lo que puede limitar el uso de prompts en castellano.
- Riesgo de artefactos generativos: al ser un modelo generativo de video, puede introducir parpadeos temporales, deriva de color entre fotogramas, halos en bordes de alto contraste o alteraciones de detalle. No hay garantia de fidelidad bit a bit respecto al material original.
- Sesgos: no disponibles de forma especifica. Al heredar el comportamiento del modelo base, pueden aparecer sesgos de color, iluminacion o reproduccion de tonos de piel procedentes de los datos de entrenamiento de LTX-2.5.
- Ausencia de benchmarks publicados para el adaptador, lo que impide cuantificar su calidad frente a alternativas.
- Coste de computo elevado: la inferencia depende de un modelo de 22 000 millones de parametros, con requisitos de VRAM propios de GPU de datacenter salvo que se aplique cuantizacion y offloading.
- Validacion profesional recomendada: en flujos de cine y television, la salida de un adaptador generativo no sustituye una verificacion de calidad (QC) en un monitor HDR calibrado.
- Fecha de creacion del repositorio: 28 de septiembre de 2026, con ultima actualizacion el 30 de septiembre de 2026; 170 descargas y 11 "me gusta" en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-SDR-To-HDR
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Adaptador relacionado LTX-2.5-22b-IC-LoRA-Ingredients: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
- Pagina oficial del modelo LTX-2.5: https://ltx.io/model/ltx-2-5
- Analisis de LTX-2.5 en Intelligent Living: https://www.intelligentliving.co/ltx-2-5-open-world-model/
- Listado de archivos y analisis del adaptador en Local Model Watch: https://localmodelwatch.tsuchitsuchi.com/en/2026/10/01/ltx-25-sdr-to-hdr-ic-lora/
- Paper referenciado en las etiquetas del repositorio (arXiv:2604.11788): https://arxiv.org/abs/2604.11788
