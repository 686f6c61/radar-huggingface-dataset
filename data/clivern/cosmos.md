# clivern/cosmos

## Resumen

Cosmos es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el desarrollador clivern, publicado en HuggingFace bajo licencia MIT. Se trata de un modelo muy pequeno, con 5.273.088 parametros totales (aproximadamente 5,27 millones), especializado en la generacion de texto en ingles sobre tematicas de astronomia y cosmologia. Su corpus de entrenamiento procede de libros de dominio publico sobre el cielo y los astros, lo que le confiere un vocabulario tematico muy concreto pero tambien un alcance muy limitado.

La arquitectura es un decoder estilo GPT-2 con solo 4 capas, 4 cabezas de atencion y un tamano oculto de 256, con una longitud de contexto de unicamente 256 tokens. Emplea un tokenizador BPE a nivel de byte con un vocabulario de 8000 entradas y fue entrenado con el objetivo clasico de prediccion del siguiente token, alcanzando una perdida de validacion final de 6,171.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como ejemplo reproducible de entrenamiento from-scratch, como linea base de modelos minimos y como material para experimentar con despliegue en hardware muy limitado. No esta pensado para responder preguntas factuales ni para uso en produccion, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo GPT-2 (4 capas, 4 cabezas, hidden size 256) |
| Parametros totales | 5.273.088 (aprox. 5,27 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo decoder-only inspirada en GPT-2, pero reducida a su minima expresion: 4 capas, 4 cabezas de atencion y un tamano de representacion oculta de 256. El tokenizador es un BPE a nivel de byte con un vocabulario de 8000 tokens, y el objetivo de entrenamiento es la prediccion autorregresiva del siguiente token. No se documenta el uso de tecnicas como atencion lineal, decodificacion especulativa ni variantes hibridas SSM.

Los datos de entrenamiento consisten en libros de dominio publico sobre astronomia y cosmologia, en ingles, lo que define un dominio tematico estrecho. No se especifica el numero exacto de tokens procesados ni la composicion detallada del dataset, y tampoco se documenta la aplicacion de RLHF, DPO u otras fases de alineacion posteriores al preentrenamiento. El unico metrica reportada es la perdida de validacion final, 6,171, y la configuracion completa de entrenamiento se publica en el archivo `train_config.json` del repositorio.

## Capacidades

- Generacion de texto autorregresiva en ingles con `model.generate`, tal y como muestra el ejemplo de la model card.
- Continuacion de prompts relacionados con astronomia, cosmologia y temas celestes, dado el sesgo tematico del corpus.
- Prediccion del siguiente token y muestreo con parametros como `top_p` y `do_sample`, utiles para experimentacion sobre decodificacion.
- Capacidad de ser cargado directamente con la libreria `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades especiales (modo thinking, vision, audio ni otras modalidades).

## Casos de uso

- Docencia y aprendizaje sobre transformers: por su tamano minimo, el modelo se puede cargar, inspeccionar y modificar en un portatil para explicar el funcionamiento interno de un decoder estilo GPT-2 sin necesidad de GPU.
- Reproduccion de un pipeline de entrenamiento from-scratch: sirve como referencia para validar scripts propios de tokenizacion, preprocesado y bucle de entrenamiento con la configuracion publicada en `train_config.json`.
- Linea base (baseline) en experimentos de investigacion: al ser un modelo de 5,27 M de parametros, permite medir mejoras relativas frente a modelos mayores o frente a variantes del mismo tamano con arquitecturas alternativas.
- Experimentos de decodificacion y muestreo: con contexto de 256 tokens, es adecuado para estudiar como afectan `temperature`, `top_p` y `top_k` a la diversidad y coherencia de la salida en modelos muy pequenos.
- Despliegue en hardware restringido o en el borde: sus 5,27 M de parametros permiten ejecutarlo en CPU, en un solo nucleo o incluso en dispositivos embebidos, como prueba de concepto de inferencia local.
- Punto de partida para fine-tuning de dominio: dada su licencia MIT, puede ajustarse sobre corpus especializados distintos para explorar transferencia de un dominio cientifico a otro.
- Generacion de texto tematico de caracter divulgativo o creativo: puede producir fragmentos con vocabulario astronomico, siempre bajo supervision humana y sin asumir veracidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion final de 6,171, obtenida en el propio corpus de entrenamiento. No se proporcionan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21 MB en fp32 y unos 10,5 MB en fp16, calculados a partir de los 5.273.088 parametros y sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es mas que suficiente; incluso las integradas modernas pueden ejecutarlo. No se necesita una A100 ni una H100.
- Cabe en cualquier GPU de consumo: si, incluidas NVIDIA GTX serie 10, RTX serie 20/30/40, y tambien en CPU sin aceleracion.
- Opciones de despliegue: `transformers` de forma nativa; tambien es compatible con `text-generation-inference` segun las etiquetas del repositorio. Otros runners como llama.cpp u Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones. Por el tamano del modelo, la latencia en CPU deberia ser de milisegundos por token, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| clivern/cosmos | 5,27 M | 256 | MIT | Entrenado desde cero, dominio astronomia/cosmologia, solo ingles, sin benchmarks publicados |
| distilgpt2 | 82 M | 1024 | Apache 2.0 | Modelo destilado de GPT-2, proposito general, ampliamente evaluado |
| gpt2 | 124 M | 1024 | MIT | Modelo base de OpenAI, proposito general, referencia habitual en experimentos |

La comparativa se limita a alternativas de proposito general de tamano reducido, ya que no se han encontrado en la informacion proporcionada otros modelos especificos de astronomia y cosmologia de este tamano. Cosmos es entre 15 y 23 veces mas pequeno que estas alternativas y tiene un contexto cuatro veces menor, por lo que no es directamente comparable en calidad de generacion general.

## Limitaciones y advertencias

- Perdida de validacion elevada (6,171): la calidad de la generacion es baja y es probable que la salida sea repetitiva o incoherente.
- Riesgo alto de alucinacion: el autor advierte explicitamente que el modelo no es adecuado para responder preguntas factuales.
- Corpus de entrenamiento muy limitado: solo libros de dominio publico sobre astronomia y cosmologia, lo que reduce su utilidad fuera de ese dominio.
- Ventana de contexto muy corta (256 tokens): no soporta conversaciones multi-turno largas ni documentos extensos.
- Solo ingles: no se documenta soporte de otros idiomas.
- Sesgos conocidos: no se documentan evaluaciones de sesgo, pero cualquier modelo entrenado sobre textos historicos de dominio publico puede reflejar sesgos presentes en esas fuentes.
- Uso comercial: la licencia MIT permite uso comercial, pero el propio autor lo limita a fines de investigacion y educacion por su baja calidad.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento que respalde su uso en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clivern/cosmos
- Configuracion de entrenamiento: archivo `train_config.json` dentro del propio repositorio (https://huggingface.co/clivern/cosmos/blob/main/train_config.json)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
