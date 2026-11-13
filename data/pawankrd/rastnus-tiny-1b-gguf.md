# PawanKrd/RastNus-Tiny-1B-GGUF

## Resumen

RastNus-Tiny-1B-GGUF es la distribucion en formato GGUF de RastNus-Tiny-1B, un modelo de 1.030.933.278 parametros (aproximadamente 1B) especializado en correccion gramatical, ortografica y de puntuacion en kurdo central (sorani, codigo ISO `ckb`). Lo desarrolla PawanKrd y se deriva de un modelo Gemma 4 de 2B parametros podado hasta 1B, segun indica la propia model card. La licencia declarada es Apache 2.0, aunque la model card enlaza tambien a la licencia de Gemma 4 de Google, lo que conviene revisar antes de un uso comercial.

El modelo resuelve un problema muy concreto y con poca cobertura en el ecosistema open source: la normalizacion de texto en kurdo sorani, un idioma de bajos recursos. Frente a los modelos generalistas, que suelen degradar el rendimiento en lenguas minorizadas, aqui se ofrece una alternativa ligera, cuantizada con matriz de importancia sobre datos del dominio y ejecutable en llama.cpp, LM Studio, Ollama o llama-cpp-python.

La relevancia actual esta en su tamano reducido (1B) y su empaquetado GGUF, que permite desplegarlo en hardware modesto y en entornos sin GPU dedicada, algo critico para herramientas de correccion ortografica integradas en editores, CMS o pipelines de publicacion en kurdo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 4, podado de 2B a 1B) |
| Parametros totales | 1.030.933.278 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones por debajo de 16 bits, generadas con matriz de importancia (importancia calculada sobre datos de correccion en kurdo); niveles concretos no disponibles |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | Apache 2.0 (con enlace adicional a la licencia de Gemma 4) |
| Formato de pesos | GGUF (repo de 11,0 GB) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base RastNus-Tiny-1B es un Gemma 4 de 2B parametros podado a 1B, es decir, una arquitectura transformer decoder-only con reduccion de parametros respecto al modelo original. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; estos datos deben considerarse no disponibles.

La innovacion tecnica destacable de esta distribucion GGUF es el uso de una matriz de importancia calculada sobre datos de correccion en kurdo para generar las cuantizaciones inferiores a 16 bits. Esto significa que el proceso de cuantizacion prioriza la preservacion de los pesos mas relevantes para la tarea objetivo, lo que en teoria reduce la degradacion de calidad respecto a una cuantizacion uniforme, especialmente en un modelo pequeno donde cada punto de precision cuenta.

## Capacidades

- Correccion gramatical en kurdo central (sorani): deteccion y correccion de errores morfologicos y sintacticos.
- Correccion ortografica: normalizacion de grafias y deteccion de errores de escritura en alfabeto arabe adaptado al kurdo.
- Restauracion de puntuacion: insercion de signos de puntuacion en texto plano o mal puntuado.
- Correccion de texto en general: tarea de normalizacion de texto (text-correction) orientada a producir una version limpia del input.
- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte de formato de dialogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo API.
- Capacidades multilingues: limitadas al kurdo central; no se documenta soporte de otros idiomas.
- Tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Correccion ortografica en editores de texto y CMS: el modelo puede actuar como servicio de normalizacion que recibe un parrafo en sorani y devuelve la version corregida, integrándose via llama.cpp o llama-cpp-python en el backend de un editor web para periodistas o estudiantes kurdos.
- Preprocesado de corpus para NLP en kurdo: antes de entrenar embeddings o modelos de clasificacion sobre texto sorani, se puede pasar el corpus por RastNus-Tiny-1B para eliminar errores ortograficos y homogeneizar la puntuacion, mejorando la calidad del dataset.
- Moderacion y limpieza de contenido generado por usuarios: en foros o redes sociales en kurdo, el modelo puede normalizar publicaciones antes de indexarlas o mostrarlas, reduciendo ruido en busquedas y analitica.
- Herramientas educativas de aprendizaje del kurdo: un corrector integrado en una aplicacion de ejercicios de escritura puede dar retroalimentacion inmediata sobre gramatica y ortografia, con la ventaja de ejecutarse localmente en un portatil sin GPU.
- Pipeline de publicacion editorial: en medios digitales en sorani, el modelo puede colocarse como paso previo a la revision humana para detectar errores de puntuacion y grafia en articulos, reduciendo el tiempo de correccion.
- Transcripcion y post-edicion de ASR: tras una transcripcion automatica de audio en kurdo, el modelo puede restaurar puntuacion y corregir errores de reconocimiento, ya que el texto ASR suele carecer de signos y presentar grafias inconsistentes.
- Despliegue en dispositivos de borde: por su tamano de 1B y su formato GGUF, puede ejecutarse en mini-PC o moviles de gama alta mediante llama.cpp, habilitando correccion offline en zonas con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.030.933.278 parametros, una cuantizacion de 4 bits requiere aproximadamente 0,6-0,8 GB de pesos, mas overhead de contexto y KV cache; en 8 bits, alrededor de 1,1-1,3 GB; en 16 bits, unos 2,1 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 pueden ejecutarlo con holgura. El modelo esta claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, llama-cpp-python y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere soporte de servidores de inferencia con API compatible.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia baja en GPU consumer y throughput alto en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| RastNus-Tiny-1B-GGUF | 1.030.933.278 | no disponible | kurdo central (ckb) | Apache 2.0 | GGUF |
| Gemma 4 2B (modelo origen) | 2B (aproximado) | no disponible | multilingue | licencia Gemma 4 | safetensors y otros |
| Modelos generalistas de 1B (p. ej. variantes Llama/Qwen de 1B) | ~1B | no disponible en esta ficha | multilingue | variable | safetensors, GGUF |

La comparativa con alternativas especificas de correccion en kurdo no esta disponible: no se han identificado en la informacion proporcionada otros modelos open source dedicados a la correccion gramatical en sorani. Frente a modelos generalistas de tamano similar, la ventaja de RastNus-Tiny-1B es la especializacion y el proceso de cuantizacion con matriz de importancia sobre datos del dominio; la desventaja es la ausencia de capacidades generales y de soporte multilingue.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos de kurdo sorani, puede reflejar sesgos de las fuentes utilizadas.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; en tareas de correccion puede introducir cambios no solicitados en el texto, por lo que se recomienda validacion o diff contra el original.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide planificar el procesamiento de documentos largos sin pruebas empiricas.
- Limitaciones de idioma: el modelo esta disenado exclusivamente para kurdo central; su uso en kurdo kurmanji (latino) u otros idiomas no esta soportado y probablemente produzca resultados deficientes.
- Restricciones de licencia: aunque se declara Apache 2.0, la model card enlaza a la licencia de Gemma 4 de Google; conviene verificar la compatibilidad de esa licencia con el uso comercial previsto, ya que los terminos de Gemma pueden imponer restricciones adicionales.
- Caveat de produccion: el modelo es una poda de un modelo mayor; la poda puede degradar capacidades generales, y no hay benchmarks publicados que cuantifiquen la calidad de la correccion frente a alternativas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/PawanKrd/RastNus-Tiny-1B-GGUF
- Modelo base: https://huggingface.co/PawanKrd/RastNus-Tiny-1B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
