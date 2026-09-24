# Arihant25/anlp-a2-moe

## Resumen

Arihant25/anlp-a2-moe es un conjunto de cinco checkpoints de tamano reducido (entre 37,46 y 54,26 millones de parametros totales) publicados por Arihant Tripathy como material de la asignatura Advanced NLP (Monsoon 2026) del IIIT Hyderabad. No se trata de un modelo de proposito general ni de un lanzamiento comercial, sino de los artefactos de entrenamiento de un ejercicio academico comparativo: cada checkpoint corresponde a una configuracion distinta de la misma arquitectura transformer, con una variante densa como linea base y cuatro variantes con mezcla de expertos (MoE) de distinto enrutado.

El objetivo del ejercicio es medir el compromiso entre parametros totales y parametros activos por token. Todos los runs se entrenaron exactamente con 150.028.257 tokens, de modo que la comparacion aisla el efecto del diseno MoE. Las variantes incluyen enrutado top-1 y top-2, un caso con mas parametros totales para igualar la computacion de la linea base y una configuracion con un experto compartido mas tres expertos enrutados.

Los pesos se distribuyen en formato safetensors, con ficheros separados de configuracion, tokenizer y metadatos por carpeta. La relevancia del repositorio es fundamentalmente didactica y de investigacion: sirve para reproducir las ablaciones del curso y para inspeccionar el comportamiento de distintas estrategias de enrutado MoE a una escala que cabe en cualquier portatil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con variantes densas y de mezcla de expertos (MoE); la model card remite a src.model.TransformerConfig |
| Parametros totales | Entre 37,46M y 54,26M segun la variante |
| Parametros activos | Entre 24,90M y 37,48M por token segun la variante (solo en las variantes MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declara precision de almacenamiento) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), acompanado de config.json, tokenizer.json y meta.json en cada carpeta |

## Arquitectura y entrenamiento

La arquitectura es un transformer definido por la clase src.model.TransformerConfig del repositorio de la asignatura. Sobre esa base se entrenaron cinco configuraciones con el mismo presupuesto de datos (150.028.257 tokens): una densa pura (p1-dense, 37,46M parametros totales y activos), dos con cuatro expertos y enrutado top-1 y top-2 (p1-moe4-top1 y p1-moe4-top2), una con cuatro expertos y top-2 pero ampliada a 54,26M parametros totales para que los parametros activos igualen a los de la linea base densa (p1-moe4-top2-active) y una con un experto compartido mas tres expertos enrutados y top-1 (p1-shared1-moe3-top1). El rango de parametros activos va de 24,90M en la configuracion mas dispersa a 37,48M en la densa y en la ampliada.

No se documenta en la informacion disponible la composicion del dataset de entrenamiento, la presencia de fases de ajuste por RLHF, DPO o instrucciones, ni innovaciones tecnicas adicionales como atencion lineal o decodificacion especulativa. Los logs de entrenamiento estan publicados en Weights & Biases, lo que permitiria reconstruir curvas de perdida y detalles del optimizador, pero esos datos no se han extraido aqui. La carga de los checkpoints no se realiza con la API estandar de transformers: requiere la funcion src.utils.load_checkpoint del repositorio de la asignatura.

## Capacidades

- Generacion de texto autorregresiva a escala reducida: los modelos son transformers causales de 37-54M parametros, por lo que su competencia linguistica esta limitada por el presupuesto de entrenamiento de aproximadamente 150M tokens.
- Modelado de lenguaje y continuacion de secuencias: es la funcion para la que fueron entrenados de forma demostrable.
- Comparacion controlada de estrategias MoE: los cinco checkpoints permiten estudiar el efecto del enrutado top-1 frente a top-2 y de los expertos compartidos sobre los parametros activos.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (la model card no declara idiomas).
- Capacidades especiales (modo pensamiento, vision, audio): no documentadas.

## Casos de uso

- Docencia de arquitecturas MoE: el repositorio permite a estudiantes comparar una linea base densa con cuatro variantes de enrutado entrenadas con los mismos tokens, usando los checkpoints como material de laboratorio reproducible.
- Investigacion sobre enrutado y equilibrio de carga: con los cinco runs se pueden medir diferencias de perdida y de utilizacion de expertos entre top-1, top-2 y la configuracion con experto compartido sin coste computacional apreciable.
- Validacion de codigo de inferencia MoE: sirve como banco de pruebas para verificar implementaciones propias de capas de mezcla de expertos, ya que el checkpoint y el cargador de referencia estan disponibles.
- Experimentos de destilacion o inicializacion: al ser modelos de menos de 55M parametros, se pueden usar como inicializacion para experimentos academicos de destilacion desde modelos mayores o de ajuste fino sobre dominios pequenos.
- Pruebas de integracion en pipelines de evaluacion: utiles para comprobar que un harness de evaluacion de lenguaje funciona de extremo a extremo antes de lanzarlo contra modelos grandes.
- Reproduccion de resultados de un curso: el enlace a los logs de Weights & Biases y la estructura de carpetas permiten replicar las curvas de entrenamiento reportadas en la asignatura.
- Ejecucion en hardware muy limitado: al ocupar decenas de megabytes en precision completa, se puede desplegar en CPU, en placas tipo Raspberry Pi o en cualquier GPU de gama de entrada para demostraciones en aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta, para cada run, el numero de parametros totales, el numero de parametros activos y el volumen de tokens de entrenamiento:

| Run | Parametros totales | Parametros activos | Tokens de entrenamiento |
|---|---|---|---|
| p1-dense | 37,46M | 37,46M | 150.028.257 |
| p1-moe4-top1 | 37,48M | 24,90M | 150.028.257 |
| p1-moe4-top2 | 37,48M | 29,09M | 150.028.257 |
| p1-moe4-top2-active | 54,26M | 37,48M | 150.028.257 |
| p1-shared1-moe3-top1 | 37,47M | 29,09M | 150.028.257 |

No se dispone de cifras de MMLU, HumanEval, GSM8K, perplexity ni de ninguna otra metrica de calidad en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision de 32 bits, entre 150 MB (37,46M parametros) y 217 MB (54,26M); en 16 bits, entre 75 MB y 108 MB; en 8 bits, entre 37 MB y 54 MB. Cabe holgadamente en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050, una RTX 3060 o una iGPU moderna. No requiere A100, H100 ni aceleradores de datacenter.
- Inferencia en CPU: viable y, para este tamano, probablemente suficiente en la mayoria de escenarios de demostracion.
- Cabe en GPU de consumo: si, en todas las gamas actuales; el repositorio completo de los cinco checkpoints ocupa 0,8 GB, por lo que incluso en precision completa caben varios a la vez.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con la API estandar de transformers. La via indicada por el autor es la funcion src.utils.load_checkpoint del repositorio de la asignatura, sobre los ficheros config.json, model.safetensors, tokenizer.json y meta.json de cada carpeta.
- Latencia y throughput: no disponibles. Por tamano, la latencia de un forward pass deberia estar en el orden de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparacion mas significativa es interna, entre los propios checkpoints del repositorio, ya que todos comparten datos y receta de entrenamiento:

| Run | Parametros totales | Parametros activos | Enrutado | Ratio de activacion |
|---|---|---|---|---|
| p1-dense | 37,46M | 37,46M | no aplica | 100 % |
| p1-moe4-top1 | 37,48M | 24,90M | 4 expertos, top-1 | 66,4 % |
| p1-moe4-top2 | 37,48M | 29,09M | 4 expertos, top-2 | 77,6 % |
| p1-moe4-top2-active | 54,26M | 37,48M | 4 expertos, top-2 | 69,1 % |
| p1-shared1-moe3-top1 | 37,47M | 29,09M | 1 compartido + 3 enrutados, top-1 | 77,6 % |

Frente a alternativas publicas de escala comparable, no se dispone de datos de rendimiento que permitan una comparacion rigurosa. Modelos como GPT-2 small (124M parametros) o las familias TinyStories y TinyLlama operan en rangos de tamano cercanos, pero no existe en la informacion proporcionada ninguna evaluacion cruzada, ni declaracion de licencia, contexto o rendimiento de este repositorio frente a ellos mas alla de que la licencia aqui es MIT. Cualquier comparacion cuantitativa seria especulativa y por tanto se declara no disponible.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido: 150M tokens es un volumen bajo incluso para modelos de 37M parametros, por lo que la calidad de generacion sera muy inferior a la de cualquier modelo de proposito general actual.
- Ausencia total de benchmarks: no hay ninguna metrica publicada de calidad, coherencia, sesgo o toxicidad, lo que impide estimar su comportamiento real.
- No es un modelo de proposito general ni un asistente conversacional: no se documenta ajuste por instrucciones, plantilla de chat ni fases de RLHF o DPO.
- Carga no estandar: requiere el codigo del repositorio de la asignatura; no se puede usar directamente con AutoModelForCausalLM ni con runtimes habituales como llama.cpp, Ollama o vLLM sin trabajo adicional de conversion.
- Idiomas no declarados: no se especifica en que lenguas se entreno, por lo que el soporte multilingue es desconocido.
- Longitud de contexto no declarada: no se puede garantizar el comportamiento en secuencias largas ni planificar casos de uso que dependan de una ventana amplia.
- Riesgo de alucinacion: con este presupuesto de datos y sin ajuste por preferencias, la generacion de contenido factual falso o incoherente es esperable.
- Sesgos potenciales: no evaluados ni documentados; el dataset de entrenamiento es desconocido.
- Licencia MIT: permite uso comercial y modificacion, pero la capacidad real del modelo hace inviable cualquier aplicacion en produccion con requisitos de calidad.
- Sin mantenimiento ni validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, y se trata de un artefacto academico con fecha de publicacion de septiembre de 2026.
- Riesgo de confusion: el nombre "a2-moe" puede sugerir un modelo MoE de gran escala cuando en realidad agrupa checkpoints de un ejercicio de asignatura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arihant25/anlp-a2-moe
- Logs de entrenamiento en Weights & Biases: https://wandb.ai/arihanttr-iiit-hyderabad/anlp-a2
- Perfil del autor en HuggingFace: https://huggingface.co/Arihant25
- Repositorio de la guia de estudio de la asignatura: https://github.com/Arihant25/anlp-study-guide
- Carpeta de assignments del repositorio: https://github.com/Arihant25/anlp-study-guide/tree/main/assignments
