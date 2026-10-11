# BryanPkim/undergrad-retrieval

## Resumen

`BryanPkim/undergrad-retrieval` es un repositorio experimental alojado en HuggingFace que contiene una implementacion propia de una arquitectura CLIP orientada a tareas de recuperacion (retrieval) multimodal. El autor, BryanPkim, lo publica como banco de pruebas para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. No se trata de un modelo entrenado ni evaluado, sino de un punto de partida: el propio README indica explicitamente que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y que no debe presentarse como un checkpoint con benchmarks.

El modelo esta definido a escala "nano", con atencion flash, fusion de bajo rango (low rank), activacion swish y normalizacion InstanceNorm. El recuento real de parametros del fichero safetensors es de 16.576 parametros totales, un orden de magnitud muy inferior al de cualquier CLIP de produccion, lo que confirma su caracter didactico o de depuracion. La receta de experimento por defecto usa el optimizador Lion con un schedule polinomial.

Su relevancia actual es limitada como modelo utilizable, pero puede ser interesante como referencia para quienes quieran estudiar o modificar una implementacion CLIP minima y comparar decisiones de arquitectura antes de escalar. El repositorio incluye el codigo de entrenamiento (`finetune.py`), la configuracion de arquitectura (`config.json`) y los argumentos de experimento (`training_args.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (implementacion personalizada) |
| Parametros totales | 16.576 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Escala | nano |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicializacion, no entrenado) |
| Mecanismo de atencion | flash |
| Fusion multimodal | low rank |
| Funcion de activacion | swish |
| Normalizacion | InstanceNorm |
| Optimizador por defecto | Lion |
| Schedule por defecto | polinomial |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP, con atencion de tipo flash, fusion multimodal de bajo rango, activacion swish y normalizacion InstanceNorm. La eleccion de InstanceNorm en lugar de LayerNorm y de una fusion de bajo rango son decisiones tipicas de un prototipo que busca reducir coste computacional y facilitar la inspeccion de cada componente. El README no detalla el numero de capas, la dimension de los embeddings, el tamano de parche del encoder visual ni la longitud de contexto de texto, por lo que esos datos figuran como no disponibles.

No hay evidencia de un entrenamiento completado. La receta incluida (Lion con schedule polinomial) son valores de arranque del script, no resultados de una ejecucion. El autor recomienda que, para una evaluacion significativa, se entrenen todas las lineas base con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias. Asimismo, sugiere Flickr30k como primera evaluacion, reportando la metrica de la tarea en al menos tres semillas e incluyendo una linea base de capacidad equivalente. No se menciona uso de RLHF, DPO ni ninguna otra etapa de alineacion.

## Capacidades

- Recuperacion multimodal texto-imagen: la arquitectura CLIP esta disenada para alinear representaciones de texto e imagen en un espacio comun, lo que permite busqueda cruzada entre modalidades.
- Extraccion de embeddings: al ser un CLIP, puede emplearse para generar representaciones de imagen y de texto utilizables en indices vectoriales.
- Punto de partida para investigacion: sirve como base modificable para experimentar con atencion flash, fusion de bajo rango o normalizacion InstanceNorm.
- Pruebas de humo: el checkpoint de inicializacion permite validar que el pipeline de carga y ejecucion funciona antes de invertir en entrenamiento.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision de proposito general, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; no se documenta ningun conjunto de idiomas.

## Casos de uso

- Prototipado de pipelines de retrieval multimodal: el repositorio permite montar un flujo de carga de modelo y calculo de embeddings para validar la infraestructura antes de sustituir el checkpoint por uno entrenado.
- Estudio de decisiones de arquitectura: util para comparar, en un entorno controlado, el efecto de InstanceNorm frente a LayerNorm o de una fusion de bajo rango frente a alternativas mas costosas.
- Docencia y aprendizaje: al ser una implementacion minima con un unico artefacto principal (`finetune.py`), resulta adecuada para explicar como se estructura un CLIP desde cero.
- Base para ajuste fino posterior: el autor sugiere Flickr30k como primer conjunto de evaluacion, de modo que el flujo natural es partir de este esqueleto y entrenar sobre datos propios de recuperacion texto-imagen.
- Banco de pruebas de recetas de optimizacion: la configuracion por defecto (Lion con schedule polinomial) puede compararse contra AdamW u otros optimizadores manteniendo el resto de condiciones constantes.
- Indexado vectorial a pequena escala: una vez entrenado, podria alimentar indices de similitud para catalogos de imagenes, siempre que se valide su calidad con datos reales.
- Verificacion de compatibilidad de tooling: sirve para comprobar que las versiones de PyTorch y de las librerias de atencion flash del entorno funcionan correctamente con este grafo.

Nota: ninguno de estos casos es explotable en produccion con el checkpoint actual, ya que no ha sido entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README afirma explicitamente que no se reclama ninguna puntuacion de benchmark y que el checkpoint incluido no ha sido entrenado. Se propone Flickr30k como evaluacion futura, pero sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16.576 parametros, el modelo ocupa del orden de decenas de kilobytes en precision de 32 bits, por lo que cabe en cualquier GPU e incluso en CPU.
- GPU recomendadas: no aplica ninguna GPU de gama alta. El cuello de botella, si existe, sera el codigo de carga y no el modelo.
- GPU de consumo: cabe con enorme holgura en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en memoria unificada de portatiles.
- Opciones de despliegue: el autor advierte que, al ser una implementacion personalizada, las APIs genericas de carga automatica requieren un adaptador explicito. No se documenta soporte para vLLM, Ollama, llama.cpp, TGI ni ONNX Runtime.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BryanPkim/undergrad-retrieval | CLIP personalizado, escala nano | 16.576 (sin entrenar) | no disponible | BSD-3-Clause | HuggingFace, 0 descargas |
| CLIP ViT-B/32 (OpenAI) | CLIP, ViT-B/32 | ~151 millones | 77 tokens de texto | MIT (segun distribucion original) | Ampliamente disponible |
| OpenCLIP ViT-B/32 | CLIP reimplementado | ~151 millones | 77 tokens de texto | Variada segun checkpoint | Ampliamente disponible |
| SigLIP Base | SigLIP (sigmoide en lugar de softmax) | Cientos de millones segun variante | no disponible | Apache 2.0 en variantes abiertas | Ampliamente disponible |

Las cifras de los modelos comparativos corresponden a datos publicos de sus respectivas familias y se incluyen como referencia de escala, no como medicion realizada sobre este repositorio. La diferencia de parametros entre este modelo (miles) y un CLIP de produccion (cientos de millones) refleja que la comparativa no es de rendimiento sino de proposito: aqui se trata de un esqueleto de investigacion, no de un modelo desplegable.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones utiles para retrieval real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun indica el propio autor.
- No se declaran benchmarks, por lo que cualquier afirmacion de calidad carece de respaldo empirico.
- Al ser una implementacion personalizada, las APIs genericas de carga automatica no funcionaran sin escribir un adaptador.
- La licencia BSD-3-Clause cubre el codigo y los pesos, pero el autor advierte de que los terminos de los datos de origen deben revisarse por separado cuando se usen conjuntos externos.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no es un modelo de lenguaje; el riesgo equivalente es producir similitudes sin sentido al no estar entrenado.
- Idiomas soportados y longitud de contexto: no documentados, lo que impide planificar un despliegue multilingue o de contexto largo.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No incluye resultados de evaluacion ni registros de entrenamiento, algo que el propio autor exige para cualquier resultado futuro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BryanPkim/undergrad-retrieval
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan ninguna relacion con este modelo y se han descartado.
