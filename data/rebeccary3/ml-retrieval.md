# rebeccary3/ml-retrieval

## Resumen

`rebeccary3/ml-retrieval` es un prototipo de investigación publicado en HuggingFace bajo el nombre "Hybrid for Retrieval". Se trata de una implementación propia y personalizada de una arquitectura híbrida orientada a tareas de retrieval, con atención de ventana deslizante (sliding window) y fusión mediante cross attention. El repositorio tiene un único autor (`rebeccary3`), no acumula descargas ni likes, y fue creado y actualizado el 15 de septiembre de 2026.

La escala declarada por el autor es "nano" y el recuento real de parámetros en el fichero `model.safetensors` es de 24.832 parámetros totales. Se trata, por tanto, de un modelo de juguete: su tamaño es entre cuatro y seis órdenes de magnitud inferior al de cualquier modelo de retrieval multimodal de uso común. El propio autor advierte explícitamente que el checkpoint incluido es una inicialización válida para pruebas de humo y no un checkpoint entrenado, y que no se reclama ninguna métrica de benchmark.

La relevancia de esta ficha es acotada: no es un modelo para desplegar en producción, sino un andamiaje reproducible para estudiar variantes arquitectónicas de retrieval híbrido (atención deslizante más fusión cross-attention), comparar recetas de entrenamiento y validar infraestructura antes de escalar a modelos de mayor capacidad. Cualquier evaluación seria exige entrenarlo primero con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (hibrida), con atencion de ventana deslizante y fusion por cross attention |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye `model.safetensors`; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `training_args.json` asociados |

Otros detalles declarados en la model card: activación swish, normalización RMSNorm, escala "nano". Optimizador AdamW con schedule de warmup lineal.

## Arquitectura y entrenamiento

La arquitectura es una implementación híbrida propia. Los únicos componentes confirmados por el autor son: atención con ventana deslizante, mecanismo de fusión basado en cross attention, función de activación swish y normalización RMSNorm. No se especifica el número de capas, la dimensión oculta, el número de cabezas de atención, el tamaño de la ventana deslizante ni la composición de las dos ramas que se fusionan. El tag `retrieval` y la sugerencia de evaluar sobre Flickr30k apuntan a un escenario de recuperación multimodal imagen-texto, pero la model card no confirma la modalidad de entrada ni la existencia de un codificador visual.

En cuanto al entrenamiento, el repositorio incluye un `training_args.json` con la receta por defecto (AdamW con warmup lineal) y un `train.py` que contiene tanto la definición del modelo como un ejemplo ejecutable o punto de entrada de entrenamiento. El autor subraya de forma explícita que esos valores son puntos de partida del script y no evidencia de una ejecución completada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se describe ninguna innovación técnica adicional más allá del esquema de fusión.

## Capacidades

- El modelo no ha sido entrenado; el checkpoint incluido es una inicialización, por lo que no cabe atribuirle capacidades funcionales verificadas de generación, razonamiento, código o matemáticas.
- La model card no declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni se listan idiomas soportados.
- No se declaran capacidades de visión, audio ni modo de pensamiento, pese a que el tag `retrieval` y la sugerencia de evaluar en Flickr30k apuntan a un posible uso en recuperación multimodal.
- La capacidad realmente observable hoy es instrumental: servir de esqueleto ejecutable para definir y entrenar una arquitectura híbrida de retrieval con implementación propia.

## Casos de uso

- Reproducción de experimentos de retrieval híbrido: el repositorio incluye `train.py`, `config.json` y `training_args.json`, de modo que un grupo de investigación puede partir de una configuración concreta (ventana deslizante, cross attention, swish, RMSNorm) y entrenarla sobre su propio corpus para medir el efecto de cada componente.
- Estudio de mecanismos de fusión por cross attention: al ser una implementación propia y de tamaño nano, permite iterar sobre variantes de fusión en minutos y con un solo acelerador, comparando arquitecturas antes de trasladar las conclusiones a modelos de mayor escala.
- Baseline de capacidad emparejada en comparativas controladas: tal como recomienda el propio autor, sirve como baseline de baja capacidad frente a otros diseños evaluados con la misma exposición de datos, el mismo presupuesto de ajuste y las mismas semillas aleatorias.
- Pruebas de humo de pipelines de entrenamiento: al ser un checkpoint de inicialización válido, permite verificar que el bucle de entrenamiento, el guardado en safetensors, la carga de configuración y el registro de métricas funcionan antes de lanzar experimentos costosos.
- Validación de infraestructura y tooling: útil para comprobar integraciones personalizadas de carga de pesos, ya que el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito al tratarse de una implementación no estándar.
- Material docente: un ejemplo didáctico de arquitectura híbrida completa (definición, configuración, receta de entrenamiento y checkpoint) en un tamaño que cabe en cualquier portátil.
- Evaluación sobre Flickr30k: la model card propone explícitamente Flickr30k como primer conjunto de evaluación, con la métrica de la tarea reportada sobre al menos tres semillas y acompañada de los logs de entrenamiento y las versiones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor declara de forma textual que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint no ha sido presentado como un checkpoint entrenado. La única indicación metodológica es la recomendación de evaluar sobre Flickr30k con al menos tres semillas y un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, 24.832 parámetros ocupan aproximadamente 99 KB; en fp16, unos 50 KB; en int8, unos 25 KB. Estas cifras se derivan del recuento de parámetros y no de mediciones publicadas por el autor.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en una GTX 1050, una RTX 3060, una RTX 4090, una A100 o una H100, sin que ninguna de ellas aporte ventaja relevante por capacidad de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de las dos últimas décadas, e incluso en CPU, Raspberry Pi o entornos móviles.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama no son aplicables directamente. El autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. El punto de entrada previsto es `python train.py --help` y el bloque `__main__` del script.
- Latencia y throughput estimados: no disponibles.
- Nota operativa: el cuello de botella real no es el hardware sino la ausencia de entrenamiento; un checkpoint de inicialización no produce salidas utilizables con independencia de la GPU empleada.

## Comparativa con modelos similares

No hay comparativa directa posible con modelos de retrieval en producción, porque la diferencia de escala y de estado (entrenado frente a inicializado) invalida cualquier comparación cuantitativa. A modo de referencia orientativa, con cifras públicas aproximadas:

| Modelo | Parametros (aprox.) | Estado | Licencia | Uso previsto |
|---|---|---|---|---|
| rebeccary3/ml-retrieval | 24.832 | Inicializacion, sin entrenar | BSD-3-Clause | Prototipo de investigacion |
| CLIP ViT-B/32 | ~150 M | Entrenado | MIT | Recuperacion imagen-texto en produccion |
| BLIP-base | ~220 M | Entrenado | BSD-3-Clause | Recuperacion y captioning imagen-texto |

Las cifras de CLIP y BLIP son valores publicos aproximados y se incluyen solo para dar orden de magnitud; no proceden de la informacion proporcionada sobre este repositorio y no deben usarse para extraer conclusiones de rendimiento relativo. En terminos de contexto, licencia y disponibilidad de pesos en formatos alternativos, el modelo objeto de esta ficha se sitúa en una categoria distinta: no compite con alternativas entrenadas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. El propio autor indica que `model.safetensors` es una inicializacion valida para pruebas de humo y no un checkpoint con rendimiento verificado.
- No se ha auditado el modelo en robustez, equidad ni transferencia de dominio.
- Riesgo de alucinacion: no evaluable en el estado actual, ya que no hay un modelo entrenado sobre el que medirlo. Cualquier salida que se obtenga del checkpoint de inicializacion carece de valor semantico.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la informacion disponible.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright. No obstante, el autor advierte que deben revisarse por separado los terminos de los datos de origen cuando el repositorio se utilice con conjuntos de datos externos.
- Compatibilidad: al ser una implementacion personalizada, no se integra con las APIs de carga automatica habituales (por ejemplo, `AutoModel` de Transformers) sin escribir un adaptador explicito.
- Sin adopcion: cero descargas y cero likes, lo que implica ausencia de validacion por parte de terceros.
- Fechas de creacion y actualizacion muy proximas entre si (15 de septiembre de 2026, con unos cinco segundos de diferencia), coherente con una subida unica sin mantenimiento posterior.
- Resultados futuros: si en el futuro se publica un checkpoint entrenado, sus resultados deben documentarse de forma separada de los valores por defecto aqui descritos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rebeccary3/ml-retrieval
- Ficheros incluidos en el repositorio: `train.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` (consultables en la pestana "Files" de la pagina de HuggingFace)
- No se han encontrado en la busqueda web articulos, papers, repositorios de codigo adicionales ni demos asociados a este modelo. Los resultados devueltos por la busqueda (repositorios de prompts tipo DAN, GitHub Copilot, GitHub Desktop, foro Zhihu, pagina principal de Zhihu) no guardan relacion con el modelo y se descartan como fuentes.
