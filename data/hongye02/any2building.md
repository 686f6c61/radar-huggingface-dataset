# hongye02/Any2Building

## Resumen

Any2Building es un modelo de reconstruccion 3D de edificios publicado por el usuario hongye02 en Hugging Face. A diferencia de un modelo de lenguaje, su proposito es generar geometria de edificios (estructura y superficie) a partir de entradas multimodales, presumiblemente imagenes y nubes de puntos, segun los modulos que componen el repositorio. El repositorio tiene un tamano de 11,6 GB e incluye pesos y codigo de inferencia empaquetados en dos archivos ZIP.

La arquitectura combina un Diffusion Transformer (DiT) con "prompts espaciales", un acondicionador de consultas espaciales compartido, un tokenizador de nubes de puntos, un generador de superficies condicionado por vóxeles y dos decodificadores (uno de estructura y otro de superficie de alta resolucion). Para la entrada de imagen emplea un tokenizador basado en DINOv3 congelado, que no se distribuye con los pesos y debe obtenerse por separado.

La relevancia del modelo reside en su enfoque multi-etapa para reconstruccion de edificios: primero una fase de estructura y despues una fase de generacion de superficie de alta resolucion. No obstante, la informacion publicada es muy limitada (sin model card descriptiva, sin licencia, sin benchmarks y con cero descargas), por lo que esta ficha se limita a lo que el autor documenta en el README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT con prompts espaciales, acondicionador de consultas espaciales, tokenizador de nubes de puntos, generador de superficies condicionado por vóxeles y decodificadores de estructura y superficie |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo generativo 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) y `.safetensors`; pesos empaquetados en `Any2Building_weights.zip` |
| Tamano del repositorio | 11,6 GB |
| Entradas | imagenes (via DINOv3 congelado, no incluido) y nubes de puntos |
| Salidas | estructura y superficie 3D de edificios |

## Arquitectura y entrenamiento

El modelo se organiza en seis modulos con nombres que remiten al paper de referencia: un DiT con prompts espaciales (`weights/spatial_prompt_dit.pt`), un acondicionador de consultas espaciales compartido (`weights/shared_spatial_query_conditioner.pt`), un tokenizador de nubes de puntos (`weights/point_cloud_tokenizer.pt`), un generador de superficies condicionado por vóxeles (`weights/surface_generator/surface_flow.pt`), un decodificador de estructura (`weights/structure_decoder/model.safetensors`) y un decodificador de superficie de alta resolucion (`weights/surface_decoder/model.safetensors`). El uso de un DiT sugiere un proceso de difusion sobre representaciones latentes, mientras que el generador de superficies parece emplear un esquema de flow matching condicionado por vóxeles.

Solo se distribuyen los pesos EMA seleccionados de estructura y del generador de superficies; el autor indica explicitamente que no se incluyen pesos alternativos sin EMA ni estados del optimizador. El tokenizador de imagen se basa en DINOv3 congelado y no viene incluido en el paquete, por lo que es necesario descargar el modelo DINOv3 preentrenado correspondiente. El archivo de pesos incluye configuraciones de los decodificadores, un manifiesto, sumas de comprobacion y el aviso del decodificador upstream. No se proporciona informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Reconstruccion 3D de edificios a partir de imagenes, usando el tokenizador DINOv3 congelado como extractor de caracteristicas visuales.
- Procesamiento de nubes de puntos mediante un tokenizador dedicado.
- Generacion de estructura del edificio mediante un decodificador especifico.
- Generacion de superficie de alta resolucion mediante un decodificador separado y un generador de superficies condicionado por vóxeles.
- Acondicionamiento espacial mediante prompts espaciales y consultas espaciales compartidas, lo que permite guiar la generacion con informacion geometrica.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni multilingues; no es un modelo de lenguaje.
- No se documenta soporte de audio, video ni thinking mode.

## Casos de uso

- Reconstruccion de edificios a partir de fotografias: el modelo recibe imagenes procesadas por DINOv3 y genera la estructura y la superficie del edificio, util para digitalizacion de patrimonio arquitectonico.
- Modelado urbano a partir de nubes de puntos: el tokenizador de nubes de puntos permite convertir escaneos LiDAR o fotogrametricos en mallas de edificios con superficie de alta resolucion.
- Generacion de gemelos digitales: la salida de estructura y superficie puede alimentar plataformas de simulacion urbana o BIM, dado que el modelo separa explicitamente ambas fases.
- Completado de geometria en flujos de escaneo: cuando una nube de puntos esta incompleta, el generador de superficies condicionado por vóxeles puede producir la superficie faltante.
- Prototipado en investigacion de vision 3D: el codigo y los pesos permiten reproducir y extender el pipeline multi-etapa (tokenizacion, DiT, decodificadores) en experimentos academicos.
- Preprocesado para pipelines de analisis geoespacial: la reconstruccion de edificios puede integrarse en herramientas de planificacion urbana o estimacion de volumen construido.
- Fine-tuning o evaluacion de metodos de difusion para geometria: al distribuirse pesos EMA y configuraciones de decodificadores, sirve como base para comparativas de metodos de generacion 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 11,6 GB, pero incluye codigo y pesos de varios modulos, por lo que el consumo real de VRAM depende de la configuracion de inferencia y no se documenta.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible. No se indica si cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: el autor solo documenta la ejecucion mediante el codigo incluido en `Any2Building_code.zip` (PyTorch). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otras tecnicas de reconstruccion 3D de edificios.

## Limitaciones y advertencias

- La model card no incluye descripcion funcional, paper enlazado ni instrucciones detalladas mas alla del proceso de descarga y extraccion.
- La licencia no esta declarada, lo que impide conocer si se permite el uso comercial; debe consultarse con el autor antes de cualquier uso en produccion.
- El tokenizador de imagen DINOv3 no se distribuye con los pesos; sin el, la inferencia con imagenes no es posible.
- Solo se incluyen pesos EMA seleccionados; no hay pesos alternativos ni estados del optimizador, lo que limita la reproducibilidad exacta del entrenamiento.
- El repositorio tiene cero descargas y cero likes, por lo que no hay evidencia publica de validacion por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; al no ser un modelo de lenguaje, estos riesgos no aplican de la misma forma, pero si existe riesgo de geometrias plausibles pero incorrectas.
- No se han publicado benchmarks, por lo que no es posible evaluar la calidad de la reconstruccion frente a alternativas.
- El pipeline y los formatos de entrada exactos (resolucion de imagen, densidad de nube de puntos, etc.) no estan documentados en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hongye02/Any2Building
- No se han encontrado en la informacion proporcionada enlaces a paper, blog, repositorio de codigo independiente ni demos.
