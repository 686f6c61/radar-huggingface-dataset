# RepublicOfKorokke/d1-3B-oQ4e-fp16

## Resumen

d1-3B-oQ4e-fp16 es una version cuantizada del modelo LiquidAI/d1-3B, publicada por el usuario RepublicOfKorokke en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion de pesos: parte de los pesos originales de LiquidAI y los reduce a 4 bits con precision mixta usando la herramienta oQ (oMLX v0.7.0), con grupo de cuantizacion de tamano 64 y almacenamiento en safetensors de MLX.

El modelo base pertenece a la familia arquitectonica lfm2_vl, segun la etiqueta declarada por el autor, lo que situa el artefacto en el terreno de los modelos de lenguaje con capacidades de vision-lenguaje de LiquidAI. El recuento real de parametros de safetensors es de 3.123.483.888 (aproximadamente 3,12 mil millones), y el repositorio ocupa 3,2 GB.

Su relevancia es practica y acotada: ofrece una version de bajo peso pensada para ejecucion en hardware Apple Silicon mediante MLX, reduciendo el consumo de memoria frente al modelo original en fp16. Al ser un repositorio de cuantizacion con muy pocas descargas (20) y sin likes, debe considerarse un artefacto experimental de terceros mas que una distribucion oficial de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (familia Liquid Foundation Model 2, variante vision-lenguaje) |
| Parametros totales | 3.123.483.888 (aproximadamente 3,12 mil millones) |
| Parametros activos | no disponible / no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precision mixta (oQ / oMLX v0.7.0), grupo de tamano 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (mixed precision, con componentes en fp16) |

## Arquitectura y entrenamiento

El artefacto hereda la arquitectura del modelo base LiquidAI/d1-3B, etiquetada como lfm2_vl. Esta etiqueta apunta a la familia de modelos Liquid Foundation Model 2 de LiquidAI en su variante con soporte de vision-lenguaje, es decir, un modelo capaz de procesar entradas de imagen y texto. No se proporciona en la informacion disponible el detalle interno de la arquitectura (tipo de capas, atencion, mecanismos hibridos) ni el esquema exacto de entrenamiento.

En cuanto al proceso de cuantizacion, el autor indica que se aplico oQ (oMLX v0.7.0) con cuantizacion de precision mixta a 4 bits y grupo de 64. El sufijo "fp16" del nombre sugiere que determinados componentes se mantienen en fp16 en lugar de reducirse a 4 bits, un patron habitual para preservar la calidad de capas sensibles. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que esta informacion corresponde al modelo original y no se reproduce en esta ficha.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredadas del modelo base LiquidAI/d1-3B.
- Capacidades de vision-lenguaje, segun la etiqueta de arquitectura lfm2_vl, lo que implica procesamiento conjunto de imagenes y texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.
- Ejecucion en hardware Apple Silicon a traves de MLX, que es la libreria declarada del repositorio.

## Casos de uso

- Prototipado local en Mac: el modelo, al estar en formato MLX y ocupar 3,2 GB, permite experimentar con generacion de texto y tareas de vision-lenguaje directamente en un Mac con Apple Silicon sin depender de servicios en la nube.
- Pruebas de tareas multimodal imagen-texto: gracias a la arquitectura lfm2_vl declarada, se puede usar para describir imagenes, responder preguntas sobre contenido visual o extraer informacion de capturas, siempre validando la calidad real del artefacto cuantizado.
- Evaluacion comparativa de cuantizaciones: util como punto de referencia para medir la perdida de calidad de una cuantizacion 4 bits de precision mixta frente al modelo base en fp16.
- Desarrollo de asistentes embebidos en aplicaciones de escritorio para macOS: al ejecutarse con MLX, puede integrarse en apps nativas que necesiten inferencia local sin conexion.
- Investigacion sobre tecnicas de cuantizacion: sirve para estudiar el comportamiento de oQ con grupo 64 en un modelo de 3B con componentes en fp16.
- Generacion de codigo y texto tecnico en local: si el modelo base conserva dichas capacidades, este artefacto permite ejecutarlas con menor huella de memoria, aunque la calidad debe verificarse caso por caso.
- Filtrado y clasificacion de contenido en pipelines offline: siempre que las capacidades generativas del modelo base se mantengan tras la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de tareas de vision-lenguaje, ni tampoco mediciones de la degradacion introducida por la cuantizacion respecto al modelo base.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,2 GB en el formato de cuantizacion 4 bits tal como se distribuye el repositorio. En fp16 puro, un modelo de 3,12 mil millones de parametros rondaria los 6,2-6,5 GB.
- GPU recomendadas: al usar MLX, el destino natural es hardware Apple Silicon (chips de la serie M). No se declara compatibilidad con GPUs NVIDIA o AMD a traves de este repositorio.
- Compatibilidad con GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente (8 GB o mas recomendable), dado su tamano de 3,2 GB.
- Opciones de despliegue: MLX es la libreria declarada. El repositorio incluye la etiqueta custom_code, lo que implica que puede requerir trust_remote_code al cargarse. Para otros runtimes (vLLM, llama.cpp, Ollama, TGI) no hay confirmacion de compatibilidad en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RepublicOfKorokke/d1-3B-oQ4e-fp16 | 3,12 mil millones | no disponible | no disponible | MLX safetensors 4 bits | Cuantizacion de terceros del modelo base |
| LiquidAI/d1-3B | no disponible | no disponible | no disponible | safetensors | Modelo base original de LiquidAI, sin cuantizar |
| Otras alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparacion cuantitativa fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- Artefacto de terceros: la cuantizacion la realiza un usuario no verificado (RepublicOfKorokke) sobre el modelo de LiquidAI, sin garantia de calidad ni validacion oficial.
- Degradacion por cuantizacion: la reduccion a 4 bits puede afectar a la calidad de generacion, al razonamiento y, sobre todo, a las tareas de vision-lenguaje, sin que se aporten mediciones al respecto.
- Licencia no especificada: el repositorio no declara licencia, lo que genera incertidumbre sobre el uso comercial. Debe consultarse la licencia del modelo base LiquidAI/d1-3B antes de cualquier uso en produccion.
- Requiere custom_code: el uso puede obligar a ejecutar codigo remoto con trust_remote_code, lo que implica un riesgo de seguridad que debe evaluarse.
- Idiomas no declarados: se desconoce el soporte real multilingue y la calidad en castellano.
- Contexto desconocido: no se indica la longitud de ventana, dato critico para planificar conversaciones largas o procesamiento de documentos extensos.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo; como modelo generativo, mantiene riesgo de alucinacion inherente a la familia.
- Adopcion minima: con 20 descargas y 0 likes, no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Sin benchmarks publicados: no hay forma de verificar el rendimiento real ni compararlo con el modelo base sin evaluaciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RepublicOfKorokke/d1-3B-oQ4e-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
