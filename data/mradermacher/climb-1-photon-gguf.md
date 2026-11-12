# mradermacher/Climb-1-Photon-GGUF

## Resumen

Climb-1-Photon es un modelo de lenguaje de 752.393.024 parametros (aproximadamente 0,75 mil millones), desarrollado originalmente por Climb-Ai y distribuido en formato GGUF por el usuario mradermacher. Esta especializado en tareas de terminal, linea de comandos, bash y Linux, y segun las etiquetas de su model card deriva de la familia Qwen (concretamente se menciona "qwen3.5") y emplea una tecnica denominada "weight-space programming" (wsp). Su licencia es Apache 2.0 y soporta ingles y ruso.

La relevancia de esta ficha reside en que se trata de una cuantizacion estatica del modelo base Climb-Ai/Climb-1-Photon, publicada en noviembre de 2026, que permite ejecutar un modelo especializado en automatizacion de terminal en hardware de consumo gracias a su reducido tamano. El repositorio GGUF ocupa 7,5 GB e incluye 12 variantes de cuantizacion desde Q2_K hasta f16.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; estos datos se indican como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen, segun etiquetas; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que Climb-1-Photon es un transformer derivado de la familia Qwen (etiqueta "qwen3.5") y que emplea una tecnica llamada "weight-space programming" (wsp). No se especifican en la documentacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto nativa. El modelo base fue entrenado por Climb-Ai y las etiquetas incluyen "unsloth", lo que sugiere el uso de herramientas de Unsloth en el proceso de ajuste fino, aunque no se detalla el pipeline completo.

No hay datos publicados en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La cuantizacion publicada por mradermacher es de tipo estatico (no se han generado cuantizaciones con imatrix o ponderadas en el momento de la publicacion), lo que implica que los factores de cuantizacion se calcularon sin calibracion especifica por capa.

## Capacidades

- Generacion de texto conversacional en ingles y ruso.
- Especializacion en tareas de terminal: comandos bash, gestion de Linux y flujos de linea de comandos (etiquetas cli, bash, linux, terminal).
- Soporte de conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia tipo API.
- Capacidad de razonamiento multi-paso orientada a la resolucion de tareas de sistema, segun su enfoque de "weight-space programming".
- No se documentan capacidades de vision, audio, tool calling explicito ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistente de terminal interactivo: el modelo puede generar y explicar comandos bash y utilidades de Linux en un bucle conversacional, adecuado para integrarse en un CLI o en un asistente de shell que ayude a operadores menos expertos.
- Automatizacion de tareas de administracion de sistemas: dado su enfoque en Linux y terminal, puede emplearse para redactar scripts de mantenimiento, cron jobs o pipelines de shell a partir de instrucciones en lenguaje natural.
- Generacion de scripts de despliegue y CI/CD: puede producir fragmentos de bash para pipelines, con la ventaja de su reducido tamano (0,75B parametros) que permite ejecutarlo en el mismo runner sin GPU dedicada.
- Educacion y formacion en linea de comandos: al ser un modelo pequeno y ligero, puede desplegarse localmente en entornos de aprendizaje para explicar comandos, errores y buenas practicas sin depender de la nube.
- Prototipado rapido en local: con cuantizaciones de 0,5-0,9 GB, es viable probar asistentes de terminal en portatiles o equipos sin GPU, usando llama.cpp u Ollama.
- Traduccion tecnica EN-RU de documentacion de comandos y manuales: el soporte bilingue permite generar explicaciones de comandos en ruso para equipos de soporte o documentacion localizada.
- Filtrado y clasificacion de salidas de terminal: puede usarse para interpretar logs o salidas de comandos y resumir errores en lenguaje natural, dado su entrenamiento en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB para cuantizaciones Q2_K a Q8_0; alrededor de 1,6 GB para f16. El repositorio completo ocupa 7,5 GB, pero solo es necesario descargar la variante elegida.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecutaria las cuantizaciones Q4_K_M o Q5_K_M con holgura. Tambien es viable en CPU pura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con transformers, vLLM o TGI, aunque la informacion no confirma compatibilidad explicita con vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Climb-1-Photon ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Se indica a continuacion una comparacion estructural basica con alternativas de tamano similar, marcando como no disponibles los datos que no se han podido verificar.

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Climb-1-Photon (este) | 0,75B | no disponible | Apache 2.0 | GGUF, safetensors | Terminal, bash, Linux |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (segun familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Generalista |
| SmolLM2-1.7B | 1,7B | 8K (segun model card publica) | Apache 2.0 | safetensors, GGUF | Generalista |
| TinyLlama-1.1B | 1,1B | 2K (segun model card publica) | Apache 2.0 | safetensors, GGUF | Generalista |

Nota: los datos de contexto de los modelos comparables provienen de conocimiento general de sus familias y no de la informacion proporcionada en esta busqueda; deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de muy reducido tamano (0,75B parametros): la capacidad de razonamiento complejo, matematicas avanzadas y codigo de larga extension sera limitada en comparacion con modelos de mayor escala.
- Riesgo de alucinacion en la generacion de comandos: puede producir flags o sintaxis de bash inexistentes o peligrosas; es imprescindible validar cualquier comando antes de ejecutarlo en produccion.
- Cobertura linguistica limitada a ingles y ruso; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana amplia para conversaciones o documentos largos.
- Cuantizaciones estaticas sin imatrix: las variantes de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar los avisos de atribucion correspondientes.
- No hay evidencia publicada de evaluaciones de seguridad, sesgos o alineacion para este modelo; en produccion conviene aplicar filtros y supervision humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Climb-1-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1-Photon
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Climb-1-Photon-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
