# mradermacher/Qwen2.5-VL-7B-HyperClick-GGUF

## Resumen

Qwen2.5-VL-7B-HyperClick-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo SeerRay-Lab/Qwen2.5-VL-7B-HyperClick, publicada por el usuario mradermacher bajo licencia Apache 2.0. El modelo original es un ajuste de Qwen2.5-VL-7B orientado a GUI grounding (localizacion de elementos de interfaz a partir de capturas de pantalla) con calibracion de confianza y entrenamiento mediante aprendizaje por refuerzo, segun indican las etiquetas del repositorio y la referencia al articulo arXiv:2510.27266.

El repositorio no introduce cambios en los pesos mas alla de la cuantizacion: su proposito es facilitar la ejecucion local del modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio), ofreciendo desde Q2_K (3,1 GB) hasta f16 (15,3 GB), ademas de dos ficheros mmproj (proyector multimodal) en Q8_0 y f16 necesarios para procesar imagenes.

Con 7.615.616.512 parametros (unos 7,6 B) y un tamano total de repositorio de 70,4 GB, es relevante para desarrolladores que necesitan un agente visual capaz de operar interfaces graficas sin depender de APIs en la nube, en un rango de tamano que cabe en GPUs de 8-16 GB de VRAM con cuantizaciones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decodificador LLM Qwen2.5 + codificador de vision, con adaptacion HyperClick (GUI grounding) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base pertenece a la familia Qwen2.5-VL-7B, con ventana nativa de 128 000 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (unico idioma declarado en la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |
| Autor de la cuantizacion | mradermacher |
| Modelo base | SeerRay-Lab/Qwen2.5-VL-7B-HyperClick |
| Fecha de publicacion | 2026-10-05 |
| Descargas / likes | 163 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B: un transformer con un codificador de vision que procesa imagenes a resolucion nativa dinamica y un decodificador de lenguaje autorregresivo que consume los tokens visuales proyectados mediante un modulo mmproj. Sobre esta base, SeerRay-Lab ha aplicado un ajuste denominado HyperClick, cuyas etiquetas declaradas son gui-grounding (localizacion precisa de elementos de interfaz), confidence-calibration (estimacion calibrada de la confianza de la prediccion) y reinforcement-learning (pipeline declarado como reinforcement-learning en HuggingFace). El detalle metodologico concreto del ajuste no aparece en la model card de esta cuantizacion; la referencia indicada es el articulo arXiv:2510.27266.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni la secuencia exacta de tecnicas de alineacion (SFT, RLHF, DPO u otras). Tampoco se documenta ninguna innovacion de inferencia como decodificacion especulativa. La aportacion de este repositorio es exclusivamente la cuantizacion en GGUF (conversion de tipo hf, quantize_version 2, salida con tensores cuantizados), sin cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.

## Capacidades

- Comprension de imagenes y texto de forma conjunta (modelo multimodal): admite capturas de pantalla, fotografias y diagramas como entrada.
- GUI grounding: localizacion de elementos concretos de una interfaz (botones, campos, iconos) a partir de una instruccion en lenguaje natural y una imagen de pantalla.
- Calibracion de confianza: la adaptacion HyperClick esta orientada a producir estimaciones de confianza sobre las predicciones de localizacion, util para decidir cuando delegar en un humano.
- Razonamiento multi-paso orientado a agentes: el pipeline declarado es de aprendizaje por refuerzo, lo que sugiere entrenamiento para tareas secuenciales de interaccion con entornos.
- Generacion de texto conversacional en ingles.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion proporcionada (el modelo base Qwen2.5-VL si lo soporta, pero no se verifica aqui).
- Modo thinking o razonamiento explicito: no disponible.
- Capacidades de audio: no disponibles.
- Idiomas: unicamente ingles declarado.

## Casos de uso

- Automatizacion de escritorio (RPA visual): dado que el modelo localiza elementos de interfaz a partir de capturas, se puede integrar en un bucle de agente que recibe una screenshot, predice las coordenadas del control objetivo y ejecuta el clic mediante una libreria como pyautogui, sustituyendo a los localizadores por selectores fragiles.
- Testing de interfaz automatizado: generar y ejecutar comprobaciones end-to-end sobre aplicaciones web o de escritorio identificando visualmente los elementos del DOM, con la ventaja de funcionar tambien en aplicaciones sin acceso al arbol de accesibilidad.
- Asistentes de accesibilidad: ayudar a personas con dificultades motoras o visuales indicando donde pulsar en una pantalla, usando las etiquetas de calibracion de confianza para pedir confirmacion cuando la prediccion es dudosa.
- Agentes moviles o de quiosco: ejecucion local en dispositivos con GPU integrada o de gama media, al poder desplegarse en cuantizaciones Q4 de menos de 5 GB, sin enviar capturas de pantalla a servicios externos.
- Extraccion de datos de documentos e interfaces: transcripcion de formularios, tablas y pantallas de aplicaciones legacy a estructuras de datos, aprovechando las capacidades de vision del modelo base.
- Soporte tecnico de primer nivel con evidencia visual: el usuario envia una captura de un error o de un panel de configuracion y el modelo identifica el elemento relevante y propone la accion concreta.
- Investigacion en agentes GUI: banco de pruebas para comparar estrategias de grounding y calibracion de confianza, ejecutable en una unica GPU de consumo.
- Prototipado offline en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp u Ollama, permite procesar capturas de pantallas internas sin salida de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio de cuantizacion no incluye metricas (ScreenSpot, ScreenSpot-Pro, OSWorld, MMLU u otras). El articulo referenciado, arXiv:2510.27266, no se ha consultado como fuente en esta ficha, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM para los pesos (los ficheros son los publicados en el repositorio):
  - Q2_K: 3,1 GB
  - Q3_K_S: 3,6 GB; Q3_K_M: 3,9 GB; Q3_K_L: 4,2 GB
  - IQ4_XS: 4,4 GB; Q4_K_S: 4,6 GB; Q4_K_M: 4,8 GB
  - Q5_K_S: 5,4 GB; Q5_K_M: 5,5 GB
  - Q6_K: 6,4 GB
  - Q8_0: 8,2 GB
  - f16: 15,3 GB
- Proyector multimodal (obligatorio para entrada de imagen): mmproj-Q8_0 (1,0 GB) o mmproj-f16 (1,5 GB); hay que sumar este tamano al de los pesos.
- Presupuesto adicional: a los pesos hay que anadir la cache KV y la memoria de los tokens visuales, que crecen con la resolucion de la imagen y la longitud del contexto. Para una captura de pantalla tipica, es razonable reservar 1-3 GB extra segun la cuantizacion.
- GPUs recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (12-24 GB) para Q4 a Q8 con comodidad.
  - Gama de entrada: 8 GB de VRAM solo con cuantizaciones Q3/Q4 y contexto contenido.
  - Profesional: A100 40/80 GB, H100, L40S, sin limitaciones de cuantizacion (permite f16).
- CPU y RAM: las cuantizaciones Q4 a Q6 pueden ejecutarse parcial o totalmente en CPU con 8-16 GB de RAM libre, con latencia notablemente mayor.
- Opciones de despliegue: llama.cpp (soporta el formato GGUF y el par mmproj para vision), Ollama y LM Studio como envoltorios de llama.cpp. Para los pesos originales en safetensors se puede usar transformers y, potencialmente, vLLM con soporte de Qwen2.5-VL, aunque la informacion proporcionada no lo confirma para esta variante ajustada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo por inferencia en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-HyperClick (este modelo, via GGUF de mradermacher) | ~7,6 B | no especificado en la ficha; el base de la familia declara 128 000 tokens | Texto + imagen | apache-2.0 | Ajuste orientado a GUI grounding y calibracion de confianza; disponible en GGUF de Q2_K a f16 |
| SeerRay-Lab/Qwen2.5-VL-7B-HyperClick | ~7,6 B | no disponible | Texto + imagen | apache-2.0 | Modelo original en safetensors del que proceden estas cuantizaciones; mismos datos que el anterior sin compresion |
| Qwen2.5-VL-7B-Instruct | ~7,6 B | 128 000 tokens (nativo en la familia) | Texto + imagen | apache-2.0 | Alternativa generalista sin el ajuste HyperClick; no esta especializada en grounding de interfaces ni en calibracion de confianza |
| Agentes GUI de 7-8 B de la misma generacion (por ejemplo, variantes derivadas de Qwen2-VL/Qwen2.5-VL) | ~7-8 B | variable segun el modelo | Texto + imagen | habitualmente Apache 2.0 | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad, sin valoracion de rendimiento.

## Limitaciones y advertencias

- Idioma: la ficha declara unicamente ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Datos de entrenamiento no documentados en esta ficha: no se conocen la composicion del dataset, los sesgos potenciales derivados de capturas de interfaz (sesgo hacia interfaces en ingles, hacia determinados sistemas operativos o hacia disenos mayoritarios) ni el volumen de datos de ajuste.
- Riesgo de alucinacion en grounding: los modelos de localizacion visual pueden devolver coordenadas plausibles para elementos que no existen en la imagen. La calibracion de confianza declarada ayuda, pero no elimina este riesgo; en automatizacion real conviene validar la accion antes de ejecutarla.
- Ausencia de benchmarks publicados en el repositorio: no hay evidencia verificable en la informacion disponible sobre precision en ScreenSpot u otros conjuntos de evaluacion, por lo que no se recomienda desplegarlo en produccion sin una evaluacion propia.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma significativa, algo especialmente sensible en tareas de localizacion espacial precisa. Para grounding conviene Q4_K_M o superior.
- Dependencia del fichero mmproj: sin el proyector multimodal el modelo no procesa imagenes; hay que descargarlo y enlazarlo correctamente en llama.cpp u Ollama.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base y las de Qwen2.5-VL subyacente en la cadena de dependencias, asi como las obligaciones de atribucion.
- Fecha de publicacion futura respecto al momento de redaccion de muchas referencias habituales: verificar la vigencia de los enlaces y de las versiones de llama.cpp antes de desplegar, ya que el soporte de Qwen2.5-VL ha ido cambiando entre versiones.
- Repositorio con muy poca traccion (163 descargas, 0 likes): no hay senales de comunidad que respalden la calidad del ajuste.
- No hay confirmacion explicita de soporte de tool calling, modo de razonamiento ni contexto largo en esta variante; no asumir estas capacidades sin probarlas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-HyperClick-GGUF
- Modelo base: https://huggingface.co/SeerRay-Lab/Qwen2.5-VL-7B-HyperClick
- Articulo de referencia citado en las etiquetas: https://arxiv.org/abs/2510.27266
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-VL-7B-HyperClick-GGUF
- Guia general de uso de GGUF (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Resultado de busqueda relacionado (dataset de RL para VL, no vinculado directamente a este modelo): https://huggingface.co/datasets/OpenSearch-VL/Search-VL-RL-8K
