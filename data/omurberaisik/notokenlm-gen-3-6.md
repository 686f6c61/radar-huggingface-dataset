# omurberaisik/NoTokenLM-Gen-3.6

## Resumen

NoTokenLM-Gen-3.6 es un modelo de generacion de texto de 13.874.556 parametros desarrollado por el usuario omurberaisik dentro de la familia NoTokenLM. Su rasgo definitorio es que prescinde por completo de un vocabulario de subpalabras: no hay BPE ni tokenizador entrenado, sino una conversion directa de bytes UTF-8 a identificadores y viceversa. La arquitectura es un transformer decoder-only de 12 capas con d_model=320, entrenado desde cero (from scratch) sobre una mezcla de texto educativo, Wikipedia, cuentos sencillos y texto de estilo manual, en ingles y frances.

El checkpoint publicado corresponde al paso 13.000 de un preentrenamiento de aproximadamente 0,85 GB de texto, y los pesos liberados son la media movil exponencial (EMA) de ese paso, no los pesos crudos. La mejor perdida de validacion registrada fue de 0,8915 nats por byte (unos 1,29 bits por byte). Se trata de un modelo exclusivamente preentrenado, sin ajuste por instrucciones, por lo que no responde a preguntas ni mantiene conversaciones.

Su relevancia es fundamentalmente de investigacion: sirve como banco de pruebas para estudiar modelado a nivel de byte sin tokenizador, arquitecturas pequenas con trucos de estabilizacion (QK-norm, value residual, puertas de salida por cabeza) y evaluacion de coherencia a escala reducida. No compite con modelos de proposito general y su model card lo declara explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only a nivel de byte; 12 capas, d_model=320; RoPE, RMSNorm, SwiGLU, convolucion de entrada corta, QK-norm, value residual y puertas de salida por cabeza |
| Parametros totales | 13.874.556 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las secuencias de entrenamiento usan 1.024 bytes, lo que sugiere una ventana de 1.024 bytes, pero la model card no lo confirma de forma explicita) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles y frances |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo de arquitectura propio (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que opera directamente sobre bytes UTF-8. La capa de entrada incorpora una convolucion corta sobre la secuencia de bytes, y el bloque transformer combina RoPE para la codificacion posicional, RMSNorm para la normalizacion, SwiGLU como activacion en la red feed-forward y varios mecanismos de estabilizacion poco habituales en modelos de este tamano: QK-norm, value residual y puertas de salida por cabeza. El repositorio incluye el codigo de arquitectura, por lo que la carga exige `trust_remote_code=True`; el `AutoTokenizer` que se distribuye es solo un mapeo fino byte-a-id para que el modelo cargue por la via estandar de Hugging Face.

El entrenamiento es un preentrenamiento desde cero de 13.000 pasos con batch de 16, acumulacion de gradiente de 4 y secuencias de 1.024 bytes, lo que suma aproximadamente 0,85 GB de texto visto. La tasa de aprendizaje maxima fue 1e-3 con 500 pasos de warmup y weight decay de 0,1. Los datos cubren texto web educativo, Wikipedia, cuentos simples y material tipo manual, en ingles y frances. No hubo ajuste por instrucciones, RLHF ni DPO. El checkpoint publicado son los pesos EMA del paso 13.000.

## Capacidades

- Generacion de texto a nivel de byte en ingles y frances, con continuaciones breves de frases y parrafos sencillos.
- Escritura de oraciones gramaticalmente correctas: en la evaluacion de 1.000 prompts, el 99,5 % de las salidas fueron gramaticalmente validas.
- Coherencia local: el 78,0 % de las 1.000 generaciones evaluadas se clasificaron como plenamente coherentes (gramatica correcta y sentido mantenido, con personajes, objetos y pronombres consistentes).
- Manejo de texto narrativo simple: cuentos, descripciones de escenas y continuaciones de frases con personajes y objetos.
- Procesamiento de texto sin tokenizador: entrada y salida en bytes UTF-8 crudos, sin vocabulario de subpalabras.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No realiza matematicas, respuesta a preguntas ni conversacion, y la propia model card lo indica de forma explicita.

## Casos de uso

- Investigacion sobre modelado a nivel de byte: permite estudiar como se comporta un transformer sin vocabulario de subpalabras en un regimen de ~14M de parametros, comparando la perdida en bits por byte frente a modelos con BPE.
- Experimentacion con arquitecturas pequenas: el uso combinado de QK-norm, value residual y puertas de salida por cabeza en un modelo diminuto lo convierte en un banco de pruebas para medir el efecto de cada componente en la estabilidad del entrenamiento.
- Generacion de continuaciones narrativas simples: puede completar frases de cuentos infantiles o descripciones breves, util para prototipos de generacion de texto en ingles y frances sin requisitos de computo.
- Aumento de datos para tareas de texto sencillo: generar variaciones de frases cortas para preentrenar o aumentar conjuntos de datos pequenos en ingles o frances.
- Docencia y divulgacion: el tamano reducido (0,1 GB de repositorio) y el notebook interactivo incluido permiten ejecutar el modelo y explicar el funcionamiento interno de un transformer en un aula o taller.
- Pruebas de despliegue en entornos con recursos minimos: al ocupar decenas de MB en coma flotante de 32 bits, es viable experimentar con inferencia en CPU, dispositivos de borde o entornos sin GPU.
- Evaluacion de metodologias de evaluacion de coherencia: el repositorio incluye las etiquetas de las 1.000 generaciones (`gen36_13000_1000_test_outputs.json`), lo que permite reproducir y auditar el protocolo de evaluacion por categorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion documentada es un test de coherencia sobre 1.000 prompts con temperatura 0,5, top-k 40 y 35 bytes nuevos por generacion:

| Categoria | Definicion | Recuento | Porcentaje |
|---|---|---|---|
| Plenamente coherente | Gramatica correcta y sentido mantenido; personajes, objetos y pronombres consistentes | 780 | 78,0 % |
| Gramatica correcta, significado roto | Oraciones bien formadas pero con desajuste de pronombre/genero, no secuitor o inconsistencia de objetos | 215 | 21,5 % |
| Gramatica rota | Colapso de la estructura de la oracion, repeticion atascada o clausula malformada | 5 | 0,5 % |

De los 215 casos de la categoria intermedia, 112 corresponden a desajustes de pronombre o genero. El resultado global de correccion gramatical es del 99,5 %. Las etiquetas fueron asignadas por un unico anotador segun la model card. La mejor perdida de validacion del entrenamiento fue de 0,8915 nats por byte (aproximadamente 1,29 bits por byte).

## Requisitos de hardware

- VRAM estimada para inferencia: en coma flotante de 32 bits, los 13,87M de parametros ocupan aproximadamente 55 MB; en coma flotante de 16 bits, unos 28 MB. A esto hay que sumar el coste de activaciones y el buffer KV, que a esta escala es minimo.
- GPU recomendadas: cualquier GPU es suficiente. No se requiere A100, H100 ni RTX 4090; una GPU integrada o incluso la CPU es suficiente para inferencia.
- Cabe holgadamente en GPU de consumo: si, en cualquier modelo actual (GTX 1050 o superior, cualquier RTX, e incluso en dispositivos integrados).
- Opciones de despliegue: al requerir `trust_remote_code=True` y codigo de arquitectura propio, el despliegue esta pensado para `transformers` en PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles (la model card no proporciona medidas de latencia ni de tokens o bytes por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.6 | 13,87M | no disponible (entrenado con secuencias de 1.024 bytes) | Byte-level sin tokenizador, mezcla amplia (texto educativo, Wikipedia, cuentos) | Apache 2.0 | Hugging Face |
| NoTokenLM Gen-4.5 | no disponible | no disponible | Byte-level sin tokenizador, entrenado solo con cuentos infantiles | no disponible | Hugging Face (misma familia) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona Gen-4.5, un modelo de la misma familia entrenado exclusivamente con texto de cuentos infantiles, frente a la mezcla amplia de Gen-3.6. No se aportan parametros ni resultados comparables de Gen-4.5, y no se dispone de informacion sobre otros modelos de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta un analisis de sesgos; el modelo se entreno con texto web y enciclopedico sin filtrado descrito, por lo que puede reproducir sesgos presentes en esas fuentes.
- Riesgo de alucinacion y falta de coherencia: el 21,5 % de las generaciones evaluadas mantiene la gramatica pero rompe el significado, y algo mas de la mitad de esos casos son desajustes de pronombre o genero.
- Sin ajuste por instrucciones: no responde a preguntas, no sigue ordenes y no mantiene conversaciones; no debe usarse como asistente.
- Limitaciones de contexto: no se confirma la longitud de contexto soportada; los ejemplos de entrenamiento usan 1.024 bytes, lo que limita la generacion a fragmentos muy cortos.
- Limitaciones de idioma: solo ingles y frances; no hay soporte declarado de castellano ni de otros idiomas.
- Capacidades ausentes: sin tool calling, sin uso como agente, sin vision, sin audio y sin modo de razonamiento.
- Dependencia de codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo Python distribuido con el repositorio; conviene revisarlo antes de usarlo en produccion.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo carece de las capacidades necesarias para la mayoria de aplicaciones comerciales reales.
- Adopcion marginal: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa ni comunidad de usuarios.
- Madurez: es un experimento de preentrenamiento desde cero, no un modelo listo para produccion; no hay garantias de mantenimiento ni de versionado futuro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6
- Notebook interactivo incluido en el repositorio: [`notebook.ipynb`](https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6/blob/main/notebook.ipynb)
- Etiquetas de las 1.000 generaciones evaluadas: [`gen36_13000_1000_test_outputs.json`](https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6/blob/main/gen36_13000_1000_test_outputs.json)
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a una plataforma de marketing por correo electronico), por lo que no se incluyen papers, blogs ni demos adicionales.
