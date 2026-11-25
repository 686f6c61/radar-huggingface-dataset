# MolAlexandre/masar-clip-lora-banks

## Resumen

MASAR CLIP LoRA banks es una coleccion de doce bancos de adaptadores LoRA entrenados sobre el codificador de imagen de CLIP, publicada por MolAlexandre como material complementario del articulo *Let Expert Confidence Guide LoRA Merging: Margin-Aware Spectral Adaptation* (MASAR). Cada banco agrupa ocho expertos, uno por tarea de clasificacion visual (Cars, DTD, EuroSAT, GTSRB, MNIST, RESISC45, SUN397 y SVHN), y se diferencia del resto por la funcion de perdida empleada durante el entrenamiento (entropia cruzada o CosFace con distintos margenes y escalas de logit). El objetivo es servir de banco de pruebas reproducible para investigacion sobre fusion de adaptadores y seleccion de expertos.

El modelo no es un modelo generativo ni un clasificador listo para produccion: es un conjunto de pesos PEFT (rango 16, alpha 16) aplicados sobre las proyecciones query, key, value y output de cada bloque del encoder visual de dos backbones distintos, `openai/clip-vit-base-patch32` (ViT-B/32) y `openai/clip-vit-large-patch14` (ViT-L/14). Las cabezas de clasificacion son las cabezas zero-shot congeladas de CLIP con las plantillas de prompt de KnOTS, de modo que la evaluacion se realiza en regimen zero-shot con adaptadores.

Su relevancia es acotada pero clara para el nicho de investigacion en merging de LoRA: proporciona doce configuraciones controladas que varian sistematicamente el margen mediano de los expertos, lo que permite estudiar como la confianza de cada experto condiciona la calidad de la fusion. El repositorio ocupa 0,7 GB, tiene licencia MIT y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el encoder visual de CLIP ViT-B/32 y ViT-L/14; transformer de vision con atencion multi-cabeza |
| Parametros totales | no disponible (el repositorio contiene adaptadores LoRA, no pesos completos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; CLIP ViT-B/32 procesa imagenes de 224x224 en parches de 32x32, ViT-L/14 en parches de 14x14) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el componente es un encoder de imagen; no se documenta cobertura linguistica) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`), con `adapter_config.json` y `training.json` por experto |

## Arquitectura y entrenamiento

Cada experto es un adaptador LoRA de rango 16 y alpha 16 insertado en las proyecciones query, key, value y output de todos los bloques del encoder de imagen de CLIP. Los adaptadores se organizan en la ruta `<backbone>/<bank>/<task>/`, de modo que un banco contiene ocho expertos, uno por tarea. Los backbones cubiertos son ViT-B/32 (ocho bancos) y ViT-L/14 (cuatro bancos). Las cabezas de clasificacion no se entrenan: se reutilizan las cabezas zero-shot congeladas de CLIP construidas con las plantillas de prompt de KnOTS, generadas por `masar/clip.py` del repositorio de codigo.

El entrenamiento sigue la receta descrita en el apendice B.1 del articulo y, segun la model card, solo cambia la funcion de perdida entre bancos. Los ocho bancos de ViT-B/32 combinan cinco configuraciones de entropia cruzada (escalas de logit 10.000, 3.000, 1.000, 300 y 100) y tres de CosFace (escala 10.000 con margenes 0,05, 0,10 y 0,20, los dos ultimos con tope de 0,8 en gamma(y)). Los cuatro bancos de ViT-L/14 incluyen dos de entropia cruzada (escalas 10.000 y 100) y dos de CosFace (margen 0,05 y 0,20 con tope de 0,8). Cada banco se nombra por el margen mediano m de sus expertos medido sobre una imagen sin etiquetar de su tarea, lo que convierte el nombre en una medida empirica de separacion de clases mas que en un hiperparametro nominal.

La innovacion metodologica del trabajo es el uso de la confianza de los expertos, expresada como margen espectral, para guiar la fusion de los adaptadores. El repositorio sirve como material reproducible para replicar esos experimentos y compararlos con los dos bancos publicos de KnOTS (`hoffman-lab/KnOTS-ViT-B-32_lora_R16_*` y `hoffman-lab/KnOTS-ViT-L-14_lora_R16_*`), que se citan como referencia.

## Capacidades

- Clasificacion de imagenes zero-shot mediante adaptadores LoRA sobre el encoder visual de CLIP, con ocho dominios cubiertos: coches (Cars), texturas (DTD), uso del suelo por satelite (EuroSAT), senales de trafico (GTSRB), digitos manuscritos (MNIST), escenas aereas (RESISC45), escenas naturales (SUN397) y digitos de numeros de calle (SVHN).
- Extraccion de representaciones visuales ajustadas por tarea, reutilizables para tareas de retrieval o clustering sobre los dominios entrenados.
- Soporte de fusion de adaptadores: los doce bancos estan disenados para experimentar con tecnicas de model merging y seleccion de expertos guiada por confianza.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni modo thinking.
- No soporta audio ni video.
- Capacidades multilingues: no disponibles; el componente es puramente visual y no se documenta cobertura de idiomas.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Investigacion en fusion de LoRA: los doce bancos permiten reproducir el experimento de MASAR variando el margen mediano de los expertos y medir como afecta la confianza al rendimiento del adaptador fusionado, usando las cabezas zero-shot de KnOTS como referencia fija.
- Reproducibilidad de articulos: el repositorio incluye `training.json` por experto y el codigo en GitHub, lo que permite reconstruir el pipeline de entrenamiento y verificar los resultados publicados sin reentrenar desde cero.
- Benchmarking de tecnicas de merging: comparar metodos como KnOTS, TIES, DARE o media aritmetica de adaptadores sobre un conjunto controlado de bancos con distinta separacion de clases.
- Clasificacion zero-shot de imagenes satelitales: cargar el experto EuroSAT del banco ViT-L/14 y evaluar su capacidad de distinguir usos del suelo sin entrenamiento adicional sobre el dominio objetivo.
- Analisis de sensibilidad a la escala de logit: los bancos de entropia cruzada con escalas de 10.000, 3.000, 1.000, 300 y 100 permiten estudiar el efecto de la calibracion de logits en la transferibilidad del adaptador.
- Estudio de margenes CosFace en regimen few-shot: los bancos CF con margenes 0,05, 0,10 y 0,20 y tope de 0,8 en gamma(y) sirven para analizar el compromiso entre separacion de clases y generalizacion en dominios de pocas clases.
- Docencia y experimentacion: el tamano reducido del repositorio (0,7 GB) y la licencia MIT facilitan su uso en cursos y practicas sobre PEFT y CLIP sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exactitud, F1 ni comparaciones numericas con otros adaptadores; solo describe la composicion de los bancos, la receta de entrenamiento y la nomenclatura basada en el margen mediano.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, los adaptadores LoRA de rango 16 sobre ViT-B/32 y ViT-L/14 son ligeros (el repositorio completo pesa 0,7 GB), pero requieren cargar el backbone CLIP completo en memoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para ViT-B/32 en fp16; ViT-L/14 requiere mas memoria, aunque no se especifica una cifra concreta en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si para ViT-B/32 en GPUs tipo RTX 3060, RTX 4060 o superiores; para ViT-L/14 se recomienda 16 GB o mas, aunque el dato no esta confirmado en la model card.
- Opciones de despliegue: la libreria declarada es `peft`, por lo que el flujo natural es cargar el backbone con `transformers` y aplicar el adaptador con `PeftModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MASAR CLIP LoRA banks (este) | LoRA r=16 sobre ViT-B/32 y ViT-L/14 | no aplica (vision) | no disponible | MIT | Hugging Face, 0 descargas |
| KnOTS ViT-B-32 LoRA R16 (`hoffman-lab`) | LoRA r=16 sobre ViT-B/32 | no aplica (vision) | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| KnOTS ViT-L-14 LoRA R16 (`hoffman-lab`) | LoRA r=16 sobre ViT-L/14 | no aplica (vision) | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| CLIP ViT-B/32 original (`openai`) | ~151 M (backbone completo) | no aplica (vision) | ampliamente reportado en la literatura, no reproducido aqui | MIT | Hugging Face, ampliamente usado |

La comparativa se limita a los bancos de KnOTS citados en la propia model card como referencia directa del articulo, ya que no se dispone de datos de rendimiento de ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es material de investigacion para reproducir un articulo, sin pipeline de inferencia documentado ni ejemplos de uso.
- Solo cubre tareas de clasificacion de imagen en ocho dominios concretos; no generaliza a otros dominios sin reentrenamiento.
- Las cabezas de clasificacion son las zero-shot de CLIP con plantillas de KnOTS; cualquier evaluacion depende de esas plantillas y de la eleccion de clases.
- No se documentan sesgos conocidos, pero al ser adaptadores sobre CLIP heredan los sesgos del backbone original en dominios visuales.
- Riesgo de alucinacion no aplica en el sentido habitual (no genera texto), pero si existe riesgo de clasificaciones erroneas con alta confianza en dominios fuera de distribucion.
- No se documenta cobertura de idiomas ni limitaciones de contexto linguistico porque el componente es puramente visual.
- Licencia MIT: permite uso comercial y modificacion, pero el backbone CLIP subyacente tiene su propia licencia que debe verificarse por separado.
- El repositorio no registra descargas ni likes, lo que sugiere validacion externa limitada; conviene contrastar los resultados con el articulo original antes de reutilizarlo.
- El nombre de cada banco depende de una medicion empirica sobre una sola imagen sin etiquetar, por lo que el margen reportado puede no ser estable entre ejecuciones.

## Enlaces

- Hugging Face: https://huggingface.co/MolAlexandre/masar-clip-lora-banks
- Codigo del articulo: https://github.com/MolAlexandre/masar-merging
- Modelo base ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Modelo base ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Banco de referencia KnOTS ViT-B/32: https://huggingface.co/hoffman-lab/KnOTS-ViT-B-32_lora_R16
- Banco de referencia KnOTS ViT-L/14: https://huggingface.co/hoffman-lab/KnOTS-ViT-L-14_lora_R16
