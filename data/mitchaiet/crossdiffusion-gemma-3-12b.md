# mitchaiet/crossdiffusion-gemma-3-12b

## Resumen

CrossDiffusion Gemma 3 12B es un paquete de pesos de inferencia publicado por el usuario mitchaiet (proyecto CrossDiffusion) para una tarea muy concreta: resolver crucigramas. No se trata de un modelo entrenado desde cero, sino de un derivado del checkpoint google/gemma-3-12b-it sobre el que se ha aplicado un adaptador LoRA de correccion denominado CrossDiffusion. El repositorio incluye el checkpoint base completo (unos 23 GB) y el adaptador LoRA (unos 1 GB), y ambos son necesarios para ejecutar el sistema: el adaptador por si solo no es funcional.

La aplicacion que lo consume lee una imagen o un PDF de crucigrama, detecta la cuadricula y las pistas, y despues pide al modelo que rellene un primer borrador. El modelo predice letras enmascaradas sobre toda la cuadricula en pasadas repetidas y va revelando las celdas en las que tiene mayor confianza. Opcionalmente, un agente LLM independiente (no incluido en este repositorio) revisa y corrige ese borrador. Se trata, por tanto, de un modelo de nicho orientado a un pipeline especifico, no de un modelo conversacional generalista.

El paquete se publica bajo licencia Gemma (no MIT, aunque el codigo de la aplicacion si lo sea), con fecha de creacion del repositorio en octubre de 2026. El propio autor advierte de que no se conserva el corpus de entrenamiento, ni el estado del optimizador, ni un informe de evaluacion con conjunto de validacion retenido para este adaptador de 12B; la verificacion mediante hashes SHA-256 solo garantiza que los ficheros publicados coinciden con la copia del despliegue original, no que la precision resolviendo crucigramas sea buena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 3 12B IT, con adaptador LoRA de correccion (aproximacion de difusion iterativa sobre letras enmascaradas) |
| Parametros totales | 12B en el checkpoint base (el adaptador LoRA anade aproximadamente 1 GB de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 12B IT, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use, incluida la seccion 3.2 y la Prohibited Use Policy) |
| Formato de pesos | safetensors (checkpoint base + adaptador LoRA), con SHA256SUMS para verificacion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint google/gemma-3-12b-it, un transformer decoder-only instruido de 12.000 millones de parametros. Sobre ese checkpoint se aplica un adaptador LoRA entrenado especificamente para una tarea de correccion iterativa: el modelo recibe la cuadricula del crucigrama con letras enmascaradas, predice esas posiciones en varias pasadas sucesivas y expone como definitivas unicamente las celdas con mayor confianza. No se especifica en la model card si se trata de un esquema de difusion discreta en el sentido estricto ni como se definio la funcion de perdida.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el adaptador. El autor indica explicitamente que el paquete preserva el checkpoint de inferencia y no el corpus original de entrenamiento ni el estado del optimizador. La unica garantia tecnica ofrecida es la verificacion criptografica de los 20 ficheros empaquetados mediante SHA-256.

## Capacidades

- Rellenado de cuadriculas de crucigrama: predice letras enmascaradas sobre el conjunto completo de la cuadricula en pasadas repetidas, revelando de forma progresiva solo las celdas con confianza alta.
- Generacion de un primer borrador completo del crucigrama a partir de la cuadricula detectada y las pistas extraidas.
- Capacidades heredadas de Gemma 3 12B IT en la medida en que el adaptador LoRA no las haya desplazado: comprension de lenguaje, generacion de texto y razonamiento general basico.
- Integracion en un pipeline con OCR y extraccion de texto de PDF, aunque esas funciones residen en la aplicacion y no en el modelo.
- Revision externa opcional mediante un agente LLM separado, que no forma parte de este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso dentro del modelo: no disponible.
- Soporte multilingue declarado: no disponible (sin confirmar en la model card).
- Modo thinking o vision nativo: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de primeros borradores de crucigramas en una aplicacion de resolucion asistida: el modelo recibe la cuadricula y las pistas y produce un relleno inicial que el usuario o un agente revisor puede corregir despues. Es su caso de uso disenado y unico documentado.
- Digitalizacion de crucigramas en papel o PDF: combinado con el OCR de la aplicacion, permite convertir un crucigrama escaneado en una cuadricula resuelta parcialmente y lista para revision humana.
- Pipeline de edicion y correccion en dos etapas: el modelo genera el borrador y un LLM externo (por ejemplo, via API de Nebius) revisa las respuestas de baja confianza, reduciendo el coste de computo frente a resolver todo con el modelo grande.
- Herramienta educativa o de entrenamiento para resolver crucigramas: el sistema puede usarse para proponer letras y pistas parciales en entornos de aprendizaje de vocabulario, siempre que se acepte la supervision humana por las limitaciones de precision declaradas.
- Investigacion sobre decodificacion iterativa con modelos de lenguaje: el componente de difusion sobre letras enmascaradas es un caso de estudio interesante para quien trabaje en generacion no autoregresiva aplicada a restricciones cruzadas.
- Evaluacion comparativa de adaptadores LoRA sobre modelos base grandes: al publicar base y adaptador por separado, permite reproducir experimentos de adaptacion de bajo rango sobre Gemma 3 12B con una tarea objetiva y medible.
- Prototipos de integracion con agentes externos: la arquitectura descrita, con un modelo de borrador y otro de revision, sirve como plantilla para experimentar con patrones de verificacion en dos fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el paquete no incluye un informe de evaluacion retenido para este adaptador de 12B y que la metodologia de evaluacion del proyecto (accuracy por letra, por palabra, tasa de resolucion completa del crucigrama, tasa de relleno, calibracion de confianza, tiempo y coste) esta definida en la documentacion de la aplicacion, pero que los resultados del modelo actual todavia requieren una ejecucion separada sobre un conjunto retenido. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de crucigramas.

## Requisitos de hardware

- VRAM estimada para inferencia: el despliegue verificado usa una RTX PRO 6000 con 96 GB de VRAM, suficiente para el checkpoint base completo en precision de entrenamiento mas el adaptador LoRA.
- GPU recomendadas: RTX PRO 6000 (96 GB) como referencia de despliegue verificado. Para el checkpoint de 12B en precision completa o bf16 se requieren entorno de 24-48 GB o mas; no se documentan pruebas en A100 o H100 especificas.
- Compatibilidad con GPU de consumo: no confirmada. El autor indica que el checkpoint de 12B no funciona en el cargador MPS actual del proyecto sobre un Mac de 16 GB. En cuantizacion a 4 bits un 12B podria caber en GPUs de 12-16 GB, pero no hay soporte ni validacion documentados para este adaptador en ese formato.
- Opciones de despliegue: servidor propio del proyecto CrossDiffusion (`python -m training.serve`) con PyTorch 2.11.0+cu130, Transformers 5.1.0, PEFT 0.18.1, Accelerate 1.13.0 y SentencePiece. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas validadas.
- Latencia y throughput estimados: no disponibles. El proceso de rellenado requiere pasadas repetidas sobre la cuadricula, lo que incrementa el coste de inferencia frente a una generacion autoregresiva simple, pero no se aportan cifras.
- Requisitos adicionales: vision fallback, chat abierto y revision final con LLM necesitan una clave de API de Nebius que no se incluye en el repositorio. El OCR local y la extraccion de texto de PDF no la necesitan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrossDiffusion Gemma 3 12B | 12B + LoRA (~1 GB) | no disponible | no disponible (sin evaluacion retenida) | Gemma Terms of Use | Publico en HuggingFace |
| google/gemma-3-12b-it | 12B | el declarado por Gemma 3 (consultar model card oficial) | ampliamente documentado por Google | Gemma Terms of Use | Publico en HuggingFace |
| Alternativas especializadas en resolucion de crucigramas | no disponible | no disponible | no disponible | no disponible | no disponible |

Unicamente puede establecerse una comparacion directa con el checkpoint base google/gemma-3-12b-it, del que este modelo deriva y cuya licencia hereda. No se dispone de informacion sobre otros modelos o adaptadores equivalentes orientados especificamente a la resolucion de crucigramas, por lo que esa parte de la comparativa queda como no disponible.

## Limitaciones y advertencias

- No existe un informe de evaluacion con conjunto retenido publicado: el autor reconoce explicitamente que la verificacion SHA-256 solo acredita que los ficheros coinciden con la copia del despliegue, no que el modelo resuelva crucigramas con precision.
- El paquete conserva unicamente el checkpoint de inferencia; no incluye el corpus de entrenamiento, el estado del optimizador ni las condiciones exactas del entrenamiento, lo que dificulta auditar sesgos o reproducir resultados.
- La precision final depende de dos fuentes de error externas al modelo: el OCR puede leer mal la cuadricula y las pistas, y las pistas incorrectas arrastran errores en todo el rellenado.
- El adaptador LoRA no es suficiente por si solo: hace falta descargar tambien el checkpoint base de aproximadamente 23 GB.
- El codigo de la aplicacion se publica bajo licencia MIT, pero eso no se aplica a los pesos: el uso y la redistribucion del modelo quedan sujetos a los Gemma Terms of Use, incluida la seccion 3.2 de restricciones de uso y la Prohibited Use Policy incorporada.
- El repositorio de la aplicacion en GitHub es privado en el momento de redactar esta ficha, por lo que las instrucciones de despliegue requieren acceso concedido.
- El despliegue verificado depende de versiones muy concretas de PyTorch (2.11.0+cu130), Transformers (5.1.0), PEFT (0.18.1) y Accelerate (1.13.0), y de una GPU de 96 GB de VRAM; otros entornos necesitan verificacion propia de compatibilidad.
- No se declaran los idiomas soportados ni la longitud de contexto efectiva, lo que impide garantizar su comportamiento en crucigramas en idiomas distintos del usado en el desarrollo.
- El modelo no es un asistente conversacional generalista: esta optimizado para una tarea de rellenado de cuadriculas y su comportamiento fuera de ese dominio no esta documentado.
- No se declara ningun regimen de cuantizacion validado (GGUF, GPTQ, AWQ), lo que limita su uso en hardware de gama de consumo.
- Existe riesgo de alucinacion en la prediccion de letras, inherente al esquema de rellenado por confianza; la calibracion de esa confianza no ha sido evaluada publicamente.
- CrossDiffusion no esta afiliado a Google ni cuenta con su respaldo, segun declara el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mitchaiet/crossdiffusion-gemma-3-12b
- Repositorio de la aplicacion CrossDiffusion (privado, requiere acceso): https://github.com/mitchaiet/crossdiffusion
- Metodologia de evaluacion del proyecto: https://github.com/mitchaiet/crossdiffusion/blob/master/docs/EVALUATION.md
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de la CLI de HuggingFace: https://huggingface.co/docs/huggingface_hub/en/guides/cli
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos por la busqueda corresponden a sitios sin relacion con el proyecto.
