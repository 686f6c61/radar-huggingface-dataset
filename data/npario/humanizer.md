# npario/humanizer

## Resumen

humanizer es un ajuste fino (finetune) de 12B parámetros construido sobre google/gemma-4-12B y orientado a una tarea muy concreta: reescribir borradores generados por IA (correos, ensayos, informes, respuestas de foro) para que se lean como escritos por una persona. Lo publica el usuario npario en HuggingFace, con pesos en safetensors (bf16) y en GGUF para llama.cpp, y con licencia declarada apache-2.0. El modelo se distribuye junto a una aplicación de escritorio (macOS Apple silicon y Windows x64) y una CLI que permiten ejecutarlo en local sin conexión.

Su relevancia no está en el tamaño ni en capacidades generalistas, sino en el enfoque de producto: reescritura de estilo con preservación estricta de hechos. El autor afirma que el modelo está entrenado para conservar cada número, unidad, fecha, nombre y cita, y para no añadir información nueva. En la evaluación publicada, el 95% de las reescrituras en inglés (199 de 210) fueron clasificadas como humanas por Originality.ai en su ajuste más estricto, y 376 de 420 reescrituras en inglés no presentaron ningún problema factual según un juez LLM estricto.

El modelo cubre inglés y chino, y las etiquetas del repositorio incluyen `gemma4_unified` e `image-text-to-text`, lo que apunta a que el modelo base es multimodal, aunque la información disponible no detalla esa parte. El repositorio ocupa 87,6 GB y el recuento real de parámetros en safetensors es de 11.959.730.224 (~11,96B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-12B; etiquetas `gemma4_unified` e `image-text-to-text`, sin detalle de arquitectura en la informacion disponible) |
| Parametros totales | 11.959.730.224 (~11,96B, dato real de safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 2-bit, Q3, Q4_K_M, Q6_K y Q8_0; safetensors en bf16 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 (declarada en el repositorio; el modelo base puede tener sus propios terminos) |
| Formato de pesos | safetensors (bf16) y GGUF (llama.cpp) |
| Tamano del repositorio | 87,6 GB |
| Tarea declarada | text-generation (con etiquetas de text-rewriting, paraphrase y style-transfer) |
| Modelo base | google/gemma-4-12B (relacion: finetune) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

No hay detalle publicado en la informacion disponible sobre la arquitectura interna del modelo base ni sobre el numero de tokens o la composicion exacta del dataset de ajuste. Lo que si se documenta es que se trata de un finetune de google/gemma-4-12B especializado en reescritura de estilo, y que las etiquetas `gemma4_unified` e `image-text-to-text` sugieren que la familia base incorpora tratamiento conjunto de imagen y texto; el ajuste fino de humanizer, en cambio, se describe exclusivamente como reescritura de texto.

El aspecto tecnico mas destacable es el proceso de cuantizacion. Los ficheros de 2 bits, Q3 y Q4_K_M no son el resultado de una unica pasada de `llama-quantize`: el autor midio la sensibilidad de cada tensor de pesos y asigno mas bits a los tensores sensibles y menos a los robustos, aplico entrenamiento consciente de cuantizacion capa por capa para reproducir el modelo completo y destilo desde el modelo bf16 utilizado como profesor, con datos de reescritura en ingles y chino. Segun la model card, un fichero estandar del mismo tamano (2 bits, ~3,9 GB) coincide con bf16 en el siguiente token el 70% de las veces, frente al 87% del fichero publicado, con pasos intermedios de 81% y 85%. Los ficheros Q6_K y Q8_0 son cuantizaciones estandar de llama.cpp. No se menciona uso de RLHF ni de DPO, ni el empleo de detectores de IA durante el entrenamiento (el autor afirma explicitamente que no se uso ninguno).

## Capacidades

- Reescritura de estilo de textos generados por IA para correos, ensayos, informes y publicaciones de foro, en ingles y chino.
- Preservacion de hechos: el modelo esta entrenado para mantener numeros, unidades, fechas, nombres y citas, y para no introducir contenido nuevo.
- Procesamiento de documentos largos por partes mediante la CLI, conservando encabezados, bloques de codigo, tablas y enlaces.
- Importacion de `.docx` y PDF en la aplicacion de escritorio, ademas de formatos `.md` y `.txt` en la CLI.
- Funcion "Create fact" en la app, que conserva palabra por palabra cualquier pasaje marcado por el usuario.
- Ejecucion local y offline, tanto en la app como en `llama-server`.
- Integracion con agentes de codigo mediante el fichero AGENTS.md, que documenta ficheros exactos, comando de servidor, prompt literal y una autoprueba.
- Soporte de flujo conversacional (etiqueta `conversational` en el repositorio).
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Vision, audio o modo de razonamiento explicito: no disponible (aunque el modelo base aparece etiquetado como `image-text-to-text`, no se documentan capacidades multimodales en el ajuste).

## Casos de uso

- Reescritura de comunicaciones internas: un equipo genera un borrador de correo con un LLM y lo pasa por humanizer para que el texto final no suene a plantilla y conserve intactos importes, plazos y nombres de personas.
- Adaptacion de informes tecnicos o academicos: la CLI procesa ficheros `.md` o `.docx` largos troceando la prosa y preservando encabezados, tablas, codigo y enlaces, lo que permite humanizar un documento completo sin reconstruirlo a mano.
- Publicacion en comunidades en chino: el modelo soporta `zh` de forma nativa, por lo que sirve para humanizar respuestas generadas para plataformas como Zhihu manteniendo el registro del idioma.
- Redaccion asistida en local con requisitos de privacidad: al ejecutarse offline, permite tratar contratos, correos o documentacion interna sin enviar el contenido a un servicio en la nube.
- Preprocesado en pipelines editoriales: integrado via `llama-server` o mediante la CLI, se puede insertar como paso de post-procesado entre la generacion automatica de un borrador y su revision humana.
- Generacion de contenido de marketing con control factual: al no anadir datos nuevos y conservar cifras y nombres, reduce el riesgo de que un texto promocional invente especificaciones de producto.
- Uso por parte de agentes de codigo: el repositorio incluye AGENTS.md con el prompt exacto y un autotest, de modo que un agente puede configurar el servidor y validar la instalacion de forma autonoma.
- Aplicacion de escritorio para usuarios no tecnicos: la app para macOS y Windows importa documentos, sugiere automaticamente el tamano de cuantizacion segun la memoria del equipo y funciona sin conexion tras la primera descarga.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia / contexto |
|---|---|---|
| Reescrituras en ingles juzgadas como humanas por Originality.ai (ajuste mas estricto) | 199 de 210 (95%) | Pesos bf16, fecha 2026-10-02; 11 marcadas como IA |
| Reescrituras en ingles juzgadas como humanas, version anterior | 184 de 210 (86,4%) | Dato derivado: la version anterior registro 26 marcadas como IA |
| Reescrituras en ingles sin problema factual segun juez LLM estricto | 376 de 420 (89,5%) | Medido sobre el fichero `humanizer-12b-Q8_0.gguf`; la version anterior obtuvo 369 de 420 |
| Problemas detectados por el juez en el conjunto completo en ingles | 44 de 420 reescrituras marcadas; 135 problemas en total, 125 de ellos una sola palabra o frase | Model card, seccion de ejemplos |
| Coincidencia top-1 con bf16, fichero de 2 bits (~3,9 GB) | 87% | Cuantizacion estandar del mismo tamano: 70%; pasos intermedios: 81% y 85% |
| Coincidencia top-1 con bf16, ficheros Q3 y Q4_K_M | no disponible | La grafica de la model card los situa por encima de la cuantizacion estandar, sin cifras publicadas en el texto |
| Resultados en chino | no disponible en el texto extraido | La model card remite a la seccion "Evaluation details" |
| MMLU, HumanEval, GSM8K y similares | no disponible | No se han publicado resultados de benchmarks generalistas en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 11,96B parametros; el unico tamano confirmado por el autor es el fichero de 2 bits, ~3,9 GB):
  - bf16: en torno a 24 GB.
  - Q8_0: en torno a 13 GB.
  - Q6_K: en torno a 10 GB.
  - Q4_K_M: en torno a 7,5 GB.
  - Q3: en torno a 5,5 GB.
  - 2 bits: ~3,9 GB (dato indicado en la model card).
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en tarjetas con 8-12 GB de VRAM. La aplicacion esta disenada para equipos con 8 GB de memoria o mas, y sugiere automaticamente uno de los cinco tamanos segun la memoria disponible.
- GPU recomendadas: no disponibles de forma explicita. Para bf16 se necesita una GPU de gama alta o profesional con al menos 24 GB (A100 40/80 GB, H100, RTX 3090/4090 con holgura limitada). Para GGUF cuantizado, cualquier GPU moderna con 8 GB o mas, o incluso CPU.
- Apple silicon: es una plataforma soportada de forma prioritaria (instalador `.dmg` para arm64).
- Opciones de despliegue: llama.cpp y `llama-server`, la app oficial de escritorio (macOS arm64 y Windows x64), y la CLI instalable con `pipx install git+https://github.com/sgaofen/humanizer-local-model`. No se menciona soporte para vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| humanizer (npario) | ~11,96B | no disponible | Reescritura de estilo con preservacion factual, en y zh | apache-2.0 (declarada) | HuggingFace, GGUF en repo aparte, app y CLI |
| google/gemma-4-12B (modelo base) | no disponible (el ajuste deriva de el) | no disponible | Modelo generalista multimodal | no disponible | HuggingFace (segun la model card) |
| Alternativas especificas de humanizacion o reescritura del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de reescritura o de proposito general en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Riesgo de error factual: en la evaluacion del propio autor, 44 de 420 reescrituras en ingles recibieron alguna marca del juez; aunque la mayoria de los problemas (125 de 135) son una sola palabra o frase, se recomienda revisar el resultado antes de enviarlo, en especial numeros, fechas y nombres.
- Los ejemplos publicados en la model card son selecciones entre 8 muestras generadas por borrador, escogidas entre las que pasaron el juez factual. No son una muestra aleatoria y no deben leerse como el comportamiento medio del modelo.
- Cobertura idiomatica limitada: solo ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto no publicada: no es posible planificar cargas de documentos largos sin consultar la documentacion del autor.
- Licencia: el repositorio declara apache-2.0, pero al ser un finetune de google/gemma-4-12B conviene verificar los terminos del modelo base antes de un uso comercial, ya que pueden imponer condiciones adicionales.
- Coherencia de nombres: el modelo se publica bajo el espacio `npario`, mientras que los enlaces de la model card apuntan a `github.com/sgaofen/humanizer-local-model` y los GGUF a `jialinyyzz/humanizer-GGUF`. Conviene confirmar que todos ellos corresponden al mismo proyecto.
- Sin traccion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad que haya validado de forma independiente los resultados declarados.
- No se documentan capacidades de tool calling, agentes con razonamiento multi-paso ni modo de razonamiento explicito; no conviene asumirlas.
- Las estimaciones de VRAM para cuantizaciones distintas de la de 2 bits son calculos a partir del numero de parametros y no cifras publicadas por el autor.
- Los resultados de evaluacion proceden del propio autor del modelo; no se ha localizado validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npario/humanizer
- Ficheros GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Repositorio GitHub: https://github.com/sgaofen/humanizer-local-model
- Instrucciones de uso sin la app: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Instrucciones de uso sin la app (chino): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Guia para agentes de codigo: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Guia de instalacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Detalles de cuantizacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Ejemplos de evaluacion (8 muestras por borrador, JSON): https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- App macOS (Apple silicon): https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- App Windows x64: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
- Ultima version publicada: https://github.com/sgaofen/humanizer-local-model/releases/latest
- Modelo base: https://huggingface.co/google/gemma-4-12B (referenciado en la model card)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos no guardan relacion con el proyecto y se han descartado.
