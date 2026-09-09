# paulgp85/econ-ai-detector-distilroberta-v3

## Resumen

`econ-ai-detector-distilroberta-v3` es un clasificador de texto binario desarrollado por paulgp85 que separa prosa escrita por humanos de prosa generada por modelos de lenguaje en el ambito de la economia. Se trata de una version fine-tuned de `distilroberta-base` sobre un conjunto de papers de trabajo del NBER y articulos de revistas economicas pre-2020, comparados con pasajes espejo generados por LLM. El modelo es la mitad neuronal de un ensemble v3 publicado en GitHub, que ademas incorpora una etapa de normalizacion, ventanas de 250 palabras y una regla de clasificacion a nivel de documento.

El modelo esta pensado para detectar si un texto economico ha sido escrito o asistido por IA. Es relevante ahora porque la adopcion de LLM en la redaccion academica ha crecido rapidamente, y la deteccion de textos generados por IA se ha convertido en una necesidad para editores, revisores y organismos de evaluacion. La arquitectura es un encoder-only de tipo DistilRoBERTa con aproximadamente 82 millones de parametros, y su ventana de trabajo en la practica es de 250 palabras (maximo 384 tokens). El modelo esta entrenado con un enfoque adversario y tres rondas de hard negatives, y reporta tasas de falso positivo muy bajas en textos humanos de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilRoBERTa-base (encoder-only) |
| Parametros totales | 82.119.938 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se usa con ventanas de 250 palabras, maximo 384 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `distilroberta-base`, un transformer encoder-only con 82M parametros que mantiene el rendimiento de RoBERTa-base con menor coste computacional. Al ser un modelo de clasificacion, no incluye decodificador ni mecanismos de generacion autoregresiva. Se entrena mediante fine-tuning con una cabecera de clasificacion de dos clases (`humano` vs `LLM`) y produce logits que el ensemble utiliza como margen `logits[1] - logits[0]`.

El entrenamiento combina aproximadamente 7.000 papers NBER y articulos de revista anteriores a 2020 (clase "humano") con unos 5.000 pasajes espejo generados por Qwen3.6-35B, mas espejos adversarios y negativos dificiles extraidos de tres rondas de refuerzo. No se utilizo ningun paper NBER posterior a 2022 en el conjunto de entrenamiento, para evitar contaminacion con textos que pudieran haber sido generados o asistidos por IA. La documentacion del autor insiste en que el clasificador por si solo satura en softmax, por lo que debe usarse el margen de logits y calibrarse sobre texto humano conocido del propio registro.

## Capacidades

- Clasificacion binaria de prosa academica en ingles: distingue entre texto economico escrito por humanos y texto generado por LLM.
- Deteccion a nivel de documento mediante el ensemble: la paqueteria GitHub aplica normalizacion (digitos reemplazados por ceros), ventanas de 250 palabras, "prose gate" y una regla de clasificacion a nivel de paper.
- Tasas de falso positivo calibradas en documentos: el autor reporta 0.00% de FPR a nivel de paper en un subconjunto de papers pre-2020, 0.06% en articulos de revista 2020-2024 y 0.17% en 599 papers NBER de 2022.
- Capacidad de flagging de documentos generados por LLM en 2026: el modelo marca un 13.4% de los NBER papers de 2026.
- No es generativo: no produce texto, solo puntua la probabilidad de origen humano o automatico en cada ventana.
- Sin soporte de tool calling, function calling, agentes o razonamiento multipaso: su uso es puramente como clasificador de texto.

## Casos de uso

- Revision editorial de trabajos de economia: el modelo puede integrarse en el flujo de trabajo de una revista para filtrar manuscritos que probablemente hayan sido generados por LLM, especialmente en la fase de revision previa.
- Auditoria de papers del NBER: gracias a la calibracion especifica en NBER, permite estimar la proporcion de papers de un corpus reciente que contienen prosa generada por IA.
- Control de calidad en plataformas de preprints: el modelo puede anadir una puntuacion automatica de "riesgo de generacion por IA" a cada preprint economico, facilitando la revision humana prioritaria.
- Investigacion sobre adopcion de IA en economia: permite construir datasets etiquetados de texto humano vs LLM en el registro especifico de la economia, lo que alimenta estudios sobre el impacto de la IA en la produccion cientifica.
- Deteccion en documentos de trabajo internos de instituciones: bancos centrales o think tanks pueden aplicar el modelo a borradores de informes para revisar compliance en la redaccion asistida por modelos.
- Pipeline de evaluacion de modelos de lenguaje: sirve como componente de evaluacion adversarial para medir si un LLM economico es capaz de emular texto humano en papers de trabajo, reforzando los datos de entrenamiento del propium modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card ofrece datos de calibracion del ensemble, que se recogen a continuacion:

| Metrica | Valor |
|---|---|
| FPR a nivel de paper (shard pre-2020, held-out) | 0.00% |
| FPR en articulos de revista 2020-2024 | 0.06% |
| FPR en 599 papers NBER de 2022 | 0.17% |
| Tasa de flagging en NBER papers de 2026 | 13.4% |

Estos datos corresponden a la configuracion del ensemble con la mitad de regresion logistica, regla k=2 y objetivo de FPR del 0.1%. El clasificador aislado no debe utilizarse directamente sin calibrar sobre textos humanos del proprio dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 0.3 GB de memoria; para una sola pasada con ventanas de 250 palabras, bastan menos de 1 GB de VRAM. En fp16 o cuantizacion int8, la huella seria menor.
- GPU recomendadas: cualquier GPU moderna con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o similar permite procesar lotes de ventanas con total fluidez.
- El modelo cabe sin problemas en hardware de consumidor, incluso en CPU de gama alta si se usa con conversion a ONNX o cuantizacion.
- Opciones de despliegue: inferencia directa con `transformers` (como en el ejemplo del README), exportacion a ONNX o Servidor con TGI para peticiones HTTP de clasificacion. vLLM no esta optimizado para clasificadores encoder-only, pero puede servir peticiones con adaptados.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Por su tamano (82M) se espera una latencia de pocos milisegundos por ventana en GPU, aunque el dato no esta publicado.

## Comparativa con modelos similares

No disponible en la informacion proporcionada. No se han encontrado comparaciones con detectores alternativos de texto generado por IA, ni referencias a modelos comparables en la busqueda web realizada.

## Limitaciones y advertencias

- El clasificador aislado el softmax se satura: la model card advierte que hay que usar el margen de logits y recalibrar sobre textos humanos conocidos del propio registro, no fiarse de la probabilidad cruda de salida.
- Entrenamiento limitado al registro economico: los datos de entrenamiento provienen de NBER y revistas de economia pre-2020, por lo que la generalizacion a otros dominios (medicina, derecho, ciencias sociales) es dudosa.
- Ningun paper NBER de 2022 en adelante fue usado en el entrenamiento: esto es intencional para evitar contaminacion, pero tambien implica que el modelo no ha visto la evolucion del lenguaje academico reciente.
- Riesgo de falsos positivos en textos con alta automaticidad: textos humanos que siguen patrones muy formales o que usan estructuras repetitivas podrian ser clasificados como generados por LLM si no se calibra correctamente.
- Limitacion de idioma: solo soporta ingles; no se puede aplicar directamente a prosa economica en otras lenguas.
- La licencia Apache-2.0 permite uso comercial y modificaciones, pero el autor recomienda usar la paqueteria completa de GitHub para obtener los resultados previstos; no se garantiza el comportamiento al aplicar el modelo fuera de este pipeline.
- No es un modelo generativo: no puede producir texto, solo clasificar; no aplica riesgo de alucinacion como en los LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/paulgp85/econ-ai-detector-distilroberta-v3
- Repositorio del ensemble (GitHub): https://github.com/paulgp/econ-ai-detector
- Paper de referencia: Goldsmith-Pinkham (2026), *The Missing AI Paper Boom* (sin URL publica en la informacion proporcionada)
