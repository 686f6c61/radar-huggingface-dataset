# mradermacher/Uni-MuMER-Qwen3-VL-4B-GGUF

## Resumen

Uni-MuMER-Qwen3-VL-4B-GGUF es la distribucion en formato GGUF del modelo Uni-MuMER-Qwen3-VL-4B, un modelo vision-lenguaje de 4.022 millones de parametros especializado en reconocimiento optico de matematicas manuscritas (HMER, Handwritten Mathematical Expression Recognition) y conversion a LaTeX. El modelo original lo desarrolla el usuario phxember y esta construido sobre la arquitectura Qwen3-VL, mientras que esta version cuantizada la publica mradermacher, un conocido distribuidor de cuantizaciones GGUF para llama.cpp.

El modelo resuelve un problema muy concreto: transcribir expresiones matematicas escritas a mano en imagenes a codigo LaTeX estructurado, una tarea tradicionalmente resuelta con pipelines especializados (deteccion de simbolos, segmentacion de trazos, gramaticas) y que aqui se aborda de forma end-to-end mediante un modelo vision-lenguaje. Su tamano de 4B parametros y las cuantizaciones disponibles (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB) lo hacen desplegable en hardware de consumo.

La relevancia actual radica en que combina tres elementos: un modelo base moderno (Qwen3-VL), un dominio de aplicacion muy especifico con demanda real (digitalizacion de apuntes y documentos cientificos manuscritos) y una licencia Apache 2.0 permisiva para uso comercial. Esta ficha se centra en la version GGUF, que es la que permite inferencia local eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL (no se detalla la configuracion interna) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; versiones i1 (imatrix) en repo separado |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el codificador visual) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. En el formato GGUF, el componente visual se distribuye como fichero `mmproj` independiente (disponible en Q8_0 y f16), que debe cargarse junto con los pesos del modelo de lenguaje para habilitar la entrada de imagenes. El modelo original pesa 4,02 B parametros y se distribuye bajo licencia Apache 2.0.

Los detalles sobre el entrenamiento no estan disponibles en la informacion proporcionada: no se especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente referencia el dataset `phxember/Uni-MuMER-Data` como corpus de entrenamiento y etiqueta el modelo con `uni-mumer`, `hmer`, `math-ocr`, `handwritten-math` y `latex`, lo que indica una especializacion en reconocimiento de matematicas manuscritas y su transcripcion a LaTeX. No se documentan innovaciones tecnicas especificas (decodificacion especulativa, attention linear, etc.) en la informacion disponible.

## Capacidades

- Reconocimiento optico de expresiones matematicas manuscritas (HMER) a partir de imagenes.
- Conversion de formulas y ecuaciones a codigo LaTeX.
- Procesamiento de entrada multimodal (imagen + texto) mediante el codificador visual Qwen3-VL.
- Generacion de texto conversacional en el marco del modelo base Qwen3-VL.
- Capacidad multilingue limitada: la model card declara unicamente ingles (`en`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de apuntes manuscritos de matematicas: el modelo recibe fotografias o escaneos de cuadernos y devuelve LaTeX listo para compilar, eliminando la transcripcion manual de ecuaciones. Es adecuado por su especializacion HMER y su tamano contenido.
- Conversion de pizarras y notas de clase a material digital: a partir de una foto de pizarra, generar LaTeX que se pueda incorporar a documentos academicos o wikis. La cuantizacion Q4_K_M (2,6 GB) permite ejecutarlo en un portatil.
- Extraccion de formulas en articulos cientificos escaneados: procesar figuras o fragmentos con ecuaciones manuscritas y obtener representaciones LaTeX reutilizables en editores como Overleaf.
- Herramienta de accesibilidad para estudiantes: transcribir formulas escritas a mano a texto estructurado para lectores de pantalla o para personas con dificultades motoras que dictan o escriben a mano.
- Pipeline de datos para entrenamiento de modelos matematicos: usar el modelo para anotar grandes volumenes de imagenes con expresiones matematicas y generar pares imagen-LaTeX que alimenten otros sistemas.
- Asistente de correccion de ejercicios: integrar el modelo en una aplicacion educativa que reciba la resolucion manuscrita de un problema y la convierta a LaTeX para su evaluacion automatica o comparacion con la solucion de referencia.
- Despliegue en entornos sin conectividad: gracias a las cuantizaciones GGUF y a la licencia Apache 2.0, puede ejecutarse en local (llama.cpp, Ollama) en escenarios con requisitos de privacidad o sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el mmproj):
  - Q2_K: ~1,8 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,0-2,3 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,4-2,6 GB
  - Q5_K_S / Q5_K_M: ~2,9-3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
- Hay que sumar el fichero mmproj del codificador visual: ~0,6 GB (Q8_0) o ~0,9 GB (f16).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM o mas puede ejecutar las cuantizaciones Q4-Q5; una RTX 3060/4060 de 8 GB es suficiente para Q4_K_M + mmproj. Para Q8_0 o f16 se recomienda 8-12 GB de VRAM (RTX 4070/4080, RTX 3090, A100, H100).
- Cabe en GPU consumer: si, desde GPUs de 4-6 GB con cuantizaciones Q2-Q3, y comodamente en 8 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y cualquier runtime compatible con GGUF que soporte modelos multimodales con mmproj. La model card tambien menciona compatibilidad con `transformers` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas. A continuacion se ofrece una comparacion estructural basica con modelos de la misma categoria (vision-lenguaje de ~4B orientados a OCR/documentos), marcando como "no disponible" los datos que no se conocen:

| Modelo | Parametros | Contexto | Licencia | Especializacion | Formato |
|---|---|---|---|---|---|
| Uni-MuMER-Qwen3-VL-4B (esta ficha) | 4,02 B | no disponible | Apache 2.0 | HMER / matematicas manuscritas a LaTeX | GGUF, safetensors |
| Qwen3-VL-4B (base) | ~4 B | no disponible | no disponible | Vision-lenguaje general | safetensors, GGUF |
| Alternativas de OCR matematico especializado | no disponible | no disponible | no disponible | HMER | no disponible |

La comparacion con modelos especificos de HMER (por ejemplo, sistemas basados en Posformer, CoMER o similares) no puede realizarse con los datos disponibles, ya que no se han publicado resultados de benchmarks para este modelo en la informacion consultada.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el rendimiento en otros idiomas (incluido el castellano) no esta documentado y podria degradarse.
- Especializacion estrecha: el modelo esta afinado para HMER y matematicas manuscritas; su comportamiento en tareas generales de vision-lenguaje puede ser inferior al del Qwen3-VL base sin afinar.
- Riesgo de alucinacion: como todo modelo generativo, puede producir LaTeX sintacticamente valido pero incorrecto respecto a la imagen de entrada, especialmente con formulas ambiguas, simbolos poco frecuentes o caligrafia dificil. Se recomienda validacion humana o compilacion del LaTeX generado en produccion.
- Ausencia de benchmarks publicados: no hay datos verificables de precision (por ejemplo, tasas de error de edicion en HMER) en la informacion disponible, lo que impide garantizar umbrales de calidad.
- Contexto: la longitud de contexto no esta documentada; no se debe asumir una ventana grande para documentos con muchas imagenes o conversaciones largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente la precision en tareas de OCR fino; para produccion se recomienda Q4_K_M o superior.
- Necesidad del fichero mmproj: sin cargar el mmproj correspondiente, el modelo no procesa imagenes; es un error comun en despliegues GGUF.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL y del dataset de entrenamiento antes de un despliegue comercial.
- Fecha de creacion futura (2026-04-14) en los metadatos: conviene tratar las fechas con cautela al evaluar la madurez del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3-VL-4B-GGUF
- Modelo base (original): https://huggingface.co/phxember/Uni-MuMER-Qwen3-VL-4B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Uni-MuMER-Qwen3-VL-4B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/phxember/Uni-MuMER-Data
- Pagina de descargas del autor: https://hf.tst.eu/model#Uni-MuMER-Qwen3-VL-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
