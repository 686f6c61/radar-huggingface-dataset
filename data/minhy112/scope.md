# minhy112/SCOPE

## Resumen

SCOPE es un repositorio de checkpoints de investigación asociado al proyecto SCOPE-KG, orientado a respuesta de preguntas multimodales (multimodal question answering) con apoyo de grafos de conocimiento. No se trata de un modelo independiente, sino de un conjunto de cabezas de lectura y adaptadores entrenados por el proyecto sobre un backbone compartido Qwen3-8B, acompañados de pesos de recuperador/selector cuando corresponde. El autor lo clasifica explícitamente como "research checkpoints" y "work-in-progress".

El proyecto realiza comparaciones de referencia controladas sobre ScienceQA y sobre una redistribución texto-imagen documentada de MultiModalQA. Según la propia model card, los experimentos están en curso y la publicación de un checkpoint no demuestra que SCOPE supere a MIRA ni que el artículo esté terminado. La selección de checkpoints se hace únicamente con validación, y las puntuaciones de test no deben guiar el entrenamiento ni la selección posterior.

La relevancia actual es limitada y puramente investigadora: el repositorio tiene 0 descargas y 1 like, un tamaño de 0.0 GB (sin pesos del modelo base incluidos) y no declara licencia. El 10 de octubre de 2026 el propietario solicitó un reinicio completo de experimentos, de modo que los artefactos históricos bajo rutas de ejecución anteriores no corresponden a la nueva ejecución. La nueva ejecución entrena un adaptador compartido desde cero y repite todos los métodos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores y cabezas de lectura entrenados por el proyecto sobre un backbone compartido Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (el repositorio contiene adaptadores/cabezas, no el modelo completo) |
| Parametros activos | no disponible (no se declara una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) y vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona configuracion y procedencia con SHA-256, pero no el formato de los pesos) |

## Arquitectura y entrenamiento

La model card describe el proyecto como una comparacion de lineas base controladas que comparten un mismo backbone Qwen3-8B. Sobre ese backbone el proyecto entrena cabezas de lectura y adaptadores, y cuando procede tambien pesos de recuperador y selector. Estos componentes no son modelos Qwen independientes salvo que se indique explicitamente lo contrario. Cada ejecucion liberada registra el modelo, el conjunto de datos, la semilla, la epoca seleccionada, el alcance de la evaluacion y las dependencias ascendentes necesarias.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card advierte que el entrenamiento esta en curso y que, tras la solicitud del propietario del 10 de octubre de 2026, se entrena un adaptador compartido nuevo y se repiten todos los metodos; el preprocesado de datos corregido puede reutilizarse tras verificar su hash. Las adaptaciones controladas no deben interpretarse como una reproduccion exacta de la configuracion nativa de cada articulo original.

## Capacidades

- Respuesta de preguntas multimodales con apoyo de grafos de conocimiento, segun la orientacion declarada del proyecto (SCOPE-KG).
- Evaluacion comparativa sobre ScienceQA y sobre una redistribucion texto-imagen documentada de MultiModalQA.
- Recuperacion y seleccion de informacion mediante pesos de recuperador/selector entrenados por el proyecto, cuando la ejecucion los incluye.
- Reproduccion de comparaciones de referencia controladas sobre un backbone Qwen3-8B compartido.
- Idiomas declarados: ingles y vietnamita.
- No se declaran capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento extendido. Cualquier capacidad heredada del backbone Qwen3-8B no esta confirmada en esta informacion.

## Casos de uso

- Reproduccion de experimentos academicos: servir como punto de partida verificable (con procedencia SHA-256) para replicar los resultados de SCOPE-KG sobre ScienceQA y MultiModalQA.
- Investigacion en QA multimodal con grafos de conocimiento: comparar el comportamiento de las cabezas de lectura y los adaptadores sobre un backbone fijo, aislando el efecto de cada componente.
- Estudios de ablation controlada: al compartir el mismo backbone Qwen3-8B, permite comparar variantes de recuperador y selector bajo condiciones homogeneas de entrenamiento.
- Benchmarking educativo sobre ScienceQA: analizar el rendimiento en preguntas cientificas multimodales, distinguiendo resultados de validacion y de test en cada manifiesto de ejecucion.
- Auditoria de metodologia: el repositorio explicita la seleccion de checkpoints por validacion y prohibe usar test para guiar decisiones, lo que lo hace util como caso de estudio de disciplina experimental.
- Investigacion multilingue acotada: explorar el comportamiento en ingles y vietnamita, los dos idiomas declarados, dentro del alcance del proyecto.
- No se recomienda su uso en produccion ni en escenarios comerciales, dado su caracter de investigacion en curso y la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comparaciones se realizan sobre ScienceQA y una redistribucion texto-imagen de MultiModalQA, pero no incluye cifras, y advierte que un checkpoint publicado no constituye evidencia de superioridad sobre MIRA ni de que el articulo este completo.

## Requisitos de hardware

- El repositorio no incluye los pesos del modelo base ni datos de tamano de los adaptadores, por lo que no es posible dar cifras de VRAM especificas de SCOPE.
- Para ejecutar los adaptadores es necesario disponer por separado del backbone Qwen3-8B, cuyos checkpoints base no se incluyen en esta release inicial.
- Estimacion orientativa solo para el backbone Qwen3-8B (no para los adaptadores): aproximadamente 16 GB de VRAM en FP16, 8-9 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas para el backbone: A100, H100 o equivalentes de datacenter; en el ambito de consumo, tarjetas con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090) para FP16, o menos si se cuantiza.
- Opciones de despliegue: al tratarse de adaptadores, se necesita un framework con soporte PEFT sobre Qwen3-8B (por ejemplo, vLLM, TGI o transformers con PEFT); llama.cpp u Ollama requeririan fusionar previamente los adaptadores con el backbone.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa. Se ofrece una comparacion cualitativa basada en la informacion disponible.

| Modelo | Tipo | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCOPE (minhy112/SCOPE) | Adaptadores/cabezas de investigacion para QA multimodal con KG | Qwen3-8B | no disponible | no disponible | Repositorio publico, 0 descargas, sin pesos base |
| Qwen3-8B (modelo base) | LLM denso decoder-only | no aplica | no disponible en esta ficha | no disponible en esta ficha | Publico en HuggingFace |
| MIRA | Metodo de referencia citado en la model card | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables dentro del material proporcionado.

## Limitaciones y advertencias

- Work in progress: los experimentos estan en curso y los resultados no son definitivos.
- Un checkpoint publicado no demuestra superioridad sobre MIRA ni la finalizacion del articulo, segun la propia model card.
- No es un modelo independiente: requiere el backbone Qwen3-8B, cuyos checkpoints base no se incluyen.
- No se incluyen imagenes ni texto de los datasets ni articulos de terceros en esta release inicial.
- Riesgo de sobreajuste metodologico: la seleccion de checkpoints usa solo validacion, y usar test para guiar entrenamiento o seleccion invalidaria los resultados.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma y contexto: solo se declaran ingles y vietnamita; la longitud de contexto no esta especificada.
- Licencia no declarada: no hay base para uso comercial ni condiciones de redistribucion.
- Reinicio de experimentos: los artefactos historicos bajo rutas de ejecucion anteriores no corresponden a la nueva ejecucion del 10 de octubre de 2026.
- Ausencia de benchmarks publicados y de estimaciones de latencia/throughput.
- No se declaran credenciales ni ficheros de entorno privados en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minhy112/SCOPE
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-8B
- Paper: no disponible
- Blog: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
