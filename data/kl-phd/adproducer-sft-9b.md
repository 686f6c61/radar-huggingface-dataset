# KL-PHD/AdProducer-SFT-9B

## Resumen

AdProducer-SFT-9B es un ajuste fino supervisado (SFT) de Qwen3.5-9B desarrollado por KL-PHD como parte del trabajo *AdProducer: Towards Agentic Advertising Video Generation*. El modelo resuelve un problema concreto: convertir un brief creativo corto en un guion grafico (storyboard) detallado y fundamentado en el producto real, descubriendo y verificando informacion del producto, recuperando referencias visuales oficiales y disenando plano a plano la narrativa visual. Ese storyboard se entrega despues a un generador de video congelado que lo materializa.

El modelo es multimodal (image-text-to-text) y actua como agente de planificacion previa a la generacion de video publicitario. Segun la model card, los storyboards de AdProducer mejoran la precision del producto (forma, colores, logotipo correctos), la precision informativa (datos y especificaciones en pantalla), la expresion de argumentos de venta, el diseno de planos y la calidad visual frente a enviar el brief directamente al generador de video, y son transferibles a otros generadores sin reentrenamiento.

Se trata de un fine-tune de parametros completos sobre Qwen3.5-9B con el vision tower congelado, entrenado sobre 3.710 trayectorias agenticas durante 2 epocas con ms-swift. Es el checkpoint de partida de la etapa de RL que produjo AdProducer-RL-9B. La ficha de Hugging Face reporta 1.469.680 parametros en safetensors, un dato que no es coherente con el tamano nominal de 9B del modelo base y que probablemente refleja un recuento parcial o un error de publicacion; el tamano del repositorio es de 18,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-9B |
| Parametros totales | 9B nominales (modelo base); el recuento safetensors publicado es 1.469.680, no coherente con el tamano nominal |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AdProducer-SFT-9B es un ajuste fino de parametros completos de Qwen3.5-9B, un modelo multimodal de tipo image-text-to-text, con el vision tower congelado durante el entrenamiento. El entrenamiento se realizo con ms-swift sobre 3.710 trayectorias agenticas durante 2 epocas. El repositorio incluye `args.json` con la configuracion completa de ms-swift y `trainer_state.json` con el registro de entrenamiento, ademas de los detalles de comando, datos y enmascaramiento de perdida en el directorio `training/sft/` del repositorio de GitHub.

El modelo se entrena para comportamiento agentico: descubrir y verificar informacion real de producto, recuperar referencias visuales oficiales y componer un storyboard plano a plano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de su identificador (`KL-PHD/AdProducer-Train-Data`), ni sobre el uso de RLHF o DPO en esta etapa; el RL se aplico en la etapa posterior que dio lugar a AdProducer-RL-9B. Tampoco se detallan innovaciones de decodificacion o atencion en la informacion disponible.

## Capacidades

- Generacion de storyboards publicitarios: convierte un brief creativo breve en una secuencia de planos con descripcion visual, argumentos de venta y datos en pantalla.
- Fundamentacion en producto: descubre y verifica informacion real del producto y recupera referencias visuales oficiales antes de planificar.
- Razonamiento agentico multi-paso: encadena busqueda, verificacion y planificacion dentro de una misma trayectoria.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto como entrada.
- Transferencia de storyboards: los guiones generados pueden alimentar distintos generadores de video sin reentrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de storyboards para anuncios: a partir de un brief de producto, el modelo produce un guion plano a plano que un generador de video congelado convierte en video, mejorando la precision del producto y de los datos en pantalla respecto a enviar el brief directamente al generador.
- Verificacion de informacion de producto en campanas: el modelo descubre y contrasta especificaciones y caracteristicas reales antes de incorporarlas al guion, reduciendo errores factuales en el material publicitario.
- Recuperacion de referencias visuales oficiales: integra imagenes oficiales del producto como entrada multimodal para que el storyboard respete forma, colores y logotipo.
- Prototipado rapido de creatividades: permite a equipos de marketing iterar sobre distintos enfoques de storyboard para un mismo brief antes de comprometer recursos de produccion de video.
- Pipeline con generadores de video externos: al ser los storyboards transferibles, el modelo puede situarse como etapa de planificacion en pipelines que usen distintos generadores sin reentrenar.
- Investigacion en generacion agentica de video: sirve como checkpoint SFT de referencia y punto de partida reproducible para experimentos de RL en tareas de planificacion visual, con datos y codigo publicados.
- Evaluacion comparativa con AdCreation-Bench: el modelo puede usarse como baseline en el benchmark de 305 briefs publicitarios en ocho dominios publicado junto al trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para un modelo de 9B en precision completa, se requieren del orden de 18-20 GB solo para pesos; en cuantizacion de 8 bits, unos 9-10 GB, y en 4 bits, unos 5-6 GB, mas overhead de contexto y del vision tower.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 9B en BF16 encaja en A100 40/80 GB, H100 y GPUs consumer de 24 GB (RTX 3090/4090) con cuantizacion o precision reducida.
- Cabe en GPU consumer: previsiblemente si, en GPUs de 24 GB o mas con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada) y ms-swift para entrenamiento; otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdProducer-SFT-9B | 9B (base Qwen3.5-9B) | no disponible | Planificacion agentica de storyboards publicitarios (image-text-to-text) | Apache 2.0 | Hugging Face (KL-PHD/AdProducer-SFT-9B) |
| AdProducer-RL-9B | 9B (base Qwen3.5-9B) | no disponible | Misma tarea, tras etapa de RL | Apache 2.0 (segun el mismo proyecto) | Hugging Face (KL-PHD/AdProducer-RL-9B) |
| Qwen3.5-9B | 9B | no disponible | Modelo multimodal generalista | no disponible en esta ficha | Hugging Face (Qwen/Qwen3.5-9B) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El recuento de parametros publicado en safetensors (1.469.680) no es coherente con el tamano nominal de 9B; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Modelo especializado en una unica tarea (planificacion de storyboards publicitarios); su rendimiento fuera de ese dominio no esta documentado.
- No se especifican los idiomas soportados; el comportamiento multilingue es incierto.
- No se detalla la longitud de contexto, lo que limita la planificacion de pipelines con briefs largos o muchas referencias visuales.
- Riesgo de alucinacion en la verificacion de informacion de producto: aunque el modelo esta disenado para contrastar datos, no se documentan tasas de error ni mecanismos de salvaguarda.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-9B debe cumplir sus propios terminos.
- El paper esta anunciado como "coming soon"; la citation figura como anonima, por lo que la referencia academica aun no es estable.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KL-PHD/AdProducer-SFT-9B
- Modelo RL del mismo proyecto: https://huggingface.co/KL-PHD/AdProducer-RL-9B
- Pagina del proyecto: https://lky-ang.github.io/AdProducer-page/
- Codigo en GitHub: https://github.com/lky-ang/AdProducer
- Dataset de entrenamiento: https://huggingface.co/datasets/KL-PHD/AdProducer-Train-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
