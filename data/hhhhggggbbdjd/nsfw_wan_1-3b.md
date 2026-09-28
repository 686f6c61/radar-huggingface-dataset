# Hhhhggggbbdjd/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b es un ajuste fino (*fine-tune*) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B, desarrollado por el usuario de HuggingFace Hhhhggggbbdjd y especializado en la generacion de contenido explicito para adultos. Se trata de un modelo de 1.300 millones de parametros con arquitectura transformer de difusion para texto-a-video, distribuido en formato safetensors y publicado bajo licencia CreativeML OpenRAIL-M. El repositorio ocupa 105,4 GB porque incluye decenas de checkpoints intermedios de dos ejecuciones de entrenamiento distintas.

El modelo parte del Wan2.1-T2V-1.3B de Wan-AI y anade aprendizaje sobre un corpus extraido de aproximadamente 1.250 subreddits de contenido para adultos (los 1.000 posts mas votados de cada uno), junto con un segundo conjunto de video de comunidades similares. La model card documenta dos esquemas de entrenamiento: uno original en dos fases (epocas 1-10 solo imagen, epocas 11-20 solo video) que sufrio un colapso de calidad anatomica, y una segunda ejecucion experimental con dataset mixto (30.000 clips de video y 20.000 imagenes simultaneamente) que el autor recomienda como sustituta.

Su relevancia es acotada pero concreta: es uno de los pocos ajustes T2V abiertos orientados explicitamente a contenido NSFW con movimiento nativo, sin necesidad de LoRAs auxiliares, y sirve como caso de estudio sobre los riesgos de *catastrophic forgetting* en pipelines de ajuste multimodal imagen+video. No se han publicado resultados de benchmarks, el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y su model card no documenta longitud de contexto, idiomas soportados ni cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-video (DiT), heredada de Wan2.1-T2V-1.3B |
| Parametros totales | 1.300 millones (1,3 B) en el modulo de difusion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo publica checkpoints en safetensors; no se documentan versiones GGUF, FP8 o INT8) |
| Idiomas soportados | no disponible (los prompts de entrenamiento siguen las convenciones de etiquetado en ingles de Reddit) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (un fichero por checkpoint) |
| Tarea | Text-to-Video (T2V) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Tamano del repositorio | 105,4 GB (incluye checkpoints experimentales y heredados) |
| Checkpoint recomendado por el autor | wan_1.3B_exp_e14.safetensors |
| Ficheros auxiliares | prompting-guide.json |
| Fecha de publicacion | 2026-09-28 (fecha declarada por el autor; no actualizada desde entonces) |

## Arquitectura y entrenamiento

La arquitectura es la del Wan2.1-T2V-1.3B original: un transformer de difusion (*diffusion transformer*) que opera en el espacio latente de un VAE de video y se condiciona con embeddings de texto procedentes del codificador T5 que acompana al modelo base. El autor no modifica la topologia ni documenta cambios estructurales; el trabajo se limita al ajuste fino de los pesos sobre datos NSFW. Esto implica que la longitud de contexto, la resolucion nativa de salida y el numero de fotogramas por clip vienen determinados por el modelo base, no por este ajuste, y no se detallan en la model card.

El entrenamiento se ejecuto en dos esquemas. El original fue bifasico: las epocas 1 a 10 se entrenaron principalmente con un gran dataset de imagenes NSFW y las epocas 11 a 20 exclusivamente con video, lo que otorgo coherencia temporal pero provoco un *catastrophic forgetting* severo de anatomia (rostros y manos), con artefactos descritos por el propio autor como "body horror". La degradacion de calidad se manifiesta ya a partir de la epoca 3. El segundo esquema, etiquetado como experimental, sustituye las dos fases por una unica ejecucion sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes presentadas simultaneamente, con *learning rate* mas conservador, *batch size* mas reducido y un calendario de entrenamiento mas corto, de modo que la regularizacion espacial continua evita la deriva anatomica. El autor genera asi los checkpoints `wan_1.3B_exp_e1` a `wan_1.3B_exp_e14` y recomienda el e14 para uso general y como base de entrenamiento de LoRAs. No se documenta uso de RLHF, DPO ni ningun otro metodo de alineacion; tampoco hay datos de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Generacion de video corto a partir de prompts de texto, con movimiento nativo y sin necesidad de LoRAs auxiliares de movimiento en los checkpoints de la serie heredada entrenada con video (e11-e20).
- Especializacion en contenido explicito para adultos: el corpus de ajuste cubre un espectro amplio de tematicas, estilos visuales, arquetipos de personaje y acciones descritas en lenguaje natural.
- Coherencia temporal: el entrenamiento con video aporta consistencia entre fotogramas y reduce el parpadeo entre frames.
- Fidelidad espacial en la serie experimental: los checkpoints `exp_*` entrenados con dataset mixto mejoran la calidad de rostros, manos y anatomia respecto a la serie original.
- Capacidad de servir como base para entrenamiento de LoRAs adicionales, segun recomienda el propio autor.
- No se documenta soporte de *tool calling*, *function calling*, uso agentico ni razonamiento multi-paso: es un modelo generativo de video, no un modelo de lenguaje instruido.
- No se documenta capacidad multilingue, entrada de imagen (*image-to-video*), control por pose o audio.

## Casos de uso

- Produccion de contenido para plataformas de video para adultos: el modelo genera clips cortos a partir de descripciones textuales, lo que permite a estudios pequenos producir material de catalogo sin rodaje ni reparto.
- Previsualizacion de *storyboards* en productoras de contenido adulto: convertir un guion en un clip de referencia para validar encuadre, vestuario y secuencia de acciones antes de invertir en produccion real.
- Entrenamiento de LoRAs de estilo o de personaje: el checkpoint `exp_e14` esta pensado explicitamente por el autor como base para ajustes posteriores, de modo que un estudio puede partir de el para especializar un estilo propio.
- Investigacion sobre sesgos y representacion en generacion de contenido adulto: el modelo permite estudiar que arquetipos, cuerpos y practicas dominan un corpus derivado de Reddit y como se reproducen en la salida generada.
- *Red-teaming* y construccion de clasificadores de contenido: disponer de un generador NSFW abierto facilita crear conjuntos de datos sinteticos etiquetados para entrenar y evaluar filtros de moderacion automatica.
- Auditoria de olvido catastrofico en ajuste multimodal: el historial de entrenamiento documentado (fases separadas frente a dataset mixto) lo convierte en un caso reproducible para estudiar la perdida de conocimiento espacial al entrenar con video.
- Prototipado de pipelines de difusion de video en local: al ser un modelo de 1,3 B, permite iterar sobre integraciones con Diffusers o ComfyUI en hardware de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, VBench ni similares) ni comparaciones cuantitativas con el modelo base Wan2.1-T2V-1.3B u otros ajustes NSFW. La unica evaluacion documentada es cualitativa y procede del propio autor, que describe la serie experimental como superior a la heredada en calidad espacial y ausencia de artefactos anatomicos.

## Requisitos de hardware

- Las cifras de esta seccion son estimaciones derivadas del numero de parametros y del tamano del repositorio, no datos publicados por el autor.
- Cada checkpoint en safetensors ocupa aproximadamente 3 GB, segun el tamano total del repositorio (105,4 GB) repartido entre las dos series de epocas.
- El modulo de difusion de 1,3 B requiere unos 2,6 GB en FP16/BF16 y unos 5,2 GB en FP32. A eso hay que sumar el codificador de texto T5 del pipeline Wan2.1 (varios miles de millones de parametros) y el VAE, lo que situa el pipeline completo en el entorno de 12 a 16 GB de VRAM en FP16 sin optimizaciones.
- Con *offloading* secuencial a CPU del codificador de texto y del VAE, la inferencia es viable en GPU de consumo con 8-12 GB de VRAM, a costa de mayor latencia.
- GPU recomendadas para ejecucion comoda sin offloading: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100. En el extremo ajustado, RTX 3060 de 12 GB o RTX 4070 de 12 GB con offloading.
- Opciones de despliegue: Diffusers, ComfyUI y el repositorio oficial de Wan son los caminos habituales para modelos Wan2.1. No se documentan integraciones con vLLM ni TGI, que no aplican a modelos de difusion de video.
- No se publican datos de latencia ni de throughput. A modo de referencia general para modelos de difusion de video de este tamano, la generacion de un clip corto suele medirse en decenas de segundos en GPU de gama alta, pero no hay medicion disponible para este ajuste concreto.
- No hay versiones cuantizadas publicadas por el autor, por lo que no se puede confirmar compatibilidad con llama.cpp, Ollama o formatos GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fotogramas | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|
| NSFW Wan 1.3b | 1,3 B | no disponible | CreativeML OpenRAIL-M | NSFW explicito | Repositorio de 105,4 GB, 0 descargas |
| Wan2.1-T2V-1.3B (base) | 1,3 B | definido por Wan2.1 (no disponible en esta ficha) | Apache 2.0 (segun el modelo base) | Generalista | Publico en HuggingFace, ampliamente utilizado |
| LTX-Video | 2 B aprox. | no disponible | no disponible | Generalista, enfocado a velocidad | Publico en HuggingFace |
| CogVideoX-2B | 2 B aprox. | no disponible | no disponible | Generalista | Publico en HuggingFace |

No se dispone de datos verificados de rendimiento comparado entre estas alternativas en la informacion proporcionada. La comparacion se limita a tamano, licencia y orientacion de uso; cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- *Catastrophic forgetting* documentado: la serie heredada (epocas 1-20) presenta degradacion anatomica grave, con artefactos descritos como "body horror" a partir de la epoca 3. El autor recomienda usar exclusivamente los checkpoints experimentales.
- La model card es internamente inconsistente en la numeracion experimental: el aviso inicial anuncia las epocas 1 a 8 y, unas lineas mas abajo, recomienda el checkpoint `exp_e14`. Conviene verificar que fichero se descarga realmente.
- Artefactos residuales: incluso en la serie experimental el autor admite que la mejora es fruto de una metodologia revisada y pide retroalimentacion, lo que indica que el modelo no se considera cerrado ni validado.
- Alucinacion anatomica: al ser un modelo generativo de difusion, puede producir extremidades duplicadas, rostros deformados y transiciones incoherentes entre fotogramas, especialmente en acciones complejas.
- Origen de los datos: el corpus se extrae de los 1.000 posts mas votados de unas 1.250 comunidades de Reddit sin que se documente consentimiento de las personas retratadas, lo que plantea riesgos de derechos de imagen, derechos de autor y generacion de contenido que reproduzca caracteristicas de personas reales.
- Riesgo de contenido no consentido: un generador NSFW abierto puede emplearse para producir material intimo sintetico de personas identificables. El uso responsable exige verificacion de edad, consentimiento y cumplimiento estricto de la legislacion aplicable en la jurisdiccion de despliegue.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial pero impone restricciones basadas en el uso, prohibiendo aplicaciones de dano, difamacion, acoso, contenido sexual no consentido y usos que vulneren derechos fundamentales. Ademas, la licencia no garantiza indemnizacion frente a reclamaciones de terceros por el contenido generado.
- Multiples idiomas no documentados: no hay lista oficial de idiomas soportados y los captions de entrenamiento usan las convenciones de etiquetado en ingles de Reddit, por lo que los prompts en otros idiomas pueden degradar el resultado.
- Modelo no validado por la comunidad: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin benchmarks publicados ni revision independiente.
- Etiquetado como `not-for-all-audiences`: el propio autor lo marca como contenido no apto para publico general, lo que condiciona su distribucion en plataformas con politicas de contenido restrictivas.
- Sin cuantizaciones oficiales: la ausencia de versiones GGUF, FP8 o INT8 limita el despliegue en hardware de gama baja y obliga a cuantizar por cuenta propia, con el consiguiente riesgo de degradacion adicional.
- Sin informacion sobre requisitos de memoria, latencia o throughput: cualquier planificacion de produccion debe hacerse con mediciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hhhhggggbbdjd/NSFW_Wan_1.3b
- Modelo base en HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Fichero de guia de prompts del repositorio: prompting-guide.json (incluido en el propio repositorio de HuggingFace)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a entradas lexicograficas y articulos enciclopedicos sobre la expresion francesa "pourquoi pas", sin relacion con el modelo. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la informacion disponible.
