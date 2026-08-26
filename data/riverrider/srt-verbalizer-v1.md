# RiverRider/srt-verbalizer-v1

## Resumen

SRT Verbalizer v1 es un modelo de investigación desarrollado por RiverRider en el marco del proyecto SRT (Semiotic Representation Theory), que explora la interpretabilidad de modelos de visión y lenguaje (VLM). El modelo resuelve un problema concreto: traducir las representaciones internas (vectores de activación) de un gran modelo vision-language a descripciones textuales en inglés. La hipótesis del proyecto es que estas representaciones internas, aunque no son palabras, son legibles mediante instrumentos pequeños y auditables.

Técnicamente, el modelo combina un backbone congelado Qwen3-0.6B con una red de prefijo de aproximadamente 44 millones de parámetros que actúa como traductor. El modelo no tiene ruta visual: nunca recibe la imagen, solo el vector de activación extraído de la capa 52 de Qwen3.8-27B o la capa 47 de gemma-4-31B. Los resultados de recuperación son notables: con 5.000 imágenes reservadas, el modelo alcanza un rango mediano de 20 sobre una galería de 123.287 imágenes, frente a 39 para una descripción humana de referencia. La relevancia actual radica en que ofrece una vía novedosa para auditar y comprender qué información codifican los VLM, con potenciales aplicaciones en indexación, depuración y transparencia de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Prefix network + backbone congelado Qwen3-0.6B |
| Parametros totales | ~644M (0.6B backbone + ~44M prefix network) |
| Parametros activos | ~44M (solo la prefix network; el backbone permanece congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un diseño hibrido de lectura cruzada: un backbone Qwen3-0.6B completamente congelado actua como decodificador de lenguaje, mientras que una red de prefijo de ~44M de parametros transforma vectores de activacion de modelos vision-language externos en embeddings que el backbone puede procesar. El modelo no recibe la imagen en ningun momento; solo el vector de representacion interna extraido de una capa especifica del VLM fuente. Los checkpoints incluidos en el repositorio leen de dos fuentes: la capa 52 de Qwen3.8-27B (dimension 5120) y la capa 47 de gemma-4-31B (dimension 5376), ademas de una version para vectores de galeria proyectados de 1024 dimensiones.

El entrenamiento se realizo sobre imagenes val2017 de COCO, con las descripciones como objetivo. La funcion de perdida principal fue cross-entropy sobre las descripciones, aunque para el checkpoint de galeria de 1024 dimensiones se utilizo un objetivo de recuperacion. Los controles experimentales son rigurosos: al alimentar el modelo con el vector de otra imagen, las descripciones resultan desplazadas de forma coherente con el desplazamiento del vector, y al usar el vector medio de todas las imagenes, el modelo produce siempre la misma frase. Ambos controles caen al nivel de azar en las metricas de recuperacion, lo que confirma que el modelo lee informacion genuina del vector y no simplemente reproduce priors de COCO.

## Capacidades

- Generacion de descripciones de imagenes a partir de vectores de activacion internos de VLM, sin acceso directo a la imagen.
- Recuperacion de imagenes por texto: las descripciones generadas permiten localizar la imagen correcta en una galeria de 123.287 imagenes con rango mediano 20.
- Generalizacion cruzada entre modelos: el checkpoint entrenado sobre gemma-4-31B se evalua con una galeria construida por un tower Qwen3.8-27B no relacionado, y el rendimiento se mantiene dentro de cinco rangos del par emparejado.
- Inventario de escenas: el modelo enumera objetos y elementos presentes en la escena, con una AUC de deteccion de 0.883 sobre las 80 categorias de COCO.
- Lectura continuada: dado mas tokens, el modelo continua enumerando elementos correctos de la escena, lo que indica que la verbosidad proviene de una lectura genuina y no de relleno.
- Capacidad de despliegue ligero: el checkpoint de 1024 dimensiones permite describir cualquier imagen de la galeria sin descargas adicionales, apto para entornos de navegador.

## Casos de uso

- Indexacion y busqueda de imagenes a gran escala: el modelo puede generar descripciones textuales de imagenes a partir de sus representaciones internas, lo que permite construir indices de busqueda por texto sin necesidad de un modelo de captioning completo. Con el checkpoint de 1024 dimensiones, la indexacion puede ejecutarse directamente en el navegador del cliente, reduciendo la carga del servidor.
- Auditoria de modelos vision-language: al verbalizar las representaciones internas de un VLM, los desarrolladores pueden inspeccionar que informacion esta codificando el modelo en capas especificas, lo que facilita la depuracion de sesgos o errores sistematicos.
- Deteccion de alucinaciones visuales: si el modelo verbaliza informacion que no esta presente en la escena real, esto indica que el VLM fuente esta alucinando. El verbalizer actua como un instrumento de verificacion independiente.
- Generacion de descripciones alternativas para accesibilidad: el modelo puede producir descripciones de imagenes para personas con discapacidad visual, complementando los sistemas existentes de captioning con una perspectiva basada en la representacion interna del modelo.
- Investigacion en interpretabilidad: el modelo sirve como herramienta para estudiar la correspondencia entre representaciones internas y lenguaje natural, permitiendo a los investigadores formular y probar hipotesis sobre la semantica de los vectores de activacion.
- Comparacion de arquitecturas de VLM: al verbalizar las activaciones de diferentes modelos (Qwen3.8-27B vs. gemma-4-31B) con el mismo verbalizer, se pueden comparar cualitativamente las representaciones internas de distintos modelos y estudiar si codifican informacion similar.

## Benchmarks y rendimiento

Los resultados se miden sobre 5.000 imagenes val2017 reservadas, con una galeria de 123.287 imagenes. El azar se situa en un rango mediano de ~61.644.

| Arm | R@1 | Rango mediano |
|---|---|---|
| Qwen3.8-27B capa 52, vector de la propia imagen | 0.123 | 20 |
| Qwen3.8-27B capa 52, descripcion humana de referencia | 0.101 | 39 |
| Qwen3.8-27B capa 52, vector de otra imagen | 0.000 | 63.541 |
| Qwen3.8-27B capa 52, vector medio | 0.000 | 59.911 |
| gemma-4-31B capa 47, vector de la propia imagen | 0.120 | 25 |
| gemma-4-31B capa 47, descripcion humana de referencia | 0.101 | 39 |
| gemma-4-31B capa 47, vector de otra imagen | 0.000 | 62.970 |
| gemma-4-31B capa 47, vector medio | 0.000 | 59.408 |
| Galeria 1024, vector de la galeria | 0.123 (estimado) | 18 |

Nota: el checkpoint `browser_gallery_1024.pt` no es comparable con los demas porque el vector de entrada es tambien el objetivo de recuperacion. El checkpoint `gemma4_31b_L47_eos.pt` documenta un resultado negativo con rango mediano 46.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Qwen3-0.6B en precision completa ocupa aproximadamente 2.4 GB. Con cuantizacion a 8 bits, se reduce a ~1.2 GB; a 4 bits, ~0.6 GB. La prefix network anade ~176 MB en FP32. El modelo cabe en GPUs de consumo con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB.
- El checkpoint de 1024 dimensiones con la prefix network de 35.7M de parametros requiere aun menos recursos y puede ejecutarse en CPU o en el navegador via WebAssembly.
- Opciones de despliegue: al ser un modelo PyTorch estandar, puede servirse con vLLM, TGI o un servidor FastAPI personalizado. Para el checkpoint de 1024 dimensiones, es viable ONNX Runtime Web o Transformers.js para despliegue en navegador.
- Latencia estimada: en una GPU moderna (RTX 3090), la generacion de una descripcion de 20-30 tokens deberia completarse en 100-300 ms. En CPU, 1-3 segundos.

## Comparativa con modelos similares

No existe una categoria establecida de "verbalizadores de activaciones" en el ecosistema de modelos publicos, por lo que la comparacion directa no es posible. Como referencia, se comparan las alternativas mas cercanas en funcionalidad:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SRT Verbalizer v1 | 0.6B + 44M prefix | no disponible | Apache-2.0 | HuggingFace |
| BLIP-2 (captioning clasico) | 1.2B (FlanT5-XL) | 512 tokens | BSD-3 | HuggingFace |
| LLaVA 1.5 (VLM generico) | 7B | 2048 tokens | Apache-2.0 | HuggingFace |

La diferencia fundamental es que BLIP-2 y LLaVA procesan la imagen directamente, mientras que SRT Verbalizer solo recibe el vector de activacion. Esto lo hace menos flexible para captioning general, pero mucho mas util para auditoria e interpretabilidad.

## Limitaciones y advertencias

- El modelo no produce mejores descripciones que un humano: supera a la referencia humana en recuperacion por dos razones medibles (registro de inventario completo y longitud), no por calidad descriptiva superior.
- La metrica de evaluacion es la recuperacion a traves de un unico instrumento (el readout head). Una metrica de similitud de descripciones como CIDEr probablemente favoreceria a las referencias humanas.
- La referencia de evaluacion es una unica descripcion humana por imagen, no la mejor de las cinco disponibles en COCO.
- El checkpoint `browser_gallery_1024.pt` tiene un rango mediano de 18 que no es comparable con los demas checkpoints, ya que el vector de entrada es tambien el objetivo de recuperacion.
- El entrenamiento con token de fin de secuencia (EOS) degrada el rendimiento de recuperacion, un resultado negativo documentado que limita el uso del modelo en generacion de secuencias largas con terminacion natural.
- El modelo solo soporta ingles y fue entrenado exclusivamente sobre COCO, por lo que su vocabulario y conocimiento de escenas esta limitado a ese dominio.
- No hay informacion disponible sobre la longitud de contexto soportada, cuantizaciones probadas o datos de entrenamiento mas alla de la mencion de COCO val2017.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RiverRider/srt-verbalizer-v1
- Repositorio del proyecto SRT en GitHub: https://github.com/space-bacon/SRT
- Paper (borrador): https://raw.githubusercontent.com/space-bacon/SRT/refs/heads/main/arxiv/paper.md
- Repositorio relacionado (SRT-NLA-AV): https://huggingface.co/RiverRider/srt-nla-av-v1
- Repositorio relacionado (SRT-NLA-AV-Gemma2): https://huggingface.co/RiverRider/srt-nla-av-gemma2-2b-v1
