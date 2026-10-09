# mradermacher/Andromeda-Code-0.5B-GGUF

## Resumen

Andromeda-Code-0.5B-GGUF es la version cuantizada en formato GGUF del modelo Andromeda-Code-0.5B, desarrollado originalmente por el usuario fiel1986 y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 494.032.768 parametros (aproximadamente 0,5 mil millones) especializado en generacion de codigo y orientado al idioma espanol mediante un proceso de destilacion de respuestas (response distillation) a partir de modelos mayores de las familias DeepSeek y Qwen, segun las etiquetas declaradas por el autor.

La relevancia de esta ficha reside en su formato de distribucion: al estar publicado en GGUF con doce niveles de cuantizacion distintos (desde Q2_K hasta f16), el modelo puede ejecutarse en hardware muy modesto, incluso en CPU sin GPU dedicada, lo que lo hace adecuado para entornos de bajos recursos, prototipado rapido, aprendizaje y despliegue local en el navegador o en dispositivos embebidos. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

No obstante, la informacion publica disponible es muy limitada. No se especifican detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento, el numero de tokens utilizados ni resultados de benchmarks. El repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, por lo que se trata de un artefacto practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del modelo apuntan a la familia Qwen) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | espanol (es) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |
| Modelo base | fiel1986/Andromeda-Code-0.5B |
| Tamano del repositorio | 5,4 GB |
| Etiquetas destacadas | codigo, code, destilacion, response-distillation, deepseek, qwen, espanol |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Las etiquetas declaradas (qwen, deepseek) y el prefijo 0.5B sugieren que se trata de un transformer denso de pequeno tamano derivado de la familia Qwen, aunque esta afirmacion no puede confirmarse con los datos disponibles. El autor indica que el modelo se construyo mediante destilacion de respuestas (response distillation), una tecnica en la que un modelo mayor genera respuestas que se utilizan como supervision para entrenar un modelo mas pequeno, en este caso orientado a tareas de programacion en espanol.

Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La cuantizacion la ha realizado mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estaticas. El autor de la cuantizacion indica que no tiene previsto, por el momento, publicar cuantizaciones ponderadas o con matriz de importancia (imatrix), aunque acepta peticiones a traves de las discusiones de la comunidad.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado como especializado en codigo y fue entrenado mediante destilacion de respuestas, presumiblemente orientado a completar, explicar y generar fragmentos de programacion.
- Conversacion: el tag "conversational" indica que soporta dialogos multi-turno.
- Idiomas: soporte declarado unicamente para espanol (etiqueta es), aunque el enfoque en codigo implica manejo de palabras clave y sintaxis en ingles de lenguajes de programacion.
- Razonamiento multi-paso: no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte en la informacion facilitada.
- Soporte de agentes: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de autocompletado de codigo en editores locales: al ocupar menos de 1,1 GB en su cuantizacion f16 y apenas 0,4 GB en Q2_K, puede integrarse en plugins de editores como VS Code o Neovim para sugerir lineas de codigo sin depender de una API externa.
- Generacion de codigo en entornos sin conexion: su formato GGUF permite ejecutarlo con llama.cpp u Ollama en portatiles o estaciones de trabajo aisladas, util en entornos con requisitos de privacidad o sin acceso a Internet.
- Educacion y ensenanza de programacion en espanol: al estar orientado al idioma espanol, puede emplearse para explicar fragmentos de codigo o resolver dudas de estudiantes en su lengua materna.
- Prototipado rapido de pipelines LLM: su tamano reducido permite validar arquitecturas de inferencia, cuantizaciones y flujos de RAG sin incurrir en costes de GPU elevados.
- Despliegue en dispositivos de bajos recursos: puede ejecutarse en placas como Raspberry Pi o en telefonos moviles mediante bindings de llama.cpp, sirviendo como demostracion funcional de un asistente de codigo embebido.
- Traduccion de fragmentos de codigo y comentarios entre ingles y espanol: gracias a su perfil bilingue parcial (espanol declarado y codigo en lenguaje tecnico), puede generar comentarios y documentacion en espanol a partir de codigo fuente existente.
- Filtrado y clasificacion de fragmentos de codigo en pipelines de CI/CD: con una latencia muy baja por su tamano, puede emplearse para tareas auxiliares de etiquetado o resumen dentro de flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~0,5B parametros):
  - Cuantizacion Q2_K / Q3_K_S: ~0,4 GB de pesos; con overhead de contexto, en torno a 0,6-0,8 GB de VRAM.
  - Cuantizacion Q4_K_M / Q5_K_M (recomendadas por el autor): ~0,5 GB de pesos; alrededor de 0,8-1,0 GB de VRAM.
  - Cuantizacion Q8_0: ~0,6 GB de pesos; aproximadamente 1,0-1,2 GB de VRAM.
  - Cuantizacion f16: ~1,1 GB de pesos; en torno a 1,5-2,0 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) ejecuta el modelo holgadamente; tambien es viable en GPUs integradas y en Apple Silicon (M1 o superior) mediante Metal.
- Compatibilidad con GPU consumer: si, cabe en practicamente cualquier GPU de consumo, incluso en modelos con 4-6 GB de VRAM, e incluso en GPU integradas compartiendo memoria del sistema.
- Ejecucion en CPU: viable de forma totalmente funcional con llama.cpp, Ollama o LM Studio; el modelo es lo bastante pequeno para correr en CPU con velocidad interactiva.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), kobold.cpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors seria necesario transformers o, en su caso, vLLM/TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; no obstante, por el tamano del modelo se espera una latencia de pocos milisegundos por token en GPU moderna y de decenas de milisegundos por token en CPU, aunque no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Andromeda-Code-0.5B | ~494 M | no disponible | apache-2.0 | safetensors, GGUF | Destilacion orientada a codigo en espanol |
| Qwen2.5-Coder-0.5B | ~494 M | 32.768 tokens (dato publico del modelo original) | apache-2.0 | safetensors, GGUF | Referencia de la familia Qwen para codigo; datos de contexto segun ficha oficial |
| mradermacher/Temper-1-0.5B-GGUF | ~0,5B | no disponible | apache-2.0 | GGUF | Otra cuantizacion de 0,5B publicada por el mismo autor |

No se dispone de informacion suficiente para comparar rendimiento entre estos modelos, ya que no se han publicado benchmarks para Andromeda-Code-0.5B. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo destilado de maestros mayores puede heredar sesgos de sus fuentes, particularmente en cuanto a sesgos de genero o de estilo de programacion.
- Riesgo de alucinacion: elevado; los modelos de ~0,5B parametros tienden a generar APIs inexistentes, funciones inventadas y errores de sintaxis, especialmente en tareas de codigo complejas.
- Ambito limitado: no se recomienda para razonamiento de multiples pasos, tareas matematicas avanzadas, agentes autonomos ni uso en produccion sin supervision humana.
- Cobertura idiomatica: el idioma declarado es exclusivamente espanol; el rendimiento en otros idiomas puede degradarse notablemente.
- Ausencia de validacion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica que no existe retroalimentacion de la comunidad sobre su calidad real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se documentan terminos adicionales.
- Trazabilidad de datos: al no documentarse el dataset de entrenamiento ni el modelo maestro exacto, resulta dificil evaluar el cumplimiento de licencias de modelos derivados.
- Contexto desconocido: al no especificarse la ventana de contexto soportada, se desconoce si el modelo puede manejar conversaciones largas o archivos de codigo extensos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Andromeda-Code-0.5B-GGUF
- Modelo base: https://huggingface.co/fiel1986/Andromeda-Code-0.5B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Andromeda-Code-0.5B-GGUF
- Listado de modelos del autor: https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Referencia sobre uso de archivos GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
