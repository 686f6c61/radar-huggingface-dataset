# OpenWhispr/openwhispr-cleanup-0.8b-GGUF

## Resumen

OpenWhispr Cleanup 0.8B es un modelo de lenguaje pequeno especializado en la limpieza de texto dictado. Lo desarrolla OpenWhispr, el equipo de la aplicacion de dictado del mismo nombre, y su funcion es transformar una transcripcion de voz en bruto en texto escrito correcto: elimina muletillas y arranques en falso, aplica autocorrecciones habladas ("strike that", "I mean"), convierte numeros y signos de puntuacion, formatea listas y respeta el diccionario personal y las lineas de tono configuradas por el usuario. No responde ni actua sobre el contenido dictado, solo lo reescribe.

El modelo parte de Qwen/Qwen3.5-0.8B, sobre el que se aplico un ajuste fino con LoRA (posteriormente fusionado) y una conversion a GGUF mediante llama.cpp. Con 752.393.024 parametros reales (segun los safetensors del modelo base) y un unico fichero Q8_0 de 811.843.616 bytes, esta disenado para ejecutarse integramente en local, sin enviar audio ni texto a ningun servidor.

Su relevancia actual radica en el nicho: los asistentes de dictado suelen depender de la nube para el postprocesado del texto, y este modelo demuestra que una tarea acotada y bien definida puede resolverse con menos de mil millones de parametros en el dispositivo del usuario, con una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B), ajuste fino con LoRA fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en v1) |
| Idiomas soportados | en (ingles); otros idiomas pasan la misma instruccion pero con evaluacion mucho menor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decoder-only del Qwen3.5-0.8B original. Sobre esa base se aplico un ajuste fino supervisado con LoRA, cuyos adaptadores se fusionaron en los pesos finales antes de la conversion a GGUF. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra etapa de alineacion adicional; el entrenamiento descrito es puramente de imitacion sobre pares entrada-salida de limpieza de dictado.

El conjunto de entrenamiento consta de aproximadamente 9.900 filas construidas a partir de cuatro fuentes: el *Dictation cleanup dataset* de Abhishek Barali (CC BY 4.0), *Disfl-QA* de Google Research (CC BY 4.0, derivado de SQuAD 2.0), la columna de texto de *DisfluencySpeech* del AMAAI Lab (Apache 2.0) y entradas generadas por programa con muletillas, correcciones, numeros hablados y puntuacion. Las respuestas fueron reescritas por Claude (Anthropic) bajo una instruccion fija y verificadas programaticamente. No se utilizaron datos de usuarios de OpenWhispr. La innovacion tecnica destacable no esta en la arquitectura sino en el diseno de la tarea: el modelo se entrena con una forma de prompt exacta (sistema con instruccion fija, linea de idioma, diccionario y tono; usuario con el transcript entre etiquetas `<transcript>`) y con decodificacion a temperatura 0 y razonamiento desactivado, de modo que cualquier otra forma de prompt degrada el resultado.

## Capacidades

- Limpieza de transcripciones dictadas: eliminacion de muletillas, repeticiones y arranques en falso.
- Aplicacion de autocorrecciones habladas del tipo "strike that" o "I mean", sustituyendo el fragmento erroneo por el corregido.
- Normalizacion de numeros hablados a cifras y de la puntuacion implicita en el habla.
- Formateo de listas y estructurado basico del texto dictado.
- Respeto del diccionario personalizado y del diccionario compartido de equipo, asi como de las lineas de tono definidas por la aplicacion.
- Manejo de comandos hablados para correo electronico y codigo, segun el conjunto de pruebas de "nuevas habilidades".
- Procesamiento por fragmentos: las dictaciones de mas de 600 palabras se dividen en fronteras de frase y se limpian por partes.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un asistente general.
- Capacidad multilingue muy limitada: solo el ingles esta evaluado de forma sustantiva.

## Casos de uso

- Postprocesado local en aplicaciones de dictado: el modelo se integra en el cliente (OpenWhispr lo descarga desde este repositorio y lo ejecuta con llama.cpp) para convertir la salida cruda del reconocimiento de voz en texto publicable sin salir del dispositivo, lo que elimina requisitos de privacidad y costes de inferencia en la nube.
- Notas de reunion y actas: tras una reunion transcrita, el modelo elimina titubeos y autocorrecciones y aplica puntuacion, dejando un texto legible para archivar o compartir; su tamano permite ejecutarlo en el portatil del propio asistente.
- Dictado de correos electronicos: el modelo reconoce comandos hablados de correo y formatea el cuerpo del mensaje, respetando el tono configurado (formal, cercano, etc.) mediante las lineas de tono del sistema.
- Documentacion tecnica dictada: con el diccionario personalizado cargado, preserva nombres de API, identificadores y terminos de dominio que el reconocimiento de voz podria haber deformado, y aplica comandos de codigo hablados.
- Accesibilidad y dictado asistido: usuarios con movilidad reducida que redactan por voz obtienen texto limpio y con puntuacion sin necesidad de conexion, gracias a los 812 MB del fichero Q8_0.
- Preprocesado en pipelines de datos: como etapa barata de normalizacion de transcripciones antes de alimentar un modelo mayor (resumen, extraccion de acciones), reduciendo ruido de disfluencias con un coste de computo minimo.
- Integracion en herramientas de linea de comandos: mediante `llama-server` con `--jinja --reasoning-budget 0 --temp 0`, se puede exponer como endpoint local compatible con la API de chat para editores de texto o IDE.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las tasas de acierto sobre sus conjuntos internos de prueba, medidos en un Mac con llama.cpp b12110:

| Conjunto de evaluacion | Filas | Tasa de acierto |
|---|---|---|
| Dictation-cleanup test set v2 (congelado) | 1.938 | 70,6% |
| Nuevas habilidades (diccionario, tono, correos, listas, "strike that", comandos de codigo) | 530 | 81,5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1,2 GB con el fichero Q8_0 de 812 MB, incluyendo el contexto y el overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; tambien funciona correctamente en CPU, dado el reducido numero de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090, Apple Silicon con Metal, iGPU con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`), Ollama y cualquier runtime compatible con GGUF; el autor documenta explicitamente `llama-server -m openwhispr-cleanup-0.8b-v1-Q8_0.gguf --jinja --reasoning-budget 0 --temp 0`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que la evaluacion se realizo en un Mac con llama.cpp b12110.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. Cualitativamente:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWhispr Cleanup 0.8B | 752 M | no disponible | Limpieza de dictado especializada | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Modelos de limpieza de texto genericos (p. ej. variantes de 1-3 B ajustadas para reescritura) | 1-3 B | variable | Reescritura general | variable | variable |

La ventaja diferencial frente a un modelo generalista del mismo tamano es el ajuste a una forma de prompt concreta y a la tarea de limpieza, con un 70,6% y un 81,5% de acierto en los conjuntos del autor; la desventaja es que cualquier uso fuera de esa tarea produce resultados degradados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para devolver la transcripcion limpia; no debe usarse como asistente conversacional, y hacerlo produce salidas incorrectas.
- Idioma: el ingles es el unico evaluado de forma sustantiva; otros idiomas pasan la misma instruccion pero con una calidad mucho menor.
- Riesgo de alteracion de cifras: el autor advierte que puede cambiar un numero ocasionalmente (por ejemplo, "125" a "120.5"), sobre todo en dictaciones muy largas; se recomienda dividir la entrada en fragmentos de menos de 600 palabras en fronteras de frase.
- La forma del prompt es critica: desviarse del formato del sistema (instruccion fija, linea de idioma, diccionario y tono) y de la decodificacion (temperatura 0, razonamiento desactivado) degrada el rendimiento.
- Riesgo de alucinacion acotado pero presente: al ser un modelo de reescritura, puede introducir cambios no solicitados en el texto, especialmente en entradas largas o ambiguas.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre corpus academicos (Disfl-QA, DisfluencySpeech) y datos sinteticos, puede heredar los sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribucion; las fuentes de datos de entrenamiento tienen sus propias licencias (CC BY 4.0 y Apache 2.0) que exigen atribucion.
- Para produccion: conviene validar la tasa de acierto sobre el dominio concreto del despliegue, dado que los conjuntos de evaluacion son internos del autor y no replicables publicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenWhispr/openwhispr-cleanup-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la aplicacion OpenWhispr: https://github.com/OpenWhispr/openwhispr
- Sitio web de OpenWhispr: https://openwhispr.com
- Dictation cleanup dataset (Abhishek Barali): https://github.com/AbhishekBarali/dictation-cleanup-dataset
- Disfl-QA (Google Research): https://github.com/google-research-datasets/Disfl-QA
- DisfluencySpeech (AMAAI Lab): https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
