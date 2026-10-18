# DrJohnCode/NebulaText

## Resumen

NebulaText (publicado como `DrJohnCode/NebulaText`, con el nombre comercial "NebulaText-125M-Demo") no es un modelo de lenguaje neuronal. Es un repositorio educativo que contiene una cadena de Markov a nivel de palabra entrenada sobre un corpus sintetico minimo, acompanada de dos scripts (`train.py` y `generate.py`) y una tabla de conteos de transiciones en JSON. El propio autor lo declara explicitamente en la model card: el "125M" es solo branding, no existen pesos preentrenados de 125 millones de parametros, no hay resultados de benchmarks y las supuestas innovaciones arquitectonicas (Orbit Memory Routing y Adaptive Token Folding) son ficcion conceptual, no estan implementadas.

El problema que resuelve es, por tanto, muy acotado: servir como ejemplo ejecutable de configuracion de un repositorio en Hugging Face, como material de tutorial sobre generacion de texto estadistica y como plantilla para experimentar con tablas de transiciones construidas a partir de un corpus propio en texto plano. No requiere dependencias de terceros (solo Python 3.9+) y su salida es reproducible mediante semilla.

Su relevancia actual es documental y didactica, no tecnica: resulta util para entender la diferencia entre un generador estadistico de n-gramas/palabras y un LLM real, y como caso de estudio de model cards que declaran limitaciones de forma honesta. Cualquier evaluacion de capacidades linguisticas, razonamiento o codigo queda fuera de su alcance por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de Markov a nivel de palabra (generador estadistico; no es transformer ni red neuronal) |
| Parametros totales | no disponible (N/A: no hay parametros neuronales; la model card indica "Neural parameter count: N/A") |
| Parametros activos | no aplica (no es MoE ni red neuronal) |
| Longitud de contexto | no disponible (no aplica: el prompt actua como semilla de palabras, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | en (ingles; corpus sintetico de demostracion) |
| Licencia | MIT |
| Formato de pesos | Tabla de conteos de transiciones en JSON (`transitions.json`); no son pesos neuronales |
| Tipo de modelo (pipeline) | text-generation (etiqueta del repositorio) |
| Descargas / likes | 24 descargas, 1 like |
| Fecha de creacion / actualizacion | 2026-10-18 / 2026-10-18 |
| Dependencias | Python 3.9+, sin dependencias de terceros |

## Arquitectura y entrenamiento

La implementacion es una cadena de Markov de primer orden (o de orden configurable segun el corpus) sobre palabras: se construye un diccionario que mapea cada palabra a las palabras que la suceden y sus frecuencias, y la generacion muestrea la siguiente palabra a partir de la distribucion condicionada por la anterior. `train.py` recorre un fichero de texto plano y emite ese diccionario de conteos a `transitions.json`; `generate.py` lo carga y produce texto palabra a palabra dado un prompt semilla, un limite de palabras nuevas (`--max-new-words`) y una semilla aleatoria (`--seed`). No hay descenso de gradiente, tokenizador subword, atencion ni estado recurrente aprendido.

El "entrenamiento" se limita al corpus sintetico incluido (`corpus.txt`), de un punado de frases de ejemplo, y es reproducible y determinista dado un seed. La model card describe dos componentes ficticios, Orbit Memory Routing (enrutador de contexto recurrente) y Adaptive Token Folding (optimizacion de computo), que se presentan como concepto hipotetico sin implementacion ni medicion empirica. No se han publicado datos sobre volumen de tokens, composicion del dataset, RLHF, DPO ni ninguna otra etapa de alineamiento, porque no existen.

## Capacidades

- Generacion de texto palabra a palabra mediante muestreo de una tabla de transiciones, con salida reproducible fijando `--seed`.
- Entrenamiento de una tabla de transiciones propia a partir de un fichero de texto plano local (`python train.py --input corpus.txt --output transitions.json`).
- Ejecucion sin dependencias externas: solo requiere Python 3.9 o superior, sin PyTorch, sin `transformers`, sin GPU.
- Inspeccion educativa del mecanismo: la tabla JSON es legible y permite trazar por que se genera cada palabra.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento encadenado.
- No tiene modo "thinking", vision, audio ni ninguna modalidad adicional.
- No es multilingue: el unico idioma declarado es el ingles del corpus de ejemplo.
- No realiza ninguna funcion de LLM: no responde preguntas, no resume, no traduce, no escribe codigo.

## Casos de uso

- Docencia sobre modelos de lenguaje estadisticos: usar `train.py` y `generate.py` en un aula o tutorial para mostrar empiricamente que una cadena de Markov produce texto localmente plausible pero globalmente incoherente, y contrastarlo despues con un LLM real.
- Creacion de una tabla de transiciones a partir de un corpus propio: sustituir `corpus.txt` por un texto del dominio del alumno o del proyecto (por ejemplo, titulares o dialogos) y observar como cambia la distribucion de salida.
- Demostracion de configuracion de repositorios en Hugging Face: el repositorio sirve como plantilla de estructura minima (model card, `config.json`, `LICENSE`, scripts y datos) para quien publique su primer repositorio.
- Ejercicio de evaluacion critica de model cards: analizar un caso en el que el nombre comercial ("125M") no corresponde con el contenido real y discutir que verificaciones debe hacer un revisor antes de adoptar un modelo.
- Generacion de texto de relleno no factual para pruebas de interfaz: prototipos de UI que necesitan cadenas de palabras con forma de frase, sin riesgo de que el contenido se interprete como informacion veraz (siempre que se etiquete como sintetico).
- Pruebas de humo en pipelines de publicacion: validar el flujo de descarga, empaquetado y documentacion de un repositorio antes de sustituirlo por un modelo neuronal real.
- Experimentos controlados de reproducibilidad: al ser determinista con semilla y sin no determinismo de GPU, sirve como linea base trivial en pruebas de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay pesos preentrenados ni reivindicaciones de rendimiento empirico, por lo que no existe MMLU, HumanEval, GSM8K ni ninguna otra metrica que reportar.

## Requisitos de hardware

- VRAM: no aplica; el script se ejecuta en CPU.
- GPU: no se requiere ninguna GPU (ni RTX 4090, ni A100, ni H100). Cualquier CPU capaz de ejecutar Python 3.9+ es suficiente.
- RAM: no se especifica el tamano exacto de `transitions.json` ni del corpus; el autor lo describe como una tabla de conteos pequena propia de una demostracion.
- Despliegue: ejecucion directa con `python generate.py`; no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no existen pesos neuronales que cargar ni formato GGUF/safetensors. Tampoco es cargable mediante `transformers.from_pretrained`, pese a la etiqueta `text-generation` del repositorio.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de una consulta a un diccionario en memoria, la latencia esperada por palabra es del orden de microsegundos, pero es una estimacion no verificada, no un dato del autor.
- Almacenamiento: no disponible.

## Comparativa con modelos similares

No existe una comparativa tecnica valida: NebulaText no es un modelo de lenguaje neuronal y situarlo frente a LLM pequenos seria un error de categoria. Se incluye la tabla solo para dejar constancia de la diferencia, con datos de referencia publica de los otros modelos que no proceden de la busqueda realizada.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NebulaText | N/A (sin pesos neuronales) | no aplica | Cadena de Markov de palabras | MIT | Repositorio HF con scripts y JSON |
| GPT-2 small (referencia) | 124 M | 1024 tokens | Transformer decoder | Licencia MIT modificada | Pesos publicos |
| TinyLlama-1.1B (referencia) | 1,1 B | 2048 tokens | Transformer decoder | Apache-2.0 | Pesos publicos |

Advertencia: los datos de GPT-2 small y TinyLlama son cifras de conocimiento publico general y no han sido verificados en la busqueda web asociada a esta ficha. NebulaText no compite en ninguna de sus dimensiones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no razona, no responde preguntas factuales, no escribe codigo ni sigue instrucciones. La model card lo prohibe explicitamente para generacion en produccion, QA factual y decisiones medicas o financieras.
- El nombre "125M" es branding y no corresponde con ningun recuento de parametros. Cualquier referencia a un modelo de 125 millones de parametros en este repositorio es incorrecta.
- La salida puede ser repetitiva o sin sentido, ya que proviene de conteos sobre un corpus sintetico muy pequeno y de una cadena de Markov sin modelado de dependencias de largo alcance.
- Riesgo de alucinacion en sentido estricto no aplica, pero si de generar afirmaciones falsas con apariencia de frase: el texto no tiene grounding y no debe presentarse como informacion veraz.
- Sesgos: no evaluados. El corpus es sintetico y en ingles, por lo que cualquier sesgo presente en los datos de ejemplo se reproducira sin filtro.
- Idioma: unicamente ingles; no hay soporte multilingue ni garantia de comportamiento con texto en castellano.
- No dispone de filtros de seguridad, moderacion ni evaluacion de robustez; el autor lo declara sin propiedades verificadas de seguridad o exactitud.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero eso no convierte al artefacto en adecuado para produccion.
- Los componentes Orbit Memory Routing y Adaptive Token Folding son ficcion; no deben citarse como contribuciones tecnicas ni como resultados de investigacion.
- No esta afiliado a NVIDIA, Hugging Face ni a ningun laboratorio de IA, pese a la posible confusion que sugiera el nombre del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DrJohnCode/NebulaText
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada; los resultados devueltos (consultas sobre G-Sync, pronunciacion de la letra "g" y Google Classroom) no guardan relacion con el modelo y se descartan.
