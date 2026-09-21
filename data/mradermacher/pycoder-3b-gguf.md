# mradermacher/pycoder-3b-GGUF

## Resumen

pycoder-3b-GGUF es la version cuantizada en formato GGUF de raporto/pycoder-3b, un modelo de generacion de codigo de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) especializado en Python. El modelo base sobre el que se construyo es Qwen2.5, y el ajuste se realizo mediante QLoRA/LoRA con PEFT sobre el dataset iamtarun/python_code_instructions_18k_alpaca, un corpus de 18.000 instrucciones de codigo en formato Alpaca. La publicacion de estas cuantizaciones corre a cargo de mradermacher, un autor conocido por convertir modelos en formato Transformers a GGUF para su uso en entornos de inferencia local.

El problema que resuelve es el de disponer de un asistente de codigo Python ligero y ejecutable en hardware de consumo. Al estar cuantizado en GGUF, el modelo puede ejecutarse con llama.cpp, Ollama o LM Studio en tarjetas graficas de gama media e incluso en CPU, con tamanos de archivo que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16). El repositorio ocupa 27,9 GB en total, ya que incluye once variantes de cuantizacion distintas.

La relevancia de esta ficha es practica: se trata de un modelo pequeno, con licencia Apache 2.0 (permisiva para uso comercial), orientado a generacion de codigo Python y con soporte declarado de portugues, ingles y espanol. No se han publicado resultados de benchmarks ni detalles completos sobre la composicion del dataset de ajuste o la longitud de contexto final, por lo que conviene tratarlo como una opcion a validar empiricamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de la familia Qwen2.5 (etiqueta qwen2.5 en la model card) |
| Parametros totales | 3.085.938.688 (dato real de safetensors) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | portugues (pt), ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base raporto/pycoder-3b se distribuye en Transformers |
| Parametros activos | no aplica (modelo denso, no MoE) |

## Arquitectura y entrenamiento

El modelo base raporto/pycoder-3b es un ajuste de la familia Qwen2.5, una arquitectura transformer decoder-only con atencion causal estandar. El ajuste se realizo con QLoRA y LoRA mediante la libreria PEFT, partiendo de un modelo preentrenado y especializandolo en generacion de codigo Python. El dataset empleado es iamtarun/python_code_instructions_18k_alpaca, compuesto por aproximadamente 18.000 pares instruccion-respuesta en formato Alpaca orientados a tareas de programacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, el uso de RLHF o DPO, ni sobre el numero de pasos de ajuste o hiperparametros empleados.

En cuanto al proceso de cuantizacion, la model card de mradermacher indica que se trata de cuantizaciones estaticas (sin imatrix ni pesos ponderados) generadas a partir del modelo en formato Transformers, con el tipo de conversion marcado como "hf" y sin modulo mmproj (es decir, sin capacidades multimodales). Los tamanos declarados de los archivos son: 1,4 GB para Q2_K, 1,6 GB para Q3_K_S, 1,7 GB para Q3_K_M, 1,8 GB para Q3_K_L, 1,9 GB para IQ4_XS y Q4_K_S, 2,0 GB para Q4_K_M, 2,3 GB para Q5_K_S y Q5_K_M, 2,6 GB para Q6_K, 3,4 GB para Q8_0 y 6,3 GB para f16. El autor recomienda Q4_K_S y Q4_K_M por su equilibrio entre velocidad y calidad, y senala que Q8_0 ofrece la mejor calidad con buen rendimiento. No hay innovaciones tecnicas adicionales documentadas (ni decodificacion especulativa, ni atencion lineal, ni capas hibridas).

## Capacidades

- Generacion de codigo Python: es la funcion principal del modelo, ajustado especificamente sobre instrucciones de programacion en Python.
- Generacion de texto general: al derivar de Qwen2.5, conserva capacidad de generacion de lenguaje natural, aunque el ajuste esta orientado a codigo.
- Razonamiento sobre instrucciones de programacion: el formato Alpaca del dataset de ajuste implica que el modelo responde a instrucciones del tipo "escribe una funcion que..." o "explica este fragmento".
- Soporte multilingue parcial: la model card declara portugues, ingles y espanol como idiomas soportados.
- Formato conversacional: la etiqueta "conversational" aparece en los metadatos del repositorio, lo que apunta a un uso de tipo chat con plantilla de mensajes.
- Tool calling / function calling: no disponible en la informacion proporcionada; no se declara soporte explicito.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking), vision o audio: no disponible; el repositorio no incluye mmproj, por lo que no hay soporte multimodal.

## Casos de uso

- Autocompletado y asistencia de codigo Python en el editor: el modelo puede integrarse mediante llama.cpp u Ollama en un plugin de VS Code o Neovim para sugerir funciones y corregir fragmentos, aprovechando que el peso cuantizado en Q4_K_M ocupa solo 2,0 GB y cabe en GPU de gama media.
- Generacion de scripts de automatizacion y utilidades internas: para tareas como parseo de ficheros, tratamiento de datos o generacion de informes, donde se necesita codigo Python correcto sin justificar el coste de un modelo de mayor tamano.
- Generacion de tests unitarios: a partir de una funcion existente, el modelo puede producir casos de prueba en pytest o unittest, un caso de uso habitual en los datasets de instrucciones de codigo tipo Alpaca.
- Explicacion y documentacion de codigo: traduccion de fragmentos Python a comentarios y docstrings en ingles, portugues o espanol, aprovechando el soporte trilingue declarado.
- Educacion y ensenanza de programacion: generacion de ejemplos progresivos y ejercicios resueltos en Python, ejecutables en local sin depender de APIs externas, lo que evita enviar material didactico a terceros.
- Procesamiento por lotes en pipelines de refactorizacion: aplicar transformaciones mecanicas (renombrado de funciones, migracion de estilo, conversion de fragmentos) sobre un repositorio, desplegando el modelo con llama.cpp en CPU o en una GPU modesta.
- Desarrollo en entornos con conectividad limitada o requisitos de privacidad: al poder ejecutarse completamente en local desde un unico archivo GGUF de entre 1,4 y 3,4 GB, es adecuado para entornos aislados donde no se permite llamar a servicios en la nube.
- Prototipado rapido de asistentes de codigo en portugues o espanol: el soporte declarado de ambos idiomas permite construir interfaces conversacionales de ayuda a la programacion para equipos hispanohablantes o lusofonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion (ni HumanEval, ni MBPP, ni MMLU, ni GSM8K), y el resultado de la busqueda web no aporta informacion relevante sobre el modelo, ya que los resultados obtenidos corresponden a contenidos sin relacion con el ambito de la inteligencia artificial.

## Requisitos de hardware

- VRAM estimada para inferencia, segun la cuantizacion y los tamanos de archivo publicados:
  - Q2_K (1,4 GB): aproximadamente 2,5 GB de VRAM efectiva contando cache KV y overhead.
  - Q4_K_S / Q4_K_M (1,9-2,0 GB): aproximadamente 3,5-4 GB de VRAM efectiva.
  - Q5_K_S / Q5_K_M (2,3 GB): aproximadamente 4 GB de VRAM efectiva.
  - Q6_K (2,6 GB): aproximadamente 4,5 GB de VRAM efectiva.
  - Q8_0 (3,4 GB): aproximadamente 5,5 GB de VRAM efectiva.
  - f16 (6,3 GB): aproximadamente 8-9 GB de VRAM efectiva. La model card describe este formato como "overkill" (excesivo) para este tamano de modelo.
- GPU recomendadas: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) funcionan sin problema las cuantizaciones de Q2_K a Q6_K. Para A100 o H100 no tiene sentido por tamano, salvo por agregacion de muchas instancias concurrentes.
- Cabe en GPU de consumo: si, en todas las cuantizaciones, incluidas tarjetas de 6-8 GB si se usa Q4_K_M o inferior. Tambien puede ejecutarse directamente en CPU con cuantizaciones de Q4 hacia abajo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui (oobabooga) y cualquier runtime compatible con GGUF. Para servir el modelo original en Transformers (raporto/pycoder-3b) se puede usar vLLM o TGI, pero este repositorio concreto solo contiene pesos GGUF.
- Latencia y throughput estimados: no disponible; la informacion proporcionada no incluye mediciones de tokens por segundo ni latencia.
- Nota sobre multipartes: los archivos GGUF se distribuyen en un unico fichero por cuantizacion, por lo que no es necesario concatenar partes; la model card remite al README de TheBloke para dudas generales sobre el uso de GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pycoder-3b-GGUF (este modelo) | 3,09 B | no disponible | Apache 2.0 | GGUF | Ajuste QLoRA sobre Qwen2.5, especializado en Python, sin benchmarks publicados |
| Qwen2.5-Coder-3B | 3,09 B (orden de magnitud equivalente) | datos de terceros, no incluidos en la informacion proporcionada | Apache 2.0 (segun su model card publica) | safetensors y GGUF comunitarios | Alternativa directa de la misma familia, con ajuste especifico para codigo |
| StarCoder2-3B | 3 B (orden de magnitud equivalente) | datos de terceros, no incluidos en la informacion proporcionada | BigCode OpenRAIL-M | safetensors y GGUF comunitarios | Modelo de codigo multilingue con licencia con clausulas de uso restringido |
| CodeGemma-2B | 2 B | datos de terceros, no incluidos en la informacion proporcionada | Gemma Terms of Use | safetensors y GGUF comunitarios | Alternativa de Google con licencia no Apache |

Los datos de los modelos alternativos no provienen de la informacion proporcionada en esta busqueda y deben verificarse en sus respectivas model cards antes de tomar decisiones. No hay comparativa de rendimiento disponible porque este modelo no publica resultados de benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de HumanEval, MBPP u otras metricas, por lo que el rendimiento real en generacion de codigo es desconocido y debe validarse con una evaluacion propia.
- Longitud de contexto no documentada: se desconoce si el ajuste QLoRA preserva la ventana de contexto completa del modelo base y si la plantilla de chat se mantiene correctamente tras la cuantizacion.
- Dataset de ajuste pequeno y acotado: 18.000 instrucciones en formato Alpaca es un volumen reducido, lo que limita la generalizacion a dominios distintos de Python y a tareas de codigo mas complejas o de otros lenguajes.
- Riesgo de alucinacion de APIs: como cualquier modelo de codigo de 3B, puede inventar funciones, parametros o modulos de librerias que no existen. Todo codigo generado debe revisarse y ejecutarse antes de usarlo.
- Especializacion en Python: aunque la familia base sea generalista, el ajuste esta centrado en Python; el rendimiento en otros lenguajes no esta documentado.
- Cobertura multilingue limitada a pt, en y es: no se declaran mas idiomas, y la calidad relativa entre ellos no esta medida.
- Sin soporte multimodal ni mmproj: no procesa imagenes, audio ni otros formatos.
- Soporte de tool calling y agentes no confirmado: no se declara en la model card, por lo que no debe asumirse en disenos de produccion.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, y las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del codigo generado.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero hay que conservar los avisos de licencia y tener en cuenta que el modelo base raporto/pycoder-3b y el propio Qwen2.5 pueden tener condiciones adicionales que conviene revisar en sus repositorios.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Resultados de busqueda no concluyentes: las busquedas web realizadas no devolvieron informacion tecnica sobre el modelo, por lo que no existe documentacion externa de contraste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/pycoder-3b-GGUF
- Modelo base: https://huggingface.co/raporto/pycoder-3b
- Dataset de ajuste: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#pycoder-3b-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que soporta al autor: https://www.nethype.de/
