# mie-edu/child-gemma4-e2b-v5-vision-gguf

## Resumen

`child-gemma4-e2b-v5-vision-gguf` es un ajuste fino del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por `mie-edu` con fines educativos para el sistema escolar japonés. Su función concreta es doble: leer texto impreso a partir de una fotografía (por ejemplo, un boletín de clase o una hoja de ejercicios) y reescribir ese texto limitando el vocabulario a los kanji que corresponden a un curso determinado (3.º a 6.º de primaria). El repositorio empaqueta el modelo base ajustado en formato GGUF junto con el proyector multimodal (`mmproj`) del modelo original, de modo que todo el pipeline se ejecuta con `llama.cpp` en local.

El ajuste se aplica únicamente sobre la parte lingüística: el codificador visual es el `mmproj` original de Gemma 4 E2B-it, redistribuido desde la conversión GGUF de `ggml-org`. El cuerpo del modelo tiene 4.628.569.635 parámetros y se distribuye en cuantizaciones Q6_K (unos 3,6 GB), Q8_0 y F16, más el proyector visual en Q8_0 (0,56 GB). El repositorio completo ocupa 36,7 GB e incluye además gramáticas GBNF por curso y utilidades de investigación.

Es relevante ahora por dos motivos: demuestra un caso de uso muy verticalizado (adaptación de material escolar por nivel de kanji) sobre un modelo pequeño que cabe en hardware de consumo, y documenta con transparencia una degradación medible del OCR respecto al modelo original, algo poco habitual en model cards de ajustes finos. La contrapartida es que solo trabaja en japonés, no se ha entrenado para la tarea conjunta de "imagen → reescritura" y requiere un flujo de dos pasos con verificación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje + proyector visual `mmproj`); detalles de capas y atención no disponibles |
| Parametros totales | 4.628.569.635 (4,63 B) |
| Parametros activos | No disponible; la informacion proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible; el ejemplo de la model card arranca `llama-server` con `-c 4096` |
| Tipos de cuantizacion | GGUF Q6_K (recomendada), Q8_0, F16; `mmproj` en Q8_0 |
| Idiomas soportados | Japones (`ja`) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | google/gemma-4-E2B-it |
| Variante solo texto | mie-edu/child-gemma4-e2b-v5-gguf |
| Tamano del repositorio | 36,7 GB (incluye codigo, gramaticas y evaluacion) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal con un codificador de imagen conectado al decodificador de lenguaje mediante un proyector (`mmproj`). El ajuste de `mie-edu` modifica solo los pesos del decodificador: el proyector visual se reutiliza tal cual, en su conversion GGUF Q8_0 publicada por `ggml-org`, y se distribuye junto al modelo para habilitar la entrada de imagenes en `llama-server` y en apps moviles compatibles.

El entrenamiento descrito en la model card combina una fase de SFT seguida de DPO; el repositorio publica ambas variantes (`child-gemma4-v5-*-dpo-*` y `child-gemma4-v5-*` sin DPO) para permitir comparaciones. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros. La model card advierte explicitamente de que el modelo no ha visto ejemplos de la tarea completa "imagen → reescritura por curso": el ajuste cubre la reescritura con kanji de un curso concreto, mientras que la lectura de imagen proviene del modelo base. De ahi el flujo en dos etapas que recomienda el autor y la inclusion de gramaticas GBNF (`grammar_g3.gbnf` a `grammar_g6.gbnf`) para restringir la decodificacion al repertorio de kanji de cada curso.

## Capacidades

- Generacion de texto en japones orientada a reescritura por nivel escolar, sustituyendo kanji fuera del curso indicado.
- Lectura de texto impreso a partir de imagenes (image-to-text) usando el proyector visual del modelo base.
- Instrucciones de nivel en lenguaje natural, por ejemplo "小学4年生向けに書き直してください" (reescribe para 4.º de primaria).
- Decodificacion restringida mediante gramaticas GBNF por curso (3.º a 6.º de primaria).
- Uso via API compatible con OpenAI en `llama-server`, incluyendo el campo `image_url` para enviar imagenes.
- Inferencia local en CPU con llama.cpp y en dispositivos moviles mediante PocketPal AI, Off Grid y Enclave.
- Soporte de `--reasoning-budget 0` en llama.cpp, es decir, modo sin razonamiento intermedio expuesto.
- No disponible: tool calling, function calling, capacidades de agente, audio, ni soporte multilingue fuera del japones.

## Casos de uso

- **Adaptacion de boletines escolares al curso del alumnado**: el flujo documentado consiste en fotografiar el boletin, extraer el texto con el modelo y reescribirlo despues indicando el curso destino, de modo que los kanji fuera de nivel se sustituyan por alternativas del repertorio del curso. Es el caso de uso principal del ajuste.
- **Digitalizacion de material impreso para repositorios docentes**: el modelo permite convertir hojas de ejercicios y comunicados en texto editable sin depender de servicios en la nube, algo relevante para centros con requisitos de privacidad sobre datos de menores.
- **Generacion de material didactico con kanji controlado**: con las gramaticas GBNF incluidas, el modelo puede producir o adaptar textos limitando la decodificacion a los kanji de un curso concreto, util para preparar lecturas graduadas por nivel.
- **Asistencia a alumnado con dificultades de lectura de kanji**: reescritura de enunciados de examenes o apuntes a un nivel de kanji inferior, manteniendo el contenido, como apoyo dentro del aula.
- **Aplicacion movil offline para familias**: al distribuirse en GGUF con `mmproj`, el modelo se puede cargar en PocketPal AI u Off Grid en el propio dispositivo; el autor advierte de que la viabilidad en iPhone de 8 GB de RAM requiere verificacion en dispositivo real.
- **Investigacion educativa y evaluacion de OCR**: el repositorio incluye `eval/ocr_check.py` y un conjunto de 25 imagenes de boletines escolares, lo que permite reproducir la evaluacion de tasa de error de caracteres y comparar variantes con y sin DPO.
- **Auditoria de legibilidad de documentos del centro**: medir de forma automatica cuantos kanji de un documento quedan fuera del curso objetivo antes de distribuirlo a las familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La unica evaluacion publicada es la de lectura de imagen (OCR) sobre 25 boletines escolares convertidos en imagen, ejecutando llama.cpp en CPU:

| Condicion | Texto completo leido | Tasa de error de caracteres (mediana) | Tasa de error <= 5% | Conservacion de numeros y fechas |
|---|---|---|---|---|
| Impresion limpia | 25 / 25 | 0,050 | 13 / 25 | 25 / 25 |
| Foto de movil (inclinacion, sombras, desenfoque) | 25 / 25 | 0,039 | 16 / 25 | 24 / 25 |

Referencia incluida por el autor: el modelo base Gemma 4 E2B-it obtiene una tasa de error de caracteres de aproximadamente 0,02 sobre las mismas imagenes, es decir, el ajuste linguistico degrada la lectura. Los errores se concentran en kanji poco frecuentes (por ejemplo, confusiones del tipo 懸命 → 熱心 o 欠席 → 次席); los digitos y fechas se conservan casi siempre.

## Requisitos de hardware

- VRAM estimada para inferencia: el cuerpo en Q6_K ocupa unos 3,6 GB y el `mmproj` en Q8_0 unos 0,56 GB, lo que suma aproximadamente 4,2 GB de pesos; con cache KV a 4096 tokens hay que prever del orden de 5 a 6 GB (estimacion a partir de los tamanos de fichero, no publicada por el autor).
- Cuantizaciones mas ligeras: Q8_0 y F16 aumentan el consumo de forma proporcional; la model card recomienda Q6_K como opcion por defecto.
- GPU de consumo: cabe en tarjetas de 8 GB o mas (RTX 3060 8 GB, RTX 4060, RTX 3070, RX 7600). El autor ejecuto la evaluacion en CPU, lo que confirma viabilidad sin GPU, con mas latencia.
- GPU de datacenter: A100, H100 o L40S no son necesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes.
- Despliegue: `llama.cpp` / `llama-server` (API compatible con OpenAI), y apps moviles PocketPal AI, Off Grid y Enclave. El autor menciona que la viabilidad en iPhone con 8 GB de RAM requiere prueba en dispositivo real. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La model card solo indica que la evaluacion OCR se hizo sobre CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mie-edu/child-gemma4-e2b-v5-vision-gguf | 4,63 B | no disponible | Si (`mmproj` Q8_0) | Japones | Gemma Terms of Use | GGUF en HuggingFace; 0 descargas |
| mie-edu/child-gemma4-e2b-v5-gguf (variante solo texto) | 4,63 B (mismo cuerpo) | no disponible | No | Japones | Gemma Terms of Use | GGUF; ahorra los 0,56 GB del `mmproj` |
| google/gemma-4-E2B-it (modelo base) | no disponible en la informacion (mismo orden, ~4,6 B) | no disponible | Si | Multiple, incluido japones | Gemma Terms of Use | Pesos originales y conversion GGUF de `ggml-org` |
| ggml-org/gemma-4-E2B-it-GGUF | igual al base | no disponible | Si (via `mmproj`) | Multiple | Gemma Terms of Use | GGUF; origen del proyector visual |

Frente al modelo base, este ajuste gana en la tarea especifica de reescritura con kanji por curso y pierde calidad de OCR (0,050 frente a 0,02 de tasa de error de caracteres en impresion limpia). Frente a la variante solo texto, la unica diferencia es la inclusion del proyector visual y el espacio adicional que ocupa.

## Limitaciones y advertencias

- Solo japones: no hay soporte documentado de otros idiomas, ni siquiera del ingles presente en el modelo base.
- El OCR es peor que el del modelo base (0,050 de mediana en impresion limpia frente a 0,02), por el ajuste sobre la parte linguistica.
- Errores frecuentes en kanji poco habituales; los numeros y fechas se conservan casi siempre, pero el autor recomienda revision humana del texto extraido antes de pasarlo a la segunda etapa.
- Tendencia a detenerse tras leer solo la linea del titulo; hay que reinyectar lo leido como prefijo del turno del asistente para forzar la continuacion del cuerpo del texto.
- Riesgo de bucles de repeticion en los saltos de linea; si aparece una cadena repetida, conviene cortar y repetir la captura.
- No ha sido entrenado para la tarea completa "imagen → reescritura": el pipeline en dos etapas es obligatorio en la practica.
- Riesgo de alucinacion en la fase de reescritura: al sustituir kanji por alternativas del curso puede alterar el significado si el contexto no es suficiente.
- Licencia Gemma Terms of Use: revise las clausulas de uso comercial y de redistribucion antes de integrarlo en un producto; el `mmproj` redistribuido por `ggml-org` queda sujeta a las mismas condiciones.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay validacion independiente fuera de la evaluacion del propio autor, hecha sobre 25 imagenes y en CPU.
- No hay datos publicados sobre sesgos, contexto maximo real ni comportamiento con documentos manuscritos o de baja calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mie-edu/child-gemma4-e2b-v5-vision-gguf
- Variante solo texto: https://huggingface.co/mie-edu/child-gemma4-e2b-v5-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Conversion GGUF del modelo base (origen del `mmproj`): https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms

Nota: las busquedas web realizadas no devolvieron resultados relacionados con este modelo (los resultados obtenidos corresponden a entidades no vinculadas: una mutua francesa y una empresa sudafricana de verificacion de antecedentes). No se dispone de paper, blog ni demo adicionales.
