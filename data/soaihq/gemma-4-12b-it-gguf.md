# SoAIHQ/gemma-4-12B-it-GGUF

## Resumen

SoAIHQ/gemma-4-12B-it-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo google/gemma-4-12B-it, preparadas por SoAI para su uso con llama.cpp y con la plataforma propia de SoAI. El modelo base es un transformer denso de 11.907.350.576 parametros (aproximadamente 12B) desarrollado por Google, con una ventana de contexto de 262.144 tokens, razonamiento configurable por peticion y entrada de imagen gracias a un codificador visual unificado. Este repositorio no contiene los pesos originales, sino versiones comprimidas pensadas para ejecucion local.

La relevancia de esta publicacion esta en el proceso de cuantizacion: el archivo Q4_K_M se ha generado con una importance matrix (imatrix) calculada por SoAI sobre un corpus propio de chat multi-turno, ediciones de codigo, llamadas a herramientas y matematicas paso a paso, formateado con la plantilla de chat nativa del modelo. El objetivo es preservar la calidad en los patrones que el modelo ve realmente en produccion, en lugar de calibrar con texto web generico.

El repositorio ofrece dos niveles de cuantizacion (Q4_K_M de 7,4 GB y Q8_0 de 12,7 GB) mas un adaptador mmproj en BF16 de 175,1 MB necesario para la entrada de imagen. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de imagen unificado (dato del autor) |
| Parametros totales | 11.907.350.576 (aproximadamente 12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (con imatrix), Q8_0 (sin imatrix); mmproj en BF16. El autor no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 35+ idiomas segun el autor; preentrenado sobre 140+. La metadata de HuggingFace no los detalla |
| Licencia | Apache-2.0 (el enlace de licencia del autor apunta a los terminos de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), mas un archivo mmproj GGUF BF16 para vision |
| Tamano del repositorio | 20,2 GB |
| Modelo base | google/gemma-4-12B-it |
| Pipeline declarado | any-to-any |
| Creado / actualizado | 2026-09-26 / 2026-09-26 |

Archivos publicados:

| Archivo | Tamano | Calidad declarada | Uso recomendado |
|---|---:|---|---|
| gemma-4-12B-it-Q4_K_M.gguf | 7,4 GB | Alta | Mayoría de equipos |
| gemma-4-12B-it-Q8_0.gguf | 12,7 GB | Casi sin perdida | Cuando la memoria lo permite |
| mmproj-gemma-4-12B-it-bf16.gguf | 175,1 MB | Complemento | Necesario solo para entrada de imagen |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso con un codificador de imagen unificado, segun la informacion publicada por el autor de la cuantizacion. El modelo acepta texto e imagenes, dispone de razonamiento configurable que se activa o desactiva por peticion y soporta llamadas a herramientas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla el mecanismo de atencion ni si se emplean tecnicas como atencion lineal o decodificacion especulativa.

Lo que si se documenta es el proceso de cuantizacion. La version Q4_K_M se genera con una importance matrix que indica a llama.cpp que pesos afectan mas a la salida para almacenarlos con mayor precision. SoAI calcula esa imatrix con un corpus de calibracion propio en lugar de texto web generico, y formatea cada conversacion con la plantilla de chat del modelo, incluida su sintaxis nativa de llamadas a herramientas. El corpus cubre chat multi-turno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas y sus resultados, matematicas paso a paso y prosa web. La Q8_0 se cuantiza sin imatrix porque el formato Q8_0 de llama.cpp no la utiliza.

Antes de publicar, el proceso de construccion verifica que los marcadores de chat, razonamiento y llamadas a herramientas se almacenan como tokens especiales y que la plantilla de chat embebida coincide con la original. Si la conversion importa esos marcadores como texto plano, el build se detiene en lugar de publicar el archivo, ya que eso romperia turnos, razonamiento y tool calls sin mostrar ningun error. El archivo de imatrix se publica en el propio repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat nativa verificada.
- Razonamiento configurable: el modo thinking se activa o desactiva por peticion mediante `chat_template_kwargs` con `enable_thinking`.
- Entrada de imagen: soportada mediante el adaptador mmproj en BF16, cargado con `--mmproj`.
- Entrada de audio: no funcional en este repositorio. El mmproj incluye el codificador de audio del modelo, pero llama.cpp hasta la version v0.5.0 no transcribe audio de forma fiable con el. El autor remite a Gemma 4 E2B y E4B para voz.
- Tool calling / function calling: soportado, con sintaxis nativa de llamadas a herramientas incluida en la calibracion.
- Agentes y razonamiento multi-paso: viable gracias al soporte de tool calling y a la ventana de 256K tokens.
- Multilingue: 35+ idiomas segun el autor, con el modelo preentrenado sobre 140+.
- Codigo: la calibracion cubre ediciones de codigo en 22 lenguajes de programacion.
- Matematicas: el corpus de calibracion incluye matematicas paso a paso.
- Despliegue como API compatible con OpenAI mediante `llama-server`.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historiales largos gracias a los 262.144 tokens de contexto y al soporte de tool calling para consultar sistemas internos (estado de pedidos, incidencias, facturacion) dentro de la misma conversacion.
- Asistente de programacion en produccion: con soporte de function calling y calibracion sobre ediciones de codigo en 22 lenguajes, puede integrarse en pipelines de CI/CD para revisar parches, sugerir correcciones sobre un diff o generar tests a partir de codigo existente.
- Analisis de documentos con imagenes: cargando el mmproj, el modelo puede procesar capturas de pantalla, diagramas, graficos o paginas escaneadas junto a texto de instrucciones, util para extraccion de datos de informes o verificacion de interfaces.
- Agentes multi-paso: la combinacion de tool calling, contexto largo y razonamiento configurable permite construir flujos donde el modelo planifica, invoca herramientas, lee resultados y encadena acciones.
- Razonamiento con coste controlado: al poder activar o desactivar el modo thinking por peticion, es posible usar razonamiento extendido solo en las consultas que lo requieren (calculo, analisis) y desactivarlo en tareas simples para reducir latencia y tokens generados.
- Despliegue local en estaciones de trabajo: con Q4_K_M a 7,4 GB, el modelo cabe en equipos con GPU de gama alta de consumo o incluso con reparto de capas entre CPU y GPU en llama.cpp, lo que permite procesar datos sensibles sin salida a servicios externos.
- Procesamiento de documentacion tecnica extensa: la ventana de 256K permite cargar manuales, expedientes o bases de conocimiento completas en una sola peticion y hacer preguntas sobre el conjunto sin trocear el material.
- Servicio interno con API compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, de modo que herramientas existentes que ya consumen la API de OpenAI pueden apuntar a una instancia local sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han facilitado datos comparativos frente a los pesos originales en BF16.

Los unicos parametros de rendimiento documentados son los de muestreo recomendados, identicos a los de la model card original de Google y aplicables a todas las tareas, con thinking activado o desactivado:

| Modo | temperature | top_p | top_k |
|---|---:|---:|---:|
| Todas las tareas | 1.0 | 0.95 | 64 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los tamanos de archivo publicados, no confirmada por el autor):
  - Q4_K_M (7,4 GB de pesos) mas mmproj (175,1 MB): aproximadamente 9-11 GB de VRAM con contexto moderado. El requisito crece con la longitud de contexto configurada.
  - Q8_0 (12,7 GB de pesos) mas mmproj: aproximadamente 15-17 GB de VRAM con contexto moderado.
- El autor advierte explicitamente de que el modelo necesita memoria tanto para el archivo como para el contexto, y que la parte de contexto crece con la longitud configurada.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, una GPU con 16 GB o mas (por ejemplo, RTX 4080, RTX 4060 Ti de 16 GB) deberia acomodar Q4_K_M; para Q8_0 se requiere una GPU de 24 GB o mas (RTX 3090, RTX 4090) o reparto de capas entre CPU y GPU.
- Cabe en GPU de consumo: si, en el caso de Q4_K_M sobre GPU de 16 GB o mas. Q8_0 necesita 24 GB o desbordamiento a CPU.
- Opciones de despliegue: llama.cpp (validado contra v0.5.0), `llama-server` con interfaz de chat integrada y API compatible con OpenAI, y el ecosistema de llama.cpp en general (por ejemplo, Ollama, que consume GGUF). El modelo esta etiquetado como compatible con endpoints. No se mencionan vLLM, TGI ni otras plataformas en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en ningun hardware.
- El autor recomienda Q4_K_M para la mayoria de equipos y Q8_0 cuando la memoria lo permite.

## Comparativa con modelos similares

La informacion disponible solo permite comparar entre las variantes del propio repositorio y el modelo base. Los datos de parametros, contexto, rendimiento y licencia de las alternativas no estan publicados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Vision | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SoAIHQ/gemma-4-12B-it-GGUF Q4_K_M | ~12B (11,9B) | 262.144 tokens | GGUF Q4_K_M con imatrix (7,4 GB) | Si (mmproj) | No fiable en llama.cpp v0.5.0 | Apache-2.0 segun tag | Publicado en HuggingFace |
| SoAIHQ/gemma-4-12B-it-GGUF Q8_0 | ~12B (11,9B) | 262.144 tokens | GGUF Q8_0 sin imatrix (12,7 GB) | Si (mmproj) | No fiable en llama.cpp v0.5.0 | Apache-2.0 segun tag | Publicado en HuggingFace |
| google/gemma-4-12B-it (base) | ~12B | 262.144 tokens | Pesos originales en 16 bits | Si | No disponible | Terminos de Gemma 4 de Google | Publicado en HuggingFace |
| SoAIHQ/gemma-4-E2B-it-GGUF | No disponible | No disponible | GGUF | No disponible | Si, maneja voz | No disponible | Publicado en HuggingFace |
| SoAIHQ/gemma-4-E4B-it-GGUF | No disponible | No disponible | GGUF | No disponible | Si, maneja voz | No disponible | Publicado en HuggingFace |

Nota: la comparativa frente a modelos de otros fabricantes de tamano similar no puede elaborarse con la informacion proporcionada.

## Limitaciones y advertencias

- Audio no operativo: aunque el mmproj incluye el codificador de audio, llama.cpp hasta v0.5.0 no transcribe audio de forma fiable con el. Para voz, el autor remite a las variantes E2B y E4B.
- Perdida por cuantizacion: Q4_K_M reduce los pesos a aproximadamente un tercio del tamano original en 16 bits. El autor afirma que mantiene una calidad cercana, pero no aporta mediciones que lo cuantifiquen. Q8_0 es la opcion mas fiel, sin imatrix.
- Sin cuantizaciones por debajo de 4 bits: el autor declara que no las publica porque la perdida de calidad rara vez compensa el ahorro de espacio. No hay opciones para equipos con menos de aproximadamente 7 GB disponibles.
- Ambiguedad de licencia: el tag del repositorio indica Apache-2.0, pero el enlace de licencia del autor apunta a los terminos de Gemma 4 de Google. Conviene verificar las condiciones reales de uso comercial antes de desplegar en produccion, ya que los terminos de Gemma suelen incluir una politica de uso aceptable y obligaciones adicionales.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible. Al ser una cuantizacion de un modelo preentrenado sobre 140+ idiomas, cabe esperar los sesgos del modelo base, pero no hay datos que los caractericen.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. El modelo no incluye mecanismos de citacion o grounding documentados.
- Limitaciones de contexto: la ventana es de 262.144 tokens, pero el consumo de memoria crece con la longitud de contexto configurada. Ademas, el rendimiento en contextos muy largos no esta medido en la informacion disponible.
- Idiomas: se declaran 35+ idiomas soportados y 140+ en el preentrenamiento, pero no hay una lista detallada ni evaluaciones por idioma. La calibracion de la imatrix cubre 21 idiomas, lo que no garantiza un comportamiento uniforme en el resto.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.
- Dependencia de version: el correcto funcionamiento de imagen y de marcadores especiales esta ligado al soporte de llama.cpp; se referencia la version v0.5.0. Versiones anteriores podrian no manejar correctamente los tokens especiales o el mmproj.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoAIHQ/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia referenciada por el autor (terminos de Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor de la cuantizacion (SoAI): https://soai.to
- Cuantizaciones relacionadas: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF
- Cuantizaciones relacionadas: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF
- Archivo Q4_K_M: https://huggingface.co/SoAIHQ/gemma-4-12B-it-GGUF/resolve/main/gemma-4-12B-it-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/SoAIHQ/gemma-4-12B-it-GGUF/resolve/main/gemma-4-12B-it-Q8_0.gguf
- Adaptador mmproj (BF16): https://huggingface.co/SoAIHQ/gemma-4-12B-it-GGUF/resolve/main/mmproj-gemma-4-12B-it-bf16.gguf
