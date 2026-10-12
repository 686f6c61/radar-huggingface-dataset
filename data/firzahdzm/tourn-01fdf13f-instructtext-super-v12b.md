# firzahdzm/tourn-01fdf13f-instructtext-super-v12b

## Resumen

El modelo firzahdzm/tourn-01fdf13f-instructtext-super-v12b es un modelo de lenguaje publicado en HuggingFace por el usuario firzahdzm. Segun los pesos reales almacenados en safetensors, cuenta con 2.516.756.480 parametros, es decir, aproximadamente 2,52 mil millones, y el repositorio ocupa 5,0 GB. La etiqueta "llama" del repositorio apunta a una arquitectura transformer de tipo Llama, y el sufijo "instruct" del nombre sugiere un ajuste por instrucciones, aunque no hay documentacion que lo confirme.

La ficha publica esta practicamente vacia: no se declara pipeline, licencia, idiomas ni longitud de contexto, y el autor no ha publicado model card, paper ni datos de entrenamiento. Con 11 descargas y 0 likes en el momento de la consulta, se trata de un artefacto sin validacion comunitaria. El nombre "tourn-01fdf13f" tiene pinta de identificador autogenerado por un pipeline automatico de entrenamiento o fusion de modelos, no de una denominacion comercial o de investigacion.

Por su tamano, el interes practico esta en el extremo opuesto a los modelos frontier: es candidato a inferencia local en GPU de consumo, ajuste fino ligero y prototipado de bajo coste. Ahora bien, la ausencia total de licencia, idiomas y benchmarks hace que su uso en produccion requiera verificacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (segun la etiqueta "llama" del repositorio); configuracion exacta no disponible |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 11 / 0 |
| Fecha de creacion (metadato) | 2026-10-12 |
| Fecha de actualizacion (metadato) | 2026-10-12 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta "llama" del repositorio, que situa al modelo en la familia de transformers decoder-only con atencion causal y normalizacion RMSNorm, tokenizador BPE y disposicion de pesos compatible con el ecosistema Llama. No se ha publicado la config.json, por lo que se desconocen el numero de capas, la dimension oculta, el numero de cabezas de atencion y de cabezas KV, el vocabulario y la ventana de contexto. Tampoco hay informacion sobre si se aplicaron tecnicas como GQA, atencion con ventana deslizante o decodificacion especulativa.

Sobre el entrenamiento no hay ningun dato: se desconocen el volumen de tokens, la composicion del dataset, si hubo preentrenamiento desde cero, continuacion de preentrenamiento, SFT, DPO o RLHF. El sufijo "instruct" y el fragmento "instructtext" del nombre sugieren ajuste supervisado sobre instrucciones, pero es una inferencia a partir del nombre, no un dato verificado. El unico indicio cuantitativo es el tamano del repositorio: 5,0 GB para 2,52 mil millones de parametros equivale a unos 2 bytes por parametro, lo que encaja con un guardado en FP16 o BF16 y descarta que el repositorio incluya variantes cuantizadas adicionales.

## Capacidades

- Generacion de texto e instrucciones: plausible por el sufijo "instruct" del nombre, pero no confirmado por documentacion del autor.
- Razonamiento multi-paso, matematicas y generacion de codigo: no disponible; no hay benchmarks ni ejemplos publicados.
- Tool calling o function calling: no disponible; sin plantilla de chat publicada no puede confirmarse el formato de llamada a herramientas.
- Soporte de agentes y planificacion multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Vision, audio o multimodalidad: no disponible; las etiquetas solo mencionan safetensors y llama.
- Modo "thinking" o razonamiento explicito: no disponible.
- Relleno de plantilla (infilling / FIM): no disponible.

## Casos de uso

- Asistente conversacional local en equipos sin GPU dedicada: con 2,52 mil millones de parametros, el modelo cabe en CPU o en iGPU si se convierte a cuantizaciones de 4 u 8 bits, lo que permite desplegar un chatbot de escritorio sin enviar datos a la nube, siempre que el integrador verifique primero la licencia.
- Prototipado rapido de pipelines de NLP: por su tamano reducido, sirve como modelo de prueba para validar plantillas de prompt, cadenas de LangChain o LlamaIndex antes de migrar a un modelo mayor y mas caro.
- Clasificacion y extraccion de informacion estructurada: tareas de etiquetado de texto, extraccion de entidades o conversion de texto libre a JSON con un ajuste fino ligero, ya que un modelo de 2,5B es entrenable con LoRA en una sola GPU de consumo.
- Generacion de texto de bajo coste en lotes grandes: resumenes, reescritura, generacion de descripciones de producto o respuestas cortas donde el coste por token y el throughput importan mas que la calidad punta.
- Base para ajuste fino de dominio: al ser pequeno, permite entrenar adaptadores especificos (legal, sanitario, atencion al cliente) en hardware modesto, con ciclos de iteracion de horas en lugar de dias.
- Componente de un sistema mayor como modelo "pequeno" de enrutado: puede usarse para decidir si una consulta requiere un modelo mayor, clasificar intenciones o generar borradores que despues revisa un modelo de mas capacidad.
- Investigacion sobre destilacion y fusion de modelos: el nombre autogenerado y la ausencia de documentacion lo convierten en un objeto de estudio para analizar artefactos producidos por pipelines automaticos.
- Experimentos de cuantizacion comparada: util como banco de pruebas para medir degradacion de calidad al pasar de FP16 a 8, 4 y 3 bits, dado su tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre incidencias de cuentas de Instagram y no guardan relacion alguna con este repositorio).

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 5,1 GB solo para los pesos, mas la cache KV y las activaciones; en la practica, entre 6 y 8 GB para un contexto corto y lotes pequenos.
- VRAM estimada en FP32: aproximadamente 10,1 GB solo para los pesos, opcion poco recomendable.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5 a 3,5 GB incluyendo overhead.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,4 a 2,5 GB, con margen para contexto adicional.
- Cache KV: no se puede calcular con precision sin la config.json (numero de capas, cabezas KV y dimension de cabeza). En modelos de este rango suele ser de decenas a unos pocos cientos de MB por cada 8.000 tokens en FP16, por lo que conviene medirla en el hardware objetivo.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10). En cuantizacion de 4 bits cabe en GPUs de 4 a 6 GB (GTX 1650, RTX 3050, T4).
- Cabe en GPU de consumo: si, y es uno de sus principales atractivos. Tambien cabe en CPU con 8 GB de RAM en cuantizacion de 4 bits.
- Opciones de despliegue: al estar etiquetado como arquitectura Llama, previsiblemente es compatible con llama.cpp, Ollama, vLLM, Text Generation Inference, Transformers con bitsandbytes y llama-cpp-python, siempre que la arquitectura real coincida con la de la familia Llama y exista una plantilla de chat definida por el usuario.
- Latencia y throughput: no disponible. No hay mediciones publicadas y el rendimiento dependera de la GPU, la cuantizacion, el tamano de lote y la longitud de contexto, que ademas se desconoce.
- Almacenamiento: 5,0 GB en disco para los pesos originales en safetensors; menos de 2 GB en una cuantizacion de 4 bits.

## Comparativa con modelos similares

Los datos de la columna de este modelo son los verificados en el repositorio; los de los modelos de comparacion provienen de su documentacion publica y se incluyen como referencia de categoria, no como evaluacion directa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| firzahdzm/tourn-01fdf13f-instructtext-super-v12b | 2,52 B | no disponible | no disponible | HuggingFace (11 descargas) |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, muy extendido |
| Qwen 2.5 3B Instruct | 3,09 B | 32.768 tokens nativos (hasta 131.072 con YaRN) | Apache 2.0 | HuggingFace, muy extendido |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy extendido |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K) para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En los tres casos de referencia existen variantes cuantizadas oficiales y no oficiales en GGUF, AWQ y GPTQ que no estan publicadas para este repositorio.

## Limitaciones y advertencias

- Ausencia de licencia declarada: juridicamente es el riesgo mas grave. Sin licencia explicita no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Cualquier despliegue en produccion requiere contactar con el autor o descartar el modelo.
- Documentacion inexistente: no hay model card, config.json publica, plantilla de chat ni instrucciones de uso. El integrador tendra que inspeccionar los ficheros del repositorio para deducir la arquitectura y el formato de prompt.
- Longitud de contexto desconocida: sin este dato no puede garantizarse el comportamiento en conversaciones largas ni en tareas de recuperacion aumentada con documentos extensos.
- Idiomas no declarados: se desconoce si el modelo esta entrenado predominantemente en ingles, en castellano o en varios idiomas, lo que afecta directamente a su calidad fuera del idioma de entrenamiento.
- Riesgo de alucinacion: los modelos de ~2,5B parametros tienen tasas de factualidad notablemente inferiores a los de 7B o mas. No es adecuado para tareas que exijan precision factual sin verificacion externa o recuperacion documental.
- Sesgos: no evaluados ni documentados. Al desconocerse el corpus de entrenamiento, no puede descartarse la presencia de sesgos de genero, raza, religion o ideologicos.
- Sin validacion comunitaria: 11 descargas y 0 likes implican que no hay retroalimentacion de terceros, casos de exito reproducidos ni auditorias independientes.
- Metadatos anomalos: la fecha de creacion registrada es 2026-10-12, posterior a la fecha de consulta esperada, lo que sugiere una generacion automatica del repositorio o un error en los metadatos. Conviene tratarlo como senal de falta de curaduria manual.
- Nombre autogenerado: el identificador "tourn-01fdf13f" apunta a un pipeline automatico (torneo de modelos, fusion o busqueda de hiperparametros) sin trazabilidad de la receta de entrenamiento, lo que dificulta reproducir o auditar el resultado.
- Sin garantias de compatibilidad: aunque la etiqueta indique "llama", si la configuracion real difiere, las herramientas estandar (llama.cpp, vLLM) pueden fallar al cargar los pesos.
- No apto para decisiones criticas: sanidad, asesoria legal, diagnostico o cualquier uso con consecuencias significativas queda fuera de su ambito razonable dado el desconocimiento total sobre su entrenamiento y evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/firzahdzm/tourn-01fdf13f-instructtext-super-v12b
- Paper: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo; los enlaces recuperados correspondian a foros sobre incidencias de cuentas de Instagram y no se incluyen por no ser relevantes.
