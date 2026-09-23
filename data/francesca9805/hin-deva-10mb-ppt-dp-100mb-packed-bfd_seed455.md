# francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

`francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (fine-tune) del modelo monolingue `goldfish-models/hin_deva_10mb`, orientado al hindi en escritura devanagari. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros (unos 39 millones), es decir, tres ordenes de magnitud por debajo de los grandes modelos actuales. El ajuste se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El modelo pertenece a la estirpe Goldfish, una familia de modelos monolingues entrenados con volumenes muy reducidos de texto (10 MB, 100 MB o 1 GB por idioma) para cubrir cientos de lenguas de bajos recursos. El nombre del repositorio sugiere un reentrenamiento sobre un corpus empaquetado (packed) de 100 MB derivado del corpus base de 10 MB, con una semilla concreta (seed455), aunque la ficha del autor no detalla esa composicion.

Su relevancia es principalmente de investigacion: permite estudiar el efecto del ajuste supervisado y del empaquetado de datos en modelos de escala muy pequena y en lenguas con poca representacion digital. No es un modelo pensado para produccion: acumula 0 descargas y 0 valoraciones en el momento de redactar esta ficha, no declara licencia ni idiomas, y no aporta resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta del repositorio |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es hindi en escritura devanagari) |
| Licencia | no disponible (la model card indica `licence: license`, sin detalle) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/hin_deva_10mb |
| Libreria | transformers |
| Tarea (pipeline) | text-generation |
| Tamano del repositorio | 0,1 GB |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, con aproximadamente 39 millones de parametros. Es un modelo denso, sin mezcla de expertos ni componentes de estado (SSM), y sin innovaciones de atencion declaradas. El modelo base `goldfish-models/hin_deva_10mb` forma parte de la familia Goldfish, que entrena modelos monolingues con presupuestos de datos muy limitados por idioma; en este caso, el sufijo `hin_deva` identifica hindi en escritura devanagari y `10mb` apunta a un corpus de 10 MB.

El ajuste se ha realizado con SFT a traves de TRL, y la model card enlaza el seguimiento del entrenamiento en Weights & Biases (proyecto `new-tokenizers`, entidad `f-padovani-university-of-groningen`). El nombre del repositorio (`ppt`, `Dp-100mb-packed`, `bfd_seed455`) sugiere un pipeline de datos empaquetados de 100 MB y una inicializacion fijada por semilla, pero no hay documentacion publica que confirme el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. No se declara ninguna tecnica adicional como decodificacion especulativa, atencion lineal o ventana deslizante.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo GPT-2 subyacente.
- Ajuste supervisado orientado a seguir instrucciones conversacionales sencillas; el ejemplo de la model card invoca `pipeline` con una lista de mensajes con rol (`{"role": "user", "content": ...}`), lo que sugiere compatibilidad con una plantilla de chat, aunque no se confirma su formato.
- Generacion en hindi en escritura devanagari (por herencia del modelo base), si bien la model card del ajuste no lo declara explicitamente.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio, thinking mode ni modos especiales.
- No se documenta multilingueismo: el alcance esperado es una unica lengua mas el ingles residual del tokenizador de GPT-2.

## Casos de uso

- Experimentacion academica en lenguas de bajos recursos: sirve como punto de partida reproducible (semilla fija) para medir el impacto del SFT y del empaquetado de datos en modelos de 39 millones de parametros para hindi.
- Estudios de tokenizacion: por el nombre del proyecto de W&B (`new-tokenizers`) y el tamano minimo del modelo, es util para comparar vocabularios y estrategias de tokenizacion sobre devanagari sin coste apreciable de computo.
- Docencia y aprendizaje: permite mostrar de extremo a extremo un pipeline de fine-tuning con TRL en un portatil, sin GPU dedicada, dado que el modelo completo ocupa menos de 160 MB en fp32.
- Baseline en comparativas internas: al ser un modelo de 39M parametros sobre 10 MB de texto, sirve como referencia inferior frente a modelos mayores al evaluar tecnicas de aumento de datos en hindi.
- Generacion de texto exploratoria en hindi: completado de frases o continuacion de parrafos cortos en devanagari, siempre con supervision humana por la baja calidad esperable.
- Generacion de datos sinteticos de bajo coste: producir candidatos de texto en hindi para filtrar y ampliar corpus en experimentos de destilacion o aumento de datos.
- Pruebas de infraestructura de despliegue: validar plantillas de `text-generation-inference`, endpoints compatibles o tuberias de `transformers` con un modelo diminuto antes de escalar a modelos grandes.
- Analisis de sesgos en modelos pequenos monolingues: al ser entrenado con 10 MB de una sola lengua, es un caso de estudio controlado de los sesgos que introduce un corpus tan reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, perplejidad u otras), y la busqueda web realizada no ha devuelto informacion relevante sobre este modelo: los resultados obtenidos son consultas no relacionadas sobre Neo4j, controladores JDBC y variables de entorno de Maven.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en fp32, unos 80 MB en fp16/bf16, unos 40 MB en int8 y unos 20 MB en 4 bits. Cifras calculadas a partir de los 39,09 millones de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU funciona, incluida una GTX 1050 o una iGPU moderna; tambien es viable en CPU, ya que el modelo cabe en memoria principal sin dificultad.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en Raspberry Pi y telefonos de gama media, dado el tamano del modelo.
- Opciones de despliegue: `transformers` (pipeline de generacion), servidores compatibles con la API de text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se realiza manualmente, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles. Como estimacion orientativa, en GPU moderna la generacion deberia situarse en el rango de decenas a cientos de tokens por segundo, y en CPU en el rango de unidades a decenas de tokens por segundo, pero son valores sin confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed455 | 39.087.104 | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tune SFT sobre Goldfish hindi 10 MB |
| goldfish-models/hin_deva_10mb | mismo orden (es el modelo base) | no disponible | no disponible | HuggingFace | Modelo monolingue original sin ajuste SFT |
| openai-community/gpt2 | 124 millones | 1.024 tokens | MIT | Ampliamente disponible | Referencia GPT-2 en ingles; mayor tamano, pero no entrenado en hindi |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de muy baja escala (39 millones de parametros) entrenado con un corpus de 10 MB: la coherencia, la factualidad y la capacidad de seguir instrucciones complejas seran muy limitadas.
- Riesgo elevado de alucinacion y de generacion de texto repetitivo o gramaticalmente incorrecto, especialmente fuera de la lengua y el registro del corpus de entrenamiento.
- Idiomas soportados no declarados: el alcance real puede reducirse al hindi en devanagari y a restos de ingles del tokenizador de GPT-2.
- Licencia no disponible: la model card solo indica `licence: license`, sin texto legal. No se puede asumir uso comercial permitido.
- Repositorio sin validacion de la comunidad (0 descargas, 0 likes) y con fecha de publicacion posterior a la de redaccion habitual de fichas; tratar cualquier uso en produccion con extrema cautela.
- No se documentan datos de entrenamiento, numero de tokens ni proceso de alineacion, lo que impide auditar sesgos o procedencia de datos.
- Posible sobreajuste al corpus pequeno y a la plantilla de chat mostrada en el ejemplo; el comportamiento fuera de esa plantilla es impredecible.
- Ausencia total de benchmarks publicados, por lo que no hay garantia medida de calidad en ninguna tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Organizacion Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/dq65eh5z
