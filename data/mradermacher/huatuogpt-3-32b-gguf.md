# mradermacher/HuatuoGPT-3-32B-GGUF

## Resumen

HuatuoGPT-3-32B es un modelo de lenguaje especializado en el ambito medico, desarrollado originalmente por FreedomIntelligence, un grupo de investigacion de la Universidad China de Hong Kong (CUHK). El modelo parte de una base densa de 32 762 123 264 parametros (aproximadamente 32,8 mil millones) y esta afinado para razonamiento clinico, dialogo medico multi-turno y respuesta a preguntas de dominios sanitarios. Esta ficha documenta concretamente la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia locales.

La relevancia de esta publicacion radica en que traslada un modelo medico de 32B, originalmente distribuido en safetensors y pensado para GPUs de datacenter, a un formato portable con cuantizaciones desde Q2_K hasta Q8_0. Esto habilita su despliegue con llama.cpp, Ollama o interfaces compatibles con endpoints, algo especialmente util para prototipado, evaluacion e investigacion en contextos donde no se dispone de infraestructura de alto rendimiento.

El modelo esta publicado bajo licencia Apache 2.0 y declara soporte para ingles y chino. La model card del repositorio GGUF no detalla arquitectura interna ni datos de entrenamiento; esta ficha se limita a los datos verificables del repositorio y a las especificaciones deducibles de los ficheros publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla la variante exacta en la model card) |
| Parametros totales | 32 762 123 264 (32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; el modelo base esta en safetensors) |
| Modelo base | FreedomIntelligence/HuatuoGPT-3-32B |
| Cuantizador | mradermacher |
| Tamano del repositorio | 224,0 GB (incluye todas las cuantizaciones) |
| Etiquetas | medical, reasoning |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de que se trata de un transformer denso de 32,8 mil millones de parametros. No se especifican en la model card el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como decodificacion especulativa o atencion lineal. El modelo base pertenece a la familia HuatuoGPT-3 de FreedomIntelligence, orientada al dominio medico, pero los detalles de su preentrenamiento y ajuste fino (numero de tokens, composicion del corpus clinico, uso de RLHF o DPO) no estan recogidos en la informacion proporcionada.

Lo que si consta es el proceso de cuantizacion aplicado por mradermacher: se generan cuantizaciones estaticas con `quantize_version: 2` y `output_tensor_quantised: 1`, conversion de tipo `hf` a GGUF. Ademas, el autor publica un repositorio separado con cuantizaciones ponderadas por imatrix (https://huggingface.co/mradermacher/HuatuoGPT-3-32B-i1-GGUF), que suelen ofrecer mejor calidad que las cuantizaciones estaticas de tamano equivalente. La model card indica que no se omite el fichero mmproj (`skip_mmproj` vacio), lo que sugiere que el modelo base podria incluir componentes multimodales, aunque no se confirma su naturaleza ni su funcionamiento.

## Capacidades

- Generacion de texto y razonamiento en dominios medicos y sanitarios, segun las etiquetas `medical` y `reasoning` del repositorio.
- Dialogo conversacional multi-turno (tag `conversational`).
- Razonamiento clinico orientado a preguntas y respuestas medicas.
- Soporte bilingue declarado: ingles y chino.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite servir el modelo tras una API compatible con OpenAI.
- Capacidad de ejecucion local mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistente de triaje clinico en prototipos: el modelo puede gestionar conversaciones multi-turno en las que se recogen sintomas y antecedentes, y su ajuste en dominio medico lo hace adecuado para generar preguntas de seguimiento estructuradas antes de derivar a un profesional.
- Formacion y simulacion para estudiantes de medicina: con una cuantizacion Q4_K_M (~19,9 GB) se puede desplegar en una estacion de trabajo con una unica GPU de 24 GB para practicar entrevistas clinicas simuladas sin depender de servicios en la nube.
- Investigacion en NLP clinico: la licencia Apache 2.0 y la disponibilidad de pesos GGUF facilitan la reproduccion de experimentos y la evaluacion comparativa de modelos medicos en entornos controlados.
- Generacion de resumenes de historiales clinicos sinteticos: util en pipelines de investigacion donde se trabaja con datos anonimizados o generados, aprovechando el conocimiento de dominio del modelo.
- Atencion al paciente en mercados angloparlantes y sinofonos: su soporte declarado de ingles y chino permite desplegar interfaces de informacion sanitaria en ambos idiomas, siempre con supervision humana.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse localmente con llama.cpp u Ollama, los datos de salud no salen de la infraestructura de la organizacion, lo que resulta critico en contextos regulados como el RGPD.
- Evaluacion de cuantizaciones para produccion: la existencia de variantes Q2_K a Q8_0 e imatrix permite medir el compromiso entre calidad y VRAM antes de fijar una configuracion definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas del dominio medico (MedQA, MedMCQA, etc.), por lo que no se aportan cifras que no puedan verificarse.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~12,4 GB de pesos; con overhead de contexto, ~14-16 GB.
  - Q3_K_M: ~16,1 GB; ~18-20 GB con contexto.
  - Q4_K_M: ~19,9 GB; ~22-24 GB con contexto moderado. Es la opcion recomendada por el autor por su equilibrio velocidad/calidad.
  - Q5_K_M: ~23,3 GB; ~26-28 GB con contexto.
  - Q6_K: ~27,0 GB; ~30 GB con contexto.
  - Q8_0: ~34,9 GB; requiere ~38-40 GB.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) para Q3_K_M a Q4_K_M; RTX 5090 o configuraciones de 32 GB para Q5_K_M en adelante.
  - Profesional: A100 40 GB, A100 80 GB, H100 o L40S para Q6_K y Q8_0 con contexto largo.
- Cabe en GPU de consumo: si, al menos hasta Q4_K_M en GPUs de 24 GB. Las cuantizaciones Q6_K y Q8_0 requieren GPUs de 32 GB o superiores, o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), TGI (requiere conversion a safetensors) y servidores compatibles con endpoints OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependera del hardware, de la cuantizacion y del backend; como referencia general, un modelo denso de 32B en Q4_K_M sobre una RTX 4090 suele moverse en el orden de decenas de tokens por segundo, pero no se aporta una cifra verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato disponible |
|---|---|---|---|---|---|
| HuatuoGPT-3-32B (esta ficha) | 32,8B | No disponible | Medico | Apache 2.0 | GGUF (estatico e imatrix) |
| HuatuoGPT-3-32B (original, FreedomIntelligence) | 32,8B | No disponible | Medico | Apache 2.0 | Safetensors |
| Alternativas medicas de ~30B | No disponible | No disponible | Medico | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de contexto de modelos comparables del mismo segmento, por lo que la comparativa cuantitativa no puede completarse. La comparacion mas directa y verificable es entre esta version GGUF y el modelo original en safetensors: misma arquitectura y pesos, con la diferencia de que la version GGUF incluye 11 niveles de cuantizacion y un repositorio imatrix adicional.

## Limitaciones y advertencias

- Modelo especializado en dominio medico: no debe utilizarse como sustituto del juicio clinico profesional. Cualquier uso en atencion sanitaria real requiere supervision humana y validacion regulatoria.
- Riesgo de alucinacion elevado en un dominio donde los errores tienen consecuencias graves; las respuestas deben contrastarse con fuentes clinicas verificables.
- Sesgos conocidos: no documentados en la informacion disponible, pero al estar entrenado principalmente con datos en ingles y chino, puede presentar un sesgo cultural y linguistico hacia esas poblaciones.
- Limitaciones de idioma: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada: dificulta planificar casos de uso con documentos largos o historiales extensos.
- La cuantizacion degrada la calidad respecto al modelo original, especialmente en Q2_K y Q3_K; el autor recomienda Q4_K_M o superior para uso practico.
- La licencia Apache 2.0 permite uso comercial, pero el uso medico en produccion esta sujeto a regulaciones locales (MDR en la UE, FDA en EE. UU.) que exigen certificacion del sistema completo, no solo del modelo.
- El repositorio tiene un volumen de descargas bajo (142) y un unico like, lo que sugiere poca validacion comunitaria; conviene realizar evaluaciones propias antes de adoptarlo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HuatuoGPT-3-32B-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/HuatuoGPT-3-32B-i1-GGUF
- Modelo base original: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-32B
- Pagina de descargas del autor: https://hf.tst.eu/model#HuatuoGPT-3-32B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
