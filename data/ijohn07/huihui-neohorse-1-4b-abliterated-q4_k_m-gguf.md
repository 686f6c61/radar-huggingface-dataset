# ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q4_K_M-GGUF

## Resumen

Huihui-NeoHorse-1-4B-abliterated-Q4_K_M-GGUF es una version cuantizada en formato GGUF del modelo huihui-ai/Huihui-NeoHorse-1-4B-abliterated, publicada por el usuario ijohn07 mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata, por tanto, de una conversion de pesos, no de un entrenamiento nuevo: el trabajo del autor consiste en transformar el checkpoint original (probablemente en safetensors) a un fichero GGUF de cuantizacion Q4_K_M para permitir inferencia local en CPU y GPU de gama baja.

El modelo base pertenece a la familia de modelos "abliterated" de huihui-ai, una practica que consiste en eliminar o atenuar la direccion de rechazo en el espacio de activaciones para reducir los comportamientos de negativa del modelo alineado. Esto explica las etiquetas "abliterated" y "uncensored" de la ficha. El modelo declara capacidades orientadas a agentes, uso de herramientas, codigo, razonamiento e instrucciones, con licencia Apache-2.0.

Con 4.205.751.296 parametros (aproximadamente 4,2 mil millones), el modelo entra en la categoria de modelos pequenos aptos para ejecucion en hardware de consumo. Su relevancia practica esta en el binomio tamano/formato: un GGUF Q4_K_M de unos 2,7 GB puede desplegarse en portatiles, mini-PC y GPUs de 6-8 GB sin necesidad de infraestructura en la nube, lo que resulta util para prototipado de agentes y pipelines de codigo con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura; se trata de una conversion GGUF del modelo base huihui-ai/Huihui-NeoHorse-1-4B-abliterated) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | no aplica (no consta que el modelo sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es un parametro de ejemplo de llama.cpp, no la ventana maxima declarada) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`huihui-neohorse-1-4b-abliterated-q4_k_m.gguf`); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la informacion disponible |

Otros datos: pipeline `text-generation`, libreria declarada `transformers`, tamano del repositorio 2,7 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 2026-09-18 y ultima actualizacion 2026-09-18.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo base. La model card de esta repositorio es una plantilla generada automaticamente por el espacio GGUF-my-repo y se limita a indicar el origen del checkpoint y los comandos de uso con llama.cpp. Cualquier detalle sobre atencion, tipo de normalizacion, tokenizador o presupuesto de contexto debe consultarse en la model card original de huihui-ai/Huihui-NeoHorse-1-4B-abliterated, que no forma parte de la informacion proporcionada.

La unica transformacion tecnica documentada es la cuantizacion a Q4_K_M: un esquema de cuantizacion de 4 bits por peso con escalas mixtas (la variante K_M mezcla precision segun la sensibilidad de cada tensor), que reduce el peso del modelo hasta los 2,7 GB del repositorio. Esta conversion la realiza la herramienta llama.cpp y no implica reentrenamiento ni destilacion, por lo que las capacidades del modelo son las del checkpoint original con la perdida de precision asociada a 4 bits. La caracteristica "abliterated" heredada del modelo base implica que se ha intervenido sobre las direcciones de rechazo en las activaciones, un procedimiento de edicion de pesos y no una fase de entrenamiento supervisado adicional.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` confirma uso en dialogos multi-turno.
- Uso de herramientas (tool calling / function calling): la etiqueta `tool-use` indica que el modelo ha sido ajustado o seleccionado para emitir llamadas a funciones.
- Comportamiento agentico: la etiqueta `agentic` apunta a flujos de varios pasos con planificacion y ejecucion de acciones.
- Generacion de codigo: etiqueta `coding`, orientada a tareas de programacion y completado.
- Razonamiento: etiqueta `reasoning`, con capacidad declarada para tareas que requieren cadenas de inferencia.
- Seguimiento de instrucciones: etiqueta `instruction-following`.
- Modo sin censura: las etiquetas `abliterated` y `uncensored` indican que se ha reducido la tendencia a rechazar peticiones, lo que amplia el rango de respuestas pero tambien el riesgo de contenido problematico.
- Capacidades multimodales (vision, audio) y modo de pensamiento explicito: no disponibles.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas en la ficha.

## Casos de uso

- Agentes locales de automatizacion de tareas: al declarar `agentic` y `tool-use`, el modelo puede conectarse a APIs mediante function calling y ejecutarse integramente en una maquina local, lo que resulta adecuado cuando los datos no pueden salir de la organizacion.
- Asistentes de codigo en el IDE: con 4,2 B de parametros y cuantizacion Q4_K_M, puede ejecutarse en la GPU de un portatil para autocompletado, generacion de tests y explicacion de fragmentos sin depender de servicios externos.
- Prototipado rapido de pipelines de razonamiento: su tamano reducido permite iterar sobre prompts y esquemas de agentes en minutos, antes de escalar a un modelo mayor en produccion.
- Procesamiento de texto por lotes en servidores sin GPU: al estar en GGUF, se puede ejecutar con llama.cpp sobre CPU en tareas de clasificacion, resumen o extraccion de entidades con coste marginal cero.
- Filtrado y reescritura de contenido sensible: el caracter abliterated permite abordar dominios donde los modelos alineados rechazan peticiones legitimas (por ejemplo, analisis de discurso de odio, redaccion de ficcion con violencia o investigacion sobre seguridad).
- Despliegue en dispositivos con recursos limitados: mini-PC, Raspberry Pi 5 con 8 GB de RAM o telefonos de gama alta pueden servir inferencia cuantizada para asistentes offline.
- Investigacion sobre abliteration: util como punto de comparacion para medir como la eliminacion de la direccion de rechazo afecta a la calidad general y a la tasa de respuestas daninas.
- Chatbot de atencion al cliente de bajo coste: la etiqueta `instruction-following` y el formato conversacional permiten montar un asistente multi-turno con contexto moderado en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y tampoco se han encontrado resultados de evaluacion en la busqueda web realizada. No se dispone, ademas, de datos de latencia o throughput medidos para este fichero concreto.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 2,7 GB, por lo que la inferencia requiere aproximadamente 3-4 GB de VRAM con contextos cortos y alrededor de 4-6 GB si se amplia la cache KV.
- GPU de consumo compatibles: RTX 3060 6 GB, RTX 4060 8 GB, RTX 3070/4070, RTX 2060 6 GB; en GPUs de 4 GB (GTX 1650) cabe con contexto reducido y capas parcialmente descargadas.
- Cabe en GPU de consumo: si. Es uno de los principales atractivos de la cuantizacion Q4_K_M para un modelo de 4,2 B.
- Apple Silicon: ejecutable en Macs con memoria unificada de 8 GB o superior mediante llama.cpp con aceleracion Metal.
- Solo CPU: viable en equipos con 8-16 GB de RAM, con velocidades de generacion moderadas; se recomienda RAM de doble canal.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y bindings de GGUF en vLLM (soporte parcial). Los comandos oficiales de la model card son `llama-cli --hf-repo ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q4_K_M-GGUF --hf-file huihui-neohorse-1-4b-abliterated-q4_k_m.gguf`.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del backend (CUDA, Metal, CPU) y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo, por lo que la comparacion se limita a caracteristicas publicas de la categoria de modelos pequenos de proposito general. Los valores de las alternativas corresponden a documentacion publica de sus fabricantes y no han sido verificados en esta ficha.

| Modelo | Parametros | Contexto declarado | Licencia | Formato en esta comparacion | Notas |
|---|---|---|---|---|---|
| Huihui-NeoHorse-1-4B-abliterated Q4_K_M (este) | 4,2 B | no disponible | apache-2.0 | GGUF Q4_K_M | Variante abliterated, foco en agentes y tool use |
| Qwen2.5-3B-Instruct | 3,1 B aprox. | 32 768 tokens | apache-2.0 | safetensors / GGUF | Referencia habitual en el rango 3-4 B con soporte de tool calling |
| Llama-3.2-3B-Instruct | 3,2 B aprox. | 128 000 tokens | licencia comunitaria de Llama 3.2 | safetensors / GGUF | Restricciones de uso comercial segun la licencia de Meta |
| Phi-3.5-mini-instruct | 3,8 B aprox. | 128 000 tokens | MIT | safetensors / GGUF | Buen rendimiento declarado en razonamiento y codigo |
| Gemma-2-2B-it | 2,6 B aprox. | 8 192 tokens | terminos de uso de Gemma | safetensors / GGUF | Menor tamano, contexto mas corto |

La ventaja diferencial de este modelo no es el rendimiento bruto, sino la combinacion de caracter abliterated, licencia Apache-2.0 y disponibilidad en GGUF Q4_K_M para hardware muy limitado. La comparacion de calidad frente a las alternativas anteriores queda pendiente de una evaluacion independiente.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna evaluacion publicada que respalde las capacidades declaradas en las etiquetas; el rendimiento real es desconocido.
- Procedencia de la cuantizacion: el repositorio tiene 0 descargas y 0 likes, y su model card es una plantilla automatica. No hay evidencia de validacion de la calidad del fichero GGUF mas alla del proceso estandar de GGUF-my-repo.
- Efecto de la cuantizacion: Q4_K_M introduce perdida de precision respecto al checkpoint original, con mayor impacto en tareas de razonamiento largo, matematicas y generacion de codigo sensible a detalles.
- Riesgo de alucinacion: como todo modelo de 4 B, la tasa de invencion de hechos, APIs y referencias es elevada; no debe usarse sin verificacion en dominios factuales.
- Contenido sin filtrar: las etiquetas `abliterated` y `uncensored` implican que el modelo puede generar contenido ofensivo, ilegal o peligroso ante peticiones adecuadas. Requiere moderacion adicional en cualquier despliegue orientado al publico.
- Sesgos: no se ha publicado informacion sobre sesgos de genero, raza, religion o idioma para este modelo ni para su base.
- Idiomas: no se declara lista de idiomas soportados; se desconoce la calidad en castellano y en lenguas distintas del ingles.
- Contexto: la longitud de contexto no esta documentada y el ejemplo de la model card (`-c 2048`) no debe interpretarse como el maximo del modelo. Se recomienda validar experimentalmente antes de disenar flujos con contextos largos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal sobre las salidas generadas por un modelo abliterated.
- Fecha de publicacion: la ficha indica creacion en 2026-09-18, posterior a la fecha habitual de publicacion de modelos de esta generacion; conviene verificar la vigencia del repositorio antes de integrarlo.
- Idoneidad para produccion: por su tamano y falta de evaluacion, se recomienda relegarlo a prototipado, tareas auxiliares o entornos controlados, no a decisiones automatizadas de alto impacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ijohn07/Huihui-NeoHorse-1-4B-abliterated-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota sobre la busqueda web: las busquedas realizadas devolvieron unicamente paginas de Zhihu sin relacion con el modelo (temas de ahorro en Alemania, alquiler de coches, nombres de ficheros, un caso judicial y requisitos de SolidWorks), por lo que no aportan informacion util y no se han utilizado como fuente.
